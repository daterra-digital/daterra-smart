import type { CalculationHistoryRecord } from '../../types/calculator.ts';
import type { IrdAssessmentLevelSnapshot, IrdBlockOriginMode, IrdHeightCharacterizationMode, IrdTriStateStatus } from './irdOriginTypes.ts';
import type { IrdApplicationDomain, IrdFallbackFlagCode, IrdInput } from './irdTypes.ts';
import { buildIrdTransparencyNotes } from './irdExplanationNotes.ts';

const SOURCE_LABELS: Record<string, string> = {
  calibration_profile: 'Medição do utilizador (calibração)',
  manufacturer_spec: 'Ficha técnica declarada',
  lab_certificate: 'Certificado laboratorial',
  user_declared: 'Medição declarada',
  catalog_exact_pressure: 'Catálogo local (pressão exata)',
  catalog_interpolated_pressure: 'Catálogo local (interpolado)',
  catalog_droplet_class: 'Catálogo local (classe)',
  conservative_fallback: 'Fallback conservador'
};

const LEVEL_LABELS: Record<IrdAssessmentLevelSnapshot, string> = {
  quick_partial: 'Rápida Parcial',
  quick_manual: 'Rápida Manual',
  detailed_profiles: 'Detalhada por Perfis'
};

export const HEIGHT_MODE_LABELS: Record<IrdHeightCharacterizationMode, string> = {
  horizontal_boom_ground: 'Altura da barra ao solo',
  soil_boom: 'Altura da barra / difusores ao solo',
  canopy_release: 'Altura de libertação ao alvo / copa',
  culture_profile_canopy: 'Altura de copa (requer evolução futura)',
  descriptive_unavailable: 'Modo descritivo (medição exata indisponível)'
};

const FALLBACK_LABELS: Record<IrdFallbackFlagCode, string> = {
  USER_DROPLET_MEASUREMENT_INVALID_IGNORED: 'Medição de gotas inválida ignorada',
  NOZZLE_DV10_UNAVAILABLE_USED_CLASS: 'DV10 indisponível: usada classe de gotas',
  NOZZLE_CLASS_UNAVAILABLE_USED_HAZARD: 'Classe de gotas indisponível: usado nível de risco',
  NOZZLE_CATALOG_DATA_MISSING_USED_CONSERVATIVE_F: 'Sem bico no catálogo: espectro conservador classe F',
  NOZZLE_ZERO_HAZARD_NORMALIZED_NON_ZERO: 'Risco mínimo não nulo aplicado',
  NOZZLE_UNDERPRESSURE_WARNING: 'Pressão abaixo da faixa do bico',
  NOZZLE_OVERPRESSURE_PENALTY: 'Pressão acima da faixa do bico',
  WEATHER_CACHE_STALE_CONFIRM_IN_FIELD: 'Cache meteorológica > 20 min (confirmar no campo)',
  BUFFER_DISTANCE_UNCONFIRMED_CONSERVATIVE: 'Distância a zona sensível não confirmada (conservador)',
  CALM_WIND_THERMAL_INVERSION_CAUTION: 'Vento fraco e ΔT elevado: cautela de inversão térmica',
  LOW_DELTA_T_RUNOFF_CAUTION: 'ΔT < 2 °C: cautela de escorrimento'
};

export function formatIrdFallbackFlagPt(code: string): string {
  return (FALLBACK_LABELS as Record<string, string>)[code] ?? code;
}

export function formatAirAssistNote(domain: IrdApplicationDomain, status: IrdTriStateStatus): string {
  if (status === 'yes') {
    return domain === 'horizontal_boom'
      ? 'Assistência de ar confirmada (fator 0,85 em barra horizontal)'
      : 'Assistência de ar assinalada (fator específico por copa/lança pendente de modelo futuro)';
  }
  return status === 'no' ? 'Sem assistência de ar' : 'Assistência de ar desconhecida (conservador · distinto de Não)';
}

const ORIGIN_TAG = (v: unknown) => (v === 'profile' ? 'Perfil' : v === 'manual' ? 'Manual' : null);
const AIR_ASSIST_LABELS: Record<IrdTriStateStatus, string> = { yes: 'Sim', no: 'Não', unknown: 'Desconhecido' };
const isValidDomain = (v: unknown): v is IrdApplicationDomain => v === 'horizontal_boom' || v === 'orchard_airblast' || v === 'manual_lance';

export interface IrdHistoryTraceSummary {
  readonly assessmentLevel: IrdAssessmentLevelSnapshot | null;
  readonly assessmentLevelLabelPt: string | null;
  readonly evaluationOrigin: IrdBlockOriginMode | null;
  readonly evaluationOriginLabelPt: string | null;
  readonly heightModeLabelPt: string | null;
  readonly airAssistLabelPt: string | null;
  readonly nozzleLabelPt: string | null;
  readonly dropletOriginLabel: string | null;
  readonly dropletDetailPt: string | null;
  readonly originSummaryPt: string | null;
  readonly profileNamesSummaryPt: string | null;
  readonly fallbackFlagsPt: string | null;
  readonly certifiedReductionSummaryPt: string | null;
  readonly explanationNotesPt: readonly string[];
  readonly isLegacyWithoutTrace: boolean;
}

export function readIrdHistoryTrace(rec: CalculationHistoryRecord): IrdHistoryTraceSummary {
  const out = rec.outputs;
  const inp = rec.inputs;
  const rawSource = typeof out?.dropletSource?.rawValue === 'string' ? out.dropletSource.rawValue : null;
  const rawConf = typeof out?.dropletConfidence?.rawValue === 'string' ? out.dropletConfidence.rawValue : null;
  const dv10 = out?.dv10UsedUm?.rawValue;
  const dv50 = out?.dv50UsedUm?.rawValue;
  const rep = inp?.representativeDropletDiameterUm?.rawValue;
  const rawLevel = typeof inp?.assessmentLevel?.rawValue === 'string' ? inp.assessmentLevel.rawValue : null;

  if (!rawSource && dv10 === undefined && rep === undefined && !rawLevel) {
    return {
      assessmentLevel: null, assessmentLevelLabelPt: null, evaluationOrigin: null, evaluationOriginLabelPt: null,
      heightModeLabelPt: null, airAssistLabelPt: null, nozzleLabelPt: null, dropletOriginLabel: null, dropletDetailPt: null,
      originSummaryPt: null, profileNamesSummaryPt: null, fallbackFlagsPt: null, certifiedReductionSummaryPt: null,
      explanationNotesPt: ['Sem notas adicionais disponíveis'], isLegacyWithoutTrace: true
    };
  }

  const assessmentLevel = rawLevel && rawLevel in LEVEL_LABELS ? (rawLevel as IrdAssessmentLevelSnapshot) : null;
  const rawEvalOrigin = inp?.evaluationOrigin?.rawValue;
  const evaluationOrigin: IrdBlockOriginMode | null = rawEvalOrigin === 'profile' || rawEvalOrigin === 'manual' ? rawEvalOrigin : null;
  const evaluationOriginLabelPt = evaluationOrigin === 'profile' ? 'Perfis guardados' : evaluationOrigin === 'manual' ? 'Manual' : null;
  const rawHeightMode = typeof inp?.heightMode?.rawValue === 'string' ? inp.heightMode.rawValue : null;
  const heightModeLabelPt = rawHeightMode ? ((HEIGHT_MODE_LABELS as Record<string, string>)[rawHeightMode] ?? rawHeightMode) : null;

  const airRaw = inp?.airAssistStatus?.rawValue;
  const airAssistLabelPt = airRaw === 'yes' || airRaw === 'no' || airRaw === 'unknown'
    ? AIR_ASSIST_LABELS[airRaw] : inp?.hasAirSleeve?.rawValue === 'sim' ? 'Sim' : null;

  const catLabel = typeof inp?.nozzleCatalogLabel?.rawValue === 'string' ? inp.nozzleCatalogLabel.rawValue.trim() : '';
  const rawNozId = typeof inp?.nozzleId?.rawValue === 'string' ? inp.nozzleId.rawValue.trim() : '';
  const nozzleLabelPt = catLabel || (rawNozId && rawNozId !== 'custom' ? rawNozId : null);

  const originLabel = rawSource ? (SOURCE_LABELS[rawSource] ?? rawSource) : 'Registo gravado';
  const parts: string[] = [];
  if (typeof rep === 'number') parts.push(`Diâmetro repr. ${rep} µm`);
  else if (typeof dv10 === 'number') parts.push(`DV10 ${dv10} µm${typeof dv50 === 'number' ? ` / DV50 ${dv50} µm` : ''}`);
  if (rawConf) parts.push(`Confiança ${rawConf}`);

  const culM = ORIGIN_TAG(inp?.cultureOriginMode?.rawValue);
  const eqM = ORIGIN_TAG(inp?.equipmentOriginMode?.rawValue);
  const nozM = ORIGIN_TAG(inp?.nozzleOriginMode?.rawValue);
  const calM = ORIGIN_TAG(inp?.calibrationOriginMode?.rawValue);
  const originParts = [culM && `Cult.: ${culM}`, eqM && `Equip.: ${eqM}`, nozM && `Bico: ${nozM}`, calM && `Calib.: ${calM}`].filter(Boolean);

  const profNames = [inp?.cultureProfileName?.rawValue, inp?.equipmentProfileName?.rawValue, inp?.nozzleProfileLabel?.rawValue, inp?.calibrationProfileLabel?.rawValue]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);

  let fallbackFlagsPt: string | null = null;
  const rawFlags = out?.fallbackFlags?.rawValue;
  if (typeof rawFlags === 'string' && rawFlags.trim()) {
    try {
      const parsed = JSON.parse(rawFlags);
      if (Array.isArray(parsed) && parsed.length > 0) {
        fallbackFlagsPt = parsed.filter((x): x is string => typeof x === 'string').map(formatIrdFallbackFlagPt).join(' · ');
      }
    } catch { /* snapshot sem JSON válido de fallbackFlags */ }
  }

  const certStatus = inp?.certifiedReductionStatus?.rawValue;
  const certPct = inp?.certifiedReductionPct?.rawValue;
  const certDoc = certStatus === 'documented';
  const certSummary = certDoc ? `Redução certificada declarada${typeof certPct === 'number' ? ` (${certPct}%)` : ''} · não aplicada à pontuação` : null;

  const rawDomain = inp?.applicationDomain?.rawValue;
  let explanationNotesPt: readonly string[];
  if (isValidDomain(rawDomain)) {
    const tNotes = buildIrdTransparencyNotes({
      irdInput: {
        weather: {},
        nozzle: { workingPressureBar: null, hasAirSleeve: false, measurementPressureBar: typeof inp?.measurementPressureBar?.rawValue === 'number' ? inp.measurementPressureBar.rawValue : null },
        operation: {
          applicationDomain: rawDomain,
          travelSpeedKmh: typeof inp?.travelSpeedKmh?.rawValue === 'number' ? inp.travelSpeedKmh.rawValue : null,
          boomOrReleaseHeightM: typeof inp?.boomOrReleaseHeightM?.rawValue === 'number' ? inp.boomOrReleaseHeightM.rawValue : null
        },
        exposure: { distanceToSensitiveAreaM: null, labelMinBufferM: null, hasDownwindSensitiveTarget: false }
      } as IrdInput,
      hasCatalogNozzle: Boolean(nozzleLabelPt) || Boolean(rawSource && rawSource.startsWith('catalog')),
      dv10UsedUm: typeof dv10 === 'number' ? dv10 : null,
      hasCertifiedReduction: certDoc
    });
    explanationNotesPt = [...tNotes.saturationNotesPt, ...tNotes.infoOnlyNotesPt];
  } else {
    explanationNotesPt = certDoc
      ? ['Redução de deriva certificada declarada: guardada no histórico como evidência documental, sem alterar o score.']
      : ['Sem notas adicionais disponíveis'];
  }

  return {
    assessmentLevel, assessmentLevelLabelPt: assessmentLevel ? LEVEL_LABELS[assessmentLevel] : null,
    evaluationOrigin, evaluationOriginLabelPt, heightModeLabelPt, airAssistLabelPt, nozzleLabelPt,
    dropletOriginLabel: originLabel, dropletDetailPt: parts.length > 0 ? parts.join(' · ') : null,
    originSummaryPt: originParts.length > 0 ? originParts.join(' · ') : null,
    profileNamesSummaryPt: profNames.length > 0 ? profNames.join(' · ') : null,
    fallbackFlagsPt, certifiedReductionSummaryPt: certSummary, explanationNotesPt, isLegacyWithoutTrace: false
  };
}
