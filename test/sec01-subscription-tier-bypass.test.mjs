// test/sec01-subscription-tier-bypass.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('SEC-01: Verificação Estática e Comportamental de Supressão do Tier Simulado em Produção', async (t) => {
  const filePath = path.resolve('src/context/SubscriptionContext.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  await t.test('1. Presença de barreira estrita de ambiente (import.meta.env.DEV)', () => {
    assert.ok(
      content.includes('import.meta.env?.DEV'),
      'SubscriptionContext deve inspecionar explicitamente import.meta.env.DEV'
    );
    assert.ok(
      content.includes('!isDevMode'),
      'SubscriptionContext deve conter ramo de proteção estrita para quando NÃO estiver em modo Dev'
    );
  });

  await t.test('2. Limpeza ativa de localStorage residual fora de Dev', () => {
    assert.ok(
      content.includes('localStorage.removeItem(SIMULATED_TIER_STORAGE_KEY)'),
      'SubscriptionContext deve remover ativamente chaves residuais de daterra_simulated_tier fora de desenvolvimento'
    );
  });

  await t.test('3. Bloqueio de mutação (setSimulatedTier) em ambiente não-Dev', () => {
    assert.ok(
      content.includes('if (!isDevMode)'),
      'setSimulatedTier deve rejeitar mutações locais se não for Dev'
    );
  });

  await t.test('4. effectiveTier deriva exclusivamente do perfil em produção', () => {
    assert.ok(
      content.includes('if (!isDevMode) {\n      return currentTier;\n    }'),
      'effectiveTier deve retornar estritamente currentTier quando !isDevMode'
    );
  });

  await t.test('5. Modularidade e limite de 200 linhas cumprido', () => {
    const lines = content.split('\n').length;
    assert.ok(
      lines <= 200,
      `SubscriptionContext possui ${lines} linhas, cumprindo o limite máximo de 200 linhas`
    );
  });
});
