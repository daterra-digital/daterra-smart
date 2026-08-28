import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Verificação e atualização imediata de Service Worker em PWA Mobile
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.update();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
