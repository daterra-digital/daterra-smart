/**
 * DATERRA Smart - Modal de Microlearning [Guia]: Aplicação Manual
 * Lições Pedagógicas Offline, Exemplos Aritméticos (< 200 LOC)
 */

import React, { useState } from 'react';
import { X, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { MANUAL_GUIDE_LESSONS, type ManualGuideLesson } from './manualGuideLessons';
import { useLanguage } from '../../../../src/context/LanguageContext';

export interface ManualStepGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualStepGuideModal: React.FC<ManualStepGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [selectedLessonId, setSelectedLessonId] = useState<string>(MANUAL_GUIDE_LESSONS[0].id);

  if (!isOpen) return null;

  const currentLesson: ManualGuideLesson =
    MANUAL_GUIDE_LESSONS.find((l) => l.id === selectedLessonId) || MANUAL_GUIDE_LESSONS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 bg-[#114037] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-[#3CA64C]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3CA64C] block">
                {t('manual.guide.badge', 'MICROLEARNING AGRONÓMICO')}
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {t('manual.guide.title', 'Guia Técnico da Aplicação Manual')}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label={t('common.actions.close', 'Fechar')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Lições (Tabs horizontais com scroll suave) */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {MANUAL_GUIDE_LESSONS.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => setSelectedLessonId(lesson.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all touch-target min-h-0 h-auto cursor-pointer ${
                selectedLessonId === lesson.id
                  ? 'bg-[#114037] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {lesson.title.split('.')[0]}. {lesson.category}
            </button>
          ))}
        </div>

        {/* Conteúdo da Lição Ativa */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-black text-slate-900 text-base">{currentLesson.title}</h4>
            <p className="text-slate-500 font-medium text-xs">{currentLesson.summary}</p>
          </div>

          <div className="space-y-2.5">
            {currentLesson.content.map((p, idx) => (
              <p key={idx} className="text-slate-700">{p}</p>
            ))}
          </div>

          {currentLesson.example && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/70 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
                <Sparkles className="w-4 h-4 text-[#3CA64C]" />
                <span>Exemplo Aritmético Sintético</span>
              </div>
              <div className="text-xs text-emerald-950 font-mono-numbers space-y-1">
                <div>• Entradas: <strong>{currentLesson.example.inputs}</strong></div>
                <div>• Fórmula: <strong>{currentLesson.example.calculation}</strong></div>
                <div>• Resultado: <strong className="text-emerald-900 font-bold">{currentLesson.example.result}</strong></div>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 flex items-start gap-2 text-[11px] text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Os exemplos apresentados são puramente aritméticos para demonstração de cálculo. Consulte sempre o rótulo oficial homologado do produto e o técnico responsável da sua exploração.
            </span>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#114037] hover:bg-[#114037]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all touch-target cursor-pointer"
          >
            {t('common.actions.understand', 'Entendido')}
          </button>
        </div>
      </div>
    </div>
  );
};
