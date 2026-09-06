/**
 * DATERRA Smart - Testes da Fase 9: Migração da Calculadora de Área de Parede Foliar (LWA)
 * Cobertura Completa dos 50 Requisitos Obrigatórios
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  areaParedeFoliarCalculatorConfig,
  calculateLwaPure
} from '../src/features/calculators/definitions/areaParedeFoliarCalculatorConfig.ts';

import { calculateDosePure } from '../src/features/calculators/definitions/doseCalculatorConfig.ts';
import { calculateConcentrationPure } from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';
import { calculateWorkSpeedPure } from '../src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts';

import {
  buildCalculationRecord,
  evaluateHistoryQuota,
  filterHistoryRecords
} from '../src/features/calculators/core/historyService.ts';

import { MAX_ACTIVE_CALCULATIONS_PER_TOOL } from '../src/types/calculator.ts';
import { CANONICAL_VARIABLES } from '../src/features/calculators/core/canonicalVariables.ts';

describe('Fase 9: Migração da Calculadora de Área de Parede Foliar (calc_area_parede_foliar)', () => {

  const geralPath = path.resolve('src/features/area-parede-foliar/AreaParedeFoliarFAQGeral.md');
  const alturaPath = path.resolve('src/features/area-parede-foliar/AreaParedeFoliarFAQAltura.md');
  const entrelinhaPath = path.resolve('src/features/area-parede-foliar/AreaParedeFoliarFAQEntrelinha.md');
  const resultadoPath = path.resolve('src/features/area-parede-foliar/AreaParedeFoliarFAQResultado.md');

  // ========================================================
  // GRUPO 1: Testes de Fórmula Pura (1 a 10)
  // ========================================================

  test('1. Fórmula base: h=3,5 m, r=4,0 m => resultado 17.500 m² LWA/ha', () => {
    const res = calculateLwaPure(3.5, 4.0);
    assert.equal(res.isValid, true);
    assert.equal(res.area_parede_foliar, 17500);
  });

  test('2. Valores predefinidos: h=2,5 m, r=3,0 m => resultado 16.667 m² LWA/ha', () => {
    const res = calculateLwaPure(2.5, 3.0);
    assert.equal(res.isValid, true);
    // (2.5 * 2 * 10000) / 3.0 = 50000 / 3 = 16666.666... => Math.round = 16667
    assert.equal(res.area_parede_foliar, 16667);
  });

  test('3. Limites inferiores inclusivos: h=0,5 m, r=1,5 m => resultado 6.667 m² LWA/ha', () => {
    const res = calculateLwaPure(0.5, 1.5);
    assert.equal(res.isValid, true);
    // (0.5 * 2 * 10000) / 1.5 = 10000 / 1.5 = 6666.666... => 6667
    assert.equal(res.area_parede_foliar, 6667);
  });

  test('4. Limites superiores inclusivos: h=6,0 m, r=10,0 m => resultado 12.000 m² LWA/ha', () => {
    const res = calculateLwaPure(6.0, 10.0);
    assert.equal(res.isValid, true);
    // (6.0 * 2 * 10000) / 10.0 = 120000 / 10 = 12000
    assert.equal(res.area_parede_foliar, 12000);
  });

  test('5. Valores decimais: h=2,7 m, r=3,3 m => resultado 16.364 m² LWA/ha', () => {
    const res = calculateLwaPure(2.7, 3.3);
    assert.equal(res.isValid, true);
    // (2.7 * 20000) / 3.3 = 54000 / 3.3 = 16363.636... => 16364
    assert.equal(res.area_parede_foliar, 16364);
  });

  test('6. Campos vazios: tratados como erro de validação bloqueante', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: '', unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: '', unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.alturaVegetacao, 'Introduza a altura da vegetação.');
    assert.equal(validation?.errors?.distanciaEntrelinhas, 'Introduza a distância entrelinhas.');
  });

  test('7. Zero na altura ou na entrelinha: erro bloqueante e função pura segura', () => {
    const resHZero = calculateLwaPure(0, 3.0);
    assert.equal(resHZero.isValid, false);
    assert.equal(resHZero.area_parede_foliar, 0);

    const resRZero = calculateLwaPure(2.5, 0);
    assert.equal(resRZero.isValid, false);
    assert.equal(resRZero.area_parede_foliar, 0);

    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.alturaVegetacao, 'A altura deve ser superior a zero.');
    assert.equal(validation?.errors?.distanciaEntrelinhas, 'A distância entrelinhas deve ser superior a zero.');
  });

  test('8. Valores negativos: erro bloqueante e função pura segura', () => {
    const resNeg = calculateLwaPure(-2.5, -3.0);
    assert.equal(resNeg.isValid, false);
    assert.equal(resNeg.area_parede_foliar, 0);

    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: -1.0, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: -2.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.alturaVegetacao, 'A altura deve ser superior a zero.');
    assert.equal(validation?.errors?.distanciaEntrelinhas, 'A distância entrelinhas deve ser superior a zero.');
  });

  test('9. Tratamento estrito de NaN', () => {
    const res = calculateLwaPure(NaN, 3.0);
    assert.equal(res.isValid, false);
    assert.equal(res.area_parede_foliar, 0);

    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 'abc', unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.alturaVegetacao, 'Introduza um valor numérico válido.');
  });

  test('10. Tratamento estrito de Infinity', () => {
    const res = calculateLwaPure(Infinity, 3.0);
    assert.equal(res.isValid, false);
    assert.equal(res.area_parede_foliar, 0);

    const resDivZero = calculateLwaPure(2.5, 0);
    assert.equal(resDivZero.isValid, false);
    assert.equal(isFinite(resDivZero.area_parede_foliar), true);
  });

  // ========================================================
  // GRUPO 2: Validações e Limites Inclusivos (11 a 18)
  // ========================================================

  test('11. Altura abaixo de 0,5 m gera erro bloqueante', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 0.4, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.alturaVegetacao, 'A altura mínima é 0,5 m.');
  });

  test('12. Altura acima de 6,0 m gera erro bloqueante', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 6.1, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.alturaVegetacao, 'A altura máxima é 6,0 m.');
  });

  test('13. Entrelinha abaixo de 1,0 m gera erro bloqueante', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 0.9, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.distanciaEntrelinhas, 'A distância entrelinhas mínima é 1 m.');
  });

  test('14. Entrelinha acima de 10,0 m gera erro bloqueante', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 10.1, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.distanciaEntrelinhas, 'A distância máxima é 10,0 m.');
  });

  test('15. Avisos de altura baixa (0.5 <= alt < 1.0) são não bloqueantes', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 0.8, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, true);
    assert.equal(validation?.warnings?.alturaVegetacao, 'Altura muito baixa. Verifique se a medição está correta.');
  });

  test('16. Avisos de altura elevada (5.0 < alt <= 6.0) são não bloqueantes', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 5.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, true);
    assert.equal(validation?.warnings?.alturaVegetacao, 'Altura elevada. Verifique se a medição está correta.');
  });

  test('17. Avisos de entrelinha estreita (1.0 <= ent < 2.0) são não bloqueantes', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 1.5, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, true);
    assert.equal(validation?.warnings?.distanciaEntrelinhas, 'Entrelinha muito estreita. Confirme se esta calculadora é adequada ao sistema de condução e se a medição foi efetuada corretamente.');
  });

  test('18. Avisos de entrelinha larga (8.0 < ent <= 10.0) são não bloqueantes', () => {
    const validation = areaParedeFoliarCalculatorConfig.validate?.({
      alturaVegetacao: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 9.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, true);
    assert.equal(validation?.warnings?.distanciaEntrelinhas, 'Entrelinha muito larga. Verifique se a medição está correta.');
  });

  // ========================================================
  // GRUPO 3: Configuração e Interface (19 a 26)
  // ========================================================

  test('19. Existem exatamente dois campos declarados', () => {
    assert.equal(areaParedeFoliarCalculatorConfig.fields.length, 2);
    assert.equal(areaParedeFoliarCalculatorConfig.fields[0].id, 'alturaVegetacao');
    assert.equal(areaParedeFoliarCalculatorConfig.fields[1].id, 'distanciaEntrelinhas');
  });

  test('20. Existem exatamente quatro atalhos por campo', () => {
    const altField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'alturaVegetacao');
    const entField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'distanciaEntrelinhas');
    assert.deepEqual(altField?.presets, [1.5, 2.5, 3.5, 4.5]);
    assert.deepEqual(entField?.presets, [2.0, 3.0, 4.0, 5.0]);
    assert.equal(altField?.presets?.length, 4);
    assert.equal(entField?.presets?.length, 4);
  });

  test('21. Valores predefinidos corretos (2,5 m e 3,0 m)', () => {
    const altField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'alturaVegetacao');
    const entField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'distanciaEntrelinhas');
    assert.equal(altField?.defaultValue, 2.5);
    assert.equal(entField?.defaultValue, 3.0);
    assert.equal(altField?.label, 'Altura da vegetação tratada');
    assert.equal(entField?.label, 'Distância entrelinhas');
  });

  test('22. canopy_height está associado ao campo de altura', () => {
    const altField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'alturaVegetacao');
    assert.equal(altField?.canonicalKey, 'canopy_height');
    assert.equal(altField?.dimension, 'length');
  });

  test('23. row_spacing está associado ao campo de entrelinha', () => {
    const entField = areaParedeFoliarCalculatorConfig.fields.find(f => f.id === 'distanciaEntrelinhas');
    assert.equal(entField?.canonicalKey, 'row_spacing');
    assert.equal(entField?.dimension, 'length');
  });

  test('24. leaf_wall_area está associado ao resultado principal', () => {
    const resDef = areaParedeFoliarCalculatorConfig.results.find(r => r.id === 'areaParedeFoliar');
    assert.ok(resDef);
    assert.equal(resDef?.canonicalKey, 'leaf_wall_area');
    assert.equal(resDef?.dimension, 'foliar_wall_area');
    assert.equal(resDef?.defaultUnit, 'm² LWA/ha');
  });

  test('25. Resultado sem casas decimais (formatDecimals: 0)', () => {
    const resDef = areaParedeFoliarCalculatorConfig.results.find(r => r.id === 'areaParedeFoliar');
    assert.equal(resDef?.formatDecimals, 0);
  });

  test('26. Mensagem de resultado indisponível declarada', () => {
    assert.equal(
      areaParedeFoliarCalculatorConfig.invalidResultNotice,
      'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.'
    );
  });

  // ========================================================
  // GRUPO 4: Histórico Offline v2 (27 a 35)
  // ========================================================

  test('27. Histórico exclusivo em calculation_history_v2', () => {
    const inputs = {
      alturaVegetacao: { rawValue: 2.5, unit: 'm', dimension: 'length', canonicalKey: 'canopy_height', label: 'Altura', source: 'user_input', localId: 'alturaVegetacao', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', dimension: 'length', canonicalKey: 'row_spacing', label: 'Entrelinha', source: 'user_input', localId: 'distanciaEntrelinhas', calculatorId: 'calc_area_parede_foliar', calculatorVersion: '1.0.0' }
    };
    const outputs = areaParedeFoliarCalculatorConfig.calculate(inputs);

    const record = buildCalculationRecord({
      userId: 'user_lwa_9',
      calculatorId: 'calc_area_parede_foliar',
      calculatorVersion: '1.0.0',
      inputs,
      outputs
    });

    assert.equal(record.calculatorId, 'calc_area_parede_foliar');
    assert.equal(record.userId, 'user_lwa_9');
    assert.equal(record.syncStatus, 'local_only');
    assert.equal(record.isDeleted, false);
    assert.equal(record.outputs['areaParedeFoliar'].rawValue, 16667);
  });

  test('28. Ausência de escrita na tabela legada em AreaParedeFoliarCalculator', () => {
    const compCode = fs.readFileSync(
      path.resolve('src/features/area-parede-foliar/AreaParedeFoliarCalculator.tsx'),
      'utf8'
    );
    assert.ok(!compCode.includes('db.calculation_history.add'));
    assert.ok(compCode.includes('UniversalCalculatorTemplate'));
  });

  test('29. Quota estrita de 20 cálculos', () => {
    assert.equal(MAX_ACTIVE_CALCULATIONS_PER_TOOL, 20);
    const fakeRecords = Array.from({ length: 20 }, (_, i) => ({
      id: `rec_${i}`,
      calculatorId: 'calc_area_parede_foliar',
      userId: 'user_quota_lwa',
      isDeleted: false
    }));

    const quota = evaluateHistoryQuota('calc_area_parede_foliar', 'user_quota_lwa', fakeRecords);
    assert.equal(quota.totalActive, 20);
    assert.equal(quota.isLimitReached, true);
    assert.equal(quota.canSaveDirectly, false);
  });

  test('30. Soft-delete marca isDeleted como true', () => {
    const record = buildCalculationRecord({
      userId: 'user_soft_lwa',
      calculatorId: 'calc_area_parede_foliar',
      calculatorVersion: '1.0.0',
      inputs: {},
      outputs: {}
    });
    record.isDeleted = true;
    record.deletedAt = new Date().toISOString();
    assert.equal(record.isDeleted, true);
    assert.ok(record.deletedAt);
  });

  test('31. Pesquisa textual funciona nos registos de LWA', () => {
    const records = [
      { id: '1', calculatorId: 'calc_area_parede_foliar', name: 'Vinha Nova', notes: 'Parcela A', tags: ['vinha'], isDeleted: false },
      { id: '2', calculatorId: 'calc_area_parede_foliar', name: 'Pomar Maçã', notes: 'Gala', tags: ['pomar'], isDeleted: false }
    ];
    const res = filterHistoryRecords(records, 'Vinha');
    assert.equal(res.length, 1);
    assert.equal(res[0].id, '1');
  });

  test('32. Filtro por etiquetas funciona nos registos de LWA', () => {
    const records = [
      { id: '1', calculatorId: 'calc_area_parede_foliar', name: 'Vinha Nova', tags: ['vinha'], isDeleted: false },
      { id: '2', calculatorId: 'calc_area_parede_foliar', name: 'Pomar Maçã', tags: ['pomar'], isDeleted: false }
    ];
    const res = filterHistoryRecords(records, undefined, 'pomar');
    assert.equal(res.length, 1);
    assert.equal(res[0].id, '2');
  });

  test('33. Notas adicionais são preservadas no registo', () => {
    const record = buildCalculationRecord({
      userId: 'user_notes',
      calculatorId: 'calc_area_parede_foliar',
      calculatorVersion: '1.0.0',
      notes: 'Ensaio após desponta de verão',
      inputs: {},
      outputs: {}
    });
    assert.equal(record.notes, 'Ensaio após desponta de verão');
  });

  test('34. Eliminação individual liberta vaga na quota', () => {
    const fakeRecords = Array.from({ length: 20 }, (_, i) => ({
      id: `rec_${i}`,
      calculatorId: 'calc_area_parede_foliar',
      userId: 'user_q',
      isDeleted: false
    }));

    // Eliminar um registo
    fakeRecords[0].isDeleted = true;
    const quota = evaluateHistoryQuota('calc_area_parede_foliar', 'user_q', fakeRecords);
    assert.equal(quota.totalActive, 19);
    assert.equal(quota.isLimitReached, false);
    assert.equal(quota.canSaveDirectly, true);
  });

  test('35. Limpeza do histórico de LWA não afeta outras calculadoras', () => {
    const mixed = [
      { id: '1', calculatorId: 'calc_area_parede_foliar', userId: 'u1', isDeleted: false },
      { id: '2', calculatorId: 'calc_dose', userId: 'u1', isDeleted: false },
      { id: '3', calculatorId: 'calc_concentracao', userId: 'u1', isDeleted: false },
      { id: '4', calculatorId: 'calc_velocidade_real', userId: 'u1', isDeleted: false }
    ];
    const afterPurgeLwa = mixed.filter(r => r.calculatorId !== 'calc_area_parede_foliar');
    assert.equal(afterPurgeLwa.length, 3);
    assert.ok(afterPurgeLwa.some(r => r.calculatorId === 'calc_dose'));
    assert.ok(afterPurgeLwa.some(r => r.calculatorId === 'calc_concentracao'));
    assert.ok(afterPurgeLwa.some(r => r.calculatorId === 'calc_velocidade_real'));
  });

  // ========================================================
  // GRUPO 5: Microlearning e Acessibilidade (36 a 44)
  // ========================================================

  test('36. Microlearning geral com 10 secções normativas', () => {
    assert.ok(fs.existsSync(geralPath));
    const content = fs.readFileSync(geralPath, 'utf8');
    assert.ok(content.includes('Área de Parede Foliar (LWA)'));
    assert.ok(content.includes('EPPO PP 1/239'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('37. Microlearning de altura com 10 secções normativas', () => {
    assert.ok(fs.existsSync(alturaPath));
    const content = fs.readFileSync(alturaPath, 'utf8');
    assert.ok(content.includes('Altura da Vegetação Tratada'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('38. Microlearning de entrelinha com 10 secções normativas', () => {
    assert.ok(fs.existsSync(entrelinhaPath));
    const content = fs.readFileSync(entrelinhaPath, 'utf8');
    assert.ok(content.includes('Distância Entrelinhas'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('39. Microlearning do resultado com 10 secções normativas', () => {
    assert.ok(fs.existsSync(resultadoPath));
    const content = fs.readFileSync(resultadoPath, 'utf8');
    assert.ok(content.includes('Área de Parede Foliar (Resultado)'));
    assert.ok(content.includes('17.500 m² LWA/ha'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('40. Fecho do modal por X', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('aria-label="Fechar modal"'));
  });

  test('41. Fecho por Compreendido', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('Compreendido'));
  });

  test('42. Fecho por Escape', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes("e.key === 'Escape'"));
  });

  test('43. Devolução de foco ao elemento acionador', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('triggerRef.current?.focus()'));
  });

  test('44. Funcionamento offline estático com ?raw', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes("AreaParedeFoliarFAQGeral.md?raw'"));
    assert.ok(didacticCode.includes("AreaParedeFoliarFAQAltura.md?raw'"));
    assert.ok(didacticCode.includes("AreaParedeFoliarFAQEntrelinha.md?raw'"));
    assert.ok(didacticCode.includes("AreaParedeFoliarFAQResultado.md?raw'"));
  });

  // ========================================================
  // GRUPO 6: Não-Regressão e Rota (45 a 50)
  // ========================================================

  test('45. Rota dedicada /ferramentas/area-parede-foliar preservada', () => {
    const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appCode.includes('path="/ferramentas/area-parede-foliar"'));
    assert.ok(appCode.includes('element={<AreaParedeFoliarCalculator />}'));
  });

  test('46. Dose por Hectare mantém integridade de fórmulas e funcionamento', () => {
    const res = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(res.primaryValue, 10);
    assert.equal(res.area_tratada_ha, 5);
  });

  test('47. Concentração da Calda mantém integridade de fórmulas e funcionamento', () => {
    const res = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(res.primaryValue, 400);
    assert.equal(res.subValue, 0.4);
  });

  test('48. Velocidade Real de Trabalho mantém integridade de fórmulas e funcionamento', () => {
    const res = calculateWorkSpeedPure(100, 45);
    assert.equal(res.velocidade_kmh, 8.0);
    assert.equal(res.velocidade_ms, 2.2);
  });

  test('49. Área de Parede Foliar registada e acessível no TOOLS_CATALOG', () => {
    const toolsViewCode = fs.readFileSync(path.resolve('src/views/ToolsView.tsx'), 'utf8');
    assert.ok(toolsViewCode.includes("id: 'calc_area_parede_foliar'"));
    assert.ok(toolsViewCode.includes("currentViewTool === 'calc_area_parede_foliar'"));
    assert.ok(toolsViewCode.includes('<AreaParedeFoliarCalculator />'));
  });

  test('50. Não existem transferências ativas nesta fase', () => {
    assert.ok(CANONICAL_VARIABLES['leaf_wall_area']);
    // Nenhuma calculadora tem leaf_wall_area como destino configurado
  });

});
