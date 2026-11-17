import 'fake-indexeddb/auto';
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
      const out = ts.transpileModule(fs.readFileSync(filePath, 'utf8'), { fileName: filePath, compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX } });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { NOZZLES_DATABASE } = await import('../src/features/nozzle-comparison/nozzleComparison.data.ts');
const { calculateDriftRiskIndex } = await import('../src/features/ird/irdEngine.ts');
const { resolveNozzleDriftProfile } = await import('../src/features/ird/irdNozzleAdapter.ts');
const { INITIAL_NOZZLE_CASCADE, INITIAL_CERTIFIED_REDUCTION } = await import('../src/features/ird/irdOriginTypes.ts');
const { applyNozzleCascadeStep, createInitialCalibrationState } = await import('../src/features/ird/irdContextCopies.ts');
const { resolveActiveIrdContext } = await import('../src/features/ird/irdContextResolver.ts');
const { readIrdHistoryTrace } = await import('../src/features/ird/irdHistoryTraceReader.ts');
const { IrdNozzleCascadeField } = await import('../src/features/ird/IrdNozzleCascadeField.tsx');
const { IrdDropletPanel } = await import('../src/features/ird/IrdDropletPanel.tsx');
const { IrdCertifiedReductionPanel } = await import('../src/features/ird/IrdCertifiedReductionPanel.tsx');
const { IrdCalcExplanation } = await import('../src/features/ird/IrdCalcExplanation.tsx');
const { IrdProfilesOnlyPanel } = await import('../src/features/ird/IrdProfilesOnlyPanel.tsx');
const { IrdResultCard } = await import('../src/features/ird/IrdResultCard.tsx');

const baseInput = () => ({
  weather: { windSpeedKmh: 10, windGustsKmh: 16, temperatureC: 22, relativeHumidityPct: 55, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 },
  nozzle: { workingPressureBar: 3, hasAirSleeve: false },
  operation: { applicationDomain: 'horizontal_boom', travelSpeedKmh: 8, boomOrReleaseHeightM: 0.5 },
  exposure: { distanceToSensitiveAreaM: 20, labelMinBufferM: null, hasDownwindSensitiveTarget: false }
});

describe('IRD — Reatividade Operacional, Cascata de Bicos, DropDowns e Transparência', () => {
  it('1. Cascata preserva seleção multi-passo (ISO, cor não-ISO, modular/monobloco) e avisa se faltar modelo', () => {
    const xr110 = NOZZLES_DATABASE.find((n) => n.brand === 'TeeJet' && n.model === 'XR' && Number(n.sprayAngleDeg) === 110 && n.isIsoNozzle);
    const atr = NOZZLES_DATABASE.find((n) => n.brand === 'Albuz' && n.model === 'ATR' && !n.isIsoNozzle);
    const modular = NOZZLES_DATABASE.find((n) => n.swirlPlate && n.disc);
    assert.ok(xr110 && atr && modular);

    let st = { ...INITIAL_NOZZLE_CASCADE };
    for (const step of [
      { type: 'brand', value: xr110.brand }, { type: 'angle', value: '' },
      { type: 'model', value: xr110.model }, { type: 'angle', value: '' },
      { type: 'angle', value: xr110.sprayAngleDeg ?? '' },
      { type: 'nozzle', value: xr110.id, sprayAngle: xr110.sprayAngleDeg }
    ]) st = applyNozzleCascadeStep(st, step);
    assert.equal(st.brand, xr110.brand);
    assert.equal(st.model, xr110.model);
    assert.equal(st.catalogNozzleId, xr110.id);

    let stMod = { ...INITIAL_NOZZLE_CASCADE };
    for (const step of [
      { type: 'brand', value: modular.brand }, { type: 'model', value: modular.model },
      { type: 'swirl', value: modular.swirlPlate }, { type: 'disc', value: modular.disc },
      { type: 'nozzle', value: modular.id, sprayAngle: modular.sprayAngleDeg }
    ]) stMod = applyNozzleCascadeStep(stMod, step);
    assert.equal(stMod.catalogNozzleId, modular.id);
    assert.equal(stMod.swirlPlate, modular.swirlPlate);
    assert.equal(stMod.disc, modular.disc);

    let stAtr = applyNozzleCascadeStep(INITIAL_NOZZLE_CASCADE, { type: 'brand', value: atr.brand });
    stAtr = applyNozzleCascadeStep(stAtr, { type: 'model', value: atr.model });
    stAtr = applyNozzleCascadeStep(stAtr, { type: 'nozzle', value: atr.id, sprayAngle: atr.sprayAngleDeg });
    assert.equal(stAtr.catalogNozzleId, atr.id);
    assert.equal(String(stAtr.sprayAngle), String(atr.sprayAngleDeg ?? ''));

    const noModelHtml = renderToStaticMarkup(React.createElement(IrdNozzleCascadeField, { cascade: { ...INITIAL_NOZZLE_CASCADE, brand: 'MarcaSemCat' }, catalog: NOZZLES_DATABASE, onChangeCascade: () => {} }));
    assert.match(noModelHtml, /Modelo ou variante sem correspondência no catálogo local/);
    const incHtml = renderToStaticMarkup(React.createElement(IrdNozzleCascadeField, { cascade: { ...INITIAL_NOZZLE_CASCADE, brand: 'TeeJet', model: 'XR' }, catalog: NOZZLES_DATABASE, onChangeCascade: () => {} }));
    assert.match(incHtml, /Selecione ângulo, cor, difusor\/disco ou referência/);
  });

  it('2. Pressão altera score no catálogo (sem DV10) e com measurementPressureBar em medição manual', () => {
    const classNoz = NOZZLES_DATABASE.find((n) => n.brand === 'TeeJet' && n.model === 'XR' && n.referencePressureBar > 0 && !n.d10_5bar_um);
    assert.ok(classNoz);
    const rLow = calculateDriftRiskIndex({ ...baseInput(), nozzle: { workingPressureBar: 1.5 } }, classNoz);
    const rHigh = calculateDriftRiskIndex({ ...baseInput(), nozzle: { workingPressureBar: 5.5 } }, classNoz);
    assert.equal(rLow.status, 'CALCULATED');
    assert.equal(rHigh.status, 'CALCULATED');
    assert.notEqual(rLow.subIndices.espectro, rHigh.subIndices.espectro);

    const manualSpec = { measuredDv10Um: 160, measuredDv50Um: 320, measurementSource: 'manufacturer_spec', measurementPressureBar: 3 };
    assert.equal(resolveNozzleDriftProfile({ ...manualSpec, workingPressureBar: 3 }, 3).referencePressureBar, 3);
    assert.equal(resolveNozzleDriftProfile({ measuredDv10Um: 160, measurementSource: 'manufacturer_spec', workingPressureBar: 3 }, 3).referencePressureBar, undefined);
    assert.equal(resolveNozzleDriftProfile({ ...manualSpec, workingPressureBar: 3 }, 3, classNoz).referencePressureBar, classNoz.referencePressureBar);
    const rM2 = calculateDriftRiskIndex({ ...baseInput(), nozzle: { ...manualSpec, workingPressureBar: 2 } });
    const rM5 = calculateDriftRiskIndex({ ...baseInput(), nozzle: { ...manualSpec, workingPressureBar: 5 } });
    assert.ok(rM5.subIndices.espectro > rM2.subIndices.espectro && rM5.irdScore > rM2.irdScore);
  });

  it('3. Default conventional, Modo A rotativo, alerta de rejeição e dropdowns de redução certificada', () => {
    const initCal = createInitialCalibrationState();
    assert.equal(initCal.manual.dropletMode, 'conventional');

    const calRotary = { ...initCal, manual: { ...initCal.manual, workingPressureBar: 3, travelSpeedKmh: 8, boomOrReleaseHeightM: 0.5, dropletMode: 'rotary', representativeDropletDiameterUm: 220 } };
    const ctx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: baseInput().weather,
      culture: { origin: 'manual', selectedProfileId: null, manualLabel: 'Talhão' },
      equipment: { origin: 'manual', selectedProfileId: null, manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'no' } },
      nozzle: { origin: 'manual', selectedProfileId: null, profileConfirmedCatalogId: '', manualCascade: INITIAL_NOZZLE_CASCADE, certifiedReduction: INITIAL_CERTIFIED_REDUCTION },
      calibration: calRotary, exposure: { distanceToSensitiveAreaM: 20, labelBufferKnown: false, labelMinBufferM: null, downwindStatus: 'no', sensitiveZoneCategory: 'none' },
      locationName: 'Beja', profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    assert.equal(ctx.irdInput.nozzle.nozzleType, 'rotativo');
    const rRot = calculateDriftRiskIndex(ctx.irdInput, null);
    assert.equal(rRot.derived.nozzleResolutionTier, 'user_representative_diameter');
    assert.equal(rRot.derived.dropletSource, 'user_declared');

    const badNoz = { workingPressureBar: 3, measuredDv10Um: 280, measuredDv50Um: 200, measurementSource: 'user_declared' };
    const dropHtml = renderToStaticMarkup(React.createElement(IrdDropletPanel, {
      isOpen: true, mode: 'conventional', nozzle: badNoz, resolvedProfile: resolveNozzleDriftProfile(badNoz, 3),
      onToggleOpen: () => {}, onModeChange: () => {}, onChangeFields: () => {}, onOpenKeypad: () => {}, onClear: () => {}
    }));
    assert.match(dropHtml, /role="alert"/);
    assert.match(dropHtml, /Medição de gota ignorada/);

    const certHtml = renderToStaticMarkup(React.createElement(IrdCertifiedReductionPanel, {
      value: { status: 'documented', scope: 'nozzle_variant', reductionClassText: 'Deriva', reductionPct: 75, source: 'user_declaration' }, onChange: () => {}, onOpenKeypad: () => {}
    }));
    for (const id of ['ird-cert-status', 'ird-cert-scope', 'ird-cert-type', 'ird-cert-origin', 'ird-cert-pct']) {
      assert.ok(certHtml.includes(`id="${id}"`), `Falta dropdown ${id}`);
    }
    assert.match(certHtml, /não constitui certificação verificada/);
    assert.match(certHtml, /não aplicada à pontuação nesta versão/);
  });

  it('4. Notas de saturação, Nível 1 intacto, Nível 3 Estado none explícito e histórico legado', () => {
    const expHtml = renderToStaticMarkup(React.createElement(IrdCalcExplanation, {
      heightModeLabelPt: 'Altura da barra ao solo (m)', airAssistNotePt: 'Sem assistência de ar',
      levelNotesPt: [], isCalculated: true, hasCatalogNozzle: false, dv10UsedUm: 35, hasCertifiedReduction: true,
      irdInput: { ...baseInput(), operation: { applicationDomain: 'horizontal_boom', travelSpeedKmh: 3, boomOrReleaseHeightM: 0.4 } }
    }));
    assert.match(expHtml, /Velocidade \(3 km\/h\) &lt;= 4 km\/h/);
    assert.match(expHtml, /Altura \(0\.4 m\) &lt;= referência da família \(0\.5 m\)/);
    assert.match(expHtml, /DV10 \(35 µm\) está no limite da escala utilizável/);
    assert.match(expHtml, /sem alterar o score/);

    const l1Html = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level1_meteo', result: null, isLoading: false,
      weatherEval: { status: 'VALID', score: 25, band: 'BAIXO', bandLabelPt: 'BAIXO', dominantFactorPt: 'Vento moderado', windKmh: 8, gustsKmh: 12, tempC: 20, humidityPct: 60, deltaTC: 4.5 }
    }));
    assert.match(l1Html, /1\. Só Meteorologia/);
    assert.ok(!l1Html.includes('Subíndices') && !l1Html.includes('Espectro (30%)'));

    const pHtml = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(IrdProfilesOnlyPanel, {
      userId: 'u1', catalogNozzles: NOZZLES_DATABASE, cultures: [], equipments: [],
      profileNozzles: [{ id: 'pn1', manufacturer: 'Inexistente', model: 'X99' }], calibrations: [],
      culture: { origin: 'profile', selectedProfileId: null, manualLabel: '' },
      equipment: { origin: 'profile', selectedProfileId: null, manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'unknown' } },
      nozzle: { origin: 'profile', selectedProfileId: 'pn1', profileConfirmedCatalogId: '', manualCascade: INITIAL_NOZZLE_CASCADE, certifiedReduction: INITIAL_CERTIFIED_REDUCTION },
      calibration: createInitialCalibrationState(), blockingGapsPt: ['Sem correspondência exata'],
      onChangeCulture: () => {}, onChangeEquipment: () => {}, onChangeNozzle: () => {}, onChangeCalibration: () => {}, onSwitchToQuickManual: () => {}
    })));
    assert.match(pHtml, /Estado: none .*sem correspondência no catálogo local/);

    const legacyTrace = readIrdHistoryTrace({ id: 'legacy-1', userId: 'u1', calculatorId: 'indice-risco-deriva', calculatorVersion: '1.0.0', createdAt: 1000, outputs: { irdScore: { rawValue: 42 } }, inputs: {} });
    assert.equal(legacyTrace.isLegacyWithoutTrace, true);
    assert.equal(legacyTrace.assessmentLevel, null);
  });
});
