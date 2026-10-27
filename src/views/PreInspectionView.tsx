import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import {
  EQUIPMENT_OPTIONS,
  getCategoriesByEquipment,
  loadPreInspectionHistory,
  savePreInspectionRecord,
  deletePreInspectionRecord,
  EquipmentSelectorGrid,
  PreInspectionProgressHeader,
  CategoryAccordionCard,
  PreInspectionHistoryModal,
  PreInspectionGuideModal,
  type EquipmentTypeId,
  type EvaluationMode,
  type SubQuestionAnswer,
  type PreInspectionSavedRecord
} from '../features/pre-inspecao';
import { PreInspectionFooterBar } from '../features/pre-inspecao/components/PreInspectionFooterBar';
import { useTranslation } from '../context/LanguageContext';

export const PreInspectionView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentTypeId>('barras_horizontais');
  const [isEquipmentGridOpen, setIsEquipmentGridOpen] = useState<boolean>(true);
  const [mode, setMode] = useState<EvaluationMode>('expresso');
  const [answers, setAnswers] = useState<Record<string, SubQuestionAnswer>>({});
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<PreInspectionSavedRecord[]>(() => loadPreInspectionHistory());
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = useMemo(() => getCategoriesByEquipment(selectedEquipment), [selectedEquipment]);
  const activeEquipment = useMemo(
    () => EQUIPMENT_OPTIONS.find((opt) => opt.id === selectedEquipment) || EQUIPMENT_OPTIONS[0],
    [selectedEquipment]
  );

  const stats = useMemo(() => {
    const allSubIds = categories.flatMap((cat) => cat.subperguntas.map((s) => s.id));
    const conformeCount = allSubIds.filter((id) => answers[id] === 'conforme').length;
    const anomaliaCount = allSubIds.filter((id) => answers[id] === 'anomalia').length;
    const totalSubQuestions = allSubIds.length;
    const conformityPct = totalSubQuestions > 0 ? Math.round((conformeCount / totalSubQuestions) * 100) : 0;
    return { totalSubQuestions, answeredSubQuestions: conformeCount + anomaliaCount, conformeCount, anomaliaCount, conformityPct };
  }, [categories, answers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkCategoryAllConforme = (categoryId: string) => {
    const currentIndex = categories.findIndex((cat) => cat.id === categoryId);
    const targetCategory = categories[currentIndex];
    if (!targetCategory) return;

    const updatedAnswers: Record<string, SubQuestionAnswer> = { ...answers };
    targetCategory.subperguntas.forEach((sub) => { updatedAnswers[sub.id] = 'conforme'; });
    setAnswers(updatedAnswers);
    setOpenCategoryId(null);

    const nextPending =
      categories.slice(currentIndex + 1).find((cat) => cat.subperguntas.some((s) => !updatedAnswers[s.id])) ||
      categories[currentIndex + 1];
    if (nextPending) {
      setTimeout(() => {
        document.getElementById(`pre-insp-cat-${nextPending.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  };

  const handleSave = () => {
    const updated = savePreInspectionRecord({
      equipmentId: selectedEquipment,
      equipmentTitle: activeEquipment.title,
      conformityPct: stats.conformityPct,
      conformeCount: stats.conformeCount,
      anomaliaCount: stats.anomaliaCount,
      totalSubQuestions: stats.totalSubQuestions,
      answers
    });
    setHistoryRecords(updated);
    showToast(`Pré-Inspeção guardada (${stats.conformityPct}% conforme, ${stats.anomaliaCount} anomalias).`);
  };

  const handleLoadRecord = (rec: PreInspectionSavedRecord) => {
    setSelectedEquipment(rec.equipmentId);
    setAnswers(rec.answers || {});
    setOpenCategoryId(null);
    showToast(`Inspeção de ${rec.equipmentTitle} carregada.`);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 space-y-4 animate-fade-in font-sans">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8ffa94] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. CABEÇALHO PADRONIZADO DATERRA */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/ferramentas')} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1 text-xs font-bold cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span>{t('common.back', 'Voltar')}</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">{t('preInspecao.shortTitle', 'Pré-Inspeção')}</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">{t('common.activeTool', 'Ferramenta Ativa')}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{t('preInspecao.isoSubheader', 'Boletim de Pré-Inspeção • Norma ISO 16122')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button type="button" onClick={() => setIsGuideModalOpen(true)} className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5 text-[#3CA64C]" />
            <span>{t('common.guide', 'Guia')}</span>
          </button>
          <button type="button" onClick={() => { setAnswers({}); setOpenCategoryId(null); showToast(t('preInspecao.restartedToast', 'Checklist reiniciada.')); }} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
            <RotateCcw className="w-3 h-3" />
            <span>{t('preInspecao.restart', 'Reiniciar')}</span>
          </button>
        </div>
      </div>

      <EquipmentSelectorGrid
        selectedEquipment={selectedEquipment}
        onSelectEquipment={(id) => { setSelectedEquipment(id); setOpenCategoryId(null); }}
        isExpanded={isEquipmentGridOpen}
        onToggleExpand={() => setIsEquipmentGridOpen((p) => !p)}
      />

      <PreInspectionProgressHeader
        mode={mode}
        onChangeMode={setMode}
        equipmentTitle={activeEquipment.title}
        totalSubQuestions={stats.totalSubQuestions}
        answeredSubQuestions={stats.answeredSubQuestions}
        conformeCount={stats.conformeCount}
        anomaliaCount={stats.anomaliaCount}
      />

      <div className="space-y-3">
        {categories.map((category) => (
          <CategoryAccordionCard
            key={category.id}
            category={category}
            mode={mode}
            isExpanded={openCategoryId === category.id}
            onToggleExpand={() => setOpenCategoryId((p) => (p === category.id ? null : category.id))}
            answers={answers}
            onMarkCategoryAllConforme={handleMarkCategoryAllConforme}
            onOpenCategoryForAnomalies={(id) => setOpenCategoryId(id)}
            onAnswerSubQuestion={(subId, status) => setAnswers((p) => ({ ...p, [subId]: status }))}
          />
        ))}
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs text-slate-600 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-daterra-primary" />
          {t('preInspecao.legalNoticeTitle', 'Aviso Técnico • Inspeção Obrigatória Periódica (ISO 16122)')}
        </span>
        <p>{t('preInspecao.legalNoticeText', 'Esta ferramenta apoia a preparação do pulverizador e do depósito antes da inspeção oficial periódica.')}</p>
      </div>

      <PreInspectionGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
      <PreInspectionHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} records={historyRecords} onLoadRecord={handleLoadRecord} onDeleteRecord={(id) => setHistoryRecords(deletePreInspectionRecord(id))} />

      {/* BARRA INFERIOR PADRÃO DATERRA (Guardar, Histórico, Guia) */}
      <PreInspectionFooterBar
        onSave={handleSave}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};

export default PreInspectionView;
