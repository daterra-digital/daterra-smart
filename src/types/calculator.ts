/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Contratos de Dados, Tipos Físicos, Histórico e Calibração
 * Fase 1 - Fundação de Tipos
 */

// ==========================================
// 1. GRANDEZAS FÍSICAS E UNIDADES CANÓNICAS
// ==========================================

export type PhysicalDimension =
  | 'volume'             // L, mL, m³, gal
  | 'area'               // ha, m²
  | 'mass'               // kg, g, t
  | 'length'             // m, cm, mm
  | 'speed'              // km/h, m/s
  | 'pressure'           // bar, kPa, psi
  | 'application_rate'   // L/ha, kg/ha, mL/ha, g/ha
  | 'concentration'      // %, mL/hL, g/hL, L/hL, kg/hL
  | 'flow_rate'          // L/min, mL/min, L/h
  | 'foliar_wall_area'   // m² LWA/ha
  | 'tree_row_volume'    // m³ TRV/ha
  | 'volume_per_volume'  // L/m³
  | 'percentage'         // %
  | 'count'              // unidades inteiras
  | 'time'               // s, min, h
  | 'text'               // texto livre
  | 'date';              // data ISO 8601

/**
 * Valor Estruturado Canónico:
 * O valor e a unidade são indissociáveis. A grandeza física e a chave canónica
 * garantem que o valor não é interpretado erroneamente por outras ferramentas.
 */
export interface StructuredValue {
  /** Valor tal como introduzido ou calculado */
  rawValue: number | string;
  /** Unidade explícita apresentada ao utilizador (ex: 'L/ha', 'mL/hL') */
  unit: string;
  /**
   * Valor normalizado para unidade padrão da grandeza física
   * NOTA: Presente apenas para grandezas simples com conversão direta.
   * Para grandezas compostas dependentes de contexto, pode ser null/undefined.
   */
  normalizedValue?: number | null;
  /** Unidade base correspondente à normalização simples (ex: 'L', 'm') */
  normalizedUnit?: string | null;
  /** Valor auxiliar opcional para apresentação secundária (ex: 10000 para 10,00 L) */
  subValue?: number | string | null;
  /** Unidade auxiliar correspondente (ex: 'mL' para L, 'g' para kg) */
  subUnit?: string | null;
  /** Grandeza física canónica */
  dimension: PhysicalDimension;
  /** Chave do catálogo de variáveis canónicas partilhadas */
  canonicalKey: string;
  /** Rótulo legível para apresentação em relatórios */
  label: string;
  /** Origem do valor: entrada do utilizador ou resultado de cálculo */
  source: 'user_input' | 'calculated_output' | 'imported_from_history' | 'preset_default';
  /** Identificador local do campo dentro da calculadora específica */
  localId: string;
  /** ID da calculadora de origem */
  calculatorId: string;
  /** Versão semântica da calculadora de origem */
  calculatorVersion: string;
  /** Snapshot textual da etiqueta ou opção selecionada (ex: em campos de seleção) */
  labelSnapshot?: string;
}

// ==========================================
// 2. CONTEXTO AGRONÓMICO E CALIBRAÇÃO
// ==========================================

export type OperationType =
  | 'simple_calculation'       // Cálculo expedito de rotina no campo
  | 'new_calibration'          // Cálculo promovido a origem de uma calibração
  | 'calibration_adjustment';  // Ensaio de ajuste a uma calibração existente

export interface CalculationContext {
  farmId?: string | null;
  cultureProfileIds?: string[];
  plotProfileIds?: string[];
  equipmentProfileIds?: string[];
  calibrationProfileIds?: string[];
  nozzleProfileIds?: string[];

  operationType: OperationType;

  /** Relação ao cálculo original em caso de recálculo ou ajuste */
  parentCalculationId?: string | null;
  /** Relação à calibração de origem quando se trata de um ensaio de ajuste */
  parentCalibrationId?: string | null;
}

export type CalibrationStatus = 'draft' | 'active' | 'superseded' | 'archived';

/**
 * Entidade de Calibração de Equipamento
 * Relação: Equipamento -> Configuração de Bicos -> Calibração -> Cálculos de Origem/Ajuste
 */
export interface CalibrationProfile {
  id: string;                                   // UUID v4
  userId: string;                               // Obrigatório: utilizador autenticado
  equipmentProfileId: string;                   // ID do pulverizador / atomizador
  nozzleProfileIds: string[];                   // Lista de bicos na barra ou arco
  
  sourceCalculationId?: string | null;          // Cálculo que deu origem à calibração
  latestAdjustmentCalculationId?: string | null;// Último ensaio de aferição
  cultureProfileId?: string | null;             // Cultura associada (opcional)
  plotProfileId?: string | null;                // Parcela associada (opcional)

  name: string;                                 // Designação (ex: "Vinha - Floração - Bico Amarelo")
  targetSpeedKmh?: number;                      // Velocidade de trabalho aferida
  targetPressureBar?: number;                   // Pressão de serviço manométrica
  calculatedSprayVolumeLha: number;             // Volume de calda obtido (L/ha)
  totalFlowLmin: number;                        // Débito total da barra (L/min)
  
  status: CalibrationStatus;
  notes?: string;

  createdAt: string;                            // ISO 8601 UTC
  updatedAt: string;                            // ISO 8601 UTC
  syncStatus: 'local_only' | 'pending_sync' | 'synced' | 'conflict';
  syncedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
}

// ==========================================
// 3. CONTRATO DO HISTÓRICO LOCAL (DEXIE)
// ==========================================

export type SyncStatus = 'local_only' | 'pending_sync' | 'synced' | 'conflict' | 'error';

/**
 * Marcador interno de migração técnica para registos históricos anteriores.
 * REGRAS ESTRITAS:
 * 1. NÃO é uma conta de utilizador.
 * 2. NÃO é enviado para o Supabase.
 * 3. NÃO é utilizado em filtros normais de histórico.
 * 4. Novos cálculos NUNCA podem ter este marcador como userId.
 * 5. Os registos históricos antigos permanecem na tabela legada sem migração automática.
 *    Apenas após confirmação do utilizador numa futura ação "Importar histórico anterior"
 *    é que recebem o userId real e são copiados para calculation_history_v2.
 */
export const LEGACY_UNASSIGNED_MARKER = 'legacy_local_unassigned' as const;

/**
 * Registo Canónico de Cálculo no Histórico
 * O utilizador autentica-se pelo menos uma vez online e a identidade mínima
 * é persistida localmente. Novos cálculos offline ficam sempre vinculados ao userId local.
 */
export interface CalculationHistoryRecord {
  id: string;                                   // UUID v4 universal
  userId: string;                               // Obrigatório: Utilizador autenticado (nunca null)
  calculatorId: string;                         // ex: 'calc_dose', 'calc_concentracao'
  calculatorVersion: string;                    // Versão semântica (ex: '1.0.0')

  /** Metadados opcionais geridos na janela de histórico */
  name?: string;                                // Nome curto opcional
  notes?: string;                               // Notas livres de campo
  tags?: string[];                              // Etiquetas (sugeridas ou personalizadas)

  /** Entradas e Resultados Estruturados */
  inputs: Record<string, StructuredValue>;
  outputs: Record<string, StructuredValue>;

  /** Contexto agronómico opcional */
  context?: CalculationContext;

  /** Rastreabilidade de Recalculação */
  parentCalculationId?: string | null;

  /** Timestamps ISO 8601 UTC */
  createdAt: string;
  updatedAt: string;

  /** Controlo de Sincronização Supabase e Soft Delete */
  syncStatus: SyncStatus;
  syncedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
}

// ==========================================
// 4. ETIQUETAS SUGERIDAS POR DEFEITO
// ==========================================

export const DEFAULT_SUGGESTED_TAGS = [
  'Vinha',
  'Pomar',
  'Olival',
  'Culturas Baixas',
  'Tratamento Fungicida',
  'Tratamento Inseticida',
  'Herbicida',
  'Calibração',
  'Ensaio',
  'Formação'
] as const;

export type SuggestedTag = typeof DEFAULT_SUGGESTED_TAGS[number];

// ==========================================
// 5. REGRAS DE QUOTA DO HISTÓRICO
// ==========================================

export const MAX_ACTIVE_CALCULATIONS_PER_TOOL = 20;

export interface HistoryQuotaStatus {
  totalActive: number;
  maxAllowed: number;
  isLimitReached: boolean;
  canSaveDirectly: boolean;
}
