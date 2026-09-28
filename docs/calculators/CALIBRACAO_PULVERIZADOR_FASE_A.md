# DATERRA Smart — Calibração do Pulverizador (Fase A)
## Planeamento de Volume de Calda e Produto por LWA / TRV — EPPO
### Especificação Técnica, Metodológica e Arquitetural Oficial

---

### 1. Identificação e Enquadramento Institucional e Agronómico

A ferramenta **Calibração Pulverizador** (`calc_calibracao_pulverizador`), subtitulada *"Planeamento de volume de calda e produto por LWA/TRV — EPPO"*, constitui o módulo de referência da **DATERRA Smart** para a transição dos métodos tradicionais de aplicação baseados em área de solo para os referenciais europeus de volume e superfície de copa foliar.

O módulo está harmonizado com:
* **Norma Europeia EPPO PP 1/239 (*Dose expression for plant protection products*)**;
* **Diretrizes Oficiais da DGAV (Direção-Geral de Alimentação e Veterinária)**;
* **Manuais de Boas Práticas de Aplicação de Produtos Fitofarmacêuticos (DGAV/DRA/INIAV)**;
* **Plataforma Europeia TOPPS-Prowadis (*Train Operators to Promote best Practice Sustainability*)**.

Em culturas tridimensionais (vinhas em sebe, pomóideas, prunóideas, citrinos, olival e frutos secos), a aplicação de uma dose fixa por hectare de solo ("dose/ha de terreno") origina frequentemente graves anomalias:
1. **Sobredosagem e escorrimento** em fases fenológicas precoces (grelamento/abrolhamento) ou em copas pouco desenvolvidas;
2. **Subdosagem e quebra de eficácia biológica** em copas volumosas e densas no pico vegetativo de verão;
3. **Desperdício de água e aumento de fitotoxicidade ou deriva ambiental**.

A metodologia EPPO resolve esta assimetria ajustando a calda e a dose à verdadeira geometria da vegetação:
* **LWA (*Leaf Wall Area* — Área de Parede Foliar):** Para vegetação em sebe contínua bidimensional (vinha, pequenos frutos em sebe, sebe frutícola intensiva).
* **TRV (*Tree Row Volume* — Volume de Copa):** Para pomares tridimensionais e árvores frutíferas isoladas ou em renque com volume mensurável.

---

### 2. Objetivos e Limites Estritos da Fase A

A **Fase A** foca-se exclusivamente no **planeamento estratégico de calda e produto**:
1. Seleção neutra e bidirecional do método de expressão de dose (**LWA** vs **TRV**);
2. Cálculo da geometria da vegetação:
   * $\text{LWA}$ em $\text{m}^2/\text{ha}$;
   * $\text{TRV}$ em $\text{m}^3/\text{ha}$;
3. No percurso TRV:
   * Seleção automática ou manual guiada do coeficiente volumétrico $k$ ($\text{L/m}^3$) através da **Matriz de Decisão DATERRA Smart** (cultura, condução, fenologia e densidade visual);
   * Cálculo do **Volume de Calda Recomendado** $Q$ ($\text{L/ha}$);
4. No percurso LWA:
   * Cálculo da área foliar $\text{m}^2/\text{ha}$ e aceitação do **Volume de Calda Adotado** pelo técnico;
5. Cálculo da quantidade de produto fitofarmacêutico por depósito ($\text{L}$, $\text{mL}$, $\text{kg}$, $\text{g}$);
6. Cálculo da dose equivalente por hectare ($\text{L/ha}$, $\text{mL/ha}$, $\text{kg/ha}$, $\text{g/ha}$);
7. Cálculo da área tratada por depósito ($\text{ha}$) e número de depósitos por hectare ($\text{depósitos/ha}$).

#### Limites Estritos da Fase A (Fora de Âmbito):
* **Fase B (Velocidade Real):** Teste de campo com cronómetro e cálculo de velocidade efetiva de avanço;
* **Fase C (Bicos e Pressão):** Seleção de modelo de bicos ISO, débito por bico ($\text{L/min}$), pressão de trabalho ($\text{bar}$);
* **Fase D (Zonamento Vertical):** Ajuste de orientação e abertura de bicos por nível de copa;
* **Fase E (Relatório PDF):** Emissão de boletim formal de calibração em PDF com assinatura técnica.

---

### 3. Coexistência Rigorosa com `calc_eppo` e Ferramentas Existentes

A criação da ferramenta `calc_calibracao_pulverizador` respeita a integridade do ecossistema existente:
* **Não elimina nem renomeia** a calculadora agrupada legada `calc_eppo` (`/ferramentas/eppo`), mantendo ambas operacionais e acessíveis;
* As ferramentas atómicas existentes (`calc_velocidade_real`, `calc_area_parede_foliar`, `calc_volume_copa`, `calc_volume_calda_trv`, `calc_debito_total`, `calc_dose`, `calc_concentracao`) permanecem intactas;
* O catálogo `TOOLS_CATALOG` (`ToolsView.tsx`) e as rotas de navegação (`App.tsx`) registam a nova ferramenta sob a rota `/ferramentas/calibracao-pulverizador` com ID `calc_calibracao_pulverizador`.

---

### 4. Metodologia LWA (*Leaf Wall Area* — Área de Parede Foliar)

#### 4.1. Princípio Geométrico
A Área de Parede Foliar traduz a superfície vertical da sebe foliar tratada por unidade de área de solo:

$$\text{LWA (m}^2\text{/ha)} = \frac{\text{Altura Tratada } (h) \times \text{Faces Tratadas } (\text{faces}) \times 10.000}{\text{Distância Entrelinhas } (r)}$$

Onde:
* $h$: Altura vertical da vegetação tratada ($\text{m}$);
* $r$: Distância entre linhas de plantação ($\text{m}$);
* $\text{faces}$: Número de faces tratadas ($1$ ou $2$, por defeito $2$).

#### 4.2. Volume de Calda em LWA (Modelo Paramétrico LWA-V DATERRA para Vinha)
No percurso LWA para a cultura da **Vinha em Espaldeira**, o volume de calda recomendado é determinado pelo modelo paramétrico **LWA-V DATERRA**:

$$\text{LWA (m}^2\text{/ha)} = \frac{h \times \text{faces} \times 10.000}{r} \quad (\text{com } \text{faces} = 2 \text{ fixo para Vinha})$$

$$V_{\text{teórico}}\text{ (L/ha)} = \text{LWA} \times 0{,}0377 \times F_{\text{espessura}} \times F_{\text{densidade}} \times F_{\text{estádio}}$$

$$V_{\text{final}}\text{ (L/ha)} = \max(V_{\text{teórico}}, \text{Piso do Equipamento})$$

##### Fatores Paramétricos do Modelo:
1. **Espessura da Sebe ($F_{\text{espessura}}$):**
   * Estreita ($< 0{,}50\text{ m}$): $1{,}00$
   * Média ($0{,}50\text{ m a } 0{,}80\text{ m}$): $1{,}30$
   * Larga ($> 0{,}80\text{ m}$): $1{,}55$
2. **Densidade Foliar ($F_{\text{densidade}}$):**
   * Aberta: $0{,}80$
   * Moderada: $0{,}95$
   * Densa: $1{,}10$
3. **Intervalo Fenológico ($F_{\text{estádio}}$):**
   * *Repouso a olho de algodão* (`int_1`): $F = 0{,}00$ $\rightarrow$ Não aplicável (`isApplicable: false`), alvo foliar nulo. O sistema emite aviso explicativo e não exibe $0\text{ L/ha}$.
   * *Folhas jovens a folhas livres* (`int_2`): $0{,}40$
   * *Cachos visíveis a floração* (`int_3`): $0{,}60$
   * *Bago de chumbo a ervilha* (`int_4`): $0{,}75$
   * *Fecho do cacho à maturação* (`int_5`): $1{,}00$
4. **Pisos Operacionais por Equipamento:**
   * **Trator:** Piso mínimo operacional de $100\text{ L/ha}$.
   * **Drone:** Piso mínimo operacional de $15\text{ L/ha}$.

##### Outras Culturas em LWA (Sem Modelo Automático):
Para outras culturas em sebe contínua que não a Vinha, a aplicação emite aviso informativo indicando que o modelo LWA-V é específico da vinha e disponibiliza o seletor *"Usar volume de calda adotado"*, permitindo a introdução manual de $Q_{\text{adotado}}$ ($\text{L/ha}$).

---

### 5. Metodologia TRV (*Tree Row Volume* — Volume de Copa)

#### 5.1. Princípio Geométrico
O Volume de Copa representa o volume tridimensional aparente ocupado pela copa contínua ou descontínua das árvores:

$$\text{TRV (m}^3\text{/ha)} = \frac{\text{Altura da Copa } (h) \times \text{Largura da Copa } (w) \times 10.000}{\text{Distância Entrelinhas } (r)}$$

Onde:
* $h$: Altura vertical da copa tratada ($\text{m}$);
* $w$: Largura média transversal da copa tratada ($\text{m}$);
* $r$: Distância entre linhas de plantação ($\text{m}$).

#### 5.2. Volume de Calda Recomendado ($Q$)
O volume de calda recomendado por hectare é determinado diretamente pelo produto do TRV pelo coeficiente volumétrico $k$ ($\text{L/m}^3$):

$$Q\text{ (L/ha)} = k \times \text{TRV}$$

---

### 6. Matriz de Decisão EPPO de Coeficiente $k$ (TRV)

A matriz de decisão (`eppoKDecisionMatrix.ts`) organiza as 9 culturas oficiais homologadas em Portugal e Espanha, detalhando modo de condução, grupo fenológico e 3 escalões visuais de densidade foliar:

| Cultura | Condução | Fenologias Mapeadas | Densidades e Fatores | Valores Canónicos $k$ ($\text{L/m}^3$) |
| :--- | :--- | :--- | :--- | :--- |
| **Vinha** | Espaldeira, Guyot, Cordão | Início vegetação / Pleno desenvolvimento / Pós-floração | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,023$ a $0,040$ |
| **Pereira** | Eixo central, Sebe, Vaso | Pré-floração / Pós-floração / Pleno verão | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,030$ a $0,048$ |
| **Macieira** | Eixo central, Fuso, Sebe | Pré-floração / Pós-floração / Fruto formado | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,030$ a $0,048$ |
| **Citrinos** | Vaso tradicional, Sebe | Rebentações / Frutificação / Pós-colheita | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,060$ a $0,100$ |
| **Prunóideas (Pessegueiro/Cerejeira)** | Vaso, Palmeta, Eixo | Floração / Queda de pétalas / Frutificação | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,030$ a $0,045$ |
| **Amendoeira** | Intensivo, Superintensivo, Tradicional | Desfolhada / Plena foliação / Enchimento | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,030$ a $0,050$ |
| **Olival** | Intensivo, Superintensivo, Tradicional | Pré-floração / Frutificação / Outono | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,035$ a $0,055$ |
| **Nogueira / Castanheiro** | Vaso aberto, Eixo | Primavera / Plena copa | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,035$ a $0,050$ |
| **Pequenos Frutos** | Sebe contínua, Túnel | Floração / Maturação | Aberta ($0,75$), Moderada ($0,85$), Densa ($1,00$) | $0,030$ a $0,045$ |

---

### 7. Regra Inviolável do Fator de Densidade Visual

> [!IMPORTANT]
> **Proteção Contra Dupla Multiplicação do Fator Visual:**
> Na arquitetura DATERRA Smart, cada entrada da matriz `EPPO_K_DECISION_MATRIX` já possui o valor final do coeficiente $k$ ($\text{L/m}^3$) ajustado com o seu respetivo fator visual de densidade ($0,75$ para aberta, $0,85$ para moderada, $1,00$ para densa).
> **O motor de cálculo NUNCA multiplica novamente $k$ pelo fator $f_{\text{densidade}}$**, calculando sempre diretamente:
> $$Q = k \times \text{TRV}$$

---

### 8. Tipos de Expressão de Dose Suportados

A ferramenta processa 4 tipologias completas de dose e concentração autorizadas:

1. **Dose por Hectare de Terreno (`dose_ha`):**
   * Unidades: $\text{L/ha}$, $\text{mL/ha}$, $\text{kg/ha}$, $\text{g/ha}$.
   * Aplicação: $\text{Produto por Depósito} = \text{Dose} \times \left(\frac{V_{\text{dep}}}{Q}\right)$.

2. **Dose por 100 Litros de Calda (`dose_100l`):**
   * Unidades: $\text{mL/100 L}$, $\text{L/100 L}$, $\text{g/100 L}$, $\text{kg/100 L}$.
   * $\text{Produto por Depósito} = \frac{\text{Dose} \times V_{\text{dep}}}{100}$.
   * $\text{Dose Equivalente/ha} = \frac{\text{Dose} \times Q}{100}$.

3. **Concentração da Calda (`concentration`):**
   * Unidades: $\%$, $\text{mL/hL}$, $\text{L/hL}$, $\text{g/hL}$, $\text{kg/hL}$.
   * Para percentagem: $1\% = 1\text{ L ou 1 kg por 100 L}$.
   * $\text{Produto por Depósito} = \frac{\text{Dose} \times V_{\text{dep}}}{100}$.
   * $\text{Dose Equivalente/ha} = \frac{\text{Dose} \times Q}{100}$.

4. **Dose por $10.000\text{ m}^2$ de LWA (`dose_lwa`):**
   * Unidades: $\text{L/10 000 m}^2\text{ LWA}$, $\text{mL/10 000 m}^2\text{ LWA}$, $\text{kg/10 000 m}^2\text{ LWA}$, $\text{g/10 000 m}^2\text{ LWA}$.
   * $\text{Dose Equivalente/ha} = \frac{\text{Dose}_{\text{LWA}} \times \text{LWA}}{10.000}$.
   * $\text{Produto por Depósito} = \text{Dose Equivalente/ha} \times \left(\frac{V_{\text{dep}}}{Q}\right)$.

---

### 9. Preservação de Famílias de Unidades e Submétricas

O motor de cálculo `calibracaoPulverizadorEngine.ts` preserva de forma estrita as famílias físicas de grandezas:
* **Produtos Líquidos:** Família de volume ($\text{L} \leftrightarrow \text{mL}$).
* **Produtos Sólidos:** Família de massa ($\text{kg} \leftrightarrow \text{g}$).
* **Exibição Submétrica:** O sistema calcula e disponibiliza simultaneamente a métrica principal e a submétrica auxiliar (ex.: $0,45\text{ kg}$ / $450\text{ g}$ ou $1,25\text{ L}$ / $1.250\text{ mL}$).

---

### 10. Cálculo de Logística do Depósito

* **Área Tratada por Depósito ($A_{\text{dep}}$ em $\text{ha}$):**
  $$A_{\text{dep}} = \frac{V_{\text{dep}}}{Q}$$

* **Depósitos Necessários por Hectare ($N_{\text{dep/ha}}$):**
  $$N_{\text{dep/ha}} = \frac{Q}{V_{\text{dep}}}$$

---

### 11. Validação Inteligente e Avisos Não-Bloqueantes

O ficheiro `calibracaoPulverizadorValidation.ts` implementa uma bateria completa de regras:
1. **Erros Bloqueantes:**
   * Entradas nulas, menores ou iguais a zero, NaN ou Infinity;
   * Altura tratada fora do intervalo $[0,4\text{ m}; 8,0\text{ m}]$;
   * Distância entrelinhas fora do intervalo $[0,8\text{ m}; 12,0\text{ m}]$;
   * Largura de copa fora do intervalo $[0,3\text{ m}; 6,0\text{ m}]$ (em TRV);
   * Faces tratadas fora de $\{1, 2\}$ (em LWA);
   * Falta de seleção de contexto agronómico completo em TRV.
2. **Avisos Contextuais Não-Bloqueantes:**
   * **Sobreposição de Copas:** Emitido se a largura da copa for superior ou igual a 80% da entrelinha ($w \ge 0,8 \times r$);
   * **Volume Extremo:** Emitido se $Q < 80\text{ L/ha}$ (risco de cobertura insuficiente) ou $Q > 1.500\text{ L/ha}$ (risco severo de escorrimento);
   * **Prevalência Jurídica:** Aviso permanente de consulta obrigatória do rótulo homologado.

---

### 12. Nota de Prevalência Jurídica do Rótulo Oficial e Enquadramento

> [!NOTE]
> A ferramenta utiliza fórmulas e conceitos de expressão de dose LWA/TRV alinhados com o enquadramento da EPPO PP 1/239. A matriz k é uma matriz técnica de decisão DATERRA Smart e não substitui o rótulo do produto, a calibração do equipamento, a legislação aplicável ou a decisão do técnico responsável.
>
> Conforme regulamentado pela DGAV e pela legislação aplicável (Regulamento CE n.º 1107/2009 e Decreto-Lei n.º 145/2015), as indicações do **rótulo oficial homologado prevalecem juridicamente** sobre qualquer modelo matemático ou estimativa teórica. Em caso de discrepância ou restrição de dose máxima por hectare, prevalece sempre a restrição do rótulo.

---

### 13. Arquitetura de Ficheiros do Módulo

```text
src/features/calibracao-pulverizador/
├── data/
│   └── eppoKDecisionMatrix.ts          # Matriz de 9 culturas e utilitários de pesquisa
├── calibracaoPulverizadorTypes.ts      # Tipos, interfaces e enums TypeScript
├── calibracaoPulverizadorEngine.ts     # Motor matemático puro (sem efeitos colaterais)
├── calibracaoPulverizadorValidation.ts # Validações puras (erros e avisos)
├── calibracaoPulverizadorConfig.ts     # CalculatorDefinition declarativa
├── CalibracaoPulverizador.tsx          # Componente de topo / rota
├── components/
│   ├── CalibracaoMetodoSelector.tsx    # Seletor neutro LWA vs TRV (>=48x48px)
│   └── CalibracaoContextSelectors.tsx  # Seletores em cascata (cultura->condução->fenologia->densidade)
└── content/
    └── CalibracaoPulverizadorGuide.md  # Guia técnico e microlearning com 10 secções
```

---

### 14. Componentes de Interface e Acessibilidade

1. **`CalibracaoMetodoSelector.tsx`:**
   * Apresenta LWA e TRV com rigorosamente o mesmo peso visual e área de toque ($\ge 48\times 48\text{ px}$);
   * Estados ativos com realce escuro `#114037`, contorno e badge "Ativo";
   * Totalmente operável por teclado via `aria-pressed`.
2. **`CalibracaoContextSelectors.tsx`:**
   * Cascata lógica: ao selecionar Cultura, filtra Modos de Condução e Estados Fenológicos compatíveis;
   * Seletor de Densidade Foliar em 3 cartões táteis com fatores e descrições técnicas;
   * Banner verde contextual dinâmico exibindo $k$ selecionado, base da decisão e justificação agronómica.

---

### 15. Persistência e Histórico de Cálculos

* Os registos são persistidos no IndexedDB local através do repositório unificado `calculation_history_v2`;
* Quota estrita de 20 registos ativos por utilizador e calculadora com política de soft-delete;
* Os cartões de histórico (`CalculationHistoryCard.tsx`) exibem badge de método (`LWA` ou `TRV`), volume de calda, dose equivalente e produto por depósito;
* O modal de detalhes (`HistoryDetailModal.tsx`) apresenta a categoria oficial `CALIBRAÇÃO`.

---

### 16. Internacionalização Completa (8 Idiomas)

O namespace `calibracaoPulverizador` foi integralmente adicionado e sincronizado em:
1. `pt.json` (Português de Portugal) — **Zero menções ao termo "cuba" ou abreviatura "PF"**;
2. `br.json` (Português do Brasil) — **Zero menções ao termo "cuba" ou abreviatura "PF"**;
3. `en.json` (Inglês);
4. `es.json` (Espanhol);
5. `fr.json` (Francês);
6. `it.json` (Italiano) — Corrigido terminologicamente para *"quantità di prodotto per serbatoio"*;
7. `de.json` (Alemão);
8. `el.json` (Grego).

---

### 17. Guia Técnico e Microlearning Integrado

O ficheiro `CalibracaoPulverizadorGuide.md` inclui as 10 secções normativas:
1. Enquadramento e Fundamentos EPPO PP 1/239;
2. Comparação Metodológica: LWA vs TRV;
3. Fórmulas Matemáticas Oficiais;
4. Matriz de Decisão do Coeficiente $k$ e Taxa de Cobertura $k_{\text{LWA}}$;
5. Modos de Expressão de Dose e Conversões;
6. Exemplos Práticos Passo a Passo (Vinha em Espaldeira e Pomar de Macieiras);
7. Preparação da Calda e Logística de Depósitos;
8. Boas Práticas de Calibração e Inspeção de Pulverizadores;
9. Legislação, DGAV e Prevalência do Rótulo;
10. Perguntas Frequentes (FAQ).

---

### 18. Verificação e Bateria de Testes Automatizados

O ficheiro `test/calibracao-pulverizador-fase-a.test.mjs` valida 19 testes críticos:
* Integridade das matrizes oficiais $k_{\text{TRV}}$ (9 culturas) e $k_{\text{LWA}}$ (Vinha em Espaldeira com 9 linhas);
* Inferência automática de condução e ausência de seletores redundantes na UI;
* Rótulos operacionais curtos para estados fenológicos;
* Fórmulas puras de LWA, TRV, $Q = k \times \text{TRV}$ e $Q_{\text{LWA}} = (\text{LWA} \times k_{\text{LWA}}) / 10.000$;
* Proteção matemática contra NaN, zero e negativos;
* Cenários canónicos automatizados de Vinha com $k_{\text{LWA}} = 510$ e $k_{\text{LWA}} = 600\text{ L}/10.000\text{ m}^2$;
* Tratamento de culturas sem matriz $k_{\text{LWA}}$ e ativação de volume adotado manual;
* Isolamento estrito entre LWA e TRV (sem leitura cruzada de coeficientes);
* Conversão exata dos 4 tipos de dose e logística de depósitos;
* Coexistência com `calc_eppo`;
* Presença nos 8 idiomas sem menção a "cuba" em PT/BR e validação da tradução italiana;
* Estrutura do guia técnico de 10 secções.

---

### 19. Resumo de Execução dos Testes

* **Testes Globais do Projeto:** 483 testes em 31 suites — **100% de sucesso (0 falhas)**;
* **Validação de Tipos TypeScript (`tsc -b`):** 0 erros;
* **Build de Produção (`vite build`):** Sucesso com geração PWA service worker;
* **Linter OxLint:** 0 erros nos ficheiros do módulo.

---

### 20. Roadmap para Fases Futuras

* **Fase B — Velocidade Real de Trabalho:** Teste de cronometragem de 50 ou 100 metros com rodagem e cálculo de velocidade efetiva ($v$ em $\text{km/h}$);
* **Fase C — Seleção de Bicos e Pressão de Trabalho:** Cálculo do débito total do pulverizador ($q_{\text{total}} = \frac{Q \times v \times r}{600}$), débito individual por bico e seleção da cor de bicos ISO a partir da tabela de calibração;
* **Fase D — Zonamento Vertical de Copas:** Ajuste individual de calibração por níveis de bicos (inferior, médio, superior) para copas descontínuas;
* **Fase E — Relatório Técnico em PDF:** Emissão de boletim de calibração assinado para cadernos de campo e certificações GlobalGAP.
