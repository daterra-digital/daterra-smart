// src/features/perfis/components/CultureLocationAccordion.tsx
// Subsecção e formulário de localização geográfica da parcela (integrado em "Dados e localização da parcela") (<= 200 LOC).

import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import {
  COUNTRY_OPTIONS,
  formatCultureLocationSummary,
  getPortugalMunicipalitiesByRegion,
  getPortugalParishesByMunicipality,
  getPortugalRegionOptions
} from '../data/cultureLocationData';
import type { CultureV11FormState } from '../services/cultureFormState';
import { SearchableRoundedDropdown } from './SearchableRoundedDropdown';

export interface CultureLocationAccordionProps {
  mode?: 'subsection' | 'editor';
  form: CultureV11FormState;
  onUpdate: (patch: Partial<CultureV11FormState>) => void;
}

export const CultureLocationAccordion: React.FC<CultureLocationAccordionProps> = ({
  mode = 'subsection',
  form,
  onUpdate
}) => {
  const isPortugal = (form.countryCode || 'PT') === 'PT';
  const countryLabel = COUNTRY_OPTIONS.find((c) => c.code === (form.countryCode || 'PT'))?.label || 'Portugal';

  const regionOptions = useMemo(() => getPortugalRegionOptions().map((r) => ({ id: r, label: r })), []);
  const municipalityOptions = useMemo(
    () => getPortugalMunicipalitiesByRegion(form.adminRegion).map((m) => ({ id: m, label: m })),
    [form.adminRegion]
  );
  const parishOptions = useMemo(
    () => getPortugalParishesByMunicipality(form.municipality).map((p) => ({ id: p, label: p })),
    [form.municipality]
  );

  if (mode === 'editor') {
    return (
      <div className="space-y-4">
        <SearchableRoundedDropdown
          label="País"
          value={countryLabel}
          selectedId={form.countryCode}
          options={COUNTRY_OPTIONS.map((c) => ({ id: c.code, label: c.label }))}
          onSelectOption={(opt) => {
            if (opt.id !== form.countryCode) {
              onUpdate({ countryCode: opt.id, adminRegion: '', municipality: '', parish: '' });
            }
          }}
        />

        {isPortugal ? (
          <>
            <SearchableRoundedDropdown
              label="Distrito / Região"
              placeholder="Selecionar distrito..."
              value={form.adminRegion}
              selectedId={form.adminRegion}
              options={regionOptions}
              onClear={() => onUpdate({ adminRegion: '', municipality: '', parish: '' })}
              onSelectOption={(opt) => onUpdate({ adminRegion: opt.label, municipality: '', parish: '' })}
            />

            <SearchableRoundedDropdown
              label="Concelho"
              placeholder="Selecionar concelho..."
              disabled={!form.adminRegion}
              disabledHint="Selecione primeiro o distrito ou região"
              value={form.municipality}
              selectedId={form.municipality}
              options={municipalityOptions}
              onClear={() => onUpdate({ municipality: '', parish: '' })}
              onSelectOption={(opt) => onUpdate({ municipality: opt.label, parish: '' })}
            />

            <SearchableRoundedDropdown
              label="Freguesia"
              placeholder="Selecionar freguesia..."
              disabled={!form.municipality}
              disabledHint="Selecione primeiro o concelho"
              value={form.parish}
              selectedId={form.parish}
              options={parishOptions}
              onClear={() => onUpdate({ parish: '' })}
              onSelectOption={(opt) => onUpdate({ parish: opt.label })}
            />
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Região / Estado</label>
              <input
                type="text"
                value={form.adminRegion}
                onChange={(e) => onUpdate({ adminRegion: e.target.value })}
                placeholder="Ex: Andaluzia, Bordéus..."
                className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#3CA64C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Município / Cidade</label>
              <input
                type="text"
                value={form.municipality}
                onChange={(e) => onUpdate({ municipality: e.target.value })}
                placeholder="Ex: Jerez de la Frontera..."
                className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#3CA64C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Localidade / Zona</label>
              <input
                type="text"
                value={form.parish}
                onChange={(e) => onUpdate({ parish: e.target.value })}
                placeholder="Opcional"
                className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#3CA64C]"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const summary = formatCultureLocationSummary({
    countryCode: form.countryCode,
    adminRegion: form.adminRegion,
    municipality: form.municipality,
    parish: form.parish
  });
  const rows = [
    { label: 'País', value: countryLabel },
    { label: isPortugal ? 'Distrito / Região' : 'Região / Estado', value: form.adminRegion || 'Não indicado' },
    { label: isPortugal ? 'Concelho' : 'Município', value: form.municipality || 'Não indicado' },
    { label: isPortugal ? 'Freguesia' : 'Localidade', value: form.parish || 'Não indicada' }
  ];

  return (
    <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#1D734B] shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#114037]">
            Localização geográfica
          </span>
        </div>
        {summary && <span className="text-[11px] font-semibold text-slate-500 break-words">{summary}</span>}
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {rows.map((r) => (
          <div key={r.label} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{r.label}</dt>
            <dd className="font-bold text-slate-800 break-words leading-snug mt-0.5">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
