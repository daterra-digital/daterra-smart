/**
 * DATERRA Smart - Teste de Regressão de Segurança SEC-01
 * Validação da Inicialização de Firebase App Check e Proteção Anti-Abuso
 *
 * Garante que:
 * 1. src/lib/appCheck.ts existe e respeita < 200 LOC.
 * 2. Suporta token de depuração em localhost e ambientes de desenvolvimento.
 * 3. Opera com reCAPTCHA v3 e auto-refresh de token ativado.
 * 4. É resiliente/fail-safe: não quebra a PWA em modo offline ou sem chaves.
 * 5. firebaseClient.ts exporta appCheck inicializado.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-01: Firebase App Check & Proteção Anti-Abuso', () => {

  it('1. src/lib/appCheck.ts deve existir e respeitar o limite de < 200 LOC', () => {
    const filePath = path.resolve('src/lib/appCheck.ts');
    assert.ok(fs.existsSync(filePath), 'src/lib/appCheck.ts deve existir');

    const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
    assert.ok(lines < 200, `appCheck.ts deve ter < 200 LOC (tem ${lines})`);
  });

  it('2. Deve suportar FIREBASE_APPCHECK_DEBUG_TOKEN em localhost e porta 5175', () => {
    const source = fs.readFileSync(path.resolve('src/lib/appCheck.ts'), 'utf8');

    assert.ok(source.includes('FIREBASE_APPCHECK_DEBUG_TOKEN'), 'Deve referenciar FIREBASE_APPCHECK_DEBUG_TOKEN');
    assert.ok(source.includes("'5175'"), 'Deve detetar a porta 5175 do Release Candidate');
    assert.ok(source.includes('localhost'), 'Deve detetar localhost');
  });

  it('3. Deve utilizar ReCaptchaV3Provider e auto-refresh ativado', () => {
    const source = fs.readFileSync(path.resolve('src/lib/appCheck.ts'), 'utf8');

    assert.ok(source.includes('ReCaptchaV3Provider'), 'Deve importar e instanciar ReCaptchaV3Provider');
    assert.ok(source.includes('isTokenAutoRefreshEnabled: true'), 'Auto-refresh de token deve ser true');
  });

  it('4. Deve ser resiliente (fail-safe com try/catch e verificação de window)', () => {
    const source = fs.readFileSync(path.resolve('src/lib/appCheck.ts'), 'utf8');

    assert.ok(source.includes("typeof window === 'undefined'"), 'Deve verificar se window existe (SSR-safe)');
    assert.ok(source.includes('try {'), 'Deve conter bloco try/catch para não derrubar a aplicação');
  });

  it('5. firebaseClient.ts deve exportar appCheck', () => {
    const source = fs.readFileSync(path.resolve('src/lib/firebaseClient.ts'), 'utf8');

    assert.ok(source.includes("from './appCheck"), 'Deve importar setupAppCheck');
    assert.ok(source.includes('export const appCheck = setupAppCheck(app)'), 'Deve exportar appCheck');
  });

});
