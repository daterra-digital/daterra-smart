/**
 * DATERRA Smart - Limitador de Taxa de Pedidos de Autenticação (SEC-04 & SEC-15)
 * Prevenção de Abuso, Ataques de Força Bruta e Esgotamento de Quota Brevo por E-mail e IP
 * (< 200 LOC)
 */

import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
export const MAX_REQUESTS_PER_WINDOW = 5; // Por e-mail
export const MAX_REQUESTS_PER_IP_WINDOW = 15; // Por IP (SEC-15)
export const MIN_COOLDOWN_MS = 10 * 1000; // 10 segundos entre cliques consecutivos
export const AUTH_RATE_LIMIT_RETENTION_MS = 2 * 60 * 60 * 1000; // 2 horas: prazo mínimo necessário (8x a janela de 15m)

interface RateLimitEntry {
  windowStart: number;
  count: number;
  lastRequest: number;
}

// Fallback em memória para ambientes sem Firestore ativo (ex: testes unitários offline)
const inMemoryCache = new Map<string, RateLimitEntry>();
const RATE_LIMIT_PEPPER = process.env.RATE_LIMIT_PEPPER || 'daterra-rate-limit-pepper-v1-2026';

function getHash(val: string): string {
  return crypto.createHmac('sha256', RATE_LIMIT_PEPPER).update(val.trim().toLowerCase()).digest('hex').substring(0, 32);
}

export async function checkAuthRateLimit(
  email: string,
  nowOrIp?: number | string,
  maybeNowOrFirestore?: number | admin.firestore.Firestore,
  customFirestore?: admin.firestore.Firestore
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  let clientIp: string | undefined;
  let now: number = Date.now();
  let firestore: admin.firestore.Firestore | null = null;

  if (typeof nowOrIp === 'string') {
    clientIp = nowOrIp.trim();
    if (typeof maybeNowOrFirestore === 'number') {
      now = maybeNowOrFirestore;
      firestore = customFirestore || null;
    } else {
      firestore = (maybeNowOrFirestore as admin.firestore.Firestore) || customFirestore || null;
    }
  } else if (typeof nowOrIp === 'number') {
    now = nowOrIp;
    firestore = (maybeNowOrFirestore as admin.firestore.Firestore) || customFirestore || null;
  } else {
    firestore = (maybeNowOrFirestore as admin.firestore.Firestore) || customFirestore || null;
  }

  if (!firestore) {
    try {
      if (admin.apps.length > 0) {
        firestore = admin.firestore();
      }
    } catch {
      firestore = null;
    }
  }

  const emailHash = 'email_' + getHash(cleanEmail);
  const ipHash = clientIp ? 'ip_' + getHash(clientIp) : null;

  // 1. Verificação no Firestore (se disponível)
  if (firestore) {
    // 1.1. Limite por IP (SEC-15)
    if (ipHash) {
      const ipDocRef = firestore.collection('_auth_rate_limits').doc(ipHash);
      const ipSnap = await ipDocRef.get();
      if (ipSnap.exists) {
        const ipData = ipSnap.data() as RateLimitEntry;
        const ipElapsed = now - (ipData.windowStart || 0);
        if (ipElapsed <= RATE_LIMIT_WINDOW_MS && (ipData.count || 0) >= MAX_REQUESTS_PER_IP_WINDOW) {
          throw new Error('Demasiados pedidos a partir desta ligação de rede. Por favor aguarde antes de tentar novamente.');
        }
        const ttlTimestamp = admin.firestore.Timestamp.fromMillis(now + AUTH_RATE_LIMIT_RETENTION_MS);
        if (ipElapsed > RATE_LIMIT_WINDOW_MS) {
          await ipDocRef.set({ windowStart: now, count: 1, lastRequest: now, expiresAt: ttlTimestamp, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        } else {
          await ipDocRef.update({ count: (ipData.count || 0) + 1, lastRequest: now, expiresAt: ttlTimestamp, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
      } else {
        const ttlTimestamp = admin.firestore.Timestamp.fromMillis(now + AUTH_RATE_LIMIT_RETENTION_MS);
        await ipDocRef.set({ windowStart: now, count: 1, lastRequest: now, expiresAt: ttlTimestamp, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      }
    }

    // 1.2. Limite por E-mail (SEC-04)
    const docRef = firestore.collection('_auth_rate_limits').doc(emailHash);
    const snap = await docRef.get();
    const ttlTimestamp = admin.firestore.Timestamp.fromMillis(now + AUTH_RATE_LIMIT_RETENTION_MS);

    if (!snap.exists) {
      await docRef.set({ windowStart: now, count: 1, lastRequest: now, expiresAt: ttlTimestamp, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }

    const data = snap.data() as RateLimitEntry;
    const windowElapsed = now - (data.windowStart || 0);

    if (windowElapsed > RATE_LIMIT_WINDOW_MS) {
      await docRef.set({ windowStart: now, count: 1, lastRequest: now, expiresAt: ttlTimestamp, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }

    if (now - (data.lastRequest || 0) < MIN_COOLDOWN_MS) {
      throw new Error('Aguarde alguns segundos antes de solicitar um novo link de acesso.');
    }

    if ((data.count || 0) >= MAX_REQUESTS_PER_WINDOW) {
      const remainingMinutes = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - windowElapsed) / 60000));
      throw new Error(`Limite de ${MAX_REQUESTS_PER_WINDOW} pedidos atingido para este e-mail. Por favor aguarde ${remainingMinutes} minuto(s) antes de tentar novamente.`);
    }

    await docRef.update({ count: (data.count || 0) + 1, lastRequest: now, expiresAt: ttlTimestamp, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return;
  }

  // 2. Fallback em memória (para testes unitários locais / emulador)
  if (ipHash) {
    const ipEntry = inMemoryCache.get(ipHash);
    if (ipEntry && now - ipEntry.windowStart <= RATE_LIMIT_WINDOW_MS && ipEntry.count >= MAX_REQUESTS_PER_IP_WINDOW) {
      throw new Error('Demasiados pedidos a partir desta ligação de rede. Por favor aguarde antes de tentar novamente.');
    }
    if (!ipEntry || now - ipEntry.windowStart > RATE_LIMIT_WINDOW_MS) {
      inMemoryCache.set(ipHash, { windowStart: now, count: 1, lastRequest: now });
    } else {
      ipEntry.count += 1;
      ipEntry.lastRequest = now;
      inMemoryCache.set(ipHash, ipEntry);
    }
  }

  const current = inMemoryCache.get(emailHash);
  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    inMemoryCache.set(emailHash, { windowStart: now, count: 1, lastRequest: now });
    return;
  }

  if (now - current.lastRequest < MIN_COOLDOWN_MS) {
    throw new Error('Aguarde alguns segundos antes de solicitar um novo link de acesso.');
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    const windowElapsed = now - current.windowStart;
    const remainingMinutes = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - windowElapsed) / 60000));
    throw new Error(`Limite de ${MAX_REQUESTS_PER_WINDOW} pedidos atingido para este e-mail. Por favor aguarde ${remainingMinutes} minuto(s) antes de tentar novamente.`);
  }

  current.count += 1;
  current.lastRequest = now;
  inMemoryCache.set(emailHash, current);
}

export function clearInMemoryRateLimits(): void {
  inMemoryCache.clear();
}

/**
 * Função de limpeza manual ou agendada para registos expirados em _auth_rate_limits.
 */
export async function cleanupExpiredAuthRateLimits(
  firestore?: admin.firestore.Firestore
): Promise<number> {
  const db = firestore || (admin.apps.length > 0 ? admin.firestore() : null);
  if (!db) return 0;

  const now = admin.firestore.Timestamp.now();
  const snap = await db.collection('_auth_rate_limits').where('expiresAt', '<=', now).limit(100).get();
  if (snap.empty) return 0;

  const batch = db.batch();
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
  return snap.size;
}
