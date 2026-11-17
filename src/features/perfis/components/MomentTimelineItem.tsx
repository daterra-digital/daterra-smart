// src/features/perfis/components/MomentTimelineItem.tsx
// Cartão individual da linha temporal de momentos com snapshot imutável, calda EPPO e revisões detalhadas (<= 200 LOC).

import React, { useState } from 'react';
import { CheckCircle2, History } from 'lucide-react';
import type { ProfileCropMoment, ProfileMomentRevision } from '../../../db/types.ts';
import { formatIsoCivilToDdMmYyyy } from '../services/cultureDateUtils';
import { parseMomentSnapshot } from '../services/cultureEngineCompatibility';

export interface MomentTimelineItemProps {
  moment: ProfileCropMoment;
  isActive: boolean;
  revisions: ProfileMomentRevision[];
  onActivate: () => void;
  onEdit: () => void;
}

const SOURCE_LABELS: Record<ProfileCropMoment['measurementSource'], string> = {
  measured_field: 'Medição em campo',
  copied_previous: 'Copiado de momento anterior',
  migrated_legacy_profile: 'Registo legado migrado'
};

function describeRevisionDiff(r: ProfileMomentRevision, currentSnapJson: string): string[] {
  const prev = parseMomentSnapshot(r.snapshotBeforeJson);
  const next = r.snapshotAfterJson ? parseMomentSnapshot(r.snapshotAfterJson) : parseMomentSnapshot(currentSnapJson);
  const diffs: string[] = [];

  if (r.previousObservedAt !== r.newObservedAt) {
    diffs.push(`Data: ${formatIsoCivilToDdMmYyyy(r.previousObservedAt)} → ${formatIsoCivilToDdMmYyyy(r.newObservedAt)}`);
  }
  if (r.previousStageLabel !== r.newStageLabel) {
    diffs.push(`Estádio: ${r.previousStageLabel} → ${r.newStageLabel}`);
  }
  if (prev?.canopyHeightM !== next?.canopyHeightM && (prev?.canopyHeightM !== undefined || next?.canopyHeightM !== undefined)) {
    diffs.push(`Altura: ${prev?.canopyHeightM ?? '—'} m → ${next?.canopyHeightM ?? '—'} m`);
  }
  if (prev?.canopyWidthM !== next?.canopyWidthM && (prev?.canopyWidthM !== undefined || next?.canopyWidthM !== undefined)) {
    diffs.push(`Largura: ${prev?.canopyWidthM ?? '—'} m → ${next?.canopyWidthM ?? '—'} m`);
  }
  if (prev?.lai !== next?.lai && (prev?.lai !== undefined || next?.lai !== undefined)) {
    diffs.push(`LAI: ${prev?.lai ?? '—'} → ${next?.lai ?? '—'}`);
  }
  if (diffs.length === 0 && prev?.canopyHeightM !== undefined) {
    diffs.push(`Altura anterior: ${prev.canopyHeightM} m`);
  }
  return diffs;
}

export const MomentTimelineItem: React.FC<MomentTimelineItemProps> = ({
  moment,
  isActive,
  revisions,
  onActivate,
  onEdit
}) => {
  const [showRevisions, setShowRevisions] = useState(false);
  const snap = parseMomentSnapshot(moment.snapshotJson);
  const dateDisplay = formatIsoCivilToDdMmYyyy(moment.observedAt);

  return (
    <div className={`p-3.5 rounded-2xl border space-y-2 ${isActive ? 'border-[#3CA64C] bg-emerald-50/40' : 'border-slate-200 bg-slate-50/70'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono-numbers font-extrabold text-[#114037]">{dateDisplay}</span>
            {isActive && (
              <span className="px-2 py-0.5 rounded-full bg-[#114037] text-white text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#3CA64C]" />
                <span>Momento atual</span>
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1">
            {moment.stageLabel} {moment.stageCode ? <span className="font-mono text-[11px] text-slate-500">({moment.stageCode})</span> : null}
          </p>
          <p className="text-[11px] text-slate-500">{SOURCE_LABELS[moment.measurementSource]}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isActive && (
            <button
              type="button"
              onClick={onActivate}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#3CA64C] text-xs font-bold text-[#114037]"
            >
              Ativar
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700"
          >
            Rever
          </button>
        </div>
      </div>

      {snap && (snap.rowDistanceM !== undefined || snap.canopyHeightM !== undefined || snap.canopyWidthM !== undefined) && (
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono-numbers text-slate-700 pt-1">
          {snap.rowDistanceM !== undefined && <span className="px-2 py-0.5 bg-white rounded-lg border border-slate-200">Entrelinha: {snap.rowDistanceM} m</span>}
          {snap.canopyHeightM !== undefined && <span className="px-2 py-0.5 bg-white rounded-lg border border-slate-200">Altura: {snap.canopyHeightM} m</span>}
          {snap.canopyWidthM !== undefined && <span className="px-2 py-0.5 bg-white rounded-lg border border-slate-200">Largura: {snap.canopyWidthM} m</span>}
          {snap.lwaBilateral != null && <span className="px-2 py-0.5 bg-white rounded-lg border border-slate-200">LWA: {snap.lwaBilateral.toLocaleString('pt-PT')} m²/ha</span>}
          {snap.trvPure != null && <span className="px-2 py-0.5 bg-white rounded-lg border border-slate-200">TRV: {snap.trvPure.toLocaleString('pt-PT')} m³/ha</span>}
          {snap.recommendedSprayVolumeLHa != null && (
            <span className="px-2 py-0.5 bg-[#114037] text-white font-bold rounded-lg">
              Calda EPPO: {snap.recommendedSprayVolumeLHa.toLocaleString('pt-PT')} L/ha
            </span>
          )}
        </div>
      )}

      {revisions.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowRevisions((p) => !p)}
            className="text-[11px] font-bold text-[#1D734B] flex items-center gap-1 hover:underline"
          >
            <History className="w-3.5 h-3.5" />
            <span>Ver histórico de revisões ({revisions.length})</span>
          </button>
          {showRevisions && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-emerald-300">
              {revisions.map((r) => {
                const diffs = describeRevisionDiff(r, moment.snapshotJson);
                const revDate = r.createdAt ? formatIsoCivilToDdMmYyyy(r.createdAt.slice(0, 10)) : '';
                return (
                  <div key={r.id} className="text-[11px] text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-200/80 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#114037]">{diffs.join(' • ') || 'Revisão registada'}</span>
                      {revDate && <span className="text-[10px] font-mono-numbers text-slate-400">{revDate}</span>}
                    </div>
                    <p className="text-slate-600">Motivo: <span className="font-semibold">{r.reason}</span></p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
