import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('QA I18N: HeaderLanguageDropdown Component Specification & Governance', () => {
  const filePath = path.resolve('src/components/layout/HeaderLanguageDropdown.tsx');
  assert.ok(fs.existsSync(filePath), 'HeaderLanguageDropdown.tsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  assert.ok(lines.length < 200, `HeaderLanguageDropdown.tsx must be < 200 LOC (found ${lines.length})`);
  assert.ok(content.includes('min-h-[48px]'), 'Dropdown trigger must enforce min-h-[48px]');
  assert.ok(content.includes('touch-target'), 'Dropdown must include touch-target class');
  assert.ok(content.includes('aria-haspopup="listbox"'), 'Dropdown must include aria-haspopup="listbox"');
  assert.ok(content.includes('aria-expanded'), 'Dropdown must include aria-expanded attribute');
  assert.ok(content.includes('role="listbox"'), 'Popup menu must have role="listbox"');
  assert.ok(content.includes('role="option"'), 'Popup items must have role="option"');
  assert.ok(content.includes('Escape'), 'Must support dismissal on Escape key');
  assert.ok(content.includes('handleClickOutside'), 'Must support dismissal on clicking outside');
  assert.ok(content.includes('LANGUAGE_OPTIONS'), 'Must consume LANGUAGE_OPTIONS from LanguageContext');
});

test('QA I18N: Dropdown Integration in Layouts', () => {
  for (const file of ['src/components/layout/PrivateDesktopNav.tsx', 'src/components/PrivateLayout.tsx', 'src/components/PublicLayout.tsx']) {
    const fullPath = path.resolve(file);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.includes('HeaderLanguageDropdown'), `${file} must use HeaderLanguageDropdown`);
    assert.ok(content.split('\n').length < 200, `${file} must be < 200 LOC`);
  }
});

test('QA I18N: Full Route Coverage & Zero Orphan Literals in Canonical Views', () => {
  const auditedRoutes = [
    { route: '/', file: 'src/views/LandingView.tsx' },
    { route: '/sobre', file: 'src/views/AboutView.tsx' },
    { route: '/sobre/audience', file: 'src/features/about/components/AboutAudienceSection.tsx' },
    { route: '/sobre/problems', file: 'src/features/about/components/AboutProblemsSection.tsx' },
    { route: '/sobre/legal', file: 'src/features/about/components/AboutLegalSection.tsx' },
    { route: '/sobre/channels', file: 'src/features/about/components/AboutChannelsSection.tsx' },
    { route: '/ajuda', file: 'src/views/HelpView.tsx' },
    { route: '/login', file: 'src/views/LoginView.tsx' },
    { route: '/login/auth-header', file: 'src/features/auth/components/AuthHeader.tsx' },
    { route: '/login/auth-tabs', file: 'src/features/auth/components/AuthModeTabs.tsx' },
    { route: '/login/google-btn', file: 'src/features/auth/components/GoogleSignInButton.tsx' },
    { route: '/login/register-fields', file: 'src/features/auth/components/RegisterFields.tsx' },
    { route: '/login/auth-sent', file: 'src/features/auth/components/AuthSentState.tsx' },
    { route: '/dashboard', file: 'src/views/DashboardView.tsx' },
    { route: '/dashboard/weather', file: 'src/features/weather/components/DashboardWeatherCard.tsx' },
    { route: '/dashboard/favorites', file: 'src/features/dashboard/components/DashboardFavoritesCard.tsx' },
    { route: '/dashboard/ndvi', file: 'src/features/dashboard/components/DashboardNdviCard.tsx' },
    { route: '/definicoes', file: 'src/views/SettingsView.tsx' },
    { route: '/exploracao', file: 'src/views/ExplorationView.tsx' },
    { route: '/ferramentas', file: 'src/views/ToolsView.tsx' },
    { route: '/ferramentas/calibracao-pulverizador', file: 'src/features/calibracao-pulverizador/CalibracaoPulverizador.tsx' },
    { route: '/ferramentas/volume-copa', file: 'src/features/volume-copa/VolumeCopaCalculator.tsx' },
    { route: '/ferramentas/area-parede-foliar', file: 'src/features/area-parede-foliar/AreaParedeFoliarCalculator.tsx' },
    { route: '/ferramentas/volume-calda-trv', file: 'src/features/volume-calda-trv/VolumeCaldaTrvCalculator.tsx' },
    { route: '/ferramentas/velocidade-trabalho', file: 'src/features/calculators/velocidade-trabalho/VelocidadeTrabalhoView.tsx' },
    { route: '/ferramentas/smart-debito', file: 'src/features/smart-debito/SmartDebitoView.tsx' },
    { route: '/ferramentas/debito-total', file: 'src/features/debito-total/DebitoTotalCalculator.tsx' },
    { route: '/ferramentas/dose', file: 'src/features/mistura-dose/DoseCaldaCalculator.tsx' },
    { route: '/ferramentas/concentracao-calda', file: 'src/features/calculators/core/UniversalCalculatorTemplate.tsx' },
    { route: '/ferramentas/mistura', file: 'src/views/MisturaView.tsx' },
    { route: '/ferramentas/consulta-ph', file: 'src/features/consulta-ph/ConsultaPhCalculator.tsx' },
    { route: '/ferramentas/verificador-ph', file: 'src/views/PhCheckerView.tsx' },
    { route: '/ferramentas/pre-inspecao', file: 'src/views/PreInspectionView.tsx' },
    { route: '/projeto-agrosmart', file: 'src/views/ProjetoAgrosmartView.tsx' },
    { route: '/projeto-agrosmart/info-grid', file: 'src/features/projeto-agrosmart/components/ProjetoInfoGrid.tsx' },
    { route: '/projeto-agrosmart/app-links', file: 'src/features/projeto-agrosmart/components/ProjetoAppLinksSection.tsx' }
  ];

  const orphanLiteralsFound = [];
  const ptAccentsRegex = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/;

  for (const item of auditedRoutes) {
    const fullPath = path.resolve(item.file);
    assert.ok(fs.existsSync(fullPath), `Target view file must exist: ${item.file}`);
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') ||
        trimmed.startsWith('import ') || (trimmed.startsWith('{/*') && trimmed.endsWith('*/}'))
      ) return;

      if (ptAccentsRegex.test(trimmed)) {
        const rawJsxMatch = />([^<>{}]*[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ][^<>{}]*)</.exec(trimmed);
        const rawAttrMatch = /(?:placeholder|title)=["']([^"']*[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ][^"']*)["']/.exec(trimmed);

        if (rawJsxMatch && !trimmed.includes('t(')) {
          orphanLiteralsFound.push({ route: item.route, file: item.file, line: idx + 1, snippet: rawJsxMatch[1].trim() });
        } else if (rawAttrMatch && !trimmed.includes('t(')) {
          orphanLiteralsFound.push({ route: item.route, file: item.file, line: idx + 1, snippet: rawAttrMatch[1].trim() });
        }
      }
    });
  }

  assert.equal(
    orphanLiteralsFound.length,
    0,
    `Expected 0 orphan Portuguese literals across all canonical routes, but found: ${JSON.stringify(orphanLiteralsFound, null, 2)}`
  );
});

test('QA I18N: English (en-GB) Technical Vocabulary Integrity', () => {
  const enGB = JSON.parse(fs.readFileSync('src/i18n/locales/en-GB.json', 'utf8'));

  assert.equal(enGB.common?.selectLanguage, 'Select Language');
  assert.equal(enGB.common?.availableLanguages, 'Available Languages');
  assert.equal(enGB.common?.saveHistory, 'Save History');
  assert.equal(enGB.common?.backToTools, 'Back to Tools');
  assert.equal(enGB.common?.activeTool, 'Active Tool');

  assert.equal(enGB.calculators?.lwa?.vegetationHeight, 'Treated Vegetation Height (h)');
  assert.equal(enGB.calculators?.lwa?.rowSpacing, 'Row Spacing (r)');
  assert.equal(enGB.calculators?.dose?.title, 'Spray Mixture (Dose per Hectare)');
  assert.equal(enGB.calculators?.dose?.tankCapacity, 'Usable Tank Capacity (L)');
  assert.equal(enGB.calculators?.ph?.title, 'Water pH Verification');
  assert.equal(enGB.calculators?.ph?.critical, 'Critical');

  assert.equal(enGB.smartDebito?.title, 'Smart Nozzle Flow (ISO 16122)');
  assert.equal(enGB.smartDebito?.isoCompliant, 'ISO Compliant');
  assert.equal(enGB.smartDebito?.isoNonCompliant, 'Non-Compliant');
  assert.equal(enGB.smartDebito?.exportPdf, 'Export PDF Report');

  assert.equal(enGB.projetoAgrosmart?.title, 'AgroSmart DATERRA Project');
  assert.equal(enGB.projetoAgrosmart?.badge, 'Project No. 23703');
  assert.equal(enGB.footer?.viewProjectDetails, 'View project details');

  assert.equal(enGB.auth?.signInTitle, 'Sign In to DATERRA Smart');
  assert.equal(enGB.auth?.signUpTitle, 'Create DATERRA Smart Account');
  assert.equal(enGB.auth?.googleSignIn, 'Continue with Google');
  assert.equal(enGB.auth?.companyLabel, 'Entity');
  assert.equal(enGB.auth?.firebaseSecurityBadge, 'Secure Firebase authentication (Google & Magic Link)');

  // Verify About translations
  assert.equal(enGB.about?.audienceTitle, 'Designed for those working in agriculture');
  assert.equal(enGB.about?.problemsTitle, 'Actionable information when needed');
  assert.equal(enGB.about?.audience?.farmers?.title, 'Farmers & Growers');
  assert.equal(enGB.about?.problems?.calcField?.title, 'Calculation difficulties in the field');

  const ptPT = JSON.parse(fs.readFileSync('src/i18n/locales/pt-PT.json', 'utf8'));
  assert.equal(ptPT.auth?.companyLabel, 'Entidade');

  // Verify Dashboard & Weather interpolation & vocabulary
  assert.equal(enGB.dashboard?.welcomeUser, 'Welcome, {{name}}!');
  assert.equal(ptPT.dashboard?.welcomeUser, 'Bem-vindo, {{name}}!');
  assert.equal(enGB.weather?.today, 'Today');
  assert.equal(ptPT.weather?.today, 'Hoje');
  assert.equal(enGB.weather?.wmo?.['1'], 'Mostly Sunny');
  assert.equal(ptPT.weather?.wmo?.['1'], 'Geralmente Ensolarado');
  assert.equal(enGB.weather?.sprayBadges?.optimal, 'Low Drift Risk (Optimal)');
  assert.equal(ptPT.weather?.sprayBadges?.optimal, 'Risco de Deriva Baixo (Ótimo)');
  assert.equal(enGB.weather?.sprayBadges?.criticalWind, 'Critical Wind');
  assert.equal(ptPT.weather?.sprayBadges?.criticalWind, 'Vento Crítico');
});

test('QA I18N: Expansion Strategy Architecture Documentation & Landing Vocabulary', () => {
  const docPath = path.resolve('docs/architecture/i18n-expansion-strategy.md');
  assert.ok(fs.existsSync(docPath), 'docs/architecture/i18n-expansion-strategy.md must exist');
  const docContent = fs.readFileSync(docPath, 'utf8');
  assert.ok(docContent.includes('pt-PT.json'), 'Doc must specify pt-PT.json as canonical master source');
  assert.ok(docContent.includes('Zero Refatoração'), 'Doc must specify zero React refactoring rule');
  assert.ok(docContent.includes('LANGUAGE_OPTIONS'), 'Doc must specify LANGUAGE_OPTIONS registration');

  const enGB = JSON.parse(fs.readFileSync('src/i18n/locales/en-GB.json', 'utf8'));
  assert.ok(enGB.landing, 'en-GB must have landing namespace');
  assert.equal(enGB.landing.ctaEnter, 'Enter DATERRA Smart');
  assert.equal(enGB.landing.ctaLearnMore, 'Learn More');
  assert.equal(enGB.landing.highlightFieldReady, 'Field-Ready');
  assert.equal(enGB.landing.sectionTitle, 'Engineered for Field Operations');
});
