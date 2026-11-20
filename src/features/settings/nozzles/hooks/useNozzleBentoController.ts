// src/features/settings/nozzles/hooks/useNozzleBentoController.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { NozzleProfile, TunnelOrientation, UavNozzleMode } from '../../../../schemas/nozzle-profile.schema.ts';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import type { EquipmentRecord } from '../../../../schemas/equipment.schema.ts';
import { isValidOwnerId } from '../../../perfis/services/profileOwnership.ts';
import { getActiveAgronomicSelection, saveActiveAgronomicSelection } from '../../../../db/activeSelectionStorage.ts';
import { listScopedNozzleProfiles, saveScopedNozzleProfile, deleteScopedNozzleProfile } from '../services/nozzleProfileStorage.ts';
import { getTypologyCountMeta, inferPrimaryCount, inferSecondaryCount, isSlotConfigured, resizeProfileSlots } from '../services/nozzleProfileMath.ts';
import { applyMeasuredFlowToSlots, applyNozzleToSlots, applySelectedSlotToAll, buildNewProfile, finalizeProfile, mirrorSlotsLeftToRight, toggleSlotActiveInSlots } from '../services/nozzleProfileActions.ts';
import { listScopedEquipmentsV12, syncEquipmentLinksForNozzle } from '../services/nozzleEquipmentIntegration.ts';

export type NozzleKeypadTarget =
  | { kind: 'pressure' }
  | { kind: 'primaryCount' }
  | { kind: 'secondaryCount' }
  | { kind: 'measuredFlow'; slotIndex: number }
  | null;

export function useNozzleBentoController(userId?: string | null) {
  const [profiles, setProfiles] = useState<NozzleProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [keypadTarget, setKeypadTarget] = useState<NozzleKeypadTarget>(null);

  const equipments: EquipmentRecord[] = useLiveQuery(() => listScopedEquipmentsV12(userId), [userId]) || [];

  const loadData = useCallback(async () => {
    if (!isValidOwnerId(userId)) { setProfiles([]); setSelectedProfileId(''); return; }
    const ownerId = userId.trim();
    const savedProfiles = await listScopedNozzleProfiles(ownerId);
    const savedId = getActiveAgronomicSelection(ownerId)?.nozzleProfileId;
    setProfiles(savedProfiles);
    if (savedProfiles.length > 0) {
      setSelectedProfileId((prev) => {
        if (savedId && savedProfiles.some((p) => p.id === savedId)) return savedId;
        return prev && savedProfiles.some((p) => p.id === prev) ? prev : savedProfiles[0].id;
      });
    } else {
      const defaultProf = buildNewProfile(ownerId, 'Configuração Padrão - Ventilador Axial', '3D_AXIAL', 10.0);
      setProfiles([defaultProf]);
      setSelectedProfileId(defaultProf.id);
      await saveScopedNozzleProfile(defaultProf, ownerId);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelectProfile = useCallback((id: string) => {
    setSelectedProfileId(id);
    saveActiveAgronomicSelection(userId, { nozzleProfileId: id });
  }, [userId]);

  const activeProfile = useMemo(() => profiles.find((p) => p.id === selectedProfileId) || profiles[0], [profiles, selectedProfileId]);
  const activeSlot = useMemo(
    () => (!activeProfile ? undefined : activeProfile.slots.find((s) => s.slotIndex === selectedSlotIndex) || activeProfile.slots[0]),
    [activeProfile, selectedSlotIndex]
  );

  const handleUpdateProfile = useCallback(
    async (updated: NozzleProfile) => {
      const prev = profiles.find((p) => p.id === updated.id);
      const finalized = finalizeProfile(updated);
      setProfiles((list) => list.map((p) => (p.id === finalized.id ? finalized : p)));
      if (selectedSlotIndex >= finalized.slots.length) setSelectedSlotIndex(0);
      await saveScopedNozzleProfile(finalized, userId);
      if (prev?.equipmentId !== finalized.equipmentId) {
        await syncEquipmentLinksForNozzle(userId, finalized, prev?.equipmentId);
      }
    },
    [profiles, userId, selectedSlotIndex]
  );

  const applyResize = useCallback(
    (nextPrimary: number, nextSecondary?: number, extra?: { threeDSectors?: 2 | 4 | 6; tunnelOrientation?: TunnelOrientation }) => {
      if (!activeProfile) return;
      const t = activeProfile.equipmentType;
      const curSec = nextSecondary ?? inferSecondaryCount(t, activeProfile.slots, t === '2D_HORIZONTAL' ? activeProfile.boomNozzlesPerSector : t === '3D_PNEUMATIC' ? activeProfile.pneumaticNozzlesPerArm : activeProfile.cannonDeflectorCount);
      const sec3D = extra?.threeDSectors ?? (activeProfile.threeDSectors === 6 ? 6 : activeProfile.threeDSectors === 4 ? 4 : 2);
      const tunOri = extra?.tunnelOrientation ?? activeProfile.tunnelOrientation ?? 'INNER';
      const slots = resizeProfileSlots(t, activeProfile.referencePressureBar, activeProfile.slots, nextPrimary, { secondaryCount: curSec, threeDSectors: sec3D, tunnelOrientation: tunOri });
      handleUpdateProfile({
        ...activeProfile,
        boomSectors: t === '2D_HORIZONTAL' ? nextPrimary : activeProfile.boomSectors,
        boomNozzlesPerSector: t === '2D_HORIZONTAL' ? curSec : activeProfile.boomNozzlesPerSector,
        threeDSectors: t === '3D_AXIAL' || t === '3D_TANGENTIAL' || t === '3D_CROSSFLOW' ? sec3D : activeProfile.threeDSectors,
        tunnelOrientation: t === '3D_TUNNEL' ? tunOri : activeProfile.tunnelOrientation,
        pneumaticArms: t === '3D_PNEUMATIC' ? nextPrimary : activeProfile.pneumaticArms,
        pneumaticNozzlesPerArm: t === '3D_PNEUMATIC' ? curSec : activeProfile.pneumaticNozzlesPerArm,
        cannonDeflectorCount: t === '3D_CANNON' ? curSec : activeProfile.cannonDeflectorCount,
        slots
      });
    },
    [activeProfile, handleUpdateProfile]
  );

  const handleStepPrimary = useCallback((delta: number) => {
    if (!activeProfile) return;
    const meta = getTypologyCountMeta(activeProfile.equipmentType);
    const curr = inferPrimaryCount(activeProfile.equipmentType, activeProfile.slots, activeProfile.equipmentType === '2D_HORIZONTAL' ? activeProfile.boomSectors : activeProfile.pneumaticArms);
    if (meta.stepValues) {
      const idx = meta.stepValues.indexOf(curr);
      applyResize(meta.stepValues[Math.max(0, Math.min(meta.stepValues.length - 1, (idx === -1 ? 0 : idx) + delta))]);
    } else applyResize(Math.max(meta.min, Math.min(meta.max, curr + delta)));
  }, [activeProfile, applyResize]);

  const handleStepSecondary = useCallback((delta: number) => {
    if (!activeProfile) return;
    const t = activeProfile.equipmentType;
    const secMeta = getTypologyCountMeta(t).secondary;
    if (!secMeta) return;
    const currP = inferPrimaryCount(t, activeProfile.slots, t === '2D_HORIZONTAL' ? activeProfile.boomSectors : activeProfile.pneumaticArms);
    const currS = inferSecondaryCount(t, activeProfile.slots, t === '2D_HORIZONTAL' ? activeProfile.boomNozzlesPerSector : t === '3D_PNEUMATIC' ? activeProfile.pneumaticNozzlesPerArm : activeProfile.cannonDeflectorCount);
    applyResize(currP, Math.max(secMeta.min, Math.min(secMeta.max, currS + delta)));
  }, [activeProfile, applyResize]);

  const handleSelectSlotNozzle = useCallback((nozzle: Nozzle, scope: 'slot' | 'sector' | 'side' | 'level' | 'arm' | 'group' | 'all' = 'slot') => {
    if (!activeProfile || !activeSlot) return;
    handleUpdateProfile({ ...activeProfile, slots: applyNozzleToSlots(activeProfile, activeSlot.slotIndex, nozzle, scope) });
  }, [activeProfile, activeSlot, handleUpdateProfile]);

  const handleSetMeasuredFlow = useCallback((slotIndex: number, measuredFlowLMin: number | undefined) => {
    if (!activeProfile) return;
    handleUpdateProfile({ ...activeProfile, slots: applyMeasuredFlowToSlots(activeProfile, slotIndex, measuredFlowLMin) });
  }, [activeProfile, handleUpdateProfile]);

  const handleToggleSlotActive = useCallback((index: number) => {
    if (!activeProfile || !isSlotConfigured(activeProfile.slots.find((s) => s.slotIndex === index))) return;
    handleUpdateProfile({ ...activeProfile, slots: toggleSlotActiveInSlots(activeProfile, index) });
  }, [activeProfile, handleUpdateProfile]);

  const handleApplySelectedToAll = useCallback(() => {
    if (!activeProfile || !activeSlot) return;
    handleUpdateProfile({ ...activeProfile, slots: applySelectedSlotToAll(activeProfile.slots, activeSlot) });
  }, [activeProfile, activeSlot, handleUpdateProfile]);

  const handleMirrorLeftRight = useCallback(() => {
    if (!activeProfile) return;
    handleUpdateProfile({ ...activeProfile, slots: mirrorSlotsLeftToRight(activeProfile.slots) });
  }, [activeProfile, handleUpdateProfile]);

  const handleChangeUavMode = useCallback((uavMode: UavNozzleMode) => {
    if (!activeProfile) return;
    handleUpdateProfile({
      ...activeProfile, uavMode,
      uavRotaryRpm: uavMode === 'ROTARY_CDA' ? (activeProfile.uavRotaryRpm ?? 3500) : undefined,
      uavTargetDv50Um: uavMode === 'ROTARY_CDA' ? (activeProfile.uavTargetDv50Um ?? 150) : undefined
    });
  }, [activeProfile, handleUpdateProfile]);

  const handleCreateNewProfile = useCallback(async () => {
    if (!isValidOwnerId(userId)) return;
    const newProf = buildNewProfile(userId, `Nova Configuração (${profiles.length + 1})`, '3D_AXIAL', 10.0, { emptyByDefault: true });
    setProfiles((prev) => [newProf, ...prev]);
    handleSelectProfile(newProf.id);
    setSelectedSlotIndex(0);
    await saveScopedNozzleProfile(newProf, userId);
  }, [userId, profiles.length, handleSelectProfile]);

  const handleDeleteProfile = useCallback(async (id: string) => {
    await deleteScopedNozzleProfile(id);
    setProfiles((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (selectedProfileId === id && remaining.length > 0) handleSelectProfile(remaining[0].id);
      return remaining;
    });
  }, [selectedProfileId, handleSelectProfile]);

  return {
    profiles, activeProfile, activeSlot, selectedProfileId, selectedSlotIndex, equipments,
    isDrawerOpen, isGuideOpen, keypadTarget, setSelectedProfileId: handleSelectProfile, setSelectedSlotIndex,
    setIsDrawerOpen, setIsGuideOpen, setKeypadTarget, handleUpdateProfile, applyResize,
    handleStepPrimary, handleStepSecondary, handleSelectSlotNozzle, handleSetMeasuredFlow,
    handleToggleSlotActive, handleApplySelectedToAll, handleMirrorLeftRight, handleChangeUavMode,
    handleCreateNewProfile, handleDeleteProfile
  };
}
