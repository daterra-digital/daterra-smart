// src/features/weather/services/weatherTimeService.ts
import { useSyncExternalStore } from 'react';

let mockNow: Date | null = null;
const listeners = new Set<() => void>();
let timerId: ReturnType<typeof setTimeout> | null = null;
let lastNotifiedHourIso = '';

export function setMockNow(d: Date | string | null): void {
  mockNow = d ? new Date(d) : null;
  notifyListeners(true);
}

export function getEffectiveNow(): Date {
  return mockNow ? new Date(mockNow.getTime()) : new Date();
}

export function formatLocalHourIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:00`;
}

export function formatLocalDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function filterFutureHours<T extends { timeIso: string }>(
  pool: T[],
  currentHourIso: string,
  limit: number = 48
): T[] {
  if (!pool || pool.length === 0) return [];
  const idx = pool.findIndex((h) => h.timeIso >= currentHourIso);
  if (idx === -1) {
    return [];
  }
  return pool.slice(idx, idx + limit);
}

function notifyListeners(force = false) {
  const currentHour = formatLocalHourIso(getEffectiveNow());
  if (force || currentHour !== lastNotifiedHourIso) {
    lastNotifiedHourIso = currentHour;
    for (const l of listeners) {
      l();
    }
  }
}

function scheduleTimer() {
  if (timerId) clearTimeout(timerId);
  if (listeners.size === 0) return;

  const now = getEffectiveNow();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;

  timerId = setTimeout(() => {
    notifyListeners();
    scheduleTimer();
  }, Math.max(1000, msUntilNextMinute));
}

function onVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    notifyListeners(true);
  }
}

function onWindowFocus() {
  notifyListeners(true);
}

export function subscribeToWeatherTime(listener: () => void): () => void {
  listeners.add(listener);

  if (listeners.size === 1) {
    lastNotifiedHourIso = formatLocalHourIso(getEffectiveNow());
    scheduleTimer();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onWindowFocus);
    }
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onWindowFocus);
      }
    }
  };
}

export function getEffectiveHourIso(): string {
  return formatLocalHourIso(getEffectiveNow());
}

export function getEffectiveDateIso(): string {
  return formatLocalDateIso(getEffectiveNow());
}

export function useWeatherTime(): string {
  return useSyncExternalStore(
    subscribeToWeatherTime,
    getEffectiveHourIso,
    getEffectiveHourIso
  );
}
