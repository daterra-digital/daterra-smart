import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  GraduationCap,
  Map,
  Settings,
  LogOut,
  User,
  Bot
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { isLocalhost } from '../../utils/environment';

interface PrivateNavDrawerProps {
  userFullName: string;
  userEmail?: string;
  onClose: () => void;
  onLogout: () => void;
}

export const PrivateNavDrawer: React.FC<PrivateNavDrawerProps> = ({
  userFullName,
  userEmail,
  onClose,
  onLogout
}) => {
  const { t } = useTranslation();

  return (
    <div className="lg:hidden bg-daterra-primary border-t border-white/10 px-4 py-4 space-y-2 shadow-2xl animate-fade-in">
      <Link
        to="/dashboard"
        onClick={onClose}
        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
      >
        <LayoutDashboard className="w-5 h-5 text-daterra-accent" />
        <span>{t('nav.home', 'Início')}</span>
      </Link>

      <Link
        to="/ferramentas"
        onClick={onClose}
        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
      >
        <Calculator className="w-5 h-5 text-daterra-accent" />
        <span>{t('nav.tools', 'Ferramentas')}</span>
      </Link>

      {isLocalhost() && (
        <Link
          to="/assistente"
          onClick={onClose}
          className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
        >
          <Bot className="w-5 h-5 text-daterra-accent" />
          <span>{t('nav.assistant', 'Assistente')}</span>
        </Link>
      )}

      <Link
        to="/academia"
        onClick={onClose}
        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
      >
        <GraduationCap className="w-5 h-5 text-daterra-accent" />
        <span>{t('nav.academy', 'Academia')}</span>
      </Link>

      <Link
        to="/exploracao"
        onClick={onClose}
        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
      >
        <Map className="w-5 h-5 text-daterra-accent" />
        <span>{t('nav.exploration', 'Exploração')}</span>
      </Link>

      <Link
        to="/definicoes"
        onClick={onClose}
        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-bold text-white hover:bg-white/10 touch-target"
      >
        <Settings className="w-5 h-5 text-daterra-accent" />
        <span>{t('nav.settings', 'Definições')}</span>
      </Link>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 truncate max-w-[200px]">
          <User className="w-5 h-5 text-daterra-accent shrink-0" />
          <div className="leading-tight truncate">
            <span className="text-xs font-bold text-white block truncate" title={userFullName}>
              {userFullName}
            </span>
            <span className="text-[10px] text-slate-300 block truncate" title={userEmail || ''}>
              {userEmail || ''}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 touch-target cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('common.actions.logout', t('common.logout', 'Terminar Sessão'))}</span>
        </button>
      </div>
    </div>
  );
};
