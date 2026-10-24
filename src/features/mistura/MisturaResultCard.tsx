import React from 'react';
import { Beaker, Droplets, ArrowRight, Edit3 } from 'lucide-react';
import type { SequenceStep } from './types';

interface MisturaResultCardProps {
  waterInitialL: number;
  waterFinalL: number;
  tankCapacityL: number;
  productSteps: SequenceStep[];
  onOpenJarTest: () => void;
  onOpenKeypad: () => void;
}

export const MisturaResultCard: React.FC<MisturaResultCardProps> = ({
  waterInitialL,
  waterFinalL,
  tankCapacityL,
  productSteps,
  onOpenJarTest,
  onOpenKeypad
}) => {
  return (
    <div className="bg-[#114037] text-white p-3.5 sm:p-4 rounded-2xl md:rounded-3xl shadow-md border border-emerald-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a2d0c3]">
          Protocolo W.A.L.E.S. • Resumo de Preparação da Calda
        </span>
        <button
          type="button"
          onClick={onOpenJarTest}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Beaker className="w-3.5 h-3.5 text-[#8ffa94]" />
          <span>Teste de Jarra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Bloco 1: Água Inicial */}
        <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-1.5">
          <span className="text-xs font-bold text-slate-100 tracking-tight">
            1. Água Inicial (~50%)
          </span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-[#8ffa94] tracking-tight leading-none">
              {waterInitialL}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">L</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8ffa94]/20 text-[#8ffa94] border border-[#8ffa94]/30">
            <Droplets className="w-3 h-3" />
            <span>Iniciar agitação</span>
          </span>
        </div>

        {/* Bloco 2: Ordem W.A.L.E.S. dos Produtos */}
        <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-2">
          <span className="text-xs font-bold text-slate-100 tracking-tight">
            2. Ordem de Entrada ({productSteps.length} {productSteps.length === 1 ? 'Produto' : 'Produtos'})
          </span>

          {productSteps.length > 0 ? (
            <div className="flex items-center justify-center gap-1 flex-wrap py-1">
              {productSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-[#114037] text-[#8ffa94] border border-[#8ffa94]/30">
                    {step.sigla}
                  </span>
                  {index < productSteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-[#a2d0c3] shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-300 italic py-2">
              Nenhuma formulação selecionada
            </span>
          )}

          <span className="text-[10px] font-semibold text-[#a2d0c3] uppercase tracking-wider">
            Sequência Cronológica Automática
          </span>
        </div>

        {/* Bloco 3: Água Final */}
        <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-1.5">
          <span className="text-xs font-bold text-slate-100 tracking-tight">
            3. Água Final (~50%)
          </span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-[#8ffa94] tracking-tight leading-none">
              {waterFinalL}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">L</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <span>Completar volume</span>
          </span>
        </div>
      </div>

      {/* Rodapé do Cartão Verde com Edição Tátil */}
      <div className="flex items-center justify-between text-xs text-slate-200 pt-1 border-t border-white/10">
        <span className="font-medium text-[11px]">Capacidade de referência do depósito</span>
        <button
          type="button"
          onClick={onOpenKeypad}
          aria-label="Editar capacidade do depósito no teclado"
          className="font-mono font-bold text-white bg-[#1b554a] hover:bg-[#23685b] px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
        >
          <span>{tankCapacityL} L</span>
          <Edit3 className="w-3 h-3 text-[#8ffa94]" />
        </button>
      </div>
    </div>
  );
};
