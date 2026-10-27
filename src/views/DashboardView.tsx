import React from 'react';
import { 
  User, GraduationCap, Sparkles, 
  Cpu, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isLocalhost } from '../utils/environment';
import { DashboardWeatherCard } from '../features/weather/components/DashboardWeatherCard';
import { DashboardNdviCard } from '../features/dashboard/components/DashboardNdviCard';
import { DashboardFavoritesCard } from '../features/dashboard/components/DashboardFavoritesCard';

export const DashboardView: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const userFullName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() ||
      user?.user_metadata?.full_name ||
      t('common.user', 'Utilizador')
    : user?.user_metadata?.full_name || t('common.user', 'Utilizador');

  const farmName =
    profile?.company_name ??
    user?.user_metadata?.farm_name ??
    t('dashboard.defaultFarmName', 'Exploração Agrícola');

  const userFirstName = userFullName.split(' ')[0] || t('common.user', 'Utilizador');
  const agromonitoringApiKey = import.meta.env.VITE_AGROMONITORING_KEY || 'NÃO_CONFIGURADA';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* LINHA 1: CABEÇALHO DEDICADO — Painel Geral da Exploração                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-slate-200">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-daterra-accent block mb-1">
            {t('dashboard.title')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-daterra-primary">
            {t('dashboard.farm')} {farmName}
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs font-medium">
          <div className="w-9 h-9 rounded-xl bg-daterra-primary text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{userFullName}</span>
            <span className="text-daterra-secondary font-extrabold text-[11px] block">{t('dashboard.freePlan')}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRELHA PRINCIPAL DE 3 COLUNAS (DESKTOP) / 1 COLUNA (MOBILE)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LINHA 2 — CARTÃO ESQUERDO: Boas-vindas */}
        <div className="lg:col-span-1 bg-gradient-to-br from-daterra-primary to-daterra-secondary text-white p-6 rounded-3xl shadow-soft flex flex-col justify-between relative overflow-hidden min-h-[340px]">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Cpu className="w-48 h-48 -mr-10 -mb-10 text-white" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-daterra-accent font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('dashboard.farm')}</span>
            </div>

            <h2 className="text-2xl font-extrabold leading-tight">
              {t('dashboard.welcomeUser', { name: userFirstName })}
            </h2>

            <p className="text-xs text-slate-200 leading-relaxed">
              {t('dashboard.subscriptionNotice')}
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-white/15 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-300 font-medium">{t('dashboard.farm')}: {farmName}</span>
            <span className="px-3 py-1 rounded-lg bg-daterra-accent text-white font-extrabold text-[11px] tracking-wider uppercase shadow-sm">
              {t('dashboard.active')}
            </span>
          </div>
        </div>

        {/* LINHA 2 — CARTÃO DIREITO: Meteorologia Estendida */}
        <div className="lg:col-span-2">
          <DashboardWeatherCard />
        </div>

        {/* LINHA 3 — CARTÃO LARGURA TOTAL: Mapas NDVI (Localhost Only) */}
        {isLocalhost() && <DashboardNdviCard agromonitoringApiKey={agromonitoringApiKey} />}

        {/* LINHA 4 — CARTÃO ESQUERDO: Academia DATERRA */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-daterra-primary text-base">
                  {t('dashboard.academy.title', 'Academia DATERRA')}
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                  {t('dashboard.academy.platform', 'Plataforma Moodle')}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-xl font-mono-numbers">
              75%
            </span>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800">
              {t('dashboard.academy.activeCourse', 'Curso Ativo:')}{' '}
              <span className="text-daterra-primary">
                {t('dashboard.academy.courseName', 'Boas Práticas na Aplicação de Fitofármacos')}
              </span>
            </div>
            
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-daterra-accent h-full rounded-full transition-all duration-500" style={{ width: '75%' }} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-indigo-800 bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 font-semibold">
              <span>{t('dashboard.academy.moodleStatus', 'Academia DATERRA (Moodle): Ligado')}</span>
            </div>
          </div>

          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 touch-target"
          >
            <span>{t('dashboard.academy.visitButton', 'Visitar Academia')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* LINHA 4 — CARTÃO DIREITO: Ferramentas Favoritas */}
        <DashboardFavoritesCard />
      </div>
    </div>
  );
};
