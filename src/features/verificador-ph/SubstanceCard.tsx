import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ActiveSubstance } from './types';
import { getPhBlockTheme, getRiskPresentation } from './phPresentationHelpers';
import { useLanguage } from '../../context/LanguageContext';

export interface SubstanceCardProps {
  substance: ActiveSubstance;
  onOpenTopic?: (topicId: string) => void;
  onFilterByMoa?: (moaCode: string) => void;
}

export const SubstanceCard: React.FC<SubstanceCardProps> = ({
  substance,
  onOpenTopic,
  onFilterByMoa
}) => {
  const { t } = useLanguage();
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const phTheme = getPhBlockTheme(substance.idealPh);
  const riskInfo = getRiskPresentation(substance.risk);
  const isNeutralStable = substance.idealPh.toLowerCase().includes('ph 6 a ph 8');

  return (
    <article className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between gap-4 transition-all">
      <div className="space-y-4">
        {/* 1. CABEÇALHO DO CARTÃO (IDENTIFICAÇÃO + CHIP MOA CLICÁVEL) */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 capitalize leading-tight">
              {substance.name}
            </h3>
            <button
              type="button"
              onClick={() => onOpenTopic?.('sa-ingles-iso')}
              title={t('verificadorPh.isoStandardTitle', 'Padrão Internacional ISO — Clique para saber mais')}
              className="text-xs font-semibold text-slate-400 hover:text-[#114037] mt-0.5 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>🌍 {substance.nameEn}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onFilterByMoa && substance.moa !== 'Não aplicável'
                ? onFilterByMoa(substance.moa.split(' (')[0])
                : onOpenTopic?.('codigo-moa')
            }
            title={t('verificadorPh.filterMoaTitle', 'Clique para filtrar substâncias deste grupo MoA ou planear rotação')}
            className="px-3 py-1 rounded-full bg-indigo-950 hover:bg-indigo-900 text-white border border-indigo-800 font-mono text-xs font-black tracking-wide shadow-2xs shrink-0 cursor-pointer transition-colors"
          >
            🧩 {substance.moa}
          </button>
        </div>

        {/* 2. BLOCO CENTRAL (O ESSENCIAL — pH IDEAL E AÇÃO) */}
        <div
          onClick={() => onOpenTopic?.('ph-ideal')}
          title={t('verificadorPh.openPhGuideTitle', 'Clique para abrir o guia de pH Ideal da Calda')}
          className={`p-4 rounded-2xl border ${phTheme.container} space-y-1.5 cursor-pointer hover:opacity-95 transition-opacity`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-wider ${phTheme.label} flex items-center gap-1.5`}>
              <span aria-hidden="true" className="text-sm">🧪</span>
              <span>{t('verificadorPh.idealPhTitle', 'pH Ideal da Calda')}</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${phTheme.badge}`}>
              {phTheme.tagText}
            </span>
          </div>

          <p className={`font-mono text-lg sm:text-xl font-black tracking-tight ${phTheme.value}`}>
            {substance.idealPh}
          </p>
        </div>

        {/* Instrução Prática (Callout Box) */}
        <div
          onClick={() => onOpenTopic?.('instrucao-pratica')}
          title={t('verificadorPh.openPracticalInstructionTitle', 'Clique para ver as regras operacionais de preparação no depósito')}
          className={`p-4 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
            isNeutralStable
              ? 'bg-blue-50/80 hover:bg-blue-50 border-blue-200 text-slate-800'
              : 'bg-amber-50/80 hover:bg-amber-50 border-amber-200 text-slate-800'
          }`}
        >
          <span aria-hidden="true" className="text-base leading-none mt-0.5 shrink-0">
            ⚠️
          </span>
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="font-black text-slate-900 block mb-0.5">
              {t('verificadorPh.practicalInstruction', 'Instrução Prática no Depósito')}
            </strong>
            <span className="font-medium text-slate-700">{substance.instruction}</span>
          </div>
        </div>
      </div>

      {/* 3. INFORMAÇÃO AVANÇADA (PROGRESSIVE DISCLOSURE — ACORDEÃO) */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsDetailsOpen((prev) => !prev)}
          aria-expanded={isDetailsOpen}
          className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer touch-target"
        >
          <span>
            {isDetailsOpen
              ? t('verificadorPh.hideDetails', 'Ocultar detalhes técnicos')
              : t('verificadorPh.showDetails', 'Ver detalhes técnicos')}
          </span>
          {isDetailsOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isDetailsOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 flex-wrap">
              {/* pKa (Equilíbrio Químico) */}
              <button
                type="button"
                onClick={() => onOpenTopic?.('pka-equilibrio')}
                title={t('verificadorPh.pkaTitle', 'Clique para compreender o equilíbrio químico pKa')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                <span aria-hidden="true">⚗️</span>
                <span className="text-slate-500 font-semibold">pKa:</span>
                <span className="font-mono font-black">{substance.pka}</span>
              </button>

              {/* Risco de Resistência */}
              <button
                type="button"
                onClick={() => onOpenTopic?.('risco-resistencia')}
                title={t('verificadorPh.resistanceRiskTitle', 'Clique para ver o guia de Gestão de Resistências')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold cursor-pointer transition-opacity hover:opacity-90 ${riskInfo.classes}`}
              >
                <span aria-hidden="true">{riskInfo.icon}</span>
                <span>{t('verificadorPh.risk', 'Risco:')}</span>
                <strong className="font-black">{substance.risk}</strong>
                <span className="text-[10px] opacity-80">({riskInfo.ruleHint})</span>
              </button>
            </div>

            {/* Tipo de Pesticida */}
            <p className="text-xs text-slate-500 font-medium px-0.5">
              <span className="font-bold text-slate-600">{t('verificadorPh.productType', 'Tipo de Produto Fitofarmacêutico:')}</span>{' '}
              {substance.type}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};

export default SubstanceCard;
