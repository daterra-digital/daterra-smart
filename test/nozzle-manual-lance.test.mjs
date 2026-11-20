// test/nozzle-manual-lance.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { applyNozzleToSlots, buildNewProfile } from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import { getDefaultNozzle, resizeProfileSlots } from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import { formatSlotPositionHeading } from '../src/features/settings/nozzles/services/nozzleSlotFactory.ts';
import { buildMeasuredFlowKeypadTitle } from '../src/features/settings/nozzles/services/nozzleBoom2dHelpers.ts';
import {
  computeManualLanceDeviation,
  getManualSlotBadge
} from '../src/features/settings/nozzles/services/nozzleManualHelpers.ts';

const readNozzleFile = (relPath) =>
  fs.readFileSync(path.join(process.cwd(), 'src/features/settings/nozzles', relPath), 'utf8');

test('MANUAL_LANCE cria perfil vazio por defeito com 6 pistolas/lanças (0/6 bicos, 0,00 L/min)', () => {
  const prof = buildNewProfile('u1', 'Manual Novo', 'MANUAL_LANCE', 10, { emptyByDefault: true });
  assert.equal(prof.equipmentType, 'MANUAL_LANCE');
  assert.equal(prof.slots.length, 6);
  assert.equal(prof.activeSlotsCount, 0);
  assert.equal(prof.totalActiveFlowLMin, 0);
});

test('MANUAL_LANCE preserva bicos e medições ao redimensionar (1..12 lanças)', () => {
  let prof = buildNewProfile('u1', 'Manual', 'MANUAL_LANCE', 10, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  prof = {
    ...prof,
    slots: applyNozzleToSlots(prof, 0, nozzle, 'slot').map((s) => (s.slotIndex === 0 ? { ...s, measuredFlowLMin: 1.52 } : s))
  };
  const resized = resizeProfileSlots('MANUAL_LANCE', 10, prof.slots, 9);
  assert.equal(resized.length, 9);
  assert.equal(resized[0].nozzleId, nozzle.id);
  assert.equal(resized[0].measuredFlowLMin, 1.52);
});

test('Guarda de zero (<= 1 lança ativa -> 0,0%) e desvio médio entre lanças', () => {
  const prof = buildNewProfile('u1', 'Manual', 'MANUAL_LANCE', 10, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();

  const devZero = computeManualLanceDeviation(prof.slots);
  assert.equal(devZero.avgDeviationPct, 0);
  assert.equal(devZero.isCompliant, true);

  const oneSlot = applyNozzleToSlots(prof, 0, nozzle, 'slot');
  const devOne = computeManualLanceDeviation(oneSlot);
  assert.equal(devOne.activeCount, 1);
  assert.equal(devOne.avgDeviationPct, 0);
  assert.equal(devOne.isCompliant, true);

  const imbalanced = applyNozzleToSlots(prof, 0, nozzle, 'all').map((s) =>
    s.slotIndex === 0 ? { ...s, measuredFlowLMin: s.flowAtPressureLMin * 1.4 } : s
  );
  const devImbal = computeManualLanceDeviation(imbalanced);
  assert.ok(devImbal.avgDeviationPct > 0);
  assert.equal(devImbal.isCompliant, false);
});

test('Identificação L1..Ln, títulos contextuais e contratos SVG/UI para MANUAL_LANCE', () => {
  const prof = buildNewProfile('u1', 'Manual', 'MANUAL_LANCE', 10, { emptyByDefault: true });
  const uniform = applyNozzleToSlots(prof, 0, getDefaultNozzle(), 'all');
  assert.equal(getManualSlotBadge(uniform[0], 0), 'L1');
  assert.equal(formatSlotPositionHeading(uniform[0], 'MANUAL_LANCE'), 'Pistola / Lança | L1');
  assert.match(buildMeasuredFlowKeypadTitle(uniform[0], 'MANUAL_LANCE'), /^Débito Real · Lança L1 · /);

  const svg = readNozzleFile('components/svg-schemes/SvgManualLance.tsx');
  const overlay = readNozzleFile('components/svg-schemes/SvgManualChartOverlay.tsx');
  const fields = readNozzleFile('components/NozzleManualFields.tsx');
  const card = readNozzleFile('components/BentoGeometricSchemeCard.tsx');
  const detail = readNozzleFile('components/BentoSlotDetailCard.tsx');
  const drawer = readNozzleFile('components/NozzleEditorDrawer.tsx');

  assert.match(svg, /viewBox="0 0 680 265"/);
  assert.match(svg, /count > 10/);
  assert.match(overlay, /Débito por Bico \(L\/min\)/);
  assert.match(fields, /N\.º de Pistolas \/ Lanças/);
  assert.doesNotMatch(card, /SYMMETRIC_3D_TYPES = new Set\(\[[^\]]*MANUAL_LANCE/);
  assert.match(detail, /Desvio Lanças:/);
  assert.match(detail, /Desvio Médio Entre Lanças \(ISO 16122\)/);
  assert.match(drawer, /todas as pistolas\/lanças/);
});
