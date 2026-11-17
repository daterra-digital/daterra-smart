// src/features/perfis/services/cultureCustomOptionStorage.ts
// Persistência atómica e isolada por utilizador para opções locais privadas de Cultura.

import type {
  ProfileCustomOption,
  ProfileCustomOptionCategory
} from '../../../db/cultureTypes.ts';
import type { DaterraDatabase } from '../../../db/db.ts';
import { getActiveProfileDb } from './profileStorageService.ts';
import { isValidOwnerId, isOwnedByUser } from './profileOwnership.ts';

export function normalizeOptionKey(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLocalOptionId(category: ProfileCustomOptionCategory, normalizedKey: string): string {
  const slug = normalizedKey.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'opcao';
  const rand = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `loc-${category}-${slug}-${rand}`;
}

export async function listUserCustomOptions(
  userId: string | null | undefined,
  category?: ProfileCustomOptionCategory,
  cultureKey?: string,
  targetDb?: DaterraDatabase
): Promise<ProfileCustomOption[]> {
  if (!isValidOwnerId(userId)) return [];
  const ownerId = userId.trim();
  const active = targetDb ?? getActiveProfileDb();

  const rows = await active.profile_custom_options.where('userId').equals(ownerId).toArray();
  return rows.filter((row) => {
    if (!isOwnedByUser(row, ownerId)) return false;
    if (category && row.category !== category) return false;
    if (cultureKey !== undefined && (row.cultureKey ?? '') !== cultureKey) return false;
    return true;
  });
}

export function findSimilarOptionLabels(
  candidates: Array<{ label: string }>,
  proposedLabel: string
): string[] {
  const norm = normalizeOptionKey(proposedLabel);
  if (!norm || norm.length < 2) return [];
  return candidates
    .filter((c) => {
      const cNorm = normalizeOptionKey(c.label);
      return cNorm === norm || (cNorm.length >= 3 && (cNorm.includes(norm) || norm.includes(cNorm)));
    })
    .map((c) => c.label)
    .slice(0, 3);
}

export interface SaveCustomOptionResult {
  option: ProfileCustomOption;
  reusedExisting: boolean;
}

export async function saveScopedCustomOption(
  userId: string | null | undefined,
  params: { category: ProfileCustomOptionCategory; cultureKey?: string; label: string },
  targetDb?: DaterraDatabase
): Promise<SaveCustomOptionResult> {
  if (!isValidOwnerId(userId)) {
    throw new Error('Sessão inválida: não é possível guardar opção local sem utilizador autenticado.');
  }
  const ownerId = userId.trim();
  const trimmedLabel = params.label.replace(/\s+/g, ' ').trim();
  const normalizedKey = normalizeOptionKey(trimmedLabel);
  if (!normalizedKey) {
    throw new Error('Indique um nome válido para a opção.');
  }

  const active = targetDb ?? getActiveProfileDb();
  const scopeCultureKey = params.cultureKey?.trim() || undefined;
  const nowIso = new Date().toISOString();

  return active.transaction('rw', active.profile_custom_options, async () => {
    const ownedRows = await active.profile_custom_options.where('userId').equals(ownerId).toArray();
    const existing = ownedRows.find(
      (r) =>
        isOwnedByUser(r, ownerId) &&
        r.category === params.category &&
        (r.cultureKey ?? undefined) === scopeCultureKey &&
        r.normalizedKey === normalizedKey
    );
    if (existing) {
      return { option: existing, reusedExisting: true };
    }

    const record: ProfileCustomOption = {
      localId: buildLocalOptionId(params.category, normalizedKey),
      userId: ownerId,
      category: params.category,
      ...(scopeCultureKey ? { cultureKey: scopeCultureKey } : {}),
      originalLabel: trimmedLabel,
      currentLabel: trimmedLabel,
      normalizedKey,
      status: 'pending_local',
      canonicalId: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    const id = (await active.profile_custom_options.add(record)) as number;
    return { option: { ...record, id }, reusedExisting: false };
  });
}

export async function renameScopedCustomOption(
  userId: string | null | undefined,
  optionId: number,
  newLabel: string,
  targetDb?: DaterraDatabase
): Promise<ProfileCustomOption> {
  if (!isValidOwnerId(userId)) {
    throw new Error('Sessão inválida.');
  }
  const ownerId = userId.trim();
  const trimmed = newLabel.replace(/\s+/g, ' ').trim();
  const normalizedKey = normalizeOptionKey(trimmed);
  if (!normalizedKey) throw new Error('O nome da opção não pode ficar vazio.');

  const active = targetDb ?? getActiveProfileDb();
  return active.transaction('rw', active.profile_custom_options, async () => {
    const existing = await active.profile_custom_options.get(optionId);
    if (!isOwnedByUser(existing, ownerId)) {
      throw new Error('Opção local não encontrada para esta conta.');
    }
    const siblings = await active.profile_custom_options.where('userId').equals(ownerId).toArray();
    const conflict = siblings.find(
      (s) =>
        s.id !== optionId &&
        s.category === existing.category &&
        (s.cultureKey ?? undefined) === (existing.cultureKey ?? undefined) &&
        s.normalizedKey === normalizedKey
    );
    if (conflict) {
      throw new Error('Já existe outra opção com este nome nesta categoria.');
    }
    const updatedAt = new Date().toISOString();
    await active.profile_custom_options.update(optionId, {
      currentLabel: trimmed,
      normalizedKey,
      updatedAt
    });
    return { ...existing, currentLabel: trimmed, normalizedKey, updatedAt };
  });
}
