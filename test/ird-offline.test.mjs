import 'fake-indexeddb/auto';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { DaterraDatabase } from '../src/db/db.ts';
import { calculateDriftRiskIndex } from '../src/features/ird/irdEngine.ts';
import {
  listIrdHistory,
  saveIrdAssessment,
  softDeleteIrdAssessment
} from '../src/features/ird/irdHistoryAdapter.ts';

const offlineInput = () => ({
  weather: { windSpeedKmh: 7, windGustsKmh: 9, temperatureC: 21, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 },
  nozzle: { nozzleType: 'Fenda com indução de ar', dropletClass: 'VC', referencePressureBar: 3, pressureMinBar: 1.5, pressureMaxBar: 6, isAirInductionDeclared: true, workingPressureBar: 3, hasAirSleeve: false },
  operation: { applicationDomain: 'horizontal_boom', travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 },
  exposure: { distanceToSensitiveAreaM: 25, labelMinBufferM: 5, hasDownwindSensitiveTarget: false }
});

describe('IRD — Persistência Offline em Dexie v10 (Zero Firestore / Outbox)', () => {
  let dbName;
  let originalFetch;

  beforeEach(() => {
    dbName = `DaterraSmartDB_Offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new Error('NETWORK_FORBIDDEN_OFFLINE_TEST');
    };
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    const temp = new DaterraDatabase(dbName);
    await temp.delete();
  });

  it('1. Grava, lê e aplica eliminação lógica 100% offline sem Firestore nem Outbox', async () => {
    const adapterSrc = fs.readFileSync(path.resolve('src/features/ird/irdHistoryAdapter.ts'), 'utf8');
    assert.ok(!adapterSrc.includes('firebase/firestore'), 'Adaptador não pode importar Firestore');
    assert.ok(!adapterSrc.includes('outboxService'), 'Adaptador não pode usar Outbox na Fase 1');
    assert.ok(!adapterSrc.includes('mutation_outbox'), 'Adaptador não pode gravar em mutation_outbox');

    const localDb = new DaterraDatabase(dbName);
    await localDb.open();
    assert.equal(localDb.verno, 11);

    const input = offlineInput();
    const res = calculateDriftRiskIndex(input);
    assert.equal(res.status, 'CALCULATED');

    const saved = await saveIrdAssessment('offline-farmer-1', input, res, { name: 'Olival Sul', tags: ['Olival'] }, localDb);
    assert.equal(saved.syncStatus, 'local_only');
    assert.equal(saved.syncedAt, null);
    assert.equal(saved.isDeleted, false);

    const listed = await listIrdHistory('offline-farmer-1', localDb);
    assert.equal(listed.length, 1);
    assert.equal(listed[0].outputs.irdScore.rawValue, res.irdScore);
    assert.equal((await localDb.mutation_outbox.count()), 0, 'Outbox mantém-se vazia na Fase 1');

    const deleted = await softDeleteIrdAssessment(saved.id, 'offline-farmer-1', localDb);
    assert.equal(deleted, true);
    assert.equal((await listIrdHistory('offline-farmer-1', localDb)).length, 0);

    // Registo preservado fisicamente em calculation_history_v2 para auditoria
    const rawAuditRecord = await localDb.calculation_history_v2.get(saved.id);
    assert.ok(rawAuditRecord, 'Eliminação lógica preserva o registo físico na tabela');
    assert.equal(rawAuditRecord.isDeleted, true);
    assert.ok(rawAuditRecord.deletedAt);

    localDb.close();
  });

  it('2. Persistência sobrevive ao fecho e reabertura da base (simulação de recarregamento offline)', async () => {
    const firstSessionDb = new DaterraDatabase(dbName);
    await firstSessionDb.open();

    const in1 = offlineInput();
    const res1 = calculateDriftRiskIndex(in1);
    const saved = await saveIrdAssessment('offline-farmer-2', in1, res1, { name: 'Vinha Encosta' }, firstSessionDb);
    firstSessionDb.close();

    // Nova instância sobre a mesma base IndexedDB após recarregamento
    const reloadedDb = new DaterraDatabase(dbName);
    await reloadedDb.open();
    const restored = await listIrdHistory('offline-farmer-2', reloadedDb);

    assert.equal(restored.length, 1);
    assert.equal(restored[0].id, saved.id);
    assert.equal(restored[0].name, 'Vinha Encosta');
    assert.equal(restored[0].outputs.irdScore.rawValue, res1.irdScore);
    assert.equal(restored[0].outputs.legalDisclaimer.canonicalKey, 'dgav_sifito_disclaimer');

    reloadedDb.close();
  });
});
