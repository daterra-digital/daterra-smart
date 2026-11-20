// src/features/agri-chat/components/AgronomicMentionPills.tsx
import React from 'react';

export interface AgronomicMentionPillItem {
  tag: '@cultura' | '@equipamento' | '@bico' | '@calibracao';
  label: string;
  active: boolean;
  available: boolean;
  onToggle: () => void;
}

interface AgronomicMentionPillsProps {
  items: AgronomicMentionPillItem[];
  compact?: boolean;
}

export const AgronomicMentionPills: React.FC<AgronomicMentionPillsProps> = ({ items, compact = false }) => {
  const visible = items.filter((item) => item.available);
  if (visible.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? 'mt-2' : 'mt-2.5 pt-2 border-t border-slate-200'}`}>
      {visible.map((item) => (
        <button
          key={item.tag}
          type="button"
          onClick={item.onToggle}
          aria-pressed={item.active}
          title={item.active ? `Desativar ${item.tag} no contexto da pergunta` : `Ativar ${item.tag} no contexto da pergunta`}
          className={`min-h-[34px] px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            item.active
              ? 'bg-[#114037] text-white border-[#114037] shadow-2xs'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 line-through'
          }`}
        >
          <span className={`font-mono font-black ${item.active ? 'text-[#3CA64C]' : 'text-slate-400'}`}>
            {item.tag}
          </span>
          <span className="truncate max-w-[140px]">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
