# DATERRA Smart

> **PWA SaaS Suite Agrícola - DATERRA Smart**  
> *Plataforma Offline-First de Agricultura de Precisão e Apoio à Decisão Agronómica.*  
> Cofinanciado pelo **PRR - Plano de Recuperação e Resiliência (Projeto N.º 23703 | AgroSmart DATERRA)** e pela União Europeia.

---

## 🌾 Sobre o Projeto

O **DATERRA Smart** é uma Progressive Web App (PWA) de arquitetura **Offline-First**, concebida especificamente para operar em explorações agrícolas, estufas e parcelas rurais com conectividade intermitente ou nula. A plataforma combina cálculo rigoroso de dosagens de produtos fitofarmacêuticos, parametrização técnica de pulverizadores, microlearning agronómico contextual e telemetria climática.

### Principais Funcionalidades
* **100% Funcional Offline**: Armazenamento local integral via **IndexedDB (Dexie.js)** para culturas, equipamentos, bicos, calibrações e histórico.
* **Calculadora de Concentração da Calda**:
  * *Modo Planta Jovem*: dosagens de rótulo para estados fenológicos iniciais.
  * *Modo Planta Adulta*: dosagens ajustadas ao volume de copa e relação volume recomendado vs aplicado.
* **Calculadora de Dose por Hectare**: conversão de doses autorizadas (L/ha ou kg/ha) e cálculo da área tratada por tanque.
* **Teclado Numérico de Campo (`DaterraKeypad`)**: teclado virtual com visor de cálculo aritmético e atalhos rápidos de depósito (100L a 1500L), ideal para uso com luvas e em tratores.
* **Gestão Integrada de Exploração**:
  * Perfis de Culturas e Geometria de Copa (cálculo de TRV e LAI).
  * Perfis de Equipamento de Pulverização (bombas, filtros, manómetros ISO, barras, ventiladores axiais, canhões, painéis).
  * Catálogo de Bicos (Albuz, Lechler, Hardi, ASJ, Teejet) com códigos de cor ISO 10625.
  * Ensaios de Calibração e Ensaio em Branco (Norma ISO 16122).
* **Microlearning Didático Contextual**: base de conhecimento agronómica e FAQs em cada campo com diretrizes oficiais DGAV/EPPO.
* **Integração com Academia DATERRA**: ligação a cursos e módulos de capacitação técnica na plataforma Moodle.
* **Internacionalização Nativa (8 idiomas)**: Português (PT/BR), Inglês, Espanhol, Francês, Italiano, Alemão e Grego.

---

## 🛠️ Stack Tecnológica

* **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool & Dev Server**: [Vite 8](https://vitejs.dev/)
* **Estilos & Design System**: [Tailwind CSS 4](https://tailwindcss.com/) + PostCSS
* **Ícones**: [Lucide React](https://lucide.dev/)
* **Base de Dados Offline**: [Dexie.js 4](https://dexie.org/) (IndexedDB) + `dexie-react-hooks`
* **Engine PWA**: [Vite Plugin PWA](https://vite-pwa-org.netlify.app/) + Workbox
* **Qualidade de Código**: [Oxlint](https://oxc.rs/)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) v20+ ou v22+
* NPM v10+

### Instalação e Execução
```bash
# 1. Clonar o repositório
git clone https://github.com/pedronunes/daterra-smart.git
cd daterra-smart

# 2. Instalar as dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```
O servidor estará acessível em `http://localhost:5173/`.

### Scripts Disponíveis
* `npm run dev`: Inicia o servidor Vite local com Hot Module Replacement (HMR).
* `npm run build`: Valida tipagens TypeScript (`tsc -b`) e compila a aplicação otimizada para a pasta `dist/`.
* `npm run preview`: Pré-visualiza localmente a compilação da pasta `dist/`.
* `npm run lint`: Executa a verificação estática de código com Oxlint.

---

## 📦 CI/CD & Deploy

* **GitHub Pages**: Workflow automatizado em `.github/deploy-pages.yml` (compilação e publicação da pasta `dist/`).
* **cPanel FTP**: Workflow configurado em `.github/deploy-cpanel.yml` para sincronização com servidor de produção.

---

## 📄 Licença e Enquadramento

Projeto desenvolvido no âmbito do **PRR - Projeto N.º 23703 (AgroSmart DATERRA)**, cofinanciado pela União Europeia.  
Todos os direitos reservados © DATERRA.
