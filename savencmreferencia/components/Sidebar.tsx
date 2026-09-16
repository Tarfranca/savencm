import React from 'react';
import { ScreenType } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  onOpenDirectLinksModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenDirectLinksModal,
}) => {
  const navItems = [
    {
      path: 'nova-operacao' as ScreenType,
      label: 'Nova Operação',
      icon: 'add_circle',
    },
    {
      path: 'resultado' as ScreenType,
      label: 'Resultado',
      icon: 'assessment',
    },
    {
      path: 'buscar-ncms' as ScreenType,
      label: 'Buscar NCMs',
      icon: 'search',
    },
    {
      path: 'revisar' as ScreenType,
      label: 'Revisar',
      icon: 'rule',
    },
    {
      path: 'perfil-fiscal' as ScreenType,
      label: 'Perfil Fiscal',
      icon: 'tune',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-[#0F172A] z-50 flex flex-col justify-between py-5 border-r border-[#1E293B] select-none">
      <div>
        {/* Brand Header */}
        <div 
          className="px-5 pb-6 border-b border-[#1E293B] cursor-pointer"
          onClick={() => onSelectScreen('nova-operacao')}
        >
          <div className="text-white text-lg font-bold tracking-tight flex items-center gap-2">
            <span>SAVE NCM</span>
          </div>
          <div className="text-[#94A3B8] text-[11px] font-semibold uppercase tracking-wider mt-0.5">
            classificação fiscal
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 flex flex-col">
          {navItems.map((item) => {
            const isActive =
              currentScreen === item.path ||
              (item.path === 'nova-operacao' && currentScreen === 'processando');

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onSelectScreen(item.path)}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-left border-l-[3px] font-medium cursor-pointer ${
                  isActive
                    ? 'border-[#2563EB] text-white bg-[#1E293B] font-semibold shadow-inner'
                    : 'border-transparent text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/70'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Secondary Direct Link button */}
        <div className="px-3 mt-6">
          <button
            type="button"
            onClick={onOpenDirectLinksModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded bg-[#1E293B]/60 hover:bg-[#1E293B] text-[#93C5FD] text-xs font-medium border border-[#334155] transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#60A5FA]">
                link
              </span>
              <span>Links & Telas</span>
            </span>
            <span className="text-[10px] text-[#94A3B8] group-hover:text-white">
              6 Telas
            </span>
          </button>
        </div>
      </div>

      {/* University / Academic Footer */}
      <div className="px-5 pt-4 border-t border-[#1E293B]">
        <div className="text-[#64748B] text-xs tracking-wide font-mono">
          USP · MBA · 2026
        </div>
      </div>
    </aside>
  );
};
