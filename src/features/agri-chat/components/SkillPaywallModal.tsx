// src/features/agri-chat/components/SkillPaywallModal.tsx
import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import type { Skill } from '../types';

interface SkillPaywallModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmUnlock: (skillId: Skill['id']) => void;
}

export const SkillPaywallModal: React.FC<SkillPaywallModalProps> = ({
  skill,
  isOpen,
  onClose,
  onConfirmUnlock
}) => {
  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div 
        className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
                Módulo Especialista DATERRA
              </span>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{skill.name}</span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  v{skill.version}
                </span>
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 min-h-[36px] min-w-[36px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          {skill.fullDescription}
        </p>

        <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Acesso completo à base regulatória e cálculos avançados</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Respostas validadas com o rigor agronómico DATERRA</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Apoio à decisão em campo direto no smartphone</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Subscrição Mensal</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">
                {skill.monthlyPriceEur.toFixed(2).replace('.', ',')}€
              </span>
              <span className="text-xs text-slate-500">/mês</span>
            </div>
          </div>
          <button
            onClick={() => onConfirmUnlock(skill.id)}
            className="bg-[#114037] hover:bg-[#1D734B] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 min-h-[44px]"
          >
            Ativar Esta Skill
          </button>
        </div>
      </div>
    </div>
  );
};
