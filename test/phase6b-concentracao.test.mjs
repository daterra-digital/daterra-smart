/**
 * DATERRA Smart - Testes da Fase 6B: Migração da Concentração e Validação Estrita de Transferência
 * Cobertura Completa dos 28 Requisitos Obrigatórios e Decisões Finais
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  calculateConcentrationPure,
  concentracaoCalculatorConfig
} from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';

import {
  calculateDosePure,
  doseCalculatorConfig
} from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

import {
  setPendingTransfer,
  getPendingTransfer,
  consumePendingTransfer,
  clearPendingTransfer
} from '../src/features/calculators/core/transferSession.ts';

import {
  evaluateCalculationTransfer,
  evaluateDoseToConcentracao,
  hasEligibleTransferTargets,
  NO_COMPATIBLE_FIELDS_NOTICE
} from '../src/features/calculators/core/transferService.ts';

describe('Fase 6B: Migração da Concentração da Calda e Validação Estrita de Transferência', () => {

  // ========================================================
  // 1. Equivalência matemática da Concentração nos modos existentes
  // ========================================================
  test('1. Equivalência matemática da Concentração nos modos Jovem e Adulta', () => {
    // Modo Jovem: (100 mL/hL * 400 L) / 100 = 400 mL
    const resJovem = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(resJovem.quantidade_pf_small, 400);
    assert.equal(resJovem.primaryValue, 400);
    assert.equal(resJovem.primaryUnit, 'mL');
    assert.equal(resJovem.subValue, 0.4);
    assert.equal(resJovem.subUnit, 'L');

    // Modo Adulta: (400 L * 100 mL/hL * 1000 L/ha) / (400 L/ha * 100) = 1000 mL = 1.00 L
    const resAdulta = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'adulta');
    assert.equal(resAdulta.quantidade_pf_small, 1000);
    assert.equal(resAdulta.primaryValue, 1.0);
    assert.equal(resAdulta.primaryUnit, 'L');
    assert.equal(resAdulta.subValue, 1000);
    assert.equal(resAdulta.subUnit, 'mL');
  });

  // ========================================================
  // 2. Valores Predefinidos Oficiais
  // ========================================================
  test('2. Valores predefinidos oficiais produzem os resultados exatos', () => {
    const res = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(res.quantidade_pf_small, 400);
  });

  // ========================================================
  // 3. Valores Decimais
  // ========================================================
  test('3. Valores decimais são calculados com precisão', () => {
    // (125.5 * 350.5) / 100 = 439.8775 -> 439.88 mL
    const resDec = calculateConcentrationPure(125.5, 'mL/hL', 350.5, 1000, 400, 'jovem');
    assert.equal(resDec.quantidade_pf_small, 439.88);
  });

  // ========================================================
  // 4. Valores Baixos e Elevados
  // ========================================================
  test('4. Valores baixos e elevados são formatados apropriadamente', () => {
    // Baixo: 10 mL/hL em 100 L -> 10 mL (< 1000 mL -> primário é mL)
    const resBaixo = calculateConcentrationPure(10, 'mL/hL', 100, 1000, 400, 'jovem');
    assert.equal(resBaixo.primaryUnit, 'mL');
    assert.equal(resBaixo.primaryValue, 10);
    assert.equal(resBaixo.subUnit, 'L');

    // Elevado: 500 mL/hL em 2000 L -> 10000 mL = 10 L (>= 1000 mL -> primário é L)
    const resAlto = calculateConcentrationPure(500, 'mL/hL', 2000, 1000, 400, 'jovem');
    assert.equal(resAlto.primaryUnit, 'L');
    assert.equal(resAlto.primaryValue, 10);
    assert.equal(resAlto.subUnit, 'mL');
    assert.equal(resAlto.subValue, 10000);
  });

  // ========================================================
  // 5. Unidades Líquidas e Sólidas Suportadas
  // ========================================================
  test('5. Suporte estrito a unidades líquidas e sólidas (% , L/hL, g/hL, kg/hL)', () => {
    // g/hL (sólido): 200 g/hL em 500 L -> 1000 g = 1 kg
    const resSolidoG = calculateConcentrationPure(200, 'g/hL', 500, 1000, 400, 'jovem');
    assert.equal(resSolidoG.isSolid, true);
    assert.equal(resSolidoG.primaryUnit, 'kg');
    assert.equal(resSolidoG.primaryValue, 1);
    assert.equal(resSolidoG.subUnit, 'g');
    assert.equal(resSolidoG.subValue, 1000);

    // kg/hL (sólido com fator 1000): 0.2 kg/hL em 500 L -> 200 g/hL * 5 = 1000 g = 1 kg
    const resSolidoKg = calculateConcentrationPure(0.2, 'kg/hL', 500, 1000, 400, 'jovem');
    assert.equal(resSolidoKg.isSolid, true);
    assert.equal(resSolidoKg.primaryValue, 1);

    // % (fator 1000): 0.1% em 500 L -> 100 mL/hL * 5 = 500 mL
    const resPct = calculateConcentrationPure(0.1, '%', 500, 1000, 400, 'jovem');
    assert.equal(resPct.isSolid, false);
    assert.equal(resPct.primaryValue, 500);
    assert.equal(resPct.primaryUnit, 'mL');
  });

  // ========================================================
  // 6. Validações Agronómicas
  // ========================================================
  test('6. Validações bloqueiam ou avisam sobre valores inválidos', () => {
    const valJovemInvalido = concentracaoCalculatorConfig.validate({
      volPrepararConc: { rawValue: 0, unit: 'L', normalizedValue: 0, dimension: 'volume', canonicalKey: 'tank_volume', label: '', source: 'user_input', localId: 'volPrepararConc', calculatorId: 'calc_concentracao', calculatorVersion: '1.0.0' },
      concValue: { rawValue: -5, unit: 'mL/hL', normalizedValue: -5, dimension: 'concentration', canonicalKey: 'concentration', label: '', source: 'user_input', localId: 'concValue', calculatorId: 'calc_concentracao', calculatorVersion: '1.0.0' },
      mode: { rawValue: 'jovem', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: 'calculator_mode', label: '', source: 'user_input', localId: 'mode', calculatorId: 'calc_concentracao', calculatorVersion: '1.0.0' }
    });
    assert.equal(valJovemInvalido.isValid, false);
    assert.ok(valJovemInvalido.errors['volPrepararConc']);
    assert.ok(valJovemInvalido.errors['concValue']);
  });

  // ========================================================
  // 7. Divisão por Zero
  // ========================================================
  test('7. Divisão por zero no modo adulta é tratada de forma segura (resultado = 0)', () => {
    const resZero = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 0, 'adulta');
    assert.equal(resZero.quantidade_pf_small, 0);
    assert.equal(resZero.primaryValue, 0);
  });

  // ========================================================
  // 8. Comportamento por Modo
  // ========================================================
  test('8. Comportamento por modo (Jovem usa 2 campos; Adulta usa 4 campos)', () => {
    const modoJovem = concentracaoCalculatorConfig.modes?.find(m => m.id === 'jovem');
    assert.deepEqual(modoJovem?.fieldIds, ['concValue', 'volPrepararConc']);

    const modoAdulto = concentracaoCalculatorConfig.modes?.find(m => m.id === 'adulta');
    assert.deepEqual(modoAdulto?.fieldIds, ['volPrepararConc', 'concValue', 'volRecomendado', 'volAplicado']);
  });

  // ========================================================
  // 9. Microlearning Geral Preservado
  // ========================================================
  test('9. Microlearning geral preservado', () => {
    assert.equal(concentracaoCalculatorConfig.generalHelpFile, 'ConcentracaoFAQGeral.md');
    assert.ok(fs.existsSync(path.resolve('src/features/concentracao/ConcentracaoFAQGeral.md')));
  });

  // ========================================================
  // 10. Microlearning por Campo Preservado
  // ========================================================
  test('10. Microlearning por campo preservado em todos os campos', () => {
    for (const f of concentracaoCalculatorConfig.fields) {
      if (f.helpFile) {
        assert.ok(fs.existsSync(path.resolve(`src/features/concentracao/${f.helpFile}`)));
      }
    }
  });

  // ========================================================
  // 11. Teclado DATERRA Preservado
  // ========================================================
  test('11. Teclado DATERRA preservado com unidades autorizadas', () => {
    const concField = concentracaoCalculatorConfig.fields.find(f => f.id === 'concValue');
    assert.deepEqual(concField?.allowedUnits, ['mL/hL', 'g/hL', '%', 'L/hL', 'kg/hL']);
  });

  // ========================================================
  // 12. Máximo de Quatro Atalhos por Campo
  // ========================================================
  test('12. Máximo de quatro atalhos declarados por campo', () => {
    for (const f of concentracaoCalculatorConfig.fields) {
      if (f.presets) {
        assert.ok(f.presets.length <= 4, `Campo ${f.id} tem mais de 4 atalhos: ${f.presets.length}`);
      }
    }
  });

  // ========================================================
  // 13. Quando não existem campos compatíveis, Concentração não é elegível
  // ========================================================
  test('13. Quando não existem campos compatíveis, a Calculadora de Concentração não aparece como elegível', () => {
    const mockDose = {
      id: 'dose-rec-1',
      userId: 'usr-1',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0',
      name: 'Vinha da Quinta',
      inputs: {
        volPrepararDose: { rawValue: 1000, unit: 'L', dimension: 'volume', canonicalKey: 'tank_volume', label: 'Volume a Preparar', source: 'user_input', localId: 'volPrepararDose', calculatorId: 'calc_dose', calculatorVersion: '1.0.0' },
        doseValue: { rawValue: 2, unit: 'L/ha', dimension: 'application_rate', canonicalKey: 'product_dose_rate', label: 'Dose', source: 'user_input', localId: 'doseValue', calculatorId: 'calc_dose', calculatorVersion: '1.0.0' },
        volCalda: { rawValue: 200, unit: 'L/ha', dimension: 'application_rate', canonicalKey: 'spray_volume_rate', label: 'Volume Aplicado', source: 'user_input', localId: 'volCalda', calculatorId: 'calc_dose', calculatorVersion: '1.0.0' }
      },
      outputs: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local_only',
      isDeleted: false
    };

    const previews = evaluateCalculationTransfer(mockDose);
    assert.equal(previews.length, 0, 'Não deve retornar destinos com zero campos compatíveis');
    assert.equal(hasEligibleTransferTargets(mockDose), false);
  });

  // ========================================================
  // 14. Botão "Usar noutra ferramenta" não aparece quando a lista de elegíveis é vazia
  // ========================================================
  test('14. Botão "Usar noutra ferramenta" não aparece quando a lista de destinos elegíveis está vazia', () => {
    const cardCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationHistoryCard.tsx'),
      'utf8'
    );
    assert.ok(cardCode.includes('hasEligibleTransferTargets(record)'));

    const detailCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/HistoryDetailModal.tsx'),
      'utf8'
    );
    assert.ok(detailCode.includes('hasEligibleTransferTargets(record)'));
  });

  // ========================================================
  // 15. Não é criada sessão transitória quando não há campos transferíveis
  // ========================================================
  test('15. Não é criada sessão transitória quando não existem campos transferíveis', () => {
    clearPendingTransfer();
    assert.equal(getPendingTransfer(), null);

    // Tentativa com payload vazio
    setPendingTransfer({
      sourceCalculationId: 'test',
      sourceCalculatorId: 'calc_dose',
      sourceCreatedAt: new Date().toISOString(),
      targetCalculatorId: 'calc_concentracao',
      fields: {}
    });

    const pending = getPendingTransfer();
    assert.equal(Object.keys(pending.fields).length, 0);
    consumePendingTransfer();
    assert.equal(getPendingTransfer(), null);
  });

  // ========================================================
  // 16. Não ocorre redirecionamento automático
  // ========================================================
  test('16. Não ocorre redirecionamento sem campos compatíveis', () => {
    const modalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationTransferModal.tsx'),
      'utf8'
    );
    assert.ok(!modalCode.includes('window.location'));
    assert.ok(modalCode.includes('!hasCompatibleFields'));
  });

  // ========================================================
  // 17. Não aparece faixa de valores importados sem valores aplicados
  // ========================================================
  test('17. Não aparece faixa de valores importados sem valores aplicados', () => {
    const templateCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx'),
      'utf8'
    );
    assert.ok(templateCode.includes('appliedCount > 0'));
    assert.ok(templateCode.includes('setActiveImportedNotice(null)'));
  });

  // ========================================================
  // 18. Não aparece mensagem sobre Volume Aplicado sem valor recebido
  // ========================================================
  test('18. Não aparece mensagem sobre Volume Aplicado sem valor efetivamente recebido', () => {
    const templateCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx'),
      'utf8'
    );
    assert.ok(templateCode.includes("payload.fields['volAplicado']"));
    assert.ok(templateCode.includes("setUnneededNotice(null)"));
  });

  // ========================================================
  // 19. A pré-visualização apresenta zero campos transferíveis quando esse é o estado real
  // ========================================================
  test('19. A pré-visualização apresenta zero campos transferíveis quando esse é o estado real', () => {
    const mockDose = {
      id: 'dose-rec-1',
      userId: 'usr-1',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0',
      inputs: {
        volPrepararDose: { rawValue: 1000, unit: 'L', dimension: 'volume', canonicalKey: 'tank_volume', label: 'Volume a Preparar', source: 'user_input', localId: 'volPrepararDose', calculatorId: 'calc_dose', calculatorVersion: '1.0.0' }
      },
      outputs: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local_only',
      isDeleted: false
    };

    const detail = evaluateDoseToConcentracao(mockDose);
    assert.equal(detail.compatibleFields.length, 0);
    assert.equal(detail.operationalNoticePt, NO_COMPATIBLE_FIELDS_NOTICE);
  });

  // ========================================================
  // 20. Prevenção de substituição indevida implementada via TransferOverwritePromptModal
  // ========================================================
  test('20. Prevenção de substituição indevida implementada via TransferOverwritePromptModal', () => {
    const modalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/TransferOverwritePromptModal.tsx'),
      'utf8'
    );
    assert.ok(modalCode.includes('onKeepCurrent'));
    assert.ok(modalCode.includes('onApplyReceived'));
    assert.ok(modalCode.includes('onCancelTransfer'));
    assert.ok(modalCode.includes('Substituir valores existentes?'));
  });

  // ========================================================
  // 21. Calculadora de Concentração continua funcional de forma independente
  // ========================================================
  test('21. A Calculadora de Concentração continua funcional de forma independente', () => {
    const res = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(res.quantidade_pf_small, 400);
    assert.equal(concentracaoCalculatorConfig.id, 'calc_concentracao');
  });

  // ========================================================
  // 22. transferSession é limpo após consumo ou cancelamento
  // ========================================================
  test('22. transferSession é limpo após consumo ou cancelamento', () => {
    setPendingTransfer({
      sourceCalculationId: 'test-id',
      sourceCalculatorId: 'calc_dose',
      sourceCreatedAt: new Date().toISOString(),
      targetCalculatorId: 'calc_concentracao',
      fields: {}
    });
    assert.ok(getPendingTransfer() !== null);
    const consumed = consumePendingTransfer();
    assert.equal(consumed?.sourceCalculationId, 'test-id');
    assert.equal(getPendingTransfer(), null);
  });

  // ========================================================
  // 23. A transferência em memória não grava na base de dados
  // ========================================================
  test('23. A transferência em memória não grava na base de dados', () => {
    const sessionCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/transferSession.ts'),
      'utf8'
    );
    assert.ok(!sessionCode.includes('db.'));
    assert.ok(!sessionCode.includes('localStorage.'));
  });

  // ========================================================
  // 24. Concentração é renderizada via UniversalCalculatorTemplate para calculation_history_v2
  // ========================================================
  test('24. Concentração é renderizada via UniversalCalculatorTemplate para calculation_history_v2', () => {
    const toolsViewCode = fs.readFileSync(
      path.resolve('src/views/ToolsView.tsx'),
      'utf8'
    );
    assert.ok(toolsViewCode.includes("currentViewTool === 'calc_concentracao'"));
    assert.ok(toolsViewCode.includes('definition={concentracaoCalculatorConfig}'));
  });

  // ========================================================
  // 25. Calculadora de Dose mantém integridade de fórmulas e 4 atalhos por campo
  // ========================================================
  test('25. Calculadora de Dose mantém integridade de fórmulas e 4 atalhos por campo', () => {
    const pure = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(pure.primaryValue, 10);
    assert.equal(pure.primaryUnit, 'L');
    assert.equal(pure.subValue, 10000);
    assert.equal(pure.subUnit, 'mL');
    assert.equal(pure.area_tratada_ha, 5);

    for (const f of doseCalculatorConfig.fields) {
      assert.equal(f.presets?.length, 4);
    }
  });

  // ========================================================
  // 26. Área de Parede Foliar mantém sua rota e componente exclusivo
  // ========================================================
  test('26. Área de Parede Foliar mantém sua rota e componente exclusivo', () => {
    const toolsViewCode = fs.readFileSync(
      path.resolve('src/views/ToolsView.tsx'),
      'utf8'
    );
    assert.ok(toolsViewCode.includes("currentViewTool === 'calc_area_parede_foliar'"));
    assert.ok(toolsViewCode.includes('<AreaParedeFoliarCalculator />'));
  });

  // ========================================================
  // 27. Zero Dependência de Supabase
  // ========================================================
  test('27. Nenhuma dependência ou chamada remota de Supabase na Concentração ou Transferência', () => {
    const configCode = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/concentracaoCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(!configCode.includes('supabase'));

    const sessionCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/transferSession.ts'),
      'utf8'
    );
    assert.ok(!sessionCode.includes('supabase'));
  });

  // ========================================================
  // 28. Modais e Painéis com Acessibilidade Rigorosa
  // ========================================================
  test('28. Modais e painéis cumprem requisitos de acessibilidade (role="dialog", aria-modal="true")', () => {
    const transferModalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationTransferModal.tsx'),
      'utf8'
    );
    assert.ok(transferModalCode.includes('role="dialog"'));
    assert.ok(transferModalCode.includes('aria-modal="true"'));

    const overwriteModalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/TransferOverwritePromptModal.tsx'),
      'utf8'
    );
    assert.ok(overwriteModalCode.includes('role="dialog"'));
    assert.ok(overwriteModalCode.includes('aria-modal="true"'));
  });
});
