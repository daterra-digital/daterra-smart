import type { Nozzle } from './nozzleComparison.types';

export interface InterpolatedDropletSpectrum {
  dv10: number | null;
  dv50: number | null;
  dv90: number | null;
  effectiveDropletClass?: string;
}

/**
 * Interpolação e extrapolação física contínua do espectro de gotas (Dv10, Dv50, Dv90)
 * Baseada nos pontos de calibração catalogados pelo fabricante (5, 10 e 15 bar para Albuz ATR).
 * 
 * - P <= 5 bar: extrapolação linear com amortecimento físico
 * - 5 < P < 10 bar: interpolação linear entre 5 e 10 bar
 * - 10 <= P <= 15 bar: interpolação linear entre 10 e 15 bar
 * - P > 15 bar: extrapolação linear baseada no declive 10-15 bar com piso de segurança física
 */
function interpolateParam(
  p: number,
  val5?: number,
  val10?: number,
  val15?: number,
  minPhysicalLimit = 10
): number | null {
  if (val5 === undefined && val10 === undefined && val15 === undefined) {
    return null;
  }

  const fallback = (val5 ?? val10 ?? val15) as number;
  const v5 = val5 ?? fallback;
  const v10 = val10 ?? fallback;
  const v15 = val15 ?? fallback;

  let result: number;

  if (p <= 5.0) {
    // Declive 5 -> 10 bar
    const slope = (v10 - v5) / 5.0;
    const extrapolated = v5 + (p - 5.0) * slope;
    // Como pressão menor produz gotas maiores, limitamos a 1.5x o valor a 5 bar
    result = Math.min(extrapolated, v5 * 1.5);
  } else if (p <= 10.0) {
    const t = (p - 5.0) / 5.0;
    result = v5 + t * (v10 - v5);
  } else if (p <= 15.0) {
    const t = (p - 10.0) / 5.0;
    result = v10 + t * (v15 - v10);
  } else {
    // Extrapolação acima de 15 bar (ex: 15.1 bar, 20 bar) baseada no declive 10-15 bar
    const slope = (v15 - v10) / 5.0;
    const extrapolated = v15 + (p - 15.0) * slope;
    result = Math.max(extrapolated, minPhysicalLimit);
  }

  return Math.round(result);
}

export function interpolateDropletSpectrum(
  nozzle?: Nozzle,
  pressureBar = 3.0
): InterpolatedDropletSpectrum {
  if (!nozzle) {
    return { dv10: null, dv50: null, dv90: null };
  }

  // Verifica se o bico tem medições catalogadas a 5, 10 ou 15 bar
  const hasMeasurements =
    nozzle.d50_5bar_um !== undefined ||
    nozzle.d50_10bar_um !== undefined ||
    nozzle.d50_15bar_um !== undefined;

  if (!hasMeasurements) {
    return { dv10: null, dv50: null, dv90: null };
  }

  const dv10 = interpolateParam(pressureBar, nozzle.d10_5bar_um, nozzle.d10_10bar_um, nozzle.d10_15bar_um, 15);
  const dv50 = interpolateParam(pressureBar, nozzle.d50_5bar_um, nozzle.d50_10bar_um, nozzle.d50_15bar_um, 35);
  const dv90 = interpolateParam(pressureBar, nozzle.d90_5bar_um, nozzle.d90_10bar_um, nozzle.d90_15bar_um, 60);

  // Determinar classe de gotas conforme a pressão
  let effectiveDropletClass = nozzle.dropletClass5bar;
  if (pressureBar >= 12.5 && nozzle.dropletClass15bar && nozzle.dropletClass15bar !== 'null') {
    effectiveDropletClass = nozzle.dropletClass15bar;
  } else if (pressureBar >= 7.5 && nozzle.dropletClass10bar && nozzle.dropletClass10bar !== 'null') {
    effectiveDropletClass = nozzle.dropletClass10bar;
  }

  return {
    dv10,
    dv50,
    dv90,
    effectiveDropletClass: effectiveDropletClass && effectiveDropletClass !== 'null' ? effectiveDropletClass : undefined
  };
}
