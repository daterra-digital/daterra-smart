// src/features/weather/utils/irdOperationalThresholds.ts
import type { HourlyForecastItem, SprayDecisionLevel, SprayEvaluation } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { assessWeatherDriftReading } from './weatherDriftEvaluator.ts';

export type IrdBandTier = 'unknown' | 'low' | 'moderate' | 'high' | 'extreme';

export interface IrdBandInfo {
  readonly label: string;
  readonly shortLabel: string;
  readonly tier: IrdBandTier;
  readonly cls: string;
}

export function resolveAcceptableIrdLimit(sensitiveZoneDistanceM?: number | null): number {
  if (typeof sensitiveZoneDistanceM === 'number' && Number.isFinite(sensitiveZoneDistanceM)) {
    if (sensitiveZoneDistanceM <= 15) return 30;
    if (sensitiveZoneDistanceM <= 30) return 50;
  }
  return 75;
}

export function getIrdOperationalBand(pct: number | null | undefined): IrdBandInfo {
  if (pct === null || pct === undefined || !Number.isFinite(pct)) {
    return { label: 'N/D', shortLabel: 'N/D', tier: 'unknown', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
  if (pct <= 40) return { label: 'Risco Baixo', shortLabel: 'Baixo', tier: 'low', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (pct <= 75) return { label: 'Risco Moderado', shortLabel: 'Moderado', tier: 'moderate', cls: 'bg-amber-50 text-amber-900 border-amber-200' };
  if (pct <= 100) return { label: 'Risco Elevado', shortLabel: 'Elevado', tier: 'high', cls: 'bg-orange-50 text-orange-900 border-orange-200' };
  return { label: 'Risco Extremo', shortLabel: 'Extremo', tier: 'extreme', cls: 'bg-rose-50 text-rose-800 border-rose-200' };
}

export function computeContextScaleFactor(context?: ActiveMachineContext | null): number {
  const base = context?.baseMeteoScore;
  if (context?.calibrationId && context.combinedIrdPct != null && base) {
    return context.combinedIrdPct / Math.max(1, base);
  }
  if (context?.parcelRiskPct != null && base) {
    return context.parcelRiskPct / Math.max(1, base);
  }
  return 1;
}

export function evaluateHourWithProfileContext(
  rawEval: SprayEvaluation,
  hour: HourlyForecastItem,
  context?: ActiveMachineContext | null
): { evaluation: SprayEvaluation; irdPct: number | null; acceptableLimitPct: number } {
  const acceptableLimitPct = context?.acceptableIrdLimitPct ?? 75;
  const evalDrift = assessWeatherDriftReading(hour);
  const scale = computeContextScaleFactor(context);
  const minScore = context?.calibrationId ? 10 : 5;
  const irdPct = evalDrift.status === 'VALID' && evalDrift.score !== null
    ? Math.round(Math.min(200, Math.max(minScore, evalDrift.score * scale)))
    : null;

  let level: SprayDecisionLevel = rawEval.level;
  let badgeLabel = rawEval.badgeLabel;
  let title = rawEval.title;
  let reason = rawEval.reason;

  if (context?.isUavEquipment && hour.windSpeedKmh > 15.0) {
    level = 'unfavorable';
    badgeLabel = 'Vento UAV > 15 km/h';
    title = 'Bloqueio DL 91/2016';
    reason = 'Vento superior a 15,0 km/h interdita operação com Drone UAV.';
  } else if (irdPct !== null && level !== 'unfavorable') {
    if (irdPct > 100) {
      level = 'unfavorable';
      badgeLabel = 'Risco Extremo';
      title = 'Adiar — Risco Extremo (IRD > 100%)';
      reason = 'Índice de risco de deriva acima de 100% exige adiamento.';
    } else if (acceptableLimitPct === 30 && irdPct > 50) {
      level = 'unfavorable';
      badgeLabel = 'Zona ≤ 15 m';
      title = 'Adiar — Zona Sensível (≤ 15 m)';
      reason = 'IRD acima de 50% junto a zona sensível (≤ 15 m).';
    } else if (acceptableLimitPct === 30 && irdPct > 30 && level === 'optimal') {
      level = 'marginal';
      badgeLabel = 'SDRT 75–90%';
      title = 'Atenção — Exige SDRT 75–90%';
      reason = 'Entre 31% e 50% a ≤ 15 m exige bicos SDRT 75–90%.';
    } else if (acceptableLimitPct !== 30 && irdPct > acceptableLimitPct) {
      level = 'unfavorable';
      badgeLabel = `IRD > ${acceptableLimitPct}%`;
      title = `Adiar — Acima do Limiar (${acceptableLimitPct}%)`;
      reason = `IRD excede o limiar máximo aceitável de ${acceptableLimitPct}% da parcela.`;
    } else if (irdPct >= 60 && irdPct <= 75 && level === 'optimal') {
      level = 'marginal';
      badgeLabel = 'Mitigar Deriva';
      title = 'Atenção — Risco Moderado (60–75%)';
      reason = 'Aplicar medidas corretivas imediatas de redução de deriva.';
    }
  }

  return {
    evaluation: { ...rawEval, level, badgeLabel, title, reason },
    irdPct,
    acceptableLimitPct
  };
}
