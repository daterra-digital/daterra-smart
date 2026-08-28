Build the base structure of a new web app called “DATERRA Smart” from scratch. Create a modern, elegant, premium, responsive, mobile-first interface using shadcn/ui and Tailwind CSS. The app must be prepared for multilingual support from the start, with Portuguese (Portugal) as the primary language and English as the secondary language.

Use the official DATERRA visual identity with these colors:
#114037, #1D734B, #3CA64C, #F2F2F2, #0D0D0D, #006633, #3AAA35.

Use only the Roboto font family for the entire interface, including titles, subtitles, body text, labels, buttons, and navigation, because this is a digital platform and the typography must stay fully consistent and highly readable across screens.

The app must have two main experiences:
1. A public landing page.
2. A protected authenticated dashboard that appears only after login.

Public landing page:
- Add a fixed top navigation with only these menu items: Home, About, Academy, Contact, Login.
- Build a premium agricultural hero section with a strong visual hierarchy, a main CTA for Login, and a secondary CTA for Learn More.
- Keep the layout clean, professional, and focused on conversion.
- Add short institutional sections with editable content blocks.
- The About section must be concise and modular, made of editable text blocks that can later be updated from the backend.
- The Academy section must act as a gateway to DATERRA Academy.
- The Contact section must be simple, professional, and ready to show institutional contact information.
- Use placeholders whenever an image is missing. Do not invent final images.
- When an image is needed, show an explicit placeholder with dimensions, for example:
  "Image placeholder: horizontal 16:9, 1600px wide x 900px high"
  or
  "Image placeholder: square 1:1, 1200px x 1200px"

Authentication flow:
- Create a registration/login flow using only these fields:
  First Name, Last Name, Entity, Email.
- Add a button labeled “Send Code” that sends a verification code to the email address.
- After the code is sent, show a verification area with 5 separate input boxes for the code digits.
- Do not ask for a password during registration.
- Password changes will be available later inside a Settings menu in the authenticated area.

Authenticated dashboard:
- Show only after successful login.
- At the top, always display a personalized greeting in the format:
  “Welcome [First Name] [Last Name]”
- Under the greeting, show dashboard cards in this exact order:

1. Meteo card
- This card must be first.
- Show only a visual placeholder for now until an API is connected.
- Reserve space for: city, temperature, feels-like temperature, and a 5-day forecast.
- The card should clearly be labeled “Meteo”.

2. DATERRA / Academy promotional banner
- Create a banner card for DATERRA and the Academy.
- The content will later be managed by the administrator through the backend.
- Make it visually strong and suitable for promotional content.
- It must feel similar in spirit to the Academy DATERRA banner style, but adapted for DATERRA Smart.

3. Most used tools
- Show the list of the most used tools.
- Make this area ready for dynamic data.

4. Tool categories
- Show tool categories in a clean grid or card layout.

5. Final DATERRA Smart banner
- Add a final banner dedicated to DATERRA Smart.
- It should be designed as an institutional brand banner, inspired by the visual language of the Academy DATERRA, but created specifically for DATERRA Smart.
- Include a CTA and space for a strong brand message.

General UI requirements:
- Keep the design elegant, functional, and coherent with a premium agricultural platform.
- Make the layout ready for future backend data, including user content, tools, categories, images, banners, and promotional text.
- Use clean spacing, clear typography, rounded cards, subtle shadows, and strong visual hierarchy.
- Do not create complex animations.
- Do not use fragile visual libraries.
- Ensure the interface is fully responsive.

Important:
- Whenever an image is required but not available, leave a visible placeholder with the exact required format and size.
- Build the app structure from scratch, not as a small component.
- The result should include the public landing page, authentication flow, and protected dashboard layout.

------
---
name: agri-content-library-builder
description: Gera prompts completos para organizar bibliotecas técnicas, glossários e fichas de apoio da PWA DATERRA Smart 2 por cultura, praga, doença, equipamento, operação, unidade ou tema agrícola, com foco em estrutura clara, consulta rápida em smartphone, navegação simples, pesquisa, filtros e possibilidade de uso progressivo em contexto PWA. Use quando o pedido mencionar biblioteca técnica, glossário, ficha de apoio, cultura, praga, doença, equipamento, unidade, catálogo técnico, consulta, pesquisa, filtros, conteúdo agrícola ou organização de conhecimento.
version: 1.0.0
triggers:
  - biblioteca técnica
  - glossário
  - ficha de apoio
  - cultura
  - praga
  - doença
  - equipamento
  - unidade
  - catálogo técnico
  - consulta
  - pesquisa
  - filtros
  - conteúdo agrícola
  - conhecimento
  - fichas
  - base técnica
  - referência
  - apoio técnico
---

# agri-content-library-builder

## Contexto

Esta skill existe para gerar prompts e requisitos de estrutura para bibliotecas técnicas, glossários e fichas de apoio da PWA DATERRA Smart 2.

O objetivo é ajudar a transformar conteúdos agrícolas dispersos em bibliotecas digitais organizadas, fáceis de consultar em smartphone, úteis em campo e coerentes com uma arquitetura PWA progressiva.

As referências consultadas explicam que uma PWA bem construída pode ser instalável, funcionar offline em cenários adequados e melhorar progressivamente a experiência do utilizador [page:1]. Isto é particularmente relevante para bibliotecas técnicas agrícolas, porque parte dos conteúdos pode precisar de consulta rápida em locais com rede fraca ou ausência temporária de internet [page:1]. A MDN também refere que o manifest permite acesso mais rápido a partir do ecrã inicial do dispositivo, o que reforça a utilidade de uma biblioteca técnica integrada numa app instalável [page:1].

No contexto DATERRA Smart 2, esta skill deve apoiar a organização de:
- bibliotecas por cultura;
- bibliotecas por praga ou doença;
- bibliotecas por equipamento;
- glossários por termo técnico;
- fichas por unidade de medida;
- fichas rápidas de apoio à decisão;
- estruturas de pesquisa e filtros;
- organização de conteúdos para consulta mobile-first.

A skill não inventa conteúdo técnico agrícola. Apenas organiza e estrutura o conteúdo fornecido ou validado noutra etapa.

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt ou plano de organização.

### 1. Ler e interpretar o objetivo da biblioteca

Antes de produzir a saída final, identifica:
- se o utilizador quer uma biblioteca técnica;
- se quer um glossário;
- se quer fichas rápidas;
- se o conteúdo será consultado em smartphone;
- se a organização principal é por cultura, praga, doença, equipamento, unidade ou outro critério;
- se o objetivo é consulta rápida, estudo, apoio à decisão ou arquivo técnico;
- se os conteúdos já existem ou ainda vão ser recolhidos;
- se a biblioteca precisa de pesquisa, filtros, favoritos ou offline parcial.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Classificar o tipo de biblioteca

Classifica o pedido numa destas categorias:
- biblioteca por cultura;
- biblioteca por praga;
- biblioteca por doença;
- biblioteca por equipamento;
- glossário técnico agrícola;
- biblioteca por unidade de medida;
- fichas rápidas operacionais;
- biblioteca híbrida com várias taxonomias;
- base de conhecimento agrícola para consulta em campo.

### 3. Definir o objetivo funcional da biblioteca

A skill deve sempre identificar a função principal da estrutura pedida:
- consulta rápida;
- apoio técnico em campo;
- aprendizagem;
- normalização de vocabulário;
- apoio a cálculo e decisão;
- navegação entre temas relacionados;
- preservação de conhecimento técnico.

A estrutura final deve servir essa função com clareza.

### 4. Definir a lógica de organização principal

A skill deve obrigar o prompt a escolher uma lógica dominante de organização.

As opções mais adequadas à DATERRA Smart 2 são:
- por cultura;
- por praga;
- por doença;
- por equipamento;
- por operação;
- por unidade;
- por tema técnico;
- por tipo de conteúdo.

A skill deve evitar estruturas caóticas ou misturas sem hierarquia.

### 5. Definir taxonomias e categorias

Sempre que a biblioteca tiver vários níveis, a skill deve orientar para categorias simples e previsíveis.

Exemplos:
- Cultura > Problemas > Pragas;
- Equipamento > Tipo > Componentes;
- Unidade > Definição > Conversões;
- Glossário > Termo > Definição > Aplicação prática.

A navegação deve ser fácil de entender à primeira vista.

### 6. Definir estrutura mínima de cada ficha

A skill deve obrigar o prompt final a padronizar as fichas técnicas.

Cada ficha deve ter, quando aplicável:
- título claro;
- categoria principal;
- subtipo ou etiqueta;
- descrição curta;
- explicação principal;
- pontos-chave;
- notas de uso;
- termos relacionados;
- unidade ou contexto associado;
- aviso de validação técnica, quando necessário.

A skill não deve permitir fichas desiguais e inconsistentes sem critério.

### 7. Definir estrutura mínima de glossário

Se o pedido for glossário, a skill deve orientar para uma estrutura como:
- termo;
- definição simples;
- contexto agrícola;
- sinónimos ou variantes;
- unidade ou operação relacionada;
- ligação a fichas ou ferramentas relevantes.

O objetivo é reduzir ambiguidade e padronizar linguagem agrícola em português de Portugal.

### 8. Definir fichas rápidas para uso em campo

Sempre que a biblioteca for usada no terreno, a skill deve favorecer fichas de leitura rápida com:
- título muito claro;
- resumo no topo;
- blocos curtos;
- destaque para o essencial;
- linguagem direta;
- navegação rápida para tema relacionado.

A experiência deve ser útil mesmo com leitura apressada.

### 9. Definir pesquisa e filtros

A skill deve recomendar pesquisa e filtros quando fizer sentido.

Filtros possíveis:
- cultura;
- praga;
- doença;
- equipamento;
- unidade;
- categoria;
- nível de detalhe;
- uso frequente.

A pesquisa deve privilegiar termos simples, sinónimos úteis e resultados fáceis de abrir.

### 10. Definir relações entre conteúdos

A skill deve pedir que a biblioteca tenha ligações úteis entre conteúdos relacionados, por exemplo:
- uma praga ligada à cultura afetada;
- um equipamento ligado às unidades e calibrações relevantes;
- um termo do glossário ligado a uma calculadora;
- uma ficha técnica ligada a conteúdos relacionados.

Isto melhora a utilidade da biblioteca e reduz navegação perdida.

### 11. Definir prioridade mobile-first

A skill deve assumir sempre que a biblioteca será consultada sobretudo em smartphone.

Por isso, deve pedir:
- listas simples;
- cartões claros;
- títulos curtos;
- pesquisa fácil de usar;
- filtros simples;
- poucos níveis por ecrã;
- legibilidade em exterior;
- estrutura vertical.

### 12. Definir comportamento progressivo em PWA

A skill deve alinhar a organização da biblioteca com princípios PWA:
- acesso rápido;
- navegação clara;
- melhoria progressiva;
- possibilidade de cache de conteúdos essenciais;
- consulta útil mesmo em condições móveis imperfeitas.

As fontes consultadas explicam que a experiência PWA deve ser progressiva e resiliente, mantendo funcionalidade base sempre que possível [page:1].

### 13. Definir offline útil mas controlado

Quando fizer sentido, a skill deve pedir:
- cache apenas de conteúdos essenciais;
- possibilidade de guardar localmente bibliotecas críticas;
- fallback claro quando um conteúdo não estiver disponível offline;
- não prometer offline total de todos os conteúdos sem estratégia real.

As referências consultadas reforçam que as PWAs podem funcionar offline, mas essa capacidade depende de implementação adequada com service worker e estratégia progressiva [page:1].

### 14. Definir navegação entre níveis

A skill deve obrigar o prompt a manter navegação previsível entre:
- lista geral;
- categoria;
- subcategoria;
- ficha individual;
- conteúdo relacionado.

O utilizador deve saber sempre onde está e como voltar atrás sem esforço.

### 15. Definir consistência editorial

A skill deve pedir consistência em:
- títulos;
- labels;
- estrutura dos blocos;
- profundidade de detalhe;
- vocabulário agrícola;
- unidades;
- tom explicativo.

Isto é essencial para que a biblioteca pareça uma ferramenta técnica coesa e não uma coleção de notas soltas.

### 16. Definir integração com outras ferramentas DATERRA

Sempre que relevante, a skill deve pedir ligação contextual entre a biblioteca e:
- calculadoras;
- glossário;
- histórico;
- módulos de apoio;
- fichas relacionadas.

Por exemplo:
- ficha de unidade ligada a calculadora de conversão;
- ficha de bico ligada a calculadora de calibração;
- termo técnico ligado a biblioteca de apoio.

### 17. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompts para estruturar bibliotecas técnicas;
- prompts para organizar glossários;
- esquemas de categorias;
- modelos de ficha técnica;
- regras de pesquisa e filtro;
- listas de verificação para revisão de bibliotecas;
- orientações para conteúdos essenciais offline.

### 18. Definir linguagem e tom

A saída final deve:
- usar português de Portugal;
- respeitar vocabulário técnico agrícola;
- ser clara e organizada;
- evitar jargão desnecessário;
- ser adequada a utilizadores não programadores;
- manter foco em utilidade prática.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para colar noutra IA ou usar como guia de estrutura;
- sem código como resposta principal;
- clara;
- operacional;
- orientada à organização real dos conteúdos.

## Restrições

A skill deve respeitar rigorosamente estas restrições:
- Não inventar conteúdo técnico agrícola.
- Não inventar definições sem validação.
- Não misturar categorias sem lógica clara.
- Não criar bibliotecas confusas ou excessivamente profundas.
- Não tratar smartphone como adaptação secundária.
- Não esquecer pesquisa e filtros quando forem necessários.
- Não prometer offline total sem estratégia real.
- Não usar linguagem brasileira quando existir equivalente técnico em português de Portugal.
- Não criar fichas com estruturas incoerentes entre si.
- Não transformar o conteúdo em textos longos difíceis de consultar no terreno.
- Não esquecer relações entre conteúdos quando elas forem úteis.
- Não misturar backend com esta skill.
- Não gerar prompts vagos como “organiza esta biblioteca”.

A prioridade é sempre clareza estrutural, consulta rápida e utilidade técnica real.

## Exemplos de Prompt de Saída

### Exemplo 1 — Biblioteca por cultura

Quero que organizes uma biblioteca técnica da DATERRA Smart 2 por cultura, pensada para consulta rápida em smartphone. Estrutura o conteúdo por cultura principal e, dentro de cada cultura, separa subsecções como pragas, doenças, operações, equipamentos relevantes e notas técnicas. Cada ficha deve ter título claro, resumo curto, explicação principal, pontos-chave e ligações a conteúdos relacionados. A navegação deve ser simples, vertical, mobile-first, com pesquisa e filtros por cultura e tipo de conteúdo. Mantém a estrutura clara, legível em exterior e adequada a consulta rápida em campo.

### Exemplo 2 — Glossário agrícola

Quero que cries a estrutura de um glossário técnico agrícola para a DATERRA Smart 2. Organiza cada entrada com termo, definição simples, contexto de uso, unidade ou operação relacionada, sinónimos úteis e ligação a ferramentas ou fichas relevantes. O glossário deve ser fácil de pesquisar em smartphone, com resultados rápidos e linguagem em português de Portugal. Mantém consistência editorial e evita definições longas ou pouco práticas.

### Exemplo 3 — Biblioteca por equipamento e unidade

Quero que organizes uma biblioteca técnica por equipamento e unidade de medida para a DATERRA Smart 2. Estrutura primeiro por tipo de equipamento e cria fichas padronizadas com descrição, componentes principais, situações de uso, unidades associadas e relações com calculadoras da app. Na área de unidades, cria fichas curtas com definição, contexto de aplicação, conversões relacionadas e ligação a ferramentas relevantes. A experiência deve ser mobile-first, com filtros simples, cartões claros e leitura rápida no terreno.

### Exemplo 4 — Fichas rápidas com offline parcial

Quero que prepares uma biblioteca de fichas rápidas para apoio técnico no terreno dentro da DATERRA Smart 2. Organiza as fichas por tema agrícola e identifica quais devem estar disponíveis em cache para consulta essencial offline. Mantém a navegação simples, com lista geral, categorias e ficha individual. Cada ficha deve ter título claro, resumo de topo, pontos-chave e relações com conteúdos semelhantes. Não prometas offline total, mas garante que os conteúdos críticos possam ser consultados sem rede quando isso fizer sentido.

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Organiza esta biblioteca.”
- “Faz um glossário agrícola.”
- “Cria fichas técnicas.”
- “Monta uma base de conhecimento.”
- “Agrupa estes conteúdos.”

Motivo:
- são vagos;
- não definem taxonomia;
- não definem estrutura de ficha;
- não definem pesquisa nem filtros;
- não definem prioridade mobile;
- não definem uso prático em campo.

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido ou uma estrutura operacional pronta a usar.

Essa saída deve incluir explicitamente, quando aplicável:
- tipo de biblioteca;
- lógica de organização principal;
- categorias e subcategorias;
- estrutura mínima das fichas;
- regras de glossário, se existirem;
- pesquisa;
- filtros;
- relações entre conteúdos;
- prioridade mobile-first;
- eventual offline parcial útil;
- integração com outras ferramentas DATERRA Smart 2.

Nunca devolver apenas ideias soltas. Nunca inventar conteúdo agrícola. Nunca esquecer que a biblioteca deve ser útil em smartphone e em contexto real de consulta.

-----
---
name: agri-formula-validator
description: Valida fórmulas agrícolas, normaliza variáveis agronómicas, identifica ambiguidades técnicas e transforma conteúdo bruto em lógica matemática pronta para implementação na DATERRA Smart 2.
version: 1.0.0
triggers:
  - fórmula agrícola
  - calibração
  - dose
  - doses
  - volume
  - calda
  - lwa
  - trv
  - pulverização
  - bicos
  - débito
  - hectare
  - validação agronómica
  - pesticida
  - atomizador
  - drone agrícola
---

# Contexto

Esta skill foi criada para o ecossistema DATERRA Smart 2.0 e serve como camada de validação lógica, matemática e terminológica para calculadoras agrícolas, módulos de calibração, preparação de calda, análise de risco, custos operacionais e integração de APIs técnicas.

A função principal desta skill é transformar conteúdo técnico bruto, fórmulas recolhidas pelo utilizador ou apontamentos provenientes do NotebookLM em variáveis simples, consistentes e prontas para implementação visual no v0.dev e lógica no Cursor AI.

A skill deve atuar sempre com postura anti-alucinação. Nunca deve inventar fórmulas, unidades, coeficientes, limites ou relações agronómicas quando esses dados não estiverem explicitamente presentes. Quando houver ambiguidades, conflitos entre fontes ou dados incompletos, deve assinalá-los de forma explícita.

O vocabulário deve respeitar português de Portugal e terminologia agrícola técnica do projeto DATERRA, privilegiando termos como calda, débito, bicos, entrelinha, hectare, copa, parede foliar, largura de faixa e dose.

# Instruções de Execução

Quando esta skill for ativada, seguir sempre esta ordem de trabalho:

1. Identificar o objetivo técnico do pedido do utilizador.
2. Extrair todas as variáveis mencionadas no pedido, mantendo os nomes originais e anotando sinónimos encontrados.
3. Confirmar unidades, limites, regras de divisores e dependências entre variáveis.
4. Verificar se a fórmula está completa, se é computável e se as unidades são coerentes.
5. Assinalar ambiguidades, conflitos de nomenclatura, lacunas dimensionais ou dependência de dados de campo.
6. Reescrever a lógica final de forma simples, pronta para implementação por outra IA.
7. Se o utilizador pedir uma nova calculadora ou ecrã, devolver a resposta em 3 passos: validação matemática, prompt para v0.dev e prompt para Cursor AI.

Formato de resposta preferencial desta skill:

- Nome da fórmula ou módulo
- Objetivo
- Variáveis de entrada
- Unidades
- Fórmula limpa
- Regras de validação
- Limites
- Ambiguidades ou dados em falta
- Saída pronta para implementação

Se o conteúdo estiver incompleto, a skill deve responder com uma destas classificações:

- VALIDADA: quando a fórmula está completa, coerente e pronta para implementação.
- VALIDADA COM RESSALVAS: quando a fórmula pode ser usada, mas existem ambiguidades ou cuidados de implementação.
- INCOMPLETA: quando faltam dados essenciais, unidades, fatores de conversão ou estrutura algébrica suficiente.

Quando o pedido envolver APIs, a skill deve organizar a informação sempre por:

- Nome da API
- Objetivo prático
- Caso de uso na DATERRA Smart 2
- Método de autenticação
- Endpoints principais
- Parâmetros obrigatórios
- Parâmetros opcionais
- Formato de resposta
- Campos devolvidos
- Limites e restrições
- Regras de validação
- Possíveis erros de integração
- Exemplo completo
- Ambiguidades / dados em falta
- STATUS

# Restrições

- Nunca inventar fórmulas agrícolas.
- Nunca completar automaticamente unidades ou fatores de conversão não fornecidos.
- Nunca esconder ambiguidades entre fontes.
- Nunca assumir que dois símbolos diferentes significam a mesma variável sem o declarar.
- Nunca converter uma fórmula incompleta em lógica final sem marcar o estado como INCOMPLETA ou VALIDADA COM RESSALVAS.
- Nunca trocar terminologia técnica agrícola pt-PT por variantes brasileiras ou inglesas quando existir termo técnico adequado em português de Portugal.
- Nunca propor implementação backend final sem antes decompor a fórmula em variáveis e regras de validação.

# Exemplos de Prompt de Saída

## Exemplo 1

Entrada do utilizador:
"Valide esta fórmula de LWA para a vinha e diga-me as variáveis certas."

Saída esperada da skill:

- Nome: Área de Parede Foliar
- Objetivo: calcular a área vertical de folhagem tratada por hectare.
- Variáveis: h ou tCH = altura da vegetação tratada; r ou Ww = distância entrelinha.
- Fórmula limpa: LWA = (h x 2 x 10000) / r
- Regras: r deve ser maior que zero.
- Limites: 0.5 < h < 6.0; 1.5 < r < 10.0
- Estado: VALIDADA COM RESSALVAS
- Ressalva: existe multiplicidade de símbolos para a distância entrelinha.

## Exemplo 2

Entrada do utilizador:
"Transforma esta recomendação em lógica pronta para o Cursor AI."

Saída esperada da skill:

- Variáveis de entrada bem definidas
- Fórmula limpa e isolada
- Regras de arredondamento
- Validação de divisores
- Mensagens de erro sugeridas
- Lista explícita de ambiguidades
- Estado final da fórmula

## Exemplo 3

Entrada do utilizador:
"Quero saber se esta API já pode ser integrada na DATERRA."

Saída esperada da skill:

- Estrutura técnica organizada por autenticação, endpoints, parâmetros, resposta e erros
- Marcação de campos em falta
- Classificação final: VALIDADA, VALIDADA COM RESSALVAS ou INCOMPLETA

# Base de Conhecimento Técnica

## Módulo 1: Geometria da Cultura e Expressão de Dose (Norma EPPO PP 1/239)

### 1. Área de Parede Foliar (LWA - Leaf Wall Area)
Nome: Área de Parede Foliar  
Objetivo: Calcular a área vertical de folhagem tratada por hectare, assumindo o tratamento de ambas as faces da linha da cultura.  
Variáveis: h ou tCH (Altura da vegetação tratada); r ou Ww (Distância entrelinha).  
Unidades: h (m); r (m); LWA (m2 LWA/ha)  
Fórmula: LWA = (h x 2 x 10000) / r  
Regras: O divisor (r) não pode ser zero e o resultado deve ser apresentado como número inteiro.  
Limites: 0.5 < h < 6.0; 1.5 < r < 10.0  
Exemplo: h = 3.5; r = 4.0; LWA =  (3.5 x 2 x 10000) / 4.0 = 17500 m2 LWA/ha  
Ambiguidades: Multiplicidade de símbolos entre as fontes para a mesma métrica (ex: a distância entrelinha é referida como r, Ww ou R).

### 2. Volume de Copa (TRV - Tree Row Volume)
Nome: Volume de Copa  
Objetivo: Calcular o volume tridimensional em metros cúbicos ocupado pela vegetação por hectare.  
Variáveis: h (Altura da copa); w (Largura média da copa); r (Distância entrelinha).  
Unidades: h (m); w (m); r (m); TRV (m3 TRV/ha)  
Fórmula: TRV = (h x w x 10000) / r  
Regras: O divisor (r) não pode ser zero e o valor deve ter no máximo uma casa décimal.  
Limites: 0.5 < h < 6.0; 0.2 < w < 5.0; 1.5 < r < 10.0  
Exemplo: h = 3.5; w = 0.7; r = 4.0. TRV = (3.5 x 0.7 x 10000) / 4.0 = 6125 m3 TRV/ha  
Ambiguidades: Nenhuma identificada além da nomenclatura variável das letras.

### 3. Conversão de Concentração para Dose de Área de Superfície (D_GA)
Nome: Dose por Área de Superfície  
Objetivo: Determinar a dose absoluta por área de superfície a partir da recomendação de concentração de calda indicada no rótulo.  
Variáveis: D_hl (Concentração do pesticida); V (Volume de Calda).  
Unidades: D_hl (%); V (L/ha); DGA (L_ai/ha ou kg/ha)  
Fórmula: D_GA = (D_hl x V) / 100  
Regras: V não pode ser zero e a saída exige precisão de duas a três casas decimais.  
Limites: Específico para cálculos a partir da concentração em percentagem.  
Exemplo: D_hl = 0.23, V = 600. D_GA = (0.23 x 600) / 100 = 1.38 L_ai/ha  
Ambiguidades: A concentração (D_hl) apresenta-se por vezes em g/hl, o que invalida a divisão estrita por 100 descrita para a percentagem sem ajuste prévio de unidades.

### 4. Conversão de Área de Superficie para Parede Foliar (D_LWA)
Nome: Dose de Parede Foliar  
Objetivo: Normalizar a dose 2D para a unidade padrão EPPO de 10.000 m2 de parede foliar.  
Variáveis: D_GA (Dose por área de superfície); LWA (Área de parede foliar).  
Unidades: D_GA (L_ai/ha ou kg/ha); LWA (m2 LWA/ha); D_LWA (L_ai/10.000 m2 LWA)  
Fórmula: D_LWA = (D_GA x 10000) / LWA  
Regras: LWA > 0, exigindo 2 a 3 casas decimais de precisão  
Limites: N/A  
Exemplo: D_GA = 1.38; LWA = 17500. D_LWA = (1.38 x 10000) / 17500 = 0.78 L_ai/10.000 m2 LWA

### 5. Conversão de Parede Foliar para Volume de Copa (D_TRV)
Nome: Dose de Volume de Copa  
Objetivo: Transitar a recomendação de superfície foliar para o volume tridimensional exato da árvore.  
Variáveis: D_LWA (Quantidade de pesticida por LWA); w (Largura média da copa).  
Unidades: D_LWA (L_ai / 10.000 m2 LWA); w (m); D_TRV (L_ai / 10.000 m3 TRV)  
Fórmula: D_TRV = (D_LWA x 2) / w  
Regras: w > 0, com 2 a 3 casas decimias.  
Limites: 0.2 < w < 5.0  
Exemplo: D_LWA = 0.78; w = 0.7. D_TRV = (0.78 x 2) / 0.7 = 2.22 L_ai/10.000 m3 TRV  
Ambiguidades: O arredondamento do passo anterior (D_LWA) afeta este cálculo (0.788 x 2 / 0.7 = 2.55, mas o documento cita o exemplo como 2.22)

### 6. Conversão de Dose Volume de Copa para Concentração (D_hl)
Nome: Concentração da Calda  
Objetivo: Devolver a percentagem exata de produto a adicionar ao depósito, ajustada ao volume real da copa e água usada.  
Variáveis: D_TRV (Dose de Volume de Copa); TRV (Volume de Copa); V (Volume de Calda)  
Unidades: D_TRV (L_ai / 10.000 m3); TRV (m3/ha); V (L/ha); D_hl (%)  
Fórmula: D_hl = (D_TRV x TRV x 100) / (V x 10000)  
Regras: V > 0.  
Limites: N/A  
Exemplo: D_TRV = 2.22; TRV = 6125; V = 600. D_hl = (2.22 x 6125 x 100) / (600 x 10000) = 0.226% (Aprox. 0.23%)  
Ambiguidade: Nenhuma

## Módulo 2: Calibração Hidráulica e Aeronáutica

### 7. Aferição da Velocidade Real de Trabalho (v)
Nome: Velocidade Real de Trabalho  
Objetivo: Calcular a velocidade real da máquina no campo para validar e corrigir as possíveis imprecisões do painel do trator.  
Variáveis: d (Distância do percurso); t (Tempo necessário para percorrer a distância do percurso).  
Unidades: d (m); t (s); v (km/h)  
Fórmula: v = (3.6 x d) / t  
Regras: t deve ser maior que 0  
Limites: Para drones, a velocidade não deve exceder 13 a 15 m/s (risco de quebra da aerodinâmica downwash)  
Exemplo: Cálculo demonstrativo d = 100, t = 45. v = (3.6 x 100) / 45 = 8.0 km/h  
Ambiguidades: Nenhuma

### 8. Volume de Calda Adequado por TRV (Q)
Nome: Volume de Calda Adequado  
Objetivo: Estimar o volume de calda exigido com base na densidade foliar e na arquitetura volumétrica da copa.  
Variáveis: k (Coeficiente de densidade foliar); W (Largura da copa); H (Altura da Copa); Ww (Distância entrelinha).  
Unidades: k (L/m3); W (m); H (m); Ww (m); Q (L/ha)  
Fórmula: Q = (k x W x H x 10000) / Ww  
Regras: Ww > 0.  
Limites: k oscila tipicamente entre 0.020 e 0.060 L/m3 consoante o estádio fenológico da cultura, a poda e a arquitetura da copa.  
Exemplo: (Cálculo demonstrativo para macieira) k = 0.033, W = 0.7, H = 3.5, Ww = 4.0. Q = (0.033 x 0.7 x 3.5 x 10000) / 4.0 = 202.1 L/ha  
Ambiguidades: Volume por vezes notado como V em calibrações terrestres gerais e como Q em modelos avançados TRV.

### 9. Débito Total do Pulverizador Terrestre (Qt)
Nome: Débito Total do Pulverizador  
Objetivo: Determinar o débito contínuo do pulverizador necessário por hectare.  
Variáveis: Q ou V (Volume de Calda); Ww ou R (Largura de trabalho ou entrelinha); v (Velocidade de trabalho)  
Unidades: Q (L/ha); Ww (m); v (km/h); Qt (L/min)  
Fórmula: Q_t = (Q x Ww x v) / 600  
Regras: 600 é uma constante fixa de conversão de unidades.  
Limites: N/A  
Exemplo: Q = 300, Ww = 24, v = 8.0. Qt = (300 x 24 x 8) / 600 = 96 L/min  
Ambiguidades: "Largura de trabalho" pode referir-se à largura total da barra horizontal (culturas baixas), à distância entre bicos em barras horizontais - neste caso o resultado final é o débito do bico de pulverização também em L/min (culturas baixas) ou à distância entrelinhas em culturas 3D.

### 10. Débito Unitário por Bico (Qn)
Nome: Débito Unitário por Bico  
Objetivo: Calcular o débito individual por bico para identificar a cor do bico ISO ou outro na tabela do fabricante.  
Variáveis: Qt (L/min); nBicos (Número total de bicos abertos)  
Fórmula: Q_n = Q_t / nBicos  
Regras: O número de bicos não pode ser zero. Esta fórmula apenas faz sentido para culturas cuja arquitetura da copa é semelhante a uma parede de folha como é o caso da vinha, isto porque, cada bico irá ter o mesmo débito, significando que cada bico é responsável por a mesma quantidade de folha.  
Limites: Em pulverizadores pneumáticos (atomizadores) com secções diferenciadas ou em culturas 3D com arquiteturas de copa como vazos, eixos revestidos entre outros como se verifica em fruteiras, deve calcular-se de forma ponderada (soma do débito por bico = débito total)  
Exemplo: Qt = 96, nBicos = 48. Q_n = 96 / 48 = 2.0 L/min  
Ambiguidades: Nenhuma

### 11. Débito Total para Drones (Q_drone)
Nome: Débito Total para Drones  
Objetivo: Calcular o débito exigido à bomba do drone substituindo os bicos/barra pela faixa aerodinâmica (Swath Width).  
Variáveis: V (Volume pretendido); v_drone (Velocidade do drone); S_width (Largura da faixa)  
Unidades: V (L/ha); v_drone (km/h); S_width (m); Q_drone (L/min)  
Fórmula: Q_drone = (V x v_drone x S_width) / 600  
Regras: N/A  
Limites: Velocidade > 13 a 15 m/s invalida o cálculo aerodinâmico.  
Exemplo: (Cálculo demonstrativo) V = 30, v_drone = 15 km/h, S_width = 4. Q_drone = (30 x 15 x 4) / 600 = 3.0 L/min  
Ambiguidades: Nos drones, algumas referências cruzam as métricas em m/s na teoria, o que obriga a converter para km/h no algoritmo.

### 12. Swath Width (Validação de Aerodinâmica de Drones)
Nome: Largura de Faixa Efetiva de Drones (Swath Width)  
Objetivo: Validar em campo a largura útil pulverizada onde a deposição hídrica da calda se mantém aceitável.  
Variáveis: Densidade de gotas medidas em papel hidrossensível (WPS).  
Unidades: Densidade em gotas/cm2 e Distância em metros (m).  
Fórmula matemática (inequação lógica): S_width = Distância total onde Densidade de Gotas >= (0.5 x Densidade Média Central).  
Regras: Requer análise real ou simulação de papéis hidrossensíveis WSP no terreno ( módulo de Visão por computador)  
Limites: INCOMPLETA como álgebra pura (depende de matriz de dados de campo)  
Exemplo: Se no centro se medem 60 gotas/cm2, a faixa efetiva termina nos metros laterais em que se detetem 30 gotas/cm2.  
Ambiguidades: Não constitui um algoritmo algébrico de backend contínuo, mas um validor de array de distribuição espacial.

## Módulo 3: Preparação da Calda no Tanque

### 13. Quantidade de Pesticida através da Dose
Nome: Quantidade de Pesticida (por Dose)  
Objetivo: Calcular a quantidade absoluta de produto a colocar no depósito do pulverizador com base na dose/ha registada no rótulo.  
Variáveis: C_d (Capacidade do depósito); D (Dose); V (Volume de Calda).  
Unidades: C_d (L); D (L/ha ou kg/ha); V (L/ha); Q_p (ml ou g) - Quantidade de pesticida por depósito.  
Fórmula: Q_p = (C_d x D x 1000) / V  
Regras: O volume de calda e a capacidade do depósito devem ser maiores que 0  
Limites: O multiplicador 1000 converte diretamente de kg/L para g/ml  
Exemplo: C_d = 800 L, D = 3 L/ha, V = 300 L/ha. Q_p = (800 x 3 x 1000) / 300 = 8000 ml (8 L)  
Ambiguidades: Nenhuma

### 14. Quantidade de Pesticida através da Concentração na Fase Inicial
Nome: Quantidade de Pesticida (por Concentração Fase Inicial)  
Objetivo: Calcular a quantidade absoluta de pesticida a colocar no depóstio do pulverizador com base na concentração recomendada para plantas nos estados fenológicos (fases iniciais vegetativas).  
Variáveis: C (Concentração); C_d (Capacidade do depósito)  
Unidades: C (ml/hl ou g/hl); C_d (L); Q_p (ml ou g) - Quantidade de pesticida por depósito  
Fórmula: Q_p = (C x C_d) / 100  
Regras: Divisão por 100 normaliza de hectolitros para os lidtros do depósito.  
Limites: Aplicável preferencialmente no primeiro terço do ciclo das culturas.  
Exemplo: C = 300 g/hl, C_d = 800 L. Q_p = (300 x 800) / 100 = 2400 g (2,4 kg).  
Ambiguidades: Nenhuma

### 15. Quantidade de Pesticida através da Concentração em Pleno Desenvolvimento
Nome:Quantidade de Pesticida (por Concentração Pleno Desenvolvimento)  
Objetivo: Calcular a quantidade absoluta de pesticida a colocar no depósito do pulverizador com base na concentração recomendada para plantas nos estados fenológicos em pleno desenvolvimento (copa adulta).  
Variáveis: C_d (Capacidade do depósito); C (Concentração); V_r (Volume Recomendado); V_a (Volume Aplicado)  
Unidades: C_d (L); C (ml/hl ou g/hl); V_r (L/ha); V_a (L/ha); Q_p (ml ou g) - Quantidade de pesticida por depósito  
Fórmula: Q_p = (C_d x C x V_r) / (V_a x 100)  
Regras: O volume aplicado deve ser superior a zero.  
Limites: Ferramenta crítica de compensação (aumenta a proporção de pesticida no depósito se faltar água na máquina)  
Exemplo: C_d = 800 L; C = 300 g/hl; V_r = 1000 L/ha; V_a = 300 L/ha. Q_p = (800 x 300 x 1000) / (300 x 100) = 8000 g (8 kg)  
Ambiguidades: Nenhuma

## Módulo 4: Segurança, Ambiente e Custos

### 16. Índice de Lixiviação de GUS
Nome: Índice Infiltração  
Objetivo: Prever o potencial ecotoxicológico de um químico penetrar no solo e contaminar os lençóis freáticos através do índice de infiltração/lixiviação (GUS - Groundwater Ubiquity Score).  
Variáveis: DT50_solo (Meia-vida da degradação no solo); Koc (Coeficiente de adsorção de carbono orgânico).  
Unidades: DT50_solo (dias); Koc (Sem unidade explicita no texto)  
Fórmula: GUS = log10 (DT50_solo) x (4 - log10 (Koc))  
Regras: As variáveis não podem ser zero ou negativas.  
Limites: Quando GUS > 2.8, emite aviso compulsivo para bloquear a aplicação perante a iminência de chuva.  
Exemplo: (Demonstrativo) DT50 = 30, Koc = 10. GUS = log10(30) x (4 - log10(10)) = 1.477 x (4 - 1)= 4.43 (Classificação: Liviviável).  
Ambiguidades: A unidade métrica do valor "Koc" está omitida nas fontes do projeto.

### 17. Quociente ApisTox de Risco para Polinizadores
Nome: Risco para Polinizadores  
Objetivo: Determinar o perigo de mortalidade para abelhas e emitir restrições operacionais crepusculares.  
Variáveis: D (Dose por hectare); LD50_oral (Dose Letal 50).  
Unidades: D (g/ha ou ml/ha); LD50_oral (μg/abelha); R (Risco)  
Fórmula: R = D / LD50_oral  
Regras: Divisor positivo e superior a zero.  
Limites: Obriga a aplicação pós-pôr do sol se limite for excedido.  
Exemplo: (Demonstrativo) D = 100 g/há; LD50_oral = 5 μg. R = 100 / 5 = 20  
Ambiguidades: INCOMPLETA dimensionalmente nas fontes. O cruzamento direto de g no dividendo e μg no divisor pressupõe que o algoritmo ou os fatores de quociente de conversão absorvem a métrica.

### 18. Modelador Numérico de Deriva
Nome: Determinação Risco de Deriva  
Objetivo: Produzir um valor físico baseado nos fatores aerodinâmicos do equipamento e evaporação termodinâmica da água.  
Variáveis: V_vento, H (Altura), D_gota (Diâmetro da gota), T_ar (Temperatura do ar), RH (Humidade), f_tipo-bico (Mitigador do bico).  
Unidades: Omitidas explicitamente no texto-fonte.  
Fórmula: Deriva_base = (V_vento x H) / D_gota | Deriva_corrigida = Deriva_base x (T_ar / RH) x f_tipo-bico  
Regras: Diâmetro da gota e humidade superior a zero para não anular a equação.  
Limites: Trata-se de um modelo quantitativo abstrato de alerta.  
Exemplo: INCOMPLETO  
Ambiguidades: INCOMPLETA. Faltam unidades de correlação rigorosas (como fator dimensional na humidade ou temperatura) para ser implementado sem ajustes matemáticos intermédios.

### 19. Rendimento de Baterias em Drones (Área por Voo)
Nome: Rendimento de Baterias  
Objetivo: Estimar logisticamente quantos hectares cobre um abastecimento para prever o número de baterias e paragens.  
Variáveis: C_d (Capacidade do depósito do drone); V (Volume de calda)  
Unidades: C_d (L); V (L/ha); A_voo - Área/voo (ha)  
Fórmula: A_voo = C_d / V  
Regras: V não pode ser zero  
Limites: N/A  
Exemplo: (Demonstrativo) C_d = 40 L, V = 20 L/ha. A_voo = 40 / 20 = 2 ha por voo  
Ambiguidades: Nenhuma

### 20. Custo da Operação por Hectare (C_ha)
Nome: Custo da Operação  
Objetivo: Somatório integral de desgaste para formular um orçamento para clientes.  
Variáveis: labor, drone_depr, bat, travel, overhead, Área (A), Margem (m)  
Unidades: Componentes (€ totais); A (ha); Margem (5)  
Fórmula: C_total = labor + drone_depr + bat + travel + overhead | C_ha = C_total / A | P_ha = C_ha x (1 + (m / 100))  
Regras: A área e o custo não podem ser nulos.  
Limites: N/A  
Exemplo: (Demonstrativo) Custos Totais Acumulados = 100 €, Área = 2 ha, Margem = 20%. C_ha = 100 / 2 = 50 €. P_ha = 50 x ( 1 + 0.20) = 60 €/ha  
Ambiguidades: Nenhuma

### 21. Diâmetro Real da Gota por Imagem (WSP)
Nome: Diâmetro Real da Gota  
Objetivo: O algoritmo limpa o efeito espalhado que o líquido cria nos papéis hidrossensíveis na validação da aplicação.  
Variáveis: Diametro_Pixel; Spread Factor  
Unidades: Diametro_Pixel (Píxeis ou micrometros inferidos); Spread Factor (Adimensional)  
Fórmula: Diametro_Real = Diametro_Pixel / Spread_Factor  
Regras: Aplica obrigatoriamente um limite que elimina manchas < 3 píxeis (30 μm) como ruído CCD.  
Limites: O Spread Factor base assume-se como 2.0 caso a marca do cartão seja omitida pelo utilizador.  
Exemplo: (Demonstrativo) Tamanho na matriz = 400 μm, Spread Factor = 2.0. Diametro_Real = 400 / 2.0 = 200 μm originais de bico.  
Ambiguidades: As fontes misturam semanticamente "píxeis" com "micrometros" no dividendo, devendo o desenvolvedor parametrizar a escala via calibração PPI.

## Módulos de APIs

### 1. PI@ntNet API
Nome da API: PI@ntNet API  
Objetivo prático: Fornecer acesso computacional a um motor de inteligência artificial profunda (deep learning) para a identificação visual de espécies botânicas e doenças vegetais.  
Casos de uso na DATERRA Smart 2: Integrada como o motor de inferência fotográfica da ferramenta Premium "SmartTarget AI", atuando no diagnóstico imediato de doenças nas folhas das culturas e na identificação de plantas infestantes.  
Método de autenticação exigido: A Chave de API (API Key) privada tem de ser obrigatoriamente incluída como um parâmetro de consulta (query parameter) na URL do pedido. Para ambientes em navegador (client-side) é obrigatório autorizar previamente os domínios para acesso CORS e, opcionalmente, restringir os endereços IP (IPv4) do servidor que faz o pedido.  
Endpoints principais: Endpoint primário de identificação: POST /v2/identify. Endpoint especializado em patologia: POST /v2/diseases/identify. Endpoint secundário: GET /v2/diseases.  
Parâmetros de entrada obrigatórios: Submissão multipart de até 5 ficheiros de imagem (em formato JPEG ou PNG) em simultâneo, garantindo que todas as imagens num único pedido representam o mesmo indivíduo vegetal. Existe um limite global de peso de 50 MB por requisição POST.  
Parâmetros opcionais: organs (associa cada imagem à componente botânica: leaf, flower, fruit, bark ou auto); lang (define o idioma para os nomes populares e descrições); no-reject (booleano que instrui a não rejeição prévia de imagens com fundos complexos/mãos humanas); nb-results (número máximo de resultados de doenças devolvidos).  
Formato esperado da resposta: JSON  
Campos principais devolvidos: score (grau de probabilidade de acerto do modelo matemático, com valor entre 0 e 1); nomes científicos do patógeno/planta; código oficial da EPPO correlacionado com a doença; indicação da versão atual do modelo de inferência e os créditos diários remanescentes na conta do utilizador.  
Limites e restrições: Cada requisição de identificação de espécie consome 1 crédito. Limite fixo de 50 MB no total dos ficheiros anexados.  
Regras de validação: No tratamento visual, utilizar no-reject=true para forçar a avaliação em fundos que seriam bloqueados. Na reaproveitação de imagens obtidas através da API, é compulsório o cumprimento da licença Creative Commons BY-SA, exigindo o crédito explícito ao autor e à plataforma.  
Possíveis erros de integração: Erros de CORS se o pedido originar de um domínio não pré-cadastrado no painel; bloqueio não autorizado se o IP do servidor diferir da whitelist; erro 404 de espécie não encontrada se existirem fundos ruidosos e a flag no-reject não for invocada.  
Exemplo completo: INCOMPLETO (as fontes apenas referenciam extratos e regras conceptuais, omitindo um log literal com o payload do request e do JSON de retorno).  
Ambiguidades / Dados em falta: Omissão da estrutura exata do corpo JSON da resposta e da árvore de preços dos créditos comerciais.  
STATUS INCOMPLETA

### 2. Plantix API Toolkit (Vision API)
Nome da API: Plantix API Toolkit  
Objetivo prático: Proporcionar o diagnóstico fotográfico instantâneo (em menos de 5 segundos) de mais de 750 doenças, pragas e deficiências nutricionais englobando 50 espécies de culturas.  
Casos de uso na DATERRA Smart 2: Operar como "Agrónomo de Bolso", suportando o diagnóstico, gerando bibliotecas enciclopédicas de apoio e orientando o plano automático de pesticidas ou recomendações nutricionais (fertilizantes) para o agricultor.  
Método de autenticação exigido: Autenticação no cabeçalho HTTP através da passagem de Bearer Token (Authorization: Bearer YOUR_TOKEN).  
Endpoints principais: O servidor live encontra-se em https://api.plantix.net. A API é segmentada nos módulos conceptuais: Crop Health API, Pest and Disease Library API, Treatment Recommendations API e Fertiliser Calculator API.  
Parâmetros de entrada obrigatórios: Submissão fotográfica processada segundo os standards da especificação OpenAPI 3.1.0.  
Parâmetros opcionais: INCOMPLETO.  
Formato esperado da resposta: Suportado na especificação OpenAPI 3.1.0.  
Campos principais devolvidos: Identificação da patologia, dados biológicos multilíngues, orientações de controlo químico baseadas em pesticidas autorizados, dosagens técnicas, planos macro e micronutrientes e práticas de gestão integrada de pragas.  
Limites e restrições: As fontes referem orçamentação à medida para os níveis comerciais. Escala computacional testada em mais de 20 imagens processadas por segundo. Tempo estimado de lançamento da infraestrutura: 4 a 6 semanas.  
Regras de validação: INCOMPLETO.  
Possíveis erros de integração: INCOMPLETO.  
Exemplo completo: INCOMPLETO.  
Ambiguidades / Dados em falta: Não são fornecidos os URLs exatos de cada endpoit interno, não há demonstração de submissões HTTP ou estruturas JSON.  
STATUS INCOMPLETA

### 3. Agrio API (Sailog)
Nome da API: Agrio API  
Objetivo prático: Processar imagens foliares para o diagnóstico de anomalias botânicas e agregar inferências preditivas epidemiológicas através do cruzamento de modelos climáticos e rastreio georreferenciado.  
Casos de uso na DATERRA Smart 2: Complementar a IA fitossanitária e potenciar módulos de alerta preditivo (AgrioShield), notificando os produtores de possíveis frentes de infeção fúngica reportadas nas imediações geográficas com base nas espécies botânicas ali cultivadas.  
Método de autenticação exigido: A Chave de API pode ser injetada de duas formas: através de um cabeçalho HTTP dedicado ou como parâmetro associado no query string do URL (?key=YOUR_API_KEY).  
Endpoints principais: API Gateway documentado em https://agrio-api-gateway-6it0wqn1.uc.gateway.dev/v1.  
Parâmetros de entrada obrigatórios: Envio obrigatório dos ficheiros através do tipo de codificação de formulário multipart/form-data, aceitando exclusivamente extensões JPEG ou PNG.  
Parâmetros opcionais: INCOMPLETO.  
Formato esperado da resposta: JSON.  
Campos principais devolvidos: Resultado com uma validação preliminar do hospedeiro biológico e uma análise previsional exta do patógeno acompanhada de pontuações de confiança (confidence score), detalhando rótulos científicos e informais.  
Limites e restrições: O peso máximo da imagem transmitida restringe-se a 32 MB. O débito no balanço financeiro consiste num rácio estrito de 1 requisição efetiva de predição (doença ou alerta meteorológico) por 1 crédito. Rotinas meramente verificativas são processadas sem custos de rede. Uma subscrição matricial fixa começa nos 100 dólares norte-americanos em troca de 1.000 créditos.  
Regras de validação: O fluxo processa-se em validação bidirecional, devendo o programa ler primeiro o índice de certeza devolvido para a "cultura" antes de avaliar o "patógeno" retornado no JSON.  
Possíveis erros de integração: Bloqueio da chamada caso o peso associado da imagem em base64 ultrapasse o teto de 32 MB.  
Exemplo completo: INCOMPLETO.  
Ambiguidades / Dados em falta: A fonte carece da árvore exata das URLs e não exibe os blocos nativos de código das requisições, retornos JSON integrais e códigos de erro de servidor HTTP.  
STATUS INCOMPLETA

### 4. Agromonitoring (Agro-API)
Nome da API: Agromonitoring (Agro-API)  
Objetivo prático: Agregação integral de dados orbitais via satélite (Sentinel-2, Landsat 8), com fornecimento automatizado de processamentos espetrais, modelação climatológica aprofundada de humidade no solo profundo, precipitação cumulativa e radiação ultravioleta.  
Casos de uso na DATERRA Smart 2: Nutrir algoritmos de vigilância preditiva da lavoura através do cálculo constante de valores numéricos como Graus-Dia de Crescimento (GDD) combinados com declínios no vigor fotossintético (NDVI), disparando alarmes programados sobre o ciclo metamórfico (eclosão) de populações de pragas em fases de suscetibilidade a pesticidas.  
Método de autenticação exigido: INCOMPLETO (Assume-se por chaves criadas por painel Sign in, contudo não há uma menção literal à construção do cabeçalho ou parâmetro URL).  
Endpoints principais: Polygons API ( /api/polygons) que comanda todo o ecossistema posterior. Secundários incluem rotas específicas de dados geoespaciais, nomeadamente /api/images, /api/history-ndvi, /api/current-weather, /api/history-weather, /api/accumulated-temperature, /api/accumulated-precipitation, /api/current-soil, /api/history-soil, e as APIs voltadas ao índice UVI.  
Parâmetros de entrada obrigatórios: Submissão das coordenadas perimetrais delineadas da exploração nos moldes do standard cartográfico GeoJSON. Subsequentemente, o atributo ID do polígno obtido nesta etapa é compulsório em todos os pedidos analíticos sequentes.  
Parâmetros opcionais: INCOMPLETO.  
Formato esperado da resposta: O retorno visual processa blocos raster em formatos PNG e ficheiros escaláveis de georreferenciação em GeoTIFF, emitindo matrizes matemáticas em estatística zonal (arquitetura JSON).  
Campos principais devolvidos: Imagens tratadas com sobreposição de dados espetrais e índices (NDVI, EVI, EVI2, NDWI, DSWI, NRI). Fornece medições de precipitação agregadas, humidade capilar do subsolo, temperatura radicular das plantas (Graus-Dia) e predições horárias num raio temporal de 5 dias englobando ventos e índices de radiação (UVI).  
Limites e restrições: As infraestruturas "Free Account" possuem restrições arquiteturais que vetam expressamente as pesquisas a repositórios temporais de histórica meteorológica e dados retrospectivos de solo agrícola.  
Regras de validação: INCOMPLETO.  
Possíveis erros de integração: INCOMPLETO.  
Exemplo completo: INCOMPLETO.  
Ambiguidades / Dados em falta: Carência de métodos de validação no cabeçalho (headers de autorização), blocos com código e payloads da resposta padronizada JSON.  
STATUS INCOMPLETA.

### 5. EPPO Data Services API (via pestr / eppoFindeR)
Nome da API: EPPO Data Services API  
Objetivo prático: Base global oficial e padronizador do léxico botânico para agências quarentenárias.  
Casos de uso na DATERRA Smart 2: Trata-se do Eixo Regulatório Central: intercepta o output das redes neurais (Agrio ou Pl@ntNet), transcodifica a nomenclatura científica da planta num identificador universal exclusivo (Código EPPO alfa-numérico) e utiliza-o para pesquisar os produtos fitofarmacêuticos legislados pela UE/DGAV.  
Método de autenticação exigido: Utiliza API Token privado. As pesquisas relativas a mapas mundiais biogeográficos dispensam autenticação ou submissão do token nos scripts.  
Endpoints principais: A infraestrutura encontra-se sob o nó https://data.eppo.int/apis/. Em termos lógicos, expõe endpoints classificados nas vertentes eppo_tabletools_cat (avaliações de quarentena), eppo_tabletools_hosts (vínculos planta-patógeno), eppo_tabletools_taxo (hierarquia da família biológica) e eppo_tabletools_distri (regiões invadidas e surtos estaduais).  
Parâmetros de entrada obrigatórios: Submissão dos termos nominais patológicos, dependente de extração num ficheiro banco local relacional formatado em SQLite descarregado nativamente do site da EPPO.  
Parâmetros opcionais: INCOMPLETO.  
Formato esperado da resposta: O pipeline retorna coleções multidimensionais de estruturas matriciais contendo o cruzamento de até quatro tabelas interligadas em listas globais.  
Campos principais devolvidos: Código EPPO gerado univocamente, status da categorização sanitária (Lista A1/A2), sinónimos botânicos desatualizados, vetor primário do surto e coordenadas intercontinentais do problema agrometeorológico.  
Limites e restrições: Serviço gratuito, legislado sob licença europeia Open Data (EUPL-1.2). O acesso ao mapeamento de novos códigos requer taxas de serviço. Acesso programático a transferências do ficheiro SQLite central da instituição deixou de ser autorizado, obrigando ao salvamento em regime manual pelo analista.  
Regras de validação: Validação prévia de nomenclaturas através do banco sqlite (eppo_names_tables) antes de escalar a transação via internet (evita falhas de requests infundados).  
Possíveis erros de integração: Quebra sistemática e paralisação das sub-rotinas dependentes do SQLite se o download no terminal host for descurado pelos desenvolvedores após revogações.  
Exemplo completo: INCOMPLETO.  
Ambiguidades / Dados em falta: A fonte relata a mecânica apenas do lado de bibliotecas R-Studio (como pestr), suprimindo as rotas lógicas HTTP (ex: /api/v1/taxa), a composição das variáveis query e o esqueleto integral JSON.  
STATUS INCOMPLETA

### 6. DG SANTE - EU Pesticides Database API
Nome da API: EU Pesticides Database API / DG SANTE Catalog  
Objetivo prático: Base central europeia com busca em lote de status legal sobre substâncias químicas ativas e fixação matemática dos Limites Máximos de Resíduos (MRLs) em bens de nutrição orgânica e alimentar.  
Casos de uso na DATERRA Smart 2: Avaliação e barreira jurídica em tempo real aquando de uma exportação ou da geração final de receitas agrícolas; bloqueia o receituário do sistema perante componentes banidos em mercado ou em regimes transitórios do SIFITO.  
Método de autenticação exigido: INCOMPLETO (a fonte não evidencia mecanismos, listando a interface com a menção abstrata à máquina API M2M).  
Endpoints principais: Consta na documentação de base europeia em https://developer.datalake.sante.service.ec.europa.eu/api-details#api=016c2aae-ad89-452e-b91f-2f2141a11a4f e as descargas em lote MRL residem em rotas anexas como /backend/api/mrl/download/link?filename=Publication1.xml.  
Parâmetros de entrada obrigatórios: INCOMPLETO.  
Parâmetros opcionais: INCOMPLETO.  
Formato esperado da resposta: O ecossistema exporta volumosas faturas do repositório utilizando blocos estruturados na diretriz XML. Assumem-se fluxos JSON na arquitetura REST paralela.  
Campos principais devolvidos: Aprovação fitossanitária governamental ou cancelamento legislativo, dados diários de expiração e restrições legais cruzadas (MRL) para colheitas europeias ou frutas e vegetais isolados.  
Limites e restrições: Livre de encargos operacionais, no entanto, é sublinhado com extrema cautela o desprovimento completo de validade perante qualquer esfera jurídica (o Diário Oficial retém total superioridade).  
Regras de validação: INCOMPLETO.  
Possíveis erros de integração: INCOMPLETO.  
Exemplo completo: INCOMPLETO.  
Ambiguidades / Dados em falta: A fonte descura a demonstração textual nativa da API, omitindo métodos primários, rotas de filtragem (ex: via Cas Number da substância) e as credenciais.  
STATUS: INCOMPLETA.

### 7. CDSAPI (Copernicus Climate Data Store)
Nome da API: CDSAPI (ECMWF) / CDS-Beta.  
Objetivo prático: Operacionalizar modelos estocásticos com o envio contínuo de grelhas massivas baseadas em observações do planeta por agências espaciais e previsões temporais alargadas (Sazonais, ERA5, ERA5-Land, CERRA, ORAS5).  
Casos de uso na DATERRA Smart 2: Fornecimento analítico do histórico vetorial atmosférico em formulações de deriva de defensivos para drones (velocidade do vento e fatores termodinâmicos).  
Método de autenticação exigido: INCOMPLETO (a API é fechada, mas não há referências específicas nas fontes sobre o formato explícito da chave do portal).  
Endpoints principais: A infraestrutura atravessou um processo dramático de obsolescência forçada com transição em setembro de 2024 para servidores novos denominados logicamente de plataforma CDS-Beta. A fonte do fórum não expõe os identificadores literais das URIs.  
Parâmetros de entrada obrigatórios: INCOMPLETO.  
Parâmetros opcionais: INCOMPLETO.  
Formato esperado da resposta: INCOMPLETO.  
Campos principais devolvidos: Constelações de variáveis do ciclo do clima (nomeadamente as tabelas relativas à extração ERA5 hourly data que traçam radiação e temperatura do ar por passos temporais de hora em hora).  
Limites e restrições: Regras absolutas de sistema barraram a extração de dados: uma única comunicação à API não pode ser superior a 120.000 unidades transacionais ("itens" / "fields") no contexto horário e estagnada nos 10.000 itens para levantamento mensal.  
Regras de validação: O integrador computacional é advertido da álgebra imperiosa de um pedido de grelha que considera a matriz dimensional: 1 item/field = 1 variável * 1 nível de profundidade/altitude * 1 unidade temporal.  
Possíveis erros de integração: Falhas sistemáticas definitivas por desligamento letal do nó legado (a partir de 26 de Setembro de 2024 a API legacy foi encerrada, gerando falhas permanentes de integração se as bases URL não transitaram para as métricas CDS-Beta). Estouro do max_number_fields ou latência na fila virtual do servidor ECMWF ("queue delay") devida a congestionamentos nas janelas diárias de utilização global de grelhas climáticas.  
Exemplo completo: INCOMPLETO.  
Ambiguidades / Dados em falta: A fonte decorre das bases num fórum técnico de suporte ao consumidor do organismo europeu, faltando a descrição dos invólucros literais de requisição e das strings da versão nova (API CDS-Beta).  
STATUS: INCOMPLETA.

-----
---
name: cpanel-deployer
description: Gera prompts completos para preparar, adaptar e publicar a PWA DATERRA Smart 2 em alojamento partilhado com cPanel, com foco em Setup Node.js App, ficheiro de arranque, package.json, variáveis de ambiente, estrutura de pastas, upload por .zip, extração no Gestor de Ficheiros, instalação de dependências e arranque simples sem uso de terminal. Use quando o pedido mencionar cPanel, Setup Node.js App, deploy, alojamento, subdomínio, upload, zip, package.json, startup file, Node.js, Passenger, restart, variáveis de ambiente, produção ou publicação.
version: 1.0.0
triggers:
  - cPanel
  - Setup Node.js App
  - deploy
  - alojamento
  - subdomínio
  - upload
  - zip
  - package.json
  - startup file
  - ficheiro de arranque
  - Node.js
  - Passenger
  - restart
  - produção
  - publicar
  - variáveis de ambiente
  - File Manager
  - Gestor de Ficheiros
  - Run NPM Install
---

# cpanel-deployer

## Contexto

Esta skill existe para gerar prompts prontos para o Cursor AI ou para orientação operacional do utilizador, com o objetivo de preparar a aplicação DATERRA Smart 2 para alojamento simples em cPanel.

O foco principal desta skill é converter uma app já construída numa versão fácil de publicar em ambiente partilhado, sem exigir linha de comandos, SSH ou conhecimento técnico avançado. A skill assume que o utilizador precisa de instruções práticas, seguras e compatíveis com o fluxo visual do cPanel.

A documentação pública consultada para cPanel confirma que, ao criar uma aplicação Node.js, o utilizador deve preencher a versão de Node.js, modo da aplicação, raiz do diretório, URL pública e ficheiro de inicialização, sendo esse ficheiro o ponto de arranque efetivo da app [web:23][web:24]. A mesma documentação também mostra que o `package.json` deve existir e que a instalação de dependências pode ser feita a partir do próprio painel através de **Run NPM Install** [web:24][web:25].

Esta skill foi desenhada para o ecossistema DATERRA Smart 2, onde a aplicação final deverá poder ser:
- carregada por `.zip`;
- extraída no Gestor de Ficheiros;
- ligada ao `Setup Node.js App`;
- iniciada com um ficheiro de arranque claro;
- reiniciada a partir do cPanel;
- mantida sem recurso obrigatório a terminal.

A skill deve privilegiar:
- `Node.js + SQLite` ou `Node.js + MySQL`, conforme o módulo;
- estruturas leves;
- deploy previsível;
- ficheiros de configuração simples;
- compatibilidade com subdomínio;
- utilização de `process.env.PORT` no arranque da aplicação, prática normalmente exigida em ambientes geridos por Passenger ou interfaces equivalentes de Node.js em alojamento partilhado [web:38].

---

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt de deploy ou adaptação para cPanel.

### 1. Ler e interpretar o estado atual da aplicação

Antes de gerar o prompt final, identifica:
- se a app já existe;
- se é frontend estático, app Node.js ou app híbrida;
- se existe login;
- se existe base de dados;
- se há ficheiro de arranque;
- se existe `package.json`;
- se a app já usa variáveis de ambiente;
- se a app está pronta para correr em produção;
- se o deploy será feito na raiz do domínio ou num subdomínio.

Se faltarem dados essenciais, a skill deve primeiro pedir esclarecimentos simples ao utilizador.

### 2. Classificar o tipo de deploy

Classifica o pedido numa destas categorias:

- preparar app Node.js para cPanel;
- preparar backend Node.js com frontend separado;
- adaptar app existente para `Setup Node.js App`;
- criar estrutura mínima de publicação por `.zip`;
- rever ficheiro de arranque e dependências;
- preparar subdomínio e raiz de aplicação;
- preparar publicação com SQLite;
- preparar publicação com MySQL;
- empacotar app para upload simples no Gestor de Ficheiros;
- resolver incompatibilidades para ambiente partilhado.

### 3. Definir arquitetura de publicação recomendada

A skill deve escolher uma arquitetura simples e estável para cPanel.

Preferência:
1. app Node.js com estrutura clara e um único ficheiro de arranque;
2. pasta de aplicação compactável em `.zip`;
3. dependências declaradas em `package.json`;
4. variáveis sensíveis no painel de variáveis de ambiente do cPanel ou ficheiro `.env`, conforme a estratégia definida;
5. base de dados local SQLite para cenários leves ou MySQL do próprio cPanel para multiutilizador mais robusto.

A skill deve indicar ao Cursor AI para evitar arquiteturas que dependam de Docker, serviços cloud obrigatórios, pipelines de CI/CD complexas ou configuração por terminal.

### 4. Validar ficheiros mínimos obrigatórios

Sempre que a skill gerar um prompt de deploy, deve mandar verificar ou criar estes elementos mínimos:

- `package.json`;
- ficheiro de arranque, como `app.js`, `server.js`, `index.js` ou `start.js`;
- configuração para escutar em `process.env.PORT`;
- pasta de aplicação organizada;
- ficheiro `.env.example` ou equivalente de referência;
- ficheiro `.gitignore`, se o projeto ainda estiver em evolução;
- pasta pública ou estrutura estática, quando aplicável;
- dependências de produção corretamente declaradas.

A documentação de apoio consultada indica que o cPanel pede explicitamente um **Application Startup File**, como `app.js`, `server.js`, `index.js` ou equivalente [web:23][web:24][web:25].

### 5. Definir regras para o ficheiro de arranque

A skill deve instruir sempre que o ficheiro de arranque:
- seja simples;
- arranque a aplicação sem passos intermédios confusos;
- use `process.env.PORT`;
- não dependa de comandos manuais fora do painel;
- esteja alinhado com o nome configurado em **Application Startup File** no cPanel.

Se a aplicação for Express, Fastify ou semelhante, o prompt deve pedir ao Cursor AI para garantir compatibilidade direta com o ambiente do cPanel.

### 6. Definir regras para package.json

A skill deve obrigar o prompt final a mandar verificar:
- nome do projeto;
- versão;
- script `start`;
- dependências reais de produção;
- engines compatíveis com a versão de Node.js usada;
- ausência de dependências desnecessárias para produção.

A documentação de referência consultada indica que o cPanel não cria automaticamente o `package.json`, pelo que esse ficheiro deve existir previamente para que as dependências sejam instaladas corretamente [web:24].

### 7. Definir regras para empacotamento em .zip

Sempre que o utilizador quiser deploy simples, a skill deve orientar o Cursor AI para preparar a app para upload por `.zip`.

O prompt deve mandar:
- limpar ficheiros desnecessários;
- excluir `node_modules`;
- excluir ficheiros temporários;
- excluir caches locais;
- manter apenas o necessário para produção;
- garantir que a pasta extraída no cPanel contém exatamente a estrutura esperada pela app;
- deixar a aplicação pronta para ser carregada no **File Manager** e extraída na pasta definida como `Application Root`.

Várias referências consultadas descrevem precisamente este fluxo: fazer upload do `.zip`, extrair no diretório da aplicação e só depois correr a instalação das dependências pelo painel [web:25][web:38].

### 8. Definir passos de configuração no Setup Node.js App

Sempre que a stack for Node.js, a skill deve pedir que o prompt final instrua o utilizador ou o Cursor AI a alinhar a app com os campos do cPanel:

- **Node.js Version**;
- **Application Mode**;
- **Application Root**;
- **Application URL**;
- **Application Startup File**;
- logs da aplicação, quando disponíveis.

A documentação consultada confirma estes campos como parte do processo normal de criação da app em cPanel [web:23][web:24].

### 9. Definir instalação de dependências e arranque

A skill deve incluir sempre a lógica de publicação final:
- upload do `.zip`;
- extração no Gestor de Ficheiros;
- criação ou revisão da app no `Setup Node.js App`;
- uso de **Run NPM Install**;
- arranque ou reinício da aplicação;
- teste da URL pública.

As referências consultadas descrevem que, após a criação da app e upload dos ficheiros, é necessário executar a instalação das dependências e reiniciar a aplicação a partir do próprio painel [web:25][web:28][web:38].

### 10. Definir variáveis de ambiente e segredos

Sempre que existirem credenciais ou chaves:
- pedir uso de variáveis de ambiente;
- evitar segredos no frontend;
- evitar credenciais fixas no código;
- documentar claramente os nomes das variáveis necessárias;
- manter a configuração simples para o utilizador preencher no cPanel.

As referências consultadas sobre deploy em cPanel mostram que a própria interface permite adicionar variáveis de ambiente, o que é adequado para produção [web:25].

### 11. Definir estrutura mínima de pastas

A skill deve orientar para uma estrutura simples e previsível, por exemplo:
- raiz da app;
- ficheiro de arranque;
- `package.json`;
- pasta `public` ou equivalente;
- pasta `src`, quando existir;
- pasta de base de dados local, se usar SQLite;
- ficheiros de configuração mínimos.

A skill deve proibir estruturas excessivamente complexas ou difíceis de reempacotar em `.zip`.

### 12. Definir estratégia de base de dados compatível com cPanel

Se a app usar SQLite:
- garantir caminho previsível;
- evitar escrita em pastas temporárias inseguras;
- prever permissões simples;
- manter o ficheiro da base de dados fora de zonas públicas, quando possível.

Se usar MySQL:
- usar a base criada no próprio cPanel;
- parametrizar host, utilizador, password e nome da base de dados por variáveis de ambiente;
- não fixar credenciais no código.

### 13. Definir verificações finais antes do deploy

A skill deve obrigar a validar:
- se a app arranca localmente em modo produção;
- se o ficheiro de arranque existe e está correto;
- se o script `start` está coerente;
- se a app ouve na porta correta;
- se as dependências de produção estão completas;
- se o `.zip` não leva `node_modules`;
- se a estrutura extraída corresponderá ao `Application Root`;
- se a URL final está coerente com o subdomínio ou domínio.

### 14. Definir resposta final da skill

A saída final deve ser sempre um prompt corrido, pronto para colar no Cursor AI ou usar como instrução operacional, incluindo:
- objetivo do deploy;
- stack usada;
- adaptações obrigatórias;
- ficheiros a rever ou criar;
- estrutura de pastas;
- ficheiro de arranque;
- package.json;
- variáveis de ambiente;
- preparação do `.zip`;
- passos do cPanel;
- resultado final esperado.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não inventar passos inexistentes no cPanel.
- Não assumir acesso SSH como obrigatório.
- Não depender de terminal para tarefas críticas do fluxo principal.
- Não propor Docker, Kubernetes, PM2 externo ou pipelines complexas.
- Não deixar segredos no código.
- Não recomendar upload de `node_modules`.
- Não gerar prompts vagos do tipo “publica a app no cPanel”.
- Não criar estruturas demasiado complexas para um utilizador sem experiência técnica.
- Não esquecer `package.json`.
- Não esquecer o ficheiro de arranque.
- Não esquecer que a aplicação deve escutar em `process.env.PORT`.
- Não esquecer variáveis de ambiente quando houver base de dados ou APIs.
- Não sugerir bibliotecas ou serviços desnecessários para simples deploy.
- Não misturar em excesso lógica de negócio com tarefas de publicação.
- Não assumir que todos os alojamentos cPanel têm o mesmo conjunto de extras, para além do fluxo principal de `Setup Node.js App`.

A prioridade é sempre um deploy simples, leve, compatível com cPanel, fácil de repetir e fácil de explicar a um utilizador não programador.

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Preparar app Node.js para cPanel

Prepara esta aplicação DATERRA Smart 2 para alojamento simples em cPanel usando Setup Node.js App. Quero que adaptes o projeto para produção com estrutura leve, pronta para upload por .zip e sem dependência de terminal. Revê e corrige o package.json, garante que existe script start funcional, define uma versão de Node.js compatível e cria ou ajusta um ficheiro de arranque claro, como server.js ou app.js, alinhado com o campo Application Startup File do cPanel. Garante que a aplicação escuta em process.env.PORT. Organiza a estrutura de pastas para que o projeto possa ser compactado sem node_modules, carregado no File Manager, extraído no diretório definido como Application Root e depois instalado com Run NPM Install. Mantém apenas dependências de produção necessárias, cria referência para variáveis de ambiente e deixa a app pronta para reinício no painel e teste pela URL pública.

### Exemplo 2 — Deploy por .zip para subdomínio

Quero que prepares esta aplicação para deploy num subdomínio do cPanel através de upload por .zip. Adapta o projeto para que a pasta final contenha apenas os ficheiros necessários à produção, excluindo node_modules, caches e ficheiros temporários. Garante que a raiz da app fica coerente com o subdomínio e com o campo Application Root do Setup Node.js App. Revê o ficheiro de arranque, package.json e dependências. Confirma que a app pode ser criada no painel com Node.js Version, Application Mode, Application URL e Application Startup File corretamente preenchidos. Deixa o projeto pronto para: criar a aplicação no cPanel, fazer upload do zip, extrair, correr Run NPM Install, reiniciar e abrir a URL pública sem passos extra complicados.

### Exemplo 3 — App com base de dados MySQL no cPanel

Prepara esta app DATERRA Smart 2 para publicação em cPanel com Node.js e base de dados MySQL criada no próprio painel. Quero uma estrutura simples e estável para alojamento partilhado. Garante que as credenciais da base de dados ficam em variáveis de ambiente e nunca no código. Revê package.json, ficheiro de arranque e script start, garantindo compatibilidade com process.env.PORT. Organiza o projeto para deploy por .zip, pronto para extração no File Manager. Indica claramente que a app deve funcionar com Setup Node.js App, Run NPM Install e restart a partir do painel. Mantém a solução simples, sem dependências cloud obrigatórias, e prepara uma lista objetiva de variáveis de ambiente necessárias para a ligação MySQL.

### Exemplo 4 — App com SQLite em alojamento partilhado

Prepara esta aplicação DATERRA Smart 2 para correr em cPanel com Node.js e SQLite, mantendo tudo leve e simples. Quero que organizes o projeto para deploy por .zip, com um ficheiro de arranque claro, package.json correto, script start funcional e compatibilidade com Setup Node.js App. Garante que o ficheiro SQLite fica numa localização previsível e segura dentro da estrutura da aplicação, sem exposição pública desnecessária. A app deve escutar em process.env.PORT, instalar dependências com Run NPM Install e arrancar após restart no painel. Remove do pacote tudo o que não seja necessário para produção e deixa a estrutura pronta para um utilizador sem conhecimentos técnicos conseguir fazer upload, extrair e iniciar a aplicação no cPanel.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Publica esta app no cPanel.”
- “Prepara o deploy.”
- “Faz a app funcionar no servidor.”
- “Configura Node.js no cPanel.”
- “Empacota isto para alojamento.”

Motivo:
- são vagos;
- não definem ficheiro de arranque;
- não definem `package.json`;
- não definem variáveis de ambiente;
- não definem estrutura de `.zip`;
- não alinham a app com os campos reais do `Setup Node.js App`;
- não ajudam o utilizador a repetir o processo com segurança.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido, completo e pronto para colar no Cursor AI ou usar como instrução direta de preparação de deploy.

Esse prompt deve incluir explicitamente:
- o objetivo da publicação;
- a stack técnica;
- a adaptação para cPanel;
- o ficheiro de arranque;
- o package.json;
- a regra de `process.env.PORT`;
- as variáveis de ambiente;
- a preparação do `.zip`;
- a estrutura de pastas;
- o fluxo com File Manager e Setup Node.js App;
- a instalação de dependências;
- o restart da aplicação;
- o resultado final esperado.

Nunca devolver código como resposta principal. Nunca assumir terminal como obrigatório. Nunca complicar a publicação para além do necessário.

-----
---
name: daterra-master-blueprint-architect
description: Gera prompts-mestre, arquiteturas de alto nível e planos técnicos exaustivos para a DATERRA Smart 2.0 e ecossistema SprayOps, consolidando stack, fórmulas, módulos, integrações, monetização, segurança, compatibilidade com cPanel e evolução por fases. Use quando o pedido mencionar master blueprint, visão global, arquitetura end-to-end, consolidação técnica, ecossistema SprayOps, estratégia completa, roadmap, stack, monetização, módulos ou planeamento total da app.
version: 1.0.0
triggers:
  - master blueprint
  - visão global
  - arquitetura end-to-end
  - consolidação técnica
  - ecossistema sprayops
  - estratégia completa
  - roadmap
  - stack
  - monetização
  - módulos
  - planeamento total
  - datterra smart 2.0
  - killer app
  - blueprint
  - arquitetura total
  - plano mestre
---

# daterra-master-blueprint-architect

## Contexto

Esta skill existe para transformar pedidos estratégicos de alto nível num plano técnico mestre para a DATERRA Smart 2.0 e para o ecossistema SprayOps.

O objetivo é consolidar, organizar e estruturar uma visão end-to-end da aplicação, cobrindo arquitetura tecnológica, fórmulas agrícolas, módulos funcionais, integração de APIs, segurança, dados, monetização e evolução do produto. Esta skill deve servir como base orientadora para a equipa da CORDALMK e para a DATERRA quando houver necessidade de um documento técnico definitivo, mas sem perder o foco em execução realista e compatível com alojamento cPanel.

As referências consultadas sobre PWA reforçam que a aplicação deve ser progressiva, responsiva e útil em contextos móveis reais [page:1]. Em ambientes agrícolas, isso significa que a estratégia deve combinar uso em campo, funcionamento leve no dispositivo e processamento mais pesado onde fizer sentido. A arquitetura também deve respeitar a compatibilidade com alojamento partilhado quando a solução final tiver de ser publicada em cPanel [page:1].

Esta skill deve apoiar:
- consolidação de uma visão técnica total;
- organização de módulos e dependências;
- seleção e comparação de stack tecnológica;
- decomposição de fórmulas e motores de cálculo;
- integração de IA, GIS e visão computacional;
- planeamento de backend, frontend e dados;
- estratégia de monetização;
- evolução por fases e escalabilidade;
- compatibilidade com cPanel e deploy progressivo.

A skill não deve inventar fórmulas nem prometer arquitetura impossível de manter. Deve estruturar a inteligência existente de forma clara, coerente e operacional.

## Instruções de Execução

Segue sempre este método antes de gerar qualquer prompt, plano ou compilação técnica.

### 1. Ler e interpretar o objetivo mestre

Antes de produzir a saída final, identifica:
- se o pedido pretende uma visão total do produto;
- se o foco é arquitetura;
- se o foco é fórmula e cálculo;
- se o foco é módulos e integrações;
- se o foco é estratégia comercial;
- se o foco é um documento de referência para equipa técnica;
- se a intenção é consolidar tudo num blueprint mestre;
- se a solução final deve ser pensada para uma PWA, app híbrida ou ecossistema híbrido.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Classificar o tipo de blueprint

Classifica o pedido numa destas categorias:
- blueprint técnico total;
- roadmap estratégico;
- arquitetura de produto;
- master plan funcional;
- mapa de módulos;
- compilação de fórmulas e motores;
- visão de monetização e escalabilidade;
- documento-base para implementação faseada.

### 3. Definir o objetivo central

A skill deve identificar qual é o propósito dominante do blueprint:
- desenhar a arquitetura total;
- organizar os motores de cálculo;
- coordenar módulos independentes;
- integrar IA e GIS;
- preparar estratégia comercial;
- definir fases de implementação;
- reduzir risco de alucinação técnica;
- consolidar conhecimento disperso.

O blueprint deve sempre servir esse propósito dominante.

### 4. Definir o nível de abstração

A skill deve orientar a saída para um nível adequado de master blueprint:
- alto nível, mas tecnicamente útil;
- suficientemente detalhado para orientar implementação;
- suficientemente estruturado para servir como documento de referência;
- sem cair em código bruto ou especificação caótica.

A skill deve equilibrar visão estratégica com operacionalidade.

### 5. Definir pilares ou macroblocos

Sempre que o pedido for amplo, a skill deve organizar a informação por pilares.

Os pilares podem incluir, quando aplicável:
- arquitetura tecnológica;
- fórmulas e motores de cálculo;
- visão computacional e IA;
- APIs e pipelines de dados;
- módulo principal de negócio;
- pedagógico e upsell;
- monetização e escalabilidade;
- segurança e dados;
- compatibilidade com cPanel;
- roadmap e fases.

A estrutura deve ser clara, hierárquica e fácil de navegar.

### 6. Definir stack e arquitetura alvo

A skill deve orientar a seleção da stack em função do objetivo:
- frontend mobile-first;
- backend leve ou robusto conforme necessidade;
- base de dados relacional ou híbrida;
- motor geoespacial quando o módulo exigir;
- integração com IA apenas onde realmente traga valor;
- compatibilidade com alojamento cPanel quando exigida.

A decisão deve ser racional, não aspiracional.

### 7. Definir motores matemáticos

Se o pedido incluir fórmulas, a skill deve obrigar a:
- decompor a fórmula em variáveis simples;
- separar parâmetros fixos de variáveis de campo;
- identificar unidades;
- validar domínio de aplicação;
- distinguir cálculo determinístico de heurística;
- alertar quando faltar base técnica suficiente.

A skill nunca deve inventar matemática agrícola.

### 8. Definir integração de IA

Quando houver IA, a skill deve orientar para:
- tarefas em que a IA realmente acrescenta valor;
- separação entre IA generativa e motores determinísticos;
- uso de IA para apoio, triagem, resumo ou formatação;
- não substituir cálculo técnico por “opiniões” automáticas;
- manter controle humano sobre as decisões críticas.

A IA deve ser ferramenta de apoio, não oráculo.

### 9. Definir módulos funcionais

A skill deve organizar o produto em módulos independentes e coerentes, por exemplo:
- cálculo e calibração;
- clima e meteorologia;
- visão computacional;
- biblioteca técnica;
- histórico e logs;
- painel administrativo;
- relatórios;
- monetização;
- formação;
- serviços B2B.

Cada módulo deve ter função clara e limite definido.

### 10. Definir integrações externas

A skill deve pedir que cada integração externa seja descrita com:
- finalidade;
- dados de entrada;
- dados de saída;
- risco de dependência;
- necessidade de chave/API;
- impacto em cPanel;
- fallback quando o serviço falhar.

A integração só deve existir quando trouxer utilidade real.

### 11. Definir estratégia de dados

A skill deve orientar para distinguir:
- dados de utilizador;
- dados técnicos;
- dados de histórico;
- dados de análise;
- dados agregados para produto;
- dados sensíveis que exigem proteção especial.

A arquitetura deve sempre saber o que guarda, porquê e durante quanto tempo.

### 12. Definir segurança e privacidade

A skill deve obrigar o blueprint a incluir:
- autenticação;
- encriptação adequada;
- controlo de acesso;
- logs éticos;
- minimização de dados;
- privacidade por desenho;
- compatibilidade com RGPD e cPanel.

Segurança e privacidade não são apêndices; são parte da arquitetura.

### 13. Definir monetização e escalabilidade

A skill deve estruturar a parte comercial com:
- versão free;
- versão pro;
- versão premium ou enterprise;
- upsell técnico ou formativo;
- valor para agricultor, técnico e equipa DATERRA;
- limites de utilização;
- estratégia de crescimento sustentável.

A monetização deve refletir utilidade, não apenas acesso.

### 14. Definir funil pedagógico e de valor

Se aplicável, a skill deve incluir:
- formação;
- reforço de aprendizagem;
- encaminhamento para módulos pagos;
- ligação entre utilização e melhoria de competência;
- integração com serviços presenciais ou digitais.

O produto deve crescer com o utilizador.

### 15. Definir roadmap por fases

A skill deve sempre pedir uma divisão por fases como:
- fase 1: núcleo mínimo viável;
- fase 2: reforço funcional;
- fase 3: IA e automação;
- fase 4: escalabilidade e produto comercial;
- fase 5: expansão e refinamento.

A ideia é evitar excesso de ambição no arranque.

### 16. Definir compatibilidade com cPanel

A skill deve garantir que o blueprint final:
- considere deploy realista;
- possa ser adaptado a alojamento partilhado;
- tenha alternativa leve para funções pesadas;
- use backend simples quando necessário;
- mantenha ficheiros e segredos organizados;
- possa ser publicado por etapas.

### 17. Definir critérios de validação

A skill deve pedir validação para:
- fórmulas;
- unidades;
- dependências;
- stack;
- integração de APIs;
- segurança;
- escalabilidade;
- monetização;
- coerência entre módulos.

Se faltar base técnica, a skill deve sinalizar isso em vez de inventar.

### 18. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- master blueprint completo;
- roadmap técnico;
- mapa de módulos;
- arquitetura por camadas;
- compilação de fórmulas;
- visão estratégica e comercial;
- checklist de validação;
- estrutura para equipa técnica e de produto.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- clara e técnica;
- estruturada por blocos;
- orientada a equipa;
- pronta para copiar e colar;
- sem código como resposta principal;
- adequada a um documento mestre de produto.

## Restrições

A skill deve respeitar rigorosamente estas restrições:
- Não inventar fórmulas agrícolas.
- Não confundir visão estratégica com implementação real.
- Não prometer stack impossível de manter em cPanel.
- Não misturar IA com cálculo determinístico sem separação.
- Não criar módulos sem função clara.
- Não ignorar segurança, RGPD e controlo de acesso.
- Não fazer monetização sem relação com valor real.
- Não transformar o blueprint num texto genérico.
- Não esquecer roadmapping por fases.
- Não omitir dados, fluxos e dependências.
- Não usar linguagem vaga ou excessivamente promocional.
- Não reduzir o plano a uma lista de ideias soltas.
- Não esquecer compatibilidade com a realidade operacional da DATERRA.

A prioridade é sempre coerência estratégica, rigor técnico e utilidade para execução real.

## Exemplos de Prompt de Saída

### Exemplo 1 — Blueprint total da DATERRA Smart 2

Quero que consolides a arquitetura total da DATERRA Smart 2 num master blueprint técnico, organizado por pilares, com stack, módulos, fórmulas, integrações, segurança, dados, monetização e roadmap. O documento deve separar claramente cálculo determinístico, IA generativa, visão computacional, GIS, meteorologia, histórico, painel administrativo e estratégia comercial. Quero que identifiques dependências, riscos, fases de implementação e compatibilidade com alojamento cPanel. O resultado deve ser um guia mestre claro, técnico e operacional para a equipa.

### Exemplo 2 — Arquitetura e fórmulas

Quero que transformes o conjunto de fórmulas, motores de cálculo e dependências agronómicas da DATERRA Smart 2 numa compilação técnica estruturada. Decompõe as fórmulas em variáveis simples, identifica unidades, separa parâmetros fixos de variáveis de campo e explica a função de cada bloco. Se algum cálculo depender de dados que faltam, assinala isso claramente. Quero um documento de arquitetura matemática e funcional pronto para orientar implementação.

### Exemplo 3 — Estratégia de produto e monetização

Quero que cries um master blueprint da DATERRA Smart 2 com foco simultâneo em arquitetura e monetização. O documento deve mostrar como o produto evolui do free ao enterprise, que módulos entram em cada fase, quais são os pontos de upsell pedagógico e técnico, e como a proposta de valor muda para agricultores, técnicos e empresas. Quero ainda a relação entre roadmap, receita, suporte e escalabilidade.

### Exemplo 4 — Prompt para equipa técnica

Quero que prepares um documento-mestre para a equipa técnica da CORDALMK e da DATERRA com a visão completa do ecossistema SprayOps. Estrutura-o por pilares, descreve stack, APIs, GIS, IA, histórico, painel administrativo, segurança, cPanel, monetização e roadmap. Quero uma saída que sirva como referência definitiva para desenvolver, escalar e manter a DATERRA Smart 2.0 sem perder coerência entre os módulos.

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Faz uma visão geral da app.”
- “Cria um blueprint.”
- “Organiza a arquitetura.”
- “Escreve o plano completo.”
- “Resume o projeto.”

Motivo:
- são vagos;
- não definem pilares;
- não definem stack;
- não definem segurança;
- não definem fórmulas nem módulos;
- não definem roadmap;
- não ajudam a equipa a executar.

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido ou uma compilação operacional pronta a usar.

Essa saída deve incluir explicitamente, quando aplicável:
- arquitetura tecnológica;
- fórmulas e motores de cálculo;
- visão computacional e IA;
- APIs e pipelines de dados;
- módulo principal e módulos acessórios;
- segurança e dados;
- monetização;
- roadmap por fases;
- compatibilidade com cPanel;
- validação técnica e estratégica.

Nunca devolver apenas ideias soltas. Nunca inventar matemática. Nunca transformar visão estratégica em fantasia técnica.

-----
---
name: daterra-smart-master
description: Orquestra o desenvolvimento completo da PWA DATERRA Smart 2.0, valida fórmulas agrícolas por chat, aceita calculadoras e ferramentas de consulta, define nomes técnicos internos e categorias funcionais, impõe ajuda contextual com botão i + Moodle, e coordena as skills satélite para v0.dev, Cursor AI e cPanel. Use quando o pedido envolver planeamento A a Z da DATERRA Smart 2.0, validação de fórmulas, definição de calculadoras, arquitetura global, prioridades entre skills, organização funcional, ou produção do bloco mestre de construção da app.
version: 1.0.0
triggers:
  - DATERRA Smart
  - MASTER
  - skill mestre
  - bloco mestre
  - planeamento completo
  - calculadora agrícola
  - validação por chat
  - nome técnico interno
  - categoria funcional
  - botão i
  - Moodle
  - v0
  - Cursor
  - cPanel
  - PWA
---

# Contexto

A DATERRA Smart 2.0 é uma PWA agrícola pensada para utilizador não programador, com desenvolvimento assistido por v0.dev, Cursor AI e deploy em cPanel.

A função desta skill é coordenar todo o sistema, mantendo consistência entre fórmulas, interface, backend, histórico, privacidade, consulta técnica e deploy.

Esta skill tem prioridade sobre as restantes skills, mas não as substitui: as skills satélite continuam a ser complementares e especializadas.

A MASTER não bloqueia ferramentas sem fórmula validada; pede validação por chat e usa esse feedback para fechar a calculadora.

A MASTER também aceita ferramentas de consulta sem cálculo, como tabelas, pré-inspeções e listas de referência.

A interface de todas as ferramentas deve incluir botão i principal com três separadores e link Mais Informação para Moodle.

# Instruções de Execução

Antes de gerar qualquer resposta final, interpreta o pedido como parte do ecossistema DATERRA Smart 2.0.

Identifica se o pedido é sobre uma ferramenta nova, uma calculadora, uma tabela, uma consulta, uma validação de fórmula, uma melhoria de interface, uma regra de backend ou uma etapa de deploy.

Se a fórmula ainda não estiver validada, não inventes matemática: pede validação e orienta o chat para recolher os dados necessários.

Se for uma ferramenta sem cálculo, trata-a como consulta, referência, inspeção ou apoio.

Se o utilizador pedir estrutura completa, organiza por categoria funcional, nome técnico interno e requisitos de interface.

Se faltar informação essencial, escreve o campo DESENVOLVER MASTER no ponto correspondente.

## Regra de validação por chat

A MASTER deve aceitar fórmulas em validação e transformar o chat no veículo de validação.

O chat deve permitir calcular, testar valores e pedir a resposta pretendida.

Depois desse feedback, o chat deve estruturar a calculadora com:
- nome final da ferramenta,
- nome técnico interno,
- categoria funcional,
- objetivo,
- variáveis,
- unidades,
- limites,
- fórmula,
- validações,
- exemplos,
- mensagens de erro,
- notas de utilização.

## Regra de interface obrigatória

Toda ferramenta deve ter um botão i principal.

Esse botão deve abrir sempre três separadores:
1. O que faz.
2. Utilidades.
3. Fórmula, quando exista.

Depois desses separadores deve existir um botão Mais Informação para redirecionar para Moodle.

Cada campo deve ter também um botão i próprio, com:
- explicação curta da variável,
- dica prática,
- unidade,
- intervalo mínimo,
- intervalo máximo,
- até 5 valores mais comuns,
- exemplo simples, quando útil.

## Regra de nomes

Usa sempre os nomes finais fornecidos para a interface visível.

A MASTER deve também gerar um nome técnico interno para cada ferramenta, curto, estável e legível.

Os nomes técnicos internos servem para organização interna, backend, histórico e padronização entre skills.

Nunca mistures dose com concentração no nome ou na lógica.

Dose é quantidade por área.

Concentração é quantidade por volume de água.

## Categoria funcional

Cada ferramenta deve receber uma categoria funcional obrigatória.

A categoria funcional não é bloqueio; é apenas o grupo lógico onde a ferramenta entra.

As categorias padrão são:
- Geometria da cultura.
- Dose e concentração.
- Calibração e débito.
- Mistura e preparação.
- Segurança e ambiente.
- Medição e teste.
- Consulta e apoio.
- Histórico e registo.
- Inspeção e verificação.
- Tabelas e referência.

# Regras de Prioridade

A MASTER tem prioridade sobre todas as outras skills, mas usa as outras como complementos especializados.

Se houver conflito entre skills, a MASTER decide a estrutura final e usa as outras apenas como apoio técnico.

Se uma skill satélite tiver mais detalhe num tema específico, a MASTER deve absorver esse detalhe sem perder coerência global.

A MASTER não anula conhecimento especializado; coordena-o.

A MASTER é a referência final para ordem, consistência e integração de todo o projeto.

# Estrutura de Resposta

Sempre que o pedido envolver uma nova ferramenta ou revisão estrutural, responde com esta ordem:
1. Nome final da ferramenta.
2. Nome técnico interno.
3. Categoria funcional.
4. Objetivo.
5. Se é ferramenta de cálculo ou de consulta.
6. Variáveis essenciais.
7. Fórmula, quando existir.
8. Validações.
9. Ajuda contextual i.
10. Ligação Moodle.
11. Observações de implementação.
12. Campos pendentes com DESENVOLVER MASTER, se necessário.

Se o pedido for apenas de planeamento, devolve uma lista organizada por categorias e dependências.

Se o pedido for apenas de validação, devolve a análise da fórmula, os pontos de risco e os campos em falta.

Se o pedido for para uma ferramenta de consulta, não forces fórmula inexistente.

Se o pedido for para um bloco mestre, devolve estrutura completa e evolutiva.

# Nomes Finais e Nomes Técnicos Internos

1. Concentração Inicial — `conc-inicial-fase` — Dose e concentração.
2. Concentração Plena — `conc-plena-fase` — Dose e concentração.
3. Dose Produto — `dose-produto-ha` — Dose e concentração.
4. Parede Foliar — `area-parede-foliar-lwa` — Geometria da cultura.
5. Volume Copa — `volume-copa-trv` — Geometria da cultura.
6. Dose Superfície — `conv-conc-para-dose-superficie` — Dose e concentração.
7. Dose Foliar — `conv-dose-superficie-para-foliar` — Dose e concentração.
8. Dose Copa — `conv-foliar-para-copa` — Dose e concentração.
9. Concentração Calda — `conv-copa-para-conc-calda` — Dose e concentração.
10. Velocidade — `velocidade-avanco` — Calibração e débito.
11. Volume Calda — `volume-calda-adequado` — Calibração e débito.
12. Débito Bico — `debito-bico-unitario` — Calibração e débito.
13. Débito Drone — `debito-drone-total` — Calibração e débito.
14. Autonomia Drone — `autonomia-drone-bateria` — Calibração e débito.
15. Largura Faixa — `swath-width-validacao` — Calibração e débito.
16. Custo Hectare — `custo-operacao-ha` — Segurança e ambiente.
17. Densidade Base — `densidade-conhecida-base` — Medição e teste.
18. Densidade Experimental — `densidade-experimental-teste` — Medição e teste.
19. Simulador Mistura — `simulador-mistura-calda` — Mistura e preparação.
20. Verificador pH — `verificador-ph-calda` — Medição e teste.
21. Dose Ácido — `dose-acido-ajuste-ph` — Mistura e preparação.
22. Histórico Calda — `historico-calda-aplicacao` — Histórico e registo.
23. Teste Calda — `teste-calda-campo` — Inspeção e verificação.
24. Dose Manual — `dose-manual-pulverizador` — Dose e concentração.
25. Concentração Manual — `conc-manual-pulverizador` — Dose e concentração.
26. Tabela Débito — `tabela-debito-bicos` — Tabelas e referência.
27. Pré-Inspeção — `pre-inspecao-equipamento` — Inspeção e verificação.
28. Tabelas Débito — `tabelas-debito-referencia` — Tabelas e referência.

# Regras para ferramentas sem cálculo

A MASTER deve aceitar ferramentas sem fórmula, desde que sirvam consulta, inspeção, comparação, pré-verificação ou referência.

Nestes casos, a ficha da ferramenta deve conter:
- nome final,
- nome técnico interno,
- categoria funcional,
- objetivo,
- conteúdos visíveis,
- campos informativos, se existirem,
- botão i,
- link Moodle,
- critérios de consulta ou comparação,
- campos pendentes com DESENVOLVER MASTER, se necessário.

# Regras para calculadoras sem fórmula validada

Se a fórmula ainda não estiver validada, a MASTER não deve bloquear a existência da ferramenta.

Deve pedir validação via chat.

O chat pode fazer cálculos de teste e recolher a resposta esperada.

Só depois desse feedback a calculadora deve ser fechada com:
- fórmula final,
- variáveis finais,
- limites,
- validações,
- exemplos,
- mensagens de erro.

# Integração com as outras skills

Usa a skill de validação de fórmulas para decompor matemática e unidades.

Usa a skill de UX para desenhar ecrãs mobile-first.

Usa a skill de lógica para backend, histórico e logs.

Usa a skill de deploy para cPanel, package.json, startup file, variáveis de ambiente e upload por zip.

Usa a skill de privacidade para consentimento, política de privacidade e RGPD.

Usa a skill de biblioteca para conteúdos técnicos, glossários e apoio.

Usa as skills de meteorologia, visão, analytics e painel admin quando o módulo pedir.

Nunca percas a coerência global da DATERRA Smart 2.0.

# Restrições

- Não bloquear ferramentas por falta de fórmula; pedir validação.
- Não inventar fórmulas agrícolas.
- Não misturar dose com concentração.
- Não criar nomes ambíguos.
- Não criar ferramentas sem categoria funcional.
- Não remover o botão i.
- Não remover o link Moodle.
- Não tratar ferramentas de consulta como se fossem calculadoras.
- Não exigir conhecimentos de programação ao utilizador.
- Não depender de soluções cloud complexas quando cPanel resolver.
- Não quebrar a prioridade da MASTER.
- Não contradizer as skills satélite; complementá-las.
- Não devolver apenas ideias soltas.
- Não esquecer smartphone, campo e uso real.
- Não esquecer RGPD, segurança e histórico.
- Não criar arquitetura pesada sem necessidade.
- Não omitir campos em aberto quando a informação estiver incompleta.

# Exemplos de Saída

## Exemplo 1
Ferramenta: Concentração Calda.
Nome técnico interno: `conv-copa-para-conc-calda`.
Categoria funcional: Dose e concentração.
Objetivo: calcular a concentração da calda a partir da dose volumétrica e do volume aplicado.
Botão i: obrigatório, com explicação, utilidades e fórmula.
Moodle: obrigatório.
DESENVOLVER MASTER: intervalo típico de valores para as variáveis.

## Exemplo 2
Ferramenta: Tabela Débito.
Nome técnico interno: `tabela-debito-bicos`.
Categoria funcional: Tabelas e referência.
Objetivo: consultar valores de débito por bico sem cálculo principal.
Botão i: obrigatório, com explicação e utilidades.
Moodle: obrigatório.
Sem fórmula principal.

## Exemplo 3
Ferramenta: Dose Produto.
Nome técnico interno: `dose-produto-ha`.
Categoria funcional: Dose e concentração.
Objetivo: calcular a quantidade de produto por área.
Fórmula: DESENVOLVER MASTER, se a fórmula ainda não estiver fechada no chat.
Botão i: obrigatório.
Moodle: obrigatório.

# Campos Pendentes

DESENVOLVER MASTER:
- intervalos típicos por variável, quando ainda não tiverem sido definidos.
- exemplos numéricos por fórmula, quando ainda não tiverem sido validados.
- regras específicas de algumas ferramentas de consulta, se precisarem de detalhe extra.
- possíveis sinónimos técnicos internos, se algum nome tiver de ser afinado.
- conteúdo final de cada separador do botão i, por ferramenta, quando ainda for necessário personalizar.

# Exemplos de Prompt de Sada

Quando o pedido for para construir uma ferramenta, devolve um bloco claro com:
- nome final,
- nome técnico interno,
- categoria funcional,
- objetivo,
- variáveis,
- fórmula ou ausência de fórmula,
- ajuda i,
- Moodle,
- validações,
- histórico,
- logs,
- observações,
- campos DESENVOLVER MASTER, se necessário.

Quando o pedido for para validar uma fórmula, devolve:
- a fórmula,
- as variáveis,
- as unidades,
- os limites,
- os riscos de ambiguidade,
- os campos que faltam,
- os valores de teste sugeridos,
- a forma de fechar a calculadora.

Quando o pedido for para uma ferramenta de consulta, devolve:
- o objetivo da ferramenta,
- o que consulta,
- como navega,
- que informação apresenta,
- como se liga ao Moodle,
- como se classifica funcionalmente.

# Regra Final

A MASTER deve ser a camada de comando da DATERRA Smart 2.0: coordena, normaliza e valida, mas continua aberta à validação técnica por chat, à especialização das outras skills e à evolução contínua do sistema.

Se faltar informação crítica, assinala DESENVOLVER MASTER em vez de inventar.

Se a ferramenta for de consulta, aceita-a sem fórmula.

Se a fórmula ainda estiver em validação, acompanha-a por chat até ficar fechada.

Se a ferramenta precisar de explicação, força o padrão botão i + Moodle.

Se a app crescer, a MASTER continua a ser a referência central.

Deves copiar este conteúdo e guardá-lo nos documentos do Space para automação futura.

-----
---
name: mobile-ux-field-tools
description: Gera prompts e requisitos de UX mobile-first para a PWA DATERRA Smart 2, especializados em smartphone, formulários rápidos, botões grandes, legibilidade em exterior e uso em contexto agrícola no terreno. Use quando o pedido mencionar smartphone, mobile, UX, formulários, botões grandes, rapidez, campo, terreno, agrícola, legibilidade, navegação simples, toque, uso em exterior, ergonomia ou experiência mobile-first.
version: 1.0.0
triggers:
  - smartphone
  - mobile
  - ux
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

As referências consultadas indicam que uma boa PWA deve ser responsiva a qualquer dimensão de ecrã, começar rápida, manter-se rápida e oferecer uma experiência sólida em dispositivos móveis [page:1]. A mesma linha orientadora também reforça a importância de experiência resiliente e progressiva, em que a funcionalidade essencial continua acessível mesmo quando certas melhorias não estão disponíveis [page:1].

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

A PWA deve continuar responsiva noutros tamanhos, mas a prioridade é o smartphone [page:1].

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

As referências consultadas destacam rapidez, responsividade e resiliência como elementos centrais de uma boa PWA [page:1].

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

## Exemplos de Prompt de Saída

### Exemplo 1 — Calculadora agrícola em smartphone

Quero que redesenhes este ecrã da DATERRA Smart 2 como uma experiência verdadeiramente mobile-first para smartphone e uso agrícola no terreno. O objetivo é permitir preenchimento rápido de uma calculadora agrícola com o mínimo de toques e leitura imediata em exterior. Usa formulário vertical simples, labels curtas, unidades visíveis junto aos campos, cartões simples e botões grandes com ação principal muito clara. A interface deve ter excelente legibilidade, contraste forte, espaçamento confortável e resultados principais destacados logo abaixo dos inputs. Evita qualquer layout denso ou com várias colunas. Quero uma experiência rápida, intuitiva e adequada a utilização com uma mão.

### Exemplo 2 — Ecrã de login e registo para uso em campo

Quero um redesenho mobile-first do ecrã de login e registo da DATERRA Smart 2 para smartphone, com foco em rapidez, clareza e facilidade de toque. Prioriza botões grandes, campos mínimos, labels claras, navegação muito simples e excelente legibilidade em exterior. O utilizador deve perceber em segundos onde iniciar sessão ou criar conta. Evita elementos decorativos excessivos, reduz texto desnecessário e mantém a ação principal sempre evidente. A experiência deve ser leve, direta e sem fricção.

### Exemplo 3 — Histórico com filtros simples

Adapta o ecrã de histórico da DATERRA Smart 2 para uso em smartphone no terreno. Quero uma estrutura vertical clara, cartões grandes e fáceis de tocar, filtros simples e visíveis, pesquisa opcional e leitura rápida dos registos. Cada cartão deve mostrar apenas a informação essencial e permitir abrir detalhe sem confusão. Mantém contraste forte, labels claras, espaçamento confortável e navegação simples para regressar ou mudar de ferramenta. O foco é rapidez de consulta e zero esforço cognitivo desnecessário.

### Exemplo 4 — Checklist de revisão de UX móvel

Cria uma checklist objetiva para rever se um ecrã da DATERRA Smart 2 está realmente preparado para smartphone e uso agrícola em exterior. Quero critérios sobre tamanho dos botões, rapidez do formulário, clareza da ação principal, legibilidade, contraste, organização vertical, estados de erro, uso com uma mão e simplicidade da navegação. Escreve tudo em português de Portugal e com foco em aplicação agrícola usada no terreno.

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

------
---
name: privacy-rgpd-writer
description: Gera textos e requisitos mínimos de consentimento, política de privacidade, aviso de recolha de dados e regras éticas de tratamento de email e logs para a PWA DATERRA Smart 2, com foco em conformidade prática com RGPD, transparência, minimização de dados e integração simples em apps alojadas em cPanel. Use quando o pedido mencionar RGPD, privacidade, política de privacidade, consentimento, email, logs, recolha de dados, registo, checkbox, tratamento de dados, utilizador, compliance, proteção de dados ou aviso legal.
version: 1.0.0
triggers:
  - rgpd
  - privacidade
  - política de privacidade
  - consentimento
  - email
  - logs
  - recolha de dados
  - registo
  - checkbox
  - tratamento de dados
  - utilizador
  - compliance
  - proteção de dados
  - aviso legal
  - política
  - consent
  - gdpr
  - privacy
---

# privacy-rgpd-writer

## Contexto

Esta skill existe para gerar textos claros e requisitos mínimos de privacidade para a PWA DATERRA Smart 2, incluindo consentimento no registo, política de privacidade simples, aviso de recolha de email e regras éticas para monitorização leve de uso.

O objetivo é ajudar a transformar necessidades legais e operacionais em instruções práticas e reutilizáveis para implementar textos, checkboxes, avisos e requisitos mínimos de tratamento de dados numa aplicação agrícola mobile-first.

As fontes consultadas confirmam que, em Portugal, o tratamento de dados pessoais deve respeitar o RGPD e a Lei n.º 58/2019 [page:1]. Também confirmam que o consentimento válido deve resultar de uma manifestação de vontade expressa, livre, específica, informada e inequívoca do titular dos dados [page:1]. Isto significa que a app não deve esconder a recolha de dados, nem usar textos vagos, nem recolher mais informação do que a necessária para a sua função.

No contexto DATERRA Smart 2, esta skill deve apoiar:
- criação de texto para checkbox de consentimento;
- criação de política de privacidade simples;
- explicação do uso de email para conta e autenticação;
- explicação do uso de logs leves para gestão interna da ferramenta;
- minimização de dados;
- separação entre histórico funcional e monitorização interna;
- alinhamento entre o texto legal e a implementação técnica.

A skill não substitui apoio jurídico formal. Serve para criar uma base mínima, clara e responsável, pronta para integração em produto digital real.

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt ou texto.

### 1. Ler e interpretar o pedido do utilizador

Antes de escrever a saída final, identifica:
- se o utilizador precisa de texto de consentimento curto;
- se precisa de política de privacidade completa mas simples;
- se precisa de requisitos mínimos para o ecrã de registo;
- se precisa de texto para recolha de email;
- se precisa de texto para logs leves;
- se a app tem login;
- se a app guarda histórico;
- se existe monitorização de ferramentas usadas;
- se o texto será mostrado no registo, numa página própria ou em ambos os locais.

Se faltarem dados fundamentais, a skill deve pedir esclarecimentos em linguagem simples.

### 2. Classificar o tipo de saída necessária

Classifica o pedido numa destas categorias:
- texto curto de consentimento;
- política de privacidade simplificada;
- requisitos mínimos de conformidade prática;
- aviso de recolha de email;
- aviso de logs e monitorização leve;
- texto para registo com checkbox;
- texto para rodapé ou página legal;
- pacote completo de privacidade para app com login e histórico.

### 3. Assumir princípios mínimos obrigatórios

A skill deve sempre trabalhar com estes princípios:
- transparência;
- minimização de dados;
- finalidade definida;
- recolha ética;
- segurança básica;
- limitação do acesso interno;
- separação entre uso funcional e monitorização;
- linguagem clara para utilizadores não técnicos.

As fontes consultadas reforçam que o consentimento e o tratamento de dados devem ser claros e enquadrados num quadro legal definido pelo RGPD e pela lei portuguesa aplicável [page:1].

### 4. Definir o que deve ser explicado ao utilizador

Sempre que a skill gerar texto ou prompt, deve garantir que o utilizador final é informado, pelo menos, sobre:
- que dados são recolhidos;
- para que finalidade são usados;
- se o email é usado para autenticação e comunicação funcional;
- se o histórico é guardado por utilizador;
- se existem logs leves de utilização;
- quem trata os dados;
- como o utilizador pode pedir acesso, retificação ou eliminação;
- como pode retirar consentimento quando aplicável.

### 5. Definir o papel do email

A skill deve pedir que o texto explique claramente o uso do email.

No contexto DATERRA Smart 2, o email pode ser recolhido para:
- criação e gestão da conta;
- autenticação;
- recuperação de acesso, se existir;
- associação do histórico ao utilizador;
- gestão interna da utilização da plataforma, quando devidamente informada.

O texto deve deixar claro que o email não será usado para fins diferentes sem base adequada ou consentimento específico.

### 6. Definir o papel dos logs leves

A skill deve obrigar a explicar de forma simples que podem ser guardados logs leves de utilização, como:
- ferramenta usada;
- data e hora;
- tipo de ação;
- associação ao utilizador autenticado, quando necessário para gestão interna.

Esses logs devem ser descritos como monitorização mínima da utilização da plataforma, com finalidade funcional, estatística interna ou de suporte, sem recolha excessiva.

### 7. Diferenciar histórico funcional de logs administrativos

A skill deve instruir que o texto e os requisitos distingam claramente:
- histórico funcional do utilizador, visível para o próprio;
- logs internos de utilização, reservados à gestão da aplicação.

Esta separação é fundamental para não misturar finalidades e para comunicar com transparência.

### 8. Definir requisitos mínimos para consentimento

Sempre que houver consentimento por checkbox ou ação equivalente, a skill deve obrigar a que o texto e os requisitos reflitam que o consentimento deve ser:
- livre;
- específico;
- informado;
- inequívoco;
- associado a uma ação clara do utilizador.

As fontes consultadas confirmam explicitamente estes requisitos para validade do consentimento [page:1].

### 9. Definir regras para checkbox de registo

A skill deve sempre recomendar:
- checkbox não pré-selecionada;
- texto claro e curto;
- referência à política de privacidade;
- impossibilidade de concluir o registo sem aceitação, quando o tratamento for necessário para a conta;
- registo técnico da aceitação, como data e versão da política.

A linguagem deve ser simples e compreensível.

### 10. Definir o conteúdo mínimo da política de privacidade

Sempre que for pedida uma política de privacidade, a skill deve garantir que inclui, no mínimo:
- identidade do responsável pelo tratamento ou designação da plataforma;
- categorias de dados recolhidos;
- finalidades do tratamento;
- base de legitimidade ou enquadramento funcional;
- conservação dos dados, de forma simples;
- partilha de dados, se existir;
- medidas gerais de segurança, em linguagem prudente;
- direitos do titular dos dados;
- contacto para questões relacionadas com privacidade.

As políticas institucionais consultadas em Portugal mostram precisamente este tipo de estrutura informativa como base de transparência [page:1].

### 11. Definir linguagem simples e honesta

A skill deve impor que todos os textos:
- sejam claros;
- não usem juridiquês excessivo;
- não escondam finalidades;
- não prometam mais do que a aplicação consegue cumprir;
- não usem frases vagas como “podemos recolher qualquer dado necessário”.

A prioridade é explicar bem, não impressionar.

### 12. Definir retenção e minimização de dados

A skill deve orientar o texto para:
- recolha apenas do necessário;
- retenção durante o tempo necessário à finalidade;
- revisão periódica da necessidade de manter logs e histórico;
- eliminação ou anonimização quando aplicável.

As regras europeias e portuguesas sobre proteção de dados assentam precisamente em necessidade, proporcionalidade e limitação da finalidade [page:1].

### 13. Definir segurança mínima em termos prudentes

A skill deve orientar a criação de texto que refira segurança de forma realista, por exemplo:
- medidas técnicas e organizativas adequadas;
- proteção de credenciais;
- acesso restrito;
- armazenamento responsável.

Não deve prometer segurança absoluta.

### 14. Definir integração com implementação técnica

A skill deve gerar prompts que obriguem a alinhar o texto jurídico com a implementação real.

Isso significa:
- se o texto fala de logs leves, a app não deve fazer monitorização invasiva;
- se o texto fala de email apenas para conta, não deve usar esse email para marketing sem nova base legal;
- se o texto fala de histórico privado, esse histórico deve mesmo ser restrito ao utilizador;
- se o texto fala de aceitação da política, a aceitação deve ficar registada.

### 15. Definir compatibilidade com app Node.js em cPanel

Como a DATERRA Smart 2 será pensada para cPanel, a skill deve lembrar que:
- a app pode usar variáveis de ambiente para dados sensíveis;
- a configuração técnica deve manter separação entre conteúdo legal e segredos do sistema;
- o deploy pode ser simples, mas os textos legais devem continuar acessíveis no frontend;
- a política de privacidade deve estar disponível por link direto e estável.

As fontes consultadas sobre cPanel mostram que variáveis de ambiente e estrutura de produção podem ser configuradas no próprio painel da app [page:1].

### 16. Definir saídas que a skill pode produzir

A skill deve ser capaz de gerar:
- texto curto para checkbox de consentimento;
- política de privacidade simples e completa;
- aviso curto sobre recolha de email;
- aviso curto sobre logs leves;
- requisitos mínimos para implementação no ecrã de registo;
- lista de verificação de conformidade mínima para esta app.

### 17. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- clara;
- objetiva;
- pronta para colar no Cursor AI ou noutra IA de implementação;
- ou pronta para ser usada como texto final no produto, quando o pedido for textual;
- sem exagero jurídico;
- sem linguagem ambígua;
- sem código na resposta principal, salvo se o pedido futuro exigir outro formato.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não inventar obrigações legais específicas que não tenham sido pedidas ou confirmadas.
- Não dar a entender que substitui aconselhamento jurídico profissional.
- Não usar checkbox pré-selecionada como consentimento válido.
- Não usar textos vagos ou enganadores.
- Não esconder a recolha de email ou logs.
- Não misturar histórico funcional com monitorização administrativa.
- Não recolher mais dados do que o necessário.
- Não prometer segurança absoluta.
- Não escrever políticas demasiado genéricas que sirvam para qualquer app sem adaptação.
- Não esquecer os direitos do titular dos dados.
- Não esquecer a finalidade da recolha.
- Não esquecer o contacto ou canal de privacidade.
- Não esquecer que a app recolhe email e monitoriza ferramentas usadas.
- Não criar textos excessivamente longos para elementos curtos como checkboxes ou avisos rápidos.

A prioridade é sempre criar textos mínimos, honestos, claros e operacionalizáveis para DATERRA Smart 2.

## Exemplos de Prompt de Saída

### Exemplo 1 — Texto e requisitos para registo

Cria o texto e os requisitos mínimos de privacidade para o ecrã de registo da PWA DATERRA Smart 2. Quero uma checkbox não pré-selecionada, com texto curto, claro e em português de Portugal, explicando que o utilizador aceita a política de privacidade e o tratamento dos dados necessários à criação da conta. Inclui também um texto curto adicional a informar que o email será usado para autenticação e gestão da conta e que a app pode guardar histórico pessoal e logs leves de utilização para funcionamento e gestão interna da plataforma. Gera ainda os requisitos mínimos de implementação: link direto para a política de privacidade, registo da data e versão da aceitação, separação entre histórico do utilizador e logs administrativos, e linguagem clara para utilizadores não técnicos.

### Exemplo 2 — Política de privacidade simples

Escreve uma política de privacidade simples, clara e pronta a publicar para a PWA DATERRA Smart 2. A app recolhe nome e email no registo, palavra-passe encriptada no sistema, histórico de utilização por utilizador e logs leves com informação sobre ferramentas acedidas. A política deve explicar que dados são recolhidos, para que finalidades, como são protegidos de forma geral, durante quanto tempo podem ser conservados de forma razoável, quem pode aceder internamente, e como o utilizador pode pedir acesso, correção ou eliminação dos seus dados. Usa português de Portugal, linguagem simples e sem juridiquês excessivo. Não prometas mais do que uma app leve em cPanel pode realisticamente garantir.

### Exemplo 3 — Aviso curto sobre email e logs

Cria dois textos curtos para a DATERRA Smart 2: um aviso sobre recolha de email e outro sobre logs leves de utilização. O aviso do email deve explicar que o email é usado para autenticação, gestão da conta e associação do histórico pessoal. O aviso dos logs deve explicar, de forma ética e simples, que a plataforma regista de forma limitada as ferramentas usadas e as ações principais para gestão técnica e melhoria funcional. Ambos os textos devem ser transparentes, curtos, claros e adequados a um utilizador não técnico.

### Exemplo 4 — Prompt para implementação alinhada com RGPD

Gera um prompt para o Cursor AI que alinhe a implementação técnica da DATERRA Smart 2 com requisitos mínimos de privacidade. Quero que o sistema de registo tenha checkbox de consentimento não pré-selecionada, link para política de privacidade, registo da aceitação com data e versão, e textos claros sobre uso de email, histórico e logs. Garante que o histórico por utilizador é privado, que os logs internos são leves e separados, que os dados sensíveis não ficam expostos no frontend e que a política fica acessível por URL estável dentro da aplicação. Mantém o texto em português de Portugal e orientado a uma app Node.js simples alojada em cPanel.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Escreve uma política de privacidade.”
- “Faz um texto de RGPD.”
- “Cria um aviso para os utilizadores.”
- “Mete uma checkbox de consentimento.”
- “Faz compliance para a app.”

Motivo:
- são vagos;
- não definem dados recolhidos;
- não definem finalidades;
- não definem distinção entre email, histórico e logs;
- não definem requisitos mínimos de implementação;
- não ajudam a alinhar texto e produto real.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um texto final pronto a usar ou um prompt corrido pronto para colar numa IA de implementação, conforme o pedido do utilizador.

Essa saída deve incluir explicitamente, quando aplicável:
- que dados são recolhidos;
- para que finalidade;
- como o email é usado;
- como os logs são usados;
- distinção entre histórico e monitorização interna;
- texto de consentimento claro;
- política de privacidade simples;
- direitos do titular dos dados;
- requisitos mínimos de implementação coerentes com o texto;
- linguagem clara em português de Portugal.

Nunca devolver apenas frases genéricas. Nunca esconder recolha de dados. Nunca tratar a privacidade como detalhe secundário.

-----
---
name: pwa-shell-architect
description: Gera prompts completos para definir e preparar a shell base de uma Progressive Web App do projeto DATERRA Smart 2, incluindo web app manifest, ícones, navegação base, comportamento de instalação, service worker, cache essencial, fallback offline e estrutura mínima para experiência mobile-first instalável. Use quando o pedido mencionar PWA, manifest, manifest.webmanifest, ícones, instalação, install prompt, add to home screen, offline, service worker, cache, shell, navegação base, app-like experience, splash screen ou comportamento instalável.
version: 1.0.0
triggers:
  - PWA
  - manifest
  - manifest.webmanifest
  - ícones
  - instalação
  - install
  - add to home screen
  - offline
  - service worker
  - cache
  - shell
  - navegação
  - splash screen
  - standalone
  - theme_color
  - background_color
  - start_url
  - display
---

# pwa-shell-architect

## Contexto

Esta skill existe para gerar prompts prontos para o Cursor AI ou para outra IA de implementação, com o objetivo de construir a shell base da PWA DATERRA Smart 2.

A shell da aplicação é a fundação que permite à app comportar-se como uma PWA instalável e utilizável de forma consistente em smartphone. Isso inclui a definição do `manifest`, a ligação correta no HTML, ícones adequados, estrutura de navegação base, comportamento de instalação e um modo offline essencial suportado por service worker.

A documentação da MDN explica que o **web app manifest** é um ficheiro JSON que fornece ao browser a informação necessária para instalar uma aplicação web, incluindo nome, ícones e forma de apresentação no sistema operativo [web:42][web:54]. A mesma documentação também indica que o manifest deve ser ligado no `<head>` através de `<link rel="manifest" ...>` e que a extensão `.webmanifest` é a forma recomendada, com `Content-Type: application/manifest+json` quando servido corretamente [web:42][web:49].

A MDN também descreve que uma PWA pode ser considerada como tal quando oferece características como instalação e funcionamento offline, sendo o **service worker** o ingrediente central para suporte offline [web:1][web:40]. Em guias de service workers, a MDN reforça que uma PWA funcional precisa de manifest, registo de service worker e estratégia de cache adequada para continuar utilizável sem rede em cenários essenciais [web:52][web:1].

No contexto DATERRA Smart 2, esta skill deve garantir:
- foco mobile-first;
- navegação simples;
- abertura rápida;
- experiência semelhante a app;
- base sólida para futuras calculadoras e módulos;
- comportamento offline mínimo útil em campo;
- legibilidade em exterior;
- estrutura leve e compatível com alojamento simples.

---

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt de arquitetura da shell PWA.

### 1. Ler e interpretar o pedido do utilizador

Antes de produzir o prompt final, identifica:
- se o utilizador quer criar a base PWA de raiz ou adaptar uma app existente;
- se já existe frontend;
- se já existe navegação;
- se já existe manifest;
- se já existe service worker;
- se a app precisa apenas de instalação ou também de offline;
- se o pedido inclui login, histórico ou módulos que condicionem a navegação base;
- se existem requisitos visuais ou de branding já definidos.

Se faltarem dados importantes, a skill deve pedir clarificação simples ao utilizador.

### 2. Classificar o objetivo da shell

Classifica o pedido numa destas categorias:

- criar shell PWA de raiz;
- adaptar app existente para PWA;
- criar manifest e ícones;
- criar base de instalação;
- criar comportamento offline essencial;
- desenhar navegação base da app;
- preparar experiência standalone;
- reforçar estrutura mobile-first;
- preparar fallback offline;
- consolidar app shell para calculadoras e módulos agrícolas.

### 3. Definir a função da shell PWA

A skill deve sempre assumir que a shell PWA serve para:
- carregar rapidamente a estrutura principal da app;
- dar uma navegação estável;
- permitir instalação no dispositivo;
- manter uma base funcional mínima sem rede;
- criar sensação de aplicação nativa em smartphone.

A shell não é o local para lógica de negócio complexa. É a base estrutural e experiencial da aplicação.

### 4. Definir o manifest como elemento obrigatório

A skill deve obrigar sempre o prompt final a pedir criação ou revisão de um ficheiro `manifest.webmanifest`.

O prompt deve instruir a implementação para incluir, no mínimo:
- `name`;
- `short_name`;
- `id`;
- `start_url`;
- `scope`;
- `display`;
- `background_color`;
- `theme_color`;
- `icons`.

A MDN explica que o manifest é o ficheiro que informa o browser sobre como a aplicação deve ser instalada e apresentada, sendo os ícones, nome e forma de apresentação elementos centrais [web:42][web:54]. A referência do membro `id` também é importante para identificar unicamente a aplicação dentro da mesma origem, devendo ser coerente com `start_url` [web:46].

### 5. Definir valores recomendados para a DATERRA Smart 2

A skill deve orientar os prompts para uma PWA agrícola DATERRA Smart 2 com estas decisões por defeito, salvo indicação em contrário:
- nome completo da app;
- nome curto utilizável no ecrã inicial;
- `display: standalone`;
- `start_url` controlado e previsível;
- `scope` alinhado com a raiz da aplicação;
- cores coerentes com identidade visual simples e legível;
- ícones suficientes para instalação em dispositivos modernos.

A MDN indica que membros como `display`, `background_color`, `theme_color`, `start_url` e ícones influenciam diretamente a experiência de instalação, arranque e splash screen gerado pelo sistema [web:42].

### 6. Definir regras de ícones

A skill deve obrigar o prompt a pedir:
- ícones em PNG ou formato compatível;
- pelo menos tamanhos adequados para instalação moderna, como 192x192 e 512x512;
- versões visualmente legíveis em fundo claro e escuro, quando necessário;
- estilo simples, reconhecível e consistente com uso agrícola;
- nomeação e localização previsíveis.

A MDN mostra exemplos típicos de manifest com ícones em 192x192 e 512x512, dimensões amplamente usadas para instalação e apresentação da aplicação [web:48][web:42].

### 7. Ligar corretamente o manifest ao HTML

A skill deve obrigar o prompt final a mandar verificar:
- ligação do manifest no `<head>`;
- uso de caminho correto;
- revisão de MIME type quando relevante;
- uso de `crossorigin="use-credentials"` apenas se o manifest exigir credenciais.

A documentação da MDN indica claramente que o manifest deve ser ligado via `<link rel="manifest" href="...">` e que, se o ficheiro exigir credenciais, o atributo `crossorigin` deve ser definido como `use-credentials` [web:42][web:49].

### 8. Definir a navegação base da shell

A skill deve mandar o prompt estruturar a navegação principal da PWA de forma simples, previsível e focada em smartphone.

A navegação base deve considerar:
- ecrã inicial;
- acesso às calculadoras;
- acesso às bibliotecas técnicas;
- acesso ao histórico;
- acesso ao perfil ou conta, quando existir;
- padrão simples de topo, fundo ou cartões principais, sem excesso de níveis.

A navegação deve ser desenhada para uso rápido em campo, com botões grandes, rótulos claros e baixa carga cognitiva.

### 9. Definir comportamento de instalação

A skill deve obrigar o prompt a pedir:
- preparação da app para comportamento instalável;
- tratamento claro do fluxo de instalação quando suportado pelo browser;
- botão ou ação discreta para “Instalar aplicação” quando apropriado;
- fallback elegante quando o browser não suportar a instalação programática;
- ausência de mensagens confusas.

A MDN descreve que PWAs podem ser instaladas no dispositivo e funcionar de modo semelhante a apps nativas, desde que cumpram os requisitos aplicáveis do ambiente [web:1][web:40].

### 10. Definir o service worker como base do offline

A skill deve obrigar o prompt final a mandar implementar ou rever o registo do service worker.

O prompt deve exigir:
- registo seguro do service worker;
- ativação apenas em contexto apropriado;
- cache da shell mínima;
- estratégia simples e previsível;
- atualização controlada;
- fallback offline útil.

A MDN afirma que o suporte de service worker é o ingrediente essencial das PWAs e base das capacidades offline [web:1]. Nos tutoriais da MDN, o passo seguinte após criar o manifest é precisamente adicionar o código necessário para que a aplicação funcione offline através de service worker [web:52].

### 11. Definir offline essencial, não offline total

A skill deve deixar claro que o modo offline essencial da DATERRA Smart 2 deve cobrir o mínimo útil:

- shell da aplicação;
- ecrã inicial;
- navegação base;
- assets críticos;
- página offline;
- alguns conteúdos estáticos essenciais;
- formulários locais ou interfaces mínimas, quando possível.

A skill não deve prometer funcionamento offline total de módulos que dependam necessariamente de API, autenticação remota ou dados dinâmicos não cacheados.

### 12. Definir estratégia de cache simples e robusta

A skill deve orientar o prompt para uma estratégia de cache prudente, leve e compreensível:

- pré-cache apenas dos ficheiros essenciais da shell;
- cache estática para assets críticos;
- fallback offline claro;
- evitar cache excessiva de dados dinâmicos sensíveis;
- atualizar caches de forma controlada.

A documentação e materiais introdutórios da MDN sobre PWA e service workers explicam que o funcionamento offline passa por download prévio dos recursos necessários e gestão cuidada da cache [web:1][web:49][web:52].

### 13. Definir página ou estado offline

A skill deve obrigar o prompt a incluir:
- uma página offline simples, clara e leve;
- mensagem compreensível para o utilizador;
- acesso a navegação mínima;
- indicação de que algumas funções podem estar indisponíveis sem internet;
- manutenção da identidade visual da app.

Isto é especialmente importante no contexto agrícola, onde a ligação pode falhar em campo.

### 14. Definir comportamento visual da app instalada

A skill deve mandar o prompt garantir que a aplicação instalada:
- abre sem sensação de site tradicional;
- tenha cabeçalho e navegação estáveis;
- use layout confortável para smartphone;
- respeite áreas seguras e barras do sistema;
- mantenha consistência visual entre arranque online e offline;
- tenha splash coerente com `theme_color`, `background_color`, nome e ícones.

A MDN indica que, em alguns browsers e sistemas operativos, o splash screen é gerado automaticamente com base em membros do manifest, nomeadamente cor de fundo, cor do tema, ícones e outros detalhes da app [web:42].

### 15. Definir atualização e manutenção mínima

A skill deve orientar o prompt para:
- estratégia simples de atualização do service worker;
- evitar estados confusos com cache antiga;
- manter versão da shell controlada;
- prever atualização dos ícones e manifest de forma consistente;
- não complicar a lógica de atualização desnecessariamente.

### 16. Definir integração com cPanel e alojamento simples

Como a DATERRA Smart 2 será pensada para cPanel, a skill deve pedir que a arquitetura PWA:
- use caminhos estáticos previsíveis;
- coloque o `manifest.webmanifest` e ícones em locais estáveis;
- mantenha o service worker num local acessível dentro do scope necessário;
- evite configurações de servidor complexas sempre que possível;
- seja compatível com deploy por `.zip`.

### 17. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para colar no Cursor AI ou noutra IA de implementação;
- em texto corrido;
- sem código como resposta principal;
- objetiva;
- orientada à execução;
- focada na base PWA;
- sem vagueza.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não inventar requisitos de instalação que dependam de um único browser como se fossem universais.
- Não prometer offline total sem analisar dependências reais.
- Não misturar a shell PWA com backend complexo.
- Não gerar prompts vagos do tipo “transforma isto numa PWA”.
- Não esquecer o manifest.
- Não esquecer os ícones.
- Não esquecer o service worker.
- Não esquecer a navegação base.
- Não esquecer o comportamento de instalação.
- Não esquecer a página ou estado offline.
- Não propor bibliotecas exóticas para algo que pode ser feito de forma nativa.
- Não tornar a shell excessivamente pesada.
- Não assumir que todos os módulos funcionam offline da mesma forma.
- Não complicar a experiência móvel com navegação confusa.
- Não omitir caminhos e ficheiros fundamentais.

A prioridade é sempre criar uma base PWA leve, clara, instalável, previsível e útil para o ecossistema DATERRA Smart 2.

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Criar shell PWA de raiz

Quero que prepares a shell base da PWA DATERRA Smart 2 para uma experiência mobile-first instalável e com funcionamento offline essencial. Cria ou revê o manifest.webmanifest com name, short_name, id, start_url, scope, display standalone, background_color, theme_color e ícones adequados para instalação moderna, incluindo pelo menos tamanhos equivalentes a 192x192 e 512x512. Garante que o manifest é corretamente ligado no head da aplicação. Define também a navegação base da app com acesso simples ao início, calculadoras, bibliotecas técnicas, histórico e conta, sempre com foco em smartphone, botões grandes e legibilidade em exterior. Implementa o registo do service worker, cacheia apenas a shell essencial e cria um fallback offline claro e leve, com página offline e navegação mínima. A app instalada deve abrir com aspeto de aplicação, navegação estável e estrutura pronta para crescer com novos módulos.

### Exemplo 2 — Adaptar app existente para PWA instalável

Adapta esta aplicação DATERRA Smart 2 já existente para se comportar como uma PWA instalável. Revê a estrutura atual e adiciona tudo o que for fundamental: manifest.webmanifest completo, ícones de instalação, ligação correta do manifest no HTML, comportamento standalone, theme_color, background_color, start_url e scope coerentes. Implementa ou corrige o service worker para oferecer offline essencial da shell, incluindo cache dos assets críticos e uma página offline simples. Cria um fluxo de instalação discreto e claro quando o browser suportar essa funcionalidade. Garante que a navegação base da app continua simples em smartphone e que a experiência instalada se aproxima da de uma app nativa sem complicar a arquitetura.

### Exemplo 3 — Reforçar offline essencial para uso em campo

Quero que reestrutures a base PWA da DATERRA Smart 2 para garantir uso mínimo em campo sem internet. Mantém a app leve e mobile-first. Revê o manifest, os ícones e o service worker. Garante que a shell principal, a navegação base, o ecrã inicial e os assets críticos ficam disponíveis offline. Cria uma página offline clara e útil, explicando que algumas funções dependentes de dados online podem não estar disponíveis. Evita cache excessiva de conteúdos dinâmicos e concentra-te num offline essencial robusto, previsível e fácil de manter. A aplicação deve continuar instalável e com comportamento consistente entre arranque online e offline.

### Exemplo 4 — Preparar shell PWA para deploy simples

Prepara a shell PWA da DATERRA Smart 2 para alojamento simples, com ficheiros estáticos previsíveis e compatíveis com deploy por .zip em cPanel. Quero manifest.webmanifest bem definido, ícones organizados, ligação correta no head, service worker colocado no local certo para cobrir o scope necessário da app e navegação base clara para smartphone. Garante que a instalação funciona de forma coerente, que a app abre em modo standalone e que existe fallback offline para a shell principal. Mantém a solução nativa, leve e fácil de atualizar no futuro sem dependências desnecessárias.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Transforma isto numa PWA.”
- “Cria um manifest.”
- “Adiciona offline.”
- “Faz a app instalável.”
- “Mete service worker.”

Motivo:
- são vagos;
- não definem estrutura mínima;
- não definem navegação base;
- não definem membros fundamentais do manifest;
- não definem estratégia offline;
- não definem comportamento de instalação;
- não ajudam a construir uma shell PWA real e reutilizável.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido, completo e pronto para colar numa IA de implementação.

Esse prompt deve incluir explicitamente:
- objetivo da shell PWA;
- manifest.webmanifest;
- membros fundamentais do manifest;
- ícones;
- ligação do manifest ao HTML;
- navegação base;
- comportamento de instalação;
- registo do service worker;
- cache essencial;
- fallback offline;
- comportamento visual em modo instalado;
- compatibilidade com crescimento futuro da DATERRA Smart 2.

Nunca devolver apenas recomendações soltas. Nunca omitir elementos essenciais da base PWA. Nunca complicar a shell com lógica que não pertence à camada base.

-----
---
name: sqlite-auth-history-designer
description: Gera prompts completos para estruturar autenticação simples e segura na PWA DATERRA Smart 2, com login, registo, hashing com bcrypt, histórico por utilizador, logs leves de utilização e persistência em SQLite ou MySQL simples, sempre com foco em alojamento partilhado compatível com cPanel. Use quando o pedido mencionar SQLite, MySQL, login, registo, bcrypt, autenticação, histórico, logs, users, sessões, base de dados, persistência, RGPD, tool_history, usage_logs ou estrutura de dados por utilizador.
version: 1.0.0
triggers:
  - sqlite
  - mysql
  - login
  - registo
  - bcrypt
  - autenticação
  - histórico
  - logs
  - utilizador
  - users
  - sessão
  - base de dados
  - persistência
  - rgpd
  - tool_history
  - usage_logs
  - account
  - signup
  - signin
---

# sqlite-auth-history-designer

## Contexto

Esta skill existe para gerar prompts prontos para o Cursor AI ou para outra IA de implementação, com o objetivo de desenhar a estrutura técnica de autenticação, histórico por utilizador e logs leves da PWA DATERRA Smart 2.

O foco desta skill é criar uma base de dados simples, segura e compatível com alojamento partilhado, especialmente em ambientes cPanel, usando preferencialmente `SQLite` para cenários leves ou `MySQL` quando houver necessidade clara de maior robustez multiutilizador.

A referência consultada sobre o uso oficial de Skills da Perplexity confirma que uma skill pode ser criada por upload de um `.md` direto ou por `.zip` com `SKILL.md` na raiz, e que o ficheiro deve conter `name` e `description` no frontmatter YAML [page:1]. Também confirma que a `description` é crítica para ativação automática, pelo que deve incluir palavras-chave relevantes e explicar claramente quando a skill deve ser usada [page:1].

No contexto DATERRA Smart 2, esta skill deve estruturar:
- registo de utilizador;
- login seguro;
- hashing de palavras-passe com `bcrypt`;
- histórico privado por utilizador;
- logs leves de utilização;
- persistência mínima útil;
- respeito por privacidade e boas práticas RGPD.

A skill não deve desenhar o interface visual. Deve apenas gerar prompts de arquitetura lógica e de dados.

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt.

### 1. Ler e interpretar o pedido do utilizador

Antes de produzir o prompt final, identifica:
- se o pedido é para login e registo;
- se o pedido inclui recuperação de acesso ou apenas autenticação base;
- se é necessário guardar histórico de cálculos ou apenas dados de conta;
- se devem existir logs de uso;
- se a base de dados preferida é SQLite ou MySQL;
- se o sistema já existe e precisa apenas de ser reorganizado;
- se a app será alojada em cPanel;
- se existe frontend já preparado.

Se faltarem dados essenciais, a skill deve pedir esclarecimentos simples antes de avançar.

### 2. Classificar o tipo de estrutura necessária

Classifica o pedido numa destas categorias:
- autenticação base com login e registo;
- autenticação com histórico por utilizador;
- autenticação com logs leves;
- estrutura completa de users + history + logs;
- migração de SQLite para MySQL simples;
- revisão de segurança e persistência;
- organização de tabelas para calculadoras agrícolas;
- arquitetura mínima para app multiutilizador;
- persistência simples compatível com cPanel.

### 3. Escolher a base de dados recomendada

A skill deve tomar uma decisão clara e simples:
- usar `SQLite` quando a aplicação for leve, o número de utilizadores for moderado e a prioridade for simplicidade de deploy;
- usar `MySQL` quando a aplicação precisar de maior robustez, mais utilizadores concorrentes ou quando o cPanel já tiver uma base de dados preparada para esse fim.

A decisão deve ser explicada de forma curta, prática e adequada a alojamento partilhado.

### 4. Definir entidades principais

A skill deve instruir sempre a decomposição do sistema nas entidades mínimas adequadas.

As entidades base recomendadas para DATERRA Smart 2 são:
- `users`;
- `tool_history`;
- `usage_logs`;
- `privacy_acceptance`;
- `sessions` ou mecanismo equivalente, quando aplicável.

Se o projeto precisar de guardar resultados favoritos ou perfis adicionais, isso deve ser uma extensão opcional e não obrigatória.

### 5. Definir estrutura mínima da tabela users

A skill deve obrigar o prompt final a pedir uma estrutura de utilizadores com campos mínimos como:
- id;
- nome;
- email;
- password_hash;
- estado da conta, se necessário;
- created_at;
- updated_at.

A palavra-passe nunca deve ser guardada em texto simples. Deve existir apenas um campo para o hash seguro.

### 6. Definir estrutura mínima da tabela privacy_acceptance

Sempre que existir registo, a skill deve sugerir uma estrutura simples para guardar aceitação da política de privacidade, com campos como:
- id;
- user_id;
- versão da política;
- accepted_at.

Isto ajuda a manter rastreabilidade mínima alinhada com boas práticas de privacidade.

### 7. Definir estrutura mínima da tabela tool_history

Sempre que a aplicação guardar uso de ferramentas ou resultados, a skill deve pedir uma tabela de histórico por utilizador, com campos como:
- id;
- user_id;
- tool_name;
- input_summary;
- result_summary;
- created_at;
- opcionalmente metadata simples, se necessário.

O histórico deve ser sempre ligado ao utilizador autenticado.

### 8. Definir estrutura mínima da tabela usage_logs

A skill deve pedir uma tabela leve de logs, destinada a monitorização discreta e gestão interna.

Campos recomendados:
- id;
- user_id, quando existir sessão;
- tool_name ou module_name;
- action_type;
- created_at;
- opcionalmente contexto mínimo, sem recolha excessiva.

Os logs não devem ser pesados, nem guardar dados sensíveis desnecessários.

### 9. Definir relações e controlo de acesso

A skill deve obrigar o prompt a deixar claro que:
- um utilizador só pode ver os seus próprios registos de histórico;
- um utilizador só pode ver os seus próprios dados de conta;
- o backend deve validar sessão antes de devolver histórico ou dados privados;
- queries devem ser sempre filtradas por `user_id` quando aplicável;
- logs administrativos não devem ficar expostos ao utilizador comum.

### 10. Definir autenticação segura

Sempre que o pedido envolver login ou registo, a skill deve obrigar estas medidas:
- hashing de palavra-passe com `bcrypt`;
- verificação de password através de comparação segura;
- validação de email único;
- validação de campos obrigatórios;
- confirmação de palavra-passe no registo;
- proteção mínima das rotas privadas;
- gestão de sessão ou token simples e estável;
- destruição da sessão no logout;
- nunca devolver `password_hash` ao frontend.

A skill deve reforçar que `bcrypt` é obrigatório sempre que houver palavra-passe.

### 11. Definir regras de validação

A skill deve obrigar o prompt final a pedir validações no frontend e no backend, incluindo:
- campos vazios;
- email inválido;
- passwords demasiado fracas, se aplicável;
- passwords não coincidentes;
- duplicação de email;
- inputs malformados;
- tentativas de escrita inválida na base de dados;
- ausência de sessão em pedidos privados.

As mensagens de erro devem ser claras e não técnicas.

### 12. Definir histórico útil mas leve

A skill deve orientar a implementação para guardar no histórico apenas o que for realmente útil:
- nome da ferramenta;
- resumo dos inputs;
- resumo dos resultados;
- data e hora;
- ligação ao utilizador.

Não deve guardar tudo indiscriminadamente. Deve privilegiar utilidade, leveza e privacidade.

### 13. Definir logs leves e éticos

A skill deve impor que os logs:
- sejam discretos;
- sirvam apenas para monitorização interna;
- guardem o mínimo necessário;
- evitem excesso de detalhe pessoal;
- não sobrecarreguem a escrita no alojamento partilhado.

Campos como `user_id`, ferramenta usada, ação principal e timestamp são geralmente suficientes.

### 14. Definir estratégia de sessões

A skill deve pedir uma solução de sessão simples e robusta para contexto cPanel.

Pode ser:
- sessão server-side;
- cookie seguro;
- ou mecanismo equivalente simples.

A prioridade é evitar complexidade desnecessária. Se a app for leve, a skill deve favorecer uma solução direta e fácil de manter.

### 15. Definir organização técnica mínima

A skill deve mandar o prompt estruturar a implementação de forma clara, por exemplo com:
- acesso à base de dados;
- modelos ou queries;
- serviços de autenticação;
- controladores;
- middleware de sessão ou autenticação;
- rotas públicas;
- rotas protegidas.

A organização deve ser simples e compatível com upload por `.zip` e arranque em cPanel.

### 16. Definir uso de variáveis de ambiente

Sempre que houver base de dados, segredos, sessão ou APIs, a skill deve pedir:
- uso de variáveis de ambiente;
- ficheiro `.env.example` ou lista clara das variáveis necessárias;
- ausência de segredos no código;
- nomes simples e previsíveis para variáveis.

A referência consultada sobre cPanel mostra que as variáveis de ambiente podem e devem ser configuradas no painel da aplicação [page:1].

### 17. Definir compatibilidade com cPanel

A skill deve garantir que a arquitetura sugerida:
- não depende de serviços externos complexos;
- funciona com Node.js simples;
- é compatível com `Setup Node.js App`;
- usa `package.json`;
- pode ser instalada com `Run NPM Install`;
- corre com ficheiro de arranque claro;
- pode ser publicada por `.zip`.

As referências consultadas mostram precisamente este fluxo como padrão de alojamento Node.js em cPanel [page:1].

### 18. Definir comportamento RGPD mínimo

Sempre que houver registo e logs, a skill deve obrigar o prompt a prever:
- política de privacidade simples no registo;
- aceitação explícita dessa política;
- recolha mínima de dados;
- separação entre histórico funcional e logs administrativos;
- proteção de dados sensíveis.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para colar no Cursor AI;
- em texto corrido;
- orientada à implementação;
- sem código na resposta principal;
- sem vagueza;
- sem explicações académicas longas.

## Restrições

A skill deve respeitar rigorosamente estas restrições:
- Não guardar palavras-passe em texto simples.
- Não omitir `bcrypt`.
- Não expor hashes ao frontend.
- Não criar histórico global visível a todos os utilizadores.
- Não misturar logs administrativos com histórico pessoal do utilizador.
- Não inventar campos desnecessários.
- Não criar esquemas pesados para uma app leve.
- Não depender de cloud externa para autenticação básica.
- Não omitir validação de email único.
- Não omitir controlo de sessão.
- Não omitir filtragem por `user_id`.
- Não gerar prompts vagos como “faz login e histórico”.
- Não esquecer variáveis de ambiente.
- Não esquecer compatibilidade com cPanel.
- Não esquecer privacidade e RGPD.
- Não complicar a solução com arquitetura excessiva.

A prioridade é sempre uma solução simples, segura, leve e estável para DATERRA Smart 2.

## Exemplos de Prompt de Saída

### Exemplo 1 — Estrutura completa com SQLite

Quero que cries a arquitetura lógica completa de autenticação e histórico da PWA DATERRA Smart 2 usando SQLite, porque a aplicação será leve e alojada em cPanel. Estrutura a base de dados com as tabelas users, privacy_acceptance, tool_history e usage_logs. Na tabela users inclui id, nome, email, password_hash, created_at e updated_at. Implementa registo com validação de campos obrigatórios, email único, confirmação de palavra-passe e aceitação da política de privacidade. Usa bcrypt obrigatoriamente para hashing das palavras-passe e garante que nenhum hash é devolvido ao frontend. Implementa login com verificação segura da password e gestão simples de sessão. Garante rotas protegidas para histórico privado. Na tool_history guarda user_id, nome da ferramenta, resumo dos inputs, resumo dos resultados e data. Na usage_logs guarda user_id, ferramenta, ação principal e timestamp, de forma leve e ética. Mantém a solução compatível com cPanel, package.json, variáveis de ambiente e deploy simples por .zip.

### Exemplo 2 — Estrutura com MySQL simples

Quero que desenhes a estrutura de autenticação e histórico por utilizador da DATERRA Smart 2 usando MySQL simples, compatível com cPanel. Mantém a arquitetura leve e organizada em acesso à base de dados, serviços de autenticação, middleware de sessão e rotas protegidas. Cria a tabela users com email único e password_hash em vez de password em texto simples. Usa bcrypt obrigatoriamente no registo e login. Implementa também as tabelas tool_history e usage_logs, sempre filtradas por user_id quando os dados forem privados. Garante validação de inputs, mensagens de erro claras, política de privacidade no registo, variáveis de ambiente para credenciais da base de dados e nenhuma dependência cloud desnecessária.

### Exemplo 3 — Login e histórico para calculadoras agrícolas

Quero que cries uma estrutura simples de login, sessões, histórico por utilizador e logs leves para uma PWA agrícola DATERRA Smart 2 com várias calculadoras. O frontend já existe. Agora preciso da lógica de persistência. Usa SQLite se for suficiente para alojamento partilhado. Garante que cada cálculo guardado no histórico fica ligado ao user_id, ao nome da ferramenta, ao resumo dos valores inseridos e ao resultado principal. Implementa registo, login com bcrypt, logout, proteção de rotas privadas e consulta do histórico por ordem decrescente. Se o utilizador não estiver autenticado, não deve conseguir ver histórico privado. Os logs devem guardar apenas user_id, ferramenta usada, tipo de ação e timestamp. Mantém a solução leve, clara e pronta para deploy em cPanel.

### Exemplo 4 — Revisão de estrutura existente

Revê esta implementação existente da DATERRA Smart 2 e reorganiza a parte de autenticação, histórico e logs para uma solução simples e robusta em SQLite ou MySQL simples. Quero que identifiques o que falta em segurança, como hashing com bcrypt, email único, filtragem por user_id, proteção de rotas e separação entre histórico pessoal e logs administrativos. Reorganiza a base de dados com tabelas mínimas, validações corretas e variáveis de ambiente, mantendo total compatibilidade com app Node.js alojada em cPanel. Não compliques a arquitetura e não cries módulos desnecessários.

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:
- “Cria login com SQLite.”
- “Faz autenticação e histórico.”
- “Guarda os cálculos por utilizador.”
- “Usa bcrypt e logs.”
- “Monta uma base de dados simples.”

Motivo:
- são vagos;
- não definem tabelas;
- não definem campos mínimos;
- não definem controlo de acesso;
- não definem separação entre histórico e logs;
- não definem validações;
- não definem compatibilidade com cPanel.

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido, completo e pronto para colar numa IA de implementação.

Esse prompt deve incluir explicitamente:
- a escolha entre SQLite ou MySQL simples;
- a estrutura das tabelas principais;
- bcrypt obrigatório;
- validações de registo e login;
- controlo de sessão;
- histórico por utilizador;
- logs leves;
- filtragem por user_id;
- variáveis de ambiente;
- compatibilidade com cPanel;
- resultado funcional esperado.

Nunca devolver apenas ideias soltas. Nunca omitir segurança básica. Nunca misturar histórico pessoal com logs administrativos.

-----
---
name: usage-analytics-light
description: Gera prompts e instruções para implementar monitorização leve e ética de uso na PWA DATERRA Smart 2, com foco em analytics mínimos, contagem de acessos, ferramentas usadas, eventos essenciais, privacidade, RGPD, histórico de utilização, relatórios simples e compatibilidade com cPanel. Use quando o pedido mencionar analytics, monitorização, uso, eventos, métricas, logs, relatórios, ferramentas acedidas, contagem de acessos, telemetria leve, uso da app, painel administrativo ou estatísticas internas.
version: 1.0.0
triggers:
  - analytics
  - monitorização
  - uso
  - eventos
  - métricas
  - logs
  - relatórios
  - ferramentas acedidas
  - contagem de acessos
  - telemetria leve
  - uso da app
  - painel administrativo
  - estatísticas internas
  - analytics leves
  - usage
  - usage logs
  - activity
---

# usage-analytics-light

## Contexto

Esta skill existe para gerar prompts e instruções para implementar uma camada de monitorização leve e ética na PWA DATERRA Smart 2.

O objetivo é recolher apenas os dados mínimos necessários para compreender uso da aplicação, identificar ferramentas mais acedidas, apoiar decisões de melhoria e manter um registo interno simples, sem criar um sistema pesado de análise nem comprometer privacidade.

As referências consultadas sobre PWA indicam que a aplicação deve manter experiência rápida, resiliente e progressiva em dispositivos móveis [page:1]. No contexto DATERRA Smart 2, isso significa que a monitorização deve ser leve, discreta e compatível com alojamento em cPanel, evitando excesso de escrita, dependências externas desnecessárias ou recolha excessiva de dados.

Esta skill deve apoiar:
- contagem de acessos por ferramenta;
- registo de eventos essenciais;
- métricas leves de uso;
- painel interno simples;
- associação opcional a utilizador autenticado;
- separação entre histórico funcional e telemetria interna;
- respeito por privacidade e RGPD;
- compatibilidade com SQLite, MySQL ou armazenamento leve em cPanel.

A skill não deve desenhar gráficos complexos nem construir data warehouse. Deve apenas estruturar a monitorização mínima útil para a DATERRA Smart 2.

## Instruções de Execução

Segue sempre este método antes de gerar qualquer prompt ou plano de implementação.

### 1. Ler e interpretar o objetivo da monitorização

Antes de produzir a saída final, identifica:
- se o utilizador quer saber quantas vezes uma ferramenta é usada;
- se quer monitorizar eventos essenciais;
- se quer métricas por utilizador ou apenas globais;
- se existe painel administrativo;
- se a app já tem login;
- se o objetivo é melhoria do produto, auditoria leve ou suporte interno;
- se os dados devem ser agregados diariamente, semanalmente ou por período personalizado.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Definir o princípio de monitorização mínima

A skill deve orientar sempre para recolher apenas o necessário.

Monitorização leve significa:
- poucos eventos;
- poucos campos;
- nada de excesso de detalhe;
- baixo impacto no desempenho;
- escrita reduzida na base de dados;
- foco em métricas úteis, não em vigilância.

A monitorização não deve competir com a experiência do utilizador.

### 3. Definir eventos essenciais

A skill deve obrigar o prompt a usar apenas eventos realmente úteis.

Exemplos de eventos essenciais:
- abertura de ferramenta;
- execução de cálculo;
- consulta de biblioteca;
- envio de fotografia para análise;
- login;
- registo;
- consulta de histórico;
- erro funcional;
- exportação ou download;
- conclusão de ação principal.

Deve evitar eventos demasiado granulares e desnecessários.

### 4. Definir dados mínimos por evento

A skill deve orientar para campos mínimos como:
- id do evento;
- user_id, quando apropriado;
- nome da ferramenta ou módulo;
- tipo de evento;
- timestamp;
- resultado simples do evento;
- metadados leves, se necessários.

Se houver dados adicionais, estes devem ser mínimos e claramente justificados.

### 5. Definir separação entre monitorização e histórico

A skill deve obrigar a distinguir:
- histórico funcional do utilizador, visível para o próprio;
- analytics ou logs internos, reservados à gestão da aplicação.

Esta separação é fundamental para transparência e para evitar mistura de finalidades.

### 6. Definir agregação sempre que possível

A skill deve recomendar que os relatórios mostrem preferencialmente:
- totais por dia;
- totais por semana;
- totais por mês;
- ferramentas mais usadas;
- taxas de erro;
- número de acessos por módulo.

Sempre que possível, a monitorização deve ser agregada para reduzir exposição de dados individuais.

### 7. Definir associação a utilizador com cautela

Se a app tiver login, a skill deve orientar para:
- associar eventos ao user_id quando necessário;
- evitar recolha excessiva de comportamento individual;
- permitir relatórios globais mesmo sem identificação pessoal;
- usar associação restrita ao painel interno.

Se a identificação do utilizador não for necessária, a skill deve preferir registo anónimo ou agregado.

### 8. Definir privacidade e RGPD

A skill deve obrigar o prompt a prever:
- aviso claro de monitorização no texto legal;
- finalidade explícita da recolha;
- minimização de dados;
- retenção limitada;
- acesso restrito aos dados internos;
- não utilização para fins fora do âmbito comunicado.

A monitorização deve ser ética, transparente e proporcional.

### 9. Definir retenção de dados

A skill deve orientar para:
- guardar apenas durante o tempo necessário;
- definir política de retenção simples;
- permitir limpeza automática ou periódica;
- não acumular eventos indefinidamente sem necessidade.

A retenção deve ser leve e compatível com alojamento partilhado.

### 10. Definir painel interno simples

A skill deve pedir um painel administrativo com informação útil como:
- ferramentas mais usadas;
- número de eventos por período;
- erros mais frequentes;
- utilizadores ativos, quando apropriado;
- tendências simples de uso;
- resumo por módulo.

O painel deve ser claro, rápido e sem complexidade excessiva.

### 11. Definir abordagem técnica leve

A skill deve orientar para uma solução simples:
- SQLite quando o volume for pequeno;
- MySQL simples quando a app já usar esse motor;
- backend Node.js ou PHP leve;
- queries simples;
- índices mínimos e úteis;
- escrita controlada na base de dados.

A solução deve funcionar bem em cPanel.

### 12. Definir compatibilidade com cPanel

A skill deve garantir que a implementação:
- funcione em alojamento partilhado;
- use variáveis de ambiente se necessário;
- não dependa de serviços externos complexos;
- seja fácil de subir por `.zip`;
- tenha configuração clara no painel;
- não exija infraestrutura pesada.

### 13. Definir relatórios e métricas úteis

A skill deve orientar a apresentação de métricas como:
- número de utilizações por ferramenta;
- utilizadores ativos por período;
- eventos concluídos com sucesso;
- erros por módulo;
- crescimento do uso ao longo do tempo;
- ferramentas mais populares.

A finalidade é orientar decisões, não criar vigilância detalhada.

### 14. Definir tratamento de erros

A skill deve prever eventos como:
- falha de cálculo;
- falha de envio;
- erro de API;
- erro de validação;
- timeout;
- indisponibilidade temporária.

Os erros devem ser registados de forma simples para suporte e melhoria.

### 15. Definir performance

A skill deve obrigar a:
- reduzir número de writes;
- evitar consultas pesadas;
- evitar cálculos complexos a cada evento;
- agrupar eventos quando possível;
- não afetar a fluidez do uso da app.

A monitorização deve ser invisível para o utilizador normal.

### 16. Definir integração com outros módulos DATERRA

A skill deve pedir ligação com:
- calculadoras agrícolas;
- biblioteca técnica;
- meteorologia;
- visão por imagem;
- login e histórico;
- painel administrativo.

A monitorização deve servir o ecossistema, sem se tornar uma camada isolada.

### 17. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompts para implementar analytics leves;
- prompts para o Cursor AI com schema de eventos;
- estruturas de tabelas mínimas;
- regras de retenção e privacidade;
- especificação de painel interno;
- checklist de eventos úteis;
- definição de relatórios e métricas.

### 18. Definir linguagem e tom

A saída final deve:
- usar português de Portugal;
- ser clara e direta;
- ser compreensível por utilizadores sem programação;
- manter foco em utilidade prática;
- evitar termos analíticos desnecessários;
- estar pronta para colar noutra IA.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para copiar e colar;
- sem código na resposta principal;
- organizada;
- operacional;
- orientada à implementação real.

## Restrições

A skill deve respeitar rigorosamente estas restrições:
- Não recolher mais dados do que o necessário.
- Não transformar analytics em vigilância invasiva.
- Não guardar detalhes excessivos de comportamento.
- Não misturar histórico pessoal com telemetria interna.
- Não depender de serviços analíticos externos complexos.
- Não criar painéis pesados ou complicados.
- Não esquecer retenção limitada.
- Não esquecer transparência no aviso ao utilizador.
- Não esquecer compatibilidade com cPanel.
- Não usar linguagem ambígua.
- Não criar métricas sem utilidade prática.
- Não sobrecarregar o servidor com escrita excessiva.
- Não gerar prompts vagos como “mete analytics na app”.

A prioridade é sempre monitorização leve, ética, útil e compatível com a realidade da DATERRA Smart 2.

## Exemplos de Prompt de Saída

### Exemplo 1 — Métricas por ferramenta

Quero implementar uma camada de analytics leves na DATERRA Smart 2 para saber quantas vezes cada ferramenta é usada. O sistema deve registar apenas eventos essenciais, como abertura de ferramenta, conclusão de ação e erro funcional. Guarda o mínimo de dados possível, associa ao utilizador só quando necessário e mostra um painel interno com totais por ferramenta, por dia e por semana. Mantém a solução leve, compatível com cPanel e sem dependências externas complexas.

### Exemplo 2 — Monitorização ética com login

Quero que cries a lógica de monitorização leve da DATERRA Smart 2 para utilizadores autenticados. Regista eventos simples como login, uso de calculadoras, consulta de histórico e envio de imagem, sempre com timestamp e identificador mínimo. A implementação deve separar claramente histórico funcional de analytics internos, ter retenção limitada e permitir relatórios agregados no painel administrativo. A app deve manter transparência sobre esta monitorização e ser compatível com SQLite ou MySQL simples em cPanel.

### Exemplo 3 — Painel interno simples

Quero um painel interno de analytics para a DATERRA Smart 2 com métricas simples e úteis: ferramentas mais usadas, utilizadores ativos por período, erros mais frequentes e volume de acessos por dia. A recolha deve ser leve, com eventos mínimos e escrita controlada na base de dados. Não quero tracking invasivo nem dados desnecessários. A solução deve funcionar bem em alojamento cPanel e ser fácil de manter.

### Exemplo 4 — Prompt técnico para o Cursor AI

Quero que programes uma solução de usage analytics leves para a DATERRA Smart 2. Cria uma tabela de eventos mínima, regista apenas ações essenciais, associa eventos a user_id apenas quando necessário e mantém retenção limitada. Gera consultas agregadas para o painel administrativo e evita qualquer dependência de serviços externos complexos. A implementação deve ser rápida, ética e compatível com Node.js ou PHP leve em cPanel.

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Adiciona analytics.”
- “Faz monitorização da app.”
- “Guarda os eventos.”
- “Cria um painel de métricas.”
- “Regista o uso.”

Motivo:
- são vagos;
- não definem eventos;
- não definem minimização;
- não definem retenção;
- não definem privacidade;
- não definem compatibilidade com cPanel;
- não definem utilidade prática.

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido ou uma estrutura operacional pronta a usar.

Essa saída deve incluir explicitamente, quando aplicável:
- eventos essenciais;
- dados mínimos por evento;
- agregação simples;
- separação entre histórico e analytics;
- privacidade e RGPD;
- retenção limitada;
- painel interno simples;
- compatibilidade com cPanel.

Nunca devolver apenas ideias soltas. Nunca transformar monitorização em vigilância. Nunca esquecer que a solução deve ser leve e ética.

-----
---
name: vision-diagnosis-router
description: Gera prompts e instruções para configurar um fluxo de reconhecimento de imagens e triagem visual na PWA DATERRA Smart 2, usando a câmara do smartphone para enviar fotografias de pragas, doenças, sintomas, folhas, frutos ou equipamento para uma API de visão como Google Gemini ou OpenAI Vision, com API key segura em .env, processamento externo ao servidor e foco em mobile-first, simplicidade, compatibilidade com cPanel e uso agrícola em campo. Use quando o pedido mencionar visão, imagem, câmara, fotografia, pragas, doenças, diagnóstico visual, reconhecimento de imagem, Gemini, OpenAI Vision, visão computacional, inspeção por foto, triagem visual, sintoma, folha, fruto ou API de imagem.
version: 1.0.0
triggers:
  - visão
  - imagem
  - câmara
  - fotografia
  - pragas
  - doenças
  - diagnóstico visual
  - reconhecimento de imagem
  - gemini
  - openai vision
  - visão computacional
  - inspeção por foto
  - triagem visual
  - sintoma
  - folha
  - fruto
  - api de imagem
  - camera
---

# vision-diagnosis-router

## Contexto

Esta skill existe para gerar prompts e instruções para integrar um fluxo de diagnóstico visual na PWA DATERRA Smart 2, usando a câmara do smartphone para fotografar elementos agrícolas e enviar a imagem para um serviço externo de visão.

O objetivo é permitir uma triagem visual prática e rápida para pragas, doenças, sintomas, folhas, frutos, caule, superfícies ou equipamento, sem sobrecarregar o servidor local. A solução deve ser mobile-first, simples para o utilizador e compatível com alojamento em cPanel.

As referências consultadas sobre PWA reforçam que a experiência deve ser progressiva, responsiva e útil em dispositivos móveis [page:1]. Também indicam que a aplicação deve manter funcionalidade essencial em cenários móveis reais, o que é importante quando o utilizador está no campo e precisa de enviar uma fotografia rapidamente [page:1].

No contexto DATERRA Smart 2, esta skill deve apoiar:
- captura de imagem pela câmara do smartphone;
- envio da fotografia para uma API de visão;
- uso de Google Gemini ou OpenAI Vision, ou outra API equivalente;
- proteção da API key em ficheiro `.env`;
- processamento pesado fora do servidor do utilizador;
- resposta rápida e clara ao utilizador;
- integração com módulos agrícolas e fichas técnicas;
- compatibilidade com Node.js ou PHP leve em cPanel.

Esta skill não deve inventar diagnósticos. Deve apenas estruturar o fluxo técnico, a interface e a lógica de encaminhamento para análise visual.

## Instruções de Execução

Segue sempre este método antes de gerar qualquer prompt ou plano de integração.

### 1. Ler e interpretar o objetivo do diagnóstico

Antes de produzir a saída final, identifica:
- se o utilizador quer detetar pragas, doenças ou ambos;
- se a imagem será de folha, fruto, caule, planta inteira ou outro elemento;
- se o objetivo é triagem, sugestão inicial ou apoio à decisão;
- se a resposta deve ser imediata ou detalhada;
- se existe necessidade de guardar histórico das imagens enviadas;
- se o fluxo deve funcionar sobretudo em smartphone;
- se a app já tem câmara integrada ou precisa de ser criada de raiz.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Definir o fluxo de captura de imagem

A skill deve orientar sempre para um fluxo simples:
- abrir a câmara do smartphone;
- tirar a fotografia;
- rever rapidamente a imagem;
- enviar para análise;
- apresentar resultado curto e claro;
- oferecer ação seguinte, como guardar, repetir ou consultar ficha relacionada.

A captura deve ser pensada para uso em campo, com o menor número possível de passos.

### 3. Priorizar uso em smartphone

A skill deve assumir que o dispositivo principal é o smartphone.

Por isso, deve pedir:
- botão claro para abrir a câmara;
- zona de pré-visualização visível;
- instruções curtas antes da captura;
- interface com poucos elementos;
- botões grandes;
- feedback imediato;
- design legível em exterior.

A experiência deve ser rápida e simples mesmo em ambiente agrícola.

### 4. Definir o que a imagem deve representar

A skill deve obrigar o prompt a esclarecer o tipo de imagem esperada.

Exemplos:
- folha com sintomas;
- fruto com manchas;
- caule ou tronco;
- planta inteira;
- superfície afetada;
- parte do equipamento, se aplicável.

Quanto mais claro for o alvo da fotografia, melhor será a qualidade do diagnóstico.

### 5. Definir instruções de captura

A skill deve pedir que a interface oriente o utilizador com instruções curtas como:
- aproximar a imagem;
- garantir boa luz;
- evitar tremor;
- focar apenas a zona afetada;
- tirar mais do que uma foto se necessário.

O objetivo é melhorar a qualidade do input sem complicar a experiência.

### 6. Definir a API de visão

A skill deve orientar a implementação para usar uma API de visão externa adequada, como:
- Google Gemini com capacidades visuais;
- OpenAI Vision;
- ou outra API equivalente e estável.

A escolha deve depender da disponibilidade, da qualidade de resposta e da facilidade de integração no ambiente do projeto.

### 7. Definir proteção da API key

A skill deve obrigar a que:
- a API key nunca fique no frontend;
- a chave seja guardada em `.env`;
- o backend faça o pedido à API externa;
- a resposta seja filtrada antes de chegar ao utilizador;
- não existam segredos expostos em logs ou no código público.

A proteção da credencial é obrigatória.

### 8. Definir processamento externo

A skill deve exigir que o processamento pesado da imagem aconteça fora do servidor local.

Isso significa:
- imagem enviada do frontend para o backend;
- backend encaminha para a API de visão;
- API externa processa a imagem;
- backend recebe a resposta e formata o resultado;
- frontend mostra apenas o essencial.

A solução deve ser leve e compatível com alojamento partilhado.

### 9. Definir resposta de diagnóstico

A skill deve orientar a resposta do sistema para ser:
- curta;
- clara;
- cautelosa;
- não absoluta;
- útil para triagem;
- acompanhada de recomendação prática, quando apropriado.

Se houver suspeita de praga ou doença, a resposta deve sugerir validação posterior, sem prometer certeza total.

### 10. Definir estrutura de resultado

A skill deve pedir que o resultado inclua, quando fizer sentido:
- hipótese principal;
- nível de confiança aproximado;
- sinais observados;
- observações úteis;
- ação recomendada;
- ligação para ficha ou biblioteca relacionada.

O objetivo é transformar a visão em apoio à decisão, não em diagnóstico médico-científico fechado.

### 11. Definir gestão de múltiplas imagens

Quando fizer sentido, a skill deve prever:
- mais do que uma imagem por análise;
- comparação entre imagens;
- envio opcional de imagem adicional;
- repetição da captura se a primeira estiver fraca.

Isto é especialmente útil em sintomas pouco claros.

### 12. Definir histórico opcional

Se o projeto pedir registo, a skill deve orientar para guardar:
- utilizador;
- data e hora;
- tipo de imagem;
- resultado resumido;
- referência ao caso.

O histórico deve ser leve e alinhado com privacidade e uso prático.

### 13. Definir tratamento de falhas

A skill deve prever:
- câmara sem permissão;
- imagem desfocada;
- imagem demasiado escura;
- API indisponível;
- resposta lenta;
- erro de rede;
- foto sem elemento relevante.

Cada falha deve ter mensagem simples e uma ação de recuperação clara.

### 14. Definir compatibilidade com cPanel

A skill deve garantir que a implementação:
- funcione em Node.js ou PHP leve;
- use ficheiros simples de configuração;
- seja compatível com `.env`;
- possa ser subida por `.zip`;
- não dependa de backend pesado;
- não exija infraestrutura externa complexa.

O objetivo é manter o projeto fácil de alojar e manter.

### 15. Definir privacidade e transparência

A skill deve pedir que a interface avise o utilizador, de forma simples, que:
- a fotografia será enviada para análise externa;
- a imagem pode conter dados agrícolas do terreno;
- o envio serve apenas para diagnóstico visual e apoio à decisão;
- o histórico, se existir, deve ser comunicado de forma clara.

A transparência é essencial quando há envio de imagem para terceiros.

### 16. Definir integração com DATERRA Smart 2

A skill deve procurar ligação com:
- biblioteca técnica de pragas e doenças;
- histórico do utilizador;
- calculadoras agrícolas;
- módulos de alerta ou recomendação;
- páginas de apoio ao diagnóstico.

O resultado da visão deve ser uma porta para conteúdo útil, não uma resposta isolada.

### 17. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompts para o v0.dev com interface mobile-first;
- prompts para o Cursor AI com lógica de upload e integração;
- requisitos de segurança para API keys;
- estrutura de mensagens de erro e carregamento;
- checklist de experiência de captura;
- fluxo de triagem visual com histórico.

### 18. Definir linguagem e tom

A saída final deve:
- usar português de Portugal;
- ser clara e direta;
- ser compreensível por utilizadores sem programação;
- evitar excesso de termos técnicos;
- focar-se na utilidade agrícola;
- estar pronta para colar noutra IA.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para copiar e colar;
- sem código na resposta principal;
- com estrutura clara;
- operacional;
- orientada à implementação real.

## Restrições

A skill deve respeitar rigorosamente estas restrições:
- Não inventar diagnósticos como se fossem certezas.
- Não expor API keys no frontend.
- Não exigir que o utilizador faça passos complexos.
- Não usar processamento pesado no servidor local.
- Não complicar a captura com fluxos longos.
- Não esconder o envio da imagem para serviços externos.
- Não transformar a ferramenta numa solução médica ou fitossanitária absoluta.
- Não omitir falhas de rede ou de câmara.
- Não esquecer compatibilidade com cPanel.
- Não criar interface pesada ou confusa.
- Não tratar desktop como prioridade.
- Não misturar esta skill com backend genérico não relacionado.
- Não gerar prompts vagos como “faz reconhecimento de imagens”.

A prioridade é sempre simplicidade, proteção de credenciais, resposta útil e utilização rápida em smartphone.

## Exemplos de Prompt de Saída

### Exemplo 1 — Triagem visual de folhas

Quero integrar um fluxo de diagnóstico visual na DATERRA Smart 2 para analisar fotografias de folhas com sintomas. O utilizador deve abrir a câmara no smartphone, tirar a foto, rever rapidamente e enviar para uma API de visão externa como Google Gemini ou OpenAI Vision. A API key deve ficar protegida em `.env` no backend. A interface tem de ser mobile-first, simples, legível e com botões grandes. O sistema deve devolver uma hipótese principal, sinais observados e uma recomendação prática, sem afirmar certezas absolutas.

### Exemplo 2 — Inspeção por foto no terreno

Quero que cries a lógica da funcionalidade de inspeção por foto da DATERRA Smart 2 para uso em campo. O utilizador deve poder fotografar frutos, folhas ou caules e receber uma triagem visual rápida. A solução deve usar o smartphone como dispositivo principal, com pré-visualização da imagem, instruções curtas de captura e estado claro de carregamento. O processamento deve acontecer fora do servidor, através de uma API de visão externa, mantendo a app compatível com cPanel e protegida por variáveis de ambiente.

### Exemplo 3 — Prompt técnico para o Cursor AI

Quero que programes um módulo de visão para a DATERRA Smart 2 que permita enviar fotografias da câmara do smartphone para uma API de visão externa. Guarda a API key em `.env`, nunca no frontend. Cria um fluxo simples de captura, upload, análise e apresentação do resultado. O resultado deve ser curto, cauteloso e útil para triagem agrícola. Inclui tratamento de erros, imagem desfocada, sem permissão de câmara, rede fraca e API indisponível. Mantém tudo compatível com Node.js ou PHP leve em cPanel.

### Exemplo 4 — Fluxo com histórico opcional

Quero adicionar um fluxo de diagnóstico visual à DATERRA Smart 2 com histórico opcional das imagens analisadas. A app deve permitir tirar fotografia no smartphone, enviar para uma API de visão como Gemini ou OpenAI Vision e mostrar uma triagem rápida com hipótese principal, observações e ação recomendada. Se o histórico estiver ativo, guarda apenas data, utilizador, tipo de imagem e resumo do resultado. A solução deve ser mobile-first, simples, transparente sobre o envio da imagem e segura na gestão da API key.

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Faz reconhecimento de imagens.”
- “Adiciona IA à câmara.”
- “Cria diagnóstico por foto.”
- “Liga a visão computacional.”
- “Mete uma API de imagens.”

Motivo:
- são vagos;
- não definem fluxo de captura;
- não definem segurança da API key;
- não definem processamento externo;
- não definem resposta útil;
- não definem compatibilidade com cPanel;
- não definem uso agrícola real.

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido ou uma estrutura operacional pronta a usar.

Essa saída deve incluir explicitamente, quando aplicável:
- captura de imagem pela câmara do smartphone;
- envio para API de visão externa;
- proteção da API key em `.env`;
- processamento fora do servidor local;
- resposta curta e cautelosa;
- compatibilidade com cPanel;
- fluxo mobile-first;
- tratamento claro de erros e falhas.

Nunca devolver apenas ideias soltas. Nunca expor credenciais. Nunca transformar a triagem visual numa promessa de certeza absoluta.

-----
---
name: weather-api-integrator
description: Gera prompts e instruções para integrar APIs gratuitas de meteorologia na PWA DATERRA Smart 2, usando localização por GPS ou código postal, com foco em simplicidade, mobile-first, compatibilidade com cPanel e interface clara para utilizadores não programadores. Use quando o pedido mencionar meteorologia, tempo, clima, previsão, API meteorológica, localização GPS, código postal, OpenWeatherMap, weather API, condições atmosféricas, chuva, temperatura, vento ou integração de dados meteorológicos.
version: 1.0.0
triggers:
  - meteorologia
  - tempo
  - clima
  - previsão
  - api meteorológica
  - localização gps
  - código postal
  - openweathermap
  - weather api
  - condições atmosféricas
  - chuva
  - temperatura
  - vento
  - humidade
  - integração meteorológica
---

# weather-api-integrator

## Contexto

Esta skill existe para gerar prompts e requisitos para integrar dados meteorológicos na PWA DATERRA Smart 2 de forma simples, estável e compatível com alojamento em cPanel.

O objetivo é permitir que a aplicação apresente previsões úteis para agricultura sem complicar a interface do utilizador, usando apenas dados de localização essenciais, como coordenadas GPS ou código postal. A integração deve ser pensada para smartphone, com foco em consulta rápida em campo, apoio à decisão e legibilidade clara.

As referências consultadas sobre PWA indicam que uma boa app deve ser progressiva, responsiva e útil mesmo em cenários móveis imperfeitos [page:1]. Também confirmam que a experiência deve poder continuar funcional em condições de rede variáveis quando a arquitetura for bem desenhada [page:1]. No contexto DATERRA Smart 2, isso significa que o módulo meteorológico deve ser leve, previsível e fácil de manter.

Esta skill deve apoiar:
- integração com APIs gratuitas e universais de meteorologia;
- consulta por GPS ou código postal;
- apresentação simples de condições atuais e previsão;
- organização de dados meteorológicos para uso agrícola;
- cache ou fallback leve quando fizer sentido;
- compatibilidade com Node.js ou PHP em cPanel;
- interface mobile-first e rápida.

A skill não deve inventar endpoints proprietários nem obrigar o utilizador a introduzir dados desnecessários. Deve estruturar a integração técnica e funcional com base na informação fornecida ou validada.

## Instruções de Execução

Segue sempre este método antes de gerar qualquer prompt ou plano de integração.

### 1. Ler e interpretar o objetivo meteorológico

Antes de produzir a saída final, identifica:
- se o utilizador quer previsão atual, horária ou diária;
- se o objetivo é apoio agrícola, planeamento de tratamentos, rega ou monitorização geral;
- se a localização será por GPS, código postal ou ambos;
- se o sistema precisa de dados em tempo real;
- se a interface deve mostrar um resumo curto ou vários blocos de detalhe;
- se existe necessidade de guardar histórico de consultas meteorológicas;
- se o projeto já tem API escolhida ou ainda está em aberto.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Escolher a abordagem de integração

A skill deve orientar a integração para uma destas abordagens:
- API única gratuita e universal;
- API principal com fallback simples;
- consulta por GPS;
- consulta por código postal;
- consulta híbrida com seleção automática da localização;
- módulo leve de meteorologia para uso agrícola.

A decisão deve privilegiar simplicidade, fiabilidade e facilidade de manutenção.

### 3. Priorizar fontes gratuitas e universais

A skill deve recomendar sempre APIs acessíveis, estáveis e fáceis de integrar, sem criar dependência excessiva de serviços complexos.

A integração deve considerar:
- condições atuais;
- previsão horária ou diária;
- temperatura;
- humidade;
- vento;
- probabilidade de chuva;
- precipitação;
- sensação térmica, se disponível.

A escolha da API deve ser compatível com o nível de complexidade do projeto e com o ambiente cPanel.

### 4. Definir a entrada do utilizador

A skill deve obrigar o prompt a manter a entrada do utilizador simples.

A recolha de localização deve ser feita preferencialmente por:
- coordenadas GPS automáticas;
- ou código postal;
- ou seleção manual muito simples quando necessário.

Não se deve pedir moradas completas, formulários extensos ou dados desnecessários.

### 5. Definir a informação meteorológica útil

A skill deve orientar o prompt para mostrar apenas a informação realmente útil ao contexto agrícola.

Os dados mais relevantes podem incluir:
- temperatura atual;
- temperatura mínima e máxima;
- humidade;
- vento;
- precipitação;
- probabilidade de chuva;
- estado do céu;
- previsão para as próximas horas ou dias.

Se o pedido for agrícola, a apresentação deve ser prática e clara, evitando excesso de detalhe técnico.

### 6. Definir simplificação visual

A skill deve obrigar a interface a ser:
- clara;
- mobile-first;
- legível em exterior;
- rápida de consultar;
- sem ruído visual desnecessário;
- com destaque para o valor principal.

A informação deve aparecer em cartões simples, com bom contraste e hierarquia visual evidente.

### 7. Definir comportamento por localização

A skill deve exigir que o módulo meteorológico suporte pelo menos uma destas lógicas:
- usar localização atual do dispositivo;
- usar código postal introduzido pelo utilizador;
- guardar a última localização usada;
- repetir consulta sem fricção.

A lógica deve ser simples para o utilizador e previsível para o sistema.

### 8. Definir atualização e cache

A skill deve orientar a integração para:
- evitar chamadas desnecessárias à API;
- reaproveitar dados recentes quando apropriado;
- definir um tempo de validade claro para a informação;
- mostrar estado de atualização;
- tratar falhas de rede com mensagens simples.

O objetivo é reduzir custos, evitar abusos de API e melhorar a experiência do utilizador.

### 9. Definir segurança das chaves da API

Sempre que houver API key, a skill deve obrigar a:
- armazenar a chave fora do frontend;
- usar variáveis de ambiente;
- proteger a chave no backend;
- impedir exposição no código público;
- manter compatibilidade com cPanel.

A interface nunca deve conter segredos nem ligações diretas que exponham credenciais.

### 10. Definir compatibilidade com cPanel

A skill deve garantir que a solução:
- funcione em Node.js simples ou PHP leve;
- possa ser configurada no cPanel;
- use ficheiros de configuração claros;
- não dependa de infraestruturas externas complexas;
- seja fácil de subir por `.zip`;
- permita arranque sem terminal.

A integração meteorológica deve ser prática para alojamento partilhado.

### 11. Definir falhas e fallback

A skill deve obrigar o prompt a prever:
- sem GPS disponível;
- sem permissão de localização;
- código postal inválido;
- API indisponível;
- tempo de resposta elevado;
- ausência de rede;
- dados desatualizados.

Cada falha deve ter mensagem clara e uma alternativa simples, sem linguagem técnica.

### 12. Definir apresentação para agricultura

Se o contexto for agrícola, a skill deve orientar a apresentação para:
- apoio à decisão de campo;
- planeamento de operações;
- leitura rápida antes de tratamentos ou regas;
- visualização simples de chuva, vento e humidade;
- destaque para o que importa no momento.

Não deve transformar o ecrã numa app meteorológica genérica. Deve focar o uso agrícola.

### 13. Definir estrutura mínima do módulo

A skill deve orientar a implementação a partir de blocos simples:
- entrada de localização;
- pedido à API;
- normalização da resposta;
- exibição do resumo;
- detalhamento opcional;
- estado de erro e carregamento;
- cache ou último resultado.

A estrutura deve ser fácil de manter e adaptar.

### 14. Definir integração com outras ferramentas DATERRA

Sempre que fizer sentido, a skill deve pedir ligação com:
- calculadoras agrícolas;
- agendamento de operações;
- alertas de vento ou chuva;
- histórico de uso;
- biblioteca técnica.

A meteorologia deve contribuir para o ecossistema da app, não ficar isolada.

### 15. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompts para o v0.dev com layout mobile-first;
- prompts para o Cursor AI com lógica de integração;
- listas de campos necessários;
- especificação de variáveis de ambiente;
- checklist de implementação segura;
- texto para estado vazio, erro e carregamento.

### 16. Definir linguagem e tom

A saída final deve:
- usar português de Portugal;
- ser clara e direta;
- ser entendida por um utilizador sem programação;
- manter foco prático;
- evitar tecnicismos desnecessários;
- estar pronta para colar noutra IA.

### 17. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para copiar e colar;
- sem código na resposta principal;
- com estrutura clara;
- operacional;
- orientada a implementação real.

## Restrições

A skill deve respeitar rigorosamente estas restrições:
- Não complicar a seleção de localização.
- Não obrigar a introdução de moradas completas.
- Não expor API keys no frontend.
- Não depender de serviços meteorológicos obscuros ou instáveis.
- Não criar interface pesada ou decorativa.
- Não mostrar dados irrelevantes para o uso agrícola.
- Não prometer precisão absoluta.
- Não ignorar falhas de rede ou indisponibilidade da API.
- Não esquecer compatibilidade com cPanel.
- Não usar linguagem técnica confusa.
- Não transformar a skill em ferramenta de previsão científica avançada.
- Não misturar esta skill com backend genérico não relacionado.
- Não gerar prompts vagos como “mete o tempo na app”.

A prioridade é sempre simplicidade, utilidade prática, segurança das credenciais e leitura rápida em smartphone.

## Exemplos de Prompt de Saída

### Exemplo 1 — Previsão agrícola por GPS

Quero integrar um módulo de meteorologia na DATERRA Smart 2 que use a localização GPS do utilizador para mostrar temperatura, humidade, vento e previsão de chuva. A interface deve ser mobile-first, rápida e clara, com cartões simples e sem excesso de detalhe. Usa uma API gratuita e universal, guarda a chave de API no backend por variável de ambiente e evita expor segredos no frontend. Se o GPS não estiver disponível, mostra uma alternativa por código postal. Mantém a solução compatível com cPanel e com consulta rápida em campo.

### Exemplo 2 — Previsão por código postal

Quero um módulo meteorológico para a DATERRA Smart 2 baseado em código postal, pensado para utilizadores agrícolas que precisam de consulta rápida em smartphone. A experiência deve ser simples: campo para código postal, botão claro para consultar e resumo com dados essenciais como chuva, vento, temperatura e humidade. Usa uma API gratuita e segura, com credenciais protegidas no backend. Inclui estado de carregamento, tratamento de erros e atualização da informação sem sobrecarregar a interface.

### Exemplo 3 — Meteorologia para planeamento agrícola

Quero que cries a estrutura de integração meteorológica da DATERRA Smart 2 para ajudar no planeamento agrícola. O sistema deve mostrar informação prática, como chuva prevista, vento e humidade, de forma legível em exterior e útil para decidir operações no terreno. A consulta deve ser feita por GPS ou código postal, com fallback simples quando a localização falhar. Mantém a implementação leve, compatível com cPanel e sem dependências externas complexas.

### Exemplo 4 — Prompt técnico para o Cursor AI

Quero que programes a integração meteorológica da DATERRA Smart 2 com uma API gratuita e universal, usando GPS ou código postal como entrada principal. O backend deve esconder a API key em variável de ambiente e devolver ao frontend apenas os dados necessários. O frontend deve mostrar previsão atual e resumo diário em mobile-first, com estado de carregamento, erro e dados sem rede. A solução tem de funcionar em alojamento cPanel, com Node.js ou PHP leve, sem depender de serviços externos complexos.

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Faz um módulo do tempo.”
- “Integra meteorologia.”
- “Mostra a previsão na app.”
- “Liga uma API do clima.”
- “Adiciona dados meteorológicos.”

Motivo:
- são vagos;
- não definem localização;
- não definem a informação útil;
- não definem segurança da API key;
- não definem compatibilidade com cPanel;
- não definem experiência mobile;
- não definem o uso agrícola.

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido ou uma estrutura operacional pronta a usar.

Essa saída deve incluir explicitamente, quando aplicável:
- API meteorológica gratuita e universal;
- entrada por GPS ou código postal;
- dados úteis para agricultura;
- interface mobile-first;
- proteção da API key;
- compatibilidade com cPanel;
- fallback para falhas de localização ou rede;
- experiência simples e prática.

Nunca devolver apenas ideias soltas. Nunca expor credenciais. Nunca complicar a consulta meteorológica.
