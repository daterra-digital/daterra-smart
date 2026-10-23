// src/features/agri-chat/components/ChatDesktopSidebar.tsx
import React, { useState } from 'react';
import { Lock, Tractor, SlidersHorizontal, Check } from 'lucide-react';
import type { Skill, SkillId, ActiveExplorationContext } from '../types';
import { SKILLS_CATALOG } from '../data/skillsCatalog';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/db';
import { ExplorationProfileDropdowns } from './ExplorationProfileDropdowns';

interface ChatDesktopSidebarProps {
  activeSkillId: SkillId;
  unlockedSkills: Record<SkillId, boolean>;
  onSelectSkill: (id: SkillId) => void;
  onRequestUnlock: (skill: Skill) => void;
  cultures: ProfileCulture[];
  equipments: ProfileEquipment[];
  nozzles: ProfileNozzle[];
  calibrations: ProfileCalibration[];
  activeContext: ActiveExplorationContext;
  isContextEnabled: boolean;
  onToggleContext: (enabled: boolean) => void;
  onUpdateContext: (updates: Partial<ActiveExplorationContext>) => void;
}

export const ChatDesktopSidebar: React.FC<ChatDesktopSidebarProps> = ({
  activeSkillId,
  unlockedSkills,
  onSelectSkill,
  onRequestUnlock,
  cultures,
  equipments,
  nozzles,
  calibrations,
  activeContext,
  isContextEnabled,
  onToggleContext,
  onUpdateContext
}) => {
  const [isEditingContext, setIsEditingContext] = useState(false);
  const hasProfiles = cultures.length > 0 || equipments.length > 0;

  return (
    <aside className="hidden lg:flex lg:col-span-4 flex-col gap-3.5 bg-white rounded-3xl border border-slate-200 p-4 shadow-soft overflow-hidden h-full">
      {/* Bloco 1: Contexto de Exploração Ativo */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 shrink-0">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
          <span className="text-[11px] font-black uppercase tracking-wider text-daterra-primary flex items-center gap-1.5">
            <Tractor className="w-4 h-4 text-daterra-accent" />
            Contexto de Exploração
          </span>
          <button
            onClick={() => onToggleContext(!isContextEnabled)}
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              isContextEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isContextEnabled ? 'ATIVO' : 'DESLIGADO'}
          </button>
        </div>

        {isContextEnabled ? (
          isEditingContext && hasProfiles ? (
            <div className="space-y-3 pt-1">
              <ExplorationProfileDropdowns
                cultures={cultures}
                equipments={equipments}
                nozzles={nozzles}
                calibrations={calibrations}
                activeContext={activeContext}
                onUpdateContext={onUpdateContext}
                layout="vertical"
              />
              <button
                onClick={() => setIsEditingContext(false)}
                className="w-full py-2 bg-daterra-primary hover:bg-daterra-secondary text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Concluir Seleção</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Cultura / Parcela:</span>
                <span className="font-bold text-slate-800 truncate max-w-[170px]" title={activeContext.cultureName}>
                  {activeContext.cultureName || 'Não definida'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Equipamento:</span>
                <span className="font-bold text-slate-800 truncate max-w-[170px]" title={activeContext.equipmentName}>
                  {activeContext.equipmentName || 'Não definido'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Bicos Instalados:</span>
                <span className="font-bold text-slate-800 truncate max-w-[170px]" title={activeContext.nozzleName}>
                  {activeContext.nozzleName || 'Padrão'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-semibold">Calibração:</span>
                <span className="font-bold font-mono text-amber-700">
                  {activeContext.calibrationPressureBar ? `${activeContext.calibrationPressureBar} bar` : '—'} • {activeContext.calibrationSpeedKmh ? `${activeContext.calibrationSpeedKmh} km/h` : '—'}
                </span>
              </div>

              {hasProfiles && (
                <button
                  onClick={() => setIsEditingContext(true)}
                  className="mt-2.5 w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Alterar Contexto</span>
                </button>
              )}
            </div>
          )
        ) : (
          <p className="text-[11px] text-slate-500 italic py-1">
            Modo genérico ativo. Ative para cruzar dados com os seus perfis de campo.
          </p>
        )}
      </div>

      {/* Bloco 2: Catálogo das 10 Skills (Lista Vertical sem Cortes) */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Skills Agronómicas (10)
          </span>
          <span className="text-[10px] text-slate-400 font-bold">1 Ativa por Sessão</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scroll">
          {SKILLS_CATALOG.map((skill) => {
            const isUnlocked = unlockedSkills[skill.id];
            const isActive = activeSkillId === skill.id;

            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => {
                  if (isUnlocked) onSelectSkill(skill.id);
                  else onRequestUnlock(skill);
                }}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#114037] text-white shadow-xs ring-2 ring-daterra-accent'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {isUnlocked ? (
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isActive ? 'bg-daterra-lime animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className={`font-extrabold text-xs block truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {skill.name}
                    </span>
                    <span className={`text-[10px] block truncate ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {skill.shortDescription}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isUnlocked
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isUnlocked ? `v${skill.version}` : 'PRO'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
