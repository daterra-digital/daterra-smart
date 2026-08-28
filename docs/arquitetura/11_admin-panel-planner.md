---
name: admin-panel-planner
description: Gera prompts completos para desenhar e estruturar o painel interno de administração da PWA DATERRA Smart 2, com consulta de utilizadores, histórico e métricas de uso, sempre com foco em simplicidade, segurança, compatibilidade com cPanel e baixo impacto em alojamento partilhado. Use quando o pedido mencionar painel admin, painel interno, administração, utilizadores, histórico, métricas, usage logs, dashboard interno, gestão de utilizadores, estatísticas de uso ou backoffice.
version: 1.0.0
triggers:
  - painel admin
  - painel interno
  - administração
  - utilizadores
  - histórico
  - métricas
  - usage logs
  - dashboard interno
  - gestão de utilizadores
  - estatísticas de uso
  - backoffice
  - admin
  - painel de gestão
  - consulta interna
---

# admin-panel-planner

## Contexto

Esta skill existe para gerar prompts completos para desenhar e estruturar o painel interno de administração da PWA DATERRA Smart 2.

O objetivo é permitir que a equipa responsável pela aplicação consulte utilizadores, histórico e métricas de uso num ambiente interno simples, claro e seguro, sem transformar a app num sistema administrativo pesado ou incompatível com alojamento partilhado.

As referências consultadas sobre cPanel indicam que uma aplicação Node.js pode ser criada e executada através de **Setup Node.js App**, com definição da versão Node.js, `Application Root`, `Application URL`, `Application Startup File`, upload dos ficheiros, instalação de dependências com **Run NPM Install**, configuração de variáveis de ambiente e consulta de logs no painel [web:23][web:25][web:97]. Isto significa que o painel administrativo da DATERRA Smart 2 deve ser pensado desde o início para:
- backend leve;
- base de dados simples;
- deploy fácil por `.zip`;
- configuração visual no cPanel;
- leitura rápida;
- segurança reforçada.

No contexto DATERRA Smart 2, esta skill deve especializar:
- consulta de utilizadores registados;
- consulta de histórico por utilizador;
- consulta de logs e métricas mínimas;
- filtros administrativos;
- visão simples de uso da plataforma;
- navegação clara entre secções internas;
- arquitetura leve para cPanel;
- proteção de dados e controlo de acesso.

A skill não serve para criar um ERP, CRM ou backoffice complexo. Serve para planear um painel administrativo interno, prático e sustentável.

---

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt.

### 1. Ler e interpretar o objetivo do painel

Antes de produzir a saída final, identifica:
- quem vai usar o painel;
- se o painel é apenas para um administrador ou para vários perfis internos;
- se precisa de consultar utilizadores, histórico, logs ou todos;
- se existem métricas mínimas já definidas;
- se a aplicação já tem autenticação;
- se a base de dados é SQLite ou MySQL;
- se o ambiente final será cPanel com Node.js;
- se o painel precisa apenas de leitura ou também de ações simples de gestão.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Classificar o tipo de painel interno

Classifica o pedido numa destas categorias:

- painel de consulta de utilizadores;
- painel de histórico por utilizador;
- painel de métricas de uso;
- painel misto de utilizadores + histórico + métricas;
- dashboard administrativo simples;
- backoffice leve para DATERRA Smart 2;
- painel interno apenas de leitura;
- painel interno com ações básicas de gestão.

### 3. Definir o princípio de simplicidade administrativa

A skill deve sempre assumir que o painel interno deve ser:
- simples;
- rápido;
- seguro;
- legível;
- organizado;
- compatível com smartphone e desktop;
- leve para o servidor;
- fácil de manter em cPanel.

O painel não deve depender de dashboards pesados, gráficos excessivos ou bibliotecas desnecessárias.

### 4. Definir áreas principais do painel

A skill deve obrigar o prompt final a organizar o painel em secções claras, por exemplo:
- visão geral;
- utilizadores;
- histórico;
- métricas de uso;
- logs leves;
- definições ou administração básica, se existir.

Cada secção deve ser claramente separada e fácil de localizar.

### 5. Definir visão geral do painel

A skill deve orientar para uma página inicial simples do painel com:
- total de utilizadores;
- total de ferramentas mais usadas;
- acessos recentes;
- indicadores resumidos;
- atalhos para as áreas principais.

Esta visão geral deve ser sintética e não excessivamente decorativa.

### 6. Definir consulta de utilizadores

A skill deve pedir que o painel permita consultar utilizadores com:
- lista simples;
- nome;
- email;
- data de registo;
- estado da conta, se existir;
- pesquisa rápida;
- acesso ao detalhe do utilizador.

A apresentação deve ser simples e segura.

### 7. Definir detalhe do utilizador

Sempre que o utilizador abrir um perfil no painel, a skill deve orientar para mostrar:
- dados básicos do utilizador;
- histórico resumido;
- últimas ferramentas usadas;
- atividade recente relevante;
- acesso a informação estritamente necessária.

A skill deve evitar exposição excessiva de dados pessoais.

### 8. Definir consulta de histórico

A skill deve obrigar o prompt a prever uma área de histórico com:
- pesquisa;
- filtros por utilizador;
- filtros por ferramenta;
- filtros por data;
- lista cronológica;
- acesso ao detalhe do registo, quando necessário.

A navegação deve ajudar a perceber rapidamente o percurso do utilizador dentro da app.

### 9. Definir métricas mínimas de uso

A skill deve orientar para métricas administrativas leves, como:
- ferramentas mais usadas;
- número de acessos por período;
- utilizadores ativos;
- últimos eventos relevantes;
- distribuição simples de uso por módulo.

A skill deve evitar métricas decorativas ou sem utilidade operacional.

### 10. Definir logs leves e separados

Se existirem logs internos, a skill deve obrigar a separar:
- histórico funcional do utilizador;
- logs técnicos ou analíticos internos.

O painel pode mostrar ambos, mas nunca deve confundir os dois conceitos.

### 11. Definir filtros e pesquisa

A skill deve pedir sempre filtros simples e previsíveis:
- por utilizador;
- por ferramenta;
- por data;
- por tipo de ação;
- por estado, quando aplicável.

A pesquisa deve ser rápida e adequada a uma base de dados leve.

### 12. Definir ações administrativas permitidas

A skill deve obrigar o prompt a definir claramente quais ações o painel permite.

Exemplos aceitáveis:
- consultar;
- filtrar;
- ver detalhe;
- exportar resumo simples, se for útil;
- ativar ou desativar conta, se a regra de negócio o permitir.

A skill deve evitar ações perigosas por omissão.

### 13. Definir segurança e controlo de acesso

A skill deve tratar como obrigatório:
- acesso apenas a utilizadores administradores;
- proteção de rotas internas;
- verificação de sessão;
- separação entre utilizador comum e administrador;
- proibição de acesso direto ao painel sem autenticação;
- controlo básico de permissões.

Isto é essencial para o painel interno.

### 14. Definir privacidade e minimização

A skill deve obrigar o painel a mostrar apenas informação necessária para gestão.

Não deve expor:
- palavras-passe;
- hashes;
- dados sensíveis desnecessários;
- informação privada sem utilidade administrativa;
- logs excessivos ou invasivos.

### 15. Definir arquitetura compatível com cPanel

A skill deve garantir que a proposta é compatível com o fluxo típico do cPanel:
- criação de app por **Setup Node.js App**;
- definição de `Application Root`;
- definição de `Application URL`;
- indicação do `Application Startup File`;
- upload por `.zip`;
- instalação com **Run NPM Install**;
- configuração de variáveis de ambiente;
- análise de erros nos logs da aplicação [web:23][web:25].

O painel deve ser pensado para correr neste contexto sem necessidade de terminal avançado.

### 16. Definir base de dados simples

A skill deve orientar para:
- SQLite quando a app for mais leve;
- MySQL quando a aplicação já use base multiutilizador ou tenha mais crescimento;
- consultas simples;
- índices mínimos apenas quando necessários;
- evitar modelos complexos de reporting.

### 17. Definir experiência visual do painel

A skill deve pedir:
- interface moderna, limpa e responsiva;
- navegação clara;
- cartões simples;
- tabelas leves;
- boa hierarquia visual;
- estados vazios claros;
- boa legibilidade em smartphone e desktop.

Mesmo sendo um painel interno, deve ser fácil de usar.

### 18. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompts para desenhar o painel administrativo;
- prompts para estruturar áreas de utilizadores;
- prompts para histórico e métricas;
- prompts para filtros e pesquisa;
- prompts para regras de segurança do painel;
- checklist de revisão do backoffice leve.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para colar no v0.dev ou Cursor AI, conforme o objetivo;
- em texto corrido;
- clara;
- operacional;
- sem código na resposta principal;
- orientada a simplicidade, segurança e manutenção fácil.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não transformar o painel num sistema administrativo pesado.
- Não expor dados sensíveis.
- Não esquecer autenticação e controlo de acesso.
- Não misturar histórico funcional com logs internos sem distinção.
- Não criar dashboards exagerados.
- Não sobrecarregar a base de dados com consultas complexas desnecessárias.
- Não depender de infraestrutura incompatível com cPanel.
- Não gerar prompts vagos como “faz um painel admin”.
- Não esquecer filtros, pesquisa e hierarquia de navegação.
- Não esquecer compatibilidade com smartphone.
- Não esquecer que o painel é interno e deve ser seguro por definição.

A prioridade é sempre clareza, segurança, manutenção simples e baixo impacto operacional.

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Painel interno completo

Quero que cries o painel interno da DATERRA Smart 2 para administração da aplicação, com secções claras para visão geral, utilizadores, histórico e métricas de uso. O painel deve ser simples, moderno, responsivo e leve, adequado a alojamento partilhado em cPanel. Na visão geral mostra totais resumidos, ferramentas mais usadas e acessos recentes. Na área de utilizadores apresenta lista com nome, email, data de registo e acesso ao detalhe. Na área de histórico permite filtrar por utilizador, ferramenta e data. Na área de métricas mostra apenas indicadores mínimos e úteis. Mantém a navegação clara, os cartões simples, as tabelas leves e a experiência preparada para backend Node.js com SQLite ou MySQL simples.

### Exemplo 2 — Painel focado em utilizadores e histórico

Quero que cries um painel administrativo interno para a DATERRA Smart 2 com foco na consulta de utilizadores e histórico por utilizador. O sistema deve ter pesquisa rápida, filtros simples e páginas de detalhe seguras. Cada utilizador deve ter uma vista com dados básicos, últimas ferramentas usadas e histórico recente. O painel deve exigir autenticação de administrador, ter rotas protegidas e mostrar apenas a informação estritamente necessária. Mantém a arquitetura compatível com Node.js em cPanel, com base de dados simples e baixo impacto operacional.

### Exemplo 3 — Métricas leves de uso

Quero que cries uma área de métricas leves para o painel admin da DATERRA Smart 2. O objetivo é mostrar ferramentas mais usadas, utilizadores ativos, acessos por período e últimos eventos relevantes, sem dashboards pesados nem analytics complexos. A apresentação deve ser simples, com cartões e listas fáceis de ler, filtros por data e navegação clara. O sistema deve funcionar com logs mínimos já registados e manter compatibilidade com alojamento partilhado em cPanel.

### Exemplo 4 — Painel seguro para cPanel

Quero que planeies um painel admin seguro para a DATERRA Smart 2, preparado para deploy em cPanel através de Setup Node.js App, Application Root, Application URL, startup file, upload por .zip, Run NPM Install e variáveis de ambiente. O painel deve ter autenticação de administrador, consulta de utilizadores, histórico e métricas básicas, sem dependências pesadas nem consultas complexas. Organiza a estrutura de forma simples, com backend leve, leitura administrativa rápida e compatibilidade com SQLite ou MySQL simples.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Faz um painel admin.”
- “Cria um dashboard interno.”
- “Monta um backoffice.”
- “Adiciona gestão de utilizadores.”
- “Mostra métricas da app.”

Motivo:
- são vagos;
- não definem áreas;
- não definem filtros;
- não definem segurança;
- não definem compatibilidade com cPanel;
- não definem relação entre utilizadores, histórico e métricas.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido, completo e pronto para colar numa IA de implementação ou desenho de interface.

Essa saída deve incluir explicitamente, quando aplicável:
- áreas principais do painel;
- visão geral;
- consulta de utilizadores;
- detalhe do utilizador;
- histórico;
- métricas mínimas;
- filtros e pesquisa;
- autenticação administrativa;
- compatibilidade com cPanel;
- base de dados simples;
- navegação clara;
- baixo impacto operacional.

Nunca devolver apenas recomendações genéricas. Nunca esquecer que o painel é interno, sensível e deve ser seguro desde a origem.