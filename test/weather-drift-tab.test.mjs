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

const { transformOpenMeteoResponse } = await import('../src/features/weather/weatherService.ts');
const { assessWeatherDriftReading, buildHourlyDriftSeries, findFavorableDriftPeriods } = await import('../src/features/weather/utils/weatherDriftEvaluator.ts');
const { WeatherModeToggle } = await import('../src/features/weather/components/WeatherModeToggle.tsx');
const { WeatherDriftChartSvg } = await import('../src/features/weather/components/charts/WeatherDriftChartSvg.tsx');
const { WeatherDriftView } = await import('../src/features/weather/components/WeatherDriftView.tsx');
const { setMockNow } = await import('../src/features/weather/services/weatherTimeService.ts');
const { computeMeteoSubIndex } = await import('../src/features/ird/irdSubIndices.ts');

function mockApiPayload(overrides = {}) {
  return {
    timezone: 'Europe/Lisbon',
    utc_offset_seconds: 0,
    current: {
      time: '2026-11-10T10:00', temperature_2m: 20, relative_humidity_2m: 65,
      precipitation: 0, weather_code: 1, wind_speed_10m: 4, wind_direction_10m: 90, wind_gusts_10m: 0,
      ...overrides.current
    },
    hourly: {
      time: ['2026-11-10T09:00', '2026-11-10T10:00', '2026-11-10T11:00', '2026-11-10T12:00', '2026-11-10T13:00', '2026-11-10T14:00'],
      temperature_2m: [19, 20, 21, null, 20, 20],
      relative_humidity_2m: [68, 65, 62, 60, 65, 66],
      dew_point_2m: [12, 13, 13, 12, 13, 13],
      precipitation_probability: [0, 0, 0, 0, 0, 0],
      precipitation: [0, 0, 0, null, 0, 0],
      weather_code: [1, 1, 1, 1, 1, 1],
      wind_speed_10m: [4, 4, 4, 4, 4, 4],
      wind_direction_10m: [90, 90, 90, 90, 90, 90],
      wind_gusts_10m: [6, 6, 0, 6, null, 6],
      ...overrides.hourly
    },
    daily: {
      time: ['2026-11-10'], weather_code: [1], temperature_2m_max: [22], temperature_2m_min: [11],
      precipitation_sum: [0], precipitation_probability_max: [0], wind_speed_10m_max: [8]
    }
  };
}

describe('Fase A — Meteorologia > Deriva (MET-01..MET-05)', () => {
  it('1. Preserva 0 legítimo vs ausência vs rajada estimada e distingue estados vazios de janelas', () => {
    const res = transformOpenMeteoResponse(mockApiPayload(), { latitude: 41.16, longitude: -7.78, locationName: 'Peso da Régua' });
    assert.equal(res.timezone, 'Europe/Lisbon');
    assert.equal(res.current.windGustsKmh, 0);
    assert.equal(res.current.telemetryQuality?.isGustEstimated, false);
    assert.equal(res.hourlyFull[3].telemetryQuality?.isComplete, false);
    assert.equal(res.hourlyFull[4].telemetryQuality?.isGustEstimated, true);

    const series = buildHourlyDriftSeries(res.hourlyFull, '2026-11-10T10:00', '2026-11-10');
    const fav = findFavorableDriftPeriods(series);
    assert.equal(fav.unavailableReason, 'ok');
    assert.equal(fav.periods[0].hoursCount, 2);
    assert.ok(fav.periods[0].dayLabelPt && fav.periods[0].rationalePt.includes('km/h'));

    assert.equal(findFavorableDriftPeriods(series, { isStaleOrLegacyCache: true }).unavailableReason, 'stale_or_legacy_cache');
    assert.equal(findFavorableDriftPeriods(series.slice(0, 1)).unavailableReason, 'insufficient_forecast');

    const highWind = transformOpenMeteoResponse(mockApiPayload({ hourly: { wind_speed_10m: [20, 20, 20, 20, 20, 20], wind_gusts_10m: [24, 24, 24, 24, 24, 24] } }), { latitude: 41.16, longitude: -7.78 });
    const noWinSeries = buildHourlyDriftSeries(highWind.hourlyFull, '2026-11-10T10:00', '2026-11-10');
    assert.equal(findFavorableDriftPeriods(noWinSeries).unavailableReason, 'no_window_found');

    const legacyEval = assessWeatherDriftReading({ ...res.current, telemetryQuality: undefined }, { isCached: true, cacheAgeMinutes: 5 });
    assert.equal(legacyEval.validity, 'unverified_legacy_cache');
    assert.equal(computeMeteoSubIndex({ windSpeedKmh: 4, windGustsKmh: 6, temperatureC: 20, relativeHumidityPct: 65, precipitationMm: 0, weatherSource: 'open_meteo_live' }).rawScore > 0, true);
  });

  it('2. SVG tem navegação por teclado, eixos 0–200% (base 100%), lacunas partidas e zero alteração de cálculo', () => {
    const res = transformOpenMeteoResponse(mockApiPayload(), { latitude: 41.16, longitude: -7.78, locationName: 'Peso da Régua' });
    const series = buildHourlyDriftSeries(res.hourlyFull, '2026-11-10T09:00', '2026-11-10');

    const baseSvg = renderToStaticMarkup(React.createElement(WeatherDriftChartSvg, { points: series, selectedIndex: 0, onSelectIndex: () => {}, timezoneLabel: 'Europe/Lisbon' }));
    assert.equal((baseSvg.match(/<path /g) || []).length, 2, 'Curva parte nas lacunas sem ligar segmentos (exatamente 2 segmentos)');
    assert.ok(baseSvg.includes('role="slider"') && baseSvg.includes('tabindex="0"') && baseSvg.includes('0–200%'));
    assert.ok(baseSvg.includes('200%') && baseSvg.includes('100%') && !baseSvg.includes('Vento (km/h)'), 'Gráfico único sem sub-gráficos empilhados');
  });

  it('3. WeatherDriftView remove botões horários, usa aria-pressed, título claro de janelas e respeita <= 200 LOC', () => {
    const res = transformOpenMeteoResponse(mockApiPayload(), { latitude: 41.16, longitude: -7.78, locationName: 'Régua' });
    res.fetchedAt = new Date().toISOString();
    setMockNow('2026-11-10T09:30:00');
    let viewHtml = '';
    try {
      viewHtml = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(WeatherDriftView, {
        data: res, isLoading: false, error: null, locationName: 'Régua', selectedDateIso: '2026-11-10'
      })));
    } finally {
      setMockNow(null);
    }
    assert.ok(!viewHtml.includes('Selecionar hora da previsão'), 'Lista de botões horários deve ser removida');
    assert.ok(viewHtml.includes('aria-pressed="false"') && viewHtml.includes('Janelas meteorológicas para planear o tratamento'));
    assert.ok(viewHtml.includes('Confirme as condições no local e as indicações do rótulo'));
    assert.ok(!viewHtml.includes('Potencial Meteorológico Heurístico · Agora'), 'Título principal evita termo heurístico');

    const toggleUnified = renderToStaticMarkup(React.createElement(WeatherModeToggle, { activeMode: 'pulverizacao', onChangeMode: () => {} }));
    assert.ok(
      toggleUnified.includes('tab-weather-mode-meteorologia')
      && toggleUnified.includes('tab-weather-mode-pulverizacao')
      && !toggleUnified.includes('tab-weather-mode-deriva'),
      'WeatherModeToggle deve apresentar apenas 2 abas limpas (Meteorologia e Pulverização & Deriva)'
    );

    for (const f of ['src/features/weather/views/WeatherSaasView.tsx', 'src/features/weather/components/WeatherModeToggle.tsx', 'src/features/weather/components/WeatherDriftSection.tsx', 'src/features/weather/utils/weatherDriftTypes.ts', 'src/features/weather/utils/weatherDriftEvaluator.ts', 'src/features/weather/components/charts/WeatherDriftChartSvg.tsx', 'src/features/weather/components/charts/WeatherDriftSeriesTracks.tsx', 'src/features/weather/components/WeatherDriftWindowsCard.tsx', 'src/features/weather/components/WeatherDriftTechPanel.tsx', 'src/features/weather/components/WeatherDriftView.tsx']) {
      const lines = fs.readFileSync(path.resolve(f), 'utf8').split('\n').length;
      assert.ok(lines <= 200, `${f} excede 200 LOC (${lines})`);
    }
  });

  it('4. Tabela tem seleção acessível por teclado, WeatherSaasView omite "heurístico" e layouts contêm overflow em 375px', () => {
    const viewSrc = fs.readFileSync(path.resolve('src/features/weather/components/WeatherDriftView.tsx'), 'utf8');
    const saasSrc = fs.readFileSync(path.resolve('src/features/weather/views/WeatherSaasView.tsx'), 'utf8');
    const layoutSrc = fs.readFileSync(path.resolve('src/components/PrivateLayout.tsx'), 'utf8');
    const svgSrc = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherDriftChartSvg.tsx'), 'utf8');

    assert.ok(viewSrc.includes('aria-selected={selected}') && viewSrc.includes("e.key === 'Enter' || e.key === ' '"));
    assert.ok(viewSrc.includes('focus-visible:ring-2') && viewSrc.includes('w-full max-w-full min-w-0'));
    assert.ok(!/heur[íi]stico/i.test(saasSrc), 'WeatherSaasView não pode exibir "heurístico" no subtítulo');
    assert.ok(saasSrc.includes('min-w-0 overflow-x-hidden') && layoutSrc.includes('min-w-0') && svgSrc.includes('min-w-[300px] sm:min-w-[500px]') && svgSrc.includes('max-w-full overflow-x-auto'));
  });
});
