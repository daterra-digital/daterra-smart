import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateEppoPure,
  eppoCalculatorConfig
} from '../src/features/calculators/definitions/eppoCalculatorConfig.ts';

describe('Calculadora Agrupada EPPO (LWA + TRV) — Metodologia EPPO PP 1/239', () => {

  // =========================================================================
  // 1. MOTOR MATEMÁTICO PURO — MODO LWA (Vinha e Sebes Verticais)
  // =========================================================================

  test('1. LWA Canónico: Vinha padrão (comp=100m, linhas=10, entrelinha=2.5m, alt=1.5m, k=600, dep=400L, conc=150mL/hL)', () => {
    const res = calculateEppoPure({
      mode: 'lwa',
      comprimentoLinha: 100,
      numeroLinhas: 10,
      distanciaEntrelinhas: 2.5,
      alturaVegetacao: 1.5,
      coeficienteLwa: 600,
      capacidadeDeposito: 400,
      concProduto: 150,
      concUnit: 'mL/hL'
    });

    assert.equal(res.isValid, true);
    // Área = 100 * 2.5 * 10 = 2500 m² = 0.25 ha
    assert.equal(res.areaParcelaHa, 0.25);
    assert.equal(res.areaParcelaM2, 2500);

    // LWA = (1.5 * 2 * 10000) / 2.5 = 12000 m² LWA/ha
    assert.equal(res.indiceGeometriaValue, 12000);
    assert.equal(res.indiceGeometriaUnit, 'm² LWA/ha');

    // Vol Calda = 12000 * (600 / 10000) = 720.0 L/ha
    assert.equal(res.volCaldaLHa, 720.0);
    // Vol Total Parcela = 720 * 0.25 = 180.0 L
    assert.equal(res.volCaldaTotalParcela, 180.0);

    // Produto por Depósito (400 L com 150 mL/100L = 1.5 mL/L => 600 mL = 0.60 L)
    assert.equal(res.produtoPorDepositoValue, 0.6);
    assert.equal(res.produtoPorDepositoUnit, 'L');
    assert.equal(res.produtoPorDepositoSubValue, 600);
    assert.equal(res.produtoPorDepositoSubUnit, 'mL');

    // Produto por Hectare (720 L/ha com 1.5 mL/L => 1080 mL/ha = 1.08 L/ha)
    assert.equal(res.produtoPorHaValue, 1.08);
    assert.equal(res.produtoPorHaUnit, 'L/ha');
    assert.equal(res.produtoPorHaSubValue, 1080);
    assert.equal(res.produtoPorHaSubUnit, 'mL/ha');

    // Depósitos por Hectare = 720 / 400 = 1.8 depósitos/ha
    assert.equal(res.depositosPorHa, 1.8);
    // Depósitos Totais = 180 / 400 = 0.45 depósitos
    assert.equal(res.depositosTotalParcela, 0.45);
    assert.equal(res.isSolid, false);
  });

  // =========================================================================
  // 2. MOTOR MATEMÁTICO PURO — MODO TRV (Pomares e Frutos Secos)
  // =========================================================================

  test('2. TRV Canónico: Pomar de Fruto Seco (comp=200m, linhas=20, entrelinha=5m, alt=3.5m, larg=2m, k=0.05, dep=1000L, conc=200g/hL)', () => {
    const res = calculateEppoPure({
      mode: 'trv',
      comprimentoLinha: 200,
      numeroLinhas: 20,
      distanciaEntrelinhas: 5.0,
      alturaVegetacao: 3.5,
      larguraCopa: 2.0,
      coeficienteTrv: 0.05,
      capacidadeDeposito: 1000,
      concProduto: 200,
      concUnit: 'g/hL'
    });

    assert.equal(res.isValid, true);
    // Área = 200 * 5 * 20 = 20000 m² = 2.0 ha
    assert.equal(res.areaParcelaHa, 2.0);
    assert.equal(res.areaParcelaM2, 20000);

    // TRV = (3.5 * 2.0 * 10000) / 5.0 = 14000 m³ TRV/ha
    assert.equal(res.indiceGeometriaValue, 14000);
    assert.equal(res.indiceGeometriaUnit, 'm³ TRV/ha');

    // Vol Calda = 14000 * 0.05 = 700.0 L/ha
    assert.equal(res.volCaldaLHa, 700.0);
    // Vol Total Parcela = 700 * 2.0 = 1400.0 L
    assert.equal(res.volCaldaTotalParcela, 1400.0);

    // Produto Sólido por Depósito (1000 L com 200 g/100L = 2 g/L => 2000 g = 2.0 kg)
    assert.equal(res.produtoPorDepositoValue, 2.0);
    assert.equal(res.produtoPorDepositoUnit, 'kg');
    assert.equal(res.produtoPorDepositoSubValue, 2000);
    assert.equal(res.produtoPorDepositoSubUnit, 'g');

    // Produto por Hectare (700 L/ha com 2 g/L => 1400 g/ha = 1.4 kg/ha)
    assert.equal(res.produtoPorHaValue, 1.4);
    assert.equal(res.produtoPorHaUnit, 'kg/ha');
    assert.equal(res.produtoPorHaSubValue, 1400);
    assert.equal(res.produtoPorHaSubUnit, 'g/ha');

    // Depósitos por Hectare = 700 / 1000 = 0.7 depósitos/ha
    assert.equal(res.depositosPorHa, 0.7);
    // Depósitos Totais = 1400 / 1000 = 1.4 depósitos
    assert.equal(res.depositosTotalParcela, 1.4);
    assert.equal(res.isSolid, true);
  });

  // =========================================================================
  // 3. DIFERENTES UNIDADES DE CONCENTRAÇÃO (%, kg/hL, L/hL)
  // =========================================================================

  test('3. Concentração em %: 0.25% (250 mL/hL) líquido', () => {
    const res = calculateEppoPure({
      mode: 'lwa',
      comprimentoLinha: 100,
      numeroLinhas: 10,
      distanciaEntrelinhas: 2.0,
      alturaVegetacao: 1.0,
      coeficienteLwa: 500,
      capacidadeDeposito: 600,
      concProduto: 0.25,
      concUnit: '%'
    });

    assert.equal(res.isValid, true);
    // 0.25% = 2.5 mL/L => Depósito 600 L = 1500 mL = 1.5 L
    assert.equal(res.produtoPorDepositoValue, 1.5);
    assert.equal(res.produtoPorDepositoSubValue, 1500);
  });

  // =========================================================================
  // 4. ROBUSTEZ NUMÉRICA E TRATAMENTO DE BORDOS
  // =========================================================================

  test('4. Proteção contra entradas nulas ou negativas', () => {
    assert.equal(calculateEppoPure({
      mode: 'lwa',
      comprimentoLinha: 0,
      numeroLinhas: 10,
      distanciaEntrelinhas: 2.5,
      alturaVegetacao: 1.5,
      capacidadeDeposito: 400,
      concProduto: 100,
      concUnit: 'mL/hL'
    }).isValid, false);

    assert.equal(calculateEppoPure({
      mode: 'trv',
      comprimentoLinha: 100,
      numeroLinhas: 10,
      distanciaEntrelinhas: 2.5,
      alturaVegetacao: 1.5,
      larguraCopa: 0,
      capacidadeDeposito: 400,
      concProduto: 100,
      concUnit: 'mL/hL'
    }).isValid, false);

    assert.equal(calculateEppoPure({
      mode: 'lwa',
      comprimentoLinha: 100,
      numeroLinhas: 10,
      distanciaEntrelinhas: -2,
      alturaVegetacao: 1.5,
      capacidadeDeposito: 400,
      concProduto: 100,
      concUnit: 'mL/hL'
    }).isValid, false);
  });

  // =========================================================================
  // 5. CONFIGURAÇÃO DECLARATIVA (eppoCalculatorConfig)
  // =========================================================================

  test('5. Configuração Declarativa: Modos, campos e resultados', () => {
    assert.equal(eppoCalculatorConfig.id, 'calc_eppo');
    assert.equal(eppoCalculatorConfig.version, '1.0.0');
    assert.equal(eppoCalculatorConfig.category, 'Pulverização');
    assert.equal(eppoCalculatorConfig.modes?.length, 2);
    assert.equal(eppoCalculatorConfig.fields.length, 9);
    assert.equal(eppoCalculatorConfig.results.length, 6);

    const lwaMode = eppoCalculatorConfig.modes?.find(m => m.id === 'lwa');
    const trvMode = eppoCalculatorConfig.modes?.find(m => m.id === 'trv');

    assert.ok(lwaMode);
    assert.ok(trvMode);
    assert.ok(lwaMode.fieldIds.includes('coeficienteLwa'));
    assert.ok(!lwaMode.fieldIds.includes('larguraCopa'));
    assert.ok(trvMode.fieldIds.includes('larguraCopa'));
    assert.ok(trvMode.fieldIds.includes('coeficienteTrv'));
  });

  test('6. Validação Declarativa: Avisos contextuais (Warnings)', () => {
    // Entrelinha muito estreita para vinha (<1.5m)
    const valLwa = eppoCalculatorConfig.validate({
      mode: { rawValue: 'lwa' },
      comprimentoLinha: { rawValue: 100 },
      numeroLinhas: { rawValue: 10 },
      distanciaEntrelinhas: { rawValue: 1.2 },
      alturaVegetacao: { rawValue: 1.5 },
      coeficienteLwa: { rawValue: 600 },
      capacidadeDeposito: { rawValue: 400 },
      concProduto: { rawValue: 100 }
    });
    assert.equal(valLwa.isValid, true);
    assert.ok(valLwa.warnings['distanciaEntrelinhas']);

    // Largura de copa superior à entrelinha no pomar
    const valTrv = eppoCalculatorConfig.validate({
      mode: { rawValue: 'trv' },
      comprimentoLinha: { rawValue: 100 },
      numeroLinhas: { rawValue: 10 },
      distanciaEntrelinhas: { rawValue: 3.0 },
      alturaVegetacao: { rawValue: 3.0 },
      larguraCopa: { rawValue: 3.5 },
      coeficienteTrv: { rawValue: 0.05 },
      capacidadeDeposito: { rawValue: 600 },
      concProduto: { rawValue: 100 }
    });
    assert.equal(valTrv.isValid, true);
    assert.ok(valTrv.warnings['larguraCopa']);
  });

  // =========================================================================
  // 6. INTEGRAÇÃO COM APLICAÇÃO E ROTAS
  // =========================================================================

  test('7. Rotas e Catálogo: App.tsx e ToolsView.tsx', () => {
    const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appTsx.includes("import { EppoCalculator } from './features/eppo/EppoCalculator'"));
    assert.ok(appTsx.includes('path="/ferramentas/eppo"'));

    const toolsViewTsx = fs.readFileSync(path.resolve('src/views/ToolsView.tsx'), 'utf8');
    assert.ok(toolsViewTsx.includes("id: 'calc_eppo'"));
    assert.ok(toolsViewTsx.includes("currentViewTool === 'calc_eppo'"));
  });

  // =========================================================================
  // 7. INTEGRIDADE DE LOCALIZAÇÃO (8 IDIOMAS) E ZERO "CUBA"
  // =========================================================================

  test('8. Internacionalização: Todos os 8 idiomas possuem calc_eppo', () => {
    const langs = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];
    for (const lang of langs) {
      const loc = JSON.parse(fs.readFileSync(path.resolve(`src/i18n/locales/${lang}.json`), 'utf8'));
      assert.ok(loc.tools?.catalog?.calc_eppo, `Missing catalog.calc_eppo in ${lang}.json`);
      assert.ok(loc.microlearningContent?.calc_eppo, `Missing microlearningContent.calc_eppo in ${lang}.json`);
      assert.ok(loc.eppo?.enterDataPrompt, `Missing eppo.enterDataPrompt in ${lang}.json`);
    }
  });

  test('9. Regra Terminológica: 0% menções ao termo "cuba" em PT e BR', () => {
    const ptJson = fs.readFileSync(path.resolve('src/i18n/locales/pt.json'), 'utf8');
    const brJson = fs.readFileSync(path.resolve('src/i18n/locales/br.json'), 'utf8');
    const eppoConfig = fs.readFileSync(path.resolve('src/features/calculators/definitions/eppoCalculatorConfig.ts'), 'utf8');
    const historyCard = fs.readFileSync(path.resolve('src/features/calculators/history/CalculationHistoryCard.tsx'), 'utf8');

    assert.ok(!/\bcuba\b/i.test(ptJson), 'Termo "cuba" encontrado em pt.json');
    assert.ok(!/\bcuba\b/i.test(brJson), 'Termo "cuba" encontrado em br.json');
    assert.ok(!/\bcuba\b/i.test(eppoConfig), 'Termo "cuba" encontrado em eppoCalculatorConfig.ts');
    assert.ok(!/\bcuba\b/i.test(historyCard), 'Termo "cuba" encontrado em CalculationHistoryCard.tsx');
  });

  // =========================================================================
  // 8. DOCUMENTAÇÃO DO PILOTO FÍSICO E CENÁRIOS DE TESTE EPPO
  // =========================================================================

  test('10. Protocolo do Piloto Físico inclui Tarefas 8 e 9 para EPPO', () => {
    const protoPath = path.resolve('docs/ux/PILOTO_FISICO_PROTOCOLO.md');
    assert.ok(fs.existsSync(protoPath), 'PILOTO_FISICO_PROTOCOLO.md deve existir');
    const protoContent = fs.readFileSync(protoPath, 'utf8');

    assert.ok(protoContent.includes('T8'), 'Protocolo deve incluir Tarefa 8');
    assert.ok(protoContent.includes('Calculadora EPPO'), 'Protocolo deve referir Calculadora EPPO');
    assert.ok(protoContent.includes('T9'), 'Protocolo deve incluir Tarefa 9');
    assert.ok(protoContent.includes('Comparação de Fluxos'), 'Protocolo deve referir Comparação de Fluxos');
    assert.ok(protoContent.includes('9 tarefas'), 'Protocolo deve referir total de 9 tarefas');
  });

  test('11. Grelha de Feedback inclui Secção EPPO e Perguntas Específicas', () => {
    const feedbackPath = path.resolve('docs/ux/PILOTO_FISICO_GRELHA_FEEDBACK.md');
    assert.ok(fs.existsSync(feedbackPath), 'PILOTO_FISICO_GRELHA_FEEDBACK.md deve existir');
    const feedbackContent = fs.readFileSync(feedbackPath, 'utf8');

    assert.ok(feedbackContent.includes('Tarefa 8: Utilização Completa da Calculadora EPPO'), 'Grelha deve conter T8');
    assert.ok(feedbackContent.includes('Tarefa 9: Comparação de Fluxos'), 'Grelha deve conter T9');
    assert.ok(feedbackContent.includes('Secção Específica da Calculadora EPPO'), 'Grelha deve conter secção EPPO');
    assert.ok(feedbackContent.includes('Qual método usa na sua exploração: LWA ou TRV?'), 'Grelha deve conter pergunta 1');
    assert.ok(feedbackContent.includes('A calculadora EPPO simplifica ou complica o seu trabalho?'), 'Grelha deve conter pergunta 2');
    assert.ok(feedbackContent.includes('Prefere calculadoras individuais ou a calculadora agrupada?'), 'Grelha deve conter pergunta 3');
  });

  test('12. Cenários de Teste EPPO (EPPO_TEST_SCENARIOS.md) existem e são válidos', () => {
    const scenariosPath = path.resolve('docs/ux/EPPO_TEST_SCENARIOS.md');
    assert.ok(fs.existsSync(scenariosPath), 'EPPO_TEST_SCENARIOS.md deve existir');
    const content = fs.readFileSync(scenariosPath, 'utf8');

    assert.ok(content.includes('Cenário 1: Vinha em Espaldeira Contínua (Modo LWA)'), 'Deve conter Cenário 1');
    assert.ok(content.includes('Cenário 2: Pomar de Fruto Seco / Frutóideas (Modo TRV)'), 'Deve conter Cenário 2');
    assert.ok(content.includes('Cenário 3: Teste Comparativo de Fluxos'), 'Deve conter Cenário 3');
    assert.ok(content.includes('Matriz de Validação Visual por Breakpoint'), 'Deve conter matriz de validação visual');
  });

  test('13. Documentação de Resultados da Ronda 1, Checklist cPanel e Roadmap Fase 2', () => {
    const resPath = path.resolve('docs/ux/RONDA_1_RESULTADOS.md');
    const deployPath = path.resolve('docs/deploy/CPANEL_DEPLOY_CHECKLIST.md');
    const roadmapPath = path.resolve('docs/roadmap/FASE_2_EXPANSAO.md');

    assert.ok(fs.existsSync(resPath), 'RONDA_1_RESULTADOS.md deve existir');
    assert.ok(fs.existsSync(deployPath), 'CPANEL_DEPLOY_CHECKLIST.md deve existir');
    assert.ok(fs.existsSync(roadmapPath), 'FASE_2_EXPANSAO.md deve existir');

    const resContent = fs.readFileSync(resPath, 'utf8');
    assert.ok(resContent.includes('APROVADO PARA PRODUÇÃO'), 'Resultados devem conter decisão de aprovação');
    assert.ok(resContent.includes('91,88'), 'Resultados devem conter pontuação SUS calculada');

    const deployContent = fs.readFileSync(deployPath, 'utf8');
    assert.ok(deployContent.includes('.htaccess'), 'Checklist cPanel deve conter configuração .htaccess');
    assert.ok(deployContent.includes('Smoke Tests'), 'Checklist cPanel deve conter Smoke Tests');

    const roadmapContent = fs.readFileSync(roadmapPath, 'utf8');
    assert.ok(roadmapContent.includes('Fase 2'), 'Roadmap deve referir Fase 2');
    assert.ok(roadmapContent.includes('ISO 25358'), 'Roadmap deve conter calculadoras planeadas');
  });

});



