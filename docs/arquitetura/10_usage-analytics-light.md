---
name: usage-analytics-light
description: Gera prompts completos para estruturar logs mínimos de utilização na PWA DATERRA Smart 2, registando utilizador, ferramenta e timestamp de forma leve, ética e compatível com alojamento partilhado em cPanel, usando SQLite ou MySQL simples sem sobrecarga desnecessária. Use quando o pedido mencionar logs, analytics, monitorização, uso, ferramenta, utilizador, timestamp, histórico técnico, usage_logs, métricas leves, auditoria simples, tracking interno ou estatísticas mínimas.
version: 1.0.0
triggers:
  - logs
  - analytics
  - monitorização
  - uso
  - ferramenta
  - utilizador
  - timestamp
  - histórico técnico
  - usage_logs
  - métricas leves
  - auditoria simples
  - tracking interno
  - estatísticas mínimas
  - activity log
  - app usage
  - event log
---

# usage-analytics-light

## Contexto

Esta skill existe para gerar prompts completos para estruturar monitorização mínima de utilização na PWA DATERRA Smart 2.

O objetivo é permitir registo leve de eventos essenciais, como que utilizador acedeu a que ferramenta e em que momento, sem transformar a aplicação num sistema pesado de analytics nem sobrecarregar o alojamento partilhado.

As referências consultadas sobre Node.js em cPanel mostram um ambiente de alojamento simples, com fluxo baseado em `Setup Node.js App`, instalação de dependências via `Run NPM Install`, variáveis de ambiente configuráveis e consulta de logs no próprio painel [web:55][web:56]. Isso significa que qualquer estratégia de analytics para DATERRA Smart 2 deve ser:
- leve;
- previsível;
- barata em escrita;
- fácil de manter;
- compatível com SQLite ou MySQL simples;
- sem dependências externas obrigatórias.

No contexto DATERRA Smart 2, esta skill deve especializar:
- logs mínimos por utilizador;
- registo da ferramenta usada;
- timestamp da ação principal;
- separação entre histórico funcional e analytics interno;
- métricas simples para apoio à gestão da plataforma;
- proteção de privacidade;
- compatibilidade com cPanel e alojamento partilhado.

A skill não serve para analytics avançado, publicidade, perfis comportamentais complexos ou tracking invasivo.

---

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt.

### 1. Ler e interpretar o objetivo da monitorização

Antes de produzir a saída final, identifica:
- se o utilizador quer apenas logs básicos;
- se quer saber que ferramentas são mais usadas;
- se quer registar entradas por utilizador autenticado;
- se quer métricas por ferramenta;
- se quer apenas timestamp de acesso ou também ação executada;
- se a app já tem login;
- se existe histórico funcional separado;
- se a base de dados é SQLite ou MySQL;
- se a app será alojada em cPanel.

Se faltarem dados importantes, a skill deve pedir clarificação simples.

### 2. Classificar o tipo de analytics leve

Classifica o pedido numa destas categorias:

- registo básico de acessos;
- logs por utilizador e ferramenta;
- logs por ação principal;
- métricas mínimas para painel interno;
- analytics leve com SQLite;
- analytics leve com MySQL simples;
- revisão de monitorização existente;
- separação entre histórico e logs;
- registo técnico para administração da plataforma.

### 3. Definir o princípio de minimização

A skill deve sempre assumir o princípio de recolha mínima:
- guardar apenas o necessário;
- evitar granularidade excessiva;
- evitar escrita constante por microevento;
- evitar rastreamento invasivo;
- priorizar utilidade operacional real.

A monitorização deve servir a gestão da plataforma, não observar tudo.

### 4. Definir eventos mínimos recomendados

A skill deve obrigar o prompt final a focar-se em eventos simples e úteis, como:
- abertura de ferramenta;
- submissão principal, por exemplo calcular ou consultar;
- acesso a módulo relevante;
- login e logout, quando fizer sentido;
- erro relevante apenas se necessário para suporte.

A skill deve evitar logging de cada clique sem valor operacional.

### 5. Definir estrutura mínima da tabela usage_logs

A skill deve orientar para uma tabela leve como `usage_logs`, com campos mínimos, por exemplo:
- id;
- user_id, quando houver autenticação;
- tool_name;
- action_type;
- created_at;
- opcionalmente contexto curto e controlado, se realmente necessário.

A tabela deve ser pequena, clara e focada em eventos principais.

### 6. Definir relação com utilizador

Sempre que existir login, a skill deve pedir:
- associação do log ao `user_id`;
- nunca exposição pública destes logs;
- separação entre uso interno e histórico do utilizador.

Se não houver login, a skill pode sugerir modo anónimo ou muito limitado, sem complicar a solução.

### 7. Definir diferença entre histórico funcional e analytics interno

A skill deve obrigar a distinguir claramente:
- histórico funcional do utilizador, que ele pode consultar;
- logs internos de utilização, destinados apenas à administração da app.

Esta separação evita confusão conceptual e técnica.

### 8. Definir ação principal como unidade de logging

A skill deve orientar para registar apenas ações significativas, por exemplo:
- abriu calculadora;
- executou cálculo;
- consultou biblioteca;
- abriu ficha técnica;
- fez consulta meteorológica;
- enviou imagem para diagnóstico.

A unidade do registo deve ser simples e significativa.

### 9. Definir frequência de escrita prudente

A skill deve obrigar o prompt a evitar excesso de escrita:
- não registar movimento do rato;
- não registar foco em cada campo;
- não registar cada alteração de input;
- não registar cada scroll;
- não registar cliques sem valor analítico real.

A estratégia deve ser compatível com limites de alojamento partilhado.

### 10. Definir SQLite ou MySQL simples

A skill deve decidir de forma curta e prática:
- `SQLite` para aplicação leve e volume moderado;
- `MySQL` simples quando já existir base multiutilizador ou volume maior.

A escolha deve estar alinhada com simplicidade de manutenção em cPanel.

### 11. Definir compatibilidade com cPanel

A skill deve garantir que o sistema de logs:
- corre em Node.js simples;
- usa `package.json`;
- pode ser publicado por `.zip`;
- usa variáveis de ambiente quando necessário;
- não exige infraestrutura externa;
- não depende de serviços de analytics cloud.

As referências consultadas mostram que a configuração típica em cPanel é simples e orientada a apps Node.js autónomas [web:55][web:56][web:92].

### 12. Definir leitura administrativa simples

Quando o utilizador pedir consulta dos logs, a skill deve orientar para um painel muito simples, por exemplo:
- totais por ferramenta;
- últimos acessos;
- lista ordenada por data;
- filtro por ferramenta;
- filtro por utilizador, quando permitido;
- resumo de utilização por período.

A skill deve evitar dashboards complexos e pesados.

### 13. Definir retenção e limpeza mínima

A skill deve pedir uma política simples de retenção, por exemplo:
- manter apenas o período necessário;
- prever limpeza de logs antigos;
- evitar crescimento infinito da tabela;
- resumir ou eliminar dados antigos quando apropriado.

Isto é importante para não degradar a performance em alojamento partilhado.

### 14. Definir tratamento ético e privacidade

A skill deve obrigar a:
- explicar na política de privacidade que existem logs leves de utilização;
- recolher apenas o estritamente necessário;
- evitar conteúdo sensível nos logs;
- limitar acesso administrativo aos registos;
- não usar logs para fins obscuros ou não informados.

### 15. Definir dados que não devem ser registados

A skill deve proibir explicitamente:
- palavras-passe;
- hashes;
- conteúdo excessivo de formulários;
- imagens brutas;
- dados sensíveis desnecessários;
- detalhes comportamentais invasivos.

### 16. Definir logging de erros com prudência

Se o utilizador pedir apoio técnico adicional, a skill pode sugerir logging simples de erros relevantes, mas deve manter:
- poucos campos;
- mensagens úteis;
- nenhuma fuga de segredos;
- volume controlado.

Isto deve ser opcional e não o foco principal da skill.

### 17. Definir estrutura técnica mínima

A skill deve orientar o prompt para uma implementação simples, com:
- tabela ou coleção de logs;
- função central de registo;
- chamada apenas em ações principais;
- middleware ou helper simples, quando fizer sentido;
- consulta administrativa básica.

### 18. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompts para criação da tabela `usage_logs`;
- regras de logging leve;
- prompts para painel administrativo simples;
- critérios de retenção;
- separação entre histórico e analytics;
- checklist de revisão de monitorização ética e leve.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para colar no Cursor AI;
- em texto corrido;
- clara;
- executável;
- sem código na resposta principal;
- orientada a simplicidade e baixo impacto operacional.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não transformar a app num sistema de analytics pesado.
- Não depender de serviços externos complexos.
- Não registar microeventos irrelevantes.
- Não misturar logs internos com histórico funcional do utilizador.
- Não guardar dados sensíveis sem necessidade.
- Não criar painéis administrativos complexos.
- Não sobrecarregar SQLite ou MySQL com escrita excessiva.
- Não esquecer retenção e limpeza mínima.
- Não esquecer privacidade e transparência.
- Não gerar prompts vagos como “adiciona analytics”.
- Não omitir compatibilidade com cPanel.
- Não complicar a arquitetura.

A prioridade é sempre logging mínimo, útil, ético e compatível com alojamento partilhado.

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Logs mínimos por utilizador e ferramenta

Quero que cries uma estrutura de analytics leve para a DATERRA Smart 2, compatível com cPanel e alojamento partilhado. O sistema deve registar apenas eventos principais, como utilizador autenticado, ferramenta usada, tipo de ação principal e timestamp. Cria uma tabela usage_logs simples e uma função central de registo, chamada apenas quando o utilizador abre uma ferramenta importante ou executa uma ação principal como calcular, consultar meteorologia ou enviar imagem para diagnóstico. Mantém tudo leve, sem microeventos, sem dependências externas e sem sobrecarregar SQLite ou MySQL simples. Garante também separação clara entre histórico funcional do utilizador e logs internos de administração.

### Exemplo 2 — SQLite com retenção simples

Quero que estruturas um sistema de logs mínimos em SQLite para a DATERRA Smart 2. A aplicação será leve e alojada em cPanel. Regista apenas user_id, tool_name, action_type e created_at. Não guardes conteúdo sensível nem detalhes desnecessários. Inclui uma regra simples de retenção ou limpeza de logs antigos para evitar crescimento indefinido da base de dados. Organiza a implementação com função de registo reutilizável e consulta administrativa básica com filtro por ferramenta e data. Mantém a solução simples e ética.

### Exemplo 3 — MySQL simples com painel interno

Quero que cries um módulo de monitorização leve da DATERRA Smart 2 usando MySQL simples. O objetivo é saber que ferramentas são mais usadas e quando são usadas, sem tracking invasivo. Cria uma tabela usage_logs mínima, regista apenas eventos principais, filtra por utilizador quando existir autenticação e disponibiliza uma vista administrativa simples com totais por ferramenta e lista recente de acessos. Não cries dashboards pesados, nem serviços externos. Mantém a solução pronta para cPanel, package.json e deploy por .zip.

### Exemplo 4 — Revisão de logging existente

Revê este sistema atual de logging da DATERRA Smart 2 e simplifica-o para uma solução leve e compatível com alojamento partilhado. Quero remover eventos irrelevantes, manter apenas utilizador, ferramenta, ação principal e timestamp, separar claramente logs internos do histórico funcional e reduzir a frequência de escrita para evitar sobrecarga no servidor. Mantém a compatibilidade com SQLite ou MySQL simples, e garante que os logs respeitam princípios mínimos de privacidade e transparência.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Adiciona analytics.”
- “Regista tudo o que o utilizador faz.”
- “Cria logs da app.”
- “Faz tracking do uso.”
- “Monta um dashboard de métricas.”

Motivo:
- são vagos;
- não definem recolha mínima;
- não definem campos;
- não definem distinção entre histórico e logs;
- não definem retenção;
- não definem compatibilidade com alojamento partilhado;
- podem induzir soluções pesadas ou invasivas.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido, completo e pronto para colar numa IA de implementação.

Essa saída deve incluir explicitamente, quando aplicável:
- eventos principais a registar;
- tabela usage_logs ou equivalente;
- campos mínimos;
- associação a utilizador e ferramenta;
- timestamp;
- separação entre histórico e analytics;
- retenção simples;
- painel administrativo leve, se necessário;
- privacidade mínima;
- compatibilidade com cPanel;
- baixo impacto em SQLite ou MySQL simples.

Nunca devolver apenas ideias genéricas. Nunca transformar monitorização leve em tracking pesado. Nunca esquecer o contexto de alojamento partilhado.