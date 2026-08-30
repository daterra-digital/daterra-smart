/**
 * DATERRA Smart - Testes Unitários da Fase 1 (Fundação de Tipos e Regras)
 * Executado nativamente via Node.js test runner
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { getCanonicalVariable } from '../src/features/calculators/core/canonicalVariables.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';
import {
  convertSimpleUnit,
  evaluateTransformation,
  executeTransformation
} from '../src/features/calculators/core/unitTransformations.ts';
import {
  evaluateHistoryQuota,
  buildCalculationRecord,
  markCalculationAsDeleted
} from '../src/features/calculators/core/historyService.ts';

describe('1. Regras de Quota de Histórico (Limite Estrito de 20 Cálculos)', () => {
  const userId = 'USR-2026-88';
  const toolId = 'calc_dose';

  function generateMockRecords(count, tool = toolId, user = userId, isDeleted = false) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: `mock-${tool}-${i}`,
        userId: user,
        calculatorId: tool,
        calculatorVersion: '1.0.0',
        inputs: {},
        outputs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'local_only',
        isDeleted
      });
    }
    return list;
  }

  test('Permite gravação direta quando existem menos de 20 cálculos ativos', () => {
    const records = generateMockRecords(15);
    const quota = evaluateHistoryQuota(toolId, userId, records);

    assert.equal(quota.totalActive, 15);
    assert.equal(quota.maxAllowed, 20);
    assert.equal(quota.isLimitReached, false);
    assert.equal(quota.canSaveDirectly, true);
  });

  test('Bloqueia gravação direta e assinala limite atingido com exatamente 20 cálculos ativos', () => {
    const records = generateMockRecords(20);
    const quota = evaluateHistoryQuota(toolId, userId, records);

    assert.equal(quota.totalActive, 20);
    assert.equal(quota.isLimitReached, true);
    assert.equal(quota.canSaveDirectly, false);
  });

  test('Ignora cálculos marcados como eliminados (soft-delete) na contagem da quota', () => {
    const activeRecords = generateMockRecords(19);
    const deletedRecords = generateMockRecords(5, toolId, userId, true);
    const allRecords = [...activeRecords, ...deletedRecords];

    const quota = evaluateHistoryQuota(toolId, userId, allRecords);

    assert.equal(quota.totalActive, 19);
    assert.equal(quota.isLimitReached, false);
    assert.equal(quota.canSaveDirectly, true);
  });

  test('Cálculos de outra calculadora ou outro utilizador não interferem na quota', () => {
    const recordsToolA = generateMockRecords(20, 'calc_concentracao', userId);
    const recordsUserB = generateMockRecords(20, toolId, 'USR-OUTRO-99');
    const recordsToolB = generateMockRecords(10, toolId, userId);

    const allRecords = [...recordsToolA, ...recordsUserB, ...recordsToolB];
    const quota = evaluateHistoryQuota(toolId, userId, allRecords);

    assert.equal(quota.totalActive, 10);
    assert.equal(quota.isLimitReached, false);
    assert.equal(quota.canSaveDirectly, true);
  });
});

describe('2. Gestão de Registos de Histórico e Imutabilidade', () => {
  const userId = 'USR-2026-88';

  test('Exige obrigatoriamente userId válido no registo', () => {
    assert.throws(() => {
      buildCalculationRecord({
        userId: '',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0',
        inputs: {},
        outputs: {}
      });
    }, /userId.*obrigatório/i);
  });

  test('Rejeita o marcador técnico legado como userId para novos cálculos', () => {
    assert.throws(() => {
      buildCalculationRecord({
        userId: LEGACY_UNASSIGNED_MARKER,
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0',
        inputs: {},
        outputs: {}
      });
    }, /marcador técnico legado não pode ser utilizado/i);
  });

  test('Gera identificador único e inicializa estado de sincronização e soft-delete', () => {
    const record = buildCalculationRecord({
      userId,
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0',
      inputs: {
        volPreparar: {
          rawValue: 1000,
          unit: 'L',
          dimension: 'volume',
          canonicalKey: 'tank_volume',
          label: 'Volume a Preparar',
          source: 'user_input',
          localId: 'volPreparar',
          calculatorId: 'calc_dose',
          calculatorVersion: '1.0.0'
        }
      },
      outputs: {
        doseResult: {
          rawValue: 10,
          unit: 'L',
          dimension: 'volume',
          canonicalKey: 'product_commercial_quantity',
          label: 'Quantidade Necessária',
          source: 'calculated_output',
          localId: 'doseResult',
          calculatorId: 'calc_dose',
          calculatorVersion: '1.0.0'
        }
      },
      name: 'Ensaio Vinha Trás-os-Montes',
      tags: ['Vinha', 'Ensaio']
    });

    assert.ok(record.id && record.id.length > 5);
    assert.equal(record.userId, userId);
    assert.equal(record.calculatorId, 'calc_dose');
    assert.equal(record.isDeleted, false);
    assert.equal(record.deletedAt, null);
    assert.equal(record.syncStatus, 'local_only');
    assert.equal(record.tags?.length, 2);
  });

  test('Soft-delete preenche deletedAt e marca isDeleted sem apagar o objeto', () => {
    const record = buildCalculationRecord({
      userId,
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0',
      inputs: {},
      outputs: {}
    });

    const deleted = markCalculationAsDeleted(record);

    assert.equal(deleted.isDeleted, true);
    assert.ok(deleted.deletedAt);
    assert.equal(deleted.id, record.id);
  });
});

describe('3. Catálogo de Variáveis Canónicas Partilhadas', () => {
  test('Contém as variáveis agronómicas essenciais homologadas', () => {
    const expectedKeys = [
      'tank_volume',
      'product_dose_rate',
      'spray_volume_rate',
      'concentration',
      'work_speed',
      'working_width',
      'row_spacing',
      'canopy_height',
      'canopy_width',
      'leaf_wall_area',
      'tree_row_volume',
      'total_flow_rate',
      'nozzle_flow_rate',
      'working_pressure',
      'active_nozzles'
    ];

    for (const key of expectedKeys) {
      const def = getCanonicalVariable(key);
      assert.ok(def, `A variável canónica "${key}" deve existir no catálogo.`);
      assert.equal(def.canonicalKey, key);
      assert.ok(def.canonicalUnit, `A variável "${key}" deve ter unidade canónica.`);
      assert.ok(def.allowedUnits.length > 0, `A variável "${key}" deve ter unidades permitidas.`);
    }
  });
});

describe('4. Motor de Unidades: Conversões Simples vs Transformações Agronómicas', () => {
  test('Conversões simples entre unidades da mesma grandeza física (linear)', () => {
    const volumeConv = convertSimpleUnit(1500, 'mL', 'L');
    assert.equal(volumeConv.success, true);
    assert.equal(volumeConv.convertedValue, 1.5);

    const lengthConv = convertSimpleUnit(2.5, 'm', 'cm');
    assert.equal(lengthConv.success, true);
    assert.equal(lengthConv.convertedValue, 250);

    const areaConv = convertSimpleUnit(2, 'ha', 'm²');
    assert.equal(areaConv.success, true);
    assert.equal(areaConv.convertedValue, 20000);
  });

  test('Decisão 22: Bloqueia conversão direta e cega entre L/ha e mL/hL sem volume de calda', () => {
    const doseValue = {
      rawValue: 2,
      unit: 'L/ha',
      dimension: 'application_rate',
      canonicalKey: 'product_dose_rate',
      label: 'Dose por ha',
      source: 'user_input',
      localId: 'dose',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    };

    const evalResult = evaluateTransformation(doseValue, 'concentration', 'mL/hL');

    assert.equal(evalResult.status, 'requires_additional_variables');
    assert.deepEqual(evalResult.requiredVariables, ['spray_volume_rate']);
    assert.ok(evalResult.explanation.includes('Volume de Calda Aplicado'));
  });

  test('Executa transformação com sucesso quando o volume de calda é fornecido no contexto', () => {
    const doseValue = {
      rawValue: 2, // 2 L/ha
      unit: 'L/ha',
      dimension: 'application_rate',
      canonicalKey: 'product_dose_rate',
      label: 'Dose por ha',
      source: 'user_input',
      localId: 'dose',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    };

    const sprayVolValue = {
      rawValue: 200, // 200 L/ha de calda
      unit: 'L/ha',
      dimension: 'application_rate',
      canonicalKey: 'spray_volume_rate',
      label: 'Volume de Calda',
      source: 'user_input',
      localId: 'volCalda',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    };

    // Concentração = (2 * 100.000) / 200 = 1.000 mL/hL (1 L/hL)
    const result = executeTransformation(doseValue, 'concentration', 'mL/hL', {
      spray_volume_rate: sprayVolValue
    });

    assert.equal(result.success, true);
    assert.equal(result.resultValue, 1000);
  });

  test('Rejeita transformação se a variável de contexto necessária estiver em falta ou for nula', () => {
    const doseValue = {
      rawValue: 2,
      unit: 'L/ha',
      dimension: 'application_rate',
      canonicalKey: 'product_dose_rate',
      label: 'Dose por ha',
      source: 'user_input',
      localId: 'dose',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    };

    const result = executeTransformation(doseValue, 'concentration', 'mL/hL', {});

    assert.equal(result.success, false);
    assert.ok(result.error.includes('spray_volume_rate'));
  });
});
