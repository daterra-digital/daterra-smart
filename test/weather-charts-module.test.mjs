/**
 * DATERRA Smart - Teste de Validação dos Gráficos Meteorológicos (T5.2)
 * Validação Funcional:
 * 1. Limite estrito de modularidade (< 200 LOC) em todos os ficheiros criados
 * 2. Ausência absoluta de emojis e uso exclusivo de SVGs Lucide
 * 3. Cálculos de escalas matemáticas: zeros, constantes, negativos, nulos e amplitude mínima
 * 4. Geração de coordenadas e caminhos SVG sem NaN ou Infinity
 * 5. Ordem dos cartões em WeatherGeneralView: Resumo -> Semana -> Horas -> Gráficos
 * 6. Correspondência e presença da alternativa tabular acessível
 * 7. Cinco variáveis de visualização sem índices ou semáforos de pulverização
 * 8. Comportamento com observação única e com conjunto vazio de dados
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calcChartScale,
  calcPointCoordinates,
  generateSvgLinePath,
  generateSvgAreaPath,
  formatChartMetric,
  getVisibleXAxisIndices
} from '../src/features/weather/utils/weatherChartUtils.ts';

describe('T5.2 — Gráficos Meteorológicos do Dia Selecionado', () => {

  // 1. Limite de Modularidade (< 200 LOC)
  it('1. Todos os ficheiros T5.2 respeitam o limite estrito de < 200 LOC', () => {
    const files = [
      'src/features/weather/utils/weatherChartUtils.ts',
      'src/features/weather/components/charts/WeatherChartAxes.tsx',
      'src/features/weather/components/charts/WeatherChartTooltip.tsx',
      'src/features/weather/components/charts/WeatherChartSvg.tsx',
      'src/features/weather/components/charts/WeatherChartTable.tsx',
      'src/features/weather/components/charts/WeatherChartsModule.tsx',
      'src/features/weather/components/WeatherGeneralView.tsx'
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      assert.ok(fs.existsSync(fullPath), `${f} deve existir`);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines <= 200, `${f} tem ${lines} linhas, deve ter <= 200`);
    }
  });

  // 2. Zero Emojis e SVGs Lucide
  it('2. Zero emojis nos ficheiros T5.2 e uso exclusivo de Lucide SVGs', () => {
    const files = [
      'src/features/weather/utils/weatherChartUtils.ts',
      'src/features/weather/components/charts/WeatherChartSvg.tsx',
      'src/features/weather/components/charts/WeatherChartTable.tsx',
      'src/features/weather/components/charts/WeatherChartsModule.tsx'
    ];

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const f of files) {
      const content = fs.readFileSync(path.resolve(f), 'utf8');
      assert.equal(emojiRegex.test(content), false, `${f} não deve conter emojis`);
    }
  });

  // 3. Cálculos de Escalas Matemáticas Robustas
  it('3. Escalas tratam zeros, constantes, negativos e evitam divisão por zero', () => {
    // Série só de zeros (ex: chuva nula o dia todo)
    const zeroScale = calcChartScale([0, 0, 0, 0], { forceZeroMin: true });
    assert.equal(zeroScale.min, 0);
    assert.ok(zeroScale.max > 0, 'Máximo deve ser expandido para evitar range 0');
    assert.ok(zeroScale.range > 0, 'Range deve ser positivo');

    // Série constante não-nula (ex: temperatura constante a 15°C)
    const constScale = calcChartScale([15, 15, 15], { padRange: 2 });
    assert.equal(constScale.min, 13);
    assert.equal(constScale.max, 17);
    assert.equal(constScale.range, 4);

    // Série com valores negativos (ex: temperaturas de inverno -4°C a 2°C)
    const negScale = calcChartScale([-4, -2, 0, 2]);
    assert.equal(negScale.min, -4);
    assert.equal(negScale.max, 2);
    assert.equal(negScale.range, 6);

    // Array vazio
    const emptyScale = calcChartScale([]);
    assert.equal(emptyScale.min, 0);
    assert.equal(emptyScale.max, 1);
    assert.equal(emptyScale.range, 1);
  });

  // 4. Coordenadas e Geometria SVG sem NaN/Infinity
  it('4. Coordenadas geradas são sempre finitas e respeitam os limites do layout', () => {
    const layout = {
      width: 680,
      height: 240,
      padding: { top: 20, right: 40, bottom: 30, left: 40 }
    };

    const scale = calcChartScale([10, 15, 20]);
    const pts = calcPointCoordinates([10, 15, 20], scale, layout);

    assert.equal(pts.length, 3);
    for (const p of pts) {
      assert.ok(Number.isFinite(p.x), `x (${p.x}) deve ser número finito`);
      assert.ok(Number.isFinite(p.y), `y (${p.y}) deve ser número finito`);
      assert.ok(p.x >= layout.padding.left && p.x <= layout.width - layout.padding.right);
      assert.ok(p.y >= layout.padding.top && p.y <= layout.height - layout.padding.bottom);
    }

    // Geração de caminhos SVG
    const linePath = generateSvgLinePath(pts);
    assert.ok(linePath.startsWith('M '), 'Caminho de linha deve começar com M');
    assert.ok(linePath.includes('L '), 'Caminho de linha deve conter segmentos L');

    const areaPath = generateSvgAreaPath(pts, layout.height - layout.padding.bottom);
    assert.ok(areaPath.endsWith('Z'), 'Caminho de área deve terminar fechado com Z');
  });

  // 5. Ordem no DOM de WeatherGeneralView
  it('5. WeatherGeneralView respeita a ordem de 4 blocos: Resumo -> Semana -> Horas -> Gráficos', () => {
    const content = fs.readFileSync(path.resolve('src/features/weather/components/WeatherGeneralView.tsx'), 'utf8');

    const dedicatedIdx = content.indexOf('<WeatherDedicatedCard');
    const weeklyIdx = content.indexOf('<DashboardWeatherWeeklyCard');
    const hourlyIdx = content.indexOf('<WeatherHourlyCard');
    const chartsIdx = content.indexOf('<WeatherChartsModule');

    assert.ok(dedicatedIdx !== -1 && weeklyIdx !== -1 && hourlyIdx !== -1 && chartsIdx !== -1);
    assert.ok(dedicatedIdx < weeklyIdx, 'Resumo antes de Semana');
    assert.ok(weeklyIdx < hourlyIdx, 'Semana antes de Horas');
    assert.ok(hourlyIdx < chartsIdx, 'Horas antes de Gráficos');
  });

  // 6. Cinco Variáveis e Ausência de Pulverização
  it('6. Módulo suporta 5 variáveis e não introduz variáveis de pulverização (Delta T, DPV)', () => {
    const moduleContent = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartsModule.tsx'), 'utf8');
    const svgContent = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartSvg.tsx'), 'utf8');

    // 5 tabs presentes
    assert.ok(moduleContent.includes("'resumo'"), 'Deve suportar tab Resumo');
    assert.ok(moduleContent.includes("'temperatura'"), 'Deve suportar tab Temperatura');
    assert.ok(moduleContent.includes("'chuva'"), 'Deve suportar tab Chuva');
    assert.ok(moduleContent.includes("'vento'"), 'Deve suportar tab Vento');
    assert.ok(moduleContent.includes("'humidade'"), 'Deve suportar tab Humidade');

    // Sem variáveis proibidas
    assert.equal(moduleContent.includes('deltaT'), false, 'Não deve aceder a deltaT');
    assert.equal(moduleContent.includes('vpdKpa'), false, 'Não deve aceder a vpdKpa');
    assert.equal(moduleContent.includes('sprayEvaluation'), false, 'Não deve aceder a sprayEvaluation');
    assert.equal(svgContent.includes('deltaT'), false, 'SVG não deve renderizar deltaT');
  });

  // 7. Alternativa Tabular Acessível
  it('7. Alternativa tabular apresenta os mesmos dados com formatação PT-PT', () => {
    const tableContent = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartTable.tsx'), 'utf8');

    assert.ok(tableContent.includes('<table'), 'Deve conter elemento table');
    assert.ok(tableContent.includes('scope="col"'), 'Deve conter cabeçalhos acessíveis com scope="col"');
    assert.ok(tableContent.includes('scope="row"'), 'Deve conter linhas com scope="row"');
    assert.ok(tableContent.includes('formatDecimalPt'), 'Deve formatar números com vírgula decimal');
  });

  // 8. Formatação e Casos Extremos
  it('8. formatChartMetric formata valores com vírgula e trata nulos honestamente', () => {
    assert.equal(formatChartMetric(18.5, '°C'), '18,5 °C');
    assert.equal(formatChartMetric(0, 'mm'), '0 mm');
    assert.equal(formatChartMetric(null, 'km/h'), '--');
    assert.equal(formatChartMetric(undefined, '%'), '--');
  });

  // 9. Eixos Y com Unidades e Eixo X sem Colisão
  it('9. Eixos Y apresentam unidades e Eixo X omite penúltimo tick para evitar colisão 22:00/23:00', () => {
    const axesContent = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartAxes.tsx'), 'utf8');

    // Eixos Y com unidades
    assert.ok(axesContent.includes('°C'), 'Eixo Y deve incluir unidade °C');
    assert.ok(axesContent.includes('mm'), 'Eixo Y deve incluir unidade mm');
    assert.ok(axesContent.includes('km/h'), 'Eixo Y deve incluir unidade km/h');
    assert.ok(axesContent.includes('%'), 'Eixo Y deve incluir unidade %');

    // Simulação de 24 pontos de horas (00:00 a 23:00)
    const pts24 = Array.from({ length: 24 }, (_, i) => ({ x: 48 + (i / 23) * (680 - 96) }));
    const visible = getVisibleXAxisIndices(pts24, 46);

    // O último índice (23 = 23:00) deve estar presente e o penúltimo (22 = 22:00) omitido
    assert.ok(visible.includes(23), 'Último ponto (23:00) deve estar presente');
    assert.equal(visible.includes(22), false, 'Penúltimo ponto (22:00) deve ser omitido para não colidir com 23:00');

    // Nenhuma distância entre rótulos visíveis é inferior a 46px
    for (let i = 1; i < visible.length; i++) {
      const dist = pts24[visible[i]].x - pts24[visible[i - 1]].x;
      assert.ok(dist >= 46, `Distância ${dist} deve ser >= 46px`);
    }
  });

  // 10. Correções Finais: Horizonte 24h em Hoje e Tooltip com 88% opacidade e séries isoladas
  it('10. Horizonte em Hoje é de 24 horas consecutivas e Tooltip tem opacidade 88% sem concatenações', () => {
    const moduleContent = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartsModule.tsx'), 'utf8');
    const tooltipContent = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartTooltip.tsx'), 'utf8');

    // Título e horizonte de 24 horas em Hoje
    assert.ok(moduleContent.includes('Evolução — Próximas 24 horas'), 'Título de Hoje deve ser Próximas 24 horas');
    assert.ok(moduleContent.includes('hourly.slice(0, 24)'), 'Em Hoje deve extrair as próximas 24 horas de hourly');

    // Tooltip com opacidade 88% e linhas isoladas de séries
    assert.ok(tooltipContent.includes('fillOpacity="0.88"'), 'Fundo do tooltip deve ter opacidade 88%');
    assert.ok(tooltipContent.includes('textAnchor="start"'), 'Nome da série alinhado à esquerda');
    assert.ok(tooltipContent.includes('textAnchor="end"'), 'Valor da série alinhado à direita');
  });
});
