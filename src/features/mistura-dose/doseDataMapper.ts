import type { StructuredValue } from '../../types/calculator.ts';

export type DoseUnitMode = 'liquid' | 'solid';

export interface DoseCalculationResult {
  quantidadePfSmall: number; // em mL ou g
  primaryValue: number;      // valor formatado principal (L/kg ou mL/g)
  primaryUnit: string;       // L, kg, mL ou g
  subValue: number;          // submétrica secundária
  subUnit: string;           // mL, g, L ou kg
  area_tratada_ha: number;   // Área coberta por depósito (ha)
  isSolid: boolean;
  isLargePrimary: boolean;
  isValid: boolean;
}

export function calculateDoseExtended(
  volPreparar: number,
  doseValue: number,
  unitMode: DoseUnitMode,
  volCalda: number
): DoseCalculationResult {
  const isSolid = unitMode === 'solid';
  const smallUnit = isSolid ? 'g' : 'mL';
  const largeUnit = isSolid ? 'kg' : 'L';

  if (!isFinite(volPreparar) || !isFinite(doseValue) || !isFinite(volCalda) || volPreparar <= 0 || doseValue <= 0 || volCalda <= 0) {
    return {
      quantidadePfSmall: 0,
      primaryValue: 0,
      primaryUnit: largeUnit,
      subValue: 0,
      subUnit: smallUnit,
      area_tratada_ha: 0,
      isSolid,
      isLargePrimary: true,
      isValid: false
    };
  }

  // Dose convertida para unidade menor (g/ha ou mL/ha)
  const rawDoseSmall = doseValue * 1000;
  const resultInSmall = (volPreparar * rawDoseSmall) / volCalda;
  const areaTratada = volPreparar / volCalda;

  const rawSmall = Math.round(resultInSmall * 100) / 100;
  const rawLarge = Math.round((resultInSmall / 1000) * 100) / 100;
  const isLargePrimary = rawSmall >= 1000;

  return {
    quantidadePfSmall: rawSmall,
    primaryValue: isLargePrimary ? rawLarge : rawSmall,
    primaryUnit: isLargePrimary ? largeUnit : smallUnit,
    subValue: isLargePrimary ? rawSmall : rawLarge,
    subUnit: isLargePrimary ? smallUnit : largeUnit,
    area_tratada_ha: Math.round(areaTratada * 100) / 100,
    isSolid,
    isLargePrimary,
    isValid: true
  };
}

export function buildDoseStructuredValues(
  volPreparar: number,
  doseValue: number,
  unitMode: DoseUnitMode,
  volCalda: number,
  result: DoseCalculationResult
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  const isSolid = unitMode === 'solid';
  const doseUnit = isSolid ? 'kg/ha' : 'L/ha';

  const inputs: Record<string, StructuredValue> = {
    volPrepararDose: {
      canonicalKey: 'tank_volume',
      dimension: 'volume',
      rawValue: volPreparar,
      unit: 'L',
      normalizedValue: volPreparar / 1000,
      normalizedUnit: 'm3',
      source: 'user_input',
      label: 'Capacidade do depósito',
      localId: 'volPrepararDose',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    },
    doseValue: {
      canonicalKey: 'product_dose_rate',
      dimension: 'application_rate',
      rawValue: doseValue,
      unit: doseUnit,
      normalizedValue: isSolid ? doseValue * 1e-4 : (doseValue / 1000) * 1e-4,
      normalizedUnit: isSolid ? 'kg/m2' : 'm3/m2',
      source: 'user_input',
      label: 'Dose recomendada',
      localId: 'doseValue',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    },
    volCalda: {
      canonicalKey: 'spray_volume_rate',
      dimension: 'application_rate',
      rawValue: volCalda,
      unit: 'L/ha',
      normalizedValue: (volCalda / 1000) * 1e-4,
      normalizedUnit: 'm3/m2',
      source: 'user_input',
      label: 'Volume de calda',
      localId: 'volCalda',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    }
  };

  const outputs: Record<string, StructuredValue> = {
    quantidade_pf: {
      canonicalKey: 'product_commercial_quantity',
      dimension: isSolid ? 'mass' : 'volume',
      rawValue: result.primaryValue,
      unit: result.primaryUnit,
      normalizedValue: isSolid
        ? (result.primaryUnit === 'kg' ? result.primaryValue : result.primaryValue / 1000)
        : (result.primaryUnit === 'L' ? result.primaryValue / 1000 : result.primaryValue / 1e6),
      normalizedUnit: isSolid ? 'kg' : 'm3',
      source: 'calculated_output',
      label: 'Quantidade comercial por depósito',
      localId: 'quantidade_pf',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    },
    area_tratada_ha: {
      canonicalKey: 'treated_area',
      dimension: 'area',
      rawValue: result.area_tratada_ha,
      unit: 'ha',
      normalizedValue: result.area_tratada_ha * 10000,
      normalizedUnit: 'm2',
      source: 'calculated_output',
      label: 'Área tratada por depósito',
      localId: 'area_tratada_ha',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0'
    }
  };

  return { inputs, outputs };
}

export function getDoseKeypadConfig(
  field: 'volPreparar' | 'doseValue' | 'volCalda',
  volPreparar: number,
  doseValue: number,
  volCalda: number,
  unitMode: DoseUnitMode
) {
  const isSolid = unitMode === 'solid';
  if (field === 'volPreparar') {
    return {
      label: 'Capacidade Útil do Depósito (L)',
      initial: volPreparar,
      unit: 'L',
      min: 1,
      max: 10000,
      common: [200, 500, 1000, 1500]
    };
  }
  if (field === 'doseValue') {
    return {
      label: `Dose Recomendada por ha (${isSolid ? 'kg/ha' : 'L/ha'})`,
      initial: doseValue,
      unit: isSolid ? 'kg/ha' : 'L/ha',
      min: 0.01,
      max: 1000,
      common: [1, 2, 3, 5]
    };
  }
  return {
    label: 'Volume de Calda Aplicado (L/ha)',
    initial: volCalda,
    unit: 'L/ha',
    min: 1,
    max: 5000,
    common: [100, 200, 300, 400]
  };
}
