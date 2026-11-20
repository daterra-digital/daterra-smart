// src/features/settings/nozzles/components/BentoGeometricSchemeCard.tsx
import React from 'react';
import type {
  NozzleBoomDirection,
  NozzleProfile,
  TunnelOrientation,
  UavNozzleMode
} from '../../../../schemas/nozzle-profile.schema.ts';
import type { TunnelRampFilter } from '../services/nozzleTunnelHelpers.ts';
import type { PneumaticArmFilter } from '../services/nozzlePneumaticHelpers.ts';
import type { CannonGroupFilter } from '../services/nozzleCannonHelpers.ts';
import { inferDroneRotorCount, type DroneFlankFilter } from '../services/nozzleDroneHelpers.ts';
import { inferPrimaryCount } from '../services/nozzleProfileMath.ts';
import { BentoSchemeHeaderStrip } from './BentoSchemeHeaderStrip.tsx';
import { SvgBoom2d } from './svg-schemes/SvgBoom2d.tsx';
import { SvgAxialFan3d } from './svg-schemes/SvgAxialFan3d.tsx';
import { SvgTangentialFan3d } from './svg-schemes/SvgTangentialFan3d.tsx';
import { SvgCrossflowTower3d } from './svg-schemes/SvgCrossflowTower3d.tsx';
import { SvgTunnel3d } from './svg-schemes/SvgTunnel3d.tsx';
import { SvgPneumatic3d } from './svg-schemes/SvgPneumatic3d.tsx';
import { SvgCannon3d } from './svg-schemes/SvgCannon3d.tsx';
import { SvgDroneUav } from './svg-schemes/SvgDroneUav.tsx';
import { SvgManualLance } from './svg-schemes/SvgManualLance.tsx';

interface BentoGeometricSchemeCardProps {
  profile: NozzleProfile;
  selectedIndex: number;
  boomSectorFilter?: number | 'ALL';
  tunnelRampFilter?: TunnelRampFilter;
  pneumaticArmFilter?: PneumaticArmFilter;
  cannonGroupFilter?: CannonGroupFilter;
  droneFlankFilter?: DroneFlankFilter;
  onSelectSlot: (index: number) => void;
  onChangeTunnelRampFilter?: (filter: TunnelRampFilter) => void;
  onChangePneumaticArmFilter?: (filter: PneumaticArmFilter) => void;
  onChangeCannonGroupFilter?: (filter: CannonGroupFilter) => void;
  onChangeDroneFlankFilter?: (filter: DroneFlankFilter) => void;
  onToggleSlot: (index: number) => void;
  onApplySelectedToAll: () => void;
  onMirrorLeftRight: () => void;
  onChangeBoomDirection?: (dir: NozzleBoomDirection) => void;
  onOpenPressureKeypad?: () => void;
  onOpenPrimaryKeypad?: () => void;
  onOpenSecondaryKeypad?: () => void;
  onStepPrimary?: (delta: number) => void;
  onStepSecondary?: (delta: number) => void;
  onToggleAirAssisted?: (next: boolean) => void;
  onChangeThreeDSectors?: (sectors: 2 | 4 | 6) => void;
  onChangeTunnelOrientation?: (orientation: TunnelOrientation) => void;
  onChangeUavMode?: (mode: UavNozzleMode) => void;
  onEditProfileMetadata: () => void;
}

const SYMMETRIC_3D_TYPES = new Set([
  '3D_AXIAL',
  '3D_TANGENTIAL',
  '3D_CROSSFLOW',
  '3D_TUNNEL',
  '3D_PNEUMATIC',
  'UAV_DRONE'
]);

export const BentoGeometricSchemeCard: React.FC<BentoGeometricSchemeCardProps> = ({
  profile,
  selectedIndex,
  boomSectorFilter = 'ALL',
  tunnelRampFilter = 'LEFT_OUTER',
  pneumaticArmFilter = 'LEFT_1',
  cannonGroupFilter = 'MAIN',
  droneFlankFilter = 'ALL',
  onSelectSlot,
  onChangeTunnelRampFilter,
  onChangePneumaticArmFilter,
  onChangeCannonGroupFilter,
  onChangeDroneFlankFilter,
  onToggleSlot,
  onApplySelectedToAll,
  onMirrorLeftRight,
  onOpenPressureKeypad,
  onEditProfileMetadata
}) => {
  const isSymmetric = SYMMETRIC_3D_TYPES.has(profile.equipmentType);
  const selectedSlot = profile.slots.find((s) => s.slotIndex === selectedIndex) ?? profile.slots[0];
  const threeDSectors: 2 | 4 | 6 = profile.threeDSectors === 6 ? 6 : profile.threeDSectors === 4 ? 4 : 2;
  const boomSectors = inferPrimaryCount('2D_HORIZONTAL', profile.slots, profile.boomSectors);
  const pneumaticArms = inferPrimaryCount('3D_PNEUMATIC', profile.slots, profile.pneumaticArms);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between h-full space-y-3.5">
      {/* Faixa Superior Integrada (Título, Etiquetas informativas compactas e Ações ▾) */}
      <BentoSchemeHeaderStrip
        profile={profile}
        onOpenPressureKeypad={onOpenPressureKeypad}
        onEditProfileMetadata={onEditProfileMetadata}
        onToggleSlotActive={selectedSlot ? () => onToggleSlot(selectedSlot.slotIndex) : undefined}
        isSlotActive={selectedSlot?.isActive}
        onMirrorLeftRight={onMirrorLeftRight}
        showMirror={isSymmetric}
        onApplySelectedToAll={onApplySelectedToAll}
      />

      {/* Centro: Esquema SVG Minimalista & Gráfico Integrado */}
      <div className="bg-[#FAFBFB] rounded-2xl border border-slate-200 p-3 min-h-[260px] flex items-center justify-center flex-1">
        {profile.equipmentType === '2D_HORIZONTAL' && (
          <SvgBoom2d slots={profile.slots} selectedIndex={selectedIndex} activeSectorFilter={boomSectorFilter} sectors={boomSectors} onSelectSlot={onSelectSlot} />
        )}
        {profile.equipmentType === '3D_AXIAL' && (
          <SvgAxialFan3d slots={profile.slots} selectedIndex={selectedIndex} airAssisted={profile.airAssisted !== false} sectors={threeDSectors} onSelectSlot={onSelectSlot} />
        )}
        {profile.equipmentType === '3D_TANGENTIAL' && (
          <SvgTangentialFan3d slots={profile.slots} selectedIndex={selectedIndex} sectors={threeDSectors} onSelectSlot={onSelectSlot} />
        )}
        {profile.equipmentType === '3D_CROSSFLOW' && (
          <SvgCrossflowTower3d slots={profile.slots} selectedIndex={selectedIndex} airAssisted={profile.airAssisted !== false} sectors={threeDSectors} onSelectSlot={onSelectSlot} />
        )}
        {profile.equipmentType === '3D_TUNNEL' && (
          <SvgTunnel3d slots={profile.slots} selectedIndex={selectedIndex} orientation={profile.tunnelOrientation ?? 'BOTH'} airAssisted={profile.airAssisted !== false} sectors={threeDSectors} activeRampFilter={tunnelRampFilter} onSelectSlot={onSelectSlot} onSelectRampFilter={onChangeTunnelRampFilter} />
        )}
        {profile.equipmentType === '3D_PNEUMATIC' && (
          <SvgPneumatic3d slots={profile.slots} selectedIndex={selectedIndex} arms={pneumaticArms} activeArmFilter={pneumaticArmFilter} onSelectSlot={onSelectSlot} onSelectArmFilter={onChangePneumaticArmFilter} />
        )}
        {profile.equipmentType === '3D_CANNON' && (
          <SvgCannon3d slots={profile.slots} selectedIndex={selectedIndex} activeGroupFilter={cannonGroupFilter} onSelectSlot={onSelectSlot} onSelectGroupFilter={onChangeCannonGroupFilter} />
        )}
        {profile.equipmentType === 'UAV_DRONE' && (
          <SvgDroneUav slots={profile.slots} selectedIndex={selectedIndex} uavMode={profile.uavMode ?? 'HYDRAULIC'} rotorCount={inferDroneRotorCount(profile.slots)} activeFlankFilter={droneFlankFilter} onSelectSlot={onSelectSlot} onSelectFlankFilter={onChangeDroneFlankFilter} />
        )}
        {profile.equipmentType === 'MANUAL_LANCE' && (
          <SvgManualLance slots={profile.slots} selectedIndex={selectedIndex} onSelectSlot={onSelectSlot} />
        )}
      </div>
    </div>
  );
};
