// test/nozzle-bento-schemes.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import { EQUIPMENT_TYPES } from '../src/schemas/equipment.schema.ts';
import { EQUIPMENT_TYPE_LABELS_PT } from '../src/lib/equipment-math.ts';
import {
  areAllActiveNozzlesIdentical,
  buildKeypadShortcutsForFlow,
  calculateBilateralDeviationPct,
  calculateFlowDeviationPct,
  calculateNozzleFlow,
  computeBilateralStats,
  computeSlotGroupStats,
  generateDefaultSlots,
  isIso16122DeviationExceeded,
  recalculateSlotsFlow,
  resizeProfileSlots
} from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import {
  applyNozzleToSlots,
  buildNewProfile,
  isLevelSymmetric,
  mirrorSlotsLeftToRight
} from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import { NOZZLES_BY_ID } from '../src/features/nozzle-comparison/nozzleComparison.data.ts';
import { buildNozzleAiItem } from '../src/features/settings/nozzles/services/nozzleAiContextService.ts';

test('1. Lei do Orifício, Desvio (%) e Alerta Normativo ISO 16122 (> 10%)', () => {
  assert.equal(calculateNozzleFlow(0.76, 3.0), 0.76);
  assert.equal(calculateNozzleFlow(0.76, 12.0), 1.52);
  assert.equal(calculateNozzleFlow(0.76, 0), 0);

  assert.equal(calculateFlowDeviationPct(1.0, 1.1), 10);
  assert.equal(isIso16122DeviationExceeded(10), false);
  assert.equal(calculateFlowDeviationPct(1.0, 1.11), 11);
  assert.equal(isIso16122DeviationExceeded(11), true);
  assert.equal(isIso16122DeviationExceeded(-10.5), true);
});

test('2. Geração das 9 Tipologias com Setores, Rampas e Flexibilidade Total', () => {
  assert.equal(EQUIPMENT_TYPES.length, 9);
  // Barra 2D default: 3 setores x 5 bicos = 15; expansível até 100+ bicos (10 x 10)
  assert.equal(generateDefaultSlots('2D_HORIZONTAL', 3.0).length, 15);
  assert.equal(generateDefaultSlots('2D_HORIZONTAL', 3.0, 10, { secondaryCount: 10 }).length, 100);

  // Axial, Tangencial e Fluxo Cruzado: sempre 2 rampas, 2/4/6 setores, até 24 bicos
  for (const t of ['3D_AXIAL', '3D_TANGENTIAL', '3D_CROSSFLOW']) {
    const slots24 = generateDefaultSlots(t, 10.0, 12, { threeDSectors: 6 });
    assert.equal(slots24.length, 24);
    assert.equal(slots24.filter((s) => s.sectionSide === 'LEFT').length, 12);
    assert.equal(slots24.filter((s) => s.sectionSide === 'RIGHT').length, 12);
    assert.equal(Math.max(...slots24.map((s) => s.sectorIndex ?? 0)), 3);
  }

  // Túnel 3D: 4 rampas + orientação Interior/Exterior/Ambos
  const tunnel = generateDefaultSlots('3D_TUNNEL', 8.0, 4, { tunnelOrientation: 'BOTH' });
  assert.equal(tunnel.length, 16);
  assert.equal(tunnel[0].orientation, 'BOTH');

  // Pneumático 3D: 2/4/6/8 braços x 1..6 bicos por braço
  assert.equal(generateDefaultSlots('3D_PNEUMATIC', 10.0).length, 8); // 4 braços x 2 bicos
  assert.equal(generateDefaultSlots('3D_PNEUMATIC', 10.0, 6, { secondaryCount: 3 }).length, 18);

  // Canhão, Drone UAV (2..12) e Manual (1..12)
  assert.equal(generateDefaultSlots('3D_CANNON', 15.0, 6, { secondaryCount: 3 }).length, 9);
  assert.equal(generateDefaultSlots('UAV_DRONE', 2.5, 10).length, 10);
  assert.equal(generateDefaultSlots('MANUAL_LANCE', 15.0, 5).length, 5);
});

test('3. Regeneração preserva bicos, espelhamento e médias condicionais', () => {
  const axial = generateDefaultSlots('3D_AXIAL', 10.0, 6);
  axial[0] = { ...axial[0], nozzleId: 'lechler_tr_80_03', brand: 'Lechler', model: 'TR', color: 'Azul', nominalFlowLMin: 1.2 };
  assert.equal(areAllActiveNozzlesIdentical(axial), false);

  const resized = resizeProfileSlots('3D_AXIAL', 10.0, axial, 8, { threeDSectors: 4 });
  assert.equal(resized.length, 16);
  assert.equal(resized[0].brand, 'Lechler');

  const mirrored = mirrorSlotsLeftToRight(resized);
  const rightLevel1 = mirrored.find((s) => s.sectionSide === 'RIGHT' && s.levelIndex === 1);
  assert.equal(rightLevel1?.brand, 'Lechler');

  const uniform = generateDefaultSlots('2D_HORIZONTAL', 3.0);
  uniform[0] = { ...uniform[0], measuredFlowLMin: uniform[0].flowAtPressureLMin * 1.15 };
  assert.equal(areAllActiveNozzlesIdentical(uniform), true);
  assert.equal(computeSlotGroupStats(uniform).hasIso16122Alert, true);
});

test('4. Recálculo de caudal com bicos ativos/fechados e @bico sem chaves cruas', () => {
  const axialSlots = generateDefaultSlots('3D_AXIAL', 12.0);
  const singleFlow = calculateNozzleFlow(axialSlots[0].nominalFlowLMin, 12.0, axialSlots[0].referencePressureBar ?? 3);
  axialSlots[4].isActive = false;
  axialSlots[5].isActive = false;
  axialSlots[10].isActive = false;
  axialSlots[11].isActive = false;

  const result = recalculateSlotsFlow(axialSlots, 12.0);
  assert.equal(result.activeCount, 8);
  assert.equal(result.totalFlow, Number((8 * singleFlow).toFixed(3)));

  const aiItem = buildNozzleAiItem({
    id: crypto.randomUUID(),
    name: 'Torre Tangencial Vinha',
    equipmentType: '3D_TANGENTIAL',
    referencePressureBar: 10,
    slots: result.slots,
    totalActiveFlowLMin: result.totalFlow,
    activeSlotsCount: result.activeCount,
    totalSlotsCount: result.slots.length,
    updatedAt: new Date().toISOString()
  });
  assert.equal(aiItem.equipmentType, EQUIPMENT_TYPE_LABELS_PT['3D_TANGENTIAL']);
  assert.equal(aiItem.summaryText.includes('3D_TANGENTIAL'), false);
});

test('5. Governança: <= 200 LOC, zero dark: e ZERO <select> nativos em Bicos', () => {
  const nozzleFiles = [
    'src/schemas/nozzle-profile.schema.ts',
    'src/features/settings/nozzles/NozzleSection.tsx',
    'src/features/settings/nozzles/hooks/useNozzleBentoController.ts',
    'src/features/settings/nozzles/services/nozzleProfileMath.ts',
    'src/features/settings/nozzles/services/nozzleSlotFactory.ts',
    'src/features/settings/nozzles/services/nozzleProfileActions.ts',
    'src/features/settings/nozzles/services/nozzleAiContextService.ts',
    'src/features/settings/nozzles/components/BentoSavedProfilesCard.tsx',
    'src/features/settings/nozzles/components/BentoSchemeHeaderStrip.tsx',
    'src/features/settings/nozzles/components/BentoSchemeActionsMenu.tsx',
    'src/features/settings/nozzles/components/BentoHydraulicControlsBar.tsx',
    'src/features/settings/nozzles/components/BentoGeometricSchemeCard.tsx',
    'src/features/settings/nozzles/components/BentoSlotCharacteristicsRow.tsx',
    'src/features/settings/nozzles/components/BentoSlotDetailCard.tsx',
    'src/features/settings/nozzles/components/NozzleEditorDrawer.tsx',
    'src/features/settings/nozzles/components/NozzleEditorDrawerCascade.tsx',
    'src/features/settings/nozzles/components/NozzleColorIsoDropdown.tsx',
    'src/features/settings/nozzles/components/NozzleGuideModal.tsx',
    'src/features/settings/nozzles/components/NozzleMetadataModal.tsx',
    'src/features/settings/nozzles/components/NozzleMetadataGeometryFields.tsx',
    'src/features/settings/nozzles/components/NozzleBoomSectorFields.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgUniformFanSymbol.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgBilateralAxisOverlay.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgBoom2d.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgAxialFan3d.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgTangentialFan3d.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgCrossflowTower3d.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgTunnel3d.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgPneumatic3d.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgCannon3d.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgDroneUav.tsx',
    'src/features/settings/nozzles/components/svg-schemes/SvgManualLance.tsx'
  ];

  for (const rel of nozzleFiles) {
    const content = fs.readFileSync(path.resolve(rel), 'utf8');
    const lines = content.split('\n').length;
    assert.ok(lines <= 200, `${rel} excede 200 LOC (${lines})`);
    assert.equal(content.includes('dark:'), false, `${rel} contém dark:`);
    assert.equal(content.includes('<select'), false, `${rel} contém <select> nativo`);
  }

  // Validação da Bento Grid de 3 cartões e remoção de código morto
  assert.equal(
    fs.existsSync(path.resolve('src/features/settings/nozzles/components/BentoEquipmentHydraulicCard.tsx')),
    false
  );
  const sectionSrc = fs.readFileSync(path.resolve('src/features/settings/nozzles/NozzleSection.tsx'), 'utf8');
  assert.ok(sectionSrc.includes('xl:col-span-5') && sectionSrc.includes('xl:col-span-7') && sectionSrc.includes('xl:col-span-12'));
  assert.ok(sectionSrc.includes('xl:col-span-8'));
  const detailSrc = fs.readFileSync(path.resolve('src/features/settings/nozzles/components/BentoSlotDetailCard.tsx'), 'utf8');
  assert.ok(detailSrc.includes('Características da Configuração'));
  assert.ok(detailSrc.includes('Lista de Configurações de Bicos'));
  const headerSrc = fs.readFileSync(path.resolve('src/features/settings/nozzles/components/BentoSchemeHeaderStrip.tsx'), 'utf8');
  assert.ok(headerSrc.includes('Perfil de Distribuição de Débitos'));
});

test('6. Conformidade Bilateral ISO 16122 (Δ < 10% vs ≥ 10%) para Ventilador Axial 3D', () => {
  assert.equal(calculateBilateralDeviationPct(5.0, 5.0), 0);
  assert.equal(calculateBilateralDeviationPct(5.0, 5.4), 7.4);
  assert.equal(calculateBilateralDeviationPct(5.0, 5.6), 10.7);

  const axial = generateDefaultSlots('3D_AXIAL', 10.0, 6);
  const stats = computeBilateralStats(axial);
  assert.equal(stats.isCompliant, true);
  assert.equal(stats.bilateralDeviationPct, 0);

  // Alterar caudal da direita para simular desvio > 10%
  const asymmetric = axial.map((s) =>
    s.sectionSide === 'RIGHT' ? { ...s, measuredFlowLMin: s.flowAtPressureLMin * 1.15 } : s
  );
  const asymStats = computeBilateralStats(asymmetric);
  assert.equal(asymStats.isCompliant, false);
  assert.ok(asymStats.bilateralDeviationPct >= 10);

  // Guarda de zero: todos os bicos fechados -> 0,0% sem NaN
  const allClosed = axial.map((s) => ({ ...s, isActive: false }));
  const zeroStats = computeBilateralStats(allClosed);
  assert.equal(zeroStats.leftFlow, 0);
  assert.equal(zeroStats.rightFlow, 0);
  assert.equal(zeroStats.bilateralDeviationPct, 0);
  assert.equal(Number.isNaN(zeroStats.bilateralDeviationPct), false);
  assert.equal(zeroStats.isCompliant, true);

  // 7 atalhos dinâmicos do DaterraKeypad + guarda de zero
  assert.deepEqual(buildKeypadShortcutsForFlow(2.0, true), [1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3]);
  assert.deepEqual(buildKeypadShortcutsForFlow(0, false), [0.4, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0]);

  // Simetria automática vs assimétrica por nível preservando débito real
  const prof = buildNewProfile('u1', 'Axial', '3D_AXIAL', 10);
  prof.slots[0] = { ...prof.slots[0], measuredFlowLMin: 1.11 };
  const rightN1 = prof.slots.find((s) => s.sectionSide === 'RIGHT' && s.levelIndex === 1);
  if (rightN1) prof.slots[rightN1.slotIndex] = { ...rightN1, measuredFlowLMin: 2.22 };
  const lechler = Array.from(NOZZLES_BY_ID.values()).find((n) => n.id !== prof.slots[0].nozzleId);
  assert.ok(lechler);
  const symSlots = applyNozzleToSlots(prof, 0, lechler, 'level');
  assert.equal(isLevelSymmetric(symSlots, symSlots[0]), true);
  assert.equal(symSlots[0].measuredFlowLMin, 1.11);
  assert.equal(symSlots.find((s) => s.sectionSide === 'RIGHT' && s.levelIndex === 1)?.measuredFlowLMin, 2.22);
  const asymSlots = applyNozzleToSlots({ ...prof, slots: symSlots }, 0, NOZZLES_BY_ID.get(prof.slots[0].nozzleId), 'slot');
  assert.equal(isLevelSymmetric(asymSlots, asymSlots[0]), false);
});
