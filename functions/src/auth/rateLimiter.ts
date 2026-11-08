/**
 * DATERRA Smart - Limitador de Taxa de Pedidos de Autenticação (SEC-04)
 * Prevenção de Abuso, Ataques de Força Bruta e Esgotamento de Quota Brevo
 * (< 200 LOC)
 */

import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
export const MAX_REQUESTS_PER_WINDOW = 5;
export const MIN_COOLDOWN_MS = 10 * 1000; // 10 segundos entre cliques consecutivos

interface RateLimitEntry {
  windowStart: number;
  count: number;
  lastRequest: number;
}

// Fallback em memória para ambientes sem Firestore ativo (ex: testes unitários offline)
const inMemoryCache = new Map<string, RateLimitEntry>();

function getEmailHash(email: string): string {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex').substring(0, 32);
}

export async function checkAuthRateLimit(
  email: string,
  now: number = Date.now(),
  customFirestore?: admin.firestore.Firestore
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const hash = getEmailHash(cleanEmail);

  let firestore: admin.firestore.Firestore | null = null;
  if (customFirestore) {
    firestore = customFirestore;
  } else {
    try {
      if (admin.apps.length > 0) {
        firestore = admin.firestore();
      }
    } catch {
      firestore = null;
    }
  }

  if (firestore) {
    const docRef = firestore.collection('_auth_rate_limits').doc(hash);
    const snap = await docRef.get();

    if (!snap.exists) {
      await docRef.set({
        windowStart: now,
        count: 1,
        lastRequest: now,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }

    const data = snap.data() as RateLimitEntry;
    const windowElapsed = now - (data.windowStart || 0);

    // Se a janela expirou, reinicia a contagem
    if (windowElapsed > RATE_LIMIT_WINDOW_MS) {
      await docRef.set({
        windowStart: now,
        count: 1,
        lastRequest: now,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return;
    }

    // Cooldown mínimo de 10s para evitar cliques múltiplos acidentais
    if (now - (data.lastRequest || 0) < MIN_COOLDOWN_MS) {
      throw new Error('Aguarde alguns segundos antes de solicitar um novo link de acesso.');
    }

    // Limite máximo de pedidos por janela
    if ((data.count || 0) >= MAX_REQUESTS_PER_WINDOW) {
      const remainingMinutes = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - windowElapsed) / 60000));
      throw new Error(`Limite de ${MAX_REQUESTS_PER_WINDOW} pedidos atingido para este e-mail. Por favor aguarde ${remainingMinutes} minuto(s) antes de tentar novamente.`);
    }

    await docRef.update({
      count: (data.count || 0) + 1,
      lastRequest: now,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return;
  }

  // Fallback em memória (para desenvolvimento local / testes)
  const current = inMemoryCache.get(hash);
  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    inMemoryCache.set(hash, { windowStart: now, count: 1, lastRequest: now });
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
  inMemoryCache.set(hash, current);
}

export function clearInMemoryRateLimits(): void {
  inMemoryCache.clear();
}
