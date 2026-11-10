# Decisões Arquiteturais — Índice de Risco de Deriva (IRD) — Fase 1

**Estado:** Fundação aprovada (Tarefa 6 de 12) · **Branch de referência:** `develop` (`7594248`)  
**Versões iniciais:** Fórmula `1.0.0` · Ruleset `heuristic-v1` · Catálogo `2026-09-02`

---

## 1. Enquadramento Legal e Normativo (Declaração Obrigatória)

* **Não certificação:** O Índice de Risco de Deriva (IRD) da DATERRA Smart é uma ferramenta heurística de apoio técnico à decisão operacional e **não é uma certificação legal nem substitui ensaios de campo segundo a norma ISO 22866** nem homologações oficiais de redução de deriva (ex.: JKI/DRT).
* **Supremacia do rótulo DGAV / SIFITO:** Em qualquer circunstância, **prevalece integralmente o rótulo oficial do produto fitofarmacêutico autorizado pela DGAV (portal SIFITO)**, nos termos da **Lei n.º 26/2013** (Uso Sustentável de Produtos Fitofarmacêuticos) e do **Decreto-Lei n.º 86/2010**, bem como do **Decreto-Lei n.º 91/2016** quando aplicável a operações aéreas.
* **Verificação presencial obrigatória:** As condições atmosféricas estimadas a partir de modelos em grelha ou registos em cache não dispensam a medição presencial de vento, temperatura e humidade no local de tratamento antes da pulverização.

---

## 2. Decisões Arquiteturais Aprovadas (Opção A)

| Decisão | Definição Fase 1 | Evidência de Origem no Repositório |
| :--- | :--- | :--- |
| **Arquitetura escolhida** | **Opção A:** motor puro desacoplado em `src/features/ird/` (módulos `<= 200` linhas) | `AGENTS.md` (Regra 3 — modularidade cirúrgica `<= 200` LOC) |
| **Persistência local** | Reutilização da tabela Dexie existente `calculation_history_v2` com `calculatorId: 'calc_ird'` | [`src/db/db.ts`](../../src/db/db.ts), [`src/features/calculators/core/historyService.ts`](../../src/features/calculators/core/historyService.ts) |
| **Versão do schema Dexie** | Mantida em **Dexie `v10`** (sem migração na Fase 1) | [`test/saas-gating-perfis.test.mjs`](../../test/saas-gating-perfis.test.mjs) (`db.verno === 10`), [`test/sec02-indexeddb-user-scoping.test.mjs`](../../test/sec02-indexeddb-user-scoping.test.mjs), [`test/sec16-session-cleanup-shared-devices.test.mjs`](../../test/sec16-session-cleanup-shared-devices.test.mjs) |
| **Modelo de utilizador** | **Single-user por `uid`** (Firebase Auth UID), sem multi-tenancy | [`firestore.rules`](../../firestore.rules) (apenas `users/{userId}`), sem `organizations`/`tenants` nem custom claims |
| **Cloud Firestore & Sync** | Sem novas coleções, sem regras, sem índices e sem sincronização remota na Fase 1 (`syncStatus: 'local_only'`) | [`firestore.rules`](../../firestore.rules) (Default Deny), [`firestore.indexes.json`](../../firestore.indexes.json) (`indexes: []`), [`src/services/outbox/outboxService.ts`](../../src/services/outbox/outboxService.ts) (`foreground-only`) |
| **Catálogo de bicos** | Catálogo local estático `NOZZLES_DATABASE` (`1.666` variantes) | [`src/features/nozzle-comparison/nozzleComparison.data.ts`](../../src/features/nozzle-comparison/nozzleComparison.data.ts) |
| **Meteorologia** | Open-Meteo client-side com cache `localStorage` + introdução manual offline em campo | [`src/features/weather/weatherService.ts`](../../src/features/weather/weatherService.ts), [`src/features/weather/services/weatherCacheService.ts`](../../src/features/weather/services/weatherCacheService.ts) |

### Justificação da Opção A e Dexie `v10` (`calculation_history_v2`)
* [`src/db/db.ts`](../../src/db/db.ts) encontra-se em `190` linhas e a suíte de testes bloqueia alterações diretas ao schema (`db.verno === 10`, contagem exata de 10 tabelas purgadas em [`sessionCleanupService.ts`](../../src/services/auth/sessionCleanupService.ts) e teto estrito de `<= 200` linhas).
* A tabela `calculation_history_v2` já fornece índice composto `[calculatorId+userId+isDeleted]`, geração de UUID v4, validação que rejeita `userId` vazio e `LEGACY_UNASSIGNED_MARKER`, quota controlada (`MAX_ACTIVE_CALCULATIONS_PER_TOOL = 20`) e purga automática no logout em dispositivos partilhados (`SEC-16`).
* Caso a Fase 2 exija histórico ilimitado acima de 20 registos, presets personalizados ou envio por Outbox/Firestore, o adaptador de histórico poderá migrar para uma tabela dedicada (`ird_assessments` em Dexie `v11`) sem alterar o motor matemático nem os contratos base.

---

## 3. Modelo de Ponderação, Classes e Política Anti-Risco-Zero

### 3.1 Pesos dos Subíndices (`IRD_SUBINDEX_WEIGHTS`)
* **Meteorologia (`meteo`): `0,35`** — velocidade média e rajadas de vento + taxa de evaporação psicrométrica ($\Delta T$).
* **Espectro e Hidráulica do Bico (`espectro`): `0,30`** — fração fina ($D_{v10}$ quando medida), classe de gotas BCPC/ISO 25358 ou sensibilidade do catálogo + desvio de pressão.
* **Operação e Máquina (`operacao`): `0,20`** — velocidade de avanço, altura de barra/libertação e assistência de ar (restrita a barra horizontal aplicável).
* **Exposição e Zonas Tampão (`exposicao`): `0,15`** — distância a zonas sensíveis face à distância mínima de rótulo e posição a sotavento.

### 3.2 Faixas de Classificação (`IRD_CLASS_BANDS`)
| Classe | Intervalo | Significado Operacional |
| :--- | :---: | :--- |
| `BAIXO` | `1 – 25` | Condições favoráveis dentro do perímetro avaliado; sujeito ao rótulo DGAV/SIFITO. |
| `MODERADO` | `26 – 50` | Viável com atenção e medidas de mitigação (ex.: ajustar pressão, velocidade ou bordadura). |
| `ELEVADO` | `51 – 75` | Risco significativo; recomendável alterar bico/regulação ou aguardar melhoria atmosférica. |
| `CRITICO_BLOQUEADO` | `76 – 100` | Condições críticas ou violação operacional/legal; suspender aplicação. |

### 3.3 Proibição de Risco Zero (`IRD_ANTI_ZERO_RISK`)
* Coerente com o microlearning já publicado na plataforma (*"Porque Não Existe Risco Zero de Deriva"* em [`nozzleMicrolearningData.ts`](../../src/features/nozzle-comparison/nozzleMicrolearningData.ts)), o índice global é sempre limitado ao intervalo **`1–100`** (`allowZeroRisk = false`).
* Valores qualitativos legados presentes no catálogo bruto (`driftHazardLevel: "Inexistente"`) são normalizados para o patamar prudente mínimo não nulo (`30` pontos base no subíndice de espectro), nunca para `0`.
* Vento calmo (`< 2,0 km/h`) não recebe bónus de segurança devido ao risco de inversão térmica radiativa documentado em [`weatherCalculations.ts`](../../src/features/weather/weatherCalculations.ts) e [`weatherGuideSprayQuestions.ts`](../../src/features/weather/data/weatherGuideSprayQuestions.ts).

---

## 4. Regras Fail-Closed e Fallbacks Conservadores (`IRD_FAIL_CLOSED_RULES`)

1. **Bloqueio fail-closed na ausência de dados críticos:**
   * Se `windSpeedKmh`, `temperatureC`, `relativeHumidityPct`, `workingPressureBar`, `travelSpeedKmh` ou `boomOrReleaseHeightM` estiverem ausentes, forem `NaN`/`Infinity` ou estiverem fora dos limites físicos (`IRD_INPUT_LIMITS`), o cálculo devolve estado `FAIL_CLOSED_INCOMPLETE` com `irdScore: null` e veredicto `BLOQUEADO`.
   * **Nunca assumir 3,0 bar por omissão:** alinha-se com a regra explícita de [`weatherGuideSprayQuestions.ts`](../../src/features/weather/data/weatherGuideSprayQuestions.ts) quando a pressão de trabalho não foi fornecida.
2. **Hierarquia conservadora de bicos (fundamentada no inventário de `1.666` variantes):**
   * Apenas **11 / 1.666** variantes têm $D_{v10}/D_{v50}/D_{v90}$ numéricos catalogados (`d10_5bar_um` / `10bar` / `15bar`), **1.499** têm `dropletClass` (`5bar`/`10bar`/`15bar`) e **167** não têm qualquer `dropletClass`.
   * Prioridade estrita: (1) $D_{v10}$ interpolado $\rightarrow$ (2) `dropletClass` (`IRD_DROPLET_CLASS_SCORES`) $\rightarrow$ (3) `driftHazardLevel` normalizado (`IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES`) $\rightarrow$ (4) fallback conservador equivalente a gota fina (`F = 78`), salvo declaração explícita de indução de ar (`35`).
3. **Pressão fora da faixa do fabricante:** acima de `pressureMaxBar`, agrava penalização e bloqueia em `+25%` (`overpressureBlockFactor: 1.25`); abaixo de `pressureMinBar`, aplica penalização de má formação do leque sem conceder bónus anti-deriva.
4. **Meteorologia expirada e exposição não confirmada:**
   * Cache meteorológica com idade superior a `20 min` (`CACHE_DURATION_MS`) obriga a aviso de confirmação presencial no campo (`WEATHER_CACHE_STALE_CONFIRM_IN_FIELD`).
   * Distância a massa de água ou zona sensível não preenchida assume penalização conservadora (`75` pontos base no subíndice de exposição, mais `+15` se existir alvo a sotavento).
5. **Bloqueios operacionais e legais (`CRITICO_BLOQUEADO`, piso global `>= 80`):**
   * Precipitação `> 0,2 mm/h`, vento acima do limite da configuração (`14` / `18` / `20 km/h`), rajadas `> 25 km/h`, $\Delta T > 10,0^\circ\text{C}$, ou distância inferior à distância tampão declarada do rótulo SIFITO (`labelMinBufferM`) forçam veredicto `BLOQUEADO`.

---

## 5. Limitações Assumidas na Fase 1

* **Sem dados IPMA nem estações IoT:** a fonte remota é exclusivamente Open-Meteo client-side em cache `localStorage`, que não fornece gradientes verticais diretos de inversão térmica nem medições micrometeorológicas da parcela.
* **Espectro a pressões baixas (`2–4 bar`):** o catálogo local não possui patamares tabelados abaixo de `5 bar`, dependendo de classificação/sensibilidade e fator de desvio de pressão fora dos pontos medidos.
* **Retenção exclusivamente local e teto de 20 registos:** o histórico fica circunscrito ao dispositivo e utilizador em `calculation_history_v2` (sujeito a limpeza no logout em dispositivos partilhados conforme política `SEC-16`) até existir desenho de sincronização segura na Fase 2.
