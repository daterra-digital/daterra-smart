import type { ProfileCalibration, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../db/types.ts';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import { AVAILABLE_BRANDS } from '../nozzle-comparison/nozzleComparison.data.ts';
import { extractCalibrationSafely, mapEquipmentProfileToIrd, matchNozzleProfileToCatalog } from './irdProfileMappers.ts';
import {
  INITIAL_CERTIFIED_REDUCTION,
  INITIAL_NOZZLE_CASCADE,
  type IrdCalibrationBlockState,
  type IrdCultureBlockState,
  type IrdEquipmentBlockState,
  type IrdExposureBlockState,
  type IrdNozzleBlockState,
  type IrdNozzleCascadeState
} from './irdOriginTypes.ts';
import type { IrdWeatherInput } from './irdTypes.ts';

export function applyNozzleCascadeStep(
  prev: IrdNozzleCascadeState,
  step:
    | { type: 'brand'; value: string }
    | { type: 'model'; value: string }
    | { type: 'angle'; value: string | number }
    | { type: 'swirl'; value: string }
    | { type: 'disc'; value: string }
    | { type: 'nozzle'; value: string; sprayAngle?: string | number }
): IrdNozzleCascadeState {
  switch (step.type) {
    case 'brand':
      return { ...INITIAL_NOZZLE_CASCADE, brand: step.value };
    case 'model':
      return { ...INITIAL_NOZZLE_CASCADE, brand: prev.brand, model: step.value };
    case 'angle':
      if (String(prev.sprayAngle) === String(step.value)) return prev;
      return { ...prev, sprayAngle: step.value, swirlPlate: '', disc: '', catalogNozzleId: '' };
    case 'swirl':
      return { ...prev, swirlPlate: step.value, disc: '', catalogNozzleId: '' };
    case 'disc':
      return { ...prev, disc: step.value, catalogNozzleId: step.value ? prev.catalogNozzleId : '' };
    case 'nozzle':
      return {
        ...prev,
        catalogNozzleId: step.value,
        sprayAngle: prev.sprayAngle !== '' ? prev.sprayAngle : (step.sprayAngle ?? '')
      };
  }
}

export const createInitialWeatherManual = (): IrdWeatherInput => ({
  windSpeedKmh: null,
  windGustsKmh: null,
  temperatureC: null,
  relativeHumidityPct: null,
  precipitationMm: null,
  weatherSource: 'manual_field',
  weatherAgeMinutes: 0
});

export const createInitialCultureState = (): IrdCultureBlockState => ({
  mode: 'manual',
  selectedProfileId: '',
  manualLabel: ''
});

export const createInitialEquipmentState = (): IrdEquipmentBlockState => ({
  mode: 'manual',
  selectedProfileId: '',
  manual: { applicationDomain: 'horizontal_boom', airAssistStatus: 'unknown' }
});

export const createInitialNozzleState = (): IrdNozzleBlockState => ({
  mode: 'manual',
  selectedProfileId: '',
  profileConfirmedCatalogId: '',
  manualCascade: { ...INITIAL_NOZZLE_CASCADE },
  certifiedReduction: { ...INITIAL_CERTIFIED_REDUCTION }
});

export const createInitialCalibrationState = (): IrdCalibrationBlockState => ({
  mode: 'manual',
  selectedProfileId: '',
  manual: {
    workingPressureBar: null,
    travelSpeedKmh: null,
    boomOrReleaseHeightM: null,
    heightMode: 'horizontal_boom_ground',
    isDropletOpen: false,
    dropletMode: 'conventional',
    representativeDropletDiameterUm: null,
    measuredDv10Um: null,
    measuredDv50Um: null,
    measuredDv90Um: null,
    measurementSource: 'user_declared',
    measurementPressureBar: null,
    measurementDate: null,
    measurementConfidence: null
  }
});

export const createInitialExposureState = (): IrdExposureBlockState => ({
  distanceToSensitiveAreaM: null,
  labelBufferKnown: false,
  labelMinBufferM: null,
  downwindStatus: 'unknown',
  sensitiveZoneCategory: ''
});

export function copyCultureProfileToManual(prev: IrdCultureBlockState, cultures: readonly ProfileCulture[]): IrdCultureBlockState {
  const sel = cultures.find((c) => String(c.id) === prev.selectedProfileId);
  if (!sel) return { ...prev, mode: 'manual' };
  return { ...prev, mode: 'manual', manualLabel: `${sel.name} (${sel.crop_type})` };
}

export function copyEquipmentProfileToManual(prev: IrdEquipmentBlockState, equipments: readonly ProfileEquipment[]): IrdEquipmentBlockState {
  const sel = equipments.find((e) => String(e.id) === prev.selectedProfileId);
  const mapped = mapEquipmentProfileToIrd(sel);
  if (!mapped || mapped.isAmbiguousDistribution) {
    return { ...prev, mode: 'manual', manual: { applicationDomain: mapped?.applicationDomain ?? 'horizontal_boom', airAssistStatus: 'unknown' } };
  }
  return { ...prev, mode: 'manual', manual: { applicationDomain: mapped.applicationDomain, airAssistStatus: mapped.airAssistStatus } };
}

export function copyNozzleProfileToManual(
  prev: IrdNozzleBlockState,
  profileNozzles: readonly ProfileNozzle[],
  catalog: readonly Nozzle[]
): IrdNozzleBlockState {
  const prof = profileNozzles.find((n) => String(n.id) === prev.selectedProfileId);
  if (!prof) return { ...prev, mode: 'manual' };
  const match = matchNozzleProfileToCatalog(prof, catalog);
  const chosen = match.status === 'exact'
    ? match.matchedNozzle
    : prev.profileConfirmedCatalogId
      ? catalog.find((c) => c.id === prev.profileConfirmedCatalogId)
      : undefined;

  if (chosen) {
    return {
      ...prev,
      mode: 'manual',
      manualCascade: {
        brand: chosen.brand,
        model: chosen.model,
        sprayAngle: chosen.sprayAngleDeg ?? '',
        swirlPlate: chosen.swirlPlate ?? '',
        disc: chosen.disc ?? '',
        catalogNozzleId: chosen.id
      }
    };
  }
  const matchedBrand = AVAILABLE_BRANDS.find((b) => b.toLowerCase() === (prof.manufacturer || '').trim().toLowerCase()) ?? '';
  return { ...prev, mode: 'manual', manualCascade: { ...INITIAL_NOZZLE_CASCADE, brand: matchedBrand } };
}

export function copyCalibrationProfileToManual(
  prev: IrdCalibrationBlockState,
  calibrations: readonly ProfileCalibration[],
  equipmentHeightM: number | null,
  targetDomain: 'horizontal_boom' | 'orchard_airblast' | 'manual_lance' = 'horizontal_boom'
): IrdCalibrationBlockState {
  const sel = calibrations.find((c) => String(c.id) === prev.selectedProfileId);
  const safe = extractCalibrationSafely(sel);
  const nextHeightMode = targetDomain === 'horizontal_boom' ? 'horizontal_boom_ground' : 'canopy_release';
  return {
    ...prev,
    mode: 'manual',
    manual: {
      ...prev.manual,
      workingPressureBar: safe?.workingPressureBar ?? prev.manual.workingPressureBar,
      travelSpeedKmh: safe?.workingSpeedKmh ?? prev.manual.travelSpeedKmh,
      boomOrReleaseHeightM: equipmentHeightM ?? prev.manual.boomOrReleaseHeightM,
      heightMode: nextHeightMode
    }
  };
}
