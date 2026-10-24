import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ChevronLeft,
  RotateCcw,
  History,
  Bookmark,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  FileDown
} from 'lucide-react';
import { db } from '../db/db';
import { getStoredCoBrandingConfig } from '../features/smart-debito/coBrandingStorage';
import {
  CanopyGeometryCard,
  LabelDoseCard,
  SprayerTankCard,
  EppoStickyResultCard,
  EppoHistoryModal,
  EppoGuideModal,
  generateEppoPdfReport,
  calculateEppoDoseHarmony,
  formatEppoNum,
  type EppoDoseInputs
} from '../features/ajuste-dose';

const INITIAL_INPUTS: EppoDoseInputs = {
  canopyHeightM: 1.8,
  canopyWidthM: 0.8,
  rowSpacingM: 2.5,
  shapeFactor: 1.0,
  cropReference: 'vinha',
  labelDoseType: 'D_GA',
  labelDoseValue: 1.5,
  unitMode: 'liquid',
  tankCapacityL: 1000,
  sprayVolumeLHa: 500
};

export const EppoDoseView: React.FC = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<EppoDoseInputs>(INITIAL_INPUTS);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const results = useMemo(() => calculateEppoDoseHarmony(inputs), [inputs]);
  const historyRecords = useLiveQuery(
    () => db.eppo_history.orderBy('date').reverse().toArray(),
    [],
    []
  );

  const unitLarge = inputs.unitMode === 'liquid' ? 'L' : 'kg';
  const unitSmall = inputs.unitMode === 'liquid' ? 'mL' : 'g';

  const handleReset = () => {
    setInputs(INITIAL_INPUTS);
    setActiveStep(1);
    setToastMessage('Parâmetros EPPO reiniciados.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = async () => {
    await db.eppo_history.add({
      date: new Date().toISOString(),
      inputs,
      results
    });
    setToastMessage(
      `Guardado no Histórico: ${formatEppoNum(results.productInTankMethod1Large, 2)} ${unitLarge}/depósito`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteRecord = async (id: number) => {
    await db.eppo_history.delete(id);
  };

  const handleExportPdf = async () => {
    await generateEppoPdfReport(
      { inputs, results, dateIso: new Date().toISOString() },
      getStoredCoBrandingConfig()
    );
    setToastMessage('Relatório PDF EPPO exportado com sucesso.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-5xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8ffa94] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CABEÇALHO PADRONIZADO */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ferramentas')}
            aria-label="Voltar às ferramentas"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span>Voltar</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
                Ajuste da DOSE
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ferramenta Ativa
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Método EPPO PP 1/239 (3) • Culturas 3D
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#3CA64C]" />
            <span>Guia</span>
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-sky-700" />
            <span className="hidden sm:inline">Histórico ({historyRecords.length})</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* 2. CARTÃO VERDE DE RESUMO FIXO NO TOPO (STICKY) */}
      <EppoStickyResultCard
        results={results}
        tankCapacityL={inputs.tankCapacityL}
        sprayVolumeLHa={inputs.sprayVolumeLHa}
        cropReference={inputs.cropReference}
        unitLarge={unitLarge}
        unitSmall={unitSmall}
      />

      {/* 3. FLUXO CENTRAL EM ACORDEÃO (1 PASSO ABERTO DE CADA VEZ) */}
      <div className="space-y-3">
        <CanopyGeometryCard
          isOpen={activeStep === 1}
          onToggle={() => setActiveStep(1)}
          onNextStep={() => setActiveStep(2)}
          canopyHeightM={inputs.canopyHeightM}
          canopyWidthM={inputs.canopyWidthM}
          rowSpacingM={inputs.rowSpacingM}
          shapeFactor={inputs.shapeFactor}
          cropReference={inputs.cropReference}
          lwaM2Ha={results.lwaM2Ha}
          trvM3Ha={results.trvM3Ha}
          onChangeHeight={(v) => setInputs((p) => ({ ...p, canopyHeightM: v }))}
          onChangeWidth={(v) => setInputs((p) => ({ ...p, canopyWidthM: v }))}
          onChangeRowSpacing={(v) => setInputs((p) => ({ ...p, rowSpacingM: v }))}
          onChangeShapeFactor={(v) => setInputs((p) => ({ ...p, shapeFactor: v }))}
          onChangeCropReference={(v) => setInputs((p) => ({ ...p, cropReference: v }))}
        />

        <LabelDoseCard
          isOpen={activeStep === 2}
          onToggle={() => setActiveStep(2)}
          onNextStep={() => setActiveStep(3)}
          labelDoseType={inputs.labelDoseType}
          labelDoseValue={inputs.labelDoseValue}
          unitMode={inputs.unitMode}
          onChangeDoseType={(v) => setInputs((p) => ({ ...p, labelDoseType: v }))}
          onChangeDoseValue={(v) => setInputs((p) => ({ ...p, labelDoseValue: v }))}
          onChangeUnitMode={(v) => setInputs((p) => ({ ...p, unitMode: v }))}
        />

        <SprayerTankCard
          isOpen={activeStep === 3}
          onToggle={() => setActiveStep(3)}
          tankCapacityL={inputs.tankCapacityL}
          sprayVolumeLHa={inputs.sprayVolumeLHa}
          cropReference={inputs.cropReference}
          onChangeTankCapacity={(v) => setInputs((p) => ({ ...p, tankCapacityL: v }))}
          onChangeSprayVolume={(v) => setInputs((p) => ({ ...p, sprayVolumeLHa: v }))}
        />
      </div>

      {/* 4. AVISO TÉCNICO NO RODAPÉ */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs text-slate-600 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-daterra-primary" />
          Aviso Técnico DATERRA Smart • EPPO PP 1/239 (3)
        </span>
        <p>
          A harmonização EPPO ajusta a dose do produto fitofarmacêutico à parede foliar (LWA) e
          volume de copa (TRV) reais. Respeite sempre os limites inscritos no rótulo oficial DGAV.
        </p>
      </div>

      {/* MODAIS DE GUIA E HISTÓRICO */}
      <EppoGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />

      <EppoHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        records={historyRecords}
        onLoadRecord={(savedInputs) => setInputs(savedInputs)}
        onDeleteRecord={handleDeleteRecord}
      />

      {/* BARRA FIXA INFERIOR */}
      <aside className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 z-35 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="h-12 bg-[#3CA64C] hover:bg-[#349142] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="w-4 h-4 shrink-0" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="h-12 bg-[#114037] hover:bg-[#19584b] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#8ffa94] shrink-0" />
            <span>Exportar PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Histórico ({historyRecords.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Guia</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default EppoDoseView;
