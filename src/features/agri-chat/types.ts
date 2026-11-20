// src/features/agri-chat/types.ts
import type { EquipmentType } from '../../schemas/equipment.schema.ts';
import type { ActiveAgronomicContext } from '../../types/calibration-audit.ts';

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
  phenologicalStage?: string;
  lwaM2Ha?: number;
  trvM3Ha?: number;
  recommendedSprayVolumeLHa?: number;
  equipmentId?: number;
  equipmentRecordId?: string;
  equipmentName?: string;
  equipmentType?: EquipmentType;
  equipmentTypeBadge?: '2D' | '3D' | 'UAV' | 'Manual';
  equipmentOperationalSummary?: string;
  equipmentAirSummary?: string;
  equipmentIppBadge?: string;
  equipmentIppTone?: 'emerald' | 'amber' | 'rose' | 'slate';
  equipmentIppSummary?: string;
  equipmentAiSummary?: string;
  equipmentContextActive?: boolean;
  tankCapacityL?: number;
  pumpType?: string;
  nozzleName?: string;
  nozzleColor?: string;
  calibrationSpeedKmh?: number;
  calibrationPressureBar?: number;
  calibrationVolumeLHa?: number;
  nozzleProfileId?: string;
  nozzleProfileSummary?: string;
  nozzleContextActive?: boolean;
  cultureContextActive?: boolean;
  calibrationContextActive?: boolean;
  agronomicContext?: ActiveAgronomicContext;
  agronomicContextSummary?: string;
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
