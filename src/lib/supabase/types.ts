export type NcmSh = {
  codigo: string
  descricao: string
  ii_aliquota: number
  ipi_aliquota: number
  pis_aliquota: number
  cofins_aliquota: number
  nesh_nota: string | null
  ato_legal: string | null
}

export type PerfilFiscal = {
  id: string
  user_id: string
  regime: 'lucro_real' | 'lucro_presumido' | 'simples'
  regimes_especiais: string[] | null
  alerta_variacao: boolean
  created_at: string
}

export type Lote = {
  id: string
  user_id: string | null
  nome_arquivo: string
  arquivo_storage_path: string | null
  origem_pais: string | null
  moeda_origem: string | null
  modal: string | null
  incoterm: string | null
  recinto_alfandegario: string | null
  estado_desembaraco: string | null
  cambio_utilizado: number | null
  status: 'processando' | 'concluido' | 'erro'
  created_at: string
  updated_at: string
}

export type LoteItem = {
  id: string
  lote_id: string
  numero_item: number | null
  descricao_comercial: string
  descricao_otimizada_di: string | null
  part_number: string | null
  ncm_codigo: string | null
  ncm_anterior: string | null
  peso_liquido_kg: number | null
  quantidade: number
  unidade: string | null
  valor_fob_usd: number
  valor_fob_brl: number | null
  ii_aliquota: number | null
  ii_is_ex: boolean
  ipi_aliquota: number | null
  pis_aliquota: number
  cofins_aliquota: number
  icms_aliquota: number | null
  carga_efetiva: number | null
  cif_brl: number | null
  ii_valor: number | null
  ipi_valor: number | null
  pis_valor: number | null
  cofins_valor: number | null
  icms_valor: number | null
  carga_total_tributos: number | null
  fundamentacao_nesh: string | null
  enquadramento_legal: string | null
  parecer_cosit: string | null
  regras_rgi: string | null
  risco_nivel: string | null
  alerta_nota: string | null
  confianca_ia: number | null
  status: string
}

export type Alerta = {
  id: string
  lote_id: string
  lote_item_id: string | null
  tipo: 'oportunidade' | 'risco' | 'info'
  titulo: string
  descricao: string
  economia_potencial_brl: number | null
  created_at: string
}

export type ExTarifario = {
  id: string
  ncm: string
  ex: string
  descricao: string
  aliquota_ii_reduzida: number
  vigencia_inicio: string
  vigencia_fim: string | null
}
