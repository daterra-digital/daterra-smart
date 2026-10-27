import React, { useState, useEffect } from 'react';
import { X, BookOpen, Scale, Layers, Gauge } from 'lucide-react';
import { InspecaoLegalSection } from './components/guide/InspecaoLegalSection';
import { InspecaoIsoSection } from './components/guide/InspecaoIsoSection';
import { InspecaoTechTermsSection } from './components/guide/InspecaoTechTermsSection';

export type InspecaoGuideTab = 'legal' | 'iso' | 'tech';

export interface InspecaoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InspecaoGuideTab;
}

export const InspecaoGuideModal: React.FC<InspecaoGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'legal'
}) => {
  const [activeTab, setActiveTab] = useState<InspecaoGuideTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspecao-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] flex flex-col w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo / Cabeçalho */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#114037] text-[#8ffa94] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block truncate">
                Guia Oficial • EN ISO 16122
              </span>
              <h2
                id="inspecao-guide-title"
                className="text-sm sm:text-base font-black text-[#114037] dark:text-emerald-300 leading-tight truncate"
              >
                Guia & Enquadramento Técnico
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia"
            className="min-h-[48px] min-w-[48px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer touch-target shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separadores Táteis Ergonómicos (ISO 9241-210) */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              activeTab === 'legal'
                ? 'bg-white dark:bg-slate-800 text-[#114037] dark:text-emerald-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span className="truncate">Legislação & IPP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('iso')}
            className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              activeTab === 'iso'
                ? 'bg-white dark:bg-slate-800 text-[#114037] dark:text-emerald-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">Norma ISO 16122</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              activeTab === 'tech'
                ? 'bg-white dark:bg-slate-800 text-[#114037] dark:text-emerald-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4 shrink-0" />
            <span className="truncate">Guia Técnico</span>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'legal' && <InspecaoLegalSection />}
          {activeTab === 'iso' && <InspecaoIsoSection />}
          {activeTab === 'tech' && <InspecaoTechTermsSection />}
        </div>
      </div>
    </div>
  );
};
