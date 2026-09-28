import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import { formatPt, getNozzleColorPresentation } from './nozzleComparison.calculations';
import { NozzleCurvesChart } from './NozzleCurvesChart';

export interface NozzleCurvesModalProps {
  isOpen: boolean;
  onClose: () => void;
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
}

export const NozzleCurvesModal: React.FC<NozzleCurvesModalProps> = ({
  isOpen,
  onClose,
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar
}) => {
  if (!isOpen) return null;

  const presA = nozzleA ? getNozzleColorPresentation(nozzleA) : null;
  const presB = nozzleB ? getNozzleColorPresentation(nozzleB) : null;

  const deltaFlow = flowA && flowB ? flowB.flowLMin - flowA.flowLMin : 0;
  const deltaPercent = flowA && flowA.flowLMin > 0 ? (deltaFlow / flowA.flowLMin) * 100 : 0;
  const absDeltaPercent = Math.abs(deltaPercent);

  const formatNozzleFullName = (nozzle?: Nozzle) => {
    if (!nozzle) return 'Não selecionado';
    const colorPart = nozzle.color || nozzle.disc || 'Ref';
    const codePart = nozzle.isoCode ? `(${nozzle.isoCode})` : '(ND)';
    return `${nozzle.brand} ${nozzle.model} ${colorPart} ${codePart}`;
  };

  const getToleranceBadge = () => {
    if (!flowA || !flowB) return null;
    if (absDeltaPercent <= 5) {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-[#3CA64C]" />,
        text: `Desvio de ${formatPt(absDeltaPercent, 1)}% dentro da tolerância de campo (< 5%)`,
        badge: 'Equivalente',
        badgeClass: 'text-[#114037] bg-white border-slate-200'
      };
    }
    if (absDeltaPercent <= 10) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        text: `Desvio de ${formatPt(absDeltaPercent, 1)}% — Requer ajuste de velocidade ou pressão`,
        badge: 'Atenção',
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-200'
      };
    }
    return {
      icon: <XCircle className="w-4 h-4 text-rose-500" />,
      text: `Desvio de ${formatPt(absDeltaPercent, 1)}% — Bicos não são equivalentes diretos`,
      badge: 'Não equivalente',
      badgeClass: 'text-rose-800 bg-rose-50 border-rose-200'
    };
  };

  const tolerance = getToleranceBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in font-sans">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Handle de toque (Mobile) */}
        <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Cabeçalho */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#114037]/10 text-[#114037]">
                Comparativo Hidráulico
              </span>
              <span className="text-[10px] font-semibold text-slate-400">ISO 10625</span>
            </div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Curvas de Pressão vs. Débito
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Desempenho hidráulico em regime contínuo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gráfico"
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legenda com Cores ISO e Delta */}
        <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 flex flex-col gap-1.5 text-xs">
          {/* Bico A */}
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs border"
                style={{
                  backgroundColor: presA?.hex || '#CBD5E1',
                  borderColor: presA?.hex.toLowerCase() === '#ffffff' ? '#94A3B8' : 'rgba(0,0,0,0.1)'
                }}
              />
              <span className="w-3.5 h-0.5 bg-[#114037] rounded-full shrink-0" />
              <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                Bico A | {formatNozzleFullName(nozzleA)}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#114037] bg-[#114037]/5 px-2 py-0.5 rounded-md">
              Referência
            </span>
          </div>

          {/* Bico B */}
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs border"
                style={{
                  backgroundColor: presB?.hex || '#CBD5E1',
                  borderColor: presB?.hex.toLowerCase() === '#ffffff' ? '#94A3B8' : 'rgba(0,0,0,0.1)'
                }}
              />
              <span className="w-3.5 h-0.5 border-b-2 border-dashed border-[#3CA64C] shrink-0" />
              <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                Bico B | {formatNozzleFullName(nozzleB)}
              </span>
            </div>
            {flowA && flowB && (
              <span className="text-[10px] font-mono font-bold text-[#3CA64C] bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                {deltaPercent >= 0 ? `+${formatPt(deltaPercent, 1)}%` : `${formatPt(deltaPercent, 1)}%`}
              </span>
            )}
          </div>
        </div>

        {/* Gráfico SVG e Resultados */}
        <div className="p-4 bg-white flex flex-col items-center overflow-y-auto">
          <NozzleCurvesChart
            nozzleA={nozzleA}
            nozzleB={nozzleB}
            flowA={flowA}
            flowB={flowB}
            workingPressureBar={workingPressureBar}
          />

          {/* Cartões de Débito (Padrão DATERRA JetBrains Mono) */}
          <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Débito Bico A
                </span>
                <span className="w-2 h-2 rounded-full bg-[#114037]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-[#114037]">
                  {flowA ? formatPt(flowA.flowLMin) : '—'}
                </span>
                <span className="text-[11px] font-bold text-slate-500">L/min</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium truncate">
                {nozzleA ? `${nozzleA.brand} ${nozzleA.model}` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-green-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-extrabold uppercase text-[#114037] tracking-wider">
                  Débito Bico B
                </span>
                <span className="w-2 h-2 rounded-full bg-[#3CA64C]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-[#3CA64C]">
                  {flowB ? formatPt(flowB.flowLMin) : '—'}
                </span>
                <span className="text-[11px] font-bold text-green-700">L/min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-medium truncate">
                  {nozzleB ? `${nozzleB.brand} ${nozzleB.model}` : '—'}
                </span>
                {flowA && flowB && (
                  <span className="text-[9px] font-mono font-bold text-green-700">
                    {deltaFlow >= 0 ? `+${formatPt(deltaFlow, 2)}` : formatPt(deltaFlow, 2)} L/min
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Validação Agronómica de Tolerância */}
          {tolerance && (
            <div className="w-full mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">{tolerance.icon}</span>
                <span className="text-[11px] font-medium text-slate-700 truncate">
                  {tolerance.text}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${tolerance.badgeClass}`}>
                {tolerance.badge}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé com Botão Principal (Touch-Target >= 48px) */}
        <div className="p-3.5 border-t border-slate-100 bg-[#F8F9FA] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 h-12 rounded-2xl bg-[#114037] text-white font-bold text-sm hover:bg-[#0c2e28] transition-all shadow-md active:scale-[0.99] touch-target flex items-center justify-center"
          >
            Fechar Gráfico
          </button>
        </div>
      </div>
    </div>
  );
};
