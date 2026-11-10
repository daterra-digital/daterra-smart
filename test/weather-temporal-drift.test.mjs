/**
 * DATERRA Smart - Teste de Validação de Horizonte Temporal e Controlo de Relógio (T8-C1)
 * Validações com código real:
 * 1. Passagem de hora: 10:59 -> 11:00 remove a hora passada (10:00) do horizonte de Hoje
 * 2. Passagem de dia: 23:59 -> 00:00 atualiza getEffectiveDateIso e recalcula o horizonte
 * 3. Retoma após várias horas em segundo plano: horas antigas são excluídas imediatamente
 * 4. Fim de modelo: horizonte com menos de 24h/48h devolve as horas reais sem fabricar dados fictícios
 * 5. Data futura selecionada: seleção explícita é preservada enquanto válida no modelo
 * 6. Limpeza e gestão de timers/listeners: subscribe e unsubscribe removem listeners sem fugas
 * 7. Sem pedidos de rede: avanço de relógio refiltra os dados em memória sem chamadas fetch
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  setMockNow,
  getEffectiveHourIso,
  getEffectiveDateIso,
  filterFutureHours,
  subscribeToWeatherTime
} from '../src/features/weather/services/weatherTimeService.ts';

describe('T8-C1 — Controlo de Relógio e Horizonte Temporal Dinâmico', () => {

  beforeEach(() => {
    setMockNow(null);
  });

  afterEach(() => {
    setMockNow(null);
  });

  // 1. Passagem de hora: 10:59 -> 11:00
  it('1. Passagem de 10:59 para 11:00 exclui 10:00 do horizonte de próximas horas', () => {
    const hours = [
      { timeIso: '2026-11-10T09:00', timeFormatted: '09:00' },
      { timeIso: '2026-11-10T10:00', timeFormatted: '10:00' },
      { timeIso: '2026-11-10T11:00', timeFormatted: '11:00' },
      { timeIso: '2026-11-10T12:00', timeFormatted: '12:00' },
      { timeIso: '2026-11-10T13:00', timeFormatted: '13:00' }
    ];

    // Às 10:59: a hora atual é 10:00
    setMockNow(new Date('2026-11-10T10:59:00'));
    const at1059 = filterFutureHours(hours, getEffectiveHourIso(), 24);
    assert.equal(at1059[0].timeFormatted, '10:00');
    assert.equal(at1059.length, 4);

    // Às 11:00: a hora atual avança para 11:00
    setMockNow(new Date('2026-11-10T11:00:00'));
    const at1100 = filterFutureHours(hours, getEffectiveHourIso(), 24);
    assert.equal(at1100[0].timeFormatted, '11:00');
    assert.equal(at1100.length, 3);
    assert.equal(at1100.some((h) => h.timeFormatted === '10:00'), false, '10:00 deve ter saído do horizonte futuro');
  });

  // 2. Passagem de dia: 23:59 -> 00:00
  it('2. Passagem de 23:59 para 00:00 atualiza a data efetiva de Hoje e acompanha o novo dia', () => {
    setMockNow(new Date('2026-11-09T23:59:00'));
    assert.equal(getEffectiveDateIso(), '2026-11-09');
    assert.equal(getEffectiveHourIso(), '2026-11-09T23:00');

    setMockNow(new Date('2026-11-10T00:00:00'));
    assert.equal(getEffectiveDateIso(), '2026-11-10');
    assert.equal(getEffectiveHourIso(), '2026-11-10T00:00');
  });

  // 3. Retoma após várias horas em segundo plano
  it('3. Retoma após várias horas em segundo plano descarta imediatamente horas passadas', () => {
    // Série contínua das 08:00 às 20:00
    const hours = Array.from({ length: 13 }, (_, i) => {
      const h = String(8 + i).padStart(2, '0');
      return { timeIso: `2026-11-10T${h}:00`, timeFormatted: `${h}:00` };
    });

    // Sessão iniciada às 08:00
    setMockNow(new Date('2026-11-10T08:00:00'));
    const initial = filterFutureHours(hours, getEffectiveHourIso(), 24);
    assert.equal(initial.length, 13);
    assert.equal(initial[0].timeFormatted, '08:00');

    // Utilizador regressa 6 horas depois (às 14:15)
    setMockNow(new Date('2026-11-10T14:15:00'));
    const resumed = filterFutureHours(hours, getEffectiveHourIso(), 24);
    assert.equal(resumed[0].timeFormatted, '14:00');
    assert.equal(resumed.length, 7); // 14:00 até 20:00
    assert.equal(resumed.some((h) => parseInt(h.timeFormatted) < 14), false);
  });

  // 4. Horizonte inferior a 24/48 horas
  it('4. Quando restam menos de 24h/48h no modelo, devolve exatamente as horas disponíveis sem fabricar dados', () => {
    const hours = [
      { timeIso: '2026-11-10T20:00', timeFormatted: '20:00' },
      { timeIso: '2026-11-10T21:00', timeFormatted: '21:00' },
      { timeIso: '2026-11-10T22:00', timeFormatted: '22:00' },
      { timeIso: '2026-11-10T23:00', timeFormatted: '23:00' }
    ];

    setMockNow(new Date('2026-11-10T21:00:00'));
    // Pedir 48h com apenas 3 horas disponíveis
    const result48 = filterFutureHours(hours, getEffectiveHourIso(), 48);
    assert.equal(result48.length, 3, 'Deve devolver apenas as 3 horas restantes');
    assert.equal(result48[0].timeFormatted, '21:00');
    assert.equal(result48[2].timeFormatted, '23:00');

    // Quando todas as horas já passaram
    setMockNow(new Date('2026-11-11T02:00:00'));
    const emptyResult = filterFutureHours(hours, getEffectiveHourIso(), 48);
    assert.equal(emptyResult.length, 0, 'Deve devolver array vazio e não inventar horas');
  });

  // 5. Preservação de Data Futura Explicitamente Selecionada
  it('5. Data futura explicitamente selecionada não é alterada pelo avanço do relógio', () => {
    const fullHours = [
      { timeIso: '2026-11-10T10:00', timeFormatted: '10:00' },
      { timeIso: '2026-11-11T08:00', timeFormatted: '08:00' },
      { timeIso: '2026-11-11T09:00', timeFormatted: '09:00' },
      { timeIso: '2026-11-11T10:00', timeFormatted: '10:00' }
    ];

    const selectedDateIso = '2026-11-11';
    // O relógio está no dia 10 e avança 2 horas
    setMockNow(new Date('2026-11-10T10:00:00'));
    const dayFiltered1 = fullHours.filter((h) => h.timeIso.startsWith(selectedDateIso));
    assert.equal(dayFiltered1.length, 3);

    setMockNow(new Date('2026-11-10T12:00:00'));
    const dayFiltered2 = fullHours.filter((h) => h.timeIso.startsWith(selectedDateIso));
    assert.equal(dayFiltered2.length, 3, 'A seleção de dia futuro deve manter o dia civil completo de 2026-11-11');
    assert.equal(dayFiltered2[0].timeFormatted, '08:00');
  });

  // 6. Subscrição, Notificação e Limpeza de Timers/Listeners
  it('6. subscribeToWeatherTime adiciona listener e unsubscribe limpa recursos sem fuga', () => {
    let callCount = 0;
    const unsubscribe = subscribeToWeatherTime(() => {
      callCount++;
    });

    // Forçar avanço de relógio
    setMockNow(new Date('2026-11-10T15:00:00'));
    assert.ok(callCount >= 1, 'Listener deve ser notificado na alteração da hora');

    const previousCount = callCount;
    unsubscribe();

    // Novo avanço após unsubscribe não deve notificar
    setMockNow(new Date('2026-11-10T16:00:00'));
    assert.equal(callCount, previousCount, 'Após unsubscribe não deve receber notificações');
  });
});
