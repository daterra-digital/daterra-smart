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