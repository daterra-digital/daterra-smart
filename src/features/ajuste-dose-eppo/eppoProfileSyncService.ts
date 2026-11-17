import { db } from '../../db/db.ts';
import type { ProfileCulture, ProfileEquipment } from '../../db/types.ts';
import { enqueueMutation } from '../../services/outbox/outboxService.ts';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper.ts';
import { assertValidOwnerId, isOwnedByUser, stripUndefinedFields } from '../perfis/services/profileOwnership.ts';
import type { CropStructure } from './eppoDoseDataMapper.ts';

export interface SyncCultureTelemetryParams {
  userId?: string;
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
  const ownerId = assertValidOwnerId(
    params.userId,
    'Sessão inválida: utilizador autenticado obrigatório para sincronizar perfil de cultura.'
  );
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

  let targetId: number | undefined;
  let targetName = (cultureName || '').trim();
  let existingSnapshot: ProfileCulture | undefined;

  if (cultureId !== undefined) {
    const existing = await db.profiles_cultures.get(cultureId);
    if (!existing) {
      throw new Error('Perfil de cultura não encontrado para sincronização.');
    }
    if (!isOwnedByUser(existing, ownerId)) {
      throw new Error('Acesso negado: o perfil de cultura pertence a outro utilizador.');
    }
    targetId = cultureId;
    targetName = existing.name;
    existingSnapshot = { ...existing };
  } else if (targetName) {
    const userCultures = await db.profiles_cultures.where('userId').equals(ownerId).toArray();
    const matches = userCultures.filter(
      (c) => isOwnedByUser(c, ownerId) && c.name.trim().toLowerCase() === targetName.toLowerCase()
    );
    if (matches.length > 1) {
      throw new Error('Identificação ambígua: existem múltiplos perfis de cultura com este nome na sua conta.');
    }
    if (matches.length === 1 && matches[0].id !== undefined) {
      targetId = matches[0].id;
      targetName = matches[0].name;
      existingSnapshot = { ...matches[0] };
    }
  }

  const telemetryPayload = stripUndefinedFields({
    last_lwa_m2_ha: lwaReal,
    last_trv_m3_ha: effectiveTrv,
    last_calculated_at: nowIso,
    last_phenological_stage: phenologicalStage,
    canopy_height_m: alturaM,
    row_distance_m: entrelinhaM,
    canopy_width_m: larguraCopaM,
    training_system: cropStructure
  });

  const isNew = targetId === undefined;
  if (!isNew && targetId !== undefined) {
    await db.profiles_cultures.update(targetId, telemetryPayload);
  } else {
    const fallbackName = targetName || `${isGlobular ? 'Pomar' : 'Vinha'} ${new Date().toLocaleDateString('pt-PT')}`;
    targetName = fallbackName;
    const insertedId = await db.profiles_cultures.add(
      stripUndefinedFields({
        name: fallbackName,
        crop_type: isGlobular ? 'Pomar' : 'Vinha',
        area_ha: 1.0,
        phenological_stage: phenologicalStage,
        userId: ownerId,
        ...telemetryPayload
      })
    );
    targetId = Number(insertedId);
  }

  const resolvedId = Number(targetId);
  const idempotencyKey = generateIdempotencyKey();

  try {
    await enqueueMutation({
      entityId: String(resolvedId),
      entityType: 'culture',
      operation: isNew ? 'CREATE' : 'UPDATE',
      userId: ownerId,
      payload: {
        id: resolvedId,
        idempotencyKey,
        name: targetName,
        ...telemetryPayload
      }
    });
  } catch (err) {
    if (isNew && typeof db.profiles_cultures.delete === 'function') {
      await db.profiles_cultures.delete(resolvedId).catch(() => {});
    } else if (existingSnapshot) {
      await db.profiles_cultures.update(resolvedId, existingSnapshot).catch(() => {});
    }
    throw err;
  }

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
  efficiencyFactor: number,
  userId?: string
): Promise<void> {
  const ownerId = assertValidOwnerId(
    userId,
    'Sessão inválida: utilizador autenticado obrigatório para sincronizar eficácia do equipamento.'
  );
  const existing = await db.profiles_equipment.get(equipmentId);
  if (!existing) {
    throw new Error('Equipamento não encontrado para sincronização.');
  }
  if (!isOwnedByUser(existing, ownerId)) {
    throw new Error('Acesso negado: o equipamento pertence a outro utilizador.');
  }

  const previousSnapshot: ProfileEquipment = { ...existing };
  const idempotencyKey = generateIdempotencyKey();

  await db.profiles_equipment.update(equipmentId, {
    efficiency_correction_factor: efficiencyFactor
  });

  try {
    await enqueueMutation({
      entityId: String(equipmentId),
      entityType: 'equipment',
      operation: 'UPDATE',
      userId: ownerId,
      payload: {
        id: equipmentId,
        idempotencyKey,
        efficiency_correction_factor: efficiencyFactor
      }
    });
  } catch (err) {
    await db.profiles_equipment.update(equipmentId, {
      efficiency_correction_factor: previousSnapshot.efficiency_correction_factor
    }).catch(() => {});
    throw err;
  }
}
