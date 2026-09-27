import React from 'react';
import { X, TableProperties } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow, ComparisonSummaryResult } from './nozzleComparison.types';
import { formatPt } from './nozzleComparison.calculations';

export interface NozzleComparisonMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  comparison?: ComparisonSummaryResult;
  workingPressureBar: number;
}

export const NozzleComparisonMatrixModal: React.FC<NozzleComparisonMatrixModalProps> = ({
  isOpen,
  onClose,
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  comparison,
  workingPressureBar
}) => {
  if (!isOpen) return null;

  const formatIdentityRow = (nozzle?: Nozzle) => {
    if (!nozzle) return '—';
    if (nozzle.disc || nozzle.swirlPlate) {
      return `${nozzle.swirlPlate || '—'} / ${nozzle.disc || '—'}`;
    }
    return `${nozzle.color || 'Ref'} (${nozzle.isoCode || 'ND'})`;
  };

  const rows = [
    {
      key: 'model',
      label: 'Marca | Modelo',
      valA: nozzleA ? `${nozzleA.brand} ${nozzleA.model}` : '—',
      valB: nozzleB ? `${nozzleB.brand} ${nozzleB.model}` : '—'
    },
    {
      key: 'color-iso',
      label: 'Cor e Código ISO',
      valA: formatIdentityRow(nozzleA),
      valB: formatIdentityRow(nozzleB)
    },
    {
      key: 'flow',
      label: 'Débito à Pressão Atual',
      valA: flowA ? `${formatPt(flowA.flowLMin)} L/min` : '—',
      valB: flowB ? `${formatPt(flowB.flowLMin)} L/min` : '—'
    },
    {
      key: 'diff',
      label: (
        <span>
          Diferença de Débito
          <span className="block text-[10px] text-slate-500 font-medium whitespace-nowrap">
            (B vs A)
          </span>
        </span>
      ),
      valA: 'Referência',
      valB: comparison && comparison.percentageDifference !== null ? `${comparison.percentageDifference > 0 ? '+' : ''}${formatPt(comparison.percentageDifference, 1)}%` : '—'
    },
    {
      key: 'droplet',
      label: 'Classe de Diâmetro de Gota',
      valA: flowA?.effectiveDropletClass || '—',
      valB: flowB?.effectiveDropletClass || '—'
    },
    {
      key: 'drift',
      label: 'Sensibilidade à Deriva',
      valA: flowA?.effectiveDriftSensitivity || '—',
      valB: flowB?.effectiveDriftSensitivity || '—'
    },
    {
      key: 'angle',
      label: 'Ângulo de Pulverização',
      valA: flowA?.sprayAngleText || `${nozzleA?.sprayAngleDeg || '—'}°`,
      valB: flowB?.sprayAngleText || `${nozzleB?.sprayAngleDeg || '—'}°`
    },
    {
      key: 'pressure',
      label: 'Pressão Min/Max',
      valA: nozzleA ? `${nozzleA.pressureMinBar} a ${nozzleA.pressureMaxBar} bar` : '—',
      valB: nozzleB ? `${nozzleB.pressureMinBar} a ${nozzleB.pressureMaxBar} bar` : '—'
    },
    {
      key: 'filter',
      label: 'Filtro Recomendado',
      valA: nozzleA?.recommendedFilterMesh ? `${nozzleA.recommendedFilterMesh} mesh` : '—',
      valB: nozzleB?.recommendedFilterMesh ? `${nozzleB.recommendedFilterMesh} mesh` : '—'
    },
    {
      key: 'type',
      label: 'Tipo de Jato',
      valA: nozzleA?.nozzleType || '—',
      valB: nozzleB?.nozzleType || '—'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in font-sans">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-daterra-primary text-white flex items-center justify-center">
              <TableProperties className="w-4 h-4 text-daterra-accent" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-daterra-accent">
                Análise Técnica Lado a Lado
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Matriz Comparativa
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo da Tabela */}
        <div className="p-4 overflow-y-auto space-y-3">
          <div className="text-xs text-slate-600 bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl font-medium">
            Comparação calculada à pressão de trabalho de <strong className="text-daterra-primary font-mono">{formatPt(workingPressureBar)} bar</strong>.
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200">
                  <th className="p-2.5">Parâmetro</th>
                  <th className="p-2.5 text-[#114037]">Bico A</th>
                  <th className="p-2.5 text-slate-800">Bico B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r.key} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="p-2.5 font-bold text-slate-700">{r.label}</td>
                    <td className="p-2.5 font-mono font-semibold text-[#114037]">{r.valA}</td>
                    <td className="p-2.5 font-mono font-semibold text-slate-800">{r.valB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 h-12 rounded-xl bg-daterra-primary text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Fechar Matriz
          </button>
        </div>
      </div>
    </div>
  );
};
