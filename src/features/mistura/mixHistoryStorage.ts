import { db } from '../../db/db.ts';
import type { MixHistoryRecord } from './types/mixHistory.ts';

function normalizeUserId(userId?: string | null): string {
  return typeof userId === 'string' ? userId.trim() : '';
}

/** Lista receitas de mistura pertencentes exclusivamente ao utilizador autenticado. */
export async function listMixHistoryForUser(userId?: string | null): Promise<MixHistoryRecord[]> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId || !db?.mix_history) return [];

  const records = await db.mix_history.where('userId').equals(scopedUserId).toArray();
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Conta exclusivamente as receitas do utilizador autenticado. */
export async function countMixHistoryForUser(userId?: string | null): Promise<number> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId || !db?.mix_history) return 0;

  return db.mix_history.where('userId').equals(scopedUserId).count();
}

/** Guarda uma receita de mistura associada obrigatoriamente a um userId válido. */
export async function saveMixHistoryForUser(
  userId: string | null | undefined,
  record: Omit<MixHistoryRecord, 'id' | 'userId'>
): Promise<number | undefined> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId) {
    throw new Error('Sessão de utilizador obrigatória para guardar histórico de mistura.');
  }
  return db.mix_history.add({
    ...record,
    userId: scopedUserId
  });
}

/** Elimina uma receita apenas se pertencer ao utilizador autenticado. */
export async function deleteMixHistoryForUser(
  id: number,
  userId?: string | null
): Promise<boolean> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId) return false;

  const existing = await db.mix_history.get(id);
  if (!existing || existing.userId !== scopedUserId) return false;

  await db.mix_history.delete(id);
  return true;
}

/** Elimina todas as receitas do utilizador autenticado, preservando outros utilizadores e legados. */
export async function clearMixHistoryForUser(userId?: string | null): Promise<number> {
  const scopedUserId = normalizeUserId(userId);
  if (!scopedUserId) return 0;

  return db.mix_history.where('userId').equals(scopedUserId).delete();
}
