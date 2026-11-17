import 'fake-indexeddb/auto';
import { registerHooks } from 'node:module';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

registerHooks({
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
const { calculateDriftRiskIndex } = await import('../src/features/ird/irdEngine.ts');
const { buildNozzleInputFromCatalog } = await import('../src/features/ird/irdNozzleAdapter.ts');
const { listIrdHistory, saveIrdAssessment, softDeleteIrdAssessment } = await import('../src/features/ird/irdHistoryAdapter.ts');
const { readIrdHistoryTrace } = await import('../src/features/ird/irdHistorySnapshot.ts');
const { IrdHistoryModal } = await import('../src/features/ird/IrdHistoryModal.tsx');

const baseWeather = { windSpeedKmh: 7, windGustsKmh: 9, temperatureC: 21, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 };
const baseOp = { applicationDomain: 'horizontal_boom', travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 };
const baseExp = { distanceToSensitiveAreaM: 25, labelMinBufferM: 5, hasDownwindSensitiveTarget: false };

describe('IRD — Bloco C: Histórico com Rastreabilidade Completa e Tolerância a Legados', () => {
  let dbName;
  beforeEach(() => { dbName = `DaterraTrace_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; });
  afterEach(async () => { await new DaterraDatabase(dbName).delete(); });

  it('1. Persiste medições convencionais (DV10/50/90, fonte, pressão, data, confiança) e saídas resolvidas', async () => {
    const localDb = new DaterraDatabase(dbName);
    await localDb.open();
    const input = {
      weather: baseWeather,
      nozzle: { nozzleType: 'Fenda', workingPressureBar: 3, hasAirSleeve: false, measuredDv10Um: 145, measuredDv50Um: 280, measuredDv90Um: 460, measurementSource: 'lab_certificate', measurementPressureBar: 3, measurementDate: '2026-10-01', measurementConfidence: 'ALTA' },
      operation: baseOp, exposure: baseExp
    };
    const res = calculateDriftRiskIndex(input);
    await saveIrdAssessment('trace-u1', input, res, { name: 'Ensaio Lab' }, localDb);
    const [rec] = await listIrdHistory('trace-u1', localDb);

    assert.equal(rec.syncStatus, 'local_only');
    assert.equal(rec.inputs.measuredDv10Um.rawValue, 145);
    assert.equal(rec.inputs.measuredDv50Um.rawValue, 280);
    assert.equal(rec.inputs.measuredDv90Um.rawValue, 460);
    assert.equal(rec.inputs.measurementSource.rawValue, 'lab_certificate');
    assert.equal(rec.inputs.measurementPressureBar.rawValue, 3);
    assert.equal(rec.inputs.measurementDate.rawValue, '2026-10-01');
    assert.equal(rec.inputs.measurementConfidence.rawValue, 'ALTA');
    assert.equal(rec.outputs.dv10UsedUm.rawValue, 145);
    assert.equal(rec.outputs.dv50UsedUm.rawValue, 280);
    assert.equal(rec.outputs.dv90UsedUm.rawValue, 460);
    assert.equal(rec.outputs.dropletSource.rawValue, 'lab_certificate');
    assert.equal(rec.outputs.dropletConfidence.rawValue, 'ALTA');
    assert.equal(rec.outputs.nozzleResolutionTier.rawValue, res.derived.nozzleResolutionTier);
    assert.equal(rec.inputs.formulaVersion.rawValue, res.versions.formulaVersion);
    assert.equal(rec.inputs.rulesetVersion.rawValue, res.versions.rulesetVersion);
    assert.equal(rec.inputs.nozzleCatalogVersion.rawValue, res.versions.nozzleCatalogVersion);
    assert.ok(!/DGAV|SIFITO/i.test(rec.outputs.legalDisclaimer.label));
    assert.ok(!/DGAV|SIFITO/i.test(rec.inputs.labelMinBufferM.label));

    const html = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: [rec], isLoading: false, userId: 'trace-u1', onClose: () => {}, onDelete: () => {} }));
    assert.ok(html.includes('Certificado laboratorial') && html.includes('DV10 145') && html.includes('limpos ao terminar sessão'));
    localDb.close();
  });

  it('2. Persiste bico rotativo (diâmetro representativo) sem inventar DV90 e preserva fallback do catálogo', async () => {
    const localDb = new DaterraDatabase(dbName);
    await localDb.open();

    const rotaryInput = {
      weather: baseWeather,
      nozzle: { nozzleType: 'rotativo', workingPressureBar: 3, hasAirSleeve: false, representativeDropletDiameterUm: 310, measurementSource: 'manufacturer_spec', measurementConfidence: 'MEDIA' },
      operation: baseOp, exposure: baseExp
    };
    const rotaryRes = calculateDriftRiskIndex(rotaryInput);
    await saveIrdAssessment('trace-u2', rotaryInput, rotaryRes, { name: 'Rotativo' }, localDb);

    const catNozzle = NOZZLES_DATABASE[0];
    const catLabel = `${catNozzle.brand} ${catNozzle.modelNorm}`;
    const catInput = { weather: baseWeather, nozzle: buildNozzleInputFromCatalog(catNozzle, 3), operation: { ...baseOp, travelSpeedKmh: 3.5 }, exposure: baseExp };
    const catRes = calculateDriftRiskIndex(catInput, catNozzle);
    await saveIrdAssessment('trace-u2', catInput, catRes, {
      name: 'Catálogo',
      originTrace: {
        assessmentLevel: 'quick_manual', evaluationOrigin: 'manual', heightMode: 'horizontal_boom_ground',
        cultureOrigin: 'manual', cultureProfileName: null, equipmentOrigin: 'manual', equipmentProfileName: null,
        activeAirAssistStatus: 'yes', nozzleOrigin: 'manual', nozzleProfileLabel: null, nozzleCatalogLabel: catLabel,
        calibrationOrigin: 'manual', calibrationProfileLabel: null, downwindStatus: 'no', labelBufferKnown: true, sensitiveZoneCategory: 'none'
      }
    }, localDb);

    const list = await listIrdHistory('trace-u2', localDb);
    const rotRec = list.find((r) => r.name === 'Rotativo');
    const catRec = list.find((r) => r.name === 'Catálogo');
    assert.equal(rotRec.inputs.representativeDropletDiameterUm.rawValue, 310);
    assert.equal(rotRec.outputs.dv90UsedUm.rawValue, 'nao_aplicavel');
    assert.equal(catRec.inputs.nozzleCatalogLabel.rawValue, catLabel);
    assert.equal(catRec.inputs.measuredDv10Um, undefined);
    assert.equal(catRec.outputs.dropletSource.rawValue, catRes.derived.dropletSource);
    assert.equal(readIrdHistoryTrace(rotRec).dropletDetailPt?.includes('Diâmetro repr. 310 µm'), true);

    const modalPairHtml = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: [catRec, rotRec], isLoading: false, userId: 'trace-u2', onClose: () => {}, onDelete: () => {} }));
    assert.ok(modalPairHtml.includes(`Bico: ${catLabel}`) && modalPairHtml.includes('Assistência de ar: Sim'));
    assert.ok(modalPairHtml.includes('Notas de explicação e premissas') && modalPairHtml.includes('Velocidade (3.5 km/h) &lt;= 4 km/h'));
    assert.ok(!modalPairHtml.includes('Bico: custom') && !modalPairHtml.includes('>custom<'));
    const noAssistNoCustomHtml = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: [rotRec], isLoading: false, userId: 'trace-u2', onClose: () => {}, onDelete: () => {} }));
    assert.ok(!noAssistNoCustomHtml.includes('Bico:'));
    localDb.close();
  });

  it('3. Lê registos legados sem detalhe de espectro sem recalcular e mantém <= 200 LOC / sem Firestore', async () => {
    const legacyRecord = {
      id: 'legacy-1', calculatorId: 'calc_ird', calculatorVersion: '1.0.0', userId: 'trace-legacy',
      createdAt: '2026-10-15T10:00:00.000Z', updatedAt: '2026-10-15T10:00:00.000Z',
      syncStatus: 'local_only', syncedAt: null, isDeleted: false, deletedAt: null,
      name: 'Snapshot Antigo', inputs: {},
      outputs: { irdScore: { rawValue: 28 }, irdClass: { rawValue: 'MODERADO' }, legalVerdict: { rawValue: 'PERMITIDO_COM_RESTRICOES' } }
    };
    const trace = readIrdHistoryTrace(legacyRecord);
    assert.equal(trace.isLegacyWithoutTrace, true);
    assert.equal(legacyRecord.outputs.irdScore.rawValue, 28);

    const modalHtml = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: [legacyRecord], isLoading: false, userId: 'trace-legacy', onClose: () => {}, onDelete: () => {} }));
    assert.ok(modalHtml.includes('Snapshot legado') && modalHtml.includes('Sem notas adicionais disponíveis') && modalHtml.includes('28') && modalHtml.includes('MODERADO'));
    for (const badOwner of [null, '', 'local-user', 'unassigned', 'legacy_local_unassigned']) {
      await assert.rejects(() => saveIrdAssessment(badOwner, { weather: baseWeather, nozzle: { workingPressureBar: 3, hasAirSleeve: false }, operation: baseOp, exposure: baseExp }, calculateDriftRiskIndex({ weather: baseWeather, nozzle: { workingPressureBar: 3, hasAirSleeve: false }, operation: baseOp, exposure: baseExp })), /userId inválido/);
    }

    const localDb = new DaterraDatabase(dbName);
    await localDb.open();
    await localDb.calculation_history_v2.put(legacyRecord);
    assert.equal((await listIrdHistory('trace-legacy', localDb)).length, 1);
    assert.equal(await softDeleteIrdAssessment('legacy-1', 'trace-legacy', localDb), true);
    localDb.close();

    for (const file of ['irdHistorySnapshot.ts', 'irdHistoryAdapter.ts', 'IrdHistoryModal.tsx']) {
      const src = fs.readFileSync(path.resolve('src/features/ird', file), 'utf8');
      assert.ok(src.split('\n').length <= 200, `${file} excede 200 linhas`);
      assert.ok(!src.includes('firebase/firestore') && !src.includes('outboxService') && !src.includes('mutation_outbox'));
    }
  });
});
