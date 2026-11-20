import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  GraduationCap,
  Map,
  Settings,
  LogOut,
  Bot
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

interface PrivateNavDrawerProps {
  userFullName: string;
  userEmail?: string;
  userPlanLabel?: string;
  userPlanStatus?: string;
  onClose: () => void;
  onLogout: () => void;
}

export const PrivateNavDrawer: React.FC<PrivateNavDrawerProps> = ({
  userFullName,
  userEmail,
  userPlanLabel,
  userPlanStatus,
  onClose,
  onLogout
}) => {
  const { t } = useTranslation();
  const initials = (userFullName || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  const planText = userPlanLabel || t('dashboard.freePlan', 'Plano Free');
  const statusText = userPlanStatus || t('dashboard.active', 'Ativo');

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

      {import.meta.env.VITE_ENABLE_ASSISTANT === 'true' && (
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

      <div className="pt-3 border-t border-white/10 space-y-2.5 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#1D734B] border border-[#3CA64C]/70 text-white flex items-center justify-center font-extrabold text-xs tracking-tight shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-extrabold text-white truncate" title={userFullName}>
                {userFullName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/12 border border-white/15 text-emerald-200 text-[10px] font-extrabold whitespace-nowrap shrink-0">
                {planText} · {statusText}
              </span>
            </div>
            <span className="text-[11px] text-slate-300 block truncate mt-0.5" title={userEmail || ''}>
              {userEmail || t('common.activeSession', 'Sessão Ativa')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[44px] px-3 py-2 bg-rose-600/85 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 touch-target cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t('common.actions.logout', t('common.logout', 'Terminar Sessão'))}</span>
        </button>
      </div>
    </div>
  );
};
