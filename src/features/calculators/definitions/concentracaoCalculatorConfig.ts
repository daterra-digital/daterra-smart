/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Configuração Declarativa Oficial: Calculadora de Concentração da Calda
 * Identificador: 'calc_concentracao'
 * Fase 6B - Migração do Template Universal e Interoperabilidade Canónica
 */

import type { StructuredValue } from '../../../types/calculator.ts';
import type { CalculatorDefinition, UnitMetadataItem } from '../core/types.ts';

/**
 * Metadados agronómicos de unidades para produtos concentrados
 */
export const CONCENTRACAO_UNIT_METADATA: Record<string, UnitMetadataItem> = {
  'mL/hL': { productMeasure: 'liquid', majorUnit: 'L', minorUnit: 'mL', conversionFactor: 1000 },
  'L/hL': { productMeasure: 'liquid', majorUnit: 'L', minorUnit: 'mL', conversionFactor: 1000 },
  'g/hL': { productMeasure: 'solid', majorUnit: 'kg', minorUnit: 'g', conversionFactor: 1000 },
  'kg/hL': { productMeasure: 'solid', majorUnit: 'kg', minorUnit: 'g', conversionFactor: 1000 },
  '%': { productMeasure: 'liquid', majorUnit: 'L', minorUnit: 'mL', conversionFactor: 1000 }
};

export interface PureConcentrationResult {
  quantidade_pf_small: number;
  primaryValue: number;
  primaryUnit: string;
  subValue: number;
  subUnit: string;
  isSolid: boolean;
  rawConc: number;
}

/**
 * Função Pura de Cálculo Matemático da Concentração da Calda
 * Reproduz rigorosamente a fórmula e equivalência da versão legada de ToolsView.tsx
 */
export function calculateConcentrationPure(
  concValue: number,
  concUnit: string,
  volPreparar: number,
  volRecomendado: number,
  volAplicado: number,
  mode: 'jovem' | 'adulta' | 'planta_jovem' | 'planta_adulta' = 'jovem'
): PureConcentrationResult {
  const isPercent = concUnit === '%';
  const isSolid = ['g/hL', 'kg/hL'].includes(concUnit);
  const isJovem = mode === 'jovem' || mode === 'planta_jovem';

  let rawConc = concValue;
  if (concUnit === 'L/hL' || concUnit === 'kg/hL' || isPercent) {
    rawConc = concValue * 1000;
  }

  let resultInSmall = 0;
  if (isJovem) {
    resultInSmall = (rawConc * volPreparar) / 100;
  } else {
    if (volAplicado > 0) {
      resultInSmall = (volPreparar * rawConc * volRecomendado) / (volAplicado * 100);
    } else {
      resultInSmall = 0;
    }
  }

  const smallUnit = isSolid ? 'g' : 'mL';
  const largeUnit = isSolid ? 'kg' : 'L';

  const rawSmall = resultInSmall;
  const rawLarge = resultInSmall / 1000;
  const isLargePrimary = rawSmall >= 1000;

  if (isLargePrimary) {
    return {
      quantidade_pf_small: Number(resultInSmall.toFixed(2)),
      primaryValue: Number(rawLarge.toFixed(2)),
      primaryUnit: largeUnit,
      subValue: Number(rawSmall.toFixed(2)),
      subUnit: smallUnit,
      isSolid,
      rawConc
    };
  } else {
    return {
      quantidade_pf_small: Number(resultInSmall.toFixed(2)),
      primaryValue: Number(rawSmall.toFixed(2)),
      primaryUnit: smallUnit,
      subValue: Number(rawLarge.toFixed(2)),
      subUnit: largeUnit,
      isSolid,
      rawConc
    };
  }
}

/**
 * Definição Declarativa da Calculadora de Concentração da Calda
 */
export const concentracaoCalculatorConfig: CalculatorDefinition = {
  id: 'calc_concentracao',
  version: '1.0.0',
  title: 'Calculadora de Concentração da Calda',
  subtitle: 'Calcule a quantidade exata de pesticida a diluir por depósito para Planta Jovem ou Copa Adulta.',
  category: 'PULVERIZAÇÃO',
  badgeLabel: 'Ferramenta Ativa',
  generalHelpFile: 'ConcentracaoFAQGeral.md',

  // Modos de Operação Vegetativa
  defaultModeId: 'jovem',
  modes: [
    {
      id: 'jovem',
      label: 'Planta Jovem',
      icon: 'sprout',
      description: 'Calcula a calda em função do volume a preparar e da concentração recomendada no rótulo.',
      fieldIds: ['concValue', 'volPrepararConc']
    },
    {
      id: 'adulta',
      label: 'Planta Adulta',
      icon: 'trees',
      description: 'Ajusta a calda proporcionalmente à relação entre o volume recomendado e o volume real aplicado.',
      fieldIds: ['volPrepararConc', 'concValue', 'volRecomendado', 'volAplicado']
    }
  ],

  fields: [
    // 1. Volume a Preparar
    {
      id: 'volPrepararConc',
      canonicalKey: 'tank_volume',
      label: 'Volume a Preparar (L)',
      dimension: 'volume',
      defaultUnit: 'L',
      allowedUnits: ['L'],
      defaultValue: 400,
      presets: [200, 400, 600, 1000], // Exatamente 4 atalhos
      min: 1,
      max: 10000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      step: 10,
      helpFile: 'ConcentracaoFAQVolumePreparar.md',
      required: true,
      description: 'Capacidade útil ou volume de calda que deseja preparar na cuba do pulverizador.'
    },

    // 2. Concentração do PF
    {
      id: 'concValue',
      canonicalKey: 'concentration',
      label: 'Concentração do PF',
      dimension: 'concentration',
      defaultUnit: 'mL/hL',
      allowedUnits: ['mL/hL', 'g/hL', '%', 'L/hL', 'kg/hL'],
      defaultValue: 100,
      presets: [50, 100, 200, 400], // Exatamente 4 atalhos
      min: 0.01,
      max: 5000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 3,
      allowExpressions: true,
      step: 1,
      helpFile: 'ConcentracaoFAQConcentracao.md',
      required: true,
      description: 'Concentração homologada indicada no rótulo do produto fitossanitário para a cultura-alvo.',
      unitMetadata: CONCENTRACAO_UNIT_METADATA
    },

    // 3. Volume Recomendado (Modo Adulta)
    {
      id: 'volRecomendado',
      canonicalKey: 'reference_spray_volume_rate',
      label: 'Volume Recomendado (L/ha)',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      allowedUnits: ['L/ha'],
      defaultValue: 1000,
      presets: [500, 800, 1000, 1200], // Exatamente 4 atalhos
      min: 1,
      max: 5000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      step: 50,
      helpFile: 'ConcentracaoFAQVolumeRecomendado.md',
      required: false,
      description: 'Volume de referência para o qual a concentração de rótulo foi definida (normalmente 1.000 L/ha).'
    },

    // 4. Volume Real Aplicado (Modo Adulta)
    {
      id: 'volAplicado',
      canonicalKey: 'spray_volume_rate',
      label: 'Volume Real Aplicado (L/ha)',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      allowedUnits: ['L/ha'],
      defaultValue: 400,
      presets: [200, 300, 400, 500], // Exatamente 4 atalhos
      min: 1,
      max: 5000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      step: 10,
      helpFile: 'ConcentracaoFAQVolumeAplicado.md',
      required: false,
      description: 'Volume de calda efetivamente debitado pelo pulverizador no terreno por hectare.'
    }
  ],

  results: [
    {
      id: 'quantidade_pf',
      canonicalKey: 'product_commercial_quantity',
      label: 'Quantidade necessária de produto',
      dimension: 'volume',
      defaultUnit: 'L',
      isPrimary: true,
      subUnit: 'mL',
      formatDecimals: 2,
      helpFile: 'ConcentracaoFAQQuantidadeProdutoJovem.md',
      helpFileByMode: {
        jovem: 'ConcentracaoFAQQuantidadeProdutoJovem.md',
        planta_jovem: 'ConcentracaoFAQQuantidadeProdutoJovem.md',
        adulta: 'ConcentracaoFAQQuantidadeProdutoAdulta.md',
        planta_adulta: 'ConcentracaoFAQQuantidadeProdutoAdulta.md'
      }
    }
  ],

  calculate: (inputs: Record<string, StructuredValue>): Record<string, StructuredValue> => {
    const volPrep = Number(inputs['volPrepararConc']?.rawValue) || 0;
    const conc = Number(inputs['concValue']?.rawValue) || 0;
    const concUnit = inputs['concValue']?.unit || 'mL/hL';
    const volRec = Number(inputs['volRecomendado']?.rawValue) || 0;
    const volApl = Number(inputs['volAplicado']?.rawValue) || 0;
    const rawMode = String(inputs['mode']?.rawValue || 'jovem');
    const mode: 'jovem' | 'adulta' = (rawMode === 'adulta' || rawMode === 'planta_adulta') ? 'adulta' : 'jovem';

    const pure = calculateConcentrationPure(conc, concUnit, volPrep, volRec, volApl, mode);

    return {
      quantidade_pf: {
        rawValue: pure.primaryValue,
        unit: pure.primaryUnit,
        subValue: pure.subValue,
        subUnit: pure.subUnit,
        dimension: pure.isSolid ? 'mass' : 'volume',
        canonicalKey: 'product_commercial_quantity',
        label: 'Quantidade Necessária de Produto',
        source: 'calculated_output',
        localId: 'quantidade_pf',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      }
    };
  },

  validate: (inputs: Record<string, StructuredValue>) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    const volPrep = Number(inputs['volPrepararConc']?.rawValue);
    if (volPrep <= 0) {
      errors['volPrepararConc'] = 'O volume a preparar deve ser superior a zero.';
    }

    const conc = Number(inputs['concValue']?.rawValue);
    if (conc <= 0) {
      errors['concValue'] = 'A concentração deve ser superior a zero.';
    }

    const rawMode = String(inputs['mode']?.rawValue || 'jovem');
    const isAdulta = rawMode === 'adulta' || rawMode === 'planta_adulta';
    if (isAdulta) {
      const volApl = Number(inputs['volAplicado']?.rawValue);
      if (volApl <= 0) {
        errors['volAplicado'] = 'O volume aplicado deve ser superior a zero no modo Planta Adulta.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }
};
