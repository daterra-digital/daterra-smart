// src/features/agri-chat/types.ts

export type SkillId = 
  | 'geral'
  | 'fitofarmacos'
  | 'rega'
  | 'fertilizacao'
  | 'solos'
  | 'legislacao'
  | 'globalgap'
  | 'haccp'
  | 'fisiologia'
  | 'calibracao-equipamentos';

export interface Skill {
  id: SkillId;
  name: string; // Exatamente o nome entre aspas (ex: "Fitofármacos", "Rega", "GlobalGAP")
  version: string; // Ex: "IFA v6", "2026.1", "ISO 16122 / EPPO"
  slug: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  badgeLabel: string;
  isPremium: boolean;
  monthlyPriceEur: number;
  systemPromptDomain: string;
}

export interface ActiveExplorationContext {
  cultureId?: number;
  cultureName?: string;
  cropType?: string;
  variety?: string;
  rowDistanceM?: number;
  canopyHeightM?: number;
  canopyWidthM?: number;
  trainingSystem?: string;
  equipmentId?: number;
  equipmentName?: string;
  tankCapacityL?: number;
  pumpType?: string;
  nozzleName?: string;
  nozzleColor?: string;
  calibrationSpeedKmh?: number;
  calibrationPressureBar?: number;
  calibrationVolumeLHa?: number;
}

export interface ChatActionCard {
  title: string;
  description: string;
  buttonText: string;
  url: string;
  badge?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  skillId: SkillId;
  sources?: string[];
  isGuardrailTriggered?: boolean;
  suggestedSkillId?: SkillId;
  explorationContext?: ActiveExplorationContext;
  actionCard?: ChatActionCard;
  createdAt: string;
}

export interface UserSkillSubscription {
  skillId: SkillId;
  status: 'active' | 'trial' | 'expired' | 'locked';
  monthlyQuota: number;
  queriesUsed: number;
  expiresAt?: string;
}
