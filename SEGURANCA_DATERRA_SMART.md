# 🛡️ Sistema de Segurança — DATERRA Smart

Documento de referência técnica e operacional da arquitetura de segurança, privacidade e conformidade da PWA SaaS agrícola DATERRA Smart.

---

## 📌 Registo de Tarefas e Hardening

### TAREFA 1 — CSP Segura e Alinhada na Fase 0 (`index.html`)

- **Estado:** ✅ **Implementado e Validado (Fase 0)**
- **Prioridade:** Crítica
- **Correção Aplicada em `index.html`:**
  - `img-src`: Removido wildcard `https:`, restringindo a `'self' data: blob: https://lh3.googleusercontent.com https://server.arcgisonline.com` (avatar Google e tiles ArcGIS).
  - `connect-src`: Mantidos `https://geoapi.pt` e `https://geocoding-api.open-meteo.com` (confirmados em `geoApiService.ts` e `test/geoapi-service.test.mjs`); removida origem `https://api.brevo.com` do cliente; sem abertura preventiva de novos domínios.
  - `worker-src 'self'` e `form-action 'self'` adicionados e validados para Service Worker VitePWA (`sw.js`) e formulários SPA (`onSubmit`).
  - `public/.htaccess`: Mantém cabeçalhos HTTP de endurecimento cPanel (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `HSTS`) sem duplicar cabeçalho CSP.
- **Testes Validados:**
  - `test/sec04-csp-cache-invalidation.test.mjs`
  - `test/google-auth-guard.test.mjs`
  - `test/phase0-turnstile-validation.test.mjs`
- **Pendências Documentadas (Fase 0):**
  - **Newsletter BFF (Opção B):** Chamada órfã `syncNewsletterSubscription` desativada/removida; preferências guardadas em `users/{uid}` no Firestore; sincronização externa Brevo/BFF pendente.
  - **App Check:** `enforceAppCheck: false` mantido nas Cloud Functions até provisionamento e verificação completa em produção (`VITE_FIREBASE_APPCHECK_SITE_KEY`).
  - **Outbox & Sync (Opção B):** Background Sync API (`reg.sync.register`) removido; drenagem apenas com a aplicação aberta (`foreground-only`) e `centralgestOutboxDriver` sinalizado em modo simulado (`isSimulationMode: true`).
  - **TypeScript Estrito (Tarefa 0.10):** `"strict": true` permanece pendente de ativação em `tsconfig.app.json` (diagnóstico read-only inicial com 0 erros).

---

### TAREFA 2 — Fecho de Subcoleções e Eliminação de Regra Recursiva (SEC-AUD-02 / firestore.rules)

- **Estado:** ✅ **Implementado e Validado**
- **Prioridade:** Crítica
- **Problema Identificado:**
  1. A regra `match /{subcollection}/{docId=**}` dentro de `match /users/{userId}` em `firestore.rules` concedia permissões recursivas amplas (`allow read, write: if isOwner(userId);`) para quaisquer subcoleções arbitrárias sob o UID do utilizador.
  2. Como as regras do Firestore operam por união (OR lógica) e não por herança restritiva, nenhuma regra subsequente `allow read, write: if false;` conseguiria anular uma permissão já concedida por sobreposição de `match`.
  3. No frontend (`src/`), a aplicação não utiliza nem expõe subcoleções na nuvem (todos os dados operacionais residem no cliente em Dexie.js v10 / IndexedDB).
- **Risco:**
  - *Crítico:* Injeção arbitrária de subcoleções por clientes autenticados, consumo indevido de quota e bypass de validação de esquemas de dados.
- **Correção Implementada:**
  - Remoção integral do bloco recursivo `match /{subcollection}/{docId=**}` em `firestore.rules`.
  - O caminho `/users/{userId}` autoriza exclusivamente o documento de perfil raiz com validações estritas de schema (`isValidUserDoc`).
  - Todas as tentativas de leitura ou escrita em subcoleções de `users/{userId}` caem no Default Deny global (`match /{document=**} { allow read, write: if false; }`).
  - Mapeamento explícito da coleção interna de auditoria `_user_deletion_ops/{uid}` vedada ao cliente (`allow read, write: if false;`).
  - Imunidade comprovada contra o uso inválido de `request.resource.size` (propriedade do Cloud Storage Rules inexistente no Firestore Rules).
- **Ficheiros Alterados:**
  - `firestore.rules`
  - `test/sec05-firestore-rules-structure.test.mjs`
- **Resultado dos Testes:**
  - 11/11 testes aprovados em `test/sec05-firestore-rules-structure.test.mjs`.

---

### TAREFA 3 — Eliminação Transacional de Conta e Retoma com Checkpoints (SEC-AUD-03)

- **Estado:** ✅ **Implementado e Validado**
- **Prioridade:** Crítica
- **Correções Implementadas:**
  - **Purga Local Estritamente Condicional:** Em `src/features/settings/RgpdDeleteAccountButton.tsx`, a desinfeção local (`clearLocalSessionData({ purgeAll: true })`) e `logout()` só são executados se `response.data?.success === true`. Em caso de erro, timeout ou retoma agendada, os dados locais são preservados no dispositivo e o utilizador é devidamente informado.
  - **Validação Server-Side Robusta:** Em `functions/src/auth/accountDeletion.ts`, o backend valida estritamente `payload.confirmation === true` e `payload.confirmationText === 'ELIMINAR'`. A sessão do utilizador (`auth_time`) tem de ter menos de 300 segundos. O UID a eliminar é obtido exclusivamente de `request.auth.uid`. Tentativas com payload inválido são registadas em log (`RGPD_VALIDATION_FAILED`) sem dados sensíveis.
  - **Eliminação Recursiva em Profundidade com Checkpoints:**
    - A função `deleteSubcollectionsDeep()` percorre a árvore de subcoleções em profundidade (`DocumentReference.listCollections()`), eliminando documentos em lotes de 50.
    - Checkpoints são persistidos a cada lote concluído (`checkpoint: users/{userId}/...`), renovando o lock transacional atómico.
    - Post-deletion verification: confirma que `(await userDocRef.listCollections()).length === 0`, que o documento de utilizador e o documento Moodle foram efetivamente apagados antes de proceder à eliminação no Firebase Auth.
  - **Lock Transacional com Geração (`lockGeneration`):**
    - Em `functions/src/auth/accountDeletionLock.ts`, aquisição de lock via `db.runTransaction()`. O documento incrementa sequencialmente `lockGeneration`.
    - Renovação transacional de lease (`renewLock`) valida obrigatoriamente se `curr.lockGeneration === lockGen`. Se uma nova execução tiver assumido o lock por expiração, a execução anterior aborta imediatamente com erro fatal `LOCK_LOST`.
    - `LOCK_EXPIRATION_MS = 10 * 60 * 1000` (10 minutos), superior ao timeout efetivo de 300s da Cloud Function agendada (`maxInstances: 1`) e de 120s da Callable.
  - **Acessibilidade do Diálogo (`RgpdDeleteAccountDialog.tsx`):**
    - Implementado focus trap estrito com interceptação de `Tab` e `Shift+Tab`.
    - Foco inicial atribuído ao campo de confirmação e restauro de foco ao fechar (`previousFocusRef`).
    - Tecla `Escape` cancela e fecha o diálogo com `e.preventDefault()`, sem submeter.
    - Erros anunciados com `role="alert"` e `aria-live="assertive"`.
- **Ficheiros Alterados / Criados:**
  - `functions/src/auth/accountDeletionTypes.ts` (41 LOC)
  - `functions/src/auth/accountDeletionLock.ts` (95 LOC)
  - `functions/src/auth/accountDeletion.ts` (177 LOC)
  - `functions/src/index.ts` (149 LOC)
  - `src/features/settings/RgpdDeleteAccountDialog.tsx` (188 LOC)
  - `src/features/settings/RgpdDeleteAccountButton.tsx` (119 LOC)
  - `test/sec17-gdpr-privacy-cleanup.test.mjs` (145 LOC)
- **Resultado dos Testes:**
  - 12/12 testes aprovados em `test/sec17-gdpr-privacy-cleanup.test.mjs`.

---

### TAREFA 4 — Governação de Dados, Retenção & Limpeza de Rate Limits (SEC-AUD-06)

- **Estado:** ✅ **Implementado e Validado**
- **Prioridade:** Média / Governação de Dados
- **Correções Implementadas:**
  - **Mitigação de Hashes de Rate Limit (HMAC-SHA256):** Em `functions/src/auth/rateLimiter.ts`, a função de hash foi atualizada para utilizar HMAC-SHA256 com pepper de aplicação (`RATE_LIMIT_PEPPER`). HMAC-SHA256 com pepper pseudonimiza o identificador e reduz a possibilidade de correlação/reidentificação direta; não é uma garantia absoluta contra todas as formas de ataque.
  - **Isolamento e Agendamento da Limpeza:** Em `functions/src/index.ts`, Cloud Function agendada `scheduledAuthRateLimitCleanup` (`onSchedule`, a cada 30 min, timeout 120s, `maxInstances: 1`).
  - **Redução do Prazo para 2 Horas:** Retenção mínima reduzida para 2 horas (`AUTH_RATE_LIMIT_RETENTION_MS = 2 * 60 * 60 * 1000`), suficiente para a janela ativa de 15 minutos e para evitar acumulação ilimitada.

---

## ⚖️ Avaliação de Interesse Legítimo (LIA — Legitimate Interests Assessment) [Rascunho Técnico — Sujeito a Validação DPO/Jurídica]

> [!NOTE]
> Esta secção constitui um rascunho técnico de suporte à engenharia de software e arquitetura de dados, sujeito a parecer e validação formal por parte do Encarregado de Proteção de Dados (DPO) e assessoria jurídica competente, não constituindo parecer ou conclusão jurídica definitiva.

### Entidade em Avaliação: Registo de Auditoria de Eliminação (`_user_deletion_ops`)

#### 1. Teste de Finalidade (Purpose Test)
- **Qual é o objetivo do tratamento?**  
  Assegurar a orquestração atómica, resiliência e retoma de pedidos de apagamento (Direito ao Apagamento exercido pelo titular) em sistemas distribuídos (Firestore, Moodle, Firebase Auth), e manter registo probatório do cumprimento da solicitação para defesa perante eventuais diferendos, pedidos de indemnização ou averiguações da Comissão Nacional de Proteção de Dados (CNPD).
- **Existe base de interesse legítimo?**  
  Sim. O responsável pelo tratamento (DATERRA Smart) possui um interesse legítimo e juridicamente protegido em demonstrar a licitude da sua atuação técnica e prevenir fraudes ou duplicações concorrentes de pedidos de eliminação (Artigo 6.º(1)(f) do RGPD).

#### 2. Teste de Necessidade (Necessity Test)
- **O tratamento é necessário para atingir o objetivo?**  
  Sim. A orquestração da eliminação entre múltiplas etapas transacionais (subcoleções, documento de perfil, dados Moodle e conta Auth) exige a retenção transitória do estado da operação (`status`, `lockGeneration`, `checkpoint`). Após a conclusão, a prova de que determinado identificador foi processado e apagado dos sistemas principais requer o arquivamento técnico temporário do evento de conclusão.
- **Existe meio menos intrusivo?**  
  Não. O registo é estritamente minimizado: não armazena nomes, e-mails, moradas, telefones, NIFs ou dados agronómicos. O identificador armazenado é o UID gerado pelo sistema.

#### 3. Teste de Equilíbrio / Ponderação (Balancing Test)
- **Qual é a natureza dos dados tratados?**  
  Trata-se de dados pessoais pseudonimizados (UID alfanumérico, carimbos temporais, cursores de checkpoint). Não são tratados dados de categorias especiais (Art. 9.º).
- **Qual o impacto sobre o titular dos dados?**  
  Nulo a residual. Os dados não são utilizados para profiling, contacto, análise comportamental ou decisões automatizadas. A coleção `_user_deletion_ops` está blindada contra qualquer leitura ou escrita externa por clientes (`allow read, write: if false;` em `firestore.rules`).
- **Qual a expectativa razoável do titular?**  
  O titular que solicita a eliminação da sua conta tem a expectativa razoável de que a empresa consiga provar e garantir que a operação foi executada com segurança técnica sem corrupção de dados.
- **Quais as salvaguardas implementadas?**  
  1. *Pseudonimização:* Ausência de qualquer dado de contacto ou identificação civil direta.
  2. *Prazo Estritamente Minimizado:* Retenção fixada em **30 dias** (`AUDIT_RETENTION_DAYS = 30`), prazo mínimo necessário para conclusão de ciclos de suporte e conciliação técnica.
  3. *Mecanismo de Expiração:* Expiração TTL eventual, complementada por purga programada determinística em lote na rotina agendada (`processPendingAccountDeletions`) onde `status == 'completed' && expiresAt <= now`.

#### 4. Conclusão Provisória da LIA (Rascunho Técnico)
O teste de equilíbrio técnico preliminar sugere que os interesses legítimos da DATERRA Smart não colidem nem prevalecem desproporcionalmente sobre os direitos e liberdades do titular dos dados. A qualificação jurídica definitiva da licitude, fundamentada no **Artigo 6.º(1)(f) do RGPD**, salvaguardas e prazos de retenção carece de validação formal por parte do DPO e assessoria jurídica.

---

### Avaliação de Hashes em `_auth_rate_limits`
- **Classificação:** Hashes criptográficos de endereços IP e de e-mails, quando gerados por função de dispersão unidirecional estática (SHA-256) sem segredo, constituem **dados pessoais pseudonimizados** (jurisprudência Breyer do TJUE, Proc. C-582/14), uma vez que o espaço de endereços IPv4 ($2^{32}$) permite inversão por tabelas de arco-íris (rainbow tables).
- **Mitigação Implementada:** Adotado o algoritmo **HMAC-SHA256** com chave secreta de aplicação (`RATE_LIMIT_PEPPER`). HMAC-SHA256 com pepper pseudonimiza o identificador e reduz a possibilidade de correlação/reidentificação direta; não é uma garantia absoluta contra todas as formas de ataque, mantendo a determinação necessária ao bloqueio de ataques de força bruta dentro da janela de retenção de 2 horas.

---

## 📊 Matriz Oficial de Retenção de Dados e Base Legal

> [!IMPORTANT]
> **Distinção Operacional de Prazos e Mecanismos de Purga:**
> - **Retenção Mínima:** Período regulamentar/técnico obrigatório antes do qual os dados não devem ser expurgados (2 horas para rate limits; 30 dias para auditoria de eliminação).
> - **Expiração TTL Eventual do Firestore:** Mecanismo assíncrono gerido pela infraestrutura Google ativado via campo `expiresAt`. O TTL do Firestore não é instantâneo: os documentos expirados podem continuar acessíveis em consultas até serem efetivamente removidos. A documentação atual indica que a eliminação ocorre tipicamente dentro de 24 horas após a expiração. Não é um mecanismo imediato nem determinístico.
> - **Purga Programada Determinística:** Rotinas agendadas no Cloud Scheduler (`scheduledAuthRateLimitCleanup` e `processPendingAccountDeletions`) que realizam varrimentos periódicos e eliminam registos expirados em lotes delimitados (50 a 100 documentos) a cada 30 minutos.
> - **Retenção Efetiva:** A janela temporal real decorrida entre a geração do registo e a destruição física dos dados no armazenamento (Retenção Mínima somada ao intervalo de execução do agendamento ou ciclo de purga eventual do TTL, podendo ser superior ao prazo mínimo devido à natureza eventual do TTL).

| Coleção / Entidade | Tipo de Dado | Retenção Mínima | Mecanismo de Expiração e Purga | Finalidade Técnica / Negócio | Base Legal (RGPD) | Estado de Código / Operacional |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `_auth_rate_limits` | Técnico (HMAC-SHA256 com Pepper) | **2 Horas** | Campo `expiresAt: Timestamp`. Expiração TTL eventual (remoção típica em 24h após expiresAt), complementada por purga programada determinística (`scheduledAuthRateLimitCleanup`, a cada 30 min, máx. 100 docs/lote). | Mitigação de força bruta e DoS nos fluxos de autenticação | Art. 6.º(1)(f) RGPD (Interesse legítimo / Segurança da informação) | ✅ Implementado no backend com rotina agendada ativa.<br>`[TODO-OPS-01]` Ativação da flag `--enable-ttl` no Google Cloud pelo operador. |
| `_user_deletion_ops` | Pseudonimizado (UID, carimbos, etapas, checkpoints) | **30 Dias** | Campo `expiresAt: Timestamp`. Expiração TTL eventual, complementada por purga programada determinística em lote na rotina agendada (`processPendingAccountDeletions`). | Auditoria técnica do pedido de apagamento e retoma de etapas parciais | Art. 6.º(1)(f) RGPD (Interesse legítimo — Rascunho técnico LIA) | ✅ Implementado no backend com retoma e purga ativas.<br>`[TODO-OPS-01]` Ativação da flag `--enable-ttl` no Google Cloud pelo operador. |
| `academy_idempotency` | Técnico (Tokens de idempotência Moodle) | `[TODO]` A definir | Indefinido | Prevenção de duplicação de inscrições/pedidos | `[TODO]` Requer parecer formal | ⚠️ Registo sem política formal de expiração configurada.<br>`[TODO-DPO-02]` Validação DPO / Contabilidade sobre natureza fiscal vs transitória (prazo sugerido: 7 dias). |

---

## 🔄 Procedimento de Rollback Seguro Baseado no Commit SHA `8ac232c`

Ponto de restauração base antes do início das intervenções de segurança: commit SHA **`8ac232cc352ff7cf484e7ca378491ce10e098c36`** (`8ac232c`).

### 1. Regra de Verificação Prévia de Existência
Antes de executar qualquer comando de remoção (`rm`) ou restauração, deve ser executada a verificação estrita de existência do ficheiro no commit de referência:
```bash
git cat-file -e 8ac232c:<caminho_do_ficheiro>
```
- Se o comando terminar com código de saída `0` (verdadeiro), o ficheiro **existia** no commit `8ac232c` e **DEVE ser restaurado com `git restore`**.
- Se o comando terminar com código de saída `128` (falso), o ficheiro é novo e **PODE ser removido de forma controlada**.

### 2. Restauro de Ficheiros Existentes Modificados
Para reverter ficheiros que já existiam no commit `8ac232c`:
```bash
git restore --source=8ac232c -- firestore.rules
git restore --source=8ac232c -- functions/src/index.ts
git restore --source=8ac232c -- functions/src/auth/accountDeletion.ts
git restore --source=8ac232c -- functions/src/auth/rateLimiter.ts
git restore --source=8ac232c -- src/features/settings/RgpdDeleteAccountButton.tsx
git restore --source=8ac232c -- test/sec05-firestore-rules-structure.test.mjs
git restore --source=8ac232c -- test/sec17-gdpr-privacy-cleanup.test.mjs
```

### 3. Remoção Controlada de Ficheiros Novos
Ficheiros cuja ausência em `8ac232c` foi comprovada por `git cat-file -e`:
```bash
# Confirmação de não-existência em 8ac232c:
git cat-file -e 8ac232c:functions/src/auth/accountDeletionLock.ts   # exit 128 -> Novo
git cat-file -e 8ac232c:functions/src/auth/accountDeletionTypes.ts  # exit 128 -> Novo
git cat-file -e 8ac232c:src/features/settings/RgpdDeleteAccountDialog.tsx # exit 128 -> Novo
```

```bash
# Remoção manual controlada:
rm functions/src/auth/accountDeletionLock.ts
rm functions/src/auth/accountDeletionTypes.ts
rm src/features/settings/RgpdDeleteAccountDialog.tsx
```

> [!WARNING]
> O procedimento de rollback atua **estritamente na árvore de trabalho local** do Git (branch `develop`). Não reverte versões publicadas em ambientes remotos. Qualquer alteração em produção exige compilação controlada e deploy formal via pipeline CI/CD.
