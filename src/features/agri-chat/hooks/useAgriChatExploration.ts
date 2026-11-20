// src/features/agri-chat/hooks/useAgriChatExploration.ts
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '../../../context/AuthContext';
import { getActiveAgronomicSelection, saveActiveAgronomicSelection } from '../../../db/activeSelectionStorage.ts';
import { getActiveAgronomicContext } from '../../../db/calibration-context-store.ts';
import type { ProfileCalibration, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../../db/db';
import { buildActiveExplorationContextSummary } from '../../../lib/ai/agronomicContextPromptBuilder.ts';
import type { ActiveAgronomicContext } from '../../../types/calibration-audit.ts';
import {
  buildEquipmentAiContextItem,
  listScopedEquipmentsV12,
  resolveActiveCultureStats,
  type EquipmentAiContextItem
} from '../../settings/equipment/equipmentAiContextService';
import { buildNozzleAiItem, listScopedNozzleProfiles, type NozzleAiContextItem } from '../../settings/nozzles';
import type { AgronomicMentionPillItem } from '../components/AgronomicMentionPills.tsx';
import { explorationContextService } from '../services/explorationContextService';
import type { ActiveExplorationContext } from '../types';

export function useAgriChatExploration() {
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || '';
  const [cultures, setCultures] = useState<ProfileCulture[]>([]);
  const [equipments, setEquipments] = useState<ProfileEquipment[]>([]);
  const [nozzles, setNozzles] = useState<ProfileNozzle[]>([]);
  const [calibrations, setCalibrations] = useState<ProfileCalibration[]>([]);
  const [isContextEnabled, setIsContextEnabled] = useState(true);
  const [activeContext, setActiveContext] = useState<ActiveExplorationContext>({});
  const [unifiedContext, setUnifiedContext] = useState<ActiveAgronomicContext | null>(null);
  const [selectedEquipmentV12Id, setSelectedEquipmentV12Id] = useState<string | undefined>(undefined);
  const [selectedNozzleId, setSelectedNozzleId] = useState<string | undefined>(undefined);
  const [isCultureChipActive, setIsCultureChipActive] = useState(true);
  const [isEquipmentChipActive, setIsEquipmentChipActive] = useState(true);
  const [isNozzleChipActive, setIsNozzleChipActive] = useState(true);
  const [isCalibrationChipActive, setIsCalibrationChipActive] = useState(true);
  const [nozzleAiItems, setNozzleAiItems] = useState<NozzleAiContextItem[]>([]);
  const [selectionRevision, setSelectionRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!effectiveUserId) {
      setCultures([]); setEquipments([]); setNozzles([]); setCalibrations([]);
      setNozzleAiItems([]); setActiveContext({}); setUnifiedContext(null);
      setSelectedEquipmentV12Id(undefined); setSelectedNozzleId(undefined);
      return;
    }
    const persisted = getActiveAgronomicSelection(effectiveUserId);
    explorationContextService.loadUserExplorationProfiles(effectiveUserId).then((res) => {
      if (cancelled) return;
      setCultures(res.cultures); setEquipments(res.equipments);
      setNozzles(res.nozzles); setCalibrations(res.calibrations);
      const c = (persisted?.cultureParcelId ? res.cultures.find((x) => String(x.id) === persisted.cultureParcelId) : undefined) ?? res.cultures[0];
      const eq = (persisted?.equipmentId ? res.equipments.find((x) => String(x.id) === persisted.equipmentId) : undefined) ?? res.equipments[0];
      const noz = res.nozzles[0];
      const cal = (persisted?.calibrationId ? res.calibrations.find((x) => String(x.id) === persisted.calibrationId) : undefined) ?? res.calibrations[0];

      setActiveContext((prev) => ({
        ...prev, cultureId: c?.id, cultureName: c?.name, cropType: c?.crop_type,
        variety: c?.variety, rowDistanceM: c?.row_distance_m, canopyHeightM: c?.canopy_height_m,
        canopyWidthM: c?.canopy_width_m, trainingSystem: c?.training_system, phenologicalStage: c?.phenological_stage,
        lwaM2Ha: c?.last_lwa_m2_ha, trvM3Ha: c?.last_trv_m3_ha, recommendedSprayVolumeLHa: c?.last_spray_volume_lha,
        equipmentId: eq?.id, equipmentName: prev.equipmentRecordId ? prev.equipmentName : eq?.name,
        nozzleName: noz ? `${noz.manufacturer} ${noz.model}` : undefined, nozzleColor: noz?.color,
        calibrationSpeedKmh: cal?.velocidadeKmh ?? cal?.working_speed_kmh,
        calibrationPressureBar: cal?.pressaoBar ?? cal?.working_pressure_bar,
        calibrationVolumeLHa: cal?.volumeCalibradoLHa ?? cal?.calculated_spray_volume_lha
      }));
      if (persisted?.equipmentId) setSelectedEquipmentV12Id(persisted.equipmentId);
      listScopedNozzleProfiles(effectiveUserId).then((profs) => {
        if (cancelled) return;
        const items = profs.map(buildNozzleAiItem);
        setNozzleAiItems(items);
        const match = (persisted?.nozzleProfileId ? items.find((i) => i.id === persisted.nozzleProfileId) : undefined) ?? items[0];
        if (match) {
          setSelectedNozzleId(match.id);
          setActiveContext((prev) => ({ ...prev, nozzleProfileId: match.id, nozzleProfileSummary: match.summaryText, nozzleContextActive: true }));
        }
      });
    });
    return () => { cancelled = true; };
  }, [effectiveUserId]);

  useEffect(() => {
    let cancelled = false;
    if (!effectiveUserId) return;
    getActiveAgronomicContext(effectiveUserId, {
      cultureId: activeContext.cultureId,
      equipmentId: selectedEquipmentV12Id,
      nozzleProfileId: selectedNozzleId
    }).then((ctx) => {
      if (!cancelled) setUnifiedContext(ctx);
    });
    return () => { cancelled = true; };
  }, [effectiveUserId, activeContext.cultureId, selectedEquipmentV12Id, selectedNozzleId, selectionRevision]);

  const equipmentsV12 = useLiveQuery(() => listScopedEquipmentsV12(effectiveUserId), [effectiveUserId]) || [];
  const activeCulture = useMemo(() => cultures.find((c) => c.id === activeContext.cultureId) ?? cultures[0] ?? null, [cultures, activeContext.cultureId]);
  const activeCultureStats = useLiveQuery(() => resolveActiveCultureStats(activeCulture), [activeCulture?.id, activeCulture?.last_trv_m3_ha, activeCulture?.row_distance_m]);
  const equipmentAiItems = useMemo<EquipmentAiContextItem[]>(() => equipmentsV12.map((eq) => buildEquipmentAiContextItem(eq, activeCultureStats)), [equipmentsV12, activeCultureStats]);

  useEffect(() => {
    if (equipmentAiItems.length === 0) {
      setSelectedEquipmentV12Id(undefined);
      setActiveContext((prev) => (prev.equipmentRecordId ? { ...prev, equipmentRecordId: undefined, equipmentContextActive: undefined } : prev));
      return;
    }
    const chosen = equipmentAiItems.find((item) => item.id === selectedEquipmentV12Id) ?? equipmentAiItems[0];
    if (chosen.id !== selectedEquipmentV12Id) setSelectedEquipmentV12Id(chosen.id);
    setActiveContext((prev) => ({
      ...prev, equipmentRecordId: chosen.id, equipmentName: chosen.name, equipmentType: chosen.type,
      equipmentTypeBadge: chosen.typologyBadge, equipmentOperationalSummary: chosen.operationalSummary,
      equipmentAirSummary: chosen.airSummary, equipmentIppBadge: chosen.ippStatus.badgeText,
      equipmentIppTone: chosen.ippStatus.badgeTone, equipmentIppSummary: chosen.ippStatus.summaryMessage,
      equipmentAiSummary: chosen.promptSummary, equipmentContextActive: isEquipmentChipActive, tankCapacityL: chosen.tankCapacityL
    }));
  }, [equipmentAiItems, selectedEquipmentV12Id, isEquipmentChipActive]);

  const agronomicContextSummary = useMemo(() => buildActiveExplorationContextSummary(unifiedContext, {
    includeCulture: isCultureChipActive,
    includeEquipment: isEquipmentChipActive,
    includeNozzle: isNozzleChipActive,
    includeCalibration: isCalibrationChipActive
  }), [unifiedContext, isCultureChipActive, isEquipmentChipActive, isNozzleChipActive, isCalibrationChipActive]);

  const enrichedActiveContext = useMemo<ActiveExplorationContext>(() => ({
    ...activeContext,
    cultureName: unifiedContext?.culture?.name ?? activeContext.cultureName,
    equipmentName: unifiedContext?.equipment?.name ?? activeContext.equipmentName,
    nozzleName: unifiedContext?.nozzleProfile?.label ?? activeContext.nozzleName,
    calibrationSpeedKmh: unifiedContext?.calibration?.velocidadeKmh ?? activeContext.calibrationSpeedKmh,
    calibrationPressureBar: unifiedContext?.calibration?.pressaoBar ?? activeContext.calibrationPressureBar,
    calibrationVolumeLHa: unifiedContext?.calibration?.volumeCalibradoLHa ?? activeContext.calibrationVolumeLHa,
    cultureContextActive: isCultureChipActive,
    equipmentContextActive: isEquipmentChipActive,
    nozzleContextActive: isNozzleChipActive,
    calibrationContextActive: isCalibrationChipActive,
    agronomicContext: unifiedContext ?? undefined,
    agronomicContextSummary: agronomicContextSummary || undefined
  }), [activeContext, unifiedContext, isCultureChipActive, isEquipmentChipActive, isNozzleChipActive, isCalibrationChipActive, agronomicContextSummary]);

  const handleUpdateContext = (updates: Partial<ActiveExplorationContext>) => {
    setActiveContext((prev) => ({ ...prev, ...updates }));
    if (!effectiveUserId) return;
    if (updates.cultureId !== undefined) saveActiveAgronomicSelection(effectiveUserId, { cultureParcelId: String(updates.cultureId) });
    if (updates.equipmentId !== undefined) saveActiveAgronomicSelection(effectiveUserId, { equipmentId: String(updates.equipmentId) });
    setSelectionRevision((r) => r + 1);
  };

  const agronomicMentions: AgronomicMentionPillItem[] = [
    { tag: '@cultura', label: unifiedContext?.culture?.name ?? activeContext.cultureName ?? 'Sem cultura', active: isCultureChipActive, available: Boolean(unifiedContext?.culture || activeContext.cultureName), onToggle: () => setIsCultureChipActive((p) => !p) },
    { tag: '@equipamento', label: unifiedContext?.equipment?.name ?? activeContext.equipmentName ?? 'Sem máquina', active: isEquipmentChipActive, available: Boolean(unifiedContext?.equipment || activeContext.equipmentName), onToggle: () => setIsEquipmentChipActive((p) => !p) },
    { tag: '@bico', label: unifiedContext?.nozzleProfile?.label ?? activeContext.nozzleName ?? 'Sem bico', active: isNozzleChipActive, available: Boolean(unifiedContext?.nozzleProfile || activeContext.nozzleName), onToggle: () => setIsNozzleChipActive((p) => !p) },
    { tag: '@calibracao', label: unifiedContext?.calibration ? `${unifiedContext.calibration.volumeCalibradoLHa.toFixed(1).replace('.', ',')} L/ha` : 'Ativa', active: isCalibrationChipActive, available: Boolean(unifiedContext?.calibration), onToggle: () => setIsCalibrationChipActive((p) => !p) }
  ];

  return {
    cultures, equipments, nozzles, calibrations, activeContext: enrichedActiveContext,
    setActiveContext: handleUpdateContext, isContextEnabled, setIsContextEnabled, agronomicMentions,
    equipmentContext: {
      items: equipmentAiItems, selectedId: selectedEquipmentV12Id, isActive: isEquipmentChipActive,
      onToggleActive: () => setIsEquipmentChipActive((p) => !p),
      onSelectEquipment: (item: EquipmentAiContextItem) => { setSelectedEquipmentV12Id(item.id); setIsEquipmentChipActive(true); saveActiveAgronomicSelection(effectiveUserId, { equipmentId: item.id }); setSelectionRevision((r) => r + 1); }
    },
    nozzleContext: {
      items: nozzleAiItems, selectedId: selectedNozzleId, isActive: isNozzleChipActive,
      onToggleActive: () => setIsNozzleChipActive((p) => !p),
      onSelectNozzle: (item: NozzleAiContextItem) => {
        setSelectedNozzleId(item.id); setIsNozzleChipActive(true);
        saveActiveAgronomicSelection(effectiveUserId, { nozzleProfileId: item.id });
        setActiveContext((prev) => ({ ...prev, nozzleProfileId: item.id, nozzleProfileSummary: item.summaryText, nozzleContextActive: true }));
        setSelectionRevision((r) => r + 1);
      }
    }
  };
}
