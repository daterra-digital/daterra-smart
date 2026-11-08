/**
 * DATERRA Smart - Diálogo Acessível de Confirmação RGPD
 * Gestão de foco (trap, inicial, restauro) e navegação por teclado.
 * (< 200 LOC)
 */

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface RgpdDeleteAccountDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  errorMessage?: string | null;
}

export const RgpdDeleteAccountDialog: React.FC<RgpdDeleteAccountDialogProps> = ({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
  errorMessage
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Armazena elemento ativo anterior e foca input inicial ao abrir
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setInputText('');
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Teclado: Escape (apenas fecha/cancela) e Focus Trap estrito
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex="0"]'
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const isConfirmed = inputText.trim() === 'ELIMINAR';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      role="presentation"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        ref={dialogRef}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rgpd-delete-dialog-title"
        aria-describedby="rgpd-delete-dialog-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-rose-950 text-white p-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-5 right-5 p-2 rounded-full text-rose-200 hover:text-white hover:bg-rose-900/60 transition-colors cursor-pointer disabled:opacity-50"
            aria-label={t('common.close', 'Fechar')}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-800/80 rounded-xl text-rose-200">
              <AlertTriangle className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <h2 id="rgpd-delete-dialog-title" className="text-base font-bold text-white tracking-tight">
                {t('settings.dangerZone.deleteAccountTitle', 'Eliminar Conta')}
              </h2>
              <span className="text-xs text-rose-300 block font-medium">
                {t('settings.dangerZone.irreversibleAction', 'Ação definitiva e irreversível')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p id="rgpd-delete-dialog-desc" className="text-xs text-slate-700 leading-relaxed">
            {t(
              'settings.dangerZone.confirmDeleteExplanation',
              'Esta ação eliminará permanentemente o seu perfil, registos e credenciais. Digite ELIMINAR em maiúsculas para desbloquear o botão:'
            )}
          </p>

          <div className="space-y-1.5">
            <label htmlFor="rgpd-confirm-input" className="block text-xs font-semibold text-slate-800">
              {t('settings.dangerZone.typeWordLabel', 'Digite ELIMINAR para confirmar:')}
            </label>
            <input
              id="rgpd-confirm-input"
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isDeleting}
              placeholder="ELIMINAR"
              autoComplete="off"
              className="w-full px-3.5 py-2.5 text-sm font-mono border-2 border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden focus:ring-2 focus:ring-rose-200 uppercase"
              aria-required="true"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed font-medium"
            >
              {errorMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors touch-target"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isConfirmed || isDeleting}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target shadow-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('settings.dangerZone.deletingProgress', 'A eliminar...')}</span>
                </>
              ) : (
                <span>{t('settings.dangerZone.confirmButton', 'Eliminar Definitivamente')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
