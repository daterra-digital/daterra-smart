// src/features/perfis/components/CultureParcelDataAccordion.tsx
// Cartão Bento 2 ("Dados da parcela"): 8 campos essenciais em grelha de 2 colunas + edição completa no Drawer (<= 200 LOC).

import React from 'react';
import { Layers, Pencil } from 'lucide-react';
import type { CatalogSelectOption } from '../data/cultureCatalogData';
import type { CultureV11FormState } from '../services/cultureFormState';
import { SearchableRoundedDropdown } from './SearchableRoundedDropdown';

export interface CultureParcelDataAccordionProps {
  mode?: 'card' | 'editor';
  form: CultureV11FormState;
  varietyOptions: CatalogSelectOption[];
  installationOptions: CatalogSelectOption[];
  conductionOptions: CatalogSelectOption[];
  onEditParcel?: () => void;
  onUpdate: (patch: Partial<CultureV11FormState>) => void;
  onCreateCustomOption: (
    category: 'variedade' | 'instalacao' | 'conducao',
    label: string
  ) => Promise<CatalogSelectOption | null>;
  onRenameCustomOption: (recordId: number, newLabel: string) => Promise<CatalogSelectOption | null>;
}

export const CultureParcelDataAccordion: React.FC<CultureParcelDataAccordionProps> = ({
  mode = 'card',
  form,
  varietyOptions,
  installationOptions,
  conductionOptions,
  onEditParcel,
  onUpdate,
  onCreateCustomOption,
  onRenameCustomOption
}) => {
  if (mode === 'editor') {
    return (
      <div className="space-y-4">
        <SearchableRoundedDropdown
          label="Variedade / Casta"
          disabled={!form.cropKey}
          disabledHint="Selecione primeiro a cultura"
          placeholder="Selecionar ou adicionar variedade..."
          emptyCatalogHint="Ainda não existem variedades validadas no catálogo para esta cultura. Pode adicionar uma opção local privada."
          value={form.varietyLabel}
          selectedId={form.varietyOptionId}
          options={varietyOptions}
          allowCustomAdd={Boolean(form.cropKey)}
          customAddHint="Ex: Touriga Nacional, Gala, Cobrançosa..."
          onClear={() => onUpdate({ varietyOptionId: '', varietyLabel: '' })}
          onCreateCustomOption={(lbl) => onCreateCustomOption('variedade', lbl)}
          onRenameCustomOption={onRenameCustomOption}
          onSelectOption={(opt) => onUpdate({ varietyOptionId: opt.id, varietyLabel: opt.label })}
        />

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Campanha / Época</label>
          <input
            type="text"
            value={form.seasonLabel}
            onChange={(e) => onUpdate({ seasonLabel: e.target.value })}
            placeholder="Ex: 2026"
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#3CA64C]"
          />
        </div>

        <SearchableRoundedDropdown
          label="Sistema de instalação"
          placeholder="Selecionar sistema de instalação..."
          value={form.installationLabel}
          selectedId={form.installationOptionId}
          options={installationOptions}
          allowCustomAdd
          customAddHint="Ex: Vinha ao alto, Pomar em compasso regular..."
          onClear={() => onUpdate({ installationOptionId: '', installationLabel: '' })}
          onCreateCustomOption={(lbl) => onCreateCustomOption('instalacao', lbl)}
          onRenameCustomOption={onRenameCustomOption}
          onSelectOption={(opt) => onUpdate({ installationOptionId: opt.id, installationLabel: opt.label })}
        />

        <SearchableRoundedDropdown
          label="Sistema de condução"
          disabled={!form.cropKey}
          disabledHint="Selecione primeiro a cultura"
          placeholder="Selecionar sistema de condução..."
          value={form.conductionLabel}
          selectedId={form.conductionOptionId}
          options={conductionOptions}
          allowCustomAdd={Boolean(form.cropKey)}
          customAddHint="Ex: Pérgola, Lira, Copado..."
          onClear={() => onUpdate({ conductionOptionId: '', conductionLabel: '' })}
          onCreateCustomOption={(lbl) => onCreateCustomOption('conducao', lbl)}
          onRenameCustomOption={onRenameCustomOption}
          onSelectOption={(opt) => onUpdate({ conductionOptionId: opt.id, conductionLabel: opt.label })}
        />

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Notas da parcela</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Observações locais sobre bordadura, declive ou histórico da parcela..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-[#3CA64C]"
          />
        </div>
      </div>
    );
  }

  const hasParcel = Boolean(form.editingCultureId || form.cropKey || form.name);
  const concelhoFreguesia =
    [form.municipality.trim(), form.parish.trim()].filter(Boolean).join(' · ') || 'Não indicada';
  const items = [
    { label: 'Cultura (Espécie)', value: form.cropLabel || '—' },
    { label: 'Nome da parcela', value: form.name || '—' },
    { label: 'Área da parcela', value: form.area ? `${form.area} ha` : 'Não indicada' },
    { label: 'Variedade / Casta', value: form.varietyLabel || 'Não indicada' },
    { label: 'Campanha / Época', value: form.seasonLabel || 'Não indicada' },
    { label: 'Sistema de instalação', value: form.installationLabel || 'Não indicado' },
    { label: 'Sistema de condução', value: form.conductionLabel || 'Não indicado' },
    { label: 'Concelho / Freguesia', value: concelhoFreguesia }
  ];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-3 h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Layers className="w-4 h-4 text-[#1D734B] shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">
                Dados da parcela
              </h4>
              <p className="text-[11px] text-slate-500">
                Identificação, variedade, condução e localização municipal
              </p>
            </div>
          </div>
          {onEditParcel && (
            <button
              type="button"
              disabled={!hasParcel}
              onClick={onEditParcel}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-[#114037] flex items-center gap-1 shrink-0 disabled:opacity-40"
            >
              <Pencil className="w-3.5 h-3.5 text-[#1D734B]" />
              <span>Editar</span>
            </button>
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {items.map((it) => (
            <div key={it.label} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{it.label}</dt>
              <dd className="font-bold text-slate-800 break-words leading-snug mt-0.5">{it.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};
