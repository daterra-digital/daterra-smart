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
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { DaterraDatabase } = await import('../src/db/db.ts');
const { NOZZLES_DATABASE } = await import('../src/features/nozzle-comparison/nozzleComparison.data.ts');
const { IRD_FAIL_CLOSED_RULES } = await import('../src/features/ird/irdConfig.ts');
const { calculateDriftRiskIndex } = await import('../src/features/ird/irdEngine.ts');
const { resolveActiveIrdContext } = await import('../src/features/ird/irdContextResolver.ts');
const { IrdCertifiedReductionPanel } = await import('../src/features/ird/IrdCertifiedReductionPanel.tsx');
const { saveIrdAssessment, listIrdHistory } = await import('../src/features/ird/irdHistoryAdapter.ts');
const { readIrdHistoryTrace } = await import('../src/features/ird/irdHistorySnapshot.ts');
const { IrdHistoryModal } = await import('../src/features/ird/IrdHistoryModal.tsx');
const {
  applyNozzleCascadeStep,
  copyCalibrationProfileToManual, copyCultureProfileToManual, copyEquipmentProfileToManual, copyNozzleProfileToManual,
  createInitialCalibrationState, createInitialCultureState, createInitialEquipmentState, createInitialExposureState, createInitialNozzleState
} = await import('../src/features/ird/irdContextCopies.ts');

const wOk = { windSpeedKmh: 6, windGustsKmh: 8, temperatureC: 20, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 };

describe('IRD — Origem Exclusiva Perfil | Manual, Cascata de Bicos, Equipamento Contextual e Certificação', () => {
  let dbName;
  beforeEach(() => { dbName = `DaterraOrig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; });
  afterEach(async () => { await new DaterraDatabase(dbName).delete(); });

  it('1. Origem exclusiva perfil | manual: dados da origem inativa nunca entram no motor e Copiar não altera perfis', () => {
    const origEq = { id: 1, userId: 'u1', name: 'Boom 1000L', tank_capacity_l: 1000, distribution_type: 'Barra horizontal', has_air_sleeve: true, boom_height_m: 0.6 };
    const origCal = { id: 2, userId: 'u1', equipment_name: 'Calib 1', working_speed_kmh: 7, working_pressure_bar: 3, working_width_m: 12, active_nozzles_count: 24, total_flow_lmin: 18, calculated_spray_volume_lha: 150, droplet_size_um: 250 };
    const origCult = { id: 3, userId: 'u1', name: 'Trigo Norte', area_ha: 10, crop_type: 'Cereal' };
    const origNoz = NOZZLES_DATABASE[0];

    const resolvedProf = resolveActiveIrdContext({
      activeWeather: wOk, locationName: 'Beja',
      culture: { mode: 'profile', selectedProfileId: '3', manualLabel: 'IGNORAR_MANUAL' },
      equipment: { mode: 'profile', selectedProfileId: '1', manual: { applicationDomain: 'manual_lance', airAssistStatus: 'no' } },
      nozzle: { ...createInitialNozzleState(), mode: 'profile', selectedProfileId: '4', manualCascade: { brand: 'TeeJet', model: 'XR', sprayAngle: 110, swirlPlate: '', disc: '', catalogNozzleId: NOZZLES_DATABASE[50].id } },
      calibration: { mode: 'profile', selectedProfileId: '2', manual: { ...createInitialCalibrationState().manual, workingPressureBar: 12, travelSpeedKmh: 15, boomOrReleaseHeightM: 2.5 } },
      exposure: createInitialExposureState(),
      profiles: {
        cultures: [origCult], equipments: [origEq], calibrations: [origCal], catalog: NOZZLES_DATABASE,
        profileNozzles: [{ id: 4, userId: 'u1', manufacturer: origNoz.brand, model: origNoz.model, color: origNoz.color || '', iso_classification: '', nozzle_type: origNoz.nozzleType, spray_angle: '80', working_pressure_bar: 10, nominal_flow_lmin: 0.4 }]
      }
    });

    assert.equal(resolvedProf.irdInput.nozzle.workingPressureBar, 3);
    assert.equal(resolvedProf.irdInput.operation.travelSpeedKmh, 7);
    assert.equal(resolvedProf.irdInput.operation.boomOrReleaseHeightM, 0.6);
    assert.equal(resolvedProf.irdInput.operation.applicationDomain, 'horizontal_boom');
    assert.equal(resolvedProf.irdInput.nozzle.hasAirSleeve, true);
    assert.equal(resolvedProf.irdInput.nozzle.measuredDv10Um, undefined);
    assert.equal(resolvedProf.cultureDisplayName, 'Trigo Norte');

    const copiedCal = copyCalibrationProfileToManual({ mode: 'profile', selectedProfileId: '2', manual: createInitialCalibrationState().manual }, [origCal], 0.6);
    assert.equal(copiedCal.mode, 'manual');
    assert.equal(copiedCal.manual.workingPressureBar, 3);
    assert.equal(copiedCal.manual.boomOrReleaseHeightM, 0.6);
    assert.equal(origCal.droplet_size_um, 250);
    assert.equal(copyCultureProfileToManual({ mode: 'profile', selectedProfileId: '3', manualLabel: '' }, [origCult]).manualLabel, 'Trigo Norte (Cereal)');
    assert.equal(copyEquipmentProfileToManual({ mode: 'profile', selectedProfileId: '1', manual: { applicationDomain: 'manual_lance', airAssistStatus: 'no' } }, [origEq]).manual.airAssistStatus, 'yes');
    const profNozEntry = { id: 4, userId: 'u1', manufacturer: origNoz.brand, model: origNoz.model, color: origNoz.color || '', iso_classification: '', nozzle_type: origNoz.nozzleType, spray_angle: '80', working_pressure_bar: 10, nominal_flow_lmin: 0.4 };
    const copiedNoz = copyNozzleProfileToManual({ ...createInitialNozzleState(), mode: 'profile', selectedProfileId: '4', profileConfirmedCatalogId: origNoz.id }, [profNozEntry], NOZZLES_DATABASE);
    assert.equal(copiedNoz.mode, 'manual');
    assert.equal(copiedNoz.manualCascade.catalogNozzleId, origNoz.id);
    assert.equal(profNozEntry.model, origNoz.model);
  });

  it('2. Equipamento contextual preserva airSleeveOperationFactor=0.85 só em barras e nunca em copa/manual/desconhecido', () => {
    assert.equal(IRD_FAIL_CLOSED_RULES.airSleeveOperationFactor, 0.85);
    const fanEq = { id: 10, userId: 'u1', name: 'Atomizador', tank_capacity_l: 2000, distribution_type: 'Ventilador', fan_type: 'Axial', has_air_sleeve: true };
    const cal10 = { id: 20, userId: 'u1', equipment_name: 'Calib Atom', working_speed_kmh: 5, working_pressure_bar: 10, working_width_m: 4, active_nozzles_count: 10, total_flow_lmin: 15, calculated_spray_volume_lha: 400 };
    const ctx = resolveActiveIrdContext({
      evaluationLevel: 'level3_profiles', activeWeather: wOk, locationName: 'Douro',
      culture: { mode: 'profile', selectedProfileId: '1', manualLabel: '' },
      equipment: { mode: 'profile', selectedProfileId: '10', manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'yes' } },
      nozzle: createInitialNozzleState(),
      calibration: { ...createInitialCalibrationState(), mode: 'profile', selectedProfileId: '20' },
      exposure: createInitialExposureState(),
      profiles: { cultures: [{ id: 1, userId: 'u1', name: 'Vinha', area_ha: 5, crop_type: 'Vinha' }], equipments: [fanEq], profileNozzles: [], calibrations: [cal10], catalog: NOZZLES_DATABASE }
    });
    assert.equal(ctx.irdInput.operation.applicationDomain, 'orchard_airblast');
    assert.equal(ctx.activeAirAssistStatus, 'yes');
    assert.equal(ctx.irdInput.nozzle.hasAirSleeve, false);

    const copyAmb = copyEquipmentProfileToManual({ mode: 'profile', selectedProfileId: '11', manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'yes' } }, [{ id: 11, userId: 'u1', name: 'Pneumático X', tank_capacity_l: 600, distribution_type: 'Pneumático' }]);
    assert.equal(copyAmb.manual.airAssistStatus, 'unknown');
  });

  it('3. Cascata de bicos do Comparador limpa níveis dependentes, atinge variante >150 e certificação nunca altera score', () => {
    const modular = NOZZLES_DATABASE.find((n) => Boolean(n.swirlPlate && n.disc));
    let cas = applyNozzleCascadeStep(createInitialNozzleState().manualCascade, { type: 'brand', value: modular.brand });
    cas = applyNozzleCascadeStep(cas, { type: 'model', value: modular.model });
    cas = applyNozzleCascadeStep(cas, { type: 'swirl', value: modular.swirlPlate });
    cas = applyNozzleCascadeStep(cas, { type: 'disc', value: modular.disc });
    cas = applyNozzleCascadeStep(cas, { type: 'nozzle', value: modular.id });
    assert.equal(cas.catalogNozzleId, modular.id);

    const changedBrand = applyNozzleCascadeStep(cas, { type: 'brand', value: 'TeeJet' });
    assert.equal(changedBrand.model, '');
    assert.equal(changedBrand.swirlPlate, '');
    assert.equal(changedBrand.disc, '');
    assert.equal(changedBrand.catalogNozzleId, '');

    const baseCtx = resolveActiveIrdContext({
      activeWeather: wOk, locationName: 'Santarém',
      culture: createInitialCultureState(),
      equipment: createInitialEquipmentState(),
      nozzle: { ...createInitialNozzleState(), manualCascade: cas },
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 5, travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 } },
      exposure: { distanceToSensitiveAreaM: 0, labelBufferKnown: true, labelMinBufferM: 0, downwindStatus: 'no', sensitiveZoneCategory: 'watercourse' },
      profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    const resBase = calculateDriftRiskIndex(baseCtx.irdInput, baseCtx.catalogNozzle);
    const withCertCtx = resolveActiveIrdContext({
      activeWeather: wOk, locationName: 'Santarém',
      culture: createInitialCultureState(),
      equipment: createInitialEquipmentState(),
      nozzle: { ...createInitialNozzleState(), manualCascade: cas, certifiedReduction: { ...createInitialNozzleState().certifiedReduction, status: 'documented', reductionPct: 90, scope: 'nozzle_variant', source: 'documented_catalog' } },
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 5, travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 } },
      exposure: { distanceToSensitiveAreaM: 0, labelBufferKnown: true, labelMinBufferM: 0, downwindStatus: 'no', sensitiveZoneCategory: 'watercourse' },
      profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    const resWithCert = calculateDriftRiskIndex(withCertCtx.irdInput, withCertCtx.catalogNozzle);
    assert.equal(resBase.status, 'CALCULATED');
    assert.equal(resWithCert.irdScore, resBase.irdScore, 'Redução certificada não pode descontar pontuação');
    assert.equal(baseCtx.irdInput.exposure.distanceToSensitiveAreaM, 0);
    assert.equal(baseCtx.irdInput.exposure.labelMinBufferM, 0);

    const certHtml = renderToStaticMarkup(React.createElement(IrdCertifiedReductionPanel, {
      value: { ...createInitialNozzleState().certifiedReduction, status: 'documented', reductionPct: 75, scope: 'nozzle_variant', source: 'user_declaration' },
      onChange: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(certHtml.includes('Informação registada; não aplicada à pontuação nesta versão') && certHtml.includes('não constitui certificação verificada'));
  });

  it('4. Snapshot histórico grava origens ativas, redução não aplicada e lê legado em segurança', async () => {
    const localDb = new DaterraDatabase(dbName);
    await localDb.open();
    const ctx = resolveActiveIrdContext({
      activeWeather: wOk, locationName: 'Évora',
      culture: { mode: 'manual', selectedProfileId: '', manualLabel: 'Vinha Velha' },
      equipment: createInitialEquipmentState(),
      nozzle: { ...createInitialNozzleState(), certifiedReduction: { ...createInitialNozzleState().certifiedReduction, status: 'documented', reductionPct: 90, scope: 'equipment_technique', source: 'documented_catalog' } },
      calibration: { ...createInitialCalibrationState(), manual: { ...createInitialCalibrationState().manual, workingPressureBar: 3, travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 } },
      exposure: { distanceToSensitiveAreaM: null, labelBufferKnown: false, labelMinBufferM: null, downwindStatus: 'unknown', sensitiveZoneCategory: 'apiary_pollinators' },
      profiles: { cultures: [], equipments: [], profileNozzles: [], calibrations: [], catalog: NOZZLES_DATABASE }
    });
    const res = calculateDriftRiskIndex(ctx.irdInput, ctx.catalogNozzle);
    await saveIrdAssessment('orig-u1', ctx.irdInput, res, {
      name: 'Vinha Velha (Évora)',
      originTrace: { ...ctx.originTrace, activeAirAssistStatus: ctx.activeAirAssistStatus, downwindStatus: 'unknown', labelBufferKnown: false, sensitiveZoneCategory: 'apiary_pollinators', certifiedReduction: { ...createInitialNozzleState().certifiedReduction, status: 'documented', reductionPct: 90, scope: 'equipment_technique', source: 'documented_catalog' } }
    }, localDb);
    const [rec] = await listIrdHistory('orig-u1', localDb);
    assert.equal(rec.inputs.equipmentOriginMode.rawValue, 'manual');
    assert.equal(rec.inputs.airAssistStatus.rawValue, 'unknown');
    assert.equal(rec.inputs.downwindStatus.rawValue, 'unknown');
    assert.equal(rec.inputs.labelMinBufferM.rawValue, 'nao_conhecida');
    assert.equal(rec.inputs.certifiedReductionPct.rawValue, 90);
    assert.equal(rec.inputs.certifiedReductionAppliedToScore.rawValue, 'nao');

    const trace = readIrdHistoryTrace(rec);
    assert.ok(trace.originSummaryPt?.includes('Equip.: Manual'));
    assert.ok(trace.certifiedReductionSummaryPt?.includes('90%'));
    const modalHtml = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: [rec], isLoading: false, userId: 'orig-u1', onClose: () => {}, onDelete: () => {} }));
    assert.ok(modalHtml.includes('Equip.: Manual') && modalHtml.includes('não aplicada à pontuação'));
    localDb.close();
  });
});
