// test/weather-week-aggregator.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

// Import pure aggregator logic for testing in Node.js
import { aggregateWeeklySpraySchedule, getContextCompleteness, formatFullPortugueseDate } from '../src/features/weather/weatherWeekAggregator.ts';

test('Validação do Agregador Semanal de Pulverização (weatherWeekAggregator)', async (t) => {
  const defaultContext = {
    nozzleType: 'air_induction',
    hasAirSleeve: true,
    workingPressureBar: 2.5
  };

  const createMockHour = (timeIso, timeFormatted, deltaT, wind, gusts, rh, rain = 0) => ({
    timeIso,
    timeFormatted,
    temperatureC: 22,
    humidityPercent: rh,
    dewPointC: 14,
    deltaT,
    vpdKpa: 0.9,
    windSpeedKmh: wind,
    windGustsKmh: gusts,
    precipitationProbability: 0,
    precipitationMm: rain,
    weatherCode: 0,
    weatherLabel: 'Céu Limpo',
    sprayEvaluation: {
      level: 'optimal',
      badgeLabel: 'Risco Baixo (Ótimo)',
      title: 'Favorável',
      reason: 'Condições ótimas',
      deltaT,
      windSpeedKmh: wind,
      windGustsKmh: gusts,
      humidityPercent: rh
    }
  });

  await t.test('1. Classifica dia como Ótimo se tiver pelo menos 2 horas consecutivas favoráveis entre 06:00 e 20:00', () => {
    const hourly = [
      createMockHour('2026-11-09T08:00:00Z', '08:00', 4.5, 8, 11, 65), // optimal
      createMockHour('2026-11-09T09:00:00Z', '09:00', 5.0, 9, 12, 60), // optimal
      createMockHour('2026-11-09T10:00:00Z', '10:00', 9.2, 18, 22, 45) // marginal
    ];
    const daily = [{
      dateIso: '2026-11-09',
      dayLabel: 'Hoje (Seg)',
      maxTempC: 24,
      minTempC: 14,
      precipitationSumMm: 0,
      precipitationProbabilityMax: 0,
      windSpeedMaxKmh: 18,
      weatherCode: 0,
      weatherLabel: 'Céu Limpo'
    }];

    const result = aggregateWeeklySpraySchedule(hourly, daily, defaultContext);
    assert.equal(result.dailyWindows[0].level, 'optimal');
    assert.equal(result.dailyWindows[0].badgeLabel, 'Ótimo');
    assert.equal(result.dailyWindows[0].bestWindowText, '08:00 – 09:00');
    assert.ok(result.safeDays.includes('Hoje (Seg)'));
  });

  await t.test('2. Classifica dia como Atenção se tiver apenas 1 hora favorável isolada', () => {
    const hourly = [
      createMockHour('2026-11-09T08:00:00Z', '08:00', 4.5, 8, 11, 65), // optimal (isolada)
      createMockHour('2026-11-09T09:00:00Z', '09:00', 9.2, 18, 22, 45), // marginal
      createMockHour('2026-11-09T10:00:00Z', '10:00', 12.0, 24, 30, 30) // unfavorable (vento/rajadas/deltaT)
    ];
    const daily = [{
      dateIso: '2026-11-09',
      dayLabel: 'Hoje (Seg)',
      maxTempC: 24,
      minTempC: 14,
      precipitationSumMm: 0,
      precipitationProbabilityMax: 0,
      windSpeedMaxKmh: 24,
      weatherCode: 0,
      weatherLabel: 'Céu Limpo'
    }];

    const result = aggregateWeeklySpraySchedule(hourly, daily, defaultContext);
    assert.equal(result.dailyWindows[0].level, 'marginal');
    assert.equal(result.dailyWindows[0].badgeLabel, 'Atenção');
    assert.ok(result.dailyWindows[0].bestWindowText.includes('Janela curta'));
    assert.equal(result.safeDays.length, 0);
  });

  await t.test('3. Horas favoráveis de madrugada (fora de 06:00-20:00) não classificam o dia como Ótimo', () => {
    const hourly = [
      createMockHour('2026-11-09T02:00:00Z', '02:00', 3.0, 4, 6, 80), // optimal mas 02:00
      createMockHour('2026-11-09T03:00:00Z', '03:00', 3.0, 4, 6, 80), // optimal mas 03:00
      createMockHour('2026-11-09T10:00:00Z', '10:00', 6.0, 22, 32, 50), // unfavorable (vento)
      createMockHour('2026-11-09T11:00:00Z', '11:00', 7.0, 24, 34, 45)  // unfavorable (vento)
    ];
    const daily = [{
      dateIso: '2026-11-09',
      dayLabel: 'Hoje (Seg)',
      maxTempC: 24,
      minTempC: 14,
      precipitationSumMm: 0,
      precipitationProbabilityMax: 0,
      windSpeedMaxKmh: 24,
      weatherCode: 0,
      weatherLabel: 'Céu Limpo'
    }];

    const result = aggregateWeeklySpraySchedule(hourly, daily, defaultContext);
    // As horas 02:00 e 03:00 são ignoradas; as horas das 10h e 11h são desfavoráveis
    assert.equal(result.dailyWindows[0].level, 'unfavorable');
    assert.equal(result.dailyWindows[0].badgeLabel, 'Adiar');
  });

  await t.test('4. Dia com chuva ativa ou vento crítico contínuo é classificado como Adiar', () => {
    const hourly = [
      createMockHour('2026-11-09T08:00:00Z', '08:00', 4.0, 22, 32, 75, 1.5), // chuva
      createMockHour('2026-11-09T09:00:00Z', '09:00', 4.5, 20, 30, 80, 2.0)  // chuva
    ];
    const daily = [{
      dateIso: '2026-11-09',
      dayLabel: 'Hoje (Seg)',
      maxTempC: 18,
      minTempC: 12,
      precipitationSumMm: 3.5,
      precipitationProbabilityMax: 80,
      windSpeedMaxKmh: 25,
      weatherCode: 61,
      weatherLabel: 'Chuva'
    }];

    const result = aggregateWeeklySpraySchedule(hourly, daily, defaultContext);
    assert.equal(result.dailyWindows[0].level, 'unfavorable');
    assert.equal(result.dailyWindows[0].badgeLabel, 'Adiar');
  });

  await t.test('5. Tratamento de fallback offline sem dados horários', () => {
    const daily = [{
      dateIso: '2026-11-09',
      dayLabel: 'Hoje (Seg)',
      maxTempC: 24,
      minTempC: 14,
      precipitationSumMm: 0,
      precipitationProbabilityMax: 0,
      windSpeedMaxKmh: 14,
      weatherCode: 0,
      weatherLabel: 'Céu Limpo'
    }];

    const result = aggregateWeeklySpraySchedule([], daily, defaultContext);
    assert.equal(result.dailyWindows[0].level, 'unfavorable');
    assert.equal(result.dailyWindows[0].badgeLabel, 'Sem Dados');
    assert.equal(result.nextBestWindow.available, false);
  });

  await t.test('6. Validação dos graus de completude do contexto da exploração', () => {
    // 6.1 Contexto nulo / vazio (Modo Referência)
    const refComp = getContextCompleteness(null);
    assert.equal(refComp.status, 'reference');
    assert.equal(refComp.isComplete, false);
    assert.equal(refComp.label, 'Referência Meteorológica');

    // 6.2 Contexto parcial (apenas equipamento)
    const partialComp1 = getContextCompleteness({ equipmentId: 10, equipmentName: 'Hardi Commander' });
    assert.equal(partialComp1.status, 'partial');
    assert.equal(partialComp1.isComplete, false);
    assert.equal(partialComp1.label, 'Contexto Parcial (1/3)');

    // 6.3 Contexto parcial (equipamento + bico)
    const partialComp2 = getContextCompleteness({
      equipmentId: 10,
      equipmentName: 'Hardi Commander',
      nozzleId: 5,
      nozzleName: 'TeeJet AIXR 11002'
    });
    assert.equal(partialComp2.status, 'partial');
    assert.equal(partialComp2.label, 'Contexto Parcial (2/3)');

    // 6.4 Contexto completo (equipamento + bico + calibração)
    const completeComp = getContextCompleteness({
      equipmentId: 10,
      equipmentName: 'Hardi Commander',
      nozzleId: 5,
      nozzleName: 'TeeJet AIXR 11002',
      calibrationId: 3,
      calibrationName: 'Calibração #3 (250 L/ha)'
    });
    assert.equal(completeComp.status, 'complete');
    assert.equal(completeComp.isComplete, true);
    assert.equal(completeComp.label, 'Contexto Completo (3/3)');
  });

  await t.test('7. Avaliação agronómica com context = null opera em modo de referência seguro', () => {
    const hourly = [
      createMockHour('2026-11-09T08:00:00Z', '08:00', 4.5, 8, 11, 65), // vento <= 10 km/h (favorável referência)
      createMockHour('2026-11-09T09:00:00Z', '09:00', 5.0, 9, 12, 60), // vento <= 10 km/h (favorável referência)
      createMockHour('2026-11-09T10:00:00Z', '10:00', 6.0, 15, 20, 50) // vento > 14 km/h (desfavorável referência)
    ];
    const daily = [{
      dateIso: '2026-11-09',
      dayLabel: 'Hoje (Seg)',
      maxTempC: 22,
      minTempC: 12,
      precipitationSumMm: 0,
      precipitationProbabilityMax: 0,
      windSpeedMaxKmh: 15,
      weatherCode: 0,
      weatherLabel: 'Céu Limpo'
    }];

    const result = aggregateWeeklySpraySchedule(hourly, daily, null);
    assert.equal(result.evaluationMode, 'reference');
    assert.equal(result.dailyWindows[0].level, 'optimal');
    assert.equal(result.dailyWindows[0].bestWindowText, '08:00 – 09:00');
  });

  await t.test('8. Formatação completa em português da Próxima Janela Prevista (dia da semana + dia do mês)', () => {
    const formatted = formatFullPortugueseDate('2026-11-10');
    assert.equal(formatted, 'Terça-feira, 10 de Novembro');

    const hourly = [
      createMockHour('2026-11-10T08:00:00Z', '08:00', 4.5, 8, 11, 65),
      createMockHour('2026-11-10T09:00:00Z', '09:00', 5.0, 9, 12, 60)
    ];
    const daily = [{
      dateIso: '2026-11-10',
      dayLabel: 'Amanhã (Ter)',
      maxTempC: 22,
      minTempC: 12,
      precipitationSumMm: 0,
      precipitationProbabilityMax: 0,
      windSpeedMaxKmh: 10,
      weatherCode: 0,
      weatherLabel: 'Céu Limpo'
    }];

    const result = aggregateWeeklySpraySchedule(hourly, daily, defaultContext);
    assert.equal(result.nextBestWindow.available, true);
    assert.equal(result.nextBestWindow.fullDateLabel, 'Terça-feira, 10 de Novembro');
    assert.equal(result.nextBestWindow.timeRange, '08:00 – 09:00');
  });
});
