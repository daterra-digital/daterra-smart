# 📄 Tarefa T09: Minimização e Expiração Ativa de Dados Temporários de Autenticação (SEC-06)

> **Localização:** `docs/gestao/tarefas/T09-sec06-expiracao-auth-pendente.md`  
> **Identificador:** `T09` (Tarefa 9 do Plano de Versionamento / SEC-06 Frontend)  
> **Estado:** `Concluída e Validada com Sucesso`  
> **Responsável:** Antigravity (Segurança e Arquitetura)  
> **Branch de Execução:** `develop` (V-DEV)

---

## 1. O Que Foi Realizado (Em Linguagem Simples e Técnica)

1. **Criação do Módulo Modular de Armazenamento Seguro:**
   - Criado [`src/services/auth/pendingAuthStorage.ts`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/src/services/auth/pendingAuthStorage.ts) (apenas 58 linhas, cumprindo o limite de 200 linhas).
   - Ao pedir entrada na aplicação por e-mail, é gravado um **carimbo temporal (`timestamp`)** juntamente com os dados essenciais (`email`, `firstName`, `lastName`, `companyName`).

2. **Janela de Validade Estrita de 15 Minutos:**
   - Foi fixado o tempo limite de 15 minutos (`PENDING_AUTH_MAX_AGE_MS = 15 * 60 * 1000`).
   - Se o utilizador demorar mais de 15 minutos a abrir o link do e-mail, os dados temporários são considerados expirados e são **fisicamente apagados da memória do telemóvel**.
   - Se o link for clicado noutra aba ou noutro navegador, o sistema solicita educadamente o e-mail para validar a sessão, sem erros nem quebra de fluxo.

3. **Purga Automática de Segurança no Arranque e no Logout:**
   - No arranque da aplicação (`useEffect` em `AuthContext.tsx`), o sistema verifica e apaga qualquer registo antigo esquecido.
   - Ao carregar no botão de **Sair (`logout`)**, qualquer dado temporário é imediatamente eliminado do navegador.

4. **Teste Automatizado de Segurança ([`test/sec06-pending-auth-expiration.test.mjs`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/test/sec06-pending-auth-expiration.test.mjs)):**
   - 7 asserções comprovando o limite de 15 minutos, minimização, purga no arranque, purga no logout e ciclo de vida.

---

## 2. Justificação de Segurança e Privacidade

- **Proteção em Telemóveis Partilhados:** Garante que o nome e e-mail de um agricultor não ficam gravados indefinidamente no navegador se o telemóvel for partilhado com familiares ou outros operadores de campo.
- **Conformidade RGPD:** Cumpre o princípio da minimização e limitação da conservação de dados pessoais temporários.

---

## 3. O Que Ficou Rigorosamente Preservado

- A branch `main` e a versão de produção no GitHub Pages (`v1.0.0-pages`) continuam 100% blindadas e inalteradas no commit `eb54766`.
- O login normal por Google e a confirmação rápida de link por e-mail funcionam com total comodidade.
- As 11 ferramentas canónicas e as suas fórmulas continuam 100% intactas.

---

## 4. Evidências de Validação

| Verificação | Comando | Resultado | Evidência Técnica |
| :--- | :--- | :--- | :--- |
| **Teste SEC-06** | `node test/sec06-pending-auth-expiration.test.mjs` | **APROVADO** | 7/7 asserções aprovadas com 100% de sucesso. |
| **Compilação** | `npm run build` | **APROVADO** | Saída código `0` em 1.77s (`dist/` gerado com sucesso). |
| **Linter** | `npm run lint` | **APROVADO** | Oxlint com 0 erros em 507 ficheiros. |
| **Matemática EPPO** | `node test/*.test.mjs` | **APROVADO** | 49 testes das calculadoras canónicas aprovados. |

---

## 5. Conclusão

A vulnerabilidade **SEC-06 está resolvida na branch `develop` (V-DEV)**. O próximo passo no plano de segurança é a **Tarefa 10: Segregação de Dados Locais por Utilizador no IndexedDB / Dexie.js (SEC-02)**.
