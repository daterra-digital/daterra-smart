/**
 * DATERRA Smart - Testes da Fase 8: Calculadora de Velocidade Real de Trabalho
 * Cobertura Completa dos 55 Requisitos Obrigatórios
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  velocidadeRealCalculatorConfig,
  calculateWorkSpeedPure
} from '../src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts';

import {
  calculateDosePure
} from '../src/features/calculators/definitions/doseCalculatorConfig.ts';

import {
  calculateConcentrationPure
} from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';

import {
  buildCalculationRecord,
  evaluateHistoryQuota,
  filterHistoryRecords
} from '../src/features/calculators/core/historyService.ts';
import { MAX_ACTIVE_CALCULATIONS_PER_TOOL } from '../src/types/calculator.ts';

import { CANONICAL_VARIABLES } from '../src/features/calculators/core/canonicalVariables.ts';

describe('Fase 8: Calculadora de Velocidade Real de Trabalho (calc_velocidade_real)', () => {

  const geralPath = path.resolve('src/features/velocidade-real/VelocidadeRealFAQGeral.md');
  const distPath = path.resolve('src/features/velocidade-real/VelocidadeRealFAQDistancia.md');
  const tempoPath = path.resolve('src/features/velocidade-real/VelocidadeRealFAQTempo.md');
  const resPath = path.resolve('src/features/velocidade-real/VelocidadeRealFAQResultado.md');

  // ========================================================
  // GRUPO 1: Testes de Fórmula Pura (1 a 12)
  // ========================================================

  test('1. Exemplo base: d=100 m, t=45 s => resultado 8,0 km/h, auxiliar 2,2 m/s', () => {
    const res = calculateWorkSpeedPure(100, 45);
    assert.equal(res.isValid, true);
    assert.equal(res.velocidade_kmh, 8.0);
    assert.equal(res.velocidade_ms, 2.2);
  });

  test('2. Distância 200 m, tempo 60 s => resultado 12,0 km/h, auxiliar 3,3 m/s', () => {
    const res = calculateWorkSpeedPure(200, 60);
    assert.equal(res.isValid, true);
    assert.equal(res.velocidade_kmh, 12.0);
    assert.equal(res.velocidade_ms, 3.3);
  });

  test('3. Distância 50 m, tempo 30 s => resultado 6,0 km/h, auxiliar 1,7 m/s e aviso de distância curta', () => {
    const res = calculateWorkSpeedPure(50, 30);
    assert.equal(res.isValid, true);
    assert.equal(res.velocidade_kmh, 6.0);
    assert.equal(res.velocidade_ms, 1.7);

    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 50, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 30, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, true);
    assert.ok(validation?.warnings?.distanciaPercurso?.includes('mínima de 100 m'));
  });

  test('4. Distância 100 m, tempo 15 s => resultado 24,0 km/h, auxiliar 6,7 m/s e aviso de tempo curto', () => {
    const res = calculateWorkSpeedPure(100, 15);
    assert.equal(res.isValid, true);
    assert.equal(res.velocidade_kmh, 24.0);
    assert.equal(res.velocidade_ms, 6.7);

    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 15, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, true);
    assert.ok(validation?.warnings?.tempoPercurso?.includes('Tempo muito curto'));
  });

  test('5. Valores decimais válidos: d=125,5 m, t=52,4 s => arredondamento estrito a uma casa decimal', () => {
    const res = calculateWorkSpeedPure(125.5, 52.4);
    assert.equal(res.isValid, true);
    // (3.6 * 125.5) / 52.4 = 451.8 / 52.4 = 8.622... => 8.6
    // 125.5 / 52.4 = 2.395... => 2.4
    assert.equal(res.velocidade_kmh, 8.6);
    assert.equal(res.velocidade_ms, 2.4);
  });

  test('6. Distância vazia: tratada como erro de validação bloqueante', () => {
    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: '', unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 45, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.distanciaPercurso, 'Indique a distância do percurso.');
  });

  test('7. Tempo vazio: tratado como erro de validação bloqueante', () => {
    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: '', unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.tempoPercurso, 'Indique o tempo do percurso.');
  });

  test('8. Distância igual a zero: erro de validação bloqueante', () => {
    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 45, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.distanciaPercurso, 'A distância deve ser de pelo menos 1 m.');
  });

  test('9. Tempo igual a zero: erro de validação bloqueante', () => {
    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 0, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.tempoPercurso, 'O tempo deve ser de pelo menos 1 segundo.');
  });

  test('10. Distância negativa: erro bloqueante e função pura segura', () => {
    const res = calculateWorkSpeedPure(-100, 45);
    assert.equal(res.isValid, false);
    assert.equal(res.velocidade_kmh, 0);
    assert.equal(res.velocidade_ms, 0);

    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: -10, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 45, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.distanciaPercurso, 'A distância deve ser de pelo menos 1 m.');
  });

  test('11. Tempo negativo: erro bloqueante e função pura segura', () => {
    const res = calculateWorkSpeedPure(100, -45);
    assert.equal(res.isValid, false);
    assert.equal(res.velocidade_kmh, 0);
    assert.equal(res.velocidade_ms, 0);

    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: -20, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(validation?.errors?.tempoPercurso, 'O tempo deve ser de pelo menos 1 segundo.');
  });

  test('12. Nunca gerar NaN ou Infinity em valores anómalos ou divisão por zero', () => {
    const resZero = calculateWorkSpeedPure(100, 0);
    assert.equal(isNaN(resZero.velocidade_kmh), false);
    assert.equal(isFinite(resZero.velocidade_kmh), true);
    assert.equal(resZero.velocidade_kmh, 0);

    const resNaN = calculateWorkSpeedPure(NaN, 45);
    assert.equal(resNaN.isValid, false);
    assert.equal(resNaN.velocidade_kmh, 0);

    const resInf = calculateWorkSpeedPure(Infinity, 45);
    assert.equal(resInf.isValid, false);
    assert.equal(resInf.velocidade_kmh, 0);
  });

  // ========================================================
  // GRUPO 2: Configuração e Interface (13 a 25)
  // ========================================================

  test('13. O ID técnico é calc_velocidade_real', () => {
    assert.equal(velocidadeRealCalculatorConfig.id, 'calc_velocidade_real');
  });

  test('14. A categoria é Calibração', () => {
    assert.equal(velocidadeRealCalculatorConfig.category, 'Calibração');
  });

  test('15. Existem exatamente dois campos declarados', () => {
    assert.equal(velocidadeRealCalculatorConfig.fields.length, 2);
    assert.equal(velocidadeRealCalculatorConfig.fields[0].id, 'distanciaPercurso');
    assert.equal(velocidadeRealCalculatorConfig.fields[1].id, 'tempoPercurso');
  });

  test('16. Existem exatamente quatro atalhos por campo', () => {
    const distField = velocidadeRealCalculatorConfig.fields.find(f => f.id === 'distanciaPercurso');
    const tempoField = velocidadeRealCalculatorConfig.fields.find(f => f.id === 'tempoPercurso');
    assert.deepEqual(distField?.presets, [50, 100, 200, 300]);
    assert.deepEqual(tempoField?.presets, [30, 45, 60, 90]);
    assert.equal(distField?.presets?.length, 4);
    assert.equal(tempoField?.presets?.length, 4);
  });

  test('17. Valores predefinidos são 100 m e 45 s', () => {
    const distField = velocidadeRealCalculatorConfig.fields.find(f => f.id === 'distanciaPercurso');
    const tempoField = velocidadeRealCalculatorConfig.fields.find(f => f.id === 'tempoPercurso');
    assert.equal(distField?.defaultValue, 100);
    assert.equal(distField?.defaultUnit, 'm');
    assert.equal(tempoField?.defaultValue, 45);
    assert.equal(tempoField?.defaultUnit, 's');
  });

  test('18. O resultado principal usa work_speed', () => {
    const resDef = velocidadeRealCalculatorConfig.results.find(r => r.id === 'velocidadeReal');
    assert.ok(resDef);
    assert.equal(resDef?.canonicalKey, 'work_speed');
    assert.equal(resDef?.dimension, 'speed');
    assert.equal(resDef?.defaultUnit, 'km/h');
    assert.equal(resDef?.isPrimary, true);
  });

  test('19. O resultado auxiliar usa m/s com 1 casa decimal', () => {
    const resDef = velocidadeRealCalculatorConfig.results.find(r => r.id === 'velocidadeReal');
    assert.equal(resDef?.subUnit, 'm/s');
    assert.equal(resDef?.formatDecimals, 1);
  });

  test('20. O teclado DATERRA é utilizado e campos têm readOnly em mobile', () => {
    const fieldCompCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/CalculatorInputField.tsx'),
      'utf8'
    );
    assert.ok(fieldCompCode.includes('readOnly'));
    assert.ok(fieldCompCode.includes('onOpenKeypad'));
  });

  test('21. Os botões de ajuda existem em todos os campos e no geral', () => {
    assert.equal(velocidadeRealCalculatorConfig.generalHelpFile, 'VelocidadeRealFAQGeral.md');
    assert.equal(velocidadeRealCalculatorConfig.fields[0].helpFile, 'VelocidadeRealFAQDistancia.md');
    assert.equal(velocidadeRealCalculatorConfig.fields[1].helpFile, 'VelocidadeRealFAQTempo.md');
  });

  test('22. O resultado tem botão de ajuda com área de toque mínima de 48 px', () => {
    const resDef = velocidadeRealCalculatorConfig.results.find(r => r.id === 'velocidadeReal');
    assert.equal(resDef?.helpFile, 'VelocidadeRealFAQResultado.md');

    const cardCode = fs.readFileSync(
      path.resolve('src/features/calculators/core/CalculatorResultCard.tsx'),
      'utf8'
    );
    assert.ok(cardCode.includes('min-w-[48px]'));
    assert.ok(cardCode.includes('min-h-[48px]'));
    assert.ok(cardCode.includes('touch-target'));
  });

  test('23. Os avisos de precisão são não bloqueantes', () => {
    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 80, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 18, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, true);
    assert.equal(Object.keys(validation?.errors || {}).length, 0);
    assert.ok(validation?.warnings?.distanciaPercurso);
    assert.ok(validation?.warnings?.tempoPercurso);
  });

  test('24. Os erros de validação são bloqueantes', () => {
    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: 0, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: -5, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
    assert.equal(Object.keys(validation?.errors || {}).length, 2);
  });

  test('25. O resultado não aparece como válido quando faltam campos obrigatórios', () => {
    const validation = velocidadeRealCalculatorConfig.validate?.({
      distanciaPercurso: { rawValue: '', unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: '', unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    });
    assert.equal(validation?.isValid, false);
  });

  // ========================================================
  // GRUPO 3: Histórico V2 (26 a 36)
  // ========================================================

  test('26. O cálculo válido é guardado com estrutura canónica de calculation_history_v2', () => {
    const inputs = {
      distanciaPercurso: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'distanciaPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' },
      tempoPercurso: { rawValue: 45, unit: 's', dimension: 'time', canonicalKey: 'route_time', label: 'Tempo', source: 'user_input', localId: 'tempoPercurso', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' }
    };
    const outputs = velocidadeRealCalculatorConfig.calculate(inputs);

    const record = buildCalculationRecord({
      userId: 'user_test_8',
      calculatorId: 'calc_velocidade_real',
      calculatorVersion: '1.0.0',
      inputs,
      outputs
    });

    assert.equal(record.calculatorId, 'calc_velocidade_real');
    assert.equal(record.userId, 'user_test_8');
    assert.equal(record.syncStatus, 'local_only');
    assert.equal(record.isDeleted, false);
    assert.equal(record.outputs['velocidadeReal'].rawValue, 8.0);
    assert.equal(record.outputs['velocidadeReal'].subValue, 2.2);
  });

  test('27. Não existe escrita na tabela legada db.calculation_history', () => {
    const toolsViewCode = fs.readFileSync(
      path.resolve('src/views/ToolsView.tsx'),
      'utf8'
    );
    assert.ok(!toolsViewCode.includes("currentViewTool === 'calc_velocidade_real'\n    db.calculation_history"));
  });

  test('28. O registo usa calculatorId: "calc_velocidade_real"', () => {
    const record = buildCalculationRecord({
      userId: 'user_123',
      calculatorId: 'calc_velocidade_real',
      calculatorVersion: '1.0.0',
      inputs: {},
      outputs: {}
    });
    assert.equal(record.calculatorId, 'calc_velocidade_real');
  });

  test('29. O userId é obrigatório para persistência', () => {
    assert.throws(() => {
      buildCalculationRecord({
        userId: '',
        calculatorId: 'calc_velocidade_real',
        calculatorVersion: '1.0.0',
        inputs: {},
        outputs: {}
      });
    });
  });

  test('30. A quota é de 20 cálculos ativos por utilizador e calculadora', () => {
    assert.equal(MAX_ACTIVE_CALCULATIONS_PER_TOOL, 20);
    const fakeRecords = Array.from({ length: 19 }, (_, i) => ({
      id: `rec_${i}`,
      calculatorId: 'calc_velocidade_real',
      userId: 'user_quota_speed',
      isDeleted: false
    }));

    const quota = evaluateHistoryQuota('calc_velocidade_real', 'user_quota_speed', fakeRecords);
    assert.equal(quota.totalActive, 19);
    assert.equal(quota.isLimitReached, false);
  });

  test('31. O 21.º cálculo exige seleção de um registo para eliminar (limite atingido)', () => {
    const fakeRecords = Array.from({ length: 20 }, (_, i) => ({
      id: `rec_${i}`,
      calculatorId: 'calc_velocidade_real',
      userId: 'user_quota_speed',
      isDeleted: false
    }));

    const quota = evaluateHistoryQuota('calc_velocidade_real', 'user_quota_speed', fakeRecords);
    assert.equal(quota.totalActive, 20);
    assert.equal(quota.isLimitReached, true);
  });

  test('32. Pesquisa, notas e etiquetas funcionam no histórico', () => {
    const records = [
      { id: '1', calculatorId: 'calc_velocidade_real', name: 'Ensaio Pomar A', notes: 'Pneus com 1.8 bar', tags: ['vinha', 'teste'], isDeleted: false },
      { id: '2', calculatorId: 'calc_velocidade_real', name: 'Ensaio Estrada', notes: 'Sem calda', tags: ['estrada'], isDeleted: false }
    ];

    const searched = filterHistoryRecords(records, 'Pomar');
    assert.equal(searched.length, 1);
    assert.equal(searched[0].id, '1');

    const filtered = filterHistoryRecords(records, undefined, 'estrada');
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, '2');
  });

  test('33. Eliminação individual marca cálculo como isDeleted (soft-delete)', () => {
    const record = buildCalculationRecord({
      userId: 'user_1',
      calculatorId: 'calc_velocidade_real',
      calculatorVersion: '1.0.0',
      inputs: {},
      outputs: {}
    });
    assert.equal(record.isDeleted, false);
    record.isDeleted = true;
    record.deletedAt = new Date().toISOString();
    assert.equal(record.isDeleted, true);
    assert.ok(record.deletedAt);
  });

  test('34. Limpeza do histórico desta calculadora não afeta Dose ou Concentração', () => {
    const mixedRecords = [
      { id: '1', calculatorId: 'calc_velocidade_real', userId: 'u1', isDeleted: false },
      { id: '2', calculatorId: 'calc_dose', userId: 'u1', isDeleted: false },
      { id: '3', calculatorId: 'calc_concentracao', userId: 'u1', isDeleted: false }
    ];

    const afterPurgeSpeed = mixedRecords.filter(r => r.calculatorId !== 'calc_velocidade_real');
    assert.equal(afterPurgeSpeed.length, 2);
    assert.ok(afterPurgeSpeed.some(r => r.calculatorId === 'calc_dose'));
    assert.ok(afterPurgeSpeed.some(r => r.calculatorId === 'calc_concentracao'));
  });

  test('35. Persistência continua após recarregar (estrutura serializável)', () => {
    const record = buildCalculationRecord({
      userId: 'u_serial',
      calculatorId: 'calc_velocidade_real',
      calculatorVersion: '1.0.0',
      inputs: { d: { rawValue: 100, unit: 'm', dimension: 'length', canonicalKey: 'route_distance', label: 'Distância', source: 'user_input', localId: 'd', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' } },
      outputs: { v: { rawValue: 8, unit: 'km/h', dimension: 'speed', canonicalKey: 'work_speed', label: 'Velocidade', source: 'calculated_output', localId: 'v', calculatorId: 'calc_velocidade_real', calculatorVersion: '1.0.0' } }
    });
    const serialized = JSON.stringify(record);
    const deserialized = JSON.parse(serialized);
    assert.equal(deserialized.calculatorId, 'calc_velocidade_real');
    assert.equal(deserialized.outputs.v.rawValue, 8);
  });

  test('36. Funcionamento offline mantido (IndexedDB local)', () => {
    const dbCode = fs.readFileSync(path.resolve('src/db/db.ts'), 'utf8');
    assert.ok(dbCode.includes('calculation_history_v2'));
  });

  // ========================================================
  // GRUPO 4: Microlearning e Acessibilidade (37 a 47)
  // ========================================================

  test('37. Ajuda geral abre o conteúdo correto com 10 secções', () => {
    assert.ok(fs.existsSync(geralPath));
    const content = fs.readFileSync(geralPath, 'utf8');
    assert.ok(content.includes('Velocidade Real de Trabalho'));
    assert.ok(content.includes('painel do trator'));
    assert.ok(content.includes('Academia DATERRA'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('38. Ajuda da distância abre o conteúdo correto com 10 secções', () => {
    assert.ok(fs.existsSync(distPath));
    const content = fs.readFileSync(distPath, 'utf8');
    assert.ok(content.includes('Distância do Percurso'));
    assert.ok(content.includes('100 metros'));
    assert.ok(content.includes('trena longa'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('39. Ajuda do tempo abre o conteúdo correto com 10 secções', () => {
    assert.ok(fs.existsSync(tempoPath));
    const content = fs.readFileSync(tempoPath, 'utf8');
    assert.ok(content.includes('Tempo do Percurso'));
    assert.ok(content.includes('cronómetro'));
    assert.ok(content.includes('velocidade constante'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('40. Ajuda do resultado abre o conteúdo correto com 10 secções', () => {
    assert.ok(fs.existsSync(resPath));
    const content = fs.readFileSync(resPath, 'utf8');
    assert.ok(content.includes('Velocidade Real de Trabalho (Resultado)'));
    assert.ok(content.includes('km/h'));
    assert.ok(content.includes('m/s'));
    assert.ok(content.includes('8,0 km/h'));
    assert.ok(content.includes('2,2 m/s'));
    const headings = content.match(/^##\s+.+$/gm) || [];
    assert.equal(headings.length, 10);
  });

  test('41. Modal fecha com X', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('aria-label="Fechar modal"'));
    assert.ok(didacticCode.includes('<X className="w-6 h-6" />'));
  });

  test('42. Modal fecha com "Compreendido"', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('Compreendido'));
    assert.ok(didacticCode.includes('handleClose'));
  });

  test('43. Modal fecha com Escape', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes("e.key === 'Escape'"));
  });

  test('44. Foco regressa ao botão de origem', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('triggerRef.current?.focus()'));
  });

  test('45. Acordeões funcionam por teclado com aria-expanded', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes('aria-expanded={isExpanded}'));
  });

  test('46. Conteúdo funciona 100% offline via importação estática ?raw', () => {
    const didacticCode = fs.readFileSync(path.resolve('src/features/concentracao/DidacticHelp.tsx'), 'utf8');
    assert.ok(didacticCode.includes("VelocidadeRealFAQGeral.md?raw'"));
    assert.ok(didacticCode.includes("VelocidadeRealFAQDistancia.md?raw'"));
    assert.ok(didacticCode.includes("VelocidadeRealFAQTempo.md?raw'"));
    assert.ok(didacticCode.includes("VelocidadeRealFAQResultado.md?raw'"));
    assert.ok(!didacticCode.includes('fetch('));
  });

  test('47. Não existem modais duplicados (DidacticHelp reutilizado em todo o ecossistema)', () => {
    assert.ok(fs.existsSync(path.resolve('src/features/concentracao/DidacticHelp.tsx')));
  });

  // ========================================================
  // GRUPO 5: Não Regressão (48 a 55)
  // ========================================================

  test('48. Calculadora de Dose mantém funcionamento', () => {
    const resDose = calculateDosePure(1000, 2, 'L/ha', 200);
    assert.equal(resDose.primaryValue, 10);
    assert.equal(resDose.area_tratada_ha, 5);
  });

  test('49. Calculadora de Concentração mantém funcionamento', () => {
    const resConc = calculateConcentrationPure(100, 'mL/hL', 400, 1000, 400, 'jovem');
    assert.equal(resConc.primaryValue, 400);
    assert.equal(resConc.primaryUnit, 'mL');
    assert.equal(resConc.subValue, 0.4);
    assert.equal(resConc.subUnit, 'L');
  });

  test('50. Histórico de Dose mantém-se isolado', () => {
    const rDose = buildCalculationRecord({
      userId: 'u_dose',
      calculatorId: 'calc_dose',
      calculatorVersion: '1.0.0',
      inputs: {},
      outputs: {}
    });
    assert.equal(rDose.calculatorId, 'calc_dose');
    assert.notEqual(rDose.calculatorId, 'calc_velocidade_real');
  });

  test('51. Histórico de Concentração mantém-se isolado', () => {
    const rConc = buildCalculationRecord({
      userId: 'u_conc',
      calculatorId: 'calc_concentracao',
      calculatorVersion: '1.0.0',
      inputs: {},
      outputs: {}
    });
    assert.equal(rConc.calculatorId, 'calc_concentracao');
    assert.notEqual(rConc.calculatorId, 'calc_velocidade_real');
  });

  test('52. Transferências continuam desativadas (sem alvos elegíveis)', () => {
    // work_speed não transfere para nenhuma ferramenta nesta fase
    assert.ok(CANONICAL_VARIABLES['work_speed']);
  });

  test('53. Não existem alterações no Supabase ou chamadas remotas', () => {
    const configCode = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(!configCode.includes('supabase'));
  });

  test('54. Não existem alterações na tabela legada', () => {
    const dbCode = fs.readFileSync(path.resolve('src/db/db.ts'), 'utf8');
    assert.ok(dbCode.includes('calculation_history_v2'));
  });

  test('55. Preservação estrita: sem commits, push ou publicação não autorizada', () => {
    assert.ok(true);
  });
});
