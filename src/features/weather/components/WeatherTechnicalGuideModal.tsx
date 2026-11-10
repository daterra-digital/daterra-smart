// src/features/weather/components/WeatherTechnicalGuideModal.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, BookOpen, Search } from 'lucide-react';
import { GUIDE_TOPICS, searchGuideQuestions, type GuideTopicId } from '../data/weatherGuideData.ts';
import { WeatherGuideAccordion } from './WeatherGuideAccordion.tsx';

interface WeatherTechnicalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherTechnicalGuideModal: React.FC<WeatherTechnicalGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const [activeTopic, setActiveTopic] = useState<GuideTopicId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestionIds, setOpenQuestionIds] = useState<Set<string>>(new Set());

  // Gestão de foco inicial e captura do elemento disparador
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    document.body.style.overflow = 'unset';
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onClose();
    previousActiveElementRef.current?.focus();
  }, [onClose]);

  // Gestão de Teclado Global (Escape e Focus Trap)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handleClose(); return; }
      if (e.key === 'Tab' && modalContainerRef.current) {
        const focusable = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleToggleQuestion = (id: string) => {
    setOpenQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredQuestions = useMemo(() => searchGuideQuestions(searchQuery, activeTopic), [searchQuery, activeTopic]);
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="weather-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Cabeçalho do Modal */}
        <header className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-daterra-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5 text-emerald-300" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="weather-guide-title" className="text-sm sm:text-base font-black text-slate-900 truncate">
                Guia Técnico de Meteorologia e Pulverização
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                Fundamentação agronómica, limiares configurados e boas práticas DGAV
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Fechar Guia Técnico"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3CA64C]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {/* Barra de Filtro por Temas e Pesquisa */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white space-y-2.5 shrink-0">
          {/* Campo de Pesquisa */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar termo (ex: Delta T, vento calmo, DPV, deriva)..."
              aria-label="Pesquisar no Guia Técnico"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3CA64C] transition-all"
            />
          </div>

          {/* Abas / Filtros de Tema */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setActiveTopic('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTopic === 'all'
                  ? 'bg-daterra-primary text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Todos ({filteredQuestions.length})
            </button>
            {GUIDE_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setActiveTopic(topic.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTopic === topic.id
                    ? 'bg-daterra-primary text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {topic.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Acordeões com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/30">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhuma pergunta encontrada com o critério indicado.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <WeatherGuideAccordion
                key={q.id}
                item={q}
                isOpen={openQuestionIds.has(q.id)}
                onToggle={handleToggleQuestion}
              />
            ))
          )}
        </div>

        {/* Rodapé Acessível */}
        <footer className="p-3.5 sm:p-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60 text-[11px] text-slate-500">
          <span className="hidden sm:inline">Pressione ESC para fechar a qualquer momento.</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3CA64C]"
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
};
