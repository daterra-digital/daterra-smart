import React, { useState } from 'react';
import {
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Save,
  Beaker,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  SlidersHorizontal,
  Package,
  FlaskConical,
  Sprout,
  Trash2,
  Copy
} from 'lucide-react';
import type { MixingSequenceAnalysis, SequenceStep } from './types';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface MixingSequenceDisplayProps {
  analysis: MixingSequenceAnalysis;
  tankCapacityL: number;
  onTankCapacityChange: (capacityL: number) => void;
  onSaveToHistory: () => void;
  onOpenJarTest: () => void;
  onRemoveFormulation: (formulationId: string) => void;
  onReset: () => void;
}

export const MixingSequenceDisplay: React.FC<MixingSequenceDisplayProps> = ({
  analysis,
  tankCapacityL,
  onTankCapacityChange,
  onSaveToHistory,
  onOpenJarTest,
  onRemoveFormulation,
  onReset
}) => {
  // Estado de checklist em tempo real no terreno
  const [completedStepIds, setCompletedStepIds] = useState<Record<string, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  const toggleStepCompleted = (stepId: string) => {
    setCompletedStepIds(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleCopySequenceText = async () => {
    try {
      const lines: string[] = [
        `*DATERRA Smart — Guia de Sequência de Mistura*`,
        `Capacidade do Depósito: ${tankCapacityL} L`,
        `Data: ${new Date().toLocaleDateString('pt-PT')}`,
        `----------------------------------------`,
        ...analysis.steps.map(s => {
          if (s.isWater) {
            return `[Passo ${s.stepNumber}] ${s.title}: ${s.waterVolumeL ? `${s.waterVolumeL} L de água` : '50% de água'}`;
          }
          return `[Passo ${s.stepNumber}] ${s.sigla || ''} - ${s.name || s.title} (#${s.originalNumber}): ${s.instruction}`;
        }),
        `----------------------------------------`,
        `Nota: Respeitar sempre o rótulo oficial DGAV e usar EPI completo.`
      ];

      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyFeedback('Sequência copiada para a área de transferência!');
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch (err) {
      console.error('Erro ao copiar sequência:', err);
    }
  };

  // Helper para ícone por tipo de passo
  const getStepIcon = (step: SequenceStep) => {
    switch (step.type) {
      case 'water_initial':
      case 'water_final':
        return Droplets;
      case 'conditioner':
        return SlidersHorizontal;
      case 'solid':
        return Package;
      case 'liquid':
        return FlaskConical;
      case 'solution':
        return Sprout;
      case 'adjuvant':
        return Sparkles;
      default:
        return FlaskConical;
    }
  };

  // Helper para cor do card por tipo de passo
  const getStepColorClasses = (step: SequenceStep, isCompleted: boolean) => {
    if (isCompleted) {
      return {
        bg: 'bg-emerald-50/70 border-emerald-400 opacity-90',
        badge: 'bg-emerald-600 text-white',
        accent: 'text-emerald-700'
      };
    }

    switch (step.type) {
      case 'water_initial':
        return {
          bg: 'bg-sky-50/80 border-sky-300 shadow-sm',
          badge: 'bg-sky-600 text-white',
          accent: 'text-sky-800'
        };
      case 'water_final':
        return {
          bg: 'bg-cyan-50/80 border-cyan-300 shadow-sm',
          badge: 'bg-cyan-700 text-white',
          accent: 'text-cyan-800'
        };
      case 'conditioner':
        return {
          bg: 'bg-purple-50/80 border-purple-300 shadow-sm',
          badge: 'bg-purple-700 text-white',
          accent: 'text-purple-900'
        };
      case 'solid':
        return {
          bg: 'bg-amber-50/80 border-amber-300 shadow-sm',
          badge: 'bg-amber-700 text-white',
          accent: 'text-amber-900'
        };
      case 'liquid':
        return {
          bg: 'bg-teal-50/80 border-teal-300 shadow-sm',
          badge: 'bg-teal-700 text-white',
          accent: 'text-teal-900'
        };
      case 'solution':
        return {
          bg: 'bg-emerald-50/80 border-emerald-300 shadow-sm',
          badge: 'bg-emerald-700 text-white',
          accent: 'text-emerald-900'
        };
      case 'adjuvant':
        return {
          bg: 'bg-indigo-50/80 border-indigo-300 shadow-sm',
          badge: 'bg-indigo-700 text-white',
          accent: 'text-indigo-900'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          badge: 'bg-slate-700 text-white',
          accent: 'text-slate-800'
        };
    }
  };

  const completedCount = Object.values(completedStepIds).filter(Boolean).length;
  const totalSteps = analysis.steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Painel Principal com Gradiente e Resumo da Mistura */}
      <div className="bg-gradient-to-br from-[#114037] via-[#175348] to-[#1D734B] text-white rounded-3xl p-6 sm:p-8 shadow-floating border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3AAA35]">
                Ordem Técnica de Preparação da Calda
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Sequência Recomendada de Carregamento
            </h2>
            <p className="text-xs text-slate-200 mt-0.5">
              Protocolo W.A.L.E.S. com a regra dos 50% de água inicial e 50% de água final.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenJarTest}
              className="min-h-[44px] px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold rounded-xl transition-all border border-white/20 flex items-center gap-2 touch-target active:scale-95"
            >
              <Beaker className="w-4 h-4 text-[#3AAA35]" />
              <span>Teste de Jarra</span>
            </button>
          </div>
        </div>

        {/* Configurador Rápido de Capacidade do Depósito (L) */}
        <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#3AAA35]" />
              <span>Capacidade do Depósito do Pulverizador (L)</span>
            </label>
            <span className="text-xs font-black text-[#3AAA35]">
              {tankCapacityL} Litros
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
            {[400, 600, 800, 1000, 1500, 2000, 3000].map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => onTankCapacityChange(cap)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap touch-target ${
                  tankCapacityL === cap
                    ? 'bg-[#3CA64C] text-white shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {cap} L
              </button>
            ))}
          </div>
        </div>

        {/* Resumo da Calda: 50% Inicial + Produtos + 50% Final */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-300 font-bold block uppercase">1. Água Inicial</span>
            <span className="text-lg font-black text-white font-mono-numbers">
              {analysis.waterInitialL ? `${analysis.waterInitialL} L` : '50%'}
            </span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-300 font-bold block uppercase">2. Formulações</span>
            <span className="text-lg font-black text-[#3AAA35] font-mono-numbers">
              {analysis.selectedCount} tipos
            </span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-300 font-bold block uppercase">3. Água Final</span>
            <span className="text-lg font-black text-white font-mono-numbers">
              {analysis.waterFinalL ? `${analysis.waterFinalL} L` : '50%'}
            </span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-300 font-bold block uppercase">4. Agitação</span>
            <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1 mt-1">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Contínua</span>
            </span>
          </div>
        </div>

        {/* Barra de Progresso do Checklist no Campo */}
        {totalSteps > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-200">Progresso do Carregamento:</span>
              <span className="text-[#3AAA35] font-mono-numbers">
                {completedCount} de {totalSteps} passos concluídos ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3CA64C] to-[#3AAA35] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Alertas e Recomendações Críticas */}
      {analysis.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Atenção Técnica de Compatibilidade</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-900 leading-relaxed pl-1">
            {analysis.warnings.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista Passo a Passo da Sequência */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-[#114037]">
            Linha de Carregamento Cronológica
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Toque no círculo para assinalar o passo realizado
          </span>
        </div>

        <div className="space-y-3">
          {analysis.steps.map((step) => {
            const isCompleted = !!completedStepIds[step.id];
            const StepIcon = getStepIcon(step);
            const style = getStepColorClasses(step, isCompleted);

            return (
              <div
                key={step.id}
                className={`p-5 rounded-3xl border transition-all duration-200 ${style.bg} flex flex-col sm:flex-row sm:items-start justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  {/* Botão de Checkbox / Conclusão do Passo */}
                  <button
                    type="button"
                    onClick={() => toggleStepCompleted(step.id)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all touch-target shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                    title={isCompleted ? 'Passo marcado como concluído' : 'Marcar passo como concluído'}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <span className="font-black text-sm">
                        {step.stepNumber}
                      </span>
                    )}
                  </button>

                  <div className="space-y-1.5">
                    {/* Cabeçalho do Passo */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${style.badge} flex items-center gap-1.5`}>
                        <StepIcon className="w-3.5 h-3.5" />
                        <span>Passo {step.stepNumber}</span>
                      </span>

                      {step.sigla && (
                        <span className="px-2 py-0.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-black text-slate-800">
                          {step.sigla}
                        </span>
                      )}

                      {step.originalNumber && (
                        <span className="text-[10px] font-extrabold text-slate-500">
                          (Catálogo #{step.originalNumber})
                        </span>
                      )}

                      <span className="text-[10px] font-semibold text-slate-500">
                        • {step.group}
                      </span>
                    </div>

                    {/* Título Principal */}
                    <h4 className={`text-base font-extrabold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {step.title}
                    </h4>

                    {/* Instrução Técnica Principal */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {step.instruction}
                    </p>

                    {/* Informações Complementares */}
                    {step.information && (
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#1D734B] shrink-0" />
                        <span>{step.information}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Laterais: DidacticHelp e Remover */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                  {step.faqTopic && (
                    <DidacticHelp
                      faqFile={`${step.faqTopic.replace('mistura-', 'MisturaFAQ').charAt(0).toUpperCase() + step.faqTopic.replace('mistura-', 'MisturaFAQ').slice(1)}.md` as any}
                      topic={step.faqTopic}
                      buttonLabel="Ajuda"
                      variant="button"
                      iconType="info"
                      className="min-h-[40px] !bg-white/80 border border-slate-200"
                    />
                  )}

                  {step.formulationId && (
                    <button
                      type="button"
                      onClick={() => onRemoveFormulation(step.formulationId!)}
                      className="min-h-[40px] min-w-[40px] p-2 text-slate-400 hover:text-rose-700 bg-white/80 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all touch-target"
                      title="Remover este produto da mistura"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notificação de Cópia */}
      {copyFeedback && (
        <div className="p-4 bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Botões de Ação Final */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          type="button"
          onClick={onSaveToHistory}
          className="min-h-[48px] py-3.5 px-5 bg-[#114037] hover:bg-[#1D734B] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 touch-target"
        >
          <Save className="w-5 h-5 text-[#3AAA35]" />
          <span>Guardar no Histórico</span>
        </button>

        <button
          type="button"
          onClick={handleCopySequenceText}
          className="min-h-[48px] py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl transition-all border border-slate-300 flex items-center justify-center gap-2 active:scale-95 touch-target"
        >
          <Copy className="w-5 h-5 text-slate-600" />
          <span>Copiar Sequência</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="min-h-[48px] py-3.5 px-5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 touch-target"
        >
          <RotateCcw className="w-5 h-5 text-rose-600" />
          <span>Reiniciar Mistura</span>
        </button>
      </div>

      {/* Aviso Regulamentar Oficial DGAV */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-3 text-slate-600 text-xs leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-[#1D734B] shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-slate-800 block">Norma de Aplicação e Segurança DGAV:</span>
          A ordem apresentada baseia-se nas melhores práticas internacionais de dispersão física e química de caldas. Em caso de discrepância com o rótulo de um produto fitofarmacêutico específico homologado pela DGAV, prevalecem sempre as instruções mais restritivas constantes no rótulo oficial.
        </div>
      </div>
    </div>
  );
};
