// src/features/settings/equipment/EquipmentSection.tsx
// Vista principal do perfil "Equipamentos" em Bento Grid 2x2 de 4 Cartões (6+6 / 7+5) + Editor Focado + Guia Técnico (<= 200 LOC).

import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { ProfileCulture, ProfileNozzle } from '../../../db/types.ts';
import { DaterraKeypadModal } from '../../../components/keypad/DaterraKeypadModal.tsx';
import {
  getEquipmentKeypadConfig,
  resolveEquipmentEditorMeta,
  resolveInitialOpenAccordions
} from './equipmentFormHelpers.ts';
import type { EquipmentAccordionId } from './equipmentFormState.ts';
import { useEquipmentController } from './useEquipmentController.ts';
import { EquipmentSavedListCard } from './EquipmentSavedListCard.tsx';
import { EquipmentIdentificationCard } from './EquipmentIdentificationCard.tsx';
import { EquipmentDistributionCard } from './EquipmentDistributionCard.tsx';
import { EquipmentIsoInspectionCard } from './EquipmentIsoInspectionCard.tsx';
import { EquipmentFocusedEditorModal } from './EquipmentFocusedEditorModal.tsx';
import { EquipmentEditorMainAccordions } from './EquipmentEditorMainAccordions.tsx';
import { EquipmentEditorIsoAccordions } from './EquipmentEditorIsoAccordions.tsx';
import { EquipmentGuideModal } from './EquipmentGuideModal.tsx';

export interface EquipmentSectionProps {
  userId: string;
  cultures: ProfileCulture[];
  nozzles: ProfileNozzle[];
  notifySaved: (msg: string) => void;
  failValidation: (errors: Record<string, string>, msg: string) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  userId,
  cultures,
  nozzles,
  notifySaved,
  failValidation
}) => {
  const [guideOpen, setGuideOpen] = useState(false);
  const ctrl = useEquipmentController(userId, cultures, nozzles, notifySaved, failValidation);

  const [openAccordions, setOpenAccordions] = useState<Record<EquipmentAccordionId, boolean>>(() =>
    resolveInitialOpenAccordions('new')
  );

  useEffect(() => {
    if (ctrl.activeEditor) {
      setOpenAccordions(resolveInitialOpenAccordions(ctrl.activeEditor));
    }
  }, [ctrl.activeEditor]);

  const toggleAccordion = (id: EquipmentAccordionId) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const keypadConfig = ctrl.keypadField
    ? getEquipmentKeypadConfig(ctrl.keypadField, ctrl.form)
    : null;
  const editorMeta = resolveEquipmentEditorMeta(
    ctrl.activeEditor,
    ctrl.form.name,
    ctrl.form.editingId
  );
  const firstError = Object.values(ctrl.fieldErrors)[0];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Bento Grid 2x2 (4 Cartões Equilibrados):
          Linha 1: Equipamentos guardados (xl:col-span-6) + Identificação da máquina (xl:col-span-6)
          Linha 2: Distribuição e aerodinâmica (xl:col-span-7) + Pré-inspeção ISO 16122 (xl:col-span-5) */}
      <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-4 items-stretch">
        <div className="md:col-span-6 xl:col-span-6">
          <EquipmentSavedListCard
            equipments={ctrl.equipments}
            selectedId={ctrl.selectedEquipment?.id}
            countryCode={ctrl.activeCountryCode}
            onOpenGuide={() => setGuideOpen(true)}
            onCreateNew={ctrl.openNewEquipment}
            onSelect={ctrl.selectEquipment}
            onDelete={ctrl.removeEquipment}
          />
        </div>

        <div className="md:col-span-6 xl:col-span-6">
          <EquipmentIdentificationCard
            equipment={ctrl.selectedEquipment}
            onEdit={() => ctrl.openEditSection('identification')}
          />
        </div>

        <div className="md:col-span-6 xl:col-span-7">
          <EquipmentDistributionCard
            equipment={ctrl.selectedEquipment}
            activeCultureName={ctrl.activeCulture?.name}
            activeTrvM3ha={ctrl.activeMomentTrv}
            onEdit={() => ctrl.openEditSection('distribution')}
          />
        </div>

        <div className="md:col-span-6 xl:col-span-5">
          <EquipmentIsoInspectionCard
            equipment={ctrl.selectedEquipment}
            countryCode={ctrl.activeCountryCode}
            onEdit={() => ctrl.openEditSection('inspection')}
          />
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-[#1D734B] shrink-0 mt-0.5" />
        <span>
          Fichas técnicas de equipamento guardadas localmente no dispositivo.
        </span>
      </div>

      <EquipmentFocusedEditorModal
        isOpen={ctrl.activeEditor !== null}
        title={editorMeta.title}
        subtitle={editorMeta.subtitle}
        submitLabel={editorMeta.submitLabel}
        errorMessage={firstError}
        onClose={ctrl.closeEditor}
        onSubmit={ctrl.saveEquipment}
      >
        <div className="space-y-4">
          <EquipmentEditorMainAccordions
            userId={userId}
            form={ctrl.form}
            nozzles={ctrl.nozzles}
            openState={openAccordions}
            fieldErrors={ctrl.fieldErrors}
            onToggleAccordion={toggleAccordion}
            onUpdate={ctrl.updateForm}
            onToggleNozzle={ctrl.toggleAssociatedNozzle}
            onOpenKeypad={(f) => ctrl.setKeypadField(f)}
          />
          <EquipmentEditorIsoAccordions
            userId={userId}
            form={ctrl.form}
            openState={openAccordions}
            fieldErrors={ctrl.fieldErrors}
            onToggleAccordion={toggleAccordion}
            onUpdate={ctrl.updateForm}
            onOpenKeypad={(f) => ctrl.setKeypadField(f)}
            onDateValidityChange={ctrl.setDateValid}
          />
        </div>
      </EquipmentFocusedEditorModal>

      {keypadConfig && ctrl.keypadField && (
        <DaterraKeypadModal
          isOpen
          onClose={() => ctrl.setKeypadField(null)}
          initialValue={keypadConfig.initialValue}
          initialUnit={keypadConfig.unit}
          commonValues={keypadConfig.commonValues}
          label={keypadConfig.label}
          validationRules={{
            required: true,
            min: 0,
            minInclusive: ctrl.keypadField === 'defaultAirflowM3h',
            allowDecimal: keypadConfig.allowDecimal,
            maxDecimals: keypadConfig.maxDecimals
          }}
          onConfirm={(num) => {
            const valStr = String(num).replace('.', ',');
            if (ctrl.keypadField) {
              ctrl.updateForm({ [ctrl.keypadField]: valStr });
            }
            ctrl.setKeypadField(null);
          }}
        />
      )}

      <EquipmentGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};
