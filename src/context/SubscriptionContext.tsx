// src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  type UserTier,
  type SubscriptionContextType,
  TIER_RANK
} from '../types/subscription';

const SIMULATED_TIER_STORAGE_KEY = 'daterra_simulated_tier';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const mapPlanToTier = (plan?: string | null): UserTier => {
  if (!plan) return 'free';
  const normalized = plan.toLowerCase().trim();
  if (normalized === 'pro' || normalized === 'plus') return 'pro';
  if (normalized === 'ultra') return 'ultra';
  if (normalized === 'enterprise' || normalized === 'corporate') return 'corporate';
  return 'free';
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  
  // Nível real baseado no perfil autenticado
  const currentTier = useMemo<UserTier>(() => {
    return mapPlanToTier(profile?.plan);
  }, [profile?.plan]);

  // Nível simulado (armazenado localmente para testes e alternância rápida em dev/demo)
  const [simulatedTier, setSimulatedTierState] = useState<UserTier | null>(() => {
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
  }, []);

  const effectiveTier = useMemo<UserTier>(() => {
    return simulatedTier || currentTier;
  }, [simulatedTier, currentTier]);

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
    isSimulating: simulatedTier !== null,
    simulatedTier,
    setSimulatedTier,
    canAccessTier,
    isPro,
    isUpgradeModalOpen,
    upgradeModalFeature,
    openUpgradeModal,
    closeUpgradeModal
  }), [
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
