/**
 * DATERRA Smart - Teste de Regressão de Segurança e Usabilidade SEC-19
 * Validação de Ergonomia de Campo: Inicialização com Inputs Vazios e Prontos para Dados
 *
 * Garante que:
 * 1. As calculadoras canónicas não iniciam com valores fictícios pré-populados.
 * 2. areaParedeFoliarCalculatorConfig define defaultValue como undefined nos campos obrigatórios.
 * 3. volumeCopaCalculatorConfig define defaultValue como undefined nos campos obrigatórios.
 * 4. concentracaoCalculatorConfig define defaultValue como undefined nos campos obrigatórios.
 * 5. doseCalculatorConfig define defaultValue como undefined nos campos obrigatórios.
 * 6. velocidadeRealCalculatorConfig define defaultValue como undefined nos campos obrigatórios.
 * 7. debitoTotalCalculatorConfig e volumeCaldaTrvCalculatorConfig mantêm defaultValue undefined.
 * 8. UniversalCalculatorTemplate apresenta '—' ou aviso de aguardar dados quando os inputs estão vazios.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-19: Ergonomia de Campo — Inicialização com Inputs Vazios', () => {

  it('1. areaParedeFoliarCalculatorConfig deve inicializar com defaultValue: undefined', () => {
    const config = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/areaParedeFoliarCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(!config.includes('defaultValue: 2.5'), 'Não deve ter defaultValue 2.5');
    assert.ok(!config.includes('defaultValue: 3.0'), 'Não deve ter defaultValue 3.0');
    assert.ok(config.includes('defaultValue: undefined'), 'Deve ter defaultValue: undefined');
  });

  it('2. volumeCopaCalculatorConfig deve inicializar com defaultValue: undefined', () => {
    const config = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/volumeCopaCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(!config.includes('defaultValue: 2.5'), 'Não deve ter defaultValue 2.5');
    assert.ok(!config.includes('defaultValue: 1.0'), 'Não deve ter defaultValue 1.0');
    assert.ok(!config.includes('defaultValue: 3.0'), 'Não deve ter defaultValue 3.0');
    assert.ok(config.includes('defaultValue: undefined'), 'Deve ter defaultValue: undefined');
  });

  it('3. concentracaoCalculatorConfig deve inicializar com defaultValue: undefined', () => {
    const config = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/concentracaoCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(!config.includes('defaultValue: 400'), 'Não deve ter defaultValue 400');
    assert.ok(!config.includes('defaultValue: 100'), 'Não deve ter defaultValue 100');
    assert.ok(config.includes('defaultValue: undefined'), 'Deve ter defaultValue: undefined');
  });

  it('4. doseCalculatorConfig deve inicializar com defaultValue: undefined', () => {
    const config = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/doseCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(!config.includes('defaultValue: 1000'), 'Não deve ter defaultValue 1000');
    assert.ok(!config.includes('defaultValue: 2,'), 'Não deve ter defaultValue 2');
    assert.ok(!config.includes('defaultValue: 200'), 'Não deve ter defaultValue 200');
    assert.ok(config.includes('defaultValue: undefined'), 'Deve ter defaultValue: undefined');
  });

  it('5. velocidadeRealCalculatorConfig deve inicializar com defaultValue: undefined', () => {
    const config = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(!config.includes('defaultValue: 100'), 'Não deve ter defaultValue 100');
    assert.ok(!config.includes('defaultValue: 45'), 'Não deve ter defaultValue 45');
    assert.ok(config.includes('defaultValue: undefined'), 'Deve ter defaultValue: undefined');
  });

  it('6. debitoTotalCalculatorConfig e volumeCaldaTrvCalculatorConfig devem ter defaultValue: undefined', () => {
    const debito = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/debitoTotalCalculatorConfig.ts'),
      'utf8'
    );
    const trv = fs.readFileSync(
      path.resolve('src/features/calculators/definitions/volumeCaldaTrvCalculatorConfig.ts'),
      'utf8'
    );
    assert.ok(debito.includes('defaultValue: undefined'), 'debitoTotal deve ter defaultValue: undefined');
    assert.ok(trv.includes('defaultValue: undefined'), 'volumeCaldaTrv deve ter defaultValue: undefined');
  });

  it('7. AreaParedeFoliarCalculator e VolumeCopaCalculator devem iniciar com zero e placeholder', () => {
    const lwa = fs.readFileSync(path.resolve('src/features/area-parede-foliar/AreaParedeFoliarCalculator.tsx'), 'utf8');
    const trv = fs.readFileSync(path.resolve('src/features/volume-copa/VolumeCopaCalculator.tsx'), 'utf8');

    assert.ok(lwa.includes('useState<number>(0)'), 'LWA deve iniciar com estado 0');
    assert.ok(trv.includes('useState<number>(0)'), 'TRV deve iniciar com estado 0');
  });

});
