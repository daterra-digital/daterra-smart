// src/features/perfis/components/CultureSection.tsx
// Vista principal do perfil "Cultura" em Bento Grid 2x2 de 4 Cartões (6+6 / 7+5) + Editor Focado + Guia Técnico (<= 200 LOC).

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { ProfileCulture } from '../../../db/types';
import { DaterraKeypadModal } from '../../../components/keypad/DaterraKeypadModal';
import { getCultureKeypadConfig } from '../services/cultureFormState';
import { resolveCultureEditorMeta } from '../services/cultureSaveBuilder';
import { useCultureController } from '../hooks/useCultureController';
import { CultureCoreFieldsCard } from './CultureCoreFieldsCard';
import { CultureFocusedEditorModal } from './CultureFocusedEditorModal';
import { CultureGuideModal } from './CultureGuideModal';
import { CultureParcelDataAccordion } from './CultureParcelDataAccordion';
import { CultureLocationAccordion } from './CultureLocationAccordion';
import { CultureMomentsAccordion } from './CultureMomentsAccordion';
import { CultureMomentEditorBox } from './CultureMomentEditorBox';
import { CultureMeasurementsAccordion } from './CultureMeasurementsAccordion';
import { CultureSavedList } from './CultureSavedList';

export interface CultureSectionProps {
  userId: string;
  cultures: ProfileCulture[];
  notifySaved: (msg: string) => void;
  failValidation: (errors: Record<string, string>, msg: string) => void;
  onDeleteCulture: (cultureId: number) => Promise<boolean>;
  saveLegacyFallback?: (userId: string, data: Omit<ProfileCulture, 'id' | 'userId'>, id?: number) => Promise<number>;
}

export const CultureSection: React.FC<CultureSectionProps> = ({
  userId, cultures, notifySaved, failValidation, onDeleteCulture, saveLegacyFallback
}) => {
  const [guideOpen, setGuideOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const ctrl = useCultureController(userId, cultures, notifySaved, failValidation);

  const handleDelete = async (c: ProfileCulture) => {
    if (!c.id) return;
    setDeleteError('');
    try {
      const removed = await onDeleteCulture(c.id);
      if (removed && ctrl.form.editingCultureId === c.id) ctrl.closeEditor();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Não foi possível eliminar a cultura.');
    }
  };

  const keypadConfig = ctrl.keypadField ? getCultureKeypadConfig(ctrl.keypadField, ctrl.form, ctrl.momentDraft) : null;
  const hasPendingOption = [
    ctrl.form.cropKey, ctrl.form.varietyOptionId, ctrl.form.installationOptionId, ctrl.form.conductionOptionId, ctrl.momentDraft.stageOptionId
  ].some((id) => id.startsWith('loc-'));
  const editorMeta = resolveCultureEditorMeta(ctrl.activeEditor, ctrl.form.name, ctrl.form.editingCultureId, ctrl.momentDraft.editingMomentId, ctrl.momentDraft.observedAt);
  const firstError = Object.values(ctrl.fieldErrors)[0];
  const isParcelEditor =
    ctrl.activeEditor === 'parcel_core' || ctrl.activeEditor === 'parcel_data' || ctrl.activeEditor === 'parcel_location';

  return (
    <div className="space-y-4 animate-fade-in" data-has-fallback={Boolean(saveLegacyFallback)}>
      {/* Bento Grid 2x2 (4 Cartões Equilibrados):
          Desktop (xl:grid-cols-12 gap-4):
            Linha 1: Culturas guardadas (xl:col-span-6) + Dados da parcela (xl:col-span-6)
            Linha 2: Estado fenológico (xl:col-span-7) + Medições de vegetação e compatibilidade (xl:col-span-5)
          Tablet (md:grid-cols-6): 6 col por cartão | Smartphone: grid-cols-1 */}
      <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-4 items-stretch">
        <div className="md:col-span-6 xl:col-span-6">
          <CultureSavedList
            cultures={cultures} editingCultureId={ctrl.form.editingCultureId} deleteError={deleteError}
            onOpenGuide={() => setGuideOpen(true)} onCreateNewCulture={ctrl.startNewCulture}
            onEditCulture={ctrl.loadCultureForEdit} onDeleteCulture={handleDelete}
          />
        </div>
        <div className="md:col-span-6 xl:col-span-6">
          <CultureParcelDataAccordion
            mode="card" form={ctrl.form} varietyOptions={ctrl.varietyOptions}
            installationOptions={ctrl.installationOptions} conductionOptions={ctrl.conductionOptions}
            onEditParcel={() => ctrl.openEditor('parcel_data')}
            onUpdate={ctrl.updateForm}
            onCreateCustomOption={(cat, lbl) => ctrl.createCustom(cat, lbl, cat === 'instalacao' ? undefined : ctrl.form.cropKey || undefined)}
            onRenameCustomOption={ctrl.renameCustom}
          />
        </div>
        <div className="md:col-span-6 xl:col-span-7">
          <CultureMomentsAccordion
            editingCulture={ctrl.editingCulture} moments={ctrl.moments} revisionsByMomentId={ctrl.revisionsByMomentId}
            cropKey={ctrl.form.cropKey} onOpenNewMoment={ctrl.openNewMoment}
            onActivateMoment={ctrl.activateMoment} onEditMoment={ctrl.editMoment}
          />
        </div>
        <div className="md:col-span-6 xl:col-span-5">
          <CultureMeasurementsAccordion
            mode="card" form={ctrl.form} activeMoment={ctrl.activeMoment} momentDraft={ctrl.momentDraft}
            hasPendingCustomOption={hasPendingOption} fieldErrors={ctrl.fieldErrors}
            onEditMeasurements={() => ctrl.openEditor('measurements')} onOpenKeypad={(f) => ctrl.setKeypadField(f)}
            onClearFormField={(f) => ctrl.updateForm({ [f]: '' })} onUpdateMoment={ctrl.updateMoment}
            onUpdateForm={ctrl.updateForm}
          />
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-[#1D734B] shrink-0 mt-0.5" />
        <span>Dados guardados localmente no dispositivo com isolamento por conta, sujeitos à política de encerramento de sessão.</span>
      </div>

      <CultureFocusedEditorModal
        isOpen={ctrl.activeEditor !== null} title={editorMeta.title} subtitle={editorMeta.subtitle}
        submitLabel={editorMeta.submitLabel} errorMessage={firstError} onClose={ctrl.cancelEditor} onSubmit={ctrl.saveAll}
      >
        {isParcelEditor && (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] font-bold tracking-wide uppercase text-[#114037] border-b border-slate-200 pb-1.5">
                1. IDENTIFICAÇÃO E CARACTERÍSTICAS
              </p>
              <CultureCoreFieldsCard
                form={ctrl.form} cultureOptions={ctrl.cultureOptions} isSpeciesLocked={ctrl.isSpeciesLocked}
                speciesNotice={ctrl.speciesNotice} fieldErrors={ctrl.fieldErrors} onStartNewCulture={ctrl.startNewCulture}
                onUpdateForm={ctrl.updateForm} onSelectCulture={ctrl.selectCultureOption}
                onCreateCultureOption={(lbl) => ctrl.createCustom('cultura', lbl)} onRenameCultureOption={ctrl.renameCustom}
                onOpenAreaKeypad={() => ctrl.setKeypadField('area')}
              />
              <CultureParcelDataAccordion
                mode="editor" form={ctrl.form} varietyOptions={ctrl.varietyOptions}
                installationOptions={ctrl.installationOptions} conductionOptions={ctrl.conductionOptions}
                onUpdate={ctrl.updateForm}
                onCreateCustomOption={(cat, lbl) => ctrl.createCustom(cat, lbl, cat === 'instalacao' ? undefined : ctrl.form.cropKey || undefined)}
                onRenameCustomOption={ctrl.renameCustom}
              />
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-200">
              <p className="text-[11px] font-bold tracking-wide uppercase text-[#114037] border-b border-slate-200 pb-1.5">
                2. LOCALIZAÇÃO E CONTEXTO ESPACIAL
              </p>
              <CultureLocationAccordion mode="editor" form={ctrl.form} fieldErrors={ctrl.fieldErrors} onUpdate={ctrl.updateForm} onOpenKeypad={(f) => ctrl.setKeypadField(f)} />
            </div>
          </div>
        )}
        {ctrl.activeEditor === 'moment' && (
          <CultureMomentEditorBox
            cropKey={ctrl.form.cropKey} stageOptions={ctrl.stageOptions} momentDraft={ctrl.momentDraft}
            hasSavedMoments={ctrl.moments.length > 0} stageError={ctrl.fieldErrors.stage || ctrl.fieldErrors.observedAt}
            fieldErrors={ctrl.fieldErrors} onDateValidityChange={ctrl.setDateValid} onCopyLastMoment={ctrl.copyLastMoment}
            onOpenKeypad={(f) => ctrl.setKeypadField(f)} onUpdateMoment={ctrl.updateMoment}
            onCreateStageOption={(lbl) => ctrl.createCustom('estadio', lbl, ctrl.form.cropKey || undefined)}
            onRenameStageOption={ctrl.renameCustom}
          />
        )}
        {ctrl.activeEditor === 'measurements' && (
          <CultureMeasurementsAccordion
            mode="editor" form={ctrl.form} activeMoment={ctrl.activeMoment} momentDraft={ctrl.momentDraft}
            hasPendingCustomOption={hasPendingOption} fieldErrors={ctrl.fieldErrors}
            onOpenKeypad={(f) => ctrl.setKeypadField(f)} onClearFormField={(f) => ctrl.updateForm({ [f]: '' })}
            onUpdateMoment={ctrl.updateMoment} onUpdateForm={ctrl.updateForm}
          />
        )}
      </CultureFocusedEditorModal>

      {keypadConfig && ctrl.keypadField && (
        <DaterraKeypadModal
          isOpen onClose={() => ctrl.setKeypadField(null)} initialValue={keypadConfig.initialValue}
          initialUnit={keypadConfig.unit} commonValues={keypadConfig.commonValues} label={keypadConfig.label}
          validationRules={{
            required: true, min: keypadConfig.min ?? 0, minInclusive: keypadConfig.minInclusive ?? false,
            max: keypadConfig.max, allowDecimal: keypadConfig.allowDecimal ?? true, maxDecimals: keypadConfig.maxDecimals ?? 2
          }}
          onConfirm={(num) => {
            const valStr = String(num).replace('.', ',');
            const f = ctrl.keypadField;
            if (f === 'canopyHeight' || f === 'canopyWidth' || f === 'lai') ctrl.updateMoment({ [f]: valStr });
            else if (f) ctrl.updateForm({ [f]: valStr });
            ctrl.setKeypadField(null);
          }}
        />
      )}

      <CultureGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};
