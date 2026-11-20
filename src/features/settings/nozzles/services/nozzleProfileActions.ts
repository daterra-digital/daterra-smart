// src/features/settings/nozzles/services/nozzleProfileActions.ts
import type {
  NozzleProfile,
  NozzleSlotConfig,
  SlotSectionSide,
  TunnelOrientation,
  UavNozzleMode
} from '../../../../schemas/nozzle-profile.schema.ts';
import type { EquipmentType } from '../../../../schemas/equipment.schema.ts';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import { calculateNozzleFlow, generateDefaultSlots, recalculateSlotsFlow } from './nozzleProfileMath.ts';
import { getDroneMirrorSlotIndex, isDroneSlotLeft, isDroneSymmetricAtSlot, mirrorDroneSlotsLeftToRight } from './nozzleDroneHelpers.ts';

const OPPOSITE_SIDE_MAP: Readonly<Partial<Record<SlotSectionSide, SlotSectionSide>>> = {
  LEFT: 'RIGHT', RIGHT: 'LEFT', LEFT_OUTER: 'RIGHT_OUTER', RIGHT_OUTER: 'LEFT_OUTER',
  LEFT_INNER: 'RIGHT_INNER', RIGHT_INNER: 'LEFT_INNER', LOWER_LEFT: 'LOWER_RIGHT',
  LOWER_RIGHT: 'LOWER_LEFT', UPPER_LEFT: 'UPPER_RIGHT', UPPER_RIGHT: 'UPPER_LEFT'
};

function isOppositeLevelSlot(candidate: NozzleSlotConfig, target: NozzleSlotConfig): boolean {
  const oppSide = target.sectionSide ? OPPOSITE_SIDE_MAP[target.sectionSide] : undefined;
  return Boolean(
    oppSide &&
      candidate.sectionSide === oppSide &&
      candidate.levelIndex === target.levelIndex &&
      (target.armIndex === undefined || candidate.armIndex === target.armIndex)
  );
}

export function isLevelSymmetric(slots: NozzleSlotConfig[], targetSlot?: NozzleSlotConfig): boolean {
  if (!targetSlot?.sectionSide) return true;
  if (targetSlot.sectionSide === 'ROTOR') return isDroneSymmetricAtSlot(slots, targetSlot);
  const opp = slots.find((s) => isOppositeLevelSlot(s, targetSlot));
  return !opp || (opp.nozzleId === targetSlot.nozzleId && opp.isActive === targetSlot.isActive);
}

export function finalizeProfile(updated: NozzleProfile): NozzleProfile {
  const rec = recalculateSlotsFlow(updated.slots, updated.referencePressureBar);
  return {
    ...updated,
    slots: rec.slots,
    totalActiveFlowLMin: rec.totalFlow,
    activeSlotsCount: rec.activeCount,
    totalSlotsCount: rec.slots.length,
    updatedAt: new Date().toISOString()
  };
}

export function buildNewProfile(
  userId: string,
  name: string,
  equipmentType: EquipmentType,
  pressureBar: number,
  options?: { emptyByDefault?: boolean }
): NozzleProfile {
  const slots = generateDefaultSlots(equipmentType, pressureBar, ['3D_PNEUMATIC', '3D_CANNON', 'UAV_DRONE', 'MANUAL_LANCE'].includes(equipmentType) ? 6 : undefined, { emptyByDefault: options?.emptyByDefault });
  return finalizeProfile({
    id: crypto.randomUUID(),
    userId: userId.trim(),
    name,
    equipmentType,
    airAssisted: equipmentType === '2D_HORIZONTAL' ? false : ['3D_AXIAL', '3D_CROSSFLOW', '3D_TUNNEL'].includes(equipmentType) ? true : undefined,
    boomDirection: equipmentType === '2D_HORIZONTAL' ? 'LEFT_TO_RIGHT' : undefined,
    boomSectors: equipmentType === '2D_HORIZONTAL' ? 3 : undefined,
    boomNozzlesPerSector: equipmentType === '2D_HORIZONTAL' ? 5 : undefined,
    threeDSectors: ['3D_AXIAL', '3D_TANGENTIAL', '3D_CROSSFLOW', '3D_TUNNEL'].includes(equipmentType) ? 2 : undefined,
    tunnelOrientation: equipmentType === '3D_TUNNEL' ? 'BOTH' : undefined,
    pneumaticArms: equipmentType === '3D_PNEUMATIC' ? 6 : undefined,
    pneumaticNozzlesPerArm: equipmentType === '3D_PNEUMATIC' ? 2 : undefined,
    cannonDeflectorCount: equipmentType === '3D_CANNON' ? 2 : undefined,
    referencePressureBar: pressureBar,
    slots,
    totalActiveFlowLMin: 0,
    activeSlotsCount: 0,
    totalSlotsCount: slots.length,
    updatedAt: new Date().toISOString()
  });
}

export function applyNozzleToMatchingSlots(
  profile: NozzleProfile,
  nozzle: Nozzle,
  predicate: (slot: NozzleSlotConfig) => boolean
): NozzleSlotConfig[] {
  const nominal = nozzle.nominalFlowLMin || 0.76;
  const refP = nozzle.referencePressureBar || 3;
  const flowAtP = calculateNozzleFlow(nominal, profile.referencePressureBar, refP);
  return profile.slots.map((s) =>
    predicate(s)
      ? {
          ...s,
          nozzleId: nozzle.id,
          brand: nozzle.brand,
          model: nozzle.model,
          color: nozzle.color || 'Amarelo',
          isoCode: nozzle.isoCode,
          sprayAngleDeg: nozzle.sprayAngleDeg ? Number(nozzle.sprayAngleDeg) : undefined,
          referencePressureBar: refP,
          nominalFlowLMin: nominal,
          swirlPlate: nozzle.swirlPlate,
          disc: nozzle.disc,
          flowAtPressureLMin: flowAtP
        }
      : s
  );
}

export function applyNozzleToSlots(
  profile: NozzleProfile,
  targetSlotIndex: number,
  nozzle: Nozzle,
  scope: 'slot' | 'sector' | 'side' | 'level' | 'arm' | 'group' | 'all' = 'slot'
): NozzleSlotConfig[] {
  if (scope === 'all') return applyNozzleToMatchingSlots(profile, nozzle, () => true);
  const target = profile.slots.find((s) => s.slotIndex === targetSlotIndex);
  if (scope === 'group' && target?.sectionSide) {
    return applyNozzleToMatchingSlots(profile, nozzle, (s) => s.sectionSide === target.sectionSide);
  }
  if (scope === 'arm' && target?.sectionSide) {
    return applyNozzleToMatchingSlots(profile, nozzle, (s) => s.sectionSide === target.sectionSide && s.armIndex === target.armIndex);
  }
  if (scope === 'sector' && target?.sectorIndex !== undefined) {
    return applyNozzleToMatchingSlots(profile, nozzle, (s) => s.sectorIndex === target.sectorIndex);
  }
  if (scope === 'side') {
    if (target?.sectionSide === 'ROTOR') {
      const left = isDroneSlotLeft(targetSlotIndex, profile.slots.length);
      return applyNozzleToMatchingSlots(profile, nozzle, (s) => isDroneSlotLeft(s.slotIndex, profile.slots.length) === left);
    }
    return applyNozzleToMatchingSlots(profile, nozzle, (s) => s.sectionSide === target?.sectionSide);
  }
  if (scope === 'level' && target?.sectionSide) {
    const mirrorIdx = target.sectionSide === 'ROTOR' ? getDroneMirrorSlotIndex(targetSlotIndex, profile.slots.length) : -1;
    const isLevelTarget = (s: NozzleSlotConfig) => target.sectionSide === 'ROTOR' ? (s.slotIndex === targetSlotIndex || s.slotIndex === mirrorIdx) : (s.slotIndex === targetSlotIndex || isOppositeLevelSlot(s, target));
    return applyNozzleToMatchingSlots(profile, nozzle, isLevelTarget).map((s) => isLevelTarget(s) ? { ...s, isActive: target.isActive } : s);
  }
  return applyNozzleToMatchingSlots(profile, nozzle, (s) => s.slotIndex === targetSlotIndex);
}

export function applyMeasuredFlowToSlots(
  profile: NozzleProfile,
  targetSlotIndex: number,
  measuredFlowLMin: number | undefined
): NozzleSlotConfig[] {
  return profile.slots.map((s) => (s.slotIndex === targetSlotIndex ? { ...s, measuredFlowLMin } : s));
}

export function toggleSlotActiveInSlots(
  profile: NozzleProfile,
  index: number
): NozzleSlotConfig[] {
  const target = profile.slots.find((s) => s.slotIndex === index);
  const nextActive = !(target?.isActive ?? true);
  return profile.slots.map((s) => (s.slotIndex === index ? { ...s, isActive: nextActive } : s));
}

export function buildUpdatedMetadataProfile(
  profile: NozzleProfile,
  params: { name: string; equipmentType: EquipmentType; equipmentId?: string; equipmentName?: string; pressure: number; airAssisted?: boolean; threeDSectors?: 2 | 4 | 6; tunnelOrientation?: TunnelOrientation; boomSectors?: number; pneumaticArms?: number; pneumaticNozzlesPerArm?: number; cannonDeflectorCount?: number; uavMode?: UavNozzleMode; slots: NozzleSlotConfig[] }
): NozzleProfile {
  const { slots: nextSlots, totalFlow, activeCount } = recalculateSlotsFlow(params.slots, params.pressure);
  return {
    ...profile, name: params.name.trim() || profile.name, equipmentType: params.equipmentType, equipmentId: params.equipmentId || undefined, equipmentName: params.equipmentName || undefined, referencePressureBar: params.pressure, airAssisted: params.airAssisted, boomSectors: params.boomSectors, boomNozzlesPerSector: params.boomSectors ? Math.max(1, Math.round(nextSlots.length / params.boomSectors)) : undefined, threeDSectors: params.threeDSectors, tunnelOrientation: params.tunnelOrientation, pneumaticArms: params.pneumaticArms, pneumaticNozzlesPerArm: params.pneumaticNozzlesPerArm, cannonDeflectorCount: params.cannonDeflectorCount, uavMode: params.uavMode, slots: nextSlots, totalSlotsCount: nextSlots.length, activeSlotsCount: activeCount, totalActiveFlowLMin: totalFlow
  };
}

export function applySelectedSlotToAll(slots: NozzleSlotConfig[], activeSlot: NozzleSlotConfig): NozzleSlotConfig[] {
  const { slotIndex: _si, slotLabel: _sl, sectionSide: _ss, levelIndex: _li, sectorIndex: _se, armIndex: _ai, orientation: _or, measuredFlowLMin: _mf, isActive: _ia, ...nozzleFields } = activeSlot;
  return slots.map((s) => ({ ...s, ...nozzleFields }));
}

export function mirrorSlotsLeftToRight(slots: NozzleSlotConfig[]): NozzleSlotConfig[] {
  if (slots[0]?.sectionSide === 'ROTOR') return mirrorDroneSlotsLeftToRight(slots);
  return slots.map((s) => {
    if (!s.sectionSide?.includes('RIGHT')) return s;
    const match = slots.find((l) => isOppositeLevelSlot(l, s));
    if (!match) return s;
    const { slotIndex: _si, slotLabel: _sl, sectionSide: _ss, measuredFlowLMin: _mf, ...rest } = match;
    return { ...s, ...rest };
  });
}
