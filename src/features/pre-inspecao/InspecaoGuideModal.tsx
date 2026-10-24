import React, { useEffect } from 'react';
import { X, BookOpen, AlertOctagon } from 'lucide-react';
import { formatDidacticText } from '../../utils/formatDidacticText';
import { CRITICAL_POINTS_ISO16122 } from './inspecaoDataMapper';

interface InspecaoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InspecaoGuideModal: React.FC<InspecaoGuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawIntro =
    '**Inspeção Obrigatória de Pulverizadores (Decreto-Lei n.º 26/2017 & ISO 16122):** A pré-inspeção na exploração assegura a calibração precisa, a segurança humana e previne chumbos nos Centros IPP.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspecao-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] overflow-y-auto w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#114037] text-[#8ffa94] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
                Guia Oficial • Norma ISO 16122
              </span>
              <h2 id="inspecao-guide-title" className="text-base sm:text-lg font-black text-[#114037] leading-tight">
                Pontos Críticos de Pré-Inspeção do Pulverizador
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia"
            className="min-h-[48px] min-w-[48px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer touch-target shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#114037] text-white space-y-1 shadow-xs">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-100 font-medium">
            {formatDidacticText(rawIntro)}
          </p>
        </div>

        <div className="space-y-3">
          {CRITICAL_POINTS_ISO16122.map((pt) => (
            <div key={pt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#114037] text-white text-[11px] font-mono font-black flex items-center justify-center">
                    {pt.number}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">{pt.title}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {pt.isoRef}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {formatDidacticText(pt.requirement)}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                {formatDidacticText(pt.guideText)}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900">
          <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-black block">Regra Eliminatória:</strong>
            Qualquer anomalia grave num destes 5 pontos implica reprovação imediata no ensaio oficial IPP.
          </div>
        </div>
      </div>
    </div>
  );
};
