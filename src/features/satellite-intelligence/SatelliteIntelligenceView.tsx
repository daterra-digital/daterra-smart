import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save, History, BookOpen, MapPin, PenTool } from 'lucide-react';

import type { SatelliteParcel, SatelliteMapLayer } from './types';
import { INITIAL_PARCELS } from './data/initialParcels';
import { calculateNdviModulation, getCopernicusMetadata } from './services/copernicusService';
import { SatelliteNdviTopCard } from './components/SatelliteNdviTopCard';
import { SatelliteInteractiveMap } from './components/SatelliteInteractiveMap';
import { NdviSprayModulator } from './components/NdviSprayModulator';
import { SatelliteGisActions } from './components/SatelliteGisActions';
import { SatelliteGuideModal } from './components/SatelliteGuideModal';
import { ParcelPolygonDrawer } from './components/ParcelPolygonDrawer';

export const SatelliteIntelligenceView: React.FC = () => {
  const [parcels, setParcels] = useState<SatelliteParcel[]>(INITIAL_PARCELS);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('vinha-1');
  const [activeLayer, setActiveLayer] = useState<SatelliteMapLayer>('ndvi');
  const [guideOpen, setGuideOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  const activeParcel = useMemo(
    () => parcels.find((p) => p.id === selectedParcelId) || parcels[0],
    [parcels, selectedParcelId]
  );

  const [simulatedNdvi, setSimulatedNdvi] = useState<number>(activeParcel.ndvi);

  const handleSelectParcel = (parcel: SatelliteParcel) => {
    setSelectedParcelId(parcel.id);
    setSimulatedNdvi(parcel.ndvi);
    setFeedback(`Parcela alterada para ${parcel.name}`);
  };

  const handleSaveDrawnParcel = (newParcel: SatelliteParcel) => {
    setParcels((prev) => [newParcel, ...prev]);
    setSelectedParcelId(newParcel.id);
    setSimulatedNdvi(newParcel.ndvi);
    setFeedback(`Novo talhão "${newParcel.name}" (${newParcel.areaHa} ha) adicionado com sucesso!`);
  };

  const modulation = useMemo(
    () => calculateNdviModulation(simulatedNdvi, activeParcel.baseVolumeLha),
    [simulatedNdvi, activeParcel.baseVolumeLha]
  );

  const metadata = useMemo(
    () => getCopernicusMetadata(activeParcel.center[0], activeParcel.center[1], simulatedNdvi),
    [activeParcel, simulatedNdvi]
  );

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] pb-28 text-slate-800">
      <header className="p-4 sm:p-5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <Link
          to="/ferramentas"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg bg-slate-100 border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar às Ferramentas
        </Link>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#114037] text-[#3CA64C]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3CA64C] animate-pulse" />
          Sentinel-2 Ativo
        </span>
      </header>

      <main className="max-w-2xl mx-auto pt-3">
        <div className="px-5 pt-2 pb-1">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#114037]">MONITORIZAÇÃO ESPACIAL</p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Inteligência de Satélite & NDVI</h1>
          <p className="text-xs text-slate-500">Copernicus Data Space (10m) • Modulação de Calda</p>
        </div>

        <SatelliteNdviTopCard modulation={modulation} metadata={metadata} />

        {/* Seletor de Parcela + Botão de Desenho */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#114037]" />
              Parcelas da Exploração
            </label>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="text-xs font-bold text-[#114037] hover:text-[#1D734B] flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
            >
              <PenTool className="w-3.5 h-3.5 text-[#3CA64C]" />
              Demarcar no Satélite
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {parcels.slice(0, 3).map((parcel) => {
              const isSelected = parcel.id === activeParcel.id;
              return (
                <button
                  key={parcel.id}
                  type="button"
                  onClick={() => handleSelectParcel(parcel)}
                  className={`p-2 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'border-[#3CA64C] bg-white shadow-md'
                      : 'border-slate-200 bg-slate-100 hover:bg-slate-200/70'
                  }`}
                >
                  <span className={`block text-xs font-bold truncate ${isSelected ? 'text-[#114037]' : 'text-slate-700'}`}>
                    {parcel.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono-numbers">
                    {parcel.areaHa} ha • NDVI {parcel.ndvi}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <SatelliteInteractiveMap
          parcel={activeParcel}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          displayNdvi={simulatedNdvi}
        />

        <NdviSprayModulator
          modulation={modulation}
          simulatedNdvi={simulatedNdvi}
          onSimulateNdviChange={setSimulatedNdvi}
        />

        <SatelliteGisActions
          parcel={activeParcel}
          modulatedVolumeLha={modulation.modulatedVolumeLha}
          onImportSuccess={showFeedback}
        />

        {feedback && (
          <div className="mx-4 my-2 p-3 bg-emerald-900 text-emerald-100 border border-emerald-700 rounded-xl text-xs font-semibold shadow-md">
            {feedback}
          </div>
        )}
      </main>

      <footer className="fixed bottom-3 w-[calc(100%-1.5rem)] max-w-2xl mx-auto left-0 right-0 px-4 z-40">
        <div className="bg-slate-900/95 border border-slate-800 backdrop-blur-lg p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => showFeedback(`Dados de satélite de ${activeParcel.name} arquivados no histórico`)}
            className="flex-1 bg-[#114037] hover:bg-[#1D734B] text-white font-bold text-xs py-3 px-3 rounded-xl border border-[#3CA64C]/50 flex items-center justify-center gap-1.5 transition-all touch-target"
          >
            <Save className="w-4 h-4 text-[#3CA64C]" />
            Guardar no Histórico
          </button>
          <button
            type="button"
            onClick={() => showFeedback(`Histórico de passagens: ${parcels.length} parcelas monitorizadas`)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-3.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition-all touch-target"
          >
            <History className="w-4 h-4 text-slate-400" />
            Histórico ({parcels.length})
          </button>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-[#3CA64C] font-bold text-xs py-3 px-3.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition-all touch-target"
          >
            <BookOpen className="w-4 h-4" />
            Guia
          </button>
        </div>
      </footer>

      <SatelliteGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <ParcelPolygonDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaveDrawnParcel={handleSaveDrawnParcel}
      />
    </div>
  );
};
