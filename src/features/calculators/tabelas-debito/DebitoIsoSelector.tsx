import React from 'react';
import { Check } from 'lucide-react';
import { ISO_NOZZLE_COLORS } from './debitoTypes';

interface DebitoIsoSelectorProps {
  selectedCode: string;
  onSelectCode: (code: string) => void;
}

export const DebitoIsoSelector: React.FC<DebitoIsoSelectorProps> = ({
  selectedCode,
  onSelectCode
}) => {
  return (
    <section
      aria-label="Seleção do bico segundo a norma ISO 10625"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">
          Bicos Normalizados (ISO 10625)
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          Toque na cor do bico instalado
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {ISO_NOZZLE_COLORS.map((nozzle) => {
          const isSelected = nozzle.code === selectedCode;

          return (
            <button
              key={nozzle.code}
              type="button"
              onClick={() => onSelectCode(nozzle.code)}
              aria-label={`Selecionar bico ISO ${nozzle.code} cor ${nozzle.namePt}, débito nominal ${nozzle.nominalFlow3Bar} litros por minuto a 3 bar`}
              aria-pressed={isSelected}
              className={`min-h-[48px] p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 cursor-pointer touch-target ${
                isSelected
                  ? 'border-[#114037] bg-emerald-50/70 shadow-sm ring-2 ring-[#3CA64C]'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Amostra Cromática Circular */}
              <div
                className="w-8 h-8 rounded-full border border-black/15 shadow-2xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: nozzle.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 stroke-[3] ${
                      nozzle.code === '02' || nozzle.code === '08' ? 'text-slate-900' : 'text-white'
                    }`}
                  />
                )}
              </div>

              {/* Informação do Bico */}
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-black text-slate-900 leading-none">
                    {nozzle.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 truncate">
                    {nozzle.namePt}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#114037] block mt-0.5">
                  {nozzle.nominalFlow3Bar.toFixed(2)} L/m
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
