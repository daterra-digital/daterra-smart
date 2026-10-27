import React from 'react';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslation } from '../context/LanguageContext';
import { useLoginFlow } from '../features/auth/hooks/useLoginFlow';
import { AuthHeader } from '../features/auth/components/AuthHeader';
import { AuthModeTabs } from '../features/auth/components/AuthModeTabs';
import { GoogleSignInButton } from '../features/auth/components/GoogleSignInButton';
import { RegisterFields } from '../features/auth/components/RegisterFields';
import { AuthSentState } from '../features/auth/components/AuthSentState';

export const LoginView: React.FC = () => {
  const { t } = useTranslation();
  const {
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
  } = useLoginFlow();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-floating border border-slate-200 space-y-5">
        <AuthHeader step={step} mode={mode} email={email} />

        {step === 'form' && (
          <AuthModeTabs
            mode={mode}
            onChangeMode={(newMode) => { setMode(newMode); setError(''); }}
          />
        )}

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

        {step !== 'sent' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'form' && (
              <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
            )}

            {mode === 'register' && step === 'form' && (
              <RegisterFields
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                companyName={companyName}
                setCompanyName={setCompanyName}
                disabled={loading}
              />
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('auth.emailLabel', 'E-mail')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'utilizador@exemplo.pt')}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-60"
                />
              </div>
            </div>

            {siteKey && step === 'form' && (
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken('')}
                onExpire={() => setCaptchaToken('')}
                options={{ size: 'invisible' }}
              />
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full min-h-[48px] py-3.5 bg-[#3CA64C] hover:bg-[#3CA64C]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 touch-target cursor-pointer disabled:cursor-not-allowed"
            >
              <span>
                {loading
                  ? t('auth.btnProcessing', 'A processar...')
                  : step === 'confirm_email'
                  ? t('auth.btnComplete', 'Concluir Acesso')
                  : t('auth.btnSendLink', 'Enviar Link de Acesso')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <AuthSentState
            onEditDetails={() => { setStep('form'); setError(''); setSuccessMsg(''); }}
            onResend={() => handleSubmit()}
            resendCooldown={resendCooldown}
            loading={loading}
          />
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('auth.firebaseSecurityBadge', 'Autenticação segura Firebase (Google & Magic Link)')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
