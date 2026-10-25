import React from 'react';
import type { EvaluationMode, ItemStatus, PreInspectionCategory, SubQuestionAnswer } from './types/inspecaoTypes';
import { getCategoriesByEquipment } from './data/inspectionDataLoader';
import { CategoryAccordionCard } from './CategoryAccordionCard';

export interface InspecaoChecklistPanelProps {
  categories?: PreInspectionCategory[];
  mode?: EvaluationMode;
  answers: Record<string, SubQuestionAnswer>;
  openCategoryId?: string | null;
  onToggleCategory?: (catId: string) => void;
  onMarkCategoryAllConforme?: (catId: string) => void;
  onOpenCategoryForAnomalies?: (catId: string) => void;
  onAnswerSubQuestion?: (subId: string, status: 'conforme' | 'anomalia') => void;
  onSetAnswer?: (id: string, status: ItemStatus) => void;
  onMarkAllConforme?: () => void;
  onOpenGuide?: () => void;
}

export const InspecaoChecklistPanel: React.FC<InspecaoChecklistPanelProps> = ({
  categories = getCategoriesByEquipment('barras_horizontais'),
  mode = 'expresso',
  answers,
  openCategoryId = null,
  onToggleCategory = () => {},
  onMarkCategoryAllConforme = () => {},
  onOpenCategoryForAnomalies = () => {},
  onAnswerSubQuestion = () => {},
  onSetAnswer
}) => {
  const handleAnswer = (subId: string, status: 'conforme' | 'anomalia') => {
    if (onSetAnswer) onSetAnswer(subId, status);
    onAnswerSubQuestion(subId, status);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {categories.map((category) => (
        <CategoryAccordionCard
          key={category.id}
          category={category}
          mode={mode}
          isExpanded={openCategoryId === category.id}
          onToggleExpand={() => onToggleCategory(category.id)}
          answers={answers}
          onMarkCategoryAllConforme={onMarkCategoryAllConforme}
          onOpenCategoryForAnomalies={onOpenCategoryForAnomalies}
          onAnswerSubQuestion={handleAnswer}
        />
      ))}
    </div>
  );
};
