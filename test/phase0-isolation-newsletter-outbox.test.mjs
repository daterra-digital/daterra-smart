/**
 * DATERRA Smart - Testes Reais Fase 0:
 * Isolamento Multi-Utilizador (0.6), Newsletter Opcao B (0.7) e Outbox/Sync Opcao B (0.8)
 */
import 'fake-indexeddb/auto';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { db } from '../src/db/db.ts';
import {
  listMixHistoryForUser,
  countMixHistoryForUser,
  saveMixHistoryForUser,
  deleteMixHistoryForUser,
  clearMixHistoryForUser
} from '../src/features/mistura/mixHistoryStorage.ts';
import {
  listEppoHistoryForUser,
  addEppoHistoryForUser,
  deleteEppoHistoryForUser
} from '../src/features/ajuste-dose/eppoHistoryStorage.ts';
import {
  loadPreInspectionHistory,
  savePreInspectionRecord,
  deletePreInspectionRecord
} from '../src/features/pre-inspecao/preInspectionStorage.ts';
import {
  syncCultureTelemetryToProfile,
  syncEquipmentEfficiencyFactor
} from '../src/features/ajuste-dose-eppo/eppoProfileSyncService.ts';
import {
  syncCultureTelemetry,
  syncEquipmentEfficiency
} from '../src/features/perfis/services/profileTelemetrySync.ts';
import {
  syncNewsletterPreference,
  NEWSLETTER_EXTERNAL_BFF_ENABLED
} from '../src/services/newsletter/newsletterSyncService.ts';
import { handleNewsletterSubscriptionSync } from '../src/services/newsletter/newsletterOutboxHandler.ts';
import {
  getOutboxSyncStatus,
  requestBackgroundSync
} from '../src/services/outbox/outboxService.ts';
import {
  shouldShowOutboxSyncIndicator,
  shouldShowOutboxBanner,
  getOutboxSyncCopy
} from '../src/components/layout/outboxSyncNoticeLogic.ts';

describe('Fase 0 (0.6): Isolamento de Historicos Locais e Alinhamento Outbox', () => {
  it('1. mixHistoryStorage isola registos por userId e preserva registos legados sem userId', async () => {
    await db.mix_history.clear();
    await db.mix_history.add({
      date: '2026-01-01T10:00:00.000Z',
      selected_formulation_ids: ['WG']
    });
    const idA = await saveMixHistoryForUser('user-A', {
      date: '2026-11-01T10:00:00.000Z',
      selected_formulation_ids: ['SC']
    });
    const idB = await saveMixHistoryForUser('user-B', {
      date: '2026-11-01T11:00:00.000Z',
      selected_formulation_ids: ['EC']
    });

    await assert.rejects(() => saveMixHistoryForUser('', { date: '2026-11-01', selected_formulation_ids: ['PH'] }));
    assert.equal(await countMixHistoryForUser(undefined), 0);
    assert.equal(await countMixHistoryForUser('user-A'), 1);
    assert.equal((await listMixHistoryForUser('user-A')).map(r => r.id).length, 1);

    // User B nao consegue apagar registo de User A
    assert.equal(await deleteMixHistoryForUser(Number(idA), 'user-B'), false);
    assert.equal(await countMixHistoryForUser('user-A'), 1);

    // clearMixHistoryForUser apaga apenas registos de User A, mantendo User B e legado
    await clearMixHistoryForUser('user-A');
    assert.equal(await countMixHistoryForUser('user-A'), 0);
    assert.equal(await countMixHistoryForUser('user-B'), 1);
    assert.ok(await db.mix_history.get(Number(idB)));
    assert.equal((await db.mix_history.toArray()).length, 2, 'Legado sem userId e User B preservados');
  });

  it('2. eppoHistoryStorage isola registos por userId e bloqueia eliminacao cruzada', async () => {
    await db.eppo_history.clear();
    await db.eppo_history.add({ date: '2026-01-01T09:00:00.000Z', inputs: {}, results: {} });
    const idA = await addEppoHistoryForUser('user-A', { date: '2026-11-01T09:00:00.000Z', inputs: { a: 1 }, results: {} });
    await addEppoHistoryForUser('user-B', { date: '2026-11-01T10:00:00.000Z', inputs: { b: 2 }, results: {} });

    assert.equal((await listEppoHistoryForUser(null)).length, 0);
    assert.equal((await listEppoHistoryForUser('user-A')).length, 1);
    assert.equal(await deleteEppoHistoryForUser(Number(idA), 'user-B'), false);
    assert.equal((await listEppoHistoryForUser('user-A')).length, 1);
    assert.equal((await db.eppo_history.toArray()).length, 3, 'Legado preservado');
  });

  it('3. preInspectionStorage isola localStorage por userId sem apagar dados legados', () => {
    const store = new Map();
    const origLocalStorage = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    };

    try {
      store.set('daterra_pre_inspection_history_v1', JSON.stringify([
        { id: 'legacy-1', dateIso: '2026-01-01T00:00:00Z', equipmentId: 'barras_horizontais', equipmentTitle: 'Legado', conformityPct: 100, conformeCount: 5, anomaliaCount: 0, totalSubQuestions: 5, answers: {} }
      ]));

      assert.deepEqual(loadPreInspectionHistory(), []);
      const resA = savePreInspectionRecord({
        equipmentId: 'barras_horizontais',
        equipmentTitle: 'Barra A',
        conformityPct: 80,
        conformeCount: 4,
        anomaliaCount: 1,
        totalSubQuestions: 5,
        answers: {}
      }, 'user-A');
      savePreInspectionRecord({
        equipmentId: 'culturas_arbustivas',
        equipmentTitle: 'Atom B',
        conformityPct: 100,
        conformeCount: 5,
        anomaliaCount: 0,
        totalSubQuestions: 5,
        answers: {}
      }, 'user-B');

      assert.equal(loadPreInspectionHistory('user-A').length, 1);
      assert.equal(loadPreInspectionHistory('user-B').length, 1);

      // User B tenta apagar registo de A ou legado: nao deve remover
      deletePreInspectionRecord(resA[0].id, 'user-B');
      deletePreInspectionRecord('legacy-1', 'user-B');
      assert.equal(loadPreInspectionHistory('user-A').length, 1);

      const persistedRaw = JSON.parse(store.get('daterra_pre_inspection_history_v1'));
      assert.ok(persistedRaw.some((r) => r.id === 'legacy-1'), 'Registo legado mantido intacto no storage');
    } finally {
      globalThis.localStorage = origLocalStorage;
    }
  });

  it('4. eppoProfileSyncService e profileTelemetrySync propagam userId e EntityType canonico', async () => {
    await db.profiles_cultures.clear();
    await db.profiles_equipment.clear();
    await db.mutation_outbox.clear();

    const eqId = await db.profiles_equipment.add({ name: 'Pulv Teste', tank_capacity_l: 1000, userId: 'uid-real-1' });
    const cultId = await db.profiles_cultures.add({ name: 'Pomar Teste', crop_type: 'Pomar', area_ha: 4, userId: 'uid-real-1' });

    await syncEquipmentEfficiency(Number(eqId), { efficiency_pct: 92 }, 'uid-real-1');
    await syncCultureTelemetry(Number(cultId), { lwa_m2_ha: 10500 }, 'uid-real-1');
    await syncEquipmentEfficiencyFactor(Number(eqId), 0.9, 'uid-real-1');

    await syncCultureTelemetryToProfile({
      userId: 'uid-real-1',
      cultureName: 'Vinha Teste',
      lwaReal: 11000,
      alturaM: 1.4,
      larguraCopaM: 0.7,
      entrelinhaM: 2.5,
      cropStructure: 'sebe'
    });

    const outbox = await db.mutation_outbox.toArray();
    assert.equal(outbox.length, 4);
    assert.equal(outbox[0].entityType, 'equipment');
    assert.equal(outbox[0].userId, 'uid-real-1');
    assert.equal(outbox[1].entityType, 'culture');
    assert.equal(outbox[1].userId, 'uid-real-1');
    assert.equal(outbox[2].entityType, 'equipment');
    assert.equal(outbox[2].userId, 'uid-real-1');
    assert.equal(outbox[3].entityType, 'culture');
    assert.equal(outbox[3].userId, 'uid-real-1');
  });
});

describe('Fase 0 (0.7 & 0.8): Newsletter Opcao B e Background Sync Opcao B', () => {
  beforeEach(async () => {
    await db.mutation_outbox.clear();
  });

  it('1. Newsletter desativa BFF orfao, grava Firestore e assinala estado pendente', async () => {
    assert.equal(NEWSLETTER_EXTERNAL_BFF_ENABLED, false);
    const serviceSrc = fs.readFileSync(path.resolve('src/services/newsletter/newsletterSyncService.ts'), 'utf8');
    assert.ok(!serviceSrc.includes('httpsCallable'), 'Nao deve invocar Cloud Function callable inexistente');

    const result = await syncNewsletterPreference(
      { uid: 'uid-1', email: 'agricultor@example.com', subscribed: true },
      {
        authUidGetter: () => 'uid-1',
        authEmailGetter: () => 'agricultor@example.com',
        firestoreWriter: async () => {},
        isOnlineGetter: () => true
      }
    );

    assert.equal(result.success, true);
    assert.equal(result.persistedInFirestore, true);
    assert.equal(result.syncedWithBff, false);
    assert.equal(result.bffSyncPending, true);
    assert.equal(result.queuedInOutbox, false, 'Nao deve gerar mutacao infinita de BFF inexistente');
  });

  it('2. Newsletter offline retem apenas destino firestore com userId e handler drena legado BFF sem bloquear logout', async () => {
    const offlineResult = await syncNewsletterPreference(
      { uid: 'uid-1', email: 'agricultor@example.com', subscribed: true },
      {
        authUidGetter: () => 'uid-1',
        authEmailGetter: () => 'agricultor@example.com',
        firestoreWriter: async () => { throw new Error('offline'); },
        isOnlineGetter: () => false
      }
    );
    assert.equal(offlineResult.queuedInOutbox, true);
    const queued = await db.mutation_outbox.toArray();
    assert.equal(queued[0].userId, 'uid-1');
    assert.deepEqual(queued[0].payload.pendingDestinations, ['firestore']);

    // Mutacao legada apenas com 'bff' resolve sem bloquear sessao
    const legacyBffRes = await handleNewsletterSubscriptionSync(
      {
        id: 99,
        entityId: 'uid-1',
        entityType: 'newsletter_subscription',
        operation: 'UPDATE',
        synced: 0,
        attempts: 0,
        updatedAt: '2026-11-10T10:00:00Z',
        payload: { uid: 'uid-1', email: 'agricultor@example.com', subscribed: true, pendingDestinations: ['bff'] }
      },
      {
        authUidGetter: () => 'uid-1',
        authEmailGetter: () => 'agricultor@example.com',
        firestoreWriter: async () => {},
        outboxUpdater: async () => {}
      }
    );
    assert.equal(legacyBffRes.success, true);
    assert.equal(legacyBffRes.action, 'SYNCED');
  });

  it('3. Outbox remove Background Sync falso, expoe foreground-only e driver simulado CentralGest', () => {
    const status = getOutboxSyncStatus();
    assert.equal(status.mode, 'foreground-only');
    assert.equal(status.backgroundSyncSupported, false);
    assert.equal(status.driver, 'centralgest');
    assert.equal(status.isSimulatedDriver, true);

    const outboxSrc = fs.readFileSync(path.resolve('src/services/outbox/outboxService.ts'), 'utf8');
    const mainSrc = fs.readFileSync(path.resolve('src/main.tsx'), 'utf8');
    assert.ok(!outboxSrc.includes('sync.register'), 'Nao deve registar Background Sync nao suportado pelo SW');
    assert.ok(!mainSrc.includes('SYNC_OUTBOX'), 'main.tsx nao deve escutar evento inexistente de SW');
    assert.doesNotThrow(() => requestBackgroundSync());
  });

  it('4. Visibilidade UI de sincronizacao apenas com pendencias/simulacao e acessibilidade em desktop/mobile', () => {
    assert.equal(shouldShowOutboxSyncIndicator(0, { isSimulatedDriver: false }), false);
    assert.equal(shouldShowOutboxSyncIndicator(2, { isSimulatedDriver: false }), true);
    assert.equal(shouldShowOutboxSyncIndicator(0, { isSimulatedDriver: true }), true);
    assert.equal(shouldShowOutboxBanner(0, { isSimulatedDriver: true }), false);
    assert.equal(shouldShowOutboxBanner(1, { isSimulatedDriver: true }), true);

    const simCopy = getOutboxSyncCopy(0, { isSimulatedDriver: true });
    assert.equal(simCopy.shortFallback, 'Simulação CentralGest');
    assert.match(simCopy.detailFallback, /aplicação aberta/);
    assert.match(simCopy.detailFallback, /modo de simulação/);

    const localCopy = getOutboxSyncCopy(3, { isSimulatedDriver: false });
    assert.equal(localCopy.shortFallback, 'Sincronização local (3)');

    const noticeSrc = fs.readFileSync(path.resolve('src/components/layout/OutboxSimulationNotice.tsx'), 'utf8');
    const desktopNavSrc = fs.readFileSync(path.resolve('src/components/layout/PrivateDesktopNav.tsx'), 'utf8');
    const mobileNavSrc = fs.readFileSync(path.resolve('src/components/layout/PrivateNavDrawer.tsx'), 'utf8');

    assert.ok(noticeSrc.includes('role="status"'));
    assert.ok(noticeSrc.includes('aria-expanded'));
    assert.ok(noticeSrc.includes('min-h-[48px]'));
    assert.ok(noticeSrc.includes('touch-target'));
    assert.ok(desktopNavSrc.includes('<OutboxSimulationNotice variant="desktop"'));
    assert.ok(mobileNavSrc.includes('<OutboxSimulationNotice variant="mobile"'));
    assert.ok(desktopNavSrc.split('\n').length < 200);
  });

  it('5. src/db/types.ts respeita <= 200 linhas e tipos de historico residem em ficheiros dedicados', () => {
    const typesContent = fs.readFileSync(path.resolve('src/db/types.ts'), 'utf8');
    const typesLines = typesContent.split('\n').length;
    assert.ok(typesLines <= 200, `src/db/types.ts tem ${typesLines} linhas (deve ser <= 200)`);
    assert.ok(!typesContent.includes('export interface MixHistoryRecord'));
    assert.ok(!typesContent.includes('export interface EppoHistoryRecord'));
    assert.ok(fs.existsSync(path.resolve('src/features/mistura/types/mixHistory.ts')));
    assert.ok(fs.existsSync(path.resolve('src/features/ajuste-dose-eppo/types/eppoHistory.ts')));
  });
});
