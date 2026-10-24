/**
 * DATERRA Smart - Testes de QA: Mistura de Calda (Concentração)
 * Validação de Conversões de Hectolitro, Percentagem, Modularidade (<200 linhas) e Persistência First-Offline
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateConcentracaoExtended,
  buildConcentracaoStructuredValues
} from '../src/features/mistura-concentracao/concentracaoDataMapper.ts';

import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';

describe('Calculadora Canónica: Mistura de Calda (Concentração)', () => {

  test('1. Conversão por Hectolitro (1 hL = 100 L) em Planta Jovem (Diluição Direta)', () => {
    // 100 mL/hL em depósito de 400 L => 400 mL (0.40 L)
    const res1 = calculateConcentracaoExtended(100, 'mL/hL', 400, 'jovem');
    assert.equal(res1.isValid, true);
    assert.equal(res1.quantidadePfSmall, 400);
    assert.equal(res1.primaryValue, 400);
    assert.equal(res1.primaryUnit, 'mL');
    assert.equal(res1.subValue, 0.4);
    assert.equal(res1.subUnit, 'L');
    assert.equal(res1.isSolid, false);

    // 200 g/hL em depósito de 500 L => 1000 g (1.00 kg - primary torna-se kg quando >= 1000)
    const res2 = calculateConcentracaoExtended(200, 'g/hL', 500, 'jovem');
    assert.equal(res2.isValid, true);
    assert.equal(res2.quantidadePfSmall, 1000);
    assert.equal(res2.primaryValue, 1.0);
    assert.equal(res2.primaryUnit, 'kg');
    assert.equal(res2.subValue, 1000);
    assert.equal(res2.subUnit, 'g');
    assert.equal(res2.isSolid, true);
  });

  test('2. Conversão de Percentagem Volumétrica e Ponderal (1% = 1000 mL/hL ou 1000 g/hL)', () => {
    // 0.1% em depósito de 500 L => 0.1 * 1000 = 100 mL/hL => (100 * 500) / 100 = 500 mL (0.5 L)
    const resPct = calculateConcentracaoExtended(0.1, '%', 500, 'jovem');
    assert.equal(resPct.isValid, true);
    assert.equal(resPct.quantidadePfSmall, 500);
    assert.equal(resPct.primaryValue, 500);
    assert.equal(resPct.primaryUnit, 'mL');
    assert.equal(resPct.subValue, 0.5);
    assert.equal(resPct.subUnit, 'L');

    // 0.2 kg/hL em depósito de 500 L => 0.2 * 1000 = 200 g/hL => (200 * 500) / 100 = 1000 g (1 kg)
    const resKgHl = calculateConcentracaoExtended(0.2, 'kg/hL', 500, 'jovem');
    assert.equal(resKgHl.isValid, true);
    assert.equal(resKgHl.quantidadePfSmall, 1000);
    assert.equal(resKgHl.primaryValue, 1.0);
    assert.equal(resKgHl.primaryUnit, 'kg');

    // 0.5 L/hL em depósito de 1000 L => 0.5 * 1000 = 500 mL/hL => (500 * 1000) / 100 = 5000 mL (5 L)
    const resLHl = calculateConcentracaoExtended(0.5, 'L/hL', 1000, 'jovem');
    assert.equal(resLHl.isValid, true);
    assert.equal(resLHl.quantidadePfSmall, 5000);
    assert.equal(resLHl.primaryValue, 5.0);
    assert.equal(resLHl.primaryUnit, 'L');
  });

  test('3. Modo Copa Adulta com compensação hidráulica (volRecomendado / volAplicado)', () => {
    // 100 mL/hL, 400 L depósito, Recomendado 1000 L/ha, Aplicado 500 L/ha
    // Q = (400 * 100 * 1000) / (500 * 100) = 800 mL
    const resAdulta = calculateConcentracaoExtended(100, 'mL/hL', 400, 'adulta', 1000, 500);
    assert.equal(resAdulta.isValid, true);
    assert.equal(resAdulta.quantidadePfSmall, 800);
    assert.equal(resAdulta.primaryValue, 800);
    assert.equal(resAdulta.primaryUnit, 'mL');
    assert.equal(resAdulta.subValue, 0.8);
    assert.equal(resAdulta.subUnit, 'L');
  });

  test('4. Resiliência a entradas inválidas (zero, negativos, NaN)', () => {
    const resZeroConc = calculateConcentracaoExtended(0, 'mL/hL', 400, 'jovem');
    assert.equal(resZeroConc.isValid, false);
    assert.equal(resZeroConc.quantidadePfSmall, 0);

    const resZeroVol = calculateConcentracaoExtended(100, 'mL/hL', 0, 'jovem');
    assert.equal(resZeroVol.isValid, false);
    assert.equal(resZeroVol.quantidadePfSmall, 0);

    const resNeg = calculateConcentracaoExtended(-100, 'mL/hL', 400, 'jovem');
    assert.equal(resNeg.isValid, false);

    const resNan = calculateConcentracaoExtended(NaN, 'mL/hL', 400, 'jovem');
    assert.equal(resNan.isValid, false);
  });

  test('5. Estruturação correta de StructuredValues para histórico v2 e Outbox', () => {
    const res = calculateConcentracaoExtended(100, 'mL/hL', 400, 'jovem');
    const { inputs, outputs } = buildConcentracaoStructuredValues(100, 'mL/hL', 400, 'jovem', 1000, 400, res);

    assert.equal(inputs.concValue.canonicalKey, 'concentration');
    assert.equal(inputs.concValue.dimension, 'concentration');
    assert.equal(inputs.concValue.unit, 'mL/hL');
    assert.equal(inputs.concValue.rawValue, 100);

    assert.equal(inputs.volPreparar.canonicalKey, 'tank_volume');
    assert.equal(inputs.volPreparar.dimension, 'volume');
    assert.equal(inputs.volPreparar.unit, 'L');
    assert.equal(inputs.volPreparar.rawValue, 400);

    assert.equal(outputs.quantidadeComercial.canonicalKey, 'product_amount_tank');
    assert.equal(outputs.quantidadeComercial.dimension, 'volume');
    assert.equal(outputs.quantidadeComercial.unit, 'mL');
    assert.equal(outputs.quantidadeComercial.rawValue, 400);
    assert.equal(outputs.quantidadeComercial.source, 'calculated_output');
  });

  test('6. Geração de chave de idempotência UUIDv4 para a Mutation Outbox', () => {
    const k1 = generateIdempotencyKey();
    const k2 = generateIdempotencyKey();
    assert.notEqual(k1, k2);
    assert.match(k1, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('7. Modularidade estrita: nenhum ficheiro do módulo excede 200 linhas de código', () => {
    const files = [
      'src/features/mistura-concentracao/concentracaoDataMapper.ts',
      'src/features/mistura-concentracao/concentracaoStorage.ts',
      'src/features/mistura-concentracao/ConcentracaoHeader.tsx',
      'src/features/mistura-concentracao/ConcentracaoResultCard.tsx',
      'src/features/mistura-concentracao/ConcentracaoInputsPanel.tsx',
      'src/features/mistura-concentracao/ConcentracaoModeSelector.tsx',
      'src/features/mistura-concentracao/ConcentracaoAdultaParams.tsx',
      'src/features/mistura-concentracao/ConcentracaoFooterBar.tsx',
      'src/features/mistura-concentracao/ConcentracaoCaldaCalculator.tsx',
      'src/features/mistura-concentracao/index.ts'
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

  test('8. Rotas canónicas em src/App.tsx devidamente registadas', () => {
    const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appCode.includes('path="/ferramentas/mistura-calda-concentracao"'));
    assert.ok(appCode.includes('path="/tools/mistura-calda-concentracao"'));
    assert.ok(appCode.includes('element={<ConcentracaoCaldaCalculator />}'));
  });

});
