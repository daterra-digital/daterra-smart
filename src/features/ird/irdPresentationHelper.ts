import type { DriftReadingEvaluation } from '../weather/utils/weatherDriftTypes.ts';
import type { IrdAssessmentLevelSnapshot, IrdEvaluationLevel } from './irdOriginTypes.ts';
import type { IrdAssessmentResult, IrdLegalBlock, IrdResult, IrdRiskClass } from './irdTypes.ts';

export interface IrdPrimaryMessage {
  readonly kind: 'incomplete' | 'critical' | 'partial' | 'warning' | 'ok';
  readonly text: string;
  readonly hasMoreDetails: boolean;
  readonly canSwitchToQuickManual?: boolean;
}

export interface IrdSaveAvailability {
  readonly canSave: boolean;
  readonly reason: string | null;
}

const DISPLAY_RISK_LABELS: Readonly<Record<IrdRiskClass, string>> = {
  BAIXO: 'Risco Baixo',
  MODERADO: 'Risco Moderado',
  ELEVADO: 'Risco Elevado',
  CRITICO_BLOQUEADO: 'Risco Crítico'
};

export function getIrdDisplayRiskLabel(riskClass: IrdRiskClass): string {
  return DISPLAY_RISK_LABELS[riskClass];
}

export function getIrdModeDisplayName(
  evaluationLevel: IrdEvaluationLevel,
  snapshot?: IrdAssessmentLevelSnapshot | null
): string {
  if (evaluationLevel === 'level1_meteo') return '1. Só Meteorologia';
  if (evaluationLevel === 'level3_profiles' || snapshot === 'detailed_profiles') return '3. Detalhada (Perfis)';
  return '2. Rápida (Manual)';
}

export function isIrdPartialAssessment(
  result: IrdResult | null,
  snapshot?: IrdAssessmentLevelSnapshot | null
): boolean {
  if (!result || result.status !== 'CALCULATED') return false;
  return (
    snapshot === 'quick_partial' ||
    result.fallbackFlags.includes('NOZZLE_CATALOG_DATA_MISSING_USED_CONSERVATIVE_F') ||
    result.fallbackFlags.includes('BUFFER_DISTANCE_UNCONFIRMED_CONSERVATIVE')
  );
}

function formatCriticalCausePt(block: IrdLegalBlock): string {
  switch (block.code) {
    case 'ACTIVE_RAIN_WASH_BLOCK':
      return 'Condições inadequadas para pulverizar — precipitação acima do limite do índice.';
    case 'EXCESSIVE_GUST_BLOCK':
      return 'Condições inadequadas para pulverizar — rajadas acima do limite do índice.';
    case 'EXCESSIVE_WIND_BLOCK':
      return 'Condições inadequadas para pulverizar — vento acima do limite do índice.';
    case 'CRITICAL_DELTA_T_BLOCK':
      return 'Condições inadequadas para pulverizar — Delta T acima do limite de evaporação crítica.';
    case 'EXTREME_OVERPRESSURE_BLOCK':
      return 'Condições inadequadas para pulverizar — pressão muito acima da recomendada para o bico.';
    case 'LEGAL_LABEL_BUFFER_VIOLATION':
      return 'Condições inadequadas — distância abaixo da zona tampão mínima do rótulo.';
    default:
      return `Condições inadequadas para pulverizar — ${block.messagePt}`;
  }
}

function summarizeMissingData(
  evaluationLevel: IrdEvaluationLevel,
  weatherEval: DriftReadingEvaluation | null | undefined,
  result: IrdResult | null,
  blockingGapsPt: readonly string[],
  missingOpFields: readonly string[]
): IrdPrimaryMessage {
  const weatherInvalid = weatherEval != null ? weatherEval.status !== 'VALID' : false;
  const resultMissing = result?.status === 'FAIL_CLOSED_INCOMPLETE' ? result.missingOrInvalidFields : [];
  const hasWeatherGap =
    weatherInvalid ||
    resultMissing.some((f) => /vento|rajada|temperatura|humidade|precipita|meteorol/i.test(f));

  if (evaluationLevel === 'level1_meteo' || hasWeatherGap) {
    return {
      kind: 'incomplete',
      text: 'Preencha vento, rajadas, temperatura e humidade para avaliar.',
      hasMoreDetails: blockingGapsPt.length > 0 || resultMissing.length > 1
    };
  }

  const allGaps = blockingGapsPt.length > 0 ? blockingGapsPt : missingOpFields.length > 0 ? missingOpFields : resultMissing;
  if (allGaps.length > 0) {
    const first = allGaps[0].replace(/^Calibração:\s*/i, '').replace(/\.$/, '');
    const extra = allGaps.length > 1 ? ` (+${allGaps.length - 1} por preencher)` : '';
    return {
      kind: 'incomplete',
      text: `Avaliação indisponível — ${first}${extra}.`,
      hasMoreDetails: true,
      canSwitchToQuickManual: evaluationLevel === 'level3_profiles'
    };
  }

  return {
    kind: 'incomplete',
    text: 'Preencha os dados operacionais obrigatórios para avaliar.',
    hasMoreDetails: false,
    canSwitchToQuickManual: evaluationLevel === 'level3_profiles'
  };
}

function summarizePartialCause(result: IrdAssessmentResult, evaluationLevel: IrdEvaluationLevel): string {
  const flags = new Set(result.fallbackFlags);
  const noNozzle = flags.has('NOZZLE_CATALOG_DATA_MISSING_USED_CONSERVATIVE_F');
  const noBuffer = flags.has('BUFFER_DISTANCE_UNCONFIRMED_CONSERVATIVE');

  if (evaluationLevel === 'level3_profiles' && noBuffer) {
    return noNozzle
      ? 'Avaliação parcial — faltam dados do bico e exposição em modo conservador.'
      : 'Avaliação parcial — exposição em modo conservador sem distância do dia.';
  }
  if (noNozzle && noBuffer) return 'Avaliação parcial — faltam dados do bico e zona sensível.';
  if (noNozzle) return 'Avaliação parcial — faltam dados do bico.';
  if (noBuffer) return 'Avaliação parcial — distância a zona sensível não confirmada.';
  return 'Avaliação parcial com premissas conservadoras.';
}

export function buildIrdPrimaryMessage(params: {
  evaluationLevel: IrdEvaluationLevel;
  assessmentLevelSnapshot?: IrdAssessmentLevelSnapshot | null;
  result: IrdResult | null;
  weatherEval?: DriftReadingEvaluation | null;
  weatherSummary?: { readonly isStaleCache: boolean; readonly isLegacyCache?: boolean } | null;
  blockingGapsPt?: readonly string[];
  missingOpFields?: readonly string[];
}): IrdPrimaryMessage {
  const { evaluationLevel, assessmentLevelSnapshot, result, weatherEval, weatherSummary, blockingGapsPt = [], missingOpFields = [] } = params;

  if (evaluationLevel === 'level1_meteo') {
    if (!weatherEval || weatherEval.status !== 'VALID') {
      return summarizeMissingData(evaluationLevel, weatherEval, null, blockingGapsPt, missingOpFields);
    }
    if (weatherEval.band === 'CRITICO') {
      return { kind: 'critical', text: `Condições meteorológicas críticas — ${weatherEval.dominantFactorPt}`, hasMoreDetails: true };
    }
    if (weatherSummary?.isLegacyCache || weatherSummary?.isStaleCache) {
      return {
        kind: 'warning',
        text: weatherSummary.isLegacyCache
          ? 'Leitura antiga guardada localmente: confirme o vento no campo.'
          : 'Previsão com mais de 20 min: confirme o vento no campo.',
        hasMoreDetails: false
      };
    }
    return { kind: 'ok', text: '', hasMoreDetails: false };
  }

  if (!result || result.status !== 'CALCULATED' || blockingGapsPt.length > 0) {
    return summarizeMissingData(evaluationLevel, weatherEval, result, blockingGapsPt, missingOpFields);
  }

  if (result.blocks.length > 0) {
    const primary = formatCriticalCausePt(result.blocks[0]);
    const extraCount = result.blocks.length - 1;
    const text = extraCount > 0 ? `${primary} (+${extraCount} ${extraCount === 1 ? 'outra condição crítica' : 'outras condições críticas'})` : primary;
    return { kind: 'critical', text, hasMoreDetails: true };
  }

  if (isIrdPartialAssessment(result, assessmentLevelSnapshot)) {
    return { kind: 'partial', text: summarizePartialCause(result, evaluationLevel), hasMoreDetails: true };
  }

  const notableWarning = result.warnings.find(
    (w) => w.severity === 'warning' && !w.code.startsWith('LABEL_SUPREMACY_') && w.code !== 'NOT_ISO_22866_CERTIFIED'
  );
  return notableWarning ? { kind: 'warning', text: notableWarning.messagePt, hasMoreDetails: true } : { kind: 'ok', text: '', hasMoreDetails: false };
}

export function buildIrdSaveAvailability(
  effectiveUserId: string | null,
  evaluationLevel: IrdEvaluationLevel,
  result: IrdResult | null,
  blockingGapsPt: readonly string[] = []
): IrdSaveAvailability {
  if (evaluationLevel === 'level1_meteo') return { canSave: false, reason: 'Escolha Rápida ou Detalhada para guardar.' };
  if (!effectiveUserId) return { canSave: false, reason: 'Inicie sessão para guardar a avaliação.' };
  if (!result || result.status !== 'CALCULATED' || blockingGapsPt.length > 0) {
    return { canSave: false, reason: 'Preencha os dados em falta para guardar.' };
  }
  return { canSave: true, reason: null };
}
