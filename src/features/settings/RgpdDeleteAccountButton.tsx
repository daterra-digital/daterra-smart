/**
 * DATERRA Smart - Componente de Direito ao Apagamento (RGPD Art. 17º)
 * Cumprimento de Requisito Legal de Privacidade e Proteção de Dados (SEC-17).
 * (< 200 LOC)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebaseClient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

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

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmMessage = t(
      'settings.dangerZone.confirmDeleteAccount',
      'DIREITO AO APAGAMENTO (RGPD Art. 17º):\n\nTem a certeza absoluta de que pretende eliminar definitivamente a sua conta DATERRA Smart e todos os seus dados dos servidores e do dispositivo?\n\nEsta ação é irreversível e os seus registos serão permanentemente apagados.'
    );

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);
      const deleteCallable = httpsCallable(functions, 'deleteUserAccount');
      await deleteCallable();

      // Desinfeção local absoluta de sessão
      await clearLocalSessionData({ purgeAll: true });
      await logout();

      if (onFeedback) {
        onFeedback(t('settings.dangerZone.accountDeletedSuccess', 'Conta eliminada com sucesso. Obrigado por utilizar a DATERRA Smart.'));
      }

      navigate('/');
    } catch (err: any) {
      console.error('[RGPD] Erro ao invocar deleteUserAccount:', err);
      const msg = err?.message || t('settings.dangerZone.deleteAccountError', 'Não foi possível concluir o pedido de eliminação. Contacte o suporte técnico.');
      if (onError) {
        onError(msg);
      }
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDeleteAccount}
      disabled={isDeleting || !user}
      className="p-4 bg-white border border-rose-300 hover:border-rose-500 rounded-2xl text-left transition-all hover:bg-rose-100/60 touch-target cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xs"
      title={t('settings.dangerZone.deleteAccountTooltip', 'Eliminar permanentemente a conta e dados pessoais')}
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
  );
};
