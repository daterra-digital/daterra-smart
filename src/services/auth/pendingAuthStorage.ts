// src/services/auth/pendingAuthStorage.ts
import type { PendingRegistrationData } from '../../types/profile';

export const PENDING_AUTH_STORAGE_KEY = 'daterra_pending_auth';
export const PENDING_AUTH_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutos de validade estrita

export interface PendingAuthRecord extends PendingRegistrationData {
  timestamp: number;
}

/**
 * Guarda dados temporários de registo/login com carimbo temporal e minimização
 */
export const savePendingAuth = (data: PendingRegistrationData): void => {
  try {
    const record: PendingAuthRecord = {
      email: data.email.trim().toLowerCase(),
      firstName: data.firstName?.trim() || '',
      lastName: data.lastName?.trim() || '',
      companyName: data.companyName?.trim() || '',
      timestamp: Date.now()
    };
    localStorage.setItem(PENDING_AUTH_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignorar erros de quota/acesso restrito a localStorage
  }
};

/**
 * Lê os dados temporários de login validando o tempo limite de 15 minutos.
 * Se expirado ou corrompido, limpa imediatamente a memória local.
 */
export const getValidPendingAuth = (): PendingAuthRecord | null => {
  try {
    const raw = localStorage.getItem(PENDING_AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingAuthRecord;
    if (!parsed || !parsed.email || typeof parsed.email !== 'string') {
      clearPendingAuth();
      return null;
    }

    const age = Date.now() - (parsed.timestamp || 0);
    if (age > PENDING_AUTH_MAX_AGE_MS || age < 0) {
      clearPendingAuth();
      return null;
    }

    return parsed;
  } catch {
    clearPendingAuth();
    return null;
  }
};

/**
 * Elimina fisicamente os dados temporários de login do navegador
 */
export const clearPendingAuth = (): void => {
  try {
    localStorage.removeItem(PENDING_AUTH_STORAGE_KEY);
  } catch {
    // Ignorar falhas de acesso a localStorage
  }
};
