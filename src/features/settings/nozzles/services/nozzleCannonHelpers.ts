// src/features/settings/nozzles/services/nozzleCannonHelpers.ts
import type { NozzleSlotConfig, SlotSectionSide } from '../../../../schemas/nozzle-profile.schema.ts';
import { isSlotConfigured } from './nozzleProfileMath.ts';

export type CannonGroupFilter = 'MAIN' | 'DEFLECTOR' | 'ALL';

export function getCannonSlotBadge(slot: NozzleSlotConfig, fallbackIdx = 0): string {
  const idx = slot.levelIndex ?? fallbackIdx + 1;
  return slot.sectionSide === 'CANNON_DEFLECTOR' ? `D${idx}` : `N${idx}`;
}

export function getCannonGroupLabel(side?: SlotSectionSide): string {
  return side === 'CANNON_DEFLECTOR' ? 'Defletor Inf.' : 'Boca Principal';
}

export function formatCannonSlotHeading(slot?: NozzleSlotConfig): string {
  if (!slot) return 'Boca Principal | N1';
  const badge = getCannonSlotBadge(slot, slot.slotIndex);
  return slot.sectionSide === 'CANNON_DEFLECTOR' ? `Defletor Inferior | ${badge}` : `Boca Principal | ${badge}`;
}

export function formatCannonKeypadShortPos(slot?: NozzleSlotConfig): string {
  if (!slot) return 'Boca Principal N1';
  const badge = getCannonSlotBadge(slot, slot.slotIndex);
  return slot.sectionSide === 'CANNON_DEFLECTOR' ? `Defletor Inferior ${badge}` : `Boca Principal ${badge}`;
}

export function resolveCannonGroupFilterFallback(current: CannonGroupFilter, deflectorCount: number): CannonGroupFilter {
  if (current === 'DEFLECTOR' && deflectorCount <= 0) return 'MAIN';
  return current;
}

export interface CannonDeviationStats {
  avgDeviationPct: number;
  maxDeviationPct: number;
  isCompliant: boolean;
}

export function computeCannonDeviation(slots: NozzleSlotConfig[]): CannonDeviationStats {
  const active = slots.filter((s) => s.isActive && isSlotConfigured(s));
  if (active.length === 0) return { avgDeviationPct: 0, maxDeviationPct: 0, isCompliant: true };

  const flows = active.map((s) => s.measuredFlowLMin ?? s.flowAtPressureLMin);
  const mean = flows.reduce((a, b) => a + b, 0) / flows.length;
  if (mean <= 0) return { avgDeviationPct: 0, maxDeviationPct: 0, isCompliant: true };

  const devs = flows.map((q) => (Math.abs(q - mean) / mean) * 100);
  const avgDeviationPct = Number((devs.reduce((a, b) => a + b, 0) / devs.length).toFixed(1));
  const maxDeviationPct = Number(Math.max(...devs).toFixed(1));
  return { avgDeviationPct, maxDeviationPct, isCompliant: maxDeviationPct < 10 };
}
