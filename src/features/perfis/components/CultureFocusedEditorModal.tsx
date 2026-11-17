// src/features/perfis/components/CultureFocusedEditorModal.tsx
// Editor Contextual: Full-Screen Slide-in no Mobile (< 768px) e Right Drawer no Tablet/Desktop (>= 768px), foco estável (<= 200 LOC).

import React, { useEffect, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';

export interface CultureFocusedEditorModalProps {
  isOpen: boolean;
  /** Ex.: "A editar: Dados da parcela · Vinha Norte" */
  title: string;
  subtitle?: string;
  size?: 'md' | 'lg';
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  /** Chamado ao premir "Guardar"; o formulário interno não deve ter o seu próprio submit. */
  onSubmit: () => void | Promise<void>;
  children: React.ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const CultureFocusedEditorModal: React.FC<CultureFocusedEditorModalProps> = ({
  isOpen,
  title,
  subtitle,
  submitLabel = 'Guardar',
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

    // Foco inicial APENAS na transição open: false -> true (nunca a cada tecla digitada nos inputs filhos).
    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      // Se o DaterraKeypad estiver aberto por cima, deixar o teclado tratar o Escape/Tab primeiro.
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
      {/* Backdrop Desktop/Tablet para fechar ao clicar fora */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="hidden md:block fixed inset-0 z-50 backdrop-blur-sm bg-black/20 transition-opacity animate-fade-in"
      />

      {/* Mobile (< 768px): Full-Screen Slide-in | Desktop/Tablet (>= 768px): Right Drawer */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 z-50 w-full md:max-w-md bg-white dark:bg-neutral-900 shadow-2xl h-full flex flex-col overflow-y-auto md:overflow-hidden outline-none animate-fade-in"
      >
        {/* Cabeçalho fixo no topo com botão Voltar (mobile) e X */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100 bg-white dark:bg-neutral-900">
          <div className="flex items-start gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Voltar"
              className="md:hidden min-h-[40px] min-w-[40px] -ml-2 -mt-0.5 flex items-center justify-center rounded-xl text-[#114037] hover:bg-slate-100 touch-target shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-[#114037] break-words">{title}</h2>
              {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar editor"
            className="min-h-[44px] min-w-[44px] -mt-1 -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 touch-target shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do formulário com pb-24 para dar espaço livre ao DaterraKeypad */}
        <div className="flex-1 md:overflow-y-auto overscroll-contain px-5 pt-4 pb-24 space-y-4">
          {errorMessage && (
            <div role="alert" className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              {errorMessage}
            </div>
          )}
          {children}
        </div>

        {/* Rodapé de ação fixo na base compatível com sobreposição temporária do DaterraKeypad */}
        <div
          className="sticky bottom-0 z-10 flex items-center gap-3 px-5 pt-3 border-t border-slate-100 bg-white dark:bg-neutral-900"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 min-h-[48px] rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 touch-target disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              void onSubmit();
            }}
            disabled={isSubmitting}
            className="flex-1 min-h-[48px] rounded-2xl bg-[#114037] hover:bg-[#195a4d] text-white text-xs font-extrabold shadow-md touch-target disabled:opacity-60"
          >
            {isSubmitting ? 'A guardar…' : submitLabel}
          </button>
        </div>
      </div>
    </>
  );
};
