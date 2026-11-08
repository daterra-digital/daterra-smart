# 📄 Tarefa T05: Limpeza Controlada e Organização da V-DEV

> **Localização:** `docs/gestao/tarefas/T05-limpeza-v-dev.md`  
> **Identificador:** `T05` (Tarefa 5 do Plano de Versionamento)  
> **Estado:** `Concluída e Validada`  
> **Responsável:** Antigravity (Auditoria e Arquitetura)  
> **Branch de Execução:** `develop` (V-DEV)

---

## 1. O Que Foi Feito

1. **Lote 1 — Eliminação de Tecnologia Obsoleta:**
   - Remoção completa e controlada da pasta legada `supabase/` (`git rm -r supabase`), incluindo:
     - `supabase/functions/agri-chat/index.ts`
     - `supabase/functions/send-otp/index.ts` e `README.md`
     - `supabase/migrations/20260912_drone_compliance_postgis.sql`
     - `supabase/migrations/20260928_agri_chat_skills.sql`
   - Eliminação dos diretórios locais temporários de testes de compilação:
     - `dist-candidate/`, `dist-candidate-pub08/`, `dist-candidate-pub09/`, `dist-candidate-pub10/`, `dist-candidate-pub11/`.
   - **Commit efetuado na branch `develop`:** `1838baf` (*chore(develop): remocao da pasta obsoleta supabase*).

2. **Lote 2 — Organização Estrutural de Dados de Referência:**
   - Criação da diretoria canónica de ativos de referência: `resources/raw-data/`.
   - Reorganização via `git mv` de ficheiros soltos de dados brutos da raiz para o novo diretório:
     - `PreInspecaoFINAL.csv` $\rightarrow$ `resources/raw-data/PreInspecaoFINAL.csv`
     - `FlowRate_Nozzles.xlsx` $\rightarrow$ `resources/raw-data/FlowRate_Nozzles.xlsx`
     - `pH-SubstanciasAtivas.csv` $\rightarrow$ `resources/raw-data/pH-SubstanciasAtivas.csv`
   - **Commit efetuado na branch `develop`:** `ee6e778` (*chore(develop): organizacao de dados brutos de referencia em resources/raw-data*).

3. **Validação Rigorosa da Linha de Base:**
   - Execução de `npm run build`: Compilação de produção Vite/TypeScript completada com sucesso (código 0, PWA service worker gerado).
   - Execução de `npm run lint`: 0 erros encontrados pelo Oxlint (504 ficheiros analisados).
   - Execução de testes de unidade matemáticos: 49 testes aprovados com 100% de sucesso (43 de Calibração Pulverizador / LWA-V / TRV e 6 de Ajuste de Dose EPPO PP 1/239).

---

## 2. Justificação Técnica

- **Alinhamento Arquitetural:** A plataforma DATERRA Smart utiliza estritamente o ecossistema Firebase (`daterra-smart-4c0cf`) e Dexie.js First-Offline. Ficheiros residuais de Supabase eram passivo tecnológico obsoleto e causavam confusão técnica.
- **Rigor de Repositório:** A raiz do projeto deve manter-se despoluída de tabelas Excel ou CSV de trabalho, as quais devem residir numa diretoria canónica identificada (`resources/raw-data/`).

---

## 3. O Que Foi Preservado

- A branch `main` e a tag anotada `v1.0.0-pages` (que protegem a versão em produção no GitHub Pages) mantêm-se 100% blindadas e inalteradas.
- O código-fonte operacional em `src/`, a base local Dexie e a arquitetura First-Offline estão intactos.
- Os ficheiros locais não comitados e as pastas de documentação `docs/gestao/`, `deantigravity/` e `decodex/` permanecem intocados.

---

## 4. Evidências de Teste e Validação

| Verificação | Comando | Resultado | Evidência Técnica |
| :--- | :--- | :--- | :--- |
| **Commit Lote 1** | `git commit` | Sucesso | `1838baf` (5 ficheiros removidos, 773 linhas apagadas) |
| **Commit Lote 2** | `git commit` | Sucesso | `ee6e778` (3 ficheiros movidos com 100% de similaridade) |
| **Compilação** | `npm run build` | Sucesso (0) | `dist/` gerado em 1.71s, PWA precache com 31 entradas geradas |
| **Qualidade / Lint** | `npm run lint` | Sucesso (0) | 0 erros, 22 avisos tolerados em ficheiros auxiliares |
| **Matemática EPPO** | `node test/*.test.mjs` | Sucesso (0) | 49 testes com 100% de aprovação (0 falhas) |

---

## 5. Conclusão

A Tarefa 5 foi concluída com sucesso e rigor máximo na branch `develop` (V-DEV). O repositório está limpo, organizado e perfeitamente validado. A próxima etapa mandatória é a **Tarefa 6: Validação Obrigatória da V-DEV (10 verificações)**.
