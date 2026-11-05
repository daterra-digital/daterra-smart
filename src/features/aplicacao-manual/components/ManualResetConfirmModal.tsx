/**
 * DATERRA Smart - Modal de Confirmação para Reiniciar Respostas
 * Previne perda acidental de dados preenchidos (< 200 LOC)
 */

import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ManualResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ManualResetConfirmModal: React.FC<ManualResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={t('common.actions.close', 'Fechar')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 id="reset-modal-title" className="text-base font-black text-slate-900">
            {t('manual.resetModal.title', 'Reiniciar parâmetros do cálculo?')}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('manual.resetModal.desc', 'Existem respostas introduzidas no percurso atual. Se reiniciar, todos os parâmetros serão limpos para iniciar um novo cálculo do zero.')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer touch-target"
          >
            {t('common.actions.cancel', 'Cancelar')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('common.reset', 'Reiniciar')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
