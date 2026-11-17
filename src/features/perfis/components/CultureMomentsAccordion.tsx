// src/features/perfis/components/CultureMomentsAccordion.tsx
// Cartão Bento 4 ("Momento da cultura") com timeline cronológica crescente e histórico de revisões (<= 200 LOC).

import React from 'react';
import { AlertTriangle, CalendarDays, Plus } from 'lucide-react';
import type { ProfileCropMoment, ProfileCulture, ProfileMomentRevision } from '../../../db/types';
import { detectCultureTelemetryIncoherence } from '../services/cultureEngineCompatibility';
import { findLatestChronologicalMoment, formatIsoCivilToDdMmYyyy } from '../services/cultureDateUtils';
import { MomentTimelineItem } from './MomentTimelineItem';

export interface CultureMomentsAccordionProps {
  editingCulture?: ProfileCulture;
  moments: ProfileCropMoment[];
  revisionsByMomentId: Record<number, ProfileMomentRevision[]>;
  cropKey: string;
  onOpenNewMoment: () => void;
  onActivateMoment: (momentId: number) => void;
  onEditMoment: (moment: ProfileCropMoment) => void;
}

export const CultureMomentsAccordion: React.FC<CultureMomentsAccordionProps> = ({
  editingCulture,
  moments,
  revisionsByMomentId,
  cropKey,
  onOpenNewMoment,
  onActivateMoment,
  onEditMoment
}) => {
  const activeMoment = moments.find((m) => m.id === editingCulture?.active_moment_id) || findLatestChronologicalMoment(moments);
  const incoherence = detectCultureTelemetryIncoherence(editingCulture, activeMoment);
  const canAddMoment = Boolean(cropKey && editingCulture?.id);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4 h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CalendarDays className="w-4 h-4 text-[#1D734B] shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">
                Estado fenológico {moments.length > 0 ? `(${moments.length})` : ''}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                {activeMoment
                  ? `Atual: ${formatIsoCivilToDdMmYyyy(activeMoment.observedAt)} • ${activeMoment.stageLabel}`
                  : 'Linha temporal cronológica crescente (mais antigo → mais recente)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!canAddMoment}
            title={!canAddMoment ? 'Selecione ou guarde primeiro uma parcela' : 'Registar novo momento nesta parcela'}
            onClick={onOpenNewMoment}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#114037] hover:bg-[#195a4d] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 text-[#3CA64C]" />
            <span>+ Momento</span>
          </button>
        </div>

        {incoherence.hasIncoherence && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-[11px] text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Divergência com cálculo externo recente (EPPO)</span>
            </div>
            <p>Uma calculadora atualizou os valores do perfil sem criar novo momento. Registe um momento ou ative o pretendido.</p>
          </div>
        )}

        {moments.length === 0 ? (
          <div className="py-6 text-center space-y-1.5">
            <p className="text-xs font-semibold text-slate-600">
              Ainda não existem momentos fenológicos registados nesta parcela.
            </p>
            <p className="text-[11px] text-slate-400">
              Clique em &ldquo;+ Momento&rdquo; para registar data civil (DD-MM-AAAA), estádio e medições da copa.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {moments.map((m) => (
              <MomentTimelineItem
                key={m.id}
                moment={m}
                isActive={Boolean(editingCulture?.active_moment_id ? editingCulture.active_moment_id === m.id : m.id === activeMoment?.id)}
                revisions={(m.id && revisionsByMomentId[m.id]) || []}
                onActivate={() => m.id && onActivateMoment(m.id)}
                onEdit={() => onEditMoment(m)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
