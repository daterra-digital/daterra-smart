// src/features/weather/hooks/useWeatherProfilesContext.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { ProfileCropMoment, ProfileCulture } from '../../../db/types.ts';
import { saveCalibrationAuditRecord } from '../../../db/calibration-context-store.ts';
import type { CalibrationAuditRecord } from '../../../types/calibration-audit.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import { isValidOwnerId } from '../../perfis/services/profileOwnership.ts';
import type { CurrentWeather } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { computeParcelOnlyDriftRisk, type ParcelDriftEvaluation } from '../utils/irdParcelFactorHelpers.ts';
import { computeWhatIfSimulation, resolveCalibrationChain, type WhatIfValues } from '../utils/calibrationWhatIfHelpers.ts';
import {
  loadScopedWeatherCalibrations,
  loadScopedWeatherCultures,
  loadScopedWeatherEquipments,
  loadScopedWeatherMoments,
  loadScopedWeatherNozzles
} from '../utils/weatherProfileLoader.ts';

const diff = (a: number | null | undefined, b: number | null | undefined, tol = 0.05) => Math.abs((a ?? 0) - (b ?? 0)) > tol;

export function useWeatherProfilesContext(
  context: ActiveMachineContext | null,
  onContextChange: (ctx: ActiveMachineContext | null) => void,
  currentWeather?: CurrentWeather
) {
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || '';
  const ownerKeys = useMemo(() => Array.from(new Set([user?.id, user?.uid].filter((v): v is string => isValidOwnerId(v)))), [user?.id, user?.uid]);

  const calibrations = useLiveQuery<CalibrationAuditRecord[]>(() => loadScopedWeatherCalibrations(effectiveUserId, ownerKeys), [effectiveUserId, ownerKeys]) || [];
  const cultures = useLiveQuery<ProfileCulture[]>(() => loadScopedWeatherCultures(effectiveUserId, ownerKeys), [effectiveUserId, ownerKeys]) || [];
  const moments = useLiveQuery<ProfileCropMoment[]>(() => loadScopedWeatherMoments(effectiveUserId, ownerKeys), [effectiveUserId, ownerKeys]) || [];
  const eqBundle = useLiveQuery(() => loadScopedWeatherEquipments(effectiveUserId, ownerKeys), [effectiveUserId, ownerKeys]);
  const nzBundle = useLiveQuery(() => loadScopedWeatherNozzles(effectiveUserId, ownerKeys), [effectiveUserId, ownerKeys]);
  const equipV12 = useMemo(() => eqBundle?.v12 ?? [], [eqBundle]);
  const equipLeg = useMemo(() => eqBundle?.legacy ?? [], [eqBundle]);
  const nozzlesV12 = useMemo(() => nzBundle?.v12 ?? [], [nzBundle]);
  const nozzlesLeg = useMemo(() => nzBundle?.legacy ?? [], [nzBundle]);

  const [whatIf, setWhatIf] = useState<WhatIfValues | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => { if (!effectiveUserId && context !== null) onContextChange(null); }, [effectiveUserId, context, onContextChange]);

  const selectedCalibration = useMemo(
    () => (context?.calibrationId ? calibrations.find((c) => String(c.id) === String(context.calibrationId)) ?? null : null),
    [calibrations, context?.calibrationId]
  );

  const selectedCultureOnly = useMemo(
    () => (!context?.calibrationId && context?.cultureId ? cultures.find((c) => String(c.id) === String(context.cultureId)) ?? null : null),
    [cultures, context?.calibrationId, context?.cultureId]
  );

  const parcelRisk = useMemo<ParcelDriftEvaluation | null>(() => {
    if (!selectedCultureOnly) return null;
    const mom = selectedCultureOnly.active_moment_id ? moments.find((m) => m.id === selectedCultureOnly.active_moment_id) ?? null : null;
    return computeParcelOnlyDriftRisk(selectedCultureOnly, mom, currentWeather);
  }, [selectedCultureOnly, moments, currentWeather]);

  const chain = useMemo(
    () => (selectedCalibration ? resolveCalibrationChain(selectedCalibration, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather) : null),
    [selectedCalibration, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather]
  );

  useEffect(() => {
    if (!chain) { setWhatIf(null); return; }
    setWhatIf({
      speedKmh: chain.baseSpeedKmh, pressureBar: chain.basePressureBar, airflowM3h: chain.baseAirflowM3h,
      heightVal: chain.baseHeightVal, cdaDiscRpm: chain.baseCdaDiscRpm, unilateralBorder3d: false, adjuvantAntiDrift: false
    });
  }, [chain?.calibration.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeVals = useMemo<WhatIfValues | null>(() => (chain ? (whatIf ?? {
    speedKmh: chain.baseSpeedKmh, pressureBar: chain.basePressureBar, airflowM3h: chain.baseAirflowM3h,
    heightVal: chain.baseHeightVal, cdaDiscRpm: chain.baseCdaDiscRpm, unilateralBorder3d: false, adjuvantAntiDrift: false
  }) : null), [chain, whatIf]);

  const baselineSim = useMemo(
    () => (chain ? computeWhatIfSimulation(chain, { speedKmh: chain.baseSpeedKmh, pressureBar: chain.basePressureBar, airflowM3h: chain.baseAirflowM3h, heightVal: chain.baseHeightVal, cdaDiscRpm: chain.baseCdaDiscRpm }, currentWeather) : null),
    [chain, currentWeather]
  );
  const liveSim = useMemo(
    () => (chain && activeVals ? computeWhatIfSimulation(chain, activeVals, currentWeather) : null),
    [chain, activeVals, currentWeather]
  );

  const isDirty = useMemo(() => {
    if (!chain || !activeVals) return false;
    return diff(activeVals.speedKmh, chain.baseSpeedKmh) || diff(activeVals.pressureBar, chain.basePressureBar) ||
      (chain.equipKind === '3D' && diff(activeVals.airflowM3h, chain.baseAirflowM3h, 50)) ||
      (chain.equipKind === 'UAV' && (diff(activeVals.heightVal, chain.baseHeightVal, 0.1) || diff(activeVals.cdaDiscRpm, chain.baseCdaDiscRpm, 100)));
  }, [chain, activeVals]);

  const buildCalCtx = useCallback((c: NonNullable<typeof chain>, pBar: number, irdPct: number | null, baseMeteo: number | null): ActiveMachineContext => ({
    cultureId: c.culture?.id ?? null, cultureName: c.culture?.name ?? null,
    equipmentId: /^\d+$/.test(c.calibration.equipmentId ?? '') ? Number(c.calibration.equipmentId) : (c.calibration.equipmentId ? 1 : null),
    equipmentName: c.equipmentName, equipmentTypeLabel: c.equipmentMetaLabel, hasAirSleeve: c.hasAirSleeve,
    nozzleId: /^\d+$/.test(c.calibration.nozzleProfileId ?? '') ? Number(c.calibration.nozzleProfileId) : (c.calibration.nozzleProfileId ? 1 : null),
    nozzleName: c.nozzleName, nozzleType: c.nozzleType, calibrationId: c.calibration.id, calibrationName: c.calibration.nomePerfil,
    workingPressureBar: pBar, dropletSizeUm: c.dv50Um, combinedIrdPct: irdPct, baseMeteoScore: baseMeteo, parcelRiskPct: null,
    acceptableIrdLimitPct: c.sensitiveZoneLimitPct ?? 75, isUavEquipment: c.equipKind === 'UAV'
  }), []);

  useEffect(() => {
    if (chain && activeVals && liveSim) {
      if (context?.workingPressureBar !== activeVals.pressureBar || context?.combinedIrdPct !== liveSim.combinedIrdPct || context?.baseMeteoScore !== liveSim.baseMeteoScore || context?.acceptableIrdLimitPct !== (chain.sensitiveZoneLimitPct ?? 75)) {
        onContextChange(buildCalCtx(chain, activeVals.pressureBar, liveSim.combinedIrdPct, liveSim.baseMeteoScore));
      }
    } else if (selectedCultureOnly && parcelRisk) {
      const nextLimit = parcelRisk.sensitiveZoneLimitPct ?? 75;
      if (context?.parcelRiskPct !== parcelRisk.parcelRiskPct || context?.baseMeteoScore !== parcelRisk.baseMeteoScore || context?.acceptableIrdLimitPct !== nextLimit) {
        onContextChange({ cultureId: selectedCultureOnly.id ?? null, cultureName: selectedCultureOnly.name, parcelRiskPct: parcelRisk.parcelRiskPct, baseMeteoScore: parcelRisk.baseMeteoScore, combinedIrdPct: null, acceptableIrdLimitPct: nextLimit, isUavEquipment: false });
      }
    }
  }, [chain, activeVals, liveSim, selectedCultureOnly, parcelRisk, context?.workingPressureBar, context?.combinedIrdPct, context?.parcelRiskPct, context?.baseMeteoScore, context?.acceptableIrdLimitPct, onContextChange, buildCalCtx]);

  const selectCalibration = useCallback((calIdStr: string) => {
    setSaveFeedback(null);
    if (!calIdStr) { onContextChange(null); return; }
    const hit = calibrations.find((c) => String(c.id) === calIdStr);
    if (!hit) { onContextChange(null); return; }
    const resolved = resolveCalibrationChain(hit, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather);
    onContextChange(buildCalCtx(resolved, resolved.basePressureBar, null, null));
  }, [calibrations, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather, onContextChange, buildCalCtx]);

  const selectCultureOnly = useCallback((cultIdStr: string) => {
    setSaveFeedback(null);
    if (!cultIdStr) { onContextChange(null); return; }
    const hit = cultures.find((c) => String(c.id) === cultIdStr);
    if (!hit) { onContextChange(null); return; }
    const mom = hit.active_moment_id ? moments.find((m) => m.id === hit.active_moment_id) ?? null : null;
    const pr = computeParcelOnlyDriftRisk(hit, mom, currentWeather);
    onContextChange({ cultureId: hit.id ?? null, cultureName: hit.name, parcelRiskPct: pr.parcelRiskPct, baseMeteoScore: pr.baseMeteoScore, combinedIrdPct: null, acceptableIrdLimitPct: pr.sensitiveZoneLimitPct ?? 75, isUavEquipment: false });
  }, [cultures, moments, currentWeather, onContextChange]);

  const persistCalibration = useCallback(async (mode: 'update' | 'new', customName?: string) => {
    if (!effectiveUserId || !chain || !activeVals || !liveSim || isSaving) return null;
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      const now = new Date().toISOString();
      const orig = chain.calibration;
      const nomePerfil = mode === 'new' ? (customName?.trim() || `${orig.nomePerfil} (Otimizada)`).slice(0, 120) : orig.nomePerfil;
      const effectiveMode = mode === 'update' && orig.userId !== effectiveUserId ? 'new' : mode;
      const saved = await saveCalibrationAuditRecord(effectiveUserId, {
        ...orig, id: effectiveMode === 'update' ? orig.id : undefined, nomePerfil,
        createdAt: effectiveMode === 'update' ? orig.createdAt : now, updatedAt: now,
        velocidadeKmh: activeVals.speedKmh, pressaoBar: activeVals.pressureBar,
        debitoTotalLMin: liveSim.scaledFlowLMin, volumeCalibradoLHa: liveSim.appliedVolumeLHa,
        caudalArOtimoM3H: liveSim.optimalAirflowM3h ?? orig.caudalArOtimoM3H,
        caudalArAplicadoM3H: chain.equipKind === '3D' ? activeVals.airflowM3h : orig.caudalArAplicadoM3H
      }, { mode: effectiveMode });
      const resolved = resolveCalibrationChain(saved, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather);
      onContextChange(buildCalCtx(resolved, saved.pressaoBar, liveSim.combinedIrdPct, liveSim.baseMeteoScore));
      setSaveFeedback(mode === 'update' ? 'Calibração atualizada no IndexedDB.' : `Nova calibração "${saved.nomePerfil}" guardada e selecionada.`);
      return saved;
    } finally { setIsSaving(false); }
  }, [effectiveUserId, chain, activeVals, liveSim, isSaving, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather, onContextChange, buildCalCtx]);

  const renameCalibration = useCallback(async (nextName: string): Promise<boolean> => {
    const clean = nextName.trim().slice(0, 120);
    if (!effectiveUserId || !chain || !clean || isSaving) return false;
    setIsSaving(true); setSaveFeedback(null);
    try {
      const orig = chain.calibration;
      const mode = orig.userId === effectiveUserId ? 'update' : 'new';
      const saved = await saveCalibrationAuditRecord(effectiveUserId, {
        ...orig, id: mode === 'update' ? orig.id : undefined, nomePerfil: clean, updatedAt: new Date().toISOString()
      }, { mode });
      const resolved = resolveCalibrationChain(saved, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather);
      onContextChange(buildCalCtx(resolved, activeVals?.pressureBar ?? saved.pressaoBar, liveSim?.combinedIrdPct ?? null, liveSim?.baseMeteoScore ?? null));
      setSaveFeedback('Designação da calibração atualizada.');
      return true;
    } finally { setIsSaving(false); }
  }, [effectiveUserId, chain, isSaving, cultures, moments, equipV12, equipLeg, nozzlesV12, nozzlesLeg, currentWeather, activeVals, liveSim, onContextChange, buildCalCtx]);

  return {
    calibrations, cultures, selectedCultureOnly, parcelRisk, chain, activeVals, setWhatIf, baselineSim, liveSim,
    isDirty, isSaving, saveFeedback, selectCalibration, selectCultureOnly, persistCalibration, renameCalibration
  };
}
