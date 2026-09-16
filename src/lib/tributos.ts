// ─── ICMS por estado (alíquota interestadual padrão de importação) ──────────

const ICMS_POR_ESTADO: Record<string, number> = {
  AC: 0.17, AL: 0.17, AP: 0.17, AM: 0.17, BA: 0.17,
  CE: 0.17, DF: 0.17, ES: 0.17, GO: 0.17, MA: 0.17,
  MT: 0.17, MS: 0.17, MG: 0.12, PA: 0.17, PB: 0.17,
  PR: 0.12, PE: 0.17, PI: 0.17, RJ: 0.18, RN: 0.17,
  RS: 0.12, RO: 0.17, RR: 0.17, SC: 0.12, SP: 0.12,
  SE: 0.17, TO: 0.17,
}

export function getIcmsRate(estado: string): number {
  // estado pode vir como "SP", "São Paulo (SP)", etc.
  const uf = estado.match(/\b([A-Z]{2})\b/)?.[1] ?? estado.toUpperCase().trim()
  return ICMS_POR_ESTADO[uf] ?? 0.12
}

// ─── Cálculo tributário completo ────────────────────────────────────────────

export interface TaxCalculation {
  valor_fob_brl: number
  valor_cif_brl: number
  tributo_ii_brl: number
  tributo_ipi_brl: number
  tributo_pis_brl: number
  tributo_cofins_brl: number
  tributo_icms_brl: number
  total_tributos_brl: number
  aliquota_icms: number
}

export function calcularTributos(params: {
  valor_fob_usd: number
  cambio: number
  aliquota_ii: number  // decimal, ex: 0.12
  aliquota_ipi: number // decimal, ex: 0.05
  estado: string
}): TaxCalculation {
  const { valor_fob_usd, cambio, aliquota_ii, aliquota_ipi, estado } = params

  const aliquota_icms = getIcmsRate(estado)
  const PIS = 0.021
  const COFINS = 0.0965
  const FRETE_SEGURO_FACTOR = 1.04 // CIF ≈ FOB × 1.04 (estimativa conservadora)

  const valor_fob_brl = valor_fob_usd * cambio
  const valor_cif_brl = valor_fob_brl * FRETE_SEGURO_FACTOR

  // II sobre CIF
  const tributo_ii_brl = valor_cif_brl * aliquota_ii

  // IPI sobre (CIF + II)
  const base_ipi = valor_cif_brl + tributo_ii_brl
  const tributo_ipi_brl = base_ipi * aliquota_ipi

  // PIS e COFINS sobre (CIF + II + IPI)
  const base_pis_cofins = valor_cif_brl + tributo_ii_brl + tributo_ipi_brl
  const tributo_pis_brl = base_pis_cofins * PIS
  const tributo_cofins_brl = base_pis_cofins * COFINS

  // ICMS — gross-up sobre (CIF + II + IPI + PIS + COFINS)
  const soma_antes_icms =
    valor_cif_brl + tributo_ii_brl + tributo_ipi_brl + tributo_pis_brl + tributo_cofins_brl
  const base_icms = soma_antes_icms / (1 - aliquota_icms)
  const tributo_icms_brl = base_icms * aliquota_icms

  const total_tributos_brl =
    tributo_ii_brl + tributo_ipi_brl + tributo_pis_brl + tributo_cofins_brl + tributo_icms_brl

  return {
    valor_fob_brl: round(valor_fob_brl),
    valor_cif_brl: round(valor_cif_brl),
    tributo_ii_brl: round(tributo_ii_brl),
    tributo_ipi_brl: round(tributo_ipi_brl),
    tributo_pis_brl: round(tributo_pis_brl),
    tributo_cofins_brl: round(tributo_cofins_brl),
    tributo_icms_brl: round(tributo_icms_brl),
    total_tributos_brl: round(total_tributos_brl),
    aliquota_icms,
  }
}

function round(n: number) {
  return Math.round(n * 100) / 100
}
