export type EvaluationStyle = 'iso_16122' | 'dgav_oficial';

export type EquipmentTypeId =
  | 'barras_horizontais'
  | 'culturas_arbustivas'
  | 'pistolas_pulverizacao'
  | 'pulverizador_fixo'
  | 'drones_uas'
  | 'polvilhador';

export type EvaluationMode = 'expresso' | 'detalhado';

export type ItemStatus = 'conforme' | 'anomalia' | 'pendente';

export type SubQuestionAnswer = ItemStatus | null;

export type EquipmentIconName = 'Tractor' | 'Fan' | 'SprayCan' | 'Factory' | 'Wind' | 'Plane';

export interface PreInspectionSubQuestion {
  id: string;
  subpergunta: string;
  informacaoSub: string;
  dicaSub: string;
  falhas: string;
}

export interface PreInspectionCategory {
  id: string;
  tipoEquipamento: EquipmentTypeId;
  categoria: string;
  perguntaGlobal: string;
  informacao: string;
  dica: string;
  subperguntas: PreInspectionSubQuestion[];
}

export interface EquipmentOption {
  id: EquipmentTypeId;
  title: string;
  subtitle: string;
  normativeRef?: string;
  iconName: EquipmentIconName;
  disabled?: boolean;
}

export interface InspecaoEvaluationResult {
  totalItems: number;
  conformeCount: number;
  anomaliaCount: number;
  pendenteCount: number;
  conformityPct: number;
  status: 'aprovado' | 'reprovado' | 'atencao';
  statusLabel: string;
  alertLevel: 'success' | 'warning' | 'danger';
  recommendation: string;
  isValid: boolean;
  equipmentId?: EquipmentTypeId;
  evaluationStyle?: EvaluationStyle;
}

export interface PreInspectionSavedRecord {
  id: string;
  dateIso: string;
  equipmentId: EquipmentTypeId;
  equipmentTitle: string;
  conformityPct: number;
  conformeCount: number;
  anomaliaCount: number;
  totalSubQuestions: number;
  answers: Record<string, SubQuestionAnswer>;
  evaluationStyle?: EvaluationStyle;
}
