// test/nozzle-cannon-3d.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { applyNozzleToSlots, buildNewProfile } from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import { getDefaultNozzle, resizeProfileSlots } from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import { formatSlotPositionHeading } from '../src/features/settings/nozzles/services/nozzleSlotFactory.ts';
import { buildMeasuredFlowKeypadTitle } from '../src/features/settings/nozzles/services/nozzleBoom2dHelpers.ts';
import {
  computeCannonDeviation,
  getCannonSlotBadge,
  resolveCannonGroupFilterFallback
} from '../src/features/settings/nozzles/services/nozzleCannonHelpers.ts';

const readNozzleFile = (relPath) =>
  fs.readFileSync(path.join(process.cwd(), 'src/features/settings/nozzles', relPath), 'utf8');

test('3D_CANNON cria perfil vazio por defeito com 6 Boca Principal + 2 Defletor Inferior (0/8 bicos)', () => {
  const prof = buildNewProfile('u1', 'Canhão 3D Novo', '3D_CANNON', 12, { emptyByDefault: true });
  assert.equal(prof.equipmentType, '3D_CANNON');
  assert.equal(prof.cannonDeflectorCount, 2);
  assert.equal(prof.slots.filter((s) => s.sectionSide === 'CANNON_MAIN').length, 6);
  assert.equal(prof.slots.filter((s) => s.sectionSide === 'CANNON_DEFLECTOR').length, 2);
  assert.equal(prof.slots.length, 8);
  assert.equal(prof.activeSlotsCount, 0);
  assert.equal(prof.totalActiveFlowLMin, 0);
});

test('3D_CANNON preserva bicos ao redimensionar grupos e aplica fallback quando defletor passa a 0', () => {
  let prof = buildNewProfile('u1', 'Canhão 3D', '3D_CANNON', 12, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  prof = { ...prof, slots: applyNozzleToSlots(prof, 0, nozzle, 'group') };

  const resized = resizeProfileSlots('3D_CANNON', 12, prof.slots, 8, { secondaryCount: 0 });
  assert.equal(resized.length, 8);
  assert.equal(resized.filter((s) => s.sectionSide === 'CANNON_DEFLECTOR').length, 0);
  assert.equal(resized[0].nozzleId, nozzle.id);
  assert.equal(resolveCannonGroupFilterFallback('DEFLECTOR', 0), 'MAIN');
  assert.equal(resolveCannonGroupFilterFallback('ALL', 0), 'ALL');
});

test('Badges N1..Nx / D1..Dx, títulos contextuais e cálculo efetivo de Desvio Médio (ISO 16122)', () => {
  const prof = buildNewProfile('u1', 'Canhão 3D', '3D_CANNON', 10, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  const uniform = applyNozzleToSlots(prof, 0, nozzle, 'all');
  const devUniform = computeCannonDeviation(uniform);
  assert.equal(devUniform.avgDeviationPct, 0);
  assert.equal(devUniform.isCompliant, true);

  const imbalanced = uniform.map((s) =>
    s.sectionSide === 'CANNON_DEFLECTOR' ? { ...s, measuredFlowLMin: s.flowAtPressureLMin * 1.4 } : s
  );
  const devImbalanced = computeCannonDeviation(imbalanced);
  assert.ok(devImbalanced.avgDeviationPct > 0);
  assert.equal(devImbalanced.isCompliant, false);

  const main1 = uniform.find((s) => s.sectionSide === 'CANNON_MAIN');
  const defl1 = uniform.find((s) => s.sectionSide === 'CANNON_DEFLECTOR');
  assert.equal(getCannonSlotBadge(main1), 'N1');
  assert.equal(getCannonSlotBadge(defl1), 'D1');
  assert.equal(formatSlotPositionHeading(main1, '3D_CANNON'), 'Boca Principal | N1');
  assert.equal(formatSlotPositionHeading(defl1, '3D_CANNON'), 'Defletor Inferior | D1');
  assert.match(buildMeasuredFlowKeypadTitle(main1, '3D_CANNON'), /^Débito Real · Boca Principal N1 · /);
});

test('Contratos SVG, filtros, ações sem espelhar e drawers para 3D_CANNON', () => {
  const svg = readNozzleFile('components/svg-schemes/SvgCannon3d.tsx');
  const overlay = readNozzleFile('components/svg-schemes/SvgCannonChartOverlay.tsx');
  const filterBar = readNozzleFile('components/CannonGroupFilterBar.tsx');
  const fields = readNozzleFile('components/NozzleCannonFields.tsx');
  const card = readNozzleFile('components/BentoGeometricSchemeCard.tsx');
  const drawer = readNozzleFile('components/NozzleEditorDrawer.tsx');

  assert.match(svg, /viewBox="0 0 680 265"/);
  assert.match(svg, /BOCA PRINCIPAL/);
  assert.match(svg, /DEFLETOR INFERIOR/);
  assert.match(svg, /orderedSlots\.length > 10/);
  assert.match(overlay, /Débito por Bico \(L\/min\)/);
  assert.match(filterBar, /Boca Principal/);
  assert.match(filterBar, /Defletor Inferior/);
  assert.match(filterBar, /Desvio Canhão:/);
  assert.match(fields, /Total do Canhão:/);
  assert.doesNotMatch(card, /SYMMETRIC_3D_TYPES = new Set\(\[[^\]]*3D_CANNON/);
  assert.match(drawer, /Aplicar a \{cannonGroupLbl\}/);
});
