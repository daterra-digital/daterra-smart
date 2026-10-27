import React from 'react';
import { CheckCircle2, Edit2, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

export interface AuthSentStateProps {
  onEditDetails: () => void;
  onResend: () => void;
  resendCooldown: number;
  loading: boolean;
}

export const AuthSentState: React.FC<AuthSentStateProps> = ({
  onEditDetails,
  onResend,
  resendCooldown,
  loading
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <CheckCircle2 className="w-8 h-8 text-[#3CA64C] mx-auto" />
        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
          {t('auth.sentCheckInbox', 'Abra a sua caixa de correio e clique no botão')}{' '}
          <strong className="text-[#114037]">{t('auth.sentButtonHighlight', 'Entrar na DATERRA Smart')}</strong>.
        </p>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold pt-2">
        <button
          type="button"
          onClick={onEditDetails}
          className="text-slate-600 hover:text-[#114037] flex items-center gap-1 cursor-pointer touch-target p-2"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{t('auth.changeData', 'Alterar dados')}</span>
        </button>

        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0 || loading}
          className="text-[#114037] disabled:text-slate-400 flex items-center gap-1 font-bold cursor-pointer touch-target p-2 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>
            {resendCooldown > 0
              ? t('auth.resendCountdown', 'Reenviar ({{count}}s)', { count: resendCooldown })
              : t('auth.resendLink', 'Reenviar link')}
          </span>
        </button>
      </div>
    </div>
  );
};
