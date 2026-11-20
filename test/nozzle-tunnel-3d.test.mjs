// test/nozzle-tunnel-3d.test.mjs
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
  computeBilateralStats,
  getDefaultNozzle,
  resizeProfileSlots
} from '../src/features/settings/nozzles/services/nozzleProfileMath.ts';
import { formatSlotPositionHeading } from '../src/features/settings/nozzles/services/nozzleSlotFactory.ts';
import { buildMeasuredFlowKeypadTitle } from '../src/features/settings/nozzles/services/nozzleBoom2dHelpers.ts';
import {
  buildTunnelRampGroups,
  computeTunnelCurtainTotals,
  computeTunnelRampDeviation,
  resolveTunnelRampFilterFallback
} from '../src/features/settings/nozzles/services/nozzleTunnelHelpers.ts';
import { buildNozzleAiContextSummary } from '../src/features/settings/nozzles/services/nozzleAiContextService.ts';

const readNozzleFile = (relPath) =>
  fs.readFileSync(path.join(process.cwd(), 'src/features/settings/nozzles', relPath), 'utf8');

test('3D_TUNNEL cria perfil vazio por defeito com 6 níveis x 4 rampas (24 bicos), BOTH e airAssisted=true', () => {
  const prof = buildNewProfile('u1', 'Túnel 3D Novo', '3D_TUNNEL', 10, { emptyByDefault: true });
  assert.equal(prof.equipmentType, '3D_TUNNEL');
  assert.equal(prof.tunnelOrientation, 'BOTH');
  assert.equal(prof.threeDSectors, 2);
  assert.equal(prof.airAssisted, true);
  assert.equal(prof.slots.length, 24);
  assert.equal(prof.activeSlotsCount, 0);
  assert.equal(prof.totalActiveFlowLMin, 0);
});

test('3D_TUNNEL preserva bicos ao alterar níveis/orientação e filtra grupos de rampa ativos', () => {
  let prof = buildNewProfile('u1', 'Túnel 3D', '3D_TUNNEL', 10, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  prof = { ...prof, slots: applyNozzleToSlots(prof, 6, nozzle, 'slot') }; // LEFT_INNER N1

  const innerSlots = resizeProfileSlots('3D_TUNNEL', 10, prof.slots, 6, { tunnelOrientation: 'INNER', threeDSectors: 4 });
  assert.equal(innerSlots.length, 12);
  assert.equal(innerSlots.find((s) => s.sectionSide === 'LEFT_INNER' && s.levelIndex === 1)?.nozzleId, nozzle.id);
  assert.deepEqual(buildTunnelRampGroups(innerSlots, 'INNER').map((g) => g.id), ['LEFT_INNER', 'RIGHT_INNER']);
});

test('Designação completa da rampa no Drawer, Keypad, BilateralStats e Espelhamento transversal', () => {
  let prof = buildNewProfile('u1', 'Túnel 3D', '3D_TUNNEL', 10, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  let slots = applyNozzleToSlots(prof, 0, nozzle, 'slot'); // LEFT_OUTER N1
  slots = slots.map((s) => (s.sectionSide === 'RIGHT_OUTER' && s.levelIndex === 1 ? { ...s, measuredFlowLMin: 1.99 } : s));
  slots = mirrorSlotsLeftToRight(slots);

  const leftOuter1 = slots.find((s) => s.sectionSide === 'LEFT_OUTER' && s.levelIndex === 1);
  const rightOuter1 = slots.find((s) => s.sectionSide === 'RIGHT_OUTER' && s.levelIndex === 1);
  assert.equal(rightOuter1?.nozzleId, nozzle.id);
  assert.equal(rightOuter1?.measuredFlowLMin, 1.99);
  assert.equal(formatSlotPositionHeading(leftOuter1, '3D_TUNNEL'), 'Esquerda Exterior | N1');
  assert.match(buildMeasuredFlowKeypadTitle(leftOuter1, '3D_TUNNEL'), /^Débito Real · Esq\. Ext\. N1 · /);

  const bilateral = computeBilateralStats(slots);
  assert.ok(bilateral.leftFlow > 0 && bilateral.rightFlow > 0);
});

test('Retrocompatibilidade airAssisted=undefined e contratos SVG/UI do Túnel 3D', () => {
  const prof = buildNewProfile('u1', 'Túnel Legado', '3D_TUNNEL', 10);
  assert.match(buildNozzleAiContextSummary({ ...prof, airAssisted: undefined }), /Ventilador: Ativo/);

  const svg = readNozzleFile('components/svg-schemes/SvgTunnel3d.tsx');
  const overlay = readNozzleFile('components/svg-schemes/SvgTunnelPortalOverlay.tsx');
  const card = readNozzleFile('components/BentoGeometricSchemeCard.tsx');
  const detail = readNozzleFile('components/BentoSlotDetailCard.tsx');
  const filterBar = readNozzleFile('components/TunnelRampFilterBar.tsx');

  assert.match(svg, /viewBox="0 0 680 265"/);
  assert.match(svg, /Faixa Alvo ±10%/);
  assert.match(svg, /r=\{3\.5\}/);
  assert.match(svg, /onSelectRampFilter\(rampSide\)/);
  assert.match(svg, /Exterior \(sólida\)/);
  assert.match(overlay, /Débito por Bico \(L\/min\)/);
  assert.match(overlay, /Ext: \{fmt\(curtainTotals\.leftOuter\)\}/);
  assert.match(card, /<SvgTunnel3d[\s\S]*airAssisted=\{profile\.airAssisted !== false\}/);
  assert.match(detail, /Desvio Médio Entre Rampas \(ISO 16122\)/);
  assert.match(filterBar, /Todos \(\{totalSlots\}\)/);
  assert.match(filterBar, /Desvio Rampas:/);
});

test('Desvio médio entre rampas, somatórios por cortina e fallback de filtro ao mudar orientação', () => {
  let prof = buildNewProfile('u1', 'Túnel 3D', '3D_TUNNEL', 10, { emptyByDefault: true });
  const nozzle = getDefaultNozzle();
  const uniformSlots = applyNozzleToSlots(prof, 0, nozzle, 'all');
  const uniformDev = computeTunnelRampDeviation(uniformSlots, 'BOTH');
  assert.equal(uniformDev.avgDeviationPct, 0);
  assert.equal(uniformDev.isCompliant, true);

  const imbalancedSlots = uniformSlots.map((s) =>
    s.sectionSide === 'LEFT_OUTER' ? { ...s, measuredFlowLMin: s.flowAtPressureLMin * 1.4 } : s
  );
  const imbalancedDev = computeTunnelRampDeviation(imbalancedSlots, 'BOTH');
  assert.ok(imbalancedDev.avgDeviationPct > 0);
  assert.equal(imbalancedDev.isCompliant, false);

  const totals = computeTunnelCurtainTotals(imbalancedSlots);
  assert.ok(totals.leftOuter > totals.leftInner);
  assert.equal(resolveTunnelRampFilterFallback('LEFT_OUTER', 'INNER'), 'LEFT_INNER');
  assert.equal(resolveTunnelRampFilterFallback('ALL', 'INNER'), 'ALL');
});
