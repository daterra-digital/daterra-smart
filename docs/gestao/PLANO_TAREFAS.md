# 📋 Plano Consolidado de Tarefas de Segurança — DATERRA Smart

> **Localização:** `docs/gestao/PLANO_TAREFAS.md`  
> **Revisão:** 1.0.0 (Novembro 2026)  
> **Estados Possíveis:** `Proposto` | `Autorizado` | `Em Implementação` | `Testado` | `Aceite` | `Publicado`

---

## 1. Tabela Mestra de Tarefas

| ID | Prioridade | Designação da Tarefa | Componente / Ficheiros Afetados | Dependências | Estado Atual |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T00** | P0 (Fundação) | Preparação, Inventário e Documentação de Versionamento | `docs/gestao/*` | Nenhuma | **Em Conclusão** |
| **T01** | P0 (Base) | Comprovação Criptográfica da Compilação de `eb54766` | Scripts de hash / `scratch/` | T00 | `Proposto` |
| **T02** | P0 (Base) | Montagem de Git Worktree Limpo e Isolado | `../daterra-smart-hotfix/` | T01 | `Proposto` |
| **T03** | P1 (DevOps) | Desativação do Push Automático no Workflow do GitHub Pages | `.github/workflows/deploy-pages.yml` | T02 | `Proposto` |
| **T04** | P1 (Backend) | Extração e Auditoria de Regras Ativas do Firestore | Regras remotas na consola Google | Nenhuma | `Proposto` |
| **T05** | P1 (Backend) | Verificação do Código Publicado de `sendCustomMagicLink` | Google Cloud Functions console | Nenhuma | `Proposto` |
| **T06** | P2 (Frontend)| Supressão da Leitura de Tier Simulado em Produção (SEC-01) | `src/context/SubscriptionContext.tsx` | T02, T04 | `Proposto` |
| **T07** | P2 (Frontend)| Minimização e Expiração Ativa de `daterra_pending_auth` (SEC-06) | `src/context/AuthContext.tsx` | T02 | `Proposto` |
| **T08** | P2 (Frontend)| Segregação de Dados Locais por Utilizador no IndexedDB (SEC-02) | `src/db/db.ts`, `AuthContext.tsx`, `outboxService.ts` | T02 | `Proposto` |
| **T09** | P3 (Backend) | Hardening de `sendCustomMagicLink` (Turnstile, Rate-Limit, Redirect) | `functions/src/index.ts` | T05 | `Proposto` |
| **T10** | P3 (Frontend)| Invalidação Controlada de Cache e Service Worker (SEC-SW) | `vite.config.ts`, `registerSW.js` | T06, T07, T08 | `Proposto` |
| **T11** | P4 (DevOps) | Auditoria de Segredos e Permissões OIDC no GitHub Actions | `.github/workflows/*` | T03 | `Proposto` |
| **T12** | P4 (Operação)| Plano de Revogação de Sessões e Resposta a Incidentes | `docs/gestao/` | T04, T05 | `Proposto` |

---

## 2. Detalhe e Justificação da Sequência de Execução

1. **Bloco de Fundação (T00 a T02):**
   - *Porquê primeiro:* É impossível garantir correções reproduzíveis e sem contaminação sem provar a base correspondente e isolar o ambiente local.
2. **Bloco de Controlo de Publicação e Inspeção Passiva (T03 a T05):**
   - *Porquê antes do código:* O gatilho de push para `main` continua ativo no GitHub. Se for feito push inadvertido, o Pages publica automaticamente. Desativar o gatilho garante que publicações futuras dependem de ação manual explícita. A inspeção do Firebase clarifica se o backend já bloqueia privilégios.
3. **Bloco de Correções no Cliente Web (T06 a T08):**
   - *Porquê isoladas entre si:* Cada alteração tem impacto em camadas distintas (UI paywall vs autenticação vs base de dados local). Devem ser implementadas, testadas e aceites sequencialmente.
4. **Bloco de Backend e Lançamento (T09 a T12):**
   - *Porquê no final:* O backend afeta diretamente a entrada de utilizadores em produção (e-mails via Brevo). Requer secrets da Cloudflare no Firebase e testes de regressão específicos antes do lançamento controlado via Service Worker.
