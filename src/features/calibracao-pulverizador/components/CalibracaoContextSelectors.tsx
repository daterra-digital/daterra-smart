import React, { useMemo, useEffect } from 'react';
import {
  getAvailableCultures,
  getInferredConductionForCulture,
  getPhenologyGroups,
  selectEppoKRow,
  type EppoKDecisionRow
} from '../data/eppoKDecisionMatrix.ts';
import {
  LWA_V_THICKNESS_OPTIONS,
  LWA_V_DENSITY_OPTIONS,
  LWA_V_STAGE_OPTIONS,
  LWA_V_THICKNESS_FACTORS,
  LWA_V_DENSITY_FACTORS,
  LWA_V_STAGE_FACTORS,
  type LwaVThicknessId,
  type CanopyDensityId,
  type LwaVStageId
} from '../data/lwaVDaterraConfig.ts';
import type { CalibracaoMetodo, CanopyDensityTierId } from '../calibracaoPulverizadorTypes.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { Info, Sparkles, CheckCircle2, AlertTriangle, Cpu, Layers, Leaf, Sprout, Calendar } from 'lucide-react';

export interface CalibracaoContextSelectorsProps {
  method: CalibracaoMetodo;
  cultureId?: string;
  conductionId?: string;
  phenologyId?: string;
  canopyDensity?: CanopyDensityTierId;
  canopyThickness?: LwaVThicknessId;
  phenologyStage?: LwaVStageId;
  useManualAdoptedVolumeInLwa?: boolean;
  onSelectCulture: (cultureId: string) => void;
  onSelectConduction: (conductionId: string) => void;
  onSelectPhenology: (phenologyId: string) => void;
  onSelectCanopyDensity: (density: CanopyDensityTierId) => void;
  onSelectCanopyThickness?: (thickness: LwaVThicknessId) => void;
  onSelectPhenologyStage?: (stage: LwaVStageId) => void;
  onToggleManualAdoptedVolumeInLwa?: (value: boolean) => void;
  isDesktop?: boolean;
}

export const CalibracaoContextSelectors: React.FC<CalibracaoContextSelectorsProps> = ({
  method,
  cultureId = 'vinha',
  conductionId,
  phenologyId,
  canopyDensity = 'moderate',
  canopyThickness = 'estreita',
  phenologyStage = 'int_5',
  useManualAdoptedVolumeInLwa: _useManualAdoptedVolumeInLwa,
  onSelectCulture,
  onSelectConduction,
  onSelectPhenology,
  onSelectCanopyDensity,
  onSelectCanopyThickness,
  onSelectPhenologyStage,
  onToggleManualAdoptedVolumeInLwa: _onToggleManualAdoptedVolumeInLwa
}) => {
  const { t } = useLanguage();
  const isLwa = method === 'lwa';

  const cultures = useMemo(() => getAvailableCultures(), []);
  const effectiveConductionId = useMemo(() => {
    return conductionId || (cultureId ? getInferredConductionForCulture(cultureId)?.id : undefined);
  }, [cultureId, conductionId]);

  // TRV Phenology Groups
  const trvPhenologyGroups = useMemo(
    () => (cultureId ? getPhenologyGroups(cultureId, effectiveConductionId) : []),
    [cultureId, effectiveConductionId]
  );

  // TRV Selected Decision Row
  const selectedTrvRow: EppoKDecisionRow | undefined = useMemo(() => {
    if (!isLwa && cultureId && phenologyId && canopyDensity) {
      const trvDensity: 'open' | 'moderate' | 'dense' =
        canopyDensity === 'aberta' || canopyDensity === 'open'
          ? 'open'
          : canopyDensity === 'densa' || canopyDensity === 'dense'
          ? 'dense'
          : 'moderate';
      return selectEppoKRow(cultureId, effectiveConductionId, phenologyId, trvDensity);
    }
    return undefined;
  }, [isLwa, cultureId, effectiveConductionId, phenologyId, canopyDensity]);

  // Densidade normalizada para LWA-V ('aberta' | 'moderada' | 'densa')
  const lwaVDensityId: CanopyDensityId = useMemo(() => {
    if (canopyDensity === 'open' || canopyDensity === 'aberta') return 'aberta';
    if (canopyDensity === 'dense' || canopyDensity === 'densa') return 'densa';
    return 'moderada';
  }, [canopyDensity]);

  // Fator ativo de densidade para TRV (0.75 | 0.85 | 1.00)
  const trvActiveDensityFactor = useMemo(() => {
    if (canopyDensity === 'open' || canopyDensity === 'aberta') return 0.75;
    if (canopyDensity === 'dense' || canopyDensity === 'densa') return 1.0;
    return 0.85;
  }, [canopyDensity]);

  // Fatores ativos do LWA-V
  const activeThicknessFactor = LWA_V_THICKNESS_FACTORS[canopyThickness] ?? 1.0;
  const activeDensityFactor = LWA_V_DENSITY_FACTORS[lwaVDensityId] ?? 0.95;
  const activeStageFactor = LWA_V_STAGE_FACTORS[phenologyStage] ?? 1.0;
  const isRestingStage = phenologyStage === 'int_1';

  // Auto-selecionar Vinha no modo LWA (modelo LWA-V é exclusivo para Vinha)
  useEffect(() => {
    if (isLwa && cultureId !== 'vinha') {
      onSelectCulture('vinha');
      const inferred = getInferredConductionForCulture('vinha');
      if (inferred) {
        onSelectConduction(inferred.id);
      }
    }
  }, [isLwa, cultureId, onSelectCulture, onSelectConduction]);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-soft space-y-3">
      {/* Cabeçalho da Secção */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
            {isLwa
              ? t('calibracaoPulverizador.lwaVContextTitle', 'Contexto Agronómico - LWA Vinha')
              : t('calibracaoPulverizador.trvContextTitle', 'Contexto Agronómico e Coeficiente k')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isLwa
              ? t('calibracaoPulverizador.lwaVContextSubtitle', 'Modelo paramétrico de volume de calda para a vinha.')
              : t('calibracaoPulverizador.trvContextSubtitle', 'Necessário para determinar o coeficiente k de volume de calda da matriz.')}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
          {isLwa ? 'LWA' : 'TRV'}
        </span>
      </div>

      {/* Linha Superior de Contexto */}
      {isLwa ? (
        /* LWA - VINHA: 2 Pods Autónomos (Espessura da Sebe + Densidade Foliar) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. ESPESSURA DA SEBE (GRUPO FECHADO DE 3 OPÇÕES) */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-800">
                  {t('calibracaoPulverizador.canopyThickness', 'Espessura da sebe')}
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                Fator: {activeThicknessFactor.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="p-1 bg-slate-200/60 rounded-xl grid grid-cols-3 gap-1 border border-slate-200/70">
              {LWA_V_THICKNESS_OPTIONS.map((opt) => {
                const isSelected = canopyThickness === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectCanopyThickness?.(opt.id)}
                    aria-pressed={isSelected}
                    className={`h-[42px] px-1 py-1 rounded-lg text-center transition-all cursor-pointer touch-target flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#114037] text-white shadow-xs'
                        : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-xs font-extrabold block truncate w-full">
                      {t(opt.labelKey, opt.fallbackLabel)}
                    </span>
                    <span
                      className={`text-[9.5px] block truncate w-full ${
                        isSelected ? 'text-emerald-200 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {t(opt.descKey, opt.fallbackDesc)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. DENSIDADE FOLIAR LWA (GRUPO FECHADO DE 3 OPÇÕES) */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-800">
                  {t('calibracaoPulverizador.canopyDensity', 'Densidade foliar')}
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                Fator: {activeDensityFactor.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="p-1 bg-slate-200/60 rounded-xl grid grid-cols-3 gap-1 border border-slate-200/70">
              {LWA_V_DENSITY_OPTIONS.map((opt) => {
                const isSelected = lwaVDensityId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectCanopyDensity(opt.id)}
                    aria-pressed={isSelected}
                    className={`h-[42px] px-1 py-1 rounded-lg text-center transition-all cursor-pointer touch-target flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#114037] text-white shadow-xs'
                        : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-xs font-extrabold block truncate w-full">
                      {t(opt.labelKey, opt.fallbackLabel)}
                    </span>
                    <span
                      className={`text-[9.5px] block truncate w-full ${
                        isSelected ? 'text-emerald-200 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {opt.factor.toFixed(2).replace('.', ',')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* TRV - NÍVEL 1: Cultura (1 Col) + Densidade Foliar EPPO (2 Cols) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. SELETOR DE CULTURA (TRV) */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60">
              <label htmlFor="calibracao-culture-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <Sprout className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>{t('calibracaoPulverizador.culture', 'Cultura')}</span>
              </label>
            </div>
            <select
              id="calibracao-culture-select"
              value={cultureId || ''}
              onChange={(e) => {
                const val = e.target.value;
                onSelectCulture(val);
                const inferred = getInferredConductionForCulture(val);
                if (inferred) {
                  onSelectConduction(inferred.id);
                }
                const groups = getPhenologyGroups(val, inferred?.id);
                if (groups.length > 0) {
                  if (!groups.some((p) => p.id === phenologyId)) {
                    onSelectPhenology(groups[0].id);
                  }
                }
              }}
              className="w-full h-[42px] px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#114037] focus:ring-1 focus:ring-[#114037] outline-none cursor-pointer shadow-2xs"
            >
              <option value="">{t('calibracaoPulverizador.selectCulturePlaceholder', 'Selecione a cultura...')}</option>
              {cultures.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(`calibracaoPulverizador.cultures.${c.id}`, c.label)}
                </option>
              ))}
            </select>
          </div>

          {/* 2. DENSIDADE FOLIAR TRV (GRUPO FECHADO DE 3 OPÇÕES EM 2 COLUNAS) */}
          <div className="md:col-span-2 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-800">
                  {t('calibracaoPulverizador.canopyDensity', 'Densidade Foliar')}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">EPPO PP 1/239</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                Fator: {trvActiveDensityFactor.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="p-1 bg-slate-200/60 rounded-xl grid grid-cols-3 gap-1 border border-slate-200/70">
              {[
                {
                  id: 'open' as CanopyDensityTierId,
                  labelKey: 'calibracaoPulverizador.openCanopy',
                  fallbackLabel: 'Aberta',
                  factor: 0.75,
                  desc: 'Luz e ar atravessam'
                },
                {
                  id: 'moderate' as CanopyDensityTierId,
                  labelKey: 'calibracaoPulverizador.moderateCanopy',
                  fallbackLabel: 'Moderada',
                  factor: 0.85,
                  desc: 'Cobertura intermédia'
                },
                {
                  id: 'dense' as CanopyDensityTierId,
                  labelKey: 'calibracaoPulverizador.denseCanopy',
                  fallbackLabel: 'Densa',
                  factor: 1.0,
                  desc: 'Massa compacta'
                }
              ].map((opt) => {
                const isSelected =
                  canopyDensity === opt.id ||
                  canopyDensity === (opt.id === 'open' ? 'aberta' : opt.id === 'moderate' ? 'moderada' : 'densa');
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectCanopyDensity(opt.id)}
                    aria-pressed={isSelected}
                    className={`h-[42px] px-1 py-1 rounded-lg text-center transition-all cursor-pointer touch-target flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#114037] text-white shadow-xs'
                        : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 w-full">
                      <span className="text-xs font-extrabold truncate">
                        {t(opt.labelKey, opt.fallbackLabel)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                          isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200/70 text-slate-600'
                        }`}
                      >
                        {opt.factor.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <span
                      className={`text-[9.5px] block truncate w-full ${
                        isSelected ? 'text-emerald-200 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERCURSO LWA - VINHA (INTERVALO FENOLÓGICO EM GRELHA HORIZONTAL)          */}
      {/* ========================================================================= */}
      {isLwa && (
        <div className="space-y-2.5 animate-fade-in">
          {/* Intervalo Fenológico: 5 botões em grelha horizontal compacta */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 block">
                {t('calibracaoPulverizador.phenologicalStage', 'Intervalo fenológico')}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Fator: {activeStageFactor.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {LWA_V_STAGE_OPTIONS.map((opt) => {
                const isSelected = phenologyStage === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectPhenologyStage?.(opt.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[46px] p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between touch-target ${
                      isSelected
                        ? 'bg-emerald-50/90 border-[#1D734B] text-slate-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full min-w-0">
                      <span className="text-xs font-bold leading-tight line-clamp-2">
                        {t(opt.labelKey, opt.fallbackLabel)}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1D734B] shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] pt-0.5 border-t border-slate-200/50">
                      <span className="text-slate-400 font-medium text-[9px] uppercase">Fator</span>
                      <span
                        className={`font-mono-numbers font-black px-1 py-0.2 rounded text-[10px] ${
                          isSelected
                            ? 'bg-emerald-200/70 text-emerald-950'
                            : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {opt.factor.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AVISO SELECIONADO: ESTÁDIO EM REPOUSO (int_1) */}
          {isRestingStage && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1 animate-fade-in text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="leading-relaxed space-y-0.5 text-xs">
                  <p className="font-extrabold">
                    {t(
                      'calibracaoPulverizador.restingStageWarningTitle',
                      'Vinha em repouso vegetativo'
                    )}
                  </p>
                  <p className="text-[11.5px]">
                    {t(
                      'calibracaoPulverizador.warnings.restingStageNotice',
                      'A vinha encontra-se em repouso vegetativo. Não existe alvo foliar ativo para este cálculo. Reveja a oportunidade e a autorização do tratamento.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CARTÃO RESUMO LWA-V DATERRA (Quando não está em repouso) */}
          {!isRestingStage && (
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl space-y-1 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-black text-emerald-950">
                    {t('calibracaoPulverizador.lwaVModelSummary', 'Modelo LWA Ativo')}:
                  </span>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                  Taxa base: 0,0377 L/m² LWA
                </span>
              </div>
              <div className="text-[11px] text-emerald-900 leading-tight pl-5 flex flex-wrap items-center gap-x-2">
                <span>
                  <strong className="font-bold">Fatores:</strong> Espessura ({activeThicknessFactor.toFixed(2).replace('.', ',')}) · Densidade ({activeDensityFactor.toFixed(2).replace('.', ',')}) · Estádio ({activeStageFactor.toFixed(2).replace('.', ',')})
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERCURSO TRV (MATRIZ EPPO K)                                              */}
      {/* ========================================================================= */}
      {!isLwa && (
        <div className="space-y-2.5 animate-fade-in">
          {/* 1. SELETOR DE ESTADO FENOLÓGICO TRV */}
          {cultureId && trvPhenologyGroups.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-700 block">
                    {t('calibracaoPulverizador.phenology', 'Estado Fenológico')}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">
                  EPPO PP 1/239
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {trvPhenologyGroups.map((p) => {
                  const isSelected = phenologyId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectPhenology(p.id)}
                      aria-pressed={isSelected}
                      className={`min-h-[46px] p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between touch-target ${
                        isSelected
                          ? 'bg-emerald-50/90 border-[#1D734B] text-slate-900 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-xs font-bold block truncate">
                          {t(`calibracaoPulverizador.phenologies.${p.id}`, p.label)}
                        </span>
                        {p.reference && (
                          <span className="text-[9.5px] text-slate-400 block truncate">
                            {p.reference}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#1D734B] shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. CARTÃO RESUMO COEFICIENTE k (TRV) */}
          {selectedTrvRow && (
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl space-y-1 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-black text-emerald-950">
                    {t('calibracaoPulverizador.coefficientSelected', 'Coeficiente k Selecionado')}:
                  </span>
                  <span className="text-sm font-black font-mono-numbers text-[#114037] ml-1">
                    {selectedTrvRow.kLPerM3.toFixed(3).replace('.', ',')}{' '}
                    <span className="text-xs font-bold text-emerald-700">L/m³</span>
                  </span>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                  Fator visual: {selectedTrvRow.adjustmentFactor.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="text-[11px] text-emerald-900 leading-tight pl-5 flex flex-wrap items-center gap-x-2">
                <span>
                  <strong className="font-bold">{t('calibracaoPulverizador.decisionBasis', 'Base da decisão')}:</strong>{' '}
                  {selectedTrvRow.cultureLabel} · {selectedTrvRow.conductionLabel} · {selectedTrvRow.phenologyLabel} · {selectedTrvRow.densityLabel}
                </span>
                <span className="text-emerald-800 italic text-[10.5px]">
                  ({selectedTrvRow.rationale})
                </span>
              </div>
            </div>
          )}

          {/* Aviso se faltar contexto no TRV */}
          {(!cultureId || !phenologyId || !canopyDensity) && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {t(
                  'calibracaoPulverizador.fillContextPrompt',
                  'Selecione a cultura, estado fenológico e densidade foliar para obter o coeficiente k.'
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

