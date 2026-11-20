// src/features/weather/utils/weatherProfileLoader.ts
import { db, type ProfileCropMoment, type ProfileCulture, type ProfileEquipment, type ProfileNozzle, type ProfileCalibration } from '../../../db/db.ts';
import { isValidOwnerId } from '../../perfis/services/profileOwnership.ts';
import { CalibrationAuditRecordSchema, type CalibrationAuditRecord } from '../../../types/calibration-audit.ts';
import type { EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import type { NozzleProfile } from '../../../schemas/nozzle-profile.schema.ts';

const NOZZLE_V1_PREFIX = 'DATERRA_NOZZLE_PROFILE_V1:';
const LEGACY_EPOCH_ISO = '1970-01-01T00:00:00.000Z';
const isPos = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;

/** Aceita registos do utilizador autenticado atual e registos locais sem uid de terceiros. */
export function isLocalOrOwnedByUser(recordUserId: unknown, ownerKeys: readonly string[]): boolean {
  if (typeof recordUserId !== 'string' || recordUserId.trim() === '') return true;
  const trimmed = recordUserId.trim();
  if (!isValidOwnerId(trimmed)) return true;
  return ownerKeys.includes(trimmed);
}

function adaptCalibrationRow(row: ProfileCalibration): CalibrationAuditRecord | null {
  const direct = CalibrationAuditRecordSchema.safeParse(row);
  if (direct.success) return direct.data;
  if (!isPos(row.working_speed_kmh) || !isPos(row.working_pressure_bar) || !isPos(row.total_flow_lmin) || !isPos(row.working_width_m)) return null;
  const adapted = CalibrationAuditRecordSchema.safeParse({
    id: String(row.id ?? ''), userId: row.userId ?? '',
    nomePerfil: row.equipment_name?.trim() || `Calibração #${String(row.id ?? 'local')}`,
    createdAt: LEGACY_EPOCH_ISO, updatedAt: LEGACY_EPOCH_ISO,
    nozzleProfileId: row.nozzle_id !== undefined ? String(row.nozzle_id) : null,
    equipmentId: row.equipment_id !== undefined ? String(row.equipment_id) : null,
    cultureParcelId: null, cultureMomentId: null,
    velocidadeKmh: row.working_speed_kmh, pressaoBar: row.working_pressure_bar,
    debitoTotalLMin: row.total_flow_lmin,
    numBicosAtivos: isPos(row.active_nozzles_count) ? Math.round(row.active_nozzles_count) : 1,
    entrelinhaM: row.working_width_m, volumeRecomendadoEppoLHa: null, caudalArOtimoM3H: null,
    volumeCalibradoLHa: isPos(row.calculated_spray_volume_lha)
      ? row.calculated_spray_volume_lha : (row.total_flow_lmin * 600) / (row.working_speed_kmh * row.working_width_m),
    caudalArAplicadoM3H: typeof row.air_volume_m3h === 'number' && row.air_volume_m3h >= 0 ? row.air_volume_m3h : null,
    iso16122: { desvioMaximoBicosPct: null, simetriaEsqDirPct: null }
  });
  return adapted.success ? adapted.data : null;
}

export async function loadScopedWeatherCalibrations(effectiveUserId: string, ownerKeys: readonly string[]): Promise<CalibrationAuditRecord[]> {
  if (!effectiveUserId) return [];
  const rows = await db.profiles_calibrations.toArray();
  return rows.filter((r) => isLocalOrOwnedByUser(r.userId, ownerKeys))
    .map(adaptCalibrationRow).filter((x): x is CalibrationAuditRecord => x !== null)
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function loadScopedWeatherCultures(effectiveUserId: string, ownerKeys: readonly string[]): Promise<ProfileCulture[]> {
  if (!effectiveUserId) return [];
  const rows = await db.profiles_cultures.toArray();
  return rows.filter((r) => isLocalOrOwnedByUser(r.userId, ownerKeys));
}

export async function loadScopedWeatherMoments(effectiveUserId: string, ownerKeys: readonly string[]): Promise<ProfileCropMoment[]> {
  if (!effectiveUserId) return [];
  const rows = await db.profile_crop_moments.toArray();
  return rows.filter((r) => isLocalOrOwnedByUser(r.userId, ownerKeys));
}

export async function loadScopedWeatherEquipments(effectiveUserId: string, ownerKeys: readonly string[]): Promise<{ v12: EquipmentRecord[]; legacy: ProfileEquipment[] }> {
  if (!effectiveUserId) return { v12: [], legacy: [] };
  const [v12Rows, legRows] = await Promise.all([db.equipments.toArray(), db.profiles_equipment.toArray()]);
  return {
    v12: v12Rows.filter((r) => isLocalOrOwnedByUser(r.userId, ownerKeys)),
    legacy: legRows.filter((r) => isLocalOrOwnedByUser(r.userId, ownerKeys))
  };
}

export async function loadScopedWeatherNozzles(effectiveUserId: string, ownerKeys: readonly string[]): Promise<{ v12: NozzleProfile[]; legacy: ProfileNozzle[] }> {
  if (!effectiveUserId) return { v12: [], legacy: [] };
  const rows = (await db.profiles_nozzles.toArray()).filter((r) => isLocalOrOwnedByUser(r.userId, ownerKeys));
  const v12: NozzleProfile[] = [];
  for (const r of rows) {
    if (r.notes?.startsWith(NOZZLE_V1_PREFIX)) {
      try { v12.push(JSON.parse(r.notes.slice(NOZZLE_V1_PREFIX.length)) as NozzleProfile); } catch { /* ignore */ }
    }
  }
  return { v12, legacy: rows };
}
