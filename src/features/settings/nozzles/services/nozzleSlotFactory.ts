// src/features/settings/nozzles/services/nozzleSlotFactory.ts
import type { EquipmentType } from '../../../../schemas/equipment.schema.ts';
import type { NozzleSlotConfig, SlotSectionSide, TunnelOrientation } from '../../../../schemas/nozzle-profile.schema.ts';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import { getTunnelActiveSides, getTunnelSideFullLabel } from './nozzleTunnelHelpers.ts';
import { formatPneumaticSlotHeading } from './nozzlePneumaticHelpers.ts';
import { formatCannonSlotHeading } from './nozzleCannonHelpers.ts';
import { formatDroneSlotHeading } from './nozzleDroneHelpers.ts';
import { formatManualSlotHeading } from './nozzleManualHelpers.ts';
export interface SlotGenerationOptions {
  count?: number; secondaryCount?: number; totalNozzles?: number; threeDSectors?: 2 | 4 | 6; tunnelOrientation?: TunnelOrientation; rotorCount?: number;
  existingSlots?: NozzleSlotConfig[]; emptyByDefault?: boolean; fallbackNozzle: Nozzle; calcFlow: (nominal: number, pressureBar: number, refPressureBar?: number) => number;
}

export interface TypologyCountMeta {
  label: string;
  unit: string;
  min: number;
  max: number;
  defaultVal: number;
  stepValues?: number[];
  secondary?: { label: string; unit: string; min: number; max: number; defaultVal: number };
}

export function getTypologyCountMeta(type: EquipmentType): TypologyCountMeta {
  switch (type) {
    case '2D_HORIZONTAL':
      return {
        label: 'Nº de Setores', unit: 'set.', min: 1, max: 12, defaultVal: 3,
        secondary: { label: 'Bicos / Setor', unit: 'bicos', min: 1, max: 12, defaultVal: 5 }
      };
    case '3D_AXIAL':
    case '3D_TANGENTIAL':
    case '3D_CROSSFLOW':
    case '3D_TUNNEL':
      return { label: 'Níveis / Rampa', unit: 'níveis', min: 1, max: 12, defaultVal: 6 };
    case '3D_PNEUMATIC':
      return {
        label: 'Braços Pneumáticos', unit: 'braços', min: 2, max: 8, defaultVal: 4, stepValues: [2, 4, 6, 8],
        secondary: { label: 'Bicos / Braço', unit: 'bicos', min: 1, max: 6, defaultVal: 2 }
      };
    case '3D_CANNON':
      return {
        label: 'Boca Principal', unit: 'bicos', min: 1, max: 12, defaultVal: 4,
        secondary: { label: 'Defletor Inf.', unit: 'bicos', min: 0, max: 6, defaultVal: 2 }
      };
    case 'UAV_DRONE':
      return { label: 'Pontos Emissão', unit: 'pontos', min: 2, max: 12, defaultVal: 4 };
    case 'MANUAL_LANCE':
      return { label: 'Pistolas / Lanças', unit: 'un.', min: 1, max: 12, defaultVal: 2 };
  }
}

export function inferPrimaryCount(type: EquipmentType, slots: NozzleSlotConfig[], fallback?: number): number {
  const meta = getTypologyCountMeta(type);
  if (fallback && fallback >= meta.min && fallback <= meta.max) return fallback;
  if (!slots.length) return meta.defaultVal;
  if (type === '2D_HORIZONTAL') return Math.max(0, ...slots.map((s) => s.sectorIndex ?? 0)) || meta.defaultVal;
  if (type === 'UAV_DRONE' || type === 'MANUAL_LANCE') return slots.length;
  if (type === '3D_CANNON') return slots.filter((s) => s.sectionSide === 'CANNON_MAIN').length || meta.defaultVal;
  if (type === '3D_PNEUMATIC') return (Math.max(0, ...slots.map((s) => s.armIndex ?? 0)) * 2) || meta.defaultVal;
  return slots.filter((s) => s.sectionSide === 'LEFT' || s.sectionSide === 'LEFT_OUTER').length || meta.defaultVal;
}

export function inferSecondaryCount(type: EquipmentType, slots: NozzleSlotConfig[], fallback?: number): number {
  const sec = getTypologyCountMeta(type).secondary;
  if (!sec) return 0;
  if (fallback !== undefined && fallback >= sec.min && fallback <= sec.max) return fallback;
  if (!slots.length) return sec.defaultVal;
  if (type === '2D_HORIZONTAL') return Math.max(sec.min, Math.min(sec.max, slots.filter((s) => (s.sectorIndex ?? 1) === 1).length || sec.defaultVal));
  if (type === '3D_PNEUMATIC') return Math.max(sec.min, Math.min(sec.max, slots.filter((s) => s.sectionSide === 'LEFT' && (s.armIndex ?? 1) === 1).length || sec.defaultVal));
  if (type === '3D_CANNON') return slots.filter((s) => s.sectionSide === 'CANNON_DEFLECTOR').length;
  return sec.defaultVal;
}

function makeSlot(
  idx: number, label: string, side: SlotSectionSide, level: number, pressureBar: number,
  opts: SlotGenerationOptions, extra?: { sectorIndex?: number; armIndex?: number; orientation?: TunnelOrientation }
): NozzleSlotConfig {
  const prev =
    opts.existingSlots?.find(
      (s) => s.sectionSide === side && s.levelIndex === level &&
        (extra?.armIndex === undefined || s.armIndex === extra.armIndex) &&
        (extra?.sectorIndex === undefined || s.sectorIndex === undefined || s.sectorIndex === extra.sectorIndex)
    ) ?? opts.existingSlots?.[idx];
  if (prev) {
    const refP = prev.referencePressureBar ?? 3;
    const configured = Boolean(prev.brand && prev.model);
    return {
      ...prev, slotIndex: idx, slotLabel: label, sectionSide: side, levelIndex: level,
      sectorIndex: extra?.sectorIndex ?? prev.sectorIndex, armIndex: extra?.armIndex ?? prev.armIndex,
      orientation: extra?.orientation ?? prev.orientation,
      flowAtPressureLMin: configured ? opts.calcFlow(prev.nominalFlowLMin, pressureBar, refP) : 0
    };
  }
  const ref = opts.existingSlots?.find((s) => s.isActive && Boolean(s.brand && s.model));
  if (!ref && (opts.emptyByDefault || (opts.existingSlots && opts.existingSlots.length > 0))) {
    return {
      slotIndex: idx, slotLabel: label, sectionSide: side, levelIndex: level,
      sectorIndex: extra?.sectorIndex, armIndex: extra?.armIndex, orientation: extra?.orientation,
      isActive: true, nozzleId: '', brand: '', model: '', color: '',
      referencePressureBar: 3, nominalFlowLMin: 0, flowAtPressureLMin: 0
    };
  }
  const nominal = ref?.nominalFlowLMin ?? (opts.fallbackNozzle.nominalFlowLMin || 0.76);
  const refP = ref?.referencePressureBar ?? opts.fallbackNozzle.referencePressureBar ?? 3;
  return {
    slotIndex: idx, slotLabel: label, sectionSide: side, levelIndex: level,
    sectorIndex: extra?.sectorIndex, armIndex: extra?.armIndex, orientation: extra?.orientation,
    isActive: true, nozzleId: ref?.nozzleId ?? opts.fallbackNozzle.id,
    brand: ref?.brand ?? opts.fallbackNozzle.brand, model: ref?.model ?? opts.fallbackNozzle.model,
    color: ref?.color ?? (opts.fallbackNozzle.color || 'Amarelo'), isoCode: ref?.isoCode ?? opts.fallbackNozzle.isoCode,
    sprayAngleDeg: ref?.sprayAngleDeg ?? (opts.fallbackNozzle.sprayAngleDeg ? Number(opts.fallbackNozzle.sprayAngleDeg) : undefined),
    referencePressureBar: refP, nominalFlowLMin: nominal, swirlPlate: ref?.swirlPlate ?? opts.fallbackNozzle.swirlPlate,
    disc: ref?.disc ?? opts.fallbackNozzle.disc, flowAtPressureLMin: opts.calcFlow(nominal, pressureBar, refP)
  };
}

export function formatSlotPositionHeading(slot: NozzleSlotConfig | undefined, equipmentType: EquipmentType, totalSlots = 6): string {
  if (!slot) return 'Ponto de Pulverização';
  if (equipmentType === '2D_HORIZONTAL') return `Boca Principal | #${slot.slotIndex + 1}`;
  if (equipmentType === '3D_CANNON') return formatCannonSlotHeading(slot);
  if (equipmentType === 'MANUAL_LANCE') return formatManualSlotHeading(slot);
  if (equipmentType === 'UAV_DRONE') return formatDroneSlotHeading(slot, totalSlots);
  const lvl = `N${slot.levelIndex ?? slot.slotIndex + 1}`;
  if (equipmentType === '3D_TUNNEL') return `${getTunnelSideFullLabel(slot.sectionSide)} | ${lvl}`;
  if (equipmentType === '3D_PNEUMATIC') return formatPneumaticSlotHeading(slot);
  return slot.sectionSide?.includes('LEFT') ? `Esquerda | ${lvl}` : slot.sectionSide?.includes('RIGHT') ? `Direita | ${lvl}` : `Ponto | ${lvl}`;
}

export function distributeNozzlesAcrossSectors(totalNozzles: number, sectors: number): number[] {
  const safeSectors = Math.max(1, Math.min(12, Math.round(sectors)));
  const safeTotal = Math.max(safeSectors, Math.min(120, Math.round(totalNozzles)));
  const base = Math.floor(safeTotal / safeSectors);
  let rem = safeTotal % safeSectors;
  const counts = Array.from({ length: safeSectors }, () => base);
  for (let l = 0, r = safeSectors - 1; rem >= 2 && l < r; l++, r--, rem -= 2) { counts[l] += 1; counts[r] += 1; }
  if (rem === 1) counts[Math.floor(safeSectors / 2)] += 1;
  return counts;
}

export function buildSlotsForTypology(
  type: EquipmentType, pressureBar: number, opts: SlotGenerationOptions
): NozzleSlotConfig[] {
  const meta = getTypologyCountMeta(type);
  const n = Math.max(meta.min, Math.min(meta.max, Math.round(opts.count ?? meta.defaultVal)));
  const secMeta = meta.secondary;
  const m = secMeta ? Math.max(secMeta.min, Math.min(secMeta.max, Math.round(opts.secondaryCount ?? secMeta.defaultVal))) : 0;
  const slots: NozzleSlotConfig[] = [];
  let idx = 0;

  if (type === '2D_HORIZONTAL') {
    const perSectorCounts = opts.totalNozzles !== undefined
      ? distributeNozzlesAcrossSectors(opts.totalNozzles, n)
      : Array.from({ length: n }, () => m);
    for (let s = 1; s <= n; s++) {
      const countInSec = perSectorCounts[s - 1];
      for (let b = 1; b <= countInSec; b++) {
        slots.push(makeSlot(idx++, `Setor ${s} · #${idx}`, 'BOOM', b, pressureBar, opts, { sectorIndex: s }));
      }
    }
  } else if (type === '3D_AXIAL' || type === '3D_TANGENTIAL' || type === '3D_CROSSFLOW') {
    const sectorsPerSide = (opts.threeDSectors ?? 2) / 2;
    const calcSec = (lvl: number) => Math.min(sectorsPerSide, Math.ceil((lvl * sectorsPerSide) / n));
    for (let l = 1; l <= n; l++) slots.push(makeSlot(idx++, `Esq. N${l}`, 'LEFT', l, pressureBar, opts, { sectorIndex: calcSec(l) }));
    for (let l = 1; l <= n; l++) slots.push(makeSlot(idx++, `Dir. N${l}`, 'RIGHT', l, pressureBar, opts, { sectorIndex: calcSec(l) }));
  } else if (type === '3D_TUNNEL') {
    const orient = opts.tunnelOrientation ?? 'BOTH';
    const activeSides = new Set(getTunnelActiveSides(orient));
    const sectorsPerSide = (opts.threeDSectors ?? 2) / 2;
    const calcSec = (lvl: number) => Math.min(sectorsPerSide, Math.ceil((lvl * sectorsPerSide) / n));
    const ramps: Array<[SlotSectionSide, string]> = [['LEFT_OUTER', 'Esq. Ext.'], ['LEFT_INNER', 'Esq. Int.'], ['RIGHT_INNER', 'Dir. Int.'], ['RIGHT_OUTER', 'Dir. Ext.']];
    for (const [side, lbl] of ramps) {
      if (!activeSides.has(side)) continue;
      for (let l = 1; l <= n; l++) slots.push(makeSlot(idx++, `${lbl} N${l}`, side, l, pressureBar, opts, { sectorIndex: calcSec(l), orientation: orient }));
    }
  } else if (type === '3D_PNEUMATIC') {
    const perSide = [2, 4, 6, 8].reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a)) / 2;
    for (let a = 1; a <= perSide; a++) {
      for (let b = 1; b <= m; b++) slots.push(makeSlot(idx++, `Braço Esq. ${a} · #${b}`, 'LEFT', b, pressureBar, opts, { armIndex: a }));
    }
    for (let a = 1; a <= perSide; a++) {
      for (let b = 1; b <= m; b++) slots.push(makeSlot(idx++, `Braço Dir. ${a} · #${b}`, 'RIGHT', b, pressureBar, opts, { armIndex: a }));
    }
  } else if (type === '3D_CANNON') {
    for (let i = 1; i <= n; i++) slots.push(makeSlot(idx++, `Boca Principal #${i}`, 'CANNON_MAIN', i, pressureBar, opts));
    for (let j = 1; j <= m; j++) slots.push(makeSlot(idx++, `Defletor Inf. #${j}`, 'CANNON_DEFLECTOR', j, pressureBar, opts));
  } else if (type === 'UAV_DRONE') {
    for (let i = 1; i <= n; i++) slots.push(makeSlot(idx++, `Ponto #${i}`, 'ROTOR', i, pressureBar, opts, { armIndex: opts.rotorCount ?? 6 }));
  } else {
    for (let i = 1; i <= n; i++) slots.push(makeSlot(idx++, `Lança #${i}`, 'LANCE', i, pressureBar, opts));
  }
  return slots;
}
