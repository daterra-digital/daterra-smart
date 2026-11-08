/**
 * DATERRA Smart - Componente de Direito ao Apagamento (RGPD Art. 17º)
 * Purga local estritamente condicional ao sucesso confirmado do servidor.
 * (< 200 LOC)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebaseClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { RgpdDeleteAccountDialog } from './RgpdDeleteAccountDialog';

export interface RgpdDeleteAccountButtonProps {
  onFeedback?: (msg: string) => void;
  onError?: (err: string) => void;
}

export const RgpdDeleteAccountButton: React.FC<RgpdDeleteAccountButtonProps> = ({
  onFeedback,
  onError
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, logout, clearLocalSessionData } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!user || isDeleting) return;

    try {
      setIsDeleting(true);
      setDialogError(null);

      const deleteCallable = httpsCallable(functions, 'deleteUserAccount');
      const response = await deleteCallable({ confirmation: true, confirmationText: 'ELIMINAR' });
      const data = response.data as { success?: boolean; message?: string } | undefined;

      // 1. Purga local estritamente após confirmação inequívoca de sucesso do servidor
      if (data?.success !== true) {
        throw new Error(data?.message || 'A resposta do servidor não confirmou a conclusão da eliminação.');
      }

      await clearLocalSessionData({ purgeAll: true });
      await logout();

      setIsDialogOpen(false);
      if (onFeedback) {
        onFeedback(t('settings.dangerZone.accountDeletedSuccess', 'Conta e dados eliminados com sucesso.'));
      }
      navigate('/');
    } catch (err: any) {
      console.error('[RGPD] Erro ou timeout em deleteUserAccount:', err);

      let msg = err?.message || t('settings.dangerZone.deleteAccountError', 'Não foi possível concluir o pedido de eliminação.');

      // 2. Distinção de timeout/retoma sem perda prematura de dados locais
      if (err?.code === 'functions/deadline-exceeded' || err?.message?.includes('timeout') || err?.message?.includes('Retoma agendada')) {
        msg = t(
          'settings.dangerZone.operationInProgressOrTimeout',
          'A eliminação está a ser processada em segundo plano ou foi agendada para retoma. Os dados locais foram preservados no dispositivo até confirmação final.'
        );
      } else if (err?.message?.includes('Autenticação expirada') || err?.code === 'functions/failed-precondition') {
        msg = t(
          'settings.dangerZone.reauthRequired',
          'A sua sessão expirou para efeitos de segurança (< 5 min). Termine a sessão e volte a entrar para confirmar a sua identidade antes de eliminar.'
        );
      }

      setDialogError(msg);
      if (onError) {
        onError(msg);
      }
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDialogError(null);
          setIsDialogOpen(true);
        }}
        disabled={isDeleting || !user}
        className="p-4 bg-white border border-rose-300 hover:border-rose-500 rounded-2xl text-left transition-all hover:bg-rose-100/60 touch-target cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xs"
        title={t('settings.dangerZone.deleteAccountTooltip', 'Eliminar permanentemente a conta e dados')}
      >
        <div className="flex items-center gap-2">
          {isDeleting ? (
            <Loader2 className="w-4 h-4 text-rose-700 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-rose-700 group-hover:scale-110 transition-transform" />
          )}
          <span className="font-black text-rose-950 text-xs block">
            {t('settings.dangerZone.deleteAccountTitle', 'Eliminar Conta (RGPD Art. 17º)')}
          </span>
        </div>
        <span className="text-[11px] text-rose-700 block mt-1.5 font-medium leading-relaxed">
          {t('settings.dangerZone.deleteAccountDesc', 'Apaga a conta e registos dos servidores de forma irreversível.')}
        </span>
      </button>

      <RgpdDeleteAccountDialog
        isOpen={isDialogOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        errorMessage={dialogError}
      />
    </>
  );
};
