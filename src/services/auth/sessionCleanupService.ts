/**
 * DATERRA Smart - Serviço de Limpeza de Sessão e Isolamento Local (SEC-04 & SEC-16)
 * Garante Zero-Leakage ao terminar sessão em dispositivos partilhados na exploração.
 * (< 200 LOC)
 */

import { db as defaultDb, type DaterraDatabase } from '../../db/db.ts';

export const SENSITIVE_LOCAL_STORAGE_KEYS = [
  'daterra_auth',
  'daterra_pending_auth',
  'daterra_cobranding_config',
  'daterra_co_branding',
  'daterra_pre_inspection_history_v1',
  'DATERRA_ACTIVE_WEATHER_LOCATION',
  'DATERRA_WEATHER_CACHE_STORE_V1',
  'DATERRA_WEATHER_CACHE_V2',
  'DATERRA_FREGUESIA_COORDS_CACHE_V1',
  'DATERRA_ACTIVE_NOZZLE_PROFILE',
  'daterra_chat_subscriptions',
  'daterra_simulated_tier',
  'daterra_mock_env'
] as const;

export const PRESERVED_DEVICE_STORAGE_KEYS = [
  'daterra_language',
  'daterra_theme'
] as const;

export interface CleanupSessionOptions {
  purgeAll?: boolean;
}

/**
 * Remove todas as chaves sensíveis de localStorage sem afetar preferências da máquina.
 */
export function clearSensitiveLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    for (const key of SENSITIVE_LOCAL_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn('[SessionCleanup] Falha ao limpar chaves sensíveis de localStorage:', err);
  }
}

/**
 * Limpa registos de utilizador no IndexedDB (DaterraSmartDB) mantendo intactos
 * os dicionários do sistema (microlearning_content, active_substances, installed_tools).
 */
export async function clearUserIndexedDbData(
  userId?: string,
  options?: CleanupSessionOptions,
  db: DaterraDatabase = defaultDb
): Promise<void> {
  const isPurgeAll = Boolean(options?.purgeAll);
  const targetUserIdCheck = userId?.trim();
  if (!targetUserIdCheck && !isPurgeAll) return;
  const targetUserId = userId?.trim();

  // Lista estrita de tabelas de utilizador / exploração agrícola com índice userId
  const userTables = [
    db.calculation_history,
    db.calculation_history_v2,
    db.calibration_profiles,
    db.mix_history,
    db.eppo_history,
    db.profiles_cultures,
    db.profile_crop_moments,
    db.profile_moment_revisions,
    db.profile_custom_options,
    db.profiles_equipment,
    db.profiles_nozzles,
    db.profiles_calibrations,
    db.mutation_outbox
  ];

  try {
    await db.transaction('rw', [...userTables, db.equipments], async () => {
      for (const table of userTables) {
        if (isPurgeAll) {
          await table.clear();
        } else if (targetUserId) {
          // Apaga todos os registos pertencentes ao utilizador que está a fechar sessão
          await table.where('userId').equals(targetUserId).delete();
        }
      }

      // Tabela v12 `equipments` não indexa `userId`: filtro seguro sem alterar schema v12
      if (isPurgeAll) {
        await db.equipments.clear();
      } else if (targetUserId) {
        await db.equipments.filter((row) => row.userId === targetUserId).delete();
      }
    });
  } catch (err) {
    console.warn('[SessionCleanup] Aviso ao purgar tabelas de utilizador no Dexie:', err);
  }
}

/**
 * Executa o ciclo completo de desinfeção local na saída (logout):
 * 1. Purgar credenciais e caches no localStorage
 * 2. Purgar dados de sessão no IndexedDB
 * 3. Preservar definições globais do dispositivo (idioma e tema)
 */
export async function clearLocalSessionData(
  userId?: string,
  options?: CleanupSessionOptions
): Promise<{ success: boolean }> {
  try {
    clearSensitiveLocalStorage();
    await clearUserIndexedDbData(userId, options);
    return { success: true };
  } catch (err) {
    console.error('[SessionCleanup] Erro durante a limpeza de sessão local:', err);
    return { success: false };
  }
}
