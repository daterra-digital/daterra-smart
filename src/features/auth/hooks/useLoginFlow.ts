import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink } from 'firebase/auth';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { auth } from '../../../lib/firebaseClient';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../context/LanguageContext';

export function useLoginFlow() {
  const { t } = useTranslation();
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(t('auth.invalidEmailError', 'Por favor introduza um endereço de e-mail válido.'));
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
      setError(t('auth.fillRequiredError', 'No registo, preencha Nome, Apelido, E-mail e Entidade.'));
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
      setSuccessMsg(t('auth.linkSentSuccess', 'Link de acesso enviado para o seu e-mail!'));
    }
  };

  return {
    mode,
    setMode,
    step,
    setStep,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    companyName,
    setCompanyName,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    loading,
    resendCooldown,
    siteKey,
    turnstileRef,
    setCaptchaToken,
    handleGoogleSignIn,
    handleSubmit
  };
}
