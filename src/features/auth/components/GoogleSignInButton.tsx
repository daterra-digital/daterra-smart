import React from 'react';
import { useTranslation } from '../../../context/LanguageContext';

export interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onClick, disabled }) => {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="w-full min-h-[48px] px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center gap-3 touch-target active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
        </svg>
        <span>{t('auth.googleSignIn', 'Continuar com a Google')}</span>
      </button>

      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-slate-200" />
        <span className="shrink-0 mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {t('auth.or', 'ou')}
        </span>
        <div className="flex-grow border-t border-slate-200" />
      </div>
    </>
  );
};
