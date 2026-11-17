// src/features/perfis/components/DaterraCalendarPopover.tsx
// Calendário mensal DATERRA (verde #114037 / acento #3CA64C), data civil sem fuso, fecho com Escape (<= 145 LOC).

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isValidIsoCivilDate, todayIsoCivil } from '../services/cultureDateUtils';

export interface DaterraCalendarPopoverProps {
  isoValue: string | null;
  onSelectIso: (iso: string) => void;
  onClose: () => void;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export const DaterraCalendarPopover: React.FC<DaterraCalendarPopoverProps> = ({ isoValue, onSelectIso, onClose }) => {
  const today = todayIsoCivil();
  const base = isoValue && isValidIsoCivilDate(isoValue) ? isoValue : today;
  const [view, setView] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 });
  const rootRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); } };
    const onDown = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) onCloseRef.current(); };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('mousedown', onDown); };
  }, []);

  const shiftMonth = (delta: number) =>
    setView((v) => {
      const total = v.y * 12 + v.m + delta;
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
    });

  const firstWeekday = (new Date(Date.UTC(view.y, view.m, 1)).getUTCDay() + 6) % 7; // Segunda = 0
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: Array<number | null> = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Escolher data no calendário"
      className="absolute z-50 mt-2 right-0 w-[19rem] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-2"
    >
      <div className="flex items-center justify-between bg-[#114037] text-white rounded-xl px-2 py-1.5">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="Mês anterior" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-extrabold">{MONTHS[view.m]} {view.y}</span>
        <button type="button" onClick={() => shiftMonth(1)} aria-label="Mês seguinte" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
        {WEEKDAYS.map((w, i) => <span key={`${w}-${i}`}>{w}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <span key={`e-${idx}`} />;
          const iso = toIso(view.y, view.m, day);
          const selected = iso === isoValue;
          const isToday = iso === today;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => { onSelectIso(iso); onClose(); }}
              aria-label={`${pad(day)}-${pad(view.m + 1)}-${view.y}`}
              aria-pressed={selected}
              className={`min-h-[40px] rounded-xl text-xs font-mono-numbers font-bold transition-colors ${
                selected ? 'bg-[#3CA64C] text-white' : isToday ? 'border border-[#3CA64C] text-[#114037]' : 'text-slate-800 hover:bg-emerald-50'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => { onSelectIso(today); onClose(); }}
        className="w-full min-h-[44px] rounded-xl border border-slate-300 hover:border-[#3CA64C] text-xs font-extrabold text-[#114037]"
      >
        Hoje
      </button>
    </div>
  );
};
