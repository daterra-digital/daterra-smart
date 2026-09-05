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
import { NozzleSelector } from './NozzleSelector';
import { PressureControl } from './PressureControl';
import { NozzleComparisonCard } from './NozzleComparisonCard';
import { ComparisonSummary } from './ComparisonSummary';
import { ComparisonTable } from './ComparisonTable';
import { NozzleMicrolearningModal } from './NozzleMicrolearningModal';
import { NozzleComparisonHistoryModal } from './NozzleComparisonHistoryModal';
import { NozzleFindAlternatives } from './NozzleFindAlternatives';
import { TotalBoomFlowSection } from './TotalBoomFlowSection';
import { NOZZLES_BY_ID } from './nozzleComparison.data';
import { calculateNozzleFlow, compareNozzles } from './nozzleComparison.calculations';
import type { Nozzle, ActiveComparisonMode } from './nozzleComparison.types';

export const NozzleComparisonView: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* 1. CABEÇALHO DA FERRAMENTA */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ferramentas')}
            aria-label="Voltar ao catálogo de ferramentas"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-1 text-xs font-bold min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span>Voltar</span>
          </button>
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
              Calibração & Pulverização • Versão 1.1
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-daterra-primary leading-tight">
              Comparador de Bicos
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Compare dois bicos conhecidos ou encontre alternativas de débito equivalente.
            </p>
          </div>
        </div>

        {/* Ações de Topo: Microlearning, Histórico e Reset */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMicrolearningOpen(true)}
            aria-label="Abrir guia de microlearning agronómico"
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Microlearning (15 tópicos)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Abrir histórico local de comparações"
            className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <History className="w-4 h-4 text-sky-700" />
            <span className="hidden sm:inline">Histórico</span>
          </button>

          {activeMode === 'comparar' && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reiniciar seleções do comparador"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DOIS BOTÕES GRANDES NO ECRÃ INICIAL PARA SELEÇÃO DO MODO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Botão Modo 1: Comparar dois bicos */}
        <button
          type="button"
          onClick={() => setActiveMode('comparar')}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 min-h-[90px] ${
            activeMode === 'comparar'
              ? 'bg-gradient-to-br from-daterra-primary to-slate-900 text-white border-daterra-primary shadow-lg scale-[1.01]'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-soft'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
            activeMode === 'comparar' ? 'bg-white/10 text-daterra-accent' : 'bg-slate-100 text-daterra-primary'
          }`}>
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
              activeMode === 'comparar' ? 'text-daterra-accent' : 'text-slate-400'
            }`}>
              Modo Direto
            </span>
            <h2 className="text-base sm:text-lg font-black leading-tight">
              Comparar dois bicos
            </h2>
            <p className={`text-xs mt-1 leading-relaxed ${
              activeMode === 'comparar' ? 'text-slate-200' : 'text-slate-500'
            }`}>
              Confronte débitos, curvas de pressão, espectro de gotas e sensibilidade à deriva de dois bicos conhecidos.
            </p>
          </div>
        </button>

        {/* Botão Modo 2: Encontrar alternativas */}
        <button
          type="button"
          onClick={() => setActiveMode('alternativas')}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 min-h-[90px] ${
            activeMode === 'alternativas'
              ? 'bg-gradient-to-br from-daterra-primary to-slate-900 text-white border-daterra-primary shadow-lg scale-[1.01]'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-soft'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
            activeMode === 'alternativas' ? 'bg-white/10 text-daterra-accent' : 'bg-slate-100 text-daterra-primary'
          }`}>
            <Search className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
              activeMode === 'alternativas' ? 'text-daterra-accent' : 'text-slate-400'
            }`}>
              Modo de Pesquisa
            </span>
            <h2 className="text-base sm:text-lg font-black leading-tight">
              Encontrar alternativas
            </h2>
            <p className={`text-xs mt-1 leading-relaxed ${
              activeMode === 'alternativas' ? 'text-slate-200' : 'text-slate-500'
            }`}>
              Descubra opções no catálogo com débito semelhante (±5%, ±10%, ±15%) e menor sensibilidade à deriva.
            </p>
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
        <div className="space-y-6 animate-fade-in">
          
          {/* SELETORES ADAPTATIVOS DE BICO A E BICO B + BOTÃO DE TROCA */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NozzleSelector
                side="A"
                title="Bico A"
                selectedBrand={selectedBrandA}
                selectedModel={selectedModelA}
                selectedSprayAngle={selectedSprayAngleA}
                selectedSwirlPlate={selectedSwirlPlateA}
                selectedDisc={selectedDiscA}
                selectedNozzleId={selectedNozzleIdA}
                onBrandChange={brand => {
                  setSelectedBrandA(brand);
                  setSelectedModelA('');
                  setSelectedSprayAngleA('');
                  setSelectedSwirlPlateA('');
                  setSelectedDiscA('');
                  setSelectedNozzleIdA('');
                }}
                onModelChange={model => {
                  setSelectedModelA(model);
                  setSelectedSprayAngleA('');
                  setSelectedSwirlPlateA('');
                  setSelectedDiscA('');
                  setSelectedNozzleIdA('');
                }}
                onSprayAngleChange={angle => setSelectedSprayAngleA(angle)}
                onSwirlPlateChange={swirl => setSelectedSwirlPlateA(swirl)}
                onDiscChange={disc => setSelectedDiscA(disc)}
                onNozzleChange={id => setSelectedNozzleIdA(id)}
                selectedNozzle={nozzleA}
              />

              <NozzleSelector
                side="B"
                title="Bico B"
                selectedBrand={selectedBrandB}
                selectedModel={selectedModelB}
                selectedSprayAngle={selectedSprayAngleB}
                selectedSwirlPlate={selectedSwirlPlateB}
                selectedDisc={selectedDiscB}
                selectedNozzleId={selectedNozzleIdB}
                onBrandChange={brand => {
                  setSelectedBrandB(brand);
                  setSelectedModelB('');
                  setSelectedSprayAngleB('');
                  setSelectedSwirlPlateB('');
                  setSelectedDiscB('');
                  setSelectedNozzleIdB('');
                }}
                onModelChange={model => {
                  setSelectedModelB(model);
                  setSelectedSprayAngleB('');
                  setSelectedSwirlPlateB('');
                  setSelectedDiscB('');
                  setSelectedNozzleIdB('');
                }}
                onSprayAngleChange={angle => setSelectedSprayAngleB(angle)}
                onSwirlPlateChange={swirl => setSelectedSwirlPlateB(swirl)}
                onDiscChange={disc => setSelectedDiscB(disc)}
                onNozzleChange={id => setSelectedNozzleIdB(id)}
                selectedNozzle={nozzleB}
              />
            </div>

            {/* Botão de Trocar Bicos */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapNozzles}
                aria-label="Trocar dados entre Bico A e Bico B"
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-extrabold transition-all border border-slate-300 shadow-sm flex items-center gap-2 active:scale-95 min-h-[48px]"
              >
                <ArrowLeftRight className="w-4 h-4 text-daterra-primary" />
                <span>Trocar bicos (Bico A ⟷ Bico B)</span>
              </button>
            </div>
          </div>

          {/* CONTROLO TÁTIL DE PRESSÃO */}
          <PressureControl
            workingPressureBar={workingPressureBar}
            onChangePressure={setWorkingPressureBar}
            nozzleA={nozzleA}
            nozzleB={nozzleB}
          />

          {/* SECÇÃO OPCIONAL: DÉBITO TOTAL DO CONJUNTO */}
          {flowA && (
            <TotalBoomFlowSection
              flowPerNozzleLMin={flowA.flowLMin}
              nozzleLabel="Bico A"
            />
          )}

          {/* RESULTADOS INDIVIDUAIS DOS DOIS BICOS */}
          <div className="space-y-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
              Resultados Individuais
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {flowA ? (
                <NozzleComparisonCard
                  side="A"
                  title="Bico A"
                  calculatedFlow={flowA}
                />
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 font-bold">
                  Selecione um bico para o Bico A
                </div>
              )}

              {flowB ? (
                <NozzleComparisonCard
                  side="B"
                  title="Bico B"
                  calculatedFlow={flowB}
                />
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 font-bold">
                  Selecione um bico para o Bico B
                </div>
              )}
            </div>
          </div>

          {/* RESUMO COMPARATIVO & MATRIZ TÉCNICA */}
          {comparisonResult && flowA && flowB ? (
            <div className="space-y-6">
              <ComparisonSummary
                comparison={comparisonResult}
                workingPressureBar={workingPressureBar}
              />

              <ComparisonTable
                flowA={flowA}
                flowB={flowB}
                workingPressureBar={workingPressureBar}
              />
            </div>
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
