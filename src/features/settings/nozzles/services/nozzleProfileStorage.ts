// src/features/settings/nozzles/services/nozzleProfileStorage.ts
import { db, type DaterraDatabase, type ProfileNozzle } from '../../../../db/db.ts';
import { assertValidOwnerId, isOwnedByUser, isValidOwnerId } from '../../../perfis/services/profileOwnership.ts';
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';

const NOZZLE_V1_PREFIX = 'DATERRA_NOZZLE_PROFILE_V1:';

export async function listScopedNozzleProfiles(
  userId?: string | null,
  targetDb: DaterraDatabase = db
): Promise<NozzleProfile[]> {
  if (!isValidOwnerId(userId)) return [];
  const ownerId = userId.trim();
  const rawList = await targetDb.profiles_nozzles.where('userId').equals(ownerId).toArray();
  const profiles: NozzleProfile[] = [];

  for (const raw of rawList) {
    if (!isOwnedByUser(raw, ownerId)) continue;
    if (raw.notes && raw.notes.startsWith(NOZZLE_V1_PREFIX)) {
      try {
        const parsed = JSON.parse(raw.notes.substring(NOZZLE_V1_PREFIX.length)) as NozzleProfile;
        profiles.push({ ...parsed, userId: ownerId });
      } catch (err) {
        console.warn('[NozzleProfileStorage] Erro ao parsear perfil:', err);
      }
    }
  }

  return profiles.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function saveScopedNozzleProfile(
  profile: NozzleProfile,
  userId?: string | null,
  targetDb: DaterraDatabase = db
): Promise<void> {
  const ownerId = assertValidOwnerId(userId, 'Sessão inválida: autenticação necessária para guardar perfil de bicos.');
  const scopedProfile: NozzleProfile = { ...profile, userId: ownerId };
  const mainSlot = scopedProfile.slots.find((s) => s.isActive) || scopedProfile.slots[0];
  const payloadString = NOZZLE_V1_PREFIX + JSON.stringify(scopedProfile);

  const nozzleRecord: ProfileNozzle = {
    id: scopedProfile.id as unknown as number,
    userId: ownerId,
    manufacturer: mainSlot?.brand || 'Albuz',
    model: mainSlot?.model || 'ATR',
    nozzle_type: mainSlot?.brand ? `${mainSlot.brand} ${mainSlot.model}` : 'Bico Especial',
    color: mainSlot?.color || 'Amarelo',
    spray_angle: mainSlot?.sprayAngleDeg ? `${mainSlot.sprayAngleDeg}°` : '80°',
    working_pressure_bar: scopedProfile.referencePressureBar,
    nominal_flow_lmin: scopedProfile.totalActiveFlowLMin,
    notes: payloadString
  };

  await targetDb.transaction('rw', targetDb.profiles_nozzles, async () => {
    const existing = await targetDb.profiles_nozzles.get(scopedProfile.id as unknown as number);
    if (existing && !isOwnedByUser(existing, ownerId)) {
      throw new Error('Acesso negado: perfil de bicos pertence a outra conta.');
    }
    if (existing) {
      await targetDb.profiles_nozzles.update(existing.id as unknown as number, nozzleRecord);
    } else {
      await targetDb.profiles_nozzles.put(nozzleRecord);
    }
  });
}

export async function deleteScopedNozzleProfile(
  id: string,
  targetDb: DaterraDatabase = db
): Promise<void> {
  await targetDb.profiles_nozzles.delete(id as unknown as number);
}
