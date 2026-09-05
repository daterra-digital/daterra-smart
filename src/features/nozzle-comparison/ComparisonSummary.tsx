import React from 'react';
import {
  Scale,
  ArrowUpRight,
  Droplets,
  Wind,
  Gauge,
  Compass,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { ComparisonSummaryResult } from './nozzleComparison.types';
import { formatPt } from './nozzleComparison.calculations';

export interface ComparisonSummaryProps {
  comparison: ComparisonSummaryResult;
  workingPressureBar?: number;
}

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  comparison
}) => {
  const {
    nozzleA,
    nozzleB,
    absoluteDifferenceLMin,
    percentageDifference,
    higherFlowNozzle,
    flowComparisonText,
    dropletComparisonText,
    driftComparisonText,
    pressureRangeAnalysis,
    generalRecommendation,
    disclaimer
  } = comparison;

  const absDiffFormatted = formatPt(Math.abs(absoluteDifferenceLMin), 2);
  const percDiffFormatted = percentageDifference !== null ? formatPt(Math.abs(percentageDifference), 1) : null;

  return (
    <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-soft space-y-6 transition-all">
      {/* 1. CABEÇALHO DO RESUMO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-daterra-primary text-white flex items-center justify-center font-bold shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
              Análise Diferencial & Interpretação Técnica
            </span>
            <h2 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
              Resumo Comparativo de Débito
            </h2>
          </div>
        </div>

        {/* Badge Resumo de Variação */}
        <div className="self-start sm:self-center">
          {higherFlowNozzle === 'EQUAL' ? (
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>Débitos equivalentes à mesma pressão</span>
            </span>
          ) : (
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-sm ${
                higherFlowNozzle === 'B'
                  ? 'bg-sky-50 text-sky-900 border-sky-300'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>
                {higherFlowNozzle === 'B' ? 'Bico B' : 'Bico A'} +{absDiffFormatted} L/min
                {percDiffFormatted ? ` (+${percDiffFormatted}%)` : ''}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 2. CARTÕES DE COMPARAÇÃO PARALELA (BICO A vs BICO B) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Cartão Bico A */}
        <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              Bico A: {nozzleA.nozzle.brand} {nozzleA.nozzle.model}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {nozzleA.originBadgeText}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono-numbers">
            {formatPt(nozzleA.flowLMin, 2)} <span className="text-xs font-bold text-emerald-800">L/min</span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-0.5">
            <div>Espectro: <strong>{nozzleA.effectiveDropletClass || 'N/D'}</strong> ({nozzleA.dropletOrigin})</div>
            <div>Sensibilidade à deriva: <strong>{nozzleA.effectiveDriftSensitivity}</strong></div>
          </div>
        </div>

        {/* Cartão Bico B */}
        <div className="p-4 bg-sky-50/40 rounded-2xl border border-sky-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider">
              Bico B: {nozzleB.nozzle.brand} {nozzleB.nozzle.model}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {nozzleB.originBadgeText}
            </span>
          </div>
          <div className="text-2xl font-black text-sky-950 font-mono-numbers">
            {formatPt(nozzleB.flowLMin, 2)} <span className="text-xs font-bold text-sky-800">L/min</span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-0.5">
            <div>Espectro: <strong>{nozzleB.effectiveDropletClass || 'N/D'}</strong> ({nozzleB.dropletOrigin})</div>
            <div>Sensibilidade à deriva: <strong>{nozzleB.effectiveDriftSensitivity}</strong></div>
          </div>
        </div>
      </div>

      {/* 3. ANÁLISE DA FAIXA COMUM DE PRESSÃO E AVISOS */}
      <div className="space-y-2.5">
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
          pressureRangeAnalysis.hasCommonRange
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-2 font-extrabold">
            <Gauge className={`w-4 h-4 ${pressureRangeAnalysis.hasCommonRange ? 'text-daterra-primary' : 'text-amber-700'}`} />
            <span>{pressureRangeAnalysis.commonRangeText}</span>
          </div>
          {pressureRangeAnalysis.warningNote && (
            <p className="text-[11px] font-medium leading-relaxed">
              {pressureRangeAnalysis.warningNote}
            </p>
          )}
        </div>

        {/* Alerta de Bico de Fenda Sub-pressurizado */}
        {pressureRangeAnalysis.isFlatFanUnderpressurized && pressureRangeAnalysis.flatFanUnderpressureWarning && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-900 font-bold leading-relaxed animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{pressureRangeAnalysis.flatFanUnderpressureWarning}</span>
          </div>
        )}
      </div>

      {/* 4. SÍNTESE DIFERENCIAL */}
      <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-700">
        <div className="flex items-start gap-2.5">
          <Droplets className="w-4 h-4 text-daterra-primary shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            {flowComparisonText}
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <Wind className="w-4 h-4 text-daterra-primary shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            {driftComparisonText}
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <Compass className="w-4 h-4 text-daterra-primary shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            {dropletComparisonText}
          </p>
        </div>
      </div>

      {/* 5. INTERPRETAÇÃO TÉCNICA ORIENTADORA */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-2xl space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-daterra-primary flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-daterra-accent" />
          Interpretação Técnica Orientadora
        </span>
        <p className="text-xs text-slate-800 font-bold leading-relaxed">
          {generalRecommendation}
        </p>
      </div>

      {/* 6. AVISO E DISCLAIMER REGULAMENTAR DE CALIBRAÇÃO */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-700 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-daterra-primary" />
          Procedimento de Campo Obrigatório
        </span>
        <p>
          {disclaimer}
        </p>
      </div>
    </div>
  );
};
