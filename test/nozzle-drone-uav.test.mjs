// test/nozzle-drone-uav.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  applyNozzleToSlots,
  buildNewProfile,
  isLevelSymmetric,
  mirrorSlotsLeftToRight
} from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import { getDefaultNozzle, resizeProfileSlots } from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import { formatSlotPositionHeading } from '../src/features/settings/nozzles/services/nozzleSlotFactory.ts';
import { buildMeasuredFlowKeypadTitle } from '../src/features/settings/nozzles/services/nozzleBoom2dHelpers.ts';
import {
  computeDroneBilateralDeviation,
  inferDroneRotorCount
} from '../src/features/settings/nozzles/services/nozzleDroneHelpers.ts';

const readNozzleFile = (relPath) =>
  fs.readFileSync(path.join(process.cwd(), 'src/features/settings/nozzles', relPath), 'utf8');

test('UAV_DRONE cria perfil vazio com 6 rotores e 6 posições (0/6 bicos, 0,00 L/min)', () => {
  const prof = buildNewProfile('u1', 'Drone UAV Novo', 'UAV_DRONE', 3, { emptyByDefault: true });
  assert.equal(prof.equipmentType, 'UAV_DRONE');
  assert.equal(inferDroneRotorCount(prof.slots), 6);
  assert.equal(prof.slots.length, 6);
  assert.equal(prof.activeSlotsCount, 0);
  assert.equal(prof.totalActiveFlowLMin, 0);
});

test('UAV_DRONE preserva bicos ao redimensionar, espelha Esq <-> Dir e suporta retrocompatibilidade', () => {
  let prof = buildNewProfile('u1', 'Drone UAV', 'UAV_DRONE', 3, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  prof = { ...prof, slots: applyNozzleToSlots(prof, 0, nozzle, 'slot') }; // B1 Esquerda

  // Simetria transversal B1 <-> B4
  const sym = applyNozzleToSlots(prof, 0, nozzle, 'level');
  assert.equal(sym[3].nozzleId, nozzle.id);
  assert.equal(isLevelSymmetric(sym, sym[0]), true);

  // Espelhar Esq -> Dir preservando débito real na direita
  let asym = applyNozzleToSlots(prof, 0, nozzle, 'side').map((s) => (s.slotIndex === 3 ? { ...s, measuredFlowLMin: 1.44 } : s));
  asym = mirrorSlotsLeftToRight(asym);
  assert.equal(asym[3].nozzleId, nozzle.id);
  assert.equal(asym[3].measuredFlowLMin, 1.44);

  const resized = resizeProfileSlots('UAV_DRONE', 3, asym, 8, { rotorCount: 8 });
  assert.equal(resized.length, 8);
  assert.equal(inferDroneRotorCount(resized), 8);
  assert.equal(resized[0].nozzleId, nozzle.id);

  // Retrocompatibilidade sem armIndex definido -> 6 rotores
  assert.equal(inferDroneRotorCount([{ ...prof.slots[0], armIndex: undefined }]), 6);
});

test('Desvio Esq. vs. Dir., títulos contextuais e contratos SVG/UI do Drone UAV', () => {
  const prof = buildNewProfile('u1', 'Drone UAV', 'UAV_DRONE', 3, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  const uniform = applyNozzleToSlots(prof, 0, nozzle, 'all');
  const devUniform = computeDroneBilateralDeviation(uniform);
  assert.equal(devUniform.bilateralDeviationPct, 0);
  assert.equal(devUniform.isCompliant, true);

  const imbalanced = uniform.map((s) => (s.slotIndex === 0 ? { ...s, measuredFlowLMin: s.flowAtPressureLMin * 1.5 } : s));
  const devImbalanced = computeDroneBilateralDeviation(imbalanced);
  assert.ok(devImbalanced.bilateralDeviationPct >= 10);
  assert.equal(devImbalanced.isCompliant, false);

  assert.equal(formatSlotPositionHeading(uniform[0], 'UAV_DRONE', 6), 'Esquerda | Bico B1');
  assert.equal(formatSlotPositionHeading(uniform[3], 'UAV_DRONE', 6), 'Direita | Bico B4');
  assert.match(buildMeasuredFlowKeypadTitle(uniform[0], 'UAV_DRONE', 6), /^Débito Real · Esq\. · B1 · /);

  const svg = readNozzleFile('components/svg-schemes/SvgDroneUav.tsx');
  const overlay = readNozzleFile('components/svg-schemes/SvgDroneChartOverlay.tsx');
  const filterBar = readNozzleFile('components/DroneFlankFilterBar.tsx');
  const fields = readNozzleFile('components/NozzleDroneFields.tsx');
  const card = readNozzleFile('components/BentoGeometricSchemeCard.tsx');
  const detail = readNozzleFile('components/BentoSlotDetailCard.tsx');
  const drawer = readNozzleFile('components/NozzleEditorDrawer.tsx');

  assert.match(svg, /viewBox="0 0 680 265"/);
  assert.match(svg, /▲ FRENTE/);
  assert.match(svg, /visibleSlots\.length > 8/);
  assert.match(overlay, /Débito por Bico \(L\/min\)/);
  assert.match(filterBar, /Esquerda/);
  assert.match(filterBar, /Direita/);
  assert.match(fields, /Tecnologia de Atomização/);
  assert.match(card, /SYMMETRIC_3D_TYPES = new Set\(\[[\s\S]*'UAV_DRONE'/);
  assert.match(detail, /Desvio Médio Esq\. vs\. Dir\. \(ISO 16122\)/);
  assert.match(drawer, /Simetria transversal/);
});
