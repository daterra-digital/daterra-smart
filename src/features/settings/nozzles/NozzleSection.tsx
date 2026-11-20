// src/features/settings/nozzles/NozzleSection.tsx
import React, { useState, useEffect } from 'react';
import { useNozzleBentoController } from './hooks/useNozzleBentoController.ts';
import { buildKeypadShortcutsForFlow, formatSlotPositionHeading, getTypologyCountMeta, inferPrimaryCount, inferSecondaryCount } from './services/nozzleProfileMath.ts';
import { buildBoom2dSlotHeading, buildMeasuredFlowKeypadTitle } from './services/nozzleBoom2dHelpers.ts';
import { resolveTunnelRampFilterFallback, type TunnelRampFilter } from './services/nozzleTunnelHelpers.ts';
import { resolvePneumaticArmFilterFallback, type PneumaticArmFilter } from './services/nozzlePneumaticHelpers.ts';
import { resolveCannonGroupFilterFallback, type CannonGroupFilter } from './services/nozzleCannonHelpers.ts';
import type { DroneFlankFilter } from './services/nozzleDroneHelpers.ts';
import { BentoSavedProfilesCard } from './components/BentoSavedProfilesCard.tsx';
import { BentoGeometricSchemeCard } from './components/BentoGeometricSchemeCard.tsx';
import { BentoSlotDetailCard } from './components/BentoSlotDetailCard.tsx';
import { NozzleEditorDrawer } from './components/NozzleEditorDrawer.tsx';
import { NozzleGuideModal } from './components/NozzleGuideModal.tsx';
import { NozzleMetadataModal } from './components/NozzleMetadataModal.tsx';
import { DaterraKeypadModal } from '../../../components/keypad/DaterraKeypadModal.tsx';

interface NozzleSectionProps {
  userId?: string | null;
}

export const NozzleSection: React.FC<NozzleSectionProps> = ({ userId }) => {
  const ctrl = useNozzleBentoController(userId);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [boomSectorFilter, setBoomSectorFilter] = useState<number | 'ALL'>(1);
  const [tunnelRampFilter, setTunnelRampFilter] = useState<TunnelRampFilter>('LEFT_OUTER');
  const [pneumaticArmFilter, setPneumaticArmFilter] = useState<PneumaticArmFilter>('LEFT_1');
  const [cannonGroupFilter, setCannonGroupFilter] = useState<CannonGroupFilter>('MAIN');
  const [droneFlankFilter, setDroneFlankFilter] = useState<DroneFlankFilter>('ALL');

  useEffect(() => {
    const t = ctrl.activeProfile?.equipmentType;
    if (t === '2D_HORIZONTAL') setBoomSectorFilter(1);
    if (t === '3D_TUNNEL') setTunnelRampFilter((p) => resolveTunnelRampFilterFallback(p, ctrl.activeProfile?.tunnelOrientation ?? 'BOTH'));
    if (t === '3D_PNEUMATIC') {
      const arms = inferPrimaryCount('3D_PNEUMATIC', ctrl.activeProfile!.slots, ctrl.activeProfile!.pneumaticArms);
      setPneumaticArmFilter((p) => resolvePneumaticArmFilterFallback(p, arms));
    }
    if (t === '3D_CANNON') {
      const deflCount = inferSecondaryCount('3D_CANNON', ctrl.activeProfile!.slots, ctrl.activeProfile!.cannonDeflectorCount);
      setCannonGroupFilter((p) => resolveCannonGroupFilterFallback(p, deflCount));
    }
  }, [ctrl.activeProfile?.id, ctrl.activeProfile?.equipmentType, ctrl.activeProfile?.tunnelOrientation, ctrl.activeProfile?.pneumaticArms, ctrl.activeProfile?.cannonDeflectorCount, ctrl.activeProfile?.slots]);

  if (!ctrl.activeProfile) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-600">A carregar perfil de bicos...</p>
      </div>
    );
  }

  const prof = ctrl.activeProfile;
  const meta = getTypologyCountMeta(prof.equipmentType);
  const currPrimary = inferPrimaryCount(prof.equipmentType, prof.slots, prof.equipmentType === '2D_HORIZONTAL' ? prof.boomSectors : prof.pneumaticArms);
  const secFallback = prof.equipmentType === '2D_HORIZONTAL' ? prof.boomNozzlesPerSector : prof.equipmentType === '3D_PNEUMATIC' ? prof.pneumaticNozzlesPerArm : prof.cannonDeflectorCount;
  const currSecondary = inferSecondaryCount(prof.equipmentType, prof.slots, secFallback);

  const kp = ctrl.keypadTarget;
  const targetSlot = kp?.kind === 'measuredFlow' ? prof.slots.find((s) => s.slotIndex === kp.slotIndex) : undefined;
  const kpLabel =
    kp?.kind === 'primaryCount'
      ? meta.label
      : kp?.kind === 'secondaryCount'
        ? (meta.secondary?.label ?? 'Quantidade')
        : kp?.kind === 'measuredFlow'
          ? buildMeasuredFlowKeypadTitle(targetSlot, prof.equipmentType, prof.slots.length)
          : 'Pressão Operacional Base';
  const kpUnit = kp?.kind === 'primaryCount' ? meta.unit : kp?.kind === 'secondaryCount' ? (meta.secondary?.unit ?? 'un.') : kp?.kind === 'measuredFlow' ? 'L/min' : 'bar';
  const kpInitial = kp?.kind === 'primaryCount' ? String(currPrimary) : kp?.kind === 'secondaryCount' ? String(currSecondary) : kp?.kind === 'measuredFlow' ? String(targetSlot?.measuredFlowLMin ?? targetSlot?.flowAtPressureLMin ?? '') : String(prof.referencePressureBar);
  const kpShortcuts = kp?.kind === 'primaryCount' ? (meta.stepValues ?? [2, 3, 4, 5, 6, 8, 10, 12]) : kp?.kind === 'secondaryCount' ? [1, 2, 3, 4, 5, 6, 8, 10] : kp?.kind === 'measuredFlow' ? buildKeypadShortcutsForFlow(targetSlot?.flowAtPressureLMin ?? 0, Boolean(targetSlot?.isActive)) : [2, 3, 5, 8, 10, 15];

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Bento Grid de 3 Cartões: Linha 1 (5 + 7 ou 4 + 8, items-stretch) e Linha 2 (12 col-span) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className={prof.equipmentType === '3D_AXIAL' ? 'xl:col-span-4' : 'xl:col-span-5'}>
          <BentoSavedProfilesCard
            profiles={ctrl.profiles}
            selectedProfileId={ctrl.selectedProfileId}
            onSelectProfile={ctrl.setSelectedProfileId}
            onNewProfile={ctrl.handleCreateNewProfile}
            onOpenGuide={() => ctrl.setIsGuideOpen(true)}
            onDeleteProfile={ctrl.handleDeleteProfile}
          />
        </div>

        <div className={prof.equipmentType === '3D_AXIAL' ? 'xl:col-span-8' : 'xl:col-span-7'}>
          <BentoGeometricSchemeCard
            profile={prof}
            selectedIndex={ctrl.selectedSlotIndex}
            boomSectorFilter={boomSectorFilter}
            tunnelRampFilter={tunnelRampFilter}
            pneumaticArmFilter={pneumaticArmFilter}
            cannonGroupFilter={cannonGroupFilter}
            droneFlankFilter={droneFlankFilter}
            onSelectSlot={ctrl.setSelectedSlotIndex}
            onChangeTunnelRampFilter={setTunnelRampFilter}
            onChangePneumaticArmFilter={setPneumaticArmFilter}
            onChangeCannonGroupFilter={setCannonGroupFilter}
            onChangeDroneFlankFilter={setDroneFlankFilter}
            onToggleSlot={ctrl.handleToggleSlotActive}
            onApplySelectedToAll={ctrl.handleApplySelectedToAll}
            onMirrorLeftRight={ctrl.handleMirrorLeftRight}
            onChangeBoomDirection={(dir) => ctrl.handleUpdateProfile({ ...prof, boomDirection: dir })}
            onOpenPressureKeypad={() => ctrl.setKeypadTarget({ kind: 'pressure' })}
            onOpenPrimaryKeypad={() => ctrl.setKeypadTarget({ kind: 'primaryCount' })}
            onOpenSecondaryKeypad={() => ctrl.setKeypadTarget({ kind: 'secondaryCount' })}
            onStepPrimary={ctrl.handleStepPrimary}
            onStepSecondary={ctrl.handleStepSecondary}
            onToggleAirAssisted={(next) => ctrl.handleUpdateProfile({ ...prof, airAssisted: next })}
            onChangeThreeDSectors={(sec) => ctrl.applyResize(currPrimary, currSecondary, { threeDSectors: sec })}
            onChangeTunnelOrientation={(ori) => ctrl.applyResize(currPrimary, currSecondary, { tunnelOrientation: ori })}
            onChangeUavMode={ctrl.handleChangeUavMode}
            onEditProfileMetadata={() => setIsMetadataModalOpen(true)}
          />
        </div>

        <div className="xl:col-span-12">
          <BentoSlotDetailCard
            profile={prof}
            selectedIndex={ctrl.selectedSlotIndex}
            boomSectorFilter={boomSectorFilter}
            tunnelRampFilter={tunnelRampFilter}
            pneumaticArmFilter={pneumaticArmFilter}
            cannonGroupFilter={cannonGroupFilter}
            droneFlankFilter={droneFlankFilter}
            onChangeBoomSectorFilter={setBoomSectorFilter}
            onChangeTunnelRampFilter={setTunnelRampFilter}
            onChangePneumaticArmFilter={setPneumaticArmFilter}
            onChangeCannonGroupFilter={setCannonGroupFilter}
            onChangeDroneFlankFilter={setDroneFlankFilter}
            onSelectSlot={ctrl.setSelectedSlotIndex}
            onOpenDrawerForSlot={(idx) => {
              ctrl.setSelectedSlotIndex(idx);
              ctrl.setIsDrawerOpen(true);
            }}
            onOpenMeasuredFlowKeypad={(idx) => {
              ctrl.setSelectedSlotIndex(idx);
              ctrl.setKeypadTarget({ kind: 'measuredFlow', slotIndex: idx });
            }}
            onToggleSlotActive={ctrl.handleToggleSlotActive}
          />
        </div>
      </div>

      <NozzleEditorDrawer
        isOpen={ctrl.isDrawerOpen}
        onClose={() => ctrl.setIsDrawerOpen(false)}
        slotLabel={
          prof.equipmentType === '2D_HORIZONTAL'
            ? buildBoom2dSlotHeading(ctrl.activeSlot)
            : formatSlotPositionHeading(ctrl.activeSlot, prof.equipmentType, prof.slots.length)
        }
        currentNozzleId={ctrl.activeSlot?.nozzleId || ''}
        referencePressureBar={prof.referencePressureBar}
        isBoom2D={prof.equipmentType === '2D_HORIZONTAL'}
        isBilateral={['3D_AXIAL', '3D_TANGENTIAL', '3D_CROSSFLOW', '3D_PNEUMATIC', '3D_TUNNEL'].includes(prof.equipmentType)}
        slot={ctrl.activeSlot}
        allSlots={prof.slots}
        onSaveNozzle={ctrl.handleSelectSlotNozzle}
      />

      <NozzleGuideModal isOpen={ctrl.isGuideOpen} onClose={() => ctrl.setIsGuideOpen(false)} />

      <NozzleMetadataModal
        isOpen={isMetadataModalOpen}
        onClose={() => setIsMetadataModalOpen(false)}
        profile={prof}
        equipments={ctrl.equipments}
        onSave={ctrl.handleUpdateProfile}
      />

      <DaterraKeypadModal
        isOpen={kp !== null}
        onClose={() => ctrl.setKeypadTarget(null)}
        label={kpLabel}
        initialValue={kpInitial}
        initialUnit={kpUnit}
        commonValues={kpShortcuts}
        onConfirm={(val) => {
          if (kp?.kind === 'primaryCount' && val >= meta.min) {
            ctrl.applyResize(Math.min(meta.max, Math.round(val)));
          } else if (kp?.kind === 'secondaryCount' && meta.secondary && val >= meta.secondary.min) {
            ctrl.applyResize(currPrimary, Math.min(meta.secondary.max, Math.round(val)));
          } else if (kp?.kind === 'measuredFlow' && val >= 0) {
            ctrl.handleSetMeasuredFlow(kp.slotIndex, val);
          } else if (kp?.kind === 'pressure' && val > 0) {
            ctrl.handleUpdateProfile({ ...prof, referencePressureBar: val });
          }
          ctrl.setKeypadTarget(null);
        }}
      />
    </div>
  );
};
