---
name: sqlite-auth-history-designer
description: Gera prompts completos para estruturar autenticação simples e segura na PWA DATERRA Smart 2, com login, registo, hashing com bcrypt, histórico por utilizador, logs leves de utilização e persistência em SQLite ou MySQL simples, sempre com foco em alojamento partilhado compatível com cPanel. Use quando o pedido mencionar SQLite, MySQL, login, registo, bcrypt, autenticação, histórico, logs, users, sessões, base de dados, persistência, RGPD, tool_history, usage_logs ou estrutura de dados por utilizador.
version: 1.0.0
triggers:
  - SQLite
  - MySQL
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
  - RGPD
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

A referência consultada sobre alojamento Node.js em cPanel mostra um fluxo típico de app pronta, subida para a `Application Root`, instalação de dependências via `Run NPM Install` e configuração de variáveis de ambiente pelo próprio painel [web:55][web:56]. Isto reforça que a arquitetura de autenticação e persistência deve ser:
- simples de publicar;
- leve;
- previsível;
- compatível com `package.json`, ficheiro de arranque e variáveis de ambiente;
- estável em ambiente partilhado.

No contexto DATERRA Smart 2, esta skill deve estruturar:
- registo de utilizador;
- login seguro;
- hashing de palavras-passe com `bcrypt`;
- histórico privado por utilizador;
- logs leves de utilização;
- persistência mínima útil;
- respeito por privacidade e boas práticas RGPD.

A skill não deve desenhar o interface visual. Deve apenas gerar prompts de arquitetura lógica e de dados.

---

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
- nunca devolver password_hash ao frontend.

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

A referência consultada sobre cPanel mostra que as variáveis de ambiente podem e devem ser configuradas no painel da aplicação [web:55][web:56].

### 17. Definir compatibilidade com cPanel

A skill deve garantir que a arquitetura sugerida:
- não depende de serviços externos complexos;
- funciona com Node.js simples;
- é compatível com `Setup Node.js App`;
- usa `package.json`;
- pode ser instalada com `Run NPM Install`;
- corre com ficheiro de arranque claro;
- pode ser publicada por `.zip`.

As referências consultadas mostram precisamente este fluxo como padrão de alojamento Node.js em cPanel [web:55][web:56].

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

---

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

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Estrutura completa com SQLite

Quero que cries a arquitetura lógica completa de autenticação e histórico da PWA DATERRA Smart 2 usando SQLite, porque a aplicação será leve e alojada em cPanel. Estrutura a base de dados com as tabelas users, privacy_acceptance, tool_history e usage_logs. Na tabela users inclui id, nome, email, password_hash, created_at e updated_at. Implementa registo com validação de campos obrigatórios, email único, confirmação de palavra-passe e aceitação da política de privacidade. Usa bcrypt obrigatoriamente para hashing das palavras-passe e garante que nenhum hash é devolvido ao frontend. Implementa login com verificação segura da password e gestão simples de sessão. Garante rotas protegidas para histórico privado. Na tool_history guarda user_id, nome da ferramenta, resumo dos inputs, resumo dos resultados e data. Na usage_logs guarda user_id, ferramenta, ação principal e timestamp, de forma leve e ética. Mantém a solução compatível com cPanel, package.json, variáveis de ambiente e deploy simples por .zip.

### Exemplo 2 — Estrutura com MySQL simples

Quero que desenhes a estrutura de autenticação e histórico por utilizador da DATERRA Smart 2 usando MySQL simples, compatível com cPanel. Mantém a arquitetura leve e organizada em acesso à base de dados, serviços de autenticação, middleware de sessão e rotas protegidas. Cria a tabela users com email único e password_hash em vez de password em texto simples. Usa bcrypt obrigatoriamente no registo e login. Implementa também as tabelas tool_history e usage_logs, sempre filtradas por user_id quando os dados forem privados. Garante validação de inputs, mensagens de erro claras, política de privacidade no registo, variáveis de ambiente para credenciais da base de dados e nenhuma dependência cloud desnecessária.

### Exemplo 3 — Login e histórico para calculadoras agrícolas

Quero que cries uma estrutura simples de login, sessões, histórico por utilizador e logs leves para uma PWA agrícola DATERRA Smart 2 com várias calculadoras. O frontend já existe. Agora preciso da lógica de persistência. Usa SQLite se for suficiente para alojamento partilhado. Garante que cada cálculo guardado no histórico fica ligado ao user_id, ao nome da ferramenta, ao resumo dos valores inseridos e ao resultado principal. Implementa registo, login com bcrypt, logout, proteção de rotas privadas e consulta do histórico por ordem decrescente. Se o utilizador não estiver autenticado, não deve conseguir ver histórico privado. Os logs devem guardar apenas user_id, ferramenta usada, tipo de ação e timestamp. Mantém a solução leve, clara e pronta para deploy em cPanel.

### Exemplo 4 — Revisão de estrutura existente

Revê esta implementação existente da DATERRA Smart 2 e reorganiza a parte de autenticação, histórico e logs para uma solução simples e robusta em SQLite ou MySQL simples. Quero que identifiques o que falta em segurança, como hashing com bcrypt, email único, filtragem por user_id, proteção de rotas e separação entre histórico pessoal e logs administrativos. Reorganiza a base de dados com tabelas mínimas, validações corretas e variáveis de ambiente, mantendo total compatibilidade com app Node.js alojada em cPanel. Não compliques a arquitetura e não cries módulos desnecessários.

---

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

---

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