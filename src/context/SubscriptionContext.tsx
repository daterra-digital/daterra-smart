// src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  type UserTier,
  type SubscriptionContextType,
  TIER_RANK
} from '../types/subscription';
import { resolveNormalizedUserPlan } from '../utils/userPlanNormalizer';

const SIMULATED_TIER_STORAGE_KEY = 'daterra_simulated_tier';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // Nível real reativo baseado no documento Firestore (plan / subscriptionPlan / tier + status)
  const currentTier = useMemo<UserTier>(() => {
    return resolveNormalizedUserPlan(profile as Record<string, unknown> | null).tier;
  }, [profile]);

  // Nível simulado (estritamente ativo em desenvolvimento para testes rápidos)
  const isDevMode = Boolean(import.meta.env?.DEV);

  const [simulatedTier, setSimulatedTierState] = useState<UserTier | null>(() => {
    // Em produção, nunca lê do localStorage e limpa resíduos de simulação
    if (!isDevMode) {
      try {
        if (localStorage.getItem(SIMULATED_TIER_STORAGE_KEY)) {
          localStorage.removeItem(SIMULATED_TIER_STORAGE_KEY);
        }
      } catch {
        // Ignorar erros de quota/acesso a localStorage
      }
      return null;
    }

    try {
      const stored = localStorage.getItem(SIMULATED_TIER_STORAGE_KEY);
      if (stored === 'free' || stored === 'pro' || stored === 'ultra' || stored === 'corporate') {
        return stored;
      }
    } catch {
      // Ignorar erros de quota/acesso a localStorage
    }
    return null;
  });

  // Modal de conversão de plano
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | null>(null);

  const setSimulatedTier = useCallback((tier: UserTier | null) => {
    if (!isDevMode) {
      // Em produção, a simulação de plano é estritamente proibida
      return;
    }

    setSimulatedTierState(tier);
    try {
      if (tier) {
        localStorage.setItem(SIMULATED_TIER_STORAGE_KEY, tier);
      } else {
        localStorage.removeItem(SIMULATED_TIER_STORAGE_KEY);
      }
    } catch {
      // Ignorar erros de localStorage
    }
  }, [isDevMode]);

  const effectiveTier = useMemo<UserTier>(() => {
    if (!isDevMode) {
      return currentTier;
    }
    return simulatedTier || currentTier;
  }, [isDevMode, simulatedTier, currentTier]);

  const canAccessTier = useCallback((requiredTier: UserTier): boolean => {
    const userRank = TIER_RANK[effectiveTier] ?? 0;
    const requiredRank = TIER_RANK[requiredTier] ?? 0;
    return userRank >= requiredRank;
  }, [effectiveTier]);

  const isPro = useMemo(() => canAccessTier('pro'), [canAccessTier]);

  const openUpgradeModal = useCallback((featureName?: string) => {
    setUpgradeModalFeature(featureName || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalFeature(null);
  }, []);

  const value = useMemo<SubscriptionContextType>(() => ({
    currentTier,
    effectiveTier,
    isSimulating: isDevMode && simulatedTier !== null,
    simulatedTier: isDevMode ? simulatedTier : null,
    setSimulatedTier,
    canAccessTier,
    isPro,
    isUpgradeModalOpen,
    upgradeModalFeature,
    openUpgradeModal,
    closeUpgradeModal
  }), [
    isDevMode,
    currentTier,
    effectiveTier,
    simulatedTier,
    setSimulatedTier,
    canAccessTier,
    isPro,
    isUpgradeModalOpen,
    upgradeModalFeature,
    openUpgradeModal,
    closeUpgradeModal
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription deve ser utilizado dentro de um SubscriptionProvider');
  }
  return context;
};
