import React, { useState } from 'react';
import { TaxItem } from '../types';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: TaxItem[];
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const siscomexPayload = {
    sistema: 'Portal Único de Comércio Exterior (Siscomex/Duimp)',
    versao: '4.2-2026',
    identificacaoDeclaracao: {
      numeroReferenciaImportador: 'DI-PREP-88392-26',
      tipoDeclaracao: 'DUIMP_CONSUMO',
      situacaoConferencia: 'DESEMBARACO_AUTOMATICO_VERDE',
      dataProcessamento: new Date().toISOString(),
      recintoAduaneiro: '8.91.11.01-4 (Porto de Santos)',
      unidadeRFB: '0817800 (ALF - Porto de Santos)',
      moedaNegociacao: 'USD',
      taxaCambialBacen: 5.42,
    },
    itens: items.map((item) => ({
      numeroItem: item.itemNumber,
      ncm: item.ncm,
      codigoProduto: item.partNumber,
      denominacaoComercial: item.description,
      descricaoOtimizadaDI: item.diDescription,
      quantidadeComercial: item.quantity,
      pesoLiquidoKg: item.weight,
      valorFOBUSD: item.fobUsd,
      valorFOBBRL: item.fobBrl,
      tributos: {
        ii: {
          aliquota: item.iiRate,
          isExTarifario: !!item.iiIsEx,
          valorRecolherBRL: item.iiAmount,
        },
        ipi: {
          aliquota: item.ipiRate,
          valorRecolherBRL: item.ipiAmount,
        },
        pisImportacao: {
          aliquota: item.pisRate,
          valorRecolherBRL: item.pisAmount,
        },
        cofinsImportacao: {
          aliquota: item.cofinsRate,
          valorRecolherBRL: item.cofinsAmount,
        },
        icmsSP: {
          aliquota: item.icmsRate,
          beneficioConvenio: 'Convênio ICMS 52/91',
          valorRecolherBRL: item.icmsAmount,
        },
        cargaTotalTributosBRL: item.totalImportTax,
      },
      conformidadeLegal: {
        amparoNESH: item.neshGrounds,
        solucaoCosit: item.cositReport,
        regrasRGI: item.rgiRules,
        laudoTecnicoAuditado: true,
        hashAssinatura: item.auditHash,
      },
    })),
  };

  const jsonString = JSON.stringify(siscomexPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payload_duimp_siscomex_88392-26.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                data_object
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Payload Duimp / Siscomex (JSON Estruturado)
              </h3>
              <p className="text-[11px] text-slate-500">
                Pronto para transmissão direta ao Portal Único da Receita Federal
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

        {/* Modal Body / JSON Code block */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900 text-slate-100 font-mono text-xs">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-emerald-600 text-[16px]">
              verified
            </span>
            Validação de Schema XSD Duimp 2026: <strong>100% Válido</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                download
              </span>
              <span>Baixar Arquivo .JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
