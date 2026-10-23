import React, { useState } from 'react';
import {
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  ClipboardCheck
} from 'lucide-react';
import type {
  EvaluationMode,
  PreInspectionCategory,
  SubQuestionAnswer
} from './preInspectionData';
import { SubQuestionItemCard } from './SubQuestionItemCard';

export interface CategoryAccordionCardProps {
  category: PreInspectionCategory;
  mode: EvaluationMode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  answers: Record<string, SubQuestionAnswer>;
  onMarkCategoryAllConforme: (categoryId: string) => void;
  onOpenCategoryForAnomalies: (categoryId: string) => void;
  onAnswerSubQuestion: (subId: string, status: 'conforme' | 'anomalia') => void;
}

export const CategoryAccordionCard: React.FC<CategoryAccordionCardProps> = ({
  category,
  mode,
  isExpanded,
  onToggleExpand,
  answers,
  onMarkCategoryAllConforme,
  onOpenCategoryForAnomalies,
  onAnswerSubQuestion
}) => {
  const [showGlobalTip, setShowGlobalTip] = useState<boolean>(false);

  const subIds = category.subperguntas.map((s) => s.id);
  const allConforme = subIds.length > 0 && subIds.every((id) => answers[id] === 'conforme');
  const anomalyCount = subIds.filter((id) => answers[id] === 'anomalia').length;
  const answeredCount = subIds.filter((id) => Boolean(answers[id])).length;
  const isAnomaliesActive = anomalyCount > 0 || (mode === 'expresso' && isExpanded && !allConforme);
  const showSubQuestions = mode === 'detalhado' || isExpanded;

  return (
    <article
      id={`pre-insp-cat-${category.id}`}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all scroll-mt-24"
    >
      {/* Cabeçalho Clicável da Categoria */}
      <div
        onClick={onToggleExpand}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
              allConforme
                ? 'bg-emerald-600 text-white'
                : anomalyCount > 0
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-50 text-[#114037] border border-emerald-200'
            }`}
          >
            {allConforme ? (
              <Check className="w-5 h-5" />
            ) : anomalyCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-white" />
            ) : (
              <ClipboardCheck className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
              Categoria DGAV • {answeredCount}/{subIds.length} Verificados
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
              {category.categoria}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {allConforme && (
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conforme</span>
            </span>
          )}
          {anomalyCount > 0 && (
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>
                {anomalyCount} {anomalyCount === 1 ? 'Anomalia' : 'Anomalias'}
              </span>
            </span>
          )}
          {mode === 'expresso' && (
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
              <span>{isExpanded ? 'Fechar' : 'Detalhe'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Pergunta Global e Botões de Decisão Rápida */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-5 pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
            {category.perguntaGlobal}
          </p>
          <button
            type="button"
            onClick={() => setShowGlobalTip((p) => !p)}
            aria-label="Informação e dica técnica da categoria"
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Dica</span>
          </button>
        </div>

        {showGlobalTip && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 animate-fade-in">
            <p>
              <strong className="text-slate-900">Enquadramento DGAV:</strong> {category.informacao}
            </p>
            <div className="flex items-start gap-1.5 text-emerald-900 font-semibold">
              <Info className="w-4 h-4 text-[#3CA64C] shrink-0 mt-0.5" />
              <span>Recomendação: {category.dica}</span>
            </div>
          </div>
        )}

        {/* Botões Globais: Estado Inicial Neutro vs Estado Ativo Sólido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onMarkCategoryAllConforme(category.id)}
            className={`min-h-12 px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer touch-target ${
              allConforme
                ? 'bg-emerald-600 text-white border border-emerald-600 shadow-sm'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-800'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>Conforme</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCategoryForAnomalies(category.id)}
            className={`min-h-12 px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer touch-target ${
              isAnomaliesActive
                ? 'bg-rose-600 text-white border border-rose-600 shadow-sm'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Registar Anomalias</span>
          </button>
        </div>
      </div>

      {/* Lista de Subperguntas Detalhadas (Acordeão Expresso ou Modo Detalhado) */}
      {showSubQuestions && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-3 bg-slate-50/80 border-t border-slate-200 space-y-3 animate-fade-in">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Verificação Individual de Subperguntas ({category.subperguntas.length})
          </span>

          {category.subperguntas.map((sub, idx) => (
            <SubQuestionItemCard
              key={sub.id}
              subQuestion={sub}
              index={idx}
              status={answers[sub.id] || null}
              onAnswer={onAnswerSubQuestion}
            />
          ))}
        </div>
      )}
    </article>
  );
};
