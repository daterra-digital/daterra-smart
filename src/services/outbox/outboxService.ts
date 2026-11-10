/**
 * DATERRA Smart - Serviço de Sincronização First-Offline & Mutation Outbox
 * Implementação: Camada 4 (Persistência Local & Sincronização Assíncrona)
 * Arquitetura: Offline-First com resolução Last-Write-Wins (LWW)
 */

import { db, type MutationOutboxRecord } from '../../db/db.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../../types/calculator.ts';
import { centralgestOutboxDriver } from '../integrations/centralgestService.ts';
import { handleNewsletterSubscriptionSync } from '../newsletter/newsletterOutboxHandler.ts';

export type EntityType = 'calculation' | 'calibration' | 'equipment' | 'culture' | 'mixture' | 'caderno_campo' | 'newsletter_subscription';
export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface EnqueueMutationOptions<T = any> {
  entityId: string;
  entityType: EntityType;
  operation: OperationType;
  payload: T;
  updatedAt?: string;
  userId?: string;
}

export interface SyncHandlerResult {
  success: boolean;
  action?: 'SYNCED' | 'DISCARD' | 'RETRY' | 'SKIP';
  statusCode?: number;
  error?: string;
}

export type RemoteSyncHandler = (mutation: MutationOutboxRecord) => Promise<boolean | SyncHandlerResult>;

let activeSyncDriver: RemoteSyncHandler = centralgestOutboxDriver;
export function setRemoteSyncHandler(handler: RemoteSyncHandler) { activeSyncDriver = handler; }

let currentActiveSessionUserId: string | null = null;
let currentDrainExecutionId = 0;

export function setOutboxSessionUser(userId: string | null): void {
  currentActiveSessionUserId = (typeof userId === 'string' && userId.trim() !== '' && userId !== LEGACY_UNASSIGNED_MARKER) ? userId.trim() : null;
  currentDrainExecutionId++;
}

export function getOutboxSessionUser(): string | null {
  return currentActiveSessionUserId;
}

export async function getPendingMutationsCount(userId?: string | null): Promise<number> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '' || userId === LEGACY_UNASSIGNED_MARKER) return 0;
  return db.mutation_outbox
    .where('synced').equals(0)
    .filter((m) => m.userId === userId)
    .count();
}

export function calculateBackoffMs(attempts: number): number {
  return Math.min(1000 * Math.pow(2, attempts), 30000);
}

export function sortMutationsLWW(mutations: MutationOutboxRecord[]): MutationOutboxRecord[] {
  return [...mutations].sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
}

export function buildMutationRecord<T = any>(options: EnqueueMutationOptions<T>): MutationOutboxRecord {
  return {
    entityId: options.entityId,
    entityType: options.entityType,
    operation: options.operation,
    payload: options.payload,
    synced: 0,
    updatedAt: options.updatedAt || new Date().toISOString(),
    attempts: 0,
    userId: options.userId || LEGACY_UNASSIGNED_MARKER
  };
}

export async function enqueueMutation<T = any>(options: EnqueueMutationOptions<T>): Promise<number> {
  const id = await db.mutation_outbox.add(buildMutationRecord(options));
  requestBackgroundSync();
  return id;
}

export function requestBackgroundSync(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((reg: any) => reg.sync && reg.sync.register('daterra-sync-outbox'))
      .catch((err) => console.warn('[OutboxService] Background Sync indisponível:', err));
  } else if (typeof window !== 'undefined' && navigator.onLine) {
    setTimeout(() => { drainOutbox().catch(console.error); }, 100);
  }
}

export async function drainOutbox(
  customHandler?: RemoteSyncHandler,
  targetUserId?: string
): Promise<{ processed: number; succeeded: number; failed: number }> {
  // Resolução da identidade da sessão
  const effectiveUserId = targetUserId || currentActiveSessionUserId;

  // Requisito A3: Na ausência de identidade válida, zero mutações privadas são despachadas
  if (!effectiveUserId || typeof effectiveUserId !== 'string' || effectiveUserId.trim() === '' || effectiveUserId === LEGACY_UNASSIGNED_MARKER) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const drainRunId = ++currentDrainExecutionId;
  const handler = customHandler || activeSyncDriver;

  // Requisito A2 & A4: Elimina o comportamento permissivo. Filtra ESTRITAMENTE as mutações de effectiveUserId.
  const pending = await db.mutation_outbox
    .where('synced').equals(0)
    .filter((m) => Boolean(m.userId && m.userId !== LEGACY_UNASSIGNED_MARKER && m.userId === effectiveUserId))
    .toArray();
  if (pending.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

  const grouped = new Map<string, MutationOutboxRecord[]>();
  for (const item of pending) {
    const key = `${item.entityType}:${item.entityId}`;
    const list = grouped.get(key) || [];
    list.push(item);
    grouped.set(key, list);
  }

  let succeeded = 0;
  let failed = 0;

  for (const [_key, mutations] of grouped.entries()) {
    const sorted = sortMutationsLWW(mutations);
    for (const mutation of sorted) {
      // Requisito A5 & A6: Verificação de sessão ativa ANTES DE CADA ENVIO.
      // Se a sessão expirou, mudou de utilizador ou foi terminada durante a drenagem, interrompe imediatamente!
      if (currentDrainExecutionId !== drainRunId || (currentActiveSessionUserId !== null && currentActiveSessionUserId !== effectiveUserId)) {
        console.warn('[OutboxService] Drenagem interrompida: sessão alterada ou invalidada durante a execução.');
        return { processed: pending.length, succeeded, failed };
      }

      const attempts = mutation.attempts + 1;
      try {
        let res: boolean | SyncHandlerResult;
        if (mutation.entityType === 'newsletter_subscription') {
          res = await handleNewsletterSubscriptionSync(mutation);
        } else {
          res = await handler(mutation);
        }

        if (typeof res === 'object' && res.action === 'SKIP') {
          continue;
        }

        const isSuccess = res === true || (typeof res === 'object' && res.success);
        const isDiscard = typeof res === 'object' && res.action === 'DISCARD';

        if (isSuccess) {
          await db.mutation_outbox.update(mutation.id!, { synced: 1, attempts });
          succeeded++;
        } else if (isDiscard) {
          await db.mutation_outbox.update(mutation.id!, {
            synced: 1,
            attempts,
            lastError: (typeof res === 'object' && res.error) || 'Erro descartado'
          });
          succeeded++;
        } else {
          throw new Error((typeof res === 'object' && res.error) || 'Falha no despacho da mutação');
        }
      } catch (err: any) {
        failed++;
        const backoffMs = calculateBackoffMs(attempts);
        await db.mutation_outbox.update(mutation.id!, {
          attempts,
          lastError: err?.message || 'Erro de rede'
        });
        console.warn(`[OutboxService] Erro ao sincronizar ${mutation.entityType}:${mutation.entityId} (retry em ${backoffMs}ms):`, err);
      }
    }
  }

  return { processed: pending.length, succeeded, failed };
}

// Requisito A8: Processamento de mutações públicas (newsletter sem sessão) como percurso separado
export async function drainPublicOutbox(): Promise<{ processed: number; succeeded: number; failed: number }> {
  const pending = await db.mutation_outbox
    .where('synced').equals(0)
    .filter((m) => m.entityType === 'newsletter_subscription')
    .toArray();

  if (pending.length === 0) return { processed: 0, succeeded: 0, failed: 0 };
  let succeeded = 0;
  let failed = 0;

  for (const mutation of pending) {
    try {
      const res = await handleNewsletterSubscriptionSync(mutation);
      if (res) {
        await db.mutation_outbox.update(mutation.id!, { synced: 1, attempts: mutation.attempts + 1 });
        succeeded++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { processed: pending.length, succeeded, failed };
}

export function initOutboxListeners(): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleOnline = () => {
    console.log('[OutboxService] Conexão restabelecida. A drenar outbox...');
    drainOutbox().catch(console.error);
  };
  window.addEventListener('online', handleOnline);
  if (navigator.onLine) handleOnline();
  return () => window.removeEventListener('online', handleOnline);
}
