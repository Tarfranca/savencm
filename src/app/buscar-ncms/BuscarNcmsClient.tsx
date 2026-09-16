'use client'

import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { aplicarNcmAlternativo, criarItemAvulso } from './actions'

// ── Types ─────────────────────────────────────────────────────────────────────
type ExTarifario = {
  tipo: string | null
  aliquota: number
  descricao: string
}

type NcmRow = {
  codigo: string
  descricao: string
  ii_aliquota: number
  ipi_aliquota: number
  pis_aliquota: number
  cofins_aliquota: number
  nesh_nota: string | null
  ato_legal: string | null
  carga_efetiva: number
  capitulo: string
  ex_tarifario: ExTarifario | null
  match_type?: string
}

type SearchResult = {
  results: NcmRow[]
  total: number
  page: number
  mode?: 'initial' | 'rpc' | 'ilike' | 'codigo' | 'empty'
}

// ── Modal para criação de item avulso ─────────────────────────────────────────
type ModalAvulsoProps = {
  ncm: NcmRow
  onClose: () => void
  onConfirm: (dados: { descricao: string; quantidade: number; valorFobUsd: number; pesoKg: number | null }) => void
  isPending: boolean
}

function ModalAvulso({ ncm, onClose, onConfirm, isPending }: ModalAvulsoProps) {
  const [descricao, setDescricao] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [valorFob, setValorFob] = useState('')
  const [pesoKg, setPesoKg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!descricao.trim() || !valorFob || parseFloat(valorFob) <= 0) return
    onConfirm({
      descricao: descricao.trim(),
      quantidade: Math.max(1, parseInt(quantidade) || 1),
      valorFobUsd: parseFloat(valorFob),
      pesoKg: pesoKg ? parseFloat(pesoKg) : null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-[#E2E8F0] w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Criar item com este NCM</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              NCM <span className="font-mono font-bold text-slate-700">{ncm.codigo}</span>
              {' '}— {ncm.descricao.slice(0, 60)}{ncm.descricao.length > 60 ? '…' : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tax preview pill */}
        <div className="mx-5 mt-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-mono flex items-center justify-between">
          <span>II {ncm.ii_aliquota.toFixed(1)}% · IPI {ncm.ipi_aliquota.toFixed(1)}%</span>
          <span className="font-bold text-[#047857]">Carga efetiva: {ncm.carga_efetiva.toFixed(1)}%</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Descrição comercial <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: Válvula de esfera de latão, PN16, DN25"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB] bg-slate-50 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                min="1"
                step="1"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB] bg-slate-50 focus:bg-white transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Valor FOB (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={valorFob}
                onChange={e => setValorFob(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB] bg-slate-50 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Peso líquido (kg) <span className="text-slate-400 font-normal">— opcional</span>
            </label>
            <input
              type="number"
              value={pesoKg}
              onChange={e => setPesoKg(e.target.value)}
              min="0"
              step="0.001"
              placeholder="0.000"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB] bg-slate-50 focus:bg-white transition-all font-mono"
            />
          </div>

          <div className="pt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !descricao.trim() || !valorFob}
              className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              {isPending ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Criar e ver resultado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const QUICK_CHIPS_DESCRICAO = ['filtro', 'bomba centrífuga', 'painel elétrico', 'válvula']
const QUICK_CHIPS_CODIGO = ['8421.29.90', '8413', '8537.10', '8481']
const CAPITULO_MAP: Record<string, string> = {
  '39': 'Plásticos', '72': 'Ferro/Aço', '73': 'Art. Ferro/Aço',
  '76': 'Alumínio', '84': 'Máquinas', '85': 'Eletroeletrônicos',
  '87': 'Veículos', '90': 'Instrumentos',
}

function capituloLabel(cap: string): string {
  return CAPITULO_MAP[cap] ? `Cap. ${cap} — ${CAPITULO_MAP[cap]}` : `Cap. ${cap}`
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function BuscarNcmsClient({
  itemId,
  itemDescricao,
}: {
  itemId?: string
  itemDescricao?: string
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'descricao' | 'codigo'>('descricao')
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<NcmRow[]>([])
  const [total, setTotal] = useState(0)
  const [searchMode, setSearchMode] = useState<SearchResult['mode']>('initial')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [modalNcm, setModalNcm] = useState<NcmRow | null>(null)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cenário A: veio de um item existente
  const modoSubstituicao = !!itemId

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const search = useCallback(async (q: string, m: typeof mode, p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ncm/search?q=${encodeURIComponent(q)}&mode=${m}&page=${p}`)
      const data: SearchResult = await res.json()
      setResults(data.results ?? [])
      setTotal(data.total ?? 0)
      setSearchMode(data.mode ?? (q ? 'ilike' : 'initial'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setQuery(input)
      setPage(1)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input])

  // Fetch on query/mode/page change
  useEffect(() => {
    search(query, mode, page)
  }, [query, mode, page, search])

  const handleChip = (chip: string) => { setInput(chip) }

  const handleModeSwitch = (m: typeof mode) => {
    setMode(m)
    setInput('')
    setQuery('')
    setResults([])
    setTotal(0)
    setPage(1)
  }

  const toggleRow = (codigo: string) => {
    setExpanded(prev => ({ ...prev, [codigo]: !prev[codigo] }))
  }

  // ── Handlers para botões "Usar" ──────────────────────────────────────────────

  const handleUsarNcm = (row: NcmRow, e: React.MouseEvent) => {
    e.stopPropagation()
    if (modoSubstituicao) {
      // Cenário A: aplicar diretamente ao item
      startTransition(async () => {
        await aplicarNcmAlternativo(itemId!, row.codigo)
      })
    } else {
      // Cenário B: abrir modal para criar item avulso
      setModalNcm(row)
    }
  }

  const handleConfirmarAvulso = (dados: { descricao: string; quantidade: number; valorFobUsd: number; pesoKg: number | null }) => {
    if (!modalNcm) return
    startTransition(async () => {
      await criarItemAvulso(modalNcm.codigo, dados)
    })
  }

  const totalPages = Math.ceil(total / 20)

  const btnLabel = modoSubstituicao ? 'Aplicar a este item' : 'Criar item com este NCM'

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-16">

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#334155] text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {toast}
        </div>
      )}

      {/* Banner de substituição (Cenário A) */}
      {modoSubstituicao && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <svg className="w-4 h-4 text-[#2563EB] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#1D4ED8]">Modo substituição — </span>
              <span className="text-xs text-blue-800">
                Substituindo NCM do item:{' '}
                <strong className="font-semibold">{itemDescricao ?? 'item selecionado'}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="shrink-0 px-3 py-1 text-[11px] font-semibold border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Buscar NCMs</h1>
            <span className="bg-emerald-50 text-[#047857] text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Base TEC 2026 Vigente
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta com cruzamento de alíquotas aduaneiras, notas NESH e ex-tarifários ativos
          </p>
        </div>
        {!modoSubstituicao && (
          <Link
            href="/nova-operacao"
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload de Invoice
          </Link>
        )}
      </div>

      {/* 2. Search Box */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-sm">

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg w-fit mb-4 border border-slate-200">
          {(['descricao', 'codigo'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeSwitch(m)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === m
                  ? 'bg-white text-[#2563EB] shadow-sm border border-[#BFDBFE]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'descricao' ? 'Por descrição' : 'Por código NCM'}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex items-center">
          <svg className="absolute left-4 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'descricao'
                ? 'Digite a descrição do produto (ex: filtro, bomba centrífuga)…'
                : 'Digite o código NCM ou prefixo (ex: 8421.29.90, 8421, 84)…'
            }
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-[#CBD5E1] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
            autoFocus
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick chips */}
        <div className="mt-4 flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Exemplos:
          </span>
          {(mode === 'descricao' ? QUICK_CHIPS_DESCRICAO : QUICK_CHIPS_CODIGO).map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                input.toLowerCase() === chip.toLowerCase()
                  ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Results header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-xs text-slate-600">
          {loading ? (
            <span className="text-slate-400">Buscando…</span>
          ) : searchMode === 'initial' ? (
            <span className="text-slate-500">
              <strong>{results.length}</strong> NCMs frequentes em importação — comece a digitar para filtrar
            </span>
          ) : (
            <>
              <strong>{total.toLocaleString('pt-BR')}</strong>{' '}
              {total === 1 ? 'resultado' : 'resultados'} para{' '}
              <strong className="text-slate-900">"{query}"</strong>
              {searchMode === 'rpc' && (
                <span className="ml-1 text-[11px] text-emerald-600 font-medium">(full-text + fuzzy)</span>
              )}
              {totalPages > 1 && (
                <span className="text-slate-400"> · página {page} de {totalPages}</span>
              )}
            </>
          )}
        </div>
        <div className="text-xs text-slate-400">
          Regime: <strong>Lucro Real — SP</strong>
        </div>
      </div>

      {/* 4. Results table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white h-10 border-b border-[#334155]">
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 w-10 text-center" />
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 min-w-[130px]">
                  Código NCM
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 min-w-[280px]">
                  Descrição TEC 2026
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right whitespace-nowrap">
                  II
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right whitespace-nowrap">
                  IPI
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right whitespace-nowrap">
                  PIS
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right whitespace-nowrap">
                  COFINS
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right whitespace-nowrap">
                  Carga Efetiva
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-center whitespace-nowrap">
                  Ex-Tarifário
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-center whitespace-nowrap">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-[#2563EB]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Consultando base TEC 2026…</span>
                    </div>
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">Nenhum código NCM encontrado para "{query}"</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {mode === 'descricao'
                        ? 'Tente palavras-chave como "filtro", "bomba" ou "painel"'
                        : 'Tente um prefixo como "8421", "8413" ou "8537"'}
                    </p>
                  </td>
                </tr>
              ) : (
                results.map(row => {
                  const isExpanded = !!expanded[row.codigo]
                  const ex = row.ex_tarifario
                  return (
                    <React.Fragment key={row.codigo}>
                      <tr
                        onClick={() => toggleRow(row.codigo)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/30' : ''}`}
                      >
                        {/* Expand toggle */}
                        <td className="px-3 py-3 text-center text-slate-400">
                          <svg
                            className={`w-4 h-4 mx-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>

                        {/* Código */}
                        <td className="px-3 py-3">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {row.codigo}
                          </span>
                        </td>

                        {/* Descrição + capítulo */}
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-900 leading-snug flex items-start gap-1.5 flex-wrap">
                            {row.descricao}
                            {row.match_type === 'trgm' && (
                              <span className="inline-flex items-center px-1.5 py-0 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
                                fuzzy
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{capituloLabel(row.capitulo)}</div>
                        </td>

                        {/* Alíquotas */}
                        <td className="px-2 py-3 text-right font-mono text-slate-800 whitespace-nowrap">
                          {row.ii_aliquota.toFixed(1)}%
                        </td>
                        <td className="px-2 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          {row.ipi_aliquota.toFixed(1)}%
                        </td>
                        <td className="px-2 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          {row.pis_aliquota.toFixed(2)}%
                        </td>
                        <td className="px-2 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          {row.cofins_aliquota.toFixed(2)}%
                        </td>

                        {/* Carga efetiva */}
                        <td className="px-3 py-3 text-right font-mono font-bold text-[#0F172A] whitespace-nowrap">
                          {row.carga_efetiva.toFixed(1)}%
                        </td>

                        {/* Ex-tarifário pill */}
                        <td className="px-3 py-3 text-center">
                          {ex ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              ex.tipo === 'BIT'
                                ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                                : 'bg-emerald-50 text-[#047857] border-emerald-200'
                            }`}>
                              Sim{ex.tipo ? ` (${ex.tipo})` : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              Não
                            </span>
                          )}
                        </td>

                        {/* Ação */}
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={e => handleUsarNcm(row, e)}
                            className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded text-[11px] font-semibold transition-colors shadow-sm inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            {isPending ? (
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            )}
                            Usar
                          </button>
                        </td>
                      </tr>

                      {/* Expandable drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-[#E2E8F0]">
                          <td colSpan={10} className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">

                              {/* Left: NESH + Ex-Tarifário */}
                              <div className="lg:col-span-7 bg-white p-3.5 rounded border border-[#E2E8F0]">
                                <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-2 pb-1 border-b border-slate-100">
                                  <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                  <span>Notas Explicativas NESH</span>
                                </div>

                                <div className="bg-slate-50 p-3 rounded border border-slate-200/70 text-[11px] text-slate-700 font-mono leading-relaxed italic">
                                  {row.nesh_nota
                                    ? row.nesh_nota
                                    : 'Nota explicativa não cadastrada para este código.'}
                                </div>

                                {ex && (
                                  <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <div>
                                      <div className="font-bold text-emerald-800 mb-0.5">
                                        Ex-Tarifário Ativo {ex.tipo ? `(${ex.tipo})` : ''} — II reduzido para {ex.aliquota.toFixed(1)}%
                                      </div>
                                      <div className="text-emerald-700">{ex.descricao}</div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right: Tax breakdown */}
                              <div className="lg:col-span-5 bg-white p-3.5 rounded border border-[#E2E8F0] flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-2 pb-1 border-b border-slate-100">
                                    <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span>Detalhamento Tributário — SP (ref. CIF=100)</span>
                                  </div>

                                  <div className="space-y-1.5 text-slate-600">
                                    {[
                                      ['II (Imposto de Importação)', `${row.ii_aliquota.toFixed(1)}%`],
                                      ['IPI (sobre CIF+II)', `${row.ipi_aliquota.toFixed(1)}%`],
                                      ['PIS-Importação', `${row.pis_aliquota.toFixed(2)}%`],
                                      ['COFINS-Importação', `${row.cofins_aliquota.toFixed(2)}%`],
                                      ['ICMS-SP (gross-up 12%)', '12,00%'],
                                    ].map(([label, value]) => (
                                      <div key={label} className="flex justify-between">
                                        <span>{label}</span>
                                        <span className="font-mono font-semibold text-slate-800">{value}</span>
                                      </div>
                                    ))}

                                    {row.ato_legal && (
                                      <div className="flex justify-between pt-1 border-t border-slate-100">
                                        <span>Ato Legal Vigente</span>
                                        <span className="font-semibold text-slate-800 font-mono">{row.ato_legal}</span>
                                      </div>
                                    )}

                                    <div className="flex justify-between pt-2 border-t border-[#E2E8F0] mt-1">
                                      <span className="font-bold text-slate-900">Carga Efetiva s/ CIF</span>
                                      <span className="font-mono font-extrabold text-[#047857] text-sm">
                                        {row.carga_efetiva.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400">Fonte: TEC 2026 / CAMEX</span>
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={e => handleUsarNcm(row, e)}
                                    className="px-3 py-1.5 bg-[#004AC6] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                                  >
                                    {isPending ? (
                                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {btnLabel}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Pagination */}
      {query && searchMode !== 'initial' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-xs font-semibold border border-[#CBD5E1] rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs font-semibold rounded transition-colors ${
                    p === page
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[#CBD5E1] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-xs font-semibold border border-[#CBD5E1] rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}

      {/* 6. Footer note */}
      <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Tabela TEC 2026 mantida em conformidade com as deliberações do Comitê de Alterações Tarifárias da CAMEX.
            Carga efetiva calculada sobre CIF base 100, regime Lucro Real, ICMS-SP 12%.
          </span>
        </div>
        <span className="font-mono text-[11px] whitespace-nowrap text-slate-400">
          {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Modal Cenário B */}
      {modalNcm && (
        <ModalAvulso
          ncm={modalNcm}
          onClose={() => setModalNcm(null)}
          onConfirm={handleConfirmarAvulso}
          isPending={isPending}
        />
      )}
    </div>
  )
}
