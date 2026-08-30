/**
 * DATERRA Smart - Testes de Conformidade e Não-Regressão do DaterraKeypad
 * Validação Declarativa Contextual por Campo (Substituição de evaluatedResult < 1)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { validateKeypadValue } from '../src/components/keypadValidation.ts';
import { areaParedeFoliarCalculatorConfig } from '../src/features/calculators/definitions/areaParedeFoliarCalculatorConfig.ts';
import { velocidadeRealCalculatorConfig } from '../src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts';
import { doseCalculatorConfig } from '../src/features/calculators/definitions/doseCalculatorConfig.ts';
import { concentracaoCalculatorConfig } from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';
import { volumeCopaCalculatorConfig } from '../src/features/calculators/definitions/volumeCopaCalculatorConfig.ts';
import { volumeCaldaTrvCalculatorConfig } from '../src/features/calculators/definitions/volumeCaldaTrvCalculatorConfig.ts';
import { debitoTotalCalculatorConfig } from '../src/features/calculators/definitions/debitoTotalCalculatorConfig.ts';

describe('Validação Declarativa do DaterraKeypad (Substituição de evaluatedResult < 1)', () => {

  const altLwaField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'alturaVegetacao');
  const entLwaField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'distanciaEntrelinhas');
  const distVelField = velocidadeRealCalculatorConfig.fields.find(f => f.id === 'distanciaPercurso');
  const tempoVelField = velocidadeRealCalculatorConfig.fields.find(f => f.id === 'tempoPercurso');
  const doseValueField = doseCalculatorConfig.fields.find(f => f.id === 'doseValue');
  const concValueField = concentracaoCalculatorConfig.fields.find(f => f.id === 'concValue');
  const altTrvField = volumeCopaCalculatorConfig.fields.find(f => f.id === 'alturaCopa');
  const largTrvField = volumeCopaCalculatorConfig.fields.find(f => f.id === 'larguraCopa');
  const entTrvField = volumeCopaCalculatorConfig.fields.find(f => f.id === 'distanciaEntrelinhas');
  const trvCaldaField = volumeCaldaTrvCalculatorConfig.fields.find(f => f.id === 'volumeCopaTrv');
  const kCaldaField = volumeCaldaTrvCalculatorConfig.fields.find(f => f.id === 'coeficienteVolumeCalda');
  const qDebitoField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'volumeCalda');
  const vDebitoField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'velocidadeTrabalho');
  const wDebitoField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'larguraTrabalho');

  // Regras extraídas para o teclado conforme UniversalCalculatorTemplate
  const getRules = (f) => ({
    required: f.required ?? true,
    min: f.min,
    max: f.max,
    minInclusive: f.minInclusive ?? true,
    maxInclusive: f.maxInclusive ?? true,
    allowDecimal: f.allowDecimal ?? !f.integerOnly,
    maxDecimals: f.maxDecimals ?? (f.integerOnly ? 0 : 3),
    allowNegative: f.allowNegative ?? false,
    allowExpressions: f.allowExpressions ?? true,
    integerOnly: f.integerOnly ?? false,
    unit: f.defaultUnit
  });

  const altLwaRules = getRules(altLwaField);
  const entLwaRules = getRules(entLwaField);
  const distVelRules = getRules(distVelField);
  const tempoVelRules = getRules(tempoVelField);
  const doseRules = getRules(doseValueField);
  const concRules = getRules(concValueField);

  // ========================================================
  // CASO 1 & 2: Altura da Vegetação Tratada (LWA)
  // ========================================================

  test('1. Altura LWA: 0,5, 0,8, 2,5, 2,53, 6,0 ativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0.5, '0,5', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(0.8, '0,8', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(2.5, '2,5', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(2.53, '2,53', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(6.0, '6,0', false, altLwaRules).isValid, true);
    // Expressão válida avaliando para 0,8
    assert.equal(validateKeypadValue(0.8, '0,5 + 0,3', false, altLwaRules).isValid, true);
  });

  test('2. Altura LWA: 0, 0,3, -1, 6,1, NaN e Infinity desativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0, '0', false, altLwaRules).isValid, false);
    assert.equal(validateKeypadValue(0.3, '0,3', false, altLwaRules).isValid, false);
    assert.equal(validateKeypadValue(-1, '-1', false, altLwaRules).isValid, false);
    assert.equal(validateKeypadValue(6.1, '6,1', false, altLwaRules).isValid, false);
    assert.equal(validateKeypadValue(NaN, 'abc', false, altLwaRules).isValid, false);
    assert.equal(validateKeypadValue(Infinity, '1/0', true, altLwaRules).isValid, false);
  });

  // ========================================================
  // CASO 3 & 4: Distância Entrelinhas (LWA)
  // ========================================================

  test('3. Entrelinha LWA: 1,0, 1,2, 1,5, 1,6, 3,0, 3,25, 10,0 ativam a tecla OK', () => {
    assert.equal(validateKeypadValue(1.0, '1,0', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(1.2, '1,2', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(1.5, '1,5', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(1.6, '1,6', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(3.0, '3,0', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(3.25, '3,25', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(10.0, '10,0', false, entLwaRules).isValid, true);
  });

  test('4. Entrelinha LWA: 0, 0,5, 0,9, -1, 10,1, NaN e Infinity desativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0, '0', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(0.5, '0,5', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(-1, '-1', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(10.1, '10,1', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(NaN, 'xyz', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(Infinity, '10/0', true, entLwaRules).isValid, false);
  });

  // ========================================================
  // CASO 5, 6 & 7: Velocidade Real de Trabalho (Distância e Tempo)
  // ========================================================

  test('5. Distância de velocidade: 0, 0,1 e 0,9 deixam OK inativo; 1, 1,5, 50, 100 ativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0, '0', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.1, '0,1', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(1, '1', false, distVelRules).isValid, true);
    assert.equal(validateKeypadValue(1.5, '1,5', false, distVelRules).isValid, true);
    assert.equal(validateKeypadValue(50, '50', false, distVelRules).isValid, true);
    assert.equal(validateKeypadValue(100, '100', false, distVelRules).isValid, true);
    assert.equal(validateKeypadValue(125.5, '125,5', false, distVelRules).isValid, true);
  });

  test('6. Tempo de velocidade: 0, 0,1 e 0,9 deixam OK inativo; 1, 1,5, 15, 20, 45 ativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0, '0', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.1, '0,1', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(1, '1', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(1.5, '1,5', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(15, '15', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(20, '20', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(45, '45', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(52.4, '52,4', false, tempoVelRules).isValid, true);
    // Expressão como fração 2 / 2 avaliando para 1
    assert.equal(validateKeypadValue(1.0, '2 / 2', false, tempoVelRules).isValid, true);
  });

  test('7. Distância e tempo: 0, negativos, NaN e Infinity desativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0, '0', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(-5, '-5', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(NaN, 'err', false, distVelRules).isValid, false);

    assert.equal(validateKeypadValue(0, '0', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(-10, '-10', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(Infinity, '45/0', true, tempoVelRules).isValid, false);
  });

  // ========================================================
  // CASO 8 & 9: Dose Recomendada e Concentração do PF
  // ========================================================

  test('8. Dose Recomendada: 0,01, 0,25 e 0,5 ativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0.01, '0,01', false, doseRules).isValid, true);
    assert.equal(validateKeypadValue(0.25, '0,25', false, doseRules).isValid, true);
    assert.equal(validateKeypadValue(0.5, '0,5', false, doseRules).isValid, true);
    assert.equal(validateKeypadValue(2.0, '2,0', false, doseRules).isValid, true);
    assert.equal(validateKeypadValue(0, '0', false, doseRules).isValid, false);
  });

  test('9. Concentração do PF: 0,01, 0,05 e 0,5 ativam a tecla OK', () => {
    assert.equal(validateKeypadValue(0.01, '0,01', false, concRules).isValid, true);
    assert.equal(validateKeypadValue(0.05, '0,05', false, concRules).isValid, true);
    assert.equal(validateKeypadValue(0.5, '0,5', false, concRules).isValid, true);
    assert.equal(validateKeypadValue(100, '100', false, concRules).isValid, true);
    assert.equal(validateKeypadValue(0, '0', false, concRules).isValid, false);
  });

  // ========================================================
  // CASO 10, 11, 12: Regras Estruturais (Inteiros, Máximos, Ilimitados)
  // ========================================================

  test('10. Campo inteiro bloqueia valor decimal', () => {
    const intRules = { integerOnly: true, allowDecimal: false, min: 1, max: 100 };
    assert.equal(validateKeypadValue(5, '5', false, intRules).isValid, true);
    assert.equal(validateKeypadValue(1.2, '1,2', false, intRules).isValid, false);
    assert.equal(validateKeypadValue(5.05, '5.05', false, intRules).isValid, false);
  });

  test('11. Campo com máximo bloqueia valor acima do máximo', () => {
    const maxRules = { min: 1, max: 100, maxInclusive: true };
    assert.equal(validateKeypadValue(100, '100', false, maxRules).isValid, true);
    assert.equal(validateKeypadValue(100.1, '100,1', false, maxRules).isValid, false);
    assert.equal(validateKeypadValue(200, '200', false, maxRules).isValid, false);
  });

  test('12. Campo sem máximo não fica bloqueado por limite artificial', () => {
    const unconstrainedRules = { min: 0, minInclusive: false };
    assert.equal(validateKeypadValue(50000, '50000', false, unconstrainedRules).isValid, true);
    assert.equal(validateKeypadValue(1000000, '1000000', false, unconstrainedRules).isValid, true);
  });

  // ========================================================
  // CASO 13 & 14: Separadores Decimais (Vírgula e Ponto)
  // ========================================================

  test('13. Vírgula decimal é aceite', () => {
    assert.equal(validateKeypadValue(2.5, '2,5', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(0.8, '0,8', false, altLwaRules).isValid, true);
  });

  test('14. Ponto decimal é aceite', () => {
    assert.equal(validateKeypadValue(2.5, '2.5', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(0.8, '0.8', false, altLwaRules).isValid, true);
  });

  // ========================================================
  // CASO 15 & 16: Expressões Matemáticas
  // ========================================================

  test('15. Expressão válida é avaliada corretamente sem quebrar por operadores', () => {
    // 0,5 + 0,3
    assert.equal(validateKeypadValue(0.8, '0,5 + 0,3', false, altLwaRules).isValid, true);
    // 2 * 1,5
    assert.equal(validateKeypadValue(3.0, '2 * 1,5', false, altLwaRules).isValid, true);
    // 100 / 3
    assert.equal(validateKeypadValue(33.333, '100 / 3', false, distVelRules).isValid, true);
  });

  test('16. Expressão inválida ou incompleta desativa OK', () => {
    // Operador pendente
    assert.equal(validateKeypadValue(5, '5 +', false, altLwaRules).isValid, false);
    assert.equal(validateKeypadValue(2, '2,', false, altLwaRules).isValid, false);
    // Divisão por zero (evalError true)
    assert.equal(validateKeypadValue(0, '5 / 0', true, altLwaRules).isValid, false);
  });

  // ========================================================
  // CASO 17 & 18: Negativos e Limite de Casas Decimais
  // ========================================================

  test('17. Valor negativo é bloqueado quando allowNegative: false', () => {
    assert.equal(validateKeypadValue(-0.5, '-0,5', false, altLwaRules).isValid, false);
    assert.equal(validateKeypadValue(-10, '-10', false, distVelRules).isValid, false);
  });

  test('18. Casas decimais acima de maxDecimals desativam OK', () => {
    // maxDecimals é 2 para LWA
    assert.equal(validateKeypadValue(2.53, '2,53', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(2.534, '2,534', false, altLwaRules).isValid, false);
    // Mas em expressões, cada literal é respeitado
    assert.equal(validateKeypadValue(2.8, '1,55 + 1,25', false, altLwaRules).isValid, true);
    assert.equal(validateKeypadValue(2.8, '1,555 + 1,25', false, altLwaRules).isValid, false);
  });

  // ========================================================
  // CASO 19: Avisos Não Bloqueantes vs Bloqueios
  // ========================================================

  test('19. Avisos não bloqueantes não desativam OK no teclado', () => {
    // LWA: 0,8 m é aviso (não erro) -> teclado deve ativar OK
    assert.equal(validateKeypadValue(0.8, '0,8', false, altLwaRules).isValid, true);
    const lwaVal = areaParedeFoliarCalculatorConfig.validate({
      alturaVegetacao: { rawValue: 0.8, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(lwaVal.isValid, true);
    assert.ok(lwaVal.warnings.alturaVegetacao);

    // Velocidade: 50 m é aviso (não erro) -> teclado deve ativar OK
    assert.equal(validateKeypadValue(50, '50', false, distVelRules).isValid, true);
    const velValDist = velocidadeRealCalculatorConfig.validate({
      distanciaPercurso: { rawValue: 50, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 45, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(velValDist.isValid, true);
    assert.ok(velValDist.warnings.distanciaPercurso);

    // Velocidade: 15 s é aviso (não erro) -> teclado deve ativar OK
    assert.equal(validateKeypadValue(15, '15', false, tempoVelRules).isValid, true);
    const velValTempo = velocidadeRealCalculatorConfig.validate({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 15, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(velValTempo.isValid, true);
    assert.ok(velValTempo.warnings.tempoPercurso);
  });

  // ========================================================
  // CASO 20 & 21: Acessibilidade de Teclado Físico e Táctil
  // ========================================================

  test('20. Teclado físico em desktop continua funcional', () => {
    const keypadCode = fs.readFileSync(path.resolve('src/components/DaterraKeypad.tsx'), 'utf8');
    assert.ok(keypadCode.includes('handleKeyPress'));
    assert.ok(keypadCode.includes('handleBackspace'));
    assert.ok(keypadCode.includes('handleClear'));
  });

  test('21. Teclado táctil em smartphone continua funcional com botões táteis', () => {
    const keypadCode = fs.readFileSync(path.resolve('src/components/DaterraKeypad.tsx'), 'utf8');
    assert.ok(keypadCode.includes('keypad-btn'));
    assert.ok(keypadCode.includes('keypad-operator'));
    assert.ok(keypadCode.includes('isOkDisabled'));
    assert.ok(!keypadCode.includes('evaluatedResult < 1'));
  });

  // ========================================================
  // CASO 22, 23, 24: Verificação de Integridade Geral
  // ========================================================

  test('22. A regra global evaluatedResult < 1 foi totalmente eliminada de DaterraKeypad.tsx', () => {
    const keypadCode = fs.readFileSync(path.resolve('src/components/DaterraKeypad.tsx'), 'utf8');
    assert.ok(!keypadCode.includes('evaluatedResult < 1'));
    assert.ok(keypadCode.includes('validateKeypadValue'));
  });

  test('23. UniversalCalculatorTemplate passa validationRules para o teclado', () => {
    const templateCode = fs.readFileSync(path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx'), 'utf8');
    assert.ok(templateCode.includes('validationRules={{'));
    assert.ok(templateCode.includes('min: activeKeypadField.min'));
    assert.ok(templateCode.includes('max: activeKeypadField.max'));
  });

  test('24. Todas as definições de calculadoras declaram as regras de validação necessárias', () => {
    assert.equal(altLwaField?.min, 0.5);
    assert.equal(altLwaField?.max, 6.0);
    assert.equal(entLwaField?.min, 1.0);
    assert.equal(entLwaField?.max, 10.0);
    assert.equal(distVelField?.min, 1);
    assert.equal(distVelField?.minInclusive, true);
    assert.equal(tempoVelField?.min, 1);
    assert.equal(tempoVelField?.minInclusive, true);
    assert.equal(doseValueField?.min, 0.01);
    assert.equal(concValueField?.min, 0.01);
    assert.equal(altTrvField?.min, 0.5);
    assert.equal(altTrvField?.max, 6.0);
    assert.equal(largTrvField?.min, 0.2);
    assert.equal(largTrvField?.max, 5.0);
    assert.equal(entTrvField?.min, 1.0);
    assert.equal(entTrvField?.max, 10.0);
  });

  // ========================================================
  // CASO 25, 26, 27, 28: Rótulo Uniforme "OK (Confirmar)" e Indicação Auxiliar
  // ========================================================

  test('25. O botão vazio continua inativo', () => {
    const emptyVal = validateKeypadValue(0, '', false, altLwaRules);
    assert.equal(emptyVal.isValid, false);
    assert.equal(emptyVal.reason, 'empty');
  });

  test('26. O botão com 0,8 m na LWA fica ativo', () => {
    const lwaVal = validateKeypadValue(0.8, '0,8', false, altLwaRules);
    assert.equal(lwaVal.isValid, true);
  });

  test('27. O texto do botão nunca contém "< 1" e o rótulo é sempre uniforme "OK (Confirmar)"', () => {
    const keypadCode = fs.readFileSync(path.resolve('src/components/DaterraKeypad.tsx'), 'utf8');
    const ptLocale = fs.readFileSync(path.resolve('src/i18n/locales/pt.json'), 'utf8');
    
    // O código do teclado não contém "< 1"
    assert.ok(!keypadCode.includes('< 1'));
    assert.ok(!keypadCode.includes('disabledConfirm'));
    assert.ok(keypadCode.includes("t('keypad.confirmButton')"));

    // O ficheiro de tradução não contém "< 1"
    assert.ok(!ptLocale.includes('< 1'));
    assert.ok(ptLocale.includes('"confirmButton": "OK (Confirmar)"'));
  });

  test('28. Limites reais de mínimo e máximo são apresentados em mensagens auxiliares fora do rótulo', () => {
    const belowMin = validateKeypadValue(0.3, '0,3', false, altLwaRules);
    assert.equal(belowMin.isValid, false);
    assert.equal(belowMin.reason, 'below_min');

    const aboveMax = validateKeypadValue(6.5, '6,5', false, altLwaRules);
    assert.equal(aboveMax.isValid, false);
    assert.equal(aboveMax.reason, 'above_max');

    const keypadCode = fs.readFileSync(path.resolve('src/components/DaterraKeypad.tsx'), 'utf8');
    assert.ok(keypadCode.includes('Valor mínimo:'));
    assert.ok(keypadCode.includes('Valor máximo:'));
  });

  // ========================================================
  // CASO 29 a 34: Validação Específica dos Novos Limites Mínimos
  // ========================================================

  test('29. Velocidade Distância: 0, 0,1 e 0,9 deixam OK inativo; 1, 1,5, 50 e 100 ativam OK', () => {
    assert.equal(validateKeypadValue(0, '0', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.1, '0,1', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, distVelRules).isValid, false);
    assert.equal(validateKeypadValue(1, '1', false, distVelRules).isValid, true);
    assert.equal(validateKeypadValue(1.5, '1,5', false, distVelRules).isValid, true);
    assert.equal(validateKeypadValue(50, '50', false, distVelRules).isValid, true);
    assert.equal(validateKeypadValue(100, '100', false, distVelRules).isValid, true);
  });

  test('30. Velocidade Distância: valores entre 1 e 100 mostram aviso; 100 não mostra aviso', () => {
    const val50 = velocidadeRealCalculatorConfig.validate({
      distanciaPercurso: { rawValue: 50, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 45, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(val50.isValid, true);
    assert.equal(val50.warnings.distanciaPercurso, 'Para maior precisão, recomenda-se uma distância mínima de 100 m.');

    const val100 = velocidadeRealCalculatorConfig.validate({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 45, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(val100.isValid, true);
    assert.equal(val100.warnings.distanciaPercurso, undefined);
  });

  test('31. Velocidade Tempo: 0, 0,1 e 0,9 deixam OK inativo; 1, 1,5, 15 e 20 ativam OK', () => {
    assert.equal(validateKeypadValue(0, '0', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.1, '0,1', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, tempoVelRules).isValid, false);
    assert.equal(validateKeypadValue(1, '1', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(1.5, '1,5', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(15, '15', false, tempoVelRules).isValid, true);
    assert.equal(validateKeypadValue(20, '20', false, tempoVelRules).isValid, true);
  });

  test('32. Velocidade Tempo: valores entre 1 e 20 mostram aviso; 20 não mostra aviso', () => {
    const val15 = velocidadeRealCalculatorConfig.validate({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 15, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(val15.isValid, true);
    assert.equal(val15.warnings.tempoPercurso, 'Tempo muito curto pode reduzir a precisão da medição.');

    const val20 = velocidadeRealCalculatorConfig.validate({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 20, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(val20.isValid, true);
    assert.equal(val20.warnings.tempoPercurso, undefined);
  });

  test('33. LWA Entrelinha: 0, 0,5 e 0,9 deixam OK inativo; 1, 1,2, 1,5 e 10 ativam OK; 10,1 deixa OK inativo', () => {
    assert.equal(validateKeypadValue(0, '0', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(0.5, '0,5', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, entLwaRules).isValid, false);
    assert.equal(validateKeypadValue(1, '1', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(1.2, '1,2', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(1.5, '1,5', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(10, '10', false, entLwaRules).isValid, true);
    assert.equal(validateKeypadValue(10.1, '10,1', false, entLwaRules).isValid, false);
  });

  test('34. LWA Entrelinha: valores entre 1 e 2 mostram novo aviso de entrelinha estreita', () => {
    const val12 = areaParedeFoliarCalculatorConfig.validate({
      alturaVegetacao: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 1.2, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(val12.isValid, true);
    assert.equal(val12.warnings.distanciaEntrelinhas, 'Entrelinha muito estreita. Confirme se esta calculadora é adequada ao sistema de condução e se a medição foi efetuada corretamente.');

    const val25 = areaParedeFoliarCalculatorConfig.validate({
      alturaVegetacao: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(val25.isValid, true);
    assert.equal(val25.warnings.distanciaEntrelinhas, undefined);
  });

  // ========================================================
  // CASO 35 e 36: Volume de Calda Adequado por TRV (k e TRV)
  // ========================================================

  test('35. Volume de Calda por TRV: k aceita 0,010, 0,033 e 0,500; bloqueia 0, 0,009 e 0,501', () => {
    const kRules = getRules(kCaldaField);
    assert.equal(kRules.min, 0.01);
    assert.equal(kRules.max, 0.5);
    assert.equal(kRules.maxDecimals, 3);

    assert.equal(validateKeypadValue(0.01, '0,01', false, kRules).isValid, true);
    assert.equal(validateKeypadValue(0.033, '0,033', false, kRules).isValid, true);
    assert.equal(validateKeypadValue(0.5, '0,500', false, kRules).isValid, true);

    assert.equal(validateKeypadValue(0, '0', false, kRules).isValid, false);
    assert.equal(validateKeypadValue(0.009, '0,009', false, kRules).isValid, false);
    assert.equal(validateKeypadValue(0.501, '0,501', false, kRules).isValid, false);
  });

  test('36. Volume de Calda por TRV: TRV aceita 6125 e 50000; bloqueia 0 e 50001', () => {
    const trvRules = getRules(trvCaldaField);
    assert.equal(trvRules.min, 0);
    assert.equal(trvRules.minInclusive, false);
    assert.equal(trvRules.max, 50000);

    assert.equal(validateKeypadValue(6125, '6125', false, trvRules).isValid, true);
    assert.equal(validateKeypadValue(50000, '50000', false, trvRules).isValid, true);

    assert.equal(validateKeypadValue(0, '0', false, trvRules).isValid, false);
    assert.equal(validateKeypadValue(50001, '50001', false, trvRules).isValid, false);
  });

  test('37. Débito Total: Volume aceita 50, 300 e 2000; bloqueia 0, 49 e 2001', () => {
    const qRules = getRules(qDebitoField);
    assert.equal(qRules.min, 50);
    assert.equal(qRules.minInclusive, true);
    assert.equal(qRules.max, 2000);

    assert.equal(validateKeypadValue(50, '50', false, qRules).isValid, true);
    assert.equal(validateKeypadValue(300, '300', false, qRules).isValid, true);
    assert.equal(validateKeypadValue(2000, '2000', false, qRules).isValid, true);

    assert.equal(validateKeypadValue(0, '0', false, qRules).isValid, false);
    assert.equal(validateKeypadValue(49.9, '49,9', false, qRules).isValid, false);
    assert.equal(validateKeypadValue(2001, '2001', false, qRules).isValid, false);
  });

  test('38. Débito Total: Velocidade aceita 2, 8.0 e 20; bloqueia 0, 1.9 e 20.1', () => {
    const vRules = getRules(vDebitoField);
    assert.equal(vRules.min, 2);
    assert.equal(vRules.minInclusive, true);
    assert.equal(vRules.max, 20);

    assert.equal(validateKeypadValue(2, '2', false, vRules).isValid, true);
    assert.equal(validateKeypadValue(8.0, '8,0', false, vRules).isValid, true);
    assert.equal(validateKeypadValue(20, '20', false, vRules).isValid, true);

    assert.equal(validateKeypadValue(0, '0', false, vRules).isValid, false);
    assert.equal(validateKeypadValue(1.9, '1,9', false, vRules).isValid, false);
    assert.equal(validateKeypadValue(20.1, '20,1', false, vRules).isValid, false);
  });

  test('39. Débito Total: Largura aceita 1, 24 e 60; bloqueia 0, 0.9 e 60.1', () => {
    const wRules = getRules(wDebitoField);
    assert.equal(wRules.min, 1);
    assert.equal(wRules.minInclusive, true);
    assert.equal(wRules.max, 60);

    assert.equal(validateKeypadValue(1, '1', false, wRules).isValid, true);
    assert.equal(validateKeypadValue(24, '24', false, wRules).isValid, true);
    assert.equal(validateKeypadValue(60, '60', false, wRules).isValid, true);

    assert.equal(validateKeypadValue(0, '0', false, wRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, wRules).isValid, false);
    assert.equal(validateKeypadValue(60.1, '60,1', false, wRules).isValid, false);
  });

});
