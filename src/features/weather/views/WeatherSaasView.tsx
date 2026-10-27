// src/features/weather/views/WeatherSaasView.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Compass } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { WeatherContextBar, type WeatherEquipmentContext } from '../components/WeatherContextBar';
import { SprayDeltaTCard } from '../components/SprayDeltaTCard';
import { FertigationVpdCard } from '../components/FertigationVpdCard';
import { HourlySprayPlanner } from '../components/HourlySprayPlanner';
import { WeatherLocationSearchDropdown } from '../components/WeatherLocationSearchDropdown';

export const WeatherSaasView: React.FC = () => {
  const {
    data,
    isLoading,
    currentLocation,
    selectLocation,
    useGpsLocation,
    refreshWeather
  } = useWeather();

  const [equipmentContext, setEquipmentContext] = useState<WeatherEquipmentContext>({
    nozzleType: 'air_induction',
    hasAirSleeve: true,
    workingPressureBar: 2.5
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Topo da SaaS: Cabeçalho com Navegação */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-daterra-primary text-white uppercase tracking-wider">
              Módulo Agronómico Avançado
            </span>
            <WeatherLocationSearchDropdown
              currentLocation={currentLocation}
              onSelectLocation={selectLocation}
              onUseGps={useGpsLocation}
            />
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-daterra-accent" />
              {data?.current?.updatedAt ? `Atualizado às ${data.current.updatedAt}` : 'Em direto'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-daterra-primary mt-2">
            Estação Bioclimática & Janelas de Decisão
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cruzamento de meteorologia Open-Meteo com parâmetros agronómicos e perfis de pulverização
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshWeather}
            disabled={isLoading}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl transition-colors touch-target flex items-center gap-2 text-xs font-bold"
            title="Atualizar dados meteorológicos"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <Link
            to="/dashboard"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-colors flex items-center gap-2 touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>
      </div>

      {/* Barra de Cruzamento com Perfis da Máquina */}
      <WeatherContextBar
        context={equipmentContext}
        onContextChange={setEquipmentContext}
      />

      {/* Grelha dos 2 Pilares (Delta T para Pulverização + DPV para Fertirrigação) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SprayDeltaTCard
          current={data?.current}
          context={equipmentContext}
        />

        <FertigationVpdCard
          current={data?.current}
          bioclimatic={data?.bioclimatic}
        />
      </div>

      {/* Pilar 3: Planeador Horário de Pulverização (24h) */}
      {data?.hourly && data.hourly.length > 0 && (
        <HourlySprayPlanner hourly={data.hourly} />
      )}
    </div>
  );
};
