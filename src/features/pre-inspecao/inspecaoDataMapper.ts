import type { StructuredValue } from '../../types/calculator.ts';
import type { ItemStatus, InspecaoEvaluationResult } from './types/inspecaoTypes';

export type { ItemStatus, InspecaoEvaluationResult };

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
    requirement: 'Diâmetro mínimo de 63 mm, ponteiro estável e sem condensação interna.',
    isoRef: 'ISO 16122-2 / 16122-3',
    guideText: 'O manómetro é o instrumento vital de regulação de débito.'
  },
  {
    id: 'filtros',
    number: 2,
    title: 'Filtros do Circuito',
    shortDesc: 'Filtro de aspiração com válvula de corte e malha intacta',
    requirement: 'Filtros íntegros, sem fendas na malha, e válvula de corte funcional.',
    isoRef: 'ISO 16122-2 cl. 5.3',
    guideText: 'Filtros obstruídos provocam cavitação da bomba e perda de pressão nos bicos.'
  },
  {
    id: 'tubagens',
    number: 3,
    title: 'Tubagens e Mangueiras',
    shortDesc: 'Isenção total de fugas, vincos e dobras sob pressão',
    requirement: 'Sem escorrências sob pressão máxima de trabalho, sem mangueiras ressequidas.',
    isoRef: 'ISO 16122-1 cl. 4.2',
    guideText: 'Fugas no circuito hidráulico representam desperdício de fitofármaco.'
  },
  {
    id: 'bicos',
    number: 4,
    title: 'Bicos e Antigotejo',
    shortDesc: 'Mesmo modelo/calibre e antigotejo estanque (< 1 gota / 5s)',
    requirement: 'Todos os bicos da mesma marca, modelo e calibre. Antigotejo estanque (< 1 gota/5s).',
    isoRef: 'ISO 16122-2 / ISO 10625',
    guideText: 'Bicos desgastados ou misturados provocam sobredosagem severa ou subdosagem.'
  },
  {
    id: 'cardan_pto',
    number: 5,
    title: 'Veio Cardan / Proteção PTO',
    shortDesc: 'Proteção integral do veio e correntes fixas antirotação',
    requirement: 'Cones plásticos envolventes intactos, tubo sem quebras e correntes acopladas.',
    isoRef: 'ISO 16122-1 cl. 4.1',
    guideText: 'Proteção da transmissão de força é requisito crítico de segurança humana.'
  }
];

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
  for (const [key, val] of Object.entries(answers)) {
    inputs[`item_${key}`] = {
      canonicalKey: `inspection_item_${key}`,
      dimension: 'text',
      rawValue: val,
      unit: '',
      normalizedValue: val === 'conforme' ? 1 : 0,
      normalizedUnit: '',
      source: 'user_input',
      label: `Item ${key}`,
      localId: `item_${key}`,
      calculatorId: 'calc_pre_inspecao',
      calculatorVersion: '2.0.0'
    };
  }

  const makeOutput = (key: string, dim: any, val: any, unit: string, label: string): StructuredValue => ({
    canonicalKey: key,
    dimension: dim,
    rawValue: val,
    unit,
    normalizedValue: typeof val === 'number' ? val : (val === 'aprovado' ? 1 : 0),
    normalizedUnit: unit,
    source: 'calculated_output',
    label,
    localId: key,
    calculatorId: 'calc_pre_inspecao',
    calculatorVersion: '2.0.0'
  });

  const outputs: Record<string, StructuredValue> = {
    conformity_percentage: makeOutput('pre_inspecao_conformity_pct', 'percentage', result.conformityPct, '%', 'Percentagem de Conformidade'),
    conforme_count: makeOutput('pre_inspecao_conforme_count', 'count', result.conformeCount, 'itens', 'Itens Conformes'),
    anomalia_count: makeOutput('pre_inspecao_anomalia_count', 'count', result.anomaliaCount, 'itens', 'Anomalias Críticas'),
    inspection_status: makeOutput('pre_inspecao_status', 'text', result.status, '', 'Status de Auditoria')
  };

  return { inputs, outputs };
}
