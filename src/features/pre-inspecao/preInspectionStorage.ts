import type { PreInspectionSavedRecord } from './types/inspecaoTypes';

export type { PreInspectionSavedRecord };

const STORAGE_KEY = 'daterra_pre_inspection_history_v1';

export function loadPreInspectionHistory(): PreInspectionSavedRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePreInspectionRecord(
  payload: Omit<PreInspectionSavedRecord, 'id' | 'dateIso'>
): PreInspectionSavedRecord[] {
  const existing = loadPreInspectionHistory();
  const newRecord: PreInspectionSavedRecord = {
    ...payload,
    id: `pre_insp_${Date.now()}`,
    dateIso: new Date().toISOString()
  };
  const updated = [newRecord, ...existing].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Fallback silencioso caso o localStorage esteja cheio
  }
  return updated;
}

export function deletePreInspectionRecord(id: string): PreInspectionSavedRecord[] {
  const existing = loadPreInspectionHistory();
  const updated = existing.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Fallback silencioso
  }
  return updated;
}
