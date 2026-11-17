// src/features/perfis/services/cultureMomentStorage.ts
// Persistência transacional de Cultura, Momentos datados e Revisões (<= 200 LOC).

import type {
  CanopyDensityTierId,
  CanopyThicknessTierId,
  CultureMomentMeasurementSource,
  ProfileCropMoment,
  ProfileCulture,
  ProfileMomentRevision
} from '../../../db/types.ts';
import type { DaterraDatabase } from '../../../db/db.ts';
import { getActiveProfileDb } from './profileStorageService.ts';
import { assertValidOwnerId, isOwnedByUser, isValidOwnerId, stripUndefinedFields } from './profileOwnership.ts';
import { compareMomentsByDateAsc, isChronologicallyLatest } from './cultureDateUtils.ts';
import { parseMomentSnapshot } from './cultureEngineCompatibility.ts';
import { buildMirroredCultureRecord, persistMomentInTx } from './cultureMomentWriteHelper.ts';

export interface SaveCultureMomentInput {
  momentId?: number;
  observedAt: string | null;
  stageOptionId?: string;
  stageLabel: string;
  stageCode?: string;
  canopyHeightM?: number;
  canopyWidthM?: number;
  thicknessTierManual?: CanopyThicknessTierId;
  densityTier?: CanopyDensityTierId;
  lai?: number;
  measurementSource: CultureMomentMeasurementSource;
  copiedFromMomentId?: number;
  revisionReason?: string;
}

export interface SaveCultureWithMomentParams {
  cultureId?: number;
  culturePayload: Omit<ProfileCulture, 'id' | 'userId'>;
  momentInput?: SaveCultureMomentInput;
  markMomentAsActive?: boolean;
  hasPendingCustomOption?: boolean;
}

export async function listMomentsForCulture(
  userId: string | null | undefined,
  cultureId: number,
  targetDb?: DaterraDatabase
): Promise<ProfileCropMoment[]> {
  if (!isValidOwnerId(userId) || !cultureId) return [];
  const ownerId = userId.trim();
  const active = targetDb ?? getActiveProfileDb();
  const rows = await active.profile_crop_moments.where('[userId+cultureId]').equals([ownerId, cultureId]).toArray();
  return rows.filter((r) => isOwnedByUser(r, ownerId)).sort(compareMomentsByDateAsc);
}

export async function listRevisionsForMoment(
  userId: string | null | undefined,
  momentId: number,
  targetDb?: DaterraDatabase
): Promise<ProfileMomentRevision[]> {
  if (!isValidOwnerId(userId) || !momentId) return [];
  const ownerId = userId.trim();
  const active = targetDb ?? getActiveProfileDb();
  const rows = await active.profile_moment_revisions.where('[userId+momentId]').equals([ownerId, momentId]).toArray();
  return rows
    .filter((r) => isOwnedByUser(r, ownerId))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || (b.id ?? 0) - (a.id ?? 0));
}

export async function saveScopedCultureWithMoment(
  userId: string | null | undefined,
  params: SaveCultureWithMomentParams,
  targetDb?: DaterraDatabase
): Promise<{ cultureId: number; momentId?: number }> {
  const ownerId = assertValidOwnerId(userId);
  const active = targetDb ?? getActiveProfileDb();
  const nowIso = new Date().toISOString();

  return active.transaction(
    'rw',
    [active.profiles_cultures, active.profile_crop_moments, active.profile_moment_revisions],
    async () => {
      let cultureId = params.cultureId;
      const existingCulture = cultureId ? await active.profiles_cultures.get(cultureId) : undefined;
      if (cultureId && !isOwnedByUser(existingCulture, ownerId)) {
        throw new Error('Perfil de cultura não encontrado para esta conta.');
      }

      const cleanBase = stripUndefinedFields({
        ...existingCulture,
        ...params.culturePayload,
        userId: ownerId,
        created_at: existingCulture?.created_at ?? nowIso,
        updated_at: nowIso
      }) as ProfileCulture;
      if (params.culturePayload.area_ha === undefined) delete cleanBase.area_ha;
      if (params.culturePayload.row_distance_m === undefined) delete cleanBase.row_distance_m;

      if (!cultureId) {
        delete cleanBase.id;
        cultureId = (await active.profiles_cultures.add(cleanBase)) as number;
      } else {
        await active.profiles_cultures.put({ ...cleanBase, id: cultureId });
      }
      if (!params.momentInput) return { cultureId };

      const savedMomentId = await persistMomentInTx(
        active,
        ownerId,
        cultureId,
        cleanBase,
        params.momentInput,
        params.hasPendingCustomOption,
        nowIso
      );
      // "Momento atual": por omissão é o de data mais recente; o momento já ativo refresca sempre o espelho.
      const savedRow = await active.profile_crop_moments.get(savedMomentId);
      const siblings = (await active.profile_crop_moments.where('[userId+cultureId]').equals([ownerId, cultureId]).toArray())
        .filter((r) => isOwnedByUser(r, ownerId));
      const isCurrentlyActive = existingCulture?.active_moment_id === savedMomentId;
      const shouldActivate =
        isCurrentlyActive ||
        params.markMomentAsActive === true ||
        (params.markMomentAsActive !== false &&
          (!existingCulture?.active_moment_id || isChronologicallyLatest(savedRow?.observedAt ?? null, siblings, savedMomentId)));
      if (shouldActivate && savedMomentId) {
        const sprayLHa = savedRow ? parseMomentSnapshot(savedRow.snapshotJson)?.recommendedSprayVolumeLHa : undefined;
        await active.profiles_cultures.put(
          buildMirroredCultureRecord({ ...cleanBase, id: cultureId }, savedMomentId, params.momentInput, nowIso, sprayLHa)
        );
      }
      return { cultureId, momentId: savedMomentId };
    }
  );
}

export async function setActiveCultureMoment(
  userId: string | null | undefined,
  cultureId: number,
  momentId: number,
  targetDb?: DaterraDatabase
): Promise<boolean> {
  const ownerId = assertValidOwnerId(userId);
  const active = targetDb ?? getActiveProfileDb();
  return active.transaction('rw', [active.profiles_cultures, active.profile_crop_moments], async () => {
    const culture = await active.profiles_cultures.get(cultureId);
    const moment = await active.profile_crop_moments.get(momentId);
    if (!isOwnedByUser(culture, ownerId) || !isOwnedByUser(moment, ownerId) || moment.cultureId !== cultureId) {
      return false;
    }
    await active.profiles_cultures.put(
      buildMirroredCultureRecord(
        culture,
        momentId,
        moment,
        new Date().toISOString(),
        parseMomentSnapshot(moment.snapshotJson)?.recommendedSprayVolumeLHa
      )
    );
    return true;
  });
}
