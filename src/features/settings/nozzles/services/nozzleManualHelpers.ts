// src/features/settings/nozzles/services/nozzleManualHelpers.ts
import type { NozzleSlotConfig } from '../../../../schemas/nozzle-profile.schema.ts';
import { isSlotConfigured } from './nozzleProfileMath.ts';

export function getManualSlotBadge(slot?: NozzleSlotConfig, fallbackIdx = 0): string {
  const idx = slot?.levelIndex ?? (slot ? slot.slotIndex + 1 : fallbackIdx + 1);
  return `L${idx}`;
}

export function formatManualSlotHeading(slot?: NozzleSlotConfig): string {
  return `Pistola / Lança | ${getManualSlotBadge(slot)}`;
}

export function formatManualKeypadShortPos(slot?: NozzleSlotConfig): string {
  return `Lança ${getManualSlotBadge(slot)}`;
}

export interface ManualLanceDeviationStats {
  activeCount: number;
  totalCount: number;
  avgDeviationPct: number;
  maxDeviationPct: number;
  isCompliant: boolean;
}

export function computeManualLanceDeviation(slots: NozzleSlotConfig[]): ManualLanceDeviationStats {
  const active = slots.filter((s) => s.isActive && isSlotConfigured(s));
  if (active.length === 0) {
    return { activeCount: 0, totalCount: slots.length, avgDeviationPct: 0, maxDeviationPct: 0, isCompliant: true };
  }
  const flows = active.map((s) => s.measuredFlowLMin ?? s.flowAtPressureLMin);
  const mean = flows.reduce((a, b) => a + b, 0) / flows.length;
  if (mean <= 0) {
    return { activeCount: active.length, totalCount: slots.length, avgDeviationPct: 0, maxDeviationPct: 0, isCompliant: true };
  }
  const devs = flows.map((q) => (Math.abs(q - mean) / mean) * 100);
  const avgDeviationPct = Number((devs.reduce((a, b) => a + b, 0) / devs.length).toFixed(1));
  const maxDeviationPct = Number(Math.max(...devs).toFixed(1));
  return {
    activeCount: active.length,
    totalCount: slots.length,
    avgDeviationPct,
    maxDeviationPct,
    isCompliant: maxDeviationPct < 10
  };
}
