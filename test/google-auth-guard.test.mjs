/**
 * DATERRA Smart - Teste de Regressão de Segurança: Controlo de Acesso Google e CSP
 *
 * Valida:
 * 1. index.html autoriza estritamente os domínios Google e Firebase Auth no CSP sem baixar a guarda.
 * 2. AuthContext bloqueia a entrada de utilizadores Google não registados na aba 'Iniciar Sessão'.
 * 3. AuthContext apresenta nota pedagógica em caso de indisponibilidade da Google.
 * 4. useLoginFlow exige identificação da empresa/exploração agrícola para novos registos.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Controlo de Acesso e Segurança na Autenticação Google', () => {

  it('1. index.html deve conter diretivas CSP com autorização estrita da Google Auth e Turnstile', () => {
    const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
    const cspMatch = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
    assert.ok(cspMatch, 'Deve conter meta tag CSP');
    const csp = cspMatch[1];

    // Frame-src deve conter Cloudflare Turnstile, Firebase App e Google Accounts
    assert.ok(csp.includes('frame-src'), 'CSP deve ter frame-src');
    assert.ok(csp.includes('*.firebaseapp.com'), 'frame-src deve autorizar *.firebaseapp.com para handshake seguro');
    assert.ok(csp.includes('accounts.google.com'), 'frame-src deve autorizar accounts.google.com');
    assert.ok(csp.includes('challenges.cloudflare.com'), 'frame-src deve autorizar Cloudflare Turnstile');

    // Connect-src deve conter APIs essenciais
    assert.ok(csp.includes('https://accounts.google.com'), 'connect-src deve autorizar accounts.google.com');
    assert.ok(csp.includes('https://*.googleapis.com'), 'connect-src deve autorizar *.googleapis.com');
  });

  it('2. AuthContext.tsx deve conter lógica de bloqueio para contas Google não registadas no Iniciar Sessão', () => {
    const code = fs.readFileSync(path.resolve('src/context/AuthContext.tsx'), 'utf8');
    assert.ok(code.includes('ACCOUNT_NOT_FOUND'), 'Deve definir código de erro ACCOUNT_NOT_FOUND');
    assert.ok(code.includes('!options?.isRegistration && !snap.exists()'), 'Deve verificar se a conta existe antes de permitir login');
    assert.ok(code.includes('await signOut(auth)'), 'Deve fechar a sessão se a conta não estiver registada');
  });

  it('3. AuthContext.tsx deve conter mensagem pedagógica quando o serviço Google estiver indisponível', () => {
    const code = fs.readFileSync(path.resolve('src/context/AuthContext.tsx'), 'utf8');
    assert.ok(code.includes('GOOGLE_UNAVAILABLE'), 'Deve conter código GOOGLE_UNAVAILABLE');
    assert.ok(
      code.includes('A autenticação com a conta Google encontra-se temporariamente indisponível'),
      'Deve apresentar nota recomendando o e-mail / Magic Link seguro'
    );
  });

  it('4. useLoginFlow.ts deve exigir identificação da entidade agrícola no registo com a Google', () => {
    const code = fs.readFileSync(path.resolve('src/features/auth/hooks/useLoginFlow.ts'), 'utf8');
    assert.ok(code.includes("mode === 'register' && !companyName.trim()"), 'Deve validar preenchimento da entidade agrícola');
    assert.ok(code.includes('googleNeedCompany'), 'Deve conter chave de aviso de entidade obrigatória');
  });

});
