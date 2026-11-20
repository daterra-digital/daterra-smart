import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db.ts';
import { getActiveAgronomicSelection } from '../../db/activeSelectionStorage.ts';
import type { ProfileCalibration, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../db/types.ts';
import { useAuth } from '../../context/AuthContext';
import { useWeather } from '../weather/hooks/useWeather';
import { NOZZLES_DATABASE } from '../nozzle-comparison/nozzleComparison.data.ts';
import type { CalculationHistoryRecord } from '../../types/calculator.ts';
import { calculateDriftRiskIndex } from './irdEngine.ts';
import { resolveNozzleDriftProfile } from './irdNozzleAdapter.ts';
import { listIrdHistory, saveIrdAssessment, softDeleteIrdAssessment } from './irdHistoryAdapter.ts';
import { mapEquipmentProfileToIrd } from './irdProfileMappers.ts';
import type { AnyIrdKeypadField } from './irdKeypadMeta.ts';
import type { IrdEvaluationLevel } from './irdOriginTypes.ts';
import { formatAirAssistNote, HEIGHT_MODE_LABELS } from './irdHistoryTraceReader.ts';
import { buildActiveWeatherInput, buildIrdWeatherSummary, buildWeatherDriftEval, getIrdKeypadInitialValue } from './irdWeatherBridge.ts';
import { resolveActiveIrdContext } from './irdContextResolver.ts';
import {
  copyCalibrationProfileToManual, copyCultureProfileToManual, copyEquipmentProfileToManual, copyNozzleProfileToManual,
  createInitialCalibrationState, createInitialCultureState, createInitialEquipmentState,
  createInitialExposureState, createInitialNozzleState, createInitialWeatherManual
} from './irdContextCopies.ts';
import type { IrdWeatherInput, IrdWeatherSource } from './irdTypes.ts';

const EMPTY_CULTURES: ProfileCulture[] = [];
const EMPTY_EQUIPMENT: ProfileEquipment[] = [];
const EMPTY_NOZZLES: ProfileNozzle[] = [];
const EMPTY_CALIBRATIONS: ProfileCalibration[] = [];

export function useIrdCalculatorController() {
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || null;
  const weatherCtx = useWeather();
  const { data: weatherData, currentLocation } = weatherCtx;

  const [evaluationLevel, setEvaluationLevel] = useState<IrdEvaluationLevel>('level1_meteo');
  const [isOffline, setIsOffline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const [isWeatherDrawerOpen, setIsWeatherDrawerOpen] = useState(false);
  const [culture, setCulture] = useState(createInitialCultureState);
  const [equipment, setEquipment] = useState(createInitialEquipmentState);
  const [nozzle, setNozzle] = useState(createInitialNozzleState);
  const [calibration, setCalibration] = useState(createInitialCalibrationState);
  const [exposure, setExposure] = useState(createInitialExposureState);
  const [manualSource, setManualSource] = useState<IrdWeatherSource | null>(null);
  const [manualWeather, setManualWeather] = useState<IrdWeatherInput>(createInitialWeatherManual);
  const [activeKeypad, setActiveKeypad] = useState<{ field: AnyIrdKeypadField; initialValue: string } | null>(null);
  const [historyRecords, setHistoryRecords] = useState<CalculationHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [statusToast, setStatusToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const historyReqRef = useRef(0);
  const cultures = useLiveQuery(() => (effectiveUserId ? db.profiles_cultures.where('userId').equals(effectiveUserId).toArray() : []), [effectiveUserId]) ?? EMPTY_CULTURES;
  const equipments = useLiveQuery(() => (effectiveUserId ? db.profiles_equipment.where('userId').equals(effectiveUserId).toArray() : []), [effectiveUserId]) ?? EMPTY_EQUIPMENT;
  const profileNozzles = useLiveQuery(() => (effectiveUserId ? db.profiles_nozzles.where('userId').equals(effectiveUserId).toArray() : []), [effectiveUserId]) ?? EMPTY_NOZZLES;
  const calibrations = useLiveQuery(() => (effectiveUserId ? db.profiles_calibrations.where('userId').equals(effectiveUserId).toArray() : []), [effectiveUserId]) ?? EMPTY_CALIBRATIONS;

  useEffect(() => {
    const syncNet = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', syncNet); window.addEventListener('offline', syncNet);
    return () => { window.removeEventListener('online', syncNet); window.removeEventListener('offline', syncNet); };
  }, []);
  useEffect(() => {
    const sel = getActiveAgronomicSelection(effectiveUserId);
    setEvaluationLevel('level1_meteo'); setIsWeatherDrawerOpen(false); setActiveKeypad(null);
    setCulture({ ...createInitialCultureState(), selectedProfileId: sel?.cultureParcelId ?? '' });
    setEquipment({ ...createInitialEquipmentState(), selectedProfileId: sel?.equipmentId ?? '' });
    setNozzle({ ...createInitialNozzleState(), selectedProfileId: sel?.nozzleProfileId ?? '' });
    setCalibration({ ...createInitialCalibrationState(), selectedProfileId: sel?.calibrationId ?? '' });
    setExposure(createInitialExposureState()); setManualSource(null);
    setManualWeather(createInitialWeatherManual()); setHistoryRecords([]);
    setIsHistoryOpen(false); setIsGuideOpen(false); setStatusToast(null);
  }, [effectiveUserId]);
  useEffect(() => {
    setManualSource(null); setManualWeather(createInitialWeatherManual()); setExposure(createInitialExposureState());
    setActiveKeypad((curr) => (curr && ['windSpeedKmh', 'windGustsKmh', 'temperatureC', 'relativeHumidityPct', 'precipitationMm', 'distanceToSensitiveAreaM', 'labelMinBufferM'].includes(curr.field) ? null : curr));
  }, [currentLocation.id, currentLocation.latitude, currentLocation.longitude]);
  const loadHistory = useCallback(async () => {
    const reqId = ++historyReqRef.current; setIsHistoryLoading(true);
    try {
      const list = await listIrdHistory(effectiveUserId);
      if (historyReqRef.current === reqId) setHistoryRecords(list);
    } finally {
      if (historyReqRef.current === reqId) setIsHistoryLoading(false);
    }
  }, [effectiveUserId]);
  useEffect(() => { void loadHistory(); }, [loadHistory]);
  const weatherAgeMin = useMemo(() => (weatherData?.fetchedAt ? Math.max(0, Math.round((Date.now() - new Date(weatherData.fetchedAt).getTime()) / 60000)) : null), [weatherData?.fetchedAt]);
  const activeWeather = useMemo(() => buildActiveWeatherInput(manualSource, manualWeather, weatherData, weatherAgeMin), [manualSource, manualWeather, weatherData, weatherAgeMin]);
  const weatherEval = useMemo(() => buildWeatherDriftEval(manualSource, activeWeather, weatherData, weatherAgeMin), [manualSource, activeWeather, weatherData, weatherAgeMin]);
  const ctx = useMemo(() => resolveActiveIrdContext({
    evaluationLevel, userId: effectiveUserId, activeWeather, culture, equipment, nozzle, calibration, exposure, locationName: currentLocation.name,
    profiles: { cultures, equipments, profileNozzles, calibrations, catalog: NOZZLES_DATABASE }
  }), [evaluationLevel, effectiveUserId, activeWeather, culture, equipment, nozzle, calibration, exposure, currentLocation.name, cultures, equipments, profileNozzles, calibrations]);

  const resolvedProfile = useMemo(() => {
    const n = ctx.irdInput.nozzle;
    const p = n.workingPressureBar;
    const hasUser = n.measuredDv10Um != null || n.measuredDv50Um != null || n.measuredDv90Um != null || n.representativeDropletDiameterUm != null;
    const previewP = typeof p === 'number' && p > 0 ? p : hasUser ? (ctx.catalogNozzle?.referencePressureBar ?? 3) : null;
    return previewP !== null ? resolveNozzleDriftProfile(n, previewP, ctx.catalogNozzle) : null;
  }, [ctx.irdInput.nozzle, ctx.catalogNozzle]);

  const result = useMemo(() => {
    if (evaluationLevel === 'level1_meteo') return null;
    const raw = calculateDriftRiskIndex(ctx.irdInput, ctx.catalogNozzle);
    return ctx.blockingGapsPt.length > 0 && raw.status === 'CALCULATED'
      ? { status: 'FAIL_CLOSED_INCOMPLETE' as const, versions: raw.versions, irdScore: null, irdClass: 'CRITICO_BLOQUEADO' as const, legalVerdict: 'BLOQUEADO' as const, blocks: [{ code: 'MISSING_WORKING_PRESSURE' as const, messagePt: ctx.blockingGapsPt[0], legalBasisPt: 'Contexto operacional incompleto no nível selecionado.' }], missingOrInvalidFields: ctx.blockingGapsPt, legalDisclaimer: raw.legalDisclaimer }
      : raw;
  }, [evaluationLevel, ctx.irdInput, ctx.catalogNozzle, ctx.blockingGapsPt]);

  const weatherSummary = buildIrdWeatherSummary(activeWeather, weatherAgeMin, currentLocation.name, weatherEval);
  const missingOpFields: string[] = [];
  if (typeof ctx.irdInput.nozzle.workingPressureBar !== 'number') missingOpFields.push('pressão (bar)');
  if (typeof ctx.irdInput.operation.travelSpeedKmh !== 'number') missingOpFields.push('velocidade (km/h)');
  if (typeof ctx.irdInput.operation.boomOrReleaseHeightM !== 'number') missingOpFields.push('altura (m)');

  const handleKeypadConfirm = (val: number) => {
    if (!activeKeypad) return;
    const f = activeKeypad.field;
    if (f === 'windSpeedKmh' || f === 'windGustsKmh' || f === 'temperatureC' || f === 'relativeHumidityPct' || f === 'precipitationMm') {
      setManualSource('manual_field');
      setManualWeather((p) => ({ windSpeedKmh: p.windSpeedKmh ?? activeWeather.windSpeedKmh, windGustsKmh: p.windGustsKmh ?? activeWeather.windGustsKmh, temperatureC: p.temperatureC ?? activeWeather.temperatureC, relativeHumidityPct: p.relativeHumidityPct ?? activeWeather.relativeHumidityPct, precipitationMm: p.precipitationMm ?? activeWeather.precipitationMm ?? null, weatherSource: 'manual_field', weatherAgeMinutes: 0, [f]: val }));
    } else if (f === 'certifiedDriftReductionPct') {
      setNozzle((p) => ({ ...p, certifiedReduction: { ...p.certifiedReduction, status: 'documented', reductionPct: val } }));
    } else if (f === 'distanceToSensitiveAreaM') {
      setExposure((p) => ({ ...p, distanceToSensitiveAreaM: val }));
    } else if (f === 'labelMinBufferM') {
      setExposure((p) => ({ ...p, labelBufferKnown: true, labelMinBufferM: val }));
    } else {
      setCalibration((p) => ({ ...p, manual: { ...p.manual, [f]: val } }));
    }
    setActiveKeypad(null);
  };

  const handleSaveHistory = async () => {
    if (evaluationLevel === 'level1_meteo') {
      return setStatusToast({ type: 'error', text: 'O Nível 1 mostra apenas meteorologia. Avance para Avaliação Rápida ou Detalhada antes de guardar.' });
    }
    if (!result || result.status !== 'CALCULATED') {
      return setStatusToast({ type: 'error', text: 'Complete os dados obrigatórios e a meteorologia antes de guardar no histórico local.' });
    }
    try {
      await saveIrdAssessment(effectiveUserId, ctx.irdInput, result, {
        name: `${ctx.cultureDisplayName} (${currentLocation.name})`,
        originTrace: {
          ...ctx.originTrace, assessmentLevel: ctx.assessmentLevelSnapshot,
          evaluationOrigin: evaluationLevel === 'level3_profiles' ? 'profile' : 'manual',
          heightMode: ctx.activeHeightMode, activeAirAssistStatus: ctx.activeAirAssistStatus,
          nozzleCatalogLabel: ctx.catalogNozzle ? `${ctx.catalogNozzle.brand} ${ctx.catalogNozzle.modelNorm}` : null,
          downwindStatus: exposure.downwindStatus, labelBufferKnown: exposure.labelBufferKnown,
          sensitiveZoneCategory: exposure.sensitiveZoneCategory, certifiedReduction: nozzle.certifiedReduction
        }
      });
      await loadHistory();
      setStatusToast({ type: 'success', text: 'Avaliação guardada neste dispositivo.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setStatusToast({ type: 'error', text: msg === 'history_quota_exceeded' ? 'Limite de 20 avaliações atingido.' : (msg || 'Erro ao guardar avaliação.') });
    }
  };

  const openFieldKeypad = (field: AnyIrdKeypadField) =>
    setActiveKeypad({ field, initialValue: getIrdKeypadInitialValue(field, activeWeather, calibration, nozzle, exposure) });

  const switchToQuickFromProfiles = () => {
    const selEq = equipments.find((e) => String(e.id) === equipment.selectedProfileId);
    const mappedEq = mapEquipmentProfileToIrd(selEq);
    const targetDomain = mappedEq?.applicationDomain ?? equipment.manual.applicationDomain;
    setCulture((p) => copyCultureProfileToManual(p, cultures));
    setEquipment((p) => copyEquipmentProfileToManual(p, equipments));
    setNozzle((p) => copyNozzleProfileToManual(p, profileNozzles, NOZZLES_DATABASE));
    setCalibration((p) => copyCalibrationProfileToManual(p, calibrations, mappedEq?.defaultHeightM ?? null, targetDomain));
    setEvaluationLevel('level2_quick');
    setStatusToast({ type: 'success', text: 'Dados válidos copiados para Avaliação Rápida Manual. Complete o que faltar.' });
  };

  const selectEvaluationLevel = useCallback((lvl: IrdEvaluationLevel) => { setEvaluationLevel(lvl); setStatusToast(null); }, []);

  return {
    effectiveUserId, weatherCtx, evaluationLevel, setEvaluationLevel: selectEvaluationLevel, isOffline, isWeatherDrawerOpen, setIsWeatherDrawerOpen,
    cultures, equipments, profileNozzles, calibrations, culture, setCulture, equipment, setEquipment, nozzle, setNozzle,
    calibration, setCalibration, exposure, setExposure, activeWeather, weatherEval, weatherSummary, resolvedProfile,
    result, ctx, missingOpFields, heightModeLabelPt: HEIGHT_MODE_LABELS[ctx.activeHeightMode],
    airAssistNotePt: formatAirAssistNote(ctx.irdInput.operation.applicationDomain, ctx.activeAirAssistStatus),
    manualSource, setManualSource, setManualWeather, activeKeypad, setActiveKeypad,
    historyRecords, isHistoryLoading, isHistoryOpen, setIsHistoryOpen, isGuideOpen, setIsGuideOpen, statusToast,
    handleKeypadConfirm, handleSaveHistory, openFieldKeypad, switchToQuickFromProfiles,
    deleteHistoryRecord: (id: string) => { void softDeleteIrdAssessment(id, effectiveUserId).then(loadHistory); }
  };
}
