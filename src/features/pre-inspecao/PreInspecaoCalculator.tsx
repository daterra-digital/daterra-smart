import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { isDroneEquipment } from './data/equipmentConfigs';
import { usePreInspecaoState } from './hooks/usePreInspecaoState';
import { persistInspecaoRecord } from './inspecaoStorage';
import { generatePreInspecaoPdf, downloadPdfBlob } from './pdf/inspecaoPdfGenerator';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { InspecaoHeader } from './InspecaoHeader';
import { InspecaoResultCard } from './InspecaoResultCard';
import { InspecaoChecklistPanel } from './InspecaoChecklistPanel';
import { InspecaoFooterBar } from './InspecaoFooterBar';
import { InspecaoGuideModal } from './InspecaoGuideModal';
import { EquipmentSelectorGrid } from './EquipmentSelectorGrid';
import { EvaluationStyleSelector } from './components/EvaluationStyleSelector';
import { DroneWarningBanner } from './components/DroneWarningBanner';
import { PreInspectionProgressHeader } from './PreInspectionProgressHeader';

export const PreInspecaoCalculator: React.FC = () => {
  const navigate = useNavigate();
  const state = usePreInspecaoState();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const historyRecords = useLiveQuery(async () => {
    try {
      if (!db || !db['calculation_history_v2']) return [];
      return await db['calculation_history_v2']
        .filter((r) => r.calculatorId === 'calc_pre_inspecao' && !r.isDeleted)
        .reverse()
        .sortBy('createdAt');
    } catch {
      return [];
    }
  }, []) ?? [];

  const handleSaveToHistory = async () => {
    try {
      if (!state.calcResult.isValid) {
        setToastMessage('Avalie pelo menos um ponto antes de guardar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      await persistInspecaoRecord(state.answers, state.calcResult, state.activeOption.title);
      setToastMessage('Boletim gravado e enfileirado na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setToastMessage('Erro ao gravar a pré-inspeção.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdfBytes = await generatePreInspecaoPdf({
        equipmentId: state.selectedEquipment,
        equipmentTitle: state.activeOption.title,
        evaluationStyle: state.evaluationStyle,
        categories: state.categories,
        answers: state.answers,
        calcResult: state.calcResult
      });
      const fileName = `Boletim_Pre_Inspecao_${state.selectedEquipment}_${Date.now()}.pdf`;
      downloadPdfBlob(pdfBytes, fileName);
      setToastMessage('Boletim em PDF exportado com sucesso!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setToastMessage('Erro ao gerar o PDF da pré-inspeção.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8ffa94] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <InspecaoHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={state.handleReset}
        historyCount={historyRecords.length}
        equipmentTitle={state.activeOption.title}
      />

      <EvaluationStyleSelector
        selectedStyle={state.evaluationStyle}
        onChangeStyle={state.setEvaluationStyle}
      />

      <EquipmentSelectorGrid
        selectedEquipment={state.selectedEquipment}
        onSelectEquipment={state.handleSelectEquipment}
        isExpanded={state.isEquipGridOpen}
        onToggleExpand={() => state.setIsEquipGridOpen((p) => !p)}
      />

      {isDroneEquipment(state.selectedEquipment) && <DroneWarningBanner />}

      <InspecaoResultCard
        calculationResult={state.calcResult}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <PreInspectionProgressHeader
        mode={state.mode}
        onChangeMode={state.setMode}
        equipmentTitle={state.activeOption.title}
        totalSubQuestions={state.calcResult.totalItems}
        answeredSubQuestions={state.calcResult.conformeCount + state.calcResult.anomaliaCount}
        conformeCount={state.calcResult.conformeCount}
        anomaliaCount={state.calcResult.anomaliaCount}
      />

      <InspecaoChecklistPanel
        categories={state.categories}
        mode={state.mode}
        answers={state.answers}
        openCategoryId={state.openCategoryId}
        onToggleCategory={(id) => state.setOpenCategoryId((p) => (p === id ? null : id))}
        onMarkCategoryAllConforme={state.handleCategoryAllConforme}
        onOpenCategoryForAnomalies={state.handleCategoryForAnomalies}
        onAnswerSubQuestion={state.handleAnswerSub}
      />

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_pre_inspecao"
        calculatorTitle={`Pré-Inspeção (${state.activeOption.title})`}
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => { await clearCalculatorHistoryInDb('calc_pre_inspecao', 'local-user'); }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      <InspecaoGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <InspecaoFooterBar
        onSave={handleSaveToHistory}
        onExportPdf={handleExportPdf}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        historyCount={historyRecords.length}
        isGeneratingPdf={isGeneratingPdf}
      />
    </div>
  );
};

export default PreInspecaoCalculator;
