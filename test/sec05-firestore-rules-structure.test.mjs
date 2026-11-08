/**
 * DATERRA Smart - Teste de Regressão de Segurança SEC-05
 * Validação Estrutural e Arquitetural de Regras do Cloud Firestore (firestore.rules)
 *
 * Garante que:
 * 1. firebase.json referencia formalmente firestore.rules e firestore.indexes.json.
 * 2. firestore.rules declara rules_version = '2' e Default Deny global.
 * 3. users/{userId} exige estritamente isOwner(userId) (request.auth.uid == userId).
 * 4. Protege contra privilege escalation (tier, plan, subscriptionTier, role, isAdmin).
 * 5. Veda completamente coleções de backend (_auth_rate_limits, user_moodle_links, academy_idempotency).
 * 6. firestore.indexes.json é um ficheiro JSON válido.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SEC-05: Regras de Segurança do Cloud Firestore (firestore.rules)', () => {

  it('1. firebase.json deve declarar configuração de firestore (regras e índices)', () => {
    const raw = fs.readFileSync(path.resolve('firebase.json'), 'utf8');
    const parsed = JSON.parse(raw);
    assert.ok(parsed.firestore, 'firebase.json deve conter chave firestore');
    assert.equal(parsed.firestore.rules, 'firestore.rules');
    assert.equal(parsed.firestore.indexes, 'firestore.indexes.json');
  });

  it('2. firestore.rules deve declarar rules_version = "2"', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(rules.includes("rules_version = '2';"), 'Deve especificar rules_version = "2"');
  });

  it('3. Coleção users/{userId} deve isolar estritamente o acesso por request.auth.uid', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(rules.includes('match /users/{userId}'), 'Deve declarar rota match /users/{userId}');
    assert.ok(rules.includes('isOwner(userId)'), 'Deve exigir isOwner(userId)');
    assert.ok(rules.includes('request.auth.uid == userId'), 'isOwner deve validar request.auth.uid == userId');
  });

  it('4. Deve blindar contra elevação de privilégios (tier, role, isAdmin, credits)', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(rules.includes('isTierUnchanged()'), 'Deve ter função de proteção de tier');
    assert.ok(rules.includes('isPlanUnchanged()'), 'Deve ter função de proteção de plan');
    assert.ok(rules.includes('isRoleUnchanged()'), 'Deve ter função de proteção de role');
    assert.ok(rules.includes('isIsAdminUnchanged()'), 'Deve ter função de proteção de isAdmin');
    assert.ok(rules.includes('areCreditsValidOnUpdate()'), 'Créditos não podem ser aumentados client-side');
  });

  it('5. Coleções privadas do backend devem ser totalmente vedadas ao cliente', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(rules.includes('match /_auth_rate_limits/{docId}'), 'Deve mapear _auth_rate_limits');
    assert.ok(rules.includes('match /user_moodle_links/{uid}'), 'Deve mapear user_moodle_links');
    assert.ok(rules.includes('match /academy_idempotency/{mutationId}'), 'Deve mapear academy_idempotency');
    assert.ok(rules.includes('match /_user_deletion_ops/{uid}'), 'Deve mapear _user_deletion_ops');
  });

  it('6. Deve conter fecho global Default Deny', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(
      rules.includes('match /{document=**} {\n      allow read, write: if false;\n    }'),
      'Deve declarar match /{document=**} com allow read, write: if false;'
    );
  });

  it('7. firestore.indexes.json deve ser JSON válido', () => {
    const raw = fs.readFileSync(path.resolve('firestore.indexes.json'), 'utf8');
    const parsed = JSON.parse(raw);
    assert.ok(Array.isArray(parsed.indexes));
    assert.ok(Array.isArray(parsed.fieldOverrides));
  });

  it('8. Não deve conter regra recursiva permissiva para subcoleções de users', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(
      !rules.includes('match /{subcollection}/{docId=**}'),
      'Não deve conter wildcard permissivo de subcoleções em users/{userId}'
    );
  });

  it('9. Não deve usar allow ... if false como mecanismo de sobreposição enganoso', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    // Verifica que match /users/{userId} não tem regras internas redundantes com if false sobrepostas
    const userMatchSection = rules.match(/match\s+\/users\/\{userId\}\s*\{([\s\S]*?)\n\s{4}\}/);
    assert.ok(userMatchSection, 'Secção users/{userId} deve existir');
    const userBody = userMatchSection[1];
    assert.ok(
      !userBody.includes('match /{subcollection}'),
      'users/{userId} não deve conter sub-match com if false tentando anular regras pai'
    );
  });

  it('10. Não deve usar request.resource.size (propriedade exclusiva de Cloud Storage Rules)', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(
      !rules.includes('request.resource.size'),
      'request.resource.size pertence a Cloud Storage; em Firestore usa-se data.size() para número de campos'
    );
  });

  it('11. Proteção estrita contra mutação de privilégios e role admin', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    assert.ok(rules.includes("request.resource.data.role != 'admin'"), 'Deve impedir atribuição de role admin');
    assert.ok(rules.includes("request.resource.data.isAdmin == false"), 'isAdmin deve ser sempre false');
    assert.ok(rules.includes("request.resource.data.tier == 'free'"), 'tier inicial deve ser free');
  });

});
