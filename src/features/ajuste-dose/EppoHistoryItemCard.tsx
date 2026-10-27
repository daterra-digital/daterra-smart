import React from 'react';
import { Trash2, Scale, RotateCcw, FileDown } from 'lucide-react';
import type { EppoHistoryRecord } from '../../db/db';
import type { EppoDoseInputs, EppoDoseResults } from './types';
import { formatEppoNum } from './calculations';
import { generateEppoPdfReport } from './eppoPdfGenerator';
import { getStoredCoBrandingConfig } from '../smart-debito/coBrandingStorage';

export interface EppoHistoryItemCardProps {
  rec: EppoHistoryRecord;
  onOpenAudit: (rec: EppoHistoryRecord) => void;
  onLoadRecord: (inputs: EppoDoseInputs) => void;
  onDeleteRecord: (id: number) => void;
}

export const EppoHistoryItemCard: React.FC<EppoHistoryItemCardProps> = ({
  rec,
  onOpenAudit,
  onLoadRecord,
  onDeleteRecord
}) => {
  const inp = rec.inputs as EppoDoseInputs;
  const res = rec.results as EppoDoseResults;
  const uLarge = inp.unitMode === 'liquid' ? 'L' : 'kg';
  const uSmall = inp.unitMode === 'liquid' ? 'mL' : 'g';
  const cropName =
    inp.cropReference === 'vinha'
      ? 'Vinha | Sebe (LWA)'
      : 'Pomar | Fruteiras (TRV)';

  return (
    <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-slate-200 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 block">
            {new Date(rec.date).toLocaleString('pt-PT')}
          </span>
          <h4 className="text-xs sm:text-sm font-black text-slate-900">
            {cropName} • Depósito {inp.tankCapacityL} L
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-xl bg-[#114037] text-[#8ffa94] font-mono text-xs font-black shrink-0">
          {formatEppoNum(res.productInTankMethod1Large, 2)} {uLarge} (
          {formatEppoNum(res.productInTankMethod1Small, 0)} {uSmall})
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-100">
        <div>
          <span className="text-slate-400 font-bold block">Dose Ajustada / ha</span>
          <span className="font-mono font-black text-slate-800">
            {formatEppoNum(res.adjustedDoseHa, 2)} {uLarge}/ha
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-bold block">Volume Aplicado</span>
          <span className="font-mono font-black text-slate-800">
            {formatEppoNum(inp.sprayVolumeLHa, 0)} L/ha
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
        <button
          type="button"
          onClick={() => onOpenAudit(rec)}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#114037] border border-emerald-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5 text-[#3CA64C]" />
          <span>Memória de Cálculo</span>
        </button>

        <button
          type="button"
          onClick={() =>
            generateEppoPdfReport(
              { inputs: inp, results: res, dateIso: rec.date },
              getStoredCoBrandingConfig()
            )
          }
          className="py-2 px-3 rounded-xl bg-[#114037] hover:bg-[#19584b] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Exportar Relatório PDF com Co-Branding"
        >
          <FileDown className="w-3.5 h-3.5 text-[#8ffa94]" />
          <span>PDF</span>
        </button>

        <button
          type="button"
          onClick={() => onLoadRecord(inp)}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Carregar</span>
        </button>

        {rec.id !== undefined && (
          <button
            type="button"
            onClick={() => onDeleteRecord(rec.id!)}
            aria-label="Apagar registo"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
