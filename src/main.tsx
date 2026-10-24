import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initOutboxListeners, drainOutbox } from './services/outbox/outboxService';
import './index.css';

// Inicializar escuta global da fila de sincronização First-Offline (Mutation Outbox)
initOutboxListeners();

// Escutar mensagens do Service Worker (ex: disparo da Background Synchronization API)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_OUTBOX' || event.data?.type === 'DATERRA_SYNC_OUTBOX') {
      drainOutbox().catch(console.error);
    }
  });
}

// Em desenvolvimento (localhost), desativar e desregistar Service Workers residuais para evitar telas em branco por cache
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().catch(() => {});
    }
  });
} else if ('serviceWorker' in navigator) {
  // Gestão de Ciclo de Vida do Service Worker e Sincronização Imediata em Produção (Mobile, Tablet, Desktop)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      }
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
    }
  });
}

// Desativar a restauração automática de scroll nativa do browser em SPAs/PWAs
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
