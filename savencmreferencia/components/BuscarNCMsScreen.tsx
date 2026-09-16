import React, { useState, useMemo } from 'react';
import { searchDatabase } from '../data/mockData';
import { NcmSearchResult, ScreenType } from '../types';

interface BuscarNCMsScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSelectNcmForOperation?: (ncm: string) => void;
}

export const BuscarNCMsScreen: React.FC<BuscarNCMsScreenProps> = ({
  onNavigate,
  onSelectNcmForOperation,
}) => {
  const [searchTerm, setSearchTerm] = useState('filtro membrana');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({
    '8421.29.90': true, // Open by default as in design
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const quickChips = [
    'filtro membrana',
    'bomba centrífuga',
    'painel elétrico',
    '8421.29.90',
    'válvula pneumática',
  ];

  const filteredResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return searchDatabase.filter((item) => {
      const matchChapter =
        selectedChapter === 'all' || item.chapterCode === selectedChapter;
      const matchSearch =
        !term ||
        item.code.toLowerCase().includes(term) ||
        item.shortDescription.toLowerCase().includes(term) ||
        item.technicalDescription.toLowerCase().includes(term);
      return matchChapter && matchSearch;
    });
  }, [searchTerm, selectedChapter]);

  const toggleRow = (code: string) => {
    setExpandedCodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const handleUseNcm = (ncmItem: NcmSearchResult) => {
    if (onSelectNcmForOperation) {
      onSelectNcmForOperation(ncmItem.code);
    }
    showToast(`NCM ${ncmItem.code} selecionado para a operação de importação!`);
    setTimeout(() => {
      onNavigate('resultado');
    }, 900);
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
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Buscar NCMs
            </h1>
            <span className="bg-emerald-50 text-[#047857] text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Base TEC 2026 Vigente
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta inteligente com cruzamento de alíquotas aduaneiras, notas NESH e jurisprudência Cosit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('nova-operacao')}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              upload_file
            </span>
            <span>Upload de Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Search Box */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[22px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o código NCM (ex: 8421.29.90) ou a descrição do produto..."
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-[#CBD5E1] rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips & Filter Row */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Sugestões:
            </span>
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setSearchTerm(chip)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  searchTerm.toLowerCase() === chip.toLowerCase()
                    ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Capítulo:</span>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="all">Todos os Capítulos</option>
              <option value="84">Capítulo 84 — Máquinas e Mecânica</option>
              <option value="85">Capítulo 85 — Eletroeletrônicos</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Search Results Count Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-xs text-slate-600">
          Mostrando <strong>{filteredResults.length}</strong> {filteredResults.length === 1 ? 'resultado' : 'resultados'} para{' '}
          <strong className="text-slate-900">"{searchTerm || 'todos'}"</strong>
        </div>
        <div className="text-xs text-slate-400">
          Regime de Tributação: <strong>Lucro Real (SP)</strong>
        </div>
      </div>

      {/* 4. Results Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white h-10 border-b border-[#334155]">
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 w-12 text-center">
                  Expandir
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 min-w-[120px]">
                  Código NCM
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 min-w-[260px]">
                  Descrição TEC 2026
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  II
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  IPI
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  PIS
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  COFINS
                </th>
                <th className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  ICMS-SP
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  Carga Efetiva
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-center">
                  Ex-Tarifário
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-center">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-2">
                      search_off
                    </span>
                    Nenhum código NCM encontrado para "{searchTerm}". Tente buscar por palavras-chave como "filtro", "bomba", "painel" ou "8421".
                  </td>
                </tr>
              ) : (
                filteredResults.map((row) => {
                  const isExpanded = !!expandedCodes[row.code];

                  return (
                    <React.Fragment key={row.code}>
                      <tr
                        onClick={() => toggleRow(row.code)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-blue-50/25' : ''
                        }`}
                      >
                        <td className="px-3 py-3 text-center text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {row.code}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-900">
                            {row.shortDescription}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {row.chapter}
                          </div>
                        </td>

                        <td className="px-2 py-3 text-right font-mono text-slate-800">
                          {row.iiRate}
                        </td>

                        <td className="px-2 py-3 text-right font-mono text-slate-600">
                          {row.ipiRate}
                        </td>

                        <td className="px-2 py-3 text-right font-mono text-slate-600">
                          {row.pisRate}
                        </td>

                        <td className="px-2 py-3 text-right font-mono text-slate-600">
                          {row.cofinsRate}
                        </td>

                        <td className="px-2 py-3 text-right font-mono text-slate-600">
                          {row.icmsRate}
                        </td>

                        <td className="px-3 py-3 text-right font-mono font-bold text-[#0F172A]">
                          {row.effectiveRate}
                        </td>

                        <td className="px-3 py-3 text-center">
                          {row.exTarifarioType === 'BK' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#047857] border border-emerald-200">
                              Sim (BK)
                            </span>
                          ) : row.exTarifarioType === 'BIT' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
                              Sim (BIT)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              Não
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseNcm(row);
                            }}
                            className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[11px] font-semibold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <span>Usar</span>
                            <span className="material-symbols-outlined text-[13px]">
                              arrow_forward
                            </span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Technical Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-[#E2E8F0]">
                          <td colSpan={11} className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                              {/* Left details (7 cols) */}
                              <div className="lg:col-span-7 bg-white p-3.5 rounded border border-[#E2E8F0]">
                                <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-2 pb-1 border-b border-slate-100">
                                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">
                                    menu_book
                                  </span>
                                  <span>Descrição Técnica e Notas Explicativas NESH</span>
                                </div>

                                <p className="text-slate-700 mb-2 leading-relaxed">
                                  {row.technicalDescription}
                                </p>

                                <div className="bg-slate-50 p-2.5 rounded border border-slate-200/70 text-[11px] text-slate-600 font-mono italic">
                                  {row.neshNote}
                                </div>

                                {row.exTarifarioDetails && (
                                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-start gap-2">
                                    <span className="material-symbols-outlined text-emerald-700 text-[16px] shrink-0 mt-0.5">
                                      local_offer
                                    </span>
                                    <span>{row.exTarifarioDetails}</span>
                                  </div>
                                )}
                              </div>

                              {/* Right details (5 cols) */}
                              <div className="lg:col-span-5 bg-white p-3.5 rounded border border-[#E2E8F0] flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-2 pb-1 border-b border-slate-100">
                                    <span className="material-symbols-outlined text-[16px] text-[#2563EB]">
                                      balance
                                    </span>
                                    <span>Enquadramento Aduaneiro SP</span>
                                  </div>

                                  <div className="space-y-1.5 text-slate-600 text-xs">
                                    <div className="flex justify-between">
                                      <span>Ato Legal Vigente:</span>
                                      <span className="font-semibold text-slate-800">
                                        {row.legalAct}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Subitem TEC:</span>
                                      <span className="font-mono font-semibold text-slate-800">
                                        {row.subitemTec}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tratamento Administrativo:</span>
                                      <span className="text-[#047857] font-semibold">
                                        Dispensa de LI (Embarque Livre)
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Benefício ICMS-SP:</span>
                                      <span>Convênio 52/91 (Redução 12%)</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400">
                                    Atualizado via Siscomex/Duimp
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleUseNcm(row)}
                                    className="px-3 py-1.5 bg-[#004AC6] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">
                                      check
                                    </span>
                                    <span>Selecionar para Operação</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Information Note */}
      <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-lg flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] text-[18px]">
            info
          </span>
          <span>
            A tabela TEC é mantida em conformidade com as deliberações do Comitê de Alterações Tarifárias da CAMEX.
          </span>
        </div>
        <span className="font-mono text-[11px]">Sincronização: Hoje, 14:35</span>
      </div>
    </div>
  );
};
