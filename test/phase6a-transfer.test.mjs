/**
 * DATERRA Smart - Testes da Fundação Técnica de Reutilização Segura de Dados (Fase 6A & 6B)
 * Verificação das Regras Canónicas de Elegibilidade e Isolamento
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  evaluateCalculationTransfer,
  evaluateDoseToConcentracao,
  hasEligibleTransferTargets
} from '../src/features/calculators/core/transferService.ts';
import { calculateDosePure } from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

describe('Fase 6A: Fundação Técnica de Reutilização Segura de Dados ("Usar noutra ferramenta")', () => {
  const mockDoseRecord = {
    id: 'dose-calc-test-01',
    userId: 'user-pedro-01',
    calculatorId: 'calc_dose',
    calculatorVersion: '1.0.0',
    name: 'Aplicação Vinha Trás-os-Montes',
    notes: 'Calibração efetuada de manhã com tempo seco.',
    tags: ['Vinha', 'Fungicida'],
    inputs: {
      volPrepararDose: {
        rawValue: 1000,
        unit: 'L',
        dimension: 'volume',
        canonicalKey: 'tank_volume',
        label: 'Volume a Preparar (L)',
        source: 'user_input',
        localId: 'volPrepararDose',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0'
      },
      doseValue: {
        rawValue: 2,
        unit: 'L/ha',
        dimension: 'application_rate',
        canonicalKey: 'product_dose_rate',
        label: 'Dose Recomendada por ha',
        source: 'user_input',
        localId: 'doseValue',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0'
      },
      volCalda: {
        rawValue: 200,
        unit: 'L/ha',
        dimension: 'application_rate',
        canonicalKey: 'spray_volume_rate',
        label: 'Volume Aplicado (L/ha)',
        source: 'user_input',
        localId: 'volCalda',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0'
      }
    },
    outputs: {
      quantidade_pf: {
        rawValue: 10,
        unit: 'L',
        subValue: 10000,
        subUnit: 'mL',
        dimension: 'volume',
        canonicalKey: 'product_commercial_quantity',
        label: 'Quantidade Necessária de Produto',
        source: 'calculated_output',
        localId: 'quantidade_pf',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0'
      },
      area_tratada_ha: {
        rawValue: 5,
        unit: 'ha',
        dimension: 'area',
        canonicalKey: 'treated_area',
        label: 'Área Tratada por Depósito',
        source: 'calculated_output',
        localId: 'area_tratada_ha',
        calculatorId: 'calc_dose',
        calculatorVersion: '1.0.0'
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'local_only',
    isDeleted: false
  };

  test('1. A avaliação de transferência rejeita registos que não sejam de calc_dose', () => {
    const invalidRecord = { ...mockDoseRecord, calculatorId: 'calc_other' };
    const previews = evaluateCalculationTransfer(invalidRecord);
    assert.equal(previews.length, 0);

    const deletedRecord = { ...mockDoseRecord, isDeleted: true };
    assert.equal(evaluateCalculationTransfer(deletedRecord).length, 0);
  });

  test('2. A lista de ferramentas elegíveis é vazia quando não há campos compatíveis comprovados', () => {
    const previews = evaluateCalculationTransfer(mockDoseRecord);
    assert.ok(Array.isArray(previews));
    assert.equal(previews.length, 0);
    assert.equal(hasEligibleTransferTargets(mockDoseRecord), false);
  });

  test('3. A avaliação detalhada de Dose -> Concentração apresenta zero campos transferíveis', () => {
    const detail = evaluateDoseToConcentracao(mockDoseRecord);
    assert.equal(detail.targetCalculatorId, 'calc_concentracao');
    assert.equal(detail.compatibleFields.length, 0);
  });

  test('4. Volume a Preparar da Dose não é considerado automaticamente compatível sem contexto', () => {
    const detail = evaluateDoseToConcentracao(mockDoseRecord);
    const volIncomp = detail.incompatibleSourceValues.find((f) => f.sourceCanonicalKey === 'tank_volume');
    assert.ok(volIncomp);
  });

  test('5. Volume Aplicado da Dose não é transferido para a Concentração', () => {
    const detail = evaluateDoseToConcentracao(mockDoseRecord);
    const sprayIncomp = detail.incompatibleSourceValues.find((f) => f.sourceCanonicalKey === 'spray_volume_rate');
    assert.ok(sprayIncomp);
  });

  test('6. Não transfere automaticamente product_dose_rate para concentração', () => {
    const detail = evaluateDoseToConcentracao(mockDoseRecord);
    const transferredDose = detail.compatibleFields.find((f) => f.sourceCanonicalKey === 'product_dose_rate');
    assert.equal(transferredDose, undefined);

    const incompDose = detail.incompatibleSourceValues.find((f) => f.sourceCanonicalKey === 'product_dose_rate');
    assert.ok(incompDose);
    assert.ok(incompDose.reasonPt.includes('dimensão e significado'));
  });

  test('7. O campo de concentração do destino é declarado como não preenchido (em branco)', () => {
    const detail = evaluateDoseToConcentracao(mockDoseRecord);
    const unfilledConc = detail.unfilledTargetFields.find((f) => f.targetCanonicalKey === 'concentration');
    assert.ok(unfilledConc);
    assert.equal(unfilledConc.targetCanonicalKey, 'concentration');
    assert.ok(unfilledConc.reasonPt.includes('rótulo'));
  });

  test('8. Não usa automaticamente a Quantidade Necessária de Produto como entrada', () => {
    const detail = evaluateDoseToConcentracao(mockDoseRecord);
    const pfInComp = detail.compatibleFields.find((f) => f.sourceCanonicalKey === 'product_commercial_quantity');
    assert.equal(pfInComp, undefined);

    const pfIncompat = detail.incompatibleSourceValues.find((f) => f.sourceCanonicalKey === 'product_commercial_quantity');
    assert.ok(pfIncompat);
    assert.ok(pfIncompat.reasonPt.includes('Resultado de saída operacional'));
  });

  test('9. Não usa automaticamente a Área Tratada por Depósito como entrada', () => {
    const detail = evaluateDoseToConcentracao(mockDoseRecord);
    const areaInComp = detail.compatibleFields.find((f) => f.sourceCanonicalKey === 'treated_area');
    assert.equal(areaInComp, undefined);

    const areaIncompat = detail.incompatibleSourceValues.find((f) => f.sourceCanonicalKey === 'treated_area');
    assert.ok(areaIncompat);
    assert.ok(areaIncompat.reasonPt.includes('autonomia'));
  });

  test('10. CalculationTransferModal não executa redirecionamento sem campos compatíveis', () => {
    const modalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationTransferModal.tsx'),
      'utf8'
    );
    assert.ok(modalCode.includes('!hasCompatibleFields'));
    assert.ok(!modalCode.includes('window.location'));
  });

  test('11. CalculationTransferModal apresenta aviso oficial quando não há valores compatíveis', () => {
    const modalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationTransferModal.tsx'),
      'utf8'
    );
    assert.ok(modalCode.includes('NO_COMPATIBLE_FIELDS_NOTICE'));
  });

  test('12. CalculationTransferModal não faz escrita na base de dados (Dexie / calculation_history_v2)', () => {
    const modalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationTransferModal.tsx'),
      'utf8'
    );
    assert.ok(!modalCode.includes('calculation_history_v2.add'));
    assert.ok(!modalCode.includes('db.calculation_history_v2'));
  });

  test('13. Não existe qualquer referência ou escrita na tabela legada', () => {
    const transferServiceCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/transferService.ts'),
      'utf8'
    );
    assert.ok(!transferServiceCode.includes('calculation_history.'));
    assert.ok(!transferServiceCode.includes('db.'));
  });

  test('14. CalculationTransferModal possui acessibilidade de diálogo (role="dialog", aria-modal="true" e Escape)', () => {
    const modalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationTransferModal.tsx'),
      'utf8'
    );
    assert.ok(modalCode.includes('role="dialog"'));
    assert.ok(modalCode.includes('aria-modal="true"'));
    assert.ok(modalCode.includes("e.key === 'Escape'"));
    assert.ok(modalCode.includes('Fechar'));
  });

  test('15. CalculationTransferModal gere o foco devolvendo ao botão de origem', () => {
    const modalCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationTransferModal.tsx'),
      'utf8'
    );
    assert.ok(modalCode.includes('triggerButtonRef?.current?.focus()'));
  });

  test('16. Botões de ajuda de resultados respeitam a área mínima de toque de 48 × 48 px', () => {
    const resultCardCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/CalculatorResultCard.tsx'),
      'utf8'
    );
    assert.ok(resultCardCode.includes('min-w-[48px]'));
    assert.ok(resultCardCode.includes('min-h-[48px]'));
    assert.ok(resultCardCode.includes('touch-target'));
  });

  test('17. A Calculadora de Dose mantém fórmulas puras sem qualquer regressão', () => {
    const result = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(result.primaryValue, 10);
    assert.equal(result.primaryUnit, 'L');
    assert.equal(result.subValue, 10000);
    assert.equal(result.subUnit, 'mL');
    assert.equal(result.area_tratada_ha, 5);
  });

  test('18. Botão "Usar noutra ferramenta" não aparece quando a lista de destinos elegíveis está vazia', () => {
    const cardCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationHistoryCard.tsx'),
      'utf8'
    );
    assert.ok(cardCode.includes('hasEligibleTransferTargets(record)'));

    const detailCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/HistoryDetailModal.tsx'),
      'utf8'
    );
    assert.ok(detailCode.includes('hasEligibleTransferTargets(record)'));
  });
});
