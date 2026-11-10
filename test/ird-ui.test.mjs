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

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) && context.parentURL?.startsWith('file:')) {
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
      const src = fs.readFileSync(filePath, 'utf8');
      const out = ts.transpileModule(src, {
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { BLOCKED_TOOL_IDS_IN_PAGES, resolveReleaseRoute } = await import('../src/utils/releasePolicy.ts');
const { NOZZLES_DATABASE } = await import('../src/features/nozzle-comparison/nozzleComparison.data.ts');
const { calculateDriftRiskIndex } = await import('../src/features/ird/irdEngine.ts');
const { resolveNozzleDriftProfile, buildNozzleInputFromCatalog } = await import('../src/features/ird/irdNozzleAdapter.ts');
const { saveIrdAssessment, listIrdHistory, softDeleteIrdAssessment } = await import('../src/features/ird/irdHistoryAdapter.ts');
const { DaterraDatabase } = await import('../src/db/db.ts');

const { IrdResultCard } = await import('../src/features/ird/IrdResultCard.tsx');
const { IrdParameterPanel } = await import('../src/features/ird/IrdParameterPanel.tsx');
const { IrdWeatherPanel } = await import('../src/features/ird/IrdWeatherPanel.tsx');
const { IrdDropletPanel } = await import('../src/features/ird/IrdDropletPanel.tsx');
const { IrdHistoryModal } = await import('../src/features/ird/IrdHistoryModal.tsx');
const { IrdGuideModal } = await import('../src/features/ird/IrdGuideModal.tsx');

const baseInput = (overrides = {}) => ({
  weather: { windSpeedKmh: 7, windGustsKmh: 9, temperatureC: 21, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'open_meteo_cache', weatherAgeMinutes: 10, ...overrides.weather },
  nozzle: { nozzleType: 'Fenda', dropletClass: 'M', referencePressureBar: 3, pressureMinBar: 1.5, pressureMaxBar: 5, workingPressureBar: 3, hasAirSleeve: false, ...overrides.nozzle },
  operation: { applicationDomain: 'horizontal_boom', travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5, ...overrides.operation },
  exposure: { distanceToSensitiveAreaM: 20, labelMinBufferM: 5, hasDownwindSensitiveTarget: false, ...overrides.exposure }
});

describe('IRD — UI Modular, Estados, Acessibilidade, Gating e Offline', () => {
  it('1. Todos os 7 componentes UI e App.tsx respeitam o teto de <= 200 LOC e vocabulário PT-PT', () => {
    const uiFiles = ['IrdCalculatorView.tsx', 'IrdParameterPanel.tsx', 'IrdWeatherPanel.tsx', 'IrdDropletPanel.tsx', 'IrdResultCard.tsx', 'IrdHistoryModal.tsx', 'IrdGuideModal.tsx'];
    for (const f of uiFiles) {
      const content = fs.readFileSync(path.resolve('src/features/ird', f), 'utf8');
      const lines = content.split('\n').length;
      assert.ok(lines <= 200, `${f} excede 200 linhas (${lines})`);
      assert.ok(!/\bcuba\b/i.test(content) && !/\bPF\b/.test(content), `${f} viola vocabulário PT-PT`);
      assert.ok(!content.includes('firebase/firestore') && !content.includes('outboxService'), `${f} não pode chamar Firestore ou Outbox`);
    }
    const appLines = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8').split('\n').length;
    assert.ok(appLines <= 200, `App.tsx excede 200 linhas (${appLines})`);
  });

  it('2. Renderiza estados loading, vazio/fail-closed, erro/bloqueado e normal com role="status" e role="alert"', () => {
    const loadingHtml = renderToStaticMarkup(React.createElement(IrdResultCard, { result: null, isLoading: true }));
    assert.ok(loadingHtml.includes('aria-busy="true"') && loadingHtml.includes('role="status"'));

    const emptyRes = calculateDriftRiskIndex(baseInput({ nozzle: { workingPressureBar: null } }));
    const emptyHtml = renderToStaticMarkup(React.createElement(IrdResultCard, { result: emptyRes, isLoading: false }));
    assert.ok(emptyHtml.includes('DADOS INCOMPLETOS') && emptyHtml.includes('role="alert"') && emptyHtml.includes('O rótulo DGAV/SIFITO prevalece sempre.'));

    const blockedRes = calculateDriftRiskIndex(baseInput({ weather: { precipitationMm: 1.2 } }));
    const blockedHtml = renderToStaticMarkup(React.createElement(IrdResultCard, { result: blockedRes, isLoading: false }));
    assert.ok(blockedHtml.includes('role="alert"') && blockedHtml.includes('não é certificação legal nem ISO 22866'));

    const normalRes = calculateDriftRiskIndex(baseInput());
    const normalHtml = renderToStaticMarkup(React.createElement(IrdResultCard, { result: normalRes, isLoading: false }));
    assert.ok(normalHtml.includes(String(normalRes.irdScore)) && normalHtml.includes('Origem do diâmetro usado:') && normalHtml.includes('Catálogo'));
  });

  it('3. Renderiza painéis com acessibilidade (>= 48px .touch-target, labels), cache válida vs expirada e gota opcional', () => {
    const validW = renderToStaticMarkup(React.createElement(IrdWeatherPanel, {
      weather: baseInput().weather, isOffline: true, isWeatherLoading: false, weatherError: null, locationName: 'Viseu',
      onChangeSource: () => {}, onRefreshWeather: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(validW.includes('Cache válida') && validW.includes('Dispositivo Offline') && validW.includes('for="ird-meteo-source"'));

    const expiredW = renderToStaticMarkup(React.createElement(IrdWeatherPanel, {
      weather: baseInput({ weather: { weatherAgeMinutes: 40 } }).weather, isOffline: true, isWeatherLoading: false, weatherError: null, locationName: 'Viseu',
      onChangeSource: () => {}, onRefreshWeather: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(expiredW.includes('Cache expirada') && expiredW.includes('confirmar no campo'));

    const dropOpen = renderToStaticMarkup(React.createElement(IrdDropletPanel, {
      isOpen: true, mode: 'rotary', nozzle: { workingPressureBar: 3, representativeDropletDiameterUm: 280, measurementSource: 'manufacturer_spec' },
      resolvedProfile: resolveNozzleDriftProfile({ workingPressureBar: 3, representativeDropletDiameterUm: 280, measurementSource: 'manufacturer_spec', nozzleType: 'rotativo' }, 3),
      onToggleOpen: () => {}, onModeChange: () => {}, onChangeFields: () => {}, onOpenKeypad: () => {}, onClear: () => {}
    }));
    assert.ok(dropOpen.includes('aria-expanded="true"') && dropOpen.includes('Modo A: Bico rotativo / drone') && dropOpen.includes('for="ird-rep-diam"'));

    const paramHtml = renderToStaticMarkup(React.createElement(IrdParameterPanel, {
      cultureLabel: 'Olival', windDirectionLabel: 'NW', catalogNozzles: NOZZLES_DATABASE.slice(0, 5), selectedNozzleId: NOZZLES_DATABASE[0].id,
      nozzle: buildNozzleInputFromCatalog(NOZZLES_DATABASE[0], 3), operation: baseInput().operation, exposure: baseInput().exposure,
      onChangeCultureLabel: () => {}, onSelectNozzle: () => {}, onChangeOperation: () => {}, onToggleAirSleeve: () => {}, onToggleDownwind: () => {}, onOpenKeypad: () => {}, onClearOptionalExposure: () => {}
    }));
    assert.ok(paramHtml.includes('touch-target') && paramHtml.includes('for="ird-nozzle-select"'));
  });

  it('4. Guia, Histórico modal, isolamento por userId offline e gating V-PAGES / V-PROD / V-DEV', async () => {
    const guideHtml = renderToStaticMarkup(React.createElement(IrdGuideModal, { isOpen: true, onClose: () => {} }));
    assert.ok(guideHtml.includes('aria-modal="true"') && guideHtml.includes('O rótulo DGAV/SIFITO prevalece sempre.') && guideHtml.includes('ISO 22866'));

    const tempDb = new DaterraDatabase(`DaterraUI_Test_${Date.now()}`);
    await tempDb.open();
    const resA = calculateDriftRiskIndex(baseInput());
    await saveIrdAssessment('ui-user-a', baseInput(), resA, { name: 'Vinha Teste' }, tempDb);
    const listA = await listIrdHistory('ui-user-a', tempDb);
    const listB = await listIrdHistory('ui-user-b', tempDb);
    assert.equal(listA.length, 1);
    assert.equal(listB.length, 0);

    const histHtml = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: listA, isLoading: false, userId: 'ui-user-a', onClose: () => {}, onDelete: () => {} }));
    assert.ok(histHtml.includes('aria-modal="true"') && histHtml.includes('local_only') && histHtml.includes('Vinha Teste'));
    assert.equal(await softDeleteIrdAssessment(listA[0].id, 'ui-user-a', tempDb), true);
    await tempDb.delete();

    assert.equal(BLOCKED_TOOL_IDS_IN_PAGES.has('calc_ird'), true);
    assert.equal(resolveReleaseRoute('/ferramentas/risco-deriva', '', 'pages').status, 'blocked');
    assert.equal(resolveReleaseRoute('/ferramentas', '?tool=calc_ird', 'pages').status, 'blocked');
    assert.equal(resolveReleaseRoute('/ferramentas/risco-deriva', '', 'development').status, 'allowed');
    assert.ok(fs.readFileSync(path.resolve('src/App.tsx'), 'utf8').includes("getDaterraEnvironment() === 'development' ? <IrdCalculatorView />"));
  });
});
