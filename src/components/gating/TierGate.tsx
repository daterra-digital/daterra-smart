// src/components/gating/TierGate.tsx
import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { type UserTier } from '../../types/subscription';
import { FeatureLockedCard } from './FeatureLockedCard';

interface TierGateProps {
  requiredTier?: UserTier;
  featureName?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const TierGate: React.FC<TierGateProps> = ({
  requiredTier = 'pro',
  featureName,
  fallback,
  children
}) => {
  const { canAccessTier } = useSubscription();

  if (canAccessTier(requiredTier)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <FeatureLockedCard
      requiredTier={requiredTier}
      featureName={featureName}
    />
  );
};
