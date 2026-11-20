import 'fake-indexeddb/auto';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { db } from '../src/db/db.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';
import { calculateDriftRiskIndex } from '../src/features/ird/irdEngine.ts';
import {
  IRD_CALCULATOR_ID,
  IRD_CALCULATOR_VERSION,
  listIrdHistory,
  saveIrdAssessment,
  softDeleteIrdAssessment
} from '../src/features/ird/irdHistoryAdapter.ts';

const sampleInput = (windSpeedKmh = 6) => ({
  weather: { windSpeedKmh, windGustsKmh: windSpeedKmh + 2, temperatureC: 20, relativeHumidityPct: 65, precipitationMm: 0, weatherSource: 'manual_field' },
  nozzle: { nozzleType: 'Fenda', dropletClass: 'M', referencePressureBar: 3, pressureMinBar: 1.5, pressureMaxBar: 5, workingPressureBar: 3, hasAirSleeve: false },
  operation: { applicationDomain: 'horizontal_boom', travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 },
  exposure: { distanceToSensitiveAreaM: 20, labelMinBufferM: 5, hasDownwindSensitiveTarget: false }
});

describe('IRD — Isolamento por Utilizador e Invariantes SEC-02 / SEC-16', () => {
  beforeEach(async () => {
    await db.open();
    await db.calculation_history_v2.clear();
  });

  afterEach(async () => {
    await db.calculation_history_v2.clear();
  });

  it('1. Mantém Dexie v13 e respeita contrato de isolamento por userId', async () => {
    assert.equal(db.verno, 13);

    const inputA = sampleInput(6);
    const resA = calculateDriftRiskIndex(inputA);
    assert.equal(resA.status, 'CALCULATED');

    const saved = await saveIrdAssessment('user-a', inputA, resA, { name: 'Parcela Vinha Norte' });
    assert.equal(saved.userId, 'user-a');
    assert.equal(saved.calculatorId, IRD_CALCULATOR_ID);
    assert.equal(saved.calculatorVersion, IRD_CALCULATOR_VERSION);
    assert.equal(saved.syncStatus, 'local_only');
    assert.equal(saved.syncedAt, null);
    assert.equal(saved.isDeleted, false);
    assert.ok(saved.inputs.windSpeedKmh && saved.outputs.irdScore && saved.outputs.legalDisclaimer);
  });

  it('2. Bloqueia LEGACY_UNASSIGNED_MARKER, userId vazio e local-user na gravação e leitura', async () => {
    const input = sampleInput(5);
    const res = calculateDriftRiskIndex(input);

    await assert.rejects(() => saveIrdAssessment(LEGACY_UNASSIGNED_MARKER, input, res), /userId inválido/);
    await assert.rejects(() => saveIrdAssessment('', input, res), /userId inválido/);
    await assert.rejects(() => saveIrdAssessment('   ', input, res), /userId inválido/);
    await assert.rejects(() => saveIrdAssessment('local-user', input, res), /userId inválido/);

    assert.deepEqual(await listIrdHistory(LEGACY_UNASSIGNED_MARKER), []);
    assert.deepEqual(await listIrdHistory(''), []);
    assert.deepEqual(await listIrdHistory(null), []);
  });

  it('3. Separação estrita entre Utilizador A, Utilizador B e registos legados órfãos', async () => {
    const inA = sampleInput(5);
    const inB = sampleInput(12);
    const recA = await saveIrdAssessment('user-a', inA, calculateDriftRiskIndex(inA), { name: 'Registo A' });
    const recB = await saveIrdAssessment('user-b', inB, calculateDriftRiskIndex(inB), { name: 'Registo B' });

    await db.calculation_history_v2.put({
      ...recA,
      id: 'legacy-orphan-id',
      userId: LEGACY_UNASSIGNED_MARKER,
      name: 'Órfão Legado'
    });

    const listA = await listIrdHistory('user-a');
    const listB = await listIrdHistory('user-b');
    assert.equal(listA.length, 1);
    assert.equal(listA[0].id, recA.id);
    assert.equal(listB.length, 1);
    assert.equal(listB[0].id, recB.id);

    const crossDelete = await softDeleteIrdAssessment(recA.id, 'user-b');
    assert.equal(crossDelete, false, 'Utilizador B não pode eliminar registo de A');
    assert.equal((await listIrdHistory('user-a')).length, 1);
  });

  it('4. Respeita ordenação descendente por createdAt e limite máximo de 20 registos ativos', async () => {
    const input = sampleInput(6);
    const res = calculateDriftRiskIndex(input);

    for (let i = 0; i < 20; i++) {
      const rec = await saveIrdAssessment('user-quota', input, res, { name: `Calc ${i}` });
      await db.calculation_history_v2.update(rec.id, {
        createdAt: `2026-11-10T10:${String(i).padStart(2, '0')}:00.000Z`
      });
    }

    const active = await listIrdHistory('user-quota');
    assert.equal(active.length, 20);
    assert.equal(active[0].name, 'Calc 19');
    assert.equal(active[19].name, 'Calc 0');

    await assert.rejects(() => saveIrdAssessment('user-quota', input, res), /history_quota_exceeded/);
  });

  it('5. Logout (padrão SEC-16) apaga apenas registos do utilizador ativo preservando B e legados', async () => {
    const cleanupSource = fs.readFileSync(path.resolve('src/services/auth/sessionCleanupService.ts'), 'utf8');
    assert.ok(cleanupSource.includes('db.calculation_history_v2'));
    assert.ok(cleanupSource.includes(".where('userId').equals(targetUserId).delete()"));

    const inA = sampleInput(6);
    const inB = sampleInput(9);
    const recA = await saveIrdAssessment('user-a', inA, calculateDriftRiskIndex(inA));
    const recB = await saveIrdAssessment('user-b', inB, calculateDriftRiskIndex(inB));
    await db.calculation_history_v2.put({ ...recA, id: 'legacy-keep', userId: LEGACY_UNASSIGNED_MARKER });

    // Executa o exato passo de purga SEC-16 sobre calculation_history_v2 para 'user-a'
    await db.calculation_history_v2.where('userId').equals('user-a').delete();

    assert.equal((await listIrdHistory('user-a')).length, 0);
    assert.equal((await listIrdHistory('user-b')).length, 1);
    assert.equal((await listIrdHistory('user-b'))[0].id, recB.id);
    assert.ok(await db.calculation_history_v2.get('legacy-keep'), 'Registo legado não é apagado pela purga de A');
  });
});
