// src/features/agri-chat/components/SkillSelectorBar.tsx
import React from 'react';
import { Lock } from 'lucide-react';
import type { Skill, SkillId } from '../types';
import { SKILLS_CATALOG } from '../data/skillsCatalog';

interface SkillSelectorBarProps {
  activeSkillId: SkillId;
  unlockedSkills: Record<SkillId, boolean>;
  onSelectSkill: (id: SkillId) => void;
  onRequestUnlock: (skill: Skill) => void;
}

export const SkillSelectorBar: React.FC<SkillSelectorBarProps> = ({
  activeSkillId,
  unlockedSkills,
  onSelectSkill,
  onRequestUnlock
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs shrink-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
          Módulo Ativo (1 de cada vez):
        </span>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
          Modo Focado
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 text-xs sm:text-sm">
        {SKILLS_CATALOG.map((skill) => {
          const isActive = skill.id === activeSkillId;
          const isUnlocked = unlockedSkills[skill.id];

          return (
            <button
              key={skill.id}
              onClick={() => {
                if (isUnlocked) {
                  onSelectSkill(skill.id);
                } else {
                  onRequestUnlock(skill);
                }
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all min-h-[42px] select-none ${
                isActive
                  ? 'bg-[#114037] text-white shadow-xs border-2 border-[#114037]'
                  : isUnlocked
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-50 hover:bg-amber-50 text-slate-600 border border-slate-200 hover:border-amber-300'
              }`}
            >
              {isActive ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              ) : isUnlocked ? (
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              
              <span>{skill.name}</span>

              {skill.isPremium && (
                <span className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded ${
                  isUnlocked 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isUnlocked ? 'ATIVO' : 'PRO'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
