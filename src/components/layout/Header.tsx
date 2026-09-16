import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const breadcrumbs: Record<string, string> = {
  '/nova-operacao': 'Início · Submissão de Documentos',
  '/resultado': 'Resultado · Memória Aduaneira e Enquadramento',
  '/comparativo': 'Auditoria Tributária Comparativa',
  '/buscar-ncms': 'Consulta NCM & Base TEC 2026',
  '/perfil-fiscal': 'Configurações de Perfil Fiscal',
  '/processando': 'Processamento de Documentos em Execução',
}

interface HeaderProps {
  pathname: string
}

export async function Header({ pathname }: HeaderProps) {
  const supabase = await createClient()
  const { data: perfil } = await supabase
    .from('perfil_fiscal')
    .select('regime, estado')
    .single()

  const regime =
    perfil?.regime === 'lucro_real'
      ? 'Lucro Real'
      : perfil?.regime === 'lucro_presumido'
      ? 'Lucro Presumido'
      : perfil?.regime === 'simples'
      ? 'Simples Nacional'
      : 'Lucro Real'

  const estado = perfil?.estado ?? 'SP'

  const segment = '/' + (pathname.split('/')[1] ?? '')
  const breadcrumb = breadcrumbs[segment] ?? ''

  return (
    <header className="fixed top-0 left-[220px] right-0 h-14 bg-white border-b border-[#E2E8F0] z-40 flex items-center justify-between px-6 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#64748B]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 3h-2v-2h2v2zm0-4h-2V7h2v4z"/>
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            SAVE NCM Engine
          </span>
        </div>

        {breadcrumb && (
          <>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-xs text-slate-500 font-medium">{breadcrumb}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/perfil-fiscal"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold hover:bg-blue-100 transition-colors"
          title="Clique para configurar o Perfil Fiscal"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span>{regime} · {estado}</span>
        </Link>

        <div
          className="w-8 h-8 rounded-full bg-[#004AC6] flex items-center justify-center text-white shadow-xs"
          title="Usuário Corporativo"
        >
          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    </header>
  )
}
