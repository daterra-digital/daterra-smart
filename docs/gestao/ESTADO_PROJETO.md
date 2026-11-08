# 📊 Estado Atual do Projeto — DATERRA Smart

> **Localização:** `docs/gestao/ESTADO_PROJETO.md`  
> **Última Atualização:** 8 de Novembro de 2026 (Tarefas 2 e 3 Concluídas)  
> **Revisão:** 1.1.0

---

## 1. Versão Publicada no GitHub Pages (Referência Funcional)

| Parâmetro | Registo Confirmado | Grau de Certeza / Evidência Técnica |
| :--- | :--- | :--- |
| **URL Público** | `https://daterra-digital.github.io/daterra-smart/` | Confirmado (HTTP 200, Fastly/GitHub Pages CDN). |
| **Commit Base de Referência** | `eb54766b1fcc54b201ffd6b1a8c51610bd6f3825` | **Confirmado:** Correlacionado com carimbo HTTP `Last-Modified` e bundle de produção. |
| **Tag Git Associada** | `v1.0.0-pages` | **Criada localmente** com anotação oficial (`Versão de referência publicada no GitHub Pages`). |
| **Designação de Versão** | `V-PAGES-1.0.0` | Versão de referência protegida. |
| **Branch de Produção** | `main` | Intocada no commit `eb54766`. |
| **Branch de Desenvolvimento (V-DEV)** | `develop` | **Criada com sucesso** a partir de `v1.0.0-pages` (aponta para `eb54766`). |

---

## 2. Inventário de Tags e Histórico Git

| Tag Git | Commit Apontado | Data | Mensagem / Descrição |
| :--- | :--- | :--- | :--- |
| `v1.0.0-pages` | `eb54766b1fcc54b201ffd6b1a8c51610bd6f3825` | 08/11/2026 | `Versão de referência publicada no GitHub Pages` |
| `v1.2.0-bilingual` | `6da62c87e04e4afe96d3705dace5ad165c18f892` (aponta para `236ec23`) | 27/10/2026 | `Release v1.2.0-bilingual: Cobertura total pt-PT/en-GB` |
| `v1.0.0-fase1` | `cbbee56ff36bbd803a9e0137676f33b31d3e910f` | 25/10/2026 | `feat(core): conclusao do microlearning da pre-inspecao e fecho da Fase 1` |

---

## 3. Estado Atual dos Workflows de Publicação

1. **cPanel (`deploy-cpanel.yml`):**
   - **Gatilho:** Estritamente `workflow_dispatch` (acionamento manual com inputs).
   - **Estado:** 100% protegido contra deploys automáticos em push.
2. **GitHub Pages (`deploy-pages.yml`):**
   - **Gatilho Remoto em `origin/main`:** Dispara em `push: branches: ['main']` e `workflow_dispatch`.
   - **Plano de Ajuste:** Na branch `develop`, o gatilho `push` será eliminado, implementando a automação condicionada ao Relatório Ilustrativo de Prontidão.

---

## 4. Tarefas Concluídas e Próximos Passos

- [x] **Tarefa 1:** Análise inicial obrigatória e relatório do estado do repositório.
- [x] **Tarefa 2:** Criação da tag Git anotada `v1.0.0-pages` protegendo a V-PAGES atual.
- [x] **Tarefa 3:** Criação da branch de desenvolvimento `develop` (V-DEV) a partir de `v1.0.0-pages`.
- [x] **Tarefa 4:** Documentação de versionamento (`VERSION.md`, `CHANGELOG.md`, `GESTAO_VERSOES_DATERRA_SMART.md`).
- [x] **Tarefa 5:** Limpeza controlada e organização estrutural da V-DEV (`supabase/` removido, `resources/raw-data/`).
- [x] **Tarefa 6:** Validação obrigatória da V-DEV (10 verificações de conformidade aprovadas, 11 ferramentas canónicas blindadas).
- [x] **Tarefa 7:** Desativação do push automático no GitHub Pages e criação de workflow de rollback rápido.
- [x] **Tarefa 8:** Supressão da leitura de tier simulado em produção — SEC-01 (`src/context/SubscriptionContext.tsx`).
- [x] **Tarefa 9:** Minimização e expiração ativa de `daterra_pending_auth` — SEC-06 (`src/context/AuthContext.tsx`).
- [x] **Tarefa 10:** Segregação de dados locais por utilizador no IndexedDB — SEC-02 (`src/db/db.ts`).
- [x] **Tarefa 11:** Hardening de segurança na Cloud Function de Login / Magic Link — SEC-03, SEC-04, SEC-05 (`functions/`).
- [ ] **Tarefa 12 (Próximo Passo):** Invalidação controlada de cache e atualização transparente do Service Worker (PWA / Workbox) com Content Security Policy (`index.html`, `vite.config.ts`).
