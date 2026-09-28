import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { DidacticHelp } from '../../concentracao/DidacticHelp';

export type WorkingWidthCriterionId = 'boom_total_width' | 'effective_treated_band' | 'row_spacing';

export interface WorkingWidthCriteriaSelectorProps {
  selectedCriterion: WorkingWidthCriterionId;
  onSelectCriterion: (criterion: WorkingWidthCriterionId) => void;
  isDesktop?: boolean;
}

/** Ícone representativo de Barra Horizontal em Área Total: barra com leques de pulverização sobrepostos */
const BoomIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <line x1="2" y1="5.5" x2="22" y2="5.5" strokeWidth="2.5" />
    <line x1="4" y1="5.5" x2="4" y2="9" />
    <line x1="8.5" y1="5.5" x2="8.5" y2="9" />
    <line x1="12" y1="5.5" x2="12" y2="9" />
    <line x1="15.5" y1="5.5" x2="15.5" y2="9" />
    <line x1="20" y1="5.5" x2="20" y2="9" />
    <path d="M4 9 L1.5 17 h5 Z" fill="currentColor" fillOpacity="0.22" strokeWidth="1.2" />
    <path d="M8.5 9 L6 17 h5 Z" fill="currentColor" fillOpacity="0.22" strokeWidth="1.2" />
    <path d="M12 9 L9.5 17 h5 Z" fill="currentColor" fillOpacity="0.22" strokeWidth="1.2" />
    <path d="M15.5 9 L13 17 h5 Z" fill="currentColor" fillOpacity="0.22" strokeWidth="1.2" />
    <path d="M20 9 L17.5 17 h5 Z" fill="currentColor" fillOpacity="0.22" strokeWidth="1.2" />
    <line x1="1" y1="20" x2="23" y2="20" strokeWidth="1.8" />
  </svg>
);

/** Ícone representativo de Pulverização em Banda: aplicação localizada sob a linha */
const BandIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <line x1="12" y1="3.5" x2="12" y2="7.5" strokeWidth="2.5" />
    <path d="M12 7.5 L7 17.5 h10 Z" fill="currentColor" fillOpacity="0.25" strokeWidth="1.5" />
    <line x1="6.5" y1="18" x2="17.5" y2="18" strokeWidth="2.8" />
    <line x1="1.5" y1="18" x2="5.5" y2="18" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.4" />
    <line x1="18.5" y1="18" x2="22.5" y2="18" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.4" />
    <path d="M7 21 h10" strokeWidth="1.4" />
    <path d="M7 19.5 l-1.2 1.5 1.2 1.5" strokeWidth="1.4" />
    <path d="M17 19.5 l1.2 1.5 -1.2 1.5" strokeWidth="1.4" />
  </svg>
);

/** Ícone representativo de Distância Entrelinha: copas laterais com cota de largura da entrelinha */
const RowSpacingIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 17.5v-4" strokeWidth="2" />
    <circle cx="4" cy="8.5" r="3.2" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
    <path d="M20 17.5v-4" strokeWidth="2" />
    <circle cx="20" cy="8.5" r="3.2" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
    <line x1="1" y1="17.5" x2="23" y2="17.5" strokeWidth="1.5" />
    <line x1="5.5" y1="11" x2="18.5" y2="11" strokeWidth="1.8" />
    <polyline points="7.5,9 5.5,11 7.5,13" strokeWidth="1.8" />
    <polyline points="16.5,9 18.5,11 16.5,13" strokeWidth="1.8" />
    <line x1="4" y1="13" x2="4" y2="17.5" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
    <line x1="20" y1="13" x2="20" y2="17.5" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
  </svg>
);

export const WorkingWidthCriteriaSelector: React.FC<WorkingWidthCriteriaSelectorProps> = ({
  selectedCriterion,
  onSelectCriterion,
  isDesktop: _isDesktop = false
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
      icon: BoomIcon,
      labelKey: 'debitoTotal.assistance.widthCriteria.boom',
      defaultLabel: 'Barra Horizontal',
      descKey: 'debitoTotal.assistance.widthCriteria.boomDescription',
      defaultDesc: 'Culturas baixas e arvenses em área total'
    },
    {
      id: 'effective_treated_band',
      icon: BandIcon,
      labelKey: 'debitoTotal.assistance.widthCriteria.band',
      defaultLabel: 'Pulverização em Banda',
      descKey: 'debitoTotal.assistance.widthCriteria.bandDescription',
      defaultDesc: 'Aplicação localizada na linha ou faixa tratada'
    },
    {
      id: 'row_spacing',
      icon: RowSpacingIcon,
      labelKey: 'debitoTotal.assistance.widthCriteria.rowSpacing',
      defaultLabel: 'Distância Entrelinha',
      descKey: 'debitoTotal.assistance.widthCriteria.rowSpacingDescription',
      defaultDesc: 'Culturas em linha, pomares, vinhas e olivais'
    }
  ];

  return (
    <div
      className="bg-white rounded-2xl md:rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-soft space-y-2.5"
      role="region"
      aria-label={t('debitoTotal.assistance.widthCriteria.title', 'Critério de Largura de Trabalho')}
    >
      {/* Cabeçalho com Título e Botão de Ajuda Contextual */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>{t('debitoTotal.assistance.widthCriteria.title', 'Critério de Largura de Trabalho')}</span>
        </h3>
        <DidacticHelp faqFile="DebitoTotalFAQLargura.md" buttonLabel="Ajuda" />
      </div>

      {/* Botões do Critério em Grelha Horizontal em Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 w-full">
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
              className={`w-full min-h-[52px] p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#114037] focus-visible:outline-offset-2 ${
                isSelected
                  ? 'bg-[#114037] text-white border-[#114037] shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200/90 active:bg-slate-200/70'
              }`}
            >
              {/* Lado Esquerdo: Ícone Agronómico + Textos Legíveis sem Truncate */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-white/15 text-[#3CA64C]'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm sm:text-base font-black leading-tight block">
                    {label}
                  </span>
                  <p
                    className={`text-xs leading-snug mt-0.5 ${
                      isSelected ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {desc}
                  </p>
                </div>
              </div>

              {/* Lado Direito: Indicador de Seleção Ativa */}
              <div
                className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#3CA64C] text-[#114037] shadow-xs'
                    : 'border-2 border-slate-300 bg-transparent'
                }`}
                aria-hidden="true"
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
