import React, { useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';
import { IRD_LEGAL_DISCLAIMER, IRD_VERSIONS } from './irdConfig.ts';

interface IrdGuideModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const IrdGuideModal: React.FC<IrdGuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ird-guide-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#114037]" />
            <h2 id="ird-guide-title" className="text-base sm:text-lg font-extrabold text-[#114037]">
              Guia Técnico — Índice de Risco de Deriva
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia"
            className="touch-target px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-extrabold inline-flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Fechar
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#eef8f0] border border-emerald-200 space-y-1">
            <div className="font-extrabold text-[#114037]">1. Política Anti-Risco-Zero (Escala 1–100)</div>
            <p>
              Nenhuma aplicação hidráulica ou assistida por ar tem risco nulo de deriva. O IRD combina quatro
              subíndices ponderados: Meteorologia (35%), Espectro de gotas (30%), Operação (20%) e Exposição (15%).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">2. Hierarquia de Diâmetro de Gota</div>
            <p>
              Quando não introduz diâmetro opcional, o motor utiliza a hierarquia do catálogo oficial (DV10 interpolado
              &#8594; classe de gotas &#8594; sensibilidade &#8594; fallback conservador). Em bicos rotativos de drone pode indicar um
              diâmetro representativo único com fonte declarada; em bicos convencionais pode indicar DV10, DV50 e DV90.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">3. Operação Offline e Anemómetro</div>
            <p>
              Sem rede, o IRD distingue cache meteorológica válida (&#8804; 20 min) de cache expirada (&gt; 20 min). Antes de abrir
              o depósito, confirme sempre vento, temperatura e humidade no campo com anemómetro e termo-higrómetro.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-1 text-amber-950">
            <div className="font-extrabold">4. Prevalência Legal — DGAV / SIFITO</div>
            <p>
              <strong>O rótulo DGAV/SIFITO prevalece sempre.</strong> Este módulo ({IRD_VERSIONS.rulesetVersion} · v
              {IRD_VERSIONS.formulaVersion}) apoia a decisão operacional com produto fitofarmacêutico autorizado e calda
              regulada, mas <strong>não constitui certificação legal nem ensaio segundo a norma ISO 22866</strong>.
            </p>
          </div>

          <p className="text-xs text-slate-600">{IRD_LEGAL_DISCLAIMER.statementPt}</p>
        </div>
      </div>
    </div>
  );
};
