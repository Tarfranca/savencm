import React, { useState } from 'react';
import { comparativeItems } from '../data/mockData';
import { ScreenType } from '../types';

interface ComparativoScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenDossierModal: () => void;
}

export const ComparativoScreen: React.FC<ComparativoScreenProps> = ({
  onNavigate,
  onOpenDossierModal,
}) => {
  const [items] = useState(comparativeItems);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportReport = () => {
    showToast('Relatório Executivo de Economia Tributária exportado em PDF!');
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#334155] text-xs flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#BFDBFE]">
              Auditoria Tributária Comparativa
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Invoice_Fornecedor_DE_2026.pdf
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
            Revisão e Comparativo Tributário
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            3 itens analisados · Análise de divergência de enquadramento NCM x Oportunidades TEC 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('resultado')}
            className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              table_chart
            </span>
            <span>Ver Tabela Consolidada</span>
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="px-3.5 py-1.5 bg-[#004AC6] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>
            <span>Exportar Relatório Executivo</span>
          </button>
        </div>
      </div>

      {/* 2. Highlight Financial Box (R$ 131.400 / ano) */}
      <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-5 mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">
              trending_down
            </span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#047857] uppercase tracking-wider">
              Economia Anual Projetada
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#065F46] tracking-tight font-mono">
              R$ 131.400 <span className="text-base font-semibold text-[#047857]">/ ano</span>
            </div>
            <div className="text-xs text-[#047857]/90 mt-0.5">
              Considerando o volume médio histórico de 12 embarques anuais e alíquotas vigentes da TEC 2026.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/80 border border-emerald-200 rounded-lg px-4 py-2 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              Redução Média de Carga
            </div>
            <div className="text-lg font-bold text-[#047857] font-mono">
              -15,2 p.p.
            </div>
          </div>
          <div className="bg-white/80 border border-emerald-200 rounded-lg px-4 py-2 text-center">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              Segurança Jurídica
            </div>
            <div className="text-lg font-bold text-slate-800 font-mono">
              100% Cosit
            </div>
          </div>
        </div>
      </div>

      {/* 3. 3 Comparative Cards */}
      <div className="flex flex-col gap-5 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs hover:border-[#2563EB]/50 transition-all"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[#F1F5F9]">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  {item.quantityStr}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {item.title}
                </h3>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-[#047857] text-xs font-bold font-mono">
                <span>{item.yearlySavings}</span>
              </div>
            </div>

            {/* Side-by-Side Comparison Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Left Box: Enquadramento Anterior / Declarado */}
              <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Enquadramento Anterior / Genérico
                    </span>
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      Carga Elevada
                    </span>
                  </div>

                  <div className="font-mono text-base font-bold text-slate-800 mb-1">
                    NCM {item.previousNcm}
                  </div>

                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    {item.previousTaxes}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Carga Tributária Efetiva:
                  </span>
                  <span className="text-base font-bold text-slate-700 font-mono">
                    {item.previousTotalRate}
                  </span>
                </div>
              </div>

              {/* Middle Arrow / Delta Indicator */}
              <div className="md:col-span-2 flex flex-col items-center justify-center py-2 md:py-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </div>
                <div className="mt-1 text-xs font-extrabold text-[#047857] font-mono">
                  {item.rateDifference}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  diferença
                </div>
              </div>

              {/* Right Box: Enquadramento Otimizado / SAVE NCM */}
              <div className="md:col-span-5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                      Recomendação Otimizada (SAVE NCM)
                    </span>
                    <span className="text-[11px] font-bold text-[#047857] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Homologado Cosit
                    </span>
                  </div>

                  <div className="font-mono text-base font-bold text-[#0F172A] mb-1">
                    NCM {item.newNcm}
                  </div>

                  <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                    {item.newTaxes}
                  </p>
                </div>

                <div className="pt-3 border-t border-blue-200 flex items-baseline justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    Carga Tributária Efetiva:
                  </span>
                  <span className="text-base font-bold text-[#047857] font-mono">
                    {item.newTotalRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Subtext */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <span className="italic">{item.technicalDescription}</span>
              <button
                type="button"
                onClick={() => onNavigate('resultado')}
                className="text-[#2563EB] font-semibold hover:underline text-right cursor-pointer"
              >
                Ver fundamentação legal completa →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer Summary Bar */}
      <div className="bg-[#0F172A] text-white p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            verified
          </span>
          <span>
            <strong>3 itens auditados e comparados</strong> · Todos os enquadramentos possuem amparo nas Notas Explicativas do Sistema Harmonizado (NESH).
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenDossierModal}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Gerar Dossiê Siscomex</span>
            <span className="material-symbols-outlined text-[16px]">
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
