/**
 * DATERRA Smart - Editor do Perfil de Distribuição e Pressão de Trabalho (Fase C)
 * Ficheiro: src/features/calibracao-pulverizador/components/OutputDistributionProfileEditor.tsx
 * 
 * Funcionalidades:
 * - Cartão 1: Pressão de Trabalho (Não editável, escala 1,0 a 30,0 bar, avisos visuais)
 * - Cartão 2: Perfil de Distribuição (Cabeçalho com Débito Total Requerido)
 * - Modo "Bicos Iguais": Seletor de níveis/bicos ativos e cartão de bico único
 * - Modo "Combinação de Bicos": Construção progressiva do topo para a base com [+ Adicionar Bico]
 * - Amostras horizontais sólidas de cor por bico ocupando toda a largura útil do cartão
 * - Sem barras de vidro verticais, sem simulação de líquidos, sem botões de ajuste fino manual
 */

import React, { useMemo } from 'react';
import { Gauge, Plus, Edit3, Trash2, AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { NozzleCatalogEntry } from '../data/nozzleCatalog.ts';
import {
  calculatePressureGaugePercent,
  getPressureStatus,
  formatPressureDisplay,
  getNozzleColorHex,
  calculateEstimatedOutput
} from '../nozzleSelectionEngine.ts';

export interface OutputDistributionProfileEditorProps {
  requiredTotalOutputLMin: number;
  requiredOutputPerSideLMin: number;
  distributionMode: 'uniform' | 'custom';
  onModeChange: (mode: 'uniform' | 'custom') => void;
  // Modo Bicos Iguais
  uniformActiveLevels: number;
  onUniformActiveLevelsChange: (levels: number) => void;
  uniformSelectedNozzle: NozzleCatalogEntry | null;
  onOpenUniformNozzlePicker: () => void;
  // Modo Combinação de Bicos
  customConfirmedNozzles: (NozzleCatalogEntry | null)[];
  onAddCustomLevel: () => void;
  onOpenCustomLevelPicker: (levelIndex: number) => void;
  onRemoveCustomLevel: (levelIndex: number) => void;
  // Pressão de Trabalho Resultante
  workingPressureBar: number | null;
  isDesktop?: boolean;
}

export const OutputDistributionProfileEditor: React.FC<OutputDistributionProfileEditorProps> = ({
  requiredTotalOutputLMin,
  requiredOutputPerSideLMin,
  distributionMode,
  onModeChange,
  uniformActiveLevels,
  onUniformActiveLevelsChange,
  uniformSelectedNozzle,
  onOpenUniformNozzlePicker,
  customConfirmedNozzles,
  onAddCustomLevel,
  onOpenCustomLevelPicker,
  onRemoveCustomLevel,
  workingPressureBar
}) => {
  const { t } = useLanguage();

  const isUniform = distributionMode === 'uniform';

  // Formatação e estado da pressão resultante
  const hasPressure = typeof workingPressureBar === 'number' && workingPressureBar > 0;
  const pressureStatus = useMemo(
    () => (hasPressure ? getPressureStatus(workingPressureBar!) : 'low'),
    [hasPressure, workingPressureBar]
  );
  const pressureGaugePercent = useMemo(
    () => (hasPressure ? calculatePressureGaugePercent(workingPressureBar!) : 0),
    [hasPressure, workingPressureBar]
  );
  const pressureDisplay = useMemo(
    () => (hasPressure ? formatPressureDisplay(workingPressureBar!) : { label: '—', isExtreme: false, numericValue: null }),
    [hasPressure, workingPressureBar]
  );

  const formatLMin = (val: number) => {
    return val.toFixed(2).replace('.', ',');
  };

  const levelOptions = [2, 3, 4, 5, 6]; // 4, 6, 8, 10, 12 bicos totais

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. CARTÃO "PRESSÃO DE TRABALHO" — NÃO EDITÁVEL                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#114037]/10 flex items-center justify-center text-[#114037]">
              <Gauge className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              {t('calibracaoPulverizador.phaseC.workingPressureTitle', 'Pressão de Trabalho')}
            </h3>
          </div>

          {/* Valor da Pressão ou Indicador de Extremo */}
          <div>
            {!hasPressure ? (
              <span className="text-sm font-black font-mono-numbers text-slate-400">—</span>
            ) : pressureDisplay.isExtreme ? (
              <span className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-full bg-red-100 text-red-900 border border-red-300 animate-pulse">
                {t('calibracaoPulverizador.phaseC.pressureTooHighTitle', 'Pressão demasiado elevada')}
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black font-mono-numbers text-[#114037]">
                  {workingPressureBar!.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-xs font-bold text-[#1D734B]">bar</span>
              </div>
            )}
          </div>
        </div>

        {/* Manómetro Visual (Escala 1,0 bar a 30,0 bar) */}
        <div className="space-y-1.5 pt-1">
          <div className="relative w-full h-3 sm:h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            {hasPressure && (
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pressureStatus === 'low'
                    ? 'bg-amber-400'
                    : pressureStatus === 'low-moderate'
                    ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                    : pressureStatus === 'preferred'
                    ? 'bg-emerald-500'
                    : pressureStatus === 'high'
                    ? 'bg-gradient-to-r from-emerald-500 to-orange-500'
                    : pressureStatus === 'very-high'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600'
                    : 'bg-red-600 animate-pulse'
                }`}
                style={{ width: `${pressureGaugePercent}%` }}
                role="progressbar"
                aria-valuenow={workingPressureBar && workingPressureBar <= 30 ? workingPressureBar : 30}
                aria-valuemin={1}
                aria-valuemax={30}
                aria-label={t('calibracaoPulverizador.phaseC.workingPressureTitle', 'Pressão de Trabalho')}
              />
            )}
          </div>

          {/* Marcações da Escala */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-mono-numbers px-0.5">
            <span>1,0 bar</span>
            <span className="text-[10px] font-semibold text-slate-500 font-sans">
              {t('calibracaoPulverizador.phaseC.preferredZoneMark', '8 a 15 bar (ideal)')}
            </span>
            <span>30,0 bar</span>
          </div>
        </div>

        {/* Mensagens Contextuais de Orientação */}
        {!hasPressure && (
          <div
            role="note"
            className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2 animate-fade-in"
          >
            <Info className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="font-medium">
              {t(
                'calibracaoPulverizador.phaseC.selectNozzlesToCalculatePressure',
                'Selecione os bicos necessários para calcular a pressão de trabalho.'
              )}
            </span>
          </div>
        )}

        {hasPressure && (
          <>
            {(pressureStatus === 'low' || pressureStatus === 'low-moderate') && (
              <div
                role="note"
                className="bg-amber-50 border border-amber-200/90 rounded-xl p-2.5 text-xs text-amber-900 flex items-center gap-2 animate-fade-in"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span className="font-medium">
                  {t('calibracaoPulverizador.phaseC.pressureSeekPreferred', 'Procure uma pressão entre 8 e 15 bar.')}
                </span>
              </div>
            )}

            {(pressureStatus === 'high' || pressureStatus === 'very-high') && (
              <div
                role="note"
                className="bg-orange-50 border border-orange-200/90 rounded-xl p-2.5 text-xs text-orange-950 flex items-center gap-2 animate-fade-in"
              >
                <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" aria-hidden="true" />
                <span className="font-medium">
                  {t('calibracaoPulverizador.phaseC.pressureElevatedRisk', 'Pressão elevada. Possível risco de deriva.')}
                </span>
              </div>
            )}

            {pressureStatus === 'extreme' && (
              <div
                role="alert"
                className="bg-red-50 border border-red-300 rounded-xl p-3 text-xs text-red-950 space-y-1 animate-fade-in"
              >
                <div className="flex items-center gap-2 font-black text-red-950">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                  <span>{t('calibracaoPulverizador.phaseC.pressureTooHighTitle', 'Pressão demasiado elevada')}</span>
                </div>
                <p className="leading-relaxed pl-6 text-red-900 font-medium">
                  {t(
                    'calibracaoPulverizador.phaseC.pressureTooHighGuidance',
                    'A combinação atual exige uma pressão demasiado elevada. Escolha outros bicos ou acrescente níveis de bicos ativos.'
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. CARTÃO "PERFIL DE DISTRIBUIÇÃO"                                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Cabeçalho do Cartão: Perfil de Distribuição (esq) e Débito Total Requerido (dir) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {t('calibracaoPulverizador.phaseC.distributionProfileTitle', 'Perfil de Distribuição')}
          </h3>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-950">
              {t('calibracaoPulverizador.phaseC.requiredTotalFlowShort', 'Débito Total Requerido:')}
            </span>
            <span className="text-xs sm:text-sm font-black font-mono-numbers text-[#114037]">
              {formatLMin(requiredTotalOutputLMin)} L/min
            </span>
          </div>
        </div>

        {/* Seletor de Modo (Bicos Iguais vs Combinação de Bicos) */}
        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => onModeChange('uniform')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center touch-target ${
              isUniform
                ? 'bg-white text-[#114037] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('calibracaoPulverizador.phaseC.modeUniformTitle', 'Bicos Iguais')}
          </button>

          <button
            type="button"
            onClick={() => onModeChange('custom')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center touch-target ${
              !isUniform
                ? 'bg-white text-[#114037] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('calibracaoPulverizador.phaseC.modeCustomTitle', 'Combinação de Bicos')}
          </button>
        </div>

        {/* Seletor do Número de Níveis Ativos / Planeados */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-slate-700">
            {t('calibracaoPulverizador.phaseC.activeLevelsSelectLabel', 'Número de níveis / bicos ativos:')}
          </label>

          <div className="grid grid-cols-5 gap-1.5">
            {levelOptions.map((levels) => {
              const totalNozzles = levels * 2;
              const isSelected = uniformActiveLevels === levels;
              return (
                <button
                  key={levels}
                  type="button"
                  onClick={() => onUniformActiveLevelsChange(levels)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer touch-target ${
                    isSelected
                      ? 'bg-[#114037] text-white shadow-xs font-black'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold'
                  }`}
                >
                  <div className="text-xs font-mono-numbers">{totalNozzles} bicos</div>
                  <div className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    ({levels} níveis)
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* A. MODO BICOS IGUAIS                                                */}
        {/* ------------------------------------------------------------------- */}
        {isUniform && (
          <div className="space-y-4 pt-1">
            {/* Cartão do Bico Único */}
            {uniformSelectedNozzle ? (
              <div className="p-4 rounded-2xl border border-emerald-300/90 bg-emerald-50/40 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {uniformSelectedNozzle.manufacturerName} {uniformSelectedNozzle.model}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      ({uniformSelectedNozzle.colorOrSize})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 mr-1">
                      {t('calibracaoPulverizador.phaseC.nozzleFlowLabel', 'Débito do bico:')}
                    </span>
                    <span className="text-xs sm:text-sm font-black font-mono-numbers text-[#114037]">
                      {hasPressure
                        ? `${formatLMin(
                            calculateEstimatedOutput(
                              uniformSelectedNozzle.nominalOutputLMin,
                              uniformSelectedNozzle.referencePressureBar || uniformSelectedNozzle.pressureBar,
                              workingPressureBar!
                            ) || (requiredOutputPerSideLMin / uniformActiveLevels)
                          )} L/min`
                        : `${formatLMin(requiredOutputPerSideLMin / uniformActiveLevels)} L/min`}
                    </span>
                  </div>
                </div>

                {/* Amostra Horizontal de Cor em Toda a Largura */}
                <div
                  className="w-full h-2.5 rounded-full shadow-2xs"
                  style={{ backgroundColor: getNozzleColorHex(uniformSelectedNozzle.colorOrSize) }}
                  title={`Cor: ${uniformSelectedNozzle.colorOrSize}`}
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t(
                      'calibracaoPulverizador.phaseC.uniformAppliedNote',
                      'Aplicado a todos os níveis ativos e aos dois lados do pulverizador.'
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={onOpenUniformNozzlePicker}
                    className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer touch-target flex items-center gap-1.5 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('calibracaoPulverizador.phaseC.changeNozzleButton', 'Alterar bico')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 text-center space-y-3">
                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                  {t(
                    'calibracaoPulverizador.phaseC.selectUniformNozzlePrompt',
                    'Escolha o modelo de bico a aplicar uniformemente em todos os níveis ativos.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={onOpenUniformNozzlePicker}
                  className="min-h-[48px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-[#114037] hover:bg-[#0d312a] transition-all cursor-pointer shadow-xs inline-flex items-center gap-2 touch-target"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('calibracaoPulverizador.phaseC.selectNozzleButton', 'Selecionar bico')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* B. MODO COMBINAÇÃO DE BICOS (TOPO -> BASE)                         */}
        {/* ------------------------------------------------------------------- */}
        {!isUniform && (
          <div className="space-y-3 pt-1">
            {customConfirmedNozzles.length === 0 ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 text-center space-y-3">
                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                  {t(
                    'calibracaoPulverizador.phaseC.emptyCombinationPrompt',
                    'Construa o perfil de bicos adicionando níveis a partir do topo da copa.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={onAddCustomLevel}
                  className="min-h-[48px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-[#114037] hover:bg-[#0d312a] transition-all cursor-pointer shadow-xs inline-flex items-center gap-2 touch-target"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('calibracaoPulverizador.phaseC.addNozzleButton', 'Adicionar Bico')}</span>
                </button>
              </div>
            ) : (
              <>
                {/* Lista de Níveis Confirmados (Topo para a Base) */}
                <div className="space-y-2.5">
                  {customConfirmedNozzles.map((entry, idx) => {
                    const levelNumber = idx + 1;
                    const isTop = idx === 0;
                    const isBase = idx === customConfirmedNozzles.length - 1 && customConfirmedNozzles.length >= 2;

                    // Débito calculado do bico à pressão dinâmica resultante
                    const nozzleFlow =
                      entry && hasPressure
                        ? calculateEstimatedOutput(
                            entry.nominalOutputLMin,
                            entry.referencePressureBar || entry.pressureBar,
                            workingPressureBar!
                          )
                        : null;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-2.5 animate-fade-in"
                      >
                        {/* Linha Superior: Nível (Topo/Base) e Débito */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-slate-900">
                              Nível {levelNumber}
                            </span>
                            {isTop && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {t('calibracaoPulverizador.phaseC.topLabel', 'Topo')}
                              </span>
                            )}
                            {isBase && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                {t('calibracaoPulverizador.phaseC.baseLabel', 'Base')}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-slate-500 font-medium mr-1">
                              {t('calibracaoPulverizador.phaseC.nozzleFlowLabel', 'Débito do bico:')}
                            </span>
                            <span className="text-xs sm:text-sm font-black font-mono-numbers text-[#114037]">
                              {nozzleFlow !== null ? `${formatLMin(nozzleFlow)} L/min` : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Linha Intermédia: Marca, Modelo e Cor */}
                        {entry ? (
                          <div className="text-xs font-extrabold text-slate-800">
                            {entry.manufacturerName} {entry.model} ({entry.colorOrSize})
                          </div>
                        ) : (
                          <div className="text-xs text-amber-800 italic font-semibold">
                            {t('calibracaoPulverizador.phaseC.nozzlePendingLabel', 'Bico por selecionar')}
                          </div>
                        )}

                        {/* Amostra Horizontal de Cor a Toda a Largura do Cartão */}
                        <div
                          className="w-full h-2.5 rounded-full shadow-2xs"
                          style={{
                            backgroundColor: entry ? getNozzleColorHex(entry.colorOrSize) : '#CBD5E1'
                          }}
                          title={entry ? `Cor: ${entry.colorOrSize}` : 'Sem cor'}
                        />

                        {/* Linha de Ações: Alterar bico e Eliminar Nível */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {customConfirmedNozzles.length > 2 && (
                            <button
                              type="button"
                              onClick={() => onRemoveCustomLevel(idx)}
                              className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer touch-target flex items-center justify-center"
                              title={t('calibracaoPulverizador.phaseC.removeLevelTooltip', 'Remover nível')}
                              aria-label={`Remover Nível ${levelNumber}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenCustomLevelPicker(idx)}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer touch-target flex items-center gap-1.5 shadow-2xs"
                          >
                            {entry ? (
                              <>
                                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                <span>{t('calibracaoPulverizador.phaseC.changeNozzleButton', 'Alterar bico')}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 text-[#114037]" />
                                <span className="text-[#114037] font-black">
                                  {t('calibracaoPulverizador.phaseC.selectNozzleButton', 'Selecionar bico')}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botão [+ Adicionar Bico] abaixo dos níveis (máx 6 níveis = 12 bicos) */}
                {customConfirmedNozzles.length < 6 && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={onAddCustomLevel}
                      className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-[#114037] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2 touch-target"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('calibracaoPulverizador.phaseC.addNozzleButton', 'Adicionar Bico')}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
