/**
 * DATERRA Smart - Módulo Comparador de Bicos de Pulverização (Versão 1.1)
 * Definições de Tipos e Contratos de Dados Canónicos
 */

export type DropletClassCode = 'VF' | 'F' | 'M' | 'C' | 'VC' | 'XC' | 'UC' | 'EC';

export interface DropletClassInfo {
  code: DropletClassCode;
  labelPt: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  vmdRangeUm: string;
  driftSensitivity: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa' | 'Muito Baixa' | 'Extremamente Baixa';
}

/** Níveis padronizados de sensibilidade potencial à deriva */
export type DriftSensitivityLevel =
  | 'Menor sensibilidade potencial à deriva'
  | 'Sensibilidade potencial à deriva intermédia'
  | 'Maior sensibilidade potencial à deriva'
  | 'Não disponível';

/** Escala simplificada de deriva para visualização direta em cartões */
export type ShortDriftLevel =
  | 'Deriva: Baixa'
  | 'Deriva: Média'
  | 'Deriva: Elevada'
  | 'Deriva: Não disponível';

/** Medição / ensaio de espectro de gotas (Dv10, Dv50, Dv90) disponível na fonte técnica */
export type DropletSpectrumMeasurement = {
  pressureBar: 5 | 10 | 15;
  dv10Micrometres?: number;
  dv50Micrometres?: number;
  dv90Micrometres?: number;
  sourceType: 'manufacturer' | 'laboratory' | 'technical-dataset';
  sourceLabel: string;
  isMeasured: boolean;
};

/** Origem da informação sobre deriva */
export type DriftInfoOrigin =
  | 'fabricante'
  | 'medição laboratorial'
  | 'estimativa técnica'
  | 'não disponível';

/** Origem do valor de débito */
export type FlowValueOrigin = 'tabelado' | 'estimado';

/** Ponto de débito tabelado a uma pressão específica */
export interface TabulatedFlowPoint {
  pressureBar: number;
  flowLMin: number;
}

/** Modelo Normalizado de Bico de Pulverização (Base de Dados Oficial) */
export interface Nozzle {
  id: string; // variant_id do Excel
  brand: string; // Fabricante (Albuz, TeeJet, ASJ, Lechler, Hardi, Pentair Hypro, Nozal, Braglia)
  model: string; // Modelo (ATR, XR, IDK, Disc & Core, etc.)
  modelNorm: string; // Designação completa normalizada
  isTop: boolean; // Destaque de referência no catálogo DATERRA
  nozzleType: string; // Cone vazio, Fenda, Fenda com indução de ar, etc.
  sprayFunction: string; // Arboricultura/Viticultura, Culturas Baixas, etc.
  isIsoNozzle: boolean; // Norma ISO 10625
  isoCode?: string; // ex: "01", "015", "02", "03", "04", etc.
  colorStandardType?: string; // Fabricante / ISO
  driftHazardLevel: string; // Rótulo original
  mainApplications: string; // Fungicidas/Inseticidas, Herbicidas, etc.
  notes: string; // Nota pedagógica com enquadramento DATERRA
  sprayAngleDeg?: number | string; // Ângulo de pulverização em graus
  isAnglePressureDependent?: boolean; // Se o ângulo varia com a pressão
  sprayAngleMinDeg?: number; // Ângulo mínimo quando variável
  sprayAngleMaxDeg?: number; // Ângulo máximo quando variável
  color?: string; // Cor do bico (Branco, Lilás, Castanho, Amarelo, Laranja, etc.)
  disc?: string; // Pastilha / Disco (para bicos modulares)
  swirlPlate?: string; // Repartidor / Difusor / Espiral (para bicos modulares)
  referencePressureBar: number; // Pressão nominal de referência P1 (ex: 3 bar ou 10 bar)
  nominalFlowLMin: number; // Débito nominal Q1 à pressão de referência P1
  pressureMinBar: number; // Pressão mínima de trabalho recomendada
  pressureMaxBar: number; // Pressão máxima de trabalho recomendada
  recommendedFilterMesh?: number | string; // Malha recomendada do filtro (mesh)
  dataType: string; // "oficial", etc.
  confidenceLevel: string; // "alto", etc.
  
  // Tabela de débitos nominais por patamar de pressão (quando disponível)
  flowRates?: TabulatedFlowPoint[];

  // Percentis de diâmetro de gota (VMD em micrómetros / µm) quando disponíveis
  d10_5bar_um?: number;
  d50_5bar_um?: number;
  d90_5bar_um?: number;
  d10_10bar_um?: number;
  d50_10bar_um?: number;
  d90_10bar_um?: number;
  d10_15bar_um?: number;
  d50_15bar_um?: number;
  d90_15bar_um?: number;

  // Classes de gotas tabeladas por patamar de pressão
  dropletClass5bar?: string;
  dropletClass10bar?: string;
  dropletClass15bar?: string;

  // Fonte e catálogo
  sourceBody: string; // ex: "Catálogo Albuz", "TeeJet Catalog 51A"
  sourceLink: string;
}

/** Categoria de identificação adaptativa do bico */
export type AdaptiveNozzleCategory = 'modular' | 'color_iso' | 'color_non_iso' | 'monobloc_ref';

/** Metadados comerciais de fabricante (do CSV de fabricantes e nichos) */
export interface ManufacturerInfo {
  brand: string;
  name?: string;
  country: string;
  businessGroup: string;
  niche: string;
  website?: string;
  technicalCatalog?: string;
  productLines?: string;
  declaredTechnology?: string;
  availableSources?: string;
  verificationDate?: string;
  sourceStatus?: string;
  validationStatus?: string;
}

/** Modelo de Evidência e Medição Laboratorial */
export interface LabMeasurementEvidence {
  id: string;
  entity: string;
  entityType: 'universidade' | 'laboratorio_acreditado' | 'centro_investigacao' | 'publicacao_cientifica' | 'fabricante' | 'outro';
  realEntityName: string;
  brand: string;
  model: string;
  fullReference: string;
  swirlPlate?: string;
  disc?: string;
  testPressureBar: number;
  testLiquid: string;
  method: string;
  testDate: string;
  dropletSpectrum?: string;
  driftSensitivityIndicator?: DriftSensitivityLevel;
  origin: string;
  urlOrDocument?: string;
  publicationAuthorization: boolean;
  validationStatus: 'validado' | 'pendente' | 'em_revisao';
  observations?: string;
}

/** Resultado de cálculo de um bico individual para uma dada pressão */
export interface CalculatedNozzleFlow {
  nozzle: Nozzle;
  workingPressureBar: number;
  flowLMin: number;
  valueOrigin: FlowValueOrigin; // 'tabelado' | 'estimado'
  isNominal: boolean; // Verdadeiro se a pressão for exatamente igual à pressão nominal
  isEstimated: boolean; // Verdadeiro se o débito for calculado via Q = Q_ref * sqrt(P / P_ref)
  isOutOfRange: boolean; // Verdadeiro se a pressão estiver fora de [pressureMinBar, pressureMaxBar]
  pressureWarning?: string;
  
  // Intervalo indicativo de controlo de débito (escalonado: ±15% se < 1.00 L/min, ±10% se >= 1.00 L/min)
  tolerancePercentage: number; // 15 ou 10
  deviationMinLMin: number; // Limite inferior de controlo
  deviationMaxLMin: number; // Limite superior de controlo
  
  effectiveDropletClass?: string; // Classe de gota inferida para a pressão
  dropletSpectrumLabel: string; // Rótulo descritivo do espectro de gotas
  dropletOrigin: 'fabricante' | 'medição laboratorial' | 'estimativa técnica' | 'não disponível';
  effectiveDriftSensitivity: DriftSensitivityLevel; // Sensibilidade potencial à deriva
  shortDriftLevel: ShortDriftLevel; // Escala simplificada de deriva
  driftOrigin: DriftInfoOrigin;
  driftOriginSummary: string; // Resumo da fonte da deriva
  sprayAngleText: string; // Formatação inteligente do ângulo de jato
  calculationFormula: string; // Explicação técnica da fórmula usada
  originBadgeText: string; // "Débito tabelado" ou "Débito estimado pela relação pressão–débito"
}

/** Análise da Faixa de Pressão Comum entre dois bicos */
export interface PressureRangeAnalysis {
  hasCommonRange: boolean;
  commonMinBar?: number;
  commonMaxBar?: number;
  commonRangeText: string;
  isCurrentPressureInCommonRange: boolean;
  warningNote?: string;
  isFlatFanUnderpressurized: boolean;
  flatFanUnderpressureWarning?: string;
}

/** Resumo comparativo entre dois bicos calculados */
export interface ComparisonSummaryResult {
  nozzleA: CalculatedNozzleFlow;
  nozzleB: CalculatedNozzleFlow;
  absoluteDifferenceLMin: number; // Débito B - Débito A (em L/min)
  percentageDifference: number | null; // ((Débito B - Débito A) / Débito A) * 100
  higherFlowNozzle: 'A' | 'B' | 'EQUAL';
  flowComparisonText: string;
  dropletComparisonText: string;
  driftComparisonText: string;
  pressureRangeComparisonText: string;
  pressureRangeAnalysis: PressureRangeAnalysis;
  angleComparisonText: string;
  generalRecommendation: string;
  disclaimer: string;
}

/** Cálculo de Débito Total do Conjunto (Barra de pulverização) */
export interface TotalBoomFlowCalculation {
  flowPerNozzleLMin: number;
  nozzleCount: number;
  totalBoomFlowLMin: number;
  warningNote: string;
}

/** Parâmetros de Pesquisa para o Modo "Encontrar alternativas" */
export interface AlternativeSearchParams {
  referenceNozzleId?: string;
  targetFlowLMin: number;
  workingPressureBar: number;
  tolerancePercentage: 5 | 10 | 15;
  brandFilter?: string;
  nozzleTypeFilter?: string;
  modelFilter?: string;
  sprayAngleFilter?: string | number;
  onlyTop?: boolean;
  onlyValidated?: boolean;
  cropFilter?: string;
  objectiveFilter?: string;
  preferLowDrift?: boolean;
}

/** Resultado individual de alternativa */
export interface AlternativeSearchResult {
  nozzle: Nozzle;
  calculatedFlow: CalculatedNozzleFlow;
  flowDiffLMin: number;
  flowDiffPercentage: number;
  driftSensitivity: DriftSensitivityLevel;
  shortDriftLevel: ShortDriftLevel;
  driftInfoOrigin: DriftInfoOrigin;
  driftOriginSummary: string;
  isTop: boolean;
  isExactMatch: boolean;
}

/** Modo Ativo do Módulo */
export type ActiveComparisonMode = 'comparar' | 'alternativas';

/** Estado de seleção dos bicos no comparador */
export interface NozzleComparisonState {
  activeMode: ActiveComparisonMode;
  selectedBrandA: string;
  selectedModelA: string;
  selectedSwirlPlateA?: string;
  selectedDiscA?: string;
  selectedColorA?: string;
  selectedIsoCodeA?: string;
  selectedNozzleIdA: string;

  selectedBrandB: string;
  selectedModelB: string;
  selectedSwirlPlateB?: string;
  selectedDiscB?: string;
  selectedColorB?: string;
  selectedIsoCodeB?: string;
  selectedNozzleIdB: string;

  workingPressureBar: number;
  targetFlowLMin?: number;
  boomNozzleCount?: number;
  userNotes: string;
}

/** Registo de comparação persistido no IndexedDB */
export interface SavedNozzleComparison {
  id: string; // UUID v4
  date: string; // ISO 8601
  mode: ActiveComparisonMode;
  nozzleAId: string;
  nozzleBId: string;
  nozzleAName: string;
  nozzleBName: string;
  workingPressureBar: number;
  flowALMin: number;
  flowBLMin: number;
  valueOriginA: FlowValueOrigin;
  valueOriginB: FlowValueOrigin;
  absoluteDifferenceLMin: number;
  percentageDifference: number | null;
  boomNozzleCount?: number;
  totalBoomFlowLMin?: number;
  userNotes?: string;
  createdAt: string;
  syncStatus: 'local_only' | 'synced';
}
