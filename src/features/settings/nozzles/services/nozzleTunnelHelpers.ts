// src/features/settings/nozzles/services/nozzleTunnelHelpers.ts
import type {
  NozzleSlotConfig,
  SlotSectionSide,
  TunnelOrientation
} from '../../../../schemas/nozzle-profile.schema.ts';
import { isSlotConfigured } from './nozzleProfileMath.ts';

export type TunnelRampFilter = SlotSectionSide | 'ALL';

export const TUNNEL_RAMP_DEFS: ReadonlyArray<{
  side: SlotSectionSide;
  shortLabel: string;
  fullLabel: string;
}> = [
  { side: 'LEFT_OUTER', shortLabel: 'Esq. Ext.', fullLabel: 'Esquerda Exterior' },
  { side: 'LEFT_INNER', shortLabel: 'Esq. Int.', fullLabel: 'Esquerda Interior' },
  { side: 'RIGHT_INNER', shortLabel: 'Dir. Int.', fullLabel: 'Direita Interior' },
  { side: 'RIGHT_OUTER', shortLabel: 'Dir. Ext.', fullLabel: 'Direita Exterior' }
];

export function getTunnelActiveSides(orientation: TunnelOrientation = 'BOTH'): SlotSectionSide[] {
  if (orientation === 'INNER') return ['LEFT_INNER', 'RIGHT_INNER'];
  if (orientation === 'OUTER') return ['LEFT_OUTER', 'RIGHT_OUTER'];
  return ['LEFT_OUTER', 'LEFT_INNER', 'RIGHT_INNER', 'RIGHT_OUTER'];
}

export function getTunnelRampCount(orientation: TunnelOrientation = 'BOTH'): 2 | 4 {
  return orientation === 'BOTH' ? 4 : 2;
}

export function getTunnelSideShortLabel(side?: SlotSectionSide): string {
  return TUNNEL_RAMP_DEFS.find((d) => d.side === side)?.shortLabel ?? 'Ponto';
}

export function getTunnelSideFullLabel(side?: SlotSectionSide): string {
  return TUNNEL_RAMP_DEFS.find((d) => d.side === side)?.fullLabel ?? 'Ponto';
}

export function resolveTunnelRampFilterFallback(
  current: TunnelRampFilter,
  orientation: TunnelOrientation = 'BOTH'
): TunnelRampFilter {
  if (current === 'ALL') return 'ALL';
  const active = getTunnelActiveSides(orientation);
  return active.includes(current) ? current : active[0];
}

export function buildTunnelRampGroups(
  slots: NozzleSlotConfig[],
  orientation: TunnelOrientation = 'BOTH'
): Array<{ id: string; label: string; slots: NozzleSlotConfig[] }> {
  const activeSides = new Set(getTunnelActiveSides(orientation));
  return TUNNEL_RAMP_DEFS
    .filter((d) => activeSides.has(d.side))
    .map((d) => ({
      id: d.side,
      label: d.shortLabel,
      slots: slots.filter((s) => s.sectionSide === d.side)
    }))
    .filter((g) => g.slots.length > 0);
}

const sumSideFlow = (slots: NozzleSlotConfig[], side: SlotSectionSide): number =>
  Number(
    slots
      .filter((s) => s.sectionSide === side && s.isActive && isSlotConfigured(s))
      .reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0)
      .toFixed(3)
  );

export function computeTunnelCurtainTotals(slots: NozzleSlotConfig[]) {
  return {
    leftOuter: sumSideFlow(slots, 'LEFT_OUTER'),
    leftInner: sumSideFlow(slots, 'LEFT_INNER'),
    rightInner: sumSideFlow(slots, 'RIGHT_INNER'),
    rightOuter: sumSideFlow(slots, 'RIGHT_OUTER')
  };
}

export interface TunnelRampDeviationStats {
  avgDeviationPct: number;
  maxDeviationPct: number;
  isCompliant: boolean;
}

export function computeTunnelRampDeviation(
  slots: NozzleSlotConfig[],
  orientation: TunnelOrientation = 'BOTH'
): TunnelRampDeviationStats {
  const activeSides = getTunnelActiveSides(orientation);
  const rampTotals = activeSides.map((side) => sumSideFlow(slots, side));
  const mean = rampTotals.reduce((a, b) => a + b, 0) / Math.max(1, rampTotals.length);
  if (mean <= 0) return { avgDeviationPct: 0, maxDeviationPct: 0, isCompliant: true };

  const deviations = rampTotals.map((q) => (Math.abs(q - mean) / mean) * 100);
  const avgDeviationPct = Number((deviations.reduce((a, b) => a + b, 0) / deviations.length).toFixed(1));
  const maxDeviationPct = Number(Math.max(...deviations).toFixed(1));
  return { avgDeviationPct, maxDeviationPct, isCompliant: maxDeviationPct < 10 };
}
