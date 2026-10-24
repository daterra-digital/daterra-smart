import React from 'react';
import { Edit2, AlertCircle, Ruler, Clock } from 'lucide-react';
import { DidacticHelp } from '../../concentracao/DidacticHelp';

interface VelocidadeInputsPanelProps {
  distanciaMeters: number;
  tempoSeconds: number;
  onOpenKeypad: (field: 'distancia' | 'tempo') => void;
  onSelectPresetDistancia: (val: number) => void;
  onSelectPresetTempo: (val: number) => void;
}

export const VelocidadeInputsPanel: React.FC<VelocidadeInputsPanelProps> = ({
  distanciaMeters,
  tempoSeconds,
  onOpenKeypad,
  onSelectPresetDistancia,
  onSelectPresetTempo
}) => {
  const distanciaPresets = [50, 100, 200, 300];
  const tempoPresets = [30, 45, 60, 90];

  return (
    <section
      aria-label="Valores introduzidos para o cálculo"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">
          Valores Introduzidos
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          Toque para editar com teclado tátil
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parâmetro 1: Distância */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">Distância do percurso</span>
            </div>
            <DidacticHelp
              faqFile="VelocidadeRealFAQDistancia.md"
              topic="velocidade-real-distancia"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('distancia')}
            aria-label={`Editar distância do percurso: ${distanciaMeters} metros`}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {distanciaMeters}
              </span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Atalhos Rápidos de Distância */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
            {distanciaPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetDistancia(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  distanciaMeters === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val}m
              </button>
            ))}
          </div>

          {distanciaMeters < 100 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Para maior rigor, recomenda-se percurso ≥ 100 m.</span>
            </div>
          )}
        </div>

        {/* Parâmetro 2: Tempo */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">Tempo do percurso</span>
            </div>
            <DidacticHelp
              faqFile="VelocidadeRealFAQTempo.md"
              topic="velocidade-real-tempo"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('tempo')}
            aria-label={`Editar tempo cronometrado: ${tempoSeconds} segundos`}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {tempoSeconds}
              </span>
              <span className="text-xs font-bold text-slate-500">s</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Atalhos Rápidos de Tempo */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Atalhos:</span>
            {tempoPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetTempo(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  tempoSeconds === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val}s
              </button>
            ))}
          </div>

          {tempoSeconds < 20 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Tempo muito curto pode reduzir a precisão da medição.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
