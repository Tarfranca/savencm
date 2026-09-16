import React, { useState } from 'react';
import { ScreenType } from '../types';

interface DirectLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenType) => void;
  currentScreen: ScreenType;
}

export const DirectLinksModal: React.FC<DirectLinksModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentScreen,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const screens = [
    {
      id: 'nova-operacao' as ScreenType,
      title: '1. Nova Operação (Upload & Início)',
      hash: '#nova-operacao',
      desc: 'Tela de upload de invoice, dropzone, 4 cards secundários e operações recentes.',
      icon: 'upload_file',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'processando' as ScreenType,
      title: '2. Processando (Wizard Etapa 2 de 4)',
      hash: '#processando',
      desc: 'Etapa 2/4 com anel de progresso circular, pipeline de IA e terminal de logs.',
      icon: 'sync',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'resultado' as ScreenType,
      title: '3. Resultado (Tabela Aduaneira Consolidada)',
      hash: '#resultado',
      desc: 'Tabela de desembaraço, cálculo de impostos (II, IPI, PIS, COFINS, ICMS-SP) e gaveta NESH.',
      icon: 'assessment',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'revisar' as ScreenType,
      title: '4. Revisar (Auditoria Tributária Comparativa)',
      hash: '#revisar',
      desc: 'Auditoria comparativa com economia de R$ 131.400/ano e cards lado a lado.',
      icon: 'rule',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    },
    {
      id: 'buscar-ncms' as ScreenType,
      title: '5. Buscar NCMs (Consulta Inteligente TEC 2026)',
      hash: '#buscar-ncms',
      desc: 'Busca inteligente na base TEC 2026 com autocomplete, alíquotas e Ex-Tarifário.',
      icon: 'search',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'perfil-fiscal' as ScreenType,
      title: '6. Perfil Fiscal (Regimes & Alertas)',
      hash: '#perfil-fiscal',
      desc: 'Seleção de Regime Tributário (Lucro Real/Presumido), estado de desembaraço e switches.',
      icon: 'tune',
      color: 'text-slate-700 bg-slate-100 border-slate-300',
    },
  ];

  const handleCopyHash = (hash: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(hash);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                link
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Links Diretos para Imagens e Telas do HTML
              </h3>
              <p className="text-[11px] text-slate-500">
                Como adicionar links de imagens no HTML e alternar diretamente entre as telas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Explanation Box on How to Link Images in HTML */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4">
            <h4 className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                help_outline
              </span>
              Como funciona adicionar links diretos para imagens no HTML?
            </h4>
            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                <strong>Sim, é totalmente possível!</strong> No HTML e no React existem três maneiras principais de referenciar imagens diretamente:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 font-mono text-[11px] text-slate-800">
                <li>
                  <strong>1. Arquivos locais na pasta <code className="bg-blue-100 px-1 rounded">public/</code>:</strong><br />
                  Coloque a imagem na pasta <code className="bg-blue-100 px-1 rounded">/public/sua-imagem.png</code> e use no HTML:
                  <br />
                  <code className="bg-slate-900 text-slate-100 p-1 rounded block mt-0.5">&lt;img src="/sua-imagem.png" alt="Descrição" /&gt;</code>
                </li>
                <li>
                  <strong>2. Links diretos externos (HTTPS / CDN):</strong><br />
                  Você pode usar qualquer URL direta da imagem:
                  <br />
                  <code className="bg-slate-900 text-slate-100 p-1 rounded block mt-0.5">&lt;img src="https://seusite.com.br/assets/invoice.png" alt="Invoice" /&gt;</code>
                </li>
                <li>
                  <strong>3. Imagens embutidas Base64 / SVG direto:</strong><br />
                  Diretamente no código sem depender de servidor de arquivos:
                  <br />
                  <code className="bg-slate-900 text-slate-100 p-1 rounded block mt-0.5">&lt;img src="data:image/svg+xml;utf8,&lt;svg...&gt;" /&gt;</code>
                </li>
              </ul>
            </div>
          </div>

          {/* Screen Switcher with Direct Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Navegação Direta e Rotas para as 6 Telas do App:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Clique para abrir qualquer tela instantaneamente
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {screens.map((screen) => {
                const isCurrent = currentScreen === screen.id;

                return (
                  <div
                    key={screen.id}
                    className={`border rounded-lg p-3.5 flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'border-[#2563EB] bg-blue-50/40 shadow-xs ring-1 ring-blue-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded flex items-center justify-center border ${screen.color}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {screen.icon}
                            </span>
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {screen.title}
                          </span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-[#2563EB] bg-blue-100 px-1.5 py-0.5 rounded">
                            Tela Atual
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        {screen.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyHash(screen.hash)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-mono flex items-center gap-1 cursor-pointer"
                        title="Copiar link direto para esta tela"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedLink === screen.hash ? 'check' : 'content_copy'}
                        </span>
                        <span>
                          {copiedLink === screen.hash ? 'Link copiado!' : screen.hash}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(screen.id);
                          onClose();
                        }}
                        className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Ir para Tela</span>
                        <span className="material-symbols-outlined text-[13px]">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-end bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
