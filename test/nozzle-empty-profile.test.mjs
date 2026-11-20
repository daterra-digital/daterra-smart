// test/nozzle-empty-profile.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import { NozzleProfileSchema } from '../src/schemas/nozzle-profile.schema.ts';
import {
  computeBilateralStats,
  isSlotConfigured,
  resizeProfileSlots
} from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import {
  applyNozzleToSlots,
  applyMeasuredFlowToSlots,
  buildNewProfile,
  isLevelSymmetric,
  mirrorSlotsLeftToRight
} from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import {
  buildBoom2dSlotHeading,
  buildMeasuredFlowKeypadTitle,
  computeBoomMaxDeviationPct,
  computeBoomSectorDeviationPct,
  computeBoomSectorSummaries,
  distributeNozzlesAcrossSectors,
  getBoomSectorCounts,
  isBoomSectorUniform,
  isBoomUniform,
  resizeBoomSlotsBySectorCounts
} from '../src/features/settings/nozzles/services/nozzleBoom2dHelpers.ts';
import { NOZZLES_BY_ID } from '../src/features/nozzle-comparison/nozzleComparison.data.ts';

test('1. Novo perfil nasce com 6 níveis (12 posições) e 0 bicos pré-selecionados', () => {
  const emptyProf = buildNewProfile('u1', 'Novo Axial', '3D_AXIAL', 10.0, { emptyByDefault: true });
  const parsed = NozzleProfileSchema.safeParse(emptyProf);
  assert.equal(parsed.success, true);

  assert.equal(emptyProf.totalSlotsCount, 12);
  assert.equal(emptyProf.activeSlotsCount, 0);
  assert.equal(emptyProf.totalActiveFlowLMin, 0);
  assert.equal(emptyProf.slots.every((s) => !isSlotConfigured(s)), true);

  const bilateral = computeBilateralStats(emptyProf.slots);
  assert.equal(bilateral.leftFlow, 0);
  assert.equal(bilateral.rightFlow, 0);
  assert.equal(bilateral.bilateralDeviationPct, 0);
  assert.equal(bilateral.isCompliant, true);
});

test('2. Resiliência em espelhamento, redimensionamento e atribuição em slots vazios', () => {
  const emptyProf = buildNewProfile('u1', 'Novo Axial', '3D_AXIAL', 10.0, { emptyByDefault: true });
  assert.equal(isLevelSymmetric(emptyProf.slots, emptyProf.slots[0]), true);

  const mirrored = mirrorSlotsLeftToRight(emptyProf.slots);
  assert.equal(mirrored.every((s) => !isSlotConfigured(s)), true);

  const resized = resizeProfileSlots('3D_AXIAL', 10.0, emptyProf.slots, 8);
  assert.equal(resized.length, 16);
  assert.equal(resized.every((s) => !isSlotConfigured(s)), true);

  const sampleNozzle = Array.from(NOZZLES_BY_ID.values())[0];
  const updatedSlots = applyNozzleToSlots(emptyProf, 0, sampleNozzle, 'level');
  assert.equal(isSlotConfigured(updatedSlots[0]), true);
  assert.equal(updatedSlots.filter((s) => isSlotConfigured(s)).length, 2);
});

test('3. Remoção do banner Nota de Formatação em ExplorationView', () => {
  const expSrc = fs.readFileSync(path.resolve('src/views/ExplorationView.tsx'), 'utf8');
  assert.equal(expSrc.includes('exploration.formattingNote'), false);
});

test('4. Barra Horizontal 2D: bicos individuais B1..Bn, S1 (n), sem ventilador e desvio ISO 16122', () => {
  assert.deepEqual(distributeNozzlesAcrossSectors(20, 3), [7, 6, 7]);
  assert.deepEqual(distributeNozzlesAcrossSectors(60, 3), [20, 20, 20]);

  const boom = buildNewProfile('u1', 'Barra 20', '2D_HORIZONTAL', 3.0);
  const resized = resizeProfileSlots('2D_HORIZONTAL', 3.0, boom.slots, 3, { totalNozzles: 20 });
  assert.equal(resized.length, 20);
  const sums = computeBoomSectorSummaries(resized, 3);
  assert.deepEqual(sums.map((s) => s.nozzleCount), [7, 6, 7]);
  assert.equal(isBoomUniform(resized), true);
  assert.equal(isBoomSectorUniform(resized, 1), true);
  assert.equal(buildBoom2dSlotHeading(resized[0]), 'Setor 1 (S1) | Bico B1');
  assert.ok(buildMeasuredFlowKeypadTitle(resized[0], '2D_HORIZONTAL').startsWith('Débito Real · S1 · B1'));

  const altNozzle = Array.from(NOZZLES_BY_ID.values()).find((n) => n.id !== resized[0].nozzleId);
  assert.ok(altNozzle);
  const singleEdited = applyNozzleToSlots({ ...boom, slots: resized }, 0, altNozzle, 'slot');
  assert.equal(isBoomSectorUniform(singleEdited, 1), false);
  assert.equal(isBoomSectorUniform(singleEdited, 2), true);

  const measured = applyMeasuredFlowToSlots({ ...boom, slots: singleEdited }, 0, singleEdited[0].flowAtPressureLMin * 1.14);
  assert.equal(computeBoomMaxDeviationPct(measured), 14);

  const boomSvgSrc = fs.readFileSync(path.resolve('src/features/settings/nozzles/components/svg-schemes/SvgBoom2d.tsx'), 'utf8');
  assert.equal(boomSvgSrc.includes('<SvgUniformFanSymbol'), false);
  assert.equal(boomSvgSrc.includes('ESQUERDA') && boomSvgSrc.includes('DIREITA'), true);
  const detailSrc = fs.readFileSync(path.resolve('src/features/settings/nozzles/components/BentoSlotDetailCard.tsx'), 'utf8');
  assert.equal(detailSrc.includes('Todos ({profile.slots.length})'), true);
  assert.equal(detailSrc.includes('Carregar todos os bicos'), true);
  assert.equal(detailSrc.includes('Desvio Médio Entre Setores'), true);
});

test('5. Barra Horizontal 2D: resizeBoomSlotsBySectorCounts e Desvio Médio Entre Setores', () => {
  const boom = buildNewProfile('u1', 'Barra Custom', '2D_HORIZONTAL', 3.0);
  assert.equal(computeBoomSectorDeviationPct(boom.slots, 3), 0);

  boom.slots[0] = { ...boom.slots[0], measuredFlowLMin: 0.99 };
  const resized = resizeBoomSlotsBySectorCounts(3.0, boom.slots, [6, 10, 8]);
  assert.equal(resized.length, 24);
  assert.deepEqual(getBoomSectorCounts(resized, 3), [6, 10, 8]);
  assert.equal(resized[0].measuredFlowLMin, 0.99);
  assert.equal(resized.every((s, idx) => s.slotIndex === idx), true);

  const altNozzle = Array.from(NOZZLES_BY_ID.values()).find((n) => n.id !== boom.slots[0].nozzleId && n.nominalFlowLMin !== boom.slots[0].nominalFlowLMin);
  assert.ok(altNozzle);
  const diffSectors = applyNozzleToSlots(boom, boom.slots.find((s) => s.sectorIndex === 2).slotIndex, altNozzle, 'sector');
  assert.ok(computeBoomSectorDeviationPct(diffSectors, 3) > 0);
});
