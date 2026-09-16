import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 20

// Compute reference carga efetiva over CIF=100 (SP, Lucro Real)
function calcCargaEfetiva(ii: number, ipi: number): number {
  const cif = 100
  const ii_v = cif * (ii / 100)
  const ipi_v = (cif + ii_v) * (ipi / 100)
  const pis_v = (cif + ii_v + ipi_v) * 0.021
  const cofins_v = (cif + ii_v + ipi_v) * 0.0965
  const icms_rate = 0.12
  const soma = ii_v + ipi_v + pis_v + cofins_v
  const icms_v = ((cif + soma) / (1 - icms_rate)) * icms_rate
  return parseFloat(((ii_v + ipi_v + pis_v + cofins_v + icms_v) / cif * 100).toFixed(1))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any, matchType?: string) {
  return {
    codigo: r.codigo as string,
    descricao: r.descricao as string,
    ii_aliquota: r.ii_aliquota ?? 0,
    ipi_aliquota: r.ipi_aliquota ?? 0,
    pis_aliquota: r.pis_aliquota ?? 2.1,
    cofins_aliquota: r.cofins_aliquota ?? 9.65,
    nesh_nota: r.nesh_nota ?? null,
    ato_legal: r.ato_legal ?? null,
    carga_efetiva: calcCargaEfetiva(r.ii_aliquota ?? 0, r.ipi_aliquota ?? 0),
    capitulo: r.codigo?.slice(0, 2) ?? '',
    match_type: matchType ?? r.match_type ?? 'ilike',
  }
}

const SELECT_COLS =
  'codigo, descricao, ii_aliquota, ipi_aliquota, pis_aliquota, cofins_aliquota, nesh_nota, ato_legal'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const mode = searchParams.get('mode') ?? 'descricao'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  // ── Code-prefix search (unchanged) ──────────────────────────────────────────
  if (mode === 'codigo') {
    const sanitized = q.replace(/[^0-9.]/g, '')
    if (!sanitized) return NextResponse.json({ results: [], total: 0, page, mode: 'initial' })

    const { data, count, error } = await supabase
      .from('ncm_sh')
      .select(SELECT_COLS, { count: 'exact' })
      .ilike('codigo', `${sanitized}%`)
      .order('codigo')
      .range(from, to)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const codes = (data ?? []).map(r => r.codigo)
    const exMap = await fetchExMap(supabase, codes)
    const results = (data ?? []).map(r => ({ ...mapRow(r, 'codigo'), ex_tarifario: exMap[r.codigo] ?? null }))
    return NextResponse.json({ results, total: count ?? 0, page, mode: 'codigo' })
  }

  // ── Descrição: empty query → initial popular NCMs ──────────────────────────
  if (!q) {
    const { data, error } = await supabase
      .from('ncm_sh')
      .select(SELECT_COLS)
      .or('codigo.ilike.84%,codigo.ilike.85%,codigo.ilike.90%,codigo.ilike.73%,codigo.ilike.39%')
      .order('codigo')
      .limit(PAGE_SIZE)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const codes = (data ?? []).map(r => r.codigo)
    const exMap = await fetchExMap(supabase, codes)
    const results = (data ?? []).map(r => ({ ...mapRow(r, 'initial'), ex_tarifario: exMap[r.codigo] ?? null }))
    return NextResponse.json({ results, total: results.length, page: 1, mode: 'initial' })
  }

  // ── Descrição: full-text + fuzzy via RPC ────────────────────────────────────
  const { data: rpcData, error: rpcError } = await supabase.rpc('search_ncm', {
    query_text: q,
    lim: PAGE_SIZE,
    off: from,
  })

  // If RPC exists and returned data → use it
  if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
    const codes = rpcData.map((r: { codigo: string }) => r.codigo)
    const exMap = await fetchExMap(supabase, codes)
    const results = rpcData.map((r: Record<string, unknown>) => ({
      ...mapRow(r),
      ex_tarifario: exMap[r.codigo as string] ?? null,
    }))
    return NextResponse.json({ results, total: results.length, page, mode: 'rpc' })
  }

  // Fallback: ilike multi-word (works before migration; accent-insensitive via RPC after migration)
  const words = q
    .split(/\s+/)
    .map(w => w.toLowerCase())
    .filter(w => w.length > 2)
    .slice(0, 5)

  if (words.length === 0) return NextResponse.json({ results: [], total: 0, page, mode: 'empty' })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fallback: any = supabase
    .from('ncm_sh')
    .select(SELECT_COLS, { count: 'exact' })

  for (const word of words) {
    fallback = fallback.ilike('descricao', `%${word}%`)
  }

  const { data: fallbackData, count, error: fallbackError } = await fallback
    .order('codigo')
    .range(from, to)

  if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 })

  const fbCodes = (fallbackData ?? []).map((r: { codigo: string }) => r.codigo)
  const exMap = await fetchExMap(supabase, fbCodes)
  const results = (fallbackData ?? []).map((r: Record<string, unknown>) => ({
    ...mapRow(r, 'ilike'),
    ex_tarifario: exMap[r.codigo as string] ?? null,
  }))
  return NextResponse.json({ results, total: count ?? 0, page, mode: 'ilike' })
}

// ── Shared helper: batch-fetch ex_tarifários ────────────────────────────────
async function fetchExMap(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  codes: string[],
) {
  const exMap: Record<string, { tipo: string | null; aliquota: number; descricao: string }> = {}
  if (codes.length === 0) return exMap

  const today = new Date().toISOString().split('T')[0]
  const { data: exRows } = await supabase
    .from('ex_tarifarios')
    .select('ncm, tipo, aliquota_ii_reduzida, descricao, vigencia_fim')
    .in('ncm', codes)
    .or(`vigencia_fim.is.null,vigencia_fim.gte.${today}`)

  for (const ex of (exRows ?? [])) {
    exMap[(ex as { ncm: string }).ncm] = {
      tipo: (ex as { tipo: string | null }).tipo ?? null,
      aliquota: (ex as { aliquota_ii_reduzida: number }).aliquota_ii_reduzida ?? 0,
      descricao: (ex as { descricao: string }).descricao ?? '',
    }
  }
  return exMap
}
