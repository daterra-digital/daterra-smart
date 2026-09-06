/**
 * DATERRA Smart - Testes de Validação Dirigida do P1: Modos Dinâmicos no DaterraUnifiedKeypadModal
 * Calculadora de Concentração da Calda (Planta Jovem vs Planta Adulta)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { concentracaoCalculatorConfig, calculateConcentrationPure } from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';

describe('Validação Dirigida do P1: Modos Dinâmicos no DaterraUnifiedKeypad', () => {

  test('1. Definição declarativa contém exatamente os dois modos e os respetivos fieldIds', () => {
    const modes = concentracaoCalculatorConfig.modes;
    assert.ok(Array.isArray(modes), 'Modos devem ser um array');
    assert.strictEqual(modes.length, 2, 'Devem existir exatamente 2 modos');

    const jovemMode = modes.find(m => m.id === 'jovem');
    assert.ok(jovemMode, 'Modo jovem deve existir');
    assert.strictEqual(jovemMode.fieldIds.length, 2, 'Modo jovem deve ter exatamente 2 campos');
    assert.ok(jovemMode.fieldIds.includes('volPrepararConc') && jovemMode.fieldIds.includes('concValue'), 'Modo jovem deve conter volPrepararConc e concValue');

    const adultaMode = modes.find(m => m.id === 'adulta');
    assert.ok(adultaMode, 'Modo adulta deve existir');
    assert.strictEqual(adultaMode.fieldIds.length, 4, 'Modo adulta deve ter exatamente 4 campos');
    assert.ok(adultaMode.fieldIds.includes('volPrepararConc') && adultaMode.fieldIds.includes('concValue') && adultaMode.fieldIds.includes('volRecomendado') && adultaMode.fieldIds.includes('volAplicado'), 'Modo adulta deve conter os 4 campos');
  });

  test('2. Cenário Jovem -> Adulta: Cálculo Matemático Puro e Transição de Variáveis', () => {
    // 2.1. Modo Jovem: 400 L, 100 mL/hL => 400 mL (ou 0.40 L)
    const resJovem = calculateConcentrationPure(100, 'mL/hL', 400, 0, 0, 'jovem');
    assert.strictEqual(resJovem.quantidade_pf_small, 400, 'Quantidade em jovem deve ser 400 mL');
    assert.strictEqual(resJovem.primaryValue, 400, 'Valor primário deve ser 400');
    assert.strictEqual(resJovem.primaryUnit, 'mL', 'Unidade primária deve ser mL');
    assert.strictEqual(resJovem.subValue, 0.4, 'Valor secundário de equivalência deve ser 0.4 L');
    assert.strictEqual(resJovem.subUnit, 'L', 'Unidade secundária deve ser L');

    // 2.2. Modo Adulta com campos incompletos (volRecomendado = 0 ou volAplicado = 0) => 0 / inválido
    const resAdultaIncompleto = calculateConcentrationPure(100, 'mL/hL', 400, 0, 0, 'adulta');
    assert.strictEqual(resAdultaIncompleto.quantidade_pf_small, 0, 'Adulta incompleto não deve produzir valor válido');

    // 2.3. Modo Adulta completo: 400 L, 100 mL/hL, volRec=1000 L/ha, volAplic=500 L/ha => 800 mL (ou 0.80 L)
    // Qt = (400 * 100 * 1000) / (500 * 100) = 40.000.000 / 50.000 = 800 mL
    const resAdultaCompleto = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 500, 'adulta');
    assert.strictEqual(resAdultaCompleto.quantidade_pf_small, 800, 'Quantidade em adulta deve ser 800 mL');
    assert.strictEqual(resAdultaCompleto.primaryValue, 800, 'Valor primário deve ser 800');
    assert.strictEqual(resAdultaCompleto.primaryUnit, 'mL', 'Unidade primária deve ser mL');
    assert.strictEqual(resAdultaCompleto.subValue, 0.8, 'Valor secundário de equivalência deve ser 0.8 L');
    assert.strictEqual(resAdultaCompleto.subUnit, 'L', 'Unidade secundária deve ser L');
  });

  test('3. Cenário Adulta -> Jovem e Reversibilidade de Valores Preservados em Memória', () => {
    const tempFields = [
      { id: 'volPrepararConc', value: 400, unit: 'L', required: true },
      { id: 'concValue', value: 100, unit: 'mL/hL', required: true },
      { id: 'volRecomendado', value: 1000, unit: 'L/ha', required: true },
      { id: 'volAplicado', value: 500, unit: 'L/ha', required: true }
    ];

    const modes = concentracaoCalculatorConfig.modes;
    const jovemDef = modes.find(m => m.id === 'jovem');
    const adultaDef = modes.find(m => m.id === 'adulta');

    // Ao mudar para Jovem: visibleFields filtra por jovemDef.fieldIds
    const visibleJovem = tempFields.filter(f => jovemDef.fieldIds.includes(f.id));
    assert.strictEqual(visibleJovem.length, 2, 'Visíveis em jovem devem ser 2');
    assert.ok(visibleJovem.some(f => f.id === 'volPrepararConc') && visibleJovem.some(f => f.id === 'concValue'));

    // Cálculo em modo Jovem ignora volRecomendado e volAplicado
    const valJovem = calculateConcentrationPure(
      tempFields.find(f => f.id === 'concValue').value,
      tempFields.find(f => f.id === 'concValue').unit,
      tempFields.find(f => f.id === 'volPrepararConc').value,
      0,
      0,
      'jovem'
    );
    assert.strictEqual(valJovem.quantidade_pf_small, 400, 'Resultado em jovem deve ser 400 mL');

    // Ao voltar para Adulta: visibleFields recupera todos os 4 campos com os valores intactos
    const visibleAdulta = tempFields.filter(f => adultaDef.fieldIds.includes(f.id));
    assert.strictEqual(visibleAdulta.length, 4, 'Visíveis em adulta devem voltar a ser 4');
    assert.strictEqual(visibleAdulta.find(f => f.id === 'volRecomendado').value, 1000, 'Valor de volRecomendado preservado');
    assert.strictEqual(visibleAdulta.find(f => f.id === 'volAplicado').value, 500, 'Valor de volAplicado preservado');

    const valAdulta = calculateConcentrationPure(
      visibleAdulta.find(f => f.id === 'concValue').value,
      visibleAdulta.find(f => f.id === 'concValue').unit,
      visibleAdulta.find(f => f.id === 'volPrepararConc').value,
      visibleAdulta.find(f => f.id === 'volRecomendado').value,
      visibleAdulta.find(f => f.id === 'volAplicado').value,
      'adulta'
    );
    assert.strictEqual(valAdulta.quantidade_pf_small, 800, 'Resultado em adulta recuperado deve ser 800 mL');
  });

  test('4. Validação Declarativa nos Inputs do calculate() oficial', () => {
    // Teste com inputs estruturados em modo jovem
    const outJovem = concentracaoCalculatorConfig.calculate({
      volPrepararConc: { rawValue: 400, unit: 'L', normalizedValue: 400, dimension: 'volume', canonicalKey: 'tank_volume', label: '', source: 'user_input' },
      concValue: { rawValue: 100, unit: 'mL/hL', normalizedValue: 100, dimension: 'concentration', canonicalKey: 'concentration', label: '', source: 'user_input' },
      mode: { rawValue: 'jovem', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: 'calculator_mode', label: '', source: 'user_input' }
    });
    assert.strictEqual(outJovem.quantidade_pf.rawValue, 400);
    assert.strictEqual(outJovem.quantidade_pf.unit, 'mL');
    assert.strictEqual(outJovem.quantidade_pf.subValue, 0.4);
    assert.strictEqual(outJovem.quantidade_pf.subUnit, 'L');

    // Teste com inputs estruturados em modo adulta
    const outAdulta = concentracaoCalculatorConfig.calculate({
      volPrepararConc: { rawValue: 400, unit: 'L', normalizedValue: 400, dimension: 'volume', canonicalKey: 'tank_volume', label: '', source: 'user_input' },
      concValue: { rawValue: 100, unit: 'mL/hL', normalizedValue: 100, dimension: 'concentration', canonicalKey: 'concentration', label: '', source: 'user_input' },
      volRecomendado: { rawValue: 1000, unit: 'L/ha', normalizedValue: 1000, dimension: 'volume_rate', canonicalKey: 'reference_spray_volume', label: '', source: 'user_input' },
      volAplicado: { rawValue: 500, unit: 'L/ha', normalizedValue: 500, dimension: 'volume_rate', canonicalKey: 'actual_spray_volume', label: '', source: 'user_input' },
      mode: { rawValue: 'adulta', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: 'calculator_mode', label: '', source: 'user_input' }
    });
    assert.strictEqual(outAdulta.quantidade_pf.rawValue, 800);
    assert.strictEqual(outAdulta.quantidade_pf.unit, 'mL');
    assert.strictEqual(outAdulta.quantidade_pf.subValue, 0.8);
    assert.strictEqual(outAdulta.quantidade_pf.subUnit, 'L');
  });

});
