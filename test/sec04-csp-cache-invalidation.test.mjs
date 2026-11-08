/**
 * DATERRA Smart - Teste de Regressão de Segurança SEC-04
 * Validação de Content Security Policy (CSP) e Invalidação de Cache (Service Worker / PWA)
 *
 * Garante que:
 * 1. index.html declara Content-Security-Policy estrita protegendo contra clickjacking e injeção.
 * 2. CSP autoriza estritamente os domínios do ecossistema DATERRA, Cloudflare e Firebase.
 * 3. vite.config.ts configura Workbox com skipWaiting, clientsClaim e cleanupOutdatedCaches.
 * 4. src/main.tsx orquestra o ciclo de vida do Service Worker com recarregamento imediato.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-04: Content Security Policy (CSP) & Invalidação Ativa de Cache', () => {

  it('1. index.html deve conter a meta tag Content-Security-Policy', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
    assert.ok(
      html.includes('http-equiv="Content-Security-Policy"'),
      'index.html deve declarar meta tag http-equiv="Content-Security-Policy"'
    );
  });

  it('2. CSP deve autorizar serviços essenciais e bloquear objetos arbitrários', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
    
    // Procura a linha de CSP
    const cspMatch = html.match(/content="([^"]*Content-Security-Policy[^"]*|[^"]*default-src[^"]*)"/i) ||
                     html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
    assert.ok(cspMatch, 'Diretiva CSP deve existir no index.html');
    const csp = cspMatch[1];

    // Serviços essenciais autorizados
    assert.ok(csp.includes('challenges.cloudflare.com'), 'CSP deve permitir Cloudflare Turnstile');
    assert.ok(csp.includes('identitytoolkit.googleapis.com'), 'CSP deve permitir Firebase Auth');
    assert.ok(csp.includes('firestore.googleapis.com'), 'CSP deve permitir Firestore');
    assert.ok(csp.includes('cloudfunctions.net'), 'CSP deve permitir Cloud Functions');
    assert.ok(csp.includes('fonts.googleapis.com'), 'CSP deve permitir Google Fonts');
    assert.ok(csp.includes('fonts.gstatic.com'), 'CSP deve permitir GStatic');
    assert.ok(csp.includes('open-meteo.com'), 'CSP deve permitir Open-Meteo');
    assert.ok(csp.includes("object-src 'none'"), 'CSP deve desativar object-src');
    assert.ok(csp.includes("base-uri 'self'"), 'CSP deve restringir base-uri a self');
  });

  it('3. vite.config.ts deve ativar skipWaiting, clientsClaim e limpeza de cache antigo', () => {
    const viteConfig = fs.readFileSync(path.resolve('vite.config.ts'), 'utf8');
    assert.ok(viteConfig.includes('skipWaiting: true'), 'Workbox deve ter skipWaiting: true');
    assert.ok(viteConfig.includes('clientsClaim: true'), 'Workbox deve ter clientsClaim: true');
    assert.ok(viteConfig.includes('cleanupOutdatedCaches: true'), 'Workbox deve ter cleanupOutdatedCaches: true');
  });

  it('4. src/main.tsx deve controlar a atualização transparente do Service Worker', () => {
    const mainSrc = fs.readFileSync(path.resolve('src/main.tsx'), 'utf8');
    assert.ok(
      mainSrc.includes("addEventListener('controllerchange'"),
      'Deve escutar controllerchange para aplicar atualizações imediatamente'
    );
    assert.ok(
      mainSrc.includes("registration.update()"),
      'Deve verificar atualizações do Service Worker ao iniciar'
    );
    assert.ok(
      mainSrc.includes("newWorker.postMessage({ type: 'SKIP_WAITING' })"),
      'Deve enviar SKIP_WAITING quando um novo worker é instalado'
    );
  });

});
