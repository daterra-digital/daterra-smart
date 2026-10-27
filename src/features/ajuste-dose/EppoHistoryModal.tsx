import React, { useState } from 'react';
import { X, History } from 'lucide-react';
import type { EppoHistoryRecord } from '../../db/db';
import type { EppoDoseInputs, EppoDoseResults } from './types';
import { EppoEquivalencesModal } from './EppoEquivalencesModal';
import { EppoHistoryItemCard } from './EppoHistoryItemCard';

export interface EppoHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: EppoHistoryRecord[];
  onLoadRecord: (inputs: EppoDoseInputs) => void;
  onDeleteRecord: (id: number) => void;
}

export const EppoHistoryModal: React.FC<EppoHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onLoadRecord,
  onDeleteRecord
}) => {
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<EppoHistoryRecord | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] overflow-y-auto w-full max-w-4xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
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
                  Registos Guardados • IndexedDB
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Histórico & Memória de Cálculo EPPO
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
                Ainda não existem cálculos guardados.
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Configure a geometria, rótulo e depósito e toque em <strong>Guardar</strong> na barra
                inferior para consultar aqui a Memória de Cálculo e Equivalências EPPO.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((rec) => (
                <EppoHistoryItemCard
                  key={rec.id}
                  rec={rec}
                  onOpenAudit={setSelectedAuditRecord}
                  onLoadRecord={(inp) => {
                    onLoadRecord(inp);
                    onClose();
                  }}
                  onDeleteRecord={onDeleteRecord}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAuditRecord && (
        <EppoEquivalencesModal
          isOpen={true}
          onClose={() => setSelectedAuditRecord(null)}
          inputs={selectedAuditRecord.inputs as EppoDoseInputs}
          results={selectedAuditRecord.results as EppoDoseResults}
          unitLarge={
            (selectedAuditRecord.inputs as EppoDoseInputs).unitMode === 'liquid' ? 'L' : 'kg'
          }
          unitSmall={
            (selectedAuditRecord.inputs as EppoDoseInputs).unitMode === 'liquid' ? 'mL' : 'g'
          }
        />
      )}
    </>
  );
};
