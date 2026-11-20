// test/nozzle-pneumatic-3d.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  applyNozzleToSlots,
  buildNewProfile,
  mirrorSlotsLeftToRight
} from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import {
  getDefaultNozzle,
  resizeProfileSlots
} from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import { formatSlotPositionHeading } from '../src/features/settings/nozzles/services/nozzleSlotFactory.ts';
import { buildMeasuredFlowKeypadTitle } from '../src/features/settings/nozzles/services/nozzleBoom2dHelpers.ts';
import {
  computePneumaticArmDeviation,
  computePneumaticFlankTotals,
  getPneumaticCompactArmLabel,
  getPneumaticFullArmTitle,
  resolvePneumaticArmFilterFallback
} from '../src/features/settings/nozzles/services/nozzlePneumaticHelpers.ts';

const readNozzleFile = (relPath) =>
  fs.readFileSync(path.join(process.cwd(), 'src/features/settings/nozzles', relPath), 'utf8');

test('3D_PNEUMATIC cria perfil vazio por defeito com 6 braços x 2 bicos (12 posições)', () => {
  const prof = buildNewProfile('u1', 'Pneumático 3D Novo', '3D_PNEUMATIC', 2.5, { emptyByDefault: true });
  assert.equal(prof.equipmentType, '3D_PNEUMATIC');
  assert.equal(prof.pneumaticArms, 6);
  assert.equal(prof.pneumaticNozzlesPerArm, 2);
  assert.equal(prof.slots.length, 12);
  assert.equal(prof.activeSlotsCount, 0);
  assert.equal(prof.totalActiveFlowLMin, 0);
});

test('3D_PNEUMATIC preserva bicos ao redimensionar braços/extensões e aplica fallback de filtro', () => {
  let prof = buildNewProfile('u1', 'Pneumático 3D', '3D_PNEUMATIC', 3, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  prof = { ...prof, slots: applyNozzleToSlots(prof, 0, nozzle, 'arm') };

  const resized8x4 = resizeProfileSlots('3D_PNEUMATIC', 3, prof.slots, 8, { secondaryCount: 4 });
  assert.equal(resized8x4.length, 32);
  assert.equal(resized8x4.find((s) => s.sectionSide === 'LEFT' && s.armIndex === 1 && s.levelIndex === 1)?.nozzleId, nozzle.id);
  assert.equal(resolvePneumaticArmFilterFallback('LEFT_3', 4), 'LEFT_1');
  assert.equal(resolvePneumaticArmFilterFallback('ALL', 4), 'ALL');
});

test('Desvio médio entre braços, totais por flanco, títulos contextuais e espelhamento preservando débito real', () => {
  const prof = buildNewProfile('u1', 'Pneumático 3D', '3D_PNEUMATIC', 3, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  const uniform = applyNozzleToSlots(prof, 0, nozzle, 'all');
  const devUniform = computePneumaticArmDeviation(uniform, 6);
  assert.equal(devUniform.avgDeviationPct, 0);
  assert.equal(devUniform.isCompliant, true);

  const imbalanced = uniform.map((s) =>
    s.sectionSide === 'LEFT' && s.armIndex === 1 ? { ...s, measuredFlowLMin: s.flowAtPressureLMin * 1.35 } : s
  );
  const devImbalanced = computePneumaticArmDeviation(imbalanced, 6);
  assert.ok(devImbalanced.avgDeviationPct > 0);
  assert.equal(devImbalanced.isCompliant, false);
  const totals = computePneumaticFlankTotals(imbalanced);
  assert.ok(totals.leftTotal > totals.rightTotal);

  let asym = applyNozzleToSlots(prof, 0, nozzle, 'slot').map((s) =>
    s.sectionSide === 'RIGHT' && s.armIndex === 1 && s.levelIndex === 1 ? { ...s, measuredFlowLMin: 1.77 } : s
  );
  asym = mirrorSlotsLeftToRight(asym);
  const r1 = asym.find((s) => s.sectionSide === 'RIGHT' && s.armIndex === 1 && s.levelIndex === 1);
  assert.equal(r1?.nozzleId, nozzle.id);
  assert.equal(r1?.measuredFlowLMin, 1.77);

  const l1 = asym.find((s) => s.sectionSide === 'LEFT' && s.armIndex === 1 && s.levelIndex === 1);
  assert.equal(formatSlotPositionHeading(l1, '3D_PNEUMATIC'), 'Braço Esq. 1 | Ponto 1 (N1)');
  assert.match(buildMeasuredFlowKeypadTitle(l1, '3D_PNEUMATIC'), /^Débito Real · Braço Esq\. 1 · N1 · /);
});

test('Contratos SVG, filtros compactos e drawers para 3D_PNEUMATIC', () => {
  const svg = readNozzleFile('components/svg-schemes/SvgPneumatic3d.tsx');
  const overlay = readNozzleFile('components/svg-schemes/SvgPneumaticCollectorOverlay.tsx');
  const bar = readNozzleFile('components/PneumaticArmFilterBar.tsx');
  const fields = readNozzleFile('components/NozzlePneumaticFields.tsx');
  const detail = readNozzleFile('components/BentoSlotDetailCard.tsx');
  const drawer = readNozzleFile('components/NozzleEditorDrawer.tsx');

  assert.match(svg, /viewBox="0 0 680 265"/);
  assert.match(svg, /totalFlankCount > 10/);
  assert.match(svg, /onSelectArmFilter\?\.\(`\$\{side\}_\$\{armNum\}`\)/);
  assert.match(svg, /E\$\{armNum\}[\s\S]*D\$\{armNum\}/);
  assert.doesNotMatch(overlay, /<path\b/);
  assert.match(overlay, /SvgUniformFanSymbol cx=\{cx\} cy=\{118\} radius=\{15\}/);
  assert.match(overlay, /Total Esq\.:/);
  assert.match(overlay, /Débito por Bico \(L\/min\)/);
  assert.match(bar, /getPneumaticCompactArmLabel/);
  assert.match(bar, /h-4 w-px bg-slate-200/);
  assert.match(bar, /Todos \(\{totalSlots\}\)/);
  assert.match(bar, /Desvio Braços:/);
  assert.equal(getPneumaticCompactArmLabel('LEFT', 1), 'Esq. 1');
  assert.equal(getPneumaticCompactArmLabel('RIGHT', 3), 'Dir. 3');
  assert.equal(getPneumaticFullArmTitle('LEFT', 1, 2), 'Braço Esquerdo 1 (2 bicos)');
  assert.match(fields, /N\.º de Braços Pneumáticos/);
  assert.match(fields, /Bicos por Braço \/ Extensão/);
  assert.match(detail, /Desvio Médio Entre Braços \(ISO 16122\)/);
  assert.match(drawer, /Aplicar a todo o \{armLbl\}/);
});
