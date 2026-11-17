// src/features/perfis/services/cultureEngineCompatibility.ts
// Derivação agronómica (LWA, TRV, espessura LWA-V e mapeamento Oliveira) e avisos não bloqueantes.

import type {
  CanopyDensityTierId,
  CanopyThicknessTierId,
  ProfileCropMomentSnapshot,
  ProfileCulture
} from '../../../db/types.ts';
import { calculateLwaExtended, type LwaCalculationResult } from '../../area-parede-foliar/lwaDataMapper.ts';
import { calculateTrvExtended, type TrvCalculationResult } from '../../volume-copa/trvDataMapper.ts';
import { formatIsoCivilToDdMmYyyy } from './cultureDateUtils.ts';
import { computeRecommendedSprayVolume, type SprayVolumeBasis } from './cultureSprayVolume.ts';

export interface CultureMomentMetricsInput {
  rowDistanceM?: number;
  canopyHeightM?: number;
  canopyWidthM?: number;
  cultureKey?: string;
  conductionKey?: string;
  hasPendingCustomOption?: boolean;
}

export interface CultureMomentMetricsResult {
  lwaBilateral: number | null;
  trvPure: number | null;
  derivedThicknessTier?: CanopyThicknessTierId;
  effectiveMatrixCultureId?: string;
  /** Volume de calda de referência EPPO PP 1/239 (L/ha) e faixa mín–máx. */
  recommendedSprayVolumeLHa: number | null;
  recommendedSprayVolumeMinLHa: number | null;
  recommendedSprayVolumeMaxLHa: number | null;
  sprayVolumeBasis: SprayVolumeBasis | null;
  warnings: string[];
}

export function deriveThicknessTierFromWidth(widthM: number): CanopyThicknessTierId {
  if (widthM < 0.5) return 'estreita';
  if (widthM <= 0.8) return 'media';
  return 'larga';
}

export function resolveEffectiveCultureCatalogKey(
  cultureKey?: string,
  conductionKey?: string
): string | undefined {
  if (!cultureKey) return undefined;
  if (cultureKey === 'oliveira') {
    if (conductionKey === 'sebe_continua') return 'olival_superintensivo';
    if (conductionKey === 'vaso_globo') return 'olival_intensivo';
    return undefined;
  }
  return cultureKey;
}

export function evaluateCultureMomentMetrics(
  input: CultureMomentMetricsInput
): CultureMomentMetricsResult {
  const warnings: string[] = [];
  const { rowDistanceM: r, canopyHeightM: h, canopyWidthM: w, cultureKey, conductionKey } = input;

  let lwaBilateral: number | null = null;
  let lwaValid: LwaCalculationResult | null = null;
  if (h !== undefined && h > 0 && r !== undefined && r > 0) {
    const lwaRes = calculateLwaExtended(h, r);
    if (lwaRes.isValid) {
      lwaValid = lwaRes;
      lwaBilateral = lwaRes.area_parede_foliar;
    }
  }

  let trvPure: number | null = null;
  let trvValid: TrvCalculationResult | null = null;
  if (h !== undefined && h > 0 && w !== undefined && w > 0 && r !== undefined && r > 0) {
    const trvRes = calculateTrvExtended(h, w, r);
    if (trvRes.isValid) {
      trvValid = trvRes;
      trvPure = trvRes.volume_copa;
    }
  }
  const spray = computeRecommendedSprayVolume(lwaValid, trvValid, cultureKey, conductionKey);

  let derivedThicknessTier: CanopyThicknessTierId | undefined;
  if (cultureKey === 'vinha' && w !== undefined && w > 0) {
    derivedThicknessTier = deriveThicknessTierFromWidth(w);
  }

  if (h !== undefined && (h < 0.1 || h > 3.0)) {
    warnings.push('Altura de vegetação fora da faixa habitual das calculadoras (0,10 m a 3,00 m). Guardada como registo físico.');
  }
  if (r !== undefined && (r < 1.0 || r > 4.0)) {
    warnings.push('Distância entrelinha fora da faixa habitual (1,00 m a 4,00 m). Guardada como registo físico.');
  }
  if (w !== undefined) {
    if (w < 0.3 || w > 6.0) {
      warnings.push('Largura da copa fora do intervalo aceite pelo motor TRV (0,30 m a 6,00 m). Guardada como registo físico.');
    } else if (w < 0.5 || w > 4.0) {
      warnings.push('Largura da copa fora da faixa habitual (0,50 m a 4,00 m).');
    }
    if (r !== undefined && r > 0 && w >= r * 0.8) {
      warnings.push('Largura da copa próxima ou superior a 80% da distância entrelinha (possível sobreposição).');
    }
  }

  const effectiveMatrixCultureId = resolveEffectiveCultureCatalogKey(cultureKey, conductionKey);
  if (cultureKey === 'oliveira' && conductionKey && !effectiveMatrixCultureId) {
    warnings.push('O sistema de condução escolhido para Oliveira ainda não tem mapeamento direto nos motores de cálculo.');
  }
  if (input.hasPendingCustomOption) {
    warnings.push('Inclui opção local pendente de validação técnica; o cálculo automático poderá exigir seleção compatível.');
  }

  return {
    lwaBilateral,
    trvPure,
    derivedThicknessTier,
    effectiveMatrixCultureId,
    recommendedSprayVolumeLHa: spray?.referenceLHa ?? null,
    recommendedSprayVolumeMinLHa: spray?.minLHa ?? null,
    recommendedSprayVolumeMaxLHa: spray?.maxLHa ?? null,
    sprayVolumeBasis: spray?.basis ?? null,
    warnings
  };
}

export function parseMomentSnapshot(snapshotJson: string): ProfileCropMomentSnapshot | null {
  try {
    return JSON.parse(snapshotJson) as ProfileCropMomentSnapshot;
  } catch {
    return null;
  }
}

export function buildMomentSnapshot(
  culture: Pick<ProfileCulture, 'crop_type' | 'variety' | 'row_distance_m'>,
  moment: {
    observedAt: string | null;
    stageLabel: string;
    stageCode?: string;
    canopyHeightM?: number;
    canopyWidthM?: number;
    lai?: number;
    densityTier?: CanopyDensityTierId;
    thicknessTierManual?: CanopyThicknessTierId;
    metrics: Pick<CultureMomentMetricsResult, 'lwaBilateral' | 'trvPure'> &
      Partial<Omit<CultureMomentMetricsResult, 'lwaBilateral' | 'trvPure' | 'warnings'>>;
  }
): ProfileCropMomentSnapshot {
  const { metrics } = moment;
  const thicknessTier = moment.thicknessTierManual ?? metrics.derivedThicknessTier;
  return {
    savedDateDisplay: formatIsoCivilToDdMmYyyy(moment.observedAt),
    cultureLabel: culture.crop_type,
    ...(culture.variety ? { varietyLabel: culture.variety } : {}),
    stageLabel: moment.stageLabel,
    ...(moment.stageCode ? { stageCode: moment.stageCode } : {}),
    ...(culture.row_distance_m !== undefined ? { rowDistanceM: culture.row_distance_m } : {}),
    ...(moment.canopyHeightM !== undefined ? { canopyHeightM: moment.canopyHeightM } : {}),
    ...(moment.canopyWidthM !== undefined ? { canopyWidthM: moment.canopyWidthM } : {}),
    ...(moment.lai !== undefined ? { lai: moment.lai } : {}),
    ...(moment.densityTier ? { densityTier: moment.densityTier } : {}),
    ...(thicknessTier ? { thicknessTier } : {}),
    lwaBilateral: metrics.lwaBilateral,
    trvPure: metrics.trvPure,
    ...(metrics.recommendedSprayVolumeLHa != null
      ? {
          recommendedSprayVolumeLHa: metrics.recommendedSprayVolumeLHa,
          recommendedSprayVolumeMinLHa: metrics.recommendedSprayVolumeMinLHa ?? null,
          recommendedSprayVolumeMaxLHa: metrics.recommendedSprayVolumeMaxLHa ?? null,
          sprayVolumeBasis: metrics.sprayVolumeBasis ?? null
        }
      : {})
  };
}

export { detectCultureTelemetryIncoherence } from './cultureTelemetryCoherence.ts';
