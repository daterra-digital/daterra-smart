// src/features/perfis/hooks/useCalibrationController.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db.ts';
import type { ProfileCropMoment, ProfileCulture, ProfileEquipment } from '../../../db/types.ts';
import { getActiveAgronomicSelection, saveActiveAgronomicSelection } from '../../../db/activeSelectionStorage.ts';
import { deleteCalibrationAuditRecord, listCalibrationAuditRecords, saveCalibrationAuditRecord } from '../../../db/calibration-context-store.ts';
import { calculateEffectiveBoomWidthM } from '../../../lib/equipment-math.ts';
import { computeCalibrationEppoBalance, evaluateContextualDriftRisk } from '../../../lib/agri-math/calibration-eppo-bridge.ts';
import { THREE_D_EQUIPMENT_TYPES, type EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import type { NozzleProfile } from '../../../schemas/nozzle-profile.schema.ts';
import type { CalibrationAuditRecord, PdfAuditReportMode } from '../../../types/calibration-audit.ts';
import { listScopedEquipmentsV12 } from '../../settings/nozzles/services/nozzleEquipmentIntegration.ts';
import { listScopedNozzleProfiles } from '../../settings/nozzles/services/nozzleProfileStorage.ts';
import { resolveParcelWeatherSnapshot, type ParcelWeatherResolution } from '../../weather/services/parcelWeatherResolver.ts';
import { isOwnedByUser, isValidOwnerId } from '../services/profileOwnership.ts';
import {
  computeNozzleIso16122Stats, computeParcelTanksSummary, computeTankAutonomyHa,
  formatPtNumber, resolveCultureGeometryAndEppo, resolveNozzlePressureBounds,
  scaleNozzleProfileByPressure, type CalibrationKeypadTarget
} from '../services/calibrationFormatters.ts';
import { hasCalibrationRecordChanged, validateCalibrationReadyForSave } from '../services/calibrationDirtyCheck.ts';

export type CalibrationKeypadField = CalibrationKeypadTarget;
export interface CalibrationEquipmentOption {
  id: string; name: string; tankCapacityL: number; defaultSpeedKmh: number | null; defaultAirflowM3h: number | null;
  is3DOrAirAssisted: boolean; isFan3D: boolean; isDroneUav: boolean; fallbackBoomWidthM: number | null;
  serialNumber?: string; typologyLabel: string; recordV12: EquipmentRecord | null;
}
export interface CalibrationCultureOption {
  id: string; label: string; record: ProfileCulture; momentId: string | null; entrelinhaM: number | null;
  trvM3Ha: number | null; lwaM2Ha: number | null; areaHa: number | null; volumeEppoLHa: number | null;
  indexKind: 'LWA' | 'TRV' | null; missingGeometry: boolean;
}

export function useCalibrationController(userId: string, notifySaved: (m: string) => void, failValidation: (e: Record<string, string>, m: string) => void) {
  const validOwner = isValidOwnerId(userId) ? userId.trim() : '';
  const [selectedCultureId, setSelectedCultureId] = useState(''), [selectedEquipmentKey, setSelectedEquipmentKey] = useState(''), [selectedNozzleKey, setSelectedNozzleKey] = useState('');
  const [speedKmh, setSpeedKmh] = useState<number>(6), [customPressureBar, setCustomPressureBar] = useState<number | null>(null);
  const [relacaoEngrenagem, setRelacaoEngrenagem] = useState<string>(''), [rotacaoMotorRpm, setRotacaoMotorRpm] = useState<number | null>(null), [rotacaoTdfRpm, setRotacaoTdfRpm] = useState<number | null>(null);
  const [airflowM3h, setAirflowM3h] = useState<number | null>(null), [editingRecord, setEditingRecord] = useState<CalibrationAuditRecord | null>(null);
  const [isSaveModeModalOpen, setIsSaveModeModalOpen] = useState(false), [isSaving, setIsSaving] = useState(false);
  const [keypadField, setKeypadField] = useState<CalibrationKeypadField>(null), [selectedPdfMode, setSelectedPdfMode] = useState<PdfAuditReportMode>('CALIBRATION_AGRONOMIC');
  const [parcelWeather, setParcelWeather] = useState<ParcelWeatherResolution | null>(null), [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const nozzleProfiles = useLiveQuery<NozzleProfile[]>(() => listScopedNozzleProfiles(validOwner), [validOwner]) || [];
  const rawEquipV12 = useLiveQuery<EquipmentRecord[]>(() => listScopedEquipmentsV12(validOwner), [validOwner]) || [];
  const rawEquipLeg = useLiveQuery<ProfileEquipment[]>(() => (validOwner ? db.profiles_equipment.where('userId').equals(validOwner).toArray() : []), [validOwner]) || [];
  const rawCultures = useLiveQuery<ProfileCulture[]>(() => (validOwner ? db.profiles_cultures.where('userId').equals(validOwner).toArray() : []), [validOwner]) || [];
  const rawMoments = useLiveQuery<ProfileCropMoment[]>(() => (validOwner ? db.profile_crop_moments.where('userId').equals(validOwner).toArray() : []), [validOwner]) || [];
  const calibrations = useLiveQuery<CalibrationAuditRecord[]>(() => listCalibrationAuditRecords(validOwner), [validOwner]) || [];

  const equipmentOptions = useMemo<CalibrationEquipmentOption[]>(() => (rawEquipV12.length > 0
    ? rawEquipV12.map((e) => {
        const is3d = THREE_D_EQUIPMENT_TYPES.has(e.type) || Boolean(e.airAssisted), is2d = e.type === '2D_HORIZONTAL' || e.type === 'UAV_DRONE';
        return {
          id: e.id, name: e.name, tankCapacityL: e.tankCapacityL, defaultSpeedKmh: e.defaultSpeedKmh,
          defaultAirflowM3h: typeof e.defaultAirflowM3h === 'number' ? e.defaultAirflowM3h : null,
          is3DOrAirAssisted: is3d, isFan3D: THREE_D_EQUIPMENT_TYPES.has(e.type) && e.airAssisted !== false, isDroneUav: e.type === 'UAV_DRONE',
          serialNumber: e.serialNumber, recordV12: e, typologyLabel: e.type === 'UAV_DRONE' ? 'Drone UAV' : is3d ? 'Copa 3D' : 'Barra 2D',
          fallbackBoomWidthM: is2d ? calculateEffectiveBoomWidthM(e.workingWidthM, e.nozzleSpacingCm) || null : null
        };
      })
    : rawEquipLeg.filter((e) => isOwnedByUser(e, validOwner) && e.id !== undefined).map((e) => {
        const is3d = Boolean(e.has_air_sleeve || e.fan_type), isDrone = (e.distribution_type || '').toLowerCase().includes('drone');
        return {
          id: String(e.id), name: e.name, tankCapacityL: e.tank_capacity_l, defaultSpeedKmh: e.last_working_speed_kmh ?? null,
          defaultAirflowM3h: null, is3DOrAirAssisted: is3d, isFan3D: Boolean(e.fan_type), isDroneUav: isDrone, recordV12: null,
          fallbackBoomWidthM: e.boom_width_m ?? null, serialNumber: e.serial_number, typologyLabel: isDrone ? 'Drone UAV' : is3d ? 'Copa 3D' : 'Barra 2D'
        };
      })), [rawEquipV12, rawEquipLeg, validOwner]);
  const cultureOptions = useMemo<CalibrationCultureOption[]>(() => rawCultures.filter((c) => isOwnedByUser(c, validOwner) && c.id !== undefined).map((c) => {
    const m = c.active_moment_id ? rawMoments.find((row) => row.id === c.active_moment_id && isOwnedByUser(row, validOwner)) : undefined;
    const cleanLabel = c.crop_type && !c.name.toLowerCase().includes(c.crop_type.toLowerCase()) ? `${c.name} (${c.crop_type})` : c.name;
    return { id: String(c.id), label: cleanLabel, record: c, momentId: m?.id !== undefined ? String(m.id) : null, ...resolveCultureGeometryAndEppo(c, m) };
  }), [rawCultures, rawMoments, validOwner]);
  useEffect(() => {
    if (!validOwner) return;
    const saved = getActiveAgronomicSelection(validOwner);
    if (nozzleProfiles.length > 0 && (!selectedNozzleKey || !nozzleProfiles.some((p) => p.id === selectedNozzleKey))) {
      setSelectedNozzleKey((saved?.nozzleProfileId && nozzleProfiles.find((p) => p.id === saved.nozzleProfileId)?.id) ?? nozzleProfiles[0].id);
    }
    if (cultureOptions.length > 0 && (!selectedCultureId || !cultureOptions.some((c) => c.id === selectedCultureId))) {
      setSelectedCultureId((saved?.cultureParcelId && cultureOptions.find((c) => c.id === saved.cultureParcelId)?.id) ?? cultureOptions[0].id);
    }
  }, [validOwner, nozzleProfiles, cultureOptions, selectedNozzleKey, selectedCultureId]);
  const activeNozzle = useMemo(() => nozzleProfiles.find((p) => p.id === selectedNozzleKey) ?? null, [nozzleProfiles, selectedNozzleKey]);
  const isEquipmentLockedToNozzle = Boolean(activeNozzle?.equipmentId && equipmentOptions.some((e) => e.id === activeNozzle.equipmentId));
  useEffect(() => {
    if (activeNozzle?.equipmentId && equipmentOptions.some((e) => e.id === activeNozzle.equipmentId)) {
      if (selectedEquipmentKey !== activeNozzle.equipmentId) setSelectedEquipmentKey(activeNozzle.equipmentId);
      return;
    }
    if (equipmentOptions.length > 0 && (!selectedEquipmentKey || !equipmentOptions.some((e) => e.id === selectedEquipmentKey))) {
      const savedEq = getActiveAgronomicSelection(validOwner)?.equipmentId;
      setSelectedEquipmentKey((savedEq && equipmentOptions.find((e) => e.id === savedEq)?.id) ?? equipmentOptions[0].id);
    }
  }, [activeNozzle, equipmentOptions, selectedEquipmentKey, validOwner]);
  const activeEquipment = useMemo(() => equipmentOptions.find((e) => e.id === selectedEquipmentKey) ?? null, [equipmentOptions, selectedEquipmentKey]);
  const activeCulture = useMemo(() => cultureOptions.find((c) => c.id === selectedCultureId) ?? null, [cultureOptions, selectedCultureId]);
  useEffect(() => {
    if (!activeEquipment || editingRecord) return;
    if (activeEquipment.defaultSpeedKmh && activeEquipment.defaultSpeedKmh > 0) setSpeedKmh(activeEquipment.defaultSpeedKmh);
    setAirflowM3h(activeEquipment.isFan3D ? activeEquipment.defaultAirflowM3h : null);
  }, [activeEquipment?.id, activeEquipment?.isFan3D, activeEquipment?.defaultAirflowM3h, activeEquipment?.defaultSpeedKmh, editingRecord]);
  useEffect(() => {
    let cancelled = false;
    if (!activeCulture?.record) { setParcelWeather(null); setIsLoadingWeather(false); return; }
    setIsLoadingWeather(true);
    resolveParcelWeatherSnapshot(activeCulture.record)
      .then((res) => { if (!cancelled) { setParcelWeather(res); setIsLoadingWeather(false); } })
      .catch(() => { if (!cancelled) { setParcelWeather(null); setIsLoadingWeather(false); } });
    return () => { cancelled = true; };
  }, [activeCulture?.id, activeCulture?.record.parish, activeCulture?.record.municipality, activeCulture?.record.latitude, activeCulture?.record.longitude]);
  const selectNozzle = (id: string) => { setCustomPressureBar(null); setSelectedNozzleKey(id); saveActiveAgronomicSelection(validOwner, { nozzleProfileId: id }); };
  const selectEquipment = (id: string) => { setSelectedEquipmentKey(id); saveActiveAgronomicSelection(validOwner, { equipmentId: id }); };
  const selectCulture = (id: string) => { setSelectedCultureId(id); saveActiveAgronomicSelection(validOwner, { cultureParcelId: id }); };
  const pressaoBaseBicoBar = activeNozzle ? activeNozzle.referencePressureBar : null;
  const pressaoBar = customPressureBar ?? pressaoBaseBicoBar;
  const isPressureModified = pressaoBar !== null && pressaoBaseBicoBar !== null && Math.abs(pressaoBar - pressaoBaseBicoBar) >= 0.05;
  const { scaledProfile: activeNozzleScaled, scaledTotalFlowLMin: debitoTotalLMin } = useMemo(
    () => scaleNozzleProfileByPressure(activeNozzle, pressaoBar), [activeNozzle, pressaoBar]
  );
  const [numBicosAtivos, numBicosTotal] = [activeNozzle ? activeNozzle.activeSlotsCount : null, activeNozzle ? activeNozzle.totalSlotsCount : null];
  const entrelinhaM = activeCulture?.entrelinhaM ?? activeEquipment?.fallbackBoomWidthM ?? null;
  const culturaTipologia: '2D' | '3D_COPA' = activeCulture?.trvM3Ha || activeCulture?.lwaM2Ha || activeEquipment?.is3DOrAirAssisted ? '3D_COPA' : '2D';
  const balance = useMemo(() => computeCalibrationEppoBalance({
    debitoTotalLMin: debitoTotalLMin ?? 0, velocidadeKmh: speedKmh, entrelinhaM: entrelinhaM ?? 0, pressaoBar, numBicosAtivos, culturaTipologia,
    volumeRecomendadoEppoLHa: activeCulture?.volumeEppoLHa ?? null, trvM3Ha: activeCulture?.trvM3Ha ?? null,
    lwaM2Ha: activeCulture?.lwaM2Ha ?? null, caudalArAplicadoM3H: activeEquipment?.isFan3D ? airflowM3h : null, isDroneUav: activeEquipment?.isDroneUav
  }), [debitoTotalLMin, speedKmh, entrelinhaM, pressaoBar, numBicosAtivos, culturaTipologia, activeCulture, activeEquipment, airflowM3h]);
  const nozzleBounds = useMemo(() => resolveNozzlePressureBounds(activeNozzle), [activeNozzle]);
  const driftRisk = useMemo(() => evaluateContextualDriftRisk({
    culturaTipologia, isDroneUav: activeEquipment?.isDroneUav, pressaoBar, pressaoMinHomologadaBar: nozzleBounds.minBar,
    pressaoMaxHomologadaBar: nozzleBounds.maxBar, bicoAntiDeriva: nozzleBounds.hasAntiDrift,
    assistenciaArAtiva: activeEquipment?.is3DOrAirAssisted ?? null, weather: parcelWeather?.snapshot ?? null
  }), [culturaTipologia, activeEquipment, pressaoBar, nozzleBounds, parcelWeather]);
  const autonomyHa = useMemo(() => computeTankAutonomyHa(activeEquipment?.tankCapacityL, balance.volumeCalibradoLHa), [activeEquipment, balance.volumeCalibradoLHa]);
  const parcelTanks = useMemo(() => computeParcelTanksSummary(activeCulture?.areaHa, balance.volumeCalibradoLHa, activeEquipment?.tankCapacityL), [activeCulture?.areaHa, balance.volumeCalibradoLHa, activeEquipment?.tankCapacityL]);
  const hasUnsavedChanges = useMemo(() => hasCalibrationRecordChanged(editingRecord, {
    cultureParcelId: activeCulture?.id ?? null, equipmentId: activeEquipment?.id ?? null, nozzleProfileId: activeNozzle?.id ?? null,
    velocidadeKmh: speedKmh, pressaoBar, caudalArAplicadoM3H: activeEquipment?.isFan3D ? airflowM3h : null,
    relacaoEngrenagem, rotacaoMotorRpm, rotacaoTdfRpm, debitoTotalLMin, entrelinhaM
  }), [editingRecord, activeCulture?.id, activeEquipment, activeNozzle?.id, speedKmh, pressaoBar, airflowM3h, relacaoEngrenagem, rotacaoMotorRpm, rotacaoTdfRpm, debitoTotalLMin, entrelinhaM]);

  useEffect(() => {
    if (!validOwner || editingRecord || calibrations.length === 0) return;
    const activeCalId = getActiveAgronomicSelection(validOwner)?.calibrationId;
    const hit = activeCalId ? calibrations.find((c) => c.id === activeCalId) : undefined;
    if (hit) setEditingRecord(hit);
  }, [validOwner, calibrations, editingRecord]);
  const saveErr = () => validateCalibrationReadyForSave({ validOwner, hasNozzle: Boolean(activeNozzle), debitoTotalLMin, numBicosAtivos, pressaoBar, entrelinhaM, isBalanceValid: balance.isValid, volumeCalibradoLHa: balance.volumeCalibradoLHa, errorMessagePt: balance.errorMessagePt });
  const executeSave = useCallback(async (mode: 'update' | 'new', customName?: string) => {
    if (isSaving) return;
    const err = saveErr();
    if (err || !activeNozzle || !debitoTotalLMin || !numBicosAtivos || !pressaoBar || !entrelinhaM || balance.volumeCalibradoLHa === null) { if (err) failValidation({}, err); return; }
    const now = new Date().toISOString(), isUpdate = mode === 'update' && editingRecord !== null;
    const autoName = [activeCulture?.label, activeEquipment?.name, activeNozzle.name].filter(Boolean).join(' · ');
    const nomePerfil = (customName?.trim() || (isUpdate ? editingRecord.nomePerfil : '') || autoName).slice(0, 120) || 'Ficha de Calibração';
    setIsSaving(true);
    try {
      const saved = await saveCalibrationAuditRecord(validOwner, {
        id: isUpdate ? editingRecord.id : undefined, nomePerfil, createdAt: isUpdate ? editingRecord.createdAt : now, updatedAt: now, nozzleProfileId: activeNozzle.id,
        equipmentId: activeEquipment?.id ?? null, cultureParcelId: activeCulture?.id ?? null, cultureMomentId: activeCulture?.momentId ?? null, velocidadeKmh: speedKmh, pressaoBar,
        pressaoBaseBicoBar, debitoTotalLMin, numBicosAtivos, entrelinhaM, volumeCalibradoLHa: balance.volumeCalibradoLHa, volumeRecomendadoEppoLHa: balance.volumeRecomendadoEppoLHa,
        caudalArOtimoM3H: balance.caudalArSugeridoM3H, caudalArAplicadoM3H: activeEquipment?.isFan3D ? airflowM3h : null, relacaoEngrenagem: relacaoEngrenagem.trim() || undefined,
        rotacaoMotorRpm, rotacaoTdfRpm, iso16122: { numeroSerieChassi: activeEquipment?.serialNumber || undefined, ...computeNozzleIso16122Stats(activeNozzleScaled) }
      }, { mode: isUpdate ? 'update' : 'new' });
      setEditingRecord(saved); setIsSaveModeModalOpen(false);
      saveActiveAgronomicSelection(validOwner, { calibrationId: saved.id, nozzleProfileId: activeNozzle.id, equipmentId: activeEquipment?.id ?? null, cultureParcelId: activeCulture?.id ?? null });
      notifySaved(`${isUpdate ? 'Perfil atualizado' : 'Novo perfil criado'} (${formatPtNumber(saved.volumeCalibradoLHa, 1)} L/ha · Selo SHA-256 ativo).`);
    } catch (e) { failValidation({}, e instanceof Error ? e.message : 'Erro ao gravar calibração.'); } finally { setIsSaving(false); }
  }, [isSaving, validOwner, activeNozzle, activeNozzleScaled, debitoTotalLMin, numBicosAtivos, pressaoBar, pressaoBaseBicoBar, entrelinhaM, balance, editingRecord, activeEquipment, activeCulture, speedKmh, airflowM3h, relacaoEngrenagem, rotacaoMotorRpm, rotacaoTdfRpm, notifySaved, failValidation]);
  const handleRequestSave = () => { if (isSaving) return; const err = saveErr(); if (err) failValidation({}, err); else if (editingRecord) setIsSaveModeModalOpen(true); else void executeSave('new'); };
  const handleLoad = (rec: CalibrationAuditRecord) => {
    setEditingRecord(rec); setIsSaveModeModalOpen(false);
    if (rec.nozzleProfileId) setSelectedNozzleKey(rec.nozzleProfileId); if (rec.equipmentId) setSelectedEquipmentKey(rec.equipmentId); if (rec.cultureParcelId) setSelectedCultureId(rec.cultureParcelId);
    setSpeedKmh(rec.velocidadeKmh); setCustomPressureBar(rec.pressaoBar); setRelacaoEngrenagem(rec.relacaoEngrenagem ?? ''); setRotacaoMotorRpm(rec.rotacaoMotorRpm ?? null); setRotacaoTdfRpm(rec.rotacaoTdfRpm ?? null); setAirflowM3h(rec.caudalArAplicadoM3H);
    saveActiveAgronomicSelection(validOwner, { calibrationId: rec.id, nozzleProfileId: rec.nozzleProfileId ?? null, equipmentId: rec.equipmentId ?? null, cultureParcelId: rec.cultureParcelId ?? null });
    notifySaved(`Ficha "${rec.nomePerfil}" carregada para revisão.`);
  };
  const handleDelete = async (id: string) => { if (await deleteCalibrationAuditRecord(validOwner, id)) { if (editingRecord?.id === id) { setEditingRecord(null); saveActiveAgronomicSelection(validOwner, { calibrationId: null }); } notifySaved('Ficha de calibração eliminada.'); } };
  const handleStartNewRecord = () => { setEditingRecord(null); setIsSaveModeModalOpen(false); saveActiveAgronomicSelection(validOwner, { calibrationId: null }); };
  const setPressureBar = (val: number) => setCustomPressureBar(Math.max(0.5, Math.round(val * 100) / 100));
  return {
    editingRecord, hasUnsavedChanges, isSaveModeModalOpen, isSaving, setIsSaveModeModalOpen, nozzleProfiles, equipmentOptions, cultureOptions, calibrations, activeNozzle,
    activeNozzleScaled, scaledNozzleProfile: activeNozzleScaled, activeEquipment, activeCulture, selectedNozzleKey, selectedEquipmentKey, selectedCultureId, isEquipmentLockedToNozzle,
    speedKmh, airflowM3h, pressaoBar, pressaoBaseBicoBar, isPressureModified, isPressureAdjusted: isPressureModified, relacaoEngrenagem, rotacaoMotorRpm, rotacaoTdfRpm, numBicosAtivos,
    numBicosTotal, debitoTotalLMin, entrelinhaM, balance, driftRisk, nozzleBounds, parcelWeather, isLoadingWeather, autonomyHa, parcelTanks, keypadField, selectedPdfMode, selectNozzle,
    selectEquipment, selectCulture, setSpeedKmh, setPressureBar, resetPressureToNozzleBase: () => setCustomPressureBar(null), setRelacaoEngrenagem, setRotacaoMotorRpm, setRotacaoTdfRpm,
    setAirflowM3h, setKeypadField, setSelectedPdfMode, handleRequestSave, confirmSaveAsUpdate: (n?: string) => void executeSave('update', n), confirmSaveAsNew: (n?: string) => void executeSave('new', n),
    handleStartNewRecord, handleLoad, handleDelete, stepSpeed: (d: number) => setSpeedKmh((v) => Math.max(0.5, Math.round((v + d) * 10) / 10)), stepPressure: (d: number) => pressaoBar !== null && setPressureBar(pressaoBar + d),
    applySafeSuggestedSpeed: () => balance.velocidadeSugeridaSeguraKmh && setSpeedKmh(balance.velocidadeSugeridaSeguraKmh), applySuggestedAirflow: () => balance.caudalArSugeridoM3H && setAirflowM3h(Math.round(balance.caudalArSugeridoM3H))
  };
}
