/**
 * DATERRA Smart - Teste de Regressão de Segurança SEC-REM-01
 * Validação Funcional REAL do Isolamento dos Perfis no IndexedDB / Dexie.js (v10)
 *
 * Garante que:
 * 1. profileStorageService.ts existe e cumpre o limite estrito de <= 200 LOC.
 * 2. ExplorationView, WeatherContextAccordion, WeatherContextBar e EppoDose usam queries com userId.
 * 3. SettingsView e sessionCleanupService nunca executam .clear() global nos perfis.
 * 4. Seed não cria perfis órfãos sem userId.
 * 5. Exercita o serviço de produção profileStorageService sobre base física isolada:
 *    - Criar como A: proprietário A garantido no IndexedDB.
 *    - Consultar como B: dados de A ausentes; A vê apenas os seus.
 *    - Editar/eliminar registo de A como B: rejeitado em transação, dados de A intactos.
 *    - Registos legados sem proprietário: invisíveis para A e B e blindados contra alteração/remoção.
 *    - Relações entre proprietários diferentes: bicos e calibrações rejeitadas se equipamento alheio.
 *    - Incompatibilidade entre bico e equipamento: rejeitado em calibração.
 *    - Troca de conta / eliminação em lote de A: apenas dados de A são removidos; legados e B intactos.
 *    - Contexto nulo/inválido: nenhum dado retornado e nenhuma alteração na base.
 */

import 'fake-indexeddb/auto';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DaterraDatabase } from '../src/db/db.ts';
import {
  setProfileStorageDb,
  getScopedCultures,
  getScopedEquipment,
  getScopedNozzles,
  saveScopedCulture,
  saveScopedEquipment,
  saveScopedNozzle,
  saveScopedCalibration,
  deleteScopedProfile,
  deleteUserProfilesBatch,
  isValidUserId
} from '../src/features/perfis/services/profileStorageService.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';

describe('SEC-REM-01: Isolamento Local dos Perfis por Utilizador', () => {

  // -------------------------------------------------------------------------
  // 1. ESTRUTURA E LIMITES DE MODULARIDADE
  // -------------------------------------------------------------------------
  it('1. profileStorageService.ts deve existir e respeitar o limite de <= 200 LOC', () => {
    const servicePath = path.resolve('src/features/perfis/services/profileStorageService.ts');
    assert.ok(fs.existsSync(servicePath), 'profileStorageService.ts deve existir');

    const lines = fs.readFileSync(servicePath, 'utf8').split('\n').length;
    assert.ok(lines <= 200, `profileStorageService.ts deve ter <= 200 LOC (tem ${lines})`);
  });

  // -------------------------------------------------------------------------
  // 2. CONTRATO ESTÁTICO DE SCOPING NAS SUPERFÍCIES
  // -------------------------------------------------------------------------
  it('2. ExplorationView deve usar queries com filtro userId e serviços scoped', () => {
    const viewPath = path.resolve('src/views/ExplorationView.tsx');
    assert.ok(fs.existsSync(viewPath));
    const content = fs.readFileSync(viewPath, 'utf8');

    assert.ok(content.includes("db.profiles_cultures.where('userId').equals(effectiveUserId)"), 'Cultura scoped');
    assert.ok(content.includes("db.profiles_equipment.where('userId').equals(effectiveUserId)"), 'Equipamento scoped');
    assert.ok(content.includes("db.profiles_nozzles.where('userId').equals(effectiveUserId)"), 'Bicos scoped');
    assert.ok(content.includes("db.profiles_calibrations.where('userId').equals(effectiveUserId)"), 'Calibrações scoped');

    assert.ok(content.includes('saveScopedCulture'), 'Deve usar saveScopedCulture');
    assert.ok(content.includes('saveScopedEquipment'), 'Deve usar saveScopedEquipment');
    assert.ok(content.includes('saveScopedNozzle'), 'Deve usar saveScopedNozzle');
    assert.ok(content.includes('<CalibrationSection'), 'Deve delegar calibrações a CalibrationSection');
    const calCtrl = fs.readFileSync(path.resolve('src/features/perfis/hooks/useCalibrationController.ts'), 'utf8');
    assert.ok(calCtrl.includes('saveCalibrationAuditRecord'), 'Deve usar saveCalibrationAuditRecord scoped');
    assert.ok(calCtrl.includes('deleteCalibrationAuditRecord'), 'Deve usar deleteCalibrationAuditRecord scoped');
    assert.ok(content.includes('deleteScopedProfile'), 'Deve usar deleteScopedProfile');
  });

  it('3. WeatherContextAccordion e WeatherContextBar devem filtrar perfis por utilizador com guardião de propriedade', () => {
    const accordionPath = path.resolve('src/features/weather/components/WeatherContextAccordion.tsx');
    const hookPath = path.resolve('src/features/weather/hooks/useWeatherProfilesContext.ts');
    const loaderPath = path.resolve('src/features/weather/utils/weatherProfileLoader.ts');
    assert.ok(fs.existsSync(accordionPath) && fs.existsSync(hookPath) && fs.existsSync(loaderPath));
    const accContent = fs.readFileSync(accordionPath, 'utf8') + '\n' + fs.readFileSync(hookPath, 'utf8') + '\n' + fs.readFileSync(loaderPath, 'utf8');

    assert.ok(accContent.includes('isLocalOrOwnedByUser') && accContent.includes('isValidOwnerId'), 'Accordion deve filtrar registos por guardião de propriedade');
    assert.ok(accContent.includes('loadScopedWeatherCultures') && accContent.includes('loadScopedWeatherCalibrations'), 'Hook deve usar loaders scoped para culturas e calibrações');
    assert.ok(accContent.includes('loadScopedWeatherEquipments') && accContent.includes('loadScopedWeatherNozzles'), 'Hook deve usar loaders scoped para equipamentos e bicos');
    assert.ok(accContent.includes('onContextChange(null)'), 'Accordion deve limpar contexto ao mudar de conta/logout');

    const barPath = path.resolve('src/features/weather/components/WeatherContextBar.tsx');
    assert.ok(fs.existsSync(barPath));
    const barContent = fs.readFileSync(barPath, 'utf8');
    assert.ok(barContent.includes("db.profiles_nozzles.where('userId').equals(effectiveUserId)"), 'Bar bicos scoped');
    assert.ok(barContent.includes("db.profiles_equipment.where('userId').equals(effectiveUserId)"), 'Bar equipamento scoped');
  });

  it('4. EppoDoseCalculator deve filtrar culturas e equipamentos por effectiveUserId', () => {
    const calcPath = path.resolve('src/features/ajuste-dose-eppo/EppoDoseCalculator.tsx');
    assert.ok(fs.existsSync(calcPath));
    const content = fs.readFileSync(calcPath, 'utf8');

    assert.ok(content.includes("db.profiles_cultures.where('userId').equals(effectiveUserId)"), 'EPPO cultura scoped');
    assert.ok(content.includes("db.profiles_equipment.where('userId').equals(effectiveUserId)"), 'EPPO equipamento scoped');
  });

  it('5. SettingsView e sessionCleanupService nunca devem executar .clear() global nos perfis', () => {
    const settingsPath = path.resolve('src/views/SettingsView.tsx');
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');

    assert.ok(!settingsContent.includes('db.profiles_cultures.clear()'), 'SettingsView não pode dar .clear() em culturas');
    assert.ok(!settingsContent.includes('db.profiles_equipment.clear()'), 'SettingsView não pode dar .clear() em equipamentos');
    assert.ok(!settingsContent.includes('db.profiles_nozzles.clear()'), 'SettingsView não pode dar .clear() em bicos');
    assert.ok(!settingsContent.includes('db.profiles_calibrations.clear()'), 'SettingsView não pode dar .clear() em calibrações');

    assert.ok(settingsContent.includes("db.profiles_cultures.where('userId').equals(effectiveUserId).delete()"), 'SettingsView purga apenas userId atual');

    const cleanupPath = path.resolve('src/services/auth/sessionCleanupService.ts');
    const cleanupContent = fs.readFileSync(cleanupPath, 'utf8');
    assert.ok(!cleanupContent.includes('const isPurgeAll = !userId'), 'sessionCleanupService não pode fazer fallback para purge global se userId for vazio');
  });

  it('6. Seed não deve criar perfis órfãos sem userId', () => {
    const seedPath = path.resolve('src/db/seed.ts');
    const seedContent = fs.readFileSync(seedPath, 'utf8');
    assert.ok(!seedContent.includes('db.profiles_cultures.bulkAdd'), 'Seed não deve criar perfis de demonstração órfãos');
    assert.ok(!seedContent.includes('db.profiles_equipment.bulkAdd'), 'Seed não deve criar equipamentos de demonstração órfãos');
  });

  // -------------------------------------------------------------------------
  // 3. EXECUÇÃO DO SERVIÇO REAL SOBRE BASE INDEXEDDB ISOLADA
  // -------------------------------------------------------------------------
  describe('Exercício do Serviço de Produção (profileStorageService) sobre Base IndexedDB Isolada', () => {
    let testDb;
    let legacyCultureId;
    let legacyEquipmentId;

    before(async () => {
      // Cria uma base IndexedDB completamente isolada com esquema real v10
      testDb = new DaterraDatabase('DaterraSmartDB_Test_SEC_REM_01_' + Date.now());
      await testDb.open();
      setProfileStorageDb(testDb);

      // Injeta registos legados (sem proprietário ou com marcador unassigned)
      legacyCultureId = await testDb.profiles_cultures.add({
        name: 'Vinha Centenária Sem Dono',
        crop_type: 'Vinha',
        variety: 'Touriga',
        area_ha: 3.5,
        row_distance_m: 2.2,
        phenological_stage: 'Floração',
        userId: undefined
      });

      await testDb.profiles_cultures.add({
        name: 'Olival Legado Marcado',
        crop_type: 'Olival',
        variety: 'Cobrançosa',
        area_ha: 5.0,
        row_distance_m: 6.0,
        phenological_stage: 'Vingamento',
        userId: LEGACY_UNASSIGNED_MARKER
      });

      legacyEquipmentId = await testDb.profiles_equipment.add({
        name: 'Atomizador Antigo Sem Dono',
        manufacturer: 'Tomix',
        model: 'Tornado 1000',
        tank_capacity_l: 1000,
        userId: undefined
      });
    });

    after(async () => {
      setProfileStorageDb(); // Restaura a base de dados padrão da aplicação
      await testDb.delete(); // Elimina a base física temporária de teste
    });

    it('7.1. isValidUserId valida estritamente a autenticação e rejeita vazio/legado', () => {
      assert.equal(isValidUserId('user-123'), true);
      assert.equal(isValidUserId('firebase-uid-abc'), true);
      assert.equal(isValidUserId(''), false);
      assert.equal(isValidUserId('   '), false);
      assert.equal(isValidUserId(null), false);
      assert.equal(isValidUserId(undefined), false);
      assert.equal(isValidUserId(LEGACY_UNASSIGNED_MARKER), false);
    });

    it('7.2. Criar como A: titularidade registada fisicamente com userId de A', async () => {
      const cultureId = await saveScopedCulture('user-A', {
        name: 'Vinha do Agricultor A',
        crop_type: 'Vinha',
        variety: 'Aragonez',
        area_ha: 2.5,
        row_distance_m: 2.5,
        phenological_stage: 'Floração'
      });

      assert.ok(cultureId > 0);
      const record = await testDb.profiles_cultures.get(cultureId);
      assert.equal(record.userId, 'user-A', 'Registo deve ter userId: "user-A" gravado no IndexedDB');
      assert.equal(record.name, 'Vinha do Agricultor A');
    });

    it('7.3. Consultar como B: dados de A ausentes; A vê apenas os seus', async () => {
      const culturesB = await getScopedCultures('user-B');
      assert.ok(!culturesB.some(c => c.name === 'Vinha do Agricultor A'), 'User B não pode ver a cultura de User A');

      const culturesA = await getScopedCultures('user-A');
      assert.ok(culturesA.some(c => c.name === 'Vinha do Agricultor A'), 'User A deve ver a sua própria cultura');
    });

    it('7.4. Editar e eliminar ID de A como B: rejeitado em transação e dados de A intactos', async () => {
      const culturesA = await getScopedCultures('user-A');
      const idA = culturesA.find(c => c.name === 'Vinha do Agricultor A').id;

      // User B tenta atualizar o registo de User A
      await assert.rejects(
        saveScopedCulture('user-B', {
          name: 'Nome Adulterado por B',
          crop_type: 'Vinha',
          variety: 'Aragonez',
          area_ha: 2.5,
          row_distance_m: 2.5,
          phenological_stage: 'Floração'
        }, idA),
        /Acesso negado/
      );

      // User B tenta apagar o registo de User A
      const deleteResult = await deleteScopedProfile('user-B', 'cultures', idA);
      assert.equal(deleteResult, false, 'deleteScopedProfile deve retornar false para perfil alheio');

      // Verifica persistência e integridade física no IndexedDB
      const verifyRecord = await testDb.profiles_cultures.get(idA);
      assert.equal(verifyRecord.name, 'Vinha do Agricultor A', 'Nome original de A deve permanecer inalterado');
      assert.equal(verifyRecord.userId, 'user-A', 'Titularidade deve permanecer intocada');
    });

    it('7.5. Registos legados sem proprietário: invisíveis e protegidos contra edição/eliminação', async () => {
      const culturesA = await getScopedCultures('user-A');
      const culturesB = await getScopedCultures('user-B');

      assert.ok(!culturesA.some(c => c.id === legacyCultureId), 'Legado não pode aparecer na lista de A');
      assert.ok(!culturesB.some(c => c.id === legacyCultureId), 'Legado não pode aparecer na lista de B');

      // Tentativa de usurpação de perfil legado
      await assert.rejects(
        saveScopedCulture('user-A', {
          name: 'Usurpação de Legado',
          crop_type: 'Vinha',
          variety: 'Touriga',
          area_ha: 3.5,
          row_distance_m: 2.2,
          phenological_stage: 'Floração'
        }, legacyCultureId),
        /Acesso negado/
      );

      // Tentativa de eliminação de perfil legado
      const delLegacy = await deleteScopedProfile('user-A', 'cultures', legacyCultureId);
      assert.equal(delLegacy, false);

      const legacyInDb = await testDb.profiles_cultures.get(legacyCultureId);
      assert.ok(legacyInDb, 'Registo legado deve continuar a existir intacto no IndexedDB');
      assert.equal(legacyInDb.userId, undefined, 'Registo legado não pode ter ganho proprietário indevido');
    });

    it('7.6. Relações entre proprietários diferentes são rejeitadas (bico -> equipamento)', async () => {
      const eqAId = await saveScopedEquipment('user-A', {
        name: 'Trator Tomix A',
        tank_capacity_l: 800
      });

      // User B tenta criar bico associando ao equipamento de User A
      await assert.rejects(
        saveScopedNozzle('user-B', {
          manufacturer: 'Albuz',
          model: 'ATR 80',
          color: 'Amarelo',
          equipment_id: eqAId
        }),
        /Acesso negado: o equipamento associado não pertence ao utilizador/
      );

      // User B tenta associar a equipamento legado sem dono
      await assert.rejects(
        saveScopedNozzle('user-B', {
          manufacturer: 'Albuz',
          model: 'ATR 80',
          color: 'Amarelo',
          equipment_id: legacyEquipmentId
        }),
        /Acesso negado: o equipamento associado não pertence ao utilizador/
      );

      // User A associa ao seu próprio equipamento -> Sucesso
      const nzAId = await saveScopedNozzle('user-A', {
        manufacturer: 'Albuz',
        model: 'ATR 80',
        color: 'Amarelo',
        equipment_id: eqAId
      });
      assert.ok(nzAId > 0);
    });

    it('7.7. Relações entre proprietários diferentes e incompatibilidade na calibração', async () => {
      const eqAId = (await getScopedEquipment('user-A'))[0].id;
      assert.ok(eqAId > 0);
      const nzAId = (await getScopedNozzles('user-A'))[0].id;

      const eqBId = await saveScopedEquipment('user-B', {
        name: 'Trator Rocha B',
        tank_capacity_l: 600
      });

      // User B tenta calibrar usando o bico de User A
      await assert.rejects(
        saveScopedCalibration('user-B', {
          working_speed_kmh: 6.0,
          working_pressure_bar: 3.0,
          working_width_m: 2.5,
          active_nozzles_count: 10,
          total_flow_lmin: 12.0,
          calculated_spray_volume_lha: 480,
          equipment_id: eqBId,
          nozzle_id: nzAId
        }),
        /Acesso negado: o bico associado não pertence ao utilizador/
      );

      // User A cria um segundo pulverizador e tenta usar o bico montado no primeiro pulverizador
      const eqA2Id = await saveScopedEquipment('user-A', {
        name: 'Pulverizador Barra A2',
        tank_capacity_l: 1200
      });

      await assert.rejects(
        saveScopedCalibration('user-A', {
          working_speed_kmh: 6.0,
          working_pressure_bar: 3.0,
          working_width_m: 2.5,
          active_nozzles_count: 10,
          total_flow_lmin: 12.0,
          calculated_spray_volume_lha: 480,
          equipment_id: eqA2Id,
          nozzle_id: nzAId // Bico pertence a eqAId
        }),
        /Incompatibilidade: o bico selecionado pertence a outro equipamento/
      );
    });

    it('7.8. Eliminação em lote (logout / purga): remove apenas o utilizador e preserva terceiros e legados', async () => {
      // Elimina perfis de cultura do User A
      const countDeleted = await deleteUserProfilesBatch('user-A', 'cultures');
      assert.ok(countDeleted >= 1);

      // Culturas de A devem estar vazias
      const remainingA = await getScopedCultures('user-A');
      assert.equal(remainingA.length, 0);

      // Culturas legadas continuam intactas
      const legacyCheck = await testDb.profiles_cultures.get(legacyCultureId);
      assert.ok(legacyCheck, 'Registo legado deve permanecer intacto após deleteUserProfilesBatch');

      // Consultas com utilizador nulo devolvem vazio e não tocam nos dados
      const emptyUserRes = await getScopedCultures(null);
      assert.deepEqual(emptyUserRes, []);
    });
  });
});
