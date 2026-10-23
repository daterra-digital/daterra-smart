// src/features/weather/weatherCalculations.ts
import type { SprayEvaluation, SprayDecisionLevel } from './types';

/**
 * Calcula a temperatura de bolbo húmido através da equação empírica de Stull (2011).
 * Válida para temperaturas entre -20°C e 50°C e humidade relativa entre 5% e 99%.
 */
export function calculateWetBulbTemperature(tempC: number, rhPercent: number): number {
  const t = tempC;
  const rh = Math.min(100, Math.max(1, rhPercent));

  const tw =
    t * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(t + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;

  return Math.round(tw * 10) / 10;
}

/**
 * Calcula o Delta T (ΔT = Temperatura de Bolbo Seco - Temperatura de Bolbo Húmido).
 * Indicador de referência mundial para evaporação e sobrevivência de gotas de calda.
 */
export function calculateDeltaT(tempC: number, rhPercent: number): number {
  const wetBulb = calculateWetBulbTemperature(tempC, rhPercent);
  const deltaT = Math.max(0, tempC - wetBulb);
  return Math.round(deltaT * 10) / 10;
}

/**
 * Calcula o Ponto de Orvalho (°C) pela fórmula de Magnus-Tetens.
 */
export function calculateDewPoint(tempC: number, rhPercent: number): number {
  const a = 17.27;
  const b = 237.7;
  const rhSafe = Math.min(100, Math.max(1, rhPercent));
  const alpha = (a * tempC) / (b + tempC) + Math.log(rhSafe / 100);
  const dp = (b * alpha) / (a - alpha);
  return Math.round(dp * 10) / 10;
}

/**
 * Calcula o Défice de Pressão de Vapor (DPV / VPD) em kPa.
 * Parâmetro determinante para taxa de transpiração da cultura e fertirrigação.
 */
export function calculateVpd(tempC: number, rhPercent: number): number {
  const rhSafe = Math.min(100, Math.max(1, rhPercent));
  const es = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3)); // Pressão de saturação (kPa)
  const vpd = es * (1 - rhSafe / 100);
  return Math.round(Math.max(0, vpd) * 100) / 100;
}

/**
 * Converte graus de azimute do vento em pontos cardeais em português.
 */
export function getWindDirectionText(deg: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index] || 'N';
}

/**
 * Converte códigos WMO da Open-Meteo em descrição clara em português de Portugal.
 */
export function getWmoWeatherLabel(code: number): string {
  switch (code) {
    case 0: return 'Céu Limpo';
    case 1: return 'Geralmente Ensolarado';
    case 2: return 'Parcialmente Nublado';
    case 3: return 'Nublado';
    case 45: case 48: return 'Nevoeiro';
    case 51: case 53: case 55: return 'Chuviscos';
    case 61: return 'Chuva Fraca';
    case 63: return 'Chuva Moderada';
    case 65: return 'Chuva Forte';
    case 71: case 73: case 75: return 'Queda de Neve';
    case 80: case 81: case 82: return 'Aguaceiros';
    case 95: return 'Trovoada';
    case 96: case 99: return 'Trovoada com Granizo';
    default: return 'Céu Limpo';
  }
}

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
  let reason = 'Janela meteorológica excelente para absorção da calda sem risco significativo de deriva.';

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
      reason: `Velocidade do vento (${windSpeedKmh} km/h) ou rajadas (${windGustsKmh} km/h) excedem o limite de segurança legal. Risco de contaminação de áreas vizinhas.`,
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

  // 4. Delta T Muito Baixo (Escorrimento)
  if (deltaT < 2.0 && humidityPercent > 90) {
    return {
      level: 'marginal',
      badgeLabel: 'Risco de Escorrimento',
      title: 'Atenção — Ar Saturado de Humidade',
      reason: 'Com Delta T inferior a 2°C, as gotas não secam na folha e coalescem, escorrendo para o solo e desperdiçando produto.',
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
