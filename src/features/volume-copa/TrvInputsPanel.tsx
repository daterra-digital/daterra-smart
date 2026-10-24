import React from 'react';
import { Edit2, Ruler, AlertCircle } from 'lucide-react';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface TrvInputsPanelProps {
  alturaCopa: number;
  larguraCopa: number;
  distanciaEntrelinhas: number;
  onOpenKeypad: (field: 'altura' | 'largura' | 'entrelinha') => void;
  onSelectPresetAltura: (val: number) => void;
  onSelectPresetLargura: (val: number) => void;
  onSelectPresetEntrelinha: (val: number) => void;
}

export const TrvInputsPanel: React.FC<TrvInputsPanelProps> = ({
  alturaCopa,
  larguraCopa,
  distanciaEntrelinhas,
  onOpenKeypad,
  onSelectPresetAltura,
  onSelectPresetLargura,
  onSelectPresetEntrelinha
}) => {
  const alturaPresets = [1.5, 2.5, 3.5, 4.5];
  const larguraPresets = [0.5, 1.0, 1.5, 2.0];
  const entrelinhaPresets = [2.0, 3.0, 4.0, 5.0];

  return (
    <section
      aria-label="Valores introduzidos para cálculo do TRV"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">
          Valores Introduzidos
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          Toque para editar medidas com teclado tátil
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Parâmetro 1: Altura da Copa */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">Altura da copa (h)</span>
            </div>
            <DidacticHelp
              faqFile="TRVFAQAltura.md"
              topic="trv-altura"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('altura')}
            aria-label={`Editar altura da copa: ${alturaCopa} metros`}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {alturaCopa.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
            {alturaPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetAltura(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  alturaCopa === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val.toFixed(1)}m
              </button>
            ))}
          </div>

          {alturaCopa < 1.0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Altura baixa (&lt; 1,0 m). Verifique a medição.</span>
            </div>
          )}
        </div>

        {/* Parâmetro 2: Largura Média da Copa */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">Largura da copa (w)</span>
            </div>
            <DidacticHelp
              faqFile="TRVFAQLargura.md"
              topic="trv-largura"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('largura')}
            aria-label={`Editar largura média da copa: ${larguraCopa} metros`}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {larguraCopa.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
            {larguraPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetLargura(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  larguraCopa === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val.toFixed(1)}m
              </button>
            ))}
          </div>

          {larguraCopa < 0.4 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Espessura estreita (&lt; 0,4 m).</span>
            </div>
          )}
        </div>

        {/* Parâmetro 3: Distância Entrelinhas */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">Entrelinha (r)</span>
            </div>
            <DidacticHelp
              faqFile="TRVFAQEntrelinha.md"
              topic="trv-entrelinha"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('entrelinha')}
            aria-label={`Editar distância entrelinhas: ${distanciaEntrelinhas} metros`}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {distanciaEntrelinhas.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
            {entrelinhaPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetEntrelinha(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  distanciaEntrelinhas === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val.toFixed(1)}m
              </button>
            ))}
          </div>

          {distanciaEntrelinhas < 2.0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Entrelinha estreita (&lt; 2,0 m).</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
