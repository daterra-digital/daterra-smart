// src/features/settings/equipment/equipmentUavHelpers.ts
import type { CatalogSelectOption } from '../../perfis/data/cultureCatalogData.ts';
import type {
  UavAtomizationSystem,
  UavEquipmentDetails,
  UavNozzlePlacement,
  UavWeightClass
} from '../../../schemas/equipmentUav.schema.ts';
import type { EquipmentV12FormState } from './equipmentFormState.ts';

export type UavKeypadField =
  | 'uavFlightHeightM'
  | 'uavSwathWidthM'
  | 'uavCdaDiscRpm'
  | 'uavDropletDv50Um'
  | 'uavDropletDv10Um';

export const UAV_WEIGHT_CLASS_OPTIONS: CatalogSelectOption[] = [
  { id: 'LIGHT_LT_15L', label: 'Ligeiro (< 15 L)' },
  { id: 'HEAVY_GTE_20L', label: 'Pesado (≥ 20 L)' }
];

export const UAV_ROTOR_OPTIONS: CatalogSelectOption[] = [
  { id: '4', label: '4 rotores (Quadricóptero)' },
  { id: '6', label: '6 rotores (Hexacóptero)' },
  { id: '8', label: '8 rotores (Octocóptero)' }
];

export const UAV_ATOMIZATION_OPTIONS: CatalogSelectOption[] = [
  { id: 'CENTRIFUGAL_CDA', label: 'Centrífugo CDA (Discos rotativos)' },
  { id: 'HYDRAULIC', label: 'Hidráulico (Bicos de pressão)' }
];

export const UAV_PLACEMENT_OPTIONS: CatalogSelectOption[] = [
  { id: 'UNDER_ROTOR', label: 'Sob os rotores (Under-rotor)' },
  { id: 'WINGTIP', label: 'Extremidades exteriores (Wingtip)' }
];

const fmt = (n?: number) => (n !== undefined && Number.isFinite(n) ? String(n).replace('.', ',') : '');

export function mapUavDetailsToForm(uav?: UavEquipmentDetails) {
  return {
    uavFlightHeightM: uav?.flightHeightM !== undefined ? fmt(uav.flightHeightM) : '2',
    uavSwathWidthM: fmt(uav?.swathWidthM),
    uavWeightClass: (uav?.weightClass || 'HEAVY_GTE_20L') as UavWeightClass,
    uavRotorCount: uav?.rotorCount ? String(uav.rotorCount) : '4',
    uavTerrainRadar: uav?.terrainFollowingRadar ?? true,
    uavAtomizationSystem: (uav?.atomizationSystem || 'CENTRIFUGAL_CDA') as UavAtomizationSystem,
    uavCdaDiscRpm: fmt(uav?.cdaDiscRpm),
    uavDropletDv50Um: fmt(uav?.dropletDv50Um),
    uavDropletDv10Um: fmt(uav?.dropletDv10Um),
    uavNozzlePlacement: (uav?.nozzlePlacement || 'UNDER_ROTOR') as UavNozzlePlacement
  };
}

export function buildUavDetailsFromForm(
  form: EquipmentV12FormState,
  parsePosNum: (raw: string) => number | undefined
): UavEquipmentDetails | undefined {
  if (form.type !== 'UAV_DRONE') return undefined;
  const rotorParsed = parsePosNum(form.uavRotorCount);
  const rotorCount = rotorParsed === 6 || rotorParsed === 8 ? rotorParsed : 4;
  return {
    flightHeightM: parsePosNum(form.uavFlightHeightM) ?? 2.0,
    swathWidthM: parsePosNum(form.uavSwathWidthM),
    weightClass: form.uavWeightClass || 'HEAVY_GTE_20L',
    rotorCount,
    terrainFollowingRadar: Boolean(form.uavTerrainRadar),
    atomizationSystem: form.uavAtomizationSystem || 'CENTRIFUGAL_CDA',
    cdaDiscRpm: form.uavAtomizationSystem === 'CENTRIFUGAL_CDA' ? parsePosNum(form.uavCdaDiscRpm) : undefined,
    dropletDv50Um: parsePosNum(form.uavDropletDv50Um),
    dropletDv10Um: parsePosNum(form.uavDropletDv10Um),
    nozzlePlacement: form.uavNozzlePlacement || 'UNDER_ROTOR'
  };
}

export function getUavKeypadConfig(field: UavKeypadField, form: EquipmentV12FormState) {
  const map: Record<UavKeypadField, { label: string; unit: string; initialValue: string; commonValues: number[]; maxDecimals: number; allowDecimal: boolean }> = {
    uavFlightHeightM: { label: 'Altura de voo acima da copa', unit: 'm', initialValue: form.uavFlightHeightM, commonValues: [1.5, 2.0, 2.5, 3.0, 3.5, 4.0], maxDecimals: 1, allowDecimal: true },
    uavSwathWidthM: { label: 'Largura efetiva / Swath', unit: 'm', initialValue: form.uavSwathWidthM, commonValues: [3.5, 4.5, 5.5, 6.5, 8.0, 10.0], maxDecimals: 1, allowDecimal: true },
    uavCdaDiscRpm: { label: 'Rotação dos Discos CDA', unit: 'RPM', initialValue: form.uavCdaDiscRpm, commonValues: [6000, 8000, 10000, 12000, 14000, 16000], maxDecimals: 0, allowDecimal: false },
    uavDropletDv50Um: { label: 'Diâmetro Mediano Dv0,5', unit: 'µm', initialValue: form.uavDropletDv50Um, commonValues: [150, 200, 250, 300, 350, 450], maxDecimals: 0, allowDecimal: false },
    uavDropletDv10Um: { label: 'Percentil Fino Dv0,1', unit: 'µm', initialValue: form.uavDropletDv10Um, commonValues: [75, 100, 125, 150, 180, 220], maxDecimals: 0, allowDecimal: false }
  };
  return map[field];
}
