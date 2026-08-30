import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calculator, GraduationCap, 
  Map, Settings, LogOut, Wifi, WifiOff, Menu, X, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import daterraLogo from '../assets/daterra-logo.svg';

export const PrivateLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);


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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2]">
      {/* Header SaaS Privado */}
      <header className="sticky top-0 z-40 bg-daterra-primary text-white border-b border-daterra-secondary/40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo DATERRA SVG */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <img
              src={daterraLogo}
              alt="DATERRA Logo"
              className="h-11 w-auto object-contain brightness-0 invert"
            />
          </Link>

          {/* Links de Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 touch-target ${
                isActive('/dashboard')
                  ? 'bg-daterra-secondary text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-daterra-accent" />
              <span>{t('nav.home')}</span>
            </Link>

            <Link
              to="/ferramentas"
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 touch-target ${
                isActive('/ferramentas')
                  ? 'bg-daterra-secondary text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-4 h-4 text-daterra-accent" />
              <span>{t('nav.tools')}</span>
            </Link>

            <Link
              to="/academia"
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 touch-target ${
                isActive('/academia')
                  ? 'bg-daterra-secondary text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-daterra-accent" />
              <span>{t('nav.academy')}</span>
            </Link>

            <Link
              to="/exploracao"
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 touch-target ${
                isActive('/exploracao')
                  ? 'bg-daterra-secondary text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Map className="w-4 h-4 text-daterra-accent" />
              <span>{t('nav.exploration')}</span>
            </Link>

            <Link
              to="/definicoes"
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 touch-target ${
                isActive('/definicoes')
                  ? 'bg-daterra-secondary text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4 text-daterra-accent" />
              <span>{t('nav.settings')}</span>
            </Link>
          </nav>

          {/* Estado Offline / User Profile / Logout */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Badge PWA Status */}
            <div
              className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Online (PWA)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Modo Offline (IndexedDB Active)</span>
                </>
              )}
            </div>

            {/* Utilizador */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/15">
              <div className="w-8 h-8 rounded-full bg-daterra-accent text-white flex items-center justify-center font-bold text-xs">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold block text-white truncate max-w-[150px]" title={user?.email || ''}>
                  {user?.email || 'Utilizador'}
                </span>
                <span className="text-[10px] text-slate-300 block">Sessão Ativa</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-300 hover:text-rose-300 hover:bg-white/10 rounded-xl transition-colors touch-target flex items-center justify-center"
              title="Terminar Sessão"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex lg:hidden items-center gap-3">
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-xl touch-target flex items-center justify-center"
              aria-label="Abrir Menu Mobile"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Drawer Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-daterra-primary border-t border-white/10 px-4 py-4 space-y-2 shadow-2xl">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
            >
              <LayoutDashboard className="w-5 h-5 text-daterra-accent" />
              <span>{t('nav.home')}</span>
            </Link>

            <Link
              to="/ferramentas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
            >
              <Calculator className="w-5 h-5 text-daterra-accent" />
              <span>{t('nav.tools')}</span>
            </Link>

            <Link
              to="/academia"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
            >
              <GraduationCap className="w-5 h-5 text-daterra-accent" />
              <span>{t('nav.academy')}</span>
            </Link>

            <Link
              to="/exploracao"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
            >
              <Map className="w-5 h-5 text-daterra-accent" />
              <span>{t('nav.exploration')}</span>
            </Link>

            <Link
              to="/definicoes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
            >
              <Settings className="w-5 h-5 text-daterra-accent" />
              <span>{t('nav.settings')}</span>
            </Link>


            <div className="pt-3 border-t border-white/10 flex items-center justify-between px-2">
              <div className="flex items-center gap-2 truncate max-w-[200px]">
                <User className="w-5 h-5 text-daterra-accent shrink-0" />
                <span className="text-xs font-bold text-white truncate" title={user?.email || ''}>
                  {user?.email || 'Utilizador'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 touch-target"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
