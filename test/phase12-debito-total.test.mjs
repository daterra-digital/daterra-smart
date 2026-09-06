import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';

import {
  calculateTotalFlowRatePure,
  debitoTotalCalculatorConfig
} from '../src/features/calculators/definitions/debitoTotalCalculatorConfig.ts';
import { CANONICAL_VARIABLES } from '../src/features/calculators/core/canonicalVariables.ts';

describe('Fase 12 — Calculadora de Débito Total do Pulverizador (calc_debito_total)', () => {

  // ==========================================
  // GRUPO 1: FUNÇÃO PURA (MATEMÁTICA SEGURA)
  // ==========================================
  describe('1. Função Pura calculateTotalFlowRatePure', () => {

    test('1.1 Caso canónico: 300 L/ha × 24 m × 8,0 km/h ÷ 600 = 96,0 L/min', () => {
      const res = calculateTotalFlowRatePure(300, 24, 8, 'boom_total_width');
      assert.equal(res.isValid, true);
      assert.equal(res.debito_total_l_min, 96.0);
    });

    test('1.2 Valores com decimais: 250,5 L/ha × 18,2 m × 6,5 km/h ÷ 600 = 49,4 L/min', () => {
      const res = calculateTotalFlowRatePure(250.5, 18.2, 6.5, 'boom_total_width');
      assert.equal(res.isValid, true);
      assert.equal(res.debito_total_l_min, 49.4);
    });

    test('1.3 Correção Obrigatória 2: Aceita valores fora dos limites da interface (matemática pura)', () => {
      // Q = 20 (< 50), W = 0.5 (< 1), v = 1 (< 2)
      // Qt = (20 × 0.5 × 1) / 600 = 10 / 600 = 0.0166... -> 0.0 L/min
      const resLow = calculateTotalFlowRatePure(20, 0.5, 1, 'manual_width');
      assert.equal(resLow.isValid, true);
      assert.equal(typeof resLow.debito_total_l_min, 'number');

      // Q = 3000 (> 2000), W = 80 (> 60), v = 25 (> 20)
      // Qt = (3000 × 80 × 25) / 600 = 6000000 / 600 = 10000.0 L/min
      const resHigh = calculateTotalFlowRatePure(3000, 80, 25, 'row_spacing');
      assert.equal(resHigh.isValid, true);
      assert.equal(resHigh.debito_total_l_min, 10000.0);
    });

    test('1.4 Rejeita zeros e valores não positivos', () => {
      assert.equal(calculateTotalFlowRatePure(0, 24, 8, 'boom_total_width').isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, 0, 8, 'boom_total_width').isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, 24, 0, 'boom_total_width').isValid, false);
      assert.equal(calculateTotalFlowRatePure(-300, 24, 8, 'boom_total_width').isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, -24, 8, 'boom_total_width').isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, 24, -8, 'boom_total_width').isValid, false);
    });

    test('1.5 Rejeita base de largura ausente ou inválida', () => {
      assert.equal(calculateTotalFlowRatePure(300, 24, 8, undefined).isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, 24, 8, '').isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, 24, 8, 'invalid_base').isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, 24, 8, 'row_spacing').isValid, true);
      assert.equal(calculateTotalFlowRatePure(300, 24, 8, 'effective_treated_band').isValid, true);
      assert.equal(calculateTotalFlowRatePure(300, 24, 8, 'manual_width').isValid, true);
    });

    test('1.6 Proteção contra NaN, Infinity e valores não numéricos', () => {
      assert.equal(calculateTotalFlowRatePure(NaN, 24, 8, 'boom_total_width').isValid, false);
      assert.equal(calculateTotalFlowRatePure(300, Infinity, 8, 'boom_total_width').isValid, false);
      assert.equal(calculateTotalFlowRatePure('300', 24, 8, 'boom_total_width').isValid, false);
    });
  });

  // ==========================================
  // GRUPO 2: CORREÇÃO CRÍTICA 1 — UNIDADE DA LARGURA (m, NUNCA mm)
  // ==========================================
  describe('2. Unidade Canónica e Configuração da Largura (metros)', () => {

    test('2.1 working_width no catálogo canónico usa unidade canónica "m"', () => {
      assert.equal(CANONICAL_VARIABLES.working_width.canonicalUnit, 'm');
      assert.equal(CANONICAL_VARIABLES.working_width.dimension, 'length');
    });

    test('2.2 Campo larguraTrabalho usa estritamente defaultUnit "m" e allowedUnits ["m"]', () => {
      const wField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'larguraTrabalho');
      assert.ok(wField);
      assert.equal(wField.canonicalKey, 'working_width');
      assert.equal(wField.dimension, 'length');
      assert.equal(wField.defaultUnit, 'm');
      assert.deepEqual(wField.allowedUnits, ['m']);
      assert.equal(wField.label, 'Largura de trabalho efetiva (m)');
      assert.equal(wField.label.includes('mm'), false);
    });

    test('2.3 No ficheiro de configuração não existe qualquer referência a "mm"', () => {
      const configStr = fs.readFileSync('src/features/calculators/definitions/debitoTotalCalculatorConfig.ts', 'utf8');
      assert.equal(configStr.includes('mm'), false);
    });

    test('2.4 Cálculo com W = 24 significa 24 metros e produz 96,0 L/min', () => {
      const inputs = {
        volumeCalda: { rawValue: 300, unit: 'L/ha', canonicalKey: 'spray_volume_rate', dimension: 'application_rate' },
        velocidadeTrabalho: { rawValue: 8.0, unit: 'km/h', canonicalKey: 'work_speed', dimension: 'speed' },
        larguraTrabalho: { rawValue: 24, unit: 'm', canonicalKey: 'working_width', dimension: 'length' },
        baseLargura: { rawValue: 'boom_total_width', unit: '', canonicalKey: 'working_width_interpretation', dimension: 'text' }
      };

      const out = debitoTotalCalculatorConfig.calculate(inputs);
      assert.equal(out.debitoTotal.rawValue, 96.0);
      assert.equal(out.debitoTotal.unit, 'L/min');
      assert.equal(out.debitoTotal.canonicalKey, 'total_flow_rate');
      assert.equal(out.debitoTotal.dimension, 'flow_rate');
    });
  });

  // ==========================================
  // GRUPO 3: VALIDAÇÃO DECLARATIVA E LIMITES OPERACIONAIS
  // ==========================================
  describe('3. Validação Declarativa da Calculadora', () => {

    test('3.1 Rejeita campos vazios com mensagens explícitas', () => {
      const res = debitoTotalCalculatorConfig.validate({});
      assert.equal(res.isValid, false);
      assert.ok(res.errors.volumeCalda);
      assert.ok(res.errors.velocidadeTrabalho);
      assert.ok(res.errors.larguraTrabalho);
      assert.ok(res.errors.baseLargura);
    });

    test('3.2 Bloqueia volume < 50 e volume > 2000', () => {
      const makeInputs = (q) => ({
        volumeCalda: { rawValue: q },
        velocidadeTrabalho: { rawValue: 8 },
        larguraTrabalho: { rawValue: 24 },
        baseLargura: { rawValue: 'boom_total_width' }
      });

      const resLow = debitoTotalCalculatorConfig.validate(makeInputs(49));
      assert.equal(resLow.isValid, false);
      assert.ok(resLow.errors.volumeCalda.includes('50'));

      const resHigh = debitoTotalCalculatorConfig.validate(makeInputs(2001));
      assert.equal(resHigh.isValid, false);
      assert.ok(resHigh.errors.volumeCalda.includes('2 000'));
    });

    test('3.3 Bloqueia velocidade < 2 e velocidade > 20', () => {
      const makeInputs = (v) => ({
        volumeCalda: { rawValue: 300 },
        velocidadeTrabalho: { rawValue: v },
        larguraTrabalho: { rawValue: 24 },
        baseLargura: { rawValue: 'boom_total_width' }
      });

      const resLow = debitoTotalCalculatorConfig.validate(makeInputs(1.9));
      assert.equal(resLow.isValid, false);
      assert.ok(resLow.errors.velocidadeTrabalho.includes('2,0'));

      const resHigh = debitoTotalCalculatorConfig.validate(makeInputs(20.1));
      assert.equal(resHigh.isValid, false);
      assert.ok(resHigh.errors.velocidadeTrabalho.includes('20,0'));
    });

    test('3.4 Bloqueia largura < 1 e largura > 60', () => {
      const makeInputs = (w) => ({
        volumeCalda: { rawValue: 300 },
        velocidadeTrabalho: { rawValue: 8 },
        larguraTrabalho: { rawValue: w },
        baseLargura: { rawValue: 'boom_total_width' }
      });

      const resLow = debitoTotalCalculatorConfig.validate(makeInputs(0.9));
      assert.equal(resLow.isValid, false);
      assert.ok(resLow.errors.larguraTrabalho.includes('1,0'));

      const resHigh = debitoTotalCalculatorConfig.validate(makeInputs(60.1));
      assert.equal(resHigh.isValid, false);
      assert.ok(resHigh.errors.larguraTrabalho.includes('60,0'));
    });

    test('3.5 Emite avisos não bloqueantes para volumes extremos (50 <= Q < 100 e 1500 < Q <= 2000)', () => {
      const makeInputs = (q) => ({
        volumeCalda: { rawValue: q },
        velocidadeTrabalho: { rawValue: 8 },
        larguraTrabalho: { rawValue: 24 },
        baseLargura: { rawValue: 'boom_total_width' }
      });

      const warnLow = debitoTotalCalculatorConfig.validate(makeInputs(80));
      assert.equal(warnLow.isValid, true);
      assert.ok(warnLow.warnings.volumeCalda.includes('baixo'));

      const warnHigh = debitoTotalCalculatorConfig.validate(makeInputs(1800));
      assert.equal(warnHigh.isValid, true);
      assert.ok(warnHigh.warnings.volumeCalda.includes('elevado'));
    });

    test('3.6 Emite avisos não bloqueantes para velocidades extremas (2 <= v < 4 e 15 < v <= 20)', () => {
      const makeInputs = (v) => ({
        volumeCalda: { rawValue: 300 },
        velocidadeTrabalho: { rawValue: v },
        larguraTrabalho: { rawValue: 24 },
        baseLargura: { rawValue: 'boom_total_width' }
      });

      const warnLow = debitoTotalCalculatorConfig.validate(makeInputs(3.0));
      assert.equal(warnLow.isValid, true);
      assert.ok(warnLow.warnings.velocidadeTrabalho.includes('baixa'));

      const warnHigh = debitoTotalCalculatorConfig.validate(makeInputs(18.0));
      assert.equal(warnHigh.isValid, true);
      assert.ok(warnHigh.warnings.velocidadeTrabalho.includes('elevada'));
    });

    test('3.7 Emite avisos de plausibilidade do débito resultante (Qt < 10 e Qt > 500)', () => {
      // Qt = (50 × 1 × 2) / 600 = 0.2 L/min (< 10)
      const resLow = debitoTotalCalculatorConfig.validate({
        volumeCalda: { rawValue: 50 },
        velocidadeTrabalho: { rawValue: 2 },
        larguraTrabalho: { rawValue: 1 },
        baseLargura: { rawValue: 'boom_total_width' }
      });
      assert.equal(resLow.isValid, true);
      assert.ok(resLow.warnings.debitoTotal.includes('baixo'));

      // Qt = (2000 × 60 × 20) / 600 = 4000.0 L/min (> 500)
      const resHigh = debitoTotalCalculatorConfig.validate({
        volumeCalda: { rawValue: 2000 },
        velocidadeTrabalho: { rawValue: 20 },
        larguraTrabalho: { rawValue: 60 },
        baseLargura: { rawValue: 'boom_total_width' }
      });
      assert.equal(resHigh.isValid, true);
      assert.ok(resHigh.warnings.debitoTotal.includes('elevado'));
    });
  });

  // ==========================================
  // GRUPO 4: SELETOR DE BASE E ATALHOS DINÂMICOS
  // ==========================================
  describe('4. Seletor de Base e Presets Dinâmicos', () => {

    const baseField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'baseLargura');
    const wField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'larguraTrabalho');

    test('4.1 O campo baseLargura é do tipo "select" e não utiliza teclado numérico', () => {
      assert.equal(baseField.type, 'select');
      assert.equal(baseField.required, true);
      assert.equal(baseField.options.length, 4);
    });

    test('4.2 Atalhos dinâmicos para "boom_total_width": [12, 24, 36, 48]', () => {
      const presets = wField.getDynamicPresets({ baseLargura: 'boom_total_width' });
      assert.deepEqual(presets, [12, 24, 36, 48]);
    });

    test('4.3 Atalhos dinâmicos para "row_spacing": [2, 3, 4, 5]', () => {
      const presets = wField.getDynamicPresets({ baseLargura: 'row_spacing' });
      assert.deepEqual(presets, [2, 3, 4, 5]);
    });

    test('4.4 Atalhos dinâmicos vazios para "effective_treated_band" e "manual_width"', () => {
      assert.deepEqual(wField.getDynamicPresets({ baseLargura: 'effective_treated_band' }), []);
      assert.deepEqual(wField.getDynamicPresets({ baseLargura: 'manual_width' }), []);
      assert.deepEqual(wField.getDynamicPresets({}), []);
    });

    test('4.5 Atalhos fixos de volume ([200, 400, 600, 800]) e velocidade ([4, 6, 8, 10])', () => {
      const qField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'volumeCalda');
      const vField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'velocidadeTrabalho');
      assert.deepEqual(qField.presets, [200, 400, 600, 800]);
      assert.deepEqual(vField.presets, [4, 6, 8, 10]);
    });
  });

  // ==========================================
  // GRUPO 5: LINHAS ALTERNADAS E ACESSIBILIDADE
  // ==========================================
  describe('5. Regra de Linhas Alternadas e Acessibilidade', () => {

    const baseField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'baseLargura');
    const rowSpacingOpt = baseField.options.find(o => o.value === 'row_spacing');
    const boomOpt = baseField.options.find(o => o.value === 'boom_total_width');
    const bandOpt = baseField.options.find(o => o.value === 'effective_treated_band');
    const manualOpt = baseField.options.find(o => o.value === 'manual_width');

    test('5.1 Descrição oficial exata de row_spacing', () => {
      const expectedDesc = 'Distância entre o centro de uma linha e o centro da linha adjacente. Utilize esta opção apenas quando a entrelinha representar a largura efetivamente tratada em cada passagem.';
      assert.equal(rowSpacingOpt.description, expectedDesc);
    });

    test('5.2 Texto exato do aviso contextual de linhas alternadas em row_spacing', () => {
      const expectedWarning = 'Em tratamentos de linhas alternadas, algumas linhas podem não receber aplicação direta em cada passagem. Confirme se a estratégia, a cobertura e o intervalo entre aplicações são adequados à cultura, ao produto e ao risco fitossanitário.';
      assert.equal(rowSpacingOpt.contextualWarning, expectedWarning);
    });

    test('5.3 As outras 3 opções NÃO contêm aviso contextual', () => {
      assert.equal(boomOpt.contextualWarning, undefined);
      assert.equal(bandOpt.contextualWarning, undefined);
      assert.equal(manualOpt.contextualWarning, undefined);
    });

    test('5.4 O aviso contextual NÃO bloqueia cálculo nem gravação', () => {
      const inputs = {
        volumeCalda: { rawValue: 300, unit: 'L/ha' },
        velocidadeTrabalho: { rawValue: 6.0, unit: 'km/h' },
        larguraTrabalho: { rawValue: 3.0, unit: 'm' },
        baseLargura: { rawValue: 'row_spacing', labelSnapshot: 'Distância entrelinhas' }
      };

      const valRes = debitoTotalCalculatorConfig.validate(inputs);
      assert.equal(valRes.isValid, true);
      assert.equal(Object.keys(valRes.errors).length, 0);

      const out = debitoTotalCalculatorConfig.calculate(inputs);
      assert.equal(out.debitoTotal.rawValue, 9.0);
      assert.equal(out.debitoTotal.unit, 'L/min');
    });

    test('5.5 O aviso contextual NÃO altera a largura nem a fórmula matemática', () => {
      // Qt = (300 × 3 × 6) / 600 = 5400 / 600 = 9.0 L/min
      const res = calculateTotalFlowRatePure(300, 3, 6, 'row_spacing');
      assert.equal(res.debito_total_l_min, 9.0);
    });

    test('5.6 CalculatorInputField implementa aria-describedby condicional para o aviso', () => {
      const inputFieldCode = fs.readFileSync('src/features/calculators/core/CalculatorInputField.tsx', 'utf8');
      assert.ok(inputFieldCode.includes('selectedOption?.contextualWarning ? `${field.id}-contextual-warning` : null'));
      assert.ok(inputFieldCode.includes('role="status"'));
    });
  });

  // ==========================================
  // GRUPO 6: MICROLEARNING NORMATIVO
  // ==========================================
  describe('6. Microlearning Normativo (5 Ficheiros)', () => {

    const faqFiles = [
      'src/features/debito-total/DebitoTotalFAQGeral.md',
      'src/features/debito-total/DebitoTotalFAQVolume.md',
      'src/features/debito-total/DebitoTotalFAQVelocidade.md',
      'src/features/debito-total/DebitoTotalFAQLargura.md',
      'src/features/debito-total/DebitoTotalFAQResultado.md'
    ];

    test('6.1 Todos os 5 ficheiros existem e contêm 10 secções normativas', () => {
      for (const f of faqFiles) {
        assert.ok(fs.existsSync(f), `Ficheiro ${f} deve existir`);
        const content = fs.readFileSync(f, 'utf8');
        const count = (content.match(/^##\s/gm) || []).length;
        assert.equal(count, 10, `${f} deve ter exatamente 10 secções`);
      }
    });

    test('6.2 DebitoTotalFAQLargura.md contém pergunta e resposta sobre linhas alternadas', () => {
      const content = fs.readFileSync('src/features/debito-total/DebitoTotalFAQLargura.md', 'utf8');
      assert.ok(content.includes('O que devo considerar em tratamentos de linhas alternadas?'));
      assert.ok(content.includes('Em tratamentos de linhas alternadas, nem todas as linhas recebem aplicação direta na mesma passagem'));
      assert.ok(content.includes('como pode acontecer com produtos de contacto ou preventivos'));
    });

    test('6.3 DebitoTotalFAQGeral.md contém pergunta e resposta sobre decisão da estratégia', () => {
      const content = fs.readFileSync('src/features/debito-total/DebitoTotalFAQGeral.md', 'utf8');
      assert.ok(content.includes('Posso usar esta calculadora para decidir uma estratégia de linhas alternadas?'));
      assert.ok(content.includes('A calculadora estima o débito total para os valores introduzidos. Não decide se uma estratégia de linhas alternadas é adequada.'));
    });

    test('6.4 DidacticHelp importa e mapeia todos os 5 ficheiros', () => {
      const didacticCode = fs.readFileSync('src/features/concentracao/DidacticHelp.tsx', 'utf8');
      assert.ok(didacticCode.includes('DebitoTotalFAQGeral.md'));
      assert.ok(didacticCode.includes('DebitoTotalFAQVolume.md'));
      assert.ok(didacticCode.includes('DebitoTotalFAQVelocidade.md'));
      assert.ok(didacticCode.includes('DebitoTotalFAQLargura.md'));
      assert.ok(didacticCode.includes('DebitoTotalFAQResultado.md'));
    });
  });

  // ==========================================
  // GRUPO 7: INTEGRAÇÃO DA ROTA E DO CATÁLOGO
  // ==========================================
  describe('7. Integração na Aplicação', () => {

    test('7.1 Rota /ferramentas/debito-total configurada em App.tsx', () => {
      const appCode = fs.readFileSync('src/App.tsx', 'utf8');
      assert.ok(appCode.includes('path="/ferramentas/debito-total"'));
      assert.ok(appCode.includes('<DebitoTotalCalculator />'));
    });

    test('7.2 Cartão no catálogo de ferramentas usa ID oficial, ícone Gauge e categoria Calibração', () => {
      const toolsCode = fs.readFileSync('src/views/ToolsView.tsx', 'utf8');
      assert.ok(toolsCode.includes("id: 'calc_debito_total'"));
      assert.ok(toolsCode.includes("name: 'Débito Total do Pulverizador'"));
      assert.ok(toolsCode.includes("category: 'Calibração'"));
      assert.ok(toolsCode.includes("icon: Gauge"));
      assert.ok(toolsCode.includes("caminho: '/ferramentas/debito-total'"));
    });

    test('7.3 Histórico de cálculo suporta calc_debito_total com snapshot e 1 casa decimal', () => {
      const historyCode = fs.readFileSync('src/features/calculators/history/CalculationHistoryCard.tsx', 'utf8');
      assert.ok(historyCode.includes("record.calculatorId === 'calc_debito_total'"));
      assert.ok(historyCode.includes("Débito Total do Pulverizador"));
      assert.ok(historyCode.includes("baseLarguraVal"));
    });
  });

  // ==========================================
  // GRUPO 8: SUBFASE 1B.5 — BICOS, PRECISÃO E UX
  // ==========================================
  describe('8. Subfase 1B.5 — Débito Médio por Bico, Divulgação Progressiva e Seletor de Largura', () => {

    test('8.1 Caso de validação oficial: Q=600 L/ha, W=4,0 m, v=6,0 km/h, N=20 -> Qt=24,0 L/min, q_bico=1,20 L/min/bico', () => {
      const res = calculateTotalFlowRatePure(600, 4.0, 6.0, 'row_spacing', 20);
      assert.equal(res.isValid, true);
      assert.equal(res.debito_total_l_min, 24.0);
      assert.equal(res.debito_por_bico_l_min, 1.20);

      const inputs = {
        volumeCalda: { rawValue: 600, unit: 'L/ha', canonicalKey: 'spray_volume_rate', dimension: 'application_rate' },
        velocidadeTrabalho: { rawValue: 6.0, unit: 'km/h', canonicalKey: 'work_speed', dimension: 'speed' },
        larguraTrabalho: { rawValue: 4.0, unit: 'm', canonicalKey: 'working_width', dimension: 'length' },
        baseLargura: { rawValue: 'row_spacing', unit: '', canonicalKey: 'working_width_interpretation', dimension: 'text' },
        numeroBicos: { rawValue: 20, unit: '', canonicalKey: 'active_nozzles_count', dimension: 'count' }
      };

      const out = debitoTotalCalculatorConfig.calculate(inputs);
      assert.equal(out.debitoTotal.rawValue, 24.0);
      assert.equal(out.debitoTotal.unit, 'L/min');
      assert.equal(out.debitoTotal.subValue, 1.20);
      assert.equal(out.debitoTotal.subUnit, 'L/min por bico');
    });

    test('8.2 Sem N fornecido: calcula Qt normalmente e não gera q_bico', () => {
      const res = calculateTotalFlowRatePure(600, 4.0, 6.0, 'row_spacing');
      assert.equal(res.isValid, true);
      assert.equal(res.debito_total_l_min, 24.0);
      assert.equal(res.debito_por_bico_l_min, undefined);

      const inputs = {
        volumeCalda: { rawValue: 600 },
        velocidadeTrabalho: { rawValue: 6.0 },
        larguraTrabalho: { rawValue: 4.0 },
        baseLargura: { rawValue: 'row_spacing' }
      };

      const valRes = debitoTotalCalculatorConfig.validate(inputs);
      assert.equal(valRes.isValid, true);
      assert.equal(valRes.errors.numeroBicos, undefined);

      const out = debitoTotalCalculatorConfig.calculate(inputs);
      assert.equal(out.debitoTotal.rawValue, 24.0);
      assert.equal(out.debitoTotal.subValue, undefined);
    });

    test('8.3 Validação estrita de N: bloqueia decimais, N < 1 e N > 200 sem invalidar Qt', () => {
      const baseInputs = {
        volumeCalda: { rawValue: 600 },
        velocidadeTrabalho: { rawValue: 6.0 },
        larguraTrabalho: { rawValue: 4.0 },
        baseLargura: { rawValue: 'boom_total_width' }
      };

      // Decimal
      const valDec = debitoTotalCalculatorConfig.validate({ ...baseInputs, numeroBicos: { rawValue: 20.5 } });
      assert.equal(valDec.isValid, false);
      assert.ok(valDec.errors.numeroBicos.includes('inteiro'));
      assert.equal(valDec.errors.volumeCalda, undefined);

      // Menor que 1
      const valZero = debitoTotalCalculatorConfig.validate({ ...baseInputs, numeroBicos: { rawValue: 0 } });
      assert.equal(valZero.isValid, false);
      assert.ok(valZero.errors.numeroBicos.includes('mínimo 1'));

      // Maior que 200
      const valHigh = debitoTotalCalculatorConfig.validate({ ...baseInputs, numeroBicos: { rawValue: 201 } });
      assert.equal(valHigh.isValid, false);
      assert.ok(valHigh.errors.numeroBicos.includes('200'));
    });

    test('8.4 Campo numeroBicos está declarado no config como opcional, inteiro e com presets', () => {
      const nField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'numeroBicos');
      assert.ok(nField);
      assert.equal(nField.required, false);
      assert.equal(nField.allowDecimal, false);
      assert.equal(nField.min, 1);
      assert.equal(nField.max, 200);
      assert.deepEqual(nField.presets, [8, 12, 16, 20, 24, 32]);
    });

    test('8.5 WorkingWidthCriteriaSelector existe e exporta componente nativo com 3 opções', () => {
      assert.ok(fs.existsSync('src/features/debito-total/components/WorkingWidthCriteriaSelector.tsx'));
      const compCode = fs.readFileSync('src/features/debito-total/components/WorkingWidthCriteriaSelector.tsx', 'utf8');
      assert.ok(compCode.includes('boom_total_width'));
      assert.ok(compCode.includes('effective_treated_band'));
      assert.ok(compCode.includes('row_spacing'));
      assert.ok(compCode.includes('aria-pressed'));
      assert.ok(!compCode.includes('manual_width')); // manual_width NÃO é uma opção selecionável
    });

    test('8.6 UniversalCalculatorTemplate integra calc_debito_total no grupo isPilotCalculator', () => {
      const templateCode = fs.readFileSync('src/features/calculators/core/UniversalCalculatorTemplate.tsx', 'utf8');
      assert.ok(templateCode.includes("definition.id === 'calc_debito_total'"));
      assert.ok(templateCode.includes('WorkingWidthCriteriaSelector'));
      assert.ok(templateCode.includes('showNozzleCalculation'));
    });

    test('8.7 Todos os 8 ficheiros de tradução contêm o namespace debitoTotal.assistance', () => {
      const locales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];
      for (const lang of locales) {
        const filePath = `src/i18n/locales/${lang}.json`;
        assert.ok(fs.existsSync(filePath), `Ficheiro ${filePath} deve existir`);
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        assert.ok(json.debitoTotal, `${lang}.json deve ter chave debitoTotal`);
        assert.ok(json.debitoTotal.assistance, `${lang}.json deve ter chave debitoTotal.assistance`);
        assert.ok(json.debitoTotal.assistance.widthCriteria, `${lang}.json deve ter widthCriteria`);
        assert.ok(json.debitoTotal.assistance.nozzleCalculation, `${lang}.json deve ter nozzleCalculation`);
      }
    });

    test('8.8 Termos proibidos em PT/BR: não usar "cuba" nas traduções de assistência de débito total', () => {
      const ptJson = fs.readFileSync('src/i18n/locales/pt.json', 'utf8');
      const brJson = fs.readFileSync('src/i18n/locales/br.json', 'utf8');
      const ptObj = JSON.parse(ptJson).debitoTotal;
      const brObj = JSON.parse(brJson).debitoTotal;
      assert.equal(JSON.stringify(ptObj).toLowerCase().includes('cuba'), false);
      assert.equal(JSON.stringify(brObj).toLowerCase().includes('cuba'), false);
    });

    test('8.9 Rótulo e descrição de N refletem bicos ativos em simultâneo e omitem "ambos os lados da copa"', () => {
      const nField = debitoTotalCalculatorConfig.fields.find(f => f.id === 'numeroBicos');
      assert.ok(nField);
      assert.equal(nField.label, 'Número de bicos ativos em simultâneo (opcional)');
      assert.equal(nField.description, 'Indique apenas os bicos que contribuem para o débito total calculado nesta passagem.');

      const ptJson = JSON.parse(fs.readFileSync('src/i18n/locales/pt.json', 'utf8'));
      const nozzleI18n = ptJson.debitoTotal.assistance.nozzleCalculation;
      assert.equal(nozzleI18n.fieldLabel, 'Número de bicos ativos em simultâneo (opcional)');
      assert.equal(nozzleI18n.fieldDescription, 'Indique apenas os bicos que contribuem para o débito total calculado nesta passagem.');
      assert.ok(nozzleI18n.averageFlowNotice.includes('bicos ativos em simultâneo'));
      assert.ok(nozzleI18n.rowSpacingDifferentiatedDistributionNotice.includes('distribuição vertical diferenciada'));

      // Verificar que não existe menção a "ambos os lados da copa"
      const allLocales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];
      for (const lang of allLocales) {
        const json = JSON.parse(fs.readFileSync(`src/i18n/locales/${lang}.json`, 'utf8'));
        const debitoStr = JSON.stringify(json.debitoTotal || {}).toLowerCase();
        assert.equal(debitoStr.includes('ambos os lados'), false);
        assert.equal(debitoStr.includes('both sides'), false);
      }
    });

    test('8.10 Invariância rigorosa de fórmulas e arredondamentos: Qt com 1 decimal e q_bico com 2 decimais', () => {
      // Teste com valores decimais arbitrários
      const res = calculateTotalFlowRatePure(433.333, 3.75, 5.25, 'row_spacing', 15);
      assert.equal(res.isValid, true);
      // Qt = (433.333 * 3.75 * 5.25) / 600 = 8531.2466 / 600 = 14.2187 -> 14.2 L/min
      assert.equal(res.debito_total_l_min, 14.2);
      // q_bico = 14.2187 / 15 = 0.9479 -> 0.95 L/min por bico
      assert.equal(res.debito_por_bico_l_min, 0.95);
    });
  });

});