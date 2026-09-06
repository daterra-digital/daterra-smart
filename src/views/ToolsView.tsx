import React, { useState } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Search, X, CheckCircle2, Download, ArrowRight, Plus, Trash2,
  FlaskConical, Calculator, Gauge, Trees, Scale, ClipboardCheck, 
  CloudSun, Layers, Tractor, ChevronLeft, SlidersHorizontal, 
  Sparkles, Save, Sprout, AlertCircle, Leaf
} from 'lucide-react';

import { db } from '../db/db';
import { DaterraKeypad } from '../components/DaterraKeypad';
import { DidacticHelp } from '../features/concentracao/DidacticHelp';
import { useLanguage } from '../context/LanguageContext';
import { AreaParedeFoliarCalculator } from '../features/area-parede-foliar';
import { UniversalCalculatorTemplate } from '../features/calculators/core/index.ts';
import { doseCalculatorConfig } from '../features/calculators/definitions/doseCalculatorConfig.ts';
import { concentracaoCalculatorConfig } from '../features/calculators/definitions/concentracaoCalculatorConfig.ts';
import { velocidadeRealCalculatorConfig } from '../features/calculators/definitions/velocidadeRealCalculatorConfig.ts';

export interface ToolModule {
  id: string;
  name: string;
  category: 'Calibração' | 'Pulverização' | 'Gestão' | 'Clima';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCore?: boolean;
  caminho?: string;
  prioridade?: string;
}

// Catálogo de Ferramentas e Funcionalidades Agronómicas
const TOOLS_CATALOG: ToolModule[] = [
  {
    id: 'comparador_bicos',
    name: 'Comparador de Bicos de Pulverização',
    category: 'Calibração',
    description: 'Compare débitos técnicos reais, curvas de pressão e espectro de gotas de dois bicos em simultâneo.',
    icon: Scale,
    isCore: true,
    caminho: '/ferramentas/comparador-bicos',
    prioridade: 'alta'
  },
  {
    id: 'calc_concentracao',
    name: 'Calculadora de Concentração da Calda',
    category: 'Pulverização',
    description: 'Calcula a quantidade exata de pesticida a diluir por depósito para Planta Jovem ou Copa Adulta.',
    icon: FlaskConical,
    isCore: true
  },
  {
    id: 'calc_dose',
    name: 'Calculadora de Dose por Hectare',
    category: 'Pulverização',
    description: 'Converte a dose do rótulo (L/ha ou kg/ha) para a calda do depósito e calcula a área coberta por tanque.',
    icon: Calculator,
    isCore: true
  },
  {
    id: 'calc_velocidade_real',
    name: 'Velocidade Real de Trabalho',
    category: 'Calibração',
    description: 'Calcule a velocidade real do equipamento no campo para apoiar a calibração.',
    icon: Gauge,
    isCore: true,
    prioridade: 'alta'
  },
  {
    id: 'calc_area_parede_foliar',
    name: 'Área de Parede Foliar',
    category: 'Calibração',
    description: 'Calcula a área de parede foliar por hectare (LWA - Leaf Wall Area).',
    icon: Leaf,
    isCore: true,
    caminho: '/ferramentas/area-parede-foliar',
    prioridade: 'alta'
  },
  {
    id: 'calibracao_bicos',
    name: 'Calibração e Débito de Bicos',
    category: 'Calibração',
    description: 'Afera o débito real em proveta por bico e deteta desvios de desgaste acima de ±10% (Norma ISO 16122).',
    icon: Gauge
  },
  {
    id: 'calc_volume_copa',
    name: 'Volume de Copa (TRV)',
    category: 'Calibração',
    description: 'Determina a massa foliar tridimensional (m³/ha) em pomares e vinhas para cálculo de dosagem proporcional.',
    icon: Trees,
    isCore: true,
    caminho: '/ferramentas/volume-copa',
    prioridade: 'alta'
  },
  {
    id: 'calc_volume_calda_trv',
    name: 'Volume de Calda Adequado por TRV',
    category: 'Calibração',
    description: 'Estima o volume de calda por hectare com base no Volume de Copa (TRV) e num coeficiente técnico de calibração.',
    icon: FlaskConical,
    isCore: true,
    caminho: '/ferramentas/volume-calda-trv',
    prioridade: 'alta'
  },
  {
    id: 'calc_debito_total',
    name: 'Débito Total do Pulverizador',
    category: 'Calibração',
    description: 'Calcula o débito global do pulverizador a partir do volume de calda, velocidade de trabalho e largura efetiva tratada.',
    icon: Gauge,
    isCore: true,
    caminho: '/ferramentas/debito-total',
    prioridade: 'alta'
  },
  {
    id: 'calc_eppo',
    name: 'Calculadora EPPO (LWA / TRV)',
    category: 'Pulverização',
    description: 'Calcula o volume de calda e dosagem de produto por depósito e por hectare pela metodologia EPPO PP 1/239.',
    icon: FlaskConical,
    isCore: true,
    caminho: '/ferramentas/eppo',
    prioridade: 'alta'
  },
  {
    id: 'gestao_caderno_campo',
    name: 'Caderno de Campo Digital DGAV',
    category: 'Gestão',
    description: 'Registo digital de tratamentos fitossanitários com verificação automática de limites SIFITO.',
    icon: ClipboardCheck
  },
  {
    id: 'clima_estacao_agricola',
    name: 'Estação Climática & Risco de Deriva',
    category: 'Clima',
    description: 'Monitorização em tempo real da velocidade do vento, humidade e temperatura com alertas de deriva.',
    icon: CloudSun
  },
  {
    id: 'mistura_compatibilidade',
    name: 'Guia de Sequência de Mistura',
    category: 'Pulverização',
    description: 'Ordem correta de adição de produtos no depósito para evitar floculação e inativação de substâncias.',
    icon: Layers,
    isCore: true,
    caminho: '/ferramentas/mistura',
    prioridade: 'alta'
  },
  {
    id: 'gestao_exploracoes',
    name: 'Gestão de Explorações e Parcelas',
    category: 'Gestão',
    description: 'Registo centralizado de parcelas, culturas, pulverizadores e bicos da exploração agrícola.',
    icon: Tractor
  }
];

type CategoryFilter = 'Todas' | 'Calibração' | 'Pulverização' | 'Gestão' | 'Clima';

export const formatNumberPt = (num: number, minDecimals = 0, maxDecimals = 2): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    useGrouping: false
  }).format(num);
};

export interface SmartResultFormat {
  mainText: string;
  subText: string;
  rawSmall: number;
  smallUnit: string;
  rawLarge: number;
  largeUnit: string;
  isLargePrimary: boolean;
}

export const getSmartFormattedResult = (
  amountInSmallUnits: number,
  isSolid: boolean = false
): SmartResultFormat => {
  const smallUnit = isSolid ? 'g' : 'mL';
  const largeUnit = isSolid ? 'kg' : 'L';
  
  const rawSmall = amountInSmallUnits;
  const rawLarge = amountInSmallUnits / 1000;
  
  const isLargePrimary = rawSmall >= 1000;

  const formattedLarge = formatNumberPt(rawLarge, 2, 2) + ' ' + largeUnit;
  const formattedSmall = formatNumberPt(rawSmall, 0, 2) + ' ' + smallUnit;

  if (isLargePrimary) {
    return {
      mainText: formattedLarge,
      subText: formattedSmall,
      rawSmall,
      smallUnit,
      rawLarge,
      largeUnit,
      isLargePrimary: true
    };
  } else {
    return {
      mainText: formattedSmall,
      subText: formattedLarge,
      rawSmall,
      smallUnit,
      rawLarge,
      largeUnit,
      isLargePrimary: false
    };
  }
};

export const ToolsView: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentViewTool = searchParams.get('tool'); // ferramenta em execução (ex: calc_concentracao, calc_dose)

  
  // Estado da Pesquisa e Filtros no Hub de Ferramentas
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Todas');
  const [installingToolId, setInstallingToolId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Leitura do IndexedDB via Dexie das Ferramentas Instaladas
  const installedToolItems = useLiveQuery(() => db.installed_tools.toArray(), []);
  const installedToolIds = new Set(installedToolItems?.map(t => t.tool_id) || ['calc_concentracao', 'calc_dose', 'calc_area_parede_foliar', 'mistura_compatibilidade']);

  // --- ESTADOS INTERNOS DAS CALCULADORAS ---
  // Concentração
  const [concMode, setConcMode] = useState<'jovem' | 'adulta'>('jovem');
  const [concValue, setConcValue] = useState<number>(100);
  const [concUnit, setConcUnit] = useState<string>('mL/hL');
  const [volPrepararConc, setVolPrepararConc] = useState<number>(400);
  const [volRecomendado, setVolRecomendado] = useState<number>(1000);
  const [volAplicado, setVolAplicado] = useState<number>(400);

  // Dose
  const [volPrepararDose, setVolPrepararDose] = useState<number>(1000);
  const [doseValue, setDoseValue] = useState<number>(2);
  const [doseUnit, setDoseUnit] = useState<string>('L/ha');
  const [volCalda, setVolCalda] = useState<number>(200);

  // Teclado Numérico DATERRA
  const [keypadOpen, setKeypadOpen] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<any | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Instalação de uma nova Ferramenta / Funcionalidade

  const handleInstallTool = async (tool: ToolModule) => {
    setInstallingToolId(tool.id);
    setTimeout(async () => {
      try {
        await db.installed_tools.put({
          tool_id: tool.id,
          installed_at: new Date().toISOString()
        });
        setInstallingToolId(null);
        setToastMessage(`A ferramenta "${tool.name}" foi instalada com sucesso!`);
        setTimeout(() => setToastMessage(null), 3500);
      } catch (err) {
        console.error('Erro ao instalar ferramenta:', err);
        setInstallingToolId(null);
      }
    }, 600);
  };

  // Desinstalação / Toggle de remoção de uma Ferramenta
  const handleUninstallTool = async (toolId: string, toolName: string) => {
    try {
      await db.installed_tools.where('tool_id').equals(toolId).delete();
      setToastMessage(`A ferramenta "${toolName}" foi desinstalada.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao desinstalar ferramenta:', err);
    }
  };



  // Abrir uma Ferramenta / Funcionalidade
  const handleOpenTool = (toolId: string) => {
    if (toolId === 'geometria_trv_copa' || toolId === 'calc_volume_copa') {
      navigate('/ferramentas/volume-copa');
      return;
    }
    if (toolId === 'calc_volume_calda_trv') {
      navigate('/ferramentas/volume-calda-trv');
      return;
    }
    if (toolId === 'comparador_bicos') {
      navigate('/ferramentas/comparador-bicos');
      return;
    }
    if (toolId === 'calc_debito_total') {
      navigate('/ferramentas/debito-total');
      return;
    }
    if (toolId === 'mistura_compatibilidade') {
      navigate('/ferramentas/mistura');
      return;
    }
    const found = TOOLS_CATALOG.find(t => t.id === toolId);
    if (found?.caminho) {
      navigate(found.caminho);
    } else {
      setSearchParams({ tool: toolId });
      window.scrollTo(0, 0);
    }
  };

  // Voltar ao catálogo principal de Ferramentas
  const handleBackToCatalog = () => {
    setSearchParams({});
    window.scrollTo(0, 0);
  };

  // Filtro Dinâmico do Catálogo de Ferramentas
  const filteredTools = TOOLS_CATALOG.filter(tool => {
    const matchesCategory = selectedCategory === 'Todas' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- LÓGICA DE CÁLCULO DAS CALCULADORAS ---
  const calculateConcentrationResult = () => {
    let resultInSmall = 0;
    const isPercent = concUnit === '%';
    const isSolid = ['g/hL', 'kg/hL'].includes(concUnit);

    let rawConc = concValue;
    if (concUnit === 'L/hL' || concUnit === 'kg/hL' || isPercent) {
      rawConc = concValue * 1000;
    }

    if (concMode === 'jovem') {
      resultInSmall = (rawConc * volPrepararConc) / 100;
    } else {
      if (volAplicado > 0) {
        resultInSmall = (volPrepararConc * rawConc * volRecomendado) / (volAplicado * 100);
      }
    }

    const smart = getSmartFormattedResult(resultInSmall, isSolid);

    return {
      quantidade_pf: Number(resultInSmall.toFixed(2)),
      unit_pf: isSolid ? 'g' : 'mL',
      smart
    };
  };

  const calculateDoseResult = () => {
    let resultInSmall = 0;
    const isSolid = doseUnit.includes('kg');

    let rawDose = doseValue;
    if (doseUnit === 'L/ha' || doseUnit === 'kg/ha') {
      rawDose = doseValue * 1000;
    }

    if (volCalda > 0) {
      resultInSmall = (volPrepararDose * rawDose) / volCalda;
    }

    const areaTratada = volCalda > 0 ? volPrepararDose / volCalda : 0;
    const smart = getSmartFormattedResult(resultInSmall, isSolid);

    return {
      quantidade_pf: Number(resultInSmall.toFixed(2)),
      unit_pf: isSolid ? 'g' : 'mL',
      area_tratada_ha: Number(areaTratada.toFixed(2)),
      smart
    };
  };

  const handleSaveToHistory = async (type: 'concentracao_jovem' | 'concentracao_adulta' | 'dose') => {
    try {
      if (type.startsWith('concentracao')) {
        const res = calculateConcentrationResult();
        await db.calculation_history.add({
          date: new Date().toISOString(),
          calculator_type: type,
          inputs: { concMode, concValue, concUnit, volPrepararConc, volRecomendado, volAplicado },
          result: { quantidade_pf: res.quantidade_pf, unit_pf: res.unit_pf }
        });
      } else {
        const res = calculateDoseResult();
        await db.calculation_history.add({
          date: new Date().toISOString(),
          calculator_type: type,
          inputs: { volPrepararDose, doseValue, doseUnit, volCalda },
          result: { quantidade_pf: res.quantidade_pf, unit_pf: res.unit_pf, area_tratada_ha: res.area_tratada_ha }
        });
      }
      setSaveSuccessMsg('Cálculo guardado com sucesso no Histórico!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Erro ao guardar no histórico:', err);
    }
  };

  const openKeypad = (config: any) => {
    setActiveField(config);
    setKeypadOpen(true);
  };

  const handleKeypadConfirm = (valInput: number | string, unit?: string) => {
    const val = typeof valInput === 'number' ? valInput : parseFloat(String(valInput).replace(',', '.')) || 0;
    if (!activeField) return;


    switch (activeField.key) {
      case 'concValue':
        setConcValue(val);
        if (unit) setConcUnit(unit);
        break;
      case 'volPrepararConc':
        setVolPrepararConc(val);
        break;
      case 'volRecomendado':
        setVolRecomendado(val);
        break;
      case 'volAplicado':
        setVolAplicado(val);
        break;
      case 'volPrepararDose':
        setVolPrepararDose(val);
        break;
      case 'doseValue':
        setDoseValue(val);
        if (unit) setDoseUnit(unit);
        break;
      case 'volCalda':
        setVolCalda(val);
        break;
    }
  };

  const concOutput = calculateConcentrationResult();

  // --- SE UMA FERRAMENTA ESPECÍFICA ESTIVER EM EXECUÇÃO ---
  if (currentViewTool === 'calc_volume_copa' || currentViewTool === 'geometria_trv_copa') {
    return <Navigate to="/ferramentas/volume-copa" replace />;
  }

  if (currentViewTool === 'calc_volume_calda_trv') {
    return <Navigate to="/ferramentas/volume-calda-trv" replace />;
  }

  if (currentViewTool === 'calc_debito_total') {
    return <Navigate to="/ferramentas/debito-total" replace />;
  }

  if (currentViewTool === 'calc_eppo') {
    return <Navigate to="/ferramentas/eppo" replace />;
  }

  if (currentViewTool === 'calc_area_parede_foliar') {
    return <AreaParedeFoliarCalculator />;
  }

  if (currentViewTool === 'calc_dose') {
    return (
      <UniversalCalculatorTemplate
        definition={doseCalculatorConfig}
        onBack={handleBackToCatalog}
        onExecuteTransfer={(targetToolId) => handleOpenTool(targetToolId)}
      />
    );
  }

  if (currentViewTool === 'calc_concentracao') {
    return (
      <UniversalCalculatorTemplate
        definition={concentracaoCalculatorConfig}
        onBack={handleBackToCatalog}
      />
    );
  }

  if (currentViewTool === 'calc_velocidade_real') {
    return (
      <UniversalCalculatorTemplate
        definition={velocidadeRealCalculatorConfig}
        onBack={handleBackToCatalog}
      />
    );
  }

  if (currentViewTool) {
    const currentToolData = TOOLS_CATALOG.find(t => t.id === currentViewTool);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Barra Superior de Regresso ao Catálogo de Ferramentas */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToCatalog}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target"
            >
              <ChevronLeft className="w-4 h-4 text-[#114037]" />
              <span>Voltar às Ferramentas</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent">
                {currentToolData?.category || 'Funcionalidade Agronómica'}
              </span>
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
                {currentToolData?.name || 'Ferramenta DATERRA Smart'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ferramenta Ativa</span>
            </span>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* MÓDULO 1: CALCULADORA DE CONCENTRAÇÃO */}
        {currentViewTool === 'calc_concentracao' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Formulário */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold text-daterra-primary">
                    Calculadora de Concentração
                  </h2>
                  <DidacticHelp faqFile="ConcentracaoFAQGeral.md" buttonLabel="Ajuda" />
                </div>
                <p className="text-xs text-slate-500">
                  Selecione o estado vegetativo para ajustar os parâmetros de molhamento e volume.
                </p>
              </div>

              {/* Modo Planta Jovem vs Planta Adulta */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setConcMode('jovem')}
                    className={`py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 touch-target ${
                      concMode === 'jovem'
                        ? 'bg-daterra-accent text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sprout className="w-4 h-4" />
                    <span>Planta Jovem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConcMode('adulta')}
                    className={`py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 touch-target ${
                      concMode === 'adulta'
                        ? 'bg-daterra-primary text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Trees className="w-4 h-4" />
                    <span>Planta Adulta</span>
                  </button>
                </div>
              </div>

              {/* Inputs Planta Jovem */}
              {concMode === 'jovem' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Concentração do Produto</label>
                      <DidacticHelp faqFile="ConcentracaoFAQConcentracao.md" buttonLabel="Ajuda" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'concValue',
                          label: 'Concentração do Produto',
                          value: concValue,
                          unit: concUnit,
                          availableUnits: ['mL/hL', 'g/hL', '%', 'L/hL', 'kg/hL'],
                          commonValues: [50, 100, 200, 300, 400, 500, 1000, 1500]
                        })
                      }
                      value={`${formatNumberPt(concValue)} ${concUnit}`}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer hover:border-daterra-accent outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Volume a Preparar (L)</label>
                      <DidacticHelp faqFile="ConcentracaoFAQVolumePreparar.md" buttonLabel="Ajuda" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'volPrepararConc',
                          label: 'Volume de Calda a Preparar',
                          value: volPrepararConc,
                          unit: 'L',
                          availableUnits: ['L'],
                          commonValues: [50, 100, 200, 300, 400, 500, 1000, 1500]
                        })
                      }
                      value={`${formatNumberPt(volPrepararConc)} L`}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Inputs Planta Adulta */}
              {concMode === 'adulta' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Volume a Preparar (L)</label>
                      <DidacticHelp faqFile="ConcentracaoFAQVolumePreparar.md" buttonLabel="Ajuda" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'volPrepararConc',
                          label: 'Volume a Preparar (L)',
                          value: volPrepararConc,
                          unit: 'L',
                          availableUnits: ['L'],
                          commonValues: [50, 100, 200, 300, 400, 500, 1000, 1500]
                        })
                      }
                      value={`${formatNumberPt(volPrepararConc)} L`}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Concentração do Produto</label>
                      <DidacticHelp faqFile="ConcentracaoFAQConcentracao.md" buttonLabel="Ajuda" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'concValue',
                          label: 'Concentração do Produto',
                          value: concValue,
                          unit: concUnit,
                          availableUnits: ['mL/hL', 'g/hL', '%', 'L/hL', 'kg/hL'],
                          commonValues: [50, 100, 200, 300, 400, 500, 1000, 1500]
                        })
                      }
                      value={`${formatNumberPt(concValue)} ${concUnit}`}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Volume Recomendado (L/ha)</label>
                      <DidacticHelp faqFile="ConcentracaoFAQVolumeRecomendado.md" buttonLabel="Ajuda" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'volRecomendado',
                          label: 'Volume Recomendado (L/ha)',
                          value: volRecomendado,
                          unit: 'L/ha',
                          availableUnits: ['L/ha'],
                          commonValues: [50, 100, 200, 300, 400, 500, 1000, 1500]
                        })
                      }
                      value={`${formatNumberPt(volRecomendado)} L/ha`}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Volume Real Aplicado (L/ha)</label>
                      <DidacticHelp faqFile="ConcentracaoFAQVolumeAplicado.md" buttonLabel="Ajuda" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'volAplicado',
                          label: 'Volume Real Aplicado (L/ha)',
                          value: volAplicado,
                          unit: 'L/ha',
                          availableUnits: ['L/ha'],
                          commonValues: [50, 100, 200, 300, 400, 500, 1000, 1500]
                        })
                      }
                      value={`${formatNumberPt(volAplicado)} L/ha`}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Painel de Resultados */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white p-6 sm:p-8 rounded-3xl shadow-floating border border-white/10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-daterra-accent">
                    Resultado do Cálculo de Concentração
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
                    {concMode === 'jovem' ? 'Planta Jovem' : 'Planta Adulta'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-300 block mb-1 font-semibold uppercase tracking-wider">
                    Quantidade necessária de pesticida:
                  </span>
                  <div className="flex flex-col">
                    <div className="text-4xl sm:text-5xl font-black font-mono-numbers text-white tracking-tight">
                      {concOutput.smart.mainText}
                    </div>
                    <div className="text-sm font-semibold font-mono-numbers text-daterra-accent mt-1">
                      {concOutput.smart.subText}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveToHistory(concMode === 'jovem' ? 'concentracao_jovem' : 'concentracao_adulta')}
                  className="w-full py-4 bg-daterra-accent hover:bg-daterra-accent/90 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-daterra-accent/30 flex items-center justify-center gap-2 active:scale-95 touch-target"
                >
                  <Save className="w-5 h-5" />
                  <span>Guardar Cálculo no Histórico (IndexedDB)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OUTROS MÓDULOS DE FERRAMENTAS (VISUALIZAÇÃO INTERATIVA) */}
        {!['calc_concentracao'].includes(currentViewTool) && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft text-center space-y-4 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-[#114037]/10 text-[#114037] flex items-center justify-center mx-auto">
              {currentToolData ? <currentToolData.icon className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#3CA64C]">
                {currentToolData?.category || 'Módulo Ativo'}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {currentToolData?.name}
              </h2>
              <p className="text-xs text-slate-600 mt-2 max-w-lg mx-auto">
                {currentToolData?.description}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed">
              Esta funcionalidade está ativa e sincronizada com o seu perfil da exploração. Os parâmetros hidráulicos e regulatórios SIFITO/DGAV encontram-se carregados.
            </div>
            <button
              onClick={handleBackToCatalog}
              className="px-6 py-3 bg-[#114037] text-white text-xs font-extrabold rounded-2xl hover:bg-[#1D734B] transition-all shadow-md touch-target"
            >
              Voltar ao Catálogo de Ferramentas
            </button>
          </div>
        )}

        {/* Teclado DATERRA */}
        {activeField && (
          <DaterraKeypad
            isOpen={keypadOpen}
            onClose={() => setKeypadOpen(false)}
            initialValue={String(activeField.value)}
            initialUnit={activeField.unit}
            availableUnits={activeField.availableUnits}
            commonValues={activeField.commonValues}
            label={activeField.label}
            onConfirm={handleKeypadConfirm}
          />
        )}
      </div>
    );
  }

  // --- ECRÃ PRINCIPAL DO MENU 'FERRAMENTAS' (CATÁLOGO SAAS SUITE) ---
  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TÍTULO DO ECRÃ: 'Ferramentas' */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#114037] tracking-tight">
              {t('tools.title')}
            </h1>
            <span className="px-3 py-1 bg-[#114037]/10 text-[#114037] text-xs font-extrabold rounded-full">
              {installedToolIds.size} de {TOOLS_CATALOG.length} ativas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Catálogo operacional de ferramentas e funcionalidades agronómicas da DATERRA Smart.
          </p>
        </div>
      </div>

      {/* 2. BARRA DE PESQUISA */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tools.searchPlaceholder')}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-300 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D734B] focus:border-transparent transition-all shadow-xs"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. FILTROS DE CATEGORIAS (Faceted Search) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categorias de Funcionalidades</span>
          </span>
        </div>

        {/* Scroll Horizontal de Chips / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
          {(['Todas', 'Calibração', 'Pulverização', 'Gestão', 'Clima'] as CategoryFilter[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap touch-target flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#114037] text-white shadow-md shadow-[#114037]/20 scale-102'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#3AAA35]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. GRELHA DE RESULTADOS (CARTÕES DE FERRAMENTAS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>A mostrar {filteredTools.length} {filteredTools.length === 1 ? 'ferramenta' : 'ferramentas'}</span>
          {selectedCategory !== 'Todas' && (
            <span className="text-[#1D734B] font-bold">Filtro: {selectedCategory}</span>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-800">Nenhuma ferramenta encontrada</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Não foram encontradas funcionalidades para o termo "{searchQuery}". Tente pesquisar por outro nome ou limpar o filtro.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Todas'); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Ver Todas as Ferramentas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => {
              const isInstalled = installedToolIds.has(tool.id);
              const isInstalling = installingToolId === tool.id;
              const IconComponent = tool.icon;

              return (
                <div
                  key={tool.id}
                  className={`relative p-5 sm:p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group ${
                    isInstalled
                      ? 'bg-gradient-to-br from-emerald-50/40 via-white to-white border-emerald-500/30 shadow-soft hover:shadow-xl hover:border-emerald-500/50'
                      : 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Cabeçalho do Cartão: Ícone, Categoria e Badge de Estado */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                            isInstalled
                              ? 'bg-[#114037] text-white shadow-md'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1D734B]">
                            {tool.category}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {tool.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Descrição Breve de 1 ou 2 Linhas */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Estado de Instalação e Botão de Ação */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    {/* Badge de Estado Visual */}
                    <div>
                      {tool.isCore ? (
                        isInstalled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100/90 text-emerald-800 text-[10px] font-extrabold rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Ativa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-200/80 text-slate-600 text-[10px] font-extrabold rounded-full">
                            <Download className="w-3 h-3 text-slate-500" />
                            <span>Disponível</span>
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-extrabold rounded-full">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Em Breve</span>
                        </span>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2">
                      {tool.isCore ? (
                        isInstalled ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUninstallTool(tool.id, tool.name)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all active:scale-95 touch-target flex items-center gap-1"
                              title="Desinstalar funcionalidade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Desinstalar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenTool(tool.id)}
                              className="px-4 py-2 bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 touch-target"
                            >
                              <span>Abrir</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={isInstalling}
                            onClick={() => handleInstallTool(tool)}
                            className={`px-4 py-2.5 bg-[#3CA64C] hover:bg-[#3AAA35] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 touch-target ${
                              isInstalling ? 'opacity-70 cursor-wait' : ''
                            }`}
                          >
                            {isInstalling ? (
                              <span>A instalar...</span>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Instalar</span>
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 italic">
                          Lançamento em breve
                        </span>
                      )}
                    </div>
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
