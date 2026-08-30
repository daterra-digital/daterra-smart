/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Tipos e Contratos Oficiais de Reutilização Canónica de Dados ("Usar noutra ferramenta")
 * Fase 6A - Fundação Técnica da Reutilização Segura de Dados
 */

import type { StructuredValue, PhysicalDimension } from '../../../types/calculator.ts';

export type CompatibilityStatus =
  | 'direct_match'         // Mesma canonicalKey e mesma dimensão/unidade (compatível diretamente)
  | 'convertible'          // Mesma canonicalKey e mesma dimensão com conversão linear homologada
  | 'conditional_rule'     // Requer variável de contexto ou regra agronómica explícita (bloqueado sem regra)
  | 'incompatible'         // Grandezas ou dimensões físicas incompatíveis (rejeitado categoricamente)
  | 'missing_in_target';   // Campo da calculadora de destino não alimentado pela origem (fica em branco)

export interface FieldTransferCandidate {
  sourceFieldId: string;
  sourceCanonicalKey: string;
  sourceDimension: PhysicalDimension;
  sourceLabel: string;
  sourceValue: StructuredValue;

  targetFieldId: string;
  targetCanonicalKey: string;
  targetDimension: PhysicalDimension;
  targetLabel: string;
  targetUnit: string;

  status: CompatibilityStatus;
  reasonPt: string;
  previewValue: number | string;
  previewUnit: string;
}

export interface UnfilledTargetField {
  targetFieldId: string;
  targetCanonicalKey: string;
  targetDimension: PhysicalDimension;
  targetLabel: string;
  targetUnit: string;
  reasonPt: string;
}

export interface IncompatibleSourceValue {
  sourceFieldId: string;
  sourceCanonicalKey: string;
  sourceDimension: PhysicalDimension;
  sourceLabel: string;
  sourceValue: StructuredValue;
  reasonPt: string;
}

export interface ToolTransferPreview {
  targetCalculatorId: string;
  targetCalculatorTitle: string;
  targetCalculatorCategory: string;
  isTransferReady: boolean; // false na Fase 6A (apenas pré-visualização informativa)
  compatibleFields: FieldTransferCandidate[];
  unfilledTargetFields: UnfilledTargetField[];
  incompatibleSourceValues: IncompatibleSourceValue[];
  operationalNoticePt: string;
}
