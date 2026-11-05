/**
 * DATERRA Smart - Cartão Padronizado de Escolha Exclusiva
 * Padrão Canónico: Etiqueta 'Selecionado' com espaço reservado estável (< 200 LOC)
 */

import React from 'react';

export interface ManualChoiceCardProps {
  title: string;
  description?: string;
  subLabel?: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
  ariaLabel?: string;
}

export const ManualChoiceCard: React.FC<ManualChoiceCardProps> = ({
  title,
  description,
  subLabel,
  icon,
  isSelected,
  onSelect,
  className = '',
  ariaLabel
}) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={ariaLabel || `${title}${isSelected ? ' (Selecionado)' : ''}`}
      onClick={onSelect}
      className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 text-left transition-all touch-target cursor-pointer w-full min-h-[110px] sm:min-h-[120px] ${
        isSelected
          ? 'border-[#114037] bg-emerald-50/80 shadow-md ring-2 ring-[#3CA64C]/30'
          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
      } ${className}`}
    >
      {/* Topo: Ícone Semântico + Textos */}
      <div className="flex items-start gap-3.5 w-full">
        {icon && (
          <div className="p-2.5 rounded-2xl bg-[#114037] text-white shrink-0 shadow-2xs">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight">
            {title}
          </span>
          {description && (
            <span className="text-xs text-slate-500 block mt-1 leading-snug">
              {description}
            </span>
          )}
          {subLabel && (
            <span className="text-[11px] font-mono-numbers text-slate-400 block mt-0.5">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {/* Fundo: Espaço Reservado Estável para a Etiqueta 'Selecionado' */}
      <div className="flex justify-end items-center mt-3 w-full">
        {isSelected ? (
          <span className="px-2.5 py-0.5 rounded-full bg-[#114037] text-emerald-200 text-[10px] font-extrabold uppercase tracking-wide shadow-2xs">
            Selecionado
          </span>
        ) : (
          <span
            className="px-2.5 py-0.5 rounded-full text-transparent text-[10px] font-extrabold uppercase tracking-wide border border-transparent select-none"
            aria-hidden="true"
          >
            Selecionado
          </span>
        )}
      </div>
    </button>
  );
};
