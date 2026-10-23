// src/features/agri-chat/components/ExplorationProfileBar.tsx
import React, { useState } from 'react';
import { Tractor, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/db';
import type { ActiveExplorationContext } from '../types';
import { ExplorationProfileDropdowns } from './ExplorationProfileDropdowns';

interface ExplorationProfileBarProps {
  cultures: ProfileCulture[];
  equipments: ProfileEquipment[];
  nozzles: ProfileNozzle[];
  calibrations: ProfileCalibration[];
  activeContext: ActiveExplorationContext;
  isContextEnabled: boolean;
  onToggleContext: (enabled: boolean) => void;
  onUpdateContext: (updates: Partial<ActiveExplorationContext>) => void;
}

export const ExplorationProfileBar: React.FC<ExplorationProfileBarProps> = ({
  cultures,
  equipments,
  nozzles,
  calibrations,
  activeContext,
  isContextEnabled,
  onToggleContext,
  onUpdateContext
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasProfiles = cultures.length > 0 || equipments.length > 0;

  return (
    <div className="bg-emerald-900/10 border-b border-emerald-800/20 px-4 py-2.5 text-xs sm:text-sm shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Tractor className="w-5 h-5 text-daterra-primary shrink-0" />
          <span className="font-extrabold text-slate-800">Contexto da Exploração:</span>
          
          <button
            onClick={() => onToggleContext(!isContextEnabled)}
            className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors min-h-[30px] ${
              isContextEnabled
                ? 'bg-daterra-primary text-white shadow-xs'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isContextEnabled ? 'ATIVO' : 'DESLIGADO'}
          </button>
        </div>

        {hasProfiles && isContextEnabled && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-daterra-primary hover:underline py-1 px-2 rounded-lg"
          >
            <span>{isExpanded ? 'Ocultar Seletores' : 'Alterar Contexto'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Resumo compacto quando ativado e fechado */}
      {isContextEnabled && !isExpanded && (
        <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-700 overflow-x-auto truncate py-0.5">
          <span className="font-bold text-daterra-primary truncate">
            {activeContext.cultureName || 'Nenhuma cultura selecionada'}
          </span>
          {activeContext.equipmentName && (
            <>
              <span className="text-slate-400">•</span>
              <span className="truncate">{activeContext.equipmentName}</span>
            </>
          )}
          {activeContext.nozzleName && (
            <>
              <span className="text-slate-400">•</span>
              <span className="truncate">{activeContext.nozzleName}</span>
            </>
          )}
          {activeContext.calibrationPressureBar && (
            <>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-slate-900">{activeContext.calibrationPressureBar} bar</span>
            </>
          )}
        </div>
      )}

      {/* Grelha de Seletores (componente dedicado) */}
      {isContextEnabled && isExpanded && hasProfiles && (
        <ExplorationProfileDropdowns
          cultures={cultures}
          equipments={equipments}
          nozzles={nozzles}
          calibrations={calibrations}
          activeContext={activeContext}
          onUpdateContext={onUpdateContext}
        />
      )}

      {!hasProfiles && isContextEnabled && (
        <p className="mt-1.5 text-xs text-amber-800 italic font-medium">
          💡 Sem perfis guardados. Crie a sua cultura e pulverizador no menu <strong>Exploração</strong> para obter diagnósticos automáticos no chat.
        </p>
      )}
    </div>
  );
};
