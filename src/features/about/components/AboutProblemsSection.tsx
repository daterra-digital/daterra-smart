import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const AboutProblemsSection: React.FC = () => {
  const { t } = useLanguage();

  const problems = [
    {
      title: t('about.problems.calcField.title', 'Dificuldade em realizar cálculos no campo'),
      desc: t('about.problems.calcField.desc', 'Calculadoras automatizadas que evitam contas manuais complexas em condições adversas de luminosidade ou tempo.')
    },
    {
      title: t('about.problems.errors.title', 'Erros na preparação de operações'),
      desc: t('about.problems.errors.desc', 'Validação declarativa rigorosa com limites agronómicos recomendados e avisos pedagógicos de segurança.')
    },
    {
      title: t('about.problems.scattered.title', 'Informação técnica dispersa'),
      desc: t('about.problems.scattered.desc', 'Fórmulas oficiais, unidades de medida e orientações regulamentares consolidadas num único ponto de consulta.')
    },
    {
      title: t('about.problems.quickAnswers.title', 'Respostas rápidas sobre temas agrícolas'),
      desc: t('about.problems.quickAnswers.desc', 'Guias práticos contextuais integrados diretamente em cada campo de cálculo para esclarecimento imediato.')
    },
    {
      title: t('about.problems.organization.title', 'Organização de informação útil'),
      desc: t('about.problems.organization.desc', 'Registo estruturado de parâmetros técnicos para consulta e reutilização informada em operações futuras.')
    },
    {
      title: t('about.problems.consistency.title', 'Decisões com maior consistência'),
      desc: t('about.problems.consistency.desc', 'Apoio técnico transparente que fundamenta as escolhas operacionais com base no conhecimento técnico aprovado.')
    }
  ];

  return (
    <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft space-y-6">
      <div className="flex items-center gap-3 text-daterra-secondary">
        <Target className="w-6 h-6 shrink-0" />
        <h2 className="text-2xl font-extrabold text-daterra-primary">
          {t('about.problemsTitle', 'Informação útil quando é necessária')}
        </h2>
      </div>

      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
        {t('about.problemsSubtitle', 'O trabalho agrícola no terreno exige decisões rápidas e rigorosas. A DATERRA Smart foi construída para superar os desafios mais comuns:')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {problems.map((prob, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-daterra-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{prob.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{prob.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
