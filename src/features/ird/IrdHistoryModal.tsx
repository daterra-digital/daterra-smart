import React, { useEffect } from 'react';
import { History, Trash2, RotateCcw, X } from 'lucide-react';
import type { CalculationHistoryRecord } from '../../types/calculator.ts';
import { MAX_ACTIVE_CALCULATIONS_PER_TOOL } from '../../types/calculator.ts';

interface IrdHistoryModalProps {
  readonly isOpen: boolean;
  readonly records: CalculationHistoryRecord[];
  readonly isLoading: boolean;
  readonly userId: string | null;
  readonly onClose: () => void;
  readonly onDelete: (id: string) => void;
  readonly onRestore?: (record: CalculationHistoryRecord) => void;
}

export const IrdHistoryModal: React.FC<IrdHistoryModalProps> = ({
  isOpen,
  records,
  isLoading,
  userId,
  onClose,
  onDelete,
  onRestore
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ird-history-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#114037]" />
            <div>
              <h2 id="ird-history-title" className="text-base sm:text-lg font-extrabold text-[#114037]">
                Histórico Local IRD ({records.length}/{MAX_ACTIVE_CALCULATIONS_PER_TOOL})
              </h2>
              <p className="text-xs text-slate-600">
                Persistência offline em Dexie v10 · <code>syncStatus: local_only</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar histórico"
            className="touch-target px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-extrabold inline-flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Fechar
          </button>
        </div>

        {!userId ? (
          <div role="alert" className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-semibold text-amber-950">
            Inicie sessão para gravar e consultar avaliações IRD isoladas na sua conta.
          </div>
        ) : isLoading ? (
          <div className="p-4 text-center text-sm font-semibold text-slate-600" aria-busy="true">
            A carregar avaliações locais...
          </div>
        ) : records.length === 0 ? (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-700">
            Sem avaliações IRD guardadas localmente para este utilizador.
          </div>
        ) : (
          <div className="space-y-2.5">
            {records.map((rec) => {
              const score = rec.outputs?.irdScore?.rawValue ?? '--';
              const cls = rec.outputs?.irdClass?.rawValue ?? 'N/D';
              const verdict = rec.outputs?.legalVerdict?.rawValue ?? '';
              return (
                <article
                  key={rec.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers text-lg font-extrabold text-[#114037]">{score}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-300 text-[11px] font-bold text-slate-800">
                        {cls}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {rec.name || `Avaliação ${new Date(rec.createdAt).toLocaleString('pt-PT')}`}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {verdict} · {new Date(rec.createdAt).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onRestore && (
                      <button
                        type="button"
                        onClick={() => onRestore(rec)}
                        aria-label="Carregar avaliação"
                        className="touch-target px-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(rec.id)}
                      aria-label="Eliminar avaliação do histórico"
                      className="touch-target px-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="text-xs font-semibold text-[#114037] border-t border-slate-200 pt-2.5">
          O rótulo DGAV/SIFITO prevalece sempre. Eliminação lógica preserva trilha de auditoria local.
        </p>
      </div>
    </div>
  );
};
