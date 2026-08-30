/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Serviço de Histórico, Gestão de Quotas (20 Cálculos) e Imutabilidade
 * Fase 1 & Fase 4 - Gestão Completa de calculation_history_v2
 */

import {
  type CalculationHistoryRecord,
  type HistoryQuotaStatus,
  type StructuredValue,
  type CalculationContext,
  MAX_ACTIVE_CALCULATIONS_PER_TOOL,
  LEGACY_UNASSIGNED_MARKER
} from '../../../types/calculator.ts';
import { db } from '../../../db/db.ts';

/**
 * Avalia o estado da quota de cálculos ativos para um utilizador e calculadora.
 * Regra estrita: Apenas cálculos com isDeleted === false contam para o limite de 20.
 */
export function evaluateHistoryQuota(
  calculatorId: string,
  userId: string,
  records: CalculationHistoryRecord[]
): HistoryQuotaStatus {
  const activeRecords = records.filter(
    (r) => !r.isDeleted && r.calculatorId === calculatorId && r.userId === userId
  );

  const totalActive = activeRecords.length;
  const isLimitReached = totalActive >= MAX_ACTIVE_CALCULATIONS_PER_TOOL;

  return {
    totalActive,
    maxAllowed: MAX_ACTIVE_CALCULATIONS_PER_TOOL,
    isLimitReached,
    canSaveDirectly: !isLimitReached
  };
}

export interface CreateCalculationParams {
  userId: string;
  calculatorId: string;
  calculatorVersion: string;
  inputs: Record<string, StructuredValue>;
  outputs: Record<string, StructuredValue>;
  name?: string;
  notes?: string;
  tags?: string[];
  context?: CalculationContext;
  parentCalculationId?: string | null;
}

/**
 * Cria um novo registo de cálculo respeitando a imutabilidade do histórico,
 * com geração de UUID v4 universal e preparação para sincronização Supabase.
 */
export function buildCalculationRecord(params: CreateCalculationParams): CalculationHistoryRecord {
  if (!params.userId || params.userId.trim() === '') {
    throw new Error('O identificador de utilizador (userId) é obrigatório.');
  }
  if (params.userId.trim() === LEGACY_UNASSIGNED_MARKER) {
    throw new Error('O marcador técnico legado não pode ser utilizado como utilizador para novos cálculos.');
  }
  if (!params.calculatorId || params.calculatorId.trim() === '') {
    throw new Error('O identificador de calculadora (calculatorId) é obrigatório.');
  }

  const now = new Date().toISOString();
  // Utiliza a API nativa Web Crypto standard disponível no browser e Node.js
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const cleanedTags = params.tags ? cleanAndDeduplicateTags(params.tags) : [];

  return {
    id,
    userId: params.userId.trim(),
    calculatorId: params.calculatorId.trim(),
    calculatorVersion: params.calculatorVersion || '1.0.0',
    name: params.name?.trim() || undefined,
    notes: params.notes?.trim() || undefined,
    tags: cleanedTags,
    inputs: { ...params.inputs },
    outputs: { ...params.outputs },
    context: params.context ? { ...params.context } : undefined,
    parentCalculationId: params.parentCalculationId || null,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'local_only',
    syncedAt: null,
    isDeleted: false,
    deletedAt: null
  };
}

/**
 * Limpa, valida e remove duplicados de etiquetas sem diferenciar maiúsculas e minúsculas,
 * preservando a forma de escrita escolhida pelo utilizador.
 */
export function cleanAndDeduplicateTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Filtra registos de histórico por pesquisa textual (nome ou notas) e por etiqueta.
 */
export function filterHistoryRecords(
  records: CalculationHistoryRecord[],
  query?: string,
  tagFilter?: string
): CalculationHistoryRecord[] {
  return records.filter((r) => {
    // Apenas registos ativos
    if (r.isDeleted) return false;

    // Filtro por etiqueta
    if (tagFilter && tagFilter !== 'Todas') {
      const hasTag = r.tags?.some(
        (t) => t.toLowerCase() === tagFilter.toLowerCase()
      );
      if (!hasTag) return false;
    }

    // Filtro por pesquisa textual
    if (query && query.trim() !== '') {
      const q = query.trim().toLowerCase();
      const matchName = r.name?.toLowerCase().includes(q) ?? false;
      const matchNotes = r.notes?.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchNotes) return false;
    }

    return true;
  });
}

/**
 * Aplica soft-delete a um cálculo existente.
 * O cálculo deixa de contar para a quota e desaparece da interface imediatamente,
 * mas preserva o registo para sincronização futura com o Supabase.
 */
export function markCalculationAsDeleted(
  record: CalculationHistoryRecord
): CalculationHistoryRecord {
  const now = new Date().toISOString();
  return {
    ...record,
    isDeleted: true,
    deletedAt: now,
    updatedAt: now,
    syncStatus: record.syncStatus === 'synced' ? 'pending_sync' : record.syncStatus
  };
}

// =========================================================================
// OPERAÇÕES PERSISTENTES DEXIE (EXCLUSIVAMENTE EM calculation_history_v2)
// =========================================================================

/**
 * Grava um novo cálculo ou atualiza um registo exclusivamente em calculation_history_v2.
 * NUNCA escreve na tabela legada calculation_history.
 */
export async function saveCalculationToDb(record: CalculationHistoryRecord): Promise<void> {
  await db.calculation_history_v2.put(record);
}

/**
 * Aplica soft-delete a um cálculo em calculation_history_v2 por ID.
 */
export async function softDeleteCalculationInDb(id: string): Promise<void> {
  const record = await db.calculation_history_v2.get(id);
  if (record) {
    const updated = markCalculationAsDeleted(record);
    await db.calculation_history_v2.put(updated);
  }
}

/**
 * Atualiza metadados (nome, notas, etiquetas) de um cálculo existente em calculation_history_v2.
 */
export async function updateCalculationMetadataInDb(
  id: string,
  metadata: { name?: string; notes?: string; tags?: string[] }
): Promise<void> {
  const record = await db.calculation_history_v2.get(id);
  if (record) {
    const now = new Date().toISOString();
    const updated: CalculationHistoryRecord = {
      ...record,
      name: metadata.name !== undefined ? metadata.name.trim() || undefined : record.name,
      notes: metadata.notes !== undefined ? metadata.notes.trim() || undefined : record.notes,
      tags: metadata.tags !== undefined ? cleanAndDeduplicateTags(metadata.tags) : record.tags,
      updatedAt: now,
      syncStatus: record.syncStatus === 'synced' ? 'pending_sync' : record.syncStatus
    };
    await db.calculation_history_v2.put(updated);
  }
}

/**
 * Limpa todos os cálculos ativos de uma calculadora e utilizador em calculation_history_v2,
 * marcando-os como eliminados (soft-delete).
 * Não altera a tabela legada, dados de outros utilizadores nem outras calculadoras.
 */
export async function clearCalculatorHistoryInDb(
  calculatorId: string,
  userId: string
): Promise<number> {
  const records = await db.calculation_history_v2
    .filter((r) => r.calculatorId === calculatorId && r.userId === userId && !r.isDeleted)
    .toArray();

  const now = new Date().toISOString();
  for (const r of records) {
    await db.calculation_history_v2.put({
      ...r,
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
      syncStatus: r.syncStatus === 'synced' ? 'pending_sync' : r.syncStatus
    });
  }

  return records.length;
}
