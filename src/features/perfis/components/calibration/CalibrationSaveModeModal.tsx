// src/features/perfis/components/calibration/CalibrationSaveModeModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FilePlus2, RefreshCw, ShieldCheck, X } from 'lucide-react';

interface CalibrationSaveModeModalProps {
  isOpen: boolean;
  recordName: string;
  isSaving?: boolean;
  onClose: () => void;
  onConfirmUpdate: (customName?: string) => void;
  onConfirmCreateNew: (customName?: string) => void;
}

export const CalibrationSaveModeModal: React.FC<CalibrationSaveModeModalProps> = ({
  isOpen, recordName, isSaving = false, onClose, onConfirmUpdate, onConfirmCreateNew
}) => {
  const [draftName, setDraftName] = useState(recordName);
  const updateBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDraftName(recordName);
    updateBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isSaving) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, recordName, isSaving, onClose]);

  if (!isOpen) return null;
  const trimmedName = draftName.trim() || undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-save-mode-title"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#114037] text-white p-5 flex items-start justify-between gap-3 border-b-4 border-[#3CA64C]">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3CA64C] text-white text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> Auditoria SHA-256
            </span>
            <h3 id="cal-save-mode-title" className="text-base font-black leading-snug">
              Guardar Perfil de Calibração
            </h3>
            <p className="text-[11px] text-emerald-100/90 break-words">
              Perfil selecionado: <strong>{recordName}</strong>
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <label className="block space-y-1">
            <span className="text-[11px] font-extrabold text-[#114037] block">Nome da Ficha (opcional · útil para distinguir novas fichas)</span>
            <input
              type="text"
              maxLength={120}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder={recordName}
              className="w-full min-h-[44px] px-3.5 rounded-2xl bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#3CA64C] focus:outline-none text-xs font-bold text-[#114037]"
            />
          </label>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 leading-relaxed">
            <p><strong>Atualizar Perfil Selecionado:</strong> substitui o registo atual mantendo a ficha original e renova o selo SHA-256.</p>
            <p><strong>Criar Novo Perfil:</strong> cria uma nova ficha independente com novo selo SHA-256 e mantém o perfil anterior intacto.</p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              ref={updateBtnRef}
              type="button"
              disabled={isSaving}
              onClick={() => onConfirmUpdate(trimmedName)}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-[#1D734B] hover:bg-[#165a3a] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer touch-target disabled:opacity-60"
            >
              <RefreshCw className="w-4 h-4" /><span>{isSaving ? 'A guardar…' : 'Atualizar Perfil Selecionado'}</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onConfirmCreateNew(trimmedName)}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-white hover:bg-emerald-50 border-2 border-[#114037] text-[#114037] text-xs font-black flex items-center justify-center gap-2 cursor-pointer touch-target disabled:opacity-60"
            >
              <FilePlus2 className="w-4 h-4" /><span>Criar Novo Perfil</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="w-full min-h-[44px] px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-extrabold cursor-pointer touch-target"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
