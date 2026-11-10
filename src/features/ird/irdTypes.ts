/**
 * DATERRA Smart - Fundação de Tipos do Índice de Risco de Deriva (IRD)
 * Contratos puros TypeScript (sem dependências de React, DOM, Firestore ou Dexie).
 */

export type IrdRiskClass = 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRITICO_BLOQUEADO';
export type IrdLegalVerdict = 'PERMITIDO_CONFORME_ROTULO' | 'RESTRITO_MITIGAR' | 'BLOQUEADO';
export type IrdWeatherSource = 'open_meteo_live' | 'open_meteo_cache' | 'manual_field';
export type IrdApplicationDomain = 'horizontal_boom' | 'orchard_airblast' | 'manual_lance';
export type IrdDataConfidence = 'ALTA' | 'MEDIA' | 'REDUZIDA';
export type IrdDropletClassCode = 'VF' | 'F' | 'M' | 'C' | 'VC' | 'XC' | 'UC' | 'EC';

export type IrdUserMeasurementSource =
  | 'calibration_profile' | 'manufacturer_spec' | 'lab_certificate' | 'user_declared';

export type IrdDropletSource =
  | IrdUserMeasurementSource
  | 'catalog_interpolated' | 'catalog_class' | 'catalog_drift_hazard' | 'conservative_fallback';

export type IrdNozzleResolutionTier =
  | 'user_measured_spectrum' | 'user_representative_diameter'
  | 'lab_dv10' | 'catalog_droplet_class' | 'catalog_drift_hazard' | 'conservative_fallback';

export type IrdFallbackFlagCode =
  | 'USER_DROPLET_MEASUREMENT_INVALID_IGNORED'
  | 'NOZZLE_DV10_UNAVAILABLE_USED_CLASS' | 'NOZZLE_CLASS_UNAVAILABLE_USED_HAZARD'
  | 'NOZZLE_CATALOG_DATA_MISSING_USED_CONSERVATIVE_F' | 'NOZZLE_ZERO_HAZARD_NORMALIZED_NON_ZERO'
  | 'NOZZLE_UNDERPRESSURE_WARNING' | 'NOZZLE_OVERPRESSURE_PENALTY'
  | 'WEATHER_CACHE_STALE_CONFIRM_IN_FIELD' | 'BUFFER_DISTANCE_UNCONFIRMED_CONSERVATIVE'
  | 'CALM_WIND_THERMAL_INVERSION_CAUTION' | 'LOW_DELTA_T_RUNOFF_CAUTION';

export type IrdBlockReasonCode =
  | 'MISSING_CRITICAL_WEATHER_DATA' | 'MISSING_WORKING_PRESSURE' | 'INVALID_INPUT_RANGE'
  | 'LEGAL_LABEL_BUFFER_VIOLATION' | 'ACTIVE_RAIN_WASH_BLOCK' | 'EXCESSIVE_WIND_BLOCK'
  | 'EXCESSIVE_GUST_BLOCK' | 'CRITICAL_DELTA_T_BLOCK' | 'EXTREME_OVERPRESSURE_BLOCK' | 'AERIAL_WIND_EXCEEDED';

export type IrdWarningCode =
  | 'LABEL_SUPREMACY_DGAV_SIFITO' | 'NOT_ISO_22866_CERTIFIED'
  | 'CONFIRM_WIND_WITH_ANEMOMETER' | 'SUBOPTIMAL_PRESSURE_SPECTRUM'
  | 'DOWNWIND_SENSITIVE_EXPOSURE' | 'THERMAL_INVERSION_SUSPECTED'
  | 'HIGH_SPEED_BOOM_DRIFT' | 'USER_DROPLET_MEASUREMENT_IGNORED';

export interface IrdSubIndexWeights {
  readonly meteo: number;
  readonly espectro: number;
  readonly operacao: number;
  readonly exposicao: number;
}

export interface IrdConfigVersions {
  readonly formulaVersion: string;
  readonly rulesetVersion: string;
  readonly nozzleCatalogVersion: string;
  readonly configMode: 'dgav_conservador';
  readonly calculatorId: 'calc_ird';
}

export interface IrdClassBand {
  readonly riskClass: IrdRiskClass;
  readonly minScore: number;
  readonly maxScore: number;
  readonly labelPt: string;
}

export interface IrdWeatherInput {
  readonly windSpeedKmh: number | null;
  readonly windGustsKmh?: number | null;
  readonly temperatureC: number | null;
  readonly relativeHumidityPct: number | null;
  readonly precipitationMm?: number | null;
  readonly weatherSource?: IrdWeatherSource | null;
  readonly weatherAgeMinutes?: number | null;
  readonly weatherTimestamp?: string | null;
}

export interface IrdNozzleInput {
  readonly nozzleId?: string | null;
  readonly brand?: string | null;
  readonly model?: string | null;
  readonly nozzleType?: string | null;
  readonly driftHazardLevel?: string | null;
  readonly referencePressureBar?: number | null;
  readonly pressureMinBar?: number | null;
  readonly pressureMaxBar?: number | null;
  readonly dropletClass?: IrdDropletClassCode | string | null;
  readonly dv10Um?: number | null;
  readonly dv50Um?: number | null;
  readonly isAirInductionDeclared?: boolean;
  readonly workingPressureBar: number | null;
  readonly hasAirSleeve?: boolean;
  readonly measuredDv10Um?: number | null;
  readonly measuredDv50Um?: number | null;
  readonly measuredDv90Um?: number | null;
  readonly representativeDropletDiameterUm?: number | null;
  readonly measurementSource?: IrdUserMeasurementSource | string | null;
  readonly measurementPressureBar?: number | null;
  readonly measurementDate?: string | null;
  readonly measurementConfidence?: IrdDataConfidence | null;
}

export interface IrdOperationInput {
  readonly applicationDomain: IrdApplicationDomain;
  readonly travelSpeedKmh: number | null;
  readonly boomOrReleaseHeightM: number | null;
}

export interface IrdExposureInput {
  readonly distanceToSensitiveAreaM?: number | null;
  readonly labelMinBufferM?: number | null;
  readonly hasDownwindSensitiveTarget: boolean;
}

export interface IrdInput {
  readonly weather: IrdWeatherInput;
  readonly nozzle: IrdNozzleInput;
  readonly operation: IrdOperationInput;
  readonly exposure: IrdExposureInput;
}

export interface IrdSubIndices {
  readonly meteo: number;
  readonly espectro: number;
  readonly operacao: number;
  readonly exposicao: number;
}

export interface IrdDerivedMetrics {
  readonly deltaTC: number;
  readonly wetBulbC: number;
  readonly dewPointC: number;
  readonly effectiveWindKmh: number;
  readonly maxWindSafeKmh: number;
  readonly maxWindLimitKmh: number;
  readonly nozzleResolutionTier: IrdNozzleResolutionTier;
  readonly dv10UsedUm: number | null;
  readonly dv50UsedUm: number | null;
  readonly dv90UsedUm: number | null;
  readonly dropletSource: IrdDropletSource;
  readonly dropletConfidence: IrdDataConfidence;
}

export interface IrdNotice {
  readonly code: IrdWarningCode;
  readonly severity: 'info' | 'warning' | 'critical';
  readonly messagePt: string;
}

export interface IrdLegalBlock {
  readonly code: IrdBlockReasonCode;
  readonly messagePt: string;
  readonly legalBasisPt: string;
}

export interface IrdLegalDisclaimer {
  readonly isIso22866Certified: false;
  readonly isLegalComplianceCertificate: false;
  readonly dgavSifitoPrevails: true;
  readonly statementPt: string;
}

export interface IrdAssessmentResult {
  readonly status: 'CALCULATED';
  readonly versions: IrdConfigVersions;
  readonly irdScore: number;
  readonly irdClass: IrdRiskClass;
  readonly subIndices: IrdSubIndices;
  readonly derived: IrdDerivedMetrics;
  readonly legalVerdict: IrdLegalVerdict;
  readonly blocks: readonly IrdLegalBlock[];
  readonly fallbackFlags: readonly IrdFallbackFlagCode[];
  readonly warnings: readonly IrdNotice[];
  readonly dataConfidenceLevel: IrdDataConfidence;
  readonly legalDisclaimer: IrdLegalDisclaimer;
}

export interface IrdBlockedIncompleteResult {
  readonly status: 'FAIL_CLOSED_INCOMPLETE';
  readonly versions: IrdConfigVersions;
  readonly irdScore: null;
  readonly irdClass: 'CRITICO_BLOQUEADO';
  readonly legalVerdict: 'BLOQUEADO';
  readonly blocks: readonly IrdLegalBlock[];
  readonly missingOrInvalidFields: readonly string[];
  readonly legalDisclaimer: IrdLegalDisclaimer;
}

export type IrdResult = IrdAssessmentResult | IrdBlockedIncompleteResult;
