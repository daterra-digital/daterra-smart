// src/components/EnvironmentRouteGuard.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { resolveReleaseRoute, getDaterraEnvironment } from '../utils/releasePolicy';

export const EnvironmentRouteGuard: React.FC = () => {
  const location = useLocation();
  const env = getDaterraEnvironment();
  const decision = resolveReleaseRoute(location.pathname, location.search, env);

  if (decision.status === 'redirect' && decision.target) {
    return <Navigate to={decision.target} replace />;
  }

  if (decision.status === 'blocked' && decision.target) {
    return (
      <Navigate
        to={decision.target}
        replace
        state={{ blockedTool: decision.toolId, reason: decision.reason }}
      />
    );
  }

  return <Outlet />;
};
