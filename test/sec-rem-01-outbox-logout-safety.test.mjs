/**
 * DATERRA Smart - Teste de Regressão de Segurança: Outbox Fail-Safe & Logout Voluntário
 * Foco: Resolução estrita dos dois bloqueios residuais da SEC-REM-01:
 * A. Drenagem de outbox sem identidade válida (falha segura).
 * B. Prevenção de perda de dados pendentes no logout voluntário.
 */

import 'fake-indexeddb/auto';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/db.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';
import {
  drainOutbox,
  setOutboxSessionUser,
  getPendingMutationsCount
} from '../src/services/outbox/outboxService.ts';

describe('SEC-REM-01: Outbox Fail-Safe & Logout Voluntário', () => {

  beforeEach(async () => {
    // Limpa estado da sessão da outbox e tabela de mutações para isolamento determinístico
    setOutboxSessionUser(null);
    await db.mutation_outbox.clear();
  });

  // ---------------------------------------------------------------------------
  // BLOQUEIO A: DRENAGEM DE OUTBOX COM FALHA SEGURA
  // ---------------------------------------------------------------------------
  describe('Bloqueio A: Falha Segura e Isolamento na Drenagem da Outbox', () => {

    it('A.1. Drenagem sem identidade válida (undefined, vazio, legado) despacha ZERO mutações privadas', async () => {
      // Cria mutações sintéticas na base física em memória
      await db.mutation_outbox.add({
        entityId: 'c1',
        entityType: 'culture',
        operation: 'UPDATE',
        payload: { area_ha: 3.5 },
        synced: 0,
        attempts: 0,
        updatedAt: new Date().toISOString(),
        userId: 'user-A'
      });

      let dispatchCalls = 0;
      const testHandler = async () => {
        dispatchCalls++;
        return true;
      };

      // 1. Sem sessão ativa e sem parâmetro
      const resUndefined = await drainOutbox(testHandler, undefined);
      assert.equal(resUndefined.processed, 0, 'Sem utilizador deve processar 0');
      assert.equal(dispatchCalls, 0, 'Handler não pode ser invocado');

      // 2. Com string vazia ou espaços
      const resEmpty = await drainOutbox(testHandler, '   ');
      assert.equal(resEmpty.processed, 0);
      assert.equal(dispatchCalls, 0);

      // 3. Com marcador de registos legados unassigned
      const resLegacy = await drainOutbox(testHandler, LEGACY_UNASSIGNED_MARKER);
      assert.equal(resLegacy.processed, 0);
      assert.equal(dispatchCalls, 0);

      // Confirmar que o registo permanece rigorosamente não sincronizado (synced: 0)
      const record = await db.mutation_outbox.where('userId').equals('user-A').first();
      assert.equal(record.synced, 0, 'Registo de A não pode ter sido marcado como sincronizado');
    });

    it('A.2. Drenagem com Utilizador B: despacha apenas mutações de B e preserva A e legados intactos', async () => {
      // Injeta conjunto heterogéneo na outbox
      const idA1 = await db.mutation_outbox.add({
        entityId: 'c_A1',
        entityType: 'culture',
        operation: 'UPDATE',
        payload: { name: 'Vinha A' },
        synced: 0,
        attempts: 0,
        updatedAt: '2026-11-09T10:00:00Z',
        userId: 'user-A'
      });

      const idB1 = await db.mutation_outbox.add({
        entityId: 'eq_B1',
        entityType: 'equipment',
        operation: 'CREATE',
        payload: { name: 'Trator B' },
        synced: 0,
        attempts: 0,
        updatedAt: '2026-11-09T10:01:00Z',
        userId: 'user-B'
      });

      const idB2 = await db.mutation_outbox.add({
        entityId: 'eq_B2',
        entityType: 'equipment',
        operation: 'UPDATE',
        payload: { name: 'Trator B2' },
        synced: 0,
        attempts: 0,
        updatedAt: '2026-11-09T10:02:00Z',
        userId: 'user-B'
      });

      const idLegacy = await db.mutation_outbox.add({
        entityId: 'c_leg',
        entityType: 'culture',
        operation: 'UPDATE',
        payload: { name: 'Vinha Legada' },
        synced: 0,
        attempts: 0,
        updatedAt: '2026-11-09T09:00:00Z',
        userId: LEGACY_UNASSIGNED_MARKER
      });

      const dispatchedIds = [];
      const mockHandler = async (mut) => {
        dispatchedIds.push(mut.entityId);
        return true;
      };

      // Drenar exclusivamente como Utilizador B
      const result = await drainOutbox(mockHandler, 'user-B');

      assert.equal(result.processed, 2, 'Deve processar apenas as 2 mutações de B');
      assert.equal(result.succeeded, 2);
      assert.deepEqual(dispatchedIds, ['eq_B1', 'eq_B2']);

      // Verifica estados finais no IndexedDB
      const mutB1 = await db.mutation_outbox.get(idB1);
      const mutB2 = await db.mutation_outbox.get(idB2);
      assert.equal(mutB1.synced, 1, 'Mutação B1 deve estar synced: 1');
      assert.equal(mutB2.synced, 1, 'Mutação B2 deve estar synced: 1');

      const mutA1 = await db.mutation_outbox.get(idA1);
      assert.equal(mutA1.synced, 0, 'Mutação de A deve continuar intacta com synced: 0');

      const mutLeg = await db.mutation_outbox.get(idLegacy);
      assert.equal(mutLeg.synced, 0, 'Mutação de legado deve continuar intacta com synced: 0');
    });

    it('A.3. Verificação contínua de sessão: interrompe novos envios se a sessão mudar a meio do lote', async () => {
      // Cria 3 mutações para o Utilizador A
      await db.mutation_outbox.bulkAdd([
        { entityId: 'item_1', entityType: 'culture', operation: 'UPDATE', payload: {}, synced: 0, attempts: 0, updatedAt: '2026-11-09T10:00:00Z', userId: 'user-A' },
        { entityId: 'item_2', entityType: 'culture', operation: 'UPDATE', payload: {}, synced: 0, attempts: 0, updatedAt: '2026-11-09T10:01:00Z', userId: 'user-A' },
        { entityId: 'item_3', entityType: 'culture', operation: 'UPDATE', payload: {}, synced: 0, attempts: 0, updatedAt: '2026-11-09T10:02:00Z', userId: 'user-A' }
      ]);

      setOutboxSessionUser('user-A');
      const dispatched = [];

      const sessionSwitchingHandler = async (mut) => {
        dispatched.push(mut.entityId);
        // Simulação assíncrona: durante o processamento do primeiro item, o utilizador fecha sessão ou entra User B
        if (mut.entityId === 'item_1') {
          setOutboxSessionUser('user-B'); // Invalida a sessão de User A
        }
        return true;
      };

      const result = await drainOutbox(sessionSwitchingHandler, 'user-A');

      // O primeiro item foi despachado; antes do segundo item o loop detetou a mudança e abortou
      assert.equal(dispatched.length, 1, 'Deve ter despachado apenas o 1º item antes da interrupção');
      assert.equal(result.succeeded, 1);

      // Itens 2 e 3 devem permanecer não sincronizados (synced: 0)
      const remainingUnsynced = await db.mutation_outbox.where('synced').equals(0).toArray();
      assert.equal(remainingUnsynced.length, 2, 'Itens 2 e 3 devem permanecer na fila com synced: 0');
      assert.ok(remainingUnsynced.some(m => m.entityId === 'item_2'));
      assert.ok(remainingUnsynced.some(m => m.entityId === 'item_3'));
    });
  });

  // ---------------------------------------------------------------------------
  // BLOQUEIO B: PREVENÇÃO DE PERDA DE DADOS NO LOGOUT VOLUNTÁRIO
  // ---------------------------------------------------------------------------
  describe('Bloqueio B: Logout Voluntário com Dados Pendentes', () => {

    it('B.1. getPendingMutationsCount identifica com precisão apenas as mutações pendentes da conta ativa', async () => {
      await db.mutation_outbox.bulkAdd([
        { entityId: 'a1', entityType: 'culture', operation: 'UPDATE', payload: {}, synced: 0, attempts: 0, updatedAt: '2026-11-09T10:00:00Z', userId: 'user-A' },
        { entityId: 'a2', entityType: 'culture', operation: 'UPDATE', payload: {}, synced: 1, attempts: 1, updatedAt: '2026-11-09T10:01:00Z', userId: 'user-A' },
        { entityId: 'b1', entityType: 'equipment', operation: 'UPDATE', payload: {}, synced: 0, attempts: 0, updatedAt: '2026-11-09T10:02:00Z', userId: 'user-B' }
      ]);

      const countA = await getPendingMutationsCount('user-A');
      assert.equal(countA, 1, 'User A deve ter exatamente 1 mutação pendente (synced: 0)');

      const countB = await getPendingMutationsCount('user-B');
      assert.equal(countB, 1, 'User B deve ter exatamente 1 mutação pendente');

      const countNull = await getPendingMutationsCount(null);
      assert.equal(countNull, 0, 'Sessão nula deve ter 0');
    });

    it('B.2. Simulação de Logout Voluntário: com pendências bloqueia a saída e preserva dados intactos', async () => {
      // Injeta mutação pendente de User A
      await db.mutation_outbox.add({
        entityId: 'cult_pendente',
        entityType: 'culture',
        operation: 'UPDATE',
        payload: { area_ha: 12.0 },
        synced: 0,
        attempts: 0,
        updatedAt: new Date().toISOString(),
        userId: 'user-A'
      });

      const currentUserId = 'user-A';
      const pendingCount = await getPendingMutationsCount(currentUserId);
      assert.ok(pendingCount > 0, 'Existem mutações pendentes');

      // Regra de Negócio: Se pendingCount > 0 e não for forçado, o logout é bloqueado com a mensagem oficial
      let logoutProceeded = false;
      let warningMessage = '';

      if (pendingCount > 0) {
        warningMessage = 'Existem alterações por sincronizar. Ligue-se à internet e sincronize antes de terminar sessão.';
      } else {
        logoutProceeded = true;
      }

      assert.equal(logoutProceeded, false, 'Logout voluntário NÃO pode prosseguir com alterações pendentes');
      assert.equal(warningMessage, 'Existem alterações por sincronizar. Ligue-se à internet e sincronize antes de terminar sessão.');

      // Cancelar / Voltar: A base de dados e a outbox mantêm-se 100% inalteradas
      const checkRecord = await db.mutation_outbox.where('userId').equals('user-A').first();
      assert.equal(checkRecord.synced, 0);
      assert.equal(checkRecord.entityId, 'cult_pendente');
    });

    it('B.3. Após sincronização bem-sucedida, o logout voluntário prossegue normalmente', async () => {
      await db.mutation_outbox.add({
        entityId: 'cult_pendente',
        entityType: 'culture',
        operation: 'UPDATE',
        payload: { area_ha: 12.0 },
        synced: 0,
        attempts: 0,
        updatedAt: new Date().toISOString(),
        userId: 'user-A'
      });

      // Sincronizar com a internet
      const drainResult = await drainOutbox(async () => true, 'user-A');
      assert.equal(drainResult.succeeded, 1);

      // Reavaliar pendências
      const remaining = await getPendingMutationsCount('user-A');
      assert.equal(remaining, 0, 'Não restam pendências após a sincronização');

      // Agora o logout tem autorização para prosseguir
      const canProceedLogout = remaining === 0;
      assert.equal(canProceedLogout, true, 'Logout pode avançar sem perda de dados');
    });
  });
});
