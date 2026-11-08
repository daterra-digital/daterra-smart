# 📜 Regras de Desenvolvimento, Governança e Processo — DATERRA Smart

> **Documento Permanente de Governança Técnica**  
> **Localização:** `docs/gestao/REGRAS_DESENVOLVIMENTO.md`  
> **Revisão Vigente:** v1.1.0 (Novembro 2026)  
> **Autoridade:** Antigravity & Engenharia DATERRA Smart

---

## 1. Princípios Gerais e Filosofia de Execução

1. **Ciclo de 3 Prompts por Tarefa:**
   - **Prompt 1 (Preparação e Proposta Concreta):** O agente consulta a documentação existente, delimita a tarefa, especifica ficheiros afetados, justificação técnica, testes de aceitação, riscos e procedimentos de recuperação.
   - **Prompt 2 (Implementação Autorizada):** Após aprovação explícita do utilizador, o agente executa estritamente o âmbito autorizado, realiza os testes e regista as evidências documentais.
   - **Prompt 3 (Correções Finais / Fecho):** Caso surjam divergências ou regressões, são resolvidas dentro do âmbito aprovado e é entregue o resultado final com os documentos atualizados.
   - *Regra Estrita:* Não reiniciar ciclos de planeamento genéricos nem pedir decisões já tomadas. Havendo impedimentos reais, identificar de forma cirúrgica a informação ou autorização em falta.

2. **Publicação Automatizada com Gate de Aprovação Ilustrado:**
   - As publicações para o GitHub Pages e cPanel podem ser disparadas de forma automatizada por pipelines CI/CD, mas exigem **obrigatoriamente um relatório prévio ilustrativo, simples e visual** apresentado ao utilizador.
   - O utilizador deve poder entender claramente o que está em causa (alterações, impacto visual e agronómico, testes validados).
   - Apenas com base na aprovação expressa desse relatório é que a publicação automatizada é iniciada.

3. **Preservação Absoluta do Histórico e Trabalho Existente:**
   - A versão atualmente em execução no GitHub Pages constitui a **base funcional de referência (V-PAGES-1.0.0)**.
   - É **terminantemente proibido** utilizar comandos destrutivos como `git reset --hard`, `git clean -fd`, eliminação de pastas ou descarte forçado de alterações.
   - Todo o trabalho local pré-existente (alterações comitadas e não comitadas, ficheiros não acompanhados em `deantigravity/`, `decodex/`, etc.) deve ser 100% preservado.

4. **Linguagem Técnica Rigorosa e Honesta:**
   - É expressamente proibido utilizar termos de marketing de segurança como "100% seguro", "risco zero" ou "zero regressões".
   - Limitações estruturais da arquitetura cliente (como a acessibilidade do JavaScript descarregado para o browser) devem ser declaradas com total clareza.

---

## 2. Estados de Versionamento e Ciclo de Publicação

A evolução da plataforma segue uma progressão linear rigorosa:

$$\text{V-DEV} \longrightarrow \text{V-RC} \longrightarrow \text{V-PAGES} \longrightarrow \text{V-PROD}$$

| Estado | Significado Técnico | Ambiente / Localização | Critérios de Transição |
| :--- | :--- | :--- | :--- |
| **V-DEV** | Versão de Desenvolvimento | Branch `develop` | Compilação com sucesso (`npm run build`), testes unitários e `npm run lint` aprovados sem erros. |
| **V-RC** | Release Candidate congelada | Tag `vX.Y.Z-rcN` | Verificação estática e funcional completa; congelamento de código. Nenhuma alteração permitida sem nova versão. |
| **V-PAGES** | Versão de Homologação | Tag `vX.Y.Z-pages` | Validação de V-RC $\rightarrow$ Relatório Ilustrativo Aprovado $\rightarrow$ Publicação automatizada no GitHub Pages. |
| **V-PROD** | Produção cPanel | Tag `vX.Y.Z-prod` | Validação em V-PAGES $\rightarrow$ Firebase de Produção $\rightarrow$ Relatório Ilustrativo Aprovado $\rightarrow$ Publicação no cPanel (`smart.daterra.com.pt`). |

---

## 3. Matriz Multidimensional de Reversão

Para evitar o erro de tratar reversões de forma simplista ou destrutiva, qualquer procedimento de recuperação deve atuar especificamente no eixo afetado:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   EIXOS INDEPENDENTES DE REVERSÃO                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CÓDIGO (Git):                                                       │
│    • Reverter commits cirurgicamente (git revert) ou repor branch.     │
│    • Nunca apagar branches de trabalho com desenvolvimentos locais.    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. PUBLICAÇÃO (GitHub Pages):                                          │
│    • Manter sempre registadas as últimas 3 versões publicáveis.        │
│    • Republicar artefacto da versão anterior estável via workflow.     │
├────────────────────────────────────────────────────────────────────────┤
│ 3. CONFIGURAÇÃO (Firebase / Workflows / Segredos):                     │
│    • Repor definições ou redeploy de Cloud Function anterior via CLI.  │
│    • Tratar segredos de forma desvinculada de código-fonte.            │
├────────────────────────────────────────────────────────────────────────┤
│ 4. DADOS LOCAIS (IndexedDB / Dexie.js):                                │
│    • NUNCA tentar baixar a versão do esquema Dexie (lança erro fatal). │
│    • Usar migrações progressivas compensatórias (forward-only).        │
│    • Exportar salvaguardas antes de qualquer mutação de esquema.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Política de Dados e Arquitetura First-Offline

1. **Preservação de Registos Locais:**
   - A DATERRA Smart opera sob o paradigma *Offline-First*. Mutações enfileiradas na `mutation_outbox` não podem ser descartadas nem apagadas em ações de logout.
   - Registos legados sem identificador de utilizador comprovado (`userId`) permanecem isolados na base local, não sendo automaticamente atribuídos nem sincronizados para terceiros.
2. **Ciclo de Vida de Dados de Sessão:**
   - O armazenamento de dados de autenticação pendente (`daterra_pending_auth`) deve observar o princípio da **minimização de dados** e possuir expiração física ativa por carimbo temporal (máximo 15 minutos), sem prejudicar a abertura do link de confirmação em abas distintas.

---

## 5. Níveis de Autorização de Operações

Cada ação técnica enquadra-se estritamente num de três níveis:

1. **Nível 1 — Inspeção Passiva:** Leitura de ficheiros locais, análise de git log, consulta de endpoints públicos e cálculo de hashes. Não altera estado. Autorizada por defeito no âmbito da tarefa ativa.
2. **Nível 2 — Alteração Local em Branch de Desenvolvimento (`develop`):** Edição de código, execução de testes e compilação na branch `develop`. Requer aprovação da proposta no Prompt 1.
3. **Nível 3 — Operação de Publicação / Produção:** Disparo de pipeline para GitHub Pages ou cPanel, alterações no Firebase de produção, ou criação de Releases remotas. **Exige obrigatoriamente a apresentação prévia do Relatório Ilustrativo de Prontidão e aprovação expressa do utilizador.**

---

## 6. Lista Oficial das 11 Ferramentas Canónicas Aprovadas (Blindadas)

Constitui regra de ouro permanente a **proibição de modificar código, fórmulas ou interfaces** das seguintes 11 ferramentas canónicas homologadas no GitHub Pages:

1. **Ajuste da Dose (Método EPPO)** (`/ferramentas/ajuste-dose-eppo`)
2. **Aplicação Manual** (`/ferramentas/aplicacao-manual`)
3. **Área de Parede Foliar (LWA)** (`/ferramentas/area-parede-foliar`)
4. **Consulta de pH** (`/ferramentas/consulta-ph`)
5. **Mistura de Calda (Concentração)** (`/ferramentas/concentracao-calda`)
6. **Mistura de Calda (Dose)** (`/ferramentas/dose`)
7. **Ordem de Mistura** (`/ferramentas/ordem-mistura`)
8. **Pré-Inspeção** (`/ferramentas/pre-inspecao`)
9. **Tabelas de Débito (Comparador)** (`/ferramentas/comparador-bicos`)
10. **Velocidade Real de Trabalho** (`/ferramentas/velocidade-real`)
11. **Volume de Copa (TRV)** (`/ferramentas/volume-copa`)

