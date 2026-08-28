---
title: "Relatório de Estado de Desenvolvimento - DATERRA Smart"
project: "DATERRA Smart"
description: "PWA SaaS Suite Agrícola - DATERRA Smart"
repository_name: "daterra-smart"
project_reference: "PRR - Projeto N.º 23703 (AgroSmart DATERRA)"
version: "1.0.0-rc1"
date: "2026-08-28"
author: "Equipa de Engenharia & Desenvolvimento DATERRA"
status: "Desenvolvimento Ativo / Localhost Operacional"
framework: "React 19 + TypeScript + Vite 8 + Tailwind CSS 4"
storage_engine: "Dexie.js 4 (IndexedDB) - Arquitetura Offline-First"
target_deployments:
  - name: "GitHub Pages"
    platform: "GitHub Actions CI/CD"
    status: "Configurado (.github/deploy-pages.yml) - Requer ajuste no build"
  - name: "cPanel Production"
    platform: "FTP Deploy Action"
    status: "Configurado (.github/deploy-cpanel.yml)"
  - name: "PWA Standalone"
    platform: "VitePWA / Workbox"
    status: "Operacional (Mobile & Desktop)"
locales_supported:
  - "pt (Português de Portugal - Principal)"
  - "br (Português do Brasil)"
  - "en (English US)"
  - "es (Español)"
  - "fr (Français)"
  - "it (Italiano)"
  - "de (Deutsch)"
  - "el (Ελληνικά)"
---

# Relatório de Estado de Desenvolvimento: DATERRA Smart

## 1. Resumo Executivo & Visão do Produto

A plataforma **DATERRA Smart** é uma solução **SaaS Suite Agrícola B2B** orientada para a transição digital e agricultura de precisão, cofinanciada pelo **PRR - Plano de Recuperação e Resiliência (Projeto N.º 23703 | AgroSmart DATERRA)** e pela União Europeia.

### 1.1. Pilares Estruturais
1. **Arquitetura Offline-First Rigorosa**: Concebida especificamente para explorações agrícolas, estufas e parcelas rurais com cobertura de rede móvel (3G/4G/5G) intermitente ou inexistente. Todos os dados operacionais, perfis e históricos residem no dispositivo do operador através de **IndexedDB (Dexie.js)**.
2. **Ergonomia e Usabilidade Mobile-First no Campo**: Interface adaptada para operação em tratores, pulverizadores e condições climatéricas adversas (luz solar direta, uso com luvas), cumprindo requisitos de acessibilidade (*touch targets* mínimos de 48px, tipografia fluida com `clamp()` e contraste cromático elevado).
3. **Cálculo de Precisão & Rigor Institucional**: Algoritmos matemáticos alinhados com as diretrizes da **DGAV** (Direção-Geral de Alimentação e Veterinária), normas **EPPO** (European and Mediterranean Plant Protection Organization) e ensaios de calibração **ISO 16122**.
4. **Capacitação Contínua & Microlearning**: Módulos formativos contextuais integrados em cada campo de cálculo e ligação direta à **Academia DATERRA** (plataforma Moodle).

---

## 2. Stack Tecnológica & Arquitetura de Software

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATERRA SMART CLIENT (PWA)                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Apresentação & UI: React 19.2 + Tailwind CSS 4.3 + Lucide React       │
│  Navegação: React Router DOM 7.18 (Rotas Públicas & Privadas)          │
│  Internacionalização: LanguageContext (8 Dicionários JSON)             │
│  Componentes de Campo: DaterraKeypad + MicrolearningModal + Didactic   │
├─────────────────────────────────────────────────────────────────────────┤
│  Camada de Dados & Offline Engine: Dexie.js 4.4 + Dexie React Hooks    │
│  Base de Dados Local: IndexedDB ("DaterraSmartDB" - Versão 3)           │
├─────────────────────────────────────────────────────────────────────────┤
│  PWA Engine: Vite Plugin PWA 1.3 + Workbox (Cache de Fontes e Assets)  │
│  Bundler / Tooling: Vite 8.2 + TypeScript 6.0 + Oxlint                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Dependências Principais (`package.json`)
* **React 19.2.8 & React-DOM 19.2.8**: Motor de interface reativo de última geração.
* **React Router DOM 7.18.2**: Gestão de rotas cliente, sub-rotas e guardiões de autenticação.
* **Dexie 4.4.4 & Dexie-React-Hooks 4.4.0**: Abstração reativa sobre a API IndexedDB do navegador.
* **Lucide React 1.28.0**: Biblioteca de ícones SVG vetorizados e ultraleves.
* **Tailwind CSS 4.3.3 & @tailwindcss/postcss**: Framework de estilos atómicos de alta performance com temas CSS modernos.
* **Vite 8.2.0**: Ferramenta de build e servidor de desenvolvimento instantâneo com Hot Module Replacement (HMR).
* **Vite-Plugin-PWA 1.3.0**: Geração automática de Service Worker, manifesto PWA e estratégias de cache para funcionamento 100% offline.
* **TypeScript 6.0.2**: Tipagem estática rigorosa em todo o código fonte.
* **Oxlint 1.75.0**: Linter ultra-rápido baseado em Rust para validação de qualidade de código.

### 2.2. Design System & Identidade Visual
A paleta cromática institucional e tokens utilitários estão definidos no ficheiro `src/index.css` sob a diretiva `@theme`:
* `--color-daterra-primary`: `#114037` (Verde Floresta Escuro / Identidade Institucional)
* `--color-daterra-secondary`: `#1D734B` (Verde Médio Agronómico)
* `--color-daterra-accent`: `#3CA64C` (Verde Vibrante de Ação e Sucesso)
* `--color-daterra-accent-hover`: `#3AAA35`
* `--color-daterra-bg`: `#F2F2F2` (Cinza Claro de Alto Contraste Solar)
* Tipografia: `Plus Jakarta Sans` (Corpo e Títulos) e `JetBrains Mono` (Valores numéricos, débitos e pressões).
* Ergonomia: Classe `.touch-target` com altura mínima de 48px e grelha touch dedicada.

---

## 3. Estrutura Exaustiva de Diretórios e Ficheiros

```
daterra-smart-app/
├── .agents/                                # Especializações de agentes e base de conhecimento
│   └── skills/
│       └── gerador-microlearning/          # Skill de geração de microlearning pedagógico
│           ├── SKILL.md                    # Diretrizes técnicas DGAV/EPPO
│           └── references/                 # Manuais oficiais (PDFs e MDs de hidráulica, doses, inspeções)
├── .github/                                # Configurações de CI/CD para automação de deploy
│   └── workflows/                          # Diretoria obrigatória de workflows do GitHub Actions
│       ├── deploy-cpanel.yml               # Pipeline de envio FTP para cPanel
│       └── deploy-pages.yml                # Pipeline de publicação para GitHub Pages
├── docs/                                   # Documentação de Arquitetura e Engenharia
│   ├── arquitetura/                        # 11 Especificações técnicas aprofundadas
│   │   ├── 02_cpanel-deployer.md           # Estratégia de deploy em hospedagem partilhada
│   │   ├── 03_pwa-shell-architect.md       # Arquitetura do Service Worker e PWA Shell
│   │   ├── 04_sqlite-auth-history-designer.md # Modelo de dados e histórico
│   │   ├── 05_privacy-rgpd-writer.md       # Políticas de privacidade e gestão de dados
│   │   ├── 08_weather-api-integrator.md    # Integração de meteorologia e modelos de deriva
│   │   ├── 10_usage-analytics-light.md     # Telemetria sem quebra de privacidade
│   │   ├── 11_admin-panel-planner.md       # Especificação do painel de administração
│   │   ├── 12_ArquiteturaDATERRAsmart.md   # Visão global da arquitetura do software
│   │   ├── 15_BlocoGoogleAIStudio.md       # Regras e prompts agronómicos avançados
│   │   ├── 16_GuiaGoogleAIStudio.md        # Manual de integração com LLMs
│   │   └── 17_TopicosArquiteturaDATERRAsmart.md # Tópicos e decisões chave
│   └── RELATORIO_ESTADO_DESENVOLVIMENTO.md # Relatório exportável no projeto
├── public/                                 # Ficheiros estáticos servidos diretamente
│   ├── favicon.svg                         # Favicon vetorizado
│   └── icons.svg                           # Coleção de ícones estáticos
├── src/                                    # Código-fonte da aplicação
│   ├── assets/                             # Recursos visuais e logótipos vetorizados
│   │   ├── banner-financiamento.svg        # Banner institucional PRR / União Europeia
│   │   ├── daterra-logo.svg                # Logótipo oficial DATERRA
│   │   ├── daterra-smart-logo.svg          # Logótipo da solução DATERRA Smart
│   │   ├── hero.png                        # Imagem de fundo e apresentação
│   │   ├── react.svg                       # Asset React
│   │   └── vite.svg                        # Asset Vite
│   ├── components/                         # Componentes reutilizáveis de interface
│   │   ├── DaterraKeypad.tsx               # Teclado numérico virtual para campo (calculadora/visor)
│   │   ├── IosInstallPrompt.tsx            # Modal inteligente de instruções de instalação no iOS Safari
│   │   ├── MicrolearningModal.tsx          # Modal interativo de perguntas e respostas agronómicas
│   │   ├── PrivateLayout.tsx               # Layout com navegação autenticada (Desktop + Mobile bar)
│   │   └── PublicLayout.tsx                # Layout público (Landing page, Banner PRR, Login)
│   ├── context/                            # Contextos globais do React
│   │   ├── AuthContext.tsx                 # Gestão de sessão, perfis e autenticação OTP
│   │   └── LanguageContext.tsx             # Motor de internacionalização i18n multilingue
│   ├── db/                                 # Camada de persistência local
│   │   └── db.ts                           # Definição do Dexie.js (tabelas, índices, seeds iniciais)
│   ├── features/                           # Módulos verticais de domínio
│   │   ├── concentracao/                   # Microlearnings e FAQs do cálculo de concentração
│   │   │   ├── ConcentracaoFAQConcentracao.md
│   │   │   ├── ConcentracaoFAQGeral.md
│   │   │   ├── ConcentracaoFAQVolumeAplicado.md
│   │   │   ├── ConcentracaoFAQVolumePreparar.md
│   │   │   ├── ConcentracaoFAQVolumeRecomendado.md
│   │   │   └── DidacticHelp.tsx            # Acordeão contextual de apoio técnico
│   │   └── dose/                           # Microlearnings e FAQs do cálculo de dose/ha
│   │       ├── DoseFAQDoseRecomendada.md
│   │       ├── DoseFAQGeral.md
│   │       ├── DoseFAQVolumeAplicado.md
│   │       └── DoseFAQVolumePreparar.md
│   ├── i18n/                               # Ficheiros de tradução em JSON
│   │   └── locales/                        # 8 idiomas (pt, en, br, es, fr, it, de, el)
│   ├── views/                              # Páginas e ecrãs principais da aplicação
│   │   ├── AcademyView.tsx                 # Hub de integração Moodle e formação técnica
│   │   ├── DashboardView.tsx               # Painel de controlo principal da exploração
│   │   ├── ExplorationView.tsx             # Gestão de perfis (Cultura, Equipamento, Bicos, Calibração)
│   │   ├── LandingView.tsx                 # Página de entrada comercial e institucional
│   │   ├── LoginView.tsx                   # Ecrã de autenticação com código OTP
│   │   ├── SettingsView.tsx                # Definições, unidades, notificações e exportação RGPD
│   │   └── ToolsView.tsx                   # Hub de ferramentas agrícolas e calculadoras ativas
│   ├── App.css                             # Estilos globais complementares
│   ├── App.tsx                             # Configuração de rotas e orquestração do sistema
│   ├── index.css                           # Tailwind CSS v4, tema de cores, tipografia e utilitários
│   └── main.tsx                            # Ponto de entrada do React no DOM
├── .env.example                            # Modelo de variáveis de ambiente
├── .gitignore                              # Ficheiros excluídos do controlo de versão
├── .oxlintrc.json                          # Configurações do linter Oxlint
├── index.html                              # HTML raiz com meta-tags PWA e fontes Google
├── package.json                            # Manifesto de dependências e scripts NPM
├── postcss.config.js                       # Configuração do PostCSS com Tailwind v4
├── tsconfig.app.json                       # Configuração TypeScript do cliente
├── tsconfig.json                           # Configuração TypeScript raiz
├── tsconfig.node.json                      # Configuração TypeScript dos ficheiros de configuração
└── vite.config.ts                          # Configuração do Vite e plugin PWA Workbox
```

---

## 4. Navegação, Layouts e Menus

A navegação da aplicação é gerida via **React Router DOM v7** no ficheiro `src/App.tsx`, implementando um padrão de isolamento estrito entre áreas públicas e privadas:

```
                      [ROTEADOR PRINCIPAL (App.tsx)]
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
  [ROTAS PÚBLICAS]                                        [ROTAS PRIVADAS]
  (PublicLayout)                                          (PrivateLayout)
  ├── "/"      ──> LandingView                            ├── "/dashboard"    ──> DashboardView
  └── "/login" ──> LoginView                              ├── "/ferramentas"  ──> ToolsView
                                                          ├── "/exploracao"   ──> ExplorationView
                                                          ├── "/academia"     ──> AcademyView
                                                          └── "/definicoes"   ──> SettingsView
```

### 4.1. Layout Público (`PublicLayout.tsx`)
* **Barra de Financiamento Comunitário**: Cabeçalho de conformidade com referência explícita ao `PRR - Projeto N.º 23703 | AgroSmart DATERRA: Inovação e Transição Digital Agrícola`.
* **Navegação Superior**: Logótipo SVG de alta resolução, hiperligações para âncoras informativas e botão direto para o ecrã de Login.
* **Rodapé Institucional**: Informações de direitos reservados, notas legais e indicação de tecnologia desenvolvida em Portugal.

### 4.2. Layout Privado (`PrivateLayout.tsx`)
* **Header Superior SaaS**:
  * Logótipo DATERRA com filtro monocromático contrastante.
  * **Navegação Desktop**: Links para Início, Ferramentas, Academia, Exploração e Definições com realce dinâmico do estado ativo.
  * **Monitor de Conectividade em Tempo Real**: Indicador visual inteligente que escuta os eventos nativos `window.online` e `window.offline`:
    * *Online*: Emite badge verde `Online (PWA)`.
    * *Offline*: Emite badge âmbar pulsante `Modo Offline (IndexedDB Active)`, garantindo transparência ao operador no campo.
  * Perfil sumário do utilizador com botão de encerramento de sessão (*Logout*).
* **Navegação Inferior Mobile**: Menu em barra fixa inferior adaptado para polegares com ícones tácteis rápidos.

---

## 5. Módulos Funcionais e Ferramentas Agronómicas

O coração operacional da plataforma reside na vista `ToolsView.tsx`, que atua em dois modos: **Hub Geral de Ferramentas** e **Ambiente de Execução da Calculadora**.

### 5.1. Catálogo de Ferramentas (Tools Hub)
O sistema permite pesquisar, filtrar por categoria (*Todas*, *Pulverização*, *Calibração*, *Gestão*, *Clima*) e gerir o ciclo de vida das ferramentas (Instalar / Desinstalar) gravando o estado na tabela `installed_tools` do IndexedDB.

| ID da Ferramenta | Nome Oficial | Categoria | Estado de Implementação |
| :--- | :--- | :--- | :--- |
| `calc_concentracao` | Calculadora de Concentração da Calda | Pulverização | **100% Funcional (Core)** |
| `calc_dose` | Calculadora de Dose por Hectare | Pulverização | **100% Funcional (Core)** |
| `calibracao_bicos` | Calibração e Débito de Bicos | Calibração | Catálogo / Em desenvolvimento |
| `geometria_trv_copa` | Volume de Copa TRV (*Tree Row Volume*) | Calibração | Catálogo / Em desenvolvimento |
| `gestao_caderno_campo` | Caderno de Campo Digital DGAV | Gestão | Catálogo / Em desenvolvimento |
| `clima_estacao_agricola`| Estação Climática & Risco de Deriva | Clima | Catálogo / Em desenvolvimento |
| `mistura_compatibilidade`| Guia de Sequência de Mistura | Pulverização | Catálogo / Em desenvolvimento |
| `gestao_exploracoes` | Gestão de Explorações e Parcelas | Gestão | Integrado em `/exploracao` |

---

### 5.2. Calculadora 1: Concentração da Calda (`calc_concentracao`)
Resolve o cálculo crítico de fitofármacos com suporte a dois regimes operacionais distintos:

#### A) Modo Planta Jovem
Indicado para estados fenológicos iniciais ou culturas herbáceas com baixa área foliar:
$$\text{Quantidade de Produto (mL ou g)} = \frac{C \times C_d}{100}$$
*Onde $C$ é a concentração recomendada no rótulo (ex: mL/hL ou %) e $C_d$ é a capacidade da calda a preparar no depósito (L).*

#### B) Modo Planta Adulta
Ajusta a dosagem ao dossel vegetativo desenvolvido em pomares e vinhas, considerando o volume de referência autorizado vs volume real debitado pelo pulverizador:
$$\text{Quantidade de Produto (mL ou g)} = \frac{C_d \times C \times V_r}{V_a \times 100}$$
*Onde $V_r$ é o Volume Recomendado no Rótulo (L/ha) e $V_a$ é o Volume Real Aplicado (L/ha).*

* **Funcionalidades de Destaque**:
  * Unidades automáticas comutáveis: `mL/hL`, `L/hL`, `g/hL`, `kg/hL`, `%`.
  * Conversor inteligente de grandeza: Apresenta o resultado primário na unidade mais conveniente (ex: $2.400\text{ mL}$ converte automaticamente para $2,40\text{ L}$).
  * Botão de gravação instantânea no histórico local da exploração.
  * Suporte ao Teclado DATERRA e Acordeões Didáticos de Microlearning.

---

### 5.3. Calculadora 2: Dose por Hectare (`calc_dose`)
Converte a dose homologada expressa em kg/ha ou L/ha na quantidade exata a despejar no tanque:
$$\text{Quantidade de Produto} = \frac{C_d \times D \times 1.000}{V_a}$$
$$\text{Área Coberta por Depósito (ha)} = \frac{C_d}{V_a}$$
*Onde $D$ é a Dose de Rótulo (L/ha ou kg/ha).*

* **Funcionalidades de Destaque**:
  * Cálculo concomitante da área coberta por cada tanque cheio.
  * Avisos automáticos de calibração caso o volume de calda divirja dos valores de referência.

---

### 5.4. Teclado Virtual Numérico Agronómico (`DaterraKeypad.tsx`)
Em vez de depender do teclado padrão do sistema operativo móvel (que frequentemente oculta campos de entrada ou carece de separadores decimais adequados), a aplicação inclui um teclado proprietário:
* **Visor Matemático Ativo**: Permite efetuar cálculos simples diretamente no visor (ex: `400 + 200`, `1000 / 3`).
* **Atalhos Rápidos de Depósito**: Botões pré-definidos para volumes típicos de depósitos de pulverizadores (`100L`, `200L`, `400L`, `600L`, `1000L`, `1500L`).
* **Ergonomia Elevada**: Teclas largas de 52px com feedback táctil e animações de clique.

---

### 5.5. Sistema Didático e Microlearning Contextual
* **`DidacticHelp.tsx`**: Botão de apoio didático posicionado junto a cada parâmetro. Ao ser clicado, abre um modal com acordeões gerados dinamicamente a partir dos ficheiros Markdown situados em `src/features/concentracao/` e `src/features/dose/`.
* **Conteúdos Padronizados**: Fórmulas, interpretação técnica, erros frequentes a evitar, diretrizes de segurança e hiperligações para aprofundamento na Academia DATERRA.

---

## 6. Módulo de Exploração Agrícola & Perfis (`ExplorationView.tsx`)

O ecrã `ExplorationView.tsx` totaliza mais de 1.700 linhas de código estruturadas em 4 separadores temáticos, todas ligadas ao IndexedDB local:

```
                            [GESTÃO DA EXPLORAÇÃO]
                                      │
     ┌──────────────────┬─────────────┴────────────┬──────────────────┐
     ▼                  ▼                          ▼                  ▼
[1. CULTURAS]     [2. EQUIPAMENTO]           [3. BICOS]        [4. CALIBRAÇÃO]
├── Variedades    ├── Depósito (L)           ├── Fabricantes   ├── Velocidade km/h
├── Geometria     ├── Bomba & Filtros        ├── Modelos       ├── Pressão bar
├── Entrelinha    ├── Comando & Manómetro    ├── Código Cores  ├── Largura m
└── LAI / TRV     └── Tipo Distribuição      └── ISO 10625     └── Volume L/ha
```

### 6.1. Separador 1: Perfis de Culturas (`profiles_cultures`)
* Registo de Nome da Parcela, Tipo de Cultura (Vinha, Macieira, Olival, etc.), Variedade, Condução e Localização.
* Parâmetros geométricos de copa: Largura da Copa ($W$), Altura da Copa ($H$), Distância da Entrelinha ($W_w$) e Área Foliar (LAI).
* Cálculo automático do **TRV** (*Tree Row Volume* em $\text{m}^3/\text{ha}$).

### 6.2. Separador 2: Perfis de Equipamento de Pulverização (`profiles_equipment`)
* **Depósito & Segurança**: Capacidade do depósito principal, depósito de água limpa para lavagem de mãos, lavador de circuito e incorporador de produto.
* **Bomba & Filtração**: Fabricante da bomba, modelo, tipo de pistão/membrana, crivo de enchimento, filtro de aspiração, filtro de pressão e filtros de linha.
* **Comandos e Regulação**: Arag, Teejet, Hardi, Geoline (Comandos Manuais, Elétricos, ISOBUS, DPAE automáticos, computador de bordo e número de secções).
* **Manómetro segundo Norma ISO**: Diâmetro do mostrador (63mm / 100mm), escala e divisões, pressão máxima e classe de erro.
* **Sistemas de Distribuição Condicionais**:
  * *Barra Horizontal*: Largura da barra e manga de ar auxiliar.
  * *Barra Vertical*: Altura útil de pulverização.
  * *Ventilador Axial/Radial*: Tipo de transmissão (cardan), diâmetro do ventilador, defletores de aspiração e de compressão.
  * *Pistolas/Lanças*: Número de lanças, enroladores e comprimento de mangueira.
  * *Pneumático*: Número de bicos e cabeças pneumáticas.
  * *Canhões & Painéis Recuperadores*: Grupos de bicos e número de linhas simultâneas.
* **Controlo Regulamentar**: Data da última inspeção técnica oficial e data da última calibração.

### 6.3. Separador 3: Catálogo e Perfil de Bicos (`profiles_nozzles`)
* **Fabricantes Homologados**: Albuz, Lechler, Hardi, ASJ, Teejet.
* **Modelos Dinâmicos**: ATR 80, TV I, AVI, CVI, IDK, IDKT, XR TeeJet, etc.
* **Classificação ISO 10625**: Código de cores universal (Amarelo 02, Lilás 025, Azul 03, Vermelho 04, Castanho 05, etc.).
* **Ângulo & Débito Nominal**: Ângulos de jato ($60^\circ$, $80^\circ$, $110^\circ$), tipo de bico (Cone Oco, Jato Plano, Injeção de Ar anti-deriva) e débito tabelado a 3 bar.

### 6.4. Separador 4: Ensaios de Calibração (`profiles_calibrations`)
* Registo de ensaios em branco no terreno com água limpa.
* Determinação da velocidade real de avanço ($\text{km/h}$), pressão de trabalho ($\text{bar}$) e número de bicos abertos.
* Cálculo do débito total ($Q_t$ em $\text{L/min}$) e determinação rigorosa do volume de calda real ($V_a$ em $\text{L/ha}$):
$$V_a = \frac{600 \times Q_t}{v \times W_w}$$

---

## 7. Módulo Academia DATERRA (`AcademyView.tsx`)

Conecta os operadores ao ecossistema formativo oficial da DATERRA:
* **Integração Moodle**: Preparado para comunicação via REST API com o endpoint institucional configurado no ambiente (`VITE_MOODLE_API_URL`).
* **Acompanhamento Curricular**: Apresenta a barra de progresso do formando (ex: 75% concluído no curso ativo *Boas Práticas de Aplicação e Calibração de Pulverizadores*).
* **Módulos de Formação**:
  1. Módulo 1: Legislação, Enquadramento Legal e Rotulagem.
  2. Módulo 2: Métodos de Cálculo de Caldas e Doses.
  3. Módulo 3: Calibração Prática de Atomizadores.
  4. Módulo 4: Segurança Pessoal, Toxicologia e EPIs.
* **Catálogo de Cursos Complementares**: Links diretos com cartões didáticos para *Proteção Integrada na Vinha e Pomares* e *Manutenção e Inspeção Periódica de Pulverizadores*.

---

## 8. Módulo de Definições e Gestão de Dados (`SettingsView.tsx`)

Organizado em 6 sub-menus especializados:
1. **Perfil do Utilizador**: Edição de dados pessoais, número de contribuinte (NIF), exploração agrícola, cargo técnico e contacto.
2. **Preferências e Unidades**: Seleção de perfil métrico internacional (SI) ou configurações personalizadas.
3. **Notificações**: Configuração de alertas operacionais para manutenção preventiva, calibrações e avisos meteorológicos.
4. **Gestão de Dados & RGPD**:
   * **Exportação Integral**: Descarregamento de um ficheiro JSON estruturado contendo todos os dados do utilizador, culturas, equipamentos, bicos, calibrações e histórico de cálculos.
   * **Importação e Restauração**: Carregamento de ficheiro JSON de cópia de segurança.
   * **Reset Total da Exploração**: Apagamento completo e irreversível de todas as tabelas locais do IndexedDB em estrito cumprimento com o direito ao esquecimento (RGPD).
5. **Ajuda & Suporte**: Guias rápidos e canal de apoio agronómico.
6. **Sobre a DATERRA**: Ficha técnica, versão do software e identificação do projeto PRR N.º 23703.

---

## 9. Internacionalização (i18n)

A aplicação conta com um sistema de internacionalização desacoplado e de elevado desempenho em `LanguageContext.tsx`, sem recurso a bibliotecas externas pesadas:
* **8 Idiomas Suportados**: Português de Portugal (`pt`), Português do Brasil (`br`), Inglês (`en`), Espanhol (`es`), Francês (`fr`), Italiano (`it`), Alemão (`de`) e Grego (`el`).
* **Resolução por Notação de Pontos**: Função `t('nav.tools')` resolve caminhos aninhados nos ficheiros JSON.
* **Fallback Automático**: Caso uma chave de tradução não exista no idioma selecionado, o motor recorre automaticamente ao dicionário Português (`pt.json`).
* **Persistência**: O idioma escolhido pelo utilizador é guardado em `localStorage` (`daterra_language`).

---

## 10. Estado do Repositório Git, CI/CD e Publicação

### 10.1. Diagnóstico do Repositório Local
* **Situação Atual**: No diretório de trabalho local, a pasta `.git` **não se encontra inicializada** (o comando `git status` devolve `fatal: not a git repository`).
* **Ação Necessária**: Para conectar ao GitHub e ativar os fluxos automatizados, o repositório deve ser inicializado:
  ```powershell
  git init
  git add .
  git commit -m "feat: DATERRA Smart SaaS Suite v1.0.0"
  git branch -M main
  git remote add origin https://github.com/<seu-utilizador>/<seu-repositorio>.git
  git push -u origin main
  ```

---

### 10.2. Análise do Fluxo GitHub Pages (`.github/deploy-pages.yml`)
O ficheiro existente atualmente no repositório faz upload de `path: '.'` (a raiz do projeto). Sendo uma aplicação React/Vite/TypeScript, o GitHub Pages necessita que o código seja previamente compilado (`npm ci` e `npm run build`) e que o artefacto enviado seja a pasta **`dist/`**.

**Workflow Otimizado e Recomendado para `.github/deploy-pages.yml`**:
```yaml
name: Deploy DATERRA Smart to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Código
        uses: actions/checkout@v4

      - name: Instalar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependências
        run: npm ci

      - name: Compilar Aplicação (Vite Build)
        run: npm run build

      - name: Configurar GitHub Pages
        uses: actions/configure-pages@v5

      - name: Enviar Artefacto (Pasta dist)
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Publicar no GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### 10.3. Análise do Fluxo cPanel (`.github/deploy-cpanel.yml`)
O ficheiro de deploy para cPanel está configurado para envio via FTP:
* **Trigger**: Manual via `workflow_dispatch`.
* **Action**: `SamKirkland/FTP-Deploy-Action@v4.3.5`.
* **Segredos Requeridos no GitHub** (`Settings -> Secrets and variables -> Actions`):
  * `FTP_SERVER`: Endereço do host FTP (ex: `ftp.daterra.pt`).
  * `FTP_USERNAME`: Utilizador FTP criado no cPanel.
  * `FTP_PASSWORD`: Palavra-passe da conta FTP.
* **Destino no Servidor**: Diretório `/public_html/daterra/`.
* *Recomendação*: Compilar previamente o projeto (`npm run build`) e enviar a pasta `dist/` para a diretoria web do cPanel.

---

## 11. Matriz de Maturidade e Próximos Passos

| Módulo / Componente | Nível de Maturidade | Observações & Próximos Passos |
| :--- | :---: | :--- |
| **Ambiente Local (Localhost)** | 🟢 100% Operacional | Vite dev server em execução em `http://localhost:5173/`. HMR ativo. |
| **Compilação de Produção (`build`)** | 🟢 100% Concluído | Tipagens TypeScript corrigidas e validadas (`tsc -b && vite build` sem erros). |
| **Sistema PWA e Offline** | 🟢 100% Concluído | Service Worker, manifesto, ícones e cache Workbox funcionais. |
| **Calculadora de Concentração** | 🟢 100% Concluído | Modos Planta Jovem e Planta Adulta, unidades automáticas e microlearning. |
| **Calculadora de Dose/ha** | 🟢 100% Concluído | Conversão de rótulo e cálculo de área coberta por tanque. |
| **Teclado Numérico de Campo** | 🟢 100% Concluído | Visor aritmético, presets e validação segura contra NaN. |
| **Perfis da Exploração (Dexie)** | 🟢 100% Concluído | Culturas, Equipamentos, Bicos e Calibrações com persistência IndexedDB. |
| **Internacionalização (i18n)** | 🟢 100% Concluído | 8 ficheiros de tradução sincronizados com fallback automático. |
| **Integração Moodle (Academia)** | 🟡 85% Concluído | Interface e cartões implementados. Falta ligação ao token REST ativo. |
| **Integração OpenWeather/Agromonitoring**| 🟡 80% Concluído | UI da meteorologia pronta. Requer inserção de chave válida no `.env`. |
| **Novas Ferramentas do Hub** | 🔵 40% Planeado | Interfaces das ferramentas TRV, Deriva e Mistura a desenvolver nas próximas iterações. |
| **Repositório Git & CI/CD** | 🟡 70% Concluído | Ficheiros de workflow presentes; requer `git init` e atualização dos steps de build. |

---

*Relatório emitido no âmbito do desenvolvimento da plataforma **DATERRA Smart** (PRR N.º 23703).*
