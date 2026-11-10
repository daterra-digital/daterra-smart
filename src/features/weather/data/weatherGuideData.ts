// src/features/weather/data/weatherGuideData.ts
import type { GuideQuestion, GuideTopicId } from './weatherGuideTypes.ts';
import { GENERAL_GUIDE_QUESTIONS } from './weatherGuideGeneralQuestions.ts';
import { SPRAY_GUIDE_QUESTIONS } from './weatherGuideSprayQuestions.ts';

export * from './weatherGuideTypes.ts';
export { GUIDE_TOPICS } from './weatherGuideTopics.ts';

export const ALL_GUIDE_QUESTIONS: GuideQuestion[] = [
  ...GENERAL_GUIDE_QUESTIONS,
  ...SPRAY_GUIDE_QUESTIONS
];

export function getQuestionsByTopic(topicId?: GuideTopicId | 'all'): GuideQuestion[] {
  if (!topicId || topicId === 'all') {
    return ALL_GUIDE_QUESTIONS;
  }
  return ALL_GUIDE_QUESTIONS.filter((q) => q.topicId === topicId);
}

export function searchGuideQuestions(query: string, topicId?: GuideTopicId | 'all'): GuideQuestion[] {
  const baseQuestions = getQuestionsByTopic(topicId);
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return baseQuestions;

  return baseQuestions.filter((q) =>
    q.question.toLowerCase().includes(cleanQ) ||
    q.directAnswer.toLowerCase().includes(cleanQ) ||
    q.daterraFunctioning.toLowerCase().includes(cleanQ) ||
    q.technicalGuidance.toLowerCase().includes(cleanQ)
  );
}
