import React from 'react';
import { Zap, ListChecks, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { EvaluationMode } from './preInspectionData';

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
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Topo: Indicador do Ecrã 2 + Seletor de Modo Expresso vs Modo Detalhado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
            Ecrã 2 • Modo de Diagnóstico Técnico
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Checklist de Pré-Inspeção — {equipmentTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'expresso'
              ? 'Modo Expresso ativo: valide categorias inteiras de uma só vez ou expanda para registar anomalias.'
              : 'Modo Detalhado ativo: verifique individualmente cada ponto técnico e critério de falha.'}
          </p>
        </div>

        {/* Toggle Modo Expresso vs Modo Detalhado */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => onChangeMode('expresso')}
            className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              mode === 'expresso'
                ? 'bg-emerald-900 text-white border border-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-[#8ffa94]" />
            <span>Modo Expresso</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('detalhado')}
            className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              mode === 'detalhado'
                ? 'bg-emerald-900 text-white border border-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-4 h-4 text-[#8ffa94]" />
            <span>Modo Detalhado</span>
          </button>
        </div>
      </div>

      {/* Barra de Progresso Horizontal e Métricas de Resposta */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>Progresso da Avaliação:</span>
            <span className="font-mono font-black text-[#114037]">
              {answeredSubQuestions} / {totalSubQuestions} pontos ({progressPct}%)
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

        {/* Barra de Progresso Verde DATERRA */}
        <div
          className="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
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
