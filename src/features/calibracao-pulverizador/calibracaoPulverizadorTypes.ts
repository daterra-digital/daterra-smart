/**
 * DATERRA Smart - Tipos TypeScript para a Ferramenta de Calibração Pulverizador
 * Fase A: Planeamento de volume de calda e produto por LWA/TRV — EPPO
 * Fase B: Ajuste Operacional (Caudal Total e Débito por Bico)
 * Fase C: Seleção de Bicos e Pressão de Trabalho
 */

export type CalibracaoMetodo = 'lwa' | 'trv';

import type {
  LwaVThicknessId,
  CanopyDensityId,
  LwaVStageId
} from './data/lwaVDaterraConfig.ts';
import type { NozzleCatalogEntry } from './data/nozzleCatalog.ts';

export type {
  LwaVThicknessId,
  CanopyDensityId,
  LwaVStageId
};

export type CanopyDensityTierId = 'aberta' | 'moderada' | 'densa' | 'open' | 'moderate' | 'dense';

export type DoseType = 'dose_ha' | 'dose_100l' | 'concentration' | 'dose_lwa';

export type DoseUnitDoseHa = 'mL/ha' | 'L/ha' | 'g/ha' | 'kg/ha';
export type DoseUnitDose100L = 'mL/100 L' | 'L/100 L' | 'g/100 L' | 'kg/100 L';
export type DoseUnitConcentration = '%' | 'mL/hL' | 'L/hL' | 'g/hL' | 'kg/hL';
export type DoseUnitDoseLwa =
  | 'mL/10 000 m² LWA'
  | 'L/10 000 m² LWA'
  | 'g/10 000 m² LWA'
  | 'kg/10 000 m² LWA';

export type ProductDoseUnit =
  | DoseUnitDoseHa
  | DoseUnitDose100L
  | DoseUnitConcentration
  | DoseUnitDoseLwa;

export interface CalibracaoPulverizadorRawInputs {
  method: CalibracaoMetodo;

  // Contexto Agronómico (Obrigatório em TRV para obter k; Opcional/Recomendado em LWA para contexto)
  cultureId?: string;
  conductionId?: string;
  phenologyId?: string;
  canopyDensity?: CanopyDensityTierId;

  // Parâmetros LWA-V DATERRA (Vinha em Espaldeira)
  canopyThickness?: LwaVThicknessId;
  phenologyStage?: LwaVStageId;

  // Geometria da Vegetação
  treatedHeightM?: number | string;       // h (m) - Ambos
  rowSpacingM?: number | string;          // r (m) - Ambos
  treatedSides?: 1 | 2;                   // faces (1 ou 2) - LWA exclusivo (fixo 2 no LWA-V de Vinha)
  canopyWidthM?: number | string;         // w (m) - TRV exclusivo

  // Volume do Depósito e Volume Adotado
  finalTankVolumeL?: number | string;     // "Volume final de calda a preparar" (L)
  adoptedSprayVolumeLHa?: number | string;// "Volume de calda adotado" (L/ha) - LWA manual para culturas sem LWA-V
  useManualAdoptedVolumeInLwa?: boolean;  // Flag explícita para ativar volume adotado manual no LWA (quando não há LWA-V)

  // Dose do Rótulo
  doseType?: DoseType;
  doseValue?: number | string;
  doseUnit?: ProductDoseUnit | string;

  // Fase B — Ajuste Operacional
  travelSpeedKmH?: number | string;       // S (km/h) - Velocidade de avanço
  workingWidthM?: number | string;        // W (m) - Largura de trabalho
  activeNozzleCount?: number | string;    // N (inteiro par positivo) - Número de bicos ativos
  workingWidthSource?: 'auto-row-spacing' | 'manual';
}

export interface CalibracaoPulverizadorCalculatedOutputs {
  isValid: boolean;
  method: CalibracaoMetodo;
  isApplicable?: boolean;                 // false se estádio for repouso (int_1)

  // Geometria
  lwaM2PerHa?: number;                    // m² LWA/ha
  trvM3PerHa?: number;                    // m³ TRV/ha

  // Decisão k (TRV)
  selectedK?: number;                     // L/m³
  adjustmentFactor?: number;              // 0.75 | 0.85 | 1.00 (visual descritivo)
  decisionBasis?: string;                 // ex: "Vinha · Espaldeira · Pintor à maturação · Moderada"
  rationale?: string;

  // Modelo LWA-V DATERRA (LWA Vinha)
  lwaModel?: 'lwa-v-daterra-v1' | 'lwa_v_daterra_v1';
  canopyThickness?: LwaVThicknessId;
  canopyThicknessFactor?: number;
  canopyDensityFactor?: number;
  phenologyInterval?: LwaVStageId;
  phenologyFactor?: number;
  baseCoverageRateLPerM2?: number;        // 0.0377
  theoreticalSprayVolumeLHa?: number;     // V_teorico (L/ha)
  finalSprayVolumeLHa?: number;           // V_final (L/ha) - idêntico a recommendedSprayVolumeLHa
  kLwaLPer10000M2?: number;
  kLwaLPerM2?: number;

  // Volume de Calda (L/ha)
  recommendedSprayVolumeLHa?: number;     // Volume sugerido/recomendado (L/ha)
  effectiveSprayVolumeLHa?: number;       // volume considerado para cálculos derivados (L/ha)
  isAdoptedSprayVolume?: boolean;         // true se o volume veio de introdução manual

  // Dose e Depósito
  doseEquivalentPerHaValue?: number;      // Primário (L/ha ou kg/ha ou mL/ha ou g/ha)
  doseEquivalentPerHaUnit?: string;
  doseEquivalentPerHaSubValue?: number;   // Submétrica de conveniência na mesma família
  doseEquivalentPerHaSubUnit?: string;

  productPerTankValue?: number;           // Primário (L ou kg ou mL ou g)
  productPerTankUnit?: string;
  productPerTankSubValue?: number;        // Submétrica na mesma família (ex: mL quando primário é L)
  productPerTankSubUnit?: string;

  areaPerTankHa?: number;                 // ha tratada por depósito
  tanksPerHa?: number;                    // depósitos necessários por ha

  // Família do produto
  isSolid?: boolean;                      // true = família massa (g/kg), false = família volume (mL/L)

  // Fase B — Ajuste Operacional
  travelSpeedKmH?: number;
  workingWidthM?: number;
  activeNozzleCount?: number;
  workingWidthSource?: 'auto-row-spacing' | 'manual';
  totalFlowRequiredLMin?: number;         // Qtotal (L/min)
  flowPerNozzleLMin?: number;             // Qbico (L/min por bico)
  theoreticalTimePerHaMinutes?: number;   // Tempo (min/ha)
  phaseBState?: 'complete' | 'missing_phase_a' | 'missing_speed' | 'missing_width' | 'no_nozzle_count';
}

/**
 * Fase C — Seleção de bicos e pressão de trabalho
 */
export interface NozzleSelectionFilters {
  manufacturers: string[]; // Até 3 fabricantes
  familyPreference: 'hollow-cone' | 'full-cone' | 'all';
}

export interface NozzleSelectionOption {
  entry: NozzleCatalogEntry;
  targetOutputLMin: number;
  estimatedOutputLMin: number;
  differenceAbsoluteLMin: number;
  differencePercent: number;
  isNominal: boolean;
}

export interface SelectedProfileSummary {
  requiredTotalOutputLMin: number;
  selectedNominalTotalOutputLMin: number;
  absoluteDifferenceLMin: number;
  differencePercent: number;
}

export interface PhaseCSelectionState {
  distributionMode: 'uniform' | 'custom';
  workingPressureBar: number;
  outputProfile: number[]; // Débitos por nível (nível 1 na base, índice 0)
  lockedLevels: boolean[];  // Níveis com bloqueio de valor
  filters: NozzleSelectionFilters;
  selectedNozzlesByLevel: Record<number, NozzleCatalogEntry | null>;
  suggestedAlternativeProfile: number[] | null;
}
