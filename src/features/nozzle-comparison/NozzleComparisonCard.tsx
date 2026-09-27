import React from 'react';
import {
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Droplets
} from 'lucide-react';
import type { Nozzle, AdaptiveNozzleCategory, CalculatedNozzleFlow } from './nozzleComparison.types';
import {
  AVAILABLE_BRANDS,
  getGroupedModelsForBrand,
  getVariantsForModel
} from './nozzleComparison.data';
import {
  formatPt,
  sortNozzlesByNominalFlow,
  getNozzleColorPresentation,
  getDropletSpectrumMeasurements
} from './nozzleComparison.calculations';

export interface NozzleComparisonCardProps {
  side: 'A' | 'B';
  title?: string;
  selectedBrand: string;
  selectedModel: string;
  selectedSprayAngle?: string | number;
  selectedSwirlPlate?: string;
  selectedDisc?: string;
  selectedNozzleId: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  onSprayAngleChange?: (angle: string | number) => void;
  onSwirlPlateChange?: (swirl: string) => void;
  onDiscChange?: (disc: string) => void;
  onNozzleChange: (nozzleId: string) => void;
  selectedNozzle?: Nozzle;
  calculatedFlow?: CalculatedNozzleFlow;
  workingPressureBar: number;
}

export const NozzleComparisonCard: React.FC<NozzleComparisonCardProps> = ({
  side,
  title,
  selectedBrand,
  selectedModel,
  selectedSwirlPlate,
  selectedDisc,
  selectedNozzleId,
  onBrandChange,
  onModelChange,
  onSwirlPlateChange,
  onDiscChange,
  onNozzleChange,
  selectedNozzle,
  calculatedFlow,
  workingPressureBar
}) => {
  const displayTitle = title || (side === 'A' ? 'Bico A' : 'Bico B');
  const [isColorMenuOpen, setIsColorMenuOpen] = React.useState<boolean>(false);
  const colorMenuRef = React.useRef<HTMLDivElement>(null);

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

  // Lista plana de todos os modelos da marca
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

  // Ângulos nominais distintos disponíveis para este modelo
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

  // Texto descritivo informativo dos ângulos de jato disponíveis (APENAS INFORMAÇÃO, NUNCA BOTÃO)
  const sprayAngleInfoText = React.useMemo(() => {
    if (!selectedModel || allModelVariants.length === 0) return 'ND';
    if (isAnglePressureVariable) {
      const sample = allModelVariants[0];
      if (sample.sprayAngleMinDeg && sample.sprayAngleMaxDeg) {
        return `Variável (${sample.sprayAngleMinDeg}°–${sample.sprayAngleMaxDeg}°)`;
      }
      return 'Variável com a pressão';
    }
    if (availableSprayAngles.length > 1) {
      return `${availableSprayAngles.join('°, ')}°`;
    }
    if (availableSprayAngles.length === 1) {
      return `${availableSprayAngles[0]}°`;
    }
    return 'ND';
  }, [selectedModel, allModelVariants, isAnglePressureVariable, availableSprayAngles]);

  // Variantes do modelo ordenadas por débito nominal crescente
  const variants = React.useMemo(() => {
    if (!allModelVariants || allModelVariants.length === 0) return [];
    return [...allModelVariants].sort(sortNozzlesByNominalFlow);
  }, [allModelVariants]);

  // Determinar a categoria adaptativa do modelo selecionado
  const adaptiveCategory: AdaptiveNozzleCategory = React.useMemo(() => {
    if (!selectedModel || variants.length === 0) return 'color_iso';

    const hasModular = variants.some(v => Boolean(v.disc || v.swirlPlate));
    if (hasModular) return 'modular';

    const hasIso = variants.some(v => v.isIsoNozzle && Boolean(v.isoCode));
    if (hasIso) return 'color_iso';

    const hasColor = variants.some(v => Boolean(v.color));
    if (hasColor) return 'color_non_iso';

    return 'monobloc_ref';
  }, [variants, selectedModel]);

  // Difusores únicos para modelos modulares
  const availableSwirlPlates = React.useMemo(() => {
    if (adaptiveCategory !== 'modular') return [];
    const set = new Set<string>();
    variants.forEach(v => {
      if (v.swirlPlate) set.add(v.swirlPlate);
    });
    return Array.from(set).sort();
  }, [variants, adaptiveCategory]);

  // Discos disponíveis para modelos modulares
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

  // Cores ISO ordenadas por débito nominal crescente
  const availableIsoOptions = React.useMemo(() => {
    if (adaptiveCategory !== 'color_iso') return [];
    const map = new Map<string, Nozzle>();
    variants.forEach(v => {
      const key = `${v.color || 'Sem Cor'} (ISO ${v.isoCode || 'N/D'})`;
      if (!map.has(key) || (v.isTop && !map.get(key)?.isTop)) {
        map.set(key, v);
      }
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

  // Cores não-ISO ordenadas por débito nominal crescente
  const availableNonIsoColors = React.useMemo(() => {
    if (adaptiveCategory !== 'color_non_iso') return [];
    const map = new Map<string, Nozzle>();
    variants.forEach(v => {
      const key = v.color || v.modelNorm;
      if (!map.has(key) || (v.isTop && !map.get(key)?.isTop)) {
        map.set(key, v);
      }
    });
    return Array.from(map.values())
      .sort(sortNozzlesByNominalFlow)
      .map(nozzle => {
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
      variants.length === 1 &&
      selectedNozzleId !== variants[0].id
    ) {
      onNozzleChange(variants[0].id);
    }
  }, [selectedBrand, selectedModel, variants, selectedNozzleId, onNozzleChange]);

  const sideBadgeClass =
    side === 'A'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : 'bg-sky-100 text-sky-800 border-sky-300';

  const isModular = adaptiveCategory === 'modular' && Boolean(selectedModel);

  // Medições reais de diâmetro de gotas para a pressão de trabalho exata (ex.: Albuz ATR a 5, 10 ou 15 bar)
  const currentDropletValues = React.useMemo(() => {
    if (!selectedNozzle) return null;
    const measurements = getDropletSpectrumMeasurements(selectedNozzle);
    if (!measurements || measurements.length === 0) return null;

    // Procura medição para a pressão de trabalho com tolerância de 0.05 bar (ex.: 5.0 bar, mas não 5.1 bar)
    const match = measurements.find(m => Math.abs(m.pressureBar - workingPressureBar) < 0.05);
    if (!match || !match.dv10Micrometres || !match.dv50Micrometres || !match.dv90Micrometres) {
      return null;
    }

    return match;
  }, [selectedNozzle, workingPressureBar]);

  return (
    <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 flex flex-col justify-between space-y-3 transition-all shadow-xs">
      
      {/* 1. CABEÇALHO DO SUB-CARTÃO: INDICAÇÃO BICO A vs BICO B + ESTADO */}
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border shrink-0 ${sideBadgeClass}`}>
            {displayTitle}
          </span>
          <span className="text-xs font-bold text-slate-800 truncate">
            {selectedNozzle
              ? `${selectedNozzle.brand} ${selectedNozzle.model}${selectedNozzle.disc ? ` ${selectedNozzle.swirlPlate || ''} ${selectedNozzle.disc}` : ''}`
              : 'Não disponível'}
          </span>
        </div>
        {selectedNozzle ? (
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Selecionado</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
            Pendente
          </span>
        )}
      </div>

      {/* 2. FORMULÁRIO DE SELEÇÃO: TODOS OS CAMPOS NORMAIS SEMPRE VISÍVEIS */}
      <div className="space-y-2.5">
        
        {/* Linha 1: Marca e Modelo */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Marca / Fabricante */}
          <div>
            <label htmlFor={`brand-select-${side}`} className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Marca
            </label>
            <div className="relative">
              <select
                id={`brand-select-${side}`}
                value={selectedBrand}
                onChange={e => onBrandChange(e.target.value)}
                aria-label={`Marca do ${displayTitle}`}
                className="w-full h-9 px-2.5 pr-7 bg-white hover:bg-slate-50 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-xl text-xs font-bold outline-none transition-all appearance-none cursor-pointer shadow-2xs"
              >
                <option value="">-- Marca --</option>
                {AVAILABLE_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Modelo de Bico */}
          <div>
            <label htmlFor={`model-select-${side}`} className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
              Modelo
            </label>
            <div className="relative">
              <select
                id={`model-select-${side}`}
                value={selectedModel}
                onChange={e => onModelChange(e.target.value)}
                disabled={!selectedBrand}
                aria-label={`Modelo do ${displayTitle}`}
                className={`w-full h-9 px-2.5 pr-7 border rounded-xl text-xs font-bold outline-none transition-all appearance-none shadow-2xs ${
                  !selectedBrand
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 border-slate-300 focus:border-daterra-primary text-slate-900 cursor-pointer'
                }`}
              >
                <option value="">
                  {!selectedBrand ? 'Escolha marca' : '-- Modelo --'}
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
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Linha 2: COR DO BICO (PADRÃO) OU DIFUSOR + DISCO (APENAS QUANDO MODULAR) */}
        {isModular ? (
          /* CONJUNTO MODULAR: 'Difusor' + 'Disco / Pastilha' */
          <div className="grid grid-cols-2 gap-2.5 animate-fade-in">
            <div>
              <label htmlFor={`swirl-select-${side}`} className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Difusor
              </label>
              <div className="relative">
                <select
                  id={`swirl-select-${side}`}
                  value={selectedSwirlPlate || ''}
                  onChange={e => {
                    const swirl = e.target.value;
                    if (onSwirlPlateChange) onSwirlPlateChange(swirl);
                    const match = variants.find(
                      v => v.swirlPlate === swirl && (!selectedDisc || v.disc === selectedDisc)
                    ) || variants.find(v => v.swirlPlate === swirl);
                    if (match) {
                      onNozzleChange(match.id);
                      if (onDiscChange && match.disc) onDiscChange(match.disc);
                    }
                  }}
                  className="w-full h-9 px-2.5 pr-7 bg-white hover:bg-slate-50 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer shadow-2xs"
                >
                  <option value="">-- Difusor --</option>
                  {availableSwirlPlates.map(swirl => (
                    <option key={swirl} value={swirl}>
                      Difusor {swirl}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor={`disc-select-${side}`} className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Disco / Pastilha
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
                    ) || variants.find(v => v.disc === disc);
                    if (match) {
                      onNozzleChange(match.id);
                      if (onSwirlPlateChange && match.swirlPlate) onSwirlPlateChange(match.swirlPlate);
                    }
                  }}
                  className="w-full h-9 px-2.5 pr-7 bg-white hover:bg-slate-50 border border-slate-300 focus:border-daterra-primary text-slate-900 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer shadow-2xs"
                >
                  <option value="">-- Disco --</option>
                  {availableDiscs.map(disc => (
                    <option key={disc} value={disc}>
                      Disco {disc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        ) : (
          /* CASO NORMAL (PADRÃO): CAMPO 'COR DO BICO' SEMPRE PRESENTE */
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Cor do Bico
              </label>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                selectedNozzle?.isIsoNozzle
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {selectedNozzle ? (selectedNozzle.isIsoNozzle ? 'Norma ISO 10625' : 'Cor do Fabricante') : 'ND'}
              </span>
            </div>

            <div className="relative" ref={colorMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (selectedModel && (availableIsoOptions.length > 0 || availableNonIsoColors.length > 0)) {
                    setIsColorMenuOpen(!isColorMenuOpen);
                  }
                }}
                disabled={!selectedModel}
                aria-haspopup="listbox"
                aria-expanded={isColorMenuOpen}
                aria-label={`Selecionar cor do ${displayTitle}`}
                className={`w-full h-9 px-2.5 border rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs ${
                  !selectedModel
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 border-slate-300 focus:border-daterra-primary text-slate-900 cursor-pointer'
                }`}
              >
                {selectedNozzle ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden="true"
                      className="w-4 h-4 rounded-full border shadow-xs shrink-0"
                      style={{
                        backgroundColor: getNozzleColorPresentation(selectedNozzle).hex,
                        borderColor: getNozzleColorPresentation(selectedNozzle).hex.toLowerCase() === '#ffffff' ? '#94a3b8' : 'rgba(0,0,0,0.15)'
                      }}
                    />
                    <span className="font-black text-slate-900 truncate">
                      {selectedNozzle.color}
                      {selectedNozzle.isoCode ? ` (ISO ${selectedNozzle.isoCode})` : ''}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-numbers shrink-0 hidden sm:inline">
                      • {formatPt(selectedNozzle.nominalFlowLMin, 2)} L/min
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-300 shrink-0" />
                    <span>{!selectedModel ? 'ND (Selecione o modelo)' : '-- Selecione a cor --'}</span>
                  </div>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isColorMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Lista Aberta de Opções Cromáticas */}
              {isColorMenuOpen && selectedModel && (
                <div
                  role="listbox"
                  aria-label="Cores disponíveis"
                  className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1 space-y-0.5 animate-fade-in"
                >
                  {(adaptiveCategory === 'color_iso' ? availableIsoOptions : availableNonIsoColors).map(opt => {
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
                        className={`w-full p-1.5 rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-daterra-primary text-white shadow-xs'
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="w-3.5 h-3.5 rounded-full border shadow-xs shrink-0"
                            style={{
                              backgroundColor: opt.pres.hex,
                              borderColor: opt.pres.hex.toLowerCase() === '#ffffff' ? '#94a3b8' : 'rgba(0,0,0,0.1)'
                            }}
                          />
                          <span className="font-extrabold">{opt.label}</span>
                          {opt.isoCode && (
                            <span className={`text-[10px] font-mono-numbers ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                              (ISO {opt.isoCode})
                            </span>
                          )}
                        </div>

                        <span className={`text-[10px] font-black font-mono-numbers ${isSelected ? 'text-white' : 'text-slate-700'}`}>
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

        {/* Linha 3: Etiquetas Técnicas (TIPO, ÂNGULO, CÓDIGO ISO) - SEMPRE PRESENTES */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold text-slate-600 pt-0.5">
          <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
            Tipo: {selectedNozzle?.nozzleType || (variants[0]?.nozzleType) || 'ND'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
            Ângulo: {sprayAngleInfoText}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border shadow-2xs ${
            selectedNozzle?.isIsoNozzle
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-white text-slate-600 border-slate-200/80'
          }`}>
            Código ISO: {selectedNozzle ? (selectedNozzle.isIsoNozzle ? (selectedNozzle.isoCode || 'N/D') : 'ND (Fabricante)') : 'ND'}
          </span>
        </div>
      </div>

      {/* 3. CARTÃO VERDE COM O RESULTADO (EM GRANDE DESTAQUE, ELEGANTE E EQUILIBRADO) */}
      <div className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white p-3.5 sm:p-4 rounded-2xl shadow-floating border border-white/10 text-center space-y-1.5 transition-all">
        {/* Cabeçalho Único com Linha Divisória: Diâmetro de Gotas e Débito a x,x bar */}
        <div className="flex items-center justify-between border-b border-white/15 pb-1 text-[10px] sm:text-[11px] gap-2">
          {side === 'A' ? (
            <>
              {/* Bico A: Diâmetro de gotas sempre no lado esquerdo */}
              <div
                className={`flex items-center gap-1.5 font-bold min-w-0 truncate ${
                  currentDropletValues ? 'text-emerald-100' : 'text-white/60'
                }`}
                title={currentDropletValues ? 'Medição catalogada de diâmetro de gotas' : 'Sem dados catalogados para esta pressão'}
              >
                <Droplets
                  className={`w-3.5 h-3.5 shrink-0 ${currentDropletValues ? 'text-daterra-accent' : 'text-white/40'}`}
                  aria-label="Diâmetro de gota"
                />
                <span className="font-mono-numbers tracking-tight truncate">
                  {currentDropletValues
                    ? `DV10 ${currentDropletValues.dv10Micrometres} µm | DV50 ${currentDropletValues.dv50Micrometres} µm | DV90 ${currentDropletValues.dv90Micrometres} µm`
                    : 'DV10 -- µm | DV50 -- µm | DV90 -- µm'}
                </span>
              </div>

              {/* Bico A: Débito a x,x bar sempre alinhado ao lado direito */}
              <span className="font-extrabold uppercase tracking-wider text-daterra-accent shrink-0 text-right">
                Débito a {formatPt(workingPressureBar, 1)} bar
              </span>
            </>
          ) : (
            <>
              {/* Bico B: Débito a x,x bar sempre alinhado ao lado esquerdo */}
              <span className="font-extrabold uppercase tracking-wider text-daterra-accent shrink-0 text-left">
                Débito a {formatPt(workingPressureBar, 1)} bar
              </span>

              {/* Bico B: Diâmetro de gotas sempre no lado direito */}
              <div
                className={`flex items-center gap-1.5 font-bold min-w-0 justify-end truncate ${
                  currentDropletValues ? 'text-emerald-100' : 'text-white/60'
                }`}
                title={currentDropletValues ? 'Medição catalogada de diâmetro de gotas' : 'Sem dados catalogados para esta pressão'}
              >
                <Droplets
                  className={`w-3.5 h-3.5 shrink-0 ${currentDropletValues ? 'text-daterra-accent' : 'text-white/40'}`}
                  aria-label="Diâmetro de gota"
                />
                <span className="font-mono-numbers tracking-tight truncate">
                  {currentDropletValues
                    ? `DV10 ${currentDropletValues.dv10Micrometres} µm | DV50 ${currentDropletValues.dv50Micrometres} µm | DV90 ${currentDropletValues.dv90Micrometres} µm`
                    : 'DV10 -- µm | DV50 -- µm | DV90 -- µm'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* DÉBITO CALCULADO EM GRANDE DESTAQUE CENTRADO */}
        <div className="py-0.5">
          <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-white tracking-tight">
            {calculatedFlow ? formatPt(calculatedFlow.flowLMin, 2) : '--'}
          </span>
          <span className="text-base sm:text-lg font-bold text-daterra-accent ml-1.5">
            L/min
          </span>
        </div>

        {/* SEGUNDO PLANO: DESVIO MÁXIMO ADMISSÍVEL (10% FIXO) */}
        <div className="pt-1 border-t border-white/10 space-y-0.5">
          <span className="text-[10px] font-extrabold text-emerald-100 uppercase tracking-wider block">
            Desvio máximo admissível: ±10%
          </span>
          <div className="text-xs font-black font-mono-numbers text-white">
            {calculatedFlow
              ? `${formatPt(calculatedFlow.deviationMinLMin, 2)} – ${formatPt(calculatedFlow.deviationMaxLMin, 2)} L/min`
              : 'ND'}
          </div>
        </div>
      </div>

      {/* 4. FAIXA RECOMENDADA / ALERTA */}
      <div className="pt-0.5">
        {calculatedFlow?.pressureWarning ? (
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center gap-1.5 text-xs text-rose-900 font-bold leading-tight animate-fade-in shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">{calculatedFlow.pressureWarning}</span>
          </div>
        ) : selectedNozzle ? (
          <div className="px-2.5 py-1.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-medium shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Faixa recomendada: {formatPt(selectedNozzle.pressureMinBar, 1)}–{formatPt(selectedNozzle.pressureMaxBar, 1)} bar</span>
          </div>
        ) : (
          <div className="px-2.5 py-1.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center text-[11px] text-slate-400 font-medium shadow-2xs">
            <span>Faixa recomendada: ND</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NozzleComparisonCard;
