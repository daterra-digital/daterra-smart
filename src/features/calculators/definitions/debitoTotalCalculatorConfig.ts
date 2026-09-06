/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Configuração Declarativa Oficial: Calculadora de Débito Total do Pulverizador
 * Fase 12 - Ferramenta calc_debito_total
 * 
 * Modelo Aprovado (Opção C):
 * Qt = (Q × W × v) / 600
 * Onde:
 *  - Qt = Débito total do pulverizador (L/min)
 *  - Q = Volume de calda aplicado (L/ha)
 *  - W = Largura de trabalho efetiva (m)
 *  - v = Velocidade real de trabalho (km/h)
 *  - 600 = Constante de conversão dimensional métrica
 */

import type { CalculatorDefinition, ValidationResult } from '../core/types.ts';
import type { StructuredValue } from '../../../types/calculator.ts';

/**
 * Função pura e desacoplada de cálculo do débito total do pulverizador.
 * Responsabilidade: Matemática segura.
 * Valida apenas que os valores numéricos são positivos e finitos, e que a base de largura é válida.
 * Os limites operacionais (ex: Q entre 50 e 2000) pertencem exclusivamente ao método validate().
 */
export function calculateTotalFlowRatePure(
  volumeCalda: number,
  larguraTrabalho: number,
  velocidadeTrabalho: number,
  baseLargura?: string,
  numeroBicos?: number
): {
  debito_total_l_min: number;
  debito_por_bico_l_min?: number;
  isValid: boolean;
} {
  const allowedBases = [
    'boom_total_width',
    'row_spacing',
    'effective_treated_band',
    'manual_width'
  ];

  if (
    !baseLargura ||
    !allowedBases.includes(baseLargura) ||
    typeof volumeCalda !== 'number' ||
    typeof larguraTrabalho !== 'number' ||
    typeof velocidadeTrabalho !== 'number' ||
    isNaN(volumeCalda) ||
    isNaN(larguraTrabalho) ||
    isNaN(velocidadeTrabalho) ||
    !isFinite(volumeCalda) ||
    !isFinite(larguraTrabalho) ||
    !isFinite(velocidadeTrabalho) ||
    volumeCalda <= 0 ||
    larguraTrabalho <= 0 ||
    velocidadeTrabalho <= 0
  ) {
    return {
      debito_total_l_min: 0,
      isValid: false
    };
  }

  // Qt = (Q * W * v) / 600
  const rawQt = (volumeCalda * larguraTrabalho * velocidadeTrabalho) / 600;

  if (!isFinite(rawQt) || isNaN(rawQt) || rawQt <= 0) {
    return {
      debito_total_l_min: 0,
      isValid: false
    };
  }

  const debitoTotal = Math.round(rawQt * 10) / 10;

  let debitoPorBico: number | undefined = undefined;
  if (
    typeof numeroBicos === 'number' &&
    !isNaN(numeroBicos) &&
    isFinite(numeroBicos) &&
    numeroBicos > 0
  ) {
    const rawQBico = rawQt / numeroBicos;
    if (isFinite(rawQBico) && !isNaN(rawQBico) && rawQBico > 0) {
      debitoPorBico = Math.round(rawQBico * 100) / 100;
    }
  }

  return {
    debito_total_l_min: debitoTotal,
    ...(debitoPorBico !== undefined ? { debito_por_bico_l_min: debitoPorBico } : {}),
    isValid: true
  };
}

/**
 * Configuração declarativa oficial da Calculadora de Débito Total do Pulverizador.
 */
export const debitoTotalCalculatorConfig: CalculatorDefinition = {
  id: 'calc_debito_total',
  version: '1.0.0',
  title: 'Débito Total do Pulverizador',
  subtitle: 'Calcula o débito global do pulverizador a partir do volume de calda, velocidade de trabalho e largura efetiva tratada.',
  category: 'Calibração',
  badgeLabel: 'Calibração de Pulverizadores',
  generalHelpFile: 'DebitoTotalFAQGeral.md',
  invalidResultNotice: 'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.',

  fields: [
    // Campo 1 — Volume de calda (L/ha)
    {
      id: 'volumeCalda',
      label: 'Volume de calda (L/ha)',
      canonicalKey: 'spray_volume_rate',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      defaultValue: undefined,
      allowedUnits: ['L/ha'],
      presets: [200, 400, 600, 800],
      required: true,
      min: 50,
      minInclusive: true,
      max: 2000,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      description: 'Volume de calda a distribuir por hectare de terreno.',
      helpFile: 'DebitoTotalFAQVolume.md'
    },

    // Campo 2 — Velocidade real de trabalho (km/h)
    {
      id: 'velocidadeTrabalho',
      label: 'Velocidade real de trabalho (km/h)',
      canonicalKey: 'work_speed',
      dimension: 'speed',
      defaultUnit: 'km/h',
      defaultValue: undefined,
      allowedUnits: ['km/h'],
      presets: [4, 6, 8, 10],
      required: true,
      min: 2,
      minInclusive: true,
      max: 20,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      description: 'Velocidade real de avanço medida no terreno com o equipamento carregado.',
      helpFile: 'DebitoTotalFAQVelocidade.md'
    },

    // Campo 3 — Largura de trabalho efetiva (m)
    {
      id: 'larguraTrabalho',
      label: 'Largura de trabalho efetiva (m)',
      canonicalKey: 'working_width',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: undefined,
      allowedUnits: ['m'],
      presets: [],
      getDynamicPresets: (values) => {
        const base = values['baseLargura'];
        if (base === 'boom_total_width') return [12, 24, 36, 48];
        if (base === 'row_spacing') return [2, 3, 4, 5];
        return [];
      },
      required: true,
      min: 1,
      minInclusive: true,
      max: 60,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      description: 'Largura efetivamente tratada em cada passagem. Selecione a forma como esta largura foi determinada para evitar utilizar uma medida inadequada.',
      helpFile: 'DebitoTotalFAQLargura.md'
    },

    // Campo 4 — Base de interpretação da largura (Select)
    {
      id: 'baseLargura',
      label: 'Como é definida a largura de trabalho?',
      canonicalKey: 'working_width_interpretation',
      dimension: 'text',
      defaultUnit: '',
      defaultValue: undefined,
      allowedUnits: [''],
      type: 'select',
      required: true,
      options: [
        {
          value: 'boom_total_width',
          label: 'Largura total da barra',
          description: 'Distância total entre os bicos extremos da barra. Adequado para aplicação em área total com barra horizontal.'
        },
        {
          value: 'row_spacing',
          label: 'Distância entrelinhas',
          description: 'Distância entre o centro de uma linha e o centro da linha adjacente. Utilize esta opção apenas quando a entrelinha representar a largura efetivamente tratada em cada passagem.',
          contextualWarning: 'Em tratamentos de linhas alternadas, algumas linhas podem não receber aplicação direta em cada passagem. Confirme se a estratégia, a cobertura e o intervalo entre aplicações são adequados à cultura, ao produto e ao risco fitossanitário.'
        },
        {
          value: 'effective_treated_band',
          label: 'Faixa efetiva tratada',
          description: 'Largura realmente abrangida pela aplicação em cada passagem. Pode exigir medição ou validação no campo.'
        },
        {
          value: 'manual_width',
          label: 'Largura manual específica',
          description: 'Valor definido pelo utilizador para uma situação operacional específica. Utilize apenas quando souber qual é a largura efetivamente tratada.'
        }
      ],
      description: 'Critério agronómico de definição da largura de trabalho.'
    },

    // Campo 5 — Número de bicos ativos em simultâneo (Opcional, acedido via divulgação progressiva)
    {
      id: 'numeroBicos',
      label: 'Número de bicos ativos em simultâneo (opcional)',
      canonicalKey: 'active_nozzles_count',
      dimension: 'count',
      defaultUnit: '',
      defaultValue: undefined,
      allowedUnits: [''],
      presets: [8, 12, 16, 20, 24, 32],
      required: false,
      min: 1,
      minInclusive: true,
      max: 200,
      maxInclusive: true,
      allowDecimal: false,
      allowNegative: false,
      allowExpressions: true,
      description: 'Indique apenas os bicos que contribuem para o débito total calculado nesta passagem.',
      helpFile: 'DebitoTotalFAQResultado.md'
    }
  ],

  results: [
    {
      id: 'debitoTotal',
      label: 'DÉBITO TOTAL DO PULVERIZADOR:',
      canonicalKey: 'total_flow_rate',
      dimension: 'flow_rate',
      defaultUnit: 'L/min',
      formatDecimals: 1,
      isPrimary: true,
      helpFile: 'DebitoTotalFAQResultado.md'
    }
  ],

  validate: (inputs: Record<string, StructuredValue>): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    const rawQ = inputs['volumeCalda']?.rawValue;
    const rawV = inputs['velocidadeTrabalho']?.rawValue;
    const rawW = inputs['larguraTrabalho']?.rawValue;
    const rawBase = inputs['baseLargura']?.rawValue;
    const rawN = inputs['numeroBicos']?.rawValue;

    const Q = typeof rawQ === 'string' ? parseFloat(rawQ.replace(',', '.')) : Number(rawQ);
    const v = typeof rawV === 'string' ? parseFloat(rawV.replace(',', '.')) : Number(rawV);
    const W = typeof rawW === 'string' ? parseFloat(rawW.replace(',', '.')) : Number(rawW);
    const base = rawBase !== undefined && rawBase !== null ? String(rawBase).trim() : '';

    let N: number | undefined = undefined;
    if (rawN !== undefined && rawN !== null && rawN !== '') {
      const parsedN = typeof rawN === 'string' ? parseFloat(rawN.replace(',', '.')) : Number(rawN);
      if (isNaN(parsedN)) {
        errors['numeroBicos'] = 'Introduza um número inteiro válido.';
      } else if (!Number.isInteger(parsedN)) {
        errors['numeroBicos'] = 'O número de bicos deve ser um número inteiro.';
      } else if (parsedN < 1) {
        errors['numeroBicos'] = 'O número de bicos deve ser no mínimo 1.';
      } else if (parsedN > 200) {
        errors['numeroBicos'] = 'O número de bicos não pode exceder 200.';
      } else {
        N = parsedN;
      }
    }

    // Validação Campo 1: Volume de Calda
    if (rawQ === undefined || rawQ === '' || rawQ === null) {
      errors['volumeCalda'] = 'Introduza o volume de calda.';
    } else if (isNaN(Q)) {
      errors['volumeCalda'] = 'Introduza um valor numérico válido.';
    } else if (Q <= 0) {
      errors['volumeCalda'] = 'O volume deve ser superior a zero.';
    } else if (Q < 50) {
      errors['volumeCalda'] = 'O volume mínimo é 50 L/ha.';
    } else if (Q > 2000) {
      errors['volumeCalda'] = 'O volume máximo é 2 000 L/ha.';
    } else {
      if (Q >= 50 && Q < 100) {
        warnings['volumeCalda'] = 'Volume muito baixo. Verifique se o valor está correto.';
      } else if (Q > 1500 && Q <= 2000) {
        warnings['volumeCalda'] = 'Volume muito elevado. Verifique se o valor está correto.';
      }
    }

    // Validação Campo 2: Velocidade Real
    if (rawV === undefined || rawV === '' || rawV === null) {
      errors['velocidadeTrabalho'] = 'Introduza a velocidade real de trabalho.';
    } else if (isNaN(v)) {
      errors['velocidadeTrabalho'] = 'Introduza um valor numérico válido.';
    } else if (v <= 0) {
      errors['velocidadeTrabalho'] = 'A velocidade deve ser superior a zero.';
    } else if (v < 2) {
      errors['velocidadeTrabalho'] = 'A velocidade mínima é 2,0 km/h.';
    } else if (v > 20) {
      errors['velocidadeTrabalho'] = 'A velocidade máxima é 20,0 km/h.';
    } else {
      if (v >= 2 && v < 4) {
        warnings['velocidadeTrabalho'] = 'Velocidade muito baixa. Verifique se o valor está correto.';
      } else if (v > 15 && v <= 20) {
        warnings['velocidadeTrabalho'] = 'Velocidade muito elevada. Verifique se o valor está correto.';
      }
    }

    // Validação Campo 3: Largura de Trabalho
    if (rawW === undefined || rawW === '' || rawW === null) {
      errors['larguraTrabalho'] = 'Introduza a largura de trabalho efetiva.';
    } else if (isNaN(W)) {
      errors['larguraTrabalho'] = 'Introduza um valor numérico válido.';
    } else if (W <= 0) {
      errors['larguraTrabalho'] = 'A largura deve ser superior a zero.';
    } else if (W < 1) {
      errors['larguraTrabalho'] = 'A largura mínima é 1,0 m.';
    } else if (W > 60) {
      errors['larguraTrabalho'] = 'A largura máxima é 60,0 m.';
    }

    // Validação Campo 4: Base de Interpretação da Largura
    const allowedBases = ['boom_total_width', 'row_spacing', 'effective_treated_band', 'manual_width'];
    if (!base) {
      errors['baseLargura'] = 'Selecione como é definida a largura de trabalho.';
    } else if (!allowedBases.includes(base)) {
      errors['baseLargura'] = 'Selecione uma opção de definição de largura válida.';
    }

    // Avisos Plausibilidade do Resultado (quando todas as entradas forem válidas)
    const essentialErrors = Object.keys(errors).filter((k) => k !== 'numeroBicos');
    if (essentialErrors.length === 0) {
      const res = calculateTotalFlowRatePure(Q, W, v, base, N);
      if (res.isValid) {
        if (res.debito_total_l_min < 10) {
          warnings['debitoTotal'] = 'Débito baixo. Verifique os valores introduzidos e confirme a adequação ao equipamento.';
        } else if (res.debito_total_l_min > 500) {
          warnings['debitoTotal'] = 'Débito elevado. Verifique os valores introduzidos e confirme a adequação ao equipamento.';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  },

  calculate: (inputs: Record<string, StructuredValue>): Record<string, StructuredValue> => {
    const rawQ = inputs['volumeCalda']?.rawValue;
    const rawV = inputs['velocidadeTrabalho']?.rawValue;
    const rawW = inputs['larguraTrabalho']?.rawValue;
    const rawBase = inputs['baseLargura']?.rawValue;
    const rawN = inputs['numeroBicos']?.rawValue;

    const Q = typeof rawQ === 'string' ? parseFloat(rawQ.replace(',', '.')) : Number(rawQ);
    const v = typeof rawV === 'string' ? parseFloat(rawV.replace(',', '.')) : Number(rawV);
    const W = typeof rawW === 'string' ? parseFloat(rawW.replace(',', '.')) : Number(rawW);
    const base = rawBase !== undefined && rawBase !== null ? String(rawBase).trim() : '';

    let N: number | undefined = undefined;
    if (rawN !== undefined && rawN !== null && rawN !== '') {
      const parsedN = typeof rawN === 'string' ? parseFloat(rawN.replace(',', '.')) : Number(rawN);
      if (!isNaN(parsedN) && Number.isInteger(parsedN) && parsedN >= 1 && parsedN <= 200) {
        N = parsedN;
      }
    }

    const res = calculateTotalFlowRatePure(Q, W, v, base, N);
    if (!res.isValid) {
      return {};
    }

    return {
      debitoTotal: {
        rawValue: res.debito_total_l_min,
        unit: 'L/min',
        normalizedValue: res.debito_total_l_min,
        dimension: 'flow_rate',
        canonicalKey: 'total_flow_rate',
        label: 'DÉBITO TOTAL DO PULVERIZADOR:',
        source: 'calculated_output',
        localId: 'debitoTotal',
        calculatorId: 'calc_debito_total',
        calculatorVersion: '1.0.0',
        ...(res.debito_por_bico_l_min !== undefined ? {
          subValue: res.debito_por_bico_l_min,
          subUnit: 'L/min por bico'
        } : {})
      }
    };
  }
};