import { GoogleGenAI } from '@google/genai'
import * as XLSX from 'xlsx'

export const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const MODEL = 'gemini-3.6-flash'

async function generateWithRetry(
  params: Parameters<typeof genAI.models.generateContent>[0],
  maxRetries = 3,
): ReturnType<typeof genAI.models.generateContent> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await genAI.models.generateContent(params)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const is429 = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')
      const retryMatch = msg.match(/retry.*?(\d+)s/i)
      const waitSec = retryMatch ? parseInt(retryMatch[1]) + 2 : 20

      if (is429 && attempt < maxRetries) {
        console.warn(`[gemini] 429 rate-limited — aguardando ${waitSec}s (tentativa ${attempt + 1}/${maxRetries})`)
        await new Promise(r => setTimeout(r, waitSec * 1000))
        continue
      }
      throw err
    }
  }
  throw new Error('Gemini: máximo de retentativas atingido')
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ExtractedItem {
  descricao: string
  part_number: string | null
  quantidade: number
  unidade: string
  peso_kg: number | null
  valor_fob_usd: number
  ncm_declarado: string | null
}

export interface ExtractionResult {
  items: ExtractedItem[]
  origem_pais: string | null
  /** @deprecated use origem_pais */
  origem?: string | null
  moeda_origem: string
  modal: string | null
  incoterm: string | null
  recinto_alfandegario: string | null
  estado_desembaraco: string | null
  total_fob: number
}

export interface ClassificationResult {
  ncm: string
  confianca: number
  fundamentacao: string
  descricao_di: string
  risco: 'Baixo' | 'Médio' | 'Alto'
}

// ─── Extraction ─────────────────────────────────────────────────────────────

const EXTRACTION_PROMPT = `Você é um especialista em comércio exterior brasileiro.
Analise este documento de importação (invoice, packing list, conhecimento de embarque ou B/L) e extraia todas as informações relevantes.

REGRA CRÍTICA SOBRE ITENS:
- Extraia CADA linha de produto da invoice como um item SEPARADO no array "items"
- NUNCA consolide, agrupe ou mescle múltiplas linhas em um único item
- Mesmo que produtos sejam similares (ex: vários modelos de conexões de cobre), cada linha deve virar um item distinto
- Se a invoice tiver 15 linhas de produto → o array "items" deve ter exatamente 15 elementos
- Se a invoice tiver uma tabela com colunas Item/Description/Quantity/Price → cada linha da tabela é um item separado
- Preserve os valores originais de cada linha (quantidade, preço unitário, total) — não some nem divida

Retorne EXCLUSIVAMENTE um JSON válido no formato abaixo — sem markdown, sem comentários:
{
  "items": [
    {
      "descricao": "descrição comercial completa do produto em português",
      "part_number": "número de peça ou modelo (null se ausente)",
      "quantidade": 1,
      "unidade": "UN",
      "peso_kg": null,
      "valor_fob_usd": 0.0,
      "ncm_declarado": "código NCM/HS declarado no documento (null se ausente)"
    }
  ],
  "origem_pais": "país de origem ou fabricação (null se não identificado)",
  "moeda_origem": "código ISO 4217 da moeda da fatura (ex: USD, EUR, CNY — padrão USD se não identificado)",
  "modal": "modal de transporte: Marítimo, Aéreo ou Rodoviário (null se não identificado)",
  "incoterm": "termo Incoterm declarado no documento (ex: FOB, CIF, EXW — null se ausente)",
  "recinto_alfandegario": "porto, aeroporto ou recinto alfandegário de destino declarado (null se ausente)",
  "estado_desembaraco": "UF brasileira de desembaraço baseada no porto/aeroporto de destino (ex: SP, RJ, PR — null se não identificado)",
  "total_fob": 0.0
}`

function xlsxToCsv(buffer: ArrayBuffer): string {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  return wb.SheetNames
    .map(name => {
      const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name])
      return `=== Aba: ${name} ===\n${csv}`
    })
    .join('\n\n')
}

export async function extractInvoiceItems(
  fileBuffer: ArrayBuffer,
  mimeType: string,
): Promise<ExtractionResult> {
  const isSpreadsheet =
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'

  let parts: object[]

  if (isSpreadsheet) {
    // Gemini Vision não suporta XLS/XLSX inline — converte para CSV e envia como texto
    const csvText = xlsxToCsv(fileBuffer)
    parts = [{ text: `${EXTRACTION_PROMPT}\n\nConteúdo da planilha (CSV):\n${csvText}` }]
  } else {
    const base64 = Buffer.from(fileBuffer).toString('base64')
    parts = [
      { text: EXTRACTION_PROMPT },
      { inlineData: { mimeType, data: base64 } },
    ]
  }

  const response = await generateWithRetry({
    model: MODEL,
    contents: [{ role: 'user', parts }],
    config: { temperature: 0.1 },
  })

  const raw = (response.text ?? '').trim()
  const json = raw.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim()
  return JSON.parse(json) as ExtractionResult
}

// ─── Classification ──────────────────────────────────────────────────────────

export async function classifyNcm(
  descricao: string,
  partNumber: string | null,
  candidates: Array<{ codigo: string; descricao: string; ii_aliquota: number; ipi_aliquota: number }>,
): Promise<ClassificationResult> {
  const candidatesText = candidates
    .map((c) => `• NCM ${c.codigo}: ${c.descricao} (II ${c.ii_aliquota}%, IPI ${c.ipi_aliquota}%)`)
    .join('\n')

  const prompt = `Você é um classificador fiscal NCM especializado no Sistema Harmonizado (SH) e na Nomenclatura Comum do Mercosul (NCM/TEC 2026).

Produto a classificar:
Descrição: ${descricao}${partNumber ? `\nPart Number: ${partNumber}` : ''}

Candidatos NCM da base TEC 2026:
${candidatesText || '(nenhum candidato encontrado — classifique com base no conhecimento da NCM)'}

Aplique as Regras Gerais de Interpretação (RGI) do SH para escolher o NCM mais adequado.
Retorne EXCLUSIVAMENTE um JSON válido — sem markdown, sem comentários:
{
  "ncm": "XXXX.XX.XX",
  "confianca": 0.95,
  "fundamentacao": "Justificativa técnica citando RGI e referência NESH aplicada",
  "descricao_di": "Descrição técnica otimizada para uso em DI/Declaração de Importação",
  "risco": "Baixo"
}`

  const response = await generateWithRetry({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.1 },
  })

  const raw = (response.text ?? '').trim()
  const json = raw.replace(/^```(?:json)?/m, '').replace(/```$/m, '').trim()
  return JSON.parse(json) as ClassificationResult
}
