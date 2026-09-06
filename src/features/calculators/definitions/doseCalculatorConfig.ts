/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Configuração Declarativa Oficial: Calculadora de Dose por Hectare
 * ID: calc_dose | Categoria: PULVERIZAÇÃO
 * 
 * Atualizações de Rigor:
 * - Atalhos reduzidos para exatamente 4 por campo sem overflow horizontal
 * - Mapeamento explícito de metadados de unidades (ProductMeasure: liquid vs solid)
 * - Correção da unidade auxiliar: g para produto sólido (kg) e mL para produto líquido (L)
 * - Formatação dinâmica inteligente mantida (< 1 L/kg e >= 1 L/kg)
 */

import type { CalculatorDefinition, UnitMetadataItem } from '../core/types.ts';
import type { StructuredValue } from '../../../types/calculator.ts';

// ==========================================
// 1. METADADOS EXPLÍCITOS DE UNIDADES DE PRODUTO
// ==========================================

export const DOSE_UNIT_METADATA: Record<string, UnitMetadataItem> = {
  'L/ha': {
    productMeasure: 'liquid',
    majorUnit: 'L',
    minorUnit: 'mL',
    conversionFactor: 1000
  },
  'kg/ha': {
    productMeasure: 'solid',
    majorUnit: 'kg',
    minorUnit: 'g',
    conversionFactor: 1000
  }
};

// ==========================================
// 2. MOTOR MATEMÁTICO PURO (EXTRAÇÃO EXATA)
// ==========================================

export interface PureDoseCalculationResult {
  quantidade_pf: number;
  unit_pf: string;
  primaryValue: number;
  primaryUnit: string;
  subValue: number;
  subUnit: string;
  area_tratada_ha: number;
  isSolid: boolean;
  smart: {
    mainText: string;
    subText: string;
    rawSmall: number;
    smallUnit: string;
    rawLarge: number;
    largeUnit: string;
    isLargePrimary: boolean;
  };
}

/**
 * Função pura de cálculo matemático da Dose por Hectare.
 * Determina rigorosamente a família de unidade (líquido vs sólido) através de DOSE_UNIT_METADATA.
 */
export function calculateDosePure(
  volPrepararDose: number,
  doseValue: number,
  doseUnit: string,
  volCalda: number
): PureDoseCalculationResult {
  const metadata: UnitMetadataItem = DOSE_UNIT_METADATA[doseUnit] || {
    productMeasure: doseUnit.includes('kg') ? 'solid' : 'liquid',
    majorUnit: doseUnit.includes('kg') ? 'kg' : 'L',
    minorUnit: doseUnit.includes('kg') ? 'g' : 'mL',
    conversionFactor: 1000
  };

  const isSolid = metadata.productMeasure === 'solid';
  const smallUnit = metadata.minorUnit; // 'g' ou 'mL'
  const largeUnit = metadata.majorUnit; // 'kg' ou 'L'
  const factor = metadata.conversionFactor || 1000;

  let rawDose = doseValue;
  if (doseUnit === 'L/ha' || doseUnit === 'kg/ha') {
    rawDose = doseValue * factor;
  }

  let resultInSmall = 0;
  if (volCalda > 0) {
    resultInSmall = (volPrepararDose * rawDose) / volCalda;
  }

  const areaTratada = volCalda > 0 ? volPrepararDose / volCalda : 0;

  // Formatação Inteligente com base no limiar de 1 L ou 1 kg
  const rawSmall = resultInSmall;
  const rawLarge = resultInSmall / factor;
  const isLargePrimary = rawSmall >= factor;

  const formattedLarge = rawLarge.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  }) + ' ' + largeUnit;

  const formattedSmall = rawSmall.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false
  }) + ' ' + smallUnit;

  const smart = isLargePrimary
    ? {
        mainText: formattedLarge,
        subText: formattedSmall,
        rawSmall,
        smallUnit,
        rawLarge,
        largeUnit,
        isLargePrimary: true
      }
    : {
        mainText: formattedSmall,
        subText: formattedLarge,
        rawSmall,
        smallUnit,
        rawLarge,
        largeUnit,
        isLargePrimary: false
      };

  const primaryValue = isLargePrimary ? rawLarge : rawSmall;
  const primaryUnit = isLargePrimary ? largeUnit : smallUnit;
  const subValue = isLargePrimary ? rawSmall : rawLarge;
  const subUnit = isLargePrimary ? smallUnit : largeUnit;

  return {
    quantidade_pf: Number(resultInSmall.toFixed(2)),
    unit_pf: smallUnit,
    primaryValue,
    primaryUnit,
    subValue,
    subUnit,
    area_tratada_ha: Number(areaTratada.toFixed(2)),
    isSolid,
    smart
  };
}

// ==========================================
// 3. CONFIGURAÇÃO DECLARATIVA DA CALCULADORA
// ==========================================

export const doseCalculatorConfig: CalculatorDefinition = {
  id: 'calc_dose',
  version: '1.0.0',
  title: 'Calculadora de Dose',
  subtitle: 'Calcule a quantidade total de produto comercial e a área coberta por cada tanque de calda.',
  category: 'PULVERIZAÇÃO',
  badgeLabel: 'Ferramenta Ativa',
  generalHelpFile: 'DoseFAQGeral.md',

  fields: [
    {
      id: 'volPrepararDose',
      canonicalKey: 'tank_volume',
      label: 'Volume a Preparar (L)',
      dimension: 'volume',
      defaultUnit: 'L',
      allowedUnits: ['L'],
      defaultValue: 1000,
      presets: [200, 500, 1000, 1500], // Exatamente 4 atalhos
      helpFile: 'DoseFAQVolumePreparar.md',
      required: true,
      min: 1,
      max: 10000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true
    },
    {
      id: 'doseValue',
      canonicalKey: 'product_dose_rate',
      label: 'Dose Recomendada por ha',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      allowedUnits: ['L/ha', 'kg/ha'],
      unitMetadata: DOSE_UNIT_METADATA,
      /**
       * Mudança entre L/ha e kg/ha representa alteração de formulação líquida para sólida.
       * Sem dados de densidade do produto, a conversão é fisicamente inválida e requer RESET obrigatório.
       */
      onUnitChange: (_oldUnit, _newUnit) => ({
        action: 'reset',
        noticeKey: 'unifiedKeypad.unitChangedValueReset'
      }),
      defaultValue: 2,
      presets: [1, 2, 3, 5], // Exatamente 4 atalhos
      helpFile: 'DoseFAQDoseRecomendada.md',
      required: true,
      min: 0.01,
      max: 1000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 3,
      allowExpressions: true
    },
    {
      id: 'volCalda',
      canonicalKey: 'spray_volume_rate',
      label: 'Volume Aplicado (L/ha)',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      allowedUnits: ['L/ha'],
      defaultValue: 200,
      presets: [100, 200, 300, 400], // Exatamente 4 atalhos
      helpFile: 'DoseFAQVolumeAplicado.md',
      required: true,
      min: 1,
      max: 5000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true
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
      formatDecimals: 2,
      helpFile: 'DoseFAQQuantidadeProduto.md'
    },
    {
      id: 'area_tratada_ha',
      canonicalKey: 'treated_area',
      label: 'Área Tratada por Depósito',
      dimension: 'area',
      defaultUnit: 'ha',
      isPrimary: false,
      formatDecimals: 2,
      helpFile: 'DoseFAQAreaTratada.md'
    }
  ],

  calculate: (inputs: Record<string, StructuredValue>) => {
    const volPreparar = Number(inputs['volPrepararDose']?.rawValue) || 0;
    const dose = Number(inputs['doseValue']?.rawValue) || 0;
    const doseUnit = inputs['doseValue']?.unit || 'L/ha';
    const volCalda = Number(inputs['volCalda']?.rawValue) || 0;

    const res = calculateDosePure(volPreparar, dose, doseUnit, volCalda);
    const isSolid = res.isSolid;

    return {
      quantidade_pf: {
        rawValue: res.primaryValue,
        unit: res.primaryUnit,
        subValue: res.subValue,
        subUnit: res.subUnit,
        normalizedValue: res.primaryValue,
        dimension: isSolid ? 'mass' : 'volume',
        canonicalKey: 'product_commercial_quantity',
        label: 'Quantidade Necessária de Produto',
        source: 'calculated_output',
        localId: 'quantidade_pf',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0'
      },
      area_tratada_ha: {
        rawValue: res.area_tratada_ha,
        unit: 'ha',
        normalizedValue: res.area_tratada_ha,
        dimension: 'area',
        canonicalKey: 'treated_area',
        label: 'Área Tratada por Depósito',
        source: 'calculated_output',
        localId: 'area_tratada_ha',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0'
      }
    };
  }
};
