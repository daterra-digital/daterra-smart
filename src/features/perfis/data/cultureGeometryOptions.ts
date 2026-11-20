// src/features/perfis/data/cultureGeometryOptions.ts
// Opções e inferência retrocompatível para geometria 3D/2D e contexto espacial de Cultura (<= 95 LOC).

import type { CultureGeometryMode } from '../../../db/cultureTypes.ts';
import type { CatalogSelectOption } from './cultureCatalogData.ts';

export const WOODY_3D_CROP_KEYS: ReadonlySet<string> = new Set([
  'vinha', 'pereira', 'macieira', 'pessegueiro', 'cerejeira', 'amendoeira', 'citrinos', 'oliveira'
]);

export const FIELD_2D_CROP_KEYS: ReadonlySet<string> = new Set([
  'milho', 'trigo', 'cevada', 'batata', 'tomate_industria', 'horticolas', 'pastagem'
]);

export function inferCultureGeometryMode(
  cropKey?: string,
  cropLabel?: string,
  explicitMode?: CultureGeometryMode,
  hasWoodyTelemetry?: boolean
): CultureGeometryMode {
  if (explicitMode === '3D' || explicitMode === '2D') return explicitMode;
  if (hasWoodyTelemetry) return '3D';
  const k = (cropKey || '').trim().toLowerCase();
  if (WOODY_3D_CROP_KEYS.has(k)) return '3D';
  if (FIELD_2D_CROP_KEYS.has(k)) return '2D';
  const lbl = (cropLabel || '').toLowerCase();
  if (/milho|trigo|cevada|batata|tomate|hort|pastagem|arvense|cereal/.test(lbl)) return '2D';
  return '3D';
}

export const GEOMETRY_MODE_OPTIONS: CatalogSelectOption[] = [
  { id: '3D', label: '3D (Vinha / Pomar / Olival)' },
  { id: '2D', label: '2D (Arvenses / Hortícolas / Pastagem)' }
];

export const TARGET_2D_OPTIONS: CatalogSelectOption[] = [
  { id: 'solo_pre_emergencia', label: 'Solo / Pré-emergência' },
  { id: 'folha_dossel', label: 'Folha / Dossel' }
];

export const INTERROW_3D_OPTIONS: CatalogSelectOption[] = [
  { id: 'sem_enrelvamento', label: 'Sem enrelvamento' },
  { id: 'parcial', label: 'Enrelvamento parcial' },
  { id: 'permanente', label: 'Enrelvamento permanente' }
];

export const CONDUCTION_3D_OPTIONS: CatalogSelectOption[] = [
  { id: 'sebe_continua', label: 'Sebe contínua' },
  { id: 'arvores_isoladas', label: 'Árvores isoladas' }
];

export const WINDBREAK_OPTIONS: CatalogSelectOption[] = [
  { id: 'sem_barreira', label: 'Sem barreira / bordadura aberta' },
  { id: 'sebe_inferior', label: 'Sebe < altura da copa' },
  { id: 'sebe_igual_superior', label: 'Sebe ≥ altura da copa' }
];

export const THICKNESS_3D_OPTIONS: CatalogSelectOption[] = [
  { id: 'estreita', label: 'Estreita (< 0,50 m)' },
  { id: 'media', label: 'Média (0,50 a 0,80 m)' },
  { id: 'larga', label: 'Larga (> 0,80 m)' }
];

export const DENSITY_3D_OPTIONS: CatalogSelectOption[] = [
  { id: 'aberta', label: 'Aberta' },
  { id: 'moderada', label: 'Moderada' },
  { id: 'densa', label: 'Densa' }
];
