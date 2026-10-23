// src/features/agri-chat/components/ChatConversationPane.tsx
import React, { useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Skill, SkillId, ChatMessage, ActiveExplorationContext } from '../types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatQuickChips } from './ChatQuickChips';
import { ChatInputBar } from './ChatInputBar';

interface ChatConversationPaneProps {
  activeSkill?: Skill;
  activeSkillId: SkillId;
  activeContext?: ActiveExplorationContext;
  messages: ChatMessage[];
  isLoading: boolean;
  inputValue: string;
  onInputChange: (val: string) => void;
  onSendMessage: (text: string) => void;
  onResetConversation: () => void;
  onRequestUnlockSkill: (id: SkillId) => void;
}

export const ChatConversationPane: React.FC<ChatConversationPaneProps> = ({
  activeSkill,
  activeSkillId,
  activeContext,
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onSendMessage,
  onResetConversation,
  onRequestUnlockSkill
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <section className="col-span-1 lg:col-span-8 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden h-full min-h-0">
      {/* Sub-barra da conversa com estado */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-daterra-primary text-white flex items-center justify-center font-black text-xs shadow-xs">
            DS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                Assistente DATERRA
              </span>
              <span className="text-[10px] font-bold text-daterra-secondary bg-daterra-secondary/10 px-2 py-0.5 rounded-full">
                Skill: {activeSkill?.name}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Pronto para analisar a sua exploração com rigor.
            </span>
          </div>
        </div>

        <button
          onClick={onResetConversation}
          className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          title="Reiniciar diálogo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      {/* Mensagens com scroll suave */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAFBFB]">
        {messages.map((msg) =>
          msg.role === 'system' ? (
            <div key={msg.id} className="text-center my-2">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                {msg.content.replace(/\*\*/g, '')}
              </span>
            </div>
          ) : (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              onRequestUnlockSkill={onRequestUnlockSkill}
            />
          )
        )}
        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-slate-500 italic pl-2">
            <span className="w-2 h-2 rounded-full bg-[#114037] animate-ping" />
            <span>A analisar variáveis e normas técnicas...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chips de Sugestão Rápida */}
      <ChatQuickChips
        activeSkillId={activeSkillId}
        activeContext={activeContext}
        onSelectPrompt={onSendMessage}
      />

      {/* Barra de Escrita Ancorada */}
      <ChatInputBar
        inputValue={inputValue}
        isLoading={isLoading}
        onInputChange={onInputChange}
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage(inputValue);
        }}
      />
    </section>
  );
};
