/**
 * DATERRA Smart - Tipos e Contratos de Eliminação de Conta (RGPD)
 * (< 200 LOC)
 */

import type * as admin from 'firebase-admin';

export type DeletionStatus =
  | 'pending'
  | 'in_progress'
  | 'partially_completed'
  | 'completed'
  | 'failed';

export interface DeletionOperationRecord {
  status: DeletionStatus;
  subcollectionsDeleted: boolean;
  userDocDeleted: boolean;
  moodleLinkDeleted: boolean;
  authDeleted: boolean;
  attempts: number;
  lockGeneration: number;
  lockedAt?: admin.firestore.Timestamp | null;
  lockedAtMs?: number | null;
  lockedBy?: 'user' | 'scheduler' | 'admin' | null;
  lastHeartbeatAt?: admin.firestore.Timestamp | null;
  checkpoint?: string | null;
  lastErrorStage?: string | null;
  nextRetryAt?: admin.firestore.Timestamp | null;
  updatedAt: admin.firestore.FieldValue;
  completedAt?: admin.firestore.FieldValue;
  expiresAt?: admin.firestore.Timestamp | null;
}

export const MAX_AUTH_AGE_SECONDS = 300; // 5 minutos de tolerância para reautenticação recente
export const CALLABLE_TIMEOUT_SECONDS = 120; // 2 minutos para deleteUserAccount
export const SCHEDULER_TIMEOUT_SECONDS = 300; // 5 minutos para scheduledAccountDeletionRetries
export const LOCK_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutos (superior a 300s da function agendada)
export const MAX_RETRY_ATTEMPTS = 5; // Limite máximo de retomas automáticas
export const AUDIT_RETENTION_DAYS = 30; // 30 dias: prazo mínimo necessário para auditoria de suporte e retoma
