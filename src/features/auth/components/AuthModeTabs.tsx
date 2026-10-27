import React from 'react';
import { useTranslation } from '../../../context/LanguageContext';

export interface AuthModeTabsProps {
  mode: 'login' | 'register';
  onChangeMode: (mode: 'login' | 'register') => void;
}

export const AuthModeTabs: React.FC<AuthModeTabsProps> = ({ mode, onChangeMode }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
      <button
        type="button"
        onClick={() => onChangeMode('login')}
        className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all cursor-pointer touch-target ${
          mode === 'login' ? 'bg-[#114037] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {t('auth.tabSignIn', 'Entrar')}
      </button>
      <button
        type="button"
        onClick={() => onChangeMode('register')}
        className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all cursor-pointer touch-target ${
          mode === 'register' ? 'bg-[#114037] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {t('auth.tabSignUp', 'Registo')}
      </button>
    </div>
  );
};
