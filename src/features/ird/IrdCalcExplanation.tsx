import React from 'react';
import { Info, BookOpen } from 'lucide-react';
import type { IrdAssessmentLevelSnapshot } from './irdOriginTypes.ts';
import type { IrdFallbackFlagCode, IrdInput } from './irdTypes.ts';
import type { IrdGuideTopicId } from './irdGuideSections.ts';
import { formatIrdFallbackFlagPt } from './irdHistoryTraceReader.ts';
import { buildIrdTransparencyNotes } from './irdExplanationNotes.ts';

interface IrdCalcExplanationProps {
  readonly heightModeLabelPt?: string | null;
  readonly airAssistNotePt?: string | null;
  readonly levelNotesPt?: readonly string[];
  readonly fallbackFlags?: readonly IrdFallbackFlagCode[];
  readonly assessmentLevelSnapshot?: IrdAssessmentLevelSnapshot | null;
  readonly isCalculated: boolean;
  readonly irdInput?: IrdInput;
  readonly hasCatalogNozzle?: boolean;
  readonly dv10UsedUm?: number | null;
  readonly hasCertifiedReduction?: boolean;
  readonly onOpenGuideTopic?: (topic: IrdGuideTopicId) => void;
}

export const IrdCalcExplanation: React.FC<IrdCalcExplanationProps> = ({
  heightModeLabelPt, airAssistNotePt, levelNotesPt = [], fallbackFlags,
  assessmentLevelSnapshot, isCalculated, irdInput, hasCatalogNozzle, dv10UsedUm, hasCertifiedReduction, onOpenGuideTopic
}) => {
  const { saturationNotesPt, infoOnlyNotesPt } = buildIrdTransparencyNotes({
    irdInput, hasCatalogNozzle, dv10UsedUm, hasCertifiedReduction
  });

  return (
    <details open className="rounded-2xl bg-black/20 border border-white/15 px-3.5 py-2.5 text-xs text-emerald-50 space-y-1.5">
      <summary className="cursor-pointer font-extrabold text-emerald-100 inline-flex items-center gap-1.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
        <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Explicação do cálculo e premissas</span>
      </summary>
      <div className="pt-1.5 space-y-1 text-[11px] leading-relaxed border-t border-white/10">
        <p><strong>Altura prática escolhida:</strong> {heightModeLabelPt || 'Não caracterizada'}</p>
        <p><strong>Assistência de ar:</strong> {airAssistNotePt || 'Não especificada'}</p>
        <p><strong>Estrutura do índice:</strong> Meteorologia (35%) · Espectro (30%) · Operação (20%) · Exposição (15%) · sem premissas ocultas ou risco nulo.</p>
        {assessmentLevelSnapshot === 'quick_partial' && (
          <p>• Nível 2 parcial: cálculo concluído com as 3 variáveis obrigatórias e premissas conservadoras no que não foi especificado.</p>
        )}
        {levelNotesPt.map((note, idx) => <p key={`ln-${idx}`}>• {note}</p>)}
        {saturationNotesPt.map((note, idx) => <p key={`sat-${idx}`}>• {note}</p>)}
        {infoOnlyNotesPt.map((note, idx) => <p key={`inf-${idx}`}>• {note}</p>)}
        {fallbackFlags && fallbackFlags.length > 0 ? (
          <p><strong>Fallbacks / precauções ativas:</strong> {fallbackFlags.map(formatIrdFallbackFlagPt).join(' · ')}</p>
        ) : (
          <p><strong>Fallbacks ativos:</strong> {isCalculated ? 'Nenhum fallback adicional acionado.' : 'Cálculo bloqueado por falta de dados obrigatórios (sem assumir valores por omissão).'}</p>
        )}
        {onOpenGuideTopic && (
          <button type="button" onClick={() => onOpenGuideTopic('assumptions')} aria-label="Saber mais sobre premissas e limitações" className="mt-1 inline-flex items-center gap-1 font-extrabold text-emerald-200 underline cursor-pointer">
            <BookOpen className="w-3 h-3" aria-hidden="true" /><span>Saber mais</span>
          </button>
        )}
      </div>
    </details>
  );
};
