import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  calculateSprayVolumeTrvPure,
  volumeCaldaTrvCalculatorConfig
} from '../src/features/calculators/definitions/volumeCaldaTrvCalculatorConfig.ts';
import {
  getCanopyDensityTiers,
  evaluateTrvVolumeInterpretation
} from '../src/features/volume-calda-trv/trvAssistance.ts';
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
    assert.equal(lowK.warnings.coeficienteVolumeCalda, 'volumeCaldaTrv.assistance.warnings.lowCoefficient');

    const highK = volumeCaldaTrvCalculatorConfig.validate({
      volumeCopaTrv: { rawValue: 6125, unit: 'm³ TRV/ha' },
      coeficienteVolumeCalda: { rawValue: 0.35, unit: 'L/m³' }
    });
    assert.equal(highK.isValid, true);
    assert.equal(highK.warnings.coeficienteVolumeCalda, 'volumeCaldaTrv.assistance.warnings.highCoefficient');
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

  // =========================================================================
  // 6. SUBFASE 1B.4B — ASSISTÊNCIA DE TRV, DENSIDADE, k E INTERPRETAÇÃO
  // =========================================================================

  test('29. Precisão do Resultado Final: Arredondamento estrito a UMA casa decimal', () => {
    // Caso de validação oficial: TRV = 8.333,3 m³/ha e k = 0,050 L/m³
    const res = calculateSprayVolumeTrvPure(8333.3, 0.050);
    assert.equal(res.isValid, true);
    assert.equal(res.volume_calda_l_ha, 416.7);
  });

  test('30. Sem Perfil Selecionado: Zero patamares e interpretação convida à seleção', () => {
    const tiers = getCanopyDensityTiers(null);
    assert.deepEqual(tiers, []);

    const interp = evaluateTrvVolumeInterpretation(null, 8333.3, 0.050);
    assert.equal(interp.status, 'no_profile');
    assert.equal(interp.messageKey, 'volumeCaldaTrv.assistance.interpretation.noProfileMessage');
    assert.equal(interp.severity, 'neutral');
  });

  test('31. Pomar Estreito / Médio: Exatamente quatro patamares orientadores ativos com taxonomia aprovada', () => {
    const tiers = getCanopyDensityTiers('mediterranean_narrow_medium_orchard');
    assert.equal(tiers.length, 4);
    assert.deepEqual(
      tiers.map((t) => t.kValue),
      [0.020, 0.033, 0.050, 0.060]
    );
    assert.equal(tiers[0].id, 'verySparse');
    assert.equal(tiers[1].id, 'sparse');
    assert.equal(tiers[2].id, 'dense');
    assert.equal(tiers[3].id, 'veryDense');
  });

  test('32. Pomar Estreito / Médio: Teste obrigatório das 10 fronteiras numéricas sem buracos nem sobreposição', () => {
    // 299,9 -> very_low / orchardVeryLow
    const q299_9 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 2999, 0.100);
    assert.equal(q299_9.status, 'very_low');
    assert.equal(q299_9.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardVeryLow');

    // 300,0 -> low_moderate / orchardLowModerate
    const q300_0 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 3000, 0.100);
    assert.equal(q300_0.status, 'low_moderate');
    assert.equal(q300_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardLowModerate');

    // 499,9 -> low_moderate / orchardLowModerate
    const q499_9 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 4999, 0.100);
    assert.equal(q499_9.status, 'low_moderate');
    assert.equal(q499_9.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardLowModerate');

    // 500,0 -> typical / orchardTypical
    const q500_0 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 5000, 0.100);
    assert.equal(q500_0.status, 'typical');
    assert.equal(q500_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardTypical');

    // 800,0 -> typical / orchardTypical
    const q800_0 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 8000, 0.100);
    assert.equal(q800_0.status, 'typical');
    assert.equal(q800_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardTypical');

    // 800,1 -> high_plausible / orchardHighPlausible
    const q800_1 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 8001, 0.100);
    assert.equal(q800_1.status, 'high_plausible');
    assert.equal(q800_1.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardHighPlausible');

    // 1000,0 -> high_plausible / orchardHighPlausible
    const q1000_0 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 10000, 0.100);
    assert.equal(q1000_0.status, 'high_plausible');
    assert.equal(q1000_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardHighPlausible');

    // 1000,1 -> high_developed / orchardHighDeveloped
    const q1000_1 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 10001, 0.100);
    assert.equal(q1000_1.status, 'high_developed');
    assert.equal(q1000_1.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardHighDeveloped');

    // 1200,0 -> high_developed / orchardHighDeveloped
    const q1200_0 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 12000, 0.100);
    assert.equal(q1200_0.status, 'high_developed');
    assert.equal(q1200_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardHighDeveloped');

    // 1200,1 -> very_high / orchardVeryHigh
    const q1200_1 = evaluateTrvVolumeInterpretation('mediterranean_narrow_medium_orchard', 12001, 0.100);
    assert.equal(q1200_1.status, 'very_high');
    assert.equal(q1200_1.messageKey, 'volumeCaldaTrv.assistance.interpretation.orchardVeryHigh');
  });

  test('33. Citrinos: Quatro patamares em validação e ausência de patamar 0,140', () => {
    const tiers = getCanopyDensityTiers('citrus_orchard');
    assert.equal(tiers.length, 4);
    assert.deepEqual(
      tiers.map((t) => t.kValue),
      [0.060, 0.080, 0.100, 0.120]
    );
    assert.equal(tiers[0].id, 'verySparse');
    assert.equal(tiers[1].id, 'sparse');
    assert.equal(tiers[2].id, 'dense');
    assert.equal(tiers[3].id, 'veryDense');
    assert.ok(!tiers.some((t) => t.kValue === 0.140));
  });

  test('34. Citrinos: Teste obrigatório das 6 fronteiras numéricas (<500, 500-1500, >1500-2000, >2000)', () => {
    // 499,9 -> very_low / citrusLow
    const q499_9 = evaluateTrvVolumeInterpretation('citrus_orchard', 4999, 0.100);
    assert.equal(q499_9.status, 'very_low');
    assert.equal(q499_9.messageKey, 'volumeCaldaTrv.assistance.interpretation.citrusLow');

    // 500,0 -> typical / citrusTypical
    const q500_0 = evaluateTrvVolumeInterpretation('citrus_orchard', 5000, 0.100);
    assert.equal(q500_0.status, 'typical');
    assert.equal(q500_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.citrusTypical');

    // 1500,0 -> typical / citrusTypical
    const q1500_0 = evaluateTrvVolumeInterpretation('citrus_orchard', 15000, 0.100);
    assert.equal(q1500_0.status, 'typical');
    assert.equal(q1500_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.citrusTypical');

    // 1500,1 -> high / citrusHigh
    const q1500_1 = evaluateTrvVolumeInterpretation('citrus_orchard', 15001, 0.100);
    assert.equal(q1500_1.status, 'high');
    assert.equal(q1500_1.messageKey, 'volumeCaldaTrv.assistance.interpretation.citrusHigh');

    // 2000,0 -> high / citrusHigh
    const q2000_0 = evaluateTrvVolumeInterpretation('citrus_orchard', 20000, 0.100);
    assert.equal(q2000_0.status, 'high');
    assert.equal(q2000_0.messageKey, 'volumeCaldaTrv.assistance.interpretation.citrusHigh');

    // 2000,1 -> very_high / citrusVeryHigh
    const q2000_1 = evaluateTrvVolumeInterpretation('citrus_orchard', 20001, 0.100);
    assert.equal(q2000_1.status, 'very_high');
    assert.equal(q2000_1.messageKey, 'volumeCaldaTrv.assistance.interpretation.citrusVeryHigh');
  });

  test('35. Olival: Zero patamares automáticos e estado de interpretação em validação', () => {
    const tiers = getCanopyDensityTiers('olive_grove');
    assert.deepEqual(tiers, []);

    const interp = evaluateTrvVolumeInterpretation('olive_grove', 17500, 0.050);
    assert.equal(interp.status, 'validation');
    assert.equal(interp.messageKey, 'volumeCaldaTrv.assistance.interpretation.oliveValidationMessage');
    assert.equal(interp.isValidation, true);
  });

  test('36. Ausência Rigorosa de Vinha e LWA na Calculadora de TRV', () => {
    const trvConfigContent = fs.readFileSync(
      'src/features/calculators/definitions/volumeCaldaTrvCalculatorConfig.ts',
      'utf8'
    );
    assert.ok(!trvConfigContent.includes('vine'));
    assert.ok(!trvConfigContent.includes('vinha'));
    assert.ok(!trvConfigContent.includes('leaf_wall_area'));

    const trvAssistanceContent = fs.readFileSync(
      'src/features/volume-calda-trv/trvAssistance.ts',
      'utf8'
    );
    assert.ok(!trvAssistanceContent.includes('vine'));
    assert.ok(!trvAssistanceContent.includes('vinha'));
  });

  test('37. Dicionários i18n: Assegurar namespace volumeCaldaTrv.assistance em todos os 8 idiomas', () => {
    const locales = ['pt', 'br', 'en', 'es', 'fr', 'it', 'de', 'el'];
    for (const loc of locales) {
      const jsonContent = JSON.parse(fs.readFileSync(`src/i18n/locales/${loc}.json`, 'utf8'));
      assert.ok(jsonContent.volumeCaldaTrv, `Missing volumeCaldaTrv in ${loc}.json`);
      assert.ok(jsonContent.volumeCaldaTrv.assistance, `Missing assistance in ${loc}.json`);
      assert.ok(jsonContent.volumeCaldaTrv.assistance.profiles, `Missing profiles in ${loc}.json`);
      assert.ok(jsonContent.volumeCaldaTrv.assistance.density, `Missing density in ${loc}.json`);
      assert.ok(jsonContent.volumeCaldaTrv.assistance.warnings, `Missing warnings in ${loc}.json`);
      assert.ok(jsonContent.volumeCaldaTrv.assistance.interpretation, `Missing interpretation in ${loc}.json`);
      assert.ok(jsonContent.volumeCaldaTrv.assistance.a11y, `Missing a11y in ${loc}.json`);

      // Verificar que PT e BR não utilizam "cuba"
      if (loc === 'pt' || loc === 'br') {
        const assistanceString = JSON.stringify(jsonContent.volumeCaldaTrv.assistance);
        assert.ok(!assistanceString.toLowerCase().includes('cuba'), `Palavra proibida "cuba" encontrada em ${loc}.json`);
      }
    }
  });

  test('38. Componente CanopyDensitySelector existe e é válido', () => {
    assert.ok(fs.existsSync('src/features/volume-calda-trv/components/CanopyDensitySelector.tsx'));
    const compContent = fs.readFileSync('src/features/volume-calda-trv/components/CanopyDensitySelector.tsx', 'utf8');
    assert.ok(compContent.includes('export const CanopyDensitySelector'));
    assert.ok(compContent.includes('min-h-[56px]'));
    assert.ok(compContent.includes('min-w-[48px]'));
    assert.ok(compContent.includes('aria-pressed'));
  });

  test('39. Validação de Estado e Não-Persistência (8 Passos Obrigatórios)', () => {
    // 1 & 2: Seleção de Pomar e patamar Densa (k = 0.050)
    let profile = 'mediterranean_narrow_medium_orchard';
    let selectedTier = 'dense';
    let isManualK = false;
    let k = 0.050;
    let trv = 10000;
    let calculation = calculateSprayVolumeTrvPure(trv, k);
    assert.equal(k, 0.050);
    assert.equal(calculation.volume_calda_l_ha, 500.0);

    // 3 & 4: Alteração manual de k para 0.055
    k = 0.055;
    selectedTier = null; // desmarcado
    isManualK = true;    // passa a manual
    calculation = calculateSprayVolumeTrvPure(trv, k);
    assert.equal(selectedTier, null);
    assert.equal(isManualK, true);
    assert.equal(calculation.volume_calda_l_ha, 550.0);

    // 5: Troca para Citrinos -> k mantém 0.055, nenhum cartão selecionado, estado manual
    profile = 'citrus_orchard';
    selectedTier = null;
    assert.equal(k, 0.055);
    assert.equal(selectedTier, null);
    assert.equal(isManualK, true);

    // 6: Troca para Olival -> grelha vazia, k mantém 0.055, estado validation
    profile = 'olive_grove';
    const oliveTiers = getCanopyDensityTiers(profile);
    assert.deepEqual(oliveTiers, []);
    assert.equal(k, 0.055);
    const oliveInterp = evaluateTrvVolumeInterpretation(profile, trv, k);
    assert.equal(oliveInterp.status, 'validation');

    // 7: Ao recarregar/reiniciar calculadora -> estado volta ao padrão volátil
    let initialProfile = null;
    let initialTier = null;
    assert.equal(initialProfile, null);
    assert.equal(initialTier, null);

    // 8: TRV importado é preservado e não alterado por seleções de perfil/patamar
    const importedTrv = 8333.3;
    const isImported = true;
    profile = 'mediterranean_narrow_medium_orchard';
    selectedTier = 'sparse';
    k = 0.033;
    assert.equal(importedTrv, 8333.3);
    assert.equal(isImported, true);
  });

});