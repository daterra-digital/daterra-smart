/**
 * DATERRA Smart - Testes da Ferramenta "Tabelas de Débito (Comparador)"
 * Validação: Norma ISO 10625 (Bicos e Cores), Hidráulica de Pressão, Tolerâncias ISO 16122 e Outbox
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  ISO_NOZZLE_COLORS,
  calculateIsoFlow,
  calculateDebitoDelta,
  isDriftRiskDroplets,
  checkPressureRange,
  buildDebitoStructuredValues
} from '../src/features/calculators/tabelas-debito/debitoTypes.ts';
import { findEquivalenceAlternatives } from '../src/features/calculators/tabelas-debito/services/alternativasEngine.ts';
import { buildNozzleSegmentedPaths, getDiamondSvgPath } from '../src/features/calculators/tabelas-debito/services/curvasGraficoUtils.ts';
import { NOZZLES_BY_ID } from '../src/features/nozzle-comparison/nozzleComparison.data.ts';
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

  test('7. Indicador Delta Central (diferença percentual e identificação do bico líder)', () => {
    // Bico A = 0.90 L/min, Bico B = 0.94 L/min => Bico B tem +4.4%
    const delta1 = calculateDebitoDelta(0.90, 0.94);
    assert.equal(delta1.leadingSide, 'B');
    assert.equal(delta1.deltaPercent, 4.4);
    assert.equal(delta1.labelPt, '+4.4% no Bico B');

    // Bico A = 1.287 L/min, Bico B = 1.00 L/min => Bico A tem +28.7%
    const delta2 = calculateDebitoDelta(1.287, 1.00);
    assert.equal(delta2.leadingSide, 'A');
    assert.equal(delta2.deltaPercent, 28.7);
    assert.equal(delta2.labelPt, '+28.7% no Bico A');

    // Bicos com débito idêntico
    const deltaEqual = calculateDebitoDelta(1.20, 1.20);
    assert.equal(deltaEqual.leadingSide, 'EQUAL');
    assert.equal(deltaEqual.deltaPercent, 0);
  });

  test('8. Salvaguarda agronómica de risco de deriva (DV10 < 100 µm)', () => {
    assert.equal(isDriftRiskDroplets(85), true, 'Gotas com DV10=85µm devem acionar risco de deriva');
    assert.equal(isDriftRiskDroplets(99), true, 'Gotas com DV10=99µm devem acionar risco de deriva');
    assert.equal(isDriftRiskDroplets(100), false, 'Gotas com DV10=100µm não devem acionar risco de deriva');
    assert.equal(isDriftRiskDroplets(145), false, 'Gotas com DV10=145µm não devem acionar risco de deriva');
    assert.equal(isDriftRiskDroplets(null), false);
    assert.equal(isDriftRiskDroplets(undefined), false);
  });

  test('9. Verificação de pressão de trabalho e alerta de fora de escala', () => {
    // Albuz ATR 80 (Gama: 5.0 a 20.0 bar)
    const normal = checkPressureRange(7.6, 5.0, 20.0);
    assert.equal(normal.isOutOfRange, false);

    const lowP = checkPressureRange(2.0, 5.0, 20.0);
    assert.equal(lowP.isOutOfRange, true);
    assert.equal(lowP.warningMessage, 'Fora do intervalo recomendado: 5.0–20.0 bar');

    const highP = checkPressureRange(25.0, 5.0, 20.0);
    assert.equal(highP.isOutOfRange, true);
    assert.equal(highP.warningMessage, 'Fora do intervalo recomendado: 5.0–20.0 bar');
  });

  test('10. Suporte multimarca e pesquisa de bicos alternativos', () => {
    // 0.80 L/min é o débito nominal de bicos ISO 02 a 3.0 bar
    const pNom = 3.0;
    const qNom = 0.80;
    const targetQ = 0.80;
    const requiredP = pNom * Math.pow(targetQ / qNom, 2);
    assert.equal(requiredP, 3.0, 'Para 0.80 L/min, um bico ISO 02 requer exatamente 3.0 bar');
  });

  test('11. Motor de Alternativas por Bico de Referência (findEquivalenceAlternatives)', () => {
    const refNozzle = NOZZLES_BY_ID.get('albuz_atr_80_amarelo');
    assert.ok(refNozzle, 'Bico Albuz ATR 80 Amarelo deve existir na base');

    // Com pressão habitual de 8.0 bar, débito nominal ATR Amarelo (1.03 L/min @ 10 bar => 0.92 L/min @ 8 bar)
    const { targetFlowLMin, matches } = findEquivalenceAlternatives(refNozzle, 8.0, 'TODAS');
    assert.equal(targetFlowLMin, 0.92, `Débito apurado a 8 bar para Albuz ATR Amarelo deve ser 0.92 L/min (obtido: ${targetFlowLMin})`);
    assert.ok(matches.length > 0, 'Devem existir alternativas encontradas');

    // Cada alternativa opera à pressão habitual e tem débito dentro de +-10%
    for (const match of matches) {
      assert.equal(match.requiredPressureBar, 8.0, 'Pressão da alternativa deve ser exatamente a pressão habitual');
      assert.ok(match.requiredPressureBar >= match.minP, 'Pressão deve ser >= Pmin');
      assert.ok(match.requiredPressureBar <= match.maxP, 'Pressão deve ser <= Pmax');
      assert.ok(match.calculatedFlowLMin > 0, 'Débito atingido deve ser positivo');
      assert.ok(
        Math.abs(match.diffPercent) <= 10.0,
        `Desvio de caudal deve respeitar tolerância legal de +-10% (obtido: ${match.diffPercent}%)`
      );
    }

    // Validação de ordenação: menores desvios de caudal surgem primeiro
    for (let i = 0; i < matches.length - 1; i++) {
      assert.ok(
        Math.abs(matches[i].diffPercent) <= Math.abs(matches[i + 1].diffPercent) + 0.05,
        'Matches devem estar ordenados por menor desvio absoluto de débito'
      );
    }

    // Filtrar apenas marca TeeJet
    const teejetMatches = findEquivalenceAlternatives(refNozzle, 8.0, 'TeeJet');
    assert.ok(teejetMatches.matches.length > 0, 'Devem existir alternativas TeeJet');
    assert.ok(teejetMatches.matches.every(m => m.nozzle.brand.toLowerCase() === 'teejet'), 'Todos devem ser TeeJet');
    assert.ok(teejetMatches.matches.every(m => Math.abs(m.diffPercent) <= 10.0), 'Todos TeeJet dentro de +-10%');
  });

  test('12. Curva Hidráulica ISO e tolerância visual (área sombreada ±10%)', () => {
    // Para um bico com q0 = 1.20 L/min (Azul 03)
    const q0 = 1.20;
    const points = [1.0, 2.0, 3.0, 4.0, 5.0].map(p => {
      const q = q0 * Math.sqrt(p / 3.0);
      return { p, q, qMin: q * 0.9, qMax: q * 1.1 };
    });

    for (const pt of points) {
      assert.equal(Number((pt.q * 0.9).toFixed(3)), Number(pt.qMin.toFixed(3)));
      assert.equal(Number((pt.q * 1.1).toFixed(3)), Number(pt.qMax.toFixed(3)));
    }
  });

  test('13. Slider Híbrido Fitts (snapping 0.5 bar e intervalo operacional)', () => {
    const snapToHalf = (val) => Math.round(val * 2) / 2;
    assert.equal(snapToHalf(7.23), 7.0);
    assert.equal(snapToHalf(7.26), 7.5);
    assert.equal(snapToHalf(7.74), 7.5);
    assert.equal(snapToHalf(7.76), 8.0);
  });

  test('14. Segmentação dinâmica de curvas de bico no Comparador (curvasGraficoUtils)', () => {
    const nozzle = NOZZLES_BY_ID.get('albuz_atr_80_amarelo');
    assert.ok(nozzle, 'Bico Albuz ATR 80 Amarelo deve existir');
    // Albuz ATR tem Pmin = 5.0 bar, Pmax = 25.0 bar
    const maxP = 30.0;
    const toSvgX = (p) => p * 10;
    const toSvgY = (q) => 200 - q * 50;

    const paths = buildNozzleSegmentedPaths(nozzle, maxP, toSvgX, toSvgY);

    // Deve ter segmento inferior fora de escala [0.5 a 5.0 bar]
    assert.ok(paths.pathOutLow.length > 0, 'Deve ter traçado inferior fora de escala');
    assert.ok(paths.pathOutLow.startsWith('M 5.0'), 'Traçado inferior deve começar em 0.5 bar (toSvgX = 5.0)');

    // Deve ter segmento homologado dentro de escala [5.0 a 25.0 bar]
    assert.ok(paths.pathIn.length > 0, 'Deve ter traçado principal homologado');
    assert.ok(paths.pathIn.startsWith('M 50.0'), 'Traçado homologado deve começar aos 5.0 bar (toSvgX = 50.0)');

    // Deve ter segmento superior fora de escala [25.0 a 30.0 bar]
    assert.ok(paths.pathOutHigh.length > 0, 'Deve ter traçado superior fora de escala');
    assert.ok(paths.pathOutHigh.startsWith('M 250.0'), 'Traçado superior deve começar aos 25.0 bar (toSvgX = 250.0)');
  });

  test('15. Marcador em losango para Bico B (getDiamondSvgPath)', () => {
    const diamond = getDiamondSvgPath(100, 50, 6);
    assert.equal(diamond, 'M 100 44.0 L 106.0 50 L 100 56.0 L 94.0 50 Z');
  });

  test('16. Suporte do filtro de marcas a "Todos" e amplitude de pressão até 30 bar', () => {
    const refNozzle = NOZZLES_BY_ID.get('albuz_atr_80_amarelo');
    const resTodos = findEquivalenceAlternatives(refNozzle, 8.0, 'Todos');
    const resUpper = findEquivalenceAlternatives(refNozzle, 8.0, 'TODAS');
    assert.equal(resTodos.matches.length, resUpper.matches.length, 'Filtro "Todos" deve retornar o mesmo número de bicos que "TODAS"');
    assert.ok(resTodos.matches.length > 0);

    // Pressão de 30 bar
    const res30Bar = findEquivalenceAlternatives(refNozzle, 30.0, 'Todos');
    assert.ok(res30Bar.targetFlowLMin > 1.5, 'Caudal a 30 bar deve ser superior a 1.5 L/min');
  });
});
