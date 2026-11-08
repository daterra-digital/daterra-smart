# 📋 Dossier da Tarefa 10: Segregação de Dados Locais por Utilizador no IndexedDB (SEC-02)

**Data:** 2026-11-08  
**Ambiente:** V-DEV (`develop`)  
**Responsável Técnico:** Subagente de Segurança & Engenharia Dexie.js  
**Conformidade:** Regra SEC-02, Arquitetura First-Offline, Master Blueprint DATERRA Smart  

---

## 1. Contexto e Vulnerabilidade Identificada (SEC-02)

No levantamento de segurança prévio, identificou-se que múltiplas calculadoras canónicas gravavam dados na base de dados do navegador (IndexedDB via Dexie.js) e na fila de sincronização (`mutation_outbox`) associando um identificador genérico e fixo: `'local-user'`.

### Riscos Corrigidos:
1. **Fuga de Dados em Dispositivos Partilhados:** Se dois utilizadores partilhassem o mesmo telemóvel ou tablet na exploração agrícola, os cálculos efetuados por um utilizador continuavam visíveis para o seguinte no histórico local.
2. **Poluição / Desvio de Sincronização:** Cálculos criados antes de autenticação corriam o risco de serem enviados inadvertidamente para a conta de outro utilizador após login, ou provocarem conflitos de sincronização no backend Firebase.

---

## 2. Ações Implementadas

### A. Versão 10 do Esquema Dexie e Migração Segura (`src/db/db.ts` & `src/db/types.ts`)
- Adicionada a versão 10 no Dexie DB com índice `userId` na tabela `mutation_outbox`.
- Implementada rotina não-destrutiva `.upgrade()`: registos legados contendo `'local-user'` ou campos vazios são preservados na base local, sendo etiquetados com a sentinela arquitetural `LEGACY_UNASSIGNED_MARKER` (`'legacy_local_unassigned'`).

### B. Proteção da Outbox Offline (`src/services/outbox/outboxService.ts`)
- A função de despacho (`drainOutbox`) passou a filtrar ativamente mutações sem `userId` ou identificadas com `LEGACY_UNASSIGNED_MARKER`. Desta forma, cálculos pré-login permanecem seguros na memória local do agricultor, sem nunca poluírem a nuvem ou a conta de outrem.

### C. Escopo de Utilizador em Todas as Calculadoras Canónicas
Todas as calculadoras canónicas foram atualizadas cirurgicamente para:
1. Obter o identificador real autenticado (`user?.id`) através de `useAuth()`.
2. Restringir a consulta do histórico local (`calculation_history_v2`) exclusivamente a `r.userId === effectiveUserId`.
3. Persistir novos cálculos e mutações da outbox com `userId: effectiveUserId || LEGACY_UNASSIGNED_MARKER`.
4. Limpar o histórico respeitando o `effectiveUserId`.

Ficheiros ajustados:
- `src/features/ajuste-dose-eppo/eppoDoseStorage.ts` & `EppoDoseCalculator.tsx`
- `src/features/area-parede-foliar/useLwaSaveHistory.ts` & `AreaParedeFoliarCalculator.tsx`
- `src/features/consulta-ph/phStorage.ts` & `ConsultaPhCalculator.tsx`
- `src/features/volume-copa/useTrvSaveHistory.ts` & `VolumeCopaCalculator.tsx`
- `src/features/pre-inspecao/inspecaoStorage.ts` & `PreInspecaoCalculator.tsx`
- `src/features/mistura-concentracao/concentracaoStorage.ts` & `ConcentracaoCaldaCalculator.tsx`
- `src/features/mistura-dose/doseStorage.ts` & `DoseCaldaCalculator.tsx`
- `src/features/calculators/tabelas-debito/services/debitoHistoryService.ts`, `useDebitoSaveHistory.ts`, `DebitoTrabalhoView.tsx`, `TabelasDebitoHubView.tsx`, `DebitoModalsContainer.tsx`
- `src/features/calculators/velocidade-trabalho/VelocidadeTrabalhoView.tsx`

---

## 3. Validação e Testes de Regressão

Foi criado o ficheiro de teste unitário automatizado:
`test/sec02-indexeddb-user-scoping.test.mjs`

### Resultados dos Testes:
- **Testes SEC-02:** 6/6 passaram (100%).
- **Bateria Global de Testes:** 82/82 passaram com sucesso (sem regressões matemáticas ou agronómicas).
- **Verificação Oxlint:** 0 erros encontrados.
- **Compilação de Produção (`npm run build`):** Sucesso absoluto (código 0).

---

## 4. Conclusão
A Tarefa 10 está plenamente concluída em ambiente `develop` (V-DEV). O isolamento de dados do agricultor na memória local está 100% garantido e blindado contra fugas entre contas.
