import React from 'react';
import { Link } from 'react-router-dom';
import daterraLogo from '../assets/daterra-logo.svg';
import { useTranslation } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-daterra-primary text-white border-t border-daterra-secondary/30 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="mb-4">
            <img
              src={daterraLogo}
              alt="DATERRA Logo"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {t(
              'footer.description',
              'Ferramentas digitais práticas e capacitação técnica para o setor agroalimentar e proteção das culturas.'
            )}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">
            {t('footer.fundingTitle', 'Financiamento')}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {t('footer.fundingLine1', 'Projeto AgroSmart DATERRA')}<br />
            {t('footer.fundingLine2', 'Projeto n.º 23703')}<br />
            {t('footer.fundingLine3', 'Apoiado pelo PRR — Plano de Recuperação e Resiliência')}
          </p>
          <Link
            to="/projeto-agrosmart"
            className="inline-flex items-center gap-1.5 text-xs text-daterra-accent hover:text-white font-bold mt-2.5 transition-colors group"
          >
            <span>{t('footer.viewProjectDetails', 'Ver detalhes do projeto')}</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">
            {t('footer.toolsTitle', 'Ferramentas & Recursos')}
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
            <li>{t('footer.toolsItem1', 'Calculadoras Agrícolas de Precisão')}</li>
            <li>{t('footer.toolsItem2', 'Informação e Acompanhamento Técnico')}</li>
            <li>
              <a
                href="https://academia.daterra.com.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-daterra-accent transition-colors"
              >
                {t('footer.toolsItem3', 'Academia DATERRA')}
              </a>
            </li>
            <li>{t('footer.toolsItem4', 'Preparação e Calibração de Caldas')}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">
            {t('footer.supportTitle', 'Suporte & Contacto')}
          </h4>
          <p className="text-xs text-slate-300 font-medium">
            {t('footer.supportEmail', 'Email: smart@daterra.com.pt')}<br />
            {t('footer.supportPhone', 'Telefone: +351 262 145 662')}<br />
            {t('footer.supportCountry', 'Portugal')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 text-center text-xs text-slate-400 font-medium">
        {t(
          'footer.allRightsReserved',
          '© {{year}} DATERRA Smart. Todos os direitos reservados.',
          { year: currentYear }
        )}
      </div>
    </footer>
  );
};
