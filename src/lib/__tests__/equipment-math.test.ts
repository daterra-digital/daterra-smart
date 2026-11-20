// src/lib/__tests__/equipment-math.test.ts
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { EQUIPMENT_TYPES, EquipmentSchema, safeParseEquipmentRecord, type EquipmentRecord } from '../../schemas/equipment.schema.ts';
import { EQUIPMENT_TYPE_LABELS_PT, calculateEffectiveBoomWidthM, calculateOptimalAirflow, getVentilationAlert, isIso16122Compliant, buildEquipmentAiContextSummary } from '../equipment-math.ts';
import { db, DaterraDatabase, V12_STORES } from '../../db/dexie-db.ts';
import { V11_STORES } from '../../db/dbCultureMigration.ts';
import { INITIAL_EQUIPMENT_V12_FORM, mapEquipmentRecordToForm } from '../../features/settings/equipment/equipmentFormState.ts';
import { buildEquipmentRecordFromForm } from '../../features/settings/equipment/equipmentPayloadBuilder.ts';
import { SPRAYER_BRANDS, SPRAYER_MODELS_BY_BRAND, PUMP_BRANDS, PUMP_MODELS_BY_BRAND, COMMAND_BRANDS, COMMAND_MODELS_BY_BRAND } from '../../features/settings/equipment/equipmentCatalogData.ts';
import { resolveInitialOpenAccordions } from '../../features/settings/equipment/equipmentFormHelpers.ts';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const createdDbs: string[] = [];

function createBaseEquipment(overrides: Partial<EquipmentRecord> = {}): EquipmentRecord {
  return {
    id: VALID_UUID,
    name: 'Atomizador Axial Tomix 1000L',
    type: '3D_AXIAL',
    tankCapacityL: 1000,
    workingWidthM: 2.5,
    nozzleSpacingCm: 35,
    defaultPressureBar: 8,
    defaultSpeedKmh: 6,
    defaultAirflowM3h: 1200,
    iso16122Inspection: { lastInspectionDate: '2026-03-15', pressureGaugeOk: true, antiDripValveOk: true, nozzleWearWithin10Pct: true },
    lastUpdatedAt: '2026-11-17T10:00:00.000Z',
    ...overrides
  };
}

describe('Equipamentos (Bloco 1) — Motor Matemático Puro, Schema Zod & Migração Dexie v12', () => {
  after(async () => {
    for (const name of createdDbs) await Dexie.delete(name);
  });

  it('1. Calcula exatamente Q_ar,otimo = 0.10 * TRV * speedKmh e devolve 0 para casos limite (<= 0)', () => {
    assert.equal(calculateOptimalAirflow(2000, 6), 1200);
    assert.equal(calculateOptimalAirflow(3500, 5.5), 1925);
    assert.equal(calculateOptimalAirflow(0, 6), 0);
    assert.equal(calculateOptimalAirflow(2000, 0), 0);
    assert.equal(calculateOptimalAirflow(-1500, 6), 0);
    assert.equal(calculateOptimalAirflow(2000, -4), 0);
    assert.equal(calculateOptimalAirflow(Number.NaN, 6), 0);
  });

  it('2. Avalia alerta de ventilação (UNDER, OPTIMAL, OVER) com tolerância estrita de ±20%', () => {
    const optimal = 1200; // Limites [960, 1440]
    assert.equal(getVentilationAlert(959, optimal), 'UNDER');
    assert.equal(getVentilationAlert(960, optimal), 'OPTIMAL');
    assert.equal(getVentilationAlert(1200, optimal), 'OPTIMAL');
    assert.equal(getVentilationAlert(1440, optimal), 'OPTIMAL');
    assert.equal(getVentilationAlert(1441, optimal), 'OVER');
    assert.equal(getVentilationAlert(800, 0), 'OPTIMAL');
    assert.equal(getVentilationAlert(800, -100), 'OPTIMAL');
  });

  it('3. Valida Schema Zod: aceita as 9 tipologias oficiais e bloqueia valores negativos ou zero', () => {
    assert.equal(EQUIPMENT_TYPES.length, 9);
    const validRecord = createBaseEquipment();
    for (const t of EQUIPMENT_TYPES) {
      assert.equal(safeParseEquipmentRecord({ ...validRecord, type: t }).success, true);
      assert.ok(EQUIPMENT_TYPE_LABELS_PT[t].length > 0 && EQUIPMENT_TYPE_LABELS_PT[t] !== t);
    }
    const parsed = EquipmentSchema.parse(validRecord);
    assert.equal(isIso16122Compliant(parsed), true);
    for (const bad of [
      { tankCapacityL: 0 }, { tankCapacityL: -500 }, { workingWidthM: 0 }, { nozzleSpacingCm: -10 },
      { defaultPressureBar: 0 }, { defaultSpeedKmh: -2 }, { defaultAirflowM3h: -1 }, { id: 'not-a-uuid' }, { type: 'INVALID_TYPE' }
    ]) {
      assert.equal(safeParseEquipmentRecord({ ...validRecord, ...bad }).success, false);
    }
  });

  it('4. Formata janela de contexto @equipamento com estado ISO 16122, largura efetiva 2D e caudal ótimo 3D', () => {
    const eq = createBaseEquipment({ defaultAirflowM3h: 1500 });
    const summary = buildEquipmentAiContextSummary(eq, { cultureName: 'Vinha', trvM3ha: 2000 });
    assert.ok(summary.includes('[@equipamento: "Atomizador Axial Tomix 1000L"]') && summary.includes('Caudal de Ar: 1500 m³/h vs. Ótimo: 1200 m³/h [OVER'));
    assert.ok(summary.includes('Conforme ISO 16122 (2026-03-15)'));
    const axialNoAir = buildEquipmentAiContextSummary(createBaseEquipment({ type: '3D_AXIAL', airAssisted: false, defaultAirflowM3h: 0 }), { trvM3ha: 2000 });
    assert.ok(axialNoAir.includes('Barras Verticais sem Ventilação') && !axialNoAir.includes('UNDER'));
    for (const t of ['3D_TANGENTIAL', '3D_PNEUMATIC', '3D_CANNON'] as const) {
      assert.ok(buildEquipmentAiContextSummary(createBaseEquipment({ type: t, defaultAirflowM3h: 1200 }), { trvM3ha: 2000 }).includes('[OPTIMAL'));
    }
    assert.equal(calculateEffectiveBoomWidthM(24, 50), 12);
    assert.equal(calculateEffectiveBoomWidthM(0, 50), 0);
    const sumNoAir = buildEquipmentAiContextSummary(createBaseEquipment({ type: '2D_HORIZONTAL', workingWidthM: 24, nozzleSpacingCm: 50, airAssisted: false, defaultAirflowM3h: undefined }), { trvM3ha: 3000 });
    assert.ok(sumNoAir.includes('Largura Efetiva da Barra: 12 m') && sumNoAir.includes('Barra Hidráulica Convencional') && !sumNoAir.includes('Ótimo'));
    const sumWithAir = buildEquipmentAiContextSummary(createBaseEquipment({ type: '2D_HORIZONTAL', workingWidthM: 24, nozzleSpacingCm: 50, airAssisted: true, defaultAirflowM3h: 14000, airCurtainAngle: '+15° (Frente — penetração)' }), { trvM3ha: 3000 });
    assert.ok(sumWithAir.includes('Manga de Ar (14000 m³/h), Cortina: +15° (Frente — penetração)') && !sumWithAir.includes('Ótimo'));
  });

  it('5. Migra Dexie v11 -> v13 preservando intactas as tabelas existentes e indexando equipments', async () => {
    assert.equal(db.verno, 13);
    assert.equal(V12_STORES.equipments, 'id, type, name, lastUpdatedAt');

    const dbName = `DaterraEquipV12_${Date.now()}`;
    createdDbs.push(dbName);

    const v11Db = new Dexie(dbName);
    v11Db.version(11).stores(V11_STORES);
    await v11Db.open();
    const cultureId = await v11Db.table('profiles_cultures').add({
      userId: 'user-eq-1',
      name: 'Vinha Preservar',
      crop_type: 'Vinha'
    });
    v11Db.close();

    const v12Db = new DaterraDatabase(dbName);
    await v12Db.open();
    assert.equal(v12Db.verno, 13);

    const preservedCulture = await v12Db.profiles_cultures.get(Number(cultureId));
    assert.equal(preservedCulture?.name, 'Vinha Preservar');

    const record = createBaseEquipment();
    await v12Db.equipments.put(record);
    const stored = await v12Db.equipments.get(VALID_UUID);
    assert.equal(stored?.name, 'Atomizador Axial Tomix 1000L');
    v12Db.close();
  });

  it('6. Bloco 2: Preserva metadados ISO 16122 estendidos, Bento Grid 2x2, Editor Focado e <= 200 LOC sem dark:', () => {
    const built = buildEquipmentRecordFromForm(
      {
        ...INITIAL_EQUIPMENT_V12_FORM, name: 'Pulverizador Rocha 1500L', type: '3D_CROSSFLOW',
        manufacturer: 'Rocha', model: 'Tornado 1500', serialNumber: 'SN-2026-10', manufactureYear: '2026',
        tankCapacityL: '1500', handWashTank: true, circuitFlushTank: true, associatedNozzleIds: ['Albuz ATR 80 (Azul)'],
        workingWidthM: '3,0', nozzleSpacingCm: '35', defaultPressureBar: '10', defaultSpeedKmh: '6,5',
        defaultAirflowM3h: '1600', pumpManufacturer: 'Comet', commandManufacturer: 'Arag', manometerType: 'DIGITAL', manometerDiameterMm: '63', lastInspectionDate: '2026-05-10'
      },
      'user-b2-eq'
    );
    assert.ok(built.record);
    assert.equal(built.record.manufacturer, 'Rocha');
    assert.equal(built.record.manufactureYear, 2026);
    assert.equal(built.record.handWashTank, true);
    assert.equal(built.record.manometer?.manometerType, 'DIGITAL');
    assert.equal(built.record.manometer?.diameterMm, undefined);
    const roundtrip = mapEquipmentRecordToForm(built.record);
    assert.equal(roundtrip.manufacturer, 'Rocha');
    assert.equal(roundtrip.pumpManufacturer, 'Comet');
    assert.equal(roundtrip.manometerType, 'DIGITAL');

    const eqFiles = [
      'src/schemas/equipment.schema.ts',
      'src/lib/equipment-math.ts',
      'src/db/dexie-db.ts',
      'src/features/settings/equipment/equipmentCatalogData.ts',
      'src/features/settings/equipment/EquipmentBinaryToggle.tsx',
      'src/features/settings/equipment/equipmentFormState.ts',
      'src/features/settings/equipment/equipmentFormHelpers.ts',
      'src/features/settings/equipment/equipmentPayloadBuilder.ts',
      'src/features/settings/equipment/useEquipmentController.ts',
      'src/features/settings/equipment/EquipmentGuideModal.tsx',
      'src/features/settings/equipment/EquipmentSavedListCard.tsx',
      'src/features/settings/equipment/EquipmentIdentificationCard.tsx',
      'src/features/settings/equipment/EquipmentDistributionCard.tsx',
      'src/features/settings/equipment/EquipmentIsoInspectionCard.tsx',
      'src/features/settings/equipment/EquipmentFocusedEditorModal.tsx',
      'src/features/settings/equipment/EquipmentEditorMainAccordions.tsx',
      'src/features/settings/equipment/EquipmentEditorIsoAccordions.tsx',
      'src/features/settings/equipment/EquipmentSection.tsx',
      'src/features/perfis/components/DateDdMmYyyyPicker.tsx',
      'src/features/perfis/components/DaterraCalendarPopover.tsx'
    ];

    for (const rel of eqFiles) {
      const content = fs.readFileSync(path.resolve(rel), 'utf8');
      const lines = content.split('\n').length;
      assert.ok(lines <= 200, `${rel} excede 200 LOC (${lines})`);
      assert.equal(content.includes('dark:'), false, `${rel} não pode conter classes dark:`);
    }

    assert.ok(SPRAYER_BRANDS.length >= 17);
    assert.ok(SPRAYER_MODELS_BY_BRAND.Tomix.includes('Tornado 1000'));
    assert.ok(PUMP_BRANDS.length >= 7);
    assert.ok(PUMP_MODELS_BY_BRAND.Comet.includes('APS 121'));
    assert.ok(COMMAND_BRANDS.length >= 8);
    assert.ok(COMMAND_MODELS_BY_BRAND.Arag.includes('Bravo 400S'));
    assert.deepEqual(resolveInitialOpenAccordions('identification'), {
      ident: true, nozzles: false, distrib: false, bomba: false, comandos: false, manometro: false, inspecao: false
    });
    assert.deepEqual(resolveInitialOpenAccordions('distribution'), {
      ident: false, nozzles: false, distrib: true, bomba: false, comandos: false, manometro: false, inspecao: false
    });
    assert.deepEqual(resolveInitialOpenAccordions('inspection'), {
      ident: false, nozzles: false, distrib: false, bomba: true, comandos: true, manometro: true, inspecao: true
    });
  });
});
