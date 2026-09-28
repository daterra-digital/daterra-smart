/**
 * DATERRA Smart - Motor Puro da Fase C: Seleção de Bicos e Perfil de Distribuição
 * Ficheiro: src/features/calibracao-pulverizador/nozzleSelectionEngine.ts
 * 
 * Regras:
 * - Funções puras e isoladas
 * - Tratamento rigoroso de NaN, Infinity, valores nulos e negativos
 * - Simetria lateral obrigatória (configuração de 1 lado espelhada no oposto)
 * - Invariante estrito: soma por lado = débito requerido por lado (na criação e edição de provetas)
 * - Relação física pressão-débito: D2 = D1 * sqrt(P2 / P1)
 * - Proposta de menor ajuste por proximidade aos débitos nominais discretos de catálogo
 */

import type {
  NozzleCatalogEntry
} from './data/nozzleCatalog.ts';
import type {
  NozzleSelectionFilters,
  NozzleSelectionOption,
  SelectedProfileSummary
} from './calibracaoPulverizadorTypes.ts';

export const MINIMUM_LEVEL_OUTPUT_L_MIN = 0.05;
export const OUTER_VISUAL_MARGIN_RATIO = 0.05;
export const USABLE_BAR_WIDTH_RATIO = 0.90;
export const MAX_INTERNAL_FILL_RATIO = 0.95;

export type PressureStatus =
  | 'low'
  | 'low-moderate'
  | 'preferred'
  | 'high'
  | 'very-high'
  | 'extreme';

/**
 * Classifica o estado de pressão de trabalho (1 a 30 bar):
 * - 1.0 a 5.0 bar: 'low' (amarelo, "Procure uma pressão entre 8 e 15 bar.")
 * - >5.0 a <8.0 bar: 'low-moderate' (gradiente amarelo para verde, "Procure uma pressão entre 8 e 15 bar.")
 * - 8.0 a 15.0 bar: 'preferred' (verde, zona ideal)
 * - >15.0 a 20.0 bar: 'high' (gradiente verde para vermelho, "Pressão elevada. Possível risco de deriva.")
 * - >20.0 a 30.0 bar: 'very-high' (vermelho crescente, "Pressão elevada. Possível risco de deriva.")
 * - >30.0 bar (ou inválido): 'extreme' (vermelho vivo 100%, suprime valor numérico)
 */
export function getPressureStatus(pressureBar: number): PressureStatus {
  if (
    typeof pressureBar !== 'number' ||
    isNaN(pressureBar) ||
    !isFinite(pressureBar) ||
    pressureBar <= 0 ||
    pressureBar > 30.0
  ) {
    return 'extreme';
  }
  if (pressureBar <= 5.0 + 1e-4) {
    return 'low';
  }
  if (pressureBar < 8.0 - 1e-4) {
    return 'low-moderate';
  }
  if (pressureBar <= 15.0 + 1e-4) {
    return 'preferred';
  }
  if (pressureBar <= 20.0 + 1e-4) {
    return 'high';
  }
  return 'very-high';
}

/**
 * Calcula a percentagem visual de preenchimento da barra de pressão (1.0 bar a 30.0 bar):
 * Formula: ((safePressureBar - 1.0) / (30.0 - 1.0)) * 100 clamped entre 0% e 100%.
 */
export function calculatePressureGaugePercent(pressureBar: number): number {
  if (
    typeof pressureBar !== 'number' ||
    isNaN(pressureBar) ||
    !isFinite(pressureBar) ||
    pressureBar <= 0
  ) {
    return 0;
  }
  if (pressureBar >= 30.0) {
    return 100;
  }
  if (pressureBar <= 1.0) {
    return 0;
  }
  const pct = ((pressureBar - 1.0) / (30.0 - 1.0)) * 100;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(2));
}

/**
 * Converte a identificação de cor de um bico de catálogo numa cor CSS representativa para a amostra visual.
 */
export function getNozzleColorHex(colorOrSize?: string): string {
  if (!colorOrSize || typeof colorOrSize !== 'string') {
    return '#10B981';
  }
  const norm = colorOrSize.toLowerCase().trim();
  if (norm.includes('amarel') || norm.includes('yellow') || norm.includes('02')) return '#EAB308';
  if (norm.includes('laranja') || norm.includes('orange') || norm.includes('01')) return '#F97316';
  if (norm.includes('vermelh') || norm.includes('red') || norm.includes('04')) return '#EF4444';
  if (norm.includes('verde') || norm.includes('green') || norm.includes('015')) return '#22C55E';
  if (norm.includes('azul') || norm.includes('blue') || norm.includes('03')) return '#3B82F6';
  if (norm.includes('lilás') || norm.includes('lilas') || norm.includes('purple') || norm.includes('violet') || norm.includes('005')) return '#A855F7';
  if (norm.includes('castanh') || norm.includes('marrom') || norm.includes('brown') || norm.includes('05')) return '#854D0E';
  if (norm.includes('cinzent') || norm.includes('cinza') || norm.includes('gray') || norm.includes('grey') || norm.includes('06')) return '#6B7280';
  if (norm.includes('branc') || norm.includes('white')) return '#E2E8F0';
  if (norm.includes('pret') || norm.includes('black')) return '#1E293B';
  if (norm.includes('rosa') || norm.includes('pink')) return '#EC4899';
  if (norm.includes('turquesa') || norm.includes('ciano') || norm.includes('cyan')) return '#06B6D4';
  return '#10B981';
}

export interface SelectedNozzleReference {
  referenceOutputLMin: number;
  referencePressureBar: number;
}

/**
 * Calcula a pressão comum de trabalho necessária para obter um determinado débito acumulado
 * a partir do coeficiente de combinação K dos bicos selecionados:
 * K_combinação = Σ [ D1_i / √P1_i ]
 * P_necessária = ( Débito_requerido / K_combinação )²
 */
export function calculateCombinedRequiredPressureBar(
  requiredTotalOutputLMin: number,
  selectedNozzles: SelectedNozzleReference[]
): number | null {
  if (
    !Number.isFinite(requiredTotalOutputLMin) ||
    requiredTotalOutputLMin <= 0 ||
    !Array.isArray(selectedNozzles) ||
    selectedNozzles.length === 0
  ) {
    return null;
  }

  const combinationCoefficient = selectedNozzles.reduce((sum, nozzle) => {
    if (!nozzle) return NaN;
    const { referenceOutputLMin, referencePressureBar } = nozzle;

    if (
      !Number.isFinite(referenceOutputLMin) ||
      referenceOutputLMin <= 0 ||
      !Number.isFinite(referencePressureBar) ||
      referencePressureBar <= 0
    ) {
      return NaN;
    }

    return sum + referenceOutputLMin / Math.sqrt(referencePressureBar);
  }, 0);

  if (!Number.isFinite(combinationCoefficient) || combinationCoefficient <= 0) {
    return null;
  }

  const requiredPressureBar = Math.pow(requiredTotalOutputLMin / combinationCoefficient, 2);

  return Number.isFinite(requiredPressureBar) && requiredPressureBar > 0
    ? requiredPressureBar
    : null;
}

/**
 * Calcula a pressão dinâmica provisória ou final da combinação de bicos selecionados
 * face ao débito pretendido acumulado dos respetivos níveis no perfil (cálculo por um lado):
 * Débito_lado_acumulado = Σ [ D_pretendido_nível ]
 * K_lado = Σ [ D1_i / √P1_i ]
 * P = ( Débito_lado_acumulado / K_lado )²
 */
export function calculateDynamicCombinationPressure(
  outputProfile: number[],
  selectedNozzlesByLevel: Record<number, NozzleCatalogEntry | null>
): number | null {
  if (!Array.isArray(outputProfile) || outputProfile.length === 0 || !selectedNozzlesByLevel) {
    return null;
  }

  const selectedIndices = Object.keys(selectedNozzlesByLevel)
    .map(Number)
    .filter(
      (idx) =>
        !isNaN(idx) &&
        idx >= 0 &&
        idx < outputProfile.length &&
        selectedNozzlesByLevel[idx] !== null &&
        selectedNozzlesByLevel[idx] !== undefined
    );

  if (selectedIndices.length === 0) {
    return null;
  }

  const targetFlowSum = selectedIndices.reduce(
    (sum, idx) => sum + (outputProfile[idx] || 0),
    0
  );

  if (targetFlowSum <= 0) {
    return null;
  }

  const nozzlesForCalc: SelectedNozzleReference[] = selectedIndices.map((idx) => {
    const entry = selectedNozzlesByLevel[idx]!;
    const refP = entry.referencePressureBar || entry.pressureBar || 10.0;
    return {
      referenceOutputLMin: entry.nominalOutputLMin,
      referencePressureBar: refP
    };
  });

  return calculateCombinedRequiredPressureBar(targetFlowSum, nozzlesForCalc);
}

/**
 * Formata o texto e valor de exibição da pressão:
 * - Se P > 30.0 bar: NUNCA exibe o valor numérico (suprime números como 600 bar), retorna label 'Pressão demasiado elevada'.
 * - Se P <= 30.0 bar: Exibe valor real com vírgula decimal (ex.: '10,0 bar').
 */
export function formatPressureDisplay(pressureBar: number): {
  label: string;
  isExtreme: boolean;
  numericValue: number | null;
} {
  if (
    typeof pressureBar !== 'number' ||
    isNaN(pressureBar) ||
    !isFinite(pressureBar) ||
    pressureBar <= 0 ||
    pressureBar > 30.0
  ) {
    return {
      label: 'Pressão demasiado elevada',
      isExtreme: true,
      numericValue: null
    };
  }
  return {
    label: `${pressureBar.toFixed(1).replace('.', ',')} bar`,
    isExtreme: false,
    numericValue: Number(pressureBar.toFixed(1))
  };
}

/**
 * Calcula o débito requerido por lado a partir do débito total requerido da Fase B.
 * Débito por lado = Débito total requerido / 2
 */
export function calculateRequiredOutputPerSideLMin(
  requiredTotalOutputLMin: number
): number | null {
  if (
    typeof requiredTotalOutputLMin !== 'number' ||
    isNaN(requiredTotalOutputLMin) ||
    !isFinite(requiredTotalOutputLMin) ||
    requiredTotalOutputLMin <= 0
  ) {
    return null;
  }
  return requiredTotalOutputLMin / 2;
}

/**
 * Deduz o número de níveis ativos a partir do número total de bicos ativos da Fase B.
 * O número total de bicos tem de ser um inteiro par estritamente positivo.
 */
export function deriveActiveLevels(
  totalActiveNozzleCount: number
): number | null {
  if (
    typeof totalActiveNozzleCount !== 'number' ||
    isNaN(totalActiveNozzleCount) ||
    !isFinite(totalActiveNozzleCount) ||
    totalActiveNozzleCount <= 0 ||
    totalActiveNozzleCount % 2 !== 0
  ) {
    return null;
  }
  return totalActiveNozzleCount / 2;
}

/**
 * Calcula o número total de bicos ativos a partir do número de níveis confirmados ou definidos por lado.
 * Cada nível corresponde a 2 bicos em simetria lateral (esquerdo e direito).
 * Níveis tem de ser um inteiro estritamente positivo (>= 1).
 */
export function deriveTotalActiveNozzles(levels: number): number | null {
  if (
    typeof levels !== 'number' ||
    isNaN(levels) ||
    !isFinite(levels) ||
    levels <= 0 ||
    !Number.isInteger(levels)
  ) {
    return null;
  }
  return levels * 2;
}

/**
 * Calcula o débito-alvo estável por nível da copa (L/min) a partir do débito requerido por lado
 * e do número total de níveis planeados.
 * O débito-alvo por nível é invariante relativamente à adição ou remoção de bicos no percurso de seleção:
 * Alvo_nível = Débito_requerido_por_lado / Níveis_planeados
 */
export function calculateTargetOutputForLevel(
  requiredOutputPerSideLMin: number,
  plannedLevels: number
): number | null {
  if (
    typeof requiredOutputPerSideLMin !== 'number' ||
    isNaN(requiredOutputPerSideLMin) ||
    !isFinite(requiredOutputPerSideLMin) ||
    requiredOutputPerSideLMin <= 0 ||
    typeof plannedLevels !== 'number' ||
    isNaN(plannedLevels) ||
    !isFinite(plannedLevels) ||
    plannedLevels <= 0 ||
    !Number.isInteger(plannedLevels)
  ) {
    return null;
  }
  return requiredOutputPerSideLMin / plannedLevels;
}

/**
 * Avalia se o perfil de bicos está 100% completo:
 * - O número total de níveis planeados é válido (>= 1).
 * - O número de bicos na lista coincide com o número de níveis planeados.
 * - Nenhum dos níveis se encontra pendente (sem valor nulo ou indefinido).
 */
export function isProfileComplete(
  plannedLevels: number,
  nozzles: (SelectedNozzleReference | NozzleCatalogEntry | null)[]
): boolean {
  if (
    typeof plannedLevels !== 'number' ||
    isNaN(plannedLevels) ||
    !isFinite(plannedLevels) ||
    plannedLevels <= 0 ||
    !Array.isArray(nozzles) ||
    nozzles.length !== plannedLevels
  ) {
    return false;
  }
  return nozzles.every(
    (n) => n !== null && n !== undefined && typeof n === 'object'
  );
}

/**
 * Calcula a pressão de trabalho final apenas quando o perfil se encontra completo.
 * Retorna null se o perfil estiver incompleto, mantendo a interface em estado neutro.
 */
export function calculateWorkingPressureForProfile(
  requiredOutputPerSideLMin: number,
  plannedLevels: number,
  nozzles: (SelectedNozzleReference | null)[]
): number | null {
  if (!isProfileComplete(plannedLevels, nozzles)) {
    return null;
  }
  return calculateCombinedRequiredPressureBar(
    requiredOutputPerSideLMin,
    nozzles as SelectedNozzleReference[]
  );
}

/**
 * Cria o perfil uniforme inicial de débito por nível.
 * Cada nível recebe: Débito por lado / Níveis ativos.
 */
export function createUniformOutputProfile(
  requiredOutputPerSideLMin: number,
  activeLevels: number,
  minimumOutputLMin: number = MINIMUM_LEVEL_OUTPUT_L_MIN
): number[] | null {
  if (
    typeof requiredOutputPerSideLMin !== 'number' ||
    isNaN(requiredOutputPerSideLMin) ||
    !isFinite(requiredOutputPerSideLMin) ||
    requiredOutputPerSideLMin <= 0
  ) {
    return null;
  }
  if (
    typeof activeLevels !== 'number' ||
    isNaN(activeLevels) ||
    !isFinite(activeLevels) ||
    activeLevels <= 0 ||
    activeLevels % 1 !== 0
  ) {
    return null;
  }

  if (requiredOutputPerSideLMin < activeLevels * minimumOutputLMin) {
    return null;
  }

  const outputPerLevel = requiredOutputPerSideLMin / activeLevels;
  return Array(activeLevels).fill(outputPerLevel);
}

/**
 * Valida a viabilidade de distribuição com os níveis bloqueados existentes:
 * Σ(bloqueados) + (n_livres × 0.05) <= Débito por lado
 */
export function validateLockedLevelsFeasibility(
  currentOutputs: number[],
  lockedIndexes: number[],
  requiredOutputPerSideLMin: number,
  minimumOutputLMin: number = MINIMUM_LEVEL_OUTPUT_L_MIN
): boolean {
  if (
    !Array.isArray(currentOutputs) ||
    currentOutputs.length === 0 ||
    !Array.isArray(lockedIndexes) ||
    typeof requiredOutputPerSideLMin !== 'number' ||
    requiredOutputPerSideLMin <= 0
  ) {
    return false;
  }

  const lockedSum = lockedIndexes.reduce(
    (acc, idx) => acc + (currentOutputs[idx] || 0),
    0
  );
  const unlockedCount = currentOutputs.length - lockedIndexes.length;

  if (unlockedCount <= 0) {
    return Math.abs(lockedSum - requiredOutputPerSideLMin) < 1e-4;
  }

  return lockedSum + unlockedCount * minimumOutputLMin <= requiredOutputPerSideLMin + 1e-9;
}

/**
 * Calcula o débito máximo dinâmico permitido para o nível em edição `i`:
 * D_max,i = D_lado - Σ(bloqueados) - Σ(livres, k ≠ i: D_min)
 */
export function calculateMaxDynamicLevelOutput(
  currentOutputs: number[],
  editedIndex: number,
  lockedIndexes: number[],
  requiredOutputPerSideLMin: number,
  minimumOutputLMin: number = MINIMUM_LEVEL_OUTPUT_L_MIN
): number | null {
  if (
    !Array.isArray(currentOutputs) ||
    currentOutputs.length === 0 ||
    editedIndex < 0 ||
    editedIndex >= currentOutputs.length ||
    typeof requiredOutputPerSideLMin !== 'number' ||
    requiredOutputPerSideLMin <= 0
  ) {
    return null;
  }

  if (lockedIndexes.includes(editedIndex)) {
    return currentOutputs[editedIndex] ?? null;
  }

  const lockedSum = lockedIndexes
    .filter((idx) => idx !== editedIndex)
    .reduce((acc, idx) => acc + (currentOutputs[idx] || 0), 0);

  const otherUnlockedCount =
    currentOutputs.length -
    lockedIndexes.filter((idx) => idx !== editedIndex).length -
    1;

  const maxAllowed =
    requiredOutputPerSideLMin - lockedSum - otherUnlockedCount * minimumOutputLMin;

  return Math.max(minimumOutputLMin, maxAllowed);
}

/**
 * Redistribui proporcionalmente o perfil de débito quando um nível não bloqueado é ajustado:
 * - Mantém invariante: Σ(débitos) = requiredOutputPerSideLMin
 * - Respeita níveis bloqueados
 * - Garante mínimo de 0.05 L/min em cada nível livre
 */
export function redistributeOutputProfile(
  currentOutputs: number[],
  editedIndex: number,
  requestedOutputLMin: number,
  lockedIndexes: number[],
  requiredOutputPerSideLMin: number,
  minimumOutputLMin: number = MINIMUM_LEVEL_OUTPUT_L_MIN
): number[] | null {
  if (
    !Array.isArray(currentOutputs) ||
    currentOutputs.length === 0 ||
    editedIndex < 0 ||
    editedIndex >= currentOutputs.length ||
    typeof requestedOutputLMin !== 'number' ||
    isNaN(requestedOutputLMin) ||
    !isFinite(requestedOutputLMin) ||
    typeof requiredOutputPerSideLMin !== 'number' ||
    requiredOutputPerSideLMin <= 0
  ) {
    return null;
  }

  if (lockedIndexes.includes(editedIndex)) {
    return [...currentOutputs];
  }

  const maxAllowed = calculateMaxDynamicLevelOutput(
    currentOutputs,
    editedIndex,
    lockedIndexes,
    requiredOutputPerSideLMin,
    minimumOutputLMin
  );

  if (maxAllowed === null) {
    return null;
  }

  const targetVal = Math.min(Math.max(minimumOutputLMin, requestedOutputLMin), maxAllowed);
  const delta = targetVal - currentOutputs[editedIndex];

  if (Math.abs(delta) < 1e-9) {
    return [...currentOutputs];
  }

  const otherUnlockedIndices = currentOutputs
    .map((_, i) => i)
    .filter((i) => i !== editedIndex && !lockedIndexes.includes(i));

  if (otherUnlockedIndices.length === 0) {
    if (Math.abs(delta) > 1e-4) {
      return null; // Sem graus de liberdade para absorver a variação
    }
    return [...currentOutputs];
  }

  const newOutputs = [...currentOutputs];
  newOutputs[editedIndex] = targetVal;

  let remainingDelta = -delta;
  let activePool = [...otherUnlockedIndices];

  // Algoritmo iterativo de redistribuição proporcional com clamping nos mínimos
  while (Math.abs(remainingDelta) > 1e-9 && activePool.length > 0) {
    const isDecreasing = remainingDelta < 0;
    const poolCapacitySum = activePool.reduce((sum, idx) => {
      const current = newOutputs[idx];
      return sum + (isDecreasing ? Math.max(0, current - minimumOutputLMin) : current);
    }, 0);

    if (poolCapacitySum <= 1e-9) {
      const share = remainingDelta / activePool.length;
      for (const idx of activePool) {
        newOutputs[idx] = Math.max(minimumOutputLMin, newOutputs[idx] + share);
      }
      break;
    }

    let clampedAny = false;
    const nextPool: number[] = [];

    for (const idx of activePool) {
      const current = newOutputs[idx];
      const weight = (isDecreasing ? Math.max(0, current - minimumOutputLMin) : current) / poolCapacitySum;
      const proposedChange = remainingDelta * weight;
      const proposedValue = current + proposedChange;

      if (proposedValue <= minimumOutputLMin + 1e-9) {
        const actualChange = minimumOutputLMin - current;
        remainingDelta -= actualChange;
        newOutputs[idx] = minimumOutputLMin;
        clampedAny = true;
      } else {
        newOutputs[idx] = proposedValue;
        nextPool.push(idx);
      }
    }

    if (!clampedAny) {
      remainingDelta = 0;
      break;
    }

    activePool = nextPool;
  }

  // Ajuste fino de resíduo de vírgula flutuante no último nível desbloqueado disponível
  const totalSum = newOutputs.reduce((acc, v) => acc + v, 0);
  const residual = requiredOutputPerSideLMin - totalSum;
  if (Math.abs(residual) > 1e-12 && otherUnlockedIndices.length > 0) {
    const lastUnlocked = otherUnlockedIndices[otherUnlockedIndices.length - 1];
    newOutputs[lastUnlocked] = Math.max(minimumOutputLMin, newOutputs[lastUnlocked] + residual);
  }

  return newOutputs;
}

/**
 * Calcula o débito estimado através da relação física pressão–débito:
 * D2 = D1 * sqrt(P2 / P1)
 */
export function calculateEstimatedOutput(
  nominalOutputLMin: number,
  referencePressureBar: number,
  workingPressureBar: number
): number | null {
  if (
    typeof nominalOutputLMin !== 'number' ||
    isNaN(nominalOutputLMin) ||
    nominalOutputLMin <= 0 ||
    typeof referencePressureBar !== 'number' ||
    isNaN(referencePressureBar) ||
    referencePressureBar <= 0 ||
    typeof workingPressureBar !== 'number' ||
    isNaN(workingPressureBar) ||
    workingPressureBar <= 0
  ) {
    return null;
  }

  if (Math.abs(workingPressureBar - referencePressureBar) < 1e-4) {
    return nominalOutputLMin;
  }

  const estimated = nominalOutputLMin * Math.sqrt(workingPressureBar / referencePressureBar);
  return Number(estimated.toFixed(4));
}

/**
 * Valida se um bico é elegível para a pressão de trabalho selecionada.
 * Regras:
 * 1. Intervalo documentado no catálogo pelo fabricante (pressureMinBar a pressureMaxBar).
 * 2. Fallback universal DATERRA:
 *    - Fenda plana (>= 110° ou tipo 'flat-fan'): 1.0 a 6.0 bar
 *    - Cone (< 90° ou 'hollow-cone' / 'full-cone'): 6.0 a 25.0 bar
 *    - Outros: 5.0 a 25.0 bar
 */
export function isNozzleEligibleAtPressure(
  entry: NozzleCatalogEntry,
  workingPressureBar: number
): boolean {
  if (
    typeof workingPressureBar !== 'number' ||
    isNaN(workingPressureBar) ||
    workingPressureBar <= 0
  ) {
    return false;
  }

  // 1. Limites explícitos documentados pelo fabricante
  if (
    typeof entry.pressureMinBar === 'number' &&
    entry.pressureMinBar > 0 &&
    typeof entry.pressureMaxBar === 'number' &&
    entry.pressureMaxBar > 0
  ) {
    return (
      workingPressureBar >= entry.pressureMinBar - 0.05 &&
      workingPressureBar <= entry.pressureMaxBar + 0.05
    );
  }

  // 2. Regras universais de fallback DATERRA
  const angleNum = typeof entry.sprayAngleDeg === 'number' ? entry.sprayAngleDeg : Number(entry.sprayAngleDeg);
  const isFlatFan = entry.nozzleType === 'flat-fan' || (!isNaN(angleNum) && angleNum >= 110);
  const isCone = entry.nozzleType === 'hollow-cone' || entry.nozzleType === 'full-cone' || (!isNaN(angleNum) && angleNum < 90);

  if (isFlatFan) {
    return workingPressureBar >= 1.0 - 0.05 && workingPressureBar <= 6.0 + 0.05;
  }

  if (isCone) {
    return workingPressureBar >= 5.0 - 0.05 && workingPressureBar <= 25.0 + 0.05;
  }

  return workingPressureBar >= 5.0 - 0.05 && workingPressureBar <= 25.0 + 0.05;
}

/**
 * Encontra opções de bicos compatíveis no catálogo filtrado para um débito-alvo.
 * No modo de combinação de bicos, a pressão provisória não elimina bicos elegíveis do catálogo
 * (skipPressureEligibilityFilter: true), permitindo ao utilizador escolher calibres livremente
 * para que a pressão comum da máquina seja recalculada em conformidade.
 * Ordena por proximidade absoluta ao débito pretendido.
 */
export function findCompatibleNozzleOptions(
  targetOutputLMin: number,
  pressureBar: number,
  catalog: NozzleCatalogEntry[],
  filters: NozzleSelectionFilters,
  optionsConfig?: { skipPressureEligibilityFilter?: boolean }
): NozzleSelectionOption[] {
  if (
    typeof targetOutputLMin !== 'number' ||
    isNaN(targetOutputLMin) ||
    targetOutputLMin <= 0 ||
    !Array.isArray(catalog)
  ) {
    return [];
  }

  const effectivePressure =
    typeof pressureBar === 'number' && !isNaN(pressureBar) && pressureBar > 0 && pressureBar <= 30.0
      ? pressureBar
      : 10.0;

  const skipPressureFilter = optionsConfig?.skipPressureEligibilityFilter === true;
  const { manufacturers, familyPreference } = filters;

  const filtered = catalog.filter((entry) => {
    // 1. Filtro de Fabricantes (se definido, até 3)
    if (manufacturers && manufacturers.length > 0) {
      if (!manufacturers.includes(entry.manufacturerName)) {
        return false;
      }
    }

    // 2. Filtro de Tipo/Família
    if (familyPreference === 'hollow-cone' && entry.nozzleType !== 'hollow-cone') {
      return false;
    }
    if (familyPreference === 'full-cone' && entry.nozzleType !== 'full-cone') {
      return false;
    }

    // 3. Elegibilidade de Pressão (apenas quando não se salta o filtro de pressão rígida)
    if (!skipPressureFilter && !isNozzleEligibleAtPressure(entry, effectivePressure)) {
      return false;
    }

    // 4. Validade da entrada
    if (!entry.sourceName || !entry.sourceVersion || entry.nominalOutputLMin <= 0) {
      return false;
    }

    return true;
  });

  const options: NozzleSelectionOption[] = [];

  for (const entry of filtered) {
    const p1 = entry.referencePressureBar || entry.pressureBar;
    const calcPressure = effectivePressure;
    const estimated = calculateEstimatedOutput(entry.nominalOutputLMin, p1, calcPressure);
    if (estimated === null || estimated <= 0) continue;

    const differenceAbsoluteLMin = Math.abs(estimated - targetOutputLMin);
    const differencePercent = ((estimated - targetOutputLMin) / targetOutputLMin) * 100;
    const isNominal = Math.abs(calcPressure - p1) < 1e-4;

    options.push({
      entry,
      targetOutputLMin,
      estimatedOutputLMin: estimated,
      differenceAbsoluteLMin,
      differencePercent,
      isNominal
    });
  }

  // Ordenação: 1. Hierarquia de tipo (cone vazio primeiro), 2. Menor diferença percentual absoluta
  options.sort((a, b) => {
    if (a.entry.nozzleType !== b.entry.nozzleType) {
      if (a.entry.nozzleType === 'hollow-cone') return -1;
      if (b.entry.nozzleType === 'hollow-cone') return 1;
      if (a.entry.nozzleType === 'full-cone') return -1;
      if (b.entry.nozzleType === 'full-cone') return 1;
    }

    if (Math.abs(a.differenceAbsoluteLMin - b.differenceAbsoluteLMin) > 1e-4) {
      return a.differenceAbsoluteLMin - b.differenceAbsoluteLMin;
    }

    return a.entry.model.localeCompare(b.entry.model);
  });

  return options;
}

/**
 * Sugere a pressão de trabalho inicial a partir do perfil uniforme:
 * - Prioridade 1: 7,0 a 15,0 bar (mais próxima de 10,0 bar; desempate favorece a pressão inferior)
 * - Prioridade 2: >15,0 a 20,0 bar (mais próxima de 10,0 bar; desempate favorece a pressão inferior)
 */
export function findSuggestedPressure(
  uniformProfile: number[],
  catalog: NozzleCatalogEntry[],
  filters: NozzleSelectionFilters
): number | null {
  if (
    !Array.isArray(uniformProfile) ||
    uniformProfile.length === 0 ||
    !Array.isArray(catalog) ||
    catalog.length === 0
  ) {
    return null;
  }

  const candidatePressures = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const pressureSatisfiesAll = (p: number): boolean => {
    return uniformProfile.every((target) => {
      const opts = findCompatibleNozzleOptions(target, p, catalog, filters);
      return opts.length > 0;
    });
  };

  const sortClosestTo10 = (a: number, b: number): number => {
    const distA = Math.abs(a - 10.0);
    const distB = Math.abs(b - 10.0);
    if (Math.abs(distA - distB) < 1e-9) {
      return a - b;
    }
    return distA - distB;
  };

  // 1. Pesquisa na zona preferencial [7.0, 15.0] bar
  const prefCandidates = candidatePressures
    .filter((p) => p >= 7.0 && p <= 15.0 && pressureSatisfiesAll(p))
    .sort(sortClosestTo10);

  if (prefCandidates.length > 0) {
    return prefCandidates[0];
  }

  // 2. Pesquisa na zona de aviso (>15.0, 20.0] bar
  const warnCandidates = candidatePressures
    .filter((p) => p > 15.0 && p <= 20.0 && pressureSatisfiesAll(p))
    .sort(sortClosestTo10);

  if (warnCandidates.length > 0) {
    return warnCandidates[0];
  }

  return null;
}

/**
 * Calcula a diferença percentual de seleção entre o débito nominal/estimado do bico e o débito pretendido:
 * ((Débito - Débito pretendido) / Débito pretendido) × 100
 */
export function calculateNozzleSelectionDifferencePercent(
  targetOutputLMin: number,
  actualOutputLMin: number
): number | null {
  if (
    typeof targetOutputLMin !== 'number' ||
    isNaN(targetOutputLMin) ||
    targetOutputLMin <= 0 ||
    typeof actualOutputLMin !== 'number' ||
    isNaN(actualOutputLMin) ||
    actualOutputLMin < 0
  ) {
    return null;
  }

  return ((actualOutputLMin - targetOutputLMin) / targetOutputLMin) * 100;
}

/**
 * Calcula o somatório do débito selecionado por lado (nominal ou estimado).
 */
export function calculateSelectedSideNominalTotal(
  selectedEntries: (NozzleCatalogEntry | null)[],
  workingPressureBar?: number
): number | null {
  if (!Array.isArray(selectedEntries) || selectedEntries.length === 0) {
    return null;
  }

  if (
    selectedEntries.some(
      (e) => !e || typeof e.nominalOutputLMin !== 'number' || isNaN(e.nominalOutputLMin) || e.nominalOutputLMin <= 0
    )
  ) {
    return null;
  }

  const sum = selectedEntries.reduce((acc, e) => {
    if (!e) return acc;
    if (workingPressureBar && workingPressureBar > 0) {
      const p1 = e.referencePressureBar || e.pressureBar;
      const est = calculateEstimatedOutput(e.nominalOutputLMin, p1, workingPressureBar);
      return acc + (est || e.nominalOutputLMin);
    }
    return acc + e.nominalOutputLMin;
  }, 0);

  return Number(sum.toFixed(4));
}

/**
 * Calcula o somatório do débito total selecionado (ambos os lados):
 * 2 × Débito selecionado por lado
 */
export function calculateSelectedProfileNominalTotal(
  selectedEntries: (NozzleCatalogEntry | null)[],
  workingPressureBar?: number
): number | null {
  const sideTotal = calculateSelectedSideNominalTotal(selectedEntries, workingPressureBar);
  if (sideTotal === null) {
    return null;
  }
  return Number((2 * sideTotal).toFixed(4));
}

/**
 * Calcula a diferença face ao débito total requerido da Fase B.
 */
export function calculateSelectedProfileDifference(
  requiredTotalOutputLMin: number,
  selectedProfileNominalTotalLMin: number
): SelectedProfileSummary | null {
  if (
    typeof requiredTotalOutputLMin !== 'number' ||
    isNaN(requiredTotalOutputLMin) ||
    requiredTotalOutputLMin <= 0 ||
    typeof selectedProfileNominalTotalLMin !== 'number' ||
    isNaN(selectedProfileNominalTotalLMin) ||
    selectedProfileNominalTotalLMin <= 0
  ) {
    return null;
  }

  const absoluteDifferenceLMin = selectedProfileNominalTotalLMin - requiredTotalOutputLMin;
  const differencePercent = (absoluteDifferenceLMin / requiredTotalOutputLMin) * 100;

  return {
    requiredTotalOutputLMin,
    selectedNominalTotalOutputLMin: selectedProfileNominalTotalLMin,
    absoluteDifferenceLMin,
    differencePercent
  };
}

/**
 * Calcula a proposta de menor ajuste possível:
 * Mantém o perfil o mais próximo possível dos débitos disponíveis no catálogo,
 * respeitando níveis bloqueados, mínimo de 0.05 L/min e simetria lateral.
 */
export function proposeClosestAvailableOutputProfile(
  currentOutputs: number[],
  lockedIndexes: number[],
  _requiredOutputPerSideLMin: number,
  minimumOutputLMin: number = MINIMUM_LEVEL_OUTPUT_L_MIN,
  availableOutputsByLevel: number[][]
): number[] | null {
  if (
    !Array.isArray(currentOutputs) ||
    currentOutputs.length === 0 ||
    !Array.isArray(availableOutputsByLevel)
  ) {
    return null;
  }

  const proposed: number[] = [];

  for (let i = 0; i < currentOutputs.length; i++) {
    const currentVal = currentOutputs[i];

    if (lockedIndexes.includes(i)) {
      proposed.push(currentVal);
      continue;
    }

    const available = availableOutputsByLevel[i] || [];
    const validCandidates = available.filter((v) => v >= minimumOutputLMin);

    if (validCandidates.length === 0) {
      proposed.push(Math.max(minimumOutputLMin, currentVal));
    } else {
      validCandidates.sort((a, b) => Math.abs(a - currentVal) - Math.abs(b - currentVal));
      proposed.push(validCandidates[0]);
    }
  }

  return proposed;
}

export interface DistributionProfileScale {
  minimumLMin: number;
  middleLMin: number;
  maximumLMin: number;
}

/**
 * Calcula a escala horizontal comum para as barras de débito do perfil de distribuição.
 * Margem esquerda de 5%, zona útil de 90%, margem direita de 5%.
 * Preenchimento máximo de 95% da zona útil.
 */
export function calculateDistributionScale(
  profileOutputs: number[],
  targetFillRatio: number = 0.95
): DistributionProfileScale {
  if (!Array.isArray(profileOutputs) || profileOutputs.length === 0) {
    return { minimumLMin: 0, middleLMin: 0.5, maximumLMin: 1.0 };
  }

  const validOutputs = profileOutputs.filter((v) => typeof v === 'number' && !isNaN(v) && v > 0);
  const maxOutput = validOutputs.length > 0 ? Math.max(...validOutputs) : 0;

  if (maxOutput <= 0) {
    return { minimumLMin: 0, middleLMin: 0.5, maximumLMin: 1.0 };
  }

  const ratio = targetFillRatio > 0 ? targetFillRatio : 0.95;
  let scaleMaximum = Math.ceil((maxOutput / ratio) / 0.05) * 0.05;
  scaleMaximum = Number(scaleMaximum.toFixed(4));

  if (scaleMaximum < maxOutput) {
    scaleMaximum = maxOutput;
  }

  const scaleMiddle = Number((scaleMaximum / 2).toFixed(4));

  return {
    minimumLMin: 0,
    middleLMin: scaleMiddle,
    maximumLMin: scaleMaximum
  };
}

/**
 * Calcula a razão de preenchimento (fill ratio) de uma barra de nível face à escala máxima comum:
 * fillRatio = outputForLevel / scaleMaximum
 */
export function calculateLevelBarFillRatio(
  outputForLevel: number,
  scaleMaximum: number
): number {
  if (
    typeof outputForLevel !== 'number' ||
    isNaN(outputForLevel) ||
    outputForLevel <= 0 ||
    typeof scaleMaximum !== 'number' ||
    isNaN(scaleMaximum) ||
    scaleMaximum <= 0
  ) {
    return 0;
  }

  const ratio = outputForLevel / scaleMaximum;
  return Math.min(1, Math.max(0, ratio));
}

/**
 * Calcula a percentagem de largura visual da água (0% a 90% do contentor, alinhada a left: 5%).
 */
export function calculateVisualBarWidthPercent(
  outputForLevel: number,
  scaleMaximum: number
): number {
  const fillRatio = calculateLevelBarFillRatio(outputForLevel, scaleMaximum);
  return Number((fillRatio * 90).toFixed(2));
}
