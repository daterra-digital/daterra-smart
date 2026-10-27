// src/components/gating/TierRouteGuard.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';
import { type UserTier } from '../../types/subscription';
import { FeatureLockedCard } from './FeatureLockedCard';

interface TierRouteGuardProps {
  requiredTier?: UserTier;
  featureName?: string;
  children?: React.ReactNode;
}

export const TierRouteGuard: React.FC<TierRouteGuardProps> = ({
  requiredTier = 'pro',
  featureName,
  children
}) => {
  const { canAccessTier } = useSubscription();

  if (canAccessTier(requiredTier)) {
    return children ? <>{children}</> : <Outlet />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <FeatureLockedCard
        requiredTier={requiredTier}
        featureName={featureName}
      />
    </div>
  );
};
