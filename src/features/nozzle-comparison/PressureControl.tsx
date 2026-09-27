import React from 'react';
import { Gauge, Plus, Minus, CheckCircle2, Droplets, AlertTriangle } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import {
  formatPt,
  getDropletSpectrumMeasurements,
  getNozzleColorPresentation
} from './nozzleComparison.calculations';
import { parsePortugueseDecimal } from './nozzleComparison.validation';

export interface PressureControlProps {
  workingPressureBar: number;
  onChangePressure: (pressure: number) => void;
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  customMinPressure?: number;
  customMaxPressure?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  showCardWrapper?: boolean;
  calculatedFlow?: CalculatedNozzleFlow;
  referenceNozzle?: Nozzle;
}

const FIXED_MIN_PRESSURE = 1.0;
const FIXED_MAX_PRESSURE = 30.0;
const FIXED_SHORTCUTS = [2, 4, 5, 10, 12, 15];

export const PressureControl: React.FC<PressureControlProps> = ({
  workingPressureBar,
  onChangePressure,
  title = 'Pressão de Trabalho',
  className = '',
  showCardWrapper = true,
  calculatedFlow,
  referenceNozzle
}) => {
  const [inputStr, setInputStr] = React.useState<string>(formatPt(workingPressureBar, 1));

  React.useEffect(() => {
    setInputStr(formatPt(workingPressureBar, 1));
  }, [workingPressureBar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputStr(raw);
    const parsed = parsePortugueseDecimal(raw);
    if (!isNaN(parsed) && parsed > 0) {
      onChangePressure(Number(parsed.toFixed(1)));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChangePressure(Number(val.toFixed(1)));
  };

  const handleStep = (step: number) => {
    const nextVal = Math.min(
      FIXED_MAX_PRESSURE,
      Math.max(FIXED_MIN_PRESSURE, Number((workingPressureBar + step).toFixed(1)))
    );
    onChangePressure(nextVal);
  };

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((workingPressureBar - FIXED_MIN_PRESSURE) / (FIXED_MAX_PRESSURE - FIXED_MIN_PRESSURE)) * 100
    )
  );

  const content = (
    <div className={`space-y-3 ${className}`}>
      {/* 1. Cabeçalho Essencial Equilibrado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-daterra-primary text-white flex items-center justify-center font-bold shrink-0">
            <Gauge className="w-4 h-4 text-daterra-accent" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            {title}
          </h2>
        </div>

        {/* Indicador de Pressão Selecionada */}
        <div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Pressão selecionada</span>
          </span>
        </div>
      </div>

      {/* 2. Controlo Central Numérico e Slider Equilibrado */}
      <div className="max-w-xs mx-auto w-full space-y-2 pt-0.5">
        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-300 shadow-inner">
          <button
            type="button"
            onClick={() => handleStep(-0.1)}
            aria-label="Diminuir pressão em 0,1 bar"
            className="w-9 h-9 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-lg font-black text-base flex items-center justify-center border border-slate-300 transition-all shadow-xs active:scale-95 touch-target cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex items-baseline gap-1 px-2 text-center">
            <input
              type="text"
              value={inputStr}
              onChange={handleInputChange}
              aria-label="Pressão de trabalho em bar"
              className="w-24 text-center text-2xl sm:text-3xl font-black font-mono-numbers text-daterra-primary bg-transparent outline-none border-b-2 border-dashed border-daterra-accent/50 focus:border-daterra-primary px-1"
            />
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">bar</span>
          </div>

          <button
            type="button"
            onClick={() => handleStep(0.1)}
            aria-label="Aumentar pressão em 0,1 bar"
            className="w-9 h-9 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-lg font-black text-base flex items-center justify-center border border-slate-300 transition-all shadow-xs active:scale-95 touch-target cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Slider Fixo de 1,0 a 30,0 bar */}
        <div className="space-y-1 px-1">
          <div className="relative flex items-center justify-center py-1">
            <input
              type="range"
              min={FIXED_MIN_PRESSURE}
              max={FIXED_MAX_PRESSURE}
              step={0.1}
              value={workingPressureBar}
              onChange={handleSliderChange}
              aria-label="Slider de ajuste de pressão de 1 a 30 bar"
              style={{
                background: `linear-gradient(to right, #1b5e20 0%, #1b5e20 ${progressPercent}%, #e2e8f0 ${progressPercent}%, #e2e8f0 100%)`
              }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-daterra-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-daterra-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
            />
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono-numbers px-0.5">
            <span>{formatPt(FIXED_MIN_PRESSURE, 1)} bar</span>
            <span>{formatPt(FIXED_MAX_PRESSURE, 1)} bar</span>
          </div>
        </div>
      </div>

      {/* 3. Atalhos Rápidos Fixos: 2 bar, 4 bar, 5 bar, 10 bar, 12 bar, 15 bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-bold text-slate-600 mr-1 text-[11px]">Atalhos:</span>
        {FIXED_SHORTCUTS.map(p => {
          const isSelected = Math.abs(workingPressureBar - p) < 0.05;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChangePressure(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono-numbers transition-all cursor-pointer ${
                isSelected
                  ? 'bg-daterra-primary text-white shadow-xs ring-1 ring-daterra-accent'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {p} bar
            </button>
          );
        })}
      </div>
    </div>
  );

  const currentDropletValues = React.useMemo(() => {
    if (!referenceNozzle) return null;
    const measurements = getDropletSpectrumMeasurements(referenceNozzle);
    if (!measurements || measurements.length === 0) return null;
    const match = measurements.find(m => Math.abs(m.pressureBar - workingPressureBar) < 0.05);
    if (!match || !match.dv10Micrometres || !match.dv50Micrometres || !match.dv90Micrometres) {
      return null;
    }
    return match;
  }, [referenceNozzle, workingPressureBar]);

  const colorPres = referenceNozzle ? getNozzleColorPresentation(referenceNozzle) : null;
  const nozzleDisplayName = referenceNozzle
    ? `${referenceNozzle.brand} ${referenceNozzle.model}${referenceNozzle.disc ? ` ${referenceNozzle.swirlPlate || ''} ${referenceNozzle.disc}` : ''}`
    : '';
  const nozzleColorLabel = referenceNozzle
    ? referenceNozzle.disc
      ? `Difusor ${referenceNozzle.swirlPlate || '-'} • Disco ${referenceNozzle.disc}`
      : `${referenceNozzle.color || 'Padrão'}${referenceNozzle.isoCode ? ` (ISO ${referenceNozzle.isoCode})` : ''}`
    : '';

  if (calculatedFlow && referenceNozzle) {
    const splitContent = (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch ${className}`}>
        {/* Lado Esquerdo: Pressão de Trabalho */}
        <div className="flex flex-col justify-between space-y-3">
          {/* 1. Cabeçalho Essencial Equilibrado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-daterra-primary text-white flex items-center justify-center font-bold shrink-0">
                <Gauge className="w-4 h-4 text-daterra-accent" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {title}
              </h2>
            </div>

            {/* Indicador de Pressão Selecionada */}
            <div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pressão selecionada</span>
              </span>
            </div>
          </div>

          {/* 2. Controlo Central Numérico e Slider Equilibrado */}
          <div className="max-w-xs mx-auto w-full space-y-2 pt-0.5">
            <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-300 shadow-inner">
              <button
                type="button"
                onClick={() => handleStep(-0.1)}
                aria-label="Diminuir pressão em 0,1 bar"
                className="w-9 h-9 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-lg font-black text-base flex items-center justify-center border border-slate-300 transition-all shadow-xs active:scale-95 touch-target cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline gap-1 px-2 text-center">
                <input
                  type="text"
                  value={inputStr}
                  onChange={handleInputChange}
                  aria-label="Pressão de trabalho em bar"
                  className="w-24 text-center text-2xl sm:text-3xl font-black font-mono-numbers text-daterra-primary bg-transparent outline-none border-b-2 border-dashed border-daterra-accent/50 focus:border-daterra-primary px-1"
                />
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">bar</span>
              </div>

              <button
                type="button"
                onClick={() => handleStep(0.1)}
                aria-label="Aumentar pressão em 0,1 bar"
                className="w-9 h-9 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-lg font-black text-base flex items-center justify-center border border-slate-300 transition-all shadow-xs active:scale-95 touch-target cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Slider Fixo de 1,0 a 30,0 bar */}
            <div className="space-y-1 px-1">
              <div className="relative flex items-center justify-center py-1">
                <input
                  type="range"
                  min={FIXED_MIN_PRESSURE}
                  max={FIXED_MAX_PRESSURE}
                  step={0.1}
                  value={workingPressureBar}
                  onChange={handleSliderChange}
                  aria-label="Slider de ajuste de pressão de 1 a 30 bar"
                  style={{
                    background: `linear-gradient(to right, #1b5e20 0%, #1b5e20 ${progressPercent}%, #e2e8f0 ${progressPercent}%, #e2e8f0 100%)`
                  }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-daterra-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-daterra-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono-numbers px-0.5">
                <span>{formatPt(FIXED_MIN_PRESSURE, 1)} bar</span>
                <span>{formatPt(FIXED_MAX_PRESSURE, 1)} bar</span>
              </div>
            </div>
          </div>

          {/* 3. Atalhos Rápidos Fixos: 2 bar, 4 bar, 5 bar, 10 bar, 12 bar, 15 bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600 mr-1 text-[11px]">Atalhos:</span>
            {FIXED_SHORTCUTS.map(p => {
              const isSelected = Math.abs(workingPressureBar - p) < 0.05;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangePressure(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono-numbers transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-daterra-primary text-white shadow-xs ring-1 ring-daterra-accent'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p} bar
                </button>
              );
            })}
          </div>
        </div>

        {/* Lado Direito: Débito do Bico e Pressão Selecionada com Divisória a Meio */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between space-y-2.5">
          {/* Cabeçalho do Bico Selecionado */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {colorPres && (
                <span
                  aria-hidden="true"
                  className="w-4 h-4 rounded-full border shadow-2xs shrink-0"
                  style={{
                    backgroundColor: colorPres.hex,
                    borderColor: colorPres.hex.toLowerCase() === '#ffffff' ? '#94a3b8' : 'rgba(0,0,0,0.15)'
                  }}
                />
              )}
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                  {nozzleDisplayName}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 truncate">
                  {nozzleColorLabel}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-extrabold shrink-0 shadow-2xs">
              Bico Atual
            </span>
          </div>

          {/* Cartão de Débito em Destaque */}
          <div className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white p-3.5 sm:p-4 rounded-2xl shadow-soft border border-white/10 flex flex-col justify-between flex-1 space-y-2">
            {/* Linha Superior: Diâmetro de Gotas e Débito à Pressão */}
            <div className="flex items-center justify-between border-b border-white/15 pb-1.5 text-[10px] sm:text-[11px] gap-2">
              <div
                className={`flex items-center gap-1.5 font-bold min-w-0 truncate ${
                  currentDropletValues ? 'text-emerald-100' : 'text-white/60'
                }`}
                title={currentDropletValues ? 'Medição catalogada de diâmetro de gotas' : 'Sem dados catalogados para esta pressão'}
              >
                <Droplets
                  className={`w-3.5 h-3.5 shrink-0 ${currentDropletValues ? 'text-daterra-accent' : 'text-white/40'}`}
                  aria-label="Diâmetro de gota"
                />
                <span className="font-mono-numbers tracking-tight truncate">
                  {currentDropletValues
                    ? `DV10 ${currentDropletValues.dv10Micrometres} µm | DV50 ${currentDropletValues.dv50Micrometres} µm | DV90 ${currentDropletValues.dv90Micrometres} µm`
                    : 'DV10 -- µm | DV50 -- µm | DV90 -- µm'}
                </span>
              </div>

              <span className="font-extrabold uppercase tracking-wider text-daterra-accent shrink-0 text-right">
                Débito a {formatPt(workingPressureBar, 1)} bar
              </span>
            </div>

            {/* Débito Calculado */}
            <div className="py-0.5 flex items-baseline justify-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-white tracking-tight">
                {formatPt(calculatedFlow.flowLMin, 2)}
              </span>
              <span className="text-base sm:text-lg font-bold text-daterra-accent">
                L/min
              </span>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  calculatedFlow.valueOrigin === 'tabelado'
                    ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                    : 'bg-white/10 text-white/80'
                }`}
              >
                {calculatedFlow.valueOrigin === 'tabelado' ? 'Tabelado' : 'Estimado ISO'}
              </span>
            </div>

            {/* Desvio Admissível (±10%) */}
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider">
                Desvio admissível (±10%):
              </span>
              <span className="text-xs font-black font-mono-numbers text-white">
                {formatPt(calculatedFlow.deviationMinLMin, 2)} – {formatPt(calculatedFlow.deviationMaxLMin, 2)} L/min
              </span>
            </div>
          </div>

          {/* Faixa Recomendada ou Alerta de Pressão */}
          <div className="pt-0.5">
            {calculatedFlow.pressureWarning ? (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center gap-1.5 text-xs text-rose-900 font-bold leading-tight animate-fade-in shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{calculatedFlow.pressureWarning}</span>
              </div>
            ) : (
              <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-medium shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Faixa recomendada: {formatPt(referenceNozzle.pressureMinBar, 1)}–{formatPt(referenceNozzle.pressureMaxBar, 1)} bar
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (!showCardWrapper) {
      return splitContent;
    }

    return (
      <div className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-soft">
        {splitContent}
      </div>
    );
  }

  if (!showCardWrapper) {
    return content;
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-soft">
      {content}
    </div>
  );
};

export default PressureControl;
