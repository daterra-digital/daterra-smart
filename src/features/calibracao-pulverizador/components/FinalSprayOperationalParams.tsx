import React from 'react';
import { useLanguage } from '../../../context/LanguageContext.tsx';

export interface FinalSprayOperationalParamsProps {
  volumeCaldaLHa?: number;
  travelSpeedKmH?: number;
  workingWidthM?: number;
  workingPressureBar: number;
  requiredTotalOutputLMin: number;
  formatLMin: (val: number) => string;
}

export const FinalSprayOperationalParams: React.FC<FinalSprayOperationalParamsProps> = ({
  volumeCaldaLHa,
  travelSpeedKmH,
  workingWidthM,
  workingPressureBar,
  requiredTotalOutputLMin,
  formatLMin
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80">
      <div>
        <span className="text-slate-500 block font-medium">
          {t('calibracaoPulverizador.phaseC.sprayVolumeSummary', 'Volume de calda:')}
        </span>
        <span className="font-extrabold font-mono-numbers text-slate-900 text-xs sm:text-sm">
          {volumeCaldaLHa !== undefined ? `${Math.round(volumeCaldaLHa)} L/ha` : '—'}
        </span>
      </div>

      <div>
        <span className="text-slate-500 block font-medium">
          {t('calibracaoPulverizador.phaseC.speedSummary', 'Velocidade:')}
        </span>
        <span className="font-extrabold font-mono-numbers text-slate-900 text-xs sm:text-sm">
          {travelSpeedKmH !== undefined ? `${travelSpeedKmH.toFixed(1).replace('.', ',')} km/h` : '—'}
        </span>
      </div>

      <div>
        <span className="text-slate-500 block font-medium">
          {t('calibracaoPulverizador.phaseC.widthSummary', 'Largura:')}
        </span>
        <span className="font-extrabold font-mono-numbers text-slate-900 text-xs sm:text-sm">
          {workingWidthM !== undefined ? `${workingWidthM.toFixed(2).replace('.', ',')} m` : '—'}
        </span>
      </div>

      <div>
        <span className="text-slate-500 block font-medium">
          {t('calibracaoPulverizador.phaseC.calculatedPressureTitle', 'Pressão de trabalho:')}
        </span>
        <span className="font-extrabold font-mono-numbers text-[#114037] text-xs sm:text-sm">
          {workingPressureBar.toFixed(1).replace('.', ',')} bar
        </span>
      </div>

      <div className="col-span-2 sm:col-span-1">
        <span className="text-slate-500 block font-medium">
          {t('calibracaoPulverizador.phaseC.requiredFlowSummary', 'Débito total:')}
        </span>
        <span className="font-extrabold font-mono-numbers text-[#114037] text-xs sm:text-sm">
          {formatLMin(requiredTotalOutputLMin)} L/min
        </span>
      </div>
    </div>
  );
};
