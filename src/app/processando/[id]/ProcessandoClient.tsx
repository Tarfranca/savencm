'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  loteId: string
  fileName: string
  initialStatus?: string
}

const CIRCUMFERENCE = 263.89

export function ProcessandoClient({ loteId, fileName, initialStatus }: Props) {
  const [progress, setProgress] = useState(60)
  const [secondsRemaining, setSecondsRemaining] = useState(35)
  const router = useRouter()

  const [logLines, setLogLines] = useState<string[]>([
    '[00:00] INFO :: Lote recebido — iniciando pipeline Gemini…',
  ])

  const phase = progress >= 90 ? 'calculating' : 'classifying'
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progress) / 100

  // Disparar processamento real ao montar
  useEffect(() => {
    if (loteId === 'demo' || initialStatus === 'concluido') return

    fetch(`/api/lotes/${loteId}/processar`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.items) {
          setLogLines(l => [...l, `[OK] Gemini processou ${d.items} itens com sucesso.`])
        }
      })
      .catch(() => {
        setLogLines(l => [...l, '[ERRO] Falha na comunicação com o servidor.'])
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId])

  // Polling: redirect when lote status becomes 'concluido'
  useEffect(() => {
    if (loteId === 'demo' || initialStatus === 'concluido') return

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/lotes/${loteId}/status`)
        const { status } = await res.json()
        if (status === 'concluido') {
          clearInterval(poll)
          setLogLines(l => [...l, '[OK] Classificação concluída — redirecionando…'])
          setTimeout(() => router.push(`/resultado/${loteId}`), 800)
        } else if (status === 'erro') {
          clearInterval(poll)
          setLogLines(l => [...l, '[ERRO] Processamento falhou. Verifique o arquivo.'])
          setTimeout(() => router.push(`/resultado/${loteId}`), 1500)
        }
      } catch { /* ignore */ }
    }, 3000)

    return () => clearInterval(poll)
  }, [loteId, initialStatus, router])

  // Animate progress bar for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 97 ? 97 : p + 1))
      setSecondsRemaining((s) => (s > 5 ? s - 1 : 4))
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  function goToResult() {
    router.push(loteId === 'demo' ? '/resultado' : `/resultado/${loteId}`)
  }

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto px-8 py-8 pb-12">
      {/* Page header + wizard */}
      <div className="w-full pb-5 mb-6 border-b border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Nova Operação</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditoria e classificação automatizada de documentos de importação
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#004AC6]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
            <span className="uppercase tracking-wider">Etapa 2 de 4 em execução</span>
          </div>
        </div>

        {/* 4-step wizard */}
        <div className="mt-6 pt-2 max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#E2E8F0] -z-0">
              <div className="h-full bg-[#2563EB] transition-all duration-700" style={{ width: `${Math.min(progress, 68)}%` }} />
            </div>
            <WizardStep label="1. Upload" done />
            <WizardStep label="2. Processando" active />
            <WizardStep label="3. Resultado" number={3} onClick={goToResult} />
            <WizardStep label="4. Exportar" number={4} />
          </div>
        </div>
      </div>

      {/* File info bar */}
      <div className="w-full max-w-2xl mx-auto mb-4">
        <div className="bg-white border border-[#E2E8F0] rounded px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#DC2626]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
              </svg>
            </div>
            <div>
              <span className="text-slate-900 text-sm font-semibold font-mono block truncate max-w-[300px]">
                {fileName}
              </span>
              <span className="text-slate-500 text-[11px]">Hash SHA-256 verificado</span>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-semibold uppercase tracking-wide">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>
            Enviado com sucesso
          </span>
        </div>
      </div>

      {/* Main status card */}
      <div className="w-full max-w-2xl mx-auto bg-white border border-[#E2E8F0] rounded p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F1F5F9]">
          <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex flex-col items-center text-center">
          {/* Circular progress */}
          <div className="relative w-28 h-28 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#2563EB"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="7"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#2563EB] text-2xl font-bold tracking-tight font-mono tabular-nums">
                {progress}%
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest -mt-1 font-semibold">
                fase 2/3
              </span>
            </div>
          </div>

          <h2 className="text-slate-900 text-lg font-semibold tracking-tight mt-3">
            {phase === 'calculating' ? 'Calculando tributos…' : 'Classificando itens…'}
          </h2>
          <p className="text-slate-500 text-xs max-w-md mx-auto mt-1 leading-relaxed">
            A IA está lendo a invoice, cruzando descrições com a NCM e aplicando as Regras Gerais de Interpretação (RGI).
          </p>

          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden my-5">
            <div className="bg-[#2563EB] h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Pipeline steps */}
        <div className="w-full border-t border-b border-[#F1F5F9] py-4 my-1 flex flex-col gap-3.5">
          <PipelineStep done label="Extração de texto e dados da invoice" detail="Concluído (3 itens detectados)" />
          <PipelineStep
            active={progress < 95}
            done={progress >= 95}
            label={`Classificação NCM por item (${progress >= 95 ? '3 de 3' : '2 de 3'})`}
            detail={progress >= 95 ? '3 itens correlacionados' : 'Consultando NESH, Soluções Cosit e TEC 2026…'}
          />
          <PipelineStep
            done={progress >= 98}
            muted={progress < 90}
            label="Cálculo tributário completo (II, IPI, PIS, COFINS, ICMS-SP)"
            detail={progress >= 98 ? 'Finalizado' : 'Aguardando'}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center mt-4 gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-slate-600 text-xs font-medium">
            <svg className="w-4 h-4 text-[#2563EB]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
            <span className="tabular-nums">
              Tempo estimado restante: <strong>{secondsRemaining}s</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              API Receita Federal: Ativa
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Base TEC 2026: Sincronizada
            </span>
          </div>

          <button
            onClick={goToResult}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-5 py-2.5 rounded transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Avançar para Resultado</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
          </button>

          <p className="text-slate-400 text-xs italic text-center pt-3 border-t border-[#F1F5F9] w-full max-w-lg">
            Você pode fechar esta janela — avisamos por e-mail quando a classificação estiver concluída.
          </p>
        </div>
      </div>

      {/* Terminal log */}
      <div className="w-full max-w-2xl mx-auto mt-4">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3 text-[11px] font-mono text-slate-600">
          <div className="flex items-center justify-between text-slate-700 font-semibold pb-1.5 mb-1.5 border-b border-[#E2E8F0]">
            <span className="uppercase tracking-wider text-[10px]">Log de Auditoria em Tempo Real</span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {loteId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="space-y-1 leading-relaxed">
            {logLines.map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith('[ERRO]') ? 'text-red-500' :
                  line.startsWith('[OK]') ? 'text-[#047857]' :
                  i === logLines.length - 1 ? 'text-[#2563EB] animate-pulse' :
                  'text-slate-500'
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WizardStep({
  label, done, active, number, onClick,
}: {
  label: string; done?: boolean; active?: boolean; number?: number; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`relative z-10 flex flex-col items-center bg-[#F8FAFC] px-2 ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm relative ${
        done
          ? 'bg-[#047857] text-white'
          : active
          ? 'bg-[#2563EB] text-white'
          : 'bg-white border-2 border-[#CBD5E1] text-[#94A3B8] font-medium'
      }`}>
        {done ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        ) : active ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="absolute inset-0 rounded-full border-2 border-[#2563EB] animate-ping opacity-30" />
          </>
        ) : number}
      </div>
      <span className={`mt-1.5 text-xs font-medium ${
        done ? 'text-[#047857] font-semibold' : active ? 'text-[#2563EB] font-bold' : 'text-slate-500'
      }`}>
        {label}
      </span>
    </div>
  )
}

function PipelineStep({
  label, detail, done, active, muted,
}: {
  label: string; detail: string; done?: boolean; active?: boolean; muted?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${muted ? 'opacity-60' : ''} ${active ? 'bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          done
            ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]'
            : active
            ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]'
            : 'bg-white border border-[#CBD5E1] text-slate-400'
        }`}>
          {done ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          ) : active ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
          )}
        </div>
        <span className={`text-xs ${done || active ? 'text-slate-900 font-medium' : 'text-slate-800'}`}>{label}</span>
      </div>
      <span className={`shrink-0 text-[11px] font-semibold font-mono ${
        done ? 'text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded' : 'text-slate-500 uppercase tracking-wider'
      }`}>
        {detail}
      </span>
    </div>
  )
}
