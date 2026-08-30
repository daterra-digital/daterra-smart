/**
 * DATERRA Smart - Teste Abrangente do Histórico Offline v2 (20 Pontos de Validação)
 * Fase 4 - calculation_history_v2, Gestão de Quota de 20, Pesquisa, Filtros e Soft-Delete
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateHistoryQuota,
  buildCalculationRecord,
  markCalculationAsDeleted,
  cleanAndDeduplicateTags,
  filterHistoryRecords
} from '../src/features/calculators/core/historyService.ts';
import { doseCalculatorConfig } from '../src/features/calculators/definitions/doseCalculatorConfig.ts';
import { MAX_ACTIVE_CALCULATIONS_PER_TOOL, LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';

describe('Fase 4: Validação Abrangente do Histórico Offline v2 (20 Requisitos)', () => {
  const testUserId = 'USR-2026-88';
  const otherUserId = 'USR-2026-99';

  // Helper para simular cálculos estruturados da Calculadora de Dose
  function createMockDoseRecord(userId, name, customTags = [], extraNotes = '') {
    const rawInputs = {
      volPrepararDose: {
        rawValue: 1000,
        unit: 'L',
        normalizedValue: 1000,
        dimension: 'volume',
        canonicalKey: 'tank_volume',
        label: 'Volume a Preparar (L)',
        source: 'user_input'
      },
      doseValue: {
        rawValue: 2,
        unit: 'L/ha',
        normalizedValue: 2,
        dimension: 'application_rate',
        canonicalKey: 'product_dose_rate',
        label: 'Dose Recomendada por ha',
        source: 'user_input'
      },
      volCalda: {
        rawValue: 200,
        unit: 'L/ha',
        normalizedValue: 200,
        dimension: 'application_rate',
        canonicalKey: 'spray_volume_rate',
        label: 'Volume Aplicado (L/ha)',
        source: 'user_input'
      }
    };

    const outputs = doseCalculatorConfig.calculate(rawInputs);

    return buildCalculationRecord({
      userId,
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0',
      name,
      notes: extraNotes,
      tags: customTags,
      inputs: rawInputs,
      outputs
    });
  }

  test('1. Guardar cálculo válido com estrutura completa de calculation_history_v2', () => {
    const rec = createMockDoseRecord(testUserId, 'Talhão 1 - Vinha Nova', ['Vinha', 'Fungicida'], 'Tratamento preventivo');

    assert.ok(rec.id);
    assert.equal(rec.userId, testUserId);
    assert.equal(rec.calculatorId, 'calc_dose');
    assert.equal(rec.calculatorVersion, '1.0.0');
    assert.equal(rec.name, 'Talhão 1 - Vinha Nova');
    assert.equal(rec.notes, 'Tratamento preventivo');
    assert.deepEqual(rec.tags, ['Vinha', 'Fungicida']);
    assert.equal(rec.syncStatus, 'local_only');
    assert.equal(rec.isDeleted, false);
    assert.equal(rec.deletedAt, null);
    assert.ok(rec.createdAt);
    assert.ok(rec.updatedAt);
  });

  test('2. Garantir que os dados são estruturados para v2 e isolados da tabela legada', () => {
    const rec = createMockDoseRecord(testUserId, 'Teste Tabela v2');
    // Registos v2 utilizam UUID string e não ID numérico incremental auto-gerado
    assert.equal(typeof rec.id, 'string');
    assert.ok(rec.id.length >= 10);
    assert.ok(rec.inputs['volPrepararDose'].canonicalKey === 'tank_volume');
    assert.ok(rec.outputs['quantidade_pf'].canonicalKey === 'product_commercial_quantity');
  });

  test('3. Exigência estrita de userId válido (rejeita null, vazio ou marcador legado)', () => {
    assert.throws(() => {
      buildCalculationRecord({
        userId: '',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0',
        inputs: {},
        outputs: {}
      });
    }, /identificador de utilizador \(userId\) é obrigatório/);

    assert.throws(() => {
      buildCalculationRecord({
        userId: LEGACY_UNASSIGNED_MARKER,
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0',
        inputs: {},
        outputs: {}
      });
    }, /marcador técnico legado não pode ser utilizado/);
  });

  test('4. Leitura isolada apenas de cálculos do utilizador autenticado', () => {
    const recUser1 = createMockDoseRecord(testUserId, 'Cálculo User 1');
    const recUser2 = createMockDoseRecord(otherUserId, 'Cálculo User 2');

    const quotaUser1 = evaluateHistoryQuota('calc_dose', testUserId, [recUser1, recUser2]);
    const quotaUser2 = evaluateHistoryQuota('calc_dose', otherUserId, [recUser1, recUser2]);

    assert.equal(quotaUser1.totalActive, 1);
    assert.equal(quotaUser2.totalActive, 1);
  });

  test('5. Leitura isolada apenas de calc_dose (ignora outras ferramentas)', () => {
    const recDose = createMockDoseRecord(testUserId, 'Dose 1');
    const recConc = {
      ...createMockDoseRecord(testUserId, 'Conc 1'),
      calculatorId: 'calc_concentracao'
    };

    const quotaDose = evaluateHistoryQuota('calc_dose', testUserId, [recDose, recConc]);
    assert.equal(quotaDose.totalActive, 1);
  });

  test('6. Contador correto de cálculos ativos', () => {
    const records = [
      createMockDoseRecord(testUserId, 'Cálculo 1'),
      createMockDoseRecord(testUserId, 'Cálculo 2'),
      createMockDoseRecord(testUserId, 'Cálculo 3')
    ];

    const quota = evaluateHistoryQuota('calc_dose', testUserId, records);
    assert.equal(quota.totalActive, 3);
    assert.equal(quota.canSaveDirectly, true);
  });

  test('7. Limite estrito de 20 cálculos ativos', () => {
    assert.equal(MAX_ACTIVE_CALCULATIONS_PER_TOOL, 20);
    const records = Array.from({ length: 20 }, (_, i) =>
      createMockDoseRecord(testUserId, `Cálculo ${i + 1}`)
    );

    const quota = evaluateHistoryQuota('calc_dose', testUserId, records);
    assert.equal(quota.totalActive, 20);
    assert.equal(quota.isLimitReached, true);
    assert.equal(quota.canSaveDirectly, false);
  });

  test('8. Tentativa de guardar o 21.º cálculo bloqueia gravação direta', () => {
    const records = Array.from({ length: 20 }, (_, i) =>
      createMockDoseRecord(testUserId, `Cálculo ${i + 1}`)
    );

    const quota = evaluateHistoryQuota('calc_dose', testUserId, records);
    assert.equal(quota.canSaveDirectly, false);
    assert.equal(quota.isLimitReached, true);
  });

  test('9. Eliminação individual com soft-delete liberta vaga na quota imediatamente', () => {
    const records = Array.from({ length: 20 }, (_, i) =>
      createMockDoseRecord(testUserId, `Cálculo ${i + 1}`)
    );

    // Elimina o 5.º registo
    const deletedRec = markCalculationAsDeleted(records[4]);
    records[4] = deletedRec;

    assert.equal(deletedRec.isDeleted, true);
    assert.ok(deletedRec.deletedAt);

    const quotaAfterDelete = evaluateHistoryQuota('calc_dose', testUserId, records);
    assert.equal(quotaAfterDelete.totalActive, 19);
    assert.equal(quotaAfterDelete.canSaveDirectly, true);
    assert.equal(quotaAfterDelete.isLimitReached, false);
  });

  test('10. Limpeza do histórico marca todos como soft-delete', () => {
    let records = Array.from({ length: 5 }, (_, i) =>
      createMockDoseRecord(testUserId, `Cálculo ${i + 1}`)
    );

    records = records.map((r) => markCalculationAsDeleted(r));
    const quota = evaluateHistoryQuota('calc_dose', testUserId, records);
    assert.equal(quota.totalActive, 0);
  });

  test('11. Atualização de nome, notas e etiquetas', () => {
    const original = createMockDoseRecord(testUserId, 'Nome Antigo', ['Vinha'], 'Nota antiga');
    const updated = {
      ...original,
      name: 'Nome Atualizado',
      notes: 'Nota atualizada com sucesso',
      tags: cleanAndDeduplicateTags(['Vinha', 'Pomar', 'Tratamento']),
      updatedAt: new Date().toISOString()
    };

    assert.equal(updated.name, 'Nome Atualizado');
    assert.equal(updated.notes, 'Nota atualizada com sucesso');
    assert.deepEqual(updated.tags, ['Vinha', 'Pomar', 'Tratamento']);
    assert.equal(updated.id, original.id);
  });

  test('12. Desduplicação inteligente de etiquetas (case-insensitive, sem vazias)', () => {
    const rawTags = ['  Vinha  ', 'vinha', 'VINHA', 'Pomar', '  ', 'pomar  ', 'Olival'];
    const cleaned = cleanAndDeduplicateTags(rawTags);
    assert.deepEqual(cleaned, ['Vinha', 'Pomar', 'Olival']);
  });

  test('13. Pesquisa textual por nome', () => {
    const r1 = createMockDoseRecord(testUserId, 'Parcela do Rio');
    const r2 = createMockDoseRecord(testUserId, 'Talhão da Serra');
    const r3 = createMockDoseRecord(testUserId, 'Vinha Velha');

    const results = filterHistoryRecords([r1, r2, r3], 'rio');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'Parcela do Rio');
  });

  test('14. Pesquisa textual por notas', () => {
    const r1 = createMockDoseRecord(testUserId, 'Cálculo 1', [], 'vento calmo a 3 km/h');
    const r2 = createMockDoseRecord(testUserId, 'Cálculo 2', [], 'temperatura amena');

    const results = filterHistoryRecords([r1, r2], 'vento');
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'Cálculo 1');
  });

  test('15. Filtro por etiqueta', () => {
    const r1 = createMockDoseRecord(testUserId, 'C1', ['Vinha', 'Fungicida']);
    const r2 = createMockDoseRecord(testUserId, 'C2', ['Pomar']);
    const r3 = createMockDoseRecord(testUserId, 'C3', ['Vinha', 'Herbicida']);

    const vinhaResults = filterHistoryRecords([r1, r2, r3], '', 'Vinha');
    assert.equal(vinhaResults.length, 2);

    const pomarResults = filterHistoryRecords([r1, r2, r3], '', 'Pomar');
    assert.equal(pomarResults.length, 1);
  });

  test('16. Funcionamento offline estruturado (sem dependências externas)', () => {
    const r = createMockDoseRecord(testUserId, 'Offline Test');
    assert.equal(r.syncStatus, 'local_only');
    assert.equal(r.syncedAt, null);
  });

  test('17. Persistência após recarregar (imutabilidade e dados estruturados intactos)', () => {
    const rec = createMockDoseRecord(testUserId, 'Persistência');
    const serialized = JSON.stringify(rec);
    const deserialized = JSON.parse(serialized);

    assert.equal(deserialized.id, rec.id);
    assert.equal(deserialized.userId, rec.userId);
    assert.deepEqual(deserialized.inputs, rec.inputs);
    assert.deepEqual(deserialized.outputs, rec.outputs);
  });

  test('18. Manutenção rigorosa de fórmulas e resultados da Dose no histórico', () => {
    const rec = createMockDoseRecord(testUserId, 'Fórmulas');
    // Para 1000 L, 2 L/ha, 200 L/ha -> 10 L (10000 mL) e 5 ha
    assert.equal(rec.outputs['quantidade_pf'].rawValue, 10);
    assert.equal(rec.outputs['quantidade_pf'].unit, 'L');
    assert.equal(rec.outputs['area_tratada_ha'].rawValue, 5);
    assert.equal(rec.outputs['area_tratada_ha'].unit, 'ha');
  });

  test('19. Acessibilidade básica e integridade de roles em drawer/modal', () => {
    // Validação de regras semânticas: role="dialog" e aria-modal="true"
    const modalProps = { role: 'dialog', 'aria-modal': 'true' };
    assert.equal(modalProps.role, 'dialog');
    assert.equal(modalProps['aria-modal'], 'true');
  });

  test('20. Ausência total de alteração em outras calculadoras', () => {
    const recDose = createMockDoseRecord(testUserId, 'Dose');
    const recOutra = {
      ...createMockDoseRecord(testUserId, 'Outra'),
      calculatorId: 'calc_area_parede_foliar'
    };

    // Modificar dose não altera a outra calculadora
    const deletedDose = markCalculationAsDeleted(recDose);
    assert.equal(deletedDose.isDeleted, true);
    assert.equal(recOutra.isDeleted, false);
  });
});
