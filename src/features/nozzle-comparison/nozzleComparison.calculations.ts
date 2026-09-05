/**
 * DATERRA Smart - Módulo Comparador de Bicos de Pulverização (Versão 1.1)
 * Cálculos Hidráulicos, Fórmulas Físicas, Análise de Faixas e Pesquisa de Alternativas
 */

import type {
  Nozzle,
  CalculatedNozzleFlow,
  ComparisonSummaryResult,
  DropletClassInfo,
  FlowValueOrigin,
  DriftSensitivityLevel,
  DriftInfoOrigin,
  PressureRangeAnalysis,
  TotalBoomFlowCalculation,
  AlternativeSearchParams,
  AlternativeSearchResult,
  DropletSpectrumMeasurement
} from './nozzleComparison.types';
import { getLabMeasurementEvidence } from './labEvidenceData';

/**
 * Tabela Normativa de Classes de Gotas segundo as normas BCPC / ASABE S572.1 e ISO 25358
 */
export const DROPLET_CLASSES_MAP: Record<string, DropletClassInfo> = {
  VF: {
    code: 'VF',
    labelPt: 'Muito Fina (VF)',
    colorName: 'Vermelho',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    badgeBorder: 'border-red-300',
    vmdRangeUm: '< 145 µm',
    driftSensitivity: 'Muito Alta'
  },
  F: {
    code: 'F',
    labelPt: 'Fina (F)',
    colorName: 'Laranja',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    vmdRangeUm: '145 – 225 µm',
    driftSensitivity: 'Alta'
  },
  M: {
    code: 'M',
    labelPt: 'Média (M)',
    colorName: 'Amarelo',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-300',
    vmdRangeUm: '226 – 325 µm',
    driftSensitivity: 'Média'
  },
  C: {
    code: 'C',
    labelPt: 'Grossa (C)',
    colorName: 'Azul',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    vmdRangeUm: '326 – 400 µm',
    driftSensitivity: 'Baixa'
  },
  VC: {
    code: 'VC',
    labelPt: 'Muito Grossa (VC)',
    colorName: 'Verde',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    vmdRangeUm: '401 – 500 µm',
    driftSensitivity: 'Muito Baixa'
  },
  XC: {
    code: 'XC',
    labelPt: 'Extremamente Grossa (XC)',
    colorName: 'Branco / Cinzento',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    vmdRangeUm: '501 – 650 µm',
    driftSensitivity: 'Extremamente Baixa'
  },
  UC: {
    code: 'UC',
    labelPt: 'Ultra Grossa (UC)',
    colorName: 'Preto',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-white',
    badgeBorder: 'border-slate-700',
    vmdRangeUm: '> 650 µm',
    driftSensitivity: 'Extremamente Baixa'
  },
  EC: {
    code: 'XC',
    labelPt: 'Extremamente Grossa (EC)',
    colorName: 'Cinzento',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    vmdRangeUm: '501 – 650 µm',
    driftSensitivity: 'Extremamente Baixa'
  }
};

/**
 * Definição cromática detalhada para cada cor do dataset
 */
export interface ColorDefinition {
  namePt: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  isDark: boolean;
}

/**
 * Dicionário abrangente de todas as cores existentes no catálogo
 */
export const ALL_NOZZLE_COLORS: Record<string, ColorDefinition> = {
  'branco': {
    namePt: 'Branco',
    hex: '#FFFFFF',
    bgClass: 'bg-white',
    textClass: 'text-slate-900',
    borderClass: 'border-slate-300',
    isDark: false
  },
  'amarelo': {
    namePt: 'Amarelo',
    hex: '#FACC15',
    bgClass: 'bg-yellow-300',
    textClass: 'text-yellow-950',
    borderClass: 'border-yellow-400',
    isDark: false
  },
  'laranja': {
    namePt: 'Laranja',
    hex: '#F97316',
    bgClass: 'bg-orange-500',
    textClass: 'text-white',
    borderClass: 'border-orange-600',
    isDark: true
  },
  'rosa': {
    namePt: 'Rosa',
    hex: '#EC4899',
    bgClass: 'bg-pink-500',
    textClass: 'text-white',
    borderClass: 'border-pink-600',
    isDark: true
  },
  'vermelho': {
    namePt: 'Vermelho',
    hex: '#DC2626',
    bgClass: 'bg-red-600',
    textClass: 'text-white',
    borderClass: 'border-red-700',
    isDark: true
  },
  'verde': {
    namePt: 'Verde',
    hex: '#16A34A',
    bgClass: 'bg-emerald-600',
    textClass: 'text-white',
    borderClass: 'border-emerald-700',
    isDark: true
  },
  'verde claro': {
    namePt: 'Verde Claro',
    hex: '#84CC16',
    bgClass: 'bg-lime-400',
    textClass: 'text-lime-950',
    borderClass: 'border-lime-500',
    isDark: false
  },
  'verde-claro': {
    namePt: 'Verde-claro',
    hex: '#84CC16',
    bgClass: 'bg-lime-400',
    textClass: 'text-lime-950',
    borderClass: 'border-lime-500',
    isDark: false
  },
  'verde-azeitona': {
    namePt: 'Verde-azeitona',
    hex: '#65A30D',
    bgClass: 'bg-lime-700',
    textClass: 'text-white',
    borderClass: 'border-lime-800',
    isDark: true
  },
  'azul': {
    namePt: 'Azul',
    hex: '#2563EB',
    bgClass: 'bg-blue-600',
    textClass: 'text-white',
    borderClass: 'border-blue-700',
    isDark: true
  },
  'azul claro': {
    namePt: 'Azul Claro',
    hex: '#38BDF8',
    bgClass: 'bg-sky-300',
    textClass: 'text-sky-950',
    borderClass: 'border-sky-400',
    isDark: false
  },
  'azul-claro': {
    namePt: 'Azul-claro',
    hex: '#38BDF8',
    bgClass: 'bg-sky-300',
    textClass: 'text-sky-950',
    borderClass: 'border-sky-400',
    isDark: false
  },
  'violeta': {
    namePt: 'Violeta',
    hex: '#7C3AED',
    bgClass: 'bg-violet-600',
    textClass: 'text-white',
    borderClass: 'border-violet-700',
    isDark: true
  },
  'lilás': {
    namePt: 'Lilás',
    hex: '#C084FC',
    bgClass: 'bg-purple-300',
    textClass: 'text-purple-950',
    borderClass: 'border-purple-400',
    isDark: false
  },
  'lilac': {
    namePt: 'Lilás',
    hex: '#C084FC',
    bgClass: 'bg-purple-300',
    textClass: 'text-purple-950',
    borderClass: 'border-purple-400',
    isDark: false
  },
  'púrpura': {
    namePt: 'Púrpura',
    hex: '#9333EA',
    bgClass: 'bg-purple-700',
    textClass: 'text-white',
    borderClass: 'border-purple-800',
    isDark: true
  },
  'roxo': {
    namePt: 'Roxo',
    hex: '#9333EA',
    bgClass: 'bg-purple-700',
    textClass: 'text-white',
    borderClass: 'border-purple-800',
    isDark: true
  },
  'bordô': {
    namePt: 'Bordô',
    hex: '#881337',
    bgClass: 'bg-rose-900',
    textClass: 'text-white',
    borderClass: 'border-rose-950',
    isDark: true
  },
  'castanho': {
    namePt: 'Castanho',
    hex: '#78350F',
    bgClass: 'bg-amber-900',
    textClass: 'text-white',
    borderClass: 'border-amber-950',
    isDark: true
  },
  'castanho claro': {
    namePt: 'Castanho Claro',
    hex: '#B45309',
    bgClass: 'bg-amber-700',
    textClass: 'text-white',
    borderClass: 'border-amber-800',
    isDark: true
  },
  'cinzento': {
    namePt: 'Cinzento',
    hex: '#64748B',
    bgClass: 'bg-slate-500',
    textClass: 'text-white',
    borderClass: 'border-slate-600',
    isDark: true
  },
  'preto': {
    namePt: 'Preto',
    hex: '#0F172A',
    bgClass: 'bg-slate-900',
    textClass: 'text-white',
    borderClass: 'border-black',
    isDark: true
  },
  'marfim': {
    namePt: 'Marfim',
    hex: '#FEF3C7',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-950',
    borderClass: 'border-amber-300',
    isDark: false
  },
  'turquesa': {
    namePt: 'Turquesa',
    hex: '#06B6D4',
    bgClass: 'bg-cyan-500',
    textClass: 'text-white',
    borderClass: 'border-cyan-600',
    isDark: true
  }
};

/**
 * Mapeamento legado de Cores ISO 10625 para retrocompatibilidade
 */
export const ISO_COLOR_STYLES: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'Branco': { bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-300', hex: '#FFFFFF' },
  'Lilás': { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300', hex: '#C084FC' },
  'Castanho': { bg: 'bg-amber-800', text: 'text-white', border: 'border-amber-900', hex: '#78350F' },
  'Amarelo': { bg: 'bg-yellow-300', text: 'text-yellow-950', border: 'border-yellow-400', hex: '#FACC15' },
  'Laranja': { bg: 'bg-orange-400', text: 'text-white', border: 'border-orange-500', hex: '#FB923C' },
  'Vermelho': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600', hex: '#EF4444' },
  'Verde': { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600', hex: '#10B981' },
  'Cinzento': { bg: 'bg-slate-400', text: 'text-white', border: 'border-slate-500', hex: '#94A3B8' },
  'Preto': { bg: 'bg-slate-900', text: 'text-white', border: 'border-black', hex: '#0F172A' },
  'Azul': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600', hex: '#3B82F6' },
  'Púrpura': { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700', hex: '#9333EA' },
  'Rosa': { bg: 'bg-pink-400', text: 'text-white', border: 'border-pink-500', hex: '#F472B6' },
  'Turquesa': { bg: 'bg-cyan-400', text: 'text-cyan-950', border: 'border-cyan-500', hex: '#22D3EE' },
  'Marfim': { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', hex: '#FEF3C7' },
  'Verde Claro': { bg: 'bg-lime-300', text: 'text-lime-950', border: 'border-lime-400', hex: '#BEF264' }
};

/**
 * Estrutura enriquecida de apresentação visual da cor do bico
 */
export interface NozzleColorPresentation {
  colorName: string;
  hasColor: boolean;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hex: string;
  isDark: boolean;
  isIso: boolean;
  isoCodeText: string;
  fullLabel: string;
  badgeAriaLabel: string;
  nominalFlow?: number;
  referencePressure?: number;
  nominalFlowText: string;
}

/**
 * Função central de apresentação da cor do bico e código ISO
 */
export function getNozzleColorPresentation(
  input?: Nozzle | string | null,
  explicitIsIso?: boolean,
  explicitIsoCode?: string | null,
  explicitNominalFlow?: number,
  explicitRefPressure?: number
): NozzleColorPresentation {
  let rawColor: string | null = null;
  let isIso = Boolean(explicitIsIso);
  let isoCode: string | null = explicitIsoCode || null;
  let nominalFlow: number | undefined = explicitNominalFlow;
  let refPressure: number | undefined = explicitRefPressure;

  if (input && typeof input === 'object') {
    rawColor = input.color || null;
    isIso = Boolean(input.isIsoNozzle);
    isoCode = input.isoCode || null;
    if (nominalFlow === undefined) nominalFlow = input.nominalFlowLMin;
    if (refPressure === undefined) refPressure = input.referencePressureBar;
  } else if (typeof input === 'string') {
    rawColor = input;
  }

  const nominalFlowText = typeof nominalFlow === 'number' && !isNaN(nominalFlow)
    ? `${formatPt(nominalFlow, 2)} L/min${typeof refPressure === 'number' && !isNaN(refPressure) ? ` a ${formatPt(refPressure, 1)} bar` : ''}`
    : 'Não disponível';

  if (!rawColor || rawColor.trim() === '') {
    return {
      colorName: 'Não disponível',
      hasColor: false,
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-700',
      borderClass: 'border-slate-300',
      hex: '#E2E8F0',
      isDark: false,
      isIso: false,
      isoCodeText: 'Não aplicável',
      fullLabel: 'Cor: Não disponível • Código ISO: Não aplicável',
      badgeAriaLabel: 'Cor do bico: Não disponível',
      nominalFlow,
      referencePressure: refPressure,
      nominalFlowText
    };
  }

  const trimmed = rawColor.trim();
  const lower = trimmed.toLowerCase();
  const baseKey = lower.split(' - ')[0].trim();
  const matchedDef = ALL_NOZZLE_COLORS[lower] || ALL_NOZZLE_COLORS[baseKey];

  if (!matchedDef) {
    // Não é uma cor cromática reconhecida (ex: calibre '10', 'G-150')
    const isoCodeText = isIso && isoCode ? isoCode : 'Não aplicável';
    const ariaLabel = typeof nominalFlow === 'number' && !isNaN(nominalFlow)
      ? `Referência ${trimmed}, débito nominal ${formatPt(nominalFlow, 2)} litros por minuto${typeof refPressure === 'number' && !isNaN(refPressure) ? ` a ${formatPt(refPressure, 1)} bar` : ''}${isIso && isoCode ? `, código ISO ${isoCode}` : ''}`
      : `Referência ${trimmed}${isIso && isoCode ? ` (Código ISO: ${isoCode})` : ''}`;

    return {
      colorName: trimmed,
      hasColor: false,
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-800',
      borderClass: 'border-slate-300',
      hex: '#E2E8F0',
      isDark: false,
      isIso,
      isoCodeText,
      fullLabel: isIso && isoCode
        ? `Cor ISO: ${trimmed} ${isoCode}`
        : `Cor: ${trimmed} • Código ISO: Não aplicável`,
      badgeAriaLabel: ariaLabel,
      nominalFlow,
      referencePressure: refPressure,
      nominalFlowText
    };
  }

  const colorName = matchedDef.namePt;
  const isoCodeText = isIso && isoCode ? isoCode : 'Não aplicável';
  const fullLabel = isIso && isoCode
    ? `Cor ISO: ${colorName} ${isoCode}`
    : `Cor: ${colorName} • Código ISO: Não aplicável`;

  const ariaLabel = typeof nominalFlow === 'number' && !isNaN(nominalFlow)
    ? `Cor ${colorName}, débito nominal ${formatPt(nominalFlow, 2)} litros por minuto${typeof refPressure === 'number' && !isNaN(refPressure) ? ` a ${formatPt(refPressure, 1)} bar` : ''}${isIso && isoCode ? `, código ISO ${isoCode}` : ''}`
    : `Cor ${colorName}${isIso && isoCode ? ` (Código ISO: ${isoCode})` : ''}`;

  return {
    colorName,
    hasColor: true,
    bgClass: matchedDef.bgClass,
    textClass: matchedDef.textClass,
    borderClass: matchedDef.borderClass,
    hex: matchedDef.hex,
    isDark: matchedDef.isDark,
    isIso,
    isoCodeText,
    fullLabel,
    badgeAriaLabel: ariaLabel,
    nominalFlow,
    referencePressure: refPressure,
    nominalFlowText
  };
}

/**
 * Ordena bicos estritamente por débito nominal / de referência crescente.
 * Regra:
 * 1. Menor débito nominal primeiro.
 * 2. Bicos sem débito nominal vão para o final.
 * 3. Desempate: nome da variante/referência de catálogo.
 * 4. Desempate final: ID único.
 */
export function sortNozzlesByNominalFlow(a: Nozzle, b: Nozzle): number {
  const flowA = typeof a.nominalFlowLMin === 'number' && !isNaN(a.nominalFlowLMin) ? a.nominalFlowLMin : Infinity;
  const flowB = typeof b.nominalFlowLMin === 'number' && !isNaN(b.nominalFlowLMin) ? b.nominalFlowLMin : Infinity;

  if (flowA !== flowB) {
    return flowA - flowB;
  }

  const modelComp = (a.modelNorm || '').localeCompare(b.modelNorm || '', 'pt-PT');
  if (modelComp !== 0) {
    return modelComp;
  }

  return (a.id || '').localeCompare(b.id || '', 'pt-PT');
}

/**
 * Retorna a tolerância percentual de inspeção técnica / intervalo de controlo:
 * - Débito nominal inferior a 1,00 L/min: tolerância de ±15% (0.15)
 * - Débito nominal igual ou superior a 1,00 L/min: tolerância de ±10% (0.10)
 */
export function getInspectionTolerance(nominalFlowLMin: number): number {
  if (nominalFlowLMin < 1.0) {
    return 0.15; // ±15%
  }
  return 0.10; // ±10%
}

/**
 * Formata o ângulo de pulverização de acordo com o catálogo e a dependência da pressão.
 */
export function formatSprayAngle(nozzle?: Nozzle, pressureBar?: number): string {
  if (!nozzle) return 'Ângulo do jato: Não disponível';

  // 1. Caso variável com a pressão
  if (nozzle.isAnglePressureDependent || (nozzle.sprayAngleMinDeg && nozzle.sprayAngleMaxDeg)) {
    if (nozzle.sprayAngleMinDeg && nozzle.sprayAngleMaxDeg) {
      return `Ângulo do jato: ${nozzle.sprayAngleMinDeg}°–${nozzle.sprayAngleMaxDeg}°, consoante a pressão`;
    }
    return 'Ângulo do jato variável com a pressão';
  }

  // 2. Caso fixo a uma pressão específica
  if (nozzle.sprayAngleDeg !== undefined && nozzle.sprayAngleDeg !== null && nozzle.sprayAngleDeg !== '' && nozzle.sprayAngleDeg !== 'null') {
    if (pressureBar !== undefined && Math.abs(pressureBar - nozzle.referencePressureBar) < 0.1) {
      return `Ângulo do jato: ${nozzle.sprayAngleDeg}° a ${formatPt(pressureBar, 1)} bar`;
    }
    return `Ângulo do jato: ${nozzle.sprayAngleDeg}°`;
  }

  return 'Ângulo do jato: Não disponível';
}

/**
 * Converte rótulos originais de perigo de deriva para o padrão canónico de Sensibilidade Potencial.
 */
export function mapToDriftSensitivity(rawHazard?: string): DriftSensitivityLevel {
  if (!rawHazard || rawHazard === 'null' || rawHazard === 'N/D') {
    return 'Não disponível';
  }
  const low = rawHazard.toLowerCase();
  if (low.includes('baixo') || low.includes('inexistente') || low.includes('muito baixo') || low.includes('extremamente baixo')) {
    return 'Menor sensibilidade potencial à deriva';
  }
  if (low.includes('médio') || low.includes('medio') || low.includes('intermédio')) {
    return 'Sensibilidade potencial à deriva intermédia';
  }
  if (low.includes('alto') || low.includes('muito alto')) {
    return 'Maior sensibilidade potencial à deriva';
  }
  return 'Sensibilidade potencial à deriva intermédia';
}

/**
 * Converte a sensibilidade potencial à deriva num rótulo curto e direto para exibição em cartões.
 * Padrão DATERRA:
 * - 'Menor sensibilidade potencial à deriva' -> 'Deriva: Baixa'
 * - 'Sensibilidade potencial à deriva intermédia' -> 'Deriva: Média'
 * - 'Maior sensibilidade potencial à deriva' -> 'Deriva: Elevada'
 * - 'Não disponível' -> 'Deriva: Não disponível'
 */
export function getShortDriftLevel(drift?: string | null): 'Deriva: Baixa' | 'Deriva: Média' | 'Deriva: Elevada' | 'Deriva: Não disponível' {
  if (!drift || drift === 'null' || drift === 'Não disponível') {
    return 'Deriva: Não disponível';
  }
  const low = drift.toLowerCase();
  if (low.includes('menor') || low.includes('baixo') || low.includes('baixa')) {
    return 'Deriva: Baixa';
  }
  if (low.includes('intermédia') || low.includes('intermedia') || low.includes('médio') || low.includes('medio') || low.includes('média') || low.includes('media')) {
    return 'Deriva: Média';
  }
  if (low.includes('maior') || low.includes('alto') || low.includes('alta') || low.includes('elevada') || low.includes('elevado')) {
    return 'Deriva: Elevada';
  }
  return 'Deriva: Média';
}

/**
 * Resumo da fonte/origem da informação de deriva
 */
export function getDriftOriginSummary(origin?: DriftInfoOrigin): string {
  switch (origin) {
    case 'fabricante':
      return 'Fonte: Informação comercial do fabricante';
    case 'medição laboratorial':
      return 'Fonte: Medição laboratorial';
    case 'estimativa técnica':
      return 'Base: Estimativa técnica';
    default:
      return 'Origem: Não disponível';
  }
}

/**
 * Atalhos preferenciais de pressão de trabalho no padrão DATERRA Smart
 */
export const BASE_PRESSURE_SHORTCUTS = [3.0, 5.0, 8.0, 10.0, 15.0];

/**
 * Gera atalhos de pressão adaptativos baseados nos 5 valores preferenciais (3,0; 5,0; 8,0; 10,0; 15,0 bar).
 * Atalhos fora da faixa técnica são filtrados.
 */
export function getAdaptivePressureShortcuts(
  minPressure?: number,
  maxPressure?: number,
  hasOverlap = true
): number[] {
  if (!hasOverlap) {
    return [];
  }
  if (minPressure === undefined || maxPressure === undefined) {
    return BASE_PRESSURE_SHORTCUTS;
  }
  if (minPressure > maxPressure) {
    return [];
  }

  return BASE_PRESSURE_SHORTCUTS.filter(
    p => p >= minPressure - 0.001 && p <= maxPressure + 0.001
  );
}

/**
 * Calcula a análise de faixa comum de pressão e avisos para bicos de fenda.
 */
export function getPressureRangeAnalysis(
  nozzleA?: Nozzle,
  nozzleB?: Nozzle,
  workingPressureBar = 3.0
): PressureRangeAnalysis {
  if (!nozzleA || !nozzleB) {
    return {
      hasCommonRange: true,
      commonRangeText: 'Defina ambos os bicos para verificar a faixa comum',
      isCurrentPressureInCommonRange: true,
      isFlatFanUnderpressurized: false
    };
  }

  const minA = nozzleA.pressureMinBar;
  const maxA = nozzleA.pressureMaxBar;
  const minB = nozzleB.pressureMinBar;
  const maxB = nozzleB.pressureMaxBar;

  const commonMin = Math.max(minA, minB);
  const commonMax = Math.min(maxA, maxB);
  const hasCommonRange = commonMin <= commonMax;

  const isCurrentPressureInCommonRange =
    hasCommonRange && workingPressureBar >= commonMin && workingPressureBar <= commonMax;

  let commonRangeText = '';
  let warningNote: string | undefined;

  if (hasCommonRange) {
    commonRangeText = `Faixa comum indicada: ${formatPt(commonMin, 1)}–${formatPt(commonMax, 1)} bar`;
    warningNote =
      'A faixa comum indica que ambos os bicos têm indicação de funcionamento nesse intervalo, segundo as fontes técnicas disponíveis. Não significa que apresentem comportamento nem espectro de gotas equivalente.';
  } else {
    commonRangeText = 'Sem faixa de pressão comum indicada';
    warningNote =
      'Não existe faixa de pressão comum indicada para estes dois bicos. Pode consultar as características de cada bico, mas não é possível compará-los à mesma pressão dentro das faixas recomendadas.';
  }

  // Deteção de bico de fenda com pressão abaixo do mínimo recomendado
  const isFlatFanA = nozzleA.nozzleType.toLowerCase().includes('fenda') || nozzleA.model.toLowerCase().includes('xr') || nozzleA.model.toLowerCase().includes('tt');
  const isFlatFanB = nozzleB.nozzleType.toLowerCase().includes('fenda') || nozzleB.model.toLowerCase().includes('xr') || nozzleB.model.toLowerCase().includes('tt');

  const isUnderpressureA = isFlatFanA && workingPressureBar < nozzleA.pressureMinBar;
  const isUnderpressureB = isFlatFanB && workingPressureBar < nozzleB.pressureMinBar;

  const isFlatFanUnderpressurized = isUnderpressureA || isUnderpressureB;
  let flatFanUnderpressureWarning: string | undefined;

  if (isFlatFanUnderpressurized) {
    flatFanUnderpressureWarning =
      'Atenção: pressão abaixo da recomendada para este bico de fenda. Pode ocorrer formação deficiente do leque e sobreposição insuficiente dos jatos.';
  }

  return {
    hasCommonRange,
    commonMinBar: hasCommonRange ? commonMin : undefined,
    commonMaxBar: hasCommonRange ? commonMax : undefined,
    commonRangeText,
    isCurrentPressureInCommonRange,
    warningNote,
    isFlatFanUnderpressurized,
    flatFanUnderpressureWarning
  };
}

/**
 * Calcula o débito total da barra de pulverização (conjunto de bicos).
 */
export function calculateTotalBoomFlow(
  flowPerNozzleLMin: number,
  nozzleCount: number
): TotalBoomFlowCalculation {
  const count = Math.max(1, Math.round(nozzleCount || 1));
  const total = Number((flowPerNozzleLMin * count).toFixed(2));
  return {
    flowPerNozzleLMin,
    nozzleCount: count,
    totalBoomFlowLMin: total,
    warningNote:
      'Este resultado assume bicos com débito semelhante. Confirme por medição prática em proveta graduada.'
  };
}

/**
 * Calcula o débito de um bico para uma dada pressão de trabalho.
 * 
 * Regras Estritas de Prioridade Hidráulica:
 * 1. Procurar SEMPRE primeiro um valor no array flowRates (ou na pressão nominal P_ref)
 *    cuja pressureBar coincida com a pressão selecionada.
 * 2. Quando existir valor tabelado para essa pressão:
 *    - Usa flowLMin diretamente;
 *    - Define valueOrigin = 'tabelado';
 *    - Mostra 'Débito tabelado';
 *    - NÃO calcula estimativa pela raiz quadrada (mesmo que a pressão seja diferente de P_ref).
 * 3. Apenas quando NÃO existir valor tabelado para a pressão selecionada e a pressão estiver dentro da faixa:
 *    - Aplica estritamente a lei do orifício hidráulico (Bernoulli):
 *      Q2 = Q1 * sqrt(P2 / P1)
 *    - Aplica exclusivamente a proporcionalidade física com a raiz quadrada da pressão (Bernoulli).
 *    - Define valueOrigin = 'estimado';
 *    - Mostra 'Débito estimado pela relação pressão–débito'.
 * 4. Valida se a pressão está dentro de [pressureMinBar, pressureMaxBar].
 *    Se estiver fora, isOutOfRange = true e emite alerta visível.
 */
export function calculateNozzleFlow(nozzle: Nozzle, workingPressureBar: number): CalculatedNozzleFlow {
  const p1 = nozzle.referencePressureBar;
  const q1 = nozzle.nominalFlowLMin;
  const p2 = Math.max(0, workingPressureBar);

  const isOutOfRange = p2 < nozzle.pressureMinBar || p2 > nozzle.pressureMaxBar;

  let flowLMin: number;
  let valueOrigin: FlowValueOrigin;
  let calculationFormula: string;
  let originBadgeText: string;

  // 1. Procurar no array flowRates se existir
  let matchedTabulatedPoint: { pressureBar: number; flowLMin: number } | undefined;
  if (nozzle.flowRates && Array.isArray(nozzle.flowRates)) {
    matchedTabulatedPoint = nozzle.flowRates.find(
      pt => Math.abs(pt.pressureBar - p2) < 0.001
    );
  }

  // Verificar se coincide com a pressão de referência principal
  const isMatchingRefPressure = Math.abs(p2 - p1) < 0.001;

  if (p2 <= 0 || q1 <= 0 || p1 <= 0) {
    flowLMin = 0;
    valueOrigin = 'estimado';
    calculationFormula = 'Pressão nula ou parâmetros inválidos';
    originBadgeText = 'Sem dados para esta pressão';
  } else if (matchedTabulatedPoint) {
    // Regra 1: Valor Tabelado encontrado no array flowRates
    flowLMin = matchedTabulatedPoint.flowLMin;
    valueOrigin = 'tabelado';
    calculationFormula = `Valor disponível na tabela técnica para esta pressão (${flowLMin} L/min a ${p2} bar)`;
    originBadgeText = 'Débito tabelado';
  } else if (isMatchingRefPressure) {
    // Regra 1: Valor Tabelado Oficial de Referência
    flowLMin = q1;
    valueOrigin = 'tabelado';
    calculationFormula = `Valor disponível na tabela técnica para esta pressão (${q1} L/min a ${p1} bar)`;
    originBadgeText = 'Débito tabelado';
  } else {
    // Regra 3: Relação física estrita do orifício hidráulico (Bernoulli): Q2 = Q1 * Math.sqrt(P2 / P1)
    flowLMin = q1 * Math.sqrt(p2 / p1);
    valueOrigin = 'estimado';
    calculationFormula = `Estimativa calculada pela relação de raiz quadrada entre pressão e débito: Q2 = Q1 × sqrt(P2 / P1) (Q = ${q1} × √(${p2} / ${p1}))`;
    originBadgeText = 'Débito estimado';
  }

  // Tolerância escalonada (±15% se < 1.00 L/min, ±10% se >= 1.00 L/min)
  const toleranceRatio = getInspectionTolerance(flowLMin);
  const tolerancePercentage = Math.round(toleranceRatio * 100);
  
  // Limites de controlo: limiteInferior = Q * (1 - tol), limiteSuperior = Q * (1 + tol)
  const deviationMinLMin = Number((flowLMin * (1 - toleranceRatio)).toFixed(2));
  const deviationMaxLMin = Number((flowLMin * (1 + toleranceRatio)).toFixed(2));

  // Inferência da classe de gotas com base na pressão ou medição laboratorial
  const labEvidence = getLabMeasurementEvidence(nozzle.id, p2);

  let effectiveDropletClass = nozzle.dropletClass5bar;
  if (p2 >= 12.5 && nozzle.dropletClass15bar && nozzle.dropletClass15bar !== 'null') {
    effectiveDropletClass = nozzle.dropletClass15bar;
  } else if (p2 >= 7.5 && nozzle.dropletClass10bar && nozzle.dropletClass10bar !== 'null') {
    effectiveDropletClass = nozzle.dropletClass10bar;
  }

  let dropletSpectrumLabel = 'Indicação estimada de espectro de gotas';
  let dropletOrigin: 'fabricante' | 'medição laboratorial' | 'estimativa técnica' | 'não disponível' = 'estimativa técnica';

  if (labEvidence && labEvidence.dropletSpectrum) {
    dropletSpectrumLabel = 'Espectro de gotas obtido por medição laboratorial';
    dropletOrigin = 'medição laboratorial';
    effectiveDropletClass = labEvidence.dropletSpectrum;
  } else if (effectiveDropletClass && effectiveDropletClass !== 'null') {
    dropletSpectrumLabel = 'Espectro de gotas indicado pelo fabricante';
    dropletOrigin = 'fabricante';
  } else {
    dropletSpectrumLabel = 'Indicação estimada de espectro de gotas';
    dropletOrigin = 'estimativa técnica';
  }

  // Sensibilidade potencial à deriva
  let effectiveDriftSensitivity: DriftSensitivityLevel = mapToDriftSensitivity(nozzle.driftHazardLevel);
  let driftOrigin: DriftInfoOrigin = 'fabricante';

  if (labEvidence && labEvidence.driftSensitivityIndicator) {
    effectiveDriftSensitivity = labEvidence.driftSensitivityIndicator;
    driftOrigin = 'medição laboratorial';
  } else if (p2 > nozzle.pressureMaxBar) {
    effectiveDriftSensitivity = 'Maior sensibilidade potencial à deriva';
    driftOrigin = 'estimativa técnica';
  }

  let pressureWarning: string | undefined;
  if (isOutOfRange && p2 > 0) {
    if (p2 < nozzle.pressureMinBar) {
      pressureWarning = `Pressão de ${formatPt(p2)} bar abaixo do limite mínimo recomendado (${formatPt(nozzle.pressureMinBar)} bar). Risco de má formação do leque e distribuição irregular.`;
    } else {
      pressureWarning = `Pressão de ${formatPt(p2)} bar excede o limite máximo recomendado (${formatPt(nozzle.pressureMaxBar)} bar). Risco de sensibilidade acentuada à deriva e desgaste acelerado.`;
    }
  }

  const sprayAngleText = formatSprayAngle(nozzle, p2);

  return {
    nozzle,
    workingPressureBar: p2,
    flowLMin: Number(flowLMin.toFixed(2)),
    valueOrigin,
    isNominal: isMatchingRefPressure,
    isEstimated: valueOrigin === 'estimado',
    isOutOfRange,
    pressureWarning,
    tolerancePercentage,
    deviationMinLMin,
    deviationMaxLMin,
    effectiveDropletClass: effectiveDropletClass && effectiveDropletClass !== 'null' ? effectiveDropletClass : undefined,
    dropletSpectrumLabel,
    dropletOrigin,
    effectiveDriftSensitivity,
    shortDriftLevel: getShortDriftLevel(effectiveDriftSensitivity),
    driftOrigin,
    driftOriginSummary: getDriftOriginSummary(driftOrigin),
    sprayAngleText,
    calculationFormula,
    originBadgeText
  };
}

/**
 * Compara dois bicos calculados à mesma pressão de trabalho com linguagem prudente e orientadora.
 */
export function compareNozzles(
  flowA: CalculatedNozzleFlow,
  flowB: CalculatedNozzleFlow
): ComparisonSummaryResult {
  const qA = flowA.flowLMin;
  const qB = flowB.flowLMin;

  const absoluteDiff = Number((qB - qA).toFixed(2));
  let percentageDiff: number | null = null;
  if (qA > 0) {
    percentageDiff = Number((((qB - qA) / qA) * 100).toFixed(1));
  }

  let higherFlowNozzle: 'A' | 'B' | 'EQUAL' = 'EQUAL';
  if (Math.abs(qB - qA) > 0.005) {
    higherFlowNozzle = qB > qA ? 'B' : 'A';
  }

  // Texto descritivo do fluxo
  let flowComparisonText = '';
  if (higherFlowNozzle === 'EQUAL') {
    flowComparisonText = 'Os dois bicos apresentam débitos nominais equivalentes à pressão selecionada.';
  } else if (higherFlowNozzle === 'B') {
    const diffText = formatPt(Math.abs(absoluteDiff), 2);
    const percText = percentageDiff !== null ? ` (+${formatPt(percentageDiff, 1)}%)` : '';
    flowComparisonText = `O Bico B apresenta uma capacidade de débito superior em ${diffText} L/min face ao Bico A${percText} à pressão de ${formatPt(flowA.workingPressureBar)} bar.`;
  } else {
    const diffText = formatPt(Math.abs(absoluteDiff), 2);
    const percText = percentageDiff !== null ? ` (${formatPt(percentageDiff, 1)}%)` : '';
    flowComparisonText = `O Bico A apresenta uma capacidade de débito superior em ${diffText} L/min face ao Bico B${percText} à pressão de ${formatPt(flowA.workingPressureBar)} bar.`;
  }

  // Comparação de gotas
  const dropA = flowA.effectiveDropletClass;
  const dropB = flowB.effectiveDropletClass;
  let dropletComparisonText = 'Classes de gotas disponíveis para avaliação contextual.';
  if (dropA && dropB) {
    if (dropA === dropB) {
      dropletComparisonText = `Ambos os bicos estão classificados com espectro de gotas ${dropA}.`;
    } else {
      dropletComparisonText = `O Bico A produz espectro ${dropA}, enquanto o Bico B produz espectro ${dropB}.`;
    }
  }

  // Comparação de sensibilidade potencial à deriva
  const driftA = flowA.effectiveDriftSensitivity;
  const driftB = flowB.effectiveDriftSensitivity;
  let driftComparisonText = '';
  if (driftA === driftB) {
    driftComparisonText = `Ambas as opções apresentam nível indicativo classificado como "${driftA}".`;
  } else {
    driftComparisonText = `O Bico A apresenta "${driftA}", enquanto o Bico B apresenta "${driftB}".`;
  }

  // Análise da Faixa de Pressão
  const pressureRangeAnalysis = getPressureRangeAnalysis(
    flowA.nozzle,
    flowB.nozzle,
    flowA.workingPressureBar
  );

  const pRangeA = `${formatPt(flowA.nozzle.pressureMinBar)}–${formatPt(flowA.nozzle.pressureMaxBar)} bar`;
  const pRangeB = `${formatPt(flowB.nozzle.pressureMinBar)}–${formatPt(flowB.nozzle.pressureMaxBar)} bar`;
  const pressureRangeComparisonText = `Faixa de serviço indicada: Bico A (${pRangeA}) vs Bico B (${pRangeB}).`;

  // Ângulo
  const angleComparisonText = `${flowA.sprayAngleText} (Bico A) vs ${flowB.sprayAngleText} (Bico B).`;

  // Interpretação Técnica Orientadora (Condicional e sem juízos absolutos)
  let generalRecommendation = '';
  if (higherFlowNozzle === 'B') {
    generalRecommendation =
      'O Bico B fornece maior débito unitário à mesma pressão, o que permite, em condições técnicas favoráveis, operar a maior velocidade de avanço ou aplicar maior volume de calda por hectare. Avalie se o alvo biológico, o estádio fenológico e a densidade da copa justificam este acréscimo volumétrico.';
  } else if (higherFlowNozzle === 'A') {
    generalRecommendation =
      'O Bico A apresenta maior débito unitário. Caso o objetivo seja trabalhar com volumes de calda mais reduzidos ou diminuir o risco de escorrimento foliar em tratamentos fungicidas de contacto, o Bico B poderá assegurar maior autonomia por depósito.';
  } else {
    generalRecommendation =
      'Com débitos unitários equivalentes, a seleção do bico mais adequado deve fundamentar-se na arquitetura da cultura, no tamanho de gota pretendido (compromisso cobertura vs sensibilidade à deriva) e nas condições meteorológicas vigentes.';
  }

  const disclaimer =
    'Esta análise constitui uma interpretação técnica orientadora de apoio à decisão. Confirme sempre a calibração com água limpa no próprio pulverizador (medição em proveta graduada durante 1 minuto por bico), a pressão efetiva no manómetro da barra, a velocidade real de avanço, o espaçamento entre bicos, a tabela técnica oficial do fabricante, o rótulo homologado do produto fitossanitário e as condições meteorológicas locais.';

  return {
    nozzleA: flowA,
    nozzleB: flowB,
    absoluteDifferenceLMin: absoluteDiff,
    percentageDifference: percentageDiff,
    higherFlowNozzle,
    flowComparisonText,
    dropletComparisonText,
    driftComparisonText,
    pressureRangeComparisonText,
    pressureRangeAnalysis,
    angleComparisonText,
    generalRecommendation,
    disclaimer
  };
}

/**
 * Pesquisa de Alternativas com débito semelhante (Modo "Encontrar alternativas").
 */
export function findNozzleAlternatives(
  params: AlternativeSearchParams,
  allNozzles: Nozzle[]
): AlternativeSearchResult[] {
  const targetFlow = params.targetFlowLMin;
  const pTrab = params.workingPressureBar;
  const tolRatio = params.tolerancePercentage / 100;

  if (targetFlow <= 0 || pTrab <= 0 || !Array.isArray(allNozzles)) {
    return [];
  }

  const results: AlternativeSearchResult[] = [];

  for (const nozzle of allNozzles) {
    // Excluir o próprio bico de referência se especificado
    if (params.referenceNozzleId && nozzle.id === params.referenceNozzleId) {
      continue;
    }

    // Filtros opcionais
    if (params.brandFilter && nozzle.brand !== params.brandFilter) {
      continue;
    }
    if (params.nozzleTypeFilter && nozzle.nozzleType !== params.nozzleTypeFilter) {
      continue;
    }
    if (params.modelFilter && nozzle.model !== params.modelFilter) {
      continue;
    }
    if (params.sprayAngleFilter) {
      const angleStr = String(params.sprayAngleFilter).replace('°', '').trim();
      const nozzleAngleStr = String(nozzle.sprayAngleDeg || '').replace('°', '').trim();
      if (nozzleAngleStr !== angleStr) {
        continue;
      }
    }
    if (params.onlyTop && !nozzle.isTop) {
      continue;
    }
    if (params.onlyValidated && nozzle.confidenceLevel !== 'alto') {
      continue;
    }
    if (params.cropFilter && !nozzle.sprayFunction.toLowerCase().includes(params.cropFilter.toLowerCase())) {
      continue;
    }
    if (params.objectiveFilter && !nozzle.mainApplications.toLowerCase().includes(params.objectiveFilter.toLowerCase())) {
      continue;
    }

    // Calcular débito na pressão de trabalho
    const calcFlow = calculateNozzleFlow(nozzle, pTrab);
    const flowDiff = calcFlow.flowLMin - targetFlow;
    const diffRatio = Math.abs(flowDiff) / targetFlow;

    // Verificar se está dentro da tolerância
    if (diffRatio <= tolRatio + 0.0001) {
      const diffPerc = Number(((flowDiff / targetFlow) * 100).toFixed(1));

      // Filtro de preferência por menor sensibilidade à deriva
      if (params.preferLowDrift && calcFlow.effectiveDriftSensitivity !== 'Menor sensibilidade potencial à deriva') {
        continue;
      }

      results.push({
        nozzle,
        calculatedFlow: calcFlow,
        flowDiffLMin: Number(flowDiff.toFixed(2)),
        flowDiffPercentage: diffPerc,
        driftSensitivity: calcFlow.effectiveDriftSensitivity,
        shortDriftLevel: calcFlow.shortDriftLevel,
        driftInfoOrigin: calcFlow.driftOrigin,
        driftOriginSummary: calcFlow.driftOriginSummary,
        isTop: nozzle.isTop,
        isExactMatch: Math.abs(flowDiff) < 0.005
      });
    }
  }

  // Ordenação:
  // 1. Menor diferença absoluta de débito |ΔQ|
  // 2. Menor sensibilidade potencial à deriva
  // 3. Estado TOP (bico de referência no catálogo DATERRA)
  const driftOrder: Record<string, number> = {
    'Menor sensibilidade potencial à deriva': 1,
    'Sensibilidade potencial à deriva intermédia': 2,
    'Maior sensibilidade potencial à deriva': 3,
    'Não disponível': 4
  };

  results.sort((a, b) => {
    const diffDiff = Math.abs(a.flowDiffLMin) - Math.abs(b.flowDiffLMin);
    if (Math.abs(diffDiff) > 0.005) {
      return diffDiff;
    }

    const driftA = driftOrder[a.driftSensitivity] || 99;
    const driftB = driftOrder[b.driftSensitivity] || 99;
    if (driftA !== driftB) {
      return driftA - driftB;
    }

    if (a.isTop !== b.isTop) {
      return a.isTop ? -1 : 1;
    }

    return a.nozzle.brand.localeCompare(b.nozzle.brand);
  });

  return results;
}

/**
 * Formata um número no padrão português de Portugal (vírgula como separador decimal)
 */
export function formatPt(num: number | undefined | null, decimals = 2): string {
  if (num === undefined || num === null || isNaN(num)) return '0,00';
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false
  }).format(num);
}

/**
 * Extrai medições reais de espectro de gotas (Dv10, Dv50, Dv90) para bicos com dados técnicos catalogados (ex: Albuz ATR a 5, 10 e 15 bar).
 * Não inventa, não estima e não interpola valores. Retorna array vazio para bicos sem dados na fonte oficial.
 */
export function getDropletSpectrumMeasurements(nozzle?: Nozzle): DropletSpectrumMeasurement[] {
  if (!nozzle) return [];

  // Dados exclusivos e reais documentados na fonte técnica (Albuz ATR)
  if (nozzle.brand === 'Albuz' && nozzle.model === 'ATR') {
    const list: DropletSpectrumMeasurement[] = [];

    // 5.0 bar
    if (nozzle.d10_5bar_um !== undefined || nozzle.d50_5bar_um !== undefined || nozzle.d90_5bar_um !== undefined) {
      list.push({
        pressureBar: 5,
        dv10Micrometres: nozzle.d10_5bar_um,
        dv50Micrometres: nozzle.d50_5bar_um,
        dv90Micrometres: nozzle.d90_5bar_um,
        sourceType: 'manufacturer',
        sourceLabel: nozzle.sourceBody || 'Catálogo Albuz',
        isMeasured: true
      });
    }

    // 10.0 bar
    if (nozzle.d10_10bar_um !== undefined || nozzle.d50_10bar_um !== undefined || nozzle.d90_10bar_um !== undefined) {
      list.push({
        pressureBar: 10,
        dv10Micrometres: nozzle.d10_10bar_um,
        dv50Micrometres: nozzle.d50_10bar_um,
        dv90Micrometres: nozzle.d90_10bar_um,
        sourceType: 'manufacturer',
        sourceLabel: nozzle.sourceBody || 'Catálogo Albuz',
        isMeasured: true
      });
    }

    // 15.0 bar
    if (nozzle.d10_15bar_um !== undefined || nozzle.d50_15bar_um !== undefined || nozzle.d90_15bar_um !== undefined) {
      list.push({
        pressureBar: 15,
        dv10Micrometres: nozzle.d10_15bar_um,
        dv50Micrometres: nozzle.d50_15bar_um,
        dv90Micrometres: nozzle.d90_15bar_um,
        sourceType: 'manufacturer',
        sourceLabel: nozzle.sourceBody || 'Catálogo Albuz',
        isMeasured: true
      });
    }

    return list;
  }

  // Para qualquer outro modelo/marca: não existem dados Dv na fonte
  return [];
}
