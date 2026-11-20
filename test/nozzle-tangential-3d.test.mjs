// test/nozzle-tangential-3d.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeBilateralStats,
  generateDefaultSlots,
  isSlotConfigured,
  resizeProfileSlots
} from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import {
  applyNozzleToSlots,
  buildNewProfile
} from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import { NOZZLES_BY_ID } from '../src/features/nozzle-comparison/nozzleComparison.data.ts';

test('1. SvgTangentialFan3d reutiliza SvgBilateralAxisOverlay, viewBox 680x250 e cumpre governança', () => {
  const rel = 'src/features/settings/nozzles/components/svg-schemes/SvgTangentialFan3d.tsx';
  const raw = fs.readFileSync(path.resolve(rel));
  const hasBom = raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf;
  assert.equal(hasBom, false);

  const src = raw.toString('utf8');
  assert.ok(src.split('\n').length <= 200);
  assert.equal(src.includes('dark:'), false);
  assert.equal(src.includes('<select'), false);
  assert.equal(src.includes('SvgBilateralAxisOverlay'), true);
  assert.equal(src.includes('viewBox="0 0 680 250"'), true);
  assert.equal(src.includes('ESQUERDA') && src.includes('DIREITA'), true);
  assert.equal(src.includes('Faixa Alvo ±10%'), true);
});

test('2. 3D_TANGENTIAL suporta perfil vazio, 12 níveis e cálculo bilateral ISO 16122', () => {
  const empty = buildNewProfile('u1', 'Tangencial Vazio', '3D_TANGENTIAL', 10.0, { emptyByDefault: true });
  assert.equal(empty.totalSlotsCount, 12);
  assert.equal(empty.slots.every((s) => !isSlotConfigured(s)), true);
  const emptyStats = computeBilateralStats(empty.slots);
  assert.equal(emptyStats.bilateralDeviationPct, 0);
  assert.equal(emptyStats.isCompliant, true);

  const resized12 = resizeProfileSlots('3D_TANGENTIAL', 10.0, generateDefaultSlots('3D_TANGENTIAL', 10.0, 6), 12, { threeDSectors: 6 });
  assert.equal(resized12.length, 24);
  assert.equal(resized12.filter((s) => s.sectionSide === 'LEFT').length, 12);
  assert.equal(resized12.filter((s) => s.sectionSide === 'RIGHT').length, 12);

  const alt = Array.from(NOZZLES_BY_ID.values()).find((n) => n.id !== resized12[0].nozzleId && n.nominalFlowLMin > resized12[0].nominalFlowLMin * 1.3);
  assert.ok(alt);
  const asym = applyNozzleToSlots({ ...empty, slots: resized12 }, 0, alt, 'side');
  const asymStats = computeBilateralStats(asym);
  assert.equal(asymStats.isCompliant, false);
  assert.ok(asymStats.bilateralDeviationPct >= 10);
});
