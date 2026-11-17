import 'fake-indexeddb/auto';
import { after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DaterraDatabase } from '../src/db/db.ts';
import {
  buildCalibrationPayload,
  buildCulturePayload,
  buildEquipmentPayload,
  buildNozzlePayload,
  computeSprayVolumeLha,
  INITIAL_CALIBRATION_FORM,
  INITIAL_CULTURE_FORM,
  INITIAL_EQUIPMENT_FORM,
  INITIAL_NOZZLE_FORM
} from '../src/features/perfis/services/explorationFormHelpers.ts';
import {
  getScopedNozzles,
  saveScopedCalibration,
  saveScopedNozzle,
  setProfileStorageDb
} from '../src/features/perfis/services/profileStorageService.ts';
import { mapEquipmentProfileToIrd } from '../src/features/ird/irdProfileMappers.ts';
import { debitoTotalCalculatorConfig } from '../src/features/calculators/definitions/debitoTotalCalculatorConfig.ts';

describe('Perfis Bloco 2: Remoção de Valores Fictícios e Contratos Opcionais', () => {
  const testDb = new DaterraDatabase(`Bloco2NoFake_${Date.now()}`);

  beforeEach(async () => {
    setProfileStorageDb(testDb);
    await Promise.all([
      testDb.profiles_cultures.clear(),
      testDb.profiles_equipment.clear(),
      testDb.profiles_nozzles.clear(),
      testDb.profiles_calibrations.clear()
    ]);
  });

  after(async () => {
    setProfileStorageDb();
    await testDb.delete();
  });

  it('1. Módulos novos cumprem <= 200 LOC e estados iniciais nascem vazios/indefinidos', () => {
    for (const p of [
      'src/features/perfis/services/explorationFormTypes.ts',
      'src/features/perfis/services/explorationFormHelpers.ts'
    ]) {
      const loc = fs.readFileSync(p, 'utf8').split('\n').length;
      assert.ok(loc <= 200, `${p} excede 200 LOC (${loc})`);
    }
    assert.equal(INITIAL_CULTURE_FORM.cropType, '');
    assert.equal(INITIAL_CULTURE_FORM.rowDistance, '');
    assert.equal(INITIAL_EQUIPMENT_FORM.tankCapacity, '');
    assert.equal(INITIAL_EQUIPMENT_FORM.distributionType, '');
    assert.equal(INITIAL_EQUIPMENT_FORM.boomHeight, '');
    assert.equal(INITIAL_EQUIPMENT_FORM.hasAirSleeve, undefined);
    assert.equal(INITIAL_EQUIPMENT_FORM.inspectionDate, '');
    assert.equal(INITIAL_NOZZLE_FORM.manufacturer, '');
    assert.equal(INITIAL_NOZZLE_FORM.isoClassification, '');
    assert.equal(INITIAL_NOZZLE_FORM.sprayAngle, '');
    assert.equal(INITIAL_CALIBRATION_FORM.activeNozzlesCount, '');
    assert.equal(INITIAL_CALIBRATION_FORM.dropletSizeUm, '');
  });

  it('2. Cultura exige apenas obrigatórios, area_ha é opcional, nunca converte vazio em zero e omite location/geometria vazia', () => {
    const invalid = buildCulturePayload({ ...INITIAL_CULTURE_FORM });
    assert.equal(invalid.data, undefined);
    assert.ok(invalid.errors.cropType && invalid.errors.name);
    assert.equal(invalid.errors.area, undefined);

    const validNoArea = buildCulturePayload({ ...INITIAL_CULTURE_FORM, cropType: 'Vinha', name: 'P0' });
    assert.ok(validNoArea.data);
    assert.equal('area_ha' in validNoArea.data, false);

    const zeroArea = buildCulturePayload({ ...INITIAL_CULTURE_FORM, cropType: 'Vinha', name: 'P1', area: '0' });
    assert.equal(zeroArea.data, undefined);
    assert.ok(zeroArea.errors.area);

    const valid = buildCulturePayload({ ...INITIAL_CULTURE_FORM, cropType: 'Vinha', name: 'P1', area: '3,5' });
    assert.ok(valid.data);
    assert.equal(valid.data.area_ha, 3.5);
    assert.equal('location' in valid.data, false);
    assert.equal('row_distance_m' in valid.data, false);
    assert.equal('canopy_height_m' in valid.data, false);
  });

  it('3. Equipamento omite aprovação/datas/booleans não confirmados, expõe altura em Barra horizontal e isola famílias', () => {
    const boomMinimal = buildEquipmentPayload({
      ...INITIAL_EQUIPMENT_FORM, name: 'Barra A', tankCapacity: '1200',
      distributionType: 'Barra horizontal', boomWidth: '12', boomHeight: '0,6'
    });
    assert.ok(boomMinimal.data);
    assert.equal(boomMinimal.data.boom_width_m, 12);
    assert.equal(boomMinimal.data.boom_height_m, 0.6);
    assert.equal('has_air_sleeve' in boomMinimal.data, false);
    assert.equal('is_approved' in boomMinimal.data, false);
    assert.equal('inspection_date' in boomMinimal.data, false);
    assert.equal('fan_diameter_mm' in boomMinimal.data, false);
    assert.equal('lances_count' in boomMinimal.data, false);

    const boomNoHeight = buildEquipmentPayload({
      ...INITIAL_EQUIPMENT_FORM, name: 'Barra Sem Altura', tankCapacity: '1000', distributionType: 'Barra horizontal'
    });
    assert.ok(boomNoHeight.data);
    assert.equal('boom_height_m' in boomNoHeight.data, false);
    const mapped = mapEquipmentProfileToIrd({ id: 1, ...boomNoHeight.data });
    assert.equal(mapped?.defaultHeightM, null);
    assert.equal(mapped?.airAssistStatus, 'unknown');
  });

  it('4. Bicos permitem criar sem iso_classification e spray_angle e rejeitam ângulo inválido', async () => {
    const minimal = buildNozzlePayload({
      ...INITIAL_NOZZLE_FORM, manufacturer: 'Albuz', model: 'TVI', color: 'Azul (03)',
      nozzleType: 'Injeção de Ar', workingPressureBar: '5', nominalFlowLmin: '1,2'
    });
    assert.ok(minimal.data);
    assert.equal('iso_classification' in minimal.data, false);
    assert.equal('spray_angle' in minimal.data, false);
    assert.equal('equipment_name' in minimal.data, false);

    const badAngle = buildNozzlePayload({
      ...INITIAL_NOZZLE_FORM, manufacturer: 'Albuz', model: 'ATR 80', color: 'Amarelo (02)',
      nozzleType: 'Cone Oco', sprayAngle: '999', workingPressureBar: '10', nominalFlowLmin: '1,03'
    });
    assert.equal(badAngle.data, undefined);
    assert.ok(badAngle.errors.sprayAngle);

    const deflectorWithAngle = buildNozzlePayload({
      ...INITIAL_NOZZLE_FORM, manufacturer: 'Teejet', model: 'XR TeeJet', color: 'Verde (08)',
      nozzleType: 'Defletor', sprayAngle: '80', workingPressureBar: '3', nominalFlowLmin: '2,4'
    });
    assert.ok(deflectorWithAngle.data);
    assert.equal('spray_angle' in deflectorWithAngle.data, false);

    const savedId = await saveScopedNozzle('uid-1', minimal.data);
    const stored = (await getScopedNozzles('uid-1')).find((n) => n.id === savedId);
    assert.ok(stored);
    assert.equal(stored.iso_classification, undefined);
    assert.equal(stored.spray_angle, undefined);
  });

  it('5. Calibração cria sem active_nozzles_count/gota/ventilação, rejeita bicos inválidos e não gera defaults no preview', async () => {
    assert.equal(computeSprayVolumeLha('', '2,2', '12,36'), null);
    assert.equal(computeSprayVolumeLha('6', '2,5', '15'), 600);

    for (const badCount of ['0', '-1', '4,5', 'abc']) {
      const bad = buildCalibrationPayload({
        ...INITIAL_CALIBRATION_FORM, workingSpeedKmh: '6', workingPressureBar: '8',
        workingWidthM: '2,5', totalFlowLmin: '15', activeNozzlesCount: badCount
      });
      assert.equal(bad.data, undefined);
      assert.ok(bad.errors.activeNozzlesCount, `Deveria rejeitar ${badCount}`);
    }

    const minimal = buildCalibrationPayload({
      ...INITIAL_CALIBRATION_FORM, workingSpeedKmh: '6', workingPressureBar: '8',
      workingWidthM: '2,5', totalFlowLmin: '15'
    });
    assert.ok(minimal.data);
    assert.equal('active_nozzles_count' in minimal.data, false);
    assert.equal('droplet_size_um' in minimal.data, false);
    assert.equal('air_velocity_ms' in minimal.data, false);
    assert.equal('air_volume_m3h' in minimal.data, false);
    assert.equal('equipment_name' in minimal.data, false);
    assert.equal('nozzle_name' in minimal.data, false);

    const calId = await saveScopedCalibration('uid-1', minimal.data);
    assert.equal((await testDb.profiles_calibrations.get(calId))?.active_nozzles_count, undefined);
    const calcInputs = {
      volumeCalda: { rawValue: 400, unit: 'L/ha', canonicalKey: 'volumeCalda', dimension: 'volume_per_area' },
      velocidadeTrabalho: { rawValue: 6, unit: 'km/h', canonicalKey: 'velocidadeTrabalho', dimension: 'speed' },
      larguraTrabalho: { rawValue: 12, unit: 'm', canonicalKey: 'larguraTrabalho', dimension: 'length' },
      baseLargura: { rawValue: 'boom_total_width', unit: '', canonicalKey: 'baseLargura', dimension: 'enum' }
    };
    const res = debitoTotalCalculatorConfig.calculate(calcInputs);
    assert.equal(res.debitoTotal.subValue, undefined);
    const badNozzles = debitoTotalCalculatorConfig.validate({
      ...calcInputs,
      numeroBicos: { rawValue: 0, unit: '', canonicalKey: 'active_nozzles_count', dimension: 'count' }
    });
    assert.equal(badNozzles.isValid, false);
  });

  it('6. UI evita strings fictícias/undefined e preserva registos legados intactos', async () => {
    const viewSrc = fs.readFileSync('src/views/ExplorationView.tsx', 'utf8');
    assert.ok(!viewSrc.includes("location: 'Exploração DATERRA'"));
    assert.ok(!viewSrc.includes('is_approved: true'));
    assert.ok(!viewSrc.includes("'Atomizador Principal'"));
    assert.ok(!viewSrc.includes("'Bicos Padrão'"));
    assert.ok(!viewSrc.includes('35.000 m³/h'));
    assert.ok(viewSrc.includes("nz.spray_angle ?"));
    assert.ok(viewSrc.includes("cl.active_nozzles_count !== undefined"));
    assert.ok(viewSrc.includes("eq.distribution_type ?"));

    const legacyNzId = await testDb.profiles_nozzles.add({
      manufacturer: 'Albuz', model: 'ATR 80', color: 'Amarelo (02)',
      iso_classification: 'ISO 10625', nozzle_type: 'Cone Oco', spray_angle: '80°',
      working_pressure_bar: 10, nominal_flow_lmin: 1.03, userId: undefined
    });
    assert.equal((await testDb.profiles_nozzles.get(legacyNzId))?.spray_angle, '80°');
  });
});
