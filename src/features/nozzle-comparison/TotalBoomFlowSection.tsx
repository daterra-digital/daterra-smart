import React from 'react';
import { ChevronDown, ChevronUp, Layers, Info } from 'lucide-react';
import { formatPt, calculateTotalBoomFlow } from './nozzleComparison.calculations';

export interface TotalBoomFlowSectionProps {
  flowPerNozzleLMin: number;
  nozzleLabel?: string;
  defaultNozzleCount?: number;
}

export const TotalBoomFlowSection: React.FC<TotalBoomFlowSectionProps> = ({
  flowPerNozzleLMin,
  nozzleLabel = 'Bico selecionado',
  defaultNozzleCount = 24
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [nozzleCount, setNozzleCount] = React.useState<number>(defaultNozzleCount);

  const totalCalculation = React.useMemo(() => {
    return calculateTotalBoomFlow(flowPerNozzleLMin, nozzleCount);
  }, [flowPerNozzleLMin, nozzleCount]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden transition-all">
      {/* Botão de Expansão / Recolha */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-daterra-primary outline-none min-h-[48px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 block">
              Dimensionamento da Barra (Opcional)
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Calcular débito total do conjunto
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                {nozzleCount} bicos: {formatPt(totalCalculation.totalBoomFlowLMin, 2)} L/min
              </span>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </div>
      </button>

      {/* Conteúdo Expandido */}
      {isOpen && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Campo 1: Débito Unitário */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Débito por Bico ({nozzleLabel})
              </span>
              <div className="text-lg font-black text-slate-900 font-mono-numbers">
                {formatPt(flowPerNozzleLMin, 2)} <span className="text-xs font-bold text-slate-500">L/min</span>
              </div>
            </div>

            {/* Campo 2: Número de Bicos */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <label htmlFor="boom-nozzle-count" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                Número de Bicos em Funcionamento
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNozzleCount(Math.max(1, nozzleCount - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-all min-h-[36px] min-w-[36px]"
                >
                  −
                </button>
                <input
                  id="boom-nozzle-count"
                  type="number"
                  min={1}
                  max={200}
                  value={nozzleCount}
                  onChange={e => setNozzleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 h-9 text-center bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-daterra-primary"
                />
                <button
                  type="button"
                  onClick={() => setNozzleCount(nozzleCount + 1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-all min-h-[36px] min-w-[36px]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Campo 3: Débito Total Estimado do Conjunto */}
            <div className="bg-teal-900 text-white p-4 rounded-2xl shadow-md space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 block">
                Débito Total Estimado do Conjunto
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono-numbers text-teal-50">
                {formatPt(totalCalculation.totalBoomFlowLMin, 2)} <span className="text-xs font-bold text-teal-200">L/min</span>
              </div>
            </div>
          </div>

          {/* Aviso Técnico */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-medium">
              {totalCalculation.warningNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
