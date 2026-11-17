import 'fake-indexeddb/auto';
import { registerHooks } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.(tsx?|jsx?|mjs|cjs|json)$/i.test(specifier) && context.parentURL?.startsWith('file:')) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      for (const ext of ['.tsx', '.ts']) {
        const candidate = path.join(parentDir, specifier + ext);
        if (fs.existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.tsx')) {
      const filePath = new URL(url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
      const src = fs.readFileSync(filePath, 'utf8');
      const out = ts.transpileModule(src, {
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { BLOCKED_TOOL_IDS_IN_PAGES, resolveReleaseRoute } = await import('../src/utils/releasePolicy.ts');
const { isIrdEnabledForEnv } = await import('../src/utils/releasePolicyRoutes.ts');
const { IRD_LEGAL_DISCLAIMER } = await import('../src/features/ird/irdConfig.ts');
const { NOZZLES_DATABASE } = await import('../src/features/nozzle-comparison/nozzleComparison.data.ts');
const { calculateDriftRiskIndex } = await import('../src/features/ird/irdEngine.ts');
const { resolveNozzleDriftProfile } = await import('../src/features/ird/irdNozzleAdapter.ts');
const { saveIrdAssessment, listIrdHistory, softDeleteIrdAssessment } = await import('../src/features/ird/irdHistoryAdapter.ts');
const { DaterraDatabase } = await import('../src/db/db.ts');
const { IrdResultCard } = await import('../src/features/ird/IrdResultCard.tsx');
const { IrdLevelProgressionCard } = await import('../src/features/ird/IrdLevelProgressionCard.tsx');
const { IrdActionFooter } = await import('../src/features/ird/IrdActionFooter.tsx');
const { IrdPersistentResultSummary } = await import('../src/features/ird/IrdPersistentResultSummary.tsx');
const { buildIrdPrimaryMessage, buildIrdSaveAvailability } = await import('../src/features/ird/irdPresentationHelper.ts');
const { IrdWeatherPanel } = await import('../src/features/ird/IrdWeatherPanel.tsx');
const { IrdDropletPanel } = await import('../src/features/ird/IrdDropletPanel.tsx');
const { IrdHistoryModal } = await import('../src/features/ird/IrdHistoryModal.tsx');
const { IrdGuideModal } = await import('../src/features/ird/IrdGuideModal.tsx');

const baseInput = (overrides = {}) => ({
  weather: { windSpeedKmh: 7, windGustsKmh: 9, temperatureC: 21, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'open_meteo_cache', weatherAgeMinutes: 10, ...overrides.weather },
  nozzle: { nozzleType: 'Fenda', dropletClass: 'M', referencePressureBar: 3, pressureMinBar: 1.5, pressureMaxBar: 5, workingPressureBar: 3, hasAirSleeve: false, ...overrides.nozzle },
  operation: { applicationDomain: 'horizontal_boom', travelSpeedKmh: 6, boomOrReleaseHeightM: 0.5, ...overrides.operation },
  exposure: { distanceToSensitiveAreaM: 20, labelMinBufferM: 5, hasDownwindSensitiveTarget: false, ...overrides.exposure }
});

describe('IRD — UI Modular, Estados, Acessibilidade, Gating e Offline', () => {
  it('1. Todos os ficheiros IRD e App.tsx respeitam <= 200 LOC, PT-PT, zero emojis e zero termos proibidos', () => {
    const uiFiles = [
      'IrdCalculatorView.tsx', 'useIrdCalculatorController.ts', 'IrdMeteoChips.tsx',
      'IrdLevelProgressionCard.tsx', 'IrdQuickEvalPanel.tsx', 'IrdQuickExposureStep.tsx',
      'IrdProfilesOnlyPanel.tsx', 'IrdNozzleCascadeField.tsx', 'IrdCertifiedReductionPanel.tsx',
      'IrdQuickAccordions.tsx', 'IrdPreSaveSummary.tsx', 'irdPreSaveBuilder.ts', 'irdGuideSections.ts',
      'IrdWeatherPanel.tsx', 'IrdDropletPanel.tsx', 'IrdResultCard.tsx', 'IrdCalcExplanation.tsx',
      'irdExplanationNotes.ts', 'IrdHistoryModal.tsx', 'IrdGuideModal.tsx', 'irdProfileMappers.ts',
      'irdContextResolver.ts', 'irdContextCopies.ts', 'irdOriginTypes.ts', 'irdWeatherBridge.ts',
      'irdKeypadMeta.ts', 'irdHistorySnapshot.ts', 'irdHistoryTraceReader.ts', 'irdNozzleAdapter.ts',
      'irdPresentationHelper.ts', 'irdGuideContextBuilder.ts', 'IrdPersistentResultSummary.tsx', 'IrdActionFooter.tsx'
    ];
    for (const f of uiFiles) {
      const content = fs.readFileSync(path.resolve('src/features/ird', f), 'utf8');
      const lines = content.split('\n').length;
      assert.ok(lines <= 200, `${f} excede 200 linhas (${lines})`);
      assert.ok(!/\bcuba\b/i.test(content) && !/\bPF\b/.test(content), `${f} viola vocabulário PT-PT`);
      const visibleContent = f === 'irdHistorySnapshot.ts' ? content.replace(/'dgav_sifito_disclaimer'/g, '') : content;
      assert.ok(!/DGAV|SIFITO|cat[aá]logo oficial/i.test(visibleContent), `${f} contém termo proibido`);
      assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(content), `${f} não deve conter emojis`);
      assert.ok(!content.includes('firebase/firestore') && !content.includes('outboxService'), `${f} não pode chamar Firestore ou Outbox`);
    }
    assert.ok(fs.readFileSync(path.resolve('src/App.tsx'), 'utf8').split('\n').length <= 200);
    assert.ok(!/DGAV|SIFITO/i.test(IRD_LEGAL_DISCLAIMER.statementPt));
  });

  it('2. Renderiza loading, Nível 1 só meteorologia, Nível 2 incompleto, crítico (sem Bloqueado isolado), calculado, rodapé e resumo sticky', () => {
    const loadingHtml = renderToStaticMarkup(React.createElement(IrdResultCard, { result: null, isLoading: true }));
    assert.ok(loadingHtml.includes('aria-busy="true"') && loadingHtml.includes('role="status"'));

    const meteoEvalValid = {
      status: 'VALID', validity: 'valid_complete', score: 22, band: 'BAIXO', bandLabelPt: 'Baixo',
      dominantFactorPt: 'Vento moderado', windKmh: 7, gustsKmh: 9, deltaTC: 4.5, humidityPct: 60, precipMm: 0,
      isCalmInversionSuspected: false, isEligibleForFavorableWindow: true
    };
    const level1Html = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level1_meteo', result: null, isLoading: false, weatherEval: meteoEvalValid,
      weatherSummary: { sourceLabel: 'API Open-Meteo', locationName: 'Santarém', isStaleCache: false }
    }));
    assert.ok(level1Html.includes('1. Só Meteorologia') && level1Html.includes('Escala 10–100') && !level1Html.includes('Heurístico'));
    assert.ok(level1Html.includes('22') && !level1Html.includes('Espectro (30%)'));
    const progHtml = renderToStaticMarkup(React.createElement(IrdLevelProgressionCard, {
      currentLevel: 'level1_meteo', isLoggedIn: true, hasWeatherValid: true, onSelectLevel: () => {}
    }));
    assert.ok(progHtml.includes('Avaliação rápida — 3 variáveis mínimas') && progHtml.includes('Avaliação detalhada — usar perfis'));

    const incompleteRes = calculateDriftRiskIndex(baseInput({ nozzle: { workingPressureBar: null } }));
    const emptyHtml = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level2_quick', result: incompleteRes, isLoading: false, missingOperationalFields: ['pressão (bar)']
    }));
    assert.ok(emptyHtml.includes('—') && emptyHtml.includes('Avaliação indisponível') && !/>0<\//.test(emptyHtml));
    assert.ok(emptyHtml.includes('role="alert"') && emptyHtml.includes('pressão (bar)') && !/\bBloqueado\b/i.test(emptyHtml));

    const blockedRes = calculateDriftRiskIndex(baseInput({ weather: { precipitationMm: 1.2 } }));
    const blockedHtml = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level2_quick', result: blockedRes, isLoading: false, onOpenGuideTopic: () => {}
    }));
    assert.ok(blockedHtml.includes('role="alert"') && blockedHtml.includes('Risco Crítico') && blockedHtml.includes('Condições inadequadas para pulverizar'));
    assert.ok(!/\bBloqueado\b|Bloqueio Ativo/i.test(blockedHtml) && !/DGAV|SIFITO/i.test(blockedHtml));

    const normalRes = calculateDriftRiskIndex(baseInput());
    assert.ok(normalRes.warnings.every((w) => !/DGAV|SIFITO/i.test(w.messagePt)));
    const normalHtml = renderToStaticMarkup(React.createElement(IrdResultCard, {
      evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_manual', result: normalRes, isLoading: false,
      weatherSummary: { sourceLabel: 'API Open-Meteo', locationName: 'Santarém', isStaleCache: false }
    }));
    assert.ok(normalHtml.includes('2. Rápida (Manual)') && normalHtml.includes('Escala 1–100') && normalHtml.includes(String(normalRes.irdScore)));
    assert.ok(!normalHtml.includes('Resumo antes de guardar') && !normalHtml.includes('Explicação do cálculo'));

    // Prioridade crítica sobre falta de bico + disponibilidade do rodapé com 3 ações
    const critNoNozzleRes = calculateDriftRiskIndex(baseInput({
      weather: { windGustsKmh: 30 },
      nozzle: { nozzleType: undefined, dropletClass: undefined, workingPressureBar: 3 }
    }));
    const pMsg = buildIrdPrimaryMessage({ evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_partial', result: critNoNozzleRes, weatherEval: meteoEvalValid });
    assert.equal(pMsg.kind, 'critical');
    assert.match(pMsg.text, /rajadas acima do limite do índice/);
    assert.doesNotMatch(pMsg.text, /faltam dados do bico/);

    const footerHtml = renderToStaticMarkup(React.createElement(IrdActionFooter, {
      saveAvailability: buildIrdSaveAvailability('u1', 'level2_quick', critNoNozzleRes), historyCount: 2, onSave: () => {}, onOpenHistory: () => {}, onOpenGuide: () => {}
    }));
    assert.ok(footerHtml.includes('Guardar') && footerHtml.includes('Histórico') && footerHtml.includes('Guia Técnico') && !footerHtml.includes('disabled=""'));

    const footerNoAuthHtml = renderToStaticMarkup(React.createElement(IrdActionFooter, {
      saveAvailability: buildIrdSaveAvailability(null, 'level2_quick', normalRes), historyCount: 0, onSave: () => {}, onOpenHistory: () => {}, onOpenGuide: () => {}
    }));
    assert.ok(footerNoAuthHtml.includes('Inicie sessão para guardar a avaliação.') && footerNoAuthHtml.includes('disabled=""'));

    const keypadStripHtml = renderToStaticMarkup(React.createElement(IrdPersistentResultSummary, {
      evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_manual', result: normalRes, weatherEval: meteoEvalValid,
      blockingGapsCount: 0, primaryMsg: { kind: 'ok', text: '', hasMoreDetails: false }, isPartial: false, visibleOnScroll: false, keypadEditingLabel: 'Pressão de trabalho (bar)'
    }));
    assert.ok(keypadStripHtml.includes(String(normalRes.irdScore)) && keypadStripHtml.includes('A editar:') && keypadStripHtml.includes('Confirme com OK para recalcular'));

    // Resumo persistente funciona também em desktop (sem lg:hidden), mostra "—" quando indisponível e vista fica em coluna única
    const scrollDesktopHtml = renderToStaticMarkup(React.createElement(IrdPersistentResultSummary, {
      evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_partial', result: incompleteRes, weatherEval: meteoEvalValid,
      blockingGapsCount: 1, primaryMsg: { kind: 'incomplete', text: 'Preencha pressão.', hasMoreDetails: false }, isPartial: false, visibleOnScroll: true
    }));
    assert.ok(!scrollDesktopHtml.includes('lg:hidden') && scrollDesktopHtml.includes('—') && scrollDesktopHtml.includes('Indisponível'));

    const viewSrc = fs.readFileSync(path.resolve('src/features/ird/IrdCalculatorView.tsx'), 'utf8');
    assert.ok(!viewSrc.includes('lg:grid-cols-[') && !viewSrc.includes('lg:sticky') && !viewSrc.includes('lg:order-'));
    assert.ok(viewSrc.indexOf('<IrdResultCard') < viewSrc.indexOf('<IrdQuickEvalPanel'));
    assert.ok(fs.readFileSync(path.resolve('src/features/ird/useIrdCalculatorController.ts'), 'utf8').includes('setStatusToast(null)'));
  });

  it('3. Painéis de meteorologia e espectro de gotas com acessibilidade e cache expirada', () => {
    const validW = renderToStaticMarkup(React.createElement(IrdWeatherPanel, {
      weather: baseInput().weather, isOffline: true, isWeatherLoading: false, weatherError: null, locationName: 'Viseu',
      onChangeSource: () => {}, onRefreshWeather: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(validW.includes('Cache válida') && validW.includes('Dispositivo Offline') && validW.includes('for="ird-meteo-source"'));

    const expiredW = renderToStaticMarkup(React.createElement(IrdWeatherPanel, {
      weather: baseInput({ weather: { weatherAgeMinutes: 40 } }).weather, isOffline: true, isWeatherLoading: false, weatherError: null, locationName: 'Viseu',
      onChangeSource: () => {}, onRefreshWeather: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(expiredW.includes('Cache expirada') && expiredW.includes('confirmar no campo'));

    const dropOpen = renderToStaticMarkup(React.createElement(IrdDropletPanel, {
      isOpen: true, mode: 'rotary', nozzle: { workingPressureBar: 3, representativeDropletDiameterUm: 280, measurementSource: 'manufacturer_spec' },
      resolvedProfile: resolveNozzleDriftProfile({ workingPressureBar: 3, representativeDropletDiameterUm: 280, measurementSource: 'manufacturer_spec', nozzleType: 'rotativo' }, 3),
      onToggleOpen: () => {}, onModeChange: () => {}, onChangeFields: () => {}, onOpenKeypad: () => {}, onClear: () => {}
    }));
    assert.ok(dropOpen.includes('aria-expanded="true"') && dropOpen.includes('Modo A: Bico rotativo') && dropOpen.includes('for="ird-rep-diam"'));
  });

  it('4. Guia Técnico, nomenclatura sem tokens internos, múltiplas causas críticas, Histórico, isolamento e gating', async () => {
    const guideHtml = renderToStaticMarkup(React.createElement(IrdGuideModal, { isOpen: true, onClose: () => {} }));
    assert.ok(guideHtml.includes('aria-modal="true"') && guideHtml.includes('Guia Técnico — Índice de Risco de Deriva') && guideHtml.includes('Fechar Guia Técnico'));
    assert.ok(guideHtml.includes('Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico.') && guideHtml.includes('ISO 22866'));
    assert.ok(!/DGAV|SIFITO|local_only|calculation_history_v2/i.test(guideHtml));

    const multiCritRes = calculateDriftRiskIndex(baseInput({ weather: { precipitationMm: 1.5, windGustsKmh: 30, temperatureC: 35, relativeHumidityPct: 20 } }));
    const multiMsg = buildIrdPrimaryMessage({ evaluationLevel: 'level2_quick', assessmentLevelSnapshot: 'quick_manual', result: multiCritRes });
    assert.equal(multiMsg.kind, 'critical');
    assert.match(multiMsg.text, /\(\+\d+ outras? condiç(ão|ões) crítica/);

    for (const cleanFile of ['IrdCalculatorView.tsx', 'IrdResultCard.tsx', 'IrdGuideModal.tsx', 'irdGuideSections.ts', 'IrdActionFooter.tsx', 'IrdPersistentResultSummary.tsx', 'useIrdCalculatorController.ts']) {
      const src = fs.readFileSync(path.resolve('src/features/ird', cleanFile), 'utf8');
      assert.ok(!src.includes('calculation_history_v2') && !src.includes('local_only'), `${cleanFile} expõe identificador interno`);
    }
    assert.ok(fs.readFileSync(path.resolve('src/features/ird/useIrdCalculatorController.ts'), 'utf8').includes('Avaliação guardada neste dispositivo.'));

    const tempDb = new DaterraDatabase(`DaterraUI_${Date.now()}`);
    await tempDb.open();
    const resA = calculateDriftRiskIndex(baseInput(), NOZZLES_DATABASE[0]);
    await saveIrdAssessment('ui-user-a', baseInput(), resA, { name: 'Vinha Teste' }, tempDb);
    const listA = await listIrdHistory('ui-user-a', tempDb);
    assert.equal(listA.length, 1);
    assert.equal((await listIrdHistory('ui-user-b', tempDb)).length, 0);

    const histHtml = renderToStaticMarkup(React.createElement(IrdHistoryModal, { isOpen: true, records: listA, isLoading: false, userId: 'ui-user-a', onClose: () => {}, onDelete: () => {} }));
    assert.ok(histHtml.includes('aria-modal="true"') && histHtml.includes('Vinha Teste') && !/DGAV|SIFITO/i.test(histHtml));
    assert.equal(await softDeleteIrdAssessment(listA[0].id, 'ui-user-a', tempDb), true);
    await tempDb.delete();

    assert.equal(BLOCKED_TOOL_IDS_IN_PAGES.has('calc_ird'), true);
    assert.equal(resolveReleaseRoute('/ferramentas/risco-deriva', '', 'pages').status, 'blocked');
    assert.equal(resolveReleaseRoute('/ferramentas/risco-deriva', '', 'staging').status, 'allowed');
    assert.equal(resolveReleaseRoute('/ferramentas/risco-deriva', '', 'development').status, 'allowed');
    assert.equal(isIrdEnabledForEnv('development'), true);
    assert.equal(isIrdEnabledForEnv('staging'), true);
    assert.equal(isIrdEnabledForEnv('pages'), false);
    assert.ok(fs.readFileSync(path.resolve('src/App.tsx'), 'utf8').includes('isIrdEnabledForEnv(getDaterraEnvironment()) ? <IrdCalculatorView />'));
  });
});
