import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Calculator, Sparkles, AlertCircle } from 'lucide-react';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types';
import { NOZZLES_DATABASE } from '../../../nozzle-comparison/nozzleComparison.data';
import { getNozzleColorPresentation, formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations';

export interface ModoAlternativasViewProps {
  onSelectForComparison: (nozzleId: string, pressureBar: number) => void;
  onOpenTargetFlowKeypad: () => void;
  targetFlowLMin: number;
}

export const ModoAlternativasView: React.FC<ModoAlternativasViewProps> = ({
  onSelectForComparison,
  onOpenTargetFlowKeypad,
  targetFlowLMin
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('TODAS');

  const brands = useMemo(() => {
    const set = new Set<string>();
    (NOZZLES_DATABASE as Nozzle[]).forEach((n: Nozzle) => { if (n.brand) set.add(n.brand); });
    return ['TODAS', ...Array.from(set)];
  }, []);

  // Procura de bicos cuja janela de pressão suporta o débito pretendido
  const matches = useMemo(() => {
    if (!targetFlowLMin || targetFlowLMin <= 0) return [];
    return (NOZZLES_DATABASE as Nozzle[]).map((nozzle: Nozzle) => {
      const pNom = nozzle.referencePressureBar || 3.0;
      const qNom = nozzle.nominalFlowLMin || 0.8;
      if (qNom <= 0) return null;

      // P_req = P_nom * (q_alvo / q_nom)^2
      const requiredPressure = pNom * Math.pow(targetFlowLMin / qNom, 2);
      const minP = nozzle.pressureMinBar ?? 1.5;
      const maxP = nozzle.pressureMaxBar ?? 20.0;
      const isWithinWindow = requiredPressure >= minP && requiredPressure <= maxP;

      return {
        nozzle,
        requiredPressure: Number(requiredPressure.toFixed(1)),
        minP,
        maxP,
        isWithinWindow,
        deviationBar: Math.abs(requiredPressure - pNom)
      };
    })
      .filter((item): item is NonNullable<typeof item> => item !== null && item.isWithinWindow)
      .filter((item) => selectedBrand === 'TODAS' || item.nozzle.brand === selectedBrand)
      .sort((a, b) => a.deviationBar - b.deviationBar)
      .slice(0, 12);
  }, [targetFlowLMin, selectedBrand]);

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* 1. Painel de Definição do Débito Alvo */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
              Pesquisa Inversa por Débito
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Encontrar Bicos Alternativos
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenTargetFlowKeypad}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Calculator className="w-3.5 h-3.5 text-daterra-accent" />
            <span>Ajustar Débito</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div
            onClick={onOpenTargetFlowKeypad}
            className="w-full sm:w-auto flex-1 min-h-[48px] py-2 px-4 rounded-2xl bg-[#114037]/5 hover:bg-[#114037]/10 border-2 border-dashed border-[#114037]/25 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#114037]" />
              <span className="text-xs font-bold text-slate-600">Débito Alvo Pretendido:</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-[#114037]">{formatPt(targetFlowLMin)}</span>
              <span className="text-xs font-black text-[#114037]">L/min</span>
            </div>
          </div>

          {/* Filtro de Marca */}
          <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBrand(b)}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedBrand === b ? 'bg-[#114037] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Lista de Bicos Compatíveis */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500">
            {matches.length} modelos operam a {formatPt(targetFlowLMin)} L/min na sua gama recomendada
          </span>
          <span className="text-[11px] font-bold text-[#3CA64C] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Compatibilidade Hidráulica
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Nenhum modelo encontrado para {formatPt(targetFlowLMin)} L/min</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tente ajustar o débito alvo pretendido para valores mais comuns na calibração agrícola (ex: entre 0,40 e 3,20 L/min).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matches.map(({ nozzle, requiredPressure, minP, maxP }) => {
              const pres = getNozzleColorPresentation(nozzle);
              return (
                <div
                  key={nozzle.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${pres.hex}18`, borderColor: pres.hex }}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: pres.hex }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {nozzle.brand} {nozzle.model}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-[#114037] font-bold">
                          {formatPt(requiredPressure)} bar
                        </span>
                        <span>·</span>
                        <span className="text-slate-400">Gama: {minP}–{maxP} bar</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectForComparison(nozzle.id, requiredPressure)}
                    className="min-h-[44px] px-3 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <span>Comparar</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#3CA64C]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
