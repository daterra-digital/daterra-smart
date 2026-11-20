// src/features/perfis/services/cultureFormState.ts
// Estado de formulário completo do perfil Cultura (v11) com mapeamento seguro (<= 200 LOC).

import type {
  CanopyDensityTierId,
  CanopyThicknessTierId,
  Culture2DTargetMode,
  Culture3DConductionMode,
  Culture3DGroundCoverMode,
  CultureGeometryMode,
  CultureMomentMeasurementSource,
  CultureWindbreakBarrier,
  ProfileCropMoment,
  ProfileCulture
} from '../../../db/types.ts';
import { isChronologicallyLatest, todayIsoCivil } from './cultureDateUtils.ts';
import { CULTURE_CATALOG_OPTIONS } from '../data/cultureCatalogData.ts';
import { inferCultureGeometryMode } from '../data/cultureGeometryOptions.ts';
import { buildCultureKeypadConfig, type CultureKeypadField } from './cultureKeypadHelpers.ts';

/** Cartões da vista Bento que abrem o Editor Focado. */
export type CultureEditorCard = 'parcel_core' | 'parcel_data' | 'parcel_location' | 'moment' | 'measurements';

export interface CultureMomentDraftState {
  editingMomentId?: number;
  observedAt: string | null;
  stageOptionId: string;
  stageLabel: string;
  stageCode?: string;
  canopyHeight: string;
  canopyWidth: string;
  thicknessTierManual?: CanopyThicknessTierId;
  densityTier?: CanopyDensityTierId;
  lai: string;
  measurementSource: CultureMomentMeasurementSource;
  copiedFromMomentId?: number;
  revisionReason: string;
  markAsActive: boolean;
  needsRevisionReason?: boolean;
}

export interface CultureV11FormState {
  editingCultureId?: number;
  name: string;
  cropKey: string;
  cropLabel: string;
  area: string;
  varietyOptionId: string;
  varietyLabel: string;
  seasonLabel: string;
  installationOptionId: string;
  installationLabel: string;
  conductionOptionId: string;
  conductionLabel: string;
  rowDistance: string;
  countryCode: string;
  adminRegion: string;
  municipality: string;
  parish: string;
  notes: string;
  geometryMode: CultureGeometryMode;
  cropHeight2dCm: string;
  groundCover2dPct: string;
  applicationTarget2d: Culture2DTargetMode | '';
  referenceVolume2dLha: string;
  interrowCover3d: Culture3DGroundCoverMode | '';
  conductionMode3d: Culture3DConductionMode | '';
  cleanTrunkHeightM: string;
  windbreakBarrier: CultureWindbreakBarrier | '';
  sensitiveZoneDistanceM: string;
  rowAzimuthDeg: string;
  parcelSlopePct: string;
}

export function createInitialCultureForm(): CultureV11FormState {
  return {
    name: '', cropKey: '', cropLabel: '', area: '', varietyOptionId: '', varietyLabel: '', seasonLabel: '',
    installationOptionId: '', installationLabel: '', conductionOptionId: '', conductionLabel: '', rowDistance: '',
    countryCode: 'PT', adminRegion: '', municipality: '', parish: '', notes: '',
    geometryMode: '3D', cropHeight2dCm: '', groundCover2dPct: '', applicationTarget2d: '', referenceVolume2dLha: '',
    interrowCover3d: '', conductionMode3d: '', cleanTrunkHeightM: '',
    windbreakBarrier: '', sensitiveZoneDistanceM: '', rowAzimuthDeg: '', parcelSlopePct: ''
  };
}

export function createInitialMomentDraft(now = new Date()): CultureMomentDraftState {
  return {
    observedAt: todayIsoCivil(now),
    stageOptionId: '',
    stageLabel: '',
    stageCode: '',
    canopyHeight: '',
    canopyWidth: '',
    lai: '',
    measurementSource: 'measured_field',
    revisionReason: '',
    markAsActive: true
  };
}

export function formatNumField(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '';
  return String(value).replace('.', ',');
}

export function parseOptionalPositiveNum(
  raw: string | undefined,
  fieldKey: string,
  label: string,
  errors: Record<string, string>
): number | undefined {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(num) || num <= 0) {
    errors[fieldKey] = `${label} deve ser um valor numérico superior a zero.`;
    return undefined;
  }
  return num;
}

export function resolveCropKeyFromCulture(c: ProfileCulture): string {
  if (c.culture_key) return c.culture_key;
  const norm = c.crop_type.trim().toLowerCase();
  const matched = CULTURE_CATALOG_OPTIONS.find((opt) => opt.label.toLowerCase() === norm || opt.id === norm);
  return matched ? matched.id : '';
}

export function mapCultureToFormState(c: ProfileCulture): CultureV11FormState {
  const cropKey = resolveCropKeyFromCulture(c);
  const hasWoody = Boolean(c.last_trv_m3_ha || c.last_lwa_m2_ha || c.row_distance_m || c.canopy_height_m);
  return {
    editingCultureId: c.id, name: c.name || '', cropKey, cropLabel: c.crop_type || '',
    area: formatNumField(c.area_ha), varietyOptionId: c.variety_option_id || '', varietyLabel: c.variety || '',
    seasonLabel: c.season_label || '', installationOptionId: c.installation_option_id || '',
    installationLabel: c.installation_system || '', conductionOptionId: c.conduction_option_id || '',
    conductionLabel: c.training_system || '', rowDistance: formatNumField(c.row_distance_m),
    countryCode: c.country_code || 'PT', adminRegion: c.admin_region || '',
    municipality: c.municipality || '', parish: c.parish || '', notes: c.notes || '',
    geometryMode: inferCultureGeometryMode(cropKey, c.crop_type, c.geometry_mode, hasWoody),
    cropHeight2dCm: formatNumField(c.crop_height_2d_cm),
    groundCover2dPct: formatNumField(c.ground_cover_2d_pct),
    applicationTarget2d: c.application_target_2d || '',
    referenceVolume2dLha: formatNumField(c.reference_volume_2d_lha),
    interrowCover3d: c.interrow_cover_3d || '',
    conductionMode3d: c.conduction_mode_3d || '',
    cleanTrunkHeightM: formatNumField(c.clean_trunk_height_m),
    windbreakBarrier: c.windbreak_barrier || '',
    sensitiveZoneDistanceM: formatNumField(c.sensitive_zone_distance_m),
    rowAzimuthDeg: formatNumField(c.row_azimuth_deg),
    parcelSlopePct: formatNumField(c.parcel_slope_pct)
  };
}

/**
 * `moments` (opcional) = momentos da parcela; se o momento em revisão for anterior ao mais recente,
 * `markAsActive` inicia a `false` para que rever histórico não roube o estatuto de "Momento atual".
 */
export function mapMomentToDraftState(m: ProfileCropMoment, moments?: ProfileCropMoment[]): CultureMomentDraftState {
  return {
    editingMomentId: m.id,
    observedAt: m.observedAt ?? null,
    stageOptionId: m.stageOptionId || '',
    stageLabel: m.stageLabel || '',
    stageCode: m.stageCode || '',
    canopyHeight: formatNumField(m.canopyHeightM),
    canopyWidth: formatNumField(m.canopyWidthM),
    thicknessTierManual: m.thicknessTierManual,
    densityTier: m.densityTier,
    lai: formatNumField(m.lai),
    measurementSource: m.measurementSource,
    copiedFromMomentId: m.copiedFromMomentId,
    revisionReason: '',
    markAsActive: moments ? isChronologicallyLatest(m.observedAt ?? null, moments, m.id) : true
  };
}

export function getCultureKeypadConfig(
  field: CultureKeypadField,
  form: CultureV11FormState,
  momentDraft: CultureMomentDraftState
) {
  return buildCultureKeypadConfig(field, form, momentDraft);
}
