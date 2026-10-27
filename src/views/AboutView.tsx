import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AboutAudienceSection } from '../features/about/components/AboutAudienceSection';
import { AboutProblemsSection } from '../features/about/components/AboutProblemsSection';
import { AboutLegalSection } from '../features/about/components/AboutLegalSection';
import { AboutChannelsSection } from '../features/about/components/AboutChannelsSection';

export const AboutView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Secção 1 — Título Principal */}
      <section className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white rounded-3xl p-8 sm:p-12 shadow-floating relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-daterra-accent backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>{t('about.badge', 'Sobre a Plataforma')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            DATERRA Smart
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-daterra-accent">
            {t('about.tagline', 'Ferramentas digitais para uma agricultura mais eficiente.')}
          </p>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal pt-2">
            {t('about.description', 'A DATERRA Smart é uma plataforma SaaS agrícola desenvolvida para apoiar profissionais do setor agrícola com ferramentas digitais de precisão, incluindo calculadoras, gestão de perfis e integração com sistemas externos.')}
          </p>
        </div>
      </section>

      {/* Secção 2 — Para quem foi pensada */}
      <AboutAudienceSection />

      {/* Secção 3 — Problemas que procura resolver */}
      <AboutProblemsSection />

      {/* Secção 4 — Informações Legais e Links Úteis */}
      <AboutLegalSection />

      {/* Secção 5 — Links Úteis e Créditos */}
      <AboutChannelsSection />

      {/* Nota de Responsabilidade */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('about.disclaimer', 'As ferramentas digitais disponibilizadas destinam-se a apoiar a preparação e a decisão técnica. Devem ser utilizadas em articulação com o rótulo dos produtos, a legislação aplicável, as recomendações dos fabricantes e, quando necessário, a orientação de técnicos habilitados.')}
          </p>
        </div>
      </section>
    </div>
  );
};
