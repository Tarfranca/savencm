'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { uploadInvoice } from './actions'

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function submitFile(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
      try {
        await uploadInvoice(fd)
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) return
        showToast(err instanceof Error ? err.message : 'Erro ao enviar arquivo.')
      }
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) submitFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) submitFile(file)
  }

  function handleDownloadTemplate() {
    const csv =
      'Item,Descricao_Comercial,Part_Number,NCM_Atual,Quantidade,Valor_FOB_USD,Peso_Liquido_KG\n' +
      '1,Filtro de Membrana,UF-MEM-316L,8479.89.99,120,8400.00,340\n' +
      '2,Bomba Centrifuga Inox,PUMP-SS-316L,8413.91.00,40,22000.00,560\n' +
      '3,Controlador PLC Siemens,6ES7-315-2AH14,8537.10.99,6,14200.00,85\n'
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'Template_Importacao_SaveNCM.csv'
    a.click()
    showToast('Planilha template CSV baixada com sucesso!')
  }

  return (
    <>
      {toast && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#334155] text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-5-5 1.41-1.41L10 13.17l7.59-7.59L19 7l-9 9z"/>
          </svg>
          <span>{toast}</span>
        </div>
      )}

      {/* Dropzone */}
      <div className="w-full max-w-3xl mx-auto mb-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#2563EB] bg-blue-50/50 scale-[1.005]'
              : 'border-[#CBD5E1] hover:border-[#2563EB]'
          } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
          />

          <div className="flex justify-center mb-3">
            {isPending ? (
              <svg className="w-11 h-11 text-[#2563EB] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-11 h-11 text-[#64748B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
            )}
          </div>

          <div className="text-[17px] font-semibold text-slate-800">
            {isPending ? 'Enviando arquivo…' : 'Arraste a invoice aqui'}
          </div>
          <div className="text-[13px] text-slate-500 mt-1 mb-4">
            PDF · JPEG · PNG · XLSX — qualquer formato
          </div>

          <div className="flex items-center justify-center gap-3 mb-5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              disabled={isPending}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-md inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
              <span>Selecionar arquivo</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                router.push('/processando/demo')
              }}
              disabled={isPending}
              className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
            >
              <svg className="w-4 h-4 text-[#2563EB]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Testar com Invoice Demo</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Invoice', 'Packing List', 'Foto', 'Catálogo', 'Link URL'].map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full border border-slate-200 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Secondary Cards */}
      <div className="w-full max-w-3xl mx-auto mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SecondaryCard
            icon={<ChatIcon />}
            title="Descrever no chat"
            subtitle="Sem documento? Fale sobre o produto."
            onClick={() => showToast('Em breve: entrada via chat.')}
          />
          <SecondaryCard
            icon={<PinIcon />}
            title="Tenho o NCM"
            subtitle="Validar e buscar alternativas melhores."
            href="/buscar-ncms"
          />
          <SecondaryCard
            icon={<LinkIcon />}
            title="Link do produto"
            subtitle="Cole a URL — AliExpress, Alibaba, fabricante."
            onClick={() => showToast('Em breve: entrada via URL.')}
          />
          <SecondaryCard
            icon={<DownloadIcon />}
            title="Template Excel"
            subtitle="Baixar planilha para preencher."
            onClick={handleDownloadTemplate}
            muted
          />
        </div>
      </div>
    </>
  )
}

function SecondaryCard({
  icon,
  title,
  subtitle,
  href,
  onClick,
  muted = false,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  href?: string
  onClick?: () => void
  muted?: boolean
}) {
  const cls = `group bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-col justify-between transition-all cursor-pointer ${
    muted
      ? 'hover:border-slate-400 hover:shadow-xs'
      : 'hover:border-[#2563EB] hover:shadow-xs'
  }`

  const arrow = muted ? (
    <span className="text-slate-400 group-hover:text-slate-700 text-sm font-medium group-hover:translate-x-1 transition-transform">→</span>
  ) : (
    <span className="text-[#2563EB] text-sm font-medium group-hover:translate-x-1 transition-transform">→</span>
  )

  const inner = (
    <>
      <div>
        <div className={`flex items-center mb-2 ${muted ? 'text-[#94A3B8] group-hover:text-slate-700' : 'text-[#64748B] group-hover:text-[#2563EB]'} transition-colors`}>
          {icon}
        </div>
        <div className={`text-sm font-semibold ${muted ? 'text-slate-700' : 'text-slate-900'}`}>{title}</div>
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      </div>
      <div className="flex justify-end pt-3">{arrow}</div>
    </>
  )

  if (href) {
    const { default: Link } = require('next/link') as typeof import('next/link')
    return <Link href={href} className={cls}>{inner}</Link>
  }
  return <div className={cls} onClick={onClick}>{inner}</div>
}

function ChatIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
}
function PinIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
}
function LinkIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
}
function DownloadIcon() {
  return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
}
