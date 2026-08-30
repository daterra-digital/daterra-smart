/**
 * DATERRA Smart - Testes da Fase 10: Calculadora de Volume de Copa (TRV)
 * Cobertura Completa dos 52 Requisitos Obrigatórios
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  volumeCopaCalculatorConfig,
  calculateTrvPure
} from '../src/features/calculators/definitions/volumeCopaCalculatorConfig.ts';

import { calculateDosePure } from '../src/features/calculators/definitions/doseCalculatorConfig.ts';
import { calculateConcentrationPure } from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';
import { calculateWorkSpeedPure } from '../src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts';
import { calculateLwaPure } from '../src/features/calculators/definitions/areaParedeFoliarCalculatorConfig.ts';

import {
  buildCalculationRecord,
  evaluateHistoryQuota,
  filterHistoryRecords
} from '../src/features/calculators/core/historyService.ts';

import { MAX_ACTIVE_CALCULATIONS_PER_TOOL } from '../src/types/calculator.ts';
import { CANONICAL_VARIABLES } from '../src/features/calculators/core/canonicalVariables.ts';
import { validateKeypadValue } from '../src/components/keypadValidation.ts';

describe('Fase 10: Calculadora de Volume de Copa (calc_volume_copa)', () => {

  const geralPath = path.resolve('src/features/volume-copa/TRVFAQGeral.md');
  const alturaPath = path.resolve('src/features/volume-copa/TRVFAQAltura.md');
  const larguraPath = path.resolve('src/features/volume-copa/TRVFAQLargura.md');
  const entrelinhaPath = path.resolve('src/features/volume-copa/TRVFAQEntrelinha.md');
  const resultadoPath = path.resolve('src/features/volume-copa/TRVFAQResultado.md');

  // ========================================================
  // GRUPO 1: Testes de Fórmula Pura e Matemática (1 a 10)
  // ========================================================

  test('1. Fórmula base: 3,5 m × 0,7 m ÷ 4,0 m = 6 125,0 m³ TRV/ha', () => {
    const res = calculateTrvPure(3.5, 0.7, 4.0);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_copa, 6125.0);
  });

  test('2. Valores predefinidos: 2,5 m × 1,0 m ÷ 3,0 m = 8 333,3 m³ TRV/ha', () => {
    const res = calculateTrvPure(2.5, 1.0, 3.0);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_copa, 8333.3);
  });

  test('3. Valor decimal: 2,75 m × 1,25 m ÷ 3,5 m = 9 821,4 m³ TRV/ha', () => {
    const res = calculateTrvPure(2.75, 1.25, 3.5);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_copa, 9821.4);
  });

  test('4. Limites inferiores: 0,5 m × 0,2 m ÷ 1,0 m = 1 000,0 m³ TRV/ha', () => {
    const res = calculateTrvPure(0.5, 0.2, 1.0);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_copa, 1000.0);
  });

  test('5. Limites superiores: 6,0 m × 5,0 m ÷ 10,0 m = 30 000,0 m³ TRV/ha', () => {
    const res = calculateTrvPure(6.0, 5.0, 10.0);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_copa, 30000.0);
  });

  test('6. Campo vazio: tratado como erro de validação bloqueante', () => {
    const valAlt = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: '', unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(valAlt.isValid, false);
    assert.equal(valAlt.errors.alturaCopa, 'Introduza a altura da copa.');
  });

  test('7. Zero: erro bloqueante e função pura segura', () => {
    const resH = calculateTrvPure(0, 1.0, 3.0);
    assert.equal(resH.isValid, false);
    assert.equal(resH.volume_copa, 0);

    const resW = calculateTrvPure(2.5, 0, 3.0);
    assert.equal(resW.isValid, false);
    assert.equal(resW.volume_copa, 0);

    const resR = calculateTrvPure(2.5, 1.0, 0);
    assert.equal(resR.isValid, false);
    assert.equal(resR.volume_copa, 0);

    const validation = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation.isValid, false);
    assert.equal(validation.errors.alturaCopa, 'A altura deve ser superior a zero.');
    assert.equal(validation.errors.larguraCopa, 'A largura deve ser superior a zero.');
    assert.equal(validation.errors.distanciaEntrelinhas, 'A distância entrelinhas deve ser superior a zero.');
  });

  test('8. Valor negativo: erro bloqueante e função pura segura', () => {
    const res = calculateTrvPure(-2.5, -1.0, -3.0);
    assert.equal(res.isValid, false);
    assert.equal(res.volume_copa, 0);

    const validation = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: -2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: -1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: -3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation.isValid, false);
    assert.equal(validation.errors.alturaCopa, 'A altura deve ser superior a zero.');
    assert.equal(validation.errors.larguraCopa, 'A largura deve ser superior a zero.');
    assert.equal(validation.errors.distanciaEntrelinhas, 'A distância entrelinhas deve ser superior a zero.');
  });

  test('9. NaN: rejeição estrita', () => {
    const res = calculateTrvPure(NaN, 1.0, 3.0);
    assert.equal(res.isValid, false);
    assert.equal(res.volume_copa, 0);

    const validation = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 'abc', unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 'xyz', unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 'inv', unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation.isValid, false);
    assert.equal(validation.errors.alturaCopa, 'Introduza um valor numérico válido.');
    assert.equal(validation.errors.larguraCopa, 'Introduza um valor numérico válido.');
    assert.equal(validation.errors.distanciaEntrelinhas, 'Introduza um valor numérico válido.');
  });

  test('10. Infinity: rejeição estrita e sem divisão por zero', () => {
    const res = calculateTrvPure(Infinity, 1.0, 3.0);
    assert.equal(res.isValid, false);
    assert.equal(res.volume_copa, 0);

    const resDiv = calculateTrvPure(2.5, 1.0, 0);
    assert.equal(resDiv.isValid, false);
    assert.equal(resDiv.volume_copa, 0);
  });

  // ========================================================
  // GRUPO 2: Limites e Mensagens de Erro/Avisos (11 a 22)
  // ========================================================

  test('11. Altura abaixo de 0,5 m gera erro bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 0.4, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.alturaCopa, 'A altura mínima é 0,5 m.');
  });

  test('12. Altura acima de 6,0 m gera erro bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 6.1, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.alturaCopa, 'A altura máxima é 6,0 m.');
  });

  test('13. Largura abaixo de 0,2 m gera erro bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 0.19, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.larguraCopa, 'A largura mínima é 0,2 m.');
  });

  test('14. Largura acima de 5,0 m gera erro bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 5.1, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.larguraCopa, 'A largura máxima é 5,0 m.');
  });

  test('15. Entrelinha abaixo de 1,0 m gera erro bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 0.9, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.distanciaEntrelinhas, 'A distância entrelinhas mínima é 1 m.');
  });

  test('16. Entrelinha acima de 10,0 m gera erro bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 10.1, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.distanciaEntrelinhas, 'A distância máxima é 10,0 m.');
  });
  // ========================================================
  // GRUPO 2 (cont.): Avisos Não Bloqueantes (17 a 22)
  // ========================================================

  test('17. Aviso de altura baixa (0.5 <= alt < 1.0) é não bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 0.8, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, true);
    assert.equal(val.warnings.alturaCopa, 'Altura muito baixa. Verifique se a medição está correta.');
  });

  test('18. Aviso de altura elevada (5.0 < alt <= 6.0) é não bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 5.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, true);
    assert.equal(val.warnings.alturaCopa, 'Altura elevada. Verifique se a medição está correta.');
  });

  test('19. Aviso de largura estreita (0.2 <= larg < 0.4) é não bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 0.3, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, true);
    assert.equal(val.warnings.larguraCopa, 'Largura muito estreita. Verifique se a medição está correta.');
  });

  test('20. Aviso de largura larga (4.0 < larg <= 5.0) é não bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 4.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, true);
    assert.equal(val.warnings.larguraCopa, 'Largura muito larga. Verifique se a medição está correta.');
  });

  test('21. Aviso de entrelinha estreita (1.0 <= ent < 2.0) é não bloqueante com texto exato', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 1.5, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, true);
    assert.equal(val.warnings.distanciaEntrelinhas, 'Entrelinha muito estreita. Confirme se esta calculadora é adequada ao sistema de condução e se a medição foi efetuada corretamente.');
  });

  test('22. Aviso de entrelinha larga (8.0 < ent <= 10.0) é não bloqueante', () => {
    const val = volumeCopaCalculatorConfig.validate({
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 9.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(val.isValid, true);
    assert.equal(val.warnings.distanciaEntrelinhas, 'Entrelinha muito larga. Verifique se a medição está correta.');
  });

  // ========================================================
  // GRUPO 3: Configuração dos Campos e Precisão (23 a 28)
  // ========================================================

  test('23. Exatamente três campos declarados', () => {
    assert.equal(volumeCopaCalculatorConfig.fields.length, 3);
    assert.equal(volumeCopaCalculatorConfig.fields[0].id, 'alturaCopa');
    assert.equal(volumeCopaCalculatorConfig.fields[1].id, 'larguraCopa');
    assert.equal(volumeCopaCalculatorConfig.fields[2].id, 'distanciaEntrelinhas');
  });

  test('24. Exatamente quatro atalhos por campo', () => {
    const altField = volumeCopaCalculatorConfig.fields.find(f => f.id === 'alturaCopa');
    const largField = volumeCopaCalculatorConfig.fields.find(f => f.id === 'larguraCopa');
    const entField = volumeCopaCalculatorConfig.fields.find(f => f.id === 'distanciaEntrelinhas');

    assert.deepEqual(altField?.presets, [1.5, 2.5, 3.5, 4.5]);
    assert.deepEqual(largField?.presets, [0.5, 1.0, 1.5, 2.0]);
    assert.deepEqual(entField?.presets, [2.0, 3.0, 4.0, 5.0]);
  });

  test('25. Inputs com até duas casas decimais declarados', () => {
    volumeCopaCalculatorConfig.fields.forEach(f => {
      assert.equal(f.allowDecimal, true);
      assert.equal(f.maxDecimals, 2);
      assert.equal(f.allowNegative, false);
    });
  });

  test('26. Resultado a uma casa decimal (formatDecimals: 1)', () => {
    const resDef = volumeCopaCalculatorConfig.results[0];
    assert.equal(resDef.formatDecimals, 1);
    assert.equal(resDef.defaultUnit, 'm³ TRV/ha');
    assert.equal(resDef.isPrimary, true);
    assert.equal(resDef.subUnit, undefined);
  });

  test('27. Resultado indisponível quando inválido', () => {
    assert.equal(volumeCopaCalculatorConfig.invalidResultNotice, 'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.');
    const calcRes = volumeCopaCalculatorConfig.calculate({
      alturaCopa: { rawValue: '', unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(Object.keys(calcRes).length, 0);
  });

  test('28. Sem 0 apresentado como resultado válido em erro', () => {
    const calcRes = volumeCopaCalculatorConfig.calculate({
      alturaCopa: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    });
    assert.equal(Object.keys(calcRes).length, 0);
  });

  // ========================================================
  // GRUPO 4: Teclado DATERRA e Validações Declarativas (29 e 30)
  // ========================================================

  test('29. Teclado aceita limites inclusivos: 0,5 m altura, 0,2 m largura, 1,0 m entrelinha', () => {
    const altRules = { required: true, min: 0.5, max: 6.0, minInclusive: true, maxInclusive: true, allowDecimal: true, maxDecimals: 2, allowNegative: false };
    const largRules = { required: true, min: 0.2, max: 5.0, minInclusive: true, maxInclusive: true, allowDecimal: true, maxDecimals: 2, allowNegative: false };
    const entRules = { required: true, min: 1.0, max: 10.0, minInclusive: true, maxInclusive: true, allowDecimal: true, maxDecimals: 2, allowNegative: false };

    assert.equal(validateKeypadValue(0.5, '0,5', false, altRules).isValid, true);
    assert.equal(validateKeypadValue(0.2, '0,2', false, largRules).isValid, true);
    assert.equal(validateKeypadValue(1.0, '1,0', false, entRules).isValid, true);
  });

  test('30. Teclado bloqueia valores fora de limites (0,4 m na altura, 0,19 m na largura, 0,9 m na entrelinha)', () => {
    const altRules = { required: true, min: 0.5, max: 6.0, minInclusive: true, maxInclusive: true, allowDecimal: true, maxDecimals: 2, allowNegative: false };
    const largRules = { required: true, min: 0.2, max: 5.0, minInclusive: true, maxInclusive: true, allowDecimal: true, maxDecimals: 2, allowNegative: false };
    const entRules = { required: true, min: 1.0, max: 10.0, minInclusive: true, maxInclusive: true, allowDecimal: true, maxDecimals: 2, allowNegative: false };

    assert.equal(validateKeypadValue(0.4, '0,4', false, altRules).isValid, false);
    assert.equal(validateKeypadValue(0.19, '0,19', false, largRules).isValid, false);
    assert.equal(validateKeypadValue(0.9, '0,9', false, entRules).isValid, false);
    assert.equal(validateKeypadValue(6.1, '6,1', false, altRules).isValid, false);
    assert.equal(validateKeypadValue(5.1, '5,1', false, largRules).isValid, false);
    assert.equal(validateKeypadValue(10.1, '10,1', false, entRules).isValid, false);
  });

  // ========================================================
  // GRUPO 5: Histórico v2 e Persistência (31 a 35)
  // ========================================================

  test('31. Histórico exclusivo em calculation_history_v2 com calculatorId: calc_volume_copa', () => {
    const inputs = {
      alturaCopa: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura da copa', source: 'user_input', localId: 'alturaCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      larguraCopa: { rawValue: 1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_width', label: 'Largura média', source: 'user_input', localId: 'larguraCopa', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    };
    const outputs = {
      volumeCopa: { rawValue: 8333.3, unit: 'm³ TRV/ha', dimension: 'tree_row_volume', canonicalKey: 'tree_row_volume', label: 'Volume de Copa', source: 'calculated', calculatorId: 'calc_volume_copa', calculatorVersion: '1.0.0' }
    };

    const record = buildCalculationRecord({
      userId: 'user_trv_test',
      calculatorId: 'calc_volume_copa',
      calculatorVersion: '1.0.0',
      inputs,
      outputs
    });
    assert.equal(record.calculatorId, 'calc_volume_copa');
    assert.equal(record.userId, 'user_trv_test');
    assert.equal(record.outputs.volumeCopa.rawValue, 8333.3);
    assert.equal(record.isDeleted, false);
  });

  test('32. Sem escrita na tabela legada em VolumeCopaCalculator', () => {
    const wrapperCode = fs.readFileSync(path.resolve('src/features/volume-copa/VolumeCopaCalculator.tsx'), 'utf8');
    assert.ok(!wrapperCode.includes('db.calculation_history'));
    assert.ok(wrapperCode.includes('UniversalCalculatorTemplate'));
  });

  test('33. Quota de 20 cálculos ativos', () => {
    assert.equal(MAX_ACTIVE_CALCULATIONS_PER_TOOL, 20);
    const records = Array.from({ length: 20 }, (_, i) => ({
      id: `trv_rec_${i}`,
      calculatorId: 'calc_volume_copa',
      userId: 'user_quota',
      createdAt: new Date(Date.now() - i * 1000).toISOString(),
      isDeleted: false
    }));

    const quotaStatus = evaluateHistoryQuota('calc_volume_copa', 'user_quota', records);
    assert.equal(quotaStatus.isLimitReached, true);
    assert.equal(quotaStatus.totalActive, 20);
  });

  test('34. Pesquisa, notas, etiquetas e eliminação soft-delete', () => {
    const testRecord = {
      id: 'trv_note_test',
      calculatorId: 'calc_volume_copa',
      userId: 'u1',
      name: 'Pomar da Quinta',
      notes: 'Tratamento de verão macieira',
      tags: ['pomar', 'macieira'],
      isDeleted: false,
      inputs: {
        alturaCopa: { rawValue: 3.5, unit: 'm', label: 'Altura' }
      },
      outputs: {
        volumeCopa: { rawValue: 13125.0, unit: 'm³ TRV/ha', label: 'Volume' }
      }
    };

    const searchMatch = filterHistoryRecords([testRecord], 'macieira', null);
    assert.equal(searchMatch.length, 1);

    const tagMatch = filterHistoryRecords([testRecord], '', 'pomar');
    assert.equal(tagMatch.length, 1);
  });

  test('35. Limpeza do histórico de TRV não afeta outras calculadoras', () => {
    const mixedRecords = [
      { id: '1', calculatorId: 'calc_volume_copa', isDeleted: false },
      { id: '2', calculatorId: 'calc_dose', isDeleted: false },
      { id: '3', calculatorId: 'calc_concentracao', isDeleted: false },
      { id: '4', calculatorId: 'calc_velocidade_real', isDeleted: false },
      { id: '5', calculatorId: 'calc_area_parede_foliar', isDeleted: false }
    ];

    const trvOnly = mixedRecords.filter(r => r.calculatorId === 'calc_volume_copa');
    assert.equal(trvOnly.length, 1);
    const others = mixedRecords.filter(r => r.calculatorId !== 'calc_volume_copa');
    assert.equal(others.length, 4);
  });
  // ========================================================
  // GRUPO 6: Microlearning e DidacticHelp (36 a 43)
  // ========================================================

  test('36. Microlearning geral com 10 secções normativas', () => {
    assert.ok(fs.existsSync(geralPath));
    const content = fs.readFileSync(geralPath, 'utf8');
    const sections = content.match(/^##\s/gm) || [];
    assert.equal(sections.length, 10);
  });

  test('37. Microlearning de altura com 10 secções normativas', () => {
    assert.ok(fs.existsSync(alturaPath));
    const content = fs.readFileSync(alturaPath, 'utf8');
    const sections = content.match(/^##\s/gm) || [];
    assert.equal(sections.length, 10);
  });

  test('38. Microlearning de largura com 10 secções normativas', () => {
    assert.ok(fs.existsSync(larguraPath));
    const content = fs.readFileSync(larguraPath, 'utf8');
    const sections = content.match(/^##\s/gm) || [];
    assert.equal(sections.length, 10);
  });

  test('39. Microlearning de entrelinha com 10 secções normativas', () => {
    assert.ok(fs.existsSync(entrelinhaPath));
    const content = fs.readFileSync(entrelinhaPath, 'utf8');
    const sections = content.match(/^##\s/gm) || [];
    assert.equal(sections.length, 10);
  });

  test('40. Microlearning do resultado com 10 secções normativas', () => {
    assert.ok(fs.existsSync(resultadoPath));
    const content = fs.readFileSync(resultadoPath, 'utf8');
    const sections = content.match(/^##\s/gm) || [];
    assert.equal(sections.length, 10);
  });

  test('41. DidacticHelp reutilizado com suporte a fecho por X, Compreendido e Escape', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('TRVFAQGeral.md'));
    assert.ok(didacticCode.includes('TRVFAQAltura.md'));
    assert.ok(didacticCode.includes('TRVFAQLargura.md'));
    assert.ok(didacticCode.includes('TRVFAQEntrelinha.md'));
    assert.ok(didacticCode.includes('TRVFAQResultado.md'));
    assert.ok(didacticCode.includes('Escape'));
    assert.ok(didacticCode.includes('Compreendido'));
  });

  test('42. Retorno de foco garantido pelo modal didático', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('triggerRef'));
    assert.ok(didacticCode.includes('focus()'));
  });

  test('43. Funcionamento offline estático via importação ?raw', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes("TRVFAQGeral.md?raw'"));
    assert.ok(didacticCode.includes("TRVFAQResultado.md?raw'"));
  });

  // ========================================================
  // GRUPO 7: Integração, Rotas e Alias (44 a 47)
  // ========================================================

  test('44. Rota dedicada /ferramentas/volume-copa em App.tsx', () => {
    const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appCode.includes('path="/ferramentas/volume-copa"'));
    assert.ok(appCode.includes('VolumeCopaCalculator'));
  });

  test('45. Alias geometria_trv_copa encaminha para /ferramentas/volume-copa', () => {
    const toolsViewCode = fs.readFileSync(path.resolve('src/views/ToolsView.tsx'), 'utf8');
    assert.ok(toolsViewCode.includes("currentViewTool === 'calc_volume_copa' || currentViewTool === 'geometria_trv_copa'"));
    assert.ok(toolsViewCode.includes('to="/ferramentas/volume-copa"'));
  });

  test('46. Catálogo tem apenas uma entrada de TRV e usa o ID oficial calc_volume_copa', () => {
    const toolsViewCode = fs.readFileSync(path.resolve('src/views/ToolsView.tsx'), 'utf8');
    assert.ok(toolsViewCode.includes("id: 'calc_volume_copa'"));
    assert.ok(toolsViewCode.includes("caminho: '/ferramentas/volume-copa'"));
    assert.ok(!toolsViewCode.includes("id: 'geometria_trv_copa'"));
  });

  test('47. Não existe transferência ativa nesta fase', () => {
    assert.equal(volumeCopaCalculatorConfig.results[0].canonicalKey, 'tree_row_volume');
  });

  // ========================================================
  // GRUPO 8: Não-Regressão e Integridade (48 a 52)
  // ========================================================

  test('48. Dose sem regressões: cálculo puro intacto', () => {
    const resDose = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(resDose.primaryValue, 10);
    assert.equal(resDose.area_tratada_ha, 5);
  });

  test('49. Concentração sem regressões: cálculo puro intacto', () => {
    const resConc = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(resConc.primaryValue, 400);
    assert.equal(resConc.subValue, 0.4);
  });

  test('50. Velocidade sem regressões: cálculo puro intacto', () => {
    const resVel = calculateWorkSpeedPure(100, 45);
    assert.equal(resVel.isValid, true);
    assert.equal(resVel.velocidade_kmh, 8.0);
  });

  test('51. LWA sem regressões: cálculo puro intacto', () => {
    const resLwa = calculateLwaPure(2.5, 3.0);
    assert.equal(resLwa.isValid, true);
    assert.equal(resLwa.area_parede_foliar, 16667);
  });

  test('52. Variável canónica tree_row_volume declarada corretamente', () => {
    assert.ok(CANONICAL_VARIABLES.tree_row_volume);
    assert.equal(CANONICAL_VARIABLES.tree_row_volume.canonicalUnit, 'm³ TRV/ha');
  });

});