// src/features/weather/services/weatherStore.ts
import type { FullWeatherData } from '../types.ts';
import {
  type WeatherLocation,
  PRESET_AGRICULTURAL_LOCATIONS,
  getSavedWeatherLocation,
  saveActiveWeatherLocation,
  fetchWeatherData
} from '../weatherService.ts';
import { getCachedWeatherData } from './weatherCacheService.ts';

export interface WeatherStoreState {
  location: WeatherLocation;
  data: FullWeatherData | null;
  isLoading: boolean;
  error: string | null;
}

class WeatherStore {
  private state: WeatherStoreState;
  private listeners: Set<() => void> = new Set();
  private currentRequestId = 0;
  private activeAbortController: AbortController | null = null;
  private isInitialized = false;

  constructor() {
    this.state = {
      location: getSavedWeatherLocation(),
      data: null,
      isLoading: false,
      error: null
    };
  }

  public getState = (): WeatherStoreState => {
    return this.state;
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    // Inicialização sob demanda na primeira subscrição se ainda não inicializado
    if (!this.isInitialized) {
      this.isInitialized = true;
      if (typeof queueMicrotask !== 'undefined') {
        queueMicrotask(() => {
          this.selectLocation(this.state.location);
        });
      } else {
        setTimeout(() => {
          this.selectLocation(this.state.location);
        }, 0);
      }
    }
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public selectLocation = async (
    loc: WeatherLocation,
    options?: { forceRefresh?: boolean }
  ): Promise<void> => {
    // 1. Concorrência: cancelar pedido em voo anterior e gerar novo ID
    const reqId = ++this.currentRequestId;
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    const abortCtrl = new AbortController();
    this.activeAbortController = abortCtrl;

    saveActiveWeatherLocation(loc);

    // 2. Consulta à cache particionada por coordenadas exatas
    const cached = getCachedWeatherData(loc.latitude, loc.longitude);
    const hasFreshCache = cached && cached.isFresh && !options?.forceRefresh;

    if (hasFreshCache) {
      this.state = {
        location: loc,
        data: cached.data,
        isLoading: false,
        error: null
      };
      this.notify();
      return;
    }

    // Se houver cache stale, exibe-a enquanto faz background refresh
    this.state = {
      location: loc,
      data: cached ? cached.data : null,
      isLoading: true,
      error: null
    };
    this.notify();

    // 3. Execução da chamada de rede com AbortSignal
    try {
      const freshData = await fetchWeatherData(
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          locationName: loc.name
        },
        abortCtrl.signal,
        options?.forceRefresh
      );

      // Concorrência: se outro pedido mais recente começou, descarta silenciosamente
      if (reqId !== this.currentRequestId) return;

      this.state = {
        location: loc,
        data: freshData,
        isLoading: false,
        error: null
      };
      this.notify();
    } catch (err: any) {
      // Concorrência: descarta cancelamentos e respostas atrasadas de pedidos antigos
      if (reqId !== this.currentRequestId || err?.name === 'AbortError') {
        return;
      }

      // Se falhar e tivermos qualquer cache anterior desta localidade específica, mantém
      const fallbackCached = getCachedWeatherData(loc.latitude, loc.longitude, Infinity);
      if (fallbackCached?.data) {
        fallbackCached.data.current.isCached = true;
        this.state = {
          location: loc,
          data: fallbackCached.data,
          isLoading: false,
          error: null
        };
      } else {
        // Sem cache para a localidade B: nunca inventa dados falsos
        this.state = {
          location: loc,
          data: null,
          isLoading: false,
          error: 'Previsão indisponível para esta localidade (sem ligação à rede)'
        };
      }
      this.notify();
    }
  };

  public refreshWeather = async (): Promise<void> => {
    return this.selectLocation(this.state.location, { forceRefresh: true });
  };

  public useGpsLocation = (): void => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      this.state = { ...this.state, isLoading: true, error: null };
      this.notify();

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsLoc: WeatherLocation = {
            id: 'gps',
            name: 'Localização Atual (GPS)',
            region: 'Dispositivo',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          this.selectLocation(gpsLoc);
        },
        () => {
          this.state = { ...this.state, isLoading: false };
          this.notify();
        },
        { timeout: 6000 }
      );
    }
  };

  public resetForTesting(initialLoc?: WeatherLocation): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    this.currentRequestId = 0;
    this.listeners.clear();
    this.isInitialized = false;
    this.state = {
      location: initialLoc || PRESET_AGRICULTURAL_LOCATIONS[0],
      data: null,
      isLoading: false,
      error: null
    };
  }
}

export const weatherStore = new WeatherStore();
