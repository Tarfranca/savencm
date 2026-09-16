import { createClient } from '@/lib/supabase/server'
import type { Lote, Alerta } from '@/lib/supabase/types'
import { UploadZone } from './UploadZone'
import Link from 'next/link'

export default async function NovaOperacaoPage() {
  const supabase = await createClient()

  const [{ data: lotes }, { data: alertas }] = await Promise.all([
    supabase
      .from('lotes')
      .select('id, nome_arquivo, origem, status, created_at')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('alertas')
      .select('id, tipo, titulo, descricao, economia_potencial_brl')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto px-8 py-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          O que você tem disponível?
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          A IA lê o documento e classifica — sem formulários.
        </p>
      </div>

      {/* Upload dropzone + secondary cards (client) */}
      <UploadZone />

      {/* Bottom 2-column section */}
      <div className="grid grid-cols-12 gap-6 w-full items-start">
        {/* Operações Recentes — 7 cols */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-[#E2E8F0] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Operações recentes</h2>
            <Link href="/resultado" className="text-xs font-medium text-[#2563EB] hover:underline">
              Ver todas
            </Link>
          </div>

          {!lotes || lotes.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Nenhuma operação ainda. Envie sua primeira invoice acima.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 h-8 border-b border-[#E2E8F0]">
                    {['Documento', 'Origem', 'Câmbio', 'Data', 'Status'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(lotes as any[]).map((lote: Lote) => (
                    <tr
                      key={lote.id}
                      className="h-10 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-3 text-slate-800 text-xs font-medium whitespace-nowrap">
                        <Link href={`/resultado/${lote.id}`} className="hover:text-[#2563EB]">
                          {lote.nome_arquivo}
                        </Link>
                      </td>
                      <td className="px-3 text-slate-500 text-xs text-right">{lote.origem_pais ?? '—'}</td>
                      <td className="px-3 text-slate-600 text-xs text-right font-mono tabular-nums">
                        {/* câmbio shown when available */}—
                      </td>
                      <td className="px-3 text-slate-500 text-xs text-right whitespace-nowrap">
                        {new Date(lote.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-3 text-right whitespace-nowrap">
                        <StatusBadge status={lote.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertas Pendentes — 5 cols */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-[#E2E8F0] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Alertas pendentes</h2>
            <span className="text-xs text-slate-400 font-medium">
              {alertas?.length ?? 0} ativo{alertas?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {!alertas || alertas.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Nenhum alerta. Os alertas aparecem após o processamento.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {(alertas as Alerta[]).map((alerta) => {
                const isRisk = alerta.tipo === 'risco'
                return (
                  <div
                    key={alerta.id}
                    className={`border-l-[3px] ${isRisk ? 'border-l-[#DC2626]' : 'border-l-[#047857]'} bg-white p-3 rounded-r-lg border-y border-r border-[#E2E8F0] hover:bg-slate-50/70 transition-colors cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm text-slate-900 leading-tight">
                        {alerta.titulo}
                      </div>
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isRisk ? 'text-[#DC2626] bg-red-50' : 'text-[#047857] bg-emerald-50'
                        }`}
                      >
                        {isRisk ? 'Risco RFB' : 'Benefício'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{alerta.descricao}</p>
                    {alerta.economia_potencial_brl && (
                      <p className="text-xs font-semibold text-[#047857] mt-1">
                        Economia potencial:{' '}
                        {alerta.economia_potencial_brl.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'concluido') {
    return (
      <span className="inline-flex items-center bg-emerald-50 text-[#047857] border border-emerald-200 text-xs px-2 py-0.5 rounded-md font-medium">
        Concluído
      </span>
    )
  }
  if (status === 'processando') {
    return (
      <span className="inline-flex items-center bg-blue-50 text-[#2563EB] border border-blue-200 text-xs px-2 py-0.5 rounded-md font-medium">
        Processando
      </span>
    )
  }
  return (
    <span className="inline-flex items-center bg-red-50 text-[#DC2626] border border-red-200 text-xs px-2 py-0.5 rounded-md font-medium">
      Erro
    </span>
  )
}
