/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Definição Declarativa: Calculadora de Velocidade Real de Trabalho
 * ID: calc_velocidade_real
 * Categoria: Calibração
 */

import type { CalculatorDefinition, ValidationResult } from '../core/types.ts';
import type { StructuredValue } from '../../../types/calculator.ts';

export interface PureWorkSpeedResult {
  velocidade_kmh: number;
  velocidade_ms: number;
  isValid: boolean;
}

/**
 * Função Pura: Determina a velocidade real de avanço do trator/equipamento.
 * Fórmula Oficial DATERRA:
 *   v = (3.6 × d) / t   (km/h)
 *   v_aux = d / t       (m/s)
 * 
 * Regras:
 * - d > 0, t > 0
 * - Arredondamento a 1 casa decimal
 * - Nunca devolve NaN, Infinity ou valores negativos
 */
export function calculateWorkSpeedPure(
  distanciaMeters: number,
  tempoSeconds: number
): PureWorkSpeedResult {
  if (
    typeof distanciaMeters !== 'number' ||
    typeof tempoSeconds !== 'number' ||
    isNaN(distanciaMeters) ||
    isNaN(tempoSeconds) ||
    !isFinite(distanciaMeters) ||
    !isFinite(tempoSeconds) ||
    distanciaMeters <= 0 ||
    tempoSeconds <= 0
  ) {
    return {
      velocidade_kmh: 0,
      velocidade_ms: 0,
      isValid: false
    };
  }

  const vKmh = (3.6 * distanciaMeters) / tempoSeconds;
  const vMs = distanciaMeters / tempoSeconds;

  return {
    velocidade_kmh: Number(vKmh.toFixed(1)),
    velocidade_ms: Number(vMs.toFixed(1)),
    isValid: true
  };
}

export const velocidadeRealCalculatorConfig: CalculatorDefinition = {
  id: 'calc_velocidade_real',
  version: '1.0.0',
  title: 'Velocidade Real de Trabalho',
  category: 'Calibração',
  subtitle: 'Calcule a velocidade real do equipamento no campo para apoiar uma calibração mais rigorosa.',
  generalHelpFile: 'VelocidadeRealFAQGeral.md',

  fields: [
    {
      id: 'distanciaPercurso',
      label: 'Distância do percurso (m)',
      canonicalKey: 'route_distance',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 100,
      allowedUnits: ['m'],
      presets: [50, 100, 200, 300],
      helpFile: 'VelocidadeRealFAQDistancia.md',
      required: true,
      min: 1,
      minInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      description: 'Distância linear exata delimitada para o ensaio de cronometragem no terreno.'
    },
    {
      id: 'tempoPercurso',
      label: 'Tempo do percurso (s)',
      canonicalKey: 'route_time',
      dimension: 'time',
      defaultUnit: 's',
      defaultValue: 45,
      allowedUnits: ['s'],
      presets: [30, 45, 60, 90],
      helpFile: 'VelocidadeRealFAQTempo.md',
      required: true,
      min: 1,
      minInclusive: true,
      allowDecimal: true,
      allowNegative: false,
      maxDecimals: 2,
      allowExpressions: true,
      description: 'Duração cronometrada que o equipamento demorou a percorrer o percurso.'
    }
  ],

  results: [
    {
      id: 'velocidadeReal',
      canonicalKey: 'work_speed',
      label: 'Velocidade real de trabalho:',
      dimension: 'speed',
      defaultUnit: 'km/h',
      subUnit: 'm/s',
      isPrimary: true,
      formatDecimals: 1,
      helpFile: 'VelocidadeRealFAQResultado.md'
    }
  ],

  validate: (inputs: Record<string, StructuredValue>): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    const distRaw = inputs['distanciaPercurso']?.rawValue;
    const tempoRaw = inputs['tempoPercurso']?.rawValue;

    const d = distRaw !== undefined && distRaw !== null && distRaw !== '' ? Number(distRaw) : NaN;
    const t = tempoRaw !== undefined && tempoRaw !== null && tempoRaw !== '' ? Number(tempoRaw) : NaN;

    // Validação da Distância
    if (distRaw === undefined || distRaw === null || distRaw === '' || isNaN(d)) {
      errors['distanciaPercurso'] = 'Indique a distância do percurso.';
    } else if (d < 1) {
      errors['distanciaPercurso'] = 'A distância deve ser de pelo menos 1 m.';
    } else if (d < 100) {
      warnings['distanciaPercurso'] = 'Para maior precisão, recomenda-se uma distância mínima de 100 m.';
    }

    // Validação do Tempo
    if (tempoRaw === undefined || tempoRaw === null || tempoRaw === '' || isNaN(t)) {
      errors['tempoPercurso'] = 'Indique o tempo do percurso.';
    } else if (t < 1) {
      errors['tempoPercurso'] = 'O tempo deve ser de pelo menos 1 segundo.';
    } else if (t < 20) {
      warnings['tempoPercurso'] = 'Tempo muito curto pode reduzir a precisão da medição.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  },

  calculate: (inputs: Record<string, StructuredValue>): Record<string, StructuredValue> => {
    const distRaw = inputs['distanciaPercurso']?.rawValue;
    const tempoRaw = inputs['tempoPercurso']?.rawValue;

    const d = Number(distRaw) || 0;
    const t = Number(tempoRaw) || 0;

    const pure = calculateWorkSpeedPure(d, t);

    return {
      velocidadeReal: {
        rawValue: pure.velocidade_kmh,
        unit: 'km/h',
        subValue: pure.velocidade_ms,
        subUnit: 'm/s',
        dimension: 'speed',
        canonicalKey: 'work_speed',
        label: 'Velocidade real de trabalho:',
        source: 'calculated_output',
        localId: 'velocidadeReal',
        calculatorId: 'calc_velocidade_real',
        calculatorVersion: '1.0.0'
      }
    };
  }
};
