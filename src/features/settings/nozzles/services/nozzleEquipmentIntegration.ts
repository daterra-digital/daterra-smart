// src/features/settings/nozzles/services/nozzleEquipmentIntegration.ts
import { db, type DaterraDatabase, type ProfileNozzle } from '../../../../db/db.ts';
import { isOwnedByUser, isValidOwnerId } from '../../../perfis/services/profileOwnership.ts';
import { getEquipmentTypeLabelPt } from '../../../../lib/equipment-math.ts';
import type { EquipmentRecord } from '../../../../schemas/equipment.schema.ts';
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';
import { saveScopedNozzleProfile } from './nozzleProfileStorage.ts';

const NOZZLE_V1_PREFIX = 'DATERRA_NOZZLE_PROFILE_V1:';
const fmtPt = (n: number): string => n.toFixed(2).replace('.', ',');

export interface NozzleSetDisplayOption {
  key: string;
  label: string;
  meta: string;
  equipmentId?: string;
  equipmentName?: string;
  referencePressureBar: number | null;
  totalActiveFlowLMin: number | null;
  activeSlotsCount: number | null;
  legacyDesc: string;
  profile: NozzleProfile | null;
}

export async function listScopedEquipmentsV12(
  userId?: string | null,
  targetDb: DaterraDatabase = db
): Promise<EquipmentRecord[]> {
  if (!isValidOwnerId(userId)) return [];
  const ownerId = userId.trim();
  const owned = await targetDb.equipments.where('userId').equals(ownerId).toArray();
  return owned.filter((row) => isOwnedByUser(row, ownerId))
    .sort((a, b) => (b.lastUpdatedAt || '').localeCompare(a.lastUpdatedAt || ''));
}

export function parseNozzleSetOption(row: ProfileNozzle): NozzleSetDisplayOption {
  const legacyDesc = `${row.manufacturer} ${row.model} (${row.color})`.trim();
  if (row.notes?.startsWith(NOZZLE_V1_PREFIX)) {
    try {
      const p = JSON.parse(row.notes.slice(NOZZLE_V1_PREFIX.length)) as NozzleProfile;
      const typeLabel = getEquipmentTypeLabelPt(p.equipmentType);
      const press = String(p.referencePressureBar).replace('.', ',');
      const meta = `${typeLabel} · ${p.activeSlotsCount}/${p.totalSlotsCount} bicos · ${fmtPt(p.totalActiveFlowLMin)} L/min @ ${press} bar`;
      return {
        key: p.id, label: p.name, meta, equipmentId: p.equipmentId, equipmentName: p.equipmentName,
        referencePressureBar: p.referencePressureBar, totalActiveFlowLMin: p.totalActiveFlowLMin,
        activeSlotsCount: p.activeSlotsCount, legacyDesc, profile: p
      };
    } catch { /* fallback legado */ }
  }
  const flow = String(row.nominal_flow_lmin).replace('.', ',');
  const press = String(row.working_pressure_bar).replace('.', ',');
  return {
    key: String(row.id ?? legacyDesc), label: legacyDesc,
    meta: [`ISO: ${row.color}`, `${flow} L/min @ ${press} bar`, row.nozzle_type, row.iso_classification].filter(Boolean).join(' · '),
    equipmentName: row.equipment_name, referencePressureBar: row.working_pressure_bar || null,
    totalActiveFlowLMin: row.nominal_flow_lmin || null, activeSlotsCount: null, legacyDesc, profile: null
  };
}

export function isNozzleOptionSelected(associatedIds: readonly string[], opt: NozzleSetDisplayOption): boolean {
  return associatedIds.includes(opt.key) || associatedIds.includes(opt.label) || associatedIds.includes(opt.legacyDesc);
}

export async function syncNozzleLinksForEquipment(
  userId: string,
  equipmentId: string,
  equipmentName: string,
  selectedKeys: readonly string[],
  targetDb: DaterraDatabase = db
): Promise<void> {
  if (!isValidOwnerId(userId)) return;
  const ownerId = userId.trim();
  const rows = await targetDb.profiles_nozzles.where('userId').equals(ownerId).toArray();
  for (const row of rows) {
    if (!isOwnedByUser(row, ownerId)) continue;
    const opt = parseNozzleSetOption(row);
    if (!opt.profile) continue;
    const shouldLink = isNozzleOptionSelected(selectedKeys, opt);
    const wasLinkedHere = opt.profile.equipmentId === equipmentId;
    if (shouldLink && (!wasLinkedHere || opt.profile.equipmentName !== equipmentName)) {
      await saveScopedNozzleProfile({ ...opt.profile, equipmentId, equipmentName, updatedAt: new Date().toISOString() }, ownerId, targetDb);
    } else if (!shouldLink && wasLinkedHere) {
      await saveScopedNozzleProfile({ ...opt.profile, equipmentId: undefined, equipmentName: undefined, updatedAt: new Date().toISOString() }, ownerId, targetDb);
    }
  }
}

export async function syncEquipmentLinksForNozzle(
  userId: string | null | undefined,
  nozzleProfile: NozzleProfile,
  previousEquipmentId?: string,
  targetDb: DaterraDatabase = db
): Promise<void> {
  if (!isValidOwnerId(userId)) return;
  const ownerId = userId.trim();
  const removeRef = async (eqId: string) => {
    const eq = await targetDb.equipments.get(eqId);
    if (!isOwnedByUser(eq, ownerId) || !eq.associatedNozzleIds) return;
    const nextIds = eq.associatedNozzleIds.filter((id) => id !== nozzleProfile.id && id !== nozzleProfile.name);
    await targetDb.equipments.put({ ...eq, associatedNozzleIds: nextIds.length > 0 ? nextIds : undefined, lastUpdatedAt: new Date().toISOString() });
  };
  if (previousEquipmentId && previousEquipmentId !== nozzleProfile.equipmentId) await removeRef(previousEquipmentId);
  if (nozzleProfile.equipmentId) {
    const eq = await targetDb.equipments.get(nozzleProfile.equipmentId);
    if (!isOwnedByUser(eq, ownerId)) return;
    const curr = eq.associatedNozzleIds ?? [];
    if (!curr.includes(nozzleProfile.id)) {
      const cleaned = curr.filter((id) => id !== nozzleProfile.name);
      await targetDb.equipments.put({ ...eq, associatedNozzleIds: [...cleaned, nozzleProfile.id], lastUpdatedAt: new Date().toISOString() });
    }
  }
}
