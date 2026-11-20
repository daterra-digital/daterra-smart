import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calculator, GraduationCap, Settings, LogOut, Wifi, WifiOff, Bot, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { HeaderLanguageDropdown } from './HeaderLanguageDropdown';

interface PrivateDesktopNavProps {
  userFullName: string;
  userEmail?: string;
  userPlanLabel?: string;
  userPlanShort?: string;
  userPlanStatus?: string;
  isPaidPlan?: boolean;
  isOnline: boolean;
  onLogout: () => void;
}

export const PrivateDesktopNav: React.FC<PrivateDesktopNavProps> = ({
  userFullName, userEmail, userPlanLabel, userPlanShort, userPlanStatus, isPaidPlan = false, isOnline, onLogout
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const initials = (userFullName || 'U').trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  const planText = userPlanLabel || t('dashboard.freePlan', 'Plano Free');
  const shortPlan = userPlanShort || 'Free';
  const statusText = userPlanStatus || t('dashboard.active', 'Ativo');

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  const navLinkClass = (path: string) =>
    `px-2.5 xl:px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 touch-target ${
      isActive(path)
        ? 'bg-daterra-secondary text-white shadow-sm'
        : 'text-slate-200 hover:text-white hover:bg-white/10'
    }`;

  return (
    <div className="ml-auto hidden lg:flex items-center gap-2 shrink-0">
      <nav className="flex items-center gap-2 text-xs font-bold">
        <Link to="/dashboard" className={navLinkClass('/dashboard')}>
          <LayoutDashboard className="w-4 h-4 text-daterra-accent shrink-0" />
          <span>{t('nav.home', 'Início')}</span>
        </Link>

        <Link to="/ferramentas" className={navLinkClass('/ferramentas')}>
          <Calculator className="w-4 h-4 text-daterra-accent shrink-0" />
          <span>{t('nav.tools', 'Ferramentas')}</span>
        </Link>

        {import.meta.env.VITE_ENABLE_ASSISTANT === 'true' && (
          <Link to="/assistente" className={navLinkClass('/assistente')}>
            <Bot className="w-4 h-4 text-daterra-accent shrink-0" />
            <span>{t('nav.assistant', 'Assistente')}</span>
          </Link>
        )}

        <Link to="/academia" className={navLinkClass('/academia')}>
          <GraduationCap className="w-4 h-4 text-daterra-accent shrink-0" />
          <span>{t('nav.academy', 'Academia')}</span>
        </Link>

        <Link to="/definicoes" className={navLinkClass('/definicoes')}>
          <Settings className="w-4 h-4 text-daterra-accent shrink-0" />
          <span>{t('nav.settings', 'Definições')}</span>
        </Link>
      </nav>

      <div
        className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border whitespace-nowrap shrink-0 transition-all ${
          isOnline
            ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
            : 'bg-amber-500/20 text-amber-200 border-amber-400/40 animate-pulse'
        }`}
      >
        {isOnline ? <Wifi className="w-3.5 h-3.5 shrink-0" /> : <WifiOff className="w-3.5 h-3.5 shrink-0" />}
        <span>{isOnline ? t('common.network.onlineShort', 'Online') : t('common.network.offlineShort', 'Offline')}</span>
      </div>

      <HeaderLanguageDropdown />

      <div ref={accountRef} className="relative">
        <button
          type="button"
          onClick={() => setAccountOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={accountOpen}
          aria-label={userFullName}
          title={`${userFullName} · ${planText}`}
          className="min-h-[44px] pl-1.5 pr-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer touch-target"
        >
          <span className="w-8 h-8 rounded-full bg-[#1D734B] border border-[#3CA64C]/70 text-white flex items-center justify-center font-extrabold text-[11px] tracking-tight shrink-0">
            {initials}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border ${
              isPaidPlan
                ? 'bg-[#3CA64C]/25 text-emerald-100 border-[#3CA64C]/60'
                : 'bg-white/10 text-slate-200 border-white/15'
            }`}
          >
            {shortPlan}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-150 shrink-0 ${accountOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {accountOpen && (
          <div
            role="menu"
            aria-label={userFullName}
            className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 z-50 text-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#114037] text-white flex items-center justify-center font-extrabold text-xs tracking-tight shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900 truncate" title={userFullName}>
                  {userFullName}
                </p>
                <p className="text-xs text-slate-500 truncate" title={userEmail || ''}>
                  {userEmail || t('common.activeSession', 'Sessão Ativa')}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-extrabold text-[#114037] truncate">{planText}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#1D734B] text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                {statusText}
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors touch-target cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{t('common.actions.logout', t('common.logout', 'Terminar Sessão'))}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
