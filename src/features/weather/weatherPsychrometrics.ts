// src/features/weather/weatherPsychrometrics.ts

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
  const es = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
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

const WMO_LABELS: Record<number, string> = {
  0: 'Céu Limpo',
  1: 'Geralmente Ensolarado',
  2: 'Parcialmente Nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro',
  51: 'Chuviscos',
  53: 'Chuviscos',
  55: 'Chuviscos',
  61: 'Chuva Fraca',
  63: 'Chuva Moderada',
  65: 'Chuva Forte',
  71: 'Queda de Neve',
  73: 'Queda de Neve',
  75: 'Queda de Neve',
  80: 'Aguaceiros',
  81: 'Aguaceiros',
  82: 'Aguaceiros',
  95: 'Trovoada',
  96: 'Trovoada com Granizo',
  99: 'Trovoada com Granizo'
};

/**
 * Converte códigos WMO da Open-Meteo em descrição clara em português de Portugal.
 */
export function getWmoWeatherLabel(code: number): string {
  return WMO_LABELS[code] || 'Céu Limpo';
}
