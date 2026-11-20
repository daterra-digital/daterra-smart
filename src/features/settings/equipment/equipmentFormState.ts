// src/features/settings/equipment/equipmentFormState.ts
import type { EquipmentRecord, EquipmentType, ManometerType } from '../../../schemas/equipment.schema.ts';
import type { UavAtomizationSystem, UavNozzlePlacement, UavWeightClass } from '../../../schemas/equipmentUav.schema.ts';
import { mapUavDetailsToForm, type UavKeypadField } from './equipmentUavHelpers.ts';

export type EquipmentEditorTarget = 'new' | 'identification' | 'distribution' | 'inspection' | null;
export type EquipmentAccordionId = 'ident' | 'nozzles' | 'distrib' | 'bomba' | 'comandos' | 'manometro' | 'inspecao';
export type EquipmentKeypadField =
  | 'tankCapacityL' | 'manufactureYear' | 'workingWidthM' | 'nozzleSpacingCm'
  | 'defaultPressureBar' | 'defaultSpeedKmh' | 'defaultAirflowM3h' | 'lanceCount'
  | 'hoseLengthM' | 'sectionsCount' | 'manometerDiameterMm' | 'manometerDivisionsBar'
  | 'manometerMaxScaleBar' | 'manometerErrorClassPct' | 'manometerMaxPressureBar'
  | UavKeypadField;

export interface EquipmentV12FormState {
  editingId?: string;
  legacyProfileId?: number;
  name: string;
  type: EquipmentType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  manufactureYear: string;
  tankCapacityL: string;
  handWashTank?: boolean;
  circuitFlushTank?: boolean;
  chemicalInductor?: boolean;
  associatedNozzleIds: string[];
  workingWidthM: string;
  nozzleSpacingCm: string;
  defaultPressureBar: string;
  defaultSpeedKmh: string;
  defaultAirflowM3h: string;
  airAssisted?: boolean;
  airCurtainAngle: string;
  uavFlightHeightM: string;
  uavSwathWidthM: string;
  uavWeightClass: UavWeightClass;
  uavRotorCount: string;
  uavTerrainRadar: boolean;
  uavAtomizationSystem: UavAtomizationSystem;
  uavCdaDiscRpm: string;
  uavDropletDv50Um: string;
  uavDropletDv10Um: string;
  uavNozzlePlacement: UavNozzlePlacement;
  lanceCount: string;
  hoseLengthM: string;
  hasHoseReel?: boolean;
  pumpManufacturer: string;
  pumpModel: string;
  pumpType: string;
  hasFillingSieve?: boolean;
  hasSuctionFilter?: boolean;
  hasPressureFilter?: boolean;
  hasLineFilters?: boolean;
  pumpNotes: string;
  commandManufacturer: string;
  commandModel: string;
  sectionsCount: string;
  isManual?: boolean;
  isElectric?: boolean;
  isIsobus?: boolean;
  isAutomatic?: boolean;
  hasComputer?: boolean;
  controlsNotes: string;
  manometerType: ManometerType;
  manometerDiameterMm: string;
  manometerDivisionsBar: string;
  manometerMaxScaleBar: string;
  manometerErrorClassPct: string;
  manometerMaxPressureBar: string;
  manometerNotes: string;
  lastInspectionDate: string | null;
  pressureGaugeOk: boolean;
  antiDripValveOk: boolean;
  nozzleWearWithin10Pct: boolean;
  hoseAndTriggerOk: boolean;
  pumpAndFiltersOk: boolean;
  controlsAndRegulationOk: boolean;
  notes: string;
}

export const INITIAL_EQUIPMENT_V12_FORM: EquipmentV12FormState = {
  name: '',
  type: '3D_AXIAL',
  manufacturer: '',
  model: '',
  serialNumber: '',
  manufactureYear: '',
  tankCapacityL: '',
  associatedNozzleIds: [],
  workingWidthM: '',
  nozzleSpacingCm: '',
  defaultPressureBar: '',
  defaultSpeedKmh: '',
  defaultAirflowM3h: '',
  airAssisted: true,
  airCurtainAngle: '',
  ...mapUavDetailsToForm(undefined),
  lanceCount: '',
  hoseLengthM: '',
  pumpManufacturer: '',
  pumpModel: '',
  pumpType: '',
  pumpNotes: '',
  commandManufacturer: '',
  commandModel: '',
  sectionsCount: '',
  controlsNotes: '',
  manometerType: 'ANALOG',
  manometerDiameterMm: '',
  manometerDivisionsBar: '',
  manometerMaxScaleBar: '',
  manometerErrorClassPct: '',
  manometerMaxPressureBar: '',
  manometerNotes: '',
  lastInspectionDate: null,
  pressureGaugeOk: true,
  antiDripValveOk: true,
  nozzleWearWithin10Pct: true,
  hoseAndTriggerOk: true,
  pumpAndFiltersOk: true,
  controlsAndRegulationOk: true,
  notes: ''
};

const fmtNum = (n?: number): string =>
  n !== undefined && Number.isFinite(n) ? String(n).replace('.', ',') : '';

export function mapEquipmentRecordToForm(eq: EquipmentRecord): EquipmentV12FormState {
  return {
    editingId: eq.id,
    legacyProfileId: eq.legacyProfileId,
    name: eq.name,
    type: eq.type,
    manufacturer: eq.manufacturer || '',
    model: eq.model || '',
    serialNumber: eq.serialNumber || '',
    manufactureYear: eq.manufactureYear !== undefined ? String(eq.manufactureYear) : '',
    tankCapacityL: fmtNum(eq.tankCapacityL),
    handWashTank: eq.handWashTank,
    circuitFlushTank: eq.circuitFlushTank,
    chemicalInductor: eq.chemicalInductor,
    associatedNozzleIds: eq.associatedNozzleIds ? [...eq.associatedNozzleIds] : [],
    workingWidthM: fmtNum(eq.workingWidthM),
    nozzleSpacingCm: fmtNum(eq.nozzleSpacingCm),
    defaultPressureBar: fmtNum(eq.defaultPressureBar),
    defaultSpeedKmh: fmtNum(eq.defaultSpeedKmh),
    defaultAirflowM3h: fmtNum(eq.defaultAirflowM3h),
    airAssisted:
      eq.airAssisted !== undefined
        ? eq.airAssisted
        : eq.type === '2D_HORIZONTAL'
          ? Boolean(eq.defaultAirflowM3h && eq.defaultAirflowM3h > 0)
          : eq.type !== 'UAV_DRONE' && eq.type !== 'MANUAL_LANCE',
    airCurtainAngle: eq.airCurtainAngle || '',
    ...mapUavDetailsToForm(eq.uavDetails),
    lanceCount: eq.lanceCount !== undefined ? String(eq.lanceCount) : eq.type === 'MANUAL_LANCE' ? fmtNum(eq.workingWidthM) : '',
    hoseLengthM: fmtNum(eq.hoseLengthM),
    hasHoseReel: eq.hasHoseReel,
    pumpManufacturer: eq.pumpAndFilters?.pumpManufacturer || '',
    pumpModel: eq.pumpAndFilters?.pumpModel || '',
    pumpType: eq.pumpAndFilters?.pumpType || '',
    hasFillingSieve: eq.pumpAndFilters?.hasFillingSieve,
    hasSuctionFilter: eq.pumpAndFilters?.hasSuctionFilter,
    hasPressureFilter: eq.pumpAndFilters?.hasPressureFilter,
    hasLineFilters: eq.pumpAndFilters?.hasLineFilters,
    pumpNotes: eq.pumpAndFilters?.notes || '',
    commandManufacturer: eq.controlsAndRegulation?.commandManufacturer || '',
    commandModel: eq.controlsAndRegulation?.commandModel || '',
    sectionsCount: eq.controlsAndRegulation?.sectionsCount !== undefined ? String(eq.controlsAndRegulation.sectionsCount) : '',
    isManual: eq.controlsAndRegulation?.isManual,
    isElectric: eq.controlsAndRegulation?.isElectric,
    isIsobus: eq.controlsAndRegulation?.isIsobus,
    isAutomatic: eq.controlsAndRegulation?.isAutomatic,
    hasComputer: eq.controlsAndRegulation?.hasComputer,
    controlsNotes: eq.controlsAndRegulation?.notes || '',
    manometerType: eq.manometer?.manometerType || 'ANALOG',
    manometerDiameterMm: fmtNum(eq.manometer?.diameterMm),
    manometerDivisionsBar: fmtNum(eq.manometer?.scaleDivisionsBar),
    manometerMaxScaleBar: fmtNum(eq.manometer?.maxScaleValueBar),
    manometerErrorClassPct: fmtNum(eq.manometer?.errorClassPct),
    manometerMaxPressureBar: fmtNum(eq.manometer?.maxPressureBar),
    manometerNotes: eq.manometer?.notes || '',
    lastInspectionDate: eq.iso16122Inspection.lastInspectionDate || null,
    pressureGaugeOk: eq.iso16122Inspection.pressureGaugeOk,
    antiDripValveOk: eq.iso16122Inspection.antiDripValveOk,
    nozzleWearWithin10Pct: eq.iso16122Inspection.nozzleWearWithin10Pct,
    hoseAndTriggerOk: eq.iso16122Inspection.hoseAndTriggerOk ?? true,
    pumpAndFiltersOk: eq.iso16122Inspection.pumpAndFiltersOk ?? true,
    controlsAndRegulationOk: eq.iso16122Inspection.controlsAndRegulationOk ?? true,
    notes: eq.notes || ''
  };
}
