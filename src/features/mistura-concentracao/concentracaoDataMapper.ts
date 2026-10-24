import type { StructuredValue } from '../../types/calculator.ts';

export type ConcentracaoUnit = 'mL/hL' | 'g/hL' | '%' | 'L/hL' | 'kg/hL';
export type ConcentracaoMode = 'jovem' | 'adulta';

export interface ConcentracaoCalculationResult {
  quantidadePfSmall: number; // em mL ou g
  primaryValue: number;      // valor formatado principal (L/kg ou mL/g)
  primaryUnit: string;       // L, kg, mL ou g
  subValue: number;          // submétrica secundária
  subUnit: string;           // mL, g, L ou kg
  isSolid: boolean;
  doseEquivalenteLHa: number; // Dose equivalente em L/ha ou kg/ha
  isValid: boolean;
}

export function calculateConcentracaoExtended(
  concValue: number,
  concUnit: ConcentracaoUnit,
  volPreparar: number,
  mode: ConcentracaoMode = 'jovem',
  volRecomendado: number = 1000,
  volAplicado: number = 400
): ConcentracaoCalculationResult {
  if (
    typeof concValue !== 'number' ||
    typeof volPreparar !== 'number' ||
    !isFinite(concValue) ||
    !isFinite(volPreparar) ||
    concValue <= 0 ||
    volPreparar <= 0
  ) {
    return {
      quantidadePfSmall: 0,
      primaryValue: 0,
      primaryUnit: ['g/hL', 'kg/hL'].includes(concUnit) ? 'g' : 'mL',
      subValue: 0,
      subUnit: ['g/hL', 'kg/hL'].includes(concUnit) ? 'kg' : 'L',
      isSolid: ['g/hL', 'kg/hL'].includes(concUnit),
      doseEquivalenteLHa: 0,
      isValid: false
    };
  }

  const isSolid = ['g/hL', 'kg/hL'].includes(concUnit);
  const isPercent = concUnit === '%';

  // Normalização para unidades pequenas (mL/hL ou g/hL por 100 L)
  let rawConc = concValue;
  if (concUnit === 'L/hL' || concUnit === 'kg/hL' || isPercent) {
    rawConc = concValue * 1000;
  }

  let resultInSmall = 0;
  if (mode === 'jovem') {
    // Diluição direta: Qtd = (conc * volPreparar) / 100
    resultInSmall = (rawConc * volPreparar) / 100;
  } else {
    // Copa Adulta: ajuste pelo rácio volRecomendado / volAplicado
    if (volAplicado > 0 && volRecomendado > 0) {
      resultInSmall = (volPreparar * rawConc * volRecomendado) / (volAplicado * 100);
    } else {
      resultInSmall = 0;
    }
  }

  const smallUnit = isSolid ? 'g' : 'mL';
  const largeUnit = isSolid ? 'kg' : 'L';

  const rawSmall = Math.round(resultInSmall * 100) / 100;
  const rawLarge = Math.round((resultInSmall / 1000) * 100) / 100;
  const isLargePrimary = rawSmall >= 1000;

  // Dose equivalente por hectare (L/ha ou kg/ha)
  const doseEquiv = volAplicado > 0
    ? Math.round(((rawSmall / 1000) * volAplicado / volPreparar) * 1000) / 1000
    : 0;

  return {
    quantidadePfSmall: rawSmall,
    primaryValue: isLargePrimary ? rawLarge : rawSmall,
    primaryUnit: isLargePrimary ? largeUnit : smallUnit,
    subValue: isLargePrimary ? rawSmall : rawLarge,
    subUnit: isLargePrimary ? smallUnit : largeUnit,
    isSolid,
    doseEquivalenteLHa: doseEquiv,
    isValid: resultInSmall > 0
  };
}

export function buildConcentracaoStructuredValues(
  concValue: number,
  concUnit: ConcentracaoUnit,
  volPreparar: number,
  mode: ConcentracaoMode,
  volRecomendado: number,
  volAplicado: number,
  result: ConcentracaoCalculationResult
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  return {
    inputs: {
      concValue: {
        rawValue: concValue,
        unit: concUnit,
        dimension: 'concentration',
        canonicalKey: 'concentration',
        label: 'Concentração recomendada',
        source: 'user_input',
        localId: 'concValue',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      },
      volPreparar: {
        rawValue: volPreparar,
        unit: 'L',
        dimension: 'volume',
        canonicalKey: 'tank_volume',
        label: 'Capacidade do depósito',
        source: 'user_input',
        localId: 'volPreparar',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      },
      mode: {
        rawValue: mode,
        unit: '',
        dimension: 'text',
        canonicalKey: 'calculator_mode',
        label: 'Modo de aplicação',
        source: 'user_input',
        localId: 'mode',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      },
      volRecomendado: {
        rawValue: volRecomendado,
        unit: 'L/ha',
        dimension: 'application_rate',
        canonicalKey: 'recommended_spray_volume',
        label: 'Volume de calda recomendado',
        source: 'user_input',
        localId: 'volRecomendado',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      },
      volAplicado: {
        rawValue: volAplicado,
        unit: 'L/ha',
        dimension: 'application_rate',
        canonicalKey: 'applied_spray_volume',
        label: 'Volume de calda aplicado',
        source: 'user_input',
        localId: 'volAplicado',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      }
    },
    outputs: {
      quantidadeComercial: {
        rawValue: result.primaryValue,
        unit: result.primaryUnit,
        dimension: result.isSolid ? 'mass' : 'volume',
        canonicalKey: 'product_amount_tank',
        label: 'Quantidade comercial por depósito',
        source: 'calculated_output',
        localId: 'quantidadeComercial',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      }
    }
  };
}

export function getConcentracaoKeypadConfig(
  activeKeypad: string | null,
  concValue: number,
  volPreparar: number,
  volRecomendado: number,
  volAplicado: number,
  concUnit: ConcentracaoUnit
) {
  if (activeKeypad === 'concValue') {
    const isP = concUnit === '%';
    return { label: `Concentração Recomendada (${concUnit})`, initial: concValue, common: isP ? [0.05, 0.1, 0.15, 0.2] : [50, 100, 150, 200], min: 0.001, max: 10000 };
  }
  if (activeKeypad === 'volPreparar') {
    return { label: 'Capacidade Útil do Depósito (L)', initial: volPreparar, common: [200, 400, 600, 1000], min: 10, max: 5000 };
  }
  if (activeKeypad === 'volRecomendado') {
    return { label: 'Volume Recomendado (L/ha)', initial: volRecomendado, common: [500, 800, 1000, 1200], min: 50, max: 3000 };
  }
  return { label: 'Volume Aplicado (L/ha)', initial: volAplicado, common: [200, 300, 400, 500], min: 50, max: 2000 };
}
