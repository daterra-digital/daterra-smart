// src/features/settings/nozzles/services/nozzleDroneHelpers.ts
import type { NozzleSlotConfig } from '../../../../schemas/nozzle-profile.schema.ts';
import { calculateBilateralDeviationPct, isSlotConfigured } from './nozzleProfileMath.ts';

export type DroneFlankFilter = 'LEFT' | 'RIGHT' | 'ALL';

export function inferDroneRotorCount(slots: NozzleSlotConfig[], fallback?: number): 4 | 6 | 8 {
  const candidate = fallback ?? slots[0]?.armIndex;
  if (candidate === 4 || candidate === 6 || candidate === 8) return candidate;
  return 6;
}

export function isDroneSlotLeft(slotIndex: number, totalSlots: number): boolean {
  return slotIndex < Math.ceil(totalSlots / 2);
}

export function getDroneMirrorSlotIndex(slotIndex: number, totalSlots: number): number {
  const half = Math.ceil(totalSlots / 2);
  const mirror = slotIndex < half ? slotIndex + half : slotIndex - half;
  return mirror >= 0 && mirror < totalSlots ? mirror : slotIndex;
}

export function formatDroneSlotHeading(slot: NozzleSlotConfig | undefined, totalSlots: number): string {
  if (!slot) return 'Esquerda | Bico B1';
  const side = isDroneSlotLeft(slot.slotIndex, totalSlots) ? 'Esquerda' : 'Direita';
  return `${side} | Bico B${slot.slotIndex + 1}`;
}

export function formatDroneKeypadShortPos(slot: NozzleSlotConfig | undefined, totalSlots: number): string {
  if (!slot) return 'Esq. · B1';
  const side = isDroneSlotLeft(slot.slotIndex, totalSlots) ? 'Esq.' : 'Dir.';
  return `${side} · B${slot.slotIndex + 1}`;
}

export function isDroneSymmetricAtSlot(slots: NozzleSlotConfig[], targetSlot?: NozzleSlotConfig): boolean {
  if (!targetSlot) return true;
  const mirrorIdx = getDroneMirrorSlotIndex(targetSlot.slotIndex, slots.length);
  const opp = slots.find((s) => s.slotIndex === mirrorIdx);
  return !opp || (opp.nozzleId === targetSlot.nozzleId && opp.isActive === targetSlot.isActive);
}

export function mirrorDroneSlotsLeftToRight(slots: NozzleSlotConfig[]): NozzleSlotConfig[] {
  const half = Math.ceil(slots.length / 2);
  return slots.map((s) => {
    if (s.slotIndex < half) return s;
    const match = slots.find((l) => l.slotIndex === s.slotIndex - half);
    if (!match) return s;
    const { slotIndex: _si, slotLabel: _sl, sectionSide: _ss, levelIndex: _li, armIndex: _ai, measuredFlowLMin: _mf, ...rest } = match;
    return { ...s, ...rest };
  });
}

export function computeDroneBilateralDeviation(slots: NozzleSlotConfig[]) {
  const half = Math.ceil(slots.length / 2);
  const sumRange = (list: NozzleSlotConfig[]) =>
    Number(list.filter((s) => s.isActive && isSlotConfigured(s)).reduce((a, s) => a + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0).toFixed(3));
  const leftFlow = sumRange(slots.slice(0, half));
  const rightFlow = sumRange(slots.slice(half));
  const dev = calculateBilateralDeviationPct(leftFlow, rightFlow);
  return { leftFlow, rightFlow, bilateralDeviationPct: dev, isCompliant: dev < 10 };
}
