import React, { useState } from 'react';
import { FiscalProfile, ScreenType } from '../types';

interface PerfilFiscalScreenProps {
  profile: FiscalProfile;
  onUpdateProfile: (newProfile: FiscalProfile) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const PerfilFiscalScreen: React.FC<PerfilFiscalScreenProps> = ({
  profile: initialProfile,
  onUpdateProfile,
  onNavigate,
}) => {
  const [profile, setProfile] = useState<FiscalProfile>(initialProfile);
  const [newRegimeInput, setNewRegimeInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleAlert = (key: keyof FiscalProfile['alerts']) => {
    setProfile((prev) => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        [key]: !prev.alerts[key],
      },
    }));
  };

  const handleAddSpecialRegime = () => {
    if (!newRegimeInput.trim()) return;
    if (!profile.specialRegimes.includes(newRegimeInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        specialRegimes: [...prev.specialRegimes, newRegimeInput.trim()],
      }));
    }
    setNewRegimeInput('');
  };

  const handleRemoveSpecialRegime = (regimeToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      specialRegimes: prev.specialRegimes.filter((r) => r !== regimeToRemove),
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onUpdateProfile(profile);
      showToast('Preferências fiscais atualizadas com sucesso no Engine!');
    }, 600);
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
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Perfil Fiscal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurações tributárias da empresa para cálculo automatizado de impostos de importação
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-md shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Última sincronização: <strong>Hoje, 14:35</strong> · RFB e BCB integrados</span>
        </div>
      </div>

      {/* 2. Main 3 Configuration Cards */}
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Card 1: Regime Tributário */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#2563EB] text-[20px]">
              account_balance
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Regime Tributário
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Define as alíquotas de PIS/COFINS-Importação e as regras de tomada de crédito na entrada aduaneira.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lucro Real */}
            <div
              onClick={() => setProfile((p) => ({ ...p, regime: 'real' }))}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                profile.regime === 'real'
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">
                  Lucro Real
                </span>
                {profile.regime === 'real' && (
                  <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo no Engine
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                PIS 2,10% · COFINS 9,65% não-cumulativos com direito a tomada integral de crédito fiscal na importação.
              </p>
            </div>

            {/* Lucro Presumido */}
            <div
              onClick={() => setProfile((p) => ({ ...p, regime: 'presumido' }))}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                profile.regime === 'presumido'
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">
                  Lucro Presumido
                </span>
                {profile.regime === 'presumido' && (
                  <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                PIS/COFINS cumulativos (0,65% e 3,00%) no faturamento interno, com retenção na importação conforme legislação.
              </p>
            </div>

            {/* Simples Nacional */}
            <div
              onClick={() => setProfile((p) => ({ ...p, regime: 'simples' }))}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                profile.regime === 'simples'
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">
                  Simples Nacional
                </span>
                {profile.regime === 'simples' && (
                  <span className="bg-[#2563EB] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tributação unificada. Tributos federais na importação recolhidos à parte sem transferência de créditos.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Configurações de Importação */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#2563EB] text-[20px]">
              local_shipping
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Configurações de Importação
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Parâmetros logísticos e regulatórios aplicados por padrão nas simulações e diagnósticos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Estado de Desembaraço */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estado de Desembaraço Aduaneiro (ICMS)
              </label>
              <select
                value={profile.customsState}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, customsState: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="São Paulo (SP) — Convênio ICMS 52/91 e Dec. 45.490">
                  São Paulo (SP) — Convênio ICMS 52/91 e Dec. 45.490
                </option>
                <option value="Santa Catarina (SC) — TTD 409 / 410">
                  Santa Catarina (SC) — TTD 409 / 410
                </option>
                <option value="Espírito Santo (ES) — FUNDAP / Invest-ES">
                  Espírito Santo (ES) — FUNDAP / Invest-ES
                </option>
                <option value="Paraná (PR) — Programa Paraná Competitivo">
                  Paraná (PR) — Programa Paraná Competitivo
                </option>
              </select>
            </div>

            {/* Modal de Transporte */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Modal de Transporte Predominante
              </label>
              <select
                value={profile.modal}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, modal: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="Marítimo (Porto de Santos / Paranaguá)">
                  Marítimo (Porto de Santos / Paranaguá)
                </option>
                <option value="Aéreo (Guarulhos GRU / Viracopos VCP)">
                  Aéreo (Guarulhos GRU / Viracopos VCP)
                </option>
                <option value="Rodoviário (Uruguaiana / Foz do Iguaçu)">
                  Rodoviário (Uruguaiana / Foz do Iguaçu)
                </option>
              </select>
            </div>

            {/* Regimes Especiais */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Regimes Aduaneiros Especiais Habilitados
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {profile.specialRegimes.map((regime) => (
                  <span
                    key={regime}
                    className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    <span>{regime}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialRegime(regime)}
                      className="hover:text-red-600 cursor-pointer"
                      title="Remover regime"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Add regime input */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newRegimeInput}
                  onChange={(e) => setNewRegimeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialRegime();
                    }
                  }}
                  placeholder="Adicionar regime (ex: Entreposto Aduaneiro, Recof-Sped)..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialRegime}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Moeda Padrão */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cotação Padrão para Simulações
              </label>
              <input
                type="text"
                disabled
                value={profile.currency}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Sincronizada automaticamente com a taxa PTAX Venda do Banco Central do Brasil.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Alertas e Notificações */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#2563EB] text-[20px]">
              notifications_active
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Alertas de Conformidade e Oportunidades Fiscais
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Ative as verificações em tempo real que o motor SAVE NCM executa em cada invoice submetida.
          </p>

          <div className="divide-y divide-slate-100">
            {/* Toggle 1: Ex-Tarifário */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Oportunidades de Ex-Tarifário (BK / BIT)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Identifica alíquota de II 0,0% aplicável por ausência de produção nacional na TEC 2026.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAlert('exTarifario')}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  profile.alerts.exTarifario ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    profile.alerts.exTarifario ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Antidumping */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Alertas de Medidas Antidumping & Salvaguardas
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Notifica sobretaxas específicas da Portaria SECEX para países e origens restritas.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAlert('antidumping')}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  profile.alerts.antidumping ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    profile.alerts.antidumping ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Cosit */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Divergência de Soluções de Consulta Cosit / RFB
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Alerta riscos de reclassificação fiscal baseados em autuações recentes da Receita Federal.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAlert('cosit')}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  profile.alerts.cosit ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    profile.alerts.cosit ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4: Variação Cambial */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Variação Cambial Expressiva (&gt; 3% na semana)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Sinaliza impacto da flutuação da moeda estrangeira no custo aduaneiro final estimado.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAlert('exchangeVariation')}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  profile.alerts.exchangeVariation ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    profile.alerts.exchangeVariation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5: Drawback */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Vencimento de Prazos de Atos de Drawback
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Acompanha datas limites de exportação para evitar exigência tributária retroativa com juros.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAlert('drawbackExpiry')}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  profile.alerts.drawbackExpiry ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    profile.alerts.drawbackExpiry ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => onNavigate('nova-operacao')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Voltar para Início
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Salvando no Engine...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    save
                  </span>
                  <span>Salvar Preferências Fiscais</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
