// src/features/weather/components/WeatherContextAccordion.tsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, ChevronDown, ChevronUp, RotateCcw, Info, CheckCircle2, Sprout, Wrench, Gauge, Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import type { CurrentWeather } from '../types';
import type { ActiveMachineContext } from '../weatherWeekAggregator';
import { SearchableRoundedDropdown } from '../../perfis/components/SearchableRoundedDropdown';
import type { CatalogSelectOption } from '../../perfis/data/cultureCatalogData';
import { useWeatherProfilesContext } from '../hooks/useWeatherProfilesContext';
import { getDynamicThresholdsSummary } from '../utils/weatherContextHelpers';
import { formatDecimalPt } from '../utils/windDirection';
import { CalibrationWhatIfPanel } from './CalibrationWhatIfPanel';

interface WeatherContextAccordionProps {
  context: ActiveMachineContext | null;
  onContextChange: (ctx: ActiveMachineContext | null) => void;
  currentWeather?: CurrentWeather;
}

export const WeatherContextAccordion: React.FC<WeatherContextAccordionProps> = ({ context, onContextChange, currentWeather }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || '';
  const getEmptyGuard = () => { if (!effectiveUserId) return []; return null; };
  void getEmptyGuard;

  const {
    calibrations, cultures, selectedCultureOnly, parcelRisk, chain, activeVals, setWhatIf,
    baselineSim, liveSim, isDirty, isSaving, saveFeedback, selectCalibration, selectCultureOnly, persistCalibration, renameCalibration
  } = useWeatherProfilesContext(context, onContextChange, currentWeather);

  const calibrationOptions = useMemo<CatalogSelectOption[]>(() => [
    { id: '', label: 'Modo Referência (Sem calibração)' },
    ...calibrations.map((c) => ({ id: String(c.id), label: c.nomePerfil }))
  ], [calibrations]);

  const cultureOptions = useMemo<CatalogSelectOption[]>(() => [
    { id: '', label: 'Sem cultura selecionada' },
    ...cultures.map((c) => {
      const ext = c as typeof c & { parcelaNome?: string; especieLabel?: string };
      const title = ext.parcelaNome?.trim() || c.name?.trim() || ext.especieLabel?.trim() || c.crop_type || `Parcela #${c.id}`;
      const meta = [c.crop_type !== title ? c.crop_type : '', c.geometry_mode].filter(Boolean).join(' · ');
      return { id: String(c.id), label: meta ? `${title} (${meta})` : title };
    })
  ], [cultures]);

  const selectedCalOpt = calibrationOptions.find((o) => o.id === String(context?.calibrationId ?? ''));
  const hasCal = Boolean(chain && context?.calibrationId);
  const effectiveCultureId = hasCal ? (chain?.culture?.id ?? '') : (!context?.calibrationId && context?.cultureId ? context.cultureId : '');
  const selectedCultOpt = cultureOptions.find((o) => o.id === String(effectiveCultureId));
  const hasCultureOnly = Boolean(!hasCal && selectedCultureOnly && parcelRisk);
  const thresholdsText = getDynamicThresholdsSummary(context, null);

  const collapsedSummary = useMemo(() => {
    if (hasCal && chain) {
      return chain.culture ? `${chain.calibration.nomePerfil} • ${chain.cultureLabel}` : chain.calibration.nomePerfil;
    }
    if (hasCultureOnly && selectedCultureOnly && parcelRisk) {
      const ext = selectedCultureOnly as typeof selectedCultureOnly & { parcelaNome?: string; especieLabel?: string };
      const title = ext.parcelaNome?.trim() || selectedCultureOnly.name?.trim() || ext.especieLabel?.trim() || '';
      return `${title} (${parcelRisk.geometryMode}) • Risco Parcela ${parcelRisk.parcelRiskPct}%`;
    }
    return 'Modo Referência · Selecione Cultura / Parcela ou Calibração.';
  }, [hasCal, hasCultureOnly, chain, selectedCultureOnly, parcelRisk]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden transition-all">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#eef8f0] text-daterra-primary flex items-center justify-center shrink-0"><Tractor className="w-5 h-5" /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Perfis da Aplicação</span>
              {hasCal ? (
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Calibração Ativa</span>
              ) : hasCultureOnly ? (
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Sprout className="w-3 h-3" /> Cultura Ativa</span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Modo Referência</span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">{collapsedSummary}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {(hasCal || hasCultureOnly) && (
            <button type="button" onClick={() => selectCalibration('')} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /><span>Referência</span></button>
          )}
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded} className="px-3 py-1.5 text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer">
            <span>{isExpanded ? 'Recolher' : 'Configurar'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4">
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <SearchableRoundedDropdown label="Cultura / Parcela" value={selectedCultOpt?.label ?? 'Sem cultura selecionada'} selectedId={selectedCultOpt?.id ?? ''} options={cultureOptions} placeholder="Selecionar parcela..." usePortal onSelectOption={(opt) => selectCultureOnly(opt.id)} onClear={hasCultureOnly ? () => selectCultureOnly('') : undefined} />
            <SearchableRoundedDropdown label="Calibração" value={selectedCalOpt?.label ?? 'Modo Referência (Sem calibração)'} selectedId={String(context?.calibrationId ?? '')} options={calibrationOptions} placeholder="Selecionar calibração..." usePortal onSelectOption={(opt) => selectCalibration(opt.id)} onClear={hasCal ? () => selectCalibration('') : undefined} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/definicoes?tab=exploracao&subtab=calibracao" className="min-h-[38px] px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-extrabold text-[#114037] inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /><span>Nova Calibração</span></Link>
            <Link to="/definicoes?tab=exploracao" className="min-h-[38px] px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center">Gerir perfis</Link>
          </div>

          {hasCultureOnly && selectedCultureOnly && parcelRisk && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Risco da Parcela ({parcelRisk.geometryMode})</span>
                  <span className="text-base font-black text-[#114037] font-mono-numbers">{parcelRisk.parcelRiskPct}% <span className="text-xs font-semibold text-slate-600">(Base {parcelRisk.baseMeteoScore}% × F {formatDecimalPt(parcelRisk.fParcela)})</span></span>
                </div>
                {parcelRisk.targetVolumeLHa && <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold font-mono-numbers">Alvo: {formatDecimalPt(parcelRisk.targetVolumeLHa)} L/ha</span>}
              </div>
              {parcelRisk.factorsBreakdown.length > 0 && (
                <div className="flex flex-wrap gap-1.5">{parcelRisk.factorsBreakdown.map((f) => <span key={f} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">{f}</span>)}</div>
              )}
              {parcelRisk.alertsPt.map((a, idx) => <div key={idx} className="flex items-start gap-1.5 text-[11px] font-semibold text-amber-950 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" /><span>{a}</span></div>)}
            </div>
          )}

          {hasCal && chain && activeVals && baselineSim && liveSim && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-start gap-2"><Sprout className="w-4 h-4 text-[#3CA64C] shrink-0 mt-0.5" /><div className="min-w-0"><span className="block text-[10px] font-bold uppercase text-slate-500">Cultura / Momento</span><span className="font-bold text-slate-900 block truncate">{chain.cultureLabel}</span><span className="text-[11px] text-slate-600 font-mono-numbers">{chain.cultureMetaLabel}</span></div></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-start gap-2"><Wrench className="w-4 h-4 text-[#114037] shrink-0 mt-0.5" /><div className="min-w-0"><span className="block text-[10px] font-bold uppercase text-slate-500">Pulverizador</span><span className="font-bold text-slate-900 block truncate">{chain.equipmentName}</span><span className="text-[11px] text-slate-600">{chain.equipmentMetaLabel}</span></div></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-start gap-2"><Gauge className="w-4 h-4 text-[#114037] shrink-0 mt-0.5" /><div className="min-w-0"><span className="block text-[10px] font-bold uppercase text-slate-500">Conjunto de Bicos</span><span className="font-bold text-slate-900 block truncate">{chain.nozzleName}</span><span className="text-[11px] text-slate-600 font-mono-numbers">{chain.nozzleMetaLabel}</span></div></div>
              </div>
              <CalibrationWhatIfPanel chain={chain} vals={activeVals} baselineSim={baselineSim} liveSim={liveSim} isDirty={isDirty} isSaving={isSaving} saveFeedback={saveFeedback} onChangeVals={setWhatIf} onPersist={persistCalibration} onRename={renameCalibration} />
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" /><span>{thresholdsText}</span>
          </div>
        </div>
      )}
    </div>
  );
};
