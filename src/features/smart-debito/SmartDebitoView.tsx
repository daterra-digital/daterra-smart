/**
 * DATERRA Smart - Ferramenta "Smart Débito (ISO 16122)"
 * Ficheiro: src/features/smart-debito/SmartDebitoView.tsx
 *
 * Ferramenta oficial para auditoria de pulverizadores e validação de débitos
 * segundo a norma ISO 16122 (ISO 16122-2 culturas baixas e ISO 16122-3 culturas 3D/arbóreas).
 *
 * ESTRUTURA REFORMULADA:
 * - Cartão Superior Unificado em Largura Total (SmartDebitoTopCard):
 *   - Seletor de Modo: "Grelha de Bicos" vs "Gráfico"
 *   - Parâmetros de Ensaio (Norma, Bicos da Barra/Níveis, Pressão P2, Bico Padrão)
 *   - Importação de Medições de Caudolímetro (.txt)
 *   - Veredito ISO 16122 (Desvios e Assimetria Bilateral)
 *   - Exportação Pericial PDF e Ações Rápidas (Demo / Limpar)
 * - Cartão Agregador Mestre: "Registo de Débitos Medidos":
 *   - Minimapa Permanente da Barra Horizontal (Vista Traseira Oficial) com sinalizador ativo em tempo real
 *   - Distribuição em 2 colunas equilibradas:
 *     - ISO 16122-2 (Culturas Baixas): Secção Esquerda (N1 a Nx) e Secção Direita (Nx+1 a N2x)
 *     - ISO 16122-3 (Culturas 3D): Lado Esquerdo e Lado Direito
 *   - No mobile: alternância intuitiva entre Secção Esquerda e Secção Direita
 * - Modo "Gráfico":
 *   - Gráfico vetorial ("Perfil de Distribuição de Débitos") exibido em largura total
 *
 * REGRAS ESTRITAS DE NOMENCLATURA:
 * - Termos estritamente interditos excluídos de todo o código e UI.
 * - A palavra "caudal" está INTERDITA na UI; utilizar sempre e exclusivamente "débito".
 * - Termo estrito para visualização gráfica: exclusivamente "Gráfico".
 * - Em Portugal, utilizar "Secção" em vez de "Asa" e "Setor Único" em vez de "Barra Única".
 */

import React, { useReducer, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import {
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Droplet,
  RotateCcw,
  FileText,
  Loader2,
  ChevronDown
} from 'lucide-react';

import type { NozzleCatalogRef, SlotKey } from './types';
import { smartDebitoReducer, createInitialSmartDebitoState } from './smartDebitoReducer';
import { evaluateSmartDebitoMachine } from './smartDebitoCalculations';
import { SmartDebitoCell } from './components/SmartDebitoCell';
import { SmartDebitoTopCard } from './components/SmartDebitoTopCard';
import { SmartDebitoGrafico } from './components/SmartDebitoGrafico';
import { SmartDebitoBoomMinimap } from './components/SmartDebitoBoomMinimap';
import { SmartDebitoHelpModal } from './components/SmartDebitoHelpModal';
import { SmartDebitoFooter } from './components/SmartDebitoFooter';
import {
  exportSmartDebitoPdf,
  deductAuditCredit,
  checkInternetConnectivity
} from './services/smartDebitoPdfExport';

export const SmartDebitoView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 1. Gestão de Estado Normalizado com useReducer
  const [state, dispatch] = useReducer(
    smartDebitoReducer,
    7, // 7 níveis de fábrica = 14 bicos
    createInitialSmartDebitoState
  );

  // 2. Cálculos Hidráulicos e Veredito Reativos (ISO 16122)
  const { evaluations, verdict } = useMemo(() => {
    return evaluateSmartDebitoMachine(state.slots, state.testPressureBar, state.standard);
  }, [state.slots, state.testPressureBar, state.standard]);

  // 3. Estado da Interface e Vistas
  const [activeView, setActiveView] = useState<'bicos' | 'grafico'>('bicos');
  const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [focusedSlotKey, setFocusedSlotKey] = useState<string | null>(null);
  const [isLeftSectionOpen, setIsLeftSectionOpen] = useState(true);
  const [isRightSectionOpen, setIsRightSectionOpen] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfToast, setPdfToast] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Handler de Exportação Oficial de PDF
  const handleExportPdf = async () => {
    setPdfToast(null);
    setIsExportingPdf(true);
    try {
      const isOnline = await checkInternetConnectivity();
      if (!isOnline) {
        setPdfToast({
          type: 'error',
          text: t(
            'smartDebito.offlineBlock',
            'Exportação bloqueada: Sem ligação à internet. A emissão de relatórios oficiais requer conectividade ativa.'
          )
        });
        setIsExportingPdf(false);
        return;
      }

      const isPremiumExport = (state.isPremiumUser && state.availableCredits > 0) || state.coBranding.isEnabled;
      if (state.isPremiumUser && state.availableCredits > 0) {
        await deductAuditCredit();
        dispatch({ type: 'DEDUCT_CREDIT' });
      }

      await exportSmartDebitoPdf({
        state,
        verdict,
        evaluations,
        isPremium: isPremiumExport
      });

      setPdfToast({
        type: 'success',
        text: isPremiumExport
          ? t('smartDebito.premiumSuccess', 'Relatório Premium emitido com sucesso (com Co-Branding oficial).')
          : t('smartDebito.freemiumSuccess', 'Relatório emitido em modo Freemium com marca de água.')
      });
    } catch (err: any) {
      setPdfToast({
        type: 'error',
        text: err?.message || t('smartDebito.exportError', 'Ocorreu um erro ao gerar o relatório PDF.')
      });
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setPdfToast(null), 7000);
    }
  };

  // Lista de chaves ordenadas por nível e unificada para navegação por "Enter"
  const { leftSlotKeys, rightSlotKeys, allSequentialSlotKeys } = useMemo(() => {
    const left: SlotKey[] = [];
    const right: SlotKey[] = [];
    for (let lvl = 1; lvl <= state.numLevels; lvl++) {
      left.push(`${lvl}-left`);
      right.push(`${lvl}-right`);
    }
    return {
      leftSlotKeys: left,
      rightSlotKeys: right,
      allSequentialSlotKeys: [...left, ...right]
    };
  }, [state.numLevels]);

  const handleEnterNextNozzle = (currentKey: SlotKey) => {
    const currentIndex = allSequentialSlotKeys.indexOf(currentKey);
    if (currentIndex === -1 || currentIndex >= allSequentialSlotKeys.length - 1) {
      return; // Último bico da máquina
    }

    const nextKey = allSequentialSlotKeys[currentIndex + 1];
    const isNextInRight = rightSlotKeys.includes(nextKey);

    // Garantir que o acordeão da secção do próximo bico está aberto
    if (isNextInRight) {
      if (!isRightSectionOpen) setIsRightSectionOpen(true);
      setMobileSide('right');
    } else {
      if (!isLeftSectionOpen) setIsLeftSectionOpen(true);
      setMobileSide('left');
    }

    setFocusedSlotKey(nextKey);

    // Focar o campo input do próximo bico e selecionar todo o conteúdo para digitação contínua
    setTimeout(() => {
      const nextInput = document.getElementById(`nozzle-input-${nextKey}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }, 60);
  };

  // Handler de seleção interativa de bico no minimapa
  const handleSelectNozzle = (slotKey: string) => {
    if (slotKey.endsWith('-right')) {
      setMobileSide('right');
    } else if (slotKey.endsWith('-left')) {
      setMobileSide('left');
    }
    setFocusedSlotKey(slotKey);
    const el = document.getElementById(`nozzle-cell-${slotKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2] text-slate-800">
      {/* Barra Superior / Header Ultra-Compacto */}
      <header className="sticky top-0 z-30 bg-daterra-primary text-white shadow-md border-b border-daterra-secondary/40 py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Botão Voltar + Título da Ferramenta */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/ferramentas')}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
              title={t('common.backToTools', 'Voltar às ferramentas')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-daterra-accent text-white rounded">
                  ISO 16122
                </span>
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight">
                  {t('smartDebito.title', 'Smart Débito (ISO 16122)')}
                </h1>
              </div>
              <p className="text-[10px] text-slate-300 hidden sm:block">
                {t('smartDebito.subtitle', 'Auditoria de Pulverizadores · Validação de Débitos e Simetria Bilateral')}
              </p>
            </div>
          </div>

          {/* Veredito Compacto no Topo + Botão de Ajuda / Microlearning */}
          <div className="flex items-center gap-2">
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                verdict.overallVerdict === 'CONFORME_ISO_16122'
                  ? 'bg-emerald-500/90 text-white'
                  : verdict.overallVerdict === 'NAO_CONFORME_ISO_16122'
                  ? 'bg-rose-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}
            >
              {verdict.overallVerdict === 'CONFORME_ISO_16122' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : verdict.overallVerdict === 'NAO_CONFORME_ISO_16122' ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <Droplet className="w-3.5 h-3.5" />
              )}
              <span>
                {verdict.overallVerdict === 'CONFORME_ISO_16122'
                  ? t('smartDebito.isoCompliant', 'Conforme ISO')
                  : verdict.overallVerdict === 'NAO_CONFORME_ISO_16122'
                  ? t('smartDebito.isoNonCompliant', 'Não Conforme')
                  : t('common.pending', 'Pendente')}
              </span>
            </div>

            {/* Botão de Ajuda Técnico / Guia */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="py-1.5 px-2.5 bg-daterra-accent hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer touch-target"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.guide', 'Guia Técnico')}</span>
              <span className="sm:hidden">{t('common.guideShort', 'Guia')}</span>
            </button>
          </div>
        </div>

        {/* Abas Rápidas no Mobile quando na vista de Bicos */}
        {activeView === 'bicos' && (
          <div className="flex md:hidden items-center justify-between gap-1.5 pt-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setMobileSide('left')}
              className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg transition-all ${
                mobileSide === 'left'
                  ? 'bg-white text-daterra-primary shadow-xs'
                  : 'text-slate-300 hover:text-white bg-white/10'
              }`}
            >
              {state.standard === 'ISO_16122_2'
                ? `Secção Esq. (${verdict.leftTotalMeasured} l/min)`
                : `Lado Esq. (${verdict.leftTotalMeasured} l/min)`}
            </button>

            <button
              type="button"
              onClick={() => setMobileSide('right')}
              className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg transition-all ${
                mobileSide === 'right'
                  ? 'bg-white text-daterra-primary shadow-xs'
                  : 'text-slate-300 hover:text-white bg-white/10'
              }`}
            >
              {state.standard === 'ISO_16122_2'
                ? `Secção Dir. (${verdict.rightTotalMeasured} l/min)`
                : `Lado Dir. (${verdict.rightTotalMeasured} l/min)`}
            </button>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col">
        {/* 1. CARTÃO SUPERIOR UNIFICADO DE LARGURA TOTAL (Parâmetros, Ingestão, Veredito, Exportação e Switch de Vista) */}
        <SmartDebitoTopCard
          state={state}
          verdict={verdict}
          evaluations={evaluations}
          dispatch={dispatch}
          activeView={activeView}
          onViewChange={setActiveView}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* 2. ÁREA DE VISUALIZAÇÃO CONDICIONAL */}
        {activeView === 'grafico' ? (
          /* ============================================================== */
          /* MODO GRÁFICO: LARGURA TOTAL SEM BARRAS DE DESLOCAÇÃO DE TELA  */
          /* ============================================================== */
          <div className="w-full flex-1 flex flex-col items-center">
            <SmartDebitoGrafico
              standard={state.standard}
              numLevels={state.numLevels}
              slots={state.slots}
              evaluations={evaluations}
              testPressureBar={state.testPressureBar}
            />
          </div>
        ) : (
          /* ============================================================== */
          /* MODO GRELHA DE BICOS: CARTÃO AGREGADOR "REGISTO DE DÉBITOS MEDIDOS" */
          /* ============================================================== */
          <div className="w-full bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs flex flex-col mb-6">
            {/* Cabeçalho do Cartão Agregador com Botões Limpar e Emitir PDF */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-daterra-primary" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                    Registo de Débitos Medidos
                  </h2>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  {state.standard === 'ISO_16122_2'
                    ? `Barra Horizontal · Vista Traseira (${state.numLevels * 2} bicos totais: Secção Esquerda e Secção Direita)`
                    : `Distribuição Bilateral · Turbopulverizador (${state.numLevels * 2} bicos totais: Lado Esquerdo e Lado Direito)`}
                </p>
              </div>

              {/* Contadores e Botões de Ação no Cabeçalho */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs w-full sm:w-auto justify-start sm:justify-end">
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-semibold border border-slate-200 text-[11px]">
                  <span>{t('smartDebito.measurement', 'Medição:')}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {verdict.measuredNozzleCount} / {verdict.activeNozzleCount} {t('common.nozzles', 'bicos')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
                  <span>{t('common.total', 'Total:')}</span>
                  <span className="font-bold text-emerald-950 font-mono">
                    {verdict.totalMeasured} l/min
                  </span>
                </div>

                <div className="hidden sm:block h-5 w-px bg-slate-300" />

                {/* Botão Limpar */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'CLEAR_MEASUREMENTS' })}
                  title={t('smartDebito.clearAllTooltip', 'Limpar todos os débitos medidos')}
                  className="h-8 px-2.5 text-xs font-bold bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('common.clear', 'Limpar')}</span>
                </button>

                {/* Botão Emitir Relatório PDF */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  title={t('smartDebito.exportPdfTooltip', 'Emitir relatório pericial oficial em PDF')}
                  className="h-8 px-3 text-xs font-black bg-[#114037] hover:bg-daterra-primary-hover text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                      <span>{t('smartDebito.exporting', 'A emitir...')}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-white" />
                      <span>{t('smartDebito.exportPdf', 'Emitir Relatório PDF')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Notificação Toast do PDF (se existir) */}
            {pdfToast && (
              <div
                className={`mb-3 p-2 rounded-xl text-xs flex items-center justify-between border ${
                  pdfToast.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span>{pdfToast.text}</span>
                <button
                  type="button"
                  onClick={() => setPdfToast(null)}
                  className="text-xs font-bold px-1.5 py-0.5 rounded hover:bg-black/10"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Minimapa Permanente da Barra Horizontal com Sinalizador Ativo em Tempo Real */}
            {state.standard === 'ISO_16122_2' && (
              <SmartDebitoBoomMinimap
                numLevels={state.numLevels}
                slots={state.slots}
                evaluations={evaluations}
                activeSlotKey={focusedSlotKey}
                onSelectNozzle={handleSelectNozzle}
              />
            )}

            {/* Abas Rápidas no Mobile quando na vista de Bicos */}
            <div className="flex md:hidden items-center justify-between gap-1.5 mb-3 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMobileSide('left')}
                className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg transition-all ${
                  mobileSide === 'left'
                    ? 'bg-white text-daterra-primary shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {state.standard === 'ISO_16122_2'
                  ? `Secção Esq. (${verdict.leftTotalMeasured} l/min)`
                  : `Lado Esq. (${verdict.leftTotalMeasured} l/min)`}
              </button>

              <button
                type="button"
                onClick={() => setMobileSide('right')}
                className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg transition-all ${
                  mobileSide === 'right'
                    ? 'bg-white text-daterra-primary shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {state.standard === 'ISO_16122_2'
                  ? `Secção Dir. (${verdict.rightTotalMeasured} l/min)`
                  : `Lado Dir. (${verdict.rightTotalMeasured} l/min)`}
              </button>
            </div>

            {/* Grelha de 2 Colunas com Acordeões de Secção */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start">
              {/* ------------------------------------------------------------ */}
              {/* COLUNA ESQUERDA (Secção Esquerda ou Lado Esquerdo)          */}
              {/* ------------------------------------------------------------ */}
              <div
                className={`w-full ${
                  mobileSide === 'left' ? 'block' : 'hidden md:block'
                }`}
              >
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col">
                  {/* Cabeçalho da Coluna Esquerda com Toggle de Acordeão */}
                  <div
                    onClick={() => setIsLeftSectionOpen(!isLeftSectionOpen)}
                    className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                          {state.standard === 'ISO_16122_2' ? 'Secção Esquerda' : 'Lado Esquerdo'}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {state.standard === 'ISO_16122_2'
                            ? `Bicos N1 → N${state.numLevels} · ${state.numLevels} bicos`
                            : `N1 (Topo) → N${state.numLevels} (Base) · ${state.numLevels} bicos`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                          Débito Total
                        </span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-blue-700">
                          {verdict.leftTotalMeasured} l/min
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isLeftSectionOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Lista de Células da Coluna Esquerda (Exibida quando aberta) */}
                  {isLeftSectionOpen && (
                    <div className="space-y-1.5">
                      {leftSlotKeys.map((key) => {
                        const slot = state.slots[key];
                        if (!slot) return null;
                        const evaluation = evaluations[key];

                        return (
                          <SmartDebitoCell
                            key={key}
                            slot={slot}
                            evaluation={evaluation}
                            displayLabel={
                              state.standard === 'ISO_16122_2'
                                ? `N${slot.level}`
                                : `N${slot.level} · Esq`
                            }
                            isFocused={focusedSlotKey === key}
                            onFocus={() => setFocusedSlotKey(key)}
                            onUpdate={(updates) =>
                              dispatch({
                                type: 'UPDATE_SLOT',
                                payload: { id: key, updates }
                              })
                            }
                            onToggleActive={() =>
                              dispatch({
                                type: 'TOGGLE_SLOT_ACTIVE',
                                payload: { id: key }
                              })
                            }
                            onApplyToAll={(nozzle: NozzleCatalogRef) =>
                              dispatch({
                                type: 'APPLY_NOZZLE_TO_ALL',
                                payload: nozzle
                              })
                            }
                            onCopyPrevious={() =>
                              dispatch({
                                type: 'COPY_PREVIOUS_NOZZLE',
                                payload: { targetId: key }
                              })
                            }
                            onUpdateUnit={(unit) =>
                              dispatch({
                                type: 'UPDATE_SLOT_UNIT',
                                payload: { id: key, unit }
                              })
                            }
                            onApplyUnitToAll={(unit) =>
                              dispatch({
                                type: 'APPLY_UNIT_TO_ALL',
                                payload: unit
                              })
                            }
                            onEnterNext={() => handleEnterNextNozzle(key)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* COLUNA DIREITA (Secção Direita ou Lado Direito)             */}
              {/* ------------------------------------------------------------ */}
              <div
                className={`w-full ${
                  mobileSide === 'right' ? 'block' : 'hidden md:block'
                }`}
              >
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col">
                  {/* Cabeçalho da Coluna Direita com Toggle de Acordeão */}
                  <div
                    onClick={() => setIsRightSectionOpen(!isRightSectionOpen)}
                    className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                          {state.standard === 'ISO_16122_2' ? 'Secção Direita' : 'Lado Direito'}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {state.standard === 'ISO_16122_2'
                            ? `Bicos N${state.numLevels + 1} → N${state.numLevels * 2} · ${state.numLevels} bicos`
                            : `N1 (Topo) → N${state.numLevels} (Base) · ${state.numLevels} bicos`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                          Débito Total
                        </span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700">
                          {verdict.rightTotalMeasured} l/min
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isRightSectionOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Lista de Células da Coluna Direita (Exibida quando aberta) */}
                  {isRightSectionOpen && (
                    <div className="space-y-1.5">
                      {rightSlotKeys.map((key) => {
                        const slot = state.slots[key];
                        if (!slot) return null;
                        const evaluation = evaluations[key];

                        return (
                          <SmartDebitoCell
                            key={key}
                            slot={slot}
                            evaluation={evaluation}
                            displayLabel={
                              state.standard === 'ISO_16122_2'
                                ? `N${state.numLevels + slot.level}`
                                : `N${slot.level} · Dir`
                            }
                            isFocused={focusedSlotKey === key}
                            onFocus={() => setFocusedSlotKey(key)}
                            onUpdate={(updates) =>
                              dispatch({
                                type: 'UPDATE_SLOT',
                                payload: { id: key, updates }
                              })
                            }
                            onToggleActive={() =>
                              dispatch({
                                type: 'TOGGLE_SLOT_ACTIVE',
                                payload: { id: key }
                              })
                            }
                            onApplyToAll={(nozzle: NozzleCatalogRef) =>
                              dispatch({
                                type: 'APPLY_NOZZLE_TO_ALL',
                                payload: nozzle
                              })
                            }
                            onCopyPrevious={() =>
                              dispatch({
                                type: 'COPY_PREVIOUS_NOZZLE',
                                payload: { targetId: key }
                              })
                            }
                            onUpdateUnit={(unit) =>
                              dispatch({
                                type: 'UPDATE_SLOT_UNIT',
                                payload: { id: key, unit }
                              })
                            }
                            onApplyUnitToAll={(unit) =>
                              dispatch({
                                type: 'APPLY_UNIT_TO_ALL',
                                payload: unit
                              })
                            }
                            onEnterNext={() => handleEnterNextNozzle(key)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Ajuda & Microlearning */}
      <SmartDebitoHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Rodapé da Ferramenta */}
      <SmartDebitoFooter />
    </div>
  );
};

export default SmartDebitoView;
