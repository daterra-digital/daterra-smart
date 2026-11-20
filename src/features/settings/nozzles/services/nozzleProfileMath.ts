// src/features/settings/nozzles/services/nozzleProfileMath.ts
import { NOZZLES_BY_ID } from '../../../nozzle-comparison/nozzleComparison.data.ts';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import type { EquipmentType } from '../../../../schemas/equipment.schema.ts';
import type { NozzleSlotConfig, TunnelOrientation } from '../../../../schemas/nozzle-profile.schema.ts';
import {
  buildSlotsForTypology,
  formatSlotPositionHeading,
  getTypologyCountMeta,
  inferPrimaryCount,
  inferSecondaryCount,
  type TypologyCountMeta
} from './nozzleSlotFactory.ts';

export { formatSlotPositionHeading, getTypologyCountMeta, inferPrimaryCount, inferSecondaryCount, type TypologyCountMeta };

export function calculateNozzleFlow(
  nominalFlow: number,
  pressureBar: number,
  refPressureBar = 3
): number {
  if (nominalFlow <= 0 || pressureBar <= 0 || refPressureBar <= 0) return 0;
  return Number((nominalFlow * Math.sqrt(pressureBar / refPressureBar)).toFixed(3));
}

export function calculateFlowDeviationPct(
  tabulatedFlowLMin: number,
  measuredFlowLMin?: number
): number | null {
  if (measuredFlowLMin === undefined || !Number.isFinite(measuredFlowLMin) || tabulatedFlowLMin <= 0) {
    return null;
  }
  return Number((((measuredFlowLMin - tabulatedFlowLMin) / tabulatedFlowLMin) * 100).toFixed(1));
}

export function isSlotConfigured(slot?: NozzleSlotConfig): boolean {
  return Boolean(slot && slot.brand.trim() && slot.model.trim());
}

export function isIso16122DeviationExceeded(deviationPct: number | null): boolean {
  return deviationPct !== null && Math.abs(deviationPct) > 10;
}

export function calculateBilateralDeviationPct(leftFlow: number, rightFlow: number): number {
  if (leftFlow <= 0 && rightFlow <= 0) return 0;
  const denominator = Math.max(leftFlow, rightFlow, 0.0001);
  return Number(((Math.abs(rightFlow - leftFlow) / denominator) * 100).toFixed(1));
}

export interface BilateralStats {
  leftFlow: number;
  rightFlow: number;
  bilateralDeviationPct: number;
  isCompliant: boolean;
}

export function computeBilateralStats(slots: NozzleSlotConfig[]): BilateralStats {
  const leftSlots = slots.filter((s) => s.isActive && isSlotConfigured(s) && (s.sectionSide?.includes('LEFT') || s.sectionSide === undefined));
  const rightSlots = slots.filter((s) => s.isActive && isSlotConfigured(s) && Boolean(s.sectionSide?.includes('RIGHT')));
  const leftFlow = Number(
    leftSlots.reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0).toFixed(3)
  );
  const rightFlow = Number(
    rightSlots.reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0).toFixed(3)
  );
  const dev = calculateBilateralDeviationPct(leftFlow, rightFlow);
  return {
    leftFlow,
    rightFlow,
    bilateralDeviationPct: dev,
    isCompliant: dev < 10
  };
}

export function areAllActiveNozzlesIdentical(slots: NozzleSlotConfig[]): boolean {
  const active = slots.filter((s) => s.isActive && isSlotConfigured(s));
  if (active.length <= 1) return active.length === 1;
  const firstId = active[0].nozzleId;
  return active.every((s) => s.nozzleId === firstId);
}

export interface SlotGroupStats {
  activeCount: number;
  avgTabulatedFlowLMin: number;
  avgMeasuredFlowLMin: number | null;
  avgDeviationPct: number | null;
  hasIso16122Alert: boolean;
  totalFlowLMin: number;
}

export function computeSlotGroupStats(slots: NozzleSlotConfig[]): SlotGroupStats {
  const active = slots.filter((s) => s.isActive && isSlotConfigured(s));
  if (active.length === 0) {
    return { activeCount: 0, avgTabulatedFlowLMin: 0, avgMeasuredFlowLMin: null, avgDeviationPct: null, hasIso16122Alert: false, totalFlowLMin: 0 };
  }
  const totalTab = active.reduce((acc, s) => acc + s.flowAtPressureLMin, 0);
  const measuredSlots = active.filter((s) => s.measuredFlowLMin !== undefined);
  const avgTab = Number((totalTab / active.length).toFixed(3));
  const avgMeas =
    measuredSlots.length > 0
      ? Number((measuredSlots.reduce((acc, s) => acc + (s.measuredFlowLMin ?? 0), 0) / measuredSlots.length).toFixed(3))
      : null;
  const avgDev = avgMeas !== null ? calculateFlowDeviationPct(avgTab, avgMeas) : null;
  const anyAlert =
    isIso16122DeviationExceeded(avgDev) ||
    active.some((s) => isIso16122DeviationExceeded(calculateFlowDeviationPct(s.flowAtPressureLMin, s.measuredFlowLMin)));
  return {
    activeCount: active.length,
    avgTabulatedFlowLMin: avgTab,
    avgMeasuredFlowLMin: avgMeas,
    avgDeviationPct: avgDev,
    hasIso16122Alert: anyAlert,
    totalFlowLMin: Number(totalTab.toFixed(3))
  };
}

export function getDefaultNozzle(): Nozzle {
  return NOZZLES_BY_ID.get('albuz_atr_80_amarelo') || Array.from(NOZZLES_BY_ID.values())[0];
}

export function generateDefaultSlots(
  type: EquipmentType,
  pressureBar: number,
  customCount?: number,
  options?: { secondaryCount?: number; threeDSectors?: 2 | 4 | 6; tunnelOrientation?: TunnelOrientation; rotorCount?: number; emptyByDefault?: boolean }
): NozzleSlotConfig[] {
  return buildSlotsForTypology(type, pressureBar, {
    count: customCount,
    secondaryCount: options?.secondaryCount,
    threeDSectors: options?.threeDSectors,
    tunnelOrientation: options?.tunnelOrientation,
    rotorCount: options?.rotorCount,
    emptyByDefault: options?.emptyByDefault,
    fallbackNozzle: getDefaultNozzle(),
    calcFlow: calculateNozzleFlow
  });
}

export function resizeProfileSlots(
  type: EquipmentType,
  pressureBar: number,
  existingSlots: NozzleSlotConfig[],
  nextCount: number,
  options?: { secondaryCount?: number; totalNozzles?: number; threeDSectors?: 2 | 4 | 6; tunnelOrientation?: TunnelOrientation; rotorCount?: number }
): NozzleSlotConfig[] {
  return buildSlotsForTypology(type, pressureBar, {
    count: nextCount,
    secondaryCount: options?.secondaryCount,
    totalNozzles: options?.totalNozzles,
    threeDSectors: options?.threeDSectors,
    tunnelOrientation: options?.tunnelOrientation,
    rotorCount: options?.rotorCount,
    existingSlots,
    fallbackNozzle: getDefaultNozzle(),
    calcFlow: calculateNozzleFlow
  });
}

export function recalculateSlotsFlow(
  slots: NozzleSlotConfig[],
  pressureBar: number
): { slots: NozzleSlotConfig[]; totalFlow: number; activeCount: number } {
  let total = 0;
  let active = 0;
  const updated = slots.map((s) => {
    const configured = isSlotConfigured(s);
    const flowAtP = configured ? calculateNozzleFlow(s.nominalFlowLMin, pressureBar, s.referencePressureBar ?? 3) : 0;
    if (s.isActive && configured) {
      total += flowAtP;
      active += 1;
    }
    return { ...s, flowAtPressureLMin: flowAtP };
  });
  return { slots: updated, totalFlow: Number(total.toFixed(3)), activeCount: active };
}

const DEFAULT_KEYPAD_SHORTCUTS = [0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0];

export function buildKeypadShortcutsForFlow(
  tabulatedFlowLMin: number,
  isActive = true
): number[] {
  if (!isActive || !Number.isFinite(tabulatedFlowLMin) || tabulatedFlowLMin <= 0) {
    return DEFAULT_KEYPAD_SHORTCUTS;
  }
  const multipliers = [0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15];
  const values = multipliers.map((m) => Number((tabulatedFlowLMin * m).toFixed(2)));
  const unique = Array.from(new Set(values.filter((v) => v > 0))).sort((a, b) => a - b);
  return unique.length >= 2 ? unique : DEFAULT_KEYPAD_SHORTCUTS;
}
