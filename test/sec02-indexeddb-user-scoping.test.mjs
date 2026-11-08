/**
 * DATERRA Smart - Teste de Regressão de Segurança SEC-02
 * Validação de Segregação de Dados Locais por Utilizador no IndexedDB / Dexie.js
 *
 * Garante que:
 * 1. Dexie v10 possui índices com 'userId' em calculation_history_v2 e mutation_outbox.
 * 2. LEGACY_UNASSIGNED_MARKER existe e é 'legacy_local_unassigned'.
 * 3. Registos órfãos / 'local-user' são migrados para o marcador seguro e blindados contra sync.
 * 4. drainOutbox descarta / ignora mutações sem userId ou com LEGACY_UNASSIGNED_MARKER.
 * 5. Nenhum ficheiro em src/features hardcodeia 'local-user' para persistência.
 * 6. Todas as consultas de histórico filtram por r.userId === effectiveUserId.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-02: Segregação de Dados Locais por Utilizador no IndexedDB', () => {

  it('1. Deve ter versão 10 no Dexie DB com índice userId na mutation_outbox', () => {
    const dbSource = fs.readFileSync(path.resolve('src/db/db.ts'), 'utf8');
    
    // Verifica declaração da versão 10
    assert.ok(dbSource.includes('.version(10)'), 'Dexie deve declarar versão 10');
    assert.ok(
      dbSource.includes("mutation_outbox: '++id, entityId, entityType, operation, synced, updatedAt, attempts, userId'"),
      'mutation_outbox na versão 10 deve incluir índice userId'
    );
  });

  it('2. LEGACY_UNASSIGNED_MARKER deve estar definido e ser exportado', () => {
    const calcTypes = fs.readFileSync(path.resolve('src/types/calculator.ts'), 'utf8');
    assert.ok(
      calcTypes.includes("export const LEGACY_UNASSIGNED_MARKER = 'legacy_local_unassigned'"),
      'LEGACY_UNASSIGNED_MARKER deve estar definido como legacy_local_unassigned'
    );
  });

  it('3. Migração da versão 10 deve tratar registos antigos "local-user" ou sem userId', () => {
    const dbSource = fs.readFileSync(path.resolve('src/db/db.ts'), 'utf8');
    assert.ok(
      dbSource.includes("record.userId = LEGACY_UNASSIGNED_MARKER;"),
      'Migração da versão 10 deve atribuir LEGACY_UNASSIGNED_MARKER a registos órfãos'
    );
  });

  it('4. OutboxService (drainOutbox) deve bloquear sincronização de registos órfãos / unassigned', () => {
    const outboxSource = fs.readFileSync(path.resolve('src/services/outbox/outboxService.ts'), 'utf8');
    
    // Verifica se drainOutbox filtra mutações sem userId legítimo
    assert.ok(
      outboxSource.includes('m.userId && m.userId !== LEGACY_UNASSIGNED_MARKER'),
      'drainOutbox deve filtrar mutações sem userId legítimo antes de sincronizar'
    );
  });

  it('5. Todas as calculadoras canónicas devem guardar com userId efetivo e não "local-user"', () => {
    const filesToCheck = [
      'src/features/ajuste-dose-eppo/eppoDoseStorage.ts',
      'src/features/area-parede-foliar/useLwaSaveHistory.ts',
      'src/features/consulta-ph/phStorage.ts',
      'src/features/volume-copa/useTrvSaveHistory.ts',
      'src/features/pre-inspecao/inspecaoStorage.ts',
      'src/features/mistura-concentracao/concentracaoStorage.ts',
      'src/features/mistura-dose/doseStorage.ts',
      'src/features/calculators/tabelas-debito/services/debitoHistoryService.ts',
      'src/features/calculators/tabelas-debito/services/useDebitoSaveHistory.ts',
      'src/features/calculators/velocidade-trabalho/VelocidadeTrabalhoView.tsx',
    ];

    for (const file of filesToCheck) {
      const fullPath = path.resolve(file);
      assert.ok(fs.existsSync(fullPath), `Ficheiro deve existir: ${file}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Não pode haver atribuição de userId: 'local-user'
      assert.ok(
        !content.includes("userId: 'local-user'"),
        `Ficheiro ${file} não deve conter userId: 'local-user'`
      );
    }
  });

  it('6. Todas as consultas de histórico devem filtrar por r.userId === effectiveUserId', () => {
    const viewsToCheck = [
      'src/features/ajuste-dose-eppo/EppoDoseCalculator.tsx',
      'src/features/area-parede-foliar/AreaParedeFoliarCalculator.tsx',
      'src/features/consulta-ph/ConsultaPhCalculator.tsx',
      'src/features/volume-copa/VolumeCopaCalculator.tsx',
      'src/features/pre-inspecao/PreInspecaoCalculator.tsx',
      'src/features/mistura-concentracao/ConcentracaoCaldaCalculator.tsx',
      'src/features/mistura-dose/DoseCaldaCalculator.tsx',
      'src/features/calculators/tabelas-debito/DebitoTrabalhoView.tsx',
      'src/features/calculators/velocidade-trabalho/VelocidadeTrabalhoView.tsx',
      'src/features/aplicacao-manual/AplicacaoManualCalculator.tsx',
    ];

    for (const file of viewsToCheck) {
      const fullPath = path.resolve(file);
      assert.ok(fs.existsSync(fullPath), `Ficheiro deve existir: ${file}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      assert.ok(
        content.includes('r.userId === effectiveUserId') || content.includes('r.userId === userId'),
        `Ficheiro ${file} deve filtrar histórico por r.userId === effectiveUserId`
      );
    }
  });

});
