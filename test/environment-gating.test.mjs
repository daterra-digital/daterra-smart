/**
 * DATERRA Smart - Testes de Controlo de Ambiente (Localhost vs GitHub Pages)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  GITHUB_PAGES_ALLOWED_TOOL_IDS,
  isToolAllowedInCurrentEnv
} from '../src/utils/environment.ts';
import {
  BLOCKED_TOOL_IDS_IN_PAGES,
  BLOCKED_PAGES_ROUTES,
  isIrdEnabledForEnv,
  isWeatherDriftTabEnabledForEnv
} from '../src/utils/releasePolicyRoutes.ts';

describe('Controlo de Ambiente & Publicação GitHub Pages', () => {

  test('1. Lista de ferramentas permitidas no GitHub Pages contém exatamente as 11 homologadas', () => {
    assert.equal(GITHUB_PAGES_ALLOWED_TOOL_IDS.size, 11, 'Devem ser exatamente 11 ferramentas');

    const expectedTools = [
      'ajuste_dose_eppo',
      'calc_area_parede_foliar',
      'verificador_ph',
      'calc_concentracao',
      'calc_dose',
      'mistura_compatibilidade',
      'pre_inspecao_dgav',
      'comparador_bicos',
      'calc_velocidade_real',
      'calc_volume_copa',
      'calc_aplicacao_manual'
    ];

    for (const toolId of expectedTools) {
      assert.ok(
        GITHUB_PAGES_ALLOWED_TOOL_IDS.has(toolId),
        `A ferramenta '${toolId}' deve estar presente na lista do GitHub Pages`
      );
    }
  });

  test('2. Ferramentas em desenvolvimento não estão na lista do GitHub Pages', () => {
    const hiddenTools = [
      'satelite_ndvi',
      'gestao_exploracoes',
      'gestao_caderno_campo',
      'calc_debito_total',
      'drone_buffer_zone',
      'clima_estacao_agricola',
      'smart_debito',
      'calc_volume_calda_trv',
      'calc_calibracao_pulverizador',
      'calc_ird'
    ];

    for (const toolId of hiddenTools) {
      assert.equal(
        GITHUB_PAGES_ALLOWED_TOOL_IDS.has(toolId),
        false,
        `A ferramenta '${toolId}' deve estar oculta no GitHub Pages`
      );
    }
  });

  test('3. Função isToolAllowedInCurrentEnv está definida e valida ferramentas homologadas', () => {
    assert.equal(typeof isToolAllowedInCurrentEnv, 'function');
    assert.equal(isToolAllowedInCurrentEnv('calc_dose'), true);
  });

  test('4. IRD permitido em V-DEV e V-RC, rota legada bloqueada em V-PAGES e aba Deriva ativa em Meteorologia (V-PAGES e V-RC)', () => {
    assert.equal(BLOCKED_TOOL_IDS_IN_PAGES.has('calc_ird'), true);
    assert.equal(BLOCKED_PAGES_ROUTES['/ferramentas/risco-deriva'], 'calc_ird');
    assert.equal(isIrdEnabledForEnv('development'), true);
    assert.equal(isIrdEnabledForEnv('staging'), true);
    assert.equal(isIrdEnabledForEnv('pages'), false);
    assert.equal(isWeatherDriftTabEnabledForEnv('development'), true);
    assert.equal(isWeatherDriftTabEnabledForEnv('staging'), true);
    assert.equal(isWeatherDriftTabEnabledForEnv('pages'), true);
  });

});
