/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Configuração Declarativa Oficial: Calculadora Agrupada EPPO (LWA + TRV)
 * 
 * Norma de Referência: EPPO PP 1/239 (Dose expression for plant protection products)
 * Metodologias Integradas:
 *  1. LWA (Leaf Wall Area) — Vinha e culturas em sebe vertical:
 *     LWA (m²/ha) = (altura × 2 × 10.000) / entrelinha
 *     Área da Parcela (ha) = (comprimento × entrelinha × numLinhas) / 10.000
 *     Volume de Calda (L/ha) = LWA × (k_LWA / 10.000)
 * 
 *  2. TRV (Tree Row Volume) — Pomóideas, prunóideas, citrinos e frutos secos:
 *     TRV (m³/ha) = (altura × largura × 10.000) / entrelinha
 *     Volume de Calda (L/ha) = TRV × k_TRV
 * 
 *  3. Dosagem e Calda:
 *     Quantidade por Depósito = (Capacidade × Concentração) / 100
 *     Quantidade por Hectare = (Volume Calda × Concentração) / 100
 *     Depósitos por Hectare = Volume Calda / Capacidade
 */

import type { CalculatorDefinition, ValidationResult } from '../core/types.ts';
import type { StructuredValue } from '../../../types/calculator.ts';

export interface EppoPureInputs {
  mode: 'lwa' | 'trv';
  comprimentoLinha: number;
  numeroLinhas: number;
  distanciaEntrelinhas: number;
  alturaVegetacao: number;
  larguraCopa?: number;
  coeficienteLwa?: number; // L / 10.000 m² LWA
  coeficienteTrv?: number; // L / m³ TRV
  capacidadeDeposito: number; // L
  concProduto: number;
  concUnit: string; // 'mL/hL', 'g/hL', '%', 'L/hL', 'kg/hL'
}

export interface EppoPureResult {
  isValid: boolean;
  areaParcelaHa: number;
  areaParcelaM2: number;
  indiceGeometriaValue: number; // m² LWA/ha ou m³ TRV/ha
  indiceGeometriaUnit: string;
  volCaldaLHa: number; // L/ha
  volCaldaTotalParcela: number; // L
  produtoPorDepositoValue: number; // primário (L ou kg)
  produtoPorDepositoUnit: string;
  produtoPorDepositoSubValue: number; // submétrica (mL ou g)
  produtoPorDepositoSubUnit: string;
  produtoPorHaValue: number; // primário (L/ha ou kg/ha)
  produtoPorHaUnit: string;
  produtoPorHaSubValue: number; // submétrica (mL/ha ou g/ha)
  produtoPorHaSubUnit: string;
  produtoTotalParcelaValue: number;
  produtoTotalParcelaUnit: string;
  depositosPorHa: number;
  depositosTotalParcela: number;
  isSolid: boolean;
}

/**
 * Função pura e desacoplada de cálculo da metodologia EPPO (LWA / TRV).
 * Garante segurança numérica estrita contra NaN, Infinity, divisão por zero e limites biológicos.
 */
export function calculateEppoPure(inputs: EppoPureInputs): EppoPureResult {
  const isLwa = inputs.mode === 'lwa';
  const comp = Number(inputs.comprimentoLinha) || 0;
  const numLinhas = Number(inputs.numeroLinhas) || 0;
  const entrelinha = Number(inputs.distanciaEntrelinhas) || 0;
  const altura = Number(inputs.alturaVegetacao) || 0;
  const largura = Number(inputs.larguraCopa) || 0;
  const kLwa = Number(inputs.coeficienteLwa) || 600;
  const kTrv = Number(inputs.coeficienteTrv) || 0.05;
  const capDep = Number(inputs.capacidadeDeposito) || 400;
  const conc = Number(inputs.concProduto) || 0;
  const concUnit = inputs.concUnit || 'mL/hL';

  const isSolid = concUnit === 'g/hL' || concUnit === 'kg/hL';

  // Validação preliminar de segurança matemática
  if (
    comp <= 0 ||
    numLinhas <= 0 ||
    entrelinha <= 0 ||
    altura <= 0 ||
    capDep <= 0 ||
    conc < 0 ||
    (isLwa && kLwa <= 0) ||
    (!isLwa && (largura <= 0 || kTrv <= 0))
  ) {
    return {
      isValid: false,
      areaParcelaHa: 0,
      areaParcelaM2: 0,
      indiceGeometriaValue: 0,
      indiceGeometriaUnit: isLwa ? 'm² LWA/ha' : 'm³ TRV/ha',
      volCaldaLHa: 0,
      volCaldaTotalParcela: 0,
      produtoPorDepositoValue: 0,
      produtoPorDepositoUnit: isSolid ? 'kg' : 'L',
      produtoPorDepositoSubValue: 0,
      produtoPorDepositoSubUnit: isSolid ? 'g' : 'mL',
      produtoPorHaValue: 0,
      produtoPorHaUnit: isSolid ? 'kg/ha' : 'L/ha',
      produtoPorHaSubValue: 0,
      produtoPorHaSubUnit: isSolid ? 'g/ha' : 'mL/ha',
      produtoTotalParcelaValue: 0,
      produtoTotalParcelaUnit: isSolid ? 'kg' : 'L',
      depositosPorHa: 0,
      depositosTotalParcela: 0,
      isSolid
    };
  }

  // 1. Área da Parcela
  const areaM2 = comp * entrelinha * numLinhas;
  const areaHa = areaM2 / 10000;

  // 2. Geometria da Cultura (LWA ou TRV)
  let indiceGeometria = 0;
  let volCaldaLHa = 0;

  if (isLwa) {
    // LWA = (altura * 2 * 10.000) / entrelinha
    indiceGeometria = (altura * 2 * 10000) / entrelinha;
    // Volume de calda = LWA * (kLwa / 10.000)
    volCaldaLHa = indiceGeometria * (kLwa / 10000);
  } else {
    // TRV = (altura * largura * 10.000) / entrelinha
    indiceGeometria = (altura * largura * 10000) / entrelinha;
    // Volume de calda = TRV * kTrv
    volCaldaLHa = indiceGeometria * kTrv;
  }

  // Volume total da parcela
  const volCaldaTotalParcela = volCaldaLHa * areaHa;

  // 3. Número de depósitos
  const depositosPorHa = volCaldaLHa / capDep;
  const depositosTotalParcela = volCaldaTotalParcela / capDep;

  // 4. Quantidade de Produto (Normalização canónica por 1 hL = 100 L)
  // Fator de escala da concentração para valor por litro:
  let factorPerLiter = 0;
  if (concUnit === 'mL/hL' || concUnit === 'g/hL') {
    factorPerLiter = conc / 100; // mL/L ou g/L
  } else if (concUnit === 'L/hL' || concUnit === 'kg/hL') {
    factorPerLiter = (conc * 1000) / 100; // mL/L ou g/L
  } else if (concUnit === '%') {
    factorPerLiter = (conc * 10) ; // 1% = 10 mL/L ou 10 g/L
  }

  // Quantidade por depósito em unidades base (mL ou g)
  const produtoPorDepositoBase = capDep * factorPerLiter;
  const produtoPorDepositoPrim = produtoPorDepositoBase / 1000; // L ou kg

  // Quantidade por hectare em unidades base (mL/ha ou g/ha)
  const produtoPorHaBase = volCaldaLHa * factorPerLiter;
  const produtoPorHaPrim = produtoPorHaBase / 1000; // L/ha ou kg/ha

  // Quantidade total na parcela
  const produtoTotalParcelaPrim = produtoPorHaPrim * areaHa;

  return {
    isValid: true,
    areaParcelaHa: Math.round(areaHa * 1000) / 1000,
    areaParcelaM2: Math.round(areaM2),
    indiceGeometriaValue: Math.round(indiceGeometria),
    indiceGeometriaUnit: isLwa ? 'm² LWA/ha' : 'm³ TRV/ha',
    volCaldaLHa: Math.round(volCaldaLHa * 10) / 10,
    volCaldaTotalParcela: Math.round(volCaldaTotalParcela * 10) / 10,
    produtoPorDepositoValue: Math.round(produtoPorDepositoPrim * 1000) / 1000,
    produtoPorDepositoUnit: isSolid ? 'kg' : 'L',
    produtoPorDepositoSubValue: Math.round(produtoPorDepositoBase * 10) / 10,
    produtoPorDepositoSubUnit: isSolid ? 'g' : 'mL',
    produtoPorHaValue: Math.round(produtoPorHaPrim * 1000) / 1000,
    produtoPorHaUnit: isSolid ? 'kg/ha' : 'L/ha',
    produtoPorHaSubValue: Math.round(produtoPorHaBase * 10) / 10,
    produtoPorHaSubUnit: isSolid ? 'g/ha' : 'mL/ha',
    produtoTotalParcelaValue: Math.round(produtoTotalParcelaPrim * 1000) / 1000,
    produtoTotalParcelaUnit: isSolid ? 'kg' : 'L',
    depositosPorHa: Math.round(depositosPorHa * 100) / 100,
    depositosTotalParcela: Math.round(depositosTotalParcela * 100) / 100,
    isSolid
  };
}

/**
 * Definição Declarativa da Calculadora Agrupada EPPO (calc_eppo)
 */
export const eppoCalculatorConfig: CalculatorDefinition = {
  id: 'calc_eppo',
  version: '1.0.0',
  title: 'Calculadora EPPO (LWA / TRV)',
  subtitle: 'Calcula o volume de calda e dosagem de produto por depósito e por hectare pela metodologia EPPO PP 1/239.',
  category: 'Pulverização',
  badgeLabel: 'Norma EPPO PP 1/239',
  generalHelpFile: 'EppoFAQGeral.md',
  invalidResultNotice: 'Resultado indisponível. Verifique se todos os campos da parcela e parâmetros foram preenchidos corretamente.',

  defaultModeId: 'lwa',
  modes: [
    {
      id: 'lwa',
      label: 'LWA (Vinha / Sebe)',
      icon: 'sprout',
      description: 'Calcula o volume de calda e produto para vinha e culturas em sebe vertical com base na Área de Parede Foliar (m²/ha).',
      fieldIds: [
        'comprimentoLinha',
        'numeroLinhas',
        'distanciaEntrelinhas',
        'alturaVegetacao',
        'coeficienteLwa',
        'capacidadeDeposito',
        'concProduto'
      ]
    },
    {
      id: 'trv',
      label: 'TRV (Pomar / Frutos)',
      icon: 'trees',
      description: 'Calcula o volume de calda e produto para pomares de fruto seco, pomóideas e citrinos com base no Volume de Copa (m³/ha).',
      fieldIds: [
        'comprimentoLinha',
        'numeroLinhas',
        'distanciaEntrelinhas',
        'alturaVegetacao',
        'larguraCopa',
        'coeficienteTrv',
        'capacidadeDeposito',
        'concProduto'
      ]
    }
  ],

  fields: [
    // 1. Comprimento da Linha
    {
      id: 'comprimentoLinha',
      canonicalKey: 'line_length',
      label: 'Comprimento médio da linha',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 100,
      allowedUnits: ['m'],
      presets: [50, 100, 150, 200],
      required: true,
      min: 1,
      max: 2000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 1,
      allowNegative: false,
      allowExpressions: true,
      step: 10,
      description: 'Comprimento médio das linhas de plantação na parcela a tratar.',
      helpFile: 'EppoFAQComprimento.md'
    },

    // 2. Número de Linhas
    {
      id: 'numeroLinhas',
      canonicalKey: 'row_count',
      label: 'Número de linhas da parcela',
      dimension: 'count',
      defaultUnit: 'unid',
      defaultValue: 10,
      allowedUnits: ['unid'],
      presets: [5, 10, 20, 50],
      required: true,
      min: 1,
      max: 500,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: false,
      maxDecimals: 0,
      allowNegative: false,
      allowExpressions: true,
      step: 1,
      description: 'Número total de linhas de plantação incluídas no tratamento.',
      helpFile: 'EppoFAQNumeroLinhas.md'
    },

    // 3. Distância Entrelinhas
    {
      id: 'distanciaEntrelinhas',
      label: 'Distância entrelinhas',
      canonicalKey: 'row_spacing',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 2.5,
      allowedUnits: ['m'],
      presets: [1.8, 2.2, 2.5, 3.0],
      getDynamicPresets: (values) => {
        // Se estiver no modo TRV ou entrelinha alta, oferece atalhos de pomar
        const larg = Number(values['larguraCopa']);
        if (larg > 0) {
          return [3.5, 4.0, 5.0, 6.0];
        }
        return [1.8, 2.2, 2.5, 3.0];
      },
      required: true,
      min: 0.8,
      max: 12.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Distância entre o centro de duas linhas de plantação adjacentes.',
      helpFile: 'EppoFAQEntrelinha.md'
    },

    // 4. Altura da Vegetação / Copa
    {
      id: 'alturaVegetacao',
      label: 'Altura da vegetação tratada',
      canonicalKey: 'canopy_height',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 1.8,
      allowedUnits: ['m'],
      presets: [1.2, 1.5, 1.8, 2.2],
      required: true,
      min: 0.4,
      max: 8.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Altura vertical efetiva da sebe ou copa foliar tratada.',
      helpFile: 'EppoFAQAltura.md'
    },

    // 5. Largura da Copa (Específico de TRV)
    {
      id: 'larguraCopa',
      label: 'Largura da copa',
      canonicalKey: 'canopy_width',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 1.5,
      allowedUnits: ['m'],
      presets: [1.0, 1.5, 2.0, 2.5],
      required: true,
      min: 0.3,
      max: 6.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Largura média transversal da copa das árvores no pomar.',
      helpFile: 'EppoFAQLargura.md'
    },

    // 6. Coeficiente LWA (Específico de LWA)
    {
      id: 'coeficienteLwa',
      canonicalKey: 'lwa_spray_index',
      label: 'Índice de calda LWA (L / 10.000 m² LWA)',
      dimension: 'application_rate',
      defaultUnit: 'L/10.000m²',
      defaultValue: 600,
      allowedUnits: ['L/10.000m²'],
      presets: [400, 500, 600, 800],
      required: true,
      min: 100,
      max: 2000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 1,
      allowNegative: false,
      allowExpressions: true,
      step: 50,
      description: 'Volume de referência para 10.000 m² de parede foliar segundo a norma EPPO (típico: 500 a 800 L/10.000 m²).',
      helpFile: 'EppoFAQCoeficienteLwa.md'
    },

    // 7. Coeficiente TRV (Específico de TRV)
    {
      id: 'coeficienteTrv',
      canonicalKey: 'trv_coefficient',
      label: 'Coeficiente de calda TRV (k)',
      dimension: 'volume_per_volume',
      defaultUnit: 'L/m³',
      defaultValue: 0.05,
      allowedUnits: ['L/m³'],
      presets: [0.04, 0.05, 0.07, 0.10],
      required: true,
      min: 0.01,
      max: 0.30,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 3,
      allowNegative: false,
      allowExpressions: true,
      step: 0.01,
      description: 'Fator de calda por metro cúbico de copa (pomares normais: 0.04 a 0.06; densos/citrinos: 0.07 a 0.10 L/m³).',
      helpFile: 'EppoFAQCoeficienteTrv.md'
    },

    // 8. Capacidade do Depósito
    {
      id: 'capacidadeDeposito',
      label: 'Capacidade do depósito',
      canonicalKey: 'tank_volume',
      dimension: 'volume',
      defaultUnit: 'L',
      defaultValue: 400,
      allowedUnits: ['L'],
      presets: [200, 400, 600, 1000],
      required: true,
      min: 10,
      max: 10000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 1,
      allowNegative: false,
      allowExpressions: true,
      step: 50,
      description: 'Capacidade útil de calda no depósito do pulverizador.',
      helpFile: 'EppoFAQDeposito.md'
    },

    // 9. Concentração do Produto
    {
      id: 'concProduto',
      label: 'Concentração do Produto no Rótulo',
      canonicalKey: 'concentration',
      dimension: 'concentration',
      defaultUnit: 'mL/hL',
      defaultValue: 100,
      allowedUnits: ['mL/hL', 'g/hL', '%', 'L/hL', 'kg/hL'],
      presets: [50, 100, 200, 400],
      required: true,
      min: 0.01,
      max: 5000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 3,
      allowNegative: false,
      allowExpressions: true,
      step: 10,
      description: 'Concentração homologada no rótulo oficial para cada 100 L de água (1 hL).',
      helpFile: 'EppoFAQConcentracao.md'
    }
  ],

  results: [
    // 1. Volume de Calda Recomendado (Resultado Principal)
    {
      id: 'volCaldaRecomendado',
      canonicalKey: 'spray_volume',
      label: 'Volume de Calda Recomendado EPPO',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      isPrimary: true,
      formatDecimals: 1,
      subUnit: 'L na Parcela',
      helpFile: 'EppoFAQResultadoCalda.md'
    },

    // 2. Índice Geométrico (LWA ou TRV)
    {
      id: 'indiceGeometria',
      canonicalKey: 'geometry_index',
      label: 'Índice de Geometria Foliar',
      dimension: 'area',
      defaultUnit: 'm² LWA/ha',
      isPrimary: false,
      formatDecimals: 0,
      helpFile: 'EppoFAQResultadoGeometria.md'
    },

    // 3. Área da Parcela
    {
      id: 'areaParcela',
      canonicalKey: 'plot_area',
      label: 'Área Calculada da Parcela',
      dimension: 'area',
      defaultUnit: 'ha',
      isPrimary: false,
      formatDecimals: 3,
      subUnit: 'm²',
      helpFile: 'EppoFAQResultadoArea.md'
    },

    // 4. Quantidade de Produto por Depósito
    {
      id: 'produtoPorDeposito',
      canonicalKey: 'product_commercial_quantity',
      label: 'Quantidade de Produto por Depósito',
      dimension: 'volume',
      defaultUnit: 'L',
      isPrimary: false,
      formatDecimals: 2,
      subUnit: 'mL',
      helpFile: 'EppoFAQResultadoProdutoDeposito.md'
    },

    // 5. Quantidade de Produto por Hectare
    {
      id: 'produtoPorHa',
      canonicalKey: 'dose',
      label: 'Quantidade de Produto por Hectare',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      isPrimary: false,
      formatDecimals: 2,
      subUnit: 'mL/ha',
      helpFile: 'EppoFAQResultadoProdutoHa.md'
    },

    // 6. Número de Depósitos por Hectare
    {
      id: 'depositosPorHa',
      canonicalKey: 'tank_count',
      label: 'Número de Depósitos por Hectare',
      dimension: 'count',
      defaultUnit: 'depósitos/ha',
      isPrimary: false,
      formatDecimals: 2,
      helpFile: 'EppoFAQResultadoDepositos.md'
    }
  ],

  calculate: (inputs: Record<string, StructuredValue>): Record<string, StructuredValue> => {
    const rawMode = String(inputs['mode']?.rawValue || 'lwa');
    const mode: 'lwa' | 'trv' = (rawMode === 'trv') ? 'trv' : 'lwa';

    const pure = calculateEppoPure({
      mode,
      comprimentoLinha: Number(inputs['comprimentoLinha']?.rawValue) || 0,
      numeroLinhas: Number(inputs['numeroLinhas']?.rawValue) || 0,
      distanciaEntrelinhas: Number(inputs['distanciaEntrelinhas']?.rawValue) || 0,
      alturaVegetacao: Number(inputs['alturaVegetacao']?.rawValue) || 0,
      larguraCopa: Number(inputs['larguraCopa']?.rawValue) || 0,
      coeficienteLwa: Number(inputs['coeficienteLwa']?.rawValue) || 600,
      coeficienteTrv: Number(inputs['coeficienteTrv']?.rawValue) || 0.05,
      capacidadeDeposito: Number(inputs['capacidadeDeposito']?.rawValue) || 400,
      concProduto: Number(inputs['concProduto']?.rawValue) || 0,
      concUnit: inputs['concProduto']?.unit || 'mL/hL'
    });

    return {
      volCaldaRecomendado: {
        rawValue: pure.volCaldaLHa,
        unit: 'L/ha',
        subValue: pure.volCaldaTotalParcela,
        subUnit: 'L na Parcela',
        dimension: 'application_rate',
        canonicalKey: 'spray_volume',
        label: 'Volume de Calda Recomendado EPPO',
        source: 'calculated_output',
        localId: 'volCaldaRecomendado',
        calculatorId: 'calc_eppo',
        calculatorVersion: '1.0.0'
      },
      indiceGeometria: {
        rawValue: pure.indiceGeometriaValue,
        unit: pure.indiceGeometriaUnit,
        dimension: mode === 'lwa' ? 'area' : 'tree_row_volume',
        canonicalKey: mode === 'lwa' ? 'leaf_wall_area' : 'tree_row_volume',
        label: mode === 'lwa' ? 'Área de Parede Foliar (LWA)' : 'Volume de Copa (TRV)',
        source: 'calculated_output',
        localId: 'indiceGeometria',
        calculatorId: 'calc_eppo',
        calculatorVersion: '1.0.0'
      },
      areaParcela: {
        rawValue: pure.areaParcelaHa,
        unit: 'ha',
        subValue: pure.areaParcelaM2,
        subUnit: 'm²',
        dimension: 'area',
        canonicalKey: 'plot_area',
        label: 'Área Calculada da Parcela',
        source: 'calculated_output',
        localId: 'areaParcela',
        calculatorId: 'calc_eppo',
        calculatorVersion: '1.0.0'
      },
      produtoPorDeposito: {
        rawValue: pure.produtoPorDepositoValue,
        unit: pure.produtoPorDepositoUnit,
        subValue: pure.produtoPorDepositoSubValue,
        subUnit: pure.produtoPorDepositoSubUnit,
        dimension: pure.isSolid ? 'mass' : 'volume',
        canonicalKey: 'product_commercial_quantity',
        label: 'Quantidade de Produto por Depósito',
        source: 'calculated_output',
        localId: 'produtoPorDeposito',
        calculatorId: 'calc_eppo',
        calculatorVersion: '1.0.0'
      },
      produtoPorHa: {
        rawValue: pure.produtoPorHaValue,
        unit: pure.produtoPorHaUnit,
        subValue: pure.produtoPorHaSubValue,
        subUnit: pure.produtoPorHaSubUnit,
        dimension: pure.isSolid ? 'mass' : 'volume',
        canonicalKey: 'dose',
        label: 'Quantidade de Produto por Hectare',
        source: 'calculated_output',
        localId: 'produtoPorHa',
        calculatorId: 'calc_eppo',
        calculatorVersion: '1.0.0'
      },
      depositosPorHa: {
        rawValue: pure.depositosPorHa,
        unit: 'depósitos/ha',
        subValue: pure.depositosTotalParcela,
        subUnit: 'depósitos na parcela',
        dimension: 'count',
        canonicalKey: 'tank_count',
        label: 'Número de Depósitos por Hectare',
        source: 'calculated_output',
        localId: 'depositosPorHa',
        calculatorId: 'calc_eppo',
        calculatorVersion: '1.0.0'
      }
    };
  },

  validate: (inputs: Record<string, StructuredValue>): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    const rawMode = String(inputs['mode']?.rawValue || 'lwa');
    const isLwa = rawMode === 'lwa';

    const comp = Number(inputs['comprimentoLinha']?.rawValue);
    if (!comp || comp <= 0) {
      errors['comprimentoLinha'] = 'O comprimento da linha deve ser superior a zero.';
    } else if (comp > 2000) {
      errors['comprimentoLinha'] = 'Comprimento máximo permitido é 2.000 m.';
    }

    const numLinhas = Number(inputs['numeroLinhas']?.rawValue);
    if (!numLinhas || numLinhas <= 0) {
      errors['numeroLinhas'] = 'O número de linhas deve ser pelo menos 1.';
    }

    const entrelinha = Number(inputs['distanciaEntrelinhas']?.rawValue);
    if (!entrelinha || entrelinha <= 0) {
      errors['distanciaEntrelinhas'] = 'A distância entrelinhas deve ser superior a zero.';
    } else if (entrelinha < 0.8) {
      errors['distanciaEntrelinhas'] = 'Distância entrelinhas mínima é 0,8 m.';
    } else if (entrelinha > 12.0) {
      errors['distanciaEntrelinhas'] = 'Distância entrelinhas máxima é 12,0 m.';
    } else if (isLwa && entrelinha < 1.5) {
      warnings['distanciaEntrelinhas'] = 'Entrelinha muito estreita para vinha em espaldeira. Verifique a medição.';
    } else if (isLwa && entrelinha > 3.5) {
      warnings['distanciaEntrelinhas'] = 'Entrelinha ampla para vinha. Confirme a adequação ao sistema de condução.';
    } else if (!isLwa && entrelinha < 2.5) {
      warnings['distanciaEntrelinhas'] = 'Entrelinha estreita para pomar de fruto. Verifique a medição.';
    }

    const altura = Number(inputs['alturaVegetacao']?.rawValue);
    if (!altura || altura <= 0) {
      errors['alturaVegetacao'] = 'A altura da vegetação deve ser superior a zero.';
    } else if (altura < 0.4) {
      errors['alturaVegetacao'] = 'Altura mínima da vegetação tratada é 0,4 m.';
    } else if (altura > 8.0) {
      errors['alturaVegetacao'] = 'Altura máxima da vegetação tratada é 8,0 m.';
    } else if (isLwa && altura > 3.0) {
      warnings['alturaVegetacao'] = 'Altura de sebe elevada para vinha. Confirme a medição.';
    } else if (!isLwa && altura < 1.0) {
      warnings['alturaVegetacao'] = 'Altura de copa muito baixa para pomar.';
    }

    if (!isLwa) {
      const largura = Number(inputs['larguraCopa']?.rawValue);
      if (!largura || largura <= 0) {
        errors['larguraCopa'] = 'A largura da copa deve ser superior a zero no modo TRV.';
      } else if (largura < 0.3) {
        errors['larguraCopa'] = 'Largura mínima de copa é 0,3 m.';
      } else if (largura > 6.0) {
        errors['larguraCopa'] = 'Largura máxima de copa é 6,0 m.';
      } else if (largura > entrelinha) {
        warnings['larguraCopa'] = 'A largura da copa não deve exceder a distância entrelinhas.';
      }
    }

    if (isLwa) {
      const kLwa = Number(inputs['coeficienteLwa']?.rawValue);
      if (!kLwa || kLwa <= 0) {
        errors['coeficienteLwa'] = 'O índice de calda LWA deve ser superior a zero.';
      } else if (kLwa < 200) {
        warnings['coeficienteLwa'] = 'Índice de calda baixo para LWA. Risco de cobertura insuficiente.';
      } else if (kLwa > 1200) {
        warnings['coeficienteLwa'] = 'Índice de calda elevado para LWA. Risco de escorrimento.';
      }
    } else {
      const kTrv = Number(inputs['coeficienteTrv']?.rawValue);
      if (!kTrv || kTrv <= 0) {
        errors['coeficienteTrv'] = 'O coeficiente k de TRV deve ser superior a zero.';
      } else if (kTrv < 0.03) {
        warnings['coeficienteTrv'] = 'Coeficiente TRV muito baixo. Confirme a densidade da copa.';
      } else if (kTrv > 0.12) {
        warnings['coeficienteTrv'] = 'Coeficiente TRV elevado. Confirme se a cultura exige alto molhamento.';
      }
    }

    const capDep = Number(inputs['capacidadeDeposito']?.rawValue);
    if (!capDep || capDep <= 0) {
      errors['capacidadeDeposito'] = 'A capacidade do depósito deve ser superior a zero.';
    }

    const conc = Number(inputs['concProduto']?.rawValue);
    if (conc < 0) {
      errors['concProduto'] = 'A concentração do produto não pode ser negativa.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }
};
