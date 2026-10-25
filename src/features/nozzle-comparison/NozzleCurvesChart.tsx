import React from 'react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types.ts';
import { ComparadorCurvasGrafico } from '../calculators/tabelas-debito/components/ComparadorCurvasGrafico.tsx';

export interface NozzleCurvesChartProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
  width?: number;
  height?: number;
  className?: string;
}

export const NozzleCurvesChart: React.FC<NozzleCurvesChartProps> = (props) => {
  return <ComparadorCurvasGrafico {...props} />;
};
