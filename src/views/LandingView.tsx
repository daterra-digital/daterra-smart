import React from 'react';
import { Link } from 'react-router-dom';
import { 
  WifiOff, Calculator, Award, ArrowRight, 
  CheckCircle2, LineChart
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

          <div className="max-w-4xl lg:max-w-5xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-daterra-accent backdrop-blur-md">
              <Award className="w-4 h-4" />
              <span>Tecnologia agrícola pensada para o terreno.</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.15]">
              <span className="block">Ferramentas digitais para uma</span>
              <span className="text-daterra-accent block">agricultura mais eficiente</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl">
              Apoio digital para preparar operações agrícolas, realizar cálculos técnicos e tomar decisões mais informadas no campo.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-daterra-accent hover:bg-daterra-accent/90 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-daterra-accent/30 flex items-center justify-center gap-3 touch-target active:scale-95"
              >
                <span>Entrar na DATERRA Smart</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/sobre"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-2xl transition-all border border-white/20 flex items-center justify-center touch-target"
              >
                Saber Mais
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-daterra-accent" />
                <span>Disponível no Terreno</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-daterra-accent" />
                <span>Cálculos de Elevada Precisão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-daterra-accent" />
                <span>Acompanhamento Técnico</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secção Destaques / Funcionalidades */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-daterra-secondary">
            Funcionalidades & Apoio Prático
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-daterra-primary">
            Concebido para o Trabalho no Campo
          </h2>
          <p className="text-sm text-slate-600">
            A DATERRA Smart disponibiliza ferramentas práticas concebidas para apoiar decisões técnicas e facilitar as tarefas diárias no terreno.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ligação Limitada */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 hover:shadow-floating transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center font-bold">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-daterra-primary">Funciona mesmo quando a ligação à Internet é limitada</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consulta e registo de informação durante o trabalho no campo. Realize cálculos técnicos com confiança mesmo em parcelas rurais ou zonas com cobertura de rede limitada.
            </p>
          </div>

          {/* Card 2: Calculadoras de Precisão */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 hover:shadow-floating transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center font-bold">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-daterra-primary">Cálculos agrícolas simples, rápidos e orientados para a prática</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teclado adaptado ao terreno com atalhos de valores comuns e validação rigorosa para apoio à preparação de caldas e calibração de equipamentos agrícolas.
            </p>
          </div>

          {/* Card 3: Informação e Formação */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 hover:shadow-floating transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center font-bold">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-daterra-primary">Informação agrícola, acompanhamento e formação num único espaço</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apoio prático na organização de operações, consulta técnica e ligação ao ecossistema de conhecimento e formação da Academia DATERRA.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
