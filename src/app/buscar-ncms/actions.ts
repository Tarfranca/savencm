'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calcularTributos } from '@/lib/tributos'

// ── Cenário A: substitui NCM de um item existente ─────────────────────────────

export async function aplicarNcmAlternativo(loteItemId: string, novoNcm: string) {
  const supabase = await createClient()

  // 1. Fetch lote_item (need lote_id and FOB values)
  const { data: item, error: itemErr } = await supabase
    .from('lote_itens')
    .select('id, lote_id, valor_fob_usd, peso_liquido_kg, ncm_codigo')
    .eq('id', loteItemId)
    .single()

  if (itemErr || !item) throw new Error('Item não encontrado')

  // 2. Fetch lote for cambio + estado
  const { data: lote } = await supabase
    .from('lotes')
    .select('cambio_utilizado, estado_desembaraco')
    .eq('id', item.lote_id)
    .single()

  // 3. Fetch new NCM row
  const { data: ncmRow, error: ncmErr } = await supabase
    .from('ncm_sh')
    .select('codigo, ii_aliquota, ipi_aliquota, pis_aliquota, cofins_aliquota')
    .eq('codigo', novoNcm)
    .single()

  if (ncmErr || !ncmRow) throw new Error(`NCM ${novoNcm} não encontrado na base TEC`)

  const cambio = lote?.cambio_utilizado ?? 5.42
  const estado = lote?.estado_desembaraco ?? 'SP'

  const tributos = calcularTributos({
    valor_fob_usd: item.valor_fob_usd,
    cambio,
    aliquota_ii: (ncmRow.ii_aliquota ?? 0) / 100,
    aliquota_ipi: (ncmRow.ipi_aliquota ?? 0) / 100,
    estado,
  })

  const carga_efetiva =
    tributos.valor_fob_brl > 0
      ? (tributos.total_tributos_brl / tributos.valor_fob_brl) * 100
      : 0

  await supabase
    .from('lote_itens')
    .update({
      ncm_codigo: novoNcm,
      ii_aliquota: ncmRow.ii_aliquota ?? 0,
      ipi_aliquota: ncmRow.ipi_aliquota ?? 0,
      pis_aliquota: ncmRow.pis_aliquota ?? 2.1,
      cofins_aliquota: ncmRow.cofins_aliquota ?? 9.65,
      icms_aliquota: tributos.aliquota_icms * 100,
      valor_fob_brl: tributos.valor_fob_brl,
      cif_brl: tributos.valor_cif_brl,
      ii_valor: tributos.tributo_ii_brl,
      ipi_valor: tributos.tributo_ipi_brl,
      pis_valor: tributos.tributo_pis_brl,
      cofins_valor: tributos.tributo_cofins_brl,
      icms_valor: tributos.tributo_icms_brl,
      carga_total_tributos: tributos.total_tributos_brl,
      carga_efetiva,
    })
    .eq('id', loteItemId)

  revalidatePath(`/resultado/${item.lote_id}`)
  redirect(`/resultado/${item.lote_id}`)
}

// ── Cenário B: cria lote avulso + item com NCM escolhido ─────────────────────

export async function criarItemAvulso(
  ncmCodigo: string,
  dados: {
    descricao: string
    quantidade: number
    valorFobUsd: number
    pesoKg: number | null
  },
) {
  const supabase = await createClient()

  // 1. Fetch NCM row
  const { data: ncmRow } = await supabase
    .from('ncm_sh')
    .select('codigo, ii_aliquota, ipi_aliquota, pis_aliquota, cofins_aliquota')
    .eq('codigo', ncmCodigo)
    .single()

  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // 2. Create lote
  const { data: lote, error: loteErr } = await supabase
    .from('lotes')
    .insert({
      nome_arquivo: `Classificação avulsa — ${hoje}`,
      status: 'concluido',
      cambio_utilizado: 5.42,
      moeda_origem: 'USD',
      estado_desembaraco: 'SP',
    })
    .select('id')
    .single()

  if (loteErr || !lote) throw new Error('Erro ao criar lote avulso')

  const cambio = 5.42
  const estado = 'SP'

  const tributos = calcularTributos({
    valor_fob_usd: dados.valorFobUsd,
    cambio,
    aliquota_ii: (ncmRow?.ii_aliquota ?? 0) / 100,
    aliquota_ipi: (ncmRow?.ipi_aliquota ?? 0) / 100,
    estado,
  })

  const carga_efetiva =
    tributos.valor_fob_brl > 0
      ? (tributos.total_tributos_brl / tributos.valor_fob_brl) * 100
      : 0

  // 3. Create lote_item
  await supabase.from('lote_itens').insert({
    lote_id: lote.id,
    descricao_comercial: dados.descricao,
    quantidade: dados.quantidade,
    peso_liquido_kg: dados.pesoKg,
    valor_fob_usd: dados.valorFobUsd,
    valor_fob_brl: tributos.valor_fob_brl,
    ncm_codigo: ncmCodigo,
    ii_aliquota: ncmRow?.ii_aliquota ?? 0,
    ipi_aliquota: ncmRow?.ipi_aliquota ?? 0,
    pis_aliquota: ncmRow?.pis_aliquota ?? 2.1,
    cofins_aliquota: ncmRow?.cofins_aliquota ?? 9.65,
    icms_aliquota: tributos.aliquota_icms * 100,
    cif_brl: tributos.valor_cif_brl,
    ii_valor: tributos.tributo_ii_brl,
    ipi_valor: tributos.tributo_ipi_brl,
    pis_valor: tributos.tributo_pis_brl,
    cofins_valor: tributos.tributo_cofins_brl,
    icms_valor: tributos.tributo_icms_brl,
    carga_total_tributos: tributos.total_tributos_brl,
    carga_efetiva,
    status: 'revisar',
  })

  redirect(`/resultado/${lote.id}`)
}
