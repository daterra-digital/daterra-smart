// src/features/perfis/components/CultureSpatialContextFields.tsx
// Contexto espacial comum (2D e 3D): barreira/quebra-vento, zona sensível, azimute e declive (<= 95 LOC).

import React from 'react';
import type { CultureWindbreakBarrier } from '../../../db/cultureTypes.ts';
import type { CultureV11FormState } from '../services/cultureFormState.ts';
import type { CultureKeypadField } from '../services/cultureKeypadHelpers.ts';
import { WINDBREAK_OPTIONS } from '../data/cultureGeometryOptions.ts';
import { SearchableRoundedDropdown } from './SearchableRoundedDropdown.tsx';
import { NumericKeypadField } from './NumericKeypadField.tsx';

export interface CultureSpatialContextFieldsProps {
  form: CultureV11FormState;
  fieldErrors: Record<string, string>;
  onUpdate: (patch: Partial<CultureV11FormState>) => void;
  onOpenKeypad: (field: CultureKeypadField) => void;
}

export const CultureSpatialContextFields: React.FC<CultureSpatialContextFieldsProps> = ({
  form, fieldErrors, onUpdate, onOpenKeypad
}) => {
  const wbOpt = WINDBREAK_OPTIONS.find((o) => o.id === form.windbreakBarrier);

  return (
    <div className="space-y-4 pt-2 border-t border-slate-100">
      <p className="text-[11px] font-bold tracking-wide uppercase text-[#114037]">
        Contexto Espacial e Exposição da Parcela
      </p>

      <SearchableRoundedDropdown
        label="Barreira / Quebra-vento na bordadura"
        placeholder="Selecionar barreira..."
        value={wbOpt?.label ?? ''}
        selectedId={form.windbreakBarrier}
        options={WINDBREAK_OPTIONS}
        onClear={() => onUpdate({ windbreakBarrier: '' })}
        onSelectOption={(opt) => onUpdate({ windbreakBarrier: opt.id as CultureWindbreakBarrier })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <NumericKeypadField
          label="Distância zona sensível (m)"
          value={form.sensitiveZoneDistanceM}
          unit="m"
          placeholder="Ex: 20"
          errorMsg={fieldErrors.sensitiveZoneDistanceM}
          onOpenKeypad={() => onOpenKeypad('sensitiveZoneDistanceM')}
          onClear={() => onUpdate({ sensitiveZoneDistanceM: '' })}
        />
        <NumericKeypadField
          label="Orientação linhas (0–180°)"
          value={form.rowAzimuthDeg}
          unit="°"
          placeholder="Ex: 45"
          errorMsg={fieldErrors.rowAzimuthDeg}
          onOpenKeypad={() => onOpenKeypad('rowAzimuthDeg')}
          onClear={() => onUpdate({ rowAzimuthDeg: '' })}
        />
        <NumericKeypadField
          label="Declive da parcela (%)"
          value={form.parcelSlopePct}
          unit="%"
          placeholder="Ex: 5,0"
          errorMsg={fieldErrors.parcelSlopePct}
          onOpenKeypad={() => onOpenKeypad('parcelSlopePct')}
          onClear={() => onUpdate({ parcelSlopePct: '' })}
        />
      </div>
    </div>
  );
};
