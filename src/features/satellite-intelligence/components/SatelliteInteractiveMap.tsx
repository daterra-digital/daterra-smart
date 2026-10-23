import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Locate } from 'lucide-react';
import type { SatelliteParcel, SatelliteMapLayer } from '../types';

interface Props {
  parcel: SatelliteParcel;
  activeLayer: SatelliteMapLayer;
  onLayerChange: (layer: SatelliteMapLayer) => void;
  displayNdvi: number;
}

export const SatelliteInteractiveMap: React.FC<Props> = ({
  parcel,
  activeLayer,
  onLayerChange,
  displayNdvi
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);

  // Inicializar o Mapa Leaflet com Camada Satélite Esri World Imagery
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: parcel.center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Azulejos de Satélite de Alta Resolução Gratuitos (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [parcel.center]);

  // Atualizar centro e polígono quando a parcela ou camada mudar
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Reposiciona o mapa na parcela ativa
    map.setView(parcel.center, 16, { animate: true });

    // Remove polígono anterior se existir
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    // Configuração de estilo de acordo com a camada ativa
    const fillColor =
      activeLayer === 'ndvi'
        ? displayNdvi >= 0.70
          ? '#15803D'
          : displayNdvi >= 0.45
          ? '#84CC16'
          : '#EAB308'
        : activeLayer === 'zones'
        ? '#10B981'
        : 'transparent';

    const fillOpacity = activeLayer === 'rgb' ? 0.05 : 0.45;

    const polygon = L.polygon(parcel.coordinates, {
      color: '#3CA64C',
      weight: 3,
      fillColor,
      fillOpacity
    }).addTo(map);

    polygon.bindPopup(
      `<div style="font-family: sans-serif; font-size: 12px; color: #0F172A;">
        <strong>${parcel.name}</strong><br/>
        Área: ${parcel.areaHa} ha<br/>
        NDVI: <b>${displayNdvi.toFixed(2)}</b>
      </div>`
    );

    polygonLayerRef.current = polygon;
  }, [parcel, activeLayer, displayNdvi]);

  // Função para centrar nas coordenadas GPS do agricultor
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no seu navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const userLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.setView(userLoc, 17, { animate: true });
        L.circleMarker(userLoc, {
          radius: 8,
          color: '#FFFFFF',
          weight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 1
        })
          .addTo(map)
          .bindPopup('A sua localização atual')
          .openPopup();
      },
      () => alert('Não foi possível obter a sua localização GPS.')
    );
  };

  return (
    <div className="px-4 py-2">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
        {/* Barra Superior do Mapa */}
        <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3CA64C] animate-pulse" />
            <span className="font-bold text-slate-200">
              {parcel.name} • {parcel.areaHa} ha
            </span>
          </div>

          {/* Seletor de Camadas */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => onLayerChange('ndvi')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                activeLayer === 'ndvi'
                  ? 'bg-[#3CA64C] text-[#0A2620]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NDVI
            </button>
            <button
              type="button"
              onClick={() => onLayerChange('rgb')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                activeLayer === 'rgb'
                  ? 'bg-[#3CA64C] text-[#0A2620]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cor Real
            </button>
            <button
              type="button"
              onClick={() => onLayerChange('zones')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                activeLayer === 'zones'
                  ? 'bg-[#3CA64C] text-[#0A2620]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Zonas
            </button>
          </div>
        </div>

        {/* Recipiente do Mapa Leaflet Real de Satélite */}
        <div className="relative aspect-[16/10] w-full bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Botão Flutuante de Localização GPS */}
          <button
            type="button"
            onClick={handleLocateMe}
            title="Localizar a minha exploração"
            className="absolute top-3 right-3 z-10 bg-slate-900/90 hover:bg-slate-800 text-white p-2 rounded-xl border border-slate-700 shadow-md flex items-center gap-1 text-xs font-semibold"
          >
            <Locate className="w-4 h-4 text-[#3CA64C]" />
            <span className="hidden sm:inline">GPS</span>
          </button>

          {/* Legenda Espectral Flutuante */}
          <div className="absolute bottom-2 left-2 z-10 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded-lg text-[9px] font-mono-numbers flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 0.3
            <span className="w-2 h-2 rounded-full bg-lime-400" /> 0.5
            <span className="w-2 h-2 rounded-full bg-[#3CA64C]" /> 0.8
          </div>
        </div>
      </div>
    </div>
  );
};
