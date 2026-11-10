import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWeather } from '../weather/hooks/useWeather';
import { NOZZLES_DATABASE } from '../nozzle-comparison/nozzleComparison.data.ts';
import type { CalculationHistoryRecord } from '../../types/calculator.ts';
import { DaterraKeypad, type KeypadValidationRules } from '../../components/DaterraKeypad';
import { calculateDriftRiskIndex } from './irdEngine.ts';
import { buildNozzleInputFromCatalog, resolveNozzleDriftProfile } from './irdNozzleAdapter.ts';
import { listIrdHistory, saveIrdAssessment, softDeleteIrdAssessment } from './irdHistoryAdapter.ts';
import { IRD_VERSIONS } from './irdConfig.ts';
import type { IrdExposureInput, IrdInput, IrdNozzleInput, IrdOperationInput, IrdWeatherInput, IrdWeatherSource } from './irdTypes.ts';
import { IrdResultCard } from './IrdResultCard';
import { IrdParameterPanel, type ParameterKeypadField } from './IrdParameterPanel';
import { IrdWeatherPanel, type WeatherKeypadField } from './IrdWeatherPanel';
import { IrdDropletPanel, type IrdDropletUiMode } from './IrdDropletPanel';
import { IrdHistoryModal } from './IrdHistoryModal';
import { IrdGuideModal } from './IrdGuideModal';

type AnyKeypadField = ParameterKeypadField | WeatherKeypadField | 'representativeDropletDiameterUm' | 'measuredDv10Um' | 'measuredDv50Um' | 'measuredDv90Um' | 'measurementPressureBar';

const KEYPAD_META: Record<AnyKeypadField, { label: string; unit: string; presets: number[]; rules: KeypadValidationRules }> = {
  workingPressureBar: { label: 'Pressão de trabalho', unit: 'bar', presets: [2, 3, 5, 10], rules: { required: true, min: 0.1, max: 50, allowDecimal: true, maxDecimals: 1 } },
  travelSpeedKmh: { label: 'Velocidade de avanço', unit: 'km/h', presets: [4, 6, 8, 10], rules: { required: true, min: 0.5, max: 40, allowDecimal: true, maxDecimals: 1 } },
  boomOrReleaseHeightM: { label: 'Altura de aplicação', unit: 'm', presets: [0.5, 0.7, 1.0, 1.5], rules: { required: true, min: 0.1, max: 15, allowDecimal: true, maxDecimals: 2 } },
  distanceToSensitiveAreaM: { label: 'Distância a zona sensível', unit: 'm', presets: [5, 10, 20, 50], rules: { required: true, min: 0, max: 10000, allowDecimal: true, maxDecimals: 1 } },
  labelMinBufferM: { label: 'Zona tampão do rótulo SIFITO', unit: 'm', presets: [5, 10, 15, 20], rules: { required: true, min: 0, max: 10000, allowDecimal: true, maxDecimals: 1 } },
  windSpeedKmh: { label: 'Vento médio (anemómetro)', unit: 'km/h', presets: [3, 6, 10, 14], rules: { required: true, min: 0, max: 150, allowDecimal: true, maxDecimals: 1 } },
  windGustsKmh: { label: 'Rajada de vento', unit: 'km/h', presets: [5, 10, 15, 20], rules: { required: true, min: 0, max: 200, allowDecimal: true, maxDecimals: 1 } },
  temperatureC: { label: 'Temperatura do ar', unit: '°C', presets: [15, 20, 25, 30], rules: { required: true, min: -20, max: 55, allowDecimal: true, maxDecimals: 1, allowNegative: true } },
  relativeHumidityPct: { label: 'Humidade relativa', unit: '%', presets: [40, 55, 70, 85], rules: { required: true, min: 1, max: 100, allowDecimal: true, maxDecimals: 0 } },
  precipitationMm: { label: 'Precipitação', unit: 'mm/h', presets: [0, 0.2, 1], rules: { required: true, min: 0, max: 500, allowDecimal: true, maxDecimals: 1 } },
  representativeDropletDiameterUm: { label: 'Diâmetro representativo', unit: 'µm', presets: [200, 280, 350, 450], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measuredDv10Um: { label: 'DV10 medido', unit: 'µm', presets: [90, 140, 180, 220], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measuredDv50Um: { label: 'DV50 medido', unit: 'µm', presets: [220, 300, 380, 450], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measuredDv90Um: { label: 'DV90 medido', unit: 'µm', presets: [400, 500, 620, 750], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measurementPressureBar: { label: 'Pressão de ref. da medição', unit: 'bar', presets: [2, 3, 5, 10], rules: { required: true, min: 0.1, max: 50, allowDecimal: true, maxDecimals: 1 } }
};

export const IrdCalculatorView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || null;
  const { data: weatherData, isLoading: weatherLoading, error: weatherError, currentLocation, refreshWeather } = useWeather();

  const [isOffline, setIsOffline] = useState<boolean>(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [cultureLabel, setCultureLabel] = useState<string>('Vinha · Floração / Vegetação plena');
  const [selectedNozzleId, setSelectedNozzleId] = useState<string>('');
  const [nozzleDraft, setNozzleDraft] = useState<IrdNozzleInput>({ workingPressureBar: null, hasAirSleeve: false });
  const [operation, setOperation] = useState<IrdOperationInput>({ applicationDomain: 'horizontal_boom', travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5 });
  const [exposure, setExposure] = useState<IrdExposureInput>({ distanceToSensitiveAreaM: null, labelMinBufferM: null, hasDownwindSensitiveTarget: false });
  const [manualSource, setManualSource] = useState<IrdWeatherSource | null>(null);
  const [manualWeather, setManualWeather] = useState<IrdWeatherInput>({ windSpeedKmh: null, windGustsKmh: null, temperatureC: null, relativeHumidityPct: null, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 });
  const [isDropletOpen, setIsDropletOpen] = useState(false);
  const [dropletMode, setDropletMode] = useState<IrdDropletUiMode>('rotary');
  const [activeKeypad, setActiveKeypad] = useState<{ field: AnyKeypadField; initialValue: string } | null>(null);
  const [historyRecords, setHistoryRecords] = useState<CalculationHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [statusToast, setStatusToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const syncNet = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', syncNet);
    window.addEventListener('offline', syncNet);
    return () => { window.removeEventListener('online', syncNet); window.removeEventListener('offline', syncNet); };
  }, []);

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try { setHistoryRecords(await listIrdHistory(effectiveUserId)); } finally { setIsHistoryLoading(false); }
  }, [effectiveUserId]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const catalogNozzle = useMemo(() => (selectedNozzleId ? NOZZLES_DATABASE.find((n) => n.id === selectedNozzleId) : undefined), [selectedNozzleId]);
  const activeWeather = useMemo<IrdWeatherInput>(() => {
    const ageMin = weatherData?.fetchedAt ? Math.max(0, Math.round((Date.now() - new Date(weatherData.fetchedAt).getTime()) / 60000)) : null;
    const src: IrdWeatherSource = manualSource ?? (weatherData ? (weatherData.current.isCached ? 'open_meteo_cache' : 'open_meteo_live') : 'manual_field');
    if (src === 'manual_field') return { ...manualWeather, weatherSource: 'manual_field', weatherAgeMinutes: 0 };
    const c = weatherData?.current;
    return { windSpeedKmh: c?.windSpeedKmh ?? null, windGustsKmh: c?.windGustsKmh ?? null, temperatureC: c?.temperatureC ?? null, relativeHumidityPct: c?.humidityPercent ?? null, precipitationMm: c?.precipitationMm ?? 0, weatherSource: src, weatherAgeMinutes: ageMin, weatherTimestamp: weatherData?.fetchedAt ?? null };
  }, [manualSource, manualWeather, weatherData]);

  const mergedNozzle = useMemo<IrdNozzleInput>(() => (catalogNozzle ? { ...buildNozzleInputFromCatalog(catalogNozzle, nozzleDraft.workingPressureBar, Boolean(nozzleDraft.hasAirSleeve)), ...nozzleDraft } : nozzleDraft), [catalogNozzle, nozzleDraft]);
  const resolvedProfile = useMemo(() => (typeof mergedNozzle.workingPressureBar === 'number' && mergedNozzle.workingPressureBar > 0 ? resolveNozzleDriftProfile(mergedNozzle, mergedNozzle.workingPressureBar, catalogNozzle) : null), [mergedNozzle, catalogNozzle]);
  const irdInput = useMemo<IrdInput>(() => ({ weather: activeWeather, nozzle: mergedNozzle, operation, exposure }), [activeWeather, mergedNozzle, operation, exposure]);
  const result = useMemo(() => calculateDriftRiskIndex(irdInput, catalogNozzle), [irdInput, catalogNozzle]);

  const handleKeypadConfirm = (val: number) => {
    if (!activeKeypad) return;
    const f = activeKeypad.field;
    if (f === 'windSpeedKmh' || f === 'windGustsKmh' || f === 'temperatureC' || f === 'relativeHumidityPct' || f === 'precipitationMm') {
      setManualSource('manual_field');
      setManualWeather((p) => ({ windSpeedKmh: p.windSpeedKmh ?? activeWeather.windSpeedKmh, windGustsKmh: p.windGustsKmh ?? activeWeather.windGustsKmh, temperatureC: p.temperatureC ?? activeWeather.temperatureC, relativeHumidityPct: p.relativeHumidityPct ?? activeWeather.relativeHumidityPct, precipitationMm: p.precipitationMm ?? activeWeather.precipitationMm ?? 0, weatherSource: 'manual_field', weatherAgeMinutes: 0, [f]: val }));
    } else if (f === 'travelSpeedKmh' || f === 'boomOrReleaseHeightM') setOperation((p) => ({ ...p, [f]: val }));
    else if (f === 'distanceToSensitiveAreaM' || f === 'labelMinBufferM') setExposure((p) => ({ ...p, [f]: val }));
    else setNozzleDraft((p) => ({ ...p, [f]: val }));
    setActiveKeypad(null);
  };

  const handleSaveHistory = async () => {
    if (result.status !== 'CALCULATED') {
      setStatusToast({ type: 'error', text: 'Complete pressão e meteorologia antes de guardar no histórico local.' });
      return;
    }
    try {
      await saveIrdAssessment(effectiveUserId, irdInput, result, { name: `${cultureLabel} (${currentLocation.name})` });
      await loadHistory();
      setStatusToast({ type: 'success', text: 'Avaliação guardada em calculation_history_v2 (syncStatus: local_only).' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setStatusToast({ type: 'error', text: msg === 'history_quota_exceeded' ? 'Limite de 20 avaliações atingido.' : (msg || 'Erro ao guardar avaliação.') });
    }
  };

  const handleDeleteHistory = async (id: string) => { await softDeleteIrdAssessment(id, effectiveUserId); await loadHistory(); };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-5 py-4 pb-28 space-y-4">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => navigate('/ferramentas')} className="touch-target px-3.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-[#114037]">&lt; Voltar às Ferramentas</button>
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full bg-[#eef8f0] text-[#114037] border border-emerald-300 text-xs font-extrabold">Ferramenta Ativa</span>
            <span className="px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-semibold">Versão heurística {IRD_VERSIONS.formulaVersion}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-widest uppercase text-[#1D734B]">PULVERIZAÇÃO</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Índice de Risco de Deriva</h1>
          <p className="text-sm text-slate-700">Apoio à decisão para pulverização · <strong className="text-[#114037]">O rótulo DGAV/SIFITO prevalece sempre.</strong></p>
        </div>
      </header>
      {statusToast && <div role="alert" className={`rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold border ${statusToast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>{statusToast.text}</div>}
      <IrdResultCard result={result} isLoading={weatherLoading && !weatherData && manualSource !== 'manual_field'} />
      <IrdParameterPanel
        cultureLabel={cultureLabel} windDirectionLabel={weatherData?.current.windDirectionText || ''} catalogNozzles={NOZZLES_DATABASE}
        selectedNozzleId={selectedNozzleId} nozzle={mergedNozzle} operation={operation} exposure={exposure}
        onChangeCultureLabel={setCultureLabel}
        onSelectNozzle={(id) => { setSelectedNozzleId(id); setNozzleDraft((p) => ({ ...p, nozzleId: id || null })); }}
        onChangeOperation={(patch) => setOperation((p) => ({ ...p, ...patch }))}
        onToggleAirSleeve={() => setNozzleDraft((p) => ({ ...p, hasAirSleeve: !p.hasAirSleeve }))}
        onToggleDownwind={() => setExposure((p) => ({ ...p, hasDownwindSensitiveTarget: !p.hasDownwindSensitiveTarget }))}
        onOpenKeypad={(field) => setActiveKeypad({ field, initialValue: String(field === 'workingPressureBar' ? (mergedNozzle.workingPressureBar ?? '') : field === 'travelSpeedKmh' || field === 'boomOrReleaseHeightM' ? (operation[field] ?? '') : (exposure[field] ?? '')) })}
        onClearOptionalExposure={(field) => setExposure((p) => ({ ...p, [field]: null }))}
      />
      <IrdWeatherPanel
        weather={activeWeather} isOffline={isOffline} isWeatherLoading={weatherLoading} weatherError={weatherError} locationName={currentLocation.name}
        onChangeSource={(src) => { setManualSource(src); if (src === 'manual_field') setManualWeather({ ...activeWeather, weatherSource: 'manual_field', weatherAgeMinutes: 0 }); }}
        onRefreshWeather={() => { setManualSource(null); refreshWeather(); }}
        onOpenKeypad={(field) => setActiveKeypad({ field, initialValue: String(activeWeather[field] ?? '') })}
      />
      <IrdDropletPanel
        isOpen={isDropletOpen} mode={dropletMode} nozzle={nozzleDraft} resolvedProfile={resolvedProfile}
        onToggleOpen={() => setIsDropletOpen((v) => !v)}
        onModeChange={(m) => { setDropletMode(m); setNozzleDraft((p) => ({ ...p, representativeDropletDiameterUm: null, measuredDv10Um: null, measuredDv50Um: null, measuredDv90Um: null })); }}
        onChangeFields={(patch) => setNozzleDraft((p) => ({ ...p, ...patch }))}
        onOpenKeypad={(field) => setActiveKeypad({ field, initialValue: String(nozzleDraft[field] ?? '') })}
        onClear={() => setNozzleDraft((p) => ({ ...p, representativeDropletDiameterUm: null, measuredDv10Um: null, measuredDv50Um: null, measuredDv90Um: null, measurementSource: null, measurementPressureBar: null, measurementDate: null, measurementConfidence: null }))}
      />
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-slate-200 px-3 py-2.5 z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5">
          <button type="button" onClick={() => void handleSaveHistory()} className="touch-target flex-1 rounded-xl bg-[#3CA64C] hover:bg-[#339341] text-white text-sm font-extrabold px-4">Guardar Histórico</button>
          <button type="button" onClick={() => setIsHistoryOpen(true)} className="touch-target rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-extrabold px-4 border border-slate-300">Histórico ({historyRecords.length})</button>
          <button type="button" onClick={() => setIsGuideOpen(true)} className="touch-target rounded-xl bg-slate-100 hover:bg-slate-200 text-[#114037] text-sm font-extrabold px-4 border border-slate-300">Guia</button>
        </div>
      </footer>
      {activeKeypad && (
        <DaterraKeypad
          isOpen onClose={() => setActiveKeypad(null)} initialValue={activeKeypad.initialValue}
          initialUnit={KEYPAD_META[activeKeypad.field].unit} label={KEYPAD_META[activeKeypad.field].label}
          commonValues={KEYPAD_META[activeKeypad.field].presets} validationRules={KEYPAD_META[activeKeypad.field].rules}
          onConfirm={handleKeypadConfirm}
        />
      )}
      <IrdHistoryModal isOpen={isHistoryOpen} records={historyRecords} isLoading={isHistoryLoading} userId={effectiveUserId} onClose={() => setIsHistoryOpen(false)} onDelete={(id) => void handleDeleteHistory(id)} />
      <IrdGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};
export default IrdCalculatorView;
