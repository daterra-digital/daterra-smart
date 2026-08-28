---
name: mobile-ux-field-tools
description: Gera prompts e requisitos de UX mobile-first para a PWA DATERRA Smart 2, especializados em smartphone, formulários rápidos, botões grandes, legibilidade em exterior e uso em contexto agrícola no terreno. Use quando o pedido mencionar smartphone, mobile, UX, formulários, botões grandes, rapidez, campo, terreno, agrícola, legibilidade, navegação simples, toque, uso em exterior, ergonomia ou experiência mobile-first.
version: 1.0.0
triggers:
  - smartphone
  - mobile
  - UX
  - formulários
  - botões grandes
  - rapidez
  - campo
  - terreno
  - agrícola
  - legibilidade
  - navegação simples
  - toque
  - exterior
  - ergonomia
  - mobile-first
  - ecrã
  - input
  - fluxo rápido
---

# mobile-ux-field-tools

## Contexto

Esta skill existe para gerar prompts e critérios de desenho focados na utilização real da PWA DATERRA Smart 2 em smartphone, especialmente em contexto agrícola no terreno.

O objetivo é adaptar a experiência da app a condições reais de uso: luz exterior forte, utilização com uma mão, necessidade de rapidez, atenção dividida, dados inseridos em pé ou em movimento lento, e necessidade de reduzir erros em formulários.

As referências consultadas indicam que uma boa PWA deve ser responsiva a qualquer dimensão de ecrã, começar rápida, manter-se rápida e oferecer uma experiência sólida em dispositivos móveis [web:77][web:40]. A mesma linha orientadora também reforça a importância de experiência resiliente e progressiva, em que a funcionalidade essencial continua acessível mesmo quando certas melhorias não estão disponíveis [web:1].

No contexto DATERRA Smart 2, esta skill deve especializar:
- desenho de ecrãs para smartphone;
- formulários rápidos e fáceis;
- botões grandes;
- cartões simples;
- navegação clara;
- legibilidade em exterior;
- hierarquia visual direta;
- redução do esforço cognitivo;
- interações adequadas a uso agrícola em campo.

A skill não serve para backend nem para fórmulas agrícolas. Serve para orientar a experiência de utilização.

---

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt ou conjunto de requisitos.

### 1. Ler e interpretar o contexto de uso

Antes de produzir a saída final, identifica:
- se o ecrã será usado sobretudo em smartphone;
- se o utilizador estará no campo, em armazém, em viatura parada ou em contexto misto;
- se a tarefa é rápida ou longa;
- se o ecrã envolve preenchimento manual;
- se o utilizador verá resultados logo após introdução de dados;
- se a ação principal é calcular, guardar, consultar, filtrar ou navegar;
- se o fluxo precisa de ser usado com pressa;
- se o ecrã será usado com pouca conectividade.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Classificar o tipo de experiência móvel

Classifica o pedido numa destas categorias:

- formulário curto;
- formulário de cálculo agrícola;
- consulta rápida de biblioteca técnica;
- login ou registo mobile;
- histórico e filtros;
- navegação base de ferramentas;
- ecrã de resultados;
- fluxo de recolha de dados no terreno;
- ecrã de ação principal única;
- módulo com uso em exterior.

### 3. Assumir smartphone como dispositivo principal

A skill deve assumir sempre, salvo indicação em contrário, que:
- o smartphone é o dispositivo principal;
- o ecrã é relativamente pequeno;
- o utilizador precisa de tocar rapidamente;
- a interface deve ser compreendida em segundos;
- a experiência deve ser boa mesmo sem precisão extrema no toque.

A PWA deve continuar responsiva noutros tamanhos, mas a prioridade é o smartphone [web:77].

### 4. Definir princípios obrigatórios de UX para terreno

Sempre que a skill gerar uma saída, deve impor estes princípios:
- leitura rápida;
- toque fácil;
- baixa densidade de elementos por zona;
- poucos passos por tarefa;
- ação principal evidente;
- contraste visual forte;
- texto claro;
- componentes grandes;
- feedback imediato;
- navegação simples.

### 5. Definir legibilidade em exterior

A skill deve obrigar o prompt a pedir interfaces com:
- contraste suficiente;
- tipografia clara;
- tamanhos de texto confortáveis;
- rótulos curtos;
- separação visível entre secções;
- zonas clicáveis amplas;
- fundos limpos e pouco ruidosos.

A prioridade é ser legível sob luz forte, não apenas “bonito”.

### 6. Definir botões grandes e fáceis de tocar

A skill deve sempre recomendar:
- botões principais grandes;
- distância razoável entre ações críticas;
- hierarquia clara entre ação principal e secundária;
- rótulos diretos como “Calcular”, “Guardar”, “Entrar”, “Ver resultado”;
- evitar botões minúsculos ou demasiado próximos.

A experiência deve tolerar dedos, não exigir precisão de rato.

### 7. Definir formulários rápidos

Sempre que existirem formulários, a skill deve pedir:
- poucos campos visíveis de cada vez, quando possível;
- ordem lógica de preenchimento;
- labels claras;
- unidades visíveis junto ao campo;
- ajuda breve só quando necessária;
- inputs adequados ao tipo de dado;
- validação simples e imediata;
- redução do número de toques.

Os formulários devem ser desenhados para conclusão rápida no terreno.

### 8. Definir teclado e introdução de dados

A skill deve orientar a implementação visual para:
- abrir teclados adequados ao tipo de campo;
- reduzir alternância entre tipos de input;
- facilitar introdução de números;
- mostrar unidades ao lado dos campos;
- evitar campos ambíguos.

Sempre que possível, o ecrã deve reduzir esforço de escrita manual longa.

### 9. Definir organização vertical do conteúdo

A skill deve privilegiar:
- fluxo vertical simples;
- uma tarefa principal por ecrã;
- blocos em cartões simples;
- resultados abaixo dos inputs;
- secções bem separadas;
- leitura natural de cima para baixo.

Evita grelhas complexas e múltiplas colunas em smartphone.

### 10. Definir ação principal dominante

A skill deve obrigar o prompt a identificar a principal ação do ecrã e destacá-la claramente.

Exemplos:
- calcular;
- guardar;
- iniciar sessão;
- consultar histórico;
- abrir ficha técnica.

Não devem existir várias ações com igual peso visual sem necessidade.

### 11. Definir feedback imediato

A skill deve exigir que o ecrã responda de forma clara às ações do utilizador:
- validação instantânea quando apropriado;
- destaque do resultado principal;
- mensagens simples de erro;
- confirmação de ação concluída;
- indicação de estados vazios;
- indicação de indisponibilidade offline quando relevante.

A resposta visual deve reduzir dúvida e retrabalho.

### 12. Definir navegação simples e previsível

A skill deve pedir navegação com baixo esforço mental:
- acesso claro ao início;
- acesso simples às principais ferramentas;
- regressar sem confusão;
- localização fácil do histórico;
- labels explícitas;
- consistência entre ecrãs.

A experiência deve ser fácil de aprender à primeira utilização.

### 13. Definir padrões adequados a PWA mobile

A skill deve alinhar as decisões de UX com boas práticas de PWA:
- rapidez de arranque;
- responsividade;
- continuidade entre páginas;
- funcionamento aceitável em condições imperfeitas;
- foco na tarefa;
- ecrãs que carregam com fluidez.

As referências consultadas destacam rapidez, responsividade e resiliência como elementos centrais de uma boa PWA [web:77][web:1].

### 14. Definir tratamento de estados offline e rede fraca

Quando o contexto o justificar, a skill deve pedir:
- mensagens claras para ausência de rede;
- preservação da navegação principal;
- feedback simples quando algo não puder ser concluído;
- evitar erros técnicos obscuros;
- estados vazios compreensíveis.

Isto é especialmente importante em contexto agrícola no terreno.

### 15. Definir densidade e simplicidade visual

A skill deve sempre favorecer:
- poucos elementos por bloco;
- uso contido de cor;
- cartões simples;
- espaçamento confortável;
- ícones apenas quando ajudam;
- eliminação de ruído visual.

O objetivo é rapidez de interpretação, não decoração.

### 16. Definir ergonomia para uso com uma mão

Sempre que apropriado, a skill deve considerar:
- ações principais ao alcance natural do polegar;
- zonas de toque amplas;
- evitar alvos pequenos no topo em tarefas frequentes;
- redução de passos repetitivos;
- fluxos de decisão simples.

### 17. Definir adequação ao contexto agrícola

A skill deve obrigar a adaptar o desenho ao vocabulário e contexto real do utilizador agrícola:
- linguagem em português de Portugal;
- termos técnicos agrícolas corretos;
- resultados rápidos;
- labels conhecidas do setor;
- uso de unidades claras;
- apoio a cenários reais de campo.

### 18. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompts de UX mobile-first para v0.dev;
- requisitos de desenho para Cursor AI;
- listas de verificação para revisão de ecrãs;
- critérios de melhoria de formulários;
- regras de adaptação de desktop para smartphone;
- recomendações de legibilidade e toque para ecrãs agrícolas.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- clara;
- direta;
- orientada a execução;
- pronta para colar noutra IA ou aplicar como checklist;
- sem código na resposta principal;
- centrada em experiência de smartphone e terreno.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não desenhar como se o dispositivo principal fosse desktop.
- Não usar layouts complexos de múltiplas colunas em smartphone.
- Não criar formulários longos e pesados sem necessidade.
- Não usar botões pequenos.
- Não sacrificar legibilidade por estética.
- Não depender de hover como interação principal.
- Não criar navegação confusa.
- Não usar texto excessivamente pequeno.
- Não sobrecarregar o utilizador com demasiadas escolhas no mesmo ecrã.
- Não usar linguagem técnica obscura para o utilizador final.
- Não esquecer o contexto de luz exterior e uso rápido.
- Não esquecer estados offline ou de rede fraca quando relevantes.
- Não transformar o ecrã num painel visualmente denso.
- Não misturar esta skill com backend ou lógica de base de dados.

A prioridade é sempre velocidade de uso, clareza, toque fácil e robustez para contexto agrícola real.

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Calculadora agrícola em smartphone

Quero que redesenhes este ecrã da DATERRA Smart 2 como uma experiência verdadeiramente mobile-first para smartphone e uso agrícola no terreno. O objetivo é permitir preenchimento rápido de uma calculadora agrícola com o mínimo de toques e leitura imediata em exterior. Usa formulário vertical simples, labels curtas, unidades visíveis junto aos campos, cartões simples e botões grandes com ação principal muito clara. A interface deve ter excelente legibilidade, contraste forte, espaçamento confortável e resultados principais destacados logo abaixo dos inputs. Evita qualquer layout denso ou com várias colunas. Quero uma experiência rápida, intuitiva e adequada a utilização com uma mão.

### Exemplo 2 — Ecrã de login e registo para uso em campo

Quero um redesenho mobile-first do ecrã de login e registo da DATERRA Smart 2 para smartphone, com foco em rapidez, clareza e facilidade de toque. Prioriza botões grandes, campos mínimos, labels claras, navegação muito simples e excelente legibilidade em exterior. O utilizador deve perceber em segundos onde iniciar sessão ou criar conta. Evita elementos decorativos excessivos, reduz texto desnecessário e mantém a ação principal sempre evidente. A experiência deve ser leve, direta e sem fricção.

### Exemplo 3 — Histórico com filtros simples

Adapta o ecrã de histórico da DATERRA Smart 2 para uso em smartphone no terreno. Quero uma estrutura vertical clara, cartões grandes e fáceis de tocar, filtros simples e visíveis, pesquisa opcional e leitura rápida dos registos. Cada cartão deve mostrar apenas a informação essencial e permitir abrir detalhe sem confusão. Mantém contraste forte, labels claras, espaçamento confortável e navegação simples para regressar ou mudar de ferramenta. O foco é rapidez de consulta e zero esforço cognitivo desnecessário.

### Exemplo 4 — Checklist de revisão de UX móvel

Cria uma checklist objetiva para rever se um ecrã da DATERRA Smart 2 está realmente preparado para smartphone e uso agrícola em exterior. Quero critérios sobre tamanho dos botões, rapidez do formulário, clareza da ação principal, legibilidade, contraste, organização vertical, estados de erro, uso com uma mão e simplicidade da navegação. Escreve tudo em português de Portugal e com foco em aplicação agrícola usada no terreno.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Faz isto mobile.”
- “Melhora o UX.”
- “Cria um layout responsivo.”
- “Adapta para smartphone.”
- “Deixa isto mais simples.”

Motivo:
- são vagos;
- não definem contexto de uso;
- não definem legibilidade exterior;
- não definem botões grandes;
- não definem formulários rápidos;
- não definem navegação simples;
- não definem uso agrícola real.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido ou checklist pronta a usar, adequada ao objetivo pedido.

Essa saída deve incluir explicitamente, quando aplicável:
- foco em smartphone;
- contexto agrícola no terreno;
- formulários rápidos;
- botões grandes;
- legibilidade em exterior;
- navegação simples;
- organização vertical;
- ação principal evidente;
- feedback imediato;
- robustez em condições móveis reais.

Nunca devolver apenas sugestões genéricas. Nunca tratar o mobile como adaptação secundária. Nunca esquecer o contexto real de utilização em campo.