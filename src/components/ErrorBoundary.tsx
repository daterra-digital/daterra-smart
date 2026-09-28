import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';
import daterraLogo from '../assets/daterra-logo.svg';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DATERRA Smart] Erro não capturado na interface:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = async () => {
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }
      localStorage.removeItem('daterra_auth');
      sessionStorage.clear();
    } catch (e) {
      console.error('Erro ao limpar cache local:', e);
    } finally {
      window.location.href = window.location.pathname;
    }
  };

  private handleGoHome = () => {
    window.location.href = '#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-floating border border-slate-200 text-center space-y-6">
            <div className="flex justify-center">
              <img src={daterraLogo} alt="DATERRA Logo" className="h-12 w-auto object-contain" />
            </div>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-daterra-primary">
                Ocorreu uma falha temporária ao carregar a interface
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                A aplicação DATERRA Smart encontrou uma exceção inesperada. Pode recarregar a página ou limpar a cache do navegador para retomar o trabalho.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-slate-900 text-emerald-400 p-3.5 rounded-xl text-[11px] font-mono overflow-auto max-h-40 space-y-1">
                <div className="font-bold text-rose-400">{this.state.error.toString()}</div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-3 bg-daterra-primary hover:bg-daterra-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md touch-target"
              >
                <RefreshCw className="w-4 h-4 text-daterra-accent" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors touch-target"
              >
                <Home className="w-4 h-4" />
                <span>Página Inicial</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={this.handleClearCacheAndReload}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-rose-600 font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar cache e reiniciar sessão</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
