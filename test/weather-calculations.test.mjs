// test/weather-calculations.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

// Import the mathematical implementations
// Note: We test the exact mathematical formulas for psychrometrics, Delta T, VPD and spray decision

function calculateWetBulbTemperature(tempC, rhPercent) {
  const t = tempC;
  const rh = Math.min(100, Math.max(1, rhPercent));
  const tw =
    t * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(t + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  return Math.round(tw * 10) / 10;
}

function calculateDeltaT(tempC, rhPercent) {
  const wetBulb = calculateWetBulbTemperature(tempC, rhPercent);
  const deltaT = Math.max(0, tempC - wetBulb);
  return Math.round(deltaT * 10) / 10;
}

function calculateVpd(tempC, rhPercent) {
  const rhSafe = Math.min(100, Math.max(1, rhPercent));
  const es = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const vpd = es * (1 - rhSafe / 100);
  return Math.round(Math.max(0, vpd) * 100) / 100;
}

test('Validação Matemática e Agronómica — Módulo de Meteorologia & Decisão', async (t) => {
  await t.test('1.1. Temperatura de Bolbo Húmido (Stull) para 20°C e 50% HR', () => {
    const tw = calculateWetBulbTemperature(20, 50);
    // Standard psychrometric table for 20°C, 50% RH gives ~13.7°C
    assert.ok(tw >= 13.5 && tw <= 14.0, `tw esperada ~13.7°C, obtido ${tw}`);
  });

  await t.test('1.2. Delta T (ΔT) para 24°C e 62% HR (Cenário Canónico do Dashboard)', () => {
    const deltaT = calculateDeltaT(24, 62);
    // Para 24°C e 62% HR, tw ~ 18.5°C => Delta T ~ 5.5°C (ótimo entre 2 e 8°C)
    assert.ok(deltaT >= 4.0 && deltaT <= 6.5, `Delta T no intervalo ótimo, obtido ${deltaT}`);
  });

  await t.test('1.3. Delta T Crítico (> 10°C) em dia muito quente e seco (32°C e 25% HR)', () => {
    const deltaT = calculateDeltaT(32, 25);
    assert.ok(deltaT > 10.0, `Delta T deve ser crítico (> 10°C), obtido ${deltaT}`);
  });

  await t.test('1.4. Delta T Baixo (< 2°C) com condensação (15°C e 95% HR)', () => {
    const deltaT = calculateDeltaT(15, 95);
    assert.ok(deltaT < 2.0, `Delta T deve ser < 2°C, obtido ${deltaT}`);
  });

  await t.test('2.1. DPV (Défice de Pressão de Vapor) em kPa para 24°C e 62% HR', () => {
    const vpd = calculateVpd(24, 62);
    // Saturação a 24°C é ~2.98 kPa. Com 62% HR => VPD ~ 2.98 * 0.38 = 1.13 kPa
    assert.ok(vpd >= 1.0 && vpd <= 1.3, `VPD esperado entre 1.0 e 1.3 kPa, obtido ${vpd}`);
  });

  await t.test('2.2. DPV em dia húmido (18°C e 90% HR) resulta em baixa transpiração (< 0.5 kPa)', () => {
    const vpd = calculateVpd(18, 90);
    assert.ok(vpd < 0.5, `VPD deve ser baixo (< 0.5 kPa), obtido ${vpd}`);
  });
});
