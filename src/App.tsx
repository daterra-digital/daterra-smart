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
import { NozzleComparisonView } from './features/nozzle-comparison/NozzleComparisonView';
import { ProjetoAgrosmartView } from './views/ProjetoAgrosmartView';
import { AboutView } from './views/AboutView';
import { HelpView } from './views/HelpView';
import { IosInstallPrompt } from './components/IosInstallPrompt';
import { initGA, trackPageView } from './lib/analytics';

// Inicialização única do Google Analytics 4
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId) {
  initGA(gaMeasurementId);
}

// Componente Guardião de Rotas Privadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-daterra-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">A validar sessão...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
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
          <Route path="/ferramentas/volume-copa" element={<VolumeCopaCalculator />} />
          <Route path="/ferramentas/volume-calda-trv" element={<VolumeCaldaTrvCalculator />} />
          <Route path="/ferramentas/debito-total" element={<DebitoTotalCalculator />} />
          <Route path="/ferramentas/comparador-bicos" element={<NozzleComparisonView />} />
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
