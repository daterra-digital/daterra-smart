/**
 * DATERRA Smart - Teste de Validação do Widget Meteorológico do Dashboard (T4)
 * Validação Funcional:
 * 1. Limites estritos de modularidade (< 200 LOC) em todos os ficheiros
 * 2. Ausência absoluta de emojis e integridade de ícones SVG Lucide
 * 3. Grelha do Dashboard em 3 Linhas com ordem lógica linear no DOM
 * 4. Cartão Diário: Ícone limpo sem caixa amarela, sem Delta T, sem sensação térmica
 * 5. Cartão Semanal: Botões diários sem navegação acidental (button, não Link), unidades e decimais PT
 * 6. Semântica e Cálculo do Vento: Azimute de origem vs Sentido de deslocação da seta
 * 7. Tratamento honesto de dados nulos ('--') sem números inventados
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseWindDirection, formatDecimalPt } from '../src/features/weather/utils/windDirection.ts';

describe('T4 — Reorganização da Meteorologia em Dois Cartões & Seleção Diária', () => {

  // -------------------------------------------------------------------------
  // 1. Limites de Modularidade (< 200 LOC)
  // -------------------------------------------------------------------------
  it('1. Todos os componentes do widget e a view respeitam o limite estrito de < 200 LOC', () => {
    const files = [
      'src/features/weather/components/DashboardWeatherCard.tsx',
      'src/features/weather/components/DashboardWeatherWeeklyCard.tsx',
      'src/features/weather/components/DashboardWeatherWeeklyDayButton.tsx',
      'src/features/weather/components/DashboardWeatherMetrics.tsx',
      'src/features/weather/components/DashboardWeatherHero.tsx',
      'src/features/weather/components/WindDirectionIndicator.tsx',
      'src/features/weather/utils/windDirection.ts',
      'src/views/DashboardView.tsx'
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      assert.ok(fs.existsSync(fullPath), `${f} deve existir`);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines <= 200, `${f} tem ${lines} linhas, deve ter <= 200`);
    }
  });

  // -------------------------------------------------------------------------
  // 2. Ausência de Emojis e Conformidade de Ícones
  // -------------------------------------------------------------------------
  it('2. Zero emojis nos componentes do widget e uso exclusivo de Lucide SVGs', () => {
    const files = [
      'src/features/weather/components/DashboardWeatherCard.tsx',
      'src/features/weather/components/DashboardWeatherWeeklyCard.tsx',
      'src/features/weather/components/DashboardWeatherWeeklyDayButton.tsx',
      'src/features/weather/components/DashboardWeatherMetrics.tsx',
      'src/features/weather/components/DashboardWeatherHero.tsx',
      'src/features/weather/components/WindDirectionIndicator.tsx'
    ];

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const f of files) {
      const content = fs.readFileSync(path.resolve(f), 'utf8');
      assert.equal(emojiRegex.test(content), false, `${f} não deve conter caracteres emoji`);
    }
  });

  // -------------------------------------------------------------------------
  // 3. Estrutura da Grelha do Dashboard em Três Linhas
  // -------------------------------------------------------------------------
  it('3. DashboardView implementa as 3 linhas estruturais com ordem correta no DOM', () => {
    const viewContent = fs.readFileSync(path.resolve('src/views/DashboardView.tsx'), 'utf8');

    // Ordem estrita no DOM
    const idxWelcome = viewContent.indexOf('Boas-vindas');
    const idxDay = viewContent.indexOf('<DashboardWeatherCard');
    const idxWeekly = viewContent.indexOf('<DashboardWeatherWeeklyCard');
    const idxAcademy = viewContent.indexOf('Academia DATERRA');
    const idxFavorites = viewContent.indexOf('<DashboardFavoritesCard');

    assert.ok(idxWelcome !== -1, 'Boas-vindas deve existir');
    assert.ok(idxDay !== -1, 'DashboardWeatherCard deve existir');
    assert.ok(idxWeekly !== -1, 'DashboardWeatherWeeklyCard deve existir');
    assert.ok(idxAcademy !== -1, 'Academia deve existir');
    assert.ok(idxFavorites !== -1, 'Favoritas deve existir');

    assert.ok(idxWelcome < idxDay, 'Boas-vindas deve preceder Dia');
    assert.ok(idxDay < idxWeekly, 'Dia deve preceder Semana');
    assert.ok(idxWeekly < idxAcademy, 'Semana deve preceder Academia');
    assert.ok(idxAcademy < idxFavorites, 'Academia deve preceder Favoritas');

    // Semana ocupa largura total útil (lg:col-span-3)
    assert.ok(viewContent.includes('lg:col-span-3'), 'Semana deve ocupar as 3 colunas');
  });

  // -------------------------------------------------------------------------
  // 4. Cartão Diário Compacto: Sem Caixa Própria, Sem Delta T, Sem Sensação
  // -------------------------------------------------------------------------
  it('4. Cartão Diário compacto sem caixa amarela no ícone, sem Delta T e sem sensação térmica', () => {
    const cardContent = fs.readFileSync(path.resolve('src/features/weather/components/DashboardWeatherCard.tsx'), 'utf8');
    const metricsContent = fs.readFileSync(path.resolve('src/features/weather/components/DashboardWeatherMetrics.tsx'), 'utf8');

    assert.equal(cardContent.includes('rounded-3xl bg-amber-50'), false, 'Ícone principal não deve ter caixa própria');
    assert.equal(cardContent.includes('Sensação:'), false, 'Não deve exibir sensação térmica');
    assert.equal(cardContent.includes('Delta T'), false, 'Card Diário não deve exibir Delta T');
    assert.equal(metricsContent.includes('Delta T'), false, 'Métricas não devem exibir Delta T');
    assert.equal(metricsContent.includes('Ponto de orvalho'), false, 'Métricas não devem exibir Ponto de orvalho');
    assert.equal(metricsContent.includes('bg-[#F2F2F2] p-3.5'), false, 'Não deve ter painel exterior cinzento com cartões aninhados');
  });

  // -------------------------------------------------------------------------
  // 5. Botões Semanais e Ações Canónicas
  // -------------------------------------------------------------------------
  it('5. Cartão Semanal possui botões diários sem navegação acidental e ações canónicas', () => {
    const weeklyContent = fs.readFileSync(path.resolve('src/features/weather/components/DashboardWeatherWeeklyCard.tsx'), 'utf8');
    const buttonContent = fs.readFileSync(path.resolve('src/features/weather/components/DashboardWeatherWeeklyDayButton.tsx'), 'utf8');

    assert.ok(weeklyContent.includes('Próximos 7 Dias'), 'Cabeçalho deve indicar Próximos 7 Dias');
    assert.ok(weeklyContent.includes('daily.slice(0, 7)'), 'Deve fatiar até aos 7 dias');
    
    // Os cartões diários são botões para seleção, NÃO links para a página de meteorologia
    assert.ok(buttonContent.includes('<button'), 'Deve renderizar botões para os dias');
    assert.ok(buttonContent.includes('aria-pressed'), 'Botões diários devem ter atributo aria-pressed');
    assert.equal(buttonContent.includes('<Link to="/meteorologia" key={item.dateIso'), false, 'Dias não devem ser Links');

    // Apenas o rodapé possui links canónicos
    assert.ok(weeklyContent.includes('to="/meteorologia"'), 'Deve conter links canónicos no rodapé para /meteorologia');
    assert.ok(weeklyContent.includes('Ver Janelas de Pulverização'), 'Deve conter atalho de pulverização');
    assert.ok(weeklyContent.includes('Abrir Meteorologia Completa'), 'Deve conter botão de Meteorologia');
  });

  // -------------------------------------------------------------------------
  // 6. Semântica e Cálculo da Direção do Vento (Origem vs Sentido da Seta)
  // -------------------------------------------------------------------------
  it('6. Convenção do Vento: Origem meteorológica em graus e seta de deslocação', () => {
    // 180°: Vento de Sul sopra para Norte -> Seta deve apontar para Norte (0°)
    const southWind = parseWindDirection(180);
    assert.ok(southWind, 'parseWindDirection(180) deve retornar dados');
    assert.equal(southWind.originName, 'Sul');
    assert.equal(southWind.originPreposition, 'De sul');
    assert.equal(southWind.targetName, 'norte');
    assert.equal(southWind.targetPreposition, 'para norte');
    assert.equal(southWind.displacementDeg, 0, 'Seta de vento de Sul deve rodar para 0° (Norte)');

    // 0° / 360°: Vento de Norte sopra para Sul -> Seta deve apontar para Sul (180°)
    const northWind = parseWindDirection(0);
    assert.ok(northWind);
    assert.equal(northWind.originName, 'Norte');
    assert.equal(northWind.originPreposition, 'De norte');
    assert.equal(northWind.targetName, 'sul');
    assert.equal(northWind.displacementDeg, 180, 'Seta de vento de Norte deve rodar para 180° (Sul)');

    // 90°: Vento de Este sopra para Oeste -> Seta deve apontar para Oeste (270°)
    const eastWind = parseWindDirection(90);
    assert.ok(eastWind);
    assert.equal(eastWind.originName, 'Este');
    assert.equal(eastWind.originPreposition, 'De este');
    assert.equal(eastWind.displacementDeg, 270, 'Seta de vento de Este deve rodar para 270° (Oeste)');

    // 270°: Vento de Oeste sopra para Este -> Seta deve apontar para Este (90°)
    const westWind = parseWindDirection(270);
    assert.ok(westWind);
    assert.equal(westWind.originName, 'Oeste');
    assert.equal(westWind.originPreposition, 'De oeste');
    assert.equal(westWind.displacementDeg, 90, 'Seta de vento de Oeste deve rodar para 90° (Este)');

    // Fronteira 359° e 1° (Norte)
    const nearNorth1 = parseWindDirection(359);
    assert.equal(nearNorth1.originName, 'Norte');
    const nearNorth2 = parseWindDirection(1);
    assert.equal(nearNorth2.originName, 'Norte');

    // Nulo, indefinido e NaN
    assert.equal(parseWindDirection(null), null);
    assert.equal(parseWindDirection(undefined), null);
    assert.equal(parseWindDirection(Number.NaN), null);
  });

  // -------------------------------------------------------------------------
  // 7. Formatação Numérica e Tratamento Honesto de Dados Ausentes
  // -------------------------------------------------------------------------
  it('7. Formatação com vírgula em PT-PT e tratamento honesto de nulos com "--"', () => {
    assert.equal(formatDecimalPt(8.8), '8,8');
    assert.equal(formatDecimalPt(0), '0');
    assert.equal(formatDecimalPt(14.0), '14');
    assert.equal(formatDecimalPt(null), '--');
    assert.equal(formatDecimalPt(undefined), '--');

    const heroContent = fs.readFileSync(path.resolve('src/features/weather/components/DashboardWeatherHero.tsx'), 'utf8');
    const metricsContent = fs.readFileSync(path.resolve('src/features/weather/components/DashboardWeatherMetrics.tsx'), 'utf8');

    assert.equal(heroContent.includes('?? 24'), false, 'Hero não deve ter fallback 24°C');
    assert.equal(metricsContent.includes('?? 24'), false, 'Metrics não deve ter fallback 24°C');
    assert.ok(heroContent.includes("'--'"), "Hero deve conter indicador '--'");
    assert.ok(metricsContent.includes("'--'"), "Metrics deve conter indicador '--'");
  });
});
