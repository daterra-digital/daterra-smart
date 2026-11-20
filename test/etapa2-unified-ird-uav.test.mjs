// test/etapa2-unified-ird-uav.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const { evaluateSprayWindow } = await import('../src/features/weather/weatherCalculations.ts');
const { aggregateWeeklySpraySchedule } = await import('../src/features/weather/weatherWeekAggregator.ts');
const { setMockNow } = await import('../src/features/weather/services/weatherTimeService.ts');
const { computeParcelFactorBundle, computeParcelOnlyDriftRisk } = await import('../src/features/weather/utils/irdParcelFactorHelpers.ts');
const { computeUavIrdFactor } = await import('../src/features/weather/utils/irdUavFactorHelpers.ts');
const { computeWhatIfSimulation } = await import('../src/features/weather/utils/calibrationWhatIfHelpers.ts');

describe('Etapa 2 — Unificação Meteorologia/Pulverização, Parcela 2D/3D, Motor UAV & Correções QA', () => {
  it('1. Correções QA: ΔT < 2,0 °C é marginal e após 20:00 dia de hoje exibe Janela Encerrada', () => {
    const dtLow = evaluateSprayWindow(1.4, 5, 6, 85, 0);
    assert.equal(dtLow.level, 'marginal');
    assert.ok(dtLow.badgeLabel.includes('ΔT'));

    setMockNow('2026-11-19T21:15:00');
    try {
      const daily = [{ dateIso: '2026-11-19', dayLabel: 'Hoje (Qui)', maxTempC: 17, minTempC: 8, precipitationSumMm: 0, precipitationProbabilityMax: 0, windSpeedMaxKmh: 9, weatherCode: 1, weatherLabel: 'Geralmente Ensolarado' }];
      const hourlyFutureEmptyButFetched = aggregateWeeklySpraySchedule([], daily, null);
      assert.equal(hourlyFutureEmptyButFetched.dailyWindows[0].badgeLabel, 'Sem Dados', 'Sem horas em cache/rede preserva Sem Dados');

      const hourlyYesterdayLeft = [{
        timeIso: '2026-11-20T08:00', timeFormatted: '08:00', temperatureC: 12, humidityPercent: 75, dewPointC: 8,
        windSpeedKmh: 5, windGustsKmh: 7, precipitationMm: 0, precipitationProbability: 0, deltaT: 4, vpdKpa: 0.4, weatherCode: 1,
        weatherLabel: 'Geralmente Ensolarado', sprayEvaluation: evaluateSprayWindow(4, 5, 7, 75, 0)
      }];
      const closedToday = aggregateWeeklySpraySchedule(hourlyYesterdayLeft, daily, null);
      assert.equal(closedToday.dailyWindows[0].isWindowClosed, true);
      assert.equal(closedToday.dailyWindows[0].badgeLabel, 'Janela Encerrada');
      assert.equal(closedToday.dailyWindows[0].bestWindowText, 'Sem horas restantes hoje');
    } finally {
      setMockNow(null);
    }
  });

  it('2. Fator de Parcela 2D/3D e Contexto Espacial (barreira, zona sensível, azimute e declive catabático)', () => {
    setMockNow('2026-11-19T07:15:00');
    try {
      const cult2d = {
        id: 'c2d', name: 'Trigo Mole', geometry_mode: '2D', crop_height_2d_cm: 35,
        ground_cover_2d_pct: 40, application_target_2d: 'folha_dossel', reference_volume_2d_lha: 200,
        windbreak_barrier: 'sebe_igual_superior', sensitive_zone_distance_m: 4, parcel_slope_pct: 8, row_azimuth_deg: 0
      };
      const bundle = computeParcelFactorBundle(cult2d, null, 90);
      assert.equal(bundle.geometryMode, '2D');
      assert.equal(bundle.refBoomHeightCm, 85);
      assert.equal(bundle.targetVolumeLHa, 200);
      assert.ok(bundle.alertsPt.some((a) => a.includes('4 m') || a.includes('< 5 m') || a.includes('inferior a 5 m')));
      assert.ok(bundle.alertsPt.some((a) => a.includes('catabático')));

      const parcelIrd = computeParcelOnlyDriftRisk(cult2d, null, {
        temperatureC: 18, humidityPercent: 60, windSpeedKmh: 10, windGustsKmh: 13, precipitationMm: 0, windDirectionDeg: 90
      });
      assert.equal(parcelIrd.isSensitiveZoneAlert, parcelIrd.parcelRiskPct > 50);
    } finally {
      setMockNow(null);
    }
  });

  it('3. Motor UAV (DL 91/2016 > 15,0 km/h, altura > 3,0 m, wingtip 1,35, radar OFF declive, adjuvante 0,80)', () => {
    const okUav = computeUavIrdFactor({
      flightHeightM: 2.0, flightSpeedKmh: 18, cdaDiscRpm: 10000, adjuvantAntiEvap: true, windSpeedKmh: 8,
      slopePct: 3, uavDetails: { weightClass: 'heavy', nozzlePlacement: 'under_rotor', terrainFollowingRadar: true, atomizationSystem: 'cda_rotary' }
    });
    assert.equal(okUav.isLegalWindBlock, false);

    const riskyUav = computeUavIrdFactor({
      flightHeightM: 3.6, flightSpeedKmh: 26, cdaDiscRpm: 13500, adjuvantAntiEvap: false, windSpeedKmh: 16.2,
      slopePct: 8, uavDetails: { weightClass: 'light', nozzlePlacement: 'wingtip', terrainFollowingRadar: false, atomizationSystem: 'cda_rotary' }
    });
    assert.equal(riskyUav.isLegalWindBlock, true);
    assert.ok(riskyUav.uavOpRiskScore > okUav.uavOpRiskScore);
    assert.ok(riskyUav.alertsPt.some((a) => a.includes('DL 91/2016')));
    assert.ok(riskyUav.alertsPt.some((a) => a.includes('Radar')));

    const sim = computeWhatIfSimulation({
      calibration: { id: 'cal-uav', userId: 'u1', nomePerfil: 'Drone Olival', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', nozzleProfileId: 'n1', equipmentId: 'uav1', cultureParcelId: 'c1', cultureMomentId: null, velocidadeKmh: 18, pressaoBar: 2.5, debitoTotalLMin: 1.5, numBicosAtivos: 2, entrelinhaM: 4, volumeCalibradoLHa: 12.5, volumeRecomendadoEppoLHa: 18, iso16122: { desvioMaximoBicosPct: 0, simetriaEsqDirPct: 0 }, sha256Seal: 'x' },
      culture: null, cultureLabel: 'Olival', cultureMetaLabel: 'Drone UAV', equipmentName: 'DJI T40', equipKind: 'UAV',
      hasAirSleeve: false, equipmentMetaLabel: 'Drone UAV', uavDetails: { weightClass: 'heavy', nozzlePlacement: 'wingtip', atomizationSystem: 'cda_rotary' },
      nozzleName: 'CDA', nozzleType: 'CDA', nozzleMetaLabel: '2 discos', nozzleCatalogId: null, nozzleBrand: null, nozzleModel: null, driftHazardLevel: null, dv50Um: 220,
      baseSpeedKmh: 18, basePressureBar: 2.5, baseFlowLMin: 1.5, baseAirflowM3h: null, baseHeightVal: 2.0, baseCdaDiscRpm: 10000,
      entrelinhaM: 4, numBicosAtivos: 2, trvM3Ha: null, lwaM2Ha: null, volumeEppoLHa: 18, minPressureBar: 1.5, maxPressureBar: 4, hasAntiDrift: false
    }, { speedKmh: 25, pressureBar: 2.5, airflowM3h: null, heightVal: 3.5, cdaDiscRpm: 13000, adjuvantAntiDrift: false }, { windSpeedKmh: 16 });
    assert.equal(sim.isUavLegalWindBlock, true);
    assert.equal(sim.isUavOutOfTargetBand, true);
  });

  it('4. Governança Etapa 2: <= 200 LOC, UTF-8 sem BOM, zero dark: e zero termos proibidos', () => {
    const etapa2Files = [
      'src/features/weather/weatherPsychrometrics.ts',
      'src/features/weather/weatherCalculations.ts',
      'src/features/weather/utils/sprayPresentationAdapter.ts',
      'src/features/weather/weatherWeekAggregator.ts',
      'src/features/weather/components/WeeklyForecastGrid.tsx',
      'src/features/weather/utils/irdParcelFactorHelpers.ts',
      'src/features/weather/utils/irdUavFactorHelpers.ts',
      'src/features/weather/utils/calibrationWhatIfHelpers.ts',
      'src/features/weather/hooks/useWeatherProfilesContext.ts',
      'src/features/weather/components/CalibrationWhatIfUavControls.tsx',
      'src/features/weather/components/CalibrationWhatIfPanel.tsx',
      'src/features/weather/components/WeatherContextAccordion.tsx',
      'src/features/weather/components/WeatherDriftSection.tsx',
      'src/features/weather/components/WeatherModeToggle.tsx',
      'src/features/weather/components/WeeklyDecisionSummaryCards.tsx',
      'src/features/weather/views/WeatherSaasView.tsx'
    ];
    for (const rel of etapa2Files) {
      const full = path.resolve(rel);
      const buf = fs.readFileSync(full);
      assert.equal(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, false, `${rel} tem UTF-8 BOM`);
      const text = buf.toString('utf8');
      const lines = text.split(/\r?\n/).length;
      assert.ok(lines <= 200, `${rel} tem ${lines} linhas (máximo 200)`);
      assert.equal(/dark:/.test(text), false, `${rel} contém classes dark:`);
      assert.equal(/TOPPS|PROWADIS|Drift Evaluation Tool|Drift Risk Diagnosis|Zona de Perce[çc][ãa]o/.test(text), false, `${rel} contém termo proibido`);
    }
  });
});
