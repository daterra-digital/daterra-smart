/**
 * DATERRA Smart - Componente de Célula de Bico / Slot
 * Ficheiro: src/features/smart-debito/components/SmartDebitoCell.tsx
 *
 * Célula ultra-compacta para configuração e introdução de débito medido.
 * Integra seleção em cascata (Marca -> Modelo -> Cor do Bico OU Difusor + Disco / Pastilha)
 * da base de dados oficial DATERRA Smart, e tratamento robusto do separador decimal (vírgula).
 *
 * REGRAS ESTRITAS: Termos interditos excluídos. Na UI utiliza estritamente "débito".
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Power,
  Copy,
  Layers,
  ChevronDown
} from 'lucide-react';

import type {
  NozzleSlot,
  NozzleSlotEvaluation,
  NozzleCatalogRef,
  FlowMeasurementUnit
} from '../types';
import { convertRawToLMin, convertLMinToRaw } from '../types';
import type { Nozzle, AdaptiveNozzleCategory } from '../../nozzle-comparison/nozzleComparison.types';
import {
  AVAILABLE_BRANDS,
  getGroupedModelsForBrand,
  getVariantsForModel
} from '../../nozzle-comparison/nozzleComparison.data';
import {
  formatPt,
  sortNozzlesByNominalFlow,
  getNozzleColorPresentation
} from '../../nozzle-comparison/nozzleComparison.calculations';

interface SmartDebitoCellProps {
  slot: NozzleSlot;
  evaluation: NozzleSlotEvaluation;
  displayLabel?: string;
  isFocused?: boolean;
  onFocus?: () => void;
  onUpdate: (updates: Partial<Omit<NozzleSlot, 'id' | 'level' | 'side'>>) => void;
  onToggleActive: () => void;
  onApplyToAll: (nozzle: NozzleCatalogRef) => void;
  onCopyPrevious: () => void;
  onUpdateUnit?: (unit: FlowMeasurementUnit) => void;
  onApplyUnitToAll?: (unit: FlowMeasurementUnit) => void;
  onEnterNext?: () => void;
}

export const SmartDebitoCell: React.FC<SmartDebitoCellProps> = ({
  slot,
  evaluation,
  displayLabel,
  isFocused = false,
  onFocus,
  onUpdate,
  onToggleActive,
  onApplyToAll,
  onCopyPrevious,
  onUpdateUnit,
  onApplyUnitToAll,
  onEnterNext
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const isLeft = slot.side === 'left';
  const colorMenuRef = useRef<HTMLDivElement>(null);

  // Estados locais para a cascata de seleção do bico
  const [selectedBrand, setSelectedBrand] = useState<string>(slot.brand || 'Albuz');
  const [selectedModel, setSelectedModel] = useState<string>(slot.model || 'ATR');
  const [selectedSwirlPlate, setSelectedSwirlPlate] = useState<string>(slot.swirlPlate || '');
  const [selectedDisc, setSelectedDisc] = useState<string>(slot.disc || '');
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  // Sincronizar quando o slot muda externamente (ex: aplicar a todos os bicos ou copiar anterior)
  useEffect(() => {
    setSelectedBrand(slot.brand || 'Albuz');
    setSelectedModel(slot.model || 'ATR');
    setSelectedSwirlPlate(slot.swirlPlate || '');
    setSelectedDisc(slot.disc || '');
  }, [slot.brand, slot.model, slot.swirlPlate, slot.disc]);

  // Fechar menu de cores ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setIsColorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Modelos agrupados por família/tipo para a marca selecionada
  const groupedModels = useMemo(() => {
    return getGroupedModelsForBrand(selectedBrand);
  }, [selectedBrand]);

  // 2. Variantes de catálogo para o modelo selecionado
  const allModelVariants = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    return getVariantsForModel(selectedBrand, selectedModel);
  }, [selectedBrand, selectedModel]);

  const variants = useMemo(() => {
    if (!allModelVariants || allModelVariants.length === 0) return [];
    return [...allModelVariants].sort(sortNozzlesByNominalFlow);
  }, [allModelVariants]);

  // 3. Determinar se o modelo é modular (Difusor + Disco) ou monobloco por cor
  const adaptiveCategory: AdaptiveNozzleCategory = useMemo(() => {
    if (!selectedModel || variants.length === 0) return 'color_iso';
    const hasModular = variants.some((v) => Boolean(v.disc || v.swirlPlate));
    if (hasModular) return 'modular';
    const hasIso = variants.some((v) => v.isIsoNozzle && Boolean(v.isoCode));
    if (hasIso) return 'color_iso';
    const hasColor = variants.some((v) => Boolean(v.color));
    if (hasColor) return 'color_non_iso';
    return 'monobloc_ref';
  }, [variants, selectedModel]);

  const isModular = adaptiveCategory === 'modular' && Boolean(selectedModel);

  // Difusores disponíveis para modelos modulares
  const availableSwirlPlates = useMemo(() => {
    if (!isModular) return [];
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.swirlPlate) set.add(v.swirlPlate);
    });
    return Array.from(set).sort();
  }, [variants, isModular]);

  // Discos disponíveis para modelos modulares
  const availableDiscs = useMemo(() => {
    if (!isModular) return [];
    const set = new Set<string>();
    const subset = selectedSwirlPlate
      ? variants.filter((v) => v.swirlPlate === selectedSwirlPlate)
      : variants;
    subset.forEach((v) => {
      if (v.disc) set.add(v.disc);
    });
    return Array.from(set).sort();
  }, [variants, selectedSwirlPlate, isModular]);

  // Opções de cor ISO
  const availableIsoOptions = useMemo(() => {
    if (adaptiveCategory !== 'color_iso') return [];
    const map = new Map<string, Nozzle>();
    variants.forEach((v) => {
      const key = `${v.color || 'Sem Cor'} (ISO ${v.isoCode || 'N/D'})`;
      if (!map.has(key) || (v.isTop && !map.get(key)?.isTop)) {
        map.set(key, v);
      }
    });
    return Array.from(map.values())
      .sort(sortNozzlesByNominalFlow)
      .map((nozzle) => {
        const pres = getNozzleColorPresentation(nozzle);
        return {
          id: nozzle.id,
          label: nozzle.color || 'Sem Cor',
          color: nozzle.color,
          isoCode: nozzle.isoCode,
          nominalFlow: nozzle.nominalFlowLMin,
          refPressure: nozzle.referencePressureBar,
          nozzle,
          pres
        };
      });
  }, [variants, adaptiveCategory]);

  // Opções de cor do fabricante (Não-ISO)
  const availableNonIsoColors = useMemo(() => {
    if (adaptiveCategory !== 'color_non_iso') return [];
    const map = new Map<string, Nozzle>();
    variants.forEach((v) => {
      const key = v.color || v.modelNorm;
      if (!map.has(key) || (v.isTop && !map.get(key)?.isTop)) {
        map.set(key, v);
      }
    });
    return Array.from(map.values())
      .sort(sortNozzlesByNominalFlow)
      .map((nozzle) => {
        const pres = getNozzleColorPresentation(nozzle);
        return {
          id: nozzle.id,
          label: nozzle.color || nozzle.modelNorm,
          color: nozzle.color,
          isoCode: nozzle.isoCode,
          nominalFlow: nozzle.nominalFlowLMin,
          refPressure: nozzle.referencePressureBar,
          nozzle,
          pres
        };
      });
  }, [variants, adaptiveCategory]);

  // Bico atualmente ativo para este slot
  const currentNozzle: Nozzle | undefined = useMemo(() => {
    if (isModular) {
      return (
        variants.find(
          (v) =>
            (!selectedSwirlPlate || v.swirlPlate === selectedSwirlPlate) &&
            (!selectedDisc || v.disc === selectedDisc)
        ) || variants[0]
      );
    }
    return (
      variants.find(
        (v) =>
          v.color?.toLowerCase() === slot.color?.toLowerCase() ||
          (slot.isoCode && v.isoCode === slot.isoCode)
      ) || variants[0]
    );
  }, [variants, isModular, selectedSwirlPlate, selectedDisc, slot.color, slot.isoCode]);

  // Aplicação atómica de um bico ao slot
  const applyNozzleToSlot = (nozzle: Nozzle) => {
    const isMod = Boolean(nozzle.disc || nozzle.swirlPlate);
    const colorLabel = isMod
      ? `${nozzle.swirlPlate || ''} ${nozzle.disc || ''}`.trim() || 'Modular'
      : nozzle.color || 'Padrão';

    onUpdate({
      brand: nozzle.brand,
      model: nozzle.model,
      color: colorLabel,
      referencePressureBar: nozzle.referencePressureBar,
      nominalFlowLMin: nozzle.nominalFlowLMin,
      swirlPlate: nozzle.swirlPlate,
      disc: nozzle.disc,
      isIsoNozzle: nozzle.isIsoNozzle,
      isoCode: nozzle.isoCode
    });
  };

  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    const groups = getGroupedModelsForBrand(newBrand);
    const firstModel = groups[0]?.models[0]?.model || '';
    setSelectedModel(firstModel);

    if (firstModel) {
      const newVariants = getVariantsForModel(newBrand, firstModel);
      if (newVariants.length > 0) {
        const firstVar = newVariants[0];
        setSelectedSwirlPlate(firstVar.swirlPlate || '');
        setSelectedDisc(firstVar.disc || '');
        applyNozzleToSlot(firstVar);
      }
    }
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    const newVariants = getVariantsForModel(selectedBrand, newModel);
    if (newVariants.length > 0) {
      const firstVar = newVariants[0];
      setSelectedSwirlPlate(firstVar.swirlPlate || '');
      setSelectedDisc(firstVar.disc || '');
      applyNozzleToSlot(firstVar);
    }
  };

  const handleSwirlChange = (swirl: string) => {
    setSelectedSwirlPlate(swirl);
    const match =
      variants.find(
        (v) => v.swirlPlate === swirl && (!selectedDisc || v.disc === selectedDisc)
      ) || variants.find((v) => v.swirlPlate === swirl);
    if (match) {
      if (match.disc) setSelectedDisc(match.disc);
      applyNozzleToSlot(match);
    }
  };

  const handleDiscChange = (disc: string) => {
    setSelectedDisc(disc);
    const match =
      variants.find(
        (v) => v.disc === disc && (!selectedSwirlPlate || v.swirlPlate === selectedSwirlPlate)
      ) || variants.find((v) => v.disc === disc);
    if (match) {
      if (match.swirlPlate) setSelectedSwirlPlate(match.swirlPlate);
      applyNozzleToSlot(match);
    }
  };

  const handleNozzleSelect = (nozzle: Nozzle) => {
    setIsColorMenuOpen(false);
    applyNozzleToSlot(nozzle);
  };

  // Referência do bico atual para aplicar a todos os níveis
  const currentNozzleRef: NozzleCatalogRef = {
    brand: slot.brand,
    model: slot.model,
    color: slot.color,
    referencePressureBar: slot.referencePressureBar,
    nominalFlowLMin: slot.nominalFlowLMin,
    swirlPlate: slot.swirlPlate,
    disc: slot.disc,
    isIsoNozzle: slot.isIsoNozzle,
    isoCode: slot.isoCode
  };

  // =========================================================================
  // GESTÃO ROBUSTA DO CAMPO DE ENTRADA "MEDIDO" COM VÍRGULA DECIMAL E UNIDADES
  // =========================================================================
  const currentUnit = slot.measurementUnit || 'L/min';

  const formatRawValueForDisplay = (raw: number | null | undefined, unit: FlowMeasurementUnit): string => {
    if (raw === null || raw === undefined || isNaN(raw)) return '';
    if (unit === 'L/min') {
      return formatPt(raw, 2);
    }
    if (Number.isInteger(raw)) {
      return String(raw);
    }
    return formatPt(raw, 1);
  };

  const initialRaw =
    slot.rawMeasuredValue !== null && slot.rawMeasuredValue !== undefined
      ? slot.rawMeasuredValue
      : convertLMinToRaw(slot.measuredFlowRate, currentUnit);

  const [inputValue, setInputValue] = useState<string>(() => {
    return formatRawValueForDisplay(initialRaw, currentUnit);
  });

  // Sincronizar com atualizações externas (ex: importação de ficheiro, amostra demo ou alteração de unidade)
  useEffect(() => {
    if (slot.measuredFlowRate === null || slot.measuredFlowRate === undefined) {
      setInputValue('');
    } else {
      const rawVal =
        slot.rawMeasuredValue !== null && slot.rawMeasuredValue !== undefined
          ? slot.rawMeasuredValue
          : convertLMinToRaw(slot.measuredFlowRate, currentUnit);

      setInputValue((prev) => {
        const currentNumeric = Number.parseFloat(prev.replace(',', '.'));
        if (
          Number.isNaN(currentNumeric) ||
          Math.abs(currentNumeric - (rawVal ?? 0)) > 0.001
        ) {
          return formatRawValueForDisplay(rawVal, currentUnit);
        }
        return prev;
      });
    }
  }, [slot.measuredFlowRate, slot.rawMeasuredValue, currentUnit]);

  const handleFlowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Converter qualquer ponto digitado para vírgula
    let cleanVal = e.target.value.replace(/\./g, ',');

    // 2. Permitir apenas dígitos numéricos e vírgula
    cleanVal = cleanVal.replace(/[^0-9,]/g, '');

    // 3. Se começar diretamente com vírgula, prefixar com '0' (ex: ',8' -> '0,8')
    if (cleanVal.startsWith(',')) {
      cleanVal = '0' + cleanVal;
    }

    // 4. Garantir no máximo uma única vírgula
    const parts = cleanVal.split(',');
    if (parts.length > 2) {
      cleanVal = parts[0] + ',' + parts.slice(1).join('');
    }

    setInputValue(cleanVal);

    // 5. Se o campo estiver vazio, definir como null
    if (cleanVal === '') {
      onUpdate({ measuredFlowRate: null, rawMeasuredValue: null });
      return;
    }

    // 6. Se terminar em vírgula (ex: "1,"), aguardar o próximo dígito sem truncar
    if (cleanVal.endsWith(',')) {
      return;
    }

    // 7. Atualizar o estado do débito com o número interpretado
    const parsedRaw = Number.parseFloat(cleanVal.replace(',', '.'));
    if (!Number.isNaN(parsedRaw) && parsedRaw >= 0) {
      const lmin = convertRawToLMin(parsedRaw, currentUnit);
      onUpdate({ rawMeasuredValue: parsedRaw, measuredFlowRate: lmin });
    }
  };

  const handleFlowBlur = () => {
    if (!inputValue || inputValue.trim() === '') {
      setInputValue('');
      onUpdate({ measuredFlowRate: null, rawMeasuredValue: null });
      return;
    }

    const parsedRaw = Number.parseFloat(inputValue.replace(',', '.'));
    if (Number.isNaN(parsedRaw) || parsedRaw < 0) {
      setInputValue('');
      onUpdate({ measuredFlowRate: null, rawMeasuredValue: null });
    } else {
      const formatted = formatRawValueForDisplay(parsedRaw, currentUnit);
      setInputValue(formatted);
      const lmin = convertRawToLMin(parsedRaw, currentUnit);
      onUpdate({ rawMeasuredValue: parsedRaw, measuredFlowRate: lmin });
    }
  };

  // Tecla Enter para assumir o valor introduzido e avançar diretamente para o próximo bico
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFlowBlur();
      if (onEnterNext) {
        onEnterNext();
      }
    }
  };

  const handleUnitChange = (nextUnit: FlowMeasurementUnit) => {
    if (onUpdateUnit) {
      onUpdateUnit(nextUnit);
    } else {
      const nextRaw = slot.measuredFlowRate !== null ? convertLMinToRaw(slot.measuredFlowRate, nextUnit) : null;
      onUpdate({ measurementUnit: nextUnit, rawMeasuredValue: nextRaw });
    }
  };

  const nozzleColorPres = useMemo(() => {
    return getNozzleColorPresentation(slot.color, slot.isIsoNozzle, slot.isoCode);
  }, [slot.color, slot.isIsoNozzle, slot.isoCode]);

  return (
    <div
      id={`nozzle-cell-${slot.id}`}
      className={`rounded-xl border transition-all duration-150 p-2.5 mb-2 shadow-xs ${
        isFocused ? 'ring-2 ring-blue-500/70 shadow-sm border-blue-400 ' : ''
      }${
        !slot.isActive
          ? 'bg-slate-100/70 border-slate-200 opacity-60'
          : evaluation.status === 'conforming'
          ? 'bg-emerald-50/50 border-emerald-300'
          : evaluation.status === 'non-conforming'
          ? 'bg-rose-50/60 border-rose-300'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Cabeçalho da Célula */}
      <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
              isLeft ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {displayLabel || `N${slot.level} · ${isLeft ? 'Esq' : 'Dir'}`}
          </span>

          {/* Ilustração da Cor do Bico Selecionado */}
          <span
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border shadow-2xs shrink-0"
            style={{
              backgroundColor: nozzleColorPres.hex,
              borderColor:
                nozzleColorPres.hex.toLowerCase() === '#ffffff'
                  ? '#94a3b8'
                  : 'rgba(0,0,0,0.15)'
            }}
            title={`Cor do bico: ${nozzleColorPres.colorName || slot.color}`}
          />

          <span
            className="text-xs font-semibold text-slate-800 truncate"
            title={`${slot.brand} ${slot.model} ${slot.color}`}
          >
            {slot.brand} {slot.model} · {slot.disc ? `${slot.swirlPlate ? `D${slot.swirlPlate} ` : ''}P${slot.disc}` : slot.color}
          </span>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-1 shrink-0">
          {slot.level > 1 && slot.isActive && (
            <button
              type="button"
              onClick={onCopyPrevious}
              title="Copiar modelo do Nível anterior"
              className="p-1 text-slate-400 hover:text-daterra-primary hover:bg-slate-200/60 rounded-md transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Botão Alterar Bico com texto explícito */}
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            title="Alterar bico selecionado (Marca, modelo, cor)"
            className={`py-0.5 px-2 text-[10px] font-bold rounded-lg border flex items-center gap-1 transition-all ${
              showConfig
                ? 'bg-daterra-primary text-white border-daterra-primary shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
            }`}
          >
            <span>Alterar Bico</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Alterar Unidade para este bico + Botão Aplicar a todos os bicos */}
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-300 rounded-lg p-0.5 shadow-2xs">
            <select
              value={currentUnit}
              onChange={(e) => handleUnitChange(e.target.value as FlowMeasurementUnit)}
              title="Alterar unidade de medição para o campo input deste bico"
              className="h-5 px-1 text-[9.5px] font-extrabold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="L/min">L/min</option>
              <option value="mL/15 seg">mL/15 seg</option>
              <option value="mL/30 seg">mL/30 seg</option>
            </select>

            {onApplyUnitToAll && (
              <button
                type="button"
                onClick={() => onApplyUnitToAll(currentUnit)}
                title="Aplicar esta unidade a todos os outros bicos da máquina"
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-emerald-700 rounded transition-colors"
              >
                <Layers className="w-3 h-3 text-[#3CA64C]" />
              </button>
            )}
          </div>

          {/* Toggle Ativo/Inativo */}
          <button
            type="button"
            onClick={onToggleActive}
            title={slot.isActive ? 'Desativar / Fechar Bico' : 'Ativar Bico'}
            className={`p-1 rounded-md transition-colors ${
              slot.isActive
                ? 'text-emerald-700 hover:bg-emerald-100'
                : 'text-slate-400 hover:text-slate-600 bg-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Painel de Configuração Rápida de Bico (Dropdown expansível em cascata) */}
      {showConfig && slot.isActive && (
        <div className="my-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5 animate-fadeIn shadow-inner">
          {/* Linha 1: Marca e Modelo */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Marca
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full h-8 px-2 pr-6 bg-white border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-lg text-xs font-bold appearance-none cursor-pointer outline-none shadow-2xs"
                >
                  {AVAILABLE_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Modelo
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full h-8 px-2 pr-6 bg-white border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-lg text-xs font-bold appearance-none cursor-pointer outline-none shadow-2xs"
                >
                  {groupedModels.map((g) => (
                    <optgroup key={g.group} label={`── ${g.group} ──`} className="font-black text-slate-400">
                      {g.models.map((m) => (
                        <option key={m.model} value={m.model} className="font-bold text-slate-900">
                          {m.model} ({m.nozzleType})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Linha 2: Difusor + Disco (se modular) OU Cor do Bico (se monobloco) */}
          {isModular ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Difusor
                </label>
                <div className="relative">
                  <select
                    value={selectedSwirlPlate}
                    onChange={(e) => handleSwirlChange(e.target.value)}
                    className="w-full h-8 px-2 pr-6 bg-white border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-lg text-xs font-bold appearance-none cursor-pointer outline-none shadow-2xs"
                  >
                    <option value="">-- Difusor --</option>
                    {availableSwirlPlates.map((swirl) => (
                      <option key={swirl} value={swirl}>
                        Difusor {swirl}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Disco / Pastilha
                </label>
                <div className="relative">
                  <select
                    value={selectedDisc}
                    onChange={(e) => handleDiscChange(e.target.value)}
                    className="w-full h-8 px-2 pr-6 bg-white border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-lg text-xs font-bold appearance-none cursor-pointer outline-none shadow-2xs"
                  >
                    <option value="">-- Disco --</option>
                    {availableDiscs.map((disc) => (
                      <option key={disc} value={disc}>
                        Disco {disc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Cor do Bico
                </label>
                {slot.isIsoNozzle && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ISO {slot.isoCode}
                  </span>
                )}
              </div>

              <div className="relative" ref={colorMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                  className="w-full h-8 px-2 bg-white hover:bg-slate-50 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-lg text-xs font-bold flex items-center justify-between shadow-2xs cursor-pointer"
                >
                  {currentNozzle ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full border shadow-2xs shrink-0"
                        style={{
                          backgroundColor: getNozzleColorPresentation(currentNozzle).hex,
                          borderColor:
                            getNozzleColorPresentation(currentNozzle).hex.toLowerCase() === '#ffffff'
                              ? '#94a3b8'
                              : 'rgba(0,0,0,0.15)'
                        }}
                      />
                      <span className="font-extrabold text-slate-900 truncate">
                        {currentNozzle.color}
                        {currentNozzle.isoCode ? ` (ISO ${currentNozzle.isoCode})` : ''}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        • {formatPt(currentNozzle.nominalFlowLMin, 2)} L/min
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">-- Selecione a cor --</span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isColorMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isColorMenuOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1 space-y-0.5 animate-fadeIn">
                    {(adaptiveCategory === 'color_iso'
                      ? availableIsoOptions
                      : availableNonIsoColors
                    ).map((opt) => {
                      const isSelected =
                        currentNozzle?.id === opt.id ||
                        opt.color?.toLowerCase() === slot.color?.toLowerCase();
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleNozzleSelect(opt.nozzle)}
                          className={`w-full p-1.5 rounded-lg text-left text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-daterra-primary text-white shadow-2xs'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full border shadow-2xs shrink-0"
                              style={{
                                backgroundColor: opt.pres.hex,
                                borderColor:
                                  opt.pres.hex.toLowerCase() === '#ffffff'
                                    ? '#94a3b8'
                                    : 'rgba(0,0,0,0.1)'
                              }}
                            />
                            <span className="font-bold truncate">{opt.label}</span>
                            {opt.isoCode && (
                              <span
                                className={`text-[9px] font-mono ${
                                  isSelected ? 'text-white/80' : 'text-slate-400'
                                }`}
                              >
                                (ISO {opt.isoCode})
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-mono shrink-0 ${
                              isSelected ? 'text-white' : 'text-slate-600'
                            }`}
                          >
                            {formatPt(opt.nominalFlow, 2)} L/min
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Botão de Aplicação Geral */}
          <button
            type="button"
            onClick={() => onApplyToAll(currentNozzleRef)}
            className="w-full py-1.5 px-2 text-xs font-bold bg-white hover:bg-daterra-primary hover:text-white text-daterra-primary border border-slate-300 hover:border-daterra-primary rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-daterra-accent" />
            <span>Aplicar este bico a todos os níveis</span>
          </button>
        </div>
      )}

      {/* Linha de Débitos: Alvo Q2 vs Medido */}
      {slot.isActive ? (
        <div className="mt-2 grid grid-cols-12 gap-1.5 items-center">
          {/* Débito Alvo Teórico Q2 e Débito Medido em L/min */}
          <div className="col-span-4 bg-slate-100/90 border border-slate-200/70 rounded-lg p-1 sm:p-1.5 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-1 border-b border-slate-200/70 pb-0.5 mb-0.5">
              <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">
                Q2 Alvo:
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700">
                {evaluation.targetFlowRate !== null ? formatPt(evaluation.targetFlowRate, 2) : '--'}
                <span className="text-[7.5px] text-slate-400 font-normal ml-0.5">L/m</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[8px] uppercase tracking-wider text-slate-600 font-extrabold">
                Q2 L/min:
              </span>
              <span className="text-[11px] font-mono font-black text-[#114037]">
                {slot.measuredFlowRate !== null && slot.measuredFlowRate !== undefined
                  ? formatPt(slot.measuredFlowRate, 2)
                  : '--'}
                <span className="text-[7.5px] text-slate-400 font-normal ml-0.5">L/m</span>
              </span>
            </div>
          </div>

          {/* Campo de Entrada: Débito Medido na Unidade Atual com Suporte a Enter */}
          <div className="col-span-4">
            <label className="block text-[8.5px] uppercase tracking-wider text-slate-600 font-bold text-center mb-0.5 truncate">
              Medido ({currentUnit})
            </label>
            <div className="relative">
              <input
                id={`nozzle-input-${slot.id}`}
                type="text"
                inputMode="decimal"
                placeholder={currentUnit === 'L/min' ? '0,00' : '0'}
                value={inputValue}
                onFocus={onFocus}
                onChange={handleFlowChange}
                onBlur={handleFlowBlur}
                onKeyDown={handleKeyDown}
                className={`w-full py-1 text-center font-mono font-bold text-xs rounded-md border focus:ring-1 focus:outline-none transition-all ${
                  evaluation.status === 'conforming'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 focus:ring-emerald-500'
                    : evaluation.status === 'non-conforming'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 focus:ring-rose-500'
                    : 'border-slate-300 bg-white text-slate-900 focus:ring-daterra-accent'
                }`}
              />
            </div>
            <span className="block text-[8px] text-slate-400 text-center font-medium truncate">
              {currentUnit}
            </span>
          </div>

          {/* Badge de Desvio e Veredito Individual */}
          <div className="col-span-4 text-center">
            {evaluation.status === 'conforming' && (
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {(evaluation.deviationPercent ?? 0) > 0 ? '+' : ''}
                  {evaluation.deviationPercent}%
                </span>
                <span className="text-[8px] font-semibold text-emerald-600 mt-0.5">
                  Conforme
                </span>
              </div>
            )}

            {evaluation.status === 'non-conforming' && (
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 px-1 py-0.5 rounded">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  {(evaluation.deviationPercent ?? 0) > 0 ? '+' : ''}
                  {evaluation.deviationPercent}%
                </span>
                <span className="text-[8px] font-semibold text-rose-600 mt-0.5">
                  Não Conforme
                </span>
              </div>
            )}

            {evaluation.status === 'pending-pressure' && (
              <div className="flex flex-col items-center text-amber-600">
                <AlertCircle className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-[8px] font-medium leading-tight">Falta P2</span>
              </div>
            )}

            {evaluation.status === 'pending-measurement' && (
              <div className="text-[9px] text-slate-400 font-medium">
                Pendente
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-2 text-center text-xs font-semibold text-slate-400 italic">
          Bico Fechado / Inativo (ignorado nos ensaios)
        </div>
      )}
    </div>
  );
};

export default SmartDebitoCell;
