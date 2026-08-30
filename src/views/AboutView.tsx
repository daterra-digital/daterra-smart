import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CheckCircle2, ArrowRight, GraduationCap, 
  ExternalLink, Sparkles, Target, Lightbulb, ShieldCheck 
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Secção 1 — Título Principal */}
      <section className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white rounded-3xl p-8 sm:p-12 shadow-floating relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-daterra-accent backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>Sobre a Plataforma</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            DATERRA Smart
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-daterra-accent">
            Ferramentas digitais para uma agricultura mais eficiente.
          </p>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal pt-2">
            A DATERRA Smart foi concebida para apoiar os profissionais agrícolas na preparação de operações, na realização de cálculos técnicos e na consulta de informação útil para o trabalho no campo.
          </p>
        </div>
      </section>

      {/* Secção 2 — Para quem foi pensada */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Users className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Pensada para quem trabalha na agricultura
          </h2>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          A plataforma foi desenhada para responder às exigências práticas de diferentes perfis e agentes do setor agroalimentar:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-base">Agricultores</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apoio direto na preparação de caldas, calibração do pulverizador e cumprimento das boas práticas fitossanitárias.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-base">Técnicos Agrícolas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cálculos rápidos e rigorosos para suporte ao aconselhamento e orientação operacional de campo.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-base">Consultores</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validação técnica de parâmetros agronómicos, volumes de copa e estratégias de intervenção cultural.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-base">Empresas Agrícolas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Padronização de procedimentos de pulverização, otimização de recursos e redução de desperdícios operacionais.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-base">Entidades e Reguladores</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Promoção de metodologias alinhadas com as normas oficiais da DGAV, EPPO e boas práticas europeias.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-base">Universidades e Escolas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recurso pedagógico para ensino prático de tecnologia de aplicação e proteção integrada de culturas.
            </p>
          </div>
        </div>
      </section>

      {/* Secção 3 — Problemas que procura resolver */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Target className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Informação útil quando é necessária
          </h2>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          O trabalho agrícola no terreno exige decisões rápidas e rigorosas. A DATERRA Smart foi construída para superar os desafios mais comuns:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Dificuldade em realizar cálculos no campo</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Calculadoras automatizadas que evitam contas manuais complexas em condições adversas de luminosidade ou tempo.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Erros na preparação de operações</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Validação declarativa rigorosa com limites agronómicos recomendados e avisos pedagógicos de segurança.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Informação técnica dispersa</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Fórmulas oficiais, unidades de medida e orientações regulamentares consolidadas num único ponto de consulta.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Respostas rápidas sobre temas agrícolas</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Microlearning contextual integrado diretamente em cada campo de cálculo para esclarecimento imediato.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Organização de informação útil</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Registo estruturado de parâmetros técnicos para consulta e reutilização informada em operações futuras.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Decisões com maior consistência</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Apoio técnico transparente que fundamenta as escolhas operacionais com base no conhecimento técnico aprovado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secção 4 — Como apoia o trabalho */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Lightbulb className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Ferramentas pensadas para o terreno
          </h2>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          A plataforma integra e evolui para disponibilizar um ecossistema completo de utilidades de campo:
        </p>

        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-daterra-accent shrink-0 mt-2" />
            <span><strong>Cálculos agrícolas simples, rápidos e orientados para a prática:</strong> Velocidade real, dose por hectare, área de parede foliar, volume de copa, volume de calda e débito do pulverizador.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-daterra-accent shrink-0 mt-2" />
            <span><strong>Informação técnica apresentada de forma clara:</strong> Menus intuitivos e linguagem acessível a agricultores e técnicos.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-daterra-accent shrink-0 mt-2" />
            <span><strong>Apoio à preparação de operações:</strong> Adequação dos volumes de calda à vegetação real para redução de perdas e escorrimento.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-daterra-accent shrink-0 mt-2" />
            <span><strong>Consulta útil durante o trabalho no campo:</strong> Disponível mesmo em locais com ligação à Internet limitada.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-daterra-accent shrink-0 mt-2" />
            <span><strong>Ligação ao ecossistema de formação da DATERRA:</strong> Articulação contínua com conteúdos didáticos e capacitação profissional.</span>
          </li>
        </ul>
      </section>

      {/* Secção 5 — Evolução contínua */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <Sparkles className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Uma plataforma em evolução contínua
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          A DATERRA Smart é desenvolvida de forma progressiva, com novas ferramentas e melhorias orientadas pelas necessidades reais dos profissionais agrícolas.
        </p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          O objetivo é criar uma plataforma útil, clara e robusta, capaz de acompanhar o trabalho no terreno e a evolução das práticas agrícolas.
        </p>
      </section>

      {/* Secção 6 — Acesso */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-floating flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Comece pela DATERRA Smart
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            O acesso às ferramentas da DATERRA Smart é feito através de uma conta de utilizador.
          </p>
        </div>

        <Link
          to="/login"
          className="px-8 py-4 bg-daterra-accent hover:bg-daterra-accent/90 text-white font-extrabold text-base rounded-2xl transition-all shadow-xl shadow-daterra-accent/30 flex items-center justify-center gap-3 touch-target active:scale-95 shrink-0"
        >
          <span>Entrar na DATERRA Smart</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Secção 7 — Ligação à Academia DATERRA */}
      <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center gap-3 text-daterra-secondary">
          <GraduationCap className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-extrabold text-daterra-primary">
            Conhecimento e formação
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          Explore também os recursos e a formação disponibilizados pela Academia DATERRA.
        </p>
        <div>
          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-daterra-primary font-bold text-sm rounded-xl transition-colors"
          >
            <span>Aceder à Academia DATERRA</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Nota de Responsabilidade */}
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
