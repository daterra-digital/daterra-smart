// src/features/weather/services/parcelWeatherResolver.ts
import { db, type ProfileCulture } from '../../../db/db.ts';
import { isValidOwnerId } from '../../perfis/services/profileOwnership.ts';
import type { WeatherAuditSnapshot } from '../../../types/calibration-audit.ts';
import { calculateDeltaT, calculateDewPoint, calculateVpd, evaluateSprayWindow } from '../weatherCalculations.ts';
import { getCachedWeatherData, setCachedWeatherData } from './weatherCacheService.ts';
import type { FullWeatherData, HourlyForecastItem } from '../types.ts';

export interface ParcelWeatherResolution {
  snapshot: WeatherAuditSnapshot;
  temperatureC: number | null;
  locationLabel: string;
  next6hSummaryPt: string | null;
  source: 'CACHE' | 'OPEN_METEO_LIVE';
}

const isFin = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const fmt1 = (v: number): string => v.toFixed(1).replace('.', ',');

async function geocodeNamePt(name: string): Promise<{ latitude: number; longitude: number } | null> {
  const clean = name.trim();
  if (!clean) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=5&language=pt&format=json&countryCode=PT`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: Array<{ latitude?: number; longitude?: number }> };
  const first = json.results?.[0];
  return isFin(first?.latitude) && isFin(first?.longitude) ? { latitude: first.latitude, longitude: first.longitude } : null;
}

async function resolveAndPersistCoords(culture: ProfileCulture): Promise<{ latitude: number; longitude: number; label: string } | null> {
  const label = culture.parish || culture.municipality || culture.location || culture.admin_region || culture.name;
  if (isFin(culture.latitude) && isFin(culture.longitude)) {
    return { latitude: culture.latitude, longitude: culture.longitude, label };
  }
  if (typeof navigator === 'undefined' || !navigator.onLine) return null;
  const candidates = [culture.parish, culture.municipality, culture.location, culture.admin_region].filter((s): s is string => Boolean(s && s.trim()));
  for (const cand of candidates) {
    try {
      const hit = await geocodeNamePt(cand);
      if (hit) {
        if (culture.id && isValidOwnerId(culture.userId)) {
          await db.profiles_cultures.update(culture.id, { latitude: hit.latitude, longitude: hit.longitude });
        }
        return { ...hit, label: cand };
      }
    } catch { /* tenta próximo candidato */ }
  }
  return null;
}

function summarizeNext6h(hours: Array<{ windMs: number | null; deltaT: number | null }>): string | null {
  const slice = hours.slice(0, 6);
  const winds = slice.map((h) => h.windMs).filter(isFin);
  const dts = slice.map((h) => h.deltaT).filter(isFin);
  if (winds.length === 0 && dts.length === 0) return null;
  const wPart = winds.length > 0 ? `Vento ${fmt1(Math.min(...winds))}–${fmt1(Math.max(...winds))} m/s` : '';
  const dtPart = dts.length > 0 ? `ΔT máx. ${fmt1(Math.max(...dts))} °C` : '';
  return [wPart, dtPart].filter(Boolean).join(' · ');
}

function buildFromCached(data: FullWeatherData, fallbackLabel: string): ParcelWeatherResolution {
  const cur = data.current;
  const q = cur.telemetryQuality;
  const wKmh = q ? q.rawWindSpeedKmh : (isFin(cur.windSpeedKmh) ? cur.windSpeedKmh : null);
  const gKmh = q ? (q.isGustEstimated ? null : q.rawWindGustsKmh) : (isFin(cur.windGustsKmh) ? cur.windGustsKmh : null);
  const tempC = q ? q.rawTemperatureC : (isFin(cur.temperatureC) ? cur.temperatureC : null);
  const rh = q ? q.rawHumidityPercent : (isFin(cur.humidityPercent) ? cur.humidityPercent : null);
  const deltaT = isFin(cur.deltaT) ? cur.deltaT : (tempC !== null && rh !== null ? calculateDeltaT(tempC, rh) : null);
  const vpd = isFin(cur.vpdKpa) ? cur.vpdKpa : (tempC !== null && rh !== null ? calculateVpd(tempC, rh) : null);
  const hourly = (data.hourlyFull ?? data.hourly ?? []).slice(0, 6).map((h) => ({
    windMs: isFin(h.windSpeedKmh) ? h.windSpeedKmh / 3.6 : null,
    deltaT: isFin(h.deltaT) ? h.deltaT : null
  }));
  return {
    snapshot: {
      ventoMs: wKmh !== null ? Math.round((wKmh / 3.6) * 100) / 100 : null,
      rajadaMs: gKmh !== null ? Math.round((gKmh / 3.6) * 100) / 100 : null,
      deltaT, vpd, precipitacaoMm: q ? q.rawPrecipitationMm : (isFin(cur.precipitationMm) ? cur.precipitationMm : null),
      observadoEm: cur.updatedAt || data.fetchedAt || null, localidade: data.locationName || fallbackLabel, origemDados: 'CACHE'
    },
    temperatureC: tempC, locationLabel: fallbackLabel, next6hSummaryPt: summarizeNext6h(hourly), source: 'CACHE'
  };
}

/**
 * Geocodifica a freguesia/concelho da parcela (se necessário) e resolve meteorologia real Open-Meteo (cache 20 min ou live).
 * Devolve estritamente null quando offline e sem cache válida.
 */
export async function resolveParcelWeatherSnapshot(culture: ProfileCulture | null): Promise<ParcelWeatherResolution | null> {
  if (!culture) return null;
  const coords = await resolveAndPersistCoords(culture);
  if (!coords) return null;

  const cached = getCachedWeatherData(coords.latitude, coords.longitude);
  if (cached?.isFresh) return buildFromCached(cached.data, coords.label);
  if (typeof navigator === 'undefined' || !navigator.onLine) return null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m&hourly=wind_speed_10m,temperature_2m,relative_humidity_2m&wind_speed_unit=ms&forecast_hours=6`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current?: { time?: string; temperature_2m?: number; relative_humidity_2m?: number; wind_speed_10m?: number; wind_gusts_10m?: number };
      hourly?: { time?: string[]; wind_speed_10m?: number[]; temperature_2m?: number[]; relative_humidity_2m?: number[] };
    };
    const cur = json.current;
    const ventoMs = isFin(cur?.wind_speed_10m) ? cur.wind_speed_10m : null;
    const rajadaMs = isFin(cur?.wind_gusts_10m) ? cur.wind_gusts_10m : null;
    const tempC = isFin(cur?.temperature_2m) ? cur.temperature_2m : null;
    const rh = isFin(cur?.relative_humidity_2m) ? cur.relative_humidity_2m : null;
    const deltaT = tempC !== null && rh !== null ? calculateDeltaT(tempC, rh) : null;
    const vpd = tempC !== null && rh !== null ? calculateVpd(tempC, rh) : null;

    const times = json.hourly?.time ?? [];
    const hWinds = json.hourly?.wind_speed_10m ?? [];
    const hTemps = json.hourly?.temperature_2m ?? [];
    const hRhs = json.hourly?.relative_humidity_2m ?? [];
    const hourlyPairs = times.slice(0, 6).map((_, i) => {
      const wMs = isFin(hWinds[i]) ? hWinds[i] : null;
      const tC = isFin(hTemps[i]) ? hTemps[i] : null;
      const rH = isFin(hRhs[i]) ? hRhs[i] : null;
      return { windMs: wMs, deltaT: tC !== null && rH !== null ? calculateDeltaT(tC, rH) : null, tC, rH, time: times[i] };
    });

    if (ventoMs !== null && tempC !== null && rh !== null && deltaT !== null && vpd !== null) {
      const nowIso = cur?.time || new Date().toISOString();
      const windKmh = Math.round(ventoMs * 3.6 * 10) / 10;
      const gustKmh = rajadaMs !== null ? Math.round(rajadaMs * 3.6 * 10) / 10 : windKmh;
      const hourlyItems: HourlyForecastItem[] = hourlyPairs.map((h) => {
        const wK = h.windMs !== null ? Math.round(h.windMs * 3.6 * 10) / 10 : windKmh;
        const dT = h.deltaT ?? deltaT;
        const t = h.tC ?? tempC;
        const r = h.rH ?? rh;
        return {
          timeIso: h.time, timeFormatted: h.time.slice(11, 16) || '00:00', temperatureC: t, humidityPercent: r,
          dewPointC: calculateDewPoint(t, r), deltaT: dT, vpdKpa: calculateVpd(t, r), windSpeedKmh: wK,
          windGustsKmh: wK, precipitationProbability: 0, precipitationMm: 0, weatherCode: 0, weatherLabel: 'Céu Limpo',
          sprayEvaluation: evaluateSprayWindow(dT, wK, wK, r, 0)
        };
      });
      setCachedWeatherData({
        locationName: coords.label, latitude: coords.latitude, longitude: coords.longitude, fetchedAt: new Date().toISOString(),
        current: {
          temperatureC: tempC, apparentTempC: tempC, humidityPercent: rh, windSpeedKmh: windKmh, windDirectionDeg: 0,
          windDirectionText: 'N', windGustsKmh: gustKmh, precipitationMm: 0, weatherCode: 0, weatherLabel: 'Céu Limpo',
          dewPointC: calculateDewPoint(tempC, rh), deltaT, vpdKpa: vpd,
          sprayEvaluation: evaluateSprayWindow(deltaT, windKmh, gustKmh, rh, 0), updatedAt: nowIso
        },
        hourly: hourlyItems, hourlyFull: hourlyItems, daily: [],
        bioclimatic: { deltaT, vpdKpa: vpd, dewPointC: calculateDewPoint(tempC, rh), et0MmDay: 0, rainNextHoursMm: 0 }
      });
    }

    return {
      snapshot: { ventoMs, rajadaMs, deltaT, vpd, precipitacaoMm: null, observadoEm: cur?.time || new Date().toISOString(), localidade: coords.label, origemDados: 'LIVE' },
      temperatureC: tempC, locationLabel: coords.label, next6hSummaryPt: summarizeNext6h(hourlyPairs), source: 'OPEN_METEO_LIVE'
    };
  } catch {
    return null;
  }
}
