export type LabelDoseType = 'D_LWA' | 'D_TRV' | 'D_GA' | 'D_hl' | 'D_pct';

export type DoseUnitMode = 'liquid' | 'solid'; // L / mL vs kg / g

export type CropReferenceType = 'vinha' | 'pomar';

export interface EppoDoseInputs {
  // 1. Geometria do Pomar / Vinha
  canopyHeightM: number;       // h (m)
  canopyWidthM: number;        // w (m)
  rowSpacingM: number;         // r (m)
  shapeFactor: number;         // SF (default 1.0)
  cropReference: CropReferenceType; // Define LWA padrão de referência (10000 m²/ha vinha, 15000 m²/ha pomar)

  // 2. Dados do Rótulo
  labelDoseType: LabelDoseType;
  labelDoseValue: number;
  unitMode: DoseUnitMode;

  // 3. Máquina & Depósito
  tankCapacityL: number;       // V_deposito (L)
  sprayVolumeLHa: number;      // V_aplicado (L/ha)
}

export interface EppoDoseResults {
  lwaM2Ha: number;
  trvM3Ha: number;
  referenceLwaM2Ha: number;
  canopyAdjustmentRatio: number;
  adjustedDoseHa: number;          // D_GA_ajustada (L/ha ou kg/ha)
  equivalentConcentrationHl: number; // mL/hL ou g/hL
  productInTankMethod1Small: number; // mL ou g no depósito (Método 1)
  productInTankMethod1Large: number; // L ou kg no depósito (Método 1)
  productInTankMethod2Small: number; // mL ou g no depósito (Método 2 - Concentração)
  productInTankMethod2Large: number; // L ou kg no depósito (Método 2 - Concentração)
  treatedAreaPerTankHa: number;    // ha por depósito
  EquivalentDoses: {
    dGa: number;
    dLwa: number;
    dTrv: number;
    dHl: number;
  };
}
