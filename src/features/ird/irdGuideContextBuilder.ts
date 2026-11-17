import type { DriftReadingEvaluation } from '../weather/utils/weatherDriftTypes.ts';
import type { ActiveIrdResolvedContext } from './irdContextResolver.ts';
import type { IrdEvaluationLevel, IrdNozzleBlockState } from './irdOriginTypes.ts';
import { buildIrdTransparencyNotes } from './irdExplanationNotes.ts';
import type { IrdPreSaveSummaryData } from './irdPreSaveBuilder.ts';
import type { IrdFallbackFlagCode, IrdResult } from './irdTypes.ts';

export interface IrdGuideContextData {
  readonly providedItemsPt: readonly string[];
  readonly missingItemsPt: readonly string[];
  readonly criticalCausesPt: readonly string[];
  readonly assumptionsPt: readonly string[];
  readonly limitationsAndSaturationsPt: readonly string[];
}

const FALLBACK_LABELS_PT: Readonly<Partial<Record<IrdFallbackFlagCode, string>>> = {
  NOZZLE_CATALOG_DATA_MISSING_USED_CONSERVATIVE_F: 'Sem bico no catálogo: aplicada classe conservadora F.',
  BUFFER_DISTANCE_UNCONFIRMED_CONSERVATIVE: 'Distância a zona sensível não confirmada: aplicada margem conservadora.',
  USER_DROPLET_MEASUREMENT_INVALID_IGNORED: 'Medição manual de gota inválida ignorada.',
  NOZZLE_UNDERPRESSURE_WARNING: 'Pressão abaixo da faixa recomendada do bico.',
  NOZZLE_OVERPRESSURE_PENALTY: 'Pressão acima da faixa recomendada do bico.',
  WEATHER_CACHE_STALE_CONFIRM_IN_FIELD: 'Leitura meteorológica com mais de 20 min: confirmar no campo.',
  CALM_WIND_THERMAL_INVERSION_CAUTION: 'Vento fraco com Delta T > 6 °C: atenção a possível inversão térmica.',
  LOW_DELTA_T_RUNOFF_CAUTION: 'Delta T < 2 °C e humidade elevada: secagem lenta na folhagem.'
};

function dedupe(items: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const clean = raw.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
  }
  return out;
}

export function buildIrdGuideContext(params: {
  evaluationLevel: IrdEvaluationLevel;
  ctx: ActiveIrdResolvedContext;
  result: IrdResult | null;
  weatherEval: DriftReadingEvaluation | null;
  preSaveSummary: IrdPreSaveSummaryData | null;
  heightModeLabelPt?: string | null;
  airAssistNotePt?: string | null;
  nozzleState: IrdNozzleBlockState;
  hasCatalogNozzle: boolean;
}): IrdGuideContextData | null {
  const {
    evaluationLevel,
    ctx,
    result,
    weatherEval,
    preSaveSummary,
    heightModeLabelPt,
    airAssistNotePt,
    nozzleState,
    hasCatalogNozzle
  } = params;

  const isCalculated = Boolean(result && result.status === 'CALCULATED' && ctx.blockingGapsPt.length === 0);
  const providedItemsPt: string[] = preSaveSummary ? [...preSaveSummary.providedPt] : [];
  if (heightModeLabelPt) providedItemsPt.push(`Altura: ${heightModeLabelPt}`);
  if (airAssistNotePt) providedItemsPt.push(`Assistência de ar: ${airAssistNotePt}`);

  const missingItemsPt: string[] = [];
  if (evaluationLevel === 'level1_meteo' && weatherEval?.status !== 'VALID') {
    missingItemsPt.push(weatherEval?.dominantFactorPt || 'Dados meteorológicos essenciais incompletos.');
  }
  if (preSaveSummary) {
    missingItemsPt.push(...preSaveSummary.missingPt);
  } else {
    missingItemsPt.push(...ctx.blockingGapsPt);
  }

  const criticalCausesPt: string[] = [];
  if (evaluationLevel === 'level1_meteo' && weatherEval?.status === 'VALID' && weatherEval.band === 'CRITICO') {
    criticalCausesPt.push(weatherEval.dominantFactorPt);
  }
  if (result?.blocks.length) {
    for (const block of result.blocks) {
      criticalCausesPt.push(block.messagePt);
    }
  }

  const fallbackAssumptionsPt =
    isCalculated && result?.status === 'CALCULATED'
      ? result.fallbackFlags
          .map((code) => FALLBACK_LABELS_PT[code])
          .filter((msg): msg is string => Boolean(msg))
      : [];

  const assumptionsPt: string[] = [
    ...(preSaveSummary?.assumptionsPt ?? []),
    ...fallbackAssumptionsPt,
    ...ctx.levelNotesPt
  ];

  const transparencyNotes = buildIrdTransparencyNotes({
    irdInput: ctx.irdInput,
    hasCatalogNozzle,
    dv10UsedUm: isCalculated && result?.status === 'CALCULATED' ? result.derived.dv10UsedUm : null,
    hasCertifiedReduction: nozzleState.certifiedReduction.status === 'documented'
  });

  const operationalWarningsPt =
    isCalculated && result?.status === 'CALCULATED'
      ? result.warnings
          .filter(
            (w) =>
              w.severity === 'warning' &&
              !w.code.startsWith('LABEL_SUPREMACY_') &&
              w.code !== 'NOT_ISO_22866_CERTIFIED'
          )
          .map((w) => w.messagePt)
      : [];

  const limitationsAndSaturationsPt = dedupe([
    ...transparencyNotes.saturationNotesPt,
    ...transparencyNotes.infoOnlyNotesPt,
    ...operationalWarningsPt
  ]);

  const finalProvided = dedupe(providedItemsPt);
  const finalMissing = dedupe(missingItemsPt);
  const finalCritical = dedupe(criticalCausesPt);
  const finalAssumptions = dedupe(assumptionsPt);

  if (
    finalProvided.length === 0 &&
    finalMissing.length === 0 &&
    finalCritical.length === 0 &&
    finalAssumptions.length === 0 &&
    limitationsAndSaturationsPt.length === 0
  ) {
    return null;
  }

  return {
    providedItemsPt: finalProvided,
    missingItemsPt: finalMissing,
    criticalCausesPt: finalCritical,
    assumptionsPt: finalAssumptions,
    limitationsAndSaturationsPt
  };
}
