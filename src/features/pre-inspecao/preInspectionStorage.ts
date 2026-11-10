import type { PreInspectionSavedRecord } from './types/inspecaoTypes';

export type { PreInspectionSavedRecord };

const STORAGE_KEY = 'daterra_pre_inspection_history_v1';
const MAX_RECORDS_PER_USER = 50;

function readAllRawRecords(): PreInspectionSavedRecord[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllRawRecords(records: PreInspectionSavedRecord[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  } catch {
    // Silencia falha de quota em modo privado
  }
}

export function loadPreInspectionHistory(userId?: string | null): PreInspectionSavedRecord[] {
  const scopedUid = typeof userId === 'string' ? userId.trim() : '';
  if (!scopedUid) return [];
  return readAllRawRecords().filter((r) => r.userId === scopedUid);
}

export function savePreInspectionRecord(
  payload: Omit<PreInspectionSavedRecord, 'id' | 'dateIso'>,
  userId?: string | null
): PreInspectionSavedRecord[] {
  const scopedUid = (typeof userId === 'string' ? userId : payload.userId || '').trim();
  if (!scopedUid) {
    throw new Error('Sessão de utilizador obrigatória para guardar pré-inspeção.');
  }

  const all = readAllRawRecords();
  const newRecord: PreInspectionSavedRecord = {
    ...payload,
    userId: scopedUid,
    id: `pre_insp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    dateIso: new Date().toISOString()
  };

  const userRecords = [newRecord, ...all.filter((r) => r.userId === scopedUid)].slice(0, MAX_RECORDS_PER_USER);
  const otherRecords = all.filter((r) => r.userId !== scopedUid);
  writeAllRawRecords([...userRecords, ...otherRecords]);
  return userRecords;
}

export function deletePreInspectionRecord(id: string, userId?: string | null): PreInspectionSavedRecord[] {
  const scopedUid = typeof userId === 'string' ? userId.trim() : '';
  if (!scopedUid) return [];

  const all = readAllRawRecords();
  const updatedAll = all.filter((r) => !(r.id === id && r.userId === scopedUid));
  writeAllRawRecords(updatedAll);
  return updatedAll.filter((r) => r.userId === scopedUid);
}
