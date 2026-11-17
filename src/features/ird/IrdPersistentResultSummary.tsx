import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { DriftReadingEvaluation } from '../weather/utils/weatherDriftTypes.ts';
import type { IrdAssessmentLevelSnapshot, IrdEvaluationLevel } from './irdOriginTypes.ts';
import type { IrdPrimaryMessage } from './irdPresentationHelper.ts';
import { getIrdDisplayRiskLabel, getIrdModeDisplayName } from './irdPresentationHelper.ts';
import type { IrdResult, IrdRiskClass } from './irdTypes.ts';

interface IrdPersistentResultSummaryProps {
  readonly evaluationLevel: IrdEvaluationLevel;
  readonly assessmentLevelSnapshot?: IrdAssessmentLevelSnapshot | null;
  readonly result: IrdResult | null;
  readonly weatherEval?: DriftReadingEvaluation | null;
  readonly blockingGapsCount: number;
  readonly primaryMsg: IrdPrimaryMessage;
  readonly isPartial: boolean;
  readonly visibleOnScroll: boolean;
  readonly keypadEditingLabel?: string | null;
}

const BADGE_CSS: Record<IrdRiskClass, string> = {
  BAIXO: 'bg-emerald-300 text-slate-950',
  MODERADO: 'bg-amber-300 text-slate-950',
  ELEVADO: 'bg-orange-400 text-slate-950',
  CRITICO_BLOQUEADO: 'bg-rose-500 text-white'
};

function useViewportHeight(): number {
  const [height, setHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? (window.visualViewport?.height ?? window.innerHeight) : 800
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const read = () => setHeight(window.visualViewport?.height ?? window.innerHeight);
    read();
    window.addEventListener('resize', read);
    window.visualViewport?.addEventListener('resize', read);
    return () => {
      window.removeEventListener('resize', read);
      window.visualViewport?.removeEventListener('resize', read);
    };
  }, []);

  return height;
}

export const IrdPersistentResultSummary: React.FC<IrdPersistentResultSummaryProps> = ({
  evaluationLevel,
  assessmentLevelSnapshot,
  result,
  weatherEval,
  blockingGapsCount,
  primaryMsg,
  isPartial,
  visibleOnScroll,
  keypadEditingLabel
}) => {
  const viewportHeight = useViewportHeight();
  const isKeypadMode = Boolean(keypadEditingLabel);
  const canShowAboveKeypad = viewportHeight >= 580;
  const isCompactViewport = viewportHeight < 520;

  if (isKeypadMode && !canShowAboveKeypad) return null;
  if (!isKeypadMode && !visibleOnScroll) return null;

  const isL1 = evaluationLevel === 'level1_meteo';
  const l1Valid = isL1 && weatherEval?.status === 'VALID';
  const isCalculated = !isL1 && Boolean(result?.status === 'CALCULATED' && blockingGapsCount === 0);

  const displayScore = isL1
    ? (l1Valid ? weatherEval?.score : '—')
    : (isCalculated && result ? result.irdScore : '—');

  const displayBadge = isL1
    ? (l1Valid && weatherEval ? weatherEval.bandLabelPt : 'Sem leitura')
    : (isCalculated && result ? getIrdDisplayRiskLabel(result.irdClass) : 'Indisponível');

  const badgeTone = isL1
    ? (l1Valid && weatherEval?.band
        ? BADGE_CSS[weatherEval.band === 'CRITICO' ? 'CRITICO_BLOQUEADO' : weatherEval.band]
        : 'bg-slate-200 text-slate-900')
    : (isCalculated && result ? BADGE_CSS[result.irdClass] : 'bg-slate-200 text-slate-900');

  const scaleLabel = isL1 ? '10–100' : '1–100';
  const positionClass = isKeypadMode
    ? 'fixed top-2 inset-x-3 z-[55] max-w-lg mx-auto pointer-events-none'
    : 'fixed top-[5.25rem] inset-x-3 sm:inset-x-6 lg:inset-x-8 max-w-7xl mx-auto z-25 pointer-events-none';

  return (
    <aside
      aria-label="Resumo persistente do Índice de Risco de Deriva"
      className={`${positionClass} bg-[#114037]/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-emerald-400/35 ${isCompactViewport ? 'px-3 py-1.5' : 'px-3.5 sm:px-5 py-2.5'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`font-mono-numbers font-black leading-none shrink-0 ${isCompactViewport ? 'text-lg' : 'text-2xl'}`}>
            {displayScore}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${badgeTone}`}>
            {displayBadge}
          </span>
          {isPartial && isCalculated && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-slate-950 text-[10px] font-bold shrink-0">
              Parcial
            </span>
          )}
          <span className="text-[11px] text-emerald-200 font-semibold truncate">
            {getIrdModeDisplayName(evaluationLevel, assessmentLevelSnapshot)} · {scaleLabel}
          </span>
        </div>

        {!isCompactViewport && primaryMsg.text && (
          <p className="text-[11px] font-semibold text-emerald-50 truncate flex items-center gap-1.5 sm:max-w-[52%]">
            {primaryMsg.kind === 'critical' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0" aria-hidden="true" />
            ) : primaryMsg.kind === 'incomplete' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
            ) : (
              <Info className="w-3.5 h-3.5 text-emerald-200 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{primaryMsg.text}</span>
          </p>
        )}
      </div>

      {keypadEditingLabel && (
        <div className="mt-1.5 pt-1 border-t border-white/15 text-[10px] text-emerald-100 flex items-center justify-between gap-2">
          <span className="truncate">A editar: <strong>{keypadEditingLabel}</strong></span>
          <span className="shrink-0 font-semibold text-emerald-200">Confirme com OK para recalcular</span>
        </div>
      )}
    </aside>
  );
};
