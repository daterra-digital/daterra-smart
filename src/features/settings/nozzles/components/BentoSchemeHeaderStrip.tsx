// src/features/settings/nozzles/components/BentoSchemeHeaderStrip.tsx
import React from 'react';
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';
import { getEquipmentTypeLabelPt } from '../../../../lib/equipment-math.ts';
import { BentoSchemeActionsMenu } from './BentoSchemeActionsMenu.tsx';

export interface BentoSchemeHeaderStripProps {
  profile: NozzleProfile;
  onOpenPressureKeypad?: () => void;
  onEditProfileMetadata: () => void;
  onToggleSlotActive?: () => void;
  isSlotActive?: boolean;
  onMirrorLeftRight?: () => void;
  showMirror?: boolean;
  onApplySelectedToAll?: () => void;
}

export const BentoSchemeHeaderStrip: React.FC<BentoSchemeHeaderStripProps> = ({
  profile,
  onEditProfileMetadata,
  onToggleSlotActive,
  isSlotActive = true,
  onMirrorLeftRight,
  showMirror = false,
  onApplySelectedToAll
}) => {
  const typeLabel = getEquipmentTypeLabelPt(profile.equipmentType);
  const pressureStr = profile.referencePressureBar.toFixed(1).replace('.', ',');
  const flowStr = profile.totalActiveFlowLMin.toFixed(2).replace('.', ',');

  return (
    <div className="space-y-2 pb-3 border-b border-slate-100">
      {/* Nível 1: Título à esquerda + Ação única destacada à direita */}
      <div className="flex items-center justify-between gap-3">
        <div className="shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
            ESQUEMA E GRÁFICO
          </span>
          <h3 className="text-base font-black text-slate-900 leading-tight mt-0.5 whitespace-nowrap">
            Perfil de Distribuição de Débitos
          </h3>
        </div>

        <BentoSchemeActionsMenu
          onEditProfileMetadata={onEditProfileMetadata}
          onToggleSlotActive={onToggleSlotActive}
          isSlotActive={isSlotActive}
          onMirrorLeftRight={onMirrorLeftRight}
          showMirror={showMirror}
          onApplySelectedToAll={onApplySelectedToAll}
        />
      </div>

      {/* Nível 2: Faixa de telemetria passiva compacta (vírgula decimal PT-PT e tabular-nums) */}
      <div className="flex flex-wrap items-center gap-1.5 tabular-nums">
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap bg-emerald-50 text-[#114037] border border-emerald-200">
          {typeLabel}
        </span>

        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap bg-slate-100 text-slate-700 border border-slate-200">
          Pressão {pressureStr} bar
        </span>

        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap bg-slate-100 text-slate-700 border border-slate-200">
          Bicos Ativos {profile.activeSlotsCount}/{profile.totalSlotsCount}
        </span>

        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap bg-[#114037] text-white border border-[#114037] shadow-2xs">
          Débito Total {flowStr} L/min
        </span>
      </div>
    </div>
  );
};
