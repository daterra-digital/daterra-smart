/**
 * DATERRA Smart - Testes de Regressão de Segurança SEC-07, SEC-10 & SEC-17
 * Validação de Privacidade, RGPD (Direito ao Apagamento) e Remoção de Dependências Obsoletas
 *
 * Garante que:
 * 1. package.json não contém a dependência obsoleta e vulnerável 'xlsx'.
 * 2. src/App.tsx higieniza a telemetria GA4 transmitindo apenas location.pathname sem query params.
 * 3. functions/src/auth/accountDeletion.ts existe, respeita < 200 LOC e valida autenticação antes de apagar.
 * 4. functions/src/index.ts exporta deleteUserAccount e respeita < 200 LOC.
 * 5. RgpdDeleteAccountButton.tsx existe, respeita < 200 LOC e invoca a Cloud Function e desinfeção local.
 * 6. SettingsView.tsx integra o componente RgpdDeleteAccountButton na Zona de Perigo.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-17: Privacidade, RGPD e Limpeza de Dependências Obsoletas', () => {

  it('1. package.json não deve conter a biblioteca vulnerável "xlsx" (SEC-10)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));

    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };

    assert.equal(allDeps['xlsx'], undefined, 'xlsx deve ser removido de package.json');
  });

  it('2. src/App.tsx deve higienizar a telemetria GA4 sem location.search (SEC-07)', () => {
    const appSource = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');

    assert.ok(
      appSource.includes('trackPageView(location.pathname)'),
      'trackPageView deve receber estritamente location.pathname'
    );
    assert.ok(
      !appSource.includes('location.pathname + location.search'),
      'Não pode concatenar location.search na telemetria'
    );
  });

  it('3. functions/src/auth/accountDeletion.ts deve existir, ter < 200 LOC e validar auth (SEC-17)', () => {
    const deletionPath = path.resolve('functions/src/auth/accountDeletion.ts');
    assert.ok(fs.existsSync(deletionPath), 'accountDeletion.ts deve existir');

    const content = fs.readFileSync(deletionPath, 'utf8');
    const lines = content.split('\n').length;
    assert.ok(lines < 200, `accountDeletion.ts deve ter < 200 LOC (tem ${lines})`);

    // Validações de segurança
    assert.ok(content.includes('!request.auth || !request.auth.uid'), 'Deve exigir request.auth.uid');
    assert.ok(content.includes('admin.auth().deleteUser(userId)'), 'Deve apagar utilizador no Firebase Auth');
    assert.ok(content.includes('userDocRef.delete()'), 'Deve apagar perfil no Firestore');
  });

  it('4. functions/src/index.ts deve exportar deleteUserAccount e ter < 200 LOC', () => {
    const indexPath = path.resolve('functions/src/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    const lines = content.split('\n').length;

    assert.ok(lines < 200, `functions/src/index.ts deve ter < 200 LOC (tem ${lines})`);
    assert.ok(content.includes('export const deleteUserAccount = onCall'), 'Deve exportar deleteUserAccount');
    assert.ok(content.includes('handleDeleteUserAccount'), 'Deve delegar para handleDeleteUserAccount');
  });

  it('5. RgpdDeleteAccountButton.tsx deve existir e invocar a função de eliminação', () => {
    const buttonPath = path.resolve('src/features/settings/RgpdDeleteAccountButton.tsx');
    assert.ok(fs.existsSync(buttonPath), 'RgpdDeleteAccountButton.tsx deve existir');

    const content = fs.readFileSync(buttonPath, 'utf8');
    const lines = content.split('\n').length;
    assert.ok(lines < 200, `RgpdDeleteAccountButton.tsx deve ter < 200 LOC (tem ${lines})`);

    assert.ok(content.includes("httpsCallable(functions, 'deleteUserAccount')"), 'Deve invocar deleteUserAccount');
    assert.ok(content.includes('clearLocalSessionData({ purgeAll: true })'), 'Deve purgar a sessão local');
    assert.ok(content.includes('await logout()'), 'Deve terminar a sessão');
  });

  it('6. SettingsView.tsx deve integrar o RgpdDeleteAccountButton na Zona de Perigo', () => {
    const settingsSource = fs.readFileSync(path.resolve('src/views/SettingsView.tsx'), 'utf8');

    assert.ok(
      settingsSource.includes('RgpdDeleteAccountButton'),
      'SettingsView.tsx deve importar e renderizar RgpdDeleteAccountButton'
    );
  });

});
