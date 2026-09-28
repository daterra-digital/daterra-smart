/**
 * DATERRA Smart - Matriz de Decisão de Volume de Calda por LWA (kLWA)
 * Enquadramento: EPPO PP 1/239 Dose Expression & DATERRA Decision Matrix
 * 
 * Esta matriz fornece a taxa de cobertura hídrica específica por LWA (kLWA)
 * expressa em L / 10 000 m² LWA (e equivalente em L/m² LWA).
 * 
 * Regras Estritas:
 * 1. O fator visual (0.75 / 0.85 / 1.00) é descritivo; o valor kLWA já incorpora este ajuste.
 * 2. kLwaLPerM2 deve ser rigorosamente igual a kLwaLPer10000M2 / 10000.
 * 3. A matriz aplica-se inicialmente a Vinha em Espaldeira.
 * 4. Não misturar com kTRV em L/m³.
 */

export const EPPO_LWA_VOLUME_MATRIX_METADATA = {
  id: 'daterra-lwa-volume-matrix-v1',
  version: '1.0.0',
  deprecated: true,
  replacedBy: 'lwa-v-daterra-v1',
  intendedMethod: 'lwa',
  unitPer10000M2: 'L/10 000 m² LWA',
  unitPerM2: 'L/m² LWA',
  sourceType: 'DATERRA technical decision matrix (Deprecated / Historical)',
  eppoContext: 'EPPO PP 1/239 dose-expression framework',
  notes: [
    'Substituída pelo modelo paramétrico contínuo LWA-V DATERRA (lwa-v-daterra-v1) para vinha.',
    'Mantida exclusivamente para rastreabilidade histórica.',
    'A matriz não substitui o rótulo, a calibração do equipamento ou a decisão técnica responsável.'
  ]
} as const;

export interface EppoLwaVolumeDecisionRow {
  cultureId: string;
  cultureLabel: string;
  conductionId: string;
  conductionLabel: string;
  phenologyId: string;
  phenologyLabel: string;
  phenologyReference: string;
  canopyDensity: 'open' | 'moderate' | 'dense';
  densityLabel: string;
  adjustmentFactor: 0.75 | 0.85 | 1;
  kLwaLPer10000M2: number;
  kLwaLPerM2: number;
  rationale: string;
}

export const EPPO_LWA_VOLUME_DECISION_MATRIX: EppoLwaVolumeDecisionRow[] = [
  // ---------------------------------------------------------------------------
  // VINHA · ESPALDEIRA (Vitis vinifera L.)
  // ---------------------------------------------------------------------------
  // A. Folhas à floração (BBCH 13–57)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'folhas_floracao',
    phenologyLabel: 'Folhas à floração',
    phenologyReference: 'BBCH 13–57',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLwaLPer10000M2: 225,
    kLwaLPerM2: 0.0225,
    rationale: 'Desenvolvimento foliar inicial antes ou até à floração, vegetação aberta.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'folhas_floracao',
    phenologyLabel: 'Folhas à floração',
    phenologyReference: 'BBCH 13–57',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLwaLPer10000M2: 255,
    kLwaLPerM2: 0.0255,
    rationale: 'Desenvolvimento foliar inicial até à floração, densidade moderada.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'folhas_floracao',
    phenologyLabel: 'Folhas à floração',
    phenologyReference: 'BBCH 13–57',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1.0,
    kLwaLPer10000M2: 300,
    kLwaLPerM2: 0.0300,
    rationale: 'Desenvolvimento foliar inicial até à floração, sebe compacta / densa.'
  },

  // B. Fecho do cacho ao pintor (BBCH 75+)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'fecho_cacho_pintor',
    phenologyLabel: 'Fecho do cacho ao pintor',
    phenologyReference: 'BBCH 75+',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLwaLPer10000M2: 340,
    kLwaLPerM2: 0.0340,
    rationale: 'Pós-floração ao fecho do cacho/início do pintor, sebe arejada.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'fecho_cacho_pintor',
    phenologyLabel: 'Fecho do cacho ao pintor',
    phenologyReference: 'BBCH 75+',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLwaLPer10000M2: 380,
    kLwaLPerM2: 0.0380,
    rationale: 'Pós-floração ao fecho do cacho/início do pintor, densidade moderada padrão.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'fecho_cacho_pintor',
    phenologyLabel: 'Fecho do cacho ao pintor',
    phenologyReference: 'BBCH 75+',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1.0,
    kLwaLPer10000M2: 450,
    kLwaLPerM2: 0.0450,
    rationale: 'Pós-floração ao fecho do cacho/início do pintor, sebe com grande vigor e densidade.'
  },

  // C. Pintor à maturação (BBCH 81–89)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'pintor_maturacao',
    phenologyLabel: 'Pintor à maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLwaLPer10000M2: 450,
    kLwaLPerM2: 0.0450,
    rationale: 'Plena maturação e desenvolvimento da parede foliar, vegetação aberta/desfolhada.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'pintor_maturacao',
    phenologyLabel: 'Pintor à maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLwaLPer10000M2: 510,
    kLwaLPerM2: 0.0510,
    rationale: 'Plena maturação e área foliar desenvolvida, densidade moderada representativa.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'pintor_maturacao',
    phenologyLabel: 'Pintor à maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1.0,
    kLwaLPer10000M2: 600,
    kLwaLPerM2: 0.0600,
    rationale: 'Pleno vigor à maturação com massa foliar máxima e sebe muito densa.'
  }
];

/**
 * Seleciona a linha exata da matriz de volume LWA.
 * Retorna null se não houver correspondência exata (sem fallback arbitrário).
 */
export function selectEppoLwaVolumeRow(
  cultureId?: string,
  conductionId?: string,
  phenologyId?: string,
  canopyDensity?: string
): EppoLwaVolumeDecisionRow | null {
  if (!cultureId || !phenologyId || !canopyDensity) {
    return null;
  }

  // Normalização de fenologia: aceita tanto com prefixo "vinha_" como sem prefixo
  const normalizedPhenology = phenologyId.startsWith('vinha_')
    ? phenologyId.replace('vinha_', '')
    : phenologyId;

  const effConduction = conductionId || (cultureId === 'vinha' ? 'espaldeira' : undefined);

  const found = EPPO_LWA_VOLUME_DECISION_MATRIX.find((row) => {
    const rowNormPhenology = row.phenologyId.startsWith('vinha_')
      ? row.phenologyId.replace('vinha_', '')
      : row.phenologyId;

    return (
      row.cultureId === cultureId &&
      (!effConduction || row.conductionId === effConduction) &&
      (row.phenologyId === phenologyId || rowNormPhenology === normalizedPhenology) &&
      row.canopyDensity === canopyDensity
    );
  });

  return found || null;
}

/**
 * Verifica se a cultura possui suporte a matriz de volume automática por LWA.
 */
export function hasEppoLwaVolumeMatrixForCulture(cultureId?: string): boolean {
  if (!cultureId) return false;
  return EPPO_LWA_VOLUME_DECISION_MATRIX.some((r) => r.cultureId === cultureId);
}
