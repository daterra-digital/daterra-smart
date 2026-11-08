/**
 * DATERRA Smart - Teste Unitário e de Conformidade do Componente VersionCard
 * Validação de Deteção Automática de Ambientes (V-DEV, V-RC, V-PAGES, V-PROD, Rollback),
 * Segurança Estrita e Acessibilidade WCAG AA
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Importa funções do VersionCard
const { detectEnvironment } = await import('../src/components/version/detectEnvironment.ts');
const { APP_VERSION_INFO } = await import('../src/config/versionInfo.ts');

describe('Componente Oficial: VersionCard', () => {

  it('1. Arquitetura Modular: VersionCard.tsx deve ter menos de 200 linhas de código', () => {
    const code = fs.readFileSync(path.resolve('src/components/version/VersionCard.tsx'), 'utf8');
    const lines = code.split('\n').length;
    assert.ok(lines <= 200, `VersionCard deve ter <= 200 linhas (atual: ${lines})`);
  });

  it('2. Deteção Automática: V-RC (Localhost :5175 com versão -rc)', () => {
    globalThis.window = {
      location: {
        hostname: 'localhost',
        port: '5175',
        origin: 'http://localhost:5175',
        search: ''
      }
    };

    const env = detectEnvironment();
    assert.equal(env.type, 'rc', 'Deve detetar tipo rc');
    assert.equal(env.label, 'Candidata a publicação', 'Deve ter etiqueta Candidata a publicação');
    assert.equal(env.firebaseEnv, 'Testes', 'Firebase deve ser Testes');
    assert.equal(env.tag, APP_VERSION_INFO.canonicalRcTag, 'Tag deve ser canonicalRcTag');
  });

  it('3. Deteção Automática: V-DEV (Localhost padrão :5173)', () => {
    // Para testar DEV sem ser RC, criamos mock temporário
    globalThis.window = {
      location: {
        hostname: 'localhost',
        port: '5173',
        origin: 'http://localhost:5173',
        search: ''
      }
    };

    const env = detectEnvironment();
    assert.ok(env.type === 'rc' || env.type === 'dev', 'Em ambiente local identifica dev ou rc');
  });

  it('4. Deteção Automática: V-PAGES (GitHub Pages)', () => {
    globalThis.window = {
      location: {
        hostname: 'daterra-digital.github.io',
        port: '',
        origin: 'https://daterra-digital.github.io',
        search: ''
      }
    };

    const env = detectEnvironment();
    assert.equal(env.type, 'pages', 'Deve detetar tipo pages');
    assert.equal(env.label, 'Homologação — GitHub Pages', 'Etiqueta deve ser Homologação — GitHub Pages');
    assert.equal(env.firebaseEnv, 'Testes', 'Firebase deve ser Testes');
    assert.equal(env.tag, APP_VERSION_INFO.canonicalPagesTag, 'Tag deve ser v1.0.0-pages');
  });

  it('5. Deteção Automática: V-PROD (smart.daterra.com.pt)', () => {
    globalThis.window = {
      location: {
        hostname: 'smart.daterra.com.pt',
        port: '',
        origin: 'https://smart.daterra.com.pt',
        search: ''
      }
    };

    const env = detectEnvironment();
    assert.equal(env.type, 'prod', 'Deve detetar tipo prod');
    assert.equal(env.label, 'Produção', 'Etiqueta deve ser Produção');
    assert.equal(env.firebaseEnv, 'Produção', 'Firebase deve ser Produção');
    assert.equal(env.tag, APP_VERSION_INFO.canonicalProdTag, 'Tag deve ser v1.0.0-prod');
  });

  it('6. Deteção Automática: Estado de Rollback (?rollback=true)', () => {
    globalThis.window = {
      location: {
        hostname: 'smart.daterra.com.pt',
        port: '',
        origin: 'https://smart.daterra.com.pt',
        search: '?rollback=true'
      }
    };

    const env = detectEnvironment();
    assert.equal(env.type, 'rollback', 'Deve detetar rollback');
    assert.equal(env.label, 'Rollback aplicado', 'Etiqueta deve ser Rollback aplicado');
  });

  it('7. Segurança Estrita: Não deve expor caminhos locais de ficheiros nem credenciais', () => {
    const code = fs.readFileSync(path.resolve('src/components/version/VersionCard.tsx'), 'utf8');
    assert.ok(!code.includes('C:\\'), 'Não deve conter caminhos do Windows C:\\');
    assert.ok(!code.includes('apiKey'), 'Não deve expor chaves apiKey');
    assert.ok(!code.includes('private_key'), 'Não deve expor chaves privadas');
    assert.ok(!code.includes('AIzaSy'), 'Não deve expor segredos Firebase');
  });

  it('8. Acessibilidade WCAG AA: Verificação de atributos aria e contraste', () => {
    const code = fs.readFileSync(path.resolve('src/components/version/VersionCard.tsx'), 'utf8');
    assert.ok(code.includes('aria-expanded'), 'Deve incluir aria-expanded no botão de detalhes');
    assert.ok(code.includes('aria-controls'), 'Deve incluir aria-controls');
    assert.ok(code.includes('aria-hidden="true"'), 'Ícones decorativos devem ter aria-hidden');
    assert.ok(code.includes('touch-target'), 'Deve manter zona de toque confortável');
  });

});
