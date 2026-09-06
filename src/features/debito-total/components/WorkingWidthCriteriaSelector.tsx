import React from 'react';
import { Maximize2, Columns, Rows } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export type WorkingWidthCriterionId = 'boom_total_width' | 'effective_treated_band' | 'row_spacing';

export interface WorkingWidthCriteriaSelectorProps {
  selectedCriterion: WorkingWidthCriterionId;
  onSelectCriterion: (criterion: WorkingWidthCriterionId) => void;
  isDesktop?: boolean;
}

export const WorkingWidthCriteriaSelector: React.FC<WorkingWidthCriteriaSelectorProps> = ({
  selectedCriterion,
  onSelectCriterion,
  isDesktop = false
}) => {
  const { t } = useLanguage();

  const criteriaList: Array<{
    id: WorkingWidthCriterionId;
    icon: React.ComponentType<{ className?: string }>;
    labelKey: string;
    defaultLabel: string;
    descKey: string;
    defaultDesc: string;
  }> = [
    {
      id: 'boom_total_width',
      icon: Maximize2,
      labelKey: 'debitoTotal.assistance.widthCriteria.boom',
      defaultLabel: 'Barra Horizontal',
      descKey: 'debitoTotal.assistance.widthCriteria.boomDescription',
      defaultDesc: 'Culturas baixas e arvenses em área total'
    },
    {
      id: 'effective_treated_band',
      icon: Columns,
      labelKey: 'debitoTotal.assistance.widthCriteria.band',
      defaultLabel: 'Pulverização em Faixa',
      descKey: 'debitoTotal.assistance.widthCriteria.bandDescription',
      defaultDesc: 'Aplicação localizada na linha ou faixa tratada'
    },
    {
      id: 'row_spacing',
      icon: Rows,
      labelKey: 'debitoTotal.assistance.widthCriteria.rowSpacing',
      defaultLabel: 'Distância Entrelinhas',
      descKey: 'debitoTotal.assistance.widthCriteria.rowSpacingDescription',
      defaultDesc: 'Culturas em linha, pomares, vinhas e olivais'
    }
  ];

  return (
    <div
      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-3"
      role="region"
      aria-label={t('debitoTotal.assistance.widthCriteria.title', 'Critério de Largura de Trabalho')}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>{t('debitoTotal.assistance.widthCriteria.title', 'Critério de Largura de Trabalho')}</span>
        </h3>
      </div>

      {/* Grelha Adaptativa: 1 coluna em ecrãs estreitos, 3 colunas em ecrãs médios/desktop */}
      <div
        className={`grid gap-2.5 ${
          isDesktop ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'
        }`}
      >
        {criteriaList.map((crit) => {
          const isSelected = selectedCriterion === crit.id;
          const Icon = crit.icon;
          const label = t(crit.labelKey, crit.defaultLabel);
          const desc = t(crit.descKey, crit.defaultDesc);

          return (
            <button
              key={crit.id}
              type="button"
              onClick={() => onSelectCriterion(crit.id)}
              aria-pressed={isSelected}
              aria-label={`${label}. ${desc}`}
              className={`min-h-[48px] p-3 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#114037] focus-visible:outline-offset-2 ${
                isSelected
                  ? 'bg-[#114037] text-white border-[#114037] shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200/90 active:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-[#3CA64C]' : 'text-[#1D734B]'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-xs sm:text-sm font-black leading-tight truncate">
                  {label}
                </span>
              </div>
              <p
                className={`text-[11px] leading-snug line-clamp-2 ${
                  isSelected ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
