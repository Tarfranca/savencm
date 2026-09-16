import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ResultadoClient from './ResultadoClient'

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lote, error: loteErr } = await supabase
    .from('lotes')
    .select('id, nome_arquivo, origem_pais, moeda_origem, modal, incoterm, recinto_alfandegario, estado_desembaraco, cambio_utilizado, status, created_at')
    .eq('id', id)
    .single()

  if (loteErr || !lote) notFound()

  const { data: itens } = await supabase
    .from('lote_itens')
    .select(
      'id, numero_item, descricao_comercial, descricao_otimizada_di, part_number, ' +
      'ncm_codigo, ncm_anterior, peso_liquido_kg, quantidade, valor_fob_usd, valor_fob_brl, ' +
      'ii_aliquota, ii_is_ex, ipi_aliquota, pis_aliquota, cofins_aliquota, icms_aliquota, ' +
      'carga_efetiva, cif_brl, ii_valor, ipi_valor, pis_valor, cofins_valor, icms_valor, ' +
      'carga_total_tributos, fundamentacao_nesh, enquadramento_legal, parecer_cosit, ' +
      'regras_rgi, risco_nivel, alerta_nota, confianca_ia, status'
    )
    .eq('lote_id', id)
    .order('id')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ResultadoClient lote={lote as any} itens={(itens ?? []) as any} />
}
