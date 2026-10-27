// src/components/gating/FeatureLockedCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useTranslation } from '../../context/LanguageContext';
import { type UserTier, TIER_CONFIG } from '../../types/subscription';

interface FeatureLockedCardProps {
  requiredTier?: UserTier;
  featureName?: string;
  onBack?: () => void;
}

export const FeatureLockedCard: React.FC<FeatureLockedCardProps> = ({
  requiredTier = 'pro',
  featureName,
  onBack
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openUpgradeModal } = useSubscription();
  const tierConfig = TIER_CONFIG[requiredTier] || TIER_CONFIG.pro;
  const translatedTierLabel = t(tierConfig.labelKey, tierConfig.label);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/ferramentas');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-8 p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-soft text-center space-y-5 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-[#114037]/10 flex items-center justify-center text-[#114037]">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#114037] text-[#3CA64C]">
          <Sparkles className="w-3 h-3" />
          <span>{t('gating.exclusive_tier', 'Exclusivo {{tier}}', { tier: translatedTierLabel })}</span>
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          {featureName
            ? t('gating.locked_card.title_feature', 'Acesso Restrito: {{feature}}', { feature: featureName })
            : t('gating.locked_card.title_default', 'Funcionalidade Reservada ao Plano PRO')}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          {t(
            'gating.locked_card.description',
            'Esta funcionalidade agronómica requer o nível {{tier}} para aceder a algoritmos avançados, modelos de calibração e telemetria de perfis.',
            { tier: translatedTierLabel }
          )}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center justify-center gap-2 transition-all touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('gating.locked_card.btn_back', 'Voltar ao Catálogo')}</span>
        </button>

        <button
          type="button"
          onClick={() => openUpgradeModal(featureName)}
          className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-2xl bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all touch-target"
        >
          <span>{t('gating.locked_card.btn_unlock', 'Desbloquear com PRO')}</span>
          <ArrowRight className="w-4 h-4 text-[#3CA64C]" />
        </button>
      </div>
    </div>
  );
};
