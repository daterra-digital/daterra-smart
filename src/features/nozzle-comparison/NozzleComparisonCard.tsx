import React from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Info,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileText,
  Activity
} from 'lucide-react';
import type { CalculatedNozzleFlow } from './nozzleComparison.types';
import { formatPt, getDropletSpectrumMeasurements } from './nozzleComparison.calculations';
import { getManufacturerInfo } from './manufacturerData';
import { getLabMeasurementEvidence, formatLabEvidenceSummary } from './labEvidenceData';
import { NozzleColorBadge } from './NozzleColorBadge';

export interface NozzleComparisonCardProps {
  calculatedFlow: CalculatedNozzleFlow;
  side: 'A' | 'B';
  title?: string;
}

export const NozzleComparisonCard: React.FC<NozzleComparisonCardProps> = ({
  calculatedFlow,
  side,
  title
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState<boolean>(false);
  const { nozzle, workingPressureBar } = calculatedFlow;
  const displayTitle = title || (side === 'A' ? 'Bico A' : 'Bico B');

  // Metadados Comerciais do Fabricante
  const manufacturerInfo = React.useMemo(() => {
    return getManufacturerInfo(nozzle.brand);
  }, [nozzle.brand]);

  // Evidência e Medição Laboratorial
  const labEvidence = React.useMemo(() => {
    return getLabMeasurementEvidence(nozzle.id, workingPressureBar);
  }, [nozzle.id, workingPressureBar]);

  const labSummary = React.useMemo(() => {
    return formatLabEvidenceSummary(labEvidence);
  }, [labEvidence]);

  // Medições reais de Dv10, Dv50, Dv90 disponíveis para este bico
  const dropletMeasurements = React.useMemo(() => {
    return getDropletSpectrumMeasurements(nozzle);
  }, [nozzle]);

  const sideBadgeClass =
    side === 'A'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : 'bg-sky-100 text-sky-800 border-sky-300';

  // Cores de apoio para a escala simplificada de deriva
  const driftBadgeStyle = React.useMemo(() => {
    switch (calculatedFlow.shortDriftLevel) {
      case 'Deriva: Baixa':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          iconColor: 'text-emerald-600',
          Icon: ShieldCheck
        };
      case 'Deriva: Média':
        return {
          bg: 'bg-yellow-50 border-yellow-200 text-yellow-950',
          iconColor: 'text-yellow-600',
          Icon: ShieldAlert
        };
      case 'Deriva: Elevada':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-950',
          iconColor: 'text-rose-600',
          Icon: ShieldAlert
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          iconColor: 'text-slate-400',
          Icon: ShieldAlert
        };
    }
  }, [calculatedFlow.shortDriftLevel]);

  const DriftIcon = driftBadgeStyle.Icon;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 sm:p-6 space-y-4 transition-all">
      {/* 1. CABEÇALHO: IDENTIFICAÇÃO (Marca + Modelo + Ângulo + Norma) */}
      <div className="space-y-2.5 border-b border-slate-100 pb-3.5">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${sideBadgeClass}`}>
            {displayTitle}
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono-numbers">
            {formatPt(workingPressureBar, 1)} bar
          </span>
        </div>

        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            {nozzle.brand}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
            {nozzle.modelNorm}
          </h3>
        </div>

        {/* 2. COR DO BICO EM DESTAQUE */}
        <NozzleColorBadge
          nozzle={nozzle}
          size="large"
          showFlow={true}
          showIso={true}
          sideLabel={displayTitle}
        />

        {/* Tags de Classificação Técnica */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            {nozzle.nozzleType}
          </span>

          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            {calculatedFlow.sprayAngleText}
          </span>

          {nozzle.isIsoNozzle ? (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Norma ISO 10625
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Cor do Fabricante
            </span>
          )}
        </div>
      </div>

      {/* 3. BLOCO DE DÉBITO PRINCIPAL À PRESSÃO SELECIONADA */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-extrabold text-slate-600">
            Débito a {formatPt(workingPressureBar, 1)} bar:
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
              calculatedFlow.valueOrigin === 'tabelado'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {calculatedFlow.originBadgeText}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono-numbers tracking-tight">
            {formatPt(calculatedFlow.flowLMin, 2)}
          </span>
          <span className="text-sm font-bold text-slate-500">
            L/min
          </span>
        </div>

        {/* Intervalo Indicativo de Controlo Técnico */}
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
          <span className="font-semibold">
            Intervalo de controlo (±{calculatedFlow.tolerancePercentage}%):
          </span>
          <span className="font-extrabold text-slate-800 font-mono-numbers">
            {formatPt(calculatedFlow.deviationMinLMin, 2)} – {formatPt(calculatedFlow.deviationMaxLMin, 2)} L/min
          </span>
        </div>

        {/* Alerta de Pressão Fora da Faixa Recomendada */}
        {calculatedFlow.pressureWarning && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-[11px] text-red-900 font-bold leading-tight animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{calculatedFlow.pressureWarning}</span>
          </div>
        )}
      </div>

      {/* 4. BLOCO DE DERIVA SIMPLIFICADO */}
      <div
        aria-label={`${calculatedFlow.shortDriftLevel}, ${calculatedFlow.driftOriginSummary}`}
        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${driftBadgeStyle.bg}`}
      >
        <div className="flex items-center gap-2.5">
          <DriftIcon className={`w-4 h-4 ${driftBadgeStyle.iconColor} shrink-0`} aria-hidden="true" />
          <span className="text-xs font-black">
            {calculatedFlow.shortDriftLevel}
          </span>
        </div>
        <span className="text-[11px] font-bold opacity-80">
          {calculatedFlow.driftOriginSummary}
        </span>
      </div>

      {/* 5. SECÇÃO EXPANSÍVEL: DETALHES TÉCNICOS E EVIDÊNCIA */}
      <div className="pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          aria-expanded={isDetailsOpen}
          className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between min-h-[44px] cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-daterra-primary" />
            <span>{isDetailsOpen ? 'Ocultar detalhes técnicos' : 'Ver detalhes'}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDetailsOpen && (
          <div className="mt-3 space-y-3.5 text-xs animate-fade-in border-t border-slate-100 pt-3">
            
            {/* Detalhe Técnico de Deriva */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                Sensibilidade potencial à deriva
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                Esta classificação é orientadora e baseia-se na informação técnica disponível para o bico, pressão e tipo de jato. A deriva real também depende das condições meteorológicas, da altura de aplicação, do equipamento, da calda e da técnica de pulverização.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-slate-600 border-t border-slate-200/60">
                <span>Classificação Indicativa: <strong>{calculatedFlow.effectiveDriftSensitivity}</strong></span>
                <span>Origem: <strong>{calculatedFlow.driftOrigin}</strong></span>
              </div>
            </div>

            {/* Espectro de Gotas */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                {calculatedFlow.dropletSpectrumLabel}
              </span>
              <span className="font-extrabold text-slate-900 block">
                {calculatedFlow.effectiveDropletClass || 'Não disponível'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Origem: {calculatedFlow.dropletOrigin}
              </span>
            </div>

            {/* Parâmetros Operacionais */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Faixa Recomendada</span>
                <span className="font-extrabold text-slate-800 font-mono-numbers">
                  {formatPt(nozzle.pressureMinBar, 1)}–{formatPt(nozzle.pressureMaxBar, 1)} bar
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Filtro Recomendado</span>
                <span className="font-extrabold text-slate-800 font-mono-numbers">
                  {nozzle.recommendedFilterMesh ? `${nozzle.recommendedFilterMesh} mesh` : 'Não disponível'}
                </span>
              </div>
            </div>

            {/* Informação Comercial do Fabricante */}
            {manufacturerInfo && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Informação do Fabricante</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
                  <div>País de Origem: <strong className="text-slate-800">{manufacturerInfo.country}</strong></div>
                  <div>Grupo Empresarial: <strong className="text-slate-800">{manufacturerInfo.businessGroup}</strong></div>
                  <div className="col-span-2">Segmento / Nicho: <strong className="text-slate-800">{manufacturerInfo.niche}</strong></div>
                </div>
              </div>
            )}

            {/* Medição Laboratorial Acreditada (quando disponível) */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Activity className="w-3.5 h-3.5 text-slate-600" />
                <span>Ensaio Laboratorial</span>
              </div>
              <p className="text-[11px] text-slate-700">
                {labSummary.statusText}
              </p>
              {labEvidence && (
                <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                  <div>Entidade Responsável: <strong>{labEvidence.realEntityName}</strong></div>
                  <div>Método de Ensaio: <strong>{labEvidence.method}</strong></div>
                </div>
              )}
            </div>

            {/* Medições Granulométricas Reais (Dv10, Dv50, Dv90) */}
            {dropletMeasurements.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <Activity className="w-3.5 h-3.5 text-slate-600" />
                  <span>Espectro Granulométrico Catalogado (µm)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-extrabold">
                        <th className="py-1 pr-2">Pressão</th>
                        <th className="py-1 px-2">Dv10</th>
                        <th className="py-1 px-2">Dv50 (VMD)</th>
                        <th className="py-1 px-2">Dv90</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono-numbers">
                      {dropletMeasurements.map(m => (
                        <tr key={m.pressureBar} className={m.pressureBar === 10 ? 'bg-emerald-50/50 font-bold text-slate-900' : 'text-slate-700'}>
                          <td className="py-1 pr-2 font-bold">{m.pressureBar} bar</td>
                          <td className="py-1 px-2">{m.dv10Micrometres ? `${m.dv10Micrometres} µm` : 'N/D'}</td>
                          <td className="py-1 px-2 font-bold text-emerald-800">{m.dv50Micrometres ? `${m.dv50Micrometres} µm` : 'N/D'}</td>
                          <td className="py-1 px-2">{m.dv90Micrometres ? `${m.dv90Micrometres} µm` : 'N/D'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Nota de Enquadramento */}
            {nozzle.notes && (
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 text-[11px] text-emerald-950 leading-relaxed font-medium">
                <div className="flex items-center gap-1 font-bold text-emerald-900 mb-0.5">
                  <Info className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enquadramento DATERRA</span>
                </div>
                {nozzle.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
