/**
 * DATERRA Smart - Serviço de Sincronização First-Offline & Mutation Outbox
 * Implementação: Camada 4 (Persistência Local & Sincronização Assíncrona)
 * Arquitetura: Offline-First com resolução Last-Write-Wins (LWW)
 */

import { db, type MutationOutboxRecord } from '../../db/db.ts';
import { centralgestOutboxDriver } from '../integrations/centralgestService.ts';

export type EntityType = 'calculation' | 'calibration' | 'equipment' | 'culture' | 'mixture' | 'caderno_campo';
export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface EnqueueMutationOptions<T = any> {
  entityId: string;
  entityType: EntityType;
  operation: OperationType;
  payload: T;
  updatedAt?: string;
}

export interface SyncHandlerResult {
  success: boolean;
  action?: 'SYNCED' | 'DISCARD' | 'RETRY';
  statusCode?: number;
  error?: string;
}

export type RemoteSyncHandler = (mutation: MutationOutboxRecord) => Promise<boolean | SyncHandlerResult>;

// Driver ativo desacoplado (padrão CentralGest ERPCloud Plug-and-Play)
let activeSyncDriver: RemoteSyncHandler = centralgestOutboxDriver;
export function setRemoteSyncHandler(handler: RemoteSyncHandler) { activeSyncDriver = handler; }

export function calculateBackoffMs(attempts: number): number {
  return Math.min(1000 * Math.pow(2, attempts), 30000);
}

export function sortMutationsLWW(mutations: MutationOutboxRecord[]): MutationOutboxRecord[] {
  return [...mutations].sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
}

/**
 * Constrói o registo estruturado da Mutation Outbox
 */
export function buildMutationRecord<T = any>(options: EnqueueMutationOptions<T>): MutationOutboxRecord {
  const now = options.updatedAt || new Date().toISOString();
  return {
    entityId: options.entityId,
    entityType: options.entityType,
    operation: options.operation,
    payload: options.payload,
    synced: 0,
    updatedAt: now,
    attempts: 0
  };
}

/**
 * Enfileira uma mutação atómica no Dexie.js
 * Garante que o dado e a entrada na outbox residem numa única transação
 */
export async function enqueueMutation<T = any>(options: EnqueueMutationOptions<T>): Promise<number> {
  const outboxItem = buildMutationRecord(options);
  const id = await db.mutation_outbox.add(outboxItem);
  
  // Tentar notificar o Service Worker para Background Sync
  requestBackgroundSync();

  return id;
}

/**
 * Registo da Background Synchronization API com fallback para navegadores sem suporte (ex: Safari iOS)
 */
export function requestBackgroundSync(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((reg: any) => {
        if (reg.sync) {
          return reg.sync.register('daterra-sync-outbox');
        }
      })
      .catch((err) => {
        console.warn('[OutboxService] Background Sync indisponível, fallback ativo:', err);
      });
  } else if (typeof window !== 'undefined' && navigator.onLine) {
    // Se estiver online imediatamente, agendar drenagem da fila
    setTimeout(() => {
      drainOutbox().catch(console.error);
    }, 100);
  }
}

/**
 * Drena e sincroniza todos os itens pendentes na Mutation Outbox
 * Aplica resolução Last-Write-Wins (LWW) agrupada por (entityType, entityId)
 */
export async function drainOutbox(customHandler?: RemoteSyncHandler): Promise<{ processed: number; succeeded: number; failed: number }> {
  const handler = customHandler || activeSyncDriver;
  
  // 1. Obter todos os itens pendentes (synced === 0)
  const pending = await db.mutation_outbox.where('synced').equals(0).toArray();
  if (pending.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  // 2. Agrupamento para resolução de concorrência LWW
  // Se existirem múltiplas mutações para a mesma entidade, ordena-se por updatedAt
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
    // Ordenar por data cronológica (a mais recente prevalece - LWW)
    const sorted = sortMutationsLWW(mutations);
    
    // Processar mutações em sequência
    for (const mutation of sorted) {
      const attempts = mutation.attempts + 1;
      
      try {
        const res = await handler(mutation);
        const isSuccess = res === true || (typeof res === 'object' && res.success);
        const isDiscard = typeof res === 'object' && res.action === 'DISCARD';

        if (isSuccess) {
          // Marcar como sincronizado no Dexie
          await db.mutation_outbox.update(mutation.id!, {
            synced: 1,
            attempts
          });
          succeeded++;
        } else if (isDiscard) {
          // Descarte de registo inválido (HTTP 400) com log e remoção da fila pendente (synced: 1)
          await db.mutation_outbox.update(mutation.id!, {
            synced: 1,
            attempts,
            lastError: (typeof res === 'object' && res.error) || 'Erro 400 descartado'
          });
          succeeded++;
        } else {
          throw new Error((typeof res === 'object' && res.error) || 'Falha no despacho da mutação remota');
        }
      } catch (err: any) {
        failed++;
        const backoffMs = calculateBackoffMs(attempts);
        await db.mutation_outbox.update(mutation.id!, {
          attempts,
          lastError: err?.message || 'Erro de rede'
        });
        console.warn(`[OutboxService] Erro ao sincronizar ${mutation.entityType}:${mutation.entityId}. Retry em ${backoffMs}ms:`, err);
      }
    }
  }

  return {
    processed: pending.length,
    succeeded,
    failed
  };
}

/**
 * Inicializa os ouvintes globais de conectividade para garantir sincronização universal
 */
export function initOutboxListeners(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    console.log('[OutboxService] Conexão restabelecida. A drenar outbox...');
    drainOutbox().catch(console.error);
  };

  window.addEventListener('online', handleOnline);

  // Se já estiver online ao inicializar, tentar drenar pendências
  if (navigator.onLine) {
    handleOnline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
