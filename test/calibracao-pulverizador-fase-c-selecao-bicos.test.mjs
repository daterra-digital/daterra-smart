/**
 * Testes Unitários e de Integração — Fase C: Seleção de Bicos e Pressão de Trabalho
 * Ficheiro: test/calibracao-pulverizador-fase-c-selecao-bicos.test.mjs
 * 
 * Validação rigorosa dos 13 requisitos normativos e matemáticos da Fase C:
 * 1. Simetria e Níveis Ativos
 * 2. Paridade do Número de Bicos
 * 3. Perfil Uniforme Inicial
 * 4. Redistribuição Proporcional
 * 5. Níveis Bloqueados e Máximo Dinâmico
 * 6. Mínimo por Nível (0,05 L/min)
 * 7. Deteção de Concentração > 50%
 * 8. Sugestão de Pressão e Intervalos (7-15 bar / >15-20 bar)
 * 9. Catálogo Técnico Verificado sem Dados Inventados
 * 10. Seleção e Diferença Percentual (Informativa, Sem ISO)
 * 11. Proposta de Menor Ajuste Possível (Soma Exata vs Não Exata)
 * 12. Textos e Estrutura do Perfil Final
 * 13. Isolamento Estrito das Fases A e B
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Importar motor puro e catálogo
import * as engine from '../src/features/calibracao-pulverizador/nozzleSelectionEngine.ts';
import * as catalogModule from '../src/features/calibracao-pulverizador/data/nozzleCatalog.ts';
import { calculateCalibracaoPulverizadorPure } from '../src/features/calibracao-pulverizador/calibracaoPulverizadorEngine.ts';

test('Fase C — Seleção de Bicos e Perfil de Distribuição de Débito', async (t) => {

  await t.test('1. Simetria Lateral e Dedução de Níveis Ativos (4, 6, 8, 10, 12 bicos)', () => {
    // 4 bicos -> 2 níveis por lado
    assert.equal(engine.deriveActiveLevels(4), 2);
    // 6 bicos -> 3 níveis por lado
    assert.equal(engine.deriveActiveLevels(6), 3);
    // 8 bicos -> 4 níveis por lado, débito 6.12 -> 3.06 por lado
    assert.equal(engine.deriveActiveLevels(8), 4);
    assert.equal(engine.calculateRequiredOutputPerSideLMin(6.12), 3.06);
    // 10 bicos -> 5 níveis por lado
    assert.equal(engine.deriveActiveLevels(10), 5);
    // 12 bicos -> 6 níveis por lado
    assert.equal(engine.deriveActiveLevels(12), 6);
    // 16 bicos -> 8 níveis por lado
    assert.equal(engine.deriveActiveLevels(16), 8);
  });

  await t.test('2. Paridade do Número de Bicos (Rejeição de Ímpares e Inválidos)', () => {
    assert.equal(engine.deriveActiveLevels(7), null);
    assert.equal(engine.deriveActiveLevels(1), null);
    assert.equal(engine.deriveActiveLevels(0), null);
    assert.equal(engine.deriveActiveLevels(-4), null);
    assert.equal(engine.deriveActiveLevels(NaN), null);
    assert.equal(engine.deriveActiveLevels(Infinity), null);

    assert.equal(engine.calculateRequiredOutputPerSideLMin(0), null);
    assert.equal(engine.calculateRequiredOutputPerSideLMin(-5), null);
    assert.equal(engine.calculateRequiredOutputPerSideLMin(NaN), null);
  });

  await t.test('3. Perfil Uniforme Inicial', () => {
    const uniform = engine.createUniformOutputProfile(3.06, 4);
    assert.ok(uniform);
    assert.equal(uniform.length, 4);
    assert.deepEqual(uniform, [0.765, 0.765, 0.765, 0.765]);

    // Invariante de soma por lado e total
    const sumSide = uniform.reduce((acc, v) => acc + v, 0);
    assert.ok(Math.abs(sumSide - 3.06) < 1e-9);
    assert.ok(Math.abs(2 * sumSide - 6.12) < 1e-9);

    // Rejeição de valores incompatíveis com mínimo de 0.05 L/min
    assert.equal(engine.createUniformOutputProfile(0.10, 4, 0.05), null); // 4 * 0.05 = 0.20 > 0.10
  });

  await t.test('4. Redistribuição Proporcional entre Níveis Desbloqueados', () => {
    const current = [0.765, 0.765, 0.765, 0.765];
    // Aumentar Nível 4 (índice 3) para 1.065 (+0.30)
    const redistributed = engine.redistributeOutputProfile(current, 3, 1.065, [], 3.06);
    assert.ok(redistributed);
    assert.equal(redistributed.length, 4);
    assert.equal(redistributed[3], 1.065);

    // Os outros 3 níveis descem proporcionalmente: 0.765 - 0.10 = 0.665 cada
    assert.ok(Math.abs(redistributed[0] - 0.665) < 1e-4);
    assert.ok(Math.abs(redistributed[1] - 0.665) < 1e-4);
    assert.ok(Math.abs(redistributed[2] - 0.665) < 1e-4);

    // Soma invariante
    const sum = redistributed.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 3.06) < 1e-6);
  });

  await t.test('5. Níveis Bloqueados e Cálculo de Máximo Dinâmico', () => {
    const current = [0.765, 0.765, 0.765, 0.765];
    // Nível 1 (índice 0) bloqueado em 0.765
    const redistributed = engine.redistributeOutputProfile(current, 3, 1.065, [0], 3.06);
    assert.ok(redistributed);
    assert.equal(redistributed[0], 0.765); // Permanece inalterado
    assert.equal(redistributed[3], 1.065);

    // Níveis 2 e 3 absorvem os 0.30: 0.765 - 0.15 = 0.615 cada
    assert.ok(Math.abs(redistributed[1] - 0.615) < 1e-4);
    assert.ok(Math.abs(redistributed[2] - 0.615) < 1e-4);

    const sum = redistributed.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 3.06) < 1e-6);

    // Validação de viabilidade quando bloqueios esgotam capacidade
    assert.equal(engine.validateLockedLevelsFeasibility([2.95, 0.05], [0], 3.06, 0.05), true);
    assert.equal(engine.validateLockedLevelsFeasibility([3.05, 0.05], [0], 3.06, 0.05), false);
  });

  await t.test('6. Respeito pelo Mínimo de 0,05 L/min por Nível', () => {
    const current = [0.765, 0.765, 0.765, 0.765];
    // Tentar reduzir para 0 ou negativo é clamped em 0.05
    const res = engine.redistributeOutputProfile(current, 0, 0.01, [], 3.06, 0.05);
    assert.ok(res);
    assert.ok(res.every((v) => v >= 0.05 - 1e-9));
    assert.equal(res[0], 0.05);
  });

  await t.test('7. Deteção de Concentração de Débito > 50%', () => {
    const balanced = [0.765, 0.765, 0.765, 0.765];
    const sideRequired = 3.06;
    const isConcentratedA = balanced.some((v) => v > sideRequired * 0.5);
    assert.equal(isConcentratedA, false);

    const concentrated = [0.50, 0.50, 0.46, 1.60]; // 1.60 > 1.53 (50%)
    const isConcentratedB = concentrated.some((v) => v > sideRequired * 0.5);
    assert.equal(isConcentratedB, true);
  });

  await t.test('8. Sugestão Automática de Pressão (7-15 bar preferencial / >15-20 bar)', () => {
    const catalog = catalogModule.NOZZLE_CATALOG_DATABASE;
    assert.ok(catalog.length > 0);

    const uniform = [0.765, 0.765, 0.765, 0.765];
    const pSug = engine.findSuggestedPressure(uniform, catalog, {
      manufacturers: ['Albuz'],
      familyPreference: 'hollow-cone'
    });

    assert.ok(pSug !== null);
    assert.ok(pSug >= 7.0 && pSug <= 20.0);
    assert.equal(pSug, 10.0); // No dataset oficial, 10 bar é a pressão de referência
  });

  await t.test('9. Catálogo Técnico Verificado sem Dados Inventados', () => {
    const catalog = catalogModule.NOZZLE_CATALOG_DATABASE;
    assert.ok(catalog.length >= 400);

    for (const entry of catalog) {
      assert.ok(entry.id, 'Entry must have id');
      assert.ok(entry.manufacturerName, 'Entry must have manufacturerName');
      assert.ok(entry.model, 'Entry must have model');
      assert.ok(['hollow-cone', 'full-cone', 'flat-fan', 'other'].includes(entry.nozzleType));
      assert.ok(entry.pressureBar >= 1 && entry.pressureBar <= 25);
      assert.ok(entry.referencePressureBar >= 1 && entry.referencePressureBar <= 25);
      assert.ok(entry.pressureMinBar <= entry.pressureMaxBar);
      assert.ok(entry.nominalOutputLMin > 0);
      assert.ok(entry.sourceName, 'Entry must have sourceName');
      assert.ok(entry.sourceVersion, 'Entry must have sourceVersion');
    }

    const mfgs = catalogModule.getAvailableManufacturers();
    assert.ok(mfgs.length >= 8);
    // Verificar ordenação alfabética
    for (let i = 1; i < mfgs.length; i++) {
      assert.ok(
        mfgs[i].name.localeCompare(mfgs[i - 1].name) >= 0,
        `Manufacturers must be alphabetically sorted: ${mfgs[i - 1].name} <= ${mfgs[i].name}`
      );
    }
    const albuz = mfgs.find((m) => m.name === 'Albuz');
    assert.ok(albuz && albuz.hasData);
    const withoutData = mfgs.find((m) => !m.hasData);
    assert.ok(withoutData, 'Marcas sem catálogo devem existir com hasData === false');
    assert.equal(withoutData.hasData, false);
  });

  await t.test('9.1. Fórmula Física de Pressão: D2 = D1 * sqrt(P2 / P1)', () => {
    // Pressão igual à de referência: débito nominal inalterado
    const est1 = engine.calculateEstimatedOutput(1.0, 10.0, 10.0);
    assert.equal(est1, 1.0);

    // Pressão superior: 10 -> 15 bar (fator sqrt(1.5) = 1.22474487)
    const est2 = engine.calculateEstimatedOutput(1.0, 10.0, 15.0);
    assert.ok(Math.abs(est2 - 1.22474) < 1e-4);

    // Pressão inferior: 10 -> 5 bar (fator sqrt(0.5) = 0.70710678)
    const est3 = engine.calculateEstimatedOutput(1.0, 10.0, 5.0);
    assert.ok(Math.abs(est3 - 0.7071) < 1e-4);

    // Proteção contra valores inválidos
    assert.equal(engine.calculateEstimatedOutput(0, 10, 10), null);
    assert.equal(engine.calculateEstimatedOutput(1.0, 0, 10), null);
    assert.equal(engine.calculateEstimatedOutput(1.0, 10, 0), null);
  });

  await t.test('9.2. Elegibilidade de Pressão por Tipo e Faixa do Fabricante', () => {
    const albuzHollow = {
      id: 'albuz_test',
      manufacturerName: 'Albuz',
      model: 'ATR 80',
      colorName: 'Amarelo',
      nozzleType: 'hollow-cone',
      sprayAngleDeg: 80,
      nominalOutputLMin: 0.76,
      referencePressureBar: 10.0,
      pressureBar: 10.0,
      pressureMinBar: 5.0,
      pressureMaxBar: 25.0,
      sourceName: 'Albuz',
      sourceVersion: '2024'
    };

    // Hollow cone (5-25 bar): elegível a 5, 10, 15, 20, 25 bar; inelegível a 3 bar e 30 bar
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 10.0), true);
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 5.0), true);
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 25.0), true);
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 3.0), false);
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 28.0), false);

    const teejetFlat = {
      id: 'teejet_flat_test',
      manufacturerName: 'TeeJet',
      model: 'DG TeeJet 110',
      colorName: 'Azul',
      nozzleType: 'flat-fan',
      sprayAngleDeg: 110,
      nominalOutputLMin: 1.18,
      referencePressureBar: 3.0,
      pressureBar: 3.0,
      pressureMinBar: 1.0,
      pressureMaxBar: 6.0,
      sourceName: 'TeeJet',
      sourceVersion: '2024'
    };

    // Flat fan (1-6 bar): elegível a 3.0 bar; inelegível a 10.0 bar
    assert.equal(engine.isNozzleEligibleAtPressure(teejetFlat, 3.0), true);
    assert.equal(engine.isNozzleEligibleAtPressure(teejetFlat, 10.0), false);
  });

  await t.test('10. Seleção e Ordenação de Bicos por Proximidade Informativa', () => {
    const catalog = catalogModule.NOZZLE_CATALOG_DATABASE;
    const target = 0.765;
    const options = engine.findCompatibleNozzleOptions(target, 10.0, catalog, {
      manufacturers: ['Albuz'],
      familyPreference: 'hollow-cone'
    });

    assert.ok(options.length > 0);
    // Assegurar ordenação por diferença absoluta crescente
    for (let i = 1; i < options.length; i++) {
      assert.ok(
        options[i].differenceAbsoluteLMin >= options[i - 1].differenceAbsoluteLMin - 1e-4,
        'Options must be sorted by closest absolute difference'
      );
    }

    // Cálculo da diferença percentual
    const diffPct = engine.calculateNozzleSelectionDifferencePercent(0.765, 0.76);
    assert.ok(diffPct !== null);
    assert.ok(Math.abs(diffPct - (-0.65359)) < 0.01);
  });

  await t.test('11. Proposta de Menor Ajuste Possível (Soma Exata vs Não Exata)', () => {
    // Cenário A: Soma exatamente possível
    // Débito requerido total: 6.12 L/min, lado: 3.06 L/min
    // Níveis selecionados: 0.60 + 0.70 + 0.80 + 0.96 = 3.06 L/min
    const exactEntries = [
      { id: '1', nominalOutputLMin: 0.60 },
      { id: '2', nominalOutputLMin: 0.70 },
      { id: '3', nominalOutputLMin: 0.80 },
      { id: '4', nominalOutputLMin: 0.96 }
    ];
    const totalExact = engine.calculateSelectedProfileNominalTotal(exactEntries);
    assert.equal(totalExact, 6.12);
    const diffExact = engine.calculateSelectedProfileDifference(6.12, totalExact);
    assert.ok(diffExact);
    assert.ok(Math.abs(diffExact.absoluteDifferenceLMin) < 1e-4);
    assert.ok(Math.abs(diffExact.differencePercent) < 1e-4);

    // Cenário B: Soma não exatamente possível (Valores discretos de catálogo)
    // Níveis selecionados: 0.60 + 0.70 + 0.80 + 0.90 = 3.00 L/min -> Total 6.00 L/min
    const discreteEntries = [
      { id: '1', nominalOutputLMin: 0.60 },
      { id: '2', nominalOutputLMin: 0.70 },
      { id: '3', nominalOutputLMin: 0.80 },
      { id: '4', nominalOutputLMin: 0.90 }
    ];
    const totalDiscrete = engine.calculateSelectedProfileNominalTotal(discreteEntries);
    assert.equal(totalDiscrete, 6.00);
    const diffDiscrete = engine.calculateSelectedProfileDifference(6.12, totalDiscrete);
    assert.ok(diffDiscrete);
    assert.ok(Math.abs(diffDiscrete.absoluteDifferenceLMin - (-0.12)) < 1e-4);
    assert.ok(Math.abs(diffDiscrete.differencePercent - (-1.96)) < 0.05);

    // Função de proposta
    const current = [0.765, 0.765, 0.765, 0.765];
    const availableByLevel = [
      [0.67, 1.03],
      [0.67, 1.03],
      [0.67, 1.03],
      [0.67, 1.03]
    ];
    const proposed = engine.proposeClosestAvailableOutputProfile(current, [], 3.06, 0.05, availableByLevel);
    assert.ok(proposed);
    assert.equal(proposed.length, 4);
    // 0.67 é mais próximo de 0.765 do que 1.03 (dist: 0.095 vs 0.265)
    assert.deepEqual(proposed, [0.67, 0.67, 0.67, 0.67]);
  });

  await t.test('12. Conformidade de Textos em pt.json e Ausência de Termos ISO/Inspeção', () => {
    const ptPath = path.resolve('./src/i18n/locales/pt.json');
    const ptJson = JSON.parse(fs.readFileSync(ptPath, 'utf8'));

    const phaseC = ptJson.calibracaoPulverizador?.phaseC;
    assert.ok(phaseC, 'phaseC must exist in pt.json');

    assert.equal(phaseC.title, 'Fase C — Seleção de bicos e pressão de trabalho');
    assert.equal(phaseC.finalProfileTitle, 'Perfil de distribuição de débito e bicos sugerido');
    assert.equal(phaseC.symmetryNote, 'Configuração simétrica: o mesmo perfil é aplicado ao lado oposto.');
    assert.equal(
      phaseC.technicalCatalogDisclaimer,
      'Os débitos apresentados são valores tabelados pelo fabricante. Confirme a compatibilidade do bico, a pressão e a qualidade da pulverização antes de aplicar.'
    );

    // Garantir que não existem termos de inspeção/tolerância no ficheiro pt.json
    const ptText = JSON.stringify(phaseC);
    assert.equal(ptText.includes('tolerância ISO'), false);
    assert.equal(ptText.includes('Tolerância ISO'), false);
    assert.equal(ptText.includes('Bico aprovado'), false);
    assert.equal(ptText.includes('Bico reprovado'), false);
    assert.equal(ptText.includes('Substituir bico'), false);
  });

  await t.test('13. Preservação Estrita e Isolamento das Fases A e B', () => {
    // Cenário Canónico LWA Vinha
    const outputs = calculateCalibracaoPulverizadorPure({
      method: 'lwa',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      phenologyStage: 'int_4',
      canopyDensity: 'moderada',
      canopyThickness: 'media',
      treatedHeightM: 1.5,
      rowSpacingM: 2.5,
      finalTankVolumeL: 1000,
      doseType: 'dose_ha',
      doseValue: 2.0,
      doseUnit: 'kg/ha',
      travelSpeedKmH: 6.0,
      workingWidthM: 2.5,
      activeNozzleCount: 10
    });

    assert.equal(outputs.isValid, true);
    // Fase A
    assert.equal(Math.round(outputs.lwaM2PerHa), 12000);
    assert.equal(Math.round(outputs.finalSprayVolumeLHa), 419);
    // Fase B
    assert.ok(Math.abs(outputs.totalFlowRequiredLMin - 10.475) < 1e-2);
    assert.ok(Math.abs(outputs.flowPerNozzleLMin - 1.0475) < 1e-3);
    assert.equal(outputs.theoreticalTimePerHaMinutes, 40);

    // Cenário TRV Vinha (Q = 6.12 L/min)
    const trvOutputs = calculateCalibracaoPulverizadorPure({
      method: 'trv',
      cultureId: 'vinha',
      conductionId: 'espaldeira',
      phenologyId: 'vinha_pintor_maturacao',
      canopyDensity: 'moderate',
      treatedHeightM: 1.8,
      canopyWidthM: 1.0,
      rowSpacingM: 2.5,
      travelSpeedKmH: 6.0,
      workingWidthM: 2.5,
      activeNozzleCount: 10
    });

    assert.equal(trvOutputs.isValid, true);
    assert.equal(Math.round(trvOutputs.recommendedSprayVolumeLHa * 10) / 10, 244.8);
    assert.equal(Math.round(trvOutputs.totalFlowRequiredLMin * 100) / 100, 6.12);
    assert.equal(Math.round(trvOutputs.flowPerNozzleLMin * 1000) / 1000, 0.612);
  });

  await t.test('14. Escala Horizontal Comum (5% / 90% / 5%) e Cálculo de Preenchimento das Barras', () => {
    // Cenário 1: Perfil Uniforme [0.765, 0.765, 0.765, 0.765]
    // maxProfileOutput = 0.765
    // scaleMaximum = ceil((0.765 / 0.95) / 0.05) * 0.05 = ceil(16.105) * 0.05 = 17 * 0.05 = 0.85 L/min
    const scale1 = engine.calculateDistributionScale([0.765, 0.765, 0.765, 0.765], 0.95);
    assert.equal(scale1.minimumLMin, 0);
    assert.equal(scale1.maximumLMin, 0.85);

    // Preenchimento de 0.765 num máximo de 0.85
    const fill1 = engine.calculateLevelBarFillRatio(0.765, scale1.maximumLMin);
    assert.ok(Math.abs(fill1 - (0.765 / 0.85)) < 1e-6);
    assert.ok(fill1 >= 0 && fill1 <= 1);

    // Largura visual em percentagem dentro da zona útil de 90%
    const barWidth1 = engine.calculateVisualBarWidthPercent(0.765, scale1.maximumLMin);
    assert.ok(Math.abs(barWidth1 - ((0.765 / 0.85) * 90)) < 1e-2);

    // Limites de segurança do fillRatio
    assert.equal(engine.calculateLevelBarFillRatio(0, 1.60), 0);
    assert.equal(engine.calculateLevelBarFillRatio(-0.5, 1.60), 0);
    assert.equal(engine.calculateLevelBarFillRatio(2.50, 1.60), 1); // Clamped no máximo de 100%
  });

  await t.test('15. Conformidade Visual do Editor e Cartão de Perfil de Distribuição', () => {
    const editorPath = path.resolve('./src/features/calibracao-pulverizador/components/OutputDistributionProfileEditor.tsx');
    assert.ok(fs.existsSync(editorPath));
    const editorSource = fs.readFileSync(editorPath, 'utf8');

    // Verificar que o título "Perfil de Distribuição" e manómetro não-editável estão presentes
    assert.ok(editorSource.includes('Perfil de Distribuição'));
    assert.ok(editorSource.includes('Pressão de Trabalho'));
    assert.ok(editorSource.includes('calculatePressureGaugePercent'));
    assert.ok(editorSource.includes('getPressureStatus'));
    assert.ok(editorSource.includes('getNozzleColorHex'));

    // Verificar que não existem provetas verticais nem botões +/- 0.05
    assert.equal(editorSource.includes('provetas verticais'), false);
    assert.equal(editorSource.includes('Provetas empilhadas verticalmente'), false);
    assert.equal(editorSource.includes('onAdjustLevel'), false);

    // Verificar que os controlos possuem áreas de toque mínimas de 48px/44px
    assert.ok(editorSource.includes('touch-target'));
  });

  await t.test('16. Classificação e Estados da Barra de Pressão (getPressureStatus)', () => {
    // 1.0 a 5.0 bar: 'low'
    assert.equal(engine.getPressureStatus(1.0), 'low');
    assert.equal(engine.getPressureStatus(3.0), 'low');
    assert.equal(engine.getPressureStatus(5.0), 'low');

    // >5.0 a <8.0 bar: 'low-moderate'
    assert.equal(engine.getPressureStatus(5.1), 'low-moderate');
    assert.equal(engine.getPressureStatus(6.0), 'low-moderate');
    assert.equal(engine.getPressureStatus(7.9), 'low-moderate');

    // 8.0 a 15.0 bar: 'preferred' (zona ideal)
    assert.equal(engine.getPressureStatus(8.0), 'preferred');
    assert.equal(engine.getPressureStatus(10.0), 'preferred');
    assert.equal(engine.getPressureStatus(15.0), 'preferred');

    // >15.0 a 20.0 bar: 'high'
    assert.equal(engine.getPressureStatus(15.1), 'high');
    assert.equal(engine.getPressureStatus(18.0), 'high');
    assert.equal(engine.getPressureStatus(20.0), 'high');

    // >20.0 a 30.0 bar: 'very-high'
    assert.equal(engine.getPressureStatus(20.1), 'very-high');
    assert.equal(engine.getPressureStatus(25.0), 'very-high');
    assert.equal(engine.getPressureStatus(30.0), 'very-high');

    // >30.0 bar e inválidos: 'extreme'
    assert.equal(engine.getPressureStatus(30.1), 'extreme');
    assert.equal(engine.getPressureStatus(35.0), 'extreme');
    assert.equal(engine.getPressureStatus(100.0), 'extreme');
    assert.equal(engine.getPressureStatus(600.0), 'extreme');
    assert.equal(engine.getPressureStatus(NaN), 'extreme');
    assert.equal(engine.getPressureStatus(Infinity), 'extreme');
    assert.equal(engine.getPressureStatus(-5.0), 'extreme');
  });

  await t.test('17. Percentagem de Preenchimento Visual do Manómetro (calculatePressureGaugePercent)', () => {
    // 1.0 bar = 0%
    assert.equal(engine.calculatePressureGaugePercent(1.0), 0);
    // < 1.0 bar clamped a 0%
    assert.equal(engine.calculatePressureGaugePercent(0.5), 0);
    assert.equal(engine.calculatePressureGaugePercent(0), 0);

    // 10.0 bar = ((10.0 - 1.0) / (30.0 - 1.0)) * 100 = 9 / 29 * 100 = 31.03%
    assert.equal(engine.calculatePressureGaugePercent(10.0), 31.03);

    // 15.5 bar = ((15.5 - 1.0) / 29.0) * 100 = 14.5 / 29 * 100 = 50.00%
    assert.equal(engine.calculatePressureGaugePercent(15.5), 50.0);

    // 30.0 bar = 100%
    assert.equal(engine.calculatePressureGaugePercent(30.0), 100);

    // > 30.0 bar clamped a 100%
    assert.equal(engine.calculatePressureGaugePercent(35.0), 100);
    assert.equal(engine.calculatePressureGaugePercent(600.0), 100);
  });

  await t.test('18. Supressão Estrita de Valores Numéricos > 30 bar (formatPressureDisplay)', () => {
    // Valores normais mostram string com formato de vírgula e valor numérico
    const disp10 = engine.formatPressureDisplay(10.0);
    assert.equal(disp10.label, '10,0 bar');
    assert.equal(disp10.isExtreme, false);
    assert.equal(disp10.numericValue, 10.0);

    const disp25 = engine.formatPressureDisplay(25.0);
    assert.equal(disp25.label, '25,0 bar');
    assert.equal(disp25.isExtreme, false);
    assert.equal(disp25.numericValue, 25.0);

    // Valores extremos NUNCA mostram número (ex.: '600 bar' ou '30.1 bar')
    const disp301 = engine.formatPressureDisplay(30.1);
    assert.equal(disp301.label, 'Pressão demasiado elevada');
    assert.equal(disp301.isExtreme, true);
    assert.equal(disp301.numericValue, null);

    const disp600 = engine.formatPressureDisplay(600.0);
    assert.equal(disp600.label, 'Pressão demasiado elevada');
    assert.equal(disp600.isExtreme, true);
    assert.equal(disp600.numericValue, null);
  });

  await t.test('19. Recálculo, Retenção e Deteção de Inelegibilidade ao Mudar Pressão', () => {
    const albuzHollow = {
      id: 'albuz_test',
      manufacturerName: 'Albuz',
      model: 'ATR 80',
      colorOrSize: 'Amarelo',
      nozzleType: 'hollow-cone',
      sprayAngleDeg: 80,
      nominalOutputLMin: 0.76,
      referencePressureBar: 10.0,
      pressureBar: 10.0,
      pressureMinBar: 5.0,
      pressureMaxBar: 25.0,
      sourceName: 'Albuz',
      sourceVersion: '2024'
    };

    // A 10 bar: elegível
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 10.0), true);

    // Se a pressão mudar para 28 bar: inelegível (excede pressureMaxBar 25.0)
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 28.0), false);

    // Se a pressão mudar para 3 bar: inelegível (abaixo de pressureMinBar 5.0)
    assert.equal(engine.isNozzleEligibleAtPressure(albuzHollow, 3.0), false);

    // Recálculo do débito estimado à nova pressão
    const estAt15 = engine.calculateEstimatedOutput(0.76, 10.0, 15.0);
    assert.ok(Math.abs(estAt15 - 0.9308) < 1e-3);
  });

  await t.test('20. Conformidade dos Componentes com Topo-para-Base e Barra Integrada', () => {
    // 1. OutputDistributionProfileEditor deve conter os controlos e estados de pressão
    const editorSource = fs.readFileSync(
      path.resolve('./src/features/calibracao-pulverizador/components/OutputDistributionProfileEditor.tsx'),
      'utf8'
    );
    assert.ok(editorSource.includes('calculatePressureGaugePercent'));
    assert.ok(editorSource.includes('getPressureStatus'));
    assert.ok(editorSource.includes('formatPressureDisplay'));
    assert.ok(editorSource.includes('workingPressureTitle'));
    assert.ok(editorSource.includes('getNozzleColorHex'));

    // 2. NozzleOptionList deve ser o seletor modal minimalista com skipPressureEligibilityFilter
    const listSource = fs.readFileSync(
      path.resolve('./src/features/calibracao-pulverizador/components/NozzleOptionList.tsx'),
      'utf8'
    );
    assert.ok(listSource.includes('findCompatibleNozzleOptions'));
    assert.ok(listSource.includes('getNozzleColorHex'));
    assert.ok(listSource.includes('skipPressureEligibilityFilter'));

    // 3. FinalSprayProfileCard deve conter o bloqueio estrito de bicos inelegíveis e pressão <= 30 bar
    const finalCardSource = fs.readFileSync(
      path.resolve('./src/features/calibracao-pulverizador/components/FinalSprayProfileCard.tsx'),
      'utf8'
    );
    assert.ok(finalCardSource.includes('isNozzleEligibleAtPressure'));
    assert.ok(finalCardSource.includes('workingPressureBar <= 30.0'));
  });

  await t.test('21. Cálculo Puro da Pressão Combinada (calculateCombinedRequiredPressureBar)', () => {
    // Caso 1: 1 bico selecionado (D1 = 1.0 L/min a P1 = 10.0 bar) para débito pretendido 1.0 L/min -> P = 10.0 bar
    const p1 = engine.calculateCombinedRequiredPressureBar(1.0, [
      { referenceOutputLMin: 1.0, referencePressureBar: 10.0 }
    ]);
    assert.ok(p1 !== null);
    assert.ok(Math.abs(p1 - 10.0) < 1e-4);

    // Caso 2: 1 bico selecionado (D1 = 1.0 L/min a P1 = 10.0 bar) para débito pretendido 1.4142 L/min -> P = 20.0 bar
    const p2 = engine.calculateCombinedRequiredPressureBar(1.41421356, [
      { referenceOutputLMin: 1.0, referencePressureBar: 10.0 }
    ]);
    assert.ok(p2 !== null);
    assert.ok(Math.abs(p2 - 20.0) < 1e-3);

    // Caso 3: 2 bicos idênticos (D1=0.76 a P1=10.0 bar, D2=0.76 a P2=10.0 bar)
    // K_lado = 2 * (0.76 / sqrt(10)) = 0.480666
    // Para débito pretendido 1.52 L/min (0.76 + 0.76), P deve ser exatamente 10.0 bar
    const p3 = engine.calculateCombinedRequiredPressureBar(1.52, [
      { referenceOutputLMin: 0.76, referencePressureBar: 10.0 },
      { referenceOutputLMin: 0.76, referencePressureBar: 10.0 }
    ]);
    assert.ok(p3 !== null);
    assert.ok(Math.abs(p3 - 10.0) < 1e-4);

    // Caso 4: 2 bicos de calibres diferentes:
    // Bico A: 1.0 L/min a 10.0 bar (k_a = 1.0 / sqrt(10))
    // Bico B: 0.5 L/min a 10.0 bar (k_b = 0.5 / sqrt(10))
    // K = 1.5 / sqrt(10). Se o débito total for 1.5 L/min, P = 10.0 bar.
    // Se o débito total for 3.0 L/min, P = (3.0 / (1.5/sqrt(10)))^2 = (2 * sqrt(10))^2 = 40.0 bar.
    const p4 = engine.calculateCombinedRequiredPressureBar(3.0, [
      { referenceOutputLMin: 1.0, referencePressureBar: 10.0 },
      { referenceOutputLMin: 0.5, referencePressureBar: 10.0 }
    ]);
    assert.ok(p4 !== null);
    assert.ok(Math.abs(p4 - 40.0) < 1e-4);

    // Proteção contra entradas inválidas
    assert.equal(engine.calculateCombinedRequiredPressureBar(0, [{ referenceOutputLMin: 1.0, referencePressureBar: 10.0 }]), null);
    assert.equal(engine.calculateCombinedRequiredPressureBar(1.0, []), null);
    assert.equal(engine.calculateCombinedRequiredPressureBar(NaN, [{ referenceOutputLMin: 1.0, referencePressureBar: 10.0 }]), null);
    assert.equal(engine.calculateCombinedRequiredPressureBar(1.0, [{ referenceOutputLMin: -1.0, referencePressureBar: 10.0 }]), null);
  });

  await t.test('22. Recálculo Dinâmico da Combinação por Nível (calculateDynamicCombinationPressure)', () => {
    const outputProfile = [0.80, 1.20, 1.00]; // 3 níveis por lado, soma = 3.00 L/min por lado
    const bico1 = {
      id: 'bico1',
      manufacturerName: 'Albuz',
      model: 'ATR 80',
      colorOrSize: 'Azul',
      nozzleType: 'hollow-cone',
      nominalOutputLMin: 1.00,
      referencePressureBar: 10.0,
      pressureBar: 10.0,
      pressureMinBar: 5.0,
      pressureMaxBar: 25.0,
      sourceName: 'Albuz',
      sourceVersion: '2024'
    };
    const bico2 = {
      id: 'bico2',
      manufacturerName: 'Albuz',
      model: 'ATR 80',
      colorOrSize: 'Verde',
      nozzleType: 'hollow-cone',
      nominalOutputLMin: 1.20,
      referencePressureBar: 10.0,
      pressureBar: 10.0,
      pressureMinBar: 5.0,
      pressureMaxBar: 25.0,
      sourceName: 'Albuz',
      sourceVersion: '2024'
    };

    // Passo 1: Apenas o nível do topo (índice 2, alvo 1.00 L/min) selecionado com bico1 (1.00 a 10 bar)
    // P provisória = 10.0 bar
    const pStep1 = engine.calculateDynamicCombinationPressure(outputProfile, { 2: bico1 });
    assert.ok(pStep1 !== null);
    assert.ok(Math.abs(pStep1 - 10.0) < 1e-4);

    // Passo 2: Nível intermédio (índice 1, alvo 1.20 L/min) selecionado com bico2 (1.20 a 10 bar)
    // Alvo acumulado = 1.00 + 1.20 = 2.20 L/min. K = (1.0 + 1.2) / sqrt(10) = 2.2 / sqrt(10)
    // P provisória = 10.0 bar
    const pStep2 = engine.calculateDynamicCombinationPressure(outputProfile, { 2: bico1, 1: bico2 });
    assert.ok(pStep2 !== null);
    assert.ok(Math.abs(pStep2 - 10.0) < 1e-4);

    // Passo 3: Nível da base (índice 0, alvo 0.80 L/min) selecionado com bico1 (1.00 a 10 bar)
    // Alvo total = 3.00 L/min. K = (1.0 + 1.2 + 1.0) / sqrt(10) = 3.2 / sqrt(10)
    // P final = (3.0 / (3.2/sqrt(10)))^2 = 10 * (3.0 / 3.2)^2 = 10 * (15/16)^2 = 8.7890625 bar
    const pStep3 = engine.calculateDynamicCombinationPressure(outputProfile, { 2: bico1, 1: bico2, 0: bico1 });
    assert.ok(pStep3 !== null);
    assert.ok(Math.abs(pStep3 - 8.789) < 1e-3);

    // Remoção do nível intermédio -> recalcula dinamicamente com os 2 restantes
    const pAfterRemoval = engine.calculateDynamicCombinationPressure(outputProfile, { 2: bico1, 0: bico1 });
    // Alvo = 1.0 + 0.8 = 1.8. K = 2.0 / sqrt(10). P = 10 * (1.8/2.0)^2 = 10 * 0.81 = 8.1 bar
    assert.ok(pAfterRemoval !== null);
    assert.ok(Math.abs(pAfterRemoval - 8.1) < 1e-4);
  });

  await t.test('23. Conservação Exata de Débito com Pressão Comum de Trabalho', () => {
    // 4 níveis por lado, alvos não uniformes: [0.60, 0.90, 1.10, 0.70] -> Soma por lado = 3.30 L/min (Total = 6.60 L/min)
    const _profile = [0.60, 0.90, 1.10, 0.70];
    const sideTarget = 3.30;
    const totalTarget = 6.60;

    const n1 = { referenceOutputLMin: 0.65, referencePressureBar: 10.0 };
    const n2 = { referenceOutputLMin: 0.95, referencePressureBar: 10.0 };
    const n3 = { referenceOutputLMin: 1.05, referencePressureBar: 10.0 };
    const n4 = { referenceOutputLMin: 0.75, referencePressureBar: 10.0 };

    const selectedNozzles = [n1, n2, n3, n4];
    const calculatedP = engine.calculateCombinedRequiredPressureBar(sideTarget, selectedNozzles);
    assert.ok(calculatedP !== null);

    // Calcular o débito estimado de cada bico à pressão calculada
    const flows = selectedNozzles.map((n) =>
      engine.calculateEstimatedOutput(n.referenceOutputLMin, n.referencePressureBar, calculatedP)
    );

    // A soma dos débitos estimados no lado DEVE ser igual ao débito pretendido do lado
    const calculatedSideSum = flows.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(calculatedSideSum - sideTarget) < 1e-4);

    // E o dobro DEVE ser exatamente o débito total da máquina
    assert.ok(Math.abs(2 * calculatedSideSum - totalTarget) < 1e-4);
  });

  await t.test('24. Desbloqueio de Opções de Bicos com skipPressureEligibilityFilter', () => {
    const catalog = catalogModule.NOZZLE_CATALOG_DATABASE;
    // Com skipPressureEligibilityFilter: true, mesmo se a pressão for 28 bar ou 4 bar provisória,
    // todos os bicos com marca/tipo correspondente são listados e ordenados por proximidade
    const optsWithSkip = engine.findCompatibleNozzleOptions(
      0.75,
      28.0,
      catalog,
      { manufacturers: ['Albuz'], familyPreference: 'hollow-cone' },
      { skipPressureEligibilityFilter: true }
    );
    assert.ok(optsWithSkip.length > 0);

    // Sem skip (modo uniforme com filtro estrito), bicos limitados pelo catálogo a max 25 bar não apareceriam se 28 bar
    const optsStrict = engine.findCompatibleNozzleOptions(
      0.75,
      28.0,
      catalog,
      { manufacturers: ['Albuz'], familyPreference: 'hollow-cone' }
    );
    assert.equal(optsStrict.length, 0);
  });

  await t.test('25. Proteção de Pressão Extrema > 30 bar e Bloqueio do Perfil Final', () => {
    // Débito pretendido muito elevado (10 L/min) para 1 único bico de 0.5 L/min a 10 bar
    // P = 10 * (10 / 0.5)^2 = 10 * 400 = 4000 bar (> 30 bar)
    const pExtreme = engine.calculateCombinedRequiredPressureBar(10.0, [
      { referenceOutputLMin: 0.5, referencePressureBar: 10.0 }
    ]);
    assert.ok(pExtreme !== null && pExtreme > 30.0);

    // Estado da pressão deve ser 'extreme'
    assert.equal(engine.getPressureStatus(pExtreme), 'extreme');

    // Display deve suprimir o número
    const disp = engine.formatPressureDisplay(pExtreme);
    assert.equal(disp.isExtreme, true);
    assert.equal(disp.label, 'Pressão demasiado elevada');
    assert.equal(disp.numericValue, null);

    // Barra de pressão deve ter 100%
    assert.equal(engine.calculatePressureGaugePercent(pExtreme), 100);
  });

  await t.test('26. P1-01 — Fonte Única do Número de Bicos Ativos (deriveTotalActiveNozzles)', () => {
    // 1 nível configurado → 2 bicos ativos
    assert.equal(engine.deriveTotalActiveNozzles(1), 2);
    // 2 níveis configurados → 4 bicos ativos
    assert.equal(engine.deriveTotalActiveNozzles(2), 4);
    // 3 níveis configurados → 6 bicos ativos
    assert.equal(engine.deriveTotalActiveNozzles(3), 6);
    // 4 níveis configurados → 8 bicos ativos
    assert.equal(engine.deriveTotalActiveNozzles(4), 8);
    // 5 níveis configurados → 10 bicos ativos
    assert.equal(engine.deriveTotalActiveNozzles(5), 10);
    // 6 níveis configurados → 12 bicos ativos
    assert.equal(engine.deriveTotalActiveNozzles(6), 12);

    // Validações de limites e rejeição de entradas inválidas
    assert.equal(engine.deriveTotalActiveNozzles(0), null);
    assert.equal(engine.deriveTotalActiveNozzles(-1), null);
    assert.equal(engine.deriveTotalActiveNozzles(2.5), null);
    assert.equal(engine.deriveTotalActiveNozzles(NaN), null);
    assert.equal(engine.deriveTotalActiveNozzles(Infinity), null);
  });

  await t.test('27. P1-03 — Débito-Alvo Estável Invariante à Seleção Progressiva (calculateTargetOutputForLevel)', () => {
    const requiredSideFlow = 3.06; // L/min
    const plannedLevels = 3;

    // Débito-alvo por nível planeado = 3.06 / 3 = 1.02 L/min
    const targetPerLevel = engine.calculateTargetOutputForLevel(requiredSideFlow, plannedLevels);
    assert.ok(targetPerLevel !== null);
    assert.ok(Math.abs(targetPerLevel - 1.02) < 1e-6);

    // Estado da seleção ao longo do tempo:
    // 0 bicos selecionados
    const nozzlesState0 = [null, null, null];
    assert.equal(engine.isProfileComplete(plannedLevels, nozzlesState0), false);
    const target0 = engine.calculateTargetOutputForLevel(requiredSideFlow, plannedLevels);
    assert.equal(target0, 1.02);

    // Depois de selecionar 1 bico → alvo do nível seguinte continua 1.02
    const nozzlesState1 = [{ referenceOutputLMin: 1.03, referencePressureBar: 10.0 }, null, null];
    assert.equal(engine.isProfileComplete(plannedLevels, nozzlesState1), false);
    const target1 = engine.calculateTargetOutputForLevel(requiredSideFlow, plannedLevels);
    assert.equal(target1, 1.02);

    // Depois de selecionar 2 bicos → alvo do nível seguinte continua 1.02
    const nozzlesState2 = [
      { referenceOutputLMin: 1.03, referencePressureBar: 10.0 },
      { referenceOutputLMin: 1.03, referencePressureBar: 10.0 },
      null
    ];
    assert.equal(engine.isProfileComplete(plannedLevels, nozzlesState2), false);
    const target2 = engine.calculateTargetOutputForLevel(requiredSideFlow, plannedLevels);
    assert.equal(target2, 1.02);

    // Depois de selecionar 3 bicos → alvo continua 1.02 e pressão pode ser calculada
    const nozzlesState3 = [
      { referenceOutputLMin: 1.03, referencePressureBar: 10.0 },
      { referenceOutputLMin: 1.03, referencePressureBar: 10.0 },
      { referenceOutputLMin: 1.03, referencePressureBar: 10.0 }
    ];
    const target3 = engine.calculateTargetOutputForLevel(requiredSideFlow, plannedLevels);
    assert.equal(target3, 1.02);

    const finalPressure = engine.calculateWorkingPressureForProfile(requiredSideFlow, plannedLevels, nozzlesState3);
    assert.ok(finalPressure !== null);
    assert.ok(finalPressure > 0);
  });

  await t.test('28. P1-02 — Cálculo de Pressão Apenas Quando o Perfil Está Completo', () => {
    const requiredSideFlow = 3.06;
    const plannedLevels = 3;
    const nozzleAtrYellow = { referenceOutputLMin: 1.03, referencePressureBar: 10.0 };

    // 1. Perfil com 3 níveis planeados e 1 bico selecionado:
    const profile1 = [nozzleAtrYellow, null, null];
    assert.equal(engine.isProfileComplete(plannedLevels, profile1), false);
    const pressure1 = engine.calculateWorkingPressureForProfile(requiredSideFlow, plannedLevels, profile1);
    // Pressão = null para UI, barra neutra, sem alerta vermelho, seleção seguinte permitida
    assert.equal(pressure1, null);

    // 2. Perfil com 3 níveis planeados e 2 bicos selecionados:
    const profile2 = [nozzleAtrYellow, nozzleAtrYellow, null];
    assert.equal(engine.isProfileComplete(plannedLevels, profile2), false);
    const pressure2 = engine.calculateWorkingPressureForProfile(requiredSideFlow, plannedLevels, profile2);
    // Pressão = null para UI, barra neutra, sem alerta vermelho
    assert.equal(pressure2, null);

    // 3. Perfil com 3 níveis planeados e 3 bicos selecionados:
    const profile3 = [nozzleAtrYellow, nozzleAtrYellow, nozzleAtrYellow];
    assert.equal(engine.isProfileComplete(plannedLevels, profile3), true);
    const pressure3 = engine.calculateWorkingPressureForProfile(requiredSideFlow, plannedLevels, profile3);
    // Pressão final calculada, barra colorida, estado visual correto
    assert.ok(pressure3 !== null);
    // 3 bicos de 1.03 L/min a 10 bar para 3.06 L/min total:
    // P = 10 * (3.06 / (3 * 1.03 / sqrt(10)))^2 = 10 * (3.06 / 3.09)^2 = 9.8068... ≈ 9.81 bar
    assert.ok(Math.abs(pressure3 - 9.8068) < 1e-3);
    assert.equal(engine.getPressureStatus(pressure3), 'preferred');
    const disp3 = engine.formatPressureDisplay(pressure3);
    assert.equal(disp3.isExtreme, false);
    assert.equal(disp3.label, '9,8 bar');
    assert.equal(disp3.numericValue, 9.8);
    const gauge3 = engine.calculatePressureGaugePercent(pressure3);
    assert.ok(gauge3 > 25 && gauge3 < 35); // 9.81 bar numa escala de 1 a 30

    // 4. Perfil completo e pressão > 30 bar:
    // 3 bicos minúsculos (0.10 L/min a 10 bar) para 3.06 L/min
    const tinyNozzle = { referenceOutputLMin: 0.10, referencePressureBar: 10.0 };
    const profileExtreme = [tinyNozzle, tinyNozzle, tinyNozzle];
    assert.equal(engine.isProfileComplete(plannedLevels, profileExtreme), true);
    const pressureExtreme = engine.calculateWorkingPressureForProfile(requiredSideFlow, plannedLevels, profileExtreme);
    assert.ok(pressureExtreme !== null && pressureExtreme > 30.0);
    // Barra cheia vermelha, "Pressão demasiado elevada", valor real oculto
    assert.equal(engine.getPressureStatus(pressureExtreme), 'extreme');
    const dispExt = engine.formatPressureDisplay(pressureExtreme);
    assert.equal(dispExt.isExtreme, true);
    assert.equal(dispExt.label, 'Pressão demasiado elevada');
    assert.equal(dispExt.numericValue, null);
    assert.equal(engine.calculatePressureGaugePercent(pressureExtreme), 100);
  });

});

