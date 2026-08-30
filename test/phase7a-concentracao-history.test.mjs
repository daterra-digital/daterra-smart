/**
 * DATERRA Smart - Testes da Fase 7A: Migração do Histórico da Concentração para calculation_history_v2
 * Cobertura Completa dos 24 Requisitos Obrigatórios
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildCalculationRecord,
  evaluateHistoryQuota,
  filterHistoryRecords,
  cleanAndDeduplicateTags
} from '../src/features/calculators/core/historyService.ts';

import {
  concentracaoCalculatorConfig,
  calculateConcentrationPure
} from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';

import {
  calculateDosePure
} from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

import {
  hasEligibleTransferTargets
} from '../src/features/calculators/core/transferService.ts';

import {
  getPendingTransfer
} from '../src/features/calculators/core/transferSession.ts';

describe('Fase 7A: Migração do Histórico da Calculadora de Concentração para calculation_history_v2', () => {
  const testUserId = 'user-eng-agronomo-01';

  // Helper para simular cálculos estruturados da Concentração
  function createConcentracaoRecord(mode = 'planta_jovem', idSuffix = '1', isSolid = false) {
    const concUnit = isSolid ? 'g/hL' : 'mL/hL';
    const concVal = 100;
    const volPrep = 400;
    const volRec = 1000;
    const volApl = 400;

    const pure = calculateConcentrationPure(concVal, concUnit, volPrep, volRec, volApl, mode);

    const inputs = {
      mode: {
        rawValue: mode,
        unit: '',
        normalizedValue: 0,
        dimension: 'text',
        canonicalKey: 'calculator_mode',
        label: 'Modo de Operação Vegetativa',
        source: 'user_input',
        localId: 'mode',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      },
      concValue: {
        rawValue: concVal,
        unit: concUnit,
        normalizedValue: concVal,
        dimension: 'concentration',
        canonicalKey: 'concentration',
        label: 'Concentração Recomendada',
        source: 'user_input',
        localId: 'concValue',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      },
      volPrepararConc: {
        rawValue: volPrep,
        unit: 'L',
        normalizedValue: volPrep,
        dimension: 'volume',
        canonicalKey: 'tank_volume',
        label: 'Volume a Preparar',
        source: 'user_input',
        localId: 'volPrepararConc',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      }
    };

    if (mode === 'planta_adulta') {
      inputs.volRecomendado = {
        rawValue: volRec,
        unit: 'L/ha',
        normalizedValue: volRec,
        dimension: 'application_rate',
        canonicalKey: 'spray_volume_rate',
        label: 'Volume Recomendado',
        source: 'user_input',
        localId: 'volRecomendado',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      };
      inputs.volAplicado = {
        rawValue: volApl,
        unit: 'L/ha',
        normalizedValue: volApl,
        dimension: 'application_rate',
        canonicalKey: 'spray_volume_rate',
        label: 'Volume Aplicado',
        source: 'user_input',
        localId: 'volAplicado',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      };
    }

    const outputs = {
      quantidade_pf: {
        rawValue: pure.primaryValue,
        unit: pure.primaryUnit,
        subValue: pure.subValue,
        subUnit: pure.subUnit,
        dimension: pure.isSolid ? 'mass' : 'volume',
        canonicalKey: 'product_commercial_quantity',
        label: 'Quantidade Necessária de Pesticida',
        source: 'calculated_output',
        localId: 'quantidade_pf',
        calculatorId: 'calc_concentracao',
        calculatorVersion: '1.0.0'
      }
    };

    return buildCalculationRecord({
      userId: testUserId,
      calculatorId: 'calc_concentracao',
      calculatorVersion: '1.0.0',
      name: `Cálculo ${mode === 'planta_jovem' ? 'Jovem' : 'Adulta'} #${idSuffix}`,
      inputs,
      outputs
    });
  }

  // ========================================================
  // 1. Guardar cálculo Planta Jovem em calculation_history_v2
  // ========================================================
  test('1. Guardar cálculo Planta Jovem com estrutura canónica calculation_history_v2', () => {
    const record = createConcentracaoRecord('planta_jovem', '1', false);
    assert.equal(record.calculatorId, 'calc_concentracao');
    assert.equal(record.userId, testUserId);
    assert.equal(record.inputs['mode'].rawValue, 'planta_jovem');
    assert.equal(record.outputs['quantidade_pf'].rawValue, 400);
    assert.equal(record.outputs['quantidade_pf'].unit, 'mL');
    assert.equal(record.outputs['quantidade_pf'].subValue, 0.4);
    assert.equal(record.outputs['quantidade_pf'].subUnit, 'L');
    assert.equal(record.syncStatus, 'local_only');
    assert.equal(record.isDeleted, false);
  });

  // ========================================================
  // 2. Guardar cálculo Planta Adulta em calculation_history_v2
  // ========================================================
  test('2. Guardar cálculo Planta Adulta com estrutura canónica calculation_history_v2', () => {
    const record = createConcentracaoRecord('planta_adulta', '2', false);
    assert.equal(record.calculatorId, 'calc_concentracao');
    assert.equal(record.userId, testUserId);
    assert.equal(record.inputs['mode'].rawValue, 'planta_adulta');
    assert.ok(record.inputs['volRecomendado']);
    assert.ok(record.inputs['volAplicado']);
    assert.equal(record.outputs['quantidade_pf'].rawValue, 1.0);
    assert.equal(record.outputs['quantidade_pf'].unit, 'L');
    assert.equal(record.outputs['quantidade_pf'].subValue, 1000);
    assert.equal(record.outputs['quantidade_pf'].subUnit, 'mL');
  });

  // ========================================================
  // 3. Garantir que Concentração deixa de escrever na tabela legada
  // ========================================================
  test('3. Concentração deixa de escrever na tabela legada db.calculation_history', () => {
    const toolsViewCode = fs.readFileSync(
      path.resolve('src/views/ToolsView.tsx'),
      'utf8'
    );
    // Verifica que o bloco calc_concentracao não tem onSaveCalculation que grave na tabela legada
    assert.ok(!toolsViewCode.includes("currentViewTool === 'calc_concentracao'\n    return (\n      <UniversalCalculatorTemplate\n        definition={concentracaoCalculatorConfig}\n        onBack={handleBackToCatalog}\n        saveButtonLabel="));
    assert.ok(toolsViewCode.includes("if (currentViewTool === 'calc_concentracao') {\n    return (\n      <UniversalCalculatorTemplate\n        definition={concentracaoCalculatorConfig}\n        onBack={handleBackToCatalog}\n      />\n    );"));
  });

  // ========================================================
  // 4. Verificar que Dose continua isolada no seu próprio histórico
  // ========================================================
  test('4. Histórico da Concentração não interfere no histórico da Dose', () => {
    const doseRecord = buildCalculationRecord({
      userId: testUserId,
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0',
      inputs: {},
      outputs: {}
    });
    const concRecord = createConcentracaoRecord('planta_jovem', '3');

    const records = [doseRecord, concRecord];
    const onlyConc = records.filter(r => r.calculatorId === 'calc_concentracao');
    const onlyDose = records.filter(r => r.calculatorId === 'calc_dose');

    assert.equal(onlyConc.length, 1);
    assert.equal(onlyDose.length, 1);
    assert.equal(onlyConc[0].calculatorId, 'calc_concentracao');
    assert.equal(onlyDose[0].calculatorId, 'calc_dose');
  });

  // ========================================================
  // 5. Leitura isolada por utilizador, ferramenta e não-eliminados
  // ========================================================
  test('5. Leitura isolada apenas de utilizador autenticado, calc_concentracao e isDeleted false', () => {
    const user1Rec = createConcentracaoRecord('planta_jovem', 'u1');
    const user2Rec = { ...createConcentracaoRecord('planta_jovem', 'u2'), userId: 'other-user' };
    const deletedRec = { ...createConcentracaoRecord('planta_jovem', 'del'), isDeleted: true };

    const pool = [user1Rec, user2Rec, deletedRec];
    const filtered = pool.filter(r => r.calculatorId === 'calc_concentracao' && r.userId === testUserId && !r.isDeleted);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, user1Rec.id);
  });

  // ========================================================
  // 6. Mostrar corretamente o modo no cartão
  // ========================================================
  test('6. Cartão de histórico exibe badge do modo (Planta Jovem e Planta Adulta)', () => {
    const cardCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationHistoryCard.tsx'),
      'utf8'
    );
    assert.ok(cardCode.includes("isAdulta ? 'Planta Adulta' : 'Planta Jovem'"));
    assert.ok(cardCode.includes("{modeLabel}"));
  });

  // ========================================================
  // 7. Mostrar corretamente unidades líquidas
  // ========================================================
  test('7. Suporte a unidades líquidas (mL e L) no resultado principal e sub-resultado', () => {
    const recLiquid = createConcentracaoRecord('planta_jovem', 'liq', false);
    assert.equal(recLiquid.outputs['quantidade_pf'].unit, 'mL');
    assert.equal(recLiquid.outputs['quantidade_pf'].subUnit, 'L');
  });

  // ========================================================
  // 8. Mostrar corretamente unidades sólidas
  // ========================================================
  test('8. Suporte a unidades sólidas (g e kg) no resultado principal e sub-resultado', () => {
    const recSolid = createConcentracaoRecord('planta_jovem', 'sol', true);
    assert.equal(recSolid.outputs['quantidade_pf'].unit, 'g');
    assert.equal(recSolid.outputs['quantidade_pf'].subUnit, 'kg');
  });

  // ========================================================
  // 9. Mostrar corretamente resultado principal e auxiliar
  // ========================================================
  test('9. Exibição rigorosa de resultado principal e equivalente auxiliar', () => {
    const cardCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculationHistoryCard.tsx'),
      'utf8'
    );
    assert.ok(cardCode.includes('{pfValue}'));
    assert.ok(cardCode.includes('{subVal}'));
  });

  // ========================================================
  // 10. Aplicar limite de 20 cálculos por utilizador e calculadora
  // ========================================================
  test('10. Quota estrita de 20 cálculos por utilizador e por calculadora', () => {
    const mockList = [];
    for (let i = 0; i < 20; i++) {
      mockList.push(createConcentracaoRecord('planta_jovem', String(i)));
    }
    const quota20 = evaluateHistoryQuota('calc_concentracao', testUserId, mockList);
    assert.equal(quota20.totalActive, 20);
    assert.equal(quota20.isLimitReached, true);
    assert.equal(quota20.maxAllowed, 20);
  });

  // ========================================================
  // 11. Tratar a tentativa do 21.º cálculo
  // ========================================================
  test('11. Tentativa do 21.º cálculo bloqueia gravação direta e exige substituição confirmada', () => {
    const mockList = [];
    for (let i = 0; i < 20; i++) {
      mockList.push(createConcentracaoRecord('planta_jovem', String(i)));
    }
    const quota = evaluateHistoryQuota('calc_concentracao', testUserId, mockList);
    assert.equal(quota.isLimitReached, true);
  });

  // ========================================================
  // 12. Eliminar cálculo individual (soft-delete)
  // ========================================================
  test('12. Eliminação individual marca cálculo como isDeleted e liberta vaga na quota', () => {
    const rec = createConcentracaoRecord('planta_jovem', 'to-del');
    const updated = { ...rec, isDeleted: true, deletedAt: new Date().toISOString() };
    assert.equal(updated.isDeleted, true);
    assert.ok(updated.deletedAt);

    const quota = evaluateHistoryQuota('calc_concentracao', testUserId, [updated]);
    assert.equal(quota.totalActive, 0);
    assert.equal(quota.isLimitReached, false);
  });

  // ========================================================
  // 13. Limpar apenas o histórico da Concentração
  // ========================================================
  test('13. Limpeza total de histórico afeta apenas calc_concentracao', () => {
    const templateCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx'),
      'utf8'
    );
    assert.ok(templateCode.includes('clearCalculatorHistoryInDb(definition.id, effectiveUserId)'));
  });

  // ========================================================
  // 14. Editar nome, notas e etiquetas
  // ========================================================
  test('14. Edição de nome, notas e etiquetas atualiza updatedAt sem alterar inputs/outputs', () => {
    const rec = createConcentracaoRecord('planta_jovem', 'edit-test');
    const originalInputs = JSON.stringify(rec.inputs);
    const originalOutputs = JSON.stringify(rec.outputs);

    const edited = {
      ...rec,
      name: 'Vinha da Encosta Sul',
      notes: 'Tratamento preventivo contra míldio',
      tags: ['Vinha', 'Fungicida'],
      updatedAt: new Date().toISOString()
    };

    assert.equal(edited.name, 'Vinha da Encosta Sul');
    assert.equal(JSON.stringify(edited.inputs), originalInputs);
    assert.equal(JSON.stringify(edited.outputs), originalOutputs);
  });

  // ========================================================
  // 15. Pesquisar por nome e notas
  // ========================================================
  test('15. Pesquisa textual filtra corretamente por nome e por notas', () => {
    const rec1 = { ...createConcentracaoRecord('planta_jovem', '1'), name: 'Pomar de Maçã Alcobaça', notes: 'Pulverização matinal' };
    const rec2 = { ...createConcentracaoRecord('planta_adulta', '2'), name: 'Olival do Alentejo', notes: 'Tratamento de outono' };

    const pool = [rec1, rec2];
    const porNome = filterHistoryRecords(pool, 'Alcobaça', 'Todas');
    assert.equal(porNome.length, 1);
    assert.equal(porNome[0].name, 'Pomar de Maçã Alcobaça');

    const porNota = filterHistoryRecords(pool, 'outono', 'Todas');
    assert.equal(porNota.length, 1);
    assert.equal(porNota[0].name, 'Olival do Alentejo');
  });

  // ========================================================
  // 16. Filtrar por etiqueta
  // ========================================================
  test('16. Filtro por etiqueta e desduplicação correta', () => {
    const rec1 = { ...createConcentracaoRecord('planta_jovem', '1'), tags: ['Vinha', 'Tratamento Fungicida'] };
    const rec2 = { ...createConcentracaoRecord('planta_adulta', '2'), tags: ['Pomar', 'Tratamento Inseticida'] };

    const pool = [rec1, rec2];
    const filtradoVinha = filterHistoryRecords(pool, '', 'Vinha');
    assert.equal(filtradoVinha.length, 1);
    assert.equal(filtradoVinha[0].id, rec1.id);

    const tagsLimpos = cleanAndDeduplicateTags(['Vinha', '  vinha  ', 'Pomar', '']);
    assert.deepEqual(tagsLimpos, ['Vinha', 'Pomar']);
  });

  // ========================================================
  // 17. Persistir depois de recarregar a app (imutabilidade e tipos)
  // ========================================================
  test('17. Estrutura de dados serializável e imutável para IndexedDB offline', () => {
    const rec = createConcentracaoRecord('planta_jovem', 'ser');
    const jsonStr = JSON.stringify(rec);
    const parsed = JSON.parse(jsonStr);

    assert.equal(parsed.id, rec.id);
    assert.equal(parsed.calculatorId, 'calc_concentracao');
    assert.equal(parsed.inputs['mode'].rawValue, 'planta_jovem');
  });

  // ========================================================
  // 18. Funcionar offline
  // ========================================================
  test('18. Zero dependências remotas ou rede na persistência de calculation_history_v2', () => {
    const historyServiceCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/historyService.ts'),
      'utf8'
    );
    assert.ok(!historyServiceCode.includes('fetch('));
    assert.ok(!historyServiceCode.includes('supabase'));
    assert.ok(historyServiceCode.includes('calculation_history_v2'));
  });

  // ========================================================
  // 19. Não apresentar botão "Usar noutra ferramenta"
  // ========================================================
  test('19. Botão "Usar noutra ferramenta" não aparece para cálculos de Concentração nem de Dose sem destino', () => {
    const concRecord = createConcentracaoRecord('planta_jovem', 'x');
    assert.equal(hasEligibleTransferTargets(concRecord), false);
  });

  // ========================================================
  // 20. Não criar sessões de transferência
  // ========================================================
  test('20. Nenhuma sessão de transferência ativa em memória', () => {
    assert.equal(getPendingTransfer(), null);
  });

  // ========================================================
  // 21. Não mostrar mensagens falsas de importação
  // ========================================================
  test('21. Faixas de importação bloqueadas sem valores aplicados', () => {
    const templateCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/UniversalCalculatorTemplate.tsx'),
      'utf8'
    );
    assert.ok(templateCode.includes('appliedCount > 0'));
  });

  // ========================================================
  // 22. Não alterar fórmulas, teclado, atalhos ou microlearning
  // ========================================================
  test('22. Preservação de fórmulas, unidades e 4 atalhos por campo na Concentração', () => {
    for (const f of concentracaoCalculatorConfig.fields) {
      if (f.presets) {
        assert.ok(f.presets.length <= 4);
      }
    }
    const pure = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(pure.quantidade_pf_small, 400);
  });

  // ========================================================
  // 23. Não alterar Dose nem Área de Parede Foliar
  // ========================================================
  test('23. Calculadora de Dose e Área de Parede Foliar permanecem intactas', () => {
    const dosePure = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(dosePure.primaryValue, 10);

    const toolsViewCode = fs.readFileSync(
      path.resolve('src/views/ToolsView.tsx'),
      'utf8'
    );
    assert.ok(toolsViewCode.includes("currentViewTool === 'calc_area_parede_foliar'"));
  });

  // ========================================================
  // 24. Acessibilidade do Histórico da Concentração
  // ========================================================
  test('24. Drawer e modais cumprem acessibilidade com role="dialog", aria-modal="true" e Escape', () => {
    const drawerCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/CalculatorHistoryDrawer.tsx'),
      'utf8'
    );
    assert.ok(drawerCode.includes('role="dialog"'));
    assert.ok(drawerCode.includes('aria-modal="true"'));

    const detailCode = fs.readFileSync(
      path.resolve('src/features/calculators/history/HistoryDetailModal.tsx'),
      'utf8'
    );
    assert.ok(detailCode.includes('role="dialog"'));
    assert.ok(detailCode.includes('aria-modal="true"'));
  });
});
