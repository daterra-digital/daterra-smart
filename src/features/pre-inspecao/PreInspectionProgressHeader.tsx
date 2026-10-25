import React from 'react';
import { Zap, ListChecks, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { EvaluationMode } from './types/inspecaoTypes';

export interface PreInspectionProgressHeaderProps {
  mode: EvaluationMode;
  onChangeMode: (newMode: EvaluationMode) => void;
  equipmentTitle: string;
  totalSubQuestions: number;
  answeredSubQuestions: number;
  conformeCount: number;
  anomaliaCount: number;
}

export const PreInspectionProgressHeader: React.FC<PreInspectionProgressHeaderProps> = ({
  mode,
  onChangeMode,
  equipmentTitle,
  totalSubQuestions,
  answeredSubQuestions,
  conformeCount,
  anomaliaCount
}) => {
  const progressPct =
    totalSubQuestions > 0 ? Math.round((answeredSubQuestions / totalSubQuestions) * 100) : 0;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
            Modo de Diagnóstico Técnico
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            Checklist de Auditoria — {equipmentTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'expresso'
              ? 'Modo Expresso ativo: aprove grupos inteiros em bloco ou expanda para assinalar anomalias.'
              : 'Modo Detalhado ativo: verifique ponto a ponto individualmente com critérios de falha.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => onChangeMode('expresso')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              mode === 'expresso'
                ? 'bg-[#114037] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#8ffa94]" />
            <span>Modo Expresso</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('detalhado')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              mode === 'detalhado'
                ? 'bg-[#114037] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-[#8ffa94]" />
            <span>Modo Detalhado</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>Progresso da Auditoria:</span>
            <span className="font-mono font-black text-[#114037]">
              {answeredSubQuestions} / {totalSubQuestions} itens ({progressPct}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{conformeCount} Conformes</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{anomaliaCount} Anomalias</span>
            </span>
          </div>
        </div>

        <div
          className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-[#114037] to-[#3CA64C] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </section>
  );
};
