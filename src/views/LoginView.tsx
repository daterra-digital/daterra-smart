import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, KeyRound, ArrowRight, RefreshCw, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import iconDaterraMono from '../assets/icon-daterra-mono.png';

const maskEmail = (email: string): string => {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name}***@${domain}`;
  }
  return `${name.slice(0, 2)}***@${domain}`;
};

export const LoginView: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Temporizador para intervalo de reenvio do código (60 segundos)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Passo 1: Enviar código OTP para o email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Por favor introduza um endereço de email válido.');
      return;
    }

    setLoading(true);
    const result = await sendOtp(cleanEmail);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setStep('otp');
      setResendCooldown(60);
      setSuccessMsg('Código de verificação enviado com sucesso!');
    }
  };

  // Passo 2: Validar o código OTP de 6 dígitos
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Por favor introduza o código de 6 dígitos numéricos.');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(email, cleanOtp);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  // Ação de reenvio com respeito pelo intervalo de 60s
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const result = await sendOtp(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setResendCooldown(60);
      setSuccessMsg('Novo código de acesso enviado para o seu email.');
    }
  };

  // Voltar ao passo 1 para alterar o email
  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-floating border border-slate-200 space-y-6">
        {/* Cabeçalho do Cartão */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto flex items-center justify-center shadow-soft rounded-2xl overflow-hidden bg-[#114037]/5 p-2">
            <img
              src={iconDaterraMono}
              alt="DATERRA Smart"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-daterra-primary">Entrar na DATERRA Smart</h1>
          <p className="text-xs text-slate-500">
            {step === 'email'
              ? 'Introduza o seu email para receber um código de acesso.'
              : `Código enviado para ${maskEmail(email)}`}
          </p>
        </div>

        {/* Mensagens de Sucesso ou Erro */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Estado 1: Introdução de Email */}
        {step === 'email' ? (
          <form onSubmit={handleSendEmail} className="space-y-5">
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Endereço de Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="utilizador@exemplo.pt"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-daterra-accent focus:border-daterra-accent outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`w-full py-4 font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 touch-target ${
                email.trim() && !loading
                  ? 'bg-daterra-accent hover:bg-daterra-accent/90 text-white shadow-daterra-accent/30 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{loading ? 'A enviar código...' : 'Enviar código'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Estado 2: Introdução do Código OTP de 6 Dígitos */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label
                htmlFor="otp-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Código de Acesso (6 dígitos)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-center text-2xl font-bold font-mono text-daterra-primary tracking-[0.4em] focus:ring-2 focus:ring-daterra-accent focus:border-daterra-accent outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full py-4 font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 touch-target ${
                otp.length === 6 && !loading
                  ? 'bg-daterra-accent hover:bg-daterra-accent/90 text-white shadow-daterra-accent/30 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{loading ? 'A validar...' : 'Confirmar código'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Ações de Reenvio e Alteração de Email */}
            <div className="pt-2 flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-slate-600 hover:text-daterra-primary flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Alterar email</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className={`flex items-center gap-1 transition-colors ${
                  resendCooldown > 0 || loading
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-daterra-secondary hover:text-daterra-primary font-bold'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : 'Reenviar código'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Rodapé do Cartão */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticação segura com código de uso único por email</span>
          </div>
        </div>
      </div>
    </div>
  );
};
