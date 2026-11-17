// src/features/perfis/services/profileOwnership.ts
import { LEGACY_UNASSIGNED_MARKER } from '../../../types/calculator.ts';

const FORBIDDEN_OWNER_MARKERS = new Set<string>([
  LEGACY_UNASSIGNED_MARKER,
  'local-user',
  'unassigned'
]);

/**
 * Valida estritamente se um identificador de proprietário representa uma conta autenticada real.
 */
export function isValidOwnerId(userId?: string | null): userId is string {
  if (typeof userId !== 'string') return false;
  const trimmed = userId.trim();
  if (trimmed.length === 0) return false;
  return !FORBIDDEN_OWNER_MARKERS.has(trimmed) && !FORBIDDEN_OWNER_MARKERS.has(trimmed.toLowerCase());
}

/**
 * Garante e normaliza um identificador de utilizador autenticado válido antes de qualquer escrita.
 */
export function assertValidOwnerId(
  userId: string | null | undefined,
  message = 'Sessão inválida: utilizador não autenticado para esta operação.'
): string {
  if (!isValidOwnerId(userId)) {
    throw new Error(message);
  }
  return userId.trim();
}

/**
 * Confirma correspondência explícita de titularidade sem nunca apropriar registos legados ou órfãos.
 */
export function isOwnedByUser<T extends { userId?: string | null }>(
  record: T | null | undefined,
  ownerId: string
): record is T {
  if (!record || typeof record.userId !== 'string') return false;
  if (!isValidOwnerId(ownerId) || !isValidOwnerId(record.userId)) return false;
  return record.userId === ownerId;
}

/**
 * Remove propriedades com valor undefined para omitir campos ausentes na criação
 * e preservar valores existentes em atualizações parciais no Dexie.
 */
export function stripUndefinedFields<T extends Record<string, unknown>>(data: T): T {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean as T;
}
