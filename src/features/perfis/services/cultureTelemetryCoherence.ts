// src/features/perfis/services/cultureTelemetryCoherence.ts
// Deteção não bloqueante de divergência entre o espelho da Cultura (telemetria de calculadoras) e o momento ativo.

import type { ProfileCropMoment, ProfileCulture } from '../../../db/types.ts';

export function detectCultureTelemetryIncoherence(
  culture: ProfileCulture | null | undefined,
  activeMoment?: ProfileCropMoment | null
): { hasIncoherence: boolean; reasons: string[] } {
  if (!culture || !activeMoment || !culture.last_calculated_at) {
    return { hasIncoherence: false, reasons: [] };
  }
  const reasons: string[] = [];
  if (culture.phenological_stage && culture.phenological_stage !== activeMoment.stageLabel) {
    reasons.push('Estádio fenológico no perfil difere do momento ativo.');
  }
  if (
    culture.canopy_height_m !== undefined &&
    activeMoment.canopyHeightM !== undefined &&
    Math.abs(culture.canopy_height_m - activeMoment.canopyHeightM) > 0.01
  ) {
    reasons.push('Altura de vegetação no perfil difere do momento ativo.');
  }
  if (
    culture.canopy_width_m !== undefined &&
    activeMoment.canopyWidthM !== undefined &&
    Math.abs(culture.canopy_width_m - activeMoment.canopyWidthM) > 0.01
  ) {
    reasons.push('Largura da copa no perfil difere do momento ativo.');
  }
  return { hasIncoherence: reasons.length > 0, reasons };
}
