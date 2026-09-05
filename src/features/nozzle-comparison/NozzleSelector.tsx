import React from 'react';
import { ChevronDown, CheckCircle2, Check } from 'lucide-react';
import type { Nozzle, AdaptiveNozzleCategory } from './nozzleComparison.types';
import {
  AVAILABLE_BRANDS,
  getGroupedModelsForBrand,
  getVariantsForModel
} from './nozzleComparison.data';
import { formatPt, sortNozzlesByNominalFlow, getNozzleColorPresentation, formatSprayAngle } from './nozzleComparison.calculations';
import { NozzleColorBadge } from './NozzleColorBadge';

export interface NozzleSelectorProps {
  side: 'A' | 'B';
  title?: string;
  selectedBrand: string;
  selectedModel: string;
  selectedSprayAngle?: string | number;
  selectedSwirlPlate?: string;
  selectedDisc?: string;
  selectedColor?: string;
  selectedIsoCode?: string;
  selectedNozzleId: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  onSprayAngleChange?: (angle: string | number) => void;
  onSwirlPlateChange?: (swirl: string) => void;
  onDiscChange?: (disc: string) => void;
  onColorChange?: (color: string) => void;
  onIsoCodeChange?: (iso: string) => void;
  onNozzleChange: (nozzleId: string) => void;
  selectedNozzle?: Nozzle;
}

export const NozzleSelector: React.FC<NozzleSelectorProps> = ({
  side,
  title,
  selectedBrand,
  selectedModel,
  selectedSprayAngle,
  selectedSwirlPlate,
  selectedDisc,
  selectedColor: _selectedColor,
  selectedIsoCode: _selectedIsoCode,
  selectedNozzleId,
  onBrandChange,
  onModelChange,
  onSprayAngleChange,
  onSwirlPlateChange,
  onDiscChange,
  onColorChange: _onColorChange,
  onIsoCodeChange: _onIsoCodeChange,
  onNozzleChange,
  selectedNozzle
}) => {
  const displayTitle = title || (side === 'A' ? 'Bico A' : 'Bico B');
  const [isColorMenuOpen, setIsColorMenuOpen] = React.useState<boolean>(false);
  const [internalSprayAngle, setInternalSprayAngle] = React.useState<string | number>('');
  const colorMenuRef = React.useRef<HTMLDivElement>(null);

  const currentSprayAngle = selectedSprayAngle !== undefined ? selectedSprayAngle : internalSprayAngle;

  const handleAngleClick = (angle: string | number) => {
    if (String(currentSprayAngle) === String(angle)) return;
    if (onSprayAngleChange) {
      onSprayAngleChange(angle);
    } else {
      setInternalSprayAngle(angle);
    }
    if (onSwirlPlateChange) onSwirlPlateChange('');
    if (onDiscChange) onDiscChange('');
    onNozzleChange('');
  };

  // Fechar dropdown de cor ao clicar fora
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setIsColorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modelos agrupados por tipo de bico para a marca selecionada
  const groupedModels = React.useMemo(() => {
    return getGroupedModelsForBrand(selectedBrand);
  }, [selectedBrand]);

  // Lista plana de todos os modelos da marca (para auto-seleção)
  const allModels = React.useMemo(() => {
    const list: string[] = [];
    groupedModels.forEach(g => {
      g.models.forEach(m => list.push(m.model));
    });
    return list;
  }, [groupedModels]);

  // Todas as variantes do modelo
  const allModelVariants = React.useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    return getVariantsForModel(selectedBrand, selectedModel);
  }, [selectedBrand, selectedModel]);

  // Verificar se o modelo é de ângulo variável com a pressão
  const isAnglePressureVariable = React.useMemo(() => {
    return allModelVariants.some(v => v.isAnglePressureDependent || (v.sprayAngleMinDeg && v.sprayAngleMaxDeg));
  }, [allModelVariants]);

  // Ângulos nominais distintos disponíveis para este modelo (ordenados crescentemente)
  const availableSprayAngles = React.useMemo(() => {
    if (!allModelVariants || allModelVariants.length === 0 || isAnglePressureVariable) return [];
    const set = new Set<string | number>();
    allModelVariants.forEach(v => {
      if (v.sprayAngleDeg !== undefined && v.sprayAngleDeg !== null && v.sprayAngleDeg !== '' && v.sprayAngleDeg !== 'null') {
        set.add(v.sprayAngleDeg);
      }
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [allModelVariants, isAnglePressureVariable]);

  // Sincronizar seleção de ângulo com o bico selecionado externamente
  React.useEffect(() => {
    if (selectedNozzle && selectedNozzle.sprayAngleDeg !== undefined) {
      if (String(currentSprayAngle) !== String(selectedNozzle.sprayAngleDeg)) {
        if (onSprayAngleChange) onSprayAngleChange(selectedNozzle.sprayAngleDeg);
        else setInternalSprayAngle(selectedNozzle.sprayAngleDeg);
      }
    }
  }, [selectedNozzle]);

  // Auto-selecionar o primeiro ângulo válido por defeito se existirem >= 2 opções fixas
  React.useEffect(() => {
    if (availableSprayAngles.length >= 2) {
      const isCurrentValid = availableSprayAngles.some(a => String(a) === String(currentSprayAngle));
      if (!currentSprayAngle || !isCurrentValid) {
        const defaultAngle = availableSprayAngles[0];
        if (onSprayAngleChange) onSprayAngleChange(defaultAngle);
        else setInternalSprayAngle(defaultAngle);
      }
    } else if (availableSprayAngles.length === 1 && String(currentSprayAngle) !== String(availableSprayAngles[0])) {
      // Se houver apenas 1 ângulo fixo, associá-lo automaticamente
      if (onSprayAngleChange) onSprayAngleChange(availableSprayAngles[0]);
      else setInternalSprayAngle(availableSprayAngles[0]);
    }
  }, [availableSprayAngles, currentSprayAngle, onSprayAngleChange]);

  // Variantes filtradas por ângulo (quando aplicável) e ordenadas por débito nominal crescente
  const variants = React.useMemo(() => {
    if (!allModelVariants || allModelVariants.length === 0) return [];
    let filtered = allModelVariants;
    if (availableSprayAngles.length > 1 && currentSprayAngle) {
      filtered = allModelVariants.filter(v => String(v.sprayAngleDeg) === String(currentSprayAngle));
    }
    return [...filtered].sort(sortNozzlesByNominalFlow);
  }, [allModelVariants, availableSprayAngles, currentSprayAngle]);

  // Determinar a categoria adaptativa do modelo selecionado
  const adaptiveCategory: AdaptiveNozzleCategory = React.useMemo(() => {
    if (!variants || variants.length === 0) return 'monobloc_ref';

    const hasModular = variants.some(v => Boolean(v.disc || v.swirlPlate));
    if (hasModular) return 'modular';

    const hasIso = variants.some(v => v.isIsoNozzle && Boolean(v.isoCode));
    if (hasIso) return 'color_iso';

    const hasColor = variants.some(v => Boolean(v.color));
    if (hasColor) return 'color_non_iso';

    return 'monobloc_ref';
  }, [variants]);

  // Extrair difusores únicos (swirl plates) para modelos modulares
  const availableSwirlPlates = React.useMemo(() => {
    if (adaptiveCategory !== 'modular') return [];
    const set = new Set<string>();
    variants.forEach(v => {
      if (v.swirlPlate) set.add(v.swirlPlate);
    });
    return Array.from(set).sort();
  }, [variants, adaptiveCategory]);

  // Extrair discos/pastilhas disponíveis para o difusor selecionado (ou todos)
  const availableDiscs = React.useMemo(() => {
    if (adaptiveCategory !== 'modular') return [];
    const set = new Set<string>();
    const subset = selectedSwirlPlate
      ? variants.filter(v => v.swirlPlate === selectedSwirlPlate)
      : variants;
    subset.forEach(v => {
      if (v.disc) set.add(v.disc);
    });
    return Array.from(set).sort();
  }, [variants, selectedSwirlPlate, adaptiveCategory]);

  // Extrair cores / códigos ISO disponíveis — ordenados por DÉBITO NOMINAL CRESCENTE
  const availableIsoOptions = React.useMemo(() => {
    if (adaptiveCategory !== 'color_iso') return [];
    const map = new Map<string, Nozzle>();
    variants.forEach(v => {
      const key = `${v.color || 'Sem Cor'} (ISO ${v.isoCode || 'N/D'})`;
      if (!map.has(key)) map.set(key, v);
    });
    return Array.from(map.values())
      .sort(sortNozzlesByNominalFlow)
      .map(nozzle => {
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

  // Extrair cores não-ISO — ordenados por DÉBITO NOMINAL CRESCENTE
  const availableNonIsoColors = React.useMemo(() => {
    if (adaptiveCategory !== 'color_non_iso') return [];
    const map = new Map<string, Nozzle>();
    variants.forEach(v => {
      const key = v.color || v.modelNorm;
      if (!map.has(key)) map.set(key, v);
    });
    return Array.from(map.values())
      .sort(sortNozzlesByNominalFlow)
      .map(nozzle => {
        const pres = getNozzleColorPresentation(nozzle);
        return {
          id: nozzle.id,
          label: nozzle.color || nozzle.modelNorm,
          color: nozzle.color,
          nominalFlow: nozzle.nominalFlowLMin,
          refPressure: nozzle.referencePressureBar,
          nozzle,
          pres
        };
      });
  }, [variants, adaptiveCategory]);

  // Auto-seleção de modelo se houver apenas um na marca
  React.useEffect(() => {
    if (selectedBrand && allModels.length === 1 && selectedModel !== allModels[0]) {
      onModelChange(allModels[0]);
    }
  }, [selectedBrand, allModels, selectedModel, onModelChange]);

  // Auto-seleção de bico se houver apenas uma variante
  React.useEffect(() => {
    if (
      selectedBrand &&
      selectedModel &&
      (availableSprayAngles.length <= 1 || currentSprayAngle) &&
      variants.length === 1 &&
      selectedNozzleId !== variants[0].id
    ) {
      onNozzleChange(variants[0].id);
    }
  }, [selectedBrand, selectedModel, availableSprayAngles, currentSprayAngle, variants, selectedNozzleId, onNozzleChange]);

  const sideBadgeClass =
    side === 'A'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : 'bg-sky-100 text-sky-800 border-sky-300';

  // Texto estático de ângulo para casos especiais (ângulo fixo único, variável, condicionado ou ausente)
  const singleAngleInfo = React.useMemo(() => {
    if (!selectedModel || allModelVariants.length === 0) return null;
    const sample = allModelVariants[0];
    return formatSprayAngle(sample);
  }, [selectedModel, allModelVariants]);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col justify-between space-y-4 transition-all">
      {/* Cabeçalho do Seletor */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${sideBadgeClass}`}>
            {displayTitle}
          </span>
          <span className="text-xs font-bold text-slate-500">
            {selectedNozzle ? selectedNozzle.brand : 'Seleção de bico'}
          </span>
        </div>
        {selectedNozzle && (
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Selecionado</span>
          </span>
        )}
      </div>

      {/* Formulário Progressivo e Adaptativo com Touch-Targets >= 48px */}
      <div className="space-y-3.5">
        
        {/* 1. Marca */}
        <div>
          <label htmlFor={`brand-select-${side}`} className="block text-xs font-bold text-slate-700 mb-1.5">
            1. Marca / Fabricante
          </label>
          <div className="relative">
            <select
              id={`brand-select-${side}`}
              value={selectedBrand}
              onChange={e => {
                onBrandChange(e.target.value);
                if (onSprayAngleChange) onSprayAngleChange('');
                else setInternalSprayAngle('');
              }}
              aria-label={`Marca do ${displayTitle}`}
              className="w-full h-12 px-4 pr-10 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-2xl text-sm font-bold outline-none transition-all appearance-none cursor-pointer touch-target"
            >
              <option value="">-- Selecione a marca --</option>
              {AVAILABLE_BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Modelo de Bico (Dropdown Agrupada por Tipo de Bico) */}
        <div>
          <label htmlFor={`model-select-${side}`} className="block text-xs font-bold text-slate-700 mb-1.5">
            2. Modelo de Bico
          </label>
          <div className="relative">
            <select
              id={`model-select-${side}`}
              value={selectedModel}
              onChange={e => {
                onModelChange(e.target.value);
                if (onSprayAngleChange) onSprayAngleChange('');
                else setInternalSprayAngle('');
              }}
              disabled={!selectedBrand}
              aria-label={`Modelo do ${displayTitle}`}
              className={`w-full h-12 px-4 pr-10 border rounded-2xl text-sm font-bold outline-none transition-all appearance-none touch-target ${
                !selectedBrand
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-300 focus:border-daterra-primary text-slate-900 cursor-pointer'
              }`}
            >
              <option value="">
                {!selectedBrand ? 'Selecione primeiro a marca' : '-- Selecione o modelo --'}
              </option>
              {groupedModels.map(g => (
                <optgroup key={g.group} label={`── ${g.group} ──`} className="font-black text-slate-400">
                  {g.models.map(m => (
                    <option key={m.model} value={m.model} className="font-bold text-slate-900">
                      {m.model} ({m.nozzleType})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Ângulo do Jato */}
        {selectedModel && (
          <div className="pt-0.5">
            {availableSprayAngles.length >= 2 ? (
              /* Caso com 2 ou mais ângulos fixos: BOTÕES DE SELEÇÃO RÁPIDA */
              <div className="flex flex-wrap items-center gap-2 animate-fade-in">
                {availableSprayAngles.map(angle => {
                  const isSelected = String(currentSprayAngle) === String(angle);
                  return (
                    <button
                      key={String(angle)}
                      type="button"
                      onClick={() => handleAngleClick(angle)}
                      aria-pressed={isSelected}
                      aria-label={`Selecionar ângulo de jato ${angle} graus`}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold leading-normal transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#064e3b] text-white border border-[#064e3b] shadow-xs font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 active:scale-95'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                      <span>{angle}°</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Casos Especiais: 1 único ângulo fixo, variável, condicionado ou ausente */
              singleAngleInfo && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 animate-fade-in">
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 leading-normal inline-flex items-center">
                    {singleAngleInfo}
                  </span>
                </div>
              )
            )}
          </div>
        )}

        {/* CASO A: CONJUNTOS MODULARES (Difusor + Disco/Pastilha) */}
        {adaptiveCategory === 'modular' && selectedModel && (availableSprayAngles.length <= 1 || currentSprayAngle) && (
          <>
            {/* Difusor / Swirl Plate */}
            <div>
              <label htmlFor={`swirl-select-${side}`} className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>3. Difusor (Swirl Plate)</span>
                <span className="text-[10px] font-semibold text-daterra-accent bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Conjunto Modular
                </span>
              </label>
              <div className="relative">
                <select
                  id={`swirl-select-${side}`}
                  value={selectedSwirlPlate || ''}
                  onChange={e => {
                    if (onSwirlPlateChange) onSwirlPlateChange(e.target.value);
                  }}
                  aria-label={`Difusor do ${displayTitle}`}
                  className="w-full h-12 px-4 pr-10 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-2xl text-sm font-bold outline-none transition-all appearance-none cursor-pointer touch-target"
                >
                  <option value="">-- Selecione o difusor --</option>
                  {availableSwirlPlates.map(swirl => (
                    <option key={swirl} value={swirl}>
                      Difusor {swirl}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Disco / Pastilha */}
            <div>
              <label htmlFor={`disc-select-${side}`} className="block text-xs font-bold text-slate-700 mb-1.5">
                4. Disco / Pastilha
              </label>
              <div className="relative">
                <select
                  id={`disc-select-${side}`}
                  value={selectedDisc || ''}
                  onChange={e => {
                    const disc = e.target.value;
                    if (onDiscChange) onDiscChange(disc);
                    const match = variants.find(
                      v => v.disc === disc && (!selectedSwirlPlate || v.swirlPlate === selectedSwirlPlate)
                    );
                    if (match) onNozzleChange(match.id);
                  }}
                  disabled={!selectedSwirlPlate && availableSwirlPlates.length > 0}
                  aria-label={`Disco ou Pastilha do ${displayTitle}`}
                  className={`w-full h-12 px-4 pr-10 border rounded-2xl text-sm font-bold outline-none transition-all appearance-none touch-target ${
                    !selectedSwirlPlate && availableSwirlPlates.length > 0
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-300 focus:border-daterra-primary text-slate-900 cursor-pointer'
                  }`}
                >
                  <option value="">
                    {!selectedSwirlPlate && availableSwirlPlates.length > 0
                      ? 'Selecione primeiro o difusor'
                      : '-- Selecione o disco / pastilha --'}
                  </option>
                  {availableDiscs.map(disc => {
                    const sample = variants.find(
                      v => v.disc === disc && (!selectedSwirlPlate || v.swirlPlate === selectedSwirlPlate)
                    );
                    const flowHint = sample ? ` (~${formatPt(sample.nominalFlowLMin, 2)} L/min)` : '';
                    return (
                      <option key={disc} value={disc}>
                        Disco {disc}{flowHint}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </>
        )}

        {/* CASO B: BICOS COM COR E CÓDIGO ISO 10625 */}
        {adaptiveCategory === 'color_iso' && selectedModel && (availableSprayAngles.length <= 1 || currentSprayAngle) && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>3. Cor ISO</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Norma ISO 10625
              </span>
            </label>

            {/* Menu Visual de Seleção de Cor */}
            <div className="relative" ref={colorMenuRef}>
              <button
                type="button"
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                aria-haspopup="listbox"
                aria-expanded={isColorMenuOpen}
                aria-label={`Selecionar cor ISO do ${displayTitle}`}
                className="w-full h-14 px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-2xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer touch-target shadow-sm"
              >
                {selectedNozzle ? (
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="w-5 h-5 rounded-full border shadow-sm shrink-0"
                      style={{
                        backgroundColor: getNozzleColorPresentation(selectedNozzle).hex,
                        borderColor: getNozzleColorPresentation(selectedNozzle).hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'transparent'
                      }}
                    />
                    <div className="text-left leading-tight">
                      <span className="font-extrabold text-slate-900 block">
                        {selectedNozzle.color} (ISO {selectedNozzle.isoCode || 'N/D'})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers">
                        Nominal: {formatPt(selectedNozzle.nominalFlowLMin, 2)} L/min a {formatPt(selectedNozzle.referencePressureBar, 1)} bar
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 font-bold">-- Selecione a cor / calibre --</span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isColorMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Lista Aberta de Opções Cromáticas */}
              {isColorMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Cores disponíveis"
                  className="absolute z-30 mt-2 w-full max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1 animate-fade-in"
                >
                  {availableIsoOptions.map(opt => {
                    const isSelected = selectedNozzleId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onNozzleChange(opt.id);
                          setIsColorMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer touch-target ${
                          isSelected
                            ? 'bg-daterra-primary text-white shadow-sm'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                            style={{
                              backgroundColor: opt.pres.hex,
                              borderColor: opt.pres.hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'transparent'
                            }}
                          />
                          <div>
                            <span className="font-extrabold">{opt.label}</span>
                            <span className={`text-[10px] ml-1.5 font-mono-numbers ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                              (ISO {opt.isoCode})
                            </span>
                          </div>
                        </div>

                        <span className={`text-[11px] font-extrabold font-mono-numbers ${isSelected ? 'text-white' : 'text-slate-700'}`}>
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

        {/* CASO C: BICOS COM COR PRÓPRIA DO FABRICANTE (Ex: Albuz ATR) */}
        {adaptiveCategory === 'color_non_iso' && selectedModel && (availableSprayAngles.length <= 1 || currentSprayAngle) && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>3. Cor do Fabricante</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Código do Fabricante
              </span>
            </label>

            {/* Menu Visual de Seleção de Cor Não-ISO */}
            <div className="relative" ref={colorMenuRef}>
              <button
                type="button"
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                aria-haspopup="listbox"
                aria-expanded={isColorMenuOpen}
                aria-label={`Selecionar cor do fabricante do ${displayTitle}`}
                className="w-full h-14 px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-2xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer touch-target shadow-sm"
              >
                {selectedNozzle ? (
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="w-5 h-5 rounded-full border shadow-sm shrink-0"
                      style={{
                        backgroundColor: getNozzleColorPresentation(selectedNozzle).hex,
                        borderColor: getNozzleColorPresentation(selectedNozzle).hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'transparent'
                      }}
                    />
                    <div className="text-left leading-tight">
                      <span className="font-extrabold text-slate-900 block">
                        {selectedNozzle.color || selectedNozzle.modelNorm}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers">
                        Nominal: {formatPt(selectedNozzle.nominalFlowLMin, 2)} L/min a {formatPt(selectedNozzle.referencePressureBar, 1)} bar
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 font-bold">-- Selecione a cor --</span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isColorMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Lista Aberta de Opções Não-ISO */}
              {isColorMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Cores do fabricante disponíveis"
                  className="absolute z-30 mt-2 w-full max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1 animate-fade-in"
                >
                  {availableNonIsoColors.map(opt => {
                    const isSelected = selectedNozzleId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onNozzleChange(opt.id);
                          setIsColorMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer touch-target ${
                          isSelected
                            ? 'bg-daterra-primary text-white shadow-sm'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                            style={{
                              backgroundColor: opt.pres.hex,
                              borderColor: opt.pres.hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'transparent'
                            }}
                          />
                          <span className="font-extrabold">{opt.label}</span>
                        </div>

                        <span className={`text-[11px] font-extrabold font-mono-numbers ${isSelected ? 'text-white' : 'text-slate-700'}`}>
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

        {/* CASO D: MONOBLOCO SEM COR (Identificação por Referência) */}
        {adaptiveCategory === 'monobloc_ref' && selectedModel && variants.length > 1 && (
          <div>
            <label htmlFor={`nozzle-ref-select-${side}`} className="block text-xs font-bold text-slate-700 mb-1.5">
              3. Referência do Modelo
            </label>
            <div className="relative">
              <select
                id={`nozzle-ref-select-${side}`}
                value={selectedNozzleId || ''}
                onChange={e => onNozzleChange(e.target.value)}
                aria-label={`Referência do ${displayTitle}`}
                className="w-full h-12 px-4 pr-10 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-2xl text-sm font-bold outline-none transition-all appearance-none cursor-pointer touch-target"
              >
                <option value="">-- Selecione a referência --</option>
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.modelNorm} (~{formatPt(v.nominalFlowLMin, 2)} L/min)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Resumo Visual do Bico Atualmente Selecionado */}
      {selectedNozzle && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <NozzleColorBadge
            nozzle={selectedNozzle}
            size="large"
            showFlow={true}
            showIso={true}
            sideLabel={displayTitle}
          />

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Tipo: <strong className="text-slate-700">{selectedNozzle.nozzleType}</strong></span>
            <span>Ângulo: <strong className="text-slate-700">{formatSprayAngle(selectedNozzle)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
