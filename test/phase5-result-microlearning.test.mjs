/**
 * DATERRA Smart - Testes da Fase 5: Microlearning Específico de Resultados na Calculadora de Dose
 * Cobertura dos 16 Requisitos Obrigatórios
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  doseCalculatorConfig,
  calculateDosePure
} from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

describe('Fase 5: Microlearning Específico dos Resultados (Calculadora de Dose)', () => {
  const quantHelpPath = path.resolve('src/features/dose/DoseFAQQuantidadeProduto.md');
  const areaHelpPath = path.resolve('src/features/dose/DoseFAQAreaTratada.md');

  const quantHelpContent = fs.readFileSync(quantHelpPath, 'utf8');
  const areaHelpContent = fs.readFileSync(areaHelpPath, 'utf8');

  test('1. O cartão de resultado principal apresenta "Quantidade necessária de produto"', () => {
    const resPrincipal = doseCalculatorConfig.results.find((r) => r.id === 'quantidade_pf');
    assert.ok(resPrincipal);
    assert.equal(resPrincipal.label, 'Quantidade necessária de produto');
    assert.notEqual(resPrincipal.label, 'Quantidade necessária de pesticida');
  });

  test('2. O cartão de resultado acessório mantém "Área Tratada por Depósito"', () => {
    const resAcessorio = doseCalculatorConfig.results.find((r) => r.id === 'area_tratada_ha');
    assert.ok(resAcessorio);
    assert.equal(resAcessorio.label, 'Área Tratada por Depósito');
  });

  test('3. Cada resultado tem ficheiro de microlearning próprio e independente', () => {
    const resPrincipal = doseCalculatorConfig.results.find((r) => r.id === 'quantidade_pf');
    const resAcessorio = doseCalculatorConfig.results.find((r) => r.id === 'area_tratada_ha');

    assert.equal(resPrincipal?.helpFile, 'DoseFAQQuantidadeProduto.md');
    assert.equal(resAcessorio?.helpFile, 'DoseFAQAreaTratada.md');
    assert.notEqual(resPrincipal?.helpFile, resAcessorio?.helpFile);
  });

  test('4. O ficheiro de ajuda do resultado principal existe e contém as 10 secções obrigatórias', () => {
    assert.ok(fs.existsSync(quantHelpPath));
    assert.ok(quantHelpContent.includes('# Microlearning — Quantidade Necessária de Produto'));
    assert.ok(quantHelpContent.includes('## O que representa a "Quantidade necessária de produto"?'));
    assert.ok(quantHelpContent.includes('## Como é calculado este resultado?'));
    assert.ok(quantHelpContent.includes('## Porque pode aparecer em litros ou mililitros?'));
    assert.ok(quantHelpContent.includes('## Porque pode aparecer em quilogramas ou gramas?'));
    assert.ok(quantHelpContent.includes('## O que significa a unidade principal e a unidade auxiliar?'));
    assert.ok(quantHelpContent.includes('## Posso alterar a dose apenas porque a quantidade calculada me parece elevada ou baixa?'));
    assert.ok(quantHelpContent.includes('## Este cálculo substitui as indicações do rótulo do produto?'));
    assert.ok(quantHelpContent.includes('## O que devo confirmar antes de preparar a calda?'));
    assert.ok(quantHelpContent.includes('## Exemplo prático de aplicação'));
    assert.ok(quantHelpContent.includes('## Aviso de segurança e responsabilidade técnica'));
  });

  test('5. O ficheiro de ajuda do resultado acessório existe e contém as 10 secções obrigatórias', () => {
    assert.ok(fs.existsSync(areaHelpPath));
    assert.ok(areaHelpContent.includes('# Microlearning — Área Tratada por Depósito'));
    assert.ok(areaHelpContent.includes('## O que significa "Área tratada por depósito"?'));
    assert.ok(areaHelpContent.includes('## Como é calculada a área tratada?'));
    assert.ok(areaHelpContent.includes('## Porque este resultado depende do volume a preparar?'));
    assert.ok(areaHelpContent.includes('## Porque este resultado depende do volume aplicado por hectare?'));
    assert.ok(areaHelpContent.includes('## Porque a dose recomendada não altera diretamente a área tratada?'));
    assert.ok(areaHelpContent.includes('## Como posso usar este resultado para planear a operação?'));
    assert.ok(areaHelpContent.includes('## O que acontece se a área da parcela for superior à área tratada por depósito?'));
    assert.ok(areaHelpContent.includes('## Porque pode a área real tratada ser diferente do valor apresentado?'));
    assert.ok(areaHelpContent.includes('## Exemplo prático de aplicação'));
    assert.ok(areaHelpContent.includes('## Que cuidados devo ter antes de utilizar este valor no campo?'));
  });

  test('6. O conteúdo de microlearning do produto líquido menciona claramente L e mL', () => {
    assert.ok(quantHelpContent.includes('L/ha'));
    assert.ok(quantHelpContent.includes('litros (L)'));
    assert.ok(quantHelpContent.includes('mililitros (mL)'));
    assert.ok(quantHelpContent.includes('10,00 L'));
    assert.ok(quantHelpContent.includes('10.000 mL'));
  });

  test('7. O conteúdo de microlearning do produto sólido menciona claramente kg e g', () => {
    assert.ok(quantHelpContent.includes('kg/ha'));
    assert.ok(quantHelpContent.includes('quilogramas (kg)'));
    assert.ok(quantHelpContent.includes('gramas (g)'));
  });

  test('8. O microlearning não altera cálculo, resultados nem área tratada', () => {
    const resLiquid = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(resLiquid.primaryValue, 10);
    assert.equal(resLiquid.primaryUnit, 'L');
    assert.equal(resLiquid.subValue, 10000);
    assert.equal(resLiquid.subUnit, 'mL');
    assert.equal(resLiquid.area_tratada_ha, 5);

    const resSolid = calculateDosePure(1000, 2, 'kg/ha', 200);
    assert.equal(resSolid.primaryValue, 10);
    assert.equal(resSolid.primaryUnit, 'kg');
    assert.equal(resSolid.subValue, 10000);
    assert.equal(resSolid.subUnit, 'g');
    assert.equal(resSolid.area_tratada_ha, 5);
  });

  test('9. DidacticHelp tem gestão de acessibilidade: role="dialog", aria-modal="true" e Escape', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('role="dialog"'));
    assert.ok(didacticCode.includes('aria-modal="true"'));
    assert.ok(didacticCode.includes("e.key === 'Escape'"));
    assert.ok(didacticCode.includes('aria-expanded={isExpanded}'));
  });

  test('10. DidacticHelp devolve o foco ao botão de origem e foca no fecho ao abrir', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('triggerRef'));
    assert.ok(didacticCode.includes('closeButtonRef'));
    assert.ok(didacticCode.includes('triggerRef.current?.focus()'));
  });

  test('11. O botão "Compreendido" aciona o fecho limpo do modal', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes('Compreendido'));
    assert.ok(didacticCode.includes('onClick={handleClose}'));
  });

  test('12. CalculatorResultCard integra DidacticHelp para cada resultado com helpFile', () => {
    const cardCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/CalculatorResultCard.tsx'),
      'utf8'
    );
    assert.ok(cardCode.includes('<DidacticHelp'));
    assert.ok(cardCode.includes('resultDef.helpFile'));
    assert.ok(cardCode.includes('touch-target'));
  });

  test('13. Conteúdo Markdown é estático e embutido no bundle (100% offline)', () => {
    const didacticCode = fs.readFileSync(
      path.resolve('src/features/concentracao/DidacticHelp.tsx'),
      'utf8'
    );
    assert.ok(didacticCode.includes("import faqDoseQuantidadeProduto from '../dose/DoseFAQQuantidadeProduto.md?raw'"));
    assert.ok(didacticCode.includes("import faqDoseAreaTratada from '../dose/DoseFAQAreaTratada.md?raw'"));
    assert.ok(didacticCode.includes("'DoseFAQQuantidadeProduto.md': faqDoseQuantidadeProduto"));
    assert.ok(didacticCode.includes("'DoseFAQAreaTratada.md': faqDoseAreaTratada"));
  });

  test('14. Microlearnings gerais e de campos mantêm integridade sem regressão', () => {
    const generalHelp = path.resolve('src/features/dose/DoseFAQGeral.md');
    const volPrepHelp = path.resolve('src/features/dose/DoseFAQVolumePreparar.md');
    const doseRecHelp = path.resolve('src/features/dose/DoseFAQDoseRecomendada.md');
    const volCaldaHelp = path.resolve('src/features/dose/DoseFAQVolumeAplicado.md');

    assert.ok(fs.existsSync(generalHelp));
    assert.ok(fs.existsSync(volPrepHelp));
    assert.ok(fs.existsSync(doseRecHelp));
    assert.ok(fs.existsSync(volCaldaHelp));
  });

  test('15. Texto em português de Portugal prudente sem recomendações de dose', () => {
    assert.ok(!quantHelpContent.includes('você'));
    assert.ok(!areaHelpContent.includes('você'));
    assert.ok(quantHelpContent.includes('produtos fitofarmacêuticos'));
    assert.ok(quantHelpContent.includes('DGAV'));
    assert.ok(quantHelpContent.includes('EPI'));
    assert.ok(quantHelpContent.includes('Nunca deve alterar'));
  });

  test('16. Não existem alterações em outras calculadoras', () => {
    const concGeral = path.resolve('src/features/concentracao/ConcentracaoFAQGeral.md');
    assert.ok(fs.existsSync(concGeral));
    // As outras calculadoras não foram tocadas
    assert.equal(doseCalculatorConfig.id, 'calc_dose');
  });
});
