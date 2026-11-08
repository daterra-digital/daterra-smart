# 📝 Registo de Alterações (Changelog) — DATERRA Smart

> **Localização:** `docs/gestao/CHANGELOG.md`  
> **Formato:** Baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e SemVer.

---

## [1.0.0-pages] - 2026-11-05

- **Estado:** `V-PAGES` (Versão de referência publicada no GitHub Pages)
- **Tag:** `v1.0.0-pages` *(a ser formalmente anotada)*
- **Commit:** `eb54766b1fcc54b201ffd6b1a8c51610bd6f3825`
- **Ambiente:** GitHub Pages (`https://daterra-digital.github.io/daterra-smart/`)

### Adicionado
- Calculadora canónica de Aplicação Manual (v2.0 PWA SaaS) integrada na suite de pulverização (`src/features/aplicacao-manual/`).
- Rotas dedicadas `/ferramentas/aplicacao-manual`, `/tools/aplicacao-manual` e `/tools/calc_aplicacao_manual`.

### Corrigido
- Harmonização de tipos e ativação da ferramenta de aplicação manual no build de produção.
- Atualização dos contactos de suporte no rodapé e centro de ajuda (`smart@daterra.com.pt`, contacto telefónico).

---

## [1.2.0-bilingual] - 2026-10-27

- **Estado:** Arquivado
- **Tag:** `v1.2.0-bilingual`
- **Commit:** `236ec2304910cf3545dfa82c44400cf9d7507b9a`

### Adicionado
- Cobertura completa de internacionalização pt-PT e en-GB com dropdown ergonómico.
- Dicionários completos em `src/i18n/locales/`.

### Corrigido
- Auditoria visual E2E com eliminação de literais órfãos.

---

## [1.0.0-fase1] - 2026-10-25

- **Estado:** Arquivado
- **Tag:** `v1.0.0-fase1`
- **Commit:** `cbbee56ff36bbd803a9e0137676f33b31d3e910f`

### Adicionado
- Conclusão do microlearning da pré-inspeção oficial de pulverizadores e fecho formal da Fase 1.

---

## [1.0.1-dev] - 2026-11-08

- **Estado:** `V-DEV` (Em preparação na branch `develop`)
- **Origem:** Baseado no commit `eb54766b1fcc54b201ffd6b1a8c51610bd6f3825`

### Limpeza e Reestruturação (Tarefa 5)
- Removida pasta obsoleta `supabase/` (commit `1838baf`), eliminando resíduos de tecnologias descontinuadas e mantendo foco estrito no Firebase.
- Criada pasta canónica `resources/raw-data/` e reorganizados os ficheiros de dados brutos (`PreInspecaoFINAL.csv`, `FlowRate_Nozzles.xlsx`, `pH-SubstanciasAtivas.csv`) da raiz (commit `ee6e778`).
- Eliminadas pastas temporárias de compilação de testes (`dist-candidate*`).
- Validação técnica: Compilação de produção (código 0), Oxlint (0 erros) e testes EPPO (49/49 aprovados).
