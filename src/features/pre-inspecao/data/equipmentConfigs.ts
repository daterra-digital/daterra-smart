import type { EquipmentOption, EquipmentTypeId } from '../types/inspecaoTypes';

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  {
    id: 'barras_horizontais',
    title: 'Barras Horizontais',
    subtitle: 'Culturas baixas, arvenses e hortícolas',
    normativeRef: 'ISO 16122-2',
    iconName: 'Tractor',
    disabled: false
  },
  {
    id: 'culturas_arbustivas',
    title: 'Culturas Arbustivas & Arbóreas',
    subtitle: 'Atomizadores, vinha, pomares e olival',
    normativeRef: 'ISO 16122-3',
    iconName: 'Fan',
    disabled: false
  },
  {
    id: 'pistolas_pulverizacao',
    title: 'Pulverização Manual',
    subtitle: 'Lanças manuais, pistolas e dorso',
    normativeRef: 'ISO 16122-4',
    iconName: 'SprayCan',
    disabled: false
  },
  {
    id: 'pulverizador_fixo',
    title: 'Fixo & Semi-Móvel',
    subtitle: 'Instalações de estufa e redes fixas',
    normativeRef: 'ISO 16122-4',
    iconName: 'Factory',
    disabled: false
  },
  {
    id: 'drones_uas',
    title: 'Drones / UAV',
    subtitle: 'Pulverização aérea não tripulada',
    normativeRef: 'Adaptação Técnica ISO 16122',
    iconName: 'Plane',
    disabled: false
  },
  {
    id: 'polvilhador',
    title: 'Polvilhador',
    subtitle: 'Aplicação de pós secos (em quarentena)',
    iconName: 'Wind',
    disabled: true
  }
];

export const MANDATORY_DRONE_WARNING =
  'Os requisitos apresentados resultam da adaptação técnica das diretrizes gerais da Norma ISO 16122';

export function isDroneEquipment(equipmentId: EquipmentTypeId): boolean {
  return equipmentId === 'drones_uas';
}

export function getEquipmentOption(equipmentId: EquipmentTypeId): EquipmentOption {
  return (
    EQUIPMENT_OPTIONS.find((opt) => opt.id === equipmentId) || EQUIPMENT_OPTIONS[0]
  );
}
