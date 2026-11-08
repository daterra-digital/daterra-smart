/**
 * DATERRA Smart - Testes de Regressão de Segurança SEC-05, SEC-08 & SEC-09
 * Validação de Blindagem de Servidor cPanel, Roteamento SPA e FTPS Seguro
 *
 * Garante que:
 * 1. public/.htaccess existe e configura regravação de URL para SPA.
 * 2. public/.htaccess aplica cabeçalhos de segurança HTTP (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy).
 * 3. public/.htaccess desativa listagem de diretorias (-Indexes) e protege o cache de index.html.
 * 4. vite.config.ts parametriza dinamicamente o base para suportar cPanel (raiz /) e Pages (/daterra-smart/).
 * 5. .github/workflows/deploy-cpanel.yml elimina variáveis Supabase e impõe FTPS com segurança estrita (TLS explícito).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-08: Blindagem de Servidor cPanel e Roteamento SPA', () => {

  it('1. public/.htaccess deve existir e conter regras de reencaminhamento SPA', () => {
    const htaccessPath = path.resolve('public/.htaccess');
    assert.ok(fs.existsSync(htaccessPath), 'public/.htaccess deve existir');

    const content = fs.readFileSync(htaccessPath, 'utf8');
    assert.ok(content.includes('RewriteEngine On'), 'Deve ativar RewriteEngine');
    assert.ok(content.includes('RewriteBase /'), 'Deve definir RewriteBase /');
    assert.ok(content.includes('RewriteRule . /index.html [L]'), 'Deve reencaminhar rotas SPA para index.html');
  });

  it('2. public/.htaccess deve definir cabeçalhos de segurança HTTP estritos', () => {
    const content = fs.readFileSync(path.resolve('public/.htaccess'), 'utf8');

    assert.ok(content.includes('X-Frame-Options "DENY"'), 'Deve conter X-Frame-Options DENY');
    assert.ok(content.includes('X-Content-Type-Options "nosniff"'), 'Deve conter X-Content-Type-Options nosniff');
    assert.ok(content.includes('Referrer-Policy "strict-origin-when-cross-origin"'), 'Deve conter Referrer-Policy');
    assert.ok(content.includes('Strict-Transport-Security'), 'Deve conter HSTS para produção');
  });

  it('3. public/.htaccess deve desativar listagem de diretorias e proteger cache do index.html', () => {
    const content = fs.readFileSync(path.resolve('public/.htaccess'), 'utf8');

    assert.ok(content.includes('Options -Indexes'), 'Deve desativar listagem de ficheiros (Options -Indexes)');
    assert.ok(content.includes('<Files "index.html">'), 'Deve ter bloco de controlo para index.html');
    assert.ok(content.includes('no-cache, no-store, must-revalidate'), 'index.html não deve ser cacheado');
  });

  it('4. vite.config.ts deve parametrizar base dinamicamente para cPanel vs Pages', () => {
    const viteContent = fs.readFileSync(path.resolve('vite.config.ts'), 'utf8');

    assert.ok(
      viteContent.includes("process.env.VITE_BASE_URL || (process.env.DEPLOY_TARGET === 'cpanel' ? '/' : '/daterra-smart/')"),
      'vite.config.ts deve calcular o base dinamicamente'
    );
  });

  it('5. .github/workflows/deploy-cpanel.yml deve usar FTPS estrito e zero variáveis Supabase', () => {
    const workflowContent = fs.readFileSync(path.resolve('.github/workflows/deploy-cpanel.yml'), 'utf8');

    // Nenhuma referência ao Supabase
    assert.ok(!workflowContent.includes('SUPABASE'), 'deploy-cpanel.yml não deve conter variáveis SUPABASE');

    // Configuração de FTPS seguro
    assert.ok(workflowContent.includes('protocol: ftps'), 'Deve exigir protocol: ftps');
    assert.ok(workflowContent.includes('security: strict'), 'Deve exigir security: strict');
    assert.ok(workflowContent.includes("VITE_BASE_URL: '/'"), 'Deve definir VITE_BASE_URL: /');
    assert.ok(workflowContent.includes("DEPLOY_TARGET: 'cpanel'"), 'Deve definir DEPLOY_TARGET: cpanel');
  });

});
