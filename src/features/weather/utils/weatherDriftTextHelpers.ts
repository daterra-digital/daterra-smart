// src/features/weather/utils/weatherDriftTextHelpers.ts
import { getEffectiveNow } from '../services/weatherTimeService.ts';
import { formatDecimalPt } from './windDirection.ts';

export function isInversionTimeWindow(timeIso?: string): boolean {
  if (timeIso && timeIso.includes('T')) {
    const [hh, mm] = timeIso.split('T')[1].slice(0, 5).split(':').map(Number);
    if (Number.isFinite(hh) && Number.isFinite(mm)) {
      const mins = hh * 60 + mm;
      return mins >= 18 * 60 || mins <= 8 * 60 + 30;
    }
  }
  const now = getEffectiveNow();
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= 18 * 60 || mins <= 8 * 60 + 30;
}

export function buildDriftFactorText(
  wind: number,
  gust: number,
  deltaTC: number,
  precipMm: number,
  effWindKmh: number,
  isInversion: boolean,
  gustFactor: number | null
): string {
  if (precipMm > 0.2) {
    return `Bloqueio por Precipitação (Lavagem): ${formatDecimalPt(precipMm)} mm/h; índice físico de deriva mantido independente.`;
  }
  if (isInversion) {
    return `Alerta heurístico de inversão térmica: vento ${formatDecimalPt(wind)} km/h e ΔT ${formatDecimalPt(deltaTC)} °C.`;
  }
  if (gustFactor !== null && gustFactor > 1.8) {
    return `Turbulência / Fator de Rajada elevado (G = ${formatDecimalPt(gustFactor)}): vento ${formatDecimalPt(wind)} km/h, rajada ${formatDecimalPt(gust)} km/h.`;
  }
  if (effWindKmh >= 14) return `Vento efetivo a 10 m (${formatDecimalPt(effWindKmh)} km/h) domina o potencial meteorológico.`;
  if (deltaTC > 8) return `Delta T elevado (${formatDecimalPt(deltaTC)} °C) favorece evaporação rápida de gotas finas.`;
  if (deltaTC < 2) return `Delta T baixo (${formatDecimalPt(deltaTC)} °C): secagem lenta na folhagem.`;
  return `Vento a ${formatDecimalPt(wind)} km/h (raj. ${formatDecimalPt(gust)} km/h) e ΔT estável (${formatDecimalPt(deltaTC)} °C).`;
}
