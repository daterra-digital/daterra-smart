// src/components/gating/UpgradeModal.tsx
import React, { useEffect } from 'react';
import { X, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useTranslation } from '../../context/LanguageContext';

export const UpgradeModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    isUpgradeModalOpen,
    upgradeModalFeature,
    closeUpgradeModal,
    setSimulatedTier,
    effectiveTier
  } = useSubscription();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUpgradeModalOpen) {
        closeUpgradeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUpgradeModalOpen, closeUpgradeModal]);

  if (!isUpgradeModalOpen) return null;

  const handleActivateProSimulation = () => {
    setSimulatedTier('pro');
    closeUpgradeModal();
  };

  const handleResetToFree = () => {
    setSimulatedTier('free');
    closeUpgradeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Container Mobile Bottom Sheet / Modal Desktop */}
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        {/* Top Header Card */}
        <div className="relative bg-[#114037] text-white p-6 pb-7">
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors touch-target"
            aria-label={t('gating.modal.close_aria', 'Fechar')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#3CA64C] text-[#114037]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('gating.modal.badge', 'DATERRA PRO')}</span>
            </span>
            <span className="text-xs text-emerald-200 font-semibold">
              {effectiveTier === 'free'
                ? t('gating.modal.current_plan_free', 'Plano Atual: Gratuito')
                : t('gating.modal.current_plan_pro', 'Modo PRO Ativo')}
            </span>
          </div>

          <h2 id="upgrade-modal-title" className="text-xl font-black tracking-tight text-white mt-1">
            {upgradeModalFeature
              ? t('gating.modal.title_feature', 'Acesso Restrito: {{feature}}', { feature: upgradeModalFeature })
              : t('gating.modal.title_default', 'Desbloqueie o Potencial Máximo com o Plano PRO')}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {t('gating.modal.subtitle', 'Metodologias agronómicas avançadas, calibração profissional e telemetria de campo contínua.')}
          </p>
        </div>

        {/* Corpo de Benefícios Agronómicos */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#3CA64C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {t('gating.modal.benefit_1_title', 'Modelos 3D Avançados (LWA & TRV)')}
                </p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {t('gating.modal.benefit_1_desc', 'Cálculo de dosagens adaptadas à copa e área foliar real segundo EPPO PP 1/239.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#3CA64C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {t('gating.modal.benefit_2_title', 'Telemetria e Eficácia da Máquina')}
                </p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {t('gating.modal.benefit_2_desc', 'Gravação direta de LWA/TRV nos perfis de cultura e eficiência percentual no equipamento.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#3CA64C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {t('gating.modal.benefit_3_title', 'Inspeção Prévia e Bicos Específicos')}
                </p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {t('gating.modal.benefit_3_desc', 'Comparador de bicos ISO, débitos de trabalho e auditoria técnica de pulverizadores.')}
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação com Alvos de Toque Mínimos de 48px */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleActivateProSimulation}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all touch-target"
            >
              <span>
                {effectiveTier === 'pro'
                  ? t('gating.modal.btn_keep_pro', 'Manter Modo PRO Ativo')
                  : t('gating.modal.btn_activate_pro', 'Ativar Modo PRO (Simulação Imediata)')}
              </span>
              <ArrowRight className="w-4 h-4 text-[#3CA64C]" />
            </button>

            {effectiveTier === 'pro' && (
              <button
                type="button"
                onClick={handleResetToFree}
                className="w-full min-h-[48px] px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all touch-target"
              >
                {t('gating.modal.btn_reset_free', 'Voltar ao Modo Gratuito (Free)')}
              </button>
            )}

            <button
              type="button"
              onClick={closeUpgradeModal}
              className="w-full min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all touch-target"
            >
              {t('gating.modal.btn_continue_free', 'Continuar no Plano Gratuito')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
