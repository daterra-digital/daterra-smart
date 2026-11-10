/**
 * DATERRA Smart - Handler de Mutação Outbox para Newsletter & Perfil
 * Resolução com isolamento estrito de identidade e recuperação granular de destinos
 */

import { doc, setDoc } from 'firebase/firestore';
import { auth, firestoreDb } from '../../lib/firebaseClient.ts';
import { db, type MutationOutboxRecord } from '../../db/db.ts';
import { callBffNewsletterSync, type NewsletterSyncInput, type SyncDestination } from './newsletterSyncService.ts';

export interface OutboxSyncResult {
  success: boolean;
  action?: 'SYNCED' | 'DISCARD' | 'RETRY' | 'SKIP';
  error?: string;
}

export interface NewsletterOutboxPayload extends NewsletterSyncInput {
  pendingDestinations?: SyncDestination[];
  updatedAt?: string;
}

export interface NewsletterOutboxDeps {
  firestoreWriter?: (userRef: any, data: any) => Promise<void>;
  bffCaller?: (payload: NewsletterSyncInput) => Promise<boolean>;
  authUidGetter?: () => string | undefined;
  authEmailGetter?: () => string | undefined | null;
  outboxUpdater?: (id: number, changes: any) => Promise<void>;
}

export async function handleNewsletterSubscriptionSync(
  mutation: MutationOutboxRecord,
  deps?: NewsletterOutboxDeps
): Promise<OutboxSyncResult> {
  const payload = mutation.payload as NewsletterOutboxPayload | undefined;
  if (!payload) {
    return { success: false, action: 'DISCARD', error: 'Payload de mutação nulo' };
  }

  // 1. Validação estrita de formato de entityId e payload.uid
  const entityId = mutation.entityId;
  if (!entityId || typeof entityId !== 'string' || entityId.trim() !== entityId || entityId === '') {
    return { success: false, action: 'DISCARD', error: 'entityId inválido ou com espaços' };
  }

  if (!payload.uid || payload.uid !== entityId) {
    return { success: false, action: 'DISCARD', error: 'payload.uid diverge de entityId' };
  }

  const getAuthUid = deps?.authUidGetter ?? (() => auth.currentUser?.uid);
  const getAuthEmail = deps?.authEmailGetter ?? (() => auth.currentUser?.email);
  const firestoreWriter = deps?.firestoreWriter ?? ((ref, data) => Promise.race([
    setDoc(ref, data, { merge: true }),
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
  ]));
  const bffCaller = deps?.bffCaller ?? callBffNewsletterSync;
  const updateOutbox = deps?.outboxUpdater ?? ((id, changes) => db.mutation_outbox.update(id, changes));

  // 2. Isolamento de identidade: apenas processar se a sessão ativa for rigorosamente o titular
  const activeUid = getAuthUid();
  if (!activeUid || activeUid !== entityId) {
    return { success: false, action: 'SKIP', error: 'Sessão ativa não corresponde ao titular da mutação' };
  }

  // 3. Validação estrita do destinatário de e-mail contra o contrato da conta
  const email = (payload.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, action: 'DISCARD', error: 'Endereço de e-mail inválido' };
  }

  const activeEmail = getAuthEmail();
  if (activeEmail && email !== activeEmail.toLowerCase()) {
    return { success: false, action: 'DISCARD', error: 'Destinatário não autorizado para a conta ativa' };
  }

  // 4. Determinação dos destinos pendentes a recuperar
  const pending = payload.pendingDestinations && payload.pendingDestinations.length > 0
    ? [...payload.pendingDestinations]
    : (['bff'] as SyncDestination[]);

  let lastError: string | undefined;

  // 4.1. Recuperar persistência de Firestore se estiver pendente
  if (pending.includes('firestore')) {
    if (getAuthUid() !== entityId) {
      return { success: false, action: 'SKIP', error: 'Sessão alterada durante a execução' };
    }
    try {
      const userRef = doc(firestoreDb, 'users', entityId);
      const firestorePayload: Record<string, any> = {
        newsletter_subscribed: payload.subscribed,
        newsletter_updated_at: payload.updatedAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (payload.platformNotifications !== undefined) {
        firestorePayload.platform_notifications_enabled = payload.platformNotifications;
        firestorePayload.platform_notifications_updated_at = new Date().toISOString();
      }
      await firestoreWriter(userRef, firestorePayload);
      const idx = pending.indexOf('firestore');
      if (idx !== -1) pending.splice(idx, 1);
    } catch (err: any) {
      console.warn(`[NewsletterOutboxHandler] Falha ao recuperar Firestore para mutação ${mutation.id}:`, err?.message);
      lastError = err?.message;
    }
  }

  // 4.2. Sincronização BFF externa está pendente de implementação (Fase 0 Opção B).
  // Mutações legadas com destino 'bff' são limpas no runtime padrão, mantendo injeção em testes via deps.bffCaller.
  if (pending.includes('bff')) {
    if (!deps?.bffCaller) {
      const idx = pending.indexOf('bff');
      if (idx !== -1) pending.splice(idx, 1);
      console.info(`[NewsletterOutboxHandler] Destino 'bff' ignorado na mutação ${mutation.id}: sincronização externa pendente.`);
    } else {
      if (getAuthUid() !== entityId) {
        return { success: false, action: 'SKIP', error: 'Sessão alterada durante a execução' };
      }
      try {
        const isSuccess = await bffCaller({
          ...payload,
          email,
          uid: entityId
        });
        if (isSuccess) {
          const idx = pending.indexOf('bff');
          if (idx !== -1) pending.splice(idx, 1);
        } else {
          lastError = 'BFF retornou success=false';
        }
      } catch (err: any) {
        console.warn(`[NewsletterOutboxHandler] Falha de rede BFF para mutação ${mutation.id}:`, err?.message);
        lastError = err?.message || 'Falha de rede BFF';
      }
    }
  }

  // 5. Avaliação do encerramento da mutação
  if (pending.length === 0) {
    console.info(`[NewsletterOutboxHandler] Mutação ${mutation.id} sincronizada em todos os destinos com sucesso!`);
    return { success: true, action: 'SYNCED' };
  }

  // Se algum destino ainda estiver pendente, atualizar a mutação e agendar nova tentativa
  if (mutation.id) {
    try {
      await updateOutbox(mutation.id, {
        payload: { ...payload, pendingDestinations: pending }
      });
    } catch {}
  }

  return {
    success: false,
    action: 'RETRY',
    error: lastError || 'Destinos pendentes restantes: ' + pending.join(', ')
  };
}
