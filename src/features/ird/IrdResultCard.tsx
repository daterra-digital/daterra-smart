import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import type { DriftReadingEvaluation } from '../weather/utils/weatherDriftTypes.ts';
import type { IrdAssessmentLevelSnapshot, IrdEvaluationLevel } from './irdOriginTypes.ts';
import type { IrdGuideTopicId } from './irdGuideSections.ts';
import {
  buildIrdPrimaryMessage,
  getIrdDisplayRiskLabel,
  getIrdModeDisplayName,
  isIrdPartialAssessment
} from './irdPresentationHelper.ts';
import type { IrdResult, IrdRiskClass } from './irdTypes.ts';
import { IrdMeteoChips } from './IrdMeteoChips.tsx';

interface IrdResultCardProps {
  readonly evaluationLevel?: IrdEvaluationLevel;
  readonly assessmentLevelSnapshot?: IrdAssessmentLevelSnapshot | null;
  readonly result: IrdResult | null;
  readonly isLoading: boolean;
  readonly weatherEval?: DriftReadingEvaluation | null;
  readonly weatherSummary?: { readonly sourceLabel: string; readonly locationName: string; readonly isStaleCache: boolean; readonly isLegacyCache?: boolean } | null;
  readonly missingOperationalFields?: readonly string[];
  readonly blockingGapsPt?: readonly string[];
  readonly onSwitchToQuickManual?: () => void;
  readonly onEditManualWeather?: () => void;
  readonly onOpenGuideTopic?: (topic: IrdGuideTopicId) => void;
}

const CLASS_CSS: Record<IrdRiskClass, string> = {
  BAIXO: 'bg-emerald-300 text-slate-950',
  MODERADO: 'bg-amber-300 text-slate-950',
  ELEVADO: 'bg-orange-400 text-slate-950',
  CRITICO_BLOQUEADO: 'bg-rose-500 text-white'
};

const METEO_CSS: Record<string, string> = {
  BAIXO: 'bg-emerald-300 text-slate-950',
  MODERADO: 'bg-amber-300 text-slate-950',
  ELEVADO: 'bg-orange-400 text-slate-950',
  CRITICO: 'bg-rose-500 text-white'
};

export const IrdResultCard: React.FC<IrdResultCardProps> = ({
  evaluationLevel = 'level1_meteo',
  assessmentLevelSnapshot,
  result,
  isLoading,
  weatherEval,
  weatherSummary,
  missingOperationalFields = [],
  blockingGapsPt = [],
  onSwitchToQuickManual,
  onEditManualWeather,
  onOpenGuideTopic
}) => {
  if (isLoading) {
    return (
      <section role="status" aria-live="polite" aria-label="A carregar leitura meteorológica" className="w-full bg-[#114037] text-white rounded-3xl p-4 sm:p-5 shadow-floating">
        <div className="space-y-3 animate-pulse" aria-busy="true">
          <div className="h-4 w-44 bg-white/25 rounded" />
          <div className="h-12 w-32 bg-white/25 rounded-2xl" />
          <div className="h-3 w-full bg-white/20 rounded-full" />
        </div>
      </section>
    );
  }

  const primaryMsg = buildIrdPrimaryMessage({
    evaluationLevel,
    assessmentLevelSnapshot,
    result,
    weatherEval,
    weatherSummary,
    blockingGapsPt,
    missingOpFields: missingOperationalFields
  });

  if (evaluationLevel === 'level1_meteo') {
    const valid = weatherEval?.status === 'VALID';
    const score = valid && weatherEval?.score !== null && weatherEval?.score !== undefined ? weatherEval.score : null;
    const markerLeft = score !== null ? `${Math.min(98, Math.max(2, score))}%` : '0%';
    return (
      <section role="region" aria-label="Resultado do modo Só Meteorologia" className="w-full bg-[#114037] text-white rounded-3xl p-4 sm:p-5 shadow-floating border border-[#1D734B] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono-numbers text-4xl sm:text-5xl font-extrabold leading-none">{score !== null ? score : '—'}</span>
            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold">1. Só Meteorologia · Escala 10–100</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${valid && weatherEval?.band ? METEO_CSS[weatherEval.band] : 'bg-slate-200 text-slate-900'}`}>
                  {valid && weatherEval ? weatherEval.bandLabelPt : 'Sem leitura'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-snug">
                {valid && weatherEval ? weatherEval.dominantFactorPt : weatherSummary ? `${weatherSummary.sourceLabel} · ${weatherSummary.locationName}` : 'Sem dados válidos'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {weatherSummary && <span className="text-[11px] text-emerald-100/90 font-medium">{weatherSummary.sourceLabel} · {weatherSummary.locationName}</span>}
            {onEditManualWeather && <button type="button" onClick={onEditManualWeather} className="touch-target px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white cursor-pointer">Editar meteorologia</button>}
          </div>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden flex bg-white/20" aria-label="Escala visual meteorológica de 10 a 100">
          <div className="w-1/4 bg-emerald-400" /><div className="w-1/4 bg-amber-300" /><div className="w-1/4 bg-orange-400" /><div className="w-1/4 bg-rose-500" />
          {score !== null && <div className="absolute top-0 bottom-0 w-2 bg-white ring-2 ring-slate-950 rounded" style={{ left: `calc(${markerLeft} - 4px)` }} />}
        </div>
        {valid && weatherEval && <IrdMeteoChips weatherEval={weatherEval} />}
        {primaryMsg.text && (
          <div role={primaryMsg.kind === 'critical' || primaryMsg.kind === 'incomplete' ? 'alert' : 'status'} className="rounded-2xl px-3.5 py-2 text-xs font-semibold bg-black/25 border border-white/20 flex items-start gap-2 text-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{primaryMsg.text}</span>
          </div>
        )}
      </section>
    );
  }

  const calcResult = result?.status === 'CALCULATED' && blockingGapsPt.length === 0 ? result : null;
  const score = calcResult ? calcResult.irdScore : null;
  const riskClass = calcResult ? calcResult.irdClass : null;
  const badgeLabel = riskClass ? getIrdDisplayRiskLabel(riskClass) : 'Avaliação indisponível';
  const markerLeft = score !== null ? `${Math.min(98, Math.max(2, score))}%` : '0%';
  const isPartial = isIrdPartialAssessment(calcResult, assessmentLevelSnapshot);
  const subIndexItems = calcResult
    ? ([
        ['meteo', 'Meteorologia (35%)', calcResult.subIndices.meteo],
        ['espectro', 'Espectro (30%)', calcResult.subIndices.espectro],
        ['operacao', 'Operação (20%)', calcResult.subIndices.operacao],
        ['exposicao', 'Exposição (15%)', calcResult.subIndices.exposicao]
      ] as const)
    : [];

  return (
    <section role="region" aria-label={`Resultado: ${getIrdModeDisplayName(evaluationLevel, assessmentLevelSnapshot)}`} className="w-full bg-[#114037] text-white rounded-3xl p-4 sm:p-5 shadow-floating border border-[#1D734B] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="font-mono-numbers text-4xl sm:text-5xl font-extrabold leading-none shrink-0">{score !== null ? score : '—'}</span>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold">{getIrdModeDisplayName(evaluationLevel, assessmentLevelSnapshot)} · Escala 1–100</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${riskClass ? CLASS_CSS[riskClass] : 'bg-slate-200 text-slate-900'}`}>{badgeLabel}</span>
              {isPartial && <span className="px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black uppercase">Avaliação parcial</span>}
            </div>
            {weatherSummary && <div className="text-[11px] text-emerald-100/90 truncate">{weatherSummary.locationName} · {weatherSummary.sourceLabel}</div>}
          </div>
        </div>
        {onEditManualWeather && <button type="button" onClick={onEditManualWeather} className="touch-target self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white cursor-pointer shrink-0">Meteorologia</button>}
      </div>
      <div className="relative h-2.5 rounded-full overflow-hidden flex bg-white/20" aria-label="Escala visual do índice de 1 a 100">
        <div className="w-1/4 bg-emerald-400" /><div className="w-1/4 bg-amber-300" /><div className="w-1/4 bg-orange-400" /><div className="w-1/4 bg-rose-500" />
        {score !== null && <div className="absolute top-0 bottom-0 w-2 bg-white ring-2 ring-slate-950 rounded" style={{ left: `calc(${markerLeft} - 4px)` }} />}
      </div>
      {subIndexItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
          {subIndexItems.map(([key, label, value]) => (
            <div key={key} className="bg-white/10 rounded-xl px-3 py-2 flex sm:block items-center justify-between gap-2">
              <div className="text-[11px] text-emerald-100 font-semibold leading-tight">{label}</div>
              <div className="font-mono-numbers text-sm sm:text-base font-extrabold text-white">{value.toFixed(1)}</div>
            </div>
          ))}
        </div>
      )}
      {primaryMsg.text && (
        <div role={primaryMsg.kind === 'critical' || primaryMsg.kind === 'incomplete' ? 'alert' : 'status'} className={`rounded-2xl px-3.5 py-2 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border ${primaryMsg.kind === 'critical' ? 'bg-rose-950/75 border-rose-300/60 text-rose-50' : primaryMsg.kind === 'incomplete' ? 'bg-amber-950/60 border-amber-300/60 text-amber-50' : 'bg-black/25 border-white/20 text-emerald-50'}`}>
          <div className="font-bold flex items-start sm:items-center gap-2 leading-snug min-w-0">
            {primaryMsg.kind === 'critical' ? <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" /> : primaryMsg.kind === 'incomplete' ? <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" /> : primaryMsg.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" /> : <Info className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />}
            <span>{primaryMsg.text}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenGuideTopic && primaryMsg.hasMoreDetails && <button type="button" onClick={() => onOpenGuideTopic('details')} className="font-extrabold underline text-emerald-200 hover:text-white cursor-pointer">Ver detalhes no Guia Técnico</button>}
            {primaryMsg.canSwitchToQuickManual && onSwitchToQuickManual && <button type="button" onClick={onSwitchToQuickManual} className="px-2.5 py-1 rounded-lg bg-white text-slate-950 font-extrabold cursor-pointer">Mudar para Rápida (Manual)</button>}
          </div>
        </div>
      )}
    </section>
  );
};
