import React from 'react';
import {
  X,
  History,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { PreInspectionSavedRecord } from './preInspectionStorage';

export interface PreInspectionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PreInspectionSavedRecord[];
  onLoadRecord: (record: PreInspectionSavedRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const PreInspectionHistoryModal: React.FC<PreInspectionHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onLoadRecord,
  onDeleteRecord
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-inspection-history-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] overflow-y-auto w-full max-w-3xl bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#114037] text-[#8ffa94] flex items-center justify-center shadow-xs shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                Registos Guardados • Pré-Inspeção DGAV
              </span>
              <h3
                id="pre-inspection-history-title"
                className="text-base font-black text-slate-900 leading-tight"
              >
                Histórico de Pré-Inspeções Realizadas
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar histórico"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {records.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm font-extrabold text-slate-700">
              Ainda não existem pré-inspeções guardadas.
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Avalie as categorias do seu equipamento e toque em <strong>Guardar</strong> na barra
              inferior para registar o diagnóstico.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => {
              const hasAnomalies = rec.anomaliaCount > 0;
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-[#FAFBFB] border border-slate-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">
                        {new Date(rec.dateIso).toLocaleString('pt-PT')}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        {rec.equipmentTitle}
                      </h4>
                    </div>

                    {hasAnomalies ? (
                      <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-mono text-xs font-extrabold inline-flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>
                          {rec.anomaliaCount}{' '}
                          {rec.anomaliaCount === 1 ? 'Anomalia Detetada' : 'Anomalias Detetadas'}
                        </span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-extrabold inline-flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{rec.conformityPct === 100 ? '100% Conforme' : `${rec.conformityPct}% Conforme`}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-bold block">Conformidade</span>
                      <span className="font-mono font-black text-slate-800">
                        {rec.conformityPct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Conformes</span>
                      <span className="font-mono font-black text-emerald-700">
                        {rec.conformeCount} / {rec.totalSubQuestions}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Anomalias</span>
                      <span className="font-mono font-black text-rose-600">
                        {rec.anomaliaCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadRecord(rec);
                        onClose();
                      }}
                      className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[#114037] hover:bg-[#19584b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#8ffa94]" />
                      <span>Consultar / Carregar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(rec.id)}
                      aria-label="Apagar registo"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
