// src/features/perfis/components/SearchableRoundedDropdown.tsx
// Gatilho e controlo de estado do dropdown pesquisável com cantos arredondados (<= 195 LOC).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CatalogSelectOption } from '../data/cultureCatalogData';
import { findSimilarOptionLabels } from '../services/cultureCustomOptionStorage';
import { SearchableDropdownMenu } from './SearchableDropdownMenu';
import { useDropdownPortalPosition } from './useDropdownPortalPosition';

export interface SearchableRoundedDropdownProps {
  label: string;
  required?: boolean;
  value: string;
  selectedId?: string;
  options: CatalogSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  disabledHint?: string;
  emptyCatalogHint?: string;
  allowCustomAdd?: boolean;
  customAddHint?: string;
  usePortal?: boolean;
  onSelectOption: (option: CatalogSelectOption) => void;
  onClear?: () => void;
  onCreateCustomOption?: (label: string) => Promise<CatalogSelectOption | null>;
  onRenameCustomOption?: (recordId: number, newLabel: string) => Promise<CatalogSelectOption | null>;
  errorMsg?: string;
  testId?: string;
}

export const SearchableRoundedDropdown: React.FC<SearchableRoundedDropdownProps> = (props) => {
  const {
    label, required, value, selectedId, options, placeholder = 'Selecionar...',
    disabled = false, disabledHint, emptyCatalogHint, allowCustomAdd = false,
    customAddHint, usePortal = true, onSelectOption, onClear, onCreateCustomOption, onRenameCustomOption, errorMsg, testId
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [similarPrompt, setSimilarPrompt] = useState<{ label: string; matches: string[] } | null>(null);
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inlineLabel, setInlineLabel] = useState('');
  const [editingOption, setEditingOption] = useState<{ id: number; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { openUp, portalStyle } = useDropdownPortalPosition(containerRef, isOpen, usePortal);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.code && o.code.toLowerCase().includes(q))) : options;
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) setTimeout(() => searchInputRef.current?.focus(), 20);
    setSimilarPrompt(null);
    setLocalError('');
    setIsOpen((p) => !p);
  };

  const handleConfirmCreate = async (rawLabel: string, bypassSimilarity = false) => {
    const trimmed = rawLabel.replace(/\s+/g, ' ').trim();
    if (!trimmed || !onCreateCustomOption) return;
    if (!bypassSimilarity) {
      const similar = findSimilarOptionLabels(options, trimmed);
      if (similar.length > 0) return setSimilarPrompt({ label: trimmed, matches: similar });
    }
    setBusy(true);
    setLocalError('');
    try {
      const created = await onCreateCustomOption(trimmed);
      if (created) {
        onSelectOption(created);
        setQuery('');
        setInlineLabel('');
        setIsAddingInline(false);
        setSimilarPrompt(null);
        setIsOpen(false);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Erro ao guardar opção.');
    } finally {
      setBusy(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (!editingOption || !onRenameCustomOption) return;
    setBusy(true);
    setLocalError('');
    try {
      const updated = await onRenameCustomOption(editingOption.id, editingOption.text);
      if (updated) { onSelectOption(updated); setEditingOption(null); }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Erro ao renomear.');
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); setIsOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, Math.max(0, filtered.length - 1))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, 0)); }
    else if (e.key === 'Enter' && filtered[activeIndex] && !isAddingInline && !editingOption) {
      e.preventDefault();
      onSelectOption(filtered[activeIndex]);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} data-testid={testId}>
      <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
        <label className="block text-xs font-semibold text-[#114037]">{label} {required && <span className="text-red-600">*</span>}</label>
        {value && onClear && !disabled && (
          <button type="button" onClick={onClear} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded-lg">Limpar</button>
        )}
      </div>

      <div className="relative">
        <button
          type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={isOpen}
          onClick={toggleOpen} onKeyDown={handleKeyDown}
          className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors outline-none ${
            disabled ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : isOpen ? 'bg-white border-[#114037] ring-2 ring-[#114037]/15 text-slate-900'
              : 'bg-white border-slate-200 hover:border-slate-300 focus:border-[#114037] focus:ring-2 focus:ring-[#114037]/15 text-slate-900'
          }`}
        >
          <span className={`text-xs font-medium truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {disabled && disabledHint ? disabledHint : value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <SearchableDropdownMenu
            openUp={openUp} menuRef={menuRef} portalStyle={portalStyle} query={query}
            onQueryChange={(q) => { setQuery(q); setActiveIndex(0); setSimilarPrompt(null); }}
            searchInputRef={searchInputRef} filtered={filtered} totalCount={options.length} emptyCatalogHint={emptyCatalogHint}
            selectedId={selectedId} selectedLabel={value} activeIndex={activeIndex} onKeyDown={handleKeyDown}
            onSelect={(opt) => { onSelectOption(opt); setIsOpen(false); }} editingOption={editingOption}
            onStartEdit={(id, lbl) => setEditingOption({ id, text: lbl })}
            onChangeEditText={(text) => setEditingOption((prev) => (prev ? { ...prev, text } : null))}
            onSubmitEdit={handleRenameSubmit} onCancelEdit={() => setEditingOption(null)}
            similarPrompt={similarPrompt} onConfirmSimilar={() => similarPrompt && handleConfirmCreate(similarPrompt.label, true)}
            onCancelSimilar={() => setSimilarPrompt(null)} localError={localError} allowCustomAdd={allowCustomAdd}
            hasCreator={Boolean(onCreateCustomOption)} isAddingInline={isAddingInline} inlineLabel={inlineLabel}
            customAddHint={customAddHint} busy={busy} onStartInlineAdd={() => setIsAddingInline(true)}
            onChangeInlineLabel={setInlineLabel} onTriggerCreate={(lbl) => handleConfirmCreate(lbl)}
          />
        )}
      </div>

      {errorMsg && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{errorMsg}</p>}
    </div>
  );
};
