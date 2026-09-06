/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Configuração Declarativa Oficial: Calculadora de Volume de Copa (TRV)
 * Identificador Técnico: calc_volume_copa
 * Categoria: Calibração
 * 
 * Fórmula Oficial: TRV = (h × w × 10.000) / r
 * Onde:
 *  - h = Altura útil média da copa (m)
 *  - w = Largura média da copa (m)
 *  - r = Distância entrelinhas (m)
 *  - TRV = Volume de copa por hectare (m³ TRV/ha)
 *  - 10.000 = Conversão de metros quadrados para hectare (m²/ha)
 */

import type { CalculatorDefinition, ValidationResult } from '../core/types.ts';
import type { StructuredValue } from '../../../types/calculator.ts';

/**
 * Função pura e desacoplada de cálculo do Volume de Copa (TRV).
 * Garante segurança numérica contra divisão por zero, NaN, Infinity e valores negativos.
 * Arredonda apenas no final para 1 casa decimal.
 */
export function calculateTrvPure(
  alturaCopa: number,
  larguraCopa: number,
  distanciaEntrelinhas: number
): {
  volume_copa: number;
  isValid: boolean;
} {
  if (
    typeof alturaCopa !== 'number' ||
    typeof larguraCopa !== 'number' ||
    typeof distanciaEntrelinhas !== 'number' ||
    !isFinite(alturaCopa) ||
    !isFinite(larguraCopa) ||
    !isFinite(distanciaEntrelinhas) ||
    alturaCopa <= 0 ||
    larguraCopa <= 0 ||
    distanciaEntrelinhas <= 0
  ) {
    return {
      volume_copa: 0,
      isValid: false
    };
  }

  // TRV = (h × w × 10.000) / r
  const rawTrv = (alturaCopa * larguraCopa * 10000) / distanciaEntrelinhas;

  if (!isFinite(rawTrv) || isNaN(rawTrv) || rawTrv < 0) {
    return {
      volume_copa: 0,
      isValid: false
    };
  }

  // Arredondamento estrito a uma casa decimal
  return {
    volume_copa: Math.round(rawTrv * 10) / 10,
    isValid: true
  };
}

/**
 * Configuração declarativa oficial da Calculadora de Volume de Copa (TRV).
 */
export const volumeCopaCalculatorConfig: CalculatorDefinition = {
  id: 'calc_volume_copa',
  version: '1.0.0',
  title: 'Volume de Copa (TRV)',
  subtitle: 'Calcula o volume tridimensional médio de vegetação por hectare em culturas dispostas em linha, para apoiar caracterização da copa e futuras ferramentas de volume de calda.',
  category: 'Calibração',
  badgeLabel: 'Tree Row Volume',
  generalHelpFile: 'TRVFAQGeral.md',
  invalidResultNotice: 'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.',

  fields: [
    // Campo 1 — Altura da copa
    {
      id: 'alturaCopa',
      label: 'Altura da copa',
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
      helpFile: 'TRVFAQAltura.md',
      description: 'Altura útil média da copa ou vegetação tratada.'
    },

    // Campo 2 — Largura média da copa
    {
      id: 'larguraCopa',
      label: 'Largura média da copa',
      canonicalKey: 'canopy_width',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 1.0,
      allowedUnits: ['m'],
      presets: [0.5, 1.0, 1.5, 2.0],
      required: true,
      min: 0.2,
      max: 5.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      helpFile: 'TRVFAQLargura.md',
      description: 'Espessura ou largura média transversal da vegetação tratada.'
    },

    // Campo 3 — Distância entrelinhas
    {
      id: 'distanciaEntrelinhas',
      label: 'Distância entrelinhas',
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
      helpFile: 'TRVFAQEntrelinha.md',
      description: 'Distância horizontal entre eixos de fiadas contíguas.'
    }
  ],

  results: [
    {
      id: 'volumeCopa',
      label: 'Volume de copa',
      canonicalKey: 'tree_row_volume',
      dimension: 'tree_row_volume',
      defaultUnit: 'm³ TRV/ha',
      formatDecimals: 1,
      isPrimary: true,
      helpFile: 'TRVFAQResultado.md'
    }
  ],

  validate: (inputs: Record<string, StructuredValue>): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    const rawAlt = inputs['alturaCopa']?.rawValue;
    const rawLarg = inputs['larguraCopa']?.rawValue;
    const rawEnt = inputs['distanciaEntrelinhas']?.rawValue;

    const alt = typeof rawAlt === 'string' ? parseFloat(rawAlt.replace(',', '.')) : Number(rawAlt);
    const larg = typeof rawLarg === 'string' ? parseFloat(rawLarg.replace(',', '.')) : Number(rawLarg);
    const ent = typeof rawEnt === 'string' ? parseFloat(rawEnt.replace(',', '.')) : Number(rawEnt);

    // 1. Validação do Campo: Altura da copa (m)
    if (rawAlt === undefined || rawAlt === '' || rawAlt === null) {
      errors['alturaCopa'] = 'Introduza a altura da copa.';
    } else if (isNaN(alt)) {
      errors['alturaCopa'] = 'Introduza um valor numérico válido.';
    } else if (alt <= 0) {
      errors['alturaCopa'] = 'A altura deve ser superior a zero.';
    } else if (alt < 0.5) {
      errors['alturaCopa'] = 'A altura mínima é 0,5 m.';
    } else if (alt > 6.0) {
      errors['alturaCopa'] = 'A altura máxima é 6,0 m.';
    } else {
      // Avisos não bloqueantes de altura
      if (alt >= 0.5 && alt < 1.0) {
        warnings['alturaCopa'] = 'Altura muito baixa. Verifique se a medição está correta.';
      } else if (alt > 5.0 && alt <= 6.0) {
        warnings['alturaCopa'] = 'Altura elevada. Verifique se a medição está correta.';
      }
    }

    // 2. Validação do Campo: Largura média da copa (m)
    if (rawLarg === undefined || rawLarg === '' || rawLarg === null) {
      errors['larguraCopa'] = 'Introduza a largura média da copa.';
    } else if (isNaN(larg)) {
      errors['larguraCopa'] = 'Introduza um valor numérico válido.';
    } else if (larg <= 0) {
      errors['larguraCopa'] = 'A largura deve ser superior a zero.';
    } else if (larg < 0.2) {
      errors['larguraCopa'] = 'A largura mínima é 0,2 m.';
    } else if (larg > 5.0) {
      errors['larguraCopa'] = 'A largura máxima é 5,0 m.';
    } else {
      // Avisos não bloqueantes de largura
      if (larg >= 0.2 && larg < 0.4) {
        warnings['larguraCopa'] = 'Largura muito estreita. Verifique se a medição está correta.';
      } else if (larg > 4.0 && larg <= 5.0) {
        warnings['larguraCopa'] = 'Largura muito larga. Verifique se a medição está correta.';
      }
    }

    // 3. Validação do Campo: Distância entrelinhas (m)
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
    const rawAlt = inputs['alturaCopa']?.rawValue;
    const rawLarg = inputs['larguraCopa']?.rawValue;
    const rawEnt = inputs['distanciaEntrelinhas']?.rawValue;

    const alt = typeof rawAlt === 'string' ? parseFloat(rawAlt.replace(',', '.')) : Number(rawAlt);
    const larg = typeof rawLarg === 'string' ? parseFloat(rawLarg.replace(',', '.')) : Number(rawLarg);
    const ent = typeof rawEnt === 'string' ? parseFloat(rawEnt.replace(',', '.')) : Number(rawEnt);

    const res = calculateTrvPure(alt, larg, ent);

    if (!res.isValid) {
      return {};
    }

    return {
      volumeCopa: {
        rawValue: res.volume_copa,
        unit: 'm³ TRV/ha',
        normalizedValue: res.volume_copa,
        dimension: 'tree_row_volume',
        canonicalKey: 'tree_row_volume',
        label: 'Volume de copa',
        source: 'calculated_output',
        localId: 'volumeCopa',
        calculatorId: 'calc_volume_copa',
        calculatorVersion: '1.0.0'
      }
    };
  }
};