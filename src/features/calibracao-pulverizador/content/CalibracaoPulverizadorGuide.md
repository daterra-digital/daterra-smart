# Guia Técnico — Calibração Pulverizador (LWA / TRV — EPPO)

## 1. O que calcula a ferramenta
A ferramenta **Calibração Pulverizador** (Fase A) apoia o planeamento agronómico e operacional de tratamentos fitossanitários com base na geometria tridimensional da vegetação e nos métodos de expressão de dose padronizados pela norma **EPPO PP 1/239**.

A calculadora permite determinar:
- A **Área de Parede Foliar** (LWA) em m²/ha para culturas em sebe ou vinha;
- O **Volume de Copa** (TRV) em m³/ha para pomares e culturas com volume relevante;
- O **Volume de Calda Recomendado** ($Q$) em L/ha derivado da matriz técnica de coeficientes $k$;
- O **Volume de Calda Adotado** ($Q_{\text{adotado}}$) introduzido pelo técnico no percurso LWA;
- A **Dose equivalente por hectare** a partir de doses expressas por 10.000 m² LWA, por 100 L ou concentração (%);
- A **Quantidade de produto fitofarmacêutico a adicionar ao depósito**;
- A **Área aproximada tratada por depósito** (ha) e o número de **depósitos por hectare**.

---

## 2. Como escolher entre LWA e TRV
A escolha entre o método **LWA** (Leaf Wall Area) e o método **TRV** (Tree Row Volume) depende essencialmente da arquitetura da vegetação tratada, do sistema de condução e das informações disponíveis no rótulo do produto ou na estratégia técnica da exploração:

O método LWA é frequentemente utilizado quando a vegetação tratada se comporta como uma parede ou sebe contínua. Muitas vinhas são conduzidas em linhas contíguas de sebe, com faces de pulverização bem definidas, pelo que a Área de Parede Foliar pode representar adequadamente a superfície tratada.

O LWA não é exclusivo da vinha. Também pode ser adequado em pomares conduzidos em sebes contínuas, desde que a vegetação apresente poucas falhas ou espaços relevantes entre plantas.

O método TRV considera altura, largura e distância entrelinhas, sendo frequentemente útil quando a vegetação forma copas com volume, arredondadas, globosas, em vaso ou de geometria mais irregular.

---

## 3. LWA: Vegetação em parede e sebe contínua (Modelo LWA-V DATERRA)
No percurso **LWA**, a superfície-alvo do tratamento é quantificada pela área vertical das paredes de vegetação tratadas em 1 hectare de terreno. Para a cultura da **Vinha em Espaldeira**, a DATERRA Smart integra o modelo paramétrico de referência **LWA-V DATERRA**.

### Fórmula geométrica LWA:
$$\text{LWA (m²/ha)} = \frac{h \times \text{faces tratadas} \times 10.000}{r}$$

Onde:
- $h$ = Altura da vegetação tratada, em metros (m);
- $\text{faces tratadas}$ = Número de faces pulverizadas ($2$ faces na vinha em espaldeira bilateral);
- $r$ = Distância entrelinhas, em metros (m);
- $10.000$ = Área de 1 hectare ($1\text{ ha} = 10.000\text{ m}²$).

### Modelo Paramétrico LWA-V DATERRA (Vinha):
$$V_{\text{final}}\text{ (L/ha)} = \text{LWA} \times 0{,}0377 \times F_{\text{espessura}} \times F_{\text{densidade}} \times F_{\text{estádio}}$$

No método LWA, o volume é calculado a partir da área de vegetação tratada, da espessura, da densidade foliar e do estado fenológico. O resultado não é ajustado por perfil de equipamento nesta calculadora.

#### Fatores Paramétricos:
1. **Espessura da sebe ($F_{\text{espessura}}$)**:
   - Estreita ($< 0{,}50\text{ m}$): $1{,}00$
   - Média ($0{,}50\text{ m a } 0{,}80\text{ m}$): $1{,}30$
   - Larga ($> 0{,}80\text{ m}$): $1{,}55$
2. **Densidade foliar ($F_{\text{densidade}}$)**:
   - Aberta: $0{,}80$
   - Moderada: $0{,}95$
   - Densa: $1{,}10$
3. **Intervalo fenológico ($F_{\text{estádio}}$)**:
   - *Repouso a olho de algodão*: Não aplicável ($F=0{,}00$, alvo foliar nulo em repouso)
   - *Folhas jovens a folhas livres*: $0{,}40$
   - *Cachos visíveis a floração*: $0{,}60$
   - *Bago de chumbo a ervilha*: $0{,}75$
   - *Fecho do cacho à maturação*: $1{,}00$

### Regra Operacional para Outras Culturas em LWA:
- Para outras culturas em sebe contínua sem modelo paramétrico automático dedicado, o utilizador pode ativar a opção *"Usar volume de calda adotado"* e introduzir o **Volume de calda adotado (L/ha)** quando pretender calcular a calda do depósito a partir de doses por hectare ou por LWA.

---

## 4. TRV: Copas com volume e largura relevante
No percurso **TRV**, o alvo do tratamento é o volume tridimensional ocupado pelas copas das árvores ou arbustos ao longo das linhas da parcela.

### Fórmulas oficiais TRV:
$$\text{TRV (m³/ha)} = \frac{h \times w \times 10.000}{r}$$
$$Q\text{ (L/ha)} = k \times \text{TRV}$$

Forma equivalente integrada:
$$Q\text{ (L/ha)} = \frac{k \times w \times h \times 10.000}{r}$$

Onde:
- $h$ = Altura da copa tratada (m);
- $w$ = Largura média transversal da copa tratada (m);
- $r$ = Distância entrelinhas (m);
- $k$ = Coeficiente de volume de calda selecionado na matriz técnica (L/m³);
- $Q$ = Volume de calda recomendado para a parcela (L/ha).

---

## 5. Seleção de Cultura, Condução Inferida e Fenologia
Para proporcionar uma experiência de utilização rápida e sem atritos no campo:

### Modo de Condução Inferido Automaticamente:
Nesta versão, cada uma das 9 culturas disponibilizadas na matriz DATERRA Smart possui um modo de condução principal configurado, pelo que o sistema infere automaticamente a condução sem sobrecarregar o formulário com seletores redundantes:
- **Vinha** $\rightarrow$ Espaldeira;
- **Pereira** $\rightarrow$ Sebe / parede;
- **Macieira** $\rightarrow$ Sebe / parede;
- **Pessegueiro** $\rightarrow$ Vaso / taça;
- **Cerejeira** $\rightarrow$ Vaso / taça;
- **Amendoeira** $\rightarrow$ Sebe / parede;
- **Citrinos** $\rightarrow$ Vaso / arredondado;
- **Olival superintensivo** $\rightarrow$ Sebe contínua;
- **Olival intensivo** $\rightarrow$ Vaso / globo.

A condução inferida é registada automaticamente nos metadados do histórico e é utilizada internamente para consultar a matriz de decisão $k$.

### Referências Científicas e Escalas Fenológicas (BBCH / Baggiolini / Fleckinger):
No seletor de topo da calculadora são apresentados termos operacionais curtos. As correspondências e referências técnicas de base são:

| Cultura | Termo Operacional Visível | Referência Técnica Interna |
|---|---|---|
| **Vinha** | Folhas à floração | BBCH 13–57 |
| **Vinha** | Fecho do cacho ao pintor | BBCH 75+ |
| **Vinha** | Pintor à maturação | BBCH 81–89 |
| **Macieira** | Desenvolvimento inicial / pós-floração | BBCH 11–59 |
| **Macieira** | Pleno vigor / maturação | BBCH 71–89 |
| **Pereira** | Desenvolvimento inicial / pós-floração | Início vegetativo (BBCH 11–59) |
| **Pereira** | Pleno crescimento / maturação | Pleno crescimento (BBCH 71–89) |
| **Pessegueiro** | Desenvolvimento inicial / pós-floração | BBCH 11–59 |
| **Pessegueiro** | Pleno vigor / maturação | BBCH 71–89 |
| **Cerejeira** | Desenvolvimento inicial / pós-floração | Escala Baggiolini A–I |
| **Cerejeira** | Pleno vigor / maturação | Escala Baggiolini J–L |
| **Amendoeira** | Desenvolvimento inicial / pós-floração | BBCH 11–59 |
| **Amendoeira** | Pleno vigor / maturação | BBCH 71–89 |
| **Citrinos** | Pós-poda / início vegetativo | Pós-poda |
| **Citrinos** | Pleno vigor | Pleno vigor |
| **Olival Superintensivo** | Pleno vigor | BBCH 71–89 |
| **Olival Intensivo** | Pleno vigor | BBCH 71–89 |

---

## 6. Como medir altura, largura e entrelinha no campo
Para assegurar a máxima exatidão no cálculo de calibração:
1. **Altura tratada ($h$)**: Meça a distância vertical efetiva coberta pela pulverização (desde a base da vegetação foliar ativa até ao topo da sebe ou copa). Não inclua o tronco desprovido de folhas na base.
2. **Largura média da copa ($w$)**: Meça a largura transversal da vegetação em vários pontos representativos da parcela (zonas inferiores, médias e superiores da copa) e calcule a média aritmética.
3. **Distância entrelinhas ($r$)**: Meça a distância horizontal de centro a centro entre duas linhas contíguas de plantação.

---

## 7. O que representa o coeficiente k em L/m³
O coeficiente $k$ (expresso em $\text{L/m}³$) traduz a quantidade de calda necessária para molhar adequadamente $1\text{ m}³$ de vegetação com a densidade foliar observada, sem causar escorrimento excessivo nem défice de cobertura.

A matriz k é uma matriz técnica de decisão adotada pela DATERRA Smart, com base nos dados e critérios fornecidos para o projeto. A EPPO PP 1/239 define o enquadramento de expressão e interconversão de dose por LWA/TRV.

### Regra fundamental de cálculo:
O fator visual associado a cada classe ($0,75$, $0,85$ ou $1,00$) é um elemento descritivo do vigor e da porosidade da copa. O valor de $k$ constante na matriz DATERRA já é o valor final selecionado, **nunca sendo multiplicado novamente pelo fator visual**.

*Nota sobre valores de referência muito baixos*: Um valor de $k = 0,010\text{ L/m}³$ representa uma referência teórica extrema, associada a vegetação incipiente, tratamentos de inverno ou condições técnicas muito particulares, devendo ser sempre validado pelo técnico responsável.

---

## 8. Densidade foliar: Aberta, Moderada e Densa
A densidade da vegetação é avaliada no terreno através de três classes estruturadas:
- **Aberta (Fator 0,75)**: A luz e o ar atravessam facilmente a vegetação. Folhagem jovem, desfolha recente ou copas abertas por poda.
- **Moderada (Fator 0,85)**: A vegetação apresenta uma cobertura intermédia e equilibrada, típica do desenvolvimento vegetativo estável.
- **Densa (Fator 1,00)**: A vegetação é compacta, contínua e adensada, impondo maior resistência à penetração das gotas até aos órgãos internos e cachos/frutos.

---

## 9. Volume de calda, dosagem e preparação no depósito
Ao preparar a calda no pulverizador, é essencial seguir a nomenclatura técnica recomendada:

### Expressão de Volume do Depósito:
Utiliza-se sempre a designação **Volume final de calda a preparar** (e nunca apenas "água no depósito").
Regra de preparação: **"Adicionar o produto e completar com água até ao volume final de calda indicado."**

### Relações de Cálculo Operacional:
1. **Dose por hectare ($D_{\text{ha}}$)**:
   - $\text{Área tratada por depósito (ha)} = \frac{V_{\text{depósito}}}{Q}$
   - $\text{Produto por depósito} = D_{\text{ha}} \times \text{Área tratada por depósito}$
   - $\text{Depósitos por hectare} = \frac{Q}{V_{\text{depósito}}}$
2. **Dose por 100 L ($D_{100\text{L}}$)**:
   - $\text{Produto por depósito} = \frac{D_{100\text{L}} \times V_{\text{depósito}}}{100}$
   - $\text{Dose equivalente por hectare} = \frac{D_{100\text{L}} \times Q}{100}$
3. **Dose por 10.000 m² LWA ($D_{\text{LWA}}$)**:
   - $\text{Dose equivalente por hectare} = \frac{D_{\text{LWA}} \times \text{LWA}}{10.000}$
   - $\text{Produto por depósito} = \text{Dose equivalente por hectare} \times \text{Área tratada por depósito}$
   - $\text{Produto por depósito} = \left(\frac{D_{\text{LWA}} \times \text{LWA}}{10.000}\right) \times \frac{V_{\text{depósito}}}{Q_{\text{adotado}}}$

---

## 10. Limitações, Rótulo e Responsabilidade Técnica
A ferramenta utiliza fórmulas e conceitos de expressão de dose LWA/TRV alinhados com o enquadramento da EPPO PP 1/239. A matriz k é uma matriz técnica de decisão DATERRA Smart e não substitui o rótulo do produto, a calibração do equipamento, a legislação aplicável ou a decisão do técnico responsável.

- As indicações e recomendações homologadas no rótulo oficial prevalecem sempre sobre qualquer estimativa ou cálculo teórico da aplicação.
- A aplicação respeita a separação estrita de famílias de grandezas: nunca converte massa em volume nem volume em massa sem densidade específica comprovada.

---

## 11. Seleção de Bicos e Pressão de Trabalho (Fase C)
A seleção de bicos é feita para um lado do pulverizador; o mesmo perfil é aplicado ao lado oposto.

A pressão de trabalho é calculada quando todos os níveis planeados têm bico selecionado. Durante a construção do perfil, a aplicação apresenta um estado neutro para evitar interpretar valores provisórios como pressão de trabalho final.
