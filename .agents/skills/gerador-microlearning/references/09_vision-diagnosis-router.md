---
name: vision-diagnosis-router
description: Gera prompts completos para implementar o fluxo de captura de foto, envio seguro para APIs externas de visão e tratamento do resultado na PWA DATERRA Smart 2, com backend leve, chave de API protegida em ambiente seguro e foco em smartphone e cPanel. Use quando o pedido mencionar foto, câmara, imagem, diagnóstico, pragas, doenças, visão computacional, Gemini, OpenAI Vision, upload, análise de imagem, API key, backend seguro, captura móvel ou reconhecimento visual.
version: 1.0.0
triggers:
  - foto
  - câmara
  - imagem
  - diagnóstico
  - pragas
  - doenças
  - visão computacional
  - Gemini
  - OpenAI Vision
  - upload
  - análise de imagem
  - API key
  - backend seguro
  - captura móvel
  - reconhecimento visual
  - camera
  - vision
---

# vision-diagnosis-router

## Contexto

Esta skill existe para gerar prompts completos para estruturar um fluxo seguro de captura de imagem e encaminhamento para APIs externas de visão dentro da PWA DATERRA Smart 2.

O objetivo é permitir que o utilizador tire uma fotografia com o smartphone ou envie uma imagem existente, para que essa imagem seja analisada por um serviço externo de visão, como uma API de IA multimodal. O servidor local da aplicação deve atuar apenas como camada leve de mediação, protegendo a chave da API e controlando o fluxo.

As referências consultadas sobre Node.js em cPanel mostram que a publicação de uma app neste ambiente pode ser feita com **Setup Node.js App**, ficheiro de arranque, `package.json`, upload por `.zip` e configuração de variáveis de ambiente como `API_KEY` dentro do próprio painel [web:55][web:56]. Isto é essencial para este módulo, porque a chave da API de visão nunca deve ficar exposta no frontend [web:55][web:56].

No contexto DATERRA Smart 2, esta skill deve especializar:
- captura de foto em smartphone;
- seleção alternativa de imagem;
- envio seguro ao backend;
- chamada à API externa de visão;
- proteção da chave API;
- devolução de resposta resumida ao utilizador;
- registo opcional e leve da consulta;
- compatibilidade com cPanel;
- experiência simples para utilizadores não técnicos.

A skill não deve prometer diagnóstico agronómico absoluto. Deve estruturar o fluxo técnico da análise visual.

---

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt.

### 1. Ler e interpretar o objetivo do módulo

Antes de produzir a saída final, identifica:
- se o utilizador quer usar a câmara em tempo real ou upload de imagem;
- se o objetivo é identificação de pragas, doenças, sintomas ou outro tipo de observação visual;
- se a resposta deve ser curta ou mais detalhada;
- se o módulo terá histórico;
- se a app já tem backend;
- se a app será alojada em cPanel;
- se a análise será feita por Gemini, OpenAI Vision ou outra API equivalente;
- se a imagem será temporária ou guardada.

Se faltarem dados essenciais, a skill deve pedir clarificação simples.

### 2. Classificar o tipo de fluxo visual

Classifica o pedido numa destas categorias:

- captura direta pela câmara;
- upload manual de imagem;
- fluxo híbrido câmara + galeria;
- diagnóstico simples por imagem;
- triagem visual com resposta curta;
- módulo com histórico de consultas;
- integração de visão com backend leve;
- fluxo de imagem com resposta resumida e aviso de prudência.

### 3. Definir o princípio de encaminhamento seguro

A skill deve sempre assumir este princípio:
- o frontend capta a imagem;
- o backend recebe a imagem;
- o backend chama a API externa;
- a API key fica apenas no backend;
- o frontend recebe apenas o resultado necessário.

A skill deve proibir chamadas diretas do frontend para a API de visão quando isso expuser a credencial.

### 4. Definir métodos de captura permitidos

A skill deve obrigar o prompt a prever dois métodos simples:
- abrir a câmara do smartphone;
- escolher uma imagem existente no dispositivo.

Isto garante flexibilidade em diferentes condições de uso.

### 5. Definir comportamento mobile-first

A skill deve sempre pedir:
- foco em smartphone;
- botão grande para tirar foto;
- opção secundária para escolher imagem;
- feedback claro após captura;
- preview simples da imagem;
- legibilidade em exterior;
- processo curto e intuitivo.

O utilizador deve conseguir concluir a ação com poucos passos.

### 6. Definir pré-validação da imagem

A skill deve mandar o prompt pedir validação antes de enviar a imagem:
- verificar se existe ficheiro;
- validar formato básico;
- limitar tamanho razoável;
- impedir uploads absurdamente grandes;
- mostrar mensagem simples em caso de erro;
- permitir repetir a foto.

A skill deve favorecer leveza e fiabilidade.

### 7. Definir backend leve de mediação

A skill deve obrigar o prompt a criar ou usar um backend simples que:
- receba a imagem do frontend;
- valide o pedido;
- trate o ficheiro de forma temporária ou segura;
- envie a imagem para a API externa de visão;
- trate falhas;
- devolva resposta normalizada ao frontend;
- nunca exponha a API key.

A arquitetura deve continuar compatível com cPanel e fácil de publicar.

### 8. Definir segurança da chave API

A skill deve tratar como obrigatório:
- guardar a chave em `.env` ou variável de ambiente no cPanel;
- nunca embutir a chave no JavaScript do frontend;
- nunca expor segredos em respostas ao cliente;
- documentar claramente os nomes das variáveis necessárias;
- prever ambiente de produção simples.

As referências consultadas mostram que o cPanel permite configurar variáveis de ambiente diretamente no painel da app [web:55][web:56].

### 9. Definir escolha de API externa

A skill deve orientar para APIs externas de visão adequadas ao caso de uso, como:
- Google Gemini;
- OpenAI Vision;
- serviço equivalente, desde que seja seguro e simples de integrar.

A skill não deve prender a solução a várias APIs em paralelo sem necessidade clara.

### 10. Definir formato do pedido à API de visão

A skill deve pedir que o backend envie à API apenas o necessário:
- imagem;
- instrução textual curta;
- contexto mínimo do tipo de análise pretendida;
- pedido de resposta clara e prática.

A skill deve evitar prompts longos e caóticos dentro do fluxo técnico.

### 11. Definir formato da resposta ao utilizador

A skill deve orientar o prompt para devolver ao utilizador:
- resposta simples;
- resumo interpretável;
- nível de confiança prudente, quando aplicável;
- aviso de que se trata de apoio e não substitui validação técnica especializada;
- próximos passos sugeridos, se fizer sentido.

A resposta deve ser útil, mas não alarmista nem absoluta.

### 12. Definir aviso de prudência técnica

Sempre que o módulo for usado para pragas ou doenças, a skill deve obrigar a incluir um aviso curto de prudência, por exemplo:
- resultado meramente indicativo;
- confirmação técnica recomendada;
- imagem pode não ser suficiente para diagnóstico conclusivo.

Isto reduz risco de interpretação excessiva.

### 13. Definir tratamento de erros

A skill deve obrigar o prompt a prever:
- falha na câmara;
- recusa de permissão;
- imagem inválida;
- erro de upload;
- timeout da API externa;
- resposta sem diagnóstico claro;
- falha de rede.

As mensagens devem ser claras e não técnicas.

### 14. Definir retenção mínima de imagens

A skill deve orientar para retenção mínima:
- não guardar imagem se isso não for necessário;
- usar processamento temporário quando possível;
- guardar apenas com justificação clara;
- definir comportamento coerente com política de privacidade.

A prioridade é proteção de dados e simplicidade operacional.

### 15. Definir logs e histórico opcionais

Quando o utilizador quiser, a skill pode pedir:
- guardar um resumo da consulta no histórico;
- guardar data, tipo de análise e resultado resumido;
- associar ao utilizador autenticado;
- evitar guardar a imagem bruta sem necessidade.

Os logs técnicos devem ser leves e discretos.

### 16. Definir compatibilidade com cPanel

A skill deve garantir que a solução:
- usa Node.js simples;
- depende de `package.json`;
- pode ser publicada por `.zip`;
- usa variáveis de ambiente do cPanel;
- corre com `Setup Node.js App`;
- evita dependências complexas de infraestrutura.

As referências consultadas mostram precisamente este fluxo como prática normal em cPanel [web:55][web:56].

### 17. Definir organização técnica mínima

A skill deve orientar o prompt para uma estrutura simples, por exemplo:
- rota de upload;
- serviço de mediação para API de visão;
- validação de entrada;
- gestão de variáveis de ambiente;
- tratamento de erros;
- resposta normalizada ao frontend;
- eventual registo leve de histórico.

### 18. Definir requisitos de UX

A skill deve obrigar o prompt a pedir:
- preview da imagem;
- possibilidade de voltar a tirar foto;
- estado de “a analisar”;
- resposta clara em cartão ou bloco simples;
- botões grandes;
- experiência rápida em smartphone.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para colar no Cursor AI;
- em texto corrido;
- clara;
- executável;
- sem código na resposta principal;
- orientada a segurança e simplicidade.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não expor a API key no frontend.
- Não enviar a imagem diretamente do browser para a API externa se isso expuser segredos.
- Não prometer diagnóstico agrícola definitivo.
- Não guardar imagens permanentemente sem necessidade clara.
- Não criar fluxos complicados para o utilizador.
- Não depender apenas de captura em tempo real sem opção de imagem existente.
- Não omitir tratamento de erro.
- Não omitir aviso de prudência técnica.
- Não esquecer compatibilidade com cPanel.
- Não esquecer variáveis de ambiente.
- Não gerar prompts vagos como “liga uma API de visão”.
- Não tornar o backend pesado.
- Não sobrecarregar a app com processamento local desnecessário.

A prioridade é sempre captura simples, encaminhamento seguro, resultado útil e arquitetura leve.

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Fluxo híbrido câmara + galeria

Quero que cries o fluxo completo de diagnóstico visual da DATERRA Smart 2 com duas opções de entrada: tirar fotografia com a câmara do smartphone ou escolher uma imagem já existente. O frontend deve mostrar botões grandes, preview da imagem e uma ação clara para analisar. O backend deve receber a imagem, validar formato e tamanho, encaminhar o pedido para uma API externa como Gemini ou OpenAI Vision e devolver apenas um resumo claro ao utilizador. A chave da API deve ficar apenas em variável de ambiente no backend e nunca no frontend. Inclui tratamento de erros, fallback quando a câmara falhar e um aviso curto de que o resultado é apenas indicativo e não substitui validação técnica especializada.

### Exemplo 2 — Diagnóstico simples com Gemini

Quero que cries um módulo mobile-first para a DATERRA Smart 2 em que o utilizador fotografa uma folha ou fruto com sintomas e envia a imagem para análise por Gemini através de um backend leve. A app deve pedir permissão para usar a câmara, permitir repetir a foto e mostrar estado de carregamento simples enquanto a imagem é analisada. O backend deve proteger a chave da API em .env, tratar o upload, fazer a chamada à API e devolver um resultado curto com interpretação prudente. Se a análise falhar ou a imagem for insuficiente, a mensagem deve ser clara e sem termos técnicos desnecessários. Mantém toda a solução compatível com Node.js em cPanel.

### Exemplo 3 — Upload com histórico leve

Quero que cries o fluxo de envio de imagem e análise visual da DATERRA Smart 2 com upload manual de fotografia e registo leve no histórico do utilizador. O sistema deve aceitar uma imagem, validar tamanho e formato, enviar a imagem de forma segura para uma API de visão externa através do backend e guardar apenas um resumo da consulta com data, tipo de análise e resultado resumido, sem guardar a imagem bruta salvo necessidade explícita. A API key deve ficar em variável de ambiente no cPanel. A experiência deve ser simples, rápida e adequada a smartphone.

### Exemplo 4 — Fluxo seguro para cPanel

Quero que prepares um módulo de visão para a DATERRA Smart 2 totalmente compatível com cPanel. Usa Node.js com backend leve, package.json, variáveis de ambiente e estrutura pronta para deploy por .zip. O frontend deve captar ou selecionar imagem, mas nunca comunicar diretamente com a API externa com credenciais expostas. O backend deve atuar como ponte segura para um serviço como OpenAI Vision, tratar erros e devolver uma resposta simples para o interface. Inclui recomendação de retenção mínima de imagens, mensagens claras ao utilizador e aviso de prudência sobre o caráter indicativo do resultado.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Liga uma API de visão.”
- “Faz diagnóstico por foto.”
- “Usa a câmara para reconhecer doenças.”
- “Mete upload de imagem com IA.”
- “Analisa fotos com uma API.”

Motivo:
- são vagos;
- não definem backend seguro;
- não definem proteção da chave;
- não definem fluxo de captura;
- não definem tratamento da imagem;
- não definem aviso de prudência;
- não definem compatibilidade com cPanel.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido, completo e pronto para colar numa IA de implementação.

Essa saída deve incluir explicitamente, quando aplicável:
- método de captura por câmara ou galeria;
- preview e validação da imagem;
- backend leve de mediação;
- API externa recomendada;
- proteção da API key em ambiente seguro;
- tratamento de erros;
- resposta resumida ao utilizador;
- aviso de prudência técnica;
- retenção mínima de imagens;
- eventual histórico leve;
- compatibilidade com cPanel.

Nunca devolver apenas ideias soltas. Nunca expor segredos. Nunca tratar um resultado visual como diagnóstico absoluto.