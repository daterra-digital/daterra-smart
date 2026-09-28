import React from 'react';
import { TableProperties, ChevronRight } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import { formatPt } from './nozzleComparison.calculations';

export interface NozzleComparisonMatrixCardProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  onOpenDetailsModal?: () => void;
  className?: string;
}

export const NozzleComparisonMatrixCard: React.FC<NozzleComparisonMatrixCardProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  onOpenDetailsModal,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm ${className}`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs">
            <TableProperties className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
              Especificações e Análise
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Matriz Comparativa
            </h3>
          </div>
        </div>

        {onOpenDetailsModal && (
          <button
            type="button"
            onClick={onOpenDetailsModal}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Ver detalhes</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Tabela com scroll horizontal suave em mobile */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-xs text-left min-w-[320px]">
          <thead className="bg-[#F8F9FA] border-b border-slate-200 text-slate-600 font-extrabold text-[11px]">
            <tr>
              <th className="p-3 w-1/3">Parâmetro</th>
              <th className="p-3 w-1/3 text-slate-900">
                Bico A · {nozzleA ? `${nozzleA.brand} ${nozzleA.model}` : '—'}
              </th>
              <th className="p-3 w-1/3 text-slate-900">
                Bico B · {nozzleB ? `${nozzleB.brand} ${nozzleB.model}` : '—'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr>
              <td className="p-3 text-slate-500 font-semibold">Débito</td>
              <td className="p-3 font-mono font-bold text-slate-900">
                {flowA ? `${formatPt(flowA.flowLMin)} L/min` : '—'}
              </td>
              <td className="p-3 font-mono font-bold text-[#3CA64C]">
                {flowB ? `${formatPt(flowB.flowLMin)} L/min` : '—'}
              </td>
            </tr>
            <tr className="bg-slate-50/40">
              <td className="p-3 text-slate-500 font-semibold">Tamanho de gota</td>
              <td className="p-3 font-bold text-slate-800">
                {flowA?.effectiveDropletClass ? `● ${flowA.effectiveDropletClass}` : '—'}
              </td>
              <td className="p-3 font-bold text-amber-700">
                {flowB?.effectiveDropletClass ? `● ${flowB.effectiveDropletClass}` : '—'}
              </td>
            </tr>
            <tr>
              <td className="p-3 text-slate-500 font-semibold">Pressão recomendada</td>
              <td className="p-3 font-mono text-slate-800">
                {nozzleA ? `${formatPt(nozzleA.pressureMinBar, 1)}–${formatPt(nozzleA.pressureMaxBar, 1)} bar` : '—'}
              </td>
              <td className="p-3 font-mono text-slate-800">
                {nozzleB ? `${formatPt(nozzleB.pressureMinBar, 1)}–${formatPt(nozzleB.pressureMaxBar, 1)} bar` : '—'}
              </td>
            </tr>
            <tr className="bg-slate-50/40">
              <td className="p-3 text-slate-500 font-semibold">Ângulo de pulverização</td>
              <td className="p-3 font-mono text-slate-800">
                {nozzleA?.sprayAngleDeg ? `${nozzleA.sprayAngleDeg}°` : '—'}
              </td>
              <td className="p-3 font-mono text-slate-800">
                {nozzleB?.sprayAngleDeg ? `${nozzleB.sprayAngleDeg}°` : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
