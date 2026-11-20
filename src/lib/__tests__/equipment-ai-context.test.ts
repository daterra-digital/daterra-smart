// src/lib/__tests__/equipment-ai-context.test.ts
import 'fake-indexeddb/auto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import Dexie from 'dexie';
import { DaterraDatabase } from '../../db/db.ts';
import type { EquipmentRecord } from '../../schemas/equipment.schema.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../../types/calculator.ts';
import {
  buildEquipmentAiContextItem,
  listScopedEquipmentsV12,
  loadActiveEquipmentAiContexts
} from '../../features/settings/equipment/equipmentAiContextService.ts';
import { explorationContextService } from '../../features/agri-chat/services/explorationContextService.ts';
import { hasLocalUserData } from '../../services/auth/localUserDataPresence.ts';
import { clearUserIndexedDbData } from '../../services/auth/sessionCleanupService.ts';

const createdDbs: string[] = [];
const nextDbName = (tag: string) => {
  const name = `DaterraEqAiCtx_${tag}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  createdDbs.push(name);
  return name;
};

const makeEq = (overrides: Partial<EquipmentRecord>): EquipmentRecord => ({
  id: crypto.randomUUID(),
  userId: 'user-A',
  name: 'Pulverizador Base',
  type: '2D_HORIZONTAL',
  tankCapacityL: 1200,
  workingWidthM: 24,
  nozzleSpacingCm: 50,
  defaultPressureBar: 3,
  defaultSpeedKmh: 8,
  iso16122Inspection: { lastInspectionDate: '2025-06-01', pressureGaugeOk: true, antiDripValveOk: true, nozzleWearWithin10Pct: true },
  lastUpdatedAt: '2026-04-01T10:00:00.000Z',
  ...overrides
});

describe('Bloco Final Equipamentos — Contexto IA @equipamento e Isolamento', () => {
  after(async () => {
    for (const name of createdDbs) await Dexie.delete(name);
  });

  it('1. 2D_HORIZONTAL sem e com manga de ar: nunca menciona TRV/LWA e inclui estado IPP', () => {
    const plain2D = makeEq({ name: 'Barra Clássica', type: '2D_HORIZONTAL', airAssisted: false });
    const itemPlain = buildEquipmentAiContextItem(plain2D, { countryCode: 'PT', trvM3ha: 40000 }, '2026-06-01');
    assert.equal(itemPlain.typologyBadge, '2D');
    assert.match(itemPlain.operationalSummary, /Barra 12 m/);
    assert.match(itemPlain.airSummary, /sem manga de ar/i);
    assert.ok(!itemPlain.promptSummary.includes('TRV') && !itemPlain.promptSummary.includes('LWA'));
    assert.match(itemPlain.promptSummary, /Estado IPP Legal: IPP Válida/);

    const sleeve2D = makeEq({
      name: 'Barra Hardi Twin',
      type: '2D_HORIZONTAL',
      airAssisted: true,
      defaultAirflowM3h: 14000,
      airCurtainAngle: '+15° (Frente — penetração)'
    });
    const itemSleeve = buildEquipmentAiContextItem(sleeve2D, { countryCode: 'PT' }, '2026-06-01');
    assert.match(itemSleeve.airSummary, /Manga de ar 14000 m³\/h/);
    assert.match(itemSleeve.promptSummary, /Manga de Ar \(14000 m³\/h\)/);
  });

  it('2. 3D_AXIAL cruza Q_ar,otimo com TRV ativo e degrada com segurança sem cultura ativa', () => {
    const axial3D = makeEq({
      name: 'Tomix Axial 1000',
      type: '3D_AXIAL',
      tankCapacityL: 1000,
      workingWidthM: 12,
      defaultSpeedKmh: 6,
      defaultAirflowM3h: 18000,
      airAssisted: true,
      iso16122Inspection: { lastInspectionDate: '2022-01-10', pressureGaugeOk: true, antiDripValveOk: true, nozzleWearWithin10Pct: true }
    });

    const withTrv = buildEquipmentAiContextItem(axial3D, { countryCode: 'PT', trvM3ha: 30000 }, '2026-06-01');
    assert.equal(withTrv.typologyBadge, '3D');
    assert.match(withTrv.airSummary, /Ventilação ótima \(18000 vs\. 18000 m³\/h\)/);
    assert.match(withTrv.promptSummary, /\[OPTIMAL/);
    assert.equal(withTrv.ippStatus.status, 'EXPIRED');
    assert.match(withTrv.promptSummary, /IPP Caducada/);

    const noCulture = buildEquipmentAiContextItem(axial3D, undefined, '2026-06-01');
    assert.match(noCulture.airSummary, /Ventilador: 18000 m³\/h/);
    assert.match(noCulture.promptSummary, /Caudal de Ar Atual: 18000 m³\/h/);
  });

  it('3. UAV_DRONE e MANUAL_LANCE: sem TRV e com ciclo legal IPP de 5 anos no manual', () => {
    const drone = makeEq({
      name: 'DJI Agras T40',
      type: 'UAV_DRONE',
      tankCapacityL: 40,
      workingWidthM: 4,
      nozzleSpacingCm: 125,
      defaultSpeedKmh: 18
    });
    const itemDrone = buildEquipmentAiContextItem(drone, { countryCode: 'PT' }, '2026-06-01');
    assert.equal(itemDrone.typologyBadge, 'UAV');
    assert.match(itemDrone.operationalSummary, /Faixa 5 m/);
    assert.match(itemDrone.promptSummary, /Vento máx\. legal <= 15 km\/h/);
    assert.ok(!itemDrone.promptSummary.includes('TRV'));

    const manual = makeEq({
      name: 'Carrinha Pistola 200L',
      type: 'MANUAL_LANCE',
      tankCapacityL: 200,
      workingWidthM: 2,
      lanceCount: 2,
      hoseLengthM: 50,
      hasHoseReel: true,
      defaultPressureBar: 15,
      iso16122Inspection: { lastInspectionDate: '2022-05-01', pressureGaugeOk: true, antiDripValveOk: true, nozzleWearWithin10Pct: true }
    });
    const itemManual = buildEquipmentAiContextItem(manual, { countryCode: 'PT' }, '2026-06-01');
    assert.equal(itemManual.typologyBadge, 'Manual');
    assert.equal(itemManual.ippStatus.cycleYears, 5);
    assert.equal(itemManual.ippStatus.status, 'VALID');
    assert.match(itemManual.operationalSummary, /2 un\. · 50 m · 15 bar/);
    assert.match(itemManual.promptSummary, /Ciclo IPP Portugal: 5 anos/);
  });

  it('4. formatContextForPrompt injeta @equipamento mesmo sem cultura e respeita desativação', () => {
    const item = buildEquipmentAiContextItem(makeEq({ name: 'Pulverizador Só Frota', airAssisted: false }), { countryCode: 'PT' }, '2026-06-01');
    const active = explorationContextService.formatContextForPrompt({
      equipmentRecordId: item.id,
      equipmentName: item.name,
      equipmentAiSummary: item.promptSummary,
      equipmentContextActive: true
    });
    assert.ok(active.includes('- Contexto @equipamento:') && active.includes('Pulverizador Só Frota') && active.includes('IPP Válida'));

    const muted = explorationContextService.formatContextForPrompt({
      equipmentRecordId: item.id,
      equipmentName: item.name,
      equipmentAiSummary: item.promptSummary,
      equipmentContextActive: false
    });
    assert.equal(muted, '');
  });

  it('5. Isolamento por userId no Dexie v12, hasLocalUserData e limpeza em logout', async () => {
    const testDb = new DaterraDatabase(nextDbName('isolation'));
    await testDb.open();

    const eqA = makeEq({ userId: 'user-A', name: 'Máquina A', type: '3D_AXIAL', defaultAirflowM3h: 22000 });
    const eqB = makeEq({ userId: 'user-B', name: 'Máquina B', type: '2D_HORIZONTAL' });
    const eqLegacy = makeEq({ userId: LEGACY_UNASSIGNED_MARKER, name: 'Máquina Órfã' });
    await testDb.equipments.bulkAdd([eqA, eqB, eqLegacy]);

    assert.equal((await listScopedEquipmentsV12('user-A', testDb)).length, 1);
    assert.equal((await listScopedEquipmentsV12('user-B', testDb))[0]?.name, 'Máquina B');
    assert.equal((await listScopedEquipmentsV12('', testDb)).length, 0);
    assert.equal((await listScopedEquipmentsV12(LEGACY_UNASSIGNED_MARKER, testDb)).length, 0);

    const contextsA = await loadActiveEquipmentAiContexts('user-A', null, { targetDb: testDb, referenceDateIso: '2026-06-01' });
    assert.equal(contextsA.length, 1);
    assert.equal(contextsA[0].name, 'Máquina A');

    const presenceA = await hasLocalUserData('user-A', testDb, null);
    assert.deepEqual(presenceA, { status: 'present', count: 1 });

    await clearUserIndexedDbData('user-A', undefined, testDb);
    assert.equal((await listScopedEquipmentsV12('user-A', testDb)).length, 0);
    assert.equal((await listScopedEquipmentsV12('user-B', testDb)).length, 1);
    assert.ok(await testDb.equipments.get(eqLegacy.id));
    testDb.close();
  });

  it('6. Governança: ficheiros criados/editados <= 200 LOC e zero classes dark:', () => {
    const files = [
      'src/features/settings/equipment/equipmentAiContextService.ts',
      'src/features/agri-chat/components/EquipmentContextChip.tsx',
      'src/features/agri-chat/types.ts',
      'src/features/agri-chat/services/explorationContextService.ts',
      'src/features/agri-chat/hooks/useAgriChatExploration.ts',
      'src/features/agri-chat/components/ExplorationProfileBar.tsx',
      'src/features/agri-chat/components/ChatDesktopSidebar.tsx',
      'src/features/agri-chat/components/ChatHeader.tsx',
      'src/features/agri-chat/AgriChatView.tsx',
      'src/services/auth/sessionCleanupService.ts',
      'src/services/auth/localUserDataPresence.ts',
      'src/lib/__tests__/equipment-ai-context.test.ts'
    ];
    for (const rel of files) {
      const content = fs.readFileSync(path.resolve(rel), 'utf8');
      assert.ok(content.split('\n').length <= 200, `${rel} excede 200 LOC`);
      if (!rel.includes('__tests__')) {
        assert.ok(!content.includes('dark:'), `${rel} não pode conter dark:`);
      }
    }
  });
});
