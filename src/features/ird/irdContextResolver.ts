import { getActiveAgronomicSelection, type ActiveAgronomicSelection } from '../../db/activeSelectionStorage.ts';
import type { ProfileCalibration, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../db/types.ts';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import { buildNozzleInputFromCatalog } from './irdNozzleAdapter.ts';
import { extractCalibrationSafely, mapEquipmentProfileToIrd, matchNozzleProfileToCatalog, resolveNozzleRowId } from './irdProfileMappers.ts';
import type { IrdInput, IrdNozzleInput, IrdWeatherInput } from './irdTypes.ts';
import type {
  IrdAssessmentLevelSnapshot, IrdCalibrationBlockState, IrdCultureBlockState, IrdEquipmentBlockState,
  IrdEvaluationLevel, IrdExposureBlockState, IrdHeightCharacterizationMode, IrdNozzleBlockState, IrdTriStateStatus
} from './irdOriginTypes.ts';

export interface ActiveIrdResolvedContext {
  readonly evaluationLevel: IrdEvaluationLevel;
  readonly assessmentLevelSnapshot: IrdAssessmentLevelSnapshot | null;
  readonly irdInput: IrdInput;
  readonly catalogNozzle: Nozzle | undefined;
  readonly blockingGapsPt: readonly string[];
  readonly activeHeightMode: IrdHeightCharacterizationMode;
  readonly cultureDisplayName: string;
  readonly activeAirAssistStatus: IrdTriStateStatus;
  readonly calibratedAirflowM3h: number | null;
  readonly levelNotesPt: readonly string[];
  readonly originTrace: {
    readonly cultureOrigin: 'profile' | 'manual'; readonly cultureProfileId: string | null; readonly cultureProfileName: string | null;
    readonly equipmentOrigin: 'profile' | 'manual'; readonly equipmentProfileId: string | null; readonly equipmentProfileName: string | null;
    readonly nozzleOrigin: 'profile' | 'manual'; readonly nozzleProfileId: string | null; readonly nozzleProfileLabel: string | null;
    readonly calibrationOrigin: 'profile' | 'manual'; readonly calibrationProfileId: string | null; readonly calibrationProfileLabel: string | null;
  };
}

export function resolveActiveIrdContext(params: {
  readonly evaluationLevel?: IrdEvaluationLevel;
  readonly userId?: string | null;
  readonly activeSelection?: ActiveAgronomicSelection | null;
  readonly activeWeather: IrdWeatherInput;
  readonly culture: IrdCultureBlockState;
  readonly equipment: IrdEquipmentBlockState;
  readonly nozzle: IrdNozzleBlockState;
  readonly calibration: IrdCalibrationBlockState;
  readonly exposure: IrdExposureBlockState;
  readonly profiles: {
    readonly cultures: readonly ProfileCulture[]; readonly equipments: readonly ProfileEquipment[];
    readonly profileNozzles: readonly ProfileNozzle[]; readonly calibrations: readonly ProfileCalibration[];
    readonly catalog: readonly Nozzle[];
  };
  readonly locationName: string;
}): ActiveIrdResolvedContext {
  const { activeWeather, culture, equipment, nozzle, calibration, exposure, profiles, locationName } = params;
  const level: IrdEvaluationLevel = params.evaluationLevel ?? (equipment.mode === 'profile' && calibration.mode === 'profile' && nozzle.mode === 'profile' ? 'level3_profiles' : 'level2_quick');
  const persisted = params.activeSelection ?? getActiveAgronomicSelection(params.userId);
  const blockingGapsPt: string[] = [];
  const levelNotesPt: string[] = [];
  const isProfileLevel = level === 'level3_profiles';

  const cultId = culture.selectedProfileId || persisted?.cultureParcelId || '';
  const eqId = equipment.selectedProfileId || persisted?.equipmentId || '';
  const nozId = nozzle.selectedProfileId || persisted?.nozzleProfileId || '';
  const calId = calibration.selectedProfileId || persisted?.calibrationId || '';

  const selectedCult = isProfileLevel ? profiles.cultures.find((c) => String(c.id) === cultId) : undefined;
  const cultureDisplayName = isProfileLevel ? (selectedCult?.name || locationName) : (culture.manualLabel.trim() || locationName);
  if (isProfileLevel && !selectedCult) blockingGapsPt.push('Cultura: selecione um perfil de cultura guardado.');

  const selectedEq = isProfileLevel ? profiles.equipments.find((e) => String(e.id) === eqId) : undefined;
  const mappedEq = mapEquipmentProfileToIrd(selectedEq);
  let applicationDomain = equipment.manual.applicationDomain;
  let activeAirAssistStatus: IrdTriStateStatus = equipment.manual.airAssistStatus;
  let [eqHeight, eqSpeed]: [number | null, number | null] = [null, null];

  if (isProfileLevel) {
    if (!selectedEq || !mappedEq) {
      blockingGapsPt.push('Equipamento: selecione um perfil de equipamento guardado.');
      activeAirAssistStatus = 'unknown';
    } else {
      applicationDomain = mappedEq.applicationDomain;
      activeAirAssistStatus = mappedEq.airAssistStatus;
      eqHeight = mappedEq.defaultHeightM;
      eqSpeed = mappedEq.defaultSpeedKmh;
      if (mappedEq.isAmbiguousDistribution && mappedEq.notePt) blockingGapsPt.push(mappedEq.notePt);
      if (applicationDomain !== 'horizontal_boom') {
        blockingGapsPt.push('Equipamento arbóreo/copa ou lança: o schema atual não guarda altura calibrada (TODO Fase C). Use Avaliação Rápida Manual.');
      }
    }
  }

  let resolvedCatalogNozzle: Nozzle | undefined;
  let nozzleProfileLabel: string | null = null;
  const activeProfNoz = isProfileLevel ? profiles.profileNozzles.find((n) => String(n.id) === nozId || resolveNozzleRowId(n) === nozId) : undefined;
  if (isProfileLevel) {
    if (!activeProfNoz) {
      blockingGapsPt.push('Bico: selecione um perfil de bico guardado.');
    } else {
      const match = matchNozzleProfileToCatalog(activeProfNoz, profiles.catalog);
      nozzleProfileLabel = match.rawLabel || `${activeProfNoz.manufacturer} ${activeProfNoz.model}`.trim();
      if (match.status === 'exact' && match.matchedNozzle) resolvedCatalogNozzle = match.matchedNozzle;
      else if (nozzle.profileConfirmedCatalogId) resolvedCatalogNozzle = profiles.catalog.find((n) => n.id === nozzle.profileConfirmedCatalogId);
      else blockingGapsPt.push(
        match.status === 'none'
          ? `Bico "${nozzleProfileLabel}": sem correspondência no catálogo local (estado: none); selecione variante existente ou mude para Avaliação Rápida Manual.`
          : `Bico "${nozzleProfileLabel}": confirme a variante exata no catálogo local.`
      );
    }
  } else if (nozzle.manualCascade.catalogNozzleId) {
    resolvedCatalogNozzle = profiles.catalog.find((n) => n.id === nozzle.manualCascade.catalogNozzleId);
  }

  let workingPressureBar: number | null = calibration.manual.workingPressureBar;
  let travelSpeedKmh: number | null = calibration.manual.travelSpeedKmh;
  let boomOrReleaseHeightM: number | null = calibration.manual.boomOrReleaseHeightM;
  let activeHeightMode: IrdHeightCharacterizationMode = applicationDomain === 'horizontal_boom' ? 'horizontal_boom_ground' : calibration.manual.heightMode;
  let calProfileLabel: string | null = null;
  let calibratedAirflowM3h: number | null = null;
  let dropletOverride: Partial<IrdNozzleInput> = {};

  if (isProfileLevel) {
    activeHeightMode = 'horizontal_boom_ground';
    const selCal = profiles.calibrations.find((c) => String(c.id) === calId)
      ?? (persisted?.calibrationId === undefined ? undefined : profiles.calibrations[0]);
    const safeCal = extractCalibrationSafely(selCal);
    if (!selCal || !safeCal) {
      workingPressureBar = null; travelSpeedKmh = null; boomOrReleaseHeightM = null;
      blockingGapsPt.push('Calibração: selecione um perfil de calibração guardado.');
    } else {
      workingPressureBar = safeCal.workingPressureBar;
      travelSpeedKmh = safeCal.workingSpeedKmh ?? eqSpeed;
      boomOrReleaseHeightM = eqHeight;
      calibratedAirflowM3h = safeCal.airflowM3h;
      calProfileLabel = `${selCal.nomePerfil || selCal.equipment_name || `Calibração #${selCal.id}`} (${workingPressureBar ?? '-'} bar)`;
      if (calibratedAirflowM3h !== null && calibratedAirflowM3h > 0 && applicationDomain === 'horizontal_boom') {
        activeAirAssistStatus = 'yes';
      }
      if (workingPressureBar === null) blockingGapsPt.push('Calibração: falta pressão de trabalho válida.');
      if (travelSpeedKmh === null) blockingGapsPt.push('Calibração: falta velocidade de avanço válida.');
      if (boomOrReleaseHeightM === null && applicationDomain === 'horizontal_boom') {
        blockingGapsPt.push('Equipamento barra horizontal sem boom_height_m preenchido; não é assumido 0,5 m por omissão.');
      }
    }
    levelNotesPt.push('Exposição não confirmada em perfil nesta Onda 1: mantida avaliação conservadora de distância.');
  } else {
    if (applicationDomain !== 'horizontal_boom' && (activeHeightMode === 'descriptive_unavailable' || activeHeightMode === 'culture_profile_canopy')) {
      boomOrReleaseHeightM = null;
      blockingGapsPt.push(activeHeightMode === 'culture_profile_canopy'
        ? 'Altura de copa (requer evolução futura): o motor atual exige altura numérica medida (m) e não converte automaticamente altura de copa.'
        : 'Altura não medida (modo descritivo): o motor atual requer altura numérica (m) para concluir; não é inventado 0,5 m.');
    }
    if (activeAirAssistStatus === 'unknown') levelNotesPt.push('Assistência de ar desconhecida: mantida abordagem conservadora distinta de Não.');
    const m = calibration.manual;
    const manualRotaryType = !resolvedCatalogNozzle && m.dropletMode === 'rotary' ? { nozzleType: 'rotativo' } : {};
    if (m.dropletMode === 'rotary' && m.representativeDropletDiameterUm !== null) {
      dropletOverride = { ...manualRotaryType, representativeDropletDiameterUm: m.representativeDropletDiameterUm, measurementSource: m.measurementSource, measurementPressureBar: m.measurementPressureBar, measurementDate: m.measurementDate, measurementConfidence: m.measurementConfidence };
    } else if (m.dropletMode === 'conventional' && (m.measuredDv10Um !== null || m.measuredDv50Um !== null || m.measuredDv90Um !== null)) {
      dropletOverride = { measuredDv10Um: m.measuredDv10Um, measuredDv50Um: m.measuredDv50Um, measuredDv90Um: m.measuredDv90Um, measurementSource: m.measurementSource, measurementPressureBar: m.measurementPressureBar, measurementDate: m.measurementDate, measurementConfidence: m.measurementConfidence };
    }
  }

  const hasAirSleeve = applicationDomain === 'horizontal_boom' && activeAirAssistStatus === 'yes' && !(isProfileLevel && (!mappedEq || mappedEq.isAmbiguousDistribution));
  const activeExposure = isProfileLevel
    ? { distanceToSensitiveAreaM: null, labelMinBufferM: null, hasDownwindSensitiveTarget: true }
    : { distanceToSensitiveAreaM: exposure.distanceToSensitiveAreaM, labelMinBufferM: exposure.labelBufferKnown ? exposure.labelMinBufferM : null, hasDownwindSensitiveTarget: exposure.downwindStatus !== 'no' };
  const baseNozzle: IrdNozzleInput = resolvedCatalogNozzle ? buildNozzleInputFromCatalog(resolvedCatalogNozzle, workingPressureBar, hasAirSleeve) : { workingPressureBar, hasAirSleeve };
  const irdInput: IrdInput = { weather: activeWeather, nozzle: { ...baseNozzle, ...dropletOverride, workingPressureBar, hasAirSleeve }, operation: { applicationDomain, travelSpeedKmh, boomOrReleaseHeightM }, exposure: activeExposure };

  let assessmentLevelSnapshot: IrdAssessmentLevelSnapshot | null = null;
  if (level === 'level3_profiles') assessmentLevelSnapshot = 'detailed_profiles';
  else if (level === 'level2_quick') {
    assessmentLevelSnapshot = (Boolean(resolvedCatalogNozzle) || Object.keys(dropletOverride).length > 0) && exposure.distanceToSensitiveAreaM !== null ? 'quick_manual' : 'quick_partial';
  }

  return {
    evaluationLevel: level, assessmentLevelSnapshot, irdInput, catalogNozzle: resolvedCatalogNozzle,
    blockingGapsPt, activeHeightMode, cultureDisplayName, activeAirAssistStatus, calibratedAirflowM3h, levelNotesPt,
    originTrace: {
      cultureOrigin: isProfileLevel ? 'profile' : 'manual', cultureProfileId: selectedCult?.id ? String(selectedCult.id) : null, cultureProfileName: selectedCult?.name ?? null,
      equipmentOrigin: isProfileLevel ? 'profile' : 'manual', equipmentProfileId: selectedEq?.id ? String(selectedEq.id) : null, equipmentProfileName: selectedEq?.name ?? null,
      nozzleOrigin: isProfileLevel ? 'profile' : 'manual', nozzleProfileId: activeProfNoz ? (resolveNozzleRowId(activeProfNoz) || String(activeProfNoz.id)) : null, nozzleProfileLabel,
      calibrationOrigin: isProfileLevel ? 'profile' : 'manual', calibrationProfileId: isProfileLevel && (calId || calibration.selectedProfileId) ? (calId || calibration.selectedProfileId) : null, calibrationProfileLabel: calProfileLabel
    }
  };
}
