import React from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

export const ProjetoAppLinksSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
      <div className="flex items-center gap-3 text-daterra-secondary">
        <Smartphone className="w-6 h-6 shrink-0" />
        <h2 className="text-2xl font-extrabold text-daterra-primary">
          {t('projetoAgrosmart.downloadTitle', 'Descarregar a aplicação DATERRA Smart')}
        </h2>
      </div>

      <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
        {t('projetoAgrosmart.downloadDesc', 'A primeira versão operacional da DATERRA Smart está disponível para dispositivos Android e iOS.')}
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
        <a
          href="https://play.google.com/store/apps/details?id=com.cordalmk.daterrasmart&pcampaignid=web_share"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-4 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 touch-target active:scale-95 group"
        >
          <Smartphone className="w-5 h-5 text-daterra-accent" />
          <span>{t('projetoAgrosmart.googlePlay', 'Disponível no Google Play')}</span>
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors ml-1" />
        </a>

        <a
          href="https://apps.apple.com/pt/app/daterra-smart/id6779712498"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-4 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 touch-target active:scale-95 group"
        >
          <Smartphone className="w-5 h-5 text-daterra-accent" />
          <span>{t('projetoAgrosmart.appStore', 'Disponível na App Store')}</span>
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors ml-1" />
        </a>
      </div>
    </section>
  );
};
