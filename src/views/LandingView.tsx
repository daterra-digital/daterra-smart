import React from 'react';
import { Link } from 'react-router-dom';
import { 
  WifiOff, Calculator, Award, ArrowRight, 
  CheckCircle2, Cpu, LineChart 
} from 'lucide-react';

export const LandingView: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-floating relative overflow-hidden">
          {/* Elementos decorativos de fundo */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-daterra-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-10 top-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-daterra-accent backdrop-blur-md">
              <Award className="w-4 h-4" />
              <span>PRR Projeto N.º 23703 | AgroSmart DATERRA</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              SaaS Suite Agrícola <br />
              <span className="text-daterra-accent">Offline-First</span> de Precisão
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Cálculo exato de doses e concentrações de fitofármacos, agromonitorização de parcelas por NDVI e capacitação técnica integrada — sem depender de cobertura de rede no campo.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-daterra-accent hover:bg-daterra-accent/90 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-daterra-accent/30 flex items-center justify-center gap-3 touch-target active:scale-95"
              >
                <span>Entrar na Suite DATERRA</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#sobre"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-2xl transition-all border border-white/20 flex items-center justify-center touch-target"
              >
                Saber Mais
              </a>
            </div>

            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-daterra-accent" />
                <span>100% Funcional Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-daterra-accent" />
                <span>Cálculos de Elevada Precisão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-daterra-accent" />
                <span>Agromonitoring & Moodle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secção Destaques / Funcionalidades */}
      <section id="sobre" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-daterra-secondary">
            Arquitetura & Funcionalidades
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-daterra-primary">
            Concebido para o Trabalho no Campo
          </h2>
          <p className="text-sm text-slate-600">
            A plataforma DATERRA Smart combina computação offline com a conveniência de uma Progressive Web App moderna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Offline-First */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 hover:shadow-floating transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center font-bold">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-daterra-primary">Arquitetura Offline-First</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Service Worker com Dexie IndexedDB local. Calcule caldas e consulte o histórico em pomares e vinhas sem necessidade de sinal 4G/5G.
            </p>
          </div>

          {/* Card 2: Calculadoras de Precisão */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 hover:shadow-floating transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center font-bold">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-daterra-primary">Teclado DATERRA & Calculadoras</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teclado tátil mobile com atalhos de valores comuns e validação rigorosa. Modos dedicados para Planta Jovem e Planta Adulta.
            </p>
          </div>

          {/* Card 3: Agromonitoring & Academia */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 hover:shadow-floating transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center font-bold">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-daterra-primary">Agromonitoring & Moodle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integração de índices de saúde vegetativa (NDVI), meteorologia de parcelas e módulo de formação contínua da Academia DATERRA.
            </p>
          </div>
        </div>
      </section>

      {/* Secção Chamada PRR / Co-Financiamento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-daterra-accent uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>AgroSmart DATERRA</span>
            </div>
            <h3 className="text-2xl font-bold">Apoio à Transição Digital e Sustentabilidade</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Desenvolvido no âmbito do Plano de Recuperação e Resiliência (PRR) - Projeto N.º 23703 para capacitação dos aplicadores de fitofármacos e redução do impacto ambiental.
            </p>
          </div>
          <Link
            to="/login"
            className="px-6 py-3.5 bg-daterra-accent hover:bg-daterra-accent/90 text-white font-bold text-xs rounded-xl transition-all shrink-0 touch-target flex items-center justify-center"
          >
            Aceder ao Projeto
          </Link>
        </div>
      </section>
    </div>
  );
};
