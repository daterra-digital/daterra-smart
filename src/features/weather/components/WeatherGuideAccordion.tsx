// src/features/weather/components/WeatherGuideAccordion.tsx
import React from 'react';
import { ChevronDown, BookOpen, CheckCircle, Lightbulb } from 'lucide-react';
import type { GuideQuestion } from '../data/weatherGuideTypes.ts';

interface WeatherGuideAccordionProps {
  item: GuideQuestion;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

export const WeatherGuideAccordion: React.FC<WeatherGuideAccordionProps> = ({
  item,
  isOpen,
  onToggle
}) => {
  const headerId = `guide-header-${item.id}`;
  const panelId = `guide-panel-${item.id}`;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-xs">
      <h3>
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(item.id)}
          className="w-full min-h-[48px] px-4 py-3.5 flex items-center justify-between gap-3 text-left bg-white hover:bg-slate-50/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3CA64C]"
        >
          <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
            {item.question}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-daterra-primary' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="px-4 pb-4 pt-1 space-y-3 text-xs text-slate-700 border-t border-slate-100 bg-slate-50/40 animate-fade-in"
        >
          {/* Resposta Direta em destaque */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 font-medium leading-relaxed flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="font-extrabold text-emerald-900 block mb-0.5">Resposta direta:</strong>
              {item.directAnswer}
            </div>
          </div>

          {/* Como Funciona na DATERRA */}
          <div className="space-y-1">
            <p className="leading-relaxed">
              {item.daterraFunctioning}
            </p>
          </div>

          {/* Orientação Técnica Geral */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-950 leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-[11px] leading-relaxed">
              {item.technicalGuidance}
            </div>
          </div>

          {/* Citações e Fontes de Referência */}
          {item.sourceCitations && item.sourceCitations.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-bold flex items-center gap-1 text-slate-600">
                <BookOpen className="w-3 h-3 text-slate-400" aria-hidden="true" />
                Fontes:
              </span>
              {item.sourceCitations.map((src, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-600"
                >
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
