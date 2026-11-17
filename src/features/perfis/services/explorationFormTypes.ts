// src/features/perfis/services/explorationFormTypes.ts
export interface CultureFormState {
  name: string;
  cropType: string;
  variety: string;
  area: string;
  trainingSystem: string;
  spacing: string;
  rowDistance: string;
  phenologicalStage: string;
  canopyWidth: string;
  canopyHeight: string;
  lai: string;
}

export interface EquipmentFormState {
  name: string;
  manufacturer: string;
  modelSelect: string;
  modelCustom: string;
  serialNumber: string;
  constructionYear: string;
  tankCapacity: string;
  hasHandWashingTank?: boolean;
  hasCircuitRinse?: boolean;
  hasProductIncorporator?: boolean;
  selectedNozzles: string[];
  pumpManufacturer: string;
  pumpModelSelect: string;
  pumpModelCustom: string;
  pumpType: string;
  hasFillingSieve?: boolean;
  hasSuctionFilter?: boolean;
  hasPressureFilter?: boolean;
  hasLineFilters?: boolean;
  commandManufacturer: string;
  commandModelSelect: string;
  commandModelCustom: string;
  isManual?: boolean;
  isElectric?: boolean;
  isIsobus?: boolean;
  isAutomatic?: boolean;
  hasComputer?: boolean;
  sectionsCount: string;
  manometerDiameter: string;
  manometerDivisions: string;
  manometerMaxValue: string;
  manometerErrorClass: string;
  maxPressure: string;
  distributionType: string;
  boomWidth: string;
  boomHeight: string;
  hasAirSleeve?: boolean;
  fanTransmission: string;
  fanDiameter: string;
  fanType: string;
  hasSuctionAirDeflector?: boolean;
  hasCompressionAirDeflector?: boolean;
  hasHeightCompressionAirDeflector?: boolean;
  lancesCount: string;
  hoseLength: string;
  hasHoseReels?: boolean;
  pneumaticNozzlesCount: string;
  nozzlesPerPneumaticHead: string;
  cannonNozzleGroupsCount: string;
  panelsCount: string;
  simultaneousRowsCount: string;
  notes: string;
  inspectionDate: string;
  calibrationDate: string;
}

export interface NozzleFormState {
  equipmentId: string;
  manufacturer: string;
  model: string;
  color: string;
  isoClassification: string;
  nozzleType: string;
  sprayAngle: string;
  workingPressureBar: string;
  nominalFlowLmin: string;
}

export interface CalibrationFormState {
  equipmentId: string;
  nozzleId: string;
  workingSpeedKmh: string;
  workingPressureBar: string;
  workingWidthM: string;
  activeNozzlesCount: string;
  dropletSizeUm: string;
  totalFlowLmin: string;
  airVelocityMs: string;
  airVolumeM3h: string;
}

export const INITIAL_CULTURE_FORM: CultureFormState = {
  name: '', cropType: '', variety: '', area: '', trainingSystem: '', spacing: '',
  rowDistance: '', phenologicalStage: '', canopyWidth: '', canopyHeight: '', lai: ''
};

export const INITIAL_EQUIPMENT_FORM: EquipmentFormState = {
  name: '', manufacturer: '', modelSelect: '', modelCustom: '', serialNumber: '',
  constructionYear: '', tankCapacity: '', selectedNozzles: [],
  pumpManufacturer: '', pumpModelSelect: '', pumpModelCustom: '', pumpType: '',
  commandManufacturer: '', commandModelSelect: '', commandModelCustom: '', sectionsCount: '',
  manometerDiameter: '', manometerDivisions: '', manometerMaxValue: '', manometerErrorClass: '', maxPressure: '',
  distributionType: '', boomWidth: '', boomHeight: '', fanTransmission: '', fanDiameter: '', fanType: '',
  lancesCount: '', hoseLength: '', pneumaticNozzlesCount: '', nozzlesPerPneumaticHead: '',
  cannonNozzleGroupsCount: '', panelsCount: '', simultaneousRowsCount: '',
  notes: '', inspectionDate: '', calibrationDate: ''
};

export const INITIAL_NOZZLE_FORM: NozzleFormState = {
  equipmentId: '', manufacturer: '', model: '', color: '', isoClassification: '',
  nozzleType: '', sprayAngle: '', workingPressureBar: '', nominalFlowLmin: ''
};

export const INITIAL_CALIBRATION_FORM: CalibrationFormState = {
  equipmentId: '', nozzleId: '', workingSpeedKmh: '', workingPressureBar: '', workingWidthM: '',
  activeNozzlesCount: '', dropletSizeUm: '', totalFlowLmin: '', airVelocityMs: '', airVolumeM3h: ''
};

export type ValidationResult<T> = { data?: T; errors: Record<string, string> };

export const optText = (raw: string): string | undefined => {
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
};

export function parsePositiveFloat(raw: string): number | null {
  const norm = raw.trim().replace(',', '.');
  if (!norm || !/^\d+(?:\.\d+)?$/.test(norm)) return null;
  const val = Number(norm);
  return Number.isFinite(val) && val > 0 ? val : null;
}

export function readNum(
  raw: string, key: string, label: string, required: boolean, integer: boolean, errors: Record<string, string>
): number | undefined {
  const t = raw.trim();
  if (!t) {
    if (required) errors[key] = `${label} é obrigatório.`;
    return undefined;
  }
  if (integer) {
    if (!/^\d+$/.test(t) || Number(t) < 1) {
      errors[key] = `${label} deve ser um número inteiro igual ou superior a 1.`;
      return undefined;
    }
    return Number(t);
  }
  const val = parsePositiveFloat(t);
  if (val === null) {
    errors[key] = `${label} deve ser um número positivo válido.`;
    return undefined;
  }
  return val;
}
