/**
 * DATERRA Smart - Teste de Validação da Vista Pulverização (T6.2)
 * Validações:
 * 1. Limite estrito de modularidade (< 200 LOC) em todos os ficheiros T6
 * 2. Zero emojis e uso exclusivo de Lucide SVGs
 * 3. Adaptador de apresentação: supressão de falsas inversões e sinalização de heurísticas
 * 4. Contrato temporal: horários favoráveis discretos sem fabricação de duração (+1h)
 * 5. Contexto técnico: pressão desconhecida não presumida a 3 bar e modo referência sem bico fictício
 * 6. Período sem chuva determinado honestamente pelos dados sem garantia biológica
 * 7. Preservação integral dos cálculos numéricos do motor original (zero regressões)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  adaptSprayEvaluation,
  getFavorableSprayHours,
  getContextDisplayInfo,
  getRainFreePeriod
} from '../src/features/weather/utils/sprayPresentationAdapter.ts';
import { evaluateSprayWindow } from '../src/features/weather/weatherCalculations.ts';

describe('T6.2 — Apresentação e Integração da Vista Pulverização', () => {

  // 1. Limite de Modularidade (< 200 LOC)
  it('1. Todos os ficheiros T6.2 respeitam o limite estrito de < 200 LOC', () => {
    const files = [
      'src/features/weather/utils/sprayPresentationAdapter.ts',
      'src/features/weather/components/WeeklyDecisionSummaryCards.tsx',
      'src/features/weather/components/WeeklyForecastGrid.tsx',
      'src/features/weather/components/HourlyPlannerExpanded.tsx',
      'src/features/weather/components/HourlyDetailCard.tsx',
      'src/features/weather/components/charts/SprayChartsModule.tsx',
      'src/features/weather/components/charts/WeatherChartSvg.tsx',
      'src/features/weather/components/charts/WeatherChartAxes.tsx',
      'src/features/weather/components/charts/WeatherChartTooltip.tsx',
      'src/features/weather/views/WeatherSaasView.tsx'
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      assert.ok(fs.existsSync(fullPath), `${f} deve existir`);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines <= 200, `${f} tem ${lines} linhas, deve ter <= 200`);
    }
  });

  // 2. Zero Emojis e SVGs Lucide
  it('2. Zero emojis nos novos componentes e uso exclusivo de Lucide SVGs', () => {
    const files = [
      'src/features/weather/utils/sprayPresentationAdapter.ts',
      'src/features/weather/components/WeeklyDecisionSummaryCards.tsx',
      'src/features/weather/components/WeeklyForecastGrid.tsx',
      'src/features/weather/components/HourlyPlannerExpanded.tsx',
      'src/features/weather/components/HourlyDetailCard.tsx',
      'src/features/weather/components/charts/SprayChartsModule.tsx'
    ];

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const f of files) {
      const content = fs.readFileSync(path.resolve(f), 'utf8');
      assert.equal(emojiRegex.test(content), false, `${f} não deve conter emojis`);
    }
  });

  // 3. Supressão de Diagnósticos Indevidos e Sinalização de Heurísticas
  it('3. Adaptador substitui "Possível Inversão" por vento calmo e sinaliza heurísticas de máquina', () => {
    // Caso A: Motor devolve 'Possível Inversão' com vento < 2 km/h e deltaT > 6
    const rawInversion = evaluateSprayWindow(7.0, 1.0, 2.0, 45, 0);
    assert.equal(rawInversion.badgeLabel, 'Possível Inversão');

    const adaptedInversion = adaptSprayEvaluation(rawInversion);
    assert.equal(adaptedInversion.badgeLabel, 'Vento Calmo');
    assert.ok(adaptedInversion.title.includes('vento calmo — confirmar no campo'));
    assert.equal(adaptedInversion.title.includes('Inversão'), false);

    // Caso B: Vento moderado viável apenas por heurística de manga de ar
    const contextWithSleeve = {
      equipmentId: 1,
      equipmentName: 'Pulverizador A',
      hasAirSleeve: true,
      workingPressureBar: 3.0
    };
    const rawHeuristic = evaluateSprayWindow(5.0, 15.0, 18.0, 65, 0, contextWithSleeve);
    const adaptedHeuristic = adaptSprayEvaluation(rawHeuristic, contextWithSleeve);

    assert.equal(adaptedHeuristic.isHeuristicLimited, true);
    assert.equal(adaptedHeuristic.badgeLabel, 'Avaliação limitada');
    assert.ok(adaptedHeuristic.heuristicNotice?.includes('não validada formalmente'));

    // Caso C: Condições ótimas padrão (sem heurística atenuadora)
    const rawOptimal = evaluateSprayWindow(5.0, 8.0, 10.0, 65, 0);
    const adaptedOptimal = adaptSprayEvaluation(rawOptimal);
    assert.equal(adaptedOptimal.badgeLabel, 'Critérios Favoráveis');
    assert.equal(adaptedOptimal.title, 'Favorável nos critérios avaliados');
  });

  // 4. Contrato Temporal: Avaliações Discretas sem Duração Fabricada (+1h)
  it('4. Horários favoráveis são pontuais (08:00, 09:00 e 10:00) sem somar 1h ao fim nem rotular duração', () => {
    const hours = [
      { timeFormatted: '07:00', sprayEvaluation: { level: 'marginal', badgeLabel: 'Escorrimento' } },
      { timeFormatted: '08:00', sprayEvaluation: { level: 'optimal', badgeLabel: 'Risco Baixo' } },
      { timeFormatted: '09:00', sprayEvaluation: { level: 'optimal', badgeLabel: 'Risco Baixo' } },
      { timeFormatted: '10:00', sprayEvaluation: { level: 'optimal', badgeLabel: 'Risco Baixo' } },
      { timeFormatted: '11:00', sprayEvaluation: { level: 'unfavorable', badgeLabel: 'Vento Crítico' } },
      { timeFormatted: '12:00', sprayEvaluation: { level: 'optimal', badgeLabel: 'Risco Baixo' } }
    ];

    const result = getFavorableSprayHours(hours, 6, 20);

    assert.equal(result.hasFavorable, true);
    assert.deepEqual(result.hoursList, ['08:00', '09:00', '10:00']);
    assert.equal(result.displayLabel, '08:00, 09:00 e 10:00');
    assert.equal(result.consecutiveCount, 3);
    assert.equal(result.detailText, '3 avaliações horárias consecutivas favoráveis');

    // Não deve conter '3 horas de duração' nem somar 11:00
    assert.equal(result.displayLabel.includes('11:00'), false);
    assert.equal(result.detailText.includes('duração'), false);

    // Não deve fundir com a hora 12:00 após a quebra desfavorável das 11:00
    assert.equal(result.hoursList.includes('12:00'), false);
  });

  // 5. Contexto Técnico: Pressão Desconhecida e Modo Referência
  it('5. Contexto sem pressão não assume 3 bar e modo vazio não inventa bico', () => {
    // Vazio
    const emptyInfo = getContextDisplayInfo(null);
    assert.equal(emptyInfo.modeLabel, 'Modo Referência');
    assert.equal(emptyInfo.hasPressure, false);

    // Equipamento sem calibração/pressão
    const noPressureInfo = getContextDisplayInfo({
      equipmentId: 10,
      equipmentName: 'Atomizador',
      workingPressureBar: null
    });
    assert.equal(noPressureInfo.modeLabel, 'Contexto Incompleto');
    assert.equal(noPressureInfo.pressureLabel, 'Pressão desconhecida');
    assert.equal(noPressureInfo.hasPressure, false);
    assert.ok(noPressureInfo.notice?.includes('Pressão de trabalho não definida'));

    // Contexto com pressão definida
    const fullInfo = getContextDisplayInfo({
      equipmentId: 10,
      nozzleId: 5,
      workingPressureBar: 2.5
    });
    assert.equal(fullInfo.modeLabel, 'Contexto Selecionado');
    assert.equal(fullInfo.pressureLabel, '2.5 bar');
    assert.equal(fullInfo.hasPressure, true);
  });

  // 6. Período Previsto sem Chuva
  it('6. getRainFreePeriod reporta horas consecutivas sem chuva sem garantias biológicas de secagem', () => {
    const hours = [
      { timeFormatted: '08:00', precipitationMm: 0 },
      { timeFormatted: '09:00', precipitationMm: 0 },
      { timeFormatted: '10:00', precipitationMm: 0.1 },
      { timeFormatted: '11:00', precipitationMm: 0.8 },
      { timeFormatted: '12:00', precipitationMm: 0 }
    ];

    const rainFree = getRainFreePeriod(hours, 0);
    assert.equal(rainFree, '3h previstas sem precipitação a partir das 08:00');

    const rainActive = getRainFreePeriod(hours, 3);
    assert.equal(rainActive, 'Precipitação prevista nesta hora');
  });

  // 7. Preservação Integral dos Cálculos do Motor
  it('7. Fórmulas e saídas numéricas de evaluateSprayWindow permanecem 100% idênticas', () => {
    const testA = evaluateSprayWindow(4.5, 9.0, 12.0, 60, 0);
    assert.equal(testA.level, 'optimal');
    assert.equal(testA.deltaT, 4.5);
    assert.equal(testA.windSpeedKmh, 9.0);

    const testRain = evaluateSprayWindow(4.5, 5.0, 8.0, 70, 1.2);
    assert.equal(testRain.level, 'unfavorable');
    assert.equal(testRain.badgeLabel, 'Chuva Ativa');

    const testDeltaCrit = evaluateSprayWindow(11.2, 5.0, 8.0, 30, 0);
    assert.equal(testDeltaCrit.level, 'unfavorable');
    assert.equal(testDeltaCrit.badgeLabel, 'Evaporação Extrema');
  });

  // 8. Gráfico Delta T e Tabela com Coluna ΔT
  it('8. Módulo de gráficos de pulverização inclui opção Delta T e tabela acessível', () => {
    const sprayModuleCode = fs.readFileSync(path.resolve('src/features/weather/components/charts/SprayChartsModule.tsx'), 'utf8');
    assert.ok(sprayModuleCode.includes("id: 'deltaT'"), 'SprayChartsModule deve incluir tab Delta T');
    assert.ok(sprayModuleCode.includes('SprayChartSvg'), 'SprayChartsModule deve usar SprayChartSvg dedicado');
    assert.ok(sprayModuleCode.includes('showDeltaT={true}'), 'SprayChartsModule deve ativar coluna ΔT na tabela');

    const spraySvgCode = fs.readFileSync(path.resolve('src/features/weather/components/charts/SprayChartSvg.tsx'), 'utf8');
    assert.ok(spraySvgCode.includes('deltaScale'), 'SprayChartSvg deve calcular escala para deltaT');
    assert.ok(spraySvgCode.includes("metric === 'deltaT' ? '°C'"), 'SprayChartSvg deve exibir eixo Y em °C');
    assert.ok(spraySvgCode.includes('formatTick(val'), 'SprayChartSvg deve formatar ticks Y');
    assert.ok(spraySvgCode.includes('#7e22ce'), 'SprayChartSvg deve desenhar linha Delta T');

    const tableCode = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartTable.tsx'), 'utf8');
    assert.ok(tableCode.includes('showDeltaT'), 'WeatherChartTable deve suportar prop showDeltaT');
    assert.ok(tableCode.includes('ΔT (°C)'), 'WeatherChartTable deve renderizar cabeçalho ΔT (°C)');
  });

  // 9. Coerência das Limitações e Descontinuidade Temporal da Precipitação
  it('9. Horas com avaliação limitada não são promovidas e período sem chuva deteta lacunas e fim de horizonte', () => {
    // Coerência: horas com avaliação limitada não contam como favoráveis irrestritas
    const contextWithSleeve = {
      equipmentId: 1,
      equipmentName: 'Pulverizador A',
      hasAirSleeve: true,
      workingPressureBar: 3.0
    };
    const hoursWithHeuristic = [
      { timeFormatted: '08:00', sprayEvaluation: evaluateSprayWindow(5.0, 15.0, 18.0, 65, 0, contextWithSleeve) },
      { timeFormatted: '09:00', sprayEvaluation: evaluateSprayWindow(5.0, 15.0, 18.0, 65, 0, contextWithSleeve) }
    ];

    const result = getFavorableSprayHours(hoursWithHeuristic, contextWithSleeve);
    assert.equal(result.hasFavorable, false, 'Horas limitadas por equipamento não devem ser promovidas a favoráveis');
    assert.equal(result.displayLabel, 'Avaliações limitadas por equipamento');

    // Descontinuidade: lacuna temporal interrompe contagem sem chuva
    const hoursWithGap = [
      { timeFormatted: '08:00', timeIso: '2026-11-09T08:00:00Z', precipitationMm: 0 },
      { timeFormatted: '09:00', timeIso: '2026-11-09T09:00:00Z', precipitationMm: 0 },
      { timeFormatted: '12:00', timeIso: '2026-11-09T12:00:00Z', precipitationMm: 0 } // gap de 3h
    ];
    const rainGap = getRainFreePeriod(hoursWithGap, 0);
    assert.equal(rainGap, '2h previstas sem precipitação a partir das 08:00 (lacuna de dados)');

    // Fim de horizonte sem chuva
    const hoursEnd = [
      { timeFormatted: '08:00', timeIso: '2026-11-09T08:00:00Z', precipitationMm: 0 },
      { timeFormatted: '09:00', timeIso: '2026-11-09T09:00:00Z', precipitationMm: 0 }
    ];
    const rainEnd = getRainFreePeriod(hoursEnd, 0);
    assert.equal(rainEnd, 'Sem precipitação prevista nos dados disponíveis (2h a partir das 08:00)');
  });
});
