import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  EPPO_K_DECISION_MATRIX,
  getAvailableCultures,
  getInferredConductionForCulture
} from '../src/features/calibracao-pulverizador/data/eppoKDecisionMatrix.ts';

import {
  LWA_V_DATERRA_METADATA,
  LWA_V_THICKNESS_FACTORS,
  LWA_V_DENSITY_FACTORS,
  LWA_V_STAGE_FACTORS,
  LWA_V_THICKNESS_OPTIONS,
  LWA_V_DENSITY_OPTIONS,
  LWA_V_STAGE_OPTIONS
} from '../src/features/calibracao-pulverizador/data/lwaVDaterraConfig.ts';

import {
  calculateLwaGeometry,
  calculateLwaVTheoreticalVolume,
  calculateTrv,
  calculateTrvSprayVolume,
  calculateCalibracaoPulverizadorPure
} from '../src/features/calibracao-pulverizador/calibracaoPulverizadorEngine.ts';

import {
  validateCalibracaoPulverizador
} from '../src/features/calibracao-pulverizador/calibracaoPulverizadorValidation.ts';

import {
  calibracaoPulverizadorConfig
} from '../src/features/calibracao-pulverizador/calibracaoPulverizadorConfig.ts';

import {
  EPPO_LWA_VOLUME_DECISION_MATRIX,
  EPPO_LWA_VOLUME_MATRIX_METADATA
} from '../src/features/calibracao-pulverizador/data/eppoLwaVolumeDecisionMatrix.ts';

import {
  resolveFriendlyValidationMessage,
  FRIENDLY_VALIDATION_FALLBACKS_PT
} from '../src/features/calibracao-pulverizador/calibracaoPulverizadorValidationFallback.ts';

describe('Calibração Pulverizador — Fase A (LWA-V DATERRA / TRV — EPPO)', () => {

  // =========================================================================
  // 1. MATRIZ DE DECISÃO EPPO K (TRV) E DEPRECIAÇÃO DE MATRIZ LWA DISCRETA
  // =========================================================================

  test('1.1. Matriz TRV contém as 9 culturas oficiais sem duplicados', () => {
    const cultures = getAvailableCultures();
    const expectedCrops = [
      'vinha',
      'pereira',
      'macieira',
      'pessegueiro',
      'cerejeira',
      'amendoeira',
      'citrinos',
      'olival_superintensivo',
      'olival_intensivo'
    ];

    assert.equal(cultures.length, 9);
    const cultureIds = cultures.map((c) => c.id);
    for (const ec of expectedCrops) {
      assert.ok(cultureIds.includes(ec), `Cultura ${ec} deve estar presente`);
    }

    // Verificar unicidade da chave composta: culture + conduction + phenology + density
    const keys = new Set();
    for (const row of EPPO_K_DECISION_MATRIX) {
      const key = `${row.cultureId}__${row.conductionId}__${row.phenologyId}__${row.canopyDensity}`;
      assert.ok(!keys.has(key), `Linha duplicada na matriz: ${key}`);
      keys.add(key);

      // Validação de intervalo agronómico de k (0.015 a 0.080 L/m³)
      assert.ok(row.kLPerM3 >= 0.015 && row.kLPerM3 <= 0.080, `k fora do intervalo para ${key}: ${row.kLPerM3}`);
      assert.ok([0.75, 0.85, 1.00].includes(row.adjustmentFactor), `Fator de densidade inválido: ${row.adjustmentFactor}`);
    }
  });

  test('1.2. Matriz discreta anterior eppoLwaVolumeDecisionMatrix está marcada como deprecated', () => {
    assert.equal(EPPO_LWA_VOLUME_MATRIX_METADATA.deprecated, true);
    assert.equal(EPPO_LWA_VOLUME_MATRIX_METADATA.replacedBy, 'lwa-v-daterra-v1');
    assert.equal(EPPO_LWA_VOLUME_DECISION_MATRIX.length, 9);
  });

  test('1.3. Condução é inferida automaticamente para cada cultura', () => {
    const expectedMappings = {
      vinha: { id: 'espaldeira', label: 'Espaldeira' },
      pereira: { id: 'sebe_parede', label: 'Sebe / parede' },
      macieira: { id: 'sebe_parede', label: 'Sebe / parede' },
      pessegueiro: { id: 'vaso_taca', label: 'Vaso / taça' },
      cerejeira: { id: 'vaso_taca', label: 'Vaso / taça' },
      amendoeira: { id: 'sebe_parede', label: 'Sebe / parede' },
      citrinos: { id: 'vaso_arredondado', label: 'Vaso / arredondado' },
      olival_superintensivo: { id: 'sebe_continua', label: 'Sebe contínua' },
      olival_intensivo: { id: 'vaso_globo', label: 'Vaso / globo' }
    };

    for (const [cultureId, expected] of Object.entries(expectedMappings)) {
      const inferred = getInferredConductionForCulture(cultureId);
      assert.ok(inferred, `Condução deve ser inferida para ${cultureId}`);
      assert.equal(inferred.id, expected.id, `ID de condução incorreto para ${cultureId}`);
      assert.equal(inferred.label, expected.label, `Label de condução incorreto para ${cultureId}`);
    }
  });

  test('1.4. Rótulos visíveis de estado fenológico TRV são operacionais e curtos sem referências técnicas', () => {
    const phenologyLabels = {
      vinha_folhas_floracao: 'Folhas à floração',
      vinha_fecho_pintor: 'Fecho do cacho ao pintor',
      vinha_pintor_maturacao: 'Pintor à maturação',
      macieira_inicio_pos_floracao: 'Desenvolvimento inicial / pós-floração',
      macieira_pleno_maturacao: 'Pleno vigor / maturação',
      pereira_inicio_pos_floracao: 'Desenvolvimento inicial / pós-floração',
      pereira_pleno_maturacao: 'Pleno crescimento / maturação',
      pessegueiro_inicio_pos_floracao: 'Desenvolvimento inicial / pós-floração',
      pessegueiro_pleno_maturacao: 'Pleno vigor / maturação',
      cerejeira_inicio_pos_floracao: 'Desenvolvimento inicial / pós-floração',
      cerejeira_pleno_maturacao: 'Pleno vigor / maturação',
      amendoeira_inicio_pos_floracao: 'Desenvolvimento inicial / pós-floração',
      amendoeira_pleno_maturacao: 'Pleno vigor / maturação',
      citrinos_pos_poda_inicio: 'Pós-poda / início vegetativo',
      citrinos_pleno_vigor: 'Pleno vigor',
      olival_super_pleno_vigor: 'Pleno vigor',
      olival_intensivo_pleno_vigor: 'Pleno vigor'
    };

    for (const row of EPPO_K_DECISION_MATRIX) {
      if (phenologyLabels[row.phenologyId]) {
        assert.equal(row.phenologyLabel, phenologyLabels[row.phenologyId]);
      }
      assert.ok(!row.phenologyLabel.includes('BBCH'), `Rótulo ${row.phenologyLabel} não deve conter BBCH`);
      assert.ok(!row.phenologyLabel.includes('Baggiolini'), `Rótulo ${row.phenologyLabel} não deve conter Baggiolini`);
      assert.ok(!row.phenologyLabel.includes('Fleckinger'), `Rótulo ${row.phenologyLabel} não deve conter Fleckinger`);
      assert.ok(row.phenologyReference.length > 0, `Referência técnica deve existir para ${row.phenologyId}`);
    }
  });

  // =========================================================================
  // 2. CONFIGURAÇÃO E METADADOS DO MODELO LWA-V DATERRA
  // =========================================================================

  test('2.1. Metadados e constantes do modelo LWA-V DATERRA', () => {
    assert.equal(LWA_V_DATERRA_METADATA.id, 'lwa-v-daterra-v1');
    assert.equal(LWA_V_DATERRA_METADATA.baseCoverageRateLPerM2, 0.0377);

    // Fatores de Espessura
    assert.equal(LWA_V_THICKNESS_FACTORS.estreita, 1.0);
    assert.equal(LWA_V_THICKNESS_FACTORS.media, 1.3);
    assert.equal(LWA_V_THICKNESS_FACTORS.larga, 1.55);

    // Fatores de Densidade
    assert.equal(LWA_V_DENSITY_FACTORS.aberta, 0.8);
    assert.equal(LWA_V_DENSITY_FACTORS.moderada, 0.95);
    assert.equal(LWA_V_DENSITY_FACTORS.densa, 1.1);

    // Fatores de Estádio
    assert.equal(LWA_V_STAGE_FACTORS.int_1, 0.0);
    assert.equal(LWA_V_STAGE_FACTORS.int_2, 0.4);
    assert.equal(LWA_V_STAGE_FACTORS.int_3, 0.6);
    assert.equal(LWA_V_STAGE_FACTORS.int_4, 0.75);
    assert.equal(LWA_V_STAGE_FACTORS.int_5, 1.0);

    // Opções
    assert.equal(LWA_V_THICKNESS_OPTIONS.length, 3);
    assert.equal(LWA_V_THICKNESS_OPTIONS[0].fallbackDesc, '< 0,50 m');
    assert.equal(LWA_V_THICKNESS_OPTIONS[1].fallbackDesc, '0,50 m a 0,80 m');
    assert.equal(LWA_V_THICKNESS_OPTIONS[2].fallbackDesc, '> 0,80 m');

    assert.equal(LWA_V_DENSITY_OPTIONS.length, 3);

    assert.equal(LWA_V_STAGE_OPTIONS.length, 5);
    assert.equal(LWA_V_STAGE_OPTIONS[0].fallbackLabel, 'Repouso a olho de algodão');
    assert.equal(LWA_V_STAGE_OPTIONS[1].fallbackLabel, 'Folhas jovens a folhas livres');
    assert.equal(LWA_V_STAGE_OPTIONS[2].fallbackLabel, 'Cachos visíveis a floração');
    assert.equal(LWA_V_STAGE_OPTIONS[3].fallbackLabel, 'Bago de chumbo a ervilha');
    assert.equal(LWA_V_STAGE_OPTIONS[4].fallbackLabel, 'Fecho do cacho à maturação');
  });

  // =========================================================================
  // 3. AS 7 VALIDAÇÕES OBRIGATÓRIAS DO MODELO LWA-V DATERRA
  // =========================================================================

  test('3.1. Cenário 1: h=0.5m, r=2.5m, estreita, aberta, int_2 => LWA=4000, Vteorico=48.256, Vfinal=48.3 L/ha (Sem piso)', () => {
    const lwa = calculateLwaGeometry(0.5, 2.5);
    assert.equal(lwa, 4000);

    const vTeorico = calculateLwaVTheoreticalVolume(lwa, 'estreita', 'aberta', 'int_2');
    assert.ok(Math.abs(vTeorico - 48.256) < 1e-6, `Vteorico esperado 48.256, obtido ${vTeorico}`);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 0.5,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'estreita',
      canopyDensity: 'aberta',
      phenologyStage: 'int_2',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.isApplicable, true);
    assert.equal(res.lwaM2PerHa, 4000);
    assert.equal(res.theoreticalSprayVolumeLHa, 48.3);
    assert.equal(res.finalSprayVolumeLHa, 48.3);
    assert.equal(res.recommendedSprayVolumeLHa, 48.3);
  });

  test('3.2. Cenário 2: h=0.5m, r=2.5m, estreita, aberta, int_2 => Vteorico=48.256, Vfinal=48.3 L/ha (Sem piso de 100 L/ha)', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 0.5,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'estreita',
      canopyDensity: 'aberta',
      phenologyStage: 'int_2',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.isApplicable, true);
    assert.equal(res.lwaM2PerHa, 4000);
    assert.equal(res.theoreticalSprayVolumeLHa, 48.3);
    assert.equal(res.finalSprayVolumeLHa, 48.3);
    assert.equal(res.recommendedSprayVolumeLHa, 48.3);
  });

  test('3.3. Cenário 3: h=1.2m, r=2.5m, estreita, moderada, int_3 => LWA=9600, Vteorico=206.2944, Vfinal=206.3 L/ha', () => {
    const lwa = calculateLwaGeometry(1.2, 2.5);
    assert.equal(lwa, 9600);

    const vTeorico = calculateLwaVTheoreticalVolume(lwa, 'estreita', 'moderada', 'int_3');
    assert.ok(Math.abs(vTeorico - 206.2944) < 1e-6, `Vteorico esperado 206.2944, obtido ${vTeorico}`);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.2,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'estreita',
      canopyDensity: 'moderada',
      phenologyStage: 'int_3',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.lwaM2PerHa, 9600);
    assert.equal(res.theoreticalSprayVolumeLHa, 206.3);
    assert.equal(res.finalSprayVolumeLHa, 206.3);
  });

  test('3.4. Cenário 4: h=1.5m, r=2.5m, media, moderada, int_4 => LWA=12000, Vteorico=419.0355, Vfinal=419.0 L/ha', () => {
    const lwa = calculateLwaGeometry(1.5, 2.5);
    assert.equal(lwa, 12000);

    const vTeorico = calculateLwaVTheoreticalVolume(lwa, 'media', 'moderada', 'int_4');
    assert.ok(Math.abs(vTeorico - 419.0355) < 1e-6, `Vteorico esperado 419.0355, obtido ${vTeorico}`);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.5,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'media',
      canopyDensity: 'moderada',
      phenologyStage: 'int_4',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.lwaM2PerHa, 12000);
    assert.equal(res.theoreticalSprayVolumeLHa, 419.0);
    assert.equal(res.finalSprayVolumeLHa, 419.0);
  });

  test('3.5. Cenário 5: h=1.8m, r=2.5m, estreita, aberta, int_5 => LWA=14400, Vteorico=434.304, Vfinal=434.3 L/ha', () => {
    const lwa = calculateLwaGeometry(1.8, 2.5);
    assert.equal(lwa, 14400);

    const vTeorico = calculateLwaVTheoreticalVolume(lwa, 'estreita', 'aberta', 'int_5');
    assert.ok(Math.abs(vTeorico - 434.304) < 1e-6, `Vteorico esperado 434.304, obtido ${vTeorico}`);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'estreita',
      canopyDensity: 'aberta',
      phenologyStage: 'int_5',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.lwaM2PerHa, 14400);
    assert.equal(res.theoreticalSprayVolumeLHa, 434.3);
    assert.equal(res.finalSprayVolumeLHa, 434.3);
  });

  test('3.6. Cenário 6: h=1.8m, r=2.5m, estreita, moderada, int_5 => LWA=14400, Vteorico=515.736, Vfinal=515.7 L/ha', () => {
    const lwa = calculateLwaGeometry(1.8, 2.5);
    assert.equal(lwa, 14400);

    const vTeorico = calculateLwaVTheoreticalVolume(lwa, 'estreita', 'moderada', 'int_5');
    assert.ok(Math.abs(vTeorico - 515.736) < 1e-6, `Vteorico esperado 515.736, obtido ${vTeorico}`);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'estreita',
      canopyDensity: 'moderada',
      phenologyStage: 'int_5',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.lwaM2PerHa, 14400);
    assert.equal(res.theoreticalSprayVolumeLHa, 515.7);
    assert.equal(res.finalSprayVolumeLHa, 515.7);
  });

  test('3.7. Cenário 7: h=1.8m, r=2.5m, media, densa, int_5 => LWA=14400, Vteorico=776.3184, Vfinal=776.3 L/ha', () => {
    const lwa = calculateLwaGeometry(1.8, 2.5);
    assert.equal(lwa, 14400);

    const vTeorico = calculateLwaVTheoreticalVolume(lwa, 'media', 'densa', 'int_5');
    assert.ok(Math.abs(vTeorico - 776.3184) < 1e-6, `Vteorico esperado 776.3184, obtido ${vTeorico}`);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'media',
      canopyDensity: 'densa',
      phenologyStage: 'int_5',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.lwaM2PerHa, 14400);
    assert.equal(res.theoreticalSprayVolumeLHa, 776.3);
    assert.equal(res.finalSprayVolumeLHa, 776.3);
  });

  // =========================================================================
  // 4. COMPORTAMENTO DO ESTÁDIO REPOUSO (int_1)
  // =========================================================================

  test('4.1. Estádio int_1 (Repouso) define isApplicable = false e volumes undefined (não exibe 0 L/ha)', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'estreita',
      canopyDensity: 'aberta',
      phenologyStage: 'int_1',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.isApplicable, false);
    assert.equal(res.theoreticalSprayVolumeLHa, undefined);
    assert.equal(res.finalSprayVolumeLHa, undefined);
    assert.equal(res.recommendedSprayVolumeLHa, undefined);
    assert.equal(res.productPerTankValue, undefined);
    assert.equal(res.areaPerTankHa, undefined);
    assert.equal(res.tanksPerHa, undefined);

    const val = validateCalibracaoPulverizador({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      phenologyStage: 'int_1'
    });
    assert.equal(val.isValid, true);
    assert.ok(val.warnings.restingStage);
  });

  // =========================================================================
  // 5. VALIDAÇÃO DE LIMITES DE PLAUSIBILIDADE E AVISOS NÃO-BLOQUEANTES
  // =========================================================================

  test('5.1. Avisos de plausibilidade para altura (h < 0.1 ou h > 3.0) e entrelinha (r < 1.0 ou r > 4.0)', () => {
    // Altura muito baixa (h = 0.05 m)
    const valLowH = validateCalibracaoPulverizador({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 0.05,
      rowSpacingM: 2.5,
      treatedSides: 2
    });
    assert.equal(valLowH.isValid, true);
    assert.ok(valLowH.warnings.treatedHeightM, 'Deve ter aviso de altura baixa');

    // Altura muito alta (h = 3.5 m)
    const valHighH = validateCalibracaoPulverizador({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 3.5,
      rowSpacingM: 2.5,
      treatedSides: 2
    });
    assert.equal(valHighH.isValid, true);
    assert.ok(valHighH.warnings.treatedHeightM, 'Deve ter aviso de altura alta');

    // Entrelinha muito estreita (r = 0.8 m)
    const valNarrowR = validateCalibracaoPulverizador({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 0.8,
      treatedSides: 2
    });
    assert.equal(valNarrowR.isValid, true);
    assert.ok(valNarrowR.warnings.rowSpacingM, 'Deve ter aviso de entrelinha estreita');

    // Entrelinha muito larga (r = 4.5 m)
    const valWideR = validateCalibracaoPulverizador({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 4.5,
      treatedSides: 2
    });
    assert.equal(valWideR.isValid, true);
    assert.ok(valWideR.warnings.rowSpacingM, 'Deve ter aviso de entrelinha larga');
  });

  test('5.2. Erro se faces tratadas != 2 para Vinha em LWA', () => {
    const valFaces = validateCalibracaoPulverizador({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 1
    });
    assert.equal(valFaces.isValid, false);
    assert.ok(valFaces.errors.treatedSides);
  });

  // =========================================================================
  // 6. ISOLAMENTO ESTRITO LWA vs TRV
  // =========================================================================

  test('6.1. TRV nunca lê parâmetros de LWA-V e LWA-V nunca lê kTRV', () => {
    // TRV para vinha
    const trvRes = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      phenologyId: 'vinha_pintor_maturacao',
      canopyDensity: 'moderate',
      treatedHeightM: 1.8,
      canopyWidthM: 0.6,
      rowSpacingM: 2.5
    });
    assert.equal(trvRes.method, 'trv');
    assert.equal(trvRes.selectedK, 0.034); // kTRV em L/m³
    assert.equal(trvRes.lwaModel, undefined);
    assert.equal(trvRes.theoreticalSprayVolumeLHa, undefined);
    assert.equal(trvRes.finalSprayVolumeLHa, undefined);

    // LWA para vinha
    const lwaRes = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      canopyThickness: 'estreita',
      canopyDensity: 'moderada',
      phenologyStage: 'int_5',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2
    });
    assert.equal(lwaRes.method, 'lwa');
    assert.equal(lwaRes.lwaModel, 'lwa-v-daterra-v1');
    assert.equal(lwaRes.selectedK, undefined);
    assert.equal(lwaRes.trvM3PerHa, undefined);
  });

  // =========================================================================
  // 7. CONFIGURAÇÃO DECLARATIVA OFICIAL (calibracaoPulverizadorConfig)
  // =========================================================================

  test('7.1. calibracaoPulverizadorConfig calcula corretamente LWA-V com label "Volume de Calda Sugerido"', () => {
    const structuredInputs = {
      mode: { rawValue: 'lwa', unit: '', dimension: 'text', source: 'user_input' },
      cultureId: { rawValue: 'vinha', unit: '', dimension: 'text', source: 'user_input' },
      canopyThickness: { rawValue: 'estreita', unit: '', dimension: 'text', source: 'user_input' },
      canopyDensity: { rawValue: 'moderada', unit: '', dimension: 'text', source: 'user_input' },
      phenologyStage: { rawValue: 'int_5', unit: '', dimension: 'text', source: 'user_input' },
      treatedHeightM: { rawValue: 1.8, unit: 'm', dimension: 'length', source: 'user_input' },
      rowSpacingM: { rawValue: 2.5, unit: 'm', dimension: 'length', source: 'user_input' },
      treatedSides: { rawValue: 2, unit: '', dimension: 'count', source: 'user_input' },
      doseValue: { rawValue: 1.5, unit: 'kg/ha', dimension: 'application_rate', source: 'user_input' },
      finalTankVolumeL: { rawValue: 400, unit: 'L', dimension: 'volume', source: 'user_input' }
    };

    const calcOutputs = calibracaoPulverizadorConfig.calculate(structuredInputs);
    assert.equal(calcOutputs.primaryResult?.rawValue, 515.7);
    assert.equal(calcOutputs.primaryResult?.unit, 'L/ha');
    assert.equal(calcOutputs.primaryResult?.label, 'Volume de Calda Sugerido');
    assert.equal(calcOutputs.primaryResult?.subValue, 14400);
    assert.equal(calcOutputs.primaryResult?.subUnit, 'm² LWA/ha');
    assert.equal(calcOutputs.volCaldaRecomendado?.rawValue, 515.7);
    assert.equal(calcOutputs.lwaHa?.rawValue, 14400);
  });

  // =========================================================================
  // 8. INTERNACIONALIZAÇÃO (i18n) — 8 IDIOMAS E PRESERVAÇÃO TERMINOLÓGICA
  // =========================================================================

  test('8.1. Todos os 8 idiomas possuem o namespace calibracaoPulverizador com chaves LWA-V completas e sem resíduos de perfil de equipamento', () => {
    const locales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];

    for (const loc of locales) {
      const filePath = path.resolve(`src/i18n/locales/${loc}.json`);
      assert.ok(fs.existsSync(filePath), `Ficheiro ${loc}.json deve existir`);

      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      assert.ok(content.calibracaoPulverizador, `${loc}.json deve ter namespace calibracaoPulverizador`);

      const cp = content.calibracaoPulverizador;
      assert.ok(cp.thinCanopy, `${loc} thinCanopy`);
      assert.ok(cp.mediumCanopyThickness, `${loc} mediumCanopyThickness`);
      assert.ok(cp.wideCanopy, `${loc} wideCanopy`);
      assert.ok(cp.phenologicalStage, `${loc} phenologicalStage`);
      assert.ok(cp.stageDormancyCottonBud, `${loc} stageDormancyCottonBud`);
      assert.ok(cp.stageYoungLeavesFreeLeaves, `${loc} stageYoungLeavesFreeLeaves`);
      assert.ok(cp.stageClustersToFlowering, `${loc} stageClustersToFlowering`);
      assert.ok(cp.stageBerryToPea, `${loc} stageBerryToPea`);
      assert.ok(cp.stageClosureToMaturity, `${loc} stageClosureToMaturity`);
      assert.ok(cp.restingStageWarningTitle, `${loc} restingStageWarningTitle`);
      assert.ok(cp.lwaVModelSummary, `${loc} lwaVModelSummary`);
      assert.ok(cp.warnings?.restingStageNotice, `${loc} warnings.restingStageNotice`);

      // Garantir remoção total das chaves de perfil de equipamento e pisos
      assert.equal(cp.equipmentProfile, undefined, `${loc} não deve conter equipmentProfile`);
      assert.equal(cp.tractor, undefined, `${loc} não deve conter tractor no namespace de calibração`);
      assert.equal(cp.drone, undefined, `${loc} não deve conter drone no namespace de calibração`);
      assert.equal(cp.warnings?.droneProfileNotice, undefined, `${loc} não deve conter droneProfileNotice`);
      assert.equal(cp.warnings?.floorApplied, undefined, `${loc} não deve conter floorApplied`);
      assert.equal(cp.warnings?.tractorFloorWarning, undefined, `${loc} não deve conter tractorFloorWarning`);
      assert.equal(cp.warnings?.droneFloorWarning, undefined, `${loc} não deve conter droneFloorWarning`);
    }
  });

  test('8.2. Regra terminológica: 0% menções ao termo "cuba" e "PF" na interface PT/BR', () => {
    const ptContent = fs.readFileSync(path.resolve('src/i18n/locales/pt.json'), 'utf-8');
    const ptJson = JSON.parse(ptContent);
    const cpStr = JSON.stringify(ptJson.calibracaoPulverizador);

    assert.ok(!cpStr.toLowerCase().includes('"cuba"'), 'Namespace PT não pode conter "cuba"');
    assert.ok(!cpStr.includes(' PF '), 'Namespace PT não pode conter " PF "');

    const brContent = fs.readFileSync(path.resolve('src/i18n/locales/br.json'), 'utf-8');
    const brJson = JSON.parse(brContent);
    const cpBrStr = JSON.stringify(brJson.calibracaoPulverizador);

    assert.ok(!cpBrStr.toLowerCase().includes('"cuba"'), 'Namespace BR não pode conter "cuba"');
    assert.ok(!cpBrStr.includes(' PF '), 'Namespace BR não pode conter " PF "');
  });

  // =========================================================================
  // 9. VERIFICAÇÃO DE SCROLL RESET GLOBAL EM UNIVERSALCALCULATORTEMPLATE
  // =========================================================================

  test('9.1. UniversalCalculatorTemplate possui scroll reset imediato vinculado a [definition.id]', () => {
    const templatePath = path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx');
    assert.ok(fs.existsSync(templatePath), 'Template deve existir');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    assert.ok(templateContent.includes('window.scrollTo(0, 0)'), 'Deve conter window.scrollTo(0, 0)');
    assert.ok(templateContent.includes('document.documentElement.scrollTop = 0'), 'Deve conter documentElement.scrollTop = 0');
    assert.ok(templateContent.includes('document.body.scrollTop = 0'), 'Deve conter document.body.scrollTop = 0');
    assert.ok(templateContent.includes('[definition.id]'), 'Efeito de scroll deve depender de [definition.id]');
  });

  // =========================================================================
  // 10. CORREÇÃO UX/UI E RESULTADOS — MÉTODO LWA-V
  // =========================================================================

  test('10.1. Seletor de Métodos (CalibracaoMetodoSelector) exibe apenas "LWA" e "TRV" sem subtítulos longos', () => {
    const selectorPath = path.resolve('src/features/calibracao-pulverizador/components/CalibracaoMetodoSelector.tsx');
    assert.ok(fs.existsSync(selectorPath), 'Componente CalibracaoMetodoSelector deve existir');
    const content = fs.readFileSync(selectorPath, 'utf-8');

    assert.ok(!content.includes('Área de Parede Foliar (m'), 'Não deve conter subtítulo longo no LWA');
    assert.ok(!content.includes('Volume de Copa (m³/ha)'), 'Não deve conter subtítulo longo no TRV');
    assert.ok(content.includes('min-h-[52px]') || content.includes('min-h-[48px]'), 'Deve manter área de toque >= 48px');
  });

  test('10.2. Seletor de Contexto (CalibracaoContextSelectors) exibe badge "LWA" em vez de "LWA-V Vinha"', () => {
    const contextPath = path.resolve('src/features/calibracao-pulverizador/components/CalibracaoContextSelectors.tsx');
    assert.ok(fs.existsSync(contextPath), 'Componente CalibracaoContextSelectors deve existir');
    const content = fs.readFileSync(contextPath, 'utf-8');

    assert.ok(!content.includes('LWA-V Vinha'), 'Não deve conter o badge com texto "LWA-V Vinha"');
    assert.ok(content.includes("{isLwa ? 'LWA' : 'TRV'}"), 'Deve conter badge LWA / TRV');
  });

  test('10.3. Filtragem estrita de resultados por modo em calibracaoPulverizadorConfig e UniversalCalculatorTemplate', () => {
    const lwaMode = calibracaoPulverizadorConfig.modes.find((m) => m.id === 'lwa');
    const trvMode = calibracaoPulverizadorConfig.modes.find((m) => m.id === 'trv');

    assert.ok(lwaMode, 'Modo lwa deve existir');
    assert.ok(trvMode, 'Modo trv deve existir');

    // LWA mode não tem trvM3PerHa
    assert.ok(!lwaMode.resultIds.includes('trvM3PerHa'), 'LWA não deve incluir trvM3PerHa');
    assert.ok(lwaMode.resultIds.includes('taxaLwa'), 'LWA deve incluir taxaLwa');
    assert.ok(lwaMode.resultIds.includes('lwaHa'), 'LWA deve incluir lwaHa');

    // TRV mode não tem lwaHa nem taxaLwa
    assert.ok(!trvMode.resultIds.includes('lwaHa'), 'TRV não deve incluir lwaHa');
    assert.ok(!trvMode.resultIds.includes('taxaLwa'), 'TRV não deve incluir taxaLwa');
    assert.ok(trvMode.resultIds.includes('trvM3PerHa'), 'TRV deve incluir trvM3PerHa');
  });

  test('10.4. Taxa de Cobertura Hídrica Efetiva: kLwa = 0.0377 * 1.30 * 1.10 * 1.00 * 10000 = 539.11 => 539.1 L / 10 000 m² LWA', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'media',      // 1.30
      canopyDensity: 'densa',        // 1.10
      phenologyStage: 'int_5',       // 1.00
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'L/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.kLwaLPer10000M2, 539.11);
    assert.equal(Math.round(res.kLwaLPer10000M2 * 10) / 10, 539.1);
    assert.equal(res.lwaM2PerHa, 14400);
    assert.equal(res.recommendedSprayVolumeLHa, 776.3);

    // Verificação de resultados via calibracaoPulverizadorConfig
    const structuredInputs = {
      mode: { rawValue: 'lwa', unit: '', dimension: 'text', source: 'user_input' },
      cultureId: { rawValue: 'vinha', unit: '', dimension: 'text', source: 'user_input' },
      canopyThickness: { rawValue: 'media', unit: '', dimension: 'text', source: 'user_input' },
      canopyDensity: { rawValue: 'densa', unit: '', dimension: 'text', source: 'user_input' },
      phenologyStage: { rawValue: 'int_5', unit: '', dimension: 'text', source: 'user_input' },
      treatedHeightM: { rawValue: 1.8, unit: 'm', dimension: 'length', source: 'user_input' },
      rowSpacingM: { rawValue: 2.5, unit: 'm', dimension: 'length', source: 'user_input' },
      treatedSides: { rawValue: 2, unit: '', dimension: 'count', source: 'user_input' },
      doseValue: { rawValue: 1.5, unit: 'L/ha', dimension: 'application_rate', source: 'user_input' },
      finalTankVolumeL: { rawValue: 400, unit: 'L', dimension: 'volume', source: 'user_input' }
    };

    const outputs = calibracaoPulverizadorConfig.calculate(structuredInputs);
    assert.equal(outputs.taxaLwa?.rawValue, 539.11);
    assert.equal(outputs.taxaLwa?.unit, 'L / 10 000 m² LWA');
    assert.equal(outputs.volCaldaAdotado, undefined, 'Não deve emitir volCaldaAdotado para LWA-V Vinha automático');
    assert.equal(outputs.trvM3PerHa, undefined, 'Não deve emitir trvM3PerHa em modo LWA');
  });

  test('10.5. UniversalCalculatorTemplate renderiza cartão dedicado de avisos com bullet points e nota legal separada', () => {
    const templatePath = path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx');
    const content = fs.readFileSync(templatePath, 'utf-8');

    assert.ok(content.includes('bulletNotices'), 'Deve estruturar avisos em bulletNotices');
    assert.ok(content.includes('legalNote'), 'Deve separar a nota legal em legalNote');
    assert.ok(content.includes('validationCardTitle'), 'Deve usar validationCardTitle dinâmico');
    assert.ok(content.includes('resolveFriendlyValidationMessage'), 'Deve usar resolveFriendlyValidationMessage para proteger contra fuga de chaves');
  });

  // =========================================================================
  // 11. AUDITORIA E VALIDAÇÃO DIRIGIDA DO MÉTODO TRV
  // =========================================================================

  test('11.1. Cenário Principal TRV Vinha: h=1.80m, w=1.00m, r=2.50m, Pintor maturação, Moderada => k=0.034, TRV=7200, Q=244.8 L/ha', () => {
    const trv = calculateTrv(1.8, 1.0, 2.5);
    assert.equal(trv, 7200);

    const q = calculateTrvSprayVolume(trv, 0.034);
    assert.equal(Math.round(q * 10) / 10, 244.8);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      phenologyId: 'vinha_pintor_maturacao',
      canopyDensity: 'moderate',
      treatedHeightM: 1.8,
      canopyWidthM: 1.0,
      rowSpacingM: 2.5
    });

    assert.equal(res.isValid, true);
    assert.equal(res.trvM3PerHa, 7200);
    assert.equal(res.selectedK, 0.034);
    assert.equal(res.recommendedSprayVolumeLHa, 244.8);
    assert.equal(res.effectiveSprayVolumeLHa, 244.8);

    // Verificação declarativa via calibracaoPulverizadorConfig
    const structuredInputs = {
      mode: { rawValue: 'trv', unit: '', dimension: 'text', source: 'user_input' },
      cultureId: { rawValue: 'vinha', unit: '', dimension: 'text', source: 'user_input' },
      conductionId: { rawValue: 'espaldeira', unit: '', dimension: 'text', source: 'user_input' },
      phenologyId: { rawValue: 'vinha_pintor_maturacao', unit: '', dimension: 'text', source: 'user_input' },
      canopyDensity: { rawValue: 'moderate', unit: '', dimension: 'text', source: 'user_input' },
      treatedHeightM: { rawValue: 1.8, unit: 'm', dimension: 'length', source: 'user_input' },
      canopyWidthM: { rawValue: 1.0, unit: 'm', dimension: 'length', source: 'user_input' },
      rowSpacingM: { rawValue: 2.5, unit: 'm', dimension: 'length', source: 'user_input' }
    };

    const outputs = calibracaoPulverizadorConfig.calculate(structuredInputs);
    assert.equal(outputs.primaryResult?.rawValue, 244.8);
    assert.equal(outputs.primaryResult?.unit, 'L/ha');
    assert.equal(outputs.primaryResult?.subValue, 7200);
    assert.equal(outputs.primaryResult?.subUnit, 'm³ TRV/ha');
    assert.equal(outputs.trvM3PerHa?.rawValue, 7200);
    assert.equal(outputs.lwaHa, undefined);
    assert.equal(outputs.taxaLwa, undefined);
  });

  test('11.2. Cenário TRV Vinha Densa: k=0.040 L/m³, TRV=7200 m³/ha, Q=288.0 L/ha', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      phenologyId: 'vinha_pintor_maturacao',
      canopyDensity: 'dense',
      treatedHeightM: 1.8,
      canopyWidthM: 1.0,
      rowSpacingM: 2.5
    });

    assert.equal(res.isValid, true);
    assert.equal(res.trvM3PerHa, 7200);
    assert.equal(res.selectedK, 0.040);
    assert.equal(res.recommendedSprayVolumeLHa, 288.0);
  });

  test('11.3. Cenário TRV Macieira: h=3.00m, w=2.00m, r=4.00m, Pleno vigor, Moderada => k=0.033, TRV=15000, Q=495.0 L/ha', () => {
    const trv = calculateTrv(3.0, 2.0, 4.0);
    assert.equal(trv, 15000);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      cultureId: 'macieira',
      conductionId: 'sebe_parede',
      phenologyId: 'macieira_pleno_maturacao',
      canopyDensity: 'moderate',
      treatedHeightM: 3.0,
      canopyWidthM: 2.0,
      rowSpacingM: 4.0
    });

    assert.equal(res.isValid, true);
    assert.equal(res.trvM3PerHa, 15000);
    assert.equal(res.selectedK, 0.033);
    assert.equal(res.recommendedSprayVolumeLHa, 495.0);
  });

  test('11.4. Cenário TRV Citrinos: h=3.50m, w=4.00m, r=6.00m, Pleno vigor, Moderada => k=0.040, TRV=23333.3, Q=933.3 L/ha', () => {
    const trv = calculateTrv(3.5, 4.0, 6.0);
    assert.ok(Math.abs(trv - 23333.3333) < 0.001);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      cultureId: 'citrinos',
      conductionId: 'vaso_arredondado',
      phenologyId: 'citrinos_pleno_vigor',
      canopyDensity: 'moderate',
      treatedHeightM: 3.5,
      canopyWidthM: 4.0,
      rowSpacingM: 6.0
    });

    assert.equal(res.isValid, true);
    assert.equal(res.trvM3PerHa, 23333.3);
    assert.equal(res.selectedK, 0.040);
    assert.equal(res.recommendedSprayVolumeLHa, 933.3);
  });

  test('11.5. Cenário TRV Olival Intensivo: h=3.00m, w=4.00m, r=7.00m, Pleno vigor, Densa => k=0.035, TRV=17142.9, Q=600.0 L/ha', () => {
    const trv = calculateTrv(3.0, 4.0, 7.0);
    assert.ok(Math.abs(trv - 17142.8571) < 0.001);

    const res = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      cultureId: 'olival_intensivo',
      conductionId: 'vaso_globo',
      phenologyId: 'olival_intensivo_pleno_vigor',
      canopyDensity: 'dense',
      treatedHeightM: 3.0,
      canopyWidthM: 4.0,
      rowSpacingM: 7.0
    });

    assert.equal(res.isValid, true);
    assert.equal(res.trvM3PerHa, 17142.9);
    assert.equal(res.selectedK, 0.035);
    assert.equal(res.recommendedSprayVolumeLHa, 600.0);
  });

  test('11.6. Provas de Isolamento Absoluto: Parâmetros LWA-V nunca afetam o cálculo TRV', () => {
    const baseTrvInputs = {
      method: 'trv',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      phenologyId: 'vinha_pintor_maturacao',
      canopyDensity: 'moderate',
      treatedHeightM: 1.8,
      canopyWidthM: 1.0,
      rowSpacingM: 2.5
    };

    const resBaseline = calculateCalibracaoPulverizadorPure(baseTrvInputs);
    assert.equal(resBaseline.recommendedSprayVolumeLHa, 244.8);

    // 1. Alterar canopyThickness LWA-V para 'larga' (1.55) não deve mudar TRV
    const resWithThickness = calculateCalibracaoPulverizadorPure({
      ...baseTrvInputs,
      canopyThickness: 'larga'
    });
    assert.equal(resWithThickness.recommendedSprayVolumeLHa, 244.8);

    // 2. Alterar phenologyStage LWA-V para 'int_1' (repouso 0.0) ou 'int_2' (0.4) não deve mudar TRV
    const resWithStage1 = calculateCalibracaoPulverizadorPure({
      ...baseTrvInputs,
      phenologyStage: 'int_1'
    });
    assert.equal(resWithStage1.isValid, true);
    assert.equal(resWithStage1.isApplicable, true);
    assert.equal(resWithStage1.recommendedSprayVolumeLHa, 244.8);

    const resWithStage2 = calculateCalibracaoPulverizadorPure({
      ...baseTrvInputs,
      phenologyStage: 'int_2'
    });
    assert.equal(resWithStage2.recommendedSprayVolumeLHa, 244.8);

    // 3. Alterar equipmentType para 'drone' (piso 15) ou 'trator' (piso 100) não altera TRV
    const resWithDrone = calculateCalibracaoPulverizadorPure({
      ...baseTrvInputs,
      equipmentType: 'drone'
    });
    assert.equal(resWithDrone.recommendedSprayVolumeLHa, 244.8);
    assert.equal(resWithDrone.equipmentFloorApplied, undefined);

    // 4. Alterar treatedSides LWA não altera TRV
    const resWithSides1 = calculateCalibracaoPulverizadorPure({
      ...baseTrvInputs,
      treatedSides: 1
    });
    assert.equal(resWithSides1.recommendedSprayVolumeLHa, 244.8);
    assert.equal(resWithSides1.trvM3PerHa, 7200);

    // 5. Garantir que kLPerM3 é usado diretamente sem segunda multiplicação por adjustmentFactor
    assert.equal(resBaseline.selectedK, 0.034);
    assert.equal(resBaseline.adjustmentFactor, 0.85);
    // Se houvesse dupla multiplicação, seria 0.034 * 0.85 * 7200 = 208.08 (incorreto)
    assert.equal(resBaseline.recommendedSprayVolumeLHa, 244.8);
  });

  // =========================================================================
  // 12. VALIDAÇÃO DE MENSAGENS E CAIXA DEDICADA DE AVISOS (UX/UI P1)
  // =========================================================================

  test('12.1. "Atenção aos dados introduzidos" está presente em todos os 8 idiomas e "Notas de Validação" foi removido', () => {
    const locales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];

    for (const loc of locales) {
      const filePath = path.resolve(`src/i18n/locales/${loc}.json`);
      const rawText = fs.readFileSync(filePath, 'utf-8');
      const content = JSON.parse(rawText);

      // Não pode conter a designação antiga em nenhum idioma
      assert.ok(!rawText.includes('Notas de Validação'), `${loc}.json não pode conter "Notas de Validação"`);

      // Deve conter título do cartão de validação
      const cpTitle = content.calibracaoPulverizador?.validation?.title;
      const vnTitle = content.validationNotes?.title;
      assert.ok(cpTitle || vnTitle, `${loc}.json deve ter título de validação amigável`);

      if (loc === 'pt') {
        assert.equal(cpTitle, 'Atenção aos dados introduzidos');
        assert.equal(vnTitle, 'Atenção aos dados introduzidos');
      }
    }
  });

  test('12.2. Fallback seguro resolve chaves técnicas para mensagens claras em português', () => {
    assert.ok(Object.keys(FRIENDLY_VALIDATION_FALLBACKS_PT).length > 0, 'Dicionário de fallbacks deve estar populado');

    const rawKeys = [
      'calibracaoPulverizador.warnings.heightHigh',
      'calibracaoPulverizador.warnings.heightLow',
      'calibracaoPulverizador.warnings.rowSpacingWide',
      'calibracaoPulverizador.warnings.rowSpacingNarrow',
      'calibracaoPulverizador.warnings.canopyWidthHigh',
      'calibracaoPulverizador.warnings.canopyWidthLow',
      'calibracaoPulverizador.warnings.doseHigh',
      'calibracaoPulverizador.warnings.doseLow',
      'calibracaoPulverizador.warnings.tankVolumeHigh',
      'calibracaoPulverizador.warnings.tankVolumeLow',
      'calibracaoPulverizador.warnings.widthRowSpacingOverlap',
      'calibracaoPulverizador.warnings.labelPrevalence',
      'heightHigh',
      'rowSpacingWide',
      'canopyWidthHigh'
    ];

    for (const key of rawKeys) {
      const resolved = resolveFriendlyValidationMessage(key);
      assert.ok(resolved && resolved.length > 10, `Chave ${key} deve ter mensagem de fallback válida`);
      assert.ok(!resolved.includes('calibracaoPulverizador.'), `Mensagem não pode conter "calibracaoPulverizador." (${resolved})`);
      assert.ok(!resolved.includes('.warnings.'), `Mensagem não pode conter ".warnings." (${resolved})`);
      assert.ok(!resolved.includes('.errors.'), `Mensagem não pode conter ".errors." (${resolved})`);
    }
  });

  test('12.3. Cenário B (Valores normais de campo): 0 avisos de plausibilidade, cartão dedicado fica oculto', () => {
    const normalInputs = {
      method: 'trv',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      phenologyId: 'vinha_pintor_maturacao',
      canopyDensity: 'moderate',
      treatedHeightM: 1.8,
      canopyWidthM: 1.0,
      rowSpacingM: 2.5,
      finalTankVolumeL: 600,
      doseValue: 2.0,
      doseType: 'dose_ha',
      doseUnit: 'L/ha'
    };

    const validation = validateCalibracaoPulverizador(normalInputs);
    assert.equal(validation.isValid, true);
    assert.deepEqual(validation.errors, {});
    // Não deve haver nenhum aviso de plausibilidade nem aviso geral
    assert.deepEqual(validation.warnings, {}, 'Cenário normal não pode emitir avisos de validação');
  });

  test('12.4. Plausibilidade extrema de Altura e Entrelinha dispara avisos amigáveis nos limites corretos', () => {
    // Altura alta (> 3.0 m)
    const resHeightHigh = validateCalibracaoPulverizador({
      treatedHeightM: 3.2,
      rowSpacingM: 2.5
    });
    assert.equal(resHeightHigh.warnings.treatedHeightM, 'calibracaoPulverizador.warnings.heightHigh');
    assert.equal(
      resolveFriendlyValidationMessage(resHeightHigh.warnings.treatedHeightM),
      'A altura da vegetação é elevada. Confirme se o valor corresponde à parte da vegetação que pretende tratar.'
    );

    // Altura baixa (< 0.1 m)
    const resHeightLow = validateCalibracaoPulverizador({
      treatedHeightM: 0.08,
      rowSpacingM: 2.5
    });
    assert.equal(resHeightLow.warnings.treatedHeightM, 'calibracaoPulverizador.warnings.heightLow');

    // Entrelinha larga (> 4.0 m)
    const resRowSpacingWide = validateCalibracaoPulverizador({
      treatedHeightM: 1.8,
      rowSpacingM: 4.5
    });
    assert.equal(resRowSpacingWide.warnings.rowSpacingM, 'calibracaoPulverizador.warnings.rowSpacingWide');
    assert.equal(
      resolveFriendlyValidationMessage(resRowSpacingWide.warnings.rowSpacingM),
      'A distância entrelinhas é elevada. Confirme a medição antes de aplicar o resultado no campo.'
    );

    // Entrelinha estreita (< 1.0 m)
    const resRowSpacingNarrow = validateCalibracaoPulverizador({
      treatedHeightM: 1.8,
      rowSpacingM: 0.8
    });
    assert.equal(resRowSpacingNarrow.warnings.rowSpacingM, 'calibracaoPulverizador.warnings.rowSpacingNarrow');
  });

  test('12.5. Plausibilidade de Largura de Copa, Depósito e Dose', () => {
    // Largura baixa (< 0.5 m)
    const resWidthLow = validateCalibracaoPulverizador({
      method: 'trv',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      canopyWidthM: 0.4
    });
    assert.equal(resWidthLow.warnings.canopyWidthM, 'calibracaoPulverizador.warnings.canopyWidthLow');

    // Largura alta (> 4.0 m)
    const resWidthHigh = validateCalibracaoPulverizador({
      method: 'trv',
      treatedHeightM: 1.8,
      rowSpacingM: 5.0,
      canopyWidthM: 4.2
    });
    assert.equal(resWidthHigh.warnings.canopyWidthM, 'calibracaoPulverizador.warnings.canopyWidthHigh');

    // Depósito baixo (< 50 L)
    const resTankLow = validateCalibracaoPulverizador({
      finalTankVolumeL: 30
    });
    assert.equal(resTankLow.warnings.finalTankVolumeL, 'calibracaoPulverizador.warnings.tankVolumeLow');

    // Depósito alto (> 3000 L)
    const resTankHigh = validateCalibracaoPulverizador({
      finalTankVolumeL: 3500
    });
    assert.equal(resTankHigh.warnings.finalTankVolumeL, 'calibracaoPulverizador.warnings.tankVolumeHigh');

    // Dose baixa (< 0.05)
    const resDoseLow = validateCalibracaoPulverizador({
      doseValue: 0.02,
      doseType: 'dose_ha',
      doseUnit: 'L/ha'
    });
    assert.equal(resDoseLow.warnings.doseValue, 'calibracaoPulverizador.warnings.doseLow');

    // Dose alta (> 10 L/ha)
    const resDoseHigh = validateCalibracaoPulverizador({
      doseValue: 15,
      doseType: 'dose_ha',
      doseUnit: 'L/ha'
    });
    assert.equal(resDoseHigh.warnings.doseValue, 'calibracaoPulverizador.warnings.doseHigh');
  });

  test('12.6. Aviso geral de prevalência jurídica só é anexado se existirem avisos de validação', () => {
    // Sem outros avisos: general não existe
    const resClean = validateCalibracaoPulverizador({
      treatedHeightM: 1.8,
      rowSpacingM: 2.5
    });
    assert.equal(resClean.warnings.general, undefined);

    // Com outro aviso: general é anexado
    const resWithWarning = validateCalibracaoPulverizador({
      treatedHeightM: 3.5,
      rowSpacingM: 2.5
    });
    assert.equal(resWithWarning.warnings.general, 'calibracaoPulverizador.warnings.labelPrevalence');
    assert.ok(
      resolveFriendlyValidationMessage(resWithWarning.warnings.general).includes(
        'autorização de venda prevalecem sempre sobre o cálculo teórico'
      )
    );
  });

  test('12.7. UniversalCalculatorTemplate isola avisos de Calibração na caixa dedicada e suprime de CalculatorInputsPanel', () => {
    const templatePath = path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx');
    const content = fs.readFileSync(templatePath, 'utf-8');

    // Em desktop, CalculatorInputsPanel recebe warnings={isCalibracaoPulverizador ? undefined : validation.warnings}
    assert.ok(
      content.includes('warnings={isCalibracaoPulverizador ? undefined : validation.warnings}'),
      'Deve suprimir warnings nos inputs panel em Calibração Pulverizador'
    );

    // Em mobile, summary buttons não têm badges de aviso
    assert.ok(
      !content.includes('hasWarning &&'),
      'Mobile input buttons não devem ter styling de hasWarning'
    );
  });

  test('12.8. CalculatorInputField protege contra exibição de chaves com pontos nos erros/avisos', () => {
    const fieldPath = path.resolve('src/features/calculators/core/CalculatorInputField.tsx');
    const content = fs.readFileSync(fieldPath, 'utf-8');

    assert.ok(
      content.includes('resolveFriendlyValidationMessage(error, t)'),
      'Deve filtrar erros através de resolveFriendlyValidationMessage'
    );
    assert.ok(
      content.includes('resolveFriendlyValidationMessage(warning, t)'),
      'Deve filtrar avisos através de resolveFriendlyValidationMessage'
    );
  });

  // =========================================================================
  // 13. TESTES DE REGRESSÃO OBRIGATÓRIOS — REMOÇÃO DO PERFIL DE EQUIPAMENTO
  // =========================================================================

  test('13.1. Passagem de input com legado equipmentType não bloqueia nem altera cálculo puro e é ignorado', () => {
    const resWithDrone = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'media',
      canopyDensity: 'densa',
      phenologyStage: 'int_5',
      equipmentType: 'drone',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(resWithDrone.isValid, true);
    assert.equal(resWithDrone.recommendedSprayVolumeLHa, 776.3);
    assert.equal(resWithDrone.finalSprayVolumeLHa, 776.3);
    assert.equal(resWithDrone.equipmentFloorApplied, undefined);
    assert.equal(resWithDrone.equipmentType, undefined);

    const resWithTractor = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'media',
      canopyDensity: 'densa',
      phenologyStage: 'int_5',
      equipmentType: 'trator',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(resWithTractor.isValid, true);
    assert.equal(resWithTractor.recommendedSprayVolumeLHa, 776.3);
    assert.equal(resWithTractor.finalSprayVolumeLHa, 776.3);
    assert.equal(resWithTractor.equipmentFloorApplied, undefined);
  });

  test('13.2. Objeto de input sem propriedade de equipamento produz cálculo LWA-V válido e finalSprayVolumeLHa preenchido', () => {
    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'estreita',
      canopyDensity: 'aberta',
      phenologyStage: 'int_5',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.lwaM2PerHa, 14400);
    assert.equal(res.finalSprayVolumeLHa, 434.3);
    assert.equal(res.recommendedSprayVolumeLHa, 434.3);
    assert.equal(res.equipmentFloorApplied, undefined);
  });

  test('13.3. Cenário canónico de vinha: finalSprayVolumeLHa === recommendedSprayVolumeLHa === 776.3184 (arredondado para 776.3 L/ha)', () => {
    // h = 1.8m, r = 2.5m, faces = 2 => LWA = (1.8 * 2 * 10000) / 2.5 = 14400 m²/ha
    // media (1.30), densa (1.10), int_5 (1.00)
    // taxaLwa = 0.0377 * 1.30 * 1.10 * 1.00 = 0.053911 L/m² LWA
    // Vteorico = 14400 * 0.053911 = 776.3184 L/ha
    const res = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      canopyThickness: 'media',
      canopyDensity: 'densa',
      phenologyStage: 'int_5',
      doseType: 'dose_ha',
      doseValue: 1.5,
      doseUnit: 'kg/ha',
      finalTankVolumeL: 400
    });

    assert.equal(res.isValid, true);
    assert.equal(res.lwaM2PerHa, 14400);
    assert.equal(res.theoreticalSprayVolumeLHa, 776.3);
    assert.equal(res.finalSprayVolumeLHa, 776.3);
    assert.equal(res.recommendedSprayVolumeLHa, 776.3);
    assert.equal(res.finalSprayVolumeLHa, res.recommendedSprayVolumeLHa);
  });

  test('13.4. Fase B acoplada a LWA-V produz saídas idênticas com e sem equipamento residual', () => {
    const baseInput = {
      method: 'lwa',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      canopyThickness: 'media',
      canopyDensity: 'densa',
      phenologyStage: 'int_5',
      treatedHeightM: 1.8,
      rowSpacingM: 2.5,
      treatedSides: 2,
      finalTankVolumeL: 600,
      doseValue: 2.0,
      travelSpeedKmH: 6.0,
      workingWidthM: 2.5,
      activeNozzleCount: 10
    };

    const outWithoutEquipment = calculateCalibracaoPulverizadorPure(baseInput);
    const outWithEquipment = calculateCalibracaoPulverizadorPure({
      ...baseInput,
      equipmentType: 'drone'
    });

    // Saídas de Fase A
    assert.equal(outWithoutEquipment.recommendedSprayVolumeLHa, 776.3);
    assert.equal(outWithEquipment.recommendedSprayVolumeLHa, 776.3);

    // Saídas de Fase B: Q_total = (776.3 * 6.0 * 2.5) / 600 = 19.4075 L/min
    assert.equal(outWithoutEquipment.totalFlowRequiredLMin, outWithEquipment.totalFlowRequiredLMin);
    assert.equal(Math.round(outWithoutEquipment.totalFlowRequiredLMin * 10000) / 10000, 19.4075);

    // Q_bico = 19.4075 / 10 = 1.94075 L/min
    assert.equal(outWithoutEquipment.flowPerNozzleLMin, outWithEquipment.flowPerNozzleLMin);
    assert.equal(Math.round(outWithoutEquipment.flowPerNozzleLMin * 100000) / 100000, 1.94075);

    // T = 600 / (6.0 * 2.5) = 40.0 min/ha
    assert.equal(outWithoutEquipment.theoreticalTimePerHaMinutes, 40.0);
    assert.equal(outWithEquipment.theoreticalTimePerHaMinutes, 40.0);
  });
});


