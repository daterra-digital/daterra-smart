import { registerHooks } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.(tsx?|jsx?|mjs|cjs|json)$/i.test(specifier) && context.parentURL?.startsWith('file:')) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      for (const ext of ['.tsx', '.ts']) {
        const candidate = path.join(parentDir, specifier + ext);
        if (fs.existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.tsx')) {
      const filePath = new URL(url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
      const out = ts.transpileModule(fs.readFileSync(filePath, 'utf8'), {
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { NOZZLES_DATABASE } = await import('../src/features/nozzle-comparison/nozzleComparison.data.ts');
const { calculateDriftRiskIndex } = await import('../src/features/ird/irdEngine.ts');
const { buildNozzleInputFromCatalog, resolveNozzleDriftProfile } = await import('../src/features/ird/irdNozzleAdapter.ts');
const { mapEquipmentProfileToIrd, matchNozzleProfileToCatalog, extractCalibrationSafely } = await import('../src/features/ird/irdProfileMappers.ts');
const { buildActiveWeatherInput } = await import('../src/features/ird/irdWeatherBridge.ts');
const {
  createInitialCalibrationState,
  createInitialCultureState,
  createInitialEquipmentState,
  createInitialExposureState,
  createInitialNozzleState
} = await import('../src/features/ird/irdContextCopies.ts');
const { IrdParameterPanel } = await import('../src/features/ird/IrdParameterPanel.tsx');

describe('IRD — Bloco B: Perfis Locais, Divulgação Progressiva e Bridge Meteorológica', () => {
  it('1. mapEquipmentProfileToIrd cobre barras, atomizador, lança manual e lacuna de drone sem fabricar defaults', () => {
    const boom = mapEquipmentProfileToIrd({ id: 1, userId: 'u1', name: 'Pulverizador 1000L', distribution_type: 'Barras horizontais', has_air_sleeve: true, boom_height_m: 0.65, last_working_speed_kmh: 7.5 });
    assert.equal(boom?.applicationDomain, 'horizontal_boom');
    assert.equal(boom?.hasAirSleeve, true);
    assert.equal(boom?.defaultHeightM, 0.65);

    const drone = mapEquipmentProfileToIrd({ id: 2, userId: 'u1', name: 'Drone Agras T40', distribution_type: 'Drone UAV' });
    assert.equal(drone?.isDroneOrNonBoomGap, true);
    assert.equal(drone?.defaultHeightM, null);
    assert.ok(drone?.notePt?.includes('aéreo/drone'));

    const airblast = mapEquipmentProfileToIrd({ id: 3, userId: 'u1', name: 'Atomizador 2000L', distribution_type: 'Atomizador', has_air_sleeve: true });
    assert.equal(airblast?.applicationDomain, 'orchard_airblast');
    assert.equal(airblast?.hasAirSleeve, false);
    assert.equal(airblast?.defaultHeightM, null);
  });

  it('2. matchNozzleProfileToCatalog exige confirmação manual em correspondência ambígua e extractCalibrationSafely não converte gota legada', () => {
    const n0 = NOZZLES_DATABASE[0];
    const exact = matchNozzleProfileToCatalog({ id: 1, userId: 'u1', manufacturer: n0.brand, model: n0.model }, [n0]);
    assert.equal(exact.status, 'exact');
    assert.equal(exact.matchedNozzle?.id, n0.id);

    const amb = matchNozzleProfileToCatalog({ id: 2, userId: 'u1', manufacturer: n0.brand, model: 'A' }, NOZZLES_DATABASE);
    assert.ok(amb.status === 'ambiguous' || amb.status === 'none');
    if (amb.status === 'ambiguous') assert.equal(amb.matchedNozzle, null);

    const cal = extractCalibrationSafely({ id: 1, userId: 'u1', name: 'Calib Outono', nozzle_count: 20, spacing_m: 0.5, target_volume_l_ha: 300, working_speed_kmh: 6, working_pressure_bar: 3.5, flow_rate_l_min: 1.2, droplet_size_um: 290 });
    assert.equal(cal?.workingPressureBar, 3.5);
    assert.equal(cal?.legacyDropletSizeUm, 290);
    assert.ok(cal?.legacyDropletNotePt?.includes('não é convertido em DV10'));
  });

  it('3. IrdParameterPanel renderiza 5 acordiões, modo perfil exclusivo sem inputs manuais concorrentes e links /definicoes?tab=', () => {
    const first = NOZZLES_DATABASE[0];
    const mockCatalog = [first, { ...first, id: 'dup_test', model: `${first.model} V2`, modelNorm: `${first.model} V2` }];
    const renderWithAccordion = (openAccordion, overrides = {}) => renderToStaticMarkup(React.createElement(
      MemoryRouter,
      null,
      React.createElement(IrdParameterPanel, {
        openAccordion, onToggleAccordion: () => {}, userId: 'u1',
        cultures: [], equipments: [], calibrations: [],
        profileNozzles: [{ id: 10, userId: 'u1', manufacturer: first.brand, model: first.model.slice(0, 3), color: '', iso_classification: '', nozzle_type: 'Cone', spray_angle: '80', working_pressure_bar: 10, nominal_flow_lmin: 0.4 }],
        catalogNozzles: mockCatalog,
        culture: { ...createInitialCultureState(), mode: 'profile', ...overrides.culture },
        equipment: { ...createInitialEquipmentState(), mode: 'profile', ...overrides.equipment },
        nozzle: { ...createInitialNozzleState(), mode: 'profile', selectedProfileId: '10', ...overrides.nozzle },
        calibration: { ...createInitialCalibrationState(), mode: 'profile', ...overrides.calibration },
        exposure: createInitialExposureState(),
        calibrationGapsPt: [],
        resolvedProfile: resolveNozzleDriftProfile(buildNozzleInputFromCatalog(first, 3), 3, first),
        onChangeCulture: () => {}, onCopyCultureToManual: () => {},
        onChangeEquipment: () => {}, onCopyEquipmentToManual: () => {},
        onChangeNozzle: () => {}, onCopyNozzleToManual: () => {},
        onChangeCalibration: () => {}, onCopyCalibrationToManual: () => {},
        onChangeExposure: () => {}, onOpenKeypad: () => {}
      })
    ));

    const html = renderWithAccordion('bico');
    for (const label of ['1. Cultura', '2. Equipamento', '3. Bico', '4. Calibração e aplicação', '5. Exposição e zonas sensíveis']) {
      assert.ok(html.includes(label), `Acordião esperado ausente: ${label}`);
    }
    assert.ok(html.includes('Apenas informativo') && html.includes('Influencia IRD'));
    assert.ok(html.includes('Usar perfil guardado') && html.includes('Introduzir manualmente'));
    assert.ok(html.includes('Correspondência ambígua'), 'Banner de confirmação ambígua esperado');
    assert.ok(html.includes('Copiar para introdução manual'));
    assert.ok(html.includes('aria-expanded="true"') && html.includes('aria-expanded="false"'));
    assert.ok(renderWithAccordion('cultura').includes('/definicoes?tab=cultura'));
    assert.ok(renderWithAccordion('equipamento').includes('/definicoes?tab=equipamento'));
    assert.ok(renderWithAccordion('calibracao').includes('/definicoes?tab=calibracao'));
  });

  it('4. Bridge meteorológica preserva vento/rajada/precipitação zero legítimos e score IRD permanece intacto', () => {
    const active = buildActiveWeatherInput(null, { windSpeedKmh: null, windGustsKmh: null, temperatureC: null, relativeHumidityPct: null, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 }, {
      fetchedAt: '2026-11-10T10:00:00.000Z', location: { id: 'l1', name: 'Évora', latitude: 38.57, longitude: -7.9 },
      current: {
        temperatureC: 19, apparentTempC: 19, humidityPercent: 65, windSpeedKmh: 4, windDirectionDeg: 0, windDirectionText: 'N',
        windGustsKmh: 0, precipitationMm: 0, weatherCode: 0, weatherLabel: 'Limpo', dewPointC: 12, deltaT: 4, vpdKpa: 0.7,
        sprayEvaluation: { level: 'optimal', badgeLabel: '', title: '', reason: '', deltaT: 4, windSpeedKmh: 4, windGustsKmh: 0, humidityPercent: 65 },
        updatedAt: '10:00', isCached: false,
        telemetryQuality: { isComplete: true, isGustEstimated: false, hasRealGustReading: true, missingFields: [], precipUnit: 'mm', precipTemporalKind: 'current_interval_accumulated', rawTemperatureC: 19, rawHumidityPercent: 65, rawWindSpeedKmh: 4, rawWindGustsKmh: 0, rawPrecipitationMm: 0 }
      },
      hourly: [], daily: []
    }, 2);
    assert.equal(active.windGustsKmh, 0);
    assert.equal(active.precipitationMm, 0);

    const res = calculateDriftRiskIndex({
      weather: active,
      nozzle: { nozzleType: 'Fenda', dropletClass: 'M', referencePressureBar: 3, pressureMinBar: 1.5, pressureMaxBar: 5, workingPressureBar: 3, hasAirSleeve: false },
      operation: { applicationDomain: 'horizontal_boom', travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 },
      exposure: { distanceToSensitiveAreaM: 20, labelMinBufferM: 5, hasDownwindSensitiveTarget: false }
    });
    assert.equal(res.status, 'CALCULATED');
    assert.equal(res.derived.effectiveWindKmh, 4);
  });
});
