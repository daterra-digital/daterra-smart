import React from 'react';
import { MapPin, Activity } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface DashboardNdviCardProps {
  agromonitoringApiKey: string;
}

export const DashboardNdviCard: React.FC<DashboardNdviCardProps> = ({ agromonitoringApiKey }) => {
  const { t } = useLanguage();

  return (
    <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-soft border border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-daterra-primary text-lg">
              {t('dashboard.ndvi.title', 'Mapas NDVI & Sensoriamento Remoto')}
            </h3>
            <span className="text-xs text-slate-500 font-semibold block">
              {t('dashboard.ndvi.subtitle', 'Monitorização Satélite da Vigorosidade e Saúde da Copa Foliar')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold font-mono-numbers">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>{t('dashboard.ndvi.badgeValue', 'NDVI 0.78 (Saúde Ótima da Copa)')}</span>
          </div>

          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl">
            {t('dashboard.ndvi.satelliteTag', 'Satélite Sentinel-2 • 10m')}
          </span>
        </div>
      </div>

      {/* Visualização de Destaque do Mapa NDVI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Vetorial da Parcela */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider z-10">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-daterra-accent" />
              {t('dashboard.ndvi.parcelName', 'Parcela da Vinha Velha (4.5 ha)')}
            </span>
            <span className="text-daterra-accent">Agromonitoring GIS Engine</span>
          </div>

          {/* Desenho do Polígono e Mapa da Parcela */}
          <div className="my-4 flex items-center justify-center relative">
            <svg className="w-full h-36 stroke-daterra-accent fill-daterra-accent/25 drop-shadow-lg" viewBox="0 0 400 150">
              <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="133" y1="0" x2="133" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="266" y1="0" x2="266" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

              <polygon points="40,30 360,20 320,130 80,140" strokeWidth="3" />
              <circle cx="150" cy="75" r="5" fill="#3CA64C" className="animate-pulse" />
              <circle cx="250" cy="65" r="5" fill="#3CA64C" />
              <circle cx="110" cy="100" r="4" fill="#EAB308" />

              <text x="165" y="80" fill="#FFFFFF" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Zone 1: 0.78 NDVI</text>
              <text x="265" y="70" fill="#FFFFFF" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Zone 2: 0.81 NDVI</text>
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-800 pt-3 z-10">
            <span>{t('dashboard.ndvi.coordinates', 'Coordenadas Geográficas: 40.5702° N, -7.5341° W')}</span>
            <span className="text-emerald-400 font-mono-numbers font-bold">
              Status Agromonitoring: {agromonitoringApiKey === 'NÃO_CONFIGURADA' ? t('dashboard.ndvi.simulationMode', 'Modo Simulação (Ativo)') : t('dashboard.ndvi.connected', 'Conetado')}
            </span>
          </div>
        </div>

        {/* Painel de Indicadores de Saúde da Cultura */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm mb-3">
              {t('dashboard.ndvi.metricsTitle', 'Métricas de Vigor Foliar')}
            </h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{t('dashboard.ndvi.vegetativeVigor', 'Vigor Vegetativo (NDVI)')}</span>
                  <span className="text-emerald-600 font-mono-numbers">0.78 / 1.0</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{t('dashboard.ndvi.moistureIndex', 'Índice de Humidade (NDWI)')}</span>
                  <span className="text-sky-600 font-mono-numbers">0.65 / 1.0</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{t('dashboard.ndvi.leafChlorophyll', 'Clorofila Foliar (EVI)')}</span>
                  <span className="text-indigo-600 font-mono-numbers">0.72 / 1.0</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold space-y-1">
            <span className="font-bold text-emerald-950 block">
              {t('dashboard.ndvi.recommendationTitle', 'Recomendação Agronómica:')}
            </span>
            <span>
              {t('dashboard.ndvi.recommendationText', 'Massa foliar em ótimo desenvolvimento. Calda recomendada com base no padrão EPPO PP 1/239.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
