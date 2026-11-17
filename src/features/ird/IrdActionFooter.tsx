import React from 'react';
import { BookOpen, History, Save } from 'lucide-react';
import type { IrdSaveAvailability } from './irdPresentationHelper.ts';

interface IrdActionFooterProps {
  readonly saveAvailability: IrdSaveAvailability;
  readonly isSaving?: boolean;
  readonly historyCount: number;
  readonly isHidden?: boolean;
  readonly onSave: () => void;
  readonly onOpenHistory: () => void;
  readonly onOpenGuide: () => void;
}

export const IrdActionFooter: React.FC<IrdActionFooterProps> = ({
  saveAvailability,
  isSaving = false,
  historyCount,
  isHidden = false,
  onSave,
  onOpenHistory,
  onOpenGuide
}) => {
  if (isHidden) return null;

  const isSaveEnabled = saveAvailability.canSave && !isSaving;

  return (
    <aside
      aria-label="Ações da avaliação IRD"
      className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 z-35 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]"
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 space-y-1">
        {!isSaveEnabled && saveAvailability.reason && (
          <p id="ird-save-disabled-reason" className="text-[11px] font-semibold text-slate-600 px-1 truncate">
            {saveAvailability.reason}
          </p>
        )}

        <div className="flex items-center gap-1.5 sm:gap-3 w-full">
          <button
            type="button"
            onClick={onSave}
            disabled={!isSaveEnabled}
            aria-disabled={!isSaveEnabled}
            aria-describedby={!isSaveEnabled && saveAvailability.reason ? 'ird-save-disabled-reason' : undefined}
            title={isSaveEnabled ? 'Guardar avaliação neste dispositivo' : (saveAvailability.reason ?? 'Guardar indisponível')}
            className={`flex-[2] basis-1/2 min-h-[48px] px-2 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all touch-target select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C] ${
              isSaveEnabled
                ? 'bg-[#114037] hover:bg-[#175348] text-white cursor-pointer active:scale-98'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className={`w-4 h-4 shrink-0 ${isSaveEnabled ? 'text-[#3CA64C]' : 'text-slate-400'}`} aria-hidden="true" />
            <span>{isSaving ? 'A guardar...' : 'Guardar'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            aria-label={`Abrir Histórico com ${historyCount} avaliações`}
            className="flex-1 basis-1/4 min-h-[48px] px-1.5 sm:px-3 py-2 rounded-2xl font-bold text-[11px] sm:text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1 transition-all cursor-pointer touch-target select-none focus-visible:outline-2 focus-visible:outline-[#114037]"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" aria-hidden="true" />
            <span className="truncate">Histórico</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold bg-[#114037] text-white rounded-full shrink-0">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            aria-label="Abrir Guia Técnico"
            className="flex-1 basis-1/4 min-h-[48px] px-1.5 sm:px-3 py-2 rounded-2xl font-bold text-[11px] sm:text-xs bg-[#1D734B]/10 hover:bg-[#1D734B]/20 text-[#114037] flex items-center justify-center gap-1 transition-all cursor-pointer touch-target select-none focus-visible:outline-2 focus-visible:outline-[#114037]"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1D734B] shrink-0" aria-hidden="true" />
            <span className="leading-tight text-center">Guia Técnico</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
