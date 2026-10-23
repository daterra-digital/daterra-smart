// src/features/weather/components/DashboardWeatherCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  CloudLightning,
  Wind,
  Thermometer,
  ArrowRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { WeatherLocationSearchDropdown } from './WeatherLocationSearchDropdown';

export const DashboardWeatherCard: React.FC = () => {
  const {
    data,
    isLoading,
    currentLocation,
    selectLocation,
    useGpsLocation
  } = useWeather();

  const getWeatherIcon = (code: number, className = 'w-6 h-6') => {
    if (code === 0 || code === 1) return <Sun className={`${className} text-amber-500`} />;
    if (code === 2) return <CloudSun className={`${className} text-amber-500`} />;
    if (code === 3 || code === 45 || code === 48) return <Cloud className={`${className} text-slate-400`} />;
    if (code >= 51 && code <= 82) return <CloudRain className={`${className} text-sky-500`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-indigo-500`} />;
    return <Sun className={`${className} text-amber-500`} />;
  };

  const cur = data?.current;
  const daily = data?.daily || [];
  const spray = cur?.sprayEvaluation;

  const isOptimal = spray?.level === 'optimal';
  const isMarginal = spray?.level === 'marginal';

  return (
    <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4">
      {/* Topo do Cartão: Título Interativo Clicável + Seletor de Localização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Título Clicável que navega para /meteorologia */}
        <Link
          to="/meteorologia"
          className="group flex items-center gap-3 transition-all cursor-pointer select-none"
          title="Abrir Análise Bioclimática & Janelas de Decisão (SaaS)"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center font-bold transition-colors shrink-0">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-daterra-primary text-base group-hover:text-daterra-accent transition-colors">
              <span>Meteorologia</span>
              <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-daterra-accent" />
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Previsão & Decisão de Pulverização • Toque para abrir
            </span>
          </div>
        </Link>

        {/* Seletor Interativo Pesquisável de Localidade (geoapi.pt: 308 Municípios + Freguesias) */}
        <WeatherLocationSearchDropdown
          currentLocation={currentLocation}
          onSelectLocation={selectLocation}
          onUseGps={useGpsLocation}
        />
      </div>

      {/* Destaque do Dia Atual + Semáforo Inteligente de Pulverização */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Temperatura e Condição */}
        <div className="flex items-center gap-3">
          {getWeatherIcon(cur?.weatherCode ?? 0, 'w-12 h-12 shrink-0')}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono-numbers">
                {isLoading ? '--' : `${cur?.temperatureC ?? 24}°C`}
              </span>
              <span className="text-xs text-slate-500 font-mono-numbers">
                / {daily[0]?.minTempC ?? 14}°C
              </span>
            </div>
            <span className="text-xs font-bold text-slate-700 block">
              {cur?.weatherLabel ?? 'Céu Limpo'} • Hoje
            </span>
          </div>
        </div>

        {/* Vento e Humidade */}
        <div className="space-y-1 text-xs font-mono-numbers text-slate-600">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-slate-400" />
            <span>
              Vento: <strong>{cur?.windSpeedKmh ?? 12} km/h ({cur?.windDirectionText ?? 'NNE'})</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-slate-400" />
            <span>
              Humidade: <strong>{cur?.humidityPercent ?? 62}%</strong>
            </span>
          </div>
        </div>

        {/* Semáforo de Janela de Pulverização */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-center text-center transition-colors ${
            isOptimal
              ? 'bg-emerald-50 border-emerald-200'
              : isMarginal
              ? 'bg-amber-50 border-amber-200'
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div
            className={`flex items-center justify-center gap-1.5 font-bold text-xs ${
              isOptimal ? 'text-emerald-800' : isMarginal ? 'text-amber-800' : 'text-rose-800'
            }`}
          >
            {isOptimal ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : isMarginal ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <Thermometer className="w-4 h-4 text-rose-600" />
            )}
            <span>Janela de Pulverização</span>
          </div>
          <span
            className={`text-[11px] font-semibold mt-0.5 ${
              isOptimal ? 'text-emerald-700' : isMarginal ? 'text-amber-700' : 'text-rose-700'
            }`}
          >
            {spray?.badgeLabel || 'Risco de Deriva Baixo (Ótimo)'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono-numbers mt-0.5">
            ΔT = {cur?.deltaT ?? 4.2}°C
          </span>
        </div>
      </div>

      {/* Mini-Previsão dos 5 Dias */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {daily.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
              index === 0
                ? 'bg-amber-50/60 border-amber-200 ring-2 ring-amber-400/30'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-extrabold text-slate-800">{item.dayLabel}</span>
            <div className="my-1.5">{getWeatherIcon(item.weatherCode)}</div>
            <div className="text-xs font-black text-slate-900 font-mono-numbers">
              {item.maxTempC}°C
            </div>
            <span className="text-[10px] text-slate-500 font-medium block truncate max-w-full">
              {item.weatherLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
