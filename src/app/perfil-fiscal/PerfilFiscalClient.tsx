'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Regime = 'lucro_real' | 'lucro_presumido' | 'simples'

const REGIME_LABELS: Record<Regime, string> = {
  lucro_real: 'Lucro Real',
  lucro_presumido: 'Lucro Presumido',
  simples: 'Simples Nacional',
}

const REGIME_DESC: Record<Regime, string> = {
  lucro_real: 'PIS 1,65% · COFINS 7,6% (não-cumulativo)',
  lucro_presumido: 'PIS 0,65% · COFINS 3% (cumulativo)',
  simples: 'PIS/COFINS incluídos no DAS',
}

const REGIMES_ESPECIAIS_OPTIONS = [
  { id: 'drawback', label: 'Drawback Suspensão', desc: 'Suspensão de II, IPI, PIS e COFINS na importação para industrialização e exportação' },
  { id: 'ex_tarifario', label: 'Ex-Tarifário', desc: 'Redução de II para BK/BIT sem similar nacional homologado pela CAMEX' },
  { id: 'recof', label: 'RECOF', desc: 'Regime aduaneiro especial para montadoras e fornecedores de autopeças' },
  { id: 'regime_entreposto', label: 'Entreposto Aduaneiro', desc: 'Depósito de mercadorias em local alfandegado com suspensão de tributos' },
  { id: 'adi', label: 'Admissão Temporária (ADI)', desc: 'Importação temporária com suspensão total ou parcial dos tributos' },
]

export default function PerfilFiscalClient() {
  const supabase = createClient()

  const [regime, setRegime] = useState<Regime>('lucro_real')
  const [regimesEspeciais, setRegimesEspeciais] = useState<string[]>([])
  const [alertaVariacao, setAlertaVariacao] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [perfilId, setPerfilId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('perfil_fiscal')
        .select('id, regime, regimes_especiais, alerta_variacao')
        .single()

      if (data) {
        setPerfilId(data.id)
        setRegime((data.regime as Regime) ?? 'lucro_real')
        setRegimesEspeciais((data.regimes_especiais as string[]) ?? [])
        setAlertaVariacao(data.alerta_variacao ?? true)
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  function toggleEspecial(id: string) {
    setRegimesEspeciais(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    setSaving(true)
    const payload = { regime, regimes_especiais: regimesEspeciais, alerta_variacao: alertaVariacao }

    if (perfilId) {
      await supabase.from('perfil_fiscal').update(payload).eq('id', perfilId)
    } else {
      const { data } = await supabase.from('perfil_fiscal').insert(payload).select('id').single()
      if (data) setPerfilId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Perfil Fiscal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurações estáveis da empresa — campos que não variam por embarque.
          Modal, moeda, incoterm e câmbio são extraídos automaticamente de cada invoice.
        </p>
      </div>

      {/* Card 1 — Regime Tributário */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-bold">R</div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Regime Tributário</h2>
            <p className="text-xs text-slate-500">Afeta as alíquotas de PIS e COFINS nos cálculos</p>
          </div>
        </div>

        <div className="space-y-2">
          {(Object.keys(REGIME_LABELS) as Regime[]).map(r => (
            <label
              key={r}
              className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                regime === r
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="regime"
                value={r}
                checked={regime === r}
                onChange={() => setRegime(r)}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <div className="text-sm font-medium text-slate-800">{REGIME_LABELS[r]}</div>
                <div className="text-xs text-slate-500 mt-0.5">{REGIME_DESC[r]}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Card 2 — Regimes Especiais */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-bold">E</div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Regimes Especiais Ativos</h2>
            <p className="text-xs text-slate-500">Habilitações da empresa junto à Receita Federal — não variam por embarque</p>
          </div>
        </div>

        <div className="space-y-2">
          {REGIMES_ESPECIAIS_OPTIONS.map(op => (
            <label
              key={op.id}
              className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                regimesEspeciais.includes(op.id)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={regimesEspeciais.includes(op.id)}
                onChange={() => toggleEspecial(op.id)}
                className="mt-0.5 accent-emerald-600"
              />
              <div>
                <div className="text-sm font-medium text-slate-800">{op.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{op.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {regimesEspeciais.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {regimesEspeciais.map(id => {
              const op = REGIMES_ESPECIAIS_OPTIONS.find(o => o.id === id)
              return op ? (
                <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {op.label}
                </span>
              ) : null
            })}
          </div>
        )}
      </div>

      {/* Card 3 — Alertas */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 text-sm font-bold">A</div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Alertas e Notificações</h2>
            <p className="text-xs text-slate-500">Configure quando o SAVE NCM deve gerar alertas automáticos</p>
          </div>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={alertaVariacao}
            onChange={e => setAlertaVariacao(e.target.checked)}
            className="mt-0.5 accent-amber-500"
          />
          <div>
            <div className="text-sm font-medium text-slate-800">Alertar quando NCM sugerido difere do declarado</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Gera um alerta de oportunidade ou risco sempre que a IA classificar diferente do NCM original da invoice
            </div>
          </div>
        </label>
      </div>

      {/* Nota informativa */}
      <div className="flex items-start gap-2.5 text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded p-3">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Modal, moeda, incoterm, câmbio e estado de desembaraço</strong> são extraídos automaticamente
          pela IA a partir do conteúdo de cada invoice e salvos individualmente por embarque.
          O câmbio usa a cotação PTAX do Banco Central do Brasil no dia do upload.
        </span>
      </div>

      {/* Salvar */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-md transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium">Configurações salvas</span>
        )}
      </div>
    </div>
  )
}
