import React from 'react';
import { Table } from 'lucide-react';
import type { CalculatedNozzleFlow } from './nozzleComparison.types';
import { formatPt } from './nozzleComparison.calculations';
import { NozzleColorBadge } from './NozzleColorBadge';

export interface ComparisonTableProps {
  flowA: CalculatedNozzleFlow;
  flowB: CalculatedNozzleFlow;
  workingPressureBar: number;
}

interface TableRowItem {
  label: string;
  valA: React.ReactNode;
  valB: React.ReactNode;
  isHighlight?: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  flowA,
  flowB,
  workingPressureBar
}) => {
  const nA = flowA.nozzle;
  const nB = flowB.nozzle;

  const tableRows: TableRowItem[] = [
    {
      label: 'Marca / Fabricante',
      valA: nA.brand,
      valB: nB.brand
    },
    {
      label: 'Modelo & Designação',
      valA: nA.modelNorm,
      valB: nB.modelNorm
    },
    {
      label: 'Tipo de Bico',
      valA: nA.nozzleType,
      valB: nB.nozzleType
    },
    {
      label: 'Ângulo de Pulverização',
      valA: flowA.sprayAngleText,
      valB: flowB.sprayAngleText
    },
    {
      label: 'Setor Agronómico',
      valA: nA.sprayFunction,
      valB: nB.sprayFunction
    },
    {
      label: 'Cor do bico & Norma ISO 10625',
      valA: <NozzleColorBadge nozzle={nA} size="md" showFlow={true} sideLabel="Bico A" />,
      valB: <NozzleColorBadge nozzle={nB} size="md" showFlow={true} sideLabel="Bico B" />
    },
    {
      label: 'Débito Nominal de Referência',
      valA: `${formatPt(nA.nominalFlowLMin, 2)} L/min @ ${formatPt(nA.referencePressureBar, 1)} bar`,
      valB: `${formatPt(nB.nominalFlowLMin, 2)} L/min @ ${formatPt(nB.referencePressureBar, 1)} bar`
    },
    {
      label: `Débito a ${formatPt(workingPressureBar, 1)} bar`,
      valA: `${formatPt(flowA.flowLMin, 2)} L/min (${flowA.originBadgeText})`,
      valB: `${formatPt(flowB.flowLMin, 2)} L/min (${flowB.originBadgeText})`,
      isHighlight: true
    },
    {
      label: 'Intervalo de Controlo Técnico',
      valA: `${formatPt(flowA.deviationMinLMin, 2)} – ${formatPt(flowA.deviationMaxLMin, 2)} L/min (±${flowA.tolerancePercentage}%)`,
      valB: `${formatPt(flowB.deviationMinLMin, 2)} – ${formatPt(flowB.deviationMaxLMin, 2)} L/min (±${flowB.tolerancePercentage}%)`
    },
    {
      label: 'Faixa de Pressão Recomendada',
      valA: `${formatPt(nA.pressureMinBar, 1)} – ${formatPt(nA.pressureMaxBar, 1)} bar`,
      valB: `${formatPt(nB.pressureMinBar, 1)} – ${formatPt(nB.pressureMaxBar, 1)} bar`
    },
    {
      label: 'Espectro de Gotas & Origem',
      valA: `${flowA.effectiveDropletClass || 'N/D'} (${flowA.dropletOrigin})`,
      valB: `${flowB.effectiveDropletClass || 'N/D'} (${flowB.dropletOrigin})`
    },
    {
      label: 'Sensibilidade Potencial à Deriva',
      valA: `${flowA.effectiveDriftSensitivity} (${flowA.driftOrigin})`,
      valB: `${flowB.effectiveDriftSensitivity} (${flowB.driftOrigin})`
    },
    {
      label: 'Filtro Recomendado (mesh)',
      valA: nA.recommendedFilterMesh ? `${nA.recommendedFilterMesh} mesh` : 'Não disponível',
      valB: nB.recommendedFilterMesh ? `${nB.recommendedFilterMesh} mesh` : 'Não disponível'
    },
    {
      label: 'Referência frequente no mercado português',
      valA: nA.isTop ? 'Sim' : 'Não',
      valB: nB.isTop ? 'Sim' : 'Não'
    },
    {
      label: 'Catálogo de Origem',
      valA: nA.sourceBody,
      valB: nB.sourceBody
    }
  ];

  return (
    <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-soft space-y-4 transition-all">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-daterra-primary text-white flex items-center justify-center font-bold">
          <Table className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
            Especificações Lado a Lado
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            Matriz Técnica Comparativa
          </h2>
        </div>
      </div>

      {/* Tabela em Desktop / Tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b-2 border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 w-1/3">Especificação Técnica</th>
              <th className="py-3 px-4 w-1/3 text-emerald-800 bg-emerald-50/50 rounded-t-xl">
                Bico A: {nA.brand} {nA.model}
              </th>
              <th className="py-3 px-4 w-1/3 text-sky-800 bg-sky-50/50 rounded-t-xl">
                Bico B: {nB.brand} {nB.model}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableRows.map((row, idx) => (
              <tr
                key={idx}
                className={`hover:bg-slate-50/80 transition-colors ${
                  row.isHighlight ? 'bg-amber-50/50 font-bold' : ''
                }`}
              >
                <td className="py-2.5 px-4 font-bold text-slate-600">
                  {row.label}
                </td>
                <td className="py-2.5 px-4 font-extrabold text-slate-900 bg-emerald-50/20 font-mono-numbers">
                  {row.valA}
                </td>
                <td className="py-2.5 px-4 font-extrabold text-slate-900 bg-sky-50/20 font-mono-numbers">
                  {row.valB}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartões Verticais Emparelhados em Smartphone */}
      <div className="md:hidden space-y-3">
        {tableRows.map((row, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border ${
              row.isHighlight
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-slate-50/60 border-slate-100'
            } space-y-2`}
          >
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              {row.label}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-xl border border-emerald-200">
                <span className="text-[9px] font-black text-emerald-800 uppercase block">Bico A</span>
                <span className="font-extrabold text-slate-900 font-mono-numbers">{row.valA}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-sky-200">
                <span className="text-[9px] font-black text-sky-800 uppercase block">Bico B</span>
                <span className="font-extrabold text-slate-900 font-mono-numbers">{row.valB}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
