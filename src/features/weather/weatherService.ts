// src/features/weather/weatherService.ts
import type {
  FullWeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  WeatherTelemetryQuality
} from './types.ts';
import {
  calculateDeltaT,
  calculateVpd,
  calculateDewPoint,
  getWindDirectionText,
  getWmoWeatherLabel,
  evaluateSprayWindow
} from './weatherCalculations.ts';
import {
  getCachedWeatherData,
  setCachedWeatherData
} from './services/weatherCacheService.ts';

export interface WeatherLocation {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export const PRESET_AGRICULTURAL_LOCATIONS: WeatherLocation[] = [
  { id: 'vinha_velha', name: 'Quinta da Vinha Velha', region: 'Beira Alta / Guarda', latitude: 40.5702, longitude: -7.5341 },
  { id: 'douro', name: 'Peso da Régua', region: 'Douro Vinhateiro', latitude: 41.1643, longitude: -7.7885 },
  { id: 'dao', name: 'Viseu / Dão', region: 'Região Demarcada do Dão', latitude: 40.6566, longitude: -7.9125 },
  { id: 'oeste', name: 'Torres Vedras / Bombarral', region: 'Região Oeste', latitude: 39.0918, longitude: -9.2600 },
  { id: 'ribatejo', name: 'Santarém / Alpiarça', region: 'Lezíria do Ribatejo', latitude: 39.2369, longitude: -8.6855 },
  { id: 'alentejo_evora', name: 'Évora', region: 'Alentejo Central', latitude: 38.5714, longitude: -7.9073 },
  { id: 'alentejo_beja', name: 'Beja / Alqueva', region: 'Baixo Alentejo', latitude: 38.0151, longitude: -7.8632 },
  { id: 'minho', name: 'Ponte de Lima / Monção', region: 'Vinhos Verdes / Minho', latitude: 41.7674, longitude: -8.5839 },
  { id: 'algarve', name: 'Faro / Tavira', region: 'Sotavento Algarvio', latitude: 37.0194, longitude: -7.9304 }
];

export const DEFAULT_COORDINATES = {
  latitude: PRESET_AGRICULTURAL_LOCATIONS[0].latitude,
  longitude: PRESET_AGRICULTURAL_LOCATIONS[0].longitude,
  locationName: PRESET_AGRICULTURAL_LOCATIONS[0].name
};

export function getSavedWeatherLocation(): WeatherLocation {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('DATERRA_ACTIVE_WEATHER_LOCATION') : null;
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return PRESET_AGRICULTURAL_LOCATIONS[0];
}

export function saveActiveWeatherLocation(loc: WeatherLocation): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('DATERRA_ACTIVE_WEATHER_LOCATION', JSON.stringify(loc));
    }
  } catch {
    // quota cheia
  }
}

interface OpenMeteoApiResponse {
  timezone?: string;
  utc_offset_seconds?: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    dew_point_2m?: number;
    apparent_temperature?: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    vapour_pressure_deficit?: number[];
    et0_fao_evapotranspiration?: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max?: number[];
    wind_direction_10m_dominant?: number[];
    relative_humidity_2m_mean?: number[];
  };
}

export async function fetchWeatherData(
  coords = DEFAULT_COORDINATES,
  signal?: AbortSignal,
  bypassCache = false
): Promise<FullWeatherData> {
  // 1. Tentar ler da Cache Local Particionada se não for refresh explícito
  if (!bypassCache) {
    const cached = getCachedWeatherData(coords.latitude, coords.longitude);
    if (cached?.isFresh) {
      return cached.data;
    }
  }

  // 2. Consulta à Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,vapour_pressure_deficit,et0_fao_evapotranspiration&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,relative_humidity_2m_mean&timezone=auto`;

  try {
    const fetchSignal = signal || (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(6000) : undefined);
    const res = await fetch(url, fetchSignal ? { signal: fetchSignal } : undefined);
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }
    const data: OpenMeteoApiResponse = await res.json();
    const processed = transformOpenMeteoResponse(data, coords);

    // Guardar na Cache Local Particionada
    setCachedWeatherData(processed);

    return processed;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw error;
    }

    console.warn('Falha na consulta à Open-Meteo, a verificar cache da localidade:', error);

    // Se houver cache anterior DESTA localidade específica, devolve em modo offline
    const fallbackCached = getCachedWeatherData(coords.latitude, coords.longitude, Infinity);
    if (fallbackCached?.data) {
      fallbackCached.data.current.isCached = true;
      return fallbackCached.data;
    }

    // Sem rede e sem cache para esta localidade: rejeição estrita (sem dados falsos)
    throw new Error('Previsão indisponível para esta localidade (sem ligação à rede)');
  }
}

function isFiniteNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function assessTelemetryQuality(
  rawTemp: unknown,
  rawRh: unknown,
  rawWind: unknown,
  rawGust: unknown,
  rawPrecip: unknown,
  precipTemporalKind: WeatherTelemetryQuality['precipTemporalKind']
): WeatherTelemetryQuality {
  const missingFields: string[] = [];
  if (!isFiniteNum(rawTemp)) missingFields.push('temperature_2m');
  if (!isFiniteNum(rawRh)) missingFields.push('relative_humidity_2m');
  if (!isFiniteNum(rawWind)) missingFields.push('wind_speed_10m');
  if (!isFiniteNum(rawPrecip)) missingFields.push('precipitation');
  const hasRealGustReading = isFiniteNum(rawGust);
  return {
    isComplete: missingFields.length === 0,
    isGustEstimated: !hasRealGustReading,
    hasRealGustReading,
    missingFields,
    precipUnit: 'mm',
    precipTemporalKind,
    rawTemperatureC: isFiniteNum(rawTemp) ? rawTemp : null,
    rawHumidityPercent: isFiniteNum(rawRh) ? rawRh : null,
    rawWindSpeedKmh: isFiniteNum(rawWind) ? rawWind : null,
    rawWindGustsKmh: hasRealGustReading ? rawGust : null,
    rawPrecipitationMm: isFiniteNum(rawPrecip) ? rawPrecip : null
  };
}

export function transformOpenMeteoResponse(
  data: OpenMeteoApiResponse,
  coords: { latitude: number; longitude: number; locationName?: string }
): FullWeatherData {
  const cur = data.current;
  const curQuality = assessTelemetryQuality(
    cur.temperature_2m,
    cur.relative_humidity_2m,
    cur.wind_speed_10m,
    cur.wind_gusts_10m,
    cur.precipitation,
    'current_interval_accumulated'
  );
  const temp = curQuality.rawTemperatureC ?? 0;
  const rh = curQuality.rawHumidityPercent ?? 0;
  const wind = Math.round((curQuality.rawWindSpeedKmh ?? 0) * 10) / 10;
  const gusts = Math.round(
    (curQuality.rawWindGustsKmh ?? (curQuality.rawWindSpeedKmh ?? 0) * 1.2) * 10
  ) / 10;
  const curPrecip = curQuality.rawPrecipitationMm ?? 0;
  const dewPoint = isFiniteNum(cur.dew_point_2m) ? cur.dew_point_2m : calculateDewPoint(temp, rh);
  const deltaT = calculateDeltaT(temp, rh);
  const vpd = calculateVpd(temp, rh);
  const windDirText = getWindDirectionText(cur.wind_direction_10m);
  const weatherLabel = getWmoWeatherLabel(cur.weather_code);

  const sprayEvaluation = evaluateSprayWindow(deltaT, wind, gusts, rh, curPrecip);

  const current: CurrentWeather = {
    temperatureC: Math.round(temp),
    apparentTempC: Math.round(isFiniteNum(cur.apparent_temperature) ? cur.apparent_temperature : temp),
    humidityPercent: Math.round(rh),
    windSpeedKmh: Math.round(wind),
    windDirectionDeg: cur.wind_direction_10m,
    windDirectionText: windDirText,
    windGustsKmh: Math.round(gusts),
    precipitationMm: curPrecip,
    weatherCode: cur.weather_code,
    weatherLabel,
    dewPointC: dewPoint,
    deltaT,
    vpdKpa: vpd,
    sprayEvaluation,
    updatedAt: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    isCached: false,
    telemetryQuality: curQuality
  };

  const hourlyFull: HourlyForecastItem[] = [];
  const now = new Date();
  const currentHourIndex = Math.max(
    0,
    data.hourly.time.findIndex((t) => new Date(t) >= now)
  );

  for (let i = 0; i < data.hourly.time.length; i++) {
    const hTime = data.hourly.time[i];
    const hQuality = assessTelemetryQuality(
      data.hourly.temperature_2m?.[i],
      data.hourly.relative_humidity_2m?.[i],
      data.hourly.wind_speed_10m?.[i],
      data.hourly.wind_gusts_10m?.[i],
      data.hourly.precipitation?.[i],
      'hourly_accumulated'
    );
    const hTemp = hQuality.rawTemperatureC ?? 0;
    const hRh = hQuality.rawHumidityPercent ?? 0;
    const hWind = Math.round(hQuality.rawWindSpeedKmh ?? 0);
    const hGusts = Math.round(
      hQuality.rawWindGustsKmh ?? ((hQuality.rawWindSpeedKmh ?? 0) * 1.2)
    );
    const hDeltaT = calculateDeltaT(hTemp, hRh);
    const hVpd = data.hourly.vapour_pressure_deficit?.[i] ?? calculateVpd(hTemp, hRh);
    const hRain = hQuality.rawPrecipitationMm ?? 0;
    const hProb = isFiniteNum(data.hourly.precipitation_probability?.[i]) ? data.hourly.precipitation_probability[i] : 0;
    const hCode = data.hourly.weather_code[i];

    const d = new Date(hTime);
    const timeFormatted = `${String(d.getHours()).padStart(2, '0')}:00`;

    hourlyFull.push({
      timeIso: hTime,
      timeFormatted,
      temperatureC: Math.round(hTemp),
      humidityPercent: Math.round(hRh),
      dewPointC: isFiniteNum(data.hourly.dew_point_2m?.[i]) ? data.hourly.dew_point_2m[i] : calculateDewPoint(hTemp, hRh),
      deltaT: hDeltaT,
      vpdKpa: Math.round(hVpd * 100) / 100,
      windSpeedKmh: hWind,
      windGustsKmh: hGusts,
      precipitationProbability: hProb,
      precipitationMm: hRain,
      weatherCode: hCode,
      weatherLabel: getWmoWeatherLabel(hCode),
      sprayEvaluation: evaluateSprayWindow(hDeltaT, hWind, hGusts, hRh, hRain),
      telemetryQuality: hQuality
    });
  }

  const hourly = hourlyFull.slice(currentHourIndex);

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const daily: DailyForecastItem[] = [];

  for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
    const dTime = data.daily.time[i];
    const dObj = new Date(dTime);
    const isToday = i === 0;
    const dayName = weekdays[dObj.getDay()];
    const dayLabel = isToday ? `Hoje (${dayName})` : dayName;
    const code = data.daily.weather_code[i];
    const gustsMax = data.daily.wind_gusts_10m_max?.[i] != null
      ? Math.round(data.daily.wind_gusts_10m_max[i])
      : undefined;
    const windDirDom = data.daily.wind_direction_10m_dominant?.[i] != null
      ? Math.round(data.daily.wind_direction_10m_dominant[i])
      : undefined;
    const rhMean = data.daily.relative_humidity_2m_mean?.[i] != null
      ? Math.round(data.daily.relative_humidity_2m_mean[i])
      : undefined;

    daily.push({
      dateIso: dTime,
      dayLabel,
      maxTempC: Math.round(data.daily.temperature_2m_max[i]),
      minTempC: Math.round(data.daily.temperature_2m_min[i]),
      precipitationSumMm: Math.round((data.daily.precipitation_sum[i] || 0) * 10) / 10,
      precipitationProbabilityMax: data.daily.precipitation_probability_max[i] || 0,
      windSpeedMaxKmh: Math.round(data.daily.wind_speed_10m_max[i] || 0),
      windGustsMaxKmh: gustsMax,
      windDirectionDominantDeg: windDirDom,
      relativeHumidityMeanPercent: rhMean,
      weatherCode: code,
      weatherLabel: getWmoWeatherLabel(code)
    });
  }

  const et0 = data.hourly.et0_fao_evapotranspiration?.[currentHourIndex]
    ? Math.round(data.hourly.et0_fao_evapotranspiration[currentHourIndex] * 24 * 10) / 10
    : 4.2;

  const rainNext12h = hourly.slice(0, 12).reduce((sum, h) => sum + h.precipitationMm, 0);

  return {
    locationName: coords.locationName || 'Quinta da Vinha Velha',
    latitude: coords.latitude,
    longitude: coords.longitude,
    current,
    hourly,
    hourlyFull,
    daily,
    bioclimatic: {
      deltaT,
      vpdKpa: vpd,
      dewPointC: dewPoint,
      et0MmDay: et0,
      rainNextHoursMm: Math.round(rainNext12h * 10) / 10
    },
    fetchedAt: new Date().toISOString(),
    timezone: data.timezone,
    utcOffsetSeconds: data.utc_offset_seconds
  };
}
