import type {
  EquipmentTypeId,
  EvaluationMode,
  SubQuestionAnswer,
  EquipmentIconName,
  PreInspectionSubQuestion,
  PreInspectionCategory,
  EquipmentOption
} from './types/inspecaoTypes';

import {
  ALL_PRE_INSPECTION_CATEGORIES,
  getCategoriesByEquipment
} from './data/inspectionDataLoader';

import {
  EQUIPMENT_OPTIONS,
  MANDATORY_DRONE_WARNING,
  isDroneEquipment,
  getEquipmentOption
} from './data/equipmentConfigs';

export type {
  EquipmentTypeId,
  EvaluationMode,
  SubQuestionAnswer,
  EquipmentIconName,
  PreInspectionSubQuestion,
  PreInspectionCategory,
  EquipmentOption
};

export {
  EQUIPMENT_OPTIONS,
  MANDATORY_DRONE_WARNING,
  isDroneEquipment,
  getEquipmentOption,
  getCategoriesByEquipment
};

export const PRE_INSPECTION_CATEGORIES = ALL_PRE_INSPECTION_CATEGORIES;
export const PRE_INSPECTION_MOCK_CATEGORIES = ALL_PRE_INSPECTION_CATEGORIES;
