import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  calculateSprayVolumeTrvPure,
  volumeCaldaTrvCalculatorConfig
} from '../src/features/calculators/definitions/volumeCaldaTrvCalculatorConfig.ts';
import { validateKeypadValue } from '../src/components/keypadValidation.ts';
import { CANONICAL_VARIABLES } from '../src/features/calculators/core/canonicalVariables.ts';

describe('Fase 11 — Calculadora de Volume de Calda Adequado por TRV (calc_volume_calda_trv)', () => {

  // =========================================================================
  // 1. FUNÇÃO PURA E MODELO MATEMÁTICO: Q = k × TRV
  // =========================================================================

  test('1. Caso Canónico: TRV = 6.125,0 m³ TRV/ha e k = 0,033 L/m³ resulta em 202,1 L/ha', () => {
    const res = calculateSprayVolumeTrvPure(6125.0, 0.033);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_calda_l_ha, 202.1);
  });

  test('2. Decimais Válidos: TRV = 8.333,3 e k = 0,025 resulta em 208,3 L/ha', () => {
    const res = calculateSprayVolumeTrvPure(8333.3, 0.025);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_calda_l_ha, 208.3);
  });

  test('3. Decimais Válidos: TRV = 2.750 e k = 0,045 resulta em 123,8 L/ha', () => {
    const res = calculateSprayVolumeTrvPure(2750, 0.045);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_calda_l_ha, 123.8);
  });

  test('4. Limite Inferior Válido: TRV = 500 e k = 0,01 resulta em 5,0 L/ha', () => {
    const res = calculateSprayVolumeTrvPure(500, 0.01);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_calda_l_ha, 5.0);
  });

  test('5. Limite Superior Válido: TRV = 50.000 e k = 0,50 resulta em 25.000,0 L/ha', () => {
    const res = calculateSprayVolumeTrvPure(50000, 0.50);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_calda_l_ha, 25000.0);
  });

  test('6. Rejeição Numérica: TRV zero ou negativo é inválido', () => {
    assert.equal(calculateSprayVolumeTrvPure(0, 0.033).isValid, false);
    assert.equal(calculateSprayVolumeTrvPure(-100, 0.033).isValid, false);
  });

  test('7. Rejeição Numérica: k zero ou negativo é inválido', () => {
    assert.equal(calculateSprayVolumeTrvPure(6125, 0).isValid, false);
    assert.equal(calculateSprayVolumeTrvPure(6125, -0.01).isValid, false);
  });

  test('8. Rejeição Numérica: k abaixo de 0,01 ou acima de 0,50 é inválido', () => {
    assert.equal(calculateSprayVolumeTrvPure(6125, 0.009).isValid, false);
    assert.equal(calculateSprayVolumeTrvPure(6125, 0.501).isValid, false);
  });

  test('9. Rejeição Numérica: TRV acima de 50.000 é inválido', () => {
    assert.equal(calculateSprayVolumeTrvPure(50001, 0.033).isValid, false);
  });

  test('10. Rejeição Numérica: Proteção contra NaN e Infinity', () => {
    assert.equal(calculateSprayVolumeTrvPure(NaN, 0.033).isValid, false);
    assert.equal(calculateSprayVolumeTrvPure(6125, NaN).isValid, false);
    assert.equal(calculateSprayVolumeTrvPure(Infinity, 0.033).isValid, false);
    assert.equal(calculateSprayVolumeTrvPure(6125, Infinity).isValid, false);
  });

  // =========================================================================
  // 2. CONFIGURAÇÃO DECLARATIVA E VALIDAÇÃO DE ENTRADAS
  // =========================================================================

  test('11. Definição Declarativa: Identificador oficial, versão e categoria', () => {
    assert.equal(volumeCaldaTrvCalculatorConfig.id, 'calc_volume_calda_trv');
    assert.equal(volumeCaldaTrvCalculatorConfig.version, '1.0.0');
    assert.equal(volumeCaldaTrvCalculatorConfig.category, 'Calibração');
    assert.equal(volumeCaldaTrvCalculatorConfig.title, 'Volume de Calda Adequado por TRV');
    assert.equal(volumeCaldaTrvCalculatorConfig.fields.length, 2);
    assert.equal(volumeCaldaTrvCalculatorConfig.results.length, 1);
  });

  test('12. Campos Declarados: Sem atalhos (presets vazios) e vazios por defeito', () => {
    const trvField = volumeCaldaTrvCalculatorConfig.fields.find(f => f.id === 'volumeCopaTrv');
    const kField = volumeCaldaTrvCalculatorConfig.fields.find(f => f.id === 'coeficienteVolumeCalda');

    assert.ok(trvField);
    assert.ok(kField);

    assert.deepEqual(trvField.presets, []);
    assert.deepEqual(kField.presets, []);
    assert.equal(trvField.defaultValue, undefined);
    assert.equal(kField.defaultValue, undefined);

    assert.equal(trvField.maxDecimals, 2);
    assert.equal(kField.maxDecimals, 3);
  });

  test('13. Validação: Campos vazios retornam erros bloqueantes específicos', () => {
    const val = volumeCaldaTrvCalculatorConfig.validate({});
    assert.equal(val.isValid, false);
    assert.equal(val.errors.volumeCopaTrv, 'Introduza o volume de copa (TRV).');
    assert.equal(val.errors.coeficienteVolumeCalda, 'Introduza o coeficiente de volume de calda (k).');
  });

  test('14. Validação: TRV fora dos limites emite erros bloqueantes', () => {
    const zeroTrv = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 0, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.033, unit: 'L/m³' }
    });
    assert.equal(zeroTrv.isValid, false);
    assert.equal(zeroTrv.errors.volumeCopaTrv, 'O volume de copa deve ser superior a zero.');

    const maxTrv = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 50001, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.033, unit: 'L/m³' }
    });
    assert.equal(maxTrv.isValid, false);
    assert.equal(maxTrv.errors.volumeCopaTrv, 'O volume de copa máximo é 50 000 m³ TRV/ha.');
  });

  test('15. Validação: Coeficiente k fora dos limites emite erros bloqueantes', () => {
    const zeroK = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 6125, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0, unit: 'L/m³' }
    });
    assert.equal(zeroK.isValid, false);
    assert.equal(zeroK.errors.coeficienteVolumeCalda, 'O coeficiente deve ser superior a zero.');

    const lowK = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 6125, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.005, unit: 'L/m³' }
    });
    assert.equal(lowK.isValid, false);
    assert.equal(lowK.errors.coeficienteVolumeCalda, 'O coeficiente mínimo é 0,01 L/m³.');

    const highK = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 6125, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.55, unit: 'L/m³' }
    });
    assert.equal(highK.isValid, false);
    assert.equal(highK.errors.coeficienteVolumeCalda, 'O coeficiente máximo é 0,50 L/m³.');
  });

  test('16. Avisos Não Bloqueantes: TRV baixo (< 500) e elevado (> 30.000)', () => {
    const low = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 400, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.033, unit: 'L/m³' }
    });
    assert.equal(low.isValid, true);
    assert.equal(low.warnings.volumeCopaTrv, 'Volume de copa muito baixo. Verifique se o valor está correto e se o método TRV é adequado à cultura.');

    const high = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 35000, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.033, unit: 'L/m³' }
    });
    assert.equal(high.isValid, true);
    assert.equal(high.warnings.volumeCopaTrv, 'Volume de copa muito elevado. Verifique se o valor está correto e se o método TRV é adequado à cultura.');
  });

  test('17. Avisos Condicionais de k: Baixo (0,01 <= k < 0,02) e Elevado (0,20 < k <= 0,50)', () => {
    const lowK = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 6125, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.015, unit: 'L/m³' }
    });
    assert.equal(lowK.isValid, true);
    assert.equal(lowK.warnings.coeficienteVolumeCalda, 'Coeficiente muito baixo. Verifique se o valor está correto.');

    const highK = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 6125, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.35, unit: 'L/m³' }
    });
    assert.equal(highK.isValid, true);
    assert.equal(highK.warnings.coeficienteVolumeCalda, 'Coeficiente elevado. Verifique se o valor está correto.');
  });

  test('18. Valor Normal de k (0,033 L/m³): NÃO emite aviso condicional e mantém isValid = true', () => {
    const normalK = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 6125, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.033, unit: 'L/m³' }
    });
    assert.equal(normalK.isValid, true);
    assert.equal(normalK.warnings.coeficienteVolumeCalda, undefined);
  });

  test('19. Nota Técnica Permanente: Texto exato declarado em field.description', () => {
    const kField = volumeCaldaTrvCalculatorConfig.fields.find(f => f.id === 'coeficienteVolumeCalda');
    assert.equal(
      kField.description,
      'O coeficiente deve ser definido com base em calibração real, informações aplicáveis ao equipamento e validação técnica. A aplicação não fornece um valor universal.'
    );
  });

  test('20. Execução de calculate(): Produz volumeCaldaEstimado formatado a 1 casa decimal', () => {
    const out = volumeCaldaTrvCalculatorConfig.calculate({
      volumeCopaTrv: { rawValue: '6125', unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: '0,033', unit: 'L/m³' }
    });
    assert.ok(out.volumeCaldaEstimado);
    assert.equal(out.volumeCaldaEstimado.rawValue, 202.1);
    assert.equal(out.volumeCaldaEstimado.unit, 'L/ha');
    assert.equal(out.volumeCaldaEstimado.canonicalKey, 'spray_volume_rate');
    assert.equal(out.volumeCaldaEstimado.dimension, 'application_rate');
  });

  test('21. Execução de calculate(): Em dados inválidos retorna objeto vazio (sem 0)', () => {
    const out = volumeCaldaTrvCalculatorConfig.calculate({
      volumeCopaTrv: { rawValue: 0, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.033, unit: 'L/m³' }
    });
    assert.deepEqual(out, {});
  });

  // =========================================================================
  // 3. VALIDAÇÕES DO DATERRA KEYPAD (TECLADO TÁCTIL)
  // =========================================================================

  test('22. Teclado DATERRA: Aceita valores válidos de k (0,010, 0,033, 0,500)', () => {
    const kField = volumeCaldaTrvCalculatorConfig.fields.find(f => f.id === 'coeficienteVolumeCalda');
    const rules = {
      required: true,
      min: kField.min,
      max: kField.max,
      minInclusive: kField.minInclusive,
      maxInclusive: kField.maxInclusive,
      allowDecimal: kField.allowDecimal,
      maxDecimals: kField.maxDecimals,
      allowNegative: kField.allowNegative,
      allowExpressions: kField.allowExpressions
    };

    assert.equal(validateKeypadValue(0.01, '0,010', false, rules).isValid, true);
    assert.equal(validateKeypadValue(0.033, '0,033', false, rules).isValid, true);
    assert.equal(validateKeypadValue(0.5, '0,500', false, rules).isValid, true);
  });

  test('23. Teclado DATERRA: Bloqueia valores inválidos de k (0, 0,009, 0,501)', () => {
    const kField = volumeCaldaTrvCalculatorConfig.fields.find(f => f.id === 'coeficienteVolumeCalda');
    const rules = {
      required: true,
      min: kField.min,
      max: kField.max,
      minInclusive: kField.minInclusive,
      maxInclusive: kField.maxInclusive,
      allowDecimal: kField.allowDecimal,
      maxDecimals: kField.maxDecimals,
      allowNegative: kField.allowNegative,
      allowExpressions: kField.allowExpressions
    };

    assert.equal(validateKeypadValue(0, '0', false, rules).isValid, false);
    assert.equal(validateKeypadValue(0.009, '0,009', false, rules).isValid, false);
    assert.equal(validateKeypadValue(0.501, '0,501', false, rules).isValid, false);
  });

  // =========================================================================
  // 4. MICROLEARNING E FICHEIROS DIDÁTICOS (4 FICHEIROS COM 10 SECÇÕES CADA)
  // =========================================================================

  test('24. Microlearning: Os 4 ficheiros Markdown existem e contêm 10 secções cada', () => {
    const files = [
      'src/features/volume-calda-trv/VolumeCaldaTrvFAQGeral.md',
      'src/features/volume-calda-trv/VolumeCaldaTrvFAQTRV.md',
      'src/features/volume-calda-trv/VolumeCaldaTrvFAQCoeficiente.md',
      'src/features/volume-calda-trv/VolumeCaldaTrvFAQResultado.md'
    ];

    files.forEach(file => {
      assert.ok(fs.existsSync(file), `Ficheiro ${file} deve existir`);
      const content = fs.readFileSync(file, 'utf8');
      const count = (content.match(/^##\s/gm) || []).length;
      assert.equal(count, 10, `Ficheiro ${file} deve conter exatamente 10 secções (## )`);
    });
  });

  // =========================================================================
  // 5. INTEGRAÇÃO NO CATÁLOGO, ROTAS E AUSÊNCIA DE TRANSFERÊNCIAS ATIVAS
  // =========================================================================

  test('25. Catálogo de Ferramentas: Cartão registado na categoria Calibração com FlaskConical', () => {
    const toolsViewContent = fs.readFileSync('src/views/ToolsView.tsx', 'utf8');
    assert.ok(toolsViewContent.includes("id: 'calc_volume_calda_trv'"));
    assert.ok(toolsViewContent.includes("name: 'Volume de Calda Adequado por TRV'"));
    assert.ok(toolsViewContent.includes("category: 'Calibração'"));
    assert.ok(toolsViewContent.includes("icon: FlaskConical"));
    assert.ok(toolsViewContent.includes("caminho: '/ferramentas/volume-calda-trv'"));
  });

  test('26. Roteamento: Rota protegida registada em App.tsx e invólucro único', () => {
    const appContent = fs.readFileSync('src/App.tsx', 'utf8');
    assert.ok(appContent.includes('/ferramentas/volume-calda-trv'));
    assert.ok(appContent.includes('VolumeCaldaTrvCalculator'));
    assert.ok(fs.existsSync('src/features/volume-calda-trv/VolumeCaldaTrvCalculator.tsx'));
  });

  test('27. Grandezas Canónicas: spray_volume_coefficient registada no catálogo', () => {
    assert.ok(CANONICAL_VARIABLES.spray_volume_coefficient);
    assert.equal(CANONICAL_VARIABLES.spray_volume_coefficient.dimension, 'volume_per_volume');
    assert.equal(CANONICAL_VARIABLES.spray_volume_coefficient.canonicalUnit, 'L/m³');
  });

  test('28. Sem Transferências Ativas: volumeCaldaTrvCalculatorConfig não define transfers ativos', () => {
    assert.equal(volumeCaldaTrvCalculatorConfig.transfers, undefined);
  });

});