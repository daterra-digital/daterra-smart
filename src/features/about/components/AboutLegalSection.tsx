import React from 'react';
import { Shield, ShieldCheck, FileText, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const AboutLegalSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
      <div className="flex items-center gap-3 text-daterra-secondary">
        <Shield className="w-6 h-6 shrink-0" />
        <h2 className="text-2xl font-extrabold text-daterra-primary">
          {t('about.legalTitle', 'Informações Legais & Transparência')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileText className="w-4 h-4 text-[#1D734B]" />
            <span>{t('about.termsTitle', 'Termos de Utilização')}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {t('about.termsDesc', 'Conheça as condições gerais de acesso e utilização dos serviços digitais DATERRA Smart.')}
          </p>
          <a 
            href="#/sobre"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D734B] hover:underline pt-2"
          >
            <span>{t('about.viewTerms', 'Consultar Termos')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#1D734B]" />
            <span>{t('about.privacyTitle', 'Política de Privacidade')}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {t('about.privacyDesc', 'Proteção de dados de acordo com o RGPD e integridade da sua informação agrícola.')}
          </p>
          <a 
            href="#/sobre"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D734B] hover:underline pt-2"
          >
            <span>{t('about.viewPrivacy', 'Consultar Política')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
