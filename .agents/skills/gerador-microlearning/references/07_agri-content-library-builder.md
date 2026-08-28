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

As referências consultadas explicam que uma PWA bem construída pode ser instalável, funcionar offline em cenários adequados e melhorar progressivamente a experiência do utilizador [web:1][web:85]. Isto é particularmente relevante para bibliotecas técnicas agrícolas, porque parte dos conteúdos pode precisar de consulta rápida em locais com rede fraca ou ausência temporária de internet [web:1]. A MDN também refere que o manifest permite acesso mais rápido a partir do ecrã inicial do dispositivo, o que reforça a utilidade de uma biblioteca técnica integrada numa app instalável [web:73].

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

---

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

As fontes consultadas explicam que a experiência PWA deve ser progressiva e resiliente, mantendo funcionalidade base sempre que possível [web:1][web:85].

### 13. Definir offline útil mas controlado

Quando fizer sentido, a skill deve pedir:
- cache apenas de conteúdos essenciais;
- possibilidade de guardar localmente bibliotecas críticas;
- fallback claro quando um conteúdo não estiver disponível offline;
- não prometer offline total de todos os conteúdos sem estratégia real.

As referências consultadas reforçam que as PWAs podem funcionar offline, mas essa capacidade depende de implementação adequada com service worker e estratégia progressiva [web:1][web:51].

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

---

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

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Biblioteca por cultura

Quero que organizes uma biblioteca técnica da DATERRA Smart 2 por cultura, pensada para consulta rápida em smartphone. Estrutura o conteúdo por cultura principal e, dentro de cada cultura, separa subsecções como pragas, doenças, operações, equipamentos relevantes e notas técnicas. Cada ficha deve ter título claro, resumo curto, explicação principal, pontos-chave e ligações a conteúdos relacionados. A navegação deve ser simples, vertical, mobile-first, com pesquisa e filtros por cultura e tipo de conteúdo. Mantém a estrutura clara, legível em exterior e adequada a consulta rápida em campo.

### Exemplo 2 — Glossário agrícola

Quero que cries a estrutura de um glossário técnico agrícola para a DATERRA Smart 2. Organiza cada entrada com termo, definição simples, contexto de uso, unidade ou operação relacionada, sinónimos úteis e ligação a ferramentas ou fichas relevantes. O glossário deve ser fácil de pesquisar em smartphone, com resultados rápidos e linguagem em português de Portugal. Mantém consistência editorial e evita definições longas ou pouco práticas.

### Exemplo 3 — Biblioteca por equipamento e unidade

Quero que organizes uma biblioteca técnica por equipamento e unidade de medida para a DATERRA Smart 2. Estrutura primeiro por tipo de equipamento e cria fichas padronizadas com descrição, componentes principais, situações de uso, unidades associadas e relações com calculadoras da app. Na área de unidades, cria fichas curtas com definição, contexto de aplicação, conversões relacionadas e ligação a ferramentas relevantes. A experiência deve ser mobile-first, com filtros simples, cartões claros e leitura rápida no terreno.

### Exemplo 4 — Fichas rápidas com offline parcial

Quero que prepares uma biblioteca de fichas rápidas para apoio técnico no terreno dentro da DATERRA Smart 2. Organiza as fichas por tema agrícola e identifica quais devem estar disponíveis em cache para consulta essencial offline. Mantém a navegação simples, com lista geral, categorias e ficha individual. Cada ficha deve ter título claro, resumo de topo, pontos-chave e relações com conteúdos semelhantes. Não prometas offline total, mas garante que os conteúdos críticos possam ser consultados sem rede quando isso fizer sentido.

---

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

---

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