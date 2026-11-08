# 📄 Tarefa T08: Supressão da Leitura de Tier Simulado em Produção (SEC-01)

> **Localização:** `docs/gestao/tarefas/T08-sec01-supressao-tier-simulado.md`  
> **Identificador:** `T08` (Tarefa 8 do Plano de Versionamento / SEC-01 Frontend)  
> **Estado:** `Concluída e Validada com Sucesso`  
> **Responsável:** Antigravity (Segurança e Arquitetura)  
> **Branch de Execução:** `develop` (V-DEV)

---

## 1. O Que Foi Realizado

1. **Remediação Cirúrgica em `src/context/SubscriptionContext.tsx`:**
   - Adicionada barreira estrita de ambiente através de `import.meta.env?.DEV`.
   - **Fora de desenvolvimento (`!isDevMode`):**
     - O estado inicial `simulatedTier` retorna incondicionalmente `null`.
     - É efetuada limpeza ativa no arranque de qualquer chave residual `daterra_simulated_tier` no `localStorage`.
     - A função `setSimulatedTier` ignora qualquer tentativa de mutação, impedindo injeção em runtime via consola.
     - `effectiveTier` ignora totalmente o `simulatedTier` e retorna estritamente o nível real derivado do perfil autenticado (`currentTier`).
     - A flag `isSimulating` é permanentemente forçada para `false`.
   - **Em ambiente de desenvolvimento (`isDevMode`):**
     - Mantém-se o atalho de alternância rápida de planos para testes locais de interface.

2. **Criação de Teste Automatizado de Regressão de Segurança:**
   - Criado [`test/sec01-subscription-tier-bypass.test.mjs`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/test/sec01-subscription-tier-bypass.test.mjs) com 5 asserções automatizadas que verificam a barreira de ambiente, a limpeza ativa de `localStorage`, a proteção do `effectiveTier` e o limite de 200 linhas (144 linhas no componente).

---

## 2. Justificação de Segurança (Vulnerabilidade SEC-01)

- **Vulnerabilidade Corrigida:** Na versão anterior, qualquer utilizador no plano gratuito podia aceder às ferramentas PRO executando `localStorage.setItem('daterra_simulated_tier', 'pro')` na consola do navegador e recarregando a página.
- **Defesa em Profundidade:** A remediação fecha o atalho no cliente web. A segurança estrutural de longo prazo é complementada pelas regras do Firestore que validam se os cálculos persistidos no backend pertencem a contas com o plano subscrito.

---

## 3. O Que Ficou Preservado

- A branch `main` e a tag `v1.0.0-pages` (versão pública do GitHub Pages) permanecem 100% blindadas e inalteradas no commit `eb54766`.
- O componente `TierRouteGuard.tsx` e o fluxo de autenticação `AuthContext.tsx` continuam intactos.
- As 11 ferramentas canónicas operam com exatamente os mesmos cálculos e interfaces.

---

## 4. Evidências de Teste e Validação

| Verificação | Comando | Resultado | Evidência Técnica |
| :--- | :--- | :--- | :--- |
| **Teste SEC-01** | `node test/sec01-subscription-tier-bypass.test.mjs` | **APROVADO** | 5 asserções de segurança com 100% de sucesso. |
| **Compilação** | `npm run build` | **APROVADO** | Saída código `0` em 1.78s (`dist/` gerado com sucesso). |
| **Linter** | `npm run lint` | **APROVADO** | Oxlint com 0 erros em 505 ficheiros. |
| **Matemática EPPO** | `node test/*.test.mjs` | **APROVADO** | 49 testes das calculadoras canónicas aprovados. |

---

## 5. Conclusão

A vulnerabilidade **SEC-01 está definitivamente eliminada na branch `develop` (V-DEV)**. O próximo passo do plano de segurança é a **Tarefa 9 (SEC-06 Frontend): Minimização e expiração ativa de `daterra_pending_auth` em `src/context/AuthContext.tsx`**.
