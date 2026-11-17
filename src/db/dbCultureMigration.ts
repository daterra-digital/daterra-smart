// src/db/dbCultureMigration.ts
import type { Transaction } from 'dexie';
import type { ProfileCulture, ProfileCropMomentSnapshot } from './types.ts';
import { isValidOwnerId } from '../features/perfis/services/profileOwnership.ts';

export const V11_STORES = {
  calculation_history: '++id, date, calculator_type, profile_id, userId',
  profiles_cultures: '++id, name, crop_type, last_lwa_m2_ha, last_trv_m3_ha, userId',
  profiles_equipment: '++id, name, machine_efficiency_pct, userId',
  profiles_nozzles: '++id, manufacturer, model, equipment_id, userId',
  profiles_calibrations: '++id, equipment_id, nozzle_id, userId',
  microlearning_content: '++id, &field_key',
  installed_tools: '++id, &tool_id',
  calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
  calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted',
  mix_history: '++id, date, userId',
  active_substances: 'id, name, moa, nameEn',
  eppo_history: '++id, date, userId',
  mutation_outbox: '++id, entityId, entityType, operation, synced, updatedAt, attempts, userId',
  profile_crop_moments: '++id, cultureId, userId, observedAt, [userId+cultureId]',
  profile_moment_revisions: '++id, momentId, cultureId, userId, createdAt, [userId+momentId]',
  profile_custom_options: '++id, localId, userId, category, cultureKey, normalizedKey, [userId+category], [userId+category+normalizedKey]'
};

/**
 * Migração conservadora Dexie v10 -> v11:
 * - Cria momentos legados sem data (observedAt: null) apenas para culturas com titular válido e dados vegetativos.
 * - Não apropria registos órfãos, não mistura telemetria (last_*) com observação e mantém perfis originais intactos.
 */
export async function upgradeDaterraDbToV11(tx: Transaction): Promise<void> {
  const cultures = (await tx.table('profiles_cultures').toArray()) as ProfileCulture[];
  const momentsTable = tx.table('profile_crop_moments');
  const nowIso = new Date().toISOString();

  for (const record of cultures) {
    if (!record.id || !isValidOwnerId(record.userId)) continue;
    const ownerId = record.userId.trim();

    const hasLegacyMomentData = Boolean(
      (record.phenological_stage && record.phenological_stage.trim().length > 0) ||
      record.canopy_height_m !== undefined ||
      record.canopy_width_m !== undefined ||
      record.lai !== undefined
    );
    if (!hasLegacyMomentData) continue;

    const existingCount = await momentsTable
      .where('[userId+cultureId]')
      .equals([ownerId, record.id])
      .count();
    if (existingCount > 0) continue;

    const stageLabel = record.phenological_stage?.trim() || 'Registo legado sem estádio indicado';
    const snapshot: ProfileCropMomentSnapshot = {
      savedDateDisplay: 'Data desconhecida (legado)',
      cultureLabel: record.crop_type,
      varietyLabel: record.variety,
      stageLabel,
      rowDistanceM: record.row_distance_m,
      canopyHeightM: record.canopy_height_m,
      canopyWidthM: record.canopy_width_m
    };

    await momentsTable.add({
      userId: ownerId,
      cultureId: record.id,
      observedAt: null,
      stageLabel,
      canopyHeightM: record.canopy_height_m,
      canopyWidthM: record.canopy_width_m,
      lai: record.lai,
      measurementSource: 'migrated_legacy_profile',
      snapshotJson: JSON.stringify(snapshot),
      createdAt: nowIso,
      updatedAt: nowIso
    });
  }
}
