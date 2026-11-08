# 📋 Dossier da Tarefa 11: Hardening de Segurança no Backend (Cloud Function `sendCustomMagicLink`)

**Data:** 2026-11-08  
**Ambiente:** V-DEV (`develop`)  
**Responsável Técnico:** Subagente de Segurança & Engenharia Backend Firebase  
**Conformidade:** Regras SEC-03, SEC-04, SEC-05, Limite < 200 LOC por módulo  

---

## 1. Contexto e Vulnerabilidades Mitigadas

A Cloud Function `sendCustomMagicLink` é responsável por emitir os links de acesso seguro (Magic Link) via Firebase Admin SDK e enviá-los por e-mail transacional através do provedor Brevo. No entanto, a auditoria de segurança identificou três riscos severos:

1. **SEC-03 (Ausência de Validação de Desafio Anti-Robô no Servidor):** Embora o frontend apresentasse o widget Cloudflare Turnstile, a Cloud Function não validava o token gerado, permitindo que scripts automatizados disparassem e-mails à vontade.
2. **SEC-04 (Ausência de Rate Limiting e Cooldown):** Qualquer atacante podia invocar a função repetidamente, esgotando o saldo de envio de e-mails da conta Brevo da DATERRA ou efetuando spam contra terceiros.
3. **SEC-05 (Risco de Open Redirect / Phishing):** A função aceitava qualquer parâmetro `redirectUrl` fornecido pelo cliente sem verificar se pertencia ao ecossistema legítimo da DATERRA Smart.

---

## 2. Ações Implementadas e Arquitetura Modular

Para respeitar escrupulosamente a regra de não exceder 200 linhas por ficheiro, a lógica de proteção foi decomposta em três módulos especializados em `functions/src/auth/`:

### A. Validador de Redirecionamento (`functions/src/auth/redirectUrlValidator.ts` — 44 LOC)
- Implementada lista de permissões estrita para domínios de retorno autorizados:
  - `https://smart.daterra.com.pt`
  - `https://daterra-digital.github.io/daterra-smart/`
  - `http://localhost:*` e `http://127.0.0.1:*` (para testes locais em desenvolvimento).
- Qualquer URL fora desta lista é sumariamente rejeitado com erro `invalid-argument`.

### B. Verificador Cloudflare Turnstile (`functions/src/auth/turnstileVerifier.ts` — 76 LOC)
- Comunica diretamente com a API oficial da Cloudflare (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).
- Valida o token recebido (`captchaToken`) juntamente com a chave secreta (`TURNSTILE_SECRET_KEY`) e o IP do cliente.
- Rejeita qualquer tentativa sem token válido com erro `permission-denied`.
- Em ambiente de testes automatizados ou emulador sem segredos configurados, opera em modo controlado permissivo sem falso-positivos.

### C. Rate Limiting e Cooldown Distribuído (`functions/src/auth/rateLimiter.ts` — 119 LOC)
- **Janela de Proteção:** 15 minutos (`RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000`).
- **Teto Máximo:** 5 pedidos por endereço de e-mail em cada janela.
- **Cooldown Mínimo:** 10 segundos entre pedidos sucessivos, prevenindo cliques duplos acidentais ou rajadas de tráfego.
- **Armazenamento:** Persiste os estados na coleção interna `_auth_rate_limits` do Firestore, dispondo de fallback seguro em memória para execuções e testes locais.
- Se o limite for excedido, devolve `resource-exhausted` indicando o tempo exato restante em minutos.

### D. Orquestrador na Cloud Function (`functions/src/index.ts` — 165 LOC)
- Orquestra as 4 etapas de validação em cascata antes de emitir o ActionCodeSettings e despachar o e-mail via Brevo.
- Mantém o ficheiro principal limpo e conciso (< 165 linhas).

---

## 3. Validação e Testes de Regressão

Foi desenvolvida a suite de testes unitários automatizados:
`test/sec03-sec05-cloud-function-auth.test.mjs`

### Resultados Obtidos:
- **Testes de Backend (SEC-03, SEC-04, SEC-05):** 14/14 testes aprovados (100%).
- **Bateria Global de Testes:** **96/96 testes unitários e matemáticos aprovados**.
- **Compilação do Backend (`npm --prefix functions run build`):** Código 0 (sem erros de TypeScript).
- **Compilação do Frontend (`npm run build`):** Código 0 (Vite / PWA gerado com sucesso).
- **Verificação de Estilo e Tipos (Oxlint):** 0 erros.

---

## 4. Conclusão
A Tarefa 11 está 100% concluída em `develop` (V-DEV). O serviço de login por e-mail da DATERRA Smart está agora totalmente blindado contra robôs, ataques de esgotamento de quota e riscos de redirecionamento fraudulento.
