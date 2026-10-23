import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { PenTool, RotateCcw, Trash2, Check, X, Locate } from 'lucide-react';
import type { SatelliteParcel } from '../types';
import { calculateGeoPolygonAreaHa, calculateCoordsCenter } from '../services/polygonMath';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawnParcel: (parcel: SatelliteParcel) => void;
}

export const ParcelPolygonDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveDrawnParcel
}) => {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [parcelName, setParcelName] = useState('Novo Talhão Demarcado');
  const [cropType, setCropType] = useState('Vinha');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Inicializar o Mapa Leaflet com Camada Real de Satélite
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [39.545, -8.605],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Esri, Maxar' }
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      map.on('click', (e: L.LeafletMouseEvent) => {
        setCoords((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      });

      mapInstanceRef.current = map;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Atualizar marcadores e polígono sobre a imagem de satélite
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersGroupRef.current;
    if (!map || !markers) return;

    markers.clearLayers();
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    coords.forEach((coord, idx) => {
      L.circleMarker(coord, {
        radius: 5,
        color: '#114037',
        fillColor: '#FFFFFF',
        fillOpacity: 1,
        weight: 2
      })
        .bindTooltip(`P${idx + 1}`, { permanent: true, direction: 'top', className: 'text-[9px] font-mono' })
        .addTo(markers);
    });

    if (coords.length >= 2) {
      const poly = L.polygon(coords, {
        color: '#3CA64C',
        weight: 3,
        fillColor: '#3CA64C',
        fillOpacity: coords.length >= 3 ? 0.35 : 0
      }).addTo(map);
      polygonLayerRef.current = poly;
    }
  }, [coords]);

  if (!isOpen) return null;

  const areaHa = calculateGeoPolygonAreaHa(coords);
  const simulatedNdvi = coords.length >= 3 ? 0.72 : 0;

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 17, { animate: true });
      },
      () => alert('Não foi possível obter a sua localização GPS.')
    );
  };

  const handleSave = () => {
    if (coords.length < 3) return;
    const center = calculateCoordsCenter(coords);

    onSaveDrawnParcel({
      id: `custom-${Date.now()}`,
      name: parcelName,
      areaHa: Math.max(0.1, areaHa),
      cropType,
      coordinates: coords,
      center,
      ndvi: simulatedNdvi,
      lastPassDate: new Date().toISOString().split('T')[0],
      cloudCoveragePct: 0.0,
      baseVolumeLha: 350
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5 shadow-2xl text-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#3CA64C]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Demarcar sobre Satélite Real</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 my-2">
          Navegue no satélite até à sua exploração e clique para marcar os vértices do talhão.
        </p>

        {/* Mapa Leaflet Real de Satélite para Demarcação */}
        <div className="relative aspect-[16/11] w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full cursor-crosshair z-0" />

          <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center pointer-events-none">
            <span className="bg-slate-950/90 px-2.5 py-1 rounded-xl text-[11px] font-mono-numbers text-slate-200 pointer-events-auto border border-slate-700">
              <strong className="text-[#3CA64C]">{coords.length}</strong> pontos
            </span>
            <div className="flex gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={handleLocateMe}
                className="bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-xl border border-slate-700 font-semibold"
              >
                <Locate className="w-3.5 h-3.5 inline mr-1 text-[#3CA64C]" /> GPS
              </button>
              <button
                type="button"
                onClick={() => setCoords((p) => p.slice(0, -1))}
                className="bg-slate-900/90 text-slate-300 text-xs px-2.5 py-1 rounded-xl border border-slate-700 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Desfazer
              </button>
              <button
                type="button"
                onClick={() => setCoords([])}
                className="bg-rose-950/90 text-rose-300 text-xs px-2.5 py-1 rounded-xl border border-rose-800 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="my-3 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-black/30 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Área Geodésica</span>
            <span className="text-base font-bold font-mono-numbers text-white">{areaHa} ha</span>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">NDVI Sentinel-2</span>
            <span className="text-base font-bold font-mono-numbers text-[#3CA64C]">
              {coords.length >= 3 ? simulatedNdvi.toFixed(2) : '--'}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-3 text-xs">
          <input
            type="text"
            value={parcelName}
            onChange={(e) => setParcelName(e.target.value)}
            placeholder="Nome da Parcela / Talhão"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
          />
          <div className="flex gap-2">
            {['Vinha', 'Olival', 'Pomar', 'Cereais'].map((crop) => (
              <button
                key={crop}
                type="button"
                onClick={() => setCropType(crop)}
                className={`flex-1 py-1.5 rounded-xl font-bold border transition-all ${
                  cropType === crop
                    ? 'border-[#3CA64C] bg-[#114037] text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={coords.length < 3}
          className="w-full bg-[#114037] hover:bg-[#1D734B] disabled:opacity-50 text-white font-bold py-3 rounded-xl border border-[#3CA64C]/50 text-xs flex items-center justify-center gap-1.5 touch-target shadow-lg"
        >
          <Check className="w-4 h-4 text-[#3CA64C]" />
          Guardar Talhão na Exploração
        </button>
      </div>
    </div>
  );
};
