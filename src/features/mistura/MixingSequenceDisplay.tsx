import React, { useState } from 'react';
import {
  Droplets,
  AlertTriangle,
  ShieldCheck,
  Info,
  Check,
  Sliders,
  Trash2,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import type { MixingSequenceAnalysis, SequenceStep } from './types';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface MixingSequenceDisplayProps {
  analysis: MixingSequenceAnalysis;
  tankCapacityL: number;
  onTankCapacityChange: (capacityL: number) => void;
  onOpenKeypad?: () => void;
  onSaveToHistory: () => void;
  onOpenJarTest: () => void;
  onRemoveFormulation: (formulationId: string) => void;
  onReset: () => void;
}

const TANK_PRESET_SHORTCUTS = [400, 600, 800, 1000, 1500, 2000, 3000];

export const MixingSequenceDisplay: React.FC<MixingSequenceDisplayProps> = ({
  analysis,
  tankCapacityL,
  onTankCapacityChange,
  onOpenKeypad,
  onRemoveFormulation
}) => {
  // Estado de checklist concluído no terreno
  const [completedStepIds, setCompletedStepIds] = useState<Record<string, boolean>>({});
  // Estado de passos expandidos no acordeão (Progressive Disclosure: ocultos por defeito)
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({});
  // Estado de expansão do aviso de compatibilidade
  const [isWarningsOpen, setIsWarningsOpen] = useState<boolean>(false);
  // Feedback rápido de cópia
  const [copied, setCopied] = useState<boolean>(false);

  const toggleStepCompleted = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedStepIds((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const toggleStepExpanded = (stepId: string) => {
    setExpandedStepIds((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleStepTankCapacity = (delta: number) => {
    const next = Math.min(3000, Math.max(100, tankCapacityL + delta));
    onTankCapacityChange(next);
  };

  const handleSliderTankCapacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTankCapacityChange(Number(e.target.value));
  };

  const handleCopySequenceText = async () => {
    try {
      const lines: string[] = [
        `*DATERRA Smart — Guia de Sequência de Mistura*`,
        `Capacidade do Depósito: ${tankCapacityL} L`,
        `Data: ${new Date().toLocaleDateString('pt-PT')}`,
        `----------------------------------------`,
        ...analysis.steps.map((s) => {
          if (s.isWater) {
            return `[Passo ${s.stepNumber}] ${s.title}: ${s.waterVolumeL ? `${s.waterVolumeL} L de água` : '50% de água'}`;
          }
          return `[Passo ${s.stepNumber}] ${s.sigla || ''} - ${s.name || s.title} (#${s.originalNumber}): ${s.instruction}`;
        }),
        `----------------------------------------`,
        `Nota: Respeitar sempre as instruções do rótulo oficial e usar EPI completo.`
      ];

      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar sequência:', err);
    }
  };

  // Estilo suave dos badges das formulações (idêntico aos badges VF/F do Comparador de Bicos)
  const getFormulationBadgeStyle = (step: SequenceStep) => {
    switch (step.type) {
      case 'water_initial':
      case 'water_final':
        return {
          pill: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500'
        };
      case 'conditioner':
        return {
          pill: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500'
        };
      case 'solid':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'liquid':
        return {
          pill: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-500'
        };
      case 'solution':
        return {
          pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'adjuvant':
      default:
        return {
          pill: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500'
        };
    }
  };

  const completedCount = Object.values(completedStepIds).filter(Boolean).length;
  const totalSteps = analysis.steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 1. CARTÃO AJUSTE DE CALIBRAÇÃO — DEPÓSITO DO PULVERIZADOR (MINIMALISTA, PADRÃO COMPARADOR) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#114037] text-white flex items-center justify-center shadow-xs shrink-0">
                <Sliders className="w-4 h-4 text-[#3CA64C]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                  Ajuste de Calibração
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Depósito do Pulverizador
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ● Volume ativo
            </span>
          </div>

          {/* Stepper Central (-) 1000 L (+) */}
          <div className="my-2.5 py-2 flex items-center justify-center gap-4 bg-slate-50/70 rounded-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => handleStepTankCapacity(-100)}
              aria-label="Diminuir volume do depósito"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-black text-lg flex items-center justify-center shadow-2xs cursor-pointer transition-transform"
            >
              −
            </button>
            <button
              type="button"
              onClick={onOpenKeypad}
              aria-label="Introduzir capacidade do depósito no teclado numérico"
              className="text-center min-w-[120px] px-3 py-1 rounded-xl hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-target"
            >
              <span className="font-mono text-3xl font-black text-slate-900 tracking-tight">
                {tankCapacityL}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">L</span>
              <Edit3 className="w-4 h-4 text-emerald-700 ml-1" />
            </button>
            <button
              type="button"
              onClick={() => handleStepTankCapacity(100)}
              aria-label="Aumentar volume do depósito"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-black text-lg flex items-center justify-center shadow-2xs cursor-pointer transition-transform"
            >
              +
            </button>
          </div>

          {/* Slider Minimalista */}
          <div className="px-1">
            <input
              type="range"
              min="100"
              max="3000"
              step="100"
              value={tankCapacityL}
              onChange={handleSliderTankCapacity}
              aria-label="Barra deslizante de volume do depósito"
              className="w-full accent-[#114037] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>100 L</span>
              <span>3000 L</span>
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">Atalhos:</span>
            {TANK_PRESET_SHORTCUTS.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => onTankCapacityChange(cap)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  tankCapacityL === cap
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cap} L
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CARTÃO PRINCIPAL: LINHA DE CARREGAMENTO CRONOLÓGICA (ACORDEÃO PROGRESSIVE DISCLOSURE) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        {/* Cabeçalho do Cartão */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs shrink-0">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                Ordem de Preparação W.A.L.E.S.
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Linha de Carregamento Cronológica
              </h3>
            </div>
          </div>

          {/* Ações Contextuais do Cartão: Avisos Recolhíveis + Copiar Ordem */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
            {analysis.warnings.length > 0 && (
              <button
                type="button"
                onClick={() => setIsWarningsOpen((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {analysis.warnings.length} {analysis.warnings.length === 1 ? 'Nota técnica' : 'Notas técnicas'}
                </span>
                {isWarningsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySequenceText}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3CA64C]" />
                  <span className="text-[#114037]">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Ordem</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bloco Ocultável de Notas Técnicas de Compatibilidade */}
        {isWarningsOpen && analysis.warnings.length > 0 && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed space-y-1 animate-fade-in">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#114037] shrink-0" />
              <span>Atenção Técnica de Compatibilidade</span>
            </span>
            <ul className="space-y-1 pl-1">
              {analysis.warnings.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Barra Compacta de Progresso no Terreno */}
        {totalSteps > 0 && (
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3CA64C] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
              {completedCount}/{totalSteps} passos ({progressPercent}%)
            </span>
          </div>
        )}

        {/* Lista de Passos em Acordeão (1 Linha Limpa por Passo) */}
        <div className="space-y-2">
          {analysis.steps.map((step) => {
            const isCompleted = !!completedStepIds[step.id];
            const isExpanded = !!expandedStepIds[step.id];
            const badgeStyle = getFormulationBadgeStyle(step);

            return (
              <div
                key={step.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-300/80'
                    : 'bg-[#FAFBFB] hover:bg-slate-50 border-slate-200/90'
                }`}
              >
                {/* Linha Principal Compacta (Sempre Visível) */}
                <div
                  onClick={() => toggleStepExpanded(step.id)}
                  className="p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Botão de Conclusão do Passo */}
                    <button
                      type="button"
                      onClick={(e) => toggleStepCompleted(step.id, e)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs ${
                        isCompleted
                          ? 'bg-[#3CA64C] text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                      title={isCompleted ? 'Passo concluído' : 'Marcar passo como concluído'}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <span className="font-mono font-black text-xs">
                          {step.stepNumber}
                        </span>
                      )}
                    </button>

                    {/* Badge da Formulação / Água (Estilo VF/F do Comparador) */}
                    {step.isWater ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-xs font-black border shrink-0 shadow-2xs ${badgeStyle.pill}`}
                      >
                        <Droplets className="w-3 h-3 text-sky-600 shrink-0" />
                        <span>H2O</span>
                      </span>
                    ) : (
                      step.sigla && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-mono text-xs font-black border shrink-0 shadow-2xs ${badgeStyle.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeStyle.dot}`} />
                          <span>{step.sigla}</span>
                        </span>
                      )
                    )}

                    {/* Nome e Resumo Curto numa única linha */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className={`text-xs sm:text-sm font-black truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {step.isWater ? step.title : step.name || step.title}
                        </h4>
                        {step.isWater && step.waterVolumeL && (
                          <span className="text-xs font-mono font-extrabold text-[#114037]">
                            • {step.waterVolumeL} L
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block truncate">
                        {step.group}
                        {step.originalNumber ? ` • Catálogo #${step.originalNumber}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Ações Direitas da Linha: Remover + Botão Expandir Acordeão */}
                  <div className="flex items-center gap-1 shrink-0">
                    {step.formulationId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFormulation(step.formulationId!);
                        }}
                        className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remover da mistura"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <span className="hidden sm:inline">{isExpanded ? 'Ocultar' : 'Detalhes'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Painel Expansível do Acordeão (Instruções Longas Ocultas por Defeito) */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200/70 bg-white space-y-2 animate-fade-in">
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {step.instruction}
                    </p>

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                      {step.information ? (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" />
                          <span>
                            <strong className="text-[#114037]">Nota técnica:</strong> {step.information}
                          </span>
                        </div>
                      ) : (
                        <span />
                      )}

                      {step.faqTopic && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <DidacticHelp
                            faqFile={`${step.faqTopic.replace('mistura-', 'MisturaFAQ').charAt(0).toUpperCase() + step.faqTopic.replace('mistura-', 'MisturaFAQ').slice(1)}.md` as any}
                            topic={step.faqTopic}
                            buttonLabel=""
                            variant="icon"
                            iconType="info"
                            className="min-w-[28px] min-h-[28px] p-1 !bg-transparent hover:!bg-slate-200/60 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AVISO TÉCNICO NO FINAL (IDÊNTICO AO COMPARADOR DE BICOS) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs text-slate-600 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-daterra-primary" />
          Aviso Técnico DATERRA Smart
        </span>
        <p>
          Esta ferramenta fornece a ordem de preparação baseada no protocolo internacional W.A.L.E.S. de dispersão física e química de caldas. Em caso de discrepância com o rótulo oficial homologado, prevalecem sempre as instruções mais restritivas do rótulo.
        </p>
      </div>
    </div>
  );
};
