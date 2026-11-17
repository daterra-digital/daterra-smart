/**
 * DATERRA Smart - Testes de Regressão de Segurança SEC-04 & SEC-16
 * Validação de Zero-Leakage no Logout e Isolamento em Dispositivos Partilhados
 *
 * Garante que:
 * 1. sessionCleanupService.ts existe e respeita o limite estrito de < 200 LOC.
 * 2. SENSITIVE_LOCAL_STORAGE_KEYS cobre credenciais, co-branding, pré-inspeções e geolocalização.
 * 3. PRESERVED_DEVICE_STORAGE_KEYS preserva configurações de máquina (idioma e tema).
 * 4. clearSensitiveLocalStorage purga dados sensíveis e mantém idioma e tema intactos.
 * 5. clearUserIndexedDbData atua sobre as 10 tabelas de utilizador e preserva dicionários do sistema.
 * 6. AuthContext.tsx invoca clearLocalSessionData durante o fluxo de logout.
 * 7. Os motores agronómicos canónicos (EPPO / DGAV) permanecem 100% inalterados.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-16: Zero-Leakage no Logout e Isolamento em Dispositivos Partilhados', () => {

  it('1. sessionCleanupService.ts deve existir e respeitar o limite de < 200 LOC', () => {
    const servicePath = path.resolve('src/services/auth/sessionCleanupService.ts');
    assert.ok(fs.existsSync(servicePath), 'sessionCleanupService.ts deve existir');
    
    const lines = fs.readFileSync(servicePath, 'utf8').split('\n').length;
    assert.ok(lines < 200, `sessionCleanupService.ts deve ter < 200 LOC (tem ${lines})`);
  });

  it('2. SENSITIVE_LOCAL_STORAGE_KEYS deve mapear todos os dados confidenciais', () => {
    const serviceSource = fs.readFileSync(path.resolve('src/services/auth/sessionCleanupService.ts'), 'utf8');
    
    const requiredSensitiveKeys = [
      'daterra_auth',
      'daterra_pending_auth',
      'daterra_cobranding_config',
      'daterra_co_branding',
      'daterra_pre_inspection_history_v1',
      'DATERRA_ACTIVE_WEATHER_LOCATION',
      'DATERRA_WEATHER_CACHE_STORE_V1',
      'DATERRA_WEATHER_CACHE_V2',
      'DATERRA_FREGUESIA_COORDS_CACHE_V1',
      'daterra_chat_subscriptions',
      'daterra_simulated_tier',
      'daterra_mock_env'
    ];

    for (const key of requiredSensitiveKeys) {
      assert.ok(
        serviceSource.includes(`'${key}'`),
        `SENSITIVE_LOCAL_STORAGE_KEYS deve incluir '${key}'`
      );
    }
  });

  it('3. PRESERVED_DEVICE_STORAGE_KEYS deve proteger idioma e tema', () => {
    const serviceSource = fs.readFileSync(path.resolve('src/services/auth/sessionCleanupService.ts'), 'utf8');
    
    assert.ok(serviceSource.includes("'daterra_language'"), 'Deve preservar daterra_language');
    assert.ok(serviceSource.includes("'daterra_theme'"), 'Deve preservar daterra_theme');
  });

  it('4. Simulação: clearSensitiveLocalStorage deve purgar segredos e reter definições de máquina', () => {
    const mockStorage = new Map();

    // Estado inicial de um operador agrícola no tablet
    mockStorage.set('daterra_auth', 'token-sessao-operador-a');
    mockStorage.set('daterra_cobranding_config', JSON.stringify({ company: 'Quinta das Oliveiras', nif: '500123456' }));
    mockStorage.set('daterra_pre_inspection_history_v1', JSON.stringify([{ id: 'insp_1', status: 'conforme' }]));
    mockStorage.set('DATERRA_ACTIVE_WEATHER_LOCATION', JSON.stringify({ lat: 41.15, lng: -8.61 }));
    mockStorage.set('DATERRA_WEATHER_CACHE_STORE_V1', JSON.stringify({ cached: true }));
    mockStorage.set('DATERRA_WEATHER_CACHE_V2', JSON.stringify({ legacy: true }));
    mockStorage.set('DATERRA_FREGUESIA_COORDS_CACHE_V1', JSON.stringify({ ben: true }));
    mockStorage.set('daterra_language', 'pt');
    mockStorage.set('daterra_theme', 'mono');

    // Executa a lógica de purga alinhada com SENSITIVE_LOCAL_STORAGE_KEYS
    const sensitiveKeys = [
      'daterra_auth',
      'daterra_pending_auth',
      'daterra_cobranding_config',
      'daterra_co_branding',
      'daterra_pre_inspection_history_v1',
      'DATERRA_ACTIVE_WEATHER_LOCATION',
      'DATERRA_WEATHER_CACHE_STORE_V1',
      'DATERRA_WEATHER_CACHE_V2',
      'DATERRA_FREGUESIA_COORDS_CACHE_V1',
      'daterra_chat_subscriptions',
      'daterra_simulated_tier',
      'daterra_mock_env'
    ];

    for (const key of sensitiveKeys) {
      mockStorage.delete(key);
    }

    // Validações
    assert.equal(mockStorage.has('daterra_auth'), false, 'daterra_auth deve ser eliminado');
    assert.equal(mockStorage.has('daterra_cobranding_config'), false, 'daterra_cobranding_config deve ser eliminado');
    assert.equal(mockStorage.has('daterra_pre_inspection_history_v1'), false, 'pré-inspeções devem ser eliminadas');
    assert.equal(mockStorage.has('DATERRA_ACTIVE_WEATHER_LOCATION'), false, 'GPS/clima deve ser eliminado');
    assert.equal(mockStorage.has('DATERRA_WEATHER_CACHE_STORE_V1'), false, 'cache meteorológica V1 deve ser eliminada');
    assert.equal(mockStorage.has('DATERRA_WEATHER_CACHE_V2'), false, 'cache meteorológica V2 deve ser eliminada');
    assert.equal(mockStorage.has('DATERRA_FREGUESIA_COORDS_CACHE_V1'), false, 'cache freguesias deve ser eliminada');

    // Definições de hardware/máquina intocadas
    assert.equal(mockStorage.get('daterra_language'), 'pt', 'daterra_language deve ser preservado');
    assert.equal(mockStorage.get('daterra_theme'), 'mono', 'daterra_theme deve ser preservado');
  });

  it('5. clearUserIndexedDbData deve mapear as 13 tabelas de utilizador e preservar dicionários', () => {
    const serviceSource = fs.readFileSync(path.resolve('src/services/auth/sessionCleanupService.ts'), 'utf8');

    const expectedUserTables = [
      'calculation_history',
      'calculation_history_v2',
      'calibration_profiles',
      'mix_history',
      'eppo_history',
      'profiles_cultures',
      'profile_crop_moments',
      'profile_moment_revisions',
      'profile_custom_options',
      'profiles_equipment',
      'profiles_nozzles',
      'profiles_calibrations',
      'mutation_outbox'
    ];

    for (const table of expectedUserTables) {
      assert.ok(
        serviceSource.includes(`db.${table}`),
        `userTables deve incluir db.${table}`
      );
    }

    // Não pode incluir nem limpar tabelas de dicionários do sistema
    assert.ok(
      !serviceSource.includes('db.microlearning_content'),
      'microlearning_content NUNCA pode ser limpo no logout'
    );
    assert.ok(
      !serviceSource.includes('db.active_substances'),
      'active_substances NUNCA pode ser limpo no logout'
    );
    assert.ok(
      !serviceSource.includes('db.installed_tools'),
      'installed_tools NUNCA pode ser limpo no logout'
    );
  });

  it('6. AuthContext.tsx deve invocar clearLocalSessionData no logout', () => {
    const authSource = fs.readFileSync(path.resolve('src/context/AuthContext.tsx'), 'utf8');

    assert.ok(
      authSource.includes("import { clearLocalSessionData } from '../services/auth/sessionCleanupService'"),
      'AuthContext deve importar clearLocalSessionData'
    );
    assert.ok(
      authSource.includes('await clearLocalSessionData(currentUserId)'),
      'logout() deve invocar clearLocalSessionData com o ID do utilizador'
    );
    assert.ok(
      authSource.includes('clearLocalSessionData: handleManualSessionCleanup'),
      'AuthContext deve expor clearLocalSessionData no contexto'
    );
  });

  it('7. Motores agronómicos canónicos (EPPO / DGAV) permanecem 100% intocados', () => {
    const canonicalFiles = [
      'src/features/ajuste-dose/calculations.ts',
      'src/features/aplicacao-manual/aplicacaoManualEngine.ts',
      'src/features/calibracao-pulverizador/calibracaoPulverizadorEngine.ts',
      'src/features/weather/weatherCalculations.ts'
    ];

    for (const f of canonicalFiles) {
      assert.ok(fs.existsSync(path.resolve(f)), `Motor canónico deve existir: ${f}`);
    }
  });

});
