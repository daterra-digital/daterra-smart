/**
 * DATERRA Smart - Eliminação Transacional de Conta (RGPD Art. 17º)
 * Eliminação recursiva profunda com checkpoints, verificação final e retoma.
 * (< 200 LOC)
 */

import * as admin from 'firebase-admin';
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import {
  type DeletionOperationRecord,
  MAX_AUTH_AGE_SECONDS,
  MAX_RETRY_ATTEMPTS
} from './accountDeletionTypes';
import { acquireLock, renewLock, releaseLockSuccess } from './accountDeletionLock';

function validateRecentAuth(request: CallableRequest): void {
  if (!request.auth || !request.auth.uid) throw new HttpsError('unauthenticated', 'Sessão necessária.');
  const authTime = request.auth.token?.auth_time;
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof authTime !== 'number' || nowSec - authTime > MAX_AUTH_AGE_SECONDS) {
    throw new HttpsError('failed-precondition', 'Autenticação expirada (> 5 min). Inicie sessão novamente.');
  }
}

async function deleteSubcollectionsDeep(
  db: admin.firestore.Firestore,
  docRef: admin.firestore.DocumentReference,
  opRef: admin.firestore.DocumentReference,
  lockGen: number,
  pathPrefix: string
): Promise<void> {
  const subcollections = await docRef.listCollections();
  for (const subcol of subcollections) {
    let docs = await subcol.limit(50).get();
    while (!docs.empty) {
      for (const childDoc of docs.docs) {
        await deleteSubcollectionsDeep(db, childDoc.ref, opRef, lockGen, `${pathPrefix}/${subcol.id}/${childDoc.id}`);
      }
      const batch = db.batch();
      docs.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      await renewLock(db, opRef, lockGen, `${pathPrefix}/${subcol.id}:${docs.docs[docs.docs.length - 1].id}`);
      docs = await subcol.limit(50).get();
    }
  }
}

async function executeSteps(
  db: admin.firestore.Firestore,
  userId: string,
  userPrefix: string,
  opRef: admin.firestore.DocumentReference,
  lockGen: number,
  state: DeletionOperationRecord
): Promise<void> {
  const userDocRef = db.collection('users').doc(userId);
  const moodleDocRef = db.collection('user_moodle_links').doc(userId);

  try {
    if (!state.subcollectionsDeleted) {
      await deleteSubcollectionsDeep(db, userDocRef, opRef, lockGen, `users/${userId}`);
      const residual = await userDocRef.listCollections();
      if (residual.length > 0) throw new Error('RESIDUAL_SUBCOLLECTIONS_REMAIN');
      state.subcollectionsDeleted = true;
      await renewLock(db, opRef, lockGen, 'subcollections_verified_done');
      await opRef.update({ subcollectionsDeleted: true });
    }
    if (!state.userDocDeleted) {
      await userDocRef.delete();
      const check = await userDocRef.get();
      if (check.exists) throw new Error('USER_DOC_NOT_DELETED');
      state.userDocDeleted = true;
      await renewLock(db, opRef, lockGen, 'user_doc_verified_done');
      await opRef.update({ userDocDeleted: true });
    }
    if (!state.moodleLinkDeleted) {
      await moodleDocRef.delete();
      const check = await moodleDocRef.get();
      if (check.exists) throw new Error('MOODLE_LINK_NOT_DELETED');
      state.moodleLinkDeleted = true;
      await renewLock(db, opRef, lockGen, 'moodle_verified_done');
      await opRef.update({ moodleLinkDeleted: true });
    }
  } catch (err: any) {
    const nextRetrySec = Math.min(3600, Math.pow(2, state.attempts) * 60);
    await opRef.set({
      status: 'partially_completed',
      lastErrorStage: 'firestore',
      nextRetryAt: admin.firestore.Timestamp.fromMillis(Date.now() + nextRetrySec * 1000),
      lockedAt: null,
      lockedAtMs: null
    }, { merge: true });
    console.error(JSON.stringify({ event: 'RGPD_DELETION_FAILED', stage: 'firestore', userPrefix, err: err?.message }));
    throw new HttpsError('internal', 'Falha ao eliminar dados no Firestore. Operação retida para retoma.');
  }

  if (!state.authDeleted) {
    try {
      await admin.auth().deleteUser(userId);
      state.authDeleted = true;
    } catch (authError: any) {
      if (authError?.code === 'auth/user-not-found') {
        state.authDeleted = true;
      } else {
        const nextRetrySec = Math.min(3600, Math.pow(2, state.attempts) * 60);
        await opRef.set({
          status: 'partially_completed',
          lastErrorStage: 'auth',
          nextRetryAt: admin.firestore.Timestamp.fromMillis(Date.now() + nextRetrySec * 1000),
          lockedAt: null,
          lockedAtMs: null
        }, { merge: true });
        console.error(JSON.stringify({ event: 'RGPD_DELETION_FAILED', stage: 'auth', userPrefix, err: authError?.code }));
        throw new HttpsError('internal', 'Dados apagados, mas falhou remoção no Auth. Retoma agendada.');
      }
    }
  }

  await releaseLockSuccess(db, opRef, lockGen);
  console.info(JSON.stringify({ event: 'RGPD_DELETION_SUCCESS', userPrefix }));
}

export async function handleDeleteUserAccount(request: CallableRequest): Promise<{ success: boolean; message: string }> {
  validateRecentAuth(request);
  const userId = request.auth!.uid;
  const userPrefix = userId.substring(0, 6) + '...';

  const payload = (request.data || {}) as { confirmation?: boolean; confirmationText?: string };
  if (payload.confirmation !== true || payload.confirmationText !== 'ELIMINAR') {
    console.warn(JSON.stringify({ event: 'RGPD_VALIDATION_FAILED', reason: 'invalid_confirmation', userPrefix }));
    throw new HttpsError('failed-precondition', 'É obrigatório confirmar e escrever ELIMINAR para avançar.');
  }

  const db = admin.firestore();
  const opRef = db.collection('_user_deletion_ops').doc(userId);

  const { state, lockGen, isCompleted } = await acquireLock(db, opRef, 'user');
  if (isCompleted) return { success: true, message: 'Conta já eliminada anteriormente.' };

  await executeSteps(db, userId, userPrefix, opRef, lockGen, state);
  return { success: true, message: 'Conta e dados eliminados com sucesso.' };
}

export async function processPendingAccountDeletions(db: admin.firestore.Firestore = admin.firestore()): Promise<{ processed: number; resumed: number }> {
  const now = admin.firestore.Timestamp.now();
  const querySnap = await db.collection('_user_deletion_ops').where('status', 'in', ['partially_completed', 'failed']).limit(25).get();

  let resumedCount = 0;
  for (const doc of querySnap.docs) {
    const data = doc.data() as DeletionOperationRecord;
    if (data.attempts >= MAX_RETRY_ATTEMPTS) continue;
    if (data.nextRetryAt && data.nextRetryAt.toMillis() > now.toMillis()) continue;

    const userId = doc.id;
    const userPrefix = userId.substring(0, 6) + '...';
    try {
      const { state, lockGen, isCompleted } = await acquireLock(db, doc.ref, 'scheduler');
      if (!isCompleted) {
        await executeSteps(db, userId, userPrefix, doc.ref, lockGen, state);
        resumedCount++;
      }
    } catch (err: any) {
      console.error(JSON.stringify({ event: 'RGPD_RETRY_FAILED', userPrefix, err: err?.message }));
    }
  }

  // Purga defensiva automática de registos com retenção ultrapassada (30 dias)
  const expiredSnap = await db.collection('_user_deletion_ops').where('status', '==', 'completed').where('expiresAt', '<=', now).limit(50).get();
  if (!expiredSnap.empty) {
    const purgeBatch = db.batch();
    expiredSnap.docs.forEach((d) => purgeBatch.delete(d.ref));
    await purgeBatch.commit();
  }

  return { processed: querySnap.size, resumed: resumedCount };
}
