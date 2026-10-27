/**
 * DATERRA Smart - Cartão do Perfil Final de Pulverização Sugerido (Fase C)
 * Ficheiro: src/features/calibracao-pulverizador/components/FinalSprayProfileCard.tsx
 * 
 * Funcionalidades:
 * - Apresenta exclusivamente os 5 parâmetros operacionais:
 *   1. Volume de calda (L/ha)
 *   2. Velocidade de avanço (km/h)
 *   3. Largura de trabalho (m)
 *   4. Pressão de trabalho resultante (bar)
 *   5. Débito Total Requerido (L/min)
 * - Apresenta a lista minimalista de bicos por nível do Topo à Base
 * - Rodapé com nota de simetria e aviso oficial do catálogo do fabricante
 * - Sem termos de inspeção, drone, tolerância ISO ou conformidade
 */

import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { NozzleCatalogEntry } from '../data/nozzleCatalog.ts';
import {
  calculateEstimatedOutput,
  isNozzleEligibleAtPressure
} from '../nozzleSelectionEngine.ts';
import { FinalSprayOperationalParams } from './FinalSprayOperationalParams.tsx';

export interface FinalSprayProfileCardProps {
  volumeCaldaLHa?: number;
  travelSpeedKmH?: number;
  workingWidthM?: number;
  workingPressureBar: number | null;
  requiredTotalOutputLMin: number;
  distributionMode: 'uniform' | 'custom';
  uniformActiveLevels: number;
  uniformSelectedNozzle: NozzleCatalogEntry | null;
  customConfirmedNozzles: (NozzleCatalogEntry | null)[];
  isDesktop?: boolean;
}

export const FinalSprayProfileCard: React.FC<FinalSprayProfileCardProps> = ({
  volumeCaldaLHa,
  travelSpeedKmH,
  workingWidthM,
  workingPressureBar,
  requiredTotalOutputLMin,
  distributionMode,
  uniformActiveLevels,
  uniformSelectedNozzle,
  customConfirmedNozzles
}) => {
  const { t } = useLanguage();

  const isUniform = distributionMode === 'uniform';

  // Verificar se o perfil está completo e com pressão válida
  const isPressureValid =
    typeof workingPressureBar === 'number' &&
    workingPressureBar > 0 &&
    workingPressureBar <= 30.0;

  if (!isPressureValid) {
    return null;
  }

  const pBar = workingPressureBar!;

  // Lista de entradas a validar
  let entriesForLevels: NozzleCatalogEntry[] = [];

  if (isUniform) {
    if (!uniformSelectedNozzle) return null;
    if (!isNozzleEligibleAtPressure(uniformSelectedNozzle, pBar)) return null;
    entriesForLevels = Array(uniformActiveLevels).fill(uniformSelectedNozzle);
  } else {
    if (customConfirmedNozzles.length === 0) return null;
    if (customConfirmedNozzles.some((n) => n === null || !isNozzleEligibleAtPressure(n, pBar))) {
      return null;
    }
    entriesForLevels = customConfirmedNozzles as NozzleCatalogEntry[];
  }

  const formatLMin = (val: number) => {
    return val.toFixed(2).replace('.', ',');
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-[#114037]/30 shadow-md space-y-5 animate-fade-in">
      {/* Cabeçalho do Cartão */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {t('calibracaoPulverizador.phaseC.finalProfileTitle', 'Perfil de distribuição de débito e bicos sugerido')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t(
              'calibracaoPulverizador.phaseC.finalProfileSubtitle',
              'Combinação final de bicos e parâmetros operacionais para a aplicação.'
            )}
          </p>
        </div>
      </div>

      {/* Os 5 Parâmetros Operacionais Essenciais */}
      <FinalSprayOperationalParams
        volumeCaldaLHa={volumeCaldaLHa}
        travelSpeedKmH={travelSpeedKmH}
        workingWidthM={workingWidthM}
        workingPressureBar={pBar}
        requiredTotalOutputLMin={requiredTotalOutputLMin}
        formatLMin={formatLMin}
      />

      {/* Lista Minimalista de Bicos por Nível (Topo para a Base) */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-0.5">
          {t('calibracaoPulverizador.phaseC.nozzlesByLevelTitle', 'Bicos Selecionados por Nível (Topo à Base)')}
        </h4>

        <div className="space-y-2">
          {entriesForLevels.map((entry, idx) => {
            const levelNumber = idx + 1;
            const isTop = idx === 0;
            const isBase = idx === entriesForLevels.length - 1 && entriesForLevels.length >= 2;

            const p1 = entry.referencePressureBar || entry.pressureBar;
            const effectiveFlow =
              calculateEstimatedOutput(entry.nominalOutputLMin, p1, pBar) || entry.nominalOutputLMin;

            return (
              <div
                key={idx}
                className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    Nível {levelNumber}
                  </span>
                  {isTop && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {t('calibracaoPulverizador.phaseC.topLabel', 'Topo')}
                    </span>
                  )}
                  {isBase && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {t('calibracaoPulverizador.phaseC.baseLabel', 'Base')}
                    </span>
                  )}
                  <span className="text-xs font-extrabold text-slate-800 ml-1">
                    {entry.manufacturerName} {entry.model} ({entry.colorOrSize})
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black font-mono-numbers text-[#114037]">
                    {formatLMin(effectiveFlow)} L/min
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé e Nota Técnica Obrigatória */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <p className="text-xs font-bold text-slate-700">
          {t('calibracaoPulverizador.phaseC.symmetryNote', 'Configuração simétrica: o mesmo perfil é aplicado ao lado oposto.')}
        </p>

        <div className="flex items-start gap-2 text-[11.5px] text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {t(
              'calibracaoPulverizador.phaseC.technicalCatalogDisclaimer',
              'Os débitos apresentados são valores tabelados pelo fabricante. Confirme a compatibilidade do bico, a pressão e a qualidade da pulverização antes de aplicar.'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

