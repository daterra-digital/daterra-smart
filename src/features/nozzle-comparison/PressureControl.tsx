import React from 'react';
import { Gauge, Plus, Minus, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Nozzle } from './nozzleComparison.types';
import { formatPt, getAdaptivePressureShortcuts } from './nozzleComparison.calculations';
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
}

export const PressureControl: React.FC<PressureControlProps> = ({
  workingPressureBar,
  onChangePressure,
  nozzleA,
  nozzleB,
  customMinPressure,
  customMaxPressure,
  title = 'Pressão de Trabalho',
  subtitle,
  className = '',
  showCardWrapper = true
}) => {
  // Cálculo da faixa combinada permitida
  const { minPressure, maxPressure, isIntersected, isGeneralRange } = React.useMemo(() => {
    if (customMinPressure !== undefined && customMaxPressure !== undefined) {
      return {
        minPressure: customMinPressure,
        maxPressure: customMaxPressure,
        isIntersected: true,
        isGeneralRange: false
      };
    }

    if (nozzleA && nozzleB) {
      const minOverlap = Math.max(nozzleA.pressureMinBar, nozzleB.pressureMinBar);
      const maxOverlap = Math.min(nozzleA.pressureMaxBar, nozzleB.pressureMaxBar);
      const hasOverlap = minOverlap <= maxOverlap;
      return {
        minPressure: hasOverlap ? minOverlap : Math.min(nozzleA.pressureMinBar, nozzleB.pressureMinBar),
        maxPressure: hasOverlap ? maxOverlap : Math.max(nozzleA.pressureMaxBar, nozzleB.pressureMaxBar),
        isIntersected: hasOverlap,
        isGeneralRange: false
      };
    } else if (nozzleA) {
      return {
        minPressure: nozzleA.pressureMinBar,
        maxPressure: nozzleA.pressureMaxBar,
        isIntersected: true,
        isGeneralRange: false
      };
    } else if (nozzleB) {
      return {
        minPressure: nozzleB.pressureMinBar,
        maxPressure: nozzleB.pressureMaxBar,
        isIntersected: true,
        isGeneralRange: false
      };
    } else {
      return {
        minPressure: 1.0,
        maxPressure: 25.0,
        isIntersected: true,
        isGeneralRange: true
      };
    }
  }, [nozzleA, nozzleB, customMinPressure, customMaxPressure]);

  // Atalhos preferenciais DATERRA Smart [3, 5, 8, 10, 15] bar filtrados pela faixa técnica
  const adaptiveShortcuts = React.useMemo(() => {
    return getAdaptivePressureShortcuts(minPressure, maxPressure, isIntersected);
  }, [minPressure, maxPressure, isIntersected]);

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
    const nextVal = Math.max(0.1, Number((workingPressureBar + step).toFixed(1)));
    onChangePressure(nextVal);
  };

  const handleShortcutClick = (presetPressure: number) => {
    if (isIntersected && presetPressure >= minPressure - 0.05 && presetPressure <= maxPressure + 0.05) {
      onChangePressure(presetPressure);
    }
  };

  const isCurrentPressureValid = isIntersected && workingPressureBar >= minPressure && workingPressureBar <= maxPressure;

  const resolvedSubtitle = subtitle || (
    isGeneralRange
      ? 'Faixa geral configurável (1,0 a 25,0 bar)'
      : !isIntersected
      ? 'Sem faixa de trabalho comum entre os bicos'
      : 'Faixa combinada recomendada: ' + formatPt(minPressure, 1) + ' a ' + formatPt(maxPressure, 1) + ' bar'
  );

  // Percentagem preenchida do trilho (0% a 100%) para gradiente visual idêntico à imagem de referência
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((workingPressureBar - minPressure) / (maxPressure - minPressure || 1)) * 100
    )
  );

  const content = (
    <div className={`space-y-4 ${className}`}>
      {/* 1. CABEÇALHO: TÍTULO E ESTADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-daterra-primary text-white flex items-center justify-center font-bold shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {title}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              {resolvedSubtitle}
            </span>
          </div>
        </div>

        {/* Indicador de Estado da Pressão */}
        <div>
          {nozzleA && nozzleB && !isIntersected ? (
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sem sobreposição de faixas</span>
            </span>
          ) : isCurrentPressureValid ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pressão na faixa</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-900 border border-red-300 rounded-full text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Fora da faixa recomendada</span>
            </span>
          )}
        </div>
      </div>

      {/* Alerta de Sem Sobreposição (compacto) */}
      {nozzleA && nozzleB && !isIntersected && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-medium">
            <strong>Atenção Técnica:</strong> Estes bicos não têm uma faixa de pressão comum para comparação. O Bico A ({formatPt(nozzleA.pressureMinBar, 1)}–{formatPt(nozzleA.pressureMaxBar, 1)} bar) e o Bico B ({formatPt(nozzleB.pressureMinBar, 1)}–{formatPt(nozzleB.pressureMaxBar, 1)} bar) operam em regimes distintos.
          </p>
        </div>
      )}

      {/* 2. CONTROLO CENTRAL NUMÉRICO E SLIDER RESPONSIVO (DESIGN CONFORME REFERÊNCIA) */}
      <div className="max-w-md mx-auto w-full space-y-2 pt-1">
        {/* Bloco Superior: [ − ]       10,8 bar       [ + ] */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-300 shadow-inner">
          <button
            type="button"
            onClick={() => handleStep(-0.1)}
            aria-label="Diminuir pressão em 0,1 bar"
            className="w-12 h-12 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl font-black text-xl flex items-center justify-center border border-slate-300 transition-all shadow-sm active:scale-95 touch-target focus-visible:ring-2 focus-visible:ring-daterra-primary"
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="flex items-baseline gap-2 px-3 text-center">
            <input
              type="text"
              value={inputStr}
              onChange={handleInputChange}
              aria-label="Pressão de trabalho em bar"
              className="w-24 text-center text-3xl sm:text-4xl font-black font-mono-numbers text-daterra-primary bg-transparent outline-none border-b-2 border-dashed border-daterra-accent/50 focus:border-daterra-primary"
            />
            <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wide">bar</span>
          </div>

          <button
            type="button"
            onClick={() => handleStep(0.1)}
            aria-label="Aumentar pressão em 0,1 bar"
            className="w-12 h-12 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl font-black text-xl flex items-center justify-center border border-slate-300 transition-all shadow-sm active:scale-95 touch-target focus-visible:ring-2 focus-visible:ring-daterra-primary"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Trilho fino com preenchimento colorido e botão circular compacto (20–24px) */}
        <div className="space-y-1 px-1">
          <div className="relative flex items-center justify-center min-h-[48px] py-3">
            <input
              type="range"
              min={Math.max(0.5, minPressure)}
              max={Math.max(minPressure + 1, maxPressure)}
              step={0.1}
              value={workingPressureBar}
              onChange={handleSliderChange}
              aria-label="Slider de ajuste de pressão"
              style={{
                background: `linear-gradient(to right, #1b5e20 0%, #1b5e20 ${progressPercent}%, #e2e8f0 ${progressPercent}%, #e2e8f0 100%)`
              }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-daterra-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3.5px] [&::-webkit-slider-thumb]:border-daterra-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3.5px] [&::-moz-range-thumb]:border-daterra-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110"
            />
          </div>

          {/* Limites perfeitamente alinhados ao trilho: 5,0 bar        25,0 bar */}
          <div className="flex justify-between text-xs font-bold text-slate-500 font-mono-numbers px-0.5">
            <span>{formatPt(minPressure, 1)} bar</span>
            <span>{formatPt(maxPressure, 1)} bar</span>
          </div>
        </div>
      </div>

      {/* 3. ATALHOS RECOMENDADOS [3,0; 5,0; 8,0; 10,0; 15,0 bar] (ZONA SECUNDÁRIA) */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 mr-1">Atalhos recomendados:</span>
        {nozzleA && nozzleB && !isIntersected ? (
          <span className="text-xs text-amber-800 font-semibold italic">
            Estes bicos não têm uma faixa de pressão comum para comparação.
          </span>
        ) : adaptiveShortcuts.length > 0 ? (
          adaptiveShortcuts.map(p => {
            const isSelected = Math.abs(workingPressureBar - p) < 0.05;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handleShortcutClick(p)}
                className={'px-3 py-1.5 rounded-xl text-xs font-bold font-mono-numbers transition-all touch-target ' + (
                  isSelected
                    ? 'bg-daterra-primary text-white shadow-sm ring-2 ring-daterra-accent'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                )}
              >
                {formatPt(p, 1)} bar
              </button>
            );
          })
        ) : (
          <span className="text-xs text-slate-500 italic">Não existem atalhos predefinidos dentro da faixa selecionada.</span>
        )}
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return content;
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft">
      {content}
    </div>
  );
};
