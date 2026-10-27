import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { PublicLayout } from './components/PublicLayout';
import { PrivateLayout } from './components/PrivateLayout';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import { UpgradeModal, TierRouteGuard } from './components/gating';

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
import { TabelasDebitoHubView, DebitoTrabalhoView } from './features/calculators/tabelas-debito';
import { AgriChatView } from './features/agri-chat/AgriChatView';
import { WeatherSaasView } from './features/weather/views/WeatherSaasView';
import { isLocalhost } from './utils/environment';
import { ProjetoAgrosmartView } from './views/ProjetoAgrosmartView';
import { AboutView } from './views/AboutView';
import { HelpView } from './views/HelpView';
import { IosInstallPrompt } from './components/IosInstallPrompt';
import { ScrollToTop } from './components/ScrollToTop';
import { initGA, trackPageView } from './lib/analytics';

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId) {
  initGA(gaMeasurementId);
}

export const AppContent: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <>
      <ScrollToTop />
      <IosInstallPrompt />
      <UpgradeModal />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicRoute><LandingView /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginView /></PublicRoute>} />
          <Route path="/sobre" element={<AboutView />} />
          <Route path="/ajuda" element={<HelpView />} />
          <Route path="/projeto-agrosmart" element={<ProjetoAgrosmartView />} />
        </Route>

        <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/ferramentas" element={<ToolsView />} />

          {/* Ferramentas Gratuitas (Free Tier) */}
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
          <Route path="/ferramentas/velocidade-real" element={<VelocidadeTrabalhoView />} />
          <Route path="/ferramentas/velocidade-trabalho" element={<VelocidadeTrabalhoView />} />
          <Route path="/tools/velocidade-trabalho" element={<VelocidadeTrabalhoView />} />
          <Route path="/tools/calc_velocidade_real" element={<VelocidadeTrabalhoView />} />

          {/* Ferramentas Restritas ao Plano PRO (Gated via TierRouteGuard) */}
          <Route element={<TierRouteGuard requiredTier="pro" />}>
            <Route path="/ferramentas/ajuste-dose-eppo" element={<EppoDoseCalculator />} />
            <Route path="/tools/ajuste-dose-eppo" element={<EppoDoseCalculator />} />
            <Route path="/tools/ajuste_dose_eppo" element={<EppoDoseCalculator />} />
            <Route path="/ferramentas/ajuste-dose" element={<EppoDoseCalculator />} />
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
            <Route path="/ferramentas/comparador-bicos" element={<TabelasDebitoHubView />} />
            <Route path="/ferramentas/tabelas-debito" element={<TabelasDebitoHubView />} />
            <Route path="/tools/tabelas-debito" element={<TabelasDebitoHubView />} />
            <Route path="/tools/comparador-bicos" element={<TabelasDebitoHubView />} />
            <Route path="/tools/debito-trabalho-iso" element={<DebitoTrabalhoView />} />
            <Route path="/ferramentas/drone-buffer-zone" element={<DroneComplianceView />} />
            <Route path="/ferramentas/smart-debito" element={<SmartDebitoView />} />
            <Route path="/ferramentas/satelite-ndvi" element={<SatelliteIntelligenceView />} />
            <Route path="/ferramentas/pre-inspecao" element={<PreInspecaoCalculator />} />
            <Route path="/tools/pre-inspecao" element={<PreInspecaoCalculator />} />
            <Route path="/tools/calc_pre_inspecao" element={<PreInspecaoCalculator />} />
            <Route path="/ferramentas/inspecao-detalhada" element={<PreInspectionView />} />
          </Route>

          {/* Módulos do Sistema */}
          <Route path="/assistente" element={isLocalhost() ? <AgriChatView /> : <Navigate to="/dashboard" replace />} />
          <Route path="/meteorologia" element={<WeatherSaasView />} />
          <Route path="/ferramentas/meteorologia" element={<WeatherSaasView />} />
          <Route path="/academia" element={<AcademyView />} />
          <Route path="/definicoes" element={<SettingsView />} />
          <Route path="/exploracao" element={<ExplorationView />} />
        </Route>

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
          <SubscriptionProvider>
            <AppContent />
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </HashRouter>
  );
}

export default App;
