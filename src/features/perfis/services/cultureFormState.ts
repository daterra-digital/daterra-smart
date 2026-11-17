// src/features/perfis/services/cultureFormState.ts
// Estado de formulário completo do perfil Cultura (v11) com mapeamento seguro (<= 200 LOC).

import type {
  CanopyDensityTierId,
  CanopyThicknessTierId,
  CultureMomentMeasurementSource,
  ProfileCropMoment,
  ProfileCulture
} from '../../../db/types.ts';
import { isChronologicallyLatest, todayIsoCivil } from './cultureDateUtils.ts';
import { CULTURE_CATALOG_OPTIONS } from '../data/cultureCatalogData.ts';

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
}

export function createInitialCultureForm(): CultureV11FormState {
  return {
    name: '',
    cropKey: '',
    cropLabel: '',
    area: '',
    varietyOptionId: '',
    varietyLabel: '',
    seasonLabel: '',
    installationOptionId: '',
    installationLabel: '',
    conductionOptionId: '',
    conductionLabel: '',
    rowDistance: '',
    countryCode: 'PT',
    adminRegion: '',
    municipality: '',
    parish: '',
    notes: ''
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
  raw: string,
  fieldKey: string,
  label: string,
  errors: Record<string, string>
): number | undefined {
  const trimmed = raw.trim();
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
  return {
    editingCultureId: c.id,
    name: c.name || '',
    cropKey: resolveCropKeyFromCulture(c),
    cropLabel: c.crop_type || '',
    area: formatNumField(c.area_ha),
    varietyOptionId: c.variety_option_id || '',
    varietyLabel: c.variety || '',
    seasonLabel: c.season_label || '',
    installationOptionId: c.installation_option_id || '',
    installationLabel: c.installation_system || '',
    conductionOptionId: c.conduction_option_id || '',
    conductionLabel: c.training_system || '',
    rowDistance: formatNumField(c.row_distance_m),
    countryCode: c.country_code || 'PT',
    adminRegion: c.admin_region || '',
    municipality: c.municipality || '',
    parish: c.parish || '',
    notes: c.notes || ''
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
  field: 'area' | 'rowDistance' | 'canopyHeight' | 'canopyWidth' | 'lai',
  form: CultureV11FormState,
  momentDraft: CultureMomentDraftState
): { label: string; unit: string; initialValue: string; commonValues: number[] } {
  if (field === 'area') {
    return { label: 'Área da parcela (ha)', unit: 'ha', initialValue: form.area, commonValues: [1, 2.5, 5, 10, 25, 50] };
  }
  if (field === 'rowDistance') {
    return { label: 'Distância entrelinha (m)', unit: 'm', initialValue: form.rowDistance, commonValues: [1.8, 2.2, 2.5, 3, 4, 6] };
  }
  if (field === 'canopyHeight') {
    return { label: 'Altura da vegetação / copa (m)', unit: 'm', initialValue: momentDraft.canopyHeight, commonValues: [0.8, 1.2, 1.5, 2, 2.5, 3] };
  }
  if (field === 'canopyWidth') {
    return { label: 'Largura / espessura da copa (m)', unit: 'm', initialValue: momentDraft.canopyWidth, commonValues: [0.4, 0.6, 0.8, 1.2, 2, 3] };
  }
  return { label: 'Índice de Área Foliar (LAI)', unit: '', initialValue: momentDraft.lai, commonValues: [0.5, 1, 1.5, 2, 3, 4] };
}
