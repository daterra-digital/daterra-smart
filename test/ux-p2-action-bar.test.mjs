/**
 * DATERRA Smart - Testes Automatizados de Aceitação UX P2: Barra Contextual Inferior de Ações
 * UniversalCalculatorTemplate + CalculatorActionBar
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { calculateConcentrationPure } from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';
import { calculateTotalFlowRatePure } from '../src/features/calculators/definitions/debitoTotalCalculatorConfig.ts';

describe('Correção UX P2: Barra Contextual Inferior de Ações (CalculatorActionBar)', () => {

  test('1. Componente CalculatorActionBar existe e está modularizado em src/features/calculators/core/', () => {
    const componentPath = path.resolve('src/features/calculators/core/CalculatorActionBar.tsx');
    assert.ok(fs.existsSync(componentPath), 'CalculatorActionBar.tsx deve existir');
    const content = fs.readFileSync(componentPath, 'utf8');

    // Botões e estrutura
    assert.ok(content.includes('aria-label="Ações da calculadora"'), 'Deve conter aside com aria-label');
    assert.ok(content.includes('flex-[2] basis-1/2'), 'Guardar deve ter ~50% de proporção (flex-[2] basis-1/2)');
    assert.ok(content.includes('flex-1 basis-1/4'), 'Histórico e Guia devem ter ~25% de proporção cada');
    assert.ok(content.includes('min-h-[48px]'), 'Todos os botões devem ter target mínimo de 48px');
    assert.ok(content.includes('touch-target'), 'Deve incluir classe touch-target');
    assert.ok(content.includes('calculator-action-bar-position'), 'Deve usar classe de posicionamento por tokens');
  });

  test('2. Integração no UniversalCalculatorTemplate com supressão em modais e classes de espaçamento', () => {
    const templatePath = path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx');
    const content = fs.readFileSync(templatePath, 'utf8');

    assert.ok(content.includes('import { CalculatorActionBar }'), 'Template deve importar CalculatorActionBar');
    assert.ok(content.includes('isAnyModalOpen'), 'Template deve gerir agregação isAnyModalOpen');
    assert.ok(content.includes('!isDesktop && !isAnyModalOpen'), 'ActionBar só renderiza em mobile/tablet e quando nenhum modal está aberto');
    assert.ok(content.includes('calculator-content-spacing'), 'Container deve usar classe calculator-content-spacing');
    assert.ok(content.includes('variant="modal-only"'), 'DidacticHelp controlado deve usar variant modal-only');
  });

  test('3. Tokens CSS e regras de posicionamento no index.css', () => {
    const cssPath = path.resolve('src/index.css');
    const content = fs.readFileSync(cssPath, 'utf8');

    assert.ok(content.includes('--calculator-action-bar-height'), 'Deve declarar --calculator-action-bar-height');
    assert.ok(content.includes('--calculator-mobile-bottom-offset'), 'Deve declarar --calculator-mobile-bottom-offset');
    assert.ok(content.includes('--calculator-tablet-bottom-offset'), 'Deve declarar --calculator-tablet-bottom-offset');
    assert.ok(content.includes('.calculator-action-bar-position'), 'Deve declarar classe .calculator-action-bar-position');
    assert.ok(content.includes('.calculator-content-spacing'), 'Deve declarar classe .calculator-content-spacing');
    assert.ok(content.includes('display: none !important'), 'Em min-width: 1024px deve ocultar a barra móvel');
  });

  test('4. DidacticHelp suporta modo controlado e variant modal-only', () => {
    const didacticPath = path.resolve('src/features/concentracao/DidacticHelp.tsx');
    const content = fs.readFileSync(didacticPath, 'utf8');

    assert.ok(content.includes("variant?: 'icon' | 'button' | 'modal-only'"), 'Deve suportar variant modal-only');
    assert.ok(content.includes('isOpen: controlledIsOpen'), 'Deve aceitar prop isOpen controlada');
    assert.ok(content.includes('onClose: controlledOnClose'), 'Deve aceitar prop onClose controlada');
    assert.ok(content.includes('useCallback'), 'handleClose deve usar useCallback');
  });

  test('5. Internacionalização i18n completa nos 8 idiomas sem o termo "cuba" em PT/BR', () => {
    const locales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];
    const requiredKeys = [
      'save',
      'saveCalculation',
      'history',
      'openHistory',
      'guide',
      'technicalGuide',
      'openTechnicalGuide',
      'saveDisabled',
      'noTechnicalGuideAvailable'
    ];

    for (const lang of locales) {
      const locPath = path.resolve(`src/i18n/locales/${lang}.json`);
      assert.ok(fs.existsSync(locPath), `${lang}.json deve existir`);
      const data = JSON.parse(fs.readFileSync(locPath, 'utf8'));

      assert.ok(data.calculatorActionBar, `${lang}.json deve conter namespace calculatorActionBar`);
      for (const key of requiredKeys) {
        assert.ok(data.calculatorActionBar[key], `${lang}.json deve conter a chave calculatorActionBar.${key}`);
        assert.strictEqual(typeof data.calculatorActionBar[key], 'string', `${key} deve ser string em ${lang}.json`);
      }

      assert.ok(data.validationNotes, `${lang}.json deve conter namespace validationNotes`);
      assert.ok(data.validationNotes.title, `${lang}.json deve conter validationNotes.title`);
      assert.ok(data.validationNotes.defaultMessage, `${lang}.json deve conter validationNotes.defaultMessage`);

      if (lang === 'pt' || lang === 'br') {
        const rawJson = JSON.stringify(data.calculatorActionBar).toLowerCase();
        assert.ok(!rawJson.includes('cuba'), `Termo proibido "cuba" detetado em ${lang}.json calculatorActionBar`);
      }
    }
  });

  test('6. Remoção de Acordeão e Inclusão da Caixa de Notas de Validação no UniversalCalculatorTemplate', () => {
    const templatePath = path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx');
    const content = fs.readFileSync(templatePath, 'utf8');

    assert.ok(!content.includes('isTechnicalDrawerOpen'), 'Não deve conter estado isTechnicalDrawerOpen');
    assert.ok(!content.includes('technicalDetailsHide'), 'Não deve conter texto de fechar acordeão');
    assert.ok(content.includes('validationNotes.title'), 'Deve conter caixa dedicada de notas de validação');
    assert.ok(content.includes('validation.warnings'), 'Deve verificar warnings na caixa de validação');
  });

  test('7. Limpeza do Cabeçalho e Nomenclatura Oficial Concentração do Produto', () => {
    const headerPath = path.resolve('src/features/calculators/core/CalculatorHeader.tsx');
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    assert.ok(!headerContent.includes('onOpenHistory'), 'CalculatorHeader não deve conter botão/prop de histórico');

    const concConfigPath = path.resolve('src/features/calculators/definitions/concentracaoCalculatorConfig.ts');
    const concContent = fs.readFileSync(concConfigPath, 'utf8');
    assert.ok(concContent.includes('Concentração do Produto'), 'Deve conter "Concentração do Produto"');
    assert.ok(!concContent.includes('Concentração do PF'), 'Não deve conter "Concentração do PF"');
  });

  test('8. Não-regressão de fórmulas agronómicas e cálculo de histórico', () => {
    // Validação da pure function de concentração
    const resJovem = calculateConcentrationPure(100, 'mL/hL', 400, 0, 0, 'jovem');
    assert.strictEqual(resJovem.quantidade_pf_small, 400);

    const resAdulta = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 500, 'adulta');
    assert.strictEqual(resAdulta.quantidade_pf_small, 800);

    // Validação da pure function de débito total
    const resDebito = calculateTotalFlowRatePure(600, 4.0, 6.0, 'boom_total_width', 20);
    assert.strictEqual(resDebito.debito_total_l_min, 24.0);
    assert.strictEqual(resDebito.debito_por_bico_l_min, 1.2);
  });

  test('9. Rótulo "Guardar Histórico" rigoroso em todos os 8 idiomas', () => {
    const expected = {
      pt: 'Guardar Histórico',
      br: 'Salvar Histórico',
      en: 'Save History',
      es: 'Guardar Historial',
      fr: "Enregistrer l'historique",
      it: 'Salva cronologia',
      de: 'Verlauf speichern',
      el: 'Αποθήκευση ιστορικού'
    };

    for (const [lang, expText] of Object.entries(expected)) {
      const locPath = path.resolve(`src/i18n/locales/${lang}.json`);
      const data = JSON.parse(fs.readFileSync(locPath, 'utf8'));
      assert.strictEqual(
        data.calculatorActionBar?.save,
        expText,
        `Tradução de save deve ser "${expText}" em ${lang}.json`
      );
    }
  });

  test('10. Documentação do Piloto Físico e Grelha de Feedback existem em docs/ux/', () => {
    const protoPath = path.resolve('docs/ux/PILOTO_FISICO_PROTOCOLO.md');
    const feedbackPath = path.resolve('docs/ux/PILOTO_FISICO_GRELHA_FEEDBACK.md');

    assert.ok(fs.existsSync(protoPath), 'PILOTO_FISICO_PROTOCOLO.md deve existir');
    assert.ok(fs.existsSync(feedbackPath), 'PILOTO_FISICO_GRELHA_FEEDBACK.md deve existir');

    const protoContent = fs.readFileSync(protoPath, 'utf8');
    assert.ok(protoContent.includes('Guardar no Histórico'), 'Protocolo deve referir Guardar no Histórico');
    assert.ok(protoContent.includes('Notas de Validação'), 'Protocolo deve referir Notas de Validação');

    const feedbackContent = fs.readFileSync(feedbackPath, 'utf8');
    assert.ok(feedbackContent.includes('Guardar no Histórico'), 'Grelha deve referir Guardar no Histórico');
    assert.ok(feedbackContent.includes('CalculatorActionBar'), 'Grelha deve referir CalculatorActionBar');
  });

  test('11. Documentos de Resultados do Piloto e Critérios da Ronda 1 existem e são válidos', () => {
    const resPath = path.resolve('docs/ux/PILOTO_FISICO_RESULTADOS.md');
    const critPath = path.resolve('docs/ux/RONDA_1_CRITERIOS.md');

    assert.ok(fs.existsSync(resPath), 'PILOTO_FISICO_RESULTADOS.md deve existir');
    assert.ok(fs.existsSync(critPath), 'RONDA_1_CRITERIOS.md deve existir');

    const resContent = fs.readFileSync(resPath, 'utf8');
    assert.ok(resContent.includes('Relatório de Consolidação'), 'Resultados devem conter cabeçalho');
    assert.ok(resContent.includes('Métricas Agregadas'), 'Resultados devem conter métricas agregadas');
    assert.ok(resContent.includes('100%'), 'Resultados devem confirmar taxa de conclusão');

    const critContent = fs.readFileSync(critPath, 'utf8');
    assert.ok(critContent.includes('Critérios de Entrada'), 'Critérios devem conter Gate de entrada');
    assert.ok(critContent.includes('AUTORIZADO O INÍCIO DA RONDA 1'), 'Critérios devem autorizar a Ronda 1');
  });

});
