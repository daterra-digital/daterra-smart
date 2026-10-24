/**
 * DATERRA Smart - Testes da Ferramenta "Volume de Copa (TRV)"
 * Validação: Fórmula Volumétrica TRV (EPPO PP 1/239), Calda de Referência e Outbox First-Offline
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateTrvExtended,
  buildTrvStructuredValues
} from '../src/features/volume-copa/trvDataMapper.ts';
import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';
import { buildMutationRecord } from '../src/services/outbox/outboxService.ts';

describe('Ferramenta Canónica: Volume de Copa (TRV)', () => {

  test('1. Cálculo volumétrico padrão para pomar (h=3.5m, w=1.2m, r=4.0m -> 10.500 m³ TRV/ha)', () => {
    const res = calculateTrvExtended(3.5, 1.2, 4.0);

    assert.ok(res.isValid, 'Cálculo deve ser válido');
    assert.equal(res.volume_copa, 10500.0, 'TRV = (3.5 × 1.2 × 10.000) / 4.0 = 10.500 m³');
    assert.equal(res.caldaReferenciaLHa, 525, 'Calda referência = 10.500 × 0.05 = 525 L/ha');
    assert.equal(res.caldaMinLHa, 420, 'Calda mínima = 10.500 × 0.04 = 420 L/ha');
    assert.equal(res.caldaMaxLHa, 735, 'Calda máxima = 10.500 × 0.07 = 735 L/ha');
  });

  test('2. Cálculo volumétrico para vinha compacta (h=1.5m, w=0.6m, r=2.5m -> 3.600 m³ TRV/ha)', () => {
    const res = calculateTrvExtended(1.5, 0.6, 2.5);

    assert.ok(res.isValid);
    assert.equal(res.volume_copa, 3600.0);
    assert.equal(res.caldaReferenciaLHa, 180);
    assert.equal(res.caldaMinLHa, 144);
    assert.equal(res.caldaMaxLHa, 252);
  });

  test('3. Resiliência numérica contra entradas inválidas (zero, negativos, NaN)', () => {
    const resZeroH = calculateTrvExtended(0, 1.0, 3.0);
    assert.equal(resZeroH.isValid, false);
    assert.equal(resZeroH.volume_copa, 0);

    const resZeroW = calculateTrvExtended(2.5, 0, 3.0);
    assert.equal(resZeroW.isValid, false);
    assert.equal(resZeroW.volume_copa, 0);

    const resZeroR = calculateTrvExtended(2.5, 1.0, 0);
    assert.equal(resZeroR.isValid, false);
    assert.equal(resZeroR.volume_copa, 0);

    const resNeg = calculateTrvExtended(-2.5, 1.0, 3.0);
    assert.equal(resNeg.isValid, false);

    const resNaN = calculateTrvExtended(NaN, 1.0, 3.0);
    assert.equal(resNaN.isValid, false);
  });

  test('4. Estruturação correta de StructuredValues para histórico v2', () => {
    const res = calculateTrvExtended(2.5, 1.0, 3.0);
    const { inputs, outputs } = buildTrvStructuredValues(2.5, 1.0, 3.0, res.volume_copa);

    assert.ok(inputs.alturaCopa);
    assert.equal(inputs.alturaCopa.rawValue, 2.5);
    assert.equal(inputs.alturaCopa.canonicalKey, 'canopy_height');
    assert.equal(inputs.alturaCopa.unit, 'm');

    assert.ok(inputs.larguraCopa);
    assert.equal(inputs.larguraCopa.rawValue, 1.0);
    assert.equal(inputs.larguraCopa.canonicalKey, 'canopy_width');

    assert.ok(inputs.distanciaEntrelinhas);
    assert.equal(inputs.distanciaEntrelinhas.rawValue, 3.0);
    assert.equal(inputs.distanciaEntrelinhas.canonicalKey, 'row_spacing');

    assert.ok(outputs.volumeCopa);
    assert.equal(outputs.volumeCopa.rawValue, 8333.3);
    assert.equal(outputs.volumeCopa.unit, 'm³ TRV/ha');
  });

  test('5. Enfileiramento na Outbox com chave UUIDv4 e synced: 0', () => {
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
        calculatorId: 'calc_volume_copa',
        alturaCopa: 2.5,
        larguraCopa: 1.0,
        distanciaEntrelinhas: 3.0,
        volumeCopa: 8333.3,
        caldaReferenciaLHa: 417
      }
    });

    assert.equal(record.entityId, idempotencyKey);
    assert.equal(record.entityType, 'calculation');
    assert.equal(record.operation, 'CREATE');
    assert.equal(record.synced, 0, 'Novo registo na Outbox deve iniciar com synced: 0');
    assert.equal(record.attempts, 0);
    assert.equal(record.payload.volumeCopa, 8333.3);
  });
});
