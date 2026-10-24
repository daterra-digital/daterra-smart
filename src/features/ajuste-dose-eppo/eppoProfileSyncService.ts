import { db } from '../../db/db.ts';
import { enqueueMutation } from '../../services/outbox/outboxService.ts';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper.ts';
import type { CropStructure } from './eppoDoseDataMapper.ts';

export interface SyncCultureTelemetryParams {
  cultureId?: number;
  cultureName?: string;
  lwaReal: number;
  trvReal?: number;
  alturaM: number;
  larguraCopaM?: number;
  entrelinhaM: number;
  cropStructure: CropStructure;
  phenologicalStage?: string;
}

export interface SyncCultureTelemetryResult {
  success: boolean;
  cultureId: number;
  cultureName: string;
  updatedAt: string;
}

/**
 * Persiste a telemetria agronómica consolidada (LWA/TRV) no perfil da cultura
 * e enfileira uma mutação atómica na Mutation Outbox (First-Offline).
 */
export async function syncCultureTelemetryToProfile(
  params: SyncCultureTelemetryParams
): Promise<SyncCultureTelemetryResult> {
  const {
    cultureId,
    cultureName,
    lwaReal,
    trvReal,
    alturaM,
    larguraCopaM,
    entrelinhaM,
    cropStructure,
    phenologicalStage
  } = params;

  const nowIso = new Date().toISOString();
  const isGlobular = cropStructure === 'globular';
  const effectiveTrv = isGlobular || (trvReal !== undefined && trvReal > 0) ? trvReal : undefined;

  let targetId: number | undefined = cultureId;
  let targetName = cultureName;
  let isNew = false;

  if (targetId) {
    const existing = await db.profiles_cultures.get(targetId);
    if (existing) {
      targetName = existing.name;
    }
  } else if (cultureName) {
    const existing = await db.profiles_cultures.where('name').equalsIgnoreCase(cultureName).first();
    if (existing && existing.id) {
      targetId = existing.id;
      targetName = existing.name;
    }
  }

  const telemetryPayload = {
    last_lwa_m2_ha: lwaReal,
    last_trv_m3_ha: effectiveTrv,
    last_calculated_at: nowIso,
    last_phenological_stage: phenologicalStage,
    canopy_height_m: alturaM,
    row_distance_m: entrelinhaM,
    canopy_width_m: larguraCopaM,
    training_system: cropStructure
  };

  if (targetId) {
    await db.profiles_cultures.update(targetId, telemetryPayload);
  } else {
    isNew = true;
    const fallbackName = targetName || `${isGlobular ? 'Pomar' : 'Vinha'} ${new Date().toLocaleDateString('pt-PT')}`;
    targetName = fallbackName;
    const insertedId = await db.profiles_cultures.add({
      name: fallbackName,
      crop_type: isGlobular ? 'Pomar' : 'Vinha',
      area_ha: 1.0,
      phenological_stage: phenologicalStage,
      ...telemetryPayload
    });
    targetId = Number(insertedId);
  }

  const resolvedId = Number(targetId);

  await enqueueMutation({
    entityId: generateIdempotencyKey(),
    entityType: 'culture',
    operation: isNew ? 'CREATE' : 'UPDATE',
    payload: {
      id: resolvedId,
      name: targetName,
      ...telemetryPayload
    }
  });

  return {
    success: true,
    cultureId: resolvedId,
    cultureName: targetName || 'Cultura',
    updatedAt: nowIso
  };
}

/**
 * Atualiza o fator de correção de eficácia no perfil do equipamento
 */
export async function syncEquipmentEfficiencyFactor(
  equipmentId: number,
  efficiencyFactor: number
): Promise<void> {
  await db.profiles_equipment.update(equipmentId, {
    efficiency_correction_factor: efficiencyFactor
  });

  await enqueueMutation({
    entityId: generateIdempotencyKey(),
    entityType: 'equipment',
    operation: 'UPDATE',
    payload: {
      id: equipmentId,
      efficiency_correction_factor: efficiencyFactor
    }
  });
}
