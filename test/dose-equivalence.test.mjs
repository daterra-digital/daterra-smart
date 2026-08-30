/**
 * DATERRA Smart - Teste de Equivalência Matemática e Funcional da Calculadora de Dose
 * Fase 3 - Comparação Rigorosa entre a Implementação Legada e a Função Pura Nova
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { calculateDosePure } from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

// Implementação legada exata extraída de ToolsView.tsx (linhas 102-156 e 280-302)
function legacyCalculateDose(volPrepararDose, doseValue, doseUnit, volCalda) {
  function legacyFormatNumberPt(num, minDecimals = 0, maxDecimals = 2) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      useGrouping: false
    }).format(num);
  }

  function legacyGetSmartFormattedResult(amountInSmallUnits, isSolid = false) {
    const smallUnit = isSolid ? 'g' : 'mL';
    const largeUnit = isSolid ? 'kg' : 'L';
    const rawSmall = amountInSmallUnits;
    const rawLarge = amountInSmallUnits / 1000;
    const isLargePrimary = rawSmall >= 1000;

    const formattedLarge = legacyFormatNumberPt(rawLarge, 2, 2) + ' ' + largeUnit;
    const formattedSmall = legacyFormatNumberPt(rawSmall, 0, 2) + ' ' + smallUnit;

    return isLargePrimary
      ? {
          mainText: formattedLarge,
          subText: formattedSmall,
          rawSmall,
          smallUnit,
          rawLarge,
          largeUnit,
          isLargePrimary: true
        }
      : {
          mainText: formattedSmall,
          subText: formattedLarge,
          rawSmall,
          smallUnit,
          rawLarge,
          largeUnit,
          isLargePrimary: false
        };
  }

  let resultInSmall = 0;
  const isSolid = doseUnit.includes('kg');

  let rawDose = doseValue;
  if (doseUnit === 'L/ha' || doseUnit === 'kg/ha') {
    rawDose = doseValue * 1000;
  }

  if (volCalda > 0) {
    resultInSmall = (volPrepararDose * rawDose) / volCalda;
  }

  const areaTratada = volCalda > 0 ? volPrepararDose / volCalda : 0;
  const smart = legacyGetSmartFormattedResult(resultInSmall, isSolid);

  return {
    quantidade_pf: Number(resultInSmall.toFixed(2)),
    unit_pf: isSolid ? 'g' : 'mL',
    area_tratada_ha: Number(areaTratada.toFixed(2)),
    smart
  };
}

describe('Equivalência Matemática Estrita: Implementação Legada vs doseCalculatorConfig', () => {
  test('1. Caso de Valores Predefinidos Oficiais (1000 L, 2 L/ha, 200 L/ha)', () => {
    const volPrep = 1000;
    const dose = 2;
    const unit = 'L/ha';
    const calda = 200;

    const legacy = legacyCalculateDose(volPrep, dose, unit, calda);
    const pure = calculateDosePure(volPrep, dose, unit, calda);

    assert.equal(pure.quantidade_pf, legacy.quantidade_pf);
    assert.equal(pure.area_tratada_ha, legacy.area_tratada_ha);
    assert.equal(pure.smart.mainText, legacy.smart.mainText);
    assert.equal(pure.smart.subText, legacy.smart.subText);
    assert.equal(pure.smart.isLargePrimary, legacy.smart.isLargePrimary);

    // Validação agronómica: 10 L e 5 ha
    assert.equal(pure.quantidade_pf, 10000);
    assert.equal(pure.area_tratada_ha, 5);
    assert.equal(pure.smart.mainText, '10,00 L');
    assert.equal(pure.smart.subText, '10000 mL');
  });

  test('2. Caso de Valores Decimais (350.5 L, 1.75 L/ha, 180.25 L/ha)', () => {
    const volPrep = 350.5;
    const dose = 1.75;
    const unit = 'L/ha';
    const calda = 180.25;

    const legacy = legacyCalculateDose(volPrep, dose, unit, calda);
    const pure = calculateDosePure(volPrep, dose, unit, calda);

    assert.equal(pure.quantidade_pf, legacy.quantidade_pf);
    assert.equal(pure.area_tratada_ha, legacy.area_tratada_ha);
    assert.equal(pure.smart.mainText, legacy.smart.mainText);
    assert.equal(pure.smart.subText, legacy.smart.subText);
  });

  test('3. Caso de Valores Baixos Válidos (50 L, 0.25 L/ha, 80 L/ha -> resultado < 1000 mL)', () => {
    const volPrep = 50;
    const dose = 0.25;
    const unit = 'L/ha';
    const calda = 80;

    const legacy = legacyCalculateDose(volPrep, dose, unit, calda);
    const pure = calculateDosePure(volPrep, dose, unit, calda);

    assert.equal(pure.quantidade_pf, legacy.quantidade_pf);
    assert.equal(pure.area_tratada_ha, legacy.area_tratada_ha);
    assert.equal(pure.smart.mainText, legacy.smart.mainText);
    assert.equal(pure.smart.subText, legacy.smart.subText);
    assert.equal(pure.smart.isLargePrimary, false); // mL como unidade principal
  });

  test('4. Caso de Valores Elevados Válidos (3000 L, 5 L/ha, 600 L/ha)', () => {
    const volPrep = 3000;
    const dose = 5;
    const unit = 'L/ha';
    const calda = 600;

    const legacy = legacyCalculateDose(volPrep, dose, unit, calda);
    const pure = calculateDosePure(volPrep, dose, unit, calda);

    assert.equal(pure.quantidade_pf, legacy.quantidade_pf);
    assert.equal(pure.area_tratada_ha, legacy.area_tratada_ha);
    assert.equal(pure.smart.mainText, '25,00 L');
    assert.equal(pure.area_tratada_ha, 5);
  });

  test('5. Caso de Unidade Sólida kg/ha (1000 L, 3 kg/ha, 300 L/ha)', () => {
    const volPrep = 1000;
    const dose = 3;
    const unit = 'kg/ha';
    const calda = 300;

    const legacy = legacyCalculateDose(volPrep, dose, unit, calda);
    const pure = calculateDosePure(volPrep, dose, unit, calda);

    assert.equal(pure.isSolid, true);
    assert.equal(pure.unit_pf, 'g');
    assert.equal(pure.quantidade_pf, legacy.quantidade_pf);
    assert.equal(pure.area_tratada_ha, legacy.area_tratada_ha);
    assert.equal(pure.smart.mainText, '10,00 kg');
    assert.equal(pure.smart.subText, '10000 g');
  });

  test('6. Caso Limite: Divisão por Zero (volCalda = 0)', () => {
    const legacy = legacyCalculateDose(1000, 2, 'L/ha', 0);
    const pure = calculateDosePure(1000, 2, 'L/ha', 0);

    assert.equal(pure.quantidade_pf, 0);
    assert.equal(pure.area_tratada_ha, 0);
    assert.equal(pure.quantidade_pf, legacy.quantidade_pf);
    assert.equal(pure.area_tratada_ha, legacy.area_tratada_ha);
  });
});
