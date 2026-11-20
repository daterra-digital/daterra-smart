// src/features/weather/utils/irdParcelFactorHelpers.ts
import type { ProfileCropMoment, ProfileCulture } from '../../../db/types.ts';
import type { CurrentWeather } from '../types.ts';
import { getEffectiveNow } from '../services/weatherTimeService.ts';
import { assessWeatherDriftReading } from './weatherDriftEvaluator.ts';
import { resolveAcceptableIrdLimit } from './irdOperationalThresholds.ts';
import { formatDecimalPt } from './windDirection.ts';

export interface ParcelDriftEvaluation {
  readonly baseMeteoScore: number;
  readonly fParcela: number;
  readonly parcelRiskPct: number;
  readonly geometryMode: '2D' | '3D';
  readonly refBoomHeightCm: number | null;
  readonly targetVolumeLHa: number | null;
  readonly sensitiveZoneLimitPct: number | null;
  readonly isSensitiveZoneAlert: boolean;
  readonly factorsBreakdown: readonly string[];
  readonly alertsPt: readonly string[];
}

function computeAzimuthFactor(rowAzimuthDeg?: number, windDeg?: number | null): { factor: number; label: string | null } {
  if (rowAzimuthDeg === undefined || windDeg === null || windDeg === undefined || !Number.isFinite(windDeg)) {
    return { factor: 1.0, label: null };
  }
  const diff = Math.abs(((windDeg % 180) + 180) % 180 - ((rowAzimuthDeg % 180) + 180) % 180);
  const angular = Math.min(diff, 180 - diff);
  if (angular <= 25) return { factor: 1.15, label: 'Corredor paralelo ao vento (× 1,15)' };
  if (angular >= 65) return { factor: 0.90, label: 'Linhas perpendiculares ao vento (× 0,90)' };
  return { factor: 1.0, label: null };
}

export function computeParcelFactorBundle(
  culture: ProfileCulture | null,
  moment: ProfileCropMoment | null,
  windDirectionDeg?: number | null
): {
  geometryMode: '2D' | '3D';
  fParcela: number;
  refBoomHeightCm: number | null;
  targetVolumeLHa: number | null;
  factorsBreakdown: string[];
  alertsPt: string[];
} {
  if (!culture) {
    return { geometryMode: '3D', fParcela: 1.0, refBoomHeightCm: null, targetVolumeLHa: null, factorsBreakdown: [], alertsPt: [] };
  }
  const is2D = culture.geometry_mode === '2D';
  const geometryMode: '2D' | '3D' = is2D ? '2D' : '3D';
  let f = 1.0;
  const factorsBreakdown: string[] = [];
  const alertsPt: string[] = [];
  let refBoomHeightCm: number | null = null;
  let targetVolumeLHa: number | null = culture.last_spray_volume_lha ?? null;

  if (is2D) {
    if (culture.crop_height_2d_cm && culture.crop_height_2d_cm > 0) {
      refBoomHeightCm = Math.round(culture.crop_height_2d_cm + 50);
      factorsBreakdown.push(`Barra ref. ${refBoomHeightCm} cm`);
    }
    const cov = culture.ground_cover_2d_pct;
    if (cov !== undefined) {
      if (cov < 20) { f *= 1.20; factorsBreakdown.push('Solo nu < 20% (× 1,20)'); }
      else if (cov > 80) { f *= 0.85; factorsBreakdown.push('Cobertura > 80% (× 0,85)'); }
    }
    if (culture.application_target_2d === 'solo_pre_emergencia') {
      f *= 1.10;
      factorsBreakdown.push('Alvo solo/pré-emergência (× 1,10)');
    } else if (culture.application_target_2d === 'folha_dossel') {
      f *= 0.95;
    }
    if (culture.reference_volume_2d_lha && culture.reference_volume_2d_lha > 0) {
      targetVolumeLHa = culture.reference_volume_2d_lha;
    }
  } else {
    const cover = culture.interrow_cover_3d;
    if (cover === 'permanente') { f *= 0.92; factorsBreakdown.push('Enrelvamento permanente (× 0,92)'); }
    else if (cover === 'sem_enrelvamento') { f *= 1.08; factorsBreakdown.push('Sem enrelvamento (× 1,08)'); }
    if (culture.conduction_mode_3d === 'arvores_isoladas') {
      f *= 1.10;
      factorsBreakdown.push('Árvores isoladas (× 1,10)');
    }
    if (culture.clean_trunk_height_m && culture.clean_trunk_height_m > 1.0) {
      f *= 1.08;
      factorsBreakdown.push(`Tronco limpo ${formatDecimalPt(culture.clean_trunk_height_m)} m (× 1,08)`);
    }
    const dens = moment?.densityTier;
    if (dens === 'aberta') { f *= 1.12; factorsBreakdown.push('Copa aberta (× 1,12)'); }
    else if (dens === 'densa') { f *= 0.90; factorsBreakdown.push('Copa densa (× 0,90)'); }
  }

  // Barreira não cumulativa na bordadura
  if (culture.windbreak_barrier === 'sebe_igual_superior') {
    f *= 0.55;
    factorsBreakdown.push('Quebra-vento ≥ copa (× 0,55)');
  } else if (culture.windbreak_barrier === 'sebe_inferior') {
    f *= 0.75;
    factorsBreakdown.push('Quebra-vento < copa (× 0,75)');
  }

  // Orientação das linhas vs direção do vento
  const az = computeAzimuthFactor(culture.row_azimuth_deg, windDirectionDeg);
  if (az.factor !== 1.0 && az.label) {
    f *= az.factor;
    factorsBreakdown.push(az.label);
  }

  // Declive > 5% em horário noturno/crepuscular (18:00–08:30): drenagem catabática
  const now = getEffectiveNow();
  const mins = now.getHours() * 60 + now.getMinutes();
  const isKatabaticWindow = mins >= 18 * 60 || mins <= 8 * 60 + 30;
  if (culture.parcel_slope_pct !== undefined && culture.parcel_slope_pct > 5 && isKatabaticWindow) {
    f *= 1.15;
    factorsBreakdown.push(`Drenagem catabática declive ${formatDecimalPt(culture.parcel_slope_pct)}% (× 1,15)`);
    alertsPt.push(`Declive > 5% entre 18:00 e 08:30: risco de escoamento de ar frio catabático (× 1,15).`);
  }

  if (culture.sensitive_zone_distance_m !== undefined && culture.sensitive_zone_distance_m < 5) {
    alertsPt.push(`Distância à zona sensível (${formatDecimalPt(culture.sensitive_zone_distance_m)} m) inferior a 5 m: respeite a zona tampão do rótulo.`);
  }

  return { geometryMode, fParcela: Math.round(f * 100) / 100, refBoomHeightCm, targetVolumeLHa, factorsBreakdown, alertsPt };
}

export function computeParcelOnlyDriftRisk(
  culture: ProfileCulture,
  moment: ProfileCropMoment | null,
  weather?: CurrentWeather
): ParcelDriftEvaluation {
  const driftEval = weather ? assessWeatherDriftReading(weather, { isCached: weather.isCached }) : null;
  const baseMeteoScore = driftEval?.status === 'VALID' && driftEval.score !== null ? driftEval.score : 25;
  const windDir = weather?.telemetryQuality?.rawWindDirectionDeg ?? weather?.windDirectionDeg ?? null;
  const bundle = computeParcelFactorBundle(culture, moment, windDir);
  const parcelRiskPct = Math.round(Math.min(200, Math.max(5, baseMeteoScore * bundle.fParcela)));
  const sensDist = culture.sensitive_zone_distance_m;
  const sensitiveZoneLimitPct = resolveAcceptableIrdLimit(sensDist);
  const isSensitiveZoneAlert = sensitiveZoneLimitPct === 30 ? parcelRiskPct > 50 : parcelRiskPct > sensitiveZoneLimitPct;
  const alertsPt = [...bundle.alertsPt];
  if (isSensitiveZoneAlert && sensDist !== undefined) {
    alertsPt.push(`Risco (${parcelRiskPct}%) excede limiar aceitável para zona sensível a ${formatDecimalPt(sensDist)} m.`);
  } else if (sensitiveZoneLimitPct === 30 && parcelRiskPct > 30) {
    alertsPt.push(`IRD ${parcelRiskPct}% (31–50% a ≤ 15 m): exige bicos SDRT 75–90% e janela ótima.`);
  } else if (parcelRiskPct >= 60 && parcelRiskPct <= 75) {
    alertsPt.push(`IRD ${parcelRiskPct}% (60–75%): aplique medidas corretivas imediatas.`);
  }

  return {
    baseMeteoScore,
    fParcela: bundle.fParcela,
    parcelRiskPct,
    geometryMode: bundle.geometryMode,
    refBoomHeightCm: bundle.refBoomHeightCm,
    targetVolumeLHa: bundle.targetVolumeLHa,
    sensitiveZoneLimitPct,
    isSensitiveZoneAlert,
    factorsBreakdown: bundle.factorsBreakdown,
    alertsPt
  };
}
