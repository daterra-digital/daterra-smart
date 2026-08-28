import React, { useState, useEffect } from 'react';
import { BookOpen, X, Sparkles, Scale, ExternalLink, ChevronDown, CheckCircle2, AlertTriangle, ShieldCheck, Calculator, Ruler } from 'lucide-react';
import { db, type MicrolearningContent } from '../db/db';
import { useLanguage } from '../context/LanguageContext';

interface AccordionSection {
  title: string;
  items: string[];
}

interface ParsedMicrolearning {
  accordions: AccordionSection[];
  formula: string;
  unidades: string;
  fontes: string[];
}

function parseStructuredMicrolearning(text: string): ParsedMicrolearning {
  const result: ParsedMicrolearning = {
    accordions: [],
    formula: '',
    unidades: '',
    fontes: []
  };

  if (!text) return result;

  // Limpar links residuais e textos redundantes da Academia
  let cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/Para aprofundar[^\n]*https?:\/\/[^\s]+/gi, '')
    .replace(/Saber Mais[^\n]*https?:\/\/[^\s]+/gi, '')
    .replace(/https?:\/\/academia\.daterra\.com\.pt/gi, '')
    .trim();

  // 1. Extrair blocos explicitamente marcados como [FAQ: Pergunta?] ou [ACORDEÃO: Pergunta]
  const faqRegex = /(?:🔽\s*)?\[(?:FAQ|ACORDEÃO):\s*([^\]]+)\](?:\*\*)?\s*\n([\s\S]*?)(?=(?:(?:🔽\s*)?\[(?:FAQ|ACORDEÃO):|Fórmula|Unidades|Fontes|Saber|$))/gi;
  let match;
  while ((match = faqRegex.exec(cleanText)) !== null) {
    const title = match[1].trim();
    const body = match[2].trim();
    const items = body
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
    if (items.length > 0) {
      result.accordions.push({ title, items });
    }
  }

  // 2. Se não houver tags [FAQ:], extrair secções clássicas em acordeões individuais
  if (result.accordions.length === 0) {
    const sectionHeaders = [
      'O Conceito',
      'Porque É Importante',
      'Diretrizes Técnicas e Operacionais',
      'Como Interpretar na Prática',
      'Erros Frequentes a Evitar',
      'Enquadramento Legal e Tolerâncias',
      'Terminologia Relacionada'
    ];

    sectionHeaders.forEach(sectionTitle => {
      const regex = new RegExp(`(?:💡|⚖️|🔽|\\*\\*|\\b)?\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?:\\*\\*)?\\s*\\n([\\s\\S]*?)(?=(?:💡|⚖️|🔽|\\*\\*|\\b)?\\s*(?:O Conceito|Porque É Importante|Diretrizes|Como Interpretar|Erros|Enquadramento|Terminologia|Fórmula|Unidades|Fontes|Saber)|$)`, 'i');
      const sMatch = cleanText.match(regex);
      if (sMatch && sMatch[1].trim()) {
        const items = sMatch[1]
          .trim()
          .split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean);
        if (items.length > 0) {
          result.accordions.push({
            title: sectionTitle,
            items
          });
        }
      }
    });
  }

  // 3. Extrair secção de Fórmula do texto (se aplicável)
  const formulaMatch = cleanText.match(/(?:Fórmula|Fórmulas)\s*\n([\s\S]*?)(?=(?:Unidades|Fontes|Saber|$))/i);
  if (formulaMatch) {
    result.formula = formulaMatch[1].trim();
  }

  // 4. Extrair secção de Unidades do texto (se aplicável)
  const unidadesMatch = cleanText.match(/(?:Unidades)\s*\n([\s\S]*?)(?=(?:Fontes|Saber|$))/i);
  if (unidadesMatch) {
    result.unidades = unidadesMatch[1].trim();
  }

  // Fallback se nenhum acordeão foi gerado
  if (result.accordions.length === 0) {
    const lines = cleanText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('Fórmula') && !l.startsWith('Unidades'));
    if (lines.length > 0) {
      result.accordions.push({
        title: 'Informação e Esclarecimentos',
        items: lines
      });
    }
  }

  return result;
}

interface MicrolearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: string;
}

export const MicrolearningModal: React.FC<MicrolearningModalProps> = ({
  isOpen,
  onClose,
  fieldKey
}) => {
  const { t } = useLanguage();
  const [data, setData] = useState<MicrolearningContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({ 0: true, 1: true });

  useEffect(() => {
    if (isOpen && fieldKey) {
      setLoading(true);
      setOpenAccordions({ 0: true, 1: true });
      db.microlearning_content
        .where('field_key')
        .equals(fieldKey)
        .first()
        .then((item) => {
          setData(item || null);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erro ao ler microlearning:', err);
          setLoading(false);
        });
    }
  }, [isOpen, fieldKey]);

  if (!isOpen) return null;

  // Resolução dinâmica de i18n para conteúdos de Microlearning
  const i18nTitle = t(`microlearningContent.${fieldKey}.title`, '');
  const i18nContent = t(`microlearningContent.${fieldKey}.content`, '');
  const i18nFormula = t(`microlearningContent.${fieldKey}.formula`, '');
  const i18nUnits = t(`microlearningContent.${fieldKey}.unit_explanation`, '');

  const activeTitle = i18nTitle || (data ? data.title : t('microlearning.defaultTitle'));
  const activeRawContent = i18nContent || (data ? data.content : '');
  const parsed = activeRawContent ? parseStructuredMicrolearning(activeRawContent) : null;
  const formulaContent = i18nFormula || data?.formula || parsed?.formula || '';
  const unitsContent = i18nUnits || data?.unit_explanation || parsed?.unidades || '';

  const toggleAccordion = (idx: number) => {
    setOpenAccordions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabeçalho Modal: Cápsula de Conhecimento DATERRA Smart */}
        <div className="bg-daterra-primary text-white p-5 sm:p-6 flex items-center justify-between border-b border-daterra-secondary/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-daterra-accent/20 border border-daterra-accent/30 flex items-center justify-center text-daterra-accent shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-daterra-accent">
                  {t('microlearning.capsuleTitle')}
                </span>
              </div>
              {/* 2. Título da Cápsula */}
              <h3 className="text-base sm:text-xl font-black leading-tight text-white mt-0.5">
                {activeTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-target shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Corpo Expansível da Cápsula */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh] scrollbar-thin">
          {loading ? (
            <div className="py-12 text-center text-slate-500 animate-pulse space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-daterra-accent animate-bounce" />
              <p className="text-xs font-semibold">{t('microlearning.loading')}</p>
            </div>
          ) : parsed ? (
            <>
              {/* 3. Título "Conceito Técnico" e Acordeões Expansíveis */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-daterra-primary text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
                  <Sparkles className="w-4 h-4 text-daterra-accent shrink-0" />
                  <span>{t('microlearning.technicalConcept')}</span>
                </div>

                <div className="space-y-2.5">
                  {parsed.accordions.map((acc, idx) => {
                    const isOpen = !!openAccordions[idx];

                    let IconComponent = CheckCircle2;
                    let headerColor = 'text-slate-800';

                    if (acc.title.toLowerCase().includes('erros') || acc.title.toLowerCase().includes('cuidados')) {
                      IconComponent = AlertTriangle;
                      headerColor = 'text-rose-800';
                    } else if (acc.title.toLowerCase().includes('legal') || acc.title.toLowerCase().includes('tolerâncias')) {
                      IconComponent = Scale;
                      headerColor = 'text-amber-900';
                    } else if (acc.title.toLowerCase().includes('importante')) {
                      IconComponent = ShieldCheck;
                      headerColor = 'text-emerald-900';
                    }

                    return (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                        <button
                          type="button"
                          onClick={() => toggleAccordion(idx)}
                          className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-xs sm:text-sm transition-all text-left"
                        >
                          <span className={`flex items-center gap-2.5 ${headerColor}`}>
                            <IconComponent className="w-4 h-4 text-daterra-accent shrink-0" />
                            <span>{acc.title}</span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-daterra-accent' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-2 animate-fade-in text-xs sm:text-sm text-slate-700 leading-relaxed">
                            <ul className="space-y-2">
                              {acc.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-2.5 text-slate-700">
                                  <span className="text-daterra-accent font-bold mt-0.5">•</span>
                                  <span className="font-normal whitespace-pre-line">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Título "Fórmula" */}
              {formulaContent && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                    <Calculator className="w-4 h-4 text-daterra-secondary shrink-0" />
                    <span>{t('microlearning.formula')}</span>
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed border border-slate-800 whitespace-pre-line shadow-inner">
                    {formulaContent}
                  </div>
                </div>
              )}

              {/* 5. Título "Unidades" */}
              {unitsContent && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                    <Ruler className="w-4 h-4 text-daterra-accent shrink-0" />
                    <span>{t('microlearning.units')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                    {unitsContent}
                  </div>
                </div>
              )}

              {/* 6. Botão para encaminhar para a Academia DATERRA */}
              <div className="pt-2">
                <div className="p-4 bg-gradient-to-r from-daterra-primary to-daterra-secondary text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-daterra-accent block">
                      {t('microlearning.deepenHeader')}
                    </span>
                    <p className="text-xs text-slate-200 font-medium">
                      {t('microlearning.deepenSub')}
                    </p>
                  </div>
                  <a
                    href="https://academia.daterra.com.pt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-daterra-accent hover:bg-daterra-accent/90 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95 touch-target"
                  >
                    <span>{t('microlearning.moreInfoButton')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
              Nenhuma explicação cadastrada para o parâmetro <code className="font-mono bg-amber-100 px-1 rounded">{fieldKey}</code>.
            </div>
          )}
        </div>

        {/* Rodapé da Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-xs rounded-xl transition-colors shadow-md touch-target"
          >
            {t('microlearning.understood')}
          </button>
        </div>
      </div>
    </div>
  );
};





