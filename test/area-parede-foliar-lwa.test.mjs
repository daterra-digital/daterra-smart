/**
 * DATERRA Smart - Testes de QA: Área de Parede Foliar (LWA)
 * Validação Matemática EPPO PP 1/239, Modularidade (<200 linhas) e Persistência First-Offline
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateLwaExtended,
  buildLwaStructuredValues
} from '../src/features/area-parede-foliar/lwaDataMapper.ts';

import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';

describe('Calculadora Canónica: Área de Parede Foliar (LWA) - EPPO PP 1/239', () => {

  test('1. Fórmula EPPO PP 1/239: LWA = (2 × h × 10.000) / r com casos canónicos', () => {
    // Caso 1: h = 2.5m, r = 3.0m => (2 * 2.5 * 10000) / 3 = 50000 / 3 = 16666.666... => 16.667 m² LWA/ha
    const res1 = calculateLwaExtended(2.5, 3.0);
    assert.equal(res1.isValid, true);
    assert.equal(res1.area_parede_foliar, 16667);
    assert.equal(res1.caldaReferenciaLHa, Math.round(16667 * 0.03)); // 500 L/ha

    // Caso 2: h = 3.5m, r = 4.0m => (2 * 3.5 * 10000) / 4 = 70000 / 4 = 17.500 m² LWA/ha
    const res2 = calculateLwaExtended(3.5, 4.0);
    assert.equal(res2.isValid, true);
    assert.equal(res2.area_parede_foliar, 17500);
    assert.equal(res2.caldaReferenciaLHa, Math.round(17500 * 0.03)); // 525 L/ha

    // Caso 3: h = 1.8m, r = 2.2m => (2 * 1.8 * 10000) / 2.2 = 36000 / 2.2 = 16363.636... => 16.364 m² LWA/ha
    const res3 = calculateLwaExtended(1.8, 2.2);
    assert.equal(res3.isValid, true);
    assert.equal(res3.area_parede_foliar, 16364);
  });

  test('2. Proteção contra entradas nulas, negativas, NaN e zero', () => {
    const resZeroH = calculateLwaExtended(0, 3.0);
    assert.equal(resZeroH.isValid, false);
    assert.equal(resZeroH.area_parede_foliar, 0);

    const resZeroR = calculateLwaExtended(2.5, 0);
    assert.equal(resZeroR.isValid, false);
    assert.equal(resZeroR.area_parede_foliar, 0);

    const resNeg = calculateLwaExtended(-2.5, 3.0);
    assert.equal(resNeg.isValid, false);
    assert.equal(resNeg.area_parede_foliar, 0);

    const resNan = calculateLwaExtended(NaN, 3.0);
    assert.equal(resNan.isValid, false);
    assert.equal(resNan.area_parede_foliar, 0);
  });

  test('3. Calda proporcional de referência e faixas operacionais EPPO', () => {
    const res = calculateLwaExtended(2.5, 3.0);
    assert.equal(res.isValid, true);
    assert.equal(res.caldaReferenciaLHa, 500); // 16667 * 0.03 = 500 L/ha
    assert.equal(res.caldaMinLHa, 417);        // 16667 * 0.025 = 416.675 => 417 L/ha
    assert.equal(res.caldaMaxLHa, 667);        // 16667 * 0.040 = 666.68 => 667 L/ha
  });

  test('4. Estrutura canónica de StructuredValues (inputs e outputs)', () => {
    const { inputs, outputs } = buildLwaStructuredValues(2.5, 3.0, 16667);
    
    assert.equal(inputs.alturaVegetacao.canonicalKey, 'canopy_height');
    assert.equal(inputs.alturaVegetacao.dimension, 'length');
    assert.equal(inputs.alturaVegetacao.unit, 'm');
    assert.equal(inputs.alturaVegetacao.rawValue, 2.5);

    assert.equal(inputs.distanciaEntrelinhas.canonicalKey, 'row_spacing');
    assert.equal(inputs.distanciaEntrelinhas.dimension, 'length');
    assert.equal(inputs.distanciaEntrelinhas.unit, 'm');
    assert.equal(inputs.distanciaEntrelinhas.rawValue, 3.0);

    assert.equal(outputs.areaParedeFoliar.canonicalKey, 'leaf_wall_area');
    assert.equal(outputs.areaParedeFoliar.dimension, 'foliar_wall_area');
    assert.equal(outputs.areaParedeFoliar.unit, 'm² LWA/ha');
    assert.equal(outputs.areaParedeFoliar.rawValue, 16667);
    assert.equal(outputs.areaParedeFoliar.source, 'calculated_output');
  });

  test('5. Idempotência e integridade da Mutation Outbox', () => {
    const idKey1 = generateIdempotencyKey();
    const idKey2 = generateIdempotencyKey();
    assert.notEqual(idKey1, idKey2);
    assert.match(idKey1, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('6. Modularidade estrita: nenhum ficheiro excede 200 linhas de código', () => {
    const files = [
      'src/features/area-parede-foliar/lwaDataMapper.ts',
      'src/features/area-parede-foliar/LwaHeader.tsx',
      'src/features/area-parede-foliar/LwaResultCard.tsx',
      'src/features/area-parede-foliar/LwaInputsPanel.tsx',
      'src/features/area-parede-foliar/LwaFooterBar.tsx',
      'src/features/area-parede-foliar/AreaParedeFoliarCalculator.tsx',
      'src/features/area-parede-foliar/index.ts'
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

  test('7. Rotas canónicas em src/App.tsx devidamente registadas', () => {
    const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appCode.includes('path="/ferramentas/area-parede-foliar"'));
    assert.ok(appCode.includes('path="/tools/area-parede-foliar-lwa"'));
  });

});
