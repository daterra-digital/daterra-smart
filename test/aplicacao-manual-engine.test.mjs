/**
 * Suite de Testes de Regressão e Validação Matemática
 * Ferramenta: Aplicação Manual (Casos A até I e Casos Limite)
 */

import { strict as assert } from 'assert';
import { calculateManualApplication, formatEquivalents } from '../src/features/aplicacao-manual/aplicacaoManualEngine.ts';

console.log('🧪 Iniciando testes de validação matemática da Aplicação Manual...');

// CASO A: Dose líquida por área conhecida
// A=50m², W=1.5L, T=15L, D=1.5 L/ha -> V=300 L/ha, Q=75 mL, X=500 m²
{
  const state = {
    mode: 'dose',
    productState: 'liquido',
    rotuloValue: 1.5,
    rotuloUnit: 'L/ha',
    caldaPrepararL: 15,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 50,
    aguaGastaL: 1.5
  };
  const res = calculateManualApplication(state);
  assert.equal(res.isValid, true);
  assert.equal(Math.round(res.volumeAplicadoLHa), 300);
  assert.equal(Math.round(res.quantidadePFSmall), 75);
  assert.equal(Math.round(res.areaTratadaEstimadaM2), 500);
  assert.equal(res.formattedQ.primaryUnit, 'mL');
  assert.equal(res.formattedQ.primaryValue, '75');
  console.log('✅ Caso A aprovado: Dose Líquida / Área (Q=75 mL, V=300 L/ha, X=500 m²)');
}

// CASO B: Dose líquida por faixa medida
// comprimento=50m, largura=1m, W=1.5L, T=15L, D=1.5 L/ha -> mesmos resultados A
{
  const state = {
    mode: 'dose',
    productState: 'liquido',
    rotuloValue: 1.5,
    rotuloUnit: 'L/ha',
    caldaPrepararL: 15,
    hasEnsaio: true,
    areaMethod: 'faixa_medida',
    faixaComprimentoM: 50,
    faixaLarguraM: 1,
    aguaGastaL: 1.5
  };
  const res = calculateManualApplication(state);
  assert.equal(res.isValid, true);
  assert.equal(Math.round(res.areaEnsaioM2), 50);
  assert.equal(Math.round(res.volumeAplicadoLHa), 300);
  assert.equal(Math.round(res.quantidadePFSmall), 75);
  assert.equal(Math.round(res.areaTratadaEstimadaM2), 500);
  console.log('✅ Caso B aprovado: Dose Líquida / Faixa Medida (A=50 m², Q=75 mL)');
}

// CASO C: Dose sólida
// Mesmos parâmetros de A, D=1.5 kg/ha -> Q=75 g
{
  const state = {
    mode: 'dose',
    productState: 'solido',
    rotuloValue: 1.5,
    rotuloUnit: 'kg/ha',
    caldaPrepararL: 15,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 50,
    aguaGastaL: 1.5
  };
  const res = calculateManualApplication(state);
  assert.equal(res.isValid, true);
  assert.equal(res.isSolid, true);
  assert.equal(Math.round(res.quantidadePFSmall), 75);
  assert.equal(res.formattedQ.primaryUnit, 'g');
  assert.equal(res.formattedQ.primaryValue, '75');
  console.log('✅ Caso C aprovado: Dose Sólida (Q=75 g)');
}

// CASO D: Concentração Jovem sem ensaio
// T=15L, C=150 mL/100 L -> Q=22.5 mL, sem área aproximada
{
  const state = {
    mode: 'concentracao',
    productState: 'liquido',
    plantStage: 'jovem',
    rotuloValue: 150,
    rotuloUnit: 'mL/100 L',
    caldaPrepararL: 15,
    hasEnsaio: false
  };
  const res = calculateManualApplication(state);
  assert.equal(res.isValid, true);
  assert.equal(res.quantidadePFSmall, 22.5);
  assert.equal(res.areaTratadaEstimadaM2, undefined);
  console.log('✅ Caso D aprovado: Concentração Jovem sem ensaio (Q=22.5 mL, sem área)');
}

// CASO E: Concentração Jovem com ensaio
// A=50m², W=2L, T=16L, C=100 mL/100 L -> Q=16 mL, X=400 m², V=400 L/ha
// Sem ensaio Q continua 16 mL.
{
  const stateWithEnsaio = {
    mode: 'concentracao',
    productState: 'liquido',
    plantStage: 'jovem',
    rotuloValue: 100,
    rotuloUnit: 'mL/100 L',
    caldaPrepararL: 16,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 50,
    aguaGastaL: 2
  };
  const resWith = calculateManualApplication(stateWithEnsaio);
  assert.equal(resWith.isValid, true);
  assert.equal(resWith.quantidadePFSmall, 16);
  assert.equal(Math.round(resWith.volumeAplicadoLHa), 400);
  assert.equal(Math.round(resWith.areaTratadaEstimadaM2), 400);

  const stateWithout = { ...stateWithEnsaio, hasEnsaio: false };
  const resWithout = calculateManualApplication(stateWithout);
  assert.equal(resWithout.quantidadePFSmall, 16);
  assert.equal(resWithout.areaTratadaEstimadaM2, undefined);
  console.log('✅ Caso E aprovado: Concentração Jovem com e sem ensaio (Q=16 mL invariante, X=400 m²)');
}

// CASO F: Concentração Adulta com ensaio e R=1000 L/ha
// A=50m², W=2L, T=15L, C=100 mL/100 L, R=1000 L/ha -> V=400 L/ha, Q=37.5 mL, X=375 m², dose eq=1000 mL/ha
{
  const state = {
    mode: 'concentracao',
    productState: 'liquido',
    plantStage: 'adulta',
    rotuloValue: 100,
    rotuloUnit: 'mL/100 L',
    caldaPrepararL: 15,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 50,
    aguaGastaL: 2,
    hasRecVolume: true,
    recVolumeLHa: 1000
  };
  const res = calculateManualApplication(state);
  assert.equal(res.isValid, true);
  assert.equal(Math.round(res.volumeAplicadoLHa), 400);
  assert.equal(res.quantidadePFSmall, 37.5);
  assert.equal(Math.round(res.areaTratadaEstimadaM2), 375);
  assert.equal(res.doseEquivalenteTeorica, 1000); // 1000 mL/ha = 1 L/ha
  assert.equal(res.fatorAjusteRV, 2.5); // 1000 / 400
  console.log('✅ Caso F aprovado: Concentração Adulta (V=400 L/ha, Q=37.5 mL, X=375 m², dose eq=1000 mL/ha)');
}

// CASO G: Concentração Adulta com R = V -> Q igual à diluição direta
{
  const state = {
    mode: 'concentracao',
    productState: 'liquido',
    plantStage: 'adulta',
    rotuloValue: 100,
    rotuloUnit: 'mL/100 L',
    caldaPrepararL: 15,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 50,
    aguaGastaL: 2, // V = 400 L/ha
    hasRecVolume: true,
    recVolumeLHa: 400 // R = V = 400 L/ha
  };
  const res = calculateManualApplication(state);
  // Q = 15 * 100 * 400 / (400 * 100) = 15 mL (exatamente diluição jovem T * C / 100 = 15 * 100 / 100 = 15 mL)
  assert.equal(res.quantidadePFSmall, 15);
  console.log('✅ Caso G aprovado: Adulta com R = V equivale à diluição direta (Q=15 mL)');
}

// CASO H: Equivalência de unidades de input
{
  // 1.5 L/ha vs 1500 mL/ha
  const s1 = { mode: 'dose', productState: 'liquido', rotuloValue: 1.5, rotuloUnit: 'L/ha', caldaPrepararL: 15, hasEnsaio: true, areaMethod: 'area_conhecida', areaConhecidaM2: 50, aguaGastaL: 1.5 };
  const s2 = { ...s1, rotuloValue: 1500, rotuloUnit: 'mL/ha' };
  assert.equal(calculateManualApplication(s1).quantidadePFSmall, calculateManualApplication(s2).quantidadePFSmall);

  // 0.1 L/100 L vs 100 mL/100 L
  const c1 = { mode: 'concentracao', productState: 'liquido', plantStage: 'jovem', rotuloValue: 0.1, rotuloUnit: 'L/100 L', caldaPrepararL: 15, hasEnsaio: false };
  const c2 = { ...c1, rotuloValue: 100, rotuloUnit: 'mL/100 L' };
  assert.equal(calculateManualApplication(c1).quantidadePFSmall, calculateManualApplication(c2).quantidadePFSmall);
  console.log('✅ Caso H aprovado: Equivalência perfeita de unidades (L/ha = 1000 mL/ha, L/100 L = 1000 mL/100 L)');
}

// CASO I: Validação de entradas zero/negativas/inválidas
{
  const invalidStates = [
    { mode: 'dose', caldaPrepararL: 0, rotuloValue: 1, rotuloUnit: 'L/ha' },
    { mode: 'dose', caldaPrepararL: -10, rotuloValue: 1, rotuloUnit: 'L/ha' },
    { mode: 'dose', caldaPrepararL: 10, rotuloValue: 0, rotuloUnit: 'L/ha' },
    { mode: 'dose', caldaPrepararL: 10, rotuloValue: 1, rotuloUnit: 'L/ha', hasEnsaio: true, areaMethod: 'area_conhecida', areaConhecidaM2: 0, aguaGastaL: 1 },
    { mode: 'dose', caldaPrepararL: 10, rotuloValue: 1, rotuloUnit: 'L/ha', hasEnsaio: true, areaMethod: 'area_conhecida', areaConhecidaM2: 50, aguaGastaL: 0 },
    { mode: 'concentracao', plantStage: 'adulta', caldaPrepararL: 10, rotuloValue: 100, rotuloUnit: 'mL/100 L', hasEnsaio: true, areaMethod: 'area_conhecida', areaConhecidaM2: 50, aguaGastaL: 2, recVolumeLHa: -50 }
  ];

  for (const s of invalidStates) {
    const res = calculateManualApplication(s);
    assert.equal(res.isValid, false, `Estado devia ser inválido: ${JSON.stringify(s)}`);
    assert.notEqual(res.error, undefined);
  }
  console.log('✅ Caso I aprovado: Rejeição rigorosa de valores nulos, negativos ou dados incompletos');
}

// FORMATAÇÃO DE EQUIVALENTES (100 mL, 75 mL, 1500 mL, 100 g, 60 g)
{
  const eq100 = formatEquivalents(100, false);
  assert.equal(eq100.primaryValue, '100');
  assert.equal(eq100.primaryUnit, 'mL');
  assert.ok(eq100.secondaryText.includes('0,1 L') && eq100.secondaryText.includes('1 dL'));

  const eq75 = formatEquivalents(75, false);
  assert.equal(eq75.primaryValue, '75');
  assert.ok(eq75.secondaryText.includes('0,075 L') && eq75.secondaryText.includes('0,75 dL'));

  const eq1500 = formatEquivalents(1500, false);
  assert.equal(eq1500.primaryValue, '1,5');
  assert.equal(eq1500.primaryUnit, 'L');
  assert.ok(eq1500.secondaryText.includes('1500 mL') && eq1500.secondaryText.includes('15 dL'));

  const eq100g = formatEquivalents(100, true);
  assert.equal(eq100g.primaryValue, '100');
  assert.equal(eq100g.primaryUnit, 'g');
  assert.ok(eq100g.secondaryText.includes('0,1 kg'));
  assert.equal(eq100g.secondaryText.includes('dL'), false, 'Não deve exibir dL para produtos sólidos');

  const eq60g = formatEquivalents(60, true);
  assert.equal(eq60g.primaryValue, '60');
  assert.equal(eq60g.primaryUnit, 'g');
  assert.ok(eq60g.secondaryText.includes('0,06 kg'));

  console.log('✅ Formatação de equivalentes aprovada (100 mL -> 0,1 L · 1 dL; 1500 mL -> 1,5 L; 100 g -> 0,1 kg; 60 g -> 0,06 kg)');
}

// CONJUNTOS DE VALORES DAS IMAGENS DE REFERÊNCIA
{
  // Imagem 1: 20 L / 60 g / ~300 m²
  const res1 = calculateManualApplication({
    mode: 'dose',
    productState: 'solido',
    rotuloValue: 2,
    rotuloUnit: 'kg/ha',
    caldaPrepararL: 20,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 30,
    aguaGastaL: 2
  });
  assert.equal(res1.isValid, true);
  assert.equal(Math.round(res1.quantidadePFSmall), 60);
  assert.equal(res1.formattedQ.primaryValue, '60');
  assert.equal(res1.formattedQ.primaryUnit, 'g');
  assert.equal(Math.round(res1.areaTratadaEstimadaM2), 300);
  console.log('✅ Conjunto Imagem 1 aprovado: 20 L calda, 60 g produto, ~300 m² área');

  // Imagem 2: 12 L / 12 mL / ~600 m²
  const res2 = calculateManualApplication({
    mode: 'dose',
    productState: 'liquido',
    rotuloValue: 0.2,
    rotuloUnit: 'L/ha',
    caldaPrepararL: 12,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 100,
    aguaGastaL: 2
  });
  assert.equal(res2.isValid, true);
  assert.equal(Math.round(res2.quantidadePFSmall), 12);
  assert.equal(res2.formattedQ.primaryValue, '12');
  assert.equal(res2.formattedQ.primaryUnit, 'mL');
  assert.equal(Math.round(res2.areaTratadaEstimadaM2), 600);
  console.log('✅ Conjunto Imagem 2 aprovado: 12 L calda, 12 mL produto, ~600 m² área');

  // Imagem 3: 16 L / 12,8 g / ~128 m²
  const res3 = calculateManualApplication({
    mode: 'dose',
    productState: 'solido',
    rotuloValue: 1,
    rotuloUnit: 'kg/ha',
    caldaPrepararL: 16,
    hasEnsaio: true,
    areaMethod: 'area_conhecida',
    areaConhecidaM2: 20,
    aguaGastaL: 2.5
  });
  assert.equal(res3.isValid, true);
  assert.equal(res3.formattedQ.primaryValue, '12,8');
  assert.equal(res3.formattedQ.primaryUnit, 'g');
  assert.equal(Math.round(res3.areaTratadaEstimadaM2), 128);
  console.log('✅ Conjunto Imagem 3 aprovado: 16 L calda, 12,8 g produto, ~128 m² área');
}

// TESTE DE HUMANIZAÇÃO DE APRESENTAÇÃO DO HISTÓRICO
{
  const { humanizeManualInputs } = await import('../src/features/aplicacao-manual/services/manualHistoryPresentation.ts');
  const mockInputs = {
    mode: { rawValue: 'dose' },
    productState: { rawValue: 'solido' },
    rotuloValue: { rawValue: 1.5, unit: 'kg/ha' },
    caldaPrepararL: { rawValue: 16 },
    plantStage: { rawValue: 'jovem' },
    hasEnsaio: { rawValue: 'true' },
    areaMethod: { rawValue: 'faixa_medida' },
    faixaComprimentoM: { rawValue: 50 },
    faixaLarguraM: { rawValue: 1 },
    aguaGastaL: { rawValue: 2 },
    recVolumeLHa: { rawValue: 1000 },
    recOrigin: { rawValue: 'predefinido' }
  };
  const humanized = humanizeManualInputs(mockInputs);
  assert.equal(humanized.find(i => i.id === 'mode').displayValue, 'Dose');
  assert.equal(humanized.find(i => i.id === 'productState').displayValue, 'Sólido');
  assert.equal(humanized.find(i => i.id === 'plantStage').displayValue, 'Planta jovem');
  assert.equal(humanized.find(i => i.id === 'hasEnsaio').displayValue, 'Ensaio realizado');
  assert.equal(humanized.find(i => i.id === 'areaMethod').displayValue, 'Faixa medida');
  assert.ok(humanized.find(i => i.id === 'recVolumeLHa').displayValue.includes('Predefinido habitual'));
  console.log('✅ Humanização e tradução do histórico aprovada: sem snake_case nem booleanos crus');
}

console.log('🎉 Todos os testes matemáticos e de apresentação passaram com 100% de sucesso!');
