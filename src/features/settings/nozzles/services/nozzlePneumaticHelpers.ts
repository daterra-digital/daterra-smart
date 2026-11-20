// src/features/settings/nozzles/services/nozzlePneumaticHelpers.ts
import type { NozzleSlotConfig, SlotSectionSide } from '../../../../schemas/nozzle-profile.schema.ts';
import { isSlotConfigured } from './nozzleProfileMath.ts';

export type PneumaticArmFilter = string;

export function getPneumaticArmLabel(side?: SlotSectionSide, armIndex = 1): string {
  const sideLbl = side === 'RIGHT' ? 'Dir.' : 'Esq.';
  return `Braço ${sideLbl} ${armIndex}`;
}

export function getPneumaticCompactArmLabel(side?: SlotSectionSide, armIndex = 1): string {
  return `${side === 'RIGHT' ? 'Dir.' : 'Esq.'} ${armIndex}`;
}

export function getPneumaticFullArmTitle(side?: SlotSectionSide, armIndex = 1, count = 0): string {
  const sideFull = side === 'RIGHT' ? 'Direito' : 'Esquerdo';
  return `Braço ${sideFull} ${armIndex} (${count} ${count === 1 ? 'bico' : 'bicos'})`;
}

export function formatPneumaticSlotHeading(slot?: NozzleSlotConfig): string {
  if (!slot) return 'Braço Esq. 1 | Ponto 1 (N1)';
  const lvl = slot.levelIndex ?? 1;
  return `${getPneumaticArmLabel(slot.sectionSide, slot.armIndex ?? 1)} | Ponto ${lvl} (N${lvl})`;
}

export function formatPneumaticKeypadShortPos(slot?: NozzleSlotConfig): string {
  if (!slot) return 'Braço Esq. 1 · N1';
  const lvl = slot.levelIndex ?? 1;
  return `${getPneumaticArmLabel(slot.sectionSide, slot.armIndex ?? 1)} · N${lvl}`;
}

export function resolvePneumaticArmFilterFallback(current: PneumaticArmFilter, arms = 6): PneumaticArmFilter {
  if (current === 'ALL') return 'ALL';
  const perSide = Math.max(1, Math.round(arms / 2));
  const match = /^(LEFT|RIGHT)_(\d+)$/.exec(current);
  if (match && Number(match[2]) <= perSide) return current;
  return 'LEFT_1';
}

export function computePneumaticFlankTotals(slots: NozzleSlotConfig[]) {
  const sumSide = (side: 'LEFT' | 'RIGHT') =>
    Number(
      slots
        .filter((s) => s.sectionSide === side && s.isActive && isSlotConfigured(s))
        .reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0)
        .toFixed(3)
    );
  return { leftTotal: sumSide('LEFT'), rightTotal: sumSide('RIGHT') };
}

export interface PneumaticArmDeviationStats {
  avgDeviationPct: number;
  maxDeviationPct: number;
  isCompliant: boolean;
}

export function computePneumaticArmDeviation(slots: NozzleSlotConfig[], arms = 6): PneumaticArmDeviationStats {
  const perSide = Math.max(1, Math.round(arms / 2));
  const armTotals: number[] = [];
  for (const side of ['LEFT', 'RIGHT'] as const) {
    for (let a = 1; a <= perSide; a++) {
      const flow = slots
        .filter((s) => s.sectionSide === side && (s.armIndex ?? 1) === a && s.isActive && isSlotConfigured(s))
        .reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0);
      armTotals.push(flow);
    }
  }
  const mean = armTotals.reduce((a, b) => a + b, 0) / Math.max(1, armTotals.length);
  if (mean <= 0) return { avgDeviationPct: 0, maxDeviationPct: 0, isCompliant: true };

  const devs = armTotals.map((q) => (Math.abs(q - mean) / mean) * 100);
  const avgDeviationPct = Number((devs.reduce((a, b) => a + b, 0) / devs.length).toFixed(1));
  const maxDeviationPct = Number(Math.max(...devs).toFixed(1));
  return { avgDeviationPct, maxDeviationPct, isCompliant: maxDeviationPct < 10 };
}
