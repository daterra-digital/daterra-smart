import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, ChevronDown, Info, Layers, X } from 'lucide-react';
import { IRD_LEGAL_DISCLAIMER } from './irdConfig.ts';
import type { IrdGuideContextData } from './irdGuideContextBuilder.ts';
import { IRD_GUIDE_QA_ITEMS, type IrdGuideTopicId } from './irdGuideSections.ts';

interface IrdGuideModalProps {
  readonly isOpen: boolean;
  readonly initialTopic?: IrdGuideTopicId | null;
  readonly guideContext?: IrdGuideContextData | null;
  readonly onClose: () => void;
}

function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
}

export const IrdGuideModal: React.FC<IrdGuideModalProps> = ({
  isOpen,
  initialTopic,
  guideContext = null,
  onClose
}) => {
  const [openIds, setOpenIds] = useState<Set<IrdGuideTopicId>>(() =>
    initialTopic ? new Set([initialTopic]) : new Set()
  );
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef<boolean>(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen && !wasOpenRef.current && typeof document !== 'undefined') {
      triggerElRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const next = new Set<IrdGuideTopicId>();
      if (initialTopic) next.add(initialTopic);
      setOpenIds(next);
      window.requestAnimationFrame(() => {
        if (initialTopic) {
          document.getElementById(`ird-guide-${initialTopic}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          (document.getElementById(`ird-guide-trigger-${initialTopic}`) ?? closeBtnRef.current)?.focus();
        } else {
          closeBtnRef.current?.focus();
        }
      });
    } else if (!isOpen && wasOpenRef.current) {
      const target = triggerElRef.current;
      triggerElRef.current = null;
      if (target && typeof document !== 'undefined' && document.contains(target)) {
        window.requestAnimationFrame(() => target.focus());
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialTopic]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        return onCloseRef.current();
      }
      if (e.key === 'Tab') {
        const items = getFocusable(dialogRef.current);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTopic = (id: IrdGuideTopicId) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openDetailsSection = () => {
    setOpenIds((prev) => new Set(prev).add('details'));
    document.getElementById('ird-guide-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('ird-guide-trigger-details')?.focus();
  };

  const isDetailsOpen = openIds.has('details');

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="ird-guide-title" onClick={onClose} className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6">
      <div ref={dialogRef} onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-2xl lg:max-w-3xl rounded-t-3xl sm:rounded-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#114037] text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-5 h-5 text-[#3CA64C] shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id="ird-guide-title" className="text-base sm:text-lg font-extrabold truncate">Guia Técnico — Índice de Risco de Deriva</h2>
              <p className="text-[11px] text-emerald-200 truncate">Perguntas frequentes, metodologia e detalhes da avaliação atual</p>
            </div>
          </div>
          <button ref={closeBtnRef} type="button" onClick={onClose} aria-label="Fechar Guia Técnico" className="touch-target px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#3CA64C]">
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Fechar</span>
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
          {guideContext && (
            <section id="ird-guide-details" aria-labelledby="ird-guide-trigger-details" className="rounded-2xl border-2 border-[#114037]/25 bg-[#eef8f0]/60 overflow-hidden">
              <button id="ird-guide-trigger-details" type="button" aria-expanded={isDetailsOpen} aria-controls="ird-guide-panel-details" onClick={() => toggleTopic('details')} className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left font-extrabold text-[#114037] cursor-pointer hover:bg-[#eef8f0] touch-target focus-visible:outline-2 focus-visible:outline-[#114037]">
                <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-[#114037] shrink-0" aria-hidden="true" /><span>Detalhes desta avaliação</span></span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {isDetailsOpen && (
                <div id="ird-guide-panel-details" className="px-4 pb-4 pt-2 border-t border-[#114037]/15 bg-white space-y-3 text-xs">
                  {guideContext.criticalCausesPt.length > 0 && (
                    <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                      <div className="font-extrabold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> Causas críticas ativas</div>
                      {guideContext.criticalCausesPt.map((item, idx) => <p key={idx}>• {item}</p>)}
                    </div>
                  )}
                  {guideContext.missingItemsPt.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                      <div className="font-extrabold">Dados em falta</div>
                      {guideContext.missingItemsPt.map((item, idx) => <p key={idx}>• {item}</p>)}
                    </div>
                  )}
                  {guideContext.providedItemsPt.length > 0 && <div className="space-y-1"><div className="font-extrabold text-[#114037]">Dados utilizados e origem</div>{guideContext.providedItemsPt.map((item, idx) => <p key={idx}>• {item}</p>)}</div>}
                  {guideContext.assumptionsPt.length > 0 && <div className="space-y-1"><div className="font-extrabold text-slate-800">Premissas conservadoras</div>{guideContext.assumptionsPt.map((item, idx) => <p key={idx}>• {item}</p>)}</div>}
                  {guideContext.limitationsAndSaturationsPt.length > 0 && <div className="space-y-1 text-slate-700"><div className="font-extrabold text-slate-800">Limitações e saturações relevantes</div>{guideContext.limitationsAndSaturationsPt.map((item, idx) => <p key={idx}>• {item}</p>)}</div>}
                </div>
              )}
            </section>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">Explicação geral (Perguntas e Respostas)</h3>
            {IRD_GUIDE_QA_ITEMS.map((item) => {
              const expanded = openIds.has(item.id);
              return (
                <section key={item.id} id={`ird-guide-${item.id}`} aria-labelledby={`ird-guide-trigger-${item.id}`} className={`rounded-2xl border overflow-hidden transition-colors ${expanded ? 'border-[#114037] bg-white shadow-xs' : 'border-slate-200 bg-slate-50'}`}>
                  <button id={`ird-guide-trigger-${item.id}`} type="button" aria-expanded={expanded} aria-controls={`ird-guide-panel-${item.id}`} onClick={() => toggleTopic(item.id)} className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left font-bold text-slate-900 hover:bg-slate-100/80 cursor-pointer touch-target focus-visible:outline-2 focus-visible:outline-[#114037]">
                    <span>{item.questionPt}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${expanded ? 'rotate-180 text-[#114037]' : ''}`} aria-hidden="true" />
                  </button>
                  {expanded && (
                    <div id={`ird-guide-panel-${item.id}`} className="px-4 pb-4 pt-2 border-t border-slate-100 bg-white space-y-2 text-xs sm:text-sm text-slate-700">
                      <p>{item.answerPt}</p>
                      {item.notePt && (
                        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-[#114037] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{item.notePt}</span>
                        </p>
                      )}
                      {item.id === 'missing' && guideContext && (
                        <button type="button" onClick={openDetailsSection} className="text-xs font-extrabold text-[#114037] underline cursor-pointer touch-target px-1">Consultar agora os detalhes desta avaliação</button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-1 text-amber-950">
            <div className="font-extrabold">Prevalência do Rótulo Oficial</div>
            <p className="text-xs font-bold">Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico.</p>
            <p className="text-xs">{IRD_LEGAL_DISCLAIMER.statementPt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
