// src/features/perfis/components/calibration/CalibrationNozzleChartCard.tsx
import React, { useState } from 'react';
import { BarChart3, SlidersHorizontal } from 'lucide-react';
import { saveActiveAgronomicSelection } from '../../../../db/activeSelectionStorage.ts';
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';
import { SvgAxialFan3d } from '../../../settings/nozzles/components/svg-schemes/SvgAxialFan3d.tsx';
import { SvgBoom2d } from '../../../settings/nozzles/components/svg-schemes/SvgBoom2d.tsx';
import { SvgCannon3d } from '../../../settings/nozzles/components/svg-schemes/SvgCannon3d.tsx';
import { SvgCrossflowTower3d } from '../../../settings/nozzles/components/svg-schemes/SvgCrossflowTower3d.tsx';
import { SvgDroneUav } from '../../../settings/nozzles/components/svg-schemes/SvgDroneUav.tsx';
import { SvgManualLance } from '../../../settings/nozzles/components/svg-schemes/SvgManualLance.tsx';
import { SvgPneumatic3d } from '../../../settings/nozzles/components/svg-schemes/SvgPneumatic3d.tsx';
import { SvgTangentialFan3d } from '../../../settings/nozzles/components/svg-schemes/SvgTangentialFan3d.tsx';
import { SvgTunnel3d } from '../../../settings/nozzles/components/svg-schemes/SvgTunnel3d.tsx';
import { inferDroneRotorCount } from '../../../settings/nozzles/services/nozzleDroneHelpers.ts';
import { inferPrimaryCount } from '../../../settings/nozzles/services/nozzleProfileMath.ts';
import { formatPtNumber } from '../../services/calibrationFormatters.ts';

interface CalibrationNozzleChartCardProps {
  userId: string;
  scaledNozzleProfile: NozzleProfile | null;
  isPressureAdjusted: boolean;
  onOpenNozzlesSubmenu?: () => void;
}

const TYPOLOGY_LABELS: Record<NozzleProfile['equipmentType'], string> = {
  '2D_HORIZONTAL': 'Barra 2D',
  '3D_AXIAL': '3D Axial',
  '3D_TANGENTIAL': '3D Tangencial',
  '3D_CROSSFLOW': '3D Crossflow',
  '3D_TUNNEL': 'Túnel 3D',
  '3D_PNEUMATIC': 'Pneumático 3D',
  '3D_CANNON': 'Canhão 3D',
  'UAV_DRONE': 'Drone UAV',
  'MANUAL_LANCE': 'Lança Manual'
};

export const CalibrationNozzleChartCard: React.FC<CalibrationNozzleChartCardProps> = ({
  userId,
  scaledNozzleProfile,
  isPressureAdjusted,
  onOpenNozzlesSubmenu
}) => {
  const [selectedIndex, setSelectedIndex] = useState(1);

  if (!scaledNozzleProfile || scaledNozzleProfile.slots.length === 0) {
    return (
      <div className="w-full bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1D734B] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">Esquema e Gráfico</span>
            <h3 className="text-base sm:text-lg font-black text-[#114037] leading-tight shrink-0">Perfil de Distribuição de Débitos</h3>
          </div>
        </div>
        <div className="bg-[#FAFBFB] rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs font-medium text-slate-500">
          Selecione um <strong>Perfil Bico</strong> acima para visualizar o esquema e gráfico de distribuição de débitos.
        </div>
      </div>
    );
  }

  const p = scaledNozzleProfile;
  const slots = p.slots;
  const activeSlot = slots.some((s) => s.slotIndex === selectedIndex) ? selectedIndex : (slots[0]?.slotIndex ?? 1);
  const threeDSectors: 2 | 4 | 6 = p.threeDSectors === 6 ? 6 : p.threeDSectors === 4 ? 4 : 2;
  const boomSectors = inferPrimaryCount('2D_HORIZONTAL', slots, p.boomSectors);
  const pneumaticArms = inferPrimaryCount('3D_PNEUMATIC', slots, p.pneumaticArms);

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1D734B] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">Esquema e Gráfico</span>
            <h3 className="text-base sm:text-lg font-black text-[#114037] leading-tight shrink-0">Perfil de Distribuição de Débitos</h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-extrabold">
            {TYPOLOGY_LABELS[p.equipmentType] || p.equipmentType}
          </span>
          <span className={`px-3 py-1.5 rounded-xl border text-[11px] font-black font-mono tabular-nums ${isPressureAdjusted ? 'bg-emerald-50 border-[#3CA64C] text-[#114037]' : 'bg-slate-100 border-slate-200 text-[#114037]'}`}>
            Pressão Calibrada ({formatPtNumber(p.referencePressureBar, 1)} bar)
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[#114037] text-[11px] font-black font-mono tabular-nums">
            Bicos Ativos ({p.activeSlotsCount}/{p.totalSlotsCount})
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#114037] text-white text-[11px] font-black font-mono tabular-nums">
            Débito Total ({formatPtNumber(p.totalActiveFlowLMin, 2)} L/min)
          </span>
          {onOpenNozzlesSubmenu && (
            <button
              type="button"
              onClick={() => {
                saveActiveAgronomicSelection(userId, { nozzleProfileId: p.id });
                onOpenNozzlesSubmenu();
              }}
              className="min-h-[36px] px-3 rounded-xl border border-[#3CA64C]/50 bg-emerald-50 hover:bg-emerald-100 text-[#114037] text-[11px] font-black inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#3CA64C]" />
              <span>Ajustar em Bicos</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-[#FAFBFB] rounded-2xl border border-slate-200 p-3 sm:p-4 min-h-[260px] flex items-center justify-center">
        {p.equipmentType === '2D_HORIZONTAL' && (
          <SvgBoom2d slots={slots} selectedIndex={activeSlot} activeSectorFilter="ALL" sectors={boomSectors} onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === '3D_AXIAL' && (
          <SvgAxialFan3d slots={slots} selectedIndex={activeSlot} airAssisted={p.airAssisted !== false} sectors={threeDSectors} onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === '3D_TANGENTIAL' && (
          <SvgTangentialFan3d slots={slots} selectedIndex={activeSlot} sectors={threeDSectors} onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === '3D_CROSSFLOW' && (
          <SvgCrossflowTower3d slots={slots} selectedIndex={activeSlot} airAssisted={p.airAssisted !== false} sectors={threeDSectors} onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === '3D_TUNNEL' && (
          <SvgTunnel3d slots={slots} selectedIndex={activeSlot} orientation={p.tunnelOrientation ?? 'BOTH'} airAssisted={p.airAssisted !== false} sectors={threeDSectors} activeRampFilter="LEFT_OUTER" onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === '3D_PNEUMATIC' && (
          <SvgPneumatic3d slots={slots} selectedIndex={activeSlot} arms={pneumaticArms} activeArmFilter="LEFT_1" onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === '3D_CANNON' && (
          <SvgCannon3d slots={slots} selectedIndex={activeSlot} activeGroupFilter="MAIN" onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === 'UAV_DRONE' && (
          <SvgDroneUav slots={slots} selectedIndex={activeSlot} uavMode={p.uavMode ?? 'HYDRAULIC'} rotorCount={inferDroneRotorCount(slots)} activeFlankFilter="ALL" onSelectSlot={setSelectedIndex} />
        )}
        {p.equipmentType === 'MANUAL_LANCE' && (
          <SvgManualLance slots={slots} selectedIndex={activeSlot} onSelectSlot={setSelectedIndex} />
        )}
      </div>
    </div>
  );
};
