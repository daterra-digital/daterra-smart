// src/db/cultureTypes.ts
// Contratos aditivos Dexie v11 para momentos datados, revisões e opções locais privadas de Cultura.

export type ProfileCustomOptionCategory =
  | 'cultura'
  | 'variedade'
  | 'instalacao'
  | 'conducao'
  | 'estadio';

export type CultureMomentMeasurementSource =
  | 'measured_field'
  | 'copied_previous'
  | 'migrated_legacy_profile';

export type CanopyThicknessTierId = 'estreita' | 'media' | 'larga';
export type CanopyDensityTierId = 'aberta' | 'moderada' | 'densa';
export type CultureGeometryMode = '3D' | '2D';
export type Culture2DTargetMode = 'solo_pre_emergencia' | 'folha_dossel';
export type Culture3DGroundCoverMode = 'sem_enrelvamento' | 'parcial' | 'permanente';
export type Culture3DConductionMode = 'sebe_continua' | 'arvores_isoladas';
export type CultureWindbreakBarrier = 'sem_barreira' | 'sebe_inferior' | 'sebe_igual_superior';

export interface ProfileCultureGeometryExtension {
  geometry_mode?: CultureGeometryMode;
  crop_height_2d_cm?: number;
  ground_cover_2d_pct?: number;
  application_target_2d?: Culture2DTargetMode;
  reference_volume_2d_lha?: number;
  interrow_cover_3d?: Culture3DGroundCoverMode;
  conduction_mode_3d?: Culture3DConductionMode;
  clean_trunk_height_m?: number;
  windbreak_barrier?: CultureWindbreakBarrier;
  sensitive_zone_distance_m?: number;
  row_azimuth_deg?: number;
  parcel_slope_pct?: number;
}

export interface ProfileCropMomentSnapshot {
  savedDateDisplay: string;
  cultureLabel: string;
  varietyLabel?: string;
  stageLabel: string;
  stageCode?: string;
  rowDistanceM?: number;
  canopyHeightM?: number;
  canopyWidthM?: number;
  lwaBilateral?: number | null;
  trvPure?: number | null;
  lai?: number;
  densityTier?: CanopyDensityTierId;
  thicknessTier?: CanopyThicknessTierId;
  /** Volume de calda de referência EPPO PP 1/239 (L/ha), derivado de LWA ou TRV. */
  recommendedSprayVolumeLHa?: number | null;
  recommendedSprayVolumeMinLHa?: number | null;
  recommendedSprayVolumeMaxLHa?: number | null;
  sprayVolumeBasis?: 'lwa' | 'trv' | null;
}

export interface ProfileCropMoment {
  id?: number;
  userId: string;
  cultureId: number;
  observedAt: string | null; // Data civil YYYY-MM-DD ou null para legado desconhecido
  stageOptionId?: string;
  stageLabel: string;
  stageCode?: string;
  canopyHeightM?: number;
  canopyWidthM?: number;
  thicknessTierManual?: CanopyThicknessTierId;
  densityTier?: CanopyDensityTierId;
  lai?: number;
  measurementSource: CultureMomentMeasurementSource;
  copiedFromMomentId?: number;
  snapshotJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileMomentRevision {
  id?: number;
  userId: string;
  cultureId: number;
  momentId: number;
  previousStageLabel: string;
  newStageLabel: string;
  previousObservedAt: string | null;
  newObservedAt: string | null;
  reason: string;
  snapshotBeforeJson: string;
  /** Estado do momento após a revisão (aditivo; ausente em revisões antigas). */
  snapshotAfterJson?: string;
  /** Campos alterados nesta revisão (aditivo; ausente em revisões antigas). */
  changedFields?: string[];
  createdAt: string;
}

export interface ProfileCustomOption {
  id?: number;
  localId: string;
  userId: string;
  category: ProfileCustomOptionCategory;
  cultureKey?: string;
  originalLabel: string;
  currentLabel: string;
  normalizedKey: string;
  status: 'pending_local';
  canonicalId?: string | null;
  createdAt: string;
  updatedAt: string;
}
