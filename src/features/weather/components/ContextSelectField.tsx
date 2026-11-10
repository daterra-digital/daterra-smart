// src/features/weather/components/ContextSelectField.tsx
import React from 'react';

interface ContextSelectFieldProps {
  label: string;
  value: number | string;
  onChange: (val: string) => void;
  options: { id?: number | string; label: string }[];
  placeholder: string;
}

export const ContextSelectField: React.FC<ContextSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder
}) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((opt, idx) => (
        <option key={opt.id ?? idx} value={opt.id ?? ''}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
