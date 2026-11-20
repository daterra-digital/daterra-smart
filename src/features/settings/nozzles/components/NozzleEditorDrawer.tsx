// src/features/settings/nozzles/components/NozzleEditorDrawer.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Copy, ArrowLeftRight } from 'lucide-react';
import { getGroupedModelsForBrand, getVariantsForModel, NOZZLES_BY_ID } from '../../../nozzle-comparison/nozzleComparison.data.ts';
import { sortNozzlesByNominalFlow } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import type { NozzleSlotConfig } from '../../../../schemas/nozzle-profile.schema.ts';
import { calculateNozzleFlow } from '../services/nozzleProfileMath.ts';
import { isLevelSymmetric } from '../services/nozzleProfileActions.ts';
import { isBoomSectorUniform } from '../services/nozzleBoom2dHelpers.ts';
import { getPneumaticArmLabel } from '../services/nozzlePneumaticHelpers.ts';
import { getDroneMirrorSlotIndex, isDroneSlotLeft } from '../services/nozzleDroneHelpers.ts';
import { NozzleEditorDrawerCascade } from './NozzleEditorDrawerCascade.tsx';

interface NozzleEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  slotLabel: string;
  currentNozzleId: string;
  referencePressureBar?: number;
  isBilateral?: boolean;
  isBoom2D?: boolean;
  slot?: NozzleSlotConfig;
  allSlots?: NozzleSlotConfig[];
  onSaveNozzle: (nozzle: Nozzle, scope?: 'slot' | 'sector' | 'side' | 'level' | 'arm' | 'group' | 'all') => void;
}

export const NozzleEditorDrawer: React.FC<NozzleEditorDrawerProps> = ({
  isOpen, onClose, slotLabel, currentNozzleId, referencePressureBar = 3, isBilateral = false, isBoom2D = false, slot, allSlots = [], onSaveNozzle
}) => {
  const currentNozzle = useMemo(() => NOZZLES_BY_ID.get(currentNozzleId), [currentNozzleId]);

  const [brand, setBrand] = useState<string>(currentNozzle?.brand || '');
  const [model, setModel] = useState<string>(currentNozzle?.model || '');
  const [sprayAngle, setSprayAngle] = useState<number>(currentNozzle?.sprayAngleDeg ? Number(currentNozzle.sprayAngleDeg) : 0);
  const [swirlPlate, setSwirlPlate] = useState<string>(currentNozzle?.swirlPlate || '');
  const [disc, setDisc] = useState<string>(currentNozzle?.disc || '');
  const [selectedId, setSelectedId] = useState<string>(currentNozzleId);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState<boolean>(false);
  const [symmetryEnabled, setSymmetryEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    setBrand(currentNozzle?.brand || '');
    setModel(currentNozzle?.model || '');
    setSprayAngle(currentNozzle?.sprayAngleDeg ? Number(currentNozzle.sprayAngleDeg) : 0);
    setSwirlPlate(currentNozzle?.swirlPlate || '');
    setDisc(currentNozzle?.disc || '');
    setSelectedId(currentNozzle?.id || '');
    setIsColorDropdownOpen(false);
    setSymmetryEnabled(isBoom2D ? isBoomSectorUniform(allSlots, slot?.sectorIndex ?? 1) : isBilateral ? isLevelSymmetric(allSlots, slot) : false);
  }, [isOpen, currentNozzle, isBoom2D, isBilateral, allSlots, slot]);

  const syncFromVariants = (list: Nozzle[]) => {
    const sorted = [...list].sort(sortNozzlesByNominalFlow);
    if (sorted.length > 0) {
      setSelectedId(sorted[0].id);
      setSwirlPlate(sorted[0].swirlPlate || '');
      setDisc(sorted[0].disc || '');
      if (sorted[0].sprayAngleDeg) setSprayAngle(Number(sorted[0].sprayAngleDeg));
    }
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const firstModel = getGroupedModelsForBrand(newBrand)[0]?.models[0]?.model || '';
    setModel(firstModel);
    syncFromVariants(getVariantsForModel(newBrand, firstModel));
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    syncFromVariants(getVariantsForModel(brand, newModel));
  };

  const handleAngleChange = (angle: number) => {
    setSprayAngle(angle);
    const vars = getVariantsForModel(brand, model);
    const match = vars.find((v) => Number(v.sprayAngleDeg) === angle && v.color === currentNozzle?.color) || vars.find((v) => Number(v.sprayAngleDeg) === angle);
    if (match) setSelectedId(match.id);
  };

  const handleSwirlChange = (newSwirl: string) => {
    setSwirlPlate(newSwirl);
    const vars = getVariantsForModel(brand, model);
    const match = vars.find((v) => v.swirlPlate === newSwirl && (!disc || v.disc === disc)) || vars.find((v) => v.swirlPlate === newSwirl);
    if (match) { setSelectedId(match.id); if (match.disc) setDisc(match.disc); }
  };

  const handleDiscChange = (newDisc: string) => {
    setDisc(newDisc);
    const vars = getVariantsForModel(brand, model);
    const match = vars.find((v) => v.disc === newDisc && (!swirlPlate || v.swirlPlate === swirlPlate)) || vars.find((v) => v.disc === newDisc);
    if (match) { setSelectedId(match.id); if (match.swirlPlate) setSwirlPlate(match.swirlPlate); }
  };

  const handleApplyScope = (scope: 'slot' | 'sector' | 'side' | 'level' | 'arm' | 'group' | 'all') => {
    const selected = NOZZLES_BY_ID.get(selectedId);
    if (selected) onSaveNozzle(selected, scope);
    onClose();
  };

  if (!isOpen) return null;
  const selectedNozzleObj = NOZZLES_BY_ID.get(selectedId);
  const calcFlow = selectedNozzleObj ? calculateNozzleFlow(selectedNozzleObj.nominalFlowLMin || 0.76, referencePressureBar, selectedNozzleObj.referencePressureBar || 3) : 0;
  const pressureStr = referencePressureBar.toFixed(1).replace('.', ',');
  const sec = slot?.sectorIndex ?? 1;
  const isPneumatic3d = slot?.armIndex !== undefined && slot?.sectionSide !== 'ROTOR';
  const isDroneUav = slot?.sectionSide === 'ROTOR';
  const droneIsLeft = isDroneUav && isDroneSlotLeft(slot!.slotIndex, allSlots.length);
  const droneSideCnt = isDroneUav ? (droneIsLeft ? Math.ceil(allSlots.length / 2) : allSlots.length - Math.ceil(allSlots.length / 2)) : 0;
  const droneMirrorIdx = isDroneUav ? getDroneMirrorSlotIndex(slot!.slotIndex, allSlots.length) + 1 : 0;
  const isCannon3d = slot?.sectionSide === 'CANNON_MAIN' || slot?.sectionSide === 'CANNON_DEFLECTOR';
  const isManualLance = slot?.sectionSide === 'LANCE';
  const cannonGroupCount = isCannon3d ? allSlots.filter((s) => s.sectionSide === slot?.sectionSide).length : 0;
  const cannonGroupLbl = slot?.sectionSide === 'CANNON_DEFLECTOR' ? 'todo o Defletor Inferior' : 'toda a Boca Principal';
  const armCount = isPneumatic3d ? allSlots.filter((s) => s.sectionSide === slot?.sectionSide && s.armIndex === slot?.armIndex).length : 0;
  const armLbl = isPneumatic3d ? getPneumaticArmLabel(slot?.sectionSide, slot?.armIndex ?? 1) : '';
  const secCount = allSlots.filter((s) => (s.sectorIndex ?? 1) === sec).length;
  const applyScope = isBoom2D ? (symmetryEnabled ? 'sector' : 'slot') : (isBilateral && symmetryEnabled ? 'level' : 'slot');

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="w-full md:w-[420px] bg-white h-[90vh] md:h-full shadow-2xl flex flex-col overflow-hidden animate-fade-in md:border-l border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">Configurar Ponto</span>
            <h3 className="text-base font-black text-slate-900 leading-tight">{slotLabel}</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 tabular-nums">Pressão de trabalho: {pressureStr} bar</p>
          </div>
          <button type="button" onClick={onClose} className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          <NozzleEditorDrawerCascade
            brand={brand} model={model} sprayAngle={sprayAngle} swirlPlate={swirlPlate} disc={disc} selectedId={selectedId} isColorDropdownOpen={isColorDropdownOpen} selectedNozzleObj={selectedNozzleObj}
            onBrandChange={handleBrandChange} onModelChange={handleModelChange} onAngleChange={handleAngleChange} onSwirlChange={handleSwirlChange} onDiscChange={handleDiscChange}
            onSelectId={(id) => { setSelectedId(id); setIsColorDropdownOpen(false); }} onToggleColorDropdown={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
          />

          <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600">Débito tabelado a {pressureStr} bar</span>
              <span className="text-sm font-black text-[#114037] tabular-nums">{selectedNozzleObj ? `${calcFlow.toFixed(2).replace('.', ',')} L/min` : '—'}</span>
            </div>

            {(isBilateral || isBoom2D) && (
              <button type="button" role="switch" aria-checked={symmetryEnabled} onClick={() => setSymmetryEnabled((prev) => !prev)} className={`w-full min-h-[40px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${symmetryEnabled ? 'bg-emerald-50 border-emerald-300 text-[#114037]' : 'bg-white border-slate-200 text-slate-700'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <ArrowLeftRight className={`w-3.5 h-3.5 shrink-0 ${symmetryEnabled ? 'text-[#3CA64C]' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-bold truncate">
                    {isBoom2D ? `Aplicar a todo o Setor S${sec} (${secCount} bicos)` : isPneumatic3d ? (symmetryEnabled ? `Simetria entre lados (Braço Esq. ${slot?.armIndex ?? 1} ↔ Braço Dir. ${slot?.armIndex ?? 1})` : 'Lado assimétrico — apenas este ponto') : isDroneUav ? (symmetryEnabled ? `Simetria transversal (B${(slot?.slotIndex ?? 0) + 1} Esq. ↔ B${droneMirrorIdx} Dir.)` : 'Ponto assimétrico — apenas este bico') : (symmetryEnabled ? 'Simetria neste nível (Esquerda ↔ Direita)' : 'Nível assimétrico — apenas este lado')}
                  </span>
                </div>
                <span className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${symmetryEnabled ? 'bg-[#3CA64C] justify-end' : 'bg-slate-300 justify-start'}`}><span className="w-4 h-4 rounded-full bg-white shadow-2xs" /></span>
              </button>
            )}

            {isPneumatic3d && (
              <button type="button" disabled={!selectedNozzleObj} onClick={() => handleApplyScope('arm')} className="w-full min-h-[40px] px-3 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Copy className="w-3.5 h-3.5 text-[#3CA64C]" /><span>Aplicar a todo o {armLbl} ({armCount} bicos)</span>
              </button>
            )}
            {isCannon3d && (
              <button type="button" disabled={!selectedNozzleObj} onClick={() => handleApplyScope('group')} className="w-full min-h-[40px] px-3 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Copy className="w-3.5 h-3.5 text-[#3CA64C]" /><span>Aplicar a {cannonGroupLbl} ({cannonGroupCount} bicos)</span>
              </button>
            )}
            {isDroneUav && (
              <button type="button" disabled={!selectedNozzleObj} onClick={() => handleApplyScope('side')} className="w-full min-h-[40px] px-3 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Copy className="w-3.5 h-3.5 text-[#3CA64C]" /><span>Aplicar a todo o lado {droneIsLeft ? 'Esquerdo' : 'Direito'} ({droneSideCnt} bicos)</span>
              </button>
            )}
            <button type="button" disabled={!selectedNozzleObj} onClick={() => handleApplyScope('all')} className="w-full min-h-[40px] px-3 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <Copy className="w-3.5 h-3.5 text-[#3CA64C]" /><span>{isBoom2D ? `Aplicar este bico a toda a barra (${allSlots.length} bicos)` : isPneumatic3d ? `Aplicar este bico a todos os braços (${allSlots.length} bicos)` : isCannon3d ? `Aplicar este bico a todo o Canhão (${allSlots.length} bicos)` : isDroneUav ? `Aplicar este bico a todo o Drone (${allSlots.length} bicos)` : isManualLance ? `Aplicar este bico a todas as pistolas/lanças (${allSlots.length} bicos)` : 'Aplicar este bico a todos os níveis'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 min-h-[44px] rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer">Cancelar</button>
          <button type="button" disabled={!selectedNozzleObj} onClick={() => handleApplyScope(applyScope)} className="flex-1 min-h-[44px] rounded-xl bg-[#3CA64C] hover:bg-[#328A3F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Aplicar Bico
          </button>
        </div>
      </div>
    </div>
  );
};
