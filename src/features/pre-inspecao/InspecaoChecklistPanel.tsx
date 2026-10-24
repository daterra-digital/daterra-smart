import React from 'react';
import { Check, X, CheckCheck, Info } from 'lucide-react';
import type { ItemStatus } from './inspecaoDataMapper';
import { CRITICAL_POINTS_ISO16122 } from './inspecaoDataMapper';

interface InspecaoChecklistPanelProps {
  answers: Record<string, ItemStatus>;
  onSetAnswer: (id: string, status: ItemStatus) => void;
  onMarkAllConforme: () => void;
  onOpenGuide: () => void;
}

export const InspecaoChecklistPanel: React.FC<InspecaoChecklistPanelProps> = ({
  answers,
  onSetAnswer,
  onMarkAllConforme,
  onOpenGuide
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Auditoria Tátil de Campo
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
            5 Pontos Críticos • Norma ISO 16122
          </h2>
        </div>
        <button
          type="button"
          onClick={onMarkAllConforme}
          aria-label="Marcar todos os 5 pontos como conformes"
          className="min-h-[48px] px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-target shadow-xs"
        >
          <CheckCheck className="w-4 h-4 text-[#3CA64C]" />
          <span>Aprovar Todos</span>
        </button>
      </div>

      <div className="space-y-3">
        {CRITICAL_POINTS_ISO16122.map((point) => {
          const currentStatus = answers[point.id] || 'pendente';
          const isConforme = currentStatus === 'conforme';
          const isAnomalia = currentStatus === 'anomalia';

          return (
            <div
              key={point.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isAnomalia
                  ? 'bg-rose-50/60 border-rose-200'
                  : isConforme
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#114037] text-white text-[10px] font-mono font-black flex items-center justify-center shrink-0">
                      {point.number}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                      {point.title}
                    </h3>
                    <button
                      type="button"
                      onClick={onOpenGuide}
                      title={point.requirement}
                      aria-label={`Ver requisito técnico de ${point.title}`}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium pl-7">
                    {point.shortDesc}
                  </p>
                </div>

                {/* Seletores Táteis Conforme / Anomalia (>= 48x48 dp) */}
                <div className="grid grid-cols-2 gap-2 shrink-0 sm:w-60 pl-7 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => onSetAnswer(point.id, isConforme ? 'pendente' : 'conforme')}
                    className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
                      isConforme
                        ? 'bg-[#114037] text-white shadow-xs'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${isConforme ? 'text-[#8ffa94]' : 'text-slate-400'}`} />
                    <span>Conforme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetAnswer(point.id, isAnomalia ? 'pendente' : 'anomalia')}
                    className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
                      isAnomalia
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <X className={`w-4 h-4 ${isAnomalia ? 'text-white' : 'text-slate-400'}`} />
                    <span>Anomalia</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
