# 📋 Dossier da Tarefa 13: Regras de Segurança e Índices do Cloud Firestore

**Data:** 2026-11-08  
**Ambiente:** V-DEV (`develop`)  
**Responsável Técnico:** Subagente Especialista `firestore-rules-author`  
**Conformidade:** Regra SEC-05, Modelo de Segurança Firebase Rules v2, RGPD e Proteção de Dados Agrícolas  

---

## 1. Contexto e Vulnerabilidades Mitigadas (SEC-05)

A auditoria de segurança constatou que o repositório da DATERRA Smart não continha o ficheiro oficial de regras de segurança do Firestore (`firestore.rules`) nem o ficheiro de índices (`firestore.indexes.json`), e que `firebase.json` apenas referia as Cloud Functions. 

Sem regras declaradas no código-fonte sob controlo de versões:
1. **Risco de Acesso Cruzado:** Qualquer utilizador autenticado poderia potencialmente tentar ler perfis e dados de outros utilizadores (`users/{userId}`).
2. **Risco de Elevação de Privilégios (Privilege Escalation):** Sem restrições declarativas, um utilizador malicioso poderia tentar alterar o seu próprio plano/tier para `'pro'` ou atribuir-se a si próprio o papel de `'admin'`.
3. **Exposição de Coleções Internas:** Coleções de controlo de taxa (`_auth_rate_limits`) ou integrações de academia/moodle podiam ficar desprotegidas contra leitura direta por clientes Web.

---

## 2. Ações Implementadas pelo Agente Especialista (`firestore-rules-author`)

### A. Ficheiro de Regras [`firestore.rules`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/firestore.rules)
* **Especificação de Versão:** `rules_version = '2';`.
* **Isolamento Estrito de Perfis (`users/{userId}`):**
  - Leitura permitida estritamente se `request.auth.uid == userId`.
  - Proibição absoluta de listagem e enumeração pública de utilizadores.
* **Blindagem contra Elevação de Privilégios:**
  - `isTierUnchanged()`: O utilizador não pode alterar o seu `tier` via cliente.
  - `isPlanUnchanged()` e `isSubscriptionTierUnchanged()`: Bloqueio de auto-atribuição de planos pagos.
  - `isRoleUnchanged()` e `isIsAdminUnchanged()`: Bloqueio de auto-atribuição de perfil administrativo.
  - `areCreditsValidOnUpdate()`: Créditos de exportação só podem manter-se ou decrescer (consumo legítimo).
* **Eliminação de Update Bypass (Validator Function Pattern):**
  - Implementada a função `isValidUserDoc(data)` que valida a conformidade dos 25 campos conhecidos, tipos e limites de caracteres (prevenindo ataques DoS/Resource Exhaustion por sobrecarga de strings).
* **Vedação Total de Coleções de Backend:**
  - `match /_auth_rate_limits/{docId}`: `allow read, write: if false;`
  - `match /user_moodle_links/{uid}`: `allow read, write: if false;`
  - `match /academy_idempotency/{mutationId}`: `allow read, write: if false;`
* **Fecho Global (Fail-Closed / Default Deny):**
  - `match /{document=**} { allow read, write: if false; }` assegura que qualquer rota futura desconhecida fica bloqueada por omissão.

### B. Ficheiro de Índices [`firestore.indexes.json`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/firestore.indexes.json)
* Criado ficheiro canónico com definições explícitas de índices e overrides.

### C. Configuração em [`firebase.json`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/firebase.json)
* Declarado o bloco oficial de configuração:
  ```json
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
  ```

---

## 3. Validação e Testes de Regressão

Foi desenvolvida a suite de testes estruturais automatizados:
`test/sec05-firestore-rules-structure.test.mjs`

### Resultados Obtidos:
* **Testes de Regras Firestore (SEC-05):** 7/7 testes aprovados (100%).
* **Bateria Global de Testes:** **107/107 testes unitários e matemáticos aprovados** (sem qualquer falha).
* **Verificação Oxlint:** 0 erros.

---

## 4. Conclusão
A Tarefa 13 está concluída na branch `develop` (V-DEV). O cofre de dados da DATERRA Smart na nuvem está blindado contra acessos indevidos, elevação de privilégios e enumeração pública de agricultores.
