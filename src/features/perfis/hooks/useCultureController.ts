// src/features/perfis/hooks/useCultureController.ts
// Hook controlador de estado, cascatas, opções locais, momentos e persistência de Cultura (<= 200 LOC).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import type { ProfileCropMoment, ProfileCulture, ProfileCustomOptionCategory, ProfileMomentRevision } from '../../../db/types';
import {
  CONDUCTION_CATALOG_BY_CULTURE,
  CULTURE_CATALOG_OPTIONS,
  INSTALLATION_CATALOG_OPTIONS,
  PHENOLOGY_CATALOG_BY_CULTURE,
  VARIETY_CATALOG_BY_CULTURE,
  type CatalogSelectOption
} from '../data/cultureCatalogData';
import { renameScopedCustomOption, saveScopedCustomOption } from '../services/cultureCustomOptionStorage';
import { findCultureOperationalDependencies } from '../services/cultureDeletionService';
import { findLatestChronologicalMoment, isChronologicallyLatest, todayIsoCivil } from '../services/cultureDateUtils';
import { listMomentsForCulture, listRevisionsForMoment, saveScopedCultureWithMoment, setActiveCultureMoment } from '../services/cultureMomentStorage';
import { buildCultureSave } from '../services/cultureSaveBuilder';
import {
  createInitialCultureForm,
  createInitialMomentDraft,
  formatNumField,
  mapCultureToFormState,
  mapMomentToDraftState,
  type CultureEditorCard,
  type CultureMomentDraftState,
  type CultureV11FormState
} from '../services/cultureFormState';
import { inferCultureGeometryMode } from '../data/cultureGeometryOptions';
import type { CultureKeypadField } from '../services/cultureKeypadHelpers';

export type CultureKeypadTarget = CultureKeypadField;

function mergeOpts(
  base: CatalogSelectOption[],
  locals: Array<{ id?: number; localId: string; currentLabel: string; category: ProfileCustomOptionCategory; cultureKey?: string }>,
  category: ProfileCustomOptionCategory,
  cultureKey?: string
): CatalogSelectOption[] {
  const custom = locals
    .filter((o) => o.category === category && (cultureKey === undefined || (o.cultureKey ?? '') === cultureKey))
    .map((o) => ({ id: o.localId, label: o.currentLabel, isPendingLocal: true, localRecordId: o.id }));
  return [...base, ...custom];
}

export function useCultureController(
  userId: string,
  cultures: ProfileCulture[],
  notifySaved: (msg: string) => void,
  failValidation: (errors: Record<string, string>, msg: string) => void
) {
  const [form, setForm] = useState<CultureV11FormState>(() => createInitialCultureForm());
  const [momentDraft, setMomentDraft] = useState<CultureMomentDraftState>(() => createInitialMomentDraft());
  const [momentEditorOpen, setMomentEditorOpen] = useState(false);
  const [dateValid, setDateValid] = useState(true);
  const [speciesNotice, setSpeciesNotice] = useState('');
  const [hasOpDeps, setHasOpDeps] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [accOpen, setAccOpen] = useState({ parcel: false, location: false, moment: false, measurements: false });
  const [keypadField, setKeypadField] = useState<CultureKeypadTarget | null>(null);
  const [activeEditor, setActiveEditor] = useState<CultureEditorCard | null>(null);
  const editorBackup = useRef<{ form: CultureV11FormState; momentDraft: CultureMomentDraftState } | null>(null);
  const markTouched = useRef(false);

  const rawCustomOptions = useLiveQuery(() => (userId ? db.profile_custom_options.where('userId').equals(userId).toArray() : []), [userId]);
  const customOptions = useMemo(() => rawCustomOptions || [], [rawCustomOptions]);
  const rawMoments = useLiveQuery(() => (userId && form.editingCultureId ? listMomentsForCulture(userId, form.editingCultureId, db) : []), [userId, form.editingCultureId]);
  const moments = useMemo(() => rawMoments || [], [rawMoments]);
  const latestMoment = useMemo(() => findLatestChronologicalMoment(moments), [moments]);
  const [revisionsByMomentId, setRevisionsByMomentId] = useState<Record<number, ProfileMomentRevision[]>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId || !form.editingCultureId) { setHasOpDeps(false); setRevisionsByMomentId({}); return; }
      const deps = await findCultureOperationalDependencies(db, userId, form.editingCultureId);
      const revEntries = await Promise.all(
        moments.filter((m) => m.id).map(async (m) => [m.id!, await listRevisionsForMoment(userId, m.id!, db)] as const)
      );
      if (!cancelled) { setHasOpDeps(deps.hasBlockingDependencies); setRevisionsByMomentId(Object.fromEntries(revEntries)); }
    })();
    return () => { cancelled = true; };
  }, [userId, form.editingCultureId, moments]);

  const editingCulture = useMemo(() => cultures.find((c) => c.id === form.editingCultureId), [cultures, form.editingCultureId]);
  const activeMoment = useMemo(() => moments.find((m) => m.id === editingCulture?.active_moment_id) || latestMoment, [moments, editingCulture?.active_moment_id, latestMoment]);
  const isSpeciesLocked = Boolean(form.editingCultureId && (moments.length > 0 || hasOpDeps));

  useEffect(() => {
    if (!form.editingCultureId && activeEditor !== 'parcel_core' && cultures.length > 0) {
      setForm(mapCultureToFormState(cultures[0]));
    }
  }, [cultures, form.editingCultureId, activeEditor]);

  const cultureOptions = useMemo(() => mergeOpts(CULTURE_CATALOG_OPTIONS, customOptions, 'cultura'), [customOptions]);
  const varietyOptions = useMemo(() => mergeOpts(VARIETY_CATALOG_BY_CULTURE[form.cropKey] || [], customOptions, 'variedade', form.cropKey || undefined), [customOptions, form.cropKey]);
  const installationOptions = useMemo(() => mergeOpts(INSTALLATION_CATALOG_OPTIONS, customOptions, 'instalacao'), [customOptions]);
  const conductionOptions = useMemo(() => mergeOpts(CONDUCTION_CATALOG_BY_CULTURE[form.cropKey] || [], customOptions, 'conducao', form.cropKey || undefined), [customOptions, form.cropKey]);
  const stageOptions = useMemo(() => mergeOpts(PHENOLOGY_CATALOG_BY_CULTURE[form.cropKey] || [], customOptions, 'estadio', form.cropKey || undefined), [customOptions, form.cropKey]);

  const handleSpeciesChoice = useCallback((opt: CatalogSelectOption) => {
    setForm((prev) => {
      const changed = prev.cropKey !== opt.id;
      const inferredMode = inferCultureGeometryMode(opt.id, opt.label);
      setSpeciesNotice(changed && (prev.varietyLabel || prev.conductionLabel || prev.installationLabel) ? 'Cultura alterada no rascunho: campos dependentes limpos.' : '');
      return { ...prev, cropKey: opt.id, cropLabel: opt.label, geometryMode: inferredMode, ...(changed ? { varietyOptionId: '', varietyLabel: '', conductionOptionId: '', conductionLabel: '' } : {}) };
    });
    setMomentDraft((prev) => ({ ...prev, stageOptionId: '', stageLabel: '', stageCode: '' }));
  }, []);

  const createCustom = async (category: ProfileCustomOptionCategory, label: string, cultureKey?: string): Promise<CatalogSelectOption | null> => {
    const res = await saveScopedCustomOption(userId, { category, cultureKey, label }, db);
    return { id: res.option.localId, label: res.option.currentLabel, isPendingLocal: true, localRecordId: res.option.id };
  };
  const renameCustom = async (recordId: number, newLabel: string): Promise<CatalogSelectOption | null> => {
    const updated = await renameScopedCustomOption(userId, recordId, newLabel, db);
    return { id: updated.localId, label: updated.currentLabel, isPendingLocal: true, localRecordId: updated.id };
  };

  const resetEditorState = (nextForm: CultureV11FormState, nextDraft: CultureMomentDraftState, momentOpen: boolean) => {
    setForm(nextForm); setMomentDraft(nextDraft); setMomentEditorOpen(momentOpen); setActiveEditor(momentOpen ? 'moment' : null);
    setFieldErrors({}); setSpeciesNotice(''); markTouched.current = false; editorBackup.current = { form: nextForm, momentDraft: nextDraft };
  };
  const startNewCulture = () => {
    const emptyForm = createInitialCultureForm(); const emptyDraft = createInitialMomentDraft();
    setForm(emptyForm); setMomentDraft(emptyDraft); setMomentEditorOpen(false);
    setFieldErrors({}); setSpeciesNotice(''); markTouched.current = false;
    editorBackup.current = { form: emptyForm, momentDraft: emptyDraft }; setActiveEditor('parcel_core');
  };
  const loadCultureForEdit = (culture: ProfileCulture, openMoment = false) => {
    resetEditorState(mapCultureToFormState(culture), createInitialMomentDraft(), openMoment);
    if (openMoment) setAccOpen((p) => ({ ...p, moment: true, measurements: true }));
  };
  const openEditor = (card: CultureEditorCard) => {
    editorBackup.current = { form, momentDraft }; setFieldErrors({});
    if (card === 'measurements' && activeMoment) { setMomentDraft(mapMomentToDraftState(activeMoment, moments)); setMomentEditorOpen(true); }
    else if (card !== 'moment') setMomentEditorOpen(false);
    setActiveEditor(card);
  };
  const closeEditor = () => { editorBackup.current = null; setActiveEditor(null); setMomentEditorOpen(false); };
  const cancelEditor = () => {
    if (editorBackup.current) { setForm(editorBackup.current.form); setMomentDraft(editorBackup.current.momentDraft); }
    setFieldErrors({}); closeEditor();
  };
  const openMomentEditor = (draft: CultureMomentDraftState) => {
    editorBackup.current = { form, momentDraft }; markTouched.current = false;
    setMomentDraft(draft); setMomentEditorOpen(true); setActiveEditor('moment'); setFieldErrors({});
    setAccOpen((p) => ({ ...p, moment: true, measurements: true }));
  };
  const openNewMoment = () => {
    const draft = createInitialMomentDraft();
    openMomentEditor({ ...draft, markAsActive: isChronologicallyLatest(draft.observedAt, moments) });
  };

  useEffect(() => {
    if (!momentEditorOpen || markTouched.current) return;
    const auto = isChronologicallyLatest(momentDraft.observedAt, moments, momentDraft.editingMomentId);
    setMomentDraft((p) => (p.markAsActive === auto ? p : { ...p, markAsActive: auto }));
  }, [momentEditorOpen, momentDraft.observedAt, momentDraft.editingMomentId, moments]);

  const copyLastMoment = () => {
    if (!latestMoment) return;
    setMomentDraft((p) => ({ ...p, observedAt: todayIsoCivil(), canopyHeight: formatNumField(latestMoment.canopyHeightM), canopyWidth: formatNumField(latestMoment.canopyWidthM), thicknessTierManual: latestMoment.thicknessTierManual, densityTier: latestMoment.densityTier, lai: formatNumField(latestMoment.lai), measurementSource: 'copied_previous', copiedFromMomentId: latestMoment.id }));
  };

  const saveAll = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userId) return failValidation({}, 'Inicie sessão para guardar perfis.');
    const { errors, params, needsMomentEditor } = buildCultureSave({ form, momentDraft, momentEditorOpen, dateValid });
    if (needsMomentEditor) { setMomentEditorOpen(true); setActiveEditor('moment'); setAccOpen((p) => ({ ...p, moment: true })); }
    setFieldErrors(errors);
    if (!params) return failValidation(errors, 'Verifique os campos assinalados antes de guardar a Cultura.');
    const { cultureId } = await saveScopedCultureWithMoment(userId, params, db);
    notifySaved(form.editingCultureId ? 'Cultura atualizada localmente com sucesso!' : 'Cultura guardada localmente com sucesso!');
    const saved = await db.profiles_cultures.get(cultureId);
    if (saved) resetEditorState(mapCultureToFormState(saved), createInitialMomentDraft(), false);
    else resetEditorState(createInitialCultureForm(), createInitialMomentDraft(), false);
  };

  return {
    form, updateForm: (p: Partial<CultureV11FormState>) => setForm((prev) => ({ ...prev, ...p })),
    momentDraft, updateMoment: (p: Partial<CultureMomentDraftState>) => { if ('markAsActive' in p) markTouched.current = true; setMomentDraft((prev) => ({ ...prev, ...p })); },
    momentEditorOpen, setMomentEditorOpen, dateValid, setDateValid,
    speciesNotice, isSpeciesLocked, editingCulture, activeMoment, moments, latestMoment, revisionsByMomentId,
    fieldErrors, accOpen, setAccOpen, keypadField, setKeypadField, activeEditor, openEditor, closeEditor, cancelEditor,
    cultureOptions, varietyOptions, installationOptions, conductionOptions, stageOptions,
    selectCultureOption: handleSpeciesChoice, createCustom, renameCustom, startNewCulture, loadCultureForEdit, openNewMoment, copyLastMoment, saveAll,
    activateMoment: (mId: number) => form.editingCultureId && setActiveCultureMoment(userId, form.editingCultureId, mId, db),
    editMoment: (m: ProfileCropMoment) => openMomentEditor(mapMomentToDraftState(m, moments))
  };
}
