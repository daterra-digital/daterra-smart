# 📄 Tarefa T07: Desativação do Push Automático no GitHub Pages e Workflow de Rollback

> **Localização:** `docs/gestao/tarefas/T07-desativacao-push-pages.md`  
> **Identificador:** `T07` (Tarefa 7 do Plano de Versionamento / T03 DevOps)  
> **Estado:** `Concluída e Validada`  
> **Responsável:** Antigravity (DevOps e Arquitetura)  
> **Branch de Execução:** `develop` (V-DEV)

---

## 1. O Que Foi Realizado

1. **Eliminação do Disparo Automático em Push:**
   - No ficheiro `.github/workflows/deploy-pages.yml`, foi removido o gatilho:
     ```yaml
     # REMOVIDO:
     # on:
     #   push:
     #     branches: ['main']
     ```
   - O gatilho foi configurado estritamente para `workflow_dispatch`, exigindo três parâmetros obrigatórios:
     - `approved_commit`: SHA-40 ou Tag Git da versão homologada.
     - `confirm_token`: Confirmação textual exata (`APROVADO`).
     - `release_version`: Identificador semântico da versão (ex.: `v1.0.1-pages`).

2. **Criação do Workflow Dedicado de Rollback:**
   - Criado o ficheiro `.github/workflows/rollback-github-pages.yml` com gatilho `workflow_dispatch`, permitindo restaurar uma tag anterior (ex.: `v1.0.0-pages`) com o token `REVERTER` e motivo auditável, gerando `rollback-manifest.json`.

3. **Higienização de Segredos do Workflow:**
   - Removidas variáveis obsoletas de Supabase (`VITE_SUPABASE_*`).
   - Mapeadas variáveis oficiais do Firebase (`VITE_FIREBASE_*`), Cloudflare Turnstile (`VITE_TURNSTILE_SITE_KEY`), Google Analytics e Agromonitoring.

---

## 2. Justificação Técnica e de Segurança

- **Prevenção de Publicações Acidentais:** Anteriormente, qualquer `git push` para a branch `main` disparava a compilação e deploy imediatos no GitHub Pages, contornando a validação humana.
- **Rastreabilidade e Idempotência:** A publicação passa a exigir o hash ou tag exata aprovada, gerando um manifesto formal (`release-manifest.json`) embutido no pacote `dist/`.
- **Garantia de Recuperação (Rollback):** Cumpre a política de manter reversão em 1 clique sem tocar na infraestrutura do cPanel.

---

## 3. O Que Ficou Preservado

- A branch `main` e a tag `v1.0.0-pages` permanecem 100% blindadas e inalteradas no commit `eb54766`.
- As 11 ferramentas canónicas e todo o código em `src/` mantêm-se 100% intocados.
- O workflow de produção para o cPanel (`.github/workflows/deploy-cpanel.yml`) permanece intocado.

---

## 4. Conclusão

A infraestrutura de CI/CD está agora estritamente protegida na branch `develop`. A próxima tarefa de segurança é a **Tarefa 8 (SEC-01 Frontend): Supressão da leitura do tier simulado em produção (`src/context/SubscriptionContext.tsx`)**.
