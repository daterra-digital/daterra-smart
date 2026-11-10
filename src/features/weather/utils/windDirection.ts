// src/features/weather/utils/windDirection.ts

export interface WindDirectionInfo {
  /** Azimute de origem em graus (0° = Norte, 90° = Este, 180° = Sul, 270° = Oeste) */
  degrees: number;
  /** Nome do ponto cardeal/intercardeal de origem em PT-PT (ex: "Sul", "Nordeste") */
  originName: string;
  /** Preposição com ponto de origem (ex: "De sul", "De nordeste") */
  originPreposition: string;
  /** Nome do ponto para onde o vento sopra (ex: "Norte", "Sudoeste") */
  targetName: string;
  /** Preposição com ponto de destino (ex: "para norte", "para sudoeste") */
  targetPreposition: string;
  /** Sigla cardinal de origem (ex: "S", "NE") */
  cardinalOrigin: string;
  /** Sigla cardinal de destino (ex: "N", "SO") */
  cardinalTarget: string;
  /**
   * Ângulo de rotação da seta que indica o sentido de deslocação (movimento do fluxo).
   * Convenção:
   *  - Um vento de Sul (origem 180°) desloca-se PARA Norte (0°).
   *  - A seta (inicialmente apontada para o topo, 0°) deve apontar para Norte (0°).
   *  - Fórmula exata: displacementDeg = (degrees + 180) % 360.
   */
  displacementDeg: number;
}

/**
 * Converte azimute meteorológico de origem em dados inequívocos de origem e deslocação em PT-PT.
 * Suporta 8 direções cardeais e intercardeais (N, NE, E, SE, S, SO, O, NO).
 */
export function parseWindDirection(deg: number | null | undefined): WindDirectionInfo | null {
  if (deg == null || isNaN(deg)) return null;

  // Normalização estrita para o intervalo [0, 360)
  const normalized = ((deg % 360) + 360) % 360;

  // 8 setores de 45° centrados em 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
  // Setor 0 (Norte) cobre [337.5°, 360) e [0, 22.5)
  const sectorIndex = Math.round(normalized / 45) % 8;

  const sectors: Array<{
    origin: string;
    originPrep: string;
    target: string;
    targetPrep: string;
    cardinalOrigin: string;
    cardinalTarget: string;
  }> = [
    { origin: 'Norte', originPrep: 'De norte', target: 'sul', targetPrep: 'para sul', cardinalOrigin: 'N', cardinalTarget: 'S' },
    { origin: 'Nordeste', originPrep: 'De nordeste', target: 'sudoeste', targetPrep: 'para sudoeste', cardinalOrigin: 'NE', cardinalTarget: 'SO' },
    { origin: 'Este', originPrep: 'De este', target: 'oeste', targetPrep: 'para oeste', cardinalOrigin: 'E', cardinalTarget: 'O' },
    { origin: 'Sudeste', originPrep: 'De sudeste', target: 'noroeste', targetPrep: 'para noroeste', cardinalOrigin: 'SE', cardinalTarget: 'NO' },
    { origin: 'Sul', originPrep: 'De sul', target: 'norte', targetPrep: 'para norte', cardinalOrigin: 'S', cardinalTarget: 'N' },
    { origin: 'Sudoeste', originPrep: 'De sudoeste', target: 'nordeste', targetPrep: 'para nordeste', cardinalOrigin: 'SO', cardinalTarget: 'NE' },
    { origin: 'Oeste', originPrep: 'De oeste', target: 'este', targetPrep: 'para este', cardinalOrigin: 'O', cardinalTarget: 'E' },
    { origin: 'Noroeste', originPrep: 'De noroeste', target: 'sudeste', targetPrep: 'para sudeste', cardinalOrigin: 'NO', cardinalTarget: 'SE' },
  ];

  const info = sectors[sectorIndex];
  const displacementDeg = (normalized + 180) % 360;

  return {
    degrees: Math.round(normalized),
    originName: info.origin,
    originPreposition: info.originPrep,
    targetName: info.target,
    targetPreposition: info.targetPrep,
    cardinalOrigin: info.cardinalOrigin,
    cardinalTarget: info.cardinalTarget,
    displacementDeg: Math.round(displacementDeg),
  };
}

/**
 * Formata números decimais com vírgula em conformidade com o português europeu.
 */
export function formatDecimalPt(val: number | null | undefined, fallback = '--'): string {
  if (val == null || isNaN(val)) return fallback;
  const rounded = Math.round(val * 10) / 10;
  return String(rounded).replace('.', ',');
}
