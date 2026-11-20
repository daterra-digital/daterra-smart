// src/features/settings/equipment/EquipmentFocusedEditorModal.tsx
// Editor Contextual de Equipamentos: Full-Screen no Mobile (< 768px) e Right Drawer no Tablet/Desktop (>= 768px) (<= 200 LOC).

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface EquipmentFocusedEditorModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  children: React.ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const EquipmentFocusedEditorModal: React.FC<EquipmentFocusedEditorModalProps> = ({
  isOpen,
  title,
  subtitle,
  submitLabel = 'Guardar Alterações',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  errorMessage,
  onClose,
  onSubmit,
  children
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        previouslyFocused.current?.focus?.();
      }
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Foco inicial APENAS na transição open: false -> true (nunca rouba o foco ao escrever em Nome/Fabricante/Nº Série).
    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (document.getElementById('daterra-keypad-title')) return;
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="hidden md:block fixed inset-0 z-50 backdrop-blur-sm bg-black/20 transition-opacity animate-fade-in"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 z-50 w-full md:max-w-md bg-[#F8FAF9] md:bg-white shadow-2xl h-full flex flex-col overflow-y-auto md:overflow-hidden outline-none animate-fade-in"
      >
        <div
          className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-slate-200 bg-white"
        >
          <div className="min-w-0 pr-2">
            <h2 className="text-sm font-semibold text-slate-900 break-words">{title}</h2>
            {subtitle && <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar editor"
            className="min-h-[44px] min-w-[44px] -mt-1 -mr-2 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 touch-target shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 md:overflow-y-auto overscroll-contain px-5 pt-4 pb-24 space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800"
            >
              {errorMessage}
            </div>
          )}
          {children}
        </div>

        <div
          className="sticky bottom-0 z-10 flex items-center gap-3 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-white"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 min-h-[48px] rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 touch-target disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              void onSubmit();
            }}
            disabled={isSubmitting}
            className="flex-1 min-h-[48px] rounded-2xl bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-extrabold shadow-md touch-target disabled:opacity-60"
          >
            {isSubmitting ? 'A guardar…' : submitLabel}
          </button>
        </div>
      </div>
    </>
  );
};
