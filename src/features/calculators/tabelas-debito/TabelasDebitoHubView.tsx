import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { ISO_NOZZLE_COLORS, calculateIsoFlow } from './debitoTypes';
import type { DebitoHubMode } from './debitoTypes';
import { NOZZLES_BY_ID } from '../../nozzle-comparison/nozzleComparison.data';
import { calculateNozzleFlow, compareNozzles } from '../../nozzle-comparison/nozzleComparison.calculations';
import { saveDebitoHistory, useDebitoHistory } from './services/debitoHistoryService';
import { DebitoHeader } from './DebitoHeader';
import { DebitoModeSelector } from './DebitoModeSelector';
import { DebitoFooterBar } from './DebitoFooterBar';
import { ModoUnitarioView } from './components/ModoUnitarioView';
import { ModoComparadorView } from './components/ModoComparadorView';
import { ModoAlternativasReferenciaView } from './components/ModoAlternativasReferenciaView';
import { DebitoModalsContainer } from './components/DebitoModalsContainer';

export const TabelasDebitoHubView: React.FC = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<DebitoHubMode>('comparador');

  // Modo 1: Bicos ISO
  const [selectedCode, setSelectedCode] = useState<string>('02');
  const [unitarioPressure, setUnitarioPressure] = useState<number>(3.0);
  const selectedIsoNozzle = useMemo(
    () => ISO_NOZZLE_COLORS.find((n) => n.code === selectedCode) || ISO_NOZZLE_COLORS[2],
    [selectedCode]
  );
  const unitarioFlow = useMemo(
    () => calculateIsoFlow(selectedIsoNozzle.nominalFlow3Bar, unitarioPressure),
    [selectedIsoNozzle, unitarioPressure]
  );

  // Modo 2: Comparador
  const [nozzleIdA, setNozzleIdA] = useState<string>('albuz_atr_80_amarelo');
  const [nozzleIdB, setNozzleIdB] = useState<string>('teejet_xr_110_verde');
  const [compPressure, setCompPressure] = useState<number>(7.6);
  const nozzleA = useMemo(() => NOZZLES_BY_ID.get(nozzleIdA), [nozzleIdA]);
  const nozzleB = useMemo(() => NOZZLES_BY_ID.get(nozzleIdB), [nozzleIdB]);
  const flowA = useMemo(() => (nozzleA ? calculateNozzleFlow(nozzleA, compPressure) : undefined), [nozzleA, compPressure]);
  const flowB = useMemo(() => (nozzleB ? calculateNozzleFlow(nozzleB, compPressure) : undefined), [nozzleB, compPressure]);
  const comparison = useMemo(() => ((flowA && flowB) ? compareNozzles(flowA, flowB) : undefined), [flowA, flowB]);

  // Modo 3: Alternativas (Bico de Referência)
  const [refNozzleId, setRefNozzleId] = useState<string>('albuz_atr_80_amarelo');
  const [refPressure, setRefPressure] = useState<number>(8.0);
  const refNozzle = useMemo(() => NOZZLES_BY_ID.get(refNozzleId), [refNozzleId]);

  // Modais e Teclado
  const [drawerSide, setDrawerSide] = useState<'A' | 'B' | 'REF'>('A');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [keypadTarget, setKeypadTarget] = useState<'unitario_p' | 'comp_p' | 'ref_p' | 'target_q' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const historyRecords = useDebitoHistory();

  const handleReset = useCallback(() => {
    if (activeMode === 'unitario') { setSelectedCode('02'); setUnitarioPressure(3.0); }
    else if (activeMode === 'comparador') { setNozzleIdA('albuz_atr_80_amarelo'); setNozzleIdB('teejet_xr_110_verde'); setCompPressure(7.6); }
    else { setRefNozzleId('albuz_atr_80_amarelo'); setRefPressure(8.0); }
  }, [activeMode]);

  const handleSaveToHistory = async () => {
    try {
      await saveDebitoHistory({ activeMode, selectedIsoNozzle, unitarioPressure, unitarioFlow, nozzleA, nozzleB, compPressure });
      setToastMessage('Calibração de bicos gravada e sincronizada na Outbox!');
    } catch {
      setToastMessage('Erro ao gravar no histórico.');
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleConfirmKeypad = (val: number) => {
    if (keypadTarget === 'unitario_p') setUnitarioPressure(val);
    else if (keypadTarget === 'ref_p') setRefPressure(val);
    else setCompPressure(val);
    setKeypadTarget(null);
  };

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <DebitoHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      <DebitoModeSelector activeMode={activeMode} onSelectMode={setActiveMode} />

      {activeMode === 'unitario' && (
        <ModoUnitarioView
          flowResult={unitarioFlow}
          selectedNozzle={selectedIsoNozzle}
          pressureBar={unitarioPressure}
          selectedCode={selectedCode}
          onSelectCode={setSelectedCode}
          onOpenKeypad={() => setKeypadTarget('unitario_p')}
          onSelectPresetPressure={setUnitarioPressure}
        />
      )}

      {activeMode === 'comparador' && (
        <ModoComparadorView
          nozzleA={nozzleA}
          nozzleB={nozzleB}
          flowA={flowA}
          flowB={flowB}
          workingPressureBar={compPressure}
          onChangePressure={setCompPressure}
          onOpenKeypad={() => setKeypadTarget('comp_p')}
          onSwapNozzles={() => { const temp = nozzleIdA; setNozzleIdA(nozzleIdB); setNozzleIdB(temp); }}
          onEditNozzleA={() => { setDrawerSide('A'); setIsDrawerOpen(true); }}
          onEditNozzleB={() => { setDrawerSide('B'); setIsDrawerOpen(true); }}
          onOpenMatrixModal={() => setIsMatrixOpen(true)}
        />
      )}

      {activeMode === 'alternativas' && (
        <ModoAlternativasReferenciaView
          refNozzle={refNozzle}
          habitualPressureBar={refPressure}
          onChangeHabitualPressure={setRefPressure}
          onOpenKeypad={() => setKeypadTarget('ref_p')}
          onEditRefNozzle={() => { setDrawerSide('REF'); setIsDrawerOpen(true); }}
          onSelectForComparison={(nId, pBar) => {
            setNozzleIdA(refNozzleId);
            setNozzleIdB(nId);
            setCompPressure(pBar);
            setActiveMode('comparador');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <DebitoModalsContainer
        keypadTarget={keypadTarget}
        onCloseKeypad={() => setKeypadTarget(null)}
        onConfirmKeypad={handleConfirmKeypad}
        unitarioPressure={unitarioPressure}
        compPressure={compPressure}
        refPressure={refPressure}
        targetFlow={0.8}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={() => setIsDrawerOpen(false)}
        drawerSide={drawerSide}
        nozzleIdA={nozzleIdA}
        nozzleIdB={nozzleIdB}
        refNozzleId={refNozzleId}
        onSelectNozzle={(id) => {
          if (drawerSide === 'A') setNozzleIdA(id);
          else if (drawerSide === 'B') setNozzleIdB(id);
          else setRefNozzleId(id);
        }}
        isMatrixOpen={isMatrixOpen}
        onCloseMatrix={() => setIsMatrixOpen(false)}
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        comparison={comparison}
        isGuideOpen={isGuideOpen}
        onCloseGuide={() => setIsGuideOpen(false)}
        isHistoryOpen={isHistoryOpen}
        onCloseHistory={() => setIsHistoryOpen(false)}
        historyRecords={historyRecords}
      />

      <DebitoFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};
