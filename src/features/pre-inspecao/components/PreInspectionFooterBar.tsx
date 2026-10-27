import React from 'react';
import { Save, History, BookOpen } from 'lucide-react';

export interface PreInspectionFooterBarProps {
  onSave: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  historyCount: number;
}

export const PreInspectionFooterBar: React.FC<PreInspectionFooterBarProps> = ({
  onSave,
  onOpenHistory,
  onOpenGuide,
  historyCount
}) => {
  return (
    <aside className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 z-35 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onSave}
          className="h-12 bg-[#3CA64C] hover:bg-[#349142] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer touch-target"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>Guardar</span>
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer touch-target"
        >
          <History className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Histórico ({historyCount})</span>
        </button>
        <button
          type="button"
          onClick={onOpenGuide}
          className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer touch-target"
        >
          <BookOpen className="w-4 h-4 text-[#3CA64C] shrink-0" />
          <span>Guia</span>
        </button>
      </div>
    </aside>
  );
};
