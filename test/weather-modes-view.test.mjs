/**
 * DATERRA Smart - Teste de Validação dos Dois Modos da Meteorologia (T5.1)
 * Validação Funcional:
 * 1. Limite estrito de modularidade (< 200 LOC) em todos os ficheiros da funcionalidade
 * 2. Ausência absoluta de emojis e integridade de ícones SVG Lucide
 * 3. Modo inicial predefinido: Meteorologia
 * 4. Alternância acessível: Tabs [Meteorologia] [Pulverização] com papéis WAI-ARIA
 * 5. Isolamento de contexto: Controlos de perfis (WeatherContextAccordion) exclusivos de Pulverização
 * 6. Preservação integral dos componentes e lógica de Pulverização
 * 7. Vista Meteorologia: Cartão generalista dedicado e faixa semanal selecionável (sem gráficos fictícios)
 * 8. Distribuição de 4 grupos na largura total da página e dados complementares (sensação/orvalho)
 * 9. Reutilização segura sem alterações no dashboard
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('T5.1 — Estrutura dos Dois Modos e Vista de Meteorologia Simples', () => {

  // -------------------------------------------------------------------------
  // 1. Limites de Modularidade (< 200 LOC)
  // -------------------------------------------------------------------------
  it('1. Todos os ficheiros T5.1 respeitam o limite estrito de < 200 LOC', () => {
    const files = [
      'src/features/weather/views/WeatherSaasView.tsx',
      'src/features/weather/components/WeatherModeToggle.tsx',
      'src/features/weather/components/WeatherGeneralView.tsx',
      'src/features/weather/components/WeatherDedicatedCard.tsx',
      'src/features/weather/components/WeatherDedicatedMetrics.tsx',
      'src/features/weather/components/DashboardWeatherCard.tsx',
      'src/features/weather/components/DashboardWeatherWeeklyCard.tsx',
      'src/features/weather/components/DashboardWeatherMetrics.tsx',
      'src/features/weather/components/DashboardWeatherHero.tsx'
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      assert.ok(fs.existsSync(fullPath), `${f} deve existir`);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines <= 200, `${f} tem ${lines} linhas, deve ter <= 200`);
    }
  });

  // -------------------------------------------------------------------------
  // 2. Ausência de Emojis e Uso Exclusivo de SVGs
  // -------------------------------------------------------------------------
  it('2. Zero emojis nos ficheiros T5.1 e uso exclusivo de Lucide SVGs', () => {
    const files = [
      'src/features/weather/views/WeatherSaasView.tsx',
      'src/features/weather/components/WeatherModeToggle.tsx',
      'src/features/weather/components/WeatherGeneralView.tsx',
      'src/features/weather/components/WeatherDedicatedCard.tsx',
      'src/features/weather/components/WeatherDedicatedMetrics.tsx'
    ];

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const f of files) {
      const content = fs.readFileSync(path.resolve(f), 'utf8');
      assert.equal(emojiRegex.test(content), false, `${f} não deve conter caracteres emoji`);
    }
  });

  // -------------------------------------------------------------------------
  // 3. Modo Inicial e Alternância Acessível (Tabs)
  // -------------------------------------------------------------------------
  it('3. Modo predefinido é Meteorologia e alternador implementa semântica WAI-ARIA tablist', () => {
    const viewContent = fs.readFileSync(path.resolve('src/features/weather/views/WeatherSaasView.tsx'), 'utf8');
    const toggleContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherModeToggle.tsx'), 'utf8');

    // Modo inicial no view
    assert.ok(
      viewContent.includes("useState<WeatherMode>('meteorologia')"),
      'Modo inicial deve ser estritamente meteorologia'
    );

    // Semântica de tabs
    assert.ok(toggleContent.includes('role="tablist"'), 'Toggle deve ter role="tablist"');
    assert.ok(toggleContent.includes('role="tab"'), 'Opções devem ter role="tab"');
    assert.ok(toggleContent.includes('aria-selected'), 'Opções devem indicar aria-selected');
    assert.ok(toggleContent.includes('aria-controls'), 'Opções devem ligar a aria-controls');
    assert.ok(toggleContent.includes('tabIndex='), 'Opções devem gerir tabIndex (0 e -1)');
    assert.ok(toggleContent.includes('ArrowRight') || toggleContent.includes('ArrowLeft'), 'Deve permitir navegação por teclado');
  });

  // -------------------------------------------------------------------------
  // 4. Isolamento dos Controlos de Perfis (Apenas em Pulverização)
  // -------------------------------------------------------------------------
  it('4. Contexto de exploração (WeatherContextAccordion) só aparece no modo Pulverização', () => {
    const viewContent = fs.readFileSync(path.resolve('src/features/weather/views/WeatherSaasView.tsx'), 'utf8');
    const generalViewContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherGeneralView.tsx'), 'utf8');

    // GeneralView não tem acordeão de contexto
    assert.equal(
      generalViewContent.includes('WeatherContextAccordion'),
      false,
      'WeatherGeneralView nunca deve renderizar WeatherContextAccordion'
    );

    // WeatherSaasView só renderiza acordeão no bloco de Pulverização (isGeneralMode ? ... : ...)
    assert.ok(
      viewContent.includes('isGeneralMode ? ('),
      'WeatherSaasView deve condicionar vistas por isGeneralMode'
    );
    assert.ok(
      viewContent.includes('<WeatherGeneralView'),
      'Modo geral deve renderizar WeatherGeneralView'
    );
    assert.ok(
      viewContent.includes('<WeatherContextAccordion'),
      'Modo pulverização deve renderizar WeatherContextAccordion'
    );
  });

  // -------------------------------------------------------------------------
  // 5. Preservação do Modo Pulverização (Componentes e Lógica)
  // -------------------------------------------------------------------------
  it('5. Modo Pulverização preserva os 4 componentes especializados e o cálculo de agregados', () => {
    const viewContent = fs.readFileSync(path.resolve('src/features/weather/views/WeatherSaasView.tsx'), 'utf8');

    assert.ok(viewContent.includes('<WeeklyDecisionSummaryCards'), 'Deve preservar WeeklyDecisionSummaryCards');
    assert.ok(viewContent.includes('<WeatherContextAccordion'), 'Deve preservar WeatherContextAccordion');
    assert.ok(viewContent.includes('<WeeklyForecastGrid'), 'Deve preservar WeeklyForecastGrid');
    assert.ok(viewContent.includes('<HourlyPlannerExpanded'), 'Deve preservar HourlyPlannerExpanded');
    assert.ok(viewContent.includes('aggregateWeeklySpraySchedule'), 'Deve preservar o motor de agregação agronómica');
  });

  // -------------------------------------------------------------------------
  // 6. Seleção Diária e Ausência de Gráficos Fictícios no Modo Meteorologia
  // -------------------------------------------------------------------------
  it('6. Modo Meteorologia integra resumo, seleção diária e não reserva espaço para gráficos', () => {
    const generalViewContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherGeneralView.tsx'), 'utf8');
    const viewContent = fs.readFileSync(path.resolve('src/features/weather/views/WeatherSaasView.tsx'), 'utf8');

    // Integração dos dois componentes generalistas adaptados
    assert.ok(generalViewContent.includes('<WeatherDedicatedCard'), 'Deve renderizar o cartão meteorológico dedicado da página');
    assert.ok(generalViewContent.includes('<DashboardWeatherWeeklyCard'), 'Deve renderizar a semana selecionável');
    assert.ok(generalViewContent.includes('hideFooter={true}'), 'Não deve renderizar links redundantes de rodapé');

    // Sem botões vazios ou espaços de gráficos (T5.2)
    assert.equal(generalViewContent.includes('chart-tab'), false, 'Não deve conter tabs de gráficos');
    assert.equal(generalViewContent.includes('<svg class="w-full h-full" viewBox="0 0 600'), false, 'Não deve conter SVG de gráfico falso');
    assert.equal(viewContent.includes('chart-tab'), false, 'Não deve conter tabs de gráficos no view');

    // Reposição de seleção diária ao mudar de localidade
    assert.ok(
      viewContent.includes('setSelectedDateIso(null)'),
      'Deve repor data selecionada em Hoje ao mudar localidade'
    );
  });

  // -------------------------------------------------------------------------
  // 7. Distribuição de 4 Grupos e Informação Complementar
  // -------------------------------------------------------------------------
  it('7. Cartão dedicado da página distribui 4 grupos na largura total com sensação e orvalho', () => {
    const cardContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherDedicatedCard.tsx'), 'utf8');
    const metricsContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherDedicatedMetrics.tsx'), 'utf8');

    // Grelha de 4 grupos
    assert.ok(cardContent.includes('lg:grid-cols-12'), 'Deve usar grelha de 12 colunas no desktop');
    assert.ok(cardContent.includes('lg:col-span-4'), 'Condições ocupam 4 colunas');
    assert.ok(metricsContent.includes('lg:col-span-3'), 'Vento e Chuva ocupam 3 colunas cada');
    assert.ok(metricsContent.includes('lg:col-span-2'), 'Humidade ocupa 2 colunas');

    // Informação complementar permitida
    assert.ok(cardContent.includes('cur.apparentTempC'), 'Deve incluir sensação térmica apenas quando disponível');
    assert.ok(metricsContent.includes('current?.dewPointC'), 'Deve incluir ponto de orvalho apenas quando disponível');

    // Proibido variáveis adicionais no cartão
    assert.equal(cardContent.includes('Delta T'), false, 'Não deve introduzir Delta T');
    assert.equal(metricsContent.includes('Delta T'), false, 'Não deve introduzir Delta T');
    assert.equal(cardContent.includes('DPV'), false, 'Não deve introduzir DPV');
    assert.equal(metricsContent.includes('DPV'), false, 'Não deve introduzir DPV');
    assert.equal(cardContent.includes('UV'), false, 'Não deve introduzir UV');
    assert.equal(metricsContent.includes('UV'), false, 'Não deve introduzir UV');
  });

  // -------------------------------------------------------------------------
  // 8. Preservação do Dashboard (DashboardView inalterado no contrato)
  // -------------------------------------------------------------------------
  it('8. DashboardView não sofre regressões e preserva Linhas 1, 2 e 3', () => {
    const dashboardContent = fs.readFileSync(path.resolve('src/views/DashboardView.tsx'), 'utf8');

    assert.ok(dashboardContent.includes('<DashboardWeatherCard'), 'Dashboard deve manter DashboardWeatherCard');
    assert.ok(dashboardContent.includes('<DashboardWeatherWeeklyCard'), 'Dashboard deve manter DashboardWeatherWeeklyCard');
    assert.ok(dashboardContent.includes('lg:col-span-1'), 'Linha 1 (1/3) preservada');
    assert.ok(dashboardContent.includes('lg:col-span-2'), 'Linha 1 (2/3) preservada');
    assert.ok(dashboardContent.includes('lg:col-span-3'), 'Linha 2 (3/3) preservada');
  });
});
