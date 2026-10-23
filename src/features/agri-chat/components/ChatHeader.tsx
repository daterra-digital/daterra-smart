// src/features/agri-chat/components/ChatHeader.tsx
import React from 'react';
import { ArrowLeft, Sparkles, Tractor } from 'lucide-react';
import type { Skill, ActiveExplorationContext } from '../types';

interface ChatHeaderProps {
  activeSkill?: Skill;
  onBack: () => void;
  activeContext?: ActiveExplorationContext;
  isContextEnabled?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeSkill,
  onBack,
  activeContext,
  isContextEnabled
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-3 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-daterra-primary tracking-tight">
              Assistente
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{activeSkill?.name || 'Geral'}</span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                (v{activeSkill?.version || '1.0'})
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Inteligência agronómica integrada com os perfis reais da sua exploração.
          </p>
        </div>
      </div>

      {/* Indicador Rápido de Contexto no Topo (Desktop) */}
      {isContextEnabled && activeContext?.cultureName && (
        <div className="hidden md:flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold text-slate-700">
          <Tractor className="w-3.5 h-3.5 text-daterra-accent" />
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
            Parcela:
          </span>
          <span className="text-daterra-primary font-black truncate max-w-[130px]">
            {activeContext.cultureName}
          </span>
          {activeContext.equipmentName && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 truncate max-w-[140px]">
                {activeContext.equipmentName}
              </span>
            </>
          )}
          {activeContext.calibrationPressureBar && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold">
                {activeContext.calibrationPressureBar} bar
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
