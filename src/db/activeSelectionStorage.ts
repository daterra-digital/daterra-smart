// src/db/activeSelectionStorage.ts
import { isValidOwnerId } from '../features/perfis/services/profileOwnership.ts';

export interface ActiveAgronomicSelection {
  cultureParcelId?: string | null;
  equipmentId?: string | null;
  nozzleProfileId?: string | null;
  calibrationId?: string | null;
  updatedAt: string;
}

const STORAGE_PREFIX = 'DATERRA_ACTIVE_AGRONOMIC_SELECTION_V1:';

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof globalThis !== 'undefined' && (globalThis as { localStorage?: Storage }).localStorage) {
      return (globalThis as { localStorage?: Storage }).localStorage ?? null;
    }
  } catch {
    // Storage indisponível ou bloqueado
  }
  return null;
}

function buildKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId.trim()}`;
}

export function getActiveAgronomicSelection(userId?: string | null): ActiveAgronomicSelection | null {
  if (!isValidOwnerId(userId)) return null;
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(buildKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveAgronomicSelection>;
    return {
      cultureParcelId: parsed.cultureParcelId ?? null,
      equipmentId: parsed.equipmentId ?? null,
      nozzleProfileId: parsed.nozzleProfileId ?? null,
      calibrationId: parsed.calibrationId ?? null,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function saveActiveAgronomicSelection(
  userId: string | null | undefined,
  patch: Partial<Omit<ActiveAgronomicSelection, 'updatedAt'>>
): ActiveAgronomicSelection | null {
  if (!isValidOwnerId(userId)) return null;
  const storage = getStorage();
  const current = getActiveAgronomicSelection(userId) ?? { updatedAt: '' };
  const next: ActiveAgronomicSelection = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  if (storage) {
    try {
      storage.setItem(buildKey(userId), JSON.stringify(next));
    } catch {
      // Silencia falha de quota em localStorage
    }
  }
  return next;
}

export function clearActiveAgronomicSelection(userId?: string | null): void {
  if (!isValidOwnerId(userId)) return;
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(buildKey(userId));
  } catch {
    // Silencia
  }
}
