import type { StructuredValue } from '../../../types/calculator.ts';
import type { PureWorkSpeedResult } from '../definitions/velocidadeRealCalculatorConfig.ts';

export function buildVelocidadeStructuredValues(
  distanciaMeters: number,
  tempoSeconds: number,
  speedResult: PureWorkSpeedResult
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  return {
    inputs: {
      distanciaPercurso: {
        rawValue: distanciaMeters,
        unit: 'm',
        dimension: 'length',
        canonicalKey: 'route_distance',
        label: 'Distância do percurso',
        source: 'user_input',
        localId: 'distanciaPercurso',
        calculatorId: 'calc_velocidade_real',
        calculatorVersion: '1.0.0'
      },
      tempoPercurso: {
        rawValue: tempoSeconds,
        unit: 's',
        dimension: 'time',
        canonicalKey: 'route_time',
        label: 'Tempo do percurso',
        source: 'user_input',
        localId: 'tempoPercurso',
        calculatorId: 'calc_velocidade_real',
        calculatorVersion: '1.0.0'
      }
    },
    outputs: {
      velocidadeReal: {
        rawValue: speedResult.velocidade_kmh,
        unit: 'km/h',
        subValue: speedResult.velocidade_ms,
        subUnit: 'm/s',
        dimension: 'speed',
        canonicalKey: 'work_speed',
        label: 'Velocidade real',
        source: 'calculated_output',
        localId: 'velocidadeReal',
        calculatorId: 'calc_velocidade_real',
        calculatorVersion: '1.0.0'
      }
    }
  };
}
