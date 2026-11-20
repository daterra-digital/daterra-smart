// test/nozzle-crossflow-3d.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildNewProfile } from '../src/features/settings/nozzles/services/nozzleProfileActions.ts';
import { buildSlotsForTypology } from '../src/features/settings/nozzles/services/nozzleSlotFactory.ts';
import { buildNozzleAiContextSummary } from '../src/features/settings/nozzles/services/nozzleAiContextService.ts';

const readNozzleFile = (relPath) =>
  fs.readFileSync(path.join(process.cwd(), 'src/features/settings/nozzles', relPath), 'utf8');

test('3D_CROSSFLOW cria perfil por defeito com 12 bicos simétricos, 2 setores e airAssisted=true', () => {
  const prof = buildNewProfile('user-1', 'Fluxo Cruzado Teste', '3D_CROSSFLOW', 10);
  assert.equal(prof.equipmentType, '3D_CROSSFLOW');
  assert.equal(prof.airAssisted, true);
  assert.equal(prof.threeDSectors, 2);
  assert.equal(prof.slots.length, 12);
  assert.equal(prof.slots.filter((s) => s.sectionSide === 'LEFT').length, 6);
  assert.equal(prof.slots.filter((s) => s.sectionSide === 'RIGHT').length, 6);
});

test('3D_CROSSFLOW suporta 1 a 12 níveis por flanco (24 bicos no máximo)', () => {
  const slots12 = buildSlotsForTypology('3D_CROSSFLOW', 10, {
    count: 12,
    threeDSectors: 6,
    emptyByDefault: true
  });
  assert.equal(slots12.length, 24);
  const left = slots12.filter((s) => s.sectionSide === 'LEFT');
  const right = slots12.filter((s) => s.sectionSide === 'RIGHT');
  assert.equal(left.length, 12);
  assert.equal(right.length, 12);
  assert.equal(left[11].levelIndex, 12);
  assert.equal(right[11].levelIndex, 12);
});

test('buildNozzleAiContextSummary respeita retrocompatibilidade airAssisted undefined -> Ativo em 3D_CROSSFLOW', () => {
  const prof = buildNewProfile('user-1', 'Fluxo Cruzado Legado', '3D_CROSSFLOW', 10);
  const legacyProf = { ...prof, airAssisted: undefined };
  assert.match(buildNozzleAiContextSummary(legacyProf), /Ventilador: Ativo/);

  const noAirProf = { ...prof, airAssisted: false };
  assert.match(buildNozzleAiContextSummary(noAirProf), /Ventilador: Desativado/);
});

test('SvgCrossflowTower3d usa gráfico bilateral calibrado 680x250, corredor central limpo e legenda unificada', () => {
  const src = readNozzleFile('components/svg-schemes/SvgCrossflowTower3d.tsx');
  assert.match(src, /viewBox="0 0 680 250"/);
  assert.match(src, /SvgBilateralAxisOverlay/);
  assert.match(src, /computeBilateralAxisScale/);
  assert.match(src, /BILATERAL_AXIS_GEOMETRY/);
  assert.match(src, /airAssisted = true/);
  assert.match(src, /flankSlots\.length > 9 \? 7\.5 : 9\.5/);
  assert.match(src, /<polygon/);
  assert.match(src, /SvgUniformFanSymbol/);
  assert.match(src, /Faixa Alvo ±10%/);
  assert.match(src, /Conforme \(≤ 10%\)/);
});

test('Paridade de assistência de ar para 3D_CROSSFLOW nos controlos e modal', () => {
  const card = readNozzleFile('components/BentoGeometricSchemeCard.tsx');
  const bar = readNozzleFile('components/BentoHydraulicControlsBar.tsx');
  const modal = readNozzleFile('components/NozzleMetadataModal.tsx');

  assert.match(card, /<SvgCrossflowTower3d[\s\S]*airAssisted=\{profile\.airAssisted !== false\}/);
  assert.match(bar, /'3D_CROSSFLOW'/);
  assert.match(modal, /supportsAir = equipmentType === '3D_AXIAL' \|\| equipmentType === '3D_CROSSFLOW'/);
});
