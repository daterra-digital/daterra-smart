// src/features/settings/nozzles/components/NozzleMetadataGeometryFields.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import type { TunnelOrientation, UavNozzleMode } from '../../../../schemas/nozzle-profile.schema.ts';
import { NozzleBoomSectorFields } from './NozzleBoomSectorFields.tsx';
import { NozzlePneumaticFields } from './NozzlePneumaticFields.tsx';
import { NozzleCannonFields } from './NozzleCannonFields.tsx';
import { NozzleDroneFields } from './NozzleDroneFields.tsx';
import { NozzleManualFields } from './NozzleManualFields.tsx';

export interface NozzleMetadataGeometryFieldsProps {
  pressure: number;
  primaryCount: number;
  sectorCounts?: number[];
  threeDSectors: 2 | 4 | 6;
  airAssisted: boolean;
  isBoom2D?: boolean;
  is3dFan: boolean;
  isTunnel3d?: boolean;
  isPneumatic3d?: boolean;
  isCannon3d?: boolean;
  isDroneUav?: boolean;
  isManualLance?: boolean;
  rotorCount?: 4 | 6 | 8;
  uavMode?: UavNozzleMode;
  secondaryCount?: number;
  tunnelOrientation?: TunnelOrientation;
  supportsAir: boolean;
  onOpenPressureKeypad: () => void;
  onOpenCountKeypad: () => void;
  onOpenSecondaryKeypad?: () => void;
  onOpenSectorKeypad?: (sectorIdx: number) => void;
  onStepCount: (delta: number) => void;
  onStepSecondaryCount?: (delta: number) => void;
  onStepSectorCount?: (sectorIdx: number, delta: number) => void;
  onChangeArms?: (arms: number) => void;
  onChangeThreeDSectors: (sec: 2 | 4 | 6) => void;
  onChangeTunnelOrientation?: (ori: TunnelOrientation) => void;
  onChangeRotorCount?: (r: 4 | 6 | 8) => void;
  onChangeUavMode?: (m: UavNozzleMode) => void;
  onChangeAirAssisted: (next: boolean) => void;
}

export const NozzleMetadataGeometryFields: React.FC<NozzleMetadataGeometryFieldsProps> = ({
  pressure, primaryCount, sectorCounts = [], threeDSectors, airAssisted, isBoom2D = false, is3dFan, isTunnel3d = false, isPneumatic3d = false, isCannon3d = false, isDroneUav = false, isManualLance = false, rotorCount = 6, uavMode = 'HYDRAULIC', secondaryCount = 2, tunnelOrientation = 'BOTH', supportsAir, onOpenPressureKeypad, onOpenCountKeypad, onOpenSecondaryKeypad, onOpenSectorKeypad, onStepCount, onStepSecondaryCount, onStepSectorCount, onChangeArms, onChangeThreeDSectors, onChangeTunnelOrientation, onChangeRotorCount, onChangeUavMode, onChangeAirAssisted
}) => {
  const activeRampCount = isTunnel3d && tunnelOrientation === 'BOTH' ? 4 : 2;
  return (
    <>
      {/* 4. Pressão de Trabalho */}
      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">Pressão de Trabalho (bar)</label>
        <button
          type="button"
          onClick={onOpenPressureKeypad}
          className="w-full h-[44px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 flex items-center justify-between cursor-pointer hover:border-[#114037] tabular-nums"
        >
          <span>{pressure.toFixed(1).replace('.', ',')} bar</span>
          <span className="text-[11px] text-[#3CA64C] font-extrabold uppercase">Alterar</span>
        </button>
      </div>

      {/* 5. N.º de Setores (2D) / N.º de Níveis (3D) / Braços Pneumáticos / Canhão / Bicos */}
      {isPneumatic3d && onChangeArms && onStepSecondaryCount && onOpenSecondaryKeypad ? (
        <NozzlePneumaticFields arms={primaryCount} nozzlesPerArm={secondaryCount} onChangeArms={onChangeArms} onStepNozzlesPerArm={onStepSecondaryCount} onOpenNozzlesKeypad={onOpenSecondaryKeypad} />
      ) : isCannon3d && onStepSecondaryCount && onOpenSecondaryKeypad ? (
        <NozzleCannonFields mainCount={primaryCount} deflectorCount={secondaryCount} onStepMain={onStepCount} onOpenMainKeypad={onOpenCountKeypad} onStepDeflector={onStepSecondaryCount} onOpenDeflectorKeypad={onOpenSecondaryKeypad} />
      ) : isDroneUav && onChangeRotorCount && onChangeUavMode ? (
        <NozzleDroneFields rotorCount={rotorCount} nozzleCount={primaryCount} uavMode={uavMode} onChangeRotorCount={onChangeRotorCount} onStepNozzleCount={onStepCount} onOpenNozzleCountKeypad={onOpenCountKeypad} onChangeUavMode={onChangeUavMode} />
      ) : isManualLance ? (
        <NozzleManualFields lanceCount={primaryCount} onStepCount={onStepCount} onOpenCountKeypad={onOpenCountKeypad} />
      ) : (
        <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">
          {isBoom2D ? 'N.º de Setores da Barra' : is3dFan ? 'N.º de Níveis' : 'N.º de Bicos'}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStepCount(-1)}
            className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenCountKeypad}
            className="flex-1 h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 cursor-pointer hover:border-[#114037] tabular-nums"
          >
            {isBoom2D
              ? `${primaryCount} ${primaryCount === 1 ? 'setor' : 'setores'}`
              : is3dFan
                ? `${primaryCount} ${primaryCount === 1 ? 'nível' : 'níveis'} · ${primaryCount * activeRampCount} bicos`
                : `${primaryCount} bicos`}
          </button>
          <button
            type="button"
            onClick={() => onStepCount(1)}
            className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
            {is3dFan && (
              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                {isTunnel3d
                  ? `Cada nível representa ${activeRampCount} posições (${activeRampCount === 4 ? 'Esq. Ext., Esq. Int., Dir. Int. e Dir. Ext.' : tunnelOrientation === 'INNER' ? 'Esq. Int. e Dir. Int.' : 'Esq. Ext. e Dir. Ext.'}).`
                  : 'Cada nível representa 2 posições simétricas (1 à Esquerda + 1 à Direita).'}
              </p>
            )}
        </div>
      )}

      {/* 5c. Orientação das Rampas (exclusivo 3D_TUNNEL) */}
      {isTunnel3d && onChangeTunnelOrientation && (
        <div>
          <label className="block text-xs font-semibold text-[#114037] mb-1.5">Orientação das Rampas</label>
          <div className="grid grid-cols-3 gap-2">
            {([['BOTH', 'Ambas (4 rampas)'], ['INNER', 'Interior (2 rampas)'], ['OUTER', 'Exterior (2 rampas)']] as const).map(([ori, lbl]) => (
              <button key={ori} type="button" onClick={() => onChangeTunnelOrientation(ori)} className={`min-h-[44px] px-2 rounded-xl text-[11px] font-bold border cursor-pointer transition-colors ${tunnelOrientation === ori ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5b. Bicos por Setor S1..Sn (exclusivo 2D_HORIZONTAL) */}
      {isBoom2D && onOpenSectorKeypad && onStepSectorCount && (
        <NozzleBoomSectorFields
          sectorCounts={sectorCounts}
          onStepSectorCount={onStepSectorCount}
          onOpenSectorKeypad={onOpenSectorKeypad}
        />
      )}

      {/* 6. Setores de Altura (2, 4, 6) */}
      {is3dFan && (
        <div>
          <label className="block text-xs font-semibold text-[#114037] mb-1.5">Setores de Altura</label>
          <div className="flex gap-2">
            {[2, 4, 6].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onChangeThreeDSectors(sec as 2 | 4 | 6)}
                className={`flex-1 min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  threeDSectors === sec
                    ? 'bg-[#114037] text-white border-[#114037]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sec} Setores
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Assistência de Ar (Manga de Ar / Ventilador) */}
      {supportsAir && (
        <div>
          <label className="block text-xs font-semibold text-[#114037] mb-1.5">
            {isBoom2D ? 'Assistência de Ar (Manga de Ar)' : 'Assistência de Ar (Ventilador)'}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChangeAirAssisted(true)}
              className={`flex-1 min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                airAssisted ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => onChangeAirAssisted(false)}
              className={`flex-1 min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                !airAssisted ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Não
            </button>
          </div>
        </div>
      )}
    </>
  );
};
