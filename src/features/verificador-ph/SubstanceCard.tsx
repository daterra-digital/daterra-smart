import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ActiveSubstance, ResistanceRisk } from './types';

export interface SubstanceCardProps {
  substance: ActiveSubstance;
  onOpenTopic?: (topicId: string) => void;
  onFilterByMoa?: (moaCode: string) => void;
}

const getPhBlockTheme = (idealPh: string) => {
  const normalized = idealPh.toLowerCase();
  if (normalized.includes('ph 3') || normalized.includes('ph 3.5')) {
    return {
      container: 'bg-rose-50/90 border-rose-200 text-rose-950',
      label: 'text-rose-700',
      value: 'text-rose-950',
      badge: 'bg-rose-500/15 text-rose-900 border-rose-300',
      tagText: '🔴 Ultra-Ácido (pH 3 a 5)'
    };
  }
  if (normalized.includes('ph 4')) {
    return {
      container: 'bg-amber-50/90 border-amber-200 text-amber-950',
      label: 'text-amber-800',
      value: 'text-amber-950',
      badge: 'bg-amber-500/15 text-amber-900 border-amber-300',
      tagText: '🟡 Ácido Obrigatório (pH 4 a 6)'
    };
  }
  if (normalized.includes('ph 5 a ph 7') || normalized.includes('ph 5.5')) {
    return {
      container: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
      label: 'text-emerald-700',
      value: 'text-[#114037]',
      badge: 'bg-emerald-600/15 text-emerald-900 border-emerald-300',
      tagText: '🟢 Zona Ideal (pH 5 a 7)'
    };
  }
  return {
    container: 'bg-sky-50/90 border-sky-200 text-sky-950',
    label: 'text-sky-700',
    value: 'text-sky-950',
    badge: 'bg-sky-600/15 text-sky-900 border-sky-300',
    tagText: '🔵 Neutro a Alcalino (pH 6 a 8)'
  };
};

const getRiskPresentation = (risk: ResistanceRisk) => {
  switch (risk) {
    case 'Alto':
      return {
        icon: '🔴',
        ruleHint: 'Máx. 1–2 aplicações consecutivas',
        classes: 'bg-rose-50 text-rose-800 border-rose-200'
      };
    case 'Médio':
      return {
        icon: '🟡',
        ruleHint: 'Alternar grupos químicos',
        classes: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    case 'Baixo':
      return {
        icon: '🟢',
        ruleHint: 'Baixo risco / Multissítio',
        classes: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    default:
      return {
        icon: '⚪',
        ruleHint: 'Sem resistência aplicável',
        classes: 'bg-slate-100 text-slate-600 border-slate-200'
      };
  }
};

export const SubstanceCard: React.FC<SubstanceCardProps> = ({
  substance,
  onOpenTopic,
  onFilterByMoa
}) => {
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
              title="Padrão Internacional ISO — Clique para saber mais"
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
            title="Clique para filtrar substâncias deste grupo MoA ou planear rotação"
            className="px-3 py-1 rounded-full bg-indigo-950 hover:bg-indigo-900 text-white border border-indigo-800 font-mono text-xs font-black tracking-wide shadow-2xs shrink-0 cursor-pointer transition-colors"
          >
            🧩 {substance.moa}
          </button>
        </div>

        {/* 2. BLOCO CENTRAL (O ESSENCIAL — pH IDEAL E AÇÃO) */}
        <div
          onClick={() => onOpenTopic?.('ph-ideal')}
          title="Clique para abrir o guia de pH Ideal da Calda"
          className={`p-4 rounded-2xl border ${phTheme.container} space-y-1.5 cursor-pointer hover:opacity-95 transition-opacity`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-wider ${phTheme.label} flex items-center gap-1.5`}>
              <span aria-hidden="true" className="text-sm">🧪</span>
              <span>pH Ideal da Calda</span>
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
          title="Clique para ver as regras operacionais de preparação no depósito"
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
              Instrução Prática no Depósito
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
          <span>{isDetailsOpen ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}</span>
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
                title="Clique para compreender o equilíbrio químico pKa"
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
                title="Clique para ver o guia de Gestão de Resistências"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold cursor-pointer transition-opacity hover:opacity-90 ${riskInfo.classes}`}
              >
                <span aria-hidden="true">{riskInfo.icon}</span>
                <span>Risco:</span>
                <strong className="font-black">{substance.risk}</strong>
                <span className="text-[10px] opacity-80">({riskInfo.ruleHint})</span>
              </button>
            </div>

            {/* Tipo de Pesticida */}
            <p className="text-xs text-slate-500 font-medium px-0.5">
              <span className="font-bold text-slate-600">Tipo de Produto Fitofarmacêutico:</span>{' '}
              {substance.type}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};

export default SubstanceCard;
