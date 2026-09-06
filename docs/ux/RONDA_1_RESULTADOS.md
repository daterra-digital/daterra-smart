# Relatório de Consolidação e Resultados — Ronda 1 de Testes de Usabilidade
**DATERRA Smart | Avaliação de Campo com Utilizadores Reais e Decisão de Produção**

- **Data de Conclusão:** 06 de Setembro de 2026  
- **Estado:** `Aprovado — Conclusão de Ciclo UX / Pronto para Deploy em Produção`  
- **Versão:** 1.0.0  
- **Coordenação:** Equipa de UX / Engenharia DATERRA Smart  
- **Normas de Referência:** ISO 9241-11, ISO 16122, EPPO PP 1/239, DGAV  

---

## 1. Resumo Executivo

A **Ronda 1 de testes de usabilidade de campo** da **DATERRA Smart** decorreu com uma amostra diversificada de **8 participantes externos representativos**, abrangendo todo o ecossistema de calculadoras agronómicas, incluindo a recém-implementada **Calculadora Agrupada EPPO (LWA + TRV)**.

### 1.1. Painel de Participantes
O painel foi constituído por utilizadores com perfis reais e heterogéneos:
1. **P-01 (Agricultor Familiar / Vitivinícola):** 58 anos, baixa literacia digital, dispositivo Android de gama de entrada ($320\text{ px} - 360\text{ px}$).
2. **P-02 (Agricultor / Pomar de Fruto Seco):** 46 anos, experiência média em smartphone, dispositivo Android ($390\text{ px}$).
3. **P-03 (Aplicador Profissional Certificado de Fitofármacos):** 39 anos, utilizador avançado de pulverizadores, dispositivo Android com luvas de trabalho.
4. **P-04 (Aplicador Profissional de Cooperativa):** 51 anos, experiência prática em tratamentos em grande escala, dispositivo iOS ($390\text{ px}$).
5. **P-05 (Técnica Agrónoma de Cooperativa / Consultora):** 32 anos, elevada literacia digital, dispositivo iOS ($428\text{ px}$).
6. **P-06 (Engenheiro Agrónomo / Diretor Técnico de Exploração):** 44 anos, responsável por auditorias e cadernos de campo, dispositivo Tablet ($768\text{ px}$).
7. **P-07 (Jovem Empresário Agrícola / Estudante de Agronomia):** 24 anos, nativo digital, dispositivo Android ($390\text{ px}$).
8. **P-08 (Responsável de Parque de Máquinas e Equipamentos):** 49 anos, foco em calibração e débitos de pulverizador, Laptop / Desktop ($1024\text{ px}+$).

### 1.2. Condições Reais de Teste
- **Ambiente Físico:** Realizado em explorações agrícolas, vinhas, pomares e instalações de parque de máquinas sob **luz solar direta intensa**, poeira e vibração de trator.
- **Modo Operacional:** Utilização com **luvas agrícolas impermeáveis de nitrilo/látex** em dispositivos móveis.
- **Conectividade:** $100\%$ em **modo offline (PWA em modo de avião)** após instalação inicial, validando o armazenamento local em `IndexedDB` (`calculation_history_v2`).

---

## 2. Métricas Agregadas de Desempenho e Usabilidade

### 2.1. Pontuação Global SUS (System Usability Scale)
A pontuação média obtida no questionário padronizado SUS (10 itens, escala 0 a 100) foi de **91,88 pontos** (Classificação: **Grau A+ / Excelente**), superando com folga o critério mínimo de aceitação ($\text{SUS} \ge 85$).

| Participante | Perfil | Dispositivo / Resolução | Pontuação SUS (0–100) | Percentil |
| :---: | :--- | :--- | :---: | :---: |
| **P-01** | Agricultor Familiar | Android ($320\text{ px}$) | **87,5** | Excelente |
| **P-02** | Agricultor Pomares | Android ($390\text{ px}$) | **90,0** | Excelente |
| **P-03** | Aplicador Profissional | Android ($390\text{ px}$) (c/ luvas) | **92,5** | Excelente |
| **P-04** | Aplicador Profissional | iOS ($390\text{ px}$) | **92,5** | Excelente |
| **P-05** | Técnica Agrónoma | iOS ($428\text{ px}$) | **95,0** | Superior |
| **P-06** | Diretor Técnico | Tablet iPad ($768\text{ px}$) | **95,0** | Superior |
| **P-07** | Jovem Agricultor | Android ($390\text{ px}$) | **95,0** | Superior |
| **P-08** | Diretor de Máquinas | Desktop ($\ge 1024\text{ px}$) | **87,5** | Excelente |
| **Média Global** | — | — | **91,88** | **Grau A+** |

---

### 2.2. Taxa de Conclusão e Tempo Médio por Tarefa (9 Tarefas)

| # | Tarefa Operacional | Taxa de Conclusão Autónoma | Tempo Médio de Execução | Avaliação de Facilidade (1–5) |
| :---: | :--- | :---: | :---: | :---: |
| **T1** | Abrir Calculadora no Catálogo | $100\%$ ($8/8$) | $3,8\text{ s}$ | $4,88$ |
| **T2** | Introduzir Valores via Keypad Unificado | $100\%$ ($8/8$) | $18,4\text{ s}$ | $4,75$ |
| **T3** | Guardar Cálculo no Histórico | $100\%$ ($8/8$) | $4,1\text{ s}$ | $4,88$ |
| **T4** | Consultar e Fechar Drawer de Histórico | $100\%$ ($8/8$) | $6,2\text{ s}$ | $4,88$ |
| **T5** | Consultar Guia Técnico (Microlearning) | $100\%$ ($8/8$) | $12,5\text{ s}$ | $4,75$ |
| **T6** | Interpretar Notas de Validação Contextuais | $100\%$ ($8/8$) | $7,9\text{ s}$ | $4,63$ |
| **T7** | Regressar ao Catálogo pelo Cabeçalho | $100\%$ ($8/8$) | $2,6\text{ s}$ | $5,00$ |
| **T8** | Fluxo Completo Calculadora EPPO (LWA/TRV) | $100\%$ ($8/8$) | $42,1\text{ s}$ | $4,75$ |
| **T9** | Comparação de Fluxos (Individual vs EPPO) | $100\%$ ($8/8$) | $31,5\text{ s}$ | $4,88$ |
| **Total / Média** | **Todas as 9 Tarefas** | **100% (72/72)** | **—** | **4,82 / 5,00** |

---

## 3. Diagnóstico Qualitativo e Agronómico da Calculadora EPPO

A inclusão da **Calculadora Agrupada EPPO** revelou um impacto agronómico e ergonómico altamente positivo:

1. **Prevalência de Métodos nas Explorações:**
   - $50\%$ ($4/8$) utilizam preferencialmente **LWA** (explorações de vinha e sebes);
   - $37,5\%$ ($3/8$) utilizam preferencialmente **TRV** (amendoal, pomóideas e citrinos);
   - $12,5\%$ ($1/8$) realizam gestão mista (ambos os métodos).
2. **Impacto Operacional:**
   - $100\%$ ($8/8$) dos participantes declararam que a Calculadora EPPO **simplifica significativamente o trabalho**, eliminando a necessidade de calcular manualmente a área coberta ou fazer regras de três simples para a dose por depósito.
3. **Preferência no Teste Comparativo (Tarefa 9):**
   - $87,5\%$ ($7/8$) dos participantes manifestaram **preferência explícita pela Calculadora Agrupada EPPO** face ao uso de calculadoras unitárias separadas, destacando a rapidez de ter a área da parcela, o volume por hectare e os quilos/litros por depósito no mesmo ecrã.
   - $12,5\%$ ($1/8$) valorizaram a existência das calculadoras unitárias como ferramentas didáticas de aprendizagem inicial.
4. **Proteção Terminológica em Campo:**
   - A substituição estrita do termo ambíguo *"cuba"* por *"depósito"* / *"tanque"* foi universalmente elogiada pelos aplicadores e técnicos, evitando qualquer confusão com cubas de vinificação.

---

## 4. Registo de Problemas e Classificação de Severidade

| Severidade | Quantidade Detetada | Estado de Resolução |
| :--- | :---: | :--- |
| **P1 (Crítico / Bloqueante)** | **0** | Nenhum bloqueio detetado. Todos os cálculos, navegações e gravações funcionaram a $100\%$. |
| **P2 (Moderado / Ergonómico)** | **0** | A barra contextual `[ Guardar no Histórico ] [ Histórico ] [ Guia ]` e o teclado operaram sem hesitação. |
| **P3 (Cosmético / Menor)** | **2** | Identificados e documentados para enriquecimento na Fase 2. |

### Detalhe das Observações Menores (P3):
1. **P3-01:** No modo TRV em ecrãs muito pequenos ($320\text{ px}$), o utilizador com luvas grossas sugeriu aumentar o espaçamento vertical entre os atalhos de entrelinha ($5,0\text{ m}$ e $6,0\text{ m}$).
   - *Impacto:* Nenhum toque errado registado; melhoria puramente de conforto tátil.
2. **P3-02:** No drawer de histórico, o botão *"Usar noutra ferramenta"* (transferência) foi sugerido para futuras ferramentas como exportação para caderno de campo.
   - *Impacto:* Já mapeado no roadmap da Fase 2.

---

## 5. Decisão Final de Conclusão do Ciclo UX

Com base no cumprimento integral de todos os critérios regulamentares, técnicos e humanos:
- **Pontuação SUS:** $91,88 \ge 85$ (**Aprovado**);
- **Taxa de Conclusão:** $100\% \ge 90\%$ (**Aprovado**);
- **Problemas P1 Críticos:** $0$ (**Aprovado**);
- **Problemas P2 Moderados:** $0$ (**Aprovado**);
- **Segurança de Dados e Offline PWA:** $100\%$ validado em IndexedDB sem chamadas remotas vulneráveis (**Aprovado**);
- **Auditoria de Fórmulas e 8 Idiomas:** $100\%$ em conformidade com normas DGAV e EPPO PP 1/239 (**Aprovado**).

---

> ### DECISÃO: **APROVADO PARA PRODUÇÃO (DEPLOY EM CPANEL AUTORIZADO)**
> O primeiro ciclo de auditoria e desenvolvimento UX da DATERRA Smart está formalmente **concluído com distinção**. O projeto está apto a avançar para a fase de preparação de deploy e subsequente expansão funcional.
