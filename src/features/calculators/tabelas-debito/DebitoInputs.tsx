import React from 'react';
import { Edit2, Gauge, AlertCircle } from 'lucide-react';
import { DidacticHelp } from '../../concentracao/DidacticHelp';

interface DebitoInputsProps {
  pressureBar: number;
  onOpenKeypad: () => void;
  onSelectPresetPressure: (val: number) => void;
}

export const DebitoInputs: React.FC<DebitoInputsProps> = ({
  pressureBar,
  onOpenKeypad,
  onSelectPresetPressure
}) => {
  const pressurePresets = [1.5, 2.0, 2.5, 3.0, 4.0, 5.0];

  return (
    <section
      aria-label="Valores introduzidos de calibração"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">
          Valores Introduzidos
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          Toque para editar a pressão no manómetro
        </span>
      </div>

      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#1D734B]" />
            <span className="text-xs font-bold text-slate-800">Pressão de trabalho no manómetro</span>
          </div>
          <DidacticHelp
            faqFile="DebitoTotalFAQVelocidade.md"
            topic="debito-pressao"
            variant="icon"
            iconType="info"
            className="!text-slate-400 hover:!text-[#114037]"
          />
        </div>

        <button
          type="button"
          onClick={onOpenKeypad}
          aria-label={`Editar pressão de trabalho atual: ${pressureBar} bar`}
          className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
        >
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
              {pressureBar.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">bar</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Atalhos Rápidos de Pressão */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
          {pressurePresets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onSelectPresetPressure(val)}
              className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                pressureBar === val
                  ? 'bg-[#114037] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {val.toFixed(1)} bar
            </button>
          ))}
        </div>

        {pressureBar < 1.5 && (
          <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Pressão muito baixa pode comprometer o ângulo do leque e a uniformidade.</span>
          </div>
        )}

        {pressureBar > 5.0 && (
          <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Pressão elevada gera gotas finas com risco aumentado de deriva pelo vento.</span>
          </div>
        )}
      </div>
    </section>
  );
};
