# Plano de Desenvolvimento da PWA SaaS Suite Agrcola DATERRA Smart

**Projeto:** DATERRA Smart - SaaS Suite Agrcola B2B  
**Referncia:** PRR - Projeto N. 23703 | AgroSmart DATERRA  
**Verso do Plano:** 2.0.0  
**Data:** 2026-08-28  
**Localizao do Projeto:** `C:\Users\pedro\OneDrive\Documentos\Projetos-Code\daterra-smart-app`  
**Status:** Desenvolvimento Ativo / Localhost Operacional  

---

## 1. Resumo Executivo

### 1.1. Viso do Produto

A plataforma **DATERRA Smart** uma soluo **SaaS Suite Agrcola B2B** orientada para a transio digital e agricultura de preciso, cofinanciada pelo **PRR - Plano de Recuperao e Resilincia (Projeto N. 23703)** e pela Unio Europeia.

### 1.2. Pilares Estruturais

1. **Arquitetura Offline-First Rigorosa**: Todos os dados operacionais residem no dispositivo do operador atravs de **IndexedDB (Dexie.js)**.
2. **Ergonomia e Usabilidade Mobile-First no Campo**: Interface adaptada para operao em tratores, pulverizadores e condies climatricas adversas.
3. **Clculo de Preciso & Rigor Institucional**: Algoritmos alinhados com diretrizes **DGAV**, normas **EPPO** e ensaios de calibrao **ISO 16122**.
4. **Capacitao Contnua & Microlearning**: Mdulos formativos contextuais integrados e ligao direta **Academia DATERRA** (Moodle).

---

## 2. Stack Tecnolgica & Arquitetura de Software

### 2.1. Stack Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATERRA SMART CLIENT (PWA)                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Apresentao & UI: React 19.2 + TypeScript 6.0 + Tailwind CSS 4.3       │
│  Navegao: React Router DOM 7.18 (Rotas Pblicas & Privadas)             │
│  Internacionalizao: LanguageContext (8 Dicionrios JSON)                │
│  Componentes de Campo: DaterraKeypad + MicrolearningModal + Didactic    │
├─────────────────────────────────────────────────────────────────────────┤
│  Camada de Dados & Offline Engine: Dexie.js 4.4 + Dexie React Hooks    │
│  Base de Dados Local: IndexedDB ("DaterraSmartDB" - Verso 3)            │
├─────────────────────────────────────────────────────────────────────────┤
│  PWA Engine: Vite Plugin PWA 1.3 + Workbox (Cache de Fontes e Assets)  │
│  Bundler / Tooling: Vite 8.2 + TypeScript 6.0 + Oxlint                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Dependncias Principais

- **React 19.2.8 & React-DOM 19.2.8**
- **React Router DOM 7.18.2**
- **Dexie 4.4.4 & Dexie-React-Hooks 4.4.0**
- **Lucide React 1.28.0**
- **Tailwind CSS 4.3.3 & @tailwindcss/postcss**
- **Vite 8.2.0**
- **Vite-Plugin-PWA 1.3.0**
- **TypeScript 6.0.2**
- **Oxlint 1.75.0**

### 2.3. Design System & Identidade Visual

**Paleta cromtica institucional** (`src/index.css`):

- `--color-daterra-primary`: `#114037` (Verde Floresta Escuro)
- `--color-daterra-secondary`: `#1D734B` (Verde Mdio Agronmico)
- `--color-daterra-accent`: `#3CA64C` (Verde Vibrante)
- `--color-daterra-accent-hover`: `#3AAA35`
- `--color-daterra-bg`: `#F2F2F2` (Cinza Claro de Alto Contraste Solar)

**Tipografia:**
- `Plus Jakarta Sans` (Corpo e Ttulos)
- `JetBrains Mono` (Valores numricos, dbitos e presses)

**Ergonomia:**
- Classe `.touch-target` com altura mnima de 48px
- Grelha touch dedicada

---

## 3. Estrutura de Diretories e Ficheiros

```
daterra-smart-app/
├── .agents/                                # Especializaes de agentes e base de conhecimento
│   └── skills/
│       └── gerador-microlearning/          # Skill de gerao de microlearning pedaggico
│           ├── SKILL.md                    # Diretrizes tcnicas DGAV/EPPO
│           └── references/                 # Manuais oficiais (PDFs e MDs)
├── .github/                                # Configuraes de CI/CD para automao de deploy
│   ├── deploy-cpanel.yml                   # Pipeline de envio FTP para cPanel
│   └── deploy-pages.yml                    # Pipeline de publicao para GitHub Pages
├── docs/                                   # Documentao de Arquitetura e Engenharia
│   ├── arquitetura/                        # 11 Especificaes tcnicas aprofundadas
│   │   ├── 02_cpanel-deployer.md
│   │   ├── 03_pwa-shell-architect.md
│   │   ├── 04_sqlite-auth-history-designer.md
│   │   ├── 05_privacy-rgpd-writer.md
│   │   ├── 08_weather-api-integrator.md
│   │   ├── 10_usage-analytics-light.md
│   │   ├── 11_admin-panel-planner.md
│   │   ├── 12_ArquiteturaDATERRAsmart.md
│   │   ├── 15_BlocoGoogleAIStudio.md
│   │   ├── 16_GuiaGoogleAIStudio.md
│   │   └── 17_TopicosArquiteturaDATERRAsmart.md
│   └── RELATORIO_ESTADO_DESENVOLVIMENTO.md
├── public/                                 # Ficheiros estticos servidos diretamente
│   ├── favicon.svg
│   └── icons.svg
├── src/                                    # Cdigo-fonte da aplicao
│   ├── assets/                             # Recursos visuais e logtipos vetorizados
│   │   ├── banner-financiamento.svg
│   │   ├── daterra-logo.svg
│   │   ├── daterra-smart-logo.svg
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/                         # Componentes reutilizveis de interface
│   │   ├── DaterraKeypad.tsx
│   │   ├── IosInstallPrompt.tsx
│   │   ├── MicrolearningModal.tsx
│   │   ├── PrivateLayout.tsx
│   │   └── PublicLayout.tsx
│   ├── context/                            # Contextos globais do React
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── db/                                 # Camada de persistncia local
│   │   └── db.ts
│   ├── features/                           # Mdulos verticais de domnio
│   │   ├── concentracao/
│   │   │   ├── ConcentracaoFAQConcentracao.md
│   │   │   ├── ConcentracaoFAQGeral.md
│   │   │   ├── ConcentracaoFAQVolumeAplicado.md
│   │   │   ├── ConcentracaoFAQVolumePreparar.md
│   │   │   ├── ConcentracaoFAQVolumeRecomendado.md
│   │   │   └── DidacticHelp.tsx
│   │   └── dose/
│   │       ├── DoseFAQDoseRecomendada.md
│   │       ├── DoseFAQGeral.md
│   │       ├── DoseFAQVolumeAplicado.md
│   │       └── DoseFAQVolumePreparar.md
│   ├── i18n/                               # Ficheiros de traduo em JSON
│   │   └── locales/                        # 8 idiomas (pt, en, br, es, fr, it, de, el)
│   ├── views/                              # Pginas e ecrs principais da aplicao
│   │   ├── AcademyView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ExplorationView.tsx
│   │   ├── LandingView.tsx
│   │   ├── LoginView.tsx
│   │   ├── SettingsView.tsx
│   │   └── ToolsView.tsx
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── postcss.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 4. Navegao, Layouts e Menus

### 4.1. Estrutura de Rotas

```
                      [ROTEADOR PRINCIPAL (App.tsx)]
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
  [ROTAS PBLICAS]                                        [ROTAS PRIVADAS]
  (PublicLayout)                                          (PrivateLayout)
  ├── "/"      ──> LandingView                            ├── "/dashboard"    ──> DashboardView
  └── "/login" ──> LoginView                              ├── "/ferramentas"  ──> ToolsView
                                                          ├── "/exploracao"   ──> ExplorationView
                                                          ├── "/academia"     ──> AcademyView
                                                          └── "/definicoes"   ──> SettingsView
```

### 4.2. Layout Pblico (`PublicLayout.tsx`)

- **Barra de Financiamento Comunitrio**: Cabealho de conformidade com referncia ao `PRR - Projeto N. 23703`.
- **Navegao Superior**: Logtipo SVG, hiperligaes para ncoras informativas e boto para Login.
- **Rodap Institucional**: Informaes de direitos reservados e notas legais.

### 4.3. Layout Privado (`PrivateLayout.tsx`)

- **Header Superior SaaS**:
  - Logtipo DATERRA com filtro monocromtico.
  - **Navegao Desktop**: Links para Incio, Ferramentas, Academia, Explorao e Definies.
  - **Monitor de Conectividade em Tempo Real**:
    - *Online*: Badge verde `Online (PWA)`.
    - *Offline*: Badge mbar pulsante `Modo Offline (IndexedDB Active)`.
  - Perfil sumrio do utilizador com boto de Logout.
- **Navegao Inferior Mobile**: Menu em barra fixa inferior adaptado para polegares.

---

## 5. Mdulos Funcionais e Ferramentas Agronmicas

### 5.1. Catlogo de Ferramentas (Tools Hub)

| ID da Ferramenta | Nome Oficial | Categoria | Estado de Implementao |
| :--- | :--- | :--- | :--- |
| `calc_concentracao` | Calculadora de Concentrao da Calda | Pulverizao | **100% Funcional (Core)** |
| `calc_dose` | Calculadora de Dose por Hectare | Pulverizao | **100% Funcional (Core)** |
| `calc_area_parede_foliar` | rea de Parede Foliar | Calibrao | **A Desenvolver** |
| `calc_volume_copa` | Volume de Copa | Calibrao | **A Desenvolver** |
| `calc_dose_area_superficie` | Dose por rea de Superfcie | Pulverizao | **A Desenvolver** |
| `calc_dose_parede_foliar` | Dose de Parede Foliar | Pulverizao | **A Desenvolver** |
| `calc_dose_volume_copa` | Dose de Volume de Copa | Pulverizao | **A Desenvolver** |
| `calc_concentracao_calda` | Concentrao da Calda | Pulverizao | **A Desenvolver** |
| `calc_velocidade_real` | Velocidade Real de Trabalho | Calibrao | **A Desenvolver** |
| `calc_volume_calda_ajustado` | Volume de Calda Ajustado | Pulverizao | **A Desenvolver** |
| `calc_debito_total` | Dbito Total do Pulverizador | Calibrao | **A Desenvolver** |
| `calc_debito_unitario` | Dbito Unitrio por Bico | Calibrao | **A Desenvolver** |
| `calc_debito_total_drones` | Dbito Total para Drones | Drones | **A Desenvolver** |
| `calc_largura_faixa_drones` | Largura da Faixa para Drones | Drones | **A Desenvolver** |
| `calibracao_bicos` | Calibrao e Dbito de Bicos | Calibrao | Catlogo / Em desenvolvimento |
| `geometria_trv_copa` | Volume de Copa TRV (Tree Row Volume) | Calibrao | Catlogo / Em desenvolvimento |
| `gestao_caderno_campo` | Caderno de Campo Digital DGAV | Gesto | Catlogo / Em desenvolvimento |
| `clima_estacao_agricola`| Estao Climtica & Risco de Deriva | Clima | Catlogo / Em desenvolvimento |
| `mistura_compatibilidade`| Guia de Sequncia de Mistura | Pulverizao | Catlogo / Em desenvolvimento |
| `gestao_exploracoes` | Gesto de Exploraes e Parcelas | Gesto | Integrado em `/exploracao` |

---

### 5.2. Calculadoras Implementadas (100% Funcionais)

#### A) Calculadora de Concentrao da Calda (`calc_concentracao`)

**Modo Planta Jovem:**
$$\text{Quantidade de Produto (mL ou g)} = \frac{C \times C_d}{100}$$

*Onde $C$ a concentrao recomendada no rtulo (ex: mL/hL ou %) e $C_d$ a capacidade da calda a preparar no depsito (L).*

**Modo Planta Adulta:**
$$\text{Quantidade de Produto (mL ou g)} = \frac{C_d \times C \times V_r}{V_a \times 100}$$

*Onde $V_r$ o Volume Recomendado no Rtulo (L/ha) e $V_a$ o Volume Real Aplicado (L/ha).*

**Funcionalidades:**
- Unidades automticas comutveis: `mL/hL`, `L/hL`, `g/hL`, `kg/hL`, `%`.
- Conversor inteligente de grandeza.
- Gravao instantnea no histrico local.
- Suporte ao Teclado DATERRA e Acordees Didticos de Microlearning.

#### B) Calculadora de Dose por Hectare (`calc_dose`)

$$\text{Quantidade de Produto} = \frac{C_d \times D \times 1.000}{V_a}$$
$$\text{rea Coberta por Depsito (ha)} = \frac{C_d}{V_a}$$

*Onde $D$ a Dose de Rtulo (L/ha ou kg/ha).*

**Funcionalidades:**
- Clculo concomitante da rea coberta por cada tanque cheio.
- Avisos automticos de calibrao.

---

### 5.3. Teclado Virtual Numrico Agronmico (`DaterraKeypad.tsx`)

- **Visor Matemtico Ativo**: Permite efetuar clculos simples diretamente no visor.
- **Atalhos Rpidos de Depsito**: Botes pr-definidos para volumes tpicos (`100L`, `200L`, `400L`, `600L`, `1000L`, `1500L`).
- **Ergonomia Elevada**: Teclas largas de 52px com feedback tctil.

---

### 5.4. Sistema Didtico e Microlearning Contextual

- **`DidacticHelp.tsx`**: Boto de apoio didtico junto a cada parmetro.
- **Contedos Padronizados**: Frmulas, interpretao tcnica, erros frequentes, diretrizes de segurana.

---

## 6. Mdulo de Explorao Agrcola & Perfis (`ExplorationView.tsx`)

### 6.1. Separador 1: Perfis de Culturas (`profiles_cultures`)

- Registo de Nome da Parcela, Tipo de Cultura, Variedade, Conduo e Localizao.
- Parmetros geomtricos de copa: Largura da Copa ($W$), Altura da Copa ($H$), Distncia da Entrelinha ($W_w$) e rea Foliar (LAI).
- Clculo automtico do **TRV** (Tree Row Volume em $\text{m}^3/\text{ha}$).

### 6.2. Separador 2: Perfis de Equipamento de Pulverizao (`profiles_equipment`)

- **Depsito & Segurana**: Capacidade do depsito principal, depsito de gua limpa.
- **Bomba & Filtrao**: Fabricante, modelo, tipo de pisto/membrana, filtros.
- **Comandos e Regulao**: Arag, Teejet, Hardi, Geoline (Manuais, Eltricos, ISOBUS, DPAE).
- **Manmetro segundo Norma ISO**: Dimetro, escala, presso mxima e classe de erro.
- **Sistemas de Distribuio Condicionais**: Barra Horizontal, Barra Vertical, Ventilador Axial/Radial, Pistolas/Lanas, Pneumtico, Canhes & Painis Recuperadores.
- **Controlo Regulamentar**: Data da ltima inspeo tcnica e calibrao.

### 6.3. Separador 3: Catlogo e Perfil de Bicos (`profiles_nozzles`)

- **Fabricantes Homologados**: Albuz, Lechler, Hardi, ASJ, Teejet.
- **Modelos Dinmicos**: ATR 80, TV I, AVI, CVI, IDK, IDKT, XR TeeJet, etc.
- **Classificao ISO 10625**: Cdigo de cores universal.
- **ngulo & Dbito Nominal**: ngulos de jato ($60^\circ$, $80^\circ$, $110^\circ$), tipo de bico e dbito tabelado a 3 bar.

### 6.4. Separador 4: Ensaios de Calibrao (`profiles_calibrations`)

- Registo de ensaios em branco no terreno com gua limpa.
- Determinao da velocidade real de avano ($\text{km/h}$), presso de trabalho ($\text{bar}$) e nmero de bicos abertos.
- Clculo do dbito total ($Q_t$ em $\text{L/min}$) e volume de calda real ($V_a$ em $\text{L/ha}$):
$$V_a = \frac{600 \times Q_t}{v \times W_w}$$

---

## 7. Mdulo Academia DATERRA (`AcademyView.tsx`)

- **Integrao Moodle**: Preparado para comunicao via REST API (`VITE_MOODLE_API_URL`).
- **Acompanhamento Curricular**: Barra de progresso do formando.
- **Mdulos de Formao**:
  1. Legislao, Enquadramento Legal e Rotulagem.
  2. Mtodos de Clculo de Caldas e Doses.
  3. Calibrao Prtica de Atomizadores.
  4. Segurana Pessoal, Toxicologia e EPIs.
- **Catlogo de Cursos Complementares**: Links diretos para cursos adicionais.

---

## 8. Mdulo de Definies e Gesto de Dados (`SettingsView.tsx`)

1. **Perfil do Utilizador**: Edio de dados pessoais, NIF, explorao agrcola, cargo tcnico e contacto.
2. **Preferncias e Unidades**: Seleo de perfil mtrico internacional (SI) ou personalizaes.
3. **Notificaes**: Alertas operacionais para manuteno, calibraes e avisos meteorolgicos.
4. **Gesto de Dados & RGPD**:
   - **Exportao Integral**: Ficheiro JSON estruturado com todos os dados.
   - **Importao e Restaurao**: Carregamento de ficheiro JSON de cpia de segurana.
   - **Reset Total da Explorao**: Apagamento completo de todas as tabelas IndexedDB (direito ao esquecimento RGPD).
5. **Ajuda & Suporte**: Guias rpidos e canal de apoio agronmico.
6. **Sobre a DATERRA**: Ficha tcnica, verso do software e identificao do projeto PRR N. 23703.

---

## 9. Internacionalizao (i18n)

- **8 Idiomas Suportados**: pt, br, en, es, fr, it, de, el.
- **Resoluo por Notao de Pontos**: Funo `t('nav.tools')`.
- **Fallback Automtico**: Recorre ao dicionrio Portugus (`pt.json`).
- **Persistncia**: Idioma guardado em `localStorage` (`daterra_language`).

---

## 10. Estado do Repositrio Git, CI/CD e Publicao

### 10.1. Diagnstico do Repositrio Local

- **Situao Atual**: Pasta `.git` **no se encontra inicializada**.
- **Ao Necessria**:

```powershell
cd C:\Users\pedro\OneDrive\Documentos\Projetos-Code\daterra-smart-app
git init
git add .
git commit -m "feat: DATERRA Smart SaaS Suite v1.0.0-rc1"
git branch -M main
git remote add origin https://github.com/<seu-utilizador>/<seu-repositorio>.git
git push -u origin main
```

---

### 10.2. Fluxo GitHub Pages (`.github/deploy-pages.yml`)

**Workflow Otimizado:**

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
      - name: Checkout Cdigo
        uses: actions/checkout@v4

      - name: Instalar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependncias
        run: npm ci

      - name: Compilar Aplicao (Vite Build)
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

### 10.3. Fluxo cPanel (`.github/deploy-cpanel.yml`)

- **Trigger**: Manual via `workflow_dispatch`.
- **Action**: `SamKirkland/FTP-Deploy-Action@v4.3.5`.
- **Segredos Requeridos no GitHub**:
  - `FTP_SERVER`: Endereço do host FTP (ex: `ftp.daterra.pt`).
  - `FTP_USERNAME`: Utilizador FTP criado no cPanel.
  - `FTP_PASSWORD`: Palavra-passe da conta FTP.
- **Destino no Servidor**: Diretrio `/public_html/daterra/`.
- **Recomenda**: Compilar previamente (`npm run build`) e enviar a pasta `dist/`.

---

## 11. Matriz de Maturidade e Prximos Passos

| Mdulo / Componente | Nvel de Maturidade | Observaes & Prximos Passos |
| :--- | :---: | :--- |
| **Ambiente Local (Localhost)** | 🟢 100% Operacional | Vite dev server em `http://localhost:5173/`. HMR ativo. |
| **Compilao de Produo (`build`)** | 🟢 100% Concludo | Tipagens TypeScript validadas. |
| **Sistema PWA e Offline** | 🟢 100% Concludo | Service Worker, manifesto, cones e cache Workbox funcionais. |
| **Calculadora de Concentrao** | 🟢 100% Concludo | Modos Planta Jovem e Adulta, unidades automticas e microlearning. |
| **Calculadora de Dose/ha** | 🟢 100% Concludo | Converso de rtulo e clculo de rea coberta. |
| **Teclado Numrico de Campo** | 🟢 100% Concludo | Visor aritmtico, presets e validao segura. |
| **Perfis da Explorao (Dexie)** | 🟢 100% Concludo | Culturas, Equipamentos, Bicos e Calibraes com persistncia IndexedDB. |
| **Internacionalizao (i18n)** | 🟢 100% Concludo | 8 ficheiros de traduo sincronizados com fallback automtico. |
| **Integrao Moodle (Academia)** | 🟡 85% Concludo | Interface e cartes implementados. Falta ligao ao token REST ativo. |
| **Integrao OpenWeather/Agromonitoring**| 🟡 80% Concludo | UI da meteorologia pronta. Requer insero de chave vlida no `.env`. |
| **Novas Calculadoras (12 novas)** | 🔵 0% Planeado | Interfaces e lgica a desenvolver nas prximas iteraes. |
| **Repositrio Git & CI/CD** | 🟡 70% Concludo | Ficheiros de workflow presentes; requer `git init` e push. |

---

## 12. Plano de Desenvolvimento por Fases

### Fase 1 - Consolidao e Git (Dias 1-3)

**Objetivo:** Inicializar repositrio Git e garantir que todo o cdigo est versionado.

**Tarefas:**

1. **Inicializar Git:**
   ```powershell
   cd C:\Users\pedro\OneDrive\Documentos\Projetos-Code\daterra-smart-app
   git init
   git add .
   git commit -m "feat: DATERRA Smart SaaS Suite v1.0.0-rc1"
   git branch -M main
   ```

2. **Criar repositrio no GitHub:**
   - Aceder a `https://github.com/new`
   - Nome: `daterra-smart-saas`
   - Privado: Sim
   - Copiar URL do repositrio

3. **Ligar repositrio local ao GitHub:**
   ```powershell
   git remote add origin https://github.com/<teu-user>/daterra-smart-saas.git
   git push -u origin main
   ```

4. **Testar build de produo:**
   ```powershell
   npm run build
   ```
   - Verificar que a pasta `dist/` gerada sem erros.

5. **Configurar segredos no GitHub:**
   - `Settings` → `Secrets and variables` → `Actions`
   - Adicionar:
     - `FTP_SERVER`: `ftp.daterra.pt`
     - `FTP_USERNAME`: `<teu-user-ftp>`
     - `FTP_PASSWORD`: `<tua-password-ftp>`

**Resultado Esperado:**
- Repositrio Git inicializado e ligado ao GitHub.
- Primeiro commit feito com sucesso.
- Build de produo funcional.
- Segredos de FTP configurados.

---

### Fase 2 - Novas Calculadoras (Dias 4-14)

**Objetivo:** Implementar 12 novas calculadoras agrcolas.

**Prioridade de Desenvolvimento:**

1. **rea de Parede Foliar** (`calc_area_parede_foliar`)
2. **Volume de Copa** (`calc_volume_copa`)
3. **Dose por rea de Superfcie** (`calc_dose_area_superficie`)
4. **Dose de Parede Foliar** (`calc_dose_parede_foliar`)
5. **Dose de Volume de Copa** (`calc_dose_volume_copa`)
6. **Concentrao da Calda** (`calc_concentracao_calda`)
7. **Velocidade Real de Trabalho** (`calc_velocidade_real`)
8. **Volume de Calda Ajustado** (`calc_volume_calda_ajustado`)
9. **Dbito Total do Pulverizador** (`calc_debito_total`)
10. **Dbito Unitrio por Bico** (`calc_debito_unitario`)
11. **Dbito Total para Drones** (`calc_debito_total_drones`)
12. **Largura da Faixa para Drones** (`calc_largura_faixa_drones`)

**Estrutura de Implementao (por calculadora):**

1. Criar pasta em `src/features/`:
   ```
   src/features/area-parede-foliar/
   ├── AreaParedeFoliarCalculator.tsx
   ├── AreaParedeFoliarFAQ.md
   └── index.ts
   ```

2. Implementar componente React com:
   - Campos de input (com `DaterraKeypad`).
   - Lgica de clculo (fó�µµlas validadas).
   - Boto de gravao no histrico.
   - Acordeo didtico (`DidacticHelp`).

3. Adicionar rota em `App.tsx`:
   ```tsx
   <Route path="/ferramentas/area-parede-foliar" element={<AreaParedeFoliarCalculator />} />
   ```

4. Adicionar entrada no hub de ferramentas (`ToolsView.tsx`):
   ```tsx
   {
     id: 'calc_area_parede_foliar',
     nome: 'rea de Parede Foliar',
     categoria: 'Calibrao',
     icone: 'Leaf',
     descricao: 'Calcula a rea de parede foliar por hectare.'
   }
   ```

5. Criar ficheiro FAQ em Markdown com:
   - Frmula explicada.
   - Exemplo de uso.
   - Erros frequentes.
   - Ligaes para Academia DATERRA.

**Resultado Esperado:**
- 12 novas calculadoras implementadas.
- Todas com microlearning integrado.
- Todas com gravao no histrico IndexedDB.

---

### Fase 3 - Integraes Externas (Dias 15-21)

**Objetivo:** Ativar integraes com Moodle e API de meteorologia.

#### 3.1. Integrao Moodle (`AcademyView.tsx`)

1. Obter token REST API no Moodle (`https://academia.daterra.com.pt`):
   - Aceder ao Moodle como administrador.
   - `Administrao do Site` → `Plugins` → `Web services` → `Manage tokens`.
   - Criar token para o utilizador.

2. Adicionar varivel de ambiente em `.env`:
   ```env
   VITE_MOODLE_API_URL=https://academia.daterra.com.pt/webservice/rest/server.php
   VITE_MOODLE_TOKEN=<teu-token-aqui>
   ```

3. Implementar chamada API em `AcademyView.tsx`:
   ```tsx
   const response = await fetch(
     `${import.meta.env.VITE_MOODLE_API_URL}?wstoken=${import.meta.env.VITE_MOODLE_TOKEN}&moodlewsrestformat=json&wsfunction=core_enrol_get_users_courses&userid=${userId}`
   );
   ```

4. Testar carregamento de cursos do utilizador.

#### 3.2. Integrao Meteorologia (`ClimaEstacaoView.tsx`)

1. Escolher provider (OpenWeather ou AgroMonitoring):
   - OpenWeather: `https://openweathermap.org/api`
   - AgroMonitoring: `https://agromonitoring.com/api`

2. Registar conta e obter chave API.

3. Adicionar varivel em `.env`:
   ```env
   VITE_WEATHER_API_KEY=<tua-chave-aqui>
   VITE_WEATHER_PROVIDER=openweather
   ```

4. Implementar componente `ClimaEstacaoView.tsx`:
   - Mostrar temperatura, humidade, vento, direo.
   - Calcular ndice de risco de deriva.
   - Alertas para condies adversas.

**Resultado Esperado:**
- Cursos do Moodle carregados na Academia.
- Dados meteorolgicos em tempo real.
- ndice de risco de deriva calculado.

---

### Fase 4 - Deploy e Produo (Dias 22-28)

**Objetivo:** Colocar a aplicao em produo no cPanel e GitHub Pages.

#### 4.1. Deploy GitHub Pages (Teste)

1. No GitHub, ativar GitHub Pages:
   - `Settings` → `Pages`
   - Source: `GitHub Actions`

2. Executar workflow manualmente:
   - `Actions` → `Deploy DATERRA Smart to GitHub Pages` → `Run workflow`

3. Verificar URL de deploy (ex: `https://<teu-user>.github.io/daterra-smart-saas/`).

4. Testar PWA no telemvel.

#### 4.2. Deploy cPanel (Produo)

1. Compilar localmente:
   ```powershell
   npm run build
   ```

2. Executar workflow de deploy:
   - `Actions` → `Deploy to cPanel` → `Run workflow`

3. Verificar em `https://smart.daterra.com.pt`.

4. Testar:
   - Login.
   - Calculadoras.
   - PWA (instalar no telemvel).
   - Modo offline.

**Resultado Esperado:**
- Aplicao acessvel em `https://smart.daterra.com.pt`.
- PWA instalvel.
- Funcionalidade offline operacional.

---

### Fase 5 - Otimizao e Escalabilidade (Dias 29-35)

**Objetivo:** Melhorar performance, SEO e preparar para marketplace.

**Tarefas:**

1. **Otimizao de Performance:**
   - Code splitting por rota.
   - Lazy loading de componentes pesados.
   - Otimizao de imagens (WebP, SVG).

2. **SEO e Meta Tags:**
   - Adicionar meta tags dinmicas por página.
   - Implementar `react-helmet-async`.
   - Gerar sitemap.xml.

3. **Preparao para Marketplace:**
   - Criar tabela `subscriptions` no IndexedDB.
   - Implementar lgica de planos (free, pro, enterprise).
   - Restringir calculadoras avanadas conforme plano.

4. **Analytics Leve:**
   - Implementar telemetria sem quebra de privacidade.
   - Contar uso de calculadoras (anonimizado).
   - Dashboard de uso no admin.

**Resultado Esperado:**
- Aplicao otimizada para produo.
- SEO melhorado.
- Estrutura de planos pronta para monetizao.

---

## 13. Skills e Documentao a Criar

### 13.1. Skills para Agentes de IA

Criar em `.agents/skills/`:

1. **`skill-calculadoras-agricolas.md`**
   - Lista de todas as calculadoras.
   - Frmulas validadas (DGAV, EPPO, ISO).
   - Exemplos de uso.
   - Erros frequentes.

2. **`skill-pulverizacao.md`**
   - Normas ISO 16119, 16122.
   - Tabelas de dbitos de bicos (Albuz, Lechler, Hardi, Teejet).
   - Procedimentos de calibrao.

3. **`skill-pwa-saas-geral.md`**
   - Arquitetura da aplicao.
   - Decises de design (Offline-first, IndexedDB).
   - Padro de componentes.

4. **`skill-microlearning-generator.md`**
   - Como gerar FAQs pedaggicas.
   - Estrutura de acordees didticos.
   - Ligaes Academia DATERRA.

5. **`skill-integracoes-externas.md`**
   - Moodle REST API.
   - OpenWeather / AgroMonitoring.
   - Supabase (se aplicvel no futuro).

### 13.2. Prompt para Gemini Notebook

```
Tens acesso a este Gemini Notebook, que inclui texto, PDFs, vdeos do YouTube, links e ficheiros.

Objetivo: criar skills em Markdown, uma por tema, para a PWA SaaS Suite DATERRA Smart.

Requisitos:
- Usa apenas o conhecimento deste Notebook como fonte principal.
- Para cada tema, estuda todas as fontes relevantes.
- Confronta a informao, remove repeties e incorrees.
- Produz um documento Markdown final por tema, com:
  - Estrutura lgica (ttulos, subttulos, listas, tabelas).
  - Informao completa, sem abreviaes.
  - Exemplos prticos sempre que possvel.
  - Linguagem clara, adequada a quem est a aprender programao.

Temas:
1. `skill-pwa-saas-geral.md` - Viso geral da PWA SaaS Suite.
2. `skill-pulverizacao.md` - Normas, tabelas de bicos, frmulas, regras.
3. `skill-calculadoras-agricolas.md` - Lista de calculadoras, inputs, outputs, frmulas.
4. `skill-globalgap-haccp.md` - Requisitos GlobalGAP/HACCP.
5. `skill-frontend-react.md` - Padres React, componentes, boas prticas.
6. `skill-supabase-auth-db.md` - Auth, base de dados, planos, segurana.
7. `skill-marketplace-micro-saas.md` - Modelos de plano, acesso.

Output: Um bloco de texto em Markdown por tema, pronto a guardar como `skill-<tema>.md`.
```

---

## 14. Prximos Passos Imediatos

### Hoje (Dia 1):

1. **Inicializar Git:**
   ```powershell
   cd C:\Users\pedro\OneDrive\Documentos\Projetos-Code\daterra-smart-app
   git init
   git add .
   git commit -m "feat: DATERRA Smart SaaS Suite v1.0.0-rc1"
   ```

2. **Criar repositrio no GitHub** e ligar:
   ```powershell
   git remote add origin https://github.com/<teu-user>/daterra-smart-saas.git
   git push -u origin main
   ```

3. **Testar build:**
   ```powershell
   npm run build
   ```

4. **Ler este plano** e confirmar que compreendes todas as fases.

### Amanh (Dia 2):

1. **Configurar segredos no GitHub** (FTP).
2. **Executar workflow de deploy** para GitHub Pages (teste).
3. **Comear a implementar** a calculadora `rea de Parede Foliar`.

### Esta Semana:

- Ter Git e CI/CD operacionais.
- Ter 2-3 novas calculadoras implementadas.
- Ter integrao Moodle testada.

---

## 15. Referncias e Recursos

### 15.1. Documentao Oficial

- **React:** https://react.dev/learn
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vite:** https://vitejs.dev/guide/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Dexie.js:** https://dexie.org/docs/
- **React Router:** https://reactrouter.com/docs

### 15.2. Normas e Diretrizes Tcnicas

- **DGAV:** https://dgav.pt/
- **EPPO:** https://www.eppo.int/
- **ISO 16119:** https://www.iso.org/standard/51811.html
- **ISO 16122:** https://www.iso.org/standard/61224.html

### 15.3. APIs e Integraes

- **Moodle REST API:** https://academia.daterra.com.pt/admin/webservice/lib.php
- **OpenWeather:** https://openweathermap.org/api
- **AgroMonitoring:** https://agromonitoring.com/api

---

*Plano emitido no mbito do desenvolvimento da plataforma **DATERRA Smart** (PRR N. 23703).*