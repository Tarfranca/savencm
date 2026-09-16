import React, { useState } from 'react';

interface ProductLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProcessing: (url: string) => void;
}

export const ProductLinkModal: React.FC<ProductLinkModalProps> = ({
  isOpen,
  onClose,
  onStartProcessing,
}) => {
  const [productUrl, setProductUrl] = useState(
    'https://www.alibaba.com/product-detail/Industrial-SS316L-Ultrafiltration-Membrane-Filter_160089201.html'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim()) return;
    onStartProcessing('Importacao_Link_Alibaba.pdf');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563EB] text-[20px]">
              link
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Importar Informações por Link do Produto
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Insira o link de uma página de produto no Alibaba, AliExpress, catálogo técnico ou site do fornecedor internacional.
          </p>

          <input
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white font-mono"
            placeholder="https://www.alibaba.com/product-detail/..."
            required
          />

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Extrair e Classificar</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
