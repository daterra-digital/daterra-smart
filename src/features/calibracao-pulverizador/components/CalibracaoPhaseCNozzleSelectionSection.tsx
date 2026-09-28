/**
 * DATERRA Smart - Fase C: Seleção de Bicos e Pressão de Trabalho
 * Ficheiro: src/features/calibracao-pulverizador/components/CalibracaoPhaseCNozzleSelectionSection.tsx
 * 
 * Orquestrador da Fase C para calc_calibracao_pulverizador
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { NozzleCatalogEntry } from '../data/nozzleCatalog.ts';
import {
  NOZZLE_CATALOG_DATABASE,
  getAvailableManufacturers
} from '../data/nozzleCatalog.ts';
import type { NozzleSelectionFilters } from '../calibracaoPulverizadorTypes.ts';
import {
  calculateRequiredOutputPerSideLMin,
  calculateTargetOutputForLevel,
  isProfileComplete,
  calculateWorkingPressureForProfile
} from '../nozzleSelectionEngine.ts';
import { OutputDistributionProfileEditor } from './OutputDistributionProfileEditor.tsx';
import { NozzleOptionList } from './NozzleOptionList.tsx';
import { FinalSprayProfileCard } from './FinalSprayProfileCard.tsx';

export interface CalibracaoPhaseCNozzleSelectionSectionProps {
  phaseAVolume?: number;
  travelSpeedKmH?: number;
  workingWidthM?: number;
  activeNozzleCount?: number | string;
  totalFlowRequiredLMin?: number;
  flowPerNozzleLMin?: number;
  onNozzleCountChange?: (count: number) => void;
  isDesktop?: boolean;
}

export const CalibracaoPhaseCNozzleSelectionSection: React.FC<CalibracaoPhaseCNozzleSelectionSectionProps> = ({
  phaseAVolume,
  travelSpeedKmH,
  workingWidthM,
  totalFlowRequiredLMin,
  onNozzleCountChange,
  isDesktop
}) => {
  const { t } = useLanguage();

  const requiredTotalOutput = totalFlowRequiredLMin && totalFlowRequiredLMin > 0 ? totalFlowRequiredLMin : 0;
  const requiredOutputPerSide = calculateRequiredOutputPerSideLMin(requiredTotalOutput) || 0;

  // 1. Estado dos Filtros (Fabricantes e Tipo)
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [isMfgDropdownOpen, setIsMfgDropdownOpen] = useState<boolean>(false);
  const mfgDropdownRef = useRef<HTMLDivElement>(null);

  const [familyPreference, setFamilyPreference] = useState<'hollow-cone' | 'full-cone' | 'all'>('hollow-cone');
  const [distributionMode, setDistributionMode] = useState<'uniform' | 'custom'>('uniform');

  // 2. Estado de Níveis e Bicos (Fonte única para níveis planeados)
  const [plannedLevels, setPlannedLevels] = useState<number>(3); // 3 níveis = 6 bicos por defeito
  const [uniformSelectedNozzle, setUniformSelectedNozzle] = useState<NozzleCatalogEntry | null>(null);

  // 3. Estado do Modo Combinação de Bicos (Topo para a Base)
  const [customConfirmedNozzles, setCustomConfirmedNozzles] = useState<(NozzleCatalogEntry | null)[]>(() =>
    Array(3).fill(null)
  );

  // 4. Estado do Seletor Modal de Bicos
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerLevelIndex, setPickerLevelIndex] = useState<number | null>(null); // null = global/uniform

  const filters: NozzleSelectionFilters = useMemo(
    () => ({
      manufacturers: selectedManufacturers,
      familyPreference
    }),
    [selectedManufacturers, familyPreference]
  );

  const availableManufacturers = useMemo(() => getAvailableManufacturers(), []);

  // Fechar dropdown de fabricantes ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mfgDropdownRef.current && !mfgDropdownRef.current.contains(event.target as Node)) {
        setIsMfgDropdownOpen(false);
      }
    };
    if (isMfgDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMfgDropdownOpen]);

  const lastReportedCountRef = useRef<number | null>(null);

  // Sincronizar número de bicos ativos com o componente pai (UniversalCalculatorTemplate)
  useEffect(() => {
    const targetCount =
      distributionMode === 'uniform'
        ? plannedLevels * 2
        : customConfirmedNozzles.filter((n): n is NozzleCatalogEntry => n !== null).length * 2;

    if (lastReportedCountRef.current !== targetCount) {
      lastReportedCountRef.current = targetCount;
      onNozzleCountChange?.(targetCount);
    }
  }, [distributionMode, plannedLevels, customConfirmedNozzles, onNozzleCountChange]);

  // 5. Cálculo Dinâmico da Pressão de Trabalho Resultante (Apenas com Perfil Completo)
  const workingPressureBar = useMemo(() => {
    if (requiredOutputPerSide <= 0 || plannedLevels <= 0) return null;

    if (distributionMode === 'uniform') {
      if (!uniformSelectedNozzle) return null;
      const nozzlesForSide = Array(plannedLevels).fill({
        referenceOutputLMin: uniformSelectedNozzle.nominalOutputLMin,
        referencePressureBar: uniformSelectedNozzle.referencePressureBar || uniformSelectedNozzle.pressureBar
      });
      return calculateWorkingPressureForProfile(requiredOutputPerSide, plannedLevels, nozzlesForSide);
    } else {
      // Modo Combinação de Bicos: só calcula se todos os níveis planeados tiverem bico selecionado
      if (!isProfileComplete(plannedLevels, customConfirmedNozzles)) {
        return null;
      }

      const nozzlesForSide = customConfirmedNozzles.map((n) => ({
        referenceOutputLMin: n!.nominalOutputLMin,
        referencePressureBar: n!.referencePressureBar || n!.pressureBar
      }));

      return calculateWorkingPressureForProfile(requiredOutputPerSide, plannedLevels, nozzlesForSide);
    }
  }, [requiredOutputPerSide, distributionMode, uniformSelectedNozzle, plannedLevels, customConfirmedNozzles]);

  // 6. Gestão de Modos (Transições Limpas — Limpa seleções e estado de pressão, mantém filtros e contexto)
  const handleModeChange = (mode: 'uniform' | 'custom') => {
    setDistributionMode(mode);
    setUniformSelectedNozzle(null);
    setCustomConfirmedNozzles(Array(plannedLevels).fill(null));
  };

  const handlePlannedLevelsChange = (levels: number) => {
    setPlannedLevels(levels);
    setCustomConfirmedNozzles((prev) => {
      const next = Array(levels).fill(null);
      for (let i = 0; i < Math.min(prev.length, levels); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  };

  const handleToggleManufacturer = (brandName: string) => {
    setSelectedManufacturers((prev) => {
      if (prev.includes(brandName)) {
        return prev.filter((b) => b !== brandName);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, brandName];
    });
  };

  // 7. Ações de Combinação de Bicos
  const handleAddCustomLevel = useCallback(() => {
    if (plannedLevels >= 6) return;
    const newLevels = plannedLevels + 1;
    setPlannedLevels(newLevels);
    setCustomConfirmedNozzles((prev) => [...prev, null]);
    setPickerLevelIndex(plannedLevels);
    setIsPickerOpen(true);
  }, [plannedLevels]);

  const handleOpenCustomLevelPicker = useCallback((levelIndex: number) => {
    setPickerLevelIndex(levelIndex);
    setIsPickerOpen(true);
  }, []);

  const handleRemoveCustomLevel = useCallback((levelIndex: number) => {
    if (plannedLevels <= 2) return;
    const newLevels = plannedLevels - 1;
    setPlannedLevels(newLevels);
    setCustomConfirmedNozzles((prev) => prev.filter((_, idx) => idx !== levelIndex));
  }, [plannedLevels]);

  // 8. Ações de Bicos Iguais
  const handleOpenUniformNozzlePicker = useCallback(() => {
    setPickerLevelIndex(null);
    setIsPickerOpen(true);
  }, []);

  // 9. Confirmação de Seleção no Modal Picker
  const handleSelectNozzleFromPicker = useCallback((entry: NozzleCatalogEntry) => {
    if (pickerLevelIndex === null) {
      // Modo uniforme
      setUniformSelectedNozzle(entry);
    } else {
      // Nível específico do modo combinação
      setCustomConfirmedNozzles((prev) => {
        const next = [...prev];
        next[pickerLevelIndex] = entry;
        return next;
      });
    }
  }, [pickerLevelIndex]);

  // Alvo de débito estável para o seletor modal: Débito por lado / níveis planeados
  const pickerTargetOutput = useMemo(() => {
    return calculateTargetOutputForLevel(requiredOutputPerSide, plannedLevels) || (requiredOutputPerSide / plannedLevels);
  }, [requiredOutputPerSide, plannedLevels]);

  const currentSelectedId =
    pickerLevelIndex === null
      ? uniformSelectedNozzle?.id
      : customConfirmedNozzles[pickerLevelIndex]?.id;

  // Se não houver débito total da Fase B
  if (!requiredTotalOutput || requiredTotalOutput <= 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-soft space-y-6 my-6">
      {/* 1. Cabeçalho da Fase C */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1D734B] mb-1">
          <Layers className="w-4 h-4" aria-hidden="true" />
          <span>{t('calibracaoPulverizador.phaseC.phaseBadge', 'FASE C · SELEÇÃO DE BICOS')}</span>
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          {t('calibracaoPulverizador.phaseC.title', 'Fase C — Seleção de bicos e pressão de trabalho')}
        </h2>
      </div>

      {/* 2. Filtros Compactos de Fabricantes e Tipo de Bico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80">
        {/* Dropdown Multiselect de Fabricantes */}
        <div className="space-y-1 relative" ref={mfgDropdownRef}>
          <label className="block text-[11px] font-bold text-slate-700">
            {t('calibracaoPulverizador.phaseC.manufacturersFilterLabel', 'Fabricantes')}
          </label>

          <button
            type="button"
            onClick={() => setIsMfgDropdownOpen((prev) => !prev)}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 flex items-center justify-between hover:border-[#114037] transition-all cursor-pointer shadow-2xs touch-target"
            aria-expanded={isMfgDropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="truncate">
              {selectedManufacturers.length === 0
                ? t('calibracaoPulverizador.phaseC.selectManufacturersPlaceholder', 'Selecionar fabricantes')
                : `${selectedManufacturers.length} ${t('calibracaoPulverizador.phaseC.manufacturersSelectedText', 'fabricantes selecionados')}`}
            </span>
            {isMfgDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            )}
          </button>

          {/* Menu Dropdown Suspenso */}
          {isMfgDropdownOpen && (
            <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-2 animate-fade-in max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-1.5">
                <span>{selectedManufacturers.length}/3 {t('calibracaoPulverizador.phaseC.selectedCount', 'selecionados')}</span>
                {selectedManufacturers.length >= 3 && (
                  <span className="text-amber-700 font-medium">
                    {t('calibracaoPulverizador.phaseC.maxManufacturersReached', 'Máximo de 3 fabricantes.')}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {availableManufacturers.map((mfg) => {
                  const isSelected = selectedManufacturers.includes(mfg.name);
                  const isMaxReached = selectedManufacturers.length >= 3 && !isSelected;
                  const isDisabled = !mfg.hasData || isMaxReached;

                  return (
                    <label
                      key={mfg.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        !mfg.hasData
                          ? 'opacity-50 cursor-not-allowed bg-slate-50'
                          : isMaxReached
                          ? 'opacity-60 cursor-not-allowed bg-slate-50'
                          : isSelected
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => handleToggleManufacturer(mfg.name)}
                          className="w-4 h-4 rounded text-[#114037] focus:ring-[#114037] cursor-pointer"
                        />
                        <span>{mfg.name}</span>
                      </div>

                      {!mfg.hasData && (
                        <span className="text-[10px] font-normal text-slate-400 italic">
                          ({t('calibracaoPulverizador.phaseC.inPreparation', 'Em preparação')})
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMfgDropdownOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#114037] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t('calibracaoPulverizador.phaseC.doneButton', 'Concluído')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown de Tipo de Bico */}
        <div className="space-y-1">
          <label htmlFor="select-nozzle-family" className="block text-[11px] font-bold text-slate-700">
            {t('calibracaoPulverizador.phaseC.nozzleTypeLabel', 'Tipo de Bico')}
          </label>

          <select
            id="select-nozzle-family"
            value={familyPreference}
            onChange={(e) => setFamilyPreference(e.target.value as 'hollow-cone' | 'full-cone' | 'all')}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#114037] focus:border-[#114037] transition-all cursor-pointer shadow-2xs touch-target"
          >
            <option value="all">
              {t('calibracaoPulverizador.phaseC.allTypes', 'Todos os tipos')}
            </option>
            <option value="hollow-cone">
              {t('calibracaoPulverizador.phaseC.hollowCone', 'Cone vazio')}
            </option>
            <option value="full-cone">
              {t('calibracaoPulverizador.phaseC.fullCone', 'Cone cheio')}
            </option>
          </select>
        </div>
      </div>

      {/* 3. Editor do Perfil de Distribuição com Cartão de Pressão e Modos */}
      <OutputDistributionProfileEditor
        requiredTotalOutputLMin={requiredTotalOutput}
        requiredOutputPerSideLMin={requiredOutputPerSide}
        distributionMode={distributionMode}
        onModeChange={handleModeChange}
        uniformActiveLevels={plannedLevels}
        onUniformActiveLevelsChange={handlePlannedLevelsChange}
        uniformSelectedNozzle={uniformSelectedNozzle}
        onOpenUniformNozzlePicker={handleOpenUniformNozzlePicker}
        customConfirmedNozzles={customConfirmedNozzles}
        onAddCustomLevel={handleAddCustomLevel}
        onOpenCustomLevelPicker={handleOpenCustomLevelPicker}
        onRemoveCustomLevel={handleRemoveCustomLevel}
        workingPressureBar={workingPressureBar}
        isDesktop={isDesktop}
      />

      {/* 4. Seletor Modal / Bottom-Sheet de Bicos */}
      <NozzleOptionList
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        levelIndex={pickerLevelIndex}
        totalLevels={plannedLevels}
        targetOutputLMin={pickerTargetOutput}
        workingPressureBar={workingPressureBar}
        catalog={NOZZLE_CATALOG_DATABASE}
        filters={filters}
        selectedNozzleId={currentSelectedId}
        onSelectNozzle={handleSelectNozzleFromPicker}
        isDesktop={isDesktop}
      />

      {/* 5. Perfil Final de Pulverização Sugerido */}
      <FinalSprayProfileCard
        volumeCaldaLHa={phaseAVolume}
        travelSpeedKmH={travelSpeedKmH}
        workingWidthM={workingWidthM}
        workingPressureBar={workingPressureBar}
        requiredTotalOutputLMin={requiredTotalOutput}
        distributionMode={distributionMode}
        uniformActiveLevels={plannedLevels}
        uniformSelectedNozzle={uniformSelectedNozzle}
        customConfirmedNozzles={customConfirmedNozzles}
        isDesktop={isDesktop}
      />
    </div>
  );
};

