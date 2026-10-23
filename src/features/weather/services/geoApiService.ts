// src/features/weather/services/geoApiService.ts
import { PORTUGAL_MUNICIPALITIES_DATA } from '../data/portugalMunicipalitiesData.ts';
import type { WeatherLocation } from '../weatherService.ts';

export interface PortugalMunicipality {
  name: string;
  code: string;
  freguesias: string[];
  longitude: number;
  latitude: number;
  distrito?: string;
}

const PORTUGAL_MUNICIPALITIES: PortugalMunicipality[] = PORTUGAL_MUNICIPALITIES_DATA as PortugalMunicipality[];

const FREG_CACHE_KEY = 'DATERRA_FREGUESIA_COORDS_CACHE_V1';

function getFregCache(): Record<string, { lat: number; lon: number }> {
  try {
    const raw = localStorage.getItem(FREG_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFregToCache(cacheKey: string, lat: number, lon: number): void {
  try {
    const cache = getFregCache();
    cache[cacheKey] = { lat, lon };
    localStorage.setItem(FREG_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota cheia ou modo anónimo
  }
}

export function getAllMunicipalities(): PortugalMunicipality[] {
  return PORTUGAL_MUNICIPALITIES;
}

export interface PortugalFreguesiaEntry {
  name: string;
  municipio: string;
  distrito: string;
}

let cachedAllFreguesias: PortugalFreguesiaEntry[] | null = null;

export function getAllFreguesias(): PortugalFreguesiaEntry[] {
  if (!cachedAllFreguesias) {
    const list: PortugalFreguesiaEntry[] = [];
    for (const m of PORTUGAL_MUNICIPALITIES) {
      const dist = m.distrito || 'Portugal';
      for (const f of m.freguesias) {
        list.push({
          name: f,
          municipio: m.name,
          distrito: dist
        });
      }
    }
    cachedAllFreguesias = list;
  }
  return cachedAllFreguesias;
}

export function findMunicipality(name: string): PortugalMunicipality | undefined {
  const norm = name.trim().toLowerCase();
  return PORTUGAL_MUNICIPALITIES.find((m) => m.name.toLowerCase() === norm);
}

/**
 * Resolve as coordenadas geográficas exatas para um município ou freguesia.
 * Dá prioridade aos dados locais (0ms) e consulta a geoapi.pt se for uma freguesia específica.
 */
export async function resolveGeoLocation(
  municipioName: string,
  freguesiaName?: string
): Promise<WeatherLocation> {
  const mun = findMunicipality(municipioName);
  const munLat = mun?.latitude ?? 40.5702;
  const munLon = mun?.longitude ?? -7.5341;
  const distrito = mun?.distrito ? `${mun.distrito}` : 'Portugal';

  if (!freguesiaName) {
    return {
      id: `mun_${mun?.code || municipioName.toLowerCase().replace(/\s+/g, '_')}`,
      name: mun?.name || municipioName,
      region: `Concelho • ${distrito}`,
      latitude: munLat,
      longitude: munLon
    };
  }

  // Resolução para Freguesia
  const cacheKey = `${municipioName}_${freguesiaName}`.toLowerCase();
  const cached = getFregCache()[cacheKey];
  if (cached) {
    return {
      id: `freg_${cacheKey.replace(/[^a-z0-9_]/g, '_')}`,
      name: freguesiaName,
      region: `${municipioName} • ${distrito}`,
      latitude: cached.lat,
      longitude: cached.lon
    };
  }

  // 1. Tentar geoapi.pt
  try {
    const url = `https://geoapi.pt/municipio/${encodeURIComponent(municipioName)}/freguesia/${encodeURIComponent(freguesiaName)}?json=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const d = await res.json();
      const coords = d.centros?.centro || d.centros?.centroide;
      if (coords && Array.isArray(coords) && coords.length >= 2) {
        const lon = Number(coords[0]);
        const lat = Number(coords[1]);
        if (!isNaN(lat) && !isNaN(lon)) {
          saveFregToCache(cacheKey, lat, lon);
          return {
            id: `freg_${cacheKey.replace(/[^a-z0-9_]/g, '_')}`,
            name: freguesiaName,
            region: `${municipioName} • ${distrito}`,
            latitude: lat,
            longitude: lon
          };
        }
      }
    }
  } catch {
    // Falha de rede ou timeout
  }

  // 2. Fallback Open-Meteo Geocoding
  try {
    const query = `${freguesiaName}, ${municipioName}`;
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&country_code=PT`;
    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3500) });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results[0]) {
        const item = geoData.results[0];
        saveFregToCache(cacheKey, item.latitude, item.longitude);
        return {
          id: `freg_${cacheKey.replace(/[^a-z0-9_]/g, '_')}`,
          name: freguesiaName,
          region: `${municipioName} • ${distrito}`,
          latitude: item.latitude,
          longitude: item.longitude
        };
      }
    }
  } catch {
    // Fallback para as coordenadas do município
  }

  // 3. Fallback seguro e robusto para funcionamento offline: coordenadas do município
  return {
    id: `freg_${cacheKey.replace(/[^a-z0-9_]/g, '_')}`,
    name: freguesiaName,
    region: `${municipioName} • ${distrito}`,
    latitude: munLat,
    longitude: munLon
  };
}
