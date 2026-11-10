import { db } from '../../db/db.ts';
import type { EppoHistoryRecord } from '../ajuste-dose-eppo/types/eppoHistory.ts';

function normalizeUserId(userId?: string | null): string {
  return typeof userId === 'string' ? userId.trim() : '';
}

/** Lista registos de histórico EPPO pertencentes exclusivamente ao utilizador autenticado. */
export async function listEppoHistoryForUser(userId?: string | null): Promise<EppoHistoryRecord[]> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId || !db?.eppo_history) return [];

  const records = await db.eppo_history.where('userId').equals(scopedUserId).toArray();
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Adiciona um registo de histórico EPPO vinculado obrigatoriamente ao userId autenticado. */
export async function addEppoHistoryForUser(
  userId: string | null | undefined,
  record: Omit<EppoHistoryRecord, 'id' | 'userId'>
): Promise<number | undefined> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId) {
    throw new Error('Sessão de utilizador obrigatória para guardar histórico EPPO.');
  }

  return db.eppo_history.add({
    ...record,
    userId: scopedUserId
  });
}

/** Elimina um registo EPPO apenas se pertencer ao utilizador autenticado. */
export async function deleteEppoHistoryForUser(
  id: number,
  userId?: string | null
): Promise<boolean> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId) return false;

  const existing = await db.eppo_history.get(id);
  if (!existing || existing.userId !== scopedUserId) return false;

  await db.eppo_history.delete(id);
  return true;
}
