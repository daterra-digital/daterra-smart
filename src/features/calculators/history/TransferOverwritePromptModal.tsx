/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: TransferOverwritePromptModal
 * Fase 6B - Prevenção de Substituição Indevida de Valores
 * 
 * REGRAS DE SEGURANÇA:
 * 1. Não substitui dados editados pelo agricultor sem confirmação explícita.
 * 2. Compara claramente Valor Atual vs Valor Recebido por campo.
 * 3. Permite Manter Atual, Usar Recebido ou Cancelar Transferência.
 * 4. Acessibilidade completa com role="dialog", aria-modal="true" e Escape.
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Check, Ban } from 'lucide-react';

export interface OverwriteComparisonItem {
  fieldId: string;
  label: string;
  currentValue: number | string;
  currentUnit: string;
  receivedValue: number | string;
  receivedUnit: string;
}

export interface TransferOverwritePromptModalProps {
  isOpen: boolean;
  onKeepCurrent: () => void;
  onApplyReceived: () => void;
  onCancelTransfer: () => void;
  sourceDateText: string;
  comparisons: OverwriteComparisonItem[];
}

export const TransferOverwritePromptModal: React.FC<TransferOverwritePromptModalProps> = ({
  isOpen,
  onKeepCurrent,
  onApplyReceived,
  onCancelTransfer,
  sourceDateText,
  comparisons
}) => {
  const applyBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        applyBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancelTransfer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancelTransfer]);

  if (!isOpen || comparisons.length === 0) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="overwrite-prompt-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-[#0D0D0D]/75 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Cabeçalho */}
        <div className="bg-[#114037] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#1D734B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#3AAA35]">
                Conflito de Preenchimento
              </span>
              <h2 id="overwrite-prompt-title" className="text-base sm:text-lg font-black leading-tight text-white mt-0.5">
                Substituir valores existentes?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelTransfer}
            className="min-w-[48px] min-h-[48px] rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-target flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Cancelar transferência"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Esta calculadora já tem valores introduzidos. Foram recebidos dados do cálculo de{' '}
            <strong className="text-slate-900 font-bold">{sourceDateText}</strong>. Escolha como deseja proceder:
          </p>

          {/* Comparativo de Campos */}
          <div className="space-y-3">
            {comparisons.map((item) => (
              <div
                key={item.fieldId}
                className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2"
              >
                <span className="text-xs font-bold text-slate-800 block">
                  {item.label}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">
                      Valor Atual
                    </span>
                    <span className="font-bold font-mono-numbers text-slate-700">
                      {String(item.currentValue)} {item.currentUnit}
                    </span>
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-300/80 rounded-xl">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-700 block mb-0.5">
                      Valor Recebido
                    </span>
                    <span className="font-bold font-mono-numbers text-emerald-900">
                      {String(item.receivedValue)} {item.receivedUnit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelTransfer}
            className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors touch-target flex items-center justify-center gap-1.5 cursor-pointer order-3 sm:order-1"
          >
            <Ban className="w-4 h-4" />
            <span>Cancelar Transferência</span>
          </button>

          <button
            type="button"
            onClick={onKeepCurrent}
            className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors touch-target flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-2"
          >
            <span>Manter Valores Atuais</span>
          </button>

          <button
            ref={applyBtnRef}
            type="button"
            onClick={onApplyReceived}
            className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 text-xs font-extrabold text-white bg-[#114037] hover:bg-[#1D734B] rounded-xl shadow-md transition-colors touch-target flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-3"
          >
            <Check className="w-4 h-4 text-[#3AAA35]" />
            <span>Usar Valores Recebidos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
