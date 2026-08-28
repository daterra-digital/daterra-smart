import React, { useState } from 'react';
import { HelpCircle, Info, X, ExternalLink, ChevronDown, BookOpen } from 'lucide-react';

import faqConcGeral from './ConcentracaoFAQGeral.md?raw';
import faqConcVolumePreparar from './ConcentracaoFAQVolumePreparar.md?raw';
import faqConcConcentracao from './ConcentracaoFAQConcentracao.md?raw';
import faqConcVolumeRecomendado from './ConcentracaoFAQVolumeRecomendado.md?raw';
import faqConcVolumeAplicado from './ConcentracaoFAQVolumeAplicado.md?raw';

import faqDoseGeral from '../dose/DoseFAQGeral.md?raw';
import faqDoseVolumePreparar from '../dose/DoseFAQVolumePreparar.md?raw';
import faqDoseDoseRecomendada from '../dose/DoseFAQDoseRecomendada.md?raw';
import faqDoseVolumeAplicado from '../dose/DoseFAQVolumeAplicado.md?raw';

import faqAreaParedeFoliar from '../area-parede-foliar/AreaParedeFoliarFAQ.md?raw';
import faqAreaParedeFoliarMicro from '../area-parede-foliar/AreaParedeFoliarMicrolearning.md?raw';

export type FAQFileType =
  | 'ConcentracaoFAQGeral.md'
  | 'ConcentracaoFAQVolumePreparar.md'
  | 'ConcentracaoFAQConcentracao.md'
  | 'ConcentracaoFAQVolumeRecomendado.md'
  | 'ConcentracaoFAQVolumeAplicado.md'
  | 'DoseFAQGeral.md'
  | 'DoseFAQVolumePreparar.md'
  | 'DoseFAQDoseRecomendada.md'
  | 'DoseFAQVolumeAplicado.md'
  | 'AreaParedeFoliarFAQ.md'
  | 'AreaParedeFoliarMicrolearning.md';

const faqMap: Record<string, string> = {
  'ConcentracaoFAQGeral.md': faqConcGeral,
  'ConcentracaoFAQVolumePreparar.md': faqConcVolumePreparar,
  'ConcentracaoFAQConcentracao.md': faqConcConcentracao,
  'ConcentracaoFAQVolumeRecomendado.md': faqConcVolumeRecomendado,
  'ConcentracaoFAQVolumeAplicado.md': faqConcVolumeAplicado,
  'DoseFAQGeral.md': faqDoseGeral,
  'DoseFAQVolumePreparar.md': faqDoseVolumePreparar,
  'DoseFAQDoseRecomendada.md': faqDoseDoseRecomendada,
  'DoseFAQVolumeAplicado.md': faqDoseVolumeAplicado,
  'AreaParedeFoliarFAQ.md': faqAreaParedeFoliar,
  'AreaParedeFoliarMicrolearning.md': faqAreaParedeFoliarMicro,
  'area-parede-foliar-altura': faqAreaParedeFoliar,
  'area-parede-foliar-entrelinha': faqAreaParedeFoliar,
  'area-parede-foliar': faqAreaParedeFoliar
};

export interface DidacticHelpProps {
  faqFile?: FAQFileType;
  topic?: string;
  buttonLabel?: string;
  variant?: 'icon' | 'button';
  iconType?: 'help' | 'info';
  className?: string;
}

interface ParsedFAQSection {
  question: string;
  answerLines: string[];
}

function parseMarkdownFAQ(mdText: string): { title: string; sections: ParsedFAQSection[] } {
  if (!mdText) return { title: 'Microlearning DATERRA', sections: [] };

  const lines = mdText.replace(/\r\n/g, '\n').split('\n');
  let title = 'Microlearning';
  const sections: ParsedFAQSection[] = [];
  let currentQuestion = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      title = trimmed.replace(/^#\s*/, '').trim();
    } else if (trimmed.startsWith('## ')) {
      if (currentQuestion) {
        sections.push({ question: currentQuestion, answerLines: [...currentLines] });
      }
      currentQuestion = trimmed.replace(/^##\s*/, '').trim();
      currentLines = [];
    } else if (trimmed) {
      if (currentQuestion && !trimmed.startsWith('## Saber Mais') && !trimmed.includes('https://academia.daterra.com.pt')) {
        currentLines.push(trimmed);
      }
    }
  }

  if (currentQuestion && currentQuestion !== 'Saber Mais') {
    sections.push({ question: currentQuestion, answerLines: [...currentLines] });
  }

  return { title, sections };
}

export const DidacticHelp: React.FC<DidacticHelpProps> = ({
  faqFile,
  topic,
  buttonLabel = 'Ajuda',
  variant = 'button',
  iconType = 'info',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openAccordionIdxs, setOpenAccordionIdxs] = useState<Record<number, boolean>>({ 0: true });

  const rawContent = (faqFile ? faqMap[faqFile] : '') || (topic ? faqMap[topic] : '') || '';
  const { title, sections } = parseMarkdownFAQ(rawContent);

  const toggleAccordion = (idx: number) => {
    setOpenAccordionIdxs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const IconComp = iconType === 'help' ? HelpCircle : Info;

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`min-w-[44px] min-h-[44px] p-2.5 text-[#1D734B] hover:text-[#114037] bg-[#F2F2F2] hover:bg-[#3CA64C]/20 rounded-xl transition-all flex items-center justify-center touch-target ${className}`}
          title={title}
          aria-label={buttonLabel || title}
        >
          <IconComp className="w-5 h-5 text-[#1D734B]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`min-h-[44px] px-3.5 py-2 text-[#1D734B] hover:text-[#114037] bg-[#F2F2F2] hover:bg-[#3CA64C]/20 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target ${className}`}
          title={title}
          aria-label={buttonLabel || title}
        >
          <IconComp className="w-4 h-4 text-[#1D734B] shrink-0" />
          <span>{buttonLabel}</span>
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F2F2F2] flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#114037] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#1D734B] shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35] shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#3AAA35]">
                    Microlearning DATERRA Smart
                  </span>
                  <h3 className="text-base sm:text-lg font-black leading-tight text-white mt-0.5">
                    {title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-target flex items-center justify-center shrink-0"
                aria-label="Fechar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content / Accordions */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[72vh] scrollbar-thin bg-white">
              <div className="space-y-3">
                {sections.map((sec, idx) => {
                  const isExpanded = !!openAccordionIdxs[idx];
                  return (
                    <div key={idx} className="border border-[#F2F2F2] rounded-2xl overflow-hidden bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(idx)}
                        className="w-full p-4 bg-[#F2F2F2]/80 hover:bg-[#F2F2F2] flex items-center justify-between font-bold text-xs sm:text-sm text-[#0D0D0D] transition-all text-left"
                      >
                        <span className="flex items-center gap-2.5 text-[#114037] font-extrabold pr-2">
                          <HelpCircle className="w-4 h-4 text-[#1D734B] shrink-0" />
                          <span>{sec.question}</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#1D734B] transition-transform duration-200 shrink-0 ${
                            isExpanded ? 'rotate-180 text-[#3CA64C]' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 bg-white border-t border-[#F2F2F2] space-y-2 text-xs sm:text-sm text-[#0D0D0D] leading-relaxed">
                          {sec.answerLines.map((line, lineIdx) => {
                            if (line.startsWith('- ')) {
                              return (
                                <div key={lineIdx} className="flex items-start gap-2 pl-1">
                                  <span className="text-[#3CA64C] font-bold mt-0.5">•</span>
                                  <span>{line.replace(/^- /, '')}</span>
                                </div>
                              );
                            }
                            return (
                              <p key={lineIdx} className="font-normal leading-relaxed text-[#0D0D0D]">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Academia DATERRA Footer Link */}
              <div className="pt-3">
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#114037] to-[#1D734B] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3AAA35] block">
                      Formação e Capacitação Agronómica
                    </span>
                    <p className="text-xs text-slate-100 font-medium">
                      Saiba mais na Academia DATERRA
                    </p>
                  </div>
                  <a
                    href="https://academia.daterra.com.pt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-5 py-2.5 bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95 touch-target"
                  >
                    <span>Saiba mais na Academia DATERRA</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer Close Button */}
            <div className="p-4 bg-[#F2F2F2] border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] px-6 py-2.5 bg-[#114037] hover:bg-[#1D734B] text-white font-bold text-xs rounded-xl transition-colors shadow-md touch-target"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
