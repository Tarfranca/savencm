import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ComparativoClient from './ComparativoClient'

export type ItemComparativo = {
  id: string
  numero_item: number | null
  descricao_comercial: string
  part_number: string | null
  quantidade: number
  valor_fob_brl: number
  // NCM anterior
  ncm_anterior: string | null
  ncm_ant_na_base: boolean   // false = código não existe em ncm_sh
  ii_ant: number
  ipi_ant: number
  carga_ant: number // %
  // NCM atual (SAVE NCM)
  ncm_codigo: string | null
  ii_atual: number
  ipi_atual: number
  carga_efetiva: number // %
  // Diff
  diff_pp: number
  economia_operacao: number // R$
  // Extra
  fundamentacao_nesh: string | null
}

export default async function ComparativoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lote, error: loteErr } = await supabase
    .from('lotes')
    .select('id, nome_arquivo, origem_pais, cambio_utilizado')
    .eq('id', id)
    .single()

  if (loteErr || !lote) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: itensRaw } = await supabase
    .from('lote_itens')
    .select(
      'id, numero_item, descricao_comercial, part_number, quantidade, ' +
      'valor_fob_brl, ncm_anterior, ncm_codigo, ' +
      'ii_aliquota, ipi_aliquota, carga_efetiva, fundamentacao_nesh'
    )
    .eq('lote_id', id)
    .order('numero_item')
  const itens = (itensRaw ?? []) as any[]

  // Para itens com NCM anterior, buscar alíquotas do NCM anterior
  const ncmAnteriores = [
    ...new Set(
      itens.map((item: any) => item.ncm_anterior).filter((n: any): n is string => !!n)
    ),
  ]

  // Buscar alíquotas dos NCMs anteriores
  const ncmMap: Record<string, { ii: number; ipi: number }> = {}
  if (ncmAnteriores.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ncmRows } = await supabase
      .from('ncm_sh')
      .select('codigo, ii_aliquota, ipi_aliquota')
      .in('codigo', ncmAnteriores)
    for (const row of (ncmRows ?? []) as any[]) {
      ncmMap[row.codigo] = { ii: row.ii_aliquota ?? 0, ipi: row.ipi_aliquota ?? 0 }
    }
  }

  // Montar itens comparativos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comparativos: ItemComparativo[] = itens.map((item: any) => {
    const fob = item.valor_fob_brl ?? 0
    const carga_atual = item.carga_efetiva ?? 0

    // Calcular carga do NCM anterior
    let carga_ant = 0
    let ii_ant = 0
    let ipi_ant = 0

    if (item.ncm_anterior && ncmMap[item.ncm_anterior]) {
      const aliq = ncmMap[item.ncm_anterior]
      ii_ant = aliq.ii
      ipi_ant = aliq.ipi
      const cif = fob * 1.04
      const ii_v = cif * (ii_ant / 100)
      const ipi_v = (cif + ii_v) * (ipi_ant / 100)
      const pis_v = (cif + ii_v + ipi_v) * 0.021
      const cofins_v = (cif + ii_v + ipi_v) * 0.0965
      const icms_rate = 0.12
      const soma = ii_v + ipi_v + pis_v + cofins_v
      const icms_v = ((cif + soma) / (1 - icms_rate)) * icms_rate
      const total = ii_v + ipi_v + pis_v + cofins_v + icms_v
      carga_ant = fob > 0 ? (total / fob) * 100 : 0
    } else if (item.ncm_anterior === item.ncm_codigo) {
      // Mesmo NCM — usar carga atual como anterior
      carga_ant = carga_atual
      ii_ant = item.ii_aliquota ?? 0
      ipi_ant = item.ipi_aliquota ?? 0
    }

    const diff_pp = carga_ant - carga_atual
    const economia_operacao = fob * (diff_pp / 100)

    const ncm_ant_na_base = !item.ncm_anterior || !!ncmMap[item.ncm_anterior] || item.ncm_anterior === item.ncm_codigo

    return {
      id: item.id,
      numero_item: item.numero_item,
      descricao_comercial: item.descricao_comercial,
      part_number: item.part_number,
      quantidade: item.quantidade,
      valor_fob_brl: fob,
      ncm_anterior: item.ncm_anterior,
      ncm_ant_na_base,
      ii_ant,
      ipi_ant,
      carga_ant: parseFloat(carga_ant.toFixed(2)),
      ncm_codigo: item.ncm_codigo,
      ii_atual: item.ii_aliquota ?? 0,
      ipi_atual: item.ipi_aliquota ?? 0,
      carga_efetiva: parseFloat(carga_atual.toFixed(2)),
      diff_pp: parseFloat(diff_pp.toFixed(2)),
      economia_operacao: parseFloat(economia_operacao.toFixed(2)),
      fundamentacao_nesh: item.fundamentacao_nesh,
    }
  })

  return (
    <ComparativoClient
      loteId={id}
      nomeArquivo={lote.nome_arquivo}
      comparativos={comparativos}
    />
  )
}

