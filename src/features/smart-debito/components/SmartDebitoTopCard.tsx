/**
 * DATERRA Smart - Componente de Cabeçalho Superior Unificado (Compacto)
 * Ficheiro: src/features/smart-debito/components/SmartDebitoTopCard.tsx
 *
 * Reestruturação ergonómica focada em altura mínima:
 * 1. Cabeçalho em linha única: Título + Normas ISO (Baixas, 3D, Estufas) + Vistas (Grelha, Gráfico)
 * 2. Linha 1: Dropdowns em cascata (Marca, Modelo, Cor/Calibre ou Difusor + Disco) na mesma linha
 * 3. Linha 2: Etiquetas técnicas + botões compactos ("Aplicar a Todos os Bicos", "Carregar .TXT")
 * 4. Acordeão de Setores (1 a 10 setores): apenas o Setor 1 tem seletor de "Lado", os restantes
 *    ajustam-se automaticamente; campos de 1ª linha ativam-se após upload de .txt.
 * 5. Cartão "Resultados": integra o controlo de pressão (input + slider) e as 3 métricas teóricas
 *    (Q2, desvio ±10%, Débito Total) com a sub-secção "Resultado ISO 16122" num bloco unificado.
 *
 * REGRAS ESTRITAS: Termos interditos excluídos. Na UI utiliza exclusivamente "débito" e "Secção".
 * Ícones: Padronização estrita com estilo visual SVG Lucide (stroke-width: 2, linhas limpas).
 */

import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Upload,
  Gauge,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LayoutGrid,
  BarChart3,
  ChevronDown,
  Layers,
  Scale
} from 'lucide-react';

import type {
  SmartDebitoState,
  SmartDebitoVerdict,
  SmartDebitoAction,
  NozzleCatalogRef,
  NozzleSlotEvaluation,
  FlowMeasurementUnit
} from '../types';
import type { Nozzle, AdaptiveNozzleCategory } from '../../nozzle-comparison/nozzleComparison.types';
import {
  AVAILABLE_BRANDS,
  getGroupedModelsForBrand,
  getVariantsForModel,
  NOZZLES_DATABASE
} from '../../nozzle-comparison/nozzleComparison.data';
import {
  formatPt,
  sortNozzlesByNominalFlow,
  getNozzleColorPresentation,
  formatSprayAngle
} from '../../nozzle-comparison/nozzleComparison.calculations';
import { parseEnsaioFileContent } from '../smartDebitoParser';

interface SmartDebitoTopCardProps {
  state: SmartDebitoState;
  verdict: SmartDebitoVerdict;
  evaluations: Record<string, NozzleSlotEvaluation>;
  dispatch: React.Dispatch<SmartDebitoAction>;
  activeView: 'bicos' | 'grafico';
  onViewChange: (view: 'bicos' | 'grafico') => void;
  onOpenHelp: () => void;
}

export const SmartDebitoTopCard: React.FC<SmartDebitoTopCardProps> = ({
  state,
  verdict,
  dispatch,
  activeView,
  onViewChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  // Estados locais
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSectorsOpen, setIsSectorsOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);

  // Estados do Cascade Dropdown da Base de Dados de Bicos
  const [selectedBrand, setSelectedBrand] = useState<string>('Albuz');
  const [selectedModel, setSelectedModel] = useState<string>('ATR');
  const [selectedSwirlPlate, setSelectedSwirlPlate] = useState<string>('');
  const [selectedDisc, setSelectedDisc] = useState<string>('');
  const [selectedNozzleId, setSelectedNozzleId] = useState<string>('albuz_atr_80_laranja');
  const [isColorMenuOpen, setIsColorMenuOpen] = useState<boolean>(false);

  // Fechar dropdown de cores ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setIsColorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Modelos agrupados por tipo para a marca selecionada
  const groupedModels = useMemo(() => {
    return getGroupedModelsForBrand(selectedBrand);
  }, [selectedBrand]);

  // 2. Todas as variantes do modelo selecionado
  const allModelVariants = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    return getVariantsForModel(selectedBrand, selectedModel);
  }, [selectedBrand, selectedModel]);

  const variants = useMemo(() => {
    if (!allModelVariants || allModelVariants.length === 0) return [];
    return [...allModelVariants].sort(sortNozzlesByNominalFlow);
  }, [allModelVariants]);

  // Determinar a categoria adaptativa (modular vs cor ISO vs cor não-ISO)
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

  // Difusores e Discos para modelos modulares
  const availableSwirlPlates = useMemo(() => {
    if (!isModular) return [];
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.swirlPlate) set.add(v.swirlPlate);
    });
    return Array.from(set).sort();
  }, [variants, isModular]);

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

  // Opções de Cores ISO
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

  // Opções de Cores Não-ISO
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

  // Objeto completo do bico selecionado atualmente
  const selectedNozzle: Nozzle | undefined = useMemo(() => {
    if (selectedNozzleId) {
      const found = NOZZLES_DATABASE.find((n) => n.id === selectedNozzleId);
      if (found) return found;
    }
    return variants[0];
  }, [selectedNozzleId, variants]);

  // Sincronização quando a marca muda
  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    const groups = getGroupedModelsForBrand(newBrand);
    const firstModel = groups[0]?.models[0]?.model || '';
    setSelectedModel(firstModel);

    if (firstModel) {
      const newVariants = getVariantsForModel(newBrand, firstModel);
      if (newVariants.length > 0) {
        const firstVar = newVariants[0];
        setSelectedNozzleId(firstVar.id);
        setSelectedSwirlPlate(firstVar.swirlPlate || '');
        setSelectedDisc(firstVar.disc || '');
      }
    }
  };

  // Sincronização quando o modelo muda
  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    const newVariants = getVariantsForModel(selectedBrand, newModel);
    if (newVariants.length > 0) {
      const firstVar = newVariants[0];
      setSelectedNozzleId(firstVar.id);
      setSelectedSwirlPlate(firstVar.swirlPlate || '');
      setSelectedDisc(firstVar.disc || '');
    }
  };

  // Ângulo informativo
  const sprayAngleInfoText = useMemo(() => {
    if (!selectedNozzle) return 'ND';
    return formatSprayAngle(selectedNozzle);
  }, [selectedNozzle]);

  // Total de bicos da barra e cálculo hidráulico teórico (Q2, tolerância e total)
  const totalNozzles = useMemo(() => {
    if (state.standard === 'ISO_16122_2' && state.sectors?.length) {
      return state.sectors.reduce((sum, s) => sum + s.numNozzles, 0);
    }
    return state.numLevels * 2;
  }, [state.standard, state.sectors, state.numLevels]);

  const { theoreticalFlowAtP2, minTolFlow, maxTolFlow, totalCalculatedTargetFlow } = useMemo(() => {
    if (!selectedNozzle) {
      return { theoreticalFlowAtP2: null, minTolFlow: null, maxTolFlow: null, totalCalculatedTargetFlow: null };
    }

    const p1 = selectedNozzle.referencePressureBar || 3.0;
    const q1 = selectedNozzle.nominalFlowLMin || 1.0;
    const p2 = state.testPressureBar ?? p1;

    if (p2 <= 0 || p1 <= 0) {
      return { theoreticalFlowAtP2: null, minTolFlow: null, maxTolFlow: null, totalCalculatedTargetFlow: null };
    }

    const q2 = Number((q1 * Math.sqrt(p2 / p1)).toFixed(2));
    const minQ = Number((q2 * 0.9).toFixed(2));
    const maxQ = Number((q2 * 1.1).toFixed(2));
    const totalQ = Number((q2 * totalNozzles).toFixed(2));

    return {
      theoreticalFlowAtP2: q2,
      minTolFlow: minQ,
      maxTolFlow: maxQ,
      totalCalculatedTargetFlow: totalQ
    };
  }, [selectedNozzle, state.testPressureBar, totalNozzles]);

  // Aplicar Bico Selecionado a Todos os Bicos da Máquina
  const handleApplyToAllNozzles = () => {
    if (!selectedNozzle) return;

    let colorLabel = selectedNozzle.color || '';
    if (isModular) {
      colorLabel = `Dif. ${selectedSwirlPlate || selectedNozzle.swirlPlate || 'ND'} + Disc ${selectedDisc || selectedNozzle.disc || 'ND'}`;
    }

    const nozzleRef: NozzleCatalogRef = {
      brand: selectedNozzle.brand,
      model: selectedNozzle.model,
      color: colorLabel,
      referencePressureBar: selectedNozzle.referencePressureBar,
      nominalFlowLMin: selectedNozzle.nominalFlowLMin,
      sprayAngleDeg: selectedNozzle.sprayAngleDeg,
      nozzleType: selectedNozzle.nozzleType,
      swirlPlate: selectedSwirlPlate || selectedNozzle.swirlPlate,
      disc: selectedDisc || selectedNozzle.disc,
      isIsoNozzle: selectedNozzle.isIsoNozzle,
      isoCode: selectedNozzle.isoCode
    };

    dispatch({ type: 'APPLY_NOZZLE_TO_ALL', payload: nozzleRef });
  };

  // Upload de Caudolímetro (.txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      const parseResult = parseEnsaioFileContent(content);
      if (!parseResult.success) {
        setParseError(parseResult.error || 'Erro ao processar ficheiro de ensaio.');
        return;
      }

      dispatch({
        type: 'APPLY_ENSAIO_DATA',
        payload: {
          records: parseResult.records,
          offset: state.fileOffset,
          fileName: file.name,
          detectedPressure: parseResult.detectedPressure
        }
      });
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Resumo de texto do acordeão de setores
  const sectorsSummaryText = useMemo(() => {
    if (!state.sectors || state.sectors.length === 0) return `${totalNozzles} bicos`;
    const parts = state.sectors.map((s, idx) => {
      const sideLetter = s.side === 'left' ? 'Esq' : s.side === 'right' ? 'Dir' : 'Centro';
      return `${s.numNozzles} ${sideLetter} (S${idx + 1})`;
    });
    return parts.join(' + ');
  }, [state.sectors, totalNozzles]);

  // Apresentação visual da cor do bico
  const currentColorPres = useMemo(() => {
    return selectedNozzle ? getNozzleColorPresentation(selectedNozzle) : null;
  }, [selectedNozzle]);

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden mb-4 transition-all">
      {/* ============================================================== */}
      {/* 1. CABEÇALHO DO CARTÃO: IDENTIDADE + NORMAS E VISTAS EM LINHA ÚNICA */}
      {/* ============================================================== */}
      <div className="p-2.5 sm:p-3.5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2.5">
        
        {/* Lado Esquerdo: Ícone + Título no formato oficial */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#114037] text-white flex items-center justify-center shadow-xs shrink-0">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 leading-none">
              Parâmetros de Auditoria
            </h1>
            <span className="text-[9.5px] text-slate-400 font-medium">
              Configuração técnica do pulverizador e bicos para homologação
            </span>
          </div>
        </div>

        {/* Lado Direito: Normas ISO e Vistas na Mesma Linha Horizontal */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
          
          {/* Grupo de Normas ISO (Ordem Estrita: Culturas Baixas, Culturas 3D, Estufas) */}
          <div className="inline-flex p-0.5 bg-white border border-slate-200 rounded-lg shadow-2xs text-[10.5px] font-bold">
            {/* 1. ISO 16122-2 (Culturas Baixas) */}
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STANDARD', payload: 'ISO_16122_2' })}
              className={`px-2.5 py-1 rounded-md transition-all font-extrabold ${
                state.standard === 'ISO_16122_2'
                  ? 'bg-[#114037] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ISO 16122-2 (Culturas Baixas)
            </button>

            {/* 2. ISO 16122-3 (Culturas 3D) */}
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_STANDARD', payload: 'ISO_16122_3' })}
              className={`px-2.5 py-1 rounded-md transition-all font-extrabold ${
                state.standard === 'ISO_16122_3'
                  ? 'bg-[#114037] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ISO 16122-3 (Culturas 3D)
            </button>

            {/* 3. ISO 16122-4 (Estufas) - Inativo Futuro */}
            <button
              type="button"
              disabled
              title="Módulo reservado para produção futura"
              className="px-2.5 py-1 rounded-md text-slate-400 bg-slate-100/60 border border-dashed border-slate-300 cursor-not-allowed opacity-60"
            >
              ISO 16122-4 (Estufas)
            </button>
          </div>

          {/* Separador Vertical Discreto */}
          <div className="hidden sm:block h-5 w-px bg-slate-300" />

          {/* Grupo de Vistas: Grelha de Bicos & Gráfico */}
          <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg text-[10.5px] font-bold">
            <button
              type="button"
              onClick={() => onViewChange('bicos')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                activeView === 'bicos'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-700" />
              <span>Grelha de Bicos</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('grafico')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                activeView === 'grafico'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Gráfico</span>
            </button>
          </div>

        </div>

      </div>

      {/* CORPO DO CARTÃO DE AÇÃO DO UTILIZADOR */}
      <div className="p-2.5 sm:p-3.5 space-y-2.5">

        {/* ----------------------------------------------------------------- */}
        {/* 2. SELEÇÃO DO BICO DA BARRA: DROPDOWNS EM CASCATA NA MESMA LINHA */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-2.5">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            
            {/* MARCA */}
            <div className="sm:col-span-3">
              <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                Marca
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full h-8 px-2 pr-6 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#114037] focus:outline-none text-slate-800 appearance-none cursor-pointer"
                >
                  {AVAILABLE_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* MODELO */}
            <div className="sm:col-span-4">
              <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                Modelo
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full h-8 px-2 pr-6 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#114037] focus:outline-none text-slate-800 appearance-none cursor-pointer"
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
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* COR DO BICO OU DIFUSOR + DISCO (MODULAR) */}
            {isModular ? (
              <div className="sm:col-span-5 grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                    Difusor
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSwirlPlate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedSwirlPlate(val);
                        const match = variants.find((v) => v.swirlPlate === val && (!selectedDisc || v.disc === selectedDisc));
                        if (match) setSelectedNozzleId(match.id);
                      }}
                      className="w-full h-8 px-2 pr-5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#114037] appearance-none cursor-pointer"
                    >
                      <option value="">-- Difusor --</option>
                      {availableSwirlPlates.map((s) => (
                        <option key={s} value={s}>
                          Difusor {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                    Disco / Pastilha
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDisc}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedDisc(val);
                        const match = variants.find((v) => (!selectedSwirlPlate || v.swirlPlate === selectedSwirlPlate) && v.disc === val);
                        if (match) setSelectedNozzleId(match.id);
                      }}
                      className="w-full h-8 px-2 pr-5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#114037] appearance-none cursor-pointer"
                    >
                      <option value="">-- Disco --</option>
                      {availableDiscs.map((d) => (
                        <option key={d} value={d}>
                          Disco {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="sm:col-span-5 relative" ref={colorMenuRef}>
                <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
                  Cor do Bico / Calibre
                </label>
                <button
                  type="button"
                  onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                  className="w-full h-8 px-2 text-xs font-bold bg-white border border-slate-300 rounded-lg flex items-center justify-between shadow-2xs hover:border-slate-400 cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    {currentColorPres ? (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: currentColorPres.hex }}
                      />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <span className="font-extrabold text-slate-900 truncate">
                      {selectedNozzle?.color || selectedNozzle?.modelNorm || 'Selecionar'}
                    </span>
                    {selectedNozzle && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        · {formatPt(selectedNozzle.nominalFlowLMin || 0, 2)} l/min @ {formatPt(selectedNozzle.referencePressureBar || 3, 0)} bar
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Dropdown Flutuante de Cores */}
                {isColorMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto p-1 text-xs">
                    {(availableIsoOptions.length > 0 ? availableIsoOptions : availableNonIsoColors).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedNozzleId(opt.id);
                          setIsColorMenuOpen(false);
                        }}
                        className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                          selectedNozzleId === opt.id ? 'bg-slate-100 font-black' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: opt.pres.hex }}
                          />
                          <span className="truncate">{opt.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {formatPt(opt.nominalFlow || 0, 2)} l/min
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* LINHA 2: ETIQUETAS DO BICO + BOTÕES COMPACTOS NA MESMA LINHA */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-200/80">
            
            {/* Metadados Técnicos Compactos (Sem Alvo Q1) */}
            <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-bold text-slate-700">
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-2xs">
                Tipo: <strong className="text-slate-900 font-extrabold">{selectedNozzle?.nozzleType || 'ND'}</strong>
              </span>
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-2xs">
                Ângulo: <strong className="text-slate-900 font-extrabold">{sprayAngleInfoText}</strong>
              </span>
              <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-2xs">
                Código ISO:{' '}
                <strong className="text-slate-900 font-extrabold">
                  {selectedNozzle ? (selectedNozzle.isIsoNozzle ? selectedNozzle.isoCode || 'N/D' : 'ND (Fabricante)') : 'ND'}
                </strong>
              </span>
            </div>

            {/* Botões de Ação com Estilo dos Ícones Padronizado */}
            <div className="flex flex-wrap items-center gap-1.5">
              
              {/* Dropdown Global de Unidade dos Campos Input dos Débitos Medidos */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 h-7 shadow-2xs">
                <label htmlFor="globalUnitSelect" className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0">
                  Unidade:
                </label>
                <select
                  id="globalUnitSelect"
                  value={state.globalMeasurementUnit || 'L/min'}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_GLOBAL_MEASUREMENT_UNIT',
                      payload: e.target.value as FlowMeasurementUnit
                    })
                  }
                  title="Configurar unidade dos campos input dos débitos medidos para toda a máquina"
                  className="text-[10.5px] font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  <option value="L/min">L/min</option>
                  <option value="mL/15 seg">mL/15 seg</option>
                  <option value="mL/30 seg">mL/30 seg</option>
                </select>
              </div>

              {/* Botão Aplicar a Todos os Bicos */}
              <button
                type="button"
                onClick={handleApplyToAllNozzles}
                title="Aplicar este bico selecionado a todos os bicos da máquina"
                className="h-7 px-2.5 text-[10.5px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#3CA64C]" />
                <span>Aplicar a Todos os Bicos</span>
              </button>

              {/* Botão Carregar Ficheiro .TXT (Caudolímetro) */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Carregar ficheiro com leituras de caudolímetro eletrónico"
                className={`h-7 px-2.5 text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                  state.importedFileName
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#114037] hover:bg-[#1a5b4f] text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-emerald-300" />
                <span className="truncate max-w-[160px]">
                  {state.importedFileName ? state.importedFileName : 'Carregar .TXT (Caudolímetro)'}
                </span>
              </button>

            </div>

          </div>

          {parseError && (
            <div className="mt-2 p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 3. DIVISÃO DE SETORES DA BARRA COM ACORDEÃO (1 A 10 SETORES)      */}
        {/* ----------------------------------------------------------------- */}
        {state.standard === 'ISO_16122_2' && (
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            
            {/* Barra Resumida do Acordeão */}
            <div className="p-2 sm:p-2.5 bg-slate-50/90 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              
              <div className="flex items-center gap-2.5">
                {/* Seletor do Nº de Setores: 1 a 10 */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="numSectorsSelect" className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-600">
                    Nº Setores:
                  </label>
                  <select
                    id="numSectorsSelect"
                    value={state.numSectors || state.sectors?.length || 3}
                    onChange={(e) => dispatch({ type: 'SET_NUM_SECTORS', payload: Number(e.target.value) })}
                    className="h-6 px-1.5 text-xs font-black bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#114037] text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resumo quando fechado */}
                <div className="text-[9.5px] text-slate-600 truncate">
                  <span className="font-extrabold text-slate-800">
                    Total da Barra: {totalNozzles} bicos ({sectorsSummaryText})
                  </span>
                  <span className="hidden md:inline text-slate-400 text-[8.5px] ml-1">
                    · Se apenas indicar a linha no primeiro setor, as restantes são importadas sequencialmente no caudolímetro eletrónico.
                  </span>
                </div>
              </div>

              {/* Botão de Toggle do Acordeão */}
              <button
                type="button"
                onClick={() => setIsSectorsOpen(!isSectorsOpen)}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 self-end sm:self-auto py-0.5 px-2 rounded hover:bg-slate-200/60 cursor-pointer"
              >
                <span>Configurar Setores</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isSectorsOpen ? 'rotate-180' : ''}`} />
              </button>

            </div>

            {/* Conteúdo Expansível do Acordeão */}
            {isSectorsOpen && (
              <div className="p-2.5 bg-slate-50/40 space-y-2">
                
                {/* Aviso Informativo sobre o Caudolímetro */}
                <div
                  className={`p-1.5 rounded-lg text-[9.5px] font-medium flex items-center justify-between ${
                    state.importedFileName
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  <span>
                    {state.importedFileName
                      ? `✅ Ficheiro "${state.importedFileName}" carregado. Os campos de 1ª linha estão ativos para mapeamento de cada setor.`
                      : '⚠️ Nenhum ficheiro .txt carregado. Os campos de 1ª linha ativam-se após o carregamento do ficheiro do caudolímetro.'}
                  </span>
                  <span className="text-[9px] font-bold">
                    {state.importedFileName ? `${state.lastImportedCount || totalNozzles} bicos mapeados` : 'Leitura Sequencial Ativa'}
                  </span>
                </div>

                {/* Grelha de Configuração dos Setores */}
                <div className="space-y-1.5">
                  {(state.sectors || []).map((sec, idx) => {
                    const sectorNum = idx + 1;
                    
                    // Cálculo do intervalo de bicos deste setor
                    let startNozzle = 1;
                    for (let j = 0; j < idx; j++) {
                      startNozzle += state.sectors[j]?.numNozzles || 0;
                    }
                    const endNozzle = startNozzle + (sec.numNozzles || 0) - 1;

                    // Lado automático deduzido
                    const sideLabel = sec.side === 'left' ? 'Lado Esquerdo' : sec.side === 'right' ? 'Lado Direito' : 'Centro';

                    return (
                      <div
                        key={sec.id || sectorNum}
                        className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-mono text-[9.5px] font-black flex items-center justify-center">
                            {sectorNum}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Setor {sectorNum} ({sideLabel})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/* Apenas o Setor 1 tem o Seletor de Lado */}
                          {sectorNum === 1 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[8.5px] font-bold text-slate-500 uppercase">Lado:</span>
                              <select
                                value={state.startSide || 'left'}
                                onChange={(e) =>
                                  dispatch({ type: 'SET_START_SIDE', payload: e.target.value as 'left' | 'right' })
                                }
                                className="h-6 px-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded"
                              >
                                <option value="left">Esquerda</option>
                                <option value="right">Direita</option>
                              </select>
                            </div>
                          ) : null}

                          {/* Dropdown Nº Bicos */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-bold text-slate-500 uppercase">Nº Bicos:</span>
                            <select
                              value={sec.numNozzles}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_SECTOR',
                                  payload: { id: sec.id, updates: { numNozzles: Number(e.target.value) } }
                                })
                              }
                              className="h-6 px-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Campo 1ª Linha .TXT (Ativo apenas se houver ficheiro carregado) */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-extrabold text-slate-500 uppercase">1ª Linha .TXT:</span>
                            <input
                              type="number"
                              min="1"
                              disabled={!state.importedFileName}
                              value={sec.startLineTxt ?? ''}
                              placeholder="Sequencial"
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_SECTOR',
                                  payload: {
                                    id: sec.id,
                                    updates: { startLineTxt: Number(e.target.value) || null }
                                  }
                                })
                              }
                              className={`w-14 h-6 text-center text-xs font-mono font-bold border rounded ${
                                state.importedFileName
                                  ? 'bg-white border-emerald-400 text-slate-800'
                                  : 'bg-slate-100 border-slate-300 text-slate-400 disabled:cursor-not-allowed'
                              }`}
                            />
                          </div>

                          {/* Rótulo de Bicos */}
                          <span
                            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                              sec.side === 'left'
                                ? 'bg-blue-50 text-blue-800'
                                : sec.side === 'right'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Bicos N{startNozzle} a N{endNozzle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 3.B. CONFIGURAÇÃO DE NÍVEIS COM ACORDEÃO (ISO 16122-3 CULTURAS 3D) */}
        {/* ----------------------------------------------------------------- */}
        {state.standard === 'ISO_16122_3' && (
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            
            {/* Barra Resumida do Acordeão */}
            <div className="p-2 sm:p-2.5 bg-slate-50/90 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              
              <div className="flex items-center gap-2.5">
                {/* Seletor do Nº de Níveis: 1 a 30 */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="numLevelsSelect" className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-600">
                    Nº Níveis:
                  </label>
                  <select
                    id="numLevelsSelect"
                    value={state.numLevels || 6}
                    onChange={(e) => dispatch({ type: 'SET_NUM_LEVELS', payload: Number(e.target.value) })}
                    className="h-6 px-1.5 text-xs font-black bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#114037] text-slate-800 cursor-pointer"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resumo quando fechado */}
                <div className="text-[9.5px] text-slate-600 truncate">
                  <span className="font-extrabold text-slate-800">
                    Total do Turbopulverizador: {state.numLevels * 2} bicos ({state.numLevels} Esq + {state.numLevels} Dir)
                  </span>
                  <span className="hidden md:inline text-slate-400 text-[8.5px] ml-1">
                    · Distribuição bilateral N1 (Topo) a N{state.numLevels} (Base) · Cada nível possui 1 bico à Esquerda e 1 à Direita.
                  </span>
                </div>
              </div>

              {/* Botão de Toggle do Acordeão */}
              <button
                type="button"
                onClick={() => setIsLevelsOpen(!isLevelsOpen)}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 self-end sm:self-auto py-0.5 px-2 rounded hover:bg-slate-200/60 cursor-pointer"
              >
                <span>Configurar Níveis</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isLevelsOpen ? 'rotate-180' : ''}`} />
              </button>

            </div>

            {/* Conteúdo Expansível do Acordeão */}
            {isLevelsOpen && (
              <div className="p-2.5 bg-slate-50/40 space-y-2">
                
                {/* Aviso Informativo sobre a Distribuição Bilateral */}
                <div
                  className={`p-1.5 rounded-lg text-[9.5px] font-medium flex items-center justify-between ${
                    state.importedFileName
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-blue-50 border border-blue-200 text-blue-900'
                  }`}
                >
                  <span>
                    {state.importedFileName
                      ? `✅ Ficheiro "${state.importedFileName}" carregado. Leitura bilateral associada aos ${state.numLevels * 2} bicos.`
                      : 'ℹ️ Distribuição bilateral simétrica: cada nível possui 1 bico à Esquerda e 1 bico à Direita.'}
                  </span>
                  <span className="text-[9px] font-bold">
                    {state.numLevels} Níveis Bilaterais ({state.numLevels * 2} Bicos)
                  </span>
                </div>

                {/* Grelha de Níveis de Pulverização (N1 a Nn) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                  {Array.from({ length: state.numLevels }, (_, i) => i + 1).map((lvl) => (
                    <div
                      key={lvl}
                      className="bg-white border border-slate-200 rounded-lg p-1.5 text-center shadow-2xs flex flex-col justify-center"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-0.5 mb-0.5">
                        <span className="text-[9px] font-extrabold text-slate-800">
                          Nível {lvl}
                        </span>
                        <span className="text-[7.5px] text-slate-400 font-medium">
                          {lvl === 1 ? 'Topo' : lvl === state.numLevels ? 'Base' : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-around text-[8.5px] font-mono font-bold">
                        <span className="text-blue-700 bg-blue-50 px-1 rounded">N{lvl} Esq</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1 rounded">N{lvl} Dir</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 4. CARTÃO UNIFICADO: "RESULTADOS" COM PRESSÃO & RESULTADO ISO     */}
        {/* POUPA ALTURA AO INTEGRAR A ENTRADA DE PRESSÃO E SAÍDAS CALCULADAS */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2">
          
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#114037]" />
              Resultados de Ensaio & Homologação ISO 16122
            </span>
            <span className="text-[9.5px] text-slate-400 font-medium">
              Ajuste a pressão e consulte os débitos e veredito em tempo real
            </span>
          </div>

          {/* Linha Integrada: Controlo de Pressão + 3 Métricas Calculadas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center">
            
            {/* Controlo de Pressão de Ensaio (5/12) */}
            <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200/90 rounded-lg p-2 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 shrink-0">
                <Gauge className="w-3.5 h-3.5 text-[#114037]" />
                <label className="text-[9.5px] font-black uppercase tracking-wider text-slate-700 leading-none">
                  Pressão (Bar):
                </label>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="25"
                  value={state.testPressureBar ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    dispatch({
                      type: 'SET_TEST_PRESSURE',
                      payload: val === '' ? null : Number.parseFloat(val) || null
                    });
                  }}
                  className="w-14 h-7 text-center font-mono font-black text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#114037]"
                />
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={state.testPressureBar ?? 10}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_TEST_PRESSURE',
                      payload: Number.parseFloat(e.target.value) || null
                    })
                  }
                  className="flex-1 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
                <span className="font-mono font-bold text-xs text-[#114037] shrink-0 w-10 text-right">
                  {state.testPressureBar !== null ? `${formatPt(state.testPressureBar, 1)}b` : '--'}
                </span>
              </div>
            </div>

            {/* 3 Métricas Calculadas (7/12) */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-1.5">
              
              {/* 1. Débito Calculado (Q2) */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-1.5 text-center shadow-2xs">
                <span className="block text-[8px] font-extrabold uppercase tracking-tight text-slate-500">
                  Débito Calculado (Q2)
                </span>
                <span className="block font-mono font-black text-xs sm:text-sm text-[#114037]">
                  {theoreticalFlowAtP2 !== null ? `${formatPt(theoreticalFlowAtP2, 2)} ` : '-- '}
                  <span className="text-[8.5px] font-normal">L/min</span>
                </span>
                <span className="text-[7.5px] text-slate-400">por bico individual</span>
              </div>

              {/* 2. Desvio Máximo (+/- 10%) */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-1.5 text-center shadow-2xs">
                <span className="block text-[8px] font-extrabold uppercase tracking-tight text-slate-500">
                  Desvio Máximo (±10%)
                </span>
                <span className="block font-mono font-black text-xs sm:text-sm text-emerald-700">
                  {minTolFlow !== null && maxTolFlow !== null
                    ? `${formatPt(minTolFlow, 2)} – ${formatPt(maxTolFlow, 2)}`
                    : '--'}
                </span>
                <span className="text-[7.5px] text-slate-400">L/min admissível</span>
              </div>

              {/* 3. Débito Total */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-1.5 text-center shadow-2xs">
                <span className="block text-[8px] font-extrabold uppercase tracking-tight text-slate-500">
                  Débito Total
                </span>
                <span className="block font-mono font-black text-xs sm:text-sm text-[#114037]">
                  {totalCalculatedTargetFlow !== null ? `${formatPt(totalCalculatedTargetFlow, 2)} ` : '-- '}
                  <span className="text-[8.5px] font-normal">L/min</span>
                </span>
                <span className="text-[7.5px] text-slate-400">{totalNozzles} bicos alvo</span>
              </div>

            </div>

          </div>

          {/* SUB-SECÇÃO: "RESULTADO ISO 16122" (COMPACTO) */}
          <div
            className={`rounded-lg p-1.5 sm:p-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border transition-all ${
              verdict.overallVerdict === 'CONFORME_ISO_16122'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : verdict.overallVerdict === 'NAO_CONFORME_ISO_16122'
                ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                : 'bg-amber-500/10 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider text-white shadow-2xs ${
                  verdict.overallVerdict === 'CONFORME_ISO_16122'
                    ? 'bg-emerald-600'
                    : verdict.overallVerdict === 'NAO_CONFORME_ISO_16122'
                    ? 'bg-rose-600'
                    : 'bg-amber-500'
                }`}
              >
                Resultado ISO 16122
              </span>

              <div className="flex items-center gap-1.5">
                {verdict.overallVerdict === 'CONFORME_ISO_16122' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : verdict.overallVerdict === 'NAO_CONFORME_ISO_16122' ? (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                )}
                <span className="text-xs font-black">
                  {verdict.overallVerdict === 'CONFORME_ISO_16122'
                    ? 'CONFORME ISO 16122'
                    : verdict.overallVerdict === 'NAO_CONFORME_ISO_16122'
                    ? 'NÃO CONFORME ISO 16122'
                    : 'ENSAIO PENDENTE'}
                </span>
                <span className="text-[9.5px] opacity-75">
                  ({verdict.measuredNozzleCount} de {verdict.activeNozzleCount} bicos medidos)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] opacity-75 uppercase font-bold">Débito Global:</span>
                <strong className="font-mono">{formatPt(verdict.totalMeasured, 2)}</strong>
                <span className="text-[9.5px] opacity-60 font-mono">/ {formatPt(verdict.totalTarget, 2)} alvo</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9.5px] opacity-75 uppercase font-bold">Desvio:</span>
                <strong
                  className={`font-mono px-1 rounded text-[10.5px] font-bold ${
                    verdict.isGlobalDeviationConforming
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {verdict.globalDeviationPercent > 0 ? `+${verdict.globalDeviationPercent}` : verdict.globalDeviationPercent}%
                  {verdict.isGlobalDeviationConforming ? ' (≤ 10%)' : ' (> 10%)'}
                </strong>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[9.5px] opacity-75 uppercase font-bold">Assimetria:</span>
                <strong className="font-mono">{verdict.sideDifferencePercent}%</strong>
                <span className="text-[8.5px] opacity-60">(Tol. ≤ 10%)</span>
              </div>
            </div>
          </div>

          {/* Inconformidades Detetadas Resumidas (se existirem) */}
          {verdict.failureReasons && verdict.failureReasons.length > 0 && (
            <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800">
              <span className="font-bold block text-[9px] uppercase tracking-wider mb-0.5">
                Inconformidades Detetadas:
              </span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                {verdict.failureReasons.slice(0, 2).map((reason, idx) => (
                  <li key={idx} className="truncate">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default SmartDebitoTopCard;
