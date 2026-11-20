// src/features/settings/nozzles/services/nozzleAiContextService.ts
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';
import { getEquipmentTypeLabelPt } from '../../../../lib/equipment-math.ts';

export interface NozzleAiContextItem {
  id: string;
  name: string;
  equipmentType: string;
  totalFlowLMin: number;
  activePoints: number;
  pressureBar: number;
  summaryText: string;
}

export function buildNozzleAiContextSummary(profile: NozzleProfile): string {
  const typeLabel = getEquipmentTypeLabelPt(profile.equipmentType);
  const mainSlots = profile.slots.filter((s) => s.isActive);
  const distinctNozzles = Array.from(
    new Set(mainSlots.map((s) => `${s.brand} ${s.model} ${s.color}`))
  ).join(', ');
  const airInfo =
    profile.equipmentType === '2D_HORIZONTAL'
      ? ` | Manga de ar: ${profile.airAssisted ? 'Sim' : 'Não'}`
      : profile.equipmentType === '3D_AXIAL' || profile.equipmentType === '3D_CROSSFLOW' || profile.equipmentType === '3D_TUNNEL'
        ? ` | Ventilador: ${profile.airAssisted === false ? 'Desativado (Barras verticais)' : 'Ativo'}`
        : '';

  return (
    `[@bico: "${profile.name}"]\n` +
    `Tipologia: ${typeLabel} | Ref. Máquina: ${profile.equipmentName || 'Direta'}${airInfo}\n` +
    `Pressão Base: ${profile.referencePressureBar.toFixed(1).replace('.', ',')} bar | Débito Total Rampa: ${profile.totalActiveFlowLMin.toFixed(2).replace('.', ',')} L/min\n` +
    `Pontos Ativos: ${profile.activeSlotsCount}/${profile.totalSlotsCount} | Bicos: ${distinctNozzles}`
  );
}

export function buildNozzleAiItem(profile: NozzleProfile): NozzleAiContextItem {
  return {
    id: profile.id,
    name: profile.name,
    equipmentType: getEquipmentTypeLabelPt(profile.equipmentType),
    totalFlowLMin: profile.totalActiveFlowLMin,
    activePoints: profile.activeSlotsCount,
    pressureBar: profile.referencePressureBar,
    summaryText: buildNozzleAiContextSummary(profile)
  };
}
