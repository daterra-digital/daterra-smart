/**
 * DATERRA Smart - Regressao Fase 0: Turnstile, CSP e Isolamento Meteorologico
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Fase 0: Turnstile sendCustomMagicLink (Tarefa 0.2)', () => {
  it('1. sendCustomMagicLink verifica explicitamente isCaptchaValid.success !== true sem vazar detalhes internos', () => {
    const src = fs.readFileSync(path.resolve('functions/src/index.ts'), 'utf8');
    const compiled = fs.readFileSync(path.resolve('functions/lib/index.js'), 'utf8');

    for (const code of [src, compiled]) {
      assert.match(code, /isCaptchaValid\.success\s*!==\s*true/);
      assert.ok(!code.includes('if (!isCaptchaValid) {'), 'Nao pode usar truthiness simples de objeto');
      assert.ok(!code.includes('provedor Brevo (${brevoResponse.status})'), 'Nao deve expor status HTTP do provedor ao cliente');
      assert.ok(!code.includes("err?.message || 'Não foi possível"), 'Nao deve propagar err.message bruto ao cliente');
    }
  });

  it('2. verifyTurnstileToken bloqueia falha Turnstile { success: false }, HTTP 500 e erro de rede', async () => {
    const { verifyTurnstileToken } = await import('../functions/lib/auth/turnstileVerifier.js');
    const origFetch = globalThis.fetch;

    try {
      globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] })
      });
      const failed = await verifyTurnstileToken('token-invalido', '127.0.0.1', 'secret_mock');
      assert.equal(failed.success, false);
      assert.equal(failed.success === true, false);

      globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
      const httpErr = await verifyTurnstileToken('token-invalido', '127.0.0.1', 'secret_mock');
      assert.equal(httpErr.success, false);

      globalThis.fetch = async () => {
        throw new Error('ECONNRESET internal detail');
      };
      const netErr = await verifyTurnstileToken('token-invalido', '127.0.0.1', 'secret_mock');
      assert.equal(netErr.success, false);
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});

describe('Fase 0: CSP e Isolamento Meteorologia (Tarefas 0.3 & 0.5)', () => {
  it('1. CSP remove wildcard img-src https:, mantem geoapi.pt + geocoding-api + server.arcgisonline.com, worker-src e form-action', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
    const cspMatch = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
    assert.ok(cspMatch);
    const csp = cspMatch[1];

    const imgSrc = csp.match(/img-src\s+([^;]+)/)?.[1] || '';
    assert.ok(!/\shttps:(?:\s|$)/.test(imgSrc), 'img-src nao deve conter wildcard https:');
    assert.ok(imgSrc.includes('https://server.arcgisonline.com'));
    assert.ok(imgSrc.includes('https://lh3.googleusercontent.com'));

    const connectSrc = csp.match(/connect-src\s+([^;]+)/)?.[1] || '';
    assert.ok(connectSrc.includes('https://geoapi.pt'));
    assert.ok(connectSrc.includes('https://geocoding-api.open-meteo.com'));
    assert.ok(!connectSrc.includes('https://api.brevo.com'), 'Cliente nunca deve chamar Brevo diretamente');
    assert.ok(csp.includes("worker-src 'self'"));
    assert.ok(csp.includes("form-action 'self'"));
  });

  it('2. WeatherContextAccordion remove fallback local-user e devolve vazio sem utilizador ou perfis proprios', (t) => {
    const accordionPath = path.resolve('src/features/weather/components/WeatherContextAccordion.tsx');
    if (!fs.existsSync(accordionPath)) {
      t.skip('Pendente: refatoração de Meteorologia não integrada.');
      return;
    }
    const code = fs.readFileSync(accordionPath, 'utf8');
    assert.ok(!code.includes("p.userId === 'local-user'"), 'Nao deve fazer fallback para perfis local-user');
    assert.ok(!code.includes('!p.userId'), 'Nao deve exibir perfis sem userId no seletor meteorologico');
    assert.ok(code.includes('if (!effectiveUserId) return []'));
  });
});
