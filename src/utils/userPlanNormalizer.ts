// src/utils/userPlanNormalizer.ts
import type { UserTier } from '../types/subscription.ts';

export type NormalizedPlanTier = 'free' | 'pro' | 'ultra' | 'enterprise';
export type NormalizedPlanStatus = 'active' | 'trial' | 'inactive';

export interface ResolvedUserPlan {
  tier: UserTier;
  normalizedPlan: NormalizedPlanTier;
  status: NormalizedPlanStatus;
  isActive: boolean;
  planLabel: string;
  shortLabel: string;
  statusLabel: string;
}

const PLAN_META: Readonly<
  Record<NormalizedPlanTier, { tier: UserTier; planLabel: string; shortLabel: string }>
> = {
  free: { tier: 'free', planLabel: 'Plano Free', shortLabel: 'Free' },
  pro: { tier: 'pro', planLabel: 'Plano Pro', shortLabel: 'Pro' },
  ultra: { tier: 'ultra', planLabel: 'Plano Ultra', shortLabel: 'Ultra' },
  enterprise: { tier: 'corporate', planLabel: 'Plano Enterprise', shortLabel: 'Enterprise' }
};

const STATUS_LABELS: Readonly<Record<NormalizedPlanStatus, string>> = {
  active: 'Ativo',
  trial: 'Trial',
  inactive: 'Inativo'
};

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Normaliza variações de nome/capitalização do plano vindo do Firestore.
 */
export function normalizePlanValue(raw?: unknown): NormalizedPlanTier {
  const str = readNonEmptyString(raw);
  if (!str) return 'free';
  const clean = str
    .toLowerCase()
    .replace(/^plano[\s_-]+/, '')
    .replace(/^plan[\s_-]+/, '')
    .trim();

  if (clean === 'enterprise' || clean === 'corporate' || clean === 'business' || clean === 'empresa') {
    return 'enterprise';
  }
  if (clean === 'ultra' || clean === 'ia' || clean === 'ai') {
    return 'ultra';
  }
  if (clean === 'pro' || clean === 'plus' || clean === 'premium' || clean === 'profissional') {
    return 'pro';
  }
  return 'free';
}

/**
 * Normaliza o estado da subscrição no Firestore (active / ativo / trial / inactive).
 */
export function normalizeStatusValue(raw?: unknown): NormalizedPlanStatus {
  const str = readNonEmptyString(raw);
  if (!str) return 'active';
  const clean = str.toLowerCase().trim();

  if (clean === 'trial' || clean === 'trialing' || clean === 'teste') {
    return 'trial';
  }
  if (
    clean === 'inactive' ||
    clean === 'inativo' ||
    clean === 'canceled' ||
    clean === 'cancelled' ||
    clean === 'cancelado' ||
    clean === 'expired' ||
    clean === 'expirado' ||
    clean === 'past_due' ||
    clean === 'unpaid'
  ) {
    return 'inactive';
  }
  return 'active';
}

/**
 * Resolve de forma determinística o plano e estado reais a partir do documento Firestore `users/{uid}`.
 */
export function resolveNormalizedUserPlan(
  rawProfile?: Record<string, unknown> | null
): ResolvedUserPlan {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return {
      tier: 'free',
      normalizedPlan: 'free',
      status: 'active',
      isActive: true,
      planLabel: PLAN_META.free.planLabel,
      shortLabel: PLAN_META.free.shortLabel,
      statusLabel: STATUS_LABELS.active
    };
  }

  const nestedSub =
    rawProfile.subscription && typeof rawProfile.subscription === 'object'
      ? (rawProfile.subscription as Record<string, unknown>)
      : null;

  const rawPlan =
    readNonEmptyString(rawProfile.plan) ??
    readNonEmptyString(rawProfile.subscriptionPlan) ??
    readNonEmptyString(rawProfile.tier) ??
    readNonEmptyString(nestedSub?.plan) ??
    readNonEmptyString(nestedSub?.tier);

  const rawStatus =
    readNonEmptyString(rawProfile.status) ??
    readNonEmptyString(rawProfile.subscriptionStatus) ??
    readNonEmptyString(nestedSub?.status);

  const normalizedPlan = normalizePlanValue(rawPlan);
  const status = normalizeStatusValue(rawStatus);
  const isActive = status === 'active' || status === 'trial';
  const meta = PLAN_META[normalizedPlan];

  return {
    tier: isActive ? meta.tier : 'free',
    normalizedPlan,
    status,
    isActive,
    planLabel: meta.planLabel,
    shortLabel: meta.shortLabel,
    statusLabel: STATUS_LABELS[status]
  };
}
