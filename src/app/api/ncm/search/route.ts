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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const mode = searchParams.get('mode') ?? 'descricao'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))

  if (!q) return NextResponse.json({ results: [], total: 0, page })

  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('ncm_sh')
    .select('codigo, descricao, ii_aliquota, ipi_aliquota, pis_aliquota, cofins_aliquota, nesh_nota, ato_legal', { count: 'exact' })

  if (mode === 'codigo') {
    // Prefix match — strip non-digits/dots for safety
    const sanitized = q.replace(/[^0-9.]/g, '')
    query = query.ilike('codigo', `${sanitized}%`)
  } else {
    // Description: split into words and AND ilike
    const words = q
      .split(/\s+/)
      .map(w => w.toLowerCase())
      .filter(w => w.length > 2)
      .slice(0, 5)
    if (words.length === 0) return NextResponse.json({ results: [], total: 0, page })
    for (const word of words) {
      query = query.ilike('descricao', `%${word}%`)
    }
  }

  const { data: ncms, count, error } = await query
    .order('codigo')
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codes = ((ncms ?? []) as any[]).map(r => r.codigo)

  // Batch-fetch ex_tarifarios for these NCM codes
  const exMap: Record<string, { tipo: string | null; aliquota: number; descricao: string }> = {}
  if (codes.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    const { data: exRows } = await supabase
      .from('ex_tarifarios')
      .select('ncm, tipo, aliquota_ii_reduzida, descricao, vigencia_fim')
      .in('ncm', codes)
      .or(`vigencia_fim.is.null,vigencia_fim.gte.${today}`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const ex of ((exRows ?? []) as any[])) {
      exMap[ex.ncm] = {
        tipo: ex.tipo ?? null,
        aliquota: ex.aliquota_ii_reduzida ?? 0,
        descricao: ex.descricao ?? '',
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = ((ncms ?? []) as any[]).map(r => ({
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
    ex_tarifario: exMap[r.codigo] ?? null,
  }))

  return NextResponse.json({ results, total: count ?? 0, page })
}
