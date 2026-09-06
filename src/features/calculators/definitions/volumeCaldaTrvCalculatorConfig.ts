/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Configuração Declarativa Oficial: Calculadora de Volume de Calda Adequado por TRV
 * Fase 11 - Ferramenta calc_volume_calda_trv
 * 
 * Modelo Aprovado: Q = k × TRV
 * Onde:
 *  - Q = volume de calda estimado, em L/ha
 *  - k = coeficiente de volume de calda, em L/m³
 *  - TRV = volume de copa, em m³ TRV/ha
 */

import type { CalculatorDefinition, ValidationResult } from '../core/types.ts';
import type { StructuredValue } from '../../../types/calculator.ts';

/**
 * Função pura e desacoplada de cálculo do volume de calda por TRV.
 * Garante segurança numérica estrita contra NaN, Infinity, divisão por zero e valores fora dos limites.
 * O coeficiente k é utilizado com a máxima precisão de ponto flutuante sem pré-arredondamento.
 * Apenas o resultado final em L/ha é arredondado a uma casa decimal.
 */
export function calculateSprayVolumeTrvPure(
  volumeCopaTrv: number,
  coeficienteVolumeCalda: number
): {
  volume_calda_l_ha: number;
  isValid: boolean;
} {
  if (
    typeof volumeCopaTrv !== 'number' ||
    typeof coeficienteVolumeCalda !== 'number' ||
    isNaN(volumeCopaTrv) ||
    isNaN(coeficienteVolumeCalda) ||
    !isFinite(volumeCopaTrv) ||
    !isFinite(coeficienteVolumeCalda) ||
    volumeCopaTrv <= 0 ||
    coeficienteVolumeCalda <= 0 ||
    volumeCopaTrv > 50000 ||
    coeficienteVolumeCalda < 0.01 ||
    coeficienteVolumeCalda > 0.5
  ) {
    return {
      volume_calda_l_ha: 0,
      isValid: false
    };
  }

  // Q = k * TRV
  const rawQ = volumeCopaTrv * coeficienteVolumeCalda;

  if (!isFinite(rawQ) || isNaN(rawQ) || rawQ < 0) {
    return {
      volume_calda_l_ha: 0,
      isValid: false
    };
  }

  return {
    volume_calda_l_ha: Math.round(rawQ * 10) / 10,
    isValid: true
  };
}

/**
 * Configuração declarativa oficial da Calculadora de Volume de Calda Adequado por TRV.
 */
export const volumeCaldaTrvCalculatorConfig: CalculatorDefinition = {
  id: 'calc_volume_calda_trv',
  version: '1.0.0',
  title: 'Volume de Calda Adequado por TRV',
  subtitle: 'Estima o volume de calda por hectare com base no Volume de Copa (TRV) e num coeficiente técnico de calibração.',
  category: 'Calibração',
  badgeLabel: 'Tree Row Volume · Calibração',
  generalHelpFile: 'VolumeCaldaTrvFAQGeral.md',
  invalidResultNotice: 'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.',

  fields: [
    // Campo 1 — Volume de Copa (TRV)
    {
      id: 'volumeCopaTrv',
      label: 'Volume de Copa (TRV)',
      canonicalKey: 'tree_row_volume',
      dimension: 'tree_row_volume',
      defaultUnit: 'm³ TRV/ha',
      defaultValue: undefined,
      allowedUnits: ['m³ TRV/ha'],
      presets: [],
      required: true,
      min: 0,
      minInclusive: false,
      max: 50000,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      description: 'Volume de vegetação por hectare, expresso em m³ TRV/ha. Pode ser obtido na Calculadora de Volume de Copa (TRV) ou introduzido manualmente após medição e validação técnica.',
      helpFile: 'VolumeCaldaTrvFAQTRV.md'
    },

    // Campo 2 — Coeficiente de Volume de Calda (k)
    {
      id: 'coeficienteVolumeCalda',
      label: 'Coeficiente de Volume de Calda (k)',
      canonicalKey: 'spray_volume_coefficient',
      dimension: 'volume_per_volume',
      defaultUnit: 'L/m³',
      defaultValue: undefined,
      allowedUnits: ['L/m³'],
      presets: [],
      required: true,
      min: 0.01,
      minInclusive: true,
      max: 0.5,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 3,
      allowNegative: false,
      allowExpressions: true,
      description: 'O coeficiente deve ser definido com base em calibração real, informações aplicáveis ao equipamento e validação técnica. A aplicação não fornece um valor universal.',
      helpFile: 'VolumeCaldaTrvFAQCoeficiente.md'
    }
  ],

  results: [
    {
      id: 'volumeCaldaEstimado',
      label: 'Volume de calda estimado',
      canonicalKey: 'spray_volume_rate',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      formatDecimals: 1,
      isPrimary: true,
      helpFile: 'VolumeCaldaTrvFAQResultado.md'
    }
  ],

  validate: (inputs: Record<string, StructuredValue>): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    const rawTrv = inputs['volumeCopaTrv']?.rawValue;
    const rawK = inputs['coeficienteVolumeCalda']?.rawValue;

    const trv = typeof rawTrv === 'string' ? parseFloat(rawTrv.replace(',', '.')) : Number(rawTrv);
    const k = typeof rawK === 'string' ? parseFloat(rawK.replace(',', '.')) : Number(rawK);

    // Validação do Campo 1: Volume de Copa (TRV)
    if (rawTrv === undefined || rawTrv === '' || rawTrv === null) {
      errors['volumeCopaTrv'] = 'Introduza o volume de copa (TRV).';
    } else if (isNaN(trv)) {
      errors['volumeCopaTrv'] = 'Introduza um valor numérico válido.';
    } else if (trv <= 0) {
      errors['volumeCopaTrv'] = 'O volume de copa deve ser superior a zero.';
    } else if (trv > 50000) {
      errors['volumeCopaTrv'] = 'O volume de copa máximo é 50 000 m³ TRV/ha.';
    } else {
      // Avisos não bloqueantes para TRV
      if (trv < 500) {
        warnings['volumeCopaTrv'] = 'Volume de copa muito baixo. Verifique se o valor está correto e se o método TRV é adequado à cultura.';
      } else if (trv > 30000) {
        warnings['volumeCopaTrv'] = 'Volume de copa muito elevado. Verifique se o valor está correto e se o método TRV é adequado à cultura.';
      }
    }

    // Validação do Campo 2: Coeficiente de Volume de Calda (k)
    if (rawK === undefined || rawK === '' || rawK === null) {
      errors['coeficienteVolumeCalda'] = 'Introduza o coeficiente de volume de calda (k).';
    } else if (isNaN(k)) {
      errors['coeficienteVolumeCalda'] = 'Introduza um valor numérico válido.';
    } else if (k <= 0) {
      errors['coeficienteVolumeCalda'] = 'O coeficiente deve ser superior a zero.';
    } else if (k < 0.01) {
      errors['coeficienteVolumeCalda'] = 'O coeficiente mínimo é 0,01 L/m³.';
    } else if (k > 0.50) {
      errors['coeficienteVolumeCalda'] = 'O coeficiente máximo é 0,50 L/m³.';
    } else {
      // Avisos condicionais não bloqueantes para k (apenas se atípico)
      if (k >= 0.01 && k < 0.02) {
        warnings['coeficienteVolumeCalda'] = 'volumeCaldaTrv.assistance.warnings.lowCoefficient';
      } else if (k > 0.20 && k <= 0.50) {
        warnings['coeficienteVolumeCalda'] = 'volumeCaldaTrv.assistance.warnings.highCoefficient';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  },

  calculate: (inputs: Record<string, StructuredValue>): Record<string, StructuredValue> => {
    const rawTrv = inputs['volumeCopaTrv']?.rawValue;
    const rawK = inputs['coeficienteVolumeCalda']?.rawValue;

    const trv = typeof rawTrv === 'string' ? parseFloat(rawTrv.replace(',', '.')) : Number(rawTrv);
    const k = typeof rawK === 'string' ? parseFloat(rawK.replace(',', '.')) : Number(rawK);

    const res = calculateSprayVolumeTrvPure(trv, k);

    if (!res.isValid) {
      return {};
    }

    return {
      volumeCaldaEstimado: {
        rawValue: res.volume_calda_l_ha,
        unit: 'L/ha',
        normalizedValue: res.volume_calda_l_ha,
        dimension: 'application_rate',
        canonicalKey: 'spray_volume_rate',
        label: 'Volume de calda estimado',
        source: 'calculated_output',
        localId: 'volumeCaldaEstimado',
        calculatorId: 'calc_volume_calda_trv',
        calculatorVersion: '1.0.0'
      }
    };
  }
};