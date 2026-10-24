import type { StructuredValue } from '../../types/calculator.ts';

export interface LwaCalculationResult {
  area_parede_foliar: number; // m² LWA/ha
  caldaReferenciaLHa: number; // Volume de calda de referência (L/ha) a 0.03 L/m²
  caldaMinLHa: number;        // Faixa mínima de calda (0.025 L/m²)
  caldaMaxLHa: number;        // Faixa máxima de calda (0.040 L/m²)
  isValid: boolean;
}

export function calculateLwaExtended(
  alturaVegetacao: number,
  distanciaEntrelinhas: number
): LwaCalculationResult {
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
      caldaReferenciaLHa: 0,
      caldaMinLHa: 0,
      caldaMaxLHa: 0,
      isValid: false
    };
  }

  // Norma EPPO PP 1/239: LWA = (h × 2 × 10.000) / r
  const rawLwa = (alturaVegetacao * 2 * 10000) / distanciaEntrelinhas;
  if (!isFinite(rawLwa) || isNaN(rawLwa) || rawLwa < 0) {
    return {
      area_parede_foliar: 0,
      caldaReferenciaLHa: 0,
      caldaMinLHa: 0,
      caldaMaxLHa: 0,
      isValid: false
    };
  }

  const lwa = Math.round(rawLwa);
  // Volume de calda sugerido proporcional à área de parede foliar (EPPO)
  const caldaRef = Math.round(lwa * 0.03);
  const caldaMin = Math.round(lwa * 0.025);
  const caldaMax = Math.round(lwa * 0.04);

  return {
    area_parede_foliar: lwa,
    caldaReferenciaLHa: caldaRef,
    caldaMinLHa: caldaMin,
    caldaMaxLHa: caldaMax,
    isValid: true
  };
}

export function buildLwaStructuredValues(
  alturaVegetacao: number,
  distanciaEntrelinhas: number,
  lwa: number
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  return {
    inputs: {
      alturaVegetacao: {
        rawValue: alturaVegetacao,
        unit: 'm',
        dimension: 'length',
        canonicalKey: 'canopy_height',
        label: 'Altura da vegetação tratada',
        source: 'user_input',
        localId: 'alturaVegetacao',
        calculatorId: 'calc_area_parede_foliar',
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
        calculatorId: 'calc_area_parede_foliar',
        calculatorVersion: '1.0.0'
      }
    },
    outputs: {
      areaParedeFoliar: {
        rawValue: lwa,
        unit: 'm² LWA/ha',
        dimension: 'foliar_wall_area',
        canonicalKey: 'leaf_wall_area',
        label: 'Área de Parede Foliar',
        source: 'calculated_output',
        localId: 'areaParedeFoliar',
        calculatorId: 'calc_area_parede_foliar',
        calculatorVersion: '1.0.0'
      }
    }
  };
}
