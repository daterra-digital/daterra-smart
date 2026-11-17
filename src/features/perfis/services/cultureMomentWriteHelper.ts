// src/features/perfis/services/cultureMomentWriteHelper.ts
// Auxiliares internos de escrita transacional para momentos e espelho físico da Cultura (<= 200 LOC).

import type {
  ProfileCropMoment,
  ProfileCulture
} from '../../../db/types.ts';
import type { DaterraDatabase } from '../../../db/db.ts';
import { isOwnedByUser, stripUndefinedFields } from './profileOwnership.ts';
import { buildMomentSnapshot, evaluateCultureMomentMetrics } from './cultureEngineCompatibility.ts';
import type { SaveCultureMomentInput } from './cultureMomentStorage.ts';

/** Campos do momento cuja alteração gera sempre uma revisão auditável. */
const REVISION_TRACKED_FIELDS = [
  'observedAt',
  'stageLabel',
  'canopyHeightM',
  'canopyWidthM',
  'lai',
  'densityTier',
  'thicknessTierManual'
] as const;

export function buildMirroredCultureRecord(
  base: ProfileCulture,
  momentId: number,
  m: Pick<ProfileCropMoment, 'stageLabel' | 'canopyHeightM' | 'canopyWidthM' | 'lai'>,
  nowIso: string,
  recommendedSprayVolumeLHa?: number | null
): ProfileCulture {
  const next: ProfileCulture = {
    ...base,
    active_moment_id: momentId,
    phenological_stage: m.stageLabel,
    updated_at: nowIso
  };
  delete next.canopy_height_m;
  delete next.canopy_width_m;
  delete next.lai;
  if (m.canopyHeightM !== undefined) next.canopy_height_m = m.canopyHeightM;
  if (m.canopyWidthM !== undefined) next.canopy_width_m = m.canopyWidthM;
  if (m.lai !== undefined) next.lai = m.lai;
  // Sem dados válidos mantém-se o último volume conhecido (não é apagado nem inventado).
  if (recommendedSprayVolumeLHa != null) next.last_spray_volume_lha = recommendedSprayVolumeLHa;
  return next;
}

/** Snapshot anterior completo: preenche valores em falta (registos antigos) a partir da linha guardada. */
function snapshotBeforeWithRowFallback(existing: ProfileCropMoment): string {
  let snap: Record<string, unknown> = {};
  try {
    snap = (JSON.parse(existing.snapshotJson) as Record<string, unknown>) ?? {};
  } catch {
    snap = {};
  }
  const fill = (key: string, value: unknown) => {
    if (value !== undefined && snap[key] === undefined) snap[key] = value;
  };
  fill('stageLabel', existing.stageLabel);
  fill('canopyHeightM', existing.canopyHeightM);
  fill('canopyWidthM', existing.canopyWidthM);
  fill('lai', existing.lai);
  fill('densityTier', existing.densityTier);
  fill('thicknessTier', existing.thicknessTierManual);
  return JSON.stringify(snap);
}

export async function persistMomentInTx(
  active: DaterraDatabase,
  ownerId: string,
  cultureId: number,
  cultureBase: ProfileCulture,
  m: SaveCultureMomentInput,
  hasPendingCustomOption: boolean | undefined,
  nowIso: string
): Promise<number> {
  const metrics = evaluateCultureMomentMetrics({
    rowDistanceM: cultureBase.row_distance_m,
    canopyHeightM: m.canopyHeightM,
    canopyWidthM: m.canopyWidthM,
    cultureKey: cultureBase.culture_key,
    conductionKey: cultureBase.conduction_option_id,
    hasPendingCustomOption
  });
  const snapshotJson = JSON.stringify(buildMomentSnapshot(cultureBase, { ...m, metrics }));
  const nextMomentBody = stripUndefinedFields({
    userId: ownerId,
    cultureId,
    observedAt: m.observedAt,
    stageOptionId: m.stageOptionId,
    stageLabel: m.stageLabel,
    stageCode: m.stageCode,
    canopyHeightM: m.canopyHeightM,
    canopyWidthM: m.canopyWidthM,
    thicknessTierManual: m.thicknessTierManual ?? metrics.derivedThicknessTier,
    densityTier: m.densityTier,
    lai: m.lai,
    measurementSource: m.measurementSource,
    copiedFromMomentId: m.copiedFromMomentId,
    snapshotJson,
    updatedAt: nowIso
  }) as ProfileCropMoment;

  if (m.momentId) {
    const existingMoment = await active.profile_crop_moments.get(m.momentId);
    if (!isOwnedByUser(existingMoment, ownerId) || existingMoment.cultureId !== cultureId) {
      throw new Error('Momento não encontrado para esta cultura.');
    }
    const changedFields = REVISION_TRACKED_FIELDS.filter(
      (key) => (existingMoment[key] ?? null) !== (nextMomentBody[key] ?? null)
    );
    if (changedFields.length > 0) {
      await active.profile_moment_revisions.add({
        userId: ownerId,
        cultureId,
        momentId: m.momentId,
        previousStageLabel: existingMoment.stageLabel,
        newStageLabel: m.stageLabel,
        previousObservedAt: existingMoment.observedAt ?? null,
        newObservedAt: m.observedAt ?? null,
        reason: m.revisionReason?.trim() || 'Revisão de momento registada pelo utilizador',
        snapshotBeforeJson: snapshotBeforeWithRowFallback(existingMoment),
        snapshotAfterJson: snapshotJson,
        changedFields: [...changedFields],
        createdAt: nowIso
      });
    }
    await active.profile_crop_moments.put({
      ...nextMomentBody,
      id: m.momentId,
      createdAt: existingMoment.createdAt
    });
    return m.momentId;
  }

  return (await active.profile_crop_moments.add({
    ...nextMomentBody,
    createdAt: nowIso
  })) as number;
}
