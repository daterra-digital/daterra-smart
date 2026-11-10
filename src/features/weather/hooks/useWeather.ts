// src/features/weather/hooks/useWeather.ts
import { useSyncExternalStore, useCallback } from 'react';
import { weatherStore } from '../services/weatherStore';
import { PRESET_AGRICULTURAL_LOCATIONS, type WeatherLocation } from '../weatherService';

export function useWeather() {
  const state = useSyncExternalStore(
    weatherStore.subscribe,
    weatherStore.getState,
    weatherStore.getState
  );

  const selectLocation = useCallback((loc: WeatherLocation) => {
    weatherStore.selectLocation(loc);
  }, []);

  const useGpsLocation = useCallback(() => {
    weatherStore.useGpsLocation();
  }, []);

  const refreshWeather = useCallback(() => {
    weatherStore.refreshWeather();
  }, []);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    currentLocation: state.location,
    selectLocation,
    useGpsLocation,
    presetLocations: PRESET_AGRICULTURAL_LOCATIONS,
    refreshWeather
  };
}
