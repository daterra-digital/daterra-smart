/**
 * DATERRA Smart - Testes de Regressão de Segurança SEC-07, SEC-10 & SEC-17
 * Validação de Privacidade, RGPD (Direito ao Apagamento), Lock com Checkpoints e Acessibilidade
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

describe('SEC-17: Privacidade, RGPD e Limpeza de Dependências Obsoletas', () => {

  it('1. package.json não deve conter a biblioteca vulnerável "xlsx" (SEC-10)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    assert.equal(allDeps['xlsx'], undefined, 'xlsx deve ser removido de package.json');
  });

  it('2. src/App.tsx deve higienizar a telemetria GA4 sem location.search (SEC-07)', () => {
    const appSource = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    assert.ok(appSource.includes('trackPageView(location.pathname)'), 'trackPageView deve receber estritamente location.pathname');
    assert.ok(!appSource.includes('location.pathname + location.search'), 'Não pode concatenar location.search na telemetria');
  });

  it('3. functions/src/auth/accountDeletion.ts deve validar no servidor, usar UID autenticado e eliminar subcoleções em profundidade', () => {
    const deletionPath = path.resolve('functions/src/auth/accountDeletion.ts');
    const lockPath = path.resolve('functions/src/auth/accountDeletionLock.ts');
    assert.ok(fs.existsSync(deletionPath), 'accountDeletion.ts deve existir');
    assert.ok(fs.existsSync(lockPath), 'accountDeletionLock.ts deve existir');

    const content = fs.readFileSync(deletionPath, 'utf8');
    const lockContent = fs.readFileSync(lockPath, 'utf8');
    assert.ok(content.split('\n').length < 200, 'accountDeletion.ts deve ter < 200 LOC');
    assert.ok(lockContent.split('\n').length < 200, 'accountDeletionLock.ts deve ter < 200 LOC');

    // Validação estrita de servidor
    assert.ok(content.includes('!request.auth || !request.auth.uid'), 'Deve exigir request.auth.uid');
    assert.ok(content.includes('const userId = request.auth!.uid;'), 'O UID a eliminar deve vir exclusivamente do token autenticado');
    assert.ok(content.includes('confirmation !== true'), 'Deve exigir confirmation === true');
    assert.ok(content.includes("confirmationText !== 'ELIMINAR'"), "Deve exigir confirmationText === 'ELIMINAR'");
    assert.ok(content.includes('RGPD_VALIDATION_FAILED'), 'Deve registar log de falha de validação');
    assert.ok(!content.includes('.catch(() => {})'), 'Não pode engolir erros com .catch(() => {})');

    // Eliminação em profundidade e pós-verificação
    assert.ok(content.includes('deleteSubcollectionsDeep'), 'Deve percorrer subcoleções recursivamente em profundidade');
    assert.ok(content.includes('listCollections()'), 'Deve usar listCollections() para inspecionar subcoleções');
    assert.ok(content.includes('residual.length > 0'), 'Deve verificar ausência de subcoleções residuais');
    assert.ok(content.includes('userDocRef.delete()'), 'Deve apagar documento de utilizador');
    assert.ok(content.includes('moodleDocRef.delete()'), 'Deve apagar dados da Moodle');
    assert.ok(content.includes('admin.auth().deleteUser(userId)'), 'Deve apagar utilizador no Auth');
  });

  it('4. functions/src/index.ts deve exportar deleteUserAccount, scheduledAccountDeletionRetries e scheduledAuthRateLimitCleanup (< 200 LOC)', () => {
    const indexPath = path.resolve('functions/src/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.split('\n').length < 200, 'functions/src/index.ts deve ter < 200 LOC');
    assert.ok(content.includes('export const deleteUserAccount = onCall'), 'Deve exportar deleteUserAccount');
    assert.ok(content.includes('timeoutSeconds: 120'), 'deleteUserAccount deve ter timeout explícito de 120s');
    assert.ok(content.includes('export const scheduledAccountDeletionRetries = onSchedule'), 'Deve exportar scheduledAccountDeletionRetries');
    assert.ok(content.includes('timeoutSeconds: 300'), 'scheduledAccountDeletionRetries deve ter timeout de 300s');
    assert.ok(content.includes('maxInstances: 1'), 'scheduledAccountDeletionRetries deve usar maxInstances: 1');
    assert.ok(content.includes('export const scheduledAuthRateLimitCleanup = onSchedule'), 'Deve exportar scheduledAuthRateLimitCleanup');
    assert.ok(!content.includes('resumePendingAccountDeletions = onCall'), 'NÃO deve expor callable de retoma a clientes comuns');
  });

  it('5. RgpdDeleteAccountButton.tsx deve condicionar purga local ao sucesso e não purgar em timeout (< 200 LOC)', () => {
    const buttonPath = path.resolve('src/features/settings/RgpdDeleteAccountButton.tsx');
    const dialogPath = path.resolve('src/features/settings/RgpdDeleteAccountDialog.tsx');
    const btnContent = fs.readFileSync(buttonPath, 'utf8');
    const dlgContent = fs.readFileSync(dialogPath, 'utf8');

    assert.ok(btnContent.split('\n').length < 200, 'RgpdDeleteAccountButton.tsx deve ter < 200 LOC');
    assert.ok(dlgContent.split('\n').length < 200, 'RgpdDeleteAccountDialog.tsx deve ter < 200 LOC');

    // Purga condicional
    assert.ok(btnContent.includes('data?.success !== true'), 'Deve validar data.success antes da purga');
    assert.ok(btnContent.includes('clearLocalSessionData({ purgeAll: true })'), 'Deve purgar apenas com sucesso confirmado');
    assert.ok(btnContent.includes('deadline-exceeded'), 'Deve capturar timeout e informar sobre retoma sem purgar');
    assert.ok(!btnContent.includes('.catch(() => {})'), 'Não pode engolir erros de purga');

    // Acessibilidade
    assert.ok(dlgContent.includes('role="dialog"'), 'Diálogo deve declarar role="dialog"');
    assert.ok(dlgContent.includes('aria-modal="true"'), 'Diálogo deve declarar aria-modal="true"');
    assert.ok(dlgContent.includes('aria-labelledby='), 'Diálogo deve ter aria-labelledby');
    assert.ok(dlgContent.includes('aria-describedby='), 'Diálogo deve ter aria-describedby');
    assert.ok(dlgContent.includes("e.key === 'Escape'"), 'Diálogo deve fechar com tecla Escape');
    assert.ok(dlgContent.includes("e.key === 'Tab'"), 'Diálogo deve implementar focus trap com Tab');
    assert.ok(dlgContent.includes('previousFocusRef'), 'Diálogo deve restaurar foco ao fechar');
    assert.ok(dlgContent.includes('role="alert"'), 'Erros devem ter role="alert"');
    assert.ok(dlgContent.includes('aria-live="assertive"'), 'Erros devem ter aria-live="assertive"');
    assert.ok(!btnContent.includes('window.prompt('), 'NÃO deve utilizar window.prompt');
  });

  it('6. SettingsView.tsx deve integrar o RgpdDeleteAccountButton na Zona de Perigo', () => {
    const settingsSource = fs.readFileSync(path.resolve('src/views/SettingsView.tsx'), 'utf8');
    assert.ok(settingsSource.includes('RgpdDeleteAccountButton'), 'SettingsView.tsx deve importar RgpdDeleteAccountButton');
  });

  it('7. accountDeletion.ts trata auth/user-not-found e previne Auth deletion antes do Firestore', () => {
    const content = fs.readFileSync(path.resolve('functions/src/auth/accountDeletion.ts'), 'utf8');
    assert.ok(content.includes("auth/user-not-found"), 'Deve tratar auth/user-not-found graciosamente');

    const firestoreIdx = content.indexOf('userDocRef.delete()');
    const authIdx = content.indexOf('admin.auth().deleteUser(userId)');
    assert.ok(firestoreIdx !== -1 && authIdx !== -1, 'Ambos os blocos devem existir');
    assert.ok(authIdx > firestoreIdx, 'Auth deleteUser deve ser invocado APÓS exclusão do Firestore');
  });

  it('8. accountDeletionLock.ts implementa lock transacional, lockGeneration e LOCK_EXPIRATION_MS superior ao timeout', () => {
    const lockContent = fs.readFileSync(path.resolve('functions/src/auth/accountDeletionLock.ts'), 'utf8');
    const typesContent = fs.readFileSync(path.resolve('functions/src/auth/accountDeletionTypes.ts'), 'utf8');

    assert.ok(lockContent.includes('db.runTransaction'), 'Deve usar transação Firestore para aquisição de lock');
    assert.ok(lockContent.includes('lockGen'), 'Deve incluir versão/geração do lock (lockGeneration)');
    assert.ok(lockContent.includes("throw new Error('LOCK_LOST')"), 'Deve abortar renovação se lock tiver sido perdido');
    assert.ok(typesContent.includes('LOCK_EXPIRATION_MS = 10 * 60 * 1000'), 'Lock deve ser de 10 min (superior a timeout de 300s)');
    assert.ok(lockContent.includes("'already-exists'"), 'Deve rejeitar pedidos concorrentes em progresso');
  });

  it('9. accountDeletion.ts exige reautenticação recente (< 5 min)', () => {
    const content = fs.readFileSync(path.resolve('functions/src/auth/accountDeletion.ts'), 'utf8');
    assert.ok(content.includes('validateRecentAuth'), 'Deve validar autenticação recente');
    assert.ok(content.includes('auth_time'), 'Deve inspecionar claim auth_time do token');
    assert.ok(content.includes('MAX_AUTH_AGE_SECONDS'), 'Deve limitar idade máxima da autenticação');
  });

  it('10. accountDeletion.ts suporta retoma administrativa e purga automática', () => {
    const content = fs.readFileSync(path.resolve('functions/src/auth/accountDeletion.ts'), 'utf8');
    assert.ok(content.includes('export async function processPendingAccountDeletions'), 'Deve exportar processPendingAccountDeletions');
    assert.ok(content.includes("where('status', 'in', ['partially_completed', 'failed'])"), 'Deve filtrar estados retomáveis');
    assert.ok(content.includes('MAX_RETRY_ATTEMPTS'), 'Deve limitar tentativas máximas de retoma');
    assert.ok(content.includes("where('status', '==', 'completed')"), 'Deve purgar registos concluídos expirados');
  });

  it('11. rateLimiter.ts utiliza HMAC-SHA256 com pepper para mitigar inversão de hashes', () => {
    const rateLimiterContent = fs.readFileSync(path.resolve('functions/src/auth/rateLimiter.ts'), 'utf8');
    assert.ok(rateLimiterContent.includes('createHmac'), 'Deve usar crypto.createHmac');
    assert.ok(rateLimiterContent.includes('RATE_LIMIT_PEPPER'), 'Deve incluir pepper/secret de aplicação');
    assert.ok(rateLimiterContent.includes('AUTH_RATE_LIMIT_RETENTION_MS'), 'Deve fixar retenção proporcional de 2h');
  });

  it('12. Procedimento de rollback com git cat-file diferencia ficheiros novos de pré-existentes', () => {
    // Ficheiro pré-existente no commit base 8ac232c
    let existsInBase = true;
    try {
      execSync('git cat-file -e 8ac232c:functions/src/auth/accountDeletion.ts', { stdio: 'pipe' });
    } catch {
      existsInBase = false;
    }
    assert.equal(existsInBase, true, 'accountDeletion.ts existia em 8ac232c (deve usar git restore)');

    // Ficheiro novo criado nestas tarefas
    let newFileInBase = true;
    try {
      execSync('git cat-file -e 8ac232c:functions/src/auth/accountDeletionLock.ts', { stdio: 'pipe' });
    } catch {
      newFileInBase = false;
    }
    assert.equal(newFileInBase, false, 'accountDeletionLock.ts é novo e não existia em 8ac232c');
  });

});
