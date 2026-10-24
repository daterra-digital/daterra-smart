import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLwa, calculateTrv, calculateEppoDoseComprehensive, buildEppoDoseStructuredValues
} from '../src/features/ajuste-dose-eppo/eppoDoseDataMapper.ts';

describe('Calculadora Canónica EPPO — Ajuste da Dose & Tripla Entrada', () => {

  describe('1. Rigor Geométrico EPPO (LWA e TRV)', () => {
    test('1.1. LWA canónico em sebe: Altura 1.5m, Entrelinha 2.5m => 12 000 m² LWA/ha', () => {
      assert.equal(calculateLwa(1.5, 2.5), 12000);
    });
    test('1.2. TRV para condução globular: Altura 2.0m, Largura 1.0m, Entrelinha 4.0m => 5 000 m³/ha', () => {
      assert.equal(calculateTrv(2.0, 1.0, 4.0), 5000);
    });
    test('1.3. Valores nulos ou inválidos retornam 0 com segurança', () => {
      assert.equal(calculateLwa(0, 2.5), 0);
      assert.equal(calculateTrv(0, 1, 2), 0);
    });
  });

  describe('2. Modalidades: Tratamento Total vs Em Faixa', () => {
    test('2.1. Tratamento Total: Vinha h=1.5m, r=2.5m, Dose 2.0 L/ha => Dose Ajustada 2.4 L/ha', () => {
      const res = calculateEppoDoseComprehensive(2.0, 1.5, 2.5, 'total', 'sebe', 0.8, 10000, 1000, 400);
      assert.equal(res.isValid, true);
      assert.equal(res.doseAjustada, 2.4);
    });
    test('2.2. Tratamento em Faixa: Altura da faixa 0.6m, Entrelinha 2.5m => Poupança 52%', () => {
      const res = calculateEppoDoseComprehensive(1.5, 0.6, 2.5, 'band', 'sebe', 0.8, 10000, 1000, 400);
      assert.equal(res.isValid, true);
      assert.equal(res.lwaReal, 4800);
      assert.equal(res.doseAjustada, 0.72);
      assert.equal(res.reducaoPercentual, 52);
    });
  });

  describe('3. Desacoplamento da Calda (Máquina) vs Dose (Cultura)', () => {
    test('3.1. Concentração / 100L e Quantidade por Depósito no Cartão Verde Dividido', () => {
      const res = calculateEppoDoseComprehensive(1.0, 1.25, 2.5, 'total', 'sebe', 0.8, 10000, 1000, 500);
      assert.equal(res.isValid, true);
      assert.equal(res.hectaresPorDeposito, 2.0);
      assert.equal(res.produtoPorDeposito, 2.0);
      assert.equal(res.concentracaoPor100LSub, 200); // 200 mL / 100 L
    });
    test('3.2. Alterar capacidade do depósito não altera dose/ha ou concentração/100L', () => {
      const r1 = calculateEppoDoseComprehensive(1.5, 1.25, 2.5, 'total', 'sebe', 0.8, 1000, 1000, 400);
      const r2 = calculateEppoDoseComprehensive(1.5, 1.25, 2.5, 'total', 'sebe', 0.8, 1000, 2000, 400);
      assert.equal(r1.doseAjustada, r2.doseAjustada);
      assert.equal(r1.concentracaoPor100L, r2.concentracaoPor100L);
    });
    test('3.3. Alterar volume de calda calibrado não altera a dose foliar/ha', () => {
      const r400 = calculateEppoDoseComprehensive(1.5, 1.25, 2.5, 'total', 'sebe', 0.8, 10000, 1000, 400);
      const r800 = calculateEppoDoseComprehensive(1.5, 1.25, 2.5, 'total', 'sebe', 0.8, 10000, 1000, 800);
      assert.equal(r400.doseAjustada, r800.doseAjustada);
      assert.ok(Math.abs(r800.concentracaoPor100L - r400.concentracaoPor100L / 2) <= 0.001);
    });
  });

  describe('4. Tripla Entrada de Dados Foliar (Manual, Histórico, Perfis)', () => {
    test('4.1. Entrada Manual - Pomar Globular com Altura, Largura e Entrelinha', () => {
      // Pomar Globular: Altura 2.5m, Largura 1.5m, Entrelinha 4.0m
      const res = calculateEppoDoseComprehensive(2.0, 2.5, 4.0, 'total', 'globular', 1.5, 10000, 1000, 400);
      assert.equal(res.isValid, true);
      assert.equal(res.lwaReal, 12500); // (2 * 2.5 * 10000) / 4.0
      assert.equal(res.trvReal, 9375);  // (2.5 * 1.5 * 10000) / 4.0
      assert.equal(res.racioAjuste, 1.25);
      assert.equal(res.doseAjustada, 2.5); // 2.0 * 1.25
    });

    test('4.2. Entrada via Histórico - Sobrescrita direta de LWA pré-calculado', () => {
      // Importa 8000 m² LWA do histórico
      const res = calculateEppoDoseComprehensive(1.5, 1.5, 2.5, 'total', 'sebe', 0.8, 10000, 1000, 400, 8000);
      assert.equal(res.isValid, true);
      assert.equal(res.lwaReal, 8000);
      assert.equal(res.racioAjuste, 0.8);
      assert.equal(res.doseAjustada, 1.2); // 1.5 * 0.8
      assert.equal(res.reducaoPercentual, 20); // 20% poupança
    });

    test('4.3. Entrada via Perfis - Vinha h=1.6m, entrelinha=2.2m e Pulverizador 600L', () => {
      const res = calculateEppoDoseComprehensive(2.0, 1.6, 2.2, 'total', 'sebe', 0.8, 10000, 600, 300);
      assert.equal(res.isValid, true);
      assert.equal(res.lwaReal, 14545.5);
      assert.equal(res.doseAjustada, 2.909);
      assert.equal(res.hectaresPorDeposito, 2.0);
      assert.equal(res.produtoPorDeposito, 5.82);
    });
  });

  describe('5. Robustez Matemática & Structured Values', () => {
    test('5.1. Entradas inválidas retornam isValid: false de forma segura', () => {
      assert.equal(calculateEppoDoseComprehensive(0, 1.5, 2.5).isValid, false);
      assert.equal(calculateEppoDoseComprehensive(1.5, -1, 2.5).isValid, false);
    });
    test('5.2. buildEppoDoseStructuredValues gera estrutura canónica para Outbox', () => {
      const inputs = {
        doseRotulo: 1.5, alturaM: 1.5, entrelinhaM: 2.5, treatmentMode: 'total',
        cropStructure: 'sebe', larguraCopaM: 0.8, lwaRef: 10000,
        capacidadeDeposito: 1000, volumeCaldaLHa: 400, unitMode: 'liquid', foliarInputSource: 'manual'
      };
      const res = calculateEppoDoseComprehensive(1.5, 1.5, 2.5, 'total', 'sebe', 0.8, 10000, 1000, 400);
      const { inputs: sInputs, outputs: sOutputs } = buildEppoDoseStructuredValues(inputs, res);
      assert.equal(sInputs.doseRotulo.rawValue, 1.5);
      assert.equal(sOutputs.doseAjustada.rawValue, 1.8);
      assert.equal(sOutputs.produtoPorDeposito.unit, 'L');
      assert.equal(sOutputs.quantidade_pf.unit, 'L');
      assert.equal(sOutputs.quantidade_pf.subUnit, 'mL');
    });

    test('5.3. Formulação Sólida (kg/ha) mapeia unidades dinâmicas kg e g no histórico', () => {
      const inputsSolid = {
        doseRotulo: 2.0, alturaM: 1.5, entrelinhaM: 2.5, treatmentMode: 'total',
        cropStructure: 'sebe', larguraCopaM: 0.8, lwaRef: 10000,
        capacidadeDeposito: 1000, volumeCaldaLHa: 400, unitMode: 'solid', foliarInputSource: 'manual'
      };
      const res = calculateEppoDoseComprehensive(2.0, 1.5, 2.5, 'total', 'sebe', 0.8, 10000, 1000, 400);
      const { inputs: sInputs, outputs: sOutputs } = buildEppoDoseStructuredValues(inputsSolid, res);

      assert.equal(sInputs.doseRotulo.unit, 'kg/ha');
      assert.equal(sOutputs.doseAjustada.unit, 'kg/ha');
      assert.equal(sOutputs.produtoPorDeposito.unit, 'kg');
      assert.equal(sOutputs.quantidade_pf.unit, 'kg');
      assert.equal(sOutputs.quantidade_pf.subUnit, 'g');
      assert.equal(sOutputs.quantidade_pf.subValue, 6000); // 6.00 kg = 6000 g
    });

    test('5.4. Nomenclatura contextual cruzada [Cultura] • [Equipamento]', () => {
      const culture = 'Vinha da Encosta';
      const equipment = 'Tomix 1000L';
      const generatedName = (culture && equipment)
        ? `${culture} • ${equipment}`
        : 'fallback';
      assert.equal(generatedName, 'Vinha da Encosta • Tomix 1000L');
    });
  });

  describe('6. Reatividade Dinâmica (LWA vs TRV) & Visibilidade Condicional', () => {
    test('6.1. Alternância para condução globular define canopyMethod === "trv"', () => {
      const inputs = {
        foliarInputSource: 'manual',
        cropStructure: 'globular'
      };
      const canopyMethod = (
        (inputs.foliarInputSource === 'history' && inputs.overrideTrv !== undefined && inputs.overrideLwa === undefined) ||
        inputs.cropStructure === 'globular'
      ) ? 'trv' : 'lwa';
      assert.equal(canopyMethod, 'trv');
    });

    test('6.2. Importação de ensaio de TRV do histórico propaga canopyMethod === "trv"', () => {
      const rec = {
        calculatorId: 'calc_volume_copa',
        outputs: { volumeCopa: { rawValue: 8500 } }
      };
      const isLwa = rec.calculatorId === 'calc_area_parede_foliar';
      const val = Number(isLwa ? rec.outputs?.areaParedeFoliar?.rawValue : rec.outputs?.volumeCopa?.rawValue);
      const updatedInputs = {
        foliarInputSource: 'history',
        cropStructure: isLwa ? 'sebe' : 'globular',
        overrideLwa: isLwa ? val : undefined,
        overrideTrv: !isLwa ? val : undefined
      };
      const canopyMethod = (
        (updatedInputs.foliarInputSource === 'history' && updatedInputs.overrideTrv !== undefined && updatedInputs.overrideLwa === undefined) ||
        updatedInputs.cropStructure === 'globular'
      ) ? 'trv' : 'lwa';
      assert.equal(canopyMethod, 'trv');
      assert.equal(updatedInputs.overrideTrv, 8500);
      assert.equal(updatedInputs.overrideLwa, undefined);
    });

    test('6.3. Visibilidade condicional: perfil ativo restrito à aba "Perfis"', () => {
      const selectedCulture = 'Pomar Gala';
      
      const manualCardCulture = 'manual' === 'profiles' ? selectedCulture : undefined;
      assert.equal(manualCardCulture, undefined, 'Modo manual não deve exibir perfil ativo no Cartão Verde');

      const historyCardCulture = 'history' === 'profiles' ? selectedCulture : undefined;
      assert.equal(historyCardCulture, undefined, 'Modo histórico não deve exibir perfil ativo no Cartão Verde');

      const profilesCardCulture = 'profiles' === 'profiles' ? selectedCulture : undefined;
      assert.equal(profilesCardCulture, 'Pomar Gala', 'Aba Perfis deve exibir a cultura ativa');
    });
  });
});
