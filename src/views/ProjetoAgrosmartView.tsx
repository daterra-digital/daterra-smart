import React from 'react';
import { Award, Smartphone, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import bannerFinanciamento from '../assets/banner-financiamento.svg';
import { useTranslation } from '../context/LanguageContext';
import { ProjetoInfoGrid } from '../features/projeto-agrosmart/components/ProjetoInfoGrid';
import { ProjetoAppLinksSection } from '../features/projeto-agrosmart/components/ProjetoAppLinksSection';

export const ProjetoAgrosmartView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Secção 1 — Cabeçalho Institucional */}
      <section className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white rounded-3xl p-8 sm:p-12 shadow-floating relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-daterra-accent backdrop-blur-md">
            <Award className="w-4 h-4" />
            <span>{t('projetoAgrosmart.badge', 'Projeto n.º 23703')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t('projetoAgrosmart.title', 'Projeto AgroSmart DATERRA')}
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            {t('projetoAgrosmart.subtitle', 'Digitalização do apoio técnico às operações de proteção das culturas.')}
          </p>
        </div>
      </section>

      {/* Secção — Banner Institucional Oficial de Cofinanciamento (Exceção de Asset Gráfico) */}
      <section aria-label="Banner Institucional de Financiamento" className="max-w-4xl mx-auto">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <img
            src={bannerFinanciamento}
            alt={t('projetoAgrosmart.bannerAlt', 'Entidades financiadoras do Projeto AgroSmart DATERRA: Recuperar Portugal, PRR, República Portuguesa e União Europeia NextGenerationEU.')}
            className="w-full h-auto object-contain block rounded-xl"
          />
        </div>
      </section>

      {/* Secção 2 — O Objetivo do Projeto */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <FileText className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            {t('projetoAgrosmart.objectiveTitle', 'O objetivo do projeto')}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {t('projetoAgrosmart.objectiveP1', 'O Projeto AgroSmart DATERRA foi desenvolvido para aproximar o conhecimento técnico das necessidades práticas de agricultores, técnicos agrícolas, consultores e empresas do setor.')}
        </p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {t('projetoAgrosmart.objectiveP2', 'Através de ferramentas digitais orientadas para o terreno, o projeto procurou apoiar a preparação de operações, os cálculos técnicos, a calibração de equipamentos e a consulta de informação útil para as operações de proteção das culturas.')}
        </p>
      </section>

      {/* Secção 3 — Primeira Versão Operacional */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Smartphone className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            {t('projetoAgrosmart.firstVersionTitle', 'Primeira versão operacional da DATERRA Smart')}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {t('projetoAgrosmart.firstVersionP1', 'No âmbito do Projeto AgroSmart DATERRA foi desenvolvida a primeira versão operacional da aplicação móvel DATERRA Smart, disponibilizada para dispositivos Android e iOS.')}
        </p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {t('projetoAgrosmart.firstVersionP2', 'A aplicação disponibiliza ferramentas de apoio a cálculos técnicos, preparação de caldas, calibração de equipamentos e consulta de informação técnica em contexto de campo.')}
        </p>
      </section>

      {/* Secção 4 — DATERRA Smart em Evolução */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            {t('projetoAgrosmart.evolutionTitle', 'DATERRA Smart em evolução')}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {t('projetoAgrosmart.evolutionP1', 'A DATERRA Smart continua a evoluir como plataforma digital da DATERRA, reforçando progressivamente o apoio aos profissionais agrícolas com ferramentas práticas, informação técnica e funcionalidades orientadas para o trabalho no campo.')}
        </p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {t('projetoAgrosmart.evolutionP2', 'A evolução contínua da plataforma procura responder às necessidades de agricultores, técnicos, consultores e empresas agrícolas, mantendo o foco na utilidade, clareza e rigor técnico.')}
        </p>
      </section>

      {/* Secção 5 — Informação Institucional do Projeto (Tabela/Grelha Modular) */}
      <ProjetoInfoGrid />

      {/* Secção 6 — Aplicação Móvel (Google Play e App Store Modular) */}
      <ProjetoAppLinksSection />

      {/* Secção 7 — Nota de Responsabilidade */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('projetoAgrosmart.disclaimer', 'As ferramentas digitais disponibilizadas destinam-se a apoiar a preparação e a decisão técnica. Devem ser utilizadas em articulação com o rótulo dos produtos, a legislação aplicável, as recomendações dos fabricantes e, quando necessário, a orientação de técnicos habilitados.')}
          </p>
        </div>
      </section>
    </div>
  );
};
