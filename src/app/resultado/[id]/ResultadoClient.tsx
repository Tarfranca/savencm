'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { aprovarItem, aprovarTodos } from './actions'

type Lote = {
  id: string
  nome_arquivo: string
  origem_pais: string | null
  moeda_origem: string | null
  modal: string | null
  incoterm: string | null
  recinto_alfandegario: string | null
  estado_desembaraco: string | null
  cambio_utilizado: number | null
  status: string
  created_at: string
}

type LoteItem = {
  id: string
  numero_item: number | null
  descricao_comercial: string
  descricao_otimizada_di: string | null
  part_number: string | null
  ncm_codigo: string | null
  ncm_anterior: string | null
  peso_liquido_kg: number | null
  quantidade: number
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

const brl = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const usd = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v: number | null | undefined) => `${(v ?? 0).toFixed(1)}%`

const ChevronUp = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)
const ChevronDown = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? 'w-3.5 h-3.5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
)

export default function ResultadoClient({
  lote,
  itens: initialItens,
}: {
  lote: Lote
  itens: LoteItem[]
}) {
  const [itens, setItens] = useState(initialItens)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [initialItens[0]?.id ?? '']: true,
  })
  const [toast, setToast] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const toggle = (id: string) =>
    setExpanded(p => ({ ...p, [id]: !p[id] }))

  const handleAprovar = (itemId: string) => {
    startTransition(async () => {
      await aprovarItem(itemId, lote.id)
      setItens(p => p.map(i => i.id === itemId ? { ...i, status: 'validado' } : i))
      showToast('Item homologado com sucesso!')
    })
  }

  const handleAprovarTodos = () => {
    startTransition(async () => {
      await aprovarTodos(lote.id)
      setItens(p => p.map(i => ({ ...i, status: 'validado' })))
      showToast('Todos os itens foram validados e aprovados para a DI!')
    })
  }

  const validados = itens.filter(i => i.status === 'validado').length
  const aRevisar = itens.length - validados
  const totalFobUsd = itens.reduce((s, i) => s + (i.valor_fob_usd ?? 0), 0)
  const totalFobBrl = itens.reduce((s, i) => s + (i.valor_fob_brl ?? 0), 0)
  const totalTributos = itens.reduce((s, i) => s + (i.carga_total_tributos ?? 0), 0)
  const totalPeso = itens.reduce((s, i) => s + (i.peso_liquido_kg ?? 0), 0)
  const totalQtd = itens.reduce((s, i) => s + (i.quantidade ?? 0), 0)
  const cargaMedia = totalFobBrl > 0 ? (totalTributos / totalFobBrl) * 100 : 0
  const cambio = lote.cambio_utilizado ?? 5.42

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#334155] text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}

      {/* Context Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-900 font-mono">{lote.nome_arquivo}</span>
              <span className="bg-[#ECFDF5] text-[#047857] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#A7F3D0]">
                Classificação Concluída
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lote.origem_pais && <>Origem: <strong>{lote.origem_pais}</strong> · </>}
              {lote.modal && <>Modal: <strong>{lote.modal}</strong> · </>}
              {lote.incoterm && <>Incoterm: <strong>{lote.incoterm}</strong> · </>}
              {lote.estado_desembaraco && <>UF desemb.: <strong>{lote.estado_desembaraco}</strong> · </>}
              <span className="font-mono">{lote.moeda_origem ?? 'USD'}</span>
              {' '}→ R$ <span className="font-mono">{cambio.toFixed(4)}</span> (PTAX BCB)
              {' '}· {itens.length} {itens.length === 1 ? 'item' : 'itens'} faturados
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#CBD5E1] bg-white text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4 text-[#047857]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
              </svg>
              Exportar Excel
            </button>
            <Link href={`/comparativo/${lote.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Comparativo
            </Link>
          </div>
        </div>
      </div>

      {/* Scope Strip */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-4 py-2 mb-4 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
            Base <strong className="ml-1">TEC Vigente 2026</strong>
          </span>
          <span>·</span>
          <span>Gemini 3.6 Flash · Classificação Fiscal Automatizada</span>
        </div>
        <div className="text-slate-500 italic">
          CIF = FOB × 1,04 · PIS 2,10% · COFINS 9,65% · ICMS gross-up
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white h-10 border-b border-[#334155]">
                {[
                  { label: 'Item', cls: 'w-12 text-center' },
                  { label: 'Descrição / Part Number', cls: 'min-w-[200px]' },
                  { label: 'NCM Sugerido', cls: 'text-center' },
                  { label: 'Peso Líq.', cls: 'text-right' },
                  { label: 'Qtd.', cls: 'text-right' },
                  { label: 'Valor FOB', cls: 'text-right' },
                  { label: 'II', cls: 'text-right px-2' },
                  { label: 'IPI', cls: 'text-right px-2' },
                  { label: 'PIS', cls: 'text-right px-2' },
                  { label: 'COFINS', cls: 'text-right px-2' },
                  { label: 'ICMS', cls: 'text-right px-2' },
                  { label: 'Carga Efetiva', cls: 'text-right' },
                  { label: 'Status', cls: 'text-center' },
                ].map(({ label, cls }) => (
                  <th key={label} className={`px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 ${cls}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {itens.map((item, idx) => {
                const isExpanded = !!expanded[item.id]
                const ncmMudou = item.ncm_anterior && item.ncm_anterior !== item.ncm_codigo

                return (
                  <React.Fragment key={item.id}>
                    {/* Main row */}
                    <tr
                      onClick={() => toggle(item.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${isExpanded ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="px-3 py-3 text-center font-bold text-slate-700 font-mono">
                        <div className="flex items-center justify-center gap-1">
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                          <span>{item.numero_item ?? idx + 1}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">{item.descricao_comercial}</div>
                        {item.part_number && (
                          <div className="text-[11px] text-slate-500 font-mono">P/N: {item.part_number}</div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className="inline-block font-mono font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.ncm_codigo ?? '—'}
                        </span>
                        {ncmMudou && (
                          <div className="text-[10px] text-amber-600 mt-0.5">era: {item.ncm_anterior}</div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-right font-mono text-slate-600">
                        {item.peso_liquido_kg != null ? `${item.peso_liquido_kg} kg` : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600">{item.quantidade}</td>

                      <td className="px-3 py-3 text-right font-mono">
                        <div className="font-semibold text-slate-900">$ {usd(item.valor_fob_usd)}</div>
                        <div className="text-[10px] text-slate-500">R$ {brl(item.valor_fob_brl)}</div>
                      </td>

                      <td className="px-2 py-3 text-right font-mono">
                        {item.ii_is_ex
                          ? <span className="text-[#047857] font-bold">0,0% (Ex)</span>
                          : pct(item.ii_aliquota)}
                      </td>
                      <td className="px-2 py-3 text-right font-mono text-slate-600">{pct(item.ipi_aliquota)}</td>
                      <td className="px-2 py-3 text-right font-mono text-slate-600">{(item.pis_aliquota ?? 2.1).toFixed(2)}%</td>
                      <td className="px-2 py-3 text-right font-mono text-slate-600">{(item.cofins_aliquota ?? 9.65).toFixed(2)}%</td>
                      <td className="px-2 py-3 text-right font-mono text-slate-600">{pct(item.icms_aliquota)}</td>

                      <td className="px-3 py-3 text-right font-mono font-bold text-[#0F172A]">
                        {(item.carga_efetiva ?? 0).toFixed(1)}%
                      </td>

                      <td className="px-3 py-3 text-center">
                        {item.status === 'validado' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#047857] border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            <CheckIcon className="w-3 h-3" /> Validado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-[#D97706] border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Revisar
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-y border-[#E2E8F0]">
                        <td colSpan={13} className="p-4">
                          {/* Alert note */}
                          {item.alerta_nota && (
                            <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-900 text-xs flex items-start gap-2">
                              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <div>
                                <strong className="font-semibold block mb-0.5">Exigência Documental RFB:</strong>
                                {item.alerta_nota}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                            {/* Col 1: DI */}
                            <div className="bg-white p-3.5 rounded border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-2 pb-1 border-b border-slate-100">
                                  <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Descrição Otimizada para DI
                                </div>
                                <p className="text-slate-700 italic leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/60">
                                  {item.descricao_otimizada_di ?? 'Mercadoria conforme faturamento comercial e packing list anexos.'}
                                </p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1">
                                <span><strong>NCM declarado:</strong> {item.ncm_anterior ?? '—'}</span>
                                <span><strong>NCM sugerido:</strong> {item.ncm_codigo ?? '—'}</span>
                                {item.enquadramento_legal && (
                                  <span><strong>Enquadramento:</strong> {item.enquadramento_legal}</span>
                                )}
                              </div>
                            </div>

                            {/* Col 2: NESH */}
                            <div className="bg-white p-3.5 rounded border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-2 pb-1 border-b border-slate-100">
                                  <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                  </svg>
                                  Fundamentação Legal & NESH
                                </div>
                                <p className="text-slate-700 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/60 font-mono">
                                  {item.fundamentacao_nesh ?? 'Classificação amparada nas Regras Gerais de Interpretação (RGI 1 e RGI 6).'}
                                </p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1">
                                {item.parecer_cosit && (
                                  <span>
                                    <strong>Jurisprudência RFB:</strong>{' '}
                                    <span className="text-[#2563EB] font-medium underline cursor-pointer">{item.parecer_cosit}</span>
                                  </span>
                                )}
                                <span><strong>Regras Aplicadas:</strong> {item.regras_rgi ?? 'RGI 1 & 6'}</span>
                                {item.confianca_ia != null && (
                                  <span><strong>Confiança IA:</strong> {Math.round(item.confianca_ia * 100)}%</span>
                                )}
                              </div>
                            </div>

                            {/* Col 3: Tributos */}
                            <div className="bg-white p-3.5 rounded border border-[#E2E8F0] shadow-sm">
                              <div className="flex items-center justify-between text-slate-800 font-bold mb-2 pb-1 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  Detalhamento Tributário
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono uppercase">Base CIF rateada</span>
                              </div>
                              <div className="space-y-1.5 text-xs font-mono tabular-nums">
                                {item.cif_brl != null && (
                                  <div className="flex justify-between text-slate-500 text-[11px]">
                                    <span>Base CIF:</span>
                                    <span>R$ {brl(item.cif_brl)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-slate-600">
                                  <span>II ({pct(item.ii_aliquota)}):</span>
                                  <span>R$ {brl(item.ii_valor)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>IPI ({pct(item.ipi_aliquota)}):</span>
                                  <span>R$ {brl(item.ipi_valor)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>PIS Importação (2,10%):</span>
                                  <span>R$ {brl(item.pis_valor)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>COFINS Importação (9,65%):</span>
                                  <span>R$ {brl(item.cofins_valor)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>ICMS (Gross-up):</span>
                                  <span>R$ {brl(item.icms_valor)}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-[13px]">
                                  <span>Carga Total:</span>
                                  <span className="text-[#004AC6]">R$ {brl(item.carga_total_tributos)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Drawer footer */}
                          <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 text-slate-500">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Gemini 3.6 Flash · Classificação Fiscal IA
                              </span>
                              {item.risco_nivel && (
                                <>
                                  <span>·</span>
                                  <span>
                                    Nível de Risco:{' '}
                                    <strong className={item.risco_nivel === 'baixo' ? 'text-emerald-700' : item.risco_nivel === 'alto' ? 'text-red-700' : 'text-amber-700'}>
                                      {item.risco_nivel.charAt(0).toUpperCase() + item.risco_nivel.slice(1)}
                                    </strong>
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/buscar-ncms?item_id=${item.id}&item_desc=${encodeURIComponent(item.descricao_comercial)}`}
                                onClick={e => e.stopPropagation()}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-white text-slate-700 font-medium transition-colors"
                              >
                                Buscar NCM alternativo
                              </Link>
                              {item.status !== 'validado' ? (
                                <button
                                  type="button"
                                  disabled={isPending}
                                  onClick={e => { e.stopPropagation(); handleAprovar(item.id) }}
                                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded font-semibold transition-colors inline-flex items-center gap-1"
                                >
                                  <CheckIcon className="w-3.5 h-3.5" />
                                  Homologar Item
                                </button>
                              ) : (
                                <span className="text-emerald-700 text-xs font-semibold inline-flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Homologado
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}

              {/* Totals */}
              <tr className="bg-slate-100 font-semibold text-slate-900 border-t-2 border-slate-300">
                <td className="px-3 py-3 text-center font-mono">Σ</td>
                <td className="px-3 py-3 font-bold">
                  Total Geral ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
                </td>
                <td className="px-3 py-3 text-center text-xs text-slate-500">Consolidado</td>
                <td className="px-3 py-3 text-right font-mono">
                  {totalPeso > 0 ? `${totalPeso} kg` : '—'}
                </td>
                <td className="px-3 py-3 text-right font-mono">{totalQtd}</td>
                <td className="px-3 py-3 text-right font-mono">
                  <div className="font-bold">$ {usd(totalFobUsd)}</div>
                  <div className="text-[10px] text-slate-500">R$ {brl(totalFobBrl)}</div>
                </td>
                <td colSpan={5} className="px-3 py-3 text-right text-xs text-slate-600">
                  Carga Média Ponderada:
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#004AC6] text-[13px]">
                  {cargaMedia.toFixed(1)}%
                </td>
                <td className="px-3 py-3 text-center text-[11px] font-semibold text-emerald-700">
                  {aRevisar === 0 ? 'Pronto p/ DI' : `${validados}/${itens.length} ok`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 mb-8">
        {[
          {
            path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
            color: '#2563EB',
            title: 'Módulo Siscomex/Duimp',
            desc: 'Payload JSON em conformidade com o Portal Único de Comércio Exterior (Receita Federal).',
          },
          {
            path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            color: '#10B981',
            title: 'LPCO / Decex',
            desc: 'Verifique se os itens necessitam de Licença de Importação Prévia ao embarque.',
          },
          {
            path: 'M13 10V3L4 14h7v7l9-11h-7z',
            color: '#004AC6',
            title: 'Canal Estimado: Verde',
            desc: 'Parametrização aduaneira estimada com desembaraço automático sem conferência física.',
          },
        ].map(({ path, color, title, desc }) => (
          <div key={title} className="bg-white border border-[#E2E8F0] p-3 rounded flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
            </svg>
            <div>
              <strong className="text-slate-800 block">{title}</strong>
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-[220px] right-0 bg-[#0F172A] text-white py-3 px-6 z-40 border-t border-[#334155] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">
            <strong>{validados} de {itens.length} {itens.length === 1 ? 'item validado' : 'itens validados'}</strong>
            {aRevisar > 0 && (
              <span className="text-amber-400 ml-1">
                | {aRevisar} {aRevisar === 1 ? 'item requer' : 'itens requerem'} conferência
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/comparativo/${lote.id}`}
            className="px-3.5 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#93C5FD] rounded text-xs font-semibold transition-colors border border-[#475569] inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ver Auditoria Comparativa
          </Link>
          {aRevisar > 0 ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleAprovarTodos}
              className="px-4 py-1.5 bg-[#047857] hover:bg-emerald-700 disabled:opacity-60 text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <CheckIcon className="w-4 h-4" />
              Aprovar todos os itens
            </button>
          ) : (
            <button
              type="button"
              className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Transmitir para Siscomex
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
