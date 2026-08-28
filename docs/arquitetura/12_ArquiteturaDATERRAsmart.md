# 🗺️ MANUAL DE ARQUITETURA E ROADMAP OPERACIONAL • DATERRA SMART

> **NOTA DE SISTEMA PARA A IA (PERPLEXITY / GEMINI):** O utilizador que comanda este projeto é um Especialista Agrícola com **ZERO conhecimentos de programação**. O teu papel é o de um Arquiteto de Software e Mentor Didático. Deves explicar as decisões de forma simples, guiar o utilizador passo a passo e gerar código **100% completo, sem omissões** (é estritamente proibido usar comentários como `// o teu código aqui`). Avança apenas uma tarefa de cada vez após a validação do utilizador.

---

## 1. VISÃO GERAL DO PRODUTO (DATERRA SMART)

A **DATERRA Smart** (https://daterra.com.pt) é uma Progressive Web App (PWA) direcionada para o setor agrícola (agricultores, técnicos e diretores). Funciona como uma *toolbox* (caixa de ferramentas), simulador com algoritmos de calibração, leitor de dados meteorológicos/IoT e um **funil de vendas de microlearning** para a **Academia DATERRA (Moodle)**.

### 1.1 Modelo de Negócio (Freemium)
*   **Plano FREE**: Acesso às calculadoras agrícolas básicas, leituras em tempo real, funcionamento offline standard e cápsulas de conhecimento.
*   **Plano PREMIUM**: Relatórios técnicos avançados gerados por Inteligência Artificial (IA), geração de PDFs de inspeção, armazenamento ilimitado na nuvem e ferramentas avançadas.

---

## 2. ESPECIFICAÇÕES VISUAIS E DE DESIGN (FOCO NO CAMPO)

A aplicação será utilizada no terreno, frequentemente sob luz solar intensa. A interface deve ser construída com Tailwind CSS e gerida através de quatro temas configurados em `src/app/globals.css`:

1.  ☀️ **Claro (Light)**: Fundo branco puro ou cinza ultra-claro (`#F9FAFB`), textos e ícones em cinza-escuro absoluto (`#111827`). Máxima legibilidade sob o sol.
2.  🌙 **Escuro (Dark)**: Fundo preto puro (`#000000`) para poupança extrema de bateria em ecrãs OLED no campo.
3.  🖥️ **Sistema**: Sincronização automática com as definições do telemóvel/computador.
4.  👁️ **Alto Contraste**: Fundo branco puro, linhas e bordas pretas grossas (mínimo 2px), texto preto absoluto (`#000000`) e botões secundários em amarelo vibrante (`#FACC15`). Cumprimento estrito do rácio de contraste 7:1 (WCAG 2.1 AAA).

---

## 3. ENGINE MATEMÁTICO: MATRIZ DAS 12 GRANDEZAS AGRI

Todos os cálculos e armazenamento interno no frontend (Next.js/TypeScript) devem ocorrer numa **Unidade Base Interna fixa**. A conversão para a unidade que o utilizador escolheu ver ocorre apenas no componente visual de exibição (`<UnitValue />`).

*   **Temperatura** (Base Interna: `Celsius`): Conversões para `Fahrenheit` e `Kelvin`.
*   **Humidade**: Percentagem (`%`) linear relativa ou absoluta.
*   **Velocidade** (Base Interna: `km/h`): Conversões para `m/s`, `mph` e `knots` (nós).
*   **Pressão** (Base Interna: `bar`): Conversões para `Pa`, `hPa`, `kPa`, `bar`, `psi` e `atm`.
*   **Débito / Fluxo Líquido** (Base Interna: `L/min`): Conversões para `m³/h` e `GPM`.
*   **Volume de Fluxo de Ar** (Base Interna: `m³/h`): Conversão para `CFM`.
*   **Velocidade de Fluxo de Ar** (Base Interna: `m/s`): Conversão para `fpm` (pés por minuto).
*   **pH**: Escala linear estrita de `0.00` a `14.00`.
*   **Dimensões (Largura de Trabalho, Altura, Largura)** (Base Interna: `metros`): Conversões para `cm`, `mm`, `pés` e `polegadas`.
*   **Distância Entrelinha** (Base Interna: `milímetros (mm)`): Conversões para `cm`, `m` e `polegadas`.

---

## 4. FUNIL DE MICROLEARNING E INTEGRAÇÃO MOODLE

### 4.1 O Componente `<DidacticHelp />`
Todas as ferramentas, calculadoras e campos de introdução de dados (inputs) devem ter obrigatoriamente um botão com o ícone `?` ou `i`. Ao clicar:
1.  Abre um pop-up (Modal) com uma explicação puramente didática, pedagógica e validada oficialmente pela DATERRA.
2.  Exibe dicas práticas de campo e valores de referência comuns do setor.
3.  Termina com um link/botão chamativo (CTA): **"Saiba mais na Academia DATERRA"**, que reencaminha o utilizador para o curso exato no Moodle (URL dinâmico gerido via painel de administração).

### 4.2 Autenticação Partilhada (Moodle SSO)
A PWA utilizará o **Supabase Auth** configurado como cliente OAuth2. O **Moodle da DATERRA** atuará como o Provedor de Identidade (IdP). Os utilizadores que já têm conta no Moodle da empresa devem conseguir fazer login na PWA usando exatamente o mesmo e-mail e password.

### 4.3 Gestão de Publicidade do Moodle
O Dashboard principal incluirá um cartão de destaque para publicidade da Academia DATERRA. Os banners (imagens) e respetivos links serão lidos em tempo real da tabela `publicidade_moodle` do Supabase, permitindo que o administrador altere as campanhas no backend.

---

## 5. REQUISITOS OFFLINE-FIRST E ARQUITETURA DA NUVEM

Para garantir o funcionamento no meio do campo sem internet, a aplicação segue regras de sincronização estritas:

### 5.1 Armazenamento Local Automatizado (IndexedDB)
Todas as interações, dados de exploração e respostas a checklists são guardados localmente no telemóvel usando o `IndexedDB` (via Zustand Persist). Cada tabela local tem de ter três campos de controlo:
*   `id`: UUID v4 gerado no telemóvel (evita conflitos na nuvem).
*   `synced`: Booleano (`true` / `false`) que dita se o dado já foi enviado para a nuvem.
*   `updated_at`: Data e hora da última alteração.

### 5.2 Protocolo de Sincronização
A app escuta ativamente o estado da rede (`window.addEventListener('online')`). Assim que detetar internet, recolhe em lote todos os dados com `synced === false`, faz um envio em bloco (Upsert batch) para o Supabase e atualiza o estado local para `true`.

### 5.3 Segurança de Acesso (Bloqueio Premium)
O Next.js Middleware e as políticas de segurança do Supabase (RLS - Row Level Security) validam o token do utilizador. Pedidos feitos às ferramentas Premium ou ao endpoint de relatórios por IA (`/api/gemini/report`) por utilizadores do plano "free" serão bloqueados com um erro `403 Forbidden` e redirecionados para o funil de vendas.

---

## 6. MÓDULO DE INSPEÇÃO E RELATÓRIOS PDF (IA-DRIVEN)

### 6.1 Checklist de Inspeção do Pulverizador
Disponibilização de um formulário interativo baseado no protocolo oficial da DATERRA. O utilizador preenche a checklist no terreno para testar as condições do seu pulverizador e perceber o que deve corrigir antes de submeter o equipamento à inspeção legal do Estado.

### 6.2 Lógica de Geração de PDFs (Online vs. Offline)
*   **Em Modo Online**: A app recolhe as respostas da checklist e os perfis guardados no menu Exploração (Tipo de pulverizador, bicos, calibração), envia para a API do Gemini no Google AI Studio. A IA gera um texto descritivo e personalizado (ex: eficácia contra o míldio na parcela A001). A biblioteca local (`jsPDF`) monta o documento com o design oficial da DATERRA (Verde `#2E7D32`, Cinza `#374151`, cabeçalho com logótipo e paginação) e guarda-o no Supabase Storage. **Disponível apenas para utilizadores Premium.**
*   **Em Modo Offline**: O botão de relatório IA fica indisponível. Surge um aviso: *"Análise avançada de IA apenas disponível em modo online"*. A aplicação permite apenas descarregar localmente um PDF simples com os dados brutos e respostas da checklist, sem a análise da IA.

---

## 7. ESQUELETO DO BANCO DE DADOS (SUPABASE / POSTGRESQL)

A IA deve estruturar as tabelas garantindo relações seguras através de chaves estrangeiras:
*   `utilizadores`: ID, e-mail, primeiro_nome, ultimo_nome, entidade, plano (`free`/`premium`), role (`user`/`admin`).
*   `exploracoes`, `maquinas`, `pulverizadores`, `calibracoes`: Tabelas que compõem o **Perfil de Exploração**. Estes dados estruturados servem para injetar automaticamente contexto nas prompts do chat de IA.
*   `relatorios_pdf`: ID, utilizador_id, nome_ficheiro, url_supabase_storage, tipo, criado_em.
*   `documentos_tecnicos`: Repositório central de manuais, PDFs informativos e tabelas de bicos geridos pelo admin.
*   `publicidade_moodle`: ID, imagem_url, link_moodle, ativo (boolean).

---

## 8. ROADMAP DE EXECUÇÃO PASSO A PASSO (PLANO DE CONSTRUÇÃO)

O desenvolvimento será efetuado em pequenas etapas controladas para mitigar alucinações da IA. O código final será armazenado no GitHub (via GitHub Desktop) e implementado via cPanel no domínio da empresa: `https://daterra.com.pt`.

*   **FASE 1: FUNDAÇÃO E COMPORTAMENTO PWA**
    *   *Tarefa 1.1*: Setup do Next.js App Router e criação do `src/app/globals.css` com as cores exatas dos 4 temas.
    *   *Tarefa 1.2*: Configuração do `manifest.json` e Service Worker para o ecossistema Offline-First.
*   **FASE 2: AUTENTICAÇÃO E CONEXÃO MOODLE (SSO)**
    *   *Tarefa 2.1*: Desenvolvimento do ecrã de registo (recolha de Nome, E-mail, Entidade) e Login com código OTP de 5 dígitos enviado por e-mail.
    *   *Tarefa 2.2*: Configuração do cliente do Supabase e fluxo OAuth2 integrado com o Moodle.
*   **FASE 3: DASHBOARD E ELEMENTOS DINÂMICOS**
    *   *Tarefa 3.1*: Estrutura global da página (Header: Home, Ferramentas, Exploração, Definições; Rodapé).
    *   *Tarefa 3.2*: Criação do Cartão de Meteorologia (com cache offline) e do Cartão de Publicidade Moodle Dinâmica.
*   **FASE 4: MICROLEARNING E ENGINE DE CONVERSÃO**
    *   *Tarefa 4.1*: Código do motor matemático de conversão (`src/lib/conversionEngine.ts`) para as 12 grandezas.
    *   *Tarefa 4.2*: Componente reutilizável `<DidacticHelp />` para integração das cápsulas informativas da Academia.
*   **FASE 5: PERFIS DE EXPLORAÇÃO E CHECKLIST DE INSPEÇÃO**
    *   *Tarefa 5.1*: Formulários CRUD dos perfis (Máquinas, Pulverizadores, Parcelas) guardados localmente e sincronizados à nuvem.
    *   *Tarefa 5.2*: Desenvolvimento do questionário técnico da Checklist de Inspeção de Pulverizadores.
*   **FASE 6: EXPORTAÇÃO PDF E ENDPOINT GEMINI IA**
    *   *Tarefa 6.1*: Implementação da lógica cliente `jsPDF` com layout corporativo e bloqueio de funcionalidades pagas (Free vs Premium).
