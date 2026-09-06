# Protocolo de Teste Operacional — Sessão-Piloto Físico
**DATERRA Smart | Validação UX em Dispositivos Reais antes da Ronda 1**

- **Data de Emissão:** 06 de Setembro de 2026  
- **Estado:** `Aprovado para Execução Interna / Pré-Ronda 1 (Com Calculadora EPPO)`  
- **Versão:** 1.1.0  
- **Responsável:** Equipa de UX / Engenharia DATERRA Smart  

---

## 1. Objetivos do Piloto Físico

O piloto físico antecede a Ronda 1 com os cinco participantes externos. Tem como objetivos estritos:

1. **Validação Ergonómica em Hardware Real:** Avaliar o comportamento da interface, layout e áreas táteis em ecrãs físicos reais sob condições de iluminação natural e operacional.
2. **Descoberta e Compreensão Imediata das Ações:** Confirmar que o utilizador identifica intuitivamente:
   - A barra contextual inferior (`[ Guardar no Histórico ] [ Histórico ] [ Guia ]`);
   - O cabeçalho contextual (`[ Voltar às Ferramentas ]` + `[ Ferramenta Ativa ]`);
   - O seletor de modos dinâmicos na Calculadora Agrupada EPPO (`[ LWA (Vinha/Sebe) ]` vs `[ TRV (Pomar/Frutos) ]`);
   - O cartão de resumo *"Valores Introduzidos"* e o botão *"Introduzir Valores"*;
   - A caixa dedicada de *"Notas de Validação"*.
3. **Avaliação da Metodologia Agrupada EPPO vs Calculadoras Individuais:** Medir a facilidade de utilização do cálculo consolidado de volume de calda e produto por depósito/hectare em comparação com o fluxo de ferramentas unitárias.
4. **Deteção Precoce de Fricções:** Identificar e registar qualquer problema de legibilidade, corte/truncagem de texto, sobreposição de barras ou falhas de toque.

---

## 2. Dispositivos Alvo e Matriz de Hardware

O teste deve ser executado nos seguintes aparelhos e resoluções, cobrindo todas as calculadoras e a nova Calculadora EPPO:

| Categoria | Dispositivo / Resolução | Sistema Operativo | Navegador | Foco Específico de Teste (Incluindo EPPO) |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Compacto** | $320\text{ px}$ (ex: Galaxy A01 Core / iPhone SE 1.ª ger.) | Android / iOS | Chrome / Safari | Truncagem de rótulos, seletor de modo EPPO, ausência de scroll horizontal |
| **Mobile Standard** | $375\text{ px} - 390\text{ px}$ (ex: iPhone 13/14, Galaxy A53) | iOS / Android | Safari / Chrome | Ergonomia de polegar, legibilidade de 9 campos EPPO e toque a 1 mão |
| **Mobile Grande** | $414\text{ px} - 428\text{ px}$ (ex: iPhone 14 Plus / Pro Max) | iOS | Safari | Alcance da barra inferior, proporções visuais e síntese de resultados |
| **Tablet** | $768\text{ px}$ (ex: iPad 10.2" / Galaxy Tab A) | iPadOS / Android | Safari / Chrome | Posicionamento da barra inferior acima do menu global e grelha equilibrada |
| **Desktop / Laptop** | $\ge 1024\text{ px}$ (ex: 1366x768, 1920x1080) | Windows / macOS | Chrome / Edge | Desmontagem da barra móvel, grelha 5/12 + 7/12 e painel lateral de resultados |

---

## 3. Painel de Utilizadores Participantes

Para o piloto interno são recrutados **3 a 5 participantes representativos**, cumprindo os seguintes critérios:

- **Perfil A (Baixa Literacia Digital):** Utilizador com pouca experiência em aplicações móveis avançadas (foco em legibilidade, clareza dos botões e ausência de frustração).
- **Perfil B (Experiência Agrícola Prática):** Agricultor ou aplicador de produtos fitossanitários com prática de campo (foco na coerência dos termos agronómicos, unidades e rapidez de cálculo).
- **Perfil C (Técnico / Responsável de Exploração):** Consultor técnico ou diretor de exploração (foco na metodologia EPPO PP 1/239, auditoria do histórico, quotas e notas de validação).

---

## 4. Roteiro Operacional de Tarefas (9 Tarefas)

| # | Tarefa Operacional | Ação Esperada do Participante | Critério de Sucesso |
| :---: | :--- | :--- | :--- |
| **T1** | **Abrir Calculadora** | A partir do Catálogo de Ferramentas, selecionar a *"Concentração da Calda"*. | Acesso direto à ferramenta em menos de 5 segundos. |
| **T2** | **Introduzir Valores via Keypad** | Tocar em *"Introduzir Valores"* ou numa linha do resumo e definir $600\text{ L}$ de volume e $150\text{ mL/hL}$ de concentração. | Preenchimento fluído no `DaterraUnifiedKeypadModal` com confirmação. |
| **T3** | **Guardar no Histórico** | Localizar e acionar o botão primário verde `[ Guardar no Histórico ]` na barra inferior. | Gravação imediata com toast de confirmação e incremento do contador. |
| **T4** | **Consultar Histórico** | Tocar em `[ Histórico ]` na barra inferior, visualizar o cálculo guardado e fechar o drawer. | Abertura rápida do drawer lateral/inferior sem perda dos dados no ecrã. |
| **T5** | **Consultar Guia Técnico** | Tocar em `[ Guia ]` na barra inferior, ler um tópico de microlearning e fechar o modal. | Abertura direta do modal normativo com fecho intuitivo. |
| **T6** | **Compreender Notas de Validação** | Introduzir um valor atípico (ex: velocidade $15\text{ km/h}$) e ler a caixa *"Notas de Validação"*. | Utilizador identifica a caixa amarela/âmbar e compreende o aviso técnico. |
| **T7** | **Voltar ao Catálogo** | Tocar em *"Voltar às Ferramentas"* no cabeçalho. | Regresso suave ao catálogo sem avisos residuais ou falhas de rota. |
| **T8** | **Calculadora EPPO (LWA + TRV)** | **T8a:** Selecionar método LWA (vinha);<br>**T8b:** Introduzir dados da parcela (comp: $100\text{ m}$, $10$ linhas, entrelinha: $2,5\text{ m}$, alt: $1,5\text{ m}$, dep: $400\text{ L}$, conc: $150\text{ mL/hL}$);<br>**T8c:** Validar volume de calda ($720\text{ L/ha}$) e produto por depósito ($0,60\text{ L}$ / $600\text{ mL}$);<br>**T8d:** Guardar no histórico;<br>**T8e:** Abrir histórico e confirmar registo com badge `LWA`. | Execução autónoma de todo o fluxo EPPO em menos de 90 segundos. |
| **T9** | **Comparação de Fluxos (Individual vs EPPO)** | **T9a:** Fazer cálculo de LWA na calculadora individual (*Área de Parede Foliar*);<br>**T9b:** Fazer cálculo equivalente na *Calculadora EPPO* agrupada;<br>**T9c:** Comparar tempo, clareza e indicar preferência operacional. | Participante avalia qualitativamente a vantagem da solução agrupada. |

---

## 5. Critérios Globais de Sucesso e Aceitação

1. **Descoberta Autónoma:** Todas as 9 tarefas devem ser concluídas sem necessidade de intervenção do facilitador.
2. **Zero Interpretações Erradas:** Nenhuma ação principal deve ser confundida (ex: alternar LWA/TRV sem perder dados comuns).
3. **Áreas Táteis $\ge 48\times 48\text{ px}$:** Nenhuma falha de toque ("missed tap") provocada por botões pequenos ou sobrepostos.
4. **Ausência de Overflow:** Zero scroll horizontal em resoluções estreitas ($320\text{ px}$).
5. **Notas de Validação Claras:** A caixa âmbar dedicada deve ser reconhecida como aviso consultivo sem bloquear o cálculo válido.
6. **Proteção Terminológica:** Zero menções ao termo "cuba" em todo o fluxo em língua portuguesa.

---

## 6. Grelha de Registo de Problemas e Classificação de Severidade

Os problemas detetados durante o piloto são registados de acordo com a seguinte matriz:

| ID | Tarefa | Dispositivo / SO | Descrição da Ocorrência | Severidade (P1 / P2 / P3) | Impacto / Ação Corretiva |
| :---: | :---: | :---: | :--- | :---: | :--- |
| *EX-01* | T8 | Android 320px | *Exemplo: Seletor de modo LWA/TRV requer ajuste de padding.* | P3 | *Ajustar tracking/padding.* |

### Critérios de Classificação:
- **P1 (Crítico / Bloqueante):** Impede a conclusão da tarefa, encravamento de modal ou perda de dados. Bloqueia a Ronda 1.
- **P2 (Moderado / Ergonómico):** Dificulta a utilização, hesitação superior a 10 segundos ou toque impreciso. Exige ajuste antes da Ronda 1.
- **P3 (Menor / Cosmético):** Pequeno desalinhamento visual ou texto ligeiramente apertado que não prejudica a operação.
