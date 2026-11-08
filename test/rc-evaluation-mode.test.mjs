/**
 * DATERRA Smart - Teste de Regressão do Modo de Avaliação RC (Release Candidate)
 * Validação de Localhost Dedicado (:5175), Etiquetas 'PAGES' e 'RC', e Cartão de Versão Oficial
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Importa os utilitários do modo RC
const { CANONICAL_PAGES_TOOL_IDS, getToolReleaseBadge } = await import('../src/utils/rcEvaluationMode.ts');
const { APP_VERSION_INFO } = await import('../src/config/versionInfo.ts');

describe('Modo de Avaliação de Release Candidate (V-RC)', () => {

  it('1. Deve listar rigorosamente as 11 ferramentas canónicas publicadas no Pages com suporte a aliases de catálogo', () => {
    const expected = [
      'ajuste_dose_eppo',
      'calc_aplicacao_manual',
      'calc_area_parede_foliar',
      'verificador_ph',
      'calc_ph',
      'calc_concentracao',
      'calc_dose',
      'mistura_compatibilidade',
      'ordem_mistura',
      'pre_inspecao_dgav',
      'calc_pre_inspecao',
      'comparador_bicos',
      'calc_tabelas_debito',
      'calc_velocidade_real',
      'calc_volume_copa'
    ];

    for (const id of expected) {
      assert.ok(CANONICAL_PAGES_TOOL_IDS.has(id), `Ferramenta canónica deve constar no Pages: ${id}`);
    }

    // Ferramentas que NÃO devem estar no Pages (são RC):
    assert.ok(!CANONICAL_PAGES_TOOL_IDS.has('calc_calibracao_pulverizador'), 'Calibração deve ser RC');
    assert.ok(!CANONICAL_PAGES_TOOL_IDS.has('calc_eppo'), 'EPPO deve ser RC');
    assert.ok(!CANONICAL_PAGES_TOOL_IDS.has('calc_debito_total'), 'Débito Total deve ser RC');
  });

  it('2. package.json deve conter script dev:rc com porto 5175 e versão 1.0.1-rc1', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
    assert.equal(pkg.version, '1.0.1-rc1', 'Versão do package.json deve ser 1.0.1-rc1');
    assert.ok(pkg.scripts['dev:rc'], 'Deve declarar script dev:rc');
    assert.ok(pkg.scripts['dev:rc'].includes('5175'), 'dev:rc deve usar o porto 5175');
  });

  it('3. VersionCard, versionInfo e ficheiros de idioma devem refletir a versão 1.0.1-rc1', () => {
    const helpView = fs.readFileSync(path.resolve('src/views/HelpView.tsx'), 'utf8');
    const versionCard = fs.readFileSync(path.resolve('src/components/version/VersionCard.tsx'), 'utf8');
    const ptPT = fs.readFileSync(path.resolve('src/i18n/locales/pt-PT.json'), 'utf8');
    const pt = fs.readFileSync(path.resolve('src/i18n/locales/pt.json'), 'utf8');

    assert.equal(APP_VERSION_INFO.version, '1.0.1-rc1', 'versionInfo deve ser 1.0.1-rc1');
    assert.ok(helpView.includes('<VersionCard'), 'HelpView deve integrar o componente VersionCard');
    assert.ok(versionCard.includes('APP_VERSION_INFO'), 'VersionCard deve ler de APP_VERSION_INFO');
    assert.ok(ptPT.includes('1.0.1-rc1'), 'pt-PT.json deve referir 1.0.1-rc1');
    assert.ok(pt.includes('1.0.1-rc1'), 'pt.json deve referir 1.0.1-rc1');
  });

  it('4. Simulação: getToolReleaseBadge deve suprimir etiquetas em github.io ou daterra.com.pt e ativar em :5175', () => {
    // Simula hostname público
    globalThis.window = {
      location: {
        hostname: 'daterra-digital.github.io',
        port: ''
      }
    };

    assert.equal(getToolReleaseBadge('ajuste_dose_eppo'), null, 'Deve suprimir etiqueta PAGES no github.io');
    assert.equal(getToolReleaseBadge('drone_buffer_zone'), null, 'Deve suprimir etiqueta RC no github.io');

    // Simula cPanel
    globalThis.window.location.hostname = 'smart.daterra.com.pt';
    assert.equal(getToolReleaseBadge('ajuste_dose_eppo'), null, 'Deve suprimir etiqueta PAGES no cPanel');

    // Simula localhost :5175 (Modo RC ativo)
    globalThis.window.location.hostname = 'localhost';
    globalThis.window.location.port = '5175';

    // As 11 ferramentas canónicas devem ter PAGES:
    assert.equal(getToolReleaseBadge('ajuste_dose_eppo'), 'PAGES', 'Ajuste da Dose deve ter PAGES');
    assert.equal(getToolReleaseBadge('calc_aplicacao_manual'), 'PAGES', 'Aplicação Manual deve ter PAGES');
    assert.equal(getToolReleaseBadge('calc_area_parede_foliar'), 'PAGES', 'Área de Parede Foliar deve ter PAGES');
    assert.equal(getToolReleaseBadge('verificador_ph'), 'PAGES', 'Consultar pH deve ter PAGES');
    assert.equal(getToolReleaseBadge('calc_concentracao'), 'PAGES', 'Concentração deve ter PAGES');
    assert.equal(getToolReleaseBadge('calc_dose'), 'PAGES', 'Dose deve ter PAGES');
    assert.equal(getToolReleaseBadge('mistura_compatibilidade'), 'PAGES', 'Ordem de Mistura deve ter PAGES');
    assert.equal(getToolReleaseBadge('pre_inspecao_dgav'), 'PAGES', 'Pré-Inspeção deve ter PAGES');
    assert.equal(getToolReleaseBadge('comparador_bicos'), 'PAGES', 'Tabelas de Débito (Comparador) deve ter PAGES');
    assert.equal(getToolReleaseBadge('calc_velocidade_real'), 'PAGES', 'Velocidade Real deve ter PAGES');
    assert.equal(getToolReleaseBadge('calc_volume_copa'), 'PAGES', 'Volume de Calda deve ter PAGES');

    // As ferramentas em desenvolvimento devem ter RC:
    assert.equal(getToolReleaseBadge('calc_calibracao_pulverizador'), 'RC', 'Calibração Pulverizador deve ter RC');
    assert.equal(getToolReleaseBadge('calc_eppo'), 'RC', 'Calculadora EPPO deve ter RC');
    assert.equal(getToolReleaseBadge('calc_debito_total'), 'RC', 'Débito Total deve ter RC');
    assert.equal(getToolReleaseBadge('drone_buffer_zone'), 'RC', 'Drone Buffer Zone deve ter RC');
    assert.equal(getToolReleaseBadge('smart_debito'), 'RC', 'Smart Débito deve ter RC');
  });

  it('5. ToolsView não deve conter a ferramenta inexistente Caderno de Campo Digital', () => {
    const toolsView = fs.readFileSync(path.resolve('src/views/ToolsView.tsx'), 'utf8');
    assert.ok(!toolsView.includes('gestao_caderno_campo'), 'Caderno de Campo Digital não deve constar no catálogo');
  });

  it('6. DashboardView não deve conter o banner de teste Mapas NDVI', () => {
    const dashboardView = fs.readFileSync(path.resolve('src/views/DashboardView.tsx'), 'utf8');
    assert.ok(!dashboardView.includes('DashboardNdviCard'), 'DashboardNdviCard não deve constar no Dashboard');
  });

  it('7. Norma de Carateres: Títulos <= 35 carateres e Descrições <= 110 carateres', () => {
    const toolsView = fs.readFileSync(path.resolve('src/views/ToolsView.tsx'), 'utf8');
    // Encontra todos os names no TOOLS_CATALOG
    const nameMatches = toolsView.matchAll(/name:\s*['"]([^'"]+)['"]/g);
    for (const match of nameMatches) {
      const name = match[1];
      assert.ok(
        name.length <= 35,
        `Título "${name}" excede 35 carateres (${name.length} chars)`
      );
    }

    const descMatches = toolsView.matchAll(/description:\s*['"]([^'"]+)['"]/g);
    for (const match of descMatches) {
      const desc = match[1];
      assert.ok(
        desc.length <= 110,
        `Descrição "${desc.slice(0, 30)}..." excede 110 carateres (${desc.length} chars)`
      );
    }
  });

  it('8. ToolCard.tsx não deve usar line-clamp-1 no título', () => {
    const toolCard = fs.readFileSync(path.resolve('src/components/tools/ToolCard.tsx'), 'utf8');
    assert.ok(!toolCard.includes('line-clamp-1'), 'ToolCard não deve conter line-clamp-1 para evitar reticências');
  });

  it('9. Uniformização de Etiquetas: RC deve ser estritamente âmbar/laranja e PAGES verde de alto contraste', () => {
    const toolCard = fs.readFileSync(path.resolve('src/components/tools/ToolCard.tsx'), 'utf8');
    assert.ok(toolCard.includes('bg-amber-100 text-amber-950 border border-amber-400'), 'ToolCard RC deve usar âmbar alto contraste');
    assert.ok(toolCard.includes('bg-emerald-100 text-emerald-950 border border-emerald-400'), 'ToolCard PAGES deve usar esmeralda alto contraste');

    const nav = fs.readFileSync(path.resolve('src/components/layout/PrivateDesktopNav.tsx'), 'utf8');
    assert.ok(nav.includes('bg-amber-400 text-slate-950'), 'PrivateDesktopNav RC deve usar âmbar de alto contraste sobre fundo escuro');
    assert.ok(!nav.includes('bg-blue-500/20 text-blue-200'), 'PrivateDesktopNav não deve conter badge azul');

    const drawer = fs.readFileSync(path.resolve('src/components/layout/PrivateNavDrawer.tsx'), 'utf8');
    assert.ok(drawer.includes('bg-amber-400 text-slate-950'), 'PrivateNavDrawer RC deve usar âmbar de alto contraste');

    const academy = fs.readFileSync(path.resolve('src/views/AcademyView.tsx'), 'utf8');
    assert.ok(academy.includes('bg-amber-100 border border-amber-400 text-amber-950'), 'AcademyView RC deve ser âmbar');

    const weather = fs.readFileSync(path.resolve('src/features/weather/views/WeatherSaasView.tsx'), 'utf8');
    assert.ok(weather.includes('bg-amber-100 text-amber-950 border border-amber-400'), 'WeatherSaasView RC deve ser âmbar');

    const settingsSubmenu = fs.readFileSync(path.resolve('src/features/settings/SettingsSubmenuNav.tsx'), 'utf8');
    assert.ok(!settingsSubmenu.includes('bg-blue-100 text-blue-700'), 'SettingsSubmenuNav não deve ter etiquetas azuis');
    assert.ok(settingsSubmenu.includes('bg-amber-100 text-amber-950 border border-amber-400'), 'SettingsSubmenuNav deve ter etiquetas âmbar');
  });

  it('10. ToolsView deve conter separador visual entre Ferramentas Homologadas (PAGES) e Candidatas (RC)', () => {
    const toolsView = fs.readFileSync(path.resolve('src/views/ToolsView.tsx'), 'utf8');
    assert.ok(toolsView.includes('pagesTools'), 'ToolsView deve calcular subconjunto pagesTools');
    assert.ok(toolsView.includes('rcTools'), 'ToolsView deve calcular subconjunto rcTools');
    assert.ok(toolsView.includes('Ferramentas Homologadas'), 'ToolsView deve ter cabeçalho de grupo homologado');
    assert.ok(toolsView.includes('Candidatas a Publicação — Novidades'), 'ToolsView deve ter cabeçalho de novidades RC');
    assert.ok(toolsView.includes('border-t-2 border-dashed border-slate-200'), 'ToolsView deve conter linha separadora entre grupos');
  });

});
