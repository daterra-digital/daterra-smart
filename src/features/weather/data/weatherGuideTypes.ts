// src/features/weather/data/weatherGuideTypes.ts
export type GuideTopicId =
  | 'compreender'
  | 'ferramenta'
  | 'pulverizacao'
  | 'indicadores'
  | 'fontes';

export interface GuideTopic {
  id: GuideTopicId;
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export interface GuideQuestion {
  id: string;
  topicId: GuideTopicId;
  question: string;
  directAnswer: string;
  daterraFunctioning: string;
  technicalGuidance: string;
  sourceCitations?: string[];
}
