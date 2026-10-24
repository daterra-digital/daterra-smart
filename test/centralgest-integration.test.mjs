/**
 * DATERRA Smart - Testes de Integração CentralGest ERPCloud (Ports & Adapters)
 * Validação: Mappers, Idempotência (UUIDv4), Códigos HTTP (200, 400, 409, 500) e Drenagem da Outbox
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { db } from '../src/db/db.ts';
import {
  generateIdempotencyKey,
  mapToErpCulturalOperation,
  mapToErpCalibration,
  mapOutboxMutationToErpPayload
} from '../src/services/integrations/centralgestMapper.ts';
import {
  getCentralgestConfig,
  setCentralgestConfig,
  setSimulationOverride,
  sendMutationToCentralgest,
  centralgestOutboxDriver
} from '../src/services/integrations/centralgestService.ts';
import { drainOutbox } from '../src/services/outbox/outboxService.ts';

describe('Integração CentralGest ERPCloud (Arquitetura Plug-and-Play Desacoplada)', () => {

  beforeEach(() => {
    setCentralgestConfig({ isSimulationMode: true });
    setSimulationOverride(null);
  });

  afterEach(() => {
    setSimulationOverride(null);
  });

  test('1. Geração de Idempotency Key cumpre especificação UUIDv4', () => {
    const key1 = generateIdempotencyKey();
    const key2 = generateIdempotencyKey();

    assert.notEqual(key1, key2, 'Chaves de idempotência devem ser únicas');
    const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.match(key1, uuidv4Regex, 'Chave 1 deve ser um UUIDv4 válido');
    assert.match(key2, uuidv4Regex, 'Chave 2 deve ser um UUIDv4 válido');
  });

  test('2. Mappers convertem puramente entidades locais em DTOs do CentralGest', () => {
    const mutCaderno = {
      id: 1,
      entityId: 'cc-2026-001',
      entityType: 'caderno_campo',
      operation: 'CREATE',
      synced: 0,
      attempts: 0,
      updatedAt: '2026-10-24T14:00:00Z',
      payload: { parcelCode: 'P-DOURO-01', cultureName: 'Vinha', areaHa: 2.5, doseRate: 1.8, productName: 'Fungicida A' }
    };

    const dto = mapToErpCulturalOperation(mutCaderno, 'mock-uuid-key');
    assert.equal(dto.externalId, 'cc-2026-001');
    assert.equal(dto.parcelCode, 'P-DOURO-01');
    assert.equal(dto.cropType, 'Vinha');
    assert.equal(dto.areaHa, 2.5);
    assert.equal(dto.doseRate, 1.8);
    assert.equal(dto.idempotencyKey, 'mock-uuid-key');

    const mutCalib = {
      id: 2,
      entityId: 'cal-2026-002',
      entityType: 'calibration',
      operation: 'UPDATE',
      synced: 0,
      attempts: 0,
      updatedAt: '2026-10-24T14:10:00Z',
      payload: { method: 'LWA', speed: 6.2, targetVolumeLHa: 250, conformsDgav: true }
    };

    const dtoCalib = mapToErpCalibration(mutCalib, 'mock-uuid-key-calib');
    assert.equal(dtoCalib.externalId, 'cal-2026-002');
    assert.equal(dtoCalib.method, 'LWA');
    assert.equal(dtoCalib.workingSpeedKmh, 6.2);
    assert.equal(dtoCalib.targetVolumeLHa, 250);
    assert.equal(dtoCalib.conformsDgav, true);
  });

  test('3. mapOutboxMutationToErpPayload encaminha para os endpoints REST corretos', () => {
    const mut1 = { entityId: 'c1', entityType: 'caderno_campo', operation: 'CREATE', updatedAt: '2026-10-24T10:00:00Z', payload: {} };
    const p1 = mapOutboxMutationToErpPayload(mut1);
    assert.equal(p1.endpoint, '/api/v1/agriculture/cultural-operations');
    assert.equal(p1.method, 'POST');

    const mut2 = { entityId: 'c2', entityType: 'calibration', operation: 'UPDATE', updatedAt: '2026-10-24T10:00:00Z', payload: {} };
    const p2 = mapOutboxMutationToErpPayload(mut2);
    assert.equal(p2.endpoint, '/api/v1/agriculture/calibrations');
    assert.equal(p2.method, 'PUT');
  });

  test('4. Modo Simulação Plug-and-Play responde HTTP 200 sem chamadas de rede externas', async () => {
    assert.equal(getCentralgestConfig().isSimulationMode, true);
    const mut = { id: 10, entityId: 'c10', entityType: 'caderno_campo', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T10:00:00Z', payload: {} };

    const res = await sendMutationToCentralgest(mut);
    assert.equal(res.success, true);
    assert.equal(res.statusCode, 200);
    assert.ok(res.erpTransactionId?.startsWith('SIM-TX-'));
  });

  test('5. Tratamento de Erro de Validação de Cliente (HTTP 400) descarta para não bloquear fila', async () => {
    setSimulationOverride({ statusCode: 400, errorMessage: 'Código de parcela inexistente no CentralGest' });
    const mut = { id: 11, entityId: 'c11', entityType: 'caderno_campo', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T10:00:00Z', payload: {} };

    const driverRes = await centralgestOutboxDriver(mut);
    assert.equal(driverRes.success, false);
    assert.equal(driverRes.action, 'DISCARD');
    assert.equal(driverRes.statusCode, 400);
    assert.match(driverRes.error || '', /inexistente/);
  });

  test('6. Conflito de Concorrência (HTTP 409): Autoridade do servidor ERP prevalece e marca resolvido', async () => {
    setSimulationOverride({ statusCode: 409, errorMessage: 'Registo já alterado no ERPCloud.', conflictDetails: { version: 5 } });
    const mut = { id: 12, entityId: 'c12', entityType: 'caderno_campo', operation: 'UPDATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T10:00:00Z', payload: {} };

    const driverRes = await centralgestOutboxDriver(mut);
    assert.equal(driverRes.success, true);
    assert.equal(driverRes.action, 'SYNCED');
    assert.equal(driverRes.statusCode, 409);
  });

  test('7. Instabilidade / Timeout no Servidor (HTTP 500) lança erro para retenção e backoff', async () => {
    setSimulationOverride({ statusCode: 500, errorMessage: '500 Internal Server Error no cluster ERP' });
    const mut = { id: 13, entityId: 'c13', entityType: 'caderno_campo', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T10:00:00Z', payload: {} };

    await assert.rejects(
      async () => await centralgestOutboxDriver(mut),
      /500 Internal Server Error/
    );
  });

  test('8. Drenagem E2E da Outbox com 5 mutações simultâneas contra o CentralGest Driver', async () => {
    const mockStore = [
      { id: 1, entityId: 'op-1', entityType: 'caderno_campo', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T12:00:00Z', payload: { parcelCode: 'P1' } },
      { id: 2, entityId: 'cal-1', entityType: 'calibration', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T12:01:00Z', payload: { method: 'LWA' } },
      { id: 3, entityId: 'calc-1', entityType: 'calculation', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T12:02:00Z', payload: { dose: 2 } },
      { id: 4, entityId: 'mix-1', entityType: 'mixture', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T12:03:00Z', payload: { name: 'M1' } },
      { id: 5, entityId: 'eq-1', entityType: 'equipment', operation: 'UPDATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T12:04:00Z', payload: { name: 'Pulv-1' } }
    ];

    const origWhere = db.mutation_outbox.where;
    const origUpdate = db.mutation_outbox.update;

    db.mutation_outbox.where = (field) => ({
      equals: (val) => ({ toArray: async () => mockStore.filter(i => i[field] === val) })
    });
    db.mutation_outbox.update = async (id, changes) => {
      const item = mockStore.find(i => i.id === id);
      if (item) Object.assign(item, changes);
      return 1;
    };

    try {
      const result = await drainOutbox(centralgestOutboxDriver);
      assert.equal(result.processed, 5);
      assert.equal(result.succeeded, 5);
      assert.equal(result.failed, 0);

      for (const item of mockStore) {
        assert.equal(item.synced, 1, `Item ${item.id} deve ter passado para synced: 1`);
        assert.equal(item.attempts, 1);
      }
    } finally {
      db.mutation_outbox.where = origWhere;
      db.mutation_outbox.update = origUpdate;
    }
  });
});
