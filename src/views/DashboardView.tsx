import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Sun, CloudRain, Wind, MapPin, Activity, 
  GraduationCap, Calculator, Sparkles, ArrowRight, 
  Cpu, Thermometer, ExternalLink, Calendar, Gauge, Trees, FlaskConical, CloudSun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const farmName = user?.farmName || 'Quinta do Vale';
  const userFullName = user?.name || 'Pedro Silva';
  const userFirstName = userFullName.split(' ')[0] || 'Pedro';
  const agromonitoringApiKey = import.meta.env.VITE_AGROMONITORING_KEY || 'NÃO_CONFIGURADA';

  // Previsão Estendida da Semana para o Cartão de Meteorologia (2 Colunas)
  const weeklyForecast = [
    { day: 'Hoje (Seg)', temp: '24°C', min: '14°C', icon: Sun, label: 'Céu Limpo', wind: '12 km/h', humidity: '62%', driftRisk: 'Baixo' },
    { day: 'Terça', temp: '26°C', min: '15°C', icon: Sun, label: 'Ensolarado', wind: '9 km/h', humidity: '55%', driftRisk: 'Muito Baixo' },
    { day: 'Quarta', temp: '22°C', min: '13°C', icon: CloudSun, label: 'Parc. Nublado', wind: '16 km/h', humidity: '68%', driftRisk: 'Moderado' },
    { day: 'Quinta', temp: '19°C', min: '11°C', icon: CloudRain, label: 'Chuva Fraca', wind: '22 km/h', humidity: '82%', driftRisk: 'Alto' },
    { day: 'Sexta', temp: '21°C', min: '12°C', icon: CloudSun, label: 'Pouca Nuvem', wind: '14 km/h', humidity: '65%', driftRisk: 'Baixo' },
  ];

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
      {/* GRELHA PRINCIPAL DE 3 COLUNAS (DECKTOP) / 1 COLUNA (MOBILE)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ----------------------------------------------------------------------- */}
        {/* LINHA 2 — CARTÃO ESQUERDO (1 COLUNA): Boas-vindas                       */}
        {/* ----------------------------------------------------------------------- */}
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
              {t('dashboard.welcomeUser')} {userFirstName}!
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

        {/* ----------------------------------------------------------------------- */}
        {/* LINHA 2 — CARTÃO DIREITO (2 COLUNAS): Meteorologia Estendida             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-daterra-primary text-base">{t('nav.weather')}</h3>
                <span className="text-[10px] text-slate-500 font-semibold block">{t('dashboard.extendedForecast')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-2xl text-xs font-bold font-mono-numbers">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>{t('dashboard.weatherCardTitle')}</span>
            </div>
          </div>


          {/* Destaque do Dia Atual + Condição de Pulverização */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3">
              <Sun className="w-12 h-12 text-amber-500 shrink-0" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono-numbers">24°C</span>
                  <span className="text-xs text-slate-500 font-mono-numbers">/ 14°C</span>
                </div>
                <span className="text-xs font-bold text-slate-700 block">Céu Limpo • Hoje</span>
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono-numbers text-slate-600">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-slate-400" />
                <span>Vento: <strong>12 km/h (NNE)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-slate-400" />
                <span>Humidade: <strong>62%</strong></span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex flex-col justify-center text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
                <Thermometer className="w-4 h-4 text-emerald-600" />
                <span>Janela de Pulverização</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                Risco de Deriva Baixo (Ótimo)
              </span>
            </div>
          </div>

          {/* Grelha da Previsão Estendida dos Restantes Dias */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {weeklyForecast.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                    index === 0 
                      ? 'bg-amber-50/60 border-amber-200 ring-2 ring-amber-400/30' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-extrabold text-slate-800">{item.day}</span>
                  <Icon className="w-6 h-6 my-1.5 text-amber-500" />
                  <div className="text-xs font-black text-slate-900 font-mono-numbers">
                    {item.temp}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* LINHA 3 — CARTÃO LARGURA TOTAL (3 COLUNAS): Mapas NDVI                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-soft border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-daterra-primary text-lg">Mapas NDVI & Sensoriamento Remoto</h3>
                <span className="text-xs text-slate-500 font-semibold block">
                  Monitorização Satélite da Vigorosidade e Saúde da Copa Foliar
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold font-mono-numbers">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>NDVI 0.78 (Saúde Ótima da Copa)</span>
              </div>

              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl">
                Satélite Sentinel-2 • 10m
              </span>
            </div>
          </div>

          {/* Visualização de Destaque do Mapa NDVI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Mapa Vetorial da Parcela (2 Colunas no Grid Interno) */}
            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider z-10">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-daterra-accent" />
                  Parcela da Vinha Velha (4.5 ha)
                </span>
                <span className="text-daterra-accent">Agromonitoring GIS Engine</span>
              </div>

              {/* Desenho do Polígono e Mapa da Parcela */}
              <div className="my-4 flex items-center justify-center relative">
                <svg className="w-full h-36 stroke-daterra-accent fill-daterra-accent/25 drop-shadow-lg" viewBox="0 0 400 150">
                  {/* Linhas de Grelha Topográfica */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="133" y1="0" x2="133" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="266" y1="0" x2="266" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

                  {/* Polígono da Parcela Agrícola */}
                  <polygon points="40,30 360,20 320,130 80,140" strokeWidth="3" />
                  
                  {/* Pontos de Amostragem NDVI */}
                  <circle cx="150" cy="75" r="5" fill="#3CA64C" className="animate-pulse" />
                  <circle cx="250" cy="65" r="5" fill="#3CA64C" />
                  <circle cx="110" cy="100" r="4" fill="#EAB308" />

                  <text x="165" y="80" fill="#FFFFFF" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Zone 1: 0.78 NDVI</text>
                  <text x="265" y="70" fill="#FFFFFF" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Zone 2: 0.81 NDVI</text>
                </svg>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-800 pt-3 z-10">
                <span>Coordenadas Geográficas: 40.5702° N, -7.5341° W</span>
                <span className="text-emerald-400 font-mono-numbers font-bold">
                  Status Agromonitoring: {agromonitoringApiKey === 'NÃO_CONFIGURADA' ? 'Modo Simulação (Ativo)' : 'Conetado'}
                </span>
              </div>
            </div>

            {/* Painel de Indicadores de Saúde da Cultura (1 Coluna no Grid Interno) */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm mb-3">Métricas de Vigor Foliar</h4>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Vigor Vegetativo (NDVI)</span>
                      <span className="text-emerald-600 font-mono-numbers">0.78 / 1.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Índice de Humidade (NDWI)</span>
                      <span className="text-sky-600 font-mono-numbers">0.65 / 1.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Clorofila Foliar (EVI)</span>
                      <span className="text-indigo-600 font-mono-numbers">0.72 / 1.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold space-y-1">
                <span className="font-bold text-emerald-950 block">Recomendação Agronómica:</span>
                <span>Massa foliar em ótimo desenvolvimento. Calda recomendada com base no padrão EPPO PP 1/239.</span>
              </div>
            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* LINHA 4 — CARTÃO ESQUERDO (1 COLUNA): Academia DATERRA                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-daterra-primary text-base">Academia DATERRA</h3>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                  Plataforma Moodle
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-xl font-mono-numbers">
              75%
            </span>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800">
              Curso Ativo: <span className="text-daterra-primary">Boas Práticas na Aplicação de Fitofármacos</span>
            </div>
            
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-daterra-accent h-full rounded-full transition-all duration-500" style={{ width: '75%' }} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-indigo-800 bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 font-semibold">
              <span>Academia DATERRA (Moodle): Ligado</span>
            </div>
          </div>

          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 touch-target"
          >
            <span>Visitar Academia</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* LINHA 4 — CARTÃO DIREITO (2 COLUNAS): Ferramentas Favoritas (4 Itens)     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-daterra-primary text-base">Ferramentas Favoritas</h3>
                <span className="text-[10px] text-slate-500 font-semibold block">Acesso Rápido a Módulos Agronómicos</span>
              </div>
            </div>

            <Link
              to="/ferramentas"
              className="text-xs font-extrabold text-daterra-secondary hover:text-daterra-primary flex items-center gap-1"
            >
              <span>Ver Todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grelha Interna de 4 Ferramentas Favoritas com Nomes 100% Uniformes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Ferramenta 1 */}
            <Link
              to="/ferramentas?tool=calc_concentracao"
              className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                    Calculadora de Concentração da Calda
                  </span>
                  <span className="text-[10px] text-slate-500">Pulverização • Planta Jovem & Copa Adulta</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
            </Link>

            {/* Ferramenta 2 */}
            <Link
              to="/ferramentas?tool=calc_dose"
              className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                    Calculadora de Dose por Hectare
                  </span>
                  <span className="text-[10px] text-slate-500">Pulverização • Dose do Rótulo por Tanque</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
            </Link>

            {/* Ferramenta 3 */}
            <Link
              to="/ferramentas?tool=calibracao_bicos"
              className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                    Calibração e Débito de Bicos
                  </span>
                  <span className="text-[10px] text-slate-500">Calibração • Norma ISO 16122</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
            </Link>

            {/* Ferramenta 4 */}
            <Link
              to="/ferramentas?tool=geometria_trv_copa"
              className="p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between group touch-target"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-daterra-primary block group-hover:text-daterra-secondary leading-snug">
                    Volume de Copa TRV (Tree Row Volume)
                  </span>
                  <span className="text-[10px] text-slate-500">Calibração • Dosagem Proporcional</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-daterra-accent group-hover:translate-x-1 transition-all shrink-0 ml-1" />
            </Link>

          </div>

          <Link
            to="/ferramentas"
            className="w-full py-3 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md touch-target"
          >
            <span>Ver Catálogo Completo de Ferramentas</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
