import type { StructuredValue } from '../../types/calculator.ts';

export interface TrvCalculationResult {
  volume_copa: number;
  caldaReferenciaLHa: number; // Volume de calda sugerido (L/ha) a 0.05 L/m³
  caldaMinLHa: number;        // Faixa mínima (0.04 L/m³)
  caldaMaxLHa: number;        // Faixa máxima (0.07 L/m³)
  isValid: boolean;
}

export function calculateTrvExtended(
  alturaCopa: number,
  larguraCopa: number,
  distanciaEntrelinhas: number
): TrvCalculationResult {
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
      caldaReferenciaLHa: 0,
      caldaMinLHa: 0,
      caldaMaxLHa: 0,
      isValid: false
    };
  }

  // TRV = (h × w × 10.000) / r (m³ TRV/ha)
  const rawTrv = (alturaCopa * larguraCopa * 10000) / distanciaEntrelinhas;
  const trv = Math.round(rawTrv * 10) / 10;

  // Calda de Referência EPPO / DGAV: 0.05 L por m³ de copa
  const caldaRef = Math.round(trv * 0.05);
  const caldaMin = Math.round(trv * 0.04);
  const caldaMax = Math.round(trv * 0.07);

  return {
    volume_copa: trv,
    caldaReferenciaLHa: caldaRef,
    caldaMinLHa: caldaMin,
    caldaMaxLHa: caldaMax,
    isValid: true
  };
}

export function buildTrvStructuredValues(
  alturaCopa: number,
  larguraCopa: number,
  distanciaEntrelinhas: number,
  trv: number
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  return {
    inputs: {
      alturaCopa: {
        rawValue: alturaCopa,
        unit: 'm',
        dimension: 'length',
        canonicalKey: 'canopy_height',
        label: 'Altura da copa',
        source: 'user_input',
        localId: 'alturaCopa',
        calculatorId: 'calc_volume_copa',
        calculatorVersion: '1.0.0'
      },
      larguraCopa: {
        rawValue: larguraCopa,
        unit: 'm',
        dimension: 'length',
        canonicalKey: 'canopy_width',
        label: 'Largura média da copa',
        source: 'user_input',
        localId: 'larguraCopa',
        calculatorId: 'calc_volume_copa',
        calculatorVersion: '1.0.0'
      },
      distanciaEntrelinhas: {
        rawValue: distanciaEntrelinhas,
        unit: 'm',
        dimension: 'length',
        canonicalKey: 'row_spacing',
        label: 'Distância entrelinhas',
        source: 'user_input',
        localId: 'distanciaEntrelinhas',
        calculatorId: 'calc_volume_copa',
        calculatorVersion: '1.0.0'
      }
    },
    outputs: {
      volumeCopa: {
        rawValue: trv,
        unit: 'm³ TRV/ha',
        dimension: 'tree_row_volume',
        canonicalKey: 'tree_row_volume',
        label: 'Volume de copa',
        source: 'calculated_output',
        localId: 'volumeCopa',
        calculatorId: 'calc_volume_copa',
        calculatorVersion: '1.0.0'
      }
    }
  };
}
