/**
 * DATERRA Smart - Testes de Persistência First-Offline & Mutation Outbox (Camada 4)
 * Validação: Dexie v8 Schema, Mutation Outbox, Resolução Last-Write-Wins (LWW) e Retry Backoff
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { db } from '../src/db/db.ts';
import {
  buildMutationRecord,
  calculateBackoffMs,
  sortMutationsLWW,
  drainOutbox,
  initOutboxListeners
} from '../src/services/outbox/outboxService.ts';

describe('Camada 4: Persistência First-Offline & Sincronização Assíncrona (Mutation Outbox)', () => {

  test('1. Esquema Dexie v8 declara a tabela mutation_outbox com índices corretos', () => {
    const tableNames = db.tables.map(t => t.name);
    assert.ok(tableNames.includes('mutation_outbox'), 'A tabela mutation_outbox deve existir na versão 8');

    const outboxTable = db.mutation_outbox;
    assert.ok(outboxTable, 'A propriedade db.mutation_outbox deve estar definida');
    assert.equal(outboxTable.name, 'mutation_outbox', 'Nome da tabela deve ser mutation_outbox');

    // Validar índices definidos no esquema v8
    const schemaIndexNames = outboxTable.schema.indexes.map(idx => idx.name);
    assert.ok(schemaIndexNames.includes('entityId'), 'Índice entityId deve estar definido');
    assert.ok(schemaIndexNames.includes('entityType'), 'Índice entityType deve estar definido');
    assert.ok(schemaIndexNames.includes('operation'), 'Índice operation deve estar definido');
    assert.ok(schemaIndexNames.includes('synced'), 'Índice synced deve estar definido');
    assert.ok(schemaIndexNames.includes('updatedAt'), 'Índice updatedAt deve estar definido');
    assert.ok(schemaIndexNames.includes('attempts'), 'Índice attempts deve estar definido');
  });

  test('2. buildMutationRecord inicializa registo com synced: 0, attempts: 0 e ISO updatedAt', () => {
    const payload = { doseRate: 2.5, tankVolume: 1000, product: 'Fungicida X' };
    const record = buildMutationRecord({
      entityId: 'calc-uuid-101',
      entityType: 'calculation',
      operation: 'CREATE',
      payload
    });

    assert.equal(record.entityId, 'calc-uuid-101');
    assert.equal(record.entityType, 'calculation');
    assert.equal(record.operation, 'CREATE');
    assert.equal(record.synced, 0, 'Registo novo deve iniciar obrigatoriamente com synced: 0');
    assert.equal(record.attempts, 0, 'Registo novo deve ter 0 tentativas de envio');
    assert.deepEqual(record.payload, payload, 'Payload deve ser preservado integralmente');
    assert.ok(!isNaN(Date.parse(record.updatedAt)), 'updatedAt deve ser uma data ISO válida');
  });

  test('3. Algoritmo LWW ordena mutações em ordem cronológica ascendente (mais recente prevalece)', () => {
    const mutations = [
      { id: 1, entityId: 'caderno-1', entityType: 'caderno_campo', operation: 'UPDATE', updatedAt: '2026-10-24T12:00:00.000Z', synced: 0, attempts: 0, payload: { note: 'V1' } },
      { id: 2, entityId: 'caderno-1', entityType: 'caderno_campo', operation: 'UPDATE', updatedAt: '2026-10-24T14:30:00.000Z', synced: 0, attempts: 0, payload: { note: 'V3' } },
      { id: 3, entityId: 'caderno-1', entityType: 'caderno_campo', operation: 'UPDATE', updatedAt: '2026-10-24T13:15:00.000Z', synced: 0, attempts: 0, payload: { note: 'V2' } }
    ];

    const sorted = sortMutationsLWW(mutations);
    assert.equal(sorted[0].id, 1, 'Primeira mutação deve ser a mais antiga');
    assert.equal(sorted[1].id, 3, 'Segunda mutação deve ser a intermédia');
    assert.equal(sorted[2].id, 2, 'Última mutação a executar (vencedora LWW) deve ser a mais recente (V3)');
  });

  test('4. Cálculo de Backoff Exponencial respeita teto máximo de 30.000 ms', () => {
    assert.equal(calculateBackoffMs(0), 1000, '0 tentativas = 1000ms');
    assert.equal(calculateBackoffMs(1), 2000, '1 tentativa = 2000ms');
    assert.equal(calculateBackoffMs(2), 4000, '2 tentativas = 4000ms');
    assert.equal(calculateBackoffMs(3), 8000, '3 tentativas = 8000ms');
    assert.equal(calculateBackoffMs(4), 16000, '4 tentativas = 16000ms');
    assert.equal(calculateBackoffMs(5), 30000, '5 tentativas deve atingir o teto de 30000ms');
    assert.equal(calculateBackoffMs(10), 30000, '10 tentativas deve manter o teto de 30000ms');
  });

  describe('5. Simulação E2E: Ciclo Offline -> Persistência -> Reconexão -> Drenagem Outbox', () => {
    let mockStore = [];
    let originalWhere, originalUpdate, originalAdd;

    beforeEach(() => {
      mockStore = [];
      originalWhere = db.mutation_outbox.where;
      originalUpdate = db.mutation_outbox.update;
      originalAdd = db.mutation_outbox.add;

      // Mock da tabela Dexie para execução determinística em Node
      db.mutation_outbox.where = (field) => {
        return {
          equals: (val) => ({
            toArray: async () => mockStore.filter(item => item[field] === val)
          })
        };
      };

      db.mutation_outbox.update = async (id, changes) => {
        const item = mockStore.find(i => i.id === id);
        if (item) {
          Object.assign(item, changes);
          return 1;
        }
        return 0;
      };
    });

    afterEach(() => {
      db.mutation_outbox.where = originalWhere;
      db.mutation_outbox.update = originalUpdate;
      db.mutation_outbox.add = originalAdd;
    });

    test('Drena com sucesso 3 mutações pendentes quando reconectado à rede', async () => {
      // 1. Simulação: 3 mutações acumuladas offline na Outbox
      mockStore = [
        { id: 101, entityId: 'c1', entityType: 'calibration', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T10:00:00Z', payload: { speed: 6.5 } },
        { id: 102, entityId: 'c2', entityType: 'calculation', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T10:05:00Z', payload: { dose: 1.5 } },
        { id: 103, entityId: 'c3', entityType: 'caderno_campo', operation: 'UPDATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T10:10:00Z', payload: { notes: 'Tratamento Concluído' } }
      ];

      const processedIds = [];
      const mockRemoteHandler = async (mut) => {
        processedIds.push(mut.id);
        return true;
      };

      // 2. Executar drenagem (como ocorreria no evento 'online' ou Background Sync)
      const result = await drainOutbox(mockRemoteHandler);

      assert.equal(result.processed, 3, 'Deve processar exatamente as 3 mutações');
      assert.equal(result.succeeded, 3, 'Todas as 3 devem ter sucesso');
      assert.equal(result.failed, 0, 'Nenhuma deve falhar');
      assert.deepEqual(processedIds, [101, 102, 103], 'IDs processados na ordem esperada');

      // 3. Confirmar que na base de dados todos passaram para synced: 1
      for (const item of mockStore) {
        assert.equal(item.synced, 1, `Item ${item.id} deve estar marcado com synced: 1`);
        assert.equal(item.attempts, 1, `Item ${item.id} deve registar 1 tentativa`);
      }
    });

    test('Tratamento de falha transitória com retry e registo de erro', async () => {
      mockStore = [
        { id: 201, entityId: 'm1', entityType: 'mixture', operation: 'CREATE', synced: 0, attempts: 0, updatedAt: '2026-10-24T11:00:00Z', payload: { p1: 'Cobre' } }
      ];

      // Simulação: Servidor remoto rejeita temporariamente
      let callCount = 0;
      const failingRemoteHandler = async () => {
        callCount++;
        throw new Error('503 Service Unavailable');
      };

      const result = await drainOutbox(failingRemoteHandler);

      assert.equal(result.processed, 1);
      assert.equal(result.succeeded, 0);
      assert.equal(result.failed, 1);
      assert.equal(callCount, 1, 'Handler remoto deve ter sido chamado 1 vez');
      assert.equal(mockStore[0].synced, 0, 'Deve permanecer synced: 0');
      assert.equal(mockStore[0].attempts, 1, 'Deve incrementar tentativas para 1');
      assert.equal(mockStore[0].lastError, '503 Service Unavailable', 'Deve registar a mensagem de erro');
    });
  });

  test('6. initOutboxListeners executa sem erros em ambientes SSR/Node (respeita typeof window)', () => {
    const cleanup = initOutboxListeners();
    assert.equal(typeof cleanup, 'function', 'Deve retornar função de cleanup');
    assert.doesNotThrow(() => cleanup(), 'Cleanup não deve lançar exceções');
  });
});
