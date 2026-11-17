import 'fake-indexeddb/auto';
import { registerHooks } from 'node:module';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

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
        fileName: filePath, compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { DaterraDatabase } = await import('../src/db/db.ts');
const { NOZZLES_DATABASE } = await import('../src/features/nozzle-comparison/nozzleComparison.data.ts');
const { calculateDriftRiskIndex } = await import('../src/features/ird/irdEngine.ts');
const { resolveActiveIrdContext } = await import('../src/features/ird/irdContextResolver.ts');
const { saveIrdAssessment, listIrdHistory } = await import('../src/features/ird/irdHistoryAdapter.ts');
const { readIrdHistoryTrace } = await import('../src/features/ird/irdHistorySnapshot.ts');
const { createInitialCalibrationState, createInitialCultureState, createInitialEquipmentState, createInitialExposureState, createInitialNozzleState } = await import('../src/features/ird/irdContextCopies.ts');
const { IrdResultCard } = await import('../src/features/ird/IrdResultCard.tsx');
const { IrdGuideModal } = await import('../src/features/ird/IrdGuideModal.tsx');
const { buildIrdGuideContext } = await import('../src/features/ird/irdGuideContextBuilder.ts');
const { buildPreSaveSummary } = await import('../src/features/ird/irdPreSaveBuilder.ts');
const { IrdQuickEvalPanel } = await import('../src/features/ird/IrdQuickEvalPanel.tsx');
const { IrdHistoryModal } = await import('../src/features/ird/IrdHistoryModal.tsx');

const wOk = { windSpeedKmh: 7, windGustsKmh: 9, temperatureC: 21, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'open_meteo_cache', weatherAgeMinutes: 5 };

describe('IRD Onda 1 — Auditoria: Chips, Explicação em Bloqueio, Alturas por Família e Histórico', () => {
  let dbName;
  beforeEach(() => { dbName = `DaterraFix_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; });
  afterEach(async () => { await new DaterraDatabase(dbName).delete(); });

  it('1. Chips IRD isolam hover mouse vs toque, suportam foco visível e aria-controls sem emojis', () => {
    const chipsSrc = fs.readFileSync(path.resolve('src/features/ird/IrdMeteoChips.tsx'), 'utf8');
    assert.ok(chipsSrc.includes("e.pointerType === 'mouse'") && !chipsSrc.includes('onMouseEnter'));
    assert.ok(chipsSrc.includes('focus-visible:ring-2') && chipsSrc.includes('aria-controls') && chipsSrc.includes('aria-expanded'));
    assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(chipsSrc));
  });

  it('2. Cartão compacto resume indisponibilidade/parcial e transfere detalhe completo para Guia Técnico', () => {
    const blockedRes = calculateDriftRiskIndex({ weather: wOk, nozzle: { workingPressureBar: 8, hasAirSleeve: false }, operation: { applicationDomain: 'orchard_airblast', travelSpeedKmh: 5, boomOrReleaseHeightM: null }, exposure: { distanceToSensitiveAreaM: null, labelMinBufferM: null, hasDownwindSensitiveTarget: true } });
    const blockedHtml = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_partial', result: blockedRes, isLoading: false,
      blockingGapsPt: ['Modo descritivo (medição exata indisponível)'], onOpenGuideTopic: () => {}
    }));
    assert.ok(blockedHtml.includes('Avaliação indisponível') && blockedHtml.includes('—') && blockedHtml.includes('Modo descritivo (medição exata indisponível)'));
    assert.ok(!blockedHtml.includes('Explicação do cálculo e premissas') && !/\bBloqueado\b/i.test(blockedHtml));

    const partialCtx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: wOk, locationName: 'Santarém',
      culture: createInitialCultureState(), equipment: createInitialEquipmentState(), nozzle: createInitialNozzleState(),
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 3, travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 } },
      exposure: createInitialExposureState(), profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    const partialRes = calculateDriftRiskIndex(partialCtx.irdInput, partialCtx.catalogNozzle);
    const partialHtml = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_partial', result: partialRes, isLoading: false, onOpenGuideTopic: () => {}
    }));
    assert.ok(partialHtml.includes('Avaliação parcial') && partialHtml.includes('Ver detalhes no Guia Técnico'));

    const preSave = buildPreSaveSummary({ evaluationLevel: 'level2_quick', ctx: partialCtx, result: partialRes, weatherEval: { status: 'VALID' }, weatherSourceLabel: 'Cache local', nozzle: createInitialNozzleState(), culture: createInitialCultureState(), missingOpFields: [] });
    const gCtx = buildIrdGuideContext({ evaluationLevel: 'level2_quick', ctx: partialCtx, result: partialRes, weatherEval: null, preSaveSummary: preSave, heightModeLabelPt: 'Altura da barra ao solo', airAssistNotePt: 'Assistência de ar desconhecida', nozzleState: createInitialNozzleState(), hasCatalogNozzle: false });
    const guideHtml = renderToStaticMarkup(React.createElement(IrdGuideModal, { isOpen: true, initialTopic: 'details', guideContext: gCtx, onClose: () => {} }));
    assert.ok(guideHtml.includes('Detalhes desta avaliação') && guideHtml.includes('Assistência de ar desconhecida') && guideHtml.includes('Sem bico no catálogo') && guideHtml.includes('Distância a zona sensível não confirmada'));
  });

  it('3. Modos de altura são diferenciados por família (barras, copa/arbóreas com opção altura de copa, manual)', () => {
    const orchardHtml = renderToStaticMarkup(React.createElement(IrdQuickEvalPanel, {
      catalogNozzles: NOZZLES_DATABASE, culture: createInitialCultureState(),
      equipment: { ...createInitialEquipmentState(), manual: { applicationDomain: 'orchard_airblast', airAssistStatus: 'yes' } },
      nozzle: createInitialNozzleState(), calibration: createInitialCalibrationState(), exposure: createInitialExposureState(),
      resolvedProfile: null, onChangeCulture: () => {}, onChangeEquipment: () => {}, onChangeNozzle: () => {},
      onChangeCalibration: () => {}, onChangeExposure: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(orchardHtml.includes('Altura de copa — requer evolução futura') && orchardHtml.includes('Altura da barra / difusores ao solo'));

    const lanceHtml = renderToStaticMarkup(React.createElement(IrdQuickEvalPanel, {
      catalogNozzles: NOZZLES_DATABASE, culture: createInitialCultureState(),
      equipment: { ...createInitialEquipmentState(), manual: { applicationDomain: 'manual_lance', airAssistStatus: 'no' } },
      nozzle: createInitialNozzleState(), calibration: createInitialCalibrationState(), exposure: createInitialExposureState(),
      resolvedProfile: null, onChangeCulture: () => {}, onChangeEquipment: () => {}, onChangeNozzle: () => {},
      onChangeCalibration: () => {}, onChangeExposure: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(lanceHtml.includes('Altura da lança / barra ao solo') && !lanceHtml.includes('Altura de copa — requer evolução futura'));

    const canopyCtx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: wOk, locationName: 'Douro',
      culture: createInitialCultureState(),
      equipment: { ...createInitialEquipmentState(), manual: { applicationDomain: 'orchard_airblast', airAssistStatus: 'yes' } },
      nozzle: createInitialNozzleState(),
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 8, travelSpeedKmh: 5, boomOrReleaseHeightM: null, heightMode: 'culture_profile_canopy' } },
      exposure: createInitialExposureState(), profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    assert.ok(canopyCtx.blockingGapsPt.some((g) => g.includes('Altura de copa')));
    assert.equal(canopyCtx.irdInput.operation.boomOrReleaseHeightM, null);
  });

  it('4. Histórico modal mostra fallbackFlags, nomes de perfis, altura, origem e assessmentLevel', async () => {
    const localDb = new DaterraDatabase(dbName);
    await localDb.open();
    const partialCtx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: wOk, locationName: 'Évora',
      culture: { mode: 'manual', selectedProfileId: '', manualLabel: 'Olival Sul' },
      equipment: createInitialEquipmentState(), nozzle: createInitialNozzleState(),
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 3, travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 } },
      exposure: createInitialExposureState(), profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    const res = calculateDriftRiskIndex(partialCtx.irdInput, partialCtx.catalogNozzle);
    await saveIrdAssessment('hist-u1', partialCtx.irdInput, res, {
      name: 'Olival Sul (Évora)',
      originTrace: { ...partialCtx.originTrace, equipmentProfileName: 'Pulverizador X', assessmentLevel: partialCtx.assessmentLevelSnapshot, evaluationOrigin: 'manual', heightMode: 'canopy_release', activeAirAssistStatus: 'unknown', downwindStatus: 'unknown', labelBufferKnown: false, sensitiveZoneCategory: '' }
    }, localDb);
    const [rec] = await listIrdHistory('hist-u1', localDb);
    const trace = readIrdHistoryTrace(rec);
    assert.ok(trace.fallbackFlagsPt?.includes('Sem bico no catálogo'));
    assert.equal(trace.evaluationOriginLabelPt, 'Manual');
    assert.ok(trace.profileNamesSummaryPt?.includes('Pulverizador X'));
    const html = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: [rec], isLoading: false, userId: 'hist-u1', onClose: () => {}, onDelete: () => {} }));
    assert.ok(html.includes('Rápida Parcial') && html.includes('Origem: Manual') && html.includes('Fallbacks:') && html.includes('Perfis: Pulverizador X'));
    assert.ok(html.includes('Assistência de ar: Desconhecido') && html.includes('Notas de explicação e premissas'));
    assert.ok(html.includes('Altura (0.5 m) &lt;= referência da família (0.5 m)') && trace.nozzleLabelPt === null && !html.includes('custom'));
    const noAssistRec = { ...rec, inputs: { ...rec.inputs, airAssistStatus: { ...rec.inputs.airAssistStatus, rawValue: 'no' } } };
    assert.equal(readIrdHistoryTrace(noAssistRec).airAssistLabelPt, 'Não');
    await localDb.delete();
  });
});
