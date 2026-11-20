// src/lib/agri-math/calibration-eppo-bridge.ts
export type EppoComplianceStatus = 'ALINHADO_REF_EPPO' | 'ABAIXO_REF_EPPO' | 'ACIMA_REF_EPPO' | 'SEM_REF_EPPO';
export type HydraulicErrorCode = 'INVALID_SPEED' | 'INVALID_ROW_SPACING' | 'INVALID_FLOW';
export type EvaporativeMetricKind = 'DELTA_T' | 'VPD';
export type ContextualDriftLevel = 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRITICO_BLOQUEADO' | 'INDETERMINADO';

export interface SpeedEnvelope { readonly minKmh: number; readonly maxKmh: number; readonly referenciaKmh: number; }
export interface IsoNozzleRecommendation {
  readonly calibreIso: string; readonly corIso: string; readonly qNaPressaoLMin: number;
  readonly debitoTotalAlvoLMin: number; readonly debitoPorBicoAlvoLMin: number | null;
  readonly sugestaoBicoIso: string; readonly explicacaoFisicaPt: string;
}

export interface CalibrationEppoBalanceInput {
  readonly debitoTotalLMin: number; readonly velocidadeKmh: number; readonly entrelinhaM: number;
  readonly pressaoBar?: number | null; readonly numBicosAtivos?: number | null;
  readonly culturaTipologia?: '2D' | '3D_COPA'; readonly volumeRecomendadoEppoLHa?: number | null;
  readonly trvM3Ha?: number | null; readonly lwaM2Ha?: number | null;
  readonly caudalArAplicadoM3H?: number | null; readonly isDroneUav?: boolean; readonly toleranciaEppoPct?: number;
}

export interface CalibrationEppoBalanceResult {
  readonly isValid: boolean; readonly errorCode: HydraulicErrorCode | null; readonly errorMessagePt: string | null;
  readonly volumeCalibradoLHa: number | null; readonly volumeRecomendadoEppoLHa: number | null;
  readonly desvioPercentual: number | null; readonly estadoConformidade: EppoComplianceStatus;
  readonly pisoMecanicoMinLHa: number; readonly abaixoPisoMecanico: boolean;
  readonly envelopeVelocidade: SpeedEnvelope; readonly velocidadeTeoricaKmh: number | null;
  readonly velocidadeSugeridaSeguraKmh: number | null; readonly velocidadeForaEnvelope: boolean;
  readonly alertaVelocidadePt: string | null; readonly recomendacaoBico: IsoNozzleRecommendation | null;
  readonly caudalArSugeridoM3H: number | null; readonly caudalArAplicadoM3H: number | null;
  readonly estadoVentilacao3D: 'SUBVENTILACAO' | 'ADEQUADA' | 'SOBREVENTILACAO' | null;
  readonly litrosPor1000m3Trv: number | null; readonly alertaRetencaoTrv: 'ESCORRIMENTO' | 'SUB_COBERTURA' | 'ADEQUADA' | null;
  readonly litrosPor10000m2Lwa: number | null;
}

export interface ContextualDriftRiskInput {
  readonly culturaTipologia: '2D' | '3D_COPA'; readonly isDroneUav?: boolean;
  readonly pressaoBar: number | null; readonly pressaoMinHomologadaBar?: number | null; readonly pressaoMaxHomologadaBar?: number | null;
  readonly bicoAntiDeriva?: boolean | null; readonly assistenciaArAtiva?: boolean | null;
  readonly weather: { readonly ventoMs: number | null; readonly rajadaMs: number | null; readonly deltaT: number | null; readonly vpd: number | null } | null;
}

export interface ContextualDriftRiskResult {
  readonly nivelRisco: ContextualDriftLevel; readonly scoreRisco: number | null;
  readonly bloqueioRigido: boolean; readonly motivoBloqueioPt: string | null;
  readonly meteorologiaDisponivel: boolean; readonly metricaEvaporativaUsada: EvaporativeMetricKind | null;
  readonly valorEvaporativo: number | null; readonly sobrepressaoBico: boolean; readonly subpressaoBico: boolean;
  readonly ventoMs: number | null; readonly rajadaMs: number | null; readonly limiteVentoMs: number;
  readonly alertasTecnicosPt: readonly string[];
}

const ISO_10625_SCALE = [
  { calibre: '01', cor: 'Laranja', q3Bar: 0.4 }, { calibre: '015', cor: 'Verde', q3Bar: 0.6 },
  { calibre: '02', cor: 'Amarelo', q3Bar: 0.8 }, { calibre: '025', cor: 'Lilás', q3Bar: 1.0 },
  { calibre: '03', cor: 'Azul', q3Bar: 1.2 }, { calibre: '035', cor: 'Vermelho-Castanho', q3Bar: 1.4 },
  { calibre: '04', cor: 'Vermelho', q3Bar: 1.6 }, { calibre: '05', cor: 'Castanho', q3Bar: 2.0 },
  { calibre: '06', cor: 'Cinzento', q3Bar: 2.4 }, { calibre: '08', cor: 'Branco', q3Bar: 3.2 }
] as const;

const isPosFin = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const isNonNegFin = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const round2 = (v: number): number => Math.round(v * 100) / 100;
const fmtPt = (v: number, dec = 2): string => v.toFixed(dec).replace('.', ',');

function buildIsoNozzleSuggestion(
  targetVolLHa: number, entrelinhaM: number, env: SpeedEnvelope, pressaoBar: number | null, numBicos: number | null
): IsoNozzleRecommendation {
  const debitoTotalAlvoLMin = round2((targetVolLHa * env.referenciaKmh * entrelinhaM) / 600);
  const debitoPorBicoAlvoLMin = numBicos && numBicos > 0 ? round2(debitoTotalAlvoLMin / numBicos) : null;
  const pRef = pressaoBar && pressaoBar > 0 ? pressaoBar : 3.0;
  const alvoQ = debitoPorBicoAlvoLMin ?? debitoTotalAlvoLMin;
  let best: (typeof ISO_10625_SCALE)[number] = ISO_10625_SCALE[0];
  let bestQ = round2(best.q3Bar * Math.sqrt(pRef / 3.0));
  let bestDiff = Math.abs(bestQ - alvoQ);
  for (const item of ISO_10625_SCALE) {
    const qP = round2(item.q3Bar * Math.sqrt(pRef / 3.0));
    const diff = Math.abs(qP - alvoQ);
    if (diff < bestDiff) { best = item; bestQ = qP; bestDiff = diff; }
  }
  return {
    calibreIso: best.calibre, corIso: best.cor, qNaPressaoLMin: bestQ, debitoTotalAlvoLMin, debitoPorBicoAlvoLMin,
    sugestaoBicoIso: `Calibre ISO ${best.calibre} (${best.cor}) · ~${fmtPt(bestQ, 2)} L/min @ ${fmtPt(pRef, 1)} bar`,
    explicacaoFisicaPt: 'Alterar o calibre/tipo de bico preserva a penetração na copa (velocidade constante) e o espetro de gotas (pressão constante).'
  };
}

/** Motor puro EPPO PP 1/239: hierarquia Bicos ISO 10625 > Velocidade Segura > Pressão, e retenção na copa. */
export function computeCalibrationEppoBalance(input: CalibrationEppoBalanceInput): CalibrationEppoBalanceResult {
  const pisoMecanicoMinLHa = input.isDroneUav ? 15 : 100;
  const toleranciaPct = isPosFin(input.toleranciaEppoPct) ? input.toleranciaEppoPct : 10;
  const targetEppo = isPosFin(input.volumeRecomendadoEppoLHa) ? input.volumeRecomendadoEppoLHa : null;
  const appliedAir = isNonNegFin(input.caudalArAplicadoM3H) ? input.caudalArAplicadoM3H : null;
  const envelopeVelocidade: SpeedEnvelope = input.culturaTipologia === '2D' ? { minKmh: 6.0, maxKmh: 12.0, referenciaKmh: 8.0 } : { minKmh: 4.0, maxKmh: 7.5, referenciaKmh: 6.0 };

  const fail = (errorCode: HydraulicErrorCode, errorMessagePt: string): CalibrationEppoBalanceResult => ({
    isValid: false, errorCode, errorMessagePt, volumeCalibradoLHa: null, volumeRecomendadoEppoLHa: targetEppo,
    desvioPercentual: null, estadoConformidade: 'SEM_REF_EPPO', pisoMecanicoMinLHa, abaixoPisoMecanico: false,
    envelopeVelocidade, velocidadeTeoricaKmh: null, velocidadeSugeridaSeguraKmh: null, velocidadeForaEnvelope: false,
    alertaVelocidadePt: null, recomendacaoBico: null, caudalArSugeridoM3H: null, caudalArAplicadoM3H: appliedAir,
    estadoVentilacao3D: null, litrosPor1000m3Trv: null, alertaRetencaoTrv: null, litrosPor10000m2Lwa: null
  });
  if (!isPosFin(input.velocidadeKmh)) return fail('INVALID_SPEED', 'A velocidade de avanço deve ser superior a 0 km/h.');
  if (!isPosFin(input.entrelinhaM)) return fail('INVALID_ROW_SPACING', 'A largura de trabalho ou entrelinha deve ser superior a 0 m.');
  if (!isPosFin(input.debitoTotalLMin)) return fail('INVALID_FLOW', 'O débito total dos bicos deve ser superior a 0 L/min.');

  const rawVol = (input.debitoTotalLMin * 600) / (input.velocidadeKmh * input.entrelinhaM);
  const volumeCalibradoLHa = round2(rawVol);
  const abaixoPisoMecanico = rawVol < pisoMecanicoMinLHa;

  let desvioPercentual: number | null = null, estadoConformidade: EppoComplianceStatus = 'SEM_REF_EPPO';
  let velocidadeTeoricaKmh: number | null = null, velocidadeSugeridaSeguraKmh: number | null = null;
  let velocidadeForaEnvelope = false, alertaVelocidadePt: string | null = null, recomendacaoBico: IsoNozzleRecommendation | null = null;

  if (targetEppo !== null) {
    const rawDev = ((rawVol - targetEppo) / targetEppo) * 100;
    desvioPercentual = round2(rawDev);
    estadoConformidade = rawDev < -toleranciaPct ? 'ABAIXO_REF_EPPO' : rawDev > toleranciaPct ? 'ACIMA_REF_EPPO' : 'ALINHADO_REF_EPPO';
    const rawTeo = (input.debitoTotalLMin * 600) / (targetEppo * input.entrelinhaM);
    velocidadeTeoricaKmh = round2(rawTeo);
    velocidadeSugeridaSeguraKmh = round2(Math.min(envelopeVelocidade.maxKmh, Math.max(envelopeVelocidade.minKmh, rawTeo)));
    velocidadeForaEnvelope = rawTeo < envelopeVelocidade.minKmh || rawTeo > envelopeVelocidade.maxKmh;
    if (velocidadeForaEnvelope) {
      alertaVelocidadePt = `Velocidade teórica (${fmtPt(rawTeo, 2)} km/h) excede o envelope seguro (${fmtPt(envelopeVelocidade.minKmh, 1)}–${fmtPt(envelopeVelocidade.maxKmh, 1)} km/h): velocidades excessivas ou grandes variações de pressão alteram o depósito na copa e o diâmetro das gotas.`;
    }
    if (Math.abs(rawDev) > toleranciaPct) {
      recomendacaoBico = buildIsoNozzleSuggestion(targetEppo, input.entrelinhaM, envelopeVelocidade, isPosFin(input.pressaoBar) ? input.pressaoBar : null, isPosFin(input.numBicosAtivos) ? Math.round(input.numBicosAtivos) : null);
    }
  }

  const caudalArSugeridoM3H = isPosFin(input.trvM3Ha) ? Number((0.1 * input.trvM3Ha * input.velocidadeKmh).toFixed(4)) : null;
  const estadoVentilacao3D = caudalArSugeridoM3H && appliedAir !== null
    ? (appliedAir < caudalArSugeridoM3H * 0.8 ? 'SUBVENTILACAO' : appliedAir > caudalArSugeridoM3H * 1.2 ? 'SOBREVENTILACAO' : 'ADEQUADA') : null;
  const litrosPor1000m3Trv = isPosFin(input.trvM3Ha) ? round2((rawVol / input.trvM3Ha) * 1000) : null;
  const alertaRetencaoTrv = litrosPor1000m3Trv === null ? null : litrosPor1000m3Trv > 115 ? 'ESCORRIMENTO' : litrosPor1000m3Trv < 35 ? 'SUB_COBERTURA' : 'ADEQUADA';
  const litrosPor10000m2Lwa = isPosFin(input.lwaM2Ha) ? round2((rawVol / input.lwaM2Ha) * 10000) : null;

  return {
    isValid: true, errorCode: null, errorMessagePt: null, volumeCalibradoLHa, volumeRecomendadoEppoLHa: targetEppo,
    desvioPercentual, estadoConformidade, pisoMecanicoMinLHa, abaixoPisoMecanico, envelopeVelocidade,
    velocidadeTeoricaKmh, velocidadeSugeridaSeguraKmh, velocidadeForaEnvelope, alertaVelocidadePt, recomendacaoBico,
    caudalArSugeridoM3H, caudalArAplicadoM3H: appliedAir, estadoVentilacao3D, litrosPor1000m3Trv, alertaRetencaoTrv, litrosPor10000m2Lwa
  };
}

/** Avalia risco contextual de deriva (2D vs. 3D/copa, pressão do bico e meteorologia real). */
export function evaluateContextualDriftRisk(input: ContextualDriftRiskInput): ContextualDriftRiskResult {
  const limiteVentoMs = input.isDroneUav ? 4.17 : 4.0;
  const ventoMs = isNonNegFin(input.weather?.ventoMs) ? input.weather.ventoMs : null;
  const rajadaMs = isNonNegFin(input.weather?.rajadaMs) ? input.weather.rajadaMs : null;
  const deltaT = typeof input.weather?.deltaT === 'number' && Number.isFinite(input.weather.deltaT) ? input.weather.deltaT : null;
  const vpd = isNonNegFin(input.weather?.vpd) ? input.weather.vpd : null;
  const metricaEvaporativaUsada: EvaporativeMetricKind | null = deltaT !== null ? 'DELTA_T' : vpd !== null ? 'VPD' : null;
  const valorEvaporativo = metricaEvaporativaUsada === 'DELTA_T' ? deltaT : metricaEvaporativaUsada === 'VPD' ? vpd : null;
  const meteorologiaDisponivel = ventoMs !== null || rajadaMs !== null || valorEvaporativo !== null;
  const p = isPosFin(input.pressaoBar) ? input.pressaoBar : null;
  const sobrepressaoBico = p !== null && isPosFin(input.pressaoMaxHomologadaBar) && p > input.pressaoMaxHomologadaBar;
  const subpressaoBico = p !== null && isPosFin(input.pressaoMinHomologadaBar) && p < input.pressaoMinHomologadaBar;
  const alertasTecnicosPt: string[] = [];
  if (sobrepressaoBico) alertasTecnicosPt.push('Pressão de trabalho acima do limite homologado do bico: gotas mais finas evaporam e derivam mais.');
  if (subpressaoBico) alertasTecnicosPt.push('Pressão de trabalho abaixo do mínimo homologado do bico: risco de jato deficiente.');
  const bloqueioRigido = ventoMs !== null && ventoMs > limiteVentoMs;
  const motivoBloqueioPt = bloqueioRigido && ventoMs !== null ? `Vento médio (${fmtPt(ventoMs, 1)} m/s) excede o limite de segurança (${fmtPt(limiteVentoMs, 2)} m/s).` : null;
  if (motivoBloqueioPt) alertasTecnicosPt.push(motivoBloqueioPt);
  const gustExceeded = rajadaMs !== null && rajadaMs > 6.94;
  const evapCritical = (metricaEvaporativaUsada === 'DELTA_T' && valorEvaporativo !== null && valorEvaporativo > 10) || (metricaEvaporativaUsada === 'VPD' && valorEvaporativo !== null && valorEvaporativo > 2.5);
  if (!meteorologiaDisponivel) {
    return { nivelRisco: 'INDETERMINADO', scoreRisco: null, bloqueioRigido: false, motivoBloqueioPt: null, meteorologiaDisponivel: false, metricaEvaporativaUsada: null, valorEvaporativo: null, sobrepressaoBico, subpressaoBico, ventoMs: null, rajadaMs: null, limiteVentoMs, alertasTecnicosPt };
  }
  let score = (input.culturaTipologia === '3D_COPA' ? 24 : 16) + (ventoMs !== null ? (ventoMs / limiteVentoMs) * 42 : 0);
  if (rajadaMs !== null && rajadaMs > 5.0) score += Math.min(20, (rajadaMs - 5.0) * 6);
  if (metricaEvaporativaUsada === 'DELTA_T' && valorEvaporativo !== null && valorEvaporativo > 6) score += Math.min(25, (valorEvaporativo - 6) * 5);
  if (metricaEvaporativaUsada === 'VPD' && valorEvaporativo !== null && valorEvaporativo > 1.6) score += Math.min(25, (valorEvaporativo - 1.6) * 18);
  if (sobrepressaoBico) score += 18;
  if (input.bicoAntiDeriva === true && !sobrepressaoBico) score -= 10;
  if (input.culturaTipologia === '2D' && input.assistenciaArAtiva === true) score -= 8;
  if (bloqueioRigido || gustExceeded || evapCritical) score = Math.max(score, 80);
  const scoreRisco = Math.round(Math.min(100, Math.max(5, score)));
  const nivelRisco: ContextualDriftLevel = bloqueioRigido || scoreRisco >= 76 ? 'CRITICO_BLOQUEADO' : scoreRisco >= 51 ? 'ELEVADO' : scoreRisco >= 26 ? 'MODERADO' : 'BAIXO';
  return { nivelRisco, scoreRisco, bloqueioRigido, motivoBloqueioPt, meteorologiaDisponivel: true, metricaEvaporativaUsada, valorEvaporativo, sobrepressaoBico, subpressaoBico, ventoMs, rajadaMs, limiteVentoMs, alertasTecnicosPt };
}
