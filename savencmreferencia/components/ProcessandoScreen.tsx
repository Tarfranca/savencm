import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';

interface ProcessandoScreenProps {
  fileName?: string;
  onFinishProcessing: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ProcessandoScreen: React.FC<ProcessandoScreenProps> = ({
  fileName = 'Invoice_Fornecedor_DE_2026.pdf',
  onFinishProcessing,
  onNavigate,
}) => {
  const [progress, setProgress] = useState(66);
  const [phase, setPhase] = useState<'extracting' | 'classifying' | 'calculating' | 'done'>('classifying');
  const [secondsRemaining, setSecondsRemaining] = useState(35);

  useEffect(() => {
    // Dynamic progress timer to give lively feedback
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
      setSecondsRemaining((prev) => (prev > 5 ? prev - 1 : 4));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 90) {
      setPhase('calculating');
    } else if (progress >= 60) {
      setPhase('classifying');
    }
  }, [progress]);

  // SVG ring circumference calculation
  // radius = 42, 2 * PI * 42 = 263.89
  const circumference = 263.89;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-12">
      {/* 1. Page Header & Wizard Steps */}
      <div className="w-full pb-5 mb-6 border-b border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Nova Operação
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditoria e classificação automatizada de documentos de importação
            </p>
          </div>

          {/* Step Counter Meta */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#004AC6]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></span>
            <span className="uppercase tracking-wider">
              Etapa 2 de 4 em execução
            </span>
          </div>
        </div>

        {/* Horizontal 4-Step Wizard Indicator */}
        <div className="mt-6 pt-2 max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Connecting Lines Container */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#E2E8F0] -z-0">
              <div 
                className="h-full bg-[#2563EB] transition-all duration-700"
                style={{ width: `${Math.min(progress, 68)}%` }}
              ></div>
            </div>

            {/* Step 1: Upload (Completed) */}
            <div 
              onClick={() => onNavigate('nova-operacao')}
              className="relative z-10 flex flex-col items-center bg-[#F8FAFC] px-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#047857] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                <span className="material-symbols-outlined text-[16px]">
                  check
                </span>
              </div>
              <span className="text-[#047857] mt-1.5 text-xs font-semibold">
                1. Upload
              </span>
            </div>

            {/* Step 2: Processando (Active) */}
            <div className="relative z-10 flex flex-col items-center bg-[#F8FAFC] px-2">
              <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs shadow-xs relative">
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span className="absolute inset-0 rounded-full border-2 border-[#2563EB] animate-ping opacity-30"></span>
              </div>
              <span className="text-[#2563EB] mt-1.5 text-xs font-bold tracking-tight">
                2. Processando
              </span>
            </div>

            {/* Step 3: Resultado (Upcoming) */}
            <div 
              onClick={onFinishProcessing}
              className="relative z-10 flex flex-col items-center bg-[#F8FAFC] px-2 cursor-pointer hover:opacity-80"
              title="Clique para avançar direto para o Resultado"
            >
              <div className="w-7 h-7 rounded-full bg-white border-2 border-[#CBD5E1] text-[#94A3B8] flex items-center justify-center text-xs font-medium">
                3
              </div>
              <span className="text-slate-500 mt-1.5 text-xs font-medium">
                3. Resultado
              </span>
            </div>

            {/* Step 4: Exportar (Upcoming) */}
            <div className="relative z-10 flex flex-col items-center bg-[#F8FAFC] px-2">
              <div className="w-7 h-7 rounded-full bg-white border-2 border-[#CBD5E1] text-[#94A3B8] flex items-center justify-center text-xs font-medium">
                4
              </div>
              <span className="text-slate-400 mt-1.5 text-xs">
                4. Exportar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Compact File Info Bar */}
      <div className="w-full max-w-2xl mx-auto mb-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                picture_as_pdf
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 text-sm font-semibold tracking-normal truncate max-w-[320px] sm:max-w-md font-mono">
                {fileName}
              </span>
              <span className="text-slate-500 text-[11px]">
                3,2 MB · 4 páginas · Hash SHA-256 verificado
              </span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-semibold tracking-wide uppercase">
            <span className="material-symbols-outlined text-[14px]">
              done_all
            </span>
            <span>Enviado com sucesso</span>
          </div>
        </div>
      </div>

      {/* 3. Main Status Processing Card */}
      <div className="w-full max-w-2xl mx-auto bg-white border border-[#E2E8F0] rounded-[4px] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Top hairline subtle progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F1F5F9] overflow-hidden">
          <div 
            className="h-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex flex-col items-center text-center">
          {/* Circular Progress Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="#F1F5F9"
                strokeWidth="7"
              />
              <circle
                className="transition-all duration-500 ease-out"
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="#2563EB"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="7"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#2563EB] text-2xl font-bold tracking-tight font-mono">
                {progress}%
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest -mt-1 font-semibold">
                fase 2/3
              </span>
            </div>
          </div>

          {/* Status Headings */}
          <h2 className="text-slate-900 text-lg font-semibold tracking-tight mt-3">
            Classificando itens...
          </h2>
          <p className="text-slate-500 text-xs max-w-md mx-auto mt-1 leading-relaxed">
            A IA está lendo a invoice, cruzando descrições com a Nomenclatura Comum do Mercosul e aplicando as Regras Gerais de Interpretação (RGI).
          </p>

          {/* Linear Micro Progress Bar */}
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden my-5">
            <div 
              className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Pipeline Status List */}
        <div className="w-full border-t border-b border-[#F1F5F9] py-4 my-1 flex flex-col gap-3.5">
          {/* Item 1: Extracted (Done) */}
          <div className="flex items-center justify-between text-left gap-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857] shrink-0">
                <span className="material-symbols-outlined text-[13px] font-bold">
                  check
                </span>
              </div>
              <span className="text-slate-900 text-xs font-medium">
                Extração de texto e dados da invoice
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[2px] font-mono">
              Concluído (3 itens detectados)
            </span>
          </div>

          {/* Item 2: Classifying (Active or Finished) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-left gap-1 sm:gap-3 bg-[#F8FAFC] p-2 rounded-[2px] border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shrink-0 relative">
                {progress < 95 ? (
                  <svg
                    className="animate-spin h-3 w-3 text-[#2563EB]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-[13px] font-bold text-[#047857]">
                    check
                  </span>
                )}
              </div>
              <span className="text-slate-900 text-xs font-semibold">
                Classificação NCM por item ({progress >= 95 ? '3 de 3' : '2 de 3'})
              </span>
            </div>
            <div className="flex items-center gap-1.5 pl-8 sm:pl-0">
              <span className="italic text-[#2563EB] text-[11px] font-normal truncate">
                {progress >= 95
                  ? '3 itens correlacionados com sucesso'
                  : 'Consultando NESH, Soluções Cosit e TEC 2026...'}
              </span>
            </div>
          </div>

          {/* Item 3: Tax Calculation */}
          <div className={`flex items-center justify-between text-left gap-3 ${progress >= 90 ? 'opacity-100' : 'opacity-60'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                progress >= 98
                  ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]'
                  : 'bg-white border border-[#CBD5E1] text-slate-400'
              }`}>
                {progress >= 98 ? (
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
                )}
              </div>
              <span className="text-slate-800 text-xs">
                Cálculo tributário completo (II, IPI, PIS, COFINS, ICMS-SP)
              </span>
            </div>
            <span className="shrink-0 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              {progress >= 98 ? 'Finalizado' : 'Aguardando'}
            </span>
          </div>
        </div>

        {/* Estimated Time Chip & Background Notification */}
        <div className="flex flex-col items-center justify-center mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-slate-600 text-xs font-medium">
            <span className="material-symbols-outlined text-[15px] text-[#2563EB]">
              schedule
            </span>
            <span className="tabular-nums">
              Tempo estimado restante: <strong>{secondsRemaining} segundos</strong>
            </span>
          </div>

          {/* System Diagnostic Line */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              API Receita Federal: Ativa
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              Base TEC 2026: Sincronizada
            </span>
          </div>

          {/* Button to proceed to Results */}
          <div className="mt-5 w-full flex justify-center gap-3">
            <button
              type="button"
              onClick={onFinishProcessing}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-5 py-2.5 rounded transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Avançar para Resultado</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Reassuring Footer Note */}
          <p className="text-slate-400 text-xs italic text-center mt-4 pt-3 border-t border-[#F1F5F9] w-full max-w-lg">
            Você pode fechar esta janela com segurança — avisamos por e-mail quando a classificação e o relatório de riscos estiverem concluídos.
          </p>
        </div>
      </div>

      {/* Live Terminal Log Preview */}
      <div className="w-full max-w-2xl mx-auto mt-4 px-2">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] p-3 text-[11px] font-mono text-slate-600">
          <div className="flex items-center justify-between text-slate-700 font-semibold pb-1.5 mb-1.5 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#2563EB]">
                terminal
              </span>
              <span className="uppercase tracking-wider text-[10px]">
                Log de Auditoria em Tempo Real
              </span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              ID: OPR-8492-SP
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px] leading-relaxed">
            <div className="text-[#047857]">
              [14:32:01] INFO :: Item 01/03 &gt; "Filtro membrana ultrafiltração" -&gt; NCM 8421.29.90 atribuído com 99.1% de confiança.
            </div>
            <div className="text-[#2563EB] animate-pulse">
              [14:32:04] EVAL :: Item 02/03 &gt; "Bomba centrífuga aço inox" -&gt; Buscando notas explicativas do Capítulo 84 (NESH)...
            </div>
            <div className="text-slate-500">
              [14:32:05] QUEUE :: Item 03/03 &gt; "Painel CLP Siemens S7-300" -&gt; Verificando vigência de Ex-tarifário nº 042.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
