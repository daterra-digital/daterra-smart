import React from 'react';
import type { IsoNozzleColor, IsoFlowCalculationResult } from '../debitoTypes';
import { DebitoResultCard } from '../DebitoResultCard';
import { DebitoIsoSelector } from '../DebitoIsoSelector';
import { DebitoInputs } from '../DebitoInputs';
import { UnitarioCurvaHidraulica } from './UnitarioCurvaHidraulica';

export interface ModoUnitarioViewProps {
  flowResult: IsoFlowCalculationResult;
  selectedNozzle: IsoNozzleColor;
  pressureBar: number;
  selectedCode: string;
  onSelectCode: (code: string) => void;
  onOpenKeypad: () => void;
  onSelectPresetPressure: (pressure: number) => void;
}

export const ModoUnitarioView: React.FC<ModoUnitarioViewProps> = ({
  flowResult,
  selectedNozzle,
  pressureBar,
  selectedCode,
  onSelectCode,
  onOpenKeypad,
  onSelectPresetPressure
}) => {
  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Camada 1: Cartão Verde Oficial (#114D37) com Números Grandes e Tolerância ISO 16122 */}
      <DebitoResultCard
        flowResult={flowResult}
        selectedNozzle={selectedNozzle}
        pressureBar={pressureBar}
      />

      {/* Camada 1 & 2: Seletor Tátil de Bicos ISO 10625 */}
      <DebitoIsoSelector
        selectedCode={selectedCode}
        onSelectCode={onSelectCode}
      />

      {/* Camada 1: Painel "Valores Introduzidos" com Ajuste de Pressão */}
      <DebitoInputs
        pressureBar={pressureBar}
        onOpenKeypad={onOpenKeypad}
        onSelectPresetPressure={onSelectPresetPressure}
      />

      {/* Gráfico de Curva Hidráulica Dinâmica ISO com Tolerância ±10% */}
      <UnitarioCurvaHidraulica
        selectedNozzle={selectedNozzle}
        pressureBar={pressureBar}
      />
    </div>
  );
};
