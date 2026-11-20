// src/features/perfis/components/calibration/CalibrationSection.tsx
import React, { useMemo, useState } from 'react';
import { DaterraKeypadModal } from '../../../../components/keypad/DaterraKeypadModal.tsx';
import { useSubscription } from '../../../../context/SubscriptionContext.tsx';
import { computeCalibrationEppoBalance, evaluateContextualDriftRisk } from '../../../../lib/agri-math/calibration-eppo-bridge.ts';
import { exportCalibrationAuditPdf } from '../../../../lib/pdf/calibrationAuditPdf.ts';
import type { CalibrationAuditRecord, PdfAuditReportMode } from '../../../../types/calibration-audit.ts';
import { useCalibrationController } from '../../hooks/useCalibrationController.ts';
import {
  buildCalibrationKeypadConfig, computeNozzleIso16122Stats, findFreshWeatherForCulture,
  resolveNozzlePressureBounds, scaleNozzleProfileByPressure
} from '../../services/calibrationFormatters.ts';
import { CalibrationNozzleChartCard } from './CalibrationNozzleChartCard.tsx';
import { CalibrationParamsCard } from './CalibrationParamsCard.tsx';
import { CalibrationProModal } from './CalibrationProModal.tsx';
import { CalibrationResultsBento } from './CalibrationResultsBento.tsx';
import { CalibrationSaveModeModal } from './CalibrationSaveModeModal.tsx';
import { CalibrationSavedListCard } from './CalibrationSavedListCard.tsx';
import { CalibrationTechGuideDrawer } from './CalibrationTechGuideDrawer.tsx';

export interface CalibrationSectionProps {
  userId: string;
  notifySaved: (msg: string) => void;
  failValidation: (errors: Record<string, string>, msg: string) => void;
  onOpenGuide?: () => void;
  onOpenNozzlesSubmenu?: () => void;
}

const modeTitle = (mode: PdfAuditReportMode) =>
  mode === 'ISO_16122_INSPECTION' ? 'PDF Inspeção ISO 16122' : 'PDF Calibração Agronómica';

export const CalibrationSection: React.FC<CalibrationSectionProps> = ({ userId, notifySaved, failValidation, onOpenNozzlesSubmenu }) => {
  const ctrl = useCalibrationController(userId, notifySaved, failValidation);
  const { isPro, openUpgradeModal } = useSubscription();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [proModalLabel, setProModalLabel] = useState<string | null>(null);

  const cultureNamesById = useMemo(() => Object.fromEntries(ctrl.cultureOptions.map((c) => [c.id, c.label])), [ctrl.cultureOptions]);
  const equipmentNamesById = useMemo(() => Object.fromEntries(ctrl.equipmentOptions.map((e) => [e.id, e.name])), [ctrl.equipmentOptions]);
  const nozzleNamesById = useMemo(() => Object.fromEntries(ctrl.nozzleProfiles.map((n) => [n.id, n.name])), [ctrl.nozzleProfiles]);

  const runPdfExport = async (mode: PdfAuditReportMode, task: () => Promise<{ fileName: string }>) => {
    setIsGeneratingPdf(true);
    try {
      const { fileName } = await task();
      notifySaved(`${modeTitle(mode)} emitido (${fileName}).`);
    } catch (err) {
      failValidation({}, err instanceof Error ? err.message : 'Erro ao gerar relatório PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSelectPdfExport = async (mode: PdfAuditReportMode) => {
    ctrl.setSelectedPdfMode(mode);
    if (!isPro) { setProModalLabel(modeTitle(mode)); return; }
    if (!ctrl.activeNozzle || !ctrl.debitoTotalLMin || !ctrl.numBicosAtivos || !ctrl.pressaoBar || !ctrl.entrelinhaM || ctrl.balance.volumeCalibradoLHa === null) {
      return failValidation({}, 'Selecione Parcela, Equipamento e Perfil Bico válidos antes de gerar o PDF.');
    }
    const existing = ctrl.editingRecord && !ctrl.hasUnsavedChanges ? ctrl.editingRecord : undefined;
    const now = new Date().toISOString();
    const record: CalibrationAuditRecord = {
      id: existing?.id ?? crypto.randomUUID(), userId: userId || 'anon',
      nomePerfil: [ctrl.activeCulture?.label, ctrl.activeEquipment?.name, ctrl.activeNozzle.name].filter(Boolean).join(' · ').slice(0, 120) || 'Ficha de Calibração',
      createdAt: existing?.createdAt ?? now, updatedAt: now, nozzleProfileId: ctrl.activeNozzle.id,
      equipmentId: ctrl.activeEquipment?.id ?? null, cultureParcelId: ctrl.activeCulture?.id ?? null, cultureMomentId: ctrl.activeCulture?.momentId ?? null,
      velocidadeKmh: ctrl.speedKmh, pressaoBar: ctrl.pressaoBar, pressaoBaseBicoBar: ctrl.pressaoBaseBicoBar,
      debitoTotalLMin: ctrl.debitoTotalLMin, numBicosAtivos: ctrl.numBicosAtivos, entrelinhaM: ctrl.entrelinhaM,
      volumeCalibradoLHa: ctrl.balance.volumeCalibradoLHa, volumeRecomendadoEppoLHa: ctrl.balance.volumeRecomendadoEppoLHa,
      caudalArOtimoM3H: ctrl.balance.caudalArSugeridoM3H, caudalArAplicadoM3H: ctrl.activeEquipment?.isFan3D ? ctrl.airflowM3h : null,
      relacaoEngrenagem: ctrl.relacaoEngrenagem.trim() || undefined, rotacaoMotorRpm: ctrl.rotacaoMotorRpm, rotacaoTdfRpm: ctrl.rotacaoTdfRpm,
      iso16122: { numeroSerieChassi: ctrl.activeEquipment?.serialNumber || undefined, ...computeNozzleIso16122Stats(ctrl.activeNozzleScaled) },
      sha256Seal: existing?.sha256Seal
    };
    await runPdfExport(mode, () => exportCalibrationAuditPdf({
      mode, userId, calibrationRecord: record,
      culture: ctrl.activeCulture ? { ...ctrl.activeCulture, locationLabel: ctrl.parcelWeather?.locationLabel ?? (ctrl.activeCulture.record.parish || ctrl.activeCulture.record.municipality || null) } : null,
      equipment: ctrl.activeEquipment, nozzleProfile: ctrl.activeNozzleScaled, eppoBalance: ctrl.balance,
      driftRisk: ctrl.driftRisk, weatherSnapshot: ctrl.parcelWeather?.snapshot ?? null, temperatureC: ctrl.parcelWeather?.temperatureC ?? null
    }));
  };

  const handleExportSavedPdf = async (rec: CalibrationAuditRecord, mode: PdfAuditReportMode) => {
    ctrl.setSelectedPdfMode(mode);
    if (!isPro) { setProModalLabel(`${modeTitle(mode)} · ${rec.nomePerfil}`); return; }
    const culture = ctrl.cultureOptions.find((c) => c.id === rec.cultureParcelId) ?? null;
    const equipment = ctrl.equipmentOptions.find((e) => e.id === rec.equipmentId) ?? null;
    const nozzleRaw = ctrl.nozzleProfiles.find((n) => n.id === rec.nozzleProfileId) ?? null;
    const nozzle = scaleNozzleProfileByPressure(nozzleRaw, rec.pressaoBar).scaledProfile;
    const tip = culture?.trvM3Ha || culture?.lwaM2Ha || equipment?.is3DOrAirAssisted ? '3D_COPA' : '2D';
    const eppoBalance = computeCalibrationEppoBalance({
      debitoTotalLMin: rec.debitoTotalLMin, velocidadeKmh: rec.velocidadeKmh, entrelinhaM: rec.entrelinhaM, pressaoBar: rec.pressaoBar,
      numBicosAtivos: rec.numBicosAtivos, culturaTipologia: tip, volumeRecomendadoEppoLHa: rec.volumeRecomendadoEppoLHa ?? culture?.volumeEppoLHa ?? null,
      trvM3Ha: culture?.trvM3Ha ?? null, lwaM2Ha: culture?.lwaM2Ha ?? null, caudalArAplicadoM3H: rec.caudalArAplicadoM3H, isDroneUav: equipment?.isDroneUav
    });
    const bounds = resolveNozzlePressureBounds(nozzleRaw);
    const useActiveW = rec.cultureParcelId && rec.cultureParcelId === ctrl.activeCulture?.id ? ctrl.parcelWeather : null;
    const weatherSnapshot = useActiveW?.snapshot ?? (culture ? findFreshWeatherForCulture(culture.record) : null);
    const driftRisk = evaluateContextualDriftRisk({
      culturaTipologia: tip, isDroneUav: equipment?.isDroneUav, pressaoBar: rec.pressaoBar, pressaoMinHomologadaBar: bounds.minBar,
      pressaoMaxHomologadaBar: bounds.maxBar, bicoAntiDeriva: bounds.hasAntiDrift, assistenciaArAtiva: equipment?.is3DOrAirAssisted ?? null, weather: weatherSnapshot
    });
    await runPdfExport(mode, () => exportCalibrationAuditPdf({
      mode, userId, calibrationRecord: rec,
      culture: culture ? { ...culture, locationLabel: useActiveW?.locationLabel ?? (culture.record.parish || culture.record.municipality || null) } : null,
      equipment, nozzleProfile: nozzle, eppoBalance, driftRisk, weatherSnapshot, temperatureC: useActiveW?.temperatureC ?? null
    }));
  };

  const kp = ctrl.keypadField
    ? buildCalibrationKeypadConfig(ctrl.keypadField, {
        speedKmh: ctrl.speedKmh, pressaoBar: ctrl.pressaoBar, pressaoBaseBar: ctrl.pressaoBaseBicoBar,
        engineRpm: ctrl.rotacaoMotorRpm, ptoRpm: ctrl.rotacaoTdfRpm, airflowM3h: ctrl.airflowM3h
      })
    : null;

  return (
    <div className="space-y-5 animate-fade-in">
      <CalibrationParamsCard
        cultureOptions={ctrl.cultureOptions} equipmentOptions={ctrl.equipmentOptions} nozzleProfiles={ctrl.nozzleProfiles}
        selectedCultureId={ctrl.selectedCultureId} selectedEquipmentKey={ctrl.selectedEquipmentKey} selectedNozzleKey={ctrl.selectedNozzleKey}
        isEquipmentLockedToNozzle={ctrl.isEquipmentLockedToNozzle} activeCulture={ctrl.activeCulture} activeEquipment={ctrl.activeEquipment}
        pressaoBar={ctrl.pressaoBar} pressaoBaseBicoBar={ctrl.pressaoBaseBicoBar} isPressureModified={ctrl.isPressureModified}
        nozzleBounds={ctrl.nozzleBounds} numBicosAtivos={ctrl.numBicosAtivos} numBicosTotal={ctrl.numBicosTotal}
        debitoTotalLMin={ctrl.debitoTotalLMin} entrelinhaM={ctrl.entrelinhaM} speedKmh={ctrl.speedKmh}
        relacaoEngrenagem={ctrl.relacaoEngrenagem} rotacaoMotorRpm={ctrl.rotacaoMotorRpm} rotacaoTdfRpm={ctrl.rotacaoTdfRpm}
        airflowM3h={ctrl.airflowM3h} balance={ctrl.balance} onSelectCulture={ctrl.selectCulture} onSelectEquipment={ctrl.selectEquipment}
        onSelectNozzle={ctrl.selectNozzle} onStepSpeed={ctrl.stepSpeed} onStepPressure={ctrl.stepPressure}
        onResetPressure={ctrl.resetPressureToNozzleBase} onApplySafeSpeed={ctrl.applySafeSuggestedSpeed}
        onChangeGearRatio={ctrl.setRelacaoEngrenagem} onApplySuggestedAirflow={ctrl.applySuggestedAirflow}
        onOpenKeypad={ctrl.setKeypadField} onOpenGuide={() => setIsGuideOpen(true)}
      />
      <CalibrationResultsBento
        balance={ctrl.balance} driftRisk={ctrl.driftRisk} activeCulture={ctrl.activeCulture} activeEquipment={ctrl.activeEquipment}
        parcelWeather={ctrl.parcelWeather} isLoadingWeather={ctrl.isLoadingWeather} nozzleBounds={ctrl.nozzleBounds}
        autonomyHa={ctrl.autonomyHa} parcelTanks={ctrl.parcelTanks} pressaoBar={ctrl.pressaoBar} selectedPdfMode={ctrl.selectedPdfMode}
        isPro={isPro} isGeneratingPdf={isGeneratingPdf} isSaving={ctrl.isSaving} editingRecord={ctrl.editingRecord} hasUnsavedChanges={ctrl.hasUnsavedChanges}
        onSaveCalibration={ctrl.handleRequestSave} onStartNewRecord={ctrl.handleStartNewRecord} onSelectPdfPreview={handleSelectPdfExport}
      />
      <CalibrationNozzleChartCard
        userId={userId}
        scaledNozzleProfile={ctrl.scaledNozzleProfile}
        isPressureAdjusted={ctrl.isPressureAdjusted}
        onOpenNozzlesSubmenu={onOpenNozzlesSubmenu}
      />
      <CalibrationSavedListCard
        records={ctrl.calibrations} cultureNamesById={cultureNamesById} equipmentNamesById={equipmentNamesById}
        nozzleNamesById={nozzleNamesById} isPro={isPro} onLoadRecord={ctrl.handleLoad}
        onExportPdf={handleExportSavedPdf} onDeleteRecord={ctrl.handleDelete}
      />
      <CalibrationTechGuideDrawer
        isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} debitoTotalLMin={ctrl.debitoTotalLMin}
        speedKmh={ctrl.speedKmh} entrelinhaM={ctrl.entrelinhaM} activeCulture={ctrl.activeCulture} balance={ctrl.balance}
      />
      <CalibrationProModal
        isOpen={proModalLabel !== null} requestedLabel={proModalLabel ?? undefined} onClose={() => setProModalLabel(null)}
        onViewPlans={() => { setProModalLabel(null); openUpgradeModal('Relatórios PDF Auditáveis (EPPO PP 1/239 & EN ISO 16122)'); }}
      />
      <CalibrationSaveModeModal
        isOpen={ctrl.isSaveModeModalOpen} recordName={ctrl.editingRecord?.nomePerfil ?? ''} isSaving={ctrl.isSaving}
        onClose={() => ctrl.setIsSaveModeModalOpen(false)} onConfirmUpdate={ctrl.confirmSaveAsUpdate} onConfirmCreateNew={ctrl.confirmSaveAsNew}
      />
      {kp && (
        <DaterraKeypadModal
          isOpen onClose={() => ctrl.setKeypadField(null)} label={kp.label} initialValue={kp.initialValue}
          initialUnit={kp.initialUnit} commonValues={kp.commonValues}
          validationRules={{ required: true, min: kp.min, minInclusive: true, allowDecimal: kp.allowDecimal, maxDecimals: kp.maxDecimals }}
          onConfirm={(val) => {
            if (ctrl.keypadField === 'speed' && val > 0) ctrl.setSpeedKmh(val);
            else if (ctrl.keypadField === 'pressure' && val >= 0.5) ctrl.setPressureBar(val);
            else if (ctrl.keypadField === 'engineRpm' && val > 0) ctrl.setRotacaoMotorRpm(Math.round(val));
            else if (ctrl.keypadField === 'ptoRpm' && val > 0) ctrl.setRotacaoTdfRpm(Math.round(val));
            else if (ctrl.keypadField === 'airflow' && val >= 0) ctrl.setAirflowM3h(Math.round(val));
            ctrl.setKeypadField(null);
          }}
        />
      )}
    </div>
  );
};
