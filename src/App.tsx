import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { IosInstallPrompt } from './components/IosInstallPrompt';

// Componente Guardião de Rotas Privadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Componente Guardião de Rotas Públicas (redireciona para dashboard se já autenticado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
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
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}


export default App;
