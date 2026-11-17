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
const { resolveActiveIrdContext } = await import('../src/features/ird/irdContextResolver.ts');
const { createInitialCalibrationState, createInitialCultureState, createInitialEquipmentState, createInitialExposureState, createInitialNozzleState } = await import('../src/features/ird/irdContextCopies.ts');
const { IRD_GUIDE_QA_ITEMS } = await import('../src/features/ird/irdGuideSections.ts');
const { buildPreSaveSummary } = await import('../src/features/ird/irdPreSaveBuilder.ts');
const { buildIrdGuideContext } = await import('../src/features/ird/irdGuideContextBuilder.ts');
const { IrdQuickEvalPanel } = await import('../src/features/ird/IrdQuickEvalPanel.tsx');
const { IrdProfilesOnlyPanel } = await import('../src/features/ird/IrdProfilesOnlyPanel.tsx');
const { IrdWeatherPanel } = await import('../src/features/ird/IrdWeatherPanel.tsx');
const { IrdResultCard } = await import('../src/features/ird/IrdResultCard.tsx');
const { IrdGuideModal } = await import('../src/features/ird/IrdGuideModal.tsx');

describe('IRD — Arquitetura de Inputs, Acordeões, Guia Contextual e Resumo Pré-Gravação', () => {
  it('1. Modo 2 mantém essenciais + Parcela visíveis e organiza complementares nos 3 acordeões + Saber mais', () => {
    const htmlClosed = renderToStaticMarkup(React.createElement(IrdQuickEvalPanel, {
      catalogNozzles: NOZZLES_DATABASE, culture: createInitialCultureState(),
      equipment: createInitialEquipmentState(), nozzle: createInitialNozzleState(),
      calibration: createInitialCalibrationState(), exposure: createInitialExposureState(),
      resolvedProfile: null, onOpenGuideTopic: () => {},
      onChangeCulture: () => {}, onChangeEquipment: () => {}, onChangeNozzle: () => {},
      onChangeCalibration: () => {}, onChangeExposure: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(htmlClosed.includes('id="ird-culture-manual"') && htmlClosed.includes('Parcela / cultura (opcional'));
    assert.ok(htmlClosed.includes('Assistência / transporte de ar') && htmlClosed.includes('Saber mais sobre assistência de ar'));
    for (const acc of ['Acordeão 1 · Bico e espectro de gotas', 'Acordeão 2 · Exposição e zonas sensíveis', 'Acordeão 3 · Contexto, cultura e redução certificada', 'Não altera o índice nesta versão']) {
      assert.ok(htmlClosed.includes(acc), `Falta secção: ${acc}`);
    }

    const htmlOpen = renderToStaticMarkup(React.createElement(IrdQuickEvalPanel, {
      catalogNozzles: NOZZLES_DATABASE, culture: createInitialCultureState(),
      equipment: createInitialEquipmentState(), nozzle: createInitialNozzleState(),
      calibration: createInitialCalibrationState(), exposure: createInitialExposureState(),
      resolvedProfile: null, accordions: { nozzle: true, expo: true, context: true }, onOpenGuideTopic: () => {},
      onChangeCulture: () => {}, onChangeEquipment: () => {}, onChangeNozzle: () => {},
      onChangeCalibration: () => {}, onChangeExposure: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(htmlOpen.includes('Saber mais sobre bico e espectro de gotas') && htmlOpen.includes('Saber mais sobre exposição e zonas sensíveis'));
    assert.ok(htmlOpen.includes('id="ird-cert-status"') && htmlOpen.includes('id="ird-p-dist"'));
  });

  it('2. Modo 3 humaniza rótulos PT-PT, mostra acordeão de cultura em leitura-apenas e exposição conservadora visível', () => {
    const baseProps = {
      userId: 'u1', catalogNozzles: NOZZLES_DATABASE,
      cultures: [{ id: 1, userId: 'u1', name: 'Vinha Norte', area_ha: 4, crop_type: 'Vinha', variety: 'Touriga', phenological_stage: 'Floração', training_system: 'Sebe', row_distance_m: 2.5, canopy_height_m: 1.5, canopy_width_m: 0.7 }],
      equipments: [{ id: 2, userId: 'u1', name: 'Pulv. Barra', tank_capacity_l: 1000, distribution_type: 'Barras horizontais', boom_height_m: 0.5 }],
      profileNozzles: [], calibrations: [],
      culture: { ...createInitialCultureState(), mode: 'profile', selectedProfileId: '1' },
      equipment: { ...createInitialEquipmentState(), mode: 'profile', selectedProfileId: '2' },
      nozzle: { ...createInitialNozzleState(), mode: 'profile' }, calibration: { ...createInitialCalibrationState(), mode: 'profile' },
      blockingGapsPt: ['Calibração: selecione perfil'], onChangeCulture: () => {}, onChangeEquipment: () => {},
      onChangeNozzle: () => {}, onChangeCalibration: () => {}, onSwitchToQuickManual: () => {}
    };
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(IrdProfilesOnlyPanel, { ...baseProps, isCultAccordionOpen: true })));
    assert.ok(!html.includes('horizontal_boom') && !html.includes('Ar: unknown') && !html.includes('custom'));
    assert.ok(html.includes('Barras horizontais') && html.includes('Ar: Desconhecido'));
    assert.ok(html.includes('Touriga') && html.includes('Floração') && html.includes('entrelinha 2.5 m'));
    assert.ok(html.includes('Exposição em modo conservador') && html.includes('não existem dados da aplicação do dia'));
    assert.ok(html.includes('role="alert"') && html.includes('Calibração: selecione perfil'));
  });

  it('3. IrdWeatherPanel isola essenciais vs complementares e mantém alertas críticos fora do acordeão', () => {
    const critHtml = renderToStaticMarkup(React.createElement(IrdWeatherPanel, {
      weather: { windSpeedKmh: null, windGustsKmh: 28, temperatureC: 22, relativeHumidityPct: 55, precipitationMm: 0.5, weatherSource: 'manual_field', weatherAgeMinutes: 0 },
      isOffline: true, isWeatherLoading: false, weatherError: null, locationName: 'Évora',
      isComplementaryOpen: true, onOpenGuideTopic: () => {},
      onChangeSource: () => {}, onRefreshWeather: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(critHtml.includes('Meteorologia essencial em falta') && critHtml.includes('bloqueio operacional ativo'));
    assert.ok(critHtml.includes('Condições meteorológicas complementares') && critHtml.includes('Bolbo húmido') && critHtml.includes('Saber mais sobre meteorologia'));
  });

  it('4. Cartão retira resumo detalhado e Guia Técnico organiza 13 Q&As em acordeões + detalhe contextual opcional', () => {
    const wOk = { windSpeedKmh: 6, windGustsKmh: 9, temperatureC: 21, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 };
    const ctx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: wOk, locationName: 'Beja',
      culture: { ...createInitialCultureState(), manualLabel: 'Talhão A' }, equipment: createInitialEquipmentState(),
      nozzle: createInitialNozzleState(), calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 3, travelSpeedKmh: 8, boomOrReleaseHeightM: 0.5 } },
      exposure: createInitialExposureState(), profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    const res = calculateDriftRiskIndex(ctx.irdInput, ctx.catalogNozzle);
    const summary = buildPreSaveSummary({
      evaluationLevel: 'level2_quick', ctx, result: res, weatherEval: { status: 'VALID' }, weatherSourceLabel: 'Manual em campo',
      nozzle: createInitialNozzleState(), culture: { ...createInitialCultureState(), manualLabel: 'Talhão A' }, missingOpFields: []
    });
    const gCtx = buildIrdGuideContext({
      evaluationLevel: 'level2_quick', ctx, result: res, weatherEval: null, preSaveSummary: summary,
      nozzleState: createInitialNozzleState(), hasCatalogNozzle: Boolean(ctx.catalogNozzle)
    });
    const cardHtml = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_partial', result: res, isLoading: false,
      onOpenGuideTopic: () => {}
    }));
    assert.ok(!cardHtml.includes('Resumo antes de guardar') && !cardHtml.includes('Explicação do cálculo'));
    assert.ok(cardHtml.includes('Avaliação parcial') && cardHtml.includes('Ver detalhes no Guia Técnico'));

    assert.equal(IRD_GUIDE_QA_ITEMS.length, 13);
    const gClosedCtx = renderToStaticMarkup(React.createElement(IrdGuideModal, { isOpen: true, initialTopic: 'air_assist', guideContext: gCtx, onClose: () => {} }));
    assert.ok(gClosedCtx.includes('aria-expanded="false"') && gClosedCtx.includes('aria-expanded="true"') && gClosedCtx.includes('Detalhes desta avaliação') && !gClosedCtx.includes('Talhão A'));
    const gDetailsOpen = renderToStaticMarkup(React.createElement(IrdGuideModal, { isOpen: true, initialTopic: 'details', guideContext: gCtx, onClose: () => {} }));
    assert.ok(gDetailsOpen.includes('Talhão A') && gDetailsOpen.includes('bico ou diâmetro de gota'));
    assert.ok(!/DGAV|SIFITO|\bcuba\b|\bPF\b|local_only|calculation_history_v2/i.test(gDetailsOpen));
  });
});
