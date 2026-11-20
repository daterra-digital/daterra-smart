// src/features/settings/nozzles/components/NozzleMetadataModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import type { NozzleProfile, TunnelOrientation, UavNozzleMode } from '../../../../schemas/nozzle-profile.schema.ts';
import { EQUIPMENT_TYPES, type EquipmentRecord, type EquipmentType } from '../../../../schemas/equipment.schema.ts';
import { inferDroneRotorCount } from '../services/nozzleDroneHelpers.ts';
import { EQUIPMENT_TYPE_LABELS_PT } from '../../../../lib/equipment-math.ts';
import { SearchableRoundedDropdown } from '../../../perfis/components/SearchableRoundedDropdown.tsx';
import type { CatalogSelectOption } from '../../../perfis/data/cultureCatalogData.ts';
import { DaterraKeypadModal } from '../../../../components/keypad/DaterraKeypadModal.tsx';
import { inferPrimaryCount, inferSecondaryCount, resizeProfileSlots } from '../services/nozzleProfileMath.ts';
import { buildUpdatedMetadataProfile } from '../services/nozzleProfileActions.ts';
import { getBoomSectorCounts, resizeBoomSlotsBySectorCounts } from '../services/nozzleBoom2dHelpers.ts';
import { NozzleMetadataGeometryFields } from './NozzleMetadataGeometryFields.tsx';

interface NozzleMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: NozzleProfile;
  equipments: EquipmentRecord[];
  onSave: (updated: NozzleProfile) => void;
}

type MetadataKeypadTarget = { kind: 'pressure' } | { kind: 'primaryCount' } | { kind: 'secondaryCount' } | { kind: 'sectorCount'; sectorIdx: number } | null;

export const NozzleMetadataModal: React.FC<NozzleMetadataModalProps> = ({
  isOpen,
  onClose,
  profile,
  equipments,
  onSave
}) => {
  const [name, setName] = useState(profile.name);
  const [equipmentType, setEquipmentType] = useState<EquipmentType>(profile.equipmentType);
  const [equipmentId, setEquipmentId] = useState<string>(profile.equipmentId || '');
  const [pressure, setPressure] = useState<number>(profile.referencePressureBar);
  const [primaryCount, setPrimaryCount] = useState<number>(12);
  const [secondaryCount, setSecondaryCount] = useState<number>(2);
  const [sectorCounts, setSectorCounts] = useState<number[]>([5, 5, 5]);
  const [threeDSectors, setThreeDSectors] = useState<2 | 4 | 6>(2);
  const [tunnelOrientation, setTunnelOrientation] = useState<TunnelOrientation>('BOTH');
  const [rotorCount, setRotorCount] = useState<4 | 6 | 8>(6);
  const [uavMode, setUavMode] = useState<UavNozzleMode>('HYDRAULIC');
  const [airAssisted, setAirAssisted] = useState<boolean>(true);
  const [keypadTarget, setKeypadTarget] = useState<MetadataKeypadTarget>(null);

  useEffect(() => {
    if (!isOpen) return;
    const initPrimary = inferPrimaryCount(profile.equipmentType, profile.slots, profile.boomSectors);
    setName(profile.name);
    setEquipmentType(profile.equipmentType);
    setEquipmentId(profile.equipmentId || '');
    setPressure(profile.referencePressureBar);
    setPrimaryCount(initPrimary);
    setSecondaryCount(inferSecondaryCount(profile.equipmentType, profile.slots, profile.pneumaticNozzlesPerArm));
    setSectorCounts(profile.equipmentType === '2D_HORIZONTAL' ? getBoomSectorCounts(profile.slots, initPrimary) : [5, 5, 5]);
    setThreeDSectors(profile.threeDSectors === 6 ? 6 : profile.threeDSectors === 4 ? 4 : 2);
    setTunnelOrientation(profile.tunnelOrientation ?? 'BOTH');
    setRotorCount(inferDroneRotorCount(profile.slots));
    setUavMode(profile.uavMode ?? 'HYDRAULIC');
    setAirAssisted(profile.equipmentType === '2D_HORIZONTAL' ? Boolean(profile.airAssisted) : profile.airAssisted !== false);
  }, [isOpen, profile]);

  const equipmentOptions = useMemo<CatalogSelectOption[]>(() => [
    { id: '', label: 'Configuração Direta (Sem máquina associada)' },
    ...equipments.map((eq) => ({ id: eq.id, label: `${eq.name} (${EQUIPMENT_TYPE_LABELS_PT[eq.type]} · ${eq.tankCapacityL} L)` }))
  ], [equipments]);

  const typologyOptions = useMemo<CatalogSelectOption[]>(() => EQUIPMENT_TYPES.map((t) => ({ id: t, label: EQUIPMENT_TYPE_LABELS_PT[t] })), []);

  if (!isOpen) return null;

  const selectedEqOption = equipmentOptions.find((o) => o.id === equipmentId) ?? equipmentOptions[0];
  const isBoom2D = equipmentType === '2D_HORIZONTAL';
  const isTunnel3d = equipmentType === '3D_TUNNEL';
  const isPneumatic3d = equipmentType === '3D_PNEUMATIC';
  const isCannon3d = equipmentType === '3D_CANNON';
  const isDroneUav = equipmentType === 'UAV_DRONE';
  const isManualLance = equipmentType === 'MANUAL_LANCE';
  const is3dFan = equipmentType === '3D_AXIAL' || equipmentType === '3D_TANGENTIAL' || equipmentType === '3D_CROSSFLOW' || isTunnel3d;
  const supportsAir = equipmentType === '3D_AXIAL' || equipmentType === '3D_CROSSFLOW' || isTunnel3d;

  const syncSectorsCount = (nextSectors: number) => {
    const clamped = Math.max(1, Math.min(isBoom2D ? 12 : 24, nextSectors));
    setPrimaryCount(clamped);
    if (isBoom2D) {
      setSectorCounts((prev) =>
        Array.from({ length: clamped }, (_, i) => prev[i] ?? prev[prev.length - 1] ?? 5)
      );
    }
  };

  const handleConfirm = () => {
    const isTypeChanged = equipmentType !== profile.equipmentType;
    const currCount = inferPrimaryCount(profile.equipmentType, profile.slots, profile.boomSectors);
    const currSec = inferSecondaryCount(profile.equipmentType, profile.slots, profile.pneumaticNozzlesPerArm);
    const selectedEq = equipments.find((e) => e.id === equipmentId);
    const oriChanged = isTunnel3d && tunnelOrientation !== (profile.tunnelOrientation ?? 'BOTH');
    const secChanged = (isPneumatic3d || isCannon3d) && secondaryCount !== currSec;
    const rotorChanged = isDroneUav && rotorCount !== inferDroneRotorCount(profile.slots);
    const baseSlots = isBoom2D
      ? resizeBoomSlotsBySectorCounts(pressure, isTypeChanged ? [] : profile.slots, sectorCounts)
      : (isTypeChanged || primaryCount !== currCount || secChanged || oriChanged || rotorChanged)
        ? resizeProfileSlots(equipmentType, pressure, isTypeChanged ? [] : profile.slots, primaryCount, {
            secondaryCount: isPneumatic3d || isCannon3d ? secondaryCount : undefined,
            threeDSectors: is3dFan ? threeDSectors : undefined,
            tunnelOrientation: isTunnel3d ? tunnelOrientation : undefined,
            rotorCount: isDroneUav ? rotorCount : undefined
          })
        : profile.slots;

    onSave(buildUpdatedMetadataProfile(profile, {
      name, equipmentType, equipmentId, equipmentName: selectedEq?.name, pressure, airAssisted: supportsAir ? airAssisted : undefined, boomSectors: isBoom2D ? primaryCount : undefined, threeDSectors: is3dFan ? threeDSectors : undefined, tunnelOrientation: isTunnel3d ? tunnelOrientation : undefined, pneumaticArms: isPneumatic3d ? primaryCount : undefined, pneumaticNozzlesPerArm: isPneumatic3d ? secondaryCount : undefined, cannonDeflectorCount: isCannon3d ? secondaryCount : undefined, uavMode: isDroneUav ? uavMode : undefined, slots: baseSlots
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="w-full h-full fixed inset-0 md:static md:w-full md:max-w-md bg-[#F8FAF9] md:bg-white md:rounded-l-3xl shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div><span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">Configuração Estrutural</span><h3 className="text-base font-black text-slate-900 leading-tight">Editar Configuração</h3></div>
          <button type="button" onClick={onClose} className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#114037] mb-1.5">Nome da Configuração</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full min-h-[44px] px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#114037]" />
          </div>
          <SearchableRoundedDropdown label="Equipamento Associado (Opcional)" value={selectedEqOption.label} selectedId={equipmentId} options={equipmentOptions} onSelectOption={(opt) => { setEquipmentId(opt.id); const found = equipments.find((e) => e.id === opt.id); if (found) setEquipmentType(found.type); }} onClear={equipmentId ? () => setEquipmentId('') : undefined} />
          <SearchableRoundedDropdown label="Tipologia de Pulverização" required value={EQUIPMENT_TYPE_LABELS_PT[equipmentType]} selectedId={equipmentType} options={typologyOptions} disabled={Boolean(equipmentId)} disabledHint="Tipologia sincronizada com o equipamento associado" onSelectOption={(opt) => { const next = opt.id as EquipmentType; setEquipmentType(next); if (next === '3D_CANNON' && profile.equipmentType !== '3D_CANNON') { setPrimaryCount(6); setSecondaryCount(2); } if (next === 'MANUAL_LANCE' && profile.equipmentType !== 'MANUAL_LANCE') setPrimaryCount(6); }} />
          <NozzleMetadataGeometryFields
            pressure={pressure} primaryCount={primaryCount} sectorCounts={sectorCounts} threeDSectors={threeDSectors} airAssisted={airAssisted}
            isBoom2D={isBoom2D} is3dFan={is3dFan} isTunnel3d={isTunnel3d} isPneumatic3d={isPneumatic3d} isCannon3d={isCannon3d} isDroneUav={isDroneUav} isManualLance={isManualLance}
            rotorCount={rotorCount} uavMode={uavMode} secondaryCount={secondaryCount} tunnelOrientation={tunnelOrientation} supportsAir={supportsAir}
            onOpenPressureKeypad={() => setKeypadTarget({ kind: 'pressure' })} onOpenCountKeypad={() => setKeypadTarget({ kind: 'primaryCount' })} onOpenSecondaryKeypad={() => setKeypadTarget({ kind: 'secondaryCount' })} onOpenSectorKeypad={(sectorIdx) => setKeypadTarget({ kind: 'sectorCount', sectorIdx })}
            onStepCount={(delta) => syncSectorsCount(isDroneUav ? Math.max(2, Math.min(12, primaryCount + delta)) : primaryCount + delta)} onStepSecondaryCount={(delta) => setSecondaryCount((prev) => Math.max(isCannon3d ? 0 : 1, Math.min(6, prev + delta)))}
            onStepSectorCount={(idx, delta) => setSectorCounts((prev) => prev.map((c, i) => (i === idx ? Math.max(1, Math.min(30, c + delta)) : c)))}
            onChangeArms={(arms) => setPrimaryCount(arms)} onChangeThreeDSectors={setThreeDSectors} onChangeTunnelOrientation={setTunnelOrientation} onChangeRotorCount={setRotorCount} onChangeUavMode={setUavMode} onChangeAirAssisted={setAirAssisted}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer">Cancelar</button>
          <button type="button" onClick={handleConfirm} className="min-h-[44px] px-5 rounded-xl bg-[#114037] hover:bg-[#1D734B] text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#3CA64C]" /> Gravar Alterações
          </button>
        </div>
      </div>

      <DaterraKeypadModal
        isOpen={keypadTarget !== null}
        onClose={() => setKeypadTarget(null)}
        label={keypadTarget?.kind === 'pressure' ? 'Pressão de Trabalho' : keypadTarget?.kind === 'secondaryCount' ? (isCannon3d ? 'Defletor Inferior (N.º de Bicos)' : 'Bicos por Braço / Extensão') : keypadTarget?.kind === 'sectorCount' ? `Bicos no Setor S${keypadTarget.sectorIdx + 1}` : isBoom2D ? 'N.º de Setores da Barra' : isCannon3d ? 'Boca Principal (N.º de Bicos)' : isManualLance ? 'N.º de Pistolas / Lanças' : is3dFan ? 'N.º de Níveis' : 'N.º de Bicos'}
        initialValue={String(keypadTarget?.kind === 'pressure' ? pressure : keypadTarget?.kind === 'secondaryCount' ? secondaryCount : keypadTarget?.kind === 'sectorCount' ? (sectorCounts[keypadTarget.sectorIdx] ?? 5) : primaryCount)}
        initialUnit={keypadTarget?.kind === 'pressure' ? 'bar' : keypadTarget?.kind === 'secondaryCount' || keypadTarget?.kind === 'sectorCount' ? 'bicos' : 'un.'}
        commonValues={keypadTarget?.kind === 'pressure' ? [2, 3, 5, 8, 10, 15] : keypadTarget?.kind === 'secondaryCount' ? (isCannon3d ? [0, 1, 2, 3, 4, 6] : [1, 2, 3, 4, 5, 6]) : keypadTarget?.kind === 'sectorCount' ? [4, 5, 6, 8, 10, 12] : [2, 3, 4, 5, 6, 8]}
        onConfirm={(val) => {
          if (keypadTarget?.kind === 'pressure' && val > 0) setPressure(val);
          else if (keypadTarget?.kind === 'secondaryCount' && val >= (isCannon3d ? 0 : 1)) setSecondaryCount(Math.max(isCannon3d ? 0 : 1, Math.min(6, Math.round(val))));
          else if (keypadTarget?.kind === 'sectorCount' && val >= 1) {
            setSectorCounts((prev) => prev.map((c, i) => (i === keypadTarget.sectorIdx ? Math.max(1, Math.min(30, Math.round(val))) : c)));
          } else if (keypadTarget?.kind === 'primaryCount' && val >= 1) syncSectorsCount(Math.round(val));
          setKeypadTarget(null);
        }}
      />
    </div>
  );
};
