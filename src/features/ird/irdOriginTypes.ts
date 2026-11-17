import type {
  IrdApplicationDomain,
  IrdDataConfidence,
  IrdUserMeasurementSource
} from './irdTypes.ts';

export type IrdBlockOriginMode = 'profile' | 'manual';
export type IrdEvaluationLevel = 'level1_meteo' | 'level2_quick' | 'level3_profiles';
export type IrdAssessmentLevelSnapshot = 'quick_partial' | 'quick_manual' | 'detailed_profiles';
export type IrdTriStateStatus = 'yes' | 'no' | 'unknown';

export type IrdHeightCharacterizationMode =
  | 'horizontal_boom_ground'
  | 'soil_boom'
  | 'canopy_release'
  | 'culture_profile_canopy'
  | 'descriptive_unavailable';

export type IrdSensitiveZoneCategory =
  | 'watercourse'
  | 'neighboring_crop'
  | 'habitation_public'
  | 'apiary_pollinators'
  | 'protected_area'
  | 'other_multiple';

export interface IrdCertifiedDriftReduction {
  readonly status: 'unknown' | 'documented';
  readonly scope: 'nozzle_variant' | 'equipment_technique';
  readonly reductionPct: number | null;
  readonly reductionClassText: string;
  readonly classifierSystemAndCountry: string;
  readonly documentOrTestRef: string;
  readonly applicablePressureText: string;
  readonly coveredTargetOrNozzle: string;
  readonly otherConditions: string;
  readonly source: 'documented_catalog' | 'profile' | 'user_declaration';
}

export interface IrdNozzleCascadeState {
  readonly brand: string;
  readonly model: string;
  readonly sprayAngle: string | number;
  readonly swirlPlate: string;
  readonly disc: string;
  readonly catalogNozzleId: string;
}

export interface IrdCultureBlockState {
  readonly mode: IrdBlockOriginMode;
  readonly selectedProfileId: string;
  readonly manualLabel: string;
}

export interface IrdEquipmentBlockState {
  readonly mode: IrdBlockOriginMode;
  readonly selectedProfileId: string;
  readonly manual: {
    readonly applicationDomain: IrdApplicationDomain;
    readonly airAssistStatus: IrdTriStateStatus;
  };
}

export interface IrdNozzleBlockState {
  readonly mode: IrdBlockOriginMode;
  readonly selectedProfileId: string;
  readonly profileConfirmedCatalogId: string;
  readonly manualCascade: IrdNozzleCascadeState;
  readonly certifiedReduction: IrdCertifiedDriftReduction;
}

export interface IrdCalibrationBlockState {
  readonly mode: IrdBlockOriginMode;
  readonly selectedProfileId: string;
  readonly manual: {
    readonly workingPressureBar: number | null;
    readonly travelSpeedKmh: number | null;
    readonly boomOrReleaseHeightM: number | null;
    readonly heightMode: IrdHeightCharacterizationMode;
    readonly isDropletOpen: boolean;
    readonly dropletMode: 'rotary' | 'conventional';
    readonly representativeDropletDiameterUm: number | null;
    readonly measuredDv10Um: number | null;
    readonly measuredDv50Um: number | null;
    readonly measuredDv90Um: number | null;
    readonly measurementSource: IrdUserMeasurementSource | string | null;
    readonly measurementPressureBar: number | null;
    readonly measurementDate: string | null;
    readonly measurementConfidence: IrdDataConfidence | null;
  };
}

export interface IrdExposureBlockState {
  readonly distanceToSensitiveAreaM: number | null;
  readonly labelBufferKnown: boolean;
  readonly labelMinBufferM: number | null;
  readonly downwindStatus: IrdTriStateStatus;
  readonly sensitiveZoneCategory: IrdSensitiveZoneCategory | '';
}

export const INITIAL_CERTIFIED_REDUCTION: IrdCertifiedDriftReduction = Object.freeze({
  status: 'unknown',
  scope: 'nozzle_variant',
  reductionPct: null,
  reductionClassText: '',
  classifierSystemAndCountry: '',
  documentOrTestRef: '',
  applicablePressureText: '',
  coveredTargetOrNozzle: '',
  otherConditions: '',
  source: 'user_declaration'
});

export const INITIAL_NOZZLE_CASCADE: IrdNozzleCascadeState = Object.freeze({
  brand: '',
  model: '',
  sprayAngle: '',
  swirlPlate: '',
  disc: '',
  catalogNozzleId: ''
});
