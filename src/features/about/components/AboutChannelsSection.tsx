import React from 'react';
import { Globe, GraduationCap, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const AboutChannelsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
      <div className="flex items-center gap-3 text-daterra-secondary">
        <Globe className="w-6 h-6 shrink-0" />
        <h2 className="text-2xl font-extrabold text-daterra-primary">
          {t('about.officialChannels', 'Canais Oficiais DATERRA')}
        </h2>
      </div>

      <div className="flex flex-wrap gap-4">
        <a
          href="https://daterra.com.pt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-daterra-primary font-bold text-sm rounded-xl transition-colors"
        >
          <span>{t('about.websiteDaterra', 'Website DATERRA')}</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <a
          href="https://academia.daterra.com.pt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#1D734B] font-bold text-sm rounded-xl transition-colors border border-emerald-200"
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t('about.academiaDaterra', 'Academia DATERRA')}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 font-medium space-y-1">
        <p className="font-bold text-slate-700">{t('about.developedBy', 'Desenvolvido por DATERRA')}</p>
        <p>{t('about.allRightsReserved', '© 2026 DATERRA. Todos os direitos reservados.')}</p>
      </div>
    </section>
  );
};
