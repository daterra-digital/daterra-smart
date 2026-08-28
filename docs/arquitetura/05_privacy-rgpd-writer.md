---
name: privacy-rgpd-writer
description: Gera textos e requisitos mínimos de consentimento, política de privacidade, aviso de recolha de dados e regras éticas de tratamento de email e logs para a PWA DATERRA Smart 2, com foco em conformidade prática com RGPD, transparência, minimização de dados e integração simples em apps alojadas em cPanel. Use quando o pedido mencionar RGPD, privacidade, política de privacidade, consentimento, email, logs, recolha de dados, registo, checkbox, tratamento de dados, utilizador, compliance, proteção de dados ou aviso legal.
version: 1.0.0
triggers:
  - RGPD
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
  - GDPR
  - privacy
---

# privacy-rgpd-writer

## Contexto

Esta skill existe para gerar textos claros e requisitos mínimos de privacidade para a PWA DATERRA Smart 2, incluindo consentimento no registo, política de privacidade simples, aviso de recolha de email e regras éticas para monitorização leve de uso.

O objetivo é ajudar a transformar necessidades legais e operacionais em instruções práticas e reutilizáveis para implementar textos, checkboxes, avisos e requisitos mínimos de tratamento de dados numa aplicação agrícola mobile-first.

As fontes consultadas confirmam que, em Portugal, o tratamento de dados pessoais deve respeitar o RGPD e a Lei n.º 58/2019 [web:66][web:65]. Também confirmam que o consentimento válido deve resultar de uma manifestação de vontade expressa, livre, específica, informada e inequívoca do titular dos dados [web:71]. Isto significa que a app não deve esconder a recolha de dados, nem usar textos vagos, nem recolher mais informação do que a necessária para a sua função.

No contexto DATERRA Smart 2, esta skill deve apoiar:
- criação de texto para checkbox de consentimento;
- criação de política de privacidade simples;
- explicação do uso de email para conta e autenticação;
- explicação do uso de logs leves para gestão interna da ferramenta;
- minimização de dados;
- separação entre histórico funcional e monitorização interna;
- alinhamento entre o texto legal e a implementação técnica.

A skill não substitui apoio jurídico formal. Serve para criar uma base mínima, clara e responsável, pronta para integração em produto digital real.

---

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

As fontes consultadas reforçam que o consentimento e o tratamento de dados devem ser claros e enquadrados num quadro legal definido pelo RGPD e pela lei portuguesa aplicável [web:66][web:71].

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

As fontes consultadas confirmam explicitamente estes requisitos para validade do consentimento [web:71].

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

As políticas institucionais consultadas em Portugal mostram precisamente este tipo de estrutura informativa como base de transparência [web:65][web:66].

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

As regras europeias e portuguesas sobre proteção de dados assentam precisamente em necessidade, proporcionalidade e limitação da finalidade [web:67][web:66].

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

As fontes consultadas sobre cPanel mostram que variáveis de ambiente e estrutura de produção podem ser configuradas no próprio painel da app [web:55][web:56].

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

---

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