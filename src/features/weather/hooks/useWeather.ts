// src/features/weather/hooks/useWeather.ts
import { useState, useEffect, useCallback } from 'react';
import type { FullWeatherData } from '../types';
import {
  fetchWeatherData,
  getSavedWeatherLocation,
  saveActiveWeatherLocation,
  PRESET_AGRICULTURAL_LOCATIONS,
  type WeatherLocation
} from '../weatherService';

export function useWeather() {
  const [location, setLocationState] = useState<WeatherLocation>(getSavedWeatherLocation);
  const [data, setData] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (loc?: WeatherLocation) => {
    const targetLoc = loc || location;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWeatherData({
        latitude: targetLoc.latitude,
        longitude: targetLoc.longitude,
        locationName: targetLoc.name
      });
      setData(res);
    } catch (err: any) {
      console.warn('Erro ao carregar dados meteorológicos:', err);
      setError(err?.message || 'Falha ao carregar meteorologia');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  const selectLocation = useCallback((loc: WeatherLocation) => {
    setLocationState(loc);
    saveActiveWeatherLocation(loc);
    loadWeather(loc);
  }, [loadWeather]);

  const useGpsLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsLoc: WeatherLocation = {
            id: 'gps',
            name: 'Localização Atual (GPS)',
            region: 'Dispositivo',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          selectLocation(gpsLoc);
        },
        () => {
          setIsLoading(false);
        },
        { timeout: 5000 }
      );
    }
  }, [selectLocation]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return {
    data,
    isLoading,
    error,
    currentLocation: location,
    selectLocation,
    useGpsLocation,
    presetLocations: PRESET_AGRICULTURAL_LOCATIONS,
    refreshWeather: () => loadWeather()
  };
}
