import React, { useState } from 'react';
import { ScreenType } from '../types';

interface ChatPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProcessing: (desc: string) => void;
}

export const ChatPromptModal: React.FC<ChatPromptModalProps> = ({
  isOpen,
  onClose,
  onStartProcessing,
}) => {
  const [description, setDescription] = useState(
    'Módulo de membrana de ultrafiltração em aço inox 316L para separação biológica, pressão máxima 10 bar, vazão 15m3/h.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onStartProcessing(`Descricao_Chat_${Date.now()}.pdf`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563EB] text-[20px]">
              chat
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Descrever Produto para Classificação Fiscal
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
            Não tem a fatura em mãos? Descreva os componentes técnicos, matéria-prima predominante, função ou potência do equipamento.
          </p>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white font-medium resize-none leading-relaxed"
            placeholder="Exemplo: Sensor fotoelétrico a laser com alcance de 50 metros, saída PNP, alimentação 24VDC..."
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
              <span>Classificar via IA</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
