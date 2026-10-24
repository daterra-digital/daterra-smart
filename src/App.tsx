import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PublicLayout } from './components/PublicLayout';

import { PrivateLayout } from './components/PrivateLayout';
import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ToolsView } from './views/ToolsView';
import { AcademyView } from './views/AcademyView';
import { SettingsView } from './views/SettingsView';
import { ExplorationView } from './views/ExplorationView';
import { AreaParedeFoliarCalculator } from './features/area-parede-foliar/AreaParedeFoliarCalculator';
import { VolumeCopaCalculator } from './features/volume-copa/VolumeCopaCalculator';
import { VolumeCaldaTrvCalculator } from './features/volume-calda-trv/VolumeCaldaTrvCalculator';
import { DebitoTotalCalculator } from './features/debito-total/DebitoTotalCalculator';
import { EppoCalculator } from './features/eppo/EppoCalculator';
import { CalibracaoPulverizador } from './features/calibracao-pulverizador/CalibracaoPulverizador';
import { DroneComplianceView } from './features/drone-compliance/DroneComplianceView';
import { SmartDebitoView } from './features/smart-debito/SmartDebitoView';
import { SatelliteIntelligenceView } from './features/satellite-intelligence';
import { MisturaView } from './views/MisturaView';
import { PhCheckerView } from './views/PhCheckerView';
import { EppoDoseCalculator } from './features/ajuste-dose-eppo';
import { ConcentracaoCaldaCalculator } from './features/mistura-concentracao';
import { DoseCaldaCalculator } from './features/mistura-dose';
import { ConsultaPhCalculator } from './features/consulta-ph';
import { PreInspectionView } from './views/PreInspectionView';
import { PreInspecaoCalculator } from './features/pre-inspecao';
import { VelocidadeTrabalhoView } from './features/calculators/velocidade-trabalho';
import { DebitoTrabalhoView } from './features/calculators/tabelas-debito';
import { AgriChatView } from './features/agri-chat/AgriChatView';
import { WeatherSaasView } from './features/weather/views/WeatherSaasView';
import { isLocalhost } from './utils/environment';
import { ProjetoAgrosmartView } from './views/ProjetoAgrosmartView';
import { AboutView } from './views/AboutView';
import { HelpView } from './views/HelpView';
import { IosInstallPrompt } from './components/IosInstallPrompt';
import { ScrollToTop } from './components/ScrollToTop';
import { initGA, trackPageView } from './lib/analytics';

// Inicialização única do Google Analytics 4
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId) {
  initGA(gaMeasurementId);
}

// Componente Guardião de Rotas Privadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const isDevBypass =
    import.meta.env.DEV &&
    (typeof window !== 'undefined' &&
      (window.location.search.includes('mock_auth=true') || window.location.hash.includes('mock_auth=true')));

  if (isAuthLoading && !isDevBypass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-daterra-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">A validar sessão...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isDevBypass) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Componente Guardião de Rotas Públicas (redireciona para dashboard se já autenticado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-daterra-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">A carregar...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <>
      {/* Reposiciona o scroll no topo em qualquer transição de rota ou parâmetros */}
      <ScrollToTop />

      {/* Pop-up inteligente de aviso de instalação PWA exclusivo para dispositivos iOS */}
      <IosInstallPrompt />

      <Routes>
        {/* Layout Público */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingView />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginView />
              </PublicRoute>
            }
          />
          {/* Páginas Públicas Acessíveis a Visitantes */}
          <Route path="/sobre" element={<AboutView />} />
          <Route path="/ajuda" element={<HelpView />} />
          <Route path="/projeto-agrosmart" element={<ProjetoAgrosmartView />} />
        </Route>

        {/* Layout Privado (SaaS Suite) */}
        <Route
          element={
            <ProtectedRoute>
              <PrivateLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/ferramentas" element={<ToolsView />} />
          <Route path="/ferramentas/area-parede-foliar" element={<AreaParedeFoliarCalculator />} />
          <Route path="/ferramentas/area-parede-foliar-lwa" element={<AreaParedeFoliarCalculator />} />
          <Route path="/tools/area-parede-foliar-lwa" element={<AreaParedeFoliarCalculator />} />
          <Route path="/tools/area-parede-foliar" element={<AreaParedeFoliarCalculator />} />
          <Route path="/tools/calc_area_parede_foliar" element={<AreaParedeFoliarCalculator />} />
          <Route path="/ferramentas/volume-copa" element={<VolumeCopaCalculator />} />
          <Route path="/ferramentas/volume-copa-trv" element={<VolumeCopaCalculator />} />
          <Route path="/tools/volume-copa-trv" element={<VolumeCopaCalculator />} />
          <Route path="/tools/calc_volume_copa" element={<VolumeCopaCalculator />} />
          <Route path="/ferramentas/volume-calda-trv" element={<VolumeCaldaTrvCalculator />} />
          <Route path="/ferramentas/debito-total" element={<DebitoTotalCalculator />} />
          <Route path="/ferramentas/calibracao-pulverizador" element={<CalibracaoPulverizador />} />
          <Route path="/ferramentas/eppo" element={<EppoCalculator />} />
          <Route path="/ferramentas/comparador-bicos" element={<DebitoTrabalhoView />} />
          <Route path="/ferramentas/tabelas-debito" element={<DebitoTrabalhoView />} />
          <Route path="/tools/tabelas-debito" element={<DebitoTrabalhoView />} />
          <Route path="/tools/comparador-bicos" element={<DebitoTrabalhoView />} />
          <Route path="/ferramentas/drone-buffer-zone" element={<DroneComplianceView />} />
          <Route path="/ferramentas/smart-debito" element={<SmartDebitoView />} />
          <Route path="/ferramentas/satelite-ndvi" element={<SatelliteIntelligenceView />} />
          <Route path="/ferramentas/mistura" element={<MisturaView />} />
          <Route path="/ferramentas/ordem-mistura" element={<MisturaView />} />
          <Route path="/tools/ordem-mistura" element={<MisturaView />} />
          <Route path="/ferramentas/mistura-calda-concentracao" element={<ConcentracaoCaldaCalculator />} />
          <Route path="/tools/mistura-calda-concentracao" element={<ConcentracaoCaldaCalculator />} />
          <Route path="/ferramentas/concentracao-calda" element={<ConcentracaoCaldaCalculator />} />
          <Route path="/tools/calc_concentracao" element={<ConcentracaoCaldaCalculator />} />
          <Route path="/ferramentas/mistura-calda-dose" element={<DoseCaldaCalculator />} />
          <Route path="/tools/mistura-calda-dose" element={<DoseCaldaCalculator />} />
          <Route path="/ferramentas/dose" element={<DoseCaldaCalculator />} />
          <Route path="/tools/dose" element={<DoseCaldaCalculator />} />
          <Route path="/tools/calc_dose" element={<DoseCaldaCalculator />} />
          <Route path="/ferramentas/verificador-ph" element={<PhCheckerView />} />
          <Route path="/ferramentas/consulta-ph" element={<ConsultaPhCalculator />} />
          <Route path="/tools/consulta-ph" element={<ConsultaPhCalculator />} />
          <Route path="/tools/calc_ph" element={<ConsultaPhCalculator />} />
          <Route path="/ferramentas/ajuste-dose-eppo" element={<EppoDoseCalculator />} />
          <Route path="/tools/ajuste-dose-eppo" element={<EppoDoseCalculator />} />
          <Route path="/tools/ajuste_dose_eppo" element={<EppoDoseCalculator />} />
          <Route path="/ferramentas/ajuste-dose" element={<EppoDoseCalculator />} />
          <Route path="/ferramentas/pre-inspecao" element={<PreInspecaoCalculator />} />
          <Route path="/tools/pre-inspecao" element={<PreInspecaoCalculator />} />
          <Route path="/tools/calc_pre_inspecao" element={<PreInspecaoCalculator />} />
          <Route path="/ferramentas/inspecao-detalhada" element={<PreInspectionView />} />
          <Route path="/ferramentas/velocidade-real" element={<VelocidadeTrabalhoView />} />
          <Route path="/ferramentas/velocidade-trabalho" element={<VelocidadeTrabalhoView />} />
          <Route path="/tools/velocidade-trabalho" element={<VelocidadeTrabalhoView />} />
          <Route path="/tools/calc_velocidade_real" element={<VelocidadeTrabalhoView />} />
          <Route path="/assistente" element={isLocalhost() ? <AgriChatView /> : <Navigate to="/dashboard" replace />} />
          <Route path="/meteorologia" element={<WeatherSaasView />} />
          <Route path="/ferramentas/meteorologia" element={<WeatherSaasView />} />
          <Route path="/academia" element={<AcademyView />} />
          <Route path="/definicoes" element={<SettingsView />} />
          <Route path="/exploracao" element={<ExplorationView />} />
        </Route>

        {/* Rota Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export function App() {
  return (
    <HashRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </HashRouter>
  );
}


export default App;
