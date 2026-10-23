import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, User, Building2, ArrowRight, RefreshCw, Edit2, CheckCircle2 } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';
import { useAuth } from '../context/AuthContext';
import iconDaterraMono from '../assets/icon-daterra-mono.png';

export const LoginView: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'sent' | 'confirm_email'>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState('');

  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const { requestMagicLink, completeMagicLinkSignIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      setLoading(true);
      completeMagicLinkSignIn().then((res) => {
        setLoading(false);
        if (res.needsEmail) setStep('confirm_email');
        else if (res.error) setError(res.error);
        else navigate('/dashboard');
      });
    }
  }, [completeMagicLinkSignIn, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (res.error) setError(res.error);
    else if (auth.currentUser) navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Por favor introduza um endereço de e-mail válido.');
      return;
    }

    if (step === 'confirm_email') {
      setLoading(true);
      const res = await completeMagicLinkSignIn(cleanEmail);
      setLoading(false);
      if (res.error) setError(res.error);
      else navigate('/dashboard');
      return;
    }

    if (mode === 'register' && (!firstName.trim() || !lastName.trim() || !companyName.trim())) {
      setError('No registo, preencha Nome, Apelido, E-mail e Entidade.');
      return;
    }

    setLoading(true);
    const result = await requestMagicLink(
      {
        email: cleanEmail,
        firstName: mode === 'register' ? firstName.trim() : undefined,
        lastName: mode === 'register' ? lastName.trim() : undefined,
        companyName: mode === 'register' ? companyName.trim() : undefined,
        isRegistration: mode === 'register'
      },
      captchaToken
    );
    setLoading(false);

    if (result.error) {
      setError(result.error);
      turnstileRef.current?.reset();
      setCaptchaToken('');
    } else {
      setStep('sent');
      setResendCooldown(60);
      setSuccessMsg('Link de acesso enviado para o seu e-mail!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-floating border border-slate-200 space-y-5">
        <div className="text-center space-y-2.5">
          <div className="w-16 h-16 mx-auto flex items-center justify-center shadow-soft rounded-2xl overflow-hidden bg-[#114037]/5 p-2">
            <img src={iconDaterraMono} alt="DATERRA Smart" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-[#114037]">
            {step === 'confirm_email' ? 'Confirmar E-mail' : mode === 'login' ? 'Entrar na DATERRA Smart' : 'Criar Conta DATERRA Smart'}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 'sent'
              ? `Enviámos um link mágico de acesso para ${email}`
              : step === 'confirm_email'
              ? 'Confirme o seu e-mail para concluir a autenticação neste dispositivo.'
              : 'Acesso seguro através de conta Google ou link enviado para o seu e-mail.'}
          </p>
        </div>

        {step === 'form' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all ${
                mode === 'login' ? 'bg-[#114037] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all ${
                mode === 'register' ? 'bg-[#114037] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registo
            </button>
          </div>
        )}

        {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center">{successMsg}</div>}
        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">{error}</div>}

        {step !== 'sent' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'form' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full min-h-[48px] px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center gap-3 touch-target active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                  </svg>
                  <span>Continuar com a Google</span>
                </button>
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="shrink-0 mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">ou</span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>
              </>
            )}

            {mode === 'register' && step === 'form' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nome</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" required className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Apelido</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apelido" required className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Entidade / Exploração</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nome da empresa ou exploração agrícola" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C]" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="utilizador@exemplo.pt" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C]" />
              </div>
            </div>

            {siteKey && step === 'form' && (
              <Turnstile ref={turnstileRef} siteKey={siteKey} onSuccess={(t) => setCaptchaToken(t)} onError={() => setCaptchaToken('')} onExpire={() => setCaptchaToken('')} options={{ size: 'invisible' }} />
            )}

            <button type="submit" disabled={loading || !email.trim()} className="w-full min-h-[48px] py-3.5 bg-[#3CA64C] hover:bg-[#3CA64C]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 touch-target">
              <span>{loading ? 'A processar...' : step === 'confirm_email' ? 'Concluir Acesso' : 'Enviar Link de Acesso'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#3CA64C] mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Abra a sua caixa de correio e clique no botão <strong>Entrar na DATERRA Smart</strong>.</p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold pt-2">
              <button type="button" onClick={() => { setStep('form'); setError(''); setSuccessMsg(''); }} className="text-slate-600 hover:text-[#114037] flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /><span>Alterar dados</span></button>
              <button type="button" onClick={handleSubmit} disabled={resendCooldown > 0 || loading} className="text-[#114037] disabled:text-slate-400 flex items-center gap-1 font-bold"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /><span>{resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar link'}</span></button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticação segura Firebase (Google & Magic Link)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
