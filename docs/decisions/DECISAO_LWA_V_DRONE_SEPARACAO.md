# Registo de Decisão de Arquitetura (ADR)
## Decisão: Desacoplamento da Aplicação por Drone do Modelo LWA-V Terrestre

**Data:** Setembro de 2026  
**Estado:** Aprovado e Implementado  
**Contexto:** Ferramenta *Calibração do Pulverizador* (`calc_calibracao_pulverizador` / `UniversalCalculatorTemplate`), DATERRA Smart  

---

### 1. Contexto e Motivação

Durante a conceção inicial do método **LWA-V DATERRA** (ajuste paramétrico de volume de calda para vinha baseado na área de parede foliar tratada), foi introduzido um seletor de "Perfil do Equipamento" com as opções "Trator" (com piso operacional mínimo de 100 L/ha) e "Drone" (com piso de 15 L/ha).

Contudo, uma análise agronómica e regulamentar aprofundada (baseada nas diretrizes da **EPPO PP 1/239(3)**, nos normativos da **DGAV** e nos cadernos de boas práticas de aplicação de produtos fitofarmacêuticos) concluiu que:

1. **Incompatibilidade Metodológica e Paramétrica:**  
   A pulverização por aeronaves não tripuladas (UAV / Drones de pulverização) opera com dinâmica de deposição induzida pelo *downwash* das hélices, espectros de gota ultrabaixos (CDA - *Centrifugal Rotary Atomizers* ou bicos de ultra-baixo volume), volumes de calda reduzidos (geralmente entre 10 e 40 L/ha) e padrões de voo tridimensionais (altura sobre o coberto, deriva lateral por vento de deslocamento, faixas de sobreposição). Tratar o drone como uma mera redução de piso mínimo dentro de um modelo desenhado especificamente para atomizadores e pulverizadores terrestres de jato transportado distorce a física da aplicação.

2. **Rigor Regulamentar (DGAV / UE):**  
   A aplicação aérea com recurso a drones está sujeita a regimes excecionais de autorização prévia, regras estritas de deriva e cadernos de campo específicos em Portugal e na União Europeia. Apresentar o drone como uma opção equivalente a um trator numa calculadora standard de campo pode induzir o operador em erro quanto à conformidade legal dos tratamentos.

3. **Evolução Futura:**  
   As tecnologias de aplicação por drone justificam e exigem uma **ferramenta de cálculo dedicada e autónoma** (`calc_pulverizacao_drone` / *Aplicação Aérea por Drone*), que integrará parâmetros próprios como altitude de voo (m), velocidade de cruzeiro (m/s), largura de faixa (*swath width* em m), tipo de disco rotativo / RPM, taxa de litragem por minuto por rotor e coeficientes de vento/deriva.

---

### 2. Decisão

1. **Remover totalmente o perfil do equipamento do método LWA-V atual:**  
   - Eliminar os campos e seletores visuais de "Perfil do equipamento" ("Trator" / "Drone") da interface.
   - Eliminar os pisos operacionais artificiais (100 L/ha e 15 L/ha).
   - O volume sugerido final ($V_{\text{final}}$) passa a ser estritamente igual ao volume teórico calculado ($V_{\text{teórico}}$) a partir da área de parede foliar ($\text{LWA}$) e da taxa de cobertura hídrica efetiva ($\text{taxaLwa}$):
     $$V_{\text{final}} = V_{\text{teórico}} = \text{LWA} \times \text{taxaLwa}$$
     $$\text{LWA} = \frac{h \times \text{faces} \times 10000}{r} \quad (\text{m}^2/\text{ha})$$
     $$\text{taxaLwa} = 0.0377 \times F_{\text{espessura}} \times F_{\text{densidade}} \times F_{\text{estádio}} \quad (\text{L/m}^2\text{ LWA})$$

2. **Manter o isolamento entre domínios no codebase:**  
   - O método LWA-V permanece exclusivamente como cálculo de dosagem e calibração agronómica e operacional terrestre para vinha em sebe.
   - A remoção foi feita de forma estrita no domínio da calibração (`src/features/calibracao-pulverizador/`), **preservando intactos** todos os esquemas, tipos e modelos de máquinas agrícolas da exploração (`profiles_equipment`, `equipmentProfileId`, `ExplorationView`, `db.ts`).

3. **Reservar a aplicação aérea para módulo autónomo:**  
   - O suporte a drones será implementado futuramente como uma calculadora especializada independente.

---

### 3. Impacto Técnico

- **Ficheiros Atualizados:**
  - `src/features/calibracao-pulverizador/data/lwaVDaterraConfig.ts`: remoção de constantes de equipamento e pisos.
  - `src/features/calibracao-pulverizador/calibracaoPulverizadorTypes.ts`: limpeza de tipos `equipmentType`, `equipmentFloorApplied`, `equipmentFloorLHa`.
  - `src/features/calibracao-pulverizador/calibracaoPulverizadorEngine.ts`: eliminação de `applyLwaVEquipmentFloor` e unificação de $V_{\text{final}} = V_{\text{teórico}}$.
  - `src/features/calibracao-pulverizador/calibracaoPulverizadorValidation.ts`: remoção de validações e avisos de piso.
  - `src/features/calibracao-pulverizador/calibracaoPulverizadorValidationFallback.ts`: remoção de chaves obsoletas.
  - `src/features/calibracao-pulverizador/calibracaoPulverizadorConfig.ts`: remoção do mapeamento de inputs.
  - `src/features/calibracao-pulverizador/components/CalibracaoContextSelectors.tsx`: remoção do Bloco 4 (Perfil do Equipamento).
  - `src/features/calculators/core/UniversalCalculatorTemplate.tsx`: limpeza de estado de equipamento e props.
  - `src/i18n/locales/*.json` (8 idiomas: PT, BR, EN, ES, FR, IT, DE, EL): limpeza integral das chaves do namespace `calibracaoPulverizador`.
  - `test/calibracao-pulverizador-fase-a.test.mjs` e `test/calibracao-pulverizador-fase-b.test.mjs`: testes atualizados e suite de regressão de 4 testes adicionada.

---

### 4. Conformidade e Validação

- ✅ Sem quebras no motor TRV nem na matriz de coeficientes EPPO $k$.
- ✅ Sem quebras na Fase B (fórmulas operacionais $Q_{\text{total}}$, $Q_{\text{bico}}$, $T$).
- ✅ Compatibilidade retroativa garantida (inputs legados com `equipmentType` são ignorados sem lançar erros).
- ✅ Zero resíduos em 8 idiomas e 0% menções aos termos proibidos "cuba" ou "PF".
