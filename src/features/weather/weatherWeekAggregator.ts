// src/features/weather/weatherWeekAggregator.ts
import type { HourlyForecastItem, DailyForecastItem, SprayDecisionLevel } from './types.ts';
import { evaluateSprayWindow } from './weatherCalculations.ts';
import { getEffectiveDateIso, getEffectiveNow } from './services/weatherTimeService.ts';
import { evaluateHourWithProfileContext } from './utils/irdOperationalThresholds.ts';

export interface ActiveMachineContext {
  cultureId?: number | null; cultureName?: string | null; equipmentId?: number | null; equipmentName?: string | null;
  equipmentTypeLabel?: string | null; hasAirSleeve?: boolean; nozzleId?: number | null; nozzleName?: string | null;
  nozzleType?: string | null; calibrationId?: number | string | null; calibrationName?: string | null;
  workingPressureBar?: number | null; dropletSizeUm?: number | null; combinedIrdPct?: number | null;
  parcelRiskPct?: number | null; baseMeteoScore?: number | null; acceptableIrdLimitPct?: number | null; isUavEquipment?: boolean;
}

export interface DaySprayWindowSummary {
  dateIso: string; dayLabel: string; level: SprayDecisionLevel; badgeLabel: string; bestWindowText: string;
  limitingFactor: string; isWindowClosed?: boolean; maxTempC: number; minTempC: number;
  windSpeedMaxKmh: number; precipitationSumMm: number; weatherCode: number; weatherLabel: string;
}

export interface WeeklySpraySchedule {
  evaluationMode: 'reference' | 'partial' | 'complete';
  evaluationModeLabel: string;
  todayDecision: { level: SprayDecisionLevel; badgeLabel: string; title: string; reason: string };
  nextBestWindow: { available: boolean; dayLabel?: string; fullDateLabel?: string; timeRange?: string; description?: string };
  safeDays: string[];
  limitingFactorsToday: string[];
  dailyWindows: DaySprayWindowSummary[];
}

export const OPERATIONAL_START_HOUR = 6;
export const OPERATIONAL_END_HOUR = 20;

export function formatFullPortugueseDate(dateIso: string): string {
  try {
    const parts = dateIso.split('T')[0].split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${weekdays[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  } catch { return dateIso; }
}

export function getContextCompleteness(ctx?: ActiveMachineContext | null): { status: 'reference' | 'partial' | 'complete'; label: string; isComplete: boolean; missingFields: string[] } {
  if (!ctx || (!ctx.equipmentId && !ctx.nozzleId && !ctx.cultureId && !ctx.calibrationId)) {
    return { status: 'reference', label: 'Referência Meteorológica', isComplete: false, missingFields: ['Equipamento', 'Bico', 'Calibração'] };
  }
  const missing: string[] = [];
  if (!ctx.equipmentId) missing.push('Equipamento');
  if (!ctx.nozzleId) missing.push('Bico');
  if (!ctx.calibrationId && ctx.workingPressureBar == null) missing.push('Calibração/Pressão');
  const countSelected = 3 - missing.length;
  if (missing.length > 0) return { status: 'partial', label: `Contexto Parcial (${countSelected}/3)`, isComplete: false, missingFields: missing };
  return { status: 'complete', label: 'Contexto Completo (3/3)', isComplete: true, missingFields: [] };
}

export function aggregateWeeklySpraySchedule(
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  context?: ActiveMachineContext | null
): WeeklySpraySchedule {
  const completeness = getContextCompleteness(context);
  const equipmentOptions = (context && (context.equipmentId || context.nozzleId || context.calibrationId)) ? {
    nozzleType: context.nozzleType || undefined,
    hasAirSleeve: context.hasAirSleeve ?? undefined,
    workingPressureBar: context.workingPressureBar ?? undefined,
    dropletSizeUm: context.dropletSizeUm ?? undefined
  } : undefined;

  const hasProfileAdjustment = Boolean(context && (context.calibrationId || context.cultureId));
  const evaluatedHours = hourly.map(h => {
    const rawEval = evaluateSprayWindow(h.deltaT, h.windSpeedKmh, h.windGustsKmh, h.humidityPercent, h.precipitationMm, equipmentOptions);
    const sprayEvaluation = hasProfileAdjustment ? evaluateHourWithProfileContext(rawEval, h, context).evaluation : rawEval;
    return { ...h, sprayEvaluation };
  });

  const hoursByDate: Record<string, typeof evaluatedHours> = {};
  evaluatedHours.forEach(h => {
    const k = h.timeIso.split('T')[0];
    if (!hoursByDate[k]) hoursByDate[k] = [];
    hoursByDate[k].push(h);
  });

  const effectiveTodayIso = getEffectiveDateIso();
  const effectiveHour = getEffectiveNow().getHours();
  const dailyWindows: DaySprayWindowSummary[] = daily.map((d, idx) => {
    const k = d.dateIso.split('T')[0];
    const opHours = (hoursByDate[k] || []).filter(h => {
      const hNum = parseInt(h.timeFormatted.split(':')[0], 10);
      return hNum >= OPERATIONAL_START_HOUR && hNum <= OPERATIONAL_END_HOUR;
    });

    if (opHours.length === 0) {
      const isTodayEntry = k === effectiveTodayIso || (idx === 0 && (d.dayLabel || '').toLowerCase().startsWith('hoje'));
      const isClosedToday = hourly.length > 0 && isTodayEntry && (effectiveHour >= OPERATIONAL_END_HOUR || k < effectiveTodayIso);
      return {
        dateIso: d.dateIso, dayLabel: d.dayLabel, level: 'unfavorable',
        badgeLabel: isClosedToday ? 'Janela Encerrada' : 'Sem Dados',
        bestWindowText: isClosedToday ? 'Sem horas restantes hoje' : 'Sem dados horários',
        limitingFactor: isClosedToday ? 'Horário operacional 06:00–20:00 concluído' : 'Previsão horária limitada',
        isWindowClosed: isClosedToday, maxTempC: d.maxTempC, minTempC: d.minTempC,
        windSpeedMaxKmh: d.windSpeedMaxKmh, precipitationSumMm: d.precipitationSumMm, weatherCode: d.weatherCode, weatherLabel: d.weatherLabel
      };
    }

    let maxConsecutive = 0, currentConsecutive = 0;
    let bestStart: string | null = null, bestEnd: string | null = null, tempStart: string | null = null;
    let hasMarginal = false, primaryLimit = '';

    for (const h of opHours) {
      if (h.sprayEvaluation.level === 'optimal') {
        if (currentConsecutive === 0) tempStart = h.timeFormatted;
        currentConsecutive++;
        if (currentConsecutive > maxConsecutive) {
          maxConsecutive = currentConsecutive;
          bestStart = tempStart;
          bestEnd = h.timeFormatted;
        }
      } else {
        if (h.sprayEvaluation.level === 'marginal') hasMarginal = true;
        if (!primaryLimit) primaryLimit = h.sprayEvaluation.badgeLabel;
        currentConsecutive = 0;
        tempStart = null;
      }
    }

    const level: SprayDecisionLevel = maxConsecutive >= 2 ? 'optimal' : (maxConsecutive === 1 || hasMarginal ? 'marginal' : 'unfavorable');
    const badgeLabel = level === 'optimal' ? 'Ótimo' : (level === 'marginal' ? 'Atenção' : 'Adiar');
    const bestWindowText = level === 'optimal' ? `${bestStart} – ${bestEnd}` : (maxConsecutive === 1 ? `Janela curta (${bestStart})` : (hasMarginal ? 'Janela marginal sob vigilância' : 'Nenhuma janela recomendada'));

    return {
      dateIso: d.dateIso, dayLabel: d.dayLabel, level, badgeLabel, bestWindowText,
      limitingFactor: level === 'optimal' ? 'Condições favoráveis no intervalo' : (primaryLimit || 'Condições desfavoráveis'),
      maxTempC: d.maxTempC, minTempC: d.minTempC, windSpeedMaxKmh: d.windSpeedMaxKmh,
      precipitationSumMm: d.precipitationSumMm, weatherCode: d.weatherCode, weatherLabel: d.weatherLabel
    };
  });

  const firstHour = evaluatedHours[0];
  const todayDecision = {
    level: firstHour ? firstHour.sprayEvaluation.level : (dailyWindows[0]?.level || 'unfavorable'),
    badgeLabel: firstHour ? firstHour.sprayEvaluation.badgeLabel : (dailyWindows[0]?.badgeLabel || 'Adiar'),
    title: firstHour ? firstHour.sprayEvaluation.title : 'Avaliação Indisponível',
    reason: firstHour ? firstHour.sprayEvaluation.reason : 'Sem dados suficientes para avaliação imediata.'
  };

  const nextBest = dailyWindows.find(d => d.level === 'optimal');
  const nextBestWindow = nextBest ? {
    available: true,
    dayLabel: nextBest.dayLabel,
    fullDateLabel: formatFullPortugueseDate(nextBest.dateIso),
    timeRange: nextBest.bestWindowText,
    description: `Janela contínua favorável (${formatFullPortugueseDate(nextBest.dateIso)}, ${nextBest.bestWindowText}).`
  } : { available: false };

  const limitingFactorsToday: string[] = [];
  if (firstHour) {
    if (firstHour.windSpeedKmh > 14 || firstHour.windGustsKmh > 20) {
      limitingFactorsToday.push(`Vento a ${firstHour.windSpeedKmh} km/h (Rajadas: ${firstHour.windGustsKmh} km/h)`);
    }
    if (firstHour.deltaT < 2.0 && firstHour.humidityPercent > 90) {
      limitingFactorsToday.push(`Delta T ${firstHour.deltaT} °C com HR ${firstHour.humidityPercent}% — risco de escorrimento`);
    } else if (firstHour.deltaT < 2.0) {
      limitingFactorsToday.push(`Delta T baixo (${firstHour.deltaT} °C < 2.0 °C)`);
    } else if (firstHour.deltaT > 8.0) {
      limitingFactorsToday.push(`Delta T elevado (${firstHour.deltaT} °C) — evaporação rápida`);
    }
    if (firstHour.precipitationMm > 0) {
      limitingFactorsToday.push(`Precipitação ativa (${firstHour.precipitationMm} mm)`);
    }
  }

  return {
    evaluationMode: completeness.status,
    evaluationModeLabel: completeness.label,
    todayDecision,
    nextBestWindow,
    safeDays: dailyWindows.filter(d => d.level === 'optimal').map(d => d.dayLabel),
    limitingFactorsToday,
    dailyWindows
  };
}
