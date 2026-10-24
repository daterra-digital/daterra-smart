import React from 'react';
import { Bookmark, History } from 'lucide-react';
import { DidacticHelp } from '../../concentracao/DidacticHelp';

interface VelocidadeFooterBarProps {
  onSave: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const VelocidadeFooterBar: React.FC<VelocidadeFooterBarProps> = ({
  onSave,
  onOpenHistory,
  historyCount
}) => {
  return (
    <aside
      aria-label="Ações da ferramenta de velocidade"
      className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 z-35 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onSave}
          aria-label="Guardar medição de velocidade no histórico"
          className="h-12 bg-[#3CA64C] hover:bg-[#349142] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer touch-target"
        >
          <Bookmark className="w-4 h-4" />
          <span>Guardar</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={`Abrir histórico local com ${historyCount} medições`}
          className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer touch-target"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>Histórico ({historyCount})</span>
        </button>

        <div className="h-12">
          <DidacticHelp
            faqFile="VelocidadeRealFAQGeral.md"
            topic="velocidade-real-geral"
            buttonLabel="Guia"
            variant="button"
            iconType="info"
            className="w-full h-12 !bg-slate-100 hover:!bg-slate-200 !text-[#114037] !rounded-xl !text-xs !font-bold flex items-center justify-center gap-2 !border-0 !shadow-none cursor-pointer touch-target"
          />
        </div>
      </div>
    </aside>
  );
};
