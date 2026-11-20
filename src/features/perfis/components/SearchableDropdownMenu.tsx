// src/features/perfis/components/SearchableDropdownMenu.tsx
// Lista flutuante pesquisável, edição inline e delegação do rodapé de adição local (<= 150 LOC).

import React from 'react';
import { createPortal } from 'react-dom';
import { Check, Pencil, Search, X } from 'lucide-react';
import type { CatalogSelectOption } from '../data/cultureCatalogData';
import { DropdownFooterActions } from './DropdownFooterActions';

export interface SearchableDropdownMenuProps {
  openUp: boolean;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  portalStyle?: React.CSSProperties | null;
  query: string;
  onQueryChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  filtered: CatalogSelectOption[];
  totalCount: number;
  emptyCatalogHint?: string;
  selectedId?: string;
  selectedLabel: string;
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSelect: (opt: CatalogSelectOption) => void;
  editingOption: { id: number; text: string } | null;
  onStartEdit: (id: number, label: string) => void;
  onChangeEditText: (text: string) => void;
  onSubmitEdit: () => void;
  onCancelEdit: () => void;
  similarPrompt: { label: string; matches: string[] } | null;
  onConfirmSimilar: () => void;
  onCancelSimilar: () => void;
  localError: string;
  allowCustomAdd: boolean;
  hasCreator: boolean;
  isAddingInline: boolean;
  inlineLabel: string;
  customAddHint?: string;
  busy: boolean;
  onStartInlineAdd: () => void;
  onChangeInlineLabel: (val: string) => void;
  onTriggerCreate: (rawLabel: string) => void;
}

export const SearchableDropdownMenu: React.FC<SearchableDropdownMenuProps> = (props) => {
  const {
    openUp, menuRef, portalStyle, query, onQueryChange, searchInputRef, filtered, totalCount, emptyCatalogHint,
    selectedId, selectedLabel, activeIndex, onKeyDown, onSelect, editingOption, onStartEdit,
    onChangeEditText, onSubmitEdit, onCancelEdit, busy
  } = props;

  const content = (
    <div
      ref={menuRef}
      role="listbox"
      style={portalStyle ?? undefined}
      className={`${portalStyle ? '' : `absolute left-0 right-0 z-50 ${openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`} rounded-2xl overflow-hidden border border-slate-200 bg-white p-1.5 shadow-xl`}
    >
      <div className="p-2 mb-1 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onKeyDown={onKeyDown}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Pesquisar..."
          className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
        />
        {query && (
          <button type="button" onClick={() => onQueryChange('')} aria-label="Limpar pesquisa" className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="max-h-[min(14rem,42vh)] overflow-y-auto space-y-0.5">
        {filtered.length === 0 && (
          <p className="px-3 py-3 text-xs text-slate-500">
            {totalCount === 0 && emptyCatalogHint ? emptyCatalogHint : 'Nenhuma opção encontrada.'}
          </p>
        )}
        {filtered.map((opt, idx) => {
          const isSelected = selectedId ? selectedId === opt.id : selectedLabel === opt.label;
          return (
            <div
              key={opt.id}
              role="option"
              aria-selected={isSelected}
              className={`px-3 min-h-[40px] py-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer text-xs transition-colors ${
                isSelected
                  ? 'bg-[#114037] text-white'
                  : idx === activeIndex
                    ? 'bg-emerald-50/70 text-[#114037]'
                    : 'text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => onSelect(opt)}
            >
              <div className="min-w-0 flex-1">
                <span className={`font-semibold block truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{opt.label}</span>
                {opt.code && <span className={`text-[11px] font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>{opt.code}</span>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {opt.isPendingLocal && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">Pendente</span>
                )}
                {opt.isPendingLocal && opt.localRecordId && (
                  <button
                    type="button"
                    aria-label={`Editar ${opt.label}`}
                    onClick={(e) => { e.stopPropagation(); onStartEdit(opt.localRecordId!, opt.label); }}
                    className={`p-1.5 rounded-lg ${isSelected ? 'text-white hover:bg-white/15' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>
          );
        })}
      </div>

      {editingOption && (
        <div className="p-3 mt-1 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
          <p className="text-[11px] font-bold text-slate-700">Renomear opção local</p>
          <div className="flex gap-2">
            <input type="text" value={editingOption.text} onChange={(e) => onChangeEditText(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white" />
            <button type="button" disabled={busy} onClick={onSubmitEdit} className="px-3 py-2 rounded-xl bg-[#114037] text-white text-xs font-bold">Guardar</button>
            <button type="button" onClick={onCancelEdit} className="px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold">Cancelar</button>
          </div>
        </div>
      )}

      <DropdownFooterActions {...props} />
    </div>
  );

  if (portalStyle && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};
