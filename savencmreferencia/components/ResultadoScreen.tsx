import React, { useState } from 'react';
import { TaxItem, ScreenType } from '../types';

interface ResultadoScreenProps {
  taxItems: TaxItem[];
  onNavigate: (screen: ScreenType) => void;
  onOpenDossierModal: () => void;
}

export const ResultadoScreen: React.FC<ResultadoScreenProps> = ({
  taxItems: initialItems,
  onNavigate,
  onOpenDossierModal,
}) => {
  const [items, setItems] = useState<TaxItem[]>(initialItems);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'item-2': true, // Keep item 2 open by default as shown in the mockup
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApproveItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Validado' } : item
      )
    );
    showToast(`Item homologado com sucesso!`);
  };

  const handleApproveAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, status: 'Validado' })));
    showToast('Todos os itens foram validados e aprovados para a DI!');
  };

  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Item,Descricao,NCM,Peso_KG,Qtd,FOB_USD,FOB_BRL,II_Perc,IPI_Perc,PIS_Perc,COFINS_Perc,ICMS_Perc,Carga_Efetiva,Status\n' +
      items
        .map(
          (i) =>
            `${i.itemNumber},"${i.description}",${i.ncm},${i.weight},${i.quantity},${i.fobUsd},${i.fobBrl},${i.iiRate}%,${i.ipiRate}%,${i.pisRate}%,${i.cofinsRate}%,${i.icmsRate}%,${i.effectiveTaxRate}%,${i.status}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Auditoria_Aduaneira_SaveNCM_88392-26.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilha detalhada exportada com sucesso!');
  };

  const handleExportPDF = () => {
    showToast('Dossiê aduaneiro em PDF gerado com assinatura digital!');
  };

  const validatedCount = items.filter((i) => i.status === 'Validado').length;
  const reviewCount = items.length - validatedCount;

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg shadow-lg border border-[#334155] text-xs flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Operation Context Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 mb-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-900 font-mono">
                Invoice_Fornecedor_DE_2026.pdf
              </span>
              <span className="bg-[#ECFDF5] text-[#047857] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#A7F3D0]">
                DI PREP #88392-26
              </span>
              <span className="bg-blue-50 text-[#2563EB] text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                Homologação Siscomex
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Origem: <strong>Hamburgo (DE)</strong> · Modal: <strong>Marítimo</strong> · Câmbio: <span className="font-mono">R$ 5,4200</span> · Incoterm: <strong>FOB Hamburg</strong> · Recinto: <strong>Porto de Santos</strong> · 3 itens faturados
            </p>
          </div>

          {/* Export and Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#CBD5E1] bg-white text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#047857]">
                table_view
              </span>
              <span>Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#CBD5E1] bg-white text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#DC2626]">
                picture_as_pdf
              </span>
              <span>Exportar PDF</span>
            </button>

            <button
              type="button"
              onClick={onOpenDossierModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                code
              </span>
              <span>Payload Siscomex / Duimp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Operational Scope Strip */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-4 py-2 mb-4 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            Base <strong>TEC Vigente 2026</strong>
          </span>
          <span>•</span>
          <span>
            Legislação Tributária Estadual: <strong>RICMS/SP (Decreto 45.490/00)</strong>
          </span>
        </div>
        <div className="text-slate-500 italic">
          Valores aduaneiros calculados com seguro e frete internacional rateados proporcionalmente ao valor FOB.
        </div>
      </div>

      {/* 3. Consolidated Customs Clearance Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white h-10 border-b border-[#334155]">
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 w-12 text-center">
                  Item
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 min-w-[200px]">
                  Descrição Comercial / Part Number
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-center">
                  NCM Sugerido
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  Peso Líq.
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  Qtd.
                </th>
                <th className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-300 text-right">
                  Valor FOB
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
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {items.map((item) => {
                const isExpanded = !!expandedRows[item.id];

                return (
                  <React.Fragment key={item.id}>
                    {/* Primary Row */}
                    <tr
                      onClick={() => toggleRow(item.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${
                        isExpanded ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <td className="px-3 py-3 text-center font-bold text-slate-700 font-mono">
                        <div className="flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                          <span>{item.itemNumber}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">
                          {item.description}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          P/N: {item.partNumber}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className="inline-block font-mono font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.ncm}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right font-mono text-slate-600">
                        {item.weight}
                      </td>

                      <td className="px-3 py-3 text-right font-mono text-slate-600">
                        {item.quantity}
                      </td>

                      <td className="px-3 py-3 text-right font-mono">
                        <div className="font-semibold text-slate-900">
                          ${' '}
                          {item.fobUsd.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          R${' '}
                          {item.fobBrl.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </td>

                      <td className="px-2 py-3 text-right font-mono">
                        {item.iiIsEx ? (
                          <span className="text-[#047857] font-bold">0,0% (Ex)</span>
                        ) : (
                          <span>{item.iiRate.toFixed(1)}%</span>
                        )}
                      </td>

                      <td className="px-2 py-3 text-right font-mono text-slate-600">
                        {item.ipiRate.toFixed(1)}%
                      </td>

                      <td className="px-2 py-3 text-right font-mono text-slate-600">
                        {item.pisRate.toFixed(2)}%
                      </td>

                      <td className="px-2 py-3 text-right font-mono text-slate-600">
                        {item.cofinsRate.toFixed(2)}%
                      </td>

                      <td className="px-2 py-3 text-right font-mono text-slate-600">
                        {item.icmsRate.toFixed(1)}%
                      </td>

                      <td className="px-3 py-3 text-right font-mono font-bold text-[#0F172A]">
                        {item.effectiveTaxRate.toFixed(1)}%
                      </td>

                      <td className="px-3 py-3 text-center">
                        {item.status === 'Validado' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#047857] border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[13px]">
                              check
                            </span>
                            <span>Validado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-[#D97706] border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[13px]">
                              error_outline
                            </span>
                            <span>Revisar</span>
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Drawer Container */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-y border-[#E2E8F0]">
                        <td colSpan={13} className="p-4">
                          {/* Alert note if exists (e.g. for CLP) */}
                          {item.alertNote && (
                            <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-900 text-xs flex items-start gap-2">
                              <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">
                                warning
                              </span>
                              <div>
                                <strong className="font-semibold block mb-0.5">
                                  Exigência Documental RFB:
                                </strong>
                                {item.alertNote}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                            {/* Column 1: Descrição Otimizada para DI */}
                            <div className="bg-white p-3.5 rounded border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-2 pb-1 border-b border-slate-100">
                                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">
                                    description
                                  </span>
                                  <span>Descrição Otimizada para DI</span>
                                </div>
                                <p className="text-slate-700 italic leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/60">
                                  {item.diDescription ||
                                    'Mercadoria conforme faturamento comercial e packing list anexos.'}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1">
                                <span>
                                  <strong>Enquadramento:</strong> {item.legalFramework}
                                </span>
                                <span>
                                  <strong>Laudo Técnico:</strong> Sem similaridade nacional apurada
                                </span>
                              </div>
                            </div>

                            {/* Column 2: Fundamentação Legal & NESH */}
                            <div className="bg-white p-3.5 rounded border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-2 pb-1 border-b border-slate-100">
                                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">
                                    gavel
                                  </span>
                                  <span>Fundamentação Legal & NESH</span>
                                </div>
                                <p className="text-slate-700 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/60 font-mono">
                                  {item.neshGrounds ||
                                    'Classificação amparada nas Regras Gerais de Interpretação (RGI 1 e RGI 6).'}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1">
                                <span>
                                  <strong>Jurisprudência RFB:</strong>{' '}
                                  <span className="text-[#2563EB] font-medium underline cursor-pointer">
                                    {item.cositReport || 'Solução Cosit correlata'}
                                  </span>
                                </span>
                                <span>
                                  <strong>Regras Aplicadas:</strong> {item.rgiRules || 'RGI 1 & 6'}
                                </span>
                              </div>
                            </div>

                            {/* Column 3: Detalhamento Tributário e Bases de Cálculo */}
                            <div className="bg-white p-3.5 rounded border border-[#E2E8F0] shadow-2xs">
                              <div className="flex items-center justify-between text-slate-800 font-bold mb-2 pb-1 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">
                                    calculate
                                  </span>
                                  <span>Detalhamento Tributário</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono uppercase">
                                  Base CIF rateada
                                </span>
                              </div>

                              <div className="space-y-1.5 text-xs font-mono tabular-nums">
                                <div className="flex justify-between text-slate-600">
                                  <span>II ({item.iiRate.toFixed(1)}%):</span>
                                  <span>
                                    R${' '}
                                    {(item.iiAmount ?? 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>IPI ({item.ipiRate.toFixed(1)}%):</span>
                                  <span>
                                    R${' '}
                                    {(item.ipiAmount ?? 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>PIS Importação (2,10%):</span>
                                  <span>
                                    R${' '}
                                    {(item.pisAmount ?? 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>COFINS Importação (9,65%):</span>
                                  <span>
                                    R${' '}
                                    {(item.cofinsAmount ?? 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>ICMS-SP (Base c/ Gross-up):</span>
                                  <span>
                                    R${' '}
                                    {(item.icmsAmount ?? 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-[13px]">
                                  <span>Carga Total de Tributos:</span>
                                  <span className="text-[#004AC6]">
                                    R${' '}
                                    {(item.totalImportTax ?? 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Drawer Hash & Action Bar */}
                          <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 text-slate-500">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                                <span className="material-symbols-outlined text-[14px] text-emerald-600">
                                  verified
                                </span>
                                Auditado por IA Fiscal Engine v4.8
                              </span>
                              <span>•</span>
                              <span className="font-mono text-[11px]">
                                Hash: {item.auditHash || '0x7F9B...C82A'}
                              </span>
                              <span>•</span>
                              <span>
                                Nível de Risco:{' '}
                                <strong
                                  className={
                                    item.riskLevel === 'Baixo'
                                      ? 'text-emerald-700'
                                      : 'text-amber-700'
                                  }
                                >
                                  {item.riskLevel || 'Baixo'}
                                </strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('buscar-ncms');
                                }}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-white text-slate-700 font-medium transition-colors cursor-pointer"
                              >
                                Buscar NCM alternativo
                              </button>

                              {item.status !== 'Validado' ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleApproveItem(item.id, e)}
                                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    check
                                  </span>
                                  <span>Homologar Item</span>
                                </button>
                              ) : (
                                <span className="text-emerald-700 text-xs font-semibold inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">
                                    check_circle
                                  </span>
                                  Homologado
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Totals Row */}
              <tr className="bg-slate-100 font-semibold text-slate-900 border-t-2 border-slate-300">
                <td className="px-3 py-3 text-center font-mono">Σ</td>
                <td className="px-3 py-3 font-bold">
                  Total Geral da Invoice ({items.length} itens faturados)
                </td>
                <td className="px-3 py-3 text-center text-xs text-slate-500">
                  Consolidado
                </td>
                <td className="px-3 py-3 text-right font-mono">985 kg</td>
                <td className="px-3 py-3 text-right font-mono">166 un</td>
                <td className="px-3 py-3 text-right font-mono">
                  <div className="font-bold text-slate-900">$ 44.600,00</div>
                  <div className="text-[10px] text-slate-500">R$ 241.732,00</div>
                </td>
                <td colSpan={5} className="px-3 py-3 text-right text-xs text-slate-600">
                  Carga Média Ponderada:
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold text-[#004AC6] text-[13px]">
                  31,5%
                </td>
                <td className="px-3 py-3 text-center text-[11px] font-semibold text-emerald-700">
                  Pronto p/ DI
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Customs Clearance Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 mb-8">
        <div className="bg-white border border-[#E2E8F0] p-3 rounded flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px] shrink-0">
            data_object
          </span>
          <div>
            <strong className="text-slate-800 block">
              Módulo Siscomex/Duimp
            </strong>
            Payload JSON em conformidade com o Portal Único de Comércio Exterior (Receita Federal).
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-3 rounded flex items-start gap-2.5">
          <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
            verified_user
          </span>
          <div>
            <strong className="text-slate-800 block">
              LPCO / Decex
            </strong>
            Nenhum dos 3 itens possui exigência de Licença de Importação Prévia ao embarque.
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-3 rounded flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#004AC6] text-[20px] shrink-0">
            traffic
          </span>
          <div>
            <strong className="text-slate-800 block">
              Canal Estimado: Verde
            </strong>
            Parametrização aduaneira estimada com desembaraço automático sem conferência física.
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Action Strip */}
      <div className="fixed bottom-0 left-[220px] right-0 bg-[#0F172A] text-white py-3 px-6 z-40 border-t border-[#334155] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#60A5FA] text-[20px]">
            fact_check
          </span>
          <span className="text-xs sm:text-sm font-medium">
            <strong>{validatedCount} de {items.length} itens validados</strong>
            {reviewCount > 0 && (
              <span className="text-amber-400 ml-1">
                | {reviewCount} item requer conferência de Ex-Tarifário
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('revisar')}
            className="px-3.5 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#93C5FD] rounded text-xs font-semibold transition-colors border border-[#475569] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              analytics
            </span>
            <span>Ver Auditoria Comparativa</span>
          </button>

          {reviewCount > 0 ? (
            <button
              type="button"
              onClick={handleApproveAll}
              className="px-4 py-1.5 bg-[#047857] hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                done_all
              </span>
              <span>Aprovar todos os itens</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenDossierModal}
              className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                file_download
              </span>
              <span>Transmitir para Siscomex</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
