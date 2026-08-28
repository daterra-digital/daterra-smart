---
name: weather-api-integrator
description: Gera prompts completos para integrar módulos meteorológicos simples na PWA DATERRA Smart 2, com recolha por GPS ou código postal e uso de APIs meteorológicas gratuitas, sempre com foco em smartphone, baixo atrito, segurança de chave API, backend leve e experiência progressiva em contexto PWA. Use quando o pedido mencionar meteorologia, weather, GPS, localização, código postal, previsão, OpenWeatherMap, clima, API meteorológica, coordenadas, vento, chuva, temperatura, humidade ou integração do tempo.
version: 1.0.0
triggers:
  - meteorologia
  - weather
  - GPS
  - localização
  - código postal
  - previsão
  - OpenWeatherMap
  - clima
  - API meteorológica
  - coordenadas
  - vento
  - chuva
  - temperatura
  - humidade
  - tempo
  - forecast
  - geolocalização
---

# weather-api-integrator

## Contexto

Esta skill existe para gerar prompts completos para integração simples de dados meteorológicos na PWA DATERRA Smart 2.

O objetivo é permitir consulta rápida de meteorologia útil para contexto agrícola, usando apenas dois métodos de entrada simples:
- localização por GPS;
- pesquisa por código postal.

A skill deve privilegiar APIs meteorológicas gratuitas ou com camada gratuita, evitando complexidade desnecessária para o utilizador final e para o alojamento da aplicação.

As referências consultadas sobre PWAs indicam que uma boa aplicação deve ser responsiva, resiliente, útil em diferentes condições de rede e progressivamente melhorada quando o ambiente suporta certas capacidades [web:77][web:1]. Isto é especialmente importante para módulos meteorológicos, porque:
- a geolocalização pode não estar disponível ou autorizada;
- a rede pode ser fraca;
- a informação meteorológica depende de serviços externos;
- a interface deve continuar clara mesmo quando não é possível obter dados em tempo real.

A skill deve, por isso, organizar integrações meteorológicas simples, seguras e práticas para DATERRA Smart 2, sem transformar o módulo numa infraestrutura complexa.

---

## Instruções de Execução

Segue sempre este método fixo antes de gerar qualquer prompt.

### 1. Ler e interpretar o objetivo do módulo

Antes de produzir a saída final, identifica:
- se o utilizador quer previsão atual, previsão horária, previsão diária ou apenas condições atuais;
- se a consulta será feita por GPS, código postal ou ambos;
- se o ecrã já existe ou ainda vai ser desenhado;
- se a app já tem backend;
- se a app será alojada em cPanel;
- se o módulo precisa de guardar histórico de consultas;
- se o utilizador quer apenas dados essenciais ou um painel mais completo.

Se faltarem dados importantes, a skill deve pedir clarificação simples.

### 2. Classificar o tipo de integração meteorológica

Classifica o pedido numa destas categorias:

- consulta simples por GPS;
- consulta simples por código postal;
- módulo híbrido GPS + código postal;
- meteorologia atual;
- previsão curta;
- previsão para apoio à decisão agrícola;
- widget meteorológico simples;
- backend proxy para API externa;
- integração com histórico de consulta;
- módulo com fallback para rede fraca.

### 3. Definir o princípio de simplicidade

A skill deve sempre assumir que o módulo meteorológico da DATERRA Smart 2 deve ser:
- simples;
- rápido;
- fácil de compreender;
- focado em dados realmente úteis;
- compatível com smartphone;
- leve para o backend;
- seguro para a chave da API.

Não deve tentar reproduzir aplicações meteorológicas complexas.

### 4. Definir os métodos de entrada preferidos

A skill deve obrigar o prompt final a privilegiar apenas:
- GPS por geolocalização do dispositivo;
- código postal como alternativa manual.

A interface não deve pedir ao utilizador múltiplos parâmetros complexos se isso puder ser evitado.

### 5. Definir comportamento por GPS

Quando o módulo usar GPS, a skill deve pedir:
- pedido claro de permissão à localização;
- mensagem simples a explicar por que a localização é usada;
- fallback se o utilizador recusar permissão;
- opção manual por código postal;
- tratamento elegante de erro de geolocalização.

A skill deve alinhar este comportamento com a lógica de melhoria progressiva da PWA: usar geolocalização quando disponível, mas manter funcionalidade base quando não estiver [web:1].

### 6. Definir comportamento por código postal

Quando o módulo usar código postal, a skill deve pedir:
- campo simples e claro;
- validação mínima do formato;
- botão principal para consultar;
- possibilidade de guardar o último local se isso fizer sentido;
- mensagens de erro compreensíveis quando o código postal não devolver resultados válidos.

O código postal deve funcionar como alternativa universal ao GPS.

### 7. Definir API meteorológica gratuita preferencial

A skill deve recomendar APIs meteorológicas gratuitas ou com camada gratuita, simples de integrar e adequadas a contexto leve.

A preferência base no ecossistema DATERRA Smart 2 deve ser:
- OpenWeatherMap ou serviço semelhante, desde que a integração permaneça simples.

A skill não deve prender o utilizador a arquiteturas multi-API complexas sem necessidade.

### 8. Definir segurança da chave API

A skill deve obrigar o prompt a exigir:
- armazenamento da API key em `.env` ou variável de ambiente;
- nunca expor a chave no frontend;
- chamadas à API feitas a partir do backend sempre que necessário para proteger credenciais;
- documentação clara das variáveis de ambiente necessárias.

A skill deve tratar este ponto como obrigatório.

### 9. Definir backend leve de mediação

Sempre que houver API key, a skill deve recomendar um backend simples que:
- receba GPS ou código postal do frontend;
- valide os parâmetros;
- consulte a API externa;
- trate erros;
- devolva apenas os dados necessários ao interface;
- esconda a chave da API.

A arquitetura deve continuar leve e compatível com cPanel.

### 10. Definir dados meteorológicos prioritários

A skill deve pedir que o módulo mostre apenas os dados realmente úteis, por exemplo:
- temperatura;
- probabilidade ou indicação de chuva;
- humidade;
- vento;
- estado do tempo;
- previsão resumida para as próximas horas ou dias, quando necessário.

Deve evitar excesso de métricas irrelevantes.

### 11. Definir formato dos resultados

A skill deve orientar para resultados:
- simples;
- legíveis;
- organizados em cartões;
- fáceis de entender no terreno;
- com foco no que ajuda a decisão.

Exemplos:
- cartão principal com estado atual;
- cartões secundários para chuva, vento e temperatura;
- alerta discreto quando a previsão indicar condições relevantes.

### 12. Definir experiência mobile-first

A skill deve obrigar o prompt a pedir:
- foco em smartphone;
- botões grandes;
- campos simples;
- leitura rápida em exterior;
- cartões claros;
- pouco ruído visual;
- navegação direta.

A interface deve ser utilizável em poucos segundos.

### 13. Definir comportamento em rede fraca

A skill deve sempre considerar que o módulo meteorológico depende de rede.

Por isso, o prompt deve prever:
- estados de loading claros;
- mensagens simples de falha;
- fallback elegante quando a consulta falhar;
- indicação de que os dados podem não estar disponíveis;
- possibilidade de manter a última consulta visível, quando isso fizer sentido.

Isto alinha-se com os princípios de resiliência e fiabilidade esperados numa boa PWA [web:77][web:81].

### 14. Definir integração com PWA progressiva

A skill deve orientar o módulo para funcionar bem dentro de uma PWA:
- rápido a abrir;
- simples a usar;
- sem depender de funcionalidades avançadas para funcionar no básico;
- com comportamento claro online e offline;
- preparado para instalação e consulta móvel.

As referências consultadas reforçam que a melhoria progressiva é essencial: usar capacidades avançadas quando existem, sem bloquear o básico quando não existem [web:1].

### 15. Definir offline de forma honesta

A skill deve obrigar o prompt a:
- não prometer meteorologia em tempo real offline;
- mostrar informação em cache apenas quando existir;
- identificar claramente quando os dados podem estar desatualizados;
- manter a interface funcional mesmo sem resposta da API;
- prever mensagem de indisponibilidade quando não houver rede.

### 16. Definir opcional de histórico ou logs

Quando o utilizador quiser, a skill pode pedir:
- registo leve de consultas meteorológicas no histórico;
- logs mínimos de uso do módulo;
- associação ao `user_id` quando existir autenticação.

Mas isso deve ser sempre opcional e leve.

### 17. Definir compatibilidade com cPanel

A skill deve garantir que a integração proposta:
- é compatível com backend leve em Node.js;
- pode ser configurada com variáveis de ambiente;
- não depende de infraestrutura externa complexa além da API meteorológica;
- é simples de publicar em cPanel;
- continua compatível com deploy por `.zip`.

### 18. Definir o que a skill pode gerar

A skill deve ser capaz de gerar:
- prompt completo para Cursor AI;
- estrutura de integração backend;
- lógica de consulta por GPS;
- lógica de consulta por código postal;
- requisitos de UX para o módulo;
- regras de tratamento de erro;
- checklist de integração meteorológica simples.

### 19. Estilo fixo da resposta

A saída final deve ser sempre:
- em português de Portugal;
- pronta para colar no Cursor AI;
- em texto corrido;
- clara;
- executável;
- sem código na resposta principal;
- orientada a uma integração simples e robusta.

---

## Restrições

A skill deve respeitar rigorosamente estas restrições:

- Não expor a API key no frontend.
- Não depender apenas de GPS sem alternativa manual.
- Não criar interfaces complicadas.
- Não mostrar métricas irrelevantes em excesso.
- Não prometer funcionamento offline de dados em tempo real.
- Não esquecer tratamento de erro e fallback.
- Não esquecer contexto de smartphone.
- Não esquecer rede fraca ou ausência de permissão de localização.
- Não propor múltiplas APIs sem necessidade clara.
- Não complicar a arquitetura além de backend leve e integração simples.
- Não gerar prompts vagos como “liga uma API meteorológica”.
- Não esquecer compatibilidade com cPanel.
- Não tratar a meteorologia como um módulo decorativo em vez de funcional.

A prioridade é sempre simplicidade, segurança, clareza e utilidade agrícola prática.

---

## Exemplos de Prompt de Saída

### Exemplo 1 — Módulo híbrido GPS + código postal

Quero que cries a integração meteorológica simples da DATERRA Smart 2 com duas formas de entrada: GPS do dispositivo e código postal manual. O módulo deve ser mobile-first, rápido e fácil de usar em smartphone. Implementa um backend leve que receba coordenadas ou código postal, valide os dados, consulte uma API meteorológica gratuita como OpenWeatherMap e devolva apenas os dados essenciais: temperatura, condição do tempo, chuva, humidade e vento. A chave da API deve ficar em variável de ambiente e nunca no frontend. Se o utilizador negar a localização, o sistema deve oferecer imediatamente a alternativa por código postal. Trata erros de rede com mensagens simples e mantém a experiência clara e útil em contexto agrícola.

### Exemplo 2 — Consulta por GPS

Quero que cries um módulo meteorológico para a DATERRA Smart 2 baseado sobretudo em GPS do smartphone. A app deve pedir permissão de localização com explicação simples e consultar uma API gratuita através do backend, sem expor a chave da API. Mostra dados meteorológicos essenciais em cartões claros e legíveis em exterior. Se a geolocalização falhar ou for recusada, apresenta fallback elegante com opção de introduzir código postal. Mantém a solução leve, progressiva e adequada a uma PWA usada no terreno.

### Exemplo 3 — Consulta por código postal

Quero que cries a integração meteorológica da DATERRA Smart 2 por código postal, com interface extremamente simples. O ecrã deve ter um único campo para código postal, botão grande de consulta e resultados organizados em cartões com os dados meteorológicos principais. Implementa um backend leve para consultar uma API meteorológica gratuita e proteger a chave em .env. Trata entradas inválidas, respostas sem resultados e falhas de rede com mensagens claras. A experiência deve ser mobile-first, rápida e adequada a utilizadores não técnicos.

### Exemplo 4 — Módulo com histórico leve

Quero que cries um módulo meteorológico simples para a DATERRA Smart 2 com consulta por GPS ou código postal e registo leve das consultas no histórico do utilizador autenticado. Usa backend leve compatível com cPanel, variável de ambiente para a chave da API e apenas dados meteorológicos essenciais. Guarda no histórico apenas o local consultado, o tipo de consulta, a data e um resumo curto do resultado. Mantém a solução simples, segura e sem sobrecarregar a base de dados.

---

## Exemplos de Prompt de Saída Mal Formulados

Os seguintes tipos de saída são proibidos:

- “Liga a app a uma API do tempo.”
- “Mete meteorologia por GPS.”
- “Cria um módulo de clima.”
- “Adiciona previsão.”
- “Usa uma API grátis do tempo.”

Motivo:
- são vagos;
- não definem entrada por GPS ou código postal;
- não definem segurança da chave API;
- não definem backend leve;
- não definem tratamento de erro;
- não definem foco mobile;
- não definem dados meteorológicos prioritários.

---

## Regra Final de Saída

Sempre que esta skill for ativada, a resposta final deve ser um prompt corrido, completo e pronto para colar numa IA de implementação.

Essa saída deve incluir explicitamente, quando aplicável:
- método de entrada por GPS, código postal ou ambos;
- API meteorológica gratuita recomendada;
- backend leve;
- proteção da API key;
- dados meteorológicos a devolver;
- tratamento de erro;
- fallback de localização;
- foco em smartphone;
- comportamento em rede fraca;
- eventual histórico leve;
- compatibilidade com cPanel.

Nunca devolver apenas recomendações genéricas. Nunca expor credenciais. Nunca complicar desnecessariamente o módulo.