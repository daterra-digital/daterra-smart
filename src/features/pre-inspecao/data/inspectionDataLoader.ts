import type {
  EquipmentTypeId,
  EvaluationStyle,
  PreInspectionCategory
} from '../types/inspecaoTypes.ts';

import dataBarras from './barras_horizontais.json' with { type: 'json' };
import dataArbustivas from './culturas_arbustivas.json' with { type: 'json' };
import dataManual from './pistolas_pulverizacao.json' with { type: 'json' };
import dataFixo from './pulverizador_fixo.json' with { type: 'json' };
import dataDrones from './drones_uas.json' with { type: 'json' };
import dataPolvilhador from './polvilhador.json' with { type: 'json' };

const ALL_CATEGORIES_RECORD: Record<EquipmentTypeId, PreInspectionCategory[]> = {
  barras_horizontais: dataBarras as PreInspectionCategory[],
  culturas_arbustivas: dataArbustivas as PreInspectionCategory[],
  pistolas_pulverizacao: dataManual as PreInspectionCategory[],
  pulverizador_fixo: dataFixo as PreInspectionCategory[],
  drones_uas: dataDrones as PreInspectionCategory[],
  polvilhador: dataPolvilhador as PreInspectionCategory[]
};

export const ALL_PRE_INSPECTION_CATEGORIES: PreInspectionCategory[] = [
  ...(dataBarras as PreInspectionCategory[]),
  ...(dataArbustivas as PreInspectionCategory[]),
  ...(dataManual as PreInspectionCategory[]),
  ...(dataFixo as PreInspectionCategory[]),
  ...(dataDrones as PreInspectionCategory[]),
  ...(dataPolvilhador as PreInspectionCategory[])
];

export function getCategoriesByEquipment(
  equipmentId: EquipmentTypeId,
  _style: EvaluationStyle = 'iso_16122'
): PreInspectionCategory[] {
  return ALL_CATEGORIES_RECORD[equipmentId] || ALL_CATEGORIES_RECORD.barras_horizontais;
}
