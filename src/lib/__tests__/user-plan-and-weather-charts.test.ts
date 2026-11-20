// src/lib/__tests__/user-plan-and-weather-charts.test.ts
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePlanValue,
  normalizeStatusValue,
  resolveNormalizedUserPlan
} from '../../utils/userPlanNormalizer.ts';
import {
  findClosestPointIndexByClientX,
  findDayChangeMarkers,
  formatDayChangeBadge,
  getAlternatingHourIndices
} from '../../features/weather/utils/weatherChartAxisHelpers.ts';

describe('Correção dos 9 [BUG] — Plano Firebase Reativo, Header e Gráficos Meteorológicos', () => {
  it('1. Normaliza variações de campo/capitalização de plano e estado no Firestore', () => {
    assert.equal(normalizePlanValue('Pro'), 'pro');
    assert.equal(normalizePlanValue('Plano PRO'), 'pro');
    assert.equal(normalizePlanValue('plus'), 'pro');
    assert.equal(normalizePlanValue('Enterprise'), 'enterprise');
    assert.equal(normalizePlanValue('CORPORATE'), 'enterprise');
    assert.equal(normalizePlanValue(undefined), 'free');

    assert.equal(normalizeStatusValue('active'), 'active');
    assert.equal(normalizeStatusValue('Ativo'), 'active');
    assert.equal(normalizeStatusValue('TRIAL'), 'trial');
    assert.equal(normalizeStatusValue('canceled'), 'inactive');

    const proUser = resolveNormalizedUserPlan({ subscriptionPlan: 'PRO', subscriptionStatus: 'ativo' });
    assert.equal(proUser.tier, 'pro');
    assert.equal(proUser.planLabel, 'Plano Pro');
    assert.equal(proUser.shortLabel, 'Pro');
    assert.equal(proUser.statusLabel, 'Ativo');

    const nestedTrial = resolveNormalizedUserPlan({ subscription: { tier: 'enterprise', status: 'trial' } });
    assert.equal(nestedTrial.tier, 'corporate');
    assert.equal(nestedTrial.planLabel, 'Plano Enterprise');
    assert.equal(nestedTrial.statusLabel, 'Trial');

    const expiredPro = resolveNormalizedUserPlan({ plan: 'pro', status: 'expired' });
    assert.equal(expiredPro.tier, 'free', 'Subscrição expirada deve fazer downgrade seguro para free');
    assert.equal(expiredPro.isActive, false);
  });

  it('2. Eixo X alterna de 2 em 2 horas e deteta linha vertical de mudança de dia às 00:00', () => {
    assert.deepEqual(getAlternatingHourIndices(24), [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
    assert.deepEqual(getAlternatingHourIndices(0), []);

    // 2026-11-19 é quinta-feira (Qui)
    assert.equal(formatDayChangeBadge('2026-11-19T00:00'), 'Qui, 19/11');

    const hours = [
      { timeIso: '2026-11-18T22:00', timeFormatted: '22:00' },
      { timeIso: '2026-11-18T23:00', timeFormatted: '23:00' },
      { timeIso: '2026-11-19T00:00', timeFormatted: '00:00' },
      { timeIso: '2026-11-19T01:00', timeFormatted: '01:00' }
    ];
    const xs = [48, 120, 192, 264];
    const markers = findDayChangeMarkers(hours, xs);
    assert.equal(markers.length, 1);
    assert.deepEqual(markers[0], { index: 2, x: 192, label: 'Qui, 19/11' });
  });

  it('3. Mapeamento tátil clientX seleciona o índice horário mais próximo sem NaN', () => {
    const fakeSvg = { getBoundingClientRect: () => ({ left: 100, width: 340 }) };
    const xs = [48, 200, 352, 504, 632];
    // clientX=100+170=270 -> metade de 340 => svgX=340 => mais próximo de 352 (índice 2)
    assert.equal(findClosestPointIndexByClientX(fakeSvg, 270, 680, xs), 2);
    // clientX=100 => svgX=0 => índice 0
    assert.equal(findClosestPointIndexByClientX(fakeSvg, 100, 680, xs), 0);
    // clientX=440 => svgX=680 => índice 4
    assert.equal(findClosestPointIndexByClientX(fakeSvg, 440, 680, xs), 4);
    assert.equal(findClosestPointIndexByClientX(null, 200, 680, xs), null);
  });

  it('4. Contratos de navegação, remoção de RC, onSnapshot Firebase e arrasto tátil pan-y', () => {
    const authSrc = fs.readFileSync(path.resolve('src/context/AuthContext.tsx'), 'utf8');
    assert.ok(authSrc.includes('onSnapshot'), 'AuthContext deve escutar Firestore em tempo real via onSnapshot');

    const weeklySrc = fs.readFileSync(path.resolve('src/features/weather/components/DashboardWeatherWeeklyCard.tsx'), 'utf8');
    assert.ok(weeklySrc.includes('to="/meteorologia?tab=pulverizacao"'), 'Link deve abrir separador Pulverização');

    const weatherSrc = fs.readFileSync(path.resolve('src/features/weather/views/WeatherSaasView.tsx'), 'utf8');
    assert.ok(weatherSrc.includes('useSearchParams'), 'WeatherSaasView deve ler ?tab=');
    assert.ok(!weatherSrc.includes('>RC<'), 'WeatherSaasView não pode exibir badge RC');

    for (const chart of [
      'src/features/weather/components/charts/WeatherChartSvg.tsx',
      'src/features/weather/components/charts/SprayChartSvg.tsx',
      'src/features/weather/components/charts/WeatherDriftChartSvg.tsx'
    ]) {
      const src = fs.readFileSync(path.resolve(chart), 'utf8');
      assert.ok(src.includes('onTouchStart'), `${chart} deve suportar onTouchStart`);
      assert.ok(src.includes('onTouchMove'), `${chart} deve suportar onTouchMove`);
      assert.ok(src.includes('onPointerMove'), `${chart} deve suportar onPointerMove`);
      assert.ok(src.includes("touchAction: 'pan-y'"), `${chart} deve preservar pan-y`);
    }

    const axesSrc = fs.readFileSync(path.resolve('src/features/weather/components/charts/WeatherChartAxes.tsx'), 'utf8');
    assert.ok(!axesSrc.includes('(${wDay})'), 'Eixo X não deve incluir dias da semana entre parênteses');
    assert.ok(axesSrc.includes('getAlternatingHourIndices'), 'Eixo X deve usar horas alternadas de 2 em 2h');
  });

  it('5. Governança: módulos criados/alterados respeitam <= 200 LOC e zero classes dark:', () => {
    const files = [
      'src/utils/userPlanNormalizer.ts',
      'src/types/profile.ts',
      'src/context/SubscriptionContext.tsx',
      'src/components/PublicLayout.tsx',
      'src/components/PrivateLayout.tsx',
      'src/components/layout/PrivateDesktopNav.tsx',
      'src/components/layout/PrivateNavDrawer.tsx',
      'src/views/DashboardView.tsx',
      'src/features/weather/components/DashboardWeatherWeeklyCard.tsx',
      'src/features/weather/views/WeatherSaasView.tsx',
      'src/features/weather/utils/weatherChartAxisHelpers.ts',
      'src/features/weather/components/charts/WeatherChartAxes.tsx',
      'src/features/weather/components/charts/WeatherChartSvg.tsx',
      'src/features/weather/components/charts/SprayChartSvg.tsx',
      'src/features/weather/components/charts/WeatherDriftChartSvg.tsx',
      'src/lib/__tests__/user-plan-and-weather-charts.test.ts'
    ];
    for (const rel of files) {
      const content = fs.readFileSync(path.resolve(rel), 'utf8');
      const lines = content.split('\n').length;
      assert.ok(lines <= 200, `${rel} excede 200 LOC (${lines})`);
      if (!rel.includes('__tests__')) {
        assert.ok(!content.includes('dark:'), `${rel} não pode conter dark:`);
      }
    }
  });
});
