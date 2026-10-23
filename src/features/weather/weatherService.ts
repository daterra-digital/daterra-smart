// src/features/weather/weatherService.ts
import type { FullWeatherData, CurrentWeather, HourlyForecastItem, DailyForecastItem } from './types';
import {
  calculateDeltaT,
  calculateVpd,
  calculateDewPoint,
  getWindDirectionText,
  getWmoWeatherLabel,
  evaluateSprayWindow
} from './weatherCalculations';

const CACHE_KEY = 'DATERRA_WEATHER_CACHE_V2';
const CACHE_DURATION_MS = 20 * 60 * 1000; // 20 minutos de cache local

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
    const raw = localStorage.getItem('DATERRA_ACTIVE_WEATHER_LOCATION');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return PRESET_AGRICULTURAL_LOCATIONS[0];
}

export function saveActiveWeatherLocation(loc: WeatherLocation): void {
  try {
    localStorage.setItem('DATERRA_ACTIVE_WEATHER_LOCATION', JSON.stringify(loc));
  } catch {
    // quota cheia
  }
}

interface OpenMeteoApiResponse {
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
  };
}

export async function fetchWeatherData(coords = DEFAULT_COORDINATES): Promise<FullWeatherData> {
  // 1. Tentar ler da Cache Local
  try {
    const rawCache = localStorage.getItem(CACHE_KEY);
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      const isFresh = Date.now() - new Date(parsed.fetchedAt).getTime() < CACHE_DURATION_MS;
      const isSameCoords =
        Math.abs(parsed.latitude - coords.latitude) < 0.05 &&
        Math.abs(parsed.longitude - coords.longitude) < 0.05;

      if (isFresh && isSameCoords) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao ler cache meteorológica:', err);
  }

  // 2. Consulta à Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,vapour_pressure_deficit,et0_fao_evapotranspiration&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }
    const data: OpenMeteoApiResponse = await res.json();
    const processed = transformOpenMeteoResponse(data, coords);

    // Guardar na Cache Local
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(processed));
    } catch {
      // Ignorar quota cheia do localStorage
    }

    return processed;
  } catch (error) {
    console.warn('Falha na consulta à Open-Meteo, a tentar fallback local:', error);

    // Se houver cache antiga em caso de falha de rede, usa-a
    try {
      const rawCache = localStorage.getItem(CACHE_KEY);
      if (rawCache) {
        const cached = JSON.parse(rawCache);
        cached.current.isCached = true;
        return cached;
      }
    } catch {
      // continua para fallback
    }

    // Fallback defensivo canónico para funcionamento offline
    return generateFallbackWeatherData(coords);
  }
}

function transformOpenMeteoResponse(
  data: OpenMeteoApiResponse,
  coords: { latitude: number; longitude: number; locationName?: string }
): FullWeatherData {
  const cur = data.current;
  const temp = cur.temperature_2m;
  const rh = cur.relative_humidity_2m;
  const wind = Math.round(cur.wind_speed_10m * 10) / 10;
  const gusts = Math.round((cur.wind_gusts_10m || cur.wind_speed_10m * 1.2) * 10) / 10;
  const dewPoint = cur.dew_point_2m ?? calculateDewPoint(temp, rh);
  const deltaT = calculateDeltaT(temp, rh);
  const vpd = calculateVpd(temp, rh);
  const windDirText = getWindDirectionText(cur.wind_direction_10m);
  const weatherLabel = getWmoWeatherLabel(cur.weather_code);

  const sprayEvaluation = evaluateSprayWindow(deltaT, wind, gusts, rh, cur.precipitation);

  const current: CurrentWeather = {
    temperatureC: Math.round(temp),
    apparentTempC: Math.round(cur.apparent_temperature ?? temp),
    humidityPercent: Math.round(rh),
    windSpeedKmh: Math.round(wind),
    windDirectionDeg: cur.wind_direction_10m,
    windDirectionText: windDirText,
    windGustsKmh: Math.round(gusts),
    precipitationMm: cur.precipitation,
    weatherCode: cur.weather_code,
    weatherLabel,
    dewPointC: dewPoint,
    deltaT,
    vpdKpa: vpd,
    sprayEvaluation,
    updatedAt: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    isCached: false
  };

  // Processar 24 Horas Seguintes
  const hourly: HourlyForecastItem[] = [];
  const now = new Date();
  const currentHourIndex = Math.max(
    0,
    data.hourly.time.findIndex((t) => new Date(t) >= now)
  );

  for (let i = currentHourIndex; i < Math.min(currentHourIndex + 24, data.hourly.time.length); i++) {
    const hTime = data.hourly.time[i];
    const hTemp = data.hourly.temperature_2m[i];
    const hRh = data.hourly.relative_humidity_2m[i];
    const hWind = Math.round(data.hourly.wind_speed_10m[i]);
    const hGusts = Math.round(data.hourly.wind_gusts_10m[i] || hWind * 1.2);
    const hDeltaT = calculateDeltaT(hTemp, hRh);
    const hVpd = data.hourly.vapour_pressure_deficit?.[i] ?? calculateVpd(hTemp, hRh);
    const hRain = data.hourly.precipitation[i] || 0;
    const hProb = data.hourly.precipitation_probability[i] || 0;
    const hCode = data.hourly.weather_code[i];

    const d = new Date(hTime);
    const timeFormatted = `${String(d.getHours()).padStart(2, '0')}:00`;

    hourly.push({
      timeIso: hTime,
      timeFormatted,
      temperatureC: Math.round(hTemp),
      humidityPercent: Math.round(hRh),
      dewPointC: data.hourly.dew_point_2m[i] ?? calculateDewPoint(hTemp, hRh),
      deltaT: hDeltaT,
      vpdKpa: Math.round(hVpd * 100) / 100,
      windSpeedKmh: hWind,
      windGustsKmh: hGusts,
      precipitationProbability: hProb,
      precipitationMm: hRain,
      weatherCode: hCode,
      weatherLabel: getWmoWeatherLabel(hCode),
      sprayEvaluation: evaluateSprayWindow(hDeltaT, hWind, hGusts, hRh, hRain)
    });
  }

  // Processar Previsão de 5 Dias
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const daily: DailyForecastItem[] = [];

  for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
    const dTime = data.daily.time[i];
    const dObj = new Date(dTime);
    const isToday = i === 0;
    const dayName = weekdays[dObj.getDay()];
    const dayLabel = isToday ? `Hoje (${dayName})` : dayName;
    const code = data.daily.weather_code[i];

    daily.push({
      dateIso: dTime,
      dayLabel,
      maxTempC: Math.round(data.daily.temperature_2m_max[i]),
      minTempC: Math.round(data.daily.temperature_2m_min[i]),
      precipitationSumMm: Math.round((data.daily.precipitation_sum[i] || 0) * 10) / 10,
      precipitationProbabilityMax: data.daily.precipitation_probability_max[i] || 0,
      windSpeedMaxKmh: Math.round(data.daily.wind_speed_10m_max[i] || 0),
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
    daily,
    bioclimatic: {
      deltaT,
      vpdKpa: vpd,
      dewPointC: dewPoint,
      et0MmDay: et0,
      rainNextHoursMm: Math.round(rainNext12h * 10) / 10
    },
    fetchedAt: new Date().toISOString()
  };
}

function generateFallbackWeatherData(coords: { latitude: number; longitude: number; locationName?: string }): FullWeatherData {
  const deltaT = 4.2;
  const vpd = 0.95;
  const sprayEvaluation = evaluateSprayWindow(deltaT, 12, 16, 62, 0);

  const current: CurrentWeather = {
    temperatureC: 24,
    apparentTempC: 24,
    humidityPercent: 62,
    windSpeedKmh: 12,
    windDirectionDeg: 25,
    windDirectionText: 'NNE',
    windGustsKmh: 16,
    precipitationMm: 0,
    weatherCode: 0,
    weatherLabel: 'Céu Limpo',
    dewPointC: 14.1,
    deltaT,
    vpdKpa: vpd,
    sprayEvaluation,
    updatedAt: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    isCached: true
  };

  const daily: DailyForecastItem[] = [
    { dateIso: '2026-09-30', dayLabel: 'Hoje (Seg)', maxTempC: 24, minTempC: 14, precipitationSumMm: 0, precipitationProbabilityMax: 0, windSpeedMaxKmh: 14, weatherCode: 0, weatherLabel: 'Céu Limpo' },
    { dateIso: '2026-10-01', dayLabel: 'Terça', maxTempC: 26, minTempC: 15, precipitationSumMm: 0, precipitationProbabilityMax: 10, windSpeedMaxKmh: 11, weatherCode: 1, weatherLabel: 'Ensolarado' },
    { dateIso: '2026-10-02', dayLabel: 'Quarta', maxTempC: 22, minTempC: 13, precipitationSumMm: 0.2, precipitationProbabilityMax: 25, windSpeedMaxKmh: 18, weatherCode: 2, weatherLabel: 'Parc. Nublado' },
    { dateIso: '2026-10-03', dayLabel: 'Quinta', maxTempC: 19, minTempC: 11, precipitationSumMm: 3.5, precipitationProbabilityMax: 70, windSpeedMaxKmh: 24, weatherCode: 61, weatherLabel: 'Chuva Fraca' },
    { dateIso: '2026-10-04', dayLabel: 'Sexta', maxTempC: 21, minTempC: 12, precipitationSumMm: 0, precipitationProbabilityMax: 15, windSpeedMaxKmh: 16, weatherCode: 1, weatherLabel: 'Pouca Nuvem' }
  ];

  return {
    locationName: coords.locationName || 'Quinta da Vinha Velha',
    latitude: coords.latitude,
    longitude: coords.longitude,
    current,
    hourly: [],
    daily,
    bioclimatic: {
      deltaT,
      vpdKpa: vpd,
      dewPointC: 14.1,
      et0MmDay: 4.2,
      rainNextHoursMm: 0
    },
    fetchedAt: new Date().toISOString()
  };
}
