// src/lib/__tests__/calibration-eppo-bridge.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCalibrationEppoBalance,
  evaluateContextualDriftRisk
} from '../agri-math/calibration-eppo-bridge.ts';

describe('Ponte Agronómica EPPO PP 1/239 & Risco Contextual de Deriva', () => {
  it('1. Calcula volume hidráulico L/ha, pisos técnicos mínimos e rejeita entradas inválidas', () => {
    const res = computeCalibrationEppoBalance({
      debitoTotalLMin: 12.0,
      velocidadeKmh: 6.0,
      entrelinhaM: 3.0,
      culturaTipologia: '3D_COPA',
      volumeRecomendadoEppoLHa: 400
    });
    assert.equal(res.isValid, true);
    assert.equal(res.volumeCalibradoLHa, 400);
    assert.equal(res.desvioPercentual, 0);
    assert.equal(res.estadoConformidade, 'ALINHADO_REF_EPPO');
    assert.equal(res.pisoMecanicoMinLHa, 100);
    assert.equal(res.abaixoPisoMecanico, false);

    const droneLow = computeCalibrationEppoBalance({
      debitoTotalLMin: 2.0,
      velocidadeKmh: 10.0,
      entrelinhaM: 6.0,
      culturaTipologia: '2D',
      isDroneUav: true
    });
    assert.equal(droneLow.isValid, true);
    assert.equal(droneLow.volumeCalibradoLHa, 20);
    assert.equal(droneLow.pisoMecanicoMinLHa, 15);
    assert.equal(droneLow.abaixoPisoMecanico, false);

    const badSpeed = computeCalibrationEppoBalance({ debitoTotalLMin: 10, velocidadeKmh: 0, entrelinhaM: 3 });
    assert.equal(badSpeed.isValid, false);
    assert.equal(badSpeed.errorCode, 'INVALID_SPEED');
  });

  it('2. Aplica hierarquia preferencial ISO 10625 antes da velocidade/pressão quando |desvio| > 10%', () => {
    const res = computeCalibrationEppoBalance({
      debitoTotalLMin: 18.0,
      velocidadeKmh: 6.0,
      entrelinhaM: 3.0,
      pressaoBar: 3.0,
      numBicosAtivos: 12,
      culturaTipologia: '3D_COPA',
      volumeRecomendadoEppoLHa: 400
    });
    assert.equal(res.volumeCalibradoLHa, 600);
    assert.equal(res.estadoConformidade, 'ACIMA_REF_EPPO');
    assert.ok(res.recomendacaoBico !== null, 'Deve sugerir calibre de bico ISO 10625');
    // À velocidade segura de referência (6,0 km/h): Q_alvo = (400 * 6,0 * 3,0) / 600 = 12,0 L/min -> 1,0 L/min por bico (ISO 025 Lilás @ 3 bar)
    assert.equal(res.recomendacaoBico?.debitoTotalAlvoLMin, 12);
    assert.equal(res.recomendacaoBico?.debitoPorBicoAlvoLMin, 1);
    assert.equal(res.recomendacaoBico?.calibreIso, '025');
    assert.equal(res.recomendacaoBico?.corIso, 'Lilás');
    assert.ok(res.recomendacaoBico?.sugestaoBicoIso.includes('ISO 025'));
  });

  it('3. Respeita os limites do envelope seguro de velocidade (4,0–7,5 km/h em 3D e 6,0–12,0 km/h em 2D)', () => {
    const tooFast3d = computeCalibrationEppoBalance({
      debitoTotalLMin: 18.0,
      velocidadeKmh: 6.0,
      entrelinhaM: 3.0,
      culturaTipologia: '3D_COPA',
      volumeRecomendadoEppoLHa: 300
    });
    // velocidadeTeoricaKmh = (18 * 600) / (300 * 3) = 12,0 km/h -> fora do envelope 4,0–7,5 km/h
    assert.deepEqual(tooFast3d.envelopeVelocidade, { minKmh: 4.0, maxKmh: 7.5, referenciaKmh: 6.0 });
    assert.equal(tooFast3d.velocidadeTeoricaKmh, 12);
    assert.equal(tooFast3d.velocidadeSugeridaSeguraKmh, 7.5);
    assert.equal(tooFast3d.velocidadeForaEnvelope, true);
    assert.ok(tooFast3d.alertaVelocidadePt && tooFast3d.alertaVelocidadePt.includes('4,0–7,5 km/h'));

    const inside2d = computeCalibrationEppoBalance({
      debitoTotalLMin: 16.0,
      velocidadeKmh: 8.0,
      entrelinhaM: 12.0,
      culturaTipologia: '2D',
      volumeRecomendadoEppoLHa: 120
    });
    assert.deepEqual(inside2d.envelopeVelocidade, { minKmh: 6.0, maxKmh: 12.0, referenciaKmh: 8.0 });
    assert.equal(inside2d.velocidadeTeoricaKmh, 6.67);
    assert.equal(inside2d.velocidadeForaEnvelope, false);
  });

  it('4. Calcula retenção foliar TRV/LWA e caudal de ar 3D ótimo', () => {
    const highTrv = computeCalibrationEppoBalance({
      debitoTotalLMin: 12.0,
      velocidadeKmh: 6.0,
      entrelinhaM: 3.0,
      culturaTipologia: '3D_COPA',
      trvM3Ha: 3000,
      lwaM2Ha: 10000,
      caudalArAplicadoM3H: 1200
    });
    assert.equal(highTrv.litrosPor1000m3Trv, 133.33);
    assert.equal(highTrv.alertaRetencaoTrv, 'ESCORRIMENTO');
    assert.equal(highTrv.litrosPor10000m2Lwa, 400);
    assert.equal(highTrv.caudalArSugeridoM3H, 1800);
    assert.equal(highTrv.estadoVentilacao3D, 'SUBVENTILACAO');
  });

  it('5. Aplica bloqueio rígido de vento (> 4,0 m/s terrestre; > 4,17 m/s drone) e preserva null offline', () => {
    const blockedGround = evaluateContextualDriftRisk({
      culturaTipologia: '3D_COPA',
      isDroneUav: false,
      pressaoBar: 5,
      weather: { ventoMs: 4.1, rajadaMs: 5.2, deltaT: 6.5, vpd: 1.4 }
    });
    assert.equal(blockedGround.bloqueioRigido, true);
    assert.equal(blockedGround.nivelRisco, 'CRITICO_BLOQUEADO');
    assert.equal(blockedGround.limiteVentoMs, 4.0);

    const droneAllowed = evaluateContextualDriftRisk({
      culturaTipologia: '2D',
      isDroneUav: true,
      pressaoBar: 3,
      weather: { ventoMs: 4.1, rajadaMs: 4.8, deltaT: 5.0, vpd: 1.1 }
    });
    assert.equal(droneAllowed.bloqueioRigido, false);
    assert.equal(droneAllowed.limiteVentoMs, 4.17);

    const offline = evaluateContextualDriftRisk({
      culturaTipologia: '3D_COPA',
      pressaoBar: 4,
      weather: null
    });
    assert.equal(offline.meteorologiaDisponivel, false);
    assert.equal(offline.nivelRisco, 'INDETERMINADO');
    assert.equal(offline.ventoMs, null);
    assert.equal(offline.scoreRisco, null);
  });
});
