// src/features/perfis/services/calibrationFormatters.ts
import type { ProfileCropMoment, ProfileCulture } from '../../../db/types.ts';
import type { NozzleProfile } from '../../../schemas/nozzle-profile.schema.ts';
import type { WeatherAuditSnapshot } from '../../../types/calibration-audit.ts';
import { NOZZLES_BY_ID } from '../../nozzle-comparison/nozzleComparison.data.ts';
import { calculateFlowDeviationPct, computeBilateralStats, isSlotConfigured } from '../../settings/nozzles/services/nozzleProfileMath.ts';
import { CACHE_DURATION_MS, WEATHER_CACHE_STORE_KEY, type WeatherCacheStoreData } from '../../weather/services/weatherCacheService.ts';
import { evaluateCultureMomentMetrics, parseMomentSnapshot } from './cultureEngineCompatibility.ts';

const isFin = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isPos = (v: unknown): v is number => isFin(v) && v > 0;

export function formatPtNumber(value: number | null | undefined, decimals = 2): string {
  if (!isFin(value)) return '—';
  return value.toFixed(decimals).replace('.', ',');
}

export function formatPtGroupedInt(value: number | null | undefined): string {
  if (!isFin(value)) return '—';
  return Math.round(value).toLocaleString('pt-PT');
}

export function computeTankAutonomyHa(tankCapacityL: number | null | undefined, volumeCalibradoLHa: number | null): number | null {
  if (!isPos(tankCapacityL) || !isPos(volumeCalibradoLHa)) return null;
  return Math.round((tankCapacityL / volumeCalibradoLHa) * 100) / 100;
}

export interface ParcelTanksSummary {
  depositosDecimal: number;
  fullTanks: number;
  remainderL: number;
  displayLabel: string;
}

export function computeParcelTanksSummary(
  areaHa: number | null | undefined,
  volumeCalibradoLHa: number | null,
  tankCapacityL: number | null | undefined
): ParcelTanksSummary | null {
  if (!isPos(areaHa) || !isPos(volumeCalibradoLHa) || !isPos(tankCapacityL)) return null;
  const totalCaldaL = areaHa * volumeCalibradoLHa;
  const depositosDecimal = Math.round((totalCaldaL / tankCapacityL) * 10) / 10;
  const fullTanks = Math.floor(totalCaldaL / tankCapacityL);
  const remainderL = Math.round(totalCaldaL - fullTanks * tankCapacityL);
  const displayLabel = fullTanks >= 1 && remainderL > 0
    ? `${fullTanks} ${fullTanks === 1 ? 'cheio' : 'cheios'} + ${remainderL.toLocaleString('pt-PT')} L`
    : `${formatPtNumber(depositosDecimal, 1)} depósitos`;
  return { depositosDecimal, fullTanks, remainderL, displayLabel };
}

export function resolveNozzlePressureBounds(profile: NozzleProfile | null): { minBar: number | null; maxBar: number | null; hasAntiDrift: boolean | null } {
  if (!profile) return { minBar: null, maxBar: null, hasAntiDrift: null };
  const activeSlots = profile.slots.filter((s) => s.isActive && s.nozzleId);
  if (activeSlots.length === 0) return { minBar: null, maxBar: null, hasAntiDrift: null };
  const mins: number[] = [], maxs: number[] = [];
  let antiDriftCount = 0;
  for (const s of activeSlots) {
    const cat = NOZZLES_BY_ID.get(s.nozzleId);
    if (!cat) continue;
    if (isPos(cat.pressureMinBar)) mins.push(cat.pressureMinBar);
    if (isPos(cat.pressureMaxBar)) maxs.push(cat.pressureMaxBar);
    const nt = (cat.nozzleType || '').toLowerCase();
    if (nt.includes('ind') || nt.includes('anti')) antiDriftCount++;
  }
  return { minBar: mins.length ? Math.max(...mins) : null, maxBar: maxs.length ? Math.min(...maxs) : null, hasAntiDrift: antiDriftCount === activeSlots.length };
}

export function computeNozzleIso16122Stats(profile: NozzleProfile | null): { desvioMaximoBicosPct: number | null; simetriaEsqDirPct: number | null } {
  if (!profile) return { desvioMaximoBicosPct: null, simetriaEsqDirPct: null };
  const active = profile.slots.filter((s) => s.isActive && isSlotConfigured(s));
  const devs = active.map((s) => calculateFlowDeviationPct(s.flowAtPressureLMin, s.measuredFlowLMin)).filter((d): d is number => d !== null).map((d) => Math.abs(d));
  const hasBilateral = active.some((s) => s.sectionSide?.includes('LEFT')) && active.some((s) => s.sectionSide?.includes('RIGHT'));
  return {
    desvioMaximoBicosPct: devs.length > 0 ? Math.max(...devs) : null,
    simetriaEsqDirPct: hasBilateral ? computeBilateralStats(profile.slots).bilateralDeviationPct : null
  };
}

export function resolveCultureGeometryAndEppo(c: ProfileCulture, m?: ProfileCropMoment | null) {
  const snap = m?.snapshotJson ? parseMomentSnapshot(m.snapshotJson) : null;
  const entrelinhaM = isPos(snap?.rowDistanceM) ? snap.rowDistanceM : isPos(c.row_distance_m) ? c.row_distance_m : null;
  const canopyHeightM = isPos(snap?.canopyHeightM) ? snap.canopyHeightM : isPos(m?.canopyHeightM) ? m.canopyHeightM : isPos(c.canopy_height_m) ? c.canopy_height_m : null;
  const canopyWidthM = isPos(snap?.canopyWidthM) ? snap.canopyWidthM : isPos(m?.canopyWidthM) ? m.canopyWidthM : isPos(c.canopy_width_m) ? c.canopy_width_m : null;
  const derived = evaluateCultureMomentMetrics({
    rowDistanceM: entrelinhaM ?? undefined, canopyHeightM: canopyHeightM ?? undefined, canopyWidthM: canopyWidthM ?? undefined,
    cultureKey: c.culture_key, conductionKey: c.conduction_option_id
  });
  const trvM3Ha = isPos(snap?.trvPure) ? snap.trvPure : derived.trvPure ?? (isPos(c.last_trv_m3_ha) ? c.last_trv_m3_ha : null);
  const lwaM2Ha = isPos(snap?.lwaBilateral) ? snap.lwaBilateral : derived.lwaBilateral ?? (isPos(c.last_lwa_m2_ha) ? c.last_lwa_m2_ha : null);
  const volumeEppoLHa = isPos(snap?.recommendedSprayVolumeLHa) ? snap.recommendedSprayVolumeLHa : derived.recommendedSprayVolumeLHa ?? (isPos(c.last_spray_volume_lha) ? c.last_spray_volume_lha : null);
  const indexKind: 'LWA' | 'TRV' | null = lwaM2Ha && (!trvM3Ha || snap?.sprayVolumeBasis === 'lwa' || derived.sprayVolumeBasis === 'lwa') ? 'LWA' : trvM3Ha ? 'TRV' : null;
  const areaHa = isPos(c.area_ha) ? c.area_ha : null;
  return { entrelinhaM, canopyHeightM, canopyWidthM, trvM3Ha, lwaM2Ha, volumeEppoLHa, indexKind, areaHa, missingGeometry: !entrelinhaM || (!lwaM2Ha && !trvM3Ha) };
}

function normLoc(s?: string | null): string {
  return (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function findFreshWeatherForCulture(culture: ProfileCulture | null): WeatherAuditSnapshot | null {
  if (!culture || typeof window === 'undefined' || !window.localStorage) return null;
  const targets = [culture.municipality, culture.location, culture.parish].map(normLoc).filter(Boolean);
  if (targets.length === 0) return null;
  try {
    const raw = window.localStorage.getItem(WEATHER_CACHE_STORE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as WeatherCacheStoreData;
    const now = Date.now();
    for (const entry of Object.values(store.entries ?? {})) {
      if (!entry?.data || now - entry.cachedAt >= CACHE_DURATION_MS) continue;
      const loc = normLoc(entry.data.locationName);
      if (!loc || !targets.some((t) => loc.includes(t) || t.includes(loc))) continue;
      const cur = entry.data.current, q = cur.telemetryQuality;
      const wKmh = q ? q.rawWindSpeedKmh : (isFin(cur.windSpeedKmh) ? cur.windSpeedKmh : null);
      const gKmh = q ? (q.isGustEstimated ? null : q.rawWindGustsKmh) : (isFin(cur.windGustsKmh) ? cur.windGustsKmh : null);
      return {
        ventoMs: wKmh !== null ? Math.round((wKmh / 3.6) * 100) / 100 : null,
        rajadaMs: gKmh !== null ? Math.round((gKmh / 3.6) * 100) / 100 : null,
        deltaT: isFin(cur.deltaT) ? cur.deltaT : null, vpd: isFin(cur.vpdKpa) ? cur.vpdKpa : null,
        precipitacaoMm: q ? q.rawPrecipitationMm : (isFin(cur.precipitationMm) ? cur.precipitationMm : null),
        observadoEm: cur.updatedAt || entry.data.fetchedAt || null, localidade: entry.data.locationName || null, origemDados: 'CACHE'
      };
    }
  } catch { return null; }
  return null;
}

/** Escala proporcionalmente os débitos dos bicos via lei hidráulica Q2 = Q1 * sqrt(P2 / P1). */
export function scaleNozzleProfileByPressure(
  profile: NozzleProfile | null,
  targetPressureBar: number | null
): { scaledProfile: NozzleProfile | null; pressureFactor: number; scaledTotalFlowLMin: number | null } {
  if (!profile) return { scaledProfile: null, pressureFactor: 1, scaledTotalFlowLMin: null };
  const baseP = profile.referencePressureBar;
  if (!isPos(targetPressureBar) || !isPos(baseP) || Math.abs(targetPressureBar - baseP) < 0.001) {
    return { scaledProfile: profile, pressureFactor: 1, scaledTotalFlowLMin: profile.totalActiveFlowLMin };
  }
  const pressureFactor = Math.sqrt(targetPressureBar / baseP);
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const scaledTotalFlowLMin = round2(profile.totalActiveFlowLMin * pressureFactor);
  const scaledSlots = profile.slots.map((slot) => ({
    ...slot,
    flowAtPressureLMin: round2(slot.flowAtPressureLMin * pressureFactor),
    ...(slot.measuredFlowLMin !== undefined ? { measuredFlowLMin: round2(slot.measuredFlowLMin * pressureFactor) } : {})
  }));
  return {
    scaledProfile: { ...profile, referencePressureBar: Math.round(targetPressureBar * 100) / 100, totalActiveFlowLMin: scaledTotalFlowLMin, slots: scaledSlots },
    pressureFactor,
    scaledTotalFlowLMin
  };
}

export type CalibrationKeypadTarget = 'speed' | 'pressure' | 'engineRpm' | 'ptoRpm' | 'airflow' | null;

export function buildCalibrationKeypadConfig(
  field: Exclude<CalibrationKeypadTarget, null>,
  vals: { speedKmh: number; pressaoBar: number | null; pressaoBaseBar: number | null; engineRpm: number | null; ptoRpm: number | null; airflowM3h: number | null }
) {
  if (field === 'speed') return {
    label: 'Velocidade de Avanço', initialValue: String(vals.speedKmh), initialUnit: 'km/h',
    commonValues: [3.5, 4, 4.5, 5, 5.5, 6, 7.5], min: 0.5, maxDecimals: 2, allowDecimal: true
  };
  if (field === 'pressure') {
    const c = isPos(vals.pressaoBaseBar) ? vals.pressaoBaseBar : (isPos(vals.pressaoBar) ? vals.pressaoBar : 3.0);
    const raw = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map((d) => Math.max(0.5, Math.round((c + d) * 10) / 10));
    const unique = Array.from(new Set(raw));
    for (let x = 2; unique.length < 7; x += 0.5) {
      const cand = Math.round((c + x) * 10) / 10;
      if (!unique.includes(cand)) unique.push(cand);
    }
    return {
      label: 'Pressão de Trabalho', initialValue: vals.pressaoBar !== null ? String(vals.pressaoBar) : '', initialUnit: 'bar',
      commonValues: unique.sort((a, b) => a - b), min: 0.5, maxDecimals: 2, allowDecimal: true
    };
  }
  if (field === 'engineRpm') return {
    label: 'Rotação do Motor', initialValue: vals.engineRpm !== null ? String(vals.engineRpm) : '', initialUnit: 'rpm',
    commonValues: [1200, 1400, 1500, 1650, 1800, 2000, 2200], min: 400, maxDecimals: 0, allowDecimal: false
  };
  if (field === 'ptoRpm') return {
    label: 'Rotação da TDF', initialValue: vals.ptoRpm !== null ? String(vals.ptoRpm) : '', initialUnit: 'rpm',
    commonValues: [450, 480, 510, 540, 560, 750, 1000], min: 200, maxDecimals: 0, allowDecimal: false
  };
  return {
    label: 'Caudal de Ar Aplicado', initialValue: vals.airflowM3h !== null ? String(vals.airflowM3h) : '', initialUnit: 'm³/h',
    commonValues: [800, 1200, 1800, 2500, 10000, 15000, 20000], min: 0, maxDecimals: 0, allowDecimal: false
  };
}
