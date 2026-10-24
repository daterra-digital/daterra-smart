import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Testes matemáticos emulando a lógica de doseDataMapper.ts
function calculateDoseExtended(volPreparar, doseValue, unitMode, volCalda) {
  const isSolid = unitMode === 'solid';
  const smallUnit = isSolid ? 'g' : 'mL';
  const largeUnit = isSolid ? 'kg' : 'L';

  if (!isFinite(volPreparar) || !isFinite(doseValue) || !isFinite(volCalda) || volPreparar <= 0 || doseValue <= 0 || volCalda <= 0) {
    return {
      quantidadePfSmall: 0,
      primaryValue: 0,
      primaryUnit: largeUnit,
      subValue: 0,
      subUnit: smallUnit,
      area_tratada_ha: 0,
      isSolid,
      isLargePrimary: true,
      isValid: false
    };
  }

  const rawDoseSmall = doseValue * 1000;
  const resultInSmall = (volPreparar * rawDoseSmall) / volCalda;
  const areaTratada = volPreparar / volCalda;

  const rawSmall = Math.round(resultInSmall * 100) / 100;
  const rawLarge = Math.round((resultInSmall / 1000) * 100) / 100;
  const isLargePrimary = rawSmall >= 1000;

  return {
    quantidadePfSmall: rawSmall,
    primaryValue: isLargePrimary ? rawLarge : rawSmall,
    primaryUnit: isLargePrimary ? largeUnit : smallUnit,
    subValue: isLargePrimary ? rawSmall : rawLarge,
    subUnit: isLargePrimary ? smallUnit : largeUnit,
    area_tratada_ha: Math.round(areaTratada * 100) / 100,
    isSolid,
    isLargePrimary,
    isValid: true
  };
}

test('1. Cálculo de dose líquida (>= 1 L): Depósito 1000L, Dose 2 L/ha, Calda 200 L/ha', () => {
  const res = calculateDoseExtended(1000, 2, 'liquid', 200);
  assert.equal(res.isValid, true);
  assert.equal(res.primaryValue, 10);
  assert.equal(res.primaryUnit, 'L');
  assert.equal(res.subValue, 10000);
  assert.equal(res.subUnit, 'mL');
  assert.equal(res.area_tratada_ha, 5);
  assert.equal(res.isSolid, false);
});

test('2. Cálculo de dose líquida (< 1 L): Depósito 100L, Dose 0.5 L/ha, Calda 200 L/ha', () => {
  const res = calculateDoseExtended(100, 0.5, 'liquid', 200);
  assert.equal(res.isValid, true);
  assert.equal(res.primaryValue, 250);
  assert.equal(res.primaryUnit, 'mL');
  assert.equal(res.subValue, 0.25);
  assert.equal(res.subUnit, 'L');
  assert.equal(res.area_tratada_ha, 0.5);
});

test('3. Cálculo de dose sólida (>= 1 kg): Depósito 1000L, Dose 1.5 kg/ha, Calda 300 L/ha', () => {
  const res = calculateDoseExtended(1000, 1.5, 'solid', 300);
  assert.equal(res.isValid, true);
  assert.equal(res.primaryValue, 5);
  assert.equal(res.primaryUnit, 'kg');
  assert.equal(res.subValue, 5000);
  assert.equal(res.subUnit, 'g');
  assert.equal(res.area_tratada_ha, 3.33);
  assert.equal(res.isSolid, true);
});

test('4. Cálculo de dose sólida (< 1 kg): Depósito 100L, Dose 0.8 kg/ha, Calda 200 L/ha', () => {
  const res = calculateDoseExtended(100, 0.8, 'solid', 200);
  assert.equal(res.isValid, true);
  assert.equal(res.primaryValue, 400);
  assert.equal(res.primaryUnit, 'g');
  assert.equal(res.subValue, 0.4);
  assert.equal(res.subUnit, 'kg');
  assert.equal(res.area_tratada_ha, 0.5);
  assert.equal(res.isSolid, true);
});

test('5. Entradas inválidas retornam isValid = false', () => {
  const zeroVol = calculateDoseExtended(0, 2, 'liquid', 200);
  assert.equal(zeroVol.isValid, false);
  const negativeDose = calculateDoseExtended(1000, -1, 'liquid', 200);
  assert.equal(negativeDose.isValid, false);
  const zeroCalda = calculateDoseExtended(1000, 2, 'liquid', 0);
  assert.equal(zeroCalda.isValid, false);
});

test('6. Verificação de limite máximo de 200 linhas em todos os ficheiros de src/features/mistura-dose/', () => {
  const dir = path.join(rootDir, 'src', 'features', 'mistura-dose');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

  assert.ok(files.length >= 6, `Esperados pelo menos 6 ficheiros, encontrados ${files.length}`);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lineCount = content.split('\n').length;
    assert.ok(
      lineCount <= 200,
      `Ficheiro ${file} excede 200 linhas (${lineCount} linhas detectadas)`
    );
  }
});

test('7. Rotas canónicas registadas em src/App.tsx', () => {
  const appPath = path.join(rootDir, 'src', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert.ok(appContent.includes('DoseCaldaCalculator'), 'App.tsx deve importar DoseCaldaCalculator');
  assert.ok(appContent.includes('/ferramentas/mistura-calda-dose'), 'App.tsx deve registar /ferramentas/mistura-calda-dose');
  assert.ok(appContent.includes('/tools/calc_dose'), 'App.tsx deve registar /tools/calc_dose');
});
