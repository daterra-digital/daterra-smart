/**
 * DATERRA Smart - Teste das Correções de Atalhos (4 por campo) e Unidade Auxiliar (mL vs g)
 * Validação dos 4 Exemplos Obrigatórios
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  doseCalculatorConfig,
  calculateDosePure,
  DOSE_UNIT_METADATA
} from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

describe('Correções da Calculadora de Dose: 4 Atalhos por Campo e Unidades Auxiliares Coerentes', () => {
  test('1. Exatamente quatro atalhos declarados por campo', () => {
    const fields = doseCalculatorConfig.fields;
    const volPrep = fields.find((f) => f.id === 'volPrepararDose');
    const doseVal = fields.find((f) => f.id === 'doseValue');
    const volCalda = fields.find((f) => f.id === 'volCalda');

    assert.ok(volPrep && volPrep.presets);
    assert.deepEqual(volPrep.presets, [200, 500, 1000, 1500]);
    assert.equal(volPrep.presets.length, 4);

    assert.ok(doseVal && doseVal.presets);
    assert.deepEqual(doseVal.presets, [1, 2, 3, 5]);
    assert.equal(doseVal.presets.length, 4);

    assert.ok(volCalda && volCalda.presets);
    assert.deepEqual(volCalda.presets, [100, 200, 300, 400]);
    assert.equal(volCalda.presets.length, 4);
  });

  test('2. Metadados explícitos de unidades (ProductMeasure: liquid vs solid)', () => {
    assert.equal(DOSE_UNIT_METADATA['L/ha'].productMeasure, 'liquid');
    assert.equal(DOSE_UNIT_METADATA['L/ha'].majorUnit, 'L');
    assert.equal(DOSE_UNIT_METADATA['L/ha'].minorUnit, 'mL');

    assert.equal(DOSE_UNIT_METADATA['kg/ha'].productMeasure, 'solid');
    assert.equal(DOSE_UNIT_METADATA['kg/ha'].majorUnit, 'kg');
    assert.equal(DOSE_UNIT_METADATA['kg/ha'].minorUnit, 'g');
  });

  test('3. Exemplo 1 Obrigatório — Líquido >= 1 L (1000 L, 2 L/ha, 200 L/ha)', () => {
    const res = calculateDosePure(1000, 2, 'L/ha', 200);

    assert.equal(res.isSolid, false);
    assert.equal(res.primaryValue, 10);
    assert.equal(res.primaryUnit, 'L');
    assert.equal(res.subValue, 10000);
    assert.equal(res.subUnit, 'mL');
    assert.equal(res.area_tratada_ha, 5);

    assert.equal(res.smart.mainText, '10,00 L');
    assert.equal(res.smart.subText, '10000 mL');
    assert.notEqual(res.subUnit, 'g');
  });

  test('4. Exemplo 2 Obrigatório — Sólido >= 1 kg (1000 L, 2 kg/ha, 200 L/ha)', () => {
    const res = calculateDosePure(1000, 2, 'kg/ha', 200);

    assert.equal(res.isSolid, true);
    assert.equal(res.primaryValue, 10);
    assert.equal(res.primaryUnit, 'kg');
    assert.equal(res.subValue, 10000);
    assert.equal(res.subUnit, 'g'); // Não pode ser mL!
    assert.equal(res.area_tratada_ha, 5);

    assert.equal(res.smart.mainText, '10,00 kg');
    assert.equal(res.smart.subText, '10000 g');
    assert.notEqual(res.subUnit, 'mL');
  });

  test('5. Exemplo 3 Obrigatório — Líquido abaixo de 1 L (100 L, 1 L/ha, 200 L/ha)', () => {
    const res = calculateDosePure(100, 1, 'L/ha', 200);

    assert.equal(res.isSolid, false);
    assert.equal(res.primaryValue, 500);
    assert.equal(res.primaryUnit, 'mL');
    assert.equal(res.subValue, 0.5);
    assert.equal(res.subUnit, 'L');
    assert.equal(res.area_tratada_ha, 0.5);

    assert.equal(res.smart.mainText, '500 mL');
    assert.equal(res.smart.subText, '0,50 L');
    assert.notEqual(res.subUnit, 'g');
    assert.notEqual(res.primaryUnit, 'g');
  });

  test('6. Exemplo 4 Obrigatório — Sólido abaixo de 1 kg (100 L, 1 kg/ha, 200 L/ha)', () => {
    const res = calculateDosePure(100, 1, 'kg/ha', 200);

    assert.equal(res.isSolid, true);
    assert.equal(res.primaryValue, 500);
    assert.equal(res.primaryUnit, 'g');
    assert.equal(res.subValue, 0.5);
    assert.equal(res.subUnit, 'kg');
    assert.equal(res.area_tratada_ha, 0.5);

    assert.equal(res.smart.mainText, '500 g');
    assert.equal(res.smart.subText, '0,50 kg');
    assert.notEqual(res.subUnit, 'mL');
    assert.notEqual(res.primaryUnit, 'mL');
  });

  test('7. Integração no cálculo estruturado de doseCalculatorConfig', () => {
    const structuredLiquid = doseCalculatorConfig.calculate({
      volPrepararDose: { rawValue: 1000, unit: 'L', dimension: 'volume', canonicalKey: 'tank_volume', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      doseValue: { rawValue: 2, unit: 'L/ha', dimension: 'application_rate', canonicalKey: 'product_dose_rate', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      volCalda: { rawValue: 200, unit: 'L/ha', dimension: 'application_rate', canonicalKey: 'spray_volume_rate', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' }
    });

    assert.equal(structuredLiquid.quantidade_pf.unit, 'L');
    assert.equal(structuredLiquid.quantidade_pf.subUnit, 'mL');
    assert.equal(structuredLiquid.quantidade_pf.subValue, 10000);

    const structuredSolid = doseCalculatorConfig.calculate({
      volPrepararDose: { rawValue: 1000, unit: 'L', dimension: 'volume', canonicalKey: 'tank_volume', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      doseValue: { rawValue: 2, unit: 'kg/ha', dimension: 'application_rate', canonicalKey: 'product_dose_rate', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      volCalda: { rawValue: 200, unit: 'L/ha', dimension: 'application_rate', canonicalKey: 'spray_volume_rate', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' }
    });

    assert.equal(structuredSolid.quantidade_pf.unit, 'kg');
    assert.equal(structuredSolid.quantidade_pf.subUnit, 'g');
    assert.equal(structuredSolid.quantidade_pf.subValue, 10000);
  });
});
