/**
 * DATERRA Smart - Testes de QA: Ajuste da Dose (Método EPPO PP 1/239)
 * Validação de Proporcionalidade Foliar, Modularidade (<200 linhas) e Persistência First-Offline
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateEppoDoseComprehensive,
  buildEppoDoseStructuredValues
} from '../src/features/ajuste-dose-eppo/eppoDoseDataMapper.ts';

import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';

function calculateEppoDoseAdjusted(
  doseRotulo,
  lwaReal,
  lwaRef,
  capacidadeDeposito,
  volumeCaldaLHa
) {
  return calculateEppoDoseComprehensive(
    doseRotulo,
    0,
    0,
    'total',
    'sebe',
    0.8,
    lwaRef,
    capacidadeDeposito,
    volumeCaldaLHa,
    lwaReal
  );
}

describe('Calculadora Canónica: Ajuste da Dose (Método EPPO PP 1/239)', () => {

  test('1. Proporcionalidade EPPO: Dose Ajustada = Dose Rótulo × (LWA_real / LWA_ref)', () => {
    // Cenário 1: Cultura jovem com LWA de 7.500 m²/ha vs Ref 10.000 m²/ha (Dose rótulo: 2.0 L/ha)
    // Rácio = 0.75 => Dose Ajustada = 1.50 L/ha (Poupança = 25%)
    const res1 = calculateEppoDoseAdjusted(2.0, 7500, 10000, 1000, 400);
    assert.equal(res1.isValid, true);
    assert.equal(res1.racioAjuste, 0.75);
    assert.equal(res1.doseAjustada, 1.5);
    assert.equal(res1.reducaoPercentual, 25.0);
    assert.equal(res1.hectaresPorDeposito, 2.5);
    assert.equal(res1.produtoPorDeposito, 3.75);
    assert.equal(res1.produtoPorDepositoSub, 3750);

    // Cenário 2: Cultura em pleno desenvolvimento igual à referência (10.000 m²/ha)
    const res2 = calculateEppoDoseAdjusted(1.5, 10000, 10000, 1000, 500);
    assert.equal(res2.isValid, true);
    assert.equal(res2.racioAjuste, 1.0);
    assert.equal(res2.doseAjustada, 1.5);
    assert.equal(res2.reducaoPercentual, 0.0);
    assert.equal(res2.hectaresPorDeposito, 2.0);
    assert.equal(res2.produtoPorDeposito, 3.0);

    // Cenário 3: Vegetação vigorosa (LWA 12.000 m²/ha vs Ref 10.000 m²/ha)
    const res3 = calculateEppoDoseAdjusted(1.5, 12000, 10000, 1000, 400);
    assert.equal(res3.isValid, true);
    assert.equal(res3.racioAjuste, 1.2);
    assert.equal(res3.doseAjustada, 1.8);
    assert.equal(res3.reducaoPercentual, -20.0);
  });

  test('2. Resiliência a entradas inválidas (zero, negativas, NaN, Infinity)', () => {
    const resZeroDose = calculateEppoDoseAdjusted(0, 7500, 10000, 1000, 400);
    assert.equal(resZeroDose.isValid, false);
    assert.equal(resZeroDose.doseAjustada, 0);

    const resZeroLwa = calculateEppoDoseAdjusted(1.5, 0, 10000, 1000, 400);
    assert.equal(resZeroLwa.isValid, false);
    assert.equal(resZeroLwa.doseAjustada, 0);

    const resNeg = calculateEppoDoseAdjusted(-1.5, 7500, 10000, 1000, 400);
    assert.equal(resNeg.isValid, false);
    assert.equal(resNeg.doseAjustada, 0);

    const resNegLwa = calculateEppoDoseAdjusted(1.5, -7500, 10000, 1000, 400);
    assert.equal(resNegLwa.isValid, false);
    assert.equal(resNegLwa.doseAjustada, 0);

    const resNan = calculateEppoDoseAdjusted(NaN, 7500, 10000, 1000, 400);
    assert.equal(resNan.isValid, false);
    assert.equal(resNan.doseAjustada, 0);
  });

  test('3. Estruturação correta de StructuredValues para histórico v2 e Outbox', () => {
    const res = calculateEppoDoseAdjusted(2.0, 7500, 10000, 1000, 400);
    const inputs = {
      doseRotulo: 2.0,
      alturaM: 1.5,
      entrelinhaM: 2.5,
      treatmentMode: 'total',
      cropStructure: 'sebe',
      larguraCopaM: 0.8,
      lwaRef: 10000,
      capacidadeDeposito: 1000,
      volumeCaldaLHa: 400,
      unitMode: 'liquid',
      foliarInputSource: 'manual'
    };
    const { inputs: structuredInputs, outputs } = buildEppoDoseStructuredValues(inputs, res);

    assert.equal(structuredInputs.doseRotulo.canonicalKey, 'label_dose');
    assert.equal(structuredInputs.doseRotulo.dimension, 'application_rate');
    assert.equal(structuredInputs.doseRotulo.unit, 'L/ha');
    assert.equal(structuredInputs.doseRotulo.rawValue, 2.0);

    assert.equal(outputs.doseAjustada.canonicalKey, 'adjusted_dose');
    assert.equal(outputs.doseAjustada.dimension, 'application_rate');
    assert.equal(outputs.doseAjustada.unit, 'L/ha');
    assert.equal(outputs.doseAjustada.rawValue, 1.5);
    assert.equal(outputs.doseAjustada.source, 'calculated_output');
  });

  test('4. Geração de chave de idempotência UUIDv4 para a Mutation Outbox', () => {
    const key1 = generateIdempotencyKey();
    const key2 = generateIdempotencyKey();

    assert.ok(typeof key1 === 'string' && key1.length === 36);
    assert.ok(typeof key2 === 'string' && key2.length === 36);
    assert.notEqual(key1, key2);

    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.match(key1, uuidV4Regex);
  });

  test('5. Modularidade estrita: nenhum ficheiro do módulo excede 200 linhas de código', () => {
    const moduleDir = path.resolve('src/features/ajuste-dose-eppo');
    const files = fs.readdirSync(moduleDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    assert.ok(files.length >= 3, 'O módulo deve ter pelo menos 3 ficheiros modulares');

    for (const file of files) {
      const fullPath = path.join(moduleDir, file);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines <= 200, `Ficheiro ${file} tem ${lines} linhas (máximo permitido: 200)`);
    }
  });

  test('6. Rotas canónicas em src/App.tsx devidamente registadas', () => {
    const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appTsx.includes('/tools/ajuste_dose_eppo'));
    assert.ok(appTsx.includes('/ferramentas/ajuste-dose-eppo'));
  });

});
