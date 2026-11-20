// src/features/weather/components/CalibrationNameEditor.tsx
import React, { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface CalibrationNameEditorProps {
  currentName: string;
  isSaving: boolean;
  onSaveName: (nextName: string) => Promise<boolean>;
}

export const CalibrationNameEditor: React.FC<CalibrationNameEditorProps> = ({ currentName, isSaving, onSaveName }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentName);

  useEffect(() => { setDraft(currentName); setEditing(false); }, [currentName]);

  const handleConfirm = async () => {
    const clean = draft.trim();
    if (!clean) return;
    const ok = await onSaveName(clean);
    if (ok) setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Designação da Calibração</span>
          <span className="font-extrabold text-[#114037] truncate block">{currentName}</span>
        </div>
        <button
          type="button"
          onClick={() => { setDraft(currentName); setEditing(true); }}
          aria-label="Editar nome da calibração"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Pencil className="w-3 h-3" /><span>Editar nome</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#3CA64C] p-2.5 flex flex-wrap items-center gap-2 text-xs">
      <input
        type="text"
        value={draft}
        maxLength={120}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Nova designação da calibração"
        className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 outline-none focus:border-[#114037]"
      />
      <button
        type="button"
        disabled={isSaving || draft.trim().length === 0}
        onClick={() => void handleConfirm()}
        className="px-3 py-1.5 rounded-xl bg-[#114037] hover:bg-[#1D734B] text-white font-extrabold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
      >
        <Check className="w-3.5 h-3.5" /><span>Guardar</span>
      </button>
      <button
        type="button"
        onClick={() => { setDraft(currentName); setEditing(false); }}
        className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold inline-flex items-center gap-1 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" /><span>Cancelar</span>
      </button>
    </div>
  );
};
