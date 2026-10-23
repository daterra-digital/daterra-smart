import type { EppoDoseInputs, EppoDoseResults, LabelDoseType } from './types';

/**
 * Calcula a Área de Parede Foliar (LWA) em m²/ha segundo a norma EPPO PP 1/239 (3).
 * Fórmula: LWA = (h * 2 * 10000) / r
 */
export function calculateLwa(canopyHeightM: number, rowSpacingM: number): number {
  if (rowSpacingM <= 0 || canopyHeightM <= 0) return 0;
  return (canopyHeightM * 2 * 10000) / rowSpacingM;
}

/**
 * Calcula o Volume de Copa (TRV) em m³/ha segundo a norma EPPO PP 1/239 (3).
 * Fórmula: TRV = (h * w * SF * 10000) / r (onde SF tem valor por defeito 1.0)
 */
export function calculateTrv(
  canopyHeightM: number,
  canopyWidthM: number,
  rowSpacingM: number,
  shapeFactor = 1.0
): number {
  if (rowSpacingM <= 0 || canopyHeightM <= 0 || canopyWidthM <= 0 || shapeFactor <= 0) {
    return 0;
  }
  return (canopyHeightM * canopyWidthM * shapeFactor * 10000) / rowSpacingM;
}

/**
 * Converte qualquer expressão de dose do rótulo (D_GA, D_LWA, D_TRV, D_hl, D_pct)
 * numa Dose Ajustada por Hectare de solo (D_GA_ajustada em L/ha ou kg/ha).
 */
export function convertToAdjustedDoseHa(
  labelDoseType: LabelDoseType,
  labelDoseValue: number,
  lwaM2Ha: number,
  trvM3Ha: number,
  sprayVolumeLHa: number,
  referenceLwaM2Ha = 10000,
  cropReference: 'vinha' | 'pomar' = 'vinha'
): number {
  if (labelDoseValue <= 0) return 0;

  switch (labelDoseType) {
    case 'D_LWA':
      // Se o método selecionado for TRV (Pomar), harmoniza com o fator de forma via TRV; caso contrário usa LWA
      return cropReference === 'pomar'
        ? labelDoseValue * (trvM3Ha / 10000)
        : labelDoseValue * (lwaM2Ha / 10000);

    case 'D_TRV':
      // Dose por 10.000 m³ de volume de copa -> ajustada ao TRV real (inclui SF)
      return labelDoseValue * (trvM3Ha / 10000);

    case 'D_GA': {
      // No Método TRV (Pomar), ajusta a dose de superfície pelo TRV real (com SF) face à referência 10.000 m³/ha.
      // No Método LWA (Vinha/Sebe), ajusta pelo LWA real face à referência 10.000 m²/ha.
      if (cropReference === 'pomar') {
        return labelDoseValue * (trvM3Ha / 10000);
      }
      const safeRef = referenceLwaM2Ha > 0 ? referenceLwaM2Ha : 10000;
      return labelDoseValue * (lwaM2Ha / safeRef);
    }

    case 'D_hl':
      // Concentração em mL/hL ou g/hL convertida para L/ha ou kg/ha com base no volume aplicado
      return (labelDoseValue * sprayVolumeLHa) / 100000;

    case 'D_pct':
      // Concentração em % (1% = 1000 mL/hL) convertida para L/ha ou kg/ha
      return (labelDoseValue * sprayVolumeLHa) / 100;

    default:
      return 0;
  }
}

/**
 * Método 1: Quantidade de produto fitofarmacêutico no depósito a partir da Dose Ajustada por hectare.
 * Fórmula: Q = (V_deposito * D_GA_ajustada * 1000) / V_aplicado (retorna em mL ou g)
 */
export function calculateTankProductMethod1(
  tankCapacityL: number,
  adjustedDoseHa: number,
  sprayVolumeLHa: number
): number {
  if (tankCapacityL <= 0 || adjustedDoseHa <= 0 || sprayVolumeLHa <= 0) return 0;
  return (tankCapacityL * adjustedDoseHa * 1000) / sprayVolumeLHa;
}

/**
 * Método 2: Quantidade de produto fitofarmacêutico no depósito a partir da Concentração (mL/hL ou g/hL).
 * Fórmula: Q = (V_deposito * C_hl) / 100 (retorna em mL ou g)
 */
export function calculateTankProductMethod2(
  tankCapacityL: number,
  concentrationHl: number
): number {
  if (tankCapacityL <= 0 || concentrationHl <= 0) return 0;
  return (tankCapacityL * concentrationHl) / 100;
}

/**
 * Executa o cálculo completo de harmonização EPPO PP 1/239 (3).
 */
export function calculateEppoDoseHarmony(inputs: EppoDoseInputs): EppoDoseResults {
  const referenceLwaM2Ha = 10000;

  const lwaM2Ha = calculateLwa(inputs.canopyHeightM, inputs.rowSpacingM);
  const trvM3Ha = calculateTrv(
    inputs.canopyHeightM,
    inputs.canopyWidthM,
    inputs.rowSpacingM,
    inputs.shapeFactor || 1.0
  );

  const canopyAdjustmentRatio =
    inputs.cropReference === 'pomar'
      ? trvM3Ha / 10000
      : lwaM2Ha / referenceLwaM2Ha;

  const adjustedDoseHa = convertToAdjustedDoseHa(
    inputs.labelDoseType,
    inputs.labelDoseValue,
    lwaM2Ha,
    trvM3Ha,
    inputs.sprayVolumeLHa,
    referenceLwaM2Ha,
    inputs.cropReference
  );

  // Concentração equivalente em mL/hL ou g/hL para o volume de calda aplicado
  const equivalentConcentrationHl =
    inputs.sprayVolumeLHa > 0
      ? (adjustedDoseHa * 1000 * 100) / inputs.sprayVolumeLHa
      : 0;

  const productInTankMethod1Small = calculateTankProductMethod1(
    inputs.tankCapacityL,
    adjustedDoseHa,
    inputs.sprayVolumeLHa
  );

  const productInTankMethod2Small = calculateTankProductMethod2(
    inputs.tankCapacityL,
    equivalentConcentrationHl
  );

  const treatedAreaPerTankHa =
    inputs.sprayVolumeLHa > 0 ? inputs.tankCapacityL / inputs.sprayVolumeLHa : 0;

  return {
    lwaM2Ha,
    trvM3Ha,
    referenceLwaM2Ha,
    canopyAdjustmentRatio,
    adjustedDoseHa,
    equivalentConcentrationHl,
    productInTankMethod1Small,
    productInTankMethod1Large: productInTankMethod1Small / 1000,
    productInTankMethod2Small,
    productInTankMethod2Large: productInTankMethod2Small / 1000,
    treatedAreaPerTankHa,
    EquivalentDoses: {
      dGa: adjustedDoseHa,
      dLwa: lwaM2Ha > 0 ? adjustedDoseHa / (lwaM2Ha / 10000) : 0,
      dTrv: trvM3Ha > 0 ? adjustedDoseHa / (trvM3Ha / 10000) : 0,
      dHl: equivalentConcentrationHl
    }
  };
}

export function formatEppoNum(val: number, decimals = 2): string {
  if (!Number.isFinite(val)) return '0';
  return val.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
