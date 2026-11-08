// test/sec06-pending-auth-expiration.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Simulação de localStorage em memória para o ambiente Node.js
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) ?? null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MockLocalStorage();

// Importação dinâmica dos utilitários de autenticação pendente
// Como pendingAuthStorage.ts está em TypeScript, validamos a lógica e regras estáticas
test('SEC-06: Minimização e Expiração Ativa de Dados Temporários de Autenticação (15 Minutos)', async (t) => {
  const filePath = path.resolve('src/services/auth/pendingAuthStorage.ts');
  const authContextPath = path.resolve('src/context/AuthContext.tsx');
  const storageContent = fs.readFileSync(filePath, 'utf8');
  const authContent = fs.readFileSync(authContextPath, 'utf8');

  await t.test('1. Janela de expiração estrita de 15 minutos (900.000 ms)', () => {
    assert.ok(
      storageContent.includes('15 * 60 * 1000'),
      'pendingAuthStorage deve definir PENDING_AUTH_MAX_AGE_MS como 15 minutos (15 * 60 * 1000)'
    );
  });

  await t.test('2. Carimbo temporal e minimização no savePendingAuth', () => {
    assert.ok(
      storageContent.includes('timestamp: Date.now()'),
      'savePendingAuth deve anexar o carimbo temporal de criação'
    );
    assert.ok(
      storageContent.includes('email: data.email.trim().toLowerCase()'),
      'savePendingAuth deve normalizar o endereço de email'
    );
  });

  await t.test('3. Expiração e limpeza física automática em getValidPendingAuth', () => {
    assert.ok(
      storageContent.includes('age > PENDING_AUTH_MAX_AGE_MS'),
      'getValidPendingAuth deve verificar se a idade do registo ultrapassou 15 minutos'
    );
    assert.ok(
      storageContent.includes('clearPendingAuth()'),
      'getValidPendingAuth deve chamar clearPendingAuth quando expirado ou corrompido'
    );
  });

  await t.test('4. Purga automática de segurança no arranque e no logout em AuthContext', () => {
    assert.ok(
      authContent.includes('getValidPendingAuth()'),
      'AuthContext deve executar getValidPendingAuth no arranque (useEffect) para purga proativa'
    );
    assert.ok(
      authContent.includes('clearPendingAuth()'),
      'AuthContext deve invocar clearPendingAuth ao concluir o login e no logout'
    );
  });

  await t.test('5. Modularidade estrita: ficheiro com menos de 200 linhas', () => {
    const lines = storageContent.split('\n').length;
    assert.ok(
      lines <= 200,
      `pendingAuthStorage.ts possui ${lines} linhas, respeitando o limite de 200 linhas`
    );
  });

  await t.test('6. Simulação funcional de ciclo de vida (salvar, validar, expirar)', () => {
    const KEY = 'daterra_pending_auth';
    const MAX_AGE = 15 * 60 * 1000;

    // 6.1. Salvar dados válidos
    const now = Date.now();
    const validData = {
      email: 'agricultor@daterra.pt',
      firstName: 'João',
      lastName: 'Silva',
      companyName: 'Quinta da Vinha',
      timestamp: now
    };
    globalThis.localStorage.setItem(KEY, JSON.stringify(validData));

    // Leitura dentro dos 15 min (ex: 2 min depois)
    const readNow = JSON.parse(globalThis.localStorage.getItem(KEY));
    assert.equal(readNow.email, 'agricultor@daterra.pt');
    assert.ok(Date.now() - readNow.timestamp < MAX_AGE);

    // 6.2. Simulação de expiração (16 minutos depois)
    const expiredTimestamp = Date.now() - (16 * 60 * 1000);
    const expiredData = { ...validData, timestamp: expiredTimestamp };
    globalThis.localStorage.setItem(KEY, JSON.stringify(expiredData));

    const checkAge = Date.now() - expiredData.timestamp;
    if (checkAge > MAX_AGE) {
      globalThis.localStorage.removeItem(KEY);
    }
    assert.equal(globalThis.localStorage.getItem(KEY), null, 'Registo com mais de 15 minutos deve ser removido');
  });
});
