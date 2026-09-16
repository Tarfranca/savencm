'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/nova-operacao', label: 'Nova Operação', icon: AddCircleIcon },
  { href: '/resultado', label: 'Resultado', icon: AssessmentIcon },
  { href: '/comparativo', label: 'Comparativo', icon: CompareIcon },
  { href: '/buscar-ncms', label: 'Buscar NCMs', icon: SearchIcon },
  { href: '/perfil-fiscal', label: 'Perfil Fiscal', icon: TuneIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-[#0F172A] z-50 flex flex-col justify-between py-5 border-r border-[#1E293B] select-none">
      <div>
        {/* Brand */}
        <div className="px-5 pb-5 border-b border-[#1E293B]">
          <div className="text-white text-[17px] font-bold tracking-tight">
            SAVE NCM
          </div>
          <div className="text-[#94A3B8] text-[10px] font-semibold uppercase tracking-wider mt-0.5">
            classificação fiscal
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-3 flex flex-col">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-[3px] font-medium ${
                  isActive
                    ? 'border-[#2563EB] text-white bg-[#1E293B] font-semibold'
                    : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/70'
                }`}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-5 pt-4 border-t border-[#1E293B]">
        <div className="text-[#64748B] text-xs tracking-wide font-mono">
          USP · MBA · 2026
        </div>
      </div>
    </aside>
  )
}

function AddCircleIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  )
}

function AssessmentIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  )
}

function TuneIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
    </svg>
  )
}
