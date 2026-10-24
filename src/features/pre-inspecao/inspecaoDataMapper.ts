import type { StructuredValue } from '../../types/calculator.ts';

export type ItemStatus = 'conforme' | 'anomalia' | 'pendente';

export interface CriticalPoint {
  id: string;
  number: number;
  title: string;
  shortDesc: string;
  requirement: string;
  isoRef: string;
  guideText: string;
}

export const CRITICAL_POINTS_ISO16122: CriticalPoint[] = [
  {
    id: 'manometro',
    number: 1,
    title: 'Manómetro de Pressão',
    shortDesc: 'Diâmetro >= 63mm, escala legível e sem oscilação',
    requirement: 'Diâmetro mínimo de 63 mm, ponteiro estável (amortecimento líquido), sem condensação interna e estanque a fugas.',
    isoRef: 'ISO 16122-2 / 16122-3',
    guideText: 'O manómetro é o instrumento vital de regulação de débito. A ausência de legibilidade ou ponteiro a vibrar descalibra a aplicação de calda.'
  },
  {
    id: 'filtros',
    number: 2,
    title: 'Filtros do Circuito',
    shortDesc: 'Filtro de aspiração com válvula de corte e malha intacta',
    requirement: 'Filtro de aspiração e pressão íntegros, sem fendas na malha, e válvula de corte funcional que permita limpeza com depósito cheio.',
    isoRef: 'ISO 16122-2 cl. 5.3',
    guideText: 'Filtros obstruídos provocam cavitação da bomba e perda de pressão nos bicos, além de risco de entupimento repetitivo.'
  },
  {
    id: 'tubagens',
    number: 3,
    title: 'Tubagens e Mangueiras',
    shortDesc: 'Isenção total de fugas, vincos e dobras sob pressão',
    requirement: 'Sem escorrências sob pressão máxima de trabalho, sem mangueiras ressequidas, vincos acentuados ou roçamentos no chassis.',
    isoRef: 'ISO 16122-1 cl. 4.2',
    guideText: 'Fugas no circuito hidráulico representam desperdício de fitofármaco, contaminação ambiental e perda de pressão operacional.'
  },
  {
    id: 'bicos',
    number: 4,
    title: 'Bicos e Antigotejo',
    shortDesc: 'Mesmo modelo/calibre e antigotejo estanque (< 1 gota / 5s)',
    requirement: 'Todos os bicos da mesma marca, modelo e calibre na barra/arco. Dispositivos antigotejo estanques (máximo 1 gota em 5s após corte).',
    isoRef: 'ISO 16122-2 / ISO 10625',
    guideText: 'Bicos desgastados ou misturados provocam sobredosagem severa ou subdosagem com fitotoxicidade e falhas de eficácia.'
  },
  {
    id: 'cardan_pto',
    number: 5,
    title: 'Veio Cardan / Proteção PTO',
    shortDesc: 'Proteção integral do veio e correntes fixas antirotação',
    requirement: 'Cones plásticos envolventes intactos, tubo de proteção sem quebras e correntes de fixação presas a pontos fixos do trator e máquina.',
    isoRef: 'ISO 16122-1 cl. 4.1',
    guideText: 'A proteção da transmissão de força é requisito crítico de segurança humana obrigatório por lei. Cardan exposto reprova a máquina de imediato.'
  }
];

export interface InspecaoEvaluationResult {
  totalItems: number;
  conformeCount: number;
  anomaliaCount: number;
  pendenteCount: number;
  conformityPct: number;
  status: 'aprovado' | 'reprovado' | 'atencao';
  statusLabel: string;
  alertLevel: 'success' | 'warning' | 'danger';
  recommendation: string;
  isValid: boolean;
}

export function evaluateInspecao(answers: Record<string, ItemStatus>): InspecaoEvaluationResult {
  const points = CRITICAL_POINTS_ISO16122;
  const totalItems = points.length;

  let conformeCount = 0;
  let anomaliaCount = 0;
  let pendenteCount = 0;

  for (const point of points) {
    const ans = answers[point.id] || 'pendente';
    if (ans === 'conforme') conformeCount++;
    else if (ans === 'anomalia') anomaliaCount++;
    else pendenteCount++;
  }

  const answered = conformeCount + anomaliaCount;
  const conformityPct = Math.round((conformeCount / totalItems) * 100);

  if (anomaliaCount > 0) {
    return {
      totalItems,
      conformeCount,
      anomaliaCount,
      pendenteCount,
      conformityPct,
      status: 'reprovado',
      statusLabel: 'Reprovado com Anomalias',
      alertLevel: 'danger',
      recommendation: `Detetada(s) ${anomaliaCount} anomalia(s) crítica(s). Corrija as peças antes da inspeção IPP oficial.`,
      isValid: answered > 0
    };
  }

  if (pendenteCount === 0) {
    return {
      totalItems,
      conformeCount,
      anomaliaCount,
      pendenteCount,
      conformityPct: 100,
      status: 'aprovado',
      statusLabel: 'Conforme • Aprovado ISO 16122',
      alertLevel: 'success',
      recommendation: 'Pulverizador e depósito em conformidade total com os 5 pontos críticos da norma ISO 16122.',
      isValid: true
    };
  }

  return {
    totalItems,
    conformeCount,
    anomaliaCount,
    pendenteCount,
    conformityPct,
    status: 'atencao',
    statusLabel: 'Em Auditoria • Incompleto',
    alertLevel: 'warning',
    recommendation: `Auditoria em curso: ${conformeCount} de ${totalItems} pontos validados. Conclua os restantes itens.`,
    isValid: answered > 0
  };
}

export function buildInspecaoStructuredValues(
  answers: Record<string, ItemStatus>,
  result: InspecaoEvaluationResult
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  const inputs: Record<string, StructuredValue> = {};
  for (const point of CRITICAL_POINTS_ISO16122) {
    const val = answers[point.id] || 'pendente';
    inputs[`item_${point.id}`] = {
      canonicalKey: `inspection_item_${point.id}`,
      dimension: 'text',
      rawValue: val,
      unit: '',
      normalizedValue: val === 'conforme' ? 1 : 0,
      normalizedUnit: '',
      source: 'user_input',
      label: point.title,
      localId: `item_${point.id}`,
      calculatorId: 'calc_pre_inspecao',
      calculatorVersion: '1.0.0'
    };
  }

  const outputs: Record<string, StructuredValue> = {
    inspection_status: {
      canonicalKey: 'inspection_status',
      dimension: 'text',
      rawValue: result.statusLabel,
      unit: '',
      normalizedValue: result.status === 'aprovado' ? 1 : 0,
      normalizedUnit: '',
      source: 'calculated_output',
      label: 'Status de Conformidade ISO 16122',
      localId: 'inspection_status',
      calculatorId: 'calc_pre_inspecao',
      calculatorVersion: '1.0.0'
    },
    conformity_percentage: {
      canonicalKey: 'conformity_percentage',
      dimension: 'percentage',
      rawValue: result.conformityPct,
      unit: '%',
      normalizedValue: result.conformityPct / 100,
      normalizedUnit: 'ratio',
      source: 'calculated_output',
      label: 'Percentagem de Conformidade',
      localId: 'conformity_percentage',
      calculatorId: 'calc_pre_inspecao',
      calculatorVersion: '1.0.0'
    }
  };

  return { inputs, outputs };
}
