/**
 * DATERRA Smart - Motor Puro de Cálculo Agronómico
 * Ferramenta: Calibração Pulverizador (Planeamento por LWA/TRV — EPPO)
 * 
 * Regras Estritas:
 * 1. Funções puras sem efeitos secundários, DOM, Dexie ou traduções.
 * 2. Proteção matemática contra 0, negativos, NaN, Infinity e divisões inválidas.
 * 3. Preservação estrita de famílias de unidades (massa g<->kg, volume mL<->L).
 * 4. O fator visual (0,75/0,85/1,00) NUNCA é multiplicado novamente pelo valor k.
 * 5. LWA nunca deriva volume automático a partir de k TRV.
 */

import {
  selectEppoKRow,
  type EppoKDecisionRow
} from './data/eppoKDecisionMatrix.ts';
import {
  LWA_V_THICKNESS_FACTORS,
  LWA_V_DENSITY_FACTORS,
  LWA_V_STAGE_FACTORS,
  type LwaVThicknessId,
  type CanopyDensityId,
  type LwaVStageId
} from './data/lwaVDaterraConfig.ts';
import type {
  CalibracaoPulverizadorRawInputs,
  CalibracaoPulverizadorCalculatedOutputs,
  DoseType
} from './calibracaoPulverizadorTypes.ts';

/**
 * Calcula a Área de Parede Foliar (LWA) em m²/ha.
 * Fórmula EPPO: LWA = (h × facesTratadas × 10.000) / r
 */
export function calculateLwa(
  treatedHeightM: number,
  rowSpacingM: number,
  treatedSides: 1 | 2 = 2
): number | null {
  const h = Number(treatedHeightM);
  const r = Number(rowSpacingM);
  const faces = Number(treatedSides);

  if (!Number.isFinite(h) || !Number.isFinite(r) || !Number.isFinite(faces)) return null;
  if (h <= 0 || r <= 0) return null;
  if (faces !== 1 && faces !== 2) return null;

  const lwa = (h * faces * 10000) / r;
  if (!Number.isFinite(lwa) || lwa <= 0) return null;

  return lwa;
}

/**
 * Alias canónico para geometria LWA.
 */
export function calculateLwaGeometry(
  heightM: number,
  rowSpacingM: number,
  treatedSides: 1 | 2 = 2
): number | null {
  return calculateLwa(heightM, rowSpacingM, treatedSides);
}

/**
 * Calcula o Volume de Copa (TRV) em m³/ha.
 * Fórmula EPPO: TRV = (h × w × 10.000) / r
 */
export function calculateTrv(
  canopyHeightM: number,
  canopyWidthM: number,
  rowSpacingM: number
): number | null {
  const h = Number(canopyHeightM);
  const w = Number(canopyWidthM);
  const r = Number(rowSpacingM);

  if (!Number.isFinite(h) || !Number.isFinite(w) || !Number.isFinite(r)) return null;
  if (h <= 0 || w <= 0 || r <= 0) return null;

  const trv = (h * w * 10000) / r;
  if (!Number.isFinite(trv) || trv <= 0) return null;

  return trv;
}

/**
 * Calcula o Volume de Calda Recomendado (Q) a partir do TRV e coeficiente k.
 * Fórmula: Q (L/ha) = k (L/m³) × TRV (m³/ha)
 */
export function calculateTrvSprayVolume(
  trvM3PerHa: number,
  kLPerM3: number
): number | null {
  const trv = Number(trvM3PerHa);
  const k = Number(kLPerM3);

  if (!Number.isFinite(trv) || !Number.isFinite(k)) return null;
  if (trv <= 0 || k <= 0) return null;

  const q = k * trv;
  if (!Number.isFinite(q) || q <= 0) return null;

  return q;
}

/**
 * Calcula o Volume Teórico LWA-V DATERRA em L/ha.
 * Fórmula: V_teorico = LWA * 0.0377 * F_espessura * F_densidade * F_estadio
 * Se estádio for 'int_1' (repouso vegetativo, fator 0.0), retorna null.
 */
export function calculateLwaVTheoreticalVolume(
  lwaM2PerHa: number,
  thicknessId?: LwaVThicknessId,
  densityId?: CanopyDensityId,
  stageId?: LwaVStageId
): number | null {
  const lwa = Number(lwaM2PerHa);
  if (!Number.isFinite(lwa) || lwa <= 0) return null;
  if (!thicknessId || !densityId || !stageId) return null;

  const fThickness = LWA_V_THICKNESS_FACTORS[thicknessId];
  const fDensity = LWA_V_DENSITY_FACTORS[densityId];
  const fStage = LWA_V_STAGE_FACTORS[stageId];

  if (fThickness === undefined || fDensity === undefined || fStage === undefined) return null;
  if (stageId === 'int_1' || fStage === 0) return null;

  const kBase = 0.0377;
  const vTeorico = lwa * kBase * fThickness * fDensity * fStage;
  if (!Number.isFinite(vTeorico) || vTeorico <= 0) return null;

  return vTeorico;
}

export function calculateLwaVFinalVolume(params: {
  lwaM2PerHa: number;
  thicknessId?: LwaVThicknessId;
  densityId?: CanopyDensityId;
  stageId?: LwaVStageId;
}): {
  isApplicable: boolean;
  theoreticalVolumeLHa?: number;
  finalVolumeLHa?: number;
  thicknessFactor?: number;
  densityFactor?: number;
  stageFactor?: number;
} {
  const { lwaM2PerHa, thicknessId, densityId, stageId } = params;

  if (stageId === 'int_1') {
    return {
      isApplicable: false,
      stageFactor: 0.0,
      thicknessFactor: thicknessId ? LWA_V_THICKNESS_FACTORS[thicknessId] : undefined,
      densityFactor: densityId ? LWA_V_DENSITY_FACTORS[densityId] : undefined
    };
  }

  const vTeorico = calculateLwaVTheoreticalVolume(lwaM2PerHa, thicknessId, densityId, stageId);
  if (vTeorico === null) {
    return { isApplicable: false };
  }

  return {
    isApplicable: true,
    theoreticalVolumeLHa: vTeorico,
    finalVolumeLHa: vTeorico,
    thicknessFactor: thicknessId ? LWA_V_THICKNESS_FACTORS[thicknessId] : undefined,
    densityFactor: densityId ? LWA_V_DENSITY_FACTORS[densityId] : undefined,
    stageFactor: stageId ? LWA_V_STAGE_FACTORS[stageId] : undefined
  };
}

/**
 * Calcula a área tratada por depósito em hectares.
 * Área (ha) = volumeFinalDeposito / volumeCaldaLHa
 */
export function calculateAreaPerTank(
  finalTankVolumeL: number,
  sprayVolumeLHa: number
): number | null {
  const vTank = Number(finalTankVolumeL);
  const q = Number(sprayVolumeLHa);

  if (!Number.isFinite(vTank) || !Number.isFinite(q)) return null;
  if (vTank <= 0 || q <= 0) return null;

  const area = vTank / q;
  if (!Number.isFinite(area) || area <= 0) return null;

  return area;
}

/**
 * Calcula os depósitos necessários por hectare.
 * Depósitos/ha = volumeCaldaLHa / volumeFinalDeposito
 */
export function calculateTanksPerHa(
  sprayVolumeLHa: number,
  finalTankVolumeL: number
): number | null {
  const q = Number(sprayVolumeLHa);
  const vTank = Number(finalTankVolumeL);

  if (!Number.isFinite(q) || !Number.isFinite(vTank)) return null;
  if (q <= 0 || vTank <= 0) return null;

  const tanks = q / vTank;
  if (!Number.isFinite(tanks) || tanks <= 0) return null;

  return tanks;
}

/**
 * Identifica se a unidade de dose pertence à família sólida (massa) ou líquida (volume).
 */
export function isSolidUnit(unit?: string): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase().trim();
  return (
    u.startsWith('g') ||
    u.startsWith('kg') ||
    u.includes('g/') ||
    u.includes('kg/')
  );
}

/**
 * Converte um valor numa unidade da família de massa para a unidade base (gramas).
 */
export function normalizeMassToBase(value: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u.startsWith('kg')) {
    return value * 1000; // kg -> g
  }
  return value; // g
}

/**
 * Converte um valor numa unidade da família de volume para a unidade base (mililitros).
 */
export function normalizeVolumeToBase(value: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u.startsWith('l')) {
    return value * 1000; // L -> mL
  }
  return value; // mL
}

/**
 * Calcula a dose equivalente por hectare a partir de LWA.
 * Dose Equivalente (por ha) = (doseLWA × LWA) / 10.000
 */
export function calculateDoseEquivalentPerHaFromLwa(
  doseLwaValue: number,
  lwaM2PerHa: number
): number | null {
  const dose = Number(doseLwaValue);
  const lwa = Number(lwaM2PerHa);

  if (!Number.isFinite(dose) || !Number.isFinite(lwa)) return null;
  if (dose <= 0 || lwa <= 0) return null;

  const equiv = (dose * lwa) / 10000;
  if (!Number.isFinite(equiv) || equiv <= 0) return null;

  return equiv;
}

/**
 * Limpa artefactos de precisão de vírgula flutuante IEEE 754.
 */
export function cleanFloat(val: number): number {
  return Math.round(val * 1e9) / 1e9;
}

export interface ProductTankAndDoseResult {
  isSolid: boolean;
  doseEquivalentPerHaValue?: number;
  doseEquivalentPerHaUnit?: string;
  doseEquivalentPerHaSubValue?: number;
  doseEquivalentPerHaSubUnit?: string;

  productPerTankValue?: number;
  productPerTankUnit?: string;
  productPerTankSubValue?: number;
  productPerTankSubUnit?: string;
}

/**
 * Calcula produto por depósito e dose equivalente por hectare para todos os tipos de dose.
 */
export function calculateProductDoseAndTank(params: {
  doseType?: DoseType;
  doseValue?: number;
  doseUnit?: string;
  finalTankVolumeL?: number;
  sprayVolumeLHa?: number;
  lwaM2PerHa?: number;
}): ProductTankAndDoseResult {
  const { doseType, doseValue, doseUnit, finalTankVolumeL, sprayVolumeLHa, lwaM2PerHa } = params;

  if (!doseType || doseValue === undefined || doseValue <= 0 || !doseUnit) {
    return { isSolid: false };
  }

  const isSolid = isSolidUnit(doseUnit);
  const vTank = finalTankVolumeL !== undefined && finalTankVolumeL > 0 ? Number(finalTankVolumeL) : null;
  const q = sprayVolumeLHa !== undefined && sprayVolumeLHa > 0 ? Number(sprayVolumeLHa) : null;
  const lwa = lwaM2PerHa !== undefined && lwaM2PerHa > 0 ? Number(lwaM2PerHa) : null;

  // -------------------------------------------------------------------------
  // 1. DOSE POR HECTARE (mL/ha, L/ha, g/ha, kg/ha)
  // -------------------------------------------------------------------------
  if (doseType === 'dose_ha') {
    const baseUnit = isSolid ? 'g' : 'mL';
    const largeUnit = isSolid ? 'kg' : 'L';
    const primaryDoseUnit = doseUnit.toLowerCase().startsWith('k') || doseUnit.toLowerCase().startsWith('l')
      ? `${largeUnit}/ha`
      : `${baseUnit}/ha`;

    const equivVal = doseValue;
    let equivSubVal: number | undefined;
    let equivSubUnit: string | undefined;

    if (primaryDoseUnit.startsWith(largeUnit)) {
      equivSubVal = equivVal * 1000;
      equivSubUnit = `${baseUnit}/ha`;
    } else {
      equivSubVal = equivVal / 1000;
      equivSubUnit = `${largeUnit}/ha`;
    }

    let prodTankVal: number | undefined;
    let prodTankUnit: string | undefined;
    let prodTankSubVal: number | undefined;
    let prodTankSubUnit: string | undefined;

    if (vTank && q) {
      // Área tratada por depósito = vTank / q
      // Produto por depósito = doseValue * (vTank / q)
      const rawProdInGivenUnit = cleanFloat(doseValue * (vTank / q));
      const isLargeUnitInput = doseUnit.toLowerCase().startsWith('k') || doseUnit.toLowerCase().startsWith('l');

      // Se a dose foi introduzida em L ou kg, resultado primário em L ou kg
      if (isLargeUnitInput) {
        prodTankVal = rawProdInGivenUnit;
        prodTankUnit = largeUnit;
        prodTankSubVal = cleanFloat(rawProdInGivenUnit * 1000);
        prodTankSubUnit = baseUnit;
      } else {
        // Se a dose foi introduzida em mL ou g
        if (rawProdInGivenUnit >= 1000) {
          prodTankVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankUnit = largeUnit;
          prodTankSubVal = rawProdInGivenUnit;
          prodTankSubUnit = baseUnit;
        } else {
          prodTankVal = rawProdInGivenUnit;
          prodTankUnit = baseUnit;
          prodTankSubVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankSubUnit = largeUnit;
        }
      }
    }

    return {
      isSolid,
      doseEquivalentPerHaValue: equivVal,
      doseEquivalentPerHaUnit: primaryDoseUnit,
      doseEquivalentPerHaSubValue: cleanFloat(equivSubVal!),
      doseEquivalentPerHaSubUnit: equivSubUnit,
      productPerTankValue: prodTankVal !== undefined ? cleanFloat(prodTankVal) : undefined,
      productPerTankUnit: prodTankUnit,
      productPerTankSubValue: prodTankSubVal !== undefined ? cleanFloat(prodTankSubVal) : undefined,
      productPerTankSubUnit: prodTankSubUnit
    };
  }

  // -------------------------------------------------------------------------
  // 2. DOSE POR 100 L (mL/100 L, L/100 L, g/100 L, kg/100 L)
  // -------------------------------------------------------------------------
  if (doseType === 'dose_100l') {
    const baseUnit = isSolid ? 'g' : 'mL';
    const largeUnit = isSolid ? 'kg' : 'L';
    const isLargeUnitInput = doseUnit.toLowerCase().startsWith('k') || doseUnit.toLowerCase().startsWith('l');

    let prodTankVal: number | undefined;
    let prodTankUnit: string | undefined;
    let prodTankSubVal: number | undefined;
    let prodTankSubUnit: string | undefined;

    if (vTank) {
      // Produto por depósito = dosePor100L * vTank / 100
      const rawProdInGivenUnit = cleanFloat((doseValue * vTank) / 100);
      if (isLargeUnitInput) {
        prodTankVal = rawProdInGivenUnit;
        prodTankUnit = largeUnit;
        prodTankSubVal = cleanFloat(rawProdInGivenUnit * 1000);
        prodTankSubUnit = baseUnit;
      } else {
        if (rawProdInGivenUnit >= 1000) {
          prodTankVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankUnit = largeUnit;
          prodTankSubVal = rawProdInGivenUnit;
          prodTankSubUnit = baseUnit;
        } else {
          prodTankVal = rawProdInGivenUnit;
          prodTankUnit = baseUnit;
          prodTankSubVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankSubUnit = largeUnit;
        }
      }
    }

    let equivVal: number | undefined;
    let equivUnit: string | undefined;
    let equivSubVal: number | undefined;
    let equivSubUnit: string | undefined;

    if (q) {
      // Dose equivalente por hectare = dosePor100L * q / 100
      const rawDoseInGivenUnit = cleanFloat((doseValue * q) / 100);
      if (isLargeUnitInput) {
        equivVal = rawDoseInGivenUnit;
        equivUnit = `${largeUnit}/ha`;
        equivSubVal = cleanFloat(rawDoseInGivenUnit * 1000);
        equivSubUnit = `${baseUnit}/ha`;
      } else {
        if (rawDoseInGivenUnit >= 1000) {
          equivVal = cleanFloat(rawDoseInGivenUnit / 1000);
          equivUnit = `${largeUnit}/ha`;
          equivSubVal = rawDoseInGivenUnit;
          equivSubUnit = `${baseUnit}/ha`;
        } else {
          equivVal = rawDoseInGivenUnit;
          equivUnit = `${baseUnit}/ha`;
          equivSubVal = cleanFloat(rawDoseInGivenUnit / 1000);
          equivSubUnit = `${largeUnit}/ha`;
        }
      }
    }

    return {
      isSolid,
      doseEquivalentPerHaValue: equivVal !== undefined ? cleanFloat(equivVal) : undefined,
      doseEquivalentPerHaUnit: equivUnit,
      doseEquivalentPerHaSubValue: equivSubVal !== undefined ? cleanFloat(equivSubVal) : undefined,
      doseEquivalentPerHaSubUnit: equivSubUnit,
      productPerTankValue: prodTankVal !== undefined ? cleanFloat(prodTankVal) : undefined,
      productPerTankUnit: prodTankUnit,
      productPerTankSubValue: prodTankSubVal !== undefined ? cleanFloat(prodTankSubVal) : undefined,
      productPerTankSubUnit: prodTankSubUnit
    };
  }

  // -------------------------------------------------------------------------
  // 3. CONCENTRAÇÃO (%, mL/hL, L/hL, g/hL, kg/hL)
  // -------------------------------------------------------------------------
  if (doseType === 'concentration') {
    const isPercent = doseUnit === '%';
    const baseUnit = isSolid ? 'g' : 'mL';
    const largeUnit = isSolid ? 'kg' : 'L';

    // Se for percentagem: 1% de 100 L de calda = 1 L ou 1 kg de produto por 100 L
    // Se for mL/hL ou g/hL: dosePorHL por 100 L de calda
    // Se for L/hL ou kg/hL: dosePorHL em L ou kg por 100 L de calda
    const isLargeUnitInput = doseUnit === 'L/hL' || doseUnit === 'kg/hL' || isPercent;

    let prodTankVal: number | undefined;
    let prodTankUnit: string | undefined;
    let prodTankSubVal: number | undefined;
    let prodTankSubUnit: string | undefined;

    if (vTank) {
      const rawProdInGivenUnit = cleanFloat((doseValue * vTank) / 100);
      if (isLargeUnitInput) {
        prodTankVal = rawProdInGivenUnit;
        prodTankUnit = largeUnit;
        prodTankSubVal = cleanFloat(rawProdInGivenUnit * 1000);
        prodTankSubUnit = baseUnit;
      } else {
        if (rawProdInGivenUnit >= 1000) {
          prodTankVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankUnit = largeUnit;
          prodTankSubVal = rawProdInGivenUnit;
          prodTankSubUnit = baseUnit;
        } else {
          prodTankVal = rawProdInGivenUnit;
          prodTankUnit = baseUnit;
          prodTankSubVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankSubUnit = largeUnit;
        }
      }
    }

    let equivVal: number | undefined;
    let equivUnit: string | undefined;
    let equivSubVal: number | undefined;
    let equivSubUnit: string | undefined;

    if (q) {
      const rawDoseInGivenUnit = cleanFloat((doseValue * q) / 100);
      if (isLargeUnitInput) {
        equivVal = rawDoseInGivenUnit;
        equivUnit = `${largeUnit}/ha`;
        equivSubVal = cleanFloat(rawDoseInGivenUnit * 1000);
        equivSubUnit = `${baseUnit}/ha`;
      } else {
        if (rawDoseInGivenUnit >= 1000) {
          equivVal = cleanFloat(rawDoseInGivenUnit / 1000);
          equivUnit = `${largeUnit}/ha`;
          equivSubVal = rawDoseInGivenUnit;
          equivSubUnit = `${baseUnit}/ha`;
        } else {
          equivVal = rawDoseInGivenUnit;
          equivUnit = `${baseUnit}/ha`;
          equivSubVal = cleanFloat(rawDoseInGivenUnit / 1000);
          equivSubUnit = `${largeUnit}/ha`;
        }
      }
    }

    return {
      isSolid,
      doseEquivalentPerHaValue: equivVal !== undefined ? cleanFloat(equivVal) : undefined,
      doseEquivalentPerHaUnit: equivUnit,
      doseEquivalentPerHaSubValue: equivSubVal !== undefined ? cleanFloat(equivSubVal) : undefined,
      doseEquivalentPerHaSubUnit: equivSubUnit,
      productPerTankValue: prodTankVal !== undefined ? cleanFloat(prodTankVal) : undefined,
      productPerTankUnit: prodTankUnit,
      productPerTankSubValue: prodTankSubVal !== undefined ? cleanFloat(prodTankSubVal) : undefined,
      productPerTankSubUnit: prodTankSubUnit
    };
  }

  // -------------------------------------------------------------------------
  // 4. DOSE POR 10 000 M² DE LWA
  // -------------------------------------------------------------------------
  if (doseType === 'dose_lwa') {
    const baseUnit = isSolid ? 'g' : 'mL';
    const largeUnit = isSolid ? 'kg' : 'L';
    const isLargeUnitInput = doseUnit.toLowerCase().startsWith('k') || doseUnit.toLowerCase().startsWith('l');

    let equivVal: number | undefined;
    let equivUnit: string | undefined;
    let equivSubVal: number | undefined;
    let equivSubUnit: string | undefined;

    if (lwa) {
      // Dose equivalente por hectare = (doseLWA * LWA) / 10.000
      const rawEquivInGivenUnit = cleanFloat((doseValue * lwa) / 10000);
      if (isLargeUnitInput) {
        equivVal = rawEquivInGivenUnit;
        equivUnit = `${largeUnit}/ha`;
        equivSubVal = cleanFloat(rawEquivInGivenUnit * 1000);
        equivSubUnit = `${baseUnit}/ha`;
      } else {
        if (rawEquivInGivenUnit >= 1000) {
          equivVal = cleanFloat(rawEquivInGivenUnit / 1000);
          equivUnit = `${largeUnit}/ha`;
          equivSubVal = rawEquivInGivenUnit;
          equivSubUnit = `${baseUnit}/ha`;
        } else {
          equivVal = rawEquivInGivenUnit;
          equivUnit = `${baseUnit}/ha`;
          equivSubVal = cleanFloat(rawEquivInGivenUnit / 1000);
          equivSubUnit = `${largeUnit}/ha`;
        }
      }
    }

    let prodTankVal: number | undefined;
    let prodTankUnit: string | undefined;
    let prodTankSubVal: number | undefined;
    let prodTankSubUnit: string | undefined;

    // Se existir volume adotado (q) e volume final do depósito (vTank):
    // Área tratada por depósito = vTank / q
    // Produto por depósito = doseEquivalentePorHa * (vTank / q)
    if (equivVal !== undefined && vTank && q) {
      const isEquivInLargeUnit = equivUnit?.startsWith(largeUnit);
      const doseEquivInGivenUnit = equivVal;
      const rawProdInGivenUnit = cleanFloat(doseEquivInGivenUnit * (vTank / q));

      if (isEquivInLargeUnit) {
        prodTankVal = rawProdInGivenUnit;
        prodTankUnit = largeUnit;
        prodTankSubVal = cleanFloat(rawProdInGivenUnit * 1000);
        prodTankSubUnit = baseUnit;
      } else {
        if (rawProdInGivenUnit >= 1000) {
          prodTankVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankUnit = largeUnit;
          prodTankSubVal = rawProdInGivenUnit;
          prodTankSubUnit = baseUnit;
        } else {
          prodTankVal = rawProdInGivenUnit;
          prodTankUnit = baseUnit;
          prodTankSubVal = cleanFloat(rawProdInGivenUnit / 1000);
          prodTankSubUnit = largeUnit;
        }
      }
    }

    return {
      isSolid,
      doseEquivalentPerHaValue: equivVal !== undefined ? cleanFloat(equivVal) : undefined,
      doseEquivalentPerHaUnit: equivUnit,
      doseEquivalentPerHaSubValue: equivSubVal !== undefined ? cleanFloat(equivSubVal) : undefined,
      doseEquivalentPerHaSubUnit: equivSubUnit,
      productPerTankValue: prodTankVal !== undefined ? cleanFloat(prodTankVal) : undefined,
      productPerTankUnit: prodTankUnit,
      productPerTankSubValue: prodTankSubVal !== undefined ? cleanFloat(prodTankSubVal) : undefined,
      productPerTankSubUnit: prodTankSubUnit
    };
  }

  return { isSolid };
}

/**
 * Calcula o Caudal Total Necessário (Qtotal) em L/min (Fase B).
 * Fórmula: Qtotal (L/min) = (Volume (L/ha) × Velocidade (km/h) × Largura de trabalho (m)) / 600
 */
export function calculateRequiredTotalFlowLMin(
  sprayVolumeLHa: number,
  speedKmH: number,
  workingWidthM: number
): number | null {
  const v = Number(sprayVolumeLHa);
  const s = Number(speedKmH);
  const w = Number(workingWidthM);

  if (!Number.isFinite(v) || !Number.isFinite(s) || !Number.isFinite(w)) return null;
  if (v <= 0 || s <= 0 || w <= 0) return null;

  const qTotal = (v * s * w) / 600;
  if (!Number.isFinite(qTotal) || qTotal <= 0) return null;

  return qTotal;
}

/**
 * Calcula o Débito Médio por Bico (Qbico) em L/min por bico (Fase B).
 * Fórmula: Qbico (L/min) = Qtotal (L/min) / número de bicos ativos
 * Requisito estrito: activeNozzleCount deve ser inteiro positivo (> 0).
 */
export function calculateFlowPerNozzleLMin(
  totalFlowLMin: number,
  activeNozzleCount: number
): number | null {
  const qTotal = Number(totalFlowLMin);
  const count = Number(activeNozzleCount);

  if (!Number.isFinite(qTotal) || !Number.isFinite(count)) return null;
  if (qTotal <= 0 || count <= 0 || !Number.isInteger(count)) return null;

  const qNozzle = qTotal / count;
  if (!Number.isFinite(qNozzle) || qNozzle <= 0) return null;

  return qNozzle;
}

/**
 * Calcula o Tempo Teórico por Hectare (T) em min/ha (Fase B).
 * Fórmula: Tempo (min/ha) = 600 / (Velocidade (km/h) × Largura de trabalho (m))
 */
export function calculateTheoreticalTimePerHaMinutes(
  speedKmH: number,
  workingWidthM: number
): number | null {
  const s = Number(speedKmH);
  const w = Number(workingWidthM);

  if (!Number.isFinite(s) || !Number.isFinite(w)) return null;
  if (s <= 0 || w <= 0) return null;

  const timeMin = 600 / (s * w);
  if (!Number.isFinite(timeMin) || timeMin <= 0) return null;

  return timeMin;
}

/**
 * Motor puro mestre de cálculo da Calibração do Pulverizador.
 */
export function calculateCalibracaoPulverizadorPure(
  inputs: CalibracaoPulverizadorRawInputs
): CalibracaoPulverizadorCalculatedOutputs {
  const isLwa = inputs.method === 'lwa';
  const h = Number(inputs.treatedHeightM);
  const r = Number(inputs.rowSpacingM);
  const faces = (inputs.treatedSides === 1 ? 1 : 2) as 1 | 2;
  const w = Number(inputs.canopyWidthM);
  const vTank = Number(inputs.finalTankVolumeL) || undefined;
  const qAdopted = Number(inputs.adoptedSprayVolumeLHa) || undefined;

  let lwaVal: number | undefined;
  let trvVal: number | undefined;
  let selectedRow: EppoKDecisionRow | null = null;
  let recommendedQ: number | undefined;
  let theoreticalQ: number | undefined;
  let effectiveQ: number | undefined;
  let isAdoptedSprayVolume = false;
  let kLwaValPerM2: number | undefined;
  let kLwaValPer10000M2: number | undefined;

  const isVinha = !inputs.cultureId || inputs.cultureId === 'vinha';
  const effDensity: CanopyDensityId =
    inputs.canopyDensity === 'aberta' || inputs.canopyDensity === 'open'
      ? 'aberta'
      : inputs.canopyDensity === 'densa' || inputs.canopyDensity === 'dense'
      ? 'densa'
      : 'moderada';
  const thickness: LwaVThicknessId = inputs.canopyThickness || 'estreita';
  const stage: LwaVStageId = inputs.phenologyStage || 'int_5';

  // -------------------------------------------------------------------------
  // PERCURSO LWA
  // -------------------------------------------------------------------------
  if (isLwa) {
    if (isVinha) {
      // No modelo LWA-V de Vinha em Espaldeira, faces tratadas é sempre 2
      const lwaResult = calculateLwa(h, r, 2);
      if (lwaResult !== null) {
        lwaVal = Math.round(lwaResult);
      }

      // Estádio INT_1 (Repouso a olho de algodão)
      if (stage === 'int_1') {
        return {
          isValid: true,
          isApplicable: false,
          method: 'lwa',
          lwaM2PerHa: lwaVal,
          lwaModel: 'lwa-v-daterra-v1',
          canopyThickness: thickness,
          canopyThicknessFactor: LWA_V_THICKNESS_FACTORS[thickness],
          canopyDensityFactor: LWA_V_DENSITY_FACTORS[effDensity],
          phenologyInterval: 'int_1',
          phenologyFactor: 0.0,
          baseCoverageRateLPerM2: 0.0377
        };
      }

      const fThickness = LWA_V_THICKNESS_FACTORS[thickness];
      const fDensity = LWA_V_DENSITY_FACTORS[effDensity];
      const fStage = LWA_V_STAGE_FACTORS[stage];
      if (fThickness !== undefined && fDensity !== undefined && fStage !== undefined && fStage > 0) {
        kLwaValPerM2 = cleanFloat(0.0377 * fThickness * fDensity * fStage);
        kLwaValPer10000M2 = cleanFloat(kLwaValPerM2 * 10000);
      }

      if (lwaResult !== null) {
        const lwaVRes = calculateLwaVFinalVolume({
          lwaM2PerHa: lwaResult,
          thicknessId: thickness,
          densityId: effDensity,
          stageId: stage
        });

        if (lwaVRes.isApplicable && lwaVRes.finalVolumeLHa !== undefined) {
          recommendedQ = Math.round(lwaVRes.finalVolumeLHa * 10) / 10;
          effectiveQ = recommendedQ;
          if (lwaVRes.theoreticalVolumeLHa !== undefined) {
            theoreticalQ = Math.round(lwaVRes.theoreticalVolumeLHa * 10) / 10;
          }
        }
      }
    } else {
      // Culturas sem modelo LWA-V: cálculo geométrico com fallback manual de volume adotado
      const lwaResult = calculateLwa(h, r, faces);
      if (lwaResult !== null) {
        lwaVal = Math.round(lwaResult);
      }

      if (inputs.useManualAdoptedVolumeInLwa && qAdopted && qAdopted > 0) {
        recommendedQ = qAdopted;
        effectiveQ = qAdopted;
        isAdoptedSprayVolume = true;
      }
    }
  } else {
    // -----------------------------------------------------------------------
    // PERCURSO TRV
    // -----------------------------------------------------------------------
    const trvResult = calculateTrv(h, w, r);
    if (trvResult !== null) {
      trvVal = Math.round(trvResult * 10) / 10;
    }

    const trvDensity: 'open' | 'moderate' | 'dense' =
      inputs.canopyDensity === 'aberta' || inputs.canopyDensity === 'open'
        ? 'open'
        : inputs.canopyDensity === 'densa' || inputs.canopyDensity === 'dense'
        ? 'dense'
        : 'moderate';

    selectedRow =
      inputs.cultureId && inputs.conductionId && inputs.phenologyId
        ? selectEppoKRow(
            inputs.cultureId,
            inputs.conductionId,
            inputs.phenologyId,
            trvDensity
          ) ?? null
        : null;

    if (trvResult !== null && selectedRow) {
      const qResult = calculateTrvSprayVolume(trvResult, selectedRow.kLPerM3);
      if (qResult !== null) {
        recommendedQ = Math.round(qResult * 10) / 10;
        effectiveQ = recommendedQ;
      }
    }
  }

  // Se a geometria primária for inválida, o resultado global é inválido
  const hasValidGeometry = isLwa ? lwaVal !== undefined : trvVal !== undefined;
  if (!hasValidGeometry) {
    return {
      isValid: false,
      method: inputs.method
    };
  }

  // Em TRV, se a combinação da matriz k for inválida ou não encontrada, o volume de calda fica indisponível
  if (!isLwa && (!selectedRow || recommendedQ === undefined)) {
    return {
      isValid: false,
      method: 'trv',
      trvM3PerHa: trvVal
    };
  }

  // -------------------------------------------------------------------------
  // CÁLCULOS DE DOSE, DEPÓSITO E ÁREA
  // -------------------------------------------------------------------------
  const doseCalculations = calculateProductDoseAndTank({
    doseType: inputs.doseType,
    doseValue: inputs.doseValue !== undefined && inputs.doseValue !== '' ? Number(inputs.doseValue) : undefined,
    doseUnit: inputs.doseUnit,
    finalTankVolumeL: vTank,
    sprayVolumeLHa: effectiveQ,
    lwaM2PerHa: lwaVal
  });

  let areaPerTank: number | undefined;
  let tanksPerHa: number | undefined;

  if (vTank && effectiveQ) {
    const area = calculateAreaPerTank(vTank, effectiveQ);
    if (area !== null) {
      areaPerTank = Math.round(area * 1000) / 1000;
    }
    const tanks = calculateTanksPerHa(effectiveQ, vTank);
    if (tanks !== null) {
      tanksPerHa = Math.round(tanks * 100) / 100;
    }
  }

  // -------------------------------------------------------------------------
  // FASE B — AJUSTE OPERACIONAL (Caudal Total, Débito por Bico, Tempo)
  // -------------------------------------------------------------------------
  let totalFlowRequiredLMin: number | undefined;
  let flowPerNozzleLMin: number | undefined;
  let theoreticalTimePerHaMinutes: number | undefined;
  let phaseBState: CalibracaoPulverizadorCalculatedOutputs['phaseBState'] = undefined;

  const speedRaw = inputs.travelSpeedKmH;
  const speed = speedRaw !== undefined && speedRaw !== '' ? Number(speedRaw) : undefined;

  const widthRaw = inputs.workingWidthM;
  const width =
    widthRaw !== undefined && widthRaw !== ''
      ? Number(widthRaw)
      : (Number.isFinite(r) && r > 0 ? r : undefined);

  const nozzleCountRaw = inputs.activeNozzleCount;
  const nozzleCount =
    nozzleCountRaw !== undefined && nozzleCountRaw !== '' ? Number(nozzleCountRaw) : undefined;

  const phaseAVolume = effectiveQ; // volCaldaRecomendado (TRV) ou volCaldaSugerido (LWA-V)

  if (!phaseAVolume || phaseAVolume <= 0) {
    phaseBState = 'missing_phase_a';
  } else if (speed === undefined || !Number.isFinite(speed) || speed <= 0) {
    phaseBState = 'missing_speed';
  } else if (width === undefined || !Number.isFinite(width) || width <= 0) {
    phaseBState = 'missing_width';
  } else {
    const qTotal = calculateRequiredTotalFlowLMin(phaseAVolume, speed, width);
    if (qTotal !== null) {
      totalFlowRequiredLMin = qTotal;

      const tMin = calculateTheoreticalTimePerHaMinutes(speed, width);
      if (tMin !== null) {
        theoreticalTimePerHaMinutes = tMin;
      }

      if (nozzleCount !== undefined && Number.isInteger(nozzleCount) && nozzleCount > 0 && nozzleCount % 2 === 0) {
        const qNozzle = calculateFlowPerNozzleLMin(qTotal, nozzleCount);
        if (qNozzle !== null) {
          flowPerNozzleLMin = qNozzle;
          phaseBState = 'complete';
        }
      } else {
        phaseBState = 'no_nozzle_count';
      }
    }
  }

  return {
    isValid: true,
    isApplicable: true,
    method: inputs.method,
    lwaM2PerHa: isLwa ? lwaVal : undefined,
    trvM3PerHa: !isLwa ? trvVal : undefined,

    // TRV
    selectedK: !isLwa && selectedRow ? selectedRow.kLPerM3 : undefined,
    adjustmentFactor: !isLwa && selectedRow ? selectedRow.adjustmentFactor : undefined,
    decisionBasis: !isLwa && selectedRow
      ? `${selectedRow.cultureLabel} · ${selectedRow.conductionLabel} · ${selectedRow.phenologyLabel} · ${selectedRow.densityLabel}`
      : undefined,
    rationale: !isLwa && selectedRow ? selectedRow.rationale : undefined,

    // Modelo LWA-V DATERRA
    lwaModel: isLwa && isVinha ? 'lwa-v-daterra-v1' : undefined,
    canopyThickness: isLwa && isVinha ? thickness : undefined,
    canopyThicknessFactor: isLwa && isVinha && thickness ? LWA_V_THICKNESS_FACTORS[thickness] : undefined,
    canopyDensityFactor: isLwa && isVinha ? LWA_V_DENSITY_FACTORS[effDensity] : undefined,
    phenologyInterval: isLwa && isVinha ? stage : undefined,
    phenologyFactor: isLwa && isVinha && stage ? LWA_V_STAGE_FACTORS[stage] : undefined,
    baseCoverageRateLPerM2: isLwa && isVinha ? 0.0377 : undefined,
    theoreticalSprayVolumeLHa: isLwa && isVinha ? theoreticalQ : undefined,
    finalSprayVolumeLHa: isLwa && isVinha ? recommendedQ : undefined,
    kLwaLPer10000M2: isLwa && isVinha ? kLwaValPer10000M2 : undefined,
    kLwaLPerM2: isLwa && isVinha ? kLwaValPerM2 : undefined,

    // Volume de Calda
    recommendedSprayVolumeLHa: recommendedQ,
    effectiveSprayVolumeLHa: effectiveQ,
    isAdoptedSprayVolume: isLwa ? isAdoptedSprayVolume : undefined,

    // Dose e Depósito
    doseEquivalentPerHaValue: doseCalculations.doseEquivalentPerHaValue !== undefined
      ? Math.round(doseCalculations.doseEquivalentPerHaValue * 1000) / 1000
      : undefined,
    doseEquivalentPerHaUnit: doseCalculations.doseEquivalentPerHaUnit,
    doseEquivalentPerHaSubValue: doseCalculations.doseEquivalentPerHaSubValue !== undefined
      ? Math.round(doseCalculations.doseEquivalentPerHaSubValue * 10) / 10
      : undefined,
    doseEquivalentPerHaSubUnit: doseCalculations.doseEquivalentPerHaSubUnit,
    productPerTankValue: doseCalculations.productPerTankValue !== undefined
      ? Math.round(doseCalculations.productPerTankValue * 1000) / 1000
      : undefined,
    productPerTankUnit: doseCalculations.productPerTankUnit,
    productPerTankSubValue: doseCalculations.productPerTankSubValue !== undefined
      ? Math.round(doseCalculations.productPerTankSubValue * 10) / 10
      : undefined,
    productPerTankSubUnit: doseCalculations.productPerTankSubUnit,
    areaPerTankHa: areaPerTank,
    tanksPerHa: tanksPerHa,
    isSolid: doseCalculations.isSolid,

    // Fase B — Ajuste Operacional
    travelSpeedKmH: speed,
    workingWidthM: width,
    activeNozzleCount: nozzleCount,
    workingWidthSource: inputs.workingWidthSource,
    totalFlowRequiredLMin: totalFlowRequiredLMin,
    flowPerNozzleLMin: flowPerNozzleLMin,
    theoreticalTimePerHaMinutes: theoreticalTimePerHaMinutes,
    phaseBState: phaseBState
  };
}
