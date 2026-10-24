import type { StructuredValue } from '../../../types/calculator.ts';

export interface IsoNozzleColor {
  code: string;
  namePt: string;
  hex: string;
  nominalFlow3Bar: number; // L/min a 3.0 bar
  textColor: string;
  borderClass: string;
}

export const ISO_NOZZLE_COLORS: IsoNozzleColor[] = [
  { code: '01', namePt: 'Laranja', hex: '#F97316', nominalFlow3Bar: 0.40, textColor: 'text-white', borderClass: 'border-orange-600' },
  { code: '015', namePt: 'Verde', hex: '#16A34A', nominalFlow3Bar: 0.60, textColor: 'text-white', borderClass: 'border-emerald-600' },
  { code: '02', namePt: 'Amarelo', hex: '#EAB308', nominalFlow3Bar: 0.80, textColor: 'text-slate-900', borderClass: 'border-yellow-500' },
  { code: '025', namePt: 'Lilás', hex: '#A855F7', nominalFlow3Bar: 1.00, textColor: 'text-white', borderClass: 'border-purple-600' },
  { code: '03', namePt: 'Azul', hex: '#2563EB', nominalFlow3Bar: 1.20, textColor: 'text-white', borderClass: 'border-blue-600' },
  { code: '04', namePt: 'Vermelho', hex: '#DC2626', nominalFlow3Bar: 1.60, textColor: 'text-white', borderClass: 'border-red-600' },
  { code: '05', namePt: 'Castanho', hex: '#78350F', nominalFlow3Bar: 2.00, textColor: 'text-white', borderClass: 'border-amber-900' },
  { code: '06', namePt: 'Cinzento', hex: '#64748B', nominalFlow3Bar: 2.40, textColor: 'text-white', borderClass: 'border-slate-600' },
  { code: '08', namePt: 'Branco', hex: '#F8FAFC', nominalFlow3Bar: 3.20, textColor: 'text-slate-900', borderClass: 'border-slate-300' }
];

export interface IsoFlowCalculationResult {
  flowLMin: number;
  flowMinLMin: number; // -10% Tolerância ISO 16122
  flowMaxLMin: number; // +10% Tolerância ISO 16122
  nominalFlow3Bar: number;
  pressureBar: number;
  isValid: boolean;
}

/**
 * Fórmula Hidráulica Universal:
 * q(P) = q_0 * sqrt(P / 3.0)
 * Tolerância de Desgaste ISO 16122 / DGAV: +-10% do débito nominal
 */
export function calculateIsoFlow(nominalFlow3Bar: number, pressureBar: number): IsoFlowCalculationResult {
  if (
    typeof nominalFlow3Bar !== 'number' ||
    typeof pressureBar !== 'number' ||
    isNaN(nominalFlow3Bar) ||
    isNaN(pressureBar) ||
    !isFinite(nominalFlow3Bar) ||
    !isFinite(pressureBar) ||
    nominalFlow3Bar <= 0 ||
    pressureBar <= 0
  ) {
    return {
      flowLMin: 0,
      flowMinLMin: 0,
      flowMaxLMin: 0,
      nominalFlow3Bar: 0,
      pressureBar: 0,
      isValid: false
    };
  }

  const q = nominalFlow3Bar * Math.sqrt(pressureBar / 3.0);
  const qMin = q * 0.90;
  const qMax = q * 1.10;

  return {
    flowLMin: Number(q.toFixed(2)),
    flowMinLMin: Number(qMin.toFixed(2)),
    flowMaxLMin: Number(qMax.toFixed(2)),
    nominalFlow3Bar,
    pressureBar,
    isValid: true
  };
}

export function buildDebitoStructuredValues(
  isoNozzle: IsoNozzleColor,
  pressureBar: number,
  flowResult: IsoFlowCalculationResult
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  return {
    inputs: {
      codigoIso: {
        rawValue: isoNozzle.code,
        unit: 'código',
        dimension: 'text',
        canonicalKey: 'nozzle_iso_code',
        label: 'Código de Cor ISO',
        source: 'user_input',
        localId: 'codigoIso',
        calculatorId: 'calc_tabelas_debito',
        calculatorVersion: '1.0.0'
      },
      pressaoTrabalho: {
        rawValue: pressureBar,
        unit: 'bar',
        dimension: 'pressure',
        canonicalKey: 'working_pressure',
        label: 'Pressão de Trabalho',
        source: 'user_input',
        localId: 'pressaoTrabalho',
        calculatorId: 'calc_tabelas_debito',
        calculatorVersion: '1.0.0'
      }
    },
    outputs: {
      debitoNominal: {
        rawValue: flowResult.flowLMin,
        unit: 'L/min',
        subValue: flowResult.nominalFlow3Bar,
        subUnit: 'L/min (3 bar)',
        dimension: 'flow_rate',
        canonicalKey: 'nozzle_flow_rate',
        label: 'Débito Apurado por Bico',
        source: 'calculated_output',
        localId: 'debitoNominal',
        calculatorId: 'calc_tabelas_debito',
        calculatorVersion: '1.0.0'
      }
    }
  };
}
