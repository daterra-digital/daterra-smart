// src/types/subscription.ts
// Tipos do Sistema de Gating SaaS Multi-tier (Free, Pro, Ultra, Corporate)

export type UserTier = 'free' | 'pro' | 'ultra' | 'corporate';

export const TIER_RANK: Record<UserTier, number> = {
  free: 0,
  pro: 1,
  ultra: 2,
  corporate: 3
};

export interface TierMeta {
  id: UserTier;
  label: string;
  labelKey: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
  descriptionKey: string;
  active: boolean; // ultra e corporate são placeholders inativos
}

export const TIER_CONFIG: Record<UserTier, TierMeta> = {
  free: {
    id: 'free',
    label: 'Gratuito',
    labelKey: 'gating.tiers.free.label',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-300',
    description: 'Ferramentas essenciais de campo e consulta básica.',
    descriptionKey: 'gating.tiers.free.description',
    active: true
  },
  pro: {
    id: 'pro',
    label: 'PRO',
    labelKey: 'gating.tiers.pro.label',
    badgeBg: 'bg-[#114037]',
    badgeText: 'text-[#3CA64C]',
    borderColor: 'border-[#1D734B]',
    description: 'Modelos avançados EPPO, calibração, LWA/TRV e telemetria de perfis.',
    descriptionKey: 'gating.tiers.pro.description',
    active: true
  },
  ultra: {
    id: 'ultra',
    label: 'Ultra (IA)',
    labelKey: 'gating.tiers.ultra.label',
    badgeBg: 'bg-purple-900',
    badgeText: 'text-purple-300',
    borderColor: 'border-purple-600',
    description: 'Diagnóstico visual e relatórios preditivos por Inteligência Artificial.',
    descriptionKey: 'gating.tiers.ultra.description',
    active: false
  },
  corporate: {
    id: 'corporate',
    label: 'Corporate',
    labelKey: 'gating.tiers.corporate.label',
    badgeBg: 'bg-blue-900',
    badgeText: 'text-blue-300',
    borderColor: 'border-blue-600',
    description: 'Multi-exploração, API CentralGest ERP e relatórios personalizados.',
    descriptionKey: 'gating.tiers.corporate.description',
    active: false
  }
};

// Mapeamento canónico de ferramentas restritas ao plano Pro
export const PRO_TOOL_IDS = new Set<string>([
  'ajuste_dose_eppo',
  'calc_area_parede_foliar',
  'calc_volume_copa',
  'calc_volume_calda_trv',
  'calc_debito_total',
  'calc_calibracao_pulverizador',
  'comparador_bicos',
  'pre_inspecao_dgav',
  'smart_debito',
  'drone_buffer_zone',
  'satelite_ndvi',
  'calc_eppo'
]);

export interface SubscriptionContextType {
  currentTier: UserTier;
  effectiveTier: UserTier;
  isSimulating: boolean;
  simulatedTier: UserTier | null;
  setSimulatedTier: (tier: UserTier | null) => void;
  canAccessTier: (requiredTier: UserTier) => boolean;
  isPro: boolean;
  isUpgradeModalOpen: boolean;
  upgradeModalFeature: string | null;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
}
