# Biblioteca Base de Conhecimento • DATERRA Smart 2

## 1. Finalidade do documento

Este documento é a nova base oficial de conhecimento da DATERRA Smart 2. Define as decisões estruturais já validadas, os princípios de desenvolvimento, a arquitetura-base, os fluxos principais e as regras de governação do projeto. Foi criado para servir como fonte única de verdade para futuras interações com Perplexity Space, Google AI Studio, Supabase e outras ferramentas de IA ou desenvolvimento.[cite:40][cite:116][cite:115]

A DATERRA Smart deve ser tratada como uma Progressive Web App agrícola, mobile-first, modular, evolutiva e orientada à simplicidade de implementação, mas sem perder robustez funcional. O projeto deve crescer por fases, com decisões estáveis e controladas, evitando deriva de arquitetura, repetições estéreis e contradições entre prompts, código e backend.[cite:40][cite:115][cite:122]

## 2. Princípio de governação do projeto

### 2.1 Regra de Fecho e Hierarquia de Decisão

A partir do momento em que um tema esteja validado com base suficiente, a decisão considera-se fechada e o projeto deve avançar para o tema seguinte. Essa decisão só deve ser reaberta se surgir uma necessidade real de ajuste, alteração de contexto, limitação técnica comprovada ou requisito novo validado.

Sempre que a decisão tenha impacto na estrutura, arquitetura, segurança, autenticação, modelo de dados, infraestrutura, modularidade, ou noutra base difícil de alterar posteriormente, essa decisão passa a ser considerada uma **decisão estrutural** e transforma-se num **requisito obrigatório** para orientar futuras decisões, prompts, implementações e validações.[cite:130][cite:138][cite:139]

A DATERRA Smart deve ser tratada como um **plano evolutivo contínuo**. Os requisitos-base do projeto são dinâmicos e podem evoluir ao longo do tempo, mas essa evolução deve respeitar a hierarquia das decisões estruturais já aceites. Quando for realmente necessário alterar uma decisão estrutural, isso deve acontecer por substituição formal da decisão anterior, e não por contradição informal ou omissão.[cite:130][cite:138]

### 2.2 Regra operacional para IA

Perplexity Space, Google AI Studio, Supabase AI, ou qualquer outro sistema de apoio ao desenvolvimento, devem assumir que decisões já validadas não devem ser rediscutidas repetidamente. A IA deve informar a decisão validada, seguir para o tema seguinte e apenas sugerir reabertura se existir motivo real, objetivo e comprovado.[cite:40][cite:122]

## 3. Papel oficial das ferramentas

### 3.1 Perplexity Space

O Perplexity Space é o centro de inteligência, coordenação, mentoria, validação e arquitetura da DATERRA Smart. Deve organizar o conhecimento do projeto, validar fórmulas, fluxos, decisões de produto e infraestrutura, e gerar prompts prontos para serem usados no Google AI Studio ou noutras ferramentas.[cite:40]

### 3.2 Google AI Studio

O Google AI Studio é a ferramenta principal para gerar, iterar e acelerar a produção de código da DATERRA Smart. Não deve ser tratado como memória estratégica do projeto; essa memória deve viver na presente biblioteca e no GitHub. O AI Studio deve operar com base em prompts validados e alinhados com as decisões estruturais já aceites.[cite:40]

### 3.3 GitHub

O GitHub é o repositório oficial do projeto. Todo o código relevante e estável deve ser armazenado no GitHub como versão oficial da aplicação, separando claramente o ato de gerar código do ato de o preservar e versionar de forma segura.[cite:106][cite:98]

### 3.4 Supabase

O Supabase é a plataforma oficial para autenticação, base de dados, storage, logs e permissões da DATERRA Smart. A sua utilização deve ser desenhada com segurança ao nível da base de dados, usando Row Level Security para proteger informação por utilizador, por papel e por plano de acesso.[cite:34][cite:39][cite:115]

### 3.5 cPanel

O cPanel é a infraestrutura principal de publicação da primeira versão da DATERRA Smart. A opção fica validada porque o ambiente já demonstra suporte a Setup Node.js App, criação de aplicação, variáveis de ambiente, subdomínio, logs e utilização de Node.js 20.20.2, o que o torna compatível com a fase inicial do projeto.[cite:48][cite:49][cite:52]

### 3.6 Cloud Run

O Cloud Run não faz parte da fase 1. Fica apenas registado como rota futura opcional de evolução, caso a escala, a compatibilidade ou a estabilidade do cPanel deixem de ser suficientes para a evolução do produto.[cite:51][cite:82]

## 4. Visão oficial do produto

A DATERRA Smart é uma PWA agrícola orientada a agricultores, técnicos e decisores, funcionando como toolbox digital, sistema de apoio operacional, ponto de acesso a conteúdos técnicos e funil de entrada para o ecossistema DATERRA e Academia DATERRA. O produto deve combinar utilidade prática de campo, histórico técnico, conteúdos didáticos e funcionalidades premium com IA.[cite:40]

A aplicação deve ser desenhada para operar em contexto real de utilização no terreno, com foco em smartphones, possibilidade de uso em tablets e computadores, e prioridade absoluta para clareza, rapidez de interação, contraste visual e simplicidade funcional.[cite:40]

## 5. Princípios de design e interface

### 5.1 Mobile-first obrigatório

A DATERRA Smart é uma aplicação **mobile-first**. O principal foco da experiência é o smartphone. A interface deve ser desenhada primeiro para ecrãs móveis e só depois adaptada para tablets e computadores.[cite:40]

Devem existir comportamentos específicos para dois contextos principais:

- layout prioritário para smartphone/tablet pequeno;
- layout específico para desktop.

Não se deve apenas “encolher” uma interface desktop. A organização da informação deve mudar em função do dispositivo e do contexto de uso.[cite:116]

### 5.2 Tipografia oficial

A tipografia principal da PWA é **Roboto**. Playfair Display e Montserrat deixam de ser a base tipográfica da interface funcional da aplicação, por não serem a escolha mais adequada para uma PWA operacional centrada em uso intensivo, leitura rápida e interface móvel. A família Roboto passa a ser a referência principal para títulos funcionais, texto corrido, formulários, resultados e navegação interna.[cite:25][cite:19]

As cores institucionais DATERRA mantêm-se válidas como identidade visual de produto.[cite:2]

### 5.3 Temas obrigatórios

A aplicação deve suportar quatro temas:

- Sistema;
- Claro;
- Escuro;
- Alto Contraste.

O alto contraste é obrigatório por causa da utilização em campo e sob forte luminosidade.[cite:1]

## 6. Arquitetura funcional do produto

### 6.1 Núcleo da app

A DATERRA Smart deve ser construída com um núcleo estável e independente das ferramentas. Esse núcleo deve incluir:

- autenticação;
- perfil do utilizador;
- gestão de plano;
- histórico;
- sincronização offline/online;
- documentos técnicos;
- assistente agrícola com IA;
- definições;
- administração;
- gestão de módulos visíveis.

### 6.2 Modularidade

A DATERRA Smart deve ser uma plataforma modular. As ferramentas, calculadoras e funcionalidades devem ser integradas como módulos funcionais adicionados sobre o núcleo da app.

Fica registada como decisão oficial a seguinte frase:

> O utilizador personaliza os módulos visíveis, mas a instalação técnica separada por plugin fica para fase futura.

Isto significa que, no MVP, os módulos estão tecnicamente incluídos na aplicação, mas cada utilizador escolhe quais quer ver ativos no seu espaço. Esta decisão privilegia simplicidade, eficácia, leveza de uso e menor complexidade de implementação.[cite:116]

### 6.3 Primeiros módulos obrigatórios

Os cinco primeiros módulos/calculadoras a desenvolver são:

1. Concentração.
2. Dose.
3. Volume de Calda.
4. Velocidade de Avanço.
5. Geometria da Copa.

## 7. Autenticação e identidade

### 7.1 Estratégia base

A autenticação da DATERRA Smart arranca pelo modelo mais simples e sustentável de implementar:

- registo/login com email e OTP como via principal;
- registo/login com LinkedIn e Facebook por SSO social como vias alternativas iniciais.[cite:35][cite:36][cite:58]

A regra estrutural é que a conta do utilizador é gerida dentro da DATERRA Smart e não depende do Moodle na fase 1.[cite:34][cite:39]

### 7.2 Dados obrigatórios no registo

Os dados obrigatórios mínimos do registo são:

- Primeiro Nome;
- Último Nome;
- Entidade;
- Email.

### 7.3 Moodle

Na fase 1, o Moodle não é sistema de login da DATERRA Smart. O Moodle funciona como destino público/comercial/formativo através do botão “Saiba mais na Academia DATERRA”, que encaminha para uma página pública do Moodle.

A ligação da conta DATERRA Smart ao Moodle é manual e administrativa. Nas Definições da app deve existir uma secção de ligação ao Moodle com estados visuais claros:

- Moodle não ligado;
- Pedido enviado;
- Moodle ligado.

Quando o utilizador ativa o pedido de ligação, a app deve informar que a ligação não é automática e que depende de validação administrativa por email.

### 7.4 Pedidos de ligação ao Moodle

Deve existir uma tabela própria chamada `pedidos_ligacao_moodle`, com os seguintes campos mínimos:

- `utilizador_id`;
- `email`;
- `nome`;
- `data_pedido`;
- `estado`;
- `observacoes_admin`.

A opção por tabela dedicada é obrigatória, porque é mais limpa, auditável, filtrável e compatível com o painel administrativo do que guardar apenas ficheiros de log soltos.[cite:115][cite:122]

## 8. Administração

A área de administração fica dentro da própria PWA e, na fase inicial, existirá apenas um administrador principal. A arquitetura pode ficar preparada para múltiplos administradores no futuro, mas a operação inicial será feita por uma conta administrativa principal.[cite:115]

O painel administrativo deve permitir gerir:

- links dinâmicos da Academia DATERRA;
- publicidade Moodle;
- gestão manual e futura automação de planos;
- conteúdos didáticos;
- documentos técnicos;
- configurações do assistente IA;
- ativação e gestão de ferramentas/módulos.

## 9. Modelo freemium

### 9.1 Estrutura comercial inicial

A recomendação comercial inicial é simples:

- Plano Free;
- Plano Premium único.

O plano premium começa com ativação manual pelo administrador. A arquitetura deve, no entanto, ficar preparada com um mecanismo de transição futura para ativação automática, sem refazer a base do sistema.[cite:115]

### 9.2 Estimativa inicial de preço

Como estimativa orientadora inicial, o plano Premium pode ser posicionado na faixa de 9,90 € a 14,90 € por mês, sendo 12,90 € uma referência equilibrada para testes de mercado em fase inicial. Esta é apenas uma estimativa estratégica e não um orçamento definitivo.[cite:82][cite:84][cite:85]

### 9.3 Meta mínima de validação comercial

Como meta simples de validação económica inicial, a DATERRA Smart pode considerar como objetivo a obtenção de 10 a 15 utilizadores premium pagantes, número que tende a oferecer um primeiro sinal de viabilidade do modelo em fase inicial, dependendo do peso real da infraestrutura, IA e operação.[cite:82][cite:84][cite:85]

## 10. Offline-first e sincronização

A aplicação deve seguir uma lógica offline-first. Os dados devem ser guardados localmente e sincronizados quando existir internet, mantendo estados visuais claros para o utilizador sobre o ciclo de sincronização.[cite:1]

Os estados mínimos de sincronização visíveis devem ser:

- Por sincronizar;
- Sincronizado.

Cada registo sincronizável deve seguir a lógica já prevista:

- identificador único;
- estado de sincronização;
- data da última atualização.[cite:1]

## 11. Histórico e rastreabilidade

Todas as calculadoras e ferramentas devem guardar histórico completo por cálculo/ferramenta usada, incluindo notas associadas ao respetivo registo. O histórico deve mostrar as ações do utilizador e permitir contexto útil para uso posterior da app e de futuras funcionalidades de IA.

## 12. Documentos técnicos e IA

A DATERRA Smart deve arrancar com documentos técnicos estruturados em dois níveis:

- PDF original;
- ficha resumida mobile.

A ficha resumida mobile deve servir para consulta rápida em campo. Além disso, fica definido que a IA poderá gerar um rascunho automático a partir do PDF, para aceleração editorial, sujeito a validação administrativa antes de publicação final.[cite:40]

## 13. Assistente agrícola com IA

O uso de IA não fica restrito apenas aos relatórios PDF premium. A DATERRA Smart deve prever também um assistente agrícola interno com repositórios de conhecimento associados pelo utilizador ou pelo sistema, respeitando as permissões, o plano e os limites operacionais definidos pelo produto.[cite:40][cite:85]

## 14. Publicidade e links dinâmicos

No dashboard principal deverá existir um espaço de publicidade/realce ligado à Academia DATERRA. Cada item deve poder incluir:

- imagem;
- link;
- título;
- texto curto sobreposto à imagem;
- prioridade;
- datas de ativação.

Os links “Saiba mais na Academia DATERRA” devem ser dinâmicos e geridos no painel de administração.

## 15. Segurança e políticas de acesso

A segurança da aplicação não deve depender apenas da interface. O Supabase deve aplicar políticas de acesso ao nível da base de dados através de Row Level Security, protegendo o acesso por utilizador, papel e plano. Esta decisão é estrutural e obrigatória para toda a evolução do backend.[cite:115][cite:14][cite:120]

Dados administrativos, dados privados de utilizador, pedidos de ligação ao Moodle, histórico e conteúdos premium devem ser protegidos por políticas explícitas e não apenas por lógica visual na app.[cite:115][cite:122]

## 16. Infraestrutura validada para fase 1

A infraestrutura validada para a primeira fase do projeto é a seguinte:

| Camada | Solução oficial | Estado |
|---|---|---|
| Coordenação e arquitetura | Perplexity Space | Validado |
| Geração e iteração de código | Google AI Studio | Validado |
| Repositório | GitHub | Validado |
| Backend e dados | Supabase | Validado |
| Publicação inicial | cPanel com Node.js 20.20.2 | Validado |
| Evolução futura opcional | Cloud Run | Reservado para futuro |

## 17. Limites iniciais de ficheiros

Limites iniciais recomendados para storage:

- imagens de banners/publicidade: até 1–2 MB;
- PDFs técnicos normais: até 10 MB;
- relatórios PDF premium gerados pela app: até 15 MB;
- ficheiros de conhecimento para IA: até 10 MB por ficheiro no arranque.

Estes limites são operacionais e podem ser ajustados futuramente, mas devem ser suficientes para o arranque controlado do sistema.

## 18. Prioridade de desenvolvimento

A prioridade do projeto deve ser sempre a seguinte:

1. simplicidade de implementação;
2. eficácia funcional;
3. clareza para utilizadores sem perfil técnico;
4. estabilidade estrutural;
5. evolução modular controlada.

A DATERRA Smart não deve ser desenhada como exercício técnico complexo. Deve ser uma solução prática, robusta, pedagógica e escalável por fases.

## 19. Próximas fases recomendadas

As próximas fases práticas, após esta biblioteca, são:

1. desenhar a estrutura oficial do banco de dados Supabase;
2. definir o mapa de módulos e tabelas do núcleo da app;
3. preparar as instruções otimizadas do Space;
4. gerar os prompts-base para o Google AI Studio;
5. especificar o primeiro módulo funcional do MVP.
