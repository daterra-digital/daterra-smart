import React from 'react';
import { Edit2, Droplets, Gauge } from 'lucide-react';
import { DidacticHelp } from '../concentracao/DidacticHelp';
import type { ConcentracaoUnit, ConcentracaoMode } from './concentracaoDataMapper';
import { ConcentracaoAdultaParams } from './ConcentracaoAdultaParams';
import { ConcentracaoModeSelector } from './ConcentracaoModeSelector';

interface ConcentracaoInputsPanelProps {
  concValue: number;
  concUnit: ConcentracaoUnit;
  volPreparar: number;
  mode: ConcentracaoMode;
  volRecomendado: number;
  volAplicado: number;
  onSetMode: (m: ConcentracaoMode) => void;
  onSetUnit: (u: ConcentracaoUnit) => void;
  onOpenKeypad: (field: 'concValue' | 'volPreparar' | 'volRecomendado' | 'volAplicado') => void;
  onSelectPresetConc: (val: number) => void;
  onSelectPresetVol: (val: number) => void;
}

export const ConcentracaoInputsPanel: React.FC<ConcentracaoInputsPanelProps> = ({
  concValue,
  concUnit,
  volPreparar,
  mode,
  volRecomendado,
  volAplicado,
  onSetMode,
  onSetUnit,
  onOpenKeypad,
  onSelectPresetConc,
  onSelectPresetVol
}) => {
  const isJovem = mode === 'jovem';
  const isPercent = concUnit === '%';

  const concPresets = isPercent ? [0.05, 0.1, 0.15, 0.2] : [50, 100, 150, 200];
  const volPresets = [200, 400, 600, 1000];

  return (
    <section
      aria-label="Valores introduzidos para cálculo da concentração"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
    >
      <ConcentracaoModeSelector
        mode={mode}
        concUnit={concUnit}
        onSetMode={onSetMode}
        onSetUnit={onSetUnit}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parâmetro 1: Volume a Preparar no Depósito */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">Volume a Preparar no Depósito</span>
            </div>
            <DidacticHelp
              faqFile="ConcentracaoFAQVolumePreparar.md"
              topic="conc-vol-preparar"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('volPreparar')}
            aria-label={`Editar volume do depósito: ${volPreparar} Litros`}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {volPreparar}
              </span>
              <span className="text-xs font-bold text-slate-500">L</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
            {volPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetVol(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  volPreparar === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val}L
              </button>
            ))}
          </div>
        </div>

        {/* Parâmetro 2: Concentração Recomendada */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">Concentração Recomendada</span>
            </div>
            <DidacticHelp
              faqFile="ConcentracaoFAQConcentracao.md"
              topic="conc-valor"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('concValue')}
            aria-label={`Editar concentração recomendada: ${concValue} ${concUnit}`}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {concValue}
              </span>
              <span className="text-xs font-bold text-slate-500">{concUnit}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
            {concPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetConc(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  concValue === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isJovem && (
        <ConcentracaoAdultaParams
          volRecomendado={volRecomendado}
          volAplicado={volAplicado}
          onOpenKeypad={onOpenKeypad}
        />
      )}
    </section>
  );
};
