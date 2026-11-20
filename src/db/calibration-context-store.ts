// src/db/calibration-context-store.ts
import { db, type DaterraDatabase, type ProfileCalibration, type ProfileCulture, type ProfileEquipment, type ProfileNozzle } from './db.ts';
import { assertValidOwnerId, isOwnedByUser, isValidOwnerId } from '../features/perfis/services/profileOwnership.ts';
import { parseMomentSnapshot } from '../features/perfis/services/cultureEngineCompatibility.ts';
import { THREE_D_EQUIPMENT_TYPES, type EquipmentRecord } from '../schemas/equipment.schema.ts';
import type { NozzleProfile } from '../schemas/nozzle-profile.schema.ts';
import { getActiveAgronomicSelection } from './activeSelectionStorage.ts';
import {
  CalibrationAuditRecordSchema, WeatherAuditSnapshotSchema, type ActiveAgronomicContext,
  type CalibrationAuditRecord, type CultureContextRef, type EquipmentContextRef, type NozzleContextRef, type WeatherAuditSnapshot
} from '../types/calibration-audit.ts';

const NOZZLE_V1_PREFIX = 'DATERRA_NOZZLE_PROFILE_V1:';
const LEGACY_EPOCH_ISO = '1970-01-01T00:00:00.000Z';
const isPos = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;

function canonicalize(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(canonicalize);
  if (val && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>).sort()) {
      const v = (val as Record<string, unknown>)[k];
      if (v !== undefined) out[k] = canonicalize(v);
    }
    return out;
  }
  return val;
}

async function computeSha256(payload: Omit<CalibrationAuditRecord, 'sha256Seal'>): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalize(payload)));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function adaptLegacyCalibration(row: ProfileCalibration): CalibrationAuditRecord | null {
  const direct = CalibrationAuditRecordSchema.safeParse(row);
  if (direct.success) return direct.data;
  if (!isPos(row.working_speed_kmh) || !isPos(row.working_pressure_bar) || !isPos(row.total_flow_lmin) || !isPos(row.working_width_m)) return null;
  const adapted = CalibrationAuditRecordSchema.safeParse({
    id: String(row.id ?? ''), userId: row.userId ?? '', nomePerfil: row.equipment_name?.trim() || `Calibração #${String(row.id ?? 'local')}`,
    createdAt: LEGACY_EPOCH_ISO, updatedAt: LEGACY_EPOCH_ISO,
    nozzleProfileId: row.nozzle_id !== undefined ? String(row.nozzle_id) : null, equipmentId: row.equipment_id !== undefined ? String(row.equipment_id) : null,
    cultureParcelId: null, cultureMomentId: null, velocidadeKmh: row.working_speed_kmh, pressaoBar: row.working_pressure_bar,
    debitoTotalLMin: row.total_flow_lmin, numBicosAtivos: isPos(row.active_nozzles_count) ? Math.round(row.active_nozzles_count) : 1,
    entrelinhaM: row.working_width_m, volumeRecomendadoEppoLHa: null, caudalArOtimoM3H: null,
    volumeCalibradoLHa: isPos(row.calculated_spray_volume_lha) ? row.calculated_spray_volume_lha : (row.total_flow_lmin * 600) / (row.working_speed_kmh * row.working_width_m),
    caudalArAplicadoM3H: typeof row.air_volume_m3h === 'number' && row.air_volume_m3h >= 0 ? row.air_volume_m3h : null,
    iso16122: { desvioMaximoBicosPct: null, simetriaEsqDirPct: null }
  });
  return adapted.success ? adapted.data : null;
}

/** Calcula selo SHA-256 canónico e grava a calibração em `profiles_calibrations` sem duplicar PK numérica/string. */
export async function saveCalibrationAuditRecord(
  userId: string | null | undefined,
  record: Omit<CalibrationAuditRecord, 'userId' | 'sha256Seal' | 'id'> & { id?: string; userId?: string },
  optionsOrDb?: DaterraDatabase | { mode?: 'update' | 'new'; targetDb?: DaterraDatabase }
): Promise<CalibrationAuditRecord> {
  const ownerId = assertValidOwnerId(userId, 'Sessão inválida: autenticação necessária para guardar calibração.');
  const isDbArg = Boolean(optionsOrDb && 'profiles_calibrations' in optionsOrDb);
  const targetDb = isDbArg ? (optionsOrDb as DaterraDatabase) : ((optionsOrDb as { targetDb?: DaterraDatabase } | undefined)?.targetDb ?? db);
  const optMode = !isDbArg ? (optionsOrDb as { mode?: 'update' | 'new' } | undefined)?.mode : undefined;
  const mode: 'update' | 'new' = optMode ?? (record.id ? 'update' : 'new');
  const nowIso = new Date().toISOString();
  let storagePk: string | number = crypto.randomUUID(), resolvedCreatedAt = nowIso;
  if (mode === 'update' && record.id) {
    const userRows = await targetDb.profiles_calibrations.where('userId').equals(ownerId).toArray();
    const existing = userRows.find((r) => isOwnedByUser(r, ownerId) && String(r.id) === String(record.id));
    if (!existing) {
      const probe = await targetDb.profiles_calibrations.get(/^\d+$/.test(record.id) ? Number(record.id) : record.id);
      if (probe && !isOwnedByUser(probe, ownerId)) throw new Error('Acesso negado: calibração pertence a outra conta.');
    }
    storagePk = existing?.id !== undefined ? existing.id : record.id;
    resolvedCreatedAt = typeof existing?.createdAt === 'string' && existing.createdAt.trim() ? existing.createdAt : (record.createdAt || nowIso);
  }

  const candidate = { ...record, id: String(storagePk), createdAt: resolvedCreatedAt, userId: ownerId };
  delete (candidate as Partial<CalibrationAuditRecord>).sha256Seal;
  const unsigned = CalibrationAuditRecordSchema.omit({ sha256Seal: true }).parse(candidate);
  const sealed = CalibrationAuditRecordSchema.parse({ ...unsigned, sha256Seal: await computeSha256(unsigned) });
  const eqNum = sealed.equipmentId && /^\d+$/.test(sealed.equipmentId) ? Number(sealed.equipmentId) : undefined;
  const nzNum = sealed.nozzleProfileId && /^\d+$/.test(sealed.nozzleProfileId) ? Number(sealed.nozzleProfileId) : undefined;
  const row: ProfileCalibration = {
    ...sealed, id: storagePk, equipment_id: eqNum, nozzle_id: nzNum, working_speed_kmh: sealed.velocidadeKmh,
    working_pressure_bar: sealed.pressaoBar, working_width_m: sealed.entrelinhaM,
    active_nozzles_count: sealed.numBicosAtivos, total_flow_lmin: sealed.debitoTotalLMin,
    calculated_spray_volume_lha: sealed.volumeCalibradoLHa, ...(sealed.caudalArAplicadoM3H !== null ? { air_volume_m3h: sealed.caudalArAplicadoM3H } : {})
  };
  await targetDb.transaction('rw', targetDb.profiles_calibrations, async () => { await targetDb.profiles_calibrations.put(row); });
  return sealed;
}

/** Elimina uma ficha de calibração garantindo titularidade estrita por userId. */
export async function deleteCalibrationAuditRecord(userId: string | null | undefined, id: string, targetDb: DaterraDatabase = db): Promise<boolean> {
  if (!isValidOwnerId(userId) || !id) return false;
  const ownerId = userId.trim();
  const key: string | number = /^\d+$/.test(id) ? Number(id) : id;
  return targetDb.transaction('rw', targetDb.profiles_calibrations, async () => {
    const existing = (await targetDb.profiles_calibrations.get(key)) ?? (typeof key === 'number' ? await targetDb.profiles_calibrations.get(id) : undefined);
    if (!isOwnedByUser(existing, ownerId) || existing.id === undefined) return false;
    await targetDb.profiles_calibrations.delete(existing.id);
    return true;
  });
}

/** Lista calibrações do utilizador autenticado ordenadas da mais recente para a mais antiga. */
export async function listCalibrationAuditRecords(userId: string | null | undefined, targetDb: DaterraDatabase = db): Promise<CalibrationAuditRecord[]> {
  if (!isValidOwnerId(userId)) return [];
  const ownerId = userId.trim();
  const rows = await targetDb.profiles_calibrations.where('userId').equals(ownerId).toArray();
  return rows.filter((r) => isOwnedByUser(r, ownerId)).map(adaptLegacyCalibration).filter((x): x is CalibrationAuditRecord => x !== null)
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

async function resolveCultureRef(ownerId: string, cultures: ProfileCulture[], targetDb: DaterraDatabase, id?: string | number | null): Promise<CultureContextRef | null> {
  const chosen = (id != null ? cultures.find((c) => String(c.id) === String(id)) : undefined)
    ?? cultures.find((c) => Boolean(c.active_moment_id) || isPos(c.last_trv_m3_ha) || isPos(c.last_lwa_m2_ha)) ?? cultures[0];
  if (!chosen || chosen.id === undefined) return null;
  const m = chosen.active_moment_id ? await targetDb.profile_crop_moments.get(chosen.active_moment_id) : undefined;
  const activeMoment = m && isOwnedByUser(m, ownerId) ? m : null;
  const snap = activeMoment?.snapshotJson ? parseMomentSnapshot(activeMoment.snapshotJson) : null;
  return {
    id: String(chosen.id), name: chosen.name, cropType: chosen.crop_type,
    entrelinhaM: isPos(snap?.rowDistanceM) ? snap.rowDistanceM : isPos(chosen.row_distance_m) ? chosen.row_distance_m : null,
    trvM3Ha: isPos(snap?.trvPure) ? snap.trvPure : isPos(chosen.last_trv_m3_ha) ? chosen.last_trv_m3_ha : null,
    lwaM2Ha: isPos(snap?.lwaBilateral) ? snap.lwaBilateral : isPos(chosen.last_lwa_m2_ha) ? chosen.last_lwa_m2_ha : null,
    volumeRecomendadoEppoLHa: isPos(snap?.recommendedSprayVolumeLHa) ? snap.recommendedSprayVolumeLHa : isPos(chosen.last_spray_volume_lha) ? chosen.last_spray_volume_lha : null,
    activeMomentId: activeMoment?.id !== undefined ? String(activeMoment.id) : null, record: chosen, activeMoment, momentSnapshot: snap
  };
}

function resolveEquipmentRef(v12List: EquipmentRecord[], legacyList: ProfileEquipment[], id?: string | null): EquipmentContextRef | null {
  const sorted = [...v12List].sort((a, b) => (b.lastUpdatedAt || '').localeCompare(a.lastUpdatedAt || ''));
  const v12 = (id ? sorted.find((e) => e.id === id) : undefined) ?? sorted[0];
  if (v12) return {
    id: v12.id, name: v12.name, sourceStore: 'equipments_v12', equipmentType: v12.type, isDroneUav: v12.type === 'UAV_DRONE',
    is3DOrAirAssisted: THREE_D_EQUIPMENT_TYPES.has(v12.type) || Boolean(v12.airAssisted),
    caudalArAplicadoM3H: typeof v12.defaultAirflowM3h === 'number' && v12.defaultAirflowM3h >= 0 ? v12.defaultAirflowM3h : null, recordV12: v12, legacyRecord: null
  };
  const leg = (id ? legacyList.find((e) => String(e.id) === id) : undefined) ?? legacyList[0];
  return leg?.id !== undefined ? {
    id: String(leg.id), name: leg.name, sourceStore: 'profiles_equipment', equipmentType: leg.distribution_type ?? null,
    is3DOrAirAssisted: Boolean(leg.has_air_sleeve || leg.fan_type), isDroneUav: (leg.distribution_type || '').toLowerCase().includes('drone'),
    caudalArAplicadoM3H: null, recordV12: null, legacyRecord: leg
  } : null;
}

function resolveNozzleRef(nozzles: ProfileNozzle[], preferredId?: string | null): NozzleContextRef | null {
  const list = nozzles.flatMap((row): Array<{ item: NozzleContextRef; updatedAt: string }> => {
    if (row.notes?.startsWith(NOZZLE_V1_PREFIX)) {
      try {
        const p = JSON.parse(row.notes.slice(NOZZLE_V1_PREFIX.length)) as NozzleProfile;
        return [{ updatedAt: p.updatedAt || '', item: { id: p.id, label: p.name, referencePressureBar: isPos(p.referencePressureBar) ? p.referencePressureBar : null, totalActiveFlowLMin: p.totalActiveFlowLMin, activeNozzleCount: p.activeSlotsCount > 0 ? p.activeSlotsCount : null, profile: p, legacyRecord: row } }];
      } catch { /* fallback */ }
    }
    return row.id === undefined ? [] : [{ updatedAt: '', item: { id: String(row.id), label: `${row.manufacturer} ${row.model}`.trim(), referencePressureBar: isPos(row.working_pressure_bar) ? row.working_pressure_bar : null, totalActiveFlowLMin: row.nominal_flow_lmin >= 0 ? row.nominal_flow_lmin : null, activeNozzleCount: null, profile: null, legacyRecord: row } }];
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (preferredId ? list.find((n) => n.item.id === preferredId)?.item : undefined) ?? list[0]?.item ?? null;
}

/** Resolve o contexto agronómico ativo unificado a partir do IndexedDB local com isolamento estrito por userId. */
export async function getActiveAgronomicContext(
  userId: string | null | undefined,
  options: { cultureId?: string | number; equipmentId?: string; nozzleProfileId?: string; calibrationId?: string; weatherSnapshot?: WeatherAuditSnapshot | null; targetDb?: DaterraDatabase } = {}
): Promise<ActiveAgronomicContext | null> {
  if (!isValidOwnerId(userId)) return null;
  const ownerId = userId.trim(), targetDb = options.targetDb ?? db, sel = getActiveAgronomicSelection(ownerId);
  const [cultures, eqV12, eqLegacy, nozzles, calibrations] = await Promise.all([
    targetDb.profiles_cultures.where('userId').equals(ownerId).toArray(), targetDb.equipments.where('userId').equals(ownerId).toArray(),
    targetDb.profiles_equipment.where('userId').equals(ownerId).toArray(), targetDb.profiles_nozzles.where('userId').equals(ownerId).toArray(),
    listCalibrationAuditRecords(ownerId, targetDb)
  ]);
  return {
    userId: ownerId, resolvedAt: new Date().toISOString(),
    culture: await resolveCultureRef(ownerId, cultures.filter((c) => isOwnedByUser(c, ownerId)), targetDb, options.cultureId ?? sel?.cultureParcelId),
    equipment: resolveEquipmentRef(eqV12.filter((e) => isOwnedByUser(e, ownerId)), eqLegacy.filter((e) => isOwnedByUser(e, ownerId)), options.equipmentId ?? sel?.equipmentId),
    nozzleProfile: resolveNozzleRef(nozzles.filter((n) => isOwnedByUser(n, ownerId)), options.nozzleProfileId ?? sel?.nozzleProfileId),
    calibration: ((options.calibrationId ?? sel?.calibrationId) ? calibrations.find((c) => c.id === (options.calibrationId ?? sel?.calibrationId)) : undefined) ?? calibrations[0] ?? null,
    weatherSnapshot: options.weatherSnapshot ? WeatherAuditSnapshotSchema.parse(options.weatherSnapshot) : null
  };
}
