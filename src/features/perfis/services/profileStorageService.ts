// src/features/perfis/services/profileStorageService.ts
/**
 * DATERRA Smart - Serviço de Armazenamento e Isolamento de Perfis (SEC-REM-01)
 * Segregação por utilizador, validação de titularidade e blindagem contra fuga de dados.
 * (< 200 LOC)
 */
import { db } from '../../../db/db.ts';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/types.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../../../types/calculator.ts';

let activeDb = db;
export function setProfileStorageDb(customDb?: typeof db): void {
  activeDb = customDb || db;
}

export function isValidUserId(userId?: string | null): userId is string {
  return typeof userId === 'string' && userId.trim() !== '' && userId !== LEGACY_UNASSIGNED_MARKER;
}

// 1. LEITURAS SCOPED (Apenas perfis do utilizador autenticado)
export async function getScopedCultures(userId?: string | null): Promise<ProfileCulture[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_cultures.where('userId').equals(userId).toArray();
}

export async function getScopedEquipment(userId?: string | null): Promise<ProfileEquipment[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_equipment.where('userId').equals(userId).toArray();
}

export async function getScopedNozzles(userId?: string | null): Promise<ProfileNozzle[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_nozzles.where('userId').equals(userId).toArray();
}

export async function getScopedCalibrations(userId?: string | null): Promise<ProfileCalibration[]> {
  if (!isValidUserId(userId)) return [];
  return activeDb.profiles_calibrations.where('userId').equals(userId).toArray();
}

// 2. GRAVAÇÕES SCOPED COM VALIDAÇÃO DE TITULARIDADE E RELAÇÕES
export async function saveScopedCulture(
  userId: string | null | undefined,
  data: Omit<ProfileCulture, 'id' | 'userId'>,
  id?: number
): Promise<number> {
  if (!isValidUserId(userId)) {
    throw new Error('Sessão inválida: utilizador não autenticado para gravar perfil de cultura.');
  }

  if (id) {
    return activeDb.transaction('rw', activeDb.profiles_cultures, async () => {
      const existing = await activeDb.profiles_cultures.get(id);
      if (!existing || existing.userId !== userId) {
        throw new Error('Acesso negado: perfil de cultura não pertence ao utilizador autenticado.');
      }
      await activeDb.profiles_cultures.update(id, { ...data, userId });
      return id;
    });
  }

  const newId = await activeDb.profiles_cultures.add({ ...data, userId });
  return Number(newId);
}

export async function saveScopedEquipment(
  userId: string | null | undefined,
  data: Omit<ProfileEquipment, 'id' | 'userId'>,
  id?: number
): Promise<number> {
  if (!isValidUserId(userId)) {
    throw new Error('Sessão inválida: utilizador não autenticado para gravar equipamento.');
  }

  if (id) {
    return activeDb.transaction('rw', activeDb.profiles_equipment, async () => {
      const existing = await activeDb.profiles_equipment.get(id);
      if (!existing || existing.userId !== userId) {
        throw new Error('Acesso negado: equipamento não pertence ao utilizador autenticado.');
      }
      await activeDb.profiles_equipment.update(id, { ...data, userId });
      return id;
    });
  }

  const newId = await activeDb.profiles_equipment.add({ ...data, userId });
  return Number(newId);
}

export async function saveScopedNozzle(
  userId: string | null | undefined,
  data: Omit<ProfileNozzle, 'id' | 'userId'>,
  id?: number
): Promise<number> {
  if (!isValidUserId(userId)) {
    throw new Error('Sessão inválida: utilizador não autenticado para gravar bico.');
  }

  return activeDb.transaction('rw', [activeDb.profiles_nozzles, activeDb.profiles_equipment], async () => {
    if (data.equipment_id) {
      const eq = await activeDb.profiles_equipment.get(data.equipment_id);
      if (!eq || eq.userId !== userId) {
        throw new Error('Acesso negado: o equipamento associado não pertence ao utilizador.');
      }
    }

    if (id) {
      const existing = await activeDb.profiles_nozzles.get(id);
      if (!existing || existing.userId !== userId) {
        throw new Error('Acesso negado: bico não pertence ao utilizador autenticado.');
      }
      await activeDb.profiles_nozzles.update(id, { ...data, userId });
      return id;
    }

    const newId = await activeDb.profiles_nozzles.add({ ...data, userId });
    return Number(newId);
  });
}

export async function saveScopedCalibration(
  userId: string | null | undefined,
  data: Omit<ProfileCalibration, 'id' | 'userId'>,
  id?: number
): Promise<number> {
  if (!isValidUserId(userId)) {
    throw new Error('Sessão inválida: utilizador não autenticado para gravar calibração.');
  }

  return activeDb.transaction('rw', [activeDb.profiles_calibrations, activeDb.profiles_equipment, activeDb.profiles_nozzles], async () => {
    if (data.equipment_id) {
      const eq = await activeDb.profiles_equipment.get(data.equipment_id);
      if (!eq || eq.userId !== userId) {
        throw new Error('Acesso negado: o equipamento associado não pertence ao utilizador.');
      }
    }
    if (data.nozzle_id) {
      const nz = await activeDb.profiles_nozzles.get(data.nozzle_id);
      if (!nz || nz.userId !== userId) {
        throw new Error('Acesso negado: o bico associado não pertence ao utilizador.');
      }
      if (data.equipment_id && nz.equipment_id && nz.equipment_id !== data.equipment_id) {
        throw new Error('Incompatibilidade: o bico selecionado pertence a outro equipamento.');
      }
    }

    if (id) {
      const existing = await activeDb.profiles_calibrations.get(id);
      if (!existing || existing.userId !== userId) {
        throw new Error('Acesso negado: calibração não pertence ao utilizador autenticado.');
      }
      await activeDb.profiles_calibrations.update(id, { ...data, userId });
      return id;
    }

    const newId = await activeDb.profiles_calibrations.add({ ...data, userId });
    return Number(newId);
  });
}

// 3. ELIMINAÇÕES SCOPED
export async function deleteScopedProfile(
  userId: string | null | undefined,
  table: 'cultures' | 'equipment' | 'nozzles' | 'calibrations',
  id: number
): Promise<boolean> {
  if (!isValidUserId(userId) || !id) return false;

  const targetTable = table === 'cultures' ? activeDb.profiles_cultures
    : table === 'equipment' ? activeDb.profiles_equipment
    : table === 'nozzles' ? activeDb.profiles_nozzles
    : activeDb.profiles_calibrations;

  return activeDb.transaction('rw', targetTable, async () => {
    const existing = await targetTable.get(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    await targetTable.delete(id);
    return true;
  });
}

export async function deleteUserProfilesBatch(
  userId: string | null | undefined,
  table: 'cultures' | 'equipment' | 'nozzles' | 'calibrations'
): Promise<number> {
  if (!isValidUserId(userId)) return 0;

  const targetTable = table === 'cultures' ? activeDb.profiles_cultures
    : table === 'equipment' ? activeDb.profiles_equipment
    : table === 'nozzles' ? activeDb.profiles_nozzles
    : activeDb.profiles_calibrations;

  return targetTable.where('userId').equals(userId).delete();
}
