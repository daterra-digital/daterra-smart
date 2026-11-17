// src/components/auth/LogoutWarningModal.tsx
import React, { useEffect, useRef } from 'react';
import { OutboxSimulationNotice } from '../layout/OutboxSimulationNotice';
import type { LocalDataPresenceStatus } from '../../services/auth/localUserDataPresence';

export type LogoutModalMode = 'local-data-loss' | 'pending-sync';

export interface LogoutWarningModalProps {
  isOpen: boolean;
  mode: LogoutModalMode;
  presenceStatus?: LocalDataPresenceStatus;
  pendingSyncMessage?: string | null;
  errorMessage?: string | null;
  isSubmitting: boolean;
  isOnline: boolean;
  onCancel: () => void;
  onConfirmDestructiveLogout: () => void;
  onSyncAndContinue: () => void;
}

const LOCAL_DATA_LOSS_COPY =
  'Os perfis e históricos desta conta estão guardados apenas neste dispositivo. Ao terminar sessão, serão eliminados daqui e não existe uma cópia de segurança disponível na aplicação.';

export const LogoutWarningModal: React.FC<LogoutWarningModalProps> = ({
  isOpen,
  mode,
  presenceStatus = 'present',
  pendingSyncMessage,
  errorMessage,
  isSubmitting,
  isOnline,
  onCancel,
  onConfirmDestructiveLogout,
  onSyncAndContinue
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const submittingRef = useRef(isSubmitting);
  const cancelFnRef = useRef(onCancel);
  submittingRef.current = isSubmitting;
  cancelFnRef.current = onCancel;

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!submittingRef.current) {
          e.preventDefault();
          cancelFnRef.current();
        }
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isLossMode = mode === 'local-data-loss';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-warning-title"
        aria-describedby="logout-warning-desc"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-amber-200 space-y-4"
      >
        <h3 id="logout-warning-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span aria-hidden="true">⚠️</span>
          <span>{isLossMode ? 'Confirmar eliminação de dados locais' : 'Alterações por Sincronizar'}</span>
        </h3>

        <p id="logout-warning-desc" className="text-sm text-gray-700 leading-relaxed">
          {isLossMode
            ? LOCAL_DATA_LOSS_COPY
            : pendingSyncMessage || 'Existem alterações por sincronizar. Ligue-se à internet e sincronize antes de terminar sessão.'}
        </p>

        {isLossMode && presenceStatus === 'indeterminate' && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
            Não foi possível verificar com certeza a ausência de registos locais; este aviso é apresentado por precaução.
          </p>
        )}

        {!isLossMode && <OutboxSimulationNotice />}

        {errorMessage && (
          <div role="alert" className="text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[48px] px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLossMode ? 'Cancelar' : 'Voltar'}
          </button>

          {isLossMode ? (
            <button
              type="button"
              onClick={onConfirmDestructiveLogout}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[48px] px-4 py-2 text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'A terminar sessão...' : 'Terminar sessão e apagar dados locais'}
            </button>
          ) : (
            isOnline && (
              <button
                type="button"
                onClick={onSyncAndContinue}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[48px] px-4 py-2 text-sm font-bold text-white bg-daterra-primary hover:bg-emerald-900 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'A Sincronizar...' : 'Sincronizar e Sair'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
