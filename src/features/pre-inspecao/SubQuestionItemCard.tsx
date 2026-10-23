import React from 'react';
import { Check, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { PreInspectionSubQuestion, SubQuestionAnswer } from './preInspectionData';

export interface SubQuestionItemCardProps {
  subQuestion: PreInspectionSubQuestion;
  index: number;
  status: SubQuestionAnswer;
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
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold text-slate-400 block">
          Ponto Técnico #{index + 1}
        </span>
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
          {subQuestion.subpergunta}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">{subQuestion.informacaoSub}</p>
        <div className="flex items-start gap-1.5 pt-0.5 text-[11px] font-semibold text-emerald-800">
          <Info className="w-4 h-4 text-[#3CA64C] shrink-0 mt-0.5" />
          <span>Dica: {subQuestion.dicaSub}</span>
        </div>
      </div>

      {/* Botões [ ✓ Conforme ] e [ Anomalia ] — Neutros por defeito, Sólidos após clique */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onAnswer(subQuestion.id, 'conforme')}
          className={`min-h-11 py-2.5 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
            isConforme
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-800'
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>Conforme</span>
        </button>

        <button
          type="button"
          onClick={() => onAnswer(subQuestion.id, 'anomalia')}
          className={`min-h-11 py-2.5 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
            isAnomalia
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-800'
          }`}
        >
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Anomalia</span>
        </button>
      </div>

      {isAnomalia && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-start gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            <strong>Implicação:</strong> {subQuestion.falhas}
          </span>
        </div>
      )}
    </div>
  );
};
