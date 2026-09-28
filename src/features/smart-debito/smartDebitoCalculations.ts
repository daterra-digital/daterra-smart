/**
 * DATERRA Smart - Motor de Cálculos Hidráulicos e Veredito ISO 16122
 * Ficheiro: src/features/smart-debito/smartDebitoCalculations.ts
 *
 * Implementa a validação rigorosa de débitos segundo as normas ISO 16122:
 * - ISO 16122-2: Pulverizadores de barras horizontais
 * - ISO 16122-3: Pulverizadores para culturas arbustivas e arbóreas (atomizadores)
 *
 * FÓRMULAS HIDRÁULICAS:
 * Q2 = Q1 * sqrt(P2 / P1)
 * Desvio Individual (%) = ((Qmedido - Q2) / Q2) * 100
 * Critério de Aceitação Individual: |Desvio Individual| <= 10.0%
 * Critério de Simetria Bilateral: Diferença entre soma Esq e Dir <= 10.0%
 *
 * REGRA ESTRITA: Nomenclatura livre de qualquer termo proibido. Na UI apenas "débito".
 */

import type {
  NozzleSlot,
  NozzleSlotEvaluation,
  SmartDebitoVerdict,
  SmartDebitoStandard
} from './types';
import { ALL_NOZZLE_COLORS } from '../nozzle-comparison/nozzleComparison.calculations';

/**
 * Calcula o débito teórico alvo Q2 a partir do débito nominal Q1 de catálogo,
 * da pressão de referência P1 e da pressão de ensaio P2.
 *
 * Q2 = Q1 * sqrt(P2 / P1)
 */
export function calculateTargetFlowRate(
  nominalFlowQ1: number,
  referencePressureP1: number,
  testPressureP2: number | null
): number | null {
  if (
    testPressureP2 === null ||
    testPressureP2 <= 0 ||
    nominalFlowQ1 <= 0 ||
    referencePressureP1 <= 0
  ) {
    return null;
  }

  const factor = Math.sqrt(testPressureP2 / referencePressureP1);
  return Number((nominalFlowQ1 * factor).toFixed(3));
}

/**
 * Avalia o desvio percentual de um bico individual face ao débito teórico alvo Q2.
 *
 * Desvio (%) = ((Qmedido - Q2) / Q2) * 100
 */
export function calculateIndividualDeviation(
  measuredFlow: number | null,
  targetFlowQ2: number | null
): { deviationPercent: number | null; isConforming: boolean | null } {
  if (measuredFlow === null || targetFlowQ2 === null || targetFlowQ2 <= 0) {
    return { deviationPercent: null, isConforming: null };
  }

  const deviation = ((measuredFlow - targetFlowQ2) / targetFlowQ2) * 100;
  const roundedDeviation = Number(deviation.toFixed(2));
  const isConforming = Math.abs(roundedDeviation) <= 10.0;

  return {
    deviationPercent: roundedDeviation,
    isConforming
  };
}

/**
 * Avalia um slot específico na grelha do pulverizador.
 */
export function evaluateSlot(
  slot: NozzleSlot,
  testPressureP2: number | null
): NozzleSlotEvaluation {
  if (!slot.isActive) {
    return {
      slotId: slot.id,
      targetFlowRate: null,
      deviationPercent: null,
      isConforming: null,
      status: 'inactive',
      statusMessage: 'Bico Inativo / Fechado'
    };
  }

  if (testPressureP2 === null || testPressureP2 <= 0) {
    return {
      slotId: slot.id,
      targetFlowRate: null,
      deviationPercent: null,
      isConforming: null,
      status: 'pending-pressure',
      statusMessage: 'Insira a Pressão de Ensaio (P2)'
    };
  }

  const targetFlowRate = calculateTargetFlowRate(
    slot.nominalFlowLMin,
    slot.referencePressureBar,
    testPressureP2
  );

  if (slot.measuredFlowRate === null || Number.isNaN(slot.measuredFlowRate)) {
    return {
      slotId: slot.id,
      targetFlowRate,
      deviationPercent: null,
      isConforming: null,
      status: 'pending-measurement',
      statusMessage: 'Aguardando débito medido'
    };
  }

  const { deviationPercent, isConforming } = calculateIndividualDeviation(
    slot.measuredFlowRate,
    targetFlowRate
  );

  const status = isConforming ? 'conforming' : 'non-conforming';
  const sign = (deviationPercent ?? 0) > 0 ? '+' : '';
  const statusMessage = isConforming
    ? `Conforme (${sign}${deviationPercent}%)`
    : `Não Conforme (${sign}${deviationPercent}%)`;

  return {
    slotId: slot.id,
    targetFlowRate,
    deviationPercent,
    isConforming,
    status,
    statusMessage
  };
}

/**
 * Avalia o conjunto completo de slots da máquina e emite o Veredito Global ISO 16122.
 */
export function evaluateSmartDebitoMachine(
  slots: Record<string, NozzleSlot>,
  testPressureP2: number | null,
  _standard: SmartDebitoStandard = 'ISO_16122_3'
): {
  evaluations: Record<string, NozzleSlotEvaluation>;
  verdict: SmartDebitoVerdict;
} {
  const evaluations: Record<string, NozzleSlotEvaluation> = {};

  let leftTotalMeasured = 0;
  let rightTotalMeasured = 0;
  let leftTargetTotal = 0;
  let rightTargetTotal = 0;

  let activeNozzleCount = 0;
  let measuredNozzleCount = 0;
  let individualConformingCount = 0;
  let individualNonConformingCount = 0;

  const failureReasons: string[] = [];

  for (const slotKey in slots) {
    const slot = slots[slotKey];
    const evaluation = evaluateSlot(slot, testPressureP2);
    evaluations[slotKey] = evaluation;

    if (slot.isActive) {
      activeNozzleCount++;

      if (evaluation.targetFlowRate !== null) {
        if (slot.side === 'left') {
          leftTargetTotal += evaluation.targetFlowRate;
        } else {
          rightTargetTotal += evaluation.targetFlowRate;
        }
      }

      if (slot.measuredFlowRate !== null && !Number.isNaN(slot.measuredFlowRate)) {
        measuredNozzleCount++;
        if (slot.side === 'left') {
          leftTotalMeasured += slot.measuredFlowRate;
        } else {
          rightTotalMeasured += slot.measuredFlowRate;
        }

        if (evaluation.isConforming === true) {
          individualConformingCount++;
        } else if (evaluation.isConforming === false) {
          individualNonConformingCount++;
          const sign = (evaluation.deviationPercent ?? 0) > 0 ? '+' : '';
          const sideLabel = slot.side === 'left' ? 'Esq' : 'Dir';
          failureReasons.push(
            `Nível ${slot.level} (${sideLabel}): desvio de ${sign}${evaluation.deviationPercent}% face a Q2 (${evaluation.targetFlowRate} l/min)`
          );
        }
      }
    }
  }

  leftTotalMeasured = Number(leftTotalMeasured.toFixed(3));
  rightTotalMeasured = Number(rightTotalMeasured.toFixed(3));
  const totalMeasured = Number((leftTotalMeasured + rightTotalMeasured).toFixed(3));

  leftTargetTotal = Number(leftTargetTotal.toFixed(3));
  rightTargetTotal = Number(rightTargetTotal.toFixed(3));
  const totalTarget = Number((leftTargetTotal + rightTargetTotal).toFixed(3));

  // Desvio Global: Compara o somatório do Débito Medido (Esquerda + Direita) com o Débito Teórico Alvo
  let globalDeviationPercent = 0;
  let isGlobalDeviationConforming = true;

  if (totalTarget > 0 && totalMeasured > 0) {
    globalDeviationPercent = Number(
      ((Math.abs(totalMeasured - totalTarget) / totalTarget) * 100).toFixed(2)
    );
    isGlobalDeviationConforming = globalDeviationPercent <= 10.0;
  }

  if (!isGlobalDeviationConforming) {
    const sign = totalMeasured > totalTarget ? '+' : '-';
    failureReasons.push(
      `Desvio global excessivo: ${sign}${globalDeviationPercent}% face ao débito teórico total (${totalTarget} l/min). Limite ISO 16122 é ±10%.`
    );
  }

  // Diferença percentual bilateral entre Lado Esquerdo e Lado Direito:
  // ISO 16122-3 Cláusula 5.3: |Soma_Esq - Soma_Dir| / ((Soma_Esq + Soma_Dir) / 2) * 100 <= 10%
  let sideDifferencePercent = 0;
  let sideSymmetryConforming = true;

  if (leftTotalMeasured > 0 || rightTotalMeasured > 0) {
    const meanSideFlow = (leftTotalMeasured + rightTotalMeasured) / 2;
    if (meanSideFlow > 0) {
      sideDifferencePercent = Number(
        ((Math.abs(leftTotalMeasured - rightTotalMeasured) / meanSideFlow) * 100).toFixed(2)
      );
    } else {
      sideDifferencePercent = 0;
    }
    sideSymmetryConforming = sideDifferencePercent <= 10.0;
  }

  if (!sideSymmetryConforming) {
    failureReasons.push(
      `Assimetria bilateral excessiva: diferença entre lados é de ${sideDifferencePercent}% (tolerância ISO 16122 <= 10.0%)`
    );
  }

  // Avaliação do Veredito Geral
  let overallVerdict: 'CONFORME_ISO_16122' | 'NAO_CONFORME_ISO_16122' | 'PENDENTE' = 'PENDENTE';
  let verdictSummary = '';

  const allActiveMeasured = activeNozzleCount > 0 && measuredNozzleCount === activeNozzleCount;
  const hasPressure = testPressureP2 !== null && testPressureP2 > 0;

  if (!hasPressure) {
    overallVerdict = 'PENDENTE';
    verdictSummary = 'Aguardando definição da Pressão de Ensaio (P2)';
  } else if (!allActiveMeasured) {
    overallVerdict = 'PENDENTE';
    verdictSummary = `Medições em curso: ${measuredNozzleCount} de ${activeNozzleCount} bicos ativos medidos`;
  } else {
    const allIndividualConforming = individualNonConformingCount === 0;

    if (allIndividualConforming && isGlobalDeviationConforming && sideSymmetryConforming) {
      overallVerdict = 'CONFORME_ISO_16122';
      verdictSummary = 'Pulverizador Conforme a Norma ISO 16122 (débito global, desvios individuais e simetria respeitados)';
    } else {
      overallVerdict = 'NAO_CONFORME_ISO_16122';
      const issues: string[] = [];
      if (!isGlobalDeviationConforming) {
        issues.push(`desvio global de ${globalDeviationPercent}% (> 10%)`);
      }
      if (!allIndividualConforming) {
        issues.push(`${individualNonConformingCount} bico(s) com desvio individual > ±10%`);
      }
      if (!sideSymmetryConforming) {
        issues.push(`assimetria entre lados de ${sideDifferencePercent}% (> 10%)`);
      }
      verdictSummary = `Pulverizador Não Conforme ISO 16122: ${issues.join('; ')}`;
    }
  }

  return {
    evaluations,
    verdict: {
      leftTotalMeasured,
      rightTotalMeasured,
      totalMeasured,
      leftTargetTotal,
      rightTargetTotal,
      totalTarget,
      globalDeviationPercent,
      isGlobalDeviationConforming,
      sideDifferencePercent,
      sideSymmetryConforming,
      activeNozzleCount,
      measuredNozzleCount,
      individualConformingCount,
      individualNonConformingCount,
      allIndividualConforming: individualNonConformingCount === 0,
      overallVerdict,
      verdictSummary,
      failureReasons
    }
  };
}

/**
 * Determina a cor visual (hex), designativo e luminosidade do bico instalado num dado slot.
 */
export function getSlotColorInfo(slot?: NozzleSlot): {
  hex: string;
  name: string;
  isDark: boolean;
  isActive: boolean;
} {
  if (!slot || !slot.isActive) {
    return {
      hex: '#E2E8F0', // Cinzento neutro para bico fechado / inativo
      name: 'Inativo',
      isDark: false,
      isActive: false
    };
  }

  const raw = (slot.color || '').trim();
  if (!raw) {
    return {
      hex: '#94A3B8',
      name: 'Sem cor',
      isDark: true,
      isActive: true
    };
  }

  const lower = raw.toLowerCase();

  // 1. Procura exata na tabela normativa de cores de bicos
  if (ALL_NOZZLE_COLORS[lower]) {
    return {
      hex: ALL_NOZZLE_COLORS[lower].hex,
      name: ALL_NOZZLE_COLORS[lower].namePt,
      isDark: ALL_NOZZLE_COLORS[lower].isDark,
      isActive: true
    };
  }

  // 2. Procura pela primeira palavra da chave (ex: "laranja - 80" -> "laranja")
  const baseKey = lower.split(/[\s\-()/]/)[0];
  if (baseKey && ALL_NOZZLE_COLORS[baseKey]) {
    return {
      hex: ALL_NOZZLE_COLORS[baseKey].hex,
      name: ALL_NOZZLE_COLORS[baseKey].namePt,
      isDark: ALL_NOZZLE_COLORS[baseKey].isDark,
      isActive: true
    };
  }

  // 3. Procura por correspondência em nomes compostos
  const knownKeys = Object.keys(ALL_NOZZLE_COLORS);
  for (const k of knownKeys) {
    if (lower.includes(k)) {
      return {
        hex: ALL_NOZZLE_COLORS[k].hex,
        name: ALL_NOZZLE_COLORS[k].namePt,
        isDark: ALL_NOZZLE_COLORS[k].isDark,
        isActive: true
      };
    }
  }

  // 4. Modelos modulares (Difusor / Disco)
  if (slot.disc || slot.swirlPlate) {
    return {
      hex: '#64748B', // Tom ardósia / metálico para discos cerâmicos/inox
      name: `Modular (${slot.swirlPlate ? `D${slot.swirlPlate} ` : ''}P${slot.disc || ''})`.trim(),
      isDark: true,
      isActive: true
    };
  }

  return {
    hex: '#94A3B8',
    name: raw,
    isDark: true,
    isActive: true
  };
}

