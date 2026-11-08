# 📄 Tarefa T00: Preparação, Inventário e Documentação de Versionamento

> **Localização:** `docs/gestao/tarefas/T00-inventario-preservacao.md`  
> **Identificador:** `T00`  
> **Estado:** `Em Conclusão de Preparação`  
> **Responsável:** Antigravity (Auditoria e Arquitetura)

---

## 1. O Que Fazer
1. Realizar o inventário exaustivo do repositório:
   - Identificar a versão publicada e extrair evidências da linha de base funcional.
   - Listar todas as alterações locais não comitadas (12 ficheiros modificados, 13 ficheiros novos).
   - Registar as pastas não acompanhadas (`deantigravity/`, `decodex/`, `dist-candidate-*`).
2. Criar a estrutura permanente de governança e rastreabilidade em `docs/gestao/`:
   - `REGRAS_DESENVOLVIMENTO.md`: Regras permanentes, processo de 3 prompts e matriz de reversão.
   - `ESTADO_PROJETO.md`: Radiografia das versões publicadas e locais.
   - `PLANO_TAREFAS.md`: Lista consolidada de tarefas de segurança com estados formais.
   - `VERSION.md` & `CHANGELOG.md`: Histórico de versões e registo de alterações reais.
   - `tarefas/T00-inventario-preservacao.md`: Este dossiê técnico.
3. Especificar o procedimento concreto de salvaguarda física (Git Worktree em diretório separado) e a alteração concreta necessária para desativar o gatilho de publicação automática no workflow GitHub Actions.

---

## 2. Justificação
- **Problema que resolve:** Riscos de contaminação da versão estável publicada, regressões por sobreposição de trabalho local anterior e ciclos desordenados de planeamento repetido.
- **Evidência e Grau de Confirmação:** Confirmado documentalmente. A versão pública está ancorada no commit `eb54766`, enquanto a árvore local possui 25 itens com alterações de ensaios anteriores (`PUB-08` a `PUB-11`) que não podem ser perdidos nem enviados acidentalmente para produção.

---

## 3. Prioridade e Dependências
- **Prioridade:** Prioridade 0 (Fundação).
- **Dependências:** Nenhuma. É o pré-requisito obrigatório para qualquer intervenção em código.

---

## 4. Comportamento a Preservar
- A aplicação publicada em `https://daterra-digital.github.io/daterra-smart/` permanece 100% inalterada.
- Todos os 23 ficheiros modificados/novos locais no workspace atual permanecem rigorosamente intocados.
- As pastas `deantigravity/`, `decodex/` e `dist-candidate-*` são integralmente preservadas.
- Nenhuma base de dados, credencial Firebase ou configuração de infraestrutura é modificada.

---

## 5. Critérios de Aceitação
- [x] **Inventário Completo:** Documentação precisa de todos os ficheiros modificados e pastas locais registada em `ESTADO_PROJETO.md`.
- [x] **Governança Estabelecida:** Regras de 3 prompts, SemVer (`V-DEV → V-RC → V-PAGES`) e matriz de reversão multidimensional consolidadas em `REGRAS_DESENVOLVIMENTO.md`.
- [x] **Isolamento Definido:** Procedimento de salvaguarda via `git worktree` especificado passo a passo, sem tocar na pasta existente.
- [x] **Workflows Auditados:** Identificação precisa do gatilho `on: push: branches: ['main']` no workflow remoto e especificação da alteração exata para desativação.

---

## 6. Riscos e Procedimento de Recuperação
- **Riscos Identificados:** Erro de escrita em caminhos locais ou bloqueio de ficheiros pelo sistema operativo.
- **Reversão de Código:** Se os ficheiros em `docs/gestao/` precisarem de ser removidos, basta eliminar a pasta `docs/gestao/`. Nenhum ficheiro de código da aplicação (`src/`) foi tocado.
- **Reversão de Publicação:** Não aplicável (zero deploys realizados).
- **Reversão de Configuração:** Não aplicável (nenhum secret ou serviço externo foi alterado).
- **Reversão de Dados:** Não aplicável (nenhuma base de dados ou localStorage foi manipulada).

---

## 7. Limitações
- Esta tarefa não elimina as vulnerabilidades de segurança auditadas (SEC-01, SEC-02, SEC-03); apenas estabelece a infraestrutura documental e de processo para que as correções sejam executadas com garantia de não contaminação.
- A proteção contra deploys automáticos no GitHub Actions só estará efetivamente ativa após a alteração correspondente no ficheiro de workflow ser comitada e enviada para o repositório remoto na Tarefa T03.

---

## 8. Nível de Autorização
- **Nível 1 (Inspeção Passiva e Documentação Técnica Local):** Concluído no âmbito da primeira tarefa autorizada. Não foram efetuadas operações em produção nem alterações de código de aplicação.
