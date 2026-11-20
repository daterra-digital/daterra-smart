import fs from 'node:fs';
import path from 'node:path';
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { DaterraDatabase } from '../src/db/db.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';
import {
  compareMomentsByDateAsc,
  findLatestChronologicalMoment,
  formatIsoCivilToDdMmYyyy,
  isChronologicallyLatest,
  parseDdMmYyyyToIso
} from '../src/features/perfis/services/cultureDateUtils.ts';
import { mapMomentToDraftState } from '../src/features/perfis/services/cultureFormState.ts';
import { buildCultureSave } from '../src/features/perfis/services/cultureSaveBuilder.ts';
import {
  detectCultureTelemetryIncoherence,
  evaluateCultureMomentMetrics,
  parseMomentSnapshot
} from '../src/features/perfis/services/cultureEngineCompatibility.ts';
import {
  listMomentsForCulture,
  listRevisionsForMoment,
  saveScopedCultureWithMoment,
  setActiveCultureMoment
} from '../src/features/perfis/services/cultureMomentStorage.ts';
import {
  listUserCustomOptions,
  saveScopedCustomOption
} from '../src/features/perfis/services/cultureCustomOptionStorage.ts';
import {
  deleteScopedProfile,
  deleteUserProfilesBatch,
  setProfileStorageDb
} from '../src/features/perfis/services/profileStorageService.ts';
import { hasLocalUserData } from '../src/services/auth/localUserDataPresence.ts';

const createdDbs = [];
function nextDbName(tag) {
  const name = `DaterraCulturaV11_${tag}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  createdDbs.push(name);
  return name;
}

describe('Perfil Cultura (Dexie v11) — Dados, Migração, Momentos, Isolamento e Compatibilidade', () => {
  after(async () => {
    setProfileStorageDb();
    for (const name of createdDbs) {
      await Dexie.delete(name);
    }
  });

  it('1. Migra base sintética v10 -> v11 de forma idempotente, preserva legados e não apropria registos órfãos', async () => {
    const dbName = nextDbName('mig_v10_v11');
    const legacyDb = new Dexie(dbName);
    legacyDb.version(10).stores({
      calculation_history: '++id, date, calculator_type, profile_id, userId',
      profiles_cultures: '++id, name, crop_type, last_lwa_m2_ha, last_trv_m3_ha, userId',
      profiles_equipment: '++id, name, machine_efficiency_pct, userId',
      profiles_nozzles: '++id, manufacturer, model, equipment_id, userId',
      profiles_calibrations: '++id, equipment_id, nozzle_id, userId',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id',
      calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
      calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted',
      mix_history: '++id, date, userId',
      active_substances: 'id, name, moa, nameEn',
      eppo_history: '++id, date, userId',
      mutation_outbox: '++id, entityId, entityType, operation, synced, updatedAt, attempts, userId'
    });
    await legacyDb.open();
    const ownedId = await legacyDb.table('profiles_cultures').add({
      userId: 'user-mig-1',
      name: 'Talhão Antigo',
      crop_type: 'Vinha',
      area_ha: 4.2,
      row_distance_m: 2.5,
      phenological_stage: 'Floração',
      canopy_height_m: 1.4,
      last_lwa_m2_ha: 11200
    });
    await legacyDb.table('profiles_cultures').add({
      userId: LEGACY_UNASSIGNED_MARKER,
      name: 'Órfã Legada',
      crop_type: 'Oliveira',
      area_ha: 1,
      phenological_stage: 'Floração'
    });
    legacyDb.close();

    const v11 = new DaterraDatabase(dbName);
    await v11.open();
    assert.equal(v11.verno, 13);

    const ownedMoments = await listMomentsForCulture('user-mig-1', Number(ownedId), v11);
    assert.equal(ownedMoments.length, 1);
    assert.equal(ownedMoments[0].observedAt, null);
    assert.equal(ownedMoments[0].measurementSource, 'migrated_legacy_profile');
    assert.equal(formatIsoCivilToDdMmYyyy(ownedMoments[0].observedAt), 'Data desconhecida (legado)');

    const allMoments = await v11.profile_crop_moments.toArray();
    assert.equal(allMoments.length, 1, 'Não deve criar momento para registo órfão __legacy_unassigned__');

    const cultureAfter = await v11.profiles_cultures.get(Number(ownedId));
    assert.equal(cultureAfter?.last_lwa_m2_ha, 11200, 'Telemetria EPPO preservada');
    v11.close();
  });

  it('2. Atomicidade na falha, snapshots imutáveis após alteração de entrelinha e preservação de revisões', async () => {
    const testDb = new DaterraDatabase(nextDbName('atomic_snap'));
    await testDb.open();
    setProfileStorageDb(testDb);

    const { cultureId, momentId } = await saveScopedCultureWithMoment(
      'user-1',
      {
        culturePayload: {
          name: 'Vinha Sul',
          crop_type: 'Vinha',
          culture_key: 'vinha',
          row_distance_m: 2.5
        },
        momentInput: {
          observedAt: '2026-04-10',
          stageLabel: 'Cachos visíveis a floração',
          stageCode: 'BBCH 53–69',
          canopyHeightM: 1.0,
          canopyWidthM: 0.5,
          measurementSource: 'measured_field'
        }
      },
      testDb
    );

    const beforeProfile = await testDb.profiles_cultures.get(cultureId);
    assert.equal('area_ha' in beforeProfile, false, 'Área omitida não deve receber valor fictício');

    // Alterar apenas entrelinha do perfil sem editar o momento histórico
    await saveScopedCultureWithMoment(
      'user-1',
      {
        cultureId,
        culturePayload: {
          name: 'Vinha Sul',
          crop_type: 'Vinha',
          culture_key: 'vinha',
          row_distance_m: 3.0
        }
      },
      testDb
    );

    // Falha transacional propositada (momento inexistente) não pode corromper estado anterior
    await assert.rejects(() =>
      saveScopedCultureWithMoment(
        'user-1',
        {
          cultureId,
          culturePayload: {
            name: 'Vinha Alterada Falhada',
            crop_type: 'Vinha',
            culture_key: 'vinha',
            row_distance_m: 4.0
          },
          momentInput: {
            momentId: 999999,
            observedAt: '2026-05-01',
            stageLabel: 'Outro',
            measurementSource: 'measured_field'
          }
        },
        testDb
      )
    );
    const rolledBackProfile = await testDb.profiles_cultures.get(cultureId);
    assert.equal(rolledBackProfile?.name, 'Vinha Sul');
    assert.equal(rolledBackProfile?.row_distance_m, 3.0);

    // Snapshot de momento passado mantém entrelinha 2.5m e métricas originais (LWA 8000, TRV 2000)
    const moments = await listMomentsForCulture('user-1', cultureId, testDb);
    assert.equal(moments.length, 1);
    const snap = parseMomentSnapshot(moments[0].snapshotJson);
    assert.equal(snap?.rowDistanceM, 2.5);
    assert.equal(snap?.lwaBilateral, 8000);
    assert.equal(snap?.trvPure, 2000);

    // Revisão de data/estádio cria registo na tabela profile_moment_revisions preservando snapshot anterior
    await saveScopedCultureWithMoment(
      'user-1',
      {
        cultureId,
        culturePayload: {
          name: 'Vinha Sul',
          crop_type: 'Vinha',
          culture_key: 'vinha',
          row_distance_m: 3.0
        },
        momentInput: {
          momentId,
          observedAt: '2026-04-12',
          stageLabel: 'Bago de chumbo a ervilha',
          canopyHeightM: 1.2,
          measurementSource: 'measured_field',
          revisionReason: 'Correção da data de observação no caderno de campo'
        }
      },
      testDb
    );

    const revisions = await listRevisionsForMoment('user-1', Number(momentId), testDb);
    assert.equal(revisions.length, 1);
    assert.equal(revisions[0].previousObservedAt, '2026-04-10');
    assert.equal(revisions[0].newObservedAt, '2026-04-12');
    assert.equal(parseMomentSnapshot(revisions[0].snapshotBeforeJson)?.stageLabel, 'Cachos visíveis a floração');

    // Novo momento passado sem marcar como atual mantém momento ativo intacto
    await saveScopedCultureWithMoment(
      'user-1',
      {
        cultureId,
        culturePayload: {
          name: 'Vinha Sul',
          crop_type: 'Vinha',
          culture_key: 'vinha',
          row_distance_m: 3.0
        },
        momentInput: {
          observedAt: '2026-03-20',
          stageLabel: 'Folhas jovens a folhas livres',
          canopyHeightM: 0.6,
          measurementSource: 'measured_field'
        },
        markMomentAsActive: false
      },
      testDb
    );
    const afterPassive = await testDb.profiles_cultures.get(cultureId);
    assert.equal(afterPassive?.active_moment_id, momentId);

    // Trocar momento ativo limpa campos ausentes (ex: largura removida) e não apaga telemetria EPPO
    const allM = await listMomentsForCulture('user-1', cultureId, testDb);
    const passiveId = allM.find((x) => x.id !== momentId)?.id;
    await testDb.profiles_cultures.update(cultureId, { last_calculated_at: '2026-04-01T10:00:00Z', last_lwa_m2_ha: 9500 });
    await setActiveCultureMoment('user-1', cultureId, Number(passiveId), testDb);
    const afterSwitch = await testDb.profiles_cultures.get(cultureId);
    assert.equal(afterSwitch?.active_moment_id, passiveId);
    assert.equal(afterSwitch?.canopy_width_m, undefined);
    assert.equal(afterSwitch?.last_lwa_m2_ha, 9500);
    testDb.close();
  });

  it('3. Concorrência de opções locais evita duplicados, isola por utilizador e preserva opções ao apagar Cultura', async () => {
    const testDb = new DaterraDatabase(nextDbName('opts_delete'));
    await testDb.open();
    setProfileStorageDb(testDb);

    const [optA, optB] = await Promise.all([
      saveScopedCustomOption('user-a', { category: 'variedade', cultureKey: 'vinha', label: 'Touriga  Franca' }, testDb),
      saveScopedCustomOption('user-a', { category: 'variedade', cultureKey: 'vinha', label: 'touriga franca' }, testDb)
    ]);
    assert.equal(optA.option.status, 'pending_local');
    assert.equal(optA.option.localId.startsWith('loc-variedade-'), true);
    assert.equal(optA.option.id, optB.option.id, 'Concorrência deve reutilizar o mesmo registo');
    assert.equal((await listUserCustomOptions('user-b', 'variedade', 'vinha', testDb)).length, 0);

    const { cultureId: blockedCultureId } = await saveScopedCultureWithMoment(
      'user-a',
      { culturePayload: { name: 'Parcela Bloqueada', crop_type: 'Vinha', culture_key: 'vinha' } },
      testDb
    );
    await testDb.calibration_profiles.add({
      id: 'calib-block-1',
      userId: 'user-a',
      name: 'Calib Ativa',
      cultureProfileId: String(blockedCultureId),
      equipmentProfileId: 'eq-1',
      status: 'active',
      syncStatus: 'local_only',
      syncedAt: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await assert.rejects(() => deleteScopedProfile('user-a', 'cultures', blockedCultureId), /calibrações ativas/);

    // Outra cultura apenas com cálculo histórico imutável pode ser eliminada e preserva opções locais
    const { cultureId: freeCultureId, momentId: freeMomentId } = await saveScopedCultureWithMoment(
      'user-a',
      {
        culturePayload: { name: 'Parcela Livre', crop_type: 'Pereira', culture_key: 'pereira' },
        momentInput: { observedAt: '2026-04-05', stageLabel: 'Abrolhamento', measurementSource: 'measured_field' }
      },
      testDb
    );
    await testDb.calculation_history_v2.add({
      id: 'hist-keep-1',
      userId: 'user-a',
      calculatorId: 'calibracao_pulverizador',
      calculatorVersion: '1',
      inputs: {},
      outputs: {},
      syncStatus: 'local_only',
      syncedAt: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    assert.equal(await deleteScopedProfile('user-b', 'cultures', freeCultureId), false, 'Outro utilizador não pode apagar');
    assert.equal(await deleteScopedProfile('user-a', 'cultures', freeCultureId), true);
    assert.equal((await listMomentsForCulture('user-a', freeCultureId, testDb)).length, 0);
    assert.equal((await listRevisionsForMoment('user-a', Number(freeMomentId), testDb)).length, 0);
    assert.ok(await testDb.calculation_history_v2.get('hist-keep-1'), 'Histórico imutável permanece');
    assert.equal((await listUserCustomOptions('user-a', 'variedade', 'vinha', testDb)).length, 1, 'Opções locais preservadas');

    // Remover calibração bloqueadora e validar batch delete preservando profile_custom_options
    await testDb.calibration_profiles.delete('calib-block-1');
    const deletedCount = await deleteUserProfilesBatch('user-a', 'cultures');
    assert.equal(deletedCount, 1);
    const presence = await hasLocalUserData('user-a', testDb, null);
    assert.equal(presence.status, 'present', 'Opções locais e histórico contam como dados locais');
    testDb.close();
  });

  it('4. Datas DD-MM-AAAA, mapeamento Oliveira, Vinha w->LWA-V, limites físicos vs motor e incoerência EPPO', () => {
    assert.equal(parseDdMmYyyyToIso('15-04-2026'), '2026-04-15');
    assert.equal(parseDdMmYyyyToIso('31-02-2026'), null);
    assert.equal(formatIsoCivilToDdMmYyyy('2026-04-15'), '15-04-2026');

    const olivalSuper = evaluateCultureMomentMetrics({
      cultureKey: 'oliveira',
      conductionKey: 'sebe_continua',
      rowDistanceM: 4.0,
      canopyHeightM: 2.5,
      canopyWidthM: 0.25 // < 0.30m aceita registo físico com aviso não bloqueante
    });
    assert.equal(olivalSuper.effectiveMatrixCultureId, 'olival_superintensivo');
    assert.equal(olivalSuper.lwaBilateral, 12500);
    assert.equal(olivalSuper.trvPure, 1562.5);
    assert.ok(olivalSuper.warnings.some((w) => w.includes('0,30 m a 6,00 m')));

    const vinhaMedia = evaluateCultureMomentMetrics({
      cultureKey: 'vinha',
      conductionKey: 'espaldeira',
      rowDistanceM: 2.5,
      canopyHeightM: 1.4,
      canopyWidthM: 0.65
    });
    assert.equal(vinhaMedia.derivedThicknessTier, 'media');

    const incoherence = detectCultureTelemetryIncoherence(
      {
        name: 'Vinha Teste',
        crop_type: 'Vinha',
        last_calculated_at: '2026-05-01T12:00:00Z',
        phenological_stage: 'Floração',
        canopy_height_m: 1.8
      },
      {
        userId: 'u',
        cultureId: 1,
        observedAt: '2026-04-10',
        stageLabel: 'Bago de chumbo',
        canopyHeightM: 1.1,
        measurementSource: 'measured_field',
        snapshotJson: '{}',
        createdAt: '',
        updatedAt: ''
      }
    );
    assert.equal(incoherence.hasIncoherence, true);
    assert.equal(incoherence.reasons.length, 2);
  });

  it('5. Governança UI Cultura: <= 200 LOC, Guia Técnico, PT-PT estrito e zero badges de origem', () => {
    const uiFiles = [
      'src/features/perfis/components/CultureCoreFieldsCard.tsx',
      'src/features/perfis/components/CultureFocusedEditorModal.tsx',
      'src/features/perfis/components/DaterraCalendarPopover.tsx',
      'src/features/perfis/components/CultureGuideModal.tsx',
      'src/features/perfis/components/CultureLocationAccordion.tsx',
      'src/features/perfis/components/CultureMeasurementsAccordion.tsx',
      'src/features/perfis/components/CultureMomentEditorBox.tsx',
      'src/features/perfis/components/CultureMomentsAccordion.tsx',
      'src/features/perfis/components/CultureParcelDataAccordion.tsx',
      'src/features/perfis/components/CultureSavedList.tsx',
      'src/features/perfis/components/CultureSection.tsx',
      'src/features/perfis/components/DateDdMmYyyyPicker.tsx',
      'src/features/perfis/components/DropdownFooterActions.tsx',
      'src/features/perfis/components/MomentTimelineItem.tsx',
      'src/features/perfis/components/NumericKeypadField.tsx',
      'src/features/perfis/components/SearchableDropdownMenu.tsx',
      'src/features/perfis/components/SearchableRoundedDropdown.tsx',
      'src/features/perfis/data/cultureCatalogData.ts',
      'src/features/perfis/data/cultureLocationData.ts',
      'src/features/perfis/hooks/useCultureController.ts',
      'src/features/perfis/services/cultureCustomOptionStorage.ts',
      'src/features/perfis/services/cultureDateUtils.ts',
      'src/features/perfis/services/cultureDeletionService.ts',
      'src/features/perfis/services/cultureEngineCompatibility.ts',
      'src/features/perfis/services/cultureFormState.ts',
      'src/features/perfis/services/cultureMomentStorage.ts',
      'src/features/perfis/services/cultureMomentWriteHelper.ts',
      'src/features/perfis/services/cultureSaveBuilder.ts',
      'src/features/perfis/services/cultureSprayVolume.ts',
      'src/features/perfis/services/cultureTelemetryCoherence.ts'
    ];

    for (const relPath of uiFiles) {
      const content = fs.readFileSync(path.resolve(relPath), 'utf8');
      const lines = content.split('\n').length;
      assert.ok(lines <= 200, `${relPath} excede 200 LOC (${lines})`);
      assert.ok(!/Base DATERRA/i.test(content), `${relPath} não pode conter badge "Base DATERRA"`);
      assert.ok(!/['"]Enviada['"]/.test(content), `${relPath} não pode marcar opções locais como "Enviada"`);
      assert.ok(!/\bcuba\b/i.test(content), `${relPath} não pode usar o termo proibido "cuba"`);
      assert.ok(!/\bPF\b/.test(content), `${relPath} não pode usar sigla "PF"`);
    }

    const coreSrc = fs.readFileSync(path.resolve('src/features/perfis/components/CultureCoreFieldsCard.tsx'), 'utf8');
    const guideSrc = fs.readFileSync(path.resolve('src/features/perfis/components/CultureGuideModal.tsx'), 'utf8');
    assert.ok(coreSrc.includes('Guia Técnico'), 'Botão exterior deve chamar-se "Guia Técnico"');
    assert.ok(guideSrc.includes('Guia Técnico'), 'Modal didático deve identificar "Guia Técnico"');
  });
});

describe('Perfil Cultura — Bloco 2: cronologia, revisões completas e volume de calda EPPO', () => {
  after(async () => {
    setProfileStorageDb();
    for (const name of createdDbs) {
      await Dexie.delete(name);
    }
  });

  const USER = 'user-b2';
  const vinhaBase = { name: 'QA Vinha', crop_type: 'Vinha', culture_key: 'vinha', row_distance_m: 2.2 };
  const momentOf = (observedAt, stageLabel, canopyHeightM) => ({
    observedAt,
    stageLabel,
    ...(canopyHeightM !== undefined ? { canopyHeightM } : {}),
    measurementSource: 'measured_field'
  });

  it('6. Momentos em ordem cronológica crescente e "Momento atual" = data mais recente', async () => {
    const testDb = new DaterraDatabase(nextDbName('b2_order'));
    await testDb.open();
    setProfileStorageDb(testDb);

    // Criado primeiro o momento mais recente (11-11): fica ativo por ser o único.
    const first = await saveScopedCultureWithMoment(
      USER,
      { culturePayload: vinhaBase, momentInput: momentOf('2026-11-11', 'Estádio B', 1.6) },
      testDb
    );
    const { cultureId } = first;
    // Momento mais antigo (10-11) sem marcar explicitamente: NÃO pode roubar o estatuto.
    const older = await saveScopedCultureWithMoment(
      USER,
      { cultureId, culturePayload: vinhaBase, momentInput: momentOf('2026-11-10', 'Estádio A', 1.4) },
      testDb
    );
    assert.equal((await testDb.profiles_cultures.get(cultureId)).active_moment_id, first.momentId);

    let list = await listMomentsForCulture(USER, cultureId, testDb);
    assert.deepEqual(list.map((m) => m.observedAt), ['2026-11-10', '2026-11-11'], 'Ordem crescente');
    assert.equal(findLatestChronologicalMoment(list).id, first.momentId);

    // Momento posterior (12-11) sem marcação explícita torna-se o atual.
    const newest = await saveScopedCultureWithMoment(
      USER,
      { cultureId, culturePayload: vinhaBase, momentInput: momentOf('2026-11-12', 'Estádio C', 1.7) },
      testDb
    );
    assert.equal((await testDb.profiles_cultures.get(cultureId)).active_moment_id, newest.momentId);

    list = await listMomentsForCulture(USER, cultureId, testDb);
    assert.deepEqual(list.map((m) => m.observedAt), ['2026-11-10', '2026-11-11', '2026-11-12']);
    assert.deepEqual([...list].sort(compareMomentsByDateAsc).map((m) => m.id), list.map((m) => m.id));

    assert.equal(isChronologicallyLatest('2026-11-13', list), true);
    assert.equal(isChronologicallyLatest('2026-11-12', list), true, 'Empate de data => considerado o mais recente');
    assert.equal(isChronologicallyLatest('2026-11-09', list), false);
    const olderRow = list.find((m) => m.id === older.momentId);
    const newestRow = list.find((m) => m.id === newest.momentId);
    assert.equal(mapMomentToDraftState(olderRow, list).markAsActive, false, 'Rever histórico não rouba "Momento atual"');
    assert.equal(mapMomentToDraftState(newestRow, list).markAsActive, true);
    testDb.close();
  });

  it('7. Revisão isolada de altura 1,40 -> 1,45 m regista motivo/valor anterior sem retirar "Momento atual"', async () => {
    const testDb = new DaterraDatabase(nextDbName('b2_height'));
    await testDb.open();
    setProfileStorageDb(testDb);

    const a = await saveScopedCultureWithMoment(
      USER,
      { culturePayload: vinhaBase, momentInput: momentOf('2026-11-10', 'Folhas jovens a folhas livres', 1.4) },
      testDb
    );
    const { cultureId } = a;
    const b = await saveScopedCultureWithMoment(
      USER,
      { cultureId, culturePayload: vinhaBase, momentInput: momentOf('2026-11-11', 'Cachos visíveis', 1.6) },
      testDb
    );
    assert.equal((await testDb.profiles_cultures.get(cultureId)).active_moment_id, b.momentId);

    const moments = await listMomentsForCulture(USER, cultureId, testDb);
    const rowA = moments.find((m) => m.id === a.momentId);
    const draftA = mapMomentToDraftState(rowA, moments);
    assert.equal(draftA.markAsActive, false);

    // Alterar APENAS a altura (data, estádio e restantes campos iguais)
    const reviewParams = {
      cultureId,
      culturePayload: vinhaBase,
      momentInput: {
        momentId: a.momentId,
        observedAt: '2026-11-10',
        stageLabel: 'Folhas jovens a folhas livres',
        canopyHeightM: 1.45,
        measurementSource: 'measured_field',
        revisionReason: 'Correção sintética para teste de revisão'
      },
      markMomentAsActive: draftA.markAsActive
    };
    await saveScopedCultureWithMoment(USER, reviewParams, testDb);

    const revisions = await listRevisionsForMoment(USER, Number(a.momentId), testDb);
    assert.equal(revisions.length, 1, 'Alterar só a altura deve criar uma revisão');
    const rev = revisions[0];
    assert.deepEqual(rev.changedFields, ['canopyHeightM']);
    assert.equal(rev.reason, 'Correção sintética para teste de revisão');
    assert.equal(rev.previousObservedAt, rev.newObservedAt);
    assert.equal(rev.previousStageLabel, rev.newStageLabel);
    const before = parseMomentSnapshot(rev.snapshotBeforeJson);
    const after = parseMomentSnapshot(rev.snapshotAfterJson);
    assert.equal(before.canopyHeightM, 1.4, 'Valor anterior preservado');
    assert.equal(before.lwaBilateral, 12727);
    assert.equal(after.canopyHeightM, 1.45);
    assert.equal(after.lwaBilateral, 13182);

    const updatedA = await testDb.profile_crop_moments.get(a.momentId);
    assert.equal(updatedA.canopyHeightM, 1.45);
    const culture = await testDb.profiles_cultures.get(cultureId);
    assert.equal(culture.active_moment_id, b.momentId, '"Momento atual" mantém-se no momento posterior');
    assert.equal(culture.canopy_height_m, 1.6, 'Espelho da parcela não é alterado por revisão de momento histórico');

    // Guardar de novo sem alterações NÃO cria revisão espúria
    await saveScopedCultureWithMoment(USER, reviewParams, testDb);
    assert.equal((await listRevisionsForMoment(USER, Number(a.momentId), testDb)).length, 1);

    // Revisão apenas de largura e de LAI também são auditadas
    await saveScopedCultureWithMoment(
      USER,
      { ...reviewParams, momentInput: { ...reviewParams.momentInput, canopyWidthM: 0.6, lai: 2.5, revisionReason: 'Largura e LAI' } },
      testDb
    );
    const all = await listRevisionsForMoment(USER, Number(a.momentId), testDb);
    assert.equal(all.length, 2);
    // Largura em Vinha deriva a espessura LWA-V (campo auditado): as três alterações ficam registadas
    assert.deepEqual([...all[0].changedFields].sort(), ['canopyWidthM', 'lai', 'thicknessTierManual']);
    testDb.close();
  });

  it('8. Volume de calda EPPO (LWA/TRV) calculado, guardado no snapshot e espelhado em last_spray_volume_lha', async () => {
    const vinha = evaluateCultureMomentMetrics({ cultureKey: 'vinha', rowDistanceM: 2.2, canopyHeightM: 1.4 });
    assert.equal(vinha.sprayVolumeBasis, 'lwa');
    assert.equal(vinha.recommendedSprayVolumeLHa, 382);
    assert.equal(vinha.recommendedSprayVolumeMinLHa, 318);
    assert.equal(vinha.recommendedSprayVolumeMaxLHa, 509);

    const pereira = evaluateCultureMomentMetrics({ cultureKey: 'pereira', rowDistanceM: 4, canopyHeightM: 2, canopyWidthM: 1 });
    assert.equal(pereira.sprayVolumeBasis, 'trv');
    assert.equal(pereira.recommendedSprayVolumeLHa, 250);
    assert.equal(pereira.recommendedSprayVolumeMinLHa, 200);
    assert.equal(pereira.recommendedSprayVolumeMaxLHa, 350);

    const pereiraSoAltura = evaluateCultureMomentMetrics({ cultureKey: 'pereira', rowDistanceM: 4, canopyHeightM: 2 });
    assert.equal(pereiraSoAltura.sprayVolumeBasis, 'lwa', 'Sem largura, árvore recorre a LWA');

    const oliveiraSebe = evaluateCultureMomentMetrics({
      cultureKey: 'oliveira', conductionKey: 'sebe_continua', rowDistanceM: 4, canopyHeightM: 2.5, canopyWidthM: 1
    });
    assert.equal(oliveiraSebe.sprayVolumeBasis, 'lwa');
    assert.equal(oliveiraSebe.recommendedSprayVolumeLHa, 375);

    const semDados = evaluateCultureMomentMetrics({ cultureKey: 'vinha', canopyHeightM: 1.4 });
    assert.equal(semDados.recommendedSprayVolumeLHa, null);
    assert.equal(semDados.sprayVolumeBasis, null);

    const testDb = new DaterraDatabase(nextDbName('b2_spray'));
    await testDb.open();
    setProfileStorageDb(testDb);

    const b = await saveScopedCultureWithMoment(
      USER,
      { culturePayload: vinhaBase, momentInput: momentOf('2026-11-11', 'Estádio B', 1.6) },
      testDb
    );
    const { cultureId } = b;
    assert.equal((await testDb.profiles_cultures.get(cultureId)).last_spray_volume_lha, 436);

    const a = await saveScopedCultureWithMoment(
      USER,
      { cultureId, culturePayload: vinhaBase, momentInput: momentOf('2026-11-10', 'Estádio A', 1.4) },
      testDb
    );
    assert.equal((await testDb.profiles_cultures.get(cultureId)).last_spray_volume_lha, 436, 'Momento histórico não altera o espelho');
    const snapA = parseMomentSnapshot((await testDb.profile_crop_moments.get(a.momentId)).snapshotJson);
    assert.equal(snapA.recommendedSprayVolumeLHa, 382);
    assert.equal(snapA.recommendedSprayVolumeMinLHa, 318);
    assert.equal(snapA.recommendedSprayVolumeMaxLHa, 509);
    assert.equal(snapA.sprayVolumeBasis, 'lwa');

    await setActiveCultureMoment(USER, cultureId, Number(a.momentId), testDb);
    assert.equal((await testDb.profiles_cultures.get(cultureId)).last_spray_volume_lha, 382);

    // Sem entrelinha não há volume válido: nada é inventado nem apagado
    const noRow = await saveScopedCultureWithMoment(
      USER,
      { culturePayload: { name: 'Sem Entrelinha', crop_type: 'Vinha', culture_key: 'vinha' }, momentInput: momentOf('2026-11-11', 'Estádio B', 1.6) },
      testDb
    );
    const noRowCulture = await testDb.profiles_cultures.get(noRow.cultureId);
    assert.equal('last_spray_volume_lha' in noRowCulture, false);
    testDb.close();
  });

  it('9. Construtor de gravação preserva a validação e marca a necessidade de editor de momento', () => {
    const form = {
      name: 'QA', cropKey: 'vinha', cropLabel: 'Vinha', area: '', varietyOptionId: '', varietyLabel: '', seasonLabel: '',
      installationOptionId: '', installationLabel: '', conductionOptionId: '', conductionLabel: '', rowDistance: '2,2',
      countryCode: 'PT', adminRegion: '', municipality: '', parish: '', notes: ''
    };
    const draft = {
      observedAt: '2026-11-10', stageOptionId: '', stageLabel: '', canopyHeight: '1,4', canopyWidth: '', lai: '',
      measurementSource: 'measured_field', revisionReason: '', markAsActive: true
    };
    const needsEditor = buildCultureSave({ form, momentDraft: draft, momentEditorOpen: false, dateValid: true });
    assert.equal(needsEditor.needsMomentEditor, true);
    assert.equal(needsEditor.params, undefined);
    assert.ok(needsEditor.errors.stage);

    const missingStage = buildCultureSave({ form, momentDraft: draft, momentEditorOpen: true, dateValid: true });
    assert.ok(missingStage.errors.stage);

    const ok = buildCultureSave({
      form, momentDraft: { ...draft, stageLabel: 'Folhas jovens a folhas livres' }, momentEditorOpen: true, dateValid: true
    });
    assert.deepEqual(ok.errors, {});
    assert.equal(ok.params.culturePayload.row_distance_m, 2.2);
    assert.equal(ok.params.culturePayload.area_ha, undefined, 'Área vazia não recebe valor fictício');
    assert.equal(ok.params.momentInput.canopyHeightM, 1.4);

    const onlyCulture = buildCultureSave({ form, momentDraft: { ...draft, canopyHeight: '' }, momentEditorOpen: false, dateValid: true });
    assert.equal(onlyCulture.params.momentInput, undefined);
  });

  it('10. Bloco 3: Bento Grid 12 col, DaterraCalendarPopover sem <input type="date">, Contexto IA e "Modo Offline"', async () => {
    const sectionSrc = fs.readFileSync(path.resolve('src/features/perfis/components/CultureSection.tsx'), 'utf8');
    assert.ok(sectionSrc.includes('xl:grid-cols-12'), 'CultureSection deve renderizar Bento Grid de 12 colunas');
    assert.ok(sectionSrc.includes('CultureFocusedEditorModal'), 'CultureSection deve usar o Editor Focado Adaptativo');

    const modalSrc = fs.readFileSync(path.resolve('src/features/perfis/components/CultureFocusedEditorModal.tsx'), 'utf8');
    assert.ok(modalSrc.includes('}, [isOpen]);'), 'useEffect de foco do modal deve depender apenas de [isOpen] para não roubar foco ao escrever');
    assert.ok(!modalSrc.includes('[isOpen, onClose]'), 'Proibido depender de onClose no useEffect de foco');

    const pickerSrc = fs.readFileSync(path.resolve('src/features/perfis/components/DateDdMmYyyyPicker.tsx'), 'utf8');
    assert.ok(pickerSrc.includes('DaterraCalendarPopover'), 'DateDdMmYyyyPicker deve usar DaterraCalendarPopover');
    assert.ok(!pickerSrc.includes('type="date"'), 'DateDdMmYyyyPicker não deve usar <input type="date"> nativo');

    const navSrc = fs.readFileSync(path.resolve('src/components/layout/PrivateDesktopNav.tsx'), 'utf8');
    assert.ok(!navSrc.includes('IndexedDB Ativo'), 'Barra superior deve simplificar para "Modo Offline"');

    const { explorationContextService } = await import('../src/features/agri-chat/services/explorationContextService.ts');
    const promptBlock = explorationContextService.formatContextForPrompt({
      cultureName: 'Vinha QA',
      cropType: 'Vinha',
      phenologicalStage: 'Floração',
      rowDistanceM: 2.2,
      canopyHeightM: 1.4,
      lwaM2Ha: 12727,
      recommendedSprayVolumeLHa: 382
    });
    assert.ok(promptBlock.includes('Estádio Fenológico: Floração'));
    assert.ok(promptBlock.includes('LWA: 12727 m²/ha'));
    assert.ok(promptBlock.includes('Calda Recomendada EPPO: 382 L/ha'));
  });
});
