/**
 * DATERRA Smart - Testes da Ferramenta "Velocidade Real de Trabalho"
 * Validação: Motor Matemático EPPO/DGAV, Mapeador Estruturado e Persistência First-Offline Outbox
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { calculateWorkSpeedPure } from '../src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts';
import { buildVelocidadeStructuredValues } from '../src/features/calculators/velocidade-trabalho/velocidadeDataMapper.ts';
import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';
import { buildMutationRecord } from '../src/services/outbox/outboxService.ts';

describe('Ferramenta Canónica: Velocidade Real de Trabalho', () => {

  test('1. Cálculo matemático de velocidade padrão (100 m em 45 s -> 8.0 km/h, 2.2 m/s)', () => {
    const result = calculateWorkSpeedPure(100, 45);

    assert.ok(result.isValid, 'O cálculo deve ser válido');
    assert.equal(result.velocidade_kmh, 8.0, 'v = (3.6 × 100) / 45 = 8.0 km/h');
    assert.equal(result.velocidade_ms, 2.2, 'v = 100 / 45 = 2.2 m/s');
  });

  test('2. Cálculo matemático de velocidade lenta (100 m em 90 s -> 4.0 km/h)', () => {
    const result = calculateWorkSpeedPure(100, 90);

    assert.ok(result.isValid);
    assert.equal(result.velocidade_kmh, 4.0);
    assert.equal(result.velocidade_ms, 1.1);
  });

  test('3. Cálculo com percurso de 50 metros (50 m em 30 s -> 6.0 km/h)', () => {
    const result = calculateWorkSpeedPure(50, 30);

    assert.ok(result.isValid);
    assert.equal(result.velocidade_kmh, 6.0);
    assert.equal(result.velocidade_ms, 1.7);
  });

  test('4. Resiliência a entradas inválidas (zero, negativas, NaN)', () => {
    const resZeroD = calculateWorkSpeedPure(0, 45);
    assert.equal(resZeroD.isValid, false);
    assert.equal(resZeroD.velocidade_kmh, 0);

    const resZeroT = calculateWorkSpeedPure(100, 0);
    assert.equal(resZeroT.isValid, false);
    assert.equal(resZeroT.velocidade_kmh, 0);

    const resNeg = calculateWorkSpeedPure(-100, 45);
    assert.equal(resNeg.isValid, false);

    const resNaN = calculateWorkSpeedPure(NaN, 45);
    assert.equal(resNaN.isValid, false);
  });

  test('5. Estruturação correta de StructuredValues para histórico v2', () => {
    const speed = calculateWorkSpeedPure(100, 45);
    const { inputs, outputs } = buildVelocidadeStructuredValues(100, 45, speed);

    assert.ok(inputs.distanciaPercurso, 'Input de distância deve existir');
    assert.equal(inputs.distanciaPercurso.rawValue, 100);
    assert.equal(inputs.distanciaPercurso.unit, 'm');
    assert.equal(inputs.distanciaPercurso.canonicalKey, 'route_distance');

    assert.ok(inputs.tempoPercurso, 'Input de tempo deve existir');
    assert.equal(inputs.tempoPercurso.rawValue, 45);
    assert.equal(inputs.tempoPercurso.unit, 's');
    assert.equal(inputs.tempoPercurso.canonicalKey, 'route_time');

    assert.ok(outputs.velocidadeReal, 'Output de velocidade deve existir');
    assert.equal(outputs.velocidadeReal.rawValue, 8.0);
    assert.equal(outputs.velocidadeReal.unit, 'km/h');
    assert.equal(outputs.velocidadeReal.subValue, 2.2);
    assert.equal(outputs.velocidadeReal.subUnit, 'm/s');
  });

  test('6. Geração de registo da Mutation Outbox com chave UUIDv4 e synced: 0', () => {
    const idempotencyKey = generateIdempotencyKey();
    assert.match(
      idempotencyKey,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'A chave de idempotência deve ser um UUIDv4 canónico'
    );

    const record = buildMutationRecord({
      entityId: idempotencyKey,
      entityType: 'calculation',
      operation: 'CREATE',
      payload: {
        calculatorId: 'calc_velocidade_real',
        distanciaMeters: 100,
        tempoSeconds: 45,
        velocidadeKmh: 8.0,
        velocidadeMs: 2.2
      }
    });

    assert.equal(record.entityId, idempotencyKey);
    assert.equal(record.entityType, 'calculation');
    assert.equal(record.operation, 'CREATE');
    assert.equal(record.synced, 0, 'Novo registo na Outbox deve iniciar com synced: 0');
    assert.equal(record.attempts, 0);
    assert.equal(record.payload.velocidadeKmh, 8.0);
  });
});
