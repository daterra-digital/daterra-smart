/**
 * DATERRA Smart - Seletor de Bicos Minimalista (Modal / Bottom-Sheet)
 * Ficheiro: src/features/calibracao-pulverizador/components/NozzleOptionList.tsx
 * 
 * Funcionalidades:
 * - Apresenta exclusivamente: Marca · Modelo · Cor/Pastilha/Difusor e Débito estimado: X,XX L/min
 * - Ponto / Amostra de cor por bico
 * - Pesquisa rápida por nome/código/cor
 * - Áreas de toque mínimas de 48px para smartphone
 * - Sem termos de inspeção, conformidade ou tolerância ISO
 */

import React, { useState, useMemo } from 'react';
import { X, Search, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { NozzleCatalogEntry } from '../data/nozzleCatalog.ts';
import type { NozzleSelectionFilters } from '../calibracaoPulverizadorTypes.ts';
import {
  findCompatibleNozzleOptions,
  getNozzleColorHex
} from '../nozzleSelectionEngine.ts';

export interface NozzleOptionListProps {
  isOpen: boolean;
  onClose: () => void;
  levelIndex: number | null; // null se modo uniforme (global), 0..N se nível específico
  totalLevels: number;
  targetOutputLMin: number;
  workingPressureBar: number | null;
  catalog: NozzleCatalogEntry[];
  filters: NozzleSelectionFilters;
  selectedNozzleId?: string | null;
  onSelectNozzle: (entry: NozzleCatalogEntry) => void;
  isDesktop?: boolean;
}

export const NozzleOptionList: React.FC<NozzleOptionListProps> = ({
  isOpen,
  onClose,
  levelIndex,
  totalLevels,
  targetOutputLMin,
  workingPressureBar,
  catalog,
  filters,
  selectedNozzleId,
  onSelectNozzle
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const effectivePressure =
    typeof workingPressureBar === 'number' && workingPressureBar > 0 && workingPressureBar <= 30.0
      ? workingPressureBar
      : 10.0;

  // Obter opções compatíveis sem filtrar rigidamente por pressão para permitir cálculo físico da combinação
  const options = useMemo(() => {
    if (!isOpen || targetOutputLMin <= 0) return [];
    return findCompatibleNozzleOptions(
      targetOutputLMin,
      effectivePressure,
      catalog,
      filters,
      { skipPressureEligibilityFilter: true }
    );
  }, [isOpen, targetOutputLMin, effectivePressure, catalog, filters]);

  // Filtragem por termo de pesquisa
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const norm = searchTerm.toLowerCase().trim();
    return options.filter((opt) => {
      const e = opt.entry;
      return (
        e.manufacturerName.toLowerCase().includes(norm) ||
        e.model.toLowerCase().includes(norm) ||
        e.colorOrSize.toLowerCase().includes(norm)
      );
    });
  }, [options, searchTerm]);

  if (!isOpen) return null;

  const isGlobal = levelIndex === null;
  const levelNumber = levelIndex !== null ? levelIndex + 1 : null;
  const isTop = levelIndex === 0;
  const isBase = levelIndex !== null && levelIndex === totalLevels - 1 && totalLevels >= 2;

  const formatLMin = (val: number) => {
    return val.toFixed(2).replace('.', ',');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nozzle-picker-title"
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Seletor */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 id="nozzle-picker-title" className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {isGlobal
                ? t('calibracaoPulverizador.phaseC.pickerGlobalTitle', 'Selecionar Bico — Todos os Níveis')
                : `${t('calibracaoPulverizador.phaseC.pickerLevelTitle', 'Selecionar Bico')} — Nível ${levelNumber}${
                    isTop ? ' (Topo)' : isBase ? ' (Base)' : ''
                  }`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('calibracaoPulverizador.phaseC.targetFlowShort', 'Débito pretendido:')}{' '}
              <strong className="text-slate-800 font-mono-numbers">{formatLMin(targetOutputLMin)} L/min</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer flex items-center justify-center touch-target"
            aria-label={t('common.close', 'Fechar')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campo de Pesquisa Rápida */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('calibracaoPulverizador.phaseC.searchPlaceholder', 'Pesquisar modelo, cor ou marca...')}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#114037] focus:bg-white"
            />
          </div>
        </div>

        {/* Lista de Opções Minimalistas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-slate-100">
          {filteredOptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              {t('calibracaoPulverizador.phaseC.noOptionsFound', 'Nenhum bico encontrado com os filtros e pesquisa atuais.')}
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const entry = opt.entry;
              const isSelected = selectedNozzleId === entry.id;
              const colorHex = getNozzleColorHex(entry.colorOrSize);

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    onSelectNozzle(entry);
                    onClose();
                  }}
                  className={`w-full min-h-[52px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer touch-target ${
                    isSelected
                      ? 'bg-emerald-50/90 border border-emerald-300 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Amostra Circular de Cor */}
                    <div
                      className="w-4 h-4 rounded-full shrink-0 border border-black/10 shadow-2xs"
                      style={{ backgroundColor: colorHex }}
                      title={entry.colorOrSize}
                    />

                    {/* Identificação do Bico: Marca Modelo Cor */}
                    <div>
                      <div className="text-xs sm:text-sm font-black text-slate-900">
                        {entry.manufacturerName} {entry.model}{' '}
                        <span className="font-semibold text-slate-600">({entry.colorOrSize})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {entry.sourceName} · {entry.nominalOutputLMin.toFixed(2).replace('.', ',')} L/min ref
                      </div>
                    </div>
                  </div>

                  {/* Débito Estimado */}
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {t('calibracaoPulverizador.phaseC.estimatedFlowShort', 'Débito estimado:')}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono-numbers text-[#114037]">
                        {formatLMin(opt.estimatedOutputLMin)} L/min
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{filteredOptions.length} bicos compatíveis</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
          >
            {t('common.cancel', 'Cancelar')}
          </button>
        </div>
      </div>
    </div>
  );
};


