import React from 'react';
import { GraduationCap, Play, CheckCircle, BookOpen, Award, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AcademyView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-slate-200">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 block mb-1">
            Plataforma Moodle Integrada
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-daterra-primary">
            {t('academy.title')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{t('academy.moodleConnected')}</span>
          </div>

          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 touch-target"
          >
            <span>{t('academy.visitAcademy')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Curso Ativo */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-daterra-primary text-white p-6 sm:p-8 rounded-3xl shadow-floating space-y-6">
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-daterra-accent">
            {t('academy.activeCourse')}
          </span>
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-mono-numbers">
            {t('academy.percentCompleted')}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black leading-tight">
            {t('academy.courseTitle')}
          </h2>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            {t('academy.courseDescription')}
          </p>
        </div>

        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
          <div className="bg-daterra-accent h-full rounded-full transition-all" style={{ width: '75%' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-black/20 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Módulo 1</span>
            <span className="font-bold text-white">Legislação e Rotulagem</span>
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-1" />
          </div>

          <div className="p-3 bg-black/20 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Módulo 2</span>
            <span className="font-bold text-white">Cálculo de Caldas e Doses</span>
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-1" />
          </div>

          <div className="p-3 bg-black/20 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Módulo 3</span>
            <span className="font-bold text-white">Calibração de Atomizadores</span>
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-1" />
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-daterra-accent text-xs">
            <span className="text-daterra-accent block text-[10px] uppercase font-bold">Módulo 4 (Atual)</span>
            <span className="font-bold text-white">Segurança & EPIs</span>
            <Play className="w-4 h-4 text-daterra-accent mt-1" />
          </div>
        </div>
      </div>

      {/* Lista de Outros Cursos Moodle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-200 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-daterra-secondary flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-daterra-primary">Proteção Integrada na Vinha e Pomares</h3>
          <p className="text-xs text-slate-600">
            Estratégias de combate a pedrado, míldio e oídio utilizando modelos de previsão de risco e armadilhas sexuais.
          </p>
          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>{t('academy.viewProgram')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-200 space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-daterra-primary">Manutenção e Inspeção de Pulverizadores</h3>
          <p className="text-xs text-slate-600">
            Preparação do equipamento para as inspeções obrigatórias IAPMEI/DGAV e verificação do débito dos bicos de pulverização.
          </p>
          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>{t('academy.viewProgram')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

