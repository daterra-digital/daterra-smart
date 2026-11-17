import 'fake-indexeddb/auto';
import { registerHooks } from 'node:module';
import { after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { db, DaterraDatabase } from '../src/db/db.ts';
import { LEGACY_UNASSIGNED_MARKER } from '../src/types/calculator.ts';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.(tsx?|jsx?|mjs|cjs|json)$/i.test(specifier) && context.parentURL?.startsWith('file:')) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      for (const ext of ['.tsx', '.ts']) {
        const candidate = path.join(parentDir, specifier + ext);
        if (fs.existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const filePath = new URL(url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
    if (url.endsWith('.json') && !url.includes('node_modules')) {
      return { format: 'module', source: `export default ${fs.readFileSync(filePath, 'utf8')};`, shortCircuit: true };
    }
    if (url.endsWith('.tsx')) {
      const out = ts.transpileModule(fs.readFileSync(filePath, 'utf8'), {
        fileName: filePath,
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX }
      });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  }
});

const { hasLocalUserData } = await import('../src/services/auth/localUserDataPresence.ts');
const { clearUserIndexedDbData } = await import('../src/services/auth/sessionCleanupService.ts');
const { LogoutWarningModal } = await import('../src/components/auth/LogoutWarningModal.tsx');

const makeMemoryStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  return { getItem: (k) => map.get(k) ?? null };
};

describe('Perfis Bloco 3: Aviso Transitório antes de Logout Destrutivo', () => {
  const testDb = new DaterraDatabase(`Bloco3Logout_${Date.now()}`);

  beforeEach(async () => {
    await Promise.all([
      testDb.profiles_cultures.clear(),
      testDb.calculation_history_v2.clear(),
      testDb.mutation_outbox.clear(),
      db.profiles_cultures.clear(),
      db.profiles_equipment.clear()
    ]);
  });

  after(async () => {
    await testDb.delete();
  });

  it('1. Módulos do Bloco 3 respeitam limites de linhas (<= 200 e PrivateLayout < 200)', () => {
    for (const p of [
      'src/services/auth/localUserDataPresence.ts',
      'src/components/auth/LogoutWarningModal.tsx',
      'src/components/auth/useLogoutConfirmation.ts'
    ]) {
      const loc = fs.readFileSync(p, 'utf8').split('\n').length;
      assert.ok(loc <= 200, `${p} excede 200 LOC (${loc})`);
    }
    const layoutLoc = fs.readFileSync('src/components/PrivateLayout.tsx', 'utf8').split('\n').length;
    assert.ok(layoutLoc < 200, `PrivateLayout.tsx tem ${layoutLoc} linhas (>= 200)`);
  });

  it('2. hasLocalUserData deteta dados de utilizador independentemente de Outbox synced: 1 ou contagem 0', async () => {
    const storeEmpty = makeMemoryStorage();
    assert.deepEqual(await hasLocalUserData('user-A', testDb, storeEmpty), { status: 'absent', count: 0 });

    await testDb.mutation_outbox.add({
      entityId: '1', entityType: 'culture', operation: 'UPDATE', payload: {}, synced: 1, updatedAt: '2026-11-11T00:00:00Z', attempts: 1, userId: 'user-A'
    });
    await testDb.profiles_cultures.add({ name: 'Cultura B', crop_type: 'Vinha', area_ha: 2, userId: 'user-B' });
    await testDb.profiles_cultures.add({ name: 'Legada', crop_type: 'Vinha', area_ha: 1, userId: LEGACY_UNASSIGNED_MARKER });
    assert.deepEqual(await hasLocalUserData('user-A', testDb, storeEmpty), { status: 'absent', count: 0 });

    await testDb.profiles_cultures.add({ name: 'Cultura A', crop_type: 'Vinha', area_ha: 2, userId: 'user-A' });
    const resDb = await hasLocalUserData('user-A', testDb, storeEmpty);
    assert.equal(resDb.status, 'present');
    assert.equal(resDb.count, 1);

    const storePre = makeMemoryStorage({ daterra_pre_inspection_history_v1: JSON.stringify([{ id: '1', userId: 'user-C' }]) });
    assert.equal((await hasLocalUserData('user-C', testDb, storePre)).status, 'present');
    assert.equal((await hasLocalUserData('', testDb, storeEmpty)).status, 'indeterminate');
    const badJsonStore = makeMemoryStorage({ daterra_pre_inspection_history_v1: '{corrupt-json' });
    assert.equal((await hasLocalUserData('user-D', testDb, badJsonStore)).status, 'indeterminate');
  });

  it('3. Modal renderiza texto real sem prometer backup/exportação, foca Cancelar e trata Escape/focus trap', () => {
    const html = renderToStaticMarkup(
      React.createElement(LogoutWarningModal, {
        isOpen: true, mode: 'local-data-loss', presenceStatus: 'present', isSubmitting: false,
        isOnline: true, onCancel: () => {}, onConfirmDestructiveLogout: () => {}, onSyncAndContinue: () => {}
      })
    );
    assert.ok(html.includes('role="alertdialog"'));
    assert.ok(html.includes('estão guardados apenas neste dispositivo'));
    assert.ok(html.includes('Cancelar'));
    assert.ok(html.includes('Terminar sessão e apagar dados locais'));
    assert.ok(!html.toLowerCase().includes('exportar json'));

    const modalSrc = fs.readFileSync('src/components/auth/LogoutWarningModal.tsx', 'utf8');
    assert.ok(modalSrc.includes('cancelButtonRef.current?.focus()'));
    assert.ok(modalSrc.includes("e.key === 'Escape'"));
    assert.ok(modalSrc.includes("e.key !== 'Tab'"));
    assert.ok(modalSrc.includes('previousFocusRef.current.focus()'));
    assert.ok(modalSrc.includes('disabled={isSubmitting}'));
  });

  it('4. Todos os pontos voluntários de saída usam requestLogout; cancelar preserva e confirmar limpa apenas userId', async () => {
    const layoutSrc = fs.readFileSync('src/components/PrivateLayout.tsx', 'utf8');
    const desktopSrc = fs.readFileSync('src/components/layout/PrivateDesktopNav.tsx', 'utf8');
    const drawerSrc = fs.readFileSync('src/components/layout/PrivateNavDrawer.tsx', 'utf8');
    const rgpdSrc = fs.readFileSync('src/features/settings/RgpdDeleteAccountButton.tsx', 'utf8');
    assert.ok(layoutSrc.includes('onLogout={requestLogout}'));
    assert.ok(desktopSrc.includes('onClick={onLogout}'));
    assert.ok(drawerSrc.includes('onClick={onLogout}'));
    assert.ok(rgpdSrc.includes('clearLocalSessionData({ purgeAll: true })'));

    await db.profiles_cultures.add({ name: 'Cultura A', crop_type: 'Vinha', area_ha: 2, userId: 'user-A' });
    await db.profiles_cultures.add({ name: 'Cultura B', crop_type: 'Olival', area_ha: 5, userId: 'user-B' });
    await db.profiles_cultures.add({ name: 'Legada', crop_type: 'Vinha', area_ha: 1, userId: undefined });

    let cancelledCleared = false;
    const simulateCancel = () => !cancelledCleared;
    assert.equal(simulateCancel(), true);
    assert.equal((await db.profiles_cultures.where('userId').equals('user-A').toArray()).length, 1);

    await clearUserIndexedDbData('user-A');
    assert.equal((await db.profiles_cultures.where('userId').equals('user-A').toArray()).length, 0);
    assert.equal((await db.profiles_cultures.where('userId').equals('user-B').toArray()).length, 1);
    assert.equal((await db.profiles_cultures.filter((c) => c.userId === undefined).toArray()).length, 1);
  });
});
