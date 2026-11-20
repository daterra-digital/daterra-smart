// src/services/auth/localUserDataPresence.ts
import { db, type DaterraDatabase } from '../../db/db.ts';
import { isValidOwnerId } from '../../features/perfis/services/profileOwnership.ts';

const PRE_INSPECTION_STORAGE_KEY = 'daterra_pre_inspection_history_v1';

export type LocalDataPresenceStatus = 'present' | 'absent' | 'indeterminate';

export interface LocalDataPresenceResult {
  status: LocalDataPresenceStatus;
  count: number;
}

function countPreInspectionRecords(
  userId: string,
  storage?: Pick<Storage, 'getItem'> | null
): { count: number; ok: boolean } {
  const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return { count: 0, ok: true };
  try {
    const raw = store.getItem(PRE_INSPECTION_STORAGE_KEY);
    if (!raw) return { count: 0, ok: true };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { count: 0, ok: false };
    const matches = parsed.filter((item) => item && typeof item === 'object' && item.userId === userId);
    return { count: matches.length, ok: true };
  } catch {
    return { count: 0, ok: false };
  }
}

/**
 * Verifica se existem dados do utilizador guardados localmente nas tabelas e chaves
 * abrangidas pela limpeza de sessão. Nunca interpreta ausência de pendências na Outbox
 * nem synced: 1 como existência de cópia de segurança.
 */
export async function hasLocalUserData(
  userId?: string | null,
  targetDb: DaterraDatabase = db,
  storage?: Pick<Storage, 'getItem'> | null
): Promise<LocalDataPresenceResult> {
  if (!isValidOwnerId(userId)) {
    return { status: 'indeterminate', count: 0 };
  }
  const ownerId = userId.trim();

  const userDataTables = [
    targetDb.calculation_history,
    targetDb.calculation_history_v2,
    targetDb.calibration_profiles,
    targetDb.mix_history,
    targetDb.eppo_history,
    targetDb.profiles_cultures,
    targetDb.profile_crop_moments,
    targetDb.profile_moment_revisions,
    targetDb.profile_custom_options,
    targetDb.profiles_equipment,
    targetDb.profiles_nozzles,
    targetDb.profiles_calibrations
  ];

  try {
    const [indexedCounts, equipmentsV12Count] = await Promise.all([
      Promise.all(userDataTables.map((table) => table.where('userId').equals(ownerId).count())),
      targetDb.equipments.filter((row) => row.userId === ownerId).count()
    ]);
    const dbCount = indexedCounts.reduce((sum, n) => sum + n, 0) + equipmentsV12Count;
    const preInsp = countPreInspectionRecords(ownerId, storage);
    const totalCount = dbCount + preInsp.count;

    if (totalCount > 0) {
      return { status: 'present', count: totalCount };
    }
    if (!preInsp.ok) {
      return { status: 'indeterminate', count: 0 };
    }
    return { status: 'absent', count: 0 };
  } catch {
    return { status: 'indeterminate', count: 0 };
  }
}
