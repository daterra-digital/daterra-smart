# Cenários de Teste Operacional — Calculadora EPPO (LWA + TRV)
**DATERRA Smart | Protocolo de Validação em Campo e Sessões-Piloto**

- **Data de Emissão:** 06 de Setembro de 2026  
- **Norma de Referência:** EPPO PP 1/239 & DGAV  
- **Objetivo:** Fornecer guiões de teste normalizados para avaliar a usabilidade, clareza e precisão dos cálculos em condições de campo.

---

## 1. Cenário 1: Vinha em Espaldeira Contínua (Modo LWA)

### 1.1. Perfil Agronómico e Contexto
- **Cultura:** Vinha (*Vitis vinifera L.*) em sistema de condução em espaldeira (VSP).
- **Fase de Aplicação:** Pleno desenvolvimento vegetativo / pós-floração.
- **Objetivo do Tratamento:** Aplicação fungicida contra míldio com volume de calda ajustado à parede foliar real.

### 1.2. Dados de Entrada Fornecidos ao Participante
| Variável | Valor de Teste | Unidade | Preset / Observação |
| :--- | :--- | :--- | :--- |
| **Método Selecionado** | `LWA (Vinha / Sebe)` | — | Modo dinâmico inicial |
| **Comprimento da Linha** | `100` | $\text{m}$ | Atalho rápido disponível |
| **Número de Linhas** | `10` | $\text{unid}$ | Atalho rápido disponível |
| **Distância Entrelinhas** | `2,5` | $\text{m}$ | Atalho rápido disponível |
| **Altura da Vegetação** | `2,0` | $\text{m}$ | Teclado numérico |
| **Índice de Calda LWA ($k_{\text{LWA}}$)** | `600` | $\text{L/10.000m}^2$ | Valor padrão EPPO |
| **Capacidade do Depósito** | `400` | $\text{L}$ | Depósito standard de vinha |
| **Concentração do Rótulo** | `150` | $\text{mL/hL}$ | Dose autorizada DGAV |

### 1.3. Resultados Esperados de Validação
- **Área Calculada da Parcela:** $0,250\text{ ha}$ ($2.500\text{ m}^2$)
- **Área de Parede Foliar (LWA):** $16.000\text{ m}^2\text{ LWA/ha}$
- **Volume de Calda Recomendado EPPO:** $960,0\text{ L/ha}$ (Total na parcela: $240,0\text{ L}$)
- **Produto Comercial por Depósito:** $0,60\text{ L}$ ($600\text{ mL}$)
- **Produto Comercial por Hectare:** $1,44\text{ L/ha}$ ($1.440\text{ mL/ha}$)
- **Número de Depósitos por Hectare:** $2,40\text{ depósitos/ha}$ ($0,60$ depósitos na parcela)

### 1.4. Critérios de Avaliação do Observador
1. O participante compreendeu que a altura de $2,0\text{ m}$ e entrelinha de $2,5\text{ m}$ calcularam automaticamente o volume de calda sem necessidade de cálculos externos?
2. O participante interpretou facilmente a dose por depósito ($600\text{ mL}$) para colocar no tanque?

---

## 2. Cenário 2: Pomar de Fruto Seco / Frutóideas (Modo TRV)

### 2.1. Perfil Agronómico e Contexto
- **Cultura:** Pomar de amendoeiras / macieiras em compasso largo.
- **Fase de Aplicação:** Copa desenvolvida / proteção pré-colheita.
- **Objetivo do Tratamento:** Aplicação de produto formulado em pó molhável ($\text{WP/WG}$) com base no volume tridimensional de copa ($TRV$).

### 2.2. Dados de Entrada Fornecidos ao Participante
| Variável | Valor de Teste | Unidade | Preset / Observação |
| :--- | :--- | :--- | :--- |
| **Método Selecionado** | `TRV (Pomar / Frutos)` | — | Comutação de modo no topo |
| **Comprimento da Linha** | `150` | $\text{m}$ | Atalho rápido disponível |
| **Número de Linhas** | `12` | $\text{unid}$ | Teclado numérico |
| **Distância Entrelinhas** | `6,0` | $\text{m}$ | Atalho dinâmico de pomar |
| **Altura da Vegetação** | `3,5` | $\text{m}$ | Teclado numérico |
| **Largura da Copa** | `4,0` | $\text{m}$ | Campo dinâmico do modo TRV |
| **Coeficiente TRV ($k$)** | `0,05` | $\text{L/m}^3$ | Coeficiente orientador padrão |
| **Capacidade do Depósito** | `1000` | $\text{L}$ | Atomizador de pomar |
| **Concentração do Rótulo** | `200` | $\text{g/hL}$ | Produto sólido |

### 2.3. Resultados Esperados de Validação
- **Área Calculada da Parcela:** $1,080\text{ ha}$ ($10.800\text{ m}^2$)
- **Volume de Copa (TRV):** $23.333\text{ m}^3\text{ TRV/ha}$
- **Volume de Calda Recomendado EPPO:** $1.166,7\text{ L/ha}$ (Total na parcela: $1.260,0\text{ L}$)
- **Produto Comercial por Depósito:** $2,00\text{ kg}$ ($2.000\text{ g}$)
- **Produto Comercial por Hectare:** $2,33\text{ kg/ha}$ ($2.333,3\text{ g/ha}$)
- **Número de Depósitos por Hectare:** $1,17\text{ depósitos/ha}$ ($1,26$ depósitos na parcela)

### 2.4. Critérios de Avaliação do Observador
1. O participante identificou que ao mudar para TRV o campo *"Largura da copa"* surgiu automaticamente?
2. A distinção de unidades sólidas ($\text{kg}$ e $\text{g}$) foi apresentada com clareza sem induzir erros de pesagem?

---

## 3. Cenário 3: Teste Comparativo de Fluxos (Individual vs Agrupada EPPO)

### 3.1. Objetivo do Teste A/B de Usabilidade
Comparar a carga cognitiva, tempo de execução e taxa de erro entre:
- **Fluxo A (Calculadoras Unitárias Tradicionais):** Abrir *"Área de Parede Foliar"*, calcular LWA, anotar valor, abrir *"Concentração da Calda"*, introduzir valores e estimar calda manualmente.
- **Fluxo B (Calculadora Agrupada EPPO):** Abrir *"Calculadora EPPO"*, preencher a parcela e obter instantaneamente o volume e produto por depósito.

### 3.2. Procedimento de Teste
1. O participante executa primeiro o Fluxo A num dispositivo móvel.
2. O participante executa em seguida o Fluxo B no mesmo dispositivo com os mesmos dados agronómicos.
3. O facilitador cronometra ambos os fluxos e anota hesitações.

### 3.3. Tabela Comparativa de Avaliação
| Métrica Operacional | Fluxo A (Calculadoras Individuais) | Fluxo B (Calculadora EPPO Agrupada) |
| :--- | :--- | :--- |
| **Tempo Total até ao Resultado** | _____ segundos | _____ segundos |
| **Número de Ecrãs Percorridos** | $3$ ecrãs | $1$ ecrã |
| **Erros de Transcrição / Anotação** | [ ] Sim (____)  [ ] Não | [ ] Sim (____)  [ ] Não |
| **Preferência Expressa do Utilizador** | [ ] | [ ] |

---

## 4. Matriz de Validação Visual por Breakpoint

Antes de iniciar as sessões com utilizadores, o facilitador deve confirmar visualmente a conformidade da Calculadora EPPO na grelha:

| Resolução | Item Inspecionado | Critério de Aceitação | Estado |
| :--- | :--- | :--- | :---: |
| **320 px** | Seletor LWA/TRV | Rótulos visíveis sem quebras desformatadas | `[ OK ]` |
| **320 px** | Resumo 9 Campos | Leitura vertical sem scroll horizontal | `[ OK ]` |
| **320 px** | Barra Inferior | `[ Guardar no Histórico ] [ Histórico ] [ Guia ]` acessíveis | `[ OK ]` |
| **375 px** | Resultados em Destaque | Volume de calda e produto por depósito bem destacados | `[ OK ]` |
| **375 px** | Notas de Validação | Caixa âmbar legível e com margens corretas | `[ OK ]` |
| **768 px** | Disposição Tablet | Layout equilibrado sem espaços em branco excessivos | `[ OK ]` |
| **$\ge$ 1024 px** | Disposição Desktop | Grelha funcional com painel lateral e barra superior | `[ OK ]` |
