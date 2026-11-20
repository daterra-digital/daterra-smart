// src/features/weather/utils/weatherContextHelpers.ts
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/types';
import type { ActiveMachineContext } from '../weatherWeekAggregator';
import type { CurrentWeather } from '../types';
import { getEffectiveNow } from '../services/weatherTimeService';
import { parseWindDirection } from './windDirection';

export function buildCurrentSprayTelemetry(current?: CurrentWeather) {
  const deltaT = current?.deltaT ?? null;
  const rh = current?.humidityPercent ?? null;
  const wind = current?.windSpeedKmh ?? null;
  const gusts = current?.windGustsKmh ?? null;
  const precip = current?.precipitationMm ?? null;
  const gustFactor = wind != null && wind > 0 && gusts != null ? Math.round((gusts / wind) * 10) / 10 : null;
  const windDir = parseWindDirection(current?.telemetryQuality?.rawWindDirectionDeg ?? current?.windDirectionDeg);
  const nowMins = getEffectiveNow().getHours() * 60 + getEffectiveNow().getMinutes();
  const isInversionAlert = deltaT != null && wind != null && deltaT < 2.0 && wind < 3.5 && (nowMins >= 18 * 60 || nowMins <= 8 * 60 + 30);
  const hasPrecipBlock = precip != null && precip > 0.2;
  const deltaTTag = deltaT == null ? '—' : deltaT < 2.0 && (rh ?? 0) > 90
    ? 'HR > 90%'
    : deltaT < 2.0 ? 'ΔT Baixo' : deltaT <= 8.0 ? '2–8 °C' : deltaT <= 10.0 ? '8–10 °C' : '> 10 °C';
  const deltaTTagTitle = deltaT == null ? '' : deltaT < 2.0 && (rh ?? 0) > 90
    ? 'Risco de escorrimento foliar (HR > 90%)'
    : deltaT < 2.0 ? 'Delta T inferior a 2,0 °C' : deltaT <= 8.0 ? 'Faixa recomendada (2–8 °C)' : deltaT <= 10.0 ? 'Evaporação rápida (8–10 °C)' : 'Evaporação extrema (> 10 °C)';
  return { deltaT, rh, wind, gusts, precip, gustFactor, windDir, isInversionAlert, hasPrecipBlock, deltaTTag, deltaTTagTitle };
}

export function formatNozzleOptionLabel(
  n: ProfileNozzle,
  calibrations: ProfileCalibration[]
): string {
  const profileName = n.equipment_name?.trim() || n.nozzle_type || 'Bico';
  const angle = n.spray_angle ? (String(n.spray_angle).includes('°') ? n.spray_angle : `${n.spray_angle}°`) : '110°';
  const colorIso = n.iso_classification ? `${n.color} / ${n.iso_classification}` : n.color;
  const linkedCal = calibrations.find((c) => Number(c.nozzle_id ?? c.nozzleProfileId) === n.id);
  const count = linkedCal?.active_nozzles_count ?? linkedCal?.numBicosAtivos;
  const countText = count ? `${count} bicos` : 'N/D bicos';
  return `${profileName} · ${n.manufacturer} ${n.model} ${angle} (${colorIso}) · ${countText}`;
}

export function formatCalibrationOptionLabel(cal: ProfileCalibration): string {
  const name = cal.nomePerfil?.trim() || `Calibração #${cal.id}`;
  const vol = cal.volumeCalibradoLHa ?? cal.calculated_spray_volume_lha;
  const press = cal.pressaoBar ?? cal.working_pressure_bar;
  const volStr = vol != null ? String(vol).replace('.', ',') : '—';
  const pressStr = press != null ? String(press).replace('.', ',') : '—';
  return `${name} (${volStr} L/ha • ${pressStr} bar)`;
}

export function resolveCalibrationCascade(
  cal: ProfileCalibration,
  cultures: ProfileCulture[],
  equipments: ProfileEquipment[],
  nozzles: ProfileNozzle[],
  prev: ActiveMachineContext | null
): ActiveMachineContext {
  const rawEqId = cal.equipment_id ?? (cal.equipmentId ? Number(cal.equipmentId) : null);
  const rawNozId = cal.nozzle_id ?? (cal.nozzleProfileId ? Number(cal.nozzleProfileId) : null);
  const rawCultId = cal.cultureParcelId ? Number(cal.cultureParcelId) : null;

  const eq = rawEqId ? equipments.find((e) => e.id === rawEqId) ?? null : null;
  const noz = rawNozId ? nozzles.find((n) => n.id === rawNozId) ?? null : null;
  const cult = rawCultId ? cultures.find((c) => c.id === rawCultId) ?? null : null;

  return {
    ...prev,
    cultureId: cult ? (cult.id ?? null) : (rawCultId ? null : (prev?.cultureId ?? null)),
    cultureName: cult ? cult.name : (rawCultId ? null : (prev?.cultureName ?? null)),
    equipmentId: eq ? (eq.id ?? null) : null,
    equipmentName: eq ? eq.name : null,
    hasAirSleeve: eq ? !!eq.has_air_sleeve : undefined,
    nozzleId: noz ? (noz.id ?? null) : null,
    nozzleName: noz ? `${noz.manufacturer} ${noz.model}` : null,
    nozzleType: noz?.nozzle_type ?? null,
    calibrationId: typeof cal.id === 'number' ? cal.id : Number(cal.id) || null,
    calibrationName: formatCalibrationOptionLabel(cal),
    workingPressureBar: cal.pressaoBar ?? cal.working_pressure_bar ?? noz?.working_pressure_bar ?? null,
    dropletSizeUm: cal.droplet_size_um ?? null
  };
}

export function getDynamicThresholdsSummary(
  context: ActiveMachineContext | null,
  activeEquipment?: ProfileEquipment | null
): string {
  const distType = (activeEquipment?.distribution_type || activeEquipment?.name || '').toLowerCase();
  const isUav = distType.includes('uav') || distType.includes('drone');
  if (isUav) {
    return 'UAV / Drone: bloqueio legal > 15 km/h · Alerta de inversão térmica < 3 km/h';
  }
  const isAirInd = context?.nozzleType?.toLowerCase().includes('ind') || context?.nozzleType === 'air_induction';
  if (context?.hasAirSleeve || isAirInd) {
    return 'Barra 2D Anti-Deriva (SDRT ≥ 75%): favorável até 15–18 km/h · Alerta de inversão < 3 km/h';
  }
  const is3d = distType.includes('3d') || distType.includes('axial') || distType.includes('atomiz');
  if (is3d || context?.nozzleId) {
    return '3D / Gota Fina: favorável até 10–12 km/h · Alerta de inversão térmica < 3 km/h';
  }
  return 'Referência: favorável até 10 km/h · Limite > 14 km/h ou rajadas > 25 km/h · Inversão < 3 km/h';
}
