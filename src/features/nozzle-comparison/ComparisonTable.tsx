import React from 'react';
import {
  Table,
  HelpCircle,
  ChevronDown,
  FileText,
  Building2,
  Activity,
  Minus,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import type { CalculatedNozzleFlow, ComparisonSummaryResult } from './nozzleComparison.types';
import {
  formatPt,
  getDropletSpectrumMeasurements,
  calculateTotalBoomFlow
} from './nozzleComparison.calculations';
import { NozzleColorBadge } from './NozzleColorBadge';
import { getManufacturerInfo } from './manufacturerData';
import { getLabMeasurementEvidence, formatLabEvidenceSummary } from './labEvidenceData';

export interface ComparisonTableProps {
  flowA: CalculatedNozzleFlow;
  flowB: CalculatedNozzleFlow;
  comparison?: ComparisonSummaryResult;
  workingPressureBar: number;
  onOpenMicrolearning?: () => void;
}

interface TableRowItem {
  label: React.ReactNode;
  valA: React.ReactNode;
  valB: React.ReactNode;
  isHighlight?: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  flowA,
  flowB,
  workingPressureBar,
  onOpenMicrolearning
}) => {
  const nA = flowA.nozzle;
  const nB = flowB.nozzle;

  // Estado do acordeão da Matriz Técnica Comparativa (recolhido por defeito)
  const [isMatrixOpen, setIsMatrixOpen] = React.useState<boolean>(false);

  // Estado do dimensionamento sucinto da barra
  const [nozzleCount, setNozzleCount] = React.useState<number>(24);

  // Estado para expandir detalhes adicionais
  const [isExtraDetailsOpen, setIsExtraDetailsOpen] = React.useState<boolean>(false);

  // Cálculos do débito total do conjunto
  const boomFlowA = React.useMemo(() => {
    return calculateTotalBoomFlow(flowA.flowLMin, nozzleCount);
  }, [flowA.flowLMin, nozzleCount]);

  const boomFlowB = React.useMemo(() => {
    return calculateTotalBoomFlow(flowB.flowLMin, nozzleCount);
  }, [flowB.flowLMin, nozzleCount]);

  // Metadados comerciais
  const manufacturerA = React.useMemo(() => getManufacturerInfo(nA.brand), [nA.brand]);
  const manufacturerB = React.useMemo(() => getManufacturerInfo(nB.brand), [nB.brand]);

  // Evidências laboratoriais
  const labEvidenceA = React.useMemo(() => getLabMeasurementEvidence(nA.id, workingPressureBar), [nA.id, workingPressureBar]);
  const labEvidenceB = React.useMemo(() => getLabMeasurementEvidence(nB.id, workingPressureBar), [nB.id, workingPressureBar]);
  const labSummaryA = React.useMemo(() => formatLabEvidenceSummary(labEvidenceA), [labEvidenceA]);
  const labSummaryB = React.useMemo(() => formatLabEvidenceSummary(labEvidenceB), [labEvidenceB]);

  // Medições de gotas (Dv10, Dv50, Dv90)
  const dropletMeasurementsA = React.useMemo(() => getDropletSpectrumMeasurements(nA), [nA]);
  const dropletMeasurementsB = React.useMemo(() => getDropletSpectrumMeasurements(nB), [nB]);

  // Linhas da Matriz Técnica Lado a Lado
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
      label: `Débito a ${formatPt(workingPressureBar, 1)} bar (Unitário)`,
      valA: `${formatPt(flowA.flowLMin, 2)} L/min (${flowA.originBadgeText})`,
      valB: `${formatPt(flowB.flowLMin, 2)} L/min (${flowB.originBadgeText})`,
      isHighlight: true
    },
    {
      label: 'Débito Total',
      valA: (
        <div className="space-y-0.5">
          <div className="text-sm font-black text-emerald-950 font-mono-numbers">
            {formatPt(boomFlowA.totalBoomFlowLMin, 2)} <span className="text-xs font-bold text-emerald-800">L/min</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {nozzleCount} bicos × {formatPt(flowA.flowLMin, 2)} L/min
          </span>
        </div>
      ),
      valB: (
        <div className="space-y-0.5">
          <div className="text-sm font-black text-sky-950 font-mono-numbers">
            {formatPt(boomFlowB.totalBoomFlowLMin, 2)} <span className="text-xs font-bold text-sky-800">L/min</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {nozzleCount} bicos × {formatPt(flowB.flowLMin, 2)} L/min
          </span>
        </div>
      ),
      isHighlight: true
    },
    {
      label: 'Desvio máximo admissível (±10%)',
      valA: `${formatPt(flowA.deviationMinLMin, 2)} – ${formatPt(flowA.deviationMaxLMin, 2)} L/min`,
      valB: `${formatPt(flowB.deviationMinLMin, 2)} – ${formatPt(flowB.deviationMaxLMin, 2)} L/min`
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft transition-all duration-300 overflow-hidden">
      
      {/* 1. CABEÇALHO DO CARTÃO: TÍTULO + SUBTÍTULO + BOTÕES VER E AJUDA */}
      <div className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isMatrixOpen ? 'border-b border-slate-100 pb-4' : ''
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-daterra-primary text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Table className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
              Especificações e Análise Comparativa
            </span>
            <h2 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
              Matriz Técnica Comparativa
            </h2>
          </div>
        </div>

        {/* Controles do Cabeçalho: Seletor de Bicos (quando expandido), Botão Ver/Ocultar e Botão Ajuda */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
          {isMatrixOpen && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2.5 py-1.5 rounded-2xl text-xs shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                Número:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNozzleCount(Math.max(1, nozzleCount - 1))}
                  aria-label="Diminuir bicos na barra"
                  className="w-5 h-5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-black text-[10px] flex items-center justify-center border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <input
                  id="header-boom-nozzles"
                  type="number"
                  min={1}
                  max={200}
                  value={nozzleCount}
                  onChange={e => setNozzleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-11 h-5 text-center bg-white border border-slate-300 rounded text-xs font-black text-slate-900 outline-none focus:border-daterra-primary"
                />
                <button
                  type="button"
                  onClick={() => setNozzleCount(nozzleCount + 1)}
                  aria-label="Aumentar bicos na barra"
                  className="w-5 h-5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-black text-[10px] flex items-center justify-center border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
                <span className="text-[10px] font-bold text-slate-600 ml-0.5">bicos</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMatrixOpen(!isMatrixOpen)}
            aria-expanded={isMatrixOpen}
            aria-label={isMatrixOpen ? 'Ocultar matriz técnica comparativa' : 'Ver matriz técnica comparativa'}
            className="px-4 py-2 bg-daterra-primary hover:bg-[#1b4332] text-white rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm min-h-[40px] cursor-pointer"
          >
            {isMatrixOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isMatrixOpen ? 'Ocultar' : 'Ver'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMatrixOpen ? 'rotate-180' : ''}`} />
          </button>

          {onOpenMicrolearning && (
            <button
              type="button"
              onClick={onOpenMicrolearning}
              aria-label="Abrir guia de microlearning agronómico"
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm min-h-[40px] cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>Ajuda</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CONTEÚDO RECOLHIDO EM ACORDEÃO */}
      {isMatrixOpen && (
        <div className="p-4 sm:p-6 sm:pt-5 space-y-6 animate-fade-in">
          
          <div className="space-y-3.5">
        {/* Tabela em Desktop / Tablet */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-1/3 bg-slate-50">Especificação Técnica</th>
                <th className="py-3 px-4 w-1/3 text-emerald-800 bg-emerald-50/50">
                  Bico A: {nA.brand} {nA.model}
                </th>
                <th className="py-3 px-4 w-1/3 text-sky-800 bg-sky-50/50">
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

        {/* Cartões Verticais em Mobile */}
        <div className="md:hidden space-y-2.5">
          {tableRows.map((row, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${
                row.isHighlight
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-slate-50/60 border-slate-100'
              } space-y-1.5`}
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

      {/* 5. SECÇÃO EXPANSÍVEL: MAIS INFORMAÇÕES E DETALHES TÉCNICOS */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsExtraDetailsOpen(!isExtraDetailsOpen)}
          aria-expanded={isExtraDetailsOpen}
          className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all flex items-center justify-between min-h-[44px] cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-daterra-primary" />
            <span>{isExtraDetailsOpen ? 'Ocultar detalhes laboratoriais e comerciais' : 'Ver mais informações e ensaios laboratoriais'}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExtraDetailsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isExtraDetailsOpen && (
          <div className="mt-4 space-y-4 text-xs animate-fade-in border-t border-slate-100 pt-4">
            
            {/* Informações Comerciais dos Fabricantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {manufacturerA && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Fabricante Bico A ({manufacturerA.brand})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
                    <div>País: <strong className="text-slate-800">{manufacturerA.country}</strong></div>
                    <div>Grupo: <strong className="text-slate-800">{manufacturerA.businessGroup}</strong></div>
                    <div className="col-span-2">Nicho: <strong className="text-slate-800">{manufacturerA.niche}</strong></div>
                  </div>
                </div>
              )}

              {manufacturerB && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-sky-700" />
                    <span>Fabricante Bico B ({manufacturerB.brand})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
                    <div>País: <strong className="text-slate-800">{manufacturerB.country}</strong></div>
                    <div>Grupo: <strong className="text-slate-800">{manufacturerB.businessGroup}</strong></div>
                    <div className="col-span-2">Nicho: <strong className="text-slate-800">{manufacturerB.niche}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Ensaios Laboratoriais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ensaio Laboratorial Bico A</span>
                </div>
                <p className="text-[11px] text-slate-700">{labSummaryA.statusText}</p>
                {labEvidenceA && (
                  <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                    <div>Entidade: <strong>{labEvidenceA.realEntityName}</strong></div>
                    <div>Método: <strong>{labEvidenceA.method}</strong></div>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <Activity className="w-3.5 h-3.5 text-sky-700" />
                  <span>Ensaio Laboratorial Bico B</span>
                </div>
                <p className="text-[11px] text-slate-700">{labSummaryB.statusText}</p>
                {labEvidenceB && (
                  <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                    <div>Entidade: <strong>{labEvidenceB.realEntityName}</strong></div>
                    <div>Método: <strong>{labEvidenceB.method}</strong></div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabelas Granulométricas Reais (Dv10, Dv50, Dv90) */}
            {(dropletMeasurementsA.length > 0 || dropletMeasurementsB.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dropletMeasurementsA.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-slate-900 block">
                      {dropletMeasurementsB.length > 0
                        ? 'Espectro do Diâmetro de Gotas do Bico Albuz ATR (Bico A)'
                        : 'Espectro do Diâmetro de Gotas do Bico Albuz ATR'}
                    </span>
                    <table className="w-full text-[10px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-1">Pressão</th>
                          <th className="py-1">Dv10</th>
                          <th className="py-1">Dv50 (VMD)</th>
                          <th className="py-1">Dv90</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono-numbers">
                        {dropletMeasurementsA.map(m => (
                          <tr key={m.pressureBar}>
                            <td className="py-1 font-bold">{m.pressureBar} bar</td>
                            <td className="py-1">{m.dv10Micrometres ? `${m.dv10Micrometres} µm` : 'N/D'}</td>
                            <td className="py-1 font-bold text-emerald-800">{m.dv50Micrometres ? `${m.dv50Micrometres} µm` : 'N/D'}</td>
                            <td className="py-1">{m.dv90Micrometres ? `${m.dv90Micrometres} µm` : 'N/D'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {dropletMeasurementsB.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-slate-900 block">
                      {dropletMeasurementsA.length > 0
                        ? 'Espectro do Diâmetro de Gotas do Bico Albuz ATR (Bico B)'
                        : 'Espectro do Diâmetro de Gotas do Bico Albuz ATR'}
                    </span>
                    <table className="w-full text-[10px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-1">Pressão</th>
                          <th className="py-1">Dv10</th>
                          <th className="py-1">Dv50 (VMD)</th>
                          <th className="py-1">Dv90</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono-numbers">
                        {dropletMeasurementsB.map(m => (
                          <tr key={m.pressureBar}>
                            <td className="py-1 font-bold">{m.pressureBar} bar</td>
                            <td className="py-1">{m.dv10Micrometres ? `${m.dv10Micrometres} µm` : 'N/D'}</td>
                            <td className="py-1 font-bold text-sky-800">{m.dv50Micrometres ? `${m.dv50Micrometres} µm` : 'N/D'}</td>
                            <td className="py-1">{m.dv90Micrometres ? `${m.dv90Micrometres} µm` : 'N/D'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
