/**
 * DATERRA Smart - Módulo Smart Débito
 * Ficheiro: src/features/smart-debito/types.ts
 *
 * Tipos e interfaces de dados para auditoria e validação de débitos
 * segundo as normas ISO 16122-2 (barras) e ISO 16122-3 (arbustivas/arbóreas).
 *
 * REGRAS ESTRITAS DE NOMENCLATURA:
 * - Termos estritamente interditos (proibidos em todo o código, variáveis e UI).
 * - A palavra "caudal" está INTERDITA na UI; utilizar sempre e exclusivamente "débito".
 */

export type SmartDebitoStandard = 'ISO_16122_3' | 'ISO_16122_2';

export type NozzleSide = 'left' | 'right';

/**
 * Identificador normalizado de slot: "${level}-${side}"
 * Exemplo: "1-left", "1-right", "7-left", etc.
 */
export type SlotKey = `${number}-${NozzleSide}`;

export interface NozzleCatalogRef {
  id?: string;
  brand: string;
  model: string;
  color: string;
  referencePressureBar: number; // P1 (bar)
  nominalFlowLMin: number;       // Q1 (l/min) à pressão P1
  sprayAngleDeg?: number | string;
  nozzleType?: string;
  swirlPlate?: string;
  disc?: string;
  isIsoNozzle?: boolean;
  isoCode?: string;
}

export type FlowMeasurementUnit = 'L/min' | 'mL/15 seg' | 'mL/30 seg';

export const FLOW_UNITS: FlowMeasurementUnit[] = ['L/min', 'mL/15 seg', 'mL/30 seg'];

/**
 * Converte valor medido na respetiva unidade para L/min.
 * - L/min: direto
 * - mL/15 seg: (raw * 4) / 1000 = raw / 250
 * - mL/30 seg: (raw * 2) / 1000 = raw / 500
 */
export function convertRawToLMin(raw: number | null | undefined, unit: FlowMeasurementUnit = 'L/min'): number | null {
  if (raw === null || raw === undefined || isNaN(raw)) return null;
  if (unit === 'mL/15 seg') {
    return Number(((raw * 4) / 1000).toFixed(4));
  }
  if (unit === 'mL/30 seg') {
    return Number(((raw * 2) / 1000).toFixed(4));
  }
  return raw;
}

/**
 * Converte valor em L/min para a unidade de entrada (para apresentação/edição nos campos input).
 * - L/min: direto
 * - mL/15 seg: lmin * 250
 * - mL/30 seg: lmin * 500
 */
export function convertLMinToRaw(lmin: number | null | undefined, unit: FlowMeasurementUnit = 'L/min'): number | null {
  if (lmin === null || lmin === undefined || isNaN(lmin)) return null;
  if (unit === 'mL/15 seg') {
    return Math.round((lmin * 1000) / 4);
  }
  if (unit === 'mL/30 seg') {
    return Math.round((lmin * 1000) / 2);
  }
  return Number(lmin.toFixed(2));
}

export interface NozzleSlot {
  id: SlotKey;
  level: number;
  side: NozzleSide;
  isActive: boolean;
  brand: string;
  model: string;
  color: string;
  referencePressureBar: number; // P1 (bar) - Catálogo
  nominalFlowLMin: number;       // Q1 (l/min) - Catálogo
  measuredFlowRate: number | null; // Débito medido oficial em l/min (utilizado em todos os cálculos ISO)
  measurementUnit?: FlowMeasurementUnit; // Unidade do input deste bico ('L/min' | 'mL/15 seg' | 'mL/30 seg')
  rawMeasuredValue?: number | null; // Valor introduzido no campo input na respetiva unidade
  swirlPlate?: string;
  disc?: string;
  isIsoNozzle?: boolean;
  isoCode?: string;
}

export type SlotEvaluationStatus =
  | 'conforming'          // Verde: desvio dentro de +/- 10%
  | 'non-conforming'      // Vermelho: desvio superior a +/- 10%
  | 'inactive'            // Cinzento: bico inativo/fechado
  | 'pending-pressure'    // Aguarda inserção da Pressão de Ensaio (P2)
  | 'pending-measurement';// Aguarda introdução do débito medido

export interface NozzleSlotEvaluation {
  slotId: SlotKey;
  targetFlowRate: number | null;     // Q2 (l/min) teórico calculado com P2
  deviationPercent: number | null;   // Desvio (%) face a Q2
  isConforming: boolean | null;      // True se |desvio| <= 10%
  status: SlotEvaluationStatus;
  statusMessage: string;
}

export interface SmartDebitoVerdict {
  // Totais medidos
  leftTotalMeasured: number;
  rightTotalMeasured: number;
  totalMeasured: number;

  // Totais teóricos alvo (Q2)
  leftTargetTotal: number;
  rightTargetTotal: number;
  totalTarget: number;

  // Desvio Global: Somatório Medido (Esq + Dir) vs Somatório Teórico Alvo
  globalDeviationPercent: number;
  isGlobalDeviationConforming: boolean; // Diferença <= 10%

  // Simetria Bilateral (Lado Esquerdo vs Lado Direito)
  sideDifferencePercent: number;
  sideSymmetryConforming: boolean; // Diferença entre lados <= 10%

  // Conformidade Individual
  activeNozzleCount: number;
  measuredNozzleCount: number;
  individualConformingCount: number;
  individualNonConformingCount: number;
  allIndividualConforming: boolean;

  // Veredito Final ISO 16122
  overallVerdict: 'CONFORME_ISO_16122' | 'NAO_CONFORME_ISO_16122' | 'PENDENTE';
  verdictSummary: string;
  failureReasons: string[];
}

export interface EnsaioRawRecord {
  lineIndex: number;         // Número de linha real no ficheiro (1-based)
  nozzleNumber: number | null;
  flowRate: number;          // Débito lido (l/min)
  pressure: number | null;   // Pressão lida (bar), se presente
  reference: string;         // Referência textual/bico
}

export interface EnsaioParseResult {
  success: boolean;
  records: EnsaioRawRecord[];
  totalLines: number;
  detectedPressure: number | null;
  hasPressureColumn: boolean;
  warnings: string[];
  error?: string;
}

/**
 * Configuração de Co-Branding Dinâmico com 3 Cores
 */
export interface CoBrandingConfig {
  isEnabled: boolean;
  companyName: string;
  logoUrl: string | null;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  // Paleta dinâmica de 3 cores
  primaryColor: string;    // Cor Principal para fundo/destaques (ex: #114037)
  secondaryColor: string;  // Cor Secundária para botões/linhas/acentos (ex: #3CA64C)
  textColor: string;       // Cor de Texto (ex: #FFFFFF)
}

export interface SectorConfig {
  id: number;
  side: 'left' | 'right' | 'center';
  numNozzles: number;
  startLineTxt?: number | null;
}

export interface SmartDebitoState {
  numLevels: number;                  // Ex: 7 níveis = 14 bicos (7 esq, 7 dir)
  standard: SmartDebitoStandard;       // ISO 16122-3 (default pomares/vinhas) ou ISO 16122-2 (barras)
  testPressureBar: number | null;      // P2: Pressão de Ensaio global (bar)
  slots: Record<string, NozzleSlot>;   // Dicionário normalizado
  numSectors: number;                 // Número de setores da barra (1 a 10)
  startSide: 'left' | 'right';        // Lado inicial do Setor 1 ('left' ou 'right')
  sectors: SectorConfig[];            // Lista de setores configurados
  fileOffset: number;                 // Linha inicial (offset) para importação de ensaio (1-based)
  importedFileName: string | null;
  lastImportedCount: number | null;
  operatorName: string;
  machineModel: string;
  machineRegistration: string;
  inspectionDate: string;
  notes: string;
  globalMeasurementUnit: FlowMeasurementUnit; // Unidade de medição selecionada ('L/min' por defeito)
  coBranding: CoBrandingConfig;
  isPremiumUser: boolean;              // Indica se possui créditos ativos (Premium vs Freemium)
  availableCredits: number;
}

export type SmartDebitoAction =
  | { type: 'SET_NUM_LEVELS'; payload: number }
  | { type: 'SET_STANDARD'; payload: SmartDebitoStandard }
  | { type: 'SET_TEST_PRESSURE'; payload: number | null }
  | { type: 'SET_GLOBAL_MEASUREMENT_UNIT'; payload: FlowMeasurementUnit }
  | { type: 'UPDATE_SLOT_UNIT'; payload: { id: SlotKey; unit: FlowMeasurementUnit } }
  | { type: 'APPLY_UNIT_TO_ALL'; payload: FlowMeasurementUnit }
  | { type: 'UPDATE_SLOT'; payload: { id: SlotKey; updates: Partial<Omit<NozzleSlot, 'id' | 'level' | 'side'>> } }
  | { type: 'TOGGLE_SLOT_ACTIVE'; payload: { id: SlotKey } }
  | { type: 'APPLY_NOZZLE_TO_ALL'; payload: NozzleCatalogRef }
  | { type: 'APPLY_NOZZLE_TO_SIDE'; payload: { side: NozzleSide; nozzle: NozzleCatalogRef } }
  | { type: 'COPY_PREVIOUS_NOZZLE'; payload: { targetId: SlotKey } }
  | { type: 'SET_FILE_OFFSET'; payload: number }
  | { type: 'APPLY_ENSAIO_DATA'; payload: { records: EnsaioRawRecord[]; offset: number; fileName?: string; detectedPressure?: number | null } }
  | { type: 'SET_MEASURED_FLOW'; payload: { id: SlotKey; flowRate: number | null } }
  | { type: 'CLEAR_MEASUREMENTS' }
  | { type: 'SET_NUM_SECTORS'; payload: number }
  | { type: 'SET_START_SIDE'; payload: 'left' | 'right' }
  | { type: 'UPDATE_SECTOR'; payload: { id: number; updates: Partial<SectorConfig> } }
  | { type: 'SET_MACHINE_INFO'; payload: Partial<Pick<SmartDebitoState, 'operatorName' | 'machineModel' | 'machineRegistration' | 'inspectionDate' | 'notes'>> }
  | { type: 'UPDATE_CO_BRANDING'; payload: Partial<CoBrandingConfig> }
  | { type: 'SET_CREDITS'; payload: number }
  | { type: 'DEDUCT_CREDIT' }
  | { type: 'RESET_STATE' };
