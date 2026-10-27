import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import daterraLogo from '../assets/daterra-logo.svg';
import { Footer } from './Footer';
import { BottomNavigationBar } from './BottomNavigationBar';
import { PrivateDesktopNav } from './layout/PrivateDesktopNav';
import { PrivateNavDrawer } from './layout/PrivateNavDrawer';
import { HeaderLanguageDropdown } from './layout/HeaderLanguageDropdown';

export const PrivateLayout: React.FC = () => {
  const { user, profile, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isCalculatorActive =
    location.pathname.startsWith('/ferramentas/') ||
    (location.pathname === '/ferramentas' && new URLSearchParams(location.search).has('tool'));
  const isAssistenteActive = location.pathname === '/assistente';

  return (
    <div className={`flex flex-col bg-[#F2F2F2] ${isAssistenteActive ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Header SaaS Privado */}
      <header className="sticky top-0 z-40 bg-daterra-primary text-white border-b border-daterra-secondary/40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img
              src={daterraLogo}
              alt="DATERRA Logo"
              className="h-11 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <PrivateDesktopNav
            userFullName={userFullName}
            userEmail={user?.email}
            isOnline={isOnline}
            onLogout={handleLogout}
          />

          {/* Botão Menu Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <HeaderLanguageDropdown />

            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? t('common.onlinePwa', 'Online') : t('common.states.offline', 'Offline')}</span>
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
            onClose={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
          />
        )}
      </header>

      {/* Conteúdo Principal */}
      <main
        className={`flex-1 w-full ${
          isAssistenteActive
            ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100dvh-5rem-5rem)] md:h-[calc(100dvh-5rem)] overflow-hidden flex flex-col py-3 sm:py-4'
            : isCalculatorActive
            ? 'p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto calculator-content-spacing'
            : 'p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto mobile-content-spacing md:pb-8'
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
    </div>
  );
};
