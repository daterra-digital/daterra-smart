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