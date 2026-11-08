/**
 * DATERRA Smart - Inicialização Segura de Firebase App Check (SEC-01)
 * Protege Firestore e Cloud Functions contra scraping, bots e tráfego ilegítimo.
 * Fail-safe: Em modo offline ou sem chaves, não bloqueia o funcionamento local da PWA.
 * (< 200 LOC)
 */

import type { FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck
} from 'firebase/app-check';

export function setupAppCheck(app: FirebaseApp): AppCheck | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5175' ||
    Boolean(env.DEV);

  // Ativação de Token de Depuração para Desenvolvimento Local e Homologação
  if (isLocalHost) {
    const debugToken = env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || true;
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  const siteKey = env.VITE_FIREBASE_APPCHECK_SITE_KEY;

  // Em produção sem chave configurada, regista aviso preventivo sem derrubar a aplicação
  if (!siteKey && !isLocalHost) {
    console.warn('[AppCheck] VITE_FIREBASE_APPCHECK_SITE_KEY não definida. App Check suspenso em produção.');
    return null;
  }

  try {
    // Utiliza siteKey oficial ou chave padrão de teste reCAPTCHA v3 para emuladores
    const providerKey = siteKey || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    const provider = new ReCaptchaV3Provider(providerKey);
    const appCheckInstance = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true
    });
    return appCheckInstance;
  } catch (err) {
    console.warn('[AppCheck] Inicialização tolerante (modo offline / sem conectividade):', err);
    return null;
  }
}
