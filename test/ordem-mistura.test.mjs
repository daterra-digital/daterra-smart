/**
 * DATERRA Smart - Testes da Ferramenta "Ordem de Mistura" (Protocolo W.A.L.E.S.)
 * Validação: Geração da Sequência, Volumes de Água (~50%), Outbox First-Offline e Validação de Depósito
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { generateMixingSequence } from '../src/features/mistura/calculations.ts';
import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';
import { buildMutationRecord } from '../src/services/outbox/outboxService.ts';

describe('Ferramenta Canónica: Ordem de Mistura (Protocolo W.A.L.E.S.)', () => {

  test('1. Geração correta da sequência para formulações padrão (PH, WG, SC, EC, MOL)', () => {
    const selectedIds = ['PH', 'WG', 'SC', 'EC', 'MOL'];
    const tankCapacityL = 1000;

    const result = generateMixingSequence(selectedIds, tankCapacityL);

    assert.ok(result, 'Resultado da análise não pode ser nulo');
    assert.equal(result.tankCapacityL, 1000, 'Capacidade do depósito deve ser 1000 L');
    assert.equal(result.waterInitialL, 500, 'Água inicial deve ser exatamente 50% (500 L)');
    assert.equal(result.waterFinalL, 500, 'Água final deve ser exatamente 50% (500 L)');

    const steps = result.steps;
    assert.ok(steps.length >= 7, 'Devem existir no mínimo 7 passos');
    assert.equal(steps[0].type, 'water_initial', 'Primeiro passo deve ser water_initial');
    
    // Regra agronómica: Adjuvantes (MOL) são adicionados com o depósito cheio no final para evitar espuma
    const waterFinalStep = steps.find(s => s.type === 'water_final');
    assert.ok(waterFinalStep, 'O passo water_final deve existir');
    const lastStep = steps[steps.length - 1];
    assert.equal(lastStep.type, 'adjuvant', 'Com adjuvante (MOL), o último passo deve ser adjuvant');

    // Verificar a ordem cronológica W.A.L.E.S. dos produtos
    const productSteps = steps.filter(s => !s.isWater);
    const siglas = productSteps.map(s => s.sigla);
    assert.deepEqual(siglas, ['PH', 'WG', 'SC', 'EC', 'MOL'], 'As siglas devem respeitar rigorosamente a ordem W.A.L.E.S.');
  });

  test('2. Cálculo proporcional de volumes de água para diferentes tamanhos de depósito', () => {
    const capacities = [400, 600, 800, 1500, 2000, 3000];

    for (const cap of capacities) {
      const res = generateMixingSequence(['SC', 'EC'], cap);
      assert.equal(res.waterInitialL, cap * 0.5, `Água inicial para ${cap}L deve ser ${cap * 0.5}L`);
      assert.equal(res.waterFinalL, cap * 0.5, `Água final para ${cap}L deve ser ${cap * 0.5}L`);
    }
  });

  test('3. Enfileiramento na Mutation Outbox com estrutura First-Offline e UUIDv4', () => {
    const entityId = generateIdempotencyKey();
    const payload = {
      tankCapacityL: 1000,
      selectedFormulationIds: ['WG', 'SC'],
      waterInitialL: 500,
      waterFinalL: 500,
      productsCount: 2
    };

    const outboxRecord = buildMutationRecord({
      entityId,
      entityType: 'mixture',
      operation: 'CREATE',
      payload
    });

    assert.equal(outboxRecord.entityId, entityId);
    assert.equal(outboxRecord.entityType, 'mixture');
    assert.equal(outboxRecord.operation, 'CREATE');
    assert.equal(outboxRecord.synced, 0, 'Registo novo deve ter synced: 0');
    assert.equal(outboxRecord.attempts, 0);
    assert.deepEqual(outboxRecord.payload, payload);
    assert.ok(outboxRecord.updatedAt, 'updatedAt deve estar preenchido');
  });

  test('4. Lista vazia de produtos gera apenas passos de água sem erros', () => {
    const res = generateMixingSequence([], 800);
    assert.equal(res.steps.length, 2, 'Sem produtos, gera apenas água inicial e final');
    assert.equal(res.waterInitialL, 400);
    assert.equal(res.waterFinalL, 400);
  });
});
