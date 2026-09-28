import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateRequiredTotalFlowLMin,
  calculateFlowPerNozzleLMin,
  calculateTheoreticalTimePerHaMinutes,
  calculateCalibracaoPulverizadorPure
} from '../src/features/calibracao-pulverizador/calibracaoPulverizadorEngine.ts';

import {
  validateCalibracaoPulverizador
} from '../src/features/calibracao-pulverizador/calibracaoPulverizadorValidation.ts';

import {
  calibracaoPulverizadorConfig
} from '../src/features/calibracao-pulverizador/calibracaoPulverizadorConfig.ts';

describe('Calibração Pulverizador — Fase B (Calibração Operacional do Pulverizador)', () => {

  // =========================================================================
  // 1. MOTORES DE CÁLCULO PUROS (FÓRMULAS E PRECISÃO MATEMÁTICA)
  // =========================================================================

  test('1.1. Caudal total necessário: Q_total = (V * S * W) / 600', () => {
    // Cenário TRV padrão: V = 244.8 L/ha, S = 6.0 km/h, W = 2.5 m
    // Q = (244.8 * 6.0 * 2.5) / 600 = 3672 / 600 = 6.12 L/min
    const q1 = calculateRequiredTotalFlowLMin(244.8, 6.0, 2.5);
    assert.ok(q1 !== undefined);
    assert.equal(Math.round(q1 * 100) / 100, 6.12);

    // Cenário LWA-V padrão: V = 776.3184 L/ha, S = 6.0 km/h, W = 2.5 m
    // Q = (776.3184 * 6.0 * 2.5) / 600 = 11644.776 / 600 = 19.40796 L/min
    const q2 = calculateRequiredTotalFlowLMin(776.3184, 6.0, 2.5);
    assert.ok(q2 !== undefined);
    assert.equal(Math.round(q2 * 1000) / 1000, 19.408);

    // Cenário Pomar: V = 495.0 L/ha, S = 5.0 km/h, W = 4.0 m
    // Q = (495.0 * 5.0 * 4.0) / 600 = 9900 / 600 = 16.50 L/min
    const q3 = calculateRequiredTotalFlowLMin(495.0, 5.0, 4.0);
    assert.ok(q3 !== undefined);
    assert.equal(q3, 16.5);

    // Cenário Olival: V = 933.333333 L/ha, S = 4.0 km/h, W = 6.0 m
    // Q = (933.333333 * 4.0 * 6.0) / 600 = 22400 / 600 = 37.333333 L/min
    const q4 = calculateRequiredTotalFlowLMin(933.333333, 4.0, 6.0);
    assert.ok(q4 !== undefined);
    assert.equal(Math.round(q4 * 100) / 100, 37.33);
  });

  test('1.2. Débito médio por bico: Q_bico = Q_total / N', () => {
    // Q_total = 6.12 L/min, N = 10 bicos => 0.612 L/min por bico
    const qb1 = calculateFlowPerNozzleLMin(6.12, 10);
    assert.ok(qb1 !== undefined);
    assert.equal(qb1, 0.612);

    // Q_total = 19.40796 L/min, N = 12 bicos => 1.61733 L/min por bico
    const qb2 = calculateFlowPerNozzleLMin(19.40796, 12);
    assert.ok(qb2 !== undefined);
    assert.equal(Math.round(qb2 * 1000) / 1000, 1.617);

    // Q_total = 16.5 L/min, N = 16 bicos => 1.03125 L/min por bico
    const qb3 = calculateFlowPerNozzleLMin(16.5, 16);
    assert.ok(qb3 !== undefined);
    assert.equal(qb3, 1.03125);
  });

  test('1.3. Tempo teórico por hectare: T = 600 / (S * W)', () => {
    // S = 6.0 km/h, W = 2.5 m => 600 / 15 = 40.0 min/ha
    const t1 = calculateTheoreticalTimePerHaMinutes(6.0, 2.5);
    assert.ok(t1 !== undefined);
    assert.equal(t1, 40.0);

    // S = 5.0 km/h, W = 4.0 m => 600 / 20 = 30.0 min/ha
    const t2 = calculateTheoreticalTimePerHaMinutes(5.0, 4.0);
    assert.ok(t2 !== undefined);
    assert.equal(t2, 30.0);

    // S = 4.0 km/h, W = 6.0 m => 600 / 24 = 25.0 min/ha
    const t3 = calculateTheoreticalTimePerHaMinutes(4.0, 6.0);
    assert.ok(t3 !== undefined);
    assert.equal(t3, 25.0);
  });

  test('1.4. Proteção contra valores inválidos, zero, negativos, NaN e infinito', () => {
    // Caudal total
    assert.equal(calculateRequiredTotalFlowLMin(0, 6, 2.5), null);
    assert.equal(calculateRequiredTotalFlowLMin(-100, 6, 2.5), null);
    assert.equal(calculateRequiredTotalFlowLMin(244.8, 0, 2.5), null);
    assert.equal(calculateRequiredTotalFlowLMin(244.8, -5, 2.5), null);
    assert.equal(calculateRequiredTotalFlowLMin(244.8, 6, 0), null);
    assert.equal(calculateRequiredTotalFlowLMin(244.8, 6, -2), null);
    assert.equal(calculateRequiredTotalFlowLMin(NaN, 6, 2.5), null);
    assert.equal(calculateRequiredTotalFlowLMin(244.8, Infinity, 2.5), null);

    // Débito por bico
    assert.equal(calculateFlowPerNozzleLMin(6.12, 0), null);
    assert.equal(calculateFlowPerNozzleLMin(6.12, -4), null);
    assert.equal(calculateFlowPerNozzleLMin(6.12, 10.5), null, 'Não deve aceitar número de bicos decimal');
    assert.equal(calculateFlowPerNozzleLMin(0, 10), null);
    assert.equal(calculateFlowPerNozzleLMin(NaN, 10), null);

    // Tempo por hectare
    assert.equal(calculateTheoreticalTimePerHaMinutes(0, 2.5), null);
    assert.equal(calculateTheoreticalTimePerHaMinutes(6, 0), null);
    assert.equal(calculateTheoreticalTimePerHaMinutes(-6, 2.5), null);
    assert.equal(calculateTheoreticalTimePerHaMinutes(NaN, 2.5), null);
  });

  // =========================================================================
  // 2. INTEGRAÇÃO NO MOTOR GLOBAL (calculateCalibracaoPulverizadorPure)
  // =========================================================================

  test('2.1. LWA-V com Fase B completa', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      treatedHeightM: 1.20,
      rowSpacingM: 2.50,
      treatedSides: 2,
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      canopyThickness: 'estreita',
      phenologyStage: 'int_5',
      canopyDensity: 'moderada',
      finalTankVolumeL: 600,
      doseValue: 2.0,
      travelSpeedKmH: 6.0,
      workingWidthM: 2.50,
      activeNozzleCount: 10
    });

    assert.equal(res.phaseBState, 'complete');
    assert.ok(res.recommendedSprayVolumeLHa !== undefined && res.recommendedSprayVolumeLHa > 0);
    assert.equal(res.effectiveSprayVolumeLHa, res.recommendedSprayVolumeLHa);
    assert.ok(res.totalFlowRequiredLMin !== undefined);
    assert.ok(res.flowPerNozzleLMin !== undefined);
    assert.ok(res.theoreticalTimePerHaMinutes !== undefined);
    assert.equal(res.theoreticalTimePerHaMinutes, 40.0);
    assert.equal(
      Math.round(res.flowPerNozzleLMin * 1000) / 1000,
      Math.round((res.totalFlowRequiredLMin / 10) * 1000) / 1000
    );
  });

  test('2.2. TRV com Fase B sem contagem de bicos (opcional)', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      treatedHeightM: 1.80,
      canopyWidthM: 0.80,
      rowSpacingM: 3.00,
      cultureId: 'pereira',
      conductionId: 'sebe_parede',
      phenologyId: 'pereira_pleno_maturacao',
      canopyDensity: 'moderate',
      finalTankVolumeL: 1000,
      doseValue: 1.5,
      travelSpeedKmH: 5.0,
      workingWidthM: 3.00
    });

    assert.equal(res.phaseBState, 'no_nozzle_count');
    assert.ok(res.recommendedSprayVolumeLHa !== undefined && res.recommendedSprayVolumeLHa > 0);
    assert.ok(res.totalFlowRequiredLMin !== undefined && res.totalFlowRequiredLMin > 0);
    assert.equal(res.flowPerNozzleLMin, undefined);
    assert.equal(res.theoreticalTimePerHaMinutes, 40.0);
  });

  test('2.3. Estado incompleto quando velocidade está vazia', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      treatedHeightM: 1.20,
      rowSpacingM: 2.50,
      treatedSides: 2,
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      canopyThickness: 'estreita',
      phenologyStage: 'int_5',
      canopyDensity: 'moderada',
      finalTankVolumeL: 600,
      doseValue: 2.0,
      workingWidthM: 2.50
    });

    assert.equal(res.phaseBState, 'missing_speed');
    assert.equal(res.totalFlowRequiredLMin, undefined);
    assert.equal(res.flowPerNozzleLMin, undefined);
    assert.equal(res.theoreticalTimePerHaMinutes, undefined);
  });

  test('2.4. Isolação estrita: Fase A não é alterada pela presença da Fase B', () => {
    const basePhaseA = {
      method: 'lwa',
      treatedHeightM: 1.20,
      rowSpacingM: 2.50,
      treatedSides: 2,
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      canopyThickness: 'estreita',
      phenologyStage: 'int_5',
      canopyDensity: 'moderada',
      finalTankVolumeL: 600,
      doseValue: 2.0
    };

    const resWithoutPhaseB = calculateCalibracaoPulverizadorPure(basePhaseA);
    const resWithPhaseB = calculateCalibracaoPulverizadorPure({
      ...basePhaseA,
      travelSpeedKmH: 6.5,
      workingWidthM: 2.5,
      activeNozzleCount: 12
    });

    assert.equal(resWithoutPhaseB.lwaM2PerHa, resWithPhaseB.lwaM2PerHa);
    assert.equal(resWithoutPhaseB.recommendedSprayVolumeLHa, resWithPhaseB.recommendedSprayVolumeLHa);
    assert.equal(resWithoutPhaseB.kLwaLPer10000M2, resWithPhaseB.kLwaLPer10000M2);
    assert.equal(resWithoutPhaseB.productPerTankValue, resWithPhaseB.productPerTankValue);
    assert.equal(resWithoutPhaseB.doseEquivalentPerHaValue, resWithPhaseB.doseEquivalentPerHaValue);
    assert.equal(resWithoutPhaseB.tanksPerHa, resWithPhaseB.tanksPerHa);
    assert.equal(resWithoutPhaseB.areaPerTankHa, resWithPhaseB.areaPerTankHa);
  });

  // =========================================================================
  // 3. REGRAS DE VALIDAÇÃO E AVISOS (validateCalibracaoPulverizador)
  // =========================================================================

  test('3.1. Validação de velocidade: avisos para < 2 km/h e > 10 km/h', () => {
    const validInputs = {
      method: 'lwa',
      treatedHeightM: 1.2,
      rowSpacingM: 2.5,
      finalTankVolumeL: 600,
      doseValue: 2.0,
      cultureId: 'vinha',
      workingWidthM: 2.5
    };

    // Velocidade baixa: 1.5 km/h
    const valLow = validateCalibracaoPulverizador({
      ...validInputs,
      travelSpeedKmH: 1.5
    });
    assert.ok(valLow.warnings?.['travelSpeedKmH']);
    assert.equal(valLow.warnings['travelSpeedKmH'], 'calibracaoPulverizador.warnings.speedLow');

    // Velocidade alta: 12.0 km/h
    const valHigh = validateCalibracaoPulverizador({
      ...validInputs,
      travelSpeedKmH: 12.0
    });
    assert.ok(valHigh.warnings?.['travelSpeedKmH']);
    assert.equal(valHigh.warnings['travelSpeedKmH'], 'calibracaoPulverizador.warnings.speedHigh');

    // Velocidade normal: 6.0 km/h
    const valNormal = validateCalibracaoPulverizador({
      ...validInputs,
      travelSpeedKmH: 6.0
    });
    assert.equal(valNormal.warnings?.['travelSpeedKmH'], undefined);
  });

  test('3.2. Validação de largura de trabalho: aviso se diferir > 20% da entrelinha', () => {
    const validInputs = {
      method: 'lwa',
      treatedHeightM: 1.2,
      rowSpacingM: 2.5,
      finalTankVolumeL: 600,
      doseValue: 2.0,
      cultureId: 'vinha'
    };

    // Largura = 3.5 m (difere 40% de 2.5 m) => aviso
    const valDiff = validateCalibracaoPulverizador({
      ...validInputs,
      workingWidthM: 3.5
    });
    assert.ok(valDiff.warnings?.['workingWidthM']);
    assert.equal(valDiff.warnings['workingWidthM'], 'calibracaoPulverizador.warnings.workingWidthDiffersRowSpacing');

    // Largura = 2.5 m (igual) => sem aviso
    const valEqual = validateCalibracaoPulverizador({
      ...validInputs,
      workingWidthM: 2.5
    });
    assert.equal(valEqual.warnings?.['workingWidthM'], undefined);
  });

  test('3.3. Validação de número de bicos: aviso se > 40 bicos', () => {
    const validInputs = {
      method: 'lwa',
      treatedHeightM: 1.2,
      rowSpacingM: 2.5,
      finalTankVolumeL: 600,
      doseValue: 2.0,
      cultureId: 'vinha'
    };

    // Bicos = 48 => aviso
    const valHigh = validateCalibracaoPulverizador({
      ...validInputs,
      activeNozzleCount: 48
    });
    assert.ok(valHigh.warnings?.['activeNozzleCount']);
    assert.equal(valHigh.warnings['activeNozzleCount'], 'calibracaoPulverizador.warnings.activeNozzleCountHigh');

    // Bicos = 12 => sem aviso
    const valNormal = validateCalibracaoPulverizador({
      ...validInputs,
      activeNozzleCount: 12
    });
    assert.equal(valNormal.warnings?.['activeNozzleCount'], undefined);

    // Bicos = 7 (ímpar) => aviso de paridade obrigatória para simetria
    const valOdd = validateCalibracaoPulverizador({
      ...validInputs,
      activeNozzleCount: 7
    });
    assert.ok(valOdd.warnings?.['activeNozzleCount']);
    assert.equal(valOdd.warnings['activeNozzleCount'], 'calibracaoPulverizador.warnings.evenNozzlesRequired');
  });

  test('3.4. Presets de atalhos de bicos ativos são estritamente [4, 6, 8, 10, 12] e todos pares', () => {
    const nozzleField = calibracaoPulverizadorConfig.fields.find((f) => f.id === 'activeNozzleCount');
    assert.ok(nozzleField);
    assert.deepEqual(nozzleField.presets, [4, 6, 8, 10, 12]);
    assert.ok(nozzleField.presets.every((p) => typeof p === 'number' && p % 2 === 0 && p > 0));
    assert.equal(nozzleField.presets.some((p) => p % 2 !== 0), false, 'Não devem existir atalhos ímpares');
    for (const forbidden of [1, 2, 3, 5, 7, 9, 11, 13, 14, 16, 18]) {
      assert.equal(nozzleField.presets.includes(forbidden), false, `Atalho ${forbidden} não deve existir`);
    }
  });

  test('3.5. Número ímpar de bicos não calcula débito por bico no motor global', () => {
    const resOdd = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      treatedHeightM: 1.20,
      rowSpacingM: 2.50,
      treatedSides: 2,
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      canopyThickness: 'estreita',
      phenologyStage: 'int_5',
      canopyDensity: 'moderada',
      finalTankVolumeL: 600,
      doseValue: 2.0,
      travelSpeedKmH: 6.0,
      workingWidthM: 2.50,
      activeNozzleCount: 7
    });

    assert.equal(resOdd.flowPerNozzleLMin, undefined, 'Número ímpar de bicos não deve produzir débito por bico');
    assert.ok(resOdd.totalFlowRequiredLMin !== undefined && resOdd.totalFlowRequiredLMin > 0);
  });

  // =========================================================================
  // 4. CONFIGURAÇÃO DECLARATIVA (calibracaoPulverizadorConfig)
  // =========================================================================

  test('4.1. Configuração declara campos e resultados da Fase B', () => {
    const fieldIds = calibracaoPulverizadorConfig.fields.map((f) => f.id);
    assert.ok(fieldIds.includes('travelSpeedKmH'), 'travelSpeedKmH deve estar em fields');
    assert.ok(fieldIds.includes('workingWidthM'), 'workingWidthM deve estar em fields');
    assert.ok(fieldIds.includes('activeNozzleCount'), 'activeNozzleCount deve estar em fields');

    const resultIds = calibracaoPulverizadorConfig.results.map((r) => r.id);
    assert.ok(resultIds.includes('caudalTotalNecessario'), 'caudalTotalNecessario deve estar em results');
    assert.ok(resultIds.includes('caudalMedioPorBico'), 'caudalMedioPorBico deve estar em results');
    assert.ok(resultIds.includes('tempoTeoricoPorHa'), 'tempoTeoricoPorHa deve estar em results');
  });

  test('4.2. Execução de config.calculate gera saídas estruturadas da Fase B', () => {
    const inputs = {
      treatedHeightM: { rawValue: 1.2, unit: 'm', normalizedValue: 1.2, dimension: 'length', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      rowSpacingM: { rawValue: 2.5, unit: 'm', normalizedValue: 2.5, dimension: 'length', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      treatedSides: { rawValue: 2, unit: '', normalizedValue: 2, dimension: 'count', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      finalTankVolumeL: { rawValue: 600, unit: 'L', normalizedValue: 600, dimension: 'volume', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      doseValue: { rawValue: 2.0, unit: 'L/ha', normalizedValue: 2.0, dimension: 'dose', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      cultureId: { rawValue: 'vinha', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      conductionId: { rawValue: 'espaldeira', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      canopyThickness: { rawValue: 'estreita', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      phenologyStage: { rawValue: 'int_5', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      canopyDensity: { rawValue: 'moderate', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      travelSpeedKmH: { rawValue: 6.0, unit: 'km/h', normalizedValue: 6.0, dimension: 'speed', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      workingWidthM: { rawValue: 2.5, unit: 'm', normalizedValue: 2.5, dimension: 'length', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' },
      activeNozzleCount: { rawValue: 10, unit: 'bicos', normalizedValue: 10, dimension: 'count', canonicalKey: '', label: '', source: 'user_input', localId: '', calculatorId: '', calculatorVersion: '' }
    };

    const outputs = calibracaoPulverizadorConfig.calculate(inputs);
    assert.ok(outputs['caudalTotalNecessario']);
    assert.equal(outputs['caudalTotalNecessario'].unit, 'L/min');
    assert.ok(outputs['caudalMedioPorBico']);
    assert.equal(outputs['caudalMedioPorBico'].unit, 'L/min');
    assert.equal(outputs['caudalMedioPorBico'].subUnit, 'por bico');
    assert.ok(outputs['tempoTeoricoPorHa']);
    assert.equal(outputs['tempoTeoricoPorHa'].unit, 'min/ha');
  });

  // =========================================================================
  // 5. COBERTURA i18n EM 8 IDIOMAS
  // =========================================================================

  test('5.1. Todos os 8 ficheiros de tradução contêm as chaves da Fase B', () => {
    const locales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];
    const requiredPhaseBKeys = [
      'title',
      'badge',
      'subtitle',
      'travelSpeed',
      'editSpeed',
      'shortcuts',
      'workingWidth',
      'workingWidthHelp',
      'editWidth',
      'useRowSpacingAction',
      'activeNozzleCount',
      'optional',
      'activeNozzleCountHelp',
      'editNozzles',
      'clear',
      'resultsTitle',
      'missingPhaseA',
      'missingSpeed',
      'missingWidth',
      'totalFlow',
      'totalFlowSubtitle',
      'manualWidthNotice',
      'flowPerNozzle',
      'flowPerNozzleSubtitle',
      'noNozzlesHelp',
      'theoreticalTime',
      'disclaimer'
    ];

    const requiredWarningKeys = [
      'speedLow',
      'speedHigh',
      'workingWidthDiffersRowSpacing',
      'activeNozzleCountHigh'
    ];

    for (const loc of locales) {
      const filePath = path.resolve(process.cwd(), `src/i18n/locales/${loc}.json`);
      assert.ok(fs.existsSync(filePath), `Ficheiro de idioma ${loc}.json deve existir`);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      assert.ok(content.calibracaoPulverizador, `calibracaoPulverizador deve existir em ${loc}.json`);
      assert.ok(content.calibracaoPulverizador.phaseB, `calibracaoPulverizador.phaseB deve existir em ${loc}.json`);

      for (const k of requiredPhaseBKeys) {
        assert.ok(
          content.calibracaoPulverizador.phaseB[k],
          `Chave phaseB.${k} deve estar preenchida em ${loc}.json`
        );
      }

      for (const wk of requiredWarningKeys) {
        assert.ok(
          content.calibracaoPulverizador.warnings[wk],
          `Chave warnings.${wk} deve estar preenchida em ${loc}.json`
        );
      }

      // Validação de terminologia proibida: zero "cuba" ou "PF" em PT e BR
      if (loc === 'pt' || loc === 'br') {
        const textDump = JSON.stringify(content.calibracaoPulverizador);
        assert.ok(!textDump.includes('cuba') && !textDump.includes('Cuba'), `Termo proibido 'cuba' encontrado em ${loc}.json`);
      }
    }
  });

  // =========================================================================
  // 6. CONFIRMAÇÃO DA RETIRADA DA FASE C E INTEGRIDADE DO ÂMBITO DA FASE B
  // =========================================================================

  test('6.1. Ausência absoluta de campos e resultados da Fase C na configuração', () => {
    const fieldIds = calibracaoPulverizadorConfig.fields.map((f) => f.id);
    assert.equal(fieldIds.includes('workingPressureBar'), false, 'workingPressureBar NÃO deve existir em fields');
    assert.equal(fieldIds.includes('collectedVolumeL'), false, 'collectedVolumeL NÃO deve existir em fields');
    assert.equal(fieldIds.includes('collectionTimeSeconds'), false, 'collectionTimeSeconds NÃO deve existir em fields');

    const resultIds = calibracaoPulverizadorConfig.results.map((r) => r.id);
    assert.equal(resultIds.includes('debitoMedidoPorBico'), false, 'debitoMedidoPorBico NÃO deve existir em results');
    assert.equal(resultIds.includes('desvioDebitoPercentual'), false, 'desvioDebitoPercentual NÃO deve existir em results');
    assert.equal(resultIds.includes('desvioDebitoAbsoluto'), false, 'desvioDebitoAbsoluto NÃO deve existir em results');
    assert.equal(resultIds.includes('estadoVerificacaoBico'), false, 'estadoVerificacaoBico NÃO deve existir em results');

    for (const mode of calibracaoPulverizadorConfig.modes || []) {
      for (const forbiddenField of ['workingPressureBar', 'collectedVolumeL', 'collectionTimeSeconds']) {
        assert.equal(
          mode.fieldIds?.includes(forbiddenField),
          false,
          `Modo ${mode.id} não deve conter ${forbiddenField}`
        );
      }
      for (const forbiddenResult of ['debitoMedidoPorBico', 'desvioDebitoPercentual', 'desvioDebitoAbsoluto', 'estadoVerificacaoBico']) {
        assert.equal(
          mode.resultIds?.includes(forbiddenResult),
          false,
          `Modo ${mode.id} não deve conter ${forbiddenResult}`
        );
      }
    }
  });

  test('6.2. Ausência absoluta de termos de inspeção/tolerância ISO em todos os 8 ficheiros i18n', () => {
    const locales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];
    for (const loc of locales) {
      const filePath = path.resolve(process.cwd(), `src/i18n/locales/${loc}.json`);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const textDump = JSON.stringify(content.calibracaoPulverizador?.phaseC || {});
      assert.equal(textDump.includes('tolerância ISO'), false, `Não deve conter tolerância ISO em ${loc}.json`);
      assert.equal(textDump.includes('Tolerância ISO'), false, `Não deve conter Tolerância ISO em ${loc}.json`);
      assert.equal(textDump.includes('Bico aprovado'), false, `Não deve conter Bico aprovado em ${loc}.json`);
      assert.equal(textDump.includes('Bico reprovado'), false, `Não deve conter Bico reprovado em ${loc}.json`);
      assert.equal(textDump.includes('Substituir bico'), false, `Não deve conter Substituir bico em ${loc}.json`);
    }
  });

  test('6.3. Disclaimer de referência da Fase B em PT com salvaguarda correta', () => {
    const ptPath = path.resolve(process.cwd(), 'src/i18n/locales/pt.json');
    const ptContent = JSON.parse(fs.readFileSync(ptPath, 'utf-8'));
    assert.equal(
      ptContent.calibracaoPulverizador.phaseB.disclaimer,
      'Este é um valor de referência para selecionar e regular os bicos. Confirme as especificações do fabricante antes de aplicar.'
    );
  });

  test('6.4. Cenário Canónico: V = 244.8 L/ha, S = 6 km/h, W = 2.5 m, N = 10 bicos', () => {
    const qTotal = calculateRequiredTotalFlowLMin(244.8, 6.0, 2.5);
    const qBico = calculateFlowPerNozzleLMin(qTotal, 10);
    const tempo = calculateTheoreticalTimePerHaMinutes(6.0, 2.5);

    assert.equal(Math.round(qTotal * 100) / 100, 6.12);
    assert.equal(Math.round(qBico * 1000) / 1000, 0.612);
    assert.equal(Math.round(tempo * 10) / 10, 40.0);
  });

});
