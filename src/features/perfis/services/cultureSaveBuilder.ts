// src/features/perfis/services/cultureSaveBuilder.ts
// Validação e construção determinística do pedido de gravação de Cultura (+ momento opcional) (<= 120 LOC).

import { formatCultureLocationSummary } from '../data/cultureLocationData.ts';
import { formatIsoCivilToDdMmYyyy, isValidIsoCivilDate } from './cultureDateUtils.ts';
import {
  parseOptionalPositiveNum,
  type CultureEditorCard,
  type CultureMomentDraftState,
  type CultureV11FormState
} from './cultureFormState.ts';
import type { SaveCultureWithMomentParams } from './cultureMomentStorage.ts';

export function resolveCultureEditorMeta(
  card: CultureEditorCard | null,
  parcelName: string,
  editingCultureId?: number,
  editingMomentId?: number,
  observedAt?: string | null
): { title: string; subtitle: string; submitLabel: string } {
  const name = parcelName.trim() || 'Nova Parcela';
  if (card === 'parcel_core' || card === 'parcel_data' || card === 'parcel_location') {
    return {
      title: editingCultureId ? `A editar: Dados e localização da parcela · ${name}` : 'Nova Cultura — Dados e localização da parcela',
      subtitle: 'Identificação, área (ha), características agronómicas e localização geográfica.',
      submitLabel: editingCultureId ? 'Guardar Dados e Localização' : 'Criar Cultura'
    };
  }
  if (card === 'moment') {
    const dt = formatIsoCivilToDdMmYyyy(observedAt);
    return {
      title: editingMomentId ? `A rever momento em: ${name} (${dt})` : `A registar momento em: ${name}`,
      subtitle: 'Data civil (DD-MM-AAAA), estádio fenológico e dimensões medidas no campo.',
      submitLabel: editingMomentId ? 'Guardar revisão do momento' : 'Guardar Momento'
    };
  }
  return { title: `A editar: Medições de vegetação · ${name}`, subtitle: 'Entrelinha estrutural e dimensões da copa com cálculo EPPO PP 1/239.', submitLabel: 'Guardar Medições' };
}

export interface CultureSaveInput {
  form: CultureV11FormState;
  momentDraft: CultureMomentDraftState;
  momentEditorOpen: boolean;
  dateValid: boolean;
}

export interface CultureSaveBuildResult {
  errors: Record<string, string>;
  /** Presente apenas quando não existem erros de validação. */
  params?: SaveCultureWithMomentParams;
  /** Medições preenchidas sem editor de momento aberto: a UI deve abrir o editor e pedir o estádio. */
  needsMomentEditor: boolean;
}

function parseBoundedNum(raw: string | undefined, key: string, label: string, min: number, max: number, errs: Record<string, string>): number | undefined {
  const t = (raw ?? '').trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  if (!Number.isFinite(n) || n < min || n > max) {
    errs[key] = `${label} deve estar entre ${min} e ${max}.`;
    return undefined;
  }
  return n;
}

export function buildCultureSave({ form, momentDraft, momentEditorOpen, dateValid }: CultureSaveInput): CultureSaveBuildResult {
  const errs: Record<string, string> = {};
  if (!form.cropLabel.trim()) errs.cropType = 'Selecione a cultura.';
  if (!form.name.trim()) errs.name = 'Indique o nome da parcela.';
  const areaHa = parseOptionalPositiveNum(form.area, 'area', 'Área (ha)', errs);
  const rowDistanceM = parseOptionalPositiveNum(form.rowDistance, 'rowDistance', 'Distância entrelinha (m)', errs);
  const canopyHeightM = parseOptionalPositiveNum(momentDraft.canopyHeight, 'canopyHeight', 'Altura da vegetação (m)', errs);
  const canopyWidthM = parseOptionalPositiveNum(momentDraft.canopyWidth, 'canopyWidth', 'Largura da copa (m)', errs);
  const lai = parseOptionalPositiveNum(momentDraft.lai, 'lai', 'LAI', errs);
  const cropHeight2dCm = parseOptionalPositiveNum(form.cropHeight2dCm, 'cropHeight2dCm', 'Altura média (cm)', errs);
  const groundCover2dPct = parseBoundedNum(form.groundCover2dPct, 'groundCover2dPct', 'Cobertura (%)', 0, 100, errs);
  const referenceVolume2dLha = parseOptionalPositiveNum(form.referenceVolume2dLha, 'referenceVolume2dLha', 'Volume de referência (L/ha)', errs);
  const cleanTrunkHeightM = parseOptionalPositiveNum(form.cleanTrunkHeightM, 'cleanTrunkHeightM', 'Altura do tronco limpo (m)', errs);
  const sensitiveZoneDistanceM = parseBoundedNum(form.sensitiveZoneDistanceM, 'sensitiveZoneDistanceM', 'Distância zona sensível (m)', 0, 5000, errs);
  const rowAzimuthDeg = parseBoundedNum(form.rowAzimuthDeg, 'rowAzimuthDeg', 'Azimute (0–180°)', 0, 180, errs);
  const parcelSlopePct = parseBoundedNum(form.parcelSlopePct, 'parcelSlopePct', 'Declive (%)', 0, 100, errs);

  const hasMomentMeasurements = Boolean(
    canopyHeightM !== undefined || canopyWidthM !== undefined || lai !== undefined || momentDraft.densityTier || momentDraft.thicknessTierManual
  );
  let needsMomentEditor = false;
  if (hasMomentMeasurements && !momentEditorOpen) {
    needsMomentEditor = true;
    errs.stage = 'Para guardar medições da vegetação, selecione o estádio fenológico no momento da cultura.';
  } else if (momentEditorOpen) {
    if (!momentDraft.stageLabel.trim()) errs.stage = 'Selecione o estádio fenológico do momento.';
    if (!dateValid || (momentDraft.observedAt !== null && !isValidIsoCivilDate(momentDraft.observedAt)) || (!momentDraft.editingMomentId && !momentDraft.observedAt)) {
      errs.observedAt = 'Indique uma data válida no formato DD-MM-AAAA.';
    }
  }
  if (Object.keys(errs).length > 0) return { errors: errs, needsMomentEditor };

  const hasPendingCustomOption = [form.cropKey, form.varietyOptionId, form.installationOptionId, form.conductionOptionId, momentDraft.stageOptionId]
    .some((id) => id.startsWith('loc-'));
  const geoMode = form.geometryMode ?? '3D';

  return {
    errors: errs,
    needsMomentEditor,
    params: {
      cultureId: form.editingCultureId,
      culturePayload: {
        name: form.name.trim(), crop_type: form.cropLabel.trim(), culture_key: form.cropKey || undefined, area_ha: areaHa,
        season_label: form.seasonLabel.trim() || undefined, variety: form.varietyLabel.trim() || undefined, variety_option_id: form.varietyOptionId || undefined,
        installation_system: form.installationLabel.trim() || undefined, installation_option_id: form.installationOptionId || undefined,
        training_system: form.conductionLabel.trim() || undefined, conduction_option_id: form.conductionOptionId || undefined,
        row_distance_m: rowDistanceM, country_code: form.countryCode || undefined, admin_region: form.adminRegion.trim() || undefined,
        municipality: form.municipality.trim() || undefined, parish: form.parish.trim() || undefined, location: formatCultureLocationSummary(form), notes: form.notes.trim() || undefined,
        geometry_mode: geoMode,
        crop_height_2d_cm: geoMode === '2D' ? cropHeight2dCm : undefined,
        ground_cover_2d_pct: geoMode === '2D' ? groundCover2dPct : undefined,
        application_target_2d: geoMode === '2D' ? (form.applicationTarget2d || undefined) : undefined,
        reference_volume_2d_lha: geoMode === '2D' ? referenceVolume2dLha : undefined,
        interrow_cover_3d: geoMode === '3D' ? (form.interrowCover3d || undefined) : undefined,
        conduction_mode_3d: geoMode === '3D' ? (form.conductionMode3d || undefined) : undefined,
        clean_trunk_height_m: geoMode === '3D' ? cleanTrunkHeightM : undefined,
        windbreak_barrier: form.windbreakBarrier || undefined,
        sensitive_zone_distance_m: sensitiveZoneDistanceM,
        row_azimuth_deg: rowAzimuthDeg,
        parcel_slope_pct: parcelSlopePct
      },
      momentInput: momentEditorOpen ? {
        momentId: momentDraft.editingMomentId, observedAt: momentDraft.observedAt, stageOptionId: momentDraft.stageOptionId || undefined,
        stageLabel: momentDraft.stageLabel.trim(), stageCode: momentDraft.stageCode || undefined, canopyHeightM, canopyWidthM,
        thicknessTierManual: momentDraft.thicknessTierManual, densityTier: momentDraft.densityTier, lai,
        measurementSource: momentDraft.measurementSource, copiedFromMomentId: momentDraft.copiedFromMomentId, revisionReason: momentDraft.revisionReason
      } : undefined,
      markMomentAsActive: momentDraft.markAsActive,
      hasPendingCustomOption
    }
  };
}
