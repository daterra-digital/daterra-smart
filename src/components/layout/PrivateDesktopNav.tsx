import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  GraduationCap,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  Bot
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { isLocalhost } from '../../utils/environment';
import { HeaderLanguageDropdown } from './HeaderLanguageDropdown';

interface PrivateDesktopNavProps {
  userFullName: string;
  userEmail?: string;
  isOnline: boolean;
  onLogout: () => void;
}

export const PrivateDesktopNav: React.FC<PrivateDesktopNavProps> = ({
  userFullName,
  userEmail,
  isOnline,
  onLogout
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
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
          <span>{t('nav.home', 'Início')}</span>
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
          <span>{t('nav.tools', 'Ferramentas')}</span>
        </Link>

        {isLocalhost() && (
          <Link
            to="/assistente"
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 touch-target ${
              isActive('/assistente')
                ? 'bg-daterra-secondary text-white shadow-sm'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Bot className="w-4 h-4 text-daterra-accent" />
            <span>{t('nav.assistant', 'Assistente')}</span>
          </Link>
        )}

        <Link
          to="/academia"
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 touch-target ${
            isActive('/academia')
              ? 'bg-daterra-secondary text-white shadow-sm'
              : 'text-slate-200 hover:text-white hover:bg-white/10'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-daterra-accent" />
          <span>{t('nav.academy', 'Academia')}</span>
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
          <span>{t('nav.settings', 'Definições')}</span>
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
              <span>{t('common.onlinePwa', 'Online (PWA)')}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>{t('common.offlineIndexedDb', 'Modo Offline (IndexedDB Ativo)')}</span>
            </>
          )}
        </div>

        {/* Seletor de Idioma (Dropdown) */}
        <HeaderLanguageDropdown />

        {/* Utilizador */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/15">
          <div className="w-8 h-8 rounded-full bg-daterra-accent text-white flex items-center justify-center font-bold text-xs">
            {userFullName ? userFullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold block text-white truncate max-w-[150px]" title={userFullName}>
              {userFullName}
            </span>
            <span className="text-[10px] text-slate-300 block truncate max-w-[150px]" title={userEmail || ''}>
              {userEmail || t('common.activeSession', 'Sessão Ativa')}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 text-slate-300 hover:text-rose-300 hover:bg-white/10 rounded-xl transition-colors touch-target flex items-center justify-center cursor-pointer"
          title={t('common.logout', 'Terminar Sessão')}
          aria-label={t('common.logout', 'Terminar Sessão')}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
