/**
 * DATERRA Smart - Testes da Ferramenta "Tabelas de Débito (Comparador)"
 * Validação: Norma ISO 10625 (Bicos e Cores), Hidráulica de Pressão, Tolerâncias ISO 16122 e Outbox
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  ISO_NOZZLE_COLORS,
  calculateIsoFlow,
  buildDebitoStructuredValues
} from '../src/features/calculators/tabelas-debito/debitoTypes.ts';
import { generateIdempotencyKey } from '../src/services/integrations/centralgestMapper.ts';
import { buildMutationRecord } from '../src/services/outbox/outboxService.ts';

describe('Ferramenta Canónica: Tabelas de Débito (Comparador ISO 10625)', () => {

  test('1. Débitos nominais exatos a 3.0 bar segundo a norma ISO 10625', () => {
    const expected = {
      '01': 0.40,
      '015': 0.60,
      '02': 0.80,
      '025': 1.00,
      '03': 1.20,
      '04': 1.60,
      '05': 2.00,
      '06': 2.40,
      '08': 3.20
    };

    for (const nozzle of ISO_NOZZLE_COLORS) {
      const exp = expected[nozzle.code];
      assert.ok(exp !== undefined, `Bico ${nozzle.code} deve estar registado`);
      assert.equal(nozzle.nominalFlow3Bar, exp, `Bico ${nozzle.code} (${nozzle.namePt}) deve ter ${exp} L/min a 3 bar`);

      const calc = calculateIsoFlow(nozzle.nominalFlow3Bar, 3.0);
      assert.ok(calc.isValid);
      assert.equal(calc.flowLMin, exp);
    }
  });

  test('2. Comportamento hidráulico proporcional à raiz quadrada da pressão (q = q0 * sqrt(P/3))', () => {
    // Amarelo 02 (0.80 L/min a 3 bar) a 12 bar (4x pressão => 2x débito = 1.60 L/min)
    const res12Bar = calculateIsoFlow(0.80, 12.0);
    assert.ok(res12Bar.isValid);
    assert.equal(res12Bar.flowLMin, 1.60);

    // Vermelho 04 (1.60 L/min a 3 bar) a 1.5 bar (0.5x pressão => 1.60 * sqrt(0.5) = 1.13 L/min)
    const res1_5Bar = calculateIsoFlow(1.60, 1.5);
    assert.ok(res1_5Bar.isValid);
    assert.equal(res1_5Bar.flowLMin, 1.13);
  });

  test('3. Cálculo exato da faixa de tolerância de desgaste ISO 16122 (±10%)', () => {
    // Amarelo 02 a 3.0 bar: q = 0.80 L/min
    // Min (-10%) = 0.72 L/min, Max (+10%) = 0.88 L/min
    const calc = calculateIsoFlow(0.80, 3.0);
    assert.equal(calc.flowMinLMin, 0.72, 'Débito mínimo tolerado deve ser 0.72 L/min');
    assert.equal(calc.flowMaxLMin, 0.88, 'Débito máximo tolerado antes de descarte deve ser 0.88 L/min');
  });

  test('4. Resiliência da função hidráulica a valores inválidos ou negativos', () => {
    const resZeroP = calculateIsoFlow(0.80, 0);
    assert.equal(resZeroP.isValid, false);
    assert.equal(resZeroP.flowLMin, 0);

    const resNegP = calculateIsoFlow(0.80, -3.0);
    assert.equal(resNegP.isValid, false);

    const resNaNP = calculateIsoFlow(0.80, NaN);
    assert.equal(resNaNP.isValid, false);

    const resZeroQ = calculateIsoFlow(0, 3.0);
    assert.equal(resZeroQ.isValid, false);
  });

  test('5. Estruturação correta de StructuredValues para histórico v2', () => {
    const nozzle = ISO_NOZZLE_COLORS[2]; // 02 Amarelo
    const flow = calculateIsoFlow(nozzle.nominalFlow3Bar, 3.0);
    const { inputs, outputs } = buildDebitoStructuredValues(nozzle, 3.0, flow);

    assert.ok(inputs.codigoIso);
    assert.equal(inputs.codigoIso.rawValue, '02');
    assert.equal(inputs.codigoIso.canonicalKey, 'nozzle_iso_code');

    assert.ok(inputs.pressaoTrabalho);
    assert.equal(inputs.pressaoTrabalho.rawValue, 3.0);
    assert.equal(inputs.pressaoTrabalho.unit, 'bar');

    assert.ok(outputs.debitoNominal);
    assert.equal(outputs.debitoNominal.rawValue, 0.80);
    assert.equal(outputs.debitoNominal.unit, 'L/min');
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
        calculatorId: 'calc_tabelas_debito',
        isoCode: '02',
        colorName: 'Amarelo',
        nominalFlow3Bar: 0.80,
        pressureBar: 3.0,
        flowLMin: 0.80,
        flowMinLMin: 0.72,
        flowMaxLMin: 0.88
      }
    });

    assert.equal(record.entityId, idempotencyKey);
    assert.equal(record.entityType, 'calculation');
    assert.equal(record.operation, 'CREATE');
    assert.equal(record.synced, 0, 'Novo registo na Outbox deve iniciar com synced: 0');
    assert.equal(record.attempts, 0);
    assert.equal(record.payload.flowLMin, 0.80);
  });
});
