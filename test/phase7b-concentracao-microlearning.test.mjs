/**
 * DATERRA Smart - Testes da Fase 7B: Microlearning Específico dos Resultados da Concentração da Calda
 * Cobertura Completa dos 18 Requisitos Obrigatórios
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  concentracaoCalculatorConfig,
  calculateConcentrationPure
} from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';

import {
  calculateDosePure
} from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

describe('Fase 7B: Microlearning Específico dos Resultados da Calculadora de Concentração da Calda', () => {

  const jovemPath = path.resolve('src/features/concentracao/ConcentracaoFAQQuantidadeProdutoJovem.md');
  const adultaPath = path.resolve('src/features/concentracao/ConcentracaoFAQQuantidadeProdutoAdulta.md');

  // ========================================================
  // 1. O resultado em Planta Jovem tem botão de ajuda
  // ========================================================
  test('1. O resultado em Planta Jovem declara helpFile associado', () => {
    const resDef = concentracaoCalculatorConfig.results.find(r => r.id === 'quantidade_pf');
    assert.ok(resDef, 'Resultado quantidade_pf deve existir');
    assert.ok(resDef.helpFileByMode, 'Deve ter mapeamento helpFileByMode');
    assert.equal(resDef.helpFileByMode['jovem'], 'ConcentracaoFAQQuantidadeProdutoJovem.md');
    assert.equal(resDef.helpFileByMode['planta_jovem'], 'ConcentracaoFAQQuantidadeProdutoJovem.md');
  });

  // ========================================================
  // 2. O resultado em Planta Adulta tem botão de ajuda
  // ========================================================
  test('2. O resultado em Planta Adulta declara helpFile associado', () => {
    const resDef = concentracaoCalculatorConfig.results.find(r => r.id === 'quantidade_pf');
    assert.ok(resDef, 'Resultado quantidade_pf deve existir');
    assert.ok(resDef.helpFileByMode, 'Deve ter mapeamento helpFileByMode');
    assert.equal(resDef.helpFileByMode['adulta'], 'ConcentracaoFAQQuantidadeProdutoAdulta.md');
    assert.equal(resDef.helpFileByMode['planta_adulta'], 'ConcentracaoFAQQuantidadeProdutoAdulta.md');
  });

  // ========================================================
  // 3. O botão abre o conteúdo correto em Planta Jovem
  // ========================================================
  test('3. O ficheiro de microlearning de Planta Jovem existe e está registado em DidacticHelp', () => {
    assert.ok(fs.existsSync(jovemPath), 'Ficheiro ConcentracaoFAQQuantidadeProdutoJovem.md deve existir');
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('ConcentracaoFAQQuantidadeProdutoJovem.md'));
    assert.ok(didacticCode.includes('faqConcQuantidadeProdutoJovem'));
  });

  // ========================================================
  // 4. O botão abre o conteúdo correto em Planta Adulta
  // ========================================================
  test('4. O ficheiro de microlearning de Planta Adulta existe e está registado em DidacticHelp', () => {
    assert.ok(fs.existsSync(adultaPath), 'Ficheiro ConcentracaoFAQQuantidadeProdutoAdulta.md deve existir');
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('ConcentracaoFAQQuantidadeProdutoAdulta.md'));
    assert.ok(didacticCode.includes('faqConcQuantidadeProdutoAdulta'));
  });

  // ========================================================
  // 5. Conteúdo Planta Jovem contém as variáveis corretas
  // ========================================================
  test('5. Conteúdo Planta Jovem contém as variáveis e as 10 secções oficiais', () => {
    const content = fs.readFileSync(jovemPath, 'utf8');
    assert.ok(content.includes('Concentração recomendada'));
    assert.ok(content.includes('Volume de calda a preparar'));
    assert.ok(content.includes('100 mL/hL'));
    assert.ok(content.includes('400 L'));
    assert.ok(content.includes('400 mL'));
    assert.ok(content.includes('0,40 L'));
    assert.ok(content.includes('Aviso de segurança'));
    assert.ok(content.includes('DGAV'));
    assert.ok(content.includes('EPI'));

    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10, `Deve ter 10 secções ##, encontrou ${headings.length}`);
  });

  // ========================================================
  // 6. Conteúdo Planta Adulta contém as variáveis corretas
  // ========================================================
  test('6. Conteúdo Planta Adulta contém as variáveis e as 10 secções oficiais', () => {
    const content = fs.readFileSync(adultaPath, 'utf8');
    assert.ok(content.includes('Concentração recomendada'));
    assert.ok(content.includes('Volume a preparar'));
    assert.ok(content.includes('Volume recomendado'));
    assert.ok(content.includes('Volume real aplicado'));
    assert.ok(content.includes('1.000 L/ha'));
    assert.ok(content.includes('400 L/ha'));
    assert.ok(content.includes('1,00 L'));
    assert.ok(content.includes('1.000 mL'));
    assert.ok(content.includes('calibração real'));
    assert.ok(content.includes('EPI'));

    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10, `Deve ter 10 secções ##, encontrou ${headings.length}`);
  });

  // ========================================================
  // 7. O conteúdo menciona unidades líquidas e sólidas quando aplicável
  // ========================================================
  test('7. Conteúdos explicam distinção de unidades líquidas (mL, L) e sólidas (g, kg)', () => {
    const contentJovem = fs.readFileSync(jovemPath, 'utf8');
    assert.ok(contentJovem.includes('Produtos Líquidos'));
    assert.ok(contentJovem.includes('Produtos Sólidos'));
    assert.ok(contentJovem.includes('mL') && contentJovem.includes('L'));
    assert.ok(contentJovem.includes('g') && contentJovem.includes('kg'));

    const contentAdulta = fs.readFileSync(adultaPath, 'utf8');
    assert.ok(contentAdulta.includes('Produtos Líquidos'));
    assert.ok(contentAdulta.includes('Produtos Sólidos'));
    assert.ok(contentAdulta.includes('mL') && contentAdulta.includes('L'));
    assert.ok(contentAdulta.includes('g') && contentAdulta.includes('kg'));
  });

  // ========================================================
  // 8. O microlearning não altera fórmula, valores, unidades, arredondamentos ou histórico
  // ========================================================
  test('8. Fórmulas e cálculos da Concentração permanecem estritamente intactos', () => {
    const resJovem = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(resJovem.primaryValue, 400);
    assert.equal(resJovem.primaryUnit, 'mL');
    assert.equal(resJovem.subValue, 0.4);
    assert.equal(resJovem.subUnit, 'L');

    const resAdulta = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'adulta');
    assert.equal(resAdulta.primaryValue, 1.0);
    assert.equal(resAdulta.primaryUnit, 'L');
    assert.equal(resAdulta.subValue, 1000);
    assert.equal(resAdulta.subUnit, 'mL');
  });

  // ========================================================
  // 9. O modal fecha por X
  // ========================================================
  test('9. DidacticHelp possui botão de fecho X acessível', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('aria-label="Fechar modal"'));
    assert.ok(didacticCode.includes('<X className="w-6 h-6" />'));
  });

  // ========================================================
  // 10. O modal fecha por "Compreendido"
  // ========================================================
  test('10. DidacticHelp possui botão "Compreendido" que aciona o fecho', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('Compreendido'));
    assert.ok(didacticCode.includes('handleClose'));
  });

  // ========================================================
  // 11. O modal fecha por Escape em desktop
  // ========================================================
  test('11. DidacticHelp gere a tecla Escape para fecho de diálogo', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes("e.key === 'Escape'"));
  });

  // ========================================================
  // 12. O foco regressa ao botão de origem
  // ========================================================
  test('12. DidacticHelp repõe o foco no botão acionador ao fechar', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('triggerRef.current?.focus()'));
  });

  // ========================================================
  // 13. Os acordeões funcionam por teclado
  // ========================================================
  test('13. Acordeões suportam navegação nativa e acessibilidade (aria-expanded)', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('aria-expanded={isExpanded}'));
    assert.ok(didacticCode.includes('onClick={() => toggleAccordion(idx)}'));
  });

  // ========================================================
  // 14. Os botões cumprem mínimo de 48 × 48 px
  // ========================================================
  test('14. Botões de ajuda respeitam área de toque mínima de 48 × 48 px', () => {
    const cardCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/CalculatorResultCard.tsx'),
      'utf8'
    );
    assert.ok(cardCode.includes('min-w-[48px]'));
    assert.ok(cardCode.includes('min-h-[48px]'));
    assert.ok(cardCode.includes('touch-target'));
  });

  // ========================================================
  // 15. O conteúdo funciona offline
  // ========================================================
  test('15. Conteúdo Markdown é embutido no bundle com ?raw sem chamadas de rede', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes("ConcentracaoFAQQuantidadeProdutoJovem.md?raw'"));
    assert.ok(didacticCode.includes("ConcentracaoFAQQuantidadeProdutoAdulta.md?raw'"));
    assert.ok(!didacticCode.includes('fetch('));
  });

  // ========================================================
  // 16. O microlearning geral e por campo continua sem regressões
  // ========================================================
  test('16. Microlearning geral e dos 4 campos de entrada permanecem existentes e válidos', () => {
    assert.ok(fs.existsSync(path.resolve('src/features/concentracao/ConcentracaoFAQGeral.md')));
    assert.ok(fs.existsSync(path.resolve('src/features/concentracao/ConcentracaoFAQConcentracao.md')));
    assert.ok(fs.existsSync(path.resolve('src/features/concentracao/ConcentracaoFAQVolumePreparar.md')));
    assert.ok(fs.existsSync(path.resolve('src/features/concentracao/ConcentracaoFAQVolumeRecomendado.md')));
    assert.ok(fs.existsSync(path.resolve('src/features/concentracao/ConcentracaoFAQVolumeAplicado.md')));
  });

  // ========================================================
  // 17. A Calculadora de Dose e Área de Parede Foliar permanecem sem alterações
  // ========================================================
  test('17. Calculadora de Dose e Área de Parede Foliar mantêm suas rotas e lógica intactas', () => {
    const dosePure = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(dosePure.primaryValue, 10);
    assert.equal(dosePure.area_tratada_ha, 5);

    const toolsViewCode = fs.readFileSync(
      path.resolve('src/views/ToolsView.tsx'),
      'utf8'
    );
    assert.ok(toolsViewCode.includes("currentViewTool === 'calc_area_parede_foliar'"));
  });

  // ========================================================
  // 18. Ajuste de terminologia para "Quantidade necessária de produto"
  // ========================================================
  test('18. Terminologia ajustada no resultado da Concentração', () => {
    const resDef = concentracaoCalculatorConfig.results.find(r => r.id === 'quantidade_pf');
    assert.equal(resDef?.label, 'Quantidade necessária de produto');
    assert.ok(!resDef?.label.toLowerCase().includes('pesticida'));
  });
});
