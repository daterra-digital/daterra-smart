import React, { useMemo } from 'react';
import { GraduationCap, Sparkles, Cpu, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveNormalizedUserPlan } from '../utils/userPlanNormalizer';
import { useWeather } from '../features/weather/hooks/useWeather';
import { DashboardWeatherCard } from '../features/weather/components/DashboardWeatherCard';
import { DashboardWeatherWeeklyCard } from '../features/weather/components/DashboardWeatherWeeklyCard';
import { DashboardFavoritesCard } from '../features/dashboard/components/DashboardFavoritesCard';

export const DashboardView: React.FC = () => {
  const { user, profile } = useAuth();
  const { effectiveTier, isSimulating } = useSubscription();
  const { t } = useLanguage();
  const { currentLocation, data } = useWeather();

  // Estado local da seleção de dia (apenas no Dashboard)
  const [selectedDateIso, setSelectedDateIso] = React.useState<string | null>(null);

  // Ao mudar de localidade, regressar a Hoje para evitar contexto residual
  React.useEffect(() => {
    setSelectedDateIso(null);
  }, [currentLocation?.id, currentLocation?.latitude, currentLocation?.longitude]);

  // Se a previsão for atualizada e a data selecionada deixar de existir, regressar a Hoje
  React.useEffect(() => {
    if (selectedDateIso && data?.daily && !data.daily.some((d) => d.dateIso === selectedDateIso)) {
      setSelectedDateIso(null);
    }
  }, [data?.daily, selectedDateIso]);

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
  const userInitials = (userFullName || 'U').trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  const userEmail = user?.email || '';

  const resolvedPlan = useMemo(() => {
    const base = (profile as Record<string, unknown> | null) ?? {};
    return resolveNormalizedUserPlan(isSimulating ? { ...base, plan: effectiveTier } : base);
  }, [profile, isSimulating, effectiveTier]);

  const planLabel = resolvedPlan.normalizedPlan === 'free' ? t('dashboard.freePlan', resolvedPlan.planLabel) : resolvedPlan.planLabel;
  const statusLabel = resolvedPlan.status === 'active' ? t('dashboard.active', resolvedPlan.statusLabel) : resolvedPlan.statusLabel;

  return (
    <div className="space-y-2.5 lg:space-y-3 animate-fade-in">
      {/* ========================================================================= */}
      {/* LINHA 1: CABEÇALHO DEDICADO — Painel Geral da Exploração                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-slate-200">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-daterra-accent block mb-0.5">
          {t('dashboard.title')}
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-daterra-primary leading-tight">
          {t('dashboard.farm')} {farmName}
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* GRELHA PRINCIPAL DO DASHBOARD (3 COLUNAS DESKTOP)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 lg:gap-3">
        {/* LINHA 1 — COLUNA 1 (1/3): Boas-vindas */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#114037] to-[#1D734B] text-white p-4 sm:p-5 rounded-3xl shadow-soft flex flex-col justify-between relative overflow-hidden h-full">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Cpu className="w-36 h-36 -mr-8 -mb-8 text-white" />
          </div>

          <div className="space-y-2.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" />
              <span>{t('dashboard.farm')}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
              {t('dashboard.welcomeUser', { name: userFirstName })}
            </h2>

            <p className="text-xs text-slate-200/90 leading-relaxed">
              {t('dashboard.subscriptionNotice')}
            </p>

            {/* Identidade minimalista consolidada da conta */}
            <div className="flex items-center gap-3 bg-white/8 border border-white/15 rounded-2xl p-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1D734B] border border-[#3CA64C]/70 text-white flex items-center justify-center font-extrabold text-xs tracking-tight shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-xs font-extrabold text-white truncate" title={userFullName}>
                  {userFullName}
                </p>
                {userEmail && (
                  <p className="text-[11px] text-emerald-100/90 truncate mt-0.5" title={userEmail}>
                    {userEmail}
                  </p>
                )}
                <p className="text-[11px] text-slate-200/80 truncate mt-0.5" title={farmName}>
                  {farmName}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-2.5 border-t border-white/15 flex items-center justify-between gap-2 text-xs relative z-10">
            <span className="text-white font-extrabold truncate">{planLabel}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#3CA64C] text-white font-extrabold text-[10px] tracking-wider uppercase shadow-2xs shrink-0">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* LINHA 1 — COLUNAS 2-3 (2/3): Meteorologia do Dia */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <DashboardWeatherCard
            selectedDateIso={selectedDateIso}
            onSelectDate={setSelectedDateIso}
          />
        </div>

        {/* LINHA 2 — LARGURA TOTAL (3/3): Previsão dos Próximos 7 Dias */}
        <div className="lg:col-span-3">
          <DashboardWeatherWeeklyCard
            selectedDateIso={selectedDateIso}
            onSelectDate={setSelectedDateIso}
          />
        </div>

        {/* LINHA 3 — COLUNA 1 (1/3): Academia DATERRA */}
        <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4">
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
