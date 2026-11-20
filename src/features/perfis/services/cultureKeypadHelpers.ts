// src/features/perfis/services/cultureKeypadHelpers.ts
// Configuração do DaterraKeypad para todos os campos numéricos de Cultura 2D/3D e contexto espacial (<= 85 LOC).

import type { CultureMomentDraftState, CultureV11FormState } from './cultureFormState.ts';

export type CultureKeypadField =
  | 'area'
  | 'rowDistance'
  | 'canopyHeight'
  | 'canopyWidth'
  | 'lai'
  | 'cropHeight2dCm'
  | 'groundCover2dPct'
  | 'referenceVolume2dLha'
  | 'cleanTrunkHeightM'
  | 'sensitiveZoneDistanceM'
  | 'rowAzimuthDeg'
  | 'parcelSlopePct';

export interface CultureKeypadConfig {
  label: string;
  unit: string;
  initialValue: string;
  commonValues: number[];
  max?: number;
  min?: number;
  minInclusive?: boolean;
  allowDecimal?: boolean;
  maxDecimals?: number;
}

export function buildCultureKeypadConfig(
  field: CultureKeypadField,
  form: CultureV11FormState,
  momentDraft: CultureMomentDraftState
): CultureKeypadConfig {
  const map: Record<CultureKeypadField, CultureKeypadConfig> = {
    area: { label: 'Área da parcela (ha)', unit: 'ha', initialValue: form.area, commonValues: [1, 2.5, 5, 10, 25, 50] },
    rowDistance: { label: 'Distância entrelinha (m)', unit: 'm', initialValue: form.rowDistance, commonValues: [1.8, 2.2, 2.5, 3, 4, 6] },
    canopyHeight: { label: 'Altura da vegetação / copa (m)', unit: 'm', initialValue: momentDraft.canopyHeight, commonValues: [0.8, 1.2, 1.5, 2, 2.5, 3] },
    canopyWidth: { label: 'Largura / espessura da copa (m)', unit: 'm', initialValue: momentDraft.canopyWidth, commonValues: [0.4, 0.6, 0.8, 1.2, 2, 3] },
    lai: { label: 'Índice de Área Foliar (LAI)', unit: '', initialValue: momentDraft.lai, commonValues: [0.5, 1, 1.5, 2, 3, 4] },
    cropHeight2dCm: { label: 'Altura média da cultura (cm)', unit: 'cm', initialValue: form.cropHeight2dCm, commonValues: [15, 30, 50, 80, 120, 180], min: 1, max: 500, allowDecimal: false, maxDecimals: 0 },
    groundCover2dPct: { label: 'Cobertura do solo / IAF (%)', unit: '%', initialValue: form.groundCover2dPct, commonValues: [15, 30, 50, 75, 90, 100], min: 0, minInclusive: true, max: 100, allowDecimal: false, maxDecimals: 0 },
    referenceVolume2dLha: { label: 'Volume de referência 2D (L/ha)', unit: 'L/ha', initialValue: form.referenceVolume2dLha, commonValues: [150, 200, 300, 400, 500, 600], min: 10, max: 2000, allowDecimal: false, maxDecimals: 0 },
    cleanTrunkHeightM: { label: 'Altura do tronco limpo (m)', unit: 'm', initialValue: form.cleanTrunkHeightM, commonValues: [0.4, 0.6, 0.8, 1.0, 1.2, 1.5], min: 0.1, max: 5 },
    sensitiveZoneDistanceM: { label: 'Distância a zona sensível (m)', unit: 'm', initialValue: form.sensitiveZoneDistanceM, commonValues: [5, 10, 20, 30, 50, 100], min: 0, minInclusive: true, max: 5000, allowDecimal: true, maxDecimals: 1 },
    rowAzimuthDeg: { label: 'Orientação das linhas (0–180°)', unit: '°', initialValue: form.rowAzimuthDeg, commonValues: [0, 30, 45, 90, 135, 180], min: 0, minInclusive: true, max: 180, allowDecimal: false, maxDecimals: 0 },
    parcelSlopePct: { label: 'Declive da parcela (%)', unit: '%', initialValue: form.parcelSlopePct, commonValues: [0, 2, 5, 10, 15, 25], min: 0, minInclusive: true, max: 100, allowDecimal: true, maxDecimals: 1 }
  };
  return map[field];
}
