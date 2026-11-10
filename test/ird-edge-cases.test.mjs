import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { NOZZLES_DATABASE } from '../src/features/nozzle-comparison/nozzleComparison.data.ts';
import { calculateDriftRiskIndex } from '../src/features/ird/irdEngine.ts';
import { buildNozzleInputFromCatalog } from '../src/features/ird/irdNozzleAdapter.ts';

const baseInput = () => ({
  weather: {
    windSpeedKmh: 6,
    windGustsKmh: 8,
    temperatureC: 20,
    relativeHumidityPct: 65,
    precipitationMm: 0,
    weatherSource: 'manual_field',
    weatherAgeMinutes: 0
  },
  nozzle: {
    nozzleType: 'Fenda',
    dropletClass: 'M',
    referencePressureBar: 3,
    pressureMinBar: 1.5,
    pressureMaxBar: 5,
    workingPressureBar: 3,
    hasAirSleeve: false
  },
  operation: {
    applicationDomain: 'horizontal_boom',
    travelSpeedKmh: 6,
    boomOrReleaseHeightM: 0.5
  },
  exposure: {
    distanceToSensitiveAreaM: 15,
    labelMinBufferM: 5,
    hasDownwindSensitiveTarget: false
  }
});

describe('IRD — Testes de Casos-Limite e Fail-Closed', () => {
  test('1. Vento 0 km/h com Delta T > 6 °C ativa cautela de inversão térmica e nunca dá risco zero', () => {
    const input = baseInput();
    input.weather = {
      windSpeedKmh: 0,
      windGustsKmh: 0,
      temperatureC: 24,
      relativeHumidityPct: 45,
      precipitationMm: 0,
      weatherSource: 'manual_field'
    };
    const res = calculateDriftRiskIndex(input);
    assert.equal(res.status, 'CALCULATED');
    assert.ok(res.derived.deltaTC > 6 && res.derived.deltaTC <= 10);
    assert.ok(res.irdScore >= 1);
    assert.ok(res.fallbackFlags.includes('CALM_WIND_THERMAL_INVERSION_CAUTION'));
    assert.ok(res.warnings.some(w => w.code === 'THERMAL_INVERSION_SUSPECTED'));
    assert.equal(res.legalVerdict, 'RESTRITO_MITIGAR');
  });

  test('2. Distância 0 m evita divisão por zero e bloqueia se existir zona tampão de rótulo', () => {
    const input = baseInput();
    input.exposure = { distanceToSensitiveAreaM: 0, labelMinBufferM: 10, hasDownwindSensitiveTarget: true };
    const res = calculateDriftRiskIndex(input);
    assert.equal(res.status, 'CALCULATED');
    assert.equal(res.subIndices.exposicao, 100);
    assert.equal(res.legalVerdict, 'BLOQUEADO');
    assert.ok(res.irdScore >= 80);
  });

  test('3. Pressão abaixo do mínimo e acima do máximo aplicam penalizações e alertas', () => {
    const underRes = calculateDriftRiskIndex({
      ...baseInput(),
      nozzle: { ...baseInput().nozzle, isAirInductionDeclared: true, workingPressureBar: 1.0 }
    });
    assert.equal(underRes.status, 'CALCULATED');
    assert.ok(underRes.fallbackFlags.includes('NOZZLE_UNDERPRESSURE_WARNING'));
    assert.equal(underRes.derived.maxWindLimitKmh, 14, 'Sem bónus de indução de ar abaixo da pressão mínima');

    const overRes = calculateDriftRiskIndex({
      ...baseInput(),
      nozzle: { ...baseInput().nozzle, workingPressureBar: 5.5 }
    });
    assert.equal(overRes.status, 'CALCULATED');
    assert.ok(overRes.fallbackFlags.includes('NOZZLE_OVERPRESSURE_PENALTY'));
    assert.equal(overRes.dataConfidenceLevel, 'REDUZIDA');
  });

  test('4. Bico sem espectro numérico, bico sem dropletClass e "Inexistente" do catálogo real', () => {
    const noClassNozzle = NOZZLES_DATABASE.find(n => !n.dropletClass5bar && !n.dropletClass10bar && !n.dropletClass15bar && n.d50_5bar_um === undefined);
    assert.ok(noClassNozzle, 'Deve existir variante sem dropletClass no catálogo');
    const rNoClass = calculateDriftRiskIndex(
      { ...baseInput(), nozzle: buildNozzleInputFromCatalog(noClassNozzle, noClassNozzle.referencePressureBar) },
      noClassNozzle
    );
    assert.equal(rNoClass.derived.nozzleResolutionTier, 'catalog_drift_hazard');
    assert.equal(rNoClass.dataConfidenceLevel, 'REDUZIDA');

    const zeroHazardNozzle = NOZZLES_DATABASE.find(n => /inexistente/i.test(n.driftHazardLevel || ''));
    assert.ok(zeroHazardNozzle, 'Deve existir variante com driftHazardLevel Inexistente');
    const rZero = calculateDriftRiskIndex(
      { ...baseInput(), nozzle: buildNozzleInputFromCatalog(zeroHazardNozzle, 3) },
      { ...zeroHazardNozzle, dropletClass5bar: undefined, dropletClass10bar: undefined, dropletClass15bar: undefined }
    );
    assert.ok(rZero.fallbackFlags.includes('NOZZLE_ZERO_HAZARD_NORMALIZED_NON_ZERO'));
    assert.ok(rZero.subIndices.espectro >= 20 && rZero.irdScore >= 1);
  });

  test('5. Fail-closed perante NaN, Infinity, negativos, falta de pressão e falta de meteorologia', () => {
    const nanWind = calculateDriftRiskIndex({ ...baseInput(), weather: { ...baseInput().weather, windSpeedKmh: Number.NaN } });
    assert.equal(nanWind.status, 'FAIL_CLOSED_INCOMPLETE');
    assert.equal(nanWind.irdScore, null);
    assert.equal(nanWind.legalVerdict, 'BLOQUEADO');

    const negDist = calculateDriftRiskIndex({ ...baseInput(), exposure: { distanceToSensitiveAreaM: -1, hasDownwindSensitiveTarget: false } });
    assert.equal(negDist.status, 'FAIL_CLOSED_INCOMPLETE');

    const noPressure = calculateDriftRiskIndex({ ...baseInput(), nozzle: { ...baseInput().nozzle, workingPressureBar: null } });
    assert.equal(noPressure.status, 'FAIL_CLOSED_INCOMPLETE');
    assert.ok(noPressure.blocks.some(b => b.code === 'MISSING_WORKING_PRESSURE'));
  });

  test('6. Ausência de leitura meteorológica bloqueia; cache expirada avisa; leitura manual funciona offline', () => {
    const noWeather = calculateDriftRiskIndex({
      ...baseInput(),
      weather: { windSpeedKmh: null, temperatureC: null, relativeHumidityPct: null }
    });
    assert.equal(noWeather.status, 'FAIL_CLOSED_INCOMPLETE');
    assert.ok(noWeather.blocks.some(b => b.code === 'MISSING_CRITICAL_WEATHER_DATA'));

    const staleCache = calculateDriftRiskIndex({
      ...baseInput(),
      weather: { ...baseInput().weather, weatherSource: 'open_meteo_cache', weatherAgeMinutes: 45 }
    });
    assert.equal(staleCache.status, 'CALCULATED');
    assert.ok(staleCache.fallbackFlags.includes('WEATHER_CACHE_STALE_CONFIRM_IN_FIELD'));
    assert.equal(staleCache.dataConfidenceLevel, 'REDUZIDA');

    const manualOffline = calculateDriftRiskIndex(baseInput());
    assert.equal(manualOffline.status, 'CALCULATED');
    assert.ok(manualOffline.irdScore >= 1 && manualOffline.irdScore <= 100);
  });
});
