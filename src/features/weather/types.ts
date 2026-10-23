// src/features/weather/types.ts

export type SprayDecisionLevel = 'optimal' | 'marginal' | 'unfavorable';

export interface SprayEvaluation {
  level: SprayDecisionLevel;
  badgeLabel: string;
  title: string;
  reason: string;
  deltaT: number;
  windSpeedKmh: number;
  windGustsKmh: number;
  humidityPercent: number;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTempC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windDirectionText: string;
  windGustsKmh: number;
  precipitationMm: number;
  weatherCode: number;
  weatherLabel: string;
  dewPointC: number;
  deltaT: number;
  vpdKpa: number;
  sprayEvaluation: SprayEvaluation;
  updatedAt: string;
  isCached?: boolean;
}

export interface HourlyForecastItem {
  timeIso: string;
  timeFormatted: string; // Ex: "08:00"
  temperatureC: number;
  humidityPercent: number;
  dewPointC: number;
  deltaT: number;
  vpdKpa: number;
  windSpeedKmh: number;
  windGustsKmh: number;
  precipitationProbability: number;
  precipitationMm: number;
  weatherCode: number;
  weatherLabel: string;
  sprayEvaluation: SprayEvaluation;
}

export interface DailyForecastItem {
  dateIso: string;
  dayLabel: string; // Ex: "Hoje (Seg)", "Terça"
  maxTempC: number;
  minTempC: number;
  precipitationSumMm: number;
  precipitationProbabilityMax: number;
  windSpeedMaxKmh: number;
  weatherCode: number;
  weatherLabel: string;
}

export interface BioclimaticMetrics {
  deltaT: number;
  vpdKpa: number;
  dewPointC: number;
  et0MmDay: number;
  rainNextHoursMm: number;
}

export interface FullWeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  bioclimatic: BioclimaticMetrics;
  fetchedAt: string;
}
