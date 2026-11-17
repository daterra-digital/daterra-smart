import type { ActiveIrdResolvedContext } from './irdContextResolver.ts';
import type { IrdNozzleBlockState, IrdCultureBlockState, IrdEvaluationLevel } from './irdOriginTypes.ts';
import type { IrdResult } from './irdTypes.ts';
import type { DriftReadingEvaluation } from '../weather/utils/weatherDriftTypes.ts';

export interface IrdPreSaveSummaryData {
  readonly providedPt: readonly string[];
  readonly missingPt: readonly string[];
  readonly assumptionsPt: readonly string[];
  readonly criticalAlertsPt: readonly string[];
}

export function buildPreSaveSummary(params: {
  readonly evaluationLevel: IrdEvaluationLevel;
  readonly ctx: ActiveIrdResolvedContext;
  readonly result: IrdResult | null;
  readonly weatherEval?: DriftReadingEvaluation | null;
  readonly weatherSourceLabel?: string;
  readonly nozzle: IrdNozzleBlockState;
  readonly culture: IrdCultureBlockState;
  readonly missingOpFields: readonly string[];
}): IrdPreSaveSummaryData | null {
  const { evaluationLevel, ctx, result, weatherEval, weatherSourceLabel, nozzle, culture, missingOpFields } = params;
  if (evaluationLevel === 'level1_meteo') return null;

  const { irdInput, catalogNozzle, blockingGapsPt, activeAirAssistStatus } = ctx;
  const providedPt: string[] = [];
  if (weatherEval?.status === 'VALID') providedPt.push(`Meteorologia (${weatherSourceLabel || 'ativa'})`);
  if (typeof irdInput.nozzle.workingPressureBar === 'number') providedPt.push(`Pressão ${irdInput.nozzle.workingPressureBar} bar`);
  if (typeof irdInput.operation.travelSpeedKmh === 'number') providedPt.push(`Velocidade ${irdInput.operation.travelSpeedKmh} km/h`);
  if (typeof irdInput.operation.boomOrReleaseHeightM === 'number') providedPt.push(`Altura ${irdInput.operation.boomOrReleaseHeightM} m`);
  if (catalogNozzle) providedPt.push(`Bico ${catalogNozzle.brand} ${catalogNozzle.modelNorm}`);
  if (typeof irdInput.exposure.distanceToSensitiveAreaM === 'number') providedPt.push(`Distância ${irdInput.exposure.distanceToSensitiveAreaM} m`);
  if (evaluationLevel === 'level2_quick' && culture.manualLabel.trim()) providedPt.push(`Parcela: ${culture.manualLabel.trim()}`);
  if (nozzle.certifiedReduction.status === 'documented') providedPt.push('Redução certificada (rastreabilidade)');

  const missingPt: string[] = [];
  if (weatherEval?.status !== 'VALID') missingPt.push('meteorologia válida');
  for (const op of missingOpFields) if (!missingPt.includes(op)) missingPt.push(op);
  if (!catalogNozzle && irdInput.nozzle.measuredDv10Um == null && irdInput.nozzle.representativeDropletDiameterUm == null) {
    missingPt.push('bico ou diâmetro de gota');
  }
  if (irdInput.exposure.distanceToSensitiveAreaM == null) {
    missingPt.push(evaluationLevel === 'level3_profiles' ? 'exposição diária (não existente nos perfis)' : 'distância à zona sensível');
  }

  const assumptionsPt: string[] = [];
  if (result?.status === 'CALCULATED') {
    if (result.fallbackFlags.includes('NOZZLE_CATALOG_DATA_MISSING_USED_CONSERVATIVE_F')) {
      assumptionsPt.push('Sem bico/gota: aplicado fallback conservador classe F.');
    }
    if (result.fallbackFlags.includes('BUFFER_DISTANCE_UNCONFIRMED_CONSERVATIVE')) {
      assumptionsPt.push(
        evaluationLevel === 'level3_profiles'
          ? 'Exposição conservadora automática no Modo Perfis (sem dados da aplicação do dia).'
          : 'Distância não confirmada: aplicada penalização conservadora.'
      );
    }
  } else if (evaluationLevel === 'level3_profiles') {
    assumptionsPt.push('Modo Perfis assume exposição conservadora até evolução futura.');
  }
  if (activeAirAssistStatus === 'unknown') assumptionsPt.push('Assistência de ar desconhecida (conservador · distinto de Não).');
  if (nozzle.certifiedReduction.status === 'documented') assumptionsPt.push('Redução certificada guardada apenas como evidência documental (0% efeito no score).');

  const criticalAlertsPt: string[] = [...blockingGapsPt];
  if (result) {
    for (const b of result.blocks) if (!criticalAlertsPt.includes(b.messagePt)) criticalAlertsPt.push(b.messagePt);
    if (result.status === 'CALCULATED') {
      for (const w of result.warnings) {
        if (w.severity !== 'info' && !criticalAlertsPt.includes(w.messagePt)) criticalAlertsPt.push(w.messagePt);
      }
    }
  }

  return { providedPt, missingPt, assumptionsPt, criticalAlertsPt };
}
