// src/features/weather/weatherCalculations.ts
import type { SprayEvaluation, SprayDecisionLevel } from './types';

export {
  calculateWetBulbTemperature,
  calculateDeltaT,
  calculateDewPoint,
  calculateVpd,
  getWindDirectionText,
  getWmoWeatherLabel
} from './weatherPsychrometrics.ts';

interface EquipmentContextOptions {
  nozzleType?: 'air_induction' | 'standard' | 'hollow_cone' | string;
  hasAirSleeve?: boolean;
  workingPressureBar?: number;
  dropletSizeUm?: number;
}

/**
 * Avalia de forma cruzada a janela de pulverização com base nas regras DGAV / EPPO / Metos
 * e nos perfis reais da máquina (bicos, manga de ar e pressão).
 */
export function evaluateSprayWindow(
  deltaT: number,
  windSpeedKmh: number,
  windGustsKmh: number,
  humidityPercent: number,
  precipitationMm = 0,
  context?: EquipmentContextOptions
): SprayEvaluation {
  const isAirInduction = context?.nozzleType?.toLowerCase().includes('ind') ||
    context?.nozzleType === 'air_induction' ||
    (context?.dropletSizeUm && context.dropletSizeUm >= 300);

  const hasAirSleeve = !!context?.hasAirSleeve;
  const isHighPressure = (context?.workingPressureBar || 0) > 3.5;

  // Tolerância ao vento: bicos anti-deriva e manga de ar aumentam tolerância
  const maxWindSafe = hasAirSleeve ? 16 : isAirInduction ? 14 : 10;
  const maxWindLimit = hasAirSleeve ? 20 : isAirInduction ? 18 : 14;

  let level: SprayDecisionLevel = 'optimal';
  let badgeLabel = 'Risco Baixo (Ótimo)';
  let title = 'Condições Favoráveis para Aplicação';
  let reason = 'Condições favoráveis: vento calmo e Delta T na faixa recomendada, com baixo risco de deriva.';

  // 1. Chuva ativa ou iminente
  if (precipitationMm > 0.2) {
    return {
      level: 'unfavorable',
      badgeLabel: 'Chuva Ativa',
      title: 'Tratamento Inviável — Precipitação',
      reason: 'A ocorrência de chuva provoca lavagem imediata do produto fitofarmacêutico antes da secagem na folha.',
      deltaT,
      windSpeedKmh,
      windGustsKmh,
      humidityPercent
    };
  }

  // 2. Vento extremo ou rajadas perigosas
  if (windSpeedKmh > maxWindLimit || windGustsKmh > 25) {
    return {
      level: 'unfavorable',
      badgeLabel: 'Vento Crítico',
      title: 'Risco Severo de Deriva',
      reason: `Velocidade do vento (${windSpeedKmh} km/h) ou rajadas (${windGustsKmh} km/h) excedem o limite operacional de segurança. Risco de deriva para áreas vizinhas.`,
      deltaT,
      windSpeedKmh,
      windGustsKmh,
      humidityPercent
    };
  }

  // 3. Delta T Crítico (Evaporação extrema)
  if (deltaT > 10) {
    return {
      level: 'unfavorable',
      badgeLabel: 'Evaporação Extrema',
      title: 'Inviável — Delta T Superior a 10°C',
      reason: 'A atmosfera está excessivamente seca. As gotas de calda evaporam antes de atingir a copa, gerando perda total e fitotoxicidade.',
      deltaT,
      windSpeedKmh,
      windGustsKmh,
      humidityPercent
    };
  }

  // 4. Delta T Muito Baixo (< 2,0 °C — baixa evaporação, orvalho ou inversão térmica)
  if (deltaT < 2.0 && humidityPercent > 90) {
    return {
      level: 'marginal',
      badgeLabel: 'Risco de Escorrimento',
      title: 'Atenção — Ar Saturado de Humidade',
      reason: 'Com Delta T inferior a 2,0 °C e HR > 90%, as gotas não secam na folha e coalescem, escorrendo para o solo.',
      deltaT,
      windSpeedKmh,
      windGustsKmh,
      humidityPercent
    };
  }
  if (deltaT < 2.0) {
    return {
      level: 'marginal',
      badgeLabel: 'Atenção ΔT Baixo',
      title: 'Atenção — Delta T Inferior a 2,0 °C',
      reason: 'Baixa capacidade evaporativa (< 2,0 °C): risco de orvalho, secagem lenta ou inversão térmica. Confirme no terreno.',
      deltaT,
      windSpeedKmh,
      windGustsKmh,
      humidityPercent
    };
  }

  // 5. Delta T no limiar de evaporação (8 a 10°C)
  if (deltaT > 8.0) {
    if (!isAirInduction || isHighPressure) {
      return {
        level: 'marginal',
        badgeLabel: 'Atenção Evaporação',
        title: 'Evaporação Rápida de Gotas Finas',
        reason: 'Delta T entre 8°C e 10°C causa rápida evaporação. Recomenda-se usar bicos de indução de ar (>350 µm) e reduzir a pressão de trabalho.',
        deltaT,
        windSpeedKmh,
        windGustsKmh,
        humidityPercent
      };
    } else {
      level = 'marginal';
      badgeLabel = 'Viável c/ Indução de Ar';
      title = 'Aplicação Viável com Precaução';
      reason = 'Delta T elevado (8-10°C), mas mitigado pelo espectro de gotas grossas de indução de ar registadas no seu pulverizador.';
    }
  }

  // 6. Vento moderado (10 a 14 km/h)
  if (windSpeedKmh > maxWindSafe) {
    if (isAirInduction || hasAirSleeve) {
      level = 'marginal';
      badgeLabel = 'Atenção ao Vento';
      title = 'Aplicação Viável com Assistência de Ar';
      reason = `Vento a ${windSpeedKmh} km/h: viável graças aos bicos de indução de ar e/ou manga de ar do pulverizador. Reduza a velocidade de avanço do trator.`;
    } else {
      return {
        level: 'marginal',
        badgeLabel: 'Atenção Deriva',
        title: 'Vento Acima do Recomendado para Bicos Convencionais',
        reason: `Vento de ${windSpeedKmh} km/h provoca deriva em gotas finas. Aguarde que o vento baixe dos 10 km/h ou use bicos anti-deriva.`,
        deltaT,
        windSpeedKmh,
        windGustsKmh,
        humidityPercent
      };
    }
  }

  // 7. Vento nulo (< 2 km/h) em pleno sol (risco de inversão térmica)
  if (windSpeedKmh < 2.0 && deltaT > 6.0) {
    return {
      level: 'marginal',
      badgeLabel: 'Possível Inversão',
      title: 'Atenção a Inversões Térmicas',
      reason: 'Vento praticamente nulo em dia quente pode aprisionar nuvens de microgotas suspensas, derivando imprevisivelmente.',
      deltaT,
      windSpeedKmh,
      windGustsKmh,
      humidityPercent
    };
  }

  return {
    level,
    badgeLabel,
    title,
    reason,
    deltaT,
    windSpeedKmh,
    windGustsKmh,
    humidityPercent
  };
}
