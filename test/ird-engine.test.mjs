import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { calculateDriftRiskIndex } from '../src/features/ird/irdEngine.ts';
import { resolveNozzleDriftProfile } from '../src/features/ird/irdNozzleAdapter.ts';
import {
  computeExposureSubIndex,
  computeMeteoSubIndex,
  computeOperationSubIndex,
  computeSpectrumSubIndex
} from '../src/features/ird/irdSubIndices.ts';
import {
  IRD_FORMULA_VERSION,
  IRD_RULESET_VERSION,
  NOZZLE_CATALOG_VERSION
} from '../src/features/ird/irdConfig.ts';

const baseValidInput = () => ({
  weather: {
    windSpeedKmh: 5,
    windGustsKmh: 7,
    temperatureC: 20,
    relativeHumidityPct: 65,
    precipitationMm: 0,
    weatherSource: 'manual_field',
    weatherAgeMinutes: 0
  },
  nozzle: {
    nozzleType: 'Fenda com indução de ar',
    dropletClass: 'VC',
    referencePressureBar: 3,
    pressureMinBar: 1.5,
    pressureMaxBar: 6,
    isAirInductionDeclared: true,
    workingPressureBar: 3,
    hasAirSleeve: false
  },
  operation: {
    applicationDomain: 'horizontal_boom',
    travelSpeedKmh: 6,
    boomOrReleaseHeightM: 0.5
  },
  exposure: {
    distanceToSensitiveAreaM: 25,
    labelMinBufferM: 5,
    hasDownwindSensitiveTarget: false
  }
});

describe('IRD — Testes Unitários do Motor e Subíndices', () => {
  test('1. Subíndices calculam valores esperados dentro de [0, 100]', () => {
    const meteo = computeMeteoSubIndex({
      windSpeedKmh: 10,
      windGustsKmh: 14,
      temperatureC: 22,
      relativeHumidityPct: 60,
      precipitationMm: 0,
      weatherSource: 'open_meteo_live',
      weatherAgeMinutes: 5
    });
    assert.ok(meteo.rawScore > 20 && meteo.rawScore <= 100);
    assert.ok(meteo.effectiveWindKmh > 10 && meteo.effectiveWindKmh < 14);

    const resolved = resolveNozzleDriftProfile(baseValidInput().nozzle, 3);
    const spec = computeSpectrumSubIndex(resolved, 3);
    assert.equal(spec.rawScore, 20);

    const opNoSleeve = computeOperationSubIndex(baseValidInput().operation, false);
    const opWithSleeve = computeOperationSubIndex(baseValidInput().operation, true);
    assert.ok(opWithSleeve < opNoSleeve, 'Manga de ar em barra reduz risco operacional');

    const expSafe = computeExposureSubIndex(baseValidInput().exposure);
    const expDownwind = computeExposureSubIndex({ ...baseValidInput().exposure, hasDownwindSensitiveTarget: true });
    assert.ok(expDownwind.rawScore > expSafe.rawScore);
  });

  test('2. Hierarquia de resolução de bicos e níveis de confiança', () => {
    const t1 = resolveNozzleDriftProfile({ dv10Um: 95, workingPressureBar: 10 }, 10);
    assert.equal(t1.resolutionTier, 'lab_dv10');
    assert.equal(t1.confidence, 'ALTA');

    const t2 = resolveNozzleDriftProfile({ dropletClass: 'M', workingPressureBar: 3 }, 3);
    assert.equal(t2.resolutionTier, 'catalog_droplet_class');
    assert.equal(t2.confidence, 'MEDIA');

    const t3 = resolveNozzleDriftProfile({ driftHazardLevel: 'Alto', workingPressureBar: 3 }, 3);
    assert.equal(t3.resolutionTier, 'catalog_drift_hazard');
    assert.equal(t3.confidence, 'REDUZIDA');

    const t4 = resolveNozzleDriftProfile({ workingPressureBar: 3 }, 3);
    assert.equal(t4.resolutionTier, 'conservative_fallback');
    assert.equal(t4.confidence, 'REDUZIDA');
    assert.equal(t4.baseScore, 78);
  });

  test('3. Todas as regras de bloqueio legal disparam veredicto BLOQUEADO e piso >= 80', () => {
    const base = baseValidInput();

    const rainRes = calculateDriftRiskIndex({ ...base, weather: { ...base.weather, precipitationMm: 0.5 } });
    assert.equal(rainRes.legalVerdict, 'BLOQUEADO');
    assert.ok(rainRes.blocks.some(b => b.code === 'ACTIVE_RAIN_WASH_BLOCK'));
    assert.ok(rainRes.irdScore >= 80);

    const windRes = calculateDriftRiskIndex({ ...base, weather: { ...base.weather, windSpeedKmh: 19, windGustsKmh: 21 } });
    assert.equal(windRes.legalVerdict, 'BLOQUEADO');
    assert.ok(windRes.blocks.some(b => b.code === 'EXCESSIVE_WIND_BLOCK'));

    const gustRes = calculateDriftRiskIndex({ ...base, weather: { ...base.weather, windSpeedKmh: 10, windGustsKmh: 28 } });
    assert.equal(gustRes.legalVerdict, 'BLOQUEADO');
    assert.ok(gustRes.blocks.some(b => b.code === 'EXCESSIVE_GUST_BLOCK'));

    const hotDryRes = calculateDriftRiskIndex({ ...base, weather: { ...base.weather, temperatureC: 36, relativeHumidityPct: 18 } });
    assert.equal(hotDryRes.legalVerdict, 'BLOQUEADO');
    assert.ok(hotDryRes.blocks.some(b => b.code === 'CRITICAL_DELTA_T_BLOCK'));

    const overPressRes = calculateDriftRiskIndex({ ...base, nozzle: { ...base.nozzle, workingPressureBar: 8 } });
    assert.equal(overPressRes.legalVerdict, 'BLOQUEADO');
    assert.ok(overPressRes.blocks.some(b => b.code === 'EXTREME_OVERPRESSURE_BLOCK'));

    const bufRes = calculateDriftRiskIndex({ ...base, exposure: { distanceToSensitiveAreaM: 8, labelMinBufferM: 15, hasDownwindSensitiveTarget: false } });
    assert.equal(bufRes.legalVerdict, 'BLOQUEADO');
    assert.ok(bufRes.blocks.some(b => b.code === 'LEGAL_LABEL_BUFFER_VIOLATION'));
  });

  test('4. Versões, aviso DGAV/SIFITO e não certificação ISO 22866 estão sempre presentes', () => {
    const res = calculateDriftRiskIndex(baseValidInput());
    assert.equal(res.status, 'CALCULATED');
    assert.equal(res.versions.formulaVersion, IRD_FORMULA_VERSION);
    assert.equal(res.versions.rulesetVersion, IRD_RULESET_VERSION);
    assert.equal(res.versions.nozzleCatalogVersion, NOZZLE_CATALOG_VERSION);
    assert.equal(res.legalDisclaimer.isIso22866Certified, false);
    assert.equal(res.legalDisclaimer.isLegalComplianceCertificate, false);
    assert.equal(res.legalDisclaimer.dgavSifitoPrevails, true);
    assert.ok(res.warnings.some(w => w.code === 'LABEL_SUPREMACY_DGAV_SIFITO'));
    assert.ok(res.warnings.some(w => w.code === 'NOT_ISO_22866_CERTIFIED'));
  });
});
