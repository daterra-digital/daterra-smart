/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Motor de Unidades, Conversões Simples e Transformações Agronómicas
 * Fase 1 - Fundação
 * 
 * Regras estritas:
 * - Distingue conversão simples vs transformação entre grandezas.
 * - Proíbe conversão direta cega entre L/ha e mL/hL sem volume de calda (spray_volume_rate).
 * - Identifica variáveis adicionais obrigatórias e fórmulas explícitas.
 */

import type { StructuredValue } from '../../../types/calculator.ts';

// ==========================================
// 1. FATORES DE CONVERSÃO SIMPLES (MESMA GRANDEZA)
// ==========================================

interface SimpleConversionRate {
  toCanonicalFactor: number; // Multiplicador para converter a unidade para a unidade canónica do SI
}

const SIMPLE_UNIT_CONVERSIONS: Record<string, SimpleConversionRate> = {
  // Volume (Canónica: L)
  'L': { toCanonicalFactor: 1 },
  'mL': { toCanonicalFactor: 0.001 },
  'hL': { toCanonicalFactor: 100 },
  'm³': { toCanonicalFactor: 1000 },
  'gal': { toCanonicalFactor: 3.78541 },

  // Área (Canónica: ha)
  'ha': { toCanonicalFactor: 1 },
  'm²': { toCanonicalFactor: 0.0001 },
  'km²': { toCanonicalFactor: 100 },

  // Massa (Canónica: kg)
  'kg': { toCanonicalFactor: 1 },
  'g': { toCanonicalFactor: 0.001 },
  't': { toCanonicalFactor: 1000 },

  // Comprimento (Canónica: m)
  'm': { toCanonicalFactor: 1 },
  'cm': { toCanonicalFactor: 0.01 },
  'mm': { toCanonicalFactor: 0.001 },

  // Velocidade (Canónica: km/h)
  'km/h': { toCanonicalFactor: 1 },
  'm/s': { toCanonicalFactor: 3.6 },
  'mph': { toCanonicalFactor: 1.60934 },

  // Pressão (Canónica: bar)
  'bar': { toCanonicalFactor: 1 },
  'kPa': { toCanonicalFactor: 0.01 },
  'psi': { toCanonicalFactor: 0.0689476 },

  // Caudal / Débito (Canónica: L/min)
  'L/min': { toCanonicalFactor: 1 },
  'mL/min': { toCanonicalFactor: 0.001 },
  'L/h': { toCanonicalFactor: 1 / 60 },

  // Parede Foliar (Canónica: m² LWA/ha)
  'm² LWA/ha': { toCanonicalFactor: 1 },
  'km² LWA/ha': { toCanonicalFactor: 1000000 },

  // Volume de Copa (Canónica: m³ TRV/ha)
  'm³ TRV/ha': { toCanonicalFactor: 1 },
  'm³/ha': { toCanonicalFactor: 1 }
};

// ==========================================
// 2. CONVERSÃO SIMPLES
// ==========================================

export interface SimpleConversionResult {
  success: boolean;
  convertedValue?: number;
  fromUnit: string;
  toUnit: string;
  error?: string;
}

/**
 * Converte valores entre unidades da MESMA grandeza física simples.
 * Exemplo: 1000 mL -> 1 L, 2.5 m -> 250 cm.
 */
export function convertSimpleUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): SimpleConversionResult {
  if (fromUnit === toUnit) {
    return { success: true, convertedValue: value, fromUnit, toUnit };
  }

  const fromRate = SIMPLE_UNIT_CONVERSIONS[fromUnit];
  const toRate = SIMPLE_UNIT_CONVERSIONS[toUnit];

  if (!fromRate || !toRate) {
    return {
      success: false,
      fromUnit,
      toUnit,
      error: `Unidade não suportada para conversão simples direta (${fromUnit} -> ${toUnit}).`
    };
  }

  // Converte para canónica e depois para destino
  const canonicalValue = value * fromRate.toCanonicalFactor;
  const finalValue = canonicalValue / toRate.toCanonicalFactor;

  return {
    success: true,
    convertedValue: Number(finalValue.toFixed(6)),
    fromUnit,
    toUnit
  };
}

// ==========================================
// 3. TRANSFORMAÇÃO AGRONÓMICA ENTRE GRANDEZAS
// ==========================================

export type TransformationStatus =
  | 'direct_compatible'              // Mesma grandeza canónica, conversão direta
  | 'requires_additional_variables'  // Transformação possível, mas exige variáveis de contexto
  | 'incompatible';                  // Grandezas fisicamente incompatíveis

export interface TransformationEvaluation {
  status: TransformationStatus;
  fromCanonicalKey: string;
  toCanonicalKey: string;
  fromUnit: string;
  targetUnit: string;
  requiredVariables: string[];       // Chaves canónicas necessárias (ex: ['spray_volume_rate'])
  formulaDescription?: string;
  explanation: string;
}

/**
 * Avalia se uma variável de origem pode ser transferida para uma variável de destino.
 * Aplica estritamente a Decisão 22:
 * "Não tratar L/ha e mL/hL como conversões diretas universais.
 *  A transformação entre dose por área e concentração exige o volume aplicado por área."
 */
export function evaluateTransformation(
  source: StructuredValue,
  targetCanonicalKey: string,
  targetUnit: string
): TransformationEvaluation {
  // Caso 1: Mesma chave canónica -> compatibilidade direta
  if (source.canonicalKey === targetCanonicalKey) {
    const simple = convertSimpleUnit(Number(source.rawValue) || 0, source.unit, targetUnit);
    return {
      status: simple.success ? 'direct_compatible' : 'incompatible',
      fromCanonicalKey: source.canonicalKey,
      toCanonicalKey: targetCanonicalKey,
      fromUnit: source.unit,
      targetUnit,
      requiredVariables: [],
      explanation: simple.success
        ? `Conversão direta de ${source.unit} para ${targetUnit}.`
        : `Unidade de destino ${targetUnit} não é compatível com ${source.unit}.`
    };
  }

  // Caso 2: Dose por Hectare (product_dose_rate) -> Concentração (concentration)
  // Fórmula: Concentração (mL/hL) = (Dose_L_ha * 100.000) / Vol_Calda_L_ha
  if (
    source.canonicalKey === 'product_dose_rate' &&
    targetCanonicalKey === 'concentration'
  ) {
    return {
      status: 'requires_additional_variables',
      fromCanonicalKey: source.canonicalKey,
      toCanonicalKey: targetCanonicalKey,
      fromUnit: source.unit,
      targetUnit,
      requiredVariables: ['spray_volume_rate'],
      formulaDescription: 'Concentração = (Dose / Volume de Calda) * Fator de Unidade',
      explanation:
        'A dose por hectare não pode ser convertida diretamente em concentração sem especificar o Volume de Calda Aplicado (L/ha).'
    };
  }

  // Caso 3: Concentração (concentration) -> Dose por Hectare (product_dose_rate)
  // Fórmula: Dose_L_ha = (Concentracao_mL_hL * Vol_Calda_L_ha) / 100.000
  if (
    source.canonicalKey === 'concentration' &&
    targetCanonicalKey === 'product_dose_rate'
  ) {
    return {
      status: 'requires_additional_variables',
      fromCanonicalKey: source.canonicalKey,
      toCanonicalKey: targetCanonicalKey,
      fromUnit: source.unit,
      targetUnit,
      requiredVariables: ['spray_volume_rate'],
      formulaDescription: 'Dose = (Concentração * Volume de Calda) / Fator de Unidade',
      explanation:
        'A concentração na calda não pode ser convertida em dose por hectare sem especificar o Volume de Calda Aplicado (L/ha).'
    };
  }

  // Caso 4: Débito por bico (nozzle_flow_rate) -> Débito Total (total_flow_rate)
  // Fórmula: Total = Bico * Número de Bicos
  if (
    source.canonicalKey === 'nozzle_flow_rate' &&
    targetCanonicalKey === 'total_flow_rate'
  ) {
    return {
      status: 'requires_additional_variables',
      fromCanonicalKey: source.canonicalKey,
      toCanonicalKey: targetCanonicalKey,
      fromUnit: source.unit,
      targetUnit,
      requiredVariables: ['active_nozzles'],
      formulaDescription: 'Débito Total = Débito do Bico * Número de Bicos Ativos',
      explanation:
        'O débito individual do bico requer a contagem de bicos abertos para determinar o débito total.'
    };
  }

  // Caso Incompatível por defeito
  return {
    status: 'incompatible',
    fromCanonicalKey: source.canonicalKey,
    toCanonicalKey: targetCanonicalKey,
    fromUnit: source.unit,
    targetUnit,
    requiredVariables: [],
    explanation: `Não existe relação física nem transformação conhecida entre ${source.canonicalKey} e ${targetCanonicalKey}.`
  };
}

/**
 * Executa a transformação agronómica fornecendo as variáveis de contexto exigidas.
 */
export function executeTransformation(
  source: StructuredValue,
  targetCanonicalKey: string,
  targetUnit: string,
  contextVariables: Record<string, StructuredValue>
): { success: boolean; resultValue?: number; error?: string } {
  const evalResult = evaluateTransformation(source, targetCanonicalKey, targetUnit);

  if (evalResult.status === 'incompatible') {
    return { success: false, error: evalResult.explanation };
  }

  if (evalResult.status === 'direct_compatible') {
    const conv = convertSimpleUnit(Number(source.rawValue) || 0, source.unit, targetUnit);
    return conv.success
      ? { success: true, resultValue: conv.convertedValue }
      : { success: false, error: conv.error };
  }

  // Verifica se todas as variáveis exigidas estão presentes no contexto
  for (const reqKey of evalResult.requiredVariables) {
    if (!contextVariables[reqKey] || contextVariables[reqKey].rawValue === undefined) {
      return {
        success: false,
        error: `Falta a variável obrigatória "${reqKey}" para calcular a transformação.`
      };
    }
  }

  const rawVal = Number(source.rawValue) || 0;

  // Transformação: Dose (L/ha) -> Concentração (mL/hL)
  if (source.canonicalKey === 'product_dose_rate' && targetCanonicalKey === 'concentration') {
    const volCalda = Number(contextVariables['spray_volume_rate'].rawValue) || 0;
    if (volCalda <= 0) {
      return { success: false, error: 'Volume de calda deve ser estritamente superior a zero.' };
    }
    // Dose em L/ha convertida para mL/ha = rawVal * 1000
    // Concentração em mL/hL = (mL/ha / (volCalda / 100)) = (rawVal * 1000 * 100) / volCalda
    const conc_mL_hL = (rawVal * 100000) / volCalda;
    return { success: true, resultValue: Number(conc_mL_hL.toFixed(2)) };
  }

  // Transformação: Concentração (mL/hL) -> Dose (L/ha)
  if (source.canonicalKey === 'concentration' && targetCanonicalKey === 'product_dose_rate') {
    const volCalda = Number(contextVariables['spray_volume_rate'].rawValue) || 0;
    if (volCalda <= 0) {
      return { success: false, error: 'Volume de calda deve ser estritamente superior a zero.' };
    }
    // Dose em L/ha = (rawVal * volCalda) / 100000
    const dose_L_ha = (rawVal * volCalda) / 100000;
    return { success: true, resultValue: Number(dose_L_ha.toFixed(3)) };
  }

  return { success: false, error: 'Transformação não implementada para as grandezas indicadas.' };
}
