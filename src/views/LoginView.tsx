import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import iconDaterraMono from '../assets/icon-daterra-mono.png';

export const LoginView: React.FC = () => {
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { loginWithOtp } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Por favor introduza o código OTP de 6 dígitos.');
      return;
    }

    setLoading(true);
    const success = await loginWithOtp(otp);
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Código OTP inválido. Tente novamente (ex: 123456).');
    }
  };

  const handleFillDemoOtp = () => {
    setOtp('123456');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-floating border border-slate-200 space-y-6">
        {/* Cabeçalho do Card */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto flex items-center justify-center shadow-soft rounded-2xl overflow-hidden bg-[#114037]/5 p-2">
            <img
              src={iconDaterraMono}
              alt="DATERRA Smart"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-black text-daterra-primary">Acesso DATERRA Smart</h2>
          <p className="text-xs text-slate-500">
            Introduza o seu código de verificação OTP de 6 dígitos enviado por SMS ou email.
          </p>
        </div>

        {/* Formulário OTP */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Código OTP (6 dígitos)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-center text-2xl font-bold font-mono-numbers text-daterra-primary tracking-[0.4em] focus:ring-2 focus:ring-daterra-accent focus:border-daterra-accent outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-4 font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 touch-target ${
              otp.length === 6 && !loading
                ? 'bg-daterra-accent hover:bg-daterra-accent/90 text-white shadow-daterra-accent/30 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{loading ? 'A autenticar...' : 'Entrar na Suite SaaS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Atalho Demo */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-3">
          <button
            onClick={handleFillDemoOtp}
            className="text-xs text-daterra-secondary hover:text-daterra-primary font-bold underline transition-colors"
          >
            Preencher Código OTP de Demonstração (123456)
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticação segura protegida por token encriptado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
