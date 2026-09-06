/**
 * DATERRA Smart - Assistência Agronómica TRV
 * Módulo de Domínio: Perfis Culturais, Patamares de Densidade e Interpretação de Volume
 * Subfase 1B.4B
 * 
 * Regras Estritas:
 * - Funções puras sem efeitos colaterais
 * - Retorna exclusivamente chaves i18n (sem textos literais hardcoded)
 * - Não altera a fórmula Q = TRV × k
 * - Não altera arredondamentos (resultado a 1 casa decimal)
 * - Zero persistência de dados
 */

export type CanopyProfileId =
  | 'mediterranean_narrow_medium_orchard'
  | 'citrus_orchard'
  | 'olive_grove'
  | null;

export type CanopyDensityTierId =
  | 'verySparse'
  | 'sparse'
  | 'dense'
  | 'veryDense';

export interface CanopyDensityTier {
  id: CanopyDensityTierId;
  kValue: number;
  labelKey: string;
}

export type TrvInterpretationStatus =
  | 'no_profile'
  | 'validation'
  | 'very_low'
  | 'low_moderate'
  | 'typical'
  | 'high_plausible'
  | 'high_developed'
  | 'high'
  | 'very_high'
  | 'none';

export interface TrvInterpretationResult {
  status: TrvInterpretationStatus;
  messageKey?: string;
  severity: 'info' | 'neutral' | 'warning' | 'none';
  isValidation?: boolean;
}

/**
 * Patamares de densidade orientadores por perfil cultural.
 * - Pomar estreito/médio: 4 patamares ativos (0,020 a 0,060 L/m³)
 * - Citrinos: 4 patamares internos em validação (0,060 a 0,120 L/m³)
 * - Olival: nenhum patamar automático ([] vazio, interpretação em validação)
 * - Sem perfil (null): nenhum patamar ([] vazio)
 */
export function getCanopyDensityTiers(profile: CanopyProfileId): CanopyDensityTier[] {
  if (profile === 'mediterranean_narrow_medium_orchard') {
    return [
      {
        id: 'verySparse',
        kValue: 0.020,
        labelKey: 'volumeCaldaTrv.assistance.density.verySparse'
      },
      {
        id: 'sparse',
        kValue: 0.033,
        labelKey: 'volumeCaldaTrv.assistance.density.sparse'
      },
      {
        id: 'dense',
        kValue: 0.050,
        labelKey: 'volumeCaldaTrv.assistance.density.dense'
      },
      {
        id: 'veryDense',
        kValue: 0.060,
        labelKey: 'volumeCaldaTrv.assistance.density.veryDense'
      }
    ];
  }

  if (profile === 'citrus_orchard') {
    return [
      {
        id: 'verySparse',
        kValue: 0.060,
        labelKey: 'volumeCaldaTrv.assistance.density.verySparse'
      },
      {
        id: 'sparse',
        kValue: 0.080,
        labelKey: 'volumeCaldaTrv.assistance.density.sparse'
      },
      {
        id: 'dense',
        kValue: 0.100,
        labelKey: 'volumeCaldaTrv.assistance.density.dense'
      },
      {
        id: 'veryDense',
        kValue: 0.120,
        labelKey: 'volumeCaldaTrv.assistance.density.veryDense'
      }
    ];
  }

  // Olival e Sem Perfil não possuem grelha de cartões automáticos
  return [];
}

/**
 * Avaliação da interpretação contextual do volume calculado em L/ha.
 * Devolve chaves i18n e níveis de severidade visual não bloqueantes.
 */
export function evaluateTrvVolumeInterpretation(
  profile: CanopyProfileId,
  trv: number | undefined,
  k: number | undefined
): TrvInterpretationResult {
  // 1. Sem perfil cultural selecionado
  if (profile === null) {
    return {
      status: 'no_profile',
      messageKey: 'volumeCaldaTrv.assistance.interpretation.noProfileMessage',
      severity: 'neutral'
    };
  }

  // 2. Perfil Olival (interpretação em validação)
  if (profile === 'olive_grove') {
    return {
      status: 'validation',
      messageKey: 'volumeCaldaTrv.assistance.interpretation.oliveValidationMessage',
      severity: 'info',
      isValidation: true
    };
  }

  // Se os dados matemáticos não estiverem completos ou válidos
  if (
    trv === undefined ||
    k === undefined ||
    isNaN(trv) ||
    isNaN(k) ||
    !isFinite(trv) ||
    !isFinite(k) ||
    trv <= 0 ||
    k <= 0
  ) {
    return {
      status: 'none',
      severity: 'none'
    };
  }

  // Volume calculado com precisão de 1 casa decimal (Q = TRV × k)
  const volume = Math.round(trv * k * 10) / 10;

  // 3. Perfil Pomar Estreito / Médio
  if (profile === 'mediterranean_narrow_medium_orchard') {
    if (volume < 300) {
      return {
        status: 'very_low',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.orchardVeryLow',
        severity: 'info'
      };
    }
    if (volume < 500) {
      return {
        status: 'low_moderate',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.orchardLowModerate',
        severity: 'info'
      };
    }
    if (volume <= 800) {
      return {
        status: 'typical',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.orchardTypical',
        severity: 'neutral'
      };
    }
    if (volume <= 1000) {
      return {
        status: 'high_plausible',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.orchardHighPlausible',
        severity: 'warning'
      };
    }
    if (volume <= 1200) {
      return {
        status: 'high_developed',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.orchardHighDeveloped',
        severity: 'warning'
      };
    }
    return {
      status: 'very_high',
      messageKey: 'volumeCaldaTrv.assistance.interpretation.orchardVeryHigh',
      severity: 'warning'
    };
  }

  // 4. Perfil Citrinos
  if (profile === 'citrus_orchard') {
    if (volume < 500) {
      return {
        status: 'very_low',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.citrusLow',
        severity: 'info'
      };
    }
    if (volume <= 1500) {
      return {
        status: 'typical',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.citrusTypical',
        severity: 'neutral'
      };
    }
    if (volume <= 2000) {
      return {
        status: 'high',
        messageKey: 'volumeCaldaTrv.assistance.interpretation.citrusHigh',
        severity: 'warning'
      };
    }
    return {
      status: 'very_high',
      messageKey: 'volumeCaldaTrv.assistance.interpretation.citrusVeryHigh',
      severity: 'warning'
    };
  }

  return {
    status: 'none',
    severity: 'none'
  };
}
