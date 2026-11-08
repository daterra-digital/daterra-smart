/**
 * DATERRA Smart - Gestão de Lock Transacional para Eliminação de Conta
 * (< 200 LOC)
 */

import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  type DeletionOperationRecord,
  LOCK_EXPIRATION_MS,
  AUDIT_RETENTION_DAYS
} from './accountDeletionTypes';

export async function acquireLock(
  db: admin.firestore.Firestore,
  opRef: admin.firestore.DocumentReference,
  lockedBy: 'user' | 'scheduler'
): Promise<{ state: DeletionOperationRecord; lockGen: number; isCompleted?: boolean }> {
  const nowMs = Date.now();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(opRef);
    const existing = snap.data() as DeletionOperationRecord | undefined;
    if (existing?.status === 'in_progress') {
      const lockedMs = existing.lockedAtMs || 0;
      if (nowMs - lockedMs < LOCK_EXPIRATION_MS) {
        throw new HttpsError('already-exists', 'Operação de eliminação já em curso.');
      }
    }
    if (existing?.status === 'completed') {
      return { state: existing, lockGen: existing.lockGeneration || 1, isCompleted: true };
    }

    const lockGen = (existing?.lockGeneration || 0) + 1;
    const nextState: DeletionOperationRecord = {
      status: 'in_progress',
      subcollectionsDeleted: existing?.subcollectionsDeleted || false,
      userDocDeleted: existing?.userDocDeleted || false,
      moodleLinkDeleted: existing?.moodleLinkDeleted || false,
      authDeleted: existing?.authDeleted || false,
      attempts: (existing?.attempts || 0) + 1,
      lockGeneration: lockGen,
      lockedAt: admin.firestore.Timestamp.now(),
      lockedAtMs: nowMs,
      lockedBy,
      lastHeartbeatAt: admin.firestore.Timestamp.now(),
      checkpoint: existing?.checkpoint || 'init',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    tx.set(opRef, nextState, { merge: true });
    return { state: nextState, lockGen };
  });
}

export async function renewLock(
  db: admin.firestore.Firestore,
  opRef: admin.firestore.DocumentReference,
  lockGen: number,
  checkpoint: string
): Promise<void> {
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(opRef);
    const curr = snap.data() as DeletionOperationRecord | undefined;
    if (curr?.lockGeneration !== lockGen) throw new Error('LOCK_LOST');
    tx.update(opRef, {
      lockedAt: admin.firestore.Timestamp.now(),
      lockedAtMs: Date.now(),
      lastHeartbeatAt: admin.firestore.Timestamp.now(),
      checkpoint,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}

export async function releaseLockSuccess(
  db: admin.firestore.Firestore,
  opRef: admin.firestore.DocumentReference,
  lockGen: number
): Promise<void> {
  const expiresMs = Date.now() + AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(opRef);
    if ((snap.data() as DeletionOperationRecord)?.lockGeneration !== lockGen) return;
    tx.set(opRef, {
      status: 'completed',
      lockedAt: null,
      lockedAtMs: null,
      lockedBy: null,
      checkpoint: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromMillis(expiresMs),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
}
