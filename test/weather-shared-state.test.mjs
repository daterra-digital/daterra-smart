/**
 * DATERRA Smart - Teste de Regressão da Base Meteorológica Partilhada (T3)
 * Validação Funcional:
 * 1. Particionamento geográfico estrito da cache (Localização A nunca devolve dados de B)
 * 2. Normalização de coordenadas com 4 casas decimais (~11m de precisão)
 * 3. Limite de retenção LRU (máx 15 localidades) e resiliência a JSON corrompido
 * 4. Concorrência assíncrona e cancelamento de pedidos fora de ordem (A -> B: B prevalece)
 * 5. Rejeição de erro tardio (erro atrasado de A não afeta estado válido de B)
 * 6. Degradação offline sem dados sintéticos (offline sem cache => null com mensagem)
 * 7. Atualização manual (refreshWeather) ignora cache de frescura
 * 8. Estado reativo partilhado entre múltiplos subscritores (Dashboard + Meteorologia)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCoordinatesKey,
  getCachedWeatherData,
  setCachedWeatherData,
  WEATHER_CACHE_STORE_KEY,
  MAX_CACHE_ENTRIES
} from '../src/features/weather/services/weatherCacheService.ts';
import { weatherStore } from '../src/features/weather/services/weatherStore.ts';
import {
  PRESET_AGRICULTURAL_LOCATIONS
} from '../src/features/weather/weatherService.ts';

// Mock de localStorage em memória para o ambiente Node
class MockLocalStorage {
  #store = new Map();

  getItem(key) {
    return this.#store.get(key) ?? null;
  }
  setItem(key, value) {
    this.#store.set(key, String(value));
  }
  removeItem(key) {
    this.#store.delete(key);
  }
  clear() {
    this.#store.clear();
  }
}

// Configurar localStorage global para testes
const mockStorage = new MockLocalStorage();
globalThis.localStorage = mockStorage;

function createDummyWeatherData(loc, temp = 22) {
  return {
    locationName: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    current: {
      temperatureC: temp,
      apparentTempC: temp,
      humidityPercent: 55,
      windSpeedKmh: 10,
      windDirectionDeg: 180,
      windDirectionText: 'S',
      windGustsKmh: 14,
      precipitationMm: 0,
      weatherCode: 0,
      weatherLabel: 'Céu Limpo',
      dewPointC: 12.5,
      deltaT: 4.8,
      vpdKpa: 1.1,
      sprayEvaluation: { level: 'optimal', badgeLabel: 'Janela Ótima' },
      updatedAt: '12:00',
      isCached: false
    },
    hourly: [],
    daily: [],
    bioclimatic: {
      deltaT: 4.8,
      vpdKpa: 1.1,
      dewPointC: 12.5,
      et0MmDay: 4.0,
      rainNextHoursMm: 0
    },
    fetchedAt: new Date().toISOString()
  };
}

describe('T3 — Base Meteorológica Partilhada & Cache Geográfica', () => {
  beforeEach(() => {
    mockStorage.clear();
    weatherStore.resetForTesting();
  });

  // -------------------------------------------------------------------------
  // 1. Normalização de Coordenadas e Particionamento Geográfico
  // -------------------------------------------------------------------------
  it('1. Normalização de coordenadas para chave estável de 4 casas decimais', () => {
    const key1 = getCoordinatesKey(40.5702, -7.5341);
    const key2 = getCoordinatesKey(40.570200001, -7.534100002);
    assert.equal(key1, '40.5702,-7.5341');
    assert.equal(key1, key2, 'Coordenadas com variações de ponto flutuante devem normalizar para a mesma chave');
  });

  it('2. Cache da localidade A NUNCA é devolvida quando consultada a localidade B', () => {
    const locGuarda = PRESET_AGRICULTURAL_LOCATIONS[0]; // Vinha Velha (40.5702, -7.5341)
    const locEvora = PRESET_AGRICULTURAL_LOCATIONS[5]; // Évora (38.5714, -7.9073)

    // Guardar dados de Évora
    const evoraData = createDummyWeatherData(locEvora, 28);
    setCachedWeatherData(evoraData);

    // Consultar Vinha Velha
    const cachedGuarda = getCachedWeatherData(locGuarda.latitude, locGuarda.longitude);
    assert.equal(cachedGuarda, null, 'Cache de Évora não pode ser devolvida para a Guarda');

    // Consultar Évora
    const cachedEvora = getCachedWeatherData(locEvora.latitude, locEvora.longitude);
    assert.ok(cachedEvora !== null, 'Cache de Évora deve ser encontrada para as coordenadas de Évora');
    assert.equal(cachedEvora.data.locationName, locEvora.name);
    assert.equal(cachedEvora.data.current.temperatureC, 28);
  });

  // -------------------------------------------------------------------------
  // 2. Limite LRU e Resiliência a Corrupção de Armazenamento
  // -------------------------------------------------------------------------
  it('3. Retenção LRU limita cache ao máximo de 15 localidades expulsando a mais antiga', () => {
    for (let i = 0; i < 18; i++) {
      const loc = {
        id: `loc_${i}`,
        name: `Localidade ${i}`,
        region: 'Portugal',
        latitude: 37.0 + i * 0.1,
        longitude: -8.0 - i * 0.1
      };
      setCachedWeatherData(createDummyWeatherData(loc, 20 + i));
    }

    const raw = mockStorage.getItem(WEATHER_CACHE_STORE_KEY);
    assert.ok(raw, 'Repositório de cache deve existir em localStorage');
    const store = JSON.parse(raw);
    assert.equal(store.lruKeys.length, MAX_CACHE_ENTRIES, `LRU deve limitar a ${MAX_CACHE_ENTRIES} entradas`);
    assert.equal(Object.keys(store.entries).length, MAX_CACHE_ENTRIES);

    // As três primeiras (0, 1, 2) devem ter sido expulsas
    const loc0Key = getCoordinatesKey(37.0, -8.0);
    assert.equal(store.entries[loc0Key], undefined, 'Localidade mais antiga deve ter sido expulsa');

    // A mais recente (17) deve estar presente
    const loc17Key = getCoordinatesKey(37.0 + 17 * 0.1, -8.0 - 17 * 0.1);
    assert.ok(store.entries[loc17Key] !== undefined, 'Localidade mais recente deve permanecer');
  });

  it('4. JSON corrompido no localStorage é recuperado com segurança sem quebrar a app', () => {
    mockStorage.setItem(WEATHER_CACHE_STORE_KEY, '{ invalid_json_syntax %%%');
    // Não deve lançar exceção
    const result = getCachedWeatherData(40.5702, -7.5341);
    assert.equal(result, null, 'Cache corrompida deve resultar em null com segurança');

    // Escrita seguinte deve reinicializar estrutura limpa
    const loc = PRESET_AGRICULTURAL_LOCATIONS[0];
    setCachedWeatherData(createDummyWeatherData(loc));
    const cached = getCachedWeatherData(loc.latitude, loc.longitude);
    assert.ok(cached !== null, 'Após corrupção, nova escrita recupera estrutura válida');
  });

  // -------------------------------------------------------------------------
  // 3. Concorrência Assíncrona e Respostas Fora de Ordem
  // -------------------------------------------------------------------------
  it('5. Seleção rápida A -> B: B prevalece mesmo se resposta de A resolver mais tarde', async () => {
    const locA = PRESET_AGRICULTURAL_LOCATIONS[0]; // Vinha Velha
    const locB = PRESET_AGRICULTURAL_LOCATIONS[1]; // Peso da Régua

    let resolveA;
    let resolveB;

    const promiseA = new Promise((res) => { resolveA = res; });
    const promiseB = new Promise((res) => { resolveB = res; });

    globalThis.fetch = (url) => {
      const urlStr = String(url);
      if (urlStr.includes(`latitude=${locA.latitude}`)) {
        return promiseA.then(() => ({
          ok: true,
          json: async () => ({
            current: { time: new Date().toISOString(), temperature_2m: 15, relative_humidity_2m: 70, precipitation: 0, weather_code: 0, wind_speed_10m: 5, wind_direction_10m: 90, wind_gusts_10m: 8 },
            hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], dew_point_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], wind_direction_10m: [], wind_gusts_10m: [] },
            daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [] }
          })
        }));
      }
      if (urlStr.includes(`latitude=${locB.latitude}`)) {
        return promiseB.then(() => ({
          ok: true,
          json: async () => ({
            current: { time: new Date().toISOString(), temperature_2m: 25, relative_humidity_2m: 40, precipitation: 0, weather_code: 0, wind_speed_10m: 15, wind_direction_10m: 180, wind_gusts_10m: 20 },
            hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], dew_point_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], wind_direction_10m: [], wind_gusts_10m: [] },
            daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [] }
          })
        }));
      }
      return Promise.reject(new Error('URL desconhecido'));
    };

    // 1. Iniciar A
    const reqA = weatherStore.selectLocation(locA);
    assert.equal(weatherStore.getState().location.id, locA.id);

    // 2. Imediatamente mudar para B
    const reqB = weatherStore.selectLocation(locB);
    assert.equal(weatherStore.getState().location.id, locB.id);

    // 3. Resolver B primeiro
    resolveB();
    await reqB;

    assert.equal(weatherStore.getState().location.id, locB.id);
    assert.equal(weatherStore.getState().data?.current.temperatureC, 25);

    // 4. Resolver A mais tarde
    resolveA();
    await reqA;

    // B deve permanecer intocado; A foi descartado
    assert.equal(weatherStore.getState().location.id, locB.id);
    assert.equal(weatherStore.getState().data?.current.temperatureC, 25, 'Dados de A não podem sobrescrever B');
  });

  // -------------------------------------------------------------------------
  // 4. Rejeição de Erro Tardio
  // -------------------------------------------------------------------------
  it('6. Erro tardio de A não sobrescreve o estado de sucesso de B', async () => {
    const locA = PRESET_AGRICULTURAL_LOCATIONS[2]; // Dão
    const locB = PRESET_AGRICULTURAL_LOCATIONS[3]; // Oeste

    let rejectA;
    let resolveB;

    const promiseA = new Promise((_, rej) => { rejectA = rej; });
    const promiseB = new Promise((res) => { resolveB = res; });

    globalThis.fetch = (url) => {
      const urlStr = String(url);
      if (urlStr.includes(`latitude=${locA.latitude}`)) {
        return promiseA;
      }
      if (urlStr.includes(`latitude=${locB.latitude}`)) {
        return promiseB.then(() => ({
          ok: true,
          json: async () => ({
            current: { time: new Date().toISOString(), temperature_2m: 19, relative_humidity_2m: 60, precipitation: 0, weather_code: 0, wind_speed_10m: 10, wind_direction_10m: 90, wind_gusts_10m: 12 },
            hourly: { time: [], temperature_2m: [], relative_humidity_2m: [], dew_point_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], wind_direction_10m: [], wind_gusts_10m: [] },
            daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [] }
          })
        }));
      }
      return Promise.reject(new Error('URL desconhecido'));
    };

    const reqA = weatherStore.selectLocation(locA);
    const reqB = weatherStore.selectLocation(locB);

    // B resolve com sucesso
    resolveB();
    await reqB;
    assert.equal(weatherStore.getState().data?.current.temperatureC, 19);
    assert.equal(weatherStore.getState().error, null);

    // A falha tarde com erro de rede
    rejectA(new Error('Network Timeout A'));
    await reqA;

    // Estado deve manter B e ZERO erro
    assert.equal(weatherStore.getState().location.id, locB.id);
    assert.equal(weatherStore.getState().data?.current.temperatureC, 19);
    assert.equal(weatherStore.getState().error, null, 'Erro tardio de A não deve poluir o estado de B');
  });

  // -------------------------------------------------------------------------
  // 5. Degradação Offline sem Dados Sintéticos
  // -------------------------------------------------------------------------
  it('7. Falha de rede sem cache para localidade B define data null com erro explícito', async () => {
    const loc = PRESET_AGRICULTURAL_LOCATIONS[4]; // Ribatejo

    globalThis.fetch = () => {
      return Promise.reject(new Error('Failed to fetch (offline)'));
    };

    await weatherStore.selectLocation(loc);

    const state = weatherStore.getState();
    assert.equal(state.data, null, 'data deve ser null quando offline sem cache (sem dados falsos)');
    assert.ok(state.error?.includes('sem ligação à rede'), 'Deve conter mensagem explícita de indisponibilidade');
    assert.equal(state.isLoading, false);
  });

  it('8. Falha de rede com cache existente para localidade B preserva cache com isCached=true', async () => {
    const loc = PRESET_AGRICULTURAL_LOCATIONS[4]; // Ribatejo
    const cachedData = createDummyWeatherData(loc, 30);
    setCachedWeatherData(cachedData);

    globalThis.fetch = () => {
      return Promise.reject(new Error('Failed to fetch (offline)'));
    };

    // Forçar nova consulta para a mesma localidade simulando offline
    await weatherStore.selectLocation(loc, { forceRefresh: true });

    const state = weatherStore.getState();
    assert.ok(state.data !== null, 'Deve reter os dados da cache para esta localidade');
    assert.equal(state.data.current.temperatureC, 30);
    assert.equal(state.data.current.isCached, true, 'isCached deve ser true');
    assert.equal(state.error, null);
    assert.equal(state.isLoading, false);
  });

  // -------------------------------------------------------------------------
  // 6. Atualização Manual e Sincronização entre Subscritores
  // -------------------------------------------------------------------------
  it('9. Subscritores múltiplos partilham o mesmo estado reativo sem duplicação', async () => {
    let notifyCount1 = 0;
    let notifyCount2 = 0;

    const unsub1 = weatherStore.subscribe(() => { notifyCount1++; });
    const unsub2 = weatherStore.subscribe(() => { notifyCount2++; });

    const loc = PRESET_AGRICULTURAL_LOCATIONS[0];
    const dummy = createDummyWeatherData(loc, 21);
    setCachedWeatherData(dummy);

    await weatherStore.selectLocation(loc);

    assert.ok(notifyCount1 > 0);
    assert.equal(notifyCount1, notifyCount2, 'Ambos os subscritores devem receber as mesmas notificações');
    assert.equal(weatherStore.getState().data?.current.temperatureC, 21);

    unsub1();
    unsub2();
  });
});
