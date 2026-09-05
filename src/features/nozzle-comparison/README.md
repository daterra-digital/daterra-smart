# Módulo Comparador de Bicos de Pulverização (DATERRA Smart • Versão 1.1)

O módulo **Comparador de Bicos de Pulverização** é uma ferramenta de apoio à decisão agronómica concebida para agricultores, técnicos e operadores no terreno. Permite comparar rigorosamente dois bicos de pulverização ou pesquisar alternativas com débito equivalente a partir do catálogo oficial com 1.666 variantes técnicas.

---

## 1. Origem dos Dados
Os dados técnicos de base foram extraídos sem alteração do ficheiro oficial `FlowRate_Nozzles.xlsx` (1.666 variantes) e cruzados com a base de dados de fabricantes `fabricantes_bicos_pulverizacao_nichos.csv`:
- **Albuz** (307 bicos) — *França, Solcera / CoorsTek*
- **ASJ** (431 bicos) — *Itália, Arag / Nordson Corporation*
- **TeeJet** (255 bicos) — *EUA, Spraying Systems Co.*
- **Lechler** (214 bicos) — *Alemanha, Lechler GmbH*
- **Hardi** (175 bicos) — *Dinamarca, Exel Industries*
- **Pentair Hypro** (152 bicos) — *EUA / Reino Unido, Pentair plc*
- **Nozal** (72 bicos) — *França, Exel Industries*
- **Braglia** (60 bicos) — *Itália, Braglia S.r.l.*

---

## 2. Regras Físicas de Cálculo e Prioridade de Dados

### 2.1 Regra Estrita de Prioridade dos Dados
1. **Procurar primeiro débito tabelado**:
   Se a ficha técnica oficial do fabricante possuir um valor de débito tabelado para a pressão selecionada ($P_2$), a ferramenta utiliza diretamente esse valor:
   - `valueOrigin = 'tabelado'`
   - Legenda: **“Débito tabelado”**
   - Não se aplica estimativa de cálculo.
2. **Estimativa pela Lei do Orifício Hidráulico (Bernoulli / Torricelli)**:
   Apenas quando não existir valor tabelado na tabela para a pressão escolhida e a pressão estiver dentro da faixa recomendada [$P_{min}$, $P_{max}$], o débito é calculado estritamente pela relação de raiz quadrada:
   - **Formulação Matemática**:
     $$Q_2 = Q_1 \times \sqrt{\frac{P_2}{P_1}}$$
   - **Formulação em Texto Simples**:
     `Q2 = Q1 × sqrt(P2 / P1)`
   - **Formulação em Código**:
     `Q2 = Q1 * Math.sqrt(P2 / P1)`
   - `valueOrigin = 'estimado'`
   - Legenda: **“Débito estimado”**
   - Nota: **“Estimativa calculada pela relação de raiz quadrada entre pressão e débito.”**
3. **Pressão Fora da Faixa Recomendada**:
   Se a pressão de trabalho estiver fora da faixa [$P_{min}$, $P_{max}$], é emitido um alerta técnico visível e o valor não é apresentado como condição operacional recomendada.

> **Importante:** Nunca utilizar a fórmula linear $Q_2 = Q_1 \times (P_2 / P_1)$. A resposta física dos fluidos num orifício é regida pela raiz quadrada da pressão: duplicar a pressão ($2 \times P$) aumenta o débito em apenas cerca de $41,4\%$ ($\sqrt{2} \approx 1,414$) e não $100\%$. Para duplicar o débito ($2 \times Q$) é necessário quadruplicar a pressão ($4 \times P$).

---

## 3. Três Casos Canónicos de Confirmação Hidráulica

- **Caso 1 ($Q_1 = 0,80\text{ L/min}$ a $3\text{ bar} \to 6\text{ bar}$)**:
  $$Q_2 = 0,80 \times \sqrt{\frac{6}{3}} = 0,80 \times \sqrt{2} \approx 1,13\text{ L/min} \quad (\Delta Q = +41,4\%)$$
- **Caso 2 ($Q_1 = 0,80\text{ L/min}$ a $3\text{ bar} \to 12\text{ bar}$)**:
  $$Q_2 = 0,80 \times \sqrt{\frac{12}{3}} = 0,80 \times \sqrt{4} = 0,80 \times 2 = 1,60\text{ L/min}$$
- **Caso 3 ($Q_1 = 0,79\text{ L/min}$ a $3\text{ bar} \to 2\text{ bar}$)**:
  $$Q_2 = 0,79 \times \sqrt{\frac{2}{3}} = 0,79 \times 0,8165 \approx 0,65\text{ L/min}$$

---

## 4. Modos de Funcionamento

1. **Modo 1: Comparar dois bicos**:
   - Seleção adaptativa em cascata para Bico A e Bico B.
   - Controlo tátil de pressão de trabalho e cálculo de faixas comuns com alertas de subpressurização em bicos de fenda.
   - Resumo diferencial com $\Delta Q$ (L/min) e $\Delta Q\%$ e interpretação técnica orientadora.
   - Matriz técnica comparativa completa.
2. **Modo 2: Encontrar alternativas**:
   - Ponto de partida por **Bico de Referência** ou por **Débito Desejado** ($Q_{desejado}$).
   - Tolerâncias de débito: $\pm 5\%$ (padrão), $\pm 10\%$ e $\pm 15\%$.
   - Ordenação primária por menor diferença absoluta $|\Delta Q|$ e secundária por menor sensibilidade potencial à deriva.
   - Filtros por marca, modelo, tipo de bico e bicos de referência TOP DATERRA.
   - Botão direto `[ Comparar estes dois bicos ]` para comutar para o Modo 1.

---

## 5. Débito Total do Conjunto (Barra de Pulverização)

Secção opcional recolhível para cálculo do débito total da barra:
$$\text{Débito Total (L/min)} = \text{Débito por Bico (L/min)} \times \text{Número de Bicos}$$
- *Nota Oficial*: “Este resultado assume bicos com débito semelhante. Confirme por medição prática em proveta graduada.”
- *Aviso*: Não calcula volume aplicado por hectare (L/ha) nesta versão.

---

## 6. Microlearning Agronómico (15 Tópicos Canónicos)

1. *O Débito de um Bico de Pulverização* (ISO 10625 / ISO 5682-1)
2. *Diferença entre Débito Tabelado e Débito Estimado* (DGAV / EPPO PP 1/239)
3. *Porque a Pressão Altera o Débito: A Lei do Orifício* ($Q_2 = Q_1 \sqrt{P_2 / P_1}$, `Q2 = Q1 * Math.sqrt(P2 / P1)`)
4. *Faixa de Pressão Indicada e Limites Operacionais*
5. *Formação do Leque em Bicos de Fenda*
6. *Sobreposição dos Jatos e Distribuição Transversal* (EN ISO 16122-2)
7. *Disco / Pastilha e Difusor em Conjuntos Modulares*
8. *Cor ISO e Código de Calibre segundo a ISO 10625*
9. *O que Significa Espectro de Gotas (VMD, D10, D50, D90)* (ASABE S572.1 / ISO 25358)
10. *Diferença entre Indicação do Fabricante, Medição Laboratorial e Estimativa*
11. *Sensibilidade Potencial à Deriva e Mitigação Agronómica* (DGAV / ISO 22866)
12. *Porque Não Existe "Risco Zero" de Deriva*
13. *Como Comparar Dois Bicos no Modo de Comparação*
14. *Como Procurar uma Alternativa com Débito Semelhante*
15. *Porque o Débito Total do Conjunto Não é o Mesmo que Volume em L/ha*
