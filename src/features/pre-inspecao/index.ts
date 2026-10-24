export {
  EQUIPMENT_OPTIONS,
  PRE_INSPECTION_CATEGORIES,
  PRE_INSPECTION_MOCK_CATEGORIES,
  getCategoriesByEquipment,
  type EquipmentTypeId,
  type EvaluationMode,
  type SubQuestionAnswer,
  type PreInspectionCsvRow,
  type PreInspectionSubQuestion,
  type PreInspectionCategory,
  type EquipmentOption
} from './preInspectionData';

export {
  loadPreInspectionHistory,
  savePreInspectionRecord,
  deletePreInspectionRecord,
  type PreInspectionSavedRecord
} from './preInspectionStorage';

export { EquipmentSelectorGrid } from './EquipmentSelectorGrid';
export { PreInspectionProgressHeader } from './PreInspectionProgressHeader';
export { CategoryAccordionCard } from './CategoryAccordionCard';
export { SubQuestionItemCard } from './SubQuestionItemCard';
export { PreInspectionHistoryModal } from './PreInspectionHistoryModal';
export { PreInspectionGuideModal } from './PreInspectionGuideModal';

export * from './inspecaoDataMapper';
export * from './inspecaoStorage';
export * from './InspecaoHeader';
export * from './InspecaoResultCard';
export * from './InspecaoChecklistPanel';
export * from './InspecaoFooterBar';
export * from './InspecaoGuideModal';
export * from './PreInspecaoCalculator';
export { default } from './PreInspecaoCalculator';
