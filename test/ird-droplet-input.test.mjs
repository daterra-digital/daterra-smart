import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { NOZZLES_DATABASE } from '../src/features/nozzle-comparison/nozzleComparison.data.ts';
import { calculateDriftRiskIndex } from '../src/features/ird/irdEngine.ts';
import { buildNozzleInputFromCatalog } from '../src/features/ird/irdNozzleAdapter.ts';

const baseScenario = (nozzleOverrides = {}) => ({
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
    hasAirSleeve: false,
    ...nozzleOverrides
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

describe('IRD — Diâmetro de Gota Opcional, Prioridade e Rastreabilidade', () => {
  test('1. Prioridade dos valores introduzidos sobre catálogo interpolado, classe e fallback', () => {
    const labNozzle = NOZZLES_DATABASE.find(n => typeof n.d50_5bar_um === 'number');
    assert.ok(labNozzle);

    const catInput = buildNozzleInputFromCatalog(labNozzle, 5);
    const catalogOnly = calculateDriftRiskIndex({ ...baseScenario(), nozzle: catInput }, labNozzle);
    assert.equal(catalogOnly.derived.nozzleResolutionTier, 'lab_dv10');
    assert.equal(catalogOnly.derived.dropletSource, 'catalog_interpolated');

    const userOverride = calculateDriftRiskIndex({
      ...baseScenario(),
      nozzle: {
        ...catInput,
        measuredDv10Um: 180,
        measuredDv50Um: 360,
        measuredDv90Um: 540,
        measurementSource: 'calibration_profile',
        measurementPressureBar: 5,
        measurementDate: '2026-11-10',
        measurementConfidence: 'ALTA'
      }
    }, labNozzle);

    assert.equal(userOverride.status, 'CALCULATED');
    assert.equal(userOverride.derived.nozzleResolutionTier, 'user_measured_spectrum');
    assert.equal(userOverride.derived.dropletSource, 'calibration_profile');
    assert.equal(userOverride.derived.dropletConfidence, 'ALTA');
    assert.equal(userOverride.derived.dv10UsedUm, 180);
    assert.equal(userOverride.derived.dv50UsedUm, 360);
    assert.equal(userOverride.derived.dv90UsedUm, 540);
    assert.ok(userOverride.subIndices.espectro < catalogOnly.subIndices.espectro);
  });

  test('2. Medição inválida é rejeitada apenas no campo com aviso, seguindo a hierarquia normal', () => {
    const inverted = calculateDriftRiskIndex(baseScenario({
      measuredDv10Um: 300,
      measuredDv50Um: 200,
      measuredDv90Um: 400,
      measurementSource: 'lab_certificate'
    }));
    assert.equal(inverted.status, 'CALCULATED', 'Não bloqueia todo o cálculo se existir fallback válido');
    assert.equal(inverted.derived.nozzleResolutionTier, 'catalog_droplet_class');
    assert.equal(inverted.derived.dropletSource, 'catalog_class');
    assert.equal(inverted.derived.dv10UsedUm, null);
    assert.ok(inverted.fallbackFlags.includes('USER_DROPLET_MEASUREMENT_INVALID_IGNORED'));
    assert.ok(inverted.warnings.some(w => w.code === 'USER_DROPLET_MEASUREMENT_IGNORED'));

    const negVal = calculateDriftRiskIndex(baseScenario({ measuredDv10Um: -20 }));
    assert.equal(negVal.status, 'CALCULATED');
    assert.ok(negVal.warnings.some(w => w.code === 'USER_DROPLET_MEASUREMENT_IGNORED'));
  });

  test('3. Sem valores introduzidos, comportamento e pontuações permanecem exatamente iguais', () => {
    const res = calculateDriftRiskIndex(baseScenario());
    assert.equal(res.status, 'CALCULATED');
    assert.equal(res.derived.nozzleResolutionTier, 'catalog_droplet_class');
    assert.equal(res.derived.dropletSource, 'catalog_class');
    assert.equal(res.derived.dropletConfidence, 'MEDIA');
    assert.equal(res.derived.dv10UsedUm, null);
    assert.equal(res.derived.dv50UsedUm, null);
    assert.equal(res.derived.dv90UsedUm, null);
    assert.equal(res.subIndices.espectro, 55);
  });

  test('4. Bico rotativo de drone aceita diâmetro representativo com fonte sem inventar Dv10/Dv50/Dv90', () => {
    const rotary = calculateDriftRiskIndex(baseScenario({
      nozzleType: 'Bico rotativo CDA (drone)',
      dropletClass: null,
      representativeDropletDiameterUm: 310,
      measurementSource: 'manufacturer_spec',
      measurementConfidence: 'MEDIA'
    }));
    assert.equal(rotary.status, 'CALCULATED');
    assert.equal(rotary.derived.nozzleResolutionTier, 'user_representative_diameter');
    assert.equal(rotary.derived.dropletSource, 'manufacturer_spec');
    assert.equal(rotary.derived.dv10UsedUm, null, 'Nunca inventar dv10');
    assert.equal(rotary.derived.dv50UsedUm, null, 'Nunca inventar dv50');
    assert.equal(rotary.derived.dv90UsedUm, null, 'Nunca inventar dv90');

    // Sem fonte especificada no diâmetro representativo, rejeita com aviso e cai para fallback conservador
    const missingSource = calculateDriftRiskIndex(baseScenario({
      nozzleType: 'Bico rotativo CDA (drone)',
      dropletClass: null,
      representativeDropletDiameterUm: 310
    }));
    assert.equal(missingSource.status, 'CALCULATED');
    assert.equal(missingSource.derived.nozzleResolutionTier, 'conservative_fallback');
    assert.ok(missingSource.warnings.some(w => w.code === 'USER_DROPLET_MEASUREMENT_IGNORED'));
  });

  test('5. Rastreabilidade completa de origem e avisos DGAV/SIFITO (não ISO 22866)', () => {
    const hazardOnly = calculateDriftRiskIndex(baseScenario({
      dropletClass: null,
      driftHazardLevel: 'Alto'
    }));
    assert.equal(hazardOnly.derived.nozzleResolutionTier, 'catalog_drift_hazard');
    assert.equal(hazardOnly.derived.dropletSource, 'catalog_drift_hazard');
    assert.equal(hazardOnly.derived.dropletConfidence, 'REDUZIDA');
    assert.ok(hazardOnly.warnings.some(w => w.code === 'LABEL_SUPREMACY_DGAV_SIFITO'));
    assert.ok(hazardOnly.warnings.some(w => w.code === 'NOT_ISO_22866_CERTIFIED'));
  });
});
