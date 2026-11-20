import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTranslation } from '../context/LanguageContext';
import { resolveNormalizedUserPlan } from '../utils/userPlanNormalizer';
import daterraLogo from '../assets/daterra-logo.svg';
import { Footer } from './Footer';
import { BottomNavigationBar } from './BottomNavigationBar';
import { PrivateDesktopNav } from './layout/PrivateDesktopNav';
import { PrivateNavDrawer } from './layout/PrivateNavDrawer';
import { HeaderLanguageDropdown } from './layout/HeaderLanguageDropdown';
import { LogoutWarningModal } from './auth/LogoutWarningModal';
import { useLogoutConfirmation } from './auth/useLogoutConfirmation';

export const PrivateLayout: React.FC = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { effectiveTier, isSimulating } = useSubscription();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const userFullName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'Utilizador'
    : user?.email?.split('@')[0] || 'Utilizador';

  const resolvedPlan = useMemo(() => {
    const base = (profile as Record<string, unknown> | null) ?? {};
    const override = isSimulating ? { ...base, plan: effectiveTier } : base;
    return resolveNormalizedUserPlan(override);
  }, [profile, isSimulating, effectiveTier]);

  const userPlanLabel =
    resolvedPlan.normalizedPlan === 'free'
      ? t('dashboard.freePlan', resolvedPlan.planLabel)
      : resolvedPlan.planLabel;

  const userPlanStatus =
    resolvedPlan.status === 'active'
      ? t('dashboard.active', resolvedPlan.statusLabel)
      : resolvedPlan.statusLabel;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoggedOut = useCallback(() => {
    setMobileMenuOpen(false);
    navigate('/');
  }, [navigate]);

  const {
    logoutModal,
    isProcessingLogout,
    requestLogout,
    cancelLogout,
    confirmDestructiveLogout,
    syncAndContinue
  } = useLogoutConfirmation({
    userId: user?.id || user?.uid,
    logout,
    onLoggedOut: handleLoggedOut
  });

  const isCalculatorActive =
    location.pathname.startsWith('/ferramentas/') ||
    (location.pathname === '/ferramentas' && new URLSearchParams(location.search).has('tool'));
  const isAssistenteActive = location.pathname === '/assistente';
  const logoTarget = isAuthenticated ? '/dashboard' : '/';

  return (
    <div className={`flex flex-col bg-[#F2F2F2] ${isAssistenteActive ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Header SaaS Privado */}
      <header className="sticky top-0 z-40 bg-daterra-primary text-white border-b border-daterra-secondary/40 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center gap-2">
          <Link to={logoTarget} className="min-h-[44px] inline-flex items-center gap-2 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/daterra-logo.svg`}
              alt="DATERRA Logo"
              className="h-9 sm:h-11 w-auto object-contain brightness-0 invert shrink-0"
              onError={(e) => {
                if (e.currentTarget.src !== daterraLogo) e.currentTarget.src = daterraLogo;
              }}
            />
          </Link>

          <PrivateDesktopNav
            userFullName={userFullName}
            userEmail={user?.email}
            userPlanLabel={userPlanLabel}
            userPlanShort={resolvedPlan.shortLabel}
            userPlanStatus={userPlanStatus}
            isPaidPlan={resolvedPlan.normalizedPlan !== 'free' && resolvedPlan.isActive}
            isOnline={isOnline}
            onLogout={requestLogout}
          />

          {/* Controlos Mobile alinhados à direita */}
          <div className="ml-auto flex lg:hidden items-center gap-2 shrink-0">
            <HeaderLanguageDropdown />

            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3 shrink-0" /> : <WifiOff className="w-3 h-3 shrink-0" />}
              <span>
                {isOnline
                  ? t('common.network.onlineShort', 'Online')
                  : t('common.network.offlineShort', 'Offline')}
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-xl touch-target flex items-center justify-center cursor-pointer"
              aria-label={t('common.openMobileMenu', 'Abrir Menu Mobile')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <PrivateNavDrawer
            userFullName={userFullName}
            userEmail={user?.email}
            userPlanLabel={userPlanLabel}
            userPlanStatus={userPlanStatus}
            onClose={() => setMobileMenuOpen(false)}
            onLogout={requestLogout}
          />
        )}
      </header>

      {/* Conteúdo Principal */}
      <main
        className={`flex-1 w-full min-w-0 ${
          isAssistenteActive
            ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100dvh-5rem-5rem)] md:h-[calc(100dvh-5rem)] overflow-hidden flex flex-col py-3 sm:py-4'
            : isCalculatorActive
            ? 'px-3 py-2.5 sm:px-6 lg:px-8 lg:py-4 max-w-7xl mx-auto calculator-content-spacing'
            : 'px-3 py-2.5 sm:px-6 lg:px-8 lg:py-3.5 max-w-7xl mx-auto mobile-content-spacing md:pb-8'
        }`}
      >
        <Outlet />
      </main>

      {!isCalculatorActive && !isAssistenteActive && (
        <div className="mobile-content-spacing md:pb-0">
          <Footer />
        </div>
      )}

      <BottomNavigationBar />

      <LogoutWarningModal
        isOpen={logoutModal !== null}
        mode={logoutModal?.mode ?? 'local-data-loss'}
        presenceStatus={logoutModal?.presenceStatus}
        pendingSyncMessage={logoutModal?.pendingMessage}
        errorMessage={logoutModal?.error}
        isSubmitting={isProcessingLogout}
        isOnline={isOnline}
        onCancel={cancelLogout}
        onConfirmDestructiveLogout={confirmDestructiveLogout}
        onSyncAndContinue={syncAndContinue}
      />
    </div>
  );
};
