// src/lib/__tests__/equipment-ipp-rules.test.ts
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEquipmentIppStatus,
  getLegalIppCycleYears
} from '../equipment-ipp-rules.ts';
import { buildEquipmentAiContextSummary } from '../equipment-math.ts';
import type { EquipmentRecord } from '../../schemas/equipment.schema.ts';
import { INITIAL_EQUIPMENT_V12_FORM } from '../../features/settings/equipment/equipmentFormState.ts';
import { buildEquipmentRecordFromForm } from '../../features/settings/equipment/equipmentPayloadBuilder.ts';

const BASE_ISO_CHECK = {
  pressureGaugeOk: true,
  antiDripValveOk: true,
  nozzleWearWithin10Pct: true
};

describe('Equipamentos (IPP Portugal DL 86/2010 & DL 78/2020 + MANUAL_LANCE)', () => {
  it('1. Distingue rigorosamente o ciclo de 5 anos (MANUAL_LANCE) vs. 3 anos (restantes tipologias)', () => {
    assert.equal(getLegalIppCycleYears('MANUAL_LANCE'), 5);
    assert.equal(getLegalIppCycleYears('2D_HORIZONTAL'), 3);
    assert.equal(getLegalIppCycleYears('3D_AXIAL'), 3);
    assert.equal(getLegalIppCycleYears('3D_CROSSFLOW'), 3);
    assert.equal(getLegalIppCycleYears('3D_TUNNEL'), 3);
    assert.equal(getLegalIppCycleYears('UAV_DRONE'), 3);
  });

  it('2. Calcula VALID, EXPIRING_SOON (<= 90 dias) e EXPIRED em Portugal (PT)', () => {
    // 3D_AXIAL inspecionado em 2025-06-15 -> expira em 2028-06-15 (3 anos)
    const valid3D = evaluateEquipmentIppStatus(
      {
        type: '3D_AXIAL',
        iso16122Inspection: { ...BASE_ISO_CHECK, lastInspectionDate: '2025-06-15' }
      },
      { countryCode: 'PT', referenceDateIso: '2026-11-18' }
    );
    assert.equal(valid3D.status, 'VALID');
    assert.equal(valid3D.dueDateIso, '2028-06-15');
    assert.equal(valid3D.badgeText, 'IPP Válida · até 06/2028');

    // MANUAL_LANCE inspecionado em 2022-01-10 -> expira em 2027-01-10 (5 anos, a 53 dias de 2026-11-18)
    const expiringManual = evaluateEquipmentIppStatus(
      {
        type: 'MANUAL_LANCE',
        iso16122Inspection: { ...BASE_ISO_CHECK, lastInspectionDate: '2022-01-10' }
      },
      { countryCode: 'PT', referenceDateIso: '2026-11-18' }
    );
    assert.equal(expiringManual.status, 'EXPIRING_SOON');
    assert.equal(expiringManual.cycleYears, 5);
    assert.equal(expiringManual.daysRemaining, 53);
    assert.equal(expiringManual.badgeText, 'IPP expira em 53d');

    // 2D_HORIZONTAL inspecionado em 2023-05-01 -> expirou em 2026-05-01
    const expired2D = evaluateEquipmentIppStatus(
      {
        type: '2D_HORIZONTAL',
        iso16122Inspection: { ...BASE_ISO_CHECK, lastInspectionDate: '2023-05-01' }
      },
      { countryCode: 'PT', referenceDateIso: '2026-11-18' }
    );
    assert.equal(expired2D.status, 'EXPIRED');
    assert.equal(expired2D.badgeText, 'IPP Caducada');
    assert.ok(expired2D.daysRemaining !== null && expired2D.daysRemaining < 0);
  });

  it('3. Dispara YEAR_ALERT quando não há data mas o ano de construção já atingiu o ciclo legal', () => {
    const yearAlert3D = evaluateEquipmentIppStatus(
      {
        type: '3D_AXIAL',
        manufactureYear: 2023,
        iso16122Inspection: BASE_ISO_CHECK
      },
      { countryCode: 'PT', referenceDateIso: '2026-11-18' }
    );
    assert.equal(yearAlert3D.status, 'YEAR_ALERT');
    assert.equal(yearAlert3D.estimatedDueYear, 2026);
    assert.equal(yearAlert3D.badgeText, 'Verificar IPP (Ano 2023)');

    // MANUAL_LANCE de 2023 só atinge 5 anos em 2028 -> em 2026 ainda é MISSING_DATE
    const manualRecent = evaluateEquipmentIppStatus(
      {
        type: 'MANUAL_LANCE',
        manufactureYear: 2023,
        iso16122Inspection: BASE_ISO_CHECK
      },
      { countryCode: 'PT', referenceDateIso: '2026-11-18' }
    );
    assert.equal(manualRecent.status, 'MISSING_DATE');
    assert.equal(manualRecent.badgeText, 'Data IPP pendente');
  });

  it('4. Devolve NON_PT_EXEMPT para explorações fora de Portugal (ex.: ES, FR)', () => {
    const nonPt = evaluateEquipmentIppStatus(
      {
        type: '3D_AXIAL',
        manufactureYear: 2018,
        iso16122Inspection: BASE_ISO_CHECK
      },
      { countryCode: 'ES', referenceDateIso: '2026-11-18' }
    );
    assert.equal(nonPt.status, 'NON_PT_EXEMPT');
    assert.equal(nonPt.badgeText, 'Inspeção OK');
  });

  it('5. Constrói registo MANUAL_LANCE e resumo @equipamento sem TRV/LWA e valida <= 200 LOC', () => {
    const built = buildEquipmentRecordFromForm(
      {
        ...INITIAL_EQUIPMENT_V12_FORM,
        name: 'Carretel Manual 400L',
        type: 'MANUAL_LANCE',
        tankCapacityL: '400',
        lanceCount: '2',
        hoseLengthM: '50',
        hasHoseReel: true,
        defaultPressureBar: '15',
        hoseAndTriggerOk: true
      },
      'user-manual-1'
    );
    assert.ok(built.record);
    assert.equal(built.record.type, 'MANUAL_LANCE');
    assert.equal(built.record.lanceCount, 2);
    assert.equal(built.record.hoseLengthM, 50);
    assert.equal(built.record.hasHoseReel, true);

    const summary = buildEquipmentAiContextSummary(built.record as EquipmentRecord, { trvM3ha: 2500 });
    assert.ok(summary.includes('Pistolas / Lanças: 2 un.'));
    assert.ok(summary.includes('Mangueira: 50 m'));
    assert.ok(summary.includes('Ciclo IPP Portugal: 5 anos'));
    assert.equal(summary.includes('TRV'), false);

    for (const rel of [
      'src/lib/equipment-ipp-rules.ts',
      'src/features/settings/EquipmentIppAlertsPanel.tsx',
      'src/features/settings/SettingsNotificationsTab.tsx'
    ]) {
      const content = fs.readFileSync(path.resolve(rel), 'utf8');
      const lines = content.split('\n').length;
      assert.ok(lines <= 200, `${rel} excede 200 LOC (${lines})`);
      assert.equal(content.includes('dark:'), false);
    }
  });
});
