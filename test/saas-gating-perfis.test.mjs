// test/saas-gating-perfis.test.mjs
import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { TIER_RANK, TIER_CONFIG, PRO_TOOL_IDS } from '../src/types/subscription.ts';
import { db } from '../src/db/db.ts';

describe('SaaS Multi-tier Gating & Profile Telemetry (Free & Pro)', () => {
  test('1. Hierarquia de Tiers SaaS está corretamente configurada', () => {
    assert.equal(TIER_RANK.free, 0);
    assert.equal(TIER_RANK.pro, 1);
    assert.equal(TIER_RANK.ultra, 2);
    assert.equal(TIER_RANK.corporate, 3);
    assert.ok(TIER_RANK.pro > TIER_RANK.free);
    assert.ok(TIER_RANK.ultra > TIER_RANK.pro);
    assert.ok(TIER_RANK.corporate > TIER_RANK.ultra);
  });

  test('2. Tiers Ultra e Corporate são estritamente marcados como placeholders inativos', () => {
    assert.equal(TIER_CONFIG.free.active, true);
    assert.equal(TIER_CONFIG.pro.active, true);
    assert.equal(TIER_CONFIG.ultra.active, false, 'Ultra deve ser placeholder inativo');
    assert.equal(TIER_CONFIG.corporate.active, false, 'Corporate deve ser placeholder inativo');
  });

  test('3. Ferramentas canónicas Pro estão devidamente catalogadas no PRO_TOOL_IDS', () => {
    assert.ok(PRO_TOOL_IDS.has('ajuste_dose_eppo'));
    assert.ok(PRO_TOOL_IDS.has('calc_area_parede_foliar'));
    assert.ok(PRO_TOOL_IDS.has('calc_volume_copa'));
    assert.ok(PRO_TOOL_IDS.has('calc_volume_calda_trv'));
    assert.ok(PRO_TOOL_IDS.has('calc_debito_total'));
    assert.ok(PRO_TOOL_IDS.has('calc_calibracao_pulverizador'));
    assert.ok(PRO_TOOL_IDS.has('comparador_bicos'));
    assert.ok(PRO_TOOL_IDS.has('pre_inspecao_dgav'));

    // Ferramentas Free não devem estar no PRO_TOOL_IDS
    assert.equal(PRO_TOOL_IDS.has('calc_dose'), false);
    assert.equal(PRO_TOOL_IDS.has('calc_concentracao'), false);
    assert.equal(PRO_TOOL_IDS.has('verificador_ph'), false);
    assert.equal(PRO_TOOL_IDS.has('calc_velocidade_real'), false);
    assert.equal(PRO_TOOL_IDS.has('mistura_compatibilidade'), false);
  });

  test('4. Esquema Dexie v9 inclui versão 9 e campos de telemetria agronómica', () => {
    assert.equal(db.verno, 9, 'Dexie versão deve ser 9');

    const cultureIndexes = db.profiles_cultures.schema.indexes.map(i => i.name);
    assert.ok(cultureIndexes.includes('last_lwa_m2_ha'), 'profiles_cultures deve indexar last_lwa_m2_ha');
    assert.ok(cultureIndexes.includes('last_trv_m3_ha'), 'profiles_cultures deve indexar last_trv_m3_ha');

    const equipIndexes = db.profiles_equipment.schema.indexes.map(i => i.name);
    assert.ok(equipIndexes.includes('machine_efficiency_pct'), 'profiles_equipment deve indexar machine_efficiency_pct');
  });

  test('5. Governança estrita: nenhum ficheiro criado ou modificado excede 200 linhas', () => {
    const filesToCheck = [
      'src/types/subscription.ts',
      'src/context/SubscriptionContext.tsx',
      'src/components/gating/UpgradeModal.tsx',
      'src/components/gating/FeatureLockedCard.tsx',
      'src/components/gating/TierGate.tsx',
      'src/components/gating/TierRouteGuard.tsx',
      'src/components/gating/index.ts',
      'src/components/RouteGuards.tsx',
      'src/db/types.ts',
      'src/db/seed.ts',
      'src/db/db.ts',
      'src/features/perfis/services/profileTelemetrySync.ts',
      'src/App.tsx'
    ];

    for (const filePath of filesToCheck) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').length;
      assert.ok(lines <= 200, `${filePath} tem ${lines} linhas (excede o limite estrito de 200 linhas)`);
    }
  });

  test('6. Internacionalização canónica: 32 chaves em gating.* presentes em pt-PT e en-GB', () => {
    const ptPT = JSON.parse(fs.readFileSync('src/i18n/locales/pt-PT.json', 'utf8'));
    const enGB = JSON.parse(fs.readFileSync('src/i18n/locales/en-GB.json', 'utf8'));

    assert.ok(ptPT.gating, 'pt-PT deve conter o namespace gating');
    assert.ok(enGB.gating, 'en-GB deve conter o namespace gating');

    const getLeafPaths = (obj, prefix = '') => {
      let paths = [];
      for (const k of Object.keys(obj)) {
        const full = prefix ? `${prefix}.${k}` : k;
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          paths = paths.concat(getLeafPaths(obj[k], full));
        } else {
          paths.push(full);
        }
      }
      return paths;
    };

    const ptKeys = getLeafPaths(ptPT.gating);
    const enKeys = getLeafPaths(enGB.gating);

    assert.equal(ptKeys.length, 32, 'Devem existir exatamente 32 chaves canónicas no namespace gating');
    assert.equal(enKeys.length, 32, 'en-GB deve conter exatamente 32 chaves correspondentes');

    for (const k of ptKeys) {
      assert.ok(enKeys.includes(k), `en-GB deve conter a chave ${k}`);
    }

    // Validar termos técnicos britânicos
    assert.equal(enGB.gating.modal.title_default, 'Unlock Full Potential with PRO Plan');
    assert.equal(enGB.gating.modal.btn_activate_pro, 'Activate PRO Mode (Instant Simulation)');
    assert.equal(enGB.gating.modal.benefit_1_title, 'Advanced 3D Canopy Models (LWA & TRV)');
  });

  test('7. Componentes de Gating utilizam useTranslation para todas as labels', () => {
    const modalContent = fs.readFileSync('src/components/gating/UpgradeModal.tsx', 'utf8');
    assert.ok(modalContent.includes('useTranslation'), 'UpgradeModal deve importar useTranslation');
    assert.ok(modalContent.includes("t('gating.modal.badge'"), 'UpgradeModal deve traduzir badge');
    assert.ok(modalContent.includes("t('gating.modal.title_default'"), 'UpgradeModal deve traduzir title_default');
    assert.ok(modalContent.includes("t('gating.modal.btn_activate_pro'"), 'UpgradeModal deve traduzir btn_activate_pro');

    const cardContent = fs.readFileSync('src/components/gating/FeatureLockedCard.tsx', 'utf8');
    assert.ok(cardContent.includes('useTranslation'), 'FeatureLockedCard deve importar useTranslation');
    assert.ok(cardContent.includes("t('gating.exclusive_tier'"), 'FeatureLockedCard deve traduzir exclusive_tier');
    assert.ok(cardContent.includes("t('gating.locked_card.btn_unlock'"), 'FeatureLockedCard deve traduzir btn_unlock');
  });
});
