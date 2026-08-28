import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

export const IosInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  useEffect(() => {
    // Verifica se é um dispositivo iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Verifica se já está a correr no modo PWA standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    // Verifica se o utilizador já descartou o aviso nesta sessão
    const dismissed = sessionStorage.getItem('daterra_ios_pwa_dismissed');

    if (isIos && !isStandalone && !dismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('daterra_ios_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md bg-daterra-primary text-white rounded-2xl p-5 shadow-2xl border border-daterra-secondary/40 animate-bounce-short">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-daterra-accent/20 flex items-center justify-center text-daterra-accent">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base leading-tight">Instalar DATERRA Smart no iOS</h4>
            <p className="text-xs text-slate-300">Acesso offline rápido no seu iPhone/iPad</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Fechar aviso"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 text-xs text-slate-200 bg-black/20 p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-daterra-accent text-white font-bold text-[10px]">1</span>
          <span>Toque no botão <Share className="w-4 h-4 inline text-daterra-accent mx-1" /> <strong>Partilhar</strong> no fundo do Safari.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-daterra-accent text-white font-bold text-[10px]">2</span>
          <span>Selecione a opção <PlusSquare className="w-4 h-4 inline text-daterra-accent mx-1" /> <strong>Adicionar ao Ecrã Principal</strong>.</span>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="w-full mt-3 py-2 bg-daterra-accent hover:bg-daterra-accent/90 text-white font-semibold text-xs rounded-xl transition-colors"
      >
        Entendido!
      </button>
    </div>
  );
};
