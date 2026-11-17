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
const { IrdMeteoChips } = await import('../src/features/ird/IrdMeteoChips.tsx');
const { IrdResultCard } = await import('../src/features/ird/IrdResultCard.tsx');
const { IrdQuickEvalPanel } = await import('../src/features/ird/IrdQuickEvalPanel.tsx');
const { IrdProfilesOnlyPanel } = await import('../src/features/ird/IrdProfilesOnlyPanel.tsx');
const { IrdHistoryModal } = await import('../src/features/ird/IrdHistoryModal.tsx');

const wOk = { windSpeedKmh: 7, windGustsKmh: 9, temperatureC: 21, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'open_meteo_cache', weatherAgeMinutes: 5 };
const wEval = { status: 'VALID', validity: 'valid', score: 24, band: 'BAIXO', bandLabelPt: 'Potencial baixo', dominantFactorPt: 'Vento moderado', windKmh: 7, gustsKmh: 9, deltaTC: 4.5, humidityPct: 60, precipMm: 0, isGustEstimated: false, isPrecipZeroLegitimate: true, notesPt: [] };

describe('IRD Onda 1 — Chips Nativos, 3 Níveis, Altura Honesta, Assistência de Ar e Histórico', () => {
  let dbName;
  beforeEach(() => { dbName = `DaterraLv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; });
  afterEach(async () => { await new DaterraDatabase(dbName).delete(); });

  it('1. IrdMeteoChips usa ícones Lucide nativos sem emojis e acessibilidade sr-only / title / aria-expanded', () => {
    const html = renderToStaticMarkup(React.createElement(IrdMeteoChips, { weatherEval: wEval }));
    assert.ok(html.includes('<svg') && html.includes('aria-expanded="false"'));
    assert.ok(html.includes('Vento médio a 10 metros') && html.includes('Rajada máxima a 10 metros') && html.includes('Delta T'));
    assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(html));
  });

  it('2. Nível 2 Rápida Parcial (3 vars) calcula com fallback explícito e Nível 2 Rápida Manual completa com bico + exposição', () => {
    const partialCtx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: wOk, locationName: 'Santarém',
      culture: createInitialCultureState(), equipment: createInitialEquipmentState(), nozzle: createInitialNozzleState(),
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 3, travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 } },
      exposure: createInitialExposureState(),
      profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    assert.equal(partialCtx.assessmentLevelSnapshot, 'quick_partial');
    const partialRes = calculateDriftRiskIndex(partialCtx.irdInput, partialCtx.catalogNozzle);
    assert.equal(partialRes.status, 'CALCULATED');
    assert.equal(partialRes.derived.dropletSource, 'conservative_fallback');

    const partialCard = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_partial', result: partialRes, isLoading: false,
      onOpenGuideTopic: () => {}
    }));
    assert.ok(partialCard.includes('2. Rápida (Manual)') && partialCard.includes('Avaliação parcial') && partialCard.includes('Ver detalhes no Guia Técnico'));
    assert.ok(!partialCard.includes('BLOQUEADO') && !partialCard.includes('Resumo antes de guardar'));

    const n0 = NOZZLES_DATABASE[0];
    const fullCtx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: wOk, locationName: 'Santarém',
      culture: createInitialCultureState(),
      equipment: { ...createInitialEquipmentState(), manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'yes' } },
      nozzle: { ...createInitialNozzleState(), manualCascade: { brand: n0.brand, model: n0.model, sprayAngle: n0.sprayAngleDeg ?? '', swirlPlate: '', disc: '', catalogNozzleId: n0.id } },
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 3, travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 } },
      exposure: { distanceToSensitiveAreaM: 25, labelBufferKnown: true, labelMinBufferM: 5, downwindStatus: 'no', sensitiveZoneCategory: 'watercourse' },
      profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    assert.equal(fullCtx.assessmentLevelSnapshot, 'quick_manual');
    assert.equal(fullCtx.irdInput.nozzle.hasAirSleeve, true);
    assert.equal(calculateDriftRiskIndex(fullCtx.irdInput, fullCtx.catalogNozzle).status, 'CALCULATED');
  });

  it('3. Altura honesta bloqueia modo descritivo e tri-state de assistência de ar aparece nas 3 famílias (fator 0.85 só em barras)', () => {
    const descCtx = resolveActiveIrdContext({
      evaluationLevel: 'level2_quick', activeWeather: wOk, locationName: 'Douro',
      culture: createInitialCultureState(),
      equipment: { ...createInitialEquipmentState(), manual: { applicationDomain: 'orchard_airblast', airAssistStatus: 'yes' } },
      nozzle: createInitialNozzleState(),
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 8, travelSpeedKmh: 5, boomOrReleaseHeightM: null, heightMode: 'descriptive_unavailable' } },
      exposure: createInitialExposureState(),
      profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    assert.ok(descCtx.blockingGapsPt.some((g) => g.includes('não é inventado 0,5 m')));
    assert.equal(descCtx.irdInput.operation.boomOrReleaseHeightM, null);
    assert.equal(descCtx.irdInput.nozzle.hasAirSleeve, false);

    const quickOrchardHtml = renderToStaticMarkup(React.createElement(IrdQuickEvalPanel, {
      catalogNozzles: NOZZLES_DATABASE, culture: createInitialCultureState(),
      equipment: { ...createInitialEquipmentState(), manual: { applicationDomain: 'orchard_airblast', airAssistStatus: 'unknown' } },
      nozzle: createInitialNozzleState(), calibration: createInitialCalibrationState(), exposure: createInitialExposureState(),
      resolvedProfile: null, onChangeCulture: () => {}, onChangeEquipment: () => {}, onChangeNozzle: () => {},
      onChangeCalibration: () => {}, onChangeExposure: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(quickOrchardHtml.includes('Assistência de ar') && quickOrchardHtml.includes('Desconhecido') && quickOrchardHtml.includes('Modo descritivo'));
  });

  it('4. Nível 3 usa perfis exclusivamente, bloqueia lacunas honestamente e histórico guarda assessmentLevel e heightMode', async () => {
    const n0 = NOZZLES_DATABASE[0];
    const boomProfiles = {
      cultures: [{ id: 1, userId: 'u1', name: 'Milho', area_ha: 12, crop_type: 'Cereal', canopy_height_m: 1.4 }],
      equipments: [{ id: 2, userId: 'u1', name: 'Barras 12m', tank_capacity_l: 1000, distribution_type: 'Barra horizontal', has_air_sleeve: true, boom_height_m: 0.55 }],
      profileNozzles: [{ id: 3, userId: 'u1', manufacturer: n0.brand, model: n0.model, color: '', iso_classification: '', nozzle_type: n0.nozzleType, spray_angle: '80', working_pressure_bar: 3, nominal_flow_lmin: 0.8 }],
      calibrations: [{ id: 4, userId: 'u1', equipment_name: 'Calib Barra', working_speed_kmh: 7, working_pressure_bar: 3, working_width_m: 12, active_nozzles_count: 24, total_flow_lmin: 19, calculated_spray_volume_lha: 140 }],
      catalog: NOZZLES_DATABASE
    };
    const okLv3 = resolveActiveIrdContext({
      evaluationLevel: 'level3_profiles', activeWeather: wOk, locationName: 'Ribatejo',
      culture: { mode: 'profile', selectedProfileId: '1', manualLabel: '' },
      equipment: { mode: 'profile', selectedProfileId: '2', manual: { applicationDomain: 'manual_lance', airAssistStatus: 'no' } },
      nozzle: { ...createInitialNozzleState(), mode: 'profile', selectedProfileId: '3', profileConfirmedCatalogId: n0.id },
      calibration: { ...createInitialCalibrationState(), mode: 'profile', selectedProfileId: '4' },
      exposure: createInitialExposureState(), profiles: boomProfiles
    });
    assert.equal(okLv3.assessmentLevelSnapshot, 'detailed_profiles');
    assert.equal(okLv3.blockingGapsPt.length, 0);
    assert.equal(okLv3.originTrace.equipmentProfileId, '2');

    const gapLv3 = resolveActiveIrdContext({
      evaluationLevel: 'level3_profiles', activeWeather: wOk, locationName: 'Douro',
      culture: { mode: 'profile', selectedProfileId: '1', manualLabel: '' },
      equipment: { mode: 'profile', selectedProfileId: '99', manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'no' } },
      nozzle: createInitialNozzleState(), calibration: createInitialCalibrationState(), exposure: createInitialExposureState(),
      profiles: { ...boomProfiles, equipments: [{ id: 99, userId: 'u1', name: 'Atomizador', tank_capacity_l: 1500, distribution_type: 'Atomizador' }] }
    });
    assert.ok(gapLv3.blockingGapsPt.length >= 2);
    const lv3Html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(IrdProfilesOnlyPanel, {
      userId: 'u1', cultures: boomProfiles.cultures, equipments: [{ id: 99, userId: 'u1', name: 'Atomizador', tank_capacity_l: 1500, distribution_type: 'Atomizador' }],
      profileNozzles: boomProfiles.profileNozzles, calibrations: boomProfiles.calibrations, catalogNozzles: NOZZLES_DATABASE,
      culture: { mode: 'profile', selectedProfileId: '1', manualLabel: '' },
      equipment: { mode: 'profile', selectedProfileId: '99', manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'no' } },
      nozzle: createInitialNozzleState(), calibration: createInitialCalibrationState(), blockingGapsPt: gapLv3.blockingGapsPt,
      onChangeCulture: () => {}, onChangeEquipment: () => {}, onChangeNozzle: () => {}, onChangeCalibration: () => {}, onSwitchToQuickManual: () => {}
    })));
    assert.ok(lv3Html.includes('Mudar para Avaliação Rápida Manual') && lv3Html.includes('/definicoes?tab=cultura') && !lv3Html.includes('workingPressureBar'));

    const localDb = new DaterraDatabase(dbName);
    await localDb.open();
    const resLv3 = calculateDriftRiskIndex(okLv3.irdInput, okLv3.catalogNozzle);
    await saveIrdAssessment('lv3-u1', okLv3.irdInput, resLv3, {
      name: 'Milho (Ribatejo)',
      originTrace: { ...okLv3.originTrace, assessmentLevel: okLv3.assessmentLevelSnapshot, evaluationOrigin: 'profile', heightMode: okLv3.activeHeightMode, activeAirAssistStatus: okLv3.activeAirAssistStatus, downwindStatus: 'unknown', labelBufferKnown: false, sensitiveZoneCategory: '' }
    }, localDb);
    const [rec] = await listIrdHistory('lv3-u1', localDb);
    const trace = readIrdHistoryTrace(rec);
    assert.equal(trace.assessmentLevel, 'detailed_profiles');
    assert.equal(rec.inputs.equipmentProfileId.rawValue, '2');
    const histHtml = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: [rec], isLoading: false, userId: 'lv3-u1', onClose: () => {}, onDelete: () => {} }));
    assert.ok(histHtml.includes('Detalhada por Perfis') && histHtml.includes('Altura da barra ao solo'));
    await localDb.delete();
  });
});
