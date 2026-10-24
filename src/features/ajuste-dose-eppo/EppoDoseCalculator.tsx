import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ProfileCulture, type ProfileEquipment } from '../../db/db';
import { calculateEppoDoseComprehensive, getEppoKeypadConfig, type EppoDoseInputsState } from './eppoDoseDataMapper';
import { persistEppoDoseRecord } from './eppoDoseStorage';
import { syncCultureTelemetryToProfile } from './eppoProfileSyncService';
import { softDeleteCalculationInDb, clearCalculatorHistoryInDb, updateCalculationMetadataInDb } from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { DaterraKeypadModal } from '../../components/DaterraKeypad';
import { EppoDoseGuideModal } from './EppoDoseGuideModal';
import { EppoProfileImportModal } from './EppoProfileImportModal';
import { EppoHistoryImportModal } from './EppoHistoryImportModal';
import { EppoDoseHeader } from './EppoDoseHeader';
import { EppoDoseResultCard } from './EppoDoseResultCard';
import { EppoDoseInputsPanel } from './EppoDoseInputsPanel';
import { EppoDoseFooterBar } from './EppoDoseFooterBar';

const INITIAL_INPUTS: EppoDoseInputsState = {
  doseRotulo: 1.5, alturaM: 1.5, entrelinhaM: 2.5, treatmentMode: 'total',
  cropStructure: 'sebe', larguraCopaM: 0.8, lwaRef: 10000,
  capacidadeDeposito: 1000, volumeCaldaLHa: 400, unitMode: 'liquid', foliarInputSource: 'manual'
};

export const EppoDoseCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<EppoDoseInputsState>(INITIAL_INPUTS);
  const [activeKeypad, setActiveKeypad] = useState<keyof EppoDoseInputsState | null>(null);
  const [profileModalType, setProfileModalType] = useState<'culture' | 'equipment' | null>(null);
  const [isHistImportOpen, setIsHistImportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cultures = useLiveQuery(() => db.profiles_cultures?.toArray() ?? [], []) ?? [];
  const equipments = useLiveQuery(() => db.profiles_equipment?.toArray() ?? [], []) ?? [];

  const calcResult = useMemo(() => calculateEppoDoseComprehensive(
    inputs.doseRotulo, inputs.alturaM, inputs.entrelinhaM, inputs.treatmentMode,
    inputs.cropStructure, inputs.larguraCopaM, inputs.lwaRef, inputs.capacidadeDeposito,
    inputs.volumeCaldaLHa, inputs.overrideLwa, inputs.overrideTrv
  ), [inputs]);

  const historyRecords = useLiveQuery(async () => {
    try {
      if (!db?.['calculation_history_v2']) return [];
      return await db['calculation_history_v2']
        .filter((r) => (r.calculatorId === 'ajuste_dose_eppo' || r.calculatorId === 'calc_ajuste_dose_eppo') && !r.isDeleted)
        .reverse().sortBy('createdAt');
    } catch { return []; }
  }, []) ?? [];

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const handleUpdateInput = useCallback(<K extends keyof EppoDoseInputsState>(k: K, v: EppoDoseInputsState[K]) => {
    setInputs((prev) => ({ ...prev, [k]: v, ...(k === 'foliarInputSource' && v === 'manual' ? { overrideLwa: undefined, overrideTrv: undefined } : {}) }));
  }, []);

  const handleSelectCulture = (c: ProfileCulture) => {
    setInputs((p) => ({
      ...p, selectedCultureId: c.id, selectedCultureName: c.name, entrelinhaM: c.row_distance_m ?? p.entrelinhaM,
      alturaM: c.canopy_height_m ?? p.alturaM, larguraCopaM: c.canopy_width_m ?? p.larguraCopaM,
      cropStructure: c.training_system === 'globular' ? 'globular' : 'sebe', overrideLwa: undefined, overrideTrv: undefined
    }));
    showToast(`Cultura "${c.name}" importada!`);
  };

  const handleSelectEquipment = (e: ProfileEquipment) => {
    setInputs((p) => ({ ...p, selectedEquipmentId: e.id, selectedEquipmentName: e.name, capacidadeDeposito: e.tank_capacity_l ?? p.capacidadeDeposito }));
    showToast(`Equipamento "${e.name}" importado (${e.tank_capacity_l} L)!`);
  };

  const handleSelectHistoricalRecord = (rec: any) => {
    const isLwa = rec.calculatorId === 'calc_area_parede_foliar';
    const val = Number(isLwa ? rec.outputs?.areaParedeFoliar?.rawValue : rec.outputs?.volumeCopa?.rawValue);
    setInputs((p) => ({
      ...p,
      cropStructure: isLwa ? 'sebe' : 'globular',
      overrideLwa: isLwa ? val : undefined,
      overrideTrv: !isLwa ? val : undefined,
      historySourceLabel: `${val.toLocaleString('pt-PT')} ${isLwa ? 'm² LWA/ha' : 'm³ TRV/ha'}`
    }));
    showToast(`Registo de ${isLwa ? 'LWA' : 'TRV'} importado!`);
  };

  const handleSaveToCultureProfile = async () => {
    if (!calcResult.isValid) return showToast('Insira dimensões vegetativas válidas.');
    try {
      const res = await syncCultureTelemetryToProfile({
        cultureId: inputs.selectedCultureId,
        cultureName: inputs.selectedCultureName,
        lwaReal: calcResult.lwaReal,
        trvReal: calcResult.trvReal,
        alturaM: inputs.alturaM,
        larguraCopaM: inputs.larguraCopaM,
        entrelinhaM: inputs.entrelinhaM,
        cropStructure: inputs.cropStructure
      });
      if (res.cultureId && res.cultureId !== inputs.selectedCultureId) {
        setInputs((p) => ({ ...p, selectedCultureId: res.cultureId, selectedCultureName: res.cultureName }));
      }
      showToast(`Perfil "${res.cultureName}" atualizado com LWA: ${calcResult.lwaReal.toLocaleString('pt-PT')} m²/ha!`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao sincronizar dados com o perfil da cultura.');
    }
  };

  const handleSaveToHistory = async () => {
    if (!calcResult.isValid) return showToast('Insira parâmetros válidos antes de guardar.');
    await persistEppoDoseRecord(inputs, calcResult);
    showToast('Ajuste de dose gravado e enfileirado na Outbox offline!');
  };

  const keypadCfg = useMemo(() => getEppoKeypadConfig(activeKeypad, inputs), [activeKeypad, inputs]);

  const canopyMethod: 'lwa' | 'trv' = (
    (inputs.foliarInputSource === 'history' && inputs.overrideTrv !== undefined && inputs.overrideLwa === undefined) ||
    inputs.cropStructure === 'globular'
  ) ? 'trv' : 'lwa';

  const activeCultureForCard = inputs.foliarInputSource === 'profiles' ? inputs.selectedCultureName : undefined;

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8ffa94] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <EppoDoseHeader onBack={() => navigate('/ferramentas')} onOpenHistory={() => setIsHistoryOpen(true)} onOpenGuide={() => setIsGuideOpen(true)} onReset={() => setInputs(INITIAL_INPUTS)} historyCount={historyRecords.length} />

      <EppoDoseResultCard
        calculationResult={calcResult}
        doseRotulo={inputs.doseRotulo}
        treatmentMode={inputs.treatmentMode}
        unitMode={inputs.unitMode}
        capacidadeDeposito={inputs.capacidadeDeposito}
        canopyMethod={canopyMethod}
        onUpdateCultureProfile={handleSaveToCultureProfile}
        selectedCultureName={activeCultureForCard}
      />

      <EppoDoseInputsPanel inputs={inputs} onUpdateInput={handleUpdateInput} onOpenKeypad={(f) => setActiveKeypad(f)} onOpenProfileModal={(t) => setProfileModalType(t)} onOpenHistoryModal={() => setIsHistImportOpen(true)} onOpenGuide={() => setIsGuideOpen(true)} onSaveToCultureProfile={handleSaveToCultureProfile} />

      {activeKeypad && (
        <DaterraKeypadModal isOpen={true} onClose={() => setActiveKeypad(null)} label={keypadCfg.label} initialValue={String(keypadCfg.initial)} initialUnit={inputs.unitMode === 'liquid' ? 'L' : 'kg'} availableUnits={['L', 'kg', 'm']} commonValues={keypadCfg.common} validationRules={{ min: keypadCfg.min, max: keypadCfg.max, allowDecimal: true, allowNegative: false }} onConfirm={(val) => { if (activeKeypad) handleUpdateInput(activeKeypad, val as any); setActiveKeypad(null); }} />
      )}

      <EppoProfileImportModal isOpen={Boolean(profileModalType)} type={profileModalType ?? 'culture'} cultures={cultures} equipments={equipments} onSelectCulture={handleSelectCulture} onSelectEquipment={handleSelectEquipment} onClose={() => setProfileModalType(null)} />

      <EppoHistoryImportModal isOpen={isHistImportOpen} onSelectRecord={handleSelectHistoricalRecord} onClose={() => setIsHistImportOpen(false)} />

      <CalculatorHistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} calculatorId="ajuste_dose_eppo" calculatorTitle="Ajuste da Dose (Método EPPO)" records={historyRecords} onDeleteRecord={async (r) => softDeleteCalculationInDb(r.id)} onClearHistory={async () => { await clearCalculatorHistoryInDb('ajuste_dose_eppo', 'local-user'); }} onUpdateMetadata={async (id, m) => updateCalculationMetadataInDb(id, m)} />

      <EppoDoseGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <EppoDoseFooterBar onSave={handleSaveToHistory} onOpenHistory={() => setIsHistoryOpen(true)} onOpenGuide={() => setIsGuideOpen(true)} historyCount={historyRecords.length} />
    </div>
  );
};

export default EppoDoseCalculator;
