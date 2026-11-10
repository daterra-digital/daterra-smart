// src/features/weather/utils/sprayPresentationAdapter.ts
import type { HourlyForecastItem, SprayEvaluation, SprayDecisionLevel } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';

export interface AdaptedSprayEvaluation {
  level: SprayDecisionLevel; badgeLabel: string; title: string; reason: string;
  isHeuristicLimited: boolean; heuristicNotice?: string; limitingFactor: string;
}

export interface FavorableHoursSummary {
  hasFavorable: boolean; hoursList: string[]; displayLabel: string;
  consecutiveCount: number; detailText: string; primaryLimitation?: string;
}

export interface ContextDisplayInfo {
  modeLabel: string; isComplete: boolean; pressureLabel: string;
  hasPressure: boolean; notice?: string; cultureName?: string | null;
}

/**
 * Adapta a avaliação do motor usando condições físicas e flags, sem string matching.
 */
export function adaptSprayEvaluation(
  raw: SprayEvaluation,
  context?: ActiveMachineContext | null
): AdaptedSprayEvaluation {
  if (raw.windSpeedKmh < 2.0 && raw.deltaT > 6.0) {
    return {
      level: 'marginal', badgeLabel: 'Vento Calmo',
      title: 'Condições de vento calmo — confirmar no campo',
      reason: 'Vento praticamente nulo. Confirme no terreno a ausência de correntes imprevisíveis.',
      isHeuristicLimited: false, limitingFactor: 'Vento calmo (< 2 km/h)'
    };
  }

  const hasTol = !!(context?.hasAirSleeve || context?.nozzleType?.toLowerCase().includes('ind') || (context?.dropletSizeUm != null && context.dropletSizeUm >= 300));
  const isHeuristicLimited = hasTol && raw.level !== 'unfavorable' && (raw.windSpeedKmh > 10.0 || (raw.deltaT > 8.0 && raw.deltaT <= 10.0));

  if (isHeuristicLimited) {
    return {
      level: 'marginal', badgeLabel: 'Avaliação limitada',
      title: 'Critério atenuado por equipamento (heurística)',
      reason: `${raw.reason} (Nota: atenuação por equipamento pendente de validação técnica).`,
      isHeuristicLimited: true,
      heuristicNotice: 'Avaliação dependente de tolerância de equipamento não validada formalmente.',
      limitingFactor: raw.badgeLabel
    };
  }

  return {
    level: raw.level,
    badgeLabel: raw.level === 'optimal' ? 'Critérios Favoráveis' : raw.badgeLabel,
    title: raw.level === 'optimal' ? 'Favorável nos critérios avaliados' : raw.title,
    reason: raw.reason, isHeuristicLimited: false,
    limitingFactor: raw.level === 'optimal' ? 'Sem fatores limitantes' : raw.badgeLabel
  };
}

/**
 * Extrai os horários favoráveis reais, garantindo que horas limitadas não são promovidas.
 */
export function getFavorableSprayHours(
  evaluatedHours: Array<{ timeFormatted: string; sprayEvaluation: SprayEvaluation }>,
  contextOrStart?: ActiveMachineContext | number | null,
  startOrEnd: number = 6,
  endNum: number = 20
): FavorableHoursSummary {
  let context: ActiveMachineContext | null | undefined = null;
  let operationalStart = 6;
  let operationalEnd = 20;

  if (typeof contextOrStart === 'number') {
    operationalStart = contextOrStart;
    operationalEnd = typeof startOrEnd === 'number' ? startOrEnd : 20;
  } else {
    context = contextOrStart;
    operationalStart = typeof startOrEnd === 'number' ? startOrEnd : 6;
    operationalEnd = endNum;
  }
  const opHours = evaluatedHours.filter((h) => {
    const hNum = parseInt(h.timeFormatted.split(':')[0], 10);
    return hNum >= operationalStart && hNum <= operationalEnd;
  });

  if (!opHours.length) {
    return {
      hasFavorable: false, hoursList: [],
      displayLabel: 'Sem dados horários no intervalo operacional',
      consecutiveCount: 0, detailText: 'Intervalo operacional configurado das 06:00 às 20:00.',
      primaryLimitation: 'Sem dados'
    };
  }

  let maxConsecutive = 0, currentConsecutive = 0;
  let currentRun: string[] = [], bestRun: string[] = [];
  let firstLimitation = '', hadHeuristicLimited = false;

  for (const h of opHours) {
    const adapted = adaptSprayEvaluation(h.sprayEvaluation, context);
    if (adapted.isHeuristicLimited) hadHeuristicLimited = true;

    if (adapted.level === 'optimal') {
      currentConsecutive++;
      currentRun.push(h.timeFormatted);
      if (currentConsecutive > maxConsecutive) {
        maxConsecutive = currentConsecutive;
        bestRun = [...currentRun];
      }
    } else {
      if (!firstLimitation) firstLimitation = adapted.badgeLabel;
      currentConsecutive = 0;
      currentRun = [];
    }
  }

  if (maxConsecutive === 0) {
    return {
      hasFavorable: false, hoursList: [],
      displayLabel: hadHeuristicLimited ? 'Avaliações limitadas por equipamento' : 'Sem horários favoráveis identificados',
      consecutiveCount: 0,
      detailText: hadHeuristicLimited ? 'Critérios atendidos apenas por atenuação de equipamento não validada.' : 'Nenhum horário com critérios favoráveis no intervalo operacional.',
      primaryLimitation: firstLimitation || (hadHeuristicLimited ? 'Avaliação limitada' : 'Critérios não atendidos')
    };
  }

  const displayLabel = bestRun.length <= 2 ? bestRun.join(' e ') : `${bestRun.slice(0, -1).join(', ')} e ${bestRun[bestRun.length - 1]}`;

  return {
    hasFavorable: true, hoursList: bestRun, displayLabel,
    consecutiveCount: maxConsecutive,
    detailText: `${maxConsecutive} avaliações horárias consecutivas favoráveis`,
    primaryLimitation: firstLimitation
  };
}

/**
 * Determina o estado do contexto técnico de máquina e pressão.
 */
export function getContextDisplayInfo(ctx?: ActiveMachineContext | null): ContextDisplayInfo {
  if (!ctx || (!ctx.equipmentId && !ctx.nozzleId && !ctx.calibrationId)) {
    return {
      modeLabel: 'Modo Referência', isComplete: false, pressureLabel: 'Não aplicável', hasPressure: false,
      notice: 'Avaliação meteorológica de referência sem perfis de máquina selecionados.',
      cultureName: ctx?.cultureName || null
    };
  }

  const hasPressure = ctx.workingPressureBar != null;
  const pressureLabel = hasPressure ? `${ctx.workingPressureBar} bar` : 'Pressão desconhecida';

  if (!hasPressure) {
    return {
      modeLabel: 'Contexto Incompleto', isComplete: false, pressureLabel, hasPressure: false,
      notice: 'Pressão de trabalho não definida: parâmetros dependentes de pressão não são avaliados.',
      cultureName: ctx.cultureName || null
    };
  }

  return { modeLabel: 'Contexto Selecionado', isComplete: true, pressureLabel, hasPressure: true, cultureName: ctx.cultureName || null };
}

/**
 * Determina horas consecutivas sem chuva interrompendo em lacunas ou ausência de dados.
 */
export function getRainFreePeriod(hours: HourlyForecastItem[], startIndex: number): string | null {
  if (!hours[startIndex]) return null;
  const startHour = hours[startIndex];
  const startRain = startHour.precipitationMm;
  if (startRain == null || isNaN(startRain)) return 'Dados de precipitação ausentes nesta hora';
  if (startRain > 0.2) return 'Precipitação prevista nesta hora';

  let count = 0;
  let reason: 'rain' | 'missing' | 'gap' | 'end' = 'end';

  for (let i = startIndex; i < hours.length; i++) {
    const h = hours[i];
    if (h.precipitationMm == null || isNaN(h.precipitationMm)) { reason = 'missing'; break; }
    if (i > startIndex) {
      const prevD = new Date(hours[i - 1].timeIso).getTime(), currD = new Date(h.timeIso).getTime();
      if (!isNaN(prevD) && !isNaN(currD) && currD - prevD > 3700000) { reason = 'gap'; break; }
    }
    if (h.precipitationMm > 0.2) { reason = 'rain'; break; }
    count++;
  }

  if (reason === 'end') return `Sem precipitação prevista nos dados disponíveis (${count}h a partir das ${startHour.timeFormatted})`;
  if (reason === 'gap') return `${count}h previstas sem precipitação a partir das ${startHour.timeFormatted} (lacuna de dados)`;
  if (reason === 'missing') return `${count}h previstas sem precipitação a partir das ${startHour.timeFormatted} (dados interrompidos)`;
  return `${count}h previstas sem precipitação a partir das ${startHour.timeFormatted}`;
}
