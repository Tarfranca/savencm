import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractInvoiceItems, classifyNcm } from '@/lib/gemini'
import { calcularTributos } from '@/lib/tributos'

export const maxDuration = 120

// ── BCB PTAX exchange rate ────────────────────────────────────────────────────

const MOEDA_FALLBACK: Record<string, number> = {
  USD: 5.42, EUR: 5.85, CNY: 0.75, GBP: 6.80,
}

async function fetchCambioBCB(moeda: string): Promise<number> {
  for (let daysBack = 0; daysBack < 5; daysBack++) {
    const d = new Date()
    d.setDate(d.getDate() - daysBack)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    const dataBCB = `${mm}-${dd}-${yyyy}`

    try {
      const url =
        `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/` +
        `CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)` +
        `?@moeda=%27${moeda}%27&@dataCotacao=%27${dataBCB}%27` +
        `&$top=1&$orderby=dataHoraCotacao%20desc&$format=json&$select=cotacaoVenda`

      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue

      const json = await res.json()
      const cotacao = json?.value?.[0]?.cotacaoVenda
      if (cotacao && typeof cotacao === 'number' && cotacao > 0) return cotacao
    } catch {
      // try next day
    }
  }

  return MOEDA_FALLBACK[moeda] ?? 5.42
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  // ── 1. Buscar lote ────────────────────────────────────────────────────────
  const { data: lote, error: loteErr } = await supabase
    .from('lotes')
    .select('id, nome_arquivo, arquivo_storage_path, status')
    .eq('id', id)
    .single()

  if (loteErr || !lote) {
    return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 })
  }

  if (lote.status !== 'processando') {
    return NextResponse.json({ status: lote.status })
  }

  try {
    // ── 2. Baixar arquivo do Storage ──────────────────────────────────────
    const storagePath = lote.arquivo_storage_path as string | null
    if (!storagePath) throw new Error('arquivo_storage_path não encontrado no lote.')

    const { data: fileData, error: dlErr } = await supabase.storage
      .from('invoices')
      .download(storagePath)

    if (dlErr || !fileData) throw new Error(`Download falhou: ${dlErr?.message}`)

    const mimeType = guessMime(storagePath)
    const buffer = await fileData.arrayBuffer()

    // ── 3. Extrair itens e dados do embarque com Gemini Vision ───────────
    const extraction = await extractInvoiceItems(buffer, mimeType)

    if (!extraction.items || extraction.items.length === 0) {
      throw new Error('Gemini não encontrou itens no documento.')
    }

    // ── 4. Buscar câmbio real do BCB ──────────────────────────────────────
    const moeda = extraction.moeda_origem ?? 'USD'
    const cambio = await fetchCambioBCB(moeda)

    // ── 5. Atualizar lote com dados extraídos da invoice ─────────────────
    // Colunas base (sempre existem na tabela)
    await supabase
      .from('lotes')
      .update({
        origem_pais: extraction.origem_pais ?? extraction.origem ?? null,
        modal: extraction.modal ?? null,
        incoterm: extraction.incoterm ?? null,
        recinto_alfandegario: extraction.recinto_alfandegario ?? null,
        cambio_utilizado: cambio,
      })
      .eq('id', id)

    // Colunas novas (requerem migration add_lote_embarque_fields.sql)
    // Falha silenciosa se a migration ainda não foi aplicada
    await supabase
      .from('lotes')
      .update({ moeda_origem: moeda, estado_desembaraco: extraction.estado_desembaraco ?? null })
      .eq('id', id)

    // Estado para ICMS: do embarque (identificado pela IA), fallback SP
    const estado = extraction.estado_desembaraco ?? 'SP'

    // ── 6. Classificar e salvar cada item ─────────────────────────────────
    for (const item of extraction.items) {
      try {
        const candidates = await searchNcmCandidates(supabase, item.descricao)

        const classification = await classifyNcm(
          item.descricao,
          item.part_number,
          candidates,
        )

        const ncmRow = await getNcmRow(supabase, classification.ncm) ??
          candidates.find(c => c.codigo === classification.ncm)

        const ncmExiste = !!ncmRow

        const aliquota_ii = (ncmRow?.ii_aliquota ?? 0) / 100
        const aliquota_ipi = (ncmRow?.ipi_aliquota ?? 0) / 100

        const tributos = calcularTributos({
          valor_fob_usd: item.valor_fob_usd,
          cambio,
          aliquota_ii,
          aliquota_ipi,
          estado,
        })

        const carga_efetiva = tributos.valor_fob_brl > 0
          ? (tributos.total_tributos_brl / tributos.valor_fob_brl) * 100
          : 0

        await supabase.from('lote_itens').insert({
          lote_id: id,
          descricao_comercial: item.descricao,
          descricao_otimizada_di: classification.descricao_di,
          part_number: item.part_number,
          quantidade: item.quantidade,
          peso_liquido_kg: item.peso_kg,
          valor_fob_usd: item.valor_fob_usd,
          valor_fob_brl: tributos.valor_fob_brl,
          ncm_anterior: item.ncm_declarado,
          ...(ncmExiste ? { ncm_codigo: classification.ncm } : {}),
          ii_aliquota: aliquota_ii * 100,
          ipi_aliquota: aliquota_ipi * 100,
          pis_aliquota: 2.1,
          cofins_aliquota: 9.65,
          icms_aliquota: tributos.aliquota_icms * 100,
          cif_brl: tributos.valor_fob_brl * 1.04,
          ii_valor: tributos.tributo_ii_brl,
          ipi_valor: tributos.tributo_ipi_brl,
          pis_valor: tributos.tributo_pis_brl,
          cofins_valor: tributos.tributo_cofins_brl,
          icms_valor: tributos.tributo_icms_brl,
          carga_total_tributos: tributos.total_tributos_brl,
          carga_efetiva,
          fundamentacao_nesh: classification.fundamentacao,
          risco_nivel: classification.risco.toLowerCase(),
          confianca_ia: classification.confianca,
          status: 'revisar',
        })

        if (item.ncm_declarado && item.ncm_declarado !== classification.ncm) {
          const economia = tributos.total_tributos_brl * 0.1
          await supabase.from('alertas').insert({
            lote_id: id,
            tipo: economia > 0 ? 'oportunidade' : 'info',
            titulo: `NCM reclassificado: ${item.ncm_declarado} → ${classification.ncm}`,
            descricao: `Item "${item.descricao.slice(0, 80)}" foi reclassificado. Risco: ${classification.risco}.`,
            economia_potencial_brl: economia > 0 ? economia : null,
          })
        }
      } catch (itemErr) {
        console.error(`Erro no item "${item.descricao}":`, itemErr)
        await supabase.from('lote_itens').insert({
          lote_id: id,
          descricao_comercial: item.descricao,
          part_number: item.part_number,
          quantidade: item.quantidade,
          valor_fob_usd: item.valor_fob_usd,
          valor_fob_brl: item.valor_fob_usd * cambio,
          pis_aliquota: 2.1,
          cofins_aliquota: 9.65,
          status: 'erro',
        })
      }
    }

    // ── 7. Marcar lote como concluído ──────────────────────────────────────
    await supabase
      .from('lotes')
      .update({ status: 'concluido' })
      .eq('id', id)

    return NextResponse.json({ ok: true, items: extraction.items.length, cambio, moeda })
  } catch (err) {
    console.error('Processamento falhou:', err)
    await supabase
      .from('lotes')
      .update({ status: 'erro' })
      .eq('id', id)

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 },
    )
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function guessMime(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'xlsx' || ext === 'xls') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  return 'application/octet-stream'
}

async function searchNcmCandidates(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  descricao: string,
) {
  const words = descricao
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !/^(para|com|por|que|uma|dos|das|nos|nas|em|de|do|da)$/.test(w))
    .slice(0, 4)

  if (words.length === 0) return []

  const orFilter = words.map(w => `descricao.ilike.%${w}%`).join(',')

  const { data } = await supabase
    .from('ncm_sh')
    .select('codigo, descricao, ii_aliquota, ipi_aliquota')
    .or(orFilter)
    .limit(6)

  return data ?? []
}

async function getNcmRow(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  ncm: string,
) {
  const { data } = await supabase
    .from('ncm_sh')
    .select('codigo, descricao, ii_aliquota, ipi_aliquota')
    .eq('codigo', ncm)
    .single()
  return data
}
