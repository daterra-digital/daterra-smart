/**
 * DATERRA Smart - Testes de Conformidade da Decisao UX: Acessos ao Keypad e Resumo de Valores
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { concentracaoCalculatorConfig } from '../src/features/calculators/definitions/concentracaoCalculatorConfig.ts';
import { doseCalculatorConfig } from '../src/features/calculators/definitions/doseCalculatorConfig.ts';
import { velocidadeRealCalculatorConfig } from '../src/features/calculators/definitions/velocidadeRealCalculatorConfig.ts';
import { areaParedeFoliarCalculatorConfig } from '../src/features/calculators/definitions/areaParedeFoliarCalculatorConfig.ts';
import { volumeCopaCalculatorConfig } from '../src/features/calculators/definitions/volumeCopaCalculatorConfig.ts';
import { volumeCaldaTrvCalculatorConfig } from '../src/features/calculators/definitions/volumeCaldaTrvCalculatorConfig.ts';
import { debitoTotalCalculatorConfig } from '../src/features/calculators/definitions/debitoTotalCalculatorConfig.ts';

const rootDir = path.resolve('src');
const localesDir = path.join(rootDir, 'i18n', 'locales');
const universalTemplatePath = path.join(rootDir, 'features', 'calculators', 'core', 'UniversalCalculatorTemplate.tsx');

describe('Decisao de UX: Acessos ao DaterraUnifiedKeypad e Resumo de Valores', () => {

  test('1. Todos os 8 idiomas possuem enterValues definido corretamente', () => {
    const expected = {
      pt: 'Introduzir Valores',
      br: 'Inserir Valores',
      en: 'Enter Values',
      es: 'Introducir Valores',
      fr: 'Saisir les Valeurs',
      it: 'Inserisci Valori',
      de: 'Werte Eingeben',
      el: 'Εισαγωγή Τιμών'
    };

    for (const [lang, label] of Object.entries(expected)) {
      const filePath = path.join(localesDir, `${lang}.json`);
      assert.ok(fs.existsSync(filePath), `Ficheiro ${lang}.json deve existir`);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      assert.ok(content.unifiedKeypad, `unifiedKeypad deve existir em ${lang}.json`);
      assert.strictEqual(content.unifiedKeypad.enterValues, label, `enterValues em ${lang}.json deve ser "${label}"`);
    }
  });

  test('2. "Editar Tudo" e "Introduzir / Editar Dados" nao existem como rotulos no codigo do template', () => {
    const templateContent = fs.readFileSync(universalTemplatePath, 'utf8');
    assert.ok(!templateContent.includes('Editar Tudo'), 'UniversalCalculatorTemplate.tsx nao deve conter "Editar Tudo"');
    assert.ok(!templateContent.includes('unifiedKeypad.editAll'), 'UniversalCalculatorTemplate.tsx nao deve conter "unifiedKeypad.editAll"');
    assert.ok(!templateContent.includes('Introduzir / Editar Dados'), 'UniversalCalculatorTemplate.tsx nao deve conter "Introduzir / Editar Dados"');
  });

  test('3. Sticky Result Header nao contem botoes de edicao de dados', () => {
    const templateContent = fs.readFileSync(universalTemplatePath, 'utf8');
    const stickySectionMatch = templateContent.match(/\{!\s*isDesktop\s*&&\s*isPilotCalculator\s*&&\s*\(\s*<aside[\s\S]*?<\/aside>\s*\)\}/);
    assert.ok(stickySectionMatch, 'Sticky result aside deve existir');
    const stickyAside = stickySectionMatch[0];
    assert.ok(!stickyAside.includes('<button'), 'Sticky result header nao deve conter botoes de edicao');
    assert.ok(!stickyAside.includes('handleOpenUnifiedKeypad'), 'Sticky result header nao deve acionar keypad');
  });

  test('4. O cartao "Valores Introduzidos" contem o botao "Introduzir Valores" e linhas com foco', () => {
    const templateContent = fs.readFileSync(universalTemplatePath, 'utf8');
    assert.ok(templateContent.includes("t('unifiedKeypad.enterValues', 'Introduzir Valores')"), 'Cartao deve ter botao com enterValues');
    assert.ok(templateContent.includes("t('unifiedKeypad.inputSummaryTitle', 'Valores Introduzidos')"), 'Cartao deve ter inputSummaryTitle');
    assert.ok(templateContent.includes("t('unifiedKeypad.inputSummarySubtitle', 'Toque num valor para o introduzir ou alterar.')"), 'Cartao deve ter inputSummarySubtitle');
  });

  test('5. Formulas agronomicas e pure functions permanecem 100% inalteradas', () => {
    const concJovem = concentracaoCalculatorConfig.calculate({
      volPrepararConc: { rawValue: 400, unit: 'L', normalizedValue: 400, dimension: 'volume', canonicalKey: 'tank_volume', label: '', source: 'user_input' },
      concValue: { rawValue: 100, unit: 'mL/hL', normalizedValue: 100, dimension: 'concentration', canonicalKey: 'concentration', label: '', source: 'user_input' },
      mode: { rawValue: 'jovem', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: 'calculator_mode', label: '', source: 'user_input' }
    });
    assert.strictEqual(concJovem.quantidade_pf.rawValue, 400);

    const doseRes = doseCalculatorConfig.calculate({
      volPrepararDose: { rawValue: 400, unit: 'L', normalizedValue: 400, dimension: 'volume', canonicalKey: 'tank_volume', label: '', source: 'user_input' },
      doseValue: { rawValue: 2, unit: 'kg/ha', normalizedValue: 2, dimension: 'dose_rate', canonicalKey: 'product_dose', label: '', source: 'user_input' },
      volCalda: { rawValue: 200, unit: 'L/ha', normalizedValue: 200, dimension: 'volume_rate', canonicalKey: 'spray_volume', label: '', source: 'user_input' }
    });
    assert.strictEqual(doseRes.quantidade_pf.rawValue, 4);

    const velRes = velocidadeRealCalculatorConfig.calculate({
      distanciaPercurso: { rawValue: 100, unit: 'm', normalizedValue: 100, dimension: 'length', canonicalKey: 'track_distance', label: '', source: 'user_input' },
      tempoPercurso: { rawValue: 60, unit: 's', normalizedValue: 60, dimension: 'time', canonicalKey: 'track_time', label: '', source: 'user_input' }
    });
    assert.strictEqual(velRes.velocidadeReal.rawValue, 6);

    const lwaRes = areaParedeFoliarCalculatorConfig.calculate({
      alturaVegetacao: { rawValue: 2.5, unit: 'm', normalizedValue: 2.5, dimension: 'length', canonicalKey: 'canopy_height', label: '', source: 'user_input' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', normalizedValue: 3.0, dimension: 'length', canonicalKey: 'row_spacing', label: '', source: 'user_input' }
    });
    assert.strictEqual(lwaRes.areaParedeFoliar.rawValue, 16667);

    const trvRes = volumeCopaCalculatorConfig.calculate({
      alturaCopa: { rawValue: 2.5, unit: 'm', normalizedValue: 2.5, dimension: 'length', canonicalKey: 'canopy_height', label: '', source: 'user_input' },
      larguraCopa: { rawValue: 1.2, unit: 'm', normalizedValue: 1.2, dimension: 'length', canonicalKey: 'canopy_width', label: '', source: 'user_input' },
      distanciaEntrelinhas: { rawValue: 3.0, unit: 'm', normalizedValue: 3.0, dimension: 'length', canonicalKey: 'row_spacing', label: '', source: 'user_input' }
    });
    assert.strictEqual(trvRes.volumeCopa.rawValue, 10000);

    const volTrvRes = volumeCaldaTrvCalculatorConfig.calculate({
      volumeCopaTrv: { rawValue: 10000, unit: 'm³/ha', normalizedValue: 10000, dimension: 'tree_row_volume', canonicalKey: 'tree_row_volume', label: '', source: 'user_input' },
      coeficienteVolumeCalda: { rawValue: 0.05, unit: 'L/m³', normalizedValue: 0.05, dimension: 'custom', canonicalKey: 'custom', label: '', source: 'user_input' }
    });
    assert.strictEqual(volTrvRes.volumeCaldaEstimado.rawValue, 500);

    const debitoRes = debitoTotalCalculatorConfig.calculate({
      volumeCalda: { rawValue: 400, unit: 'L/ha', normalizedValue: 400, dimension: 'volume_rate', canonicalKey: 'spray_volume', label: '', source: 'user_input' },
      velocidadeTrabalho: { rawValue: 6.0, unit: 'km/h', normalizedValue: 6.0, dimension: 'speed', canonicalKey: 'work_speed', label: '', source: 'user_input' },
      larguraTrabalho: { rawValue: 3.0, unit: 'm', normalizedValue: 3.0, dimension: 'length', canonicalKey: 'working_width', label: '', source: 'user_input' },
      baseLargura: { rawValue: 'row_spacing', unit: '', normalizedValue: 0, dimension: 'text', canonicalKey: 'width_basis', label: '', source: 'user_input' }
    });
    assert.strictEqual(debitoRes.debitoTotal.rawValue, 12);
  });

  test('6. Termo "cuba" nao existe em pt.json nem em br.json', () => {
    const ptJson = fs.readFileSync(path.join(localesDir, 'pt.json'), 'utf8');
    const brJson = fs.readFileSync(path.join(localesDir, 'br.json'), 'utf8');
    assert.ok(!/\bcuba\b/i.test(ptJson), 'pt.json nao deve conter a palavra "cuba"');
    assert.ok(!/\bcuba\b/i.test(brJson), 'br.json nao deve conter a palavra "cuba"');
  });

});
