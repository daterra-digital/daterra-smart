# 📋 Dossier da Tarefa 14: Transição para Release Candidate (V-RC 1.0.1-rc1) e Modo de Avaliação

**Data:** 2026-11-08  
**Ambiente:** V-RC (Release Candidate)  
**Versão:** `1.0.1-rc1`  
**Tag Git:** `v1.0.1-rc1`  
**Porto Local de Avaliação:** `http://localhost:5175` (`npm run dev:rc`)  
**Conformidade:** Rigor de Versionamento Semântico, Isolamento de Pré-Visualização e Proteção da V-PAGES  

---

## 1. Contexto e Objetivos

Com todas as 6 correções de segurança (SEC-01 a SEC-06) concluídas, testadas e auditadas na branch `develop` (V-DEV), avançou-se para a fase formal de **Release Candidate (V-RC)**.

O objetivo da Tarefa 14 é preparar a aplicação para que a equipa e o utilizador possam avaliar tudo o que é novo num ambiente isolado, com total clareza visual e garantia matemática de que:
1. Existe um endereço local próprio para testes da versão candidata: `localhost:5175`.
2. Existem etiquetas visuais de distinção:
   - 🏷️ **`PAGES`**: Sinaliza as 11 ferramentas canónicas originais e homologadas já em produção no GitHub Pages.
   - 🏷️ **`RC`**: Sinaliza qualquer nova ferramenta ou tela com alterações nesta versão candidata.
3. **Supressão Automática e Garantida:** O motor de avaliação (`rcEvaluationMode.ts`) desativa instantaneamente as etiquetas quando deteta domínios públicos (`github.io` ou `daterra.com.pt`), garantindo que a versão final no GitHub Pages e no cPanel permanece 100% limpa e profissional.

---

## 2. Elementos Técnicos Implementados

### A. Módulo Centralizador de Avaliação de RC ([`src/utils/rcEvaluationMode.ts`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/src/utils/rcEvaluationMode.ts))
- **`CURRENT_RC_VERSION = '1.0.1-rc1'`**: Versão candidata unificada.
- **`CANONICAL_PAGES_TOOL_IDS`**: Lista restrita das 11 ferramentas homologadas no Pages:
  1. `calibracao-pulverizador`
  2. `ajuste-dose-eppo`
  3. `area-parede-foliar-lwa`
  4. `volume-copa-trv`
  5. `mistura-calda-dose`
  6. `mistura-calda-concentracao`
  7. `ordem-mistura`
  8. `pre-inspecao`
  9. `consulta-ph`
  10. `velocidade-trabalho`
  11. `debito-total`
- **`isRcEvaluationMode()`**: Ativo se estiver a correr no porto 5175, modo rc ou localhost com versão RC. Falso de imediato se o hostname for `*.github.io` ou `*.daterra.com.pt`.
- **`getToolReleaseBadge(toolId)`**: Devolve `'PAGES'` para as ferramentas canónicas originais e `'RC'` para novidades.

### B. Interface Visual ([`src/components/tools/ToolCard.tsx`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/src/components/tools/ToolCard.tsx) e [`src/views/ToolsView.tsx`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/src/views/ToolsView.tsx))
- Faixa superior informativa no catálogo de ferramentas quando executado em modo RC (`localhost:5175`).
- Etiquetas de alto contraste no cabeçalho de cada cartão:
  - `PAGES` (verde floresta `#114037` com rebordo suave)
  - `RC` (azul cobalto `#1d4ed8` com fundo `#eff6ff`)

### C. Script Dedicado no [`package.json`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/package.json)
- `"dev:rc": "vite --port 5175 --mode rc"`
- `"version": "1.0.1-rc1"`

### D. Alinhamento de Metadados e Idiomas
- [`docs/gestao/VERSION.md`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/docs/gestao/VERSION.md): Atualizado para `1.0.1-rc1`.
- [`src/views/HelpView.tsx`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/src/views/HelpView.tsx): Atualizado para `v1.0.1-rc1`.
- [`src/i18n/locales/pt-PT.json`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/src/i18n/locales/pt-PT.json) e [`src/i18n/locales/pt.json`](file:///c:/Users/pedro/OneDrive/Documentos/Projetos-Code/daterra-smart-app/src/i18n/locales/pt.json): Atualizado `appVersion` para `1.0.1-rc1`.

---

## 3. Relatório de Prontidão (Release Readiness)

| Componente / Verificação | Estado | Detalhe |
| :--- | :---: | :--- |
| **Integridade de Tipos (TypeScript)** | ✅ Aprovado | `tsc -b` executado com 0 erros. |
| **Empacotamento de Produção (Vite / Rollup)** | ✅ Aprovado | Bundle de produção gerado com sucesso em `dist/`. |
| **Service Worker & Manifest PWA** | ✅ Aprovado | Gerados 31 ficheiros em precache com Workbox ativo. |
| **Oxlint (Qualidade de Código)** | ✅ Aprovado | 0 erros em 516 ficheiros. |
| **Bateria de Testes de Segurança (SEC-01 a SEC-06)** | ✅ Aprovado | 44/44 testes aprovados. |
| **Bateria de Testes do Modo RC** | ✅ Aprovado | 4/4 testes aprovados (`test/rc-evaluation-mode.test.mjs`). |
| **Bateria de Testes Matemáticos e Agronómicos EPPO** | ✅ Aprovado | 12 suites aprovadas (100% de conformidade com DGAV/EPPO). |
| **Total de Testes Automatizados Validados** | ✅ **111 / 111** | Zero falhas, zero regressões. |
| **Blindagem das 11 Ferramentas Canónicas** | ✅ Intactas | Todas operacionais e protegidas. |
| **Supressão Automática em Produção** | ✅ Garantida | Teste automatizado valida supressão em `github.io`. |

---

## 4. Conclusão
A aplicação encontra-se pronta e etiquetada na versão `1.0.1-rc1`. Foi criada a tag Git correspondente `v1.0.1-rc1` na branch `develop`. A aplicação está pronta para o passo seguinte: publicação e deploy controlado no GitHub Pages (V-PAGES — Tarefa 15).
