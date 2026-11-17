// src/features/perfis/components/CultureCoreFieldsCard.tsx
// Botão global "Guia Técnico" + campos base (Cultura, Nome, Área) do editor de Dados da parcela (<= 200 LOC).

import React from 'react';
import { BookOpen, Lock } from 'lucide-react';
import type { CatalogSelectOption } from '../data/cultureCatalogData';
import type { CultureV11FormState } from '../services/cultureFormState';
import { SearchableRoundedDropdown } from './SearchableRoundedDropdown';
import { NumericKeypadField } from './NumericKeypadField';

export interface CultureTechnicalGuideButtonProps {
  onOpenGuide: () => void;
}

export const CultureTechnicalGuideButton: React.FC<CultureTechnicalGuideButtonProps> = ({ onOpenGuide }) => (
  <button
    type="button"
    onClick={onOpenGuide}
    className="min-h-[48px] px-4 py-2 rounded-2xl border border-[#114037]/20 bg-emerald-50/70 hover:bg-emerald-50 text-xs font-extrabold text-[#114037] flex items-center gap-2 touch-target"
  >
    <BookOpen className="w-4 h-4 text-[#1D734B]" />
    <span>Guia Técnico</span>
  </button>
);

export interface CultureCoreFieldsCardProps {
  form: CultureV11FormState;
  cultureOptions: CatalogSelectOption[];
  isSpeciesLocked: boolean;
  speciesNotice: string;
  fieldErrors: Record<string, string>;
  onStartNewCulture: () => void;
  onUpdateForm: (patch: Partial<CultureV11FormState>) => void;
  onSelectCulture: (opt: CatalogSelectOption) => void;
  onCreateCultureOption: (label: string) => Promise<CatalogSelectOption | null>;
  onRenameCultureOption: (recordId: number, newLabel: string) => Promise<CatalogSelectOption | null>;
  onOpenAreaKeypad: () => void;
}

export const CultureCoreFieldsCard: React.FC<CultureCoreFieldsCardProps> = ({
  form,
  cultureOptions,
  isSpeciesLocked,
  speciesNotice,
  fieldErrors,
  onStartNewCulture,
  onUpdateForm,
  onSelectCulture,
  onCreateCultureOption,
  onRenameCultureOption,
  onOpenAreaKeypad
}) => (
  <div className="space-y-4">
    {isSpeciesLocked ? (
      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <span className="text-xs font-bold text-slate-600 block">Cultura (espécie) associada</span>
            <span className="text-sm font-black text-[#114037] flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{form.cropLabel}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onStartNewCulture}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#3CA64C] text-xs font-bold text-[#114037]"
          >
            Criar nova Cultura
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Esta parcela já tem momentos ou calibrações associadas. Para mudar de cultura, crie uma nova ficha para manter o histórico intacto.
        </p>
      </div>
    ) : (
      <SearchableRoundedDropdown
        label="Cultura (espécie)"
        required
        placeholder="Selecionar cultura..."
        value={form.cropLabel}
        selectedId={form.cropKey}
        options={cultureOptions}
        allowCustomAdd
        customAddHint="Ex: Macadâmia, Castanheiro..."
        errorMsg={fieldErrors.cropType}
        onCreateCustomOption={onCreateCultureOption}
        onRenameCustomOption={onRenameCultureOption}
        onSelectOption={onSelectCulture}
        testId="cultura-species-dropdown"
      />
    )}

    {speciesNotice && (
      <p className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        {speciesNotice}
      </p>
    )}

    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        Nome da parcela <span className="text-rose-600">*</span>
      </label>
      <input
        type="text"
        value={form.name}
        onChange={(e) => onUpdateForm({ name: e.target.value })}
        placeholder="Ex: Vinha Norte, Talhão A"
        className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#3CA64C]"
      />
      {fieldErrors.name && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{fieldErrors.name}</p>}
    </div>

    <NumericKeypadField
      label="Área da parcela (ha)"
      value={form.area}
      unit="ha"
      placeholder="Opcional — tocar para introduzir"
      helperText="Opcional. Nunca é preenchida automaticamente com valores fictícios."
      errorMsg={fieldErrors.area}
      onOpenKeypad={onOpenAreaKeypad}
      onClear={() => onUpdateForm({ area: '' })}
      testId="cultura-area-field"
    />
  </div>
);
