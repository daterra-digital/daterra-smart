// src/features/perfis/components/DateDdMmYyyyPicker.tsx
// Seletor de data civil sempre visível no formato DD-MM-AAAA com calendário inline sem cortes (<= 200 LOC).

import React, { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { DaterraCalendarPopover } from './DaterraCalendarPopover';
import { formatIsoCivilToDdMmYyyy, isValidIsoCivilDate, parseDdMmYyyyToIso } from '../services/cultureDateUtils';

export interface DateDdMmYyyyPickerProps {
  label: string;
  isoValue: string | null;
  onChangeIso: (nextIso: string | null) => void;
  onValidityChange?: (isValid: boolean) => void;
  required?: boolean;
}

export const DateDdMmYyyyPicker: React.FC<DateDdMmYyyyPickerProps> = ({
  label,
  isoValue,
  onChangeIso,
  onValidityChange,
  required
}) => {
  const [textValue, setTextValue] = useState(() =>
    isoValue && isValidIsoCivilDate(isoValue) ? formatIsoCivilToDdMmYyyy(isoValue) : ''
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const validityRef = useRef(onValidityChange);
  validityRef.current = onValidityChange;

  useEffect(() => {
    if (isoValue && isValidIsoCivilDate(isoValue)) {
      setTextValue(formatIsoCivilToDdMmYyyy(isoValue));
      setErrorMsg('');
      validityRef.current?.(true);
    } else if (isoValue === null) {
      setTextValue('');
      setErrorMsg('');
      validityRef.current?.(!required);
    }
  }, [isoValue, required]);

  useEffect(() => {
    if (calendarOpen && calendarContainerRef.current) {
      calendarContainerRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [calendarOpen]);

  const handleTextChange = (raw: string) => {
    const cleaned = raw.replace(/[^\d-/]/g, '').slice(0, 10);
    setTextValue(cleaned);

    if (!cleaned.trim()) {
      setErrorMsg(required ? 'Indique a data no formato DD-MM-AAAA.' : '');
      onValidityChange?.(!required);
      onChangeIso(null);
      return;
    }

    if (cleaned.length < 10) {
      setErrorMsg('Formato completo esperado: DD-MM-AAAA.');
      onValidityChange?.(false);
      return;
    }

    const parsed = parseDdMmYyyyToIso(cleaned);
    if (!parsed) {
      setErrorMsg('Data inválida. Verifique o dia, mês e ano no formato DD-MM-AAAA.');
      onValidityChange?.(false);
      return;
    }

    setErrorMsg('');
    onValidityChange?.(true);
    onChangeIso(parsed);
  };

  return (
    <div ref={calendarContainerRef} className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#114037] whitespace-nowrap truncate">
        {label}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD-MM-AAAA"
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          aria-label={`${label} (DD-MM-AAAA)`}
          className="flex-1 h-[44px] px-4 rounded-xl border border-slate-200 bg-white text-xs font-mono-numbers font-bold text-slate-900 outline-none focus:border-[#114037]"
        />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen((p) => !p)}
          className="h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 text-xs font-bold touch-target shrink-0"
          title="Abrir calendário"
        >
          <Calendar className="w-4 h-4 text-[#1D734B]" />
        </button>
      </div>

      {calendarOpen && (
        <DaterraCalendarPopover
          isoValue={isoValue}
          onClose={() => setCalendarOpen(false)}
          onSelectIso={(iso) => {
            setErrorMsg('');
            onValidityChange?.(true);
            onChangeIso(iso);
          }}
        />
      )}

      {isoValue === null && !textValue && (
        <p className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
          Data desconhecida (legado). Indique DD-MM-AAAA se desejar atualizar.
        </p>
      )}
      {errorMsg && <p role="alert" className="text-xs font-semibold text-rose-700">{errorMsg}</p>}
    </div>
  );
};
