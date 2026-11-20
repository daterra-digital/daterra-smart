// src/features/settings/nozzles/services/nozzleBoom2dHelpers.ts
import type { NozzleProfile, NozzleSlotConfig } from '../../../../schemas/nozzle-profile.schema.ts';
import {
  calculateFlowDeviationPct,
  calculateNozzleFlow,
  isIso16122DeviationExceeded,
  isSlotConfigured
} from './nozzleProfileMath.ts';
import { distributeNozzlesAcrossSectors } from './nozzleSlotFactory.ts';
import { buildTunnelRampGroups, getTunnelSideShortLabel } from './nozzleTunnelHelpers.ts';
import { formatPneumaticKeypadShortPos } from './nozzlePneumaticHelpers.ts';
import { formatCannonKeypadShortPos } from './nozzleCannonHelpers.ts';
import { formatDroneKeypadShortPos } from './nozzleDroneHelpers.ts';
import { formatManualKeypadShortPos } from './nozzleManualHelpers.ts';

export { distributeNozzlesAcrossSectors };

export interface RampGroup {
  id: string;
  label: string;
  slots: NozzleSlotConfig[];
}

export function buildRampGroups(profile: NozzleProfile): RampGroup[] {
  const { equipmentType, slots } = profile;
  if (equipmentType === '3D_AXIAL' || equipmentType === '3D_TANGENTIAL' || equipmentType === '3D_CROSSFLOW') {
    return [{ id: 'LEFT', label: 'Esquerda', slots: slots.filter((s) => s.sectionSide === 'LEFT') }, { id: 'RIGHT', label: 'Direita', slots: slots.filter((s) => s.sectionSide === 'RIGHT') }].filter((g) => g.slots.length > 0);
  }
  if (equipmentType === '3D_TUNNEL') return buildTunnelRampGroups(slots, profile.tunnelOrientation ?? 'BOTH');
  if (equipmentType === '3D_PNEUMATIC') {
    const map = new Map<string, RampGroup>();
    for (const s of slots) {
      const side = s.sectionSide === 'RIGHT' ? 'RIGHT' : 'LEFT';
      const arm = s.armIndex ?? 1;
      const id = `${side}_${arm}`;
      if (!map.has(id)) map.set(id, { id, label: `Braço ${side === 'LEFT' ? 'Esq.' : 'Dir.'} ${arm}`, slots: [] });
      map.get(id)!.slots.push(s);
    }
    return Array.from(map.values());
  }
  return [];
}

export function isBoomUniform(slots: NozzleSlotConfig[]): boolean {
  const configured = slots.filter(isSlotConfigured);
  if (configured.length === 0) return true;
  if (configured.length !== slots.length) return false;
  const first = configured[0];
  return configured.every((s) => s.nozzleId === first.nozzleId && s.isActive === first.isActive);
}

export function isBoomSectorUniform(slots: NozzleSlotConfig[], sectorIndex = 1): boolean {
  const secSlots = slots.filter((s) => (s.sectorIndex ?? 1) === sectorIndex);
  return isBoomUniform(secSlots);
}

export interface BoomSectorSummary {
  sectorIndex: number;
  label: string;
  slots: NozzleSlotConfig[];
  representative: NozzleSlotConfig;
  nozzleCount: number;
  activeFlowLMin: number;
  maxDeviationPct: number | null;
  hasIsoAlert: boolean;
  isConfigured: boolean;
}

export function computeBoomSectorSummaries(slots: NozzleSlotConfig[], sectors: number): BoomSectorSummary[] {
  const safeSectors = Math.max(1, Math.min(12, sectors));
  const summaries: BoomSectorSummary[] = [];
  for (let sec = 1; sec <= safeSectors; sec++) {
    const secSlots = slots.filter((s) => (s.sectorIndex ?? 1) === sec);
    if (secSlots.length === 0) continue;
    const rep = secSlots[0];
    const configured = secSlots.some(isSlotConfigured);
    const activeFlow = secSlots
      .filter((s) => s.isActive && isSlotConfigured(s))
      .reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0);
    const deviations = secSlots
      .filter((s) => s.isActive && isSlotConfigured(s) && s.measuredFlowLMin !== undefined)
      .map((s) => calculateFlowDeviationPct(s.flowAtPressureLMin, s.measuredFlowLMin))
      .filter((d): d is number => d !== null);
    const maxDev =
      deviations.length > 0
        ? deviations.reduce((best, d) => (Math.abs(d) > Math.abs(best) ? d : best), deviations[0])
        : null;
    summaries.push({
      sectorIndex: sec,
      label: `S${sec}`,
      slots: secSlots,
      representative: rep,
      nozzleCount: secSlots.length,
      activeFlowLMin: Number(activeFlow.toFixed(3)),
      maxDeviationPct: maxDev,
      hasIsoAlert: isIso16122DeviationExceeded(maxDev),
      isConfigured: configured
    });
  }
  return summaries;
}

export function getBoomSectorCounts(slots: NozzleSlotConfig[], sectors: number): number[] {
  const safeSectors = Math.max(1, Math.min(12, sectors));
  return Array.from({ length: safeSectors }, (_, idx) => {
    const count = slots.filter((s) => (s.sectorIndex ?? 1) === idx + 1).length;
    return count > 0 ? Math.min(30, count) : 5;
  });
}

export function resizeBoomSlotsBySectorCounts(
  pressureBar: number,
  existingSlots: NozzleSlotConfig[],
  sectorCounts: number[]
): NozzleSlotConfig[] {
  const globalRef = existingSlots.find((s) => s.isActive && isSlotConfigured(s));
  const emptyBase: Omit<NozzleSlotConfig, 'slotIndex' | 'slotLabel' | 'sectorIndex' | 'levelIndex'> = {
    sectionSide: 'BOOM', isActive: true, nozzleId: '', brand: '', model: '', color: '',
    referencePressureBar: 3, nominalFlowLMin: 0, flowAtPressureLMin: 0
  };
  const result: NozzleSlotConfig[] = [];
  let idx = 0;

  sectorCounts.forEach((rawCount, sIdx) => {
    const sec = sIdx + 1;
    const count = Math.max(1, Math.min(30, Math.round(rawCount)));
    const secExisting = existingSlots.filter((s) => (s.sectorIndex ?? 1) === sec);
    const secRef = secExisting.find((s) => s.isActive && isSlotConfigured(s)) ?? globalRef;

    for (let b = 1; b <= count; b++) {
      const prev = secExisting.find((s) => s.levelIndex === b) ?? secExisting[b - 1];
      const source = prev ?? (secRef ? { ...secRef, measuredFlowLMin: undefined } : emptyBase);
      const configured = isSlotConfigured(source as NozzleSlotConfig);
      result.push({
        ...source,
        slotIndex: idx,
        slotLabel: `Setor ${sec} · #${idx + 1}`,
        sectionSide: 'BOOM',
        sectorIndex: sec,
        levelIndex: b,
        flowAtPressureLMin: configured ? calculateNozzleFlow(source.nominalFlowLMin, pressureBar, source.referencePressureBar ?? 3) : 0
      });
      idx++;
    }
  });
  return result;
}

export function computeBoomSectorDeviationPct(slots: NozzleSlotConfig[], sectors: number): number {
  const safeSectors = Math.max(1, Math.min(12, sectors));
  const sectorMeans: number[] = [];
  for (let sec = 1; sec <= safeSectors; sec++) {
    const active = slots.filter((s) => (s.sectorIndex ?? 1) === sec && s.isActive && isSlotConfigured(s));
    if (active.length === 0) continue;
    const sum = active.reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.nominalFlowLMin), 0);
    sectorMeans.push(sum / active.length);
  }
  if (sectorMeans.length < 2) return 0;
  const globalMean = sectorMeans.reduce((a, b) => a + b, 0) / sectorMeans.length;
  if (globalMean <= 0) return 0;
  const avgDev =
    sectorMeans.reduce((acc, m) => acc + (Math.abs(m - globalMean) / globalMean) * 100, 0) / sectorMeans.length;
  return Number(avgDev.toFixed(1));
}

export function computeBoomMaxDeviationPct(slots: NozzleSlotConfig[]): number {
  const devs = slots
    .filter((s) => s.isActive && isSlotConfigured(s) && s.measuredFlowLMin !== undefined)
    .map((s) => Math.abs(calculateFlowDeviationPct(s.flowAtPressureLMin, s.measuredFlowLMin) ?? 0));
  return devs.length > 0 ? Number(Math.max(...devs).toFixed(1)) : 0;
}

export function buildBoom2dSlotHeading(slot: NozzleSlotConfig | undefined): string {
  if (!slot) return 'Barra Horizontal | Bico B1';
  const sec = slot.sectorIndex ?? 1;
  return `Setor ${sec} (S${sec}) | Bico B${slot.slotIndex + 1}`;
}

export function buildMeasuredFlowKeypadTitle(slot: NozzleSlotConfig | undefined, equipmentType: string, totalSlots = 6): string {
  const shortPos = !slot ? 'Bico' : equipmentType === '2D_HORIZONTAL' ? `S${slot.sectorIndex ?? 1} · B${slot.slotIndex + 1}` : equipmentType === '3D_TUNNEL' ? `${getTunnelSideShortLabel(slot.sectionSide)} N${slot.levelIndex ?? slot.slotIndex + 1}` : equipmentType === '3D_PNEUMATIC' ? formatPneumaticKeypadShortPos(slot) : equipmentType === '3D_CANNON' ? formatCannonKeypadShortPos(slot) : equipmentType === 'UAV_DRONE' ? formatDroneKeypadShortPos(slot, totalSlots) : equipmentType === 'MANUAL_LANCE' ? formatManualKeypadShortPos(slot) : slot.sectionSide?.includes('LEFT') ? `Esq. N${slot.levelIndex ?? slot.slotIndex + 1}` : slot.sectionSide?.includes('RIGHT') ? `Dir. N${slot.levelIndex ?? slot.slotIndex + 1}` : `#${slot.slotIndex + 1}`;
  const detail = slot ? ` · ${slot.brand} ${slot.model}${slot.sprayAngleDeg ? ` ${slot.sprayAngleDeg}°` : ''} ${slot.color}` : '';
  return `Débito Real · ${shortPos}${detail}`;
}
