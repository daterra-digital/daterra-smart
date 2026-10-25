import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, AlertCircle, ChevronDown } from 'lucide-react';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import { NOZZLES_DATABASE } from '../../../nozzle-comparison/nozzleComparison.data.ts';
import { formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { findEquivalenceAlternatives } from '../services/alternativasEngine.ts';
import { AlternativaEquivalenteCard } from './AlternativaEquivalenteCard.tsx';
import { AlternativasRefNozzleCard } from './AlternativasRefNozzleCard.tsx';
import { AlternativasBrandFilter } from './AlternativasBrandFilter.tsx';
import { AlternativasHabitualPressureControl } from './AlternativasHabitualPressureControl.tsx';

export interface ModoAlternativasReferenciaViewProps {
  refNozzle?: Nozzle;
  habitualPressureBar: number;
  onChangeHabitualPressure: (pressure: number) => void;
  onOpenKeypad: () => void;
  onEditRefNozzle: () => void;
  onSelectForComparison: (nozzleId: string, pressureBar: number) => void;
}

export const ModoAlternativasReferenciaView: React.FC<ModoAlternativasReferenciaViewProps> = ({
  refNozzle,
  habitualPressureBar,
  onChangeHabitualPressure,
  onOpenKeypad,
  onEditRefNozzle,
  onSelectForComparison
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('Todos');

  // Inicializar com 3 linhas (3 bicos em mobile ou 6 bicos em desktop de 2 colunas)
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 6;
  });

  const brands = useMemo(() => {
    const set = new Set<string>();
    NOZZLES_DATABASE.forEach((n) => { if (n.brand) set.add(n.brand); });
    return ['Todos', ...Array.from(set)];
  }, []);

  const { targetFlowLMin, matches } = useMemo(() => {
    return findEquivalenceAlternatives(refNozzle, habitualPressureBar, selectedBrand);
  }, [refNozzle, habitualPressureBar, selectedBrand]);

  // Reiniciar a paginação quando mudam os filtros ou o bico de referência
  useEffect(() => {
    const initial = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 6;
    setVisibleCount(initial);
  }, [selectedBrand, refNozzle?.id, habitualPressureBar]);

  const handleLoadMore = () => {
    const step = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 6;
    setVisibleCount((prev) => prev + step);
  };

  const displayedMatches = matches.slice(0, visibleCount);

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* 1. Painel: Bico de Referência & Pressão */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
              Configuração de Referência
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              O Seu Bico & Pressão de Trabalho Atual
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#3CA64C]" />
            Equivalência de Caudal
          </span>
        </div>

        {/* Cartão do Bico de Referência */}
        <AlternativasRefNozzleCard refNozzle={refNozzle} onEditRefNozzle={onEditRefNozzle} />

        {/* Controlo de Pressão Habitual & Débito Apurado */}
        <AlternativasHabitualPressureControl
          habitualPressureBar={habitualPressureBar}
          targetFlowLMin={targetFlowLMin}
          onChangeHabitualPressure={onChangeHabitualPressure}
          onOpenKeypad={onOpenKeypad}
        />
      </div>

      {/* 2. Filtro de Marca & Lista de Bicos Equivalentes */}
      <div className="space-y-3">
        {/* Texto Centrado Informativo com Tolerância */}
        <div className="text-center py-1">
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            Foram encontradas <strong className="text-[#114037]">{matches.length}</strong> alternativas com débito equivalente a <strong className="font-mono text-[#114037]">{formatPt(targetFlowLMin)} L/min</strong> (tolerância ±10%)
          </span>
        </div>

        {/* Botões de Marcas Alinhados à Esquerda sem Barra de Scroll */}
        <AlternativasBrandFilter
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
        />

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Sem modelos equivalentes na pressão atual</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tente ajustar a pressão habitual ou escolher outro bico de referência para explorar calibres diferentes.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedMatches.map((m) => (
                <AlternativaEquivalenteCard
                  key={m.nozzle.id}
                  match={m}
                  onSelectForComparison={onSelectForComparison}
                />
              ))}
            </div>

            {/* Botão de Expansão Progressiva (Mostrar mais bicos) */}
            {matches.length > visibleCount && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="min-h-[48px] px-6 py-2.5 bg-white hover:bg-emerald-50 text-[#114037] border-2 border-[#114037]/30 hover:border-[#114037] rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                >
                  <span>Mostrar mais bicos (+{matches.length - visibleCount})</span>
                  <ChevronDown className="w-4 h-4 text-[#3CA64C]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
