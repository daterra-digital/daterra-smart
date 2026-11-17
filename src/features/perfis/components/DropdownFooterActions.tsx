// src/features/perfis/components/DropdownFooterActions.tsx
// Rodapé de adição local privada, deteção de semelhantes e erros para SearchableDropdownMenu (<= 130 LOC).

import React from 'react';
import { Plus } from 'lucide-react';

export interface DropdownFooterActionsProps {
  query: string;
  inlineLabel: string;
  customAddHint?: string;
  isAddingInline: boolean;
  allowCustomAdd: boolean;
  hasCreator: boolean;
  busy: boolean;
  localError: string;
  similarPrompt: { label: string; matches: string[] } | null;
  onStartInlineAdd: () => void;
  onChangeInlineLabel: (val: string) => void;
  onTriggerCreate: (rawLabel: string) => void;
  onConfirmSimilar: () => void;
  onCancelSimilar: () => void;
}

export const DropdownFooterActions: React.FC<DropdownFooterActionsProps> = ({
  query,
  inlineLabel,
  customAddHint,
  isAddingInline,
  allowCustomAdd,
  hasCreator,
  busy,
  localError,
  similarPrompt,
  onStartInlineAdd,
  onChangeInlineLabel,
  onTriggerCreate,
  onConfirmSimilar,
  onCancelSimilar
}) => {
  const candidate = query.trim() || inlineLabel.trim();

  return (
    <>
      {similarPrompt && (
        <div className="p-3 border-t border-amber-200 bg-amber-50 space-y-2">
          <p className="text-[11px] text-amber-950 font-semibold">
            Opções semelhantes encontradas: {similarPrompt.matches.join(', ')}. Deseja guardar "{similarPrompt.label}" como opção local?
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={onConfirmSimilar} className="px-3 py-1.5 rounded-xl bg-[#114037] text-white text-xs font-bold">
              Confirmar e adicionar
            </button>
            <button type="button" onClick={onCancelSimilar} className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-amber-950">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {localError && <p className="px-3 py-2 text-[11px] font-semibold text-rose-700 bg-rose-50 border-t border-rose-200">{localError}</p>}

      {allowCustomAdd && hasCreator && (
        <div className="p-2.5 border-t border-slate-200 bg-slate-50">
          {isAddingInline || query.trim() ? (
            <div className="space-y-2">
              {!query.trim() && (
                <input
                  type="text"
                  value={inlineLabel}
                  onChange={(e) => onChangeInlineLabel(e.target.value)}
                  placeholder={customAddHint || 'Escreva a nova opção...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                />
              )}
              <button
                type="button"
                disabled={busy || !candidate}
                onClick={() => onTriggerCreate(candidate)}
                className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#114037] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar "{candidate || '...'}" (uso local privado)</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartInlineAdd}
              className="w-full min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold text-[#1D734B] hover:bg-emerald-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar outra opção</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};
