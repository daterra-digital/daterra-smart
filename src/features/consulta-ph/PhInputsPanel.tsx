import React from 'react';
import { Pencil, Droplets, ShieldCheck } from 'lucide-react';
import type { TipoCalda } from './phDataMapper';
import { TIPO_CALDA_CONFIG } from './phDataMapper';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface PhInputsPanelProps {
  ph: number;
  tipoCalda: TipoCalda;
  onSetTipoCalda: (tipo: TipoCalda) => void;
  onOpenKeypad: () => void;
  onSelectPresetPh: (val: number) => void;
}

export const PhInputsPanel: React.FC<PhInputsPanelProps> = ({
  ph,
  tipoCalda,
  onSetTipoCalda,
  onOpenKeypad,
  onSelectPresetPh
}) => {
  const tipos: TipoCalda[] = ['geral', 'sensivel', 'cupricos', 'sulfonilureias'];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* 1. Seletor de Grupo Químico / Tipo de Calda */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Família Química / Tipo de Calda
          </label>
          <DidacticHelp
            faqFile="MisturaFAQpH.md"
            topic="ph-grupos"
            variant="icon"
            iconType="info"
            className="text-slate-400 hover:text-slate-600"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tipos.map((tipo) => {
            const cfg = TIPO_CALDA_CONFIG[tipo];
            const isSelected = tipoCalda === tipo;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => onSetTipoCalda(tipo)}
                className={`min-h-[48px] p-2.5 rounded-2xl text-left border transition-all cursor-pointer touch-target flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#114037] text-white border-[#114037] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold leading-tight">{cfg.label}</span>
                  <Droplets className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#8ffa94]' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {cfg.min.toFixed(1)} – {cfg.max.toFixed(1)} pH
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cartão de Medição de pH com Keypad e Presets */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">
              pH Medido da Água de Abastecimento
            </span>
            <DidacticHelp
              faqFile="MisturaFAQpH.md"
              topic="ph-medicao"
              variant="icon"
              iconType="info"
              className="text-slate-400 hover:text-slate-600"
            />
          </div>
          <button
            type="button"
            onClick={onOpenKeypad}
            aria-label="Editar pH da água no teclado tátil"
            className="min-h-[48px] px-3.5 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer touch-target group"
          >
            <span className="font-mono text-base font-black text-slate-800 group-hover:text-emerald-700">
              {ph.toFixed(2)} pH
            </span>
            <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </button>
        </div>

        {/* Atalhos Rápidos */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {[5.5, 6.0, 6.5, 7.5].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSelectPresetPh(preset)}
              className={`min-h-[48px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer touch-target ${
                Math.abs(ph - preset) < 0.05
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              pH {preset.toFixed(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Rodapé de Notação Técnica */}
      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>Meça e corrija o pH da água no depósito antes de despejar os fitofármacos.</span>
      </div>
    </div>
  );
};
