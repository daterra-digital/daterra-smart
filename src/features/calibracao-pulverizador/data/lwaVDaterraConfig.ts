/**
 * DATERRA Smart - Modelo Paramétrico LWA-V DATERRA
 * Enquadramento: EPPO PP 1/239 LWA Geometry & DATERRA Decision Model
 * 
 * Este modelo substitui a matriz discreta kLWA como motor ativo de cálculo
 * de volume de calda automático para Vinha em Espaldeira.
 * 
 * Fórmulas canónicas:
 *   LWA = (altura * 2 * 10000) / entrelinha
 *   V_teorico = LWA * 0.0377 * F_espessura * F_densidade * F_estadio
 *   V_final = V_teorico
 */

export const LWA_V_DATERRA_METADATA = {
  id: 'lwa-v-daterra-v1',
  version: '1.0.0',
  appliesTo: {
    method: 'lwa',
    culture: 'vinha',
    conduction: 'espaldeira'
  },
  baseCoverageRateLPerM2: 0.0377,
  baseCoverageRateLPer10000M2: 377,
  sourceType: 'DATERRA technical decision model',
  eppoContext: 'EPPO PP 1/239 LWA geometry and dose-expression framework',
  disclaimer:
    'Modelo técnico DATERRA para apoio ao planeamento. Não substitui o rótulo do produto, a calibração efetiva do equipamento, a legislação aplicável ou a decisão do técnico responsável.'
} as const;

export const LWA_V_THICKNESS_FACTORS = {
  estreita: 1.0,
  media: 1.3,
  larga: 1.55
} as const;

export const LWA_V_DENSITY_FACTORS = {
  aberta: 0.8,
  moderada: 0.95,
  densa: 1.1
} as const;

export const LWA_V_STAGE_FACTORS = {
  int_1: 0.0,
  int_2: 0.4,
  int_3: 0.6,
  int_4: 0.75,
  int_5: 1.0
} as const;

export type LwaVThicknessId = 'estreita' | 'media' | 'larga';
export type CanopyDensityId = 'aberta' | 'moderada' | 'densa';
export type LwaVStageId = 'int_1' | 'int_2' | 'int_3' | 'int_4' | 'int_5';

export interface LwaVThicknessOption {
  id: LwaVThicknessId;
  labelKey: string;
  fallbackLabel: string;
  factor: number;
  descKey: string;
  fallbackDesc: string;
}

export interface LwaVDensityOption {
  id: CanopyDensityId;
  labelKey: string;
  fallbackLabel: string;
  factor: number;
  descKey: string;
  fallbackDesc: string;
}

export interface LwaVStageOption {
  id: LwaVStageId;
  labelKey: string;
  fallbackLabel: string;
  factor: number;
  isResting?: boolean;
}

export const LWA_V_THICKNESS_OPTIONS: LwaVThicknessOption[] = [
  {
    id: 'estreita',
    labelKey: 'calibracaoPulverizador.thinCanopy',
    fallbackLabel: 'Estreita',
    factor: 1.0,
    descKey: 'calibracaoPulverizador.thinCanopyDesc',
    fallbackDesc: '< 0,50 m'
  },
  {
    id: 'media',
    labelKey: 'calibracaoPulverizador.mediumCanopyThickness',
    fallbackLabel: 'Média',
    factor: 1.3,
    descKey: 'calibracaoPulverizador.mediumCanopyThicknessDesc',
    fallbackDesc: '0,50 m a 0,80 m'
  },
  {
    id: 'larga',
    labelKey: 'calibracaoPulverizador.wideCanopy',
    fallbackLabel: 'Larga',
    factor: 1.55,
    descKey: 'calibracaoPulverizador.wideCanopyDesc',
    fallbackDesc: '> 0,80 m'
  }
];

export const LWA_V_DENSITY_OPTIONS: LwaVDensityOption[] = [
  {
    id: 'aberta',
    labelKey: 'calibracaoPulverizador.openCanopy',
    fallbackLabel: 'Aberta',
    factor: 0.8,
    descKey: 'calibracaoPulverizador.openCanopyDesc',
    fallbackDesc: 'A luz e o ar atravessam facilmente a vegetação.'
  },
  {
    id: 'moderada',
    labelKey: 'calibracaoPulverizador.moderateCanopy',
    fallbackLabel: 'Moderada',
    factor: 0.95,
    descKey: 'calibracaoPulverizador.moderateCanopyDesc',
    fallbackDesc: 'A vegetação apresenta uma cobertura intermédia.'
  },
  {
    id: 'densa',
    labelKey: 'calibracaoPulverizador.denseCanopy',
    fallbackLabel: 'Densa',
    factor: 1.1,
    descKey: 'calibracaoPulverizador.denseCanopyDesc',
    fallbackDesc: 'A vegetação é compacta e exige maior penetração.'
  }
];

export const LWA_V_STAGE_OPTIONS: LwaVStageOption[] = [
  {
    id: 'int_1',
    labelKey: 'calibracaoPulverizador.stageDormancyCottonBud',
    fallbackLabel: 'Repouso a olho de algodão',
    factor: 0.0,
    isResting: true
  },
  {
    id: 'int_2',
    labelKey: 'calibracaoPulverizador.stageYoungLeavesFreeLeaves',
    fallbackLabel: 'Folhas jovens a folhas livres',
    factor: 0.4
  },
  {
    id: 'int_3',
    labelKey: 'calibracaoPulverizador.stageClustersToFlowering',
    fallbackLabel: 'Cachos visíveis a floração',
    factor: 0.6
  },
  {
    id: 'int_4',
    labelKey: 'calibracaoPulverizador.stageBerryToPea',
    fallbackLabel: 'Bago de chumbo a ervilha',
    factor: 0.75
  },
  {
    id: 'int_5',
    labelKey: 'calibracaoPulverizador.stageClosureToMaturity',
    fallbackLabel: 'Fecho do cacho à maturação',
    factor: 1.0
  }
];
