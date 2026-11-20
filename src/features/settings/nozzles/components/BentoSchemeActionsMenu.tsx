// src/features/settings/nozzles/components/BentoSchemeActionsMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, ChevronDown, Copy, Edit2, Power } from 'lucide-react';

export interface BentoSchemeActionsMenuProps {
  onEditProfileMetadata: () => void;
  onToggleSlotActive?: () => void;
  isSlotActive?: boolean;
  onMirrorLeftRight?: () => void;
  showMirror?: boolean;
  onApplySelectedToAll?: () => void;
}

export const BentoSchemeActionsMenu: React.FC<BentoSchemeActionsMenuProps> = ({
  onEditProfileMetadata,
  onToggleSlotActive,
  isSlotActive = true,
  onMirrorLeftRight,
  showMirror = false,
  onApplySelectedToAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="h-9 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#114037] shadow-2xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer touch-target"
      >
        <span>Ações</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onEditProfileMetadata();
            }}
            className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Edit2 className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Editar Configuração</span>
          </button>

          {onToggleSlotActive && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onToggleSlotActive();
              }}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Power className={`w-4 h-4 shrink-0 ${isSlotActive ? 'text-rose-600' : 'text-[#3CA64C]'}`} />
              <span>{isSlotActive ? 'Fechar Bico Selecionado' : 'Ativar Bico Selecionado'}</span>
            </button>
          )}

          {showMirror && onMirrorLeftRight && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onMirrorLeftRight();
              }}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-[#114037] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#3CA64C] shrink-0" />
              <span>Espelhar Esq ↔ Dir</span>
            </button>
          )}

          {onApplySelectedToAll && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onApplySelectedToAll();
              }}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Copy className="w-4 h-4 text-[#3CA64C] shrink-0" />
              <span>Aplicar a Todos</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
