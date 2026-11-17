import React, { useEffect } from 'react';
import { History, Trash2, RotateCcw, X } from 'lucide-react';
import type { CalculationHistoryRecord } from '../../types/calculator.ts';
import { MAX_ACTIVE_CALCULATIONS_PER_TOOL } from '../../types/calculator.ts';
import { readIrdHistoryTrace } from './irdHistorySnapshot.ts';

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
                Persistência exclusivamente local (local_only) · sem sincronização remota
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar histórico"
            className="touch-target px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
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
              const trace = readIrdHistoryTrace(rec);
              return (
                <article
                  key={rec.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono-numbers text-lg font-extrabold text-[#114037]">{score}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-300 text-[11px] font-bold text-slate-800">
                        {cls}
                      </span>
                      {trace.assessmentLevelLabelPt && (
                        <span
                          title={trace.assessmentLevel ?? undefined}
                          data-assessment-level={trace.assessmentLevel ?? undefined}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-[#114037]"
                        >
                          {trace.assessmentLevelLabelPt}
                        </span>
                      )}
                      {trace.evaluationOriginLabelPt && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-800">
                          Origem: {trace.evaluationOriginLabelPt}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {rec.name || `Avaliação ${new Date(rec.createdAt).toLocaleString('pt-PT')}`}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {verdict} · {new Date(rec.createdAt).toLocaleDateString('pt-PT')}
                    </div>
                    {trace.isLegacyWithoutTrace ? (
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div>Snapshot legado (sem detalhe de espectro gravado)</div>
                        <div>Sem notas adicionais disponíveis</div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-medium text-[#114037] truncate">
                          {trace.dropletOriginLabel}{trace.dropletDetailPt ? ` · ${trace.dropletDetailPt}` : ''}
                        </div>
                        {trace.heightModeLabelPt && <div className="text-[11px] text-slate-600 truncate">Altura: {trace.heightModeLabelPt}</div>}
                        {trace.airAssistLabelPt && <div className="text-[11px] text-slate-600 truncate">Assistência de ar: {trace.airAssistLabelPt}</div>}
                        {trace.nozzleLabelPt && <div className="text-[11px] text-slate-700 font-medium truncate">Bico: {trace.nozzleLabelPt}</div>}
                        {trace.originSummaryPt && <div className="text-[11px] text-slate-600 truncate">{trace.originSummaryPt}</div>}
                        {trace.profileNamesSummaryPt && <div className="text-[11px] text-[#114037] truncate">Perfis: {trace.profileNamesSummaryPt}</div>}
                        {trace.fallbackFlagsPt && <div className="text-[11px] text-amber-900 truncate">Fallbacks: {trace.fallbackFlagsPt}</div>}
                        {trace.certifiedReductionSummaryPt && <div className="text-[11px] text-amber-900 truncate">{trace.certifiedReductionSummaryPt}</div>}
                        {trace.explanationNotesPt.length > 0 && (
                          <div className="text-[11px] text-slate-600 pt-0.5 space-y-0.5">
                            <span className="font-semibold text-slate-700">Notas de explicação e premissas:</span>
                            {trace.explanationNotesPt.map((note, idx) => <div key={idx} className="leading-snug">• {note}</div>)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onRestore && (
                      <button
                        type="button"
                        onClick={() => onRestore(rec)}
                        aria-label="Carregar avaliação"
                        className="touch-target px-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(rec.id)}
                      aria-label="Eliminar avaliação do histórico"
                      className="touch-target px-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="border-t border-slate-200 pt-2.5 space-y-1 text-xs">
          <p className="text-slate-600">
            Histórico estritamente local neste dispositivo (sem sincronização remota). Estes registos são limpos ao terminar sessão por segurança em dispositivos partilhados.
          </p>
          <p className="font-semibold text-[#114037]">
            Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico. Eliminação lógica preserva trilha de auditoria local.
          </p>
        </div>
      </div>
    </div>
  );
};
