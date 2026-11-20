// src/features/settings/nozzles/components/BentoHydraulicControlsBar.tsx
import React from 'react';
import { Minus, Plus, Wind } from 'lucide-react';
import type { NozzleProfile, TunnelOrientation, UavNozzleMode } from '../../../../schemas/nozzle-profile.schema.ts';
import { getTypologyCountMeta, inferPrimaryCount, inferSecondaryCount } from '../services/nozzleProfileMath.ts';

interface StepControlProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onOpenKeypad: () => void;
  onStep: (delta: number) => void;
}

const StepControl: React.FC<StepControlProps> = ({ label, value, unit, min, max, onOpenKeypad, onStep }) => (
  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
    <div className="min-w-0">
      <span className="text-[10px] font-bold uppercase text-slate-500 block truncate">{label}</span>
      <button type="button" onClick={onOpenKeypad} className="text-xs font-mono font-black text-[#114037] hover:underline cursor-pointer">
        {value} {unit}
      </button>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <button type="button" aria-label={`Diminuir ${label}`} disabled={value <= min} onClick={() => onStep(-1)} className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer touch-target">
        <Minus className="w-4 h-4" />
      </button>
      <button type="button" aria-label={`Aumentar ${label}`} disabled={value >= max} onClick={() => onStep(1)} className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer touch-target">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export interface BentoHydraulicControlsBarProps {
  profile: NozzleProfile;
  onOpenPrimaryKeypad: () => void;
  onOpenSecondaryKeypad: () => void;
  onStepPrimary: (delta: number) => void;
  onStepSecondary: (delta: number) => void;
  onToggleAirAssisted: (next: boolean) => void;
  onChangeThreeDSectors: (sectors: 2 | 4 | 6) => void;
  onChangeTunnelOrientation: (orientation: TunnelOrientation) => void;
  onChangeUavMode: (mode: UavNozzleMode) => void;
}

export const BentoHydraulicControlsBar: React.FC<BentoHydraulicControlsBarProps> = ({
  profile, onOpenPrimaryKeypad, onOpenSecondaryKeypad, onStepPrimary, onStepSecondary,
  onToggleAirAssisted, onChangeThreeDSectors, onChangeTunnelOrientation, onChangeUavMode
}) => {
  const meta = getTypologyCountMeta(profile.equipmentType);
  const primaryVal = inferPrimaryCount(
    profile.equipmentType,
    profile.slots,
    profile.equipmentType === '2D_HORIZONTAL' ? profile.boomSectors : profile.equipmentType === '3D_PNEUMATIC' ? profile.pneumaticArms : undefined
  );
  const secondaryVal = inferSecondaryCount(
    profile.equipmentType,
    profile.slots,
    profile.equipmentType === '2D_HORIZONTAL'
      ? profile.boomNozzlesPerSector
      : profile.equipmentType === '3D_PNEUMATIC'
        ? profile.pneumaticNozzlesPerArm
        : profile.cannonDeflectorCount
  );

  const supportsAirToggle =
    profile.equipmentType === '2D_HORIZONTAL' ||
    profile.equipmentType === '3D_AXIAL' ||
    profile.equipmentType === '3D_CROSSFLOW' ||
    profile.equipmentType === '3D_TUNNEL';
  const airEnabled = profile.equipmentType === '2D_HORIZONTAL' ? Boolean(profile.airAssisted) : profile.airAssisted !== false;
  const is3dFanWithSectors =
    profile.equipmentType === '3D_AXIAL' || profile.equipmentType === '3D_TANGENTIAL' || profile.equipmentType === '3D_CROSSFLOW' || profile.equipmentType === '3D_TUNNEL';
  const threeDSectors: 2 | 4 | 6 = profile.threeDSectors === 6 ? 6 : profile.threeDSectors === 4 ? 4 : 2;
  const tunnelOri: TunnelOrientation = profile.tunnelOrientation ?? 'BOTH';
  const uavMode: UavNozzleMode = profile.uavMode ?? 'HYDRAULIC';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
      <StepControl label={meta.label} value={primaryVal} unit={meta.unit} min={meta.min} max={meta.max} onOpenKeypad={onOpenPrimaryKeypad} onStep={onStepPrimary} />

      {meta.secondary && (
        <StepControl label={meta.secondary.label} value={secondaryVal} unit={meta.secondary.unit} min={meta.secondary.min} max={meta.secondary.max} onOpenKeypad={onOpenSecondaryKeypad} onStep={onStepSecondary} />
      )}

      {is3dFanWithSectors && (
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-600">Setores Altura</span>
          <div className="flex gap-1">
            {([2, 4, 6] as const).map((sec) => (
              <button key={sec} type="button" onClick={() => onChangeThreeDSectors(sec)} className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border ${threeDSectors === sec ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-600 border-slate-300'}`}>
                {sec}
              </button>
            ))}
          </div>
        </div>
      )}

      {supportsAirToggle && (
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center gap-1 leading-tight">
            <Wind className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" />
            <span>Assistência de ar</span>
          </span>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={() => onToggleAirAssisted(true)} className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border ${airEnabled ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-600 border-slate-300'}`}>
              Sim
            </button>
            <button type="button" onClick={() => onToggleAirAssisted(false)} className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border ${!airEnabled ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-600 border-slate-300'}`}>
              Não
            </button>
          </div>
        </div>
      )}

      {profile.equipmentType === '3D_TUNNEL' && (
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-600">Orientação</span>
          <div className="flex gap-1">
            {(['INNER', 'OUTER', 'BOTH'] as const).map((ori) => (
              <button key={ori} type="button" onClick={() => onChangeTunnelOrientation(ori)} className={`min-h-[44px] px-2.5 rounded-xl text-[11px] font-extrabold cursor-pointer border ${tunnelOri === ori ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-600 border-slate-300'}`}>
                {ori === 'INNER' ? 'Interior' : ori === 'OUTER' ? 'Exterior' : 'Ambas'}
              </button>
            ))}
          </div>
        </div>
      )}

      {profile.equipmentType === 'UAV_DRONE' && (
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-600">Emissão UAV</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => onChangeUavMode('HYDRAULIC')} className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border ${uavMode === 'HYDRAULIC' ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-600 border-slate-300'}`}>
              BD
            </button>
            <button type="button" onClick={() => onChangeUavMode('ROTARY_CDA')} className={`min-h-[44px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border ${uavMode === 'ROTARY_CDA' ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-600 border-slate-300'}`}>
              CDA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
