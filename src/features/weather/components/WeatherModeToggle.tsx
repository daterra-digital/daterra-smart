// src/features/weather/components/WeatherModeToggle.tsx
import React from 'react';
import { CloudSun, ShieldCheck } from 'lucide-react';

export type WeatherMode = 'meteorologia' | 'pulverizacao';

interface WeatherModeToggleProps {
  activeMode: WeatherMode;
  onChangeMode: (mode: WeatherMode) => void;
  className?: string;
}

export const WeatherModeToggle: React.FC<WeatherModeToggleProps> = ({
  activeMode,
  onChangeMode,
  className = ''
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, mode: WeatherMode) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextMode: WeatherMode = mode === 'meteorologia' ? 'pulverizacao' : 'meteorologia';
      onChangeMode(nextMode);
      const nextBtn = document.getElementById(`tab-weather-mode-${nextMode}`);
      nextBtn?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Modo de visualização meteorológica"
      className={`inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 select-none ${className}`}
    >
      <button
        type="button"
        role="tab"
        id="tab-weather-mode-meteorologia"
        aria-selected={activeMode === 'meteorologia'}
        aria-controls="panel-weather-mode-meteorologia"
        tabIndex={activeMode === 'meteorologia' ? 0 : -1}
        onClick={() => onChangeMode('meteorologia')}
        onKeyDown={(e) => handleKeyDown(e, 'meteorologia')}
        className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CA64C] focus:ring-offset-1 touch-target ${
          activeMode === 'meteorologia'
            ? 'bg-[#114037] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <CloudSun className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Meteorologia</span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-weather-mode-pulverizacao"
        aria-selected={activeMode === 'pulverizacao'}
        aria-controls="panel-weather-mode-pulverizacao"
        tabIndex={activeMode === 'pulverizacao' ? 0 : -1}
        onClick={() => onChangeMode('pulverizacao')}
        onKeyDown={(e) => handleKeyDown(e, 'pulverizacao')}
        className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CA64C] focus:ring-offset-1 touch-target ${
          activeMode === 'pulverizacao'
            ? 'bg-[#114037] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Pulverização</span>
      </button>
    </div>
  );
};
