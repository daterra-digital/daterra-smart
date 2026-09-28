/**
 * DATERRA Smart - Matriz Técnica de Decisão k (TRV - EPPO PP 1/239)
 * 
 * Fonte: Matriz técnica de calibração DATERRA Smart.
 * Enquadramento metodológico: EPPO PP 1/239 (Dose expression for plant protection products).
 * 
 * Regra Crítica:
 * - O fator visual (0,75, 0,85, 1,00) é meramente descritivo e contextual.
 * - O valor `kLPerM3` já é o valor final determinado para a linha.
 * - NUNCA multiplicar `kLPerM3` novamente pelo fator de ajuste.
 */

export interface EppoKDecisionRow {
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
  kLPerM3: number;
  rationale: string;
}

export const EPPO_K_MATRIX_METADATA = {
  id: 'daterra-k-matrix-v1',
  version: '1.0.0',
  unit: 'L/m³',
  intendedMethod: 'trv',
  sourceType: 'DATERRA technical decision matrix',
  eppoContext: 'EPPO PP 1/239 dose-expression framework',
  notes: [
    'O fator visual é descritivo e não deve ser aplicado novamente ao k final.',
    'Os valores exigem confirmação com rótulo, equipamento, condições locais e técnico responsável.'
  ]
} as const;

export const EPPO_K_DECISION_MATRIX: EppoKDecisionRow[] = [
  // -------------------------------------------------------------------------
  // 1. VINHA (Espaldeira) - Harmonizado com os 5 estádios do LWA
  // -------------------------------------------------------------------------
  // Grupo 1: Repouso a olho de algodão (BBCH 00–05)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_repouso_algodao',
    phenologyLabel: 'Repouso a olho de algodão',
    phenologyReference: 'BBCH 00–05',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.015,
    rationale: 'Repouso vegetativo ao início do abrolhamento.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_repouso_algodao',
    phenologyLabel: 'Repouso a olho de algodão',
    phenologyReference: 'BBCH 00–05',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.016,
    rationale: 'Início de inchaço dos gomos.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_repouso_algodao',
    phenologyLabel: 'Repouso a olho de algodão',
    phenologyReference: 'BBCH 00–05',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.018,
    rationale: 'Olho de algodão bem visível.'
  },
  // Grupo 2: Folhas jovens a folhas livres (BBCH 09–15)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_folhas_jovens',
    phenologyLabel: 'Folhas jovens a folhas livres',
    phenologyReference: 'BBCH 09–15',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.015,
    rationale: 'Vegetação incipiente, folhas jovens expandidas.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_folhas_jovens',
    phenologyLabel: 'Folhas jovens a folhas livres',
    phenologyReference: 'BBCH 09–15',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.018,
    rationale: 'Folhas livres e primeiros pâmpanos formados.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_folhas_jovens',
    phenologyLabel: 'Folhas jovens a folhas livres',
    phenologyReference: 'BBCH 09–15',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.021,
    rationale: 'Vegetação jovem vigorosa em início de estação.'
  },
  // Grupo 3: Cachos visíveis a floração (BBCH 53–69)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_cachos_floracao',
    phenologyLabel: 'Cachos visíveis a floração',
    phenologyReference: 'BBCH 53–69',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.018,
    rationale: 'Cachos separados e início da floração.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_cachos_floracao',
    phenologyLabel: 'Cachos visíveis a floração',
    phenologyReference: 'BBCH 53–69',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.022,
    rationale: 'Plena floração a queda dos capuzes.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_cachos_floracao',
    phenologyLabel: 'Cachos visíveis a floração',
    phenologyReference: 'BBCH 53–69',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.026,
    rationale: 'Elevada massa foliar no período crítico de floração.'
  },
  // Grupo 4: Bago de chumbo a ervilha (BBCH 71–75)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_bago_ervilha',
    phenologyLabel: 'Bago de chumbo a ervilha',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.024,
    rationale: 'Crescimento dos bagos e fecho preliminar do cacho.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_bago_ervilha',
    phenologyLabel: 'Bago de chumbo a ervilha',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.028,
    rationale: 'Volume equilibrado para penetração ao nível dos cachos.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_bago_ervilha',
    phenologyLabel: 'Bago de chumbo a ervilha',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.033,
    rationale: 'Massa foliar substancial a exigir boa penetração no dossel.'
  },
  // Grupo 5: Pintor à maturação (BBCH 77–89)
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_pintor_maturacao',
    phenologyLabel: 'Pintor à maturação',
    phenologyReference: 'BBCH 77–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.030,
    rationale: 'Copa com desfolha parcial na zona dos cachos.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_pintor_maturacao',
    phenologyLabel: 'Pintor à maturação',
    phenologyReference: 'BBCH 77–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.034,
    rationale: 'Volume para assegurar penetração homogénea e cobertura dos bagos em maturação.'
  },
  {
    cultureId: 'vinha',
    cultureLabel: 'Vinha',
    conductionId: 'espaldeira',
    conductionLabel: 'Espaldeira',
    phenologyId: 'vinha_pintor_maturacao',
    phenologyLabel: 'Pintor à maturação',
    phenologyReference: 'BBCH 77–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.040,
    rationale: 'Exigência máxima de volume para parede foliar completa e prevenção tardia.'
  },

  // -------------------------------------------------------------------------
  // 2. PEREIRA (Sebe / parede)
  // -------------------------------------------------------------------------
  // Grupo 1: Abrolhamento e botões florais (BBCH 51–59)
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_abrolhamento_botoes',
    phenologyLabel: 'Abrolhamento e botões florais',
    phenologyReference: 'BBCH 51–59',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.018,
    rationale: 'Abertura de gomos e botões visíveis.'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_abrolhamento_botoes',
    phenologyLabel: 'Abrolhamento e botões florais',
    phenologyReference: 'BBCH 51–59',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.020,
    rationale: 'Botão branco a balão.'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_abrolhamento_botoes',
    phenologyLabel: 'Abrolhamento e botões florais',
    phenologyReference: 'BBCH 51–59',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.024,
    rationale: 'Copa densa antes da floração.'
  },
  // Grupo 2: Desenvolvimento inicial / pós-floração (BBCH 69–72)
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.022,
    rationale: 'Pouca massa foliar pós-queda das pétalas.'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.025,
    rationale: 'Volume reduzido face à base.'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.030,
    rationale: 'Copa jovem adensada.'
  },
  // Grupo 3: Crescimento dos frutos (BBCH 74–78)
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_crescimento_fruto',
    phenologyLabel: 'Crescimento dos frutos',
    phenologyReference: 'BBCH 74–78',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.026,
    rationale: 'Fruto em crescimento (calibre T a noz).'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_crescimento_fruto',
    phenologyLabel: 'Crescimento dos frutos',
    phenologyReference: 'BBCH 74–78',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.030,
    rationale: 'Dossel em desenvolvimento ativo.'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_crescimento_fruto',
    phenologyLabel: 'Crescimento dos frutos',
    phenologyReference: 'BBCH 74–78',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.035,
    rationale: 'Cobertura densa de folhagem e ramos.'
  },
  // Grupo 4: Pleno crescimento / maturação (BBCH 81–89)
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_pleno_maturacao',
    phenologyLabel: 'Pleno crescimento / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.030,
    rationale: 'Copa aberta mantida por poda de verão.'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_pleno_maturacao',
    phenologyLabel: 'Pleno crescimento / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.033,
    rationale: 'Valor de referência da matriz para pomar adulto.'
  },
  {
    cultureId: 'pereira',
    cultureLabel: 'Pereira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'pereira_pleno_maturacao',
    phenologyLabel: 'Pleno crescimento / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.040,
    rationale: 'Maior necessidade de penetração em sebe espessa.'
  },

  // -------------------------------------------------------------------------
  // 3. MACIEIRA (Sebe / parede)
  // -------------------------------------------------------------------------
  // Grupo 1: Abrolhamento e botões florais (BBCH 51–59)
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_abrolhamento_botoes',
    phenologyLabel: 'Abrolhamento e botões florais',
    phenologyReference: 'BBCH 51–59',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.018,
    rationale: 'Botões visíveis e início de abertura.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_abrolhamento_botoes',
    phenologyLabel: 'Abrolhamento e botões florais',
    phenologyReference: 'BBCH 51–59',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.020,
    rationale: 'Botão rosa a balão.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_abrolhamento_botoes',
    phenologyLabel: 'Abrolhamento e botões florais',
    phenologyReference: 'BBCH 51–59',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.024,
    rationale: 'Dossel denso pré-floração.'
  },
  // Grupo 2: Desenvolvimento inicial / pós-floração (BBCH 69–72)
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.022,
    rationale: 'Cobertura inicial reduzida pós-abertura de gomos.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.025,
    rationale: 'Densidade foliar padrão de início de estação.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.030,
    rationale: 'Vigor inicial elevado ou copa densa.'
  },
  // Grupo 3: Crescimento do fruto (BBCH 74–78)
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 74–78',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.026,
    rationale: 'Fruto em calibre T a noz.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 74–78',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.029,
    rationale: 'Crescimento ativo de lançamentos e maçãs.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 74–78',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.035,
    rationale: 'Massa foliar espessa em pleno verão.'
  },
  // Grupo 4: Pleno vigor / maturação (BBCH 71–89)
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.030,
    rationale: 'Copa adulta mantida aberta por poda.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.033,
    rationale: 'Valor de referência da matriz para macieira adulta.'
  },
  {
    cultureId: 'macieira',
    cultureLabel: 'Macieira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'macieira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.040,
    rationale: 'Maior necessidade de penetração em sebe frondosa.'
  },

  // -------------------------------------------------------------------------
  // 4. PESSEGUEIRO (Vaso / taça)
  // -------------------------------------------------------------------------
  // Grupo 1: Botão rosa à floração (BBCH 57–65)
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_botoes_floracao',
    phenologyLabel: 'Botão rosa à floração',
    phenologyReference: 'BBCH 57–65',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.018,
    rationale: 'Botões rosa e abertura floral.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_botoes_floracao',
    phenologyLabel: 'Botão rosa à floração',
    phenologyReference: 'BBCH 57–65',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.021,
    rationale: 'Floração plena em ramos mistos.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_botoes_floracao',
    phenologyLabel: 'Botão rosa à floração',
    phenologyReference: 'BBCH 57–65',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.025,
    rationale: 'Copa densa de prunóidea em floração.'
  },
  // Grupo 2: Desenvolvimento inicial / pós-floração (BBCH 69–72)
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.022,
    rationale: 'Estágio inicial de brotamento foliar pós-queda das pétalas.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.025,
    rationale: 'Brotamento padrão inicial e vingamento.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.030,
    rationale: 'Fecho foliar precoce.'
  },
  // Grupo 3: Endurecimento do caroço (BBCH 75–77)
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_endurecimento_caroco',
    phenologyLabel: 'Endurecimento do caroço',
    phenologyReference: 'BBCH 75–77',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.027,
    rationale: 'Fase de endurecimento do endocarpo.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_endurecimento_caroco',
    phenologyLabel: 'Endurecimento do caroço',
    phenologyReference: 'BBCH 75–77',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.031,
    rationale: 'Crescimento ativo de lançamentos e frutos.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_endurecimento_caroco',
    phenologyLabel: 'Endurecimento do caroço',
    phenologyReference: 'BBCH 75–77',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.037,
    rationale: 'Copa volumosa com forte exigência de penetração.'
  },
  // Grupo 4: Pleno vigor / maturação (BBCH 71–89)
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.026,
    rationale: 'Condução em vaso aberto com centro limpo.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.030,
    rationale: 'Densidade intermédia para prunóideas adultas.'
  },
  {
    cultureId: 'pessegueiro',
    cultureLabel: 'Pessegueiro',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'pessegueiro_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.035,
    rationale: 'Copa densa; maior barreira à penetração.'
  },

  // -------------------------------------------------------------------------
  // 5. CEREJEIRA (Vaso / taça)
  // -------------------------------------------------------------------------
  // Grupo 1: Botão branco à floração (BBCH 55–65)
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_botoes_floracao',
    phenologyLabel: 'Botão branco à floração',
    phenologyReference: 'BBCH 55–65',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.016,
    rationale: 'Botões brancos e abertura floral.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_botoes_floracao',
    phenologyLabel: 'Botão branco à floração',
    phenologyReference: 'BBCH 55–65',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.019,
    rationale: 'Plena floração de cerejal.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_botoes_floracao',
    phenologyLabel: 'Botão branco à floração',
    phenologyReference: 'BBCH 55–65',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.023,
    rationale: 'Copa densa e florescimento intenso.'
  },
  // Grupo 2: Desenvolvimento inicial / pós-floração (BBCH 69–72)
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.020,
    rationale: 'Brotamento e folhagem inicial pós-floração.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.024,
    rationale: 'Desenvolvimento padrão de folhagem.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 69–72',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.030,
    rationale: 'Fecho foliar precoce.'
  },
  // Grupo 3: Crescimento do fruto (BBCH 73–77)
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 73–77',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.025,
    rationale: 'Bago de chumbo a endurecimento do caroço.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 73–77',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.030,
    rationale: 'Dossel em expansão e frutos a crescer.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 73–77',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.036,
    rationale: 'Forte densidade foliar em copa adulta.'
  },
  // Grupo 4: Pleno vigor / maturação (BBCH 81–89)
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.026,
    rationale: 'Copa em vaso aberta.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.030,
    rationale: 'Copa intermédia.'
  },
  {
    cultureId: 'cerejeira',
    cultureLabel: 'Cerejeira',
    conductionId: 'vaso_taca',
    conductionLabel: 'Vaso / taça',
    phenologyId: 'cerejeira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.035,
    rationale: 'Maior resistência à penetração.'
  },

  // -------------------------------------------------------------------------
  // 6. AMENDOEIRA (Sebe / parede)
  // -------------------------------------------------------------------------
  // Grupo 1: Floração e vingamento (BBCH 61–69)
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_floracao',
    phenologyLabel: 'Floração e vingamento',
    phenologyReference: 'BBCH 61–69',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.015,
    rationale: 'Floração precoce em ramos desfolhados.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_floracao',
    phenologyLabel: 'Floração e vingamento',
    phenologyReference: 'BBCH 61–69',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.017,
    rationale: 'Plena floração e primeiros lançamentos.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_floracao',
    phenologyLabel: 'Floração e vingamento',
    phenologyReference: 'BBCH 61–69',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.020,
    rationale: 'Copa adensada em floração.'
  },
  // Grupo 2: Desenvolvimento inicial / pós-floração (BBCH 71–73)
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 71–73',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.018,
    rationale: 'Folhas incipientes e copa muito aberta.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 71–73',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.022,
    rationale: 'Brotamento inicial de folhagem fina.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_inicio_pos_floracao',
    phenologyLabel: 'Desenvolvimento inicial / pós-floração',
    phenologyReference: 'BBCH 71–73',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.028,
    rationale: 'Sebe mecanizada precoce adensada.'
  },
  // Grupo 3: Crescimento do fruto (BBCH 74–77)
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 74–77',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.023,
    rationale: 'Endurecimento do caroço e expansão foliar.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 74–77',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.028,
    rationale: 'Sebe em crescimento foliar vigoroso.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 74–77',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.034,
    rationale: 'Sebe contínua fechada.'
  },
  // Grupo 4: Pleno vigor / maturação (BBCH 81–89)
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.022,
    rationale: 'Sebe mantida arejada.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.025,
    rationale: 'Sebe de amendoal intensivo equilibrada.'
  },
  {
    cultureId: 'amendoeira',
    cultureLabel: 'Amendoeira',
    conductionId: 'sebe_parede',
    conductionLabel: 'Sebe / parede',
    phenologyId: 'amendoeira_pleno_maturacao',
    phenologyLabel: 'Pleno vigor / maturação',
    phenologyReference: 'BBCH 81–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.030,
    rationale: 'Sebe densa em maturação.'
  },

  // -------------------------------------------------------------------------
  // 7. CITRINOS (Vaso / arredondado)
  // -------------------------------------------------------------------------
  // Grupo 1: Pós-poda / início vegetativo
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_pos_poda_inicio',
    phenologyLabel: 'Pós-poda / início vegetativo',
    phenologyReference: 'Pós-poda',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.026,
    rationale: 'Aplicação conservadora após poda.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_pos_poda_inicio',
    phenologyLabel: 'Pós-poda / início vegetativo',
    phenologyReference: 'Pós-poda',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.030,
    rationale: 'Ajuste intermédio pós-poda.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_pos_poda_inicio',
    phenologyLabel: 'Pós-poda / início vegetativo',
    phenologyReference: 'Pós-poda',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.035,
    rationale: 'Cobertura para copa em desenvolvimento.'
  },
  // Grupo 2: Floração e vingamento (BBCH 60–71)
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_floracao_vingamento',
    phenologyLabel: 'Floração e vingamento',
    phenologyReference: 'BBCH 60–71',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.030,
    rationale: 'Floração e queda das pétalas em copa arejada.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_floracao_vingamento',
    phenologyLabel: 'Floração e vingamento',
    phenologyReference: 'BBCH 60–71',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.035,
    rationale: 'Vingamento em copa com densidade típica.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_floracao_vingamento',
    phenologyLabel: 'Floração e vingamento',
    phenologyReference: 'BBCH 60–71',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.042,
    rationale: 'Copa densa em floração com elevada área superficial.'
  },
  // Grupo 3: Crescimento do fruto (BBCH 72–79)
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 72–79',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.033,
    rationale: 'Frutos em expansão em copa aberta.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 72–79',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.038,
    rationale: 'Crescimento volumétrico dos frutos cítricos.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_crescimento_fruto',
    phenologyLabel: 'Crescimento do fruto',
    phenologyReference: 'BBCH 72–79',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.045,
    rationale: 'Dossel denso com frutos no interior da copa.'
  },
  // Grupo 4: Pleno vigor (BBCH 71–89)
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'Pleno vigor',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.035,
    rationale: 'Copa cítrica aberta.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'Pleno vigor',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.040,
    rationale: 'Valor de referência para copa intermédia.'
  },
  {
    cultureId: 'citrinos',
    cultureLabel: 'Citrinos',
    conductionId: 'vaso_arredondado',
    conductionLabel: 'Vaso / arredondado',
    phenologyId: 'citrinos_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'Pleno vigor',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.047,
    rationale: 'Copa fechada com maior necessidade de penetração.'
  },

  // -------------------------------------------------------------------------
  // 8. OLIVAL SUPERINTENSIVO (Sebe contínua)
  // -------------------------------------------------------------------------
  // Grupo 1: Botões florais à floração (BBCH 51–69)
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_botoes_floracao',
    phenologyLabel: 'Botões florais à floração',
    phenologyReference: 'BBCH 51–69',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.016,
    rationale: 'Aparecimento dos cachos florais e floração.'
  },
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_botoes_floracao',
    phenologyLabel: 'Botões florais à floração',
    phenologyReference: 'BBCH 51–69',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.019,
    rationale: 'Floração em sebe contínua.'
  },
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_botoes_floracao',
    phenologyLabel: 'Botões florais à floração',
    phenologyReference: 'BBCH 51–69',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.023,
    rationale: 'Sebe densa em início de ciclo reprodutivo.'
  },
  // Grupo 2: Desenvolvimento e endurecimento (BBCH 71–75)
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_desenvolvimento_fruto',
    phenologyLabel: 'Desenvolvimento e endurecimento',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.020,
    rationale: 'Vingamento e crescimento do fruto.'
  },
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_desenvolvimento_fruto',
    phenologyLabel: 'Desenvolvimento e endurecimento',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.023,
    rationale: 'Endurecimento do caroço da azeitona.'
  },
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_desenvolvimento_fruto',
    phenologyLabel: 'Desenvolvimento e endurecimento',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.027,
    rationale: 'Sebe contínua em crescimento pleno.'
  },
  // Grupo 3: Pleno vigor (BBCH 71–89)
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.022,
    rationale: 'Sebe estreita ou recentemente podada.'
  },
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.025,
    rationale: 'Configuração padrão de sebe.'
  },
  {
    cultureId: 'olival_superintensivo',
    cultureLabel: 'Olival superintensivo',
    conductionId: 'sebe_continua',
    conductionLabel: 'Sebe contínua',
    phenologyId: 'olival_super_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.030,
    rationale: 'Sebe larga, volumosa e mais fechada.'
  },

  // -------------------------------------------------------------------------
  // 9. OLIVAL INTENSIVO (Vaso / globo)
  // -------------------------------------------------------------------------
  // Grupo 1: Botões florais à floração (BBCH 51–69)
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_botoes_floracao',
    phenologyLabel: 'Botões florais à floração',
    phenologyReference: 'BBCH 51–69',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.018,
    rationale: 'Inflorescências visíveis e floração.'
  },
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_botoes_floracao',
    phenologyLabel: 'Botões florais à floração',
    phenologyReference: 'BBCH 51–69',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.022,
    rationale: 'Floração em copa tradicional.'
  },
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_botoes_floracao',
    phenologyLabel: 'Botões florais à floração',
    phenologyReference: 'BBCH 51–69',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.026,
    rationale: 'Copa densa em floração.'
  },
  // Grupo 2: Desenvolvimento e endurecimento (BBCH 71–75)
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_desenvolvimento_fruto',
    phenologyLabel: 'Desenvolvimento e endurecimento',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.022,
    rationale: 'Vingamento e crescimento do fruto em copa arejada.'
  },
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_desenvolvimento_fruto',
    phenologyLabel: 'Desenvolvimento e endurecimento',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.026,
    rationale: 'Endurecimento do caroço em olival adulto.'
  },
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_desenvolvimento_fruto',
    phenologyLabel: 'Desenvolvimento e endurecimento',
    phenologyReference: 'BBCH 71–75',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.030,
    rationale: 'Copa fechada em desenvolvimento.'
  },
  // Grupo 3: Pleno vigor (BBCH 71–89)
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'open',
    densityLabel: 'Aberta',
    adjustmentFactor: 0.75,
    kLPerM3: 0.026,
    rationale: 'Copa tradicional mantida arejada.'
  },
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'moderate',
    densityLabel: 'Moderada',
    adjustmentFactor: 0.85,
    kLPerM3: 0.030,
    rationale: 'Densidade média para atomizador.'
  },
  {
    cultureId: 'olival_intensivo',
    cultureLabel: 'Olival intensivo',
    conductionId: 'vaso_globo',
    conductionLabel: 'Vaso / globo',
    phenologyId: 'olival_intensivo_pleno_vigor',
    phenologyLabel: 'Pleno vigor',
    phenologyReference: 'BBCH 71–89',
    canopyDensity: 'dense',
    densityLabel: 'Densa',
    adjustmentFactor: 1,
    kLPerM3: 0.035,
    rationale: 'Copa densa com maior barreira de penetração.'
  }
];

/**
 * Mapeamento biunívoco de inferência automática do modo de condução para cada cultura.
 * Na matriz atual da Fase A, cada cultura possui exatamente uma condução principal configurada.
 */
export const CROP_INFERRED_CONDUCTION_MAP: Record<
  string,
  { conductionId: string; conductionLabel: string }
> = {
  vinha: { conductionId: 'espaldeira', conductionLabel: 'Espaldeira' },
  pereira: { conductionId: 'sebe_parede', conductionLabel: 'Sebe / parede' },
  macieira: { conductionId: 'sebe_parede', conductionLabel: 'Sebe / parede' },
  pessegueiro: { conductionId: 'vaso_taca', conductionLabel: 'Vaso / taça' },
  cerejeira: { conductionId: 'vaso_taca', conductionLabel: 'Vaso / taça' },
  amendoeira: { conductionId: 'sebe_parede', conductionLabel: 'Sebe / parede' },
  citrinos: { conductionId: 'vaso_arredondado', conductionLabel: 'Vaso / arredondado' },
  olival_superintensivo: { conductionId: 'sebe_continua', conductionLabel: 'Sebe contínua' },
  olival_intensivo: { conductionId: 'vaso_globo', conductionLabel: 'Vaso / globo' }
};

/**
 * Retorna o modo de condução inferido para a cultura especificada.
 */
export function getInferredConductionForCulture(cultureId: string): { id: string; label: string } | undefined {
  const mapping = CROP_INFERRED_CONDUCTION_MAP[cultureId];
  if (mapping) {
    return { id: mapping.conductionId, label: mapping.conductionLabel };
  }
  return undefined;
}

/**
 * Função utilitária pura para obter as culturas disponíveis na matriz k.
 */
export function getAvailableCultures(): { id: string; label: string }[] {
  const map = new Map<string, string>();
  for (const row of EPPO_K_DECISION_MATRIX) {
    if (!map.has(row.cultureId)) {
      map.set(row.cultureId, row.cultureLabel);
    }
  }
  return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
}

/**
 * Retorna os modos de condução disponíveis para a cultura selecionada.
 */
export function getConductionsForCulture(cultureId: string): { id: string; label: string }[] {
  const map = new Map<string, string>();
  for (const row of EPPO_K_DECISION_MATRIX) {
    if (row.cultureId === cultureId && !map.has(row.conductionId)) {
      map.set(row.conductionId, row.conductionLabel);
    }
  }
  return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
}

/**
 * Retorna os grupos fenológicos disponíveis para cultura + condução (inferida se omitida).
 */
export function getPhenologyGroups(
  cultureId: string,
  conductionId?: string
): { id: string; label: string; reference: string }[] {
  const condId = conductionId || getInferredConductionForCulture(cultureId)?.id;
  const map = new Map<string, { label: string; reference: string }>();
  for (const row of EPPO_K_DECISION_MATRIX) {
    if (row.cultureId === cultureId && (!condId || row.conductionId === condId) && !map.has(row.phenologyId)) {
      map.set(row.phenologyId, { label: row.phenologyLabel, reference: row.phenologyReference });
    }
  }
  return Array.from(map.entries()).map(([id, val]) => ({ id, label: val.label, reference: val.reference }));
}

/**
 * Procura e devolve a linha exata da matriz para a combinação.
 * Se conductionId não for fornecido, infere automaticamente a condução a partir da cultura.
 */
export function selectEppoKRow(
  cultureId: string,
  conductionId: string | undefined,
  phenologyId: string,
  canopyDensity: 'open' | 'moderate' | 'dense'
): EppoKDecisionRow | undefined {
  const condId = conductionId || getInferredConductionForCulture(cultureId)?.id;
  // Mapeamento retrocompatível para chaves anteriores
  let effectivePhenologyId = phenologyId;
  if (cultureId === 'vinha') {
    if (phenologyId === 'vinha_folhas_floracao') effectivePhenologyId = 'vinha_cachos_floracao';
    else if (phenologyId === 'vinha_fecho_pintor') effectivePhenologyId = 'vinha_bago_ervilha';
  }
  return EPPO_K_DECISION_MATRIX.find(
    (r) =>
      r.cultureId === cultureId &&
      r.conductionId === condId &&
      r.phenologyId === effectivePhenologyId &&
      r.canopyDensity === canopyDensity
  );
}
