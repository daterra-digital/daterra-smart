import React from 'react';
import { AlertTriangle, Droplets } from 'lucide-react';
import type { CropReferenceType, EppoDoseResults } from './types';
import { formatEppoNum } from './calculations';

export interface EppoStickyResultCardProps {
  results: EppoDoseResults;
  tankCapacityL: number;
  sprayVolumeLHa: number;
  cropReference: CropReferenceType;
  unitLarge: string;
  unitSmall: string;
}

export const EppoStickyResultCard: React.FC<EppoStickyResultCardProps> = ({
  results,
  tankCapacityL,
  sprayVolumeLHa,
  cropReference,
  unitLarge,
  unitSmall
}) => {
  // Volume de calda de referência e limiar de escorrimento segundo cultura
  const referenceVolumeLHa = cropReference === 'vinha' ? 1000 : 1500;
  const runoffThresholdLHa = cropReference === 'vinha' ? 800 : 1200;
  const concentrationRatio =
    sprayVolumeLHa > 0 ? referenceVolumeLHa / sprayVolumeLHa : 1;

  const isExcessiveRunoffRisk = sprayVolumeLHa > runoffThresholdLHa;
  const isHighlyConcentrated = !isExcessiveRunoffRisk && concentrationRatio >= 1.5;
  const showVolumeAlert = isExcessiveRunoffRisk || isHighlyConcentrated;

  // Seleção inteligente da unidade principal para leitura imediata em campo
  const useSmallUnitPrimary =
    results.productInTankMethod1Large > 0 && results.productInTankMethod1Large < 0.5;
  const primaryValue = useSmallUnitPrimary
    ? formatEppoNum(results.productInTankMethod1Small, 0)
    : formatEppoNum(results.productInTankMethod1Large, 2);
  const primaryUnit = useSmallUnitPrimary ? unitSmall : unitLarge;
  const secondaryEquivalent = useSmallUnitPrimary
    ? `${formatEppoNum(results.productInTankMethod1Large, 3)} ${unitLarge}`
    : `${formatEppoNum(results.productInTankMethod1Small, 0)} ${unitSmall}`;

  return (
    <div className="sticky top-2 z-30 space-y-2">
      {/* Cartão Verde de Resumo (Alto Destaque) */}
      <div className="bg-[#114037] text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-900/40 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8ffa94] animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a2d0c3]">
              Quantidade de Produto no Depósito ({tankCapacityL} L)
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-[#8ffa94]">
            Ajuste Copa: {formatEppoNum(results.canopyAdjustmentRatio * 100, 0)}%
          </span>
        </div>

        {/* Métrica Principal: Q_PF em Fonte Gigante */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-[#8ffa94] tracking-tight">
              {primaryValue}
            </span>
            <span className="text-xl font-black text-white">{primaryUnit}</span>
          </div>
          <span className="text-xs font-mono text-[#a2d0c3]">
            Equivalente a <strong className="text-white">{secondaryEquivalent}</strong> por depósito (
            {formatEppoNum(results.treatedAreaPerTankHa, 2)} ha/depósito)
          </span>
        </div>

        {/* Métricas Secundárias: Grid Interior Suave */}
        <div className="bg-white/10 rounded-2xl p-4 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#a2d0c3] block">
              Dose Ajustada / ha
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-white">
                {formatEppoNum(results.adjustedDoseHa, 2)}
              </span>
              <span className="text-xs font-bold text-[#8ffa94]">{unitLarge}/ha</span>
            </div>
          </div>

          <div className="border-l border-white/15 pl-4">
            <span className="text-[11px] font-bold text-[#a2d0c3] block">
              Volume de Calda Aplicado
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <Droplets className="w-3.5 h-3.5 text-[#8ffa94] self-center mr-0.5 shrink-0" />
              <span className="text-lg sm:text-xl font-mono font-black text-white">
                {formatEppoNum(sprayVolumeLHa, 0)}
              </span>
              <span className="text-xs font-bold text-[#a2d0c3]">L/ha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Callout Box de Atenção Técnica (Escorrimento ou Concentração) */}
      {showVolumeAlert && (
        <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl p-3.5 shadow-xs flex items-start gap-2.5 text-xs leading-relaxed animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            {isExcessiveRunoffRisk ? (
              <span>
                <strong className="font-extrabold">⚠️ Risco de Escorrimento:</strong> Volumes muito
                elevados podem causar perda de produto para o solo. Ajuste a eficiência do
                pulverizador.
              </span>
            ) : (
              <span>
                <strong className="font-extrabold">Atenção à Concentração:</strong> Com{' '}
                {sprayVolumeLHa} L/ha, a calda fica{' '}
                <strong>{formatEppoNum(concentrationRatio, 1)}x mais concentrada</strong> do que a
                referência ({referenceVolumeLHa} L/ha). Mantenha agitação contínua no depósito.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
