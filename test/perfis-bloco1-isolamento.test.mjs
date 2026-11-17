import 'fake-indexeddb/auto';
import { after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { db, DaterraDatabase } from '../src/db/db.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';
import {
  getScopedCultures,
  saveScopedCalibration,
  saveScopedCulture,
  saveScopedEquipment,
  saveScopedNozzle,
  setProfileStorageDb
} from '../src/features/perfis/services/profileStorageService.ts';
import {
  syncCultureTelemetry,
  syncEquipmentEfficiency
} from '../src/features/perfis/services/profileTelemetrySync.ts';
import {
  syncCultureTelemetryToProfile,
  syncEquipmentEfficiencyFactor
} from '../src/features/ajuste-dose-eppo/eppoProfileSyncService.ts';

describe('Perfis Bloco 1: Isolamento, Titularidade e Integridade LWW', () => {
  const isoDb = new DaterraDatabase(`Bloco1Iso_${Date.now()}`);

  beforeEach(async () => {
    setProfileStorageDb(isoDb);
    await Promise.all([
      isoDb.profiles_cultures.clear(),
      isoDb.profiles_equipment.clear(),
      isoDb.profiles_nozzles.clear(),
      isoDb.profiles_calibrations.clear(),
      db.profiles_cultures.clear(),
      db.profiles_equipment.clear(),
      db.mutation_outbox.clear()
    ]);
  });

  after(async () => {
    setProfileStorageDb();
    await isoDb.delete();
  });

  it('1. Ficheiros novos e alterados do Bloco 1 cumprem <= 200 LOC', () => {
    for (const p of [
      'src/features/perfis/services/profileOwnership.ts',
      'src/features/perfis/services/profileStorageService.ts',
      'src/features/perfis/services/profileTelemetrySync.ts',
      'src/features/ajuste-dose-eppo/eppoProfileSyncService.ts'
    ]) {
      const loc = fs.readFileSync(p, 'utf8').split('\n').length;
      assert.ok(loc <= 200, `${p} excede 200 LOC (${loc})`);
    }
  });

  it('2. Rejeita userId ausente, vazio e marcadores inválidos sem escritas parciais', async () => {
    const cultId = Number(await db.profiles_cultures.add({
      name: 'Parcela Protegida', crop_type: 'Vinha', area_ha: 2, userId: 'user-A'
    }));
    const eqId = Number(await db.profiles_equipment.add({
      name: 'Pulverizador Protegido', tank_capacity_l: 1000, userId: 'user-A'
    }));

    for (const badId of [undefined, null, '', '   ', LEGACY_UNASSIGNED_MARKER, 'local-user', 'unassigned']) {
      await assert.rejects(
        saveScopedCulture(badId, { name: 'X', crop_type: 'Vinha', area_ha: 1 }),
        /Sessão inválida/
      );
      assert.equal(await syncCultureTelemetry(cultId, { calculator_id: 'lwa', lwa_m2_ha: 9000 }, badId), false);
      assert.equal(await syncEquipmentEfficiency(eqId, { efficiency_pct: 90 }, badId), false);
      await assert.rejects(
        syncCultureTelemetryToProfile({
          userId: badId ?? undefined, cultureId: cultId, lwaReal: 9500, alturaM: 1.4, entrelinhaM: 2.5, cropStructure: 'sebe'
        }),
        /Sessão inválida/
      );
      await assert.rejects(syncEquipmentEfficiencyFactor(eqId, 0.85, badId ?? undefined), /Sessão inválida/);
    }

    assert.equal((await db.mutation_outbox.toArray()).length, 0);
    assert.equal((await db.profiles_cultures.get(cultId))?.last_lwa_m2_ha, undefined);
    assert.equal((await getScopedCultures('local-user')).length, 0);
  });

  it('3. Contas A e B com culturas homónimas e duplicados na mesma conta não colidem', async () => {
    const idA = Number(await db.profiles_cultures.add({
      name: 'Vinha Encosta', crop_type: 'Vinha', area_ha: 3, userId: 'user-A'
    }));
    const idB = Number(await db.profiles_cultures.add({
      name: 'Vinha Encosta', crop_type: 'Vinha', area_ha: 4, userId: 'user-B'
    }));

    const resB = await syncCultureTelemetryToProfile({
      userId: 'user-B', cultureName: 'vinha encosta', lwaReal: 11200, alturaM: 1.5, entrelinhaM: 2.4, cropStructure: 'sebe'
    });
    assert.equal(resB.cultureId, idB);
    assert.equal((await db.profiles_cultures.get(idA))?.last_lwa_m2_ha, undefined);
    assert.equal((await db.profiles_cultures.get(idB))?.last_lwa_m2_ha, 11200);

    await db.profiles_cultures.add({ name: 'Pomar Duplicado', crop_type: 'Pomar', area_ha: 2, userId: 'user-A' });
    await db.profiles_cultures.add({ name: 'Pomar Duplicado', crop_type: 'Pomar', area_ha: 5, userId: 'user-A' });
    await assert.rejects(
      syncCultureTelemetryToProfile({
        userId: 'user-A', cultureName: 'Pomar Duplicado', lwaReal: 8000, alturaM: 2.0, entrelinhaM: 3.5, cropStructure: 'globular'
      }),
      /ambígua/i
    );
    assert.equal((await db.mutation_outbox.toArray()).length, 1);
  });

  it('4. Legados sem titular e equipamento alheio permanecem bloqueados e protegidos', async () => {
    const legCult = Number(await db.profiles_cultures.add({
      name: 'Vinha Legada', crop_type: 'Vinha', area_ha: 2.5, userId: undefined
    }));
    const legLocal = Number(await db.profiles_cultures.add({
      name: 'Vinha Encosta', crop_type: 'Vinha', area_ha: 2.0, userId: 'local-user'
    }));
    const legEq = Number(await db.profiles_equipment.add({
      name: 'Atomizador Legado', tank_capacity_l: 600, userId: LEGACY_UNASSIGNED_MARKER
    }));

    assert.equal(await syncCultureTelemetry(legCult, { calculator_id: 'trv', trv_m3_ha: 5000 }, 'user-A'), false);
    assert.equal(await syncEquipmentEfficiency(legEq, { efficiency_pct: 80 }, 'user-A'), false);
    await assert.rejects(
      syncCultureTelemetryToProfile({
        userId: 'user-A', cultureId: legCult, lwaReal: 9000, alturaM: 1.2, entrelinhaM: 2.5, cropStructure: 'sebe'
      }),
      /Acesso negado/
    );
    await assert.rejects(syncEquipmentEfficiencyFactor(legEq, 0.9, 'user-A'), /Acesso negado/);

    const eqA = await saveScopedEquipment('user-A', { name: 'Eq A', tank_capacity_l: 1000 });
    await assert.rejects(
      saveScopedNozzle('user-B', {
        equipment_id: eqA, manufacturer: 'Albuz', model: 'ATR 80', color: 'Azul',
        nozzle_type: 'Cone Oco', working_pressure_bar: 10, nominal_flow_lmin: 1.2
      }),
      /Acesso negado/
    );
    const nzA = await saveScopedNozzle('user-A', {
      equipment_id: eqA, manufacturer: 'Albuz', model: 'ATR 80', color: 'Azul',
      nozzle_type: 'Cone Oco', working_pressure_bar: 10, nominal_flow_lmin: 1.2
    });
    await assert.rejects(
      saveScopedCalibration('user-B', {
        equipment_id: eqA, nozzle_id: nzA, working_speed_kmh: 6, working_pressure_bar: 10,
        working_width_m: 2.5, total_flow_lmin: 12, calculated_spray_volume_lha: 480
      }),
      /Acesso negado/
    );
    assert.equal((await db.profiles_cultures.get(legLocal))?.userId, 'local-user');
    assert.equal((await db.mutation_outbox.toArray()).length, 0);
  });

  it('5. entityId estável na Outbox, rollback sem escrita parcial e update parcial preserva campos', async () => {
    const cultId = Number(await db.profiles_cultures.add({
      name: 'Vinha Teste', crop_type: 'Vinha', area_ha: 3, userId: 'user-A'
    }));
    await syncCultureTelemetryToProfile({
      userId: 'user-A', cultureId: cultId, lwaReal: 10000, alturaM: 1.4, entrelinhaM: 2.5, cropStructure: 'sebe'
    });
    await syncCultureTelemetryToProfile({
      userId: 'user-A', cultureId: cultId, lwaReal: 10500, alturaM: 1.5, entrelinhaM: 2.5, cropStructure: 'sebe'
    });

    const outbox = await db.mutation_outbox.toArray();
    assert.equal(outbox.length, 2);
    assert.equal(outbox[0].entityId, String(cultId));
    assert.equal(outbox[1].entityId, String(cultId));
    assert.notEqual(outbox[0].payload.idempotencyKey, outbox[1].payload.idempotencyKey);

    const origAdd = db.mutation_outbox.add;
    db.mutation_outbox.add = async () => { throw new Error('Falha simulada Outbox'); };
    try {
      await assert.rejects(
        syncCultureTelemetryToProfile({
          userId: 'user-A', cultureId: cultId, lwaReal: 19999, alturaM: 2.2, entrelinhaM: 2.5, cropStructure: 'sebe'
        }),
        /Falha simulada Outbox/
      );
    } finally {
      db.mutation_outbox.add = origAdd;
    }
    assert.equal((await db.profiles_cultures.get(cultId))?.last_lwa_m2_ha, 10500);

    const nzId = await saveScopedNozzle('user-A', {
      manufacturer: 'Albuz', model: 'ATR 80', color: 'Azul', iso_classification: 'ISO 10625',
      nozzle_type: 'Cone Oco', spray_angle: '80°', working_pressure_bar: 10, nominal_flow_lmin: 1.1
    });
    await saveScopedNozzle('user-A', { working_pressure_bar: 12 }, nzId);
    const updatedNz = await isoDb.profiles_nozzles.get(nzId);
    assert.equal(updatedNz?.spray_angle, '80°');
    assert.equal(updatedNz?.iso_classification, 'ISO 10625');
  });
});
