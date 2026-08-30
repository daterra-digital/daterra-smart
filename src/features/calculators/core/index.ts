/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Ponto Único de Exportação da Fase 2 (Núcleo Reutilizável)
 */

export * from './types.ts';
export * from './canonicalVariables.ts';
export * from './unitTransformations.ts';
export * from './historyService.ts';

export { UniversalCalculatorTemplate } from './UniversalCalculatorTemplate.tsx';
export type { UniversalCalculatorTemplateProps } from './UniversalCalculatorTemplate.tsx';

export { CalculatorHeader } from './CalculatorHeader.tsx';
export type { CalculatorHeaderProps } from './CalculatorHeader.tsx';

export { CalculatorInputsPanel } from './CalculatorInputsPanel.tsx';
export type { CalculatorInputsPanelProps } from './CalculatorInputsPanel.tsx';

export { CalculatorInputField } from './CalculatorInputField.tsx';
export type { CalculatorInputFieldProps } from './CalculatorInputField.tsx';

export { CalculatorResultsPanel } from './CalculatorResultsPanel.tsx';
export type { CalculatorResultsPanelProps, ResultDisplayItem } from './CalculatorResultsPanel.tsx';

export { CalculatorResultCard } from './CalculatorResultCard.tsx';
export type { CalculatorResultCardProps } from './CalculatorResultCard.tsx';
