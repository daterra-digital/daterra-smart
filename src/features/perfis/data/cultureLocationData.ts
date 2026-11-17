// src/features/perfis/data/cultureLocationData.ts
// Dados geográficos canónicos PT (base local Portugal) e lista de países para Cultura internacional.

import { PORTUGAL_MUNICIPALITIES_DATA } from '../../weather/data/portugalMunicipalitiesData.ts';

export interface CountryOption {
  code: string;
  label: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'PT', label: 'Portugal' },
  { code: 'ES', label: 'Espanha' },
  { code: 'FR', label: 'França' },
  { code: 'IT', label: 'Itália' },
  { code: 'BR', label: 'Brasil' },
  { code: 'OTHER', label: 'Outro país' }
];

const AUTONOMOUS_LABEL = 'Regiões Autónomas (Açores e Madeira)';

export function getPortugalRegionOptions(): string[] {
  const set = new Set<string>();
  for (const item of PORTUGAL_MUNICIPALITIES_DATA) {
    set.add(item.distrito?.trim() || AUTONOMOUS_LABEL);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt'));
}

export function getPortugalMunicipalitiesByRegion(region: string): string[] {
  const norm = region.trim();
  const list = norm
    ? PORTUGAL_MUNICIPALITIES_DATA.filter((m) => (m.distrito?.trim() || AUTONOMOUS_LABEL) === norm)
    : PORTUGAL_MUNICIPALITIES_DATA;
  return list.map((m) => m.name).sort((a, b) => a.localeCompare(b, 'pt'));
}

export function getPortugalParishesByMunicipality(municipality: string): string[] {
  const found = PORTUGAL_MUNICIPALITIES_DATA.find((m) => m.name === municipality.trim());
  if (!found) return [];
  return [...found.freguesias].sort((a, b) => a.localeCompare(b, 'pt'));
}

export function formatCultureLocationSummary(parts: {
  countryCode?: string;
  adminRegion?: string;
  municipality?: string;
  parish?: string;
}): string | undefined {
  const country = COUNTRY_OPTIONS.find((c) => c.code === parts.countryCode)?.label || parts.countryCode;
  const segments = [parts.parish, parts.municipality, parts.adminRegion, country]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s));
  return segments.length > 0 ? segments.join(', ') : undefined;
}
