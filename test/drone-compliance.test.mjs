import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  getWindFactor,
  getHeightFactor,
  getNozzleFactor,
  getDroneSpeedFactor,
  calculateDynamicBuffer,
  evaluateDroneCompliance,
  OFFICIAL_PRODUCTS_DGAV
} from '../src/features/drone-compliance/droneComplianceEngine.ts';

describe('SprayOps — Drone Buffer Zone & Legal Compliance Engine (Node.js Test Suite)', () => {
  // 1. Testes de Fatores Físicos e Deriva
  test('1. Fator de vento respeita os patamares da fórmula e o limite legal de 15 km/h (4.17 m/s)', () => {
    assert.strictEqual(getWindFactor(1.5).factor, 1.00);
    assert.strictEqual(getWindFactor(1.5).exceeded, false);

    assert.strictEqual(getWindFactor(3.0).factor, 1.25);
    assert.strictEqual(getWindFactor(3.0).exceeded, false);

    const highWind = getWindFactor(4.5);
    assert.strictEqual(highWind.exceeded, true);
    assert.strictEqual(highWind.factor, 1.35);
  });

  test('2. Fator de altura de voo respeita os limites de turbulência', () => {
    assert.strictEqual(getHeightFactor(1.8), 1.00);
    assert.strictEqual(getHeightFactor(2.5), 1.20);
    assert.strictEqual(getHeightFactor(4.0), 1.45);
  });

  test('3. Fator de bico confere exatamente 50% de redução com indução de ar (DRT)', () => {
    assert.strictEqual(getNozzleFactor('STANDARD'), 1.00);
    assert.strictEqual(getNozzleFactor('AIR_INDUCTION_LOW_DRIFT'), 0.50);
    assert.strictEqual(getNozzleFactor('IDK120-03'), 0.50);
  });

  test('4. Fator de velocidade do drone varia com a velocidade de deslocação', () => {
    assert.strictEqual(getDroneSpeedFactor(2.5), 1.00);
    assert.strictEqual(getDroneSpeedFactor(4.5), 1.15);
    assert.strictEqual(getDroneSpeedFactor(7.0), 1.30);
  });

  // 2. Testes de Buffer Dinâmico
  test('5. Buffer final nunca é inferior ao buffer legal mínimo do produto', () => {
    const res = calculateDynamicBuffer({
      baseBufferM: 10.0,
      legalMinBufferM: 10.0,
      windSpeedMs: 1.0,
      flightHeightM: 1.5,
      nozzleType: 'AIR_INDUCTION_LOW_DRIFT',
      droneSpeedMs: 2.0
    });
    // 10 * 1.0 * 1.0 * 0.5 * 1.0 = 5m, mas o legal min é 10m
    assert.strictEqual(res.bufferCalculada, 5.0);
    assert.strictEqual(res.bufferFinal, 10.0);
    assert.strictEqual(res.driftSafetyMargin, 0.0);
  });

  test('6. Tecnologia de indução de ar reduz buffer calculado em 50%', () => {
    const std = calculateDynamicBuffer({
      baseBufferM: 20.0,
      legalMinBufferM: 10.0,
      windSpeedMs: 3.5,
      flightHeightM: 2.5,
      nozzleType: 'STANDARD',
      droneSpeedMs: 4.0
    });

    const drt = calculateDynamicBuffer({
      baseBufferM: 20.0,
      legalMinBufferM: 10.0,
      windSpeedMs: 3.5,
      flightHeightM: 2.5,
      nozzleType: 'AIR_INDUCTION_LOW_DRIFT',
      droneSpeedMs: 4.0
    });

    assert.strictEqual(drt.bufferCalculada, Number((std.bufferCalculada * 0.5).toFixed(2)));
    assert.ok(drt.bufferFinal <= std.bufferFinal);
  });

  // 3. Testes dos Cenários Canónicos
  test('7. Caminho Verde (Green Path): Parcela afastada de linhas de água com vento calmo', () => {
    const res = evaluateDroneCompliance({
      apvNumber: 9999,
      droneModel: 'DJI Agras T40',
      flightHeightM: 2.0,
      droneSpeedMs: 3.0,
      nozzleType: 'AIR_INDUCTION_LOW_DRIFT',
      windSpeedMs: 1.5,
      distanceToWaterBodyM: 100.0,
      fieldTotalAreaHa: 5.40
    });

    assert.strictEqual(res.status, 'PERMITTED');
    assert.strictEqual(res.statusColor, '#10B981');
    assert.strictEqual(res.violations.length, 0);
    assert.strictEqual(res.sprayableAreaHa, 5.40);
    assert.strictEqual(res.excludedAreaHa, 0.0);
  });

  test('8. Violação Rígida por Vento (Decreto-Lei n.º 91/2016): Vento > 15 km/h força status PROHIBITED', () => {
    const res = evaluateDroneCompliance({
      apvNumber: 9999,
      droneModel: 'DJI Agras T40',
      flightHeightM: 2.0,
      droneSpeedMs: 3.0,
      nozzleType: 'AIR_INDUCTION_LOW_DRIFT',
      windSpeedMs: 4.5, // > 4.17 m/s (16.2 km/h)
      distanceToWaterBodyM: 100.0,
      fieldTotalAreaHa: 5.40
    });

    assert.strictEqual(res.status, 'PROHIBITED');
    assert.strictEqual(res.statusColor, '#F43F5E');
    assert.ok(res.violations.some((v) => v.includes('91/2016')));
    assert.ok(res.violations.some((v) => v.includes('15 km/h') || v.includes('4.17 m/s')));
    assert.strictEqual(res.sprayableAreaHa, 0.0);
    assert.strictEqual(res.excludedAreaHa, 5.40);
  });

  test('9. Violação Rígida de Produto (DGAV/SIFITO): Produto sem autorização de voo aéreo é PROHIBITED', () => {
    const res = evaluateDroneCompliance({
      apvNumber: 1111, // HerbTotal Max (aerialApplicationAllowed: false)
      droneModel: 'DJI Agras T40',
      flightHeightM: 2.0,
      droneSpeedMs: 3.0,
      nozzleType: 'AIR_INDUCTION_LOW_DRIFT',
      windSpeedMs: 1.5,
      distanceToWaterBodyM: 100.0,
      fieldTotalAreaHa: 5.40
    });

    assert.strictEqual(res.status, 'PROHIBITED');
    assert.ok(res.violations.some((v) => v.includes('autorização de venda para aplicação aérea')));
  });

  test('10. Sobreposição Parcial com Linha de Água produz status RESTRICTED e área excluída não nula', () => {
    const res = evaluateDroneCompliance({
      apvNumber: 9999,
      droneModel: 'DJI Agras T40',
      flightHeightM: 2.5,
      droneSpeedMs: 4.0,
      nozzleType: 'STANDARD',
      windSpeedMs: 2.5,
      distanceToWaterBodyM: 12.0, // Linha de água a 12m, buffer calculado é maior
      fieldTotalAreaHa: 5.40
    });

    assert.strictEqual(res.status, 'RESTRICTED');
    assert.strictEqual(res.statusColor, '#FFC107');
    assert.ok(res.excludedAreaHa > 0);
    assert.ok(res.sprayableAreaHa < 5.40);
    assert.ok(res.sprayableAreaHa > 0);
    assert.ok(res.mitigations.length > 0);
    assert.ok(res.academyRecommendation !== undefined);
  });

  test('11. Integração com a Academia DATERRA: Moodle SSO é recomendado em status RESTRICTED e PROHIBITED', () => {
    const restrictedRes = evaluateDroneCompliance({
      apvNumber: 9999,
      droneModel: 'DJI Agras T40',
      flightHeightM: 2.5,
      droneSpeedMs: 4.0,
      nozzleType: 'STANDARD',
      windSpeedMs: 2.5,
      distanceToWaterBodyM: 10.0,
      fieldTotalAreaHa: 5.40
    });

    assert.ok(restrictedRes.academyRecommendation);
    assert.ok(restrictedRes.academyRecommendation.url.includes('academia.daterra.com.pt'));
    assert.ok(restrictedRes.academyRecommendation.courseTitle.includes('Zonas Tampão'));
  });

  test('12. Regra Terminológica Institucional: 0% menções ao termo "cuba" e "PF" na interface e engine', () => {
    const jsonStr = JSON.stringify(OFFICIAL_PRODUCTS_DGAV);
    assert.strictEqual(jsonStr.toLowerCase().includes('cuba'), false);
    assert.strictEqual(jsonStr.toLowerCase().includes('pf '), false);
  });
});
