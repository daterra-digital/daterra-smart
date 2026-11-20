import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const { computeWhatIfSimulation } = await import('../src/features/weather/utils/calibrationWhatIfHelpers.ts');
const { getFavorableSprayHours } = await import('../src/features/weather/utils/sprayPresentationAdapter.ts');
const { getCachedWeatherData, setCachedWeatherData } = await import('../src/features/weather/services/weatherCacheService.ts');

describe('Simulador What-If Calibração-First, Cache Direção Vento e Concordância PT-PT', () => {
  it('1. Lei dos Orifícios (Q2 = Q1 * sqrt(P2/P1)), Q_ar ótimo 3D, piso mecânico e IRD Combinado (0-200%)', () => {
    const chain = {
      calibration: { id: 'cal-1', userId: 'u1', nomePerfil: 'Vinha', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', nozzleProfileId: 'n1', equipmentId: 'e1', cultureParcelId: 'c1', cultureMomentId: null, velocidadeKmh: 5, pressaoBar: 4, debitoTotalLMin: 10, numBicosAtivos: 10, entrelinhaM: 2.5, volumeCalibradoLHa: 480, volumeRecomendadoEppoLHa: 480, caudalArOtimoM3H: 2500, caudalArAplicadoM3H: 2500, iso16122: { desvioMaximoBicosPct: 0, simetriaEsqDirPct: 0 }, sha256Seal: 'x' },
      culture: null, cultureLabel: 'Vinha', cultureMetaLabel: 'TRV', equipmentName: 'Atomizador 3D', equipKind: '3D',
      hasAirSleeve: false, equipmentMetaLabel: 'Copa 3D', nozzleName: 'Albuz ATR', nozzleType: 'Cone vazio',
      nozzleMetaLabel: '10 bicos', nozzleCatalogId: null, nozzleBrand: 'Albuz', nozzleModel: 'ATR', driftHazardLevel: 'Alto',
      dv50Um: 150, baseSpeedKmh: 5, basePressureBar: 4, baseFlowLMin: 10, baseAirflowM3h: 2500, baseHeightVal: 1.2,
      entrelinhaM: 2.5, numBicosAtivos: 10, trvM3Ha: 5000, lwaM2Ha: null, volumeEppoLHa: 480,
      minPressureBar: 3, maxPressureBar: 12, hasAntiDrift: false
    };

    const baseSim = computeWhatIfSimulation(chain, { speedKmh: 5, pressureBar: 4, airflowM3h: 2500, heightVal: 1.2 });
    assert.equal(baseSim.scaledFlowLMin, 10);
    assert.equal(baseSim.appliedVolumeLHa, 480);
    assert.equal(baseSim.optimalAirflowM3h, 2500);

    const p9Sim = computeWhatIfSimulation(chain, { speedKmh: 5, pressureBar: 9, airflowM3h: 4000, heightVal: 1.2 });
    assert.equal(p9Sim.scaledFlowLMin, 15);
    assert.equal(p9Sim.eppoBalance.estadoVentilacao3D, 'SOBREVENTILACAO');
    assert.ok(p9Sim.combinedIrdPct > baseSim.combinedIrdPct && p9Sim.combinedIrdPct <= 200);

    const lowVol = computeWhatIfSimulation(chain, { speedKmh: 28, pressureBar: 4, airflowM3h: 2500, heightVal: 1.2 });
    assert.equal(lowVol.belowMechanicalFloor, true);
    assert.equal(lowVol.mechanicalFloorLHa, 100);
  });

  it('2. Concordância PT-PT singular vs plural em getFavorableSprayHours e invalidação de cache sem windDirectionDeg', () => {
    const oneHour = getFavorableSprayHours([
      { timeFormatted: '08:00', sprayEvaluation: { level: 'optimal', badgeLabel: 'Ótimo', title: 'Ok', reason: 'Ok', deltaT: 4, windSpeedKmh: 5, windGustsKmh: 7, humidityPercent: 60 } }
    ]);
    assert.equal(oneHour.detailText, '1 avaliação horária favorável');

    const twoHours = getFavorableSprayHours([
      { timeFormatted: '08:00', sprayEvaluation: { level: 'optimal', badgeLabel: 'Ótimo', title: 'Ok', reason: 'Ok', deltaT: 4, windSpeedKmh: 5, windGustsKmh: 7, humidityPercent: 60 } },
      { timeFormatted: '09:00', sprayEvaluation: { level: 'optimal', badgeLabel: 'Ótimo', title: 'Ok', reason: 'Ok', deltaT: 4, windSpeedKmh: 5, windGustsKmh: 7, humidityPercent: 60 } }
    ]);
    assert.equal(twoHours.detailText, '2 avaliações horárias consecutivas favoráveis');

    const mem = new Map();
    globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() };
    setCachedWeatherData({ locationName: 'Teste', latitude: 40.5, longitude: -7.5, current: {}, hourly: [{ timeIso: '2026-11-19T20:00' }], daily: [], bioclimatic: {}, fetchedAt: new Date().toISOString() });
    const cached = getCachedWeatherData(40.5, -7.5);
    assert.equal(cached?.isFresh, false, 'Cache sem windDirectionDeg horário deve exigir atualização');
  });

  it('3. Governança: <= 200 LOC, UTF-8 sem BOM, zero window.prompt e zero dark:', () => {
    const files = [
      'src/features/weather/utils/calibrationWhatIfHelpers.ts',
      'src/features/weather/hooks/useWeatherProfilesContext.ts',
      'src/features/weather/components/CalibrationWhatIfPanel.tsx',
      'src/features/weather/components/WeatherContextAccordion.tsx',
      'src/features/weather/components/WeatherDriftView.tsx',
      'src/features/weather/views/WeatherSaasView.tsx'
    ];
    for (const f of files) {
      const buf = fs.readFileSync(path.resolve(f));
      assert.equal(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, false, `${f} não deve ter BOM`);
      const txt = buf.toString('utf8');
      assert.ok(txt.split('\n').length <= 200, `${f} excede 200 LOC`);
      assert.ok(!/\bdark:/.test(txt), `${f} contém classes dark:`);
      assert.ok(!txt.includes('window.prompt'), `${f} usa window.prompt`);
    }
  });
});
