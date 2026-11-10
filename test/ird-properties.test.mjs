import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { NOZZLES_DATABASE } from '../src/features/nozzle-comparison/nozzleComparison.data.ts';
import { calculateDriftRiskIndex } from '../src/features/ird/irdEngine.ts';
import { buildNozzleInputFromCatalog } from '../src/features/ird/irdNozzleAdapter.ts';

const baseScenario = (nozzleInput) => ({
  weather: {
    windSpeedKmh: 7,
    windGustsKmh: 10,
    temperatureC: 21,
    relativeHumidityPct: 58,
    precipitationMm: 0,
    weatherSource: 'open_meteo_live',
    weatherAgeMinutes: 2
  },
  nozzle: nozzleInput,
  operation: {
    applicationDomain: 'horizontal_boom',
    travelSpeedKmh: 7,
    boomOrReleaseHeightM: 0.6
  },
  exposure: {
    distanceToSensitiveAreaM: 20,
    labelMinBufferM: 5,
    hasDownwindSensitiveTarget: false
  }
});

describe('IRD — Testes de Propriedade e Varrimento do Catálogo (1.666 bicos)', () => {
  test('1. Varrimento exaustivo das 1.666 variantes sem NaN, Infinity, erro ou score 0', () => {
    assert.equal(NOZZLES_DATABASE.length, 1666);

    for (const nozzle of NOZZLES_DATABASE) {
      const nozzleInput = buildNozzleInputFromCatalog(nozzle, nozzle.referencePressureBar, false);
      const res = calculateDriftRiskIndex(baseScenario(nozzleInput), nozzle);

      assert.equal(res.status, 'CALCULATED', `Falha no bico ${nozzle.id}`);
      assert.ok(Number.isInteger(res.irdScore), `irdScore não inteiro em ${nozzle.id}`);
      assert.ok(res.irdScore >= 1 && res.irdScore <= 100, `irdScore fora de [1, 100] em ${nozzle.id}: ${res.irdScore}`);

      for (const [key, val] of Object.entries(res.subIndices)) {
        assert.ok(Number.isFinite(val) && val >= 0 && val <= 100, `Subíndice ${key} inválido em ${nozzle.id}: ${val}`);
      }
    }
  });

  test('2. Determinismo estrito: mesma entrada produz saída bit-a-bit idêntica', () => {
    const sample = NOZZLES_DATABASE[0];
    const input = baseScenario(buildNozzleInputFromCatalog(sample, sample.referencePressureBar, true));
    const r1 = calculateDriftRiskIndex(input, sample);
    const r2 = calculateDriftRiskIndex(input, sample);
    assert.deepStrictEqual(r1, r2);
  });

  test('3. Monotonicidade não decrescente ao subir vento, rajada, velocidade ou altura', () => {
    const sample = NOZZLES_DATABASE[500];
    const mkInput = (overrides) => {
      const b = baseScenario(buildNozzleInputFromCatalog(sample, sample.referencePressureBar));
      return {
        ...b,
        weather: { ...b.weather, ...(overrides.weather || {}) },
        operation: { ...b.operation, ...(overrides.operation || {}) }
      };
    };

    // Vento crescente
    let prev = 0;
    for (const wind of [0, 1.5, 2, 4, 8, 12, 16, 22]) {
      const r = calculateDriftRiskIndex(mkInput({ weather: { windSpeedKmh: wind, windGustsKmh: wind + 3 } }), sample);
      assert.ok(r.irdScore >= prev, `Monotonicidade vento falhou em ${wind} km/h: ${r.irdScore} < ${prev}`);
      prev = r.irdScore;
    }

    // Rajada crescente
    prev = 0;
    for (const gust of [5, 8, 12, 18, 25, 30]) {
      const r = calculateDriftRiskIndex(mkInput({ weather: { windSpeedKmh: 5, windGustsKmh: gust } }), sample);
      assert.ok(r.irdScore >= prev, `Monotonicidade rajada falhou em ${gust} km/h: ${r.irdScore} < ${prev}`);
      prev = r.irdScore;
    }

    // Velocidade de avanço crescente
    prev = 0;
    for (const speed of [2, 4, 6, 8, 10, 14, 18]) {
      const r = calculateDriftRiskIndex(mkInput({ operation: { travelSpeedKmh: speed } }), sample);
      assert.ok(r.irdScore >= prev, `Monotonicidade velocidade falhou em ${speed} km/h: ${r.irdScore} < ${prev}`);
      prev = r.irdScore;
    }

    // Altura de barra crescente
    prev = 0;
    for (const height of [0.3, 0.5, 0.75, 1.0, 1.4, 2.0]) {
      const r = calculateDriftRiskIndex(mkInput({ operation: { boomOrReleaseHeightM: height } }), sample);
      assert.ok(r.irdScore >= prev, `Monotonicidade altura falhou em ${height} m: ${r.irdScore} < ${prev}`);
      prev = r.irdScore;
    }
  });

  test('4. Política anti-risco-zero e piso >= 80 quando bloqueado', () => {
    const ultraCoarse = {
      ...baseScenario({
        nozzleType: 'Fenda com indução de ar',
        dropletClass: 'UC',
        referencePressureBar: 3,
        pressureMinBar: 1.5,
        pressureMaxBar: 6,
        isAirInductionDeclared: true,
        workingPressureBar: 3,
        hasAirSleeve: true
      }),
      weather: {
        windSpeedKmh: 2,
        windGustsKmh: 2,
        temperatureC: 18,
        relativeHumidityPct: 70,
        precipitationMm: 0,
        weatherSource: 'manual_field'
      },
      operation: {
        applicationDomain: 'horizontal_boom',
        travelSpeedKmh: 4,
        boomOrReleaseHeightM: 0.4
      },
      exposure: {
        distanceToSensitiveAreaM: 500,
        labelMinBufferM: 5,
        hasDownwindSensitiveTarget: false
      }
    };

    const bestCase = calculateDriftRiskIndex(ultraCoarse);
    assert.equal(bestCase.status, 'CALCULATED');
    assert.ok(bestCase.irdScore >= 1, 'Nunca pode devolver score 0');
    assert.equal(bestCase.irdClass, 'BAIXO');

    const blockedCase = calculateDriftRiskIndex({
      ...ultraCoarse,
      weather: { ...ultraCoarse.weather, precipitationMm: 1.0 }
    });
    assert.equal(blockedCase.legalVerdict, 'BLOQUEADO');
    assert.ok(blockedCase.irdScore >= 80);
    assert.equal(blockedCase.irdClass, 'CRITICO_BLOQUEADO');
  });
});
