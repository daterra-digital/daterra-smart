# DATERRA Smart — Calculadora Agrupada EPPO (LWA + TRV)
## Especificação Técnica e Metodológica Oficial (Norma EPPO PP 1/239)

---

### 1. Enquadramento e Objetivo Agronómico

A **Calculadora Agrupada EPPO** (`calc_eppo`) da **DATERRA Smart** foi concebida para harmonizar a expressão de doses e o cálculo de volumes de calda de aplicação fitossanitária segundo a norma europeia **EPPO PP 1/239 (*Dose expression for plant protection products*)** e as diretrizes oficiais da **DGAV (Direção-Geral de Alimentação e Veterinária)**.

Em culturas tridimensionais (vinhas conduzidas em espaldeira, pomóideas, prunóideas, citrinos e frutos secos), a dose tradicional por hectare de solo ("dose/ha de superfície") induz frequentemente a sobredosagens em estados fenológicos precoces ou a subdosagens em copas densas. A metodologia EPPO ajusta a quantidade de calda e produto à verdadeira dimensão da vegetação através de dois métodos complementares:

1. **LWA (*Leaf Wall Area* — Área de Parede Foliar):** Aplicável a vinhas e culturas conduzidas em sebe vertical contínua.
2. **TRV (*Tree Row Volume* — Volume de Copa):** Aplicável a pomares de fruto seco (amendoeira, nogueira, avelaneira), pomóideas, prunóideas e citrinos.

---

### 2. Metodologias e Fórmulas Matemáticas

#### 2.1. Cálculo da Área da Parcela
Calcula a superfície física real tratada com base na malha de plantação:

$$\text{Área da Parcela (m}^2\text{)} = \text{Comprimento da Linha (m)} \times \text{Distância Entrelinhas (m)} \times \text{Número de Linhas}$$

$$\text{Área da Parcela (ha)} = \frac{\text{Área da Parcela (m}^2\text{)}}{10.000}$$

---

#### 2.2. Modo LWA (*Leaf Wall Area*) — Vinha e Sebes Verticais

A área de parede foliar representa a superfície vertical tratada das duas faces da sebe vegetal por hectare de terreno:

$$\text{LWA (m}^2\text{/ha)} = \frac{\text{Altura da Vegetação (m)} \times 2 \times 10.000}{\text{Distância Entrelinhas (m)}}$$

O volume de calda recomendado é proporcional à área de parede foliar e ao índice de referência $k_{\text{LWA}}$ (litros por cada $10.000\text{ m}^2$ de LWA; valor padrão normativo: $600\text{ L}/10.000\text{ m}^2$):

$$\text{Volume de Calda Recomendado (L/ha)} = \text{LWA} \times \left( \frac{k_{\text{LWA}}}{10.000} \right) = \frac{\text{Altura (m)} \times 2 \times k_{\text{LWA}}}{\text{Distância Entrelinhas (m)}}$$

---

#### 2.3. Modo TRV (*Tree Row Volume*) — Pomares e Frutos Secos

O volume de copa representa o volume tridimensional aparente ocupado pela copa das árvores por hectare de terreno:

$$\text{TRV (m}^3\text{/ha)} = \frac{\text{Altura da Copa (m)} \times \text{Largura da Copa (m)} \times 10.000}{\text{Distância Entrelinhas (m)}}$$

O volume de calda recomendado é obtido multiplicando o TRV pelo coeficiente volumétrico $k_{\text{TRV}}$ ($\text{L/m}^3$; padrão orientador de $0,04$ a $0,06\text{ L/m}^3$ para pomares gerais; $0,07$ a $0,10\text{ L/m}^3$ para citrinos):

$$\text{Volume de Calda Recomendado (L/ha)} = \text{TRV} \times k_{\text{TRV}}$$

---

#### 2.4. Cálculo de Dosagens e Depósitos de Pulverização

A concentração do produto indicada no rótulo oficial é expressa tipicamente por hectolitro ($\text{1 hL} = 100\text{ L}$ de água). A DATERRA Smart normaliza o fator de diluição para determinar a quantidade exata de produto comercial a introduzir no depósito do pulverizador e a aplicar por hectare:

1. **Fator por Litro de Calda ($f_{\text{litro}}$):**
   - Para concentração em $\text{mL/hL}$ ou $\text{g/hL}$: $f_{\text{litro}} = \frac{\text{Concentração}}{100}$
   - Para concentração em $\text{L/hL}$ ou $\text{kg/hL}$: $f_{\text{litro}} = \frac{\text{Concentração} \times 1.000}{100}$
   - Para concentração em $\%$: $f_{\text{litro}} = \text{Concentração} \times 10$

2. **Produto Comercial por Depósito:**
   $$\text{Qtd por Depósito (L ou kg)} = \frac{\text{Capacidade Útil do Depósito (L)} \times f_{\text{litro}}}{1.000}$$
   $$\text{Submétrica por Depósito (mL ou g)} = \text{Capacidade Útil do Depósito (L)} \times f_{\text{litro}}$$

3. **Produto Comercial por Hectare:**
   $$\text{Qtd por Hectare (L/ha ou kg/ha)} = \frac{\text{Volume de Calda EPPO (L/ha)} \times f_{\text{litro}}}{1.000}$$
   $$\text{Submétrica por Hectare (mL/ha ou g/ha)} = \text{Volume de Calda EPPO (L/ha)} \times f_{\text{litro}}$$

4. **Número de Depósitos:**
   $$\text{Depósitos por Hectare} = \frac{\text{Volume de Calda EPPO (L/ha)}}{\text{Capacidade Útil do Depósito (L)}}$$
   $$\text{Depósitos Totais na Parcela} = \frac{\text{Volume de Calda Total da Parcela (L)}}{\text{Capacidade Útil do Depósito (L)}}$$

---

### 3. Variáveis de Entrada e Limites de Validação

| Campo | ID Técnico | Unidade Padrão | Intervalo Válido | Valores Sugeridos (Presets) |
| :--- | :--- | :--- | :--- | :--- |
| **Comprimento da Linha** | `comprimentoLinha` | $\text{m}$ | $1,0$ a $2.000,0$ | $50$, $100$, $150$, $200$ |
| **Número de Linhas** | `numeroLinhas` | $\text{unid}$ | $1$ a $500$ | $5$, $10$, $20$, $50$ |
| **Distância Entrelinhas** | `distanciaEntrelinhas` | $\text{m}$ | $0,80$ a $12,00$ | $1,80$, $2,20$, $2,50$, $3,00$ (LWA) / $3,50$, $4,00$, $5,00$, $6,00$ (TRV) |
| **Altura da Vegetação** | `alturaVegetacao` | $\text{m}$ | $0,40$ a $8,00$ | $1,20$, $1,50$, $1,80$, $2,20$ |
| **Largura da Copa** *(apenas TRV)* | `larguraCopa` | $\text{m}$ | $0,30$ a $6,00$ | $1,00$, $1,50$, $2,00$, $2,50$ |
| **Índice de Calda LWA** *(apenas LWA)* | `coeficienteLwa` | $\text{L/10.000m}^2$ | $100$ a $2.000$ | $400$, $500$, $600$, $800$ |
| **Coeficiente TRV ($k$)** *(apenas TRV)* | `coeficienteTrv` | $\text{L/m}^3$ | $0,010$ a $0,300$ | $0,04$, $0,05$, $0,07$, $0,10$ |
| **Capacidade do Depósito** | `capacidadeDeposito` | $\text{L}$ | $10$ a $10.000$ | $200$, $400$, $600$, $1.000$ |
| **Concentração do Rótulo** | `concProduto` | $\text{mL/hL}$ | $0,01$ a $5.000,0$ | $50$, $100$, $200$, $400$ |

---

### 4. Avisos Contextuais e Boas Práticas Agronómicas

A calculadora inclui validação inteligente que apresenta alertas em caixa dedicada sem bloquear o cálculo:
- **Entrelinha fora do padrão:** Alerta se a entrelinha for $<1,5\text{ m}$ ou $>3,5\text{ m}$ em vinha, ou $<2,5\text{ m}$ em pomar.
- **Largura da copa superior à entrelinha:** Alerta caso a largura da copa exceda o espaçamento entre linhas no pomar.
- **Risco de escorrimento ou subdosagem:** Alertas para coeficientes $k_{\text{LWA}} > 1.200\text{ L}/10.000\text{ m}^2$ ou $k_{\text{TRV}} > 0,12\text{ L/m}^3$.
- **Proteção terminológica:** Em língua portuguesa de Portugal e do Brasil é terminantemente evitado o termo ambíguo *"cuba"*, mantendo exclusivamente a designação técnica *"depósito"* ou *"tanque"*.

---

### 5. Exemplo de Cálculo Canónico

#### Exemplo 1: Vinha em Espaldeira (Modo LWA)
- Comprimento da linha: $100\text{ m}$
- Número de linhas: $10$
- Distância entrelinhas: $2,5\text{ m}$
- Altura da vegetação tratada: $1,5\text{ m}$
- Índice de calda $k_{\text{LWA}}$: $600\text{ L}/10.000\text{ m}^2$
- Capacidade do depósito: $400\text{ L}$
- Concentração do produto: $150\text{ mL/hL}$

**Resultados:**
1. Área da Parcela: $100 \times 2,5 \times 10 = 2.500\text{ m}^2 = 0,250\text{ ha}$
2. LWA: $(1,5 \times 2 \times 10.000) / 2,5 = 12.000\text{ m}^2\text{ LWA/ha}$
3. Volume de Calda EPPO: $12.000 \times (600 / 10.000) = 720,0\text{ L/ha}$ (Total na parcela: $180,0\text{ L}$)
4. Produto por Depósito: $(400 \times 1,5) / 1.000 = 0,60\text{ L}$ ($600\text{ mL}$)
5. Produto por Hectare: $(720 \times 1,5) / 1.000 = 1,08\text{ L/ha}$ ($1.080\text{ mL/ha}$)
6. Depósitos por Hectare: $720 / 400 = 1,80\text{ depósitos/ha}$ ($0,45$ depósitos na parcela)

---

### 6. Histórico e Transferências

Os cálculos efetuados são gravados na tabela `calculation_history_v2` com quota de até 20 registos por calculadora, permitindo:
- Consulta rápida offline com identificador de modo (`LWA` ou `TRV`);
- Visualização de valores primários e submétricos;
- Transferência contextual de parâmetros (ex.: `row_spacing`, `tank_volume`, `canopy_height`) para outras ferramentas do ecossistema DATERRA Smart.
