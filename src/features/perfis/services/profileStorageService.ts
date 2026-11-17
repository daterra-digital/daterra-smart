// src/features/perfis/services/profileStorageService.ts
// Serviço de Armazenamento e Isolamento de Perfis (SEC-REM-01, <= 200 LOC).
import { db } from '../../../db/db.ts';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/types.ts';
import { assertValidOwnerId, isOwnedByUser, isValidOwnerId, stripUndefinedFields } from './profileOwnership.ts';
import { deleteCultureCascadeScoped, deleteAllUserCulturesSafely } from './cultureDeletionService.ts';

type ProfileTableKey = 'cultures' | 'equipment' | 'nozzles' | 'calibrations';

function resolveProfileTable(database: typeof db, table: ProfileTableKey) {
  if (table === 'cultures') return database.profiles_cultures;
  if (table === 'equipment') return database.profiles_equipment;
  if (table === 'nozzles') return database.profiles_nozzles;
  return database.profiles_calibrations;
}

let activeDb = db;
export function setProfileStorageDb(customDb?: typeof db): void { activeDb = customDb || db; }
export function getActiveProfileDb(): typeof db { return activeDb; }
export function isValidUserId(userId?: string | null): userId is string { return isValidOwnerId(userId); }

// 1. LEITURAS SCOPED (Apenas perfis do utilizador autenticado)
export async function getScopedCultures(userId?: string | null): Promise<ProfileCulture[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_cultures.where('userId').equals(userId.trim()).toArray();
}

export async function getScopedEquipment(userId?: string | null): Promise<ProfileEquipment[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_equipment.where('userId').equals(userId.trim()).toArray();
}

export async function getScopedNozzles(userId?: string | null): Promise<ProfileNozzle[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_nozzles.where('userId').equals(userId.trim()).toArray();
}

export async function getScopedCalibrations(userId?: string | null): Promise<ProfileCalibration[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_calibrations.where('userId').equals(userId.trim()).toArray();
}

// 2. GRAVAÇÕES SCOPED COM VALIDAÇÃO DE TITULARIDADE E RELAÇÕES
export async function saveScopedCulture(
  userId: string | null | undefined,
  data: Omit<ProfileCulture, 'id' | 'userId'> | Partial<Omit<ProfileCulture, 'id' | 'userId'>>,
  id?: number
): Promise<number> {
  const ownerId = assertValidOwnerId(userId, 'Sessão inválida: utilizador não autenticado para gravar perfil de cultura.');
  const cleanData = stripUndefinedFields(data);

  if (id) {
    return activeDb.transaction('rw', activeDb.profiles_cultures, async () => {
      const existing = await activeDb.profiles_cultures.get(id);
      if (!isOwnedByUser(existing, ownerId)) {
        throw new Error('Acesso negado: perfil de cultura não pertence ao utilizador autenticado.');
      }
      await activeDb.profiles_cultures.update(id, { ...cleanData, userId: ownerId });
      return id;
    });
  }

  const newId = await activeDb.profiles_cultures.add({ ...(cleanData as Omit<ProfileCulture, 'id' | 'userId'>), userId: ownerId });
  return Number(newId);
}

export async function saveScopedEquipment(
  userId: string | null | undefined,
  data: Omit<ProfileEquipment, 'id' | 'userId'> | Partial<Omit<ProfileEquipment, 'id' | 'userId'>>,
  id?: number
): Promise<number> {
  const ownerId = assertValidOwnerId(userId, 'Sessão inválida: utilizador não autenticado para gravar equipamento.');
  const cleanData = stripUndefinedFields(data);

  if (id) {
    return activeDb.transaction('rw', activeDb.profiles_equipment, async () => {
      const existing = await activeDb.profiles_equipment.get(id);
      if (!isOwnedByUser(existing, ownerId)) {
        throw new Error('Acesso negado: equipamento não pertence ao utilizador autenticado.');
      }
      await activeDb.profiles_equipment.update(id, { ...cleanData, userId: ownerId });
      return id;
    });
  }

  const newId = await activeDb.profiles_equipment.add({ ...(cleanData as Omit<ProfileEquipment, 'id' | 'userId'>), userId: ownerId });
  return Number(newId);
}

export async function saveScopedNozzle(
  userId: string | null | undefined,
  data: Omit<ProfileNozzle, 'id' | 'userId'> | Partial<Omit<ProfileNozzle, 'id' | 'userId'>>,
  id?: number
): Promise<number> {
  const ownerId = assertValidOwnerId(userId, 'Sessão inválida: utilizador não autenticado para gravar bico.');
  const cleanData = stripUndefinedFields(data);

  return activeDb.transaction('rw', [activeDb.profiles_nozzles, activeDb.profiles_equipment], async () => {
    if (cleanData.equipment_id) {
      const eq = await activeDb.profiles_equipment.get(cleanData.equipment_id);
      if (!isOwnedByUser(eq, ownerId)) {
        throw new Error('Acesso negado: o equipamento associado não pertence ao utilizador.');
      }
    }

    if (id) {
      const existing = await activeDb.profiles_nozzles.get(id);
      if (!isOwnedByUser(existing, ownerId)) {
        throw new Error('Acesso negado: bico não pertence ao utilizador autenticado.');
      }
      await activeDb.profiles_nozzles.update(id, { ...cleanData, userId: ownerId });
      return id;
    }

    const newId = await activeDb.profiles_nozzles.add({ ...(cleanData as Omit<ProfileNozzle, 'id' | 'userId'>), userId: ownerId });
    return Number(newId);
  });
}

export async function saveScopedCalibration(
  userId: string | null | undefined,
  data: Omit<ProfileCalibration, 'id' | 'userId'> | Partial<Omit<ProfileCalibration, 'id' | 'userId'>>,
  id?: number
): Promise<number> {
  const ownerId = assertValidOwnerId(userId, 'Sessão inválida: utilizador não autenticado para gravar calibração.');
  const cleanData = stripUndefinedFields(data);

  return activeDb.transaction('rw', [activeDb.profiles_calibrations, activeDb.profiles_equipment, activeDb.profiles_nozzles], async () => {
    const existing = id ? await activeDb.profiles_calibrations.get(id) : undefined;
    if (id && !isOwnedByUser(existing, ownerId)) {
      throw new Error('Acesso negado: calibração não pertence ao utilizador autenticado.');
    }

    const effectiveEquipmentId = cleanData.equipment_id !== undefined ? cleanData.equipment_id : existing?.equipment_id;
    const effectiveNozzleId = cleanData.nozzle_id !== undefined ? cleanData.nozzle_id : existing?.nozzle_id;

    if (effectiveEquipmentId) {
      const eq = await activeDb.profiles_equipment.get(effectiveEquipmentId);
      if (!isOwnedByUser(eq, ownerId)) {
        throw new Error('Acesso negado: o equipamento associado não pertence ao utilizador.');
      }
    }
    if (effectiveNozzleId) {
      const nz = await activeDb.profiles_nozzles.get(effectiveNozzleId);
      if (!isOwnedByUser(nz, ownerId)) {
        throw new Error('Acesso negado: o bico associado não pertence ao utilizador.');
      }
      if (effectiveEquipmentId && nz.equipment_id && nz.equipment_id !== effectiveEquipmentId) {
        throw new Error('Incompatibilidade: o bico selecionado pertence a outro equipamento.');
      }
    }

    if (id) {
      await activeDb.profiles_calibrations.update(id, { ...cleanData, userId: ownerId });
      return id;
    }

    const newId = await activeDb.profiles_calibrations.add({ ...(cleanData as Omit<ProfileCalibration, 'id' | 'userId'>), userId: ownerId });
    return Number(newId);
  });
}

// 3. ELIMINAÇÕES SCOPED
export async function deleteScopedProfile(
  userId: string | null | undefined,
  table: ProfileTableKey,
  id: number
): Promise<boolean> {
  if (!isValidUserId(userId) || !id) return false;
  const ownerId = userId.trim();
  if (table === 'cultures') return deleteCultureCascadeScoped(activeDb, ownerId, id);
  const targetTable = resolveProfileTable(activeDb, table);

  return activeDb.transaction('rw', targetTable, async () => {
    const existing = await targetTable.get(id);
    if (!isOwnedByUser(existing, ownerId)) {
      return false;
    }
    await targetTable.delete(id);
    return true;
  });
}

export async function deleteUserProfilesBatch(
  userId: string | null | undefined,
  table: ProfileTableKey
): Promise<number> {
  if (!isValidUserId(userId)) return 0;
  if (table === 'cultures') return (await deleteAllUserCulturesSafely(activeDb, userId.trim())).deletedCultures;
  return resolveProfileTable(activeDb, table).where('userId').equals(userId.trim()).delete();
}
