/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Configuração Declarativa Oficial: Calculadora de Área de Parede Foliar (LWA)
 * Fase 9 - Migração e Normalização da Ferramenta calc_area_parede_foliar
 * 
 * Norma de Referência: EPPO PP 1/239 (Dose expression for plant protection products)
 * Fórmula Oficial: LWA = (h × 2 × 10.000) / r
 * Onde:
 *  - h = Altura da vegetação tratada (m)
 *  - r = Distância entrelinhas (m)
 *  - 2 = Tratamento de ambas as faces da linha de plantação
 *  - 10.000 = Conversão de metros quadrados para hectare (m²/ha)
 */

import type { CalculatorDefinition } from '../core/types.ts';
import type { StructuredValue } from '../../../types/calculator.ts';

/**
 * Função pura e desacoplada de cálculo da Área de Parede Foliar (LWA).
 * Garante segurança numérica contra divisão por zero, NaN, Infinity e valores negativos.
 * Arredonda apenas no final para o inteiro mais próximo.
 */
export function calculateLwaPure(
  alturaVegetacao: number,
  distanciaEntrelinhas: number
): {
  area_parede_foliar: number;
  isValid: boolean;
} {
  if (
    typeof alturaVegetacao !== 'number' ||
    typeof distanciaEntrelinhas !== 'number' ||
    !isFinite(alturaVegetacao) ||
    !isFinite(distanciaEntrelinhas) ||
    alturaVegetacao <= 0 ||
    distanciaEntrelinhas <= 0
  ) {
    return {
      area_parede_foliar: 0,
      isValid: false
    };
  }

  // LWA = (h × 2 × 10.000) / r
  const rawLwa = (alturaVegetacao * 2 * 10000) / distanciaEntrelinhas;

  if (!isFinite(rawLwa) || isNaN(rawLwa) || rawLwa < 0) {
    return {
      area_parede_foliar: 0,
      isValid: false
    };
  }

  return {
    area_parede_foliar: Math.round(rawLwa),
    isValid: true
  };
}

/**
 * Definição Declarativa da Calculadora de Área de Parede Foliar (LWA)
 */
export const areaParedeFoliarCalculatorConfig: CalculatorDefinition = {
  id: 'calc_area_parede_foliar',
  version: '1.0.0',
  title: 'Área de Parede Foliar',
  subtitle: 'Calcula a área vertical de vegetação tratada por hectare (LWA) segundo a norma EPPO PP 1/239.',
  category: 'Calibração',
  badgeLabel: 'Norma EPPO PP 1/239',
  generalHelpFile: 'AreaParedeFoliarFAQGeral.md',
  invalidResultNotice: 'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.',

  fields: [
    {
      id: 'alturaVegetacao',
      label: 'Altura da vegetação tratada (m)',
      canonicalKey: 'canopy_height',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 2.5,
      allowedUnits: ['m'],
      presets: [1.5, 2.5, 3.5, 4.5],
      required: true,
      min: 0.5,
      max: 6.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      helpFile: 'AreaParedeFoliarFAQAltura.md'
    },
    {
      id: 'distanciaEntrelinhas',
      label: 'Distância entrelinhas (m)',
      canonicalKey: 'row_spacing',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 3.0,
      allowedUnits: ['m'],
      presets: [2.0, 3.0, 4.0, 5.0],
      required: true,
      min: 1.0,
      max: 10.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      helpFile: 'AreaParedeFoliarFAQEntrelinha.md'
    }
  ],

  results: [
    {
      id: 'areaParedeFoliar',
      label: 'Área de Parede Foliar',
      canonicalKey: 'leaf_wall_area',
      dimension: 'foliar_wall_area',
      defaultUnit: 'm² LWA/ha',
      formatDecimals: 0,
      isPrimary: true,
      helpFile: 'AreaParedeFoliarFAQResultado.md'
    }
  ],

  validate: (inputs: Record<string, StructuredValue>) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    const rawAlt = inputs['alturaVegetacao']?.rawValue;
    const rawEnt = inputs['distanciaEntrelinhas']?.rawValue;

    const alt = typeof rawAlt === 'string'
      ? parseFloat(rawAlt.replace(',', '.'))
      : Number(rawAlt);

    const ent = typeof rawEnt === 'string'
      ? parseFloat(rawEnt.replace(',', '.'))
      : Number(rawEnt);

    // 1. Validação do Campo: Altura da vegetação tratada (m)
    if (rawAlt === undefined || rawAlt === '' || rawAlt === null) {
      errors['alturaVegetacao'] = 'Introduza a altura da vegetação.';
    } else if (isNaN(alt)) {
      errors['alturaVegetacao'] = 'Introduza um valor numérico válido.';
    } else if (alt <= 0) {
      errors['alturaVegetacao'] = 'A altura deve ser superior a zero.';
    } else if (alt < 0.5) {
      errors['alturaVegetacao'] = 'A altura mínima é 0,5 m.';
    } else if (alt > 6.0) {
      errors['alturaVegetacao'] = 'A altura máxima é 6,0 m.';
    } else {
      // Avisos não bloqueantes de altura
      if (alt >= 0.5 && alt < 1.0) {
        warnings['alturaVegetacao'] = 'Altura muito baixa. Verifique se a medição está correta.';
      } else if (alt > 5.0 && alt <= 6.0) {
        warnings['alturaVegetacao'] = 'Altura elevada. Verifique se a medição está correta.';
      }
    }

    // 2. Validação do Campo: Distância entrelinhas (m)
    if (rawEnt === undefined || rawEnt === '' || rawEnt === null) {
      errors['distanciaEntrelinhas'] = 'Introduza a distância entrelinhas.';
    } else if (isNaN(ent)) {
      errors['distanciaEntrelinhas'] = 'Introduza um valor numérico válido.';
    } else if (ent <= 0) {
      errors['distanciaEntrelinhas'] = 'A distância entrelinhas deve ser superior a zero.';
    } else if (ent < 1.0) {
      errors['distanciaEntrelinhas'] = 'A distância entrelinhas mínima é 1 m.';
    } else if (ent > 10.0) {
      errors['distanciaEntrelinhas'] = 'A distância máxima é 10,0 m.';
    } else {
      // Avisos não bloqueantes de entrelinha
      if (ent >= 1.0 && ent < 2.0) {
        warnings['distanciaEntrelinhas'] = 'Entrelinha muito estreita. Confirme se esta calculadora é adequada ao sistema de condução e se a medição foi efetuada corretamente.';
      } else if (ent > 8.0 && ent <= 10.0) {
        warnings['distanciaEntrelinhas'] = 'Entrelinha muito larga. Verifique se a medição está correta.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  },

  calculate: (inputs: Record<string, StructuredValue>): Record<string, StructuredValue> => {
    const rawAlt = inputs['alturaVegetacao']?.rawValue;
    const rawEnt = inputs['distanciaEntrelinhas']?.rawValue;

    const alt = typeof rawAlt === 'string'
      ? parseFloat(rawAlt.replace(',', '.'))
      : Number(rawAlt);

    const ent = typeof rawEnt === 'string'
      ? parseFloat(rawEnt.replace(',', '.'))
      : Number(rawEnt);

    const res = calculateLwaPure(alt, ent);

    return {
      areaParedeFoliar: {
        rawValue: res.area_parede_foliar,
        unit: 'm² LWA/ha',
        normalizedValue: res.area_parede_foliar,
        dimension: 'foliar_wall_area',
        canonicalKey: 'leaf_wall_area',
        label: 'Área de Parede Foliar',
        source: 'calculated_output',
        localId: 'areaParedeFoliar',
        calculatorId: 'calc_area_parede_foliar',
        calculatorVersion: '1.0.0'
      }
    };
  }
};
