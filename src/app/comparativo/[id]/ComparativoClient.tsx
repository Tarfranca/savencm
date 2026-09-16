'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ItemComparativo } from './page'

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function ComparativoClient({
  loteId,
  nomeArquivo,
  comparativos,
}: {
  loteId: string
  nomeArquivo: string
  comparativos: ItemComparativo[]
}) {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Apenas itens que têm NCM anterior diferente do atual para comparar
  const comComparativo = comparativos.filter(
    i => i.ncm_anterior && i.ncm_anterior !== i.ncm_codigo
  )
  const semComparativo = comparativos.filter(
    i => !i.ncm_anterior || i.ncm_anterior === i.ncm_codigo
  )

  const economiaTotal = comComparativo.reduce((s, i) => s + Math.max(0, i.economia_operacao), 0)
  const economiaMensal = economiaTotal * 12
  const reducaoMediaPP =
    comComparativo.length > 0
      ? comComparativo.reduce((s, i) => s + i.diff_pp, 0) / comComparativo.length
      : 0

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto pb-16">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#334155] text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#BFDBFE]">
              Auditoria Tributária Comparativa
            </span>
            <span className="text-xs text-slate-500 font-mono">{nomeArquivo}</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
            Revisão e Comparativo Tributário
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {comparativos.length} {comparativos.length === 1 ? 'item analisado' : 'itens analisados'} ·{' '}
            {comComparativo.length > 0
              ? `${comComparativo.length} com divergência de enquadramento NCM`
              : 'Nenhuma divergência encontrada'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/resultado/${loteId}`}
            className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
            </svg>
            Ver Tabela Consolidada
          </Link>
          <button
            type="button"
            onClick={() => showToast('Relatório Executivo de Economia Tributária exportado em PDF!')}
            className="px-3.5 py-1.5 bg-[#004AC6] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Relatório Executivo
          </button>
        </div>
      </div>

      {/* 2. Highlight Box */}
      <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-5 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#047857] uppercase tracking-wider">
              Economia Projetada (12 embarques)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#065F46] tracking-tight font-mono">
              R$ {brl(economiaMensal)}{' '}
              <span className="text-base font-semibold text-[#047857]">/ ano</span>
            </div>
            <div className="text-xs text-[#047857]/90 mt-0.5">
              Baseado no volume deste embarque, projetado para 12 operações anuais com alíquotas TEC 2026.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/80 border border-emerald-200 rounded-lg px-4 py-2 text-center min-w-[100px]">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Redução Média</div>
            <div className="text-lg font-bold text-[#047857] font-mono">
              {reducaoMediaPP > 0 ? '-' : ''}{Math.abs(reducaoMediaPP).toFixed(1)} p.p.
            </div>
          </div>
          <div className="bg-white/80 border border-emerald-200 rounded-lg px-4 py-2 text-center min-w-[100px]">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Esta Operação</div>
            <div className="text-lg font-bold text-slate-800 font-mono">
              R$ {brl(economiaTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comparison Cards */}
      <div className="flex flex-col gap-5 mb-8">
        {comparativos.map((item, idx) => {
          const temComparativo = item.ncm_anterior && item.ncm_anterior !== item.ncm_codigo
          const diff = item.diff_pp
          const economia = item.economia_operacao

          return (
            <div
              key={item.id}
              className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm hover:border-[#2563EB]/40 transition-all"
            >
              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[#F1F5F9]">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Item {item.numero_item ?? idx + 1}{item.part_number ? ` · ${item.part_number}` : ''}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.descricao_comercial}</h3>
                </div>
                {temComparativo && economia > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-[#047857] text-xs font-bold font-mono whitespace-nowrap">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Economia: R$ {brl(economia)} nesta operação
                  </div>
                )}
              </div>

              {/* No comparison available */}
              {!temComparativo && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-3">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {!item.ncm_anterior
                    ? 'Sem NCM anterior informado para comparação.'
                    : 'NCM anterior igual ao NCM sugerido — nenhuma divergência identificada.'}
                </div>
              )}

              {/* NCM anterior existe mas não está na base TEC */}
              {temComparativo && !item.ncm_ant_na_base && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                      NCM anterior <span className="font-mono font-bold">{item.ncm_anterior}</span> não localizado na TEC 2026 — código inválido ou desatualizado. Comparativo tributário não disponível para este item.
                    </span>
                  </div>
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">Recomendação SAVE NCM</span>
                      <span className="text-[11px] font-bold text-[#047857] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Otimizado</span>
                    </div>
                    <div className="font-mono text-base font-bold text-[#0F172A] mb-1">NCM {item.ncm_codigo}</div>
                    <p className="text-xs text-slate-700">
                      II: {item.ii_atual.toFixed(1)}% · IPI: {item.ipi_atual.toFixed(1)}% · PIS: 2,10% · COFINS: 9,65%
                    </p>
                    <div className="pt-2 mt-2 border-t border-blue-200 flex items-baseline justify-between">
                      <span className="text-xs text-slate-600 font-medium">Carga Tributária Efetiva:</span>
                      <span className="text-base font-bold text-[#047857] font-mono">{item.carga_efetiva.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Side by side comparison */}
              {temComparativo && item.ncm_ant_na_base && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                  {/* Left: NCM anterior */}
                  <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Enquadramento Anterior
                        </span>
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          Carga Elevada
                        </span>
                      </div>
                      <div className="font-mono text-base font-bold text-slate-800 mb-2">
                        NCM {item.ncm_anterior}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        II: {item.ii_ant.toFixed(1)}% · IPI: {item.ipi_ant.toFixed(1)}% · PIS: 2,10% · COFINS: 9,65% · ICMS-SP: 12%
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Carga Tributária Efetiva:</span>
                      <span className="text-base font-bold text-slate-700 font-mono">
                        {item.carga_ant.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Center: Delta */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center py-2 md:py-0 gap-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div className="text-sm font-extrabold text-[#047857] font-mono">
                      {diff > 0 ? '-' : '+'}{Math.abs(diff).toFixed(1)} p.p.
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">diferença</div>
                  </div>

                  {/* Right: NCM atual */}
                  <div className="md:col-span-5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                          Recomendação SAVE NCM
                        </span>
                        <span className="text-[11px] font-bold text-[#047857] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Otimizado
                        </span>
                      </div>
                      <div className="font-mono text-base font-bold text-[#0F172A] mb-2">
                        NCM {item.ncm_codigo}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        II: {item.ii_atual.toFixed(1)}% · IPI: {item.ipi_atual.toFixed(1)}% · PIS: 2,10% · COFINS: 9,65% · ICMS-SP: 12%
                      </p>
                    </div>
                    <div className="pt-3 border-t border-blue-200 flex items-baseline justify-between">
                      <span className="text-xs text-slate-600 font-medium">Carga Tributária Efetiva:</span>
                      <span className="text-base font-bold text-[#047857] font-mono">
                        {item.carga_efetiva.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical subtext */}
              {item.fundamentacao_nesh && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <span className="italic line-clamp-1">{item.fundamentacao_nesh.slice(0, 120)}…</span>
                  <Link
                    href={`/resultado/${loteId}`}
                    className="text-[#2563EB] font-semibold hover:underline whitespace-nowrap"
                  >
                    Ver fundamentação completa →
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 4. Footer summary */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#2563EB] shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>{comparativos.length} {comparativos.length === 1 ? 'item auditado' : 'itens auditados'}</strong>
            {comComparativo.length > 0 && (
              <> · <strong>{comComparativo.length}</strong> com divergência · Redução média de <strong>{Math.abs(reducaoMediaPP).toFixed(1)} p.p.</strong></>
            )}
            {' '}· Enquadramentos amparados nas NESH (Notas Explicativas do SH).
          </span>
        </div>
        <button
          type="button"
          onClick={() => showToast('Dossiê Siscomex gerado com sucesso!')}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-semibold transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          Gerar Dossiê Siscomex
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
