import {
  type PhysicalDimension,
  type StructuredValue
} from '../../types/calculator.ts';
import type { IrdAssessmentResult, IrdInput } from './irdTypes.ts';
import type {
  IrdAssessmentLevelSnapshot,
  IrdBlockOriginMode,
  IrdCertifiedDriftReduction,
  IrdHeightCharacterizationMode,
  IrdSensitiveZoneCategory,
  IrdTriStateStatus
} from './irdOriginTypes.ts';
import { IRD_LEGAL_DISCLAIMER, IRD_VERSIONS } from './irdConfig.ts';
export { readIrdHistoryTrace, type IrdHistoryTraceSummary } from './irdHistoryTraceReader.ts';

export interface IrdSaveOriginTrace {
  readonly assessmentLevel?: IrdAssessmentLevelSnapshot | null;
  readonly evaluationOrigin?: IrdBlockOriginMode;
  readonly heightMode?: IrdHeightCharacterizationMode;
  readonly cultureOrigin: 'profile' | 'manual';
  readonly cultureProfileId?: string | null;
  readonly cultureProfileName: string | null;
  readonly equipmentOrigin: 'profile' | 'manual';
  readonly equipmentProfileId?: string | null;
  readonly equipmentProfileName: string | null;
  readonly activeAirAssistStatus: IrdTriStateStatus;
  readonly nozzleOrigin: 'profile' | 'manual';
  readonly nozzleProfileId?: string | null;
  readonly nozzleProfileLabel: string | null;
  readonly nozzleCatalogLabel?: string | null;
  readonly calibrationOrigin: 'profile' | 'manual';
  readonly calibrationProfileId?: string | null;
  readonly calibrationProfileLabel: string | null;
  readonly downwindStatus: IrdTriStateStatus;
  readonly labelBufferKnown: boolean;
  readonly sensitiveZoneCategory: IrdSensitiveZoneCategory | '';
  readonly certifiedReduction?: IrdCertifiedDriftReduction;
}

function sv(
  localId: string, rawValue: number | string, unit: string, dimension: PhysicalDimension,
  canonicalKey: string, label: string, source: 'user_input' | 'calculated_output' | 'preset_default'
): StructuredValue {
  return {
    rawValue, unit, normalizedValue: typeof rawValue === 'number' ? rawValue : null,
    normalizedUnit: typeof rawValue === 'number' ? unit : null, dimension, canonicalKey, label, source,
    localId, calculatorId: IRD_VERSIONS.calculatorId, calculatorVersion: IRD_VERSIONS.formulaVersion
  };
}

export function buildIrdStructuredInputs(
  input: IrdInput,
  result: IrdAssessmentResult,
  trace?: IrdSaveOriginTrace
): Record<string, StructuredValue> {
  const { weather, nozzle, operation, exposure } = input;
  const labelBufferVal = exposure.labelMinBufferM !== null && exposure.labelMinBufferM !== undefined ? exposure.labelMinBufferM : 'nao_conhecida';
  const inputs: Record<string, StructuredValue> = {
    formulaVersion: sv('formulaVersion', result.versions.formulaVersion, '', 'text', 'ird_formula_version', 'Versão da Fórmula', 'preset_default'),
    rulesetVersion: sv('rulesetVersion', result.versions.rulesetVersion, '', 'text', 'ird_ruleset_version', 'Versão das Regras', 'preset_default'),
    nozzleCatalogVersion: sv('nozzleCatalogVersion', result.versions.nozzleCatalogVersion, '', 'text', 'nozzle_catalog_version', 'Versão do Catálogo', 'preset_default'),
    weatherSource: sv('weatherSource', weather.weatherSource ?? 'manual_field', '', 'text', 'weather_source', 'Origem Meteorológica', 'user_input'),
    weatherAgeMinutes: sv('weatherAgeMinutes', weather.weatherAgeMinutes ?? 0, 'min', 'time', 'weather_age_min', 'Idade da Previsão', 'user_input'),
    windSpeedKmh: sv('windSpeedKmh', weather.windSpeedKmh ?? 0, 'km/h', 'speed', 'wind_speed', 'Velocidade do Vento', 'user_input'),
    windGustsKmh: sv('windGustsKmh', weather.windGustsKmh ?? weather.windSpeedKmh ?? 0, 'km/h', 'speed', 'wind_gusts', 'Rajada de Vento', 'user_input'),
    temperatureC: sv('temperatureC', weather.temperatureC ?? 0, '°C', 'text', 'air_temperature', 'Temperatura do Ar', 'user_input'),
    relativeHumidityPct: sv('relativeHumidityPct', weather.relativeHumidityPct ?? 0, '%', 'percentage', 'relative_humidity', 'Humidade Relativa', 'user_input'),
    precipitationMm: sv('precipitationMm', weather.precipitationMm ?? 0, 'mm', 'length', 'precipitation', 'Precipitação', 'user_input'),
    nozzleId: sv('nozzleId', nozzle.nozzleId ?? 'custom', '', 'text', 'nozzle_id', 'Identificador do Bico', 'user_input'),
    nozzleType: sv('nozzleType', nozzle.nozzleType ?? 'não especificado', '', 'text', 'nozzle_type', 'Tipo de Bico', 'user_input'),
    workingPressureBar: sv('workingPressureBar', nozzle.workingPressureBar ?? 0, 'bar', 'pressure', 'working_pressure', 'Pressão de Trabalho', 'user_input'),
    hasAirSleeve: sv('hasAirSleeve', nozzle.hasAirSleeve ? 'sim' : 'nao', '', 'text', 'air_sleeve', 'Manga de Ar', 'user_input'),
    applicationDomain: sv('applicationDomain', operation.applicationDomain, '', 'text', 'application_domain', 'Domínio de Aplicação', 'user_input'),
    travelSpeedKmh: sv('travelSpeedKmh', operation.travelSpeedKmh ?? 0, 'km/h', 'speed', 'travel_speed', 'Velocidade de Avanço', 'user_input'),
    boomOrReleaseHeightM: sv('boomOrReleaseHeightM', operation.boomOrReleaseHeightM ?? 0, 'm', 'length', 'boom_height', 'Altura da Barra / Libertação', 'user_input'),
    distanceToSensitiveAreaM: sv('distanceToSensitiveAreaM', exposure.distanceToSensitiveAreaM ?? 'nao_confirmada', 'm', 'length', 'buffer_distance_actual', 'Distância a Área Sensível', 'user_input'),
    labelMinBufferM: sv('labelMinBufferM', labelBufferVal, typeof labelBufferVal === 'number' ? 'm' : '', typeof labelBufferVal === 'number' ? 'length' : 'text', 'label_min_buffer', 'Zona Tampão do Rótulo Oficial', 'user_input'),
    hasDownwindSensitiveTarget: sv('hasDownwindSensitiveTarget', exposure.hasDownwindSensitiveTarget ? 'sim' : 'nao', '', 'text', 'downwind_target', 'Alvo Sensível a Sotavento', 'user_input')
  };

  if (typeof nozzle.measuredDv10Um === 'number') inputs.measuredDv10Um = sv('measuredDv10Um', nozzle.measuredDv10Um, 'µm', 'length', 'measured_dv10_um', 'DV10 Medido/Declarado', 'user_input');
  if (typeof nozzle.measuredDv50Um === 'number') inputs.measuredDv50Um = sv('measuredDv50Um', nozzle.measuredDv50Um, 'µm', 'length', 'measured_dv50_um', 'DV50 Medido/Declarado', 'user_input');
  if (typeof nozzle.measuredDv90Um === 'number') inputs.measuredDv90Um = sv('measuredDv90Um', nozzle.measuredDv90Um, 'µm', 'length', 'measured_dv90_um', 'DV90 Medido/Declarado', 'user_input');
  if (typeof nozzle.representativeDropletDiameterUm === 'number') inputs.representativeDropletDiameterUm = sv('representativeDropletDiameterUm', nozzle.representativeDropletDiameterUm, 'µm', 'length', 'representative_droplet_um', 'Diâmetro Representativo Declarado', 'user_input');
  if (nozzle.measurementSource) inputs.measurementSource = sv('measurementSource', nozzle.measurementSource, '', 'text', 'droplet_measurement_source', 'Origem da Medição de Gota', 'user_input');
  if (typeof nozzle.measurementPressureBar === 'number') inputs.measurementPressureBar = sv('measurementPressureBar', nozzle.measurementPressureBar, 'bar', 'pressure', 'droplet_measurement_pressure', 'Pressão de Referência da Medição', 'user_input');
  if (nozzle.measurementDate) inputs.measurementDate = sv('measurementDate', nozzle.measurementDate, '', 'date', 'droplet_measurement_date', 'Data da Medição de Gota', 'user_input');
  if (nozzle.measurementConfidence) inputs.measurementConfidence = sv('measurementConfidence', nozzle.measurementConfidence, '', 'text', 'droplet_measurement_confidence', 'Confiança da Medição de Gota', 'user_input');

  if (trace) {
    if (trace.assessmentLevel) inputs.assessmentLevel = sv('assessmentLevel', trace.assessmentLevel, '', 'text', 'ird_assessment_level', 'Nível de Avaliação', 'user_input');
    if (trace.evaluationOrigin) inputs.evaluationOrigin = sv('evaluationOrigin', trace.evaluationOrigin, '', 'text', 'ird_evaluation_origin', 'Origem da Avaliação', 'user_input');
    if (trace.heightMode) inputs.heightMode = sv('heightMode', trace.heightMode, '', 'text', 'ird_height_mode', 'Caracterização da Altura', 'user_input');
    inputs.cultureOriginMode = sv('cultureOriginMode', trace.cultureOrigin, '', 'text', 'ird_culture_origin', 'Origem da Cultura', 'user_input');
    if (trace.cultureProfileId) inputs.cultureProfileId = sv('cultureProfileId', trace.cultureProfileId, '', 'text', 'ird_culture_profile_id', 'ID Perfil de Cultura', 'user_input');
    if (trace.cultureProfileName) inputs.cultureProfileName = sv('cultureProfileName', trace.cultureProfileName, '', 'text', 'ird_culture_profile_name', 'Perfil de Cultura Usado', 'user_input');
    inputs.equipmentOriginMode = sv('equipmentOriginMode', trace.equipmentOrigin, '', 'text', 'ird_equipment_origin', 'Origem do Equipamento', 'user_input');
    if (trace.equipmentProfileId) inputs.equipmentProfileId = sv('equipmentProfileId', trace.equipmentProfileId, '', 'text', 'ird_equipment_profile_id', 'ID Perfil de Equipamento', 'user_input');
    if (trace.equipmentProfileName) inputs.equipmentProfileName = sv('equipmentProfileName', trace.equipmentProfileName, '', 'text', 'ird_equipment_profile_name', 'Perfil de Equipamento Usado', 'user_input');
    inputs.airAssistStatus = sv('airAssistStatus', trace.activeAirAssistStatus, '', 'text', 'ird_air_assist_status', 'Estado da Assistência de Ar', 'user_input');
    inputs.nozzleOriginMode = sv('nozzleOriginMode', trace.nozzleOrigin, '', 'text', 'ird_nozzle_origin', 'Origem do Bico', 'user_input');
    if (trace.nozzleProfileId) inputs.nozzleProfileId = sv('nozzleProfileId', trace.nozzleProfileId, '', 'text', 'ird_nozzle_profile_id', 'ID Perfil de Bico', 'user_input');
    if (trace.nozzleProfileLabel) inputs.nozzleProfileLabel = sv('nozzleProfileLabel', trace.nozzleProfileLabel, '', 'text', 'ird_nozzle_profile_label', 'Perfil de Bico Usado', 'user_input');
    if (trace.nozzleCatalogLabel) inputs.nozzleCatalogLabel = sv('nozzleCatalogLabel', trace.nozzleCatalogLabel, '', 'text', 'ird_nozzle_catalog_label', 'Bico do Catálogo Usado', 'user_input');
    inputs.calibrationOriginMode = sv('calibrationOriginMode', trace.calibrationOrigin, '', 'text', 'ird_calibration_origin', 'Origem da Calibração', 'user_input');
    if (trace.calibrationProfileId) inputs.calibrationProfileId = sv('calibrationProfileId', trace.calibrationProfileId, '', 'text', 'ird_calibration_profile_id', 'ID Perfil de Calibração', 'user_input');
    if (trace.calibrationProfileLabel) inputs.calibrationProfileLabel = sv('calibrationProfileLabel', trace.calibrationProfileLabel, '', 'text', 'ird_calibration_profile_label', 'Perfil de Calibração Usado', 'user_input');
    inputs.downwindStatus = sv('downwindStatus', trace.downwindStatus, '', 'text', 'ird_downwind_tristate', 'Sotavento (Sim/Não/Não sei)', 'user_input');
    inputs.labelBufferKnown = sv('labelBufferKnown', trace.labelBufferKnown ? 'sim' : 'nao', '', 'text', 'ird_label_buffer_known', 'Distância do Rótulo Conhecida', 'user_input');
    if (trace.sensitiveZoneCategory) inputs.sensitiveZoneCategory = sv('sensitiveZoneCategory', trace.sensitiveZoneCategory, '', 'text', 'ird_sensitive_zone_category', 'Tipo de Zona Sensível (Informativo)', 'user_input');

    const cert = trace.certifiedReduction;
    if (cert) {
      inputs.certifiedReductionStatus = sv('certifiedReductionStatus', cert.status, '', 'text', 'ird_cert_reduction_status', 'Estado Redução Certificada', 'user_input');
      if (cert.status === 'documented') {
        inputs.certifiedReductionScope = sv('certifiedReductionScope', cert.scope, '', 'text', 'ird_cert_reduction_scope', 'Âmbito Redução Certificada', 'user_input');
        if (typeof cert.reductionPct === 'number') inputs.certifiedReductionPct = sv('certifiedReductionPct', cert.reductionPct, '%', 'percentage', 'ird_cert_reduction_pct', 'Percentagem Redução Certificada (Não Aplicada)', 'user_input');
        if (cert.reductionClassText) inputs.certifiedReductionClass = sv('certifiedReductionClass', cert.reductionClassText, '', 'text', 'ird_cert_reduction_class', 'Classe Redução Consultada', 'user_input');
        if (cert.classifierSystemAndCountry) inputs.certifiedReductionEntity = sv('certifiedReductionEntity', cert.classifierSystemAndCountry, '', 'text', 'ird_cert_reduction_entity', 'Entidade Classificadora e País', 'user_input');
        if (cert.documentOrTestRef) inputs.certifiedReductionDocRef = sv('certifiedReductionDocRef', cert.documentOrTestRef, '', 'text', 'ird_cert_reduction_doc', 'Referência Documental Certificação', 'user_input');
        if (cert.applicablePressureText) inputs.certifiedReductionPressure = sv('certifiedReductionPressure', cert.applicablePressureText, '', 'text', 'ird_cert_reduction_pressure', 'Pressão Aplicável Certificação', 'user_input');
        inputs.certifiedReductionSource = sv('certifiedReductionSource', cert.source, '', 'text', 'ird_cert_reduction_source', 'Origem Informação Certificação', 'user_input');
        inputs.certifiedReductionAppliedToScore = sv('certifiedReductionAppliedToScore', 'nao', '', 'text', 'ird_cert_reduction_applied', 'Aplicada à Pontuação', 'preset_default');
      }
    }
  }
  return inputs;
}

export function buildIrdStructuredOutputs(result: IrdAssessmentResult): Record<string, StructuredValue> {
  const d = result.derived;
  return {
    irdScore: sv('irdScore', result.irdScore, 'pts', 'count', 'ird_score', 'Índice de Risco de Deriva', 'calculated_output'),
    irdClass: sv('irdClass', result.irdClass, '', 'text', 'ird_class', 'Classe de Risco IRD', 'calculated_output'),
    subMeteo: sv('subMeteo', result.subIndices.meteo, 'pts', 'count', 'ird_sub_meteo', 'Subíndice Meteorológico', 'calculated_output'),
    subEspectro: sv('subEspectro', result.subIndices.espectro, 'pts', 'count', 'ird_sub_espectro', 'Subíndice Espectro de Gotas', 'calculated_output'),
    subOperacao: sv('subOperacao', result.subIndices.operacao, 'pts', 'count', 'ird_sub_operacao', 'Subíndice Operacional', 'calculated_output'),
    subExposicao: sv('subExposicao', result.subIndices.exposicao, 'pts', 'count', 'ird_sub_exposicao', 'Subíndice Exposição Ambiental', 'calculated_output'),
    deltaTC: sv('deltaTC', d.deltaTC, '°C', 'text', 'delta_t', 'Delta T', 'calculated_output'),
    effectiveWindKmh: sv('effectiveWindKmh', d.effectiveWindKmh, 'km/h', 'speed', 'effective_wind', 'Vento Efetivo', 'calculated_output'),
    nozzleResolutionTier: sv('nozzleResolutionTier', d.nozzleResolutionTier, '', 'text', 'nozzle_resolution_tier', 'Nível de Evidência do Bico', 'calculated_output'),
    dv10UsedUm: d.dv10UsedUm !== null ? sv('dv10UsedUm', d.dv10UsedUm, 'µm', 'length', 'dv10_used_um', 'DV10 Resolvido/Efetivo', 'calculated_output') : sv('dv10UsedUm', 'nao_aplicavel', '', 'text', 'dv10_used_um', 'DV10 Resolvido/Efetivo', 'calculated_output'),
    dv50UsedUm: d.dv50UsedUm !== null ? sv('dv50UsedUm', d.dv50UsedUm, 'µm', 'length', 'dv50_used_um', 'DV50 Resolvido/Efetivo', 'calculated_output') : sv('dv50UsedUm', 'nao_aplicavel', '', 'text', 'dv50_used_um', 'DV50 Resolvido/Efetivo', 'calculated_output'),
    dv90UsedUm: d.dv90UsedUm !== null ? sv('dv90UsedUm', d.dv90UsedUm, 'µm', 'length', 'dv90_used_um', 'DV90 Resolvido/Efetivo', 'calculated_output') : sv('dv90UsedUm', 'nao_aplicavel', '', 'text', 'dv90_used_um', 'DV90 Resolvido/Efetivo', 'calculated_output'),
    dropletSource: sv('dropletSource', d.dropletSource, '', 'text', 'droplet_source_used', 'Origem do Diâmetro Usado', 'calculated_output'),
    dropletConfidence: sv('dropletConfidence', d.dropletConfidence, '', 'text', 'droplet_confidence', 'Confiança do Espectro', 'calculated_output'),
    legalVerdict: sv('legalVerdict', result.legalVerdict, '', 'text', 'ird_legal_verdict', 'Veredicto Operacional', 'calculated_output'),
    dataConfidenceLevel: sv('dataConfidenceLevel', result.dataConfidenceLevel, '', 'text', 'ird_data_confidence', 'Nível de Confiança dos Dados', 'calculated_output'),
    fallbackFlags: sv('fallbackFlags', JSON.stringify(result.fallbackFlags), '', 'text', 'ird_fallback_flags', 'Regras de Precaução Acionadas', 'calculated_output'),
    blocks: sv('blocks', JSON.stringify(result.blocks), '', 'text', 'ird_blocks', 'Bloqueios Registados', 'calculated_output'),
    warnings: sv('warnings', JSON.stringify(result.warnings), '', 'text', 'ird_warnings', 'Avisos e Restrições', 'calculated_output'),
    legalDisclaimer: sv('legalDisclaimer', IRD_LEGAL_DISCLAIMER.statementPt, '', 'text', 'dgav_sifito_disclaimer', 'Prevalência do Rótulo Oficial (Não ISO 22866)', 'preset_default')
  };
}
