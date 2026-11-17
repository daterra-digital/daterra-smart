import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IrdAccordionItemProps {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly badgeLabel?: string;
  readonly children: React.ReactNode;
}

export const IrdAccordionItem: React.FC<IrdAccordionItemProps> = ({
  id,
  title,
  summary,
  isOpen,
  onToggle,
  badgeLabel,
  children
}) => (
  <div>
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`ird-acc-${id}`}
      onClick={onToggle}
      className="touch-target w-full px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#3CA64C] cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold text-[#114037]">{title}</span>
        {badgeLabel && (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
            {badgeLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="text-slate-600 font-medium truncate max-w-[260px] sm:max-w-sm">{summary}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        )}
      </div>
    </button>
    {isOpen && (
      <div id={`ird-acc-${id}`} className="px-5 pb-4 pt-2 border-t border-slate-100 space-y-3">
        {children}
      </div>
    )}
  </div>
);
