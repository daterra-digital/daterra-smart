/**
 * DATERRA Smart — Testes de Integração e Persistência Bidirecional de Telemetria (LWA/TRV/Eficácia)
 * Validação: Atualização atómica de perfis em Dexie.js e enfileiramento na Mutation Outbox
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { db } from '../src/db/db.ts';
import {
  syncCultureTelemetryToProfile,
  syncEquipmentEfficiencyFactor
} from '../src/features/ajuste-dose-eppo/eppoProfileSyncService.ts';

describe('Telemetria Agronómica Bidirecional: Perfis de Cultura e Equipamento', () => {
  let mockCultures = [];
  let mockEquipments = [];
  let mockOutbox = [];

  let origCultureGet, origCultureUpdate, origCultureAdd, origCultureWhere;
  let origEqGet, origEqUpdate, origEqAdd;
  let origOutboxAdd, origOutboxToArray;

  beforeEach(() => {
    mockCultures = [];
    mockEquipments = [];
    mockOutbox = [];

    origCultureGet = db.profiles_cultures.get;
    origCultureUpdate = db.profiles_cultures.update;
    origCultureAdd = db.profiles_cultures.add;
    origCultureWhere = db.profiles_cultures.where;

    origEqGet = db.profiles_equipment.get;
    origEqUpdate = db.profiles_equipment.update;
    origEqAdd = db.profiles_equipment.add;

    origOutboxAdd = db.mutation_outbox.add;
    origOutboxToArray = db.mutation_outbox.toArray;

    // Mock profiles_cultures
    db.profiles_cultures.get = async (id) => mockCultures.find(c => c.id === id);
    db.profiles_cultures.update = async (id, changes) => {
      const item = mockCultures.find(c => c.id === id);
      if (item) {
        Object.assign(item, changes);
        return 1;
      }
      return 0;
    };
    db.profiles_cultures.add = async (item) => {
      const newId = mockCultures.length + 1;
      const rec = { id: newId, ...item };
      mockCultures.push(rec);
      return newId;
    };
    db.profiles_cultures.where = (field) => ({
      equalsIgnoreCase: (val) => ({
        first: async () => mockCultures.find(c => String(c[field]).toLowerCase() === String(val).toLowerCase())
      })
    });

    // Mock profiles_equipment
    db.profiles_equipment.get = async (id) => mockEquipments.find(e => e.id === id);
    db.profiles_equipment.update = async (id, changes) => {
      const item = mockEquipments.find(e => e.id === id);
      if (item) {
        Object.assign(item, changes);
        return 1;
      }
      return 0;
    };
    db.profiles_equipment.add = async (item) => {
      const newId = mockEquipments.length + 1;
      const rec = { id: newId, ...item };
      mockEquipments.push(rec);
      return newId;
    };

    // Mock mutation_outbox
    db.mutation_outbox.add = async (item) => {
      const newId = mockOutbox.length + 1;
      mockOutbox.push({ id: newId, ...item });
      return newId;
    };
    db.mutation_outbox.toArray = async () => [...mockOutbox];
  });

  afterEach(() => {
    db.profiles_cultures.get = origCultureGet;
    db.profiles_cultures.update = origCultureUpdate;
    db.profiles_cultures.add = origCultureAdd;
    db.profiles_cultures.where = origCultureWhere;

    db.profiles_equipment.get = origEqGet;
    db.profiles_equipment.update = origEqUpdate;
    db.profiles_equipment.add = origEqAdd;

    db.mutation_outbox.add = origOutboxAdd;
    db.mutation_outbox.toArray = origOutboxToArray;
  });

  describe('1. Retrocompatibilidade Total de Perfis (Sem Telemetria Prévia)', () => {
    test('1.1. Perfil legado sem campos de telemetria é carregado sem exceções', async () => {
      const legacyId = await db.profiles_cultures.add({
        name: 'Vinha Velha do Rio',
        crop_type: 'Vinha',
        area_ha: 3.5,
        variety: 'Touriga Nacional'
      });

      const loaded = await db.profiles_cultures.get(legacyId);
      assert.ok(loaded);
      assert.equal(loaded.name, 'Vinha Velha do Rio');
      assert.equal(loaded.last_lwa_m2_ha, undefined);
      assert.equal(loaded.last_trv_m3_ha, undefined);
      assert.equal(loaded.last_calculated_at, undefined);
    });

    test('1.2. Equipamento legado sem fator de eficácia é preservado', async () => {
      const eqId = await db.profiles_equipment.add({
        name: 'Atomizador Tomix 1000L',
        tank_capacity_l: 1000
      });

      const loaded = await db.profiles_equipment.get(eqId);
      assert.ok(loaded);
      assert.equal(loaded.tank_capacity_l, 1000);
      assert.equal(loaded.efficiency_correction_factor, undefined);
    });
  });

  describe('2. Sincronização Bidirecional da Calculadora EPPO para Perfil de Cultura', () => {
    test('2.1. Atualizar perfil existente persiste LWA, carimbo temporal e mutação UPDATE', async () => {
      const cultureId = await db.profiles_cultures.add({
        name: 'Vinha do Alto',
        crop_type: 'Vinha',
        area_ha: 2.0,
        canopy_height_m: 1.2,
        row_distance_m: 2.5
      });

      const result = await syncCultureTelemetryToProfile({
        cultureId: Number(cultureId),
        cultureName: 'Vinha do Alto',
        lwaReal: 12000,
        alturaM: 1.5,
        larguraCopaM: 0.8,
        entrelinhaM: 2.5,
        cropStructure: 'sebe',
        phenologicalStage: 'Floração plena (BBCH 65)'
      });

      assert.equal(result.success, true);
      assert.equal(result.cultureId, Number(cultureId));

      const updated = await db.profiles_cultures.get(cultureId);
      assert.ok(updated);
      assert.equal(updated.last_lwa_m2_ha, 12000);
      assert.equal(updated.canopy_height_m, 1.5);
      assert.equal(updated.training_system, 'sebe');
      assert.equal(updated.last_phenological_stage, 'Floração plena (BBCH 65)');
      assert.ok(updated.last_calculated_at, 'Deve possuir carimbo temporal ISO');

      const outbox = await db.mutation_outbox.toArray();
      assert.equal(outbox.length, 1);
      assert.equal(outbox[0].entityType, 'culture');
      assert.equal(outbox[0].operation, 'UPDATE');
      assert.equal(outbox[0].synced, 0, 'Mutação deve iniciar com status offline pendente');
      assert.equal(outbox[0].payload.last_lwa_m2_ha, 12000);
    });

    test('2.2. Atualização em condução globular persiste simultaneamente LWA e TRV', async () => {
      const cultureId = await db.profiles_cultures.add({
        name: 'Pomar de Macieiras',
        crop_type: 'Pomar',
        area_ha: 5.0
      });

      await syncCultureTelemetryToProfile({
        cultureId: Number(cultureId),
        lwaReal: 10000,
        trvReal: 6667,
        alturaM: 2.0,
        larguraCopaM: 1.0,
        entrelinhaM: 3.0,
        cropStructure: 'globular'
      });

      const updated = await db.profiles_cultures.get(cultureId);
      assert.ok(updated);
      assert.equal(updated.last_lwa_m2_ha, 10000);
      assert.equal(updated.last_trv_m3_ha, 6667);
      assert.equal(updated.training_system, 'globular');
    });

    test('2.3. Se não existir perfil selecionado, cria novo registo e mutação CREATE', async () => {
      const result = await syncCultureTelemetryToProfile({
        cultureName: 'Nova Parcela 2026',
        lwaReal: 9600,
        alturaM: 1.2,
        larguraCopaM: 0.6,
        entrelinhaM: 2.5,
        cropStructure: 'sebe'
      });

      assert.equal(result.success, true);
      assert.ok(result.cultureId > 0);

      const created = await db.profiles_cultures.get(result.cultureId);
      assert.ok(created);
      assert.equal(created.name, 'Nova Parcela 2026');
      assert.equal(created.last_lwa_m2_ha, 9600);

      const outbox = await db.mutation_outbox.toArray();
      assert.equal(outbox.length, 1);
      assert.equal(outbox[0].operation, 'CREATE');
      assert.equal(outbox[0].payload.name, 'Nova Parcela 2026');
    });
  });

  describe('3. Persistência de Eficácia de Equipamento', () => {
    test('3.1. syncEquipmentEfficiencyFactor atualiza o fator e enfileira na Outbox', async () => {
      const eqId = await db.profiles_equipment.add({
        name: 'Pulverizador de Túnel com Recuperação',
        tank_capacity_l: 2000
      });

      await syncEquipmentEfficiencyFactor(Number(eqId), 0.85);

      const updated = await db.profiles_equipment.get(eqId);
      assert.ok(updated);
      assert.equal(updated.efficiency_correction_factor, 0.85);

      const outbox = await db.mutation_outbox.toArray();
      assert.equal(outbox.length, 1);
      assert.equal(outbox[0].entityType, 'equipment');
      assert.equal(outbox[0].operation, 'UPDATE');
      assert.equal(outbox[0].payload.efficiency_correction_factor, 0.85);
    });
  });
});
