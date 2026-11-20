// src/features/weather/components/ContextSelectField.tsx
import React, { useMemo } from 'react';
import { SearchableRoundedDropdown } from '../../perfis/components/SearchableRoundedDropdown';
import type { CatalogSelectOption } from '../../perfis/data/cultureCatalogData';

export interface ContextSelectFieldProps {
  label: string;
  value: number | string;
  onChange: (val: string) => void;
  options: { id?: number | string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}

export const ContextSelectField: React.FC<ContextSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false
}) => {
  const catalogOptions = useMemo<CatalogSelectOption[]>(
    () => options.map((opt, idx) => ({ id: String(opt.id ?? idx), label: opt.label })),
    [options]
  );

  const selectedStr = value !== '' && value != null ? String(value) : '';
  const selectedOpt = catalogOptions.find((o) => o.id === selectedStr);

  return (
    <SearchableRoundedDropdown
      label={label}
      value={selectedOpt?.label ?? ''}
      selectedId={selectedStr || undefined}
      options={catalogOptions}
      placeholder={placeholder}
      disabled={disabled}
      usePortal
      onSelectOption={(opt) => onChange(opt.id)}
      onClear={selectedStr ? () => onChange('') : undefined}
    />
  );
};

export const DaterraSelect = ContextSelectField;
