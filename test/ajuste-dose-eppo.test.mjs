/**
 * DATERRA Smart - Testes de QA: Ajuste da Dose (Método EPPO PP 1/239)
 * Validação de Proporcionalidade Foliar, Modularidade (<200 linhas) e Persistência First-Offline
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateEppoDoseAdjusted,
  buildEppoDoseStructuredValues
} from '../src/features/ajuste-dose-eppo/eppoDoseDataMapper.ts';

import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';

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

    const resNan = calculateEppoDoseAdjusted(NaN, 7500, 10000, 1000, 400);
    assert.equal(resNan.isValid, false);
    assert.equal(resNan.doseAjustada, 0);
  });

  test('3. Estruturação correta de StructuredValues para histórico v2 e Outbox', () => {
    const res = calculateEppoDoseAdjusted(2.0, 7500, 10000, 1000, 400);
    const { inputs, outputs } = buildEppoDoseStructuredValues(2.0, 7500, 10000, 'liquid', res);

    assert.equal(inputs.doseRotulo.canonicalKey, 'label_dose');
    assert.equal(inputs.doseRotulo.dimension, 'application_rate');
    assert.equal(inputs.doseRotulo.unit, 'L/ha');
    assert.equal(inputs.doseRotulo.rawValue, 2.0);

    assert.equal(inputs.lwaReal.canonicalKey, 'leaf_wall_area');
    assert.equal(inputs.lwaReal.dimension, 'foliar_wall_area');
    assert.equal(inputs.lwaReal.unit, 'm² LWA/ha');
    assert.equal(inputs.lwaReal.rawValue, 7500);

    assert.equal(outputs.doseAjustada.canonicalKey, 'adjusted_dose');
    assert.equal(outputs.doseAjustada.dimension, 'application_rate');
    assert.equal(outputs.doseAjustada.unit, 'L/ha');
    assert.equal(outputs.doseAjustada.rawValue, 1.5);
    assert.equal(outputs.doseAjustada.source, 'calculated_output');
  });

  test('4. Geração de chave de idempotência UUIDv4 para a Mutation Outbox', () => {
    const k1 = generateIdempotencyKey();
    const k2 = generateIdempotencyKey();
    assert.notEqual(k1, k2);
    assert.match(k1, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('5. Modularidade estrita: nenhum ficheiro do módulo excede 200 linhas de código', () => {
    const files = [
      'src/features/ajuste-dose-eppo/eppoDoseDataMapper.ts',
      'src/features/ajuste-dose-eppo/EppoDoseHeader.tsx',
      'src/features/ajuste-dose-eppo/EppoDoseResultCard.tsx',
      'src/features/ajuste-dose-eppo/EppoDoseInputsPanel.tsx',
      'src/features/ajuste-dose-eppo/EppoDoseSecondaryParams.tsx',
      'src/features/ajuste-dose-eppo/eppoDoseStorage.ts',
      'src/features/ajuste-dose-eppo/EppoDoseFooterBar.tsx',
      'src/features/ajuste-dose-eppo/EppoDoseCalculator.tsx',
      'src/features/ajuste-dose-eppo/index.ts'
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      assert.ok(fs.existsSync(fullPath), `Ficheiro deve existir: ${f}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lineCount = content.split('\n').length;
      assert.ok(
        lineCount <= 200,
        `Ficheiro ${f} tem ${lineCount} linhas, excedendo o limite estrito de 200 linhas!`
      );
    }
  });

  test('6. Rotas canónicas em src/App.tsx devidamente registadas', () => {
    const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appCode.includes('path="/ferramentas/ajuste-dose-eppo"'));
    assert.ok(appCode.includes('path="/tools/ajuste-dose-eppo"'));
    assert.ok(appCode.includes('element={<EppoDoseCalculator />}'));
  });

});
