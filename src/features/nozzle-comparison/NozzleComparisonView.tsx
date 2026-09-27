import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  Scale,
  GraduationCap,
  History,
  Search
} from 'lucide-react';
import { PressureControl } from './PressureControl';
import { NozzleComparisonCard } from './NozzleComparisonCard';
import { ComparisonTable } from './ComparisonTable';
import { NozzleMicrolearningModal } from './NozzleMicrolearningModal';
import { NozzleComparisonHistoryModal } from './NozzleComparisonHistoryModal';
import { NozzleFindAlternatives } from './NozzleFindAlternatives';
import { NOZZLES_BY_ID } from './nozzleComparison.data';
import { calculateNozzleFlow, compareNozzles } from './nozzleComparison.calculations';
import { NozzleComparisonMobileView } from './NozzleComparisonMobileView';
import type { Nozzle, ActiveComparisonMode } from './nozzleComparison.types';

export const NozzleComparisonView: React.FC = () => {
  const navigate = useNavigate();

  // Detetar viewport mobile para renderizar a interface dedicada de smartphone
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modo Ativo: 'comparar' ou 'alternativas'
  const [activeMode, setActiveMode] = React.useState<ActiveComparisonMode>('comparar');

  // Estados de Seleção Bico A
  const [selectedBrandA, setSelectedBrandA] = React.useState<string>('Albuz');
  const [selectedModelA, setSelectedModelA] = React.useState<string>('ATR');
  const [selectedSprayAngleA, setSelectedSprayAngleA] = React.useState<string | number>(80);
  const [selectedSwirlPlateA, setSelectedSwirlPlateA] = React.useState<string>('');
  const [selectedDiscA, setSelectedDiscA] = React.useState<string>('');
  const [selectedNozzleIdA, setSelectedNozzleIdA] = React.useState<string>('albuz_atr_80_amarelo');

  // Estados de Seleção Bico B
  const [selectedBrandB, setSelectedBrandB] = React.useState<string>('TeeJet');
  const [selectedModelB, setSelectedModelB] = React.useState<string>('XR');
  const [selectedSprayAngleB, setSelectedSprayAngleB] = React.useState<string | number>(110);
  const [selectedSwirlPlateB, setSelectedSwirlPlateB] = React.useState<string>('');
  const [selectedDiscB, setSelectedDiscB] = React.useState<string>('');
  const [selectedNozzleIdB, setSelectedNozzleIdB] = React.useState<string>('teejet_xr_110_amarelo');

  // Pressão de Trabalho (Bar)
  const [workingPressureBar, setWorkingPressureBar] = React.useState<number>(3.0);

  // Modais
  const [isMicrolearningOpen, setIsMicrolearningOpen] = React.useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

  // Objetos Nozzle Resolvidos
  const nozzleA: Nozzle | undefined = React.useMemo(() => {
    return NOZZLES_BY_ID.get(selectedNozzleIdA);
  }, [selectedNozzleIdA]);

  const nozzleB: Nozzle | undefined = React.useMemo(() => {
    return NOZZLES_BY_ID.get(selectedNozzleIdB);
  }, [selectedNozzleIdB]);

  // Cálculos Hidráulicos de Fluxo
  const flowA = React.useMemo(() => {
    if (!nozzleA) return undefined;
    return calculateNozzleFlow(nozzleA, workingPressureBar);
  }, [nozzleA, workingPressureBar]);

  const flowB = React.useMemo(() => {
    if (!nozzleB) return undefined;
    return calculateNozzleFlow(nozzleB, workingPressureBar);
  }, [nozzleB, workingPressureBar]);

  // Resumo Comparativo Combinado
  const comparisonResult = React.useMemo(() => {
    if (!flowA || !flowB) return undefined;
    return compareNozzles(flowA, flowB);
  }, [flowA, flowB]);

  // Ação: Trocar Bico A e Bico B
  const handleSwapNozzles = () => {
    const tempBrand = selectedBrandA;
    const tempModel = selectedModelA;
    const tempAngle = selectedSprayAngleA;
    const tempSwirl = selectedSwirlPlateA;
    const tempDisc = selectedDiscA;
    const tempId = selectedNozzleIdA;

    setSelectedBrandA(selectedBrandB);
    setSelectedModelA(selectedModelB);
    setSelectedSprayAngleA(selectedSprayAngleB);
    setSelectedSwirlPlateA(selectedSwirlPlateB);
    setSelectedDiscA(selectedDiscB);
    setSelectedNozzleIdA(selectedNozzleIdB);

    setSelectedBrandB(tempBrand);
    setSelectedModelB(tempModel);
    setSelectedSprayAngleB(tempAngle);
    setSelectedSwirlPlateB(tempSwirl);
    setSelectedDiscB(tempDisc);
    setSelectedNozzleIdB(tempId);
  };

  // Ação: Reiniciar Seleção
  const handleReset = () => {
    setSelectedBrandA('');
    setSelectedModelA('');
    setSelectedSprayAngleA('');
    setSelectedSwirlPlateA('');
    setSelectedDiscA('');
    setSelectedNozzleIdA('');

    setSelectedBrandB('');
    setSelectedModelB('');
    setSelectedSprayAngleB('');
    setSelectedSwirlPlateB('');
    setSelectedDiscB('');
    setSelectedNozzleIdB('');

    setWorkingPressureBar(3.0);
  };

  // Ação: Carregar Comparação do Histórico
  const handleLoadFromHistory = (nIdA: string, nIdB: string, pBar: number) => {
    const nA = NOZZLES_BY_ID.get(nIdA);
    const nB = NOZZLES_BY_ID.get(nIdB);

    if (nA) {
      setSelectedBrandA(nA.brand);
      setSelectedModelA(nA.model);
      setSelectedSprayAngleA(nA.sprayAngleDeg || '');
      setSelectedSwirlPlateA(nA.swirlPlate || '');
      setSelectedDiscA(nA.disc || '');
      setSelectedNozzleIdA(nA.id);
    }
    if (nB) {
      setSelectedBrandB(nB.brand);
      setSelectedModelB(nB.model);
      setSelectedSprayAngleB(nB.sprayAngleDeg || '');
      setSelectedSwirlPlateB(nB.swirlPlate || '');
      setSelectedDiscB(nB.disc || '');
      setSelectedNozzleIdB(nB.id);
    }
    setWorkingPressureBar(pBar);
    setActiveMode('comparar');
  };

  // Ação: Selecionar Alternativa e comutar para o Modo Comparar
  const handleSelectAlternativeForComparison = (
    refId: string,
    altId: string,
    pressureBar: number
  ) => {
    const nA = NOZZLES_BY_ID.get(refId);
    const nB = NOZZLES_BY_ID.get(altId);

    if (nA) {
      setSelectedBrandA(nA.brand);
      setSelectedModelA(nA.model);
      setSelectedSwirlPlateA(nA.swirlPlate || '');
      setSelectedDiscA(nA.disc || '');
      setSelectedNozzleIdA(nA.id);
    }
    if (nB) {
      setSelectedBrandB(nB.brand);
      setSelectedModelB(nB.model);
      setSelectedSwirlPlateB(nB.swirlPlate || '');
      setSelectedDiscB(nB.disc || '');
      setSelectedNozzleIdB(nB.id);
    }
    setWorkingPressureBar(pressureBar);
    setActiveMode('comparar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isMobile) {
    return <NozzleComparisonMobileView />;
  }

  return (
    <div className="space-y-2.5 sm:space-y-3 pb-12 animate-fade-in">
      
      {/* 1. CABEÇALHO DA FERRAMENTA (ULTRA-COMPACTO) */}
      <div className="bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/ferramentas')}
            aria-label="Voltar ao catálogo de ferramentas"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-daterra-primary" />
            <span>Voltar</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
                Comparador de Bicos
              </h1>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-daterra-accent bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                v1.1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              Compare dois bicos conhecidos ou encontre alternativas de débito equivalente.
            </p>
          </div>
        </div>

        {/* Ações de Topo: Microlearning, Histórico e Reset */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMicrolearningOpen(true)}
            aria-label="Abrir guia de microlearning agronómico"
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Microlearning</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Abrir histórico local de comparações"
            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-sky-700" />
            <span className="hidden sm:inline">Histórico</span>
          </button>

          {activeMode === 'comparar' && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reiniciar seleções do comparador"
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SELEÇÃO DO MODO (EQUILIBRADO, ELEGANTE E COMPACTO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Botão Modo 1: Comparar dois bicos */}
        <button
          type="button"
          onClick={() => setActiveMode('comparar')}
          className={`p-3.5 sm:px-4 sm:py-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
            activeMode === 'comparar'
              ? 'bg-gradient-to-r from-daterra-primary to-slate-900 text-white border-daterra-primary shadow-md ring-1 ring-daterra-accent/40'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-soft'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              activeMode === 'comparar' ? 'bg-white/10 text-daterra-accent' : 'bg-slate-100 text-daterra-primary'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black leading-tight truncate">
                  Comparar dois bicos
                </h2>
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                  activeMode === 'comparar' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Direto
                </span>
              </div>
              <p className={`text-[11px] truncate mt-0.5 ${
                activeMode === 'comparar' ? 'text-slate-200' : 'text-slate-500'
              }`}>
                Confronte débitos, curvas de pressão e gotas
              </p>
            </div>
          </div>
        </button>

        {/* Botão Modo 2: Encontrar alternativas */}
        <button
          type="button"
          onClick={() => setActiveMode('alternativas')}
          className={`p-3.5 sm:px-4 sm:py-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
            activeMode === 'alternativas'
              ? 'bg-gradient-to-r from-daterra-primary to-slate-900 text-white border-daterra-primary shadow-md ring-1 ring-daterra-accent/40'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-soft'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              activeMode === 'alternativas' ? 'bg-white/10 text-daterra-accent' : 'bg-slate-100 text-daterra-primary'
            }`}>
              <Search className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black leading-tight truncate">
                  Encontrar alternativas
                </h2>
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                  activeMode === 'alternativas' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Pesquisa
                </span>
              </div>
              <p className={`text-[11px] truncate mt-0.5 ${
                activeMode === 'alternativas' ? 'text-slate-200' : 'text-slate-500'
              }`}>
                Descubra opções equivalentes (±5%, ±10%, ±15%)
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* 3. CONTEÚDO DO MODO SELECIONADO */}
      {activeMode === 'alternativas' ? (
        /* ================= MODO 2: ENCONTRAR ALTERNATIVAS ================= */
        <NozzleFindAlternatives
          initialRefNozzleId={selectedNozzleIdA || 'albuz_atr_80_amarelo'}
          initialPressureBar={workingPressureBar}
          onSelectForComparison={handleSelectAlternativeForComparison}
        />
      ) : (
        /* ================= MODO 1: COMPARAR DOIS BICOS ================= */
        <div className="space-y-4 animate-fade-in">
          
          {/* 1. CARTÃO RESULTADOS INDIVIDUAIS (ESTRUTURA UNIFICADA E ELEGANTE) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200 shadow-soft space-y-4">
            
            {/* Cabeçalho do Cartão Resultados Individuais */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-daterra-primary text-white flex items-center justify-center font-bold shrink-0">
                  <Scale className="w-4 h-4 text-daterra-accent" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
                    Análise Lado a Lado
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Resultados Individuais
                  </h2>
                </div>
              </div>

              {/* Botão de Trocar Bicos Integrado no Cabeçalho do Cartão */}
              <button
                type="button"
                onClick={handleSwapNozzles}
                aria-label="Trocar dados entre Bico A e Bico B"
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all border border-slate-300 shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-daterra-primary" />
                <span>Trocar bicos (Bico A ⟷ Bico B)</span>
              </button>
            </div>

            {/* Grid dos dois bicos lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NozzleComparisonCard
                side="A"
                title="Bico A"
                selectedBrand={selectedBrandA}
                selectedModel={selectedModelA}
                selectedSwirlPlate={selectedSwirlPlateA}
                selectedDisc={selectedDiscA}
                selectedNozzleId={selectedNozzleIdA}
                onBrandChange={brand => {
                  setSelectedBrandA(brand);
                  setSelectedModelA('');
                  setSelectedSwirlPlateA('');
                  setSelectedDiscA('');
                  setSelectedNozzleIdA('');
                }}
                onModelChange={model => {
                  setSelectedModelA(model);
                  setSelectedSwirlPlateA('');
                  setSelectedDiscA('');
                  setSelectedNozzleIdA('');
                }}
                onSwirlPlateChange={swirl => setSelectedSwirlPlateA(swirl)}
                onDiscChange={disc => setSelectedDiscA(disc)}
                onNozzleChange={id => setSelectedNozzleIdA(id)}
                selectedNozzle={nozzleA}
                calculatedFlow={flowA}
                workingPressureBar={workingPressureBar}
              />

              <NozzleComparisonCard
                side="B"
                title="Bico B"
                selectedBrand={selectedBrandB}
                selectedModel={selectedModelB}
                selectedSwirlPlate={selectedSwirlPlateB}
                selectedDisc={selectedDiscB}
                selectedNozzleId={selectedNozzleIdB}
                onBrandChange={brand => {
                  setSelectedBrandB(brand);
                  setSelectedModelB('');
                  setSelectedSwirlPlateB('');
                  setSelectedDiscB('');
                  setSelectedNozzleIdB('');
                }}
                onModelChange={model => {
                  setSelectedModelB(model);
                  setSelectedSwirlPlateB('');
                  setSelectedDiscB('');
                  setSelectedNozzleIdB('');
                }}
                onSwirlPlateChange={swirl => setSelectedSwirlPlateB(swirl)}
                onDiscChange={disc => setSelectedDiscB(disc)}
                onNozzleChange={id => setSelectedNozzleIdB(id)}
                selectedNozzle={nozzleB}
                calculatedFlow={flowB}
                workingPressureBar={workingPressureBar}
              />
            </div>
          </div>

          {/* 2. CARTÃO PRESSÃO DE TRABALHO (ESTRITAMENTE O ESSENCIAL) */}
          <PressureControl
            workingPressureBar={workingPressureBar}
            onChangePressure={setWorkingPressureBar}
            nozzleA={nozzleA}
            nozzleB={nozzleB}
          />

          {/* 3. MATRIZ TÉCNICA COMPARATIVA (COM DIMENSIONAMENTO DA BARRA, BOTÃO AJUDA/MICROLEARNING, ANÁLISE DIFERENCIAL E ESPECIFICAÇÕES) */}
          {flowA && flowB ? (
            <ComparisonTable
              flowA={flowA}
              flowB={flowB}
              comparison={comparisonResult}
              workingPressureBar={workingPressureBar}
              onOpenMicrolearning={() => setIsMicrolearningOpen(true)}
            />
          ) : (
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
              <Scale className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-700">
                Comparação pendente
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Selecione o Bico A e o Bico B acima para desbloquear o resumo diferencial detalhado, a matriz técnica e a interpretação orientadora.
              </p>
            </div>
          )}
        </div>
      )}

      {/* AVISO TÉCNICO NO FINAL */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs text-slate-600 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-daterra-primary" />
          Aviso Técnico DATERRA Smart
        </span>
        <p>
          Esta ferramenta fornece referências de débito baseadas nos catálogos técnicos oficiais e nas leis físicas da hidráulica. Confirme sempre a calibração com água limpa no pulverizador antes de qualquer tratamento fitossanitário.
        </p>
      </div>

      {/* MODAL 1: MICROLEARNING AGRONÓMICO (15 Tópicos) */}
      <NozzleMicrolearningModal
        isOpen={isMicrolearningOpen}
        onClose={() => setIsMicrolearningOpen(false)}
      />

      {/* MODAL 2: HISTÓRICO LOCAL INDEXEDDB */}
      <NozzleComparisonHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadComparison={handleLoadFromHistory}
        currentFlowA={flowA}
        currentFlowB={flowB}
        currentComparison={comparisonResult}
        currentPressureBar={workingPressureBar}
      />
    </div>
  );
};

export default NozzleComparisonView;
