// src/features/perfis/services/cultureDeletionService.ts
// Eliminação segura em cascata de Cultura, momentos e revisões, preservando opções locais.

import type { DaterraDatabase } from '../../../db/db.ts';
import { isValidOwnerId, isOwnedByUser } from './profileOwnership.ts';

export interface CultureDependencyReport {
  calibrationProfilesCount: number;
  pendingSyncCount: number;
  hasBlockingDependencies: boolean;
}

export async function findCultureOperationalDependencies(
  targetDb: DaterraDatabase,
  ownerId: string,
  cultureId: number
): Promise<CultureDependencyReport> {
  const idStr = String(cultureId);
  const activeCalibs = await targetDb.calibration_profiles
    .where('userId')
    .equals(ownerId)
    .filter((p) => !p.isDeleted && p.cultureProfileId === idStr)
    .count();

  const pendingOutbox = await targetDb.mutation_outbox
    .where('userId')
    .equals(ownerId)
    .filter((m) => m.entityType === 'culture' && m.entityId === idStr && m.synced === 0)
    .count();

  return {
    calibrationProfilesCount: activeCalibs,
    pendingSyncCount: pendingOutbox,
    hasBlockingDependencies: activeCalibs > 0 || pendingOutbox > 0
  };
}

export async function deleteCultureCascadeScoped(
  targetDb: DaterraDatabase,
  ownerId: string,
  cultureId: number
): Promise<boolean> {
  if (!isValidOwnerId(ownerId) || !cultureId) return false;

  return targetDb.transaction(
    'rw',
    [
      targetDb.profiles_cultures,
      targetDb.profile_crop_moments,
      targetDb.profile_moment_revisions,
      targetDb.calibration_profiles,
      targetDb.mutation_outbox
    ],
    async () => {
      const existing = await targetDb.profiles_cultures.get(cultureId);
      if (!isOwnedByUser(existing, ownerId)) {
        return false;
      }

      const deps = await findCultureOperationalDependencies(targetDb, ownerId, cultureId);
      if (deps.hasBlockingDependencies) {
        throw new Error(
          'Não é possível eliminar esta cultura porque existem calibrações ativas ou sincronizações pendentes associadas.'
        );
      }

      const revisions = await targetDb.profile_moment_revisions
        .where('userId')
        .equals(ownerId)
        .filter((rev) => rev.cultureId === cultureId && isOwnedByUser(rev, ownerId))
        .toArray();
      for (const rev of revisions) {
        if (rev.id) {
          await targetDb.profile_moment_revisions.delete(rev.id);
        }
      }

      const moments = await targetDb.profile_crop_moments
        .where('[userId+cultureId]')
        .equals([ownerId, cultureId])
        .toArray();
      for (const mom of moments) {
        if (mom.id && isOwnedByUser(mom, ownerId)) {
          await targetDb.profile_crop_moments.delete(mom.id);
        }
      }

      await targetDb.profiles_cultures.delete(cultureId);
      return true;
    }
  );
}

export async function deleteAllUserCulturesSafely(
  targetDb: DaterraDatabase,
  ownerId: string
): Promise<{ deletedCultures: number }> {
  if (!isValidOwnerId(ownerId)) {
    throw new Error('Sessão inválida.');
  }

  return targetDb.transaction(
    'rw',
    [
      targetDb.profiles_cultures,
      targetDb.profile_crop_moments,
      targetDb.profile_moment_revisions,
      targetDb.calibration_profiles,
      targetDb.mutation_outbox
    ],
    async () => {
      const userCultures = await targetDb.profiles_cultures.where('userId').equals(ownerId).toArray();
      for (const culture of userCultures) {
        if (!culture.id || !isOwnedByUser(culture, ownerId)) continue;
        const deps = await findCultureOperationalDependencies(targetDb, ownerId, culture.id);
        if (deps.hasBlockingDependencies) {
          throw new Error(
            'Não é possível apagar os perfis de cultura porque existem calibrações ativas ou sincronizações pendentes associadas.'
          );
        }
      }

      await targetDb.profile_moment_revisions.where('userId').equals(ownerId).delete();
      await targetDb.profile_crop_moments.where('userId').equals(ownerId).delete();
      const deletedCultures = await targetDb.profiles_cultures.where('userId').equals(ownerId).delete();
      return { deletedCultures };
    }
  );
}
