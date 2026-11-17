// src/features/perfis/components/CultureMomentEditorBox.tsx
// Formulário de criação/revisão de momento com data DD-MM-AAAA, estádio, medições e motivo de revisão (<= 200 LOC).

import React from 'react';
import { Copy } from 'lucide-react';
import type { CatalogSelectOption } from '../data/cultureCatalogData';
import type { CultureMomentDraftState } from '../services/cultureFormState';
import { DateDdMmYyyyPicker } from './DateDdMmYyyyPicker';
import { NumericKeypadField } from './NumericKeypadField';
import { SearchableRoundedDropdown } from './SearchableRoundedDropdown';

export interface CultureMomentEditorBoxProps {
  cropKey: string;
  stageOptions: CatalogSelectOption[];
  momentDraft: CultureMomentDraftState;
  hasSavedMoments: boolean;
  stageError?: string;
  fieldErrors?: Record<string, string>;
  onDateValidityChange: (valid: boolean) => void;
  onCopyLastMoment: () => void;
  onClose?: () => void;
  onOpenKeypad?: (field: 'canopyHeight' | 'canopyWidth' | 'lai') => void;
  onUpdateMoment: (patch: Partial<CultureMomentDraftState>) => void;
  onCreateStageOption: (label: string) => Promise<CatalogSelectOption | null>;
  onRenameStageOption: (recordId: number, newLabel: string) => Promise<CatalogSelectOption | null>;
}

export const CultureMomentEditorBox: React.FC<CultureMomentEditorBoxProps> = ({
  cropKey,
  stageOptions,
  momentDraft,
  hasSavedMoments,
  stageError,
  fieldErrors = {},
  onDateValidityChange,
  onCopyLastMoment,
  onClose,
  onOpenKeypad,
  onUpdateMoment,
  onCreateStageOption,
  onRenameStageOption
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="text-xs font-extrabold text-[#114037]">
        {momentDraft.editingMomentId ? 'Rever momento existente' : 'Novo momento da cultura'}
      </span>
      <div className="flex items-center gap-2">
        {hasSavedMoments && !momentDraft.editingMomentId && (
          <button
            type="button"
            onClick={onCopyLastMoment}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold text-[#114037] flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-[#3CA64C]" />
            <span>Copiar medições do último momento</span>
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1">
            Ocultar
          </button>
        )}
      </div>
    </div>

    <DateDdMmYyyyPicker
      label="Data da observação"
      isoValue={momentDraft.observedAt}
      onChangeIso={(iso) => onUpdateMoment({ observedAt: iso })}
      onValidityChange={onDateValidityChange}
      required={!momentDraft.editingMomentId}
    />

    <SearchableRoundedDropdown
      label="Estádio fenológico"
      required
      disabled={!cropKey}
      disabledHint="Selecione primeiro a cultura"
      value={momentDraft.stageLabel}
      selectedId={momentDraft.stageOptionId}
      options={stageOptions}
      allowCustomAdd={Boolean(cropKey)}
      customAddHint="Ex: Bagos fechados, Abrolhamento..."
      errorMsg={stageError}
      onCreateCustomOption={onCreateStageOption}
      onRenameCustomOption={onRenameStageOption}
      onSelectOption={(opt) => onUpdateMoment({ stageOptionId: opt.id, stageLabel: opt.label, stageCode: opt.code || '' })}
    />

    {onOpenKeypad && (
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Medições de vegetação deste momento
        </p>
        <NumericKeypadField
          label="Altura da vegetação / copa (m)"
          value={momentDraft.canopyHeight}
          unit="m"
          errorMsg={fieldErrors.canopyHeight}
          onOpenKeypad={() => onOpenKeypad('canopyHeight')}
          onClear={() => onUpdateMoment({ canopyHeight: '' })}
        />
        <NumericKeypadField
          label="Largura / espessura da copa (m)"
          value={momentDraft.canopyWidth}
          unit="m"
          errorMsg={fieldErrors.canopyWidth}
          onOpenKeypad={() => onOpenKeypad('canopyWidth')}
          onClear={() => onUpdateMoment({ canopyWidth: '' })}
        />
        <NumericKeypadField
          label="Índice de Área Foliar (LAI)"
          value={momentDraft.lai}
          helperText="Opcional."
          errorMsg={fieldErrors.lai}
          onOpenKeypad={() => onOpenKeypad('lai')}
          onClear={() => onUpdateMoment({ lai: '' })}
        />
      </div>
    )}

    {momentDraft.editingMomentId && (
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Motivo da revisão (registo de auditoria de data, estádio ou medições)
        </label>
        <input
          type="text"
          value={momentDraft.revisionReason}
          onChange={(e) => onUpdateMoment({ revisionReason: e.target.value })}
          placeholder="Ex: Correção sintética para teste de revisão"
          className="w-full min-h-[44px] px-4 py-2 rounded-2xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#3CA64C]"
        />
      </div>
    )}

    <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer text-xs font-bold text-slate-800">
      <input
        type="checkbox"
        checked={momentDraft.markAsActive}
        onChange={(e) => onUpdateMoment({ markAsActive: e.target.checked })}
        className="w-4 h-4 accent-[#114037] rounded"
      />
      <span>Definir como momento atual</span>
    </label>
  </div>
);
