// src/features/agri-chat/components/ChatMessageBubble.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, BookOpen, Wrench } from 'lucide-react';
import type { ChatMessage, SkillId } from '../types';
import { SKILLS_CATALOG } from '../data/skillsCatalog';
import { ChatFormattedText } from './ChatFormattedText';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onRequestUnlockSkill: (skillId: SkillId) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onRequestUnlockSkill
}) => {
  const navigate = useNavigate();
  const isUser = message.role === 'user';
  const skillInfo = SKILLS_CATALOG.find((s) => s.id === message.skillId);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-[#114037] text-white rounded-2xl sm:rounded-3xl rounded-tr-xs p-4 sm:p-5 max-w-[90%] sm:max-w-[80%] text-sm sm:text-base shadow-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 items-start">
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#114037] text-white flex items-center justify-center text-xs sm:text-sm font-black shrink-0 shadow-xs">
        DS
      </div>

      <div className={`bg-white border rounded-2xl sm:rounded-3xl rounded-tl-xs p-4 sm:p-6 max-w-[92%] sm:max-w-[85%] text-sm sm:text-base shadow-xs text-slate-800 leading-relaxed ${
        message.isGuardrailTriggered ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/90'
      }`}>
        {message.isGuardrailTriggered ? (
          <div className="flex items-center gap-2 text-amber-800 font-extrabold mb-2 text-xs sm:text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Guardrail Agronómico & Regulamentar</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#114037] mb-2 pb-1.5 border-b border-slate-100">
            <span>Assistente DATERRA</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {skillInfo?.name} (v{skillInfo?.version})
            </span>
          </div>
        )}

        <ChatFormattedText content={message.content} />

        {/* Cartão de Ação Interativa Direta (Action Card) */}
        {message.actionCard && (
          <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-black text-xs sm:text-sm text-daterra-primary flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-daterra-accent shrink-0" />
                {message.actionCard.title}
              </span>
              {message.actionCard.badge && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300/60">
                  {message.actionCard.badge}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-normal">
              {message.actionCard.description}
            </p>
            <button
              onClick={() => navigate(message.actionCard!.url)}
              className="w-full bg-daterra-primary hover:bg-daterra-secondary text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 min-h-[44px] cursor-pointer"
            >
              <span>{message.actionCard.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cartão de Sugestão de Desbloqueio se o Guardrail foi acionado */}
        {message.isGuardrailTriggered && message.suggestedSkillId && (
          <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 block mb-1">
              Recomendação: Ativar Skill Especialista
            </span>
            <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-normal">
              Para aceder ao catálogo oficial de matérias ativas autorizadas, doses por hl e regras de resistência, desbloqueie a skill especialista.
            </p>
            <button
              onClick={() => onRequestUnlockSkill(message.suggestedSkillId!)}
              className="w-full bg-[#114037] hover:bg-[#1D734B] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 min-h-[44px]"
            >
              <span>Desbloquear Skill {SKILLS_CATALOG.find(s => s.id === message.suggestedSkillId)?.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Fontes / Citações */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Fonte: {message.sources.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
