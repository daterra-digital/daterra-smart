// src/features/weather/components/WeatherTechnicalDetailsCollapsible.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Info } from 'lucide-react';

export const WeatherTechnicalDetailsCollapsible: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-soft">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Detalhe Técnico, Fórmulas & Limiares Agronómicos
            </h4>
            <p className="text-[11px] text-slate-500">
              Metodologia de psicrometria, equação de Stull, Magnus-Tetens e fontes de dados
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700 space-y-3.5 leading-relaxed">
          <div>
            <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-daterra-accent" />
              <span>Delta T (&Delta;T) — Sobrevivência de Gotas de Calda</span>
            </div>
            <p className="text-[11px] text-slate-600">
              O Delta T (&Delta;T = Temperatura de Bolbo Seco &minus; Temperatura de Bolbo Húmido) é o indicador agronómico padrão para a taxa de evaporação de gotas em suspensão. A temperatura de bolbo húmido é calculada pela equação empírica de Stull (2011).
            </p>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold text-center">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                0 a 2 °C: Escorrimento
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                2 a 8 °C: Janela Ótima
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                8 a 10 °C: Atenção / Evaporação
              </div>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-200">
                &gt; 10 °C: Perigo / Inviável
              </div>
            </div>
          </div>

          <div>
            <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-daterra-accent" />
              <span>Ponto de Orvalho & DPV (VPD)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              O Ponto de Orvalho é estimado pela formulação de Magnus-Tetens, determinando a condensação foliar. O Défice de Pressão de Vapor (DPV / VPD em kPa) quantifica a capacidade de evaporação da atmosfera e a taxa de transpiração vegetal recomendada para fertirrigação.
            </p>
          </div>

          <div>
            <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-daterra-accent" />
              <span>Fonte de Dados & Cache First-Offline</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Os dados meteorológicos são obtidos a partir da API pública Open-Meteo v1 (sem chaves de acesso privadas) e indexados geograficamente. Em conformidade com o paradigma First-Offline, as leituras são guardadas na cache local por 20 minutos para permitir a consulta em campo mesmo em caso de corte temporário de conectividade.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
