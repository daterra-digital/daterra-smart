// src/features/weather/components/FertigationVpdCard.tsx
import React from 'react';
import { Sprout } from 'lucide-react';
import type { BioclimaticMetrics, CurrentWeather } from '../types';

interface FertigationVpdCardProps {
  current?: CurrentWeather;
  bioclimatic?: BioclimaticMetrics;
}

export const FertigationVpdCard: React.FC<FertigationVpdCardProps> = ({ current, bioclimatic }) => {
  const vpd = current?.vpdKpa ?? 0.95;
  const et0 = bioclimatic?.et0MmDay ?? 4.2;
  const rainNextHours = bioclimatic?.rainNextHoursMm ?? 0.0;

  // Classificação do DPV
  const isOptimal = vpd >= 0.7 && vpd <= 1.2;
  const isLow = vpd < 0.7;

  const markerPercent = Math.min(100, Math.max(0, (vpd / 2.0) * 100));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Fertirrigação & DPV (VPD)</h3>
              <p className="text-xs text-slate-500">Transpiração da cultura e abertura de estomas</p>
            </div>
          </div>
          <span
            className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wide ${
              isOptimal
                ? 'bg-sky-100 text-sky-800'
                : isLow
                ? 'bg-slate-100 text-slate-700'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isOptimal ? 'Absorção Ativa' : isLow ? 'Baixa Transpiração' : 'Stress Hídrico'}
          </span>
        </div>

        {/* Mostrador Grande de DPV */}
        <div className="my-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Défice de Pressão de Vapor (DPV)
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono-numbers tracking-tight">
            {vpd} kPa
          </div>

          {/* Régua de Cores Estilo Metos Iberia */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="h-3.5 w-full rounded-full bg-gradient-to-r from-blue-300 via-sky-500 via-emerald-500 to-rose-500 relative overflow-hidden shadow-inner">
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-slate-900 border-2 border-white rounded-full shadow-md transition-all duration-300"
                style={{ left: `calc(${markerPercent}% - 5px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5">
              <span>&lt;0.6 kPa Sem Transpiração</span>
              <span className="text-emerald-700">0.8-1.2 kPa Ótimo</span>
              <span className="text-rose-700">&gt;1.4 kPa Stress</span>
            </div>
          </div>
        </div>

        {/* Métricas Complementares de Fertirrigação */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Evapotranspiração</span>
            <strong className="font-bold text-slate-800 font-mono-numbers">{et0} mm/dia</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Janela sem Chuva</span>
            <strong className="font-bold text-slate-800 font-mono-numbers">{rainNextHours === 0 ? '> 18h' : `${rainNextHours} mm`}</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Condutividade Sug.</span>
            <strong className="font-bold text-slate-800 font-mono-numbers">1.4 - 1.8 mS/cm</strong>
          </div>
        </div>
      </div>

      {/* Caixa de Parecer de Fertirrigação */}
      <div
        className={`p-4 rounded-2xl text-xs space-y-1.5 border transition-all ${
          isOptimal
            ? 'bg-sky-50 border-sky-200 text-sky-950'
            : isLow
            ? 'bg-slate-50 border-slate-200 text-slate-800'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="font-extrabold flex items-center gap-2">
          <span>{isOptimal ? '💧' : isLow ? '☁️' : '☀️'}</span>
          <span>
            {isOptimal
              ? 'Momento Ideal para Injeção de Adubo na Rega'
              : isLow
              ? 'Transpiração Fraca — Adiar Fertirrigação'
              : 'Stress Térmico — Fecho Parcial dos Estomas'}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">
          {isOptimal
            ? 'Com DPV de ' + vpd + ' kPa, a cultura está em plena atividade de transpiração, assegurando a absorção rápida da solução nutritiva pelas raízes sem perigo de acumulação salina.'
            : isLow
            ? 'A atmosfera saturada inibe o fluxo xilémico. A planta não consome a solução com rapidez; recomenda-se aguardar por maior radiação solar.'
            : 'O défice de pressão elevado força os estomas a fecharem para reter humidade. Privilegiar rega para hidratação antes de fertilizar.'}
        </p>
      </div>
    </div>
  );
};
