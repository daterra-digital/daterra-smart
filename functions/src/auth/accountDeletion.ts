/**
 * DATERRA Smart - Eliminação de Conta de Utilizador (RGPD Art. 17º - Direito ao Apagamento)
 * Permite que um utilizador autenticado elimine a sua conta e dados do Firebase Auth e Firestore.
 * (< 200 LOC)
 */

import * as admin from 'firebase-admin';
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

export async function handleDeleteUserAccount(
  request: CallableRequest
): Promise<{ success: boolean; message: string }> {
  // 1. Verificação de Autenticação Estrita
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError(
      'unauthenticated',
      'É obrigatório ter sessão iniciada para solicitar a eliminação definitiva da conta.'
    );
  }

  const userId = request.auth.uid;
  const db = admin.firestore();

  try {
    // 2. Apagar documento de perfil e dados em users/{userId}
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.delete();

    // 3. Apagar o utilizador do Firebase Authentication
    await admin.auth().deleteUser(userId);

    return {
      success: true,
      message: 'A sua conta e dados associados foram eliminados com sucesso.'
    };
  } catch (error: any) {
    console.error(`[AccountDeletion] Erro ao eliminar conta do utilizador ${userId}:`, error);
    throw new HttpsError(
      'internal',
      'Não foi possível concluir o pedido de eliminação da conta. Se o problema persistir, contacte o suporte.'
    );
  }
}
