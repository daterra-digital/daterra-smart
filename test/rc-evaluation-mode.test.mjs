/**
 * DATERRA Smart - Teste de Regressão do Modo de Avaliação RC (Release Candidate)
 * Validação de Localhost Dedicado (:5175), Etiquetas 'PAGES' e 'RC', e Supressão em Produção
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Importa os utilitários do modo RC
const { CANONICAL_PAGES_TOOL_IDS, getToolReleaseBadge } = await import('../src/utils/rcEvaluationMode.ts');

describe('Modo de Avaliação de Release Candidate (V-RC)', () => {

  it('1. Deve listar rigorosamente as 11 ferramentas canónicas publicadas no Pages', () => {
    assert.equal(CANONICAL_PAGES_TOOL_IDS.size, 11, 'Devem existir exatamente 11 ferramentas canónicas');
    const expected = [
      'ajuste_dose_eppo',
      'calc_aplicacao_manual',
      'calc_area_parede_foliar',
      'calc_ph',
      'calc_concentracao',
      'calc_dose',
      'ordem_mistura',
      'calc_pre_inspecao',
      'calc_tabelas_debito',
      'calc_velocidade_real',
      'calc_volume_copa'
    ];

    for (const id of expected) {
      assert.ok(CANONICAL_PAGES_TOOL_IDS.has(id), `Ferramenta canónica deve constar no Pages: ${id}`);
    }
  });

  it('2. package.json deve conter script dev:rc com porto 5175 e versão 1.0.1-rc1', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
    assert.equal(pkg.version, '1.0.1-rc1', 'Versão do package.json deve ser 1.0.1-rc1');
    assert.ok(pkg.scripts['dev:rc'], 'Deve declarar script dev:rc');
    assert.ok(pkg.scripts['dev:rc'].includes('5175'), 'dev:rc deve usar o porto 5175');
  });

  it('3. HelpView e ficheiros de idioma devem refletir a versão 1.0.1-rc1', () => {
    const helpView = fs.readFileSync(path.resolve('src/views/HelpView.tsx'), 'utf8');
    const ptPT = fs.readFileSync(path.resolve('src/i18n/locales/pt-PT.json'), 'utf8');
    const pt = fs.readFileSync(path.resolve('src/i18n/locales/pt.json'), 'utf8');

    assert.ok(helpView.includes('1.0.1-rc1'), 'HelpView deve referir 1.0.1-rc1');
    assert.ok(ptPT.includes('1.0.1-rc1'), 'pt-PT.json deve referir 1.0.1-rc1');
    assert.ok(pt.includes('1.0.1-rc1'), 'pt.json deve referir 1.0.1-rc1');
  });

  it('4. Simulação: getToolReleaseBadge deve suprimir etiquetas em github.io ou daterra.com.pt', () => {
    // Simula hostname público
    globalThis.window = {
      location: {
        hostname: 'daterra-digital.github.io',
        port: ''
      }
    };

    assert.equal(getToolReleaseBadge('ajuste_dose_eppo'), null, 'Deve suprimir etiqueta PAGES no github.io');
    assert.equal(getToolReleaseBadge('calibracao_pulverizador'), null, 'Deve suprimir etiqueta RC no github.io');

    // Simula cPanel
    globalThis.window.location.hostname = 'smart.daterra.com.pt';
    assert.equal(getToolReleaseBadge('ajuste_dose_eppo'), null, 'Deve suprimir etiqueta PAGES no cPanel');

    // Simula localhost :5175 (Modo RC ativo)
    globalThis.window.location.hostname = 'localhost';
    globalThis.window.location.port = '5175';
    assert.equal(getToolReleaseBadge('ajuste_dose_eppo'), 'PAGES', 'Em localhost:5175 deve indicar PAGES para canónica');
    assert.equal(getToolReleaseBadge('calibracao_pulverizador'), 'RC', 'Em localhost:5175 deve indicar RC para novidades');
  });

});
