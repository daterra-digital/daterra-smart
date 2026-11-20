// src/features/settings/equipment/useEquipmentController.ts
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/dexie-db.ts';
import type { ProfileCulture, ProfileNozzle } from '../../../db/types.ts';
import type { EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import { saveScopedEquipment, deleteScopedProfile } from '../../perfis/services/profileStorageService.ts';
import { isOwnedByUser, isValidOwnerId } from '../../perfis/services/profileOwnership.ts';
import { getActiveAgronomicSelection, saveActiveAgronomicSelection } from '../../../db/activeSelectionStorage.ts';
import { parseNozzleSetOption, syncNozzleLinksForEquipment } from '../nozzles/services/nozzleEquipmentIntegration.ts';
import { parseMomentSnapshot } from '../../perfis/services/cultureEngineCompatibility.ts';
import {
  INITIAL_EQUIPMENT_V12_FORM,
  mapEquipmentRecordToForm,
  type EquipmentEditorTarget,
  type EquipmentKeypadField,
  type EquipmentV12FormState
} from './equipmentFormState.ts';
import {
  buildEquipmentRecordFromForm,
  mapEquipmentRecordToLegacyProfile
} from './equipmentPayloadBuilder.ts';

export function useEquipmentController(
  userId: string,
  cultures: ProfileCulture[],
  nozzles: ProfileNozzle[],
  notifySaved: (msg: string) => void,
  failValidation: (errors: Record<string, string>, msg: string) => void
) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<EquipmentEditorTarget>(null);
  const [form, setForm] = useState<EquipmentV12FormState>(INITIAL_EQUIPMENT_V12_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [dateValid, setDateValid] = useState(true);
  const [keypadField, setKeypadField] = useState<EquipmentKeypadField | null>(null);

  const equipments =
    useLiveQuery<EquipmentRecord[]>(async () => {
      if (!isValidOwnerId(userId)) return [];
      const ownerId = userId.trim();
      const owned = await db.equipments.where('userId').equals(ownerId).toArray();
      return owned
        .filter((e) => isOwnedByUser(e, ownerId))
        .sort((a, b) => (b.lastUpdatedAt || '').localeCompare(a.lastUpdatedAt || ''));
    }, [userId]) || [];

  const activeCulture = useMemo(() => {
    if (cultures.length === 0) return undefined;
    return cultures.find((c) => c.last_trv_m3_ha !== undefined) || cultures[0];
  }, [cultures]);

  const activeCountryCode = useMemo(() => {
    return activeCulture?.country_code || cultures[0]?.country_code || 'PT';
  }, [activeCulture?.country_code, cultures]);

  const activeMomentTrv = useLiveQuery<number | undefined>(async () => {
    if (!activeCulture) return undefined;
    if (activeCulture.last_trv_m3_ha !== undefined && activeCulture.last_trv_m3_ha > 0) {
      return activeCulture.last_trv_m3_ha;
    }
    if (activeCulture.active_moment_id) {
      const m = await db.profile_crop_moments.get(activeCulture.active_moment_id);
      const snap = m?.snapshotJson ? parseMomentSnapshot(m.snapshotJson) : null;
      if (snap?.trvPure && snap.trvPure > 0) return snap.trvPure;
    }
    if (activeCulture.row_distance_m && activeCulture.canopy_height_m && activeCulture.canopy_width_m) {
      return Number(((10000 * activeCulture.canopy_height_m * activeCulture.canopy_width_m) / activeCulture.row_distance_m).toFixed(1));
    }
    return undefined;
  }, [activeCulture?.id, activeCulture?.last_trv_m3_ha, activeCulture?.active_moment_id, activeCulture?.row_distance_m, activeCulture?.canopy_height_m, activeCulture?.canopy_width_m]);

  useEffect(() => {
    if (equipments.length === 0) { setSelectedId(null); return; }
    const savedId = getActiveAgronomicSelection(userId)?.equipmentId;
    if (!selectedId || !equipments.some((e) => e.id === selectedId)) {
      const next = (savedId && equipments.find((e) => e.id === savedId)) || equipments[0];
      setSelectedId(next.id);
    }
  }, [equipments, selectedId, userId]);

  const selectedEquipment = useMemo(() => equipments.find((e) => e.id === selectedId) ?? equipments[0], [equipments, selectedId]);
  const selectEquipment = (eq: EquipmentRecord) => { setSelectedId(eq.id); setFieldErrors({}); saveActiveAgronomicSelection(userId, { equipmentId: eq.id }); };
  const openNewEquipment = () => { setForm(INITIAL_EQUIPMENT_V12_FORM); setFieldErrors({}); setDateValid(true); setActiveEditor('new'); };
  const openEditSection = (target: Exclude<EquipmentEditorTarget, 'new' | null>) => {
    if (!selectedEquipment) return;
    const mapped = mapEquipmentRecordToForm(selectedEquipment);
    const linkedIds = nozzles.map(parseNozzleSetOption).filter((o) => o.equipmentId === selectedEquipment.id).map((o) => o.key);
    setForm({ ...mapped, associatedNozzleIds: Array.from(new Set([...mapped.associatedNozzleIds, ...linkedIds])) });
    setFieldErrors({});
    setDateValid(true);
    setActiveEditor(target);
  };
  const closeEditor = () => { setActiveEditor(null); setKeypadField(null); setFieldErrors({}); };
  const updateForm = (patch: Partial<EquipmentV12FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const toggleAssociatedNozzle = (nozzleDesc: string) => {
    setForm((prev) => ({
      ...prev,
      associatedNozzleIds: prev.associatedNozzleIds.includes(nozzleDesc)
        ? prev.associatedNozzleIds.filter((n) => n !== nozzleDesc)
        : [...prev.associatedNozzleIds, nozzleDesc]
    }));
  };

  const saveEquipment = async () => {
    if (!userId.trim()) {
      failValidation({}, 'Inicie sessão para guardar o equipamento.');
      return;
    }
    if (!dateValid) {
      setFieldErrors({ lastInspectionDate: 'Indique uma data válida no formato DD-MM-AAAA.' });
      return;
    }
    const { record, errors } = buildEquipmentRecordFromForm(form, userId);
    if (!record) {
      setFieldErrors(errors);
      failValidation(errors, 'Corrija os campos assinalados antes de guardar o equipamento.');
      return;
    }

    try {
      const legacyPayload = mapEquipmentRecordToLegacyProfile(record);
      const legacyId = await saveScopedEquipment(userId, legacyPayload, record.legacyProfileId);
      const finalRecord: EquipmentRecord = { ...record, legacyProfileId: legacyId };
      await db.equipments.put(finalRecord);
      await syncNozzleLinksForEquipment(userId, finalRecord.id, finalRecord.name, finalRecord.associatedNozzleIds ?? []);
      setSelectedId(finalRecord.id);
      saveActiveAgronomicSelection(userId, { equipmentId: finalRecord.id });
      closeEditor();
      notifySaved('Ficha de Equipamento guardada com sucesso!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao guardar o equipamento.';
      setFieldErrors({ general: msg });
      failValidation({ general: msg }, msg);
    }
  };

  const removeEquipment = async (eq: EquipmentRecord) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Deseja eliminar o equipamento "${eq.name}"? Esta ação não pode ser desfeita.`);
      if (!ok) return;
    }
    await db.equipments.delete(eq.id);
    if (eq.legacyProfileId && userId.trim()) {
      await deleteScopedProfile(userId, 'equipment', eq.legacyProfileId);
    }
    if (selectedId === eq.id) {
      const remaining = equipments.filter((item) => item.id !== eq.id);
      setSelectedId(remaining[0]?.id ?? null);
    }
  };

  return {
    equipments,
    selectedEquipment,
    activeCulture,
    activeCountryCode,
    activeMomentTrv,
    nozzles,
    form,
    fieldErrors,
    activeEditor,
    keypadField,
    setKeypadField,
    setDateValid,
    selectEquipment,
    openNewEquipment,
    openEditSection,
    closeEditor,
    updateForm,
    toggleAssociatedNozzle,
    saveEquipment,
    removeEquipment
  };
}
