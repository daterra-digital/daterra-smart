import type { StructuredValue } from '../../types/calculator.ts';

export type TipoCalda = 'geral' | 'sensivel' | 'cupricos' | 'sulfonilureias';
export type PhStatus = 'ideal' | 'alcalino' | 'acido' | 'critico_alcalino' | 'critico_acido';

export interface PhCalculationResult {
  ph: number;
  status: PhStatus;
  statusLabel: string;
  actionRecommendation: string;
  alertLevel: 'success' | 'warning' | 'danger';
  intervaloMin: number;
  intervaloMax: number;
  riscoHidrolise: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico';
  riscoFitotoxicidade: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico';
  isValid: boolean;
}

export const TIPO_CALDA_CONFIG: Record<TipoCalda, { label: string; desc: string; min: number; max: number }> = {
  geral: { label: 'Geral / Multiuso', desc: 'Maioria dos fitofármacos e misturas padrão', min: 5.5, max: 6.5 },
  sensivel: { label: 'Moléculas Sensíveis', desc: 'Organofosforados, piretroides e captana', min: 5.0, max: 6.0 },
  cupricos: { label: 'Cúpricos (Cobre)', desc: 'Calda bordalesa, hidróxido e oxicloreto', min: 6.5, max: 8.0 },
  sulfonilureias: { label: 'Sulfonilureias', desc: 'Herbicidas específicos sensíveis a acidez', min: 7.0, max: 8.5 }
};

export function evaluatePh(ph: number, tipoCalda: TipoCalda = 'geral'): PhCalculationResult {
  if (typeof ph !== 'number' || !isFinite(ph) || ph < 0 || ph > 14) {
    return {
      ph: 0,
      status: 'ideal',
      statusLabel: 'pH Inválido',
      actionRecommendation: 'Insira um valor de pH entre 0,0 e 14,0.',
      alertLevel: 'danger',
      intervaloMin: 5.5,
      intervaloMax: 6.5,
      riscoHidrolise: 'Baixo',
      riscoFitotoxicidade: 'Baixo',
      isValid: false
    };
  }

  const { min, max } = TIPO_CALDA_CONFIG[tipoCalda] || TIPO_CALDA_CONFIG.geral;

  if (ph >= min && ph <= max) {
    return {
      ph,
      status: 'ideal',
      statusLabel: 'pH Ideal para Aplicação',
      actionRecommendation: 'Água no intervalo ótimo. Proceder à preparação da calda no depósito.',
      alertLevel: 'success',
      intervaloMin: min,
      intervaloMax: max,
      riscoHidrolise: 'Baixo',
      riscoFitotoxicidade: 'Baixo',
      isValid: true
    };
  }

  if (ph > max) {
    const isCritico = ph >= max + 1.2;
    return {
      ph,
      status: isCritico ? 'critico_alcalino' : 'alcalino',
      statusLabel: isCritico ? 'Alcalinidade Crítica • Risco de Hidrólise' : 'Água Alcalina • Risco de Hidrólise',
      actionRecommendation: isCritico
        ? 'Necessário acidificar a calda com urgência antes de introduzir fitofármacos sensíveis.'
        : 'Recomenda-se adicionar regulador/acidificante de pH à água antes do produto comercial.',
      alertLevel: isCritico ? 'danger' : 'warning',
      intervaloMin: min,
      intervaloMax: max,
      riscoHidrolise: isCritico ? 'Crítico' : 'Alto',
      riscoFitotoxicidade: 'Baixo',
      isValid: true
    };
  }

  const isCuprico = tipoCalda === 'cupricos';
  const isCriticoAcido = isCuprico || ph <= min - 1.2;

  return {
    ph,
    status: isCriticoAcido ? 'critico_acido' : 'acido',
    statusLabel: isCuprico
      ? 'Acidez Excessiva • Risco Crítico para Cobre'
      : isCriticoAcido
      ? 'Acidez Crítica • Risco de Fitotoxicidade'
      : 'Água Ácida • Risco de Fitotoxicidade',
    actionRecommendation: isCuprico
      ? 'ATENÇÃO: Não acidificar caldas de cobre. Risco de libertação de cobre solúvel e queima foliar.'
      : 'Tamponar ou verificar compatibilidade para evitar queima foliar em tecidos jovens.',
    alertLevel: isCriticoAcido ? 'danger' : 'warning',
    intervaloMin: min,
    intervaloMax: max,
    riscoHidrolise: 'Baixo',
    riscoFitotoxicidade: isCriticoAcido ? 'Crítico' : 'Moderado',
    isValid: true
  };
}

export function buildPhStructuredValues(
  ph: number,
  tipoCalda: TipoCalda,
  result: PhCalculationResult
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  return {
    inputs: {
      phAgua: {
        canonicalKey: 'measured_ph',
        dimension: 'concentration',
        rawValue: ph,
        unit: 'pH',
        normalizedValue: ph,
        normalizedUnit: 'pH',
        source: 'user_input',
        label: 'pH Medido da Água',
        localId: 'phAgua',
        calculatorId: 'calc_ph',
        calculatorVersion: '1.0.0'
      },
      tipoCalda: {
        canonicalKey: 'calda_type',
        dimension: 'text',
        rawValue: tipoCalda,
        unit: '',
        normalizedValue: 0,
        normalizedUnit: '',
        source: 'user_input',
        label: 'Tipo de Calda / Grupo Químico',
        localId: 'tipoCalda',
        calculatorId: 'calc_ph',
        calculatorVersion: '1.0.0'
      }
    },
    outputs: {
      phStatus: {
        canonicalKey: 'ph_status',
        dimension: 'text',
        rawValue: result.statusLabel,
        unit: '',
        normalizedValue: 0,
        normalizedUnit: '',
        source: 'calculated_output',
        label: 'Estado do pH da Água',
        localId: 'phStatus',
        calculatorId: 'calc_ph',
        calculatorVersion: '1.0.0'
      },
      acaoRecomendada: {
        canonicalKey: 'action_recommendation',
        dimension: 'text',
        rawValue: result.actionRecommendation,
        unit: '',
        normalizedValue: 0,
        normalizedUnit: '',
        source: 'calculated_output',
        label: 'Instrução Agronómica de Ação',
        localId: 'acaoRecomendada',
        calculatorId: 'calc_ph',
        calculatorVersion: '1.0.0'
      }
    }
  };
}

export function getPhKeypadConfig(ph: number) {
  return {
    label: 'pH da Água de Pulverização',
    initial: ph,
    unit: 'pH',
    min: 0.0,
    max: 14.0,
    common: [5.5, 6.0, 6.5, 7.5]
  };
}
