/**
 * DATERRA Smart - Serviço de Sincronização de Newsletter e Notificações (BFF & Firestore)
 * Camada 4: Resiliência First-Offline com rastreio granular de destinos e isolamento de identidade
 */

import { doc, setDoc } from 'firebase/firestore';
import { firestoreDb, auth } from '../../lib/firebaseClient.ts';
import { enqueueMutation } from '../outbox/outboxService.ts';

export type SyncDestination = 'firestore' | 'bff';

/** Flag explícita Fase 0 (Opção B): sincronização externa de newsletter (Brevo/BFF) pendente. */
export const NEWSLETTER_EXTERNAL_BFF_ENABLED = false;

export interface NewsletterSyncInput {
  email: string;
  subscribed: boolean;
  platformNotifications?: boolean;
  firstname?: string;
  lastname?: string;
  company?: string;
  source?: 'onboarding_register' | 'settings_notifications';
  uid?: string;
}

export interface NewsletterSyncResult {
  success: boolean;
  persistedInFirestore: boolean;
  syncedWithBff: boolean;
  bffSyncPending?: boolean;
  queuedInOutbox: boolean;
  pendingDestinations?: SyncDestination[];
  timestamp: string;
  error?: string;
}

export interface NewsletterSyncDeps {
  firestoreWriter?: (userRef: any, data: any) => Promise<void>;
  bffCaller?: (payload: NewsletterSyncInput) => Promise<boolean>;
  enqueueOutbox?: typeof enqueueMutation;
  authUidGetter?: () => string | undefined;
  authEmailGetter?: () => string | undefined | null;
  isOnlineGetter?: () => boolean;
}

/**
 * Sincronização externa com o BFF / Brevo desativada na Fase 0 (Opção B):
 * A Cloud Function `syncNewsletterSubscription` não existe em produção/functions.
 */
export async function callBffNewsletterSync(_payload: NewsletterSyncInput): Promise<boolean> {
  return false;
}

export async function syncNewsletterPreference(
  input: NewsletterSyncInput,
  deps?: NewsletterSyncDeps
): Promise<NewsletterSyncResult> {
  const nowIso = new Date().toISOString();
  let persistedInFirestore = false;
  let syncedWithBff = false;
  let queuedInOutbox = false;
  const pendingDestinations: SyncDestination[] = [];
  let lastError: string | undefined;

  const fail = (err: string): NewsletterSyncResult => ({
    success: false, persistedInFirestore: false, syncedWithBff: false,
    queuedInOutbox: false, timestamp: nowIso, error: err
  });

  const getAuthUid = deps?.authUidGetter ?? (() => auth.currentUser?.uid);
  const getAuthEmail = deps?.authEmailGetter ?? (() => auth.currentUser?.email);
  const firestoreWriter = deps?.firestoreWriter ?? ((ref, data) => Promise.race([
    setDoc(ref, data, { merge: true }),
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
  ]));
  const bffCaller = deps?.bffCaller;
  const enqueue = deps?.enqueueOutbox ?? enqueueMutation;
  const getIsOnline = deps?.isOnlineGetter ?? (() => (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true));

  // 1. Validação estrita de identidade antes de qualquer operação
  const activeUid = getAuthUid();
  if (!activeUid) return fail('Nenhuma sessão de utilizador autenticada');

  const rawUid = input.uid;
  if (!rawUid || typeof rawUid !== 'string' || rawUid.trim() !== rawUid || rawUid === '') {
    return fail('UID opaco inválido ou com espaços não permitidos');
  }
  if (rawUid !== activeUid) return fail('Identidade divergente da sessão ativa');

  const rawEmail = input.email;
  if (!rawEmail || typeof rawEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail.trim())) {
    return fail('Endereço de e-mail inválido');
  }
  const recipientEmail = rawEmail.trim().toLowerCase();
  const sessionEmail = getAuthEmail();
  if (sessionEmail && recipientEmail !== sessionEmail.toLowerCase()) {
    return fail('Destinatário não corresponde ao titular da sessão ativa');
  }

  // 2. Destino 1: Documento Firestore do Perfil (com verificação de alteração de sessão)
  if (getAuthUid() !== rawUid) {
    lastError = 'Sessão alterada durante o processamento de gravação';
    pendingDestinations.push('firestore');
  } else {
    try {
      const userRef = doc(firestoreDb, 'users', rawUid);
      const firestorePayload: Record<string, any> = {
        newsletter_subscribed: input.subscribed,
        newsletter_updated_at: nowIso,
        updated_at: nowIso
      };
      if (input.platformNotifications !== undefined) {
        firestorePayload.platform_notifications_enabled = input.platformNotifications;
        firestorePayload.platform_notifications_updated_at = nowIso;
      }
      await firestoreWriter(userRef, firestorePayload);
      persistedInFirestore = true;
    } catch (err: any) {
      console.warn('[newsletterSyncService] Falha na gravação do Firestore; retido:', err?.message);
      lastError = err?.message;
      pendingDestinations.push('firestore');
    }
  }

  // 3. Destino 2 (BFF/Brevo): desativado em produção na Fase 0 (Opção B).
  // Apenas executado se injetado explicitamente via deps?.bffCaller em testes.
  if (bffCaller && NEWSLETTER_EXTERNAL_BFF_ENABLED === false) {
    const isOnline = getIsOnline();
    if (getAuthUid() !== rawUid || !isOnline) {
      pendingDestinations.push('bff');
    } else {
      try {
        syncedWithBff = await bffCaller({ ...input, email: recipientEmail, uid: rawUid });
        if (!syncedWithBff) pendingDestinations.push('bff');
      } catch (bffErr: any) {
        console.warn('[newsletterSyncService] Falha na chamada BFF injetada; retido:', bffErr?.message);
        lastError = bffErr?.message;
        pendingDestinations.push('bff');
      }
    }
  }

  // 4. Retenção na Outbox apenas para destinos ativos pendentes (isolado sob o UID original)
  if (pendingDestinations.length > 0) {
    try {
      await enqueue({
        entityId: rawUid,
        entityType: 'newsletter_subscription',
        operation: 'UPDATE',
        userId: rawUid,
        payload: {
          uid: rawUid,
          email: recipientEmail,
          firstname: input.firstname?.trim() || '',
          lastname: input.lastname?.trim() || '',
          company: input.company?.trim() || '',
          subscribed: input.subscribed,
          platformNotifications: input.platformNotifications,
          source: input.source || 'settings_notifications',
          updatedAt: nowIso,
          pendingDestinations: [...pendingDestinations]
        },
        updatedAt: nowIso
      });
      queuedInOutbox = true;
    } catch (outboxErr: any) {
      console.error('[newsletterSyncService] Erro ao enfileirar na Outbox:', outboxErr);
      lastError = outboxErr?.message || 'Falha de armazenamento local';
    }
  }

  return {
    success: persistedInFirestore || queuedInOutbox,
    persistedInFirestore,
    syncedWithBff,
    bffSyncPending: !syncedWithBff,
    queuedInOutbox,
    pendingDestinations,
    timestamp: nowIso,
    error: lastError
  };
}
