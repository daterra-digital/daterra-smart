// src/features/perfis/components/calibration/CalibrationSavedListCard.tsx
import React, { useState } from 'react';
import { FileText, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { computeCalibrationEppoBalance } from '../../../../lib/agri-math/calibration-eppo-bridge.ts';
import type { CalibrationAuditRecord, PdfAuditReportMode } from '../../../../types/calibration-audit.ts';
import { formatPtNumber } from '../../services/calibrationFormatters.ts';

interface CalibrationSavedListCardProps {
  records: CalibrationAuditRecord[];
  cultureNamesById: Record<string, string>;
  equipmentNamesById: Record<string, string>;
  nozzleNamesById: Record<string, string>;
  isPro?: boolean;
  onLoadRecord: (record: CalibrationAuditRecord) => void;
  onExportPdf: (record: CalibrationAuditRecord, mode: PdfAuditReportMode) => void;
  onDeleteRecord: (id: string) => void;
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  ALINHADO_REF_EPPO: { text: 'Alinhado c/ Ref.', cls: 'bg-emerald-100 text-[#114037]' },
  ABAIXO_REF_EPPO: { text: 'Abaixo da Ref.', cls: 'bg-amber-100 text-amber-950' },
  ACIMA_REF_EPPO: { text: 'Acima da Ref.', cls: 'bg-amber-100 text-amber-950' },
  SEM_REF_EPPO: { text: 'Sem Ref. EPPO', cls: 'bg-slate-100 text-slate-600' }
};

export const CalibrationSavedListCard: React.FC<CalibrationSavedListCardProps> = ({
  records, cultureNamesById, equipmentNamesById, nozzleNamesById, isPro = false, onLoadRecord, onExportPdf, onDeleteRecord
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
  <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 space-y-4">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">
          Fichas de Calibração Registadas ({records.length})
        </h4>
        <p className="text-[11px] text-slate-500">Histórico auditável com selo criptográfico SHA-256</p>
      </div>
    </div>

    {records.length === 0 ? (
      <p className="text-xs text-slate-500 italic py-2">Ainda não existem fichas de calibração gravadas para esta conta.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {records.map((rec) => {
          const bal = computeCalibrationEppoBalance({
            debitoTotalLMin: rec.debitoTotalLMin, velocidadeKmh: rec.velocidadeKmh,
            entrelinhaM: rec.entrelinhaM, volumeRecomendadoEppoLHa: rec.volumeRecomendadoEppoLHa
          });
          const badge = STATUS_LABEL[bal.estadoConformidade];
          const triad = [
            rec.cultureParcelId ? cultureNamesById[rec.cultureParcelId] : null,
            rec.equipmentId ? equipmentNamesById[rec.equipmentId] : null,
            rec.nozzleProfileId ? nozzleNamesById[rec.nozzleProfileId] : null
          ].filter(Boolean).join(' · ') || rec.nomePerfil;

          return (
            <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900 text-xs break-words">{triad}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badge.cls}`}>{badge.text}</span>
                </div>
                <p className="text-sm font-black text-[#114037] font-mono tabular-nums">
                  {formatPtNumber(rec.volumeCalibradoLHa, 1)} L/ha
                  {rec.volumeRecomendadoEppoLHa !== null ? ` / Ref. ${formatPtNumber(rec.volumeRecomendadoEppoLHa, 0)} L/ha` : ''}
                </p>
                <p className="text-[11px] text-slate-600 font-mono tabular-nums">
                  {formatPtNumber(rec.velocidadeKmh, 1)} km/h · {formatPtNumber(rec.pressaoBar, 1)} bar · {formatPtNumber(rec.debitoTotalLMin, 2)} L/min · {rec.numBicosAtivos} bicos
                </p>
                {rec.sha256Seal && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#1D734B] font-mono">
                    <ShieldCheck className="w-3 h-3" /> SHA-256: {rec.sha256Seal.slice(0, 12)}…
                  </span>
                )}
              </div>
              <div className="relative flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => onLoadRecord(rec)} title="Carregar e rever ficha"
                  className="min-h-[40px] px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-[#114037] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" /><span>Rever</span>
                </button>
                <button type="button" onClick={() => setOpenMenuId((cur) => (cur === rec.id ? null : rec.id))} title="Escolher modalidade PDF"
                  className="min-h-[40px] px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-[#114037] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-[#1D734B]" /><span>PDF</span>
                  {!isPro && <span className="px-1 py-0.2 rounded bg-[#114037] text-white text-[8px] font-black uppercase">Pro</span>}
                </button>
                {openMenuId === rec.id && (
                  <div className="absolute right-0 top-11 z-30 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 space-y-1">
                    <button type="button" onClick={() => { setOpenMenuId(null); onExportPdf(rec, 'CALIBRATION_AGRONOMIC'); }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-[11px] font-bold text-[#114037] hover:bg-emerald-50 flex items-center gap-2 cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" /><span>PDF Calibração Agronómica</span>
                    </button>
                    <button type="button" onClick={() => { setOpenMenuId(null); onExportPdf(rec, 'ISO_16122_INSPECTION'); }}
                      className="w-full min-h-[40px] px-3 rounded-xl text-left text-[11px] font-bold text-[#114037] hover:bg-emerald-50 flex items-center gap-2 cursor-pointer">
                      <FileText className="w-3.5 h-3.5 text-[#1D734B] shrink-0" /><span>PDF Inspeção ISO 16122</span>
                    </button>
                  </div>
                )}
                <button type="button" onClick={() => onDeleteRecord(rec.id)} title="Eliminar ficha"
                  className="min-h-[40px] min-w-[40px] p-2 text-rose-600 hover:bg-rose-100 rounded-xl flex items-center justify-center cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
};
