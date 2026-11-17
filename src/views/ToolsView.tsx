import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Search, X, CheckCircle2,
  FlaskConical, Calculator, Gauge, Trees, Scale, ClipboardCheck, 
  CloudSun, Layers, Tractor, ChevronLeft, SlidersHorizontal, 
  Sparkles, Save, Sprout, AlertCircle, Leaf, Satellite
} from 'lucide-react';

import { db } from '../db/db';
import { DaterraKeypad } from '../components/DaterraKeypad';
import { DidacticHelp } from '../features/concentracao/DidacticHelp';
import { useLanguage } from '../context/LanguageContext';
import { AreaParedeFoliarCalculator } from '../features/area-parede-foliar';
import { UniversalCalculatorTemplate } from '../features/calculators/core/index.ts';
import { doseCalculatorConfig } from '../features/calculators/definitions/doseCalculatorConfig.ts';
import { concentracaoCalculatorConfig } from '../features/calculators/definitions/concentracaoCalculatorConfig.ts';
import { VelocidadeTrabalhoView } from '../features/calculators/velocidade-trabalho';
import { isToolAllowedInCurrentEnv } from '../utils/environment';
import { getDaterraEnvironment } from '../utils/releasePolicy';
import { isIrdEnabledForEnv } from '../utils/releasePolicyRoutes';
import { useSubscription } from '../context/SubscriptionContext';
import { PRO_TOOL_IDS } from '../types/subscription';
import { ToolCard } from '../components/tools/ToolCard';
import { isRcEvaluationMode, getToolReleaseBadge } from '../utils/rcEvaluationMode';

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

// Catálogo de Ferramentas e Funcionalidades Agronómicas (Ordenado Alfabeticamente A-Z)
const TOOLS_CATALOG: ToolModule[] = [
  {
    id: 'ajuste_dose_eppo',
    name: 'Ajuste da Dose (Método EPPO)',
    category: 'Pulverização',
    description: 'Harmonização de doses e volume de calda no depósito para culturas 3D (EPPO PP 1/239).',
    icon: Scale,
    isCore: true,
    caminho: '/ferramentas/ajuste-dose-eppo',
    prioridade: 'alta'
  },
  {
    id: 'calc_aplicacao_manual',
    name: 'Aplicação Manual',
    category: 'Pulverização',
    description: 'Cálculo de produto para caldas manuais (dorso/lança) por perguntas simples e ensaio de campo.',
    icon: FlaskConical,
    isCore: true,
    caminho: '/ferramentas/aplicacao-manual',
    prioridade: 'alta'
  },
  {
    id: 'calc_area_parede_foliar',
    name: 'Área de Parede Foliar (LWA)',
    category: 'Calibração',
    description: 'Cálculo da área foliar tratada (m²/ha) para culturas em sebe.',
    icon: Leaf,
    isCore: true,
    caminho: '/ferramentas/area-parede-foliar',
    prioridade: 'alta'
  },
  {
    id: 'calc_calibracao_pulverizador',
    name: 'Calibração Pulverizador',
    category: 'Calibração',
    description: 'Planeamento de volume de calda e produto por LWA/TRV.',
    icon: FlaskConical,
    isCore: true,
    caminho: '/ferramentas/calibracao-pulverizador',
    prioridade: 'alta'
  },
  {
    id: 'calc_eppo',
    name: 'Calculadora EPPO (LWA / TRV)',
    category: 'Pulverização',
    description: 'Cálculo do volume de calda e dosagem pela metodologia EPPO PP 1/239.',
    icon: FlaskConical,
    isCore: true,
    caminho: '/ferramentas/eppo',
    prioridade: 'alta'
  },
  {
    id: 'verificador_ph',
    name: 'Consultar pH',
    category: 'Pulverização',
    description: 'Consulta do pH ideal da calda, constante pKa e estabilidade de substâncias ativas.',
    icon: FlaskConical,
    isCore: true,
    caminho: '/ferramentas/verificador-ph',
    prioridade: 'alta'
  },
  {
    id: 'calc_debito_total',
    name: 'Débito Total do Pulverizador',
    category: 'Calibração',
    description: 'Cálculo do débito global do pulverizador a partir do volume, velocidade e largura.',
    icon: Gauge,
    isCore: true,
    caminho: '/ferramentas/debito-total',
    prioridade: 'alta'
  },
  {
    id: 'drone_buffer_zone',
    name: 'Drone Buffer Zone & Legal Engine',
    category: 'Pulverização',
    description: 'Cálculo de zonas tampão e distâncias de segurança legais para drones agrícolas.',
    icon: Layers,
    isCore: true,
    caminho: '/ferramentas/drone-buffer-zone',
    prioridade: 'alta'
  },
  {
    id: 'calc_ird',
    name: 'Índice de Risco de Deriva (IRD)',
    category: 'Pulverização',
    description: 'Apoio à pulverização. Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico.',
    icon: CloudSun,
    isCore: true,
    caminho: '/ferramentas/risco-deriva',
    prioridade: 'alta'
  },
  {
    id: 'clima_estacao_agricola',
    name: 'Estação Climática & Risco de Deriva',
    category: 'Clima',
    description: 'Monitorização em tempo real do vento, humidade e temperatura com alertas de deriva.',
    icon: CloudSun
  },
  {
    id: 'gestao_exploracoes',
    name: 'Gestão de Explorações e Parcelas',
    category: 'Gestão',
    description: 'Registo centralizado de parcelas, culturas, pulverizadores e bicos da exploração.',
    icon: Tractor
  },
  {
    id: 'satelite_ndvi',
    name: 'Inteligência de Satélite & NDVI',
    category: 'Pulverização',
    description: 'Monitorização de vigor foliar Sentinel-2 e modulação de volume por NDVI.',
    icon: Satellite,
    isCore: true,
    caminho: '/ferramentas/satelite-ndvi',
    prioridade: 'alta'
  },
  {
    id: 'calc_concentracao',
    name: 'Mistura de Calda (Concentração)',
    category: 'Pulverização',
    description: 'Cálculo da quantidade de produto e água para o depósito com base na concentração do rótulo.',
    icon: FlaskConical,
    isCore: true
  },
  {
    id: 'calc_dose',
    name: 'Mistura de Calda (Dose)',
    category: 'Pulverização',
    description: 'Conversão da dose de rótulo para a calda do depósito e cálculo de área por tanque.',
    icon: Calculator,
    isCore: true
  },
  {
    id: 'mistura_compatibilidade',
    name: 'Ordem de Mistura',
    category: 'Pulverização',
    description: 'Sequência de adição de produtos fitofarmacêuticos para evitar reações e precipitação.',
    icon: Layers,
    isCore: true,
    caminho: '/ferramentas/mistura',
    prioridade: 'alta'
  },
  {
    id: 'pre_inspecao_dgav',
    name: 'Pré-Inspeção',
    category: 'Calibração',
    description: 'Lista de requisitos para a inspeção de pulverizadores (Norma ISO 16122).',
    icon: ClipboardCheck,
    isCore: true,
    caminho: '/ferramentas/pre-inspecao',
    prioridade: 'alta'
  },
  {
    id: 'smart_debito',
    name: 'Smart Débito (ISO 16122)',
    category: 'Calibração',
    description: 'Auditoria de pulverizadores com validação de desvios e simetria bilateral (ISO 16122).',
    icon: Gauge,
    isCore: true,
    caminho: '/ferramentas/smart-debito',
    prioridade: 'alta'
  },
  {
    id: 'comparador_bicos',
    name: 'Tabelas de Débito (Comparador)',
    category: 'Calibração',
    description: 'Comparação de débito, pressão e espetro de gotas entre dois bicos comerciais.',
    icon: Scale,
    isCore: true,
    caminho: '/ferramentas/comparador-bicos',
    prioridade: 'alta'
  },
  {
    id: 'calc_velocidade_real',
    name: 'Velocidade Real de Trabalho',
    category: 'Calibração',
    description: 'Cálculo da velocidade real de avanço (km/h) do conjunto trator e alfaia agrícola.',
    icon: Gauge,
    isCore: true,
    caminho: '/ferramentas/velocidade-real',
    prioridade: 'alta'
  },
  {
    id: 'calc_volume_calda_trv',
    name: 'Volume de Calda Adequado por TRV',
    category: 'Calibração',
    description: 'Estimativa do volume de calda por hectare com base no TRV e coeficiente técnico.',
    icon: FlaskConical,
    isCore: true,
    caminho: '/ferramentas/volume-calda-trv',
    prioridade: 'alta'
  },
  {
    id: 'calc_volume_copa',
    name: 'Volume de Calda (TRV)',
    category: 'Calibração',
    description: 'Cálculo do volume de massa foliar tridimensional (m³/ha).',
    icon: Trees,
    isCore: true,
    caminho: '/ferramentas/volume-copa',
    prioridade: 'alta'
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
  const { isPro, openUpgradeModal, effectiveTier } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentViewTool = searchParams.get('tool'); // ferramenta em execução (ex: calc_concentracao, calc_dose)

  
  // Estado da Pesquisa e Filtros no Hub de Ferramentas
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Todas');
  const [installingToolId, setInstallingToolId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Leitura do IndexedDB via Dexie das Ferramentas Instaladas
  const installedToolItems = useLiveQuery(() => db.installed_tools.toArray(), []);
  const installedToolIds = useMemo(() => {
    return new Set(installedToolItems?.map(t => t.tool_id) || ['calc_concentracao', 'calc_dose', 'calc_area_parede_foliar', 'mistura_compatibilidade']);
  }, [installedToolItems]);

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
    if (PRO_TOOL_IDS.has(tool.id) && !isPro) {
      openUpgradeModal(tool.name);
      return;
    }
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
    if (!isToolAllowedInCurrentEnv(toolId) || (toolId === 'calc_ird' && !isIrdEnabledForEnv(getDaterraEnvironment()))) {
      return;
    }
    if (PRO_TOOL_IDS.has(toolId) && !isPro) {
      const toolName = TOOLS_CATALOG.find(t => t.id === toolId)?.name || t('gating.tiers.pro.label', 'PRO');
      openUpgradeModal(toolName);
      return;
    }
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

  // Catálogo de ferramentas visíveis no ambiente atual (filtrado para 10 ferramentas homologadas no GitHub Pages)
  const visibleCatalog = useMemo(() => {
    const allowIrd = isIrdEnabledForEnv(getDaterraEnvironment());
    return TOOLS_CATALOG.filter(tool => isToolAllowedInCurrentEnv(tool.id) && (tool.id !== 'calc_ird' || allowIrd));
  }, []);

  // Filtro Dinâmico do Catálogo de Ferramentas (Ordenado Alfabeticamente A-Z)
  const filteredTools = useMemo(() => {
    return visibleCatalog.filter(tool => {
      const matchesCategory = selectedCategory === 'Todas' || tool.category === selectedCategory;
      const localizedName = t(`tools.catalog.${tool.id}.name`, tool.name);
      const localizedDesc = t(`tools.catalog.${tool.id}.description`, tool.description);
      const q = searchQuery.toLowerCase();
      const matchesSearch = tool.name.toLowerCase().includes(q) ||
                            tool.description.toLowerCase().includes(q) ||
                            localizedName.toLowerCase().includes(q) ||
                            localizedDesc.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      const nameA = t(`tools.catalog.${a.id}.name`, a.name);
      const nameB = t(`tools.catalog.${b.id}.name`, b.name);

      // Em ambientes de avaliação (V-DEV, V-RC, V-PAGES), agrupar primeiro 'PAGES' e depois 'RC'
      if (isRcEvaluationMode()) {
        const badgeA = getToolReleaseBadge(a.id);
        const badgeB = getToolReleaseBadge(b.id);
        const rankA = badgeA === 'PAGES' ? 1 : badgeA === 'RC' ? 2 : 3;
        const rankB = badgeB === 'PAGES' ? 1 : badgeB === 'RC' ? 2 : 3;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
      }

      // Ordenação estritamente alfabética A-Z (com suporte a acentuação portuguesa)
      return nameA.localeCompare(nameB, 'pt', { sensitivity: 'base' });
    });
  }, [visibleCatalog, selectedCategory, searchQuery, t]);

  const activeInstalledCount = useMemo(() => {
    return visibleCatalog.filter(t => installedToolIds.has(t.id)).length;
  }, [visibleCatalog, installedToolIds]);

  const isEvaluation = isRcEvaluationMode();

  const pagesTools = useMemo(() => {
    if (!isEvaluation) return [];
    return filteredTools.filter(tool => getToolReleaseBadge(tool.id) === 'PAGES');
  }, [filteredTools, isEvaluation]);

  const rcTools = useMemo(() => {
    if (!isEvaluation) return [];
    return filteredTools.filter(tool => getToolReleaseBadge(tool.id) === 'RC');
  }, [filteredTools, isEvaluation]);

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
      setSaveSuccessMsg(t('common.calculationSaved', 'Cálculo guardado com sucesso no Histórico!'));
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
  if (currentViewTool && !isToolAllowedInCurrentEnv(currentViewTool)) {
    return <Navigate to="/ferramentas" replace />;
  }

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

  if (currentViewTool === 'calc_aplicacao_manual') {
    return <Navigate to="/ferramentas/aplicacao-manual" replace />;
  }

  if (currentViewTool === 'calc_ird') {
    return isIrdEnabledForEnv(getDaterraEnvironment())
      ? <Navigate to="/ferramentas/risco-deriva" replace />
      : <Navigate to="/ferramentas" replace />;
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
    return <VelocidadeTrabalhoView />;
  }

  if (currentViewTool) {
    if (!isToolAllowedInCurrentEnv(currentViewTool)) {
      handleBackToCatalog();
      return null;
    }
    const currentToolData = visibleCatalog.find(t => t.id === currentViewTool);

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
              <span>{t('common.backToTools', 'Voltar às Ferramentas')}</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent">
                {currentToolData?.category || t('tools.agronomicFeature', 'Funcionalidade Agronómica')}
              </span>
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
                {currentToolData?.name || t('tools.defaultToolName', 'Ferramenta DATERRA Smart')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('common.activeTool', 'Ferramenta Ativa')}</span>
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
                    {t('tools.mixtureConcentration', 'Mistura de Calda (Concentração)')}
                  </h2>
                  <DidacticHelp faqFile="ConcentracaoFAQGeral.md" buttonLabel="Guia" />
                </div>
                <p className="text-xs text-slate-500">
                  {t('tools.vegetativeStageDesc', 'Selecione o estado vegetativo para ajustar os parâmetros de molhamento e volume.')}
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
                      <label className="text-xs font-bold text-slate-700">
                        {t('tools.productConcentration', 'Concentração do Produto')}
                      </label>
                      <DidacticHelp
                        faqFile="ConcentracaoFAQConcentracao.md"
                        variant="icon"
                        iconType="info"
                        buttonLabel="Ajuda"
                        className="!min-w-[36px] !min-h-[36px] !p-1.5"
                        iconClassName="w-4 h-4 text-[#1D734B]"
                      />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'concValue',
                          label: t('tools.productConcentration', 'Concentração do Produto'),
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
                      <DidacticHelp
                        faqFile="ConcentracaoFAQVolumePreparar.md"
                        variant="icon"
                        iconType="info"
                        buttonLabel="Ajuda"
                        className="!min-w-[36px] !min-h-[36px] !p-1.5"
                        iconClassName="w-4 h-4 text-[#1D734B]"
                      />
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
                      <DidacticHelp
                        faqFile="ConcentracaoFAQVolumePreparar.md"
                        variant="icon"
                        iconType="info"
                        buttonLabel="Ajuda"
                        className="!min-w-[36px] !min-h-[36px] !p-1.5"
                        iconClassName="w-4 h-4 text-[#1D734B]"
                      />
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
                      <label className="text-xs font-bold text-slate-700">
                        {t('tools.productConcentration', 'Concentração do Produto')}
                      </label>
                      <DidacticHelp
                        faqFile="ConcentracaoFAQConcentracao.md"
                        variant="icon"
                        iconType="info"
                        buttonLabel="Ajuda"
                        className="!min-w-[36px] !min-h-[36px] !p-1.5"
                        iconClassName="w-4 h-4 text-[#1D734B]"
                      />
                    </div>
                    <input
                      type="text"
                      readOnly
                      inputMode="none"
                      onClick={() =>
                        openKeypad({
                          key: 'concValue',
                          label: t('tools.productConcentration', 'Concentração do Produto'),
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
                      <DidacticHelp
                        faqFile="ConcentracaoFAQVolumeRecomendado.md"
                        variant="icon"
                        iconType="info"
                        buttonLabel="Ajuda"
                        className="!min-w-[36px] !min-h-[36px] !p-1.5"
                        iconClassName="w-4 h-4 text-[#1D734B]"
                      />
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
                      <DidacticHelp
                        faqFile="ConcentracaoFAQVolumeAplicado.md"
                        variant="icon"
                        iconType="info"
                        buttonLabel="Ajuda"
                        className="!min-w-[36px] !min-h-[36px] !p-1.5"
                        iconClassName="w-4 h-4 text-[#1D734B]"
                      />
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
                    {t('tools.concentrationResult', 'Resultado do Cálculo de Concentração')}
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
                    {concMode === 'jovem' ? t('tools.youngPlant', 'Planta Jovem') : t('tools.adultPlant', 'Planta Adulta')}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-300 block mb-1 font-semibold uppercase tracking-wider">
                    {t('tools.requiredPesticideAmount', 'Quantidade necessária de pesticida:')}
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
                  <span>{t('tools.saveCalculationHistory', 'Guardar Cálculo no Histórico (IndexedDB)')}</span>
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
                {currentToolData?.category || t('tools.activeModule', 'Módulo Ativo')}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {currentToolData?.name}
              </h2>
              <p className="text-xs text-slate-600 mt-2 max-w-lg mx-auto">
                {currentToolData?.description}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed">
              {t('tools.syncedProfileNotice', 'Esta funcionalidade está ativa e sincronizada com o seu perfil da exploração. Os parâmetros operacionais e regulatórios oficiais encontram-se carregados.')}
            </div>
            <button
              onClick={handleBackToCatalog}
              className="px-6 py-3 bg-[#114037] text-white text-xs font-extrabold rounded-2xl hover:bg-[#1D734B] transition-all shadow-md touch-target"
            >
              {t('tools.backToCatalog', 'Voltar ao Catálogo de Ferramentas')}
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

      {/* Banner Exclusivo de Avaliação RC (Suprimido automaticamente em V-PAGES) */}
      {isRcEvaluationMode() && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-500/30 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-800 shadow-2xs animate-fade-in font-medium">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-white font-black rounded-md text-[10px] tracking-wider">RC PREVIEW</span>
            <span className="font-semibold">{t('tools.rcBannerLocalEnv', 'Ambiente de Avaliação Localhost:5175 (Etiquetas ativas apenas para revisão interna)')}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-extrabold shrink-0">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-400 rounded-md">{t('tools.rcBannerPagesCount', 'PAGES: 11 Canónicas')}</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-400 rounded-md">RC: Novidades</span>
          </div>
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
              {t('tools.activeCountDesc', '{{active}} de {{total}} ativas', { active: activeInstalledCount, total: visibleCatalog.length })}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('tools.subtitle', 'Catálogo operacional de ferramentas e funcionalidades agronómicas da DATERRA Smart.')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {effectiveTier === 'pro' ? (
            <button
              type="button"
              onClick={() => openUpgradeModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#114037] text-[#3CA64C] text-xs font-black uppercase rounded-2xl shadow-sm hover:bg-[#1D734B] hover:text-white transition-all touch-target"
              title={t('gating.modal.badge', 'DATERRA PRO')}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3CA64C]" />
              <span>{t('gating.tiers.pro.label', 'PRO')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openUpgradeModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all touch-target"
              title={t('gating.modal.badge', 'DATERRA PRO')}
            >
              <span>{t('gating.tiers.free.label', 'Gratuito')}</span>
              <span className="text-[10px] text-[#1D734B] font-extrabold underline ml-0.5">Upgrade PRO</span>
            </button>
          )}
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
              aria-label={t('tools.clearSearch', 'Limpar pesquisa')}
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
            <span>{t('tools.categoryTitle', 'Categorias de Funcionalidades')}</span>
          </span>
        </div>

        {/* Scroll Horizontal de Chips / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
          {(['Todas', 'Calibração', 'Pulverização', 'Gestão', 'Clima'] as CategoryFilter[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            const categoryLabel =
              cat === 'Todas' ? t('tools.allCategories', 'Todas') :
              cat === 'Calibração' ? t('tools.catCalibration', 'Calibração') :
              cat === 'Pulverização' ? t('tools.catSpraying', 'Pulverização') :
              cat === 'Gestão' ? t('tools.catManagement', 'Gestão') :
              cat === 'Clima' ? t('tools.catWeather', 'Clima') : cat;

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
                <span>{categoryLabel}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#3AAA35]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. GRELHA DE RESULTADOS (CARTÕES DE FERRAMENTAS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>
            {t('tools.showingCount', 'A mostrar {{count}} {{item}}', {
              count: filteredTools.length,
              item: filteredTools.length === 1 ? t('tools.showingItemOne', 'ferramenta') : t('tools.showingItemOther', 'ferramentas')
            })}
          </span>
          {selectedCategory !== 'Todas' && (
            <span className="text-[#1D734B] font-bold">
              {t('tools.filterCategoryActive', 'Filtro: {{category}}', {
                category:
                  selectedCategory === 'Calibração' ? t('tools.catCalibration', 'Calibração') :
                  selectedCategory === 'Pulverização' ? t('tools.catSpraying', 'Pulverização') :
                  selectedCategory === 'Gestão' ? t('tools.catManagement', 'Gestão') :
                  selectedCategory === 'Clima' ? t('tools.catWeather', 'Clima') : selectedCategory
              })}
            </span>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-800">
              {t('tools.noToolsFound', 'Nenhuma ferramenta encontrada')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('tools.noToolsFoundDesc', 'Não foram encontradas funcionalidades para o termo pesquisado. Tente pesquisar por outro nome ou limpar o filtro.')}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Todas'); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors touch-target"
            >
              {t('tools.clearFilter', 'Limpar Pesquisa e Filtros')}
            </button>
          </div>
        ) : isEvaluation ? (
          <div className="space-y-8">
            {/* GRUPO 1: FERRAMENTAS HOMOLOGADAS (PAGES) */}
            {pagesTools.length > 0 && (
              <section className="space-y-4" aria-label="Ferramentas Homologadas PAGES">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-400 shadow-2xs">
                      PAGES
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#114037]">
                      {t('tools.pagesGroupTitle', 'Ferramentas Homologadas')}
                    </h2>
                    <span className="text-xs font-bold text-slate-500 font-mono-numbers">
                      ({pagesTools.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t('tools.pagesGroupDesc', 'Disponíveis e validadas no GitHub Pages')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pagesTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isInstalled={installedToolIds.has(tool.id)}
                      isInstalling={installingToolId === tool.id}
                      onOpenTool={handleOpenTool}
                      onInstallTool={handleInstallTool}
                      onUninstallTool={handleUninstallTool}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SEPARADOR SIMPLES E GRUPO 2: CANDIDATAS A PUBLICAÇÃO (RC) */}
            {rcTools.length > 0 && (
              <section className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200" aria-label="Candidatas a Publicação RC">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-400 shadow-2xs">
                      RC
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-amber-950">
                      {t('tools.rcGroupTitle', 'Candidatas a Publicação — Novidades')}
                    </h2>
                    <span className="text-xs font-bold text-amber-900 font-mono-numbers">
                      ({rcTools.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-medium">
                    {t('tools.rcGroupDesc', 'Em avaliação e testes locais para próximo release')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rcTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isInstalled={installedToolIds.has(tool.id)}
                      isInstalling={installingToolId === tool.id}
                      onOpenTool={handleOpenTool}
                      onInstallTool={handleInstallTool}
                      onUninstallTool={handleUninstallTool}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isInstalled={installedToolIds.has(tool.id)}
                isInstalling={installingToolId === tool.id}
                onOpenTool={handleOpenTool}
                onInstallTool={handleInstallTool}
                onUninstallTool={handleUninstallTool}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
