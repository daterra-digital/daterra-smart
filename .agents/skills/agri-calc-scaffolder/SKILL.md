---
name: agri-calc-scaffolder
description: Scaffolding, implementação e validação canónica de calculadoras agronómicas DATERRA Smart alinhadas ao Master Blueprint de 3 camadas, norma ISO 9241-210 e lista de 10 ferramentas aprovadas.
---

# 🚜 Skill: Scaffolding Canónico de Calculadoras Agronómicas

Esta Skill guia os agentes na criação, refatoração ou auditoria de calculadoras agronómicas no DATERRA Smart, garantindo rigor matemático, zero poluição visual e aderência estrita às diretivas oficiais.

---

## 📋 1. Verificação Prévia de Escopo (Filtro Canónico)

Antes de escrever qualquer linha de código, o agente **DEVE** verificar se a ferramenta pertence às 10 ferramentas agronómicas da **Lista Canónica de Produção**:
1. `ajuste_dose_eppo` (Ajuste da Dose EPPO PP 1/239)
2. `calc_area_parede_foliar` (Área de Parede Foliar - LWA)
3. `verificador_ph` (Consulta de pH)
4. `calc_concentracao` (Mistura de Calda - Concentração)
5. `calc_dose` (Mistura de Calda - Dose)
6. `mistura_compatibilidade` (Ordem de Mistura)
7. `pre_inspecao_dgav` (Pré-Inspeção de Pulverizadores)
8. `comparador_bicos` (Tabelas de Débito / Comparador)
9. `calc_velocidade_real` (Velocidade Real de Trabalho)
10. `calc_volume_copa` (Volume de Copa - TRV)

> [!CAUTION]
> Se a ferramenta não constar nesta lista, aplica-se o **Protocolo de Quarentena**: o agente está expressamente proibido de criar ou refatorar o componente sem ordem explícita do utilizador.

---

## 🏛️ 2. Master Blueprint de 3 Camadas (IMAGE-1 / IMAGE-3)

A interface da calculadora deve seguir estritamente a anatomia oficial de 3 camadas:

```mermaid
flowchart TD
    subgraph Camada1 ["Camada 1: Ecrã Limpo (Mobile-First)"]
        Nav["< Voltar às Ferramentas + Badge [PULVERIZAÇÃO]"]
        ResultCard["Cartão de Resultado Verde (#114037)\nNúmeros grandes JetBrains Mono"]
        InputCard["Cartão 'Valores Introduzidos'\nLista limpa com ícone de edição (✏️)"]
        Footer["Barra Fixa Inferior: [Guardar] + [Histórico] + [Guia]"]
    end

    subgraph Camada2 ["Camada 2: Bottom Sheet (DaterraKeypad)"]
        Keypad["DaterraKeypad Táctil\nToque mínimo 48x48 dp\nAtalhos Rápidos de Campo"]
    end

    subgraph Camada3 ["Camada 3: Modal Didático"]
        GuiaModal["Modal Contextual [Guia] / [Ajuda]\nExplicação EPPO/DGAV, FAQs e Fórmulas"]
    end

    InputCard -->|Toque no parâmetro| Keypad
    Footer -->|Toque no botão [Guia]| GuiaModal
```

### Regras Visuais Críticas:
1. **Zero Ruído:** Proibido introduzir blocos de ajuda, notas de rodapé ou botões redundantes entre os campos de entrada.
2. **Inputs Limpos:** O apoio contextual em cada parâmetro é prestado exclusivamente através de ícones interativos de informação `( i )` ou dúvida `( ? )`, sem texto adjacente.
3. **Botão de Apoio:** A label do botão de suporte na barra inferior é obrigatoriamente **"Guia"** ou **"Ajuda"** (nunca "Microlearning").

---

## 📏 3. Regra de Ouro da Modularidade (< 200 Linhas)

Nenhum ficheiro criado pode ultrapassar as 200 linhas de código:
* **Definição de Parâmetros:** Criar em `src/features/calculators/definitions/<calcName>Config.ts` ($\le 200$ linhas).
* **Motor Matemático Puro:** Criar em `src/features/calculators/engine/<calcName>Engine.ts` ($\le 200$ linhas).
* **Conteúdo Didático:** Criar em `src/features/calculators/content/<calcName>Guia.ts` ($\le 200$ linhas).
* **Suite de Testes:** Criar em `test/<calcName>.test.mjs` ($\le 200$ linhas).

---

## 🌾 4. Vocabulário Oficial PT-PT (Inviolável)

* ✅ **Use:** "depósito", "calda", "produto fitofarmacêutico", "copa", "débito", "entrelinha".
* ❌ **Proibido:** "cuba", "tanque", "veneno", "PF", "mistura", "canópia".
* ❌ **Proibido:** siglas DGAV ou EPPO repetitivas (use apenas na fundamentação bibliográfica da norma).

---

## 🧪 5. Checklist de Verificação da Skill

Ao concluir uma calculadora, execute sequencialmente:
1. `npm run lint` (`oxlint`): 0 erros.
2. `npx tsc -b`: 0 erros de compilação.
3. `node --test test/<calcName>.test.mjs`: 100% dos testes aprovados.
4. Reportar o ficheiro criado e a rota ativa em `http://localhost:5173/daterra-smart/tools/<calcName>`.
