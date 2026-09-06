export type FormulationGroupId = 
  | 'agua' 
  | 'solidos' 
  | 'liquidos' 
  | 'solucoes' 
  | 'adjuvantes';

export interface FormulationGroupInfo {
  id: FormulationGroupId;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  faqTopic: string;
}

export interface FormulationItem {
  id: string; // e.g. 'H2O', 'PH', 'WG', 'SC', 'EC', 'AD'
  number: number; // 1 a 32
  group: string;
  groupId: FormulationGroupId;
  sigla: string;
  name: string;
  shortDescription: string;
  information: string;
  faqTopic?: string;
  badgeColor?: string;
  isBaseWater?: boolean;
}

export type SequenceStepType = 
  | 'water_initial' 
  | 'conditioner' 
  | 'solid' 
  | 'liquid' 
  | 'solution' 
  | 'water_final' 
  | 'adjuvant';

export interface SequenceStep {
  id: string;
  stepNumber: number;
  originalNumber?: number;
  type: SequenceStepType;
  title: string;
  subtitle?: string;
  group: string;
  groupId: FormulationGroupId;
  sigla?: string;
  name?: string;
  instruction: string;
  information?: string;
  faqTopic?: string;
  waterPercent?: number;
  waterVolumeL?: number;
  formulationId?: string;
  isMandatory?: boolean;
  isWater?: boolean;
}

export interface MixingSequenceAnalysis {
  steps: SequenceStep[];
  selectedCount: number;
  hasWaterInitial: boolean;
  hasConditioners: boolean;
  hasSolids: boolean;
  hasLiquids: boolean;
  hasSolutions: boolean;
  hasWaterFinal: boolean;
  hasAdjuvants: boolean;
  hasAntiDrift: boolean;
  hasOil: boolean;
  tankCapacityL?: number;
  waterInitialL?: number;
  waterFinalL?: number;
  warnings: string[];
  recommendations: string[];
}
