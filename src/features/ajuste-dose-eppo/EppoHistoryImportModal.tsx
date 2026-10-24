import React from 'react';
import { X, History, ChevronRight, Layers, Box } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { CalculationHistoryRecord } from '../../types/calculator';

interface EppoHistoryImportModalProps {
  isOpen: boolean;
  onSelectRecord: (record: CalculationHistoryRecord) => void;
  onClose: () => void;
}

export const EppoHistoryImportModal: React.FC<EppoHistoryImportModalProps> = ({
  isOpen,
  onSelectRecord,
  onClose
}) => {
  const records = useLiveQuery(
    async () => {
      try {
        if (!db?.['calculation_history_v2']) return [];
        return await db['calculation_history_v2']
          .filter((r) => (r.calculatorId === 'calc_area_parede_foliar' || r.calculatorId === 'calc_volume_copa') && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch { return []; }
    },
    [isOpen]
  ) ?? [];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
              <History className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#114037] uppercase tracking-wide">Importar do Histórico LWA / TRV</h3>
              <p className="text-[11px] text-slate-500 font-medium">Carregue valores pré-calculados das ferramentas agronómicas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {records.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                Nenhum registo encontrado nas ferramentas Área de Parede Foliar (LWA) ou Volume de Copa (TRV).
              </p>
              <p className="text-[11px] text-slate-400">
                Pode utilizar o <strong>Cálculo Manual</strong> ou selecionar um <strong>Perfil</strong>.
              </p>
            </div>
          ) : (
            records.map((r) => {
              const isLwa = r.calculatorId === 'calc_area_parede_foliar';
              const rawVal = isLwa ? (r.outputs?.areaParedeFoliar?.rawValue ?? 0) : (r.outputs?.volumeCopa?.rawValue ?? 0);
              const unit = isLwa ? 'm² LWA/ha' : 'm³ TRV/ha';
              const dateStr = new Date(r.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { onSelectRecord(r); onClose(); }}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-[#3CA64C] hover:bg-emerald-50/40 transition-all flex items-center justify-between group touch-target cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isLwa ? 'bg-emerald-100 text-[#114037]' : 'bg-sky-100 text-sky-900'
                      }`}>
                        {isLwa ? <Layers className="w-3 h-3" /> : <Box className="w-3 h-3" />}
                        {isLwa ? 'LWA Foliar' : 'TRV Copa'}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">{dateStr}</span>
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {rawVal.toLocaleString('pt-PT')} <span className="text-[11px] font-normal text-slate-500">{unit}</span>
                    </div>
                    {r.name && <div className="text-[11px] text-slate-500">{r.name}</div>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3CA64C]" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
