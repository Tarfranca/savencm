import React, { useState } from 'react';
import { RecentOperation, PendingAlert, ScreenType } from '../types';

interface NovaOperacaoScreenProps {
  recentOperations: RecentOperation[];
  pendingAlerts: PendingAlert[];
  onStartProcessing: (fileName?: string) => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenChatModal: () => void;
  onOpenLinkModal: () => void;
}

export const NovaOperacaoScreen: React.FC<NovaOperacaoScreenProps> = ({
  recentOperations,
  pendingAlerts,
  onStartProcessing,
  onNavigate,
  onOpenChatModal,
  onOpenLinkModal,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onStartProcessing(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onStartProcessing(file.name);
    } else {
      onStartProcessing('Invoice_Fornecedor_DE_2026.pdf');
    }
  };

  const handleDownloadTemplate = () => {
    // Generate simple simulated CSV/Excel template
    const csvContent =
      'data:text/csv;charset=utf-8,Item,Descricao_Comercial,Part_Number,NCM_Atual,Quantidade,Valor_FOB_USD,Peso_Liquido_KG\n1,Filtro de Membrana,UF-MEM-316L,8479.89.99,120,8400.00,340\n2,Bomba Centrifuga Inox,PUMP-SS-316L,8413.91.00,40,22000.00,560\n3,Controlador PLC Siemens,6ES7-315-2AH14,8537.10.99,6,14200.00,85\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Template_Importacao_SaveNCM.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilha template Excel/CSV baixada com sucesso!');
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-12">
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
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          O que você tem disponível?
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          A IA lê o documento e classifica — sem formulários.
        </p>
      </div>

      {/* 2. Hero: Large Centered Upload Dropzone */}
      <div className="w-full max-w-3xl mx-auto mb-8">
        <div
          id="drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.getElementById('file-input') as HTMLInputElement;
            if (input) input.click();
          }}
          className={`bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer shadow-xs ${
            isDragging
              ? 'border-[#2563EB] bg-blue-50/50 scale-[1.005]'
              : 'border-[#CBD5E1] hover:border-[#2563EB]'
          }`}
        >
          <input
            type="file"
            id="file-input"
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
          />

          <div className="flex justify-center mb-3">
            <span className="material-symbols-outlined text-[#64748B] text-[44px]">
              cloud_upload
            </span>
          </div>

          <div className="text-[17px] font-semibold text-slate-800">
            Arraste a invoice aqui
          </div>

          <div className="text-[13px] text-slate-500 mt-1 mb-4">
            PDF · JPEG · PNG · XLSX — qualquer formato
          </div>

          <div className="flex items-center justify-center gap-3 mb-5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const input = document.getElementById('file-input') as HTMLInputElement;
                if (input) input.click();
              }}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium px-5 py-2.5 rounded-md inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                attachment
              </span>
              <span>Selecionar arquivo</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartProcessing('Invoice_Fornecedor_DE_2026.pdf');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
              title="Testar instantaneamente com a invoice da demonstração"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                play_arrow
              </span>
              <span>Testar com Invoice Demo</span>
            </button>
          </div>

          {/* Format chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Invoice', 'Packing List', 'Foto', 'Catálogo', 'Link URL'].map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full border border-slate-200 select-none font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Below Upload: 4 Secondary Entry Cards (2x2 Grid) */}
      <div className="w-full max-w-3xl mx-auto mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Descrever no chat */}
          <div
            onClick={onOpenChatModal}
            className="group bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-col justify-between hover:border-[#2563EB] hover:shadow-xs transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-[#64748B] text-[20px] group-hover:text-[#2563EB] transition-colors">
                  chat
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                Descrever no chat
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Sem documento? Fale sobre o produto.
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <span className="text-[#2563EB] text-sm font-medium group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>

          {/* Card 2: Tenho o NCM */}
          <div
            onClick={() => onNavigate('buscar-ncms')}
            className="group bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-col justify-between hover:border-[#2563EB] hover:shadow-xs transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-[#64748B] text-[20px] group-hover:text-[#2563EB] transition-colors">
                  pin
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                Tenho o NCM
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Validar e buscar alternativas melhores.
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <span className="text-[#2563EB] text-sm font-medium group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>

          {/* Card 3: Link do produto */}
          <div
            onClick={onOpenLinkModal}
            className="group bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-col justify-between hover:border-[#2563EB] hover:shadow-xs transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-[#64748B] text-[20px] group-hover:text-[#2563EB] transition-colors">
                  link
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                Link do produto
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Cole a URL — AliExpress, Alibaba, fabricante.
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <span className="text-[#2563EB] text-sm font-medium group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>

          {/* Card 4: Template Excel */}
          <div
            onClick={handleDownloadTemplate}
            className="group bg-white border border-[#E2E8F0] rounded-lg p-4 flex flex-col justify-between hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-[#94A3B8] text-[20px] group-hover:text-slate-700 transition-colors">
                  download
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-700">
                Template Excel
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Baixar planilha para preencher.
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <span className="text-slate-400 group-hover:text-slate-700 text-sm font-medium group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Below Cards: 2 Column Section (7 / 5 Split) */}
      <div className="grid grid-cols-12 gap-6 w-full items-start">
        {/* Left Column: Operações Recentes (7 Cols) */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Operações recentes
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('resultado')}
              className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 h-8 border-b border-[#E2E8F0]">
                  <th className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                    NCM
                  </th>
                  <th className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Economia
                  </th>
                  <th className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {recentOperations.map((row) => {
                  let statusBadge = (
                    <span className="inline-flex items-center bg-emerald-50 text-[#047857] border border-emerald-200 text-xs px-2 py-0.5 rounded-md font-medium">
                      Homologado
                    </span>
                  );
                  if (row.status === 'Em revisão') {
                    statusBadge = (
                      <span className="inline-flex items-center bg-amber-50 text-[#D97706] border border-amber-200 text-xs px-2 py-0.5 rounded-md font-medium">
                        Em revisão
                      </span>
                    );
                  } else if (row.status === 'Risco') {
                    statusBadge = (
                      <span className="inline-flex items-center bg-red-50 text-[#DC2626] border border-red-200 text-xs px-2 py-0.5 rounded-md font-medium">
                        Risco
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onNavigate('resultado')}
                      className="h-10 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Clique para ver detalhes do resultado aduaneiro"
                    >
                      <td className="px-3 text-slate-800 text-xs font-medium whitespace-nowrap">
                        {row.document}{' '}
                        <span className="text-slate-400 font-normal">
                          ({row.category})
                        </span>
                      </td>
                      <td className="px-3 text-slate-600 text-xs text-right font-mono tabular-nums">
                        {row.ncm}
                      </td>
                      <td className="px-3 text-[#047857] font-bold text-xs text-right tabular-nums">
                        {row.economy}
                      </td>
                      <td className="px-3 text-slate-500 text-xs whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="px-3 text-right whitespace-nowrap">
                        {statusBadge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Alertas Pendentes (5 Cols) */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Alertas pendentes
            </h2>
            <span className="text-xs text-slate-400 font-medium">3 ativos</span>
          </div>

          <div className="flex flex-col gap-3">
            {pendingAlerts.map((alert) => {
              const borderClass =
                alert.badgeType === 'risk'
                  ? 'border-l-[3px] border-l-[#DC2626]'
                  : 'border-l-[3px] border-l-[#047857]';

              const badgeColorClass =
                alert.badgeType === 'risk'
                  ? 'text-[#DC2626] bg-red-50'
                  : 'text-[#047857] bg-emerald-50';

              return (
                <div
                  key={alert.id}
                  onClick={() =>
                    alert.badgeType === 'risk'
                      ? onNavigate('resultado')
                      : onNavigate('revisar')
                  }
                  className={`${borderClass} bg-white p-3 rounded-r-lg border-y border-r border-[#E2E8F0] hover:bg-slate-50/70 transition-colors cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm text-slate-900 leading-tight">
                      {alert.title}
                    </div>
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColorClass}`}
                    >
                      {alert.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {alert.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
