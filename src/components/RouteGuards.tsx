// src/components/RouteGuards.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

// Guardião de Rotas Privadas
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { t } = useTranslation();

  const isDevBypass =
    import.meta.env.DEV &&
    (typeof window !== 'undefined' &&
      (window.location.search.includes('mock_auth=true') || window.location.hash.includes('mock_auth=true')));

  if (isAuthLoading && !isDevBypass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-daterra-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            {t('common.states.validating_session', 'A validar sessão...')}
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isDevBypass) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Guardião de Rotas Públicas (redireciona para dashboard se já autenticado)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { t } = useTranslation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-daterra-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            {t('common.states.loading', 'A carregar...')}
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
