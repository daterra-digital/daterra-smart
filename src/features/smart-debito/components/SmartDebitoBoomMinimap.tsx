/**
 * DATERRA Smart - Minimapa Interativo da Barra Horizontal (ISO 16122-2)
 * Ficheiro: src/features/smart-debito/components/SmartDebitoBoomMinimap.tsx
 *
 * Ilustração permanente e ultra-compacta da barra de pulverização observada a partir
 * da traseira do trator/pulverizador (Vista Traseira Oficial).
 * - Secção Esquerda (Bicos N1 a Nx) à esquerda do utilizador
 * - Chassis / Pulverizador ao centro
 * - Secção Direita (Bicos Nx+1 a N2x) à direita do utilizador
 * - Sinalizador ativo em tempo real com realce e anel pulsante no bico em edição
 * - Clique direto no bico para navegar e focar instantaneamente a respetiva célula na grelha.
 *
 * REGRAS ESTRITAS: Termos interditos excluídos. Na UI utiliza exclusivamente "débito" e "Secção".
 */

import React, { useMemo } from 'react';
import type { NozzleSlot, NozzleSlotEvaluation } from '../types';
import { getSlotColorInfo } from '../smartDebitoCalculations';

interface SmartDebitoBoomMinimapProps {
  numLevels: number; // metade da barra (x bicos em cada secção)
  slots: Record<string, NozzleSlot>;
  evaluations: Record<string, NozzleSlotEvaluation>;
  activeSlotKey: string | null;
  onSelectNozzle: (slotKey: string) => void;
}

export const SmartDebitoBoomMinimap: React.FC<SmartDebitoBoomMinimapProps> = ({
  numLevels,
  slots,
  evaluations,
  activeSlotKey,
  onSelectNozzle
}) => {
  const totalNozzles = numLevels * 2;

  // Lista sequencial de bicos da barra de uma ponta à outra (Vista Traseira)
  const boomNozzles = useMemo(() => {
    const list: Array<{
      index: number;
      displayLabel: string;
      slotKey: string;
      slot: NozzleSlot | undefined;
      evaluation: NozzleSlotEvaluation | undefined;
      section: 'left' | 'right';
      level: number;
    }> = [];

    // Secção Esquerda: N1 até Nx
    for (let lvl = 1; lvl <= numLevels; lvl++) {
      const slotKey = `${lvl}-left`;
      list.push({
        index: lvl,
        displayLabel: `N${lvl}`,
        slotKey,
        slot: slots[slotKey],
        evaluation: evaluations[slotKey],
        section: 'left',
        level: lvl
      });
    }

    // Secção Direita: Nx+1 até N2x
    for (let lvl = 1; lvl <= numLevels; lvl++) {
      const slotKey = `${lvl}-right`;
      const num = numLevels + lvl;
      list.push({
        index: num,
        displayLabel: `N${num}`,
        slotKey,
        slot: slots[slotKey],
        evaluation: evaluations[slotKey],
        section: 'right',
        level: lvl
      });
    }

    return list;
  }, [numLevels, slots, evaluations]);

  const leftNozzles = boomNozzles.slice(0, numLevels);
  const rightNozzles = boomNozzles.slice(numLevels);

  return (
    <div className="w-full bg-slate-50/90 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 mb-4 shadow-2xs transition-all duration-300">
      {/* Cabeçalho do Minimapa com Contexto Espacial */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold pb-2 mb-2 border-b border-slate-200/70 gap-2">
        {/* Secção Esquerda */}
        <div className="flex items-center gap-1.5 text-blue-700 min-w-0 truncate">
          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          <span className="uppercase tracking-wider truncate">
            ← Secção Esquerda (N1 a N{numLevels})
          </span>
        </div>

        {/* Eixo Central / Referência Oficial */}
        <div className="flex items-center gap-1 text-slate-500 shrink-0 font-extrabold uppercase tracking-widest text-[9px] bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
          <span>Vista Traseira do Pulverizador</span>
        </div>

        {/* Secção Direita */}
        <div className="flex items-center justify-end gap-1.5 text-emerald-700 min-w-0 truncate">
          <span className="uppercase tracking-wider truncate">
            Secção Direita (N{numLevels + 1} a N{totalNozzles}) →
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
        </div>
      </div>

      {/* Estrutura Visual da Barra Horizontal com Nós de Bicos */}
      <div className="relative w-full flex items-center justify-between gap-1 sm:gap-2 pt-1 pb-2 overflow-x-auto no-scrollbar">
        {/* ================================================================ */}
        {/* SECÇÃO ESQUERDA DA BARRA (N1 A Nx)                               */}
        {/* ================================================================ */}
        <div className="flex-1 flex items-center justify-between relative min-w-[140px]">
          {/* Viga Estrutural da Barra (Dupla Linha de Treliça) */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-slate-300 rounded-full z-0 border border-slate-400/50" />
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />

          {leftNozzles.map((item) => {
            const isActive = item.slot?.isActive ?? true;
            const hasMeasured = item.slot?.measuredFlowRate !== null && item.slot?.measuredFlowRate !== undefined;
            const isConforming = item.evaluation?.isConforming ?? false;
            const isFocused = activeSlotKey === item.slotKey;
            const colorInfo = getSlotColorInfo(item.slot);

            return (
              <button
                key={item.slotKey}
                type="button"
                onClick={() => onSelectNozzle(item.slotKey)}
                title={`Bico ${item.displayLabel} (Secção Esquerda)\nBico: ${colorInfo.name}\nDébito: ${
                  hasMeasured ? `${item.slot?.measuredFlowRate} l/min` : 'Pendente'
                }${item.evaluation?.deviationPercent !== null ? ` (Desvio: ${item.evaluation?.deviationPercent}%)` : ''}`}
                className={`relative z-10 flex flex-col items-center justify-center transition-all duration-200 outline-none group cursor-pointer ${
                  isFocused ? 'scale-125 z-20' : 'hover:scale-115'
                }`}
              >
                {/* Sinalizador Ativo: Ponteiro Indicador Superior */}
                {isFocused && (
                  <span className="absolute -top-3 text-[8px] text-blue-600 font-black animate-bounce leading-none">
                    ▼
                  </span>
                )}

                {/* Nó Circular do Bico */}
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-black border transition-all shadow-2xs ${
                    isFocused
                      ? 'ring-2 ring-blue-600 ring-offset-1 ring-offset-white'
                      : ''
                  } ${
                    !isActive
                      ? 'bg-slate-200 border-slate-400 text-slate-400 opacity-60'
                      : hasMeasured
                      ? isConforming
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                        : 'bg-rose-600 border-rose-700 text-white shadow-xs'
                      : 'bg-white text-slate-800'
                  }`}
                  style={
                    isActive && !hasMeasured
                      ? {
                          borderColor: colorInfo.hex,
                          borderWidth: '2px'
                        }
                      : undefined
                  }
                >
                  {item.index}
                </span>

                {/* Ilustração Subtil da Cor do Bico Abaixo */}
                <span
                  className="w-1.5 h-1.5 rounded-full mt-0.5 border border-black/10 shrink-0"
                  style={{ backgroundColor: colorInfo.hex }}
                />
              </button>
            );
          })}
        </div>

        {/* ================================================================ */}
        {/* SILHUETA DO CHASSIS / PULVERIZADOR CENTRAL                       */}
        {/* ================================================================ */}
        <div className="shrink-0 px-2 sm:px-3 flex flex-col items-center justify-center z-10">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-800 text-white rounded-xl flex flex-col items-center justify-center shadow-xs border border-slate-700">
            {/* Ícone estilizado do trator/depósito visto de trás */}
            <div className="w-3.5 h-2 bg-amber-400 rounded-t-xs mb-0.5 shadow-2xs" />
            <div className="w-5 h-2.5 bg-slate-600 rounded-sm flex items-center justify-between px-0.5">
              <span className="w-1 h-1.5 bg-slate-900 rounded-xs" />
              <span className="w-1 h-1.5 bg-slate-900 rounded-xs" />
            </div>
          </div>
          <span className="text-[7.5px] font-black uppercase tracking-tight text-slate-500 mt-0.5 select-none">
            Centro
          </span>
        </div>

        {/* ================================================================ */}
        {/* SECÇÃO DIREITA DA BARRA (Nx+1 A N2x)                             */}
        {/* ================================================================ */}
        <div className="flex-1 flex items-center justify-between relative min-w-[140px]">
          {/* Viga Estrutural da Barra (Dupla Linha de Treliça) */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-slate-300 rounded-full z-0 border border-slate-400/50" />
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />

          {rightNozzles.map((item) => {
            const isActive = item.slot?.isActive ?? true;
            const hasMeasured = item.slot?.measuredFlowRate !== null && item.slot?.measuredFlowRate !== undefined;
            const isConforming = item.evaluation?.isConforming ?? false;
            const isFocused = activeSlotKey === item.slotKey;
            const colorInfo = getSlotColorInfo(item.slot);

            return (
              <button
                key={item.slotKey}
                type="button"
                onClick={() => onSelectNozzle(item.slotKey)}
                title={`Bico ${item.displayLabel} (Secção Direita)\nBico: ${colorInfo.name}\nDébito: ${
                  hasMeasured ? `${item.slot?.measuredFlowRate} l/min` : 'Pendente'
                }${item.evaluation?.deviationPercent !== null ? ` (Desvio: ${item.evaluation?.deviationPercent}%)` : ''}`}
                className={`relative z-10 flex flex-col items-center justify-center transition-all duration-200 outline-none group cursor-pointer ${
                  isFocused ? 'scale-125 z-20' : 'hover:scale-115'
                }`}
              >
                {/* Sinalizador Ativo: Ponteiro Indicador Superior */}
                {isFocused && (
                  <span className="absolute -top-3 text-[8px] text-blue-600 font-black animate-bounce leading-none">
                    ▼
                  </span>
                )}

                {/* Nó Circular do Bico */}
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-black border transition-all shadow-2xs ${
                    isFocused
                      ? 'ring-2 ring-blue-600 ring-offset-1 ring-offset-white'
                      : ''
                  } ${
                    !isActive
                      ? 'bg-slate-200 border-slate-400 text-slate-400 opacity-60'
                      : hasMeasured
                      ? isConforming
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                        : 'bg-rose-600 border-rose-700 text-white shadow-xs'
                      : 'bg-white text-slate-800'
                  }`}
                  style={
                    isActive && !hasMeasured
                      ? {
                          borderColor: colorInfo.hex,
                          borderWidth: '2px'
                        }
                      : undefined
                  }
                >
                  {item.index}
                </span>

                {/* Ilustração Subtil da Cor do Bico Abaixo */}
                <span
                  className="w-1.5 h-1.5 rounded-full mt-0.5 border border-black/10 shrink-0"
                  style={{ backgroundColor: colorInfo.hex }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda Dinâmica e Rápida do Minimapa */}
      <div className="flex flex-wrap items-center justify-between text-[9px] pt-1.5 border-t border-slate-200/60 text-slate-500 gap-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span className="font-semibold text-slate-600">Medido Conforme (≤ ±10%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span className="font-semibold text-slate-600">Não Conforme (&gt; 10%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block" />
            <span className="font-semibold text-slate-600">Pendente</span>
          </div>
        </div>

        <span className="italic text-slate-400 text-[8.5px]">
          Toque em qualquer bico para focar na grelha
        </span>
      </div>
    </div>
  );
};

export default SmartDebitoBoomMinimap;
