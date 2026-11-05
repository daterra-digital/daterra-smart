/**
 * DATERRA Smart - Componente de Resultado Oficial (P12)
 * Cartão Único Integrado de Preparação, Acordeão Detalhado e Ações (< 200 LOC)
 */

import React, { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, Layers, Edit2 } from 'lucide-react';
import type { ManualCalculationState, ManualCalculationOutput } from '../aplicacaoManualTypes';
import { useLanguage } from '../../../context/LanguageContext';
import { ManualPreparationCard } from './ManualPreparationCard';
import { ManualResultDetailsContent } from './ManualResultDetailsContent';

export interface ManualStepResultProps {
  state: ManualCalculationState;
  output: ManualCalculationOutput;
  historyCount?: number;
  onSaveHistory?: () => Promise<void>;
  onOpenHistory?: () => void;
  onOpenGuide?: () => void;
  onNewCalculation: () => void;
  onEditResponses: () => void;
  onRequestAreaJovem: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export const ManualStepResult: React.FC<ManualStepResultProps> = ({
  state,
  output,
  onNewCalculation,
  onEditResponses,
  onRequestAreaJovem
}) => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const T = state.caldaPrepararL ?? 0;
  const isJovemSemEnsaio = state.plantStage === 'jovem' && !state.hasEnsaio;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Topo Discreto da Ferramenta */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3CA64C] block">
          {state.mode === 'dose'
            ? t('manual.result.badgeDose', 'PULVERIZAÇÃO · DOSE')
            : t('manual.result.badgeConc', 'PULVERIZAÇÃO · CONCENTRAÇÃO')}
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {state.plantStage === 'jovem'
            ? t('manual.result.badgeJovem', 'Planta Jovem')
            : t('manual.result.badgeAdulta', 'Planta Adulta')}
        </span>
      </div>

      {/* Cartão Único e Integrado de Preparação da Calda */}
      <ManualPreparationCard
        caldaPrepararL={T}
        formattedQ={output.formattedQ}
        isSolid={output.isSolid}
        areaTratadaEstimadaM2={output.areaTratadaEstimadaM2}
        isJovemSemEnsaio={isJovemSemEnsaio}
        onRequestAreaJovem={onRequestAreaJovem}
      />

      {/* Acordeão Único: Detalhes do Cálculo (Fechado por Defeito) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer touch-target"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3CA64C]" />
            <span className="text-slate-800 font-extrabold">
              {t('manual.result.showDetails', 'Detalhes do cálculo')}
            </span>
          </div>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showDetails && <ManualResultDetailsContent state={state} output={output} />}
      </div>

      {/* Ações Secundárias no Conteúdo */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onEditResponses}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 touch-target cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('manual.result.editResponses', 'Alterar respostas')}</span>
        </button>

        <button
          type="button"
          onClick={onNewCalculation}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 touch-target cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('manual.result.newCalc', 'Novo cálculo')}</span>
        </button>
      </div>
    </div>
  );
};
