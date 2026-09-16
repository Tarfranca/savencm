import React from 'react';
import { ScreenType } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  onOpenDirectLinksModal: () => void;
  activeRegime?: string;
  activeState?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenDirectLinksModal,
  activeRegime = 'Lucro Real',
  activeState = 'SP',
}) => {
  return (
    <header className="fixed top-0 left-[220px] right-0 h-14 bg-white border-b border-[#E2E8F0] z-40 flex items-center justify-between px-6 select-none">
      {/* Engine Status */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => onSelectScreen('nova-operacao')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[#64748B] text-[20px] group-hover:text-[#2563EB] transition-colors">
            verified
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] group-hover:text-[#0F172A] transition-colors">
            SAVE NCM Engine
          </span>
        </div>

        <span className="text-slate-300 text-xs">|</span>

        {/* Current Screen Breadcrumb */}
        <span className="text-xs text-slate-500 font-medium">
          {currentScreen === 'nova-operacao' && 'Início · Submissão de Documentos'}
          {currentScreen === 'processando' && 'Processamento de Documentos em Execução'}
          {currentScreen === 'resultado' && 'Resultado · Memória Aduaneira e Enquadramento'}
          {currentScreen === 'buscar-ncms' && 'Consulta NCM & Base TEC 2026'}
          {currentScreen === 'revisar' && 'Auditoria Tributária Comparativa'}
          {currentScreen === 'perfil-fiscal' && 'Configurações de Perfil Fiscal'}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Direct Link button in header */}
        <button
          type="button"
          onClick={onOpenDirectLinksModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-[#2563EB] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded transition-colors"
          title="Ver links diretos e referências visuais das telas"
        >
          <span className="material-symbols-outlined text-[15px] text-[#2563EB]">
            collections_bookmark
          </span>
          <span>Telas & Links Diretos</span>
        </button>

        {/* Tax Regime Pill */}
        <button
          type="button"
          onClick={() => onSelectScreen('perfil-fiscal')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold hover:bg-blue-100 transition-colors"
          title="Clique para configurar o Perfil Fiscal"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
          <span>{activeRegime} · {activeState}</span>
        </button>

        {/* User Profile Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-[#004AC6] flex items-center justify-center text-white text-xs shadow-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          title="Usuário Corporativo: Auditoria Fiscal"
        >
          <span className="material-symbols-outlined text-[18px]">
            person
          </span>
        </div>
      </div>
    </header>
  );
};
