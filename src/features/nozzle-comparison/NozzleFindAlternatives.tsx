import React from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Check
} from 'lucide-react';
import type {
  Nozzle,
  AlternativeSearchParams
} from './nozzleComparison.types';
import {
  NOZZLES_DATABASE,
  NOZZLES_BY_ID,
  AVAILABLE_BRANDS,
  getGroupedModelsForBrand
} from './nozzleComparison.data';
import {
  findNozzleAlternatives,
  formatPt,
  calculateNozzleFlow
} from './nozzleComparison.calculations';
import { parsePortugueseDecimal } from './nozzleComparison.validation';
import { NozzleSelector } from './NozzleSelector';
import { PressureControl } from './PressureControl';
import { TotalBoomFlowSection } from './TotalBoomFlowSection';
import { NozzleColorBadge } from './NozzleColorBadge';

export interface NozzleFindAlternativesProps {
  onSelectForComparison: (refNozzleId: string, altNozzleId: string, pressureBar: number) => void;
  initialRefNozzleId?: string;
  initialPressureBar?: number;
}

export const NozzleFindAlternatives: React.FC<NozzleFindAlternativesProps> = ({
  onSelectForComparison,
  initialRefNozzleId = 'albuz_atr_80_amarelo',
  initialPressureBar = 3.0
}) => {
  // Modo de Entrada: Por Bico de Referência ou por Débito Desejado
  const [entryMode, setEntryMode] = React.useState<'by_nozzle' | 'by_flow'>('by_nozzle');

  // Estado do Bico de Referência
  const [refBrand, setRefBrand] = React.useState<string>('Albuz');
  const [refModel, setRefModel] = React.useState<string>('ATR');
  const [refSprayAngle, setRefSprayAngle] = React.useState<string | number>(80);
  const [refNozzleId, setRefNozzleId] = React.useState<string>(initialRefNozzleId);

  // Estado do Débito Desejado Manual (L/min)
  const [manualFlowInput, setManualFlowInput] = React.useState<string>('0,80');

  // Pressão de Trabalho (Bar)
  const [workingPressureBar, setWorkingPressureBar] = React.useState<number>(initialPressureBar);

  // Tolerância Selecionada (±5%, ±10%, ±15%)
  const [tolerance, setTolerance] = React.useState<5 | 10 | 15>(5);

  // Filtros Avançados
  const [brandFilter, setBrandFilter] = React.useState<string>('');
  const [nozzleTypeFilter, setNozzleTypeFilter] = React.useState<string>('');
  const [modelFilter, setModelFilter] = React.useState<string>('');
  const [sprayAngleFilter, setSprayAngleFilter] = React.useState<string>('');
  const [onlyTop, setOnlyTop] = React.useState<boolean>(false);
  const [onlyValidated, setOnlyValidated] = React.useState<boolean>(false);
  const [preferLowDrift, setPreferLowDrift] = React.useState<boolean>(false);
  const [cropFilter, setCropFilter] = React.useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState<boolean>(false);

  // Seleção de 2 Bicos Canónicos: Bico A e Bico B
  const [nozzleAId, setNozzleAId] = React.useState<string | null>(null);
  const [nozzleBId, setNozzleBId] = React.useState<string | null>(null);
  const [selectionNotice, setSelectionNotice] = React.useState<string>('');

  // Bico de Referência Resolvido
  const refNozzle: Nozzle | undefined = React.useMemo(() => {
    return NOZZLES_BY_ID.get(refNozzleId);
  }, [refNozzleId]);

  // Débito Alvo (L/min)
  const targetFlowLMin = React.useMemo(() => {
    if (entryMode === 'by_nozzle' && refNozzle) {
      const calc = calculateNozzleFlow(refNozzle, workingPressureBar);
      return calc.flowLMin;
    }
    return parsePortugueseDecimal(manualFlowInput) || 0.80;
  }, [entryMode, refNozzle, workingPressureBar, manualFlowInput]);

  // Modelos agrupados por tipo para o dropdown de filtro
  const groupedModelsForFilter = React.useMemo(() => {
    return getGroupedModelsForBrand(brandFilter || undefined);
  }, [brandFilter]);

  // Extrair ângulos de jato disponíveis para os botões de filtro
  const availableSprayAnglesForFilter = React.useMemo(() => {
    if (modelFilter) {
      const matchingNozzles = NOZZLES_DATABASE.filter(n =>
        (!brandFilter || n.brand === brandFilter) && n.model === modelFilter
      );
      const set = new Set<string | number>();
      matchingNozzles.forEach(n => {
        if (
          !n.isAnglePressureDependent &&
          typeof n.sprayAngleDeg === 'number' &&
          n.sprayAngleDeg > 0
        ) {
          set.add(n.sprayAngleDeg);
        }
      });
      return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }

    const baseResults = findNozzleAlternatives({
      referenceNozzleId: entryMode === 'by_nozzle' ? refNozzleId : undefined,
      targetFlowLMin,
      workingPressureBar,
      tolerancePercentage: tolerance,
      brandFilter: brandFilter || undefined,
      nozzleTypeFilter: nozzleTypeFilter || undefined,
      modelFilter: modelFilter || undefined,
      onlyTop,
      onlyValidated,
      preferLowDrift,
      cropFilter: cropFilter || undefined
    }, NOZZLES_DATABASE);

    const set = new Set<string | number>();
    baseResults.forEach(r => {
      if (
        !r.nozzle.isAnglePressureDependent &&
        typeof r.nozzle.sprayAngleDeg === 'number' &&
        r.nozzle.sprayAngleDeg > 0
      ) {
        set.add(r.nozzle.sprayAngleDeg);
      }
    });

    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [
    entryMode,
    refNozzleId,
    targetFlowLMin,
    workingPressureBar,
    tolerance,
    brandFilter,
    nozzleTypeFilter,
    modelFilter,
    onlyTop,
    onlyValidated,
    preferLowDrift,
    cropFilter
  ]);

  // Executar Pesquisa de Alternativas com o Filtro de Ângulo
  const searchResults = React.useMemo(() => {
    const params: AlternativeSearchParams = {
      referenceNozzleId: entryMode === 'by_nozzle' ? refNozzleId : undefined,
      targetFlowLMin,
      workingPressureBar,
      tolerancePercentage: tolerance,
      brandFilter: brandFilter || undefined,
      nozzleTypeFilter: nozzleTypeFilter || undefined,
      modelFilter: modelFilter || undefined,
      sprayAngleFilter: sprayAngleFilter || undefined,
      onlyTop,
      onlyValidated,
      preferLowDrift,
      cropFilter: cropFilter || undefined
    };

    return findNozzleAlternatives(params, NOZZLES_DATABASE);
  }, [
    entryMode,
    refNozzleId,
    targetFlowLMin,
    workingPressureBar,
    tolerance,
    brandFilter,
    nozzleTypeFilter,
    modelFilter,
    sprayAngleFilter,
    onlyTop,
    onlyValidated,
    preferLowDrift,
    cropFilter
  ]);

  // Regra 8 e 9: Ao alterar filtros ou pressão, purgar apenas seleções que já não existam nos resultados
  React.useEffect(() => {
    const validIds = new Set(searchResults.map(r => r.nozzle.id));

    let currentA = nozzleAId;
    let currentB = nozzleBId;

    if (currentA && !validIds.has(currentA)) {
      currentA = null;
    }
    if (currentB && !validIds.has(currentB)) {
      currentB = null;
    }

    // Normalização: se Bico A ficou vago mas Bico B existe, promover Bico B a Bico A
    if (!currentA && currentB) {
      currentA = currentB;
      currentB = null;
    }

    if (currentA !== nozzleAId) setNozzleAId(currentA);
    if (currentB !== nozzleBId) setNozzleBId(currentB);
  }, [searchResults]);

  // Gestão Canónica de Seleção (Bico A e Bico B)
  const handleToggleSelection = (nId: string) => {
    if (nId === nozzleAId) {
      if (nozzleBId) {
        setNozzleAId(nozzleBId);
        setNozzleBId(null);
      } else {
        setNozzleAId(null);
      }
      setSelectionNotice('');
      return;
    }

    if (nId === nozzleBId) {
      setNozzleBId(null);
      setSelectionNotice('');
      return;
    }

    if (!nozzleAId) {
      setNozzleAId(nId);
      setSelectionNotice('');
      return;
    }

    if (!nozzleBId) {
      setNozzleBId(nId);
      setSelectionNotice('');
      return;
    }

    setSelectionNotice('Já selecionou dois bicos. Remova uma seleção para escolher outro.');
  };

  const handleClearAllSelections = () => {
    setNozzleAId(null);
    setNozzleBId(null);
    setSelectionNotice('');
  };

  const handleCompareSelected = () => {
    if (nozzleAId && nozzleBId) {
      onSelectForComparison(nozzleAId, nozzleBId, workingPressureBar);
    }
  };

  const handleResetFilters = () => {
    setBrandFilter('');
    setNozzleTypeFilter('');
    setModelFilter('');
    setSprayAngleFilter('');
    setOnlyTop(false);
    setOnlyValidated(false);
    setPreferLowDrift(false);
    setCropFilter('');
  };

  // Listas Dinâmicas de Filtros
  const availableNozzleTypes = React.useMemo(() => {
    const set = new Set<string>();
    NOZZLES_DATABASE.forEach(n => {
      if (n.nozzleType) set.add(n.nozzleType);
    });
    return Array.from(set).sort();
  }, []);

  const selectedCount = (nozzleAId ? 1 : 0) + (nozzleBId ? 1 : 0);
  const isComparisonReady = selectedCount === 2;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. SELETOR DE MODO DE ENTRADA */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-daterra-primary tracking-wider">
              Objetivo de Pulverização
            </span>
            <h2 className="text-lg font-black text-slate-900">
              Definir débito alvo ou bico atual
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setEntryMode('by_nozzle')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                entryMode === 'by_nozzle'
                  ? 'bg-white text-daterra-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partir de um bico existente
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('by_flow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                entryMode === 'by_flow'
                  ? 'bg-white text-daterra-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inserir débito alvo (L/min)
            </button>
          </div>
        </div>

        {/* MODO A: A PARTIR DE BICO EXISTENTE */}
        {entryMode === 'by_nozzle' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Selecione o bico atualmente montado no seu pulverizador para procurar alternativas equivalentes.
            </p>
            <NozzleSelector
              side="A"
              title="Bico de Referência"
              selectedBrand={refBrand}
              selectedModel={refModel}
              selectedSprayAngle={refSprayAngle}
              selectedNozzleId={refNozzleId}
              onBrandChange={brand => {
                setRefBrand(brand);
                setRefModel('');
                setRefSprayAngle('');
                setRefNozzleId('');
              }}
              onModelChange={model => {
                setRefModel(model);
                setRefSprayAngle('');
                setRefNozzleId('');
              }}
              onSprayAngleChange={angle => setRefSprayAngle(angle)}
              onNozzleChange={id => setRefNozzleId(id)}
              selectedNozzle={refNozzle}
            />
          </div>
        ) : (
          /* MODO B: POR DÉBITO MANUAL */
          <div className="space-y-4 max-w-md">
            <div>
              <label htmlFor="manual-target-flow" className="block text-xs font-bold text-slate-700 mb-1">
                Débito Alvo Desejado por Bico (L/min)
              </label>
              <div className="relative">
                <input
                  id="manual-target-flow"
                  type="text"
                  value={manualFlowInput}
                  onChange={e => setManualFlowInput(e.target.value)}
                  placeholder="Ex: 0,80"
                  className="w-full h-12 px-4 pr-16 bg-slate-50 border border-slate-300 rounded-2xl text-base font-black text-slate-900 font-mono-numbers focus:border-daterra-primary focus:bg-white outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  L/min
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CONTROLO DE PRESSÃO DE TRABALHO E TOLERÂNCIA */}
      <div className="space-y-4">
        <PressureControl
          workingPressureBar={workingPressureBar}
          onChangePressure={setWorkingPressureBar}
          nozzleA={refNozzle}
        />

        {/* Tolerância de Débito (±5%, ±10%, ±15%) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black text-slate-900 block">
              Tolerância de proximidade de débito
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Gama admissível em redor do débito alvo de {formatPt(targetFlowLMin, 2)} L/min.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[5, 10, 15].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTolerance(t as 5 | 10 | 15)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  tolerance === t
                    ? 'bg-daterra-primary text-white shadow-sm ring-2 ring-daterra-accent/40'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ±{t}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FILTROS AVANÇADOS DE CATÁLOGO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-expanded={isFiltersOpen}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-daterra-primary" />
              <span className="text-sm font-black text-slate-900">
                Filtros avançados de catálogo
              </span>
              {(brandFilter || nozzleTypeFilter || modelFilter || sprayAngleFilter || onlyTop || onlyValidated || preferLowDrift || cropFilter) && (
                <span className="w-2.5 h-2.5 rounded-full bg-daterra-accent" />
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFiltersOpen && (
            <div className="pt-4 mt-3 border-t border-slate-100 space-y-4 animate-fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Filtro Marca */}
                <div>
                  <label htmlFor="filter-brand" className="block font-bold text-slate-700 mb-1">
                    Marca / Fabricante
                  </label>
                  <select
                    id="filter-brand"
                    value={brandFilter}
                    onChange={e => {
                      setBrandFilter(e.target.value);
                      setModelFilter('');
                      setSprayAngleFilter('');
                    }}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Todas as marcas</option>
                    {AVAILABLE_BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Tipo de Bico */}
                <div>
                  <label htmlFor="filter-type" className="block font-bold text-slate-700 mb-1">
                    Tipo de Bico
                  </label>
                  <select
                    id="filter-type"
                    value={nozzleTypeFilter}
                    onChange={e => setNozzleTypeFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Todos os tipos</option>
                    {availableNozzleTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Modelo de Bico (Dropdown agrupada por tipo) */}
                <div>
                  <label htmlFor="filter-model" className="block font-bold text-slate-700 mb-1">
                    Modelo de Bico
                  </label>
                  <select
                    id="filter-model"
                    value={modelFilter}
                    onChange={e => {
                      setModelFilter(e.target.value);
                      setSprayAngleFilter('');
                    }}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Todos os modelos</option>
                    {groupedModelsForFilter.map(g => (
                      <optgroup key={g.group} label={`── ${g.group} ──`} className="font-black text-slate-400">
                        {g.models.map(m => (
                          <option key={m.model} value={m.model} className="font-bold text-slate-900">
                            {m.model} ({m.nozzleType})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Filtro Setor / Cultura */}
                <div>
                  <label htmlFor="filter-crop" className="block font-bold text-slate-700 mb-1">
                    Setor Agronómico
                  </label>
                  <select
                    id="filter-crop"
                    value={cropFilter}
                    onChange={e => setCropFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Todos os setores</option>
                    <option value="Arboricultura">Arboricultura / Pomares</option>
                    <option value="Viticultura">Viticultura / Vinhas</option>
                    <option value="Culturas Baixas">Culturas Baixas / Grandes Culturas</option>
                  </select>
                </div>

                {/* Botões de Seleção Rápida de Ângulo de Jato (quando há >= 2 ângulos) */}
                {availableSprayAnglesForFilter.length >= 2 && (
                  <div className="col-span-full space-y-1 pt-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Ângulo do jato {modelFilter ? `(${modelFilter})` : ''}
                    </label>

                    <div className="flex flex-wrap gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setSprayAngleFilter('')}
                        aria-pressed={!sprayAngleFilter}
                        aria-label="Todos os ângulos de jato"
                        className={`px-3 py-1 rounded-xl text-xs font-semibold leading-normal transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                          !sprayAngleFilter
                            ? 'bg-[#064e3b] text-white border border-[#064e3b] shadow-xs font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 active:scale-95'
                        }`}
                      >
                        {!sprayAngleFilter && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                        <span>Todos os ângulos</span>
                      </button>

                      {availableSprayAnglesForFilter.map(ang => {
                        const isSel = String(sprayAngleFilter) === String(ang);
                        return (
                          <button
                            key={String(ang)}
                            type="button"
                            onClick={() => setSprayAngleFilter(isSel ? '' : String(ang))}
                            aria-pressed={isSel}
                            aria-label={`Selecionar ângulo de jato ${ang} graus`}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold leading-normal transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSel
                                ? 'bg-[#064e3b] text-white border border-[#064e3b] shadow-xs font-bold'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 active:scale-95'
                            }`}
                          >
                            {isSel && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                            <span>{ang}°</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles de Filtro */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={onlyTop}
                        onChange={e => setOnlyTop(e.target.checked)}
                        className="rounded text-daterra-primary focus:ring-daterra-accent w-4 h-4"
                      />
                      <span>Mostrar apenas referências frequentes no mercado português</span>
                    </label>
                    <p className="text-[10px] text-slate-500 font-medium pl-6 max-w-lg leading-relaxed">
                      Esta marcação identifica referências frequentes no mercado português. Não significa superioridade técnica nem adequação a todas as condições de aplicação.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={preferLowDrift}
                      onChange={e => setPreferLowDrift(e.target.checked)}
                      className="rounded text-daterra-primary focus:ring-daterra-accent w-4 h-4"
                    />
                    <span>Preferência por menor sensibilidade potencial à deriva</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    aria-label="Limpar todos os filtros de catálogo"
                    className="text-xs text-slate-600 hover:text-slate-900 font-bold ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-200 bg-slate-100 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpar filtros</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. SECÇÃO OPCIONAL DE DÉBITO TOTAL DO CONJUNTO */}
      <TotalBoomFlowSection
        flowPerNozzleLMin={targetFlowLMin}
        nozzleLabel={entryMode === 'by_nozzle' && refNozzle ? `${refNozzle.brand} ${refNozzle.model}` : 'Débito Alvo'}
      />

      {/* 5. RESULTADOS E SELEÇÃO DE DOIS BICOS: BICO A E BICO B */}
      <div className="space-y-4">
        
        {/* Barra Superior de Estado da Seleção */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Alternativas para analisar
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                {searchResults.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Bicos com débito dentro de ±{tolerance}% a {formatPt(workingPressureBar, 1)} bar (Alvo: {formatPt(targetFlowLMin, 2)} L/min).
            </p>
          </div>

          {/* Painel de Controlo de Seleção de 2 Bicos */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                selectedCount === 2
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : selectedCount === 1
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                Selecionados: {selectedCount} de 2
              </span>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSelections}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={!isComparisonReady}
              onClick={handleCompareSelected}
              aria-label="Comparar 2 bicos selecionados no comparador"
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 min-h-[44px] shadow-sm active:scale-95 cursor-pointer ${
                isComparisonReady
                  ? 'bg-daterra-primary text-white hover:bg-daterra-primary/90 shadow-md ring-2 ring-daterra-accent/40'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <span>Comparar 2 bicos selecionados</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mensagem Orientadora de Seleção Bloqueada (3º bico) */}
        {selectionNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{selectionNotice}</span>
          </div>
        )}

        {/* Grelha de Resultados */}
        {searchResults.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-black text-slate-800">
              Nenhuma alternativa encontrada para estes parâmetros
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Experimente aumentar a tolerância (ex: ±10% ou ±15%), ajustar a pressão de trabalho ou limpar os filtros de marca e tipo de bico.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map(res => {
              const n = res.nozzle;
              const flow = res.calculatedFlow;
              const isA = nozzleAId === n.id;
              const isB = nozzleBId === n.id;
              const isSelected = isA || isB;
              const badgeText = isA ? 'Bico A' : isB ? 'Bico B' : null;

              const diffPrefix = res.flowDiffPercentage > 0 ? '+' : '';
              const diffText = res.isExactMatch
                ? 'Débito exato'
                : `${diffPrefix}${formatPt(res.flowDiffPercentage, 1)}%`;

              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-3xl border p-4 sm:p-5 transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                      : 'border-slate-200 hover:border-daterra-accent/50 shadow-soft'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Topo do Cartão de Alternativa */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                          {n.brand}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {n.modelNorm}
                        </h4>
                        <div className="pt-1">
                          <NozzleColorBadge nozzle={n} size="sm" showFlow={true} />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {badgeText && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black shadow-sm">
                            {badgeText}
                          </span>
                        )}

                        {n.isTop && (
                          <span
                            title="Referência frequente no mercado português"
                            className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300"
                          >
                            Ref. PT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Débito e Diferença Percentual */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Débito a {formatPt(workingPressureBar, 1)} bar:</span>
                        <span className="text-xl font-black text-slate-900 font-mono-numbers">
                          {formatPt(flow.flowLMin, 2)} <span className="text-xs font-bold text-slate-500">L/min</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block">Diferença:</span>
                        <span
                          className={`text-xs font-black font-mono-numbers px-2 py-0.5 rounded-md ${
                            res.isExactMatch
                              ? 'bg-emerald-100 text-emerald-900'
                              : res.flowDiffPercentage > 0
                              ? 'bg-sky-100 text-sky-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {diffText}
                        </span>
                      </div>
                    </div>

                    {/* Bloco de Deriva Simplificado */}
                    <div
                      aria-label={`${res.shortDriftLevel}, ${res.driftOriginSummary}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                        res.shortDriftLevel === 'Deriva: Baixa'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-bold'
                          : res.shortDriftLevel === 'Deriva: Média'
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-950 font-bold'
                          : res.shortDriftLevel === 'Deriva: Elevada'
                          ? 'bg-rose-50 border-rose-200 text-rose-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
                        <span>{res.shortDriftLevel}</span>
                      </div>
                      <span className="text-[10px] font-semibold opacity-75">{res.driftOriginSummary}</span>
                    </div>

                    {/* Origem e Tipo */}
                    <div className="space-y-1 text-[11px] text-slate-600 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span>Origem do débito:</span>
                        <span className="font-extrabold text-slate-800">{flow.originBadgeText}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Tipo de bico:</span>
                        <span className="font-bold text-slate-700">{n.nozzleType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ação: Seleção para Comparação de Bico A / Bico B */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleSelection(n.id)}
                      aria-label={`Selecionar ${n.modelNorm} para comparação`}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-sm active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Selecionado ({badgeText}) — Remover</span>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4 rounded-md border-2 border-white/60 flex items-center justify-center text-[10px]">
                            +
                          </span>
                          <span>Selecionar para Comparar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
