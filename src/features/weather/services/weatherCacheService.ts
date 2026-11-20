// src/features/weather/services/weatherCacheService.ts
import type { FullWeatherData } from '../types';

export const WEATHER_CACHE_STORE_KEY = 'DATERRA_WEATHER_CACHE_STORE_V2';
export const LEGACY_CACHE_KEY = 'DATERRA_WEATHER_CACHE_V2';
export const CACHE_DURATION_MS = 20 * 60 * 1000; // 20 minutos
export const MAX_CACHE_ENTRIES = 15;

export interface WeatherCacheEntry {
  data: FullWeatherData;
  cachedAt: number;
}

export interface WeatherCacheStoreData {
  entries: Record<string, WeatherCacheEntry>;
  lruKeys: string[];
}

export function getCoordinatesKey(lat: number, lon: number): string {
  return `${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
}

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    // Storage desativado ou restrito por permissões
  }
  return null;
}

export function getCachedWeatherData(
  lat: number,
  lon: number,
  maxAgeMs = CACHE_DURATION_MS
): { data: FullWeatherData; isFresh: boolean } | null {
  const storage = getSafeStorage();
  if (!storage) return null;

  const key = getCoordinatesKey(lat, lon);

  // 1. Tentar ler do repositório particionado V1
  try {
    const raw = storage.getItem(WEATHER_CACHE_STORE_KEY);
    if (raw) {
      const store: WeatherCacheStoreData = JSON.parse(raw);
      const entry = store.entries?.[key];
      if (entry && entry.data) {
        // Validação geográfica estrita (nunca devolver localidade A para localidade B)
        const isExactMatch =
          Math.abs(entry.data.latitude - lat) < 0.005 &&
          Math.abs(entry.data.longitude - lon) < 0.005;

        if (isExactMatch) {
          const hasHourlyWindDir = !entry.data.hourly?.length || entry.data.hourly[0].windDirectionDeg !== undefined;
          const isFresh = hasHourlyWindDir && Date.now() - entry.cachedAt < maxAgeMs;
          return { data: entry.data, isFresh };
        }
      }
    }
  } catch (err) {
    console.warn('[WeatherCache] Erro ao ler cache particionada, recuperando com segurança:', err);
  }

  // 2. Compatibilidade estrita com cache legada V2 (apenas se coordenadas baterem)
  try {
    const legacyRaw = storage.getItem(LEGACY_CACHE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (
        legacy &&
        typeof legacy.latitude === 'number' &&
        typeof legacy.longitude === 'number'
      ) {
        const isMatch =
          Math.abs(legacy.latitude - lat) < 0.005 &&
          Math.abs(legacy.longitude - lon) < 0.005;

        if (isMatch) {
          const fetchedAt = legacy.fetchedAt ? new Date(legacy.fetchedAt).getTime() : 0;
          const isFresh = Date.now() - fetchedAt < maxAgeMs;
          return { data: legacy, isFresh };
        }
      }
    }
  } catch {
    // Ignorar cache legada corrompida
  }

  return null;
}

export function setCachedWeatherData(data: FullWeatherData): void {
  const storage = getSafeStorage();
  if (!storage || !data || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
    return;
  }

  const key = getCoordinatesKey(data.latitude, data.longitude);

  try {
    let store: WeatherCacheStoreData = { entries: {}, lruKeys: [] };
    const raw = storage.getItem(WEATHER_CACHE_STORE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.entries === 'object' && Array.isArray(parsed.lruKeys)) {
          store = parsed;
        }
      } catch {
        // Se corrompido, reinicializa vazio
      }
    }

    // Atualizar entrada
    store.entries[key] = {
      data,
      cachedAt: Date.now()
    };

    // Atualizar LRU (remover se já existia e colocar no fim)
    store.lruKeys = store.lruKeys.filter((k) => k !== key);
    store.lruKeys.push(key);

    // Expulsão LRU se exceder o limite de 15 localidades
    while (store.lruKeys.length > MAX_CACHE_ENTRIES) {
      const oldestKey = store.lruKeys.shift();
      if (oldestKey) {
        delete store.entries[oldestKey];
      }
    }

    storage.setItem(WEATHER_CACHE_STORE_KEY, JSON.stringify(store));
  } catch (err) {
    // QuotaExceededError ou localStorage indisponível
    console.warn('[WeatherCache] Falha ao persistir cache local (quota cheia):', err);
  }
}

export function clearWeatherCache(): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.removeItem(WEATHER_CACHE_STORE_KEY);
    storage.removeItem(LEGACY_CACHE_KEY);
  } catch {
    // silencia
  }
}
