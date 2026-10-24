import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { formatDidacticText } from '../../utils/formatDidacticText';
import { PH_MICROLEARNING_TOPICS, PH_MICROLEARNING_QUIZZES } from './phMicrolearningData';

export interface PhMicrolearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
}

export const PhMicrolearningModal: React.FC<PhMicrolearningModalProps> = ({
  isOpen,
  onClose,
  initialTopicId
}) => {
  const [activeTopicId, setActiveTopicId] = useState<string>(
    initialTopicId || PH_MICROLEARNING_TOPICS[0].id
  );
  const [revealedQuizzes, setRevealedQuizzes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialTopicId) {
      setActiveTopicId(initialTopicId);
    }
  }, [initialTopicId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeTopic =
    PH_MICROLEARNING_TOPICS.find((t) => t.id === activeTopicId) ||
    PH_MICROLEARNING_TOPICS[0];

  const toggleQuiz = (quizId: string) => {
    setRevealedQuizzes((prev) => ({ ...prev, [quizId]: !prev[quizId] }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ph-microlearning-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 bg-[#114037] text-white flex items-center justify-between border-b border-emerald-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3CA64C] text-white flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8ffa94] block">
                Academia & Apoio à Decisão no Campo
              </span>
              <h2 id="ph-microlearning-title" className="text-base sm:text-lg font-black text-white leading-tight">
                Guia Técnico: Verificador de pH
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia técnico"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Barra Lateral + Conteúdo Pedagógico */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Lado Esquerdo: Tópicos Coluna C a H */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/80 overflow-y-auto p-2.5 space-y-1.5">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Guia Técnico (Colunas C a H)
            </div>
            {PH_MICROLEARNING_TOPICS.map((t) => {
              const isActive = t.id === activeTopic.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTopicId(t.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-white border border-[#3CA64C] shadow-xs'
                      : 'hover:bg-white/80 border border-transparent'
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5" aria-hidden="true">
                    {t.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase text-[#3CA64C] block tracking-wider">
                      {t.columnCode} • {t.category}
                    </span>
                    <h3 className={`text-xs font-bold line-clamp-1 ${isActive ? 'text-[#114037] font-black' : 'text-slate-800'}`}>
                      {t.title}
                    </h3>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isActive ? 'text-[#3CA64C]' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Lado Direito: As 3 Perguntas Essenciais + Casos Práticos */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
            {/* Cabeçalho do Tópico */}
            <div className="space-y-1.5 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {activeTopic.columnCode} • {activeTopic.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{activeTopic.referenceStandard}</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{activeTopic.icon}</span>
                <span>{activeTopic.title}</span>
              </h3>
              <p className="text-xs font-bold text-[#1D734B]">{activeTopic.keyConcept}</p>
            </div>

            {/* 1. O que é? */}
            <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-slate-200/90 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                1. O que é? (Conceito Simples)
              </span>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                {formatDidacticText(activeTopic.whatIsIt)}
              </p>
            </div>

            {/* 2. Porque é que me afeta? + Escala de Interpretação */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                2. Porque é que me afeta e como interpretar?
              </span>
              {activeTopic.whyItMatters.map((point, idx) => (
                <p key={idx} className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  • {formatDidacticText(point)}
                </p>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {activeTopic.practicalRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-xs space-y-1 ${rule.badgeColor || 'bg-slate-50 border-slate-200'}`}
                  >
                    <strong className="font-black block">{rule.label}</strong>
                    <p className="text-[11px] opacity-90 leading-snug">{formatDidacticText(rule.detail)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. O que devo fazer agora? */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#114037] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3CA64C]" />
                <span>3. O que devo fazer agora no depósito?</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-900 font-bold leading-relaxed">
                {formatDidacticText(activeTopic.actionNow)}
              </p>
            </div>

            {/* Quizzes Rápidos de Campo (Glifosato & Azoxistrobina) */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Casos Práticos de Campo (Toque para ver a solução)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PH_MICROLEARNING_QUIZZES.map((quiz) => {
                  const isRevealed = !!revealedQuizzes[quiz.id];
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => toggleQuiz(quiz.id)}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFBFB] hover:bg-slate-50 transition-all cursor-pointer space-y-1.5"
                    >
                      <span className="text-[10px] font-black uppercase text-[#114037] block">
                        {quiz.substance}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">{quiz.specs}</span>
                      <p className="text-xs font-bold text-slate-900">{quiz.question}</p>
                      {isRevealed ? (
                        <div className="pt-2 mt-1.5 border-t border-emerald-200 text-xs text-emerald-950 bg-emerald-50/70 p-2.5 rounded-xl flex items-start gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#3CA64C] shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed">{formatDidacticText(quiz.answer)}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-[#3CA64C] inline-block pt-1">
                          Ver resposta pedagógica →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-3.5 px-5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Arquitetura Pedagógica DATERRA Smart • Normas DGAV, IRAC, FRAC, HRAC & ISO</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#114037] hover:bg-[#1D734B] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          >
            Concluir Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
