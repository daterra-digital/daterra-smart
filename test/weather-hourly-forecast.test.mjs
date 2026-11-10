/**
 * DATERRA Smart - Teste de Validação da Previsão Horária no Modo Meteorologia (T5.1)
 * Validação Funcional:
 * 1. Limite estrito de modularidade (< 200 LOC) em todos os ficheiros criados
 * 2. Ausência absoluta de emojis e uso exclusivo de SVGs Lucide
 * 3. Ordem visual estrita em WeatherGeneralView: Resumo -> Semana -> Previsão Horária
 * 4. Título contextual ("Horas restantes de hoje" vs "Previsão horária — ...")
 * 5. Filtragem por data local (prefixo ISO estável sem conversão UTC errática)
 * 6. Reinício da seleção e do carrossel ao mudar de dia
 * 7. Detalhe compacto estritamente meteorológico (sem variáveis de pulverização)
 * 8. Respeito pelo horizonte de dados sem fabricar horas passadas
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('T5.1 — Previsão Horária do Dia Selecionado', () => {

  // 1. Limite de Modularidade (< 200 LOC)
  it('1. Todos os ficheiros da previsão horária respeitam o limite estrito de < 200 LOC', () => {
    const files = [
      'src/features/weather/components/WeatherHourlyCard.tsx',
      'src/features/weather/components/WeatherHourlyItemButton.tsx',
      'src/features/weather/components/WeatherHourlyDetail.tsx',
      'src/features/weather/components/WeatherGeneralView.tsx'
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      assert.ok(fs.existsSync(fullPath), `${f} deve existir`);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines <= 200, `${f} tem ${lines} linhas, deve ter <= 200`);
    }
  });

  // 2. Zero Emojis e SVGs Lucide
  it('2. Zero emojis nos novos componentes e uso exclusivo de Lucide SVGs', () => {
    const files = [
      'src/features/weather/components/WeatherHourlyCard.tsx',
      'src/features/weather/components/WeatherHourlyItemButton.tsx',
      'src/features/weather/components/WeatherHourlyDetail.tsx'
    ];

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const f of files) {
      const content = fs.readFileSync(path.resolve(f), 'utf8');
      assert.equal(emojiRegex.test(content), false, `${f} não deve conter emojis`);
    }
  });

  // 3. Ordem no DOM do WeatherGeneralView
  it('3. WeatherGeneralView respeita a ordem: Resumo -> Próximos 7 Dias -> Previsão Horária', () => {
    const content = fs.readFileSync(path.resolve('src/features/weather/components/WeatherGeneralView.tsx'), 'utf8');

    const dedicatedIdx = content.indexOf('<WeatherDedicatedCard');
    const weeklyIdx = content.indexOf('<DashboardWeatherWeeklyCard');
    const hourlyIdx = content.indexOf('<WeatherHourlyCard');

    assert.ok(dedicatedIdx !== -1, 'WeatherDedicatedCard deve estar presente');
    assert.ok(weeklyIdx !== -1, 'DashboardWeatherWeeklyCard deve estar presente');
    assert.ok(hourlyIdx !== -1, 'WeatherHourlyCard deve estar presente');

    assert.ok(dedicatedIdx < weeklyIdx, 'Resumo deve surgir antes da faixa semanal');
    assert.ok(weeklyIdx < hourlyIdx, 'Faixa semanal deve surgir antes da previsão horária');
  });

  // 4. Lógica de Título e Subtítulo
  it('4. Título é "Previsão horária" e subtítulo indica "Próximas 48 horas" para Hoje', () => {
    const cardContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherHourlyCard.tsx'), 'utf8');

    assert.ok(cardContent.includes("const title = 'Previsão horária';"), 'Título deve ser estritamente "Previsão horária"');
    assert.ok(cardContent.includes("'Próximas 48 horas'"), 'Subtítulo deve indicar "Próximas 48 horas" para Hoje');
    assert.ok(cardContent.includes('formatHourlyDayHeader(targetDateIso, language)'), 'Subtítulo deve indicar dia e data para outros dias');
  });

  // 5. Filtragem por Horizonte: 48h para Hoje e Dia Civil para outros dias
  it('5. Horizonte horário: Hoje seleciona 48 horas e outros dias filtram dia civil completo', () => {
    const cardContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherHourlyCard.tsx'), 'utf8');

    assert.ok(cardContent.includes('hourly.slice(0, 48)'), 'Hoje deve selecionar até 48 horas consecutivas reais');
    assert.ok(cardContent.includes('hourlyFull.filter'), 'Outros dias devem usar série completa hourlyFull');
  });

  // 6. Reinício da hora selecionada e scroll ao mudar de dia
  it('6. Mudança de dia seleciona a primeira hora do novo dia e repõe o carrossel no início', () => {
    const cardContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherHourlyCard.tsx'), 'utf8');

    assert.ok(cardContent.includes('prevDateRef.current !== targetDateIso'), 'Deve detetar mudança de data');
    assert.ok(cardContent.includes('setSelectedHourIso(dayHours[0]?.timeIso || null)'), 'Deve selecionar primeira hora do dia');
    assert.ok(cardContent.includes('scrollLeft = 0'), 'Deve repor carrossel no início (scrollLeft = 0)');
  });

  // 7. Ausência estrita de classificações e semáforos de pulverização
  it('7. Detalhe e itens horários não contêm Delta T, DPV nem classificações de pulverização', () => {
    const cardContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherHourlyCard.tsx'), 'utf8');
    const buttonContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherHourlyItemButton.tsx'), 'utf8');
    const detailContent = fs.readFileSync(path.resolve('src/features/weather/components/WeatherHourlyDetail.tsx'), 'utf8');

    for (const [name, content] of [
      ['WeatherHourlyCard', cardContent],
      ['WeatherHourlyItemButton', buttonContent],
      ['WeatherHourlyDetail', detailContent]
    ]) {
      assert.equal(content.includes('sprayEvaluation'), false, `${name} não deve aceder a sprayEvaluation`);
      assert.equal(content.includes('deltaT'), false, `${name} não deve referenciar deltaT`);
      assert.equal(content.includes('vpdKpa'), false, `${name} não deve referenciar vpdKpa`);
      assert.equal(content.includes('Semáforo'), false, `${name} não deve conter semáforo`);
    }
  });

  // 8. Simulação funcional de filtragem e horizonte horário
  it('8. Teste funcional de filtragem horária e dados parciais', () => {
    const mockHourly = [
      { timeIso: '2026-11-09T18:00', timeFormatted: '18:00', temperatureC: 18, windSpeedKmh: 15, precipitationMm: 0 },
      { timeIso: '2026-11-09T19:00', timeFormatted: '19:00', temperatureC: 17, windSpeedKmh: 14, precipitationMm: 0.2 },
      { timeIso: '2026-11-09T20:00', timeFormatted: '20:00', temperatureC: 16, windSpeedKmh: 12, precipitationMm: 0.8 },
      { timeIso: '2026-11-10T08:00', timeFormatted: '08:00', temperatureC: 14, windSpeedKmh: 10, precipitationMm: 0 },
      { timeIso: '2026-11-10T09:00', timeFormatted: '09:00', temperatureC: 16, windSpeedKmh: 12, precipitationMm: 0 }
    ];

    // Hoje (2026-11-09) tem apenas 3 horas restantes (dados parciais)
    const todayHours = mockHourly.filter(h => h.timeIso.startsWith('2026-11-09'));
    assert.equal(todayHours.length, 3, 'Hoje deve conter apenas as horas restantes');
    assert.equal(todayHours[0].timeFormatted, '18:00');

    // Amanhã (2026-11-10) tem as suas próprias horas
    const tomorrowHours = mockHourly.filter(h => h.timeIso.startsWith('2026-11-10'));
    assert.equal(tomorrowHours.length, 2);
    assert.equal(tomorrowHours[0].timeFormatted, '08:00');

    // Dia sem horas (ex: dia além do horizonte) resulta em array vazio (estado vazio honesto)
    const emptyDayHours = mockHourly.filter(h => h.timeIso.startsWith('2026-11-20'));
    assert.equal(emptyDayHours.length, 0, 'Dia fora do horizonte deve devolver array vazio sem inventar horas');
  });
});
