// test/weather-ux-refinement.test.mjs
import { registerHooks } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

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
      const out = ts.transpileModule(fs.readFileSync(filePath, 'utf8'), {
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { isLocalOrOwnedByUser } = await import('../src/features/weather/utils/weatherProfileLoader.ts');
const { getIrdOperationalBand, resolveAcceptableIrdLimit, evaluateHourWithProfileContext } = await import('../src/features/weather/utils/irdOperationalThresholds.ts');
const { WeeklyNowSummaryCard } = await import('../src/features/weather/components/WeeklyNowSummaryCard.tsx');
const { HourlyDetailCard } = await import('../src/features/weather/components/HourlyDetailCard.tsx');
const { WeatherDriftChartSvg } = await import('../src/features/weather/components/charts/WeatherDriftChartSvg.tsx');
const { WeatherIrdGuideCard } = await import('../src/features/weather/components/WeatherIrdGuideCard.tsx');

describe('Refinamento UX Meteorologia / Pulverização & Deriva', () => {
  it('1. Guardião de propriedade aceita locais/próprios e bloqueia estritamente outros UIDs autenticados', () => {
    assert.equal(isLocalOrOwnedByUser('user-A', ['user-A']), true);
    assert.equal(isLocalOrOwnedByUser('local-user', ['user-A']), true);
    assert.equal(isLocalOrOwnedByUser('', ['user-A']), true);
    assert.equal(isLocalOrOwnedByUser(undefined, ['user-A']), true);
    assert.equal(isLocalOrOwnedByUser('user-B', ['user-A']), false);
  });

  it('2. WeeklyNowSummaryCard destaca IRD em paridade com temperatura, tooltip acessível e Perfil ativo', () => {
    const html = renderToStaticMarkup(React.createElement(WeeklyNowSummaryCard, {
      current: { temperatureC: 21, humidityPercent: 60, windSpeedKmh: 6, windGustsKmh: 9, windDirectionDeg: 90, deltaT: 5, dewPointC: 12, precipitationMm: 0, weatherCode: 1, weatherLabel: 'Geralmente Ensolarado', updatedAt: '10:00' },
      level: 'optimal', badgeLabel: 'Favorável', irdValue: 33,
      context: { cultureId: 1, cultureName: 'Vinha Encosta' }
    }));
    assert.ok(html.includes('Perfil ativo: Vinha Encosta'));
    assert.ok(html.includes('title="Índice de Risco de Deriva"'));
    assert.ok(html.includes('33%') && html.includes('Baixo'));
    assert.equal((html.match(/text-3xl sm:text-4xl font-bold/g) || []).length, 2);
  });

  it('3. HourlyDetailCard mostra alerta único na base (<= 20 palavras) e WeatherDriftChartSvg exibe IRD % exclusivo', () => {
    const rainHtml = renderToStaticMarkup(React.createElement(HourlyDetailCard, {
      hour: { timeIso: '2026-11-19T11:00', timeFormatted: '11:00', temperatureC: 16, humidityPercent: 88, dewPointC: 14, windSpeedKmh: 8, windGustsKmh: 12, precipitationMm: 1.4, precipitationProbability: 90, deltaT: 1.5, vpdKpa: 0.2, weatherCode: 61, weatherLabel: 'Chuva Fraca' },
      evaluation: { level: 'unfavorable', badgeLabel: 'Chuva Ativa', title: 'Chuva', reason: 'Chuva', deltaT: 1.5, windSpeedKmh: 8, windGustsKmh: 12, humidityPercent: 88 }
    }));
    assert.ok(rainHtml.includes('Adiar pulverização por precipitação'));
    assert.ok(!rainHtml.includes('Chuva Ativa'));

    const svgHtml = renderToStaticMarkup(React.createElement(WeatherDriftChartSvg, {
      points: [{ timeIso: '2026-11-19T11:00', timeFormatted: '11:00', evaluation: { status: 'VALID', score: 33, band: 'Moderado', bandLabelPt: 'Moderado', validity: 'valid', windKmh: 6, gustsKmh: 9, deltaTC: 4.5, humidityPct: 60, precipMm: 0, windDirectionDeg: 90, gustFactor: 1.5, isHighGustFactor: false, isCalmInversionSuspected: false, hasPrecipBlock: false, dominantFactorPt: 'Vento calmo' } }],
      selectedIndex: 0, onSelectIndex: () => {}, timezoneLabel: 'Europe/Lisbon'
    }));
    assert.ok(svgHtml.includes('IRD 33%') && !svgHtml.includes('11:00 (Europe/Lisbon)'));
  });

  it('4. Patamares operacionais IRD, limiares dinâmicos 75/50/30%, UAV e zero "oficial/oficiais"', () => {
    assert.equal(getIrdOperationalBand(40).label, 'Risco Baixo');
    assert.equal(getIrdOperationalBand(65).label, 'Risco Moderado');
    assert.equal(getIrdOperationalBand(88).label, 'Risco Elevado');
    assert.equal(getIrdOperationalBand(120).label, 'Risco Extremo');
    assert.equal(resolveAcceptableIrdLimit(undefined), 75);
    assert.equal(resolveAcceptableIrdLimit(25), 50);
    assert.equal(resolveAcceptableIrdLimit(12), 30);

    const mockHour = { temperatureC: 20, humidityPercent: 60, windSpeedKmh: 16, windGustsKmh: 18, precipitationMm: 0, windDirectionDeg: 90 };
    const uavRes = evaluateHourWithProfileContext(
      { level: 'optimal', badgeLabel: 'Ótimo', title: 'Ok', reason: 'Ok', deltaT: 4, windSpeedKmh: 16, windGustsKmh: 18, humidityPercent: 60 },
      mockHour, { isUavEquipment: true, acceptableIrdLimitPct: 75 }
    );
    assert.equal(uavRes.evaluation.level, 'unfavorable');

    const guideHtml = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(WeatherIrdGuideCard)));
    assert.ok(guideHtml.includes('0–40%') && guideHtml.includes('41–75%') && guideHtml.includes('76–100%') && !/\boficia(l|is)\b/i.test(guideHtml));

    for (const rel of [
      'src/features/weather/utils/weatherProfileLoader.ts',
      'src/features/weather/utils/irdOperationalThresholds.ts',
      'src/features/weather/hooks/useWeatherProfilesContext.ts',
      'src/features/weather/components/CalibrationNameEditor.tsx',
      'src/features/weather/components/CalibrationWhatIfPanel.tsx',
      'src/features/weather/components/WeatherContextAccordion.tsx',
      'src/features/weather/components/WeeklyNowSummaryCard.tsx',
      'src/features/weather/components/WeeklyDecisionSummaryCards.tsx',
      'src/features/weather/components/WeeklyForecastGrid.tsx',
      'src/features/weather/components/HourlyPlannerExpanded.tsx',
      'src/features/weather/components/HourlyDetailCard.tsx',
      'src/features/weather/components/WeatherDriftSection.tsx',
      'src/features/weather/components/WeatherIrdGuideCard.tsx',
      'src/features/weather/components/charts/WeatherDriftChartSvg.tsx',
      'src/features/weather/data/weatherGuideSprayQuestions.ts'
    ]) {
      const buf = fs.readFileSync(path.resolve(rel));
      assert.equal(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, false, `${rel} tem BOM`);
      const text = buf.toString('utf8');
      assert.ok(text.split(/\r?\n/).length <= 200, `${rel} excede 200 LOC`);
      assert.equal(/dark:/.test(text), false, `${rel} tem dark:`);
      assert.equal(/\boficia(l|is)\b/i.test(text), false, `${rel} contém termo proibido oficial/oficiais`);
    }
  });
});
