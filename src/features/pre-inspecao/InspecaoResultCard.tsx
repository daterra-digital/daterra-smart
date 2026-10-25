import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import type { InspecaoEvaluationResult } from './types/inspecaoTypes';

interface InspecaoResultCardProps {
  calculationResult: InspecaoEvaluationResult;
  onOpenGuide: () => void;
}

export const InspecaoResultCard: React.FC<InspecaoResultCardProps> = ({
  calculationResult,
  onOpenGuide
}) => {
  const {
    conformityPct,
    conformeCount,
    anomaliaCount,
    pendenteCount,
    totalItems,
    status,
    statusLabel,
    alertLevel,
    recommendation,
    evaluationStyle
  } = calculationResult;

  const styleBadgeText =
    evaluationStyle === 'dgav_oficial'
      ? 'Inspeção Oficial DGAV • DL 26/2017'
      : 'Boletim de Pré-Inspeção • Norma ISO 16122';

  return (
    <section
      aria-label="Resultado da conformidade da pré-inspeção do pulverizador"
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#1D734B] space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#3AAA35] block">
              Resultado Oficial
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              {styleBadgeText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {conformeCount} Conformes • {anomaliaCount} Anomalias / Falhas
          </span>
          <button
            type="button"
            onClick={onOpenGuide}
            aria-label="Abrir guia técnico e normativo"
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {conformityPct}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#3AAA35]">%</span>
            <span className="text-xs font-black uppercase tracking-wider text-[#8ffa94] ml-1">
              Conformidade Global
            </span>
            <div className="ml-2 inline-flex">
              {status === 'aprovado' && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-[#8ffa94] border border-emerald-500/40 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovado</span>
                </span>
              )}
              {status === 'atencao' && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Em Auditoria</span>
                </span>
              )}
              {status === 'reprovado' && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Reprovado</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            {statusLabel} ({conformeCount} validados de {totalItems} requisitos • {pendenteCount} pendentes • {anomaliaCount} anomalias)
          </p>
        </div>

        <div
          className={`rounded-2xl p-3 sm:px-4 space-y-1 border ${
            alertLevel === 'success'
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
              : alertLevel === 'warning'
              ? 'bg-amber-950/60 border-amber-700/80 text-amber-200'
              : 'bg-rose-950/60 border-rose-700/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Diagnóstico de Conformidade</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white leading-snug">
            {recommendation}
          </p>
          <p className="text-[10px] text-slate-300/80 font-mono">
            Taxa de aprovação: {conformityPct}% com base no universo total de {totalItems} requisitos.
          </p>
        </div>
      </div>
    </section>
  );
};
