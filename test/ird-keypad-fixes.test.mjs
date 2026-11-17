import { registerHooks } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) && context.parentURL?.startsWith('file:')) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      for (const ext of ['.tsx', '.ts']) {
        const candidate = path.join(parentDir, specifier + ext);
        if (fs.existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.json')) {
      const filePath = new URL(url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
      return { format: 'module', source: `export default ${fs.readFileSync(filePath, 'utf8')}`, shortCircuit: true };
    }
    if (url.endsWith('.tsx')) {
      const filePath = new URL(url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
      const out = ts.transpileModule(fs.readFileSync(filePath, 'utf8'), {
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { validateKeypadValue } = await import('../src/components/keypadValidation.ts');
const {
  formatKeypadInitialExpression,
  applyKeypadCharacter,
  applyKeypadBackspace,
  evaluateKeypadExpression,
  getKeypadValidationMessage
} = await import('../src/components/keypad/keypadHelpers.ts');
const { LanguageProvider } = await import('../src/context/LanguageContext.tsx');
const { DaterraKeypadModal } = await import('../src/components/keypad/DaterraKeypadModal.tsx');
const { IRD_KEYPAD_META } = await import('../src/features/ird/irdKeypadMeta.ts');
const { IrdWeatherPanel } = await import('../src/features/ird/IrdWeatherPanel.tsx');

const wrapLang = (node) => renderToStaticMarkup(React.createElement(LanguageProvider, null, node));

describe('IRD & Keypad — Regressão K1-K5 (Sem Browser DOM Real)', () => {
  it('1. K2/K4: vazio distingue-se de zero legítimo; apagar tudo limpa para vazio; negativo em Temperatura gera -5', () => {
    assert.equal(formatKeypadInitialExpression(''), '');
    assert.equal(formatKeypadInitialExpression(undefined), '');
    assert.equal(formatKeypadInitialExpression('0'), '0');
    assert.equal(formatKeypadInitialExpression('3.25'), '3,25');

    assert.equal(applyKeypadBackspace('2'), '');
    assert.equal(applyKeypadBackspace('12'), '1');

    // Temperatura negativa a partir de vazio ou 0
    let expr = applyKeypadCharacter('', '-', true);
    expr = applyKeypadCharacter(expr, '5', true);
    assert.equal(expr, '-5');
    assert.equal(evaluateKeypadExpression(expr).evaluatedResult, -5);
    assert.equal(validateKeypadValue(-5, '-5', false, IRD_KEYPAD_META.temperatureC.rules).isValid, true);

    assert.equal(applyKeypadCharacter('0', '-', true), '-');
    assert.equal(applyKeypadCharacter('', '.', false), '0,');
  });

  it('2. K3: todos os motivos de validação produzem feedback explícito em português; HR aceita 1 decimal (ex: 62,5%)', () => {
    assert.equal(validateKeypadValue(62.5, '62,5', false, IRD_KEYPAD_META.relativeHumidityPct.rules).isValid, true);
    assert.equal(validateKeypadValue(2.25, '2,25', false, IRD_KEYPAD_META.workingPressureBar.rules).isValid, true);

    const reasons = [
      ['empty', 'Introduza um valor.'],
      ['incomplete_expression', 'Conclua o número'],
      ['negative_not_allowed', 'não admite valores negativos'],
      ['decimal_not_allowed', 'números inteiros'],
      ['max_decimals_exceeded', 'casa(s) decimal(is)'],
      ['expressions_not_allowed', 'operadores aritméticos'],
      ['syntax_error', 'inválida']
    ];
    for (const [reason, expected] of reasons) {
      const msg = getKeypadValidationMessage(reason, false, { maxDecimals: 1 }, ' bar', String);
      assert.ok(msg && msg.includes(expected), `Mensagem em falta para ${reason}: ${msg}`);
    }
  });

  it('3. K1/K5: DaterraKeypadModal usa referência estável, role="dialog", Escape/foco, e exibe — quando vazio vs 0 legítimo', () => {
    const emptyModalHtml = wrapLang(React.createElement(DaterraKeypadModal, {
      isOpen: true, onClose: () => {}, initialValue: '', initialUnit: 'bar',
      label: 'Pressão de trabalho', validationRules: IRD_KEYPAD_META.workingPressureBar.rules, onConfirm: () => {}
    }));
    assert.ok(emptyModalHtml.includes('role="dialog"') && emptyModalHtml.includes('aria-modal="true"'));
    assert.ok(emptyModalHtml.includes('>—<') && emptyModalHtml.includes('Sem valor introduzido'));

    const zeroWindHtml = wrapLang(React.createElement(DaterraKeypadModal, {
      isOpen: true, onClose: () => {}, initialValue: '0', initialUnit: 'km/h',
      label: 'Vento médio', validationRules: IRD_KEYPAD_META.windSpeedKmh.rules, onConfirm: () => {}
    }));
    assert.ok(zeroWindHtml.includes('>0<') && zeroWindHtml.includes('0 km/h'));

    const modalSrc = fs.readFileSync(path.resolve('src/components/keypad/DaterraKeypadModal.tsx'), 'utf8');
    assert.ok(modalSrc.includes('EMPTY_UNITS') && modalSrc.includes("e.key === 'Escape'") && modalSrc.includes('triggerElRef'));
    assert.ok(modalSrc.split('\n').length <= 200);
  });

  it('4. K6: IrdWeatherPanel exibe "—" quando precipitação é null e "0 mm" quando é zero legítimo', () => {
    const nullRainHtml = renderToStaticMarkup(React.createElement(IrdWeatherPanel, {
      weather: { windSpeedKmh: 5, windGustsKmh: 7, temperatureC: 20, relativeHumidityPct: 60, precipitationMm: null, weatherSource: 'manual_field', weatherAgeMinutes: 0 },
      isOffline: false, isWeatherLoading: false, weatherError: null, locationName: 'Viseu',
      onChangeSource: () => {}, onRefreshWeather: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(nullRainHtml.includes('>—<') && !nullRainHtml.includes('0 mm'));

    const zeroRainHtml = renderToStaticMarkup(React.createElement(IrdWeatherPanel, {
      weather: { windSpeedKmh: 5, windGustsKmh: 7, temperatureC: 20, relativeHumidityPct: 60, precipitationMm: 0, weatherSource: 'manual_field', weatherAgeMinutes: 0 },
      isOffline: false, isWeatherLoading: false, weatherError: null, locationName: 'Viseu',
      onChangeSource: () => {}, onRefreshWeather: () => {}, onOpenKeypad: () => {}
    }));
    assert.ok(zeroRainHtml.includes('0 mm'));
  });

  it('5. CSP-safe: evaluateKeypadExpression substitui Function/eval, respeita precedência, parênteses, unários e rejeita entradas inválidas', () => {
    const src = fs.readFileSync(path.resolve('src/components/keypad/keypadHelpers.ts'), 'utf8');
    assert.ok(!/\beval\s*\(|new\s+Function\b|Function\s*\(/.test(src), 'keypadHelpers.ts não pode usar eval nem Function');
    assert.ok(!src.includes('unsafe-eval'));
    assert.ok(!fs.readFileSync(path.resolve('index.html'), 'utf8').includes('unsafe-eval'));

    assert.equal(evaluateKeypadExpression('2+3*4').evaluatedResult, 14);
    assert.equal(evaluateKeypadExpression('(2+3)*4').evaluatedResult, 20);
    assert.equal(evaluateKeypadExpression('10-3-2').evaluatedResult, 5);
    assert.equal(evaluateKeypadExpression('8/2/2').evaluatedResult, 2);
    assert.equal(evaluateKeypadExpression('2,5 * 2').evaluatedResult, 5);
    assert.equal(evaluateKeypadExpression('--5').evaluatedResult, 5);
    assert.equal(evaluateKeypadExpression('+3,5').evaluatedResult, 3.5);

    for (const bad of ['1/0', '2+(3', '2+3)', '()', '1..2', '1,2,3', 'alert(1)', '2abc', '5++']) {
      const r = evaluateKeypadExpression(bad);
      assert.equal(r.evalError, true, `Entrada inválida devia dar evalError: ${bad}`);
    }
  });
});
