import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { WeatherLocationSearchDropdown } from '../weather/components/WeatherLocationSearchDropdown.tsx';
import { NOZZLES_DATABASE } from '../nozzle-comparison/nozzleComparison.data.ts';
import { DaterraKeypad } from '../../components/DaterraKeypad';
import { IRD_VERSIONS } from './irdConfig.ts';
import { buildIrdGuideContext } from './irdGuideContextBuilder.ts';
import type { IrdGuideTopicId } from './irdGuideSections.ts';
import { IRD_KEYPAD_META } from './irdKeypadMeta.ts';
import type { IrdEvaluationLevel } from './irdOriginTypes.ts';
import { buildIrdPrimaryMessage, buildIrdSaveAvailability, isIrdPartialAssessment } from './irdPresentationHelper.ts';
import { buildPreSaveSummary } from './irdPreSaveBuilder.ts';
import type { IrdQuickAccordionState } from './IrdQuickAccordions.tsx';
import { useIrdCalculatorController } from './useIrdCalculatorController.ts';
import { IrdActionFooter } from './IrdActionFooter.tsx';
import { IrdGuideModal } from './IrdGuideModal';
import { IrdHistoryModal } from './IrdHistoryModal';
import { IrdLevelProgressionCard } from './IrdLevelProgressionCard';
import { IrdPersistentResultSummary } from './IrdPersistentResultSummary';
import { IrdProfilesOnlyPanel } from './IrdProfilesOnlyPanel';
import { IrdQuickEvalPanel } from './IrdQuickEvalPanel';
import { IrdResultCard } from './IrdResultCard';
import { IrdWeatherPanel } from './IrdWeatherPanel';

const LEVEL_TABS: ReadonlyArray<{ id: IrdEvaluationLevel; label: string }> = [
  { id: 'level1_meteo', label: '1. Só Meteorologia' },
  { id: 'level2_quick', label: '2. Rápida (Manual)' },
  { id: 'level3_profiles', label: '3. Detalhada (Perfis)' }
];

export const IrdCalculatorView: React.FC = () => {
  const navigate = useNavigate();
  const c = useIrdCalculatorController();
  const { weatherCtx } = c;
  const [guideTopic, setGuideTopic] = useState<IrdGuideTopicId | null>(null);
  const [quickAccordions, setQuickAccordions] = useState<IrdQuickAccordionState>({ nozzle: false, expo: false, context: false });
  const [profileCultOpen, setProfileCultOpen] = useState(false);
  const [weatherCompOpen, setWeatherCompOpen] = useState(false);
  const [isResultOffscreen, setIsResultOffscreen] = useState(false);
  const resultObserverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsResultOffscreen(false);
    const el = resultObserverRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => setIsResultOffscreen(!entry.isIntersecting), { rootMargin: '-88px 0px 0px 0px', threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [c.evaluationLevel]);

  const openGuideTopic = (topic: IrdGuideTopicId | null) => {
    setGuideTopic(topic);
    c.setIsGuideOpen(true);
  };

  const preSaveSummary = useMemo(
    () => buildPreSaveSummary({ evaluationLevel: c.evaluationLevel, ctx: c.ctx, result: c.result, weatherEval: c.weatherEval, weatherSourceLabel: c.weatherSummary.sourceLabel, nozzle: c.nozzle, culture: c.culture, missingOpFields: c.missingOpFields }),
    [c.evaluationLevel, c.ctx, c.result, c.weatherEval, c.weatherSummary.sourceLabel, c.nozzle, c.culture, c.missingOpFields]
  );

  const guideContext = useMemo(
    () => buildIrdGuideContext({ evaluationLevel: c.evaluationLevel, ctx: c.ctx, result: c.result, weatherEval: c.weatherEval, preSaveSummary, heightModeLabelPt: c.heightModeLabelPt, airAssistNotePt: c.airAssistNotePt, nozzleState: c.nozzle, hasCatalogNozzle: Boolean(c.ctx.catalogNozzle) }),
    [c.evaluationLevel, c.ctx, c.result, c.weatherEval, preSaveSummary, c.heightModeLabelPt, c.airAssistNotePt, c.nozzle]
  );

  const primaryMsg = useMemo(
    () => buildIrdPrimaryMessage({ evaluationLevel: c.evaluationLevel, assessmentLevelSnapshot: c.ctx.assessmentLevelSnapshot, result: c.result, weatherEval: c.weatherEval, weatherSummary: c.weatherSummary, blockingGapsPt: c.ctx.blockingGapsPt, missingOpFields: c.missingOpFields }),
    [c.evaluationLevel, c.ctx.assessmentLevelSnapshot, c.result, c.weatherEval, c.weatherSummary, c.ctx.blockingGapsPt, c.missingOpFields]
  );

  const saveAvailability = useMemo(
    () => buildIrdSaveAvailability(c.effectiveUserId, c.evaluationLevel, c.result, c.ctx.blockingGapsPt),
    [c.effectiveUserId, c.evaluationLevel, c.result, c.ctx.blockingGapsPt]
  );

  const isPartial = c.evaluationLevel !== 'level1_meteo' && isIrdPartialAssessment(c.result, c.ctx.assessmentLevelSnapshot);
  const isBlockingModalOpen = Boolean(c.activeKeypad || c.isHistoryOpen || c.isGuideOpen);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-40 md:pb-32 animate-fade-in">
      <header className="bg-white rounded-3xl px-4 sm:px-5 py-4 border border-slate-200 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button type="button" onClick={() => navigate('/ferramentas')} className="touch-target px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0">
            <ChevronLeft className="w-4 h-4 text-[#114037]" aria-hidden="true" /><span>Voltar</span>
          </button>
          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#114037]">Índice de Risco de Deriva (IRD)</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-400">RC · {IRD_VERSIONS.formulaVersion}</span>
            </div>
            <p className="text-xs text-slate-600">Leitura meteorológica imediata com aprofundamento operacional em 3 níveis</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WeatherLocationSearchDropdown currentLocation={weatherCtx.currentLocation} onSelectLocation={weatherCtx.selectLocation} onUseGps={weatherCtx.useGpsLocation} />
        </div>
      </header>

      <nav aria-label="Nível de avaliação IRD" className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-soft">
        <div role="tablist" className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {LEVEL_TABS.map((tab) => {
            const active = c.evaluationLevel === tab.id;
            return (
              <button key={tab.id} type="button" role="tab" aria-selected={active} onClick={() => c.setEvaluationLevel(tab.id)} className={`touch-target px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${active ? 'bg-[#114037] text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {c.statusToast && <div role="alert" className={`rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold border ${c.statusToast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>{c.statusToast.text}</div>}

      <IrdPersistentResultSummary
        evaluationLevel={c.evaluationLevel} assessmentLevelSnapshot={c.ctx.assessmentLevelSnapshot}
        result={c.result} weatherEval={c.weatherEval} blockingGapsCount={c.ctx.blockingGapsPt.length}
        primaryMsg={primaryMsg} isPartial={isPartial}
        visibleOnScroll={isResultOffscreen && !isBlockingModalOpen}
        keypadEditingLabel={c.activeKeypad ? IRD_KEYPAD_META[c.activeKeypad.field].label : null}
      />

      <div ref={resultObserverRef}>
        <IrdResultCard
          evaluationLevel={c.evaluationLevel} assessmentLevelSnapshot={c.ctx.assessmentLevelSnapshot}
          result={c.result} isLoading={weatherCtx.isLoading && !weatherCtx.data && c.manualSource !== 'manual_field'}
          weatherEval={c.weatherEval} weatherSummary={c.weatherSummary}
          missingOperationalFields={c.missingOpFields} blockingGapsPt={c.ctx.blockingGapsPt}
          onSwitchToQuickManual={c.switchToQuickFromProfiles}
          onEditManualWeather={() => c.setIsWeatherDrawerOpen((v) => !v)}
          onOpenGuideTopic={openGuideTopic}
        />
      </div>

      <div className="space-y-4">
        {c.isWeatherDrawerOpen && (
          <IrdWeatherPanel
            weather={c.activeWeather} isOffline={c.isOffline} isWeatherLoading={weatherCtx.isLoading} weatherError={weatherCtx.error} locationName={weatherCtx.currentLocation.name}
            isComplementaryOpen={weatherCompOpen} onToggleComplementary={() => setWeatherCompOpen((v) => !v)} onOpenGuideTopic={openGuideTopic}
            onChangeSource={(src) => { c.setManualSource(src); if (src === 'manual_field') c.setManualWeather({ ...c.activeWeather, weatherSource: 'manual_field', weatherAgeMinutes: 0 }); }}
            onRefreshWeather={() => { c.setManualSource(null); weatherCtx.refreshWeather(); }} onOpenKeypad={c.openFieldKeypad}
          />
        )}
        {c.evaluationLevel === 'level1_meteo' && <IrdLevelProgressionCard currentLevel={c.evaluationLevel} isLoggedIn={Boolean(c.effectiveUserId)} hasWeatherValid={c.weatherEval?.status === 'VALID'} onSelectLevel={c.setEvaluationLevel} />}
        {c.evaluationLevel === 'level2_quick' && (
          <IrdQuickEvalPanel
            catalogNozzles={NOZZLES_DATABASE} culture={c.culture} equipment={c.equipment} nozzle={c.nozzle} calibration={c.calibration} exposure={c.exposure} resolvedProfile={c.resolvedProfile}
            accordions={quickAccordions} onToggleAccordion={(k) => setQuickAccordions((p) => ({ ...p, [k]: !p[k] }))} onOpenGuideTopic={openGuideTopic}
            onChangeCulture={c.setCulture} onChangeEquipment={c.setEquipment} onChangeNozzle={c.setNozzle} onChangeCalibration={c.setCalibration} onChangeExposure={c.setExposure} onOpenKeypad={c.openFieldKeypad}
          />
        )}
        {c.evaluationLevel === 'level3_profiles' && (
          <IrdProfilesOnlyPanel
            userId={c.effectiveUserId} cultures={c.cultures} equipments={c.equipments} profileNozzles={c.profileNozzles} calibrations={c.calibrations} catalogNozzles={NOZZLES_DATABASE}
            culture={c.culture} equipment={c.equipment} nozzle={c.nozzle} calibration={c.calibration} blockingGapsPt={c.ctx.blockingGapsPt}
            isCultAccordionOpen={profileCultOpen} onToggleCultAccordion={() => setProfileCultOpen((v) => !v)}
            onChangeCulture={c.setCulture} onChangeEquipment={c.setEquipment} onChangeNozzle={c.setNozzle} onChangeCalibration={c.setCalibration} onSwitchToQuickManual={c.switchToQuickFromProfiles}
          />
        )}
        <p className="text-xs font-semibold text-slate-700">Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico. O histórico é guardado neste dispositivo.</p>
      </div>

      <IrdActionFooter saveAvailability={saveAvailability} historyCount={c.historyRecords.length} isHidden={isBlockingModalOpen} onSave={() => void c.handleSaveHistory()} onOpenHistory={() => c.setIsHistoryOpen(true)} onOpenGuide={() => openGuideTopic(null)} />
      {c.activeKeypad && <DaterraKeypad isOpen onClose={() => c.setActiveKeypad(null)} initialValue={c.activeKeypad.initialValue} initialUnit={IRD_KEYPAD_META[c.activeKeypad.field].unit} label={IRD_KEYPAD_META[c.activeKeypad.field].label} commonValues={IRD_KEYPAD_META[c.activeKeypad.field].presets} validationRules={IRD_KEYPAD_META[c.activeKeypad.field].rules} onConfirm={c.handleKeypadConfirm} />}
      <IrdHistoryModal isOpen={c.isHistoryOpen} records={c.historyRecords} isLoading={c.isHistoryLoading} userId={c.effectiveUserId} onClose={() => c.setIsHistoryOpen(false)} onDelete={c.deleteHistoryRecord} />
      <IrdGuideModal isOpen={c.isGuideOpen} initialTopic={guideTopic} guideContext={guideContext} onClose={() => c.setIsGuideOpen(false)} />
    </div>
  );
};
export default IrdCalculatorView;
