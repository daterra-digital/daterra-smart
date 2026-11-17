// src/features/perfis/services/cultureSprayVolume.ts
// Volume de calda de referência EPPO PP 1/239 (L/ha) derivado de LWA (sebes/vinha) ou TRV (árvores) — sem recalcular motores.

import type { LwaCalculationResult } from '../../area-parede-foliar/lwaDataMapper.ts';
import type { TrvCalculationResult } from '../../volume-copa/trvDataMapper.ts';

export type SprayVolumeBasis = 'lwa' | 'trv';

export interface SprayVolumeRecommendation {
  referenceLHa: number;
  minLHa: number;
  maxLHa: number;
  basis: SprayVolumeBasis;
}

/** Vinha e condução em sebe contínua usam LWA; restantes culturas arbóreas usam TRV. */
export function prefersLwaBasis(cultureKey?: string, conductionKey?: string): boolean {
  return cultureKey === 'vinha' || conductionKey === 'sebe_continua';
}

/**
 * Reutiliza as faixas de calda já definidas nos mapeadores canónicos
 * (LWA: 0,025–0,040 L/m²; TRV: 0,04–0,07 L/m³). Devolve null sem dados válidos.
 */
export function computeRecommendedSprayVolume(
  lwa: LwaCalculationResult | null,
  trv: TrvCalculationResult | null,
  cultureKey?: string,
  conductionKey?: string
): SprayVolumeRecommendation | null {
  const fromLwa: SprayVolumeRecommendation | null = lwa?.isValid
    ? { referenceLHa: lwa.caldaReferenciaLHa, minLHa: lwa.caldaMinLHa, maxLHa: lwa.caldaMaxLHa, basis: 'lwa' }
    : null;
  const fromTrv: SprayVolumeRecommendation | null = trv?.isValid
    ? { referenceLHa: trv.caldaReferenciaLHa, minLHa: trv.caldaMinLHa, maxLHa: trv.caldaMaxLHa, basis: 'trv' }
    : null;
  return prefersLwaBasis(cultureKey, conductionKey) ? fromLwa ?? fromTrv : fromTrv ?? fromLwa;
}
