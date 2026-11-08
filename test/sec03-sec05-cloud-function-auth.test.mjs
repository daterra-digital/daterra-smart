/**
 * DATERRA Smart - Testes de Segurança SEC-03, SEC-04 e SEC-05
 * Hardening da Cloud Function de Autenticação (sendCustomMagicLink)
 *
 * Cobertura:
 * 1. SEC-05: Validação Estrita de URLs de Redirecionamento (Anti-Open Redirect & Phishing)
 * 2. SEC-03: Validação do Desafio Anti-Robô Cloudflare Turnstile
 * 3. SEC-04: Rate-Limiting Distribuído e Cooldown Anti-Spam
 * 4. Verificação de integridade e modularidade (< 200 LOC por ficheiro)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Importa os módulos compilados do functions/lib/auth
const { validateRedirectUrl } = await import('../functions/lib/auth/redirectUrlValidator.js');
const { verifyTurnstileToken } = await import('../functions/lib/auth/turnstileVerifier.js');
const { checkAuthRateLimit, clearInMemoryRateLimits, RATE_LIMIT_WINDOW_MS, MAX_REQUESTS_PER_WINDOW, MAX_REQUESTS_PER_IP_WINDOW } = await import('../functions/lib/auth/rateLimiter.js');

describe('SEC-05: Validação Estrita de Redirecionamento (Anti-Open Redirect)', () => {

  it('1.1. Deve aceitar domínios oficiais da DATERRA Smart e localhost', () => {
    const validUrls = [
      'https://smart.daterra.com.pt',
      'https://smart.daterra.com.pt/#/login',
      'https://smart.daterra.com.pt/ferramentas',
      'https://daterra-digital.github.io/daterra-smart/',
      'https://daterra-digital.github.io/daterra-smart/#/login',
      'http://localhost:5173/daterra-smart/login',
      'http://localhost:5175/daterra-smart/login',
      'http://localhost:3000/#/login',
      'http://127.0.0.1:5173/login',
      'http://127.0.0.1:5175/login'
    ];

    for (const url of validUrls) {
      const validated = validateRedirectUrl(url);
      assert.equal(validated, url, `URL legítimo deve ser aceite: ${url}`);
    }
  });

  it('1.2. Deve rejeitar domínios externos não autorizados (tentativas de Phishing)', () => {
    const maliciousUrls = [
      'https://evil-attacker.com',
      'https://phishing-daterra.com/login',
      'https://smart.daterra.com.pt.attacker.net',
      'https://google.com',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>'
    ];

    for (const badUrl of maliciousUrls) {
      assert.throws(
        () => validateRedirectUrl(badUrl),
        /não autorizado|inválida|Protocolo/,
        `URL malicioso deve ser barrado: ${badUrl}`
      );
    }
  });

  it('1.3. Deve usar o DEFAULT_APP_URL se o URL de entrada estiver vazio', () => {
    const defaultUrl = 'https://smart.daterra.com.pt/#/login';
    const result = validateRedirectUrl(undefined, defaultUrl);
    assert.equal(result, defaultUrl);
  });

});

describe('SEC-03: Validação do Desafio Anti-Robô Cloudflare Turnstile', () => {

  it('2.1. Deve rejeitar token ausente ou vazio quando a chave de segredo está ativa', async () => {
    const result = await verifyTurnstileToken('', '127.0.0.1', 'secret_key_mock_123');
    assert.equal(result.success, false);
    assert.match(result.error, /anti-robô obrigatória/);
  });

  it('2.2. Em ambiente de teste/emulador sem chave de segredo, permite modo controlado', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    try {
      const result = await verifyTurnstileToken('', '127.0.0.1', '');
      assert.equal(result.success, true);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('2.3. Em produção sem secret key, deve rejeitar por Fail-Closed (SEC-02)', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const result = await verifyTurnstileToken('mock_token', '127.0.0.1', '');
      assert.equal(result.success, false);
      assert.match(result.error, /não inicializada no servidor/);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

});

describe('SEC-04: Rate Limiting Distribuído e Cooldown Anti-Spam', () => {

  beforeEach(() => {
    clearInMemoryRateLimits();
  });

  it('3.1. Deve permitir pedidos dentro do limite (até 5 pedidos)', async () => {
    const email = 'agricultor.teste@daterra.pt';
    let baseTime = Date.now();

    // 1º pedido
    await assert.doesNotReject(async () => {
      await checkAuthRateLimit(email, baseTime);
    });

    // 2º pedido após cooldown de 15 segundos
    baseTime += 15000;
    await assert.doesNotReject(async () => {
      await checkAuthRateLimit(email, baseTime);
    });
  });

  it('3.2. Deve impor cooldown de 10s entre cliques imediatos consecutivos', async () => {
    const email = 'clique.rapido@daterra.pt';
    const baseTime = Date.now();

    // 1º clique
    await checkAuthRateLimit(email, baseTime);

    // 2º clique 2 segundos depois (mesmo utilizador a clicar repetidamente)
    await assert.rejects(
      async () => {
        await checkAuthRateLimit(email, baseTime + 2000);
      },
      /Aguarde alguns segundos/
    );
  });

  it('3.3. Deve bloquear quando atinge o limite máximo de 5 pedidos na janela de 15 minutos', async () => {
    const email = 'spam.tester@daterra.pt';
    let t = Date.now();

    // Faz 5 pedidos espaçados por 15 segundos
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      await checkAuthRateLimit(email, t);
      t += 15000;
    }

    // 6º pedido deve ser bloqueado
    await assert.rejects(
      async () => {
        await checkAuthRateLimit(email, t);
      },
      /Limite de 5 pedidos atingido/
    );
  });

  it('3.4. Deve reiniciar a contagem após expirar a janela de 15 minutos', async () => {
    const email = 'agricultor.persistente@daterra.pt';
    let t = Date.now();

    // Esgota a quota
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      await checkAuthRateLimit(email, t);
      t += 15000;
    }

    // Avança 16 minutos no tempo (> 15 minutos)
    const afterWindow = t + RATE_LIMIT_WINDOW_MS + 1000;
    await assert.doesNotReject(async () => {
      await checkAuthRateLimit(email, afterWindow);
    });
  });

  it('3.5. Os limites de taxa devem ser isolados por e-mail', async () => {
    const emailA = 'user.a@daterra.pt';
    const emailB = 'user.b@daterra.pt';
    let t = Date.now();

    // Esgota email A
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      await checkAuthRateLimit(emailA, t);
      t += 15000;
    }

    // Email B não deve ser afetado pelo esgotamento de A
    await assert.doesNotReject(async () => {
      await checkAuthRateLimit(emailB, t);
    });
  });

  it('3.6. Deve limitar pedidos por IP para prevenir rotação de e-mails (SEC-15)', async () => {
    const ip = '198.51.100.42';
    let t = Date.now();

    // Faz 15 pedidos de e-mails diferentes a partir do mesmo IP
    for (let i = 0; i < MAX_REQUESTS_PER_IP_WINDOW; i++) {
      const email = `attacker_${i}@teste.pt`;
      await checkAuthRateLimit(email, ip, t);
      t += 1000;
    }

    // 16º pedido a partir do mesmo IP deve ser rejeitado mesmo com e-mail novo
    await assert.rejects(
      async () => {
        await checkAuthRateLimit('attacker_novo@teste.pt', ip, t);
      },
      /Demasiados pedidos a partir desta ligação/
    );
  });

});

describe('4. Modularidade Arquitetural (< 200 Linhas por Ficheiro)', () => {

  const files = [
    'functions/src/index.ts',
    'functions/src/auth/redirectUrlValidator.ts',
    'functions/src/auth/turnstileVerifier.ts',
    'functions/src/auth/rateLimiter.ts'
  ];

  for (const file of files) {
    it(`Ficheiro ${file} não deve exceder 200 linhas de código`, () => {
      const content = fs.readFileSync(path.resolve(file), 'utf8');
      const lines = content.split('\n').length;
      assert.ok(
        lines <= 200,
        `Ficheiro ${file} tem ${lines} linhas (limite máximo é 200 linhas)`
      );
    });
  }

});
