import React from 'react';
import { Check, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { PreInspectionSubQuestion, ItemStatus } from './types/inspecaoTypes';

export interface SubQuestionItemCardProps {
  subQuestion: PreInspectionSubQuestion;
  index: number;
  status: ItemStatus | null;
  onAnswer: (subId: string, status: 'conforme' | 'anomalia') => void;
}

export const SubQuestionItemCard: React.FC<SubQuestionItemCardProps> = ({
  subQuestion,
  index,
  status,
  onAnswer
}) => {
  const isConforme = status === 'conforme';
  const isAnomalia = status === 'anomalia';

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-slate-400 block">
          Ponto Técnico #{index + 1}
        </span>
        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
          {subQuestion.subpergunta}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">{subQuestion.informacaoSub}</p>
        <div className="flex items-start gap-1.5 pt-0.5 text-[11px] font-semibold text-emerald-800">
          <Info className="w-3.5 h-3.5 text-[#3CA64C] shrink-0 mt-0.5" />
          <span>Dica: {subQuestion.dicaSub}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onAnswer(subQuestion.id, 'conforme')}
          className={`min-h-[48px] py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
            isConforme
              ? 'bg-[#114037] text-white border-[#114037] shadow-xs'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-800'
          }`}
        >
          <Check className={`w-4 h-4 shrink-0 ${isConforme ? 'text-[#8ffa94]' : 'text-slate-400'}`} />
          <span>Conforme</span>
        </button>

        <button
          type="button"
          onClick={() => onAnswer(subQuestion.id, 'anomalia')}
          className={`min-h-[48px] py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
            isAnomalia
              ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-800'
          }`}
        >
          <XCircle className={`w-4 h-4 shrink-0 ${isAnomalia ? 'text-white' : 'text-slate-400'}`} />
          <span>Anomalia</span>
        </button>
      </div>

      {isAnomalia && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-start gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            <strong>Implicação de Falha:</strong> {subQuestion.falhas}
          </span>
        </div>
      )}
    </div>
  );
};
