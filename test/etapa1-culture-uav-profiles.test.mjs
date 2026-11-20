import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const { mapCultureToFormState } = await import('../src/features/perfis/services/cultureFormState.ts');
const { buildCultureSave } = await import('../src/features/perfis/services/cultureSaveBuilder.ts');
const { INITIAL_EQUIPMENT_V12_FORM, mapEquipmentRecordToForm } = await import('../src/features/settings/equipment/equipmentFormState.ts');
const { buildEquipmentRecordFromForm } = await import('../src/features/settings/equipment/equipmentPayloadBuilder.ts');

describe('Etapa 1 — Extensão Perfis de Cultura (2D/3D + Espacial) e Equipamento Drone / UAV', () => {
  it('1. Hidratação retrocompatível de Cultura (3D lenhosas vs 2D arvenses) e gravação 2D + espacial', () => {
    const legacyVinha = mapCultureToFormState({ id: 1, name: 'Vinha Velha', crop_type: 'Vinha', last_lwa_m2_ha: 12000 });
    assert.equal(legacyVinha.geometryMode, '3D');

    const legacyMilho = mapCultureToFormState({ id: 2, name: 'Milho Regadio', crop_type: 'Milho', culture_key: 'milho' });
    assert.equal(legacyMilho.geometryMode, '2D');

    const form2d = {
      ...legacyMilho,
      cropHeight2dCm: '45',
      groundCover2dPct: '65',
      applicationTarget2d: 'folha_dossel',
      referenceVolume2dLha: '300',
      windbreakBarrier: 'sebe_inferior',
      sensitiveZoneDistanceM: '15,5',
      rowAzimuthDeg: '90',
      parcelSlopePct: '4,5'
    };
    const res = buildCultureSave({ form: form2d, momentDraft: { observedAt: null, stageOptionId: '', stageLabel: '', canopyHeight: '', canopyWidth: '', lai: '', measurementSource: 'measured_field', revisionReason: '', markAsActive: true }, momentEditorOpen: false, dateValid: true });
    assert.equal(Object.keys(res.errors).length, 0);
    assert.equal(res.params?.culturePayload.geometry_mode, '2D');
    assert.equal(res.params?.culturePayload.crop_height_2d_cm, 45);
    assert.equal(res.params?.culturePayload.ground_cover_2d_pct, 65);
    assert.equal(res.params?.culturePayload.application_target_2d, 'folha_dossel');
    assert.equal(res.params?.culturePayload.reference_volume_2d_lha, 300);
    assert.equal(res.params?.culturePayload.windbreak_barrier, 'sebe_inferior');
    assert.equal(res.params?.culturePayload.sensitive_zone_distance_m, 15.5);
    assert.equal(res.params?.culturePayload.row_azimuth_deg, 90);
    assert.equal(res.params?.culturePayload.parcel_slope_pct, 4.5);
  });

  it('2. Drone UAV: validação Zod, CDA RPM sem exigir pressão hidráulica, e round-trip mapEquipmentRecordToForm', () => {
    const form = {
      ...INITIAL_EQUIPMENT_V12_FORM,
      name: 'DJI Agras T50',
      type: 'UAV_DRONE',
      tankCapacityL: '40',
      workingWidthM: '4',
      nozzleSpacingCm: '125',
      defaultSpeedKmh: '22',
      uavFlightHeightM: '3,2',
      uavSwathWidthM: '6,5',
      uavWeightClass: 'HEAVY_GTE_20L',
      uavRotorCount: '8',
      uavTerrainRadar: true,
      uavAtomizationSystem: 'CENTRIFUGAL_CDA',
      uavCdaDiscRpm: '13500',
      uavDropletDv50Um: '220',
      uavDropletDv10Um: '95',
      uavNozzlePlacement: 'WINGTIP'
    };

    const built = buildEquipmentRecordFromForm(form, 'user-uav-1');
    assert.equal(Object.keys(built.errors).length, 0);
    assert.ok(built.record);
    assert.equal(built.record.uavDetails?.flightHeightM, 3.2);
    assert.equal(built.record.uavDetails?.swathWidthM, 6.5);
    assert.equal(built.record.uavDetails?.rotorCount, 8);
    assert.equal(built.record.uavDetails?.atomizationSystem, 'CENTRIFUGAL_CDA');
    assert.equal(built.record.uavDetails?.cdaDiscRpm, 13500);
    assert.equal(built.record.uavDetails?.nozzlePlacement, 'WINGTIP');

    const roundTrip = mapEquipmentRecordToForm(built.record);
    assert.equal(roundTrip.uavFlightHeightM, '3,2');
    assert.equal(roundTrip.uavCdaDiscRpm, '13500');
    assert.equal(roundTrip.uavNozzlePlacement, 'WINGTIP');
  });

  it('3. Governança Etapa 1: <= 200 LOC, UTF-8 sem BOM, zero dark: e zero <select> nativos nos ficheiros editados', () => {
    const files = [
      'src/db/cultureTypes.ts',
      'src/db/types.ts',
      'src/schemas/equipmentUav.schema.ts',
      'src/schemas/equipment.schema.ts',
      'src/features/perfis/data/cultureGeometryOptions.ts',
      'src/features/perfis/services/cultureKeypadHelpers.ts',
      'src/features/perfis/services/cultureFormState.ts',
      'src/features/perfis/services/cultureSaveBuilder.ts',
      'src/features/perfis/hooks/useCultureController.ts',
      'src/features/perfis/components/CultureGeometryPanel.tsx',
      'src/features/perfis/components/CultureSpatialContextFields.tsx',
      'src/features/perfis/components/CultureMeasurementsAccordion.tsx',
      'src/features/perfis/components/CultureLocationAccordion.tsx',
      'src/features/perfis/components/CultureSection.tsx',
      'src/features/settings/equipment/equipmentUavHelpers.ts',
      'src/features/settings/equipment/equipmentFormState.ts',
      'src/features/settings/equipment/equipmentFormHelpers.ts',
      'src/features/settings/equipment/equipmentPayloadBuilder.ts',
      'src/features/settings/equipment/EquipmentUavAerodynamicsFields.tsx',
      'src/features/settings/equipment/EquipmentUavSummaryPanel.tsx',
      'src/features/settings/equipment/EquipmentEditorMainAccordions.tsx',
      'src/features/settings/equipment/EquipmentDistributionCard.tsx'
    ];
    for (const f of files) {
      const buf = fs.readFileSync(path.resolve(f));
      assert.equal(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, false, `${f} tem BOM`);
      const txt = buf.toString('utf8');
      assert.ok(txt.split('\n').length <= 200, `${f} excede 200 LOC (${txt.split('\n').length})`);
      assert.ok(!/\bdark:/.test(txt), `${f} contém classes dark:`);
      assert.ok(!/<select\b/i.test(txt), `${f} contém <select> nativo`);
    }
  });
});
