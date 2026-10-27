import React from 'react';
import { Users } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const AboutAudienceSection: React.FC = () => {
  const { t } = useLanguage();

  const audiences = [
    {
      title: t('about.audience.farmers.title', 'Agricultores'),
      desc: t('about.audience.farmers.desc', 'Apoio direto na preparação de caldas, calibração do pulverizador e cumprimento das boas práticas fitossanitárias.')
    },
    {
      title: t('about.audience.technicians.title', 'Técnicos Agrícolas'),
      desc: t('about.audience.technicians.desc', 'Cálculos rápidos e rigorosos para suporte ao aconselhamento e orientação operacional de campo.')
    },
    {
      title: t('about.audience.consultants.title', 'Consultores'),
      desc: t('about.audience.consultants.desc', 'Validação técnica de parâmetros agronómicos, volumes de copa e estratégias de intervenção cultural.')
    },
    {
      title: t('about.audience.companies.title', 'Empresas Agrícolas'),
      desc: t('about.audience.companies.desc', 'Padronização de procedimentos de pulverização, otimização de recursos e redução de desperdícios operacionais.')
    },
    {
      title: t('about.audience.regulators.title', 'Entidades e Reguladores'),
      desc: t('about.audience.regulators.desc', 'Promoção de metodologias alinhadas com as normas técnicas oficiais e boas práticas europeias.')
    },
    {
      title: t('about.audience.universities.title', 'Universidades e Escolas'),
      desc: t('about.audience.universities.desc', 'Recurso pedagógico para ensino prático de tecnologia de aplicação e proteção integrada de culturas.')
    }
  ];

  return (
    <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
      <div className="flex items-center gap-3 text-daterra-secondary">
        <Users className="w-6 h-6 shrink-0" />
        <h2 className="text-2xl font-extrabold text-daterra-primary">
          {t('about.audienceTitle', 'Pensada para quem trabalha na agricultura')}
        </h2>
      </div>

      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
        {t('about.audienceSubtitle', 'A plataforma foi desenhada para responder às exigências práticas de diferentes perfis e agentes do setor agroalimentar:')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
        {audiences.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
