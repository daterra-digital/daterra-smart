import React from 'react';
import { 
  Award, Smartphone, ExternalLink, CheckCircle2, 
  Building2, ShieldCheck, FileText, Info
} from 'lucide-react';
import bannerFinanciamento from '../assets/banner-financiamento.svg';

export const ProjetoAgrosmartView: React.FC = () => {
  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Secção 1 — Cabeçalho Institucional */}
      <section className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white rounded-3xl p-8 sm:p-12 shadow-floating relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-daterra-accent backdrop-blur-md">
            <Award className="w-4 h-4" />
            <span>Projeto n.º 23703</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Projeto AgroSmart DATERRA
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            Digitalização do apoio técnico às operações de proteção das culturas.
          </p>
        </div>
      </section>

      {/* Secção 6 — Banner Institucional Oficial de Cofinanciamento */}
      <section aria-label="Banner Institucional de Financiamento" className="max-w-4xl mx-auto">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <img
            src={bannerFinanciamento}
            alt="Entidades financiadoras do Projeto AgroSmart DATERRA: Recuperar Portugal, PRR, República Portuguesa e União Europeia NextGenerationEU."
            className="w-full h-auto object-contain block rounded-xl"
          />
        </div>
      </section>

      {/* Secção 2 — O Objetivo do Projeto */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <FileText className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            O objetivo do projeto
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          O Projeto AgroSmart DATERRA foi desenvolvido para aproximar o conhecimento técnico das necessidades práticas de agricultores, técnicos agrícolas, consultores e empresas do setor.
        </p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          Através de ferramentas digitais orientadas para o terreno, o projeto procurou apoiar a preparação de operações, os cálculos técnicos, a calibração de equipamentos e a consulta de informação útil para as operações de proteção das culturas.
        </p>
      </section>

      {/* Secção 3 — Primeira Versão Operacional */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Smartphone className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Primeira versão operacional da DATERRA Smart
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          No âmbito do Projeto AgroSmart DATERRA foi desenvolvida a primeira versão operacional da aplicação móvel DATERRA Smart, disponibilizada para dispositivos Android e iOS.
        </p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          A aplicação disponibiliza ferramentas de apoio a cálculos técnicos, preparação de caldas, calibração de equipamentos e consulta de informação técnica em contexto de campo.
        </p>
      </section>

      {/* Secção 4 — DATERRA Smart em Evolução */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            DATERRA Smart em evolução
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          A DATERRA Smart continua a evoluir como plataforma digital da DATERRA, reforçando progressivamente o apoio aos profissionais agrícolas com ferramentas práticas, informação técnica e funcionalidades orientadas para o trabalho no campo.
        </p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          A evolução contínua da plataforma procura responder às necessidades de agricultores, técnicos, consultores e empresas agrícolas, mantendo o foco na utilidade, clareza e rigor técnico.
        </p>
      </section>

      {/* Secção 5 — Informação Institucional do Projeto (Tabela/Grelha) */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Building2 className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Informação do projeto
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designação do Projeto</span>
            <p className="font-semibold text-slate-800">AgroSmart DATERRA</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número do Projeto</span>
            <p className="font-semibold text-slate-800">Projeto n.º 23703</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Beneficiário</span>
            <p className="font-semibold text-slate-800">DATERRA, Lda.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIPC</span>
            <p className="font-semibold text-slate-800">516957260</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medida</span>
            <p className="font-semibold text-slate-800">Vouchers para Startups — Novos Produtos Digitais e Tecnológicos</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aviso de Candidatura</span>
            <p className="font-semibold text-slate-800">Aviso n.º 2025-C16i02-21</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período de Execução</span>
            <p className="font-semibold text-slate-800">1 de agosto de 2025 a 30 de junho de 2026</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</span>
            <p className="font-semibold text-slate-800">Projeto concluído, em processo de avaliação</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-daterra-secondary shrink-0 mt-0.5" />
          <span>
            Apoiado pelo ecossistema de Vouchers para Startups, financiado pelo Plano de Recuperação e Resiliência (PRR) e pelos fundos Europeus NextGenerationEU.
          </span>
        </div>
      </section>

      {/* Secção 7 — Aplicação Móvel (Google Play e App Store) */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Smartphone className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Descarregar a aplicação DATERRA Smart
          </h2>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          A primeira versão operacional da DATERRA Smart está disponível para dispositivos Android e iOS.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a
            href="https://play.google.com/store/apps/details?id=com.cordalmk.daterrasmart&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 touch-target active:scale-95 group"
          >
            <Smartphone className="w-5 h-5 text-daterra-accent" />
            <span>Disponível no Google Play</span>
            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors ml-1" />
          </a>

          <a
            href="https://apps.apple.com/pt/app/daterra-smart/id6779712498"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 touch-target active:scale-95 group"
          >
            <Smartphone className="w-5 h-5 text-daterra-accent" />
            <span>Disponível na App Store</span>
            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors ml-1" />
          </a>
        </div>
      </section>

      {/* Secção 8 — Nota de Responsabilidade */}
      <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            As ferramentas digitais disponibilizadas destinam-se a apoiar a preparação e a decisão técnica. Devem ser utilizadas em articulação com o rótulo dos produtos, a legislação aplicável, as recomendações dos fabricantes e, quando necessário, a orientação de técnicos habilitados.
          </p>
        </div>
      </section>
    </div>
  );
};
