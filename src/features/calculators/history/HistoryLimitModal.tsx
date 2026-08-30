/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: HistoryLimitModal
 * Fase 4 - Gestão de Quota de 20 Cálculos Atingida
 * 
 * Regra Estrita:
 * - Não apaga automaticamente o mais antigo.
 * - Apresenta a lista dos 20 cálculos existentes.
 * - O utilizador escolhe qual deseja eliminar.
 * - Pede confirmação explícita de eliminação.
 * - Após eliminar, guarda o novo cálculo pendente.
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Check, ArrowRight } from 'lucide-react';
import type { CalculationHistoryRecord } from '../../../types/calculator.ts';

export interface HistoryLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRecords: CalculationHistoryRecord[];
  onSelectAndDelete: (recordToDelete: CalculationHistoryRecord) => Promise<void>;
  isProcessing?: boolean;
}

export const HistoryLimitModal: React.FC<HistoryLimitModalProps> = ({
  isOpen,
  onClose,
  existingRecords,
  onSelectAndDelete,
  isProcessing = false
}) => {
  const [selectedRecord, setSelectedRecord] = useState<CalculationHistoryRecord | null>(null);
  const [confirmStep, setConfirmStep] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleChoose = (record: CalculationHistoryRecord) => {
    setSelectedRecord(record);
    setConfirmStep(true);
  };

  const handleConfirmDeletion = async () => {
    if (selectedRecord) {
      await onSelectAndDelete(selectedRecord);
      setSelectedRecord(null);
      setConfirmStep(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="limit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
        {/* Cabeçalho de Alerta */}
        <div className="p-5 sm:p-6 border-b border-amber-200 bg-amber-50/80 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="limit-modal-title" className="text-base sm:text-lg font-black text-amber-900 leading-tight">
                Limite de 20 Cálculos Atingido
              </h2>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Esta ferramenta tem o limite máximo de 20 cálculos ativos guardados. Para guardar o seu novo cálculo, escolha um cálculo da lista abaixo para libertar espaço.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-amber-800/60 hover:text-amber-900 hover:bg-amber-100 rounded-xl transition-colors touch-target min-h-0 h-auto"
            aria-label="Cancelar gravação"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal: Passo 1 (Lista) ou Passo 2 (Confirmação) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {confirmStep && selectedRecord ? (
            <div className="space-y-4 text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Confirmar eliminação para guardar o novo cálculo?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  O seguinte registo será removido do histórico ativo:
                </p>
                <div className="mt-3 p-3 bg-slate-100 rounded-xl text-xs font-bold text-daterra-primary text-left">
                  <p>{selectedRecord.name || 'Cálculo de Dose por Hectare'}</p>
                  <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                    Data: {new Date(selectedRecord.createdAt).toLocaleString('pt-PT')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Selecione o cálculo a substituir (20 registos ativos):
              </span>
              {existingRecords.map((rec) => {
                const dateStr = new Date(rec.createdAt).toLocaleDateString('pt-PT', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const pfVal = rec.outputs['quantidade_pf']?.rawValue ?? '-';
                const pfUnit = rec.outputs['quantidade_pf']?.unit ?? 'L';

                return (
                  <div
                    key={rec.id}
                    onClick={() => handleChoose(rec)}
                    className="p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 group touch-target min-h-0 h-auto"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-daterra-primary truncate">
                        {rec.name || 'Cálculo de Dose por Hectare'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono-numbers">
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold font-mono-numbers text-slate-700">
                        {pfVal} {pfUnit}
                      </span>
                      <div className="p-1 text-slate-400 group-hover:text-rose-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          {confirmStep ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmStep(false)}
                className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors touch-target"
              >
                Voltar à Lista
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletion}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 touch-target"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? 'A processar...' : 'Confirmar e Guardar Novo'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors touch-target"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
