// src/features/agri-chat/components/ChatInputBar.tsx
import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputBarProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputValue,
  isLoading,
  onInputChange,
  onSubmit
}) => {
  return (
    <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 shadow-xs">
      <form onSubmit={onSubmit} className="flex items-center gap-2.5 sm:gap-3 max-w-4xl mx-auto w-full">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Coloque a sua dúvida agronómica..."
          className="flex-1 bg-slate-100 text-slate-800 text-sm sm:text-base px-4 sm:px-5 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:border-[#3CA64C] focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[48px]"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="w-12 h-12 rounded-2xl bg-[#114037] text-white flex items-center justify-center hover:bg-[#1D734B] transition-colors shrink-0 disabled:opacity-40 min-h-[48px] min-w-[48px] shadow-sm active:scale-95"
          aria-label="Enviar mensagem"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
