import React from 'react';
import { ClipboardCheck, AlertTriangle } from 'lucide-react';
import type { IrdPreSaveSummaryData } from './irdPreSaveBuilder.ts';

interface IrdPreSaveSummaryProps {
  readonly data: IrdPreSaveSummaryData;
}

export const IrdPreSaveSummary: React.FC<IrdPreSaveSummaryProps> = ({ data }) => (
  <div
    aria-label="Resumo antes de guardar"
    className="rounded-2xl bg-black/20 border border-white/20 px-3.5 py-2.5 text-[11px] text-emerald-50 space-y-1.5"
  >
    <div className="font-extrabold text-emerald-100 flex items-center gap-1.5">
      <ClipboardCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Resumo antes de guardar</span>
    </div>
    <p>
      <strong>Fornecido:</strong> {data.providedPt.length > 0 ? data.providedPt.join(' · ') : 'Nenhum dado completo'}
    </p>
    <p>
      <strong>Em falta:</strong> {data.missingPt.length > 0 ? data.missingPt.join(' · ') : 'Nenhuma variável operacional em falta'}
    </p>
    {data.assumptionsPt.length > 0 && (
      <p>
        <strong>Premissas assumidas:</strong> {data.assumptionsPt.join(' ')}
      </p>
    )}
    {data.criticalAlertsPt.length > 0 && (
      <div className="rounded-xl bg-amber-950/60 border border-amber-300/50 px-2.5 py-1.5 text-amber-100 flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-300" aria-hidden="true" />
        <span><strong>Avisos/bloqueios críticos:</strong> {data.criticalAlertsPt.slice(0, 3).join(' · ')}</span>
      </div>
    )}
  </div>
);
